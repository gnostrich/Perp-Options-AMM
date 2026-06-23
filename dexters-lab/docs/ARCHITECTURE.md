# Architecture

Two pipelines share one config and one `lab_home`. The research loop produces verdicts about your own hypotheses. The review loop produces adversarial reviews of other people's papers. Everything is plain files: JSON state, markdown ledgers, JSONL logs.

## Flow 1: the research loop

```
 (human)                         (machine)

 RQ idea
    |
    v
 RQ_PLAN.md  ..................  H1: human approves the plan
    |  contains one ```prereg fence
    v
 bin/rq_compile.py
    |  sha-256 of the prereg text
    |
    +--> rq_registry.json        (RQ id + prereg sha + status)
    |
    +--> TASK_LEDGER.md          (R.* task chain; human gates land
    |                             as PENDING_HUMAN rows)
    v
 bin/lab_executor.sh             (nightly: pick ONE runnable task,
    |                             run it, verify cmd must exit 0,
    |                             only then mark DONE; PENDING_HUMAN
    |                             rows are never touched)
    v
 verdict_input.json              (the numbers, with sources)
    |
    v
 bin/stopping_gate.py            (prereg sha must match registry,
    |                             else REFUSE with no scorecard)
    |  scores rules 1-5
    v
 *.scorecard.json                VALIDATED | PARTIAL | FALSIFIED
    |
    +--> VERDICT_LOG.md          (append-only, one row per verdict)
    |
    +--> milestone_hook          (optional command from config;
                                  milestone event JSON on stdin)
    |
    v
 H2: human accepts the verdict, files errata, or registers RQ n+1
```

Supporting gates that run beside the loop:

```
 bin/doc_truth_gate.sh    results outran the docs?        -> fail closed
 bin/claim_lint.py        numbers without evidence?       -> fail closed
 bin/paper_sync_check.py  tex vs PDF vs published drift?  -> fail closed
 (all three gate H3: nothing leaves the lab unless they are green)
```

## Flow 2: the review loop

```
 paper.pdf | paper.tex | paper.md
    |
    |  pdftotext (optional, PDF input only)
    v
 bin/lab_review.sh
    |  attack angles: claims vs evidence, statistics, methods,
    |  novelty vs prior art, reproducibility
    |
    +--> bin/lab_openrouter.py --> heavy open-model panel
    |        |                     (config: openrouter.panel_models_preference,
    |        |                      tried in order)
    |        v
    |    bin/lab_budget.py         every call recorded in spend.jsonl;
    |                              at the monthly cap the panel halts
    v
 reviews_dir/<paper>/REFEREE_REPORT.md + VERDICT_SUMMARY.json ... H3: human signs before anything
                                   is sent to authors or published
```

## Flow 3: the literature lane

```
 lit_queue.json --> bin/lit_queue.py next      (least-recently-scanned wins)
                         |
                         v
                    bin/lab_lit.sh             (one target per run, headless
                         |                      Claude Code session, drafts
                         |                      only, every claim cites a URL)
                         v
                    drafts_dir/<date>-<slug>.md
                         |
                         v
                    bin/lit_queue.py rotate    (push target to the back)
```

## Flow 4: the intake lane

This is the front of the funnel. It turns the lab's own state into grounded candidate questions, so the human RQ plan no longer starts from a blank page.

```
 lab state                          bin/lab_autosearch.py
 (rq_registry.json,         ......  (pure python, NO spend:
  TASK_LEDGER.md,                    reads state, writes queries)
  recent verdicts)                       |
    |                                     v
    +-----------------------------> intention queries
                                          |
                                          v
                                  bin/lab_autosearch.sh
                                          |  (headless claude -p:
                                          |   grounded discovery,
                                          |   every hit cites a URL,
                                          |   drafts only, no DB writes)
                                          |
              +---------------------------+---------------------------+
              v                           v                           v
     lit_queue.json              discoveries log
     (new targets for            (append-only intake
      the literature lane)        record, what was found)
              |                           |
              v                           v
     the literature lane         a human reviews discoveries,
     deep-reads each target      promotes the worthwhile ones
              |                   to CANDIDATE rq_registry rows (H1)
              +-------------+-------------+
                            v
                  rq_registry.json CANDIDATE rows
                  (proposed RQs, NOT pre-registered).
                  Autosearch never writes the registry
                  itself; it only fills the funnel.
```

`bin/lab_deep_research.sh` is the grounded-knowledge engine that both intake and review draw on. Same headless, drafts-only, cited-or-it-did-not-happen contract as the other lanes: fan-out web search, fetch, adversarially verify, then write a cited report. Intake calls it so a CANDIDATE arrives with evidence; the review loop (Flow 2) calls it so an adversarial review has grounded prior art to argue against. It writes drafts and a report; it never writes the registry or the verdict log.

## Flow 5: the post-publication loop

The lab is not done when a claim is published. This loop re-attacks published claims and routes real problems back to the human errata gate. The verdict log stays append-only the whole way.

```
 published claim
 (a paper, a review, a public number)
    |
    v
 bin/lab_monitor.sh             (headless claude -p: adversarial
    |                            re-attack against fresh sources,
    |                            drafts a challenge with citations,
    |                            NEVER edits the original row)
    v
 challenge draft(s)
    |
    v
 bin/lab_triage.py              (pure python, NO spend: dedupe
    |                            challenges, merge against the
    |                            existing errata queue, drop
    |                            duplicates and weak attacks)
    v
 ERRATA_QUEUE                   (survivors only; one queued erratum
    |                            per real, novel challenge)
    v
 H2/errata gate                 a human accepts the erratum, appends
                                an erratum row (GOVERNANCE.md section 5),
                                and registers a corrective RQ that
                                re-enters Flow 4. The machine never
                                files the erratum for you.
```

The two loops close on each other. Flow 4 fills the funnel with grounded candidates; Flow 5 catches the claims that should never have left. Both hand the final call to a human gate, and the grounded-knowledge engine (deep research) sits between them as the shared evidence source.

## File map

Repo (code, committed):

```
dexters-lab/
  README.md
  LICENSE
  setup.sh                   dependency check + self-test
  lab.config.example.json    shipped defaults; copy to lab.config.json
  lib/labconfig.py           the one shared config loader (fixed contract)
  bin/                       all tools; each resolves paths via labconfig
  templates/                 plan, registry, ledger, and workflow templates
  examples/                  worked examples
  tests/                     pytest suite, hermetic via DEXTERS_LAB_CONFIG
  docs/                      GOVERNANCE.md, ARCHITECTURE.md, CONFIG.md
```

Lab home (state, yours, never committed here):

```
<lab_home>/
  rq_registry.json           hypothesis registry: id, prereg sha, status
  TASK_LEDGER.md             task chains: | id | task | status | deps | verify |
  VERDICT_LOG.md             append-only verdict rows
  reviews/                   one folder per reviewed paper
  drafts/                    literature-lane and intake output
  spend.jsonl                append-only spend records
  lit_queue.json             round-robin literature and intake targets
  discoveries.jsonl          append-only intake record (Flow 4)
  ERRATA_QUEUE.md            triaged challenges awaiting the errata gate (Flow 5)
```

Exact file names for the intake and post-publication state come from the tools that own them; the names above are the intended layout. As with the rest of the lab, every path resolves through `lab.config.json`, not a hardcoded location.

## Extension points

**`milestone_hook`** (config key, `null` by default). Set it to any command string. After each scored verdict the gate runs the command and pipes a milestone event envelope (event_type, actor, subject, payload) to its stdin. Use it to post to Slack, write to a database, or feed your own event bus. Contract: a failing hook degrades to a warning on stderr; it never changes the verdict or the exit code.

**Custom gates.** `stopping_gate.py` exposes its rule functions; thresholds come from `stopping_rules` in the config. To add a rule 6, add a function that returns the standard rule dict (`name`, `value`, `threshold`, `status`, optional `note`) and include it in the scorecard. Keep changes additive and treat any threshold edit as an H4 governance change (see GOVERNANCE.md).

**New attack angles.** `lab_review.sh` (and the review workflow template) runs a list of named angles. Add an angle by adding its prompt and its evidence requirements; the panel and budget plumbing are shared, so a new angle costs one prompt, not new infrastructure.

**New literature targets.** Append entries to `lit_queue.json` (`id`, `slug`, `topic`, `feeds`). The round-robin picks them up on the next run; never-scanned targets are most due.

**Scheduling.** Both autonomous lanes are plain scripts with no daemon. Point cron, launchd, or systemd timers at them. One task per night per lane is the intended cadence; it keeps the morning review small.

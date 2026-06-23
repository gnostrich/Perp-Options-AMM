# Dexter's Lab

A plug-and-play autonomous research lab. Clone it, point it at a folder, and you get the discipline stack of a small empirical research group:

- A hypothesis registry with pre-registration. Plans are hashed before any data is touched.
- Five statistical stopping rules enforced as machine gates, not vibes.
- A plan-to-ledger compiler that turns a research plan into an executable task chain.
- A nightly executor that runs exactly one task per night and refuses anything unverified.
- A scheduled literature lane that scans one target per night, round-robin.
- Deep adversarial paper review backed by a heavy open-model panel.
- Paper integrity linting: every quantitative claim needs an evidence pointer.
- Budget governance with a hard monthly cap and an append-only spend ledger.
- Human gates as explicit `PENDING_HUMAN` ledger rows. The machine never signs off for you.

The lab state (registry, ledger, verdict log, reviews, drafts, spend) lives in one directory you choose, called `lab_home`. The code never hardcodes paths. Everything resolves through `lab.config.json`.

## Quickstart

```bash
git clone <your-fork-url> dexters-lab
cd dexters-lab
cp lab.config.example.json lab.config.json
# edit lab.config.json: set lab_home to where the lab should keep its state
./setup.sh                  # dependency check + self-test
python3 bin/lab_init.py     # creates the lab_home tree and empty state files
```

First commands:

```bash
# Compile a plan (with a ```prereg fence) into the registry and the ledger
python3 bin/rq_compile.py --plan MY_RQ_PLAN.md --rq RQ1

# Score a result file against the 5 stopping rules
python3 bin/stopping_gate.py score my_verdict_input.json

# Lint a draft for quantitative claims with no evidence pointer
python3 bin/claim_lint.py paper/sections/   # a file or a directory to recurse

# Check month-to-date spend against the cap
python3 bin/lab_budget.py status
```

Every tool prints usage with `--help`. Start there for the exact flags.

## Components

| Tool | What it does | Runs on |
|---|---|---|
| `bin/lab_init.py` | Bootstraps `lab_home`: registry, ledger, verdict log, reviews and drafts dirs | pure python |
| `bin/rq_compile.py` | Plan-to-ledger compiler. Parses the prereg fence, hashes it (sha-256), registers the RQ, appends an `R.*` task chain to the ledger | pure python |
| `bin/stopping_gate.py` | Scores a verdict input against the 5 stopping rules. Writes a scorecard, appends to the verdict log, fires the optional milestone hook. Refuses to score on a prereg hash mismatch | pure python |
| `bin/claim_lint.py` | Flags number-bearing claims with no citation, footnote, or results-file pointer. Also lints writing rules in markdown | pure python |
| `bin/paper_sync_check.py` | Detects drift between tex sources, the compiled PDF, and the published checkout | pure python + git |
| `bin/doc_truth_gate.sh` | Fails when result files outrun the documentation that should describe them | bash + git |
| `bin/lab_review.sh` | Deep adversarial review of an external paper across multiple attack angles, with a heavy open-model panel as second opinion | Claude Code CLI + OpenRouter key; `pdftotext` for PDF input |
| `bin/lab_openrouter.py` | Minimal OpenRouter client used by the review panel. Records every call in the spend ledger | python + OpenRouter key |
| `bin/lab_lit.sh` | Scheduled literature lane. One target per run, drafts only, sources cited | Claude Code CLI |
| `bin/lab_executor.sh` | Nightly executor. Picks one runnable ledger task, runs it, requires the verify command to exit 0 before marking DONE | Claude Code CLI |
| `bin/lab_budget.py` | Spend ledger and monthly cap governor. Spending tools halt politely at the cap | pure python |
| `bin/lit_queue.py` | Round-robin queue behind the literature lane: `next` and `rotate` | pure python |
| `bin/lab_autosearch.py` | Intake planner. Reads lab state (registry, ledger, open questions) and turns it into grounded discovery queries. Pure planning: no spend | pure python |
| `bin/lab_autosearch.sh` | Runs one intake pass: the planner's queries feed a grounded discovery agent that drops new targets onto the lit queue and writes a discoveries log | Claude Code CLI |
| `bin/lab_deep_research.sh` | Grounded knowledge engine. Fan-out web search, fetch, adversarial verify, then a cited report. Feeds both intake and review | Claude Code CLI |
| `bin/lab_monitor.sh` | Post-publication adversarial re-attack on a published claim. Drafts a challenge with sources; never edits the original | Claude Code CLI |
| `bin/lab_triage.py` | Dedupes monitor challenges, merges them against the errata queue, and routes survivors to the human errata gate. Pure planning: no spend | pure python |

## The intake layer: a closed research lifecycle

The original lab starts with a human RQ plan. The intake layer feeds that plan with grounded candidates and keeps the loop closed after a claim is published. Four tools turn the lab from a thing you must hand-feed into a thing that proposes its own next questions and re-attacks its own published claims.

The lifecycle runs in one direction and comes back to a human at every gate:

1. **Discover.** `lab_autosearch.py` reads lab state (the registry, the open ledger questions, recent verdicts) and writes grounded discovery queries. `lab_autosearch.sh` runs those queries through a discovery agent. Survivors land on the lit queue and in a discoveries log. They become CANDIDATE rows in the registry only downstream, after the literature lane deep-reads them and a human approves (step 3); autosearch itself never writes the registry.
2. **Ground.** `lab_deep_research.sh` is the grounded-knowledge engine. It fans out web searches, fetches sources, adversarially verifies claims, and writes a cited report. It feeds two places: intake (so a CANDIDATE arrives with evidence, not a hunch) and review (so an adversarial review has grounded prior art to argue against). The scheduled literature lane (`lab_lit`) covers the same intake role on a nightly round-robin.
3. **Pre-register and decide.** A human promotes a CANDIDATE to an H1 plan, the existing loop compiles it, the executor runs it, and the stopping gate scores it. Nothing here changed; intake just fills the funnel.
4. **Re-attack after publication.** Once a claim leaves the lab, `lab_monitor.sh` re-attacks it adversarially against fresh sources and drafts a challenge. It never edits the original; the verdict log stays append-only.
5. **Triage and route.** `lab_triage.py` dedupes monitor challenges, merges them against the errata queue, and routes real survivors to the human errata gate. A surviving challenge becomes a queued erratum a human must accept (see GOVERNANCE.md section 5).

The shape: `lab_autosearch` -> `lab_deep_research`/`lab_lit` -> registry CANDIDATE rows -> H1 review -> verdict -> publication -> `lab_monitor` -> `lab_triage` -> errata gate -> a corrective RQ that re-enters the funnel. Deep research sits in the middle as the grounded-knowledge engine both intake and review draw on. Every arrow that crosses a human boundary lands on an explicit gate, never an auto-decision.

## What needs what

- **Pure python, stdlib only:** the registry, compiler, gate, linters, queue, budget tools, and the two intake/post-pub planners (`lab_autosearch.py`, `lab_triage.py`). No pip installs required to run them. The planners read state and emit queries or routing decisions; they never spend.
- **Claude Code CLI:** the autonomous lanes shell out to `claude -p` for headless runs: `lab_executor`, `lab_lit`, plus the three new runners `lab_autosearch.sh` (grounded discovery), `lab_deep_research.sh` (grounded knowledge engine), and `lab_monitor.sh` (post-publication re-attack). Without the CLI, everything else still works: the python planners run, and you run agent tasks by hand.
- **OpenRouter API key:** only the review panel (`lab_review`, `lab_openrouter`). The key is read from the environment variable named in the config (`openrouter.api_key_env`, default `OPENROUTER_API_KEY`).
- **Optional extras:** `pytest` to run the test suite, `jsonschema` for strict schema validation (tools warn and skip validation without it), `pdftotext` to review PDF papers, `node` only if your own verify commands need it.

## Configuration

One file: `lab.config.json` (copied from `lab.config.example.json`). Every path supports `~` and the `{lab_home}` placeholder. Tools find the config in this order: `$DEXTERS_LAB_CONFIG`, `./lab.config.json`, the repo's `lab.config.json`, then the shipped example as a last-resort default. Full key reference: [docs/CONFIG.md](docs/CONFIG.md).

## Doctrine and design

- [docs/GOVERNANCE.md](docs/GOVERNANCE.md): the research doctrine. Stopping rules, pre-registration, fail-closed gates, honest negatives, errata, evidence admissibility, human sign-off classes.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): data flow, file map, extension points.
- [docs/AUTOSEARCH.md](docs/AUTOSEARCH.md): the intake lane. How lab state becomes discovery queries, lit-queue targets, and a discoveries log.
- [docs/DEEP_RESEARCH.md](docs/DEEP_RESEARCH.md): the grounded-knowledge engine that feeds intake and review.
- [docs/MONITOR.md](docs/MONITOR.md): post-publication re-attack and triage into the errata queue.

## Honest limitations

- The gates check the numbers you feed them. They cannot detect a wrong observable, a leaky dataset, or fabricated inputs. Pre-registration narrows the room to fool yourself; it does not remove it.
- Single machine, single user. State files are plain JSON and markdown with no locking. Two concurrent writers can clobber each other.
- Scheduling is yours. The executor and the literature lane are scripts; wire them to cron or launchd yourself.
- `claim_lint` favors precision over recall. It catches most unsupported claims and misses some. A clean lint is necessary, not sufficient.
- The review panel costs real money. The budget cap is enforced only for calls that go through the lab's own tools.
- The autonomous lanes depend on a Claude Code seat. Cost and rate limits of that seat are outside this repo's control.
- `jsonschema` validation is optional by design. Without it you get a warning, not protection.

## License

MIT. See [LICENSE](LICENSE).

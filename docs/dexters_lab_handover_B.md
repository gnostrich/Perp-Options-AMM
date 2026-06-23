# Dexter's Lab handover — Option B (Hybrid), operator-chosen 2026-06-23 (entry 269)

**Status:** DRAFT for skeptic gate (governance change = halt-class, Universal Skeptic Gate
`notes/skeptic/POLICY_universal_skeptic_gate_2026-06-12.md`). NOT enacted until skeptic-cleared and
the safe pieces are wired. Source decision: operator entry 269 ("B"), against the manager's B/C/A
brainstorm; original request entry 268 (verbatim in `history/operator/`).

## 0. What B means in one line
Adopt Dexter's Lab as the **research + paper + honesty-gate layer we don't currently have**; **keep**
our engine/Lean/test/git agents because Dexter's Lab structurally cannot do that work; route the lab's
adversarial-review / claim-lint / stopping gates **through the skeptic**. The lab is **tooling our
agents invoke**, NOT an autonomous replacement team.

## 1. Why not a wholesale handover (the capability gap, verified)
Dexter's Lab is a research/paper-governance pipeline (headless `claude -p` lanes + slash-commands +
OpenRouter calls on a cron). Its own test suite passes here (219 passed, 5 skipped). It **cannot**:
edit the single-file HTML engine (blob-safe), run Lean/Aristotle, run Playwright browser tests, or do
git/PR/merge — it parks sends/deploys/git as `PENDING_HUMAN`. Those four are the bulk of the current
project. So B keeps every engine-side agent and adds the lab as a layer on top.

## 2. Division of labor (the actual handover)

| Function | Owner under B | Notes |
|---|---|---|
| Adversarial paper review / referee pipeline (`lab_review`) | **skeptic** drives it; **paper** consumes | for AfT/WINE/FMBC; supercharges the skeptic on submissions |
| Claim-lint, doc-truth gate, paper-sync drift | **skeptic** owns as honesty gates; **manager** enforces at merge | pure-Python, no keys/cron — runnable now |
| Deep-research, literature autosearch (positioning/related-work) | **paper** + **research-lead** consume; lane deferred (needs cron/CLI) | drafts only, never auto-sent |
| Stopping-gates, pre-registration, budget governance | **manager** + **skeptic** for empirical/solvency claims | maps onto our solvency ship-gate discipline |
| Post-publication monitor + errata | deferred (needs cron/CLI); **skeptic** owns when on | re-attacks published claims |
| **HTML engine (blob-safe edits)** | **intern** (UNCHANGED) | lab cannot do this |
| **Lean / Aristotle proofs** | **research-lead** (UNCHANGED) | lab cannot do this |
| **Playwright + Node oracle tests** | **tester** (UNCHANGED) | lab cannot do this |
| **git / PR / merge / file-safety gate** | **manager** (UNCHANGED, sole git actor) | lab parks PENDING_HUMAN → manager performs |
| **Hub-and-spoke, operator transcription, skeptic-rank** | our CLAUDE.md governance (UNCHANGED) | lab has no such structure |

## 3. Honesty-model mapping (lab → us)
- Lab human gates **H1 plan / H2 verdict / H3 release / H4 governance** → the **operator** (via the
  manager). The lab emits `PENDING_HUMAN` rows; the manager surfaces them, the operator signs.
- Lab "**no auto-sends / no auto-deploys / no auto-cron**, append-only logs, kill-switch
  (`touch <lab_home>/pause`)" → aligns with our **file-safety gate / STOP-ON-RED / no force-push**.
- Lab **claim-lint / paper-sync** → become **pre-submission gates** the paper must pass (manager-enforced).
- Lab **FALSIFIED-is-success / pre-reg-hash / no-rerun-until-green** → reinforces our honest-label rule.

## 4. What gets wired NOW (safe, no side effects, no keys)
1. `lab.config.json` at repo root with `lab_home` inside the repo (e.g. `dexters-lab/lab_home/`),
   pointing the pure-Python tools at our paper/registry paths. (No secrets; OpenRouter key absent → the
   heavy review panel auto-skips.)
2. The **pure-Python honesty gates** (`claim_lint.py`, `paper_sync_check.py`, `doc_truth_gate.sh`) as
   on-demand checks the skeptic/manager can run on `paper/temporal_paper_american_2026.tex`.
3. This division-of-labor note folded into shared truth (after skeptic clearance), with a pointer from
   `docs/COMPONENT_REGISTER.md`.

## 5. What is DEFERRED (needs an explicit operator go + infra)
- The **autonomous nightly cron lanes** (`lab_executor`, `lab_lit`, `lab_autosearch`, `lab_monitor`)
  and any **headless `claude -p`** execution — side-effectful, spend budget, need the `claude` CLI wired
  into cron.
- **`OPENROUTER_API_KEY`** for the heavy review panel — not set; review pipeline runs key-less (panel
  skipped) until provided.
- Nothing about the lab is given **git authority** — manager stays sole git actor.

## 6. Open questions for the operator (post-skeptic, if any)
- Do we want the nightly cron lanes on at all, or use the lab purely as on-demand tooling (the C-caution
  the manager recommended folding into B)?
- Budget cap: lab default is $40/mo; only relevant once paid lanes/keys are on.

## 7. Skeptic verdict
_(appended unedited below after the gate runs)_

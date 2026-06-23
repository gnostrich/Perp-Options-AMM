# Dexter's Lab handover — Option B (Hybrid), operator-chosen 2026-06-23 (entry 269)

**Status: ✅ FULLY ENACTED 2026-06-23 — confirming skeptic re-pass CLEAR-TO-ENACT (run a9ec00fe, §8 verbatim);
the one standing condition (§6 Q4, the two `claude -p` lanes) RESOLVED by operator entry 271 ("b" = allow
as-is). The division-of-labor + the pure-Python honesty gates + the two on-demand paper/research lanes
(`lab_review.sh`, `lab_deep_research.sh`) are all enacted.**

**Q4 resolution (operator entry 271, verbatim source `history/operator/`):** operator chose B —
`lab_review.sh`/`lab_deep_research.sh` may run **as-is, on-demand, under manager supervision**, with
`GH_TOKEN` visible to the spawned `claude -p` child (no env-scrub, no allowlist). This is the operator
**overruling the skeptic's standing condition with full information** — accepted, bounded residual risk,
same basis as the keys-in-env ruling (entry 270). Constraints that REMAIN: (a) **non-cron only** — these
lanes run only when a manager/operator invokes them, never unattended/scheduled (cron still needs explicit
per-entry-270 permission, default no); (b) **manager-supervised** — not fire-and-forget; (c) lab has **NO
git authority** — manager stays sole git actor, lab output is drafts the manager reviews. Manager's own
recommendation had been A (scrub the token); operator chose B; recorded without further pushback.
Governance change = halt-class (Universal Skeptic Gate `notes/skeptic/POLICY_universal_skeptic_gate_2026-06-12.md`).
Source: operator entry 269 ("B") + entry 270 (Q1/Q2 answers), against the manager's B/C/A brainstorm;
original request entry 268 (verbatim in `history/operator/`).

**Operator entry 270 resolution (verbatim source `history/operator/`):**
- **Q1 (autonomy):** "dont need crons, but let it do paper / research side" → the lab DOES the paper/research
  side **on-demand, manager/skeptic/paper-driven; NO cron scheduling.** Tooling-on-top reading
  CONFIRMED by the operator (clears FLAG-SCOPE).
- **Q2 (token/secret):** "crons only with my permission and generally no, but keys remain in the
  enviroment" → **NO autonomous cron `claude -p` lane runs without explicit operator permission (default
  no)**; `GH_TOKEN`/keys stay in-environment as **operator-accepted residual risk** (clears the decision
  FLAG-PROCESS demanded — operator was shown and ruled).
- **FLAG-OVERSELL:** capability language corrected in §1/§5 (prompt-contract, not capability wall).

**Wired NOW (skeptic pre-cleared as side-effect-free; contained):** `dexters-lab/lab.config.json`
placed INSIDE `dexters-lab/` (NOT repo root) so it is NOT auto-resolved by default precedence — tools run
only with explicit `DEXTERS_LAB_CONFIG`. Demonstrated: `claim_lint.py` on
`paper/temporal_paper_american_2026.tex` (pure-Python, read-only) → 1 evidence-pointer finding (seam
percentages). NOT wired: any `claude -p` lane, any cron, any key.

## 0. What B means in one line
Adopt Dexter's Lab as the **research + paper + honesty-gate layer we don't currently have**; **keep**
our engine/Lean/test/git agents because Dexter's Lab structurally cannot do that work; route the lab's
adversarial-review / claim-lint / stopping gates **through the skeptic**. The lab is **tooling our
agents invoke**, NOT an autonomous replacement team.

## 1. Why not a wholesale handover (the capability gap — CORRECTED per FLAG-OVERSELL)
Dexter's Lab is a research/paper-governance pipeline (headless `claude -p` lanes + slash-commands +
OpenRouter calls on a cron). Its own test suite passes here (219 passed, 5 skipped).
- Its **pure-Python tools** (`claim_lint`, `paper_sync_check`, `rq_compile`, `stopping_gate`, `lab_budget`,
  `lab_triage`, `lab_autosearch.py` planner) genuinely **cannot** edit HTML, run Lean, run Playwright, or
  do git — they are read/JSON/markdown only.
- Its **autonomous lanes** (`lab_executor.sh`, `lab_lit.sh`, `lab_monitor.sh`, `lab_autosearch.sh`,
  `lab_deep_research.sh`, `lab_review.sh`) all shell out to `claude -p --permission-mode acceptEdits`.
  The "no git / no sends / drafts-only / park-as-PENDING_HUMAN" guarantee is **enforced only by the prompt
  text handed to that child agent — NOT by a sandbox, capability lock, or permission boundary**.
  `lab_executor.sh` literally instructs the child to create a git worktree and **commit atomically**. So
  the honest statement is: **the lab does not, by prompt contract, do git/sends — but an `acceptEdits`
  child agent CAN, and is merely asked not to.** This is a soft instruction, not a hard wall.
So B keeps every engine-side agent (the lab still cannot *do* the engine/Lean/test work even via a child
agent in any useful way), and the lab's "drafts-only" safety for the cron lanes is **prompt-enforced**.

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
1. `dexters-lab/lab.config.json` (INSIDE the package, NOT repo root — so it is not auto-resolved by
   default precedence; tools must be run with explicit `DEXTERS_LAB_CONFIG`) with `lab_home` =
   `dexters-lab/lab_home/`. (No secrets; OpenRouter key absent → the heavy review panel auto-skips.)
   **[DONE 2026-06-23.]**
2. The **pure-Python honesty gates** (`claim_lint.py`, `paper_sync_check.py`, `doc_truth_gate.sh`) as
   on-demand checks the skeptic/manager can run on `paper/temporal_paper_american_2026.tex`.
3. This division-of-labor note folded into shared truth (after skeptic clearance), with a pointer from
   `docs/COMPONENT_REGISTER.md`.

## 5. What is DEFERRED — and why "deferred" is a PROMISE here, not a WALL (FLAG-PROCESS)
- The **autonomous nightly cron lanes** (`lab_executor`, `lab_lit`, `lab_autosearch`, `lab_monitor`,
  `lab_deep_research`, `lab_review`) and any **headless `claude -p`** execution — side-effectful, spend
  budget, web-fetch, and (per §1) git-capable via the `acceptEdits` child.
- **`OPENROUTER_API_KEY`** for the heavy review panel — not set; the panel auto-skips until provided.
- **⚠ Environment reality the skeptic surfaced (must reach the operator):** in THIS environment the
  `claude` CLI **is already present** and **`GH_TOKEN` (a live GitHub PAT) is already exported in the
  shell**. So the cron lanes are NOT gated by missing infrastructure — they are one `lab.config.json` +
  one cron line away from a money-spending, git-capable, web-fetching autonomous agent running **with a
  live GitHub token readable in its environment scope**, behind only prompt-text guardrails (§1). Worse,
  once `lab.config.json` lands at repo root, `ensure_home()` auto-resolves **every** lab tool — including
  the deferred lanes — against the live repo by default precedence. "Deferred" is therefore a
  **discipline**, not a wiring barrier.
- Nothing about the lab is given **git authority** — manager stays sole git actor — but note this is a
  policy we enforce, not something the lab's own design prevents (§1).

## 6. Operator decisions REQUIRED before enactment (elevated per FLAG-SCOPE + FLAG-PROCESS)
**Q1 (headline — autonomy scope).** You said "let those agents run the project." The lab structurally
cannot run the engine / Lean / tests / git. Do you mean: **(a)** the lab as *tooling our existing agents
invoke* (this B plan), or **(b)** something more autonomous — which we would have to flag as unsafe given
Q2? "B" chose among the manager's framing; this is the question those two words don't resolve, and the
manager will not encode "tooling-not-team" as settled truth until you confirm.
**Q2 (secret exposure).** Given the `claude` CLI is live and `GH_TOKEN` is in-environment here, and the
cron lanes are prompt-guarded only (§1): may **any** lane ever run in an environment where that token is
live? Default manager recommendation = **no lane runs while `GH_TOKEN` is exported**; on-demand
pure-Python honesty gates only.
**Q3.** Budget cap: lab default is $40/mo; only relevant once paid lanes/keys are on.
**Q4 (standing — the on-demand `claude -p` lanes; raised by the confirming skeptic pass).** The two
paper/research lanes `lab_review.sh` and `lab_deep_research.sh` don't just run Python — each launches a
Claude sub-agent (`claude -p --permission-mode acceptEdits`) with the default Bash+WebFetch toolset and
**no allowlist/env-scrub, so it can read the live `GH_TOKEN`**. Your entry-270 answer covered crons (no)
and keys-in-env (accepted) but did not authorize *these specific on-demand lanes*. Until you answer, they
stay UNAUTHORIZED; the pure-Python honesty gates (`claim_lint`, `paper_sync_check`, `doc_truth_gate`,
`rq_compile`, `stopping_gate`, `lab_budget`) are fully authorized on-demand.

## 7. Skeptic verdict (appended VERBATIM, unedited — skeptic run acd21e9c, 2026-06-23)

## SKEPTIC VERDICT — Dexter's Lab Option-B handover (governance change, halt-class)
**Date:** 2026-06-23 · **Artifact:** `docs/dexters_lab_handover_B.md` + package `/home/user/Perp-Options-AMM/dexters-lab/`
**Result: NOT CLEAR-TO-ENACT as written. Three FLAGs. The pure-Python "wired NOW" set is safe and may proceed; the safety *framing* and one scope step must change before enactment.**

What I verified independently (not trusted from the note): test suite **219 passed / 5 skipped** — TRUE. The three "NOW" tools (`claim_lint.py`, `paper_sync_check.py`, `doc_truth_gate.sh`) and `lab.config.json` are genuinely pure-Python / bash+git, no keys, no `claude` invocation — TRUE and safe. The named `paper/temporal_paper_american_2026.tex` exists, so the claim-lint/paper-sync gates point at a real file. `ensure_home()` only `mkdir`s — benign.

---

### FLAG-OVERSELL — the "lab CANNOT do git / Lean / Playwright / HTML" capability claim is half-true and oversold as structural (handover §1, §5)
The pure-Python tools genuinely cannot. But the autonomous lanes (`lab_executor.sh`, `lab_lit.sh`, `lab_monitor.sh`, `lab_autosearch.sh`, `lab_deep_research.sh`, `lab_review.sh`) all shell out to `claude -p --permission-mode acceptEdits`. The "no git, no sends, no deploys, drafts-only, PENDING_HUMAN-instead-of-commit" guarantee is enforced **only by prompt text handed to that child agent** — it is not a sandbox, capability lock, or permission boundary. `lab_executor.sh` line 145 literally instructs the child to "**commit atomically**, then update the task's status"; lines 138–140 have it create a git worktree and merge back. So "the lab parks git as PENDING_HUMAN → manager performs" (§2 table row, §5 bullet) describes the *happy path the prompt requests*, not a structural inability. An `acceptEdits` agent told "no git" is an agent that *can* run git and is *asked* not to. The note sells a soft instruction as a hard wall — the same relabel-the-gap dodge I flagged in optstop. **Required change:** restate the four "cannot" claims as "the lab does not, by prompt contract, do X" — and note that the cron lanes' git/send safety is prompt-enforced, not capability-enforced.

### FLAG-PROCESS — the environment contradicts the "deferred = safe" reassurance, and the note glosses a live-secret exposure
"Deferred (needs the `claude` CLI wired into cron)" is doing the load-bearing safety work in §4/§5. But in **this** environment the `claude` CLI **is already present**, and **`GH_TOKEN` is already exported into the shell** (I confirmed both). That means the deferred lanes are not gated by infrastructure that doesn't exist — they are one `lab.config.json` + one cron line away from a money-spending, git-capable, web-fetching autonomous agent running with a **live GitHub PAT in its environment scope**, behind only prompt-text guardrails (see FLAG-OVERSELL). The handover treats "no `OPENROUTER_API_KEY`" and "cron not wired" as the safety margin; it never reckons with `GH_TOKEN` being readable by any `claude -p` child the lanes spawn. Additionally: once `lab.config.json` lands at repo root, `ensure_home()` auto-resolves **every** lab tool — including the deferred lanes — against the **live repo** by default config precedence, so "deferred" is a discipline, not a wiring barrier. **Required change before enactment:** the manager must state explicitly to the operator that (a) the CLI is present, (b) `GH_TOKEN` is in-environment, (c) the cron lanes are prompt-guarded only, and get an explicit operator decision on whether any lane may ever run in an environment where that token is live. This is a secret-exposure question the operator must see, not a procedural detail.

### FLAG-SCOPE — "B" interpreted as tooling-not-team is a real narrowing of entry 268, asserted rather than operator-confirmed
Operator entry 268 (verbatim): "give those agents the handover from our existing agwnts, and nthen **let those agents run the project**." Entry 269 is a bare "B" choosing among the manager's own B/C/A framing. The B plan keeps every engine-side agent and demotes the lab to "tooling our agents invoke, NOT an autonomous replacement team" (§0). That demotion is **well-justified by the real capability gap** (the lab is a paper/research-governance pipeline, not an engine/Lean/test/git team) — I am not disputing the gap. What I flag is that the note presents "B = tooling-on-top, autonomy deferred" as a settled reading of the operator's word, when the operator's actual instruction was "let those agents run the project" and the manager's B/C/A vocabulary is exactly the agent-coined framing I'm directed to treat as a dodge vector. The honest move is to surface, in plain English, the one question the operator's two words don't resolve: *"You said let them run the project; the lab structurally can't run the engine/Lean/tests/git — do you want it as tooling our existing agents invoke (this plan), or did you intend something more autonomous that we'd have to flag as unsafe?"* That belongs in §6 as the **headline** operator question, not buried as a sub-bullet about cron lanes. **Required change:** elevate the autonomy-scope question to an explicit operator confirmation before enactment; do not encode "tooling-not-team" into shared truth until the operator confirms that reading.

---

### What I did NOT find wrong (attack attempted, held):
- **Honesty-model mapping (claim 5):** H1–H4 → operator-via-manager, and "no-auto-sends/append-only/kill-switch" → file-safety-gate/STOP-ON-RED is a **fair** analogy, not forced. The lab's FALSIFIED-is-success / pre-reg-hash / no-rerun-until-green doctrine genuinely reinforces our honest-label rule. PASS on the mapping.
- **Authority conflict (claim 2):** "skeptic drives the lab's review/claim/stopping gates" does **not** conflict with skeptic read-only / above-manager rank **as long as** the skeptic uses these tools advisorily (run a gate, emit a FLAG) and never becomes the *executor* of a lab tool that writes/commits — which the pure-Python NOW set respects. The note should say this explicitly, but it is not a defect.
- **Completeness vs `feature_inventory.md`:** this is a governance/tooling note that changes **no** curve/settlement/economics math, so inventory items 1–16 are correctly N-A; no load-bearing curve structure is silently dropped. No existing agent duty is dropped — the division-of-labor table keeps intern/research-lead/tester/manager/skeptic duties UNCHANGED and additive. PASS on completeness.

### Bottom line
The **pure-Python NOW set + lab.config.json with `lab_home` inside the repo may be wired** — it is genuinely side-effect-free and key-free. **Do NOT** fold the division-of-labor note into shared truth, and do NOT represent the cron-lane deferral as a structural safety guarantee, until: (1) the "cannot do git/sends" language is corrected to "prompt-contract, not capability"; (2) the operator is shown, in plain English, that the `claude` CLI is live and `GH_TOKEN` is in-environment, and rules on whether any lane may run under a live token; (3) the autonomy-scope question ("run the project" vs "tooling-on-top") is put to the operator as the headline question and confirmed. The capability gap is real and B is a reasonable response to it — but the safety story rests on "deferred," and in this environment "deferred" is a promise, not a wall.

## 8. Confirming skeptic verdict (appended VERBATIM, unedited — skeptic run a9ec00fe, 2026-06-23)

**CLEAR-TO-ENACT** the division-of-labor fold and the pure-Python on-demand honesty gates — **with one standing condition** on the two `claude -p` paper/research lanes.

On your four specific checks:

1. **FLAG-SCOPE — RESOLVED.** "let it do paper/research side" + "dont need crons" confirms the tooling-on-top reading in plain English. Encode it.

2. **FLAG-PROCESS — RESOLVED as a decision.** The operator was shown the live-CLI + GH_TOKEN-in-env reality (§6 Q2) and ruled "keys remain in the environment" = accepted, bounded residual risk. I independently verified the manager's claims: config is **inside** `dexters-lab/` (not repo root — confirmed, nothing at root), no cron wired, `OPENROUTER_API_KEY` unset, no `*_run.json`/`*_run.err` outputs (no `claude -p` lane ran), only pure-Python `claim_lint` exercised. Transcript entry 270 matches the verbatim you handed me — no FLAG-PROCESS against the manager on transcription.

3. **FLAG-OVERSELL — RESOLVED.** §1/§5 now read "prompt-contract, not capability wall" and the table/§5 call the lane git-safety "prompt-enforced, not capability-enforced."

4. **The gap the operator's answer does NOT cover (the standing condition):** `dexters-lab/bin/lab_review.sh` (line 133) and `lab_deep_research.sh` (line 193) — the very "paper/research" lanes — spawn `claude -p --permission-mode acceptEdits` with **no `--allowedTools` allowlist and no environment scrub** (verified directly). That child gets the default toolset (Bash + WebFetch) and inherits the live `GH_TOKEN`. The operator ruled on **crons** (no) and **keys-in-env** (accepted) — but did **not** rule on whether the *on-demand, non-cron* paper/research lanes may spawn a token-capable, Bash-capable child. "paper/research side" does not auto-authorize that. The manager must ask one plain-English question before treating `lab_review.sh`/`lab_deep_research.sh` as authorized. The pure-Python gates are clear; those two lanes are not.

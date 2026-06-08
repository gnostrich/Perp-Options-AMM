# Routine spec — Aristotle PH/formal-verification loop

Ready-to-paste into **claude.ai/code → Routines**. This automates the **direct** loop:
**research-lead alone** advances the port-Hamiltonian / Aristotle obligation queue against current
`main` — it phrases each obligation, **calls Harmonic's Aristotle itself** (aristotlelib CLI),
re-verifies the candidate locally, and records the verdict. There is **no broker/courier step**: the
standalone `aristotle` agent is gone, folded into research-lead. The manager orchestrates and is the
sole git/env actor; it receives only research-lead's **distilled** status (verdicts, queue, escalations),
never raw prover output.

> Prerequisites the operator must satisfy first (see report / escalations):
> 1. Add **`aristotle.harmonic.fun`** to the environment **Custom allowlist** (currently
>    `host_not_allowed`).
> 2. Enable the **Harmonic connector** for the routine (cloud-native path a), OR ensure the env
>    setup script installs `aristotlelib` + a Lean v4.28.0 / Mathlib v4.28.0 toolchain for the CLI
>    path (c) and local re-verify.
> 3. `ARISTOTLE_API_KEY` present in the environment (already set in the current session env).

---

## Field values

- **Name:** `Temporal — Aristotle PH verification loop`
- **Repository:** `gnostrich/perp-options-amm` (Perp-Options-AMM)
- **Environment:** this environment (same network policy + env vars; Harmonic connector enabled).
- **Triggers:**
  - **On push to `main`** (re-check obligations against the merged state of truth).
  - **Daily** (advance the standing queue / re-poll any in-flight Aristotle tasks).
- **Connector:** **Harmonic / Aristotle — enabled.**
- **Branch behavior:** work on a routine branch; open a PR; **do not merge** (manager + operator gate).

## Prompt (paste verbatim)

```
You are the MANAGER of Temporal, running the direct formal-verification loop against current `main`.
Roster: manager (you), research-lead (theory owner AND its own prover interface), intern, tester,
paper. There is NO separate aristotle agent and NO courier step. You are the sole git/env actor; you
receive only research-lead's distilled status, never raw prover output. Read CLAUDE.md and
.claude/agent-memory/manager/MEMORY.md first.

Do, in order:
1. Spawn research-lead with one instruction: advance the PH/Aristotle obligation queue in
   .claude/agent-memory/research-lead/MEMORY.md and specs/port_hamiltonian_consistency.md against
   current main, end-to-end. research-lead, on its own:
   - picks the NEXT ready obligation (a pinned Lean statement — file with sorrys, or NL to formalize)
     with proof targets and module scope;
   - submits it to Harmonic's Aristotle itself via the aristotlelib CLI
     (`aristotle submit "<instr>" --project-dir formal/temporal_lean_verified --wait --destination ...`,
     or the Harmonic connector), and polls to completion;
   - re-verifies any candidate locally (lake build on Lean 4.28.0/Mathlib v4.28.0; axioms ⊆ {propext,
     Classical.choice, Quot.sound}; no sorry/admit/axiom/native_decide/sorryAx/opaque/unsafe), emending
     ONLY mechanical backend diffs;
   - records ONE verdict: proved+re-verified / counterexample / still-open / candidate-fails-local-
     recheck; never rubber-stamps a candidate.
   It keeps all prover/poll/lake noise in its own context and returns to you ONLY distilled status:
   verdict(s), queue delta, the folded proof archive (if any), and escalations.
2. You independently re-audit any "proved+re-verified" archive research-lead hands up for folding
   (diff unchanged modules, token-scan, re-check the math) — trusted-from-prover until you build it
   yourself in the canonical env.
3. Commit queue/spec/memory updates and any folded proof to a routine branch; open a PR; DO NOT merge.
4. STOP and escalate to the operator (AskUserQuestion) if research-lead flags: any PH property as
   stated would require a real engine / economic-object / settlement-semantics change; a counterexample
   on a load-bearing claim; or a candidate-fails-local-recheck that reveals a weakened statement. Never
   patch a statement toward green.

If the Harmonic host is blocked or the toolchain is missing, research-lead must not fake a round-trip —
it reports the precise blocker and stops; you relay that up.
```

## Self-check / persistence
- A subscription/routine run is not "done" until its PR is merged or closed by the operator.
- If `send_later` is available, schedule a ~1h self check-in to re-poll in-flight Aristotle tasks and
  PR/CI state; re-arm silently if nothing changed; stop once merged/closed.

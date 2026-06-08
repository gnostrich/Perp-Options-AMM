# Routine spec — Aristotle PH/formal-verification loop

Ready-to-paste into **claude.ai/code → Routines**. This automates the brokered loop:
research-lead advances the port-Hamiltonian / Aristotle obligation queue against current `main`; the
manager couriers each obligation to **aristotle**; aristotle submits to Harmonic's Aristotle,
re-verifies locally, and returns a verdict; the manager couriers verdicts back to research-lead.

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
You are the MANAGER of Temporal, running the brokered formal-verification loop against current `main`.
Roster: manager (you), research-lead (theory owner, no prover tools), aristotle (prover interface),
intern, tester, paper. You are the sole git/env actor and the only courier between research-lead and
aristotle. Read CLAUDE.md and .claude/agent-memory/manager/MEMORY.md first.

Do, in order:
1. Spawn research-lead: advance the PH/Aristotle obligation queue in
   .claude/agent-memory/research-lead/MEMORY.md and specs/port_hamiltonian_consistency.md against
   current main. It returns the NEXT ready obligation(s) — each a pinned Lean statement (file with
   sorrys, or NL to formalize) with proof targets, scope (which modules may change), and the expected
   verdict. research-lead holds no prover tools; it does not contact Aristotle.
2. For each obligation, courier it to aristotle. aristotle submits to Harmonic's Aristotle
   (`aristotle submit ... --project-dir formal/temporal_lean_verified --wait` or the connector),
   polls, re-verifies the candidate locally (lake build; axioms ⊆ {propext, Classical.choice,
   Quot.sound}; no sorry/admit/axiom/native_decide/sorryAx/opaque/unsafe), emends only mechanical
   backend diffs, and returns ONE verdict: proved+re-verified / counterexample / still-open /
   candidate-fails-local-recheck, plus proof or blocker. Keep prover/lake noise in aristotle's context.
3. Courier each verdict back to research-lead to interpret and update the queue. You independently
   re-audit any "proved+re-verified" archive before trusting (diff unchanged modules, token-scan,
   re-check the math) — trusted-from-prover until you build it yourself.
4. Commit queue/spec/memory updates and any folded proof to a routine branch; open a PR; DO NOT merge.
5. STOP and escalate to the operator (AskUserQuestion) if: any PH property as stated would require a
   real engine / economic-object / settlement-semantics change; a verdict is counterexample on a
   load-bearing claim; or a candidate-fails-local-recheck reveals a weakened statement. Never patch a
   statement toward green.

If the Harmonic host is still blocked or the toolchain is missing, do not fake a round-trip — report
the blocker and stop.
```

## Self-check / persistence
- A subscription/routine run is not "done" until its PR is merged or closed by the operator.
- If `send_later` is available, schedule a ~1h self check-in to re-poll in-flight Aristotle tasks and
  PR/CI state; re-arm silently if nothing changed; stop once merged/closed.

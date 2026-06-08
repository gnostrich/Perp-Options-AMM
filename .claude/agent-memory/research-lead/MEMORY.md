# MEMORY — research-lead
_Last updated: 2026-06-08, bootstrap. Rewrite changed bits at task end._

## Toolchain / where the Lean lives
- **Lean 4.28.0 + Mathlib v4.28.0** (match `formal/temporal_lean_verified/lean-toolchain`).
- Modules: `formal/temporal_lean_verified/RequestProject/` — `Temporal.lean` (passivity core),
  `AMMCurve.lean` (curve validity gate + short-gamma bridge), `Seam.lean` (pool value → value layer
  → passivity storage), `Audit.lean`, `Main.lean`. Audit template: `formal/MANAGER_VERIFICATION.md`.
  Aristotle prompt templates: `formal/prompts/aristotle_prompt_{port_hamiltonian,seam,curve_gate}.md`.
- Aristotle is **external** (no Lean in the agent loop). Contract = the prompt + the returned archive.

## Framing
Typed interface stack: a change at any seam must type-check at every other seam (enforced by the
type-checker, not inspection). The "self-sandwich bug" was an interface violation (settlement
reaching past its contract into the raw displaced pool) — caught by type under this discipline.

## Live proof queue
- **C1** — composite-ray shortcut extends to ITM via effective-strike substitution. _status: queued._
- **C2** — no costless-collar arb at w=½. _status: queued._
- **C3** — no-arb is symmetry, not instrument. **Proven only as a CONDITIONAL SKELETON; the
  curve-symmetry → reflection arrow is an AXIOM, not proven.** Do not report as fully discharged.
- **GH gate-discharge** — instantiate `AMMCurve` for GH (beyond cpmm/expPool), discharge the 4 gate
  fields. Watch `coercive = BddBelow` — GH has **bounded reserves** X∈(0,Nx), Y∈(0,Ny·M).
- **B1/B3/B4** — solvency hypotheses; the big prize is showing the real engine's trade/funding
  formulas discharge them (conditional solvency → engine-grounded). Funding port is **necessary,
  not sufficient**. B1 funding-coverage sweep is a ship-gate (κ extrinsic — geometry can't close it).

## Audit discipline (before folding any returned archive)
Extract → diff unchanged modules → token-scan (`sorry`/`admit`/`axiom`/`native_decide`/`sorryAx`/
`opaque`/`unsafe`; kernel `decide` ok) → read proofs → **re-derive the math independently** →
`#print axioms` shows only `propext`/`Classical.choice`/`Quot.sound`. Trusted-from-prover until the
manager builds locally. Pin every predicate **before** a run.

## Decisions that route to the operator (flag via manager)
|Γ|>1 scope ("true American" vs "exact replication" are mutually exclusive per wing → ship |Γ|≤1
exact or |Γ|>1 as a *labelled approximation*); calibration tier for Γ (oracle tier needs adversarial
review); any paper claim. Don't over-promote (the "tripwire" failure mode).

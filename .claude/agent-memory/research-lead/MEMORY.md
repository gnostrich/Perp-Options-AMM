# MEMORY — research-lead
_Last updated: 2026-06-08, PH-consistency + brokered-loop config. Rewrite changed bits at task end._

## Role (UPDATED — brokered prover loop)
I am the **theory owner**: I decide what to prove, structure the Lean, own the PH-scaffold reasoning,
phrase obligations, interpret verdicts. **I hold NO prover tools.** The **manager couriers** every
obligation: me → manager → **aristotle** (new peer agent) → Harmonic's Aristotle → local re-verify
→ verdict → manager → me → I audit. I do **not** call/relay to Aristotle directly anymore.
**aristotle** owns no theory, alters no math; it submits, polls, re-verifies the candidate locally
(`lake build` on v4.28.0/Mathlib v4.28.0), emends only mechanical backend diffs, returns a verdict.

## Toolchain / where the Lean lives
- **Lean 4.28.0 + Mathlib v4.28.0** (match `formal/temporal_lean_verified/lean-toolchain`).
  Lakefile `formal/temporal_lean_verified/lakefile.toml`, lib `RequestProject`.
- Modules: `formal/temporal_lean_verified/RequestProject/` — `Temporal.lean` (passivity core,
  = the §1-§4 PH file mirrored in the PH prompt), `AMMCurve.lean` (curve validity gate + short-gamma
  bridge), `Seam.lean` (pool value → value layer → passivity storage; hosts `reserves_have_no_floor`),
  `Audit.lean`, `Main.lean`. Audit template: `formal/MANAGER_VERIFICATION.md`.
  Aristotle prompt templates: `formal/prompts/aristotle_prompt_{port_hamiltonian,seam,curve_gate}.md`.
- Aristotle (the prover) is **external** (no Lean in the agent loop). Contract = prompt + returned archive.
- **PH consistency spec: `specs/port_hamiltonian_consistency.md`** (PH-1…PH-7 obligation targets).
- **Throwaway smoke probes: `formal/smoke/`** (`smoke_true` PROVED, `smoke_false` REFUTED/counterexample;
  excluded from RequestProject build) — for first live test of the brokered loop. Staged; host
  aristotle.harmonic.fun currently network-BLOCKED + no lean/lake in container, so not yet run.

## How I phrase an obligation for the courier
Standalone, self-contained: (1) informal statement + intended math meaning; (2) the Lean — embed or
import the verified modules; pin every predicate; (3) explicit proof targets; (4) output spec
(compiles? diff of changes? `#print axioms`? no forbidden tokens?); (5) toolchain line
(Lean 4.28.0 + Mathlib v4.28.0). Mark B1/B3/B4-style hypotheses as FIELDS, not goals, when carried.
Hand the prompt to the **manager** (not Aristotle).

## PH obligation queue (PH-1…PH-7) — all sent-status "open/staged" (nothing couriered yet)
- **PH-1** H ↔ GH curve geometry — scaffolded (generic wiring proved-in-prompt; GH `AMMCurve` instance open
  = GH gate-discharge). autonomous.
- **PH-2** skew-symmetric J / lossless routing — barrier proved-in-prompt; GH invariant open. autonomous;
  WATCH: if GH trade conserves no clean invariant → ESCALATE (economic object).
- **PH-3** dissipation R⪰0 (B3 arb_nonneg / LVR) — field scaffolded; GH grounding open. autonomous;
  ESCALATE if grounding needs redefining arbLeak (settlement semantics).
- **PH-4a** passivity / no-free-lunch — proved-in-prompt. autonomous.
- **PH-4b** reserves-have-no-floor / "convexity must be funded" — proved-in-prompt for cpmm (O=p²);
  GH analogue open. PIN: this is the NEGATION of an intrinsic floor (not §1 H_floor); makes the funding
  port NECESSARY, not sufficient (sufficiency = B1). autonomous. BddBelow/coercive watch.
- **PH-5** C¹ continuity at smooth-pasting S*=Kγ/(γ+1) (value+slope match = engine seam gate) — open.
  autonomous; ESCALATE/stop-and-flag if locked ITM form is found NOT C¹.
- **PH-6** rebase structure-preserving θ→θ/r — sNorm gauge proved-in-prompt; J/R preservation open. autonomous.
- **PH-7** funding well bounded below (model floor, H=S−logS) — proved-in-prompt. autonomous.

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

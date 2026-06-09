# Aristotle prompt — PH-4b GH-analogue / reserves-have-no-floor generalized (TIER 4 extra)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
The shipped `reserves_have_no_floor` (in `Seam.lean`) is cpmm-specific (`O p = p²`). The GH-relevant
generalization: GH has **bounded reserves**, so `poolValue` is bounded ABOVE on `Ioi 0`; against any
obligation `O` that is unbounded above, the reserve part of storage
`intrinsic p = poolValue p − O p → −∞`, hence `intrinsic` has NO lower bound on `Ioi 0`.

PH reading (unchanged): the reserve geometry is NOT intrinsically coercive against an unbounded convex
claim — the floor is a **PORT property, not a storage property**. This makes the funding port
**NECESSARY, not sufficient** (sufficiency = B1, undischarged). This is "convexity must be funded,"
generalized off cpmm to the bounded-reserve (GH-shaped) case.

**Scope honesty:** this proves the port is necessary (no reserve floor), NOT that the funding port
covers the deficit (B1). Do not over-promote.

## Lean (project `RequestProject`, file `RequestProject/PH4b.lean`)
Self-contained (does NOT need to import Seam — state generically). `intrinsic V O p := V p − O p`.
"unbounded above" = `∀ M, ∃ p ∈ Ioi 0, M < O p`. Ships statements + `sorry`. Replace each `sorry`;
do not alter statements.

## Proof targets
- `no_floor_of_boundedAbove_value_unbounded_obl` :
  if `V : ℝ → ℝ` is bounded above on `Set.Ioi 0` (`∃ B, ∀ p ∈ Set.Ioi 0, V p ≤ B`) and
  `O : ℝ → ℝ` is unbounded above on `Set.Ioi 0` (`∀ M, ∃ p, p ∈ Set.Ioi 0 ∧ M < O p`), then
  `¬ BddBelow ((fun p => V p - O p) '' Set.Ioi 0)`.
  [the reserve part has no lower bound when reserves are bounded but the claim is not — the port is
  necessary.]
- `gh_instance` (sanity): instantiate it with `V := fun _ => (1:ℝ)` (a bounded GH-style poolValue stand-in,
  bounded above by 1) and `O := fun p => p` (unbounded above on `Ioi 0`) to show the hypotheses are
  satisfiable and the conclusion fires: `¬ BddBelow ((fun p => (1:ℝ) - p) '' Set.Ioi 0)`.

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/PH4b.lean` changes.

# Aristotle prompt — PH-3 / R⪰0 dissipation PSD (arb_nonneg) (TIER 3)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
PH-3: the resistive structure is **PSD**. Per-tick dissipation `arbLeak` (LVR net of fees) is a
quadratic form `vᵀRv` in the slope-deviation variable `v`, with `R ⪰ 0`, hence `arbLeak ≥ 0`. This
grounds the `arb_nonneg` field structurally (instead of carrying it as a bare hypothesis): nonnegativity
FOLLOWS from `R ⪰ 0`.

**NECESSARY-not-sufficient caveat (do not over-promote):** `R ⪰ 0` (dissipation one-way) is the
funding-port NECESSARY condition. It does NOT close solvency (that is B1) and does NOT by itself imply
the port covers the convex deficit. This obligation proves only the PSD ⇒ nonneg dissipation structure.

Two layers:
- **Scalar (slope-deviation):** `arbLeak v = R * v^2` with `R ≥ 0` ⇒ `arbLeak v ≥ 0` for all `v`.
  (the engine's one-dimensional slope-deviation form.)
- **General PSD:** for a real positive-semidefinite matrix `R` and any vector `v`, the quadratic form
  `vᵀ R v ≥ 0` (the multivariate statement, in case the resistive structure is multi-port).

## Lean (project `RequestProject`, file `RequestProject/PH3.lean`)
Use Mathlib's `Matrix.PosSemidef` for the general case. Ships statements + `sorry`. Replace each
`sorry`; do not alter statements.

## Proof targets
- `arbLeak_nonneg_scalar` : for `R ≥ 0` and any `v : ℝ`, `0 ≤ R * v^2`. (scalar slope-deviation PSD.)
- `quadForm_nonneg_of_posSemidef` : for a real PSD matrix `R : Matrix (Fin n) (Fin n) ℝ`
  (`R.PosSemidef`) and `v : Fin n → ℝ`, the quadratic form `0 ≤ (Matrix.toBilin' R) v v`
  (or the equivalent `0 ≤ ∑ i, ∑ j, v i * R i j * v j` — use whichever PSD-quadratic form Mathlib
  exposes; the intended claim is `vᵀRv ≥ 0`). If Mathlib already has this as a lemma, just invoke it.

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/PH3.lean` changes.

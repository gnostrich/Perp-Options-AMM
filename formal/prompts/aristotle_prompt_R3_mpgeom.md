# Aristotle prompt — R3 / mpGeom coordinate pin (TIER 1)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0 (matches `lean-toolchain`).

## Informal statement + intended math
In the GH engine, `getMP_raw` is a **price coordinate**, NOT the reserve slope. The geometric
marginal (true |dy/dx| slope) is `mpGeom = getMP_raw · e^(−ghMu)`. Equivalently the ratio
`getMP_raw / slope = e^(ghMu) = e^μ` exactly. This pins the coordinate map so the price-coord-vs-slope
conflation (which caused the slippage bug) cannot re-enter the formal layer. Slope variables in
PH-2/PH-3 must use `mpGeom`, never the raw price coordinate.

Concretely we model the two engine reals `getMP_raw = R > 0` and `μ = ghMu ∈ ℝ`, DEFINE
`mpGeom R μ := R * Real.exp (-μ)`, and prove the two exact algebraic identities. These are
deliberately trivial — the value is the *pin*, not the difficulty.

## Lean (project `RequestProject`, file `RequestProject/R3.lean`)
The file is provided with the target theorems stated and `sorry` placeholders. Replace each `sorry`
with a real proof. Do NOT change any statement, definition, or hypothesis.

## Proof targets
- `mpGeom_def_eq` : `mpGeom R μ = R * Real.exp (-μ)` (by `rfl`/definitional).
- `getMP_raw_over_slope` : for `R > 0`, `R / mpGeom R μ = Real.exp μ`  (the e^μ factor).
- `slope_pos` : for `R > 0`, `0 < mpGeom R μ`.

## Output spec
- The project must compile server-side with NO `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`
  and NO new `axiom` declarations.
- Report `#print axioms` for each of the three theorems — must be ⊆
  `{propext, Classical.choice, Quot.sound}`.
- Do not edit any module other than `RequestProject/R3.lean`.

# FW germ — joint warp+mode first-order characterization AT the mark (FW-5) + witness (FW-6)

Toolchain: Lean 4.28.0 + Mathlib v4.28.0. Project `RequestProject`; the ONLY file to edit is
`RequestProject/FWGerm.lean` (fill the `sorry`s). Do NOT modify any other module
(AMMCurve/Audit/Main/Seam/Temporal must come back byte-identical), do NOT change any statement,
definition, or hypothesis, do NOT alter `lean-toolchain`/`lakefile.toml`.

## Intent (scope: trades AT the mark — the off-mark case is a separate, open obligation)

`ε` is an elasticity profile over the ray coordinate, mark `u₀`, mode holding (`ε u₀ = 1`).
A regular warp delivers first-order update `δε(ũ) = A(ũ)·du + o(du)`, `A` continuous at `u₀`.
- Transport (reading 1) demands the new value at the old mark match the frozen transported
  slope: `ε(u₀+du)·e^(du)` (the `e^(du)` is the ray factor: slope at ray `ũ` is
  `ε(ũ)·P·e^(ũ)`, so equal slopes at different rays relate values by `e^(du)`).
  First-order content: `d/d(du)[ε(u₀+du)·exp du]│₀ = ε'(u₀)·1 + ε(u₀)·1 = ε' + 1` must equal
  the delivered coefficient `A u₀`.
- Mode at the moving mark: the new mark is at `u₀ + du`; `ε_new(u₀+du) =
  ε(u₀+du) + A(u₀+du)·du` must be `1 + o(du)`. First-order content: `ε' + A u₀ = 0`
  (note `d/d(du)[A(u₀+du)·du]│₀ = A u₀`, needing only continuity of `A` at `u₀` — the
  difference quotient is literally `A(u₀+du)`).
- Joint: `A u₀ = ε' + 1` and `A u₀ = −ε'` ⟺ `ε' = −1/2 ∧ A u₀ = 1/2`.

Key proof mechanics:
- `TransportFO ε u₀ a` is `HasDerivAt (fun du => ε (u₀+du) * exp du − (ε u₀ + a*du)) 0 0`.
  The composite `du ↦ ε(u₀+du)` has derivative `ε'` at `0` (chain rule with `u ↦ u₀+u`);
  `du ↦ ε(u₀+du)·exp du` has derivative `ε'·exp 0 + ε(u₀)·exp 0 = ε' + 1` (product rule,
  `hmode`). The linear part has derivative `a`. So `TransportFO` holds iff
  `(ε' + 1) − a = 0` — use uniqueness of derivatives (`HasDerivAt.unique`) for the forward
  direction and `HasDerivAt.sub` for the backward.
- For `ModeFO`: `du ↦ A(u₀+du)·du` has derivative `A u₀` at `0` FROM CONTINUITY ONLY:
  `HasDerivAt f (A u₀) 0` where `f du = A(u₀+du)·du`, since the slope
  `(f du − f 0)/du = A(u₀+du) → A u₀` (`hA`). (E.g. via `hasDerivAt_iff_tendsto_slope`;
  `slope` of `f` at `0` is `fun du => A (u₀+du)` away from `0`.)
- `germ_weight`: quotient rule on `w = ε/(1+ε)` at `u₀`: `w' = ε'/(1+ε)² = (−1/2)/4 = −1/8`;
  `1 + ε u₀ = 2 ≠ 0`.
- FW-6: `wGerm c u = 1/2 − (u−c)/8`, `epsGerm = wGerm/(1−wGerm)`, explicit kernel
  `Agerm c u = (1/8)/((1/2+(u−c)/8)²)`. At `u = c`: `wGerm = 1/2`, `epsGerm = 1`,
  `Agerm = (1/8)/(1/4) = 1/2`. `epsGerm c` has derivative at `c`:
  `w'/(1−w)² = (−1/8)/(1/4) = −1/2` (quotient rule; `1 − wGerm c c = 1/2 ≠ 0`).
  `germ_satisfies_both`: apply the backward direction of `joint_iff` with
  `hmode := germ_mode`, `hd := germ_slope`, `hA := (germ_kernel c).2`, and
  `(germ_kernel c).1 : Agerm c c = 1/2`.
  `germ_valid_strip`: with `d = u−c`, `wGerm = 1/2 − d/8 ∈ (0,1)` since `d² < 8 < 16` gives
  `|d| < 4`; and `w(1−w) = 1/4 − d²/64 > 1/4 − 8/64 = 1/8`, so `−w(1−w) < −1/8`.
  (`nlinarith`/`linarith` with `d²` bounds; from `d² < 8` derive `|d| ≤ 4` via
  `d² < 16`.)

## Proof targets (fill every `sorry`; statements are frozen)
`joint_iff, germ_weight, germ_mode, germ_slope, germ_kernel, germ_satisfies_both,
germ_valid_strip`.

## Output spec
- All `sorry`s replaced; file compiles; NO `sorry`/`admit`/`axiom` decls/`native_decide`/
  `opaque`/`unsafe`; kernel `decide` OK. Prefer concrete tactics over search tactics.
- End with `#print axioms` per theorem (⊆ `propext`/`Classical.choice`/`Quot.sound`).
- If any statement is FALSE as pinned, report the counterexample — do NOT weaken it.

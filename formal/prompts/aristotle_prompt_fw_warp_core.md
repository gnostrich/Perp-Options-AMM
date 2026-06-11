# FW warp core — Balancer Trade Formula = the warp principle's verified instance (FW-1/2/3/4/13 + FW-11 instance)

Toolchain: Lean 4.28.0 + Mathlib v4.28.0. Project `RequestProject`; the ONLY file to edit is
`RequestProject/FWWarpCore.lean` (fill the `sorry`s). Do NOT modify any other module
(AMMCurve/Audit/Main/Seam/Temporal must come back byte-identical), do NOT change any statement,
definition, or hypothesis, do NOT alter `lean-toolchain`/`lakefile.toml`.

## Intent (the math, so you prove the INTENDED statements)

State `(x, y, w)`, all positive, `w < 1`. Closed-form trade (paper Trade Formula), cash `t`:
`y' = y + t`, `w' = 1 − y(1−w)/(y+t)`, `x' = xw/w'`. First integrals `α = xw`, `β = y(1−w)`.
Validity `−wy < t` gives `y + t > y(1−w) > 0` hence `0 < w' < 1`.

Derivations to reproduce (all elementary):
- `wNew = (y + t − β)/(y + t)` with `β = y(1−w)`; on the validity domain numerator
  `y + t − y(1−w) = wy + t > 0` and `< y + t`, so `0 < wNew < 1`.
- FW-1a: `d/dt wNew = β/(y+t)² = (1 − wNew)/(y+t)` since `1 − wNew = β/(y+t)`.
- FW-1b: `xNew(t) = α/wNew(t)`, so `d/dt xNew = −α·(wNew)'/wNew² = −αβ/(wNew²(y+t)²)`.
  And `1/slope(current) = ((1−wNew)·xNew)/(wNew·yNew) = (β/(y+t))·(α/wNew)/(wNew·(y+t))
  = αβ/(wNew²(y+t)²)`. Equal.
- FW-1c/d: `xNew·wNew = α` (cancel `wNew ≠ 0`), `yNew·(1−wNew) = β` (cancel `y+t ≠ 0`).
- FW-2: the frozen constant-`w` leaf through `(x,y)` is `X^w·Y^(1−w) = const`; sliding to
  `y_d = y+t` gives `x_d = x·(y/(y+t))^((1−w)/w)`. Reading-1 transport equation:
  `odds(W t)·(y/x) = (w/(1−w))·(y_d/x_d)`, i.e. `odds(W t) = odds(w)·((y+t)/y)^(1/w)`
  (exponent `1 + (1−w)/w = 1/w`). With `O t := transOdds w y t`, the canonical solution is
  `W = O/(1+O)`; `O(0) = w/(1−w)`, `O'(0) = odds(w)/(w·y)` (rpow chain rule),
  `1 + O(0) = 1/(1−w)`, so `W'(0) = O'(0)/(1+O(0))² = (1−w)/y`. For uniqueness (FW-2b):
  from `odds (V t) = O t` with `V t ∈ (0,1)` eventually, solve `V = O/(1+O)` pointwise
  (from `V/(1−V) = O`: `V = O(1−V)` so `V(1+O) = O`; `1+O > 0` since `O = odds(V) > 0`),
  hence `V =ᶠ[nhds 0] W` and the derivative transfers by `Filter.EventuallyEq.hasDerivAt_iff`.
- FW-3: second-trade inputs are `(x', y', w')` with cash `−t`; conservation gives
  `α' = α`, `β' = β`, so `y'' = y`, `w'' = 1 − β/y = w`, `x'' = α/w = x`.
- FW-13: `wNew(wNew w y t₁) (y+t₁) t₂ = 1 − ((y+t₁)(1−w'₁))/(y+t₁+t₂) = 1 − β/(y+t₁+t₂)`.
  Note `Valid w y t₁` and `Valid w y (t₁+t₂)` make every denominator and weight positive
  (intermediate `y+t₁ > β > 0`, final `y+t₁+t₂ > β > 0`).
- FW-4a: `w'/(1−w') = (y+t−β)/β` and `(α/β)·(y'/x') = (α/β)·(y+t)·w'/α = (y+t)w'/β
  = (y+t−β)/β`. Equal.
- FW-4b: at `w = 1/2`: `β = y/2`, so `w'/(1−w') = (y/2+t)/(y/2) = 1 + 2t/y`.
- FW-11: `(y/r) + (t/r) = (y+t)/r`; `wNew w (y/r) (t/r) = 1 − ((y/r)(1−w))/((y+t)/r)
  = wNew w y t` (the `r` cancels); `xNew` then identical.

## Proof targets (fill every `sorry`; statements are frozen)
`yNew_pos, wNew_pos, wNew_lt_one, xNew_pos, hasDerivAt_wNew, hasDerivAt_xNew,
alpha_conserved, beta_conserved, transport_deriv, transport_unique, round_trip,
semigroup, elasticity_post, elasticity_symmetric, rebase_commute`.

## Output spec
- All `sorry`s replaced by complete proofs; the file compiles.
- NO `sorry`/`admit`/`axiom` declarations/`native_decide`/`opaque`/`unsafe`; kernel `decide` OK.
  Prefer concrete tactics (`field_simp`, `ring`, `linarith`, `nlinarith`, explicit lemma
  applications) over search tactics.
- End the file with `#print axioms` for each theorem (must be within
  `propext`/`Classical.choice`/`Quot.sound`).
- Report any statement you believe FALSE rather than weakening it (a counterexample is a
  valid outcome).

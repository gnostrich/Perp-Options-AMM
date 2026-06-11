# FW gate + leak — validity = generator convexity = R⪰0 (FW-7) and the abstract arb-leak (FW-8)

Toolchain: Lean 4.28.0 + Mathlib v4.28.0. Project `RequestProject`; the ONLY file to edit is
`RequestProject/FWGateLeak.lean` (fill the `sorry`s). Do NOT modify any other module
(AMMCurve/Audit/Main/Seam/Temporal must come back byte-identical), do NOT change any statement,
definition, or hypothesis, do NOT alter `lean-toolchain`/`lakefile.toml`.

## Intent

FW-7 lifts the AMM-validity gate of weight-profile curve families into the single-generator
(port-Hamiltonian) reading: `qmap w u = u + log(w u/(1−w u))` is the implied log-price map;
its derivative `1 + w'/(w(1−w))` is the gate quantity AND the dissipation metric `R = Φ''` of
the generator `Φ` (any antiderivative of `qmap w`). FW-8 generalizes the GH arb-leak
(PH3_grounded) to ANY monotone slope law: leak `∫ (g u₂ − g s) ds ≥ 0` — passivity needs only
monotonicity, not the GH closed form.

Derivations to reproduce:
- FW-7a: `d/du log(w/(1−w)) = w'/w + w'/(1−w) = w'/(w(1−w))` (chain rule on `log`, quotient
  rule; `w u ≠ 0`, `1 − w u ≠ 0` from `0 < w u < 1`; note `w u/(1−w u) > 0` so `log` is
  differentiable there). Add the derivative of the identity (`1`).
- FW-7b: everywhere-positive derivative ⇒ strict monotonicity
  (`StrictMono` via `strictMono_of_deriv_pos` or `StrictMonoOn` on `univ`; convert
  `HasDerivAt` to `deriv` first).
- FW-7c: `Φ' = qmap w` strictly monotone ⇒ `StrictConvexOn ℝ univ Φ`
  (`strictConvexOn_of_deriv_strictMono` family; `Φ` is differentiable hence continuous).
- FW-7d: `(∀ u, 0 ≤ Q u) ↔ Monotone (qmap w)`. Forward: `monotone_of_deriv_nonneg`.
  Reverse: the derivative of a monotone function is ≥ 0 (difference quotients are ≥ 0;
  `HasDerivAt` + monotone ⇒ nonneg limit; e.g. via `Monotone.deriv_nonneg` if available, or
  directly: the slope `(q(u+h)−q(u))/h ≥ 0` for `h > 0` and the limit of eventually-nonneg
  is nonneg).
- FW-7e: `ConvexOn ℝ univ Φ ↔ Monotone (qmap w)` given `Φ' = qmap w` everywhere.
  Reverse: `convexOn_of_deriv_monotone` (or `convexOn_univ_of_deriv_monotone`).
  Forward: convex + differentiable ⇒ derivative monotone (slope monotonicity of convex
  functions: `ConvexOn.slope_le_of_lt` / `StrictConvexOn`… use the standard
  `ConvexOn` slope inequalities to compare `qmap w u₁ ≤ slope ≤ qmap w u₂` for `u₁ < u₂`).
- FW-8a: case `u₁ ≤ u₂`: integrand `≥ 0` on the interval (`g s ≤ g u₂` for `s ≤ u₂`), use
  `intervalIntegral.integral_nonneg`; integrability from monotonicity
  (`Monotone.intervalIntegrable` / `MonotoneOn.intervalIntegrable` — `g` and constants are
  interval-integrable). Case `u₂ < u₁`: `∫_{u₁}^{u₂} = −∫_{u₂}^{u₁}` and on `[u₂,u₁]` the
  integrand `g u₂ − g s ≤ 0`, so its integral is ≤ 0 and the negation ≥ 0.
- FW-8b: `intervalIntegral.intervalIntegral_pos_of_pos_on`: integrand `> 0` on `Ioo u₁ u₂`
  (`g s < g u₂` for `s < u₂` by strict monotonicity), integrable as above, `u₁ < u₂`.
- FW-8c: split `∫ (g u₂ − g s) = (u₂−u₁)·g u₂ − ∫ g` (`intervalIntegral.integral_sub`,
  `intervalIntegral.integral_const`); `∫ g = Φ u₂ − Φ u₁` by FTC-2
  (`intervalIntegral.integral_eq_sub_of_hasDerivAt` with the `hΦ` family and
  `Monotone.intervalIntegrable`).

## Proof targets (fill every `sorry`; statements are frozen)
`qmap_hasDerivAt, gate_strictMono, gate_strictConvex, R_nonneg_iff_monotone,
convex_iff_monotone, leak_nonneg, leak_pos, leak_eq_bregman`.

## Output spec
- All `sorry`s replaced; file compiles; NO `sorry`/`admit`/`axiom` decls/`native_decide`/
  `opaque`/`unsafe`; kernel `decide` OK. Prefer concrete tactics over search tactics.
- End with `#print axioms` per theorem (⊆ `propext`/`Classical.choice`/`Quot.sound`).
- If any direction of an iff is unprovable as stated, report it precisely — do NOT weaken
  the statement.

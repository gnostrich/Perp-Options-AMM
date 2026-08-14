# BURR2_MIXTURE — result report

All 13 `sorry`s in `BURR2_MIXTURE.lean` are discharged. No statement, hypothesis or `def` body
was changed; the only edits are proof bodies plus one added import
(`Mathlib.Analysis.SpecialFunctions.Pow.Deriv`, needed for the derivative of `x ↦ x^p`).
No `axiom`, `sorry`, `admit`, `native_decide`, `opaque` or `unsafe` occurs in the file.

## Per-theorem status

| § | theorem | status |
|---|---------|--------|
| 1 | `base_pos` | PROVED |
| 1 | `kern_eq_exp` | PROVED |
| 1 | `kern_pos` | PROVED |
| 1 | `Lc_pos` | PROVED |
| 1 | `Lc_surj` | PROVED |
| 2 | `mixture_eq_cosh` | PROVED |
| 2 | `mid_le_mixture` | PROVED |
| 2 | `mid_lt_mixture` | PROVED |
| 3 | `burr2_not_closed_under_mixture` | PROVED |
| 4 | `cosh_sub_one_le` | PROVED |
| 4 | `mixture_rel_error_le` | PROVED |
| 4 | `mixture_aggregate_le` | PROVED |
| 5 | `burr2_not_closed_under_mixture_scale` | PROVED (stretch target) |

Nothing was found to be false; no `sorry` remains, so there is no OPEN or FALSE entry.

## `#print axioms`

Every proved theorem reports exactly

```
'Burr2Mix.base_pos'                            depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.kern_eq_exp'                         depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.kern_pos'                            depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.Lc_pos'                              depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.Lc_surj'                             depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.mixture_eq_cosh'                     depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.mid_le_mixture'                      depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.mid_lt_mixture'                      depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.burr2_not_closed_under_mixture'      depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.cosh_sub_one_le'                     depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.mixture_rel_error_le'                depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.mixture_aggregate_le'                depends on axioms: [propext, Classical.choice, Quot.sound]
'Burr2Mix.burr2_not_closed_under_mixture_scale' depends on axioms: [propext, Classical.choice, Quot.sound]
```

i.e. a subset of `{propext, Classical.choice, Quot.sound}`.

## Notes on the proofs

* §1–§4 follow the routes given in the task header. `cosh_sub_one_le` was closed without the
  `sinh y ≤ y cosh y` step: the claim is equivalent to `cosh x · (1 - x²/2) ≤ 1`, which follows
  from `Real.cosh_le_exp_half_sq` together with `exp(t)(1-t) ≤ 1` (from `Real.add_one_le_exp`
  at `-t`), and is trivial when `x²/2 > 1`.
* §3 is exactly the intended certificate: `Lc_surj` turns the pointwise identity in `v` into
  `cosh (δ l) = exp (β l)` for all `l > 0`; evaluating at `l = 1, 2` and using
  `cosh (2y) = 2 cosh²y - 1` gives `cosh δ = 1`, hence `δ = 0`, contradicting `γ₁ ≠ γ₂`.
* §5 was proved by a route that avoids both limits and the strict-convexity step. In the
  coordinate `t = v^a` with `b = s^(-a)` and `c = (γ+1)/a > 0`, the members are
  `t ↦ (1 + b t)^(-c)`. Differentiating the assumed identity twice on the open half-line (its
  derivatives are determined there because the functions agree on a neighbourhood of each
  point) gives, at `t = 1` and with `A = (1+b)^(-c) > 0`, `x = b/(1+b)`:

  ```
  A₁/2 + A₂/2 = A',   (A₁/2)x₁ + (A₂/2)x₂ = A' X,   (A₁/2)x₁² + (A₂/2)x₂² = A' X².
  ```

  These say that the zeroth, first and second moments of a two-atom positive measure are those
  of a single atom; the Cauchy–Schwarz equality identity
  `(p₁+p₂)(p₁x₁²+p₂x₂²) - (p₁x₁+p₂x₂)² = p₁p₂(x₁-x₂)²` then forces `x₁ = x₂`, i.e. `b₁ = b₂`,
  i.e. `s₁ = s₂` — contradicting `s₁ ≠ s₂`. The auxiliary lemmas
  (`hasDerivAt_affine_rpow`, `deriv_eq_of_eqOn`, `cs_equality`, `scale_mixture_forces_eq`)
  are `private` and appear just before the theorem.
* Two `unused variable ha` linter warnings remain, in `base_pos` and `Lc_pos`: those proofs do
  not need `0 < a`. The hypotheses were left in place because the statements must not change.

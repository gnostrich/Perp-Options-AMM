# Summary of changes for run e95f6377-2071-4d76-9b43-94f29b591082
All 13 `sorry`s in `BURR2_MIXTURE.lean` are now proved, including the §5 stretch target. The file builds cleanly (`lake build`, module `BURR2_MIXTURE`) and contains no `sorry`/`admit`/`axiom`/`native_decide`/`opaque`/`unsafe` (the only remaining occurrences of the word "sorry" are inside your original header comments).

CONSTRAINT COMPLIANCE: no theorem statement, hypothesis, or `def` body was touched — `git diff` against the initial commit removes only the thirteen `... := by sorry` proof stubs and adds proof bodies, four `private` helper lemmas for §5, and one import line (`Mathlib.Analysis.SpecialFunctions.Pow.Deriv`, needed for the derivative of `x ↦ x^p`).

PER-THEOREM STATUS — all PROVED, none FALSE, none OPEN:
§1 `base_pos`, `kern_eq_exp`, `kern_pos`, `Lc_pos`, `Lc_surj`; §2 `mixture_eq_cosh`, `mid_le_mixture`, `mid_lt_mixture`; §3 `burr2_not_closed_under_mixture`; §4 `cosh_sub_one_le`, `mixture_rel_error_le`, `mixture_aggregate_le`; §5 `burr2_not_closed_under_mixture_scale`.

`#print axioms` for every one of these thirteen theorems reports exactly `[propext, Classical.choice, Quot.sound]` — a subset of the permitted set. The full listing is recorded in `REPORT.md`.

PROOF NOTES:
- §1–§4 follow your suggested routes. One deviation: `cosh_sub_one_le` avoids the `sinh y ≤ y cosh y` step — the claim is equivalent to `cosh x · (1 − x²/2) ≤ 1`, which follows from `Real.cosh_le_exp_half_sq` together with `exp t · (1 − t) ≤ 1` (from `Real.add_one_le_exp` at `−t`), and is trivial when `x²/2 > 1`.
- §3 is exactly the intended certificate: `Lc_surj` converts the assumed identity into `cosh(δl) = exp(βl)` for all `l > 0`; evaluating at `l = 1, 2` with `cosh 2y = 2cosh²y − 1` gives `cosh δ = 1`, hence `δ = 0`, contradicting `γ₁ ≠ γ₂`.
- §5 came out, by a route that needs neither of the two limits nor the strict-convexity step. In `t = v^a` with `b = s^(−a)`, `c = (γ+1)/a > 0`, members are `t ↦ (1 + b t)^(−c)`. Differentiating the assumed identity twice on `(0,∞)` (legitimate since the two sides agree on a neighbourhood of each point) and evaluating at `t = 1` exhibits the zeroth, first and second moments of a two-atom positive measure (weights `A_i/2 = (1+b_i)^(−c)/2`, atoms `x_i = b_i/(1+b_i)`) as those of a single atom. The Cauchy–Schwarz equality identity `(p₁+p₂)(p₁x₁²+p₂x₂²) − (p₁x₁+p₂x₂)² = p₁p₂(x₁−x₂)²` then forces `x₁ = x₂`, i.e. `b₁ = b₂`, i.e. `s₁ = s₂` — contradicting `s₁ ≠ s₂`.
- Two `unused variable ha` linter warnings remain (in `base_pos` and `Lc_pos`): those proofs do not need `0 < a`, but the hypotheses were left untouched as required.

`REPORT.md` in the project root contains the same per-theorem table, the `#print axioms` output, and the proof notes.
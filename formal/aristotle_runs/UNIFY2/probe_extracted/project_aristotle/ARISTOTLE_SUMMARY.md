# Summary of changes for run 93bbc758-6867-4481-a9ed-4a9c26eddcb0
## Completed: UNIFY2 Stage-0 Capability Probe

### Proofs
Both theorems compile without `sorry`, `admit`, `native_decide`, or non-standard axioms:

- **`Probe.ghKernel_pos`** — proved via `positivity`
  - Axioms: `[propext, Classical.choice, Quot.sound]` ✅
- **`Probe.ghKernel_measurable`** — proved via `Measurable.exp (by fun_prop)`
  - Axioms: `[propext, Classical.choice, Quot.sound]` ✅

### Capability Inventory (A)–(E) — detailed in `ARISTOTLE_SUMMARY.md`

| Capability | Status |
|---|---|
| **(A) Bessel-K `K_ν`** | ❌ **NOT in Mathlib v4.28.0** — no declaration found. Must carry as hypothesis. |
| **(B) GH kernel integrability** | ⚠️ No direct lemma. Proof path exists via comparison to `integrable_exp_neg_mul_sq` and `Integrable.mono`. Requires ~50–100 lines of custom proof. |
| **(C) Density → ProbabilityMeasure** | ✅ `Measure.withDensity` + `withDensity_apply` + `setLIntegral_univ` → 3-line `IsProbabilityMeasure` proof. `HasPDF` class also available. |
| **(D) MGF/CGF + derivatives** | ✅ `ProbabilityTheory.mgf`, `cgf`, `hasDerivAt_mgf`, `deriv_mgf`, `deriv_cgf`, `iteratedDeriv_mgf`, `deriv_mgf_zero` (= mean), `iteratedDeriv_mgf_zero` (= n-th moment). `deriv² cgf = variance` is NOT a named lemma but provable from these. |
| **(E) Differentiation under ∫** | ✅ `hasDerivAt_integral_of_dominated_loc_of_deriv_le` and `hasDerivAt_integral_of_dominated_loc_of_lip` in `Mathlib.Analysis.Calculus.ParametricIntegral`. |

**Bottom line:** The GH unification theorem **cannot be fully GROUNDED** due to the absent Bessel-K. Recommended approach: HYBRID — ground everything except the normalizing constant, which is carried as a named hypothesis. The MGF/CGF/derivative machinery is complete and directly usable.

See `ARISTOTLE_SUMMARY.md` for the full detailed report with declaration signatures.

# UNIFY2 Stage-0 Capability Probe — Mathlib v4.28.0 GH Special-Function Inventory

## Proof Results

### `Probe.ghKernel_pos`
**Status:** ✅ PROVED (no sorry, no native_decide, no unsafe axioms)

```
#print axioms Probe.ghKernel_pos
-- 'Probe.ghKernel_pos' depends on axioms: [propext, Classical.choice, Quot.sound]
```

Proof: `unfold ghKernel; positivity`

### `Probe.ghKernel_measurable`
**Status:** ✅ PROVED (no sorry, no native_decide, no unsafe axioms)

```
#print axioms Probe.ghKernel_measurable
-- 'Probe.ghKernel_measurable' depends on axioms: [propext, Classical.choice, Quot.sound]
```

Proof: `exact Measurable.exp (by fun_prop)`

---

## Capability Inventory (A)–(E)

### (A) Modified Bessel Function of the Second Kind K_ν

**NOT in Mathlib v4.28.0.**

There is no declaration `Real.besselK`, `Complex.besselK`, or anything under
`Mathlib.Analysis.SpecialFunctions.Bessel*`. No Bessel function of any kind (first kind,
second kind, modified or otherwise) exists in Mathlib v4.28.0. A search for any identifier
containing "bessel" or "Bessel" returns zero results.

**Implication:** The GH normalizing constant `K_λ(δ√(α²−β²))` must be carried as a named
hypothesis (e.g., `(normConst : ℝ) (hnorm : normConst > 0) (hnorm_eq : normConst * ∫ ... = 1)`)
rather than computed from a Mathlib-provided Bessel-K definition.

### (B) Integrability of `exp(−a·√(δ²+v²) + b·v)` over ℝ for `a > |b|`

**No direct lemma exists.** However, a reasonable proof path is available via:

1. **Comparison to `exp(−c|v|)`**: For `a > |b|`, the kernel satisfies
   `exp(−a·√(δ²+v²) + b·v) ≤ C·exp(−(a−|b|)·|v|)` for some constant `C > 0`.
   Mathlib has the Gaussian integrability result:
   - `integrable_exp_neg_mul_sq` in `Mathlib.Analysis.SpecialFunctions.Gaussian.GaussianIntegral`
   
   but not a direct `integrable_exp_neg_mul_abs` lemma.

2. **General integrability machinery** is well-developed:
   - `MeasureTheory.Integrable` — the main integrability predicate
   - `Integrable.mono` — comparison/domination principle
   - `integrable_exp_mul_of_le`, `integrable_exp_mul_of_le_of_le` in
     `Mathlib.Probability.Moments.Basic` and `Mathlib.Probability.Moments.IntegrableExpMul`
     (but these are for random variables on probability spaces, not for Lebesgue integrability
     of explicit functions on ℝ).

3. **Recommended approach**: Prove a custom `Integrable` lemma by bounding the GH kernel
   by `C * exp(−c·v²)` (or `C * exp(−c·|v|)`) and using `integrable_exp_neg_mul_sq` or
   by direct epsilon-delta arguments with `MeasureTheory.Integrable` and
   `MeasureTheory.Measure.integrableOn_Iic`/`integrableOn_Ici`. This is feasible but
   requires ~50–100 lines of custom proof.

### (C) Probability-Measure-from-Density Machinery

**Available and reasonably complete.** The cleanest path is:

1. **`MeasureTheory.Measure.withDensity`**
   (`Mathlib.MeasureTheory.Measure.MeasureSpace`):
   ```
   Measure.withDensity : Measure α → (α → ENNReal) → Measure α
   ```
   Given a base measure `μ` and a density `f : α → ℝ≥0∞`, constructs the measure `f dμ`.

2. **`IsProbabilityMeasure` from integral-equals-one**: There is no single named lemma
   `isProbabilityMeasure_withDensity`, but the proof is a 3-liner:
   ```lean
   constructor
   rw [withDensity_apply _ MeasurableSet.univ, MeasureTheory.setLIntegral_univ]
   exact hf  -- where hf : ∫⁻ x, f x ∂μ = 1
   ```
   Key helpers: `withDensity_apply` (in `Mathlib.MeasureTheory.Measure.WithDensity`),
   `MeasureTheory.setLIntegral_univ`.

3. **`MeasureTheory.HasPDF`** (`Mathlib.Probability.Density`):
   A typeclass asserting that a random variable `X : Ω → E` has a PDF w.r.t. a reference
   measure. Provides `HasPDF.pdf`, `HasPDF.absolutelyContinuous`, etc.

4. **`MeasureTheory.pdf`** and related API for extracting and reasoning about densities.

### (D) MGF / Cumulant Generating Function

**Both `mgf` and `cgf` exist, with derivative-equals-moment lemmas.**

All in `Mathlib.Probability.Moments.Basic` and `Mathlib.Probability.Moments.MGFAnalytic`:

| Declaration | Signature (abbreviated) |
|---|---|
| `ProbabilityTheory.mgf` | `(Ω → ℝ) → Measure Ω → ℝ → ℝ` — defined as `mgf X μ t = ∫ ω, exp(t * X ω) ∂μ` |
| `ProbabilityTheory.cgf` | `(Ω → ℝ) → Measure Ω → ℝ → ℝ` — defined as `cgf X μ t = log(mgf X μ t)` |
| `ProbabilityTheory.hasDerivAt_mgf` | `t ∈ interior (integrableExpSet X μ) → HasDerivAt (mgf X μ) (∫ ω, X ω * exp(t * X ω) ∂μ) t` |
| `ProbabilityTheory.deriv_mgf` | `t ∈ interior (integrableExpSet X μ) → deriv (mgf X μ) t = ∫ ω, X ω * exp(t * X ω) ∂μ` |
| `ProbabilityTheory.deriv_cgf` | `v ∈ interior (integrableExpSet X μ) → deriv (cgf X μ) v = (∫ ω, X ω * exp(v * X ω) ∂μ) / mgf X μ v` |
| `ProbabilityTheory.iteratedDeriv_mgf` | `t ∈ interior (integrableExpSet X μ) → ∀ n, iteratedDeriv n (mgf X μ) t = ∫ ω, X ω ^ n * exp(t * X ω) ∂μ` |
| `ProbabilityTheory.deriv_mgf_zero` | `0 ∈ interior (integrableExpSet X μ) → deriv (mgf X μ) 0 = ∫ ω, X ω ∂μ` (= mean) |
| `ProbabilityTheory.deriv_cgf_zero` | `0 ∈ interior (integrableExpSet X μ) → deriv (cgf X μ) 0 = (∫ ω, X ω ∂μ) / μ.real univ` |
| `ProbabilityTheory.iteratedDeriv_mgf_zero` | `0 ∈ interior ... → ∀ n, iteratedDeriv n (mgf X μ) 0 = ∫ ω, (X ^ n) ω ∂μ` (= n-th moment) |

**What is missing for the Bregman/exp-family identity:**
- `deriv² cgf = variance` is NOT a named lemma. You would need to prove it from `iteratedDeriv_mgf`
  at n=2 and the definition of variance. This is feasible but not off-the-shelf.
- The connection `cgf` → cumulants → exponential family natural parameters is not formalized.

### (E) Differentiating Under the Integral Sign

**Available.** Two main lemmas in `Mathlib.Analysis.Calculus.ParametricIntegral`:

1. **`hasDerivAt_integral_of_dominated_loc_of_deriv_le`**:
   Given `F : 𝕜 → α → E` with a dominating bound on `‖F' x a‖ ≤ bound a`, concludes
   `HasDerivAt (fun x ↦ ∫ a, F x a ∂μ) (∫ a, F' x₀ a ∂μ) x₀`.
   
2. **`hasDerivAt_integral_of_dominated_loc_of_lip`**:
   A variant using Lipschitz-on-with conditions instead of pointwise derivative bounds.

Additionally, in `Mathlib.Probability.Moments.MGFAnalytic`:

3. **`hasDerivAt_integral_pow_mul_exp_real`**: Specialized to `∫ x^n * exp(t*x)`.
4. **`hasDerivAt_integral_pow_mul_exp`**: Complex-valued variant.

These are exactly what is needed for proving MGF/CGF differentiability and the
derivative-equals-moment identities.

---

## Summary & Recommendation

| Capability | Status | Verdict |
|---|---|---|
| (A) Bessel-K `K_ν` | ❌ NOT in Mathlib | Must CARRY as hypothesis |
| (B) GH kernel integrability | ⚠️ No direct lemma; proof path exists via comparison | Requires ~50–100 lines custom proof |
| (C) Density → ProbMeasure | ✅ `withDensity` + 3-line `IsProbabilityMeasure` proof | GROUNDED |
| (D) MGF/CGF + derivative=moment | ✅ `mgf`, `cgf`, `deriv_mgf`, `iteratedDeriv_mgf`, etc. | GROUNDED |
| (E) Differentiation under ∫ | ✅ `hasDerivAt_integral_of_dominated_loc_of_deriv_le` | GROUNDED |

**Bottom line:** The GH-as-exponential-family unification theorem **cannot be fully GROUNDED**
because the Bessel-K normalizing constant is absent from Mathlib v4.28.0. The recommended
approach is a **HYBRID**: ground everything except the Bessel-K normalization, which must be
carried as named hypotheses (e.g., existence of a positive normalizing constant making the
density integrate to 1). The MGF/CGF/derivative machinery is surprisingly complete and can
be used directly. The integrability of the GH kernel requires custom work but is feasible.

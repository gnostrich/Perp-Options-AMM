# UNIFY2 Stage-0 capability probe — Mathlib v4.28.0 GH special-function inventory

Toolchain: Lean 4.28.0 + Mathlib v4.28.0 (matches `lean-toolchain` / lakefile `rev = v4.28.0`).

## Goal
Determine, by actually compiling, what Mathlib v4.28.0 provides for formalizing the
generalized-hyperbolic (GH) density as a genuine probability law and its cumulant generating
function. This decides whether the GH-as-exponential-family unification theorem can be GROUNDED
(real Lean over the real GH objects) or must CARRY named hypotheses.

The GH kernel here is `ghKernel αh βh δ v = exp(−αh·√(δ²+v²) + βh·v)` (this is the unnormalized GH
density up to the Bessel-K normalizing constant; αh=γ+1, βh=1, δ=0.08 in our instance).

## Tasks
1. Prove `Probe.ghKernel_measurable` (the kernel is measurable). Use the real Mathlib API.
2. In `ARISTOTLE_SUMMARY.md` (or a clearly-labelled comment block in the returned .lean), REPORT
   the following capability findings precisely — name the actual declarations if they exist, or
   state "NOT in Mathlib v4.28.0" if they do not:
   - (A) **Modified Bessel function of the second kind** `K_ν` (Bessel-K): does Mathlib have it?
     Name the declaration (e.g. `Real.besselK`, `Complex.besselK`, anything in
     `Mathlib.Analysis.SpecialFunctions.Bessel*`). If absent, say so.
   - (B) **Integrability of `exp(−a·√(δ²+v²) + b·v)` over ℝ** for `a > |b|`: is there a lemma or
     a reasonable proof path (e.g. via `MeasureTheory.Integrable`, comparison to `exp(−c|v|)`,
     `integrable_exp_neg_mul`-style results)? Name what is available.
   - (C) **Probability-measure-from-density** machinery: `MeasureTheory.pdf.IsUniform` /
     `Measure.withDensity` / `ProbabilityMeasure` / `HasPDF` — what is the cleanest path to assert
     "f≥0 and ∫f=1 ⇒ withDensity is a probability measure"? Name the declarations.
   - (D) **MGF / cumulant generating function**: `MeasureTheory.mgf`, `cgf`, and the facts
     `deriv (cgf) = mean`, `deriv^2 (cgf) = variance` (the exp-family/Bregman identity). Does
     Mathlib v4.28.0 have `mgf`/`cgf` and their derivative=moment lemmas? Name them
     (e.g. `MeasureTheory.mgf`, `ProbabilityTheory.cgf`, `iteratedDeriv_mgf`, etc.).
   - (E) **Differentiating under the integral sign** (`hasDerivAt_integral_of_dominated...`):
     available for proving `deriv (∫ f_s) = ∫ ∂_s f_s`? Name it.

## Output spec
- The returned project must compile server-side (Lean 4.28.0 / Mathlib v4.28.0).
- No `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`/new `axiom` in the final proof of
  `ghKernel_measurable`. If `ghKernel_measurable` genuinely cannot be closed, leave the `sorry` and
  SAY SO explicitly in the summary (a `still-open` is acceptable for a probe).
- Report `#print axioms Probe.ghKernel_measurable` and `#print axioms Probe.ghKernel_pos`.
- The capability inventory (A)–(E) is the PRIMARY deliverable — be precise with declaration names.

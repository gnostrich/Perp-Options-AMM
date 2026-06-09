/-
  CLOSEOUT item 1 — HARDEN `cgf_convexOn`: remove the two live SEARCH tactics from the RUN-4
  UNIFY2 proof and close with CONCRETE named Mathlib lemmas.

  In the accepted RUN-4 proof of `cgf_convexOn` two search tactics were left live:
    (a) `exact?`            proving `Convex ℝ (integrableExpSet X μ)`
    (b) `grind +suggestions` proving `AnalyticAt ℝ (cgf X μ) t` on the interior
  Both compiled server-side but are FRAGILE (search tactics are not a clean proof).

  TASK: prove `cgf_convexOn` below WITHOUT any of `exact?`, `apply?`, `grind`, `grind +suggestions`,
  `aesop?`, `simp?`, `hint`, `decide`-search.  Replace (a) with the concrete Mathlib lemma that
  `integrableExpSet X μ` is convex (it IS a convex set in Mathlib — find the actual lemma, e.g.
  `ProbabilityTheory.convex_integrableExpSet` or the current name), and (b) with the concrete
  `analyticOnNhd`/`AnalyticAt (cgf X μ)` lemma on the interior of `integrableExpSet` (the same
  family as `analyticAt_cgf` already used in `cgf_deriv_mean_and_variance`).

  The variance core `deriv²(cgf) = ∫ (X − mean)² exp / mgf ≥ 0` is already clean and MUST be kept
  (do not weaken it).  Do NOT change the statement of `cgf_convexOn`.

  Toolchain: Lean 4.28.0 + Mathlib v4.28.0.
-/
import Mathlib

open Real MeasureTheory ProbabilityTheory
open scoped ENNReal

noncomputable section
namespace CgfClean

variable {Ω : Type*} [MeasurableSpace Ω]

/-- A1 derivative identity (clean already; reproduced as a dependency for the convexity proof). -/
theorem cgf_deriv_mean_and_variance
    (X : Ω → ℝ) (μ : Measure Ω) [IsProbabilityMeasure μ] (t : ℝ)
    (h : t ∈ interior (integrableExpSet X μ)) :
    HasDerivAt (cgf X μ) (μ[fun ω => X ω * Real.exp (t * X ω)] / mgf X μ t) t := by
  convert ( analyticAt_cgf h ).differentiableAt.hasDerivAt using 1
  rw [ eq_comm, ProbabilityTheory.deriv_cgf ]
  exact h

/-- HARDEN TARGET — `cgf` is convex on the interior of its integrable-exponent domain.
    The two search tactics of the RUN-4 proof are to be replaced with CONCRETE lemmas.
    Statement is UNCHANGED from RUN-4. -/
theorem cgf_convexOn (X : Ω → ℝ) (μ : Measure Ω) [IsProbabilityMeasure μ] :
    ConvexOn ℝ (interior (integrableExpSet X μ)) (cgf X μ) := by
  apply convexOn_of_deriv2_nonneg'
    -- (a) interior of integrableExpSet is convex — CONCRETE lemma, NO `exact?`:
    (convex_integrableExpSet.interior)
    -- differentiability of cgf on the interior (already concrete via cgf_deriv_mean_and_variance):
    (by
      intro t ht
      exact DifferentiableAt.differentiableWithinAt
        (cgf_deriv_mean_and_variance X μ t ht |>.differentiableAt))
    -- (b) differentiability of deriv (cgf) on the interior — CONCRETE analyticity, NO `grind`:
    (by
      intro t ht
      exact DifferentiableAt.differentiableWithinAt
        ((analyticAt_cgf ht).deriv.differentiableAt))
  -- the variance core (CLEAN, keep):
  intro t ht
  have h_second_deriv :
      deriv^[2] (cgf X μ) t
        = ∫ ω, (X ω - deriv (cgf X μ) t) ^ 2 * Real.exp (t * X ω) / mgf X μ t ∂μ := by
    have := @ProbabilityTheory.iteratedDeriv_two_cgf_eq_integral Ω _ X μ
    rw [ MeasureTheory.integral_div, ← this ht, iteratedDeriv_succ' ] ; aesop
  exact h_second_deriv.symm ▸ MeasureTheory.integral_nonneg fun ω =>
    div_nonneg (mul_nonneg (sq_nonneg _) (Real.exp_nonneg _))
      (MeasureTheory.integral_nonneg fun _ => Real.exp_nonneg _)

end CgfClean

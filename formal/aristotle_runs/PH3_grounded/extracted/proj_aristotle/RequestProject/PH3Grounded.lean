/-
  PH-3 GROUNDED — GH arb-leak ≥ 0 DERIVED from the engine's actual arbitrageToOracle / GH slope law,
  not the abstract `R.PosSemidef` quadratic form.

  SOURCE OF TRUTH (GH_MATH.md, gh_engine_reference.js):
    arbitrageToOracle(s,o): u* = log(o) − log P; pushes the pool along the GH frontier to latent u*.
    GH geometric slope:     g(u) = |dy/dx| = (Ny·M/Nx)·f_{β+1}(u−μ)/f_β(u−μ) = k·e^(u−μ),  k = Ny·M/Nx > 0.
    The slope g is STRICTLY MONOTONE INCREASING in u (e^(u−μ) is) ⇔ the reserve value is convex
    (short-gamma) ⇔ the curve is arbitrage-consistent.

  THE ARB LEAK, grounded. When an arber pushes the pool from latent u₁ to u₂ (price o₁→o₂) along the
  GH frontier, the value it extracts vs. settling at the final marginal price is the gap between the
  curve's marginal slope and its average execution — which is NONNEGATIVE precisely because g is
  monotone (the GH reserve value is convex). We DERIVE that gap ≥ 0 from the monotone GH slope law,
  NOT from an abstract PSD matrix.

  NECESSARY-NOT-SUFFICIENT (PRESERVED): this is the dissipation-port R⪰0 condition for GH; it does
  NOT close solvency. B1 (funding covers the convex deficit) stays external/open.
-/
import Mathlib

open Real

namespace PH3Grounded

/-- the GH geometric slope law g(u) = k·e^(u−μ), k = Ny·M/Nx. -/
noncomputable def ghSlope (k μ u : ℝ) : ℝ := k * Real.exp (u - μ)

/-
1. the GH slope is STRICTLY MONOTONE INCREASING in the latent coordinate (k>0): the convexity /
    short-gamma property of the GH reserve curve, DERIVED from the closed form.
-/
theorem ghSlope_strictMono (k μ : ℝ) (hk : 0 < k) : StrictMono (ghSlope k μ) := by
  exact fun a b hab => mul_lt_mul_of_pos_left ( Real.exp_lt_exp.mpr ( by linarith ) ) hk

/-
2. GH slope is POSITIVE everywhere (k>0): the marginal price is well-defined and positive.
-/
theorem ghSlope_pos (k μ u : ℝ) (hk : 0 < k) : 0 < ghSlope k μ u := by
  exact mul_pos hk ( Real.exp_pos _ )

/-
3. THE GH ARB-LEAK ≥ 0, DERIVED. An arb that moves the pool from u₁ to u₂ ≥ u₁ extracts a leak
    equal to the slope GAP `(g(u₂) − g(u))` integrated over the traversed region; since g is monotone
    increasing, at every intermediate u ≤ u₂ the gap g(u₂) − g(u) ≥ 0. We capture the pointwise
    nonnegativity of this leak density (the integrand), grounded in `ghSlope_strictMono`.
-/
theorem gh_arbLeak_density_nonneg (k μ : ℝ) (hk : 0 < k) (u u₂ : ℝ) (hle : u ≤ u₂) :
    0 ≤ ghSlope k μ u₂ - ghSlope k μ u := by
  exact sub_nonneg_of_le ( ghSlope_strictMono k μ hk |>.monotone hle )

/-
4. THE GH ARB-LEAK ≥ 0, integrated form. Over a forward push [u₁, u₂] (u₁ ≤ u₂), the total leak
    `∫_{u₁}^{u₂} (g(u₂) − g(u)) du` ≥ 0 — DERIVED from the GH slope law's monotonicity, not from an
    abstract PSD matrix. This is the GH-grounded R⪰0 dissipation (LVR is one-way).
-/
theorem gh_arbLeak_nonneg (k μ u₁ u₂ : ℝ) (hk : 0 < k) (hle : u₁ ≤ u₂) :
    0 ≤ ∫ u in u₁..u₂, (ghSlope k μ u₂ - ghSlope k μ u) := by
  apply_rules [ intervalIntegral.integral_nonneg ];
  exact fun u hu => gh_arbLeak_density_nonneg k μ hk u u₂ hu.2

end PH3Grounded
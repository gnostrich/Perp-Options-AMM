/-
  R5 — %-slippage basis-independence (corollary of R3).
  mpGeom=getMP_raw·e^(−μ); the e^(−μ) cancels in the post/pre ratio ⇒ % slippage basis-independent.
  $-basis (reserve-USD) carries the factor and is NOT invariant.
-/
import Mathlib

open Real

namespace Slippage

/-- the basis map: geometric slope = raw price coord · e^(−μ). -/
noncomputable def mpGeom (R μ : ℝ) : ℝ := R * Real.exp (-μ)

theorem mpGeom_def (R μ : ℝ) : mpGeom R μ = R * Real.exp (-μ) := by
  rfl

/-
% slippage is basis-independent: the e^(−μ) cancels in the post/pre ratio.
-/
theorem pct_slippage_basis_independent {R_pre : ℝ} (h : 0 < R_pre) (R_post μ : ℝ) :
    (mpGeom R_post μ) / (mpGeom R_pre μ) = R_post / R_pre := by
  unfold mpGeom; ring_nf; norm_num [ Real.exp_ne_zero ] ;

/-
contrast: the $-basis carries the e^(−μ) factor — invariant only at μ=0.
-/
theorem dollar_basis_carries_factor {R : ℝ} (hR : 0 < R) (μ : ℝ) :
    mpGeom R μ = R ↔ μ = 0 := by
  unfold mpGeom;
  norm_num [ hR.ne' ]

end Slippage
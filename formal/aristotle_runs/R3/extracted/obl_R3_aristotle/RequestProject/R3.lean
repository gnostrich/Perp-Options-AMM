/-
  R3 — mpGeom coordinate pin (TIER 1).
  getMP_raw is a PRICE COORDINATE, not the slope. The geometric marginal (true slope)
  is mpGeom = getMP_raw · e^(−μ), so getMP_raw / slope = e^μ exactly.
  This pins the coordinate map; slope vars in PH-2/PH-3 must use mpGeom, not the raw price coord.
-/
import Mathlib

namespace TemporalCoord

/-- the geometric marginal (true reserve slope |dy/dx|): raw price coord times e^(−μ). -/
noncomputable def mpGeom (R μ : ℝ) : ℝ := R * Real.exp (-μ)

/-- definitional pin. -/
theorem mpGeom_def_eq (R μ : ℝ) : mpGeom R μ = R * Real.exp (-μ) := by
  rfl

/-- the slope is positive whenever the raw price coordinate is positive. -/
theorem slope_pos {R : ℝ} (hR : 0 < R) (μ : ℝ) : 0 < mpGeom R μ := by
  unfold mpGeom
  exact mul_pos hR (Real.exp_pos _)

/-- THE pin: getMP_raw / slope = e^μ exactly (the e^μ basis factor). -/
theorem getMP_raw_over_slope {R : ℝ} (hR : 0 < R) (μ : ℝ) :
    R / mpGeom R μ = Real.exp μ := by
  unfold mpGeom
  rw [div_mul_eq_div_div, div_self (ne_of_gt hR), one_div, Real.exp_neg, inv_inv]

end TemporalCoord

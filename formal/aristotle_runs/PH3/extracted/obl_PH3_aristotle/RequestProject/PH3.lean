/-
  PH-3 — R⪰0 dissipation PSD (arb_nonneg structurally).
  arbLeak = vᵀRv, R⪰0 ⇒ arbLeak ≥ 0. Scalar slope-deviation form R*v²≥0 (R≥0); general PSD vᵀRv≥0.
  NECESSARY-not-sufficient: this is the funding-port necessary condition; it does NOT close solvency (B1).
-/
import Mathlib

namespace PH3

/-
scalar slope-deviation dissipation is nonnegative when the resistance R ≥ 0.
-/
theorem arbLeak_nonneg_scalar {R : ℝ} (hR : 0 ≤ R) (v : ℝ) : 0 ≤ R * v^2 := by
  positivity

/-
general PSD: the quadratic form of a real positive-semidefinite matrix is nonnegative.
-/
theorem quadForm_nonneg_of_posSemidef {n : ℕ} {R : Matrix (Fin n) (Fin n) ℝ}
    (hR : R.PosSemidef) (v : Fin n → ℝ) :
    0 ≤ ∑ i, ∑ j, v i * R i j * v j := by
  have := hR.2;
  convert this ( Finsupp.equivFunOnFinite.symm v ) using 1 ; simp +decide [ Finsupp.sum_fintype ]

end PH3
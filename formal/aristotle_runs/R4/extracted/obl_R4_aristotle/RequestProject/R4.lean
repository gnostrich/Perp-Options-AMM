/-
  R4 — directional/orientation lemma (companion to PH-3).
  Per wing sign(K−oracle)==sign(funding ±2)==sign(d mark/d sNorm): CALL all +, PUT all −.
  CALL mark sNorm/θ increasing (slope +1/θ>0, stamp +2); PUT mark θ/sNorm decreasing (slope −θ/sNorm²<0,
  stamp −2). Funding kept on price-measure basis (θ-swap flips its sign) — not re-expressed in sNorm.
-/
import Mathlib

namespace Orientation

/-
CALL OTM mark strictly increasing in sNorm.
-/
theorem call_mark_mono {θ : ℝ} (hθ : 0 < θ) :
    StrictMonoOn (fun sNorm => sNorm / θ) (Set.Ioi 0) := by
  exact fun x hx y hy hxy => div_lt_div_iff_of_pos_right hθ |>.2 hxy;

/-
CALL slope = 1/θ > 0 (sign +1 = wing stamp +2 sign).
-/
theorem call_mark_slope {θ sNorm : ℝ} (hθ : 0 < θ) :
    HasDerivAt (fun s => s / θ) (1/θ) sNorm ∧ 0 < 1/θ := by
  exact ⟨ by simpa using hasDerivAt_id sNorm |> HasDerivAt.div_const <| θ, by positivity ⟩

/-
PUT OTM mark strictly decreasing in sNorm.
-/
theorem put_mark_anti {θ : ℝ} (hθ : 0 < θ) :
    StrictAntiOn (fun sNorm => θ / sNorm) (Set.Ioi 0) := by
  exact fun x hx y hy hxy => mul_lt_mul_of_pos_left ( inv_strictAnti₀ hx hxy ) hθ

/-
PUT slope = −θ/sNorm² < 0 (sign −1 = wing stamp −2 sign).
-/
theorem put_mark_slope {θ sNorm : ℝ} (hθ : 0 < θ) (hs : 0 < sNorm) :
    HasDerivAt (fun s => θ / s) (-θ/sNorm^2) sNorm ∧ -θ/sNorm^2 < 0 := by
  exact ⟨ by simpa [ div_eq_mul_inv ] using HasDerivAt.const_mul θ ( hasDerivAt_inv hs.ne' ), div_neg_of_neg_of_pos ( neg_neg_of_pos hθ ) ( sq_pos_of_pos hs ) ⟩

/-
the two wing signs are opposite and each matches its ±2 stamp halved.
-/
theorem wing_signs_oppose :
    (1:ℝ) = (2:ℝ)/2 ∧ (-1:ℝ) = (-2:ℝ)/2 ∧ (1:ℝ) = -(-1:ℝ) := by
  norm_num

end Orientation
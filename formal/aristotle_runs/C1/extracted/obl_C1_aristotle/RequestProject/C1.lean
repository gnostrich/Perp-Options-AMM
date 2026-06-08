/-
  C1 — composite-ray shortcut extends to ITM via effective-strike substitution.
  Identity: m(θ*)·2sinh(δ) = m(lo)−m(hi), θ*=√(lo·hi), δ=½log(hi/lo), m θ=C/θ. Form-invariant under
  θ↦θ_eff, so it holds verbatim across the OTM→ITM boundary (substitute effective strikes).
-/
import Mathlib

open Real

namespace CompositeRay

/-
composite-ray identity for the 1/θ mark.
-/
theorem compositeRay_identity {C lo hi : ℝ}
    (hC : 0 < C) (hlo : 0 < lo) (hhi : 0 < hi) (hlt : lo < hi) :
    (C / Real.sqrt (lo*hi)) * (2 * Real.sinh ((1/2) * Real.log (hi/lo)))
      = C/lo - C/hi := by
  rw [ show ( 1 / 2 : ℝ ) * Real.log ( hi / lo ) = Real.log ( Real.sqrt ( hi / lo ) ) by rw [ Real.log_sqrt ( by positivity ) ] ; ring, Real.sinh_log ];
  · field_simp;
    rw [ Real.sq_sqrt ( by positivity ), Real.sqrt_mul ( by positivity ), Real.sqrt_div ( by positivity ) ] ; ring;
    grind;
  · positivity

/-
ITM extension: the identity holds for ANY effective strikes (substitution θ↦θ_eff).
-/
theorem compositeRay_ITM_substitution {C loEff hiEff : ℝ}
    (hC : 0 < C) (hlo : 0 < loEff) (hhi : 0 < hiEff) (hlt : loEff < hiEff) :
    (C / Real.sqrt (loEff*hiEff)) * (2 * Real.sinh ((1/2) * Real.log (hiEff/loEff)))
      = C/loEff - C/hiEff := by
  convert compositeRay_identity hC hlo hhi hlt using 1

end CompositeRay
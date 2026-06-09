/-
  R1 / PH-5 — C¹ smooth-pasting at BOTH free boundaries (call + put wings).
  Strike registered in carry coordinate θ=sNorm(K) (v26c). Continuation is a power law in spot S
  that meets the intrinsic payoff in value AND first derivative at the free boundary S*, on both wings.
  γ>1, K>0, S>0. Powers via Real.rpow; slopes via HasDerivAt.
-/
import Mathlib

open Real

namespace SmoothPaste

/-- continuation coefficient, call wing: a = K^γ (γ/(γ+1))^γ / (γ+1). -/
noncomputable def coeffA (K γ : ℝ) : ℝ := K ^ γ * (γ/(γ+1)) ^ γ / (γ+1)
/-- continuation coefficient, put wing: b = K^(−γ) (γ/(γ+1))^γ / (γ+1). -/
noncomputable def coeffB (K γ : ℝ) : ℝ := K ^ (-γ) * (γ/(γ+1)) ^ γ / (γ+1)

/-- call continuation value: a · S^(−γ). -/
noncomputable def Vcont_A (K γ : ℝ) : ℝ → ℝ := fun S => coeffA K γ * S ^ (-γ)
/-- call intrinsic value: 1 − S/K. -/
noncomputable def Vint_A (K : ℝ) : ℝ → ℝ := fun S => 1 - S / K
/-- put continuation value: b · S^(γ). -/
noncomputable def Vcont_B (K γ : ℝ) : ℝ → ℝ := fun S => coeffB K γ * S ^ (γ)
/-- put intrinsic value: 1 − K/S. -/
noncomputable def Vint_B (K : ℝ) : ℝ → ℝ := fun S => 1 - K / S

/-- call free boundary S*_A = Kγ/(γ+1). -/
noncomputable def Sstar_A (K γ : ℝ) : ℝ := K * γ / (γ+1)
/-- put free boundary S*_B = K(γ+1)/γ. -/
noncomputable def Sstar_B (K γ : ℝ) : ℝ := K * (γ+1) / γ

/-
VALUE MATCH, call wing: continuation = intrinsic at S*_A.
-/
theorem valueMatch_A {K γ : ℝ} (hK : 0 < K) (hγ : 1 < γ) :
    Vcont_A K γ (Sstar_A K γ) = Vint_A K (Sstar_A K γ) := by
  unfold Vcont_A Vint_A Sstar_A coeffA;
  rw [ Real.rpow_neg ( by positivity ) ];
  field_simp;
  rw [ ← Real.mul_rpow ( by positivity ) ( by positivity ) ] ; ring

/-
SLOPE MATCH, call wing: both derivatives equal −1/K at S*_A.
-/
theorem slopeMatch_A_cont {K γ : ℝ} (hK : 0 < K) (hγ : 1 < γ) :
    HasDerivAt (Vcont_A K γ) (-1/K) (Sstar_A K γ) := by
  convert HasDerivAt.const_mul _ ( Real.hasDerivAt_rpow_const _ ) using 1;
  · unfold Sstar_A coeffA; ring_nf; norm_num [ hK.ne', hγ.ne' ] ;
    rw [ Real.rpow_sub ( by positivity ), Real.rpow_neg_one ] ; ring;
    field_simp;
    rw [ ← Real.mul_rpow ( by positivity ) ( by positivity ), mul_div_assoc ];
  · exact Or.inl ( by unfold Sstar_A; positivity )

theorem slopeMatch_A_int {K γ : ℝ} (hK : 0 < K) (hγ : 1 < γ) :
    HasDerivAt (Vint_A K) (-1/K) (Sstar_A K γ) := by
  convert HasDerivAt.const_sub 1 ( HasDerivAt.div_const ( hasDerivAt_id ( Sstar_A K γ ) ) K ) using 1 ; ring

/-
VALUE MATCH, put wing: continuation = intrinsic at S*_B.
-/
theorem valueMatch_B {K γ : ℝ} (hK : 0 < K) (hγ : 1 < γ) :
    Vcont_B K γ (Sstar_B K γ) = Vint_B K (Sstar_B K γ) := by
  convert valueMatch_A ( K := K⁻¹ ) ( γ := γ ) ( by positivity ) hγ using 1;
  · unfold Vcont_A Vcont_B Sstar_A Sstar_B coeffA coeffB; ring;
    grind +suggestions;
  · grind +locals

/-
SLOPE MATCH, put wing: both derivatives equal γ²/(K(γ+1)²) at S*_B.
-/
theorem slopeMatch_B_cont {K γ : ℝ} (hK : 0 < K) (hγ : 1 < γ) :
    HasDerivAt (Vcont_B K γ) (γ^2/(K*(γ+1)^2)) (Sstar_B K γ) := by
  convert HasDerivAt.const_mul ( coeffB K γ ) ( hasDerivAt_id ( Sstar_B K γ ) |> HasDerivAt.rpow_const <| _ ) using 1 <;> norm_num [ Sstar_B, coeffB ];
  · rw [ Real.div_rpow ( by positivity ) ( by positivity ) ];
    rw [ Real.rpow_sub_one ( by positivity ), Real.div_rpow ( by positivity ) ( by positivity ) ];
    rw [ Real.mul_rpow ( by positivity ) ( by positivity ) ] ; ring;
    -- Simplifying the right-hand side:
    field_simp
    ring;
    norm_num [ mul_assoc, ← Real.rpow_add hK ] ; ring;
  · exact Or.inl ⟨ ⟨ hK.ne', by positivity ⟩, by positivity ⟩

theorem slopeMatch_B_int {K γ : ℝ} (hK : 0 < K) (hγ : 1 < γ) :
    HasDerivAt (Vint_B K) (γ^2/(K*(γ+1)^2)) (Sstar_B K γ) := by
  convert HasDerivAt.const_sub 1 ( HasDerivAt.const_mul K ( hasDerivAt_inv _ ) ) using 1 <;> norm_num [ Vint_B, Sstar_B ];
  · grind;
  · exact ⟨ ⟨ hK.ne', by positivity ⟩, by positivity ⟩

end SmoothPaste
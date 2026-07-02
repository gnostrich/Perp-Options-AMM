/-
# Aristotle obligation O2 — American faithfulness: `value_ge_intrinsic`

This file is a self-contained MODEL of the PKG-ITM-v2 **design-target** put value object
(bounded re-seamed mark: power continuation arm of exponent −g welded to the LINEAR intrinsic
`(K−S)⁺/K` at `S* = K·g/(g+1)`), stated in the dollar/spot frame, per
`notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md` §0. It is NOT the live engine object
(HEAD `markLensed` ships a power ITM arm in the sNorm frame — the arm that DOES dip below
intrinsic) and NOT the canonical RequestProject modules.
-/
import Mathlib

noncomputable section
open Real

/-- PUT free boundary in the dollar/spot frame: S* = K·g/(g+1). -/
def sStarP (g K : ℝ) : ℝ := K * g / (g + 1)
/-- PUT continuation arm (value as a fraction of the K-dollar escrow): (1/(g+1))·(S/S*)^(−g). -/
def contP (g K S : ℝ) : ℝ := (1 / (g + 1)) * (S / sStarP g K) ^ (-g)
/-- PUT linear intrinsic (fraction of K): 1 − S/K (the (K−S)/K parity line). -/
def intrP (g K S : ℝ) : ℝ := 1 - S / K
/-- the re-seamed bounded PUT value (PKG-ITM v2): linear tail at/below S*, power continuation above. -/
def Vp (g K S : ℝ) : ℝ := if S ≤ sStarP g K then intrP g K S else contP g K S

theorem contP_pos (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) : 0 < contP g K S := by
  exact mul_pos ( by positivity ) ( Real.rpow_pos_of_pos ( by exact div_pos hS ( by exact div_pos ( mul_pos hK hg ) ( by positivity ) ) ) _ )

theorem powArm_tangent_strict (g t : ℝ) (hg : 0 < g) (ht : 0 < t) (hne : t ≠ 1) :
    g + 1 < t ^ (-g) + g * t := by
  rw [ Real.rpow_def_of_pos ht ];
  by_cases h : t = 1 <;> simp_all +decide [ mul_comm ];
  nlinarith [ Real.add_one_lt_exp ( show - ( g * Real.log t ) ≠ 0 from neg_ne_zero.mpr <| mul_ne_zero hg.ne' <| fun H => h <| Real.eq_one_of_pos_of_log_eq_zero ht H ), mul_self_pos.mpr <| sub_ne_zero.mpr h, Real.log_lt_sub_one_of_pos ht h ]

theorem cont_ge_intrinsic (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
    1 - S / K ≤ contP g K S := by
  by_cases h : S = sStarP g K;
  · unfold contP sStarP at *;
    -- Substitute $S = K * g / (g + 1)$ into the inequality.
    rw [h]
    field_simp;
    norm_num;
  · unfold contP sStarP;
    have := powArm_tangent_strict g ( S / ( K * g / ( g + 1 ) ) ) hg ( by positivity ) ?_;
    · field_simp at *;
      linarith;
    · exact fun h' => h <| eq_of_div_eq_one h' ▸ rfl

theorem cont_gt_intrinsic (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S)
    (hne : S ≠ sStarP g K) : 1 - S / K < contP g K S := by
  unfold contP sStarP at *;
  have := ( powArm_tangent_strict g ( S / ( K * g / ( g + 1 ) ) ) hg ( by positivity ) ( by contrapose! hne; rw [ div_eq_iff ( by positivity ) ] at *; nlinarith [ mul_div_cancel₀ ( K * g ) ( by positivity : ( g + 1 ) ≠ 0 ) ] ) ) ; simp_all +decide [ mul_comm, mul_assoc, div_eq_mul_inv ] ;
  field_simp at *;
  grind +qlia

theorem value_ge_intrinsic (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
    max (1 - S / K) 0 ≤ Vp g K S := by
  unfold Vp;
  split_ifs ; simp_all +decide [ sStarP, intrP ];
  · rw [ div_le_iff₀ ] <;> nlinarith [ mul_div_cancel₀ ( K * g ) ( by linarith : ( g + 1 ) ≠ 0 ) ];
  · exact max_le ( cont_ge_intrinsic g K S hg hK hS ) ( le_of_lt ( contP_pos g K S hg hK hS ) )

theorem value_gt_intrinsic_beyond_seam (g K S : ℝ) (hg : 0 < g) (hK : 0 < K)
    (hS : sStarP g K < S) : 1 - S / K < Vp g K S := by
  convert cont_gt_intrinsic g K S hg hK _ _ using 1;
  · exact if_neg hS.not_ge;
  · exact lt_of_le_of_lt ( by exact div_nonneg ( mul_nonneg hK.le hg.le ) ( add_nonneg hg.le zero_le_one ) ) hS;
  · linarith

theorem strict_region_nonempty (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
    ∃ S, sStarP g K < S ∧ S < K ∧ 0 < 1 - S / K ∧ 1 - S / K < Vp g K S := by
  use ( sStarP g K + K ) / 2;
  -- First, show that $sStarP g K < K$.
  have h_sStarP_lt_K : sStarP g K < K := by
    exact div_lt_iff₀ ( by positivity ) |>.2 ( by nlinarith );
  exact ⟨ by linarith, by linarith, by rw [ sub_pos, div_lt_iff₀ ] <;> linarith, value_gt_intrinsic_beyond_seam g K _ hg hK <| by linarith ⟩

#print axioms value_ge_intrinsic
#print axioms cont_gt_intrinsic
#print axioms value_gt_intrinsic_beyond_seam
#print axioms strict_region_nonempty
#print axioms powArm_tangent_strict
/-
# LINEAR re-seam: `paste_value_lin` / `paste_slope_lin` (+ uniqueness)

This file is a self-contained MODEL of the PKG-ITM-v2 **design-target** put value object
(bounded re-seamed mark: power continuation arm of exponent −g welded to the LINEAR intrinsic
`(K−S)⁺/K` at `S* = K·g/(g+1)`), stated in the dollar/spot frame, per
`notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md` §0. It is NOT the live engine object
(HEAD `markLensed` ships a power ITM arm in the sNorm frame) and NOT the canonical RequestProject
modules. The archived LENSKERNEL `valueMatch_g`/`slopeMatch_g` prove the POWER-arm paste in the
sNorm coordinate; THIS is the LINEAR re-seam — a different statement.
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

/-- CALL free boundary: S* = K·(g+1)/g. -/
def sStarC (g K : ℝ) : ℝ := K * (g + 1) / g
/-- CALL continuation arm (value as a fraction of the 1-perp escrow): (1/(g+1))·(S/S*)^(+g). -/
def contC (g K S : ℝ) : ℝ := (1 / (g + 1)) * (S / sStarC g K) ^ g
/-- CALL linear intrinsic (fraction of one perp): 1 − K/S. -/
def intrC (g K S : ℝ) : ℝ := 1 - K / S

theorem sStarP_pos (g K : ℝ) (hg : 0 < g) (hK : 0 < K) : 0 < sStarP g K := by
  exact div_pos ( mul_pos hK hg ) ( add_pos hg zero_lt_one )

theorem sStarP_lt_K (g K : ℝ) (hg : 0 < g) (hK : 0 < K) : sStarP g K < K := by
  exact div_lt_iff₀ ( by positivity ) |>.2 ( by nlinarith )

theorem paste_value_lin (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
    contP g K (sStarP g K) = intrP g K (sStarP g K) := by
  unfold contP intrP sStarP
  rw [div_self (by positivity), Real.one_rpow]
  field_simp
  ring

theorem paste_value_lin_at (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
    contP g K (sStarP g K) = 1 / (g + 1) := by
  unfold contP sStarP;
  rw [ div_self <| by positivity, Real.one_rpow, mul_one ]

theorem intrP_hasDerivAt (g K S : ℝ) (hK : K ≠ 0) :
    HasDerivAt (intrP g K) (-(1 / K)) S := by
  unfold intrP; convert HasDerivAt.sub ( hasDerivAt_const _ _ ) ( HasDerivAt.div_const ( hasDerivAt_id S ) K ) using 1 ; ring;

theorem contP_hasDerivAt (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
    HasDerivAt (contP g K) (-(g * contP g K S / S)) S := by
  convert HasDerivAt.mul ( hasDerivAt_const _ _ ) ( HasDerivAt.rpow ( HasDerivAt.div_const ( hasDerivAt_id' S ) _ ) ( hasDerivAt_const _ _ ) _ ) using 1 <;> norm_num ; ring_nf;
  · unfold contP sStarP; ring_nf;
    rw [ show -1 - g = -g - 1 by ring, Real.rpow_sub_one ( by positivity ) ] ; ring_nf;
    grind;
  · exact div_pos hS ( sStarP_pos g K hg hK )

theorem paste_slope_lin (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
    HasDerivAt (contP g K) (-(1 / K)) (sStarP g K) := by
  convert contP_hasDerivAt g K ( sStarP g K ) hg hK ( sStarP_pos g K hg hK ) using 1 ; norm_num ; ring_nf;
  unfold contP sStarP; ring_nf; norm_num [ hg.ne', hK.ne' ] ;
  norm_num [ mul_assoc, mul_comm g, hg.ne', hK.ne', ne_of_gt ( by positivity : 0 < 1 + g ) ]

theorem Vp_hasDerivAt_seam (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
    HasDerivAt (Vp g K) (-(1 / K)) (sStarP g K) := by
  -- To prove the derivative, we will show that the left-hand derivative equals the right-hand derivative.
  have h_lhs : HasDerivWithinAt (Vp g K) (-(1 / K)) (Set.Iio (sStarP g K)) (sStarP g K) := by
    refine' HasDerivWithinAt.congr_of_eventuallyEq _ _ _;
    exact fun x => 1 - x / K;
    · exact HasDerivAt.hasDerivWithinAt ( by simpa using HasDerivAt.const_sub 1 ( HasDerivAt.div_const ( hasDerivAt_id ( sStarP g K ) ) K ) );
    · filter_upwards [ self_mem_nhdsWithin ] with x hx using if_pos hx.out.le;
    · exact if_pos le_rfl;
  have h_rhs : HasDerivWithinAt (Vp g K) (-(1 / K)) (Set.Ioi (sStarP g K)) (sStarP g K) := by
    have h_rhs : HasDerivWithinAt (contP g K) (-(1 / K)) (Set.Ioi (sStarP g K)) (sStarP g K) := by
      exact HasDerivAt.hasDerivWithinAt ( paste_slope_lin g K hg hK );
    refine' h_rhs.congr_of_eventuallyEq _ _;
    · filter_upwards [ self_mem_nhdsWithin ] with x hx using if_neg hx.out.not_ge;
    · unfold Vp;
      rw [ if_pos le_rfl, paste_value_lin g K hg hK ];
  simp +zetaDelta at *;
  simpa using h_lhs.union h_rhs

theorem contP_A_form (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
    contP g K S = ((sStarP g K) ^ g / (g + 1)) * S ^ (-g) := by
  unfold contP sStarP;
  rw [ Real.div_rpow ( by positivity ) ( by positivity ), Real.rpow_neg ( by positivity ), Real.rpow_neg ( by positivity ) ] ; ring_nf;
  norm_num

theorem powArm_hasDerivAt (A g b : ℝ) (hb : 0 < b) :
    HasDerivAt (fun S => A * S ^ (-g)) (A * (-g) * b ^ (-g - 1)) b := by
  convert HasDerivAt.const_mul A ( Real.hasDerivAt_rpow_const ?_ ) using 1 <;> ring_nf ; aesop

theorem paste_unique (g K A b : ℝ) (hg : 0 < g) (hK : 0 < K) (hb : 0 < b)
    (hval : A * b ^ (-g) = 1 - b / K)
    (hslope : A * (-g) * b ^ (-g - 1) = -(1 / K)) :
    b = sStarP g K ∧ A = (sStarP g K) ^ g / (g + 1) := by
  -- From hslope: A*(-g)*b^(-g-1) = -(1/K). Multiply both sides by b (b>0): A*(-g)*b^(-g-1)*b = -(b/K). Note b^(-g-1)*b = b^(-g-1+1) = b^(-g) by Real.rpow_add (hb) and rpow_one, since (-g-1)+1 = -g. So A*(-g)*b^(-g) = -(b/K), i.e. -g*u = -(b/K), giving g*u = b/K.
  have hbg : g * (1 - b / K) = b / K := by
    simp_all +decide [ Real.rpow_sub hb, Real.rpow_neg hb.le ];
    grind;
  -- From hbg: g*(1 - b/K) = b/K, we get b/K = g/(g+1), so b = K*g/(g+1) = sStarP g K.
  have hb_eq : b = K * g / (g + 1) := by
    grind
  simp_all +decide [ sStarP ];
  rw [ Real.rpow_neg ( by positivity ) ] at hval;
  grind

theorem paste_value_lin_call (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
    contC g K (sStarC g K) = intrC g K (sStarC g K) := by
  unfold contC intrC sStarC;
  field_simp;
  norm_num

theorem paste_slope_lin_call (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
    HasDerivAt (contC g K) (g ^ 2 / (K * (g + 1) ^ 2)) (sStarC g K) ∧
    HasDerivAt (intrC g K) (g ^ 2 / (K * (g + 1) ^ 2)) (sStarC g K) := by
  constructor;
  · convert HasDerivAt.const_mul ( 1 / ( g + 1 ) ) ( HasDerivAt.rpow_const ( HasDerivAt.div_const ( hasDerivAt_id ( sStarC g K ) ) ( sStarC g K ) ) _ ) using 1 <;> norm_num [ sStarC, hg.ne', hK.ne' ] ; ring_nf;
    · field_simp;
      norm_num ; ring;
    · exact Or.inl <| by positivity;
  · convert HasDerivAt.const_sub 1 ( HasDerivAt.const_mul K <| hasDerivAt_inv _ ) using 1 <;> norm_num [ sStarC ] ; ring_nf;
    · grind +qlia;
    · grind

#print axioms paste_value_lin
#print axioms paste_slope_lin
#print axioms Vp_hasDerivAt_seam
#print axioms paste_unique
#print axioms paste_value_lin_call
#print axioms paste_slope_lin_call

end
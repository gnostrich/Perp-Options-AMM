import Mathlib

/-!
# Funding log-slope read of the re-seamed PKG-ITM-v2 put value object

## MODEL DISCLOSURE
This file is a self-contained MODEL of the PKG-ITM-v2 **design-target** put value object
(bounded re-seamed mark: power continuation arm of exponent −g welded to the LINEAR intrinsic
`(K−S)⁺/K` at `S* = K·g/(g+1)`), stated in the dollar/spot frame and in fraction-of-K units, per
`notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md` §0/§4. `lamP` below is the MODEL's
piecewise log-slope read; the theorems tie each branch to the true derivative of the corresponding
arm. This is NOT the live engine funding path (which today continues the OTM formula onto a
different ITM arm, un-designed), NOT an operator-approved funding semantics (that sign-off is
pending and out of scope here), and NOT the canonical RequestProject modules. The call-side
dollar read carries a separate (g+1)/g recalibration — deliberately NOT stated in this batch.
-/

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
/-- the funding log-slope read Λ (fraction-of-K units): tail |∂(1−S/K)/∂ln S| = S/K,
    continuation |∂contP/∂ln S| = g·contP. -/
def lamP (g K S : ℝ) : ℝ := if S ≤ sStarP g K then S / K else g * contP g K S

theorem intrP_hasDerivAt (g K S : ℝ) (hK : K ≠ 0) :
    HasDerivAt (intrP g K) (-(1 / K)) S := by
  unfold intrP; convert HasDerivAt.sub ( hasDerivAt_const _ _ ) ( HasDerivAt.div_const ( hasDerivAt_id S ) K ) using 1 ; ring;

theorem contP_hasDerivAt (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
    HasDerivAt (contP g K) (-(g * contP g K S / S)) S := by
  convert HasDerivAt.mul ( hasDerivAt_const _ _ ) ( HasDerivAt.rpow ( HasDerivAt.div_const ( hasDerivAt_id' S ) _ ) ( hasDerivAt_const _ _ ) _ ) using 1 <;> norm_num [ sStarP, hg.ne', hK.ne', hS.ne' ];
  · unfold contP; ring;
    unfold sStarP; ring;
    rw [ show -g = -1 - g + 1 by ring, Real.rpow_add_one ( by positivity ) ] ; ring;
    grind;
  · positivity

theorem funding_otm_identity (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
    S * -(deriv (contP g K) S) = g * contP g K S := by
  convert congr_arg ( fun x : ℝ => S * -x ) ( contP_hasDerivAt g K S hg hK hS |> HasDerivAt.deriv ) using 1 ; ring;
  norm_num [ hS.ne' ]

theorem lamP_eq_otm_read (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : sStarP g K < S) :
    lamP g K S = S * -(deriv (contP g K) S) := by
  rw [ funding_otm_identity, lamP ];
  · rw [ if_neg hS.not_ge ];
  · grind;
  · positivity;
  · exact lt_of_le_of_lt ( div_nonneg ( mul_nonneg hK.le hg.le ) ( add_nonneg hg.le zero_le_one ) ) hS

theorem funding_tail_delta_carry (g K S : ℝ) (hg : 0 < g) (hK : 0 < K)
    (hS : S ≤ sStarP g K) :
    K * lamP g K S = S ∧ K * (S * -(deriv (intrP g K) S)) = S := by
  unfold lamP; simp +decide [ *, mul_assoc, mul_comm K _, div_eq_mul_inv ] ;
  exact ⟨ by rw [ inv_mul_cancel₀ hK.ne', mul_one ], by rw [ show deriv ( intrP g K ) S = - ( 1 / K ) from HasDerivAt.deriv ( intrP_hasDerivAt g K S hK.ne' ) ] ; ring_nf; norm_num [ hK.ne' ] ⟩

theorem lam_seam_identity (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
    g * contP g K (sStarP g K) = sStarP g K / K := by
  unfold contP sStarP; ring_nf; norm_num [ hg.ne', hK.ne' ] ;
  norm_num [ mul_assoc, mul_comm g, mul_left_comm K, hg.ne', hK.ne', show ( 1 + g ) ≠ 0 by positivity ]

theorem logslope_cont_at_seam (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
    ContinuousAt (lamP g K) (sStarP g K) := by
  have h_cont_contP : Filter.Tendsto (fun S => g * contP g K S) (nhdsWithin (sStarP g K) (Set.Ioi (sStarP g K))) (nhds (sStarP g K / K)) := by
    have h_cont_contP : ContinuousAt (fun S => g * contP g K S) (sStarP g K) := by
      refine' ContinuousAt.mul continuousAt_const ( ContinuousAt.mul continuousAt_const _ );
      convert Filter.Tendsto.rpow ( Filter.tendsto_id.div_const _ ) tendsto_const_nhds _ using 1 ; norm_num [ hg.ne', hK.ne', sStarP ];
      exact Or.inl <| by positivity;
    convert h_cont_contP.tendsto.mono_left inf_le_left using 1;
    exact congr_arg _ ( by rw [ lam_seam_identity g K hg hK ] );
  -- Since $sStarP g K$ is positive, for $S$ approaching $sStarP g K$ from the left, the function $S/K$ is continuous.
  have h_cont_left : Filter.Tendsto (fun S => S / K) (nhdsWithin (sStarP g K) (Set.Iic (sStarP g K))) (nhds (sStarP g K / K)) := by
    exact Filter.Tendsto.div_const ( Filter.tendsto_id.mono_left inf_le_left ) _;
  refine' continuousAt_iff_continuous_left'_right'.mpr _;
  simp_all +decide [ ContinuousWithinAt, lamP ];
  exact ⟨ Filter.Tendsto.congr' ( Filter.eventuallyEq_of_mem self_mem_nhdsWithin fun x hx => by rw [ show lamP g K x = x / K from if_pos hx.out.le ] ) ( h_cont_left.mono_left <| nhdsWithin_mono _ <| Set.Iio_subset_Iic_self ), Filter.Tendsto.congr' ( Filter.eventuallyEq_of_mem self_mem_nhdsWithin fun x hx => by rw [ show lamP g K x = g * contP g K x from if_neg hx.out.not_ge ] ) h_cont_contP ⟩

theorem funding_zero_iff_on_anchor (kappa g N mark Sp : ℝ) (hκ : 0 < kappa) (hg : 0 < g)
    (hN : 0 < N) (hm : 0 < mark) (hSp : 0 < Sp) :
    kappa * g * N * mark * ((Sp - 1) / Sp) = 0 ↔ Sp = 1 := by
  simp +decide [ *, ne_of_gt, sub_eq_zero, mul_eq_zero ]

#print axioms logslope_cont_at_seam
#print axioms funding_otm_identity
#print axioms funding_tail_delta_carry
#print axioms lam_seam_identity
#print axioms funding_zero_iff_on_anchor

end
import Mathlib

namespace WarpCalc

/-- Lens factor read at |v|: Φ_τ(v) = |v|/√(τ²+v²). Mirrors hpTau(|u|) as consumed by gLoc
(HEAD L1631/L1644). -/
noncomputable def PhiA (tau v : ℝ) : ℝ := |v| / Real.sqrt (tau^2 + v^2)

/-- The warp integrand at steepness g, strike theta: the lens factor at the then-current
center 1/g, i.e. at log-distance v = ln(θ·g). -/
noncomputable def warpDen (tau theta g : ℝ) : ℝ := PhiA tau (Real.log (theta * g))

/-- The accumulated warp over a trade taking steepness γ₀ → γ₁ (γ = γ₀ + s·D/β along the trade;
steepness is the path variable). -/
noncomputable def warpInt (tau theta g0 g1 : ℝ) : ℝ := ∫ g in g0..g1, warpDen tau theta g

/-- The per-strike potential F_θ (anchor at steepness 1). -/
noncomputable def warpPot (tau theta g : ℝ) : ℝ := ∫ t in (1:ℝ)..g, warpDen tau theta t

/-- The LIVE lensed exponent at strike θ when steepness is g (center = 1/g exactly, so
u = ln(θ/center) = ln(θ·g)). Equals the engine's gLoc read with everything live. -/
noncomputable def glAt (tau theta g : ℝ) : ℝ := g * warpDen tau theta g

/-- The recentering kernel: d/dv [ |v|/√(τ²+v²) ] = sign(v)·τ²/(τ²+v²)^{3/2}, at v = ln(θg).
Written with √ to avoid rpow: (τ²+v²)^{3/2} = (τ²+v²)·√(τ²+v²). -/
noncomputable def recenterKer (tau theta g : ℝ) : ℝ :=
  Real.sign (Real.log (theta * g)) * tau^2 /
    ((tau^2 + (Real.log (theta * g))^2) * Real.sqrt (tau^2 + (Real.log (theta * g))^2))

/-
Basic: the warp integrand is nonnegative.
-/
theorem warpDen_nonneg (tau theta g : ℝ) : 0 ≤ warpDen tau theta g := by
  exact div_nonneg ( abs_nonneg _ ) ( Real.sqrt_nonneg _ )

/-
Basic: the warp integrand is strictly < 1 when τ > 0.
-/
theorem warpDen_lt_one (tau theta g : ℝ) (htau : 0 < tau) : warpDen tau theta g < 1 := by
  convert div_lt_one ?_ |>.2 ?_ using 1;
  · infer_instance;
  · positivity;
  · exact Real.lt_sqrt_of_sq_lt ( by norm_num; positivity )

/-
Basic: the warp integrand is continuous on the positive steepness axis.
-/
theorem warpDen_continuousOn (tau theta : ℝ) (htau : 0 < tau) (hθ : 0 < theta) :
    ContinuousOn (warpDen tau theta) (Set.Ioi 0) := by
  refine' ContinuousOn.div _ _ _;
  · exact ContinuousOn.abs ( ContinuousOn.log ( continuousOn_const.mul continuousOn_id ) fun x hx => mul_ne_zero hθ.ne' hx.out.ne' );
  · exact ContinuousOn.sqrt ( ContinuousOn.add continuousOn_const <| ContinuousOn.pow ( ContinuousOn.log ( continuousOn_const.mul continuousOn_id ) fun x hx => by aesop ) _ );
  · exact fun x hx => ne_of_gt <| Real.sqrt_pos.2 <| by positivity;

/-
Basic: integrability over a positive interval.
-/
theorem warpDen_intervalIntegrable (tau theta g0 g1 : ℝ) (htau : 0 < tau) (hθ : 0 < theta)
    (hg0 : 0 < g0) (hg1 : 0 < g1) :
    IntervalIntegrable (warpDen tau theta) MeasureTheory.volume g0 g1 := by
  apply_rules [ ContinuousOn.intervalIntegrable ];
  exact ContinuousOn.mono ( warpDen_continuousOn _ _ htau hθ ) fun x hx => by cases Set.mem_uIcc.mp hx <;> exact Set.mem_Ioi.mpr <| by linarith;

/-
FTC-2: the potential has the integrand as derivative.
-/
theorem warpPot_hasDerivAt (tau theta g : ℝ) (htau : 0 < tau) (hθ : 0 < theta) (hg : 0 < g) :
    HasDerivAt (warpPot tau theta) (warpDen tau theta g) g := by
  apply_rules [ intervalIntegral.integral_hasDerivAt_right ];
  · apply_rules [ warpDen_intervalIntegrable ] ; norm_num [ * ];
  · exact Measurable.stronglyMeasurable ( by exact Measurable.mul ( measurable_norm.comp ( Real.measurable_log.comp ( measurable_const.mul measurable_id' ) ) ) ( Measurable.inv ( Real.continuous_sqrt.measurable.comp ( measurable_const.add ( Real.measurable_log.comp ( measurable_const.mul measurable_id' ) |> Measurable.pow_const <| 2 ) ) ) ) ) |> fun h => h.stronglyMeasurableAtFilter;
  · exact ContinuousAt.comp ( show ContinuousAt ( fun x => |x| / Real.sqrt ( tau ^ 2 + x ^ 2 ) ) ( Real.log ( theta * g ) ) from ContinuousAt.div ( continuousAt_id.abs ) ( Real.continuous_sqrt.continuousAt.comp <| ContinuousAt.add continuousAt_const <| continuousAt_id.pow 2 ) <| ne_of_gt <| Real.sqrt_pos.mpr <| by positivity ) <| ContinuousAt.log ( continuousAt_const.mul continuousAt_id ) <| by positivity;

/-
Exactness: the warp integral is a difference of potential values.
-/
theorem warp_eq_pot_sub (tau theta g0 g1 : ℝ) (htau : 0 < tau) (hθ : 0 < theta)
    (hg0 : 0 < g0) (hg1 : 0 < g1) :
    warpInt tau theta g0 g1 = warpPot tau theta g1 - warpPot tau theta g0 := by
  unfold warpInt warpPot;
  rw [ eq_sub_iff_add_eq', intervalIntegral.integral_add_adjacent_intervals ];
  · exact WarpCalc.warpDen_intervalIntegrable _ _ _ _ htau hθ zero_lt_one hg0;
  · exact WarpCalc.warpDen_intervalIntegrable _ _ _ _ htau hθ hg0 hg1

/-
Additivity over concatenated trades.
-/
theorem warp_additive (tau theta g0 g1 g2 : ℝ) (htau : 0 < tau) (hθ : 0 < theta)
    (hg0 : 0 < g0) (hg1 : 0 < g1) (hg2 : 0 < g2) :
    warpInt tau theta g0 g1 + warpInt tau theta g1 g2 = warpInt tau theta g0 g2 := by
  unfold warpInt; rw [ intervalIntegral.integral_add_adjacent_intervals ] <;> apply_rules [ WarpCalc.warpDen_intervalIntegrable ] ;

/-
Round trip is exactly zero.
-/
theorem warp_roundtrip_zero (tau theta g0 g1 : ℝ) :
    warpInt tau theta g0 g1 + warpInt tau theta g1 g0 = 0 := by
  unfold warpInt; rw [ intervalIntegral.integral_symm ] ; ring;

/-
Bound: nonnegative on a buy.
-/
theorem warp_nonneg (tau theta g0 g1 : ℝ) (hg : g0 ≤ g1) :
    0 ≤ warpInt tau theta g0 g1 := by
  exact intervalIntegral.integral_nonneg ( by aesop ) fun x hx => warpDen_nonneg tau theta x

/-
Bound: warp ≤ Δγ on a buy.
-/
theorem warp_le_dgamma (tau theta g0 g1 : ℝ) (htau : 0 < tau) (hθ : 0 < theta)
    (hg0 : 0 < g0) (hg1 : 0 < g1) (hg : g0 ≤ g1) :
    warpInt tau theta g0 g1 ≤ g1 - g0 := by
  -- By the properties of integrals, if the integrand is less than or equal to 1, then the integral over [g0, g1] is less than or equal to the length of the interval, which is g1 - g0.
  have h_integral_le : ∫ g in g0..g1, warpDen tau theta g ≤ ∫ g in g0..g1, 1 := by
    apply_rules [ intervalIntegral.integral_mono_on ];
    · apply_rules [ ContinuousOn.intervalIntegrable ];
      exact ContinuousOn.mono ( warpDen_continuousOn tau theta htau hθ ) ( by rw [ Set.uIcc_of_le hg ] ; exact fun x hx => hx.1.trans_lt' hg0 );
    · norm_num;
    · exact fun x hx => le_of_lt ( WarpCalc.warpDen_lt_one tau theta x htau );
  aesop

/-
Single-signedness: sell side ≤ 0.
-/
theorem warp_nonpos_sell (tau theta g0 g1 : ℝ) (hg : g1 ≤ g0) :
    warpInt tau theta g0 g1 ≤ 0 := by
  unfold warpInt; rw [ intervalIntegral.integral_symm ] ; norm_num;
  exact intervalIntegral.integral_nonneg ( by linarith ) fun x hx => WarpCalc.warpDen_nonneg _ _ _

/-
Strict positivity for a non-degenerate buy.
-/
theorem warp_pos (tau theta g0 g1 : ℝ) (htau : 0 < tau) (hθ : 0 < theta)
    (hg0 : 0 < g0) (hg : g0 < g1) :
    0 < warpInt tau theta g0 g1 := by
  -- Choose a nondegenerate closed subinterval [a,b] ⊆ (g0,g1) on which the integrand is strictly positive.
  obtain ⟨a, b, ha, hb, hab⟩ : ∃ a b : ℝ, g0 < a ∧ a < b ∧ b < g1 ∧ ∀ g ∈ Set.Icc a b, warpDen tau theta g > 0 := by
    -- Consider two cases: $1/theta \leq g0$ or $1/theta \geq g1$, or $1/theta \in (g0, g1)$.
    by_cases h_case : 1 / theta ≤ g0 ∨ 1 / theta ≥ g1;
    · cases' h_case with h_case h_case <;> simp_all +decide [ WarpCalc.warpDen ];
      · refine' ⟨ g0 + ( g1 - g0 ) / 4, _, g0 + ( g1 - g0 ) / 2, _, _, _ ⟩ <;> try linarith;
        intro g hg₁ hg₂; unfold PhiA; exact div_pos ( abs_pos.mpr ( show Real.log ( theta * g ) ≠ 0 from ne_of_gt ( Real.log_pos <| by nlinarith [ mul_inv_cancel₀ ( ne_of_gt hθ ) ] ) ) ) ( Real.sqrt_pos.mpr <| by positivity ) ;
      · refine' ⟨ g0 + ( g1 - g0 ) / 4, _, g0 + ( g1 - g0 ) / 2, _, _, _ ⟩ <;> try linarith;
        intro g hg₁ hg₂; unfold PhiA; exact div_pos ( abs_pos.mpr <| ne_of_lt <| Real.log_neg ( by nlinarith [ mul_inv_cancel₀ hθ.ne' ] ) <| by nlinarith [ mul_inv_cancel₀ hθ.ne' ] ) <| Real.sqrt_pos.mpr <| by positivity;
    · -- Since $1/theta \in (g0, g1)$, we can choose $a = (1/theta + g1)/2$ and $b = (1/theta + g1)/2 + (g1 - 1/theta)/4$.
      use (1 / theta + g1) / 2, (1 / theta + g1) / 2 + (g1 - 1 / theta) / 4;
      simp_all +decide [ not_or ];
      exact ⟨ by linarith, by linarith, fun g hg₁ hg₂ => div_pos ( abs_pos.mpr <| ne_of_gt <| Real.log_pos <| by nlinarith [ mul_inv_cancel₀ hθ.ne' ] ) <| Real.sqrt_pos.mpr <| by positivity ⟩;
  -- Apply warp_additive to split the integral into three parts.
  have h_split : warpInt tau theta g0 g1 = warpInt tau theta g0 a + warpInt tau theta a b + warpInt tau theta b g1 := by
    rw [ warp_additive, warp_additive ] <;> linarith;
  -- Apply intervalIntegral.intervalIntegral_pos_of_pos_on to get 0 < ∫ a..b.
  have h_pos_ab : 0 < warpInt tau theta a b := by
    apply_rules [ intervalIntegral.intervalIntegral_pos_of_pos_on ];
    · apply_rules [ ContinuousOn.intervalIntegrable ];
      exact WarpCalc.warpDen_continuousOn tau theta htau hθ |> ContinuousOn.mono <| by rw [ Set.uIcc_of_le hb.le ] ; exact fun x hx => hx.1.trans_lt' <| by linarith;
    · exact fun x hx => hab.2 x <| Set.Ioo_subset_Icc_self hx;
  linarith [ warp_nonneg tau theta g0 a ha.le, warp_nonneg tau theta b g1 hab.1.le ]

/-
The live lensed exponent is continuous on the positive axis.
-/
theorem glAt_continuousOn (tau theta : ℝ) (htau : 0 < tau) (hθ : 0 < theta) :
    ContinuousOn (glAt tau theta) (Set.Ioi 0) := by
  convert ContinuousOn.mul continuousOn_id ( warpDen_continuousOn tau theta htau hθ ) using 1

/-
Chain rule for glAt off the single kink g = 1/θ.
-/
theorem glAt_hasDerivAt (tau theta g : ℝ) (htau : 0 < tau) (hθ : 0 < theta) (hg : 0 < g)
    (hkink : theta * g ≠ 1) :
    HasDerivAt (glAt tau theta) (warpDen tau theta g + recenterKer tau theta g) g := by
  unfold glAt warpDen recenterKer;
  convert HasDerivAt.mul ( hasDerivAt_id g ) ( HasDerivAt.comp g ( show HasDerivAt ( PhiA tau ) _ _ from ?_ ) <| HasDerivAt.log ( HasDerivAt.const_mul theta <| hasDerivAt_id g ) <| ?_ ) using 1 <;> norm_num [ hg.ne', hθ.ne', htau.ne', hkink ];
  case convert_1 => exact Real.sign ( Real.log ( theta * g ) ) * tau ^ 2 / ( ( tau ^ 2 + Real.log ( theta * g ) ^ 2 ) * Real.sqrt ( tau ^ 2 + Real.log ( theta * g ) ^ 2 ) );
  · field_simp;
  · convert HasDerivAt.div ( HasDerivAt.congr_of_eventuallyEq ( hasDerivAt_abs _ ) <| Filter.eventuallyEq_of_mem ( isOpen_compl_singleton.mem_nhds <| show Real.log ( theta * g ) ≠ 0 from _ ) fun x hx => ?_ ) ( HasDerivAt.sqrt ( HasDerivAt.add ( hasDerivAt_const _ _ ) ( hasDerivAt_pow 2 _ ) ) _ ) _ using 1;
    all_goals norm_num [ Real.sign ];
    · split_ifs <;> simp_all +decide [ abs_of_neg, abs_of_pos, Real.sign_of_neg, Real.sign_of_pos ];
      · have hpos : (0:ℝ) < tau ^ 2 + Real.log (theta * g) ^ 2 := by positivity
        have hs : Real.sqrt (tau ^ 2 + Real.log (theta * g) ^ 2) ^ 2
            = tau ^ 2 + Real.log (theta * g) ^ 2 := Real.sq_sqrt hpos.le
        have hs0 : Real.sqrt (tau ^ 2 + Real.log (theta * g) ^ 2) ≠ 0 := by positivity
        field_simp
        nlinarith [hs, Real.sqrt_nonneg (tau ^ 2 + Real.log (theta * g) ^ 2)]
      · have hpos : (0:ℝ) < tau ^ 2 + Real.log (theta * g) ^ 2 := by positivity
        have hs : Real.sqrt (tau ^ 2 + Real.log (theta * g) ^ 2) ^ 2
            = tau ^ 2 + Real.log (theta * g) ^ 2 := Real.sq_sqrt hpos.le
        have hs0 : Real.sqrt (tau ^ 2 + Real.log (theta * g) ^ 2) ≠ 0 := by positivity
        field_simp
        nlinarith [hs, Real.sqrt_nonneg (tau ^ 2 + Real.log (theta * g) ^ 2)]
      · exact False.elim <| hkink <| Real.eq_one_of_pos_of_log_eq_zero ( mul_pos hθ hg ) <| by linarith;
    · exact ⟨ ⟨ hθ.ne', hg.ne' ⟩, hkink, by nlinarith ⟩;
    · exact ⟨ ⟨ hθ.ne', hg.ne' ⟩, hkink, by nlinarith ⟩;
    · positivity;
    · positivity

/-
Integrability of the recentering kernel over a positive interval.
-/
theorem recenterKer_intervalIntegrable (tau theta g0 g1 : ℝ) (htau : 0 < tau) (hθ : 0 < theta)
    (hg0 : 0 < g0) (hg1 : 0 < g1) :
    IntervalIntegrable (recenterKer tau theta) MeasureTheory.volume g0 g1 := by
  -- The function recenterKer is measurable and bounded, hence integrable.
  have h_bounded : ∀ g ∈ Set.Icc (min g0 g1) (max g0 g1), |recenterKer tau theta g| ≤ 1 / tau := by
    intros g hg; unfold recenterKer; simp; (
    rw [ abs_div, abs_mul, abs_of_nonneg ( by positivity : ( 0 : ℝ ) ≤ tau ^ 2 ), abs_of_nonneg ( by positivity : ( 0 : ℝ ) ≤ ( tau ^ 2 + Real.log ( theta * g ) ^ 2 ) * Real.sqrt ( tau ^ 2 + Real.log ( theta * g ) ^ 2 ) ) ];
    field_simp;
    rw [ Real.sign ] ; split_ifs <;> norm_num;
    · nlinarith [ show 0 < tau ^ 2 by positivity, show 0 < Real.sqrt ( tau ^ 2 + Real.log ( theta * g ) ^ 2 ) by positivity, Real.mul_self_sqrt ( show 0 ≤ tau ^ 2 + Real.log ( theta * g ) ^ 2 by positivity ), pow_two_nonneg ( Real.sqrt ( tau ^ 2 + Real.log ( theta * g ) ^ 2 ) - tau ) ];
    · nlinarith [ show 0 < tau ^ 2 * Real.sqrt ( tau ^ 2 + Real.log ( theta * g ) ^ 2 ) by positivity, show 0 < Real.log ( theta * g ) ^ 2 * Real.sqrt ( tau ^ 2 + Real.log ( theta * g ) ^ 2 ) by positivity, Real.sqrt_nonneg ( tau ^ 2 + Real.log ( theta * g ) ^ 2 ), Real.mul_self_sqrt ( show 0 ≤ tau ^ 2 + Real.log ( theta * g ) ^ 2 by positivity ) ];
    · positivity);
  apply_rules [ MeasureTheory.IntegrableOn.intervalIntegrable ];
  refine' MeasureTheory.Integrable.mono' _ _ _;
  refine' fun x => 1 / tau;
  · exact Continuous.integrableOn_Icc ( by continuity );
  · refine' Measurable.aestronglyMeasurable _;
    refine' Measurable.mul _ _;
    · exact Measurable.mul ( Measurable.ite ( measurableSet_Iio.preimage ( Real.measurable_log.comp ( measurable_const.mul measurable_id' ) ) ) measurable_const ( Measurable.ite ( measurableSet_Ioi.preimage ( Real.measurable_log.comp ( measurable_const.mul measurable_id' ) ) ) measurable_const measurable_const ) ) measurable_const;
    · fun_prop;
  · filter_upwards [ MeasureTheory.ae_restrict_mem measurableSet_Icc ] with x hx using h_bounded x <| by simpa [ Set.uIcc ] using hx;

/-
Decomposition identity off the kink.
-/
theorem warp_decomposition_offkink (tau theta g0 g1 : ℝ) (htau : 0 < tau) (hθ : 0 < theta)
    (hg0 : 0 < g0) (hg : g0 ≤ g1) (hkink : ∀ g ∈ Set.uIcc g0 g1, theta * g ≠ 1) :
    glAt tau theta g1 - glAt tau theta g0
      = warpInt tau theta g0 g1 + ∫ g in g0..g1, recenterKer tau theta g := by
  have h_cont : ContinuousOn (glAt tau theta) (Set.Icc g0 g1) := by
    exact ContinuousOn.mono ( glAt_continuousOn tau theta htau hθ ) fun x hx => hx.1.trans_lt' hg0;
  have h_ftc : ∫ g in g0..g1, (warpDen tau theta g + recenterKer tau theta g) = glAt tau theta g1 - glAt tau theta g0 := by
    rw [ intervalIntegral.integral_eq_sub_of_hasDerivAt_of_le ];
    · finiteness;
    · assumption;
    · exact fun x hx => glAt_hasDerivAt tau theta x htau hθ ( by linarith [ hx.1 ] ) ( hkink x <| by rw [ Set.uIcc_of_le hg ] ; exact Set.Ioo_subset_Icc_self hx );
    · apply_rules [ IntervalIntegrable.add, warpDen_intervalIntegrable, recenterKer_intervalIntegrable ]; all_goals linarith;
  convert h_ftc.symm using 1;
  exact Eq.symm ( intervalIntegral.integral_add ( by exact WarpCalc.warpDen_intervalIntegrable _ _ _ _ htau hθ hg0 ( by linarith ) ) ( by exact WarpCalc.recenterKer_intervalIntegrable _ _ _ _ htau hθ hg0 ( by linarith ) ) )

/-- Decomposition identity when the kink is avoided on the OPEN interval (it may sit at an
endpoint). Same FTC argument as the off-kink case, but FTC only needs the derivative on the
open interior, so endpoint kinks are allowed. -/
theorem warp_decomposition_ioo (tau theta g0 g1 : ℝ) (htau : 0 < tau) (hθ : 0 < theta)
    (hg0 : 0 < g0) (hg : g0 ≤ g1) (hkink : ∀ g ∈ Set.Ioo g0 g1, theta * g ≠ 1) :
    glAt tau theta g1 - glAt tau theta g0
      = warpInt tau theta g0 g1 + ∫ g in g0..g1, recenterKer tau theta g := by
  have h_cont : ContinuousOn (glAt tau theta) (Set.Icc g0 g1) := by
    exact ContinuousOn.mono ( glAt_continuousOn tau theta htau hθ ) fun x hx => hx.1.trans_lt' hg0;
  have h_ftc : ∫ g in g0..g1, (warpDen tau theta g + recenterKer tau theta g) = glAt tau theta g1 - glAt tau theta g0 := by
    rw [ intervalIntegral.integral_eq_sub_of_hasDerivAt_of_le ];
    · finiteness;
    · assumption;
    · exact fun x hx => glAt_hasDerivAt tau theta x htau hθ ( by linarith [ hx.1 ] ) ( hkink x hx );
    · apply_rules [ IntervalIntegrable.add, warpDen_intervalIntegrable, recenterKer_intervalIntegrable ]; all_goals linarith;
  convert h_ftc.symm using 1;
  exact Eq.symm ( intervalIntegral.integral_add ( by exact WarpCalc.warpDen_intervalIntegrable _ _ _ _ htau hθ hg0 ( by linarith ) ) ( by exact WarpCalc.recenterKer_intervalIntegrable _ _ _ _ htau hθ hg0 ( by linarith ) ) )

/-
Headline decomposition identity, kink allowed inside.
-/
theorem warp_decomposition (tau theta g0 g1 : ℝ) (htau : 0 < tau) (hθ : 0 < theta)
    (hg0 : 0 < g0) (hg : g0 ≤ g1) :
    glAt tau theta g1 - glAt tau theta g0
      = warpInt tau theta g0 g1 + ∫ g in g0..g1, recenterKer tau theta g := by
  by_cases h : 1 / theta ∈ Set.Ioo g0 g1;
  · -- Apply warp_decomposition_ioo to the two halves:
    have h1 : glAt tau theta (1 / theta) - glAt tau theta g0 = warpInt tau theta g0 (1 / theta) + ∫ g in g0..(1 / theta), recenterKer tau theta g := by
      apply warp_decomposition_ioo;
      · exact htau;
      · positivity;
      · linarith;
      · linarith [ h.1 ];
      · exact fun g hg => by nlinarith [ hg.1, hg.2, one_div_mul_cancel hθ.ne' ]
    have h2 : glAt tau theta g1 - glAt tau theta (1 / theta) = warpInt tau theta (1 / theta) g1 + ∫ g in (1 / theta)..g1, recenterKer tau theta g := by
      apply warp_decomposition_ioo;
      · positivity;
      · positivity;
      · positivity;
      · linarith [ h.2 ];
      · exact fun g hg => by nlinarith [ hg.1, hg.2, one_div_mul_cancel hθ.ne' ] ;
    convert congr_arg₂ ( · + · ) h1 h2 using 1;
    · ring;
    · rw [ add_add_add_comm, warp_additive, intervalIntegral.integral_add_adjacent_intervals ];
      any_goals positivity;
      · apply_rules [ recenterKer_intervalIntegrable ];
        positivity;
      · apply_rules [ recenterKer_intervalIntegrable ];
        · positivity;
        · linarith;
      · linarith [ h.1, h.2 ];
  · convert warp_decomposition_ioo tau theta g0 g1 htau hθ hg0 hg _ using 1;
    intro g hg hc
    exact h (by
      have : g = 1 / theta := by field_simp; linarith [mul_comm theta g, hc]
      rwa [this] at hg)

end WarpCalc
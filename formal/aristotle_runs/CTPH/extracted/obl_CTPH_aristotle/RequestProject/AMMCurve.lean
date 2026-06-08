/-
  A typed AMM-curve interface (the substitution gate) and the curve-agnostic
  short-gamma bridge.

  The three fields of `AMMCurve` are the validity gate; the two theorems are the
  proof targets; the instances + examples demonstrate that the gate is satisfiable
  and the bridge transfers for free.
-/
import Mathlib

namespace TemporalCurve

/-- A valid AMM curve as a reserve frontier `y` on a convex domain `dom`
    (`y x` = Y-reserve when X-reserve is `x`). The fields are the substitution
    gate: to plug a new invariant into the framework you must supply proofs of all
    of them. A shape that is not monotone-decreasing and convex cannot be made an
    `AMMCurve`, hence cannot reach the theorems below. -/
structure AMMCurve where
  dom         : Set ℝ
  convex_dom  : Convex ℝ dom
  y           : ℝ → ℝ
  /-- monotone: more X ⇒ weakly less Y (downward-sloping frontier). -/
  antitone_y  : AntitoneOn y dom
  /-- convex: the frontier bows the right way (no-arb / real slippage). -/
  convex_y    : ConvexOn ℝ dom y
  /-- coercivity: at a positive price the value set is bounded below, so its inf is real. -/
  coercive    : ∀ ⦃p : ℝ⦄, 0 < p → BddBelow ((fun x => p * x + y x) '' dom)

namespace AMMCurve
variable (C : AMMCurve)

/-- LP reserve value at external price `p` (price of X in units of Y): the lower
    envelope of the affine-in-`p` lines through the curve points. -/
noncomputable def poolValue (p : ℝ) : ℝ := sInf ((fun x => p * x + C.y x) '' C.dom)

theorem poolValue_concaveOn : ConcaveOn ℝ (Set.Ioi 0) C.poolValue := by
  have := @C;
  unfold AMMCurve.poolValue;
  refine' ⟨ convex_Ioi 0, _ ⟩;
  intro p hp q hq a b ha hb hab
  have h_le : ∀ x ∈ C.dom, a * (p * x + C.y x) + b * (q * x + C.y x) ≥ a * sInf ((fun x => p * x + C.y x) '' C.dom) + b * sInf ((fun x => q * x + C.y x) '' C.dom) := by
    exact fun x hx => add_le_add ( mul_le_mul_of_nonneg_left ( csInf_le ( by exact C.coercive hp ) ( Set.mem_image_of_mem _ hx ) ) ha ) ( mul_le_mul_of_nonneg_left ( csInf_le ( by exact C.coercive hq ) ( Set.mem_image_of_mem _ hx ) ) hb );
  by_cases h : C.dom.Nonempty <;> simp_all +decide [ Set.Nonempty ];
  · exact le_csInf ( Set.Nonempty.image _ h ) ( by rintro _ ⟨ x, hx, rfl ⟩ ; convert h_le x hx using 1 ; rw [ ← eq_sub_iff_add_eq' ] at hab; subst hab; ring );
  · simp_all +decide [ Set.image ]

theorem hedge_gap_concaveOn {O : ℝ → ℝ} (hO : ConvexOn ℝ (Set.Ioi 0) O) :
    ConcaveOn ℝ (Set.Ioi 0) (fun p => C.poolValue p - O p) := by
  have := C.poolValue_concaveOn;
  exact this.add ( hO.neg )

end AMMCurve

/-! ## Helper lemmas for instances -/

private lemma exp_neg_antitoneOn : AntitoneOn (fun x => Real.exp (-x)) Set.univ :=
  fun _ _ _ _ hxy => Real.exp_le_exp.2 (neg_le_neg hxy)

private lemma exp_neg_convexOn : ConvexOn ℝ Set.univ (fun x => Real.exp (-x)) := by
  apply_rules [ convexOn_of_deriv2_nonneg, convex_univ ];
  · exact Continuous.continuousOn <| Real.continuous_exp.comp <| ContinuousNeg.continuous_neg;
  · exact DifferentiableOn.exp ( differentiableOn_id.neg );
  · exact Differentiable.differentiableOn ( by rw [ show deriv ( fun x => Real.exp ( -x ) ) = fun x => -Real.exp ( -x ) from funext fun x => by simpa using HasDerivAt.deriv ( HasDerivAt.exp ( hasDerivAt_neg x ) ) ] ; exact Differentiable.neg ( Differentiable.exp ( differentiable_id.neg ) ) );
  · unfold deriv ; norm_num [ fderiv_apply_one_eq_deriv, Real.exp_neg ];
    exact fun x => div_nonneg ( by nlinarith [ Real.exp_pos x ] ) ( sq_nonneg _ )

private lemma exp_neg_coercive :
    ∀ ⦃p : ℝ⦄, 0 < p → BddBelow ((fun x => p * x + Real.exp (-x)) '' Set.univ) := by
  intro p hp
  have h_lower_bound : ∀ x : ℝ, p * x + Real.exp (-x) ≥ p - p * Real.log p := by
    intro x
    have := Real.log_le_sub_one_of_pos ( show 0 < Real.exp ( -x ) / p by positivity );
    rw [ Real.log_div ( by positivity ) ( by positivity ), Real.log_exp ] at this ; nlinarith [ mul_div_cancel₀ ( Real.exp ( -x ) ) hp.ne' ];
  exact ⟨ p - p * Real.log p, Set.forall_mem_image.2 fun x _ => h_lower_bound x ⟩

private lemma div_antitoneOn (k : ℝ) (hk : 0 < k) :
    AntitoneOn (fun x => k / x) (Set.Ioi 0) :=
  fun _ hx _ hy hxy => div_le_div_of_nonneg_left hk.le (by exact hx) hxy

private lemma div_convexOn (k : ℝ) (hk : 0 < k) :
    ConvexOn ℝ (Set.Ioi 0) (fun x => k / x) := by
  fapply convexOn_of_deriv2_nonneg;
  · exact convex_Ioi 0;
  · exact continuousOn_const.div continuousOn_id fun x hx => ne_of_gt hx;
  · exact DifferentiableOn.div ( differentiableOn_const _ ) differentiableOn_id fun x hx => ne_of_gt <| interior_subset hx;
  · norm_num [ div_eq_mul_inv ];
    exact DifferentiableOn.mul ( differentiableOn_const _ ) ( DifferentiableOn.inv ( differentiableOn_pow 2 ) fun x hx => ne_of_gt ( sq_pos_of_pos hx ) );
  · norm_num [ div_eq_mul_inv ];
    intro x hx; norm_num [ hx.ne' ] ; ring_nf; norm_num [ hx.ne' ] ; positivity;

private lemma div_coercive (k : ℝ) (hk : 0 < k) :
    ∀ ⦃p : ℝ⦄, 0 < p → BddBelow ((fun x => p * x + k / x) '' (Set.Ioi 0)) := by
  exact fun p hp => ⟨ 0, Set.forall_mem_image.2 fun x hx => by nlinarith [ hx.out, div_nonneg hk.le hx.out.le ] ⟩

/-! ## Instances — the gate is satisfiable and the bridge transfers for free. -/

/-- Instance 1: exponential pool, frontier `y = exp (−x)` on all of ℝ. -/
noncomputable def expPool : AMMCurve where
  dom        := Set.univ
  convex_dom := convex_univ
  y          := fun x => Real.exp (-x)
  antitone_y := exp_neg_antitoneOn
  convex_y   := exp_neg_convexOn
  coercive   := exp_neg_coercive

/-- Instance 2: constant-product pool, frontier `y = k / x` on `x > 0` (k>0). -/
noncomputable def cpmm (k : ℝ) (hk : 0 < k) : AMMCurve where
  dom        := Set.Ioi 0
  convex_dom := convex_Ioi 0
  y          := fun x => k / x
  antitone_y := div_antitoneOn k hk
  convex_y   := div_convexOn k hk
  coercive   := div_coercive k hk

/-- PAYOFF: each instance inherits the bridge with no curve-specific reproof. -/
example : ConcaveOn ℝ (Set.Ioi 0) expPool.poolValue :=
  expPool.poolValue_concaveOn

example (k : ℝ) (hk : 0 < k) :
    ConcaveOn ℝ (Set.Ioi 0) (cpmm k hk).poolValue :=
  (cpmm k hk).poolValue_concaveOn

end TemporalCurve
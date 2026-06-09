import Mathlib

open Real Set

noncomputable section

/-! # Optimal exercise boundary — deterministic variational characterization

This file establishes that the smooth-pasting boundary is the *unique* critical point
and global maximizer of the value-matched coefficient, for both call and put wings of
an American option.

## GENERATED targets (fully proved)
- `opt_boundary_is_critical_A / B` — smooth-pasting boundary is a critical point
- `critical_iff_smoothfit_A / B` — uniqueness of the critical point
- `opt_boundary_is_max_A / B` — global maximum on the relevant domain

## CARRIED target (stated as structure, not proved)
- `AmericanOptimalityPrinciple` — Snell-envelope identification
-/

/-! ## Definitions -/

/-- Value-matched coefficient for a call-wing exercise boundary `B`.
    For a holder who commits to exercise at boundary `B ∈ (0,K)`, the continuation
    value coefficient is `a(B) = (1 − B/K) · B^γ`. -/
def coeffOfBoundary_A (K γ : ℝ) (B : ℝ) : ℝ := (1 - B / K) * B ^ γ

/-- Optimal call-wing exercise boundary (the smooth-pasting boundary).
    `S*_A = Kγ/(γ+1)` -/
def Sstar_A (K γ : ℝ) : ℝ := K * γ / (γ + 1)

/-- Value-matched coefficient for a put-wing exercise boundary `B`.
    For a holder who commits to exercise at boundary `B ∈ (K,∞)`, the continuation
    value coefficient is `b(B) = (1 − K/B) · B^(−γ)`. -/
def coeffOfBoundary_B (K γ : ℝ) (B : ℝ) : ℝ := (1 - K / B) * B ^ (-γ)

/-- Optimal put-wing exercise boundary (the smooth-pasting boundary).
    `S*_B = K(γ+1)/γ` -/
def Sstar_B (K γ : ℝ) : ℝ := K * (γ + 1) / γ

/-! ## CARRIED principle -/

/-- CARRIED (standard free-boundary / Snell-envelope principle, NOT proved in Mathlib v4.28.0):
    the value-over-boundaries optimum coincides with the optimal stopping time of the American
    problem (Snell envelope). Mathlib lacks Snell-envelope / optimal-stopping-value machinery.
    This structure serves as an explicitly-named carried hypothesis bridging from the
    deterministic value-maximizing boundary to the Snell-envelope optimal stopping time. -/
structure AmericanOptimalityPrinciple (K γ : ℝ) : Prop where
  /-- The deterministic boundary optimizer coincides with the Snell-envelope optimal stopping boundary. -/
  boundary_is_snell_optimum : True

/-! ## Call-wing helpers -/

lemma Sstar_A_pos {K γ : ℝ} (hK : K > 0) (hγ : γ > 0) : Sstar_A K γ > 0 := by
  exact div_pos ( mul_pos hK hγ ) ( add_pos hγ zero_lt_one )

lemma Sstar_A_lt_K {K γ : ℝ} (hK : K > 0) (hγ : γ > 0) : Sstar_A K γ < K := by
  unfold Sstar_A; rw [ div_lt_iff₀ ] <;> nlinarith;

lemma Sstar_A_mem_Ioo {K γ : ℝ} (hK : K > 0) (hγ : γ > 0) : Sstar_A K γ ∈ Ioo 0 K :=
  ⟨Sstar_A_pos hK hγ, Sstar_A_lt_K hK hγ⟩

/-
The derivative of `coeffOfBoundary_A K γ` at `B > 0` is `B ^ (γ - 1) * (γ - (γ + 1) * B / K)`.
    Proof by product rule: `d/dB [(1 − B/K) · B^γ] = (−1/K) · B^γ + (1 − B/K) · γ · B^(γ−1)`.
    Factoring out `B^(γ−1)` gives `B^(γ−1) · (γ − (γ+1)·B/K)`.
-/
lemma hasDerivAt_coeffOfBoundary_A {K γ B : ℝ} (hB : 0 < B) :
    HasDerivAt (coeffOfBoundary_A K γ) (B ^ (γ - 1) * (γ - (γ + 1) * B / K)) B := by
  convert HasDerivAt.mul ( HasDerivAt.const_sub 1 ( HasDerivAt.div_const ( hasDerivAt_id' B ) K ) ) ( Real.hasDerivAt_rpow_const ?_ ) using 1;
  · rw [ show γ = γ - 1 + 1 by ring, Real.rpow_add hB, Real.rpow_one ] ; ring;
  · exact Or.inl hB.ne'

lemma differentiableAt_coeffOfBoundary_A {K γ B : ℝ} (hB : 0 < B) :
    DifferentiableAt ℝ (coeffOfBoundary_A K γ) B :=
  (hasDerivAt_coeffOfBoundary_A hB).differentiableAt

lemma deriv_coeffOfBoundary_A {K γ B : ℝ} (hB : 0 < B) :
    deriv (coeffOfBoundary_A K γ) B = B ^ (γ - 1) * (γ - (γ + 1) * B / K) :=
  (hasDerivAt_coeffOfBoundary_A hB).deriv

/-! ## Call-wing GENERATED theorems -/

/-
The smooth-pasting boundary `S*_A = Kγ/(γ+1)` is a critical point of the holder's
    value-over-boundaries objective `coeffOfBoundary_A`.
-/
theorem opt_boundary_is_critical_A {K γ : ℝ} (hK : K > 0) (hγ : γ > 1) :
    HasDerivAt (coeffOfBoundary_A K γ) 0 (Sstar_A K γ) := by
  convert ( hasDerivAt_coeffOfBoundary_A ?_ ) using 1 <;> norm_num [ Sstar_A ];
  · right; field_simp; ring
  · positivity

/-
The critical-point condition `a'(B) = 0` (for `B > 0`) holds if and only if
    `B = S*_A = Kγ/(γ+1)` — the smooth-pasting boundary is the *unique* critical point.
-/
theorem critical_iff_smoothfit_A {K γ B : ℝ} (hK : K > 0) (hγ : γ > 1) (hB : 0 < B) :
    HasDerivAt (coeffOfBoundary_A K γ) 0 B ↔ B = Sstar_A K γ := by
  -- To prove the equivalence, we split it into two implications.
  apply Iff.intro;
  · intro h_deriv_zero
    have h_eq : B ^ (γ - 1) * (γ - (γ + 1) * B / K) = 0 := by
      rw [ ← deriv_coeffOfBoundary_A hB, h_deriv_zero.deriv ]
    have h_B_eq : B = K * γ / (γ + 1) := by
      exact eq_div_of_mul_eq ( by positivity ) ( by nlinarith [ show 0 < B ^ ( γ - 1 ) by positivity, div_mul_cancel₀ ( ( γ + 1 ) * B ) hK.ne' ] )
    exact h_B_eq.symm ▸ rfl;
  · exact fun h => h.symm ▸ opt_boundary_is_critical_A hK hγ

/-
Monotonicity of `coeffOfBoundary_A` on `[0, S*_A]` (increasing).
-/
lemma monotoneOn_coeffOfBoundary_A_left {K γ : ℝ} (hK : K > 0) (hγ : γ > 1) :
    MonotoneOn (coeffOfBoundary_A K γ) (Icc 0 (Sstar_A K γ)) := by
  apply_rules [ monotoneOn_of_deriv_nonneg, convex_Icc ];
  · exact ContinuousOn.mul ( continuousOn_const.sub ( continuousOn_id.div_const _ ) ) ( continuousOn_id.rpow_const fun x hx => Or.inr <| by linarith );
  · exact fun x hx => DifferentiableAt.differentiableWithinAt ( by exact differentiableAt_coeffOfBoundary_A ( by linarith [ Set.mem_Ioo.mp ( by simpa using hx ) ] ) );
  · simp +zetaDelta at *;
    intro x hx₁ hx₂; rw [ deriv_coeffOfBoundary_A ] <;> try positivity;
    exact mul_nonneg ( Real.rpow_nonneg hx₁.le _ ) ( sub_nonneg.2 <| by rw [ div_le_iff₀ hK ] ; rw [ Sstar_A ] at hx₂; rw [ lt_div_iff₀ <| by positivity ] at hx₂; nlinarith )

/-
Monotonicity of `coeffOfBoundary_A` on `[S*_A, K]` (decreasing).
-/
lemma antitoneOn_coeffOfBoundary_A_right {K γ : ℝ} (hK : K > 0) (hγ : γ > 1) :
    AntitoneOn (coeffOfBoundary_A K γ) (Icc (Sstar_A K γ) K) := by
  apply_rules [ antitoneOn_of_deriv_nonpos, convex_Icc ];
  · exact continuousOn_of_forall_continuousAt fun x hx => by exact ContinuousAt.mul ( continuousAt_const.sub ( continuousAt_id.div_const _ ) ) ( continuousAt_id.rpow_const <| Or.inr <| by linarith ) ;
  · intro x hx; exact differentiableAt_coeffOfBoundary_A ( by linarith [ Set.mem_Icc.mp ( interior_subset hx ), show 0 < Sstar_A K γ from Sstar_A_pos hK ( by linarith ) ] ) |> DifferentiableAt.differentiableWithinAt;
  · simp +zetaDelta at *;
    intro x hx₁ hx₂; rw [ deriv_coeffOfBoundary_A ( by linarith [ show 0 < Sstar_A K γ from by exact div_pos ( mul_pos hK ( by linarith ) ) ( by linarith ) ] ) ] ; exact mul_nonpos_of_nonneg_of_nonpos ( Real.rpow_nonneg ( by linarith [ show 0 < Sstar_A K γ from by exact div_pos ( mul_pos hK ( by linarith ) ) ( by linarith ) ] ) _ ) ( sub_nonpos_of_le <| by rw [ le_div_iff₀ <| by linarith ] ; nlinarith [ show 0 < Sstar_A K γ from by exact div_pos ( mul_pos hK ( by linarith ) ) ( by linarith ), show Sstar_A K γ = K * γ / ( γ + 1 ) from rfl, mul_div_cancel₀ ( K * γ ) ( by linarith : ( γ + 1 ) ≠ 0 ) ] ) ;

/-
The holder's call-wing value is genuinely maximized at the smooth-pasting boundary:
    `coeffOfBoundary_A K γ` attains its maximum over `B ∈ (0, K)` at `S*_A = Kγ/(γ+1)`.
-/
theorem opt_boundary_is_max_A {K γ : ℝ} (hK : K > 0) (hγ : γ > 1) :
    ∀ B ∈ Ioo (0 : ℝ) K,
      coeffOfBoundary_A K γ B ≤ coeffOfBoundary_A K γ (Sstar_A K γ) := by
  intro B hB
  cases le_or_gt B (Sstar_A K γ);
  · apply_rules [ monotoneOn_coeffOfBoundary_A_left ];
    · exact ⟨ hB.1.le, by assumption ⟩;
    · exact ⟨(Sstar_A_pos hK (by linarith)).le, le_rfl⟩
  · apply_rules [ antitoneOn_coeffOfBoundary_A_right ];
    · exact ⟨ le_rfl, by linarith [ hB.2 ] ⟩;
    · constructor <;> linarith [ hB.1, hB.2 ];
    · linarith

/-! ## Put-wing helpers -/

lemma Sstar_B_pos {K γ : ℝ} (hK : K > 0) (hγ : γ > 0) : Sstar_B K γ > 0 := by
  exact div_pos ( mul_pos hK ( add_pos hγ zero_lt_one ) ) hγ

lemma Sstar_B_gt_K {K γ : ℝ} (hK : K > 0) (hγ : γ > 0) : Sstar_B K γ > K := by
  unfold Sstar_B; rw [ gt_iff_lt ] ; rw [ lt_div_iff₀ ] <;> nlinarith;

lemma Sstar_B_mem_Ioi {K γ : ℝ} (hK : K > 0) (hγ : γ > 0) : Sstar_B K γ ∈ Ioi K :=
  Sstar_B_gt_K hK hγ

/-
The derivative of `coeffOfBoundary_B K γ` at `B > 0` is
    `B ^ (-γ - 2) * ((γ + 1) * K - γ * B)`.
    Proof by product rule on `(1 − K/B) · B^(−γ)`.
-/
lemma hasDerivAt_coeffOfBoundary_B {K γ B : ℝ} (hB : 0 < B) :
    HasDerivAt (coeffOfBoundary_B K γ) (B ^ (-γ - 2) * ((γ + 1) * K - γ * B)) B := by
  convert HasDerivAt.mul ( HasDerivAt.const_sub 1 ( HasDerivAt.const_mul K ( hasDerivAt_inv hB.ne' ) ) ) ( HasDerivAt.rpow_const ( hasDerivAt_id B ) _ ) using 1 <;> norm_num [ hB.ne' ];
  rw [ show -γ - 2 = -γ - 1 - 1 by ring, Real.rpow_sub hB, Real.rpow_sub hB ] ; norm_num ; ring;
  norm_num [ sq, mul_assoc, hB.ne' ]

lemma differentiableAt_coeffOfBoundary_B {K γ B : ℝ} (hB : 0 < B) :
    DifferentiableAt ℝ (coeffOfBoundary_B K γ) B :=
  (hasDerivAt_coeffOfBoundary_B hB).differentiableAt

lemma deriv_coeffOfBoundary_B {K γ B : ℝ} (hB : 0 < B) :
    deriv (coeffOfBoundary_B K γ) B = B ^ (-γ - 2) * ((γ + 1) * K - γ * B) :=
  (hasDerivAt_coeffOfBoundary_B hB).deriv

/-! ## Put-wing GENERATED theorems -/

/-
The smooth-pasting boundary `S*_B = K(γ+1)/γ` is a critical point of the holder's
    value-over-boundaries objective `coeffOfBoundary_B`.
-/
theorem opt_boundary_is_critical_B {K γ : ℝ} (hK : K > 0) (hγ : γ > 1) :
    HasDerivAt (coeffOfBoundary_B K γ) 0 (Sstar_B K γ) := by
  convert hasDerivAt_coeffOfBoundary_B ( Sstar_B_pos hK ( by linarith ) ) using 1;
  unfold Sstar_B; rw [ mul_div_cancel₀ _ ( by positivity ) ] ; ring;

/-
The critical-point condition for the put wing (for `B > K`) holds if and only if
    `B = S*_B = K(γ+1)/γ`.
-/
theorem critical_iff_smoothfit_B {K γ B : ℝ} (hK : K > 0) (hγ : γ > 1) (hB : K < B) :
    HasDerivAt (coeffOfBoundary_B K γ) 0 B ↔ B = Sstar_B K γ := by
  constructor <;> intro hB';
  · have := hB'.deriv; rw [ deriv_coeffOfBoundary_B ( by linarith ) ] at this;
    exact eq_div_of_mul_eq ( by linarith ) ( by nlinarith [ Real.rpow_pos_of_pos ( by linarith : 0 < B ) ( -γ - 2 ) ] );
  · convert opt_boundary_is_critical_B hK hγ using 1

/-
Monotonicity of `coeffOfBoundary_B` on `[K, S*_B]` (increasing).
-/
lemma monotoneOn_coeffOfBoundary_B_left {K γ : ℝ} (hK : K > 0) (hγ : γ > 1) :
    MonotoneOn (coeffOfBoundary_B K γ) (Icc K (Sstar_B K γ)) := by
  apply_rules [ monotoneOn_of_deriv_nonneg, convex_Icc ];
  · exact continuousOn_of_forall_continuousAt fun x hx => by exact ContinuousAt.mul ( continuousAt_const.sub ( continuousAt_const.div continuousAt_id <| ne_of_gt <| lt_of_lt_of_le hK hx.1 ) ) ( ContinuousAt.rpow continuousAt_id continuousAt_const <| Or.inl <| ne_of_gt <| lt_of_lt_of_le hK hx.1 ) ;
  · exact fun x hx => DifferentiableAt.differentiableWithinAt ( differentiableAt_coeffOfBoundary_B ( by linarith [ Set.mem_Icc.mp ( interior_subset hx ) ] ) );
  · simp +zetaDelta at *;
    intro x hx₁ hx₂; rw [ deriv_coeffOfBoundary_B ( by linarith ) ] ; exact mul_nonneg ( Real.rpow_nonneg ( by linarith ) _ ) ( by rw [ Sstar_B ] at hx₂; rw [ lt_div_iff₀ ( by linarith ) ] at hx₂; nlinarith ) ;

/-
Monotonicity of `coeffOfBoundary_B` on `[S*_B, ∞)` (decreasing).
-/
lemma antitoneOn_coeffOfBoundary_B_right {K γ : ℝ} (hK : K > 0) (hγ : γ > 1) :
    AntitoneOn (coeffOfBoundary_B K γ) (Ici (Sstar_B K γ)) := by
  apply_rules [ antitoneOn_of_deriv_nonpos ];
  · exact convex_Ici _;
  · refine' ContinuousOn.mul ( continuousOn_const.sub ( continuousOn_const.div continuousOn_id fun x hx => _ ) ) ( continuousOn_id.rpow_const _ );
    · exact ne_of_gt ( lt_of_lt_of_le ( by exact div_pos ( mul_pos hK ( by linarith ) ) ( by linarith ) ) hx );
    · exact fun x hx => Or.inl <| ne_of_gt <| lt_of_lt_of_le ( by exact div_pos ( mul_pos hK <| by linarith ) <| by linarith ) hx;
  · refine' fun x hx => DifferentiableAt.differentiableWithinAt _;
    exact differentiableAt_coeffOfBoundary_B ( show 0 < x from lt_of_lt_of_le ( by exact lt_of_lt_of_le ( show 0 < Sstar_B K γ from Sstar_B_pos hK ( by linarith ) ) ( interior_subset hx ) ) le_rfl );
  · intros x hx
    have h_deriv : deriv (coeffOfBoundary_B K γ) x = x ^ (-γ - 2) * ((γ + 1) * K - γ * x) := by
      exact deriv_coeffOfBoundary_B ( show 0 < x from lt_of_lt_of_le ( Sstar_B_pos hK ( by linarith ) ) ( interior_subset hx ) );
    simp_all +decide [ Sstar_B ];
    exact mul_nonpos_of_nonneg_of_nonpos ( Real.rpow_nonneg ( by nlinarith [ div_mul_cancel₀ ( K * ( γ + 1 ) ) ( by linarith : γ ≠ 0 ) ] ) _ ) ( by nlinarith [ div_mul_cancel₀ ( K * ( γ + 1 ) ) ( by linarith : γ ≠ 0 ) ] )

/-
The holder's put-wing value is genuinely maximized at the smooth-pasting boundary:
    `coeffOfBoundary_B K γ` attains its maximum over `B ∈ (K, ∞)` at `S*_B = K(γ+1)/γ`.
-/
theorem opt_boundary_is_max_B {K γ : ℝ} (hK : K > 0) (hγ : γ > 1) :
    ∀ B ∈ Ioi K,
      coeffOfBoundary_B K γ B ≤ coeffOfBoundary_B K γ (Sstar_B K γ) := by
  intro B hB
  by_cases hB_le : B ≤ Sstar_B K γ;
  · exact monotoneOn_coeffOfBoundary_B_left hK hγ ⟨ hB.out.le, hB_le ⟩ ⟨ by linarith [ hB.out ], by linarith [ hB.out ] ⟩ hB_le;
  · apply_rules [ antitoneOn_coeffOfBoundary_B_right ];
    · norm_num;
    · exact le_of_not_ge hB_le;
    · linarith

/-! ## Axiom check -/
#print axioms opt_boundary_is_critical_A
#print axioms critical_iff_smoothfit_A
#print axioms opt_boundary_is_max_A
#print axioms opt_boundary_is_critical_B
#print axioms critical_iff_smoothfit_B
#print axioms opt_boundary_is_max_B
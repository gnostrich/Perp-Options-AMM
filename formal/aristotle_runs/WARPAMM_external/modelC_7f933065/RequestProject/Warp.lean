import Mathlib

namespace Temporal.Warp
open Real

/-! # Definitions -/

-- θ-parameterized
noncomputable def σ_θ (w θ : ℝ) : ℝ := (w / (1 - w)) * tan θ
noncomputable def ξ_m (w : ℝ) : ℝ := log ((1 - w) / w)
noncomputable def ξ (θ : ℝ) : ℝ := log (tan θ)
noncomputable def P_C_θ (w θ : ℝ) : ℝ := ((1 - w) / w) / tan θ
noncomputable def P_P_θ (w θ : ℝ) : ℝ := σ_θ w θ

-- ξ-parameterized
noncomputable def σ_ξ (ξm ξ : ℝ) : ℝ := exp (ξ - ξm)
noncomputable def P_C_ξ (ξm ξ : ℝ) : ℝ := exp (ξm - ξ)
noncomputable def P_P_ξ (ξm ξ : ℝ) : ℝ := exp (ξ - ξm)

-- Model C warp definitions (§5)

-- Endpoint tangent on pre-trade curve at (x_B, y_B)
noncomputable def σ_B (w₀ x_B y_B : ℝ) : ℝ := ((1 - w₀) / w₀) * (x_B / y_B)

-- Post-warp weight
noncomputable def w₁ (x_s y_s σB : ℝ) : ℝ := x_s / (x_s + σB * y_s)

-- Post-warp scale: pinned at anchor (x_0, y_0)
noncomputable def k₁ (x_0 y_0 w : ℝ) : ℝ := x_0 ^ w * y_0 ^ (1 - w)

-- Slippage
noncomputable def slippage_call (ξm₀ ξm₁ ξ : ℝ) : ℝ := P_C_ξ ξm₁ ξ / P_C_ξ ξm₀ ξ - 1
noncomputable def slippage_put (ξm₀ ξm₁ ξ : ℝ) : ℝ := P_P_ξ ξm₁ ξ / P_P_ξ ξm₀ ξ - 1

/-! # §2 — Log-slope and premia -/

-- Prop 1 (§2) — log-slope affine in rapidity
theorem log_σ_eq (w θ : ℝ) (hw0 : 0 < w) (hw1 : w < 1) (hθ0 : 0 < θ) (hθ1 : θ < π / 2) :
    log (σ_θ w θ) = ξ θ - ξ_m w := by
  unfold σ_θ ξ_m ξ
  rw [← Real.log_div (ne_of_gt <| Real.tan_pos_of_pos_of_lt_pi_div_two hθ0 hθ1)
    (ne_of_gt <| div_pos (sub_pos.mpr hw1) hw0), div_div_eq_mul_div]
  ring

-- Cor (§2) — call premium in rapidity
theorem log_P_C_eq (w θ : ℝ) (hw0 : 0 < w) (hw1 : w < 1) (hθ0 : 0 < θ) (hθ1 : θ < π / 2) :
    log (P_C_θ w θ) = -(ξ θ - ξ_m w) := by
  unfold ξ_m ξ P_C_θ
  rw [Real.log_div, Real.log_div, neg_sub] <;>
    linarith [Real.tan_pos_of_pos_of_lt_pi_div_two hθ0 hθ1,
      div_pos (sub_pos.mpr hw1) hw0]

-- Cor (§2) — put premium in rapidity
theorem log_P_P_eq (w θ : ℝ) (hw0 : 0 < w) (hw1 : w < 1) (hθ0 : 0 < θ) (hθ1 : θ < π / 2) :
    log (P_P_θ w θ) = ξ θ - ξ_m w := by
  exact log_σ_eq w θ hw0 hw1 hθ0 hθ1

-- Cor (§2) — premia duality
theorem premia_duality (w θ : ℝ) (hw0 : 0 < w) (hw1 : w < 1) (hθ0 : 0 < θ) (hθ1 : θ < π / 2) :
    P_C_θ w θ * P_P_θ w θ = 1 := by
  unfold P_C_θ P_P_θ σ_θ
  field_simp
  exact div_self (mul_ne_zero (by linarith)
    (ne_of_gt (Real.tan_pos_of_pos_of_lt_pi_div_two hθ0 hθ1)))

-- Bridge: σ_ξ ∘ (ξ_m, ξ) = σ_θ
theorem σ_ξ_eq_σ_θ (w θ : ℝ) (hw0 : 0 < w) (hw1 : w < 1) (hθ0 : 0 < θ) (hθ1 : θ < π / 2) :
    σ_ξ (ξ_m w) (ξ θ) = σ_θ w θ := by
  unfold σ_ξ σ_θ ξ_m ξ
  rw [Real.exp_sub, Real.exp_log (Real.tan_pos_of_pos_of_lt_pi_div_two hθ0 hθ1),
    Real.exp_log (div_pos (by linarith) (by linarith)), div_div_eq_mul_div]
  ring

/-! # §3 — Slope-product invariant -/

-- Thm 1 (§3) — slope-product invariant (ξ-form)
theorem slope_product_ξ (ξm ξ Δξ : ℝ) :
    σ_ξ ξm (ξ + Δξ) * σ_ξ ξm (ξ - Δξ) = (σ_ξ ξm ξ) ^ 2 := by
  unfold σ_ξ; rw [← exp_add]; ring_nf; rw [sq, ← exp_add]; ring_nf

-- Thm 1 (§3) — slope-product invariant (θ-form)
theorem slope_product_θ (w θ θp θm : ℝ)
    (_hw0 : 0 < w) (_hw1 : w < 1)
    (htan : tan θp * tan θm = (tan θ) ^ 2) :
    σ_θ w θp * σ_θ w θm = (σ_θ w θ) ^ 2 := by
  unfold σ_θ; linear_combination' htan * (w / (1 - w)) ^ 2

-- Cor (§3) — hyperbolic-trig structure: integral sum
theorem slope_integral_sum (ξm ξ Δξ : ℝ) :
    (∫ x in ξ..(ξ + Δξ), σ_ξ ξm x) + (∫ x in (ξ - Δξ)..ξ, σ_ξ ξm x) =
    2 * σ_ξ ξm ξ * sinh Δξ := by
  unfold σ_ξ; rw [Real.sinh_eq]; ring;
  simpa [← Real.exp_add] using by ring

-- Cor (§3) — hyperbolic-trig structure: integral product
theorem slope_integral_prod (ξm ξ Δξ : ℝ) :
    (∫ x in ξ..(ξ + Δξ), σ_ξ ξm x) * (∫ x in (ξ - Δξ)..ξ, σ_ξ ξm x) =
    2 * (σ_ξ ξm ξ) ^ 2 * (cosh Δξ - 1) := by
  unfold σ_ξ
  norm_num [Real.cosh_eq, intervalIntegral.integral_comp_sub_right]; ring
  simpa [sq, ← Real.exp_add] using by ring

/-! # §4 — Reciprocal-strike symmetry -/

-- Prop 2 (§4) — reciprocal-strike symmetry
theorem recip_slope_pair (ξm Δ : ℝ) :
    σ_ξ ξm (ξm + Δ) * σ_ξ ξm (ξm - Δ) = 1 := by
  unfold σ_ξ; norm_num [← exp_add]

-- Prop 2 (§4) — tan product at conjugate strikes
theorem tan_product_pair (w : ℝ) (hw0 : 0 < w) (hw1 : w < 1)
    (θ_C θ_P : ℝ) (hθC0 : 0 < θ_C) (hθC1 : θ_C < π / 2) (hθP0 : 0 < θ_P) (hθP1 : θ_P < π / 2)
    (Δ : ℝ) (hC : ξ θ_C = ξ_m w + Δ) (hP : ξ θ_P = ξ_m w - Δ) :
    tan θ_C * tan θ_P = ((1 - w) / w) ^ 2 := by
  apply_fun Real.exp at hC hP
  convert congr_arg₂ (· * ·) hC hP using 1 <;>
    norm_num [Real.exp_add, Real.exp_sub, Real.exp_log, Real.tan_pos_of_pos_of_lt_pi_div_two,
      hw0, hw1, hθC0, hθC1, hθP0, hθP1]
  · rw [show ξ θ_C = Real.log (Real.tan θ_C) by rfl,
      show ξ θ_P = Real.log (Real.tan θ_P) by rfl,
      Real.exp_log (Real.tan_pos_of_pos_of_lt_pi_div_two hθC0 hθC1),
      Real.exp_log (Real.tan_pos_of_pos_of_lt_pi_div_two hθP0 hθP1)]
  · unfold ξ_m; ring_nf; norm_num [Real.exp_ne_zero, Real.exp_log, hw0, hw1]
    field_simp
    ring

-- Prop 2 (§4) — cross-premia equality
theorem cross_premia_eq (ξm Δ : ℝ) :
    P_C_ξ ξm (ξm + Δ) = P_P_ξ ξm (ξm - Δ) := by
  unfold P_C_ξ P_P_ξ; ring_nf

-- Prop 2 (§4) — cross-premia value
theorem cross_premia_val (ξm Δ : ℝ) :
    P_C_ξ ξm (ξm + Δ) = exp (-Δ) := by
  unfold P_C_ξ; ring_nf

-- Prop 2 (§4) — same-side reciprocity
theorem same_side_recip (ξm Δ : ℝ) :
    P_C_ξ ξm (ξm + Δ) * P_C_ξ ξm (ξm - Δ) = 1 := by
  unfold P_C_ξ; rw [← exp_add]; ring_nf; simp [exp_zero]

/-! # §5 — Model C warp dynamics -/

-- Prop 3a (§5) — Model C warp: new curve passes through anchor
theorem warp_passes_anchor (x_0 y_0 x_s y_s σB : ℝ)
    (_hx0 : 0 < x_0) (_hy0 : 0 < y_0) (_hxs : 0 < x_s) (_hys : 0 < y_s) :
    let wn := w₁ x_s y_s σB
    x_0 ^ wn * y_0 ^ (1 - wn) = k₁ x_0 y_0 wn := by
  rfl

-- Prop 3b (§5) — Model C warp: tangent at trade angle on new curve equals σ_B
theorem warp_tangent_eq_σB (x_s y_s σB : ℝ)
    (hxs : 0 < x_s) (hys : 0 < y_s) (hσB : 0 < σB) :
    let wn := w₁ x_s y_s σB
    (1 - wn) / wn * (x_s / y_s) = σB := by
  unfold w₁; field_simp; ring

/-
Thm 2 (§5) — Model C: mode-rapidity shift = ξ_* − ξ_B
-/
theorem mode_shift (w₀ x_s y_s x_B y_B : ℝ)
    (hw0 : 0 < w₀) (hw1 : w₀ < 1) (hxs : 0 < x_s) (hys : 0 < y_s)
    (hxB : 0 < x_B) (hyB : 0 < y_B) :
    let sB := σ_B w₀ x_B y_B
    let wn := w₁ x_s y_s sB
    ξ_m wn - ξ_m w₀ = Real.log (y_s / x_s) - Real.log (y_B / x_B) := by
  unfold σ_B w₁ ξ_m; ring;
  field_simp;
  rw [ ← Real.log_div, ← Real.log_div ] <;> try positivity;
  · congr 1;
    rw [ div_div, div_eq_div_iff ] <;> ring;
    · -- Combine like terms and simplify the expression.
      field_simp
      ring;
    · field_simp;
      exact ne_of_gt ( mul_pos ( mul_pos hxs hyB ) ( add_pos ( mul_pos ( mul_pos hxB hys ) ( by nlinarith ) ) ( mul_pos ( mul_pos ( mul_pos hxs hw0 ) hyB ) ( by nlinarith ) ) ) );
    · positivity;
  · simp +zetaDelta at *;
    exact ⟨ ⟨ by nlinarith [ mul_pos hw0 hxs, mul_pos hw0 hys, mul_pos hw0 hxB, mul_pos hw0 hyB, mul_pos hxs hys, mul_pos hxs hxB, mul_pos hxs hyB, mul_pos hys hxB, mul_pos hys hyB, mul_pos hxB hyB ], by nlinarith [ mul_pos hw0 hxs, mul_pos hw0 hys, mul_pos hw0 hxB, mul_pos hw0 hyB, mul_pos hxs hys, mul_pos hxs hxB, mul_pos hxs hyB, mul_pos hys hxB, mul_pos hys hyB, mul_pos hxB hyB ] ⟩, ⟨ ⟨ by positivity, by positivity ⟩, by positivity ⟩, by nlinarith [ mul_pos hw0 hxs, mul_pos hw0 hys, mul_pos hw0 hxB, mul_pos hw0 hyB, mul_pos hxs hys, mul_pos hxs hxB, mul_pos hxs hyB, mul_pos hys hxB, mul_pos hys hyB, mul_pos hxB hyB ] ⟩;
  · exact div_ne_zero ( by linarith ) ( by linarith )

/-
Cor (§5) — closed form for mode shift in terms of y-displacement (call side)
-/
theorem mode_shift_closed_call (w₀ x_s y_s x_B y_B : ℝ)
    (hw0 : 0 < w₀) (_hw1 : w₀ < 1) (hxs : 0 < x_s) (hys : 0 < y_s)
    (hxB : 0 < x_B) (hyB : 0 < y_B)
    (hcurve : x_s ^ w₀ * y_s ^ (1 - w₀) = x_B ^ w₀ * y_B ^ (1 - w₀)) :
    Real.log (y_s / x_s) - Real.log (y_B / x_B) = (1 / w₀) * Real.log (y_s / y_B) := by
  norm_num [ Real.rpow_def_of_pos, * ] at *;
  simp_all +decide [ ← Real.exp_add, Real.log_div, ne_of_gt ];
  grind

-- Cor (§5) — premium impact at trade point (call)
theorem premium_impact_C (ξm₀ ξm₁ ξ : ℝ) :
    P_C_ξ ξm₁ ξ / P_C_ξ ξm₀ ξ = exp (ξm₁ - ξm₀) := by
  unfold P_C_ξ; rw [← exp_sub]; ring_nf

-- Cor (§5) — premium impact at trade point (put)
theorem premium_impact_P (ξm₀ ξm₁ ξ : ℝ) :
    P_P_ξ ξm₁ ξ / P_P_ξ ξm₀ ξ = exp (-(ξm₁ - ξm₀)) := by
  unfold P_P_ξ; rw [← exp_sub]; ring_nf

-- Cor (§5) — slippage (call side)
theorem slip_call (ξm₀ ξm₁ ξ : ℝ) :
    slippage_call ξm₀ ξm₁ ξ = exp (ξm₁ - ξm₀) - 1 := by
  unfold slippage_call; rw [premium_impact_C]

-- Cor (§5) — slippage (put side)
theorem slip_put (ξm₀ ξm₁ ξ : ℝ) :
    slippage_put ξm₀ ξm₁ ξ = exp (-(ξm₁ - ξm₀)) - 1 := by
  unfold slippage_put; rw [premium_impact_P]

-- Cor (§5) — strike type-flip
theorem strike_type_flip (ξm₀ ξm₁ ξs : ℝ)
    (h : min ξm₀ ξm₁ < ξs ∧ ξs < max ξm₀ ξm₁) :
    (ξs > ξm₀ ↔ ξs < ξm₁) := by
  constructor
  · intro hgt
    by_contra hle
    push_neg at hle
    have := h.2
    simp [max_def] at this
    split_ifs at this with hcmp <;> linarith
  · intro hlt
    by_contra hle
    push_neg at hle
    have := h.1
    simp [min_def] at this
    split_ifs at this with hcmp <;> linarith

end Temporal.Warp
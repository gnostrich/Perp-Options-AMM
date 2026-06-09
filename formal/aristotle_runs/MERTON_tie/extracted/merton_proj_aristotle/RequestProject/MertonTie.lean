import Mathlib

open scoped BigOperators
open scoped Real
open Real

namespace MertonTie

/-- GH/NIG Lévy "jump" part of the Laplace exponent. -/
noncomputable def psiJump (α β δ θ : ℝ) : ℝ :=
  δ * (Real.sqrt (α ^ 2 - β ^ 2) - Real.sqrt (α ^ 2 - (β + θ) ^ 2))

/-- Full GH Laplace exponent (cumulant generating function) with drift `m`. -/
noncomputable def psiGH (m α β δ θ : ℝ) : ℝ := m * θ + psiJump α β δ θ

/-- Merton perpetual-option smooth-pasting boundary (call wing). -/
noncomputable def Sstar (K γ : ℝ) : ℝ := K * γ / (γ + 1)

/-- Effective Gaussian variance = `ψ''(0)` of the jump part. -/
noncomputable def sigmaEff2 (α β δ : ℝ) : ℝ :=
  δ * α ^ 2 / (α ^ 2 - β ^ 2) ^ ((3 : ℝ) / 2)

/-- Carried: ψ is the genuine cgf of the GH/NIG log-price law (Bessel-K normalizer; Mathlib gap). -/
structure GHIsLaplaceExponent (m α β δ : ℝ) : Prop where
  is_cgf : True

/-- Carried: the full distributional GH → Normal limit. -/
structure GaussianLimitOfGH : Prop where
  gh_to_normal : True

/-
G1: with α=γ+1, β=1, the put root θ=−γ keeps the radicand `α²−(β+θ)² = 4γ ≥ 0`.
-/
theorem gh_put_root_in_strip (γ : ℝ) (hγ : 0 ≤ γ) :
    ((γ + 1) ^ 2 - (1 + (-γ)) ^ 2) = 4 * γ ∧ 0 ≤ 4 * γ := by
  constructor <;> linarith

/-
G1': the symmetric call root θ=γ+1 leaves the GH strip (`α²−(β+θ)² = −(2γ+3) < 0`).
-/
theorem gh_call_root_out_of_strip (γ : ℝ) (hγ : 0 < γ) :
    ((γ + 1) ^ 2 - (1 + (γ + 1)) ^ 2) = -(2 * γ + 3) ∧ -(2 * γ + 3) < 0 := by
  exact ⟨ by ring, by linarith ⟩

/-
G2 (Vieta sum): roots −γ, γ+1 of `(σ²/2)λ² + ((r−q)−σ²/2)λ − r` ⇒ sum = 1 ⇒ r = q.
-/
theorem merton_vieta_sum (σ r q : ℝ) (hσ : 0 < σ) :
    (((r - q) - σ ^ 2 / 2) = -(σ ^ 2 / 2) * 1 ↔ r = q) := by
  constructor <;> intro h <;> linarith

/-
G2 (Vieta product): product of roots ⇒ `γ(γ+1) = 2r/σ²` (the σ-knob Gaussian-slice relation).
-/
theorem merton_vieta_prod (σ r γ : ℝ) (hσ : 0 < σ) :
    ((-γ) * (γ + 1) = (-r) / (σ ^ 2 / 2) ↔ γ * (γ + 1) = 2 * r / σ ^ 2) := by
  constructor <;> intro <;> ring_nf at * <;> linarith

/-
G3: the curvature `ψ''(0)` of the jump part equals `sigmaEff2`.
-/
theorem sigmaEff2_closed_form (α β δ : ℝ) (hαβ : β < α) (hβ : 0 ≤ β) (hδ : 0 ≤ δ) :
    HasDerivAt (fun θ => deriv (fun t => psiJump α β δ t) θ) (sigmaEff2 α β δ) 0 := by
  -- To show that the second derivative of psiJump at 0 equals sigmaEff2, we need to compute the first derivative of psiJump.
  have h_first_deriv : ∀ θ, θ ∈ Set.Ioo (-α + β) (α - β) → deriv (fun t => psiJump α β δ t) θ = δ * (β + θ) / Real.sqrt (α^2 - (β + θ)^2) := by
    unfold psiJump; intro θ hθ; norm_num [ add_comm β ] ; ring;
    rw [ deriv_const_sub, deriv_sqrt ] <;> norm_num [ mul_assoc ] <;> ring ; nlinarith [ hθ.1, hθ.2 ] ;
  convert HasDerivAt.congr_of_eventuallyEq ( hasDerivAt_deriv_iff.mpr _ ) ( Filter.eventuallyEq_of_mem ( Ioo_mem_nhds ( by linarith : -α + β < 0 ) ( by linarith : 0 < α - β ) ) h_first_deriv ) using 1;
  · erw [ deriv_div ] <;> norm_num [ add_comm β ];
    · rw [ deriv_sqrt ] <;> norm_num <;> ring;
      · unfold sigmaEff2; rw [ show ( α ^ 2 - β ^ 2 ) ^ ( 3 / 2 : ℝ ) = ( Real.sqrt ( α ^ 2 - β ^ 2 ) ) ^ 3 by rw [ Real.sqrt_eq_rpow, ← Real.rpow_natCast _ 3, ← Real.rpow_mul ( by nlinarith ) ] ; norm_num ] ; ring;
        grind;
      · nlinarith;
    · exact DifferentiableAt.sqrt ( by norm_num ) ( by nlinarith );
    · exact ne_of_gt <| Real.sqrt_pos.mpr <| by nlinarith;
  · exact DifferentiableAt.div ( DifferentiableAt.mul ( differentiableAt_const _ ) ( differentiableAt_id.const_add _ ) ) ( DifferentiableAt.sqrt ( by norm_num [ add_comm β ] ) ( by nlinarith ) ) ( ne_of_gt ( Real.sqrt_pos.mpr ( by nlinarith ) ) )

/-
G3 (Gaussian limit, grounded Tendsto form): α=k, δ=σ²k, k→∞ ⇒ jump → `(σ²/2)((β+θ)²−β²)`.
-/
theorem gaussian_limit_quadratic (σ β θ : ℝ) (hσ : 0 < σ) :
    Filter.Tendsto (fun k : ℝ => psiJump k β (σ ^ 2 * k) θ) Filter.atTop
      (nhds ((σ ^ 2 / 2) * ((β + θ) ^ 2 - β ^ 2))) := by
  unfold psiJump;
  -- We can simplify the expression inside the limit:
  suffices h_simplify : Filter.Tendsto (fun k : ℝ => σ^2 * k * ((β + θ)^2 - β^2) / (Real.sqrt (k^2 - β^2) + Real.sqrt (k^2 - (β + θ)^2))) Filter.atTop (nhds (σ^2 / 2 * ((β + θ)^2 - β^2))) by
    refine h_simplify.congr' ?_;
    filter_upwards [ Filter.eventually_gt_atTop ( |β| + |β + θ| ) ] with k hk;
    rw [ div_eq_iff ];
    · ring;
      rw [ Real.sq_sqrt, Real.sq_sqrt ] <;> cases abs_cases β <;> cases abs_cases ( β + θ ) <;> nlinarith;
    · exact ne_of_gt ( add_pos_of_pos_of_nonneg ( Real.sqrt_pos.mpr ( by cases abs_cases β <;> cases abs_cases ( β + θ ) <;> nlinarith ) ) ( Real.sqrt_nonneg _ ) );
  -- Divide numerator and denominator by $k$:
  suffices h_divide : Filter.Tendsto (fun k => σ ^ 2 * ((β + θ) ^ 2 - β ^ 2) / (Real.sqrt (1 - β ^ 2 / k ^ 2) + Real.sqrt (1 - (β + θ) ^ 2 / k ^ 2))) Filter.atTop (nhds (σ ^ 2 / 2 * ((β + θ) ^ 2 - β ^ 2))) by
    refine h_divide.congr' ?_;
    filter_upwards [ Filter.eventually_gt_atTop 0, Filter.eventually_gt_atTop ( |β| + |β + θ| ) ] with k hk₁ hk₂;
    field_simp [hk₁.ne'];
    norm_num [ hk₁.le, hk₁.ne', div_eq_mul_inv ];
    grind;
  exact le_trans ( tendsto_const_nhds.div ( Filter.Tendsto.add ( Filter.Tendsto.sqrt <| tendsto_const_nhds.sub <| tendsto_const_nhds.div_atTop <| by norm_num ) <| Filter.Tendsto.sqrt <| tendsto_const_nhds.sub <| tendsto_const_nhds.div_atTop <| by norm_num ) <| by positivity ) <| by ring_nf; norm_num;

/-
G4: from value-match + slope-match (the smooth-pasting system), `S` is forced to the Merton
boundary `Kγ/(γ+1)`. (Put eigenfunction wing, reusing the AIRTIGHT `Sstar_A_forced` derivation.)
-/
theorem Sstar_is_merton_boundary (K γ a S : ℝ) (hK : 0 < K) (hγ : 1 < γ) (hS : 0 < S)
    (hv : a * S ^ (-γ) = 1 - S / K)
    (hs : HasDerivAt (fun S => a * S ^ (-γ)) (-1 / K) S) :
    S = Sstar K γ := by
  have h_deriv_eq : -γ * a * S ^ (-γ - 1) = -1 / K := by
    convert HasDerivAt.deriv hs using 1 ; norm_num [ hS.ne' ] ; ring;
  -- Multiply both sides of the derivative equation by S to get -γ * a * S^(-γ) = -S/K.
  have h_mul_S : -γ * a * S ^ (-γ : ℝ) = -S / K := by
    convert congr_arg ( · * S ) h_deriv_eq using 1 <;> ring;
    rw [ show -γ = -1 - γ + 1 by ring, Real.rpow_add hS, Real.rpow_one ] ; ring;
  unfold Sstar;
  grind

end MertonTie

-- Axiom audit for the 6 named G-targets
#print axioms MertonTie.gh_put_root_in_strip
#print axioms MertonTie.gh_call_root_out_of_strip
#print axioms MertonTie.merton_vieta_sum
#print axioms MertonTie.merton_vieta_prod
#print axioms MertonTie.sigmaEff2_closed_form
#print axioms MertonTie.Sstar_is_merton_boundary
#print axioms MertonTie.gaussian_limit_quadratic
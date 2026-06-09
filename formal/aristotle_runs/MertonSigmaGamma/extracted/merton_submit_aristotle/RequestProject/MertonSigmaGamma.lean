/-
  Merton σ↔γ map — the engine's steepness γ is the characteristic exponent.
  The two ITM/American smooth-pasting free boundaries (R1) fix the two roots of the
  perpetual-option (Cauchy–Euler) characteristic quadratic
      char σ r q λ = ½σ²·λ(λ−1) + (r−q)·λ − r .
  Negative root λ₋ = −γ (call-direction boundary Kγ/(γ+1)); positive root λ₊ = γ+1
  (put-direction boundary K(γ+1)/γ). Sum of roots = 1 ⟺ r=q; product gives γ(γ+1)=2r/σ².
  γ>1, σ>0, r>0. Polynomial-in-λ algebra (no rpow).
-/
import Mathlib

namespace MertonSigmaGamma

/-- the perpetual-option characteristic (Cauchy–Euler) quadratic in λ. -/
noncomputable def char (σ r q «λ» : ℝ) : ℝ :=
  (1/2) * σ^2 * «λ» * («λ» - 1) + (r - q) * «λ» - r

/-
λ = −γ is a root, on the zero-carry slice r=q with r = γ(γ+1)σ²/2.
-/
theorem root_neg {σ r q γ : ℝ} (hrq : r = q) (hr : r = γ*(γ+1)*σ^2/2) :
    char σ r q (-γ) = 0 := by
  unfold char; subst hrq; subst hr; ring;

/-
λ = γ+1 is a root, same hypotheses.
-/
theorem root_pos {σ r q γ : ℝ} (hrq : r = q) (hr : r = γ*(γ+1)*σ^2/2) :
    char σ r q (γ+1) = 0 := by
  unfold char; subst hrq; rw [ hr ] ; ring;

/-
the two engine exponents sum to 1 (named anchor of CLAIM 2).
-/
theorem sum_roots (γ : ℝ) : (-γ) + (γ+1) = 1 := by
  ring

/-
the quadratic's sum-of-roots `1 − 2(r−q)/σ²` equals 1 iff r = q.
-/
theorem sum_eq_one_iff_rq {σ r q : ℝ} (hσ : σ ≠ 0) :
    (1 - 2*(r-q)/σ^2) = 1 ↔ r = q := by
  grind +qlia

/-
σ↔γ map: with r=q, the product-of-roots identity `(-γ)(γ+1) = -2r/σ²`
    gives `γ(γ+1) = 2r/σ²`.
-/
theorem sigma_gamma_map {σ r q γ : ℝ} (hσ : σ ≠ 0) (hrq : r = q)
    (hprod : (-γ)*(γ+1) = -2*r/σ^2) :
    γ*(γ+1) = 2*r/σ^2 := by
  linear_combination -hprod

end MertonSigmaGamma
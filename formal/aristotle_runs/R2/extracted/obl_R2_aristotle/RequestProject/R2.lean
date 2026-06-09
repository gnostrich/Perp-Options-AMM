/-
  R2 — crossover-at-K coordinate invariance.
  OTM→ITM crossover solves (o0/S)^γ = θ. sNorm registration θ=(o0/K)^γ ⇒ crossover at S=K ∀γ.
  Ratio registration θ=K/o0 ⇒ crossover drifts to o0^((γ+1)/γ)·K^(−1/γ) (=o0²/K at γ=1); = K iff o0=K.
-/
import Mathlib

open Real

namespace Crossover

/-
sNorm registration: the crossover lands at the dollar strike K for all γ.
-/
theorem crossover_sNorm_at_K {o0 K S γ : ℝ}
    (ho0 : 0 < o0) (hK : 0 < K) (hS : 0 < S) (hγ : 0 < γ)
    (h : (o0 / S) ^ γ = (o0 / K) ^ γ) : S = K := by
  rw [ Real.rpow_left_inj ] at h <;> try positivity;
  grind

/-
ratio registration: closed form of the crossover spot.
-/
theorem crossover_ratio_form {o0 K γ : ℝ}
    (ho0 : 0 < o0) (hK : 0 < K) (hγ : 0 < γ) :
    let S := o0 ^ ((γ + 1)/γ) * K ^ (-(1/γ));
    (o0 / S) ^ γ = K / o0 := by
  convert Real.div_rpow ?_ ?_ _ using 1 <;> ring <;> try positivity;
  rw [ Real.mul_rpow ( by positivity ) ( by positivity ), ← Real.rpow_mul ( by positivity ), ← Real.rpow_mul ( by positivity ) ] ; ring_nf ; norm_num [ hγ.ne' ];
  norm_num [ sq, Real.rpow_add ho0, Real.rpow_neg_one, hγ.ne' ] ; ring;
  rw [ mul_assoc, mul_inv_cancel₀ ( by positivity ), mul_one ]

/-
ratio registration at γ=1: crossover drifts to o0²/K.
-/
theorem crossover_ratio_at_gamma1 {o0 K : ℝ}
    (ho0 : 0 < o0) (hK : 0 < K) :
    o0 ^ ((1 + 1)/(1:ℝ)) * K ^ (-(1/(1:ℝ))) = o0 ^ 2 / K := by
  norm_num [ div_eq_mul_inv, Real.rpow_neg_one ]

/-
NEGATIVE CONTROL: ratio crossover lands at K iff the oracle equals the strike (degenerate).
-/
theorem mixed_basis_control {o0 K : ℝ} (ho0 : 0 < o0) (hK : 0 < K) :
    o0 ^ 2 / K = K ↔ o0 = K := by
  constructor <;> intro h <;> rw [ div_eq_iff ] at * <;> nlinarith

end Crossover
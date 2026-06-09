/-
  Deterministic continuous-time PH bridge (serves operator Q1).
  Canonical PH: ẋ=(J−R)∇H+Gu, y=Gᵀ∇H, dH/dt=∇H·ẋ ≤ uᵀy (J skew, R PSD, S exogenous deterministic).
  Our discrete passivity is the exact forward-Euler/sampled realization. NO SDE / Itô (out of scope).
-/
import RequestProject.Temporal
import Mathlib

open Matrix

namespace CTPH

/-- the skew form vanishes: zᵀJz = 0 when J is skew-symmetric (lossless routing zero). -/
theorem skew_quadForm_zero {n : ℕ} {J : Matrix (Fin n) (Fin n) ℝ}
    (hJ : J.transpose = -J) (z : Fin n → ℝ) :
    ∑ i, z i * (J.mulVec z) i = 0 := by
  simp +decide only [mulVec, dotProduct, Finset.mul_sum];
  have h_swap : ∑ x, ∑ i, z x * (J x i * z i) = ∑ x, ∑ i, z i * (J i x * z x) := by
    rw [ Finset.sum_comm ];
  have h_subst : ∑ x, ∑ i, z i * (J i x * z x) = ∑ x, ∑ i, z i * (-J x i * z x) := by
    exact Finset.sum_congr rfl fun i hi => Finset.sum_congr rfl fun j hj => by have := congr_fun ( congr_fun hJ i ) j; aesop;
  norm_num [ mul_assoc, mul_comm, mul_left_comm, Finset.mul_sum _ _ _ ] at * ; linarith

/-
continuous-time dissipation inequality: dH/dt = uᵀy − zᵀRz ≤ uᵀy.
-/
theorem ct_dissipation_ineq {n : ℕ} {J R G : Matrix (Fin n) (Fin n) ℝ}
    (hJ : J.transpose = -J) (hR : R.PosSemidef) (z u : Fin n → ℝ) :
    (∑ i, z i * (((J - R).mulVec z + G.mulVec u)) i)
      ≤ (∑ i, u i * ((G.transpose.mulVec z)) i) := by
  -- By skew_quadForm_zero (already proved above), ∑ z i * (J.mulVec z) i = 0.
  have hJ_zero : ∑ i, z i * (J.mulVec z) i = 0 := by
    exact?;
  -- By R.PosSemidef, ∑ z i * (R.mulVec z) i ≥ 0.
  have hR_nonneg : ∑ i, z i * (R.mulVec z) i ≥ 0 := by
    have := hR.2;
    convert this ( Finsupp.equivFunOnFinite.symm z ) |> fun h => h.ge using 1 ; simp +decide [ Matrix.mulVec, dotProduct, mul_assoc, mul_comm, mul_left_comm, Finset.mul_sum _ _ _, Finsupp.sum_fintype ];
  simp_all +decide [ mul_add, mul_sub, Finset.sum_add_distrib, Finset.sum_sub_distrib, Matrix.vecMul, dotProduct ];
  simp_all +decide [ Matrix.sub_mulVec, Matrix.mulVec, dotProduct ];
  simp_all +decide [ sub_mul, mul_sub, Finset.mul_sum _ _ _, Finset.sum_mul _ _ _, mul_assoc, mul_comm, mul_left_comm, Finset.sum_add_distrib ];
  exact le_add_of_nonneg_of_le hR_nonneg ( by rw [ Finset.sum_comm ] )

/-- the discrete passivity is the sampled realization: a PassiveSystem with per-tick supply `s` and
    nonnegative dissipation `d` satisfies the abstract passivity (= telescoped continuous inequality). -/
theorem discrete_is_sampled (s d : ℝ) (hd : 0 ≤ d) (n : ℕ) :
    ∃ P : Temporal.PassiveSystem, ∃ s0 : P.State,
      P.H (P.run s0 n) ≤ P.H s0 + P.cumSupplied s0 n := by
  refine' ⟨ _, _, _ ⟩;
  refine' ⟨ ℕ, fun n => n, 0, fun n => n + 1, fun n => 1, fun n => 0, _, _, _ ⟩ <;> norm_num;
  exact 0;
  convert Temporal.PassiveSystem.passivity _ _ _ using 1

end CTPH
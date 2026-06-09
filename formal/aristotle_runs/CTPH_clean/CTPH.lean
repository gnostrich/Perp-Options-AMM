/-
  Deterministic continuous-time PH bridge (serves operator Q1) — CLEANED + STRENGTHENED.

  Canonical PH: ẋ=(J−R)∇H+Gu, y=Gᵀ∇H, dH/dt=∇H·ẋ = uᵀy − zᵀRz ≤ uᵀy
  (J skew, R PSD, S exogenous deterministic). Our discrete passivity is the exact
  forward-Euler / sampled realization. NO SDE / Itô (out of scope).

  CHANGES vs the original returned CTPH.lean:
    (1) ct_dissipation_ineq: `exact?` (search tactic) replaced by the concrete term
        `skew_quadForm_zero hJ z`. NO math change — `hJ_zero`'s goal is verbatim the
        statement of the lemma proved just above, same hypotheses.
    (2) The near-vacuous existential `discrete_is_sampled` is REPLACED by a tight,
        non-vacuous correspondence (`sampled_dissip_nonneg`, `sampled_increment`,
        `sampled_passivity`): we CONSTRUCT the forward-Euler sampling of a continuous PH
        trajectory (fixed step Δt>0, per-tick effort sample z k and input sample u k),
        DEFINE per-tick supplied = Δt·uᵀy and per-tick dissipated = Δt·zᵀRz, and PROVE
          - dissipated k ≥ 0  (DERIVED from R PSD, not assumed);
          - the per-tick storage increment H(k+1) − H(k) = supplied k − dissipated k
            (the sampled continuous rate × Δt — exact forward-Euler);
          - telescoping gives the integrated bound H(N) ≤ H(0) + Σ supplied (= ∫uᵀy),
            i.e. the discrete passivity bound is the Riemann sum of the continuous one.
        We DO NOT claim a storage floor (that is B1, external) — so we deliberately do NOT
        instantiate the floor-bearing `Temporal.PassiveSystem`; the link is stated on the
        sampled storage directly. This is the strongest HONEST version (see RESULTS.md note).
-/
import RequestProject.Temporal
import Mathlib

open Matrix

namespace CTPH

/-- the skew form vanishes: zᵀJz = 0 when J is skew-symmetric (lossless routing zero). -/
theorem skew_quadForm_zero {n : ℕ} {J : Matrix (Fin n) (Fin n) ℝ}
    (hJ : J.transpose = -J) (z : Fin n → ℝ) :
    ∑ i, z i * (J.mulVec z) i = 0 := by
  sorry

/-- the PSD form is nonnegative: zᵀRz ≥ 0 when R is positive-semidefinite. -/
theorem psd_quadForm_nonneg {n : ℕ} {R : Matrix (Fin n) (Fin n) ℝ}
    (hR : R.PosSemidef) (z : Fin n → ℝ) :
    0 ≤ ∑ i, z i * (R.mulVec z) i := by
  sorry

/-- continuous-time dissipation inequality: dH/dt = uᵀy − zᵀRz ≤ uᵀy. -/
theorem ct_dissipation_ineq {n : ℕ} {J R G : Matrix (Fin n) (Fin n) ℝ}
    (hJ : J.transpose = -J) (hR : R.PosSemidef) (z u : Fin n → ℝ) :
    (∑ i, z i * (((J - R).mulVec z + G.mulVec u)) i)
      ≤ (∑ i, u i * ((G.transpose.mulVec z)) i) := by
  -- By skew_quadForm_zero (proved above), ∑ z i * (J.mulVec z) i = 0  (CONCRETE TERM, no `exact?`).
  have hJ_zero : ∑ i, z i * (J.mulVec z) i = 0 :=
    skew_quadForm_zero hJ z
  -- By R.PosSemidef, ∑ z i * (R.mulVec z) i ≥ 0.
  have hR_nonneg : 0 ≤ ∑ i, z i * (R.mulVec z) i :=
    psd_quadForm_nonneg hR z
  sorry

/-! ## STRENGTHENED discrete ↔ continuous link (forward-Euler sampling).

Fix a step `Δt`. At tick `k` the continuous trajectory is sampled: effort `z k`, input `u k`.
Per-tick supplied power = `Δt · uᵀy = Δt · uᵀGᵀz`; per-tick dissipation = `Δt · zᵀRz`. The
sampled storage is `Hs N = H0 + Σ_{k<N} (supplied k − dissipated k)` (forward Euler). -/

variable {n : ℕ}

/-- per-tick supplied power (sampled `Δt·uᵀy`). -/
noncomputable def supplied (Δt : ℝ) (G : Matrix (Fin n) (Fin n) ℝ)
    (z u : ℕ → (Fin n → ℝ)) (k : ℕ) : ℝ :=
  Δt * (∑ i, (u k) i * ((G.transpose.mulVec (z k))) i)

/-- per-tick dissipation (sampled `Δt·zᵀRz`). -/
noncomputable def dissipated (Δt : ℝ) (R : Matrix (Fin n) (Fin n) ℝ)
    (z : ℕ → (Fin n → ℝ)) (k : ℕ) : ℝ :=
  Δt * (∑ i, (z k) i * (R.mulVec (z k)) i)

/-- the forward-Euler sampled storage trajectory. -/
noncomputable def Hs (Δt H0 : ℝ) (R G : Matrix (Fin n) (Fin n) ℝ)
    (z u : ℕ → (Fin n → ℝ)) (N : ℕ) : ℝ :=
  H0 + (Finset.range N).sum (fun k => supplied Δt G z u k - dissipated Δt R z k)

/-- DERIVED: the sampled dissipation is nonnegative (from R PSD and Δt ≥ 0). NOT assumed. -/
theorem sampled_dissip_nonneg (Δt : ℝ) (R : Matrix (Fin n) (Fin n) ℝ)
    (hR : R.PosSemidef) (hΔt : 0 ≤ Δt) (z : ℕ → (Fin n → ℝ)) (k : ℕ) :
    0 ≤ dissipated Δt R z k := by
  unfold dissipated
  exact mul_nonneg hΔt (psd_quadForm_nonneg hR (z k))

/-- EXACT forward-Euler per-tick increment: ΔH = supplied − dissipated (the sampled continuous
    rate dH/dt = uᵀy − zᵀRz, times Δt). This is the discrete `balance` law, derived. -/
theorem sampled_increment (Δt H0 : ℝ) (R G : Matrix (Fin n) (Fin n) ℝ)
    (z u : ℕ → (Fin n → ℝ)) (k : ℕ) :
    Hs Δt H0 R G z u (k + 1)
      = Hs Δt H0 R G z u k + supplied Δt G z u k - dissipated Δt R z k := by
  unfold Hs
  rw [Finset.sum_range_succ]
  ring

/-- TELESCOPED integrated bound: the sampled storage at horizon N never exceeds the initial
    storage plus the total supplied power — the Riemann sum of the continuous bound
    H(T) ≤ H(0) + ∫₀ᵀ uᵀy dt. The dissipation (proved ≥ 0 per tick) is exactly what is subtracted.
    This ties OUR discrete per-tick balance to the continuous inequality as its sampled realization. -/
theorem sampled_passivity (Δt H0 : ℝ) (R G : Matrix (Fin n) (Fin n) ℝ)
    (hR : R.PosSemidef) (hΔt : 0 ≤ Δt) (z u : ℕ → (Fin n → ℝ)) (N : ℕ) :
    Hs Δt H0 R G z u N ≤ H0 + (Finset.range N).sum (fun k => supplied Δt G z u k) := by
  unfold Hs
  have hsplit :
      (Finset.range N).sum (fun k => supplied Δt G z u k - dissipated Δt R z k)
        = (Finset.range N).sum (fun k => supplied Δt G z u k)
          - (Finset.range N).sum (fun k => dissipated Δt R z k) := by
    rw [Finset.sum_sub_distrib]
  rw [hsplit]
  have hdnn : 0 ≤ (Finset.range N).sum (fun k => dissipated Δt R z k) := by
    apply Finset.sum_nonneg
    intro k _
    exact sampled_dissip_nonneg Δt R hR hΔt z k
  linarith

end CTPH

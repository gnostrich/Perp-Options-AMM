import Mathlib

noncomputable section
open Real

structure TemporalAMM where
  alpha : ℝ
  beta  : ℝ
  y     : ℝ
  m     : ℝ
  halpha : 0 < alpha
  hbeta  : 0 < beta
  hy     : beta < y
  hm     : 0 < m

namespace TemporalAMM

/-- a single valid trade: shifts the state coordinate y by D; validity is exactly `beta < y + D`
    (the same precondition the canonical `trade` carries). conserves alpha, beta, m. -/
def trade (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) : TemporalAMM :=
  ⟨P.alpha, P.beta, P.y + D, P.m, P.halpha, P.hbeta, hD, P.hm⟩

/-- the state coordinate of ANY `TemporalAMM` is on the operating domain (`β ≤ y`). -/
theorem state_on_domain (P : TemporalAMM) : P.beta ≤ P.y :=
  le_of_lt P.hy

/-- the post-trade state coordinate is on the operating domain. -/
theorem trade_state_on_domain (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
    (P.trade D hD).beta ≤ (P.trade D hD).y :=
  state_on_domain (P.trade D hD)

/-- the object reached after `k` valid trades, given a per-step validity witness. -/
def iterTrade (P : TemporalAMM) (D : ℕ → ℝ)
    (hvalid : ∀ Q : TemporalAMM, ∀ k : ℕ, Q.beta < Q.y + D k) : ℕ → TemporalAMM
  | 0 => P
  | (k+1) => (iterTrade P D hvalid k).trade (D k) (hvalid (iterTrade P D hvalid k) k)

/-- β is conserved along the trajectory. -/
theorem trade_seq_beta_const (P : TemporalAMM) (D : ℕ → ℝ)
    (hvalid : ∀ Q : TemporalAMM, ∀ k : ℕ, Q.beta < Q.y + D k) :
    ∀ k, (iterTrade P D hvalid k).beta = P.beta := by
  intro k
  induction k with
  | zero => rfl
  | succ k ih =>
    -- `(iterTrade … (k+1)).beta = (iterTrade … k).beta`, since `trade` conserves β
    simp only [iterTrade, trade] at *
    exact ih

/-- every state coordinate along the trajectory is on the operating domain `β ≤ st k`. -/
theorem trade_seq_on_domain (P : TemporalAMM) (D : ℕ → ℝ)
    (hvalid : ∀ Q : TemporalAMM, ∀ k : ℕ, Q.beta < Q.y + D k) :
    ∀ k, P.beta ≤ (iterTrade P D hvalid k).y := by
  intro k
  induction k with
  | zero =>
    -- `iterTrade … 0 = P`, and `P.beta ≤ P.y` from `hy`
    exact state_on_domain P
  | succ k ih =>
    -- `(iterTrade … (k+1)).y = (iterTrade … k).y + D k` exceeds `(iterTrade … k).beta = P.beta`
    have hbeta : (iterTrade P D hvalid k).beta = P.beta :=
      trade_seq_beta_const P D hvalid k
    have hval : (iterTrade P D hvalid k).beta
        < (iterTrade P D hvalid k).y + D k := hvalid (iterTrade P D hvalid k) k
    have : P.beta < (iterTrade P D hvalid k).y + D k := by rw [← hbeta]; exact hval
    show P.beta ≤ (iterTrade P D hvalid (k+1)).y
    simp only [iterTrade, trade]
    exact le_of_lt this

end TemporalAMM

#print axioms TemporalAMM.trade_seq_on_domain
#print axioms TemporalAMM.trade_seq_beta_const

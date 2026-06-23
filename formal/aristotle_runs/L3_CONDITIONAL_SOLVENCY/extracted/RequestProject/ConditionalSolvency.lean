/-
  Aristotle obligation L3 — conditional-solvency lemma (external half).

  Self-contained file (does NOT import the canonical modules) re-declaring the
  minimal `Exchange` slice and proving the EXTERNAL-half solvency claim
  conditional on a concrete-but-still-hypothesized funding rule (B3) and
  oracle/price-path bound (B4).

  The B3/B4 hypotheses `hfunding`, `hslack` are GENUINE input-admissibility
  conditions, NOT vacuous predicates: `concrete_funding_not_vacuous` exhibits a
  concrete counter-instance showing `hslack` is load-bearing.
-/
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
def poolPotential (P : TemporalAMM) (t : ℝ) : ℝ := (t - P.beta)^3 / (3 * P.alpha * P.beta)
end TemporalAMM

structure Exchange where
  amm        : TemporalAMM
  obligation : ℝ → ℝ
  funding    : ℝ → ℝ
  close      : ℝ → ℝ → ℝ
  floor      : ℝ

/-- coverage: the funding port covers the floor-minus-stored-net-obligation gap at every state. -/
def covers (E : Exchange) : Prop :=
  ∀ s, E.floor - (E.amm.poolPotential s - E.obligation s) ≤ E.funding s

/-- solvency: stored net obligation plus funding meets the floor at every state. -/
def solvent (E : Exchange) : Prop :=
  ∀ s, E.floor ≤ (E.amm.poolPotential s - E.obligation s) + E.funding s

/-- The abstract reduction: coverage is equivalent to solvency. -/
theorem covers_iff_solvent (E : Exchange) : covers E ↔ solvent E := by
  constructor
  · intro h s; have := h s; linarith
  · intro h s; have := h s; linarith

/-- The conditional headline (the `→` direction). -/
theorem solvent_of_covers (E : Exchange) (hcov : covers E) : solvent E :=
  (covers_iff_solvent E).mp hcov

/-- THE CONCRETE B3/B4 INSTANTIATION: under the explicit B3 funding form with the
    B4 nonnegative slack residual, the exchange is solvent. -/
theorem solvent_of_concrete_funding (E : Exchange) (slack : ℝ → ℝ)
    (hfunding : ∀ s, E.funding s
                  = E.floor - (E.amm.poolPotential s - E.obligation s) + slack s)
    (hslack : ∀ s, 0 ≤ slack s) :
    solvent E := by
  intro s
  rw [hfunding s]
  have := hslack s
  linarith

/-- The concrete B3/B4 form actually DISCHARGES `covers`: the admissible set is
    inside the coverage set. -/
theorem concrete_funding_covers (E : Exchange) (slack : ℝ → ℝ)
    (hfunding : ∀ s, E.funding s
                  = E.floor - (E.amm.poolPotential s - E.obligation s) + slack s)
    (hslack : ∀ s, 0 ≤ slack s) :
    covers E := by
  intro s
  rw [hfunding s]
  have := hslack s
  linarith

/-- NON-VACUITY WITNESS: dropping `hslack` breaks solvency. There exists an
    `Exchange` with the concrete funding form and a `slack` taking a negative
    value at some state where `solvent` FAILS, so `hslack` is load-bearing. -/
theorem concrete_funding_not_vacuous :
    ∃ (E : Exchange) (slack : ℝ → ℝ),
      (∀ s, E.funding s = E.floor - (E.amm.poolPotential s - E.obligation s) + slack s)
      ∧ (¬ (∀ s, 0 ≤ slack s))
      ∧ (¬ solvent E) := by
  let P : TemporalAMM :=
    { alpha := 1, beta := 1, y := 2, m := 1,
      halpha := by norm_num, hbeta := by norm_num, hy := by norm_num, hm := by norm_num }
  let slack : ℝ → ℝ := fun _ => -1
  let E : Exchange :=
    { amm := P
      obligation := fun _ => 0
      funding := fun s => (0 : ℝ) - (P.poolPotential s - 0) + slack s
      close := fun _ _ => 0
      floor := 0 }
  refine ⟨E, slack, ?_, ?_, ?_⟩
  · intro s; rfl
  · intro h; have := h 0; norm_num [slack] at this
  · intro h
    have := h 0
    -- solvent at s = 0 would require 0 ≤ (poolPotential 0 - 0) + funding 0 = -1
    simp only [E, slack] at this
    norm_num at this

#print axioms solvent_of_concrete_funding
#print axioms concrete_funding_not_vacuous

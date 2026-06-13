/-
  Port-Hamiltonian / passivity formalization (discrete time).

  Design: §1 abstract passive system (curve-agnostic, fully proved);
          §2 barrier-curve symmetries (trade = boost; rebase = scaling; proved);
          §3 a bounded-below funding potential (proved);
          §4 reduction of a concrete instance to §1 via three obligation fields.

  Status legend:
    [PROVED]     proof completed.
    [OBLIGATION] a structure FIELD (a hypothesis), not a `sorry`. The corollaries
                 are explicitly parameterised over these.
-/
import Mathlib

namespace Temporal

/-! ## §1  Abstract passive (port-Hamiltonian) system  [PROVED] -/

/-- A discrete-time passive system. `H` is the stored energy (the equity tank).
    Each tick, stored energy changes by net supplied power through the ports,
    minus a NONNEGATIVE dissipation. `floor` bounds `H` below. -/
structure PassiveSystem where
  State          : Type
  H              : State → ℝ
  floor          : ℝ
  step           : State → State
  supplied       : State → ℝ
  dissipated     : State → ℝ
  dissip_nonneg  : ∀ s, 0 ≤ dissipated s
  balance        : ∀ s, H (step s) = H s + supplied s - dissipated s
  H_floor        : ∀ s, floor ≤ H s

namespace PassiveSystem
variable (P : PassiveSystem)

/-- iterate the dynamics for `n` ticks. -/
def run (s : P.State) : ℕ → P.State
  | 0     => s
  | n + 1 => P.step (run s n)

/-- one-tick dissipation inequality: storage never rises by more than the supply. -/
theorem step_ineq (s : P.State) : P.H (P.step s) ≤ P.H s + P.supplied s := by
  have hd := P.dissip_nonneg s
  have hb := P.balance s
  linarith

/-- cumulative power supplied through the ports over `n` ticks. -/
def cumSupplied (s : P.State) (n : ℕ) : ℝ :=
  (Finset.range n).sum (fun i => P.supplied (P.run s i))

/-- cumulative energy dissipated over `n` ticks. -/
def cumDissip (s : P.State) (n : ℕ) : ℝ :=
  (Finset.range n).sum (fun i => P.dissipated (P.run s i))

theorem cumDissip_nonneg (s : P.State) (n : ℕ) : 0 ≤ P.cumDissip s n := by
  apply Finset.sum_nonneg; intro i _; exact P.dissip_nonneg _

/-- EXACT discrete power balance over `n` ticks (telescoping the per-tick `balance`). -/
theorem energy_balance (s : P.State) (n : ℕ) :
    P.H (P.run s n) = P.H s + P.cumSupplied s n - P.cumDissip s n := by
  induction n with
  | zero => simp [run, cumSupplied, cumDissip]
  | succ k ih =>
    have hrun : P.run s (k + 1) = P.step (P.run s k) := rfl
    have hb := P.balance (P.run s k)
    have hs : P.cumSupplied s (k + 1)
            = P.cumSupplied s k + P.supplied (P.run s k) := by
      simp [cumSupplied, Finset.sum_range_succ]
    have hdd : P.cumDissip s (k + 1)
             = P.cumDissip s k + P.dissipated (P.run s k) := by
      simp [cumDissip, Finset.sum_range_succ]
    rw [hrun, hb, hs, hdd, ih]; ring

/-- PASSIVITY: stored energy at time `n` ≤ initial storage + total supplied.
    The system cannot manufacture energy; it can only store, route, or dissipate. -/
theorem passivity (s : P.State) (n : ℕ) :
    P.H (P.run s n) ≤ P.H s + P.cumSupplied s n := by
  have hb := P.energy_balance s n
  have hd := P.cumDissip_nonneg s n
  linarith

/-- SOLVENCY: the tank never drops below the floor — for any input, any horizon. -/
theorem solvent (s : P.State) (n : ℕ) : P.floor ≤ P.H (P.run s n) :=
  P.H_floor _

/-- NO-FREE-LUNCH over a closed cycle: if after `n` ticks storage returns to its
    starting value and no net energy was supplied, then NOTHING was dissipated
    and the net supply was exactly zero — the loop yields nothing. -/
theorem closed_cycle (s : P.State) (n : ℕ)
    (hcycle : P.H (P.run s n) = P.H s) (hsupply : P.cumSupplied s n ≤ 0) :
    P.cumDissip s n = 0 ∧ P.cumSupplied s n = 0 := by
  have hb := P.energy_balance s n
  have hd := P.cumDissip_nonneg s n
  have heq : P.cumSupplied s n = P.cumDissip s n := by linarith
  refine ⟨by linarith, by linarith⟩

end PassiveSystem

/-! ## §2  Barrier AMM symmetries  [PROVED] -/

namespace Barrier

/-- shifted-reserve invariant Φ = X·Y. -/
def Phi (X Y : ℝ) : ℝ := X * Y

/-- a trade of rapidity δ is the squeeze/boost map. -/
noncomputable def boost (δ X Y : ℝ) : ℝ × ℝ := (Real.exp δ * X, Real.exp (-δ) * Y)

/-- trades CONSERVE the invariant: the interconnection is power-continuous. -/
theorem boost_preserves_Phi (δ X Y : ℝ) :
    Phi (boost δ X Y).1 (boost δ X Y).2 = Phi X Y := by
  simp only [Phi, boost]
  rw [show Real.exp δ * X * (Real.exp (-δ) * Y)
        = (Real.exp δ * Real.exp (-δ)) * (X * Y) by ring,
      ← Real.exp_add, add_neg_cancel, Real.exp_zero, one_mul]

/-- a zero trade is the identity. -/
theorem boost_zero (X Y : ℝ) : boost 0 X Y = (X, Y) := by
  simp [boost]

/-- GROUP LAW: trades compose additively in rapidity (a one-parameter group). -/
theorem boost_add (δ₁ δ₂ X Y : ℝ) :
    boost δ₁ (boost δ₂ X Y).1 (boost δ₂ X Y).2 = boost (δ₁ + δ₂) X Y := by
  simp only [boost, Prod.mk.injEq]
  refine ⟨?_, ?_⟩
  · rw [← mul_assoc, ← Real.exp_add]
  · rw [← mul_assoc, ← Real.exp_add, ← neg_add]

/-- rebase-invariant pricing coordinate. -/
noncomputable def sNorm (X α : ℝ) : ℝ := X / α

/-- GAUGE SYMMETRY: sNorm is degree-0 under the rescaling (X,α) ↦ (λX,λα). -/
theorem sNorm_rebase_invariant (lam X α : ℝ) (hl : lam ≠ 0) :
    sNorm (lam * X) (lam * α) = sNorm X α := by
  unfold sNorm
  rw [mul_div_mul_left _ _ hl]

end Barrier

/-! ## §3  The funding well  [PROVED] -/

namespace Funding

/-- funding potential: integral of the funding force (S−1)/S. -/
noncomputable def Hwell (S : ℝ) : ℝ := S - Real.log S

/-- the well is bounded below by its anchor minimum (1), via `log x ≤ x − 1`. -/
theorem Hwell_bddBelow {S : ℝ} (hS : 0 < S) : 1 ≤ Hwell S := by
  have h := Real.log_le_sub_one_of_pos hS
  unfold Hwell
  linarith

end Funding

/-! ## §4  Concrete instance + the three bridge obligations. -/

/-- Engine data needed to instantiate the passive system, with the three bridge
    obligations carried as fields. -/
structure TemporalAMM where
  S            : Type
  /-- storage `H`: pool EQUITY = reserves − obligations (the tank). -/
  equity       : S → ℝ
  solvFloor    : ℝ
  /-- one protocol tick (trade / funding accrual / settlement / oracle move). -/
  tick         : S → S
  /-- net power IN through the ports: premium + oracle-drive + hedge + LP in/out. -/
  portFlow     : S → ℝ
  /-- energy dissipated this tick: the arb / LVR leak. -/
  arbLeak      : S → ℝ
  /-- [OBLIGATION B3]  arb dissipation is one-way (LVR ≥ 0). -/
  arb_nonneg   : ∀ s, 0 ≤ arbLeak s
  /-- [OBLIGATION B4]  the per-tick ledger closes (closed-book identity, all ports). -/
  ledger       : ∀ s, equity (tick s) = equity s + portFlow s - arbLeak s
  /-- [OBLIGATION B1]  storage bounded below (real solvency floor, γ>1 included). -/
  solvent      : ∀ s, solvFloor ≤ equity s

/-- the reduction: a `TemporalAMM` with its obligations discharged is a passive system. -/
def TemporalAMM.toPassiveSystem (M : TemporalAMM) : PassiveSystem where
  State         := M.S
  H             := M.equity
  floor         := M.solvFloor
  step          := M.tick
  supplied      := M.portFlow
  dissipated    := M.arbLeak
  dissip_nonneg := M.arb_nonneg
  balance       := M.ledger
  H_floor       := M.solvent

/-- COROLLARY 1 — the engine is passive (cannot manufacture value). -/
theorem TemporalAMM.passivity (M : TemporalAMM) (s : M.S) (n : ℕ) :
    M.toPassiveSystem.H (M.toPassiveSystem.run s n)
      ≤ M.toPassiveSystem.H s + M.toPassiveSystem.cumSupplied s n :=
  M.toPassiveSystem.passivity s n

/-- COROLLARY 2 — the engine is solvent for all time. -/
theorem TemporalAMM.solvent_forever (M : TemporalAMM) (s : M.S) (n : ℕ) :
    M.solvFloor ≤ M.equity (M.toPassiveSystem.run s n) :=
  M.toPassiveSystem.solvent s n

/-- COROLLARY 3 — a clean closed cycle pays nothing (no pumping loop). -/
theorem TemporalAMM.no_free_lunch (M : TemporalAMM) (s : M.S) (n : ℕ)
    (hcycle : M.equity (M.toPassiveSystem.run s n) = M.equity s)
    (hsupply : M.toPassiveSystem.cumSupplied s n ≤ 0) :
    M.toPassiveSystem.cumDissip s n = 0 ∧ M.toPassiveSystem.cumSupplied s n = 0 :=
  M.toPassiveSystem.closed_cycle s n hcycle hsupply

end Temporal

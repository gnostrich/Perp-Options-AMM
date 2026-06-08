# Lean 4 task: typecheck and harden a port-Hamiltonian / passivity formalization

## Task

Below is a self-contained Lean 4 file (uses Mathlib). It has **not been compiled**.
Please:

1. **Typecheck it** against a current Lean 4 + Mathlib toolchain.
2. **Fix any syntax or Mathlib API drift** in the *proved* lemmas so the file
   compiles. (Likely suspects, named in case they've moved: `Real.exp_add`,
   `add_neg_cancel`, `Real.exp_zero`, `mul_div_mul_left`,
   `Real.log_le_sub_one_of_pos`, `Finset.sum_range_succ`, `Finset.sum_nonneg`.)
3. The three fields marked **[OBLIGATION B1/B3/B4]** on `structure TemporalAMM`
   are **deliberate hypotheses**, not goals for this pass. Leave them as fields.
   Do **not** stub them, and do **not** add them as axioms.
4. Everything else must compile with **no `sorry`, no `admit`, no `axiom`, and no
   `native_decide`**. If any proved lemma cannot be closed, leave it explicit and
   say why rather than papering over it.

## Report back

- Whether the file compiles (and the exact toolchain/Mathlib version).
- A diff or list of every change you made.
- Explicit confirmation that the proved core contains no `sorry` / `admit` /
  `axiom` / `native_decide`.
- Any lemma you could not close, with the blocking goal state.

## What the file encodes (context, self-contained)

The protocol being modeled is a constant-function market maker whose reserves back
a family of options; its solvency is to be established as **passivity** of a
discrete-time **port-Hamiltonian system**:

- `H` is a stored-energy / storage function (the pool's equity: reserves minus
  obligations). `floor` is a solvency floor below which `H` must never fall.
- Each tick, `H` changes by the net power **supplied** through external ports
  minus a **nonnegative dissipation** (an arbitrage / loss-versus-rebalancing leak).
- **§1** defines the abstract passive system and proves, curve-agnostically:
  a per-tick inequality, an exact telescoped power balance, **passivity**
  (`H` after n ticks ≤ initial `H` + total supplied — energy cannot be
  manufactured), **solvency** (given the floor holds), and a **no-free-lunch**
  result (a closed cycle with no net supply dissipates nothing and nets zero —
  i.e. no round-trip can pump value).
- **§2** models a trade as a hyperbolic boost on the invariant `Φ = X·Y` and
  proves trades conserve `Φ` (a power-continuous interconnection), compose as a
  one-parameter group, and that the normalized pricing coordinate `sNorm = X/α`
  is invariant under the rescaling `(X,α) ↦ (λX, λα)` (a gauge symmetry).
- **§3** proves the funding potential `H_well(S) = S − log S` is bounded below by
  its anchor minimum at `S = 1` — a concrete instance of a bounded-below storage.
- **§4** reduces a concrete instance (`TemporalAMM`) to the §1 abstract system.
  The reduction needs exactly three facts about the real engine, carried as the
  fields **B1/B3/B4**. Once those hold, passivity / solvency / no-free-lunch
  transfer to the instance as the three final corollaries.

### The three obligations (deliberately left as hypotheses)

- **B3 `arb_nonneg`** — the per-tick dissipation (arb/LVR leak) is `≥ 0`.
- **B4 `ledger`** — the per-tick books close exactly:
  `equity(tick s) = equity s + portFlow s − arbLeak s`, where `portFlow` is the
  net power through all ports (premium, settlement, oracle-drive, hedge, LP in/out).
- **B1 `solvent`** — `H` (the equity) is bounded below by `floor` for all states,
  with the convex obligations included. (§3 proves the same *shape* for a model
  potential; B1 is the real version.)

These are the genuine open work for later passes; for this pass they stay as
fields and the file should compile with them as hypotheses.

---

## The file

```lean
/-
  Port-Hamiltonian / passivity formalization (discrete time).
  This file has NOT been compiled; please typecheck and fix API drift.

  Design: §1 abstract passive system (curve-agnostic, fully proved);
          §2 barrier-curve symmetries (trade = boost; rebase = scaling; proved);
          §3 a bounded-below funding potential (proved);
          §4 reduction of a concrete instance to §1 via three obligation fields.

  Status legend:
    [PROVED]     proof completed (modulo Mathlib API names).
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
def boost (δ X Y : ℝ) : ℝ × ℝ := (Real.exp δ * X, Real.exp (-δ) * Y)

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
def sNorm (X α : ℝ) : ℝ := X / α

/-- GAUGE SYMMETRY: sNorm is degree-0 under the rescaling (X,α) ↦ (λX,λα). -/
theorem sNorm_rebase_invariant (lam X α : ℝ) (hl : lam ≠ 0) :
    sNorm (lam * X) (lam * α) = sNorm X α := by
  unfold sNorm
  rw [mul_div_mul_left _ _ hl]

end Barrier

/-! ## §3  The funding well  [PROVED] -/

namespace Funding

/-- funding potential: integral of the funding force (S−1)/S. -/
def Hwell (S : ℝ) : ℝ := S - Real.log S

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
```

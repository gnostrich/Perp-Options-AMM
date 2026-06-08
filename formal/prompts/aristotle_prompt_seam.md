# Lean 4 task: wire the curve up into the passivity scaffold (the middle seams)

## Context for the project

Two modules are already in this project and are **verified — do not modify them**:

- `RequestProject/AMMCurve.lean` — namespace `TemporalCurve`. Provides
  `structure AMMCurve` (fields `dom, convex_dom, y, antitone_y, convex_y, coercive`),
  `AMMCurve.poolValue C p := sInf ((fun x => p*x + C.y x) '' C.dom)`, and the proved
  `AMMCurve.poolValue_concaveOn` and `AMMCurve.hedge_gap_concaveOn`. Also the
  instances `cpmm (k) (hk) : AMMCurve` (frontier `k/x` on `Ioi 0`) and `expPool`.
- `RequestProject/Temporal.lean` — namespace `Temporal`. Provides the abstract
  `structure PassiveSystem` and its proved theorems (`passivity`, `solvent`,
  `closed_cycle`), and `structure TemporalAMM` (fields `S, equity, solvFloor, tick,
  portFlow, arbLeak, arb_nonneg [B3], ledger [B4], solvent [B1]`) with
  `TemporalAMM.toPassiveSystem` and the three corollaries `passivity`,
  `solvent_forever`, `no_free_lunch`.

This task adds a **new** module `RequestProject/Seam.lean` that joins them. The lib
glob `RequestProject.+` already picks up new files.

## What the new module encodes

Right now the curve layer and the passivity layer are both verified but **sit side
by side, unconnected**: `AMMCurve.poolValue` is never wired into `TemporalAMM.equity`.
This module builds the two missing seams as **typed contracts**, so a change to the
curve is forced to propagate consistently up to the solvency guarantee:

- **Seam 1 (price → value):** `intrinsic C O p := poolValue C p − O p` — the
  reserves-minus-obligations value. It reads only the curve's `poolValue` and the
  obligation, never the curve internals. The curve's short-gamma propagates here:
  `intrinsic` is concave (one line from `hedge_gap_concaveOn`).
- **Seam 2 (value → storage):** `structure CurvePool` builds a `TemporalAMM` whose
  `equity` is **transparently** `intrinsic (price s) + support s` — reserve value
  from the curve, plus the accrued external port. Equity is no longer a black box;
  its reserve part is the curve's concave value, and the solvency field **B1** is now
  visibly a statement that the **port covers the curve's concave deficit**.
- **The join:** `CurvePool.toTemporalAMM` → `toPassiveSystem`, re-exporting
  `passivity` and `solvent_forever` for the curve-derived pool. Swap the curve and
  the reserve part of storage changes, short-gamma re-propagates, and B1's burden
  visibly stays on the port.
- **The port is load-bearing, not decorative:** with a genuine convex obligation the
  reserve value alone has **no floor** (`reserves_have_no_floor`) — so solvency is a
  *port* property, not a *reserve* property. This is "convexity must be funded,"
  proved at the storage interface.

## Task

Below is the new file. It has **not been compiled**. Please:

1. Add it as `RequestProject/Seam.lean`; **do not edit the two verified modules**.
2. Typecheck against Lean 4.28.0 + Mathlib v4.28.0; fix any API / `unfold`-name /
   defeq drift (the structural reductions rely on `equity`/`solvFloor` unfolding to
   match the `TemporalAMM` fields — adjust with `show`/`fun s => …` if a field
   assignment doesn't line up definitionally).
3. **Close the one `sorry`** (`reserves_have_no_floor`) with a real proof — strategy
   is in the comment. If it is genuinely blocked, leave it explicit and **report the
   blocking goal state**; do **not** use `sorry`/`admit`/`axiom`/`native_decide`.
4. Everything else is provided as complete proofs/reductions; make them compile.
5. Final file: no `sorry`/`admit`/`axiom`/`native_decide`.

## Report back

- Compile status and exact toolchain / Mathlib version (confirm the two existing
  modules were left unchanged).
- Every change made.
- Confirmation of no `sorry`/`admit`/`axiom`/`native_decide`.
- `#print axioms` on `TemporalSeam.intrinsic_concaveOn`,
  `TemporalSeam.CurvePool.solvent_forever`, and
  `TemporalSeam.reserves_have_no_floor` (expected: `propext`, `Classical.choice`,
  `Quot.sound`).
- Any goal you could not close, with its state.

---

## The file

```lean
/-
  Middle seams: wire the curve's `poolValue` up through the value layer into the
  passivity scaffold's storage `H`, as typed contracts. Imports the two verified
  modules; adds nothing to them.

  NOT yet compiled — please typecheck, fix API/defeq drift, and close the one `sorry`
  (`reserves_have_no_floor`).
-/
import RequestProject.AMMCurve
import RequestProject.Temporal

namespace TemporalSeam

open TemporalCurve Temporal

/-! ## Seam 1 — price → value.  Short-gamma propagates into the stored value. -/

/-- intrinsic (reserve) equity at price `p`: pool value minus the value of the
    convex claim the pool owes. Reads only `poolValue` + obligation. -/
noncomputable def intrinsic (C : AMMCurve) (O : ℝ → ℝ) (p : ℝ) : ℝ :=
  C.poolValue p - O p

/-- PROPAGATION: the curve's short-gamma reaches the storage layer — intrinsic
    reserve value is concave in price for EVERY valid curve. -/
theorem intrinsic_concaveOn (C : AMMCurve) {O : ℝ → ℝ}
    (hO : ConvexOn ℝ (Set.Ioi 0) O) :
    ConcaveOn ℝ (Set.Ioi 0) (intrinsic C O) := by
  unfold intrinsic
  exact C.hedge_gap_concaveOn hO

/-- the value sits at or below every reserve-point line — it is an infimum.
    (A useful contract fact: gives upper bounds on `poolValue` from any point.) -/
theorem poolValue_le_line (C : AMMCurve) {p x₀ : ℝ} (hp : 0 < p) (hx₀ : x₀ ∈ C.dom) :
    C.poolValue p ≤ p * x₀ + C.y x₀ := by
  unfold AMMCurve.poolValue
  exact csInf_le (C.coercive hp) (Set.mem_image_of_mem _ hx₀)

/-! ## Seam 2 — value → storage.  Equity is built transparently from the curve. -/

/-- A pool whose storage is wired to a curve: state carries a positive `price`, the
    reserve value comes from the curve via `intrinsic`, and `support` is the accrued
    external port (funding / hedge). Obligation fields mirror `TemporalAMM`. -/
structure CurvePool where
  C          : AMMCurve
  O          : ℝ → ℝ
  hO         : ConvexOn ℝ (Set.Ioi 0) O
  S          : Type
  price      : S → ℝ
  price_pos  : ∀ s, 0 < price s
  support    : S → ℝ
  solvFloor  : ℝ
  tick       : S → S
  portFlow   : S → ℝ
  arbLeak    : S → ℝ
  /-- [B3] arb dissipation one-way. -/
  arb_nonneg : ∀ s, 0 ≤ arbLeak s
  /-- [B4] ledger closes on equity = intrinsic(price) + support. -/
  ledger     : ∀ s,
      (intrinsic C O (price (tick s)) + support (tick s))
        = (intrinsic C O (price s) + support s) + portFlow s - arbLeak s
  /-- [B1] solvency: the port covers the curve's concave deficit down to the floor. -/
  solvent    : ∀ s, solvFloor ≤ intrinsic C O (price s) + support s

namespace CurvePool
variable (P : CurvePool)

/-- the wired equity tank. -/
noncomputable def equity (s : P.S) : ℝ := intrinsic P.C P.O (P.price s) + P.support s

/-- the reserve part of storage is concave in price (short-gamma, inherited). -/
theorem reservePart_concaveOn :
    ConcaveOn ℝ (Set.Ioi 0) (intrinsic P.C P.O) :=
  intrinsic_concaveOn P.C P.hO

/-- JOIN: a curve-wired pool reduces to the abstract engine instance. -/
noncomputable def toTemporalAMM : TemporalAMM where
  S          := P.S
  equity     := P.equity
  solvFloor  := P.solvFloor
  tick       := P.tick
  portFlow   := P.portFlow
  arbLeak    := P.arbLeak
  arb_nonneg := P.arb_nonneg
  ledger     := P.ledger
  solvent    := P.solvent

/-- COROLLARY — the curve-wired engine is passive. -/
theorem passivity (s : P.S) (n : ℕ) :
    P.toTemporalAMM.toPassiveSystem.H (P.toTemporalAMM.toPassiveSystem.run s n)
      ≤ P.toTemporalAMM.toPassiveSystem.H s
        + P.toTemporalAMM.toPassiveSystem.cumSupplied s n :=
  P.toTemporalAMM.passivity s n

/-- COROLLARY — the curve-wired engine is solvent for all time. -/
theorem solvent_forever (s : P.S) (n : ℕ) :
    P.solvFloor ≤ P.equity (P.toTemporalAMM.toPassiveSystem.run s n) :=
  P.toTemporalAMM.solvent_forever s n

end CurvePool

/-! ## A concrete end-to-end instance — the whole stack instantiates. -/

/-- constant-product reserves, trivial obligation, single state; the port (here 0)
    meets a floor at the value of `poolValue` at price 1. Shows the curve→guarantees
    chain fires concretely. -/
noncomputable def demoPool (k : ℝ) (hk : 0 < k) : CurvePool where
  C          := cpmm k hk
  O          := fun _ => 0
  hO         := convexOn_const (0 : ℝ) (convex_Ioi 0)
  S          := Unit
  price      := fun _ => 1
  price_pos  := fun _ => one_pos
  support    := fun _ => 0
  solvFloor  := intrinsic (cpmm k hk) (fun _ => 0) 1
  tick       := id
  portFlow   := fun _ => 0
  arbLeak    := fun _ => 0
  arb_nonneg := fun _ => le_refl 0
  ledger     := by intro s; ring
  solvent    := by intro s; simp

/-! ## The port is load-bearing, not decorative.

    With a genuine convex obligation the RESERVE value alone has no lower bound — so
    the solvency floor B1 cannot be met from reserves; it is a PORT property. This is
    "convexity must be funded," at the storage interface. -/

/-- upper bound on constant-product pool value: `poolValue p ≤ p + k` (take `x₀ = 1`). -/
theorem cpmm_poolValue_le (k : ℝ) (hk : 0 < k) {p : ℝ} (hp : 0 < p) :
    (cpmm k hk).poolValue p ≤ p + k := by
  have h := poolValue_le_line (cpmm k hk) (x₀ := 1) hp (by
    show (1 : ℝ) ∈ Set.Ioi 0; exact Set.mem_Ioi.mpr one_pos)
  -- (cpmm k hk).y 1 = k / 1 = k ; p * 1 = p
  simpa [cpmm] using h

/-- reserves cannot floor a strictly convex obligation: with `O p = p^2`, the
    reserve value `intrinsic p = poolValue p − p^2 ≤ (p + k) − p^2 → −∞`.

    Strategy: given a candidate lower bound `b`, pick `p := |b| + k + 2` (so `p ≥ 2`,
    hence `p^2 ≥ 2p`, hence `p + k − p^2 ≤ k − p = −|b| − 2 < b`). That `p ∈ Ioi 0`
    and `intrinsic p ≤ p + k − p^2 < b`, contradicting `BddBelow`. -/
theorem reserves_have_no_floor (k : ℝ) (hk : 0 < k) :
    ¬ BddBelow ((intrinsic (cpmm k hk) (fun p => p ^ 2)) '' (Set.Ioi 0)) := by
  sorry

end TemporalSeam
```

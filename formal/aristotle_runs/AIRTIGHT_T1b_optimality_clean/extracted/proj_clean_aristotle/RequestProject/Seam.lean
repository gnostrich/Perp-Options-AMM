/-
  Middle seams: wire the curve's `poolValue` up through the value layer into the
  passivity scaffold's storage `H`, as typed contracts. Imports the two verified
  modules; adds nothing to them.
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
  simpa [cpmm] using h

/-
reserves cannot floor a strictly convex obligation: with `O p = p^2`, the
    reserve value `intrinsic p = poolValue p − p^2 ≤ (p + k) − p^2 → −∞`.
-/
theorem reserves_have_no_floor (k : ℝ) (hk : 0 < k) :
    ¬ BddBelow ((intrinsic (cpmm k hk) (fun p => p ^ 2)) '' (Set.Ioi 0)) := by
  intro ⟨ b, hb ⟩;
  -- We need to show that for any lower bound $b$, there exists $p > 0$ such that $intrinsic p < b$.
  have h_exists_p : ∀ b : ℝ, ∃ p > 0, intrinsic (cpmm k hk) (fun p => p^2) p < b := by
    intro b
    obtain ⟨ p, hp_pos, hp_lt ⟩ : ∃ p > 0, p + k - p^2 < b := by
      exact ⟨ |b| + k + 2, by positivity, by cases abs_cases b <;> nlinarith ⟩;
    exact ⟨ p, hp_pos, lt_of_le_of_lt ( sub_le_sub_right ( cpmm_poolValue_le k hk hp_pos ) _ ) hp_lt ⟩;
  exact absurd ( h_exists_p b ) ( by rintro ⟨ p, hp₀, hp ⟩ ; linarith [ hb ⟨ p, hp₀, rfl ⟩ ] )

end TemporalSeam
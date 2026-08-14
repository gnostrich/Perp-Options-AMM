/-
LINK_SETTLEMENT — MISSING FORMAL LINK (b): settlement units → cash ("station 17").

CONTEXT. The mechanism marks every option leg as a FRACTION OF ONE ESCROW UNIT: a leg
of signed notional `q i` at strike `i` with mark `V i` is worth `q i * V i` PERP UNITS.
Legs then net IN PERP UNITS, and dollars enter at exactly ONE place — the exit — where
the net unit position is multiplied by the carved slice's CLOSING equity `E` and the
leverage constant `L₀`. "One doorway from perp-land to cash-land, and it's at the exit."

That design is currently asserted, not proved. This file states and proves what it buys,
and — the part that matters — that it is FORCED: any settlement that converted units to
cash with a STRIKE-DEPENDENT factor would admit a costless, unbounded arbitrage.

WHAT IS TO BE PROVED.
  §1 conservation/netting: `units` is additive and homogeneous, so netting legs in perp
     units is well defined; the doorway is sign-faithful (`cash_pos_iff`, `cash_zero_iff`)
     — it neither creates nor destroys value nor flips its sign.
  §2 exit-timing safety: a zero-net-unit position settles to zero cash whatever the
     closing equity and leverage are (`exit_timing_irrelevant`) — the doorway cannot be
     arbitraged by choosing WHEN to walk through it.
  §3 THE NECESSITY THEOREM (`doorway_arbfree_iff_common`): a per-strike conversion factor
     `F` is arbitrage-free IFF it is constant. One direction is trivial; the other builds
     the explicit zero-unit / positive-cash portfolio, and `per_strike_doorway_unbounded_arb`
     shows the profit is unbounded, so this is a real arbitrage and not a rounding.
  §4 the tie-back: with the constant factor `E * L` the per-strike form IS station 17.

There is NO project context to respect here; the file is self-contained over Mathlib.
`ℝ`-valued `q` (signed notionals: longs and shorts), strictly positive marks `V`.
-/

import Mathlib.Tactic
import Mathlib.Algebra.BigOperators.Fin

namespace LinkSettlement

open scoped BigOperators

variable {n : ℕ}

/-! ## §0 The objects -/

/-- The net position IN PERP UNITS of a portfolio of legs: leg `i` carries signed
notional `q i` at a strike whose mark (a fraction of one escrow unit) is `V i`. -/
def units (V q : Fin n → ℝ) : ℝ := ∑ i, q i * V i

/-- STATION 17 as built: the single doorway at the exit. The net unit position is
converted ONCE, by a factor common to every leg — the carved slice's closing equity `E`
times the leverage constant `L₀`. -/
def cashOne (E L : ℝ) (V q : Fin n → ℝ) : ℝ := units V q * (E * L)

/-- The counterfactual the necessity theorem rules out: a doorway whose conversion factor
`F i` depends on WHICH STRIKE the leg came from (equivalently, converting each leg to cash
as it settles rather than netting first). -/
def cashPer (F V q : Fin n → ℝ) : ℝ := ∑ i, q i * V i * F i

/-! ## §1 Conservation: netting is well defined and the doorway is sign-faithful -/

theorem units_add (V q q' : Fin n → ℝ) :
    units V (q + q') = units V q + units V q' := by
  simp [units, add_mul, Finset.sum_add_distrib]

theorem units_smul (c : ℝ) (V q : Fin n → ℝ) :
    units V (c • q) = c * units V q := by
  simp [units, Finset.mul_sum, mul_assoc]

theorem cashOne_add (E L : ℝ) (V q q' : Fin n → ℝ) :
    cashOne E L V (q + q') = cashOne E L V q + cashOne E L V q' := by
  simp [cashOne, units_add, add_mul]

/-- NO VALUE IS CREATED AT THE DOORWAY: zero net units settles to zero cash. -/
theorem cashOne_zero_iff {E L : ℝ} (hE : 0 < E) (hL : 0 < L) (V q : Fin n → ℝ) :
    cashOne E L V q = 0 ↔ units V q = 0 := by
  have h : E * L ≠ 0 := ne_of_gt (mul_pos hE hL)
  simp [cashOne, mul_eq_zero, h]

/-- AND THE DOORWAY CANNOT FLIP A SIGN: a unit gain is a cash gain and a unit loss is a
cash loss, whatever the closing equity is. -/
theorem cashOne_pos_iff {E L : ℝ} (hE : 0 < E) (hL : 0 < L) (V q : Fin n → ℝ) :
    0 < cashOne E L V q ↔ 0 < units V q := by
  simpa [cashOne] using
    (mul_pos_iff_of_pos_right (mul_pos hE hL) (a := units V q))

/-! ## §2 Exit-timing safety -/

/-- A FLAT POSITION IS FLAT AT EVERY EXIT. If the legs net to zero perp units, the cash
settlement is zero for EVERY closing equity and EVERY leverage — so the holder of a
netted-flat book cannot manufacture a payout by choosing the moment (or the price) at
which the doorway is crossed. This is the precise safety content of "dollars enter only
at the very end". -/
theorem exit_timing_irrelevant {V q : Fin n → ℝ} (h : units V q = 0) (E L E' L' : ℝ) :
    cashOne E L V q = cashOne E' L' V q := by
  simp [cashOne, h]

/-! ### Helper constructions for §3 (the explicit two-leg arbitrage portfolio) -/

/-- The explicit witness portfolio: long `1 / V i` at strike `i`, short `1 / V j` at
strike `j`, flat everywhere else. -/
private noncomputable def pairPort (V : Fin n → ℝ) (i j : Fin n) : Fin n → ℝ :=
  fun l => if l = i then (V i)⁻¹ else if l = j then -(V j)⁻¹ else 0

private lemma pairPort_units {V : Fin n → ℝ} (hV : ∀ i, 0 < V i) {i j : Fin n} (hij : i ≠ j) :
    units V (pairPort V i j) = 0 := by
  have hterm : ∀ l : Fin n, pairPort V i j l * V l
      = (if l = i then (1 : ℝ) else 0) - (if l = j then (1 : ℝ) else 0) := by
    intro l
    unfold pairPort
    by_cases hl : l = i
    · subst hl
      rw [if_pos rfl, if_pos rfl, if_neg hij, inv_mul_cancel₀ (ne_of_gt (hV l))]
      ring
    · by_cases hl2 : l = j
      · subst hl2
        rw [if_neg hl, if_pos rfl, if_neg hl, if_pos rfl]
        linear_combination (-1 : ℝ) * inv_mul_cancel₀ (ne_of_gt (hV l))
      · simp [hl, hl2]
  rw [units, Finset.sum_congr rfl (fun l _ => hterm l), Finset.sum_sub_distrib]
  simp

private lemma pairPort_cash {F V : Fin n → ℝ} (hV : ∀ i, 0 < V i) {i j : Fin n} (hij : i ≠ j) :
    cashPer F V (pairPort V i j) = F i - F j := by
  have hterm : ∀ l : Fin n, pairPort V i j l * V l * F l
      = (if l = i then F i else 0) - (if l = j then F j else 0) := by
    intro l
    unfold pairPort
    by_cases hl : l = i
    · subst hl
      rw [if_pos rfl, if_pos rfl, if_neg hij, inv_mul_cancel₀ (ne_of_gt (hV l))]
      ring
    · by_cases hl2 : l = j
      · subst hl2
        rw [if_neg hl, if_pos rfl, if_neg hl, if_pos rfl]
        linear_combination (-F l) * inv_mul_cancel₀ (ne_of_gt (hV l))
      · simp [hl, hl2]
  rw [cashPer, Finset.sum_congr rfl (fun l _ => hterm l), Finset.sum_sub_distrib]
  simp

private lemma cashPer_smul (t : ℝ) (F V q : Fin n → ℝ) :
    cashPer F V (t • q) = t * cashPer F V q := by
  simp [cashPer, Finset.mul_sum, mul_assoc]

/-! ## §3 THE NECESSITY THEOREM: one common doorway, or arbitrage -/

/-- Sufficiency: a common factor is arbitrage-free — every zero-unit portfolio settles
to zero cash. -/
theorem common_doorway_arbfree (c : ℝ) (V q : Fin n → ℝ) (h : units V q = 0) :
    cashPer (fun _ => c) V q = 0 := by
  rw [cashPer, ← Finset.sum_mul, ← units, h, zero_mul]

/-- NECESSITY. If every zero-unit portfolio settles to zero cash under a per-strike
doorway `F`, then `F` is constant. (Witness: go long `1/V i` at strike `i` and short
`1/V j` at strike `j` — exactly zero net perp units, and cash `F i − F j`.) -/
theorem common_doorway_necessary {F V : Fin n → ℝ} (hV : ∀ i, 0 < V i)
    (h : ∀ q : Fin n → ℝ, units V q = 0 → cashPer F V q = 0) (i j : Fin n) :
    F i = F j := by
  by_cases hij : i = j
  · rw [hij]
  · have hz := h _ (pairPort_units hV hij)
    rw [pairPort_cash hV hij] at hz
    linarith

/-- AND THE FAILURE IS AN UNBOUNDED ARBITRAGE, not a rounding: if the doorway differs at
two strikes, there are zero-net-unit portfolios with arbitrarily large cash payout. -/
theorem per_strike_doorway_unbounded_arb {F V : Fin n → ℝ} (hV : ∀ i, 0 < V i)
    {i j : Fin n} (hF : F i ≠ F j) (M : ℝ) :
    ∃ q : Fin n → ℝ, units V q = 0 ∧ M < cashPer F V q := by
  have hij : i ≠ j := fun hEq => hF (by rw [hEq])
  have hd : F i - F j ≠ 0 := sub_ne_zero.mpr hF
  refine ⟨((|M| + 1) / (F i - F j)) • pairPort V i j, ?_, ?_⟩
  · rw [units_smul, pairPort_units hV hij, mul_zero]
  · rw [cashPer_smul, pairPort_cash hV hij, div_mul_cancel₀ _ hd]
    have := le_abs_self M
    linarith

/-- THE DICHOTOMY. Station 17's single common conversion factor is not a convenience: it
is exactly the class of unit→cash doorways that admits no arbitrage. -/
theorem doorway_arbfree_iff_common {F V : Fin n → ℝ} (hV : ∀ i, 0 < V i) :
    (∀ q : Fin n → ℝ, units V q = 0 → cashPer F V q = 0) ↔ (∀ i j, F i = F j) := by
  constructor
  · intro h i j
    exact common_doorway_necessary hV h i j
  · intro hconst q h
    rcases isEmpty_or_nonempty (Fin n) with _ | ⟨⟨i0⟩⟩
    · simp [cashPer, Finset.univ_eq_empty]
    · have hF : F = fun _ => F i0 := funext fun l => hconst l i0
      rw [hF, cashPer, ← Finset.sum_mul, ← units, h, zero_mul]

/-! ## §4 Tie-back: the constant doorway IS station 17 -/

theorem cashPer_const_eq_cashOne (E L : ℝ) (V q : Fin n → ℝ) :
    cashPer (fun _ => E * L) V q = cashOne E L V q := by
  rw [cashPer, cashOne, units, Finset.sum_mul]

/-- The whole statement in one line: settling leg-by-leg at a common factor and settling
the NET at that factor give the same cash — which is what makes "legs net in perp units,
dollars only at the exit" a theorem about the mechanism rather than a bookkeeping habit. -/
theorem net_then_convert_eq_convert_then_net (E L : ℝ) (V q : Fin n → ℝ) :
    (∑ i, q i * V i) * (E * L) = ∑ i, (q i * V i) * (E * L) :=
  Finset.sum_mul _ _ _

end LinkSettlement

/-
BOOK_FORMAL — the continuation mechanism (owner-directed 2026-07-31)

WHAT THIS FILE IS. The strike axis is never cleared. Clearing happens once, in
the perp beneath, and every option strike is a CONTINUATION of that cleared
point: parity `C k - P k = -k` ties the curve to the perp, and at `k = 0` it
forces `C 0 = P 0` — the synthetic perp costs nothing, which is what makes the
continuation anchored rather than free. What is NOT shared is the LEVEL: two
LPs with different shapes disagree at every strike INCLUDING the money. So the
anchor is public and the extension is private.

That raises exactly one mechanical question — how N private continuations
become the one surface a trader transacts against — and this file settles it
structurally rather than by preference:

  * §1 A surface is a LEVEL plus a NON-NEGATIVE HALF-SPREAD. With one level,
    crossing is impossible by construction (`single_level_never_crossed`);
    crossing always required two levels.
  * §2 THE SEPARATION THEOREM (`butterfly_nonneg`, `vertical_nonneg`): once the
    level is single and convex, EVERY spread term enters an arbitrage's cost
    POSITIVELY, so any non-negative half-spread whatsoever is arbitrage-free.
    Level must carry the structure; spread is free. This is what lets the
    spread be competitive without reintroducing risk.
  * §3 A capital-weighted average of continuations IS a continuation:
    parity survives exactly (it is linear), and convexity survives because the
    weights are the same at every strike (`agg_parity`, `agg_midconvex`).
  * §4 The best-of-book ENVELOPE is not (`min_not_midconvex`): a pointwise
    minimum of convex curves need not be convex, so cherry-picking the cheapest
    LP strike by strike can leave the family the inputs belonged to. This is
    the formal content of "the envelope is not a continuation of the cleared
    price" — arbitrage was the symptom, leaving the family is the cause.
  * §5 The alternative that keeps per-LP levels: bounding pairwise disagreement
    below the combined half-spreads forbids crossing (`bounded_disagreement`).

Convexity is stated as MIDPOINT convexity throughout: it is exactly what a
butterfly tests, and it keeps the file elementary.

STATUS: statements are the owner-ratified mechanism; all proofs have been
kernel-checked. Nothing here is wired to the engine — this is the
theory rung, and the engine bridge stays MEASURED (cf. LOOP_FORMAL).
-/

import Mathlib.Analysis.Convex.Function
import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Tactic

namespace BookFormal

open scoped BigOperators

/-! ## §0 Midpoint convexity -/

/-- Midpoint convexity — exactly the property a butterfly tests. -/
def MidConvex (f : ℝ → ℝ) : Prop := ∀ a b : ℝ, f ((a + b) / 2) ≤ (f a + f b) / 2

/-! ## §1 A surface is a level plus a non-negative half-spread -/

/-- The one object a trader transacts against: ONE level per moneyness, and a
half-spread that is never negative. The half-spread is deliberately
unconstrained beyond that — §2 is what earns it that freedom. -/
structure Surface where
  level : ℝ → ℝ
  half : ℝ → ℝ
  half_nonneg : ∀ k, 0 ≤ half k

namespace Surface

def bid (S : Surface) (k : ℝ) : ℝ := S.level k - S.half k
def ask (S : Surface) (k : ℝ) : ℝ := S.level k + S.half k

/-- CROSSING IS IMPOSSIBLE WITH ONE LEVEL. Crossing was never about spreads —
it required two different levels, and a surface has one. -/
theorem single_level_never_crossed (S : Surface) (k : ℝ) : S.bid k ≤ S.ask k := by
  have h := S.half_nonneg k
  unfold bid ask
  linarith

/-! ## §2 The separation theorem: structure lives in the level, never the spread -/

/-- A butterfly: buy the wings, sell twice the body, body at the midpoint. Its
cost is what an arbitrageur would pay to hold a non-negative payoff. -/
noncomputable def butterflyCost (S : Surface) (a b : ℝ) : ℝ :=
  S.ask a + S.ask b - 2 * S.bid ((a + b) / 2)

/-- THE SEPARATION THEOREM. A convex level makes the butterfly's level-part
non-negative, and all three half-spreads enter POSITIVELY. So an arbitrage
cannot be opened by ANY non-negative spread profile, however it is set and
however it varies by strike.

Consequence, and the reason this theorem is the centre of the file: the level
must carry the structure, the spread need not carry any. The spread can then be
set competitively — the tightest LP's — without reintroducing risk. -/
theorem butterfly_nonneg (S : Surface) (hL : MidConvex S.level) (a b : ℝ) :
    0 ≤ butterflyCost S a b := by
  have hmid := hL a b
  have h1 := S.half_nonneg a
  have h2 := S.half_nonneg b
  have h3 := S.half_nonneg ((a + b) / 2)
  unfold butterflyCost bid ask
  linarith

/-- A vertical spread on a monotone level: same shape of argument, and again
every half-spread term is on the side that helps. -/
def verticalCost (S : Surface) (a b : ℝ) : ℝ := S.ask a - S.bid b

theorem vertical_nonneg (S : Surface) {a b : ℝ} (hmono : S.level b ≤ S.level a) :
    0 ≤ verticalCost S a b := by
  have h1 := S.half_nonneg a
  have h2 := S.half_nonneg b
  unfold verticalCost bid ask
  linarith

/-! ### §2b The converse: the structure is NECESSARY, not one clean cut of many

`butterfly_nonneg` shows a convex level carries no arbitrage under ANY
non-negative spread — spread is free. This is the other direction, and it is
what turns "the level/spread split is clean" into "the split is the coordinate
system in which no-arbitrage FACTORIZES": a spread can absorb non-convexity only
UP TO ITS OWN SIZE, and a competitive spread is driven toward zero, so the level
must carry the convexity — it cannot be delegated to the spread. -/

/-- The butterfly's two parts made explicit: a LEVEL part (the midpoint-convexity
gap, negative exactly when the level is not convex there) plus a SPREAD part that
is always non-negative. Every statement in §2b reads off this one identity. -/
theorem butterfly_split (S : Surface) (a b : ℝ) :
    butterflyCost S a b
      = (S.level a + S.level b - 2 * S.level ((a + b) / 2))
        + (S.half a + S.half b + 2 * S.half ((a + b) / 2)) := by
  unfold butterflyCost bid ask; ring

/-- A SPREAD HIDES NON-CONVEXITY ONLY UP TO ITS OWN SIZE. If the level's
convexity gap at `(a, b)` exceeds the spread contribution at the three butterfly
points, the butterfly is a strict arbitrage. Competition drives the spread down,
so past that point the level must carry the structure itself. -/
theorem nonconvex_arbable_below_spread_budget (S : Surface) {a b : ℝ}
    (hgap : S.half a + S.half b + 2 * S.half ((a + b) / 2)
              < 2 * S.level ((a + b) / 2) - S.level a - S.level b) :
    butterflyCost S a b < 0 := by
  rw [butterfly_split]; linarith

/-- AT ZERO SPREAD — the tightest, most competitive book — a non-convex level is
a STRICT arbitrage. The level alone, with no spread to hide behind, is
arbitrageable exactly when it is non-convex. -/
theorem nonconvex_level_arbable_at_zero_spread {level : ℝ → ℝ} {a b : ℝ}
    (hnc : (level a + level b) / 2 < level ((a + b) / 2)) :
    butterflyCost ⟨level, fun _ => 0, fun _ => le_rfl⟩ a b < 0 := by
  apply nonconvex_arbable_below_spread_budget
  simp only [add_zero, mul_zero]
  linarith

/-- THE SEPARATION, BOTH WAYS: the level is convex IFF the tightest (zero-spread)
book is arbitrage-free. Sufficiency is `butterfly_nonneg`; necessity is the
strict arb above. This is the precise sense in which no-arbitrage lives in the
level and nowhere else — the level/spread split is canonical, not one honest
decomposition among many. -/
theorem level_convex_iff_zero_spread_arbfree (level : ℝ → ℝ) :
    MidConvex level ↔
      ∀ a b, 0 ≤ butterflyCost ⟨level, fun _ => 0, fun _ => le_rfl⟩ a b := by
  constructor
  · intro hc a b
    exact butterfly_nonneg _ hc a b
  · intro h a b
    by_contra hcon
    push_neg at hcon
    have hlt := nonconvex_level_arbable_at_zero_spread hcon
    linarith [h a b]

end Surface

/-! ## §3 A weighted average of continuations is a continuation -/

variable {n : ℕ}

/-- The aggregate level: capital weights, THE SAME AT EVERY STRIKE. That the
weights do not vary with `k` is what makes §3.2 work — a pointwise-varying
weighting is not a convex combination in function space and can lose convexity.
The theory's "shape is broadly common, tilt is personal" is exactly the
condition under which depth-weighting reduces to this. -/
def agg (w : Fin n → ℝ) (P : Fin n → ℝ → ℝ) : ℝ → ℝ := fun k => ∑ i, w i * P i k

/-- PARITY SURVIVES AGGREGATION EXACTLY. Parity is linear, so no approximation
is involved: if every LP's continuation is anchored to the cleared perp, so is
the aggregate. At `k = 0` this is `C 0 = P 0` — the synthetic perp is free. -/
theorem agg_parity (w : Fin n → ℝ) (C P : Fin n → ℝ → ℝ) (hw : ∑ i, w i = 1)
    (hpar : ∀ i k, C i k - P i k = -k) (k : ℝ) :
    agg w C k - agg w P k = -k := by
  unfold agg
  have : ∑ i, w i * C i k - ∑ i, w i * P i k = ∑ i, w i * (C i k - P i k) := by
    rw [← Finset.sum_sub_distrib]
    exact Finset.sum_congr rfl fun i _ => by ring
  rw [this]
  have : ∀ i ∈ Finset.univ, w i * (C i k - P i k) = w i * (-k) := by
    intro i _; rw [hpar i k]
  rw [Finset.sum_congr rfl this, ← Finset.sum_mul, hw]
  ring

/-- CONVEXITY SURVIVES AGGREGATION, given non-negative weights fixed across
strikes. With §2 this is the whole guarantee: the aggregate level is convex, so
any non-negative spread on top of it is arbitrage-free. -/
theorem agg_midconvex (w : Fin n → ℝ) (P : Fin n → ℝ → ℝ)
    (hw : ∀ i, 0 ≤ w i) (hP : ∀ i, MidConvex (P i)) : MidConvex (agg w P) := by
  intro a b
  unfold agg
  have hstep : ∀ i ∈ Finset.univ,
      w i * P i ((a + b) / 2) ≤ w i * ((P i a + P i b) / 2) := by
    intro i _
    exact mul_le_mul_of_nonneg_left (hP i a b) (hw i)
  calc ∑ i, w i * P i ((a + b) / 2)
      ≤ ∑ i, w i * ((P i a + P i b) / 2) := Finset.sum_le_sum hstep
    _ = (∑ i, w i * P i a + ∑ i, w i * P i b) / 2 := by
        rw [← Finset.sum_add_distrib]
        rw [Finset.sum_div]
        exact Finset.sum_congr rfl fun i _ => by ring

/-! ## §4 The best-of-book envelope is NOT a continuation -/

/-- A POINTWISE MINIMUM OF CONVEX CURVES NEED NOT BE CONVEX. Taking the cheapest
LP strike by strike can therefore leave the family its own inputs belonged to —
which is the formal content of "the envelope is not a continuation of the
cleared price". The arbitrage best-of-book admits is the symptom; leaving the
family is the cause.

Witness: `id` and `-id` are both convex (linear), and their pointwise minimum is
`-|·|`, which fails midpoint convexity at `-1, 1`. -/
theorem min_not_midconvex :
    ∃ f g : ℝ → ℝ, MidConvex f ∧ MidConvex g ∧ ¬ MidConvex (fun k => min (f k) (g k)) := by
  refine ⟨fun k => k, fun k => -k, ?_, ?_, ?_⟩
  · intro a b; simp
  · intro a b; simp; linarith
  · intro h
    have := h (-1) 1
    simp at this
    linarith

/-! ## §5 The alternative: keep per-LP levels, bound the disagreement -/

/-- If per-LP levels are kept (a consolidated book rather than one surface),
crossing is forbidden exactly when each pair disagrees by LESS than their
combined half-spreads. This is the classical don't-cross rule of an order book,
carried from the single cleared point out to every strike of the continuation —
and note it does NOT come free from the perp being cleared, because the
extension is where the private parameters enter. -/
theorem bounded_disagreement
    (Pi Pj hi hj : ℝ) (hhi : 0 ≤ hi) (hhj : 0 ≤ hj)
    (hbound : |Pi - Pj| < hi + hj) :
    Pi - hi < Pj + hj := by
  have h := abs_lt.mp hbound
  linarith [h.1, h.2, hhi, hhj]

end BookFormal

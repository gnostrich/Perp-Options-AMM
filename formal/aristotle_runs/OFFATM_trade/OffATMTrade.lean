/-
  OffATMTrade.lean — the off-ATM trade-at-point transition rule
  (operator ruling 2026-06-12; spec: specs/SPEC_trade_at_point_transition_rule.md)

  MODEL. A pool state is (x, y, w) ∈ ℝ>0 × ℝ>0 × (0,1); w is GENUINE STATE.
  A trade at strike ray θ > 0 happens at the trade point
    T = (x_T, y_T):  y_T = θ·x_T  on the pool curve  x_T^w · y_T^(1−w) = x^w · y^(1−w).
  Local pair at T:  α_T = x_T·w,  β_T = y_T·(1−w).
  Transition with cash leg Δy (flows computed at T, applied to global reserves):
    Δx = −α_T·β_T·Δy / [(y_T − β_T)·(y_T + Δy − β_T)]
    Δw =  β_T·Δy / [y_T·(y_T + Δy)]
    next state = (x + Δx, y + Δy, w + Δw).
  Key algebraic facts: y_T − β_T = w·y_T, so the pole is at Δy = −w·y_T.

  Toolchain: Lean 4.28.0, Mathlib v4.28.0. All `^` on reals below is Real.rpow
  (real exponents) in tradePoint_exists_unique / the two exhibits' curve-membership
  conjuncts; everything else is field algebra.
-/
import Mathlib

namespace OffATMTrade

noncomputable section

open Real

/-- Reserve flow Δx of a trade with cash leg `dy` at trade point `(xT, yT)` with live
    weight `w` (ruling step 3, first formula; α_T = xT·w, β_T = yT·(1−w) inlined). -/
def deltaX (xT yT w dy : ℝ) : ℝ :=
  -((xT * w) * (yT * (1 - w)) * dy) /
    ((yT - yT * (1 - w)) * (yT + dy - yT * (1 - w)))

/-- Weight increment Δw (ruling step 3, second formula). -/
def deltaW (yT w dy : ℝ) : ℝ :=
  (yT * (1 - w)) * dy / (yT * (yT + dy))

/-- L1a (trade-point existence/uniqueness): for any valid state (x,y,w) and ray θ>0 there
    is exactly one positive x_T with (x_T, θ·x_T) on the pool curve. (On the ray the curve
    equation is linear in x_T: x_T^w·(θ·x_T)^(1−w) = x_T·θ^(1−w).) -/
theorem tradePoint_exists_unique (x y w θ : ℝ) (hx : 0 < x) (hy : 0 < y)
    (hw0 : 0 < w) (hw1 : w < 1) (hθ : 0 < θ) :
    ∃! xT : ℝ, 0 < xT ∧
      xT ^ w * (θ * xT) ^ (1 - w) = x ^ w * y ^ (1 - w) := by
  sorry

/-- Helper: closed form of the next weight, w′ = (w·yT + Δy)/(yT + Δy). -/
theorem wNext_eq (yT w dy : ℝ) (hyT : yT ≠ 0) (hsum : yT + dy ≠ 0) :
    w + deltaW yT w dy = (w * yT + dy) / (yT + dy) := by
  sorry

/-- L1b (pole condition closes the w-component): on the pole domain Δy > −w·yT the next
    weight is automatically in (0,1) — no extra assumption needed. -/
theorem wNext_mem_Ioo (yT w dy : ℝ) (hyT : 0 < yT) (hw0 : 0 < w) (hw1 : w < 1)
    (hpole : -(w * yT) < dy) :
    0 < w + deltaW yT w dy ∧ w + deltaW yT w dy < 1 := by
  sorry

/-- L1b (well-definedness on the admissible domain): pole condition + global positivity
    of the next reserves ⇒ the next state is a valid pool state. (The two positivity
    hypotheses are genuinely additional — see `pole_does_not_bound_state`.) -/
theorem next_state_valid (x y xT yT w dy : ℝ) (hyT : 0 < yT)
    (hw0 : 0 < w) (hw1 : w < 1) (hpole : -(w * yT) < dy)
    (hx' : 0 < x + deltaX xT yT w dy) (hy' : 0 < y + dy) :
    0 < x + deltaX xT yT w dy ∧ 0 < y + dy ∧
    0 < w + deltaW yT w dy ∧ w + deltaW yT w dy < 1 := by
  sorry

/-- L1c (the pole condition does NOT bound the global state): exact exhibit.
    State (x,y,w) = (10,10,1/2), ray θ = 100: the trade point is (x_T,y_T) = (1,100)
    (curve √(1·100) = √(10·10), ray 100 = 100·1), the pole sits at Δy = −w·y_T = −50,
    and Δy = −20 passes the pole condition while the global next reserve
    y + Δy = −10 fails positivity. -/
theorem pole_does_not_bound_state :
    ((100 : ℝ) = 100 * 1) ∧
    ((1 : ℝ) ^ ((1:ℝ)/2) * (100 : ℝ) ^ ((1:ℝ)/2)
      = (10 : ℝ) ^ ((1:ℝ)/2) * (10 : ℝ) ^ ((1:ℝ)/2)) ∧
    (-((1/2 : ℝ) * 100) < (-20 : ℝ)) ∧
    ((10 : ℝ) + (-20) < 0) := by
  sorry

/-- L3 (per-step local conservation): on the pole domain, identically,
    (x_T + Δx)·w′ = α_T  and  (y_T + Δy)·(1 − w′) = β_T.
    Viewed FROM the trade point, every trade is a paper-§5.1-conserving trade. -/
theorem local_conservation (xT yT w dy : ℝ) (hyT : 0 < yT)
    (hw0 : 0 < w) (hw1 : w < 1) (hpole : -(w * yT) < dy) :
    (xT + deltaX xT yT w dy) * (w + deltaW yT w dy) = xT * w ∧
    (yT + dy) * (1 - (w + deltaW yT w dy)) = yT * (1 - w) := by
  sorry

/-- L2 (spot-trade reduction): when the trade point IS the reserves point (θ = y/x, so
    x_T = x, y_T = y), the transition conserves the GLOBAL pair α = x·w, β = y·(1−w) —
    the paper's §5.1 law — and the next state lies on the trajectory hyperbola
    (x′−α)(y′−β) = αβ. -/
theorem spot_reduction_global_conservation (x y w dy : ℝ) (hx : 0 < x) (hy : 0 < y)
    (hw0 : 0 < w) (hw1 : w < 1) (hpole : -(w * y) < dy) :
    (x + deltaX x y w dy) * (w + deltaW y w dy) = x * w ∧
    (y + dy) * (1 - (w + deltaW y w dy)) = y * (1 - w) ∧
    ((x + deltaX x y w dy) - x * w) * ((y + dy) - y * (1 - w))
      = (x * w) * (y * (1 - w)) := by
  sorry

/-- L4 (w-storage necessity): exact rational exhibit that one off-ATM trade makes the
    stored w′ differ from the reserve-derived α₀/x′ (α₀ = pre-trade global pair), so w
    cannot be recovered from reserves and must be stored.
    State (x,y,w) = (10,10,1/2), ray θ = 4 ⇒ trade point (x_T,y_T) = (5,20)
    (curve: √(5·20) = √(10·10) = 10; ray: 20 = 4·5), cash leg Δy = 1.
    Then Δw = 1/42, Δx = −5/22, so w′ = 11/21 ≠ 22/43 = α₀/x′. -/
theorem w_storage_necessary :
    ((20 : ℝ) = 4 * 5) ∧
    ((5 : ℝ) ^ ((1:ℝ)/2) * (20 : ℝ) ^ ((1:ℝ)/2)
      = (10 : ℝ) ^ ((1:ℝ)/2) * (10 : ℝ) ^ ((1:ℝ)/2)) ∧
    ((1/2 : ℝ) + deltaW 20 (1/2) 1
      ≠ ((10 : ℝ) * (1/2)) / (10 + deltaX 5 20 (1/2) 1)) := by
  sorry

/-- L5 numeric core (the off-ATM trade is a distinct operator): in the L4 exhibit the
    action on the global pair is α′/α = 43/42, β′/β = 44/42, matching NONE of the paper's
    three operator signatures — not trade (α,β fixed), not rebase (β fixed), not liquidity
    (common factor). -/
theorem offATM_distinct_operator_signature :
    ((10 + deltaX 5 20 (1/2) 1) * ((1/2 : ℝ) + deltaW 20 (1/2) 1)
      ≠ (10 : ℝ) * (1/2)) ∧
    (((10 : ℝ) + 1) * (1 - ((1/2 : ℝ) + deltaW 20 (1/2) 1))
      ≠ (10 : ℝ) * (1 - (1/2))) ∧
    (((10 + deltaX 5 20 (1/2) 1) * ((1/2 : ℝ) + deltaW 20 (1/2) 1)) / ((10 : ℝ) * (1/2))
      ≠ (((10 : ℝ) + 1) * (1 - ((1/2 : ℝ) + deltaW 20 (1/2) 1)))
        / ((10 : ℝ) * (1 - (1/2)))) := by
  sorry

end

end OffATMTrade

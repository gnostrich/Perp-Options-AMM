# Lean 4 task: a typed AMM-curve interface (validity gate) + the short-gamma bridge

## Task

Below is a self-contained Lean 4 file (uses Mathlib). It has **not been compiled**.
The purpose is to make *substituting the AMM invariant* a type-checked operation:
a candidate curve can only be plugged in if it proves it is a valid pool, and once
it does, a curve-agnostic "short-gamma" result follows automatically.

Please:

1. **Typecheck it** against a current Lean 4 + Mathlib toolchain; fix any syntax /
   API drift.
2. **The fields of `structure AMMCurve` are the validity gate** — `antitone_y`,
   `convex_y`, `coercive`. Keep them as fields and do **not** weaken them. They are
   what a substituted invariant must supply.
3. **Close every `sorry`** with a real proof:
   - the two theorems `AMMCurve.poolValue_concaveOn` and `AMMCurve.hedge_gap_concaveOn`;
   - the instance field proofs for `expPool` and `cpmm`.
   Proof strategies are in the comments. If a goal is genuinely blocked, leave it
   explicit and **report the blocking goal state** — do **not** discharge it with
   `sorry`, `admit`, `axiom`, or `native_decide`.
4. The two `example`s at the end must typecheck — they are the payoff: each instance
   inherits the bridge theorem for free, with no curve-specific reproof.
5. Final file must contain no `sorry` / `admit` / `axiom` / `native_decide`.

## Report back

- Compile status and exact toolchain / Mathlib version.
- A list of every change made.
- Confirmation of no `sorry` / `admit` / `axiom` / `native_decide`.
- `#print axioms` on `AMMCurve.poolValue_concaveOn`, `AMMCurve.hedge_gap_concaveOn`,
  and both `example`s (expected: only `propext`, `Classical.choice`, `Quot.sound`).
- Any goal you could not close, with its goal state.

## What the file encodes (context, self-contained)

A constant-function market maker is presented as a reserve **frontier** `y(x)`: the
amount of asset Y the pool holds when its X-reserve is `x`. A *valid* pool frontier
must (i) slope downward (more X ⇒ less Y), (ii) be convex (the no-arbitrage / real-
slippage condition), and (iii) be coercive enough that its value is finite. These
three are carried as proof-obligation **fields** of `AMMCurve`, so they function as a
gate: a shape that fails any of them cannot be made an `AMMCurve` and therefore cannot
reach the results below. Substituting one invariant for another (constant-product,
exponential, weighted, …) is exactly "provide another `AMMCurve` instance."

The **LP reserve value** at an external price `p` is the lower envelope
`poolValue p = inf over the curve of (p·x + y x)` — an infimum of functions affine in
`p`. The **bridge theorem** states this is *concave in price for every valid curve*:
the pool is structurally "short the bend." Its corollary: subtracting any *convex*
obligation (the value of a γ>1 claim) leaves a *concave* gap, so the reserves cannot
dominate a strictly convex payoff across all prices — the curvature must be funded
from outside. Both results are proved once, over the abstract interface, and the two
`example`s show concrete instances inheriting them with no extra work.

(This composes with a separately verified passivity scaffold — `poolValue` is what
feeds that scaffold's storage function — but this file stands alone and imports only
Mathlib. Wiring the two together is a later step, not part of this task.)

---

## The file

```lean
/-
  A typed AMM-curve interface (the substitution gate) and the curve-agnostic
  short-gamma bridge. NOT yet compiled — please typecheck, fix API drift, and
  close the `sorry`s with real proofs.

  The three fields of `AMMCurve` are the validity gate; the two theorems are the
  proof targets; the instances + examples demonstrate that the gate is satisfiable
  and the bridge transfers for free.
-/
import Mathlib

namespace TemporalCurve

/-- A valid AMM curve as a reserve frontier `y` on a convex domain `dom`
    (`y x` = Y-reserve when X-reserve is `x`). The fields are the substitution
    gate: to plug a new invariant into the framework you must supply proofs of all
    of them. A shape that is not monotone-decreasing and convex cannot be made an
    `AMMCurve`, hence cannot reach the theorems below. -/
structure AMMCurve where
  dom         : Set ℝ
  convex_dom  : Convex ℝ dom
  y           : ℝ → ℝ
  /-- monotone: more X ⇒ weakly less Y (downward-sloping frontier). -/
  antitone_y  : AntitoneOn y dom
  /-- convex: the frontier bows the right way (no-arb / real slippage). -/
  convex_y    : ConvexOn ℝ dom y
  /-- coercivity: at a positive price the value set is bounded below, so its inf is real. -/
  coercive    : ∀ ⦃p : ℝ⦄, 0 < p → BddBelow ((fun x => p * x + y x) '' dom)

namespace AMMCurve
variable (C : AMMCurve)

/-- LP reserve value at external price `p` (price of X in units of Y): the lower
    envelope of the affine-in-`p` lines through the curve points. -/
noncomputable def poolValue (p : ℝ) : ℝ := sInf ((fun x => p * x + C.y x) '' C.dom)

/-- BRIDGE (curve-agnostic short-gamma): the LP value is CONCAVE in price on the
    positive-price ray, for EVERY valid curve — the pool is structurally short the
    bend, no shape escapes it.

    Strategy: for each fixed `x ∈ dom`, `p ↦ p*x + y x` is affine, hence concave;
    `poolValue` is their pointwise infimum (lower envelope), and an infimum of
    concave functions is concave. `coercive` guarantees the infimum is a real
    number on `Ioi 0` (so `sInf` is not the junk value). -/
theorem poolValue_concaveOn : ConcaveOn ℝ (Set.Ioi 0) C.poolValue := by
  sorry

/-- MUST-FUND (corollary): subtract any convex obligation `O` (the value of a γ>1
    claim) from the concave pool value and the hedge gap stays concave. So reserves
    cannot dominate a strictly convex payoff across all prices — the curvature must
    be funded from outside.

    Strategy: `poolValue` is concave (above); `-O` is concave because `O` is convex
    (`ConvexOn.neg`); the sum of concave functions is concave (`ConcaveOn.add`). -/
theorem hedge_gap_concaveOn {O : ℝ → ℝ} (hO : ConvexOn ℝ (Set.Ioi 0) O) :
    ConcaveOn ℝ (Set.Ioi 0) (fun p => C.poolValue p - O p) := by
  sorry

end AMMCurve

/-! ## Instances — the gate is satisfiable and the bridge transfers for free. -/

/-- Instance 1: exponential pool, frontier `y = exp (−x)` on all of ℝ. -/
noncomputable def expPool : AMMCurve where
  dom        := Set.univ
  convex_dom := convex_univ
  y          := fun x => Real.exp (-x)
  antitone_y := by sorry   -- exp(−x) is antitone
  convex_y   := by sorry   -- exp(−x) is convex
  coercive   := by sorry   -- p*x + exp(−x) bounded below for p>0

/-- Instance 2: constant-product pool, frontier `y = k / x` on `x > 0` (k>0). -/
noncomputable def cpmm (k : ℝ) (hk : 0 < k) : AMMCurve where
  dom        := Set.Ioi 0
  convex_dom := convex_Ioi 0
  y          := fun x => k / x
  antitone_y := by sorry   -- k/x antitone on x>0
  convex_y   := by sorry   -- k/x convex on x>0
  coercive   := by sorry   -- p*x + k/x bounded below (min 2√(pk)) for p>0

/-- PAYOFF: each instance inherits the bridge with no curve-specific reproof. -/
example : ConcaveOn ℝ (Set.Ioi 0) expPool.poolValue :=
  expPool.poolValue_concaveOn

example (k : ℝ) (hk : 0 < k) :
    ConcaveOn ℝ (Set.Ioi 0) (cpmm k hk).poolValue :=
  (cpmm k hk).poolValue_concaveOn

end TemporalCurve
```

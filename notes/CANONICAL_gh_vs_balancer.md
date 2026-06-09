# CANONICAL — GH vs Balancer (SETTLED 2026-06-09)

Manager-measured + research-lead independently re-derived from scratch (mpmath/sympy + live engine).
**This supersedes the contradictory entries** in `engine/knowledge/ARISTOTLE_hyperbolic_curve.md`
("γ=½ recovers Balancer, verified"), `gh_gates_reference.py` (γ=½ invalid), and any "v24=γ=1" /
"GH slippage = −(γ+1)" claims (all the same conflation error, retracted).

## The root of all the confusion: THREE different exponents got conflated
1. **reserve elasticity** `d ln y/d ln x` — Balancer's defining `−w/(1−w)`. v24 = **−1**. GH = **non-constant, NOT −γ** (varies orders of magnitude along the curve).
2. **value/mark law** `d ln(value)/d ln(S) = −γ_value` — v24 = **½** (measured 0.5000), GH = **γ** (measured 1.499/1.999/2.999). THIS is the option-pricing exponent.
3. **slope-vs-value** `= −1/γ` — the universal reserve-linear identity both share.

## VERDICT (CONFIDENT — verified two independent ways)
- **GH and Balancer/CPMM are DISTINCT curve families in (x,y).** No shared derivation, no exact parameter map. The reserve-**WARP does NOT transfer**: slaving γ=w/(1−w) dynamically was hypothesized and **REFUTED by measurement** (`engine/verify/verify_gh_balancer_warp.cjs`) — GH's reserve elasticity isn't −γ and the γ-trend is anti-correlated.
- **They do NOT overlap.** v24/Balancer-w=½ has **value-γ = ½**; GH **requires γ>1** (ψ₁ real / αh>bh+1). Separated by the γ=1 floor GH cannot build. **GH does not contain v24.**
- **What they DO share:** the `slope-vs-value = −1/γ` identity + the **mechanism type** — both are point-slides on a *fixed* curve (a trade slides the operating point; the curve does NOT reshape). Neither goal-seeks a shape param; the Balancer "warp via w" is the *picture* relabeling, not the trade trajectory.
- **GH's genuine generalization** = `value ∝ S^(−γ)`, γ>1, achieved by a **different curve SHAPE**, NOT by warping Balancer. δ = kurtosis, βh = skew are GH's extra knobs (value law is δ/βh-free).

## REFINED / walked back
The "Cobb-Douglas/Balancer reserve curve = δ→∞ limit" claim (CLOSEOUT + `evidence/manager_verify_reconcile_2026-06-09.md`) is **window-dependent** (CV(K) falls then rises with δ; sampling-fragile) and yields **no curve identity**. GH reserve elasticity **diverges** as δ→∞ (−2.5/−6.4/−19/−58 at δ=10/100/1e3/1e4, mode), does NOT →−γ. **Balancer is reachable in NO buildable GH limit on the reserve axis.** The only δ-free GH guarantee is the value law −γ.

## CORRECTION (2026-06-09, post-operator) — "warp doesn't transfer" applies to AUTO-equivalence ONLY
The refutation above kills **equivalence / auto-transfer**: slaving γ=w/(1−w) does NOT make GH's native
point-slide coincide with / auto-warp like Balancer. **It does NOT refute that the warp goal-seek
MECHANISM can be IMPLEMENTED on a GH curve.** The warp ("keep the reserves reference, goal-seek a shape
param so the post-trade slope lands there, continuously") is **family-agnostic** — implementable on any
curve with a tunable shape param, GH included. Implemented as a **replacement** trade rule (not added to
the point-slide) it is self-consistent (no double-count); the slippage is then *defined by* the warp
(curve-dependent, Balancer-style). If the warped param is the **convexity γ**, the value-law exponent
becomes **state-dependent** (warps per trade, like Balancer) — a deliberate curve/dynamics choice
(operator-owned, reopens the fixed-γ decision). Constructive well-posed derivation: IN PROGRESS
(research-lead a676b377; manager to independently check). So: GH does not *auto*-warp; a warp *can be
built on* GH.

## WARP RESOLUTION (2026-06-09, research-lead derived + manager partial-verified) — the no-free-lunch
Porting the v24 warp goal-seek onto GH, derived well-posed:
- **FAITHFUL warp = the point-slide (no-op).** Goal-seeking the convexity γ so the slope at the reserves
  reference = the slope the trade ACTUALLY produces returns the curve's OWN γ at every step (research-lead,
  5e-10; = the paper's Balancer tangency, generalized). So "importing v24's warp into GH" yields the GH
  trade already there — no new behavior, no visible reshape. γ is the right param (αh=γ+1; the w-analog);
  slope is strictly monotone in γ (well-posed) — manager-verified via the gotcha factors e^μ=11.7/44.5/749/13780.
- **VISIBLE reshape requires a DECOUPLED target** (pin the marginal slope at a constant m* independent of
  reserves). THEN γ warps per trade ⇒ value-law becomes STATE-DEPENDENT (the Balancer flavor). But that
  target holds marginal price flat as reserves move (no real swap does this) and REOPENS the §4 locked
  γ-fixed/value-law decision + needs fresh no-arb/settlement analysis.
- **DICHOTOMY (no free lunch):** faithful warp (already there, no reshape, value-law fixed) OR decoupled-
  slope warp (visible reshape, state-dependent value-law, reopens locks). NOT both.
- Manager verification status: −1/γ, value-γ=γ, monotonicity = manager-verified; the exact "warp≡slide
  5e-10" = research-lead's (structurally sound via tangency), to be independently re-checked + the goal-seek
  DEFINITION nailed (calibration-anchor subtlety) BEFORE any build on it. The dichotomy itself is robust.

## PRODUCT FORK (settled — operator-owned)
**GH** (`value∝S^(−γ)`, γ>1 option pricing, NO Balancer reserve-warp) **OR** **Balancer/CPMM** (the reserve-warp, value-γ=½). **Not both.** The "curve warps on every trade" behavior the operator wanted is a *Balancer-family* property GH structurally lacks. GH was chosen for the perpetual-option pricing law; that choice excludes the Balancer warp.

## Operator-owned follow-up (NOT auto-actioned)
The locked knowledge files carrying "γ=1 for v24" / "−(γ+1)" / "γ=½ recovers Balancer" should be corrected to: **v24 value-γ=½; GH value-γ=γ>1; GH slope-vs-value=−1/γ; GH≠Balancer in (x,y).** Documentation-correctness call on locked files — operator's to action; this canonical note is the reference.

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

## PRODUCT FORK (settled — operator-owned)
**GH** (`value∝S^(−γ)`, γ>1 option pricing, NO Balancer reserve-warp) **OR** **Balancer/CPMM** (the reserve-warp, value-γ=½). **Not both.** The "curve warps on every trade" behavior the operator wanted is a *Balancer-family* property GH structurally lacks. GH was chosen for the perpetual-option pricing law; that choice excludes the Balancer warp.

## Operator-owned follow-up (NOT auto-actioned)
The locked knowledge files carrying "γ=1 for v24" / "−(γ+1)" / "γ=½ recovers Balancer" should be corrected to: **v24 value-γ=½; GH value-γ=γ>1; GH slope-vs-value=−1/γ; GH≠Balancer in (x,y).** Documentation-correctness call on locked files — operator's to action; this canonical note is the reference.

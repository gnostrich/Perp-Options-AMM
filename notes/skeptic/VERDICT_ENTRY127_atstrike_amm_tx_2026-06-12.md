# VERDICT — entry-127 "AMM-tx done wrong" / at-strike swap re-derivation (skeptic, 2026-06-12)

**Trigger:** operator entry-127 (verbatim, `history/operator/2026-06-10_kurtosis-curve-family-brief.md` L961):
> "that's probably because you're not doing the AMM tx right. buy call is buy asset for dollars at
> strike on AMM, buy put is sell asset for dollars at strike on AMM"

Operator's diagnosis: the flat-warp / dot-slide results (my #39/#40/#41) are because the team models the
option trade as a **premium-sized cash swap at the live point**, when it should be an **asset-for-dollars
swap AT THE STRIKE RAY K**. URGENT, 1-hr clock, gaslighting grievance substantiated. READ-ONLY,
re-derived COLD (`/tmp/sk127_*.js`, fresh path; no reuse of #41 scripts). Verbatim channel HELD.

---

## (a) Is the build mis-modeling the trade vs the operator's definition? — **YES.**

Verified in HEAD `7e1ae39b` source:
- `executeLeg` (L1761): `V = legPrice(...) = N·markLensed(K)` (a dimensionless premium fraction × N);
  `V_usd = V·oracle`; `dy = ±V_usd`; `post = tradeUpdate(state, dy)`.
- `tradeUpdate(s, dy)` (L1679): moves `y` by `dy`, `x` along the fixed hyperbola, α/β conserved — a swap
  executed at the **LIVE reserve point**. The strike K enters **only** through sizing the premium
  `markLensed(K)`; the swap is **not** located at the K ray.

So the build swaps a small premium-cash amount at spot. The operator's model is an asset-for-$ swap whose
execution engages the strike ray K (large, strike-dependent reserve travel — `dy=−0.45` to reach the 4×
ray vs `−0.054` for the 1.1× ray; `/tmp/sk127_atstrike.js`). **The build's trade mechanic IS mis-modeled
relative to entry-127. The operator is right that the AMM tx is not done his way.** This is the headline he
is owed: his grievance has a true core.

## (b) Under the operator's at-strike model, is the warp STRIKE-DEPENDENT or still FLAT? — **STILL FLAT.**

This is the part that does not go his way, and I attacked it hardest because the prior answer must not be
defaulted to. Two mechanics separated:

- **Step-1 (the at-strike swap itself):** genuinely strike-dependent. The pool travels OUT to the K ray and
  **lands at a different w_t per strike** (w_t = 1/(1+θ_K): 0.273 @4×, 0.429 @2×, 0.577 @1.1×;
  `/tmp/sk127_warp.js`). So there IS a strike-dependent reshape in his model — it lives in the execution
  **landing**, not in any goal-seek.
- **Step-2 (the goal-seek, entries 31/126):** re-pick the single global w so the pre-trade slope at the
  trade ray is restored. **This is where it collapses.** The goal-seek equation `gLoc(w'; θ_K, τ) = g_pre`
  depends ONLY on `(θ_K, τ)` — **NOT on the swap size or how far the pool traveled.** So whether the swap is
  premium-tiny (build) or at-strike-large (operator), the goal-seek selects the SAME unique root:
  **w′ = w0 to ≤4.6e-13 at every strike K∈{1.1,1.5,2,4×} and every τ∈{1,0.3,0.05,0.001}**
  (`/tmp/sk127_goalseek.js`, `/tmp/sk127_bounded.js`). The flatness is NOT a float64 artifact; it is exact
  and τ-robust including τ→0.

**Structural root cause (DOF count, the decisive argument — `/tmp/sk127_structural.js`):** on the locked
architecture (entry-94: plain Balancer + static lens), the operator's chart-2 curve is
`g_loc(K) = [w/(1−w)]·h′(|ln(θ_K / ((1−w)/w))|, τ)`. With τ static, **chart-2 has exactly ONE live
parameter: w** — BOTH its steepness (w/(1−w)) AND its mode ((1−w)/w) are functions of the single scalar w.
A goal-seek is ONE scalar equation. **1 equation, 1 unknown ⇒ the whole curve is pinned ⇒ no per-strike
degree of freedom.** Re-modeling the TRADE (at-strike vs premium) changes pool TRAVEL, not the chart-2
parameter count. **The flatness is ARCHITECTURAL, not an artifact of the spot-premium model.** The operator's
correct trade model does not rescue it.

The strike-dependence he wants survives only by **keeping the Step-1 landing w_t and NOT goal-seeking back.**
But that re-centers the mode to θ_K (`mode_after = (1−w_t)/w_t = θ_K`) — which is **exactly the
move-the-pool maneuver he DISCLAIMED in entry-118** ("the mode stays put; lens has zero effect at the mode").
And even then chart-2 is still a single-w curve, just shifted+rescaled to a different single w_t — a moved
mode, not a per-strike bend (`/tmp/sk127_structural.js` last block).

## (c) Bounded-buildable, or a runaway?

- **Goal-seek w′:** bounded in (0.5,1), unique on the w0-branch, no 1/w′ runaway (the runaway was the (W)
  FIELD inverse, not this single-w solve — consistent with #41). Solvent, single-basis (price==slope on
  Balancer). So the goal-seek is buildable — **but it delivers the flat warp.**
- **The at-strike swap itself (Step-1) is UNBOUNDED in reserves:** y_t ~ 1/θ_K diverges for deep call
  strikes (y_t = 4.0e+2 at θ_K=0.001; `/tmp/sk127_bounded.js`). An asset-for-$ swap that literally executes
  at a far-OTM strike moves the pool arbitrarily far. This is a real solvency hazard the at-strike model
  re-introduces that the premium-sized swap did not have. (This is the same "dust-trade far-OTM blow-up"
  family the operator already accepts caps on — entry 41/100.)

## (d) Does this reconcile his "more warp far OTM" (entry 31/121)? — partially, same as #39/#41.

The strike-dependence he keeps sensing is REAL but lives in the **lensed-SLIPPAGE READ**, not the curve
write: under at-strike execution, per-$ impact = `g_loc(K)` rises 0→γ saturating as K goes OTM (verdict
#39 ruling 3, re-confirmed; the at-strike model makes this read even more pronounced because the execution
literally sits at the K ray). He is **vindicated on slippage-rising-OTM**; he is **wrong only on the
inference that this implies a strike-dependent CURVE reshape**. The curve write stays a single-w object.

---

## VERDICTS

- **PASS** on (a): the build IS mis-modeled vs entry-127 (premium-cash-at-spot, not asset-for-$-at-strike).
  Attacked by reading the live `executeLeg`/`tradeUpdate` path; the operator's diagnosis of the build is
  correct. **This is the honest headline: the team's trade model does not match the operator's definition.**
- **FLAG-WRONG on the EXPECTATION** (carried from #41, re-derived from the at-strike model, not assumed):
  the at-strike re-modeling does **NOT** make the warp strike-dependent. The goal-seek `gLoc(w';θ_K,τ)=g_pre`
  is swap-size-independent ⇒ w′=w0 at every strike (≤4.6e-13, all τ). The flatness is architectural — chart-2
  is a one-parameter(w) family ⇒ a one-equation goal-seek pins the whole curve, no per-strike DOF. Fixing
  the trade model does NOT deliver the strike-dependent warp.
- **The genuine strike-dependent reshape requires a weight FIELD w(u)** = the demoted (W) curve (verdict #40,
  settled: "a scalar cannot bend a curve at a strike; only a field can"). The operator's at-strike trade does
  not add a curve DOF; it adds pool travel (and an unbounded-reserve hazard far OTM).
- **NOT a green light to "swap asset-at-strike + goal-seek"** as the fix for the warp: it is buildable but
  collapses to flat, and the un-goal-sought variant violates entry-118 (mode re-centers) and risks unbounded
  reserves. The architectural answer is unchanged: strike-dependent curve reshape ⇒ field, not scalar.

## What the operator is OWED, plainly (relay duty)
1. He is RIGHT that the build does the AMM tx wrong (premium-at-spot, not asset-for-$-at-strike).
2. He is RIGHT that slippage rises further OTM.
3. Fixing the trade to his at-strike model does NOT make the curve warp strike-dependently: the lensed
   chart-2 curve has only one knob (w), so any single goal-seek resets it to w0 — flat — regardless of how
   the trade is sized. A strike-dependent curve reshape needs the field-based (demoted) curve, still open.

Two of three of his points hold. The one that doesn't is structural, not a modeling slip — and I re-derived
it from HIS model, cold, not from the prior answer.

— skeptic, 2026-06-12 (READ-ONLY; `/tmp/sk127_setup.js`, `_atstrike.js`, `_warp.js`, `_goalseek.js`,
`_bounded.js`, `_structural.js`)

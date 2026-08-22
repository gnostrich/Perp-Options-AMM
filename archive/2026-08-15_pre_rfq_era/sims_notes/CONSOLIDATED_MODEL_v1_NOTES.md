# CONSOLIDATED_MODEL_v1.xlsx — everything in one sheet, with checks

**BRAINSTORM / non-core.** Consolidates the whole design after the two-curve resolution.
6 sheets: `0_Inputs` · `1_Curves` (bid/mid/ask) · `2_Apportion` · `3_LP_Econ` · `4_Trader_Acct` · **`5_CHECKS`**.

## Open items brainstormed to conclusions (this pass)

**1. MARKING RULE — recommendation: MID for display/funding, CLOSE-OUT for liquidation.**
| option | verdict |
|---|---|
| mark at **mid** | clean display, but you can't exit at mid ⇒ **phantom equity** ⇒ with a 50× cap you liquidate **too late** ⇒ bad-debt risk |
| mark at **close-out** (long→bid, short→ask) | equity = what you'd actually have; safe; but shows an instant spread loss on open |
| **mid for display + close-out for the liquidation test** | ✅ **recommended** — cannot create bad debt, and it's what perp venues already do |

**2. PAYOUT UNDER TWO CURVES — my earlier derivation omitted LP revenue entirely.**
The trader opens on one side and closes on the other, so it **crosses the spread twice**:
`LP revenue per round trip = (V_open + V_close) · h · K`, always positive. Measured (h=15bps):
S_close 110k → trader P&L 2,571 → 2,531 (spread cost 41); 90k → −3,475 → −3,525 (cost 50). The single-curve
version had **no** LP revenue in it — that was the reversibility error.

**3. L7 — the required half-spread.** Break-even: `h* = G·RV² / (turnover × days)`
| g | G | turnover/day | required h* |
|---|---|---|---|
| 1 | 1.0 | 0.3 | **33 bps** |
| **2** | 3.0 | **0.3** | **99 bps** |
| 2 | 3.0 | 1.0 | 30 bps |
| 3 | 6.0 | 0.3 | 197 bps |
**Lower g (flatter, fatter wings) = less gamma = cheaper to run.** So the steepness knob `m` is an
**economics lever, not just a pricing one** — a genuinely new finding.

## The checks (all independently re-derived by the manager, not read from the sheet)
| # | check | result |
|---|---|---|
| C1 | shares sum to 1 at every strike | 0.00e+00 **PASS** |
| C2 | aggregate mid = common mid (no smile) | 5.55e-17 **PASS** |
| C3 | value ≥ intrinsic | slack ≥ 0 **PASS** |
| C4 | seam inside grid / dynamic | u_seam = −0.4055 **PASS** |
| C5 | hedge residual (loop closure) | 0.00e+00 **PASS** |
| C6 | trader carve conservation (both clubs) | 0.0000000000 **PASS** |
| C7 | spread revenue > 0 (irreversibility) | $55,736 **PASS** |
| C8 | account leverage vs 50× cap | 5.00× **PASS** |
| **C9** | **LP net APR** | **−14.32% ✗ FAIL** |
| C10 | required half-spread h* | **98.6 bps** |
| C11 | actual tightest h | **5.0 bps** |

## ⚑ THE HEADLINE — the mechanism is sound, the ECONOMICS are not (at these parameters)
Every structural check passes. **C9 fails: at 5bps spread and 0.3×/day turnover the LP loses 14.32%/yr**,
because required `h*` is **99bps — 20× the actual 5bps**. Per LP: C −9.71%, B −11.59%, A −38.26%.

**This is the honest state of the business case.** The levers, in order of size:
1. **Wider spread** — 99bps at 0.3× turnover, or 30bps if turnover reaches 1×/day.
2. **Lower g (flatter curve / lower m)** — g=1 needs only 33bps. Halving G halves the required spread.
3. **More turnover** — linear.
4. **Perp funding capture on the hedge** — covers 15/44/87% of the bleed at 10/30/60% APR.

`5_CHECKS!C10 vs C11` is the viability test; it is wired live, so any parameter edit re-runs it.

## Still open after this pass
Individual-rationality theorem (instrument now exists via per-strike `h_i(k)`, theorem doesn't) ·
`walk_equiv` segmented case (G8) · engine integration (L1, and two curves is a bigger engine change) ·
L3 close semantics · L5 live γ from w.

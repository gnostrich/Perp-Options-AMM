# Correct payout on close — perp sliver + perp-option, DERIVED (not assumed)

**BRAINSTORM / non-core.** Operator entry 512: does the loop have the correct payout for the closed
things (perp sliver + perp-option sold/bought upon it)?

## Honest gap this closes
v3's Circuit B took both P&Ls as **input percentages** (5% / 8%). Its conservation check therefore proved
only that the *bookkeeping* loses nothing — **not** that the payout is right. Both legs are now **derived
from the curve and the price move**:
```
u = ln(S/K)                V(u) = 1−e^u  (past seam) | V_atm·e^(−g·u)  (continuation)   [ONE number]
option leg ($)  = ±(V(u_open) − V(u_close)) · K · N        (+ = sold, − = bought)
perp sliver ($) =  N · (S_close − S_open)  · (long/short sign)
payout          = carve equity + option leg + perp sliver     -> cashed out DIRECTLY, together
```

## Verified (sold put + long perp sliver, K=$100,000, g=2, seam S*=$66,667)
| S_close | S/K | V_close | regime | option $ | perp $ | TOTAL $ |
|---|---|---|---|---|---|---|
| 130,000 | 1.300 | 0.0877 | continuation | +6,049 | +30,000 | **+36,049** |
| 100,000 | 1.000 | 0.1481 | continuation | 0 | 0 | **0** |
| 85,000 | 0.850 | 0.2050 | continuation | −5,690 | −15,000 | **−20,690** |
| 66,667 | 0.667 | 0.3333 | **at seam** | −18,518 | −33,333 | **−51,852** |
| 50,000 | 0.500 | 0.5000 | **INTRINSIC** | −35,185 | −50,000 | **−85,185** |

**1. Payout is CONTINUOUS across the seam (C⁰) and smooth (C¹).** One-sided gaps shrink 10× per 10× smaller
step (200 → 20 → 2 → 0.2 → 0.02); one-sided **slopes agree to 2.25e-07** (both 2.000000). The smooth-paste
carries all the way through to the cash payout — **no jump when the option crosses into intrinsic.**

**2. Deep-ITM exact.** Option leg = `(V_open − (1 − S/K))·K` to **0.00e+00** at S = $30k / $10k / $1k —
i.e. past the seam the option pays exactly its intrinsic, as it must.

**3. Conservation still holds with DERIVED P&L:** `(perps-tab-after + cash-out) − before − P&L = 0`
(residual ≤1e-10) at S_close = $110k / $90k / $60k.

## ⚑ ECONOMIC FLAG (operator-tier, not a model defect)
With a **sold put + LONG perp sliver**, both legs lose together on a fall, and the **cash-out goes negative**
past the carve — the trader owes beyond the carved equity:
| S_close | derived P&L | cash-out |
|---|---|---|
| 100,000 | 0 | +200,000 |
| 90,000 | −134,751 | +65,249 |
| **80,000** | −283,333 | **−83,333** |
| **60,000** | −651,852 | **−451,852** |
(carve equity $200,000 backing $1,000,000 carved notional.)
The payout is **correct per the curve** — but it shows the sliver/option **pairing direction** and the
**liquidation rule** are load-bearing: a carve is not automatically self-collateralising. Which pairings are
allowed (and what happens when the carve is exhausted) is an **operator/product decision**, not modeled here.

## Status
Payout: **derived, continuous, intrinsic-exact, conserving.** Still open: L1 per-LP not in engine · L2 funding
rate law · L3 close semantics · L5 live γ · **L6 (new): liquidation / negative-cash-out rule for a carve.**

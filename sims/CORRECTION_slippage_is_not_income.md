# CORRECTION — slippage is NOT LP income (operator entry, 2026-08-14)

**I got this wrong in the previous turn and the operator caught it.** I claimed spread "unifies into the
curve" as slippage and that this *is* the LP's compensation. It isn't.

## The proof (direct CPMM round trip, x·y=k, x₀=100, y₀=100,000)
| | pool after | trader |
|---|---|---|
| buy 5 units | (95.0000, 105,263.1579) | **paid** $5,263.1579 |
| sell 5 back | (100.0000, 100,000.0000) | **got back** $5,263.1579 |
| **net** | **exactly the start** | **$0.0000000000** |

**Slippage is fully reversible.** The trader paid nothing net; the LP earned nothing. With a 25bps fee the
same round trip costs the trader exactly $26.3158 = the two fees, which the LP keeps.

- **slippage** moves the *pool state*; reverse the trade and the concession comes back. A temporary price
  concession, **not a transfer**.
- **fee** leaves the state untouched and moves cash. **Permanent.**

**Correct identity:** `LP P&L = FEES − LVR/adverse-selection (+ inventory P&L, removed by delta-hedging)`.
Order-book "spread income" has **no AMM analogue in slippage**.

## ⚠ Material consequence — L7 gets substantially worse
My L7 break-even counted **both** a "spread income" line **and** fees. The spread line was invalid and comes out.
| turnover/day | OLD (wrong) spread+fees | CORRECTED fees only | net vs bleed ($187,407) |
|---|---|---|---|
| **0.30** *(called realistic)* | 23,751 | **4,750** | **−182,657** |
| 1.00 | 79,171 | 15,834 | −171,573 |
| 2.37 | 187,635 | 37,527 | −149,880 |
| 11.84 | 934,215 | 186,843 | ≈ 0 |

**BREAK-EVEN TURNOVER: 2.37×/day (wrong) → 11.84×/day (corrected)** — about **39× above** the 0.2–0.4×/day
called realistic. At 2.5bps the fee simply cannot pay for the gamma.

**The levers, honestly:**
| fee | break-even turnover |
|---|---|
| 2.5 bps | 11.84×/day |
| 10 bps | 2.96×/day |
| 25 bps | 1.18×/day |
| **50 bps** | **0.59×/day** |
| 100 bps | 0.30×/day |

Perp funding on the hedge (unaffected by this correction): 10% APR = 15% of the bleed · 30% = 44% · 60% = 87%.

**⇒ At realistic turnover the business needs fees in the tens of bps, and/or material perp-funding capture,
and/or a lower gamma (higher `m`/`γ` ⇒ thinner wings ⇒ smaller `G`).** 2.5bps does not clear.

## Consequence for the fairness analysis (channel 1 changes shape)
Channel 1 ("the tightest quoter sets everyone's pay") is an **order-book** artifact — it came from LPs quoting
`h` separately. An AMM with a **single pool-level fee** has no such override: everyone earns the same rate,
apportioned by depth share. **But the replacement problem is real:** with a uniform fee, an LP taking wing
risk **has no instrument to charge for it**. So channels 1 and 2 merge into one:

> **uniform fee + heterogeneous risk ⇒ the wing LP is structurally underpaid and cannot fix it.**

**The AMM-native remedy is a per-STRIKE fee schedule** (a pool-level function of strike, *not* a per-LP quote):
higher fee where flow is toxic. It keeps the mechanism quote-free (no `min()`, no override), while letting
compensation track risk — and it makes "post depth in the wings" rationally choosable. That is the concrete
form the individual-rationality conjecture should take.

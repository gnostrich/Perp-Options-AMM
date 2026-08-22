# CLOSED_LOOP_MODEL_v3.xlsx — BOTH circuits, end to end

**BRAINSTORM / non-core.** v3 = v2 (faithful ITM curve) **+ the TRADER circuit** (operator entries 510–511).
The loop has **two circuits sharing one book**, and both now close numerically.

## Circuit A — LP / pool side (sheets 1,2,3,4,5,6,7)
perp book → per-LP shape (β·Δ², h·|Δ|) → aggregate (1/β_agg=Σ1/βᵢ, tightest spread, strike-invariant shares)
→ portfolio accounting (**one number**, ITM via smooth-paste) → economics → margin doorway → **hedge readback**
(`NetPerp + ΣΔ(u)q(u)`) → back to the perp book. **Residual exposure = 0.000e+00.**

## Circuit B — TRADER side (sheet `8_TraderCircuit`) — NEW, verified against the engine
Operator entry 510/511, and the engine agrees line-for-line:
| step | operator's words | engine |
|---|---|---|
| 1 | perps opened into **shared wallets, one for all longs one for all shorts**, aggregated | `state.clubs[side]` L2390; `clubs[side].totalNotional`, `perpIds[]` L2426-7 |
| 2 | option created **upon** a perp ⇒ **that much perp removed from the perps tab** | `club.equity -= carveEquityAbs` L2697; `carvedNotional`/`carvedEntryEquity`/`entryPerpMark` frozen at carve-time |
| 3 | option closes ⇒ **the backing perp portion also closes** | `club.equity += retEquity` L2724 |
| 4 | **P&L for the perp-option + its perp is cashed out directly** | stage-2→3: carved-perp units → $ via the carved slice's equity at closure |

**Conservation verified (residual 0.000000 both sides):**
```
LONG : equity $800,000 | carve $200,000 | perps tab after $600,000
       perp P&L $10,000 + option P&L $16,000  ->  DIRECT CASH-OUT $226,000   residual 0
SHORT: equity $600,000 | carve $180,000 | perps tab after $420,000
       perp P&L  $9,000 + option P&L $14,400  ->  DIRECT CASH-OUT $203,400   residual 0
       TOTAL direct cash-out $429,400
```
Check: `(perps-tab-after + cash-out) − equity-before − P&L = 0` — nothing created or lost at the exit.
The carved perp does **not** return as an open position: it **closes**, and both legs' P&L settle **together**
in one direct payment. That payment IS the Layer-3 doorway (perp units → actual margin/cash).

## How the two circuits meet
The trader's carved-perp-backed option position is the **counterparty** to the LP book: same contracts,
opposite sign. Option value is denominated in **carved-perp units** on both sides; dollars appear **once**,
at the exit, via the carved slice's closing equity × L0.

## Status
Closes: Circuit A residual 0 (non-tautology: hedge_ratio 0.95 → +0.218u/$21,837) · Circuit B residual 0 ·
shares strike-invariant to 1.1e-16 · seam dynamic (S*/K slides 0.500→0.667→0.750 with w or m; strikes flip regime).
**Open:** L1 per-LP not in engine (models the target) · L2 funding rate law (update-2) · L3 close semantics ·
L5 live γ from w. Lean cementing in flight (research-lead + Aristotle) — `v3-maps-lean` trusted-from-prover.

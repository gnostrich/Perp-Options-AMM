# VERIFY — trader cashflow: the "extractable/unbounded leak" was a MISATTRIBUTION (RETRACTED)
_research-lead 2026-07-07; real engine HEAD `51342574` (blocks `0e0a0062`); vm-extract of engine+state
(Store) blocks; no web/git/engine/Aristotle. Manager persisted. Harnesses scratchpad/{trader_cashflow,reversibility}.js._

## Bottom line
Operator correct; `VERIFY_drain_structural_2026-07-07.md` was self-contradictory. **RETRACTING claim (b)**
("trader_pnl_swap=−ΔVmkt, fully extractable, unbounded"). Engine credits the trader **option/perp value
ONLY**; the AMM swap (dx,dy) is a **pool-internal reserve reprice** no wallet touches. Prior number assumed
the trader pockets swap reserves — the code does NOT implement that. Operator's division of labour (AMM tx
does not conserve value; option-price layer does & sets realized exchange) is **honored by the engine.**

## 1. Trader realized cash — code paths
- **openBand (L2612):** only trader/club debit = fee (`club.equity -= fee_usd` → fees_accrued, "NOT pool",
  L2668-9). AMM swap = `state.pool = result.finalState` (L2663), pool-internal. Carve relocates club→band,
  still trader-owned. NO line pays pool dx BTC / credits trader dy from the swap.
- **closeBand (L2735 / Engine L2103):** trader credited exactly two things — (Layer1 L2751-3)
  `club.equity += carvedEquityAtClosure` = carved perp slice directional P&L (perp mark, not swap); (Layer2
  L2762-4) `overlay.trader_payout = L0·raw_net·carvedEquity`, raw_net=Y−X, X/Y = lensed option VALUES
  ("NOT the pool move", L2228/2244/2256), explicitly NOT added to club.equity (L2756-61). AMM reversal =
  `state.pool = r.finalState` (L2744), pool-internal. **No code path assigns the trader the swap dx/dy.**
  Trader gets option/perp-value settlement ONLY.

## 2. Residual Δx BTC? → NO
Club record is all-USD {equity,totalNotional,carvedNotional,carvedEquity} — no reserve/BTC field (L2426).
Prior "trader left holding residual Δx BTC" = FALSE; Δx is pool reserve delta only, no trader entry.

## 3. Numbers (real Store, sell-call K=104k/buy-put K=64k, N=0.1)
| k (80k→) | trader Δclub.equity (perp P&L) | overlay payout | pool ΔVmkt (close swap) |
|---|---|---|---|
| 1.0 | $1,000 | $11.46 | −$1,663.76 |
| 2.0 | $9,000 | $23.43 | +$22,077.60 |
| 4.0 | $25,000 | $69.57 | +$106,729.62 |
Trader cash (long carved-perp bet + tiny overlay) fully DECOUPLED from pool ΔVmkt; the $9k/$25k = long perp
appreciating (setOracle sets perpMark=oracle, L2504), legit, nothing to do with the swap. Pool's +$106,730
credited to NO ONE.

## 4. Reversibility → (A) IL-like repricing, recovers (NOT persistent loss)
Price up to kUp then RETURNED to deploy before close, pool value vs no-band counterfactual:
| close law | close@elevated (kUp=2/4/16) | **price RETURNED (close@1)** |
|---|---|---|
| revertArc (HEAD) | +$25k/+$123k/+$2.0M | **−$273.65 (identical all kUp)** |
| liveRho (update-1) | +$5.8k/+$14.5k/+$50k | **+$145.59 (identical all kUp)** |
Big numbers exist ONLY while price stays elevated at close (mark-to-elevated-oracle). On return, residual is
a FIXED ~$200 independent of excursion — signature of IL-like repricing (A) that recovers, NOT unbounded LP
loss (B). Even update-1 liveRho = fixed ~$150 self-drain, does NOT scale with the move.

## 5. Verdict
Operator's claim CORRECT as built. AMM tx doesn't conserve value (reserves reprice IL-like, nobody extracts);
option/perp-price layer conserves value & sets the trader's realized exchange. **RETRACTION:** drain-note
Q2/Q3 ("unbounded", "fully extractable") WITHDRAWN as misattribution (marked pool repricing at the oracle as
trader extraction; omitted the reversibility check). Contradiction resolved by keeping (a) dropping (b).
**Survives:** a tiny FIXED ~$200/round-trip self-drain (∝N², sign per close law) — bounded, non-scaling,
non-extractable. **Update-1 is clean of the alleged exploit.** Prior "OBSCENE-STRUCTURAL" corrected to:
no structural exploit; bounded IL-like reprice + documented tiny self-drain.

## Operator-tier flags
- F-RETRACT: update-1 close is NOT the unbounded/extractable exploit flagged at entry 453. The entry-452
  sequencing justification (partly the drain alarm) is weakened; charge-back safety fine to keep parked
  (entry 451) but not because of an unbounded leak.
- F-SCOPE: the ~$200 self-drain is a design choice (harmless in sim; small LP-vs-cycler asymmetry multi-party).
  Neutralize (update-2 floor) or not = operator product call; small & bounded, not pool-exceeding.

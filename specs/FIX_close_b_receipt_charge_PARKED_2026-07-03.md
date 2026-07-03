# PARKED FIX — Close-(b) + receipt/charge defense set (DO NOT LOSE)
_Status: **PARKED by operator entry 424 (2026-07-03)** — fully specified, research-complete,
build chain armed but NOT dispatched; fires on a one-word operator "go"._

## The ruling chain (all verbatim in history/operator/2026-06-10_kurtosis-curve-family-brief.md)
- **405** "its to be b" — close = FIRST-CLASS TRADE on the live curve (one tx logic, no frozen-arc
  un-booking, no separate ITM-to-cash branch).
- **407** "ok fix the HTML for b" — build go (later superseded by 424 park).
- **412** charge-back direction: "if theres a natural way to quantify round trip profit and charge
  it back without chnaging mechanics thats probably ideal".
- **414** operator gloss: keep a record of "immediate roundtrip p/l", adjust on closure.
- **415** LP/multi-wallet TBD + benchmark ordered; **417** identity-based defenses are sybil-weak;
  **418** perp/basis parallel; **421/422** entry-liquidity gloss ("smooth!").
- **424** PARK.

## The fix (build scope, 4 MUST items — all wallet-blind/structural)
1. **Live close everywhere**: every leg (OTM and ITM) closes via `tradeUpdateAt` at today's state,
   dy = ∓N·K_tx (frozen), live dx; two-case branch + `revertArc` leave the live flow (arc retained
   as the RECEIPT only).
2. **Counterfactual charge, both sides**: bill = V[receipt-undo] − V[live trade], both evaluated on
   TODAY'S pool (open-side too, so exit-without-close isn't free). Bystander contribution = 0
   (structural); free cycler pays own drain exactly; sybil floor ≈ $546k per γ 1→1.5 on a $1.6M pool.
3. **Entry-liquidity scaling (operator gloss, canonical)**: "the receipt remembers the footprint
   relative to the liquidity at entry and is re-scaled to today's liquidity when the bill is
   computed" — same shape as the existing oracle-rebase scaling. Kills the add-LP/trade-huge/pull-LP
   distortion (which otherwise makes the bill NEGATIVE at f=0.9).
4. **Pool-value floor**: charge credits the pool up to pre-cycle value exactly (P-CYCLE holds);
   skew persistence paid-for (R-D family).

## Gates plan (from spec)
CM6-v2 retired → CM6-v3 (pool no-free-lunch + ratchet bound + charge correctness), NEW CM12
(payout continuity across the old branch boundary — the 221.38→1.24 win), CM8-v2 survives; all
negative-controlled. Depth-at-close default: best-effort reserve leg + full option-layer settle.

## Next-campaign dials (SHOULD, calibration not design)
EMA-banded read-γ (blast 20.6%→2.3% transient) · per-window w-rate-limit · funding clamp ·
(DEFER: insurance fund, only sound at κ>1).

## Source documents
- `specs/SPEC_close_first_class_trade_2026-07-03.md` (design, FLAG-CURVE/R-A/R-D)
- `notes/research/NOWORSE_roundtrip_vs_dynamic_amms_2026-07-03.md` (Curve benchmark)
- `notes/research/DEFENSE_TAKESTOCK_vs_dynamic_amms_2026-07-03.md` (parts 1–4 + operator gloss)
- Register row A17 · DIFF_LEDGER rolling -CLOSE405 · story table row 15.

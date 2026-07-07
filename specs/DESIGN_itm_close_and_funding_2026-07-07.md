# DESIGN — ITM close (sell-back model) + funding base (consolidated)
_Consolidated from the entry 433–448 brainstorm+verify thread. Feeds the parked close-(b) spec
(`SPEC_close_first_class_trade_2026-07-03.md` / `FIX_close_b_receipt_charge_PARKED_2026-07-03.md`).
Design record; NOT a build go (build parked, operator entry 424). All claims below either
operator-ruled or engine-measured (verify notes cited)._

## A. How each PART of a position closes when ITM (clarifications reached)
Three parts, DIFFERENT behavior at the mode crossing — by design:
| Part | ITM close behavior | Mode crossing |
|---|---|---|
| **Swap (AMM/bookkeeping)** | reverse trade at TODAY's curve; ITM trade point lands across the mode; defined by SKEW DIRECTION which is continuous through ρ=1 (measured `VERIFY_itm_close_directionality`). No parking, no cash branch, no special path. | TRAVERSES |
| **Value (option-pricing/chart-2)** | SELL BACK at today's market value (=parity deep ITM), read off the extended curves; continuous through crossing; NEVER exercise. | TRAVERSES |
| **Funding** | ZERO ITM (option-part/extrinsic gone; underlying's cost = perp layer, external per entry 320). | STOPS at the money |
One-liner: swap + value ride across the mode; funding stops at the money. No leg pulled off the pool.

## B. Changes to be made
**Close-(b) (parked build, enriched):**
1. Close = live reverse trade EVERY leg (OTM+ITM) — no two-case, no cash-settle, no frozen-arc un-booking.
2. Quantity/value from the option-price layer (chart-2), continuous ITM.
3. Safety: counterfactual RECEIPT + charge-back (open+close sides), scaled to ENTRY-LIQUIDITY + rebase,
   + pool-value FLOOR. (The drain fix; sybil/bystander/LP-resize-proof per DEFENSE_TAKESTOCK parts 1–4.)
4. Depth at close: best-effort settle.
5. Gates: CM6-v2 → CM6-v3 (pool no-free-lunch); NEW CM12 (payout continuity across old branch — kills the
   45% two-case seam [VERIFY_escrow_denomination] and the 221→1.24 jump); CM8-v2 survives.

**Funding (new, separate small change — from `VERIFY_funding_profile`):**
6. Change funding WEIGHT from full-mark to EXTRINSIC (mark − parity). ⇒ funding ZERO ITM automatically,
   clean single hump @ATM, fixes the non-monotone shape. KEEP the existing pool-imbalance sign (S−1).
   NOTE (measured): shipped funding sign keys off the POOL ANCHOR / deploy price, NOT per-leg moneyness;
   the per-leg "sign flips at its own mode" idea (entries 443–447) is NOT in the engine and adopting the
   entry-386 same-slope read would ADD the sus inversion. On an equilibrium pool a pure spot move = zero
   funding (oracle cancels); funding responds to pool disequilibrium (skew/arb).

**Today's shipped version — CTO handover (independent):**
7. LP-drain exploit on the frozen-arc close (`DEFENSE_TAKESTOCK` PART 5): WARN the CTO in writing, or add
   the ~2-line LP-lock. Bites only in a multi-party pool (the CTO's Go backend), not the single-user sim.

## Open operator-tier choices
- Funding base: EXTRINSIC (manager rec) vs full-value.
- Deep-ITM payout denomination: symmetric-escrow (as built) vs classical intrinsic — mostly MOOT under
  sell-back (market value = escrow value).
- LP-drain handover: warn vs LP-lock.
- Build go (parked, entry 424).

## Provenance
Rulings: 405 (close=first-class trade b), 424 (park), 446/447 (funding zero ITM), 447 (swap crosses mode
skew-consistent). Verifies: `VERIFY_itm_close_directionality_2026-07-07`, `VERIFY_escrow_denomination_2026-07-07`,
`VERIFY_funding_profile_2026-07-07`, `NOWORSE_roundtrip_vs_dynamic_amms_2026-07-03`, `DEFENSE_TAKESTOCK_vs_dynamic_amms_2026-07-03`.

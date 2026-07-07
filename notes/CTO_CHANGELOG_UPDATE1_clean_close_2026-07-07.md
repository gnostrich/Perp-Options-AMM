# CTO CHANGELOG — UPDATE-1: clean sell-back close + funding-on-option-part
_Supersedes the close section of `notes/CTO_CHANGELOG_80f050e2_to_current_2026-07-03.md`.
HEAD now `bb2f8230` (was `4bc939ec`/`51342574`). Feature-level, plain English. Owned: manager.
Trigger: update-1 merge to main (`3eee88fb`, 2026-07-07)._

## What changed (port these)

| # | Change | Plain English | Port |
|---|---|---|---|
| 1 | **Close is now ONE path — a sell-back trade for every leg** | The old close had two branches: OTM legs reversed on the AMM, ITM legs were pulled off and cash-settled (a seam that made total payout JUMP ~45–87% at the OTM→ITM boundary). Now EVERY leg closes as a live reverse trade on today's curve (`tradeUpdateAt`), ITM included. No cash-settle branch. Payout is continuous across the strike — the jump is gone (tester-measured: crossing step 0.48× median, i.e. no jump). | **YES — close path** |
| 2 | **Funding is charged on the option-part (extrinsic), not the full value** | Funding weight `mark` → `mark − intrinsic` (intrinsic = the parity arm: put `max(0,1−mode/θ)`, call `max(0,1−θ/mode)`). Result: funding is a single hump peaking at-the-money and **exactly zero once past the free boundary S\*** (deep ITM). Rationale: an ITM option is mostly the underlying, whose holding cost is the perp layer's job — don't double-charge it. The pool-imbalance SIGN (`±g·(S−1)/S`) is unchanged. | **YES — funding weight** |

## The residual x-drain (KNOWN, DOCUMENTED — read this carefully)
The new close does NOT round-trip the pool's reserves exactly (the old frozen-arc close did). A round trip leaves a small underlying-reserve shortfall (`Δx<0`, `Δy=0` exact). **The corrected, verified characterization** (an earlier internal note wrongly called this "unbounded/extractable" — RETRACTED; see below):
- **NON-EXTRACTABLE by construction.** The trader is credited option/perp VALUE only (`L0·raw_net·carvedEquity`, `raw_net = Y−X` = lensed option values locked *before* the swap). No code path credits the trader the swap's `dx/dy`. The pool swap is a pool-internal reserve reprice that no wallet touches. (Verified at the credit paths; the credit wrapper is byte-identical across the change.)
- **IL-like / recovering.** If the price goes out and returns, the residual recovers to a fixed small value independent of how far the price moved — impermanent-loss behaviour, not a systematic bleed.
- **Bounded ~small** (∝notional², e.g. −$29 on a test band). Transient `Δx` tracks the oracle move (it is NOT one-signed across all prices — the "one-signed" only holds at a fixed oracle).
- **Single-user simulator = harmless** (self-drain, no counterparty). **Multi-party backend = a small LP-vs-cycler asymmetry** that you should neutralize with the parked UPDATE-2.

## ⛔ PARKED — UPDATE-2 (NOT implemented; implement before/at multi-party launch)
The **no-free-money floor + counterfactual charge-back** (the receipt-based pool-value protection) is **designed but PARKED** (operator sequencing). It neutralizes the residual x-drain in a multi-party pool and restores the exact no-free-money guarantee. Design is in `specs/FIX_close_b_receipt_charge_PARKED_2026-07-03.md` + `notes/research/DEFENSE_TAKESTOCK_vs_dynamic_amms_2026-07-03.md`. **Do not ship update-1's close to a shared/multi-party pool without update-2.** In the single-user sim it is intentionally omitted.

## Verification you can lean on
- Gates `engine/verify/lens_selfcheck.js` 31 checks (was 24): CM6-v2's exact-round-trip / no-free-money assertion is **RETIRED** (the new close is a pool-reprice close, no exact round-trip); no-free-money returns with update-2's floor. Added CM6-v3 (documents the bounded non-extractable drain), CM12 (payout continuity across the old seam), FE (funding-extrinsic shape). All negative-controlled (the retained old-close twin fails exactly the 7 update-1 discriminators). + a16 5.
- Retraction record: `notes/research/VERIFY_trader_cashflow_2026-07-07.md` (the definitive non-extraction trace) supersedes the retracted `VERIFY_drain_structural_2026-07-07.md` Q2/Q3.

# Model notes — `temporal_lp_economics_MODEL_v5_options_seller.xlsx` (BRAINSTORM, non-core)

v5 = v4 (auditor-corrected options-seller) + operator entry-496 calibrations & execution costs. Supersedes v4.

## Entry-496 changes applied
| # | operator point | change |
|---|---|---|
| 1 | imperfect delta hedging + execution costs | `hedge_exec_cost = 1.0%/yr` (was 0) |
| 2 | 100% daily turnover unlikely; 0.2–0.4x realistic | `daily_turnover = 0.30` (was 1.0) |
| 3 | 2.5 bps likely | `fee_bps = 2.5` (was 5) |
| 4 | a vol-equivalent of LVR (risk 1) + poor "calibrated volatility" (risk 2) | Scenario now splits **Carry (+G·σ_cal²)** and **Vol cost / gamma bleed = −G·RV² (the LVR-equivalent, RISK 1)**; RISK 2 = choosing σ_cal wrong. Both live in `G·(σ_cal²−RV²)`. |
| 5 | constant limit-order placement/updating costs | `order_mgmt_cost = 0.5%/yr` (new) |

Costs default 1.5%/yr combined; fee income now ~2.7%/yr (small). Verified: well-calibrated (σ_cal=RV) BASE ≈ **+1.2%**
(just fees − costs); the LP's real edge is σ_cal>RV (selling vol rich), the real risk is σ_cal<RV (spike/miscalibration).

## Entry-496 #6 — PRODUCT question (NOT a sim knob): can only an LP's YIELD be at risk, not principal?
Because the tail can hit −100%, treasury-type LPs (e.g. Krishna's) need principal protection. Standard structures
(operator/product decision — flagged, not built):
1. **Senior/junior tranches:** treasury LP = SENIOR (principal-protected up to a buffer); a junior tranche /
   insurance fund takes first losses. Senior yields less, principal safe until junior is exhausted.
2. **Yield-only at-risk bucket:** principal sits in a safe vault (e.g. earning HLP base); only accrued yield is
   staked into the options-selling risk → max loss = the staked yield. Caps upside too.
3. **Hard stop-out / auto-deleverage** at the accrued-yield threshold (gap risk ⇒ not a perfect guarantee).
4. **Tail hedge:** AMM buys cheap OTM protection to cap the −100% tail (costs premium, shrinks the edge).
Trade-off: someone must bear the tail (junior tranche / insurance / hedge cost), so principal protection lowers
the senior yield &/or capital efficiency. For treasury LPs the senior-tranche or yield-only bucket is the usual fit.
Can add a "capped-downside/senior-tranche" toggle to the sim on request — but the STRUCTURE is an operator call.

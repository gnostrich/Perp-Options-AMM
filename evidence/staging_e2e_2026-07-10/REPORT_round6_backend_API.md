# Round 6 — backend-API SOP run + reference comparison (manager, 2026-07-10)

Ran the CTO's SOP (`SOP_AMMV2_STAGING_TEST.md`) directly against `staging-be.temporal.exchange` —
API-only, wallet-address string, no browser/wallet/proxy. **This bypassed every wall of rounds 1–5.**
Wallet (address-only, ours): `0x8F40D24c7C5Df2BC49a0Ee67f10B1727c2481F42`. All numbers below are the
manager's own curl output (evidence in `run6_api/`); manager re-derived the conservation check in Python.

## SOP E2E — ALL STEPS PASS
| Step | Result |
|---|---|
| 0 Health / AMM status / oracle / strike-bounds | ✅ DB healthy; AMM `x,y,w,alpha,beta,oracle,perp_mark`; bounds returned |
| 1 Create perp (autoProtect:false) | ✅ 201, `PERP_1783929045068346498`, Long, btc 0.01, our wallet |
| 2 Create band after perp (sell/long, Amount 0.001) | ✅ "Transaction done", `TX_1783929082786470956`, band `B1`; `open_bands` 0→1 |
| 3 Query perps + bands by wallet/id | ✅ available_qty 0.01, band detail returns full option fields |
| 4 Close band (/complete) then perp (/close) | ✅ band `status:completed is_closed:true`; "Perp closed successfully"; `open_bands`→0; pool back to w=0.5 |

## Reference comparison — what the live math shows

### ✅ CONFIRMED matches to the reference build

**1. Pool structure = Balancer α/β (exact).** `/api/amm/status`: `alpha = x·w`, `beta = y·(1−w)`.
Measured: x=10.00063, y=800050.41, w=0.5 → x·w=5.000315=alpha, y·(1−w)=400025.2037=beta. Exact.
= reference feature #1 (Balancer base) + #16 (α=x·w, β=y·(1−w)).

**2. Trade warps the curve — α,β conserved, w moves (the reference's CORE mechanic, feature #16).**
Opening the band moved the pool:
| | x | y | w | α=x·w | β=y·(1−w) |
|---|---|---|---|---|---|
| before | 10.00063 | 800050.41 | 0.500000 | 5.000315 | 400025.2037 |
| after | 9.97835 | 801840.40 | 0.501116 | 5.000315 | 400025.2037 |
α delta = **0.00e+00**, β delta = **0.00e+00**, w moved 0.5→0.50112. This is exactly the paper's
"trades skew the AMM curve instead of moving the reserves point along it" (α,β individually conserved,
w′ derived). The reference exhibit (10,10,w=½; ray4 cash1 → w′=11/21) is the same law on a toy pool;
staging's pool/trade differ in scale so 11/21 isn't expected — the **mechanism is confirmed exact**.

**3. Close reverses the warp.** After closing band+perp, pool returned to w=0.5, x=10.0006, y=800050.41
(= starting state). = reference "close = reverse the trade / update-1 clean sell-back."

**4. Balanced-pool funding = 0.** Fresh perp on the w=0.5 pool: `fundingRate:0, fundingAccrued:0`.
Consistent with reference "funding (ray deviation) is zero on a balanced pool." (Directional — a fresh
position; not the full per-strike deviation sweep.)

**5. Vocabulary + option structure match (feature #7/#8, endorsed terms).** Band detail exposes
`sold_wing:"call"`, `bought_wing:"put"`, `sold_k_tx`/`bought_k_tx`, inner/outer bounds, `pt_asset`,
`net_band_payout`, residual bounds, club_equity. No "lean". Strike-bounds use `theta` (strike/spot),
call wing above spot / put wing below — matches the reference registration.

### ⚠ NOT directly confirmable from this run (need more)
The specific reference CONSTANTS — put ITM exercise $66.67 (=⅔K), value ⅓, ATM 0.148; m=3 → $85.71/⅐/
0.057 — are per-strike option-VALUE points. The backend exposes `pt_asset` per band but **no full
per-strike tree endpoint** was found (`/api/amm/tree|curve|nodes` = 404; the app's `/api/stream/market-
data` SSE streams oracle only, no `long_tree/short_tree`, for our session). So:
- The theta bounds returned ([0.5,1.5]) are **±50%-from-spot display caps** (min/max_pct_from_spot = ∓50),
  **NOT** the smooth-paste seams — I can NOT read g=m·γ off them (correcting a first-pass temptation to
  claim "seam 1.5 ⇒ g=2").
- To confirm $66.67/0.148/w′=11/21 numerically we need EITHER the per-strike tree (a `long_tree/short_tree`
  feed/endpoint) OR a controlled (10,10) pool + a matched trade. Recommend asking the CTO for the tree
  endpoint (or how to get the SSE to emit trees).

## Net
The SOP **works end-to-end**, and the live backend **confirms the reference build's core mechanics**
(Balancer α/β pool, trade-warp with α/β conserved + w-moves, close-reverses, balanced-pool funding-zero,
option vocabulary/structure). The exact per-strike option-value constants remain unconfirmed pending a
tree endpoint — nothing observed contradicts them.

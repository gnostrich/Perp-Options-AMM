# THE STORY TABLE — the whole system, one table (operator protocol, entry 312)
_Reprint IN FULL on every change — never a diff. Operator's geometry (entries 304/307/308/311).
Edition 14, 2026-07-02 (entry 359: NEW station 17 — perp-units→cash conversion, ordered into
both table and paper; prior: entry 339 row-3 ORDERED-BUILD; entry 338 lifecycle FLOW; paper may
CLUB the small mechanics)._

| # | Station | The geometry (operator language) | Status |
|---|---------|----------------------------------|--------|
| 1 | **The pool curve** | THE object: one curve in (asset, cash), leaning by `w`; its slope is the price. Everything else is rays on it or shadows of it. | 🔒 |
| 2 | **LP liquidity** | adding/removing liquidity re-sizes the whole picture isotropically (×(1+λ)) — price and lean untouched; not a trade. | ✅ code / 📄 absent (clubbable) |
| 3 | **Trades bend the curve** | a trade re-leans the curve (updates `w`); `k` is a readout. ⚠ ANCHORING: the SPEC says conservation at the trade's own point; the ENGINE applies it at the reserve point (the standing inventory-#16 gap; audit-measured w′ 0.5455 vs 0.5238) — build sequenced per the 06-10 ruling. FLAG-A RULED (entry 339): trade-point IS the truth; ENGINE to be FIXED (paper already tells trade-point — no paper edit). Spec in flight. | 🔨 ORDERED-BUILD |
| 4 | **Strikes are rays** | every strike = a ray from the origin; the pool's centre = the mode ray; one curve + a fan of rays = the book. | 🔒 |
| 5 | **The mark (value)** | moneyness = your ray read against the pool's ray; the mark = the smooth-pasted value on it (waiting arm = a power of the read × the seam constant; exercised arm = parity); 0→1, =1 only at full exercise. | ✅ |
| 6 | **The dial `m`** | set from vol at creation, never moved by trades; steepens every ray equally; MORE volatile asset ⇒ LOWER m. | ✅ |
| 7 | **Rebase** | re-zoom curve + every ray together so the pool's centre tracks the outside price (fires on every oracle change); no ray gains/loses; commutes with trades (proven). | 🔒 |
| 8 | **Opening — the quantity bridge** | buy q = sell q × (option-price ratio); values matched exactly (V_buy==V_sell); the AMM is never a premium counterparty. | ✅ code / 📄 thin (clubbable) |
| 9 | **Opening — the premium-free swap** | each leg's pool movement = ±notional×strike (dy=±N·K_tx); the premium never enters the pool; both band legs push the pool the SAME way. | ✅ code / 📄 absent (clubbable) |
| 10 | **Opening — two-strike semantics** | you SETTLE at the strike you chose; the financing swap lands at the frozen tx-strike θ_tx=mode·(chosen/mode)^m — frozen at open, reused at close ⇒ the pool round-trips EXACTLY. | ✅ code / 📄 thin (clubbable) |
| 11 | **Opening — the depth guard** | a cash-out bigger than ~90% of the pool's cash depth is honestly REJECTED with the numbers — never silently capped. | ✅ code / 📄 absent (clubbable) |
| 12 | **Opening — the fee** | 0.01% of notional, from club equity into a fee bucket — never the pool. | ✅ code / 📄 absent (clubbable) |
| 13 | **Holding — funding** | SAME ray on TWO curves (pool vs anchor), like ray to like ray; the slope DEVIATION is the factor; zero on-anchor; ITM naturally ZERO (parity has no warp-sensitivity); perp-layer funding EXTERNAL by ruling. ⚠ FLAG-C: the engine METERS the rate to a per-leg ledger — no cash moves between sides yet (transfer = part-2 build); "crowded pays" = the rate's sign. → operator | ⚠ wording/hedge call |
| 14 | **Closing — the seam** | the payoff line is the TANGENT to the waiting curve; step off at S*=K·g/(g+1) ($66.67 at g=2); value ≥ payoff everywhere (theorem + gate + measured). | ✅ live |
| 15 | **Closing — settlement** | your right, never forced; OTM close walks the curve (the bend's toll = slippage); ITM close = the straight tail, no toll, parity cash. | ✅ |
| 16 | **Paying — the vault (carve)** | your ITM win is paid from your carved slice, frozen at open; whole-system solvency CONDITIONAL on the funding port (theorem-honest). | 🔒 |
| 17 | **Paying — units→cash** | the mark is a fraction of ONE escrow unit ⇒ a leg of notional q is worth q·mark PERP UNITS; legs net in perp units; dollars enter only at the very end — the net × the carved slice's CLOSING equity (its dollar worth at the reference price then) × L₀. One doorway from perp-land to cash-land, and it's at the exit. | ✅ code / 📄 added (entry 359) |
| 18 | **Paying — the club & L₀** | payout = L₀ × raw net × your carved equity; the CLUB is the (L₀−1) counterparty; a drained club pays a winner nothing (the floor). | ✅ code / 📄 carve-only (clubbable) |
| 19 | **The shadows (charts)** | value pictures = projections of the ray reads; chart-2 = true-V X wings + %→$ toggle (325-F %-label nit queued). | ✅ live |
| 20 | **The paper** | tells stations 1–17 (smaller mechanics may be CLUBBED per entry 338); §3.2 fixed; lab review running. | ✅ / review running |

**Queue:** tx-symmetry study (324) · payoff-chart old-mark read (325-B) · supplement refresh (325-C) ·
American-draft stat (325-D) · %-label vs fraction axis (325-F) · FLAG-A + FLAG-C operator words ·
FLAG-E live-γ precision (rides with pages) · pages (operator, later).
**Snell: OUT OF PICTURE (entry 318). Perp funding: EXTERNAL (entry 320).**

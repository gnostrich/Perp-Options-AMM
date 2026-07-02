# STORY-COMPLETENESS AUDIT — code vs Story Table (ed. 8) vs WINE v2 paper — 2026-07-02

_Operator entry 335. Auditor: research-lead (read-only on paper/table/engine; one Node vm probe of the
extracted engine scripts, HEAD md5 `7015c22c`). Standard: "the story artifacts must tell the same story
the code executes." Every claim below is read off the code (line numbers = HEAD HTML) or measured in the
vm probe; comments were not trusted. The two known operator catches (§3.2 barrier mark — mid-edit by the
paper agent; buy-quantity mechanic — entry 333) are included for completeness and marked KNOWN._

Artifacts: `docs/STORY_TABLE.md` (edition 8) · `paper/wine2026/temporal_wine2026_v2.tex` (read-only) ·
`engine/builds/HEAD_temporal_mvp_v28_lens.html`.

---

## 1. Sequential gap table

Ordered by the engine's own lifecycle: open → trade law → close → funding → rebase → knob → LP → display.

| # | Mechanic (operator's geometry) | In code (fn + line) | In story table? | In paper? | Verdict | Paper-relevant? |
|---|---|---|---|---|---|---|
| 1 | **Buy quantity = what the sold worth buys.** The sold leg's worth V is read off the curve; the bought leg's size is whatever notional that same worth buys at its own ray: `N_buy = V_sell / (per-unit V of bought leg)`. Cash-conserving `V_buy = V_sell` exact (probe 2d). The AMM is accounting + slippage, never a premium counterparty. | `executeBand` L1922–1927 (`denom = pxBuyUnit.V; N_buy = V_sell/denom`) | **NO** (no station/sub-point) | Only obliquely: Prop. 1 "cash-neutral by construction"; Limitations lists "notional-to-cash-leg sizing… open". Mechanic itself undescribed. | **MISSING** (KNOWN, entry 333) | **YES** — a referee will ask how the bought leg is sized; it is the collar's defining construction. |
| 2 | **The pool swap is premium-free: notional × strike.** A leg's pool transaction is `dy = ±N·K_tx` (dollars) — the premium V never touches the pool; it is valuation/sizing basis only. Both band legs push the pool the SAME direction (probe 2c: dy₁=+4400, dy₂=+3628, netPoolY=+8028 on a 0.05-BTC collar) — legs compound, they don't cancel. | `executeLeg` L1827 (`dy = (wingSign*legSign)*N*K_tx`); direction table L1776–1786 | **NO** | **NO** — Eq. (2) takes Δy as given; nothing says how an option leg sizes its cash leg. | **MISSING** | **YES** — without it the reader cannot reconstruct what a trade does to the pool. |
| 3 | **Two-strike semantics (the dial's second job).** Settlement stays at the CHOSEN ray (K_inner); the pool swap lands at the frozen tx-ray `θ_tx = mode·(chosen/mode)^m` (K_tx dollars, FROZEN at open, stored on the leg, reused verbatim at close ⇒ pool reserves round-trip EXACT — a live recompute would leak). One leg, two strikes: the financing leg further out, the option at the picked ray. | `executeLeg` L1821–1827; freeze note L1815–1820; `openBand` stores K_tx L2607/L2613; close reversal reuses it L2093–2107 | **NO** (row 5 has the dial, not the two-strike split) | **HALF** — §4.1 shows the tx-map formula and "sends a trade further out"; the settle-at-chosen vs swap-at-θ_tx split, the freeze, and the exact round-trip are absent. | **MISSING** (table) / **OK-but-thin** (paper) | **YES** — "which strike does my option actually settle at?" is a trader-facing semantic. |
| 4 | **The depth guard (honest reject).** A cash-OUT leg may not take ≥ 90% of the pool's cash depth `y−β` (`DEPTH_FRAC=0.90`, margin off the y→β singularity); the trade is rejected WITH the numbers, never silently resized. | `executeLeg` L1833–1839; constant L1762 | **NO** | **NO** | **MISSING** | Moderate — solvency-adjacent (one leg cannot drain the pool); one sentence would do. |
| 5 | **⛔ THE TRADE LAW: trade-point vs reserve-point conservation.** Paper §2.3 + Eq. (2): conservation applied at the trade's own point T with LOCAL offsets α_T,β_T (exhibit: (10,10,½), θ=4, Δy=1 ⇒ Δx=−5/22, w′=11/21≈0.5238; "off-the-money trades genuinely change the global offsets α,β by design"). ENGINE: `tradeUpdate` applies the conservation with the pool's GLOBAL α,β at the reserve point — probe 1a on the same state: Δx=−5/6≈−0.833, w′=0.5455, and α,β stay exactly (5,5) (probe 1b). The strike enters ONLY the sizing dy=N·K_tx. | `tradeUpdate` L1701–1709 (returns `alpha: s.alpha, beta: s.beta`); no engine path constructs a trade-point state (grep confirms) | Row 2: "conservation applied at the trade's own point … 🔒 unchanged (engine)" — implies engine parity | §2.3 presents Eq. (2) as what the pool does; §4.2 says the pool flow "move[s] exactly as in Section 2" | **CONTRADICTS** — see FLAG-A below | **YES — loudest item.** Feature-inventory #16 mandates the disposition "transformation-faithful, anchoring-OPEN — never 'warp faithful' unqualified"; neither artifact carries it. |
| 6 | **Close = frozen-dollar reversal + two-case settlement.** OTM leg(s): reverse on AMM with `dy_close = −dy_open` at the frozen K_tx (reserves restore exact). ITM leg: settled-to-cash from the unified value, NO AMM transaction ("walk the straight tail"). Both-ITM geometrically impossible — guarded. | `closeBand` L2093–2107 (reversal), L2153–2200 (two cases), L2140–2143 (guard) | Row 8 ✓ (settlement geometry told) | §6.2 has the two-case + composite-ray line; the exact-reversal/frozen-K_tx mechanics absent (fine at paper altitude) | **OK-but-thin** | Low — paper's level is adequate; the freeze belongs with row/item 3. |
| 7 | **The club & the amplifier L₀.** Bands are backed by a SIDE's perp club (pooled margins = equity; free = gross − carved). Payout = `L0 · raw_net · carvedEquityAtClosure` with `L0 = f_E/f_N` (the club's leverage, frozen at open); the club is the counterparty of the `(L0−1)` share; a drained club pays a winning trader NOTHING (floor). Carved bundle physically leaves the club at open and returns at its closed-out worth. | `openBand` L2566–2576 (f_N/f_E/L0), L2649–2657 (move-out); engine `closeBand` L2249–2254 (payout + floor); Store `closeBand` L2674–2697 (return + overlay) | Row 10 has the carve slice only — L₀, the club-as-counterparty, and the floor are absent | §6.2 has the frozen carve; L₀ amplification/club counterparty/floor absent | **MISSING** (the payout formula + counterparty) | **YES** — "who pays the winner and by how much" is the settlement question a referee asks. |
| 8 | **The open fee.** 0.01% of notional, charged to CLUB equity, accrued to `fees_accrued` — never the pool. | `openBand` L2550–2556, L2599–2600 | **NO** | **NO** | **MISSING** | Minor — one clause under mechanism design. |
| 9 | **Open-time guards.** Both legs must be OTM on their wings at open; wing-membership check (a leg's strike must sit on its stored wing's side); over-carve reject; zero-equity/zero-notional rejects. All honest rejects with numbers. | `executeBand` L1891–1904; `openBand` L2545–2548, L2574–2576 | **NO** (implied by rows 3/8) | Implied ("out-of-the-money continuum", opposite wings); not stated as enforced preconditions | **OK-but-thin** | Low. |
| 10 | **Funding is a LEDGER today — no cash moves.** `fundingTick` accrues per-strike amounts onto the band's leg records only; probe 3a: pool NOT mutated, club equity NOT mutated; close payout `L0·raw_net·equity` EXCLUDES accrued funding (probe 3c). The log line says "net trader → pool = …" but no reserves move. ITM legs keep being charged on the continuation read (no regime branch — as row 9 already discloses). | `fundingTick` L2708–2730 (only `leg.funding_*` and `state.t` mutate); `fundingPerStrike` L2281–2289 | Row 9: "OTM like-ray funding built & correct" — true of the RATE, silent that the TRANSFER is unbuilt | §3 "a position accrues funding… the crowded side pays the contrarian side" — the paying is not implemented anywhere | **STALE / overstates** — see FLAG-C | **YES** — "who pays whom, when, through what account" is exactly the funding-port frontier the paper leans on. |
| 11 | **Rebase trigger.** Not periodic: `setOracle` rebases synchronously on EVERY oracle change (r = new/old; x→rx, α→rα; θ live-derived from K/oracle so rays re-aim automatically). Arb-to-oracle is a SEPARATE, manual action in the sim (prod mapping: post-rebase trigger in priceUpdate.go). Side effect: `setOracle` also snaps `perpMark := newOracle` — overriding a previously set "independent" perp mark (probe 6a) — while the initialState comment L2330–2335 claims a rebase does NOT move the perp mark. | `setOracle` L2427–2437; `runArbitrage` L2457–2466 | Row 6 ✓ geometry; trigger unstated | §3.3 "periodically rebases" — event-driven, not periodic | **OK-but-thin** (paper wording stale-ish) + comment-vs-code nit (FLAG-D) | Low-moderate — "periodically" is the kind of word a referee probes. |
| 12 | **The base steepness is LIVE.** `γ = w/(1−w)` is read off the live lean, NOT a deploy constant: at the symmetric start γ=1 (probe 7a — not ">1"), and every trade that re-leans the curve moves γ, hence the lensed steepness g_loc=m·γ, the seam S*=K·g/(g+1), and the funding exponent (probe 7b: γ 1.0→0.8 after one big trade). Only m is static. Paper's worked column "γ=2, m=1" is realized on the shipped default pool as γ_live=1, m=2 (same g — the fixed-g equivalence used in the tester's acceptance). | `gLoc` L1654–1660 ("LIVE steepness, NOT a deploy constant") | Row 5 says m never moves (true) — silent that the γ it multiplies breathes with trades | §4.1 "Let γ>1 be the curve's convexity exponent"; knob narrative reads as static steepness | **OK-but-thin, borderline CONTRADICTS** (γ>1 vs live γ=1 at deployment; static-steepness impression) — FLAG-E | **YES (precision)** — one sentence ("γ is the live lean w/(1−w); m is the static multiplier") prevents a referee catch. |
| 13 | **The m-clamp.** `setM` clamps m to [1,6] (probe 5: 0.4→1, 9→6). Paper says m>0 with neutral m=1; the shallower-than-plain direction (m<1) is unreachable in the engine — "lower setting for a more volatile asset" bottoms out at plain Balancer. | `setM` L2443 | **NO** | **NO** (range unstated) | **OK-but-thin** | Minor — state the deployed range once. |
| 14 | **LP liquidity = isotropic resize, not a trade.** Deposit/withdraw scales (x,y,α,β) by (1+λ), λ=D/2y: lean w, price, and curve-relative position invariant — the curve just RESIZES. Withdrawal > pool value rejected. Preview overlay exists. | `liquidity` L2479–2500; `liquidityPreview` L2505–2513 | **NO** | **NO** (LP appears only as open mechanism-design work) | **MISSING** | Moderate — the paper says LP participation is open; that LPs mechanically CAN enter/exit without moving the price is a real (small) fact. |
| 15 | **The mark the reader is taught.** Live pricing/settlement mark = `markLensed`: power continuation welded C¹ onto the LINEAR intrinsic at S*; ATM reads `(g/(g+1))^g/(g+1)` (≈0.148 at g=2, 0.25 at g=1) — NOT "climbs toward 1 near the money"; 1 is reached only at full exercise. | `markLensed` L1678–1688; v24 `mark` L1613–1616 lives on only in the DRAW-layer payoff chart | Row 4 still teaches "lesser of slope & reciprocal, 0→1 … none OTM (was always right)" — the retired v24 saturating mark | §3.2 Eq. (3) = the retired mark — **KNOWN operator catch, mid-edit by the paper agent** | **CONTRADICTS** in the TABLE (row 4) — the paper fix must propagate; FLAG-B | **YES** — same class as the operator's §3.2 catch; the table is the operator's own map. |
| 16 | **Slippage, as measured.** % = |Δ(w/(1−w)) ratio| per leg (provably = price-based slippage on the hyperbola); $ = Σ per leg |Δy| − p₀·|Δx| (price-drift loss vs flat-spot fill). Display + stored on the band entry. | `executeBand` L1932–1956 | Row 8 has the "bend's toll" idea; no definition | Not defined (only the LVR round-trip residual, correctly scoped as trader-borne valuation cost — reserves round-trip exact by item 6, no conflict) | **OK-but-thin** | Low. |
| 17 | **Charts & previews.** Chart-2 = TRUE per-unit value per wing off the SAME `markLensed` settlement read, seams drawn, dashed parity tails, %→$ toggle, markers on-curve (verified L3750–3903) — matches row 11 ✓. Payoff simulator still reads the retired v24 saturating `Engine.mark` via `legFraction` (L4146–4155; naked leg deliberately uncapped past 1) — KNOWN, parked as entry 325-B. Band preview = full dry-run of `executeBand` on the live pool + two-step stepper + w-ledger readout (L3088–3273). | as cited | Row 11 ✓; 325-B parked ✓; previews absent | Charts/previews out of paper scope | **OK** (chart-2), **OK/tracked** (payoff chart), previews not paper-relevant | No (except keeping 325-B alive). |

Verified-consistent (no gap, listed for negative-space honesty): rebase algebra x→rx, α→rα, β,y invariant
(code L1713–1715 = paper §3.3); funding zeroes at the ANCHOR S=1, not ATM (code (S−1)/S = paper/table);
carve fields frozen at open {carvedNotional, carvedEntryEquity, entryPerpMark} (L2645–2647 = paper §6.2);
two-case settlement exhaustive by cross-wing geometry; `attributablePnL` normalized fractional move;
chart-2 single-basis with settlement.

---

## 2. Loud flags (the §3.2 class)

**FLAG-A (CONTRADICTS — trade law, table row 2 + paper §2.3/Eq. 2).** The paper's Eq. (2) evaluates the
conservation at the ray∩curve trade point T with LOCAL offsets α_T, β_T and states "off-the-money trades
genuinely change the global offsets α,β by design"; its arithmetic exhibit gives w′=11/21. The shipped
engine applies the SAME closed form at the RESERVE point with the pool's GLOBAL α,β — which it PRESERVES
(`tradeUpdate` returns `alpha: s.alpha, beta: s.beta`) — and the strike enters only the cash sizing
dy=N·K_tx. Same state, same trade: engine w′=0.5455 vs paper 0.5238 (measured). This is precisely
feature-inventory **item 16's OPEN-UNIMPLEMENTED anchoring gap** (operator-ruled spec, entry-8 2026-06-12:
"apply conservation at the trade's own point… what actually flowed would also be as per that trade
point"), whose mandated disposition is **"transformation-faithful, anchoring-OPEN — never 'warp faithful'
unqualified."** Neither the story table (row 2 pairs the trade-point clause with "🔒 unchanged (engine)")
nor the paper (whose §4.2 cross-reference "x,y,w move exactly as in Section 2" makes Eq. 2 engine-adjacent,
and whose L1 superscript covers the formula's algebra, not engine equality) carries that disposition. The
paper may legitimately present the RULED SPEC — but then it must say the engine gap out loud, as it does
for every other engine claim (which are carefully "measured"). Manager adjudication required; if the intent
is spec-level, one disclosure sentence in §2.3/§2.4 + a row-2 status correction closes it.

**FLAG-B (CONTRADICTS — the mark, table row 4).** Row 4's geometry text ("lesser of slope & reciprocal,
0→1") is the retired v24 saturating mark; the live mark is the smooth-pasted American value (ATM ≈ 0.148
at g=2 — the exact entry-331 grievance example). The in-flight §3.2 paper fix MUST land in row 4 too, in
the operator's own corrected language (entry-331: "the price at the money used to read 1; under the
American lift it reads the waiting value"). Note row 4 currently quotes the operator's entry-311 phrasing —
the correction is theirs to word; flag, don't silently rewrite.

**FLAG-C (STALE/overstates — funding transfer).** Table row 9 "OTM like-ray funding built & correct" and
paper §3 "the crowded side pays the contrarian side" describe a TRANSFER; the code implements a RATE and a
LEDGER only — no cash ever moves (pool and club byte-identical across `fundingTick`, measured), and the
close payout excludes accrued funding. The `fundingTick` log line "net trader → pool = …" overstates its
own code. Known internally as the open "funding cash-routing"; the story artifacts don't say it.

**FLAG-D (comment-vs-code nit).** `initialState` comment (L2330–2335): "a rebase moves the oracle and NOT
the perp mark" — but `setOracle` (L2435) sets `state.perpMark = newOracle`, clobbering an independently
set perp mark (measured). One of the two is wrong; the CTO ports from these comments.

**FLAG-E (precision — γ).** Paper defines γ>1 static; engine γ = w/(1−w) is LIVE (=1 at the symmetric
deployment, moves with every trade), so g_loc, the seam, and the funding exponent breathe with the lean;
only m is static. The paper's worked "γ=2, m=1" column is realized on the shipped default pool as
(γ_live=1, m=2) via the fixed-g equivalence. Not wrong at spec altitude, but no artifact says γ is the
live lean — one sentence prevents a referee catch and keeps the "static knob" claim honest (m static;
steepness not entirely).

---

## 3. Proposed story-table additions (drafts, table's own style — for the manager to fold sequentially)

For the MISSING items (#1, #2, #3, #4, #7, #8, #14). Row numbers for the manager to assign; statuses honest.

| Station (proposed) | The geometry (operator language) | Status |
|---|---|---|
| **The buy quantity (what your sale buys)** | One price tag, two legs: the sold leg's worth is read off the curve, and the bought leg's size is whatever notional that same worth buys at ITS ray (N_buy = V_sell ÷ per-unit worth). Cash-conserving by construction — the AMM does accounting + the bend's toll, it never holds your premium. | ✅ built & correct (entry 333); table-new |
| **The pool swap (the financing leg)** | A leg's pool transaction is premium-free: cash = notional × strike, at the frozen tx-ray `θ_tx = mode·(chosen/mode)^m` — the dial sends the financing leg further out while the OPTION settles at the ray you picked (one leg, two strikes). Close reverses the same frozen dollars, so the pool's reserves round-trip exactly. Both legs of a band push the pool the SAME way — they compound, not cancel. | ✅ built & correct; table-new |
| **The depth guard** | A cash-out swap may take at most 90% of the pool's cash depth; past that the trade is honestly rejected with the numbers — never silently shrunk. | ✅ built; table-new |
| **The club & the amplifier** | Bands are backed by a side's perp CLUB (pooled margins). At close the trader gets L₀ × the value move × the carved slice's worth; L₀ is the club's leverage frozen at open; the club is the counterparty of the rest, and a drained club pays a winner nothing (the floor). | ✅ built; table-new (extends row 10) |
| **The open fee** | 0.01% of notional, paid from club equity into a fee bucket — never into the pool. | ✅ built; table-new |
| **Funding is a ledger (today)** | The rent is METERED per strike on the band's record; no cash moves yet — pool and club untouched, and closing pays the value move only. "Crowded pays contrarian" is the designed transfer, not yet the built one. | ⚠ metering built; transfer OPEN (amends row 9) |
| **LP resize** | Adding/removing liquidity re-SIZES the whole curve evenly (everything ×(1+λ)); no re-lean, no price move — an LP action is not a trade. | ✅ built; table-new |

Row corrections (not additions): row 2 → carry the inventory-16 disposition ("transformation-faithful,
anchoring-OPEN"; engine applies conservation at the reserve point, sized at the strike); row 4 → the
entry-331 corrected mark language; row 9 → the FLAG-C qualifier.

---

## 4. Scope honesty
Read-only audit; no engine/paper/table edits; no git; no Aristotle. The one probe was a vm sandbox on
extracted script copies in the session scratchpad. FLAG-A's adjudication (spec-level vs engine-level
presentation of Eq. 2) is an operator/manager call — the finding here is only that the artifacts and the
code currently tell different stories and the mandated disposition label is absent.

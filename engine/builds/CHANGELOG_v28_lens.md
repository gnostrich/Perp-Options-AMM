# CHANGELOG — v28 polar-lens line (off the v24 base)

_Feature-level, plain English. Build line: plain Balancer pool (v24) + a polar lens in the query/write
layer. Behavioral detail + per-build verdicts live in `DIFF_LEDGER.md` (tester-owned); the math spec is
`specs/SPEC_v24_lens_BUILD_2026-06-11.md`. This file = the human "what changed and why" record._

## Base
- **From:** `temporal_mvp_v24_rebase_fixed_2.html` (plain weighted-Balancer pool, w=α/x trade mechanic).
- **Size of the edit:** ~285 changed/added lines over ~4,300 (≈6%), 47 hunks. The 2 image blobs and all 3
  script blocks preserved. **The AMM core is byte-identical:** `tradeUpdate`, `arbitrageToOracle`, `rebase`
  unchanged (gate-verified, output delta 0). The lens never touches how the pool swaps.

## The idea in one line
The Balancer curve is unchanged; a **polar lens** sits between you and the curve. Everything **read from**
it (pricing, option-value chart, settlement, funding, portfolio value) and **written to** it (trades) goes
**through the lens** — which implements vol / steepness / kurtosis on the option-value view. The lens is a
multiplier on the curve's steepness, running 0 at the 45°-tangent point (the mode) up to ×1 (full natural
steepness) in the wings; one static knob τ sets its width.

## What changed, feature by feature

| # | Feature | Status | Source |
|---|---------|--------|--------|
| F1 | **Polar lens helpers** — `gLoc`/`markLensed`, lensed local exponent `g(K)=γ·d/√(τ²+d²)`, d = log-divergence from the live 45°-tangent point (sNorm coordinate) | DONE (S1) | entry 84/94 |
| F2 | **Option-value chart (chart 2) drawn through the lens** — flat top at the money, frozen power-law wings | DONE (S1) | entry 84 |
| F3 | **τ kurtosis/vol knob** — single static number stepper (no slider), redraws chart 2 live | DONE (S1; redraw FLAG-1 fixed) | entry 59/84 |
| F4 | **Funding through the lens** — v24's hardcoded ±2 → ±`g_loc(K)`; →0 at the money, →γ in the wings | DONE (S1) | entry 84/93#5 |
| F5 | **Settlement smooth-paste with strike-local exponent** — `S*=K·g/(g+1)`, value+slope continuous (the v24 ATM-jump fix, ported) | DONE (S1) | entry 85/93#6 |
| F6 | **Settle / record / value at lensed prices** — trade price, settlement payout, portfolio value, buy-leg sizing all use the lensed mark via one shared helper (no second basis) | DONE (S2) | **entry 96** |
| F7 | **Lens correctness gate** — `lens_selfcheck.js`, 23 checks (centred-on-tangent-point, symmetric, frozen-wings, cap-free, settle==lensed, cross-layer single-basis, pool-unchanged regression) | DONE | — |

## Verified properties (manager + skeptic + live tester)
- Lens centres exactly on the 45°-tangent point of the pool curve (y/x=(1−w)/w), for any steepness.
- No far-OTM blow-up / no strike cap: the reshape is bounded by γ for any lens intensity (multiplicative, not the old hyperbolic 1/w′). A dust trade moves the curve ~0.0001% at every strike incl. 4× (old curve: 39–105%).
- Round-trip is pool-favourable (trader loses ~2× slippage); no arbitrage; lens-neutral vs v24.
- Settle-at-lensed is solvent (lensed mark ∈ [0,1]) and no-arb under the one-helper rule.

## OPEN / pending (cleanup batch + warp assessment) — NOT yet in the promoted line
| Item | Type |
|---|---|
| ×oracle cash-readout inflation (inherited v24) | bug-fix (operator entry 96) |
| Anchor curve drawn off-scale | bug-fix (entry 96) |
| Stale-on-reject band preview | bug-fix |
| Payoff N_buy `state`→`state.pool` | bug-fix |
| lp-y-delta baseline; LIQ-PRICE | bug-fix |
| Close-screen number that looks trader-favourable (display only) | display-semantics |
| Payoff/P&L chart + strike marker still drawn on the unbent curve | display-on-lens (cosmetic) |
| Payoff x-range −90…+200% | feature IN (entry 98) |
| Naked-leg uncapped intrinsic deep-ITM | feature IN (entry 98) |
| Visible-warp stage assessment | scope |

## Build sequence (files retained for diff)
- `temporal_mvp_v28_lens_S1.html` — read lens (md5 `1ed8fe2d`).
- `temporal_mvp_v28_lens_S2.html` — + write/settle through lens (md5 `b53ace99`). `temporal_mvp_v28_lens_FINAL.html` (+cleanup C1–C9, md5 `989752294`) — **PROMOTED TO HEAD 2026-06-12 as `HEAD_temporal_mvp_v28_lens.html`** (operator entries 84/94/96/106; tester FINAL 27/27; v27 demoted, retained). **+ 1-line live-slippage-refresh wire 2026-06-12 (entry 111): the τ stepper now re-runs the band preview so slippage updates live when kurtosis changes — md5 989752294→`7e1ae39b`, pool byte-identical, gate 23/0.**


## 2026-07-02 — TRADE-POINT CONSERVATION (operator entry 339, go 377) — md5 `7015c22c` → `e148c9b7`
Spec (controlling): `specs/SPEC_tradepoint_conservation_2026-07-02.md`. Skeptic scope-gate:
`notes/skeptic/VERDICT_R6_overnight_scope_gate_2026-07-02.md`. Revert twin:
`temporal_mvp_v28_lens_reservepoint.html` (byte-copy of pre-build HEAD, md5 `7015c22c`).
- **Live trade path = the paper's Trade Formula at the trade point.** New `tradeUpdateAt(s, dy, ρ)`
  (ρ = θ_tx/mode, the tx-map's own mode read): conservation law applied at T = ray∩curve with the
  LOCAL pair α_T = x_T·w, β_T = y_T·(1−w); flows drawn from actual reserves; w′ = α_T/(x_T+Δx);
  global α,β re-derived — **they now MOVE on off-ATM trades, by design** (entries 14/16/339;
  inventory #16 anchoring fix, label flip PROVISIONAL pending operator ratification of the 5 spec
  FLAG pins). Exhibit engine-true: (10,10,½), ρ=4, dy=+1 ⇒ w′=11/21, Δx=−5/22, x′=215/22 (exact).
  ρ=1 reduces to the spot law (2.3e-16); `tradeUpdate`/`arbitrageToOracle`/`rebase` BYTE-IDENTICAL
  to v24 (spot trades and arb unchanged).
- **Frozen-ARC close.** New `revertArc`: each leg stores `arc = {dxA, dyA, dwA, oOpen}` at open;
  close applies the exact inverse (x−dxA·rr, y−dyA, w−dwA; rr = oNow/oOpen) ⇒ pool round-trips
  machine-exact, open→rebase→close == rebase(s₀,r) exact, intervening trades' moves kept. Legacy
  pre-arc bands fall back to today's **K_tx-first** close path (K_inner only for pre-R-218 bands).
- **Depth guard at the trade point:** cash-out capacity = w·y·ρ^w (put-side rays thinner,
  call-side deeper); reject message prints the tx-ray depth.
- **Preview animation per-leg** (draw layer only): framePool replays the frozen per-leg {dy, ρ}
  through `tradeUpdateAt` sequentially; s=1 lands exactly on the preview pool; degrades to a
  static draw when leg data is missing (never animates a wrong path).
- **Gates:** `lens_selfcheck.js` 16 → **24 PASS [HARD]** — CM8→**CM8-v2** (spot trio byte-id;
  11/21 exhibit HARD; ρ=1 grid; local-pair conservation at T; executeLeg routing) and
  CM6→**CM6-v2** (band arc round trip incl. w; single-leg ≤1e-12; rebase-interleaved;
  live-re-registration-leaks negative control; no-free-money Σ own dx/dy == 0 incl. an intervening
  spot trade). All new checks negative-controlled: the pre-build HEAD fails exactly the 8 new-law
  checks; 7 targeted engine mutants each red only the intended checks. `a16_atm_gate` 5 PASS.
  monolith lines (2)/(7) re-scoped **SPOT law only** (report-only).
- Tester live acceptance per spec §3.2 PENDING; DIFF_LEDGER entry keyed to inventory #16 owed.

## 2026-07-02 — CAPTION/COMMENT slice (same trade-point campaign, second slice) — md5 `e148c9b7` → `0e0a0062`
Strings/comments ONLY, zero behavior (7 surgical regions; engine numeric paths untouched; gates
re-run green lens 24 + a16 5). (1) **-TP339-CAPTION** (tester flag): Invariant Watch caption +
Pool State subtitle rewritten to the trade-point law — trades conserve the LOCAL pair (α_T, β_T)
at the trade point, global α, β MOVE on off-ATM trades BY DESIGN (entry 339); machine-epsilon
scoped to the ρ=1 paths (spot/arb/rebase) and open→close arc round-trips. (2) **R6 item 3** stale
comments: entry-289 vol direction corrected at the lens header and the m-knob state comment
(MORE volatile asset ⇒ LOWER m, fatter wings); closeBand barrier-era "mark() saturates at 1 …
IS the effective-strike substitution" paragraph rewritten to the lensed smooth-paste truth — the
v28 correction paragraph beneath it preserved (skeptic condition; CTO port source). (3) **R6
item 4 / 325-F** (operator entry 336): chart-2 unit toggle button "% of escrow unit" →
"fraction of escrow unit" + caption "% view"→"Fraction view" — the axis draws fractions
(0.25/0.50/…), not percent; DOM ids (`pricing-unit-pct`) and all values/axes untouched.

## 2026-07-03 — FUNDING-P/L column (operator entry 425) — md5 `0e0a0062` → `4bc939ec`
Display/read layer ONLY (6 surgical regions; engine + state `<script>` blocks byte-identical to
`0e0a0062`, node-compared; gates lens 24 + a16 5 green; blobs canonical). Authority: entry 425
("funding is column adds to p/l in portfolio for position line wise"); skeptic R6 scope-gate #2
CLEARED with conditions, all honored. (1) **No duplicate column** — the bands-table funding cells
pre-existed at band (Σ legs), component, and Total rows; verified, kept. (2) **Sign pin
(trader-pays ledger):** `fundingTick` stores `trader_pays = side_sign·f` (positive = the line PAID
the pool), so the displayed column is now the SIGNED P/L effect = **−Σ stored accruals**
(+ = line received, − = line paid) at all three row levels; stored ledger and `fundingTick`
untouched. (3) **Line P/L funding-inclusive:** Total-row dollar cell = L₀·raw_net·equityAtClose
**+ fundingP/L × oracle** — the funding ledger's own $ conversion (the fundingTick log law), NOT
the stage-2→3 equity multiply (funding accrues on absolute N, not per unit of carved equity).
Sign self-check (node vm, both-direction bands, 24×1h ticks at oracle 88k): payer band stored
+0.08355 ⇒ column −0.08355 ⇒ displayed P/L −573.37 → −7925.82 **FALLS**; receiver band stored
−0.14061 ⇒ column +0.14061 ⇒ +1347.43 → +13720.97 rises. (4) **Disclosure (gate condition):**
column header title, table units-note, and Total-cell tooltip all state: displayed P/L INCLUDES
accrued funding; cash at close settles EX-funding until the funding transfer layer (parked
part-2) ships — `closeBand` verified funding-term-free. Header label "Funding" → "Funding P/L".

## 2026-07-07 — -FPNL-NEGZERO display fix (tester finding) — md5 `4bc939ec` → `51342574`
Display layer ONLY (2-line diff; engine + state `<script>` blocks byte-identical to `4bc939ec`;
gates lens 24 + a16 5 green; blobs canonical). Tester finding -FPNL-NEGZERO (DIFF_LEDGER
`4bc939ec` reconciliation list): with zero accrued funding the negated funding cells rendered
`-0.000000` — JS negative zero (`-0`) through `fmtNum`/`toLocaleString` — on freshly opened
bands. Fix = local negative-zero guard at the display negation sites, BEFORE fmtNum:
`bandFundingPnl = bandFundingStored === 0 ? 0 : -bandFundingStored` (feeds the band-row AND
Total-row cells) and the component cell `fmtNum(c.funding === 0 ? 0 : -c.funding, 6)`. `fmtNum`
itself untouched (global change rejected — other columns rely on its behavior); NaN stays loud
(`=== 0` is false for NaN). Self-check `engine/evidence/check_fpnl_negzero_2026-07-07.js`
(extracts the live expressions + fmtNum from the build): pre-tick all funding cells `0.000000`
(old HEAD renders `-0.000000` — negative control); post-tick payer `-0.083551` / receiver
`0.140608` — the entry-425 sign pin unbroken. Operator context: last agreed fix before the CTO
handover (entry 427).

## 2026-07-07 — UPDATE 1: unified sell-back close + funding-on-extrinsic — md5 `51342574` → `bb2f8230`
Spec `specs/SPEC_update1_clean_close_2026-07-07.md` (operator entries 450/452 "yes go on"; skeptic
HALT-LIFTED CLEAR-TO-BUILD). ONLY the engine `<script>` block changed (net −30 lines); the ui +
3rd script blocks are BYTE-IDENTICAL to `51342574` (node-compared) — in particular the equity/
overlay credit wrapper (`club.equity += retEquity`, `b.overlay = {trader_payout, club_delta, …}`)
is untouched, which is what makes the close swap non-extractable by construction.

**(1) Close = one unified sell-back path (was a two-case branch).** `closeBand`'s
settle-to-cash-vs-both-live branch is retired. VALUE: both legs are sold back at today's lensed
mark, read at ONE pre-close pool snapshot `s0` via `legPrice` (no moneyness branch) ⇒ `raw_net` is
a continuous function of moneyness. POOL: every leg does a LIVE reverse trade via `tradeUpdateAt(s,
dyRev, rho_close)`, `rho_close = (K_tx/oNow)/getSNorm(s)`, best-effort (a leg that can't fit the
pool is skipped; the option value/payout still settles). `dyRev = −(open dy)` at the frozen dollar
tx-strike ⇒ **Δy round-trips EXACT**; **Δx** is a documented **pool-internal reprice DRAIN ∝dy²**
credited to NO wallet (~53 USD at N=0.05 on the exhibit pool). The drain TRACKS the oracle move
(IL-like) — one-signed ONLY in the fixed-oracle/no-move regime; it flips sign once the oracle
moves. `revertArc` + the openBand arc storage are KEPT but DORMANT (UPDATE-2 charge-back). The
settlement denomination (raw_net = Y−X, L0·raw_net·carvedEquityAtClosure) is UNCHANGED.

**(2) Funding weight full-mark → extrinsic.** `fundingPerStrike` weight is now
`ext = markLensed − max(intrinsic parity, 0)` (put `max(0,1−mode/strike)`, call
`max(0,1−strike/mode)`) instead of the full `markLensed`. Result: funding is ZERO past the
smooth-paste seam S* (zero deep ITM), a single hump peaking at ATM (0.1481 for put θ=1, g=2),
fading to 0 both ways. The `±g·(S−1)/S` pool-imbalance SIGN and the `S<=0` guard are byte-unchanged
— only the weight changed.

**Gates: lens_selfcheck 24 → 31 PASS [HARD].** CM6-v2 (frozen-arc round-trip + no-free-money)
**RETIRED** — it encoded the removed close; the unified close is a pool-reprice close with no exact
round trip, and no-free-money returns in UPDATE 2 with the counterfactual floor. Replaced by
**CM6-v3** (Δy=0 exact via the shipped closeBand; fixed-oracle one-signed self-drain across OTM+ITM
strikes; Δx∝dy²; transient Δx tracks the oracle / IL-like — NOT one-signed once price moves; credit
wrapper byte-unchanged; drain-present + `routesLive` negative controls), **CM12** (payout
continuity — the retired two-case ~45%/87%-class seam dissolves; in-gate reconstruction of the old
two-case raw matches the retained twin's jump 5.672e-2), and the **FE** funding-extrinsic checks
(zero past S*, hump at ATM, sign/pool-term unchanged, old full-mark negative control). All
negative-controlled: the retained OLD build scores **24 PASS / 7 FAIL** on exactly these
discriminators. a16 5 PASS unchanged; monolith 8/8 report-green; run_all RC=0 on work copy AND
promoted HEAD. Revert twin `temporal_mvp_v28_lens_twocaseclose.html` = `51342574`.
⚠ The file-safety hook still false-positives on `"0 FAIL"` success-summary strings (pre-existing
line-104 over-broad grep, out of intern scope) — the real `^FAIL` verdict count is 0.
Manager verification + tester live pass PENDING.

## 2026-07-08 — FUNDING: same-slope pool-vs-anchor DEVIATION (placeholder, deviation-only) — md5 `bb2f8230` → `abd35f4b`
Spec `notes/research/SPEC_funding_sameslope_2026-07-07.md` (operator entries 460/462, RULED 460;
R6 scope-gate CLEARED). ONLY `fundingPerStrike` (engine `<script>`) + 2 UI disclosure strings
changed; **closeBand UNTOUCHED**; pool fns byte-identical to v24 (gate-verified).

**The fix (structural, not a weight swap).** The old funding magnitude `ext·(S−1)/S` was a
**regression**: `ext = markLensed − max(intrinsic,0)` is a moneyness/value weight that PEAKS at ATM,
and `(S−1)/S` is the pool-vs-**oracle** gap (one global scalar, nonzero on a symmetric pool whenever
the oracle drifts). Neither is the pool-vs-anchor lean — the shipped formula **funded a symmetric
w=½ pool** (measured 2.64/7.33/14.4 on a w=½/S≠1 fixture). This was the recurring ~20–30× regression.
Replaced by the **REAL same-slope pool-vs-anchor ray-angle-ratio deviation**:
`dev = |c·ln(θ/mode)|`, `c = (g_a−g)/(g_a+1)`, `g = gLoc = m·γ` (pool, γ LIVE), `g_a = m` (anchor
w=½, γ=1). OTM-gated (`intr>0 ⇒ 0`). Signatures: **0 at ATM** (ρ=1), **0 ∀OTM on a w=½ pool** (c=0 —
the pool-lean signature), positive OTM lobe growing with `|w−½|` and `|lnρ|`. The `±g` wing sign +
m-scale is KEPT. Measured OTM lobe (w=0.7, m=2, κ=N=dt=1, put): −8.91 / −6.04 / −3.16 / −1.48 / −0.29
→ 0 at ATM; 0 all ITM both wings.

**PLACEHOLDER — deviation only.** This is the same-slope LEAN, NOT the final funding number. The
funding FORMULA (cap / HL / interest) is DEFERRED to UPDATE-2 (operator entry 462): **no cap, no new
knob** added. Removing `(S−1)` is framed as "regression removed from the placeholder" — **NOT**
"final funding / oracle-independence decided" (operator-tier OPEN, F1). UI: the Funding column header
+ units-note are re-labelled **"Funding (lean; TBD)"** with live-rendered placeholder disclosure
("same-slope lean; formula TBD, update-2").

**Gates: lens_selfcheck 31 → 35 PASS [HARD].** RETIRED **FE.2** (extrinsic hump-at-ATM) and **FE.3**
(source ±g·(S−1)/S weight=ext) — they encoded the regression. KEPT FE.1 (funding=0 ITM) + FE.4 (neg
ctrl vs old full-mark). ADDED **FS.1–FS.6** (same-slope), negative-controlled in-gate: **FS.2/b is
the anti-regression KILLER** (funding=0 on a symmetric w=½ pool at every OTM strike, S≠1). The old
`ext` weight FAILS FS.1 (ext(ATM)=0.148>0); the moneyness proxy `|ln(θ/mode)|` FAILS FS.2b
(nonzero on w=½ OTM); FS.6 asserts both regressions rejected on one fixture set. Teeth confirmed:
the retained OLD build (`temporal_mvp_v28_lens_twocaseclose.html`) scores **23 PASS / 12 FAIL** —
all 6 FS checks red. a16 5 PASS; monolith 8/8 report-green; run_all RC=0 on work copy AND promoted HEAD.
⚠ The file-safety hook still false-positives on `"0 FAIL"` success-summary strings (pre-existing
line-104 over-broad grep, out of intern scope) — real `^FAIL` verdict count is 0, run_all RC=0.
Manager verification + tester live pass PENDING.

## 2026-07-08 — REBASE anti-regression LOCK (gate-only; operator entry 466) — md5 `abd35f4b` UNCHANGED
**Engine HTML byte-identical** (md5 `abd35f4b…`, blobs `ab663f5c`/`c505b08a` canonical). This edit adds
**hard behavioral checks to `verify/lens_selfcheck.js` ONLY** — the live `Engine.rebase` is verified CLEAN
(research-lead `notes/research/VERIFY_rebase_rigorous_2026-07-07.md`, 40+ historical rebase regressions);
this LOCKS it so it cannot silently regress. Closes the gap that `faith_rebase.js` SKIPs on v28 (GH-only),
leaving only a fragile source byte-identity check as live rebase coverage.

**Gates: lens_selfcheck 35 → 41 PASS [HARD].** ADDED **RB.1–RB.6**, each negative-controlled in-gate
against 5 pure transform mutants (M1 y-scaled, M2 drop-α, M3 β-scaled, M4 x-unscaled, M5 additive) +
a moneyness-funding mutant — the engine is never mutated:
- **RB.1** pool-intrinsic gauge degrees (getW/getSNorm/poolMark invariant, getMP_raw·r & getDepth/r^w
  invariant). NC: M1/M2/M4/M5 fire; **M3 β-class SLIPS** (intrinsic reads never touch β — documented).
- **RB.2** bookkeeping **bit-exact** (`sr.x===x·r ∧ sr.y===y ∧ sr.α===α·r ∧ sr.β===β`) — the **β-class
  KILLER** (mandatory; M3 β-scaled slips every intrinsic read but fails bit-exact). NC: M1/M2/M3 all fire.
- **RB.3** carried-strike invariance (dollar K→r·K under the reframe ⇒ markLensed invariant, θ→θ/r killer).
  NC: M4/M5 fire.
- **RB.4** group `rebase(rebase(s,r1),r2)=rebase(s,r1·r2)`, identity `rebase(s,1)===s`, inverse
  `rebase(rebase(s,r),1/r)=s`. NC: M5 additive fires.
- **RB.5** trade/rebase commute — SPOT `tradeUpdate` AND the live `tradeUpdateAt(·,dy,ρ)` (fixed ρ). Second
  β-class net (β enters the hyperbola). NC: M3 fires.
- **RB.6** funding rebase-silence (frozen stored ray, the way `fundingTick` calls it) ∧ **=0 on a symmetric
  w=½ pool at every OTM strike (the KILLER — the recurring ~20–30× funded-symmetric-pool regression) ∧ =0 at
  ATM**. NC: a moneyness weight `|ln ρ|` (no pool-lean `c=(g_a−g)/(g_a+1)` factor) is nonzero on the w=½ pool
  OTM → fires the killer; M4 breaks rebase-silence. The correct dev=|c·lnρ| is 0 at w=½ (c=0).

Each RB.k PASSES iff the REAL rebase is clean AND the note-mapped mutant fires — a green line simultaneously
proves real-clean and that the negative control has teeth. Grid w∈{0.5,0.6,0.42}, r∈{0.5,0.8,1.1,2,5},
m∈{1,2,3}, o∈{80k,120k}, TOL=1e-12 (measured worst residual 1.7e-15). a16 5 PASS; run_all RC=0; HTML md5
UNCHANGED. Manager verification + tester (no UI change; gate-only) PENDING.

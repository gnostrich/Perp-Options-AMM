# MEMORY — intern
_Last updated: 2026-06-12 (v28 lens HEAD entry-111 τ band-preview wire — one-line, IN PLACE).
Rewrite changed bits at task end._

## Done — v28 lens HEAD: τ stepper band-preview re-run (entry 111 "yes"; IN PLACE, no git)
Edited **`engine/builds/HEAD_temporal_mvp_v28_lens.html`** IN PLACE (promoted-HEAD display-refresh
update; md5 changed `989752294bfeff49d6c92e0ab7ca6ccd` → **`7e1ae39baa00fda087033174cfc652b8`**).
Splice `/tmp/splice_tau_band_preview.py` (count==1, blobs never through; copy `/tmp/work_tau_band.html`
then promote). ONE line, L2727 — the τ stepper handler:
- BEFORE: `if (v > 0 && isFinite(v)) { Store.setTau(v); if (Viz) Viz.drawAll(Store.state); }`
- AFTER:  `if (v > 0 && isFinite(v)) { Store.setTau(v); if (typeof previewBand === 'function') previewBand(); if (typeof render === 'function') render(); if (Viz) Viz.drawAll(Store.state); }`
Matches the strike-input idiom (L3170–3171 `previewBand(); render();`). Scope confirmed: τ handler
(L2727), `previewBand` (L2979 fn decl), `render` (L4079 fn decl), strike-input handler (L3170) are
ALL in the same `<script id="ui">` block (L2650+) — `previewBand`/`render` lexically reachable, no
restructuring needed. **Nothing else changed** — no math/pool/lens/control. Display-refresh wire only.
Now turning τ recomputes the band preview (live slippage readout) before the chart redraw.
- **Safety/gates:** surgical diff = exactly 1 line; blobs `ab663f5c`@74 / `c505b08a`@1060 canonical;
  3 scripts parse (612/446/1754 lines, longest 509); pool `tradeUpdate`/`arbitrageToOracle`/`rebase`
  BYTE-IDENTICAL to v24 (387/314/96 b, gate 6b); `node verify/lens_selfcheck.js …HEAD_…v28_lens.html`
  **23 PASS 0 FAIL**; `sh verify/run_all.sh` GREEN exit 0; file-safety hook no-block.
- **Open for tester:** live — turning τ now updates the slippage readout (band preview re-runs);
  chart 1 (plain-v24 pool curve) still inert to τ; chart 2 still reshapes.

---
_(history below)_

## Done — v28 lens CLEANUP BATCH C1–C9 (NEW file, handed to manager 2026-06-12)
Build **`engine/builds/temporal_mvp_v28_lens_FINAL.html`** (NEW, from S2 `b53ace99`; HEAD v27
UNTOUCHED, no promote, no git). md5 **`989752294bfeff49d6c92e0ab7ca6ccd`**. Operator entry 106
"please do"; skeptic R6-CLEARED verdict #33 (C6 re-scoped LABEL-ONLY). ALL 9 = display/render/readout
layer — none touched the pool, lens math, or settle-at-lensed-value pipe. Splices on the FINAL copy
(each count==1, blobs never through): `/tmp/splice_c1.py`, `_c2.py`, `_c3.py`, `_c4c7.py`, `_c8c9.py`,
`_c8ticks.py`, `_c5.py`, `_c6.py`.
- **C1** (~L3080 setVal): dropped `* s.oracle` on pv-dy-sold/pv-dy-bought/pv-net-cash — `leg.dy`/
  `netPoolY` already USD (executeLeg multiplies V·oracle inside; headless: leg.dy=42112.58==V·oracle,
  old showed ~$3.4B). NOTE pv-bought-V `sim.V_buy * s.oracle` LEFT — V_buy is asset-units, that ×oracle
  is correct.
- **C2** (~L3285): anchor w=½ trace `curveTraceExplicit(0.5, snap.depth, …)` → `…, Math.sqrt(snap.x*
  snap.y), …`. snap.depth=x^w·y^(1−w) is LIVE-w units (off ~9.6× at w=0.7); k=√(x·y) makes the w=½
  constant-product pass EXACTLY through the live reserves point (verified xc=10.0, yc=800000).
- **C3** (~L2991): new `clearBandPreviewOut()` helper (15 pv-* ids + bought-display + 2 sublines +
  setModeTags(null,null)+setSummary(null×4)) defined after local setVal; called at TOP of ALL 6
  reject/early-returns (was: only the first ksOK/N reject cleared; clubSide/club-notional/club-equity/
  !sim.ok/fee-equity left stale). Deposit-row input echo deliberately NOT cleared (render() drives it
  from live N_sell — it's input, not preview output).
- **C4** (~L3882, D14): `Engine.legPrice(state,…)` → `Engine.legPrice(state.pool,…)`. The wrapper has
  no x/alpha → getSNorm NaN → catch → silent N_buy=N_sell. With the pool it derives (headless ratio
  0.9698≠1).
- **C7** (~L3884/3888, twin of W1): bought-leg denom raw `Engine.mark` → `Engine.legPrice(state.pool,
  bought_wing, thBuyIn, thBuyOut, 1, state.tau).V` — same lensed single-pricing entry execution books
  N_buy with. Display-only; preview now shares ONE basis with the booked N_buy. (Preview prices both
  legs at state.pool; execution prices the bought leg at the post-sold pool — preview is not byte-equal
  to the booked N_buy by construction, but the BASIS now matches, which is C7's mandate.)
- **C5** (~L2259 + L4145): added `_initial_y: 800000.0` to initialState; `lp-y-delta` hardcode
  `p.y − 800000` → `p.y − s._initial_y` (legacy state w/o field → NaN, loud). LIQ-PRICE
  (`perp-liq-display` ~L2853 `S*(1∓1/L)`) already the textbook isolated-margin formula → SANE as-is,
  NO change needed (the v27-line LIQ defect was v27-specific).
- **C6** (LABEL-ONLY, skeptic #33 binding): close-log (~L2591) `trader=$…`→`band P&L vs entry
  (trader)=$…`, `Δclub=$…`→`Δclub equity=$…`; pf-dollar cell title (~L4358) "settlement value = …"→
  "band P&L at close (Δ vs entry, not walk-away cash) = …". NO new entry-cost figure; computed
  trader_payout/club_delta/raw_net UNCHANGED. (No separate visual close overlay element exists —
  trader_payout/club_delta render ONLY in the log line + the dollar cell; both relabeled.)
- **C8** (~L3859): xMin/xMax −0.5/0.5 → −0.9/2.0 (entry 98 #8). x-tick loop `-50..50 step10`→
  `-50..200 step50` so ticks span the new frame (−90 edge unticked, v26c precedent).
- **C9** (~L3909 legFraction): naked (barrier, `isBarrier(thOuter)`) leg now returns UNCAPPED
  `Engine.mark(...)`; spread legs (has outer) STILL `Math.min(1,·)` each barrier. Only the
  naked/single path changed.
- **EXCLUDED (R1, did NOT do):** payoff chart / strike marker onto the lens — operator never approved.
- **L4 hard invariant PRESERVED:** `tradeUpdate`/`arbitrageToOracle`/`rebase` BYTE-IDENTICAL to v24
  (extracted+compared char-for-char: 387/314/96 bytes, identical). No edit drifted them.
- **Safety:** blobs `ab663f5c`@74/`c505b08a`@1060 canonical; 3 scripts parse (613/447/1755);
  longest non-blob line 553; file-safety hook exit 0; surgical diff vs S2 = exactly the C1–C9 hunks.
- **GATES:** `node verify/lens_selfcheck.js …FINAL.html` **23 PASS 0 FAIL**; `sh verify/run_all.sh
  …FINAL.html` GREEN exit 0.
- **Open for tester (smoke per C-item + warp-visibility):** C1 net-cash ~order-$10k not billions;
  C2 anchor (w=½) trace passes through reserves point; C3 swap-then-reject shows warn + all preview
  '—' on EVERY reject path (no-club / no-notional / wing-range / fee); C4/C7 payoff N_buy derives
  (≠N_sell) and matches booked basis; C5 lp y-delta $0 at load, LIQ-PRICE sane (~$70k/$90k @8×);
  C6 close log + dollar-cell tooltip read as band P&L delta NOT pocket cash; C8 frame −90%..+200% with
  ticks; C9 naked leg climbs uncapped past the capped spread leg; AND chart-2 visibly reshapes on a
  trade (warp). **Open for manager:** C7 preview prices at state.pool (basis-match, not byte-equal to
  the post-sold-pool booked N_buy) — flagged as the in-scope display reading.

---
_(history below)_

## Done — v28 lens STAGE-2 WRITE/SETTLE THROUGH LENS (NEW file, handed to manager 2026-06-12)
Build **`engine/builds/temporal_mvp_v28_lens_S2.html`** (NEW, from S1 `1ed8fe2d…`; HEAD v27
UNTOUCHED, not promoted, no git). md5 **`b53ace9996930249cad85fc1e37e6c61`**. Spec
`specs/SPEC_v24_lens_BUILD_2026-06-11.md` §11; skeptic verdict #30
`notes/skeptic/VERDICT_R6_WRITE_SETTLE_LENS_2026-06-12.md` (1 halt-class must-apply + gate-5 strengthen).
Splices (all on copy `/tmp/work_s2.html`, count==1, blobs never through): `/tmp/splice_s2_engine.py`,
`splice_s2_w4.py`, `splice_s2_tau.py`, `splice_s2_w3.py`, `splice_s2_uicallers.py`, `splice_s2_payoff.py`,
`splice_s2_w6.py` + 1 Edit (payoff tau). Diff vs S1 = 136 changed lines, all W-site regions, no blob
lines (74/1060), no pool-fn lines.
- **5 W-sites routed to the lens** (one-helper rule §11.2: same gLoc/markLensed, getSNorm(state)
  reciprocal coord, γ live):
  - **W1 `legPrice`** (~L1716): +`tau` param; barrier V=N·markLensed(inner,getSNorm,gLoc); spread
    **leg-by-leg** N·(markLensed(inner)−markLensed(outer)) — DROPPED the θ*=√(θ₁θ₂)/2sinh composite
    (invalid under per-leg g_loc). theta_star/delta kept display-only.
  - **W2 `executeLeg`** (~L1761): +`tau`; V now lensed via legPrice; **dy=±V·oracle form UNCHANGED**
    (pool executes plain v24).
  - **W3 `closeBand`** (~L1955): +`tau`; settled-to-cash leg (legValueUnified/markEff) AND OTM
    reversal leg (legPrice) BOTH lensed, both at getSNorm(s) — move TOGETHER (§11.4-C).
  - **W4 `markEff`/`legValueUnified`** (~L1906): sig → (state,wing,theta,tau)/(state,wing,leg,tau);
    → markLensed(wing,θ,getSNorm(state),gLoc(state,θ,tau)).
  - **W6 `pfComponents`** (~L4168): +`pool,tau` params; Engine.mark → Engine.markLensed at
    getSNorm(s.pool). **W7 `raw_net`/`dollarFigure` (~L4259): basis only, formula UNCHANGED.**
- **MUST-APPLY-A (THE hazard) honored:** the lensed markLensed VALUE is NOT coordinate-invariant
  (only the exponent g is). `closeBand`/`markEff` natively had `sNorm0=poolMark/oNow` (PRICE coord);
  `gLoc` HARDCODES the reciprocal `getSNorm`. Fix: **ALL settled-leg lens calls use `getSNorm(s)`
  (reciprocal) as the spot** — NEVER `sNorm0` price spot/ray. `sNorm0` kept for `legIsITM`/`wingMember`
  REGIME TEST ONLY. Verified: settled-leg X==N·markLensed(reciprocal) to 1e-9; a price-coord-spot call
  diverges ~0.096 (the 6× leak the gate catches). Both legs land on ONE coordinate ⇒ settled==reversal.
- **tau is on TOP-LEVEL state (`state.tau`), NOT on `state.pool`** — engine fns receive the pool.
  Threaded `tau` explicitly through executeLeg/executeBand/closeBand/legPrice (+ executeFourStrikeSpread
  alias) and the 3 UI callers (executeBand open L2471, previewBand L3017, closeBand L2553) pass
  `state.tau`/`s.tau`. drawPayoff legPrice display call (L3874) gets `state.tau` (was already
  falling back pre-S2: it passes the UI wrapper not the pool → getSNorm NaN → catch).
- **W1-consistency completion (FLAGGED, not a 6th independent site):** `executeBand`'s inline N_buy
  `denom` (raw `mark` at price-coord sNorm2) would mix bases against the now-lensed V_sell
  (N_buy off by ~2×). Routed the denom through the SAME lensed `legPrice` (W1's "single pricing
  entry" mandate). The dead `sNorm2`/`ts2`/`d2`/`m2`/`buyMode` consts remain (harmless, valid JS).
  **Surface to skeptic/manager:** executeBand denom is NOT in the spec's enumerated 5 sites but
  leaving it raw reintroduces the basis split W1 closes — judged the consistent in-scope reading.
- **L4 preserved:** pool `tradeUpdate`/`arbitrageToOracle`/`rebase` SOURCE byte-identical to v24 +
  OUTPUT delta 0 (verified); dy=±V·oracle forward sizing; no inverse-lens helper. No γ_min floor;
  g_loc(ATM)=0 finite (markLensed→1 at mode); solvency markLensed∈[7.8e-10,1.0].
- **GATE:** extended `engine/verify/lens_selfcheck.js` with §11's 8 Stage-2 checks (8.1 settled==
  lensed·size; 8.2 open==settle one-helper; 8.3 UI==engine cross-layer; 8.4 intra-band both-lensed
  +sNorm0-regime-only structural; **8.5b STRENGTHENED — steep off-eq ONE-ITM, hazard caught**;
  8.5a per-leg same-state; 8.6 solvency ceiling; 8.7 one-helper witness [relabeled per skeptic, NOT
  "the no-arb gate"]; 8.8 L4 dy-forward + no inverse-lens). Stage-2 block SKIPs-as-pass on Stage-1
  builds (markEff 3-arg detector). **23 PASS 0 FAIL** on S2; S1 stays **14 PASS** (Stage-2 SKIPs);
  v24 base SKIPs entirely; HEAD v27 unaffected.
- **WIRED into run_all.sh:** NEW lens branch (detector: `function markLensed` AND NOT `function
  wField`) BEFORE the (W) branch → `node verify/lens_selfcheck.js` [HARD GATE] → exit 0. Routes
  v28 lens builds; v27 (has wField) still → wcurve (22 PASS); GH still → full suite.
  `sh verify/run_all.sh builds/temporal_mvp_v28_lens_S2.html` GREEN exit 0.
- **Safety:** blobs `ab663f5c`@74/`c505b08a`@1060 canonical; 3 scripts parse (613/444/1748); IIFE
  intact; longest non-blob line 535; diff vs S1 = 136 lines all W-sites, no blob/pool-fn lines.
- **Open for tester (Stage-2 smoke):** band open→close round-trip (raw_net≈0 on immediate close —
  tiny residual = genuine AMM slippage, pool-favourable per skeptic CLAIM-2); portfolio value
  reflects lensed marks; ATM (g_loc=0) settles finite; steep-pool one-ITM-leg band settles at the
  reciprocal-coord value. Confirm no additive lensed-option + un-lensed-perp $ in one column
  (skeptic CLAIM-4 / §11.7 record flag). **Open for manager/skeptic:** the executeBand N_buy denom
  routing decision above.

---
_(history below)_

## Done — v28 lens Stage-1 FLAG-1 FIX (τ-redraw wiring; handed to manager 2026-06-11)
Build **`engine/builds/temporal_mvp_v28_lens_S1.html`** edited IN PLACE (splice on copy then
promote, `/tmp/splice_tau_redraw.py`, count==1, blobs never through). md5
`5e1ff278…` → **`1ed8fe2ddf69a6ef2a2e47dc90d55ba0`**. ONE-LINE fix, L2702 (τ change/input handler):
`if (window.Viz && Viz.drawAll) Viz.drawAll(Store.state)` → `if (Viz) Viz.drawAll(Store.state)`.
Root cause (tester FLAG-1): `Viz` is a `const` IIFE (~L3175) never attached to `window`, so the
`window.Viz` guard was always false → dead redraw branch → τ change yielded 0px live. Chose option
(b)-aligned: matched the EXACT idiom every other working redraw uses (`if (Viz) Viz.drawAll(...)` —
lpPreview/band/club/reset/arb/tick all use the lexical `const Viz`, the τ handler was the lone
`window.Viz` outlier). Lens math, pool, draw all UNTOUCHED. Engine `<script id="engine">` block
**BYTE-IDENTICAL** (md5 `6ad0d944…` pre==post — UI-script-only change). Diff vs prior build =
exactly 1 line. Gates: blobs `ab663f5c`@74/`c505b08a`@1060 canonical; 3 scripts parse (591/444/1744);
longest non-blob line 553; `lens_selfcheck` **14 PASS 0 FAIL**; `run_all` GREEN (exit 0, routes (W)
branch → SKIP-as-pass, documented). **Open for tester:** τ stepper now auto-redraws chart 2 (full
elbow reshape live); chart 1 (plain-v24 pool curve) still inert to τ.

## Done — v28 POLAR-LENS STAGE 1 (read layer on v24 base; handed to manager 2026-06-11)
Build: **`engine/builds/temporal_mvp_v28_lens_S1.html`** (NEW, from base
`temporal_mvp_v24_rebase_fixed_2.html`; HEAD v27 `928cde1c` UNTOUCHED, not promoted, no git).
md5 **`5e1ff278dbfea889d49b48224ba931d3`** (487837 b) — SUPERSEDED by the FLAG-1 fix above. Spec
`specs/SPEC_v24_lens_BUILD_2026-06-11.md` + skeptic R6 `notes/skeptic/VERDICT_R6_SPEC_v24_lens_2026-06-11.md`
(2 binding must-applies). Splices `/tmp/splice_engine.py` (3 reps), `/tmp/splice_ui.py` (5),
`/tmp/splice_ui2.py` (3) — all count==1, blobs never through. Diff vs base = exactly 20 hunks,
all intended regions, no blob lines (74/1060), no pool-fn lines.
- **Engine (new, exported):** `hTau`,`hpTau` (h_τ, h′_τ); `lensU(state,θ)=ln(θ/getSNorm(state))`
  (sNorm coord, MUST-APPLY-1); `gLoc(state,θ,tau)=γ·h′_τ(|u|)`, γ=w/(1−w) LIVE; `markLensed(wing,
  θ,sNorm,g)` = v26b Reading-A smooth-paste with the strike-LOCAL g (call=sNorm/θ arm sStar=
  θ·((g+1)/g)^g; put=θ/sNorm arm sStar=θ·(g/(g+1))^g; cont c·sNorm, c=1/((g+1)·sStar); intrinsic).
  **`mark` UNCHANGED** (lensed mark is a NEW fn; `mark` still drives the unchanged pool/exec/$ pipe).
- **MUST-APPLY-1 honored:** ONE coordinate (sNorm) everywhere; g_loc uses getSNorm(state) mode, NOT
  the price-coord S. Funding's S/(S−1)/S/κ/sign UNCHANGED; only ±2→±g_loc and mark→markLensed.
- **MUST-APPLY-2 honored:** NO γ_min floor. g=0 ⇒ S*=0 finite. The one NaN locus (g=0 AND
  sNorm===θ exactly → pow(1,−∞)=NaN) is dodged by **inclusive boundary** (`<=`/`>=`): the boundary
  point returns the boundary value 1/(g+1), no floor, geometry preserved. Gate (4c): NaN-free.
- **P2 funding:** `fundingPerStrike` got trailing `tau` param; caller (fundingTick ~L2585) passes
  `state.tau`. ±g_loc replaces ±2; markLensed at the sNorm mode.
- **P1 + L3 curve-2:** `drawState` (drawPricing/chart-2) rewritten to plot ψ=`markLensed(wing,θ=
  tan(φ),sNorm,gLoc)` through the lens (live γ off poolForLens, τ static). Display clamped to
  [0,1]. Call sites pass `state.pool`/`previewPool`+`state.tau`. **Chart-1 (drawCurve, pool curve)
  UNTOUCHED — plain v24.**
- **P3 settlement:** `markLensed` IS the smooth-paste primitive (exported, gated directly). Did NOT
  rewire closeBand/legValueUnified/markEff/executeBand dollar pipe — those feed the stage-2→3
  conversion (brief: unchanged; stop-and-report if it needs an exercise branch). Pool +
  execution + $ pipe BYTE-IDENTICAL to v24 (lens_selfcheck (6)/(6b)).
- **τ control:** number stepper `tau-input` (min 0.05/max 3/step 0.05/value 0.3) in Settings >
  Protocol Params (NO slider, operator). `setTau` (static, guards bad/legacy), `state.tau:0.3`
  default. Listener (change+input) → setTau → Viz.drawAll. Steepness γ stays v24 derived-w (no
  slider added, per §6).
- **L4 forward-read-only:** no inverse-lens/target-slope helper; arbitrageToOracle stays lens-free.
  Gate (7a)/(7b) structural-grep confirm.
- **Gate:** NEW `engine/verify/lens_selfcheck.js` (sandboxes engine script like wcurve_selfcheck;
  SKIPs-as-pass on builds w/o gLoc/markLensed export → base v24 + HEAD v27 stay green). On v28:
  **14 PASS 0 FAIL** (items 1/2a/2b/3/4a/4b/4c/5a/5b/5c/6/6b/7a/7b). NOT wired into run_all (Stage-1
  brief asks for the file + report; run_all routes pre-GH→wcurve which SKIPs). run_all on v28 =
  GREEN (blobs canonical, dispatch clean).
- **Safety:** blobs `ab663f5c`@74/`c505b08a`@1060 intact (svg stayed at 1060 — my HTML add was at
  ~1316, after the svg; engine adds after 1604), 3 scripts parse (589/442/1742), longest script
  line 482, IIFE intact, no sig changes beyond the intended fundingPerStrike +tau / drawState
  +poolForLens,tau / new exports.
- **Open for tester (Stage-1 smoke):** see 6-step script in handoff. **Open for manager:** Stage 2
  (warp/observable) NOT built (intentional). P1's lensed mark deliberately NOT wired into
  pfComponents/dollarFigure (would change a displayed settlement $ vs the unchanged engine
  closeBand — flagged as the stop-class dollar-pipe boundary).

## Engine
- Canonical: **`engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html`** (md5
  **`928cde1cccb0f35fdc9a23a7634414c8`** after the 2026-06-11 entry-46 lacunae splice; I
  updated the run_all.sh informational pin myself per brief — manager re-pins
  INTEGRITY/BUILD_LINEAGE/DIFF_LEDGER). Base I edited was `1eebfcd6f6ff4f4e3df5f745ac145f19`
  (manager's post-29cd56bf state, incl. the WARP (g) anchoring gate). ⚠ svg blob line is
  **1064** (not 1060) — line-layer md5s unchanged (`ab663f5c`@74, `c505b08a`@1064).
  (W) kurtosis curve build (pre-GH lineage from v24 — NO ghCalibrate/ghMu on this branch;
  gate = `verify/wcurve_selfcheck.js` **22 PASS** incl. WARP (g) documenting gate).
  GH-lineage v26c (`6cc73563…`) remains in builds/ as history. (v26a/v26b notes below
  are history of landed work.)
- ⚠ (W) UNITS gotchas (re-derived 2026-06-11): engine `executeLeg` sets `dy = V*oracle`
  (V is asset-units) and `tradeUpdate` moves pool y by exactly that ⇒ **`leg.dy`/`netPoolY`
  are ALREADY raw USD** — display must NOT multiply by oracle again. `snap.depth`
  (`getDepth=x^w·y^(1−w)`, live w) is (W)-units — a w=½ overlay trace needs
  `k=√(x·y)` (constant-product through the live point), NOT snap.depth (~104× low).
- 4 curve-dependent fns: `getMP_raw`, `tradeUpdate`, `arbitrageToOracle`, `rebase`. `getSNorm`=(x−α)/α;
  `getDepth` is display-only/stale (left so by design). State carries scalar `gh*` params
  (`ghP,ghNx,ghNy,ghM,ghMu,ghAh,ghBh,ghDelta`); the CDF table lives in a module cache keyed by shape,
  re-derived on load (pool stays serialization-safe — don't move the table onto the pool).
- `snapshot()` spreads the pool (`{...p,w,depth,sNorm}`) so the draw layer can sample the engine on
  `snap` — don't "tidy" it to an explicit field list (drops gh*, breaks curve+marker silently).

## ⛔ FILE-SAFETY (every engine edit)
- Blobs: webp line ~74 md5 `ab663f5c26f2a461c5b0ef1421d0ad74`; svg line ~1060 md5
  `c505b08ad0e4c6b0fb9e64e9679fe291`. The `8d2e1a84`/`1b320fc5` set is NOT a separate broken cut —
  it is the **decode** of the canonical line layer `ab663f5c`/`c505b08a` (one blob, three layers:
  line / b64-payload / decoded binary). Hook + run_all key off the **line layer**. RECONCILED
  repo-wide. **No minifier, ever.**
- Edit only via on-disk Python splice (work on a copy; slice old string by line range; `assert
  count==1`; preserve trailing `\n`; blobs never through the splice). Recipe:
  `engine/recipe_html_blob_editing.md`, `engine/splices/SPLICE_METHOD.md`; worked examples in
  `engine/splices/splice_*.py` (`splice_slipfix.py` is the best template).
- Post-edit must pass: 2 blob md5 unchanged · 3 `<script>` parse · IIFE intact · no script line >50k ·
  `engine/verify/run_all.sh` green. The `PostToolUse` hook re-checks and **blocks** on red — a block
  is a **finding**: STOP, report, do NOT patch toward green.

## THE gotcha
`getMP_raw` = price coordinate, NOT slope. Use `mpGeom = getMP_raw·e^(−s.ghMu)` for anything compared
to a geometric Δy/Δx (slippage %, $, angles). Read `ghMu` per-state; missing `ghMu` → **NaN (loud)**,
never `e^0`. Catastrophic cancellation: compute OTM tail via direct upper-tail integrals, NOT `1−F`.

## Done — v27 ENTRY-46 LACUNAE FIXES (4 UI-layer, handed to manager 2026-06-11)
Build: **`HEAD_temporal_mvp_v27_wkurtosis.html`** edited IN PLACE per brief (1eebfcd6 →
**928cde1cccb0f35fdc9a23a7634414c8**). Splice `/tmp/splice_v27_lacunae.py` (10 reps, all
count==1, blobs never through; copy-then-promote). 9 diff hunks = exactly the intended
regions. **Engine + state `<script>` blocks BYTE-IDENTICAL** (engine md5 d0869cbbb137
pre==post); only ui script + one HTML label line changed. NO git (manager re-pins ledgers).
- **(1) stale-on-reject (previewBand):** new `clearBandPreviewOut()` (after setWarn,
  ~L3131) resets ALL preview outputs (15 pv-* setVal ids, band-notional-bought-display,
  both $-sublines, band-deposit-notional, mode pills, setSummary) to '—'; called at TOP of
  ALL 6 reject/early-return paths (invalid-inputs path now uses it too; club×3, !sim.ok,
  fee-equity). Deposit row reset sticks because render() sets it BEFORE calling previewBand.
- **(2) audit-strip units:** pv-dy-sold/pv-dy-bought/pv-net-cash dropped `* s.oracle` —
  leg.dy/netPoolY are raw USD (re-derived from executeLeg, == pool Δy to 1e-6 in sandbox).
- **(3) anchor overlay:** `curveTraceExplicit(0.5, Math.sqrt(snap.x*snap.y), modeSlope)`
  (was snap.depth=170.83 → 104× low); k=1741.98 passes exactly through (10, 303448.28).
  Legend text untouched. Legacy fallback at curveTrace (snap.depth, pre-(W) states) left.
- **(4) τ disclosure (L1329):** appended "Visible effect scales with the wing gap (w₊−w₋)
  … sweep τ widely or widen the wing gap to see it." (magnitude itself unchanged, per brief).
- Safety: blobs `ab663f5c`@74/`c505b08a`@1064 intact, 3 scripts parse (longest line 482),
  IIFE intact, run_all GREEN (pin updated to 928cde1c), wcurve_selfcheck **22 PASS 0 FAIL**.
- **Open for tester:** browser — swap→reject shows warn + all '—'; net-cash ~order-$10k
  not billions; anchor (w=½) trace passes through the reserves point; τ label text.

## Done — v27 SPINNER CSS + SPOT-KPI BASIS (tester residuals, handed to manager 2026-06-10)
Build: **`HEAD_temporal_mvp_v27_wkurtosis.html`** edited via copy-then-promote (9d22cffd →
**29cd56bf83060f4b21a328bb79f03c57**). Splice `/tmp/splice_v27_kpi_spinner.py` (2 reps, count==1,
blobs never through). NO git (manager re-pins). Diff = exactly the 2 regions.
- **(1) Spinners clickable:** `.field-input-wrap input[type=number]` spinner CSS (old L326-329)
  `-webkit-appearance:none` → mirrors the working `.profit-row-content` block
  (`-webkit-appearance/appearance: inner-spin-button; opacity:1; height:22px; margin-left:2px`).
  **Deleted the dead `input[type="range"]` rule** (old L330-334; grep-confirmed zero range inputs
  remain). Net +4 lines → svg blob now line 1064.
- **(2) Spot KPI basis (L4294-5 old):** `kpi-spot-usd` = `fmtUSD(Engine.getMP_raw(p))` (=$80,000.00
  at load) and `kpi-spot` = `fmtNum(getMP_raw/s.oracle_initial,4)` (=1.0000) — on (W) w>½ the
  marginal g_loc·(y/x) ≠ y/x; old sNorm·oracle showed $30,344.83. `kpi-w` untouched (honest weight).
  Legacy import w/o oracle_initial → NaN (loud). Headless-verified 80000.00 / 1.0000 / old 30344.83.
- **FLAGGED, out of scope (same wrong basis, NOT in brief):** header `hdr-pool-spot` (L4251)
  still reads `sNorm*s.oracle` → shows "spot $30,344.83" while the KPI says $80,000.00. Manager
  call whether to align it (one-liner, same mpSpot basis).
- Safety: blobs `ab663f5c`/`c505b08a` intact (74/1064), 3 scripts parse (655/499/1804 lines),
  IIFE intact, longest non-blob line 553, `wcurve_selfcheck` **21 PASS 0 FAIL**.

## Done — v27 UX FIX / defaults revert (operator entry 29, handed to manager 2026-06-10)
Build: **`engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html`** edited IN PLACE per brief
(b245bfda → **9d22cffd6a0f002f359eed81d7157203**). Splice `/tmp/splice_v27_uxfix.py` (6 reps, all
count==1, blobs never through). NO git (manager re-pins gate md5s).
- **Reverted the 80000→4.44 pool/oracle rescale** (was MY earlier render fix — wrong approach,
  broke v24 feel + dollar KPIs). New defaults derived in `initialState()`: x0=10, oracle=
  oracle_initial=perpMark=80000, wings stay 0.60/0.85, τ=0.3. **y0 = x0·oracle·(1−wMid)/wMid ≈
  303448.28 (NOT 800000)** — on (W) with w>½ the marginal is γ_loc·(y/x)>y/x, so y=800000 would
  force a big load-arb; equilibrium-at-load chosen (commented in code). **phi0 = ln(y0/x0) ≈
  10.32** puts the elbow AT carry/ATM; op-point-centered trace window shows it w/o rescaling.
  alpha=x0·wMid=7.25, beta=y0·(1−wMid) (exact at u0=phi0). `_baseline_alpha/_beta` stamped from
  the same consts (drift=0 at load). Verified headless: getMP_raw(pool)=80000.000, arb no-op,
  liq-price default perp sane ($70k long / $90k short @8×).
- **lp-y-delta hardcode fixed** (~L4309): `p.y−800000` → `p.y−s._initial_y` (new state field
  captured at init; $0.00 at load; legacy imports w/o it go NaN — loud).
- **NO SLIDERS (operator):** `tau-input` `type="range" step=0.01` → `type="number" step=0.05`
  (min 0.05/max 3/value 0.3, id+input/change wiring unchanged — spinners fire both). Confirmed
  the ONLY range input in the file; all other inputs already number-type w/ sensible steps
  (weights 0.01 in (0.51,0.95), oracle step 100). Dead CSS rule for range left (harmless).
- **Static `wcurve-status` text** updated to match defaults (γ_ATM 2.64, γ₋ 1.50, γ₊ 5.67) —
  was stale 2.33×3; live `_wcurveStatus()` overwrites at boot anyway.
- Safety: blobs `ab663f5c`/`c505b08a` intact, 3 scripts parse, IIFE intact, longest script line
  482, diff = exactly 6 regions, `wcurve_selfcheck` **21 PASS 0 FAIL**.

## Done — v27 RENDER/DEFAULT/LABEL fix (knob+warp now VISIBLE; handed to manager 2026-06-10)
**PARTIALLY REVERTED 2026-06-10 (entry 29):** the pool/oracle 80000→4.44 rescale in item (2) was
the wrong fix and is now reverted (see UX-fix section above). Trace-window (1) and label (3)
survive.
Build: **`engine/builds/temporal_mvp_v27_wkurtosis_WIP.html`** (in place). Splice:
`/tmp/splice_v27_render.py` (count==1 each, blobs never through). Tester root cause: default pool
sat at u0=ln(800000/10)≈11.3 (off `curveTraceW`'s fixed u∈[−6,6] window → flat sliver) AND symmetric
wings 0.70/0.70 ⇒ Δw=0 ⇒ τ inert + all trades wing-rejected. CURVE MATH UNCHANGED → self-check
**21 PASS 0 FAIL** (it builds its OWN pools, never reads the default). Blobs `ab663f5c`/`c505b08a`
intact; 3 scripts parse; IIFE intact; longest non-blob line 535; diff = exactly the 4 regions.
- **(1) Trace window straddles operating point + elbow:** `curveTraceW` no longer walks fixed
  u∈[−6,6]; now `uCenter=½(u0+phi)`, `uSpan=½|u0−phi|+6`, walks `[uCenter−uSpan, uCenter+uSpan]`.
  Same F-level / same weight field (render-only).
- **(2) Realistic ASYMMETRIC default pool:** `x:10,y:12` (u0≈0.18, near elbow), `wMinus:0.60,
  wPlus:0.85` (Δw=0.25 live, both >½ so gLoc≈3.76>1), `alpha:7.625,beta:2.55` (re-stamped readouts).
  oracle/oracle_initial/perpMark `80000→4.44` (pool's natural marginal=4.51; arb near-identity so
  marker+frame land ON the curve). UI input defaults `wminus-input 0.70→0.60`, `wplus-input
  0.70→0.85`. NOTE oracle change has dollar-pipe blast radius but the default pool is NOT a gated
  surface (only the self-check gates, and it uses its own states) — flagged to manager for awareness.
- **(3) #16 honest label:** engine SHIPS strong-form φ warp → label now "trades RESHAPE the curve —
  strong-form φ warp ships … Still OPEN [needs-Aristotle]: warp∘rebase-commute and
  funding-under-moved-φ lemmas." (was "reserves move on a FIXED curve … strong form is OPEN").
- **Open for tester:** browser/visual — confirm the curve renders across the frame (not a sliver),
  τ slider rounds the ATM elbow, a trade visibly shifts the elbow (φ warp), in-band trade executes.
- **Open for manager:** oracle 80000→4.44 default change (visual-consistency need; blast-radius note
  above) — confirm acceptable for this WIP demo build before any HEAD consideration.

## Done — v27 STRONG-FORM WARP (replaces R-simple; implemented, handed to manager 2026-06-10)
Build: **`engine/builds/temporal_mvp_v27_wkurtosis_WIP.html`** (in place; HEAD v26c untouched).
Authority: `notes/research/TRADE_WARP_strongform_2026-06-10.md` (skeptic-GREEN, manager-verified).
Splice: `/tmp/splice_warp.py` (15 reps incl. caller surfaces, all `count==1`, blobs never through).
Blobs `ab663f5c`/`c505b08a` intact; 3 scripts parse; IIFE intact; longest non-blob line 553.
- **Field center φ in state** (`phi`, persisted across trades, default 0). `wField` now centers at φ:
  `u = ln(y/x) − phi`. φ threaded through: `_stampAB`, `arbitrageToOracle` (priceOfU + F-level both
  use `(u−phi)`), `rebase` (carries φ THROUGH unchanged — does NOT couple, see caveat), `sNormStrike`
  (via arb), pool default, setTau, setWingWeights, LP resize, liquidityPreview, snapshot, `curveTraceW`.
- **Strong-form `tradeUpdate`** (R-simple GONE): conserve `α=x·w(u;φ)`,`β=y·(1−w(u;φ))`; `y'=y+dy`,
  `w*=1−β/y'`, `x'=α/w*`, `u'=ln(y'/x')`, `t=(w*−wm)/dw2`, `z=t·τ/√(1−t²)`, `φ'=u'−z`. Returns
  `_stampAB({x',y',phi:φ',...})`. Verified `w(u';φ')==w*==0.697171` (matches skeptic TEST B exactly;
  R-simple's wrong 0.690620 is dropped).
- **Wing-range guard:** if `w*∉(w_−,w_+)` (|t|≥1) tradeUpdate returns `{rejected:true,reason:'wing-range'}`
  instead of a state. Surfaced HONESTLY at all 5 consumers: `executeLeg` (returns
  `{rejected,reason:'trade exceeds frozen-wing range — split or widen Δw'}`), spread leg1/leg2, and the
  3 band-close sim sites → all bubble `{ok:false, reason:'…frozen-wing range — split or widen Δw'}`.
- **Render reshapes:** `curveTraceW` walks the φ-centered field + φ-shifted F-level, so a trade VISIBLY
  moves the elbow (warp), not a dot sliding. Snapshot carries φ to the draw layer.
- **rebase caveat (skeptic-required):** rebase stays the carry-shift P→P/r; φ carried through, NOT
  coupled in a way asserting warp∘rebase commute. Code comment marks warp∘rebase-commute + φ-anchor/
  funding as OPEN `[needs-Aristotle]`. No "Balancer to 1e-13" claim made anywhere.
- **Gates:** `engine/verify/wcurve_selfcheck.js` extended with WARP block (SKIP-as-pass if tradeUpdate
  doesn't move φ): (a) α,β conserved 1e-12; (b) on trajectory hyperbola (x−α)(y−β)=αβ resid 0; (c)
  w(u';φ')==w* 1e-12; (d) φ moves ⇒ ATM weight shifts; (e) wing-cap rejects over-size + in-band accepted;
  (f) path-independent split==one-shot Δ<1e-15; + round-trip. **21 PASS 0 FAIL** on WIP; earlier 12
  still pass; HEAD v26c SKIPs (stays green). Did NOT run GH run_all (per brief).
- **Open for tester:** browser/visual — a trade reshapes the curve (elbow shifts with φ); an over-size
  trade shows the "frozen-wing range — split or widen Δw" message; in-band trade executes.
- **Open for manager:** re-verify the strong-form numbers + the φ-threading diff; warp∘rebase-commute
  and φ-anchor/funding lemmas remain OPEN/`[needs-Aristotle]` (not closed here).

## Done — v27 (W) KURTOSIS CURVE (SPEED RUN, implemented, handed to manager 2026-06-10)
Build: **`engine/builds/temporal_mvp_v27_wkurtosis_WIP.html`** (from v24
`temporal_mvp_v24_rebase_fixed_2.html`; NOTE v24 is PRE-GH — no ghCalibrate/CDF, no ghMu; HEAD v26c
untouched). Authority: `notes/research/BUILD_SPEC_wcurve_2026-06-10.md`. Splices: `/tmp/splice_wk.py`
(13 reps), `/tmp/splice_wk_ui.py` (4 reps) — all `count==1`, blobs never through. One trailing HTML-only
Edit (arb sim-aid + #16 honesty note). Blobs `ab663f5c`/`c505b08a` intact; 3 scripts parse; IIFE intact;
longest non-blob line 553. Diff vs v24 = exactly the intended regions (no blob lines 74/1060).
- **THE (W) simplification (verified):** marginal price == geometric slope EXACTLY on (W) —
  `getMP_raw=(w/(1−w))(y/x)`, NO `e^(−ghMu)` factor (that's GH-only, absent in v24). Self-check FD slope
  matches getMP_raw to 4.3e-7. Comment warns future GH cross-port not to reintroduce the factor.
- **4 curve fns → (W)** (`wField` = wMid+½dW·u/√(τ²+u²), u=ln(y/x); gLoc=w/(1−w)): `getMP_raw`,
  `tradeUpdate` (R-simple #16), `rebase` (carry-shift P→P/r via arb inverse), `arbitrageToOracle`
  (bisection inverse, 200 iters, F-level placement; round-trip 1.5e-15). New `sNormStrike` ported.
  **Compat layer:** state authoritative scalars = `{x,y,tau,wMinus,wPlus}`; `alpha=x·w`,`beta=y·(1−w)`
  re-stamped on every returned state (`_stampAB`) so the ~22 display/frame/LP/invariant read sites keep
  working. `getW`→`wField`. `wField` falls back to `alpha/x` ONLY if scalars absent (pre-(W) state).
- **mark:** `mark(wing,θ,sNorm,gamma)` smooth-pasting (Reading A, S*=K·g/(g+1)); **collapses to bare
  `markFrac=min(s/θ,θ/s)` when gamma absent/≤1** — so display paths (payoff chart) keep v24 no-premium
  behavior; pricing path (legPrice) passes `g=gLoc(state)`. **T5 simplification:** γ_loc taken at LIVE
  reserves, NOT strike's registered carry position (strike-position refinement deferred — labeled).
- **τ UI knob ADDED** (Settings → "(W) Curve Shape"): range slider 0.05–3 (`tau-input`) + readout +
  wing-weight numeric inputs `wminus-input`/`wplus-input` + live γ_loc status. Store `setTau` (static,
  clears `__curveFrame`), `setWingWeights`. Listeners redraw via `Viz.drawAll`.
- **#4 γ>1 GUARD (UI):** `setWingWeights` clamps w_± to (0.501, 0.95) — w≤½ ⇒ γ_loc≤1 violates lock;
  clamp reflected back into the inputs so the UI can NEVER show a γ<1 weight. Self-check + headless:
  `setWingWeights(0.40,0.80)` → w₋ clamped 0.501, γ_loc=3.99. Pool default τ=0.3, w_±=0.70 (γ_loc ATM
  2.33). Note: w_mid=0.5 would give ATM γ=1 (violates lock), so wings start symmetric >0.5.
- **Chart:** `curveTraceW` traces the curve with the position-dependent weight FIELD (F-level walk) so
  the ATM elbow rounds with τ while wing exponents stay frozen. `curveTrace` dispatches to it when the
  snap carries (W) scalars (else legacy). Frozen-wing geometry: symmetric (dW=0) is exact to machine
  prec everywhere; asymmetric tail exponent → w_±/(1−w_±) with residual O(1/τ²·1/u²)→0 (NOT a defect —
  the u=8 finite-u tail residual ~0.8% is the geometric approach, confirmed |diff|·u²=const).
- **#5 trade mechanic — R-simple, LABELED HONESTLY** (hard skeptic check): code comment in tradeUpdate
  + UI sim-aid both state "reserves move on a FIXED curve — NOT the full trades-reshape-the-curve warp
  (weight-field re-centering u→u−φ, OPEN)." NOT presented as the full warp.
- **Dollar pipe UNTOUCHED** (§5 hard-stop): executeLeg/closeBand settlement chain byte-unchanged.
- **Gates:** GH `run_all` does NOT apply (pre-GH). New `engine/verify/wcurve_selfcheck.js` (12 checks:
  price==slope, arb round-trip, frozen wings sym+asym, elbow rounds, γ>1 guard both directions, seam
  value+slope @ sNorm*, S*=K·g/(g+1)) — **12 PASS 0 FAIL**; SKIPs-as-pass on pre-(W) builds (no wField
  export) so HEAD stays green. Did NOT fake/invoke GH gates.
- **Theory-risk/OPEN (flagged to operator via manager):** (T1/T2) tradeUpdate R-simple — R-paper strong
  warp (w→φ map) OPEN/#16. (T3) rebase carry-covariance-in-q lemma PROPOSED-only, not Lean. (T4) funding
  price-anchor p=P + γ→±γ_loc adopted; correct-economic-anchor not proven; γ_loc at-spot not at-strike
  (T5). (T5) γ_loc-at-strike refinement deferred (used at-live-reserves). Reading A locked (not B). τ
  label direction (smaller=fatter) is operator's final call. **Open for tester:** browser/visual — τ
  slider rounds the ATM elbow with wings frozen (overlay two τ); γ<1 wing weight clamps in the UI;
  trade mechanic honesty note visible.

## Done (don't redo)
- GH swap (v25), v26a barrier-remnant fixes (inline slip price, curve-draw, eq marker → engine),
  slippage units fix (both `legSlipFrac`/`legSlipUsd` → mpGeom; old `margPrice` removed; comment
  mislabel fixed; tooltip relabeled reserve-USD). All 7 gates green; splice-level slippage matches
  targets; no silent ghMu default.

## Done — v26b ITM/American (IMPLEMENTED, handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26b_itm.html`** (from HEAD `89ae89e9`; HEAD untouched).
Splice: `/tmp/splice_v26b.py` (17 reps, all `count==1`, blobs never through). All gates green.
- **mark split:** `markFrac(wing,θ,sNorm)` = OLD saturating fraction VERBATIM (funding + the polar
  ψ∈(0,1] mark-curve marker route here; funding proved BIT-IDENTICAL to HEAD, worst |Δ|=0). New
  `mark(wing,θ,sNorm,γ)` = American smooth-pasting VALUE; `γ = state.ghAh−1` (exact). Branches bound
  by **S-direction, NOT the call/put tag** (tag is inverted): `wing 'call'`=sNorm/θ arm →
  `sNorm*=θ·((γ+1)/γ)^γ`, cont `sNorm/((γ+1)·sNorm*)`, intrinsic `1−(sNorm/θ)^(−1/γ)`=1−S/K, S*<K.
  `wing 'put'`=θ/sNorm arm → `sNorm*=θ·(γ/(γ+1))^γ`, cont `sNorm*/((γ+1)·sNorm)`, intrinsic
  `1−(sNorm/θ)^(1/γ)`=1−K/S, S*>K. Both fraction@bdry=`1/(γ+1)`.
- γ threaded through: legPrice, executeBand (buy-side denom), markEff/legValueUnified (+closeBand
  callers), pfComponents (+renderBands `pfGamma`), preview N_buy denom, legFraction. **Cap removed
  on the UNBOUNDED (barrier) leg only** in legFraction; spread leg stays `min(1,·)`.
- **Stage-2→3 dollar conversion UNTOUCHED** (no exercise branch needed — confirmed compatible).
- **Display:** dropped `effK` (4151/4156), emptied Eff-strike component cell (`<td></td>`, 9-col
  preserved), header `Attrib P&L / Eff strike`→`Attrib P&L`, `Orig strike`→`Strike`, dropped stale
  units-note. Kept Oracle(live), Entry mark, mark cell, `itm`/`regimeCls` colouring.
- **Seam gate** (`verify/seam_gate.js`, generalized): PER BRANCH value match (price-space, 0.000%) +
  slope match (sNorm-space, ≤0.0005%) + no-jump (~1e-7) + DIRECTIONAL (branch A S*<K, branch B S*>K,
  keyed off price space). Mutation test (swapped branches) → exits 1. **Slope is measured in
  sNorm-space on purpose:** price-space FD differencing aliases the GH table (plateaus ~0.2%, does
  NOT shrink with h → measurement artifact, not a kink); sNorm-space `d mark/d sNorm` is the exact
  structural smooth-pasting quantity (chain-rule dS/dsNorm cancels). Wired into run_all as HARD GATE;
  **SKIPs as pass on pre-v26b builds** (detects `markFrac` + non-saturating ITM mark) so HEAD stays
  green. 7 GH gates still PASS γ∈{1.5,2,3,4}; blobs unchanged; 3 scripts parse; IIFE/sigs intact.
- **Open for tester:** browser/visual run — bands table renders (empty Eff cell, renamed headers),
  payoff chart legFraction uncapped on naked leg, polar marker dot stays on its ψ-curve.

## Done — v26c strike-registration fix (IMPLEMENTED partial, handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26c_strikereg.html`** (from HEAD `8df9f8a3`; HEAD untouched).
Splice: `/tmp/splice_v26c.py` (4 reps, all `count==1`, blobs never through). Diff vs HEAD = exactly
the 4 intended regions (helper + export + pfComponents ray + 2 call sites); longest non-blob line 553.
- **The fix:** register strike in curve coord `θ=sNorm(K)=getSNorm(arbitrageToOracle(pool,K))` (NOT
  FD; NOT K/oracle). New engine helper `sNormStrike(s,K)` (loud NaN on degenerate). Verified γ-dep
  θ=0.9295/0.9071/0.8639/0.8228 (γ=1.5/2/3/4), crossover pins to K=84000 every γ (OLD drifted: γ=2 →
  o0²/K=76190). Helper exported.
- **Applied to (DISPLAY mark path only):** `pfComponents` — ray `K=>K/oracleLive` → `Engine.sNormStrike(pool,K)`;
  threaded `s.pool` in at the 2 renderBands call sites. The `itm` test (sNormPool vs theta) now crosses
  at K too → AGREES with isOTM/wingMember (gate 2). `mark` now gets sNorm(K) → intrinsic `1−S/K` correct.
- **NOT touched (LOCKED / escalated):** funding (`fundingPerStrike` ±2, markFrac) — untouched.
  isOTM/wingMember — untouched (stay K/oracle price-measure). **DELIBERATELY LEFT in OLD basis,
  flagged to manager:** (a) execution/settlement path `executeBand`/`closeBand`→`legPrice`/`markEff`/
  `legValueUnified` + `compositeRay`/`vsValue` — re-basing theta there reshapes θ*/δ/V/dy = the AMM
  swap + stage-2 leg value feeding the LOCKED stage-2→3 dollar conversion (settlement semantics).
  (b) chart-ray `drawStrikeMark` uses `Engine.markFrac` (locked polar/funding route); `drawStrikeRay`
  built on `thetaStarOf`=compositeRay geometry. Both entangle locked surfaces → STOP-and-report per
  brief, not improvise.
- **Gates:** new permanent `verify/dir_gate.js` (crossover@K all γ + directional CALL+++/PUT−−− +
  swapped-arm mutation detected; SKIPs as pass pre-v26c via missing sNormStrike export). Seam gate
  re-anchored: `sNat` now prefers `E.sNormStrike` (was already inline getSNorm(arb(s0,K)) — effectively
  no-op, made explicit). Both wired into run_all.sh as HARD GATES. Full harness on v26c GREEN: 7 GH
  gates PASS, seam PASS both branches, DIR gate PASS, blobs `ab663f5c`/`c505b08a` intact, 3 scripts
  parse, sigs/IIFE true. HEAD stays green (dir_gate SKIPs).
- **Open for manager (architectural fork):** does the registration fix extend to the execution/
  settlement pricing path + chart-ray markFrac sites? Those reshape locked dollar-conversion/funding-
  polar surfaces — needs an operator ruling before I touch them. **Open for tester:** browser/visual —
  bands table mark crossover now at K; chart strike ray/dot still on OLD basis (pending the fork).

## Done — v26c-FULL strike-registration (operator (A): UNIFORM, handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26c_full.html`** (from `temporal_mvp_v26c_strikereg.html`;
HEAD `8df9f8a3` untouched). Splices: `/tmp/splice_v26c_full.py` (8 reps), `/tmp/splice_v26c_chartray.py`
(1), `/tmp/splice_v26c_export.py` (1) — all `count==1`, blobs never through. Blobs `ab663f5c`/`c505b08a`
intact; 3 scripts parse (longest script line 482); whole-md5 `8f7b3ffb…`.
- **New engine helper `regLeg(s, leg)`** (after `sNormStrike`, exported): registers a leg's
  K_inner/K_outer into carry-space (theta=sNorm(K)) for the mark/value PRICING path; leaves the
  leg's price-ratio inner/outer untouched (isOTM/wingMember keep reading those at K/oracle).
- **Execution path (`executeBand`):** sell leg, N_buy denom, buy leg all re-registered. THE KEY
  FINDING: the denom mark fed a PRICE-MEASURE spot (`poolMark/oracle`) + price-ratio theta, NOT the
  carry basis legPrice uses (`getSNorm` + sNorm(K)). `mark` is NOT invariant to that basis (diverges
  up to ~38% @γ=4). Re-based denom spot → `getSNorm(leg1.newState)` + registered theta. `sNorm2`
  feeds ONLY mark there (no isOTM shares it) ⇒ clean. **End-to-end the OLD exec path BLEW UP**: γ=3/4
  N_buy=3.28e6, netPoolY=2.6e11 (price-measure denom near-zero). NEW: N_buy~0.1-0.6, netPoolY~16-32k,
  all finite/positive across K∈[80001,500000], no NaN/Inf/sign-flip.
- **Settlement (`closeBand`):** all 3 branches (soldITM/boughtITM/neither). Settle-to-cash VALUE
  (`legValueUnified`/`markEff`) and live-leg reversal (`legPrice`) re-registered to `getSNorm(s)` +
  sNorm(K). **Leg SELECTION (legIsITM/wingMember) LEFT on `sNorm0` price-measure** — only the VALUE
  fed to the dollar pipe is corrected (guardrail 2 authorizes "feed corrected value"). Crossover
  agrees at K in both spaces so selection unchanged. **Dollar pipe (carvedNotional/entryPerpMark/
  attributablePnL/carvedEquityAtClosure/L0 multiply) byte-unchanged** — confirmed in diff.
- **Premium delta (legPrice, isolated, barrier call):** moves UP toward registered value. K=84000:
  +12.97/15.76/21.54/27.62% (γ=1.5/2/3/4); K=82000 (~near-strike): +6.37/7.69/10.38/13.14% — the
  "~10%" sits here. Grows with γ (price-ratio vs sNorm diverge with γ).
- **Chart strike-ray (`drawStrikeRay`, Finding-2):** fed LIVE `K/oracleVal` rays (was stale
  `b.*.inner`=K/oracle_entry). `drawStrikeRay` is PRICE-RATIO space (rawSlope=θ·oracle=mp-line);
  `rawSlope=K` lands ray+dot on `arbitrageToOracle(pool,K)` = the sNorm(K) point, every γ; rebase
  drift gone. **DIVERGENCE FROM BRIEF LITERAL:** the brief says "→ sNormStrike", but feeding the
  sNorm value into θ·oracle would draw sNorm·oracle (72565 vs correct 84000 @γ=2) — WRONG. Used the
  geometrically-faithful K/oracle_live instead (same registered point). Flagged to manager.
- **`drawStrikeMark` LEFT** (funding-polar marker, brief says leave). isOTM/wingMember/funding/markFrac
  untouched (price-measure, stay at K).
- **dir_gate enhanced (guardrail 5):** added MIXED-BASIS exec-path control — asserts the EXECUTION
  leg-mark crossover (via `E.regLeg`) ALSO lands at K, and demonstrates the K/oracle mutant misses K
  (drift point). DEMONSTRATED: mutating `regLeg`→K/oracle in a temp build FAILS dir_gate (exit 1) at
  every γ; uniform build PASSES. SKIPs cleanly if no `regLeg` export (HEAD stays green).
- **Gates:** `sh verify/run_all.sh builds/temporal_mvp_v26c_full.html` GREEN — 7 GH PASS γ∈{1.5,2,3,4},
  seam PASS both branches (re-anchored), dir_gate PASS (crossover@K + exec mixed-basis control +
  directional + mutation). HEAD still green (dir_gate SKIP).
- **OPEN / flagged (not done, intentional — surface to operator):** (1) chart-ray brief-literal
  divergence above. (2) **Payoff chart `drawPayoff`/`legFraction` (line ~3914) left on price-ratio**
  — it sweeps spot as `sNorm=(1+r)` (fractional move) and feeds `mark` with `K/S0` strikes; it's
  self-consistent in price-ratio space but NOT in the brief's listed scope (brief lists drawStrikeRay
  only, not drawPayoff). Bringing it to carry-space requires re-basing the whole swept x-axis — a
  SEPARATE display increment. Did NOT expand scope. (3) Settled-value correction changes the dollar
  figure on ITM-leg closes — manager should re-derive before HEAD promotion.

## Done — v26c-full2 drawPayoff carry re-basing (operator (i), handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26c_full2.html`** (from `temporal_mvp_v26c_full.html`
`8f7b3ffb`; HEAD `8df9f8a3` untouched). Splice: `/tmp/splice_v26c_full2.py` (4 reps, all `count==1`,
blobs never through). Whole-md5 `6cc73563779a3e030774b7597d0ae187`. Diff vs source = drawPayoff-ONLY
(lines ~3891-4041), exactly the 4 regions; longest script line 482.
- **THE re-basing:** drawPayoff now feeds `mark` in CARRY basis like the bands table (pfComponents).
  (1) Leg thetas: `K/S0` price-ratio → `Engine.sNormStrike(state.pool, K)` (the SAME registration
  pfComponents/exec use). (2) Swept sNorm in `composedEquity`: `(1+r)` price-ratio →
  `Engine.sNormStrike(state.pool, S0*(1+r))` (= getSNorm(arbitrageToOracle(pool,S)), the same inverse).
  (3) **Pre-existing bug fixed in passing:** the N_buy block passed the Store WRAPPER `state` to
  `legPrice`/`getSNorm`, which read `state.x`/`state.alpha` (undefined → NaN → silent fallback). Now
  uses `const pool = state.pool` so getSNorm sees x/alpha/gh* — N_buy now actually derives (matches
  bands table). legFraction CAP STRUCTURE UNCHANGED (barrier uncapped, spread min(1,·)); only the
  mark INPUTS changed basis. Guards: negative/zero swept spot → NaN → leg skipped (loud, not e^0).
- **SAMPLE MATCH (acceptance):** γ=2, call wing, K=72000, r=0 (S=S0=80000): bands-table mark
  0.1200105126 == drawPayoff mark 0.1200105126, |diff|=5.1e-13. Verified true across wings/K
  {call 72000/60000, put 88000/100000} and γ∈{1.5,2,3,4}, all |diff|<1e-9. (At r=0,
  sNormStrike(pool,S0)==getSNorm(pool) at equilibrium, so the marks coincide exactly.)
- **x-range ADAPTED (not literal ±200%):** carry basis makes sNorm∝S^-γ, so r=-2 → S=-80000 (negative
  spot → sNormStrike NaN). Spot can't drop below -100%. Used **xMin=-0.9, xMax=2.0** (asymmetric):
  -90% clears the call-wing free boundary sNorm* and +200% clears the put-wing sNorm* for ALL γ
  (verified: call sN@r=-0.9 = 31/99/990/9873 ≥ sNstar 2.5/2.8/3.3/3.7; put sN@r=+2 ≤ sNstar both).
  x-tick loop `-50..50 step10` → `-50..200 step50` (clean ticks inside the range; -90 edge unticked).
  **Note:** the naked-leg mark `1−S/K` (call) only EXCEEDS 1 as S→0 (unreachable, floored at -90%),
  so the strict naked>capped uncap isn't visible; what IS reached/visible is the continuation→
  intrinsic free-boundary crossing (the geometrically meaningful divergence). Flagged honestly.
- **§6 carve-out did NOT trigger:** bounded display increment, no locked surface touched (funding/
  isOTM/wingMember/markFrac/drawStrikeMark/drawStrikeRay/dollar pipe/execution all UNTOUCHED —
  confirmed in diff). drawPayoff-only.
- **Gates:** `sh verify/run_all.sh builds/temporal_mvp_v26c_full2.html` GREEN — 7 GH PASS γ∈{1.5,2,3,4},
  seam PASS both branches, dir_gate PASS, blobs `ab663f5c`/`c505b08a` intact, 3 scripts parse,
  sigs/IIFE true, no blob-in-script. **Open for tester:** visual — payoff chart leg marks now match
  the bands table at the live spot; asymmetric -90%..+200% frame; naked/capped leg shapes.
  **Open for manager:** verify sample-match + registration-only diff before tester pass + HEAD promo.

## Done — v26b payoff x-range widen (DISPLAY-ONLY, handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26b_xrange.html`** (from HEAD `8df9f8a3`; HEAD untouched).
Splice: `/tmp/splice_xrange.py` (2 reps, both `count==1`, blobs never through). Operator-approved
(tester item-3 follow-up). Diff vs HEAD = exactly 2 lines, both in `drawPayoff`:
- L3815 `const xMin = -0.5, xMax = 0.5` → `-2.0 .. 2.0` (perp-mark % sweep). Picked ±200% as the
  smallest clean round range: default γ=2 (`GH_GAMMA=2.0`), naked/barrier (call-wing) free boundary
  `sNorm*=θ·((γ+1)/γ)^γ=2.25·θ`; r∈[−2,+2] takes sNorm up to 3.0, clears S* for typical OTM θ so the
  uncapped naked leg's intrinsic visibly diverges above the capped (min(1,·)) spread leg.
- L3947 x-tick loop `pct=-50..50 step10` → `-200..200 step50` (9 ticks). No other axis/range text
  states a number (note at L1442 is qualitative); nothing else to update.
- NO touch to mark/markFrac/legFraction/curve fns/funding/settlement (display/axis only). Harness
  green from `engine/`: `sh verify/run_all.sh builds/temporal_mvp_v26b_xrange.html` → 7 GH gates
  PASS γ∈{1.5,2,3,4}, seam gate PASS both branches, blobs `ab663f5c`/`c505b08a` intact, 3 scripts
  parse, sigs:true, IIFE:true, longest non-blob line 553 chars. **Open for tester:** visual — naked
  leg climbing past capped spread now visible within the wider frame.

## Done — FAITH GATES (engine-faithfulness pivot, operator-ordered FIRST, 2026-06-10)
**Harness-only — ZERO HTML edits** (HEAD md5 `6cc73563` byte-unchanged). 5 new
`engine/verify/faith_*.js` wired into run_all.sh as HARD GATES after dir_gate (same positional-$1
staged-name convention, `temporal_mvp_v26b_itm.html`). Each: PASS bar in header, loud PASS/FAIL,
exit 1 on red, `--mutate` flag flips the checked relation → exit 1 (all 5 demonstrated), PLUS a
built-in always-on "mutant DETECTED" assertion (dir_gate style). All SKIP-as-pass only on pre-GH
builds (no ghCalibrate). Full run_all on clean v26c: GREEN, exit 0.
- **faith_esscher** (GHJ slope law): FD slope (central-diff tradeUpdate, NOT getMP_raw) ==
  ghP·e^(u−ghMu) at 10 walked trade states; gauge scalars bit-identical under trade; group law;
  slope-ratio==mp-ratio. TOL_FD=0.5%: measured FD plateau ~1.1e-3, h-INDEPENDENT (table-chord
  aliasing, same artifact seam gate documents — do NOT shrink h expecting improvement). Mutant =
  THE gotcha (slope vs getMP_raw, off by e^ghMu).
- **faith_rebase** (PH6): r∈{0.5,1.1,2,5}: getSNorm/sNormStrike(·,K/r)/mark invariant ≤1e-12
  (measured 4e-16); getMP_raw×1/r; arb commutes; group law; scalar bookkeeping bit-exact. Mutant =
  unscaled K post-rebase (θ 0.23 vs 0.91 @γ=2,r=2).
- **faith_reflection** (C3 residual closed): mark('put',θ,s,γ)==mark('call',θ,θ²/s,γ) ≤1e-12
  (measured 6e-16), 405 pts/γ incl. engine-registered θ; markFrac too; boundaries reflect
  sN*c·sN*p=θ². Mutant = reflect at 1.02·θ²/s.
- **faith_merton** (MERTON tie): kernel is GH λ=1 hyperbolic `exp(bh·v−ah·√(δ²+v²))`; harness
  quadrature off LIVE ghAh/ghBh/ghDelta. PINS (5e-7): σ_eff²=0.539376231136/0.324244596604/
  0.160865765074/0.0987368432408 (γ=1.5/2/3/4), M, κ(−γ), r_GH=γκ(1)+κ(−γ), r_gauss=γ(γ+1)σ²/2.
  ghM(engine A&S Bessel)==full-support quadrature ≤1e-8 (measured ~5e-10). Vieta roots {−γ,γ+1};
  strip: put root IN, Gaussian call root γ+1 OUT (GH asymmetry, integrand non-decay shown).
  Sanity anchors: κ(−2)=0 (kernel symmetry), κ(−3)=κ(1). δ enters via σ_eff² — gap r_GH/r_gauss
  −1 = +15%/+0.2%/−1.5%/+3.8% recorded. Mutant = silent δ′=2δ drift.
- **faith_fisher** (cgf''=Var=Fisher): NO direct engine κ''(t) exists (engine carries only the
  t=0/t=1 Esscher pair) — honest shadow: ENGINE means from reserve legs (F_β=1−X/Nx,
  F_{β+1}=Y/(NyM), Stieltjes over arb sweep): Δmean==∫₀¹Var_t dt and logM_T==mean_β+∫(1−t)Var_t
  (exact for the TRUNCATED exp-family = what the table implements; window [−16,18] DETECTED live
  via price-coordinate clamp readback, not assumed). TOL 1e-4 (measured ≤1.4e-5). Truncation gap
  log ghM−logM_T = 1.13e-4 @γ=1.5 (slow tilt tail), <1e-8 @γ≥2 — printed+bounded 2e-4. Mutant =
  Var×1.01 (resid→1e-2).
- **Manager note:** `d0354e5` WIP-snapshotted the first 3 mid-task; final files byte-identical.
  Remaining uncommitted: run_all.sh wiring + faith_merton.js + faith_fisher.js.

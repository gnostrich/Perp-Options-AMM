# MEMORY — tester
_Last updated: 2026-06-09, after v26d vol-knob live-browser verification (build 16a872ba). FOUND A FATAL LOAD-ORDER BUG — FLAGGED FAIL to manager._

## DONE — 2026-06-09 v26d vol-knob LIVE-BROWSER verify (build 16a872ba33e38843b803d79667b199f5, READ-ONLY)
Live Chromium. Manager had Node-verified (blobs/gates green). My job: live UI behaviour Node can't see.
**RESULT: FAIL — the build is visually broken. A TDZ load-order bug blanks ALL canvases and never
defines `Viz`/`render`.** Reproduced clean x2 (byte-identical state both runs).

### FINDING-V26D-1 (FAIL, blocker): vol-knob IIFE runs render() before `const Viz` initialises
- The vol-knob control-panel IIFE (`<script id="ui">` L2872-2961) ends with `apply()` (L2960) to
  init read-outs. `apply()` calls `render()` (L2942). `render()` ENDS by calling `previewBand()`/
  `Viz.drawAll` (L4410-4412). But `const Viz` is at **L3444 — LATER in the SAME script block** ->
  Temporal-Dead-Zone. So `Viz.drawAll` throws **"Cannot access 'Viz' before initialization"**, an
  UNCAUGHT exception that **aborts the rest of `<script id="ui">`** — so `const Viz` (L3444) never
  runs, the `chart-select` listener (L4324) and many other listeners after L2960 never bind.
- Live proof (`pw_v26d_diag.mjs`): after load `typeof Viz === "undefined"`, `typeof render ===
  "undefined"`; `canvas-curve` getImageData **nonblank=0 (TOTALLY BLANK)**; same after a sigma change
  (canvas stays 0/0). Error fires at load AND on every sigma change (3 throws in the short diag, 9 in
  the fuller run). Dashboard screenshot `p1_A_dashboard_full.png`: the "POOL STATE — LIVE" curve area
  is empty/black — no GH curve, no axes, no marker, no rays.
- WHY read-outs still update: `apply()` does `Store.setShape()` + sets gamma/S*/sigma/delta text
  (L2922-2941) and the vol-knob's own input/change listeners bind (L2956) BEFORE the `render()` throw.
  So the PANEL works and the POOL re-warps (ghAh changes) — but NOTHING redraws and the rest of the
  UI's wiring is dead. A read-out-only check would falsely look "green."
- Likely one-line fix (intern, not me): defer the init draw past Viz init — drop the load-time
  `apply()`'s `render()`, or guard render's draw tail, or move the vol-knob IIFE below `const Viz`,
  or `setTimeout(apply,0)`. MANAGER decides; I do not edit.

### Per-item FLAG table (build 16a872ba)
1. Panel renders — **PASS.** 5 inputs, all `type=number` steppers (native up/down arrows): vk-unlock
   (checkbox), vk-sigma (step .005), vk-rate (.01), vk-gamma-raw (.05), vk-delta-raw (.01). Locked
   mode: sigma/r editable; gamma `2.0019`/S* `$53,350`/delta `0.0800`/beta `1` read-only.
   `p1_B_panel_locked_readouts.png`.
2. sigma re-warps LIVE curve — **FAIL (curve).** sigma->gamma math + pool re-warp work: ghAh
   s0.129->3.0019, s0.30->2.0001 (lower g), s0.08->4.484 (higher g); sample-trace shifts huge (rel
   0.95 hi, 89 lo). But the CURVE NEVER REDRAWS (canvas blank, Finding-1). gamma read-out updates
   correctly. Engine side right; the VISUAL re-bend the item demands does not happen.
3. S* tracks dial — **PASS (read-out).** sigma0.129: S* out `$53,350` == K*g/(g+1)=80000*2.0019/3.0019
   = 53350.21. Floor case sigma5->g1.0001->S* `$40,002`. (Read-out only; panel renders, canvas doesn't.)
4. pro-forma dotted + stepper re-trace after sigma — **FAIL.** Canvas dead => no dotted pro-forma/
   preview render at all; the draw path throws. Cannot confirm the must-pass behaviour — visually
   absent. INCONCLUSIVE on stepper *logic* through dead UI, FAIL on the *rendered* behaviour.
5. Curve re-warps under open bands; 3 graphs redraw — **FAIL.** No graph redraws (blank). Pool stays
   finite (poolFinite=true, mp=80000, no NaN cells in the 11-cell portfolio table), but nothing draws.
6. Lock/unlock toggle — **PASS.** Check "Free shape": modeLabel->"Free shape (off-theory)", sigma
   input disabled, gamma-raw/delta-raw enabled, unlocked-inputs un-hidden, derived-sigma shown
   (`0.1291`). Edit gamma-raw 2->3: gamma-out `3.0000`, sigma-out `0.0913`, ghAh->4. Uncheck restores.
   `p1_C_panel_unlocked.png`. (Toggle listener binds before the throw, so it survives.)
7. gamma>1 hard floor — **PASS.** sigma=5 -> gamma clamps `1.0001`, note "gamma clamped to >1 (locked
   GH/Merton family floor). sigma would imply gamma<=1…", ghAh=2.0001, mp finite (no NaN).
   `p1_D_gamma_floor.png`.
8. No console errors — **FAIL.** Persistent uncaught `"Cannot access 'Viz' before initialization"`
   (x9/run), at load and every sigma change. Reproduced clean x2 identical.

VERDICT: **FAIL — do NOT ship / do NOT merge v26d as-is.** The vol-knob *logic* (sigma->gamma Merton,
setShape re-warp, floor clamp, lock/unlock, S*) is correct and tester-confirmed; but a TDZ load-order
bug (vol-knob IIFE apply()->render()->Viz.drawAll before `const Viz` @L3444) throws uncaught, blanks
EVERY canvas, and leaves Viz/render undefined + later listeners unbound. Exactly the class Node can't
see (gates are headless engine logic; G4/Merton/seam pass on the math). Items 1/3/6/7 PASS (panel +
read-outs); items 2/4/5/8 FAIL on render.

### Repro / harnesses (engine/verify/, READ-ONLY — no engine edits)
- `pw_v26d_diag.mjs` — decisive: Viz/render undefined, canvas nonblank=0, error at load+sigma.
- `pw_v26d_shots.mjs` — evidence screenshots x2 + item 1/3/6/7 read-out confirms.
- `pw_v26d_volknob.mjs` — fuller harness; had a self-bug (passed readPanel as fn not readPanel() ->
  empty panel dicts); superseded by the two above. Its canvas timeouts were the same blank bug.
- Env: pw 1.56.1 global `/opt/node22/lib/node_modules`; ESM `import pkg from '.../playwright/index.js';
  const {chromium}=pkg;`; `executablePath:/opt/pw-browsers/chromium-1194/chrome-linux/chrome`;
  `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`. Build md5 16a872ba (unchanged; no engine edit).
- Evidence dir `evidence/v26d_volknob_ui/`: p{1,2}_A_dashboard_full.png (blank curve area),
  _B_panel_locked_readouts.png, _C_panel_unlocked.png, _D_gamma_floor.png, _E_canvas_curve_BLANK.png
  (1486 b uniform-blank), + p{1,2}_0x curve/proforma shots (all 1486 b = blank).

---

# MEMORY — tester
_Last updated: 2026-06-09, after composite-curve 4-item READ-ONLY verification on HEAD 6cc73563._

## DONE — 2026-06-09 composite-curve 4-item verification (HEAD 6cc73563, READ-ONLY)
Manager asked: a brief assumed graph-1 strike rays drifted to "4 individual lines" and wanted a
reconcile to composite. INDEPENDENT confirm/refute, no engine edits. **All 4 items REFUTE the
brief's premise / CONFIRM manager's code-read: HEAD is ALREADY composite, gamma/delta frozen,
stepper live.** Live Chromium, reproduced clean ×2 (identical numbers). Oracle gate GREEN.

### Env gotcha (NEW, important): global Playwright, ESM import quirk
- The `engine/node_modules/playwright` is GONE; pw 1.56.1 is GLOBAL at
  `/opt/node22/lib/node_modules`. ESM `import` does NOT honor NODE_PATH and the package is CJS, so:
  `import pkg from '/opt/node22/lib/node_modules/playwright/index.js'; const { chromium } = pkg;`
  (named `import { chromium }` FAILS — CJS).
- The cached browser at `~/.cache/ms-playwright/chromium_headless_shell-1194` does NOT match pw 1.56;
  launch with explicit `executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'` and
  `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`. That combo launched clean.
- `Engine`/`Store` reachable in `page.evaluate` (confirmed again). BUT UI top-level fns like
  `setPreviewStep` are NOT reachable by bare name in evaluate — drive the stepper by CLICKING the
  real `#preview-step-1/2` buttons (dispatch MouseEvent) instead.

### Verdicts (FLAG per item) — all PASS, brief premise REFUTED
- **ITEM A — pricing COMPOSITE: PASS.** Live page Engine `legPrice('call',inner,outer,N)` →
  `compositeRay(lo,hi)` → ONE `theta_star=1.6202` → ONE `mark()=0.07317` → `vsValue`. Independent
  recompose byte-matches (oneMarkPerLeg_match=true |diff|<1e-12), mode='spread'. NOT per-strike
  American smooth-paste. Code 1764-1775, compositeRay+vsValue 1710-1715.
- **ITEM B — graph-1 = 2 composite rays/open band: PASS.** 2-leg spread band (sold call 120k/140k,
  bought put 68k/50k): raysDrawn=2 (sold composite theta=1.6202, bought composite theta=0.7289);
  the 4 real strikes COLLAPSE to 2 rays via `thetaStarOf=√(inner·outer)`; +up to 2 preview rays.
  NOT 4 individual lines. Screenshot `curve_2rays.png`: GH curve, 1 green + 1 red dashed ray from
  origin, trade-dots on hyperbola, white eq-marker on curve (GH continuation, not Balancer). Code
  drawCurve 3475-3500, liveRayTheta 3484-3490.
- **ITEM C — gamma/delta frozen, stepper LIVE: PASS.** (a) ZERO live gamma controls in DOM
  (gammaControls=0, rangeInputs=0 — the lone `input[type=range]` is CSS-only @330, no element);
  `GH_GAMMA=2.0` const @2259, never reassigned; gammaLive=2 (ghAh=3). (b) delta=0.08 hardcoded in
  ghCalibrate @1624; no delta/vol/scale control (deltaControls=0). (c) STEPPER LIVE: clicking real
  `#preview-step-1/2` flips `__previewStep` 1↔2, maps `__previewPool` to DISTINCT
  leg1State(w=0.5271,x=9.487)/leg2State(w=0.5555,x=9.001), active class toggles, statesDistinct=true;
  dotted curve re-traces from leg1State/leg2State @3331-3332, preview rays at distinct
  leg1_theta=0.381/leg2_theta=1.882 @3494-3499. Harness `pw_stepper.mjs`.
- **ITEM D — portfolio table 1 band + ≤4 comp + 1 total: PASS.** Live DOM, 2-leg spread band = 6
  rows EXACTLY: pf-band-row(B1) + 4 pf-comp-row (SOLD call inner/outer, BOUGHT put inner/outer) +
  pf-total-row, all 9 cols. A BARRIER leg = 1 comp row (outer skipped @4265) → ≤6 rows/band. TWO
  tables: `#bands-table` (9 cols, THE portfolio/components table, band+comp+total) vs `#pf-perps`
  (10 cols, raw perps, 1 row/perp). The band-row is a LEVEL-1 SUMMARY (origin-perp carve data as
  COLUMNS on it), NOT a separate "perp-carve row" as the brief phrased. Code renderBands 4285-4409,
  pfComponents 4251-4283. Portfolio subtab toggle = `[data-subtab-pf="bands"]`.
- VERDICT: brief's "4 individual lines / reconcile to composite" is REFUTED — nothing to fix. HEAD
  is already composite on value path AND ray draw; gamma/delta frozen consts; stepper live.

### Repro / evidence
`cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_verify_4items.mjs` (items A/B/C
controls/D) and `node verify/pw_stepper.mjs` (stepper button-click). Oracle gate
`sh verify/run_all.sh builds/HEAD_temporal_mvp_v26c.html` GREEN (md5 6cc73563, blobs canonical, 3
scripts parse, 7 GH + curveTrace 401/401 + marker + slippage splice + SEAM PASS + DIR PASS @K).
Evidence `evidence/v26c_verify_4items/`: curve_2rays.png, portfolio_perps_subtab.png (10-col perps
table; 6-row bands DOM-confirmed ×2 in harness JSON), pw_verify_4items.mjs, pw_stepper.mjs.

---

## DONE — live v26c_full2 browser confirmation (build 6cc73563…)
Ran **live Playwright Chromium** against `builds/temporal_mvp_v26c_full2.html`. Build md5
`6cc73563779a3e030774b7597d0ae187` unchanged (no engine edit); blobs `ab663f5c…`/`c505b08a…`
intact; 3 scripts parse. Oracle `run_all.sh builds/temporal_mvp_v26c_full2.html` GREEN incl. SEAM
GATE + **DIR GATE PASS** (γ∈{1.5,2,3,4}, mutation-detected). Note: run_all.sh COPIES the passed
build into a scratch file literally named `temporal_mvp_v26b_itm.html` (line 16) and the seam/dir
gates read that scratch copy — so the "v26b_itm" filename in gate headers is the scratch name, the
CONTENT is v26c_full2. Harness: `engine/verify/pw_v26c_visual.mjs`. Reproduced clean across 2 runs
(chart-vs-table diff identical to the bit; not flaky).

### KEY ENABLER: `Engine` AND `Store` ARE reachable inside `page.evaluate`
Classic-script top-level `const`s (Engine line 1590, Store line 2255) live in the page global and
ARE visible to `page.evaluate` (unlike Node import, which can't see them). So the live oracle of
record here is the page's OWN engine called against the live `Store.state.pool` + the rendered DOM
mark cells. (NOTE: top-level UI *function declarations* like `setPreviewStep` are NOT bare-reachable
in evaluate — click the buttons instead. See 2026-06-09 run.)

### Verdicts (FLAG per item)
1. **Bands table crossover at K — PASS (tester-confirmed, live engine + rendered DOM).** The
   OTM→ITM **regime** crossover (`legIsITM`) requires a pool-SPOT move, not a rebase: set oracle then
   click **#btn-arb (Run Arbitrage to Oracle)** to push poolMark to the oracle. Then `soldITM` flips
   **false→true EXACTLY at oracle=poolMark=120000=K** (119900 OTM, 120000 ITM) for the SOLD call
   K=$120k, γ=2 build. `legIsITM` uses price-measure `sNorm0=poolMark/oNow` vs live ray `K/oNow` ⟺
   poolMark≥K. All-γ crossover-at-K is the Node DIR_GATE's job (PASS, manager-verified); browser
   confirms γ=2 live. Registration identity verified: `getMP_raw(arbitrageToOracle(pool,K))=K`
   exactly (120000.0000000003), `getSNorm(that)=thetaReg`. `11_bands_table_crop.png` (ITM, oracle
   $130k, SOLD mark 0.3333) + `12_bands_table_OTM_crop.png` (OTM, oracle $100k).
   - GOTCHA: a pure oracle REBASE (kpi-oracle alone, no arb) does NOT cross the strike — it carries
     the position with the frame (poolMark stays fixed, soldITM never flips). That's correct
     (absorbed Finding-2). Must arb to move spot through K.
2. **Chart strike-ray live on the position — PASS (tester-confirmed, rendered).** Curve view: white
   eq-marker on the GH curve; green (put) / red (call) strike rays from origin with trade-dots ON
   them. Rebasing oracle 80k→160k (`08b`→`08c`) **rescales the frame and repositions the rays**
   (live K/oracle), marker stays on curve — no stale entry-θ drift (the absorbed Finding-2). Curve
   is GH continuation, not Balancer weight-form. Drift table (item2_drift in trace): leg.inner
   (entry-frozen θ, sold 1.5 const) vs sNormStrike(pool,K) (live, sold 0.4446→0.0494 across sweep) —
   they diverge post-rebase, confirming the live path is used, not the stale entry value.
3. **Re-based payoff matches the table — PASS (tester-confirmed, exact numeric).** At the live spot
   (r=0) the chart's legFraction == bands-table markEff == rendered DOM mark cell, **|diff|=0.0
   exactly** both legs: SOLD 0.24169229297386294 (DOM 0.2417), BOUGHT 0.2826730030550262 (DOM
   0.2827). Same registered carry basis. Payoff frame is **−90%..+200%** asymmetric (`09_payoff`),
   renders cleanly across the full range, downside floors at $0, free-boundary kink visible at left,
   no NaN/blank/clip. Rebased-160k (`09b`) rescales Y-axis to $375k, still clean. (Payoff chart is
   canvas-only — no DOM data table — so the numeric compare is the page's own legFraction closed
   form vs the rendered table cell; both evaluated live against Store.state.pool.)
4. **No v26b regression — PASS (tester-confirmed, rendered).** Polar mark "Mark Across Strikes"
   (`canvas-pricing`, `07_polar_mark_pricing.png`): green dot (~$80k) and red dot (sold call ~$138k)
   both sit exactly ON their ψ-curves (pink put-wing / teal call-wing), peak 1.0 at the mode —
   continuity through strike, no drift. Bands §5 columns all present & correctly labelled (9 cells/
   comp row, OPEN/CLOSE, headers verbatim in trace.item1_headers). Matches v26b.

### Gotchas learned (v26c)
- chart-select option values: `curve` (canvas-curve, GH pool curve + strike rays), `pricing`
  (canvas-pricing, polar Mark-Across-Strikes — item-4), `trajectory` (canvas-ratio), `payoff`
  (canvas-payoff, the −90%..+200% sim).
- Band validation (#btn-execute disabled): bought PUT K must be < oracle (OTM put); sold CALL K >
  oracle (OTM call). With oracle=$80k: sold 120000 / bought 68000 works; bought 90000 fails
  ("not OTM on put wing"). Needs a perp added first (club.totalNotional>0).
- carry sNorm is INVERSE to price (sNorm ∝ S^−γ): higher K → lower thetaReg. `isOTM`/`wingMember`
  use the PRICE-RATIO leg.inner (K/oracle, ∝S^+1), NOT the carry theta — feeding carry theta to
  isOTM gives wrong answers. v26c keeps entry-checks on price-ratio, value/mark on carry (sNorm(K)).
- Engine API for scripting: `Store.addPerp(side,notional,margin,entryMark)`,
  `Store.openBand(soldWing,boughtWing,{inner,outer},{inner,outer},N,clubSide)`. Page nav via
  `[data-page="portfolio"]`; portfolio subtab `[data-subtab-pf="bands"]`; `render()` is global.

## Prior runs (still-valid context)
- v26b (8df9f8a3…): items 1/2/4 tester-confirmed, item-3 uncapped-vs-capped logic-only (chart window
  too narrow then; v26c's −90..+200 frame now clears the free boundary so legs render past it).
  Seam gate PASS. `evidence/v26b_pw/`.
- v26a: Finding-2 was open (curve/ratio chart ratio-pegged, table dollar-anchored) — **now ABSORBED
  in v26c**: chart rays are live K/oracle, table+chart+settlement all carry-registered at sNorm(K).
  Slippage display PASS, frame re-fit PASS (don't revert), curve = GH continuation.

## File-safety canon
Blob line md5s `ab663f5c…` (webp L74) / `c505b08a…` (svg L1060); 3 `<script>` parse.
HEAD/v26c_full2 build md5 `6cc73563779a3e030774b7597d0ae187`. v26b HEAD `8df9f8a3…`.

## Evidence
- `evidence/v26c_verify_4items/` (2026-06-09): curve_2rays.png, portfolio_perps_subtab.png,
  pw_verify_4items.mjs, pw_stepper.mjs.
- `evidence/v26c_pw/`: 01_inputs, 02_after_execute, 05/06_bands_table, 07_polar_mark_pricing,
  08/08b/08c_curve_strikeray*, 09/09b_payoff_rebased*, 11_bands_table_crop (ITM), 12_bands_table_OTM_crop,
  trace.json. Harness `engine/verify/pw_v26c_visual.mjs`.

# MEMORY — tester
_Last updated: 2026-06-09, after playground-vs-v24 like-for-like live comparison (READ-ONLY, no git). Prior: v26d-vs-v24 curve side-by-side._

## DONE — 2026-06-09 playground (2b20c844) vs v24 (6f606f52) like-for-like (READ-ONLY, no git)
Operator-facing: does the new curve_playground read like-for-like with v24 Balancer? Live Chromium,
reproduced byte-identical x2 (pixel counts + 0 console errors both builds). Both source md5 UNCHANGED
after testing (playground 2b20c844, v24 6f606f52) — truly read-only. Builds:
reference/temporal_curve_playground.html (honest dials γ/δ/βh, default Balancer corner βh=0/δ30/γ1.05,
ghAh 2.05 ghMu -0.360) vs reference/v24_balancer_stable.html.

### KEY FINDING — caveat REFUTED, harder than stated
- v24 LIVE curve = a balanced curved ~45deg hyperbolic sweep through eq (~10 BTC/$800k). nonblank 10023.
- Playground at default γ1.05: LIVE teal curve drops near-vertical left then runs FLAT along the
  bottom-right (hugs axes) — NOT a v24 sweep. nb 11173. The GREY w=1/2 ANCHOR curve (in BOTH builds)
  is what reads ~45deg, not the live curve.
- γ→1.3 (nb 11283) and γ→2 (nb 11558): live curve re-warps but becomes MORE asymmetric
  (steeper-left/flatter-right), NEVER a balanced 45deg. The intern's caveat ("flat at corner, ~45 for
  γ≳1.3") is **REFUTED on the visual** — the live curve does NOT reach v24-style sweep at ANY γ tested.
  Geometry: GH slope = getMP_raw·e^(−ghMu) = price ÷ factor that GROWS with γ → higher γ ⇒ flatter on
  the price-scaled frame (consistent with the γ-gotcha factors 11.7/44.5/749/13780).

### VERDICTS
(a) Balancer-corner like-for-like does NOT hold, AND does not hold at γ≳1.3 either (live curve).
(b) Closest match to v24 = the grey w=1/2 ANCHOR (both builds), NOT the live curve at any γ; of live
    settings γ≈1.3 is least-bad (shown in side_by_side.png).
(c) Dials WORK — PASS. γ/δ/βh steppers re-warp in place (Store.setShape) + redraw all: γ
    1.05→1.3→2 nb 11173→11283→11558; γ-stepper stepUp 2→2.0501 redrew; δ30→5 ghMu −0.360→+1.303 nb
    11283→10853; βh0→0.5 ghBh=0.5 nb→11817; γ floor clamps 1.000 w/ "γ clamped to >1 (locked GH
    family floor)" note. ZERO pageerrors + 0 console.errors BOTH builds BOTH runs. Clean x2.

### Evidence (evidence/playground_vs_v24/) + README.md
v24_curve.png, playground_default.png, playground_g1p3.png, playground_g2.png, side_by_side.png
(labeled L/R), playground_default_full.png, v24_full.png. Harnesses (READ-ONLY):
engine/verify/pw_playground_vs_v24.mjs (capture+pixel+dials+errors), engine/verify/pw_compose_pg_sbs.mjs.
Dial wiring: playground L2884-2931 apply()→Store.setShape(g,d,bh)→render(); DOMContentLoaded-deferred
(TDZ-safe). vk-gamma stepper step .05 min 1.0001 default 1.05 (L1448).

_Last updated: 2026-06-09, after v26d-vs-v24 curve apple-to-apple side-by-side (READ-ONLY illustration). Prior: v26d curve-FRAMING explainer (a406a751)._

## DONE — 2026-06-09 v26d (GH) vs v24 (Balancer) Pool-Curve side-by-side (READ-ONLY, no git)
Task: direct apple-to-apple side-by-side of the live Pool-Curve chart, v24 reference vs current, so
the GH-vs-Balancer visual difference is plain. Live Chromium, 0 pageerrors both builds. Both builds
md5-confirmed UNCHANGED before+after (v26d a406a751, v24 upload 6f606f52) — truly read-only.

- **v24 LOADED FROM OPERATOR'S UPLOAD PATH** `/root/.claude/uploads/ef05e72b-…/4f8ec7e5-temporal_mvp_v24_rebase_fixed_2_1.html`
  (md5 6f606f52, byte-IDENTICAL to repo fallback engine/builds/temporal_mvp_v24_rebase_fixed_2.html
  — verified, so fallback would have been equivalent). Current = engine/builds/temporal_mvp_v26d_volknob.html.
- Both: curve view is default-active canvas-wrap (`canvas-curve` 700×460) on default Transact page —
  loads on open, no nav needed. v24 draws via curveTraceExplicit(snap.w,…) (Balancer weight-form);
  v26d via curveTrace→Engine.arbitrageToOracle (GH native). Same canvas IDs across both.
- Measured (page's own Engine, reproduces prior framing run): eq 10 BTC/$800k, oracle $80k, γ≈3,
  frame eq×3 = 30 BTC/$2.4M. GH live curve real range x 5.0–2890.7 BTC, y $400,000–$817,822. v24
  canvas nonblank 10027, v26d 11093 (both render).

### Deliverables (evidence/v26d_vs_v24_curve/) + README.md — all 4 visually confirmed
1. `v24_curve.png` — Balancer: visibly curved ~45° hyperbolic sweep through eq.
2. `current_curve.png` — GH: live teal curve reads nearly FLAT at ~$800k; grey w=½ anchor curve
   drives the $2.4M y-axis (anchor present in BOTH builds).
3. `side_by_side.png` — labelled L/R ("v24 — Balancer weight-form" / "current (v26d) — GH native");
   difference obvious at a glance.
4. `current_slope_corrected.png` — SAME GH data, y-axis auto-fit to curve range (y $392k–$834k,
   x 0–2949 BTC): a genuine well-formed hyperbola. Proves it IS a real curve, ~44× shallower in
   price-scaled axes (γ=2 gotcha |dy/dx|=getMP_raw·e^(−μ) = price÷~44.5; manager-verified, SHOWN not proven).

VERDICT: illustration delivered, 4 PNGs + README, thesis SHOWN (GH-native curve flattens because
geometric slope = price÷~44.5 while both frames scale to price). READ-ONLY clean, no engine edit.
Harnesses (READ-ONLY): engine/verify/pw_v26d_vs_v24_curve.mjs, engine/verify/pw_compose_sbs.mjs.

_Last updated: 2026-06-09, after v26d curve-FRAMING explainer (build a406a751, READ-ONLY illustration). Prior: v26d TDZ-FIX RE-TEST (all PASS)._

## DONE — 2026-06-09 v26d Pool-Curve FRAMING explainer (build a406a751, READ-ONLY, no git)
Task: explainer screenshots showing the live GH pool curve LOOKS flat because a tall (eq×3) frame
squishes a real bounded curve + cuts the bend off the right. Build md5 a406a751 confirmed unchanged
before AND after (truly read-only). Live Chromium, 0 pageerrors, ranges byte-reproduced ×2 (not flaky).
Extracted the page's OWN curve points (reproduced `curveTrace` via Engine.arbitrageToOracle over
mp0·e^(−6..6); anchor via w=½ + Engine.getDepth) and re-plotted on fresh canvases.

### Numbers (confirmed/corrected the manager's)
- Equilibrium (10 BTC, $800k); oracle $80k; γ(ghAh)=3.0019. Frame = eq×3 = (30 BTC, $2.4M).
- Live GH curve y-span $400,000–$817,822 (✓ ~$400k–$818k). x-span 5.00–2890.7 BTC
  (manager said ~2874; measured **2891** at e^+6 endpoint — minor correction).
- Visible window x≤30: $ moves $778,862→$817,822 = **~$39k** (manager said ~$30k — minor correction).
  Both corrections CONFIRM the thesis. The real bend is at x≫30 BTC, off the right edge.
- Vol-deform: σ=0.20→γ≈2.16 (bends early), σ=0.10→γ≈3.70 (bend pushed far right); curve visibly reshapes.

### Deliverables (evidence/v26d_curve_framing/) + README.md
- `as_is.png` (dashboard context) / `as_is_canvas.png` (700×460 chart): flat-looking teal = live GH
  curve; grey = w=½ anchor (drives the $2.4M y-axis); green/red dashed = strike rays; white = eq.
- `same_data_two_frames.png` (KEY): (a) current frame [0–30 BTC, 0–$2.4M] flat; (b) auto-fit
  [0–3006 BTC, $384k–$834k] = genuine bending GH curve. SAME extracted data.
- `visible_window_zoom.png`: x≤30, y auto-fit $773k–$824k — a gentle bend, NOT literally flat.
- `deforms_with_vol.png`: two vols on shared axes, curve reshapes with σ.
- Harness `engine/verify/pw_v26d_framing.mjs` (NEW). Method caveat: frame re-fits eq×3 each draw so
  __curveFrame can't be overridden — extract+replot. UI `snapshot`/`Viz` not bare-reachable in
  evaluate (Engine/Store ARE); rebuild snap with Engine.getDepth or the w=½ anchor comes back empty.

VERDICT: explainer delivered, all 4 screenshots + README; manager's framing thesis CONFIRMED, two
round numbers corrected upward (x-top 2891 not 2874; window-$ ~$39k not ~$30k). READ-ONLY clean.


## DONE — 2026-06-09 v26d vol-knob TDZ-FIX RE-TEST (build a406a75149b1606d7822b4f2bbcc4f84, READ-ONLY) — FINDING-V26D-1 RESOLVED
md5 confirmed a406a751 before testing (NEW, post-fix). Fix verified in source: L2960 is now
`window.addEventListener('DOMContentLoaded', apply)` (was bare `apply()`) — the init draw is deferred
past `const Viz` (L3444). **RESULT: PASS on every must-pass + regression item. The TDZ blocker is
gone.** Reproduced byte-identical across 2 runs in all 3 harnesses. Live Chromium.

### Per-item FLAG table (build a406a751)
1. **No TDZ / no console errors — PASS.** loadErrCount=0, totalErrs=0 at load AND on every sigma
   change AND view switch (was 9 throws/run before). `page.on('pageerror')` + console-error capture
   both clean ×2. NOTE: `typeof Viz`/`typeof render` still read "undefined" IN page.evaluate — this
   is a SCOPE ARTIFACT, not TDZ: Viz is a top-level `const` (L3444) and render a top-level
   `function` (L4339) in classic `<script id=ui>`, NOT on window, so bare names aren't reachable in
   evaluate's wrapper (same caveat as the v26c stepper note). Proof they ARE defined+bound: the curve
   renders, the chart-select listener WORKS (payoff nonblank=111600 on view switch), no pageerror.
   A TDZ would surface as an uncaught pageerror — there is none.
2. **Canvases RENDER on load — PASS.** canvas-curve nonblank=11081/322000 (was 0). 4 canvases:
   curve(700x460), pricing(900x380), payoff(900x420, nonblank=111600), ratio(500x500). Dashboard
   shot `p1_fixed_A_dashboard_full.png` shows GH hyperbola + labelled axes + white eq-marker on curve
   + green/red strike rays. Isolated curve crop `p1_fixed_E_canvas_curve_NONBLANK.png` (32612 b, was
   1486 b uniform-blank) visually confirms GH continuation (not Balancer weight-form, not blank box).
3. **σ-dial re-warps LIVE curve — PASS.** σ0.129→g2.0019 (def), σ0.30→g1.0001 (floor, flatter
   curve), σ0.08→g3.4843 (steeper). curveChanged_hi=true, curveChanged_lo=true (pixel sums
   5561496→5657921→5743750 distinct). γ read-out updates each time. Shots `_F_curve_sigma030`
   (visibly flatter), `_G_curve_sigma008`.
4. **★ pro-forma dotted + stepper re-trace after σ — PASS (was INCONCLUSIVE).** Drove the REAL
   band-builder (Store.addPerp long 100k; band-notional=1, sold-inner 120k/outer 140k, bought-inner
   68k/outer 50k → previewBand via the bound input listener). `__previewBand` live w/ leg1State,
   sold/bought thetas 0.3807/1.8829. Stepper: step1 pool x=6.102 (active1) vs step2 pool x=5
   (active2), distinct pixel sums 5588946 vs 5659008. After σ→0.25 (ghAh 3.0019→2.0001): the
   pro-forma re-traces (thetas recompute 0.6173/1.3718 on the NEW shape, pixels change), still
   present, and the stepper STILL toggles distinct shapes. Shots `_K_step1/_L_step2/_M_after_sigma/
   _N_step1_after_sigma`.
5. **Curve/portfolio/payoff redraw under open band on σ — PASS.** With band open, σ→0.20: curve
   redrew (5636992→5710569), payoff redrew (51273249→51283952), portfolio NaN-scan clean
   (hasNaN=false, hasInfinity=false, poolFinite=true, ghAh 2.158). No stale curve. Shot
   `_J_band_open_after_sigma`.
- Regression re-confirm (still PASS): panel renders w/ 5 number steppers (vk-sigma .005/rate .01/
  gamma-raw .05/delta-raw .01 + unlock checkbox); S* tracks K·γ/(γ+1): out $53,350 ==
  80000·2.0019/3.0019=53350.21; lock/unlock toggle (Perpetual-option mode ↔ Free shape off-theory,
  sigma/gamma-raw enable flip); γ>1 floor clamps σ=5→γ1.0001 w/ note, mpFinite, ghAh 2.0001.

VERDICT: **PASS — FINDING-V26D-1 is RESOLVED. v26d a406a751 is visually sound; ship-clear from the
tester side.** The DOMContentLoaded deferral fixed the load-order TDZ; zero uncaught errors, all
canvases render and re-warp live, and the pro-forma/stepper item that was inconclusive is now fully
confirmed against a real band. Browser-confirmed (live Chromium), not fallback.

### Harnesses (engine/verify/, READ-ONLY) — build a406a751
- `pw_v26d_diag.mjs` (reused, unchanged) — decisive: loadErrCount=0, canvas nonblank=11081, sigma
  change fires no new error, canvas re-warps.
- `pw_v26d_fixed.mjs` (NEW) — full per-item: errors/canvases/sigma-rewarp/stepper/band/regression.
- `pw_v26d_item4.mjs` (NEW) — REAL band-builder pro-forma+stepper re-trace after sigma (item 4).
- `pw_v26d_shots.mjs` (reused) — regression screenshots; canvasNonblank now 11081 (was 0).
- Env unchanged: pw 1.56.1 `/opt/node22/lib/node_modules`, ESM `import pkg from`; chrome
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`.
- Evidence `evidence/v26d_volknob_ui/`: p{1,2}_fixed_A..N_*.png (all 420-434 KB, NOT blank),
  p1_fixed_E_canvas_curve_NONBLANK.png (32612 b). Old p*_E_..._BLANK.png are from the prior FAIL run.

---

## SUPERSEDED — 2026-06-09 v26d vol-knob LIVE-BROWSER verify (build 16a872ba33e38843b803d79667b199f5, READ-ONLY)
_(This FAIL run is the PRIOR build; FINDING-V26D-1 below is now RESOLVED in a406a751 — see top block.)_
Live Chromium. Manager had Node-verified (blobs/gates green). My job: live UI behaviour Node can't see.
**RESULT: FAIL — the build is visually broken. A TDZ load-order bug blanks ALL canvases and never
defines `Viz`/`render`.** Reproduced clean x2 (byte-identical state both runs).

### FINDING-V26D-1 (FAIL, blocker — NOW FIXED): vol-knob IIFE runs render() before `const Viz` initialises
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
- FIX APPLIED (intern): L2960 changed to `window.addEventListener('DOMContentLoaded', apply)` so the
  init draw runs after `const Viz` is initialised. Re-tested PASS (top block, build a406a751).

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

VERDICT (prior build): FAIL — do NOT ship 16a872ba. Items 1/3/6/7 PASS (panel + read-outs); items
2/4/5/8 FAILed on render. RESOLVED in a406a751 (see top).

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
v26d vol-knob build md5 `a406a75149b1606d7822b4f2bbcc4f84` (TDZ-fixed, tester-confirmed).

## Evidence
- `evidence/v26d_volknob_ui/` (2026-06-09): p{1,2}_fixed_A..N_*.png (TDZ-fix re-test, all non-blank),
  p1_fixed_E_canvas_curve_NONBLANK.png; harnesses pw_v26d_fixed.mjs / pw_v26d_item4.mjs /
  pw_v26d_diag.mjs. Old p*_*_BLANK.png from the prior FAIL run.
- `evidence/v26c_verify_4items/` (2026-06-09): curve_2rays.png, portfolio_perps_subtab.png,
  pw_verify_4items.mjs, pw_stepper.mjs.
- `evidence/v26c_pw/`: 01_inputs, 02_after_execute, 05/06_bands_table, 07_polar_mark_pricing,
  08/08b/08c_curve_strikeray*, 09/09b_payoff_rebased*, 11_bands_table_crop (ITM), 12_bands_table_OTM_crop,
  trace.json. Harness `engine/verify/pw_v26c_visual.mjs`.

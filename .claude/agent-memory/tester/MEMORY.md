# MEMORY — tester
_Last updated: 2026-06-09, after CLEAN-OPEN confirm (playground dbbcc79b, READ-ONLY, no git) — anchor=curveTrace(snap) + suggestStrikes() commented at init. ALL 4 PASS. Prior: BEHAVIORAL SWEEP (b9e7d907), RAY-DIRECTION diagnosis (f7fecff4)._

## DONE — 2026-06-09 CLEAN-OPEN confirm (playground dbbcc79bcfe6e41c1f66de275b20dd38, READ-ONLY)
Two changes to verify: (a) anchor now = curveTrace(snap) (GH ref, coincides w/ live curve);
(b) suggestStrikes() commented out at init (blank strike inputs, no preview band on open). Live
Chromium. Source md5 dbbcc79b UNCHANGED after testing (truly read-only; git shows only new harness +
evidence untracked). errs:[] (0 pageerror + 0 console.error) for the WHOLE run. **ALL 4 PASS.**

### ITEM 1 — clean open + usable: **PASS**
- On load: __previewBand=null; sold-inner/bought-inner/band-notional ALL blank "". No throw.
- Pool curve (canvas-curve 700x460) clean teal/pink GH: teal 626 / pink 636, **green 0 / red 0**
  (zero preview-band ray overlay). clean_open.png: teal upper + pink lower wings, grey anchor line,
  grey mode ray, white eq dot on curve, NO green/red band. errs:[] at open.
- Blank inputs do NOT throw (previewBand bails clean when inputs empty → __previewBand stays null,
  bare curve draws). Confirmed.

### ITEM 2 — anchor coincides w/ live + reshapes together: **PASS**
- SOURCE (L3504-3505): `anchorPts = curveTrace(snap)` and `livePts = curveTrace(snap)` are the
  IDENTICAL call on the same snapshot → exactly the same locus by construction. Anchor drawn grey
  (drawCurvePts(anchorPts,false,0.4,colTertiary) L3602) BEHIND the colored live curve (alpha 1.0
  L3604). One curve; grey sits under teal/pink. (Was Balancer w=1/2 weight-form; comment L3504
  records the change.)
- snap carries shape params (γ/δ/βh) → changing γ dial reshapes BOTH (they're the same trace).
  γ 1.05→2.0: live curve visibly re-warps (pink put wing extends, pink px 636→921, teal 626→640),
  readout→2.000. gamma_reshaped.png. Anchor inherits identically (same call). GH trades slide the
  point not reshape — confirmed it renders as ONE overlapping locus, not two diverging curves.

### ITEM 3 — band still buildable manually: **PASS**
- suggestStrikes() commented (L4630) only removed the pre-fill; band machinery intact. Added a perp
  (Store.addPerp) to leave empty-state, switched to Trade-Bands subtab, entered sold-inner 84000 /
  bought-inner 68000 / notional 0.05 (dir=long default → sold=call, bought=put), dispatched input+
  change → previewBand() fired.
- __previewBand built: exists=true, hasLeg1=true, sold_wing=call, bought_wing=put, exec NOT disabled,
  no warn. Curve scan w/ preview: green 843 / red 599 (dotted rays/legs appear). band_preview.png.
- Executed via #btn-execute click: Store.state.bands 0→1, open-band dashed rays render.
  band_executed.png (header band-count incremented). Band creation works end-to-end.

### ITEM 4 — dials work + labels: **PASS**
- Labels (L1448-50): "γ convexity" / "δ ATM smoothing" / "βh skew". Readouts γ/δ/βh update.
- δ 30→5: curve reshapes (teal 232→101, pink 207→313), readout 5.000. βh 0→0.5: reshapes again
  (teal→247, pink→321), readout 0.500. γ already shown item 2. All redraw all graphs. dials_delta_betah.png.

### Harness + evidence
- engine/verify/pw_playground_clean_open.mjs (NEW, READ-ONLY) — clean-open pixel scan + console
  capture, γ reshape, manual band build+execute, δ/βh reshape+labels. Pool curve = canvas-curve.
- PIXSCAN gotcha: count on-canvas teal #0ABAB5 / pink #FF85B0 / green #14E800 / red #FF6767;
  green/red = band STRIKE RAYS (drawStrikeRay sold=red colShort / bought=green colLong), present
  only when a band exists → green0/red0 IS the clean-open proof.
- BAND-BUILD gotcha: need a perp first (empty-state) before band executes; inputs sold-inner/
  bought-inner/band-notional have input+change listeners → previewBand()+render(); exec=#btn-execute.
- Evidence (evidence/playground_clean_open/): clean_open.png, gamma_reshaped.png, band_preview.png,
  band_executed.png, dials_delta_betah.png.
VERDICT: **PASS x4, console clean.** Clean open (no preview band, blank inputs don't throw), anchor=
live curveTrace(snap) coincide+reshape together, band manually buildable+executable, dials reshape
all graphs w/ correct labels. No engine edits, no git. Tester-confirmed (live Chromium).

## File-safety canon
Blob line md5s `ab663f5c…` (webp L74) / `c505b08a…` (svg L1060); 3 `<script>` parse.
HEAD/v26c_full2 build md5 `6cc73563779a3e030774b7597d0ae187`. v26b HEAD `8df9f8a3…`.
v26d vol-knob build md5 `a406a75149b1606d7822b4f2bbcc4f84` (TDZ-fixed, tester-confirmed).
Playground (clean-open) md5 `dbbcc79bcfe6e41c1f66de275b20dd38` — anchor=curveTrace(snap), blank-input open, dials reactive.
Playground (honest revert) md5 `f7fecff4c62b028134190a222167e088` — wings teal-call/pink-put.

## Prior runs (still-valid context) — see git history for full v26a/b/c/d + playground tester runs.
- BEHAVIORAL SWEEP (b9e7d907 vs v24 6f606f52): preview-ray fix CONFIRMED (price-space K/oracle,
  matches open ray + v24, no crossing); PART-B graphs match v24 apart from intended diffs.
- RAY-DIRECTION (f7fecff4): preview ray WAS inverted/wing-swapped (carry sNorm vs price K/oracle);
  fixed in b9e7d907.
- HONEST-REVERT (f7fecff4): wing colors teal-call/pink-put restored; dials reshape all graphs.
- v26c (6cc73563): items 1-4 tester-confirmed (bands cross@K, live ray, payoff==table, polar mark).
- v26d (a406a751): TDZ fix RESOLVED, all canvases render + re-warp live, clean x2.
- Env: global pw 1.56.1 /opt/node22/lib/node_modules; ESM `import pkg from '.../playwright/index.js';
  const {chromium}=pkg;`; executablePath /opt/pw-browsers/chromium-1194/chrome-linux/chrome;
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers. Engine/Store reachable in evaluate; bare UI fn names
  (snapshot/curveTrace/Viz/render) NOT reachable; window.Viz UNDEFINED.

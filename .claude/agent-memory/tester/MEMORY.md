# MEMORY — tester
_Last updated: 2026-06-09, after BEHAVIORAL SWEEP (playground b9e7d907 vs v24, READ-ONLY, no git) — preview-ray fix CONFIRMED + PART-B graphs match v24. Prior: RAY-DIRECTION diagnosis (f7fecff4), HONEST-REVERT 3-item verify._

## DONE — 2026-06-09 BEHAVIORAL SWEEP (playground b9e7d907a5635428f02cb32c29dc2b3b vs v24 6f606f52, READ-ONLY)
Final sweep: confirm the preview-ray fix landed + behavioral-diff the OTHER graphs vs v24. Live
Chromium, both source md5 UNCHANGED after testing (truly read-only, git clean). errs:[] both builds.
**ALL PASS** — the inverted/wing-swapped preview ray I diagnosed last run is FIXED; PART-B graphs
behave like v24 apart from intended diffs.

### PART A — preview-ray fix: **PASS**
- SOURCE fix (L3676-3687): preview block now feeds `liveRayTheta(p.sold.K_inner,p.sold.K_outer)` =
  K/oracle (PRICE space), SAME basis as open-band loop (L3666-3674). Old buggy `leg*_theta_star`
  (carry/sNorm space) gone from canvas path. Exactly the L3678-3679 fix I localized last run.
- DIRECTION (probe rawSlope, mode=80000): CALL preview baseline 84000 (>mode, call side); call up
  84000->92000 (STEEPER, further up call side) — matches v24 exactly (v24 84000->92000). Old carry
  basis (still computable for contrast) 78642->76146 (below mode=wrong put side, DECREASING) confirms
  inversion no longer drives canvas. Call-DECREASE->76000 ⇒ preview=null (band rejected ITM/wrong-wing,
  ray vanishes — expected, same as prior run).
- PIXELS: A_pg_0/1 — RED dotted call ray ABOVE grey mode ray (call side) + rotates UP/steeper on
  increase; GREEN dotted put ray BELOW mode (put side). Matches v24 A_v24_1 direction.
- NO-CROSSING: after Execute, open-band DASHED call ray (84000) + re-armed preview DOTTED call ray
  (86000) BOTH call side above mode, fanned same way, NO crossing (A_pg_3_open_plus_preview.png).
  The visual contradiction the operator saw is resolved.
- DIAL LABELS: "γ convexity" / "δ ATM smoothing" / "βh skew" (L1448-1450). hasSteepness=false,
  hasKurtosis=false. PASS.

### PART B — behavioral diff vs v24: **PASS (only intended diffs)**
- PRICING (Mark Across Strikes): structurally identical — same axes (mark 0-1.00 y; "strike polar
  angle φ / $K via lens" x with identical $ ticks 21,436/46,188/80,000/138,564/298,564), same dual
  wing (pink put rising->mode, teal call falling), peak 1.00 @ φ_m near 45/$80k, green put dot + red
  call dot w/ drop-lines. Only diff: v24 has a DOTTED reference overlay hugging the solid; pg shows
  the registered GH solid (mode mark @ K=$80k). Intended GH/registration/mark diff. No unexpected
  structural divergence.
- PAYOFF: same axes ("Position equity $" y, "Perp mark price % change from entry" x), same objects
  (teal payoff floor->kink->linear, grey comparison line, dashed mode/liq markers, dotted h-ref). Two
  intended diffs ONLY: x-range pg -50%..+200% vs v24 -50%..+50% (confirmed wider); carry-based marks
  (kink/marker cluster position). y auto-scales ($18,371 vs $5,400) as consequence of wider x.
  Nothing else off.
- PORTFOLIO TABLE: same v24 structure (1 summary/band + <=4 component + total, <=6 rows). Columns
  match modulo intended registration: v24 "Entry equity / Orig strike" + "Attrib P&L / Eff strike";
  pg "Entry equity / Strike" + "Attrib P&L" — pg DROPPED the "Eff strike" sub-column (L4459: "Eff
  strike dropped — under from-strike intrinsic it always equals [orig]") and renamed Orig->Strike.
  Intended registration diff, NOT an unexpected divergence.
- CONSOLE: clean — errs:[] both builds (0 pageerror + 0 console.error). (drawTrajectory byte-identical
  to v24 per brief — skipped.)

### Harnesses (engine/verify/, READ-ONLY) + evidence (evidence/playground_v24_behavioral/)
- pw_playground_v24_behavioral.mjs (PART A dir+labels + PART B chart/table probe both builds),
  pw_playground_ray_coexist.mjs (Execute->open+preview ray same-side/no-cross probe).
- PNGs: A_pg_0_baseline / A_pg_1_call_increase / A_pg_2_call_decrease / A_pg_3_open_plus_preview /
  A_v24_0_baseline / A_v24_1_call_increase / B_{pg,v24}_pricing / B_{pg,v24}_payoff.
VERDICT: preview ray FIXED (price-space, matches open ray + v24, no crossing); labels right; PART-B
graphs behave like v24 apart from intended curve/registration/mark/x-range diffs. No engine edits, no
git. Tester-confirmed (live Chromium).

---
_Last updated: 2026-06-09, after RAY-DIRECTION diagnosis (playground f7fecff4 vs v24, READ-ONLY, no git). Prior: HONEST-REVERT 3-item verify._

## DONE — 2026-06-09 RAY-DIRECTION diagnosis (playground f7fecff4 vs v24 6f606f52, READ-ONLY)
Operator: "strike rays on pool curve move WRONG direction as strike changes." Real bug or convention?
Live Chromium, both source md5 UNCHANGED after testing (truly read-only). VERDICT: **REAL INVERSION
in the playground PREVIEW ray** (not just a convention diff). Two distinct bugs, both in the *preview*
overlay only — the OPEN-band (post-Execute) ray is CORRECT.

### THE FINDING — preview ray uses sNorm-space theta_star (∝ S^−γ, DECREASING in K) ⇒ inverted+swapped
- drawStrikeRay (L3624): rawSlope = theta·oracle; mode ray slope = beta/alpha = 80000 (=oracle, ATM).
  Call wing = steep/upper (slope>mode); put wing = shallow/lower (slope<mode).
- PREVIEW path (L3678-3679) draws p.leg1_theta_star/leg2_theta_star = sim.legN.theta_star, which in
  v26c comes from regLeg→sNormStrike (CARRY space, sNorm ∝ S^−γ). sNorm DECREASES as K rises (γ>1).
- OPEN-band path (L3664-3670) draws liveRayTheta = K/oracle (PRICE space). rawSlope = K, INCREASES in K.
- So the SAME band's preview ray and executed ray move in OPPOSITE directions, and the preview ray is
  on the WRONG wing side.

### Default band: dir=long ⇒ sold=CALL (red colShort), bought=PUT (green colLong). oracle 80000.
suggestStrikes(): call K=84000 (1.05·ora), put K=68000 (0.85·ora), N=0.05. Preview band exists at load.

### TABLE — PREVIEW rawSlope (mode=80000). [drawn = what the curve shows]
                 baseline   K↑ (×↑8000)   side vs mode     direction      ECON-correct?
PLAYGROUND CALL  78642      76146 (↓)      78642 < 80000    SHALLOWER↓     NO (higher call→shallower & on PUT side)
PLAYGROUND PUT   84621      81442 (↓)      84621 > 80000    toward mode    SWAPPED (put ray on CALL side)
V24 CALL         84000      92000 (↑)      84000 > 80000    STEEPER↑       YES (call side, steeper)
V24 PUT          68000      76000 (↑)      68000 < 80000    toward mode↑   YES (put side)
(Playground call-DECREASE 84000→76000 ⇒ K now ITM/wrong-wing ⇒ preview rejected → ray vanishes.)
(Playground put values are the GREEN bought leg; theta* 0.983/1.058 carry-space vs v24 1.05/0.85 price.)

### OPEN-BAND path (playground, after Execute) — CORRECT
B1 sold_wing=call sold_rawSlope=84000 (>mode, call side); bought_wing=put bought_rawSlope=68000
(<mode, put side). pg_open_band.png shows the DASHED open rays correct AND the DOTTED preview rays
inverted crossing them — the visual contradiction the operator likely saw.

### VERDICTS
1. INVERTED vs v24: YES, in the PREVIEW ray. Increasing call strike moves playground preview ray
   SHALLOWER; v24 moves it STEEPER. Opposite.
2. CALL/PUT WING SWAP: YES, in preview. Playground's "call" (red) ray sits BELOW mode (put side);
   its "put" (green) ray sits ABOVE mode (call side). v24 has them correct (call above, put below).
3. ECON-sensible: v24 yes (higher call = further up call wing); playground preview no.
4. ROOT CAUSE: v26c-full registered theta_star in carry/sNorm space (∝ S^−γ) but the ray-draw slope
   formula rawSlope=theta·oracle assumes PRICE-space theta (K/oracle). The open-band path was patched
   to liveRayTheta=K/oracle; the PREVIEW path (leg*_theta_star) was NOT — it still feeds sNorm theta*.
   So preview is inverted; open-band is right. NOT a benign convention diff.
   FIX LOCALIZATION for intern: playground L3678-3679 preview drawStrikeRay calls feed
   p.leg1_theta_star/p.leg2_theta_star (carry sNorm); they should feed a price-space ray
   (K/oracle composite, like liveRayTheta) so preview matches the open-band ray + v24 direction.
   This is a DISPLAY-only ray-draw basis mismatch (engine pricing untouched).

### Evidence (evidence/ray_direction/) — Read into panel: pg_0_baseline, pg_1_call_increase,
pg_open_band, v24_0_baseline, v24_1_call_increase. Also pg_2_call_decrease (preview vanishes),
pg_3/4_put_increase/decrease, v24_2/3/4. Harnesses (READ-ONLY): engine/verify/pw_ray_direction.mjs
(drives sold-inner/bought-inner inputs, reads preview theta*/rawSlope + screenshots before/after),
engine/verify/pw_ray_open.mjs (Execute via JS click → open-band rawSlope=K probe).
FLAG to manager: this is a real bug to fix (preview ray inverted/wing-swapped), escalate fix scope —
display-only, intern-localizable to L3678-3679. NOT a convention to merely document.

---

## DONE — 2026-06-09 playground HONEST REVERT verify (md5 f7fecff4c62b028134190a222167e088, READ-ONLY)
Operator cared about 3 things after the distorting display-rescale was REVERTED (drawCurve back to
honest native render). Live Chromium, reproduced clean x2 (identical numbers + errs:[] both runs).
Source md5 f7fecff4 UNCHANGED after testing (truly read-only). ALL 3 PASS + clean console.

### ITEM 1 — wing colors RESTORED: **PASS**
- drawCurve L3464: live curve drawn fixedColor=null -> curveSegmentColor (L3562): y/x>modeSlope =>
  colCall #0ABAB5 (teal), else colPut #FF85B0 (pink). modeSlope=beta/alpha=80000.
- DECISIVE pixel proof (bands blanked so only the bare curve draws — blank sold-inner/bought-inner/
  -outer inputs => previewBand() sets __previewBand=null and Viz.drawAll(s,null)): call wing 8/8
  samples #0ABAB5 TEAL, put wing 25/25 #FF85B0 PINK; clean histogram teal 720px / pink 732px,
  **green 0 / red 0** on the curve. NOT green/orange. colors_restored_clean.png shows teal upper
  (call) + pink lower (put) wings, grey w=1/2 anchor + grey mode ray behind, white eq dot on curve.
- GOTCHA: a naive "most-saturated pixel within +-3px" probe FALSELY reads green(#14E800)/red(#FF6767)
  because those are the band STRIKE RAYS + leg overlay (drawStrikeRay L3624, sold=colShort red /
  bought=colLong green; default __previewBand exists at load, step2). They are NOT the curve — they
  vanish when bands are blanked. Sample ON the curve coords + match-to-nearest teal/pink to be sure.

### ITEM 2 — cross-graph reactivity: **PASS** (dial -> Store.setShape -> render -> redraw ALL)
Dials vk-gamma/vk-delta/vk-betah (L1448-1450, apply() L2900 -> Store.setShape(g,d,bh) -> render()).
- gamma 1.05->2.0 on POOL CURVE: sig 20663652->21345183 (delta 681531), nb 10630->11005. Curve
  VISIBLY re-warps: teal call wing climbs steeper/tighter, pink put wing extends flatter/further
  right (higher-gamma GH shape), eq dot stays ~fixed at (10 BTC,$800k). cross_curve_before/after_gamma.
- delta 30->5 on PRICING (Mark Across Strikes): sig 20781342->22691557 (delta 1910215), nb
  10327->11309. New dotted curve + pink curve reshapes (kurtosis). cross_pricing_before/after_delta.
- betah 0->0.5 on PAYOFF: sig 221352018->221403354 (delta 51336, small but nonzero), nb
  106821->106837. cross_payoff_before/after_betah. All 3 changed=true, ALL nonblank.
- readouts after: gamma 2.000 / delta 5.000 / betah 0.500 / S* $53,333.

### ITEM 3 — honest curve + side-by-side: **PASS** (no distortion)
side_by_side_honest.png (labelled L=v24 Balancer / R=playground GH). Both render (pg nb 10630, v24
nb 9618), 0 pageerrors both. Both curves pass through eq (~10 BTC,$800k) on the SAME eq*3 native
frame. v24 = symmetric well-rounded hyperbolic sweep (Balancer weight-form). Playground GH native =
teal call wing climbs steeper/narrower near mode, pink put wing extends further/flatter — the TRUE
gamma-dependent GH shape (carry-registered), distinctly different from v24, NOT faked. (NB sbs PNG's
right panel shows the default-band rays/overlay since the sbs harness didn't blank bands; the bare
honest wing shape is in colors_restored_clean.png.)

### ITEM 4 — console: **PASS clean x2.** errs:[] (0 pageerror + 0 console.error) both full runs.

### Harnesses (engine/verify/, READ-ONLY — no engine edits)
- pw_playground_honest.mjs (NEW) — item1 wing pixel-sample + item2 cross-graph sig/nb deltas x2 + errs.
- pw_playground_sbs.mjs (NEW) — element-screenshot both curves + compose labelled side_by_side.
- Env: pw 1.56.1 global /opt/node22/lib/node_modules, ESM `import pkg from '.../playwright/index.js';
  const {chromium}=pkg;`; executablePath /opt/pw-browsers/chromium-1194/chrome-linux/chrome;
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers.
- PLAYGROUND GOTCHAS: snapshot()/curveTrace()/Viz are top-level UI consts/fns NOT reachable by bare
  name in page.evaluate, and window.Viz is UNDEFINED — to clear the default preview, blank the band
  inner/outer strike INPUTS (dispatch change) so previewBand() nulls __previewBand + draws bare curve.
  Engine/Store ARE reachable; pool object carries ghP/ghNx/ghNy/ghM/ghMu + alpha/beta/x/y so
  Engine.arbitrageToOracle(pool,o)/getMP_raw(pool) reproduce curveTrace directly.

### Evidence (evidence/playground_honest/)
colors_restored.png (as-rendered w/ rays), colors_restored_clean.png (KEY: bare teal/pink wings),
cross_curve_before/after_gamma.png, cross_pricing_before/after_delta.png,
cross_payoff_before/after_betah.png, side_by_side_honest.png, _pg_curve.png/_v24_curve.png (sbs src).

VERDICT: **PASS x3 + clean console.** Honest revert confirmed live: wing colors are teal-call/
pink-put again (NOT green/orange), every dial reshapes the pool curve AND the pricing/payoff views,
and the native curve renders un-distorted next to v24. Tester-confirmed (live Chromium).

---

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

## File-safety canon
Blob line md5s `ab663f5c…` (webp L74) / `c505b08a…` (svg L1060); 3 `<script>` parse.
HEAD/v26c_full2 build md5 `6cc73563779a3e030774b7597d0ae187`. v26b HEAD `8df9f8a3…`.
v26d vol-knob build md5 `a406a75149b1606d7822b4f2bbcc4f84` (TDZ-fixed, tester-confirmed).
Playground (honest revert) md5 `f7fecff4c62b028134190a222167e088` — wings teal-call/pink-put, dials reactive.

## Prior runs (still-valid context) — see git history for full v26a/b/c/d tester runs.
- v26c (6cc73563): items 1-4 tester-confirmed (bands cross@K, live ray, payoff==table, polar mark).
- v26d (a406a751): TDZ fix RESOLVED, all canvases render + re-warp live, clean x2.
- Env gotcha: global pw at /opt/node22/lib/node_modules; ESM `import pkg from`; chrome explicit
  executablePath /opt/pw-browsers/chromium-1194/chrome-linux/chrome. Engine/Store reachable in
  evaluate, bare UI fn names (snapshot/Viz/render) are NOT.

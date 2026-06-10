# MEMORY — tester
_Last updated: 2026-06-10, after live v24-kurtosis curve-warp slider browser confirmation._

## DONE — live v24-kurtosis browser confirmation (build 40bfe4b2…, branch claude/v24-kurtosis-migration)
Ran **live Playwright Chromium** against `builds/reference/temporal_mvp_v24_kurtosis.html`
(md5 `40bfe4b229ab948cd188f3722b2ddb42`, READ-ONLY — edited nothing). τ-generalized variant of the
v24 Balancer build. File-safety spot-check: 3 `<script>` parse, 2 blobs at L74 (webp 273917) /
L1060 (svg 5240). NOTE: this is a *reference* build, NOT the v26c HEAD — its blob line-md5s are NOT
the v26c canon (`ab663f5c…`/`c505b08a…`); did not assert those here, structural integrity is the bar.

### Harnesses (both READ-ONLY, under engine/ so `import 'playwright'` resolves)
- `engine/verify/pw_v24_kurtosis.mjs` — main: screenshots + chord-sagitta bend metric.
- `engine/verify/pw_v24_kurtosis_probe.mjs` — SUPPLEMENT: the proper geometry lens (see gotcha).
Repro: `cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v24_kurtosis.mjs`
(then `..._probe.mjs`). Chromium at `/opt/pw-browsers/chromium-1194`. 0 console/page errors both runs.

### Verdicts — ALL 5 PASS (tester-confirmed, rendered + live-geometry)
1. **Loads clean + inputs present — PASS.** 0 errors; canvas-curve lit (11167 px, not blank). Settings
   → Protocol Parameters shows FUNDING κ / **KURTOSIS τ** (=1, 0.05–50) / **WING TILT** (=0.4, 0–0.8) /
   TIME-STEP, verbatim labels. Crop `01d_protocol_params_crop.png` even documents the math in-UI.
2. **WING TILT=0 ⇒ plain v24 — PASS.** Live curve BYTE-IDENTICAL to symmetric anchor: `maxRelDiv=0`
   exactly (`curveTraceTau` only fires when `ghTilt` truthy — L3214 falls through to `curveTraceExplicit`).
   `02_curve_tilt0.png`: single hyperbola, no left teal branch.
3. **WING TILT=0.4 ⇒ bent — PASS.** Live curve diverges up to **31.8%** from anchor (tilt=0.8 → 53.4%,
   monotone). `03_curve_tilt04.png`: bright teal near-vertical left branch + asymmetric right wing
   appears that is absent at tilt=0. Reserves dot stays at (10, 800k).
4. **KURTOSIS τ changes elbow — PASS.** At tilt=0.4, divergence-from-anchor + local elbow curvature
   both DECREASE monotonically as τ grows: τ=0.1 maxRelDiv **42.7%**/curv 1.26e-4 (sharp), τ=1 31.8%,
   τ=20 **4.1%**/curv 5.5e-5 (soft→straight). `04a_curve_tau0.1.png` (tight elbow) vs
   `04b_curve_tau20.png` (bowed-out soft elbow hugging anchor). Reserves dot put (xEq=10,yEq=800k all τ).
5. **No regression — PASS.** Full UI (panel, KPI strip, curve frame, bg image) renders clean after a
   full tilt+τ slider sweep; 0 thrown errors. `05_after_toggle_full.png`, `01_settings_inputs.png`.

### KEY GOTCHA (caught a near-false-FAIL)
The main harness's **chord-sagitta bend metric read ~1.2e-5 and looked FLAT across τ — a FALSE null.**
Cause: it measures sagitta over the chord between the curve's u=±6 ENDPOINTS, which sit at the
asymptotic tails (x→0/y→huge and x→huge/y→0); the visible elbow is a tiny fraction of that span, so
the metric is swamped. The RIGHT lenses (in `..._probe.mjs`): (a) max relative y-divergence live-vs-
symmetric-anchor over the *visible frame window* (x,y < 3×eq), (b) local turning-angle curvature in
u∈[−1.5,1.5] near the mode. Both are decisive and monotone. LESSON: a global chord metric is the
wrong tool for a localized elbow on a curve with huge dynamic range — trust the pixels + a windowed
metric, don't declare FAIL on the bad metric. Reproduced clean ×1 each (numbers deterministic).

### `Engine`/`Store` reachable in page.evaluate (carried from v26c) — TRUE here too
`Store.state.pool` (ghMid/ghTilt/ghTau/ghX0/ghY0) is live in `page.evaluate`; probe reconstructs the
exact `curveTraceTau` warp `Wv = wmid·u + 0.5·dw·(√(τ²+u²) − τ)` from it — page's own geometry.

### Evidence — `evidence/v24_kurtosis_pw/`
01_settings_inputs, 01b/01c_curve_default, **01d_protocol_params_crop** (labels legible),
02_curve_tilt0, 03_curve_tilt04, **04a_curve_tau0.1** / **04b_curve_tau20** (τ contrast),
05_after_toggle_full, trace.json (main), **probe.json** (the decisive geometry metrics).

---

## Prior run — live v26c_full2 (build 6cc73563…) [still-valid context]
All 4 PASS (bands crossover@K, live strike-ray, payoff==table |diff|=0, no v26b regression). Crossover
needs ARB (#btn-arb) to move spot through K, NOT a rebase. Harness `engine/verify/pw_v26c_visual.mjs`.
Engine/Store visible in page.evaluate. Evidence `evidence/v26c_pw/`. HEAD canon md5 `6cc73563…`.

## File-safety canon (v26c HEAD line layer)
Blob line md5s `ab663f5c…` (webp L74) / `c505b08a…` (svg L1060); 3 `<script>` parse.
v26c_full2 build md5 `6cc73563779a3e030774b7597d0ae187`. v26b HEAD `8df9f8a3…`.
(v24-kurtosis reference build = different artifact, md5 `40bfe4b2…`, not these line-md5s.)

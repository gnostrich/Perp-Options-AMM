# MEMORY — tester
_Last updated: 2026-06-08, after first-resume live v26a browser run._

## DONE — first-resume live v26a browser run (HEAD 89ae89e9…)
Ran **live Playwright Chromium** against `builds/HEAD_temporal_mvp_v26a.html`. Build md5 still
`89ae89e9…`; blobs `ab663f5c…`/`c505b08a…` intact; 3 scripts parse; oracle `run_all.sh` green &
byte-stable. **Tester-confirmed (rendered), not logic-only.**

### Verdicts
1. **Slippage display — PASS.** `%` primary, `$` secondary labelled reserve-USD. Gentle collar
   (0.05 BTC, call $84k / put $68k, spot $80k) → `39.9829 % · ≈ $1546.64`; info-tooltip says
   "Layer-1 reserve USD, not a trader honest-dollar figure." Pixel shot `11_slippage_summary.png`.
2. **Frame re-fit — PASS, reads well; do NOT revert.** drawCurve re-fits `xMax=xEq*3, yMax=yEq*3`
   each draw (line ~3231). Across rebase 80k→120k→200k the white reserves dot holds its horizontal
   frac (fx 0.477→0.471→0.467) while axis labels rescale (x 30→26.95→38.46 BTC). Vertical drift
   (fy 0.473→0.596→0.638) is the honest post-trade-below-equilibrium motion. The one-line revert
   (freeze frame on first draw) would clip the GH bend — current is better.
3. **Curve geometry — PASS, GH continuation, no barrier remnant.** `02_curve_pre.png` shows the
   symmetric two-arm `(x−α)(y−β)=αβ` hyperbola bending through eq (~10 BTC,$800k). curveTrace samples
   `arbitrageToOracle` (GH), weight-form/getDepth retired for the live trace. Not Balancer power-form.
4. **Finding-2 — FLAGGED, characterized: SPLIT behavior in v26a.**
   - **Dollar-anchored (correct):** portfolio comp-rows (`pfComponents`, ray=K/oracle_now) + close
     engine (`liveRay`, line 1976) — Orig strike stays `$84,000`/`$68,000` across rebase 80k→120k.
     K_inner/K_outer are the locked things.
   - **Ratio-pegged (drifts off $):** the **curve/ratio chart strike rays** (`drawStrikeRay` 3358,
     `drawStrikeMark` 3585) read **stored `b.sold.inner` = entry-θ = K/oracle_entry**, NOT
     K_inner/oracle_now. On rebase the drawn ray rotates off the locked dollar strike (visible in
     `08_/10_curve_rebase*.png`). So within one build: table/engine = dollar-anchored; chart = ratio-peg.
   - This is the manager's escalation input (UX-clarity chart fix vs the engine, which is already
     dollar-anchored). I FLAG; manager escalates to operator. I cannot prompt operator.

### Observations worth a glance (not failures)
- Slippage scales hard with collar aggressiveness: 0.05 BTC call$84k/put$68k → 40%; same N wider →
  35%; **0.2 BTC call$100k/put$60k → 3463% and post-trade pool spot → ~$0** (degenerate). Both legs
  of a long collar push cash in (compounding, per line-1399 comment), so a far-OTM wide collar moves
  the pool enormously. Display contract still correct; magnitude is input-driven engine behavior, not
  a display regression. **If product wants collars usable at size, this needs a separate look** —
  flag to manager as a softer note.
- Bought put $68k flagged **ITM** at spot $80k in the comp-row regime column. That's pool-mark
  (sNorm) referenced after the trade moved the pool, not naive spot-vs-strike — consistent with the
  engine's pool-mark regime test, but visually surprising. Noted, not a finding.

### Repro
`cd engine; PLAYWRIGHT_BROWSERS_PATH=/home/user/.cache/ms-playwright node verify/pw_v26a_visual.mjs`
Chromium is at `~/.cache/ms-playwright/chromium-1194` (installed via `npx playwright install chromium`
WITHOUT `--with-deps` — the apt `--with-deps` step 403s on unrelated deadsnakes/ondrej PPAs; browser
download itself from cdn.playwright.dev worked). `engine/node_modules/` holds 2 symlinks to the global
playwright pkg so the ESM `import 'playwright'` resolves — harmless, not a real npm install.

## What you run
- Oracle: `cd engine && sh verify/run_all.sh` (7 GH gates, curveTrace 401/401, slope, slippage).
  Seam/American gate joins when v26b lands.
- Live Playwright (confirmed working this run). Browser path above. No browser → Node VM+DOM shim is
  logic-only; say "tester-confirmed" only for rendered pixels.
- File-safety spot-check: blob md5s `ab663f5c…`/`c505b08a…`; 3 `<script>` parse.

## Evidence
`evidence/v26a_pw/` — screenshots 01–10 (curve pre/preview/posttrade/rebase120k/rebase200k,
portfolio 80k/120k, full app), `11_slippage_summary.png`, `12_slippage_row.png`, `trace.json`
(all canvas/DOM numbers). Harnesses in `engine/verify/pw_v26a_visual.mjs` (+ probe, crop_slip).
Prior slipfix evidence also in `evidence/`.

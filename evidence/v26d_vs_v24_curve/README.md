# v26d (GH native) vs v24 (Balancer weight-form) — Pool-Curve side-by-side

READ-ONLY illustration, 2026-06-09. No engine edits, no git. Live Chromium (Playwright 1.56.1,
0 pageerrors on both loads). Captured the default-open "Pool Curve" view (`canvas-curve`, 700×460)
of each build, then composed + re-plotted.

## Builds
- **v24 reference (operator's upload):** loaded from the **upload path**
  `/root/.claude/uploads/ef05e72b-.../4f8ec7e5-temporal_mvp_v24_rebase_fixed_2_1.html`
  (md5 `6f606f52…`, byte-identical to the repo fallback `engine/builds/temporal_mvp_v24_rebase_fixed_2.html`).
  Balancer-era: live curve drawn via `curveTrace = curveTraceExplicit(snap.w,…)` (weight-form).
- **current:** `engine/builds/temporal_mvp_v26d_volknob.html` (md5 `a406a751…`). GH-native: live
  curve drawn via `curveTrace → Engine.arbitrageToOracle` over `mp0·e^(−6..6)`.

Both: equilibrium 10 BTC / $800k, oracle $80k, γ≈3, frame = equilibrium×3 = (30 BTC, $2.4M).

## Files
1. **v24_curve.png** — v24 Balancer Pool Curve, default open. Visibly curved ~45° hyperbolic sweep
   (teal/pink) bending steeply through the white equilibrium marker at (10 BTC, $800k).
2. **current_curve.png** — current GH Pool Curve, default open. The live GH curve (teal) reads as a
   nearly-flat horizontal line at ~$800k; the grey w=½ anchor curve (present in both) drives the
   $2.4M y-axis.
3. **side_by_side.png** — the two curves left/right, labelled "v24 — Balancer weight-form" /
   "current (v26d) — GH native". Difference obvious at a glance.
4. **current_slope_corrected.png** — the SAME extracted GH data re-plotted with the y-axis auto-fit
   to the curve's own range (y $392k–$834k, x 0–2949 BTC). It IS a genuine, well-formed hyperbolic
   curve — just ~44× shallower in price-scaled axes than the Balancer curve.

## Why they differ (manager-verified; SHOWN here, not proven)
At the same reserve point/price, the GH curve's geometric slope is price ÷ ~44.5 (the γ=2
price-vs-slope gotcha: |dy/dx| = getMP_raw·e^(−μ)), whereas the Balancer curve's slope = the price.
Both charts scale axes to the price/equilibrium, so v24/Balancer reads ~45° and current/GH reads
nearly flat. The GH curve's real bend (its $400k→$818k drop) lives out at x ≫ 30 BTC (to ~2891 BTC),
off the right edge of the price-scaled frame — see current_slope_corrected.png.

## Measured (live, reproduced from the page's own Engine)
- v24 canvas non-blank 10027/322000; current canvas non-blank 11093/322000 (both render).
- current GH live curve real range: x 5.0–2890.7 BTC, y $400,000–$817,822. eq (10 BTC, $800k).
- Frame (eq×3): xMax 30 BTC, yMax $2.4M — the squish that flattens the curve in the as-is view.

Harnesses (READ-ONLY): `engine/verify/pw_v26d_vs_v24_curve.mjs` (capture + GH extract + re-plot),
`engine/verify/pw_compose_sbs.mjs` (side-by-side compose).

# Playground vs v24 — live-browser like-for-like (READ-ONLY, no engine edit, no git)

_Tester, 2026-06-09. Live Chromium (Playwright 1.56.1, `/opt/pw-browsers/chromium-1194`).
Reproduced byte-identical across 2 runs (pixel counts + zero console errors). Both source files
md5-unchanged after testing: playground `2b20c844`, v24 `6f606f52` — truly read-only._

## Builds
- v24 reference: `reference/v24_balancer_stable.html` (md5 6f606f52)
- playground: `reference/temporal_curve_playground.html` (md5 2b20c844). Honest dials
  γ (steepness) / δ (kurtosis) / βh (skew); default Balancer corner βh=0, δ=30, γ=1.05.

## Screenshots
- `v24_curve.png` — v24 Pool Curve at default. LIVE curve = a balanced curved ~45° hyperbolic sweep
  through the eq marker (~10 BTC / $800k). nonblank 10023/322000.
- `playground_default.png` — playground at γ≈1.05 (ghAh 2.05, ghMu −0.360). LIVE teal curve drops
  near-vertical on the left then runs FLAT along the bottom-right (hugs the axes). NOT a balanced
  sweep. nonblank 11173. The grey w=½ ANCHOR curve (present in BOTH builds) is what reads ~45°.
- `playground_g1p3.png` — γ=1.3 (γ-out 1.300). LIVE curve still steep-left / flat-bottom-right;
  re-warps but does NOT become a balanced ~45° sweep. nonblank 11283.
- `playground_g2.png` — γ=2 (γ-out 2.000). LIVE curve steeper-left and flatter/longer right tail —
  MORE asymmetric, not more 45°. nonblank 11558.
- `side_by_side.png` — labeled L (v24) vs R (playground @γ=1.3, the closest candidate).
- `playground_default_full.png`, `v24_full.png` — dashboard context (clean render).

## Verdicts
(a) **Balancer-corner like-for-like does NOT hold — and it does not hold at γ≳1.3 either.** At the
γ≈1.05 default the LIVE GH curve reads flat-ish/axis-hugging, NOT the v24 balanced sweep. Dialing
γ up to 1.3 and 2 re-warps the curve but makes it MORE asymmetric (steeper-left, flatter-right),
never more 45°. The intern's caveat ("flat at the corner, ~45° for γ≳1.3") is REFUTED on the visual:
the live curve never reaches a v24-style balanced sweep at any γ tested. Reason (geometry, prior
runs): the GH geometric slope = getMP_raw·e^(−ghMu) = price ÷ a factor that GROWS with γ, so on the
price-scaled frame higher γ → flatter/more-axis-hugging live curve, not 45°.

(b) **Closest visual match to v24 = the grey w=½ ANCHOR curve, which is present in both builds — NOT
the live curve at any γ.** Of the live-curve γ settings, γ≈1.3 is the least-bad candidate shown in
the side-by-side, but it is still not a like-for-like.

(c) **Dials WORK — PASS.** γ/δ/βh number-steppers re-warp the pool in place (Store.setShape) and
redraw: γ 1.05→1.3→2 shifts nonblank 11173→11283→11558; the γ stepper (stepUp) moved 2→2.0501 and
the canvas redrew; δ 30→5 moved ghMu −0.360→+1.303 and nonblank 11283→10853; βh 0→0.5 set ghBh=0.5,
nonblank→11817; γ floor clamps to 1.000 with the "γ clamped to >1 (locked GH family floor)" note.
Zero pageerrors and zero console.errors on BOTH builds, both runs. Clean ×2.

## Harnesses (READ-ONLY)
- `engine/verify/pw_playground_vs_v24.mjs` — captures + pixel counts + dial re-warp/redraw + errors.
- `engine/verify/pw_compose_pg_sbs.mjs` — composes the labeled side_by_side.png.

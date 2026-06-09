# v26d Pool-Curve framing explainer — why the live GH curve LOOKS flat

READ-ONLY illustration. Build `engine/builds/temporal_mvp_v26d_volknob.html`
(md5 `a406a75149b1606d7822b4f2bbcc4f84`, unchanged — no engine edits, no git).
Curve-draw code is identical to HEAD. Points were EXTRACTED from the page's own
live engine (`Engine.arbitrageToOracle` swept over `mp0·e^(−6..6)`, exactly
reproducing `curveTrace`; anchor via `curveTraceExplicit(w=½)` with
`depth=Engine.getDepth(pool)`) and re-plotted on fresh canvases. Live Chromium,
0 page errors, ranges byte-reproduced across 2 runs (not flaky).

Harness: `engine/verify/pw_v26d_framing.mjs`.

## The story
The live pool sits at equilibrium **(10 BTC, $800k)**. The chart frame re-fits
each draw to **eq×3 = (30 BTC, $2.4M)** so it can contain the grey w=½ anchor
curve and the strike rays. That tall frame squishes the live GH curve into the
bottom third, and in the visible x≤~30 BTC window its $ only moves ~$39k — so it
reads as a flat line. The actual GH bend lives at x ≫ 30 BTC, off the right edge.

## Measured (x,y) ranges — confirm the manager's numbers
| quantity | measured | manager's stated |
|---|---|---|
| live GH curve $ (y) span | **$400,000 – $817,822** | ~$400k – $818k  ✓ |
| live GH curve BTC (x) span | **5.00 – 2890.7 BTC** | ~5 – 2874 BTC  (≈; 2891 at e^+6) |
| chart y-axis max | **$2,400,000** (= 3 × $800k eq) | ~$2.4M  ✓ |
| chart x-axis max | **30.0 BTC** (= 3 × 10 eq) | ~30  ✓ |
| equilibrium | **(10.0 BTC, $800,000)**, oracle $80k, γ(ghAh)=3.0019 | — |
| $ movement across visible x≤30 | **~$39k** ($778,862 → $817,822) | "~$30k" (≈; $39k measured) |

Two small corrections to the brief's round numbers: the live x-span top is **2891
BTC** (the e^+6 sweep endpoint, vs the stated ~2874), and the $ movement inside
the visible window is **~$39k** (vs the stated ~$30k). Both confirm the thesis;
neither changes it.

## Screenshots
1. **as_is.png** / **as_is_canvas.png** — the live "Pool Curve (X,Y)" chart
   exactly as it renders. The flat-looking **teal** line near $800k IS the live
   GH curve; the **grey** curve is the w=½ anchor reference (it is what drives the
   y-axis up to $2.4M); **green/red dashed** are the put/call strike rays; white
   dot = equilibrium. `as_is.png` is the in-app dashboard context; `as_is_canvas.png`
   is the isolated 700×460 chart canvas.
2. **same_data_two_frames.png** *(the key one)* — SAME extracted live-curve data,
   two frames. **(a)** current chart frame [x:0–30, y:0–$2.4M]: teal curve looks
   flat, grey anchor fills the height. **(b)** auto-fit to the live curve's real
   range [x:0–3006 BTC, y:$384k–$834k]: a genuine bending GH curve. Same data.
3. **visible_window_zoom.png** — live curve over x∈[0,30 BTC] with y auto-fit to
   ~$773k–$824k. The gentle bend in the on-screen window becomes visible — it is
   NOT literally a flat line (~$39k of curvature across the window).
4. **deforms_with_vol.png** — live curve at two vols on shared auto-fit axes
   (x≤60 BTC): σ=0.20→γ≈2.16 (pink, higher vol → lower γ → bends hard early) vs
   σ=0.10→γ≈3.70 (teal, lower vol → steeper γ → bend pushed far right). Driven via
   the real `#vk-sigma` stepper; the curve visibly RESHAPES with vol.

## Method / caveat notes
- The chart frame re-fits to eq×3 every draw, so you cannot just override
  `window.__curveFrame` — hence we extract points and re-plot ourselves.
- UI top-level `snapshot`/`render`/`Viz` are NOT bare-reachable in `page.evaluate`
  (scope artifact, not a bug); `Engine`/`Store` ARE. We rebuild the snap from the
  live pool + `Engine.getDepth/getW/getSNorm` so the w=½ anchor captures correctly
  (a naive `Store.state.pool` lacks the `depth` field → empty anchor).
- σ→γ uses the engine's own Merton map; the realised γ (ghAh−1≈2.16/3.70) is what
  the engine landed on, reported verbatim rather than forced to a target.

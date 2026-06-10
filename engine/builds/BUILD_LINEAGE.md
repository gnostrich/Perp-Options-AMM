# builds/ — lineage & integrity

All four are the same single-file simulator at different points. **Work from HEAD.**
The two earlier non-HEAD builds are kept so any one recovers the history and so a diff can
show exactly what each step changed.

| file | md5 | status |
|---|---|---|
| temporal_mvp_v25_gh.html | `9910c69924fd0b413dbb75e5b4ca56a0` | barrier→GH swap baseline; gates green |
| temporal_mvp_v26a_fixes.html | `951d16eb1cfd0db24b2deffff30cd876` | + 3 barrier-remnant fixes; gates green |
| temporal_mvp_v26a_2c0337e8_slipWIP.html | `2c0337e8e0260e7dae6072e241d764f0` | + slippage WIP — **KNOWN-BROKEN (~97% flat)**; lineage only, do not ship/build on |
| temporal_mvp_v26a.html | `89ae89e9df229186b134ca6638726d0c` | + slippage units fix; gates green; **prior HEAD, demoted 2026-06-08 on v26b promotion** |
| temporal_mvp_v26b.html | `8df9f8a3cb705282a5348ce778f9eb82` | + ITM/American smooth-pasting (mark/markFrac split, both wings, seam gate wired); **prior HEAD, demoted 2026-06-08 on v26c promotion.** |
| temporal_mvp_v26b_xrange.html | `570ef23ff89d931b8394e8f38c9d17a5` | + payoff chart x-range ±50%→±200% (2 display lines); Node-verified; browser-visual deferred; not HEAD |
| temporal_mvp_v26c_strikereg.html | `(see git)` | + strike registration in curve coordinate θ=sNorm(K) — **DISPLAY mark path (`pfComponents`) only**; new permanent `dir_gate.js` (crossover@K + directional consistency, negative-controlled). Manager-verified Node level. **SCOPE-PARTIAL (superseded by v26c_full).** Not HEAD. |
| temporal_mvp_v26c_full.html | `8f7b3ffb…` | + UNIFORM strike registration (operator ruling A): execution/settlement path + chart strike-ray (`drawStrikeRay`, = Finding-2 absorbed) all carry-registered via `regLeg`/`sNormStrike`; `drawStrikeMark`/funding/isOTM left (price-measure). Manager-verified Node level. **superseded by v26c_full2.** Not HEAD. |
| temporal_mvp_v26c.html | `6cc73563779a3e030774b7597d0ae187` | (was `HEAD_temporal_mvp_v26c.html` / `temporal_mvp_v26c_full2.html`) + UNIFORM strike registration `θ=sNorm(K)` across display mark + execution/settlement + payoff chart; chart strike-ray live K/oracle; permanent `dir_gate.js`; Finding-2 absorbed. Manager-verified + UI tester-confirmed. **Prior HEAD — demoted 2026-06-10 on v27 promotion (operator entry 28: "nothing useful since v24"); endpoint of the GH line (v25→v26c), retained in full; GH suite still green via `run_all.sh builds/temporal_mvp_v26c.html`.** |
| **HEAD_temporal_mvp_v27_wkurtosis.html** | `b245bfda6a493af0a7017309f1acd3f3` | **(W) kurtosis curve off the v24 Balancer base** (NOT a GH descendant): √-kernel weight-field invariant; static τ kurtosis knob (elbow rounds, wings frozen exact power-laws); **strong-form trades-warp** (φ field-recenter; α=x·w, β=y·(1−w) conserved per trade — skeptic-verified the UNIQUE conservation-consistent trade; curve reshapes, not dot-slide) + wing-range guard; γ>1 (w_±>½) UI clamp; Reading-A settlement (S*=K·γ_loc/(γ_loc+1) exact by construction); price==slope on (W) (no e^(−ghMu) gotcha). Gate = `wcurve_selfcheck.js` 21 PASS/0 FAIL [HARD]. **current canonical HEAD — PROMOTED 2026-06-10 by OPERATOR RULING (entry 28), overriding the tester's visual-layer blocker** (warp is elbow-local ⇒ subtle on screen; per the verified sweep it CANNOT match v24's global warp magnitude with frozen wings — operator-accepted). Premise skeptic-verified FAITHFUL to paper+v24 (#14). OPEN (honest): warp∘rebase-commute + φ-anchor/funding lemmas [needs-Aristotle]; anchor-overlay viz not yet added; lp-y-delta hardcode + degenerate default LIQ-PRICE readouts (tester-flagged); funding re-pointed to price-anchor [theory-risk-accepted]. |

Predecessor / base: `temporal_mvp_v24_rebase_fixed_2.html` — the constant-product/Balancer-type
hyperbola build (`(x−α)(y−β)=αβ`, w=α/x; the "barrier" strings are an option-type mode, not the
curve). It is the BASE of HEAD v27; the GH line (v25→v26c) branched from it 2026-06-07/08 and was
demoted intact 2026-06-10 (operator entry 28).

## Blob baseline (canonical = LINE layer — verify against THIS)
Both blobs must be byte-identical across every safe edit. Canonical check = the whole-line md5
(`sed -n 'Np' file | md5sum`), which is what the hook + `run_all.sh` use:
- **webp** (background), line ~74, length **273917**, line-md5 **`ab663f5c26f2a461c5b0ef1421d0ad74`**
- **svg** (logo), line ~1060, length **5240**, line-md5 **`c505b08ad0e4c6b0fb9e64e9679fe291`**

**Documented secondary (decoded-binary layer — informational, NOT the check):** the same two blobs
decode to `8d2e1a84` (205398 bytes) / `1b320fc5` (3875 bytes); b64-payload md5s `d3ff8fc8`/`b6f0d67b`.
Arithmetic proving it's one blob: 273864 b64 chars ×¾ = 205398 (exact); 5168 ×¾ = 3875. These are
**not** a "minified broken cut" — they are the decode of the canonical line. Recorded so a future
line-hash break can be told apart from a real blob change. (RECONCILED 2026-06-08; ratified: keep the
line layer canonical.)

## Quick integrity check (any build)
```sh
md5sum builds/HEAD_temporal_mvp_v27_wkurtosis.html             # expect b245bfda...
sed -n '74p'   builds/HEAD_temporal_mvp_v27_wkurtosis.html | md5sum   # expect ab663f5c...
sed -n '1060p' builds/HEAD_temporal_mvp_v27_wkurtosis.html | md5sum   # expect c505b08a...
```
Then `verify/run_all.sh` for parse + 7 gates + curveTrace + slope/slippage checks.

## What each step changed (for orientation)
- **v25_gh:** swapped the AMM invariant from the Balancer barrier to the GH curve. Only
  `getMP_raw, tradeUpdate, arbitrageToOracle, rebase` + `ghCalibrate` are curve-dependent.
- **v26a_fixes:** three sites the swap missed — an inline slippage marginal price, the
  curve-draw layer (`curveTrace` now samples the engine), and the equilibrium marker — moved
  onto the engine. `snapshot()` spreads the pool. Two w=½ anchor curves + `getDepth` left stale
  by design.
- **2c0337e8 (WIP):** realized-average slippage referenced to `getMP_raw` directly — wrong units
  (pinned ~97%). Kept only to show the bug / diff against HEAD.
- **HEAD:** both slippage paths reference `mpGeom = getMP_raw·e^(−ghMu)`; `getMP_raw` comment +
  Slippage% tooltip fixed; `margPrice` removed; curveTrace untouched (its angle is dead).

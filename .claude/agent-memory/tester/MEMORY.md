# MEMORY — tester
_Last updated: 2026-06-08, after live v26b ITM/American browser confirmation run._

## DONE — live v26b ITM/American browser confirmation (build 8df9f8a3…)
Ran **live Playwright Chromium** against `builds/temporal_mvp_v26b_itm.html`. Build md5
`8df9f8a3cb705282a5348ce778f9eb82` unchanged (no engine edit); blobs `ab663f5c…`/`c505b08a…`
intact; 3 scripts parse. Oracle `run_all.sh builds/temporal_mvp_v26b_itm.html` GREEN incl.
**SEAM GATE PASS** (value+slope ≤0.15%, directional, both branches, γ∈{1.5,2,3,4}). Harness:
`engine/verify/pw_v26b_visual.mjs`. Repro identical across 2 runs (not flaky).

### Verdicts (FLAG per item)
1. **Bands §5 — PASS (tester-confirmed, rendered).** Header reads **"Attrib P&L"** (no "/ Eff
   strike"); Strike header is "Entry equity / Strike" (was "Orig strike"). Comp rows = **9 cells**,
   alignment intact; the **eff-strike sub-cell is the empty 4th `<td>`** (under Attrib P&L). Oracle
   (live), Entry mark, Mark cell all present. `11_bands_table_crop.png` legible. DOM in trace.json.
2. **Mark continuation→intrinsic — PASS (tester-confirmed live DOM + closed-form).** Sweeping oracle
   80k→500k, the rendered SOLD-call (K=$84k) Mark cell grows **smoothly & monotonically 0.1231→0.5612
   and never clamps to 1.0000** — the OLD `markFrac` would saturate to 1.0 the instant sNorm≥1
   (oracle≥$84k). So the cell unambiguously uses the new rule. Closed-form re-derivation (src
   1658-1670) confirms **no jump at strike (gap ~3e-7) and no jump at seam sNstar (gap ~3e-7)**, max
   consecutive sweep jump ~0.005 (= step size, no kink); cap reached only deep past the seam.
   `06_bands_table_ITM.png`.
3. **Payoff legFraction naked-uncapped vs spread-capped — PARTIAL: logic-confirmed, NOT visually
   distinguishable in the chart's window. FLAG.** Source (line 3866-3873): naked barrier =
   `Engine.mark()` with **NO `Math.min(1,·)`**; spread = `min(1,mIn)−min(1,mOut)` (each capped).
   Closed-form: naked `mark()` fraction rises monotonically and **asymptotes to 1 (never exceeds 1)**
   for a clean barrier; the spread stays bounded. The cap-removal is structurally correct/distinct,
   but the **payoff chart x-axis is "perp mark % change ±50%"**, far short of the deep-ITM region —
   naked (`09_payoff_naked.png`) and spread (`10_payoff_spread.png`) render **pixel-identical** in
   that window. So "naked value grows past 1 deep-ITM" is **logic-only**, not a pixel I saw. The
   "grows past 1" phrasing is about leg VALUE (N·frac·pM), not the fraction (which caps at 1).
   → FLAG to manager: item-3's visual claim isn't observable in the current chart range; the code is
   correct. If product wants it visible, the payoff chart needs a wider sNorm sweep.
4. **Polar mark-curve marker — PASS (tester-confirmed, rendered).** The polar mark chart is the
   **"pricing" / `canvas-pricing`** view ("Mark Across Strikes"), NOT trajectory/canvas-ratio.
   `07_polar_mark_pricing.png`: green dot (bought put K~$68k, left of mode) sits exactly ON the pink
   put-wing ψ curve; red dot (sold call K=$84k, right of mode) sits exactly ON the teal call-wing
   curve. Both route to `markFrac` (src 3598) and the curve is the same `min(s/θ,θ/s)` — re-derived
   identity maxDiff=0. No drift.

### Provenance summary
- tester-confirmed (rendered pixels): items 1, 2, 4.
- logic-only (closed-form + source, NOT a distinguishing pixel): item 3's uncapped-vs-capped visual.
- Node oracle incl. seam gate: PASS against the v26b build.

### Gotcha learned
- Chart view values: `curve`=pool curve, **`pricing`=polar Mark-Across-Strikes (canvas-pricing) — this
  is item-4's polar mark chart**, `trajectory`=(Δφ_C,Δφ_P) on canvas-ratio (NOT the mark curve),
  `payoff`=canvas-payoff. My first harness pass aimed item-4 at canvas-ratio by mistake (the v26a
  ratio chart); corrected to canvas-pricing.
- `Engine`/`Store` are module-scoped consts (line 1590/2192), **NOT on window** — harness re-derives
  closed forms inline (transcribed from source) and uses rendered DOM as the live oracle.

### Repro
`cd engine; PLAYWRIGHT_BROWSERS_PATH=/home/user/.cache/ms-playwright node verify/pw_v26b_visual.mjs`
Seam gate: `cd engine; sh verify/run_all.sh builds/temporal_mvp_v26b_itm.html` (the bare `run_all.sh`
defaults to the v26a HEAD and SKIPs the seam gate — must pass the v26b path explicitly).
Chromium at `~/.cache/ms-playwright/chromium-1194`. `engine/node_modules/` symlinks resolve
`import 'playwright'` — tmp harnesses must live under `engine/` to resolve the module.

## What you run
- Oracle: `cd engine && sh verify/run_all.sh builds/temporal_mvp_v26b_itm.html` (7 GH gates +
  curveTrace + slope + slippage splice + **seam gate**). Bare invocation = v26a, seam SKIP.
- Live Playwright (confirmed working). No browser → Node VM+DOM shim is logic-only.
- File-safety: blob md5s `ab663f5c…`/`c505b08a…`; 3 `<script>` parse; build md5 `8df9f8a3…`.

## v26a state (prior run, still valid context)
Finding-2 still open: v26a table/engine dollar-anchored, curve/ratio chart ratio-pegged. Manager's
escalation input. Slippage display PASS. Frame re-fit PASS (don't revert). Curve = GH continuation.

## Evidence
`evidence/v26b_pw/` — 01_inputs, 03/09/10_payoff*, 04_after_execute, 05/06_bands_table_*,
07_polar_mark_pricing, 08_pricing_full, **11_bands_table_crop** (item-1 legible), trace.json (all
DOM/canvas numbers + sweeps). `evidence/v26a_pw/` prior run.

# MEMORY — intern
_Last updated: 2026-06-08, bootstrap. Rewrite changed bits at task end._

## Engine
- Canonical: **`engine/builds/HEAD_temporal_mvp_v26a.html`** (md5 `89ae89e9…`). Work from this.
- 4 curve-dependent fns: `getMP_raw`, `tradeUpdate`, `arbitrageToOracle`, `rebase`. `getSNorm`=(x−α)/α;
  `getDepth` is display-only/stale (left so by design). State carries scalar `gh*` params
  (`ghP,ghNx,ghNy,ghM,ghMu,ghAh,ghBh,ghDelta`); the CDF table lives in a module cache keyed by shape,
  re-derived on load (pool stays serialization-safe — don't move the table onto the pool).
- `snapshot()` spreads the pool (`{...p,w,depth,sNorm}`) so the draw layer can sample the engine on
  `snap` — don't "tidy" it to an explicit field list (drops gh*, breaks curve+marker silently).

## ⛔ FILE-SAFETY (every engine edit)
- Blobs: webp line ~74 md5 `ab663f5c26f2a461c5b0ef1421d0ad74`; svg line ~1060 md5
  `c505b08ad0e4c6b0fb9e64e9679fe291`. **Never** the minified `8d2e1a84`/`1b320fc5` set. **No minifier.**
- Edit only via on-disk Python splice (work on a copy; slice old string by line range; `assert
  count==1`; preserve trailing `\n`; blobs never through the splice). Recipe:
  `engine/recipe_html_blob_editing.md`, `engine/splices/SPLICE_METHOD.md`; worked examples in
  `engine/splices/splice_*.py` (`splice_slipfix.py` is the best template).
- Post-edit must pass: 2 blob md5 unchanged · 3 `<script>` parse · IIFE intact · no script line >50k ·
  `engine/verify/run_all.sh` green. The `PostToolUse` hook re-checks and **blocks** on red — a block
  is a **finding**: STOP, report, do NOT patch toward green.

## THE gotcha
`getMP_raw` = price coordinate, NOT slope. Use `mpGeom = getMP_raw·e^(−s.ghMu)` for anything compared
to a geometric Δy/Δx (slippage %, $, angles). Read `ghMu` per-state; missing `ghMu` → **NaN (loud)**,
never `e^0`. Catastrophic cancellation: compute OTM tail via direct upper-tail integrals, NOT `1−F`.

## Done (don't redo)
- GH swap (v25), v26a barrier-remnant fixes (inline slip price, curve-draw, eq marker → engine),
  slippage units fix (both `legSlipFrac`/`legSlipUsd` → mpGeom; old `margPrice` removed; comment
  mislabel fixed; tooltip relabeled reserve-USD). All 7 gates green; splice-level slippage matches
  targets; no silent ghMu default.

## Current work — v26b ITM/American (CLEARED, not started)
Spec: `specs/SPEC_itm_exercise_smoothpaste_NEXT.md`. Continuation `c·sNorm` runs PAST the strike to
`sNorm* = θ·((γ+1)/γ)^γ` (price `S* = K·γ/(γ+1)`), `c = 1/((γ+1)·sNorm*)`, then intrinsic-from-strike.
No new params; drop the redundant "Eff strike" column; drawn curve = GH continuation up to sNorm*
then intrinsic. Add `verify/seam_gate.js` (value+slope match ≤0.15% at boundary) as a hard gate in
run_all. **Stage-2→3 dollar conversion is UNCHANGED — if it seems to need an exercise-specific
branch, STOP and report.** Architectural? → escalate to manager, don't decide.

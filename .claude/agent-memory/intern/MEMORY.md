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
  `c505b08ad0e4c6b0fb9e64e9679fe291`. The `8d2e1a84`/`1b320fc5` set is NOT a separate broken cut —
  it is the **decode** of the canonical line layer `ab663f5c`/`c505b08a` (one blob, three layers:
  line / b64-payload / decoded binary). Hook + run_all key off the **line layer**. RECONCILED
  repo-wide. **No minifier, ever.**
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

## Done — v26b ITM/American (IMPLEMENTED, handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26b_itm.html`** (from HEAD `89ae89e9`; HEAD untouched).
Splice: `/tmp/splice_v26b.py` (17 reps, all `count==1`, blobs never through). All gates green.
- **mark split:** `markFrac(wing,θ,sNorm)` = OLD saturating fraction VERBATIM (funding + the polar
  ψ∈(0,1] mark-curve marker route here; funding proved BIT-IDENTICAL to HEAD, worst |Δ|=0). New
  `mark(wing,θ,sNorm,γ)` = American smooth-pasting VALUE; `γ = state.ghAh−1` (exact). Branches bound
  by **S-direction, NOT the call/put tag** (tag is inverted): `wing 'call'`=sNorm/θ arm →
  `sNorm*=θ·((γ+1)/γ)^γ`, cont `sNorm/((γ+1)·sNorm*)`, intrinsic `1−(sNorm/θ)^(−1/γ)`=1−S/K, S*<K.
  `wing 'put'`=θ/sNorm arm → `sNorm*=θ·(γ/(γ+1))^γ`, cont `sNorm*/((γ+1)·sNorm)`, intrinsic
  `1−(sNorm/θ)^(1/γ)`=1−K/S, S*>K. Both fraction@bdry=`1/(γ+1)`.
- γ threaded through: legPrice, executeBand (buy-side denom), markEff/legValueUnified (+closeBand
  callers), pfComponents (+renderBands `pfGamma`), preview N_buy denom, legFraction. **Cap removed
  on the UNBOUNDED (barrier) leg only** in legFraction; spread leg stays `min(1,·)`.
- **Stage-2→3 dollar conversion UNTOUCHED** (no exercise branch needed — confirmed compatible).
- **Display:** dropped `effK` (4151/4156), emptied Eff-strike component cell (`<td></td>`, 9-col
  preserved), header `Attrib P&L / Eff strike`→`Attrib P&L`, `Orig strike`→`Strike`, dropped stale
  units-note. Kept Oracle(live), Entry mark, mark cell, `itm`/`regimeCls` colouring.
- **Seam gate** (`verify/seam_gate.js`, generalized): PER BRANCH value match (price-space, 0.000%) +
  slope match (sNorm-space, ≤0.0005%) + no-jump (~1e-7) + DIRECTIONAL (branch A S*<K, branch B S*>K,
  keyed off price space). Mutation test (swapped branches) → exits 1. **Slope is measured in
  sNorm-space on purpose:** price-space FD differencing aliases the GH table (plateaus ~0.2%, does
  NOT shrink with h → measurement artifact, not a kink); sNorm-space `d mark/d sNorm` is the exact
  structural smooth-pasting quantity (chain-rule dS/dsNorm cancels). Wired into run_all as HARD GATE;
  **SKIPs as pass on pre-v26b builds** (detects `markFrac` + non-saturating ITM mark) so HEAD stays
  green. 7 GH gates still PASS γ∈{1.5,2,3,4}; blobs unchanged; 3 scripts parse; IIFE/sigs intact.
- **Open for tester:** browser/visual run — bands table renders (empty Eff cell, renamed headers),
  payoff chart legFraction uncapped on naked leg, polar marker dot stays on its ψ-curve.

## Done — v26b payoff x-range widen (DISPLAY-ONLY, handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26b_xrange.html`** (from HEAD `8df9f8a3`; HEAD untouched).
Splice: `/tmp/splice_xrange.py` (2 reps, both `count==1`, blobs never through). Operator-approved
(tester item-3 follow-up). Diff vs HEAD = exactly 2 lines, both in `drawPayoff`:
- L3815 `const xMin = -0.5, xMax = 0.5` → `-2.0 .. 2.0` (perp-mark % sweep). Picked ±200% as the
  smallest clean round range: default γ=2 (`GH_GAMMA=2.0`), naked/barrier (call-wing) free boundary
  `sNorm*=θ·((γ+1)/γ)^γ=2.25·θ`; r∈[−2,+2] takes sNorm up to 3.0, clears S* for typical OTM θ so the
  uncapped naked leg's intrinsic visibly diverges above the capped (min(1,·)) spread leg.
- L3947 x-tick loop `pct=-50..50 step10` → `-200..200 step50` (9 ticks). No other axis/range text
  states a number (note at L1442 is qualitative); nothing else to update.
- NO touch to mark/markFrac/legFraction/curve fns/funding/settlement (display/axis only). Harness
  green from `engine/`: `sh verify/run_all.sh builds/temporal_mvp_v26b_xrange.html` → 7 GH gates
  PASS γ∈{1.5,2,3,4}, seam gate PASS both branches, blobs `ab663f5c`/`c505b08a` intact, 3 scripts
  parse, sigs:true, IIFE:true, longest non-blob line 553 chars. **Open for tester:** visual — naked
  leg climbing past capped spread now visible within the wider frame.

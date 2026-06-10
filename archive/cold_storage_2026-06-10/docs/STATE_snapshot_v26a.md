# STATE.md — Temporal GH branch, current truth
_Last updated: 2026-06-08, by the implementation-intern session at slippage-fix handoff._
_This file is the single source of truth. Update it at the end of meaningful work._

## Head
**`builds/HEAD_temporal_mvp_v26a.html` — md5 `89ae89e9df229186b134ca6638726d0c`.**
GH curve swap + v26a barrier-remnant fixes + slippage units fix. 7 GH gates green at
γ∈{1.5,2,3,4}. Not yet "shipped": manager independent verify + tester browser re-run owed.

## Build lineage (see builds/BUILD_LINEAGE.md for details + blob baseline)
| file | md5 | what |
|---|---|---|
| temporal_mvp_v25_gh.html | 9910c699 | barrier→GH invariant swap; 4 curve fns + calibration; 7 gates |
| temporal_mvp_v26a_fixes.html | 951d16eb | 3 barrier remnants fixed (inline slip price, curve-draw, eq marker) |
| temporal_mvp_v26a_2c0337e8_slipWIP.html | 2c0337e8 | slippage WIP — **known-broken (~97% flat)**, lineage only |
| **HEAD_temporal_mvp_v26a.html** | **89ae89e9** | slippage units fix (both paths → mpGeom); **work from this** |

## Done
- **GH swap (v25).** value∝S^(−γ); 4 curve fns (`getMP_raw, tradeUpdate, arbitrageToOracle,
  rebase`) + `ghCalibrate` verified to high precision. Methods that MUST be reused: direct
  upper-tail integrals (NOT 1−F — catastrophic cancellation fails round-trip for γ≥2);
  shape-keyed module CDF cache (per-call integration was 40ms; cache → ~0.6µs); Bessel K1 via
  A&S rational approx (only enters the scalar M). See engine/GH_MATH.md.
- **v26a fixes.** Inline slippage price, curve-draw layer, and equilibrium marker converted
  off barrier forms onto the engine (`getMP_raw` / `arbitrageToOracle`); `snapshot()` spreads
  the pool so the engine can sample on `snap`. Two w=½ anchor reference curves + `getDepth`
  left stale **by design** (flagged; their GH form is a funding/anchor call for the architect).
- **Slippage units fix (HEAD).** Found: `getMP_raw = e^ghMu·|dy/dx|` (price coordinate, not
  slope). Both `legSlipFrac` (%) and `legSlipUsd` ($) now reference `mpGeom = getMP_raw·e^(−ghMu)`;
  the old `margPrice = getMP_raw` removed; `getMP_raw` comment mislabel fixed; Slippage% tooltip
  relabeled (reserve-USD). curveTrace angle verified unused → untouched. Verified: spliced
  functions reproduce slip_accept targets (0.99%/$3.46 → 71.45%/$6240.94, growing); 7 gates green;
  no silent ghMu default. Details: specs/SLIPPAGE_SPLICE_BRIEF_done.md, root SLIPFIX_REPORT below.

## Open threads (what | owner | status)
1. **Manager independent verify of HEAD (89ae89e9)** | manager | OWED. Then →
2. **Tester browser re-run** | tester | OWED. Confirm: slippage display (% primary, $ reserve-USD
   label), the v26a frame re-fit (dot ~fixed while axes rescale — one-line revert if it reads
   worse), and the curve = GH continuation. Playwright needs storage.googleapis.com allowlisted.
3. **v26b — ITM/American exercise build** | intern | CLEARED, NOT STARTED. Build on HEAD.
   Spec: specs/SPEC_itm_exercise_smoothpaste_NEXT.md. Adds a seam gate (verify/seam_gate.js).
   After build → tester for the portfolio visual (dropped "Eff strike" column + uncapped ITM curve).
4. **Blob-ledger reconcile** | manager + architect | OPEN. Files carry `ab663f5c`/`c505b08a`
   (canonical); ledger lists `8d2e1a84`/`1b320fc5` (minified broken set). Fix the ledger; do NOT
   restore minified blobs.
5. **Layer-2 honest-dollar slippage $** | manager/intern | DEFERRED, non-blocking. Route reserve-USD
   through the existing carved-perp settlement chain (oracle/oi · L0·N); reuse, don't improvise.
6. **Lean GH gate-discharge** | prover (Aristotle) | OPEN. Instantiate GH, discharge the 4 gate
   fields; watch `coercive = BddBelow` (GH has bounded reserves X∈(0,Nx), Y∈(0,Ny·M)).
7. **Ship-gate B1 — funding-coverage sweep** | manager/intern | OPEN. The one thing geometry can't
   close (κ is extrinsic).
8. **Publication pipeline** | manager | background. AFT 2026 submitted (notify Jul 15). WINE 2026
   (Jul 2). FMBC 2027 for the Lean paper. Must-cite: Singh et al. (LVR as continuum of perpetual options).

## Immediate next action
Either (a) manager verifies HEAD and routes to tester, or (b) intern begins v26b ITM on HEAD per
the spec. Order matters: HEAD must clear before v26b is called done; v26b goes to tester before "done".

# Slippage units fix — DONE (intern pass). To manager C-mgr-0608.
Deliverable md5: **89ae89e9df229186b134ca6638726d0c**
Lineage: v25_gh 9910c699 -> v26a fixes 951d16eb -> 2c0337e8 (slippage WIP) -> **89ae89e9 (slippage fixed)**.

## What changed (diff is exactly this)
- **Both slippage paths reference the geometric marginal** `mpGeom = getMP_raw * e^(-ghMu)`:
  - `%`: `legSlipFrac` uses `mpGeom(pre)` (was `getMP_raw(pre)`, which pinned it ~97% flat).
  - `$`: `legSlipUsd` uses `mpGeom(pre)`; the old `const margPrice = getMP_raw` is REMOVED (the
    prior `margPrice -> getMP_raw` ratification was the e^mu-inflated bug — now corrected).
- **getMP_raw comment** corrected: `// |dy/dx| raw (Layer 1)` -> `// carry price coordinate =
  e^mu * |dy/dx|; equals oracle at equilibrium (NOT the geometric slope)` (the root-cause mislabel).
- **Slippage% tooltip** relabeled: the `$` is a pool-level price-impact cost in Layer-1 reserve
  USD, not a trader honest-dollar figure; metric described as realized-avg vs geometric marginal.
- **curveTrace angle: NOT touched** — verified unused. The live `drawCurvePts` reads only `[x,y]`;
  segment color is `curveSegmentColor(x,y) = (y/x > modeSlope)`, a position test in geometric
  reserve space (no getMP_raw, no tangent). So the stored `Math.atan(o)` is dead; no draw-layer
  slope-conflation site exists. The brief's conditional resolves to skip.

## Verification (all green)
- `slope_test.js`: `getMP_raw/|dy/dx| = e^ghMu` confirmed at gamma{1.5,2,3,4} (11.68/44.52/748.6/13780).
- `slip_accept.js` targets reproduced BY THE SPLICED FUNCTIONS (not just engine-derived): x1.02
  0.99%/$3.46, x1.2 9.09%/$249.49, x2 33.34%/$2246.00, x6 71.45%/$6240.94. % grows sanely, $ finite/growing.
- `verify_v26a_mine.js`: 7 GH gates x 4 gamma PASS; curveTrace 401/401 (slope err 5.16e-12); marker
  on-curve; 3 scripts parse; sigs + IIFE intact; no blob-in-script. Engine `getMP_raw` body unchanged.
- **No silent default:** `mpGeom(state without ghMu)` = NaN (loud). `ghMu` confirmed present on the
  pool, on `tradeUpdate` output, and on `arb` output; `executeBand` is called with `state.pool`/`s.pool`.
- Surgical diff vs 2c0337e8 = the four regions above, nothing else.
- File-safety: blobs held at `ab663f5c` / `c505b08a`; `node --check` clean x3.

## Carried-forward flags (NOT part of this splice)
- **Blob-ledger reconcile (directional):** the files carry `ab663f5c`/`c505b08a` (273917/5240,
  original); the ledger's `8d2e1a84`/`1b320fc5` (205398/3875) is the smaller, optimizer-shrunk set
  = the minified "broken cut." Files are canonical; **fix the ledger, do not restore the minified
  blobs.** Owner: manager + architect.
- **Layer-2 honest-dollar slippage $ (follow-up, non-blocking):** the `$` is reserve-USD. Trader-
  faithful cost would route the reserve-USD figure through the existing carved-perp settlement chain
  (oracle/oi . L0.N) — reuse it, don't improvise; if not cleanly reachable at the slippage site, ship
  the `%` alone and defer. Separate task.

## Routing
Manager independent verify owed, then tester browser re-run (slippage display + the v26a frame
re-fit / dropped-column visual). After that, v26b ITM/American builds on this base.

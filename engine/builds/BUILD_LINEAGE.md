# builds/ — lineage & integrity

All four are the same single-file simulator at different points. **Work from HEAD.**
The two earlier non-HEAD builds are kept so any one recovers the history and so a diff can
show exactly what each step changed.

| file | md5 | status |
|---|---|---|
| temporal_mvp_v25_gh.html | `9910c69924fd0b413dbb75e5b4ca56a0` | barrier→GH swap baseline; gates green |
| temporal_mvp_v26a_fixes.html | `951d16eb1cfd0db24b2deffff30cd876` | + 3 barrier-remnant fixes; gates green |
| temporal_mvp_v26a_2c0337e8_slipWIP.html | `2c0337e8e0260e7dae6072e241d764f0` | + slippage WIP — **KNOWN-BROKEN (~97% flat)**; lineage only, do not ship/build on |
| **HEAD_temporal_mvp_v26a.html** | `89ae89e9df229186b134ca6638726d0c` | + slippage units fix; gates green; **build on this** |

Predecessor (pre-GH, in notes context only): `temporal_mvp_v24_rebase_fixed_2.html` was the
barrier-curve build before the GH swap — not included; superseded by v25_gh.

## Blob baseline (canonical — verify against THIS, not any ledger)
Both blobs must be byte-identical across every safe edit:
- **webp** (background), line ~74, length **273917**, md5 **`ab663f5c26f2a461c5b0ef1421d0ad74`**
- **svg** (logo), line ~1060, length **5240**, md5 **`c505b08ad0e4c6b0fb9e64e9679fe291`**

⚠️ A ledger elsewhere records the blobs as `8d2e1a84` (len 205398) / `1b320fc5` (len 3875).
Those are **smaller = optimizer/minifier output = the broken cut.** The files above are
canonical. Reconcile the ledger to the files; never restore the minified set. (Open thread.)

## Quick integrity check (any build)
```sh
md5sum builds/HEAD_temporal_mvp_v26a.html                      # expect 89ae89e9...
sed -n '74p'   builds/HEAD_temporal_mvp_v26a.html | md5sum     # expect ab663f5c...
sed -n '1060p' builds/HEAD_temporal_mvp_v26a.html | md5sum     # expect c505b08a...
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

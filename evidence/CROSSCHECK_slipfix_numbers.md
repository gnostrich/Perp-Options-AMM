# verification_evidence/CROSSCHECK_slipfix_numbers.md

Manager's independent reproduction of the tester's browser slippage numbers, to confirm the PASS is sound (not a V5-style ratification of a wrong formula).

## Method
Sandboxed the `<script id="engine">` block from `89ae89e9` in Node. Default pool = `Engine.ghCalibrate(5, 400000, 80000, 2)` with `{x:10, y:800000, alpha:5, beta:400000}` — confirmed identical to the build's `_p0` default (lines 2172–2184, `GH_GAMMA = 2.0`). For each price-move multiple the tester hit, computed the **single-leg** arb slippage `|dY/(mpGeom·dX) − 1|` with `mpGeom = getMP_raw·e^(−ghMu)`, and compared to the tester's **two-leg band** result.

## Result
| move | single-leg % (engine) | tester band % (browser) | band ≥ single? |
|---|---|---|---|
| ×1.022 | 1.09% | 1.10% | yes (≈ equal at tiny move) |
| ×1.217 | 9.79% | 10.06% | yes |
| ×1.876 | 30.46% | 33.19% | yes |
| ×3.858 | 58.85% | 70.40% | yes |

## Why this is sound
- **Right composition signature.** At a tiny move the band ≈ a single leg (1.10 vs 1.09); as the move grows the two-leg composition `(1+s1)(1+s2)−1` pulls the band progressively above the single-leg figure (58.85 → 70.40 at the big move). Monotonic, finite.
- **Neither failure mode present.** Not ~97%-flat (the old bug). Not divided by `e^μ≈44.5` (a small move reads ~1%, not ~0.02%) — so the % is using `mpGeom` correctly, not the price coordinate.
- **Display = the correct formula.** Read the `executeBand` slippage block directly: it computes `s_band` and `slipUsd` from `mpGeom`, it is the only slippage site, and its output flows straight to `setSummary`. This is the distinction from V5, where display matched a *wrong* formula.

I could not reproduce the exact band number without replaying `executeBand`'s two-leg construction (`V_sell → N_buy` linkage, `executeLeg` internals) — a fragile replay I judged not worth the false-alarm risk. Magnitude, direction, monotonicity, and the absence of both failure signatures are confirmed, which rules out the V5 failure mode. Slipfix PASS accepted as sound.

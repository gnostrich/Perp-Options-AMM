# Fix note — three barrier remnants left after the GH swap

**File to edit:** `temporal_mvp_v25_gh.html` (this package).
**Status:** the GH engine swap itself is verified correct — the four curve functions, calibration, carry-P, rebase, and all seven gates pass at γ∈{1.5,2,3,4}, faithful to high-precision GH. **Do not touch the engine math.** These three fixes are *barrier formulas the swap missed* in the trade-accounting and draw layers — they re-derive the curve instead of calling the engine, so the gates never saw them.

Line numbers are from the current file and will drift as you edit — anchor on the function names.

---

## Fix 1 — slippage price in the trade path (MUST FIX: wrong number)

**Where:** ~line 1859, inside the composite-ray / band-trade function.
**Now:**
```js
const margPrice = (s) => s.alpha * s.y * s.y / (s.beta * s.x * s.x);
```
**Problem:** that is the *barrier* marginal price. Under GH it is **32% off** the true execution price after a trade, so the dollar slippage (`slipUsd`) reported on every band trade is wrong. `p₀` is meant to be the pre-trade marginal price — which is exactly what `getMP_raw` returns now.
**Fix (one line):**
```js
const margPrice = (s) => getMP_raw(s);
```
`getMP_raw` is in scope here (same engine IIFE). Nothing else in this function changes.
**Check:** on a moved pool, `margPrice(s)` must equal `getMP_raw(s)` exactly; gates still pass.

---

## Fix 2 — the drawn pool curve is still barrier-shaped (visual)

**Where:** `curveTraceExplicit` (~3160) and `curveTrace` (~3173), in the draw layer.
**Now:** `curveTraceExplicit` plots `x = k·m^(−(1−w))`, `y = m·x` — the Balancer weight-form — fed by the stale `getDepth` (`snap.depth`). So the picture is the **barrier curve while the engine prices GH**; the reserves dot will drift off the drawn curve as you trade.
**Fix:** trace the GH curve from the engine instead of the weight-form. The draw layer only has the engine's *exposed* functions (no access to the internal CDFs), but `arbitrageToOracle` already returns an on-curve point for any price, so sample with it. Reference (adapt to the real draw code):
```js
function curveTrace(snap){
  const pts = [];
  const N = 400, mp0 = Engine.getMP_raw(snap);
  for (let i = 0; i <= N; i++){
    const o  = mp0 * Math.exp(-6 + 12 * i / N);   // span the price range around current
    const st = Engine.arbitrageToOracle(snap, o); // on the SAME GH curve (shape preserved)
    if (st && st.x > 0 && st.y > 0) pts.push([st.x, st.y, Math.atan(o)]);
  }
  return pts;
}
```
This retires `snap.depth` / the weight-form from the live trace. (`getDepth` itself stays defined and stale per the brief — just stop driving the picture with it.)
**Check (tester, since I can't run the browser):** the reserves dot sits *on* the drawn curve at open and stays on it after trades and a rebase.

---

## Fix 3 — equilibrium marker sits off the GH curve (visual)

**Where:** ~lines 3215–3216, in `drawCurve`. This is the **inline arb duplicate the brief told you to keep in lockstep with `arbitrageToOracle`** — it was missed.
**Now:**
```js
const xEq = alpha + Math.sqrt(alpha * beta / oracle);
const yEq = beta  + Math.sqrt(alpha * beta * oracle);
```
**Problem:** barrier arb point → the reference dot lands off the GH curve, and the frozen frame is sized to barrier geometry.
**Fix:** take the equilibrium point from the engine:
```js
const eq  = Engine.arbitrageToOracle(snap, oracle);
const xEq = eq.x, yEq = eq.y;
```
Use that for the marker dot and the (first-draw) frame extents.
**Check:** the equilibrium dot lands exactly on the drawn GH curve.

---

## FLAG — do NOT guess: the anchor reference curve

`curveTraceExplicit(0.5, snap.depth, modeSlope)` (~3224) and the second view's `curvePts(snap.w, snap.w)` (~3711) draw the **w=½ anchor** — the funding baseline. Its correct GH form depends on what the anchor *is* under the swap (symmetric reference / funding semantics), which is a design call, not an implementation one. **Leave it as-is and flag it to the manager** — don't convert it on your own. It's a reference picture, not a correctness bug in the pool.

---

## Scope, order, and safety
- Do **Fix 1** first (it's the only wrong *number*; one line). Then **Fix 2 + Fix 3** together — same draw area.
- **Do not** change any engine function signature, the four swapped functions, the calibration, or the blobs.
- File-safety (see `recipe_html_blob_editing.md`): never emit base64 blobs; after every edit, Node-parse all three `<script>` blocks via `new Function`; confirm the two blob lengths unchanged (webp data-uri 273918, svg 5241); IIFE intact.
- **Verify:** run `node verify/my_verify.js` from the folder holding the html — all seven gates must still pass after your edits (this confirms you didn't disturb the engine). The two visual fixes then go to the tester for a browser run.
- Stop-on-red: if gates go red or a script fails to parse, stop and report.

# Splice brief — slippage units fix (geometric marginal). To intern, from OG manager.

**File:** `temporal_mvp_v26a_2c0337e8.html`. **Status:** confirmed not-shippable on the slippage units bug; this is the fix. Engine math is correct — **do not touch the curve/calibration/gates.** This is the slippage block + two comments + one draw-layer angle.

## Decision (settled)
- **(b) confirmed:** `getMP_raw` is the carry **price coordinate** (= oracle at equilibrium, by the no-arb gate), **not** the geometric slope. Verified independently: `getMP_raw / |dy/dx| = e^ghMu` exactly (44.52 at γ=2).
- **$-path ratification reopened** (the prior `margPrice → getMP_raw` was wrong — it used the e^μ-scaled coordinate as the per-unit price).
- **Both paths reference the geometric marginal:** `mpGeom(pre) = getMP_raw(pre) * Math.exp(-pre.ghMu)`.
- **$ basis = Layer-1 reserve-USD**, labeled as a pool cost. (Layer-2 honest-dollar is a separate, non-blocking follow-up — see end. The % is basis-independent and correct either way.)

## The splice (slippage block, ~1842–1870)

```js
const mpGeom = (s) => getMP_raw(s) * Math.exp(-s.ghMu);   // geometric reserve marginal |dy/dx| (getMP_raw is the e^mu price coordinate, not the slope)

const legSlipFrac = (pre, post) => {
  const dY = Math.abs(post.y - pre.y), dX = Math.abs(post.x - pre.x);
  return dX > 1e-18 ? Math.abs(dY / (mpGeom(pre) * dX) - 1) : 0;     // e^mu cancels -> pure geometric slippage
};
const legSlipUsd = (pre, post) => {                                  // Layer-1 reserve-USD cost
  const dY = Math.abs(post.y - pre.y), dX = Math.abs(post.x - pre.x);
  return Math.abs(dY - mpGeom(pre) * dX);
};
```
- Remove the `const margPrice = (s) => getMP_raw(s);` line; replace its use with `mpGeom`.
- Confirm `ghMu` is present on each pre-state passed in (`state.ghMu`, `leg1.newState.ghMu`). The gh-scalars ride the pool/snap, so leg states should carry it — **assert it's defined; if any leg pre-state lacks `ghMu`, stop and report** (don't default it).

## Comment fixes
- On `getMP_raw`: change `// |dy/dx| raw (Layer 1)` → `// carry price coordinate = e^mu * |dy/dx|; equals oracle at equilibrium (NOT the geometric slope)`. This mislabel caused the bug — fix it so it doesn't recur.

## Draw-layer angle (same bug, second site)
- In `curveTrace`, the points are pushed as `[st.x, st.y, Math.atan(o)]`. The geometric slope at that point is `o * e^(-snap.ghMu)`, not `o`. If that third element is used as a tangent/slope angle, change to `Math.atan(o * Math.exp(-snap.ghMu))`. If it's unused for slope (cosmetic/ordering only), leave it and note so. The curve *points* are already correct — this is only the angle.

## Display label
- The inline `≈ $X` is reserve-USD (pool cost), not honest-dollar. Label it so it can't be read as the latter (e.g. tooltip: "pool-level price-impact cost in reserve USD"). The `%` is the primary, basis-independent figure.

## Acceptance (γ=2, validated on the engine)
- **% grows sanely:** x1.02 → 0.99%, x1.2 → 9.09%, x2 → 33.34%, x6 → 71.45% (old path was ~97% flat — that's the tell it's fixed).
- **$ finite & growing:** ~$3.46 / $249 / $2246 / $6241 for the same moves.
- **7 GH gates still green** (engine untouched — slippage is display-only).
- **Diff is only:** the slippage block + the two comments + (maybe) the curveTrace angle. Nothing else.

## File-safety
- No blob emission; 3-script parse via `new Function`; signatures + IIFE intact; blob lengths unchanged. Stop-on-red.

## Flags (not part of this splice)
- **Blob-ledger mismatch:** the ledger lists the ratified blobs as `8d2e1a84/1b320fc5`, but this file (and 951d16eb) actually carry `ab663f5c/c505b08a`. Reconcile which is canonical before any "blobs verified" sign-off — the file is self-consistent, the ledger isn't.
- **Follow-up (non-blocking): Layer-2 honest-dollar slippage $.** If the spec owner wants the trader-faithful cost, convert the reserve-USD figure through the **existing** carved-perp settlement chain (oracle/oi · L0·N) — reuse it, don't improvise. If it isn't cleanly reachable at the slippage site, ship the % alone and defer the $. Separate task.

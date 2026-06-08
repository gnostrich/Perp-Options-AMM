# GOTCHAS.md — traps that bit us (read before touching the engine or slippage)

## 1. `getMP_raw` is a PRICE COORDINATE, not the slope `dy/dx`  ← the big one
`getMP_raw(s)` equals the oracle at equilibrium (the no-arb gate and `arbitrageToOracle`
target it). But the geometric reserve slope is `|dy/dx| = getMP_raw · e^(−ghMu)`. They differ
by `e^ghMu` exactly:

    γ:        1.5      2       3        4
    e^ghMu:  11.68   44.52   748.6   13779.9     (verified, verify/slope_test.js)

So the factor **explodes with γ**. Consequences:
- Anything comparing a price to a geometric `Δy/Δx` (slippage %, $ cost, tangent angles) MUST
  use `mpGeom = getMP_raw · e^(−s.ghMu)`. Read it off `s.ghMu` per state; never hardcode 44.5.
- A missing `ghMu` must yield NaN (loud), never silently default to `e^0=1`. mpGeom written as
  `getMP_raw(s)*Math.exp(-s.ghMu)` does this for free.
- **History:** the original slippage used a barrier weight-form. A re-cut swapped it to the
  marginal-price *ratio* `|getMP_raw(post)/getMP_raw(pre)−1|` — finite (e^μ cancels in a ratio)
  but it's price-IMPACT, explodes at the tail (3.3e8%). The realized-average fix
  `|dY/(getMP_raw(pre)·dX)−1|` then pinned at ~97% flat because `dY/dX` (geometric) was compared
  to `getMP_raw` (coordinate) — the e^μ mismatch. The correct fix references `mpGeom`
  (now in HEAD). The $-path had the same inflation and was corrected too. A prior manager shipped
  a wrong fix by trusting the mislabeled `// |dy/dx| raw` comment; re-derivation caught it.
  **Moral: re-derive against geometry; comments lie.**

## 2. Gates are mostly self-consistency, not accuracy
The 7 GH gates test: open mp0, arb round-trip (getMP_raw∘arb = oracle), rebase /r, reserve
bounds, monotonicity. These are **self-consistency** — a price/slope conflation passes all of
them. The single true **accuracy** gate is **G4: value ∝ S^(−γ)**. The ITM work adds a **seam
gate** (value+slope match ≤0.15% at the free boundary). When something "passes the gates" but
smells wrong, check it against G4 / geometry directly.

## 3. Catastrophic cancellation in the GH tail
Computing the OTM tail as `1 − F_β` cancels catastrophically and **silently** fails the arb
round-trip for γ≥2 (worse as γ grows). Use **direct upper-tail integrals** (dual-accumulate:
lower CDF from the left, upper tail from the right). This is baked into the verified engine —
do not "simplify" it back to `1 − F`.

## 4. Performance: integrate once, cache by shape
Direct GH integration per call was ~40ms (`getMP_raw`) / ~114ms (`tradeUpdate`) — UI-blocking.
The fix: build the CDF table **once at calibration** in centered `v = u − μ` (μ-independent, so
rebase-stable), keyed by shape in a **module-level cache** (`_ghCache`), not on the pool. Lookups
are ~0.6µs with linear interp; same-table inversion makes round-trips floating-point exact. The
pool serializes only the scalar `gh*` params; the table re-derives on load. Don't move the table
onto the pool (breaks export/import) and don't re-integrate per call.

## 5. The GH pool opens near its OTM extreme (bounded reserves)
At open the pool sits deep OTM on the asset side (X ≈ 0.004% of Nx) and near max on the cash side
(Y ≈ 96% of Ny·M; OTM-side headroom ≈ $18k on the $400k pool at γ=2). This is correct for an
OTM-pricing curve. But the GH curve has **bounded reserves** (X∈(0,Nx), Y∈(0,Ny·M)) where the
barrier was unbounded — an oversized cash-add (pushing Y past Ny·M) **clamps to the table edge**
rather than returning null. `tradeUpdate` does not currently reject such trades. Not a v26a bug;
relevant to trade-validation and to the prover's `coercive = BddBelow` (reserves are bounded).

## 6. snapshot() must carry the gh-scalars for the draw layer
The draw layer samples the engine on `snap` (via `arbitrageToOracle(snap, …)`). `snapshot()`
therefore returns `{...p, w, depth, sNorm}` (spreads the pool's gh* scalars). If you "tidy" it
back to an explicit field list and drop the gh*, the live curve and equilibrium marker silently
break (NaN from `arbitrageToOracle`). The curveTrace 3rd element (`Math.atan(o)`) is **dead** —
`drawCurvePts` reads only `[x,y]`; color is `curveSegmentColor(x,y)=(y/x>modeSlope)`, geometric.

## 7. File-safety traps
- **Blob layers — `8d2e1a84`/`1b320fc5` is NOT a "minified broken cut."** It is the *decode* of the
  same canonical blob whose **line-layer** md5 is `ab663f5c`/`c505b08a` (273864 b64 ×¾ = 205398 bytes
  exact). One blob, three layers (line / b64-payload / decoded-binary). The hook + `run_all.sh` key
  off the **line layer** `ab663f5c`/`c505b08a` — verify against that. There is no second artifact to
  "restore." (RECONCILED 2026-06-08; was mislabeled when a decode-hash was compared to a line-hash.)
- An asset optimizer/minifier once broke a cut. **Never run one** on the HTML.
- Splice with on-disk Python, assert each anchor fires exactly once, and add `\n` to replacement
  strings that replace newline-terminated lines (else you merge two statements onto one line — a
  real near-miss; valid JS but ugly and confusing). See splices/SPLICE_METHOD.md.

## 8. Smooth-pasting (for v26b ITM) — the free boundary is BELOW the strike
Don't cap the mark at the strike (that kinks and throws away time value). Continuation `c·sNorm`
runs past the strike to `sNorm* = θ·((γ+1)/γ)^γ`, price `S* = K·γ/(γ+1) < K`. Value match + slope
match at S* uniquely fix the coefficient `c = 1/((γ+1)·sNorm*)` and the boundary — no free params.
The drawn curve must show GH continuation up to sNorm* then intrinsic past it.

# SPEC — strike registration fix (mark + chart-ray basis), v26c

**Operator-ruled 2026-06-08.** The wing defect is a **strike-basis mismatch**, not directional.
Geometry (the north star — hold this, don't patch three symptoms):

> The instrument is two curve comparisons. (1) Pool curve vs anchor curve (w=½): the gap is
> extrinsic value, the gap's slope is funding, the gap's symmetry is call/put. (2) Pool curve vs
> strike-intrinsic line: where continuation tangentially kisses intrinsic = the free boundary, past
> it = pure intrinsic. Extrinsic and intrinsic are ONE pool curve read against two references,
> smooth-pasted where they meet.

The **only** fix is the **registration mark**: the strike is the single mark dropped onto the pool
curve, and it must be in the curve's own coordinate. Current `θ=K/oracle` is price-ratio (∝S⁻¹),
not the curve's carry coordinate (sNorm ∝ S⁻ᵞ); they agree only at γ=1, so for γ>1 the OTM→ITM
crossover drifts to oracle₀²/K. That drift is the entire defect.

## The fix
Register the strike in the curve's coordinate:
`θ_strike = sNorm(K) = getSNorm(arbitrageToOracle(state, K))` — the curve point where marginal
price = K, read its sNorm. **Use arbitrageToOracle (the price→position inverse); do NOT
finite-difference** (the slope↔angle map steepens near the boundary; FD aliases — same trap the
seam gate hit). Implementation dual is free (slope-based sNorm(K) vs polar-angle conjugate); they
agree at the registration point. **slope-based chosen** (verified, cleaner). The mandated invariant
is the geometry, not the formula: **the OTM→ITM crossover lands at K for all γ.**

Manager-verified: θ=sNorm(K) is γ-dependent (0.9295/0.9071/0.8639/0.8228 at γ=1.5/2/3/4) but the
crossover pins to K=84000 every time (err ~0). `sNorm=(oracle₀/S)^γ` exact.

## Apply to (carry-basis consumers of the strike ray)
- **mark path:** `pfComponents` ray `K=>K/oracleLive` (line ~4162) → feeds `Engine.mark` (~4174)
  and the `itm` regime test (~4176); plus `markEff`/`legValueUnified`/`legPrice` fed
  `band.sold.inner`/`.outer` (~2053/2065/2068/2076); `executeBand` mark calls (~1847/1856).
  NB: `pfComponents` currently gets only `oracleLive`, not the pool state — it needs the live pool
  state to run `arbitrageToOracle(state,K)`. Thread the state in (or precompute sNorm(K) at the
  caller and pass it). Keep the dollar strike `K_inner/K_outer` as the source of truth; θ is derived.
- **chart ray:** `drawStrikeRay` / `drawStrikeMark` fed `b.sold.inner`/`.outer` (~3413-14, 3609-11).
  (Intersects Finding-2 — which is the SEPARATE next increment; this just corrects the basis.)

## Do NOT touch
- **Funding (LOCKED).** Funding is the pool-vs-anchor slope-deviation; its crossover is already at K;
  directionality is the ±2 wing sign (orientation stamped on the signed gap), not part of the
  deviation. A θ-swap into funding would FLIP its sign (manager-tested) — wrong. No θ-swap, no
  reshape. The earlier "funding→0 deep ITM" target was a mistaken theta/extrinsic overlay — dropped.
- **isOTM / wingMember** — price-measure entry checks, already register at K; corrected mark now
  AGREES with them. Leave them.
- v26b pasting math — unaffected. This is NOT a rollback (just the registration coordinate).

## Acceptance checks (bake the permanent ones into the harness)
1. **Crossover at K** for γ∈{1.5,2,3,4} (mark OTM→ITM lands at the dollar strike, not oracle₀²/K).
2. **Mark agrees with the already-at-K entry checks** (isOTM/wingMember crossover == mark crossover).
3. **PERMANENT directional-consistency gate** (new): per wing, `sign(strike−oracle) == funding wing
   sign (±2) == sign(d(mark)/d(sNorm))` — measured in the curve's OWN coordinate (d/d-sNorm, NOT
   d/d-spot, which is opposite due to the reciprocal mark). Manager-verified these align under the
   corrected registration: CALL all +, PUT all − (flip across wings). So the curve-comparison can't
   silently re-register in the wrong direction. (This is the gap that let the bug survive: every
   prior gate tested self-consistency, never economic direction.) Wire into run_all.sh; a wing/
   direction swap must fail it. (Basis drift θ→K/oracle is caught by check 1, crossover-at-K — keep
   both: check 1 catches basis, check 3 catches direction.)
4. **Re-run 7 GH gates + seam** with the seam's directional assertions re-anchored to sNorm(K).
5. File-safety: blobs (line layer) unchanged, 3 scripts parse, IIFE intact.

## Sequence
**Operator ruled (A), 2026-06-08: the registration must be UNIFORM** — the strike is ONE mark on the
pool curve; registering it at K for the table, oracle₀²/K for execution, and the old basis on the
chart = three strikes for one instrument, and the screen would lie about what trades. So the fix
extends to **every curve-coordinate registration site**: display mark (v26c, done) + execution/
settlement path + chart strike-ray. **Finding-2 is ABSORBED here** — re-registering `drawStrikeRay`
to live `sNorm(K)` IS the Finding-2 fix (live registration also kills the stale entry-θ drift).

### Full (A) scope — extend v26c (`temporal_mvp_v26c_strikereg.html`)
- **Execution/settlement path:** `executeBand`/`closeBand` → `legPrice`/`markEff`/`legValueUnified` →
  `compositeRay`/`vsValue` → V → dy. Everywhere the strike enters as a CURVE coordinate (feeds
  mark/value), use `sNormStrike(state, K)` from the dollar strikes `K_inner/K_outer`. This is
  economically material (γ>1 trades currently priced ~10% off near the strike).
- **Chart strike-ray:** `drawStrikeRay` (fed `b.sold.inner`/`.outer`) → `sNormStrike`. = Finding-2.
- **LEAVE `drawStrikeMark`** (funding-polar marker) — funding is untouched and already at K; the
  strike ray and the funding marker sitting at different spots is CORRECT (different quantities).

### Guardrails (how reopening settlement stays safe — same discipline as v26b)
1. **Uniform** — no `K/oracle` left at any CURVE-coordinate registration site (mark/value/chart-ray).
   (Price-measure uses — `isOTM`/`wingMember`, funding's deviation — STAY on K/oracle; their crossover
   is already at K, so they're not the bug. "Registration site" = where the strike is dropped onto
   the curve to mark intrinsic, not the price-measure OTM/deviation gates.)
2. **Conversion structure byte-unchanged** — the stage-2→3 dollar pipe (`carvedNotional`/
   `entryPerpMark`/`dollarFigure`) is FED the correctly-registered value; the pipe itself does NOT
   change.
3. **§6 STOP-CONDITION LIVE** — if feeding the corrected registration cleanly requires a NEW dollar
   path, **STOP and re-escalate to the manager→operator**. Do NOT improvise settlement to fit. This
   is the line that lets the reopening be authorized at all.
4. **Quantify the premium delta** — pin the ~10% near-strike correction; confirm premiums move TOWARD
   the correctly-registered value; check the extremes + the free boundary for blowups.
5. **Full re-verify + mixed-basis negative control** — 7 gates + seam + dir_gate with EVERY site
   registered; ENHANCE dir_gate so a MIXED basis (any curve site left on K/oracle) TRIPS crossover@K —
   a future partial fix must not pass.

**Funding stays untouched throughout** — pool-vs-anchor deviation, already at K, not a registration
site. The execution pass must not drift into it. If clean: v26c becomes HEAD-promotable as the
complete coherently-registered build.

## (historical) initial scope note
The first v26c pass scoped to the display mark (`pfComponents`) only and STOP-and-reported the
execution/chart sites as locked-surface entanglements — correct discipline; operator then ruled (A).

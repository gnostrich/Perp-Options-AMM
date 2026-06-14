# RE-POSED SPEC — trade-point-anchoring warp (FAITHFUL construction) + operator invariant verdict

_research-lead, 2026-06-11. RE-POSE of the FLAG-WRONG spec
(`notes/research/SPEC_tradepoint_anchoring_fix_2026-06-11.md`, skeptic #18
`notes/skeptic/VERDICT_tradepoint_anchoring_spec_2026-06-11.md`) **+** verification of the operator's
entry-37 invariant. **NOTES-ONLY. NO engine edit, NO git, NO build touch, NO Aristotle submission.**
Operator is live-playing HEAD `1eebfcd6`. The intern does NOT build until the manager re-derives every
number and the skeptic re-reviews. Numeric script transcribed at the end (`/tmp/repose3.js`,
`/tmp/inv3.js`, `/tmp/gate.js`; node float64; mirrors the live engine functions byte-for-byte)._

---

## 0. WHY THE PRIOR SPEC WAS WRONG, AND THE ONE CHANGE THAT FIXES IT

The prior spec set `(α,β)` **at the trade point** and then moved `y′ = y_B + dy` **from the trade
point** — so the post-trade reserves rode the *trade-point's* hyperbola, not the pool's. The skeptic
demonstrated the teleport: dy=0.1 at K=1.6·mp0 moved the pool's y leg 12 → 15.0 and its spot 2.46 →
4.01. The trade-point `(α,β)` hyperbola does not pass through the live reserves (residual −0.80), so
the pool got launched onto a curve it was never on. That **discards the live reserves point** and
inverts the motive ("trades skew the curve INSTEAD OF moving the reserves point along it").

**The fix — the reserves channel and the warp channel are SEPARATED:**

| channel | reads from | role |
|---|---|---|
| **reserves move** (`α,β,wStar,x′,y′`) | the **LIVE spot** state `s` | keeps the pool FAITHFUL — `y′=s.y+dy`, on the pool's OWN hyperbola |
| **warp amount** (the field re-seat `z`, hence `φ′`) | gearing read at the **trade point** `tp` | makes the warp STRIKE-DEPENDENT (paper-faithful) |

The strike never enters *where the pool sits*; it enters *how much the curve warps*. This is exactly
the paper (L39: "the slope of the post-trade point is brought to the **pre-trade reserves point** by
warping the curve") and operator entry 31.

---

## 1. THE RE-POSED CONSTRUCTION (every quantity tagged spot/live vs trade-point)

Inputs: live state `s = (x,y,φ)` + static curve `(τ, w_−, w_+)`; cash leg `dy`; trade point
`tp = arbitrageToOracle(s, K)` (the curve point whose marginal price = the leg's dollar strike K; on
the SAME `F=k` level as `s` — `arbitrageToOracle` keeps the invariant).

```
wm = ½(w_-+w_+),  dw2 = ½(w_+-w_-),  τ = s.τ                 [STATIC curve]
wEntry = wField(s)                                            [LIVE spot weight]
α = s.x·wEntry,   β = s.y·(1-wEntry)                          [LIVE conserved — FAITHFUL]
─ reserves channel (from the LIVE point) ───────────────────
y′ = s.y + dy                                                 [reserves move from LIVE y]
w* = 1 - β/y′                                                 [β-conservation, LIVE]
   guard: w* ∈ (w_-, w_+)  else REJECT (wing-range)
x′ = α / w*                                                   [α-conservation, dx forced, LIVE]
u′ = ln(y′/x′),   u0 = ln(s.y/s.x)
─ warp channel (gearing from the TRADE POINT) ──────────────
z0 = t·τ/√(1-t²),   t = (w*-wm)/dw2                           [LEGACY exact field-reseat at SPOT field]
u_spot = ln(s.y/s.x) - φ,   u_tp = ln(tp.y/tp.x) - φ_tp       [field offsets]
G = w′(u_spot) / w′(u_tp),   w′(u) = dw2·τ²/(τ²+u²)^{3/2}     [STRIKE gearing — the 1/w′(u_tp) channel]
z  = z0 · G
φ′ = u′ - z                                                  [ONE global field center]
return _stampAB({ x:x′, y:y′, τ, w_-, w_+, φ:φ′ })
```

### 1.1 Why this is faithful (NOT teleported) — `[numeric, /tmp/repose3.js]`

On the gate pool `{x:10, y:12, τ:0.3, w∈[0.52,0.72], φ:0}`, mp0=2.457812, **same dy=0.1 at every
strike**:

| K/mp0 | x′ | y′ | φ′ | spot-after | G |
|---|---|---|---|---|---|
| 1.00 | 9.959812 | 12.100000 | −0.001104 | 2.51915 | 1.0000 |
| 1.05 | 9.959812 | 12.100000 | −0.025544 | 2.57180 | 1.1248 |
| 1.10 | 9.959812 | 12.100000 | −0.054467 | 2.62827 | 1.2726 |
| 1.30 | 9.959812 | 12.100000 | −0.224449 | 2.85254 | 2.1410 |
| 1.60 | 9.959812 | 12.100000 | −0.684490 | 3.04251 | 4.4911 |
| 2.00 | 9.959812 | 12.100000 | −1.724384 | 3.10547 | 9.8034 |

**`(x′, y′)` is IDENTICAL across all strikes** (9.959812, 12.100000) — and identical to the legacy
spot-anchored move (legacy gives the same 9.9598/12.10). The reserves point is *exactly where the cash
leg puts it*, independent of strike. **The pool does NOT teleport.** Compare the prior FLAG-WRONG spec,
where y′ ran 12.10 / 12.53 / 15.01 / 17.20 across these strikes — that was the teleport, and it is gone.

Only `φ′` (the pricing-curve shape) and hence the spot marginal warp by strike — which is precisely
"trades skew the curve." The spot-after drift (2.52 → 3.11) is the *curve reshaping*, read at the
faithful reserves; the reserves themselves stay put. (The drift is large at the deepest trade points
because the warp is large there — see the invariant verdict §2: that large-OTM warp is the genB
`1/w′(u_tp)` blow-up, not a teleport.)

### 1.2 Spot-reduction is now EXACT (byte-identical), better than the prior 1.67e-16 — `[numeric, /tmp/gate.js]`

When `tp == spot` (leg registered at the live reserves), `u_tp == u_spot` ⇒ **`G == 1` exactly** ⇒
`z == z0` ⇒ the construction is the legacy `tradeUpdate(s, dy)` **identically**:

| dy | \|Δφ\| (reposed − legacy) | \|Δx\| |
|---|---|---|
| 0.1 | 0.00e+0 | 0.00e+0 |
| 0.5 | 0.00e+0 | 0.00e+0 |
| −0.3 | 0.00e+0 | 0.00e+0 |

This is **0.0 exact** (not the prior spec's 1.67e-16) because `G=1` is an algebraic identity, not a
bisection round-trip — the spot path never calls `arbitrageToOracle` for `z`. The
anchor-omitted / `executeBand` internal-arbitrage calls (`tradeUpdate(s,±X/Y)`) stay byte-identical to
today (Option-A wiring confirmed by the skeptic, kept verbatim).

### 1.3 Why the φ-reseat scaling is the RIGHT discrete form

The legacy `z0 = t·τ/√(1−t²)` is the **exact field inversion** for the field centered at φ′ (it solves
`w(u′−φ′)=w*`); it is the must-not-regress baseline (skeptic confirmed). The genB law
(`WARP_genB_kurtosis_generalisation_2026-06-10.md`) says the field-recenter *rate* carries the factor
`1/w′(u_tp)` — the strike channel. Two naive discretizations FAIL the exact spot-reduction:

- `z = (w*−wm)/w′(u_tp)` (first-order gearing) ⇒ |Δφ| = 6.7e-2 at spot — **not exact** (`/tmp/repose.js`).
- integrated genB `z = z0 + (1/w′(u_tp))·β·(1/y0−1/y′)` ⇒ |Δφ| = 4.0e-4 at spot — **not exact**
  (`/tmp/repose2.js`).

The **curvature-ratio form `z = z0·G`, `G = w′(u_spot)/w′(u_tp)`** is the unique discretization that
(a) reduces to the legacy exact `z0` when `tp=spot` (`G=1`), and (b) carries the genB `1/w′(u_tp)`
strike gearing as a *relative* factor against the spot curvature. It keeps the exact field-inversion at
spot and refracts it through the trade-point curvature off-spot. This is the load-bearing correction
over the prior spec, which (wrongly) put the strike-dependence in the reserves.

### 1.4 φ-consistency (the one-global-φ subtlety) — RESOLVED, on the POOL's OWN hyperbola now

`φ′` is set from the **post-trade reserves point** `(x′,y′)` (which is on the **pool's own** trajectory
hyperbola `(x−α)(y−β)=αβ` with the **LIVE** `(α,β)`) — NOT the trade point's hyperbola. So §1.3 of the
old spec ("both points ride one (α,β) trajectory") is now mounted on the correct (live) reserves: the
single φ′ reproduces `w* = 1−β/y′` at the actual reserves point. The trade point supplies ONLY the
gearing scalar `G`; it never owns the reserves. **HONEST CARRY unchanged:** the certificate that this
single-φ′ construction is anchor-path-independent is the `(α,β)`-flow-confinement lemma — numeric 0.0
but **`[needs-Aristotle]`, OPEN, NOT Lean-certified. Do not report as proven.**

---

## 2. OPERATOR INVARIANT (entry 37) — "same curve warp for any strike, same notional, single SELL leg?"

### VERDICT: **NO. The invariant does NOT hold.** Same notional gives MATERIALLY MORE warp further OTM.

The warp is **not** a function of notional alone. It factors cleanly as

> **|Δφ| ≈ z0 · G**,  where  **z0 = z0(w*)** is the NOTIONAL/cash channel (depends on dy)
> and  **G = w′(u_spot)/w′(u_tp) ∝ 1/w′(u_tp)** is the STRIKE channel.

and **the strike channel dominates.** Concretely (sell call, fixed notional N=2e-6, dy=N·mark·oracle
through the real `executeLeg` path, `/tmp/inv3.js`):

| K/mp0 | mark | dy | w* | z0 (notional ch.) | G (strike ch.) | \|Δφ\| |
|---|---|---|---|---|---|---|
| 1.00 | 1.45e-1 | 2.33e-2 | 0.67257 | 0.1854 | 1.0000 | 1.91e-4 |
| 1.10 | 1.52e-1 | 2.43e-2 | 0.67260 | 0.1855 | 1.2726 | 5.08e-2 |
| 1.40 | 1.65e-1 | 2.64e-2 | 0.67266 | 0.1858 | 2.7726 | 3.30e-1 |
| 1.80 | 1.73e-1 | 2.77e-2 | 0.67269 | 0.1860 | 6.8414 | 1.09e+0 |
| 2.00 | 1.75e-1 | 2.80e-2 | 0.67270 | 0.1860 | 9.8034 | 1.64e+0 |
| 2.30 | 1.77e-1 | 2.83e-2 | 0.67271 | 0.1861 | 15.281 | 2.66e+0 |

**z0 is essentially flat** (0.1854 → 0.1861) — the notional channel barely moves. **G runs 1.0 → 15.3**
and **|Δφ| tracks G** (1.9e-4 → 2.66). Same notional ⇒ warp grows ~14000× from ATM to deep OTM. The
invariant is **decisively false** — the warp is, to first order, **strike-dependent, not
notional-only.**

### What the warp actually scales with (characterised plainly):

> **warp |Δφ| ≈ z0(dy) · G(K),   G(K) = w′(u_spot)/w′(u_tp(K)) = (τ²+u_tp²)^{3/2} / (τ²+u_spot²)^{3/2}.**

- **z0(dy)** is the notional/cash factor: monotone in |dy|, the legacy field-demand. For a SELL leg of
  notional N this is ≈ constant across strikes (because dy=N·mark·oracle and the OTM-barrier mark
  varies only mildly relative to spot sNorm — 1.45e-1 → 1.77e-1 here).
- **G(K)** is the strike factor: the genB `1/w′(u_tp)` field-curvature gearing, **growing steeply as the
  trade point moves toward a frozen wing** (w′→0 ⇒ 1/w′→∞). This is the same `~27×`-across-strikes
  spread the skeptic reproduced for the discrete form, and the divergence is the frozen-wing range cap.

Confirmed proportionality `|Δφ|/(z0·G)` is O(1) and stable (0.215 → 0.898 across the band; the residual
trend is the saturation of the exact reseat `z0` vs the linear gearing — both monotone, same sign).

### Reconcile with "same premium ⇒ more warp OTM":

This **also holds, and for the same reason.** Fix dy directly (same premium/cash, `/tmp/inv3.js`):
z0 is then **exactly constant** (0.1890 at every strike — it is a pure function of dy), and warp grows
4.6e-4 → 2.33 purely through G. So:

- **same premium ⇒ more warp OTM**: ✅ (z0 fixed, G grows).
- **same notional ⇒ more warp OTM**: ✅ (z0 ≈ fixed since dy≈fixed, G grows).

Both follow from **warp = z0·G with G the dominant strike channel.** The operator's framing "same
premium ⇒ more warp OTM" is exactly right; but the stronger claim "same notional ⇒ *same* warp" is the
one that fails — because the warp is governed by the trade-point curvature `1/w′(u_tp)`, not by the
cash size. **Warp ∝ notional is FALSE; warp ∝ (notional-factor z0) × (strike-curvature gearing G).**

> **HONEST FRAMING for the operator (via manager):** I did not force the invariant. If the operator
> *wants* warp to be notional-only / strike-independent, that is a DIFFERENT construction (it would
> require dropping the `1/w′(u_tp)` strike gearing — i.e. NOT trade-point-anchored, contradicting
> entry 31/36). The trade-point-anchored construction the operator authorized is, by its own genB
> structure, **necessarily strike-dependent.** "Same notional, same warp" and "trade-point-anchored"
> are mutually exclusive on (W). That tension is an operator/curve-object call, flagged.

### Note on the curve-reshape metric (not just φ-center):

The genuine curve-reshape `Δln(mp)` at a fixed reference ray gives the **same qualitative verdict**
(4.3e-4 → 0.224 at fixed premium across strikes, `/tmp/inv3.js`), so the NO verdict is metric-robust —
it is not an artifact of measuring φ-center travel. (Δln(mp) saturates near the wing where φ has no
leverage, while |Δφ| keeps growing — both monotone-increasing in strike OTM, both reject the invariant.)

---

## 3. CONTRACT / REDUCTION CHECKS (re-derived on the RE-POSED construction)

| check | requirement | result | tag |
|---|---|---|---|
| **Spot-reduction** | tp==spot ⇒ legacy exactly | \|Δφ\|=**0.0**, \|Δx\|=**0.0** (G=1 identity) | `[numeric]` |
| **Faithful reserves** | (x′,y′) strike-independent at fixed dy | IDENTICAL across all K (9.9598/12.10) = legacy | `[numeric]` |
| **α/β conservation** | on the LIVE (α,β) | reserves on `(x−α)(y−β)=αβ` for live α,β (unchanged from legacy) | `[analytic]` |
| **Wing-range guard** | w*∈(w_-,w_+) on the LIVE move | unchanged from legacy (guard reads w*, which is live-only) | `[analytic]` |
| **Frozen wings / static τ** | τ,w_mid,Δw never written | only φ moves; G is read-only on w′ | `[analytic]` |
| **γ>1** | iff w_±>½ | warp untouched at wings | `[analytic]` |
| **Reading-A settlement** | mark form untouched | warp consumed AFTER pricing in tradeUpdate; legPrice/mark unchanged | `[analytic]` |
| **Anchor-omitted** | byte-identical to today | G defaults to 1 (tp=s) ⇒ legacy | `[numeric]` |

**Note vs the old spec:** the wing-range guard and α/β conservation now read the **LIVE** w*/(α,β) (not
the trade-point's), so they are *structurally identical to today's legacy guard* — no new rejection
surface from the warp channel. The strike channel (`G`) cannot trigger a rejection; it only scales φ.
(A separate, real obstruction: `G→∞` as the trade point approaches a frozen wing — this is the genB
frozen-wing cap, surfaced as a large but FINITE φ′ for an in-band trade point, and as `tp` non-existence
/ clamp when the strike's implied weight is itself ≥ w_+ . The build should clamp/flag an
out-of-band STRIKE, distinct from an out-of-band TRADE.)

---

## 4. THE CORRECTED ROBUST (g.1) GATE — re-derived targets on the RE-POSED construction

The skeptic's corrected criterion (noise-floor-relative + ordered, drop the brittle hard `>0.02`),
with targets re-derived here. **Pin pool + dy as named constants:**

```
const sw0 = { x:10, y:12, tau:0.3, wMinus:0.52, wPlus:0.72, phi:0 };   // canonical gate pool
const dyG = 0.1;                                                        // pinned cash leg
const mp0 = E.getMP_raw(sw0);                                           // 2.457812
const tpNear = E.arbitrageToOracle(sw0, mp0*1.1);
const tpFar  = E.arbitrageToOracle(sw0, mp0*1.6);
const aNear  = E.tradeUpdate(sw0, dyG, tpNear);
const aFar   = E.tradeUpdate(sw0, dyG, tpFar);
const tpSpot = E.arbitrageToOracle(sw0, E.getMP_raw(sw0));
const phiSpotReduce = Math.abs(E.tradeUpdate(sw0, dyG, tpSpot).phi - E.tradeUpdate(sw0, dyG).phi);
const FLOOR = Math.max(phiSpotReduce, Number.EPSILON);                  // guard: spotReduce is 0.0 exact here
const dphi  = Math.abs(aFar.phi - aNear.phi);
// (g.1) noise-floor-relative AND ordered:
chk('WARP (g.1) strike-DEPENDENT (noise-floor-relative + ordered)',
    !aNear.rejected && !aFar.rejected &&
    dphi > 1e6 * FLOOR &&                       // many OOM above the spot-reduction floor
    Math.abs(aFar.phi) > Math.abs(aNear.phi),   // warp grows further OTM on this wing
    `φ_near=${aNear.phi.toFixed(6)} φ_far=${aFar.phi.toFixed(6)} |Δφ|=${dphi.toFixed(6)} floor=${FLOOR.toExponential(2)}`);
```

**RE-DERIVED TARGETS (`/tmp/gate.js`, RE-POSED construction):**
- `φ_near (K=1.1·mp0) = −0.054467`
- `φ_far  (K=1.6·mp0) = −0.684490`
- **`|φ_far − φ_near| = 0.630023`** (≈ 19× the prior wrong-spec's 0.032940 — because the warp now lives
  in the strike channel where it belongs, so strike-dependence is much sharper).
- ordered **`|φ_far| (0.684) > |φ_near| (0.054)` — TRUE.**
- `φ_spotReduce = 0.0` exact ⇒ FLOOR = εmach ⇒ ratio = ∞ ⇒ trivially clears `1e6·FLOOR`.

> **IMPORTANT gate-mechanics note:** `φ_spotReduce` is now **exactly 0.0** (the prior spec had 1.67e-16
> from a bisection round-trip). Dividing by it is a div-by-zero — the `FLOOR = max(·, EPSILON)` guard is
> **mandatory**. With it, the assert is `0.630 > 1e6·2.2e-16 = 2.2e-10`, which passes by ~9 OOM. A
> strike-INDEPENDENT engine gives `φ_near==φ_far` ⇒ `dphi=0` ⇒ FAILS; cannot false-pass. The criterion
> is pool/dy-robust because both sides scale together.

**(g.2) spot-reduction assert** (the must-not-regress): `|tradeUpdate(sw0,dy,tpSpot).phi −
tradeUpdate(sw0,dy).phi| < 1e-12` — TARGET **0.0** (now exact). **(g.3) optional one-global-φ** at the
reserves point: `|w(reserves;φ′) − (1−β_live/y′)| < 1e-10` — TARGET 0.0 (the live-β version).

---

## 5. SUMMARY (for the manager → operator)

1. **(i) Does the pool stay faithful now? — YES.** The re-posed construction moves the reserves from
   the LIVE point: `(x′,y′)` is **identical across all strikes at fixed dy** (9.9598/12.10) and
   identical to today's legacy move. **No teleport.** The strike-dependence lives entirely in `φ′` (the
   warp amount), via the gearing `G = w′(u_spot)/w′(u_tp)` read at the trade point — exactly "trades
   skew the curve, not move the reserves point." Spot-reduction is **byte-exact (0.0)**.
2. **(ii) Same-notional-same-warp invariant (entry 37) — NO.** Warp is **NOT** notional-only. It factors
   `|Δφ| ≈ z0(dy)·G(K)` with the **strike channel G = 1/w′(u_tp) DOMINANT**: same notional ⇒ |Δφ| runs
   1.9e-4 (ATM) → 2.66 (deep OTM), ~14000×. **Warp ∝ notional is FALSE.** Warp ∝ (notional-factor) ×
   (trade-point curvature gearing). This RECONCILES "same premium ⇒ more warp OTM" (✅, z0 fixed, G
   grows) — but the stronger "same notional ⇒ same warp" fails because warp is governed by trade-point
   curvature, not cash. **This is forced by trade-point anchoring itself** (the genB `1/w′(u_tp)`); a
   strike-independent warp would require abandoning trade-point anchoring (operator/curve-object call,
   flagged — do not let it be reported as a defect of the fix; it is the defining property of the
   authorized construction).
3. **Honest carry (unchanged):** the `(α,β)`-flow-confinement lemma is **`[needs-Aristotle]`, OPEN, NOT
   Lean-certified** — the build is numerically faithful only; do not report as proven. warp∘rebase-commute
   and the φ-anchor/funding-reference-under-moved-φ stay OPEN (operator/settlement-tier). This fix does
   not touch `rebase`.
4. **Nothing submitted / built / edited / committed.** Manager re-derives every number; skeptic
   re-reviews this RE-POSED spec; only then does the intern build.

---

## Scripts (transcribed)

- **`/tmp/repose3.js`** — the RE-POSED `tradeUpdate_reposed(s,dy,tp)` with `z=z0·G`,
  `G=w′(u_spot)/w′(u_tp)`. Produces §1.1 faithfulness table (x′,y′ strike-invariant), §1.2 spot-reduction
  EXACT (0.0). Pool `{10,12,0.3,0.52,0.72,0}`, mp0=2.457812.
- **`/tmp/repose.js`, `/tmp/repose2.js`** — the two REJECTED discretizations (first-order gearing |Δφ|
  6.7e-2 at spot; integrated genB 4.0e-4 at spot) that motivate the curvature-ratio form.
- **`/tmp/inv3.js`** — operator-invariant test: fixed-notional sell-call across strikes via the real
  `executeLeg`/`mark`/`legPrice` path; the `z0·G` decomposition; same-premium reconcile; curve-reshape
  Δln(mp) cross-check. Produces §2 tables. oracle=80000, N=2e-6.
- **`/tmp/gate.js`** — the corrected (g.1)/(g.2) gate targets on the RE-POSED construction
  (φ_near=−0.054467, φ_far=−0.684490, |Δφ|=0.630023, spotReduce=0.0 exact).

(Manager re-derives every number; skeptic re-reviews this SPEC before the intern builds.)

# CODE-LEVEL IMPLEMENTATION SPEC — trade-point-anchoring warp fix (HEAD v27 (W))

_research-lead, 2026-06-11. Operator entry 36 (AUTHORIZED: trade-point-anchoring warp fix + promote
to HEAD). **This is the intern's build contract — NOTES ONLY. NO engine edit, NO git, NO Aristotle
submission this pass.** Manager re-derives every number; skeptic reviews this SPEC before the intern
builds._

**Authorities this spec sits on:** `notes/research/WARP_genB_kurtosis_generalisation_2026-06-10.md`
(the law `dφ/dy=(β/y²)/w′(u)` at the trade point), `notes/research/TRADE_WARP_strongform_2026-06-10.md`
(the strong-form Step-1…4 map, skeptic-GREEN), skeptic #16 (`VERDICT_WARP_continuous_strikedep`).
Numeric sanity script transcribed at the end (`/tmp/tradepoint_sanity.js`, node float64,
mirrors the live engine functions byte-for-byte).

---

## 0. THE ONE-SENTENCE CHANGE

Today `executeLeg` calls `tradeUpdate(state, dy)` which warps at the **live spot reserves**
(`wEntry = wField(state)`). The fix routes the warp's anchor to the leg's **ray∩curve trade point**
`tp = arbitrageToOracle(state, K)` — the (W) reserve state whose marginal price equals the leg's
dollar-strike K — **while the reserves still move by the actual cash leg `dy`**. The conserved
`(α,β)`, the field curvature `w′(u)`, and the φ-recenter are all read **at `tp`**; the post-trade
reserves point rides the trade-point's `(α,β)` hyperbola. The strike K thereby becomes an argument of
the warp, and the warp becomes **strike-dependent** (paper-faithful). This is the ONLY behavioural
change; everything else (pricing, settlement, rebase, dollar pipe) is untouched.

---

## 1. WHICH FUNCTIONS CHANGE, AND THE EXACT RE-ROUTE

### 1.1 The surgical change is localized to `tradeUpdate` + `executeLeg` (HEAD lines 1723–1746, 1844–1857)

There are TWO clean ways to wire this. **Adopt Option A** (recommended — minimal blast radius,
keeps `tradeUpdate`'s existing call sites — `executeBand` lines 2139/2152/2161/2168 — unchanged).

#### Option A (ADOPT): add an optional `anchor` argument to `tradeUpdate`; `executeLeg` passes `tp`.

`tradeUpdate(s, dy, anchor)` — when `anchor` is supplied (a (W) state), every quantity that is
currently read off `s` for the **warp** (`wEntry`, `alpha`, `beta`, `wm`, `dw2`, `tau`) is read off
`anchor` instead; the **reserve move** (`y_new = anchor.y + dy`, `x_new = alpha/wStar`) is computed
from the **anchor's** reserves and conserved `(α,β)`. When `anchor` is omitted, behaviour is
**byte-identical to today** (anchor defaults to `s`), so `executeBand`'s arbitrage-reversal calls
(`tradeUpdate(s, ±X/Y)`) keep their current spot-anchored semantics — those are AMM-internal
arbitrage moves at the live reserves, NOT strike-registered option legs, and must stay spot-anchored.

The **subtle, load-bearing point**: the anchor `tp` is a point on the **same curve level** as `s`
(arbitrageToOracle keeps `F=k` invariant — HEAD lines 1781–1787), so `tp` and `s` share the curve;
`tp` is just a *different point on it*, the one where the leg's strike registers. The conserved
`(α,β)` computed at `tp` are the trade-point conserved quantities `α=x_B·w_B`, `β=y_B·(1−w_B)`
(the warp-amm `σ_B` packaged as `α/β`). The trade then moves `y` by the real cash leg `dy` **from the
trade point**, and the post-state `(x′,y′,φ′)` is the warped curve that honours that leg at that strike.

```
function tradeUpdate(s, dy, anchor) {
  const a   = anchor || s;                 // ← warp anchor (trade point); defaults to s = today
  const wm  = _wMid(a), dw2 = 0.5 * _dW(a), tau = a.tau;
  const wEntry = wField(a);                // ← field weight AT THE TRADE POINT
  const alpha  = a.x * wEntry;             // ← trade-point conserved α
  const beta   = a.y * (1 - wEntry);       // ← trade-point conserved β
  const y_new  = a.y + dy;                 // ← reserves move by the REAL cash leg, from the trade point
  if (!(y_new > 0)) return null;
  const wStar  = 1 - beta / y_new;         // β-conservation: new LOCAL weight the leg demands
  if (!(wStar > a.wMinus && wStar < a.wPlus))   // ← WING-RANGE GUARD now at the trade point
    return { rejected: true, reason: 'wing-range', wStar, wMinus: a.wMinus, wPlus: a.wPlus };
  const x_new  = alpha / wStar;            // α-conservation: dx forced
  if (!isFinite(x_new) || !isFinite(y_new) || x_new <= 0) return null;
  const uPrime = Math.log(y_new / x_new);
  const t = (wStar - wm) / dw2;            // in (-1,1) by the guard
  const z = t * tau / Math.sqrt(1 - t * t);
  const phiPrime = uPrime - z;             // field reshape — ONE global φ′ (see §1.3)
  if (!isFinite(phiPrime)) return null;
  return _stampAB({ x: x_new, y: y_new, tau: s.tau,
                    wMinus: s.wMinus, wPlus: s.wPlus, phi: phiPrime });
}
```
(Note `tau/wMinus/wPlus` on the returned state come from `s` — they equal `a`'s, since `tp` carries
them verbatim; keep reading them from `s` so the static curve identity is unambiguous.)

`executeLeg` (HEAD line 1844) computes the trade point from the leg's **dollar strike** and passes it:

```
function executeLeg(state, legType, wing, theta_inner, theta_outer, N, oracle) {
  const p   = legPrice(state, wing, theta_inner, theta_outer, N);
  const fx  = (isFinite(oracle) && oracle > 0) ? oracle : 1;
  const V_usd = p.V * fx;
  const wingSign = (wing === 'call') ? +1 : -1;
  const legSign  = (legType === 'sell') ? +1 : -1;
  const dy  = (wingSign * legSign) * V_usd;            // UNCHANGED — same cash leg as today

  // ── NEW: the leg's ray∩curve trade point (dollar strike → (W) reserve state) ──
  // K = the leg's registered marginal price. p.theta_star is the composite-ray sNorm
  // (sNorm ∝ S^-g); the dollar strike is the oracle price at that ray. Compute the
  // trade point as the (W) state whose MARGINAL PRICE == that strike's marginal.
  const K_mp = strikeMarginal(state, p.theta_star);    // see §1.2 — the load-bearing pin
  const tp   = (K_mp > 0) ? arbitrageToOracle(state, K_mp) : null;

  const post = tradeUpdate(state, dy, tp || undefined); // anchor at trade point; falls back to spot if tp null
  if (post && post.rejected) return { rejected: true,
    reason: 'trade exceeds frozen-wing range — split or widen Δw', detail: post };
  if (!post) return null;
  return { newState: post, V: p.V, theta_star: p.theta_star, delta: p.delta, dy,
           m_star: p.m_star, inner: theta_inner, outer: theta_outer, wing, N, legType, mode: p.mode,
           tradePoint: tp ? { x: tp.x, y: tp.y, uTP: Math.log(tp.y/tp.x) } : null };  // for the gate + viz
}
```

### 1.2 THE PIN: `strikeMarginal` — converting the leg's strike to a marginal price for `arbitrageToOracle`

`arbitrageToOracle(state, oracle)` inverts `p(u) = g_loc(u)·e^u = oracle` (HEAD line 1776) — it wants
a **marginal price**. The leg carries its strike as the composite-ray normalized coordinate
`p.theta_star` (sNorm ∝ S^−g). The trade point is the curve point whose **marginal price equals the
marginal at that strike ray**. Pin it via the existing `sNormStrike` inverse relationship:

- `sNormStrike(s, K)` (HEAD line 1794) already maps a **dollar strike K → sNorm** by
  `getSNorm(arbitrageToOracle(s, K))`. We need the inverse direction: **sNorm (=theta_star) → the
  marginal price K_mp** of the curve point at that sNorm.
- On (W), `getSNorm(s) = (1−w)/w` and `getMP_raw(s) = (w/(1−w))·(y/x)`, so a sNorm value `θ*`
  corresponds to local weight `w = 1/(1+θ*)`; the trade point is the curve point with that local
  weight. Implement `strikeMarginal` as a **bisection on the same `F=k` curve** for the `u` where
  `getSNorm = θ*`, then return that point's `getMP_raw`:

```
// Marginal price of the curve point whose sNorm == theta_star (the leg's registered ray).
// Mirror of sNormStrike's inverse: find u on the SAME curve level with (1-w)/w == theta_star,
// return its marginal price for arbitrageToOracle to re-seat on.
function strikeMarginal(s, theta_star) {
  if (!(theta_star > 0)) return NaN;
  const wm = _wMid(s), dw2 = 0.5*_dW(s), tau = s.tau;
  const phi = (typeof s.phi === 'number') ? s.phi : 0;
  const sNormOfU = (u) => { const w = wm + dw2*(u-phi)/Math.sqrt(tau*tau+(u-phi)*(u-phi));
                            return (1-w)/w; };
  // sNorm is strictly DECREASING in u (w increases ⇒ (1-w)/w decreases) ⇒ bisect.
  let lo=-50, hi=50;
  for (let i=0;i<200;i++){ const mid=(lo+hi)/2; if (sNormOfU(mid) > theta_star) lo=mid; else hi=mid; }
  const uStar=(lo+hi)/2;
  const w = wm + dw2*(uStar-phi)/Math.sqrt(tau*tau+(uStar-phi)*(uStar-phi));
  return (w/(1-w))*Math.exp(uStar);   // marginal price at that ray ⇒ feed arbitrageToOracle
}
```
**Reduction safety:** when `theta_star == getSNorm(state)` (leg registered AT spot), `strikeMarginal`
returns `getMP_raw(state)` and `arbitrageToOracle(state, that)` returns `state` (up to bisection
~1e-8) ⇒ `tp ≈ state` ⇒ today's behaviour exactly (verified, §3 reduction check 1, |Δφ|=1.67e-16).

> **Intern note — do NOT over-engineer the strike→marginal map.** If the strike coordinate the leg
> already carries is more naturally a *dollar* strike at the call site (check the UI/preview path that
> builds `theta_inner/outer`), then `K` is already a dollar price and you call
> `arbitrageToOracle(state, K)` directly — skip `strikeMarginal`. The pin above is for the case where
> the leg hands you the **normalized** ray `theta_star`. **Confirm which coordinate `legPrice`'s
> caller actually has and use the direct path if K is already a price** — this is a wiring detail, not
> a math choice; either way the trade point is `arbitrageToOracle(state, <the leg's marginal price>)`.

### 1.3 THE φ-CONSISTENCY RESOLUTION (the one-global-φ-across-two-points subtlety) — RESOLVED EXPLICITLY

**The subtlety:** the warp is anchored at the trade point `tp=(x_B,y_B)`, but the live **reserves
point** after the trade is a *different* point `(x′,y′)` on the same curve. The question (skeptic
VERDICT §6; genB note §4): does the single returned `φ′` describe a curve that is consistent at
**both** the trade point and the reserves point — i.e. is there really ONE global φ?

**RESOLUTION — the discrete construction picks ONE φ′, and it IS globally consistent, by the
`(α,β)`-first-integral structure. Here is exactly why and how φ′ is set:**

1. `φ′` is computed from the **post-trade reserves point** `(x′,y′)` via Step 4:
   `φ′ = ln(y′/x′) − z`, with `z` set by `w* = 1 − β/y′` where **β is the trade-point conserved β**.
   So φ′ is the field center for which the **reserves point** carries local weight exactly `w*`.
2. The same `(α,β)` (computed at the trade point) define the trajectory hyperbola
   `(x−α)(y−β)=αβ`. The trade-point `(x_B,y_B)` and the reserves point `(x′,y′)` **both lie on this
   one hyperbola** (the reserves move ALONG it by construction: `y′=y_B+dy`, `x′=α/(1−β/y′)`). The
   warped field `w(·;φ′)` is the field whose local-weight readout `w(u;φ′)=α/x = 1−β/y` **all along
   that hyperbola** — it is the field consistent with `(α,β)` everywhere on the trajectory, not just at
   one point.
3. **Verified numerically to 0.0** (sanity script, GLOBAL-PHI CONSISTENCY block): with the trade-point
   anchor and the returned φ′, `w(reserves_point; φ′) == w* == 1 − β_tp/y′` to `|Δ|=0.00e+0`. There is
   ONE φ′ and it reproduces the demanded weight at the reserves point exactly. The trade-point's own
   `w_B` is `w(u_B; φ_old)` under the *pre-trade* center — that is the anchor, consumed to set `(α,β)`;
   post-trade the single new center φ′ governs the whole warped curve.

**So the discrete construction does pick one φ′ (set from the reserves point under the trade-point
`(α,β)`), and that choice is the faithful one** because `(α,β)` are the trade's flow invariants: the
post-trade curve is *defined* as the (W) curve carrying those `(α,β)` as its local-weight readout, and
the trade point and reserves point are two points on the one trajectory that curve owns. There is no
second, conflicting φ to reconcile — the trade point only supplies `(α,β)`; φ′ is then uniquely
determined by the reserves point. **This is the same Step-1…4 map as today; the ONLY change is that
`(α,β)` are seeded at `tp` instead of at `s`.**

> **HONEST CARRY (see §4):** the *certificate* that this single-φ′ construction is path-independent
> across **which point you anchor at** is the `(α,β)`-first-integral / flow-confinement lemma — proven
> numerically (path-indep 0.0) but **NOT Lean-certified** `[needs-Aristotle]`. The build is numerically
> faithful; the global-consistency *proof* is open.

### 1.4 Post-trade `(x′,y′,φ′)` — every quantity tagged spot vs trade-point

| quantity | value | anchored at |
|---|---|---|
| `K` (leg strike) | leg's registered marginal price | — (input) |
| `tp = arbitrageToOracle(s,K)` | `(x_B, y_B)` on the same `F=k` curve | derived |
| `w_B` | `wField(tp)` | **TRADE POINT** |
| `α` | `x_B · w_B` | **TRADE POINT** (conserved) |
| `β` | `y_B · (1−w_B)` | **TRADE POINT** (conserved) |
| `dy` | `(wingSign·legSign)·p.V·oracle` | — (the real cash leg, UNCHANGED) |
| `y′` | `y_B + dy` | reserves move **from the trade point** |
| `w*` | `1 − β/y′` | demanded LOCAL weight (β-cons) |
| `x′` | `α / w*` | reserves (α-cons, dx forced) |
| `wm, dw2, tau` | `_wMid(tp), ½_dW(tp), tp.tau` | **TRADE POINT** (= s's, static) |
| `t` | `(w* − wm)/dw2` | — |
| `z` | `t·tau/√(1−t²)` | field re-seat (the `1/w′` factor, §genB) |
| `φ′` | `ln(y′/x′) − z` | **ONE global center** (governs whole warped curve) |

Today's code is the special case `tp = s` (anchor = spot), which is preserved when `anchor` is omitted.

---

## 2. REDUCTION CHECKS THE BUILD MUST PRESERVE

All re-derived in the sanity script (§ scripts). Each is a HARD requirement on the built engine.

1. **Spot-strike reduction (K == spot marginal) ⇒ today's behaviour, exactly.** When the leg
   registers at the live spot (`theta_star == getSNorm(state)`, i.e. `K_mp == getMP_raw(state)`),
   `tp ≈ state` and `tradeUpdate(state, dy, tp)` returns today's `(x′,y′,φ′)`. Verified
   `|Δφ| = 1.67e-16` (sanity, reduction check 1). **GATE (g)'s spot-reduction leg asserts this.**
2. **Balancer limit (τ→∞) still holds.** As τ→∞ the field flattens (`w′→0`, `w→w_mid`), the
   trade-point and spot collapse toward the same scalar-weight move, and the warp reduces to the
   warp-amm scalar mode-shift. The existing Balancer-limit selfcheck (and genB §5) is unchanged —
   trade-point anchoring does not touch the τ→∞ degeneration. **No new failure mode here; keep the
   existing limit check green.**
3. **α/β conservation — at the trade point now.** `α=x_B·w_B`, `β=y_B·(1−w_B)` are conserved through
   the move (Steps 2–3 are the conservation move). Existing WARP (a)/(b) selfchecks still pass; they
   read conservation off the post-state and the trajectory hyperbola, which now belongs to the
   trade-point `(α,β)` — the checks are structurally identical (see §3 note on (a)/(b)).
4. **Frozen wings.** φ-recenter leaves `w(±∞;φ)=w_±` invariant; `tau/w_mid/Δw` are **never written**.
   The static-knob design holds; the trade point does not touch wing weights.
5. **γ>1.** Holds iff `w_±>½` (the calibration lock). The warp does not touch wing weights at either
   anchor, so it cannot break or fix a γ>1 pool. Unchanged.
6. **Reading-A settlement untouched.** Value law `S^(−g_loc)`, `S*=K·g/(g+1)` exact by construction.
   The warp moves only φ (hence `g_loc(·)`), never the mark form. `legPrice`/`mark` are NOT changed by
   this fix — the trade point is consumed only by `tradeUpdate`, after pricing. Settlement is orthogonal.
7. **Wing-range guard still applies — NOW AT THE TRADE POINT.** `w* ∈ (w_−, w_+)` (|t|<1) is checked
   on the trade-point-conserved β. An oversized leg at a near-wing trade point is rejected with the
   same `wing-range` reason; `executeLeg` surfaces it (split/widen-Δw) exactly as today. Verified
   in-band at the gate dy across all probed strikes (sanity, WING-RANGE SAFETY block).

---

## 3. THE NEW HARD GATE — `wcurve_selfcheck.js` (g) flips from documenting to ASSERTING

Replace the interim documenting (g) block (HEAD `wcurve_selfcheck.js` lines 176–201) with a **HARD
two-part assert**. The structural test for the whole class (skeptic's framing): *the gate now feeds the
strike/registration coordinate in, and asserts the warp RESPONDS to it.*

**Pool for the gate:** the existing `wpool() = {x:10, y:12, tau:0.3, wMinus:0.52, wPlus:0.72, phi:0}`
(unchanged — keep one canonical gate pool). `mp0 = getMP_raw(sw0) = 2.457812`.

### Part 1 — STRIKE-DEPENDENCE assert (the paper-faithful property)

Same cash leg `dy = 0.1` applied at two **different** trade points (near vs far OTM) must give
**materially different** φ′:

```
const dyG  = 0.1;
const mp0  = E.getMP_raw(sw0);
const tpNear = E.arbitrageToOracle(sw0, mp0 * 1.1);   // near trade point (u_tp ≈ 0.234)
const tpFar  = E.arbitrageToOracle(sw0, mp0 * 1.6);   // far  trade point (u_tp ≈ 0.496)
const aNear = E.tradeUpdate(sw0, dyG, tpNear);
const aFar  = E.tradeUpdate(sw0, dyG, tpFar);
const dphi  = Math.abs(aNear.phi - aFar.phi);
chk('WARP (g.1) strike-DEPENDENT: same cash leg at two trade points ⇒ DIFFERENT φ′',
    !aNear.rejected && !aFar.rejected && dphi > 0.02,
    'φ_near=' + aNear.phi.toFixed(6) + ' φ_far=' + aFar.phi.toFixed(6) + ' |Δφ|=' + dphi.toFixed(6));
```

**TARGET NUMBERS (sanity, HEADLINE GATE block, dy=0.1):**
- `φ_near (K=1.1·mp0) = -0.004437`
- `φ_far  (K=1.6·mp0) = -0.037378`
- **`|Δφ| = 0.032940`** — assert `> 0.02` (clean margin; the value is ~0.033, ~1.6× the threshold).

**Sign/monotone note for the implementer:** φ′ grows more negative further OTM (−0.0044 → −0.0374);
do NOT assert φ′ monotone in strike beyond this pair (genB §2 sign caution — the displacement and
field-reseat terms compete across the elbow). The gate asserts only **distinctness by tolerance**.

### Part 2 — SPOT-REDUCTION assert (the must-not-regress property)

A leg registered AT spot must reproduce today's spot-anchored warp exactly:

```
const tpSpot   = E.arbitrageToOracle(sw0, E.getMP_raw(sw0));   // trade point == spot
const viaSpot  = E.tradeUpdate(sw0, 0.5, tpSpot);
const todaySpot= E.tradeUpdate(sw0, 0.5);                      // no anchor = legacy spot path
chk('WARP (g.2) spot-reduction: K==spot ⇒ trade-point path == legacy spot path',
    Math.abs(viaSpot.phi - todaySpot.phi) < 1e-9 && Math.abs(viaSpot.x - todaySpot.x) < 1e-7,
    '|Δφ|=' + Math.abs(viaSpot.phi - todaySpot.phi).toExponential(2));
```
**TARGET (sanity, SPOT-REDUCTION block, dy=0.5):** `|Δφ| = 1.67e-16` — assert `< 1e-9`
(the bisection floor of `arbitrageToOracle` is ~1e-8 in x; φ matches to ~1e-16 here).

### Part 3 (optional, recommended) — GLOBAL-φ CONSISTENCY assert (defensive, NOT the open lemma)

Assert the returned single φ′ reproduces the demanded weight at the reserves point (this is the
*numerical* consistency, NOT the open Lean lemma):

```
const tpC = E.arbitrageToOracle(sw0, E.getMP_raw(sw0)*1.6);
const updC= E.tradeUpdate(sw0, 0.1, tpC);
const wRes= /* wField at {x:updC.x,y:updC.y,...,phi:updC.phi} */ ;
const wEntryTP = /* wField(tpC) */; const betaTP = tpC.y*(1-wEntryTP);
chk('WARP (g.3) one global φ′ consistent at the reserves point',
    Math.abs(wRes - (1 - betaTP/updC.y)) < 1e-10, ...);   // sanity: |Δ| = 0.00e+0
```

**Wire (g.1)/(g.2) as HARD (they count toward the PASS/FAIL exit code). Keep the existing 21-PASS
count honest:** the old single documenting (g) line becomes (g.1)+(g.2) (+optional g.3) — update the
headline PASS count and the (W)-branch wiring in `run_all.sh` accordingly. The `warpActive` SKIP guard
(line 115) still gates the whole block (a pre-warp build skips, as today).

---

## 4. HONEST CARRY — the label the build must wear

The `(α,β)`-flow-confinement lemma stays **`[needs-Aristotle]`, OPEN.** What that means for the build,
stated so no one over-promotes it:

- **What IS established (and the gate asserts):** the build is **numerically faithful** — path-
  independence 0.0, spot-reduction 1.67e-16, one-global-φ consistency at the reserves point 0.0,
  strike-dependence |Δφ|=0.033. These are `[numeric]`, verified, gate-enforced.
- **What is NOT established:** that the single-φ′ construction is **globally consistent as a
  certified theorem** — i.e. that `α=x·w(ln(y/x)−φ)`, `β=y·(1−w(ln(y/x)−φ))` are first integrals of
  the (W) trade vector field with reserves-projection `(x−α)(y−β)=αβ`, making the per-leg integral
  path-independent regardless of anchor. That is the `(α,β)`-flow lemma, **proven numerically (0.0) but
  NOT Lean-certified**, `[needs-Aristotle]`, short/algebraic/Mathlib-tractable, no special functions.
- **REQUIRED build label (carry verbatim into code comment on `tradeUpdate` and into the DIFF_LEDGER
  entry):** *"Trade-point anchoring is numerically faithful (path-indep 0.0, spot-reduction 1.67e-16);
  the global single-φ consistency is the `(α,β)`-flow-confinement lemma, OPEN `[needs-Aristotle]`, NOT
  Lean-certified. Do not report as proven."*
- **Also still OPEN (unchanged, carry the existing labels):** warp∘rebase-commute on (W)
  `[needs-Aristotle]`; the φ=0 anchor / funding-reference under a moved φ (operator/settlement-tier).
  This fix does NOT touch `rebase` (HEAD line 1754) — keep its existing carry-shift + open-lemma
  comment intact.

---

## 5. INTERN BUILD CHECKLIST (blob-safe, per CLAUDE.md §3)

1. Edit **only** `tradeUpdate` (add optional `anchor` arg, source warp quantities from it),
   `executeLeg` (compute `tp`, pass it, attach `tradePoint` to the return), and add `strikeMarginal`
   (or use the direct dollar-K path per §1.2 note). These are all in the `<script id="engine">` IIFE
   region (~lines 1723–1857) — NOT near a base64 blob; standard splice recipe applies.
2. Leave `legPrice`, `mark`, `arbitrageToOracle`, `rebase`, `wField`, `getMP_raw` **unchanged** in
   body (you only CALL `arbitrageToOracle` from a new site).
3. Confirm `executeBand`'s `tradeUpdate(s, ±X/Y)` calls (lines 2139/2152/2161/2168) compile with the
   new optional arg and stay spot-anchored (they pass no anchor — correct, they are AMM-internal
   arbitrage moves, not strike-registered legs).
4. Flip `wcurve_selfcheck.js` (g) per §3; update the PASS count and `run_all.sh` (W)-branch wiring.
5. Run `engine/verify/run_all.sh` + the file-safety gate. The 2 blob md5s must be unchanged; all 3
   `<script>` blocks must parse.
6. **The build does not touch HEAD promotion** — the manager promotes after green + tester live-confirm
   + DIFF_LEDGER entry (feature #16). Carry the §4 honest label into the DIFF_LEDGER entry.

---

## Scripts (transcribed) — `/tmp/tradepoint_sanity.js`

Node float64, mirrors HEAD v27 `wField`/`getMP_raw`/`arbitrageToOracle`/`tradeUpdate` verbatim plus the
trade-point anchor (`tradeUpdateAt`). Produces every TARGET number in §2/§3:
- pool `{x:10,y:12,tau:0.3,wMinus:0.52,wPlus:0.72,phi:0}`, `mp0=2.457812`.
- **reduction (K==spot):** today φ=−0.0145104367, via-spot-TP φ=−0.0145104367, **|Δ|=1.67e-16**.
- **strike-dep (dy=0.1):** φ′ at K=mp0·{1.05,1.1,1.3,1.6,2.0} = {−0.002661, −0.004437, −0.014082,
  −0.037378, −0.084559} ⇒ **|Δφ(near 1.1 vs far 1.6)| = 0.032940**.
- **global-φ consistency (dy=0.1, K=1.6·mp0):** `w(reserves;φ′)=0.7075027962`,
  `w*=0.7075027962`, **|Δ|=0.00e+0**.
- **wing-range safety (dy=0.1):** all K∈{1.05…2.5}·mp0 in-band (no rejection at the gate dy).

(Manager re-derives every number; skeptic reviews this SPEC before the intern builds.)

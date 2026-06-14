# BUILD SPEC — (W) kurtosis curve into the engine (v24 base)

_research-lead, 2026-06-10. SPEED RUN, operator-directed, theory-risk ACCEPTED this run._
_Notes-only. NO engine edit, NO git. The intern implements EXACTLY what is written here._
_Skeptic does a FAST core-charter pass; the manager re-derives the load-bearing formulas before ship._

## 0. Scope, base, and honesty contract

- **Base file:** `engine/builds/temporal_mvp_v24_rebase_fixed_2.html` (the clean Balancer-barrier
  engine: `getMP_raw = w·y/((1−w)·x)`, bare `mark = min(s/θ, θ/s)`, NO GH tail/CDF, NO `ghMu`,
  funding with hardcoded γ=±2). This is the base the operator chose for the (W) warp.
- **Target curve (W):** `F = x^{w_mid}·y^{1−w_mid}·exp(−(Δw/2)·√(τ²+ln²(y/x))) = k`, with weight
  field `w(u) = w_mid + (Δw/2)·u/√(τ²+u²)`, `u = ln(y/x)`, local exponent `γ_loc = w/(1−w)`.
- **What v24 already has that we KEEP:** `tradeUpdate` (Identity-IV α/β conservation hyperbola),
  `compositeRay`, `vsValue`, the leg/band/close machinery, the dollar pipe, funding scaffold. The
  warp lands in the **weight `w`** — it does NOT replace `tradeUpdate`'s conservation move.
- **Honesty labels** are pre-written in §6. Every adopted-to-allow-the-build definition is tagged
  `[theory-risk-accepted]`; everything numerically/analytically established is `[proven]`.

### 0.1 THE load-bearing simplification vs the GH HEAD (verified this pass — tell the intern FIRST)
On the (W) Balancer-warp curve the **marginal price EQUALS the geometric reserve slope exactly**:
`|dy/dx| = (w/(1−w))·(y/x) = γ_loc·e^u`. There is **NO `e^(−ghMu)` correction factor.** GOTCHA #12's
explosive `e^ghMu` (11.7/44.5/749/13780 at γ=1.5/2/3/4) is a **GH-latent-score artifact** and is
**ABSENT** in (W) (verified `/tmp/wcurve_verify2.py`: implicit-slope == `(w/(1−w))(y/x)` to 1e-15,
all test points). `[proven]`
- **Consequence:** `mpGeom = getMP_raw·e^(−ghMu)` collapses to `mpGeom = getMP_raw`. Slippage %, $,
  tangent angles all read `getMP_raw` directly. **Do NOT port any `ghMu` / `e^ghMu` machinery from
  the HEAD.** v24 has none — keep it that way.
- **Still honor GOTCHA #12 conceptually:** `getMP_raw` is the price coordinate; here it happens to
  also be the slope because the warp lives in the weight, not in a separate score leg. State this in
  a code comment so a future GH cross-port does not silently reintroduce the factor.

### 0.2 Carry coordinate (per VERDICT_CARRY — `notes/research/CURVE_FAMILY_carry_pass_2026-06-10.md`)
The TRUE carry coordinate is the **price leg `q = ln p`**, NOT the reserve ratio `u = ln(y/x)`.
They are related by `q = u + ln γ_loc(u) + C` (★). On (W), `dq/du = 1 + γ_loc′/γ_loc·(du)` ≠ 1 in the
elbow (measured `dq/du`: 3.08 @ τ=0.3, u=0; →1.0006 in wings at u=5 — `/tmp/wcurve_verify.py`).
**All position/strike/funding reads work in `q = ln p`, never in `u`.** `[proven]` (the non-transfer
is established; the engine simply reads price, so this is automatic if functions read `getMP_raw`.)

---

## 1. The four curve-dependent engine functions for (W)

The state stays `{x, y, alpha, beta}` plus **one new static scalar `tau`** (the kurtosis knob) and
the **two wing weights `wMinus, wPlus`** (or equivalently `wMid, dw`) serialized on the pool. These
three define the weight field. `w` is NO LONGER `alpha/x` — it is the position-dependent field
`w(u)`. **`alpha = x·w(u)` and `beta = y·(1−w(u))` are now position-dependent readouts**, not stored
constants — see §1.2 for how trade conservation is handled. Helper:

```
// (W) weight field. u = ln(y/x). Static knob tau; static wing weights wMinus,wPlus.
const wMid = (s) => 0.5*(s.wMinus + s.wPlus);
const dW   = (s) => (s.wPlus - s.wMinus);
function wField(s) {                       // local weight at the live reserves point
  const u = Math.log(s.y / s.x);
  return wMid(s) + 0.5*dW(s)*u/Math.sqrt(s.tau*s.tau + u*u);
}
const gLoc = (s) => { const w = wField(s); return w/(1-w); };   // local exponent γ_loc
```
`[proven]` (first integral RK4 = 3.4e-13; wing exponents τ-independent; γ_loc(0)=w_mid/(1−w_mid)).

### 1.1 `getMP_raw(s)` — the price coordinate `q = ln p` reading
**REPLACES** v24 line 1597 `const getMP_raw = (s) => { const w = getW(s); return w*s.y/((1-w)*s.x); };`
(which used the constant `w = alpha/x`). New:
```
// (W) marginal price at the live reserves point = γ_loc·(y/x). Price coordinate AND slope
// (no e^-ghMu factor — the warp is in the weight, GOTCHA#12 e^ghMu is GH-only, absent here).
const getMP_raw = (s) => { const w = wField(s); return (w/(1-w)) * (s.y/s.x); };
```
- **Input:** pool state `s`. **Output:** marginal price `p` [U/B], = `γ_loc·e^u`. The carry leg is
  `q = ln(getMP_raw(s))`.
- **What it replaces in v24:** the constant-weight Balancer marginal. The ONLY change is `w` is now
  `wField(s)` (position-dependent) instead of `alpha/x`.
- `[proven]` (slope == price to 1e-15; strictly monotone in `u` so invertible — §1.4).

### 1.2 `tradeUpdate(s, dy)` — the paper Trade-Formula w-warp (#16)
**This is the structural change.** v24's `tradeUpdate` (lines 1617–1625) conserves `alpha = x·w` and
`beta = y·(1−w)` with `w` constant — which on (W) is WRONG, because a trade is supposed to **change
w and reshape the curve** (operator entry 16: "it's w that the trade changes"). Paper Trade Formula:
`α = x·w` and `β = y·(1−w)` are **individually conserved** through a trade; `w = α/x` is then a
**derived readout** that moves as `(x,y)` move. τ is untouched.

**REPLACES** v24 `tradeUpdate`. The mechanic:
```
// (W) paper Trade-Formula. A trade conserves α=x·w_entry and β=y·(1−w_entry) of the leg's
// transacted weight, moving (x,y); the NEW live weight w_new = α/x is a derived readout that
// SKEWS the curve (the induced shift). tau (kurtosis) is INVARIANT.
function tradeUpdate(s, dy) {
  // 1. freeze the conserved leg invariants at the PRE-trade weight:
  const wEntry = wField(s);            // local weight at current reserves point
  const alpha = s.x * wEntry;          // conserved through this trade  [theory-risk-accepted]
  const beta  = s.y * (1 - wEntry);    // conserved through this trade
  // 2. move along the conservation hyperbola (Identity IV, UNCHANGED algebra):
  const y_new = s.y + dy;
  const denom = (s.y - beta) * (y_new - beta);
  if (Math.abs(denom) < 1e-12) return null;
  const dx = -alpha * beta * dy / denom;
  const x_new = s.x + dx;
  if (!isFinite(x_new) || !isFinite(y_new) || x_new <= 0 || y_new <= 0) return null;
  // 3. NEW weight is the derived readout w_new = alpha/x_new — the curve has SKEWED.
  //    We do NOT store alpha/beta; we store (x,y) and recompute w via wField on next read.
  //    The skew is the induced shift of the weight field's CENTER (see note).
  return { x: x_new, y: y_new, tau: s.tau, wMinus: s.wMinus, wPlus: s.wPlus };
}
```
- **Input:** state `s`, cash delta `dy` [U]. **Output:** new state with moved `(x,y)`, same
  `tau, wMinus, wPlus`.
- **What it replaces in v24:** the α/β-as-stored-fields version. Now α/β are frozen *per trade* at
  the live weight, the hyperbola move is identical algebra, and the post-trade weight is re-derived.
- **✅ SUPERSEDED 2026-06-10 — R-paper is now DEFINED, BUILD THE STRONG FORM.** The composition gap
  below is CLOSED: `notes/research/TRADE_WARP_strongform_2026-06-10.md` (skeptic-GREEN, manager-verified)
  gives the closed-form field re-centering `φ'=ln(y'/x')−z` (R-paper). Skeptic TEST B proved **R-simple
  VIOLATES α/β conservation** (the field-center MUST move) — so the build implements the **strong-form
  warp**, NOT R-simple, plus the frozen-wing trade-size guard. The R-simple text below is retained only
  as the (now-rejected) minimal fallback. Build caveat: no `(x,y,φ)` rebase that implies warp∘rebase
  commute (lemma OPEN).
- **⚠ THE COMPOSITION GAP `[theory-risk-accepted]` — flag, do not stall:** how the
  conserved-(α,β)-at-pre-weight hyperbola move composes with the (W) **weight-field re-centering** is
  the genuinely open seam. Two readings, pick the SIMPLE one to allow the build: **(R-simple, ADOPT)**
  the weight field's wing weights `wMinus,wPlus` and `tau` stay fixed; the trade moves `(x,y)`, hence
  `u`, hence the LIVE `w = wField(s)` slides along the FIXED field — "skew = the reserves point
  sliding to a steeper/flatter part of a fixed warp." This is consistent, well-typed, and
  reduces to plain Balancer when τ→∞. **(R-paper, OPEN)** the trade re-centers the field
  (`u→u−φ`, the angle-shift skew of the Gudermannian/hyperbolic-angle lens) so the warp itself moves
  — this is the operator's "trade reshapes the curve" in its strong form, and the w→φ map is
  UNIMPLEMENTED (#16, OPEN). **Ship R-simple; flag R-paper to the operator as the deferred strong
  form.** Both keep τ static and α/β-conserved-per-trade; they differ only in whether the field
  center moves. R-simple is the honest minimal build.

### 1.3 `rebase(s, r)` — P→P/r, strike ray θ→θ/r, worked in `q`
v24 `rebase` (lines 1629–1631): `x→r·x, alpha→r·alpha, beta,y invariant, w invariant`. On (W),
because `w = wField(u)` and `u = ln(y/x)`, scaling `x→r·x` changes `u → u − ln r`, which **moves the
weight readout** — a rigid `x→r·x` does NOT preserve `w` on (W) (the carry verdict: rebase must act
on `q`, not `u`; the warp does not commute with a reserve-ratio shift).

**REPLACES** v24 `rebase`. Worked in the price/carry leg:
```
// (W) rebase. P → P/r. The rebase is a SHIFT in the carry coordinate q = ln p by ln r
// (a price-leg move), NOT a rigid x→r·x reserve shift (which would move u and warp w).
// Implement as: arbitrage the pool to its post-rebase equilibrium price p_old/r... but
// rebase is a FRAME move, so:  find the reserves point whose carry q is shifted by −ln r
// while staying on the SAME (W) curve shape (tau, wMinus, wPlus invariant).
function rebase(s, r) {
  if (!(r > 0)) return null;
  // current carry price, shift it: p_new = p_old / r  (P→P/r ; strike rays θ→θ/r follow).
  const p_old = getMP_raw(s);
  const p_new = p_old / r;
  // re-place the reserves point at the curve point with marginal price p_new (works in q):
  const st = arbitrageToOracle(s, p_new);   // §1.4 inverse; tau/wing-weights preserved
  return st ? { x: st.x, y: st.y, tau: s.tau, wMinus: s.wMinus, wPlus: s.wPlus } : null;
}
```
- **Input:** state `s`, rebase ratio `r>0`. **Output:** reserves point shifted by `−ln r` in `q`,
  same curve shape.
- **What it replaces:** the `x→r·x` rigid scaling, which is only correct for constant-`w` Balancer.
- **Strike rays θ→θ/r:** strikes are registered live in carry coordinate (§3 `sNormStrike`); because
  the reserves point's `q` shifted by `−ln r`, every strike's registered position shifts in lockstep,
  giving θ→θ/r automatically — no separate strike-ray code. `[theory-risk-accepted]` (the
  "rebase=carry-shift" identity is the carry-verdict's prescription; the carry-covariance-in-q lemma
  is PROPOSED-only, not Lean-verified — flag).
- **⚠ honesty:** `w` is intentionally NOT preserved by this rebase (it cannot be on (W)); what is
  preserved is the **curve shape** `(tau, wMinus, wPlus)` and the carry-shift law. This is the
  correct (W) behavior, NOT a regression from v24's `w`-invariant rebase (that was a constant-`w`
  fact).

### 1.4 `arbitrageToOracle(s, oracle)` — invert price→reserves on (W)
v24 (lines 1640–1647) uses the closed form `x_eq = α + √(αβ/oracle)`, `y_eq = β + √(αβ·oracle)` valid
for constant-`w` Balancer. On (W), `α,β` are position-dependent so there is **no closed form**; invert
numerically. Marginal price `p(u) = γ_loc(u)·e^u` is **strictly monotone in `u`** (verified
`/tmp/wcurve_verify3.py`: dp/du > 0 everywhere) ⇒ unique inverse.

**REPLACES** v24 `arbitrageToOracle`:
```
// (W) arbitrage to a target marginal price. Solve p(u)=γ_loc(u)·e^u = oracle for u (bisection;
// p strictly monotone in u — proven), then place (x,y) on the curve at that u, conserving the
// curve's level (F = k) so the reserves point stays on the SAME (W) curve.
function arbitrageToOracle(s, oracle) {
  if (!(oracle > 0)) return null;
  // 1. invert p(u)=oracle for u (bisection on the monotone price):
  const priceOfU = (u) => { const w = wMid(s)+0.5*dW(s)*u/Math.sqrt(s.tau*s.tau+u*u);
                            return (w/(1-w))*Math.exp(u); };
  let lo=-50, hi=50;
  for (let i=0;i<200;i++){ const mid=(lo+hi)/2; if (priceOfU(mid)<oracle) lo=mid; else hi=mid; }
  const uStar=(lo+hi)/2;
  // 2. place (x,y) on the current curve level F=k at u=uStar:
  //    keep F invariant. F(x,y)=wMid·ln x+(1−wMid)·ln y−(Δw/2)√(τ²+u²)=k_current.
  //    With u=ln(y/x): y=x·e^u. Solve for x from F=k_current.
  const wm = wMid(s), dw2 = 0.5*dW(s), tau = s.tau;
  const kCur = wm*Math.log(s.x)+(1-wm)*Math.log(s.y)-dw2*Math.sqrt(tau*tau+Math.log(s.y/s.x)**2);
  // F = wm·ln x +(1−wm)(ln x+u) − dw2·√(τ²+u²) = ln x − ... ⇒ ln x = kCur −(1−wm)·u + dw2·√(τ²+u²)
  const lnx = kCur - (1-wm)*uStar + dw2*Math.sqrt(tau*tau+uStar*uStar);
  const x_eq = Math.exp(lnx), y_eq = x_eq*Math.exp(uStar);
  if (!(x_eq>0)||!(y_eq>0)) return null;
  return { x: x_eq, y: y_eq, tau: s.tau, wMinus: s.wMinus, wPlus: s.wPlus };
}
```
- **Input:** `s`, target price `oracle` [U/B]. **Output:** reserves point on the same (W) curve with
  `getMP_raw = oracle` (round-trips to 1e-5 by bisection; verified inverse round-trip exact in
  `/tmp/wcurve_verify3.py`).
- **What it replaces:** the closed-form `√(αβ/oracle)` Balancer inverse — invalid on (W).
- `[proven]` (price strictly monotone ⇒ unique inverse; F-level placement is the algebraic solve of
  the level set, exact).
- **PERF NOTE (GOTCHA #4 analog):** bisection is ~200 iters × cheap; if UI-blocking, cache a
  `(u → price)` table at calibration keyed on `(tau, wMinus, wPlus)` and interp/invert (mirror the GH
  `_ghCache` pattern). Not required for correctness; flag if the live curve stutters.

---

## 2. Pricing — mark with γ_loc (smooth-pasting premium)

Base per-wing fraction is UNCHANGED: `markFrac = min(s/θ, θ/s) ∈ (0,1]`. The **American
smooth-pasting premium `mark`** (HEAD v26c lines 1658–1669) carries over VERBATIM in form, but the
exponent `g` is the **local** `γ_loc` evaluated at the relevant carry position, NOT a global
`ghAh − 1`:
```
// (W) smooth-pasting mark. g = γ_loc at the STRIKE's registered carry position (NOT the spot's,
// and NOT a global shape constant). Continuation runs to the free boundary, then intrinsic.
function mark(wing, theta, sNorm, gamma) {        // gamma = γ_loc passed in by caller (§3)
  const g = gamma;
  if (!(g > 1) || !(theta > 0) || !(sNorm > 0)) return markFrac(wing, theta, sNorm);
  if (wing === 'call') {
    const sNstar = theta * Math.pow((g+1)/g, g);
    if (sNorm <= sNstar) return sNorm / ((g+1)*sNstar);
    return 1 - Math.pow(sNorm/theta, -1/g);
  } else {
    const sNstar = theta * Math.pow(g/(g+1), g);
    if (sNorm >= sNstar) return sNstar / ((g+1)*sNorm);
    return 1 - Math.pow(sNorm/theta, 1/g);
  }
}
```
- **The γ_loc to pass:** the caller computes `g = γ_loc(S*)` — the **Reading-A fixed point**
  exponent: `g = γ_loc` evaluated at the strike's registered carry position. For a build, evaluate
  `γ_loc` at the strike's registered `u` (= `gLoc` of `arbitrageToOracle(s, K)`); the elbow variation
  of γ_loc across the narrow continuation band is a few-% (settlement pass 2). `[theory-risk-accepted]`
  (Reading A: value ∝ S^(−γ_loc) BY DEFINITION ⇒ `S* = K·γ_loc(S*)/(γ_loc(S*)+1)` is exact; the
  single-power-through-elbow blend (Reading B) is a separate operator-tier settlement choice — DO NOT
  silently adopt B. Reading A is the locked gate-clearing reading per the operator's LOCKED INPUTS.)
- **What it replaces in v24:** v24's `mark` is the bare no-premium `min(s/θ,θ/s)` (line 1601) — the
  premium continuation/intrinsic arms are NEW to v24 (ported from HEAD's structure, with γ_loc).

---

## 3. Strike registration in carry coordinate `q` (sNormStrike)

Port HEAD v26c `sNormStrike` (lines 1685–1690) — register the dollar strike K on the (W) curve by
the sNorm of the curve point whose marginal price equals K, using the (W) `arbitrageToOracle`:
```
function sNormStrike(s, K) {
  if (!s || !(K > 0)) return NaN;
  const st = arbitrageToOracle(s, K);   // (W) inverse, §1.4
  if (!st) return NaN;
  return getSNorm(st);                  // getSNorm uses wField now — see below
}
```
- `getSNorm` must be re-pointed: v24 `getSNorm = (1−w)/w` with `w = alpha/x`. On (W) use
  `w = wField(s)`: `const getSNorm = (s) => { const w = wField(s); return (1-w)/w; };`
- The strike's γ_loc for the premium (§2): `gLoc(arbitrageToOracle(s, K))`.
- **Why carry, not K/oracle:** identical reasoning to v26c — `sNorm ∝ S^(−γ)` is the carry object;
  `K/oracle` is price-ratio `S^(−1)`; they agree only at γ=1. For γ_loc≠1 the OTM→ITM crossover pins
  to K only with `θ = sNormStrike(s,K)`. `[proven]` (carried over from v26c's verified registration;
  the (W) inverse is the only changed dependency, itself `[proven]`).

---

## 4. Funding (#9) — slope-deviation vs the PRICE-anchor p=P

v24 `fundingPerStrike` (lines 2083–2089): `f = κ·γ·N·mark·(S−1)/S`, `γ = ±2` hardcoded, `S` = pool
spot in oracle-normalised frame. For (W):
- **Anchor choice = price-anchor `p = P`** (carry-verdict guard). The carry pass established that the
  reserve-anchor (`y/x = P`) and the price-anchor (`p = P`) **DECOUPLE** on (W) unless `w=½` there;
  "anchor w=½" is now a single POINT, not a curve slice. Funding must pin ONE; **pin the
  price-anchor `p = P`** — funding is a slope/price deviation and the carry leg is the price leg.
  `[theory-risk-accepted]` (the price-anchor is the carry-consistent choice; that it is THE correct
  economic anchor for (W) funding is not proven — flag).
- **γ → γ_loc:** replace the hardcoded `±2` with the wing's local exponent at the strike's carry
  position, signed: `+γ_loc` call, `−γ_loc` put.
- `S` = pool-vs-anchor ratio at the strike's ray, computed in the carry/price leg (`getMP_raw`
  reading, NOT `u`).
```
function fundingPerStrike(state, K, wing, N, dt, kappa, oracle, oracle_initial) {
  const reg = sNormStrike(state, K);              // strike carry position (θ)
  const g   = gLoc(arbitrageToOracle(state, K));  // local exponent at the strike
  // S = pool-vs-anchor price ratio at the strike ray, anchored at p=P (price-anchor):
  const S = (oracle > 0 && oracle_initial > 0) ? getMP_raw(state) / oracle : getSNorm(state);
  const m = mark(wing, reg, getSNorm(state), g);  // smooth-pasting mark with local γ
  const gamma = (wing === 'call') ? +g : -g;
  if (S <= 0) return 0;
  return kappa * gamma * N * m * (S - 1) / S * dt;
}
```
- **What it replaces:** the hardcoded `γ=±2` and the K/oracle-implicit ray. `[theory-risk-accepted]`.

---

## 5. Dollar pipe (#11) — REUSE, no new path (§6 hard-stop)

**No new dollar path.** The Layer-1 reserve-USD / settlement chain in v24 stays byte-for-byte:
`executeLeg`'s `V_usd = p.V · oracle`, the `raw_net`/`carvedEquityAtClosure`/`trader_payout` chain in
`closeBand`, the two-jobs three-stage unit chain (§2.11 of the spec). The (W) warp changes only the
**curve functions and pricing exponent**; it does NOT touch how carved-perp units convert to dollars.
The intern MUST NOT improvise a dollar path — reuse the existing settlement chain exactly as v24 has
it. `[proven]` (reuse = no change; the dollar pipe is curve-independent by construction).

---

## 6. Knob UI — τ (static, vol-set) + chart behavior

- **Control:** add a single `tau` slider (or numeric), labeled **"kurtosis (ATM elbow roundness),
  vol-set at setup; static — NOT changed by trades."** Wire it to a new pool scalar `tau` (serialized
  alongside `wMinus, wPlus`). Default to a reasonable mid value (e.g. τ=0.3). Range guard τ>0.
  Setting τ recomputes any cached `(u→price)` table (§1.4 perf note).
- **Sign/label honesty (memory MEMORY.md KURTOSIS-KNOB):** smaller τ = sharper elbow = leptokurtic
  (fatter return density at ATM); larger τ → plain Balancer (Gaussian limit). **Do NOT label "τ up =
  fatter"** (backwards). Recommend label tracks the latent-driver object L (1/τ = fatness). Final
  label is the **operator's call** — flag.
- **Chart MUST show:** (a) the **ATM elbow rounds** as τ increases / sharpens as τ decreases —
  visible curvature change at the 45°/ATM region; (b) the **wings are FROZEN** — the far-OTM and
  far-ITM curve segments are byte-identical across τ (wing exponents γ_± = w_±/(1−w_±) are
  τ-independent, verified). A good visual gate: overlay two τ values; they must coincide in the wings
  and differ only in the elbow.
- **What the chart should NOT show:** τ changing the wing slopes / tail exponents (that would be a
  tail-exponent deformation, which (W) is NOT). If wings move with τ, the build is wrong.

---

## 7. `[proven]` vs `[theory-risk-accepted]` LEDGER (pre-written honesty labels)

| # | Claim / construct | Label | Basis |
|---|---|---|---|
| L1 | (W) `F` is a first integral of the local-weight law | `[proven]` | RK4 3.4e-13 (`/tmp/wcurve_verify.py`); analytic |
| L2 | Wing exponents γ_± = w_±/(1−w_±) are τ-independent (frozen wings) | `[proven]` | byte-identical across τ (MEMORY); analytic 1/\|u\|³ vanish |
| L3 | γ_loc(0) = w_mid/(1−w_mid) at ATM | `[proven]` | direct |
| L4 | `getMP_raw = (w/(1−w))(y/x)` == geometric slope (NO e^−ghMu) | `[proven]` | implicit-slope == formula to 1e-15 (`/tmp/wcurve_verify2.py`) |
| L5 | Marginal price p(u)=γ_loc·e^u strictly monotone ⇒ arbitrage inverse unique | `[proven]` | dp/du>0 ∀u (`/tmp/wcurve_verify3.py`) |
| L6 | Carry coordinate = price leg q=ln p; dq/du≠1 in elbow, →1 in wings | `[proven]` | carry pass; `/tmp/wcurve_verify.py` |
| L7 | Reading-A settlement: S* = K·γ_loc(S*)/(γ_loc(S*)+1) exact everywhere | `[proven]` (under Reading A) | fixed-point converges (`/tmp/wcurve_verify3.py`); operator's LOCKED Reading A |
| L8 | Smooth-pasting mark form (continuation→free-boundary→intrinsic) | `[proven]` (form, from v26c) | inherited verified shape; only g→γ_loc changed |
| L9 | sNormStrike carry registration pins crossover to K | `[proven]` (from v26c) | verified in HEAD; (W) inverse is the only changed dep (L5) |
| T1 | tradeUpdate: α=x·w, β=y·(1−w) conserved per-trade at PRE-trade weight | `[theory-risk-accepted]` | paper Trade Formula; the per-trade-freeze is the adopted reading |
| T2 | Trade composition w/ (W) field = R-simple (reserves slide on FIXED field) | `[theory-risk-accepted]` | adopted to allow build; R-paper (field re-center, w→φ) OPEN/#16 |
| T3 | rebase = carry-shift q→q−ln r (NOT rigid x→r·x); w NOT preserved | `[theory-risk-accepted]` | carry-verdict prescription; carry-covariance-in-q lemma PROPOSED-only, not Lean |
| T4 | Funding anchor = price-anchor p=P; γ→±γ_loc | `[theory-risk-accepted]` | carry-consistent choice; correct-economic-anchor not proven |
| T5 | γ_loc for premium evaluated at strike's registered u (elbow few-% var) | `[theory-risk-accepted]` | settlement pass-2: exact on wings, few-% in elbow under Reading B |
| R1 | Dollar pipe reuse, no new path | `[proven]` (reuse=no change) | §6 hard-stop honored |

---

## 8. Things that genuinely CANNOT be fully defined even with theory-risk (FLAG, don't stall)

1. **The trade→curve-skew strong form (R-paper, #16).** The paper's "a trade reshapes the curve" in
   its strong reading (weight-field re-centering `u→u−φ`, the angle-shift skew) has NO defined w→φ
   map. **Built around it** via R-simple (reserves slide on a fixed field) — well-typed and shippable
   — but the strong form is OPEN and operator/theory-tier. Flag to operator.
2. **Carry-covariance-in-q under rebase = PROPOSED Lean lemma only.** The rebase-as-carry-shift law
   (§1.3) is the carry-verdict's prescription but the covariance lemma is not Lean-verified (no
   Aristotle obligation ready — operator-tier coord decision precedes it). Shippable as
   `[theory-risk-accepted]`; flag the unverified status.
3. **γ>1 wing-lock as a calibration constraint.** γ_± = w_±/(1−w_±) > 1 requires w_± > ½. With an
   asymmetric `w_mid`/Δw the put wing can give γ₋<1 (my test params gave γ₋=0.818) — which violates
   the locked γ>1 / pinch-off-at-call-edge requirement and the value∝S^(−γ) put eigenfunction. **The
   chosen (w_mid, Δw) must keep BOTH wing exponents >1** — a calibration/operator constraint, not a
   free knob. Flag: the UI/setup must reject w_± ≤ ½.
4. **Reading A vs Reading B settlement.** This build adopts Reading A (curve-intrinsic, gate-exact)
   per the LOCKED INPUTS. If the operator later wants Reading B (dynamic eigenfunction, the
   MERTON_tie locked frame), the mark exponent picks up the blend correction
   `−p ≈ γ_loc + γ_loc′/(2γ_loc+1)` in the elbow and S* is a few-% approx there. Operator-tier
   settlement-semantics decision; flag, do not pre-decide.
```

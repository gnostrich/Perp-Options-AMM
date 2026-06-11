# CURIOSITY RUN — what invariant produces warp ∝ notional (strike-INDEPENDENT)? ("B")

_research-lead, 2026-06-11. Operator entry 38 — **CURIOSITY ONLY, theory-to-understand.**
**NOT a build artifact, NOT a spec, NOT an authorization.** The current build is path A
(trade-point anchoring); this note has **nothing to do with the live engine** the operator is
playing. **READ-ONLY: no engine edit, no git, no Aristotle submission, no build-file touch.**
Tags: `[analytic]` (closed-form identity) / `[numeric]` (verified at test params). Script
transcribed at the end (`/tmp/curiosityB_explore.js`, node float64, engine functions mirror live
HEAD v27 byte-for-byte). Manager re-derives; this is understanding, not a decision._

---

## 0. The question, stated precisely

We just established (RE-POSED spec + entry-37 verdict) that on the authorized **trade-point-anchored**
construction the per-leg warp factors as

> **|Δφ| ≈ z0(dy) · G(K)**,  z0 = t·τ/√(1−t²), t=(w*−w_mid)/(Δw/2), w*=1−β/(y+dy)   [NOTIONAL/cash channel]
> **G(K) = w′(u_spot)/w′(u_tp(K)) = (τ²+u_tp²)^{3/2} / (τ²+u_spot²)^{3/2}**            [STRIKE channel, ∝ 1/w′(u_tp)]

and the **strike channel G dominates** — same notional warps ~14000× more deep-OTM than ATM. Property
**B** = the thing that does NOT hold under A: **same notional ⇒ same curve warp, for any strike**
(warp ∝ notional, strike-INDEPENDENT). The operator wants to understand, theoretically, **what
invariant / anchoring rule / economic object would PRODUCE B instead.**

Working backward from the requirement "same N ⇒ same φ-shift, any strike," the task is to **kill the
`G(K)` strike channel** — make the warp a function of the notional/cash only.

---

## 1. The construction that yields warp ∝ notional — and the headline surprise

**Headline `[analytic]`: B is obtained by anchoring the warp at the SPOT / reserves point instead of
at the trade point. And that construction is NOT exotic — it is exactly what the LIVE engine's
`tradeUpdate(state, dy)` already does.**

The strike enters A in exactly one place: the gearing `G(K)` is the field curvature read **at the
trade point** `u_tp(K)`. If the warp re-seat reads the field curvature at the **spot/reserves point**
`u_spot` instead — which does not depend on the strike — then

> **G ≡ w′(u_spot)/w′(u_spot) = 1**, identically, for every strike ⇒ **|Δφ| = z0(dy)**, strike-FREE.

This is `candidate (b)`: anchor the warp at spot, size it by the trade's cash demand. It is the
current HEAD behaviour — confirmed by the skeptic (#16) and by the inv3 path: today's
`tradeUpdate(state, dy)` warps **at spot, strike is never an argument**, so φ′ is bit-identical
across strikes at fixed cash leg. **The operator's "B" is the engine's existing spot-anchored warp.**
A is the *proposed change* (trade-point anchoring) that the build is now pursuing; B is the *status
quo ante*.

### 1.1 Numeric confirmation `[numeric]` — A vs B, fixed dy=0.1, gate pool {10,12,0.3,[0.52,0.72],0}

| K/mp0 | G(K) | A: \|Δφ\| = z0·G | B: \|Δφ\| = z0 (G≡1) |
|---|---|---|---|
| 1.00 | 1.0000 | 0.195752 | **0.195752** |
| 1.10 | 1.2726 | 0.249114 | **0.195752** |
| 1.30 | 2.1410 | 0.419096 | **0.195752** |
| 1.60 | 4.4911 | 0.879137 | **0.195752** |
| 2.00 | 9.8034 | 1.919031 | **0.195752** |
| 2.50 | 19.5336 | 3.823744 | **0.195752** |

B is **byte-identical across all strikes** (0.195752 everywhere). A spreads **19.5×** over the same
band. The strike-independence of B is exact (algebraic, `G=1`), not approximate.

### 1.2 The three candidate sizing rules (all give strike-FREE warp; they differ in the size knob)

All three set `G=1` (spot/reserves anchor) — that is what removes the strike. They differ only in how
the **size** (the z0 channel) is fed:

- **(b) size by the cash leg `dy`** (the trade's actual reserve flow). This is the live engine:
  `dy = N·mark·oracle` (premium·oracle) for an option leg, then `w* = 1−β/(y+dy)`, `z0 = z0(w*)`.
  *Mild* residual strike-dependence can still sneak in through `mark(K)` (the premium varies by
  strike), but it enters the **size**, not the gearing — and the entry-37 data showed z0 is nearly
  flat in strike (0.1854 → 0.1861), so even (b) is *approximately* notional-only and *exactly*
  strike-free in the gearing. To make it **exactly** notional-only, use (a):
- **(a) size by NOTIONAL·oracle, dropping the option-mark/premium factor:** `dy := N·oracle` (notional
  × spot), not `N·mark·oracle`. Then z0 is a pure function of N (no strike anywhere). This is the
  cleanest realisation of "warp ∝ notional": the curve reshapes by a fixed amount per *contract of
  notional*, independent of which strike is traded **and** independent of the option's moneyness/premium.
- **(c) explicitly cancel the gearing: `z = z0/G`.** Algebraically valid (it is the λ=−1 member of the
  family in §3 if you let λ go negative; or just "divide out 1/w′(u_tp)"), but it has **no economic
  object** — you are anchoring at the trade point and then deliberately undoing the curvature you just
  measured. Included only for completeness; (a)/(b) are the meaningful constructions.

### 1.3 Warp is strictly monotone in notional under B `[numeric]`

Sizing by notional and sweeping it (B, strike-free), z0 = |Δφ| rises monotonically and still hits the
frozen-wing guard at large size — so B keeps the wing-range rejection (it does not let arbitrarily
large trades through):

| dy | w* | z0 = \|Δφ\| (B) |
|---|---|---|
| 0.02 | 0.67248 | 0.184961 |
| 0.10 | 0.67465 | 0.195752 |
| 0.40 | 0.68252 | 0.240304 |
| 0.80 | 0.69244 | 0.315231 |
| 1.50 | 0.70839 | 0.566897 |
| 2.50 | (w*=0.7285) | **REJECT wing-range** |

---

## 2. What that invariant MEANS economically — and how it differs from A

**B is "impact ∝ size."** The curve reshapes by an amount that depends only on *how much* you trade
(the notional/cash), **not on where on the curve** (which strike / moneyness) you transact. This is
the classic AMM intuition — a constant-product / linear-impact market maker, where a trade of given
size moves the pool by a given amount regardless of the price level. The economic object is: **"the
pool's shape responds to order flow by volume; a contract is a contract."** The warp is anchored at
the live reserves (the pool's actual position), so the reshape is *centred on where the pool is*.

**A is "impact ∝ where on the curve you transact."** A trade-point-anchored warp brings the
post-trade *slope at the strike ray* back to the pre-trade reserves tangent (the paper's σ_B
mechanic) — so a deep-OTM trade, which lands on the flat frozen wing where the field has almost no
curvature (`w′→0`), demands an enormous φ-recenter to re-seat the field. The impact is geared by the
**local curve geometry at the strike**, i.e. by moneyness. The economic object is the paper's: **"the
slope of the post-trade point is brought to the pre-trade reserves point by warping the curve"** — a
*location-aware* impact, larger toward the wings.

**The contrast in one line:** B reshapes by **flow**; A reshapes by **flow × curve-location gearing**.
B is moneyness-blind; A is moneyness-geared (and the gearing diverges in the frozen wings).

### 2.1 Is B self-consistent with the (W) conservation law (α/β) + frozen wings? — YES `[numeric]`

This is the load-bearing honesty question, and the answer is clean. B keeps the **reserves move
untouched** (`y′=y+dy`, `w*=1−β/y′`, `x′=α/w*`) — that channel is already strike-free in A too, so B
inherits full α/β conservation. The only change is the φ re-seat. Under B, φ′ is the **spot/reserves
field inversion** `φ′ = u′ − z0`, which by construction reproduces the demanded local weight `w*` **at
the reserves point**:

| quantity | value |
|---|---|
| w* demanded (1 − β/y′) | 0.67464628 |
| w(reserves; φ_B) | 0.67464628 |
| residual | **0.000e+0** |

So **B is exactly (α,β)-consistent at the reserves point** — it satisfies the *same* one-global-φ
condition the (W) construction needs at the live reserves. It does **not** require giving up
conservation, frozen wings, static τ, or γ>1: the wings are still frozen (φ-recenter leaves `w_±`
invariant), τ is still never written, and the wing-range guard still fires (§1.3).

**What B gives up — precisely one thing:** it does **not** honor the trade-point tangent. At K=1.6·mp0,
the paper's pre-trade tangent at the trade point is σ_B = 0.254291; B's post-trade slope at that same
strike ray is 1.460265 — they do not match. **That tangent match is exactly what trade-point anchoring
(A) buys, and exactly what B trades away.** In paper terms: B does *not* implement "bring the
post-trade point's slope to the reserves point at the strike ray." So B is **self-consistent on (W)**
(conservation + wings + one-global-φ at reserves all hold) but it is **not the paper's trade
mechanic** — it is the spot-anchored mechanic the live engine already has.

> Honest caveat (carried, unchanged): the `(α,β)`-flow-confinement lemma that *certifies* one-global-φ
> path-independence is `[needs-Aristotle]`, OPEN, numeric-0.0 only — true for A and B alike. Do not
> report it as proven for either.

---

## 3. Reconciling the family: A and B are the endpoints of `z = z0·G^λ`, λ∈[0,1]

A (strike-driven, paper) and B (notional-driven, spot) are the two ends of a clean **one-parameter
family** obtained by raising the gearing to a power:

> **z = z0(dy) · G(K)^λ**,  **λ ∈ [0,1]**.
> λ = 1 → **A** (full trade-point gearing; strike-DRIVEN; the paper / current build).
> λ = 0 → **B** (G^0 = 1; spot / notional; strike-FREE; the live-engine status quo).
> λ ∈ (0,1) → **partial gearing.**

**What λ indexes:** *how much the strike (the curve location of the trade) feeds the impact.* λ is the
**moneyness-gearing exponent** — the fraction of the trade-point curvature signal `1/w′(u_tp)` that is
passed into the warp. λ=0: impact is pure flow (moneyness-blind). λ=1: impact is fully location-geared
(paper-faithful, wing-divergent). Intermediate λ: a tunable blend — the warp still grows toward the
wings, but sub-linearly in the curvature ratio, capping the deep-OTM blow-up.

### 3.1 The family, numerically `[numeric]` — fixed dy=0.1, far/near spread vs λ

| λ | K=1.0 | 1.1 | 1.3 | 1.6 | 2.0 | 2.5 | spread (far/near) |
|---|---|---|---|---|---|---|---|
| 0.00 (B) | 0.195752 | 0.195752 | 0.195752 | 0.195752 | 0.195752 | 0.195752 | **1.00×** |
| 0.25 | 0.195752 | 0.207912 | 0.236787 | 0.284966 | 0.346378 | 0.411530 | 2.10× |
| 0.50 | 0.195752 | 0.220827 | 0.286424 | 0.414840 | 0.612906 | 0.865162 | 4.42× |
| 0.75 | 0.195752 | 0.234545 | 0.346467 | 0.603905 | 1.084521 | 1.818834 | 9.29× |
| 1.00 (A) | 0.195752 | 0.249114 | 0.419096 | 0.879137 | 1.919031 | 3.823744 | **19.53×** |

The spread is monotone in λ (1.00× → 19.53×). All members agree exactly at ATM (G=1 there, so G^λ=1
for all λ); they fan out toward the wings, with λ setting the fan width. λ∈(0,1) would also *soften*
the frozen-wing divergence of pure A (G^λ grows slower than G as `w′(u_tp)→0`), which could be a
calibration lever if A's wing blow-up is ever judged too aggressive — but that is an operator/curve
call, not a research finding.

**Note on economic meaning of intermediate λ:** λ=1 and λ=0 each correspond to a recognizable object
(location-geared impact / flow-impact). λ∈(0,1) is a *phenomenological blend* — it has no single clean
"anchor at point X" story (it geometrically averages the spot and trade-point curvatures in log).
That is honest: the two endpoints are the principled constructions; the interior is a tuning knob, not
a new economic object.

---

## 4. Crisp summary (for the manager → operator — CURIOSITY, not a decision)

1. **What produces warp ∝ notional (strike-independent)?** Anchor the warp at the **spot / reserves
   point** instead of the trade point. That sets the strike gearing `G ≡ 1` identically, so
   `|Δφ| = z0(notional)` — strike-free. The **cleanest** form sizes by `dy = N·oracle` (notional·spot,
   dropping the option premium/mark), giving warp a pure function of notional N. `[analytic]`,
   confirmed strike-identical and notional-monotone `[numeric]`.
2. **The surprise worth flagging:** **B is exactly what the LIVE engine already does** —
   `tradeUpdate(state, dy)` warps at spot, strike is never an argument (skeptic #16). So "B" is the
   *status quo ante*; **A (trade-point anchoring) is the change** the current build is making. The
   operator's curiosity is, in effect, "what was the old behaviour, economically?" — answer: impact ∝
   size.
3. **Economic meaning:** B = **impact ∝ size** (constant-product / linear-impact AMM intuition;
   moneyness-blind; "a contract is a contract"). A = **impact ∝ curve-location** (paper's σ_B mechanic;
   moneyness-geared; larger toward the wings, divergent at the frozen wing). B reshapes by flow; A
   reshapes by flow × location-gearing.
4. **Self-consistency of B with (W):** YES — B keeps α/β conservation, frozen wings, static τ, γ>1,
   and the wing-range guard, and is exactly (α,β)-consistent at the reserves point (residual 0.0). The
   **one thing B gives up** is the trade-point tangent σ_B (0.254 vs B's 1.460 at K=1.6·mp0) — i.e. B
   is self-consistent but is **not the paper's trade mechanic**.
5. **The family:** A↔B are the endpoints of **z = z0·G^λ, λ∈[0,1]** — λ is the **moneyness-gearing
   exponent** (how much the strike feeds the impact). λ=1 paper/A (spread 19.5×), λ=0 spot/B (spread
   1×), interior = tunable blend (no distinct economic object; would also soften A's wing divergence).
6. **Scope/honesty:** purely understanding. **Nothing built, submitted, edited, or committed.** This
   does not reopen the build (path A stands); the `(α,β)`-flow lemma remains `[needs-Aristotle]`/OPEN
   for both A and B. Which mechanic the venue wants (impact-by-size vs impact-by-location) is an
   operator / curve-object call — but the operator has *already chosen A*; this note only maps what B
   would mean.

---

## Script (transcribed)

`/tmp/curiosityB_explore.js` — node float64, engine functions (`wField`, `getMP_raw`,
`arbitrageToOracle`, `wPrimeAtU`) copied byte-for-byte from the live-HEAD-mirroring `/tmp/repose3.js`.
Pool `{x:10,y:12,τ:0.3,w∈[0.52,0.72],φ:0}`, mp0=2.457812, oracle=80000. Produces: the A warp table
(§1.1 left), the B strike-identical table (§1.1 right), the notional-monotonicity sweep (§1.3 — run as
a one-liner with realistic dy), the A↔B `G^λ` family table (§3.1), and the B self-consistency /
tangent-mismatch check (§2.1). All numbers above are its direct output.

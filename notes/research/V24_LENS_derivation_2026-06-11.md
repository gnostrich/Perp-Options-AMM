# V24 + polar-lens architecture — derivation run (READ-ONLY, 2026-06-11)

_Author: research-lead. READ-ONLY: no engine edit, no git, no Aristotle submission. HEAD untouched at
md5 `928cde1c`. Reference build for BASE pool mechanics: `engine/builds/temporal_mvp_v24_rebase_fixed_2.html`
(plain-Balancer pool, v24 α/β trade mechanic). Architecture spec being derived-within (NOT redesigned):
`specs/SPEC_v24_lens_architecture_HANDOFF_2026-06-11.md`; operator transcript entries 80–88 in
`history/operator/2026-06-10_kurtosis-curve-family-brief.md`. Tags: [analytic] / [numeric]. Every asserted
number float64-checked; scripts transcribed below. Self-adversarial — skeptic re-derives after._

## 0. The architecture in my own words (to pin the object before deriving)

- **Pool = plain weighted Balancer** `x^w·y^(1−w)=k`. ONE steepness scalar `w` (γ = w/(1−w)). No weight
  field `w(u)`, no τ in the pool. This is the v24 object exactly.
- **v24 trade mechanic (unchanged):** α = x·w, β = y·(1−w) conserved per trade; the reserves ride the
  hyperbola `(x−α)(y−β)=αβ`; `w = α/x` is re-derived after. (Engine `tradeUpdate`, v24 L1617.)
- **Kurtosis = a polar LENS in the QUERY layer only:** `h_τ(u) = √(τ²+u²) − τ`, with
  `h′_τ(u) = u/√(τ²+u²)` (0 at the mode → 1 in the wings). `u` = log-moneyness measured from the mode
  (the ATM ray). The **option-surface local decay exponent** is `G(u) = γ·h′_τ(u)`: flat top at the
  money (G→0), melting into frozen power-law wings of exponent γ. τ is the single static kurtosis knob,
  vol-set at deploy.
- **The lens never touches the pool update.** AMM-tx execution, settlement, and funding *read through*
  the lens; the pool curve only ever skews via the v24 α/β trade.

This is structurally **different from (W)** (the demoted v27 curve), where the kernel `√(τ²+u²)` lived
INSIDE a position-dependent pool weight `w(u)`. That is the single most important difference and it is
exactly what makes the far-OTM divergence go away — see (a).

---

## (a) Trade-point-through-lens goal-seek on plain Balancer — THE key question

**Verdict: the (W)-era far-OTM divergence is ABSENT. [analytic + numeric]**

### Why it diverged before, and why it cannot here
The old ~1.4×-strike-cap driver was the gearing factor `1/w′(u)`. In (W) the pool weight was a FIELD
`w(u) = w_mid + (Δw/2)·u/√(τ²+u²)`, whose derivative `w′(u) = (Δw/2)·τ²/(τ²+u²)^{3/2} → 0` in the
wings. The warp-restore goal-seek had to divide by that vanishing slope ⇒ `1/w′(u) → ∞` in the wing ⇒
unbounded warp travel ⇒ the strike cap.

On **plain Balancer there is no `w(u)`** — `w` is a single global scalar. There is therefore **no
`1/w′(u)` channel at all**. The only thing that can play the role of the lens slope is the lens
Jacobian `dG/du = γ·h″_τ(u)`, with `h″_τ(u) = τ²/(τ²+u²)^{3/2}`. This is **bounded everywhere**:
maximal `= γ/τ` at the mode (u=0), decaying to 0 in the wings — the opposite shape to `1/w′`.

```
=== lens Jacobian dG/du = gamma*h''(u) is BOUNDED (no frozen-wing blow-up) ===  [/tmp/lens_a2.js]
tau=0.1:  u=0:G'=26.36  u=0.5:0.199  u=1:0.026  u=2:0.0033  u=4:0.0004  u=8:0.0001  (max gamma/tau=26.36 at mode)
tau=0.3:  u=0:G'=8.79   u=0.5:1.197  u=1:0.209  u=2:0.0287  u=4:0.0037  u=8:0.0005  (max 8.79 at mode)
tau=1.0:  u=0:G'=2.64   u=0.5:1.886  u=1:0.932  u=2:0.2358  u=4:0.0376  u=8:0.0050  (max 2.64 at mode)

contrast — the OLD (W) gearing 1/w'(u) which DID blow up (tau=0.3, dw=0.2):
  u=0:3.0   u=1:1.26e2   u=2:9.19e2   u=4:7.17e3   u=8:5.70e4   u=12:1.92e5   (-> inf in wings)
```

### What the "goal-seek" actually is here
On plain Balancer a trade fully determines the new state `(x,y,w)` via α/β conservation; there is **no
free warp parameter to root-find**. "Restore the post-trade slope at the trade point seen through the
lens" (entry 88) reduces to a deterministic READOUT: the lens **mode = the live marginal price**. A
trade moves the marginal; the mode (ATM ray, u=0) moves with it; the lens shape τ is static. There is
nothing to solve, so the goal-seek is **single-valued and well-posed at every strike, trivially.**

### Gearing / warp magnitude at K = 1.1 / 1.4 / 2 / 4 × spot
Pool: w=0.725 (γ=2.6364), x0=10, oracle=80000 ⇒ y0=303448.28 (marginal=oracle). τ=0.3. A +10% cash
trade moves γ 2.6364→3.0000 and shifts the mode to u=0.25842 (relative to the old ATM ray).

```
=== surface decay exponent G(u)=gamma*h'(u) at strikes, before/after a +10% trade ===  [/tmp/lens_a3.js]
K(xspot)  u=lnK    G_pre      G_post     dG
1.1       0.0953   0.79826   -1.43301   -2.23127
1.4       0.3365   1.96779    0.75534   -1.21244
2.0       0.6931   2.41947    2.46913   +0.04966
4.0       1.3863   2.57672    2.89919   +0.32248
```
`dG` is **bounded and smooth at every strike including 4×**. No blow-up, no cap forced by divergence.

⚠ **But note the sign flip at K=1.1:** after the +10% trade the mode has moved to u=0.258, so the
K=1.1 strike (u=0.095) is now BELOW the mode. `h′(u−u_mode) < 0` there ⇒ `G_post = −1.43`. A negative
decay exponent is a **call strike that has crossed to the put side of the mode**. That is geometrically
correct (the mode moved past it) but it means the option-surface query MUST branch on side-of-mode
(call vs put) using `|u−u_mode|`, exactly as v24's `markFrac` already branches `sNorm<theta` vs `>`.
The raw `γ·h′` with a signed `h′` is not the pricing exponent on the wrong side — the pricing layer
takes `G = γ·h′(|u−u_mode|) = γ·|u−u_mode|/√(τ²+(u−u_mode)²)`, which is ≥0. This is the put/call
asymmetry living natively in the pricing layer (operator entry 80), not a defect. **Flagged for (c)**:
the monotonicity gate must be stated on `|u−u_mode|`, and the trade-induced mode shift is what feeds it.

### Is a strike cap still needed, and why?
**No cap is forced by warp divergence** (the (W) reason is gone). A cap, if any, comes only from the
**economic/settlement domain** (deep-OTM marks ≈ 0; listing strikes past where the mark underflows is
a product/calibration call, not a math necessity). This is a strict improvement over (W), where the cap
was a hard mathematical domain boundary (`|Δφ|≤τ`).

### Single-valued / well-posed / path-independent
```
=== round-trip (+dy then -dy) restores state exactly ===  [/tmp/lens_a3.js]
base: x=10            y=303448.275862  w=0.725
+dy:  x=9.666667      y=333793.103448  w=0.75000000
-dy:  x=10.0000000000 y=303448.275862  w=0.7250000000     round-trip x err=0.0  w err=0.0
path-indep: one-step x=9.5285714286  vs two-step x=9.5285714286   err=0.0
```
α,β are genuine flow invariants ⇒ trade path-independent and round-trip-exact to float64 (identical to
v24 / plain Balancer; the lens, being a static query-layer readout, cannot break this).

**(a) bottom line:** works. The divergence vanishes because plain Balancer has no frozen pool wing
(no `w(u)`, no `1/w′`); the lens Jacobian is bounded (max γ/τ at the mode). Goal-seek = "mode tracks
marginal," a readout, single-valued/well-posed/path-independent at all strikes. The only live obligation
is that the pricing layer reads `G = γ·h′(|u−u_mode|)` (side-of-mode branch) — already v24's `markFrac`
shape.

---

## (b) Settlement through the lens — closed form + ATM-jump (smooth-pasting) port

**Verdict: works-with-bound. The v26b smooth-paste closed form survives PER STRIKE; it stays real,
finite, and smoothly-pasting even where the local exponent < 1. [analytic + numeric]**

### The value law and the free boundary
v26b (Reading A, value ∝ S^(−g)) gives, for a CALL at strike ray θ with a CONSTANT exponent g:
continuation `c·sNorm` runs past the strike to the free boundary `sNorm* = θ·((g+1)/g)^g`
(price multiple `S* = g/(g+1)`), `c = 1/((g+1)·sNorm*)`, then intrinsic `1 − (sNorm/θ)^(−1/g)`.
(HEAD v27 `mark()`, L1678–1690.)

**Through the lens the exponent is no longer global — it is the strike-local `g = g_loc(u_K) =
γ·h′_τ(|u_K|)`, where `u_K = ln(K/mode)`.** Crucially `g_loc(u_K)` is a CONSTANT for a given strike and
pool state (the lens is static). So the SAME closed form applies with `g := g_loc(strike)`. Closed form
survives; only its argument changes.

```
=== settlement: per-strike local exponent, closed-form S* (tau=0.3, gamma=2.6364) ===  [/tmp/lens_b.js]
K(xmode)  u_K     g_loc    sNorm*      S*=g/(g+1)
1.05      0.0488  0.4232   n/a         g_loc<=1
1.10      0.0953  0.7983   n/a         g_loc<=1
1.40      0.3365  1.9678   2.244717    0.663052
2.00      0.6931  2.4195   2.309397    0.707560
4.00      1.3863  2.5768   2.327937    0.720417

smooth-paste value+slope continuity at sNorm* (theta=1, local g):
K=1.4 g=1.97: value gap 3.0e-7 (=fd eps)  slope gap 2.8e-17 (machine zero)
K=2.0 g=2.42: value gap 2.5e-7            slope gap 2.8e-17
K=4.0 g=2.58: value gap 2.4e-7            slope gap 1.4e-17
```
The ATM-jump fix ports cleanly: value and slope paste to machine precision with the local exponent.

### The flat-top obstruction (the one bound)
Near the mode the lens drives `g_loc < 1` (flat top — this IS the kurtosis). The American smooth-paste
boundary `S*=K·g/(g+1)` is an exercise boundary that conceptually needs a convex-enough payoff (`g>1`).
The g_loc=1 crossing is closed-form:
```
=== g_loc(u)=1 at u* = tau/sqrt(gamma^2-1) ===  [/tmp/lens_b2.js]
gamma=2.6364, tau=0.3 -> g_loc<1 for K within +/-13.1% of mode (K in 0.884..1.131)
gamma=2.6364, tau=0.1 -> +/-4.1% ; tau=0.5 -> +/-22.7% ; tau=1.0 -> K in 0.664..1.507
```
**But the closed form does not blow up there** — it stays real/finite and the smooth-paste is still
exact (verified to machine zero for g=0.4, 0.7, 0.99, 1.0, 1.5):
```
g=0.40: sNorm*=1.65054 S*=0.28571 slopeGap 5.6e-17 valGap 1.1e-16
g=0.70: sNorm*=1.86100 S*=0.41176 slopeGap 1.1e-16 valGap 0.0
g=1.00: sNorm*=2.00000 S*=0.50000 slopeGap 0.0     valGap 0.0
g=1.50: sNorm*=2.15166 S*=0.60000 slopeGap 0.0     valGap 0.0
```
So the **settlement value law is closed-form at every strike**; what degrades for g<1 is the *American
early-exercise interpretation* of the free boundary, not the analytic settlement. Whether to (i) accept
the shallow-power value law as the settlement for near-ATM strikes, or (ii) clamp the flat-top band's
settlement to a European/intrinsic reading, is a **settlement-semantics call (operator-tier, entry-85
"ATM-jump stuff at feature level")**. Reading-A consistency holds for g>1 exactly as v26b; for g≤1 the
Reading-A formula still evaluates but its exercise meaning needs the operator's ruling.

**(b) bottom line:** closed-form free boundary survives per strike (S*=K·g_loc/(g_loc+1)); ATM-jump
smooth-paste ports exactly (value+slope continuous to machine zero); the one bound is the flat-top band
|ln K| < τ/√(γ²−1) where g_loc<1 and the American-exercise reading of S* degenerates — a
settlement-semantics decision, not a math break.

---

## (c) No-arb bound on lens extent τ — monotonicity + butterfly

**Verdict: works. τ is NOT bounded by no-arbitrage when the pricing layer reads the side-of-mode branch
`g_loc(|u−u_mode|)`. The real bound on τ is calibration (flat-top width), not arbitrage. [analytic +
numeric]**

### Butterfly (convexity-in-strike) and monotonicity-in-strike: hold for all τ
```
=== call-premium monotone & convex in strike, across tau ===  [/tmp/lens_c.js]
tau     monotone?  convex(butterfly>=0)?  min butterfly
0.05    YES        YES                    +7.6e-7
0.30    YES        YES                    +8.1e-7
1.00    YES        YES                    +1.2e-6
3.00    YES        YES                    +2.4e-6      (positive butterfly at every tau tested)
```

### Monotonicity-in-spot: depends on the side-of-mode branch (this is the subtle part)
The no-arb monotonicity guard for a local-exponent surface is `g_loc(u) + g_loc′(u) > 0` (from the
POLAR_density note). With the **SIGNED** lens exponent used on both sides this fails for τ ≳ 0.01 — but
that failure is an artifact of using a *negative* exponent on the put side, which the architecture does
NOT do. The pricing layer (operator entry 80; v24 `markFrac` already branches `sNorm<θ` vs `>`) reads
the exponent on the CORRECT side as `g_loc(|u−u_mode|) ≥ 0`. On the `|u|` half-line:
```
=== guard g_loc(|u|)+g_loc'(|u|) over u>=0 ===  [/tmp/lens_c2.js]
tau=0.05: min 2.6363 | tau=0.3: 2.6320 | tau=1: 2.5826 | tau=3: 0.8788 | tau=10: 0.2636   (all > 0)
```
**With the side-of-mode branch the guard is > 0 for all τ ⇒ no τ bound from monotonicity.** This is the
same finding as (a)'s K=1.1 sign-flip: the pricing layer MUST use `|u−u_mode|`. That is a binding
*construction* requirement, not a τ bound.

### Asymptote preservation (binding gate) holds unconditionally
```
=== g_loc(u) -> gamma as |u|->inf, every tau ===  [/tmp/lens_c3.js]
tau=0.05/0.3/1/3/10: g_loc at u=80 = 2.6364/2.6364/2.6362/2.6345/2.6160  (-> gamma; lens -> identity in wings)
```

### Where τ actually bites
Not arbitrage — the **flat-top half-width** `|ln K| < τ/√(γ²−1)`, which grows with τ:
```
tau=0.1 -> +/-4.1% of mode ; tau=0.3 -> +/-13.1% ; tau=1 -> +/-41% ; tau=2 -> +/-82%
```
τ is bounded by how wide a g_loc<1 flat top the product tolerates (a vol-set calibration choice, exactly
the operator's static-knob framing, entries 3/84), not by a no-arb wall.

**(c) bottom line:** butterfly + strike-monotonicity hold for all τ; spot-monotonicity holds for all τ
*given the side-of-mode `|u−u_mode|` branch*; asymptotes preserved unconditionally. No-arb does not cap
τ — calibration (flat-top width) does.

---

## (d) Funding through the lens

**Verdict: works. Formula = HEAD's with γ → g_loc(u_K); sign unchanged, scale shrinks to 0 at ATM and
recovers γ in the wings. [analytic + numeric]**

HEAD funding (L2245): `f = κ·γ·N·m·(S−1)/S·dt`, γ→±g_loc, m=mark, S=poolMark/oracle. Through the lens
the only change is `γ → g_loc(u_K)` (strike-local) and the mark uses the local exponent; S is read at
the live reserves; the w=½ reference ray is the lens mode (u=0).
```
=== funding through lens (tau=0.3, S=1.05, kappa=0.1) ===  [/tmp/lens_def.js]
K(xmode)  u_K     g_loc    m(call)    funding f
1.00      0.0000  0.0000   0.000000   0.0      <- ATM funding -> 0 (flat top has no slope-deviation)
1.05      0.0488  0.4232   0.420554   8.5e-4
1.10      0.0953  0.7983   0.277580   1.1e-3
1.40      0.3365  1.9678   0.112580   1.1e-3
2.00      0.6931  2.4195   0.066481   7.7e-4
4.00      1.3863  2.5768   0.031526   3.9e-4
```
- **Sign change: none** (g_loc ≥ 0, same call=+ / put=− convention, on the side-of-mode branch).
- **Scale change: yes, and benign** — funding magnitude shrinks toward ATM (g_loc < γ near the mode,
  → 0 at the mode) and recovers the HEAD value (γ) in the wings. No new divergence. The ATM-funding→0
  behaviour is the lens's flat top expressing itself in the funding leg — consistent with the
  static-knob framing (a flat ATM surface exerts no slope-deviation funding pressure).

**(d) bottom line:** funding ports with γ→g_loc(u_K); no sign change; scale shrinks to 0 at ATM,
recovers γ in wings; no divergence. One flag: ATM funding being ~0 is a behavioural change vs the
constant-γ HEAD and should be surfaced to the operator as expected (not a bug).

---

## (e) Vertical-spread one-tx composite through the lens

**Verdict: BROKEN (closed form) / works-with-bound (concept). The bare θ* = √(θ₁θ₂), `2sinh(δ)` closed
form does NOT survive the lens; a single-tx composite still EXISTS but needs a per-spread solve, and
near the flat top the `2sinh` decomposition itself fails. [analytic + numeric]**

The v24/HEAD identity `N(m₁−m₂) = N·m(θ*)·2sinh(δ)` with `θ*=√(θ₁θ₂)`, `δ=½ln(θ₂/θ₁)` is an EXACT
algebraic identity **only because both legs share a COMMON power-law exponent** in the OTM branch
(skeptic-verified, manager entry-30). Through the lens each leg carries its OWN local exponent
`g_loc(u_i)`, so the common-exponent algebra no longer holds:
```
=== bare sqrt-shortcut error through the lens (tau=0.3) ===  [/tmp/lens_def.js]
t1=1.2,t2=1.5: g1=1.37 g2=2.12 | N(m1-m2)=7.18e-2 vs bare-shortcut 2.63e-2  rel.err 63%
t1=1.5,t2=2.0: g1=2.12 g2=2.42 | 3.09e-2 vs 2.19e-2  rel.err 29%
t1=2.0,t2=3.0: g1=2.42 g2=2.54 | 2.28e-2 vs 2.05e-2  rel.err 10%
```
A corrected single-θ* (solving `m(θ*)·2sinh(δ)=m₁−m₂`) exists by IVT for deep spreads but shifts ~5–13%
off √(θ₁θ₂), and for near-money spreads the required composite mark falls OUTSIDE `[m(θ₂),m(θ₁)]`
(no valid θ* — the `2sinh` form cannot represent the spread there at all):
```
=== corrected composite ===  [/tmp/lens_e2.js]
t1=1.2,t2=1.5: required m*=0.321 NOT in [0.094,0.166] -> NO valid theta* (2sinh form fails near flat top)
t1=2.0,t2=3.0: required m*=0.056 in range -> theta*=2.226 vs sqrt 2.449 (shift -9.1%)
t1=3.0,t2=3.3: theta*=3.010 vs sqrt 3.146 (shift -4.3%)
=== recovery deep in the wing (common g_loc) ===
t1=5,t2=6:   rel.err 1.5e-2 | t1=10,t2=12: 5.5e-3 | t1=20,t2=24: 2.6e-3   (-> 0 as g_loc->gamma)
```
**The one-tx execution shortcut survives as a CONCEPT** — a single AMM tx still carries the spread's net
value `N(m₁−m₂)`, and the trade execution itself (the pool warp) is strike-free per (a)/(f), so a
two-leg same-wing spread is still ONE pool tx. What is lost is the closed-form *pricing* shortcut
`θ*=√(θ₁θ₂)` for the premium: the premium must be computed leg-by-leg through the lens (each leg's own
`g_loc`) and summed. The √-form recovers asymptotically deep in the wings (common γ).

**(e) bottom line:** one-tx EXECUTION shortcut survives; the closed-form `√(θ₁θ₂)`/`2sinh` PRICING
shortcut is broken by the per-leg lens exponents, fails outright near the flat top, and recovers only in
the deep wing. Pricing a spread = sum two lensed legs (no closed-form composite point). **This is the
single hardest obstruction in the whole architecture** — see closing.

---

## (f) Slippage per strike

**Verdict: works, and cleanly. Slippage (pool warp) is strike-free given the cash leg; the strike enters
only the premium that sizes the cash leg. [analytic + numeric]**

Per (a), on plain Balancer the warp is `|u_tp| = f(dy)` with NO strike channel. So:
```
=== SAME PREMIUM (dy=$40000 fixed across strikes): warp IDENTICAL ===  [/tmp/lens_def.js]
K=1.0/1.1/1.4/2/4: warp = 0.33410817 everywhere (strike-invariant to float64)

=== SAME NOTIONAL (N=1 BTC, dy=N*mark(K)*oracle): warp shrinks OTM (mark falls) ===
K     mark      dy          warp |u_tp|
1.0   1.00000   80000.00    6.20e-1
1.1   0.26436   21148.97    1.84e-1
1.4   0.10722   8577.56     7.65e-2
2.0   0.06332   5065.22     4.55e-2
4.0   0.03002   2401.98     2.17e-2
```
Same-premium ⇒ identical warp (premium fixes dy fixes the warp). Same-notional ⇒ warp shrinks OTM
because the premium (and thus dy) falls with the lensed mark. This is the same value/slippage separation
the prior B-note established, now on the cleaner plain-Balancer pool: slippage = pure size impact
(strike-blind); value = lensed mark(K). No divergence, no cap.

**(f) bottom line:** works. Slippage is strike-invariant per unit cash; strike-dependence enters only
through the lensed premium that sizes the cash leg.

---

## Per-item verdict table

| Item | Verdict | Why / the bound |
|---|---|---|
| (a) trade-point-through-lens goal-seek | **works** | Divergence ABSENT — no `w(u)` ⇒ no `1/w′` channel; lens Jacobian `γ·h″` bounded (max γ/τ at mode). Goal-seek = "mode tracks marginal," a readout: single-valued, well-posed, path-independent, round-trip-exact. No warp cap needed. Construction req: price `g_loc(|u−u_mode|)`. |
| (b) settlement through lens | **works-with-bound** | Closed-form `S*=K·g_loc/(g_loc+1)` per strike; ATM-jump smooth-paste ports exactly (value+slope to machine zero), stays finite even for g_loc<1. Bound: flat-top band `|ln K|<τ/√(γ²−1)` where g_loc<1 ⇒ American-exercise reading of S* degenerates (settlement-semantics call, operator-tier). |
| (c) no-arb bound on τ | **works** | Butterfly + strike-monotonicity hold ∀τ; spot-monotonicity holds ∀τ given the `|u−u_mode|` branch; asymptotes preserved unconditionally. No-arb does NOT cap τ — flat-top width (calibration) does. |
| (d) funding through lens | **works** | γ→g_loc(u_K); sign unchanged; scale → 0 at ATM, → γ in wings; no divergence. Flag: ATM funding ~0 is an expected behavioural change vs constant-γ HEAD. |
| (e) vertical-spread one-tx composite | **broken (closed form) / works-with-bound (concept)** | `θ*=√(θ₁θ₂)`,`2sinh(δ)` PRICING shortcut broken by per-leg `g_loc`; fails outright near flat top (no valid θ*); recovers in deep wing. One-tx EXECUTION still holds (single strike-free pool warp). Pricing = sum two lensed legs. |
| (f) slippage per strike | **works** | Warp strike-invariant per unit cash (no strike channel on plain Balancer); strike enters only the lensed premium sizing the cash leg. Same-premium ⇒ identical warp; same-notional ⇒ warp shrinks OTM. |

## The single hardest obstruction

**(e) — the closed-form vertical-spread composite `θ*=√(θ₁θ₂)` does not survive the lens.** It was an
exact identity *only* under a common OTM power-law exponent; the lens gives each leg a different
`g_loc(u_i)`, so the `2sinh(δ)` decomposition breaks (63% error at a near-money spread) and near the
flat top admits no single composite mark at all. Everything else either works outright (a, c, d, f) or
degrades only in an operator-tier settlement-semantics zone (b). The execution shortcut (one pool tx for
a two-leg spread) survives; the *pricing* shortcut does not. This is the one place where the operator's
"keep the vertical-spread one-tx shortcut intact" (entry 85) is only PARTIALLY honoured: execution yes,
closed-form pricing no.

## What remains before a build spec

1. **Operator-tier decisions (flag via manager — do NOT decide here):**
   - (b) settlement semantics in the flat-top band g_loc<1: accept the shallow-power Reading-A value, or
     clamp to European/intrinsic? (entry-85 "ATM-jump at feature level").
   - (d) ATM funding → 0 is an expected behavioural change — confirm acceptable.
   - (e) whether the vertical-spread shortcut may be downgraded from closed-form pricing to "one-tx
     execution + leg-by-leg lensed pricing," or whether a closed-form composite is a hard requirement
     (if hard, the lens spec needs rework — this is the live tension with entry 85).
   - τ calibration (flat-top width) — vol-set, operator's curve/calibration call.
2. **Construction requirements (mechanical, not decisions):** pricing/funding/settlement all read
   `g_loc(|u−u_mode|)` (side-of-mode branch); the lens mode = live marginal price (tracks trades).
3. **No new Lean obligation is ready to pin.** The lens is a static algebraic readout on a plain-Balancer
   pool; (a)/(f) inherit v24's α/β path-independence (already covered). Candidate future obligations
   (NOT submitted): `g_loc(|u|)+g_loc′(|u|)>0` monotonicity on the correct-side branch; smooth-paste
   value+slope continuity at S* for the local exponent. Both are short and only worth pinning after the
   operator rules on the (b)/(e) semantics above. Nothing submitted/built/edited/git this run.

_All numbers float64-checked; scripts `/tmp/lens_{a,a2,a3,b,b2,c,c2,c3,def,e2}.js`. Self-adversarial:
the (e) breakage and the (a) sign-flip / side-of-mode requirement were actively hunted, not glossed.
Skeptic re-derives before this reaches the operator as settled._

---
---

# CORRECTION — re-run after operator rejected the prior pass as a GROSS TRUNCATION (2026-06-11)

_Author: research-lead. READ-ONLY: no engine edit, no git, no Aristotle. HEAD untouched `928cde1c`.
Base build = `engine/builds/temporal_mvp_v24_rebase_fixed_2.html`. Source of the correction:
operator transcript entries **88, 91, 93** (verbatim) in
`history/operator/2026-06-10_kurtosis-curve-family-brief.md`. Scripts re-transcribed below; new files
`/tmp/lensX_{setup,1_goalseek,1b_feedback,2_strikedep,3_cap,4_wellposed,5_settle,6_onetx}.js`
(node float64). Tags [analytic]/[numeric]._

## C.0 What the prior pass got wrong, in one paragraph

The prior pass (the body above) reduced the warp to "plain un-lensed v24 `tradeUpdate`, strike-blind at
the pool, lens only a divorced pricing overlay" and then reported the architecture as **strike-blind**
in observable terms (see prior (a)/(f): "warp strike-invariant per unit cash"). The operator
(**entry 91, verbatim**): _"I said that the same curve warp goal seek works but as seen through the lens,
meaning that the curve looks warped as per the lens, so you'd goal seek as per what you'd see there …
thats a gross truncation."_ The correction: the object the operator and the trader **see and goal-seek
against is the LENSED curve-2**, and a trade reshapes that lensed view **differently at different
strikes** even though the pool input is one cash number. The pool update being strike-blind is true and
unchanged; calling the **observable** strike-blind was the truncation. Below is the corrected derivation.

The operator's own relaxations confirmed against the math (entry 93): **#2 no cap** (verified — holds,
hard bound `|dG|≤γ`), **#4 one-tx execution only, closed-form spread pricing dropped** (honoured),
**#5 funding→0 at ATM accepted** (kept). The w>½ clamp is **gone** (entry 93 #3: "now theres just x y w
that move").

## C.1 (item 1) Trade-update + lensed goal-seek, explicitly

**The pool update is plain v24, lens-free; the goal-seek is a statement about the LENSED VIEW you read
it in. [analytic + numeric]**

Plain weighted Balancer `x^w·y^(1−w)=k`. Engine `tradeUpdate` (v24 L1617) conserves `α=x·w`,
`β=y·(1−w)`; a cash leg `dy` gives, **exactly**:

```
y' = y + dy
x' = x − α·β·dy / [ (y−β)·(y'−β) ]
w' = α / x'                          (w MOVES on the trade — entry 16 faithful)
mp' = w'·y' / ((1−w')·x')            (new marginal = new mode of curve-2)
```

This update **reads only `dy`** — it cannot depend on τ or the lens. Verified: the post-trade `(x,y,w)`
is byte-identical for τ ∈ {0.05, 0.3, 1, 5} (`/tmp/lensX_1_goalseek.js`):
```
+10% cash, any tau:  x=9.66666667  y=333793.1034  w=0.75000000  mp=103590.96
```

**What "goal-seek as seen through the lens" (entry 88/91) means precisely.** The mode of curve-2 is the
live marginal `mp`. A query strike `K` sits at signed log-moneyness `u = ln(K/mp)` **from the mode**. The
**lensed local exponent** (the slope of the option-price graph as drawn through the polar lens) is
`G(u) = γ·h′_τ(|u|)`, `h′_τ(u)=u/√(τ²+u²)` (0 at the mode → γ in the wings). A trade shifts the mode by
`d = ln(mp'/mp)`; a **fixed** strike `K` is re-read at `u_post = u_pre − d`. So the slope **you see** at
the trade point moves `G(u_pre) → G(u_post)` — and **that** is what you goal-seek against. There is **no
free warp parameter to root-find** (plain Balancer fixes the trade by `dy`); the goal-seek is the
deterministic statement "the mode tracks the marginal and the lensed slope at every strike re-reads at
the shifted moneyness."

**The ONLY channel by which the lens touches the pool is the cash leg sizing** for a fixed NOTIONAL:
`dy = N·m_lens(K)·mp0`, where the lensed premium `m_lens` is strike-dependent. The pool update of that
`dy` is still byte-identical Balancer. The lens never re-sizes a given `dy`
(`/tmp/lensX_1b_feedback.js`). This matches entry 93 #4 ("one tx execution is all") and entry 93 #3/16
("just x y w that move", "same as balancer literally").

## C.2 (item 2) Strike-dependent or strike-blind — IN OBSERVABLE TERMS

**Observable = STRIKE-DEPENDENT. The pool input is strike-blind; the lensed curve-2 reshape is not.
[numeric] — this is the exact point the prior run inverted.**

Same cash `dy` ⇒ one mode shift `d` (strike-blind input). But the lensed curve-2 warp at strike `K`,
`dG(K) = γ·[h′(|u_pre−d|) − h′(|u_pre|)]`, varies strongly by strike (`/tmp/lensX_2_strikedep.js`):

```
+10% cash, mode shift d=0.258423 (one number, strike-blind input)
K(xmode)  u_pre    u_post   G_pre   G_post   dG        dLnPrem
1.00      0.0000  -0.2584  0.0000  1.7206   +1.7206   -0.4447
1.05      0.0488  -0.2096  0.4232  1.5101   +1.0869   -0.2959
1.10      0.0953  -0.1631  0.7983  1.2593   +0.4611   -0.1293
1.40      0.3365   0.0780  1.9678  0.6638   -1.3040   +0.6103
2.00      0.6931   0.4347  2.4195  2.1698   -0.2496   +0.7338
4.00      1.3863   1.1279  2.5767  2.5478   -0.0289   +0.6985
```

A trade at/near the money reshapes the lensed curve-2 **strongly** (|dG| up to ~1.7 near the mode);
far OTM the same cash reshapes it **negligibly** (|dG|≈0.03 at 4×). So **an OTM-strike view and an
ATM-strike view of the same trade are reshaped differently** — the warp the operator sees is
genuinely strike-dependent. (Prior run's "strike-invariant per unit cash" described only the pool input,
not the observable, and mislabelled the architecture as blind.) The strike-dependence is **largest near
the mode and decays into the wings** — the opposite profile to the old (W) curve, where it grew toward
the wings and diverged.

## C.3 (item 3) Cap-free? — operator believes YES; VERIFIED YES, even under the lensed goal-seek

**No cap. Hard bound `|dG| ≤ γ` because `h′∈[0,1]`. The lens curvature does NOT re-introduce a blow-up,
because the architecture READS the lensed slope, it does not INVERT the lens to size the trade.
[analytic + numeric]**

- **Pool side** (`/tmp/lensX_3_cap.js`): mode shift `d(dy)` is finite and smooth for all finite `dy`;
  `d` grows like `ln` of the reserve ratio. The only boundary is ordinary Balancer reserve exhaustion
  (`x→α⁺` as you buy out X) — **not** a frozen-wing cap. There is **no `w(u)` field**, hence **no
  `1/w′(u)→∞` channel** that produced the old ~1.4× (W) cap.
- **Lens side — the honest hazard, and why it does not bite.** The lens slope `dG/du = γ·h″_τ(u)`,
  `h″=τ²/(τ²+u²)^{3/2}`, **→ 0 in the wings**. So its **inverse** `1/(dG/du)` DOES blow up far out
  (3.6e6 at u=8). **If** the architecture solved an *inverse-lens goal-seek* — "find the trade that makes
  the VIEWED slope at a wing strike hit a target" — it would divide by that vanishing slope and a cap
  would return. **It does not:** the trade is sized by cash `dy` (plain v24), and the lensed slope is a
  **readout**, never a solve. So `1/h″` never enters sizing. (Smallest counterexample, flagged: a naive
  build that re-sizes the trade to hit a target lensed wing-slope WOULD re-introduce a blow-up and a cap
  — see C.4.)
- **Observable warp magnitude** at K=1.1/1.4/2/4/8/20/100× for fixed cash is bounded everywhere by
  `|dG| ≤ γ` (since `h′∈[0,1]`); numerically `max|dG| = 1.304` at K=1.4× for the +10% trade. **No
  divergence, no cap forced.**

This **confirms the operator's "no cap" belief** and, importantly, confirms it survives the lensed
goal-seek (the explicit thing the brief asked to re-verify).

## C.4 (item 4) Well-posed — single-valued, round-trip exact, path-independent

**All three hold to float64; one honest caveat about the OBSERVABLE.** (`/tmp/lensX_4_wellposed.js`)
- round-trip (+dy then −dy): x/y/w error **0.0** (exact).
- path-independence (one big trade vs two halves): x/y error **0.0** (α,β are genuine flow invariants).
- single-valued: `G(u)=γ·h′(|u|)` is a pure function; the mode `=getMP(s)` is a deterministic function
  of state ⇒ the lensed view is single-valued.
- **CAVEAT (flag, not a defect):** the *observable* "lensed slope at a fixed strike" is single-valued as
  a function of `dy` but **NON-MONOTONE** (1 fold) — as the trade pushes the mode across the strike, the
  side-of-mode `|u|` branch turns the slope around. The state map `dy↦state` is bijective (v24); only the
  **readout** folds, and it folds exactly at the put/call crossing. This is the same side-of-mode
  structure as v24's `markFrac`. It means a build must **not** invert "observed lensed slope ↦ dy"
  (that is the multivalued, blow-up-prone inverse of C.3); it reads forward only.

## C.5 (item 5) Settlement through the lens with the v26b ATM-jump (smooth-paste) fix ported

**Closed-form S* PER STRIKE; the v26b fix ports EXACTLY (value+slope continuous to machine zero), even
in the flat-top band. [analytic + numeric]** (`/tmp/lensX_5_settle.js`)

v26b Reading-A with the strike-LOCAL exponent `g = g_loc(K) = γ·h′(|ln K|)` (constant per strike, lens
static): free boundary `sNorm* = θ·((g+1)/g)^g`, price multiple `S* = K·g/(g+1)`, `c = 1/((g+1)·sNorm*)`.
```
K       g_loc    sNorm*      S*=g/(g+1)  valGap     slopeGap
1.05    0.4232   1.670738    0.297359    1.1e-16    0.0
1.10    0.7983   1.912284    0.443906    1.1e-16    5.6e-17
1.40    1.9678   2.244713    0.663049    0.0        0.0
2.00    2.4195   2.309393    0.707557    5.6e-17    0.0
4.00    2.5767   2.327933    0.720414    5.6e-17    2.8e-17
```
Stays real/finite and pastes to machine zero even for `g<1` (tested g=0.4/0.7/0.99/1.0/1.5). The g<1
flat-top band is `|ln K| < τ/√(γ²−1) = 0.123` ⇒ K ∈ 0.884..1.131 (±13.1% at τ=0.3, γ=2.636); there the
analytic value law still evaluates but the **American early-exercise reading of S\*** degenerates — a
**settlement-semantics call (operator-tier, entry-85 "atm jump stuff at feature level")**, accepted by
the operator at entry 93 #5 ("idc, same geometric thing whatever it implies").

## C.6 (item 6) One-tx vertical-spread EXECUTION survives (pricing shortcut not required)

**Survives. [numeric]** (`/tmp/lensX_6_onetx.js`) A same-wing spread's two legs net to one cash flow;
by path-independence (C.4) two sequential `tradeUpdate`s equal one net `tradeUpdate` (x/y error 0.0). So
the spread executes as **ONE plain-v24 pool tx** carrying the net cash, strike-free at the pool. Per
entry 93 #4 the closed-form `θ*=√(θ₁θ₂)`,`2sinh` **PRICING** shortcut is **dropped** (it breaks under
per-leg lens exponents — prior (e)); the premium is priced **leg-by-leg through the lens** and summed.
Execution yes, closed-form pricing no — and the operator no longer requires the latter.

## C.7 (item 7) The two v24 known-gaps and how each is resolved in THIS architecture

1. **(i) ATM-jump settlement (v24 mark is a kinked European `min(s/θ,θ/s)`, slope-discontinuous at the
   strike).** Resolved by porting the **v26b smooth-pasting** free boundary with the strike-LOCAL
   exponent `g_loc(K)` (C.5): continuation runs **past** the strike to `S*=K·g_loc/(g_loc+1)`, value and
   slope continuous to machine zero — no ATM jump, per strike. Closed-form, no new params.
2. **(ii) The local-warp / anchoring gap (entry 85 "the local warp not happening thing"; v24 trades are
   a pure dot-slide on a FIXED pricing curve — the curve doesn't visibly reshape; v27's φ-warp was
   elbow-local and sub-pixel).** Resolved **structurally** by the lens: the object the operator SEES is
   the **lensed curve-2**, and per C.2 a trade reshapes it **strike-dependently** (|dG| up to ~1.7 near
   the mode for a 10% trade) — a visible, strike-aware warp that v24 never had, **without** a `w(u)`
   field and **without** the (W) divergence/cap. The "warp not happening" was an artifact of viewing the
   un-lensed curve; viewing through the lens makes it appear and be strike-dependent. (The build must
   draw curve-2 through the lens and read slopes via the side-of-mode `|u−u_mode|` branch — C.1/C.4.)

## C.8 CORRECTED per-item verdict table

| Item | Verdict | Correction vs prior pass / the bound |
|---|---|---|
| 1 trade-update + lensed goal-seek | **works** | Pool update = plain v24 (lens-free, reads only dy); goal-seek = "mode tracks marginal, lensed slope re-reads at shifted moneyness." Lens touches pool ONLY via fixed-notional dy sizing. |
| 2 strike-dependent or blind (observable) | **STRIKE-DEPENDENT** (corrected) | Prior run said strike-blind — that was the truncation. Pool INPUT is strike-blind; the LENSED curve-2 reshape `dG(K)` is strongly strike-dependent, largest near the mode, decaying into the wings. |
| 3 cap-free | **CAP-FREE (operator right)** | No `w(u)` ⇒ no `1/w′`; hard bound `|dG|≤γ`. Lens `1/h″` blow-up exists only for an INVERSE-lens solve, which the architecture does not do. Verified survives the lensed goal-seek. |
| 4 well-posed | **works** | round-trip 0.0, path-indep 0.0, single-valued. Caveat: observable lensed slope vs dy is non-monotone (mode-crossing fold) — read forward only, never invert. |
| 5 settlement + v26b ATM-jump port | **works-with-bound** | Closed-form `S*=K·g_loc/(g_loc+1)` per strike; smooth-paste to machine zero even g<1. Bound: g<1 flat-top band (±13.1%) American-exercise reading = operator-tier (accepted entry 93 #5). |
| 6 one-tx execution | **works** | Same-wing spread = one net plain-v24 pool tx (path-indep). Closed-form pricing dropped per entry 93 #4. |
| 7 the two v24 gaps | **both resolved** | (i) ATM-jump → v26b smooth-paste with g_loc; (ii) local-warp → lens makes the observable warp appear and be strike-dependent, no field/cap. |

**Strike-dependent vs blind (observable): STRIKE-DEPENDENT.**
**Cap needed: NO** — evidence: hard bound `|dG| ≤ γ` (h′∈[0,1]); no `1/w′` channel (no field); inverse-lens
`1/h″` hazard avoided by construction. Smallest counterexample to "no cap": only a naive build that
*inverts* the lens to hit a target wing-slope would re-introduce a blow-up — flagged so the build avoids it.

## C.9 ITEMIZED BUILD SCOPE — v24 + polar lens (ready for operator's final GO, entry 93 #6)

Build target = `engine/builds/temporal_mvp_v24_rebase_fixed_2.html`, surgical, lens added in the QUERY
layer. (Manager/intern execute; this is scope, not authorization.)

**Pool (UNCHANGED from v24 — do not touch):**
- `tradeUpdate` plain Balancer α/β conservation; w=α/x moves on trade; reads only dy.
- Remove the (W) w>½ clamp concept entirely — N/A here (entry 93 #3).

**Lens (NEW, query layer only — never touches the pool update):**
- L1. Static polar lens `h_τ(u)=√(τ²+u²)−τ`, `h′=u/√(τ²+u²)`; lensed local exponent
  `G(u)=γ·h′(|u−u_mode|)`, mode `u_mode = ln(live marginal)`. **Side-of-mode `|·|` branch mandatory**
  (matches v24 `markFrac`; without it the exponent goes negative across the mode — C.1/C.4).
- L2. τ = single static kurtosis knob, vol-set at deploy; no τ bound from no-arb (C.2 above), only the
  flat-top width calibration.
- L3. Draw **curve-2 through the lens** (so the warp is visible + strike-dependent — gap-fix ii).
- L4. **Read slopes forward only**; never invert "observed lensed slope ↦ dy" (C.4 fold + C.3 blow-up).

**Pricing / funding / settlement (lensed reads):**
- P1. Premium / mark priced **leg-by-leg through the lens** (`g_loc(K)`); no closed-form spread composite
  (dropped, entry 93 #4).
- P2. Funding = HEAD formula with `γ→g_loc(K)`; sign unchanged; scale→0 at ATM, →γ in wings (accepted,
  entry 93 #5).
- P3. **Settlement = v26b smooth-paste with the strike-local `g_loc`** — gap-fix (i): `S*=K·g_loc/(g_loc+1)`,
  continuation past strike, value+slope continuous (C.5).

**Two v24 gap-fixes (the operator's explicit build requirement, entry 93 #6):**
- G-i. ATM-jump settlement → P3 (smooth-paste, per strike).
- G-ii. Local-warp/anchoring → L3 (lensed curve-2 makes the trade's reshape visible + strike-dependent).

**Operator-tier flags to relay (NOT decided here):**
- Flat-top band g_loc<1 (±13.1% at τ=0.3): American-exercise reading of S* degenerates — accepted entry
  93 #5, but flag for the record.
- ATM funding→0 — accepted entry 93 #5, flag as an expected behavioural change vs constant-γ HEAD.
- τ calibration (flat-top width) — vol-set, operator/calibration call.

**Lean obligations:** none ready to pin. The lens is a static algebraic readout on a plain-Balancer pool;
items 1/4/6 inherit v24's α/β path-independence (already covered). Candidate-only (pin AFTER build
freeze): `g_loc(|u|)+g_loc′(|u|)>0` (forward-monotonicity on the correct-side branch) and smooth-paste
value+slope continuity at S* for the local exponent. Nothing submitted/built/edited/git this run.

_All numbers float64-checked; scripts `/tmp/lensX_{setup,1_goalseek,1b_feedback,2_strikedep,3_cap,4_wellposed,5_settle,6_onetx}.js`.
Self-adversarial: the strike-dependence (item 2) and the inverse-lens cap hazard (item 3/4) were hunted,
not glossed; the smallest counterexample to "no cap" is stated. Skeptic re-derives before this reaches
the operator as settled._

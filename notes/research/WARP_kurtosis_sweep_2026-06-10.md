# WARP kurtosis sweep — is there a τ where v27 warps like v24? (notes-only)

> ## ✅ MANAGER VERIFICATION (2026-06-10 — core verified; full-table skeptic check QUEUED)
> Verdict = **NO usable/design-valid τ matches v24's full warp.** I re-derived the two LOAD-BEARING
> claims myself (`/tmp/verify_sweep_core.py`) and they HOLD:
> 1. **Matching at v24's symmetric comfort point (w_mid=0.5) forces γ₋<1** for ANY Δw>0 (w_−=0.5−Δw/2<½
>    ⇒ γ₋=0.82/0.67/0.54 at Δw=0.1/0.2/0.3) — i.e. the match lives at the ordinary-CPMM point, NOT a
>    shippable options pool (violates the γ>1 lock).
> 2. **v27's warp leverage collapses in the wings** (frozen-wings design): field sensitivity
>    `w′(u)=(Δw/2)τ²/(τ²+u²)^{3/2}` gives wing/elbow leverage 0.0075 (τ=0.1) … 0.72 (τ=1.0) at u=0.5,
>    falling ~1/u³; v24's `w=α/x` shift is ~uniform (O(1)) at all rays. So the wings cannot match, and
>    extending v27's reach toward the wings requires τ→large = vanishing kurtosis (the τ→∞ degenerate
>    flat-Balancer limit the sweep found).
> **So the operator's polar-lens intuition is RIGHT at the elbow / to first order (shared cosh skeleton),
> but the frozen wings — the operator's own static-kurtosis design choice — structurally CAP the match to
> the elbow.** v24-magnitude warp everywhere ⟺ UNfreezing the wings ⟺ giving up the static kurtosis knob
> (curve/economic-object call, NOT a calibration knob). The research-lead's finer claims (elbow ceiling
> 0.9999 only at τ→∞/Δw→0; the sign-FLIP when Δw>τ/2 = a different/opposite deformation, not a match) are
> anchored to the skeptic-reconcile's verified baseline (reproduced 0.0003@1%/0.0318@10% exactly) but the
> **full sweep table is QUEUED for skeptic verification** (after the in-flight premise cross-verify) before
> being treated as settled.

_research-lead, 2026-06-10. Operator entry 26. NO engine edit, NO git, NO submit to Aristotle.
Manager re-derives + skeptic verifies before anything reaches the operator._

## Operator's conjecture (verbatim)
> "is there a kurtosis where this compares to v24's curve warp ; because of the natural polar lens
> view i'm assuming we've built our thing on, I personally think there should be settings where it
> works well, its too natural not to."

## Corrected baseline used (not the retracted headline)
Per skeptic reconcile `notes/skeptic/VERDICT_WARP_v24_vs_v27_RECONCILE_2026-06-10.md`:
- **v24 DOES warp.** Its rendered pricing curve `x^w·y^(1−w)=k`, `w=α/x` live, reshapes under a
  trade because the *scalar* weight `w` moves — this shifts the **whole** curve **uniformly** across
  every ray.
- **v27 warps too, but elbow-locally.** Its φ-recenter (`w(u;φ)=w_mid+(Δw/2)(u−φ)/√(τ²+(u−φ)²)`)
  is a bend concentrated at the elbow that **decays into the wings** (the price of frozen wings).
- At the matched setting (`w_mid=0.5, Δw=τ/2, τ=0.3`) the per-trade reshape ratio v27/v24 was
  **≈0.0003 @1% / 0.032 @10% at ray u=0.5** — v27 30×–1000× smaller.

## Method (apples-to-apples, the skeptic's corrected metric)
Each build's **actual rendered pricing curve**, same starting pool `(10,10)`, same trade, measure
the per-trade curve displacement `Δln(mp)` **ray-resolved** at a fixed price ray `u`. Functions
transcribed verbatim from engine source:
- v24: `tradeUpdate` L1617–1625, `getW=α/x` L1594, curve param L3100–3115.
- v27: `wField` L1633–1645, strong-form `tradeUpdate` L1719–1742, `curveTraceW` L3369–3401.
- Scripts `/tmp/warp_sweep_{1..5}.js` (Node float64). Sanity check reproduces the skeptic's reconcile
  numbers exactly (`/tmp/warp_sweep_1.js`: 0.0003 @1%/u=0.5, 0.0318 @10%/u=0.5 — match).

**Load-bearing structural fact (the whole answer turns on it):**
- v24 reshape `Δln(mp@u) = Δln(w/(1−w))` is **u-INDEPENDENT** — a uniform vertical shift of the
  entire curve. (The `+u` term cancels in the pre-vs-post difference; the only mover is the scalar
  `w`.)
- v27 reshape `Δln(w(u;φ)/(1−w(u;φ)))` is **u-DEPENDENT** and **decays as |u| grows** — by
  construction (frozen wings).
So the two are *different shapes* of reshape; "ratio" compares a curve-wide shift (v24) against a
localized bend (v27).

## The sweep table — ratio v27/v24 per ray, matched setting (w_mid=0.5, Δw=τ/2)

**1% trade** (`/tmp/warp_sweep_1.js`):

| τ | u=0 (elbow) | u=0.25 | u=0.5 | u=1 | u=2 (wing) |
|---|---|---|---|---|---|
| 0.02 | **0.9965** | 0.0018 | 0.0003 | ~0 | ~0 |
| 0.05 | 0.0890 | 0.0007 | 0.0001 | ~0 | ~0 |
| 0.10 | 0.0202 | 0.0010 | 0.0002 | ~0 | ~0 |
| 0.30 | 0.0022 | 0.0010 | 0.0003 | 0.0001 | ~0 |
| 1.00 | 0.0002 | 0.0002 | 0.0001 | 0.0001 | ~0 |
| 2.00 | ~0 | ~0 | ~0 | ~0 | ~0 |

**10% trade**:

| τ | u=0 | u=0.25 | u=0.5 | u=1 | u=2 |
|---|---|---|---|---|---|
| 0.02–0.10 | **REJECTED** (wing-range guard — see below) | | | | |
| 0.20 | 0.8638 | 0.1643 | 0.0422 | 0.0077 | 0.0012 |
| 0.30 | 0.2508 | 0.1039 | 0.0318 | 0.0058 | 0.0008 |
| 0.50 | 0.0705 | 0.0503 | 0.0253 | 0.0065 | 0.0011 |
| 1.00 | 0.0141 | 0.0131 | 0.0106 | 0.0057 | 0.0016 |
| 2.00 | 0.0014 | 0.0014 | 0.0013 | 0.0012 | 0.0010 |

**Reading:** at the matched curvature the **elbow (u=0)** ratio rises toward 1 only as `τ→0` — but
that's exactly where the wing-range guard rejects realistic trades (Δw=τ/2 shrinks the wing band to
nothing). At all **wings (u≥0.5)** the ratio stays ≤0.04 and falls off fast. There is **no matched
setting where v27 tracks v24 across rays** — it can approach v24 at the elbow only by sharpening τ,
and that simultaneously (a) kills admissible trade size and (b) does nothing for the wings.

## Decoupling Δw (operator allowed sweeping Δw, w_mid) — and the SIGN TRAP

The wing-range rejection is because Δw is tied to τ. Widening Δw opens the wing band and admits
bigger trades. But widening Δw past the matched value (≈0.095 here) **flips the sign of the elbow
reshape** (`/tmp/warp_sweep_2.js`, `/tmp/warp_sweep_3.js`):

| Δw (τ=0.3, 10% trade) | dw/du(0) | ratio@u=0 | @u=0.5 | @u=1 | @u=2 |
|---|---|---|---|---|---|
| 0.15 (=τ/2, matched) | 0.250 | **+0.251** | +0.032 | +0.006 | +0.001 |
| 0.30 | 0.500 | **−0.918** | −0.170 | −0.028 | −0.004 |
| 0.50 | 0.833 | −2.164 | −0.515 | −0.086 | −0.011 |
| 0.80 | 1.333 | −4.058 | −1.462 | −0.304 | −0.042 |
| 0.98 | 1.633 | −5.295 | −2.980 | −1.248 | −0.325 |

**Mechanism** (`/tmp/warp_sweep_3.js`): a sell at (10,10) moves v24's `w` UP (0.50→0.5455), shifting
the whole curve one way. In v27 the same sell moves φ — but the φ-recenter **overshoots and reverses
direction** once Δw is wide (at Δw=0.15, φ:0→−0.046; at Δw=0.30, φ:0→**+0.087**, opposite). So you
*can* get |ratio|>1 at the elbow by widening Δw, but **the curve then bends the OPPOSITE way to
v24** — a different deformation, not a match. The crossover into wrong-sign happens almost
immediately past the matched curvature.

**The ceiling, made precise** (`/tmp/warp_sweep_5.js`): scanning (τ, Δw, trade size) jointly and
constraining to **same-sign** (correct-direction) reshape, the **supremum of the elbow ratio is
0.9999** — and it is attained only at **τ=3, Δw=0.02** (essentially flat Balancer, dw/du(0)≈0.003).
The same-sign elbow warp **never reaches 1.0** and only approaches it as the curve **degenerates
toward flat ordinary Balancer — the τ→∞ limit where v27 IS v24 and the kurtosis knob is gone**
(`/tmp/warp_sweep_4.js`):

| τ (Δw=τ/2) | ratio@u=0, 1% | ratio@u=0, 0.1% |
|---|---|---|
| 0.30 | 0.0022 | ~0 |
| 1.00 | 0.0002 | ~0 |
| 2.00 | ~0 | ~0 |
| →∞ | →1 (flat Balancer) | →1 |

## Polar-lens framing (the operator's intuition, made exact)
In the hyperbolic-angle view (`√(τ²+u²)=τ·cosh η`, η=asinh(u/τ)): **skew = the angle SHIFT φ a trade
produces; kurtosis amplitude is set by Δw/τ.** v24's warp is a *uniform re-scaling of the whole fan*
(scalar w multiplies every ray's slope). v27's warp is a *localized re-aim of the fan center* (φ
shifts the elbow, wings pinned). The lens explains exactly **why** there is no match: a center-shift
(φ) and a uniform-scale (w) agree near the center to first order but **must diverge in the wings** —
the φ-shift has zero leverage out there (cosh η → e^|η|, the warp term saturates), while v24's scalar
w still bites every ray. The operator's instinct that "it's too natural not to work" is right *at the
elbow and to first order* — the structures share the cosh-of-own-angle skeleton — but the **frozen
wings are a deliberate design choice that caps the match at the elbow.** It is natural where it
matches; it cannot match where the wings are frozen, because that's what "frozen" means.

## Design-property check at the candidate match settings (`/tmp/warp_sweep_4.js`)
The elbow match needs `w_mid=0.5` (to match v24's symmetric balanced point) — but the shipped curve
requires **γ_±=w_±/(1−w_±)>1, i.e. both w_±>½** (CLAUDE.md lock). These are incompatible:

| setting | w_− | w_+ | γ_− | γ_+ | γ>1 lock | frozen wings (w shift @u=3 on 10% trade) |
|---|---|---|---|---|---|---|
| matched, τ=1 (Δw=0.5) | 0.250 | 0.750 | 0.333 | 3.000 | **VIOLATED** (γ_−<1) | 2e−5 (frozen ✓) |
| matched, τ=3 (Δw=1.5) | −0.250 | 1.250 | −0.20 | −5.0 | **w∉(0,1)** (broken) | OK ✓ |
| wide-Δw sign-flip, τ=0.3 | 0.350 | 0.650 | 0.538 | 1.857 | **VIOLATED** (γ_−<1) | 4e−5 (frozen ✓) |

- **Frozen wings:** YES at every setting (wing weight moves ~1e−5 on a 10% trade) — frozen enough.
- **γ_±>1:** **FAILS everywhere** the elbow comes close. The match is built on `w_mid=0.5`
  (ordinary-Balancer balanced point, γ_loc=1), which forces the put wing to `w_−<½` ⇒ `γ_−<1` (not a
  valid options curve), and at larger Δw/τ the weights leave (0,1) entirely. The v24-warp-match lives
  at the **ordinary-CPMM comfort point, not at a shippable γ>1 options pool.**
- **Kurtosis knob meaningful:** only the small-Δw/large-τ corner gets the same-sign ratio near 1 —
  and there the knob is **degenerate** (dw/du(0)→0, the curve is flat Balancer with no kurtosis).
- **Wing-cap admissible trade sizes:** the matched Δw=τ/2 setting **rejects a 10% trade for τ≤0.10**
  (wing-range guard; `wStar=0.5455` outside `[0.4875,0.5125]`). Sane trade sizes need Δw widened —
  which trips the sign trap.

## VERDICT (one line)
**NO — v27's per-trade warp ceilings below v24's at every realistic, design-valid setting.** The
correct-direction (same-sign) elbow warp never reaches v24's magnitude (sup ≈ 0.9999, attained only
in the degenerate flat-Balancer limit τ→∞, Δw→0, where the kurtosis knob vanishes); in the wings the
ratio stays ≤0.04 and decays because v27's wings are **frozen by design** while v24's scalar `w`
shifts every ray uniformly. You *can* force |elbow warp| > v24 by widening Δw, but only by **flipping
the sign** (the φ-recenter then bends the curve the opposite way — a different deformation, not a
match), and any setting that gets close violates the γ_±>1 lock (it sits at the ordinary-Balancer
`w_mid=0.5` comfort point, not a shippable options pool). The operator's polar-lens intuition is
correct **at the elbow and to first order** — the two warps share the cosh-of-own-angle skeleton —
but the frozen wings, which are the deliberate design choice that makes the kurtosis knob static and
the wing exponents trade-invariant, are exactly what cap the match to the elbow.

## What this means for the fork (flags for operator, via manager)
1. **The visible-warp gap is structural, not a bug, and not closable by τ.** If the operator wants
   v27's trades to visibly reshape the curve as much as v24's, the honest levers are: (a) the
   **anchor-overlay viz** (skeptic's recommendation — show the warp against a fixed reference; honest,
   reveals the true, smaller magnitude); or (b) accept a **localized elbow warp** that is genuinely
   smaller in the wings. There is no τ that makes v27 warp like v24 across the curve.
2. **Decision is operator-tier (curve/economic-object).** "Make the warp bigger" trades against the
   two design pillars: frozen wings (trade-invariant tail exponents) and γ_±>1 (valid options curve).
   v24's bigger warp comes precisely from *not* freezing the wings — it moves the whole curve,
   including the tails. Choosing v24-magnitude warp means giving up frozen-wing/static-kurtosis
   semantics. That is a curve/invariant call, not a calibration knob.
3. **Caveat carried forward:** all numbers are at the symmetric comfort pool (10,10), `w_mid=0.5`.
   A γ>1 options pool (w_±>½, asymmetric) was not the v24 comparison object the operator named; the
   sign/ceiling structure (uniform-scale vs localized-recenter, frozen wings cap the wings) is
   geometric and carries, but exact magnitudes at a shipped γ>1 pool are a separate sweep if wanted.

## Provenance
NO submit to Aristotle, NO engine/git touched, nothing built or trusted-from-prover. All numbers
float64, re-derived `/tmp/warp_sweep_{1..5}.js`; sanity-checked against the skeptic reconcile.
Manager re-derives, skeptic verifies, before the operator hears it.

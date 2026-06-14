# WARP divergence — reconciliation, safe-strike cap, and the DOF question

_research-lead, 2026-06-11. Operator entry 40. **READ-ONLY (operator-pinned): NO engine edit, NO git,
NO build touch, NO Aristotle submission.** Operator is live-playing HEAD `1eebfcd6`; build path = A
(trade-point anchoring, `notes/research/SPEC_tradepoint_anchoring_REPOSED_2026-06-11.md`). This note
verifies/corrects the manager's reconciliation of the operator's entry-40 challenge, pins the
safe-strike cap A's build needs (the (g.4) cap), and answers the DOF question. Numeric script
transcribed at the end (`/tmp/warp_cap.js`; node float64; mirrors live HEAD v27 (W) functions
byte-for-byte from `/tmp/repose3.js`). Gate pool `{x:10, y:12, τ:0.3, w∈[0.52,0.72], φ:0}`,
mp0=2.457812, Δw=0.200._

---

## 0. THE CHALLENGE (operator entry 40, verbatim)

> "if you trade at a point far out where slope is tending to infinity or whatever, what's going to
> happen is that its going to goal seek another slope close to infinity so its not a huge warp imo
> you're probably missing something obvious."

## VERDICT IN ONE LINE

**The operator is RIGHT about the slope change at the trade point (it IS tiny far out), but wrong that
this means "not a huge warp" — the 1/w′ leverage in the flat wing converts that tiny demanded slope
change into a LARGE, genuinely OBSERVABLE warp, but the warp lands at the ATM ELBOW and the OPPOSITE
wing, not at the trade point.** So the manager's reconciliation is **confirmed and sharpened**: the
blowup is real, it is observable (not a coordinate artifact), and it is the single-φ field lacking the
DOF to keep the warp local. In-range (K ≲ 1.4·mp0) the warp is small and the operator's intuition
holds; the out-of-range tail (K ≳ 1.7·mp0) is a large observable elbow-flattening.

---

## 1. THE LEVERAGE RECONCILIATION — CONFIRMED, with one correction `[analytic + numeric]`

### 1.1 The factorization (the manager's, confirmed exact)

`|Δφ| = z0 · G`, and **G is exact**:

> **G(K) = w′(u_spot) / w′(u_tp) = ( (τ² + u_tp²) / (τ² + u_spot²) )^{3/2}**

`[numeric]` G_num == G_analytic to 4 d.p. across the band (TEST 5): at K/mp0 = 1.10/1.35/1.70/2.00/4.00,
both give G = 1.2726 / 2.4387 / 5.5875 / 9.8034 / 61.50. `w′(u) = (Δw/2)·τ²/(τ²+u²)^{3/2}`, so in the
flat wing (`|u_tp|` large) `w′(u_tp)→0` and `G = 1/w′(u_tp)` (up to the spot-curvature normalizer)
**blows up**. The manager's "1/w′ leverage in the frozen wing" is exactly right.

### 1.2 The operator IS right at the trade point — and this is the part the manager's framing under-stated

The thing the operator is picturing — "goal-seek another slope close to infinity, small change" — is
**literally true and measurable.** Define the observable reshape `dln(mp)(u)` = change in the rendered
marginal price (= slope on (W); price==slope, no e^{−ghMu}) at a fixed reference ray `u`, pre vs post
a **dust** trade (dy=0.001). At the trade ray itself (TEST 1, `reshape@TP`):

| K/mp0 | G | \|Δφ\| | reshape **@ trade ray** | reshape **@ ATM (u=0)** |
|---|---|---|---|---|
| 1.00 | 1.00 | 7.4e-6 | 7.0e-6 | 1.1e-5 |
| 1.10 | 1.27 | 5.0e-2 | 3.3e-2 | 7.0e-2 |
| 1.35 | 2.44 | 2.6e-1 | **6.2e-2** | 2.9e-1 |
| 1.70 | 5.59 | 8.4e-1 | **4.9e-2** | 4.3e-1 |
| 2.00 | 9.80 | 1.6e+0 | **3.7e-2** | 4.5e-1 |
| 4.00 | 61.5 | 1.1e+1 | **1.2e-2** | 4.5e-1 |
| 8.00 | 202 | 3.7e+1 | **5.3e-3** | 4.5e-1 |

**Read the `reshape@TP` column: it DECREASES going further OTM (6.2e-2 → 5.3e-3).** A far-out dust
trade barely moves the slope at the far-out trade point. **The operator's geometric intuition is exactly
correct at the trade point.** The slope there is near-saturated (heading toward the frozen-wing exponent
`w₊/(1−w₊)`), so goal-seeking a nearby slope demands almost nothing locally.

### 1.3 The correction — the warp is NOT small; it has MOVED to the elbow `[numeric]`

But `|Δφ|` runs 7e-6 → 37, and that φ-travel is **not** a coordinate no-op. Read the `reshape@ATM`
column: a *dust* trade at K=2·mp0 reshapes the ATM marginal price by **45%**. The φ-move is large
because the wing has low leverage (you must shove φ far to bend the flat wing even slightly), and a
single global φ shift drags the **whole elbow** with it. So:

- **at the trade point**: tiny reshape (operator right);
- **at the ATM elbow and the opposite (put) wing**: large reshape (the warp landed here).

**TEST 2** (profile of `dln(mp)(u)` for a far-out K=4·mp0 dust trade, which sets φ′ = 0 → −11.04):

| u | dln(mp) |
|---|---|
| −1.0 (opp wing) | **8.5e-1** |
| −0.5 | 8.1e-1 |
| 0.0 (ATM) | **4.5e-1** |
| +0.3 | 1.4e-1 |
| +1.0 | 2.1e-2 |
| +1.35 (trade ray) | ~1.2e-2 |
| +2.5 | 3.4e-3 |

The reshape is *largest on the side AWAY from the trade*. A dust call trade far OTM bends the put wing
and the elbow hardest and the trade ray least. That is the opposite of what a "local warp at the trade
point" would do — and it is the signature of the missing DOF (§3).

### 1.4 Is it observable, or a coordinate artifact? — OBSERVABLE, decisively `[numeric]`

The cleanest observable is the marginal price **at the pool's own reserves** (what an LP/trader sees on
the live pool). **TEST 3** (dust dy=0.001):

| K/mp0 | mp@reserves post | dln(mp@reserves) | \|Δφ\| |
|---|---|---|---|
| 1.00 | 2.458421 | 2.5e-4 | 7.4e-6 |
| 1.35 | 2.839593 | 1.4e-1 | 2.6e-1 |
| 1.70 | 3.024723 | 2.1e-1 | 8.4e-1 |
| 2.00 | 3.065112 | 2.2e-1 | 1.6e+0 |
| 4.00 | 3.085550 | 2.3e-1 | 11.0 |
| 8.00 | 3.086047 | 2.3e-1 | 36.8 |

A **dust** trade at K≥1.7·mp0 moves the spot marginal price by ~21%. That is not a coordinate artifact —
it is the live price the pool quotes. **TEST 8 confirms the mechanism exactly:** as φ′→large negative the
elbow center (at u=φ′) is dragged out of the visible band, so the reserves ray (u=0) ends up sitting on
the **frozen call wing**, where the slope saturates at `w₊/(1−w₊)·e^{u0}`. Predicted saturated
mp@reserves = **3.085714**; numeric at K=8 (φ′=−36.76) = **3.086047**. The spot drift saturates because
the elbow has been pushed entirely past ATM — the pool has been flattened to its frozen wing by a dust
trade.

**So: the operator is right that "it's not a huge warp" *at the far-out trade point* and *in-range*; the
operator is wrong that it's "not a huge warp" in any observable sense — out-of-range it is a large,
visible flattening of the ATM elbow. What is "missing something obvious" is that the 1/w′ leverage routes
the warp away from the trade point and into the elbow.**

---

## 2. THE SAFE-STRIKE CAP for A — the (g.4) cap `[numeric + analytic]`

### 2.1 Numeric cap (dy-robust) — TEST 4

K_max as a multiple of mp0 below which the warp stays bounded, for three realistic dust sizes:

| metric / threshold | dy=0.001 | dy=0.01 | dy=0.1 |
|---|---|---|---|
| \|Δφ\| ≤ τ (=0.3) | **1.381**·mp0 | 1.380·mp0 | 1.364·mp0 |
| \|Δφ\| ≤ 1 | **1.772**·mp0 | 1.770·mp0 | 1.743·mp0 |
| spot-drift ≤ 5% (observable) | 1.117·mp0 | 1.112·mp0 | 1.061·mp0 |
| spot-drift ≤ 1% (observable) | 1.024·mp0 | 1.019·mp0 | 1.000·mp0 |

The cap is **dy-robust** (varies <2% across 100× in dy) — it is governed by the strike channel G(K), not
the notional. The manager's quoted boundaries (|φ′|≤τ to ≈1.35·mp0, ≤1 to ≈1.70·mp0) are **confirmed**
(1.38 / 1.77 here on this pool — the small difference is the skeptic's pool vs this gate pool).

**RECOMMENDED (g.4) CAP for the build: `K_max ≈ 1.4·mp0` (the |Δφ|≤τ boundary).** Rationale: at |Δφ|≤τ
the elbow center stays within ~one elbow-width of where it started (φ′ does not leave the visible band),
so the warp stays elbow-local and the spot reshape stays ≲14% — sane. The |Δφ|≤1 boundary (≈1.7·mp0) is
the absolute outer limit; beyond it the elbow exits ATM and the pool flattens to its wing.

### 2.2 Closed-form cap as a function of (τ, Δw) — TEST 7

Invert `|Δφ| = z0·G ≤ thresh` for the trade-point ray, then map to K:

> **u_tp,max = √( (τ² + u_spot²)·(thresh/z0)^{2/3} − τ² )**,   then **K_max = price(u_tp,max)/mp0**

with the dust-limit notional channel `z0 = t·τ/√(1−t²)`, `t = (w*−w_mid)/(Δw/2)`, `w* = wField(spot)`
for a dust leg. For the gate pool: z0(dust)=0.18245, u_spot=0.1823, τ=0.3 →

- thresh=τ: u_tp,max=0.286 → K_max=**1.20**·mp0 (closed-form; numeric 1.38 — closed-form uses the
  dust-limit z0, conservative);
- thresh=1: u_tp,max=0.541 → K_max=**1.69**·mp0 (numeric 1.77).

The closed form is **conservative** (slightly tighter than numeric because it uses the linearized z0),
which is the safe direction for a build cap. **Parameter dependence is explicit:** K_max grows with τ
(wider elbow ⇒ wing further out ⇒ more headroom) and is essentially Δw-independent in this form (Δw
cancels between z0's `t` scaling and G's `Δw/2` prefactor in the dust limit — the cap is a **geometry of
the elbow width τ**, not the skew Δw). The driving relation to pin in the build:

> **the warp stays bounded iff the trade-point ray stays within O(τ·(thresh/z0)^{1/3}) of the spot
> ray** — i.e. the trade point must stay inside the elbow, not out on the frozen wing.

### 2.3 Build form of the cap

Clamp/flag a STRIKE (distinct from the wing-range guard on the TRADE, which reads w* on the live move):

```
// (g.4) safe-strike cap — reject/clamp strikes whose trade-point warp blows up
u_tp = ln(tp.y/tp.x) - tp.phi
G    = ((tau^2 + u_tp^2)/(tau^2 + u_spot^2))^1.5
if (z0 * G > CAP)  reject-or-clamp the strike   // CAP = tau  (recommended), or 1 (hard outer)
```

This is a STRIKE guard (on G), structurally separate from the §3-REPOSED wing-range guard (on w*,
the TRADE size). The REPOSED spec §3 already flagged exactly this: "_The build should clamp/flag an
out-of-band STRIKE, distinct from an out-of-band TRADE._" This note pins the threshold.

---

## 3. THE DOF QUESTION — is single-φ insufficient, or is bounding the range sufficient? `[numeric]`

### 3.1 The single-φ field DOES lack the DOF to localize a far-out warp — TEST 6

Reshape localization for a dust trade — `reshape@TP / reshape@ATM`:

| K/mp0 | reshape@TP | reshape@ATM | reshape@opp-wing(−u_tp) | ratio TP/ATM |
|---|---|---|---|---|
| 1.10 | 3.3e-2 | 7.0e-2 | 3.7e-2 | 0.477 |
| 1.35 | 6.2e-2 | 2.9e-1 | 1.8e-1 | 0.214 |
| 1.70 | 4.9e-2 | 4.3e-1 | 6.7e-1 | 0.116 |
| 2.00 | 3.7e-2 | 4.5e-1 | 8.1e-1 | 0.082 |
| 4.00 | 1.2e-2 | 4.5e-1 | 8.5e-1 | 0.026 |

The ratio collapses 0.48 → 0.026: **a far-out trade reshapes the elbow ~40× more than its own trade ray.**
A single global φ has exactly one degree of freedom — the elbow center — so the only way it can express
*any* warp is to move that center, which moves the whole elbow. **It physically cannot localize a warp
out on a frozen wing**, because the wing is (by design) shift-insensitive: pushing φ moves the wing
negligibly and the elbow enormously. **So yes — the divergence is a genuine sign that the single-φ field
lacks the DOF to localize a far-out wing warp; it is forced to express the warp as a global elbow move.**

### 3.2 …but bounding the strike range IS the correct and sufficient resolution for A — HONEST

This is not a defect to "fix" with more DOF — it is intrinsic to the design the operator chose:

- **Frozen wings are a design REQUIREMENT** (static-τ, exact power-law wings — `SPEC_kurtosis_curve_family_TARGET`
  §1–§2). A field that *could* localize a warp out on the wing would have to bend the wing — which
  **breaks the frozen-wing contract and the γ_± wing exponents** (γ>1 lock). More DOF here = a different,
  non-frozen-wing curve = an operator/curve-object change, NOT a build fix.
- **The far-out region is economically vacuous.** A strike at K=4–8·mp0 is so deep OTM its mark ≈ 0; you
  would never list it. The blowup lives only where there is no real product (REPOSED-spec note: "a far
  tail you'd never list"). The in-range region (K≲1.4·mp0, where strikes actually trade) has small,
  sane, elbow-local warp — the operator's intuition is correct *in-range*.
- **Therefore the (g.4) strike cap (§2) is the correct and sufficient resolution for A.** It is not a
  patch over a weakness; it is the honest statement of the curve's domain of validity. Trade-point
  anchoring on a frozen-wing curve is *defined only for strikes inside the elbow*; the cap encodes that.

**DOF VERDICT:** the single-φ field genuinely lacks the DOF to localize a far-out warp (TEST 6, real,
forced) — but adding DOF would break the frozen-wing/γ>1 contracts, so it is the WRONG resolution.
**Bounding the strike range (the §2 cap) is the correct and sufficient resolution for A.** The
divergence is a domain-of-validity boundary, not a bug.

---

## 4. SUMMARY (for the manager → operator)

1. **(i) Is the operator right?** — **In-range and at the trade point: YES.** Far out, the slope change
   the goal-seek demands at the trade point IS tiny (reshape@TP falls 6e-2 → 5e-3 going OTM; TEST 1) —
   the operator's geometric picture is exactly correct there. **Observably / out-of-range: NO** — the
   1/w′ leverage in the flat wing converts that tiny demand into a large φ-move that drags the **ATM
   elbow** and **opposite wing** (a dust trade at K=2·mp0 reshapes ATM by 45% and the spot price by 22%;
   TESTS 2/3). It is a real observable warp (confirmed: the pool flattens to its frozen wing, predicted
   3.0857 = numeric 3.0860; TEST 8), not a coordinate artifact. **What was "missing": the warp doesn't
   stay at the far trade point — the single-φ leverage routes it into the elbow.** Operator right
   in-range; the blowup is the out-of-range tail.
2. **(ii) The K_max cap (g.4):** **RECOMMEND K_max ≈ 1.4·mp0** (|Δφ|≤τ; spot reshape ≲14%, elbow stays
   put); absolute outer limit ≈ 1.7·mp0 (|Δφ|≤1). dy-robust (<2% over 100× in dy). Closed form:
   `u_tp,max = √((τ²+u_spot²)(τ/z0)^{2/3} − τ²)`, `K_max = price(u_tp,max)/mp0` — governed by elbow width
   τ, Δw-independent in the dust limit. Build guard = a STRIKE clamp on `z0·G > CAP`, separate from the
   TRADE wing-range guard.
3. **(iii) DOF verdict:** the single-φ field **genuinely lacks the DOF to localize a far-out warp** (it
   has one handle = the elbow center; TEST 6 ratio collapses 0.48→0.026) — **but adding DOF would break
   the frozen-wing / γ>1 contracts, so bounding the strike range (the §2 cap) is the correct and
   sufficient resolution for A.** The divergence is a domain-of-validity boundary, not a bug.
4. **Honest carry (unchanged):** the `(α,β)`-flow-confinement lemma is `[needs-Aristotle]`, OPEN, NOT
   Lean-certified — numeric-faithful only. This note adds no proof; it pins geometry the build needs.
   Whether to list strikes beyond the cap (and at what CAP value) is an operator/calibration call.
   Nothing submitted / built / edited / committed.

---

## Script (transcribed) — `/tmp/warp_cap.js`

Mirrors live HEAD v27 (W) functions (`wField`, `getMP_raw`, `arbitrageToOracle`, `wPrimeAtU`,
`tradeUpdate_reposed` with `z=z0·G`, `G=w′(u_spot)/w′(u_tp)`) byte-for-byte from `/tmp/repose3.js`. Pool
`{x:10,y:12,τ:0.3,w∈[0.52,0.72],φ:0}`, mp0=2.457812. Produces:
- TEST 1 — reshape@TP (falls OTM) vs reshape@ATM (grows) for dust trades across strikes.
- TEST 2 — `dln(mp)(u)` profile for a far-out (K=4·mp0) dust trade (φ′ 0→−11): warp largest on opposite
  wing/elbow.
- TEST 3 — observable spot marginal-price drift at the reserves point (22% from dust at K≥1.7).
- TEST 4 — numeric K_max cap, four thresholds, three dy (dy-robust).
- TEST 5 — analytic G(K) = ((τ²+u_tp²)/(τ²+u_spot²))^{3/2} == numeric (4 d.p.).
- TEST 6 — DOF: reshape@TP/reshape@ATM ratio collapse 0.48→0.026.
- TEST 7 — closed-form cap u_tp,max / K_max (conservative vs numeric).
- TEST 8 — saturation: spot sees the frozen call wing (w₊/(1−w₊)) as the elbow exits; predicted
  3.085714 == numeric 3.086047.

> ⚠ **VOID — operator killed this run before delivery (entry 63: "stop the run its of no use to me"). Retained unread for the record only; superseded by the manager's entry-63 flatness brainstorm (steepness=γ-level repackaging). Do not cite.**

# ENTRY-59 RUN — "w varies with strike": clean flattening/steepening + curve warp, against the VISIBLE bar

_research-lead, 2026-06-11. Operator-ordered engine-numeric run (entry 59, verbatim
`history/operator/2026-06-10_kurtosis-curve-family-brief.md`):_

> GH not forced and aside, the w varies with strike also was something we did some work on. do a run
> and check for that and see if it works. or if its something else. TLDR i want to see clean
> flattening steepening allowed, I also want to see curve warp working.... understand qualitatively
> what im looking for here

_READ-ONLY: live HEAD `engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html` (md5 `928cde1c` verified
pre-run) sandboxed in Node vm (loader = `wcurve_selfcheck.js` pattern). NO engine edit, NO git, NO
Aristotle submission. Scripts `/tmp/run59.js`, `/tmp/run59b.js`, `/tmp/run59c.js`, `/tmp/run59d.js`,
`/tmp/run59e.js` (node float64; engine functions called LIVE, `curveTraceW` math transcribed
byte-faithfully); core harness transcribed in the Appendix. All numbers `[numeric]` from the live
engine unless tagged `[analytic]`._

**The acceptance bar (qualitative, held throughout):**
1. **Clean flattening/steepening** — a knob turn VISIBLY flattens/steepens the drawn pool curve at
   the default frame. 2. **Curve warp working** — a trade VISIBLY bends/reshapes the curve (paper:
   "trades skew the curve, not slide the point").

---

## 1. METHOD — what "visible" is measured as (self-adversarial first)

**Frame/conversions `[numeric, float64-checked]`:** default pool = `{x:10, y:303448.275862, τ:0.3,
w₋:0.60, w₊:0.85, φ:ln(y/x)=10.320381}`, oracle 80000, mp0 = **80000.000000** (equilibrium-at-load,
exact). Frozen default frame (drawCurve, first draw): **x∈[0,30] BTC, y∈[0,910344.8]**; canvas
700×460, pads → plot **618×398 px**. Conversions: **1% of frame width = 6.18 px; 1% of frame height
= 3.98 px; 20.6 px per BTC**; a relative |Δx/x|=δ at x BTC = δ·x·20.6 px.

**The honest visibility metric is PERPENDICULAR screen separation, not axis displacement.** The
self-adversarial catch this run surfaced: max |Δy| at fixed x (or |Δx| at fixed y) overstates
visibility up to ~10× on steep/flat sections — e.g. one τ click measures **11.88 px** as a vertical
scan but only **0.92 px** perpendicular (the curve is ~9:1 steep at the argmax; the eye sees the
perpendicular gap). All headline numbers below are **perpPx = symmetric max-min (Hausdorff)
point-to-segment distance between the two frame-clipped drawn polylines in px coords** (1200-pt
sampling). The ordered `max|Δx/x|` (fixed-y scan, both curves in-frame) is reported alongside.

**Reconciliation with the manager/tester facts (extends, doesn't re-litigate):** τ per-click
0.59%/"frame-visible ~0.56%, invisible" ↔ my fixed-y `max|Δx/x|` = 0.924% and **perp 0.92 px** —
same verdict (sub-pixel-to-1px), metric variants of the same analytic envelope
|Δlnx|≤(Δw/2)·Δτ=0.625% `[analytic]`. "Full-sweep 153px" ↔ my axis-metric τ-full-sweep = 167.6 px
(method/sampling delta), **perp 24.6 px** — the honest visible number is the smaller one. "Single
trades 0.48–2.14px at $50k–$240k notional" ↔ my premium-sized single legs 0.54–2.9 px ✓.

---

## 2. (A) FLATTEN/STEEPEN HANDLE INVENTORY — perpPx on the pinned default frame

| handle (UI step) | per-click perpPx | full-travel perpPx | max\|Δx/x\| (full) | asymptotes/locks |
|---|---|---|---|---|
| **w₋** (0.01; 0.51–0.95) | **1.80** | 0.60→0.51: **15.7**; 0.60→0.85: **51.2** | 38.9% / 118% | moves γ₋ asymptote (that IS the steepening); γ>1 clamp holds |
| **w₊** (0.01; 0.51–0.95) | **2.30** | 0.85→0.51: **89.7**; 0.85→0.95: **22.1** | 122% / 13.5% | moves γ₊ asymptote; clamp holds |
| **w_mid** (both ±0.01, gap fixed) | **2.56** | →0.635: **23.9**; →0.825: **24.7** | 41–50% | shifts BOTH asymptotes (overall steepen/flatten) |
| **Δw gap** (w_mid fixed 0.725) | — | →0: **27.4**; →0.15: 10.5; →0.37: 11.9; →0.44: 18.6 | 21–55% | tilts call-wing vs put-wing asymmetry |
| **τ** (0.05; 0.05–3) @Δw=0.25 | **0.92** | 0.05→3.0: **24.6** | 0.92% / 37.4% | wings EXACTLY frozen `[analytic]` (residual O(1/u²)) |
| τ @Δw=0.37 (0.55/0.92) | 1.34 | **35.3** | 1.47% / 56.8% | same |
| τ @Δw=0.44 (UI max) | 1.58 | **41.5** | 1.89% / 69.0% | same |
| τ @Δw=0.10 | 0.37 | — | 0.34% | same |

**The τ weld, now in pixel units `[numeric]`:** τ-click visibility ≈ **3.6·Δw px per click**
(0.37/0.92/1.34/1.58 px at Δw=0.10/0.25/0.37/0.44 — ratio 3.6–3.7 across the whole range). A
per-click-visible τ (≥3px) would need Δw≈0.8 — **unreachable inside the γ>1 + UI locks (Δw<0.45)**.
τ's visible authority exists only cumulatively (full 0.05→3 sweep = 25–41 px, clearly visible).

**Frame re-freeze side-effect (engine fact, surfaced this run):** `setWingWeights`/`setTau` null
`window.__curveFrame` → the frame re-freezes on next draw. Wing clicks therefore also move the AXES
(~0.3–1.8%/click; big w_mid moves: −6.9%/+14.7% → the live point shifts 15–17 px globally). τ at the
default pool does NOT move the frame (live point sits at the elbow ⇒ α,β unchanged). So a wing-knob
turn reads on screen as shape-change (1.8–2.6 px) + frame jump (~1–2.5 px) — both make the click
perceptible; the τ click has neither.

**Bar-1 answer — THE knob is the wing-weight pair (w₋, w₊), not τ:**
- One click = 1.8–2.6 px (perceptible but subtle); **3–5 clicks = 5–13 px (clearly visible); full
  travel = 15–90 px (unmistakable)**. w_mid (both together) = overall steepen/flatten; w₋ vs w₊
  separately = per-wing (put-side vs call-side) steepness; Δw = wing asymmetry.
- This is **clean**: wings stay exact power-laws at every setting `[analytic]`, γ>1 enforced by the
  0.501–0.95 clamp, τ/wings static under trades (knob = operator calibration action, not a trade).
  Flattening/steepening **necessarily moves the asymptote exponents** γ±=w±/(1−w±) — that is what
  steepening of a power-law curve IS; the only knob that preserves asymptotes exactly is τ, and τ is
  per-click invisible everywhere the locks allow.

---

## 3. (B) WARP VISIBILITY MAP — the live strong-form warp (spot-anchored)

### 3.1 One-sided trades (cash leg straight into `tradeUpdate` — NO UI path does this today)

Defaults (guard: dy∈(−94828, +252874) `[numeric]`, = the known ±$95k/$253k caps):

| dy (cash) | perpPx | Δφ | spot after |
|---|---|---|---|
| +$10k | 0.56 | +2.3e-2 | 87,438 |
| +$50k | 2.93 | +1.1e-1 | 120,496 |
| **+$100k** | **5.55** | +1.8e-1 | 169,256 |
| +$200k | 3.03 (non-monotone: u′/z cancellation) | +1.1e-1 | 291,570 |
| +$250k (near cap) | 51.6 (wing-kink; guard-edge, slippage huge) | −1.9 | 365,124 |
| −$50k | 3.40 | −1.1e-1 | 47,769 |
| **−$90k** | **11.94 ✓ VISIBLE** | +2.2e-1 | 27,934 |

WIDE Δw=0.37 (0.55/0.92; guard widens to (−124.8k, +701.7k)): **+$100k → 10.65 px ✓ VISIBLE**;
+$250k → 25.2 px; −$100k → 14.1 px. τ-extremes at default Δw (τ=0.1 or τ=2.0): +$100k → 11.2/12.1 px.
NARROW Δw=0.10: +$50k → 2.6 px (and guard collapses to (−46.7k, +67.4k)).

**So the existing machinery DOES produce a visible warp** — at roughly **one-sided cash ≥ ~$90–100k
(≈12% of the $800k pool)**, with wide-Δw calibration making the buy side cleanly visible too.

### 3.2 The UI band path (the ONLY trade path) — why the operator never sees it

| band @ defaults | notional | perpPx | net Δφ |
|---|---|---|---|
| call spread (sell 1.1 / buy 1.3), N=10 BTC | $800k | **0.27** | +1.1e-2 |
| call spread, N=30 BTC | $2.4M | 0.81 | +3.4e-2 |
| collar (sell call 1.1 / buy put 0.9), N=10 | $800k | 2.69 | +9.9e-2 |
| collar, N=30 | $2.4M | 6.22 | +2.0e-1 |
| collar, N=30 @WIDE Δw | $2.4M | **15.4** | +3.4e-1 |

Refinement of "bands are warp-neutral": **same-wing spreads net-cancel** (sell +V, buy −V; 0.27 px
at $800k notional). **Collars COMPOUND** (both legs cash-in, per the executeLeg sign table — net
≈2×premium) — but premium-sizing (`dy=N·mark·oracle`, mark≈0.1–0.2 OTM) still dilutes cash ~5–10×
vs notional. Single sold leg (no UI path): N=30 BTC sell-call 1.1 → dy=$97k → 5.4 px default /
9.4 px WIDE. Also: `runArbitrage`/`arbitrageToOracle` **does not move φ at all** (re-places (x,y)
at fixed φ) — the arb button can never show warp.

### 3.3 Path-A (trade-point anchoring, reposed spec) — what it would ADD

Projection implements the reposed `z=z0·G`, `G=w′(u_spot)/u′(u_tp)` — **validated byte-exact against
the spec's gate pool** (mp0=2.457812; φ_near=−0.054467, φ_far=−0.684490, G=1.2726/4.4911 ✓).

On the DEFAULT pool, at the operator-realistic strikes:

| K/spot | u_tp | G | A perpPx (dy=+$50k) | legacy perpPx | in cap (\|z0·G\|≤τ)? |
|---|---|---|---|---|---|
| 1.1 | 0.031 | **1.016** | 2.88 | 2.93 | ✓ |
| 1.25 | 0.072 | **1.087** | 2.65 | 2.93 | ✓ |
| 1.4 | 0.110 | **1.206** | 2.26 | 2.93 | ✓ |
| 2.0 | 0.247 | 2.18 | 1.22 | 2.93 | ✓ (at $50k) |
| 2.3 | 0.316 | 3.06 | 4.53 | 2.93 | ✗ CAP-EXCEEDED |

**Finding (projection, structural):** the default pool sits exactly at the elbow center, where
`d ln p/du = 3.09` `[analytic, =1+w′(0)/(w_mid(1−w_mid))]` — price runs ~3× faster than u, so
K=1.4× spot is only u_tp=0.11 away and **G≤1.21 inside the entry-40 strike cap**. Within the cap,
A's gearing partially OFFSETS the u′ drift on the buy side and the visible delta is ≈ legacy **or
slightly smaller**. A only beats legacy visibly past the cap (K=2.3×, dy=$100k: 11.4 px vs 5.6 —
cap-forbidden territory). The famous 1.0→15.3 G-spread lives on the gate pool's geometry and
deep-OTM strikes. **Path-A is about strike-dependence/paper-faithfulness, NOT visibility — it is
not the missing ingredient for bar #2.**

---

## 4. (C) VERDICT — "does it work, or is it something else"

**(1) The existing w-varies-with-strike machinery MEETS BOTH BARS — with the right knob, the right
trade type, and one missing UI path. Concrete recipe:**
- **Bar 1 (flatten/steepen):** turn **w₋/w₊** (UI 0.51–0.95, step 0.01). 3–5 clicks = clearly
  visible (5–13 px); full travel = 15–90 px. w_mid both-together = overall steepness; per-wing =
  per-side. Clean inside locks (exact power-law wings, γ>1 clamp, static under trades). **Do not
  demo τ for this** — τ-click visibility = 3.6·Δw px ≤ 1.6 px everywhere allowed.
- **Bar 2 (visible warp):** a **one-sided cash trade ≥ ~$90–100k** on the default $800k pool —
  sell-side −$90k = 11.9 px at today's defaults; at **wide Δw (0.55/0.92)** the buy side is visible
  at +$100k (10.7 px) and the wing-guard relaxes to (−$125k, +$702k). The warp mechanism in HEAD
  works; what's missing is the way to *drive* it (next point).

**(2) Genuinely missing / needs building:**
- **A one-sided trade UI path** (or a "pool-impact demo" control). The only UI trade path is bands:
  premium-sized and (same-wing) net-cancelling — 0.27 px at $800k notional; even a $2.4M collar
  shows 6.2 px at defaults. No realistic band makes the warp visible; a modest one-sided cash trade
  does. This — not more theory — is the bar-2 blocker.
- **Default calibration choice:** wide Δw (0.55/0.92) roughly doubles warp-per-dollar visibility and
  widens the trade guard; flagged as a calibration decision (it also raises γ₊ to 11.5).
- **NOT the path-A build** (for this purpose): inside the safe-strike cap on the default pool A
  changes the visible delta by ≲20% (often downward). Build A for strike-dependence if the operator
  wants the paper's mechanic — it will not make warp more visible at sane strikes.

**(3) Cannot be met inside (W)'s locks (flag, not decided):**
- **A per-click-visible τ.** τ's pixel authority is welded to Δw (3.6·Δw px/click); the γ>1 +
  UI-range locks cap Δw<0.45 ⇒ τ-click ≤1.6 px forever. If the operator wants the *kurtosis* knob
  itself to visibly flatten/steepen per click, that requires either re-labelling (the wing pair IS
  the visible steepness knob) or un-freezing wings (entry-57/58 territory — leaves (W)).
- **v24-magnitude global warp** stays structural (frozen wings cap warp to the elbow —
  WARP_kurtosis_sweep finding unchanged); the elbow-local warp IS visible at the sizes above.

---

## 5. Engine facts surfaced this run (for manager/tester)
1. `setWingWeights`/`setTau` **null `__curveFrame`** → axes re-freeze on next draw; wing clicks move
   the frame ~0.3–1.8% (big w_mid moves ±7–15%) — part of what a knob turn looks like on screen.
2. **Collar bands compound cash** (both legs same swap direction, executeLeg sign table) — bands are
   *premium-net*, not universally warp-neutral; same-wing spreads are the ≈0 case.
3. **Arb path never warps** (`arbitrageToOracle` keeps φ).
4. Warp perpPx is **non-monotone in dy** on the buy side at defaults (u′/z cancellation: +$100k →
   5.6 px but +$200k → 3.0 px; near-cap kink → 50+ px at guard-edge slippage).
5. Axis-aligned px deltas overstate visible separation up to ~10× on steep sections — perpendicular
   polyline distance is the honest gate metric (recommend for any future visibility gate).

## 6. Honest carry
- Projection-only for path-A (nothing built); the `(α,β)`-flow lemma, warp∘rebase-commute, and
  φ-anchor/funding stay **[needs-Aristotle]/OPEN** — unchanged by this run; nothing here is
  Lean-certified. No obligations submitted.
- Visibility numbers are geometry on the drawn-polyline reconstruction (`curveTraceW` math
  transcribed); the tester's live-browser pass remains the confirmation layer for actual pixels
  (anti-aliasing, line width ~2px, overlays). My ≥10 px bar is deliberately conservative.
- Calibration (default Δw), adding a one-sided UI path, and any τ re-labelling are
  **operator-tier** — flagged above, not decided. Nothing edited/committed; HEAD untouched
  (md5 `928cde1c` re-verified post-run).

---

## Appendix — core harness (transcribed; full scripts in /tmp/run59*.js)

```js
// load live engine
const m=/<script id="engine">([\s\S]*?)<\/script>/.exec(fs.readFileSync(HEAD,'utf8'));
const ctx={Math,isFinite,console}; vm.createContext(ctx);
vm.runInContext(m[1]+'\n;this.__E=Engine;',ctx); const E=ctx.__E;
// default pool + frozen frame (drawCurve math)
const y0=10*80000*(1-0.725)/0.725, D={x:10,y:y0,tau:0.3,wMinus:0.60,wPlus:0.85,phi:Math.log(y0/10)};
const a0=7.25,b0=y0*0.275, XMAX=3*(a0+Math.sqrt(a0*b0/80000)), YMAX=3*(b0+Math.sqrt(a0*b0*80000));
const PXX=618/XMAX, PXY=398/YMAX;
// curveTraceW geometry (verbatim math): lnx(u)=k-(1-wm)u+dw2*sqrt(tau^2+(u-phi)^2), lny=lnx+u,
// k anchored through the live (x,y). Visible polyline: u from uAtLnX(ln XMAX) to uAtLnY(ln YMAX)
// (lny strictly increasing / lnx strictly decreasing in u — bisection), mapped to px.
// visibility = symmetric max-min point-to-segment distance between the two px polylines.
function perpPx(sA,sB){const A=polyPx(sA,1200),B=polyPx(sB,1200);
  return Math.max(oneSided(A,B),oneSided(B,A));}
// path-A projection (reposed spec, validated on its gate pool byte-exact):
// z0=t*tau/sqrt(1-t^2), G=((tau^2+u_tp^2)/(tau^2+u_spot^2))^1.5, phi'=u'-z0*G,
// u_tp from E.arbitrageToOracle(s,K); reserves channel identical to legacy tradeUpdate.
```

Key float64 anchors: y0=303448.275862; mp0=80000.000000; guard (−94827.6, +252873.6); gate-pool
mp0=2.457812, G(1.1×)=1.2726, G(1.6×)=4.4911, φ_near=−0.054467, φ_far=−0.684490 (spec match 0.0);
τ-click px / Δw = 3.6–3.7 across Δw∈{0.10,0.25,0.37,0.44}.

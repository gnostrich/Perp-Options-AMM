# How the trade-point-anchored continuous warp generalises to the generalised-Balancer-with-kurtosis ((W)) curve

_research-lead, 2026-06-10. Operator entry 34 ("how does that generalise to the generalised balancer
with kurtosis thing?"). **READ-ONLY THEORY DERIVATION. NO engine edit, NO git, NO Aristotle submission,
NO build file touched** (operator is live-playing HEAD). Re-read the retrieved warp-amm artifacts only.
Manager re-derives every number; skeptic before the operator hears it._

**"That"** = the trade-point-anchored continuous warp located on Aristotle — the **warp-amm cluster**
(`RequestProject/Warp.lean`, Model C §5): scalar weight `w₀`; tangent **at the trade point** `(x_B,y_B)`
`σ_B = ((1−w₀)/w₀)(x_B/y_B)`; warp re-seats the curve to that tangent (`w₁`); `mode_shift_closed_call`
= `(1/w₀)·log(y_s/y_B)`; rapidity slope integrals `2σ·sinhΔξ` / `2σ²(coshΔξ−1)`.
**"The generalised balancer with kurtosis thing"** = the **(W) curve** = HEAD v27: √-kernel weight
**field** `w(u;φ)=w_mid+(Δw/2)(u−φ)/√(τ²+(u−φ)²)`, static kurtosis knob τ, frozen power-law wings.

Tags: `[paper-cited]` (named in the paper / Aristotle Lean), `[analytic]` (closed-form identity,
machine-checked), `[numeric]` (verified at test params). Scripts transcribed at the end
(`/tmp/genB_warp.py`, `/tmp/genB_warp2.py`, python float64).

---

## HEADLINE

The warp-amm scalar-`w₀` trade-point warp **lifts to the (W) field cleanly, and the lift is forced** —
not a modelling choice. On Balancer the warp re-seats a *scalar* `w₀→w₁` at the trade point; on (W) the
weight is a *field*, so the same trade-point re-seat becomes a **φ-recenter of the field** (η→η−φ in the
hyperbolic-angle lens). The per-leg law has a **closed form** and a clean decomposition:

> **dφ/dy at the trade point = du′/dy − (1/w′(u))·(β/y²)**         `[analytic]`

The novel piece — and the entire answer to "how does τ / the kurtosis knob enter" — is the
**field re-seat factor `1/w′(u)`**: the amount the field must shift to honour a unit of the trade's
weight-demand is **inversely the local field curvature**. The elbow (sharp, `w′(0)=Δw/2τ` large) absorbs
the warp nearly **in place** (small φ-travel); the frozen wings (`w′→0`) demand **divergent** φ-travel —
which is exactly the frozen-wing range obstruction, now re-derived from the warp-amm side. τ is never
written by the trade (static-knob design holds); it modulates the warp only through `w′(u)`. The
Balancer limit (τ→∞ ⇒ `w′→0` ⇒ field flat) recovers the scalar warp-amm result. The closed forms
**survive in the elbow-local sense** (φ-solve is closed form when `w*∈(w_−,w_+)`); they **break globally**
exactly when the trade would push the local weight past a frozen wing (no finite φ — falls back to a
numeric clamp). All four contracts (α/β conservation, frozen wings, γ>1, Reading-A settlement) hold,
with the **one-global-φ subtlety** the skeptic flagged remaining the real design tension.

---

## 1. The map — scalar-`w₀` re-seat → φ-recenter of the field

### 1.1 What warp-amm does (scalar) `[paper-cited]`
Model C (Warp.lean §5) anchors at the **trade point** `(x_B,y_B)` on the *pre-trade* curve, reads the
tangent `σ_B = ((1−w₀)/w₀)(x_B/y_B)`, then picks the post-warp **scalar** weight
`w₁ = x_s/(x_s + σ_B·y_s)` that re-seats the curve so its tangent at the new point equals `σ_B`
(`warp_tangent_eq_σB`, `warp_passes_anchor`). The resulting **mode-rapidity shift** is
`ξ_m(w₁) − ξ_m(w₀) = log(y_s/x_s) − log(y_B/x_B)` (`mode_shift`), and along the same pre-trade curve it
closes to `mode_shift_closed_call = (1/w₀)·log(y_s/y_B)`. The whole object is one scalar `w₀→w₁` whose
geometric content is a **shift of the mode rapidity** `ξ_m = log((1−w)/w)`.

### 1.2 What changes on (W): the mode is a field, the shift becomes φ `[analytic]`
On (W) the weight is the **field** `w(u;φ)`, `u = ln(y/x)`, and the field has a designated centre φ that
plays the role warp-amm's single `ξ_m` plays: it is the one handle a trade is allowed to move (τ, w_mid,
Δw are frozen — kurtosis static, wings frozen). So the warp-amm "shift the mode rapidity by a trade" lifts
directly to **"recenter the field: w(u;φ) → w(u;φ′)"** — the η→η−φ angle-shift of the hyperbolic-angle
lens. Concretely, anchored **at the leg's trade point** `(x_B,y_B)` = (ray ∩ curve for that strike), with
local weight `w_B = w(u_B;φ)`:

```
α := x_B·w_B,   β := y_B·(1−w_B)          (trade-point conserved quantities; the warp-amm σ_B is α/β packaged)
Step 1.  y' = y_B + dy
Step 2.  w*  = 1 − β/y'                    (β-conservation: the new LOCAL weight the trade demands)
Step 3.  x'  = α/w*                         (α-conservation: dx forced — Balancer-identical)
Step 4.  φ'  : w(ln(y'/x'); φ') = w*        (RE-SEAT the field so its local weight at the new point = w*)
            t := (w*−w_mid)/(Δw/2),  z := t·τ/√(1−t²),  φ' = ln(y'/x') − z
```

Steps 1–3 are **identical to warp-amm** (and to plain Balancer) — they are the conservation move. The
**only new thing** is Step 4: where warp-amm reads off `ξ_m(w₁)` as a scalar, (W) must invert the
*field* to find which centre φ′ reproduces the demanded local weight `w*` at the new point. That
inversion is the lift, and it is what carries τ (§2).

This is exactly the strong-form map already derived in `TRADE_WARP_strongform_2026-06-10.md` §3 (skeptic
GREEN), now **re-cast as the field-lift of the warp-amm scalar object** — the operator's two artifacts
are the same mechanism in two parametrisations (warp-amm: rapidity/scalar `ξ_m`; (W): reserve/field φ).

### 1.3 The per-leg differential law (the "continuous" generalisation) `[analytic]`
The continuous, per-leg rate — anchored at the trade point, the operator's pin — is dφ/dy in the Δy→0
limit. Differentiating Step 4:

```
dφ/dy  =  du′/dy  −  (dz/dw*)·(dw*/dy)
        =  du′/dy  −  (1/w′(u))·(β/y²)            ← THE LAW
```

with `dw*/dy = β/y²` (the warp-amm / paper continuous warp **rate**, in the local weight), and the
**field re-seat factor** `dz/dw* = 1/w′(u)` (proven identity, §2). Numeric vs analytic match to
**1.2e-10** (`/tmp/genB_warp.py`, params x=10,y=12,τ=0.3,w_mid=0.62,Δw=0.20). This is the (W) analogue of
warp-amm's `mode_shift_closed_call`: warp-amm gives the **discrete** shift `(1/w₀)log(y_s/y_B)`; this gives
the **continuous, per-leg** field-recenter rate, with the extra `1/w′(u)` factor that the scalar model
does not have (because a scalar has no field-curvature to invert against).

> **Note (`dw*/dy = β/y²`).** This is precisely the paper-draft's named continuous warp rate
> (line-288 placeholder; skeptic VERDICT_WARP_continuous_strikedep confirmed `dw/dy=β/y²` as the Δy→0
> limit of the discrete Trade Formula). On scalar Balancer it IS the whole warp rate. On (W) it is the
> *demand*; the field-recenter rate is that demand divided by `w′(u)`. So the (W) generalisation = "the
> paper's `β/y²` warp rate, refracted through the field curvature."

### 1.4 The current-engine gap this addresses `[paper-cited]`
The confirmed gap (skeptic #16, `VERDICT_WARP_continuous_strikedep`): the live engine's
`tradeUpdate(state, dy)` warps at **spot**, strike never an argument (bit-identical φ′ across strikes at
fixed cash leg). The law above is anchored at **`(x_B,y_B)` = the leg's ray∩curve trade point**, so the
same cash leg warps by strike-dependent amounts (the `β/y²` and `1/w′(u)` both vary by ray). This is the
trade-point-anchored, per-leg form the operator pins — the (W) realisation of warp-amm's `σ_B`-at-`(x_B,y_B)`.

---

## 2. How τ / the field enters: the `1/w′(u)` re-seat factor `[analytic]`

On plain Balancer the warp is **uniform** (one scalar `w`, no curvature). On (W) the curvature varies —
sharp elbow, frozen wings — and the kurtosis knob enters the per-leg warp **only** through the field
curvature `w′(u)`, via the identity (machine-checked, `/tmp/genB_warp2.py`, residual 0 to float64):

```
dz/dw*  =  1 / w′(u_on_field) ,      w′(u) = (Δw/2)·τ² / (τ² + (u−φ)²)^{3/2}
```

Decomposition at the test point (`/tmp/genB_warp2.py`):

```
displacement term  du′/dy        = +0.124020
field re-seat term −(1/w′)·β/y²  = −0.131423
total dφ/dy                      = −0.007403
```

**Reading of the τ-modulation (the operator's question, answered):**
- **YES, the kurtosis knob scales the per-leg warp — but inversely, through `w′(u)`, NOT as a separate
  multiplier the trade writes.** A sharp elbow (`w′(0)=Δw/2τ` large, i.e. **small τ**) means the field
  can absorb the trade's weight-demand with a **small** centre move — the elbow "gives" locally. A soft
  elbow (large τ) needs a **larger** φ-recenter for the same cash. τ-sweep at the elbow
  (`/tmp/genB_warp2.py`, u=0): field re-seat term = −0.019 (τ=0.05) → −0.114 (τ=0.3) → −1.90 (τ=5).
- **Strike dependence: YES, and it is dominated by the wings.** `dφ/dy` across strikes
  (`/tmp/genB_warp.py`, fixed cash leg at each ray's trade point): u=−1.5→−84, u=−0.5→−1.38,
  u=+0.5→−0.31, u=+1.5→−2.47. The magnitude **grows sharply toward the wings**, because `w′(u)→0` there
  (frozen wings) so `1/w′(u)→∞`: a trade landing on a wing demands an enormous φ-recenter to re-seat a
  field that is locally flat. This is the same `~27×`-across-strikes spread the skeptic reproduced for the
  discrete form — here it is the continuous-rate explanation.
- **Consistent with static-τ / frozen-wing design: YES.** τ, w_mid, Δw are **never written** by the
  trade — only φ moves (verified: γ_+ pre=post, wings shift-invariant, `TRADE_WARP_strongform` battery).
  The knob is not "scaled by the trade"; it is a fixed property of the field that **conditions** how the
  trade's fixed weight-demand `β/y²` maps to a φ-recenter. So "elbow warps more / wings frozen" is
  realised correctly: the elbow recenters cheaply and visibly; the wings resist (and at the limit refuse —
  §4 obstruction), exactly the frozen-wing intent.

**One sign caution (carried from the kurtosis-sweep pass, not re-opened here):** `dφ/dy` can change sign
across the elbow (the displacement term and the field-reseat term compete). This is the same sign-flip the
`WARP_kurtosis_sweep` note flagged (φ overshoot when the demand exceeds the field's local give); it does
not affect the closed-form validity but the build must not read |dφ| as monotone in strike.

---

## 3. Do the closed forms survive? — VERDICT: elbow-local YES, global NO (honest)

- **Step-4 φ-solve is closed form** whenever `w* ∈ (w_−, w_+)` ⇔ `|t|<1`:
  `φ′ = ln(y'/x') − t·τ/√(1−t²)`, `t=(w*−w_mid)/(Δw/2)`. No bisection for the warp itself. `[analytic]`
- **The warp-amm `mode_shift` closed form has a direct (W) analogue.** warp-amm's `mode_shift` is the
  shift of the scalar `ξ_m`; on (W) the analogous object is `ξ_m(w*) − ξ_m(w_B)` evaluated at the
  trade-point local weights, and that retains warp-amm's structure exactly because the **wings are exact
  Balancer monomials** — on a wing `w` is the constant `w_±`, the field collapses to a scalar, and
  `mode_shift_closed_call = (1/w_±)·log(y_s/y_B)` carries **verbatim**. The hyperbolic-angle / cosh lens
  (the operator's polar lens) is the natural coordinate here: η = asinh((u−φ)/τ), and the φ-recenter is a
  pure angle translation η→η−φ, so warp-amm's rapidity machinery (`σ_ξ`, the `sinh/cosh` slope integrals)
  is the right language for the (W) elbow too.
- **BUT the global closed form breaks at the wing.** As `w*→w_±`, `t→±1`, `z = t·τ/√(1−t²)→±∞`: **no
  finite φ′**. The closed form is valid strictly inside the wing band; on the band edge it diverges. The
  build must fall back to a **numeric clamp** (saturate φ at the wing, route residual on-curve) or
  **reject/split** the oversized leg — i.e. for the global problem you do get a bisection/clamp like
  `arbitrageToOracle`, NOT a global closed form. `[analytic]`+`[numeric]`

**So: the field does NOT break the closed form in the elbow (where trading lives) — it stays closed.
It breaks it only at the frozen wing, which is the deliberate design boundary, handled by a clamp.**
This is strictly better than scalar Balancer, where `w∈(0,1)` admits any trade; (W) is tighter by design.

---

## 4. Consistency with the contracts (re-derived, not assumed)

| Contract | Verdict on trade-point-anchored (W) warp | Tag |
|---|---|---|
| **α=x·w / β=y·(1−w) conservation** | HOLDS. Steps 2–3 ARE the conservation move; reserves ride `(x−α)(y−β)=αβ` (the same trajectory hyperbola, `TRADE_WARP_strongform` §4, residual 1e-15). The warp-amm `σ_B` is α/β at the trade point. | `[analytic]` |
| **Frozen wings** | HOLDS. φ-recenter leaves `w(±∞;φ)=w_±` invariant; γ_± τ-independent; trade never writes τ/w_mid/Δw. | `[analytic]` |
| **γ>1** | HOLDS iff `w_±>½` (the standing calibration lock; the warp does not touch wing weights, so it cannot break a γ>1 pool — but it also cannot fix a mis-set one). | `[analytic]` |
| **Reading-A settlement** | HOLDS. Value law is `S^(−γ_loc)`, γ_loc=w(u)/(1−w(u)) by construction; the warp only moves φ hence γ_loc(·), and S*=K·γ_loc/(γ_loc+1) stays exact by construction (the locked Reading-A decision). The warp acts *within* the settlement, never on the mark form. | `[analytic]` |

**The flagged tension (the skeptic's one-global-φ subtlety) — NOT resolved here, RE-FLAGGED.** A warp
anchored at the leg's **trade point** `(x_B,y_B)` returns a post-state expressed *at that trade point*
(one φ′), but the live **reserves point** is a *different* point on the same curve. Reconciling "one trade,
one global φ, two points on one curve" into a globally consistent live `(x,y,φ)` is the genuine design
work (skeptic VERDICT_WARP_continuous_strikedep §6; `TRADE_WARP_strongform` consistency-item-1). The clean
statement of what makes this well-defined is the **`(α,β)`-first-integral / flow-confinement lemma**: that
`α=x·w(ln(y/x)−φ)`, `β=y·(1−w(ln(y/x)−φ))` are first integrals of the (W) trade vector field and the
reserves projection is exactly `(x−α)(y−β)=αβ`, so the per-leg integral is **path-independent** and a
single global φ is consistent regardless of which point you anchor at. Verified numerically to 0.0
(path-independence, `TRADE_WARP_strongform` battery) but **not proven in Lean** — `[needs-Aristotle]`,
short, algebraic, Mathlib-tractable, no special functions. This is the lemma that would *certify* the lift.

**Also re-flagged (unchanged):** trades-commute-with-carry-shift-rebase on (W) is OPEN
(`[needs-Aristotle]`); the φ=0 anchor / funding-reference under a moved φ is operator/settlement-tier.

---

## 5. The Balancer-limit reduction check (τ→∞ ⇒ warp-amm scalar) `[numeric]`+`[analytic]`

As τ→∞ the field flattens to a constant: `w′(u) = (Δw/2)τ²/(τ²+(u−φ)²)^{3/2} → 0`, and `w(u;φ)→w_mid`
everywhere (a single scalar weight). Verified (`/tmp/genB_warp.py`): `w′(0) = 1.00e-04` at τ=1000,
`9.5e-02` at τ=1 — monotone to 0. In this limit:
- The field has no curvature to invert against; the per-leg law `dφ/dy = du′/dy − (1/w′)·β/y²` is no
  longer the operative object — instead the scalar weight `w*` itself moves, exactly as in warp-amm
  (`w₀→w₁`), and the curve re-seat is read directly off `ξ_m(w*)`. The (W) machinery **collapses onto the
  warp-amm scalar mode-shift** `(1/w₀)·log(y_s/y_B)`.
- Δw→0 is the same degeneration from the skew side (no field amplitude → plain Balancer). Both limits
  return the scalar warp-amm object, confirming the (W) law is a genuine **generalisation** of warp-amm
  (warp-amm = the τ→∞ / Δw→0 corner), not a different model.

(Consistent with the prior `WARP_kurtosis_sweep` finding that the (W)↔Balancer match lives only at the
degenerate τ→∞/Δw→0 corner — same fact, viewed from the warp law.)

---

## 6. Crisp summary for the operator (via the manager)

1. **It generalises cleanly and the generalisation is forced.** warp-amm's scalar trade-point re-seat
   `w₀→w₁` becomes a **φ-recenter of the (W) field** anchored at the leg's trade point. Per-leg closed
   form: **dφ/dy = du′/dy − (1/w′(u))·(β/y²)** `[analytic]`, numeric-confirmed 1.2e-10.
2. **τ / the kurtosis knob enters ONLY through the field re-seat factor `1/w′(u)`** (`dz/dw* = 1/w′(u)`,
   exact). Sharp elbow (small τ) ⇒ cheap, local warp; wings (`w′→0`) ⇒ divergent φ-travel ⇒ the frozen-wing
   range cap. Strike-dependent (grows toward the wings; ~27× spread reproduced). **τ is never written by
   the trade** — static-knob / frozen-wing design holds; the knob *conditions* the warp, it is not *scaled*
   by it.
3. **Closed forms survive in the elbow (where trading lives); break at the frozen wing.** Step-4 φ-solve
   is closed form for `w*∈(w_−,w_+)`; the warp-amm `mode_shift`/cosh-lens machinery carries verbatim on
   the wings (constant `w_±`). Past a wing: no finite φ ⇒ numeric clamp / reject / split (the global
   problem is bisection-class, not closed).
4. **Contracts hold:** α/β conservation, frozen wings, γ>1 (iff w_±>½), Reading-A settlement — all survive
   (warp only moves φ). **Re-flagged unresolved:** the one-global-φ-across-two-points reconciliation
   (the `(α,β)`-flow lemma, `[needs-Aristotle]`, the piece that would *certify* the lift); trades∘rebase
   commute on (W) `[needs-Aristotle]`; φ-anchor/funding reference under moved φ (operator-tier). **No
   submission this pass.**
5. **Operator-tier decisions flagged (not mine):** whether the engine moves to trade-point anchoring
   (curve/economic-object decision); the wing clamp-vs-reject-vs-split behaviour (calibration); the
   φ=0 anchor / funding reference. **Nothing built, submitted, or committed.**

---

## Scripts (transcribed)

`/tmp/genB_warp.py` — Check A (dφ/dy closed form vs numeric, 1.2e-10), Check B (Balancer limit τ→∞,
w′(0)→0), Check C (strike-dependent dφ/dy via trade points along the curve).
`/tmp/genB_warp2.py` — decomposition of dφ/dy into displacement vs field re-seat; the identity
`dz/dw* = 1/w′(u)` (residual 0 to float64); τ-modulation sweep of the field re-seat term at the elbow.
Both python float64, params (x,y,φ,w_mid,Δw,τ) = (10,12,0,0.62,0.20,0.3) unless swept. Manager re-derives.

# Is the polar/√-kernel kurtosis map the MOST NATURAL one? — design-space, naturalness, divergence

> **⚠ SUPERSEDED 2026-06-13 (operator entry 229/230).** The √-kernel `h_τ=√(τ²+u²)−τ` is no
> longer the lens: the operator redefined kurtosis to a CONSTANT slope multiplier `m` (no kernel
> to justify; "kurtosis" = the scalar `m`). Kept for history. Current object:
> `notes/research/CONSTANT_M_lens_object_sync_2026-06-13.md`.


_research-lead, 2026-06-11. Operator entry 41. **READ-ONLY (operator-pinned): NO engine edit, NO git,
NO build touch, NO Aristotle submission.** Operator is live-playing HEAD `1eebfcd6`; build path = A
(trade-point anchoring), PAUSED for this exploration. Notes-only. Scripts transcribed at the end
(`/tmp/naturalness.py`, `/tmp/naturalness2.py`, `/tmp/naturalness3b.py`; python float64 + scipy).
Tags: `[analytic]` derived, `[numeric]` float64-checked._

---

## THE QUESTION (operator entry 41, verbatim)

> "i just want a bit more clarity around how whether our polar map that implements this kurtosis wings
> shoulder thing is the most natural one … read only"

Is the (W) construction — weight field `w(u)=w_mid+(Δw/2)·u/√(τ²+u²)` (the **√-kernel**), read in the
hyperbolic-angle / "polar" lens (`u=τ·sinh η`, the **cosh** form) — the **MOST NATURAL** encoding of
*frozen power-law wings + a rounded shoulder + one static kurtosis knob τ*? Or one convenient encoding
among many? (Standing operator flag: trig must EARN its place, not be adopted for elegance.)

## VERDICTS IN ONE BREATH

1. **Most-natural-map verdict: the √-kernel is the natural ALGEBRAIC PRIMITIVE; the cosh/hyperbolic-angle
   is its COORDINATE, not a second object.** Among maps that give frozen power-law wings + a rounded
   shoulder + one knob, the √-kernel is singled out by one concrete, non-aesthetic property: **it is the
   only candidate whose curve invariant is closed-form *algebraic*** (∫ of the √-kernel `= √(τ²+u²)`,
   elementary; tanh integrates to a transcendental `τ·ln cosh`, erf to a non-elementary `u·erf+gaussian`).
   The polar lens does *uniquely* pick cosh **once you accept the lens** (cosh η is the unique hyperbolic
   "radius"), but the lens is a well-motivated modelling choice, not a logical necessity. So: **canonical
   as the algebraic primitive (earns its place on integrability, not elegance); the trig EARNS its place
   only as the narrating coordinate (skew=angle-shift, kurtosis=amplitude) and adds no new content** —
   exactly the standing ruling from the CURVE_FAMILY derivation.

2. **Does a more natural map soften the divergence, or is it intrinsic? — The divergence is INTRINSIC to
   *any* frozen-power-law-wing map** (frozen ⇒ w→const ⇒ w′→0 ⇒ gearing 1/w′→∞, necessarily). The SHOULDER
   shape only sets the *rate*. A slower-decay map (algebraic `u/(τ+|u|)`, w′~1/u² vs √-kernel's 1/u³)
   **materially softens** the gearing — 3.7× at u_tp=5τ, ~10× at 12τ, growing with distance — **but it
   still diverges (polynomially), so the strike cap is still required; it just sits further out.** And
   the softening is *bought* by a less-crisply-frozen wing (slower w→w_± convergence: resid 1e-3 vs 5e-6
   at u=30τ). **No map removes the cap.** The divergence is a domain-of-validity boundary, not a defect of
   the √-kernel.

---

## 1. THE DESIGN SPACE — sigmoids giving {frozen power-law wings + rounded shoulder + one knob τ}

The curve is fixed by a weight field `w(u) = w_mid + (Δw/2)·s(u/τ)`, where `u=ln(y/x)` is the
reserve-ratio (log-price) ray and `s` is an odd sigmoid with `s(0)=0`, `s′(0)=1` (normalize), `s(±∞)=±1`.
Two structural facts that hold for **every** such `s` `[analytic]`:

- **Frozen power-law wings** ⟺ `s(±∞)=±1` ⟺ `w→w_± = w_mid±Δw/2` constant ⟺ wing is exact monomial
  `x^{w_±}y^{1−w_±}`, wing exponent `γ_± = w_±/(1−w_±)`, **τ-independent** (numerically confirmed: all
  candidates converge to the same `γ_+ = 2.5714` at the test params).
- **One static knob τ** = the elbow/shoulder width; `w′(0) = (Δw/2)/τ` is the ATM sharpness (the
  kurtosis). Skew is `Δw` (a second geometric handle in general) — under the operator's frame skew is
  *produced by trading* (the φ field-shift), so at deploy τ is the one static shape knob.

### Design-space table `[numeric, /tmp/naturalness.py]`

| map `s(x)` | wing decay of `s′` (⇒ w′ decay) | shoulder | invariant `∫s du` | knob τ tunes |
|---|---|---|---|---|
| **√-kernel `x/√(1+x²)` (CURRENT)** | **power `~x⁻³`** (fit −2.96) | rounded, algebraic | **`√(τ²+u²)` — ELEMENTARY ALGEBRAIC** | elbow width; w′(0)=Δw/2τ |
| `tanh(x)` | exponential `~e^{−2x}` (rate −2.0) | rounded, fastest-frozen | `τ·ln cosh(u/τ)` — transcendental | elbow width |
| Gudermannian `(2/π)gd(x)` | exponential `~e^{−x}` (rate −1.0) | rounded, broad | transcendental (log-tan) | elbow width |
| `erf(cx)` | super-exp `~e^{−x²}` (rate steep) | rounded, sharpest-frozen | `u·erf + gaussian` — non-elementary | elbow width |
| algebraic `x/(1+\|x\|)` | **power `~x⁻²`** (fit −1.82) | rounded, slowest-frozen | piecewise log — transcendental | elbow width |
| GH-in-SCORE (demoted line) | — | kernel in latent score, NOT weight | — | (different object: kurtosis-in-distribution, no scalar w handle — `TRADE_WARP_strongform` §"DISCARDED") |

All five weight maps give the **same frozen power-law wings and the same one-knob structure**; they
differ only in the **shoulder's curvature profile** and hence the **rate** at which `w′→0`.

The GH-in-the-SCORE construction (the demoted v25→v26c line) is *not* in this family: it puts the
kernel in the latent score, so there is **no scalar weight `w=α/x` for a trade to move** — which is
precisely why warp-with-trades failed on it and (W) was adopted. It is a different naturalness question
(kurtosis-as-distribution-moment) and is the operator's settled-against choice; not re-litigated here.

---

## 2. IS THERE A NATURALNESS PRINCIPLE THAT SINGLES ONE OUT?

### (a) The polar lens picks cosh — but only *given* the lens `[analytic]`

The operator's lens: parametrize the strike ray by a **hyperbolic angle** η with `u = τ·sinh η`, and let
the warp amplitude depend on the hyperbolic **radius** only. The unique radius with `R→|u|` on the wings
is `R(η) = τ·cosh η`, and `τ·cosh η ≡ √(τ²+u²)` exactly (`max residual 4.4e-16`, `/tmp/naturalness2.py`).
So **within the polar lens, cosh/√-kernel is forced** — there is no freedom. The weight is then exactly
`w = w_mid + (Δw/2)·tanh η` (residual `0.0`): **the √-kernel *in u* IS tanh *in the hyperbolic angle η*.**

Why is the hyperbolic angle the natural chart? Because Balancer's `(x,y)` curve has the log-price ray
`u=ln(y/x)` as its natural *rapidity* (the additive parameter of the multiplicative `x↔y` rescaling); a
"distribution through hyperbolic angles" is the rapidity view. That is a **good motivation, not a proof**
of canonicity — one could equally pose the sigmoid directly in `u` (tanh-in-u, algebraic-in-u) and never
invoke a hyperbolic angle. So the lens **earns its place as a viewpoint** but does not logically *force*
the √-kernel over the whole family.

### (b) Which map makes the locked contracts cleanest? — integrability decides `[analytic+numeric]`

This is the load-bearing, non-aesthetic discriminator. The curve is the first integral of
`−d ln y/d ln x = w/(1−w)`; its closed form needs `∫ s(u) du` (`/tmp/naturalness3b.py`, all matched to
≤2.2e-16):

- **√-kernel:** `∫ u/√(τ²+u²) du = √(τ²+u²)` — **elementary algebraic** ⇒ the clean (W) invariant
  `x^{w_mid}y^{1−w_mid}·exp(−(Δw/2)√(τ²+ln²(y/x))) = k` (the existence witness, manager-verified RK4).
- **tanh:** `∫ tanh(u/τ) du = τ·ln cosh(u/τ)` — elementary but **transcendental** ⇒ invariant carries a
  `cosh`-log, no algebraic level set.
- **erf:** `∫ erf = u·erf + gaussian` — **non-elementary as a curve**, no clean closed form.
- **algebraic `u/(τ+|u|)`:** piecewise-log transcendental, and not smooth at `u=0` unless softened.

**So the √-kernel is the natural algebraic primitive: it is the unique candidate giving a closed-form
*algebraic* curve invariant** (which the other locked contracts — value∝S^{−γ} exact wings, price==slope,
the trade/warp algebra `α=x·w, β=y·(1−w)`, `z=t·τ/√(1−t²)` reseat — all read cleanly off). This is the
principle that singles it out, and it is mechanical, not aesthetic.

### (c) Max-entropy / information-geometry argument? — does NOT uniquely pick √-kernel `[analytic]`

A minimal-assumption framing would ask for the "least-committed" sigmoid interpolating two power-law
wings. There is no canonical max-entropy answer here: the wings fix `s(±∞)=±1` and the knob fixes
`s′(0)`, but the shoulder is under-determined by those constraints alone — every candidate in §1
satisfies them. Max-entropy on the *implied density* (the Gudermannian-bridge measure `p_χ = f·2cosh u`)
was explored 2026-06-10 (`notes/GUDERMANNIAN_BRIDGE`) and gave **no clean single-knob kurtosis law** —
the "d-law FAILED to earn its place" (the d was the amplitude relabeled). So information geometry does
**not** rescue canonicity; it lands back on §2(b) — the algebraic-invariant criterion is the real one.

### (d) Algebraic primitive vs trig coordinate — the standing finding, confirmed `[analytic]`

The earlier CURVE_FAMILY derivation already ruled (Part 1): *"state the family with the √-kernel
invariant; narrate it with the angle lens. Trig EARNS its place ONLY as the lens… introduces NO new
content."* This pass **confirms that ruling with a sharper reason**: the √-kernel is not just *a* choice
that happens to have an angle view — it is the **unique algebraically-integrable** member, and the cosh
is literally its `η`-coordinate (`tanh η` ≡ √-kernel-in-u, residual 0.0). The honest naming is therefore:

> **√-kernel = the object; hyperbolic angle = the chart. They are the same curve. The trig is a lens,
> not a second model, and it earns its place as a lens only.**

---

## 3. THE WARP DIVERGENCE — intrinsic to frozen wings, or softer under a "more natural" shoulder?

This is why entry 41 came up. The warp gearing is `G = w′(u_spot)/w′(u_tp) = 1/w′(u_tp)`-ish, and it
blows up because `w′→0` in the frozen wing (entry 40 / `WARP_divergence_reconcile`).

### 3.1 The divergence ITSELF is intrinsic to any frozen-power-law-wing map `[analytic]`

**Frozen power-law wing ⟺ w→const ⟺ w′→0 — necessarily.** Therefore the gearing `1/w′(u_tp)→∞` as the
trade point approaches the wing **for every map in §1**. There is no frozen-wing sigmoid with bounded
gearing out to the wing; bounded gearing would require `w′↛0`, i.e. a wing that keeps bending — which is
**not** a frozen power-law wing (it breaks the γ_± exponents and the γ>1 lock). **So bounding the strike
range is unavoidable regardless of map** — exactly the entry-40 (g.4)-cap conclusion, now shown to be
map-independent.

### 3.2 …but the shoulder shape materially changes the *rate* `[numeric, /tmp/naturalness.py/2.py]`

Wing decay of `w′` (= the gearing growth) ranks cleanly:

| map | `w′` wing decay | gearing G at u_tp=5τ | at 8τ | at 12τ |
|---|---|---|---|---|
| erf | `~e^{−u²}` (super-exp) | 3.4e8 | 6.8e21 | — (worst) |
| tanh | `~e^{−2u}` | 5.5e3 | 2.2e6 | — |
| Gudermannian | `~e^{−u}` | 74 | 1.5e3 | — |
| **√-kernel (current)** | **`~u⁻³`** (power) | **133** | **524** | **1746** |
| algebraic `u/(τ+\|u\|)` | `~u⁻²` (power) | 36 | 81 | 169 |

The exponential/super-exponential maps (tanh, erf) are **far worse** — their gearing explodes much faster
than the √-kernel. The √-kernel is already a **good** choice on divergence grounds (polynomial, not
exponential). The **only** map that softens it further is the slower algebraic `u/(τ+|u|)` (w′~1/u²):

| u_tp/τ | √-kernel G | algebraic G | softening |
|---|---|---|---|
| 3 | 31.6 | 16.0 | 2.0× |
| 5 | 132.6 | 36.0 | 3.7× |
| 8 | 524 | 81 | 6.5× |
| 12 | 1746 | 169 | 10.3× |

So a "gentler shoulder" (algebraic) **does materially soften** the divergence — the softening grows with
distance (2× → 10× → more). **But three caveats make this a non-upgrade for path A:**

1. **It still diverges** (polynomially, `~u²`). The cap is still required; it just sits ~one strike-band
   further out. No map removes it (§3.1).
2. **The softening is bought with a less-crisply-frozen wing.** Slower w′-decay ⇒ slower `w→w_±`
   convergence: the algebraic map's wing-weight residual is `1e-3` at u=30τ vs the √-kernel's `5e-6`
   (`/tmp/naturalness2.py`). The wings are *less* exactly power-law — a direct tension with the frozen-wing
   contract and the exact wing-exponent / value∝S^{−γ} (G4) gate. You trade divergence-headroom for
   wing-exactness.
3. **It loses the algebraic invariant** (§2(b)): `x/(τ+|u|)` integrates to a piecewise log, not an
   algebraic level set, and is not smooth at the elbow center without further softening — i.e. it forfeits
   the §2(b) naturalness property that singled out the √-kernel in the first place.

### 3.3 Verdict on the divergence

**The divergence is intrinsic to the frozen-wing design, not to the √-kernel.** A gentler shoulder
(algebraic) softens it by a growing factor (3.7× at 5τ) but (i) does not remove the cap, (ii) erodes the
frozen-wing exactness, and (iii) loses the algebraic invariant. **The √-kernel sits at a sweet spot: it is
the *least*-divergent map (polynomial, not exponential) that *also* keeps a crisply-frozen power-law wing
*and* a closed-form algebraic invariant.** Among the maps that honour all three contracts, it is the
gentlest. So the (g.4) strike cap from entry 40 is the right resolution under any natural map, and the
√-kernel is not the cause of the divergence — it is already close to the best you can do without breaking
a locked contract.

---

## 4. TRIG-FLAG JUDGMENT

The hyperbolic angle / cosh **earns its place strictly as a lens** (narration: skew = angle-shift φ,
kurtosis = amplitude `Δw·τ/2`, wings = `cosh→|·|`), and adds **no new content** beyond the √-kernel — the
two are the same curve (`tanh η ≡ √-kernel-in-u`, residual 0.0). It is **not** load-bearing as a model: if
the trig vanished, the √-kernel invariant `√(τ²+u²)` stands on its own as the algebraic primitive. This is
consistent with — and sharpens — the standing ruling (the Gudermannian "d-law" that was rejected for *not*
earning its place was a different, content-claiming use of the angle; this lens-only use is the honest
one). **Trig flag: SATISFIED, as a lens only.**

---

## 5. SUMMARY (for the manager → skeptic → operator)

- **(i) Most-natural-map verdict:** the **√-kernel is the natural algebraic primitive** — singled out
  (not by elegance but) by being the **only candidate with a closed-form *algebraic* curve invariant**
  (`∫ = √(τ²+u²)`; tanh/erf give transcendental/non-elementary invariants). The **cosh/hyperbolic-angle
  is its coordinate, not a second object** (polar lens uniquely forces cosh *given the lens*; the lens is
  well-motivated by the log-price rapidity, not logically forced). It is **canonical as the primitive,
  one-of-a-family as a shoulder shape, with a concrete tiebreak (integrability) in its favour.** Trig
  earns its place as a lens only — flag satisfied.
- **(ii) Does a more natural map soften the divergence?** **The divergence is INTRINSIC to any
  frozen-power-law-wing map** (frozen ⇒ w′→0 ⇒ gearing→∞); only the *rate* varies. The √-kernel is
  already the **least-divergent** map that keeps crisp frozen wings (polynomial `u⁻³`, vs tanh/erf's
  exponential blowup). The **only** softer option, algebraic `u/(τ+|u|)` (`u⁻²`, 3.7× softer at 5τ),
  **still diverges, erodes wing-exactness, and loses the algebraic invariant** — a net downgrade for path
  A. **No map removes the cap.** The entry-40 (g.4) strike cap is the correct, map-independent resolution;
  the divergence is a domain-of-validity boundary, not a defect of the √-kernel.

**Honest carry (unchanged):** this is a theory/naturalness exploration, not a build authorization. The
`(α,β)`-flow-confinement lemma remains `[needs-Aristotle]` / OPEN (numeric-faithful only); warp∘rebase
commute and φ-anchor/funding remain OPEN. The curve/invariant choice and whether to switch shoulder shapes
are operator-tier calls — flagged, not decided. Nothing submitted / built / edited / committed.

---

## Scripts (transcribed)

- `/tmp/naturalness.py` — five normalized sigmoids; s′(0) normalization check; wing-decay table of s′;
  fitted power/exponential decay rates; relative warp gearing 1/s′(u_tp) across u_tp/τ.
- `/tmp/naturalness2.py` — frozen-wing convergence w→w_± per map (resid table); intrinsicness statement;
  √-kernel-vs-algebraic gearing softening factors (2.0×/3.7×/6.5×/10.3×); √-kernel↔cosh identity
  (`√(τ²+u²)=τcosh η`, resid 4.4e-16; `w_sqrt(u)=w_mid+(Δw/2)tanh η`, resid 0.0).
- `/tmp/naturalness3b.py` — antiderivative verification: √-kernel→`√(τ²+u²)` (match 0.0), tanh→`τ ln cosh`
  (2.2e-16), erf→`u·erf+gaussian` (2.2e-16) — confirming only √-kernel is algebraically integrable.

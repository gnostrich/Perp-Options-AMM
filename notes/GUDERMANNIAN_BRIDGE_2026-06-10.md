# The Gudermannian bridge, the d↔kurtosis law, and the angle-frame reconcile

_research-lead, 2026-06-10. Notes-only (no engine edit, no Aristotle submit, no git — manager
commits, re-derives; skeptic gates). Executes the closing offer of operator transcript entry 9
(`history/operator/2026-06-10_project-status-review.md`): "the Gudermannian bridge from the
strike-ray angle to the hyperbolic angle, the resulting d↔kurtosis law, and a check that it keeps
value∝S^(−γ) and lines up with the weight-warp."_

_All numerics: mpmath, dps=40–50 (25+ working digits). Scripts: `/tmp/gud/{core,moments2,checks2,bessel_cgf}.py`
(ephemeral; every number quoted below is reproduced in this note). Confidence labels inline:
**[VERIFIED-IDENTITY]** = algebraic identity, derived AND checked numerically to ~1e-38;
**[DERIVED+CONFIRMED]** = analytic derivation confirmed numerically to 4+ digits;
**[GRID-CONFIRMED]** = numerically true on the sampled grid, no analytic proof;
**[FRAMING]** = interpretation, not a theorem; **[OPERATOR-CALL]** = decision, flagged not made._

**Slot discipline upfront (skeptic-binding):** no curve-level identity across construction slots
is claimed anywhere in this note. The skeptic's verdicts stand: kernel-in-SCORE (GH) ≠
kernel-in-WEIGHT ((W)); the engine is not a (W) member at any τ. Everything below either lives
inside ONE family (an exact re-coordinatization) or is labeled a structural parallel.

Conventions: GH latent kernel `f(v) ∝ exp(βv − α√(δ²+v²))` (λ=1 hyperbolic class, the kernel of
all prior notes); engine pin `α=γ+1, β=1, δ=0.08`. Throughout: `ζ=√(α²−β²)`, amplitude
`A = δζ`, shift `φ = atanh(β/α)`, wing slopes `a = α−β` (call), `b = α+β` (put). At the pin:
`a = γ`, `b = γ+2`, `φ = atanh(1/(γ+1))`. The manager-verified collapse (starting point):
`log f(δ·sinh θ) = −A·cosh(θ−φ)` + const — re-verified here at 40 dps, max err **1.5e-38** over a
random grid of (α,β,δ,v) including the engine pins. **[VERIFIED-IDENTITY]**

---

## 1. The Gudermannian bridge, explicit

### 1.1 The map (three legs; the first two are exact, curve-independent geometry)

The paper's strike-ray fan: rays through the origin of the reserve quadrant, circular angle
`ψ ∈ (0°, 90°)` with `tan ψ = y/x`; **ATM = the 45° ray** (y=x). Write `χ = ψ − 45°` (ray angle
measured from ATM), `ũ = ln(y/x)` (the log-ratio coordinate).

- **Leg 1 — the fan opening (this IS the operator's "90 to 180 degrees"):** `σ = 2χ`,
  so `σ ∈ (−90°, +90°)` — a **180° span** — as ψ sweeps the 90° quadrant. The doubling is not a
  choice: the Gudermannian below maps the full real line onto exactly a 180° arc, so a 90° fan
  must open by exactly a factor 2 to carry an unbounded coordinate. "Mapped from 90 to 180
  degrees to view as a distribution" = this doubling, precisely.
- **Leg 2 — the Gudermannian proper:** `ũ = gd⁻¹(σ) = ln tan(σ/2 + 45°) = atanh(sin σ) = asinh(tan σ)`.
  Composing legs 1+2: **`ũ = ln(y/x) = ln tan ψ = gd⁻¹(2(ψ−45°))`** — checked numerically, max
  err 3.2e-40. **[VERIFIED-IDENTITY]** ATM lands at `ũ = 0` (σ=0). Conjugacies:
  `sin σ = tanh ũ`, `tan σ = sinh ũ`, `tan(σ/2) = tanh(ũ/2)`. The fan edges ψ→90°/0° are
  ũ→±∞: the bounded fan ↔ the unbounded line, which is the entire point of the bridge.
- **Leg 3 — the GH hyperbolic angle:** `θ = asinh(v/δ)`, i.e. `v = δ·sinh θ`, the substitution
  that collapses the kernel to `−A·cosh(θ−φ)`. Note leg 2 is **the same functional form**:
  `ũ = asinh(tan σ)` — the Gudermannian leg is the unit-scale (δ=1) asinh-bridge in the tan
  coordinate, with `tan σ` playing the role of `v/δ`. That structural rhyme is why the polar
  picture and the cosh frame fit together.

**Gear ratios at ATM** **[VERIFIED-IDENTITY]**: `dũ/dχ|₀ = 2` exactly (parameter-free — pure
quadrant geometry). Composite to the GH angle: `dθ/dχ|ATM = 2/δ` (= 25 at the engine δ=0.08).
So "one circular degree" buys exactly **2** rapidity-degrees geometrically, and **2/δ**
GH-angle-degrees once the kernel's scale enters.

### 1.2 Where the bridge is exact vs curve-mediated (slot honesty)

- On the **Balancer/CPMM base**, price = y/x, so `ũ = log price` and the whole chain
  ψ → σ → ũ → θ is ONE exact map from strike-ray angle to the distribution coordinate. The
  90°→180° conversation's original object (constant product) is exactly this case.
- On **GH**, the kernel lives in the latent score coordinate v, and `ln(Y/X)` along the frontier
  is related to the latent coordinate by a curve-specific monotone map with no closed form (the
  skeptic's non-monotone `w_eff` finding is precisely about this map). Legs 1–2 still apply to
  any positive-ratio coordinate (y/x, p/P, K/oracle — they only need "ratio → log → angle"), but
  the **distribution view** attaches at the latent leg (v), not at the reserve ray. Gluing the
  reserve-ray leg to the latent leg as one identity would repeat the kernel-in-SCORE vs
  kernel-in-RESERVES conflation — **not claimed**.

### 1.3 The measure the strike-ray angle inherits

Pushing the latent measure `f(v)dv` back through `v = gd⁻¹(2χ)` (CPMM-base identification,
labeled as such): `p_χ(χ) = f(v(χ)) · 2·cosh v(χ)`. The exponential Jacobian converts the wing
decay rates into **power-law vanishing at the fan edges**: with ε = angular distance to the edge,

```
p_χ ~ ε^(α−β−1)  at the call edge (ψ→90°),    p_χ ~ ε^(α+β−1)  at the put edge (ψ→0°).
```

At the engine pin: **ε^(γ−1) and ε^(γ+1)**; at β=0: ε^(α−1) on both edges. Numerically (δ=0.08):
α=4, β=1 → measured local exponents **1.9999 / 3.9999** (targets 2/4); α=4, β=0 → **2.9999 /
2.9999** (target 3). **[DERIVED+CONFIRMED]** Two readings worth having: (i) the wing power-laws
ARE the edge-vanishing exponents of the fan distribution — "view as a distribution" made exact;
(ii) the **γ>1 lock is the statement that the fan density pinches off at the call edge**
(γ≤1 would leave it non-vanishing/divergent there). The fan density is skewed at β=1 — the put
edge dies two powers faster than the call edge — and symmetric only at β=0.

---

## 2. The angle frame and the coordinates you'd build with

The collapse gives the family in **(φ, A)** form: shift φ (= atanh(β/α), δ-free) and amplitude
A (= δζ). The equivalent dial set that separates every load-bearing role is **(a, b, A)**:

```
a = α−β   (call-wing decay slope = THE value-law exponent γ at the pin)
b = α+β   (put-wing decay slope = γ+2 at the pin)
A = δ√(α²−β²)   (cosh amplitude = the shape/elbow dial)
```

Bijection **[VERIFIED-IDENTITY]** (algebra): `α=(a+b)/2, β=(b−a)/2, δ=A/√(ab), φ=½ln(b/a)`.
Engine pin γ=3: (a,b,A) = (3, 5, 0.08·√15 = 0.30984).

**Exact wing algebra (the asymptote-preservation argument, made exact in θ):** the cosh arms are
`−A·cosh(θ−φ) → −(A/2)e^{±(θ−φ)}`, and `e^θ → 2v/δ`, so the v-space wing slopes are
`(A/δ)e^{∓φ} = ζ·e^{∓φ} = α∓β` — **every trace of δ cancels**. Varying A through δ at fixed
(a,b) moves the elbow only; the walls' slopes are untouched at any amplitude. Numerically:
`d log f/dv` at v=±100 equals ∓(α∓β) with the predicted correction `αδ²/2v²` reproduced to its
own leading order (e.g. δ=0.08: err 1.28e-6 = exactly αδ²/2v²). **[DERIVED+CONFIRMED]**

**Esscher tilt in the angle frame** **[VERIFIED-IDENTITY]**: tilting β→β+1 adds `δ·sinh θ` to the
exponent, i.e. `−A'·cosh(θ−φ') = −A·cosh(θ−φ) + δ·sinh θ` with (φ',A') the re-aimed pair —
checked to 8.2e-38. The θ-frame shows WHY value∝S^(−γ) is amplitude-proof: the exponent lives in
the 2-plane span{cosh θ, sinh θ}, which is closed under the tilt; the tilt is a linear re-aim of
(φ,A) inside that plane, and the value-law exponent is the wing slope `a = α−β`, an
A-independent coordinate.

---

## 3. The d↔kurtosis law — verdict: NO clean single-d law; the true law is an amplitude law

The operator's conjecture: a single gear ratio d ("one circular degree → d hyperbolic degrees")
cleanly indexes kurtosis, with d=2 the Gaussian/symmetric point. **I derive that this fails in
the literal form, and I do not force it.** There are four inequivalent things "d" can mean, and
each is individually true in a way that forbids the combined law:

1. **Geometric gear (legs 1–2):** `dũ/dχ|ATM = 2` — exactly, always, with **no free parameter**.
   The "2" is quadrant geometry (the 90°→180° doubling), identical for every curve and every
   density. It cannot index anything. **[VERIFIED-IDENTITY]**
2. **Composite gear to the GH angle:** `dθ/dχ|ATM = 2/δ` — this IS a knob, monotone with the
   fatness dial 1/δ (engine: 25). But its Gaussian point is gear → 0 (δ→∞), and d=2 means δ=1,
   which is nothing special. So a gear-reading exists but **d=2 is not its Gaussian point**.
   **[VERIFIED-IDENTITY]** for the gear value; Gaussian-at-δ→∞ is the established REPARAM fact.
3. **Gear inside the cosh (hyperbolic-angle multiplication, the operator's "hyperbolic angle"
   move):** kernel `exp(−A·cosh((d/2)·θ))` has wings `exp(−c·v^(d/2))` — measured wing-class
   exponent p = d/2 exactly (0.800/1.000/1.200 at d=1.6/2/2.4, at v up to 1e6).
   **[DERIVED+CONFIRMED]** Hence **d=2 is the UNIQUE asymptote-preserving setting** (linear
   walls = power-law value wings); every d≠2 is the |v|^d wing-snapper in disguise (d=4 would be
   Gaussian wings — and snapped asymptotes). The asymptote requirement **freezes d at 2**; d is
   not available as a knob at all in this reading.
4. **Taylor-order reading (the one true home of "d=2 = Gaussian"):** Gaussian = the order-2
   truncation `cosh ≈ 1 + t²/2`; kurtosis = the weight of the higher even orders, with relative
   size ~ `t²/12 ~ 1/(12A)` at the typical angle scale `t ~ A^(−1/2)`. True and useful — but "2"
   here is a Taylor order, not a continuous dial. **[FRAMING + DERIVED]**

Also note the operator's "d=2 = **Gaussian/symmetric** point" welds two different axes that the
angle frame separates: **symmetric is φ=0 (β=0), Gaussian is A→∞** — orthogonal directions in
(φ,A). No single d can be both.

**The closest true statement — the amplitude↔kurtosis law.** The dial that survives the
asymptote freeze is the cosh amplitude A. Exact at every A via the Bessel-K cgf
(normalizer `Z = 2δ·cosh φ·K₁(A)`, verified vs quadrature to ~1e-41; cgf
`ψ(t) = log[K₁(δζ_t)/ζ_t] − log[K₁(δζ)/ζ]`, `ζ_t = √(α²−(β+t)²)` — moments from this agree with
direct quadrature to 10 digits). Large-A expansion (derived from `ψ(t) ≈ −δ(ζ_t − ζ)`, which
also reproduces the recorded σ_eff² = δα²/ζ³):

```
skew  ≈  3·tanh φ / √A              excess kurtosis  ≈  (3/A)·(1 + 4·tanh²φ)
```

**[DERIVED+CONFIRMED]** — numerics, latent v-density, BOTH β (α=4 i.e. γ=3, and α=3 i.e. γ=2):

| δ | A (β=1,α=4) | skew | exkurt | exk·A | pred 3(1+4t²)=3.75 | skew·√A | pred 3t=0.75 |
|---|---|---|---|---|---|---|---|
| 0.0001 | 0.0004 | +0.98864 | 3.66436 | — | (AL endpoint) | — | — |
| 0.08 (engine) | 0.30984 | +0.91659 | 3.28487 | 1.018 | — | 0.510 | — |
| 0.3 | 1.1619 | +0.69532 | 2.15311 | 2.502 | — | 0.749 | — |
| 1 | 3.8730 | +0.41047 | 0.90482 | 3.504 | — | 0.808 | — |
| 3 | 11.619 | +0.22981 | 0.32129 | 3.733 | — | 0.783 | — |
| 30 | 116.19 | +0.06996 | 0.03225 | 3.747 | — | 0.754 | — |
| 300 | 1161.9 | +0.02201 | 0.00322 | 3.747 | — | 0.750 | — |

β=0 column: exk·A → 3 (2.99842 at A=1200; the recorded 3/(δα) law is the φ=0 slice of this).
γ=2, β=1: exk·A → 13/3 = 4.333 (measured 4.3254), skew·√A → 1 (measured 1.00036); endpoint
exkurt 4.08. The skeptic's β=1 numbers (skew +0.92 / exk 3.285 at the pin; AL endpoint 3.6644)
reproduce to all quoted digits. **The map A ↦ exkurt is monotone decreasing over the entire
sampled grid at both β** — range (0, 3] at β=0, (0, 3.6644] at β=1/γ=3, (0, 4.08] at β=1/γ=2 —
**[GRID-CONFIRMED]** (no analytic monotonicity proof; do not quote as a theorem).

**Verdict for deliverable 2: the single-d law does not exist.** The degrees are frozen (gear 2
by geometry; in-cosh gear pinned to 2 by the asymptote requirement); the freedom that survives
is the **amplitude**, and its law is the table above — exact via K₁ at all A, `(3/A)(1+4tanh²φ)`
near Gaussian, asymmetric-Laplace `6(a⁻⁴+b⁻⁴)/(a⁻²+b⁻²)²` at A→0.

---

## 4. THE RECONCILE: is the angle-frame knob pure?

The skeptic's fact (a): at β=1 the δ-dial is a COUPLED (skew, kurtosis) dial — skew +0.99→+0.07
co-moves with exkurt 3.66→0.03. The starting-point observation: in the angle frame, skew = pure
shift φ and shape = pure amplitude A. Both are correct. The reconciliation:

**What is exactly pure** **[VERIFIED-IDENTITY + DERIVED]**:
- The **family coordinates**. δ moves A only; φ, a, b are δ-free functions of (α,β). The δ-dial
  is a one-dimensional motion in the (φ,A) plane along the A-axis with φ pinned.
- The **kernel symmetry**: the log-density along the curve, `−A·cosh(θ−φ)`, is exactly symmetric
  about θ=φ for every A. "Skew = pure shift" is exact **at the kernel level** — the geometric
  object the curve is built from.
- Honesty sub-caveat: the pushforward θ-**measure** (with Jacobian dv = δ·cosh θ dθ) is
  `p_θ(φ+t) ∝ cosh t·e^(−A cosh t)·[1 + tanh φ·tanh t]` — NOT symmetric about φ. The pure-shift
  statement is about the log-density kernel, not about any density's moments.

**What stays coupled — and why, quantitatively** **[DERIVED+CONFIRMED]**: every MOMENT
functional of every pushforward (latent v, price, angular) mixes (φ,A). At fixed φ≠0 the
A-dial traces, in (skew, exkurt) space, the parabola

```
exkurt ≈ skew² · (1+4t²)/(3t²),   t = tanh φ        (ratio → 0.9996 by A≈390)
```

So the skeptic's coupled-dial finding is **exact and untouched**: it is the moment-space shadow
of a one-parameter motion. Not two knobs fighting — one knob whose two moment readouts co-move
because the moment axes are not aligned with the family axes when φ≠0. Moment-purity is
available only at φ=0 ⟺ β=0 ⟺ the FULL fork (settlement-semantics change — both S^(±γ) roots
live; operator tier).

**Answer to the key question** **[FRAMING + OPERATOR-CALL]**: yes, the angle frame is the
coordinate system in which the dial is pure — **as a parameterization fact**. Whether that makes
"the kurtosis knob" honest depends on what "kurtosis" is DEFINED to be, which is exactly the
skeptic's U1 and the operator's call:

- **Object-θ / amplitude reading** (kurtosis := the cosh amplitude, dial 1/A or gear 2/δ): the
  knob is PURE, exact, asymptote-safe. But A is **not the excess kurtosis of any density** — it
  is a shape parameter whose moment shadows are the table in §3.
- **Object-L moment reading** (trader-sense excess kurtosis of the latent return density): the
  impurity FINDING STANDS at β=1 — skew co-moves, per the parabola. A UI label "kurtosis knob"
  in this sense at β=1 without the skew caveat would be dishonest.
- **Pushforward/price reading**: the sign flips (platykurtic) — the established Object-P gotcha,
  unchanged.

So the angle frame **reframes** the impurity finding (it locates the coupling in the moment
coordinates, not in the dial), it does **not dissolve** it. Branch-B's knob is honest **iff
labeled as the amplitude/shape dial** (with its moment shadows stated); it is NOT honest as a
"pure moment-kurtosis knob" at β=1. My recommendation as theory owner (flag, not decision):
define the knob as the amplitude A (UI dial monotone in 1/A), report Object-L moments as the
calibration readout with the co-moving skew shown, never ship "knob up = fatter" (direction
unchanged: fatness = 1/A). Which kurtosis the product means = **operator's U1 sentence**.

---

## 5. Consistency checks (numbers; both β=0 and β=1 throughout)

1. **Collapse identity**: max err 1.5e-38 over (α,β,δ) ∈ {(4,1,.08),(3,1,.3),(4,0,1),(5,2,3),(4,1,30)} × 40 random v. **[VERIFIED-IDENTITY]**
2. **value∝S^(−γ) / wing power-laws preserved at every amplitude**: wing slopes ∓(α∓β) δ-free
   (§2 algebra; numerics at v=±100 across δ=0.08…30, errors = the predicted αδ²/2v²); upper-tail
   local exponent `d log T/dv` → −3 = −γ at γ=3 for δ ∈ {0.08, 0.3, 3} (−2.99992/−2.99881/
   −2.88666 at u=12; convergence slower at larger δ — the O(δ²/v) correction, asymptote itself
   exact). Both β: β=0 slopes ∓α confirmed identically. **[DERIVED+CONFIRMED]**
3. **Esscher tilt in θ**: exact, 8.2e-38 — the value-law mechanism survives every amplitude
   because the tilt is a linear re-aim inside span{cosh, sinh}. **[VERIFIED-IDENTITY]**
4. **Moments** (both β, both γ): §3 table; β=0 reproduces the published 2.6530/1.6885/0.6961/
   0.2472; β=1 reproduces the skeptic's 0.9166/3.2849 (pin) and 3.6644 (endpoint); Bessel-K cgf
   independently reproduces quadrature to 10 digits. **[DERIVED+CONFIRMED]**
5. **Solvency depth (inventory #13, both β)**: X-depth at moneyness 2 = T(ln 2), α=4:
   β=0: 0.0339 → 0.0493 → 0.1111 → 0.2201 across δ=0.08→0.3→1→3 (reproduces REPARAM §3.5);
   **β=1 (engine measure): 0.0845 → 0.1213 → 0.2721 → 0.5630 — a 6.7× swing** (reproduces the
   skeptic's stock-take ~7×). Any shipped amplitude setting re-prices the depth the B1 floor
   rides on. **[DERIVED+CONFIRMED]**; B1 remains extrinsic/operator ship-gate — nothing here
   closes solvency.
6. **Fan-measure edge exponents**: §1.3 — the angular distribution view is numerically exact
   against its derived exponents at both β. **[DERIVED+CONFIRMED]**

### 5.1 Relation to fork branch B (GH δ-unfreeze)

**The cosh(θ−φ) frame is a clean re-coordinatization of branch B — same family, better dial.**
This is an algebraic identity inside one family (the pointwise collapse, 1.5e-38), not a
cross-slot membership claim, so no curve-membership test is owed or invoked. The δ-unfreeze
(vary δ, freeze α,β) **is** the pure-amplitude motion (vary A, freeze a, b, φ). What the frame
adds to REPARAM: the dial coordinates (a,b,A) separate the locked objects (wing slopes = value
law & settlement exponents) from the knob (A) **exactly**, and make the Esscher/value-law
survival a two-line algebra fact (§2). B-MINIMAL = move A at φ≠0 (moment shadows co-move, §4);
B-FULL = first set φ=0 (settlement change, operator tier), then A is moment-pure. Status labels
unchanged: rebase/seam/funding/strike-reg amplitude-invariances remain
**derived-not-engine-verified** (no δ≠0.08 engine has ever been built — skeptic stock-take §4.3).

### 5.2 Relation to fork branch A (the (W) weight-warp)

**Structural parallel, NOT an identity — the broken bridge stays broken.** Exact (W) facts
**[VERIFIED-IDENTITY]**: with its own hyperbolic angle η defined by `ũ = ln(y/x) = τ·sinh η`,

```
(W) log-invariant = w_mid·ln x + (1−w_mid)·ln y − (Δw·τ/2)·cosh η     (checked 9.2e-41)
(W) weight        = w_mid + (Δw/2)·tanh η                              (checked exact)
```

So **both branches are "amplitude × cosh of their own hyperbolic angle"** — GH carries
`A·cosh(θ−φ)` in the latent **log-density (SCORE slot)**; (W) carries `(Δwτ/2)·cosh η` in the
**log-invariant (WEIGHT slot)**, with a tanh-sigmoid weight. The angle frame thus explains both
the temptation behind the refuted "τ≡δ EXACTLY" (same cosh kernel shape) and the breakage
(different slot: log f vs log F — an integral transform apart). The skeptic's curve-level
non-membership (w_eff non-monotone; τ_implied 0.012→2.41; engine wing-weights (1,0) outside
(0,1)) is re-asserted, not relitigated. What honestly transfers across both branches is the
**abstraction**: knob = cosh amplitude in the family's own hyperbolic angle; Gaussian limit =
amplitude→∞; sharp-elbow/Laplace limit = amplitude→0; gear d pinned to 2 by asymptote
preservation (the d-rigidity of §3.3 applies verbatim to (W): replacing its √(τ²+u²) by a
d-power breaks its wing power-laws the same way). Any stronger cross-branch claim would need the
skeptic's w_eff/τ_implied membership test on a constructed curve — none run, none claimed.

---

## 6. Feature-inventory disposition (all 15; per `docs/feature_inventory.md`)

| # | Feature | Disposition |
|---|---------|-------------|
| 1 | Balancer base | **Considered.** The base is where the bridge is fully exact (ũ = log price); base = A→∞/amplitude corner (Gaussian δ→∞, NOT δ→0 — direction preserved). |
| 2 | Curve warp | **Considered.** §5.2: cosh-in-own-angle parallel across SCORE vs WEIGHT slots; broken identity re-asserted as broken; no new membership claim. |
| 3 | Kurtosis knob τ | **Considered (the subject).** Single-d law fails; knob = cosh amplitude A; exact law §3; β=1 numbers given alongside β=0 (skeptic pattern 3 honored). |
| 4 | Carry P=Ny/Nx, u=log p−log P | **Considered.** The θ-frame attaches to the centered/gauge coordinate v (downstream of carry); for branch B nothing changes (same family). (W)'s carry story remains UNKNOWN (stock-take §1.3) — not touched, not claimed. |
| 5 | Rebase | **Considered (branch B only).** (φ, A, a, b) are kernel constants, untouched by the rebase translation; PH-6 legs unaffected. Engine-verification on a built δ≠0.08 engine still owed (label: derived-not-engine-verified). (W) rebase: UNKNOWN, unchanged. |
| 6 | value ∝ S^(−γ) | **Considered.** γ = a = α−β = call-wing slope, an amplitude-free coordinate; preserved at every A — exact algebra + numerics §5.2/§5 item 2. |
| 7 | ITM smooth-pasting | **Considered (lightly).** S\*=Kγ/(γ+1) is γ-only algebra and γ=a is A-free ⇒ the boundary is unmoved by the amplitude dial in form; the SEAM GATE on a built δ≠0.08 engine has never run — open engine check, not closed here. (W) value function: still never constructed (U3). |
| 8 | Uniform strike registration (v26c) | **Considered — open engine check (last time's omission, explicit now).** sNormStrike = getSNorm∘arbitrageToOracle flows through the δ-keyed tail/CDF machinery, so any amplitude change moves sNorm VALUES; crossover@K must be re-verified by `dir_gate.js` on any built δ≠0.08 engine. The angle frame itself proposes no registration change; nothing here establishes survival. |
| 9 | Funding (w=½ anchor, LOCKED) | **Considered — no change proposed (explicit now).** Funding is price-measure, slope-deviation vs the w=½ anchor; the amplitude dial leaves the anchor definition intact for branch B (same family). Its δ-invariance remains REPARAM-derived, engine-unverified. For (W), "the w=½ anchor" remains ill-posed (stock-take) — untouched. |
| 10 | Slippage basis / mpGeom | **Considered (brief).** % basis-independence is the e^μ cancellation — kernel-level, amplitude-orthogonal; no slippage object touched. |
| 11 | Dollar/settlement pipe | **N-A.** Notes-only; no new dollar path; pipe untouched. |
| 12 | THE gotcha (price coord ≠ slope) | **Considered.** The same conflation class threatens here: the latent θ-angle (score slot) vs the reserve-ray angle ψ (reserve slot) are different objects on GH — §1.2 keeps them separated; conflating them is this gotcha's angular twin. |
| 13 | Solvency boundary | **Considered (last time's omission, explicit now).** §5 item 5: amplitude dial moves m=2 wing depth 6.7× at β=1 (0.085→0.563) — bigger than the published β=0 swing. Mechanism visible in the frame: mass migrates along the cosh arms as A falls. B1 floor re-prices at ANY shipped setting; stays extrinsic, operator ship-gate; geometry does NOT close solvency. |
| 14 | Esscher / latent group | **Considered.** Tilt = linear re-aim of (φ,A) in span{cosh,sinh} (exact, §2); conserved object remains the latent one-parameter group — no X·Y/CPMM-analogue description used. |
| 15 | File-safety gate | **N-A (notes-only).** No engine edit; any future knob implementation goes through splice recipe + gates + single-engine-writer policy. |

---

## 7. Flags / escalations (manager to relay; operator-tier where marked)

1. **U1 (operator):** the knob-purity verdict §4 is conditional on what "kurtosis" means —
   amplitude (pure), latent moment (coupled at β=1), price-pushforward (sign flips). One
   operator sentence resolves it; the brainstorm should not proceed past the label without it.
2. **Solvency (operator ship-gate):** 6.7× depth swing at β=1 across the dial (§5.5). Neither
   branch dispositions B1 under a live knob; this note quantifies, does not close.
3. **Engine-verification debt:** all branch-B "unchanged" items (rebase/seam/funding/strike-reg)
   stay derived-not-engine-verified until a δ≠0.08 engine is built and gated (dir_gate, seam
   gate, G4 re-reference).
4. **Monotonicity of exkurt(A)** is grid-confirmed only — if it becomes load-bearing for a UI
   dial, it deserves an analytic proof (plausible via the K₁ cgf; not done here).
5. **No paper claim** is made or implied; the 45°-fan/edge-exponent picture (§1.3) is a candidate
   paper figure but that is the operator's call.

# The live-curve encompassing structure + where the steepness lens m naturally fits

> **═══ SKEPTIC GATE RESULT (a00a14ea, 2026-06-14) — TWO FLAG-OVERSELLs (scope), halt-class on the bare headlines ═══**
> The math is right and manager-verified; the two HEADLINES are scoped too loosely. Binding corrections —
> the bare phrasings may NOT enter shared truth (INDEX/feature_inventory) without these qualifiers, or operator overrule:
> 1. **Task A — NOT "no information geometry."** Only the **CGF / exponential-family / measure-backed-Fisher** reading
>    is dead (μ not globally convex; degenerate boundary zero; Marcinkiewicz — all airtight). BUT info-geometry ⊋ CGF:
>    the Balancer μ IS convex on t≥β, its Legendre dual `μ*(η)=⅔√(αβ)·η^{3/2}+β·η` exists on η>0 ⇒ a **Hessian /
>    dually-flat information geometry SURVIVES without a measure.** Honest headline: *no measure-backed (CGF/Fisher)
>    reading; Hessian/dually-flat info-geometry survives.* Do NOT "drop info-geometric base" flatly.
> 2. **Task B — the Gibbs/inverse-temperature home is the power-law WING, not the whole option value.** `value=S^(−g)`
>    is the wing/asymptote; the engine `markLensed` is a bounded-[0,1] smooth-pasted mark (ratio to S^(−g) measured
>    0.0012–9000), NOT S^(−g) near ATM. The thermal reading is substantive (value_m=(value_1)^m is a real thermal
>    power, not a relabel) but MUST be scoped to the wing. "kurtosis = temperature of the option-value **tail**," not the whole mark.
> 3. **Esscher (CLEAR):** m is a dilation, not a tilt — correct. But ADD a line to feature_inventory #14 distinguishing
>    trade=translation (its existing claim) from the m-knob=dilation; do NOT mark #14 wrong.
> 4. **Labels CLEAR:** conceptual = math-certain not Lean-pinned; Task B.1 Lean (Aristotle ca042134) = submitted/pending,
>    NOT trusted-from-prover. Fold only the QUALIFIED versions, after the Lean returns + audit.
> _(Below is research-lead's original note, gate-flagged on the two headlines above — read the prose B.5/L83-99/L133-134
> through these qualifiers. Manager header, post-gate; research-lead prose unaltered.)_

**Author: research-lead. 2026-06-14 (operator entry 242).** Read-only theory pass on the LIVE object
(plain v24 Balancer + constant-m lens). NOT a HEAD build. Honest labels throughout:
`trusted-from-prover` ≠ `verified`; conjecture ≠ proven; a clean NEGATIVE is a valid result.
Hand to manager for audit + skeptic gate before any fold to shared truth. NO git here.

Supersedes the GH-line info-geo framing for the live curve (see
`DETERMINATION_CORRECTION_GH_vs_Balancer_2026-06-14.md`).

---

## TASK A — what encompassing structure the LIVE Balancer+constant-m object actually has

### A.1 The live object (source-verified: `MonolithConstM.lean`, `PHUnification.lean`)
- invariant `(x−α)(y−β)=αβ`, `x = α·y/(y−β)`
- pool potential `μ(t) = (t−β)³/(3αβ)`
- `price = μ′(t) = (t−β)²/(αβ)`
- `R = μ″(t) = 2(t−β)/(αβ) ≥ 0` ONLY on the operating domain `t ≥ β`
- `μ‴(t) = 2/(αβ)` (constant), `μ⁗ ≡ 0`
- at `t = β`: `μ = 0`, `μ′ = 0`, `μ″ = 0` (fully degenerate point)
- lens `g_loc = m·γ` rides on top (calibration field; pool is m-independent, operator-locked).

### A.2 SOLID (proven, trusted-from-prover) — convex/Hessian-potential port-Hamiltonian object
`price = ∇μ` (`price_is_grad`) and `R = ∇²μ ⪰ 0` on `t≥β` (`R_psd`) are proven in
`MonolithConstM.lean` and welded into `PHUnification.lean` (the curvature term IS the geometric PSD
witness). This much is **folded trusted-from-prover** and stands for the live curve. The
PH-cotangent-lift / `ω≡0` / "not metriplectic" structural points carry over unchanged (they are
1-D-base facts, curve-agnostic). NOTHING below retracts this.

### A.3 NEGATIVE RESULT (the honest answer to "any info-geo / CGF / exponential-family reading?")
**No. The live Balancer pool potential has NO genuine cumulant-generating-function /
exponential-family / information-geometric reading. The info-geo reading was GH-line only.** Three
independent reasons, each sufficient:

1. **Not globally convex ⇒ not a CGF.** A CGF is convex on its entire (interval) domain through the
   origin. `μ″ = 2(t−β)/(αβ)` is **negative for t<β** — μ is concave below β. A CGF is never concave.

2. **The would-be origin is fully degenerate.** A CGF `K` has an interior point (the natural origin)
   where `K=0`, `K′=mean`, `K″=Var>0` for any non-degenerate law. The ONLY point where the Balancer
   cubic vanishes is `t=β`, a triple root, where simultaneously `μ=μ′=μ″=0`. Zero variance = point
   mass = degenerate; and it sits at the domain BOUNDARY, not an interior origin. So even restricted
   to the convex branch `t>β` there is no admissible CGF origin.

3. **Marcinkiewicz's theorem (the decisive nail).** As a putative CGF, μ's cumulants are
   `κ₁=μ′, κ₂=μ″, κ₃=μ‴=2/(αβ) (const ≠ 0), κ₄=κ₅=…=0`. A cumulant sequence that terminates at
   order 3 with `κ₃≠0` is **not the cumulant sequence of any probability measure** (Marcinkiewicz:
   a polynomial CGF must have degree ≤ 2 = Gaussian; the only finite-order CGF is the quadratic).
   μ is a genuine cubic polynomial in t, so no measure on ℝ has CGF μ — globally OR on any
   sub-interval (the cumulants are the same constants at every expansion point, so a local CGF would
   extend to the forbidden global polynomial CGF). **There is no exponential family behind μ.**

**Contrast with the demoted GH line (why the reading existed there):** the GH-line object used
`ProbabilityTheory.cgf X μ` of a genuine GH probability MEASURE (`CgfClean.lean` / GHmeasure):
convexity via `convexOn_of_deriv2_nonneg` over the integrable-exponent domain, and
`deriv²(cgf)=∫(X−mean)²·e^{tX}/mgf = Var = Fisher ≥ 0`. That is real info-geometry — but it lives in
the GH CGF, a DIFFERENT μ from the Balancer cubic. Demoting GH (entry 28) removed the measure; the
cubic that replaced it is a Hessian convex potential on a half-line, **not** a log-MGF.

### A.4 Task-A determination (honest headline for the live curve)
> The live object is a **convex- / Hessian-potential port-Hamiltonian object on the Balancer
> constant-product curve** (`price=∇μ`, `R=∇²μ⪰0` on `t≥β`; PH = forced cotangent lift; base ω≡0,
> NOT metriplectic). It has **NO cumulant-generating-function / exponential-family /
> information-geometric reading** — that was GH-line baggage, false for this curve (3 independent
> reasons; Marcinkiewicz decisive). "Information-geometric base" must be DROPPED from the live-curve
> headline; replace with "convex-Hessian-potential base + PH lift."

This is a *clean negative* on the info-geo claim and a *positive* on the Hessian-PH claim. Both honest.

---

## TASK B — where the steepness lens m naturally fits (instead of being bolted on)

HARD CONSTRAINT respected: the POOL curve stays plain v24, m-independent (m=1 ⇒ plain). A natural
home for m must NOT reopen the pool curve. The pool μ stays untouched in every option below.

### B.1 THE NATURAL HOME — m is an inverse-temperature of the OPTION-VALUE Gibbs weight (POSITIVE)
The option-value wing law is the power law `value(S) ∝ S^(−g)` with `g = m·γ` (constant in strike).
Write it on the **log-price axis** `q = log S` — which is exactly the live object's own `carry`
coordinate (`carry := Real.log price`, `MonolithConstM.lean` L28). Then

```
value(S) = S^(−g) = e^(−g · q) = e^(−β_T · q),   β_T := g = m·γ.
```

This is a **Gibbs / Boltzmann weight** `e^(−β_T·E)` with "energy" `E = q` (log-price) and
**inverse-temperature `β_T = g = m·γ`.** Consequences, all intrinsic to the option-value layer and
requiring ZERO pool-curve change:
- **m is a thermal multiplier:** baseline inverse-temperature `β_T,0 = γ` (m=1); the lens runs the
  *same power-law family at a different temperature* `m·γ`. Bigger m = colder = steeper everywhere
  (matches the operator's "steeper everywhere" polarity for constant-m).
- **m is a thermal POWER:** `value_m(S) = (value_1(S))^m` exactly (`S^(−mγ) = (S^(−γ))^m`). Raising
  a Gibbs weight to the power m is precisely rescaling its inverse-temperature by m. So m is not a
  multiplier glued on the side — it is the canonical one-parameter thermal deformation of the
  baseline option-value distribution.
- **This RESURRECTS the operator's entry-135 "free energy" thread — for the right layer.** The
  free-energy/Gibbs reading that DIED for the pool (Task A) is genuinely ALIVE for the option-value
  layer, where the power law really is a Boltzmann weight and m really is (relative inverse-)
  temperature. The lens has an intrinsic thermodynamic home; it just is NOT the pool's.

**Why it's "separate" from the pool — and why that's CORRECT, not a defect:** the pool curve and the
option-value curve are two different objects (pool = reserve geometry, m-independent by lock;
option-value = the read/settlement power law). m is intrinsic to the SECOND. The lens reads as
"separate" only because it belongs to the option-value object, which is genuinely a distinct layer.
Making m intrinsic to the POOL would require reopening the locked pool curve — see B.4.

### B.2 Esscher tilt — NEGATIVE (corrects feature-inventory #14 for the live curve)
An Esscher tilt is a **translation** of the natural parameter: `e^{h·q}·e^{−γ·q} = e^{−(γ−h)·q}`,
i.e. exponent `γ → γ − h` (additive). The lens does `γ → m·γ` (**multiplicative**). To force m·γ by a
tilt you'd need `h = (1−m)·γ`, a tilt whose strength is itself ∝ γ — that is NOT a fixed Esscher
tilt of a fixed base law; it is a **dilation** of the natural parameter. So **m is a scaling
(dilation) of the natural parameter, NOT an Esscher tilt.** Feature-inventory #14's Esscher-tilt
intuition does not fit constant-m. (It fit the demoted GH trade-as-translation; it does not fit m.)

### B.3 Legendre / Hessian dual reparam — INTRINSIC ONLY VIA A SEPARATE POTENTIAL, not the pool
The pool Hessian `1/μ″ = αβ/(2(t−β))` is m-independent (pool is locked). So m cannot live in the
pool's value-metric/dual without reopening the curve. m DOES sit naturally as the shape parameter of
a SEPARATE option-value potential: with `Ψ_m(S) = S^(1−mγ)/(1−mγ)`, `Ψ_m′(S) = S^(−mγ) = value`, and
`Ψ_m″` carries exponent `−mγ−1`. m is a genuine deformation parameter of THIS (option-value)
potential family — the same conclusion as B.1, in Legendre language: m is intrinsic to the
option-value Hessian, never the pool Hessian.

### B.4 The ONE home that WOULD require reopening the pool — FLAG to operator, NOT done
If the operator wanted m intrinsic to the POOL object itself (so the pool curve, price, R, trade,
rebase all carry m), the natural construction would be to deform the pool generator
`μ → μ_m` so that the pool's own convexity exponent becomes m·γ — e.g. a power/Balancer-weight
deformation of the constant-product invariant. That **changes the pool curve at m≠1**, violating the
entry-229/231 lock (m=1 ⇒ plain v24, lens ≠ pool change). **This is an operator-tier curve decision.
I am NOT doing it. FLAGGED:** making m intrinsic to the *pool* (rather than the option-value layer)
requires reopening the locked pool curve — an operator call via the manager.

### B.5 Task-B determination
> **m has a genuine natural home: it is the inverse-temperature (thermal power) of the option-value
> Gibbs weight `value = e^(−(m·γ)·q)` on the log-price/carry axis.** It is intrinsic to the
> OPTION-VALUE / settlement layer (also expressible as the shape parameter of the option-value
> Legendre potential `Ψ_m`), with NO change to the locked pool curve. It is **NOT** an Esscher tilt
> (that's a translation; m is a dilation). It is intrinsic to the pool ONLY IF the pool curve is
> reopened — an operator-tier decision, flagged not taken. So: the lens is "separate" from the pool
> *correctly* — it belongs to a different (option-value) object — but within that object it is a
> canonical thermal coordinate, not a bolt-on multiplier.

---

## What is proven vs conjecture vs negative (provenance)
- **NEGATIVE (re-derived, hand + sympy, robust):** no CGF/exponential-family/info-geo reading for the
  live Balancer pool (Task A.3). Math-level certain (Marcinkiewicz + degeneracy + non-convexity);
  not a Lean theorem (it's a non-existence statement about measures — stated, not Lean-pinned).
- **PROVEN trusted-from-prover (pre-existing):** `price_is_grad`, `R_psd` (convex-Hessian-PH base),
  `g_eq_m_gamma`, `g_const_in_strike` (MonolithConstM, audited).
- **SUBMITTED to Aristotle this pass (Task B.1 thermal identities), pin-complete:**
  prompt `formal/prompts/aristotle_prompt_lens_thermal_home.md` → `RequestProject/LensThermal.lean`:
  `value_is_gibbs` (S^(−g)=e^(−g·log S)), `value_pow_m` (value_m=value_1^m), `m_one_recovers_base`,
  `invtemp_eq_m_gamma`, `invtemp_mono`. STATUS at write-time: **submitted, pending return + audit —
  NOT trusted-from-prover yet.** (run/task ids in MEMORY.) These are clean rpow/exp identities; the
  CONCEPTUAL finding (m = inverse-temperature) stands on the hand math regardless of the Lean return.
- **CONJECTURE / not pursued:** m intrinsic to the pool (B.4) — needs a curve reopen (operator-tier).

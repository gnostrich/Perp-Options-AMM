# A weight-free polar liquidity-depth distribution with native skew + kurtosis knobs — first-principles

> **⚠ SUPERSEDED 2026-06-13 (operator entry 229/230).** The polar `√(τ²+u²)` density/kurtosis
> construction is no longer the lens: kurtosis is now a CONSTANT slope multiplier `m` (skeptic-
> pinned `g_loc = m·γ`). Kept for history. Current object:
> `notes/research/CONSTANT_M_lens_object_sync_2026-06-13.md`.


_research-lead, 2026-06-11. Operator **entry 53/54** ("do the needful"). **READ-ONLY (operator-pinned):
NO engine edit, NO git, NO build touch, NO Aristotle submission.** HEAD stays untouched (md5 `928cde1c`).
Decision-support, not a build. Builds on `NATURALNESS_polar_kurtosis_map_2026-06-11.md`,
`FMI_hyperbolic_alts_and_shoulder_localisation_2026-06-11.md`,
`CURIOSITY_B_warp_proportional_notional_2026-06-11.md`,
`BRAINSTORM_B_per_notional_slippage_2026-06-11.md`, and the (W) construction in HEAD
(`wField`/`getMP_raw`/`tradeUpdate`/`arbitrageToOracle`). Tags: `[analytic]` derived, `[numeric]`
float64/sympy-checked. Scripts `/tmp/polar53{,b,c,d}.py` transcribed at the end._

> **Operator framing (entry 53, verbatim):** "dont be married to the current thing, think from first
> principles as a liquidity (relative radius) distribution that is native to living in the polar ray
> co-ordinates which has natural skew and kurtosis knobs --- and we just want a natural map from x and y
> to the skew knob (maybe dont even need weights then idk,)"

---

## VERDICT IN ONE BREATH

The operator's object is **(a) well-posed**, **(b) genuinely able to give kurtosis ⊥ skew — the one
thing (W) structurally cannot** (its τ is welded to the wing gap Δw), **(c) weight-eliminable ONLY under
spot/reserves anchoring (the entry-38 "B" mechanic); under trade-point anchoring (path A, the operator's
already-chosen mechanic) a reseat scalar — the weight in disguise — reappears**, and **(d) arbitrage-sane
(strictly monotone price under an explicit threshold) but its curve invariant is closed-form
*transcendental* (log-cosh + sech²), NOT the closed-form *algebraic* `√(τ²+u²)` of (W)** — so it forfeits
the entry-41 integrability tiebreak that singled out the √-kernel. **The ONE hardest open obstruction:
weight-elimination and the operator's chosen warp mechanic (path A) are in direct tension** — A *requires*
a curve-location reseat, which is exactly the stored scalar "no weights" was meant to remove.

---

## 1. THE OBJECT, MADE PRECISE

### 1.1 Coordinates and numeraire `[analytic]`

Polar ray angle θ ∈ (0, π/2). A curve point on ray θ at radius r(θ): **x = r(θ)·cos θ, y = r(θ)·sin θ.**
The reserve ratio is **y/x = tan θ**; the **log-price ray** is

> **u = ln(y/x) = ln tan θ.**

ATM/spot is **θ = 45° ⟺ y/x = 1 ⟺ u = 0** — the no-tilt ray where the marginal price equals oracle, in
the **carry-normalised** numeraire (carry P = Ny/Nx folded into the price leg `q = ln p`, exactly as
CLAUDE.md §4 and the carry-pass note require; on a generalised-Balancer curve, work in `q`, not raw `y/x`).
**The angle θ is bounded (0, π/2) but u is NOT** — `u = ln tan θ` maps the open quadrant onto the *full*
price ray (−∞, +∞). So the "polar" frame is a re-chart of the price ray, not a truncation of it. This
matters for the carry discussion (§5).

**Numeraire choice (justified, load-bearing):** "relative radius" / depth must be quoted in a definite
unit because depth-in-BTC, depth-in-USD, and depth-in-ray-value differ by a price factor. The natural one
is **depth on the log-price ray u** (equivalently, per unit hyperbolic-rapidity), because (i) it is the
additive parameter of the multiplicative x↔y rescaling (the rapidity, per the entry-41 lens), (ii) it is
carry-gauge-covariant (a rebase P→P/r is a *shift* in u, so depth-in-u transforms rigidly), and (iii) it
is the coordinate in which the (W) weight field and the value-law exponent are both already written. Depth
quoted in raw BTC or USD carries a spurious e^u / price factor that is just the numeraire, not shape.

### 1.2 Depth g(θ), the value law, and the reconstruction r(θ)←g `[analytic]`

"Liquidity depth at angle θ" = **the v3-style density of liquidity per unit log-price**,
`g(u) := dL/du`. On a strictly-convex 2-asset curve this is tied to the local convexity: the **local
value-law exponent**

> **γ_loc(u) := −d ln(value)/d ln S = (the slope field) = d(ln depth-potential)/du**

is the object that (i) the value law `value ∝ S^(−γ_loc)` reads off directly (Reading A, operator-locked
entry 11), (ii) the marginal price is built from, and (iii) the depth is the exponential of. Concretely
the **price law** and the **invariant** are

> **p(u) = γ_loc(u) · e^u**  (the (W) `getMP_raw` form, with `g_loc = w/(1−w)` replaced by the
>   density-defined γ_loc),
> **ln F(x,y) = ∫ γ_loc(u) du** in the exponent — the curve level set, the reconstruction r(θ)←γ_loc.

So the curve is **fully reconstructed from the single shape function γ_loc(u)** (equivalently g, its
exponential): pick γ_loc, integrate to get F, intersect with the ray θ to get r(θ). This is the cleanest
"define the object" answer: **the primitive is the local-exponent / depth field γ_loc(u); everything
(price, curve, value) is a readout of it.**

---

## 2. THE TWO KNOBS, MADE ORTHOGONAL `[analytic + numeric]`

Write the shape field as wing-pinned + even (kurtosis) + odd (skew):

> **γ_loc(u) = γ₋ + (γ₊−γ₋)·½(1 + tanh κu)  +  skew · tanh(κu)/cosh²(κu)**

- **Frozen power-law wings (corner-pinned):** u→+∞ ⇒ γ_loc→γ₊ (call exponent); u→−∞ ⇒ γ_loc→γ₋ (put
  exponent), **for every κ and every skew** `[numeric, /tmp/polar53.py]` — exact to float64 across
  κ∈{0.5,1,3}, skew∈{0,±}. **The corners pin γ₋, γ₊; the kurtosis knob does NOT move them.** Both must be
  **> 1** to honour the γ>1 lock (two possibly-distinct exponents, put-side and call-side — exactly the
  asymmetric-w settlement fork the heterogeneous-weight note flagged, now read as the two corners of g).
- **Kurtosis = the even part of ln g** (ATM peak concentration `d²ln g/du²|₀ ∝ −κ`), **skew = the odd
  part** (tilt). **L2-orthogonal on the symmetric domain** (`<even,odd> ≈ 5e-12 … 1e-11` = machine-zero
  by parity, `/tmp/polar53.py`) ⇒ **independently tunable.**

### 2.1 KURTOSIS AT ZERO SKEW — the thing (W) cannot do `[numeric]`

Set skew = 0 **and** symmetric wings γ₋ = γ₊ (zero wing gap). The even concentration still has a live dial:

```
symmetric wings gamma=2.5, skew=0:
  kappa=0.5: d2 ln g/du2|ATM = -1.25
  kappa=1.0:                 = -2.50
  kappa=2.0:                 = -5.00
  kappa=5.0:                 = -12.50      (sharper ATM peak as kappa rises; wings frozen)
```

**A symmetric-but-leptokurtic smile EXISTS in the polar object.** Contrast (W) directly: there the
elbow sharpness is `w′(0) = Δw/(2τ)`, so **at Δw = 0 (zero skew gap) τ is literally inert** — the elbow is
flat regardless of τ (manager-verified this session). **(W) welds kurtosis to the wing gap; the polar
object decouples them.** This is the decisive (b)-answer: **yes, the polar object delivers kurtosis ⊥
skew that (W) structurally cannot.**

---

## 3. THE WEIGHT-FREE RESERVE→SKEW MAP (the operator's specific ask)

### 3.1 The map and the static/dynamic split `[analytic + numeric]`

The operator asked: can the *dynamic* skew be the geometry of the reserve point itself, with no stored
weight w? **Yes — the dynamic skew is the reserve tilt off the 45° ray:**

> **skew_dynamic = u_R = ln(y/x)**  — a pure function of (x,y), no stored scalar.

This is **not** the same object as the *static* frozen skew. Two distinct things (the distinction the
manager drew for the operator):

- **STATIC frozen skew = γ₋ vs γ₊ gap** — a setup constant, set once for vol, **must not move on trades.**
- **DYNAMIC tilt = u_R = ln(y/x)** — which way the live smile currently leans; **this is what (x,y)
  carries.** A trade moves it.

`/tmp/polar53d.py` confirms the dynamic recenter is a **rigid translation of g in u** (asymmetry about the
*moving* ATM is translation-invariant: +0.6470 at every center), while **relative to the structural 45°
ray it reads as a genuine tilt** (asymmetry about fixed u=0 runs +0.647 → +0.399 as u_R: 0 → 0.8). **This
is exactly the (W) field-center φ semantics** — φ recentres the same shape; a trade moves it. So the
operator's instinct is right: the dynamic skew is geometry of the reserve point, no weight field needed to
*name* it.

### 3.2 The trade rule and what it conserves `[numeric]`

A cash leg dy moves y → y+dy along the curve; x follows from keeping the curve **level F = k** invariant
(the point stays on its own curve). This is a **well-posed ODE** `dx = −dy/p(u)`, path-independent —
`/tmp/polar53b.py` integrates dy = 0.8 and converges with step count (N=100→10000: x = 9.7722→9.7724,
y=12.8 exact). **What it conserves:** the **shape** of g (γ₋, γ₊, κ — all central moments are
translation-invariants: `/tmp/polar53b.py` shows var and excess-kurtosis invariant under recenter) plus
the **curve level F = k**; the single **dynamic d.o.f. is the recenter u_R**. This is the density-frame
analogue of the (W) α = x·w, β = y·(1−w) conservation — there the invariants are (α,β); here they are
(F-level, shape), and the moving coordinate is u_R instead of the stored φ.

### 3.3 Monotonicity / arbitrage-sanity `[analytic + numeric]`

Price `p(u) = γ_loc(u)·e^u` is **strictly monotone (no arbitrage) ⟺ γ_loc(u) + γ_loc′(u) > 0 for all u.**
`/tmp/polar53b.py`:

| setting | monotone? | min(γ_loc + γ_loc′) |
|---|---|---|
| κ=1, skew=0 | YES | +1.800 |
| κ=5, skew=0.95 | YES | +1.067 |
| **κ=8, skew=1.5** | **NO (arb!)** | **−0.789** |

**Kurtosis κ alone never breaks monotonicity** (γ_loc ≥ γ₋ = 1.8 > 0 dominates — at skew=0, the threshold
stays +1.8 for κ up to 20). **Skew breaks it past a bound** (`γ_loc′(0) ≈ (γ₊−γ₋)·κ/2 + skew·κ`; large
|skew| forces γ_loc below 0 or the sum negative). So the polar object is arb-sane with an **explicit
skew-magnitude guard** — the analogue of (W)'s wing-range guard `|t|<1`, but now a *closed inequality*
`γ_loc + γ_loc′ > 0` rather than a band on a stored weight.

### 3.4 Closed-form vs quadrature — and where it breaks `[analytic, sympy]`

The invariant `ln F = ∫ γ_loc du` is **closed-form but transcendental** for the tanh-blend:

> **∫ base du = γ₋·u + (γ₊−γ₋)/(2κ)·ln(1 + tanh κu)**  (a softplus / log-cosh form — sympy `/tmp/polar53c.py`)
> **∫ skew-term du = −skew/(2κ)·sech²(κu)**  (elementary, sympy-verified via d/du[−1/(2κcosh²)] = (1/κ)tanh/cosh²)

So a **closed form exists** (both pieces integrate), but it is **transcendental, not algebraic** — unlike
the √-kernel's `∫ = √(τ²+u²)` (the unique *algebraically*-integrable member, the entry-41 tiebreak). **If
you instead build the polar density with the √-kernel shoulder** (γ_loc = w/(1−w), w = √-kernel sigmoid),
you recover the algebraic invariant — **but then you are back to (W)** (see §4). **Closed form holds for
the whole family; the *algebraic* closed form holds only at the √-kernel member, which is (W).** The
arbitrage inversion `arbitrageToOracle` is **bisection/quadrature** for any non-√-kernel shoulder (no
elementary inverse of `γ_loc(u)e^u = oracle`), exactly as the (W) engine already does.

---

## 4. NEW OBJECT, OR A RE-CHART OF (W)? `[analytic + numeric]`

**The polar density family properly CONTAINS (W).** (W)'s γ_loc = w/(1−w) with the √-kernel weight is
**one specific monotone, positive interpolation** between γ₋ and γ₊ (`/tmp/polar53c.py`: w₋=0.60,w₊=0.78
⇒ γ₋=1.50, γ₊=3.545, a valid member). The polar family admits **any** monotone γ_loc shoulder (tanh-blend,
√-kernel, erf, …) **with κ freed from the wing gap.** So:

- **Containment:** polar ⊃ (W), **properly.** (W) = the √-kernel-shoulder member.
- **Irreducible shape DOF — manager's claim CONFIRMED, count = 3:** {γ₋, γ₊, κ} = {level (avg), skew-gap
  (diff), kurtosis (peak)} = **level / skew / kurtosis, can't be beaten.** (W) also has 3 nominal params
  {w_mid, Δw, τ} — **but its kurtosis dial τ is welded to the skew-gap Δw** (w′(0)=Δw/2τ ⇒ at Δw=0, τ
  inert), so it has effectively **2 independent shape dials when you demand kurtosis-at-zero-skew.** **The
  win is not the count (both are 3) — it is the DECOUPLING.** The polar object spends its 3 orthogonally;
  (W) welds two of them.
- **Are weights eliminable?** **Conditionally — and this is the crux (see §6).** Under **spot/reserves
  anchoring** (the entry-38 "B" mechanic), the dynamic skew is u_R = ln(y/x) read straight off the
  reserves, **no stored scalar** — weights genuinely eliminated. Under **trade-point anchoring (path A,
  the operator's chosen build mechanic)**, the reseat scalar (the (W) `z = t·τ/√(1−t²)`, equivalently a
  stored φ ≠ u_R) **reappears** — it is precisely the curve-location gearing A needs. **The weight comes
  back as the reseat d.o.f.** So weights are eliminable iff the venue accepts spot-anchored (impact-by-
  size) warp; they are NOT eliminable under the location-geared (paper σ_B) warp A.

---

## 5. HONEST CARRY — bounded support, the floor, and the locked contracts

### 5.1 The deep-strike floor (intrinsic, not a bug) `[analytic]`

θ ∈ (0, π/2) is open, so g(θ) > 0 at every angle ⇒ **every strike carries nonzero liquidity DEPTH** (a
floor; no strike is ever "free"). But `u = ln tan θ` covers the **full** price ray, and the **value/mark ~
S^(−γ₊) → 0** far OTM (γ₊ > 1) is unaffected — **depth ≠ premium.** So the floor is on *depth* (defensible:
the AMM quotes liquidity at all strikes), while the value law `value ∝ S^(−γ) → 0` far-out **still holds**.
**This is not a violation of the lock — it is a depth floor coexisting with a vanishing premium**, which
is a defensible settlement reading (a deep-OTM option has ~0 premium but the pool still has depth there).
**Whether to expose/charge that floor is operator-tier — flagged, not decided.**

### 5.2 Locked-contract transfer table (skeptic will check this — `docs/feature_inventory.md`)

| contract / inventory item | transfers unchanged? | what needs re-derivation in the density frame |
|---|---|---|
| #4 carry P = Ny/Nx | reserve-anchor YES | the coordinate is `q = ln p`, NOT `u = ln(y/x)` (carry-pass finding); depth must be quoted in `q` — same caveat as (W), not a new problem |
| #5 rebase | NO (re-derive) | P→P/r = shift in u; recenter u_R must commute — same OPEN warp∘rebase lemma as (W) |
| ITM smooth-pasting (Reading A) | YES (definitional) | S* = K·γ_loc/(γ_loc+1) with γ_loc = the density local exponent at the strike — immediate from §1.2, Reading-A locked entry 11 |
| #9 funding | NO (re-derive) | anchor = price-anchor p=P (reserve-anchor vs weight-anchor decouple off ATM — carry-pass) |
| #11 dollar pipe | YES (reuse) | settlement chain unchanged (CLAUDE.md §4 hard-stop) |
| #16 trades-warp | RE-DERIVE | the recenter trade rule (§3.2); weight-free only under B-anchoring (§4) |
| value ∝ S^(−γ), γ>1 | YES if BOTH γ₋,γ₊ > 1 | two corner exponents; the asymmetric-w settlement fork applies (both S^(±γ_±) live if γ₋≠γ₊) |

**Net:** the same contracts that were OPEN/non-transferring for (W) (carry-coordinate, rebase-commute,
funding-anchor, warp∘rebase) are **OPEN here too — the density frame does not fix them, but does not make
them worse.** ITM smooth-pasting and the dollar pipe transfer cleanly. Nothing new is discharged.

---

## 6. THE ONE HARDEST OPEN OBSTRUCTION (the crisp verdict)

**Weight-elimination and the operator's already-chosen warp mechanic (path A) are in direct tension.**

- The operator's "maybe don't even need weights" is **achievable** — but only under **spot/reserves
  anchoring** (entry-38 "B": impact ∝ size, dynamic skew = u_R read off (x,y), no stored scalar).
- The operator has **already chosen path A** (trade-point anchoring, paper-faithful σ_B, entry 38) for the
  build. Under A, a **reseat scalar reappears** (the (W) `z`, or a stored φ ≠ u_R) — it is the
  curve-location gearing A is *defined* by. **That reseat IS the weight in disguise.**

So the polar object answers (b) decisively (kurtosis ⊥ skew, which (W) cannot give) and answers (c)
honestly (weight-free under B, not under A). The genuinely hard question for the operator is not "is the
density well-posed" (it is) but: **does the venue want B (weight-free, impact-by-size, kurtosis⊥skew) or A
(location-geared σ_B warp, which re-introduces the reseat/weight)?** — and the cost of the polar object's
kurtosis⊥skew decoupling is the **loss of the √-kernel's algebraic invariant** (it becomes
closed-form-transcendental, bisection inversion — which the engine already does anyway). **This A-vs-B
re-fork, now sharpened to "weight-elimination requires B," is operator-tier — flagged, not decided.**

---

## 7. ANSWERS TO THE FIVE POSED QUESTIONS (index)

1. **Well-posed object?** YES — primitive = the local-exponent/depth field γ_loc(u) on the log-price ray
   u = ln tan θ; curve reconstructed by `ln F = ∫γ_loc du`; numeraire = depth-per-log-price (carry-gauge
   covariant). §1.
2. **Two orthogonal knobs?** YES — even part of ln g = kurtosis κ, odd part = skew; L2-orthogonal
   (machine-zero), independently tunable; wings frozen at corners γ₋, γ₊ (κ does not move them);
   **kurtosis-at-zero-skew works** (the (W)-impossible symmetric-leptokurtic smile). §2.
3. **Weight-free reserve→skew map?** skew_dynamic = u_R = ln(y/x) (no stored w); trade = recenter along
   the curve level (well-posed ODE, conserves shape + F-level); price strictly monotone iff
   γ_loc + γ_loc′ > 0 (explicit arb guard); invariant **closed-form transcendental** (log-cosh + sech²),
   bisection inversion. §3.
4. **New object or re-chart of (W)?** Polar family **properly contains** (W) (= its √-kernel-shoulder
   member); 3 irreducible shape DOF {γ₋,γ₊,κ} = level/skew/kurtosis (manager's count confirmed); the win
   is **decoupling**, not count; weights eliminable under B-anchoring, re-enter under A-anchoring. §4.
5. **Honest carry?** Deep-strike depth floor is intrinsic (depth ≠ premium; value law intact, defensible
   settlement reading, operator-tier); carry/rebase/funding/warp∘rebase OPEN here as for (W) (frame
   doesn't fix them, doesn't worsen them); ITM smooth-pasting + dollar pipe transfer clean. §5.

**Crisp final verdict:** (a) well-posed ✓; (b) kurtosis ⊥ skew that (W) can't ✓ (the headline win);
(c) weight-eliminable **only under spot-anchoring B**, not under the operator's chosen trade-point A;
(d) arb-sane with explicit guard ✓ but closed-form **transcendental** (loses the √-kernel algebraic
tiebreak). **Hardest obstruction: weight-elimination ⟺ B-anchoring, which contradicts the already-chosen
path-A warp mechanic — an A-vs-B / weights-or-no-weights re-fork that is operator-tier.**

---

## Honest carry (unchanged)

Theory/decision-support only — **NOT** a build authorization, **NOT** a curve-swap proposal. HEAD stays
md5 `928cde1c`. The `(α,β)`-flow lemma remains `[needs-Aristotle]`/OPEN (numeric-faithful only);
warp∘rebase-commute and φ-anchor/funding remain OPEN (and apply to the density frame too). The curve/
invariant choice and the A-vs-B / weight-elimination fork are operator-tier — flagged, not decided.
**Nothing submitted / built / edited / committed.** No clean Lean lemma crystallised that is ready to
submit (the monotonicity inequality `γ_loc+γ_loc′>0` and the recenter path-independence are candidate
obligations, but only after the operator picks the mechanic — premature to pin). Manager re-derives +
routes through the skeptic before relaying to the operator.

---

## Scripts (transcribed)

- `/tmp/polar53.py` — frozen-wing corner test (γ₋,γ₊ κ/skew-invariant); even/odd L2-orthogonality of
  ln g (machine-zero); kurtosis-at-zero-skew (symmetric leptokurtic smile, d²ln g/du² ∝ −κ).
- `/tmp/polar53b.py` — corrected positive-exponent price law p(u)=γ_loc(u)e^u; monotonicity threshold
  γ_loc+γ_loc′>0 (κ-robust, skew-bounded); recenter trade ODE (path-independent, converges with N;
  shape moments invariant); sympy base-integral (log-cosh, transcendental).
- `/tmp/polar53c.py` — skew-term integral (sech², elementary); DOF count + (W)-containment; bounded-
  support depth floor vs value-law.
- `/tmp/polar53d.py` — recenter = rigid translation (Reading-2 invariant) reading as tilt about the
  fixed 45° ray (Reading-1); weight-eliminability conditional on B-anchoring vs A-anchoring.

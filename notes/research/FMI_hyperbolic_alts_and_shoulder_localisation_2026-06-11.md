# Hyperbolic alternatives + what governs the shoulder's localization — FMI

_research-lead, 2026-06-11. Operator entry 42. **READ-ONLY / FMI / understanding only — operator
verbatim: "not trying to change anything."** NO engine edit, NO git, NO build touch, NO Aristotle
submission. Operator is live-playing HEAD `1eebfcd6`; build path A paused. Notes-only; builds on
`notes/research/NATURALNESS_polar_kurtosis_map_2026-06-11.md`. Scripts transcribed at the end
(`/tmp/fmi42.py`; companion `/tmp/shoulder.py`, `/tmp/naturalness{,2}.py`; python float64 + scipy).
Tags: `[analytic]` derived, `[numeric]` float64-checked. **This is NOT a proposal to change the curve.**_

> ⚠ **CORRECTION HEADER (manager, 2026-06-11, post-skeptic).** Two skeptic re-derivations
> (`notes/skeptic/VERDICT_FMI42_shoulder_pinning_2026-06-11.md` and
> `notes/skeptic/VERDICT_FMI_shoulder_pinned_vs_underdetermined_2026-06-11.md`) flag the entry-42
> shoulder-pinning argument below. **Two corrections override the body text:**
> 1. **FLAG-WRONG — the soft-side "costs the algebraic invariant" claim is FALSE.** `∫ s_p du` for
>    `s_p = u/(τ²+u²)^p` is **elementary-algebraic for every rational `p≠1`** (p=¼ → ⅔(τ²+u²)^¾;
>    p=¾ → 2(τ²+u²)^¼; only p=1 logs). The real soft-side blocker is the **wing DIVERGING**
>    (`s_p ~ u^{1−2p} → ∞` for p<½ ⇒ no frozen wing at all) — the frozen-wings contract, not
>    algebraicity. The p-sweep "transcendental invariant" column for p<½ is wrong.
> 2. **FLAG-OVERSELL — "two-sided pinned → √-kernel UNIQUE" over-reads a tautology.** The `s_p` pin
>    is the frozen-wings requirement restated (p=½ is the only frozen-wing member of that one slice)
>    + monotonicity (a redundant second symptom of the same collapse on the sharp side). Across the
>    real shoulder-SHAPE family `{√-kernel, tanh, erf, gudermannian}` (all valid frozen-wing 1-knob
>    sigmoids), the shoulder is **UNDER-DETERMINED** — entry-41's standing frame. √-kernel is
>    **selected** on tiebreaks (gentlest divergence + algebraic `√(τ²+u²)` invariant = polar-lens
>    closure), **not compelled.** Read the body's "pinned/unique" language as that tiebreak, not a law.

---

## The object under discussion

Our map is a weight field `w(u) = w_mid + (Δw/2)·s(u/τ)` with `u = ln(y/x)` the log-price ray and
`s` an odd sigmoid, `s(0)=0`, `s′(0)=1`, `s(±∞)=±1`. Currently `s` = the **√-kernel**
`s(x)=x/√(1+x²)`, equivalently `w(u)=w_mid+(Δw/2)·tanh η` with the **hyperbolic angle**
`η=asinh(u/τ)` (`u=τ·sinh η`, amplitude `∝ τ·cosh η = √(τ²+u²)`). Every such `s` gives **frozen
power-law wings** (`s(±∞)=±1 ⇒ w→w_± ⇒ wing exponent γ_±=w_±/(1−w_±)`, τ-independent) and **one
static knob τ** (elbow width, ATM sharpness `w′(0)=Δw/2τ`). The candidates differ only in the
**shoulder** — the transition from the rounded elbow to the frozen wing.

## Answers in one breath

- **Q1.** The hyperbolic-flavored constructions split into three classes: **(i) re-coordinatizations of
  our curve** (cosh/`tanh η` IS our curve — same object, a chart, not an alternative); **(ii) genuinely
  different 1-knob curves in the same `w(u)` family** (tanh-in-u, Gudermannian, erf — all frozen-wing
  1-knob sigmoids, differing only in shoulder shape); and **(iii) a genuinely different OBJECT, multi-knob**
  (GH-in-the-latent-SCORE, `√(δ²+v²)`, the demoted v25→v26c line — 4 shape params, kernel in the score
  not the weight, no scalar `w` handle). Our √-kernel is the **unique 1-knob member whose curve invariant
  is closed-form algebraic** (the entry-41 tiebreak).
- **Q2.** Shoulder localization is governed by the **kernel's asymptotic approach rate to the wing**:
  √-kernel approaches **polynomially** (gap `~1/2x²`, w′`~x⁻³`) = a **WIDE/soft** shoulder; tanh/erf
  approach **exponentially/super-exp** = **SHARP/localized** shoulders. A quantified measure (decade
  width `W10`, in τ-units) ranks them: erf 0.74 < tanh 1.17 < Gudermannian 1.47 < **√-kernel 4.95** <
  algebraic 90. **In OUR map shoulder-localization is NOT a separate DOF**: τ rescales the elbow AND the
  shoulder *together* (W10 is τ-invariant in τ-units), so localization is *fixed by the kernel choice* and
  only shifted/scaled by τ. The localization that *would* be the extra DOF is the **kernel exponent** (the
  `cosh^n`/`(1+x²)^p` family). And the divergence link is exact: **more-localized (sharper) shoulder ⟺
  faster w′→0 ⟺ worse `1/w′` gearing.** The √-kernel's soft (polynomial) shoulder is indeed the gentlest
  divergence *among monotone frozen-wing maps with crisp wings* — confirming entry-41. A tunable
  shoulder-sharpness parameter WOULD be a real extra DOF beyond τ, but in our family it is **spent/pinned
  by the algebraic-invariant contract** (and, going sharper, by weight-monotonicity).

---

## Q1 — the hyperbolic alternatives table

| # | construction | what it is | wings | shoulder | # shape params | genuine new curve, or re-coordinatization of ours? |
|---|---|---|---|---|---|---|
| **0** | **√-kernel `u/√(τ²+u²)` (CURRENT)** = `tanh η`, `η=asinh(u/τ)` | hyperbolic of the **ANGLE** η (log-price as rapidity) | frozen power-law | rounded, **soft (polynomial)** | **1** (τ; +Δw skew, trade-produced) | the reference object |
| (a) | **`tanh(u/τ)`** directly | hyperbolic of the **LINEAR** coord u | frozen power-law (same γ_±) | rounded, **sharp (exp `e^{−2u/τ}`)** | 1 | **genuinely different curve** — `tanh u ≠ tanh η`; sharper shoulder; transcendental invariant `τ·ln cosh` |
| (b) | **GH family**, kernel in latent **SCORE** `√(δ²+v²)` (demoted v25→v26c) | kurtosis-as-distribution-moment; kernel NOT in the weight | (different parametrization) | — | **4** (λ class, α tail, β skew, δ scale) | **different OBJECT, multi-knob** — no scalar `w=α/x` for a trade to move (why warp failed on it; `TRADE_WARP_strongform §DISCARDED`). Not a reparam of `w(u)`. |
| (c) | **Gudermannian** `gd(η)` (circular↔hyp-angle bridge; the rejected "d-law") | a *different* function of the *same* angle η | frozen power-law | rounded, **sharp (exp `e^{−(π/2)·u/τ}`)** | 1 | **genuinely different curve** (different fn of η); the d was amplitude relabeled, earns no extra knob (`GUDERMANNIAN_BRIDGE`) |
| (d) | **higher-order hyperbolic** — `cosh^n` / `s_p=u/(τ²+u²)^p` / q-deformed `u/(τ^q+|u|^q)^{1/q}` | shoulder-exponent deformations of the √-kernel | frozen power-law | **tunable** sharpness via the exponent | **2** (τ **and** the exponent p or q) | **the family our √-kernel lives in**; p=½ (or q=2) is our curve. p>½ is **non-monotone (invalid)**; q-family softens. The exponent IS the would-be shoulder-DOF |
| (e) | **erf `erf(c·u/τ)`** (Gaussian-CDF shoulder) | super-exponential sigmoid | frozen power-law | rounded, **sharpest (super-exp `e^{−u²}`)** | 1 | **genuinely different curve**; non-elementary invariant `u·erf+gaussian` |
| (f) | **algebraic `u/(τ+|u|)`** | slowest power sigmoid | power-law but **less crisply frozen** (gap `~1/u`) | rounded, **widest/softest** | 1 | **genuinely different curve**; piecewise-log invariant; erodes wing-exactness |

**Reading the table:**

- **Re-coordinatization vs new curve.** `tanh η` (our √-kernel) and `tanh u` (row a) are **not** the same
  curve — `tanh` of the *angle* η differs from `tanh` of the *linear* coord u. The √-kernel-in-u equals
  `tanh η` **exactly** (`max|s_sqrt(u/τ)−tanh η| = 1.1e-16` `[analytic/numeric]`), which is the
  entry-41 finding: **cosh/`tanh η` is our curve's chart, not an alternative to it.** Everything else in
  the table (a,c,e,f) is a *genuinely different* `w(u)` curve — same wings and same 1-knob structure,
  different shoulder. Only row 0 and "cosh/`tanh η`" are the same object.
- **1-knob vs multi-knob.** Rows 0,a,c,e,f are **1-knob** (τ; the wings and shoulder-shape are otherwise
  fixed). Row d (`cosh^n`/q-deformed) is **2-knob** (τ + a shoulder-exponent — the explicit extra DOF; see
  Q2). Row b (GH-in-score) is **4-knob** and a *different kind of object* (kurtosis as a latent-distribution
  moment, not a weight-field warp) — the operator's settled-against line; not re-litigated here.
- **Why ours is singled out (entry-41 carry):** among the 1-knob frozen-wing sigmoids, the √-kernel is the
  **only one with a closed-form *algebraic* curve invariant** (`∫ u/√(τ²+u²) du = √(τ²+u²)`, elementary;
  tanh→transcendental `τ ln cosh`, erf→non-elementary, Gudermannian→transcendental). That is the
  non-aesthetic tiebreak; the polar/cosh lens then *uniquely* forces `cosh η` given the lens.

---

## Q2 — what determines how localized / segregated-from-the-wings the shoulder is

### (1) The governor is the kernel's asymptotic approach rate to the wing `[analytic+numeric]`

Define the remaining gap to the frozen wing `g(x) = 1 − s(x)` (`x=u/τ`). Its decay rate IS the
shoulder localization:

| map | gap `g(x)=1−s(x)` asymptote | w′ wing decay | shoulder character |
|---|---|---|---|
| algebraic `u/(τ+\|u\|)` | `~1/(2x)` (power) | `~x⁻²` | **widest/softest** (but wing not crisply frozen) |
| **√-kernel (CURRENT)** | **`~1/(2x²)` (power)** | **`~x⁻³`** | **WIDE/soft** |
| Gudermannian | `~(4/π)e^{−(π/2)x}` (exp) | `~e^{−(π/2)x}` | sharp |
| tanh | `~2e^{−2x}` (exp) | `~e^{−2x}` | sharp |
| erf | `~e^{−x²}/x` (super-exp) | `~e^{−x²}` | **sharpest/most localized** |

**Quantified localization measure — decade width `W10`** = `x(g=0.01) − x(g=0.1)`, in τ-units (how many
τ it takes the shoulder to go from 90%-frozen to 99%-frozen). Small `W10` = sharp/localized; large =
wide/soft `[numeric, /tmp/fmi42.py]`:

| map | x@gap0.1 | x@gap0.01 | **W10 (τ)** | gap @ 8τ |
|---|---|---|---|---|
| erf | 1.312 | 2.055 | **0.743** (most localized) | 0.0 |
| tanh | 1.472 | 2.647 | **1.174** | 2.3e-7 |
| Gudermannian | 1.618 | 3.086 | **1.467** | 4.4e-6 |
| **√-kernel (CURRENT)** | 2.065 | 7.018 | **4.953** | 7.7e-3 |
| algebraic `u/(τ+\|u\|)` | 9.000 | 99.000 | **90.000** (least localized) | 1.1e-1 |

So the operator's intuition is exactly right: **√-kernel's polynomial approach = a WIDE/soft shoulder
(W10≈5τ); tanh's exponential = SHARP (≈1.2τ); erf even sharper (≈0.74τ).** The √-kernel's soft shoulder
"bleeds" furthest toward the wings (gap still 7.7e-3 at 8τ vs tanh's 2.3e-7) — it is the *least*
segregated-from-the-wings of the crisp-wing maps, and the algebraic map is softer still (but its wing is
no longer crisply power-law: gap 0.11 at 8τ).

### (2) In OUR map, is shoulder-localization a separate DOF? — NO; τ tunes elbow AND shoulder together `[numeric]`

τ enters only as a rescaling `x → u/τ`. So τ **shifts the shoulder out and scales its physical width, but
does not change its localization**: the decade width in τ-units is τ-invariant (`/tmp/fmi42.py`):

```
tau=0.10: physical decade width Du=0.4953  -> W10 = 4.9532
tau=0.30: physical decade width Du=1.4860  -> W10 = 4.9532
tau=1.00: physical decade width Du=4.9532  -> W10 = 4.9532
```

**Verdict: in (W), shoulder localization is FIXED by the kernel choice (the √-kernel ⇒ W10≈4.95τ) and
merely shifted/scaled by τ. τ tunes BOTH elbow width AND shoulder localization *together* (one rescaling),
not independently. There is a hidden/missing knob "how segregated the shoulder is from the wings" — it is
the kernel exponent, and we have spent it.** The natural extra DOF is the **kernel exponent** of the
`cosh^n` / `s_p = u/(τ²+u²)^p` family (or the q-deformed `u/(τ^q+|u|^q)^{1/q}`): the exponent sets the
shoulder sharpness *independently of τ*. Our √-kernel is the `p=½` (equivalently `q=2`) member.

### (3) The divergence link — sharper shoulder ⟺ faster w′→0 ⟺ worse `1/w′` gearing `[analytic+numeric]`

The warp gearing is `G = w′(u_spot)/w′(u_tp) ≈ 1/w′(u_tp)` (entry 40), and it blows up because
`w′→0` in the frozen wing. Since shoulder-localization IS the rate of `w′→0`, a sharper shoulder makes the
divergence **strictly worse** — confirmed `[numeric, /tmp/fmi42.py]`:

| map (shoulder) | G @ u_tp=3τ | 5τ | 8τ | 12τ |
|---|---|---|---|---|
| erf (sharpest) | 1.2e3 | 3.4e8 | 6.8e21 | 1.3e49 |
| tanh | 1.0e2 | 5.5e3 | 2.2e6 | 6.6e9 |
| Gudermannian | 5.6e1 | 1.3e3 | 1.4e5 | 7.7e7 |
| **√-kernel (current)** | **3.2e1** | **1.3e2** | **5.2e2** | **1.7e3** |
| algebraic (softest) | 1.6e1 | 3.6e1 | 8.1e1 | 1.7e2 |

**Confirmed: the √-kernel's soft shoulder is the gentlest divergence among maps with crisp frozen wings**
(polynomial, not exponential). The only thing softer (algebraic) is the row that loses wing-exactness and
the algebraic invariant — the entry-41 net-downgrade. The divergence ordering is monotone in shoulder
localization, exactly as the operator hypothesized.

**The kernel-exponent p-sweep makes the "extra DOF" concrete** `[numeric, s_p=u/(τ²+u²)^p, p=½ is current]`:

| p | wing w′ decay | divergence | curve invariant | valid sigmoid? |
|---|---|---|---|---|
| 0.25 | `~x⁻¹·⁵` | gentlest (G@12τ ≈ 6.9) | transcendental | yes (softer shoulder) |
| **0.50 (√-kernel)** | `~x⁻²` (of w′; `~x⁻³` overall) | G@12τ ≈ 1.7e3 | **ALGEBRAIC** | **yes — the sharpest *monotone* member** |
| 0.75, 1.0, 1.5 | `~x⁻²·⁵…⁻⁴` | worse | transcendental | **NO — weight turns over** |

Two pins on this DOF `[analytic]`:
- **Going sharper inside this family is blocked by monotonicity.** `s_p′(x) = (1+x²−2px²)/(1+x²)^{p+1}`
  vanishes at `x²=1/(2p−1)` for `p>½`, so for any `p>½` the weight is **non-monotone** (turns over at
  `u/τ = 1/√(2p−1)`: 2.24 at p=0.6, 1.41 at p=0.75) — not a valid frozen-wing sigmoid. So **the √-kernel
  (p=½) is the sharpest *monotone* member of the `(1+x²)^p` family**; to get a genuinely sharper shoulder
  you must leave the family (tanh/erf — exponentially sharper, transcendental invariant).
- **Going softer is possible (p<½, or the q-deformed `(1+|x|^q)^{1/q}`: q=3→w′~x⁻³, q=4→x⁻⁴ already
  fitted in `/tmp/shoulder.py`)** but costs the **algebraic invariant**: the curve closed form is
  elementary-algebraic **only at p=½** (where the amplitude `exp(−(Δw/2)√(τ²+u²))` is the hyperbolic
  radius `τ·cosh η` and the polar/cosh lens closes exactly — the entry-41 tiebreak).

**So: a tunable shoulder-sharpness parameter IS a real extra DOF beyond τ** (the kernel exponent), and it
is **exactly the "DOF for pricing" instinct** — it would let you set elbow width (τ) and
shoulder-segregation (p) independently. **But in (W) it is spent/pinned**: pinned *sharp* by
weight-monotonicity (can't exceed p=½ in this family without an over-turning weight) and pinned at p=½
*specifically* by the algebraic-invariant + closed-polar-lens contract. The √-kernel sits at the unique
point that maximizes shoulder-sharpness-subject-to-monotonicity *and* delivers the algebraic invariant —
which is why entry-41 found it the natural primitive and the gentlest-divergence crisp-wing map at once.

---

## Honest carry (unchanged)

FMI / understanding only — **not** a proposal to change the curve, no build authorization. The extra
shoulder-DOF (kernel exponent) is identified and quantified, NOT recommended; adding it would forfeit
the algebraic invariant (softening) or break weight-monotonicity (sharpening) — a curve/object decision
that is **operator-tier**, flagged not decided. The `(α,β)`-flow lemma remains `[needs-Aristotle]`/OPEN
(numeric-faithful only); warp∘rebase-commute and φ-anchor/funding remain OPEN. Nothing submitted / built
/ edited / committed. Manager re-derives + routes through the skeptic before relaying to the operator.

---

## Scripts (transcribed)

- `/tmp/fmi42.py` — Q1 √-kernel≡`tanh η` identity (resid 1.1e-16); Q2 localization measure `W10`
  (decade width, τ-units) for √-kernel/alg/Gudermannian/tanh/erf; τ-rescaling test (W10 τ-invariant
  ⇒ not a separate DOF); divergence gearing `1/w′` ordered by shoulder sharpness; `cosh^n`/`s_p`
  exponent p-sweep (divergence + algebraic-invariant + monotonicity-turnover at p>½).
- `/tmp/shoulder.py` (companion) — wing residual `r(x)=1−s(x)` tables and fitted asymptotic decay
  (power vs exp) incl. q-deformed `u/(1+|u|^q)^{1/q}` softer-shoulder members (q=3→x⁻³, q=4→x⁻⁴).
- `/tmp/naturalness{,2}.py` (entry-41 carry) — design-space sigmoids, frozen-wing convergence,
  √-kernel↔cosh identity.

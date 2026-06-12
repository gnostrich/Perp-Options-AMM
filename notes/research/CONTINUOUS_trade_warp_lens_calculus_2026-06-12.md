# CONTINUOUS trade → warp → update-lens calculus

_research-lead · 2026-06-12 · operator-ordered (entry 160: "might as well do the damn calculus now
itself via research guy for the continuous trade-warp-updatelens"). READ-ONLY pass: no engine edit,
no git, no build, no Aristotle submission. HEAD untouched (`engine/builds/HEAD_temporal_mvp_v28_lens.html`,
md5 `7e1ae39b…`)._

_Engine primitives transcribed VERBATIM from HEAD L1600–1709 (`getW`, `getSNorm`, `getMP_raw`,
`hTau`, `hpTau`, `lensU`, `gLoc`, `tradeUpdate`). Float64 verification on fresh paths:
`/tmp/rl_cont_1_flow.js`, `/tmp/rl_cont_2_warp.js`, `/tmp/rl_cont_3_props.js`,
`/tmp/rl_cont_4_limits.js`, `/tmp/rl_cont_5_decomp.js` (node, live `tradeUpdate` marched in steps,
all closed forms checked against the engine, not against themselves)._

**Operator's mechanic (entry 158 verbatim):** "chwanging w skews the curve, which changes the 45
degree tangent slope point .... after we clarified that the lens steepness amplifies the skew as
seen, not neutralises it, we dont need to hold it constant but rather change skew as the trade
happens continuously." Built on the operator-confirmed per-step mechanic (entry 131; skeptic
#43/#44: per-step warp at the held center = `(γ_after − γ_before)·Φ_τ(u)`, lens updates between
steps). The continuous calculus below is the N→∞ limit of exactly that sequence.

## Symbol glossary (every symbol, plain English)

| symbol | plain English |
|---|---|
| `x, y` | the pool's two reserves (y = the dollar side; cash flows in/out of y) |
| `α, β` | the two conserved trade quantities: α = x·w, β = y·(1−w) — a trade never changes them |
| `w` | the curve's weight; w = α/x; w > ½ means the curve leans steep |
| `γ = w/(1−w)` | **steepness** — how bent the curve is (1 = the 50/50 curve; bigger = steeper) |
| `D` | total trade size in dollars (cash into y; negative = cash out) |
| `s ∈ [0,1]` | fraction of the trade executed so far (0 = not started, 1 = done) |
| `center = (1−w)/w = 1/γ` | the 45°-tangent point in the strike coordinate — where the lens is centred (code `getSNorm`) |
| `θ_K` | a strike's registered position in the same coordinate |
| `u = ln(θ_K/center)` | how far the strike sits from the lens center, in log units |
| `Φ_τ(u) = |u|/√(τ²+u²)` | the **lens factor**: 0 at the center, climbing to 1 far out (code `hpTau`) |
| `τ` | the lens sharpness knob (small τ = sharp lens: Φ reaches 1 close in) |
| `g(K) = γ·Φ_τ(u(K))` | the **lensed local steepness** at strike K — what the trader sees (code `gLoc`) |
| `ΔG(K)` | the warp: how much the seen steepness at strike K accumulates over the whole trade |

Worked pool throughout (the skeptic's calibrated case): y₀ = 1000, w₀ = 0.725 ⇒ β = 275,
γ₀ = 2.6364, center₀ = 0.3793; buy D = $150 ⇒ γ₁ = 3.1818, center₁ = 0.3143; τ = 0.3.

---

## 1. The trade flow — closed form (DERIVED + VERIFIED)

`tradeUpdate` (HEAD L1679) conserves α and β exactly and moves (x,y) along the hyperbola
`(x−α)(y−β) = αβ`. Solving that hyperbola for x and substituting w = α/x gives, with **no
approximation** (these are exact at every point of the trade, not a continuous idealization):

| quantity | closed form | plain English |
|---|---|---|
| reserve x | `x(y) = α·y/(y−β)` | the asset reserve as cash arrives |
| weight | `w(y) = 1 − β/y` | the weight depends ONLY on the cash reserve |
| steepness | `γ(y) = (y−β)/β` | **steepness is a straight line in cash** |
| center | `center(y) = β/(y−β) = 1/γ` | the 45° point is just one-over-steepness |
| raw price | `p(y) = (y−β)²/(αβ) = βγ²/α` | price grows as steepness squared |

For a trade of D dollars executed fraction s: `y(s) = y₀ + sD`, so

- **`w(s) = 1 − β/(y₀ + sD)`**
- **`γ(s) = γ₀ + sD/β`** — steepness rises at the constant rate **dγ/dy = 1/β per dollar**
  (every dollar adds the same steepness: 1/275 ≈ 0.00364 here — a pool constant, strike-blind;
  this is the same fact as the earlier "warp/$ exactly flat" finding, now in closed form)
- **`center(s) = β/(y₀ − β + sD) = 1/γ(s)`**

**VERIFIED** (`/tmp/rl_cont_1_flow.js`): live `tradeUpdate` marched in N = 1/7/100/1000 steps;
max |engine − closed form| over every substep: w ≤ 1.7e-14, γ ≤ 3.0e-13, center ≤ 3.0e-14,
price ≤ 4.5e-11, x ≤ 2.2e-13; α,β drift exactly 0. Path-independence (1 jump vs 1000 steps):
x agrees to 2.7e-14. The "continuous limit" costs nothing: the discrete update already lives
exactly on these curves.

## 2. The center flow — how fast the 45° point slides per dollar (DERIVED + VERIFIED)

From center = 1/γ and dγ/dy = 1/β:

**`d(center)/dy = −1/(β·γ²) = −center²/β`** — the 45° point slides toward the cash side at a
speed that falls off as the square of the steepness: the steeper the curve already is, the less
each next dollar moves the center.

| trade fraction s | y | w | γ (steepness) | center (45° point) | center slide per dollar |
|---|---|---|---|---|---|
| 0.00 | 1000.0 | 0.7250 | 2.6364 | 0.37931 | −5.23e-4 |
| 0.25 | 1037.5 | 0.7349 | 2.7727 | 0.36066 | −4.73e-4 |
| 0.50 | 1075.0 | 0.7442 | 2.9091 | 0.34375 | −4.30e-4 |
| 0.75 | 1112.5 | 0.7528 | 3.0455 | 0.32836 | −3.92e-4 |
| 1.00 | 1150.0 | 0.7609 | 3.1818 | 0.31429 | −3.59e-4 |

In log units the slide obeys the exact differential identity **`d ln(center) = −(1/w)·d ln(y)`**,
whose exact integral is `Δln(center) = −ln((y₁−β)/(y₀−β))` (= −0.188052 here; engine read
−0.188052 to 6 d.p.). Freezing w at w₀ gives the approximation `−(1/w₀)·ln(y₁/y₀)` (= −0.192775
here, 2.5% off) — which is **exactly the structure of the retrieval-only `warp-amm` Aristotle
cluster's `mode_shift_closed_call = (1/w₀)·log(y_s/y_B)`** (`formal/INDEX.md` §EXTERNAL; label:
retrieval-only, not re-verified by us). Our form is the exact version; theirs is its frozen-weight
first approximation (or a different anchoring convention — not re-litigated here).

## 3. The continuous warp — the riding-lens integral (DERIVED + VERIFIED)

Each infinitesimal slice of the trade warps the seen steepness at strike K by the per-step
held-center formula (skeptic #43/#44, operator entry 131) read at the THEN-current center:
`dG(K) = dγ · Φ_τ(|u(s)|)`, `u(s) = ln(θ_K/center(s)) = ln(θ_K·γ(s))`. Because the center is
1/γ exactly, **the integrand is a function of γ alone** — so the accumulated warp is an **exact
differential in steepness**:

> **`ΔG(K) = ∫_{γ₀}^{γ₁} Φ_τ(|ln(θ_K·γ)|) dγ = F_K(γ₁) − F_K(γ₀)`**, with γ₁ = γ₀ + D/β.

This is the operator's "set of closed form integrals": **one single-variable integral per strike,
of a per-strike potential F_K in the steepness variable** — path-independent (only the endpoint
steepnesses matter, not how the trade was sliced), and exactly zero on any round trip.

**Closed-form status (honest):** substituting v = ln(θ_K·γ),
`ΔG(K) = (1/θ_K)·∫_{v₀}^{v₁} e^v·|v|/√(τ²+v²) dv`, v_i = ln(θ_K·γ_i). By parts this reduces to
`[e^v√(τ²+v²)] − ∫e^v√(τ²+v²)dv` (verified to 4.4e-16), and the remaining integral is the
**incomplete-modified-Bessel class** (rapidity form `τ∫e^{τ·sinh ξ}|sinh ξ|dξ`, verified
equivalent to 4.4e-16) — **no single elementary antiderivative for τ > 0** [LABEL: standard
classification of this integral class, asserted not proven here; immaterial to any build]. What
IS closed-form, exactly:

- **τ = 0 (no lens rounding):** Φ ≡ 1 ⇒ `ΔG = Δγ = D/β` exactly — the full steepness change,
  every strike (verified: τ = 0.001 gives 0.545453 vs Δγ = 0.545455).
- **Far wings (strike far from the whole center path):** `ΔG = Δγ·(1 − O(τ²/2v_min²))`, with the
  explicit bound `ΔG/Δγ ≥ 1 − τ²/(2·v_min²)` (verified at 4×/8×/20×: ratio 0.9801/0.9906/0.9953
  vs bounds 0.9766/0.9896/0.9950). The retrieval cluster's elementary `2σ·sinh(Δξ)` /
  `2σ²(cosh(Δξ)−1)` forms are exponential-of-rapidity integrals of this same family; ours reduces
  to elementary form exactly in this Φ ≡ 1 regime (retrieval-only label stands; structural
  connection, not an identity claim).
- **Small trade:** `ΔG = Δγ·Φ(|v₀|) + ½Δγ²·sign(v₀)·τ²/((τ²+v₀²)^{3/2})/γ₀ + O(Δγ³)` — first
  term = the held-center fix; verified rel-err of first order 1.6e-4 ($1) → 3.0e-3 ($20), second
  order 3e-7 → 1.3e-4.
- **Everywhere:** a convergent series whose every term is elementary —
  `F = Σ_{n≥0} I_{n+1}(v)/n!` with `I_m = ∫v^m/√(τ²+v²)dv` given by the standard recursion
  (I₀ = asinh(v/τ), I₁ = √(τ²+v²), `I_m = v^{m−1}√(τ²+v²)/m − (m−1)τ²·I_{m−2}/m`); 40 terms
  reproduce the quadrature to 4.4e-16. So "a set of closed-form integrals" is satisfied in this
  precise sense: exact per-strike potentials, elementary in all relevant limits, elementary
  term-by-term in general, one-line quadrature otherwise.

**The warp profile for the calibrated buy** (D = $150, Δγ = 0.5455; strike as multiple of the
pre-trade center; `/tmp/rl_cont_2_warp.js`, `/tmp/rl_cont_4_limits.js`):

| strike | warp ΔG, τ=1 (soft lens) | τ=0.3 | τ=0.05 (sharp lens) |
|---|---|---|---|
| 0.5× | 0.2786 | 0.4863 | 0.5435 |
| 0.7× | 0.1366 | 0.3513 | 0.5343 |
| 0.9× | 0.0257 | 0.0837 | 0.3269 |
| 1.0× (pre-trade center) | 0.0524 | 0.1614 | 0.4255 |
| 1.5× | 0.2442 | 0.4667 | 0.5427 |
| 2× | 0.3376 | 0.5095 | 0.5444 |
| 4× | 0.4521 | 0.5346 | 0.5451 |
| 8× | 0.4956 | 0.5403 | 0.5453 |

Read: warp is smallest near the band the center sweeps during the trade ([0.83×, 1×] here), grows
toward both wings, saturates at the full Δγ = 0.5455; a sharper lens (smaller τ) pushes every
strike closer to the full Δγ — **the lens amplifies the skew as seen, exactly the operator's
entry-132/158 direction.**

## 4. Properties (all VERIFIED float64, fresh paths)

**(i) Sign — single-signed, the flip is CURED in the right observable.** The integrand
`Φ·dγ ≥ 0`, so for a one-direction trade ΔG(K) has ONE sign at EVERY strike (buy ⇒ all-positive;
sell verified all-negative, range [−0.5429, −0.1015]). 401-point strike scan from 0.05× to 20×:
zero negatives, min +0.0837 at 0.9×. **Precision on what is cured:** the one-big-jump LIVE-center
read `gLoc(post) − gLoc(pre)` still sign-flips (−0.4586 at 0.7×, −1.392 at 0.829×) — but that
read is the warp PLUS the lens-slide redistribution. The exact decomposition (verified to 4.7e-15
against live engine reads, `/tmp/rl_cont_5_decomp.js`):

> `live diff = ΔG_accumulated + recentering term`, recentering = `∫ sign(v)·τ²/(τ²+v²)^{3/2} dγ`.

| strike | live diff (engine) | accumulated warp ΔG | recentering term |
|---|---|---|---|
| 0.5× | +0.3162 | +0.4863 | −0.1701 |
| 0.7× | **−0.4586** | **+0.3513** | −0.8099 |
| 0.829× | −1.3920 | +0.1514 | −1.5434 |
| 1.0× | +1.6899 | +0.1614 | +1.5285 |
| 2× | +0.5926 | +0.5095 | +0.0830 |

The continuous mechanic resolves the 0.7× paradox cleanly: the warp there is +0.35 (positive,
as the operator expects); the negative live diff is the lens sliding off that strike, not an
anti-warp.

**(ii) Monotonicity in strike — precise statement.** The quantity is ΔG(K) (accumulated lensed-
steepness change). `dΔG/d ln θ_K = ∫ sign(v)·τ²/(τ²+v²)^{3/2} dγ`: strictly increasing in strike
for all strikes above the entire swept center band, strictly decreasing below it (verified on 200-pt
grids both sides) — i.e. **V-shaped in log-strike: more warp the further out-of-the-money on each
side, with the minimum inside the band the center sweeps**, saturating (not growing without
bound) at Δγ in both wings.

**(iii) Boundedness — no blow-up.** `0 ≤ |ΔG(K)| ≤ |Δγ| = |D|/β` at every strike (Φ < 1);
verified max 0.5429 < 0.5455 on the full scan. Also the drawn preview trace respects the cap:
`g_pre(K) + ΔG(K) ≤ γ₁` everywhere (verified). No 1/w′ channel exists (plain Balancer, no weight
field); nothing diverges as τ → 0 (limit is Δγ).

**(iv) N → ∞ consistency — the discrete mechanic converges to the integral.** N-step held-center
accumulation on the LIVE `tradeUpdate` (each step's Φ read at that step's starting center) vs the
integral (adaptive Simpson, 64-pt Gauss–Legendre cross-check agreeing to 8+ d.p.):

| strike | integral | N=1 | N=10 | N=100 | N=1000 |
|---|---|---|---|---|---|
| 0.7× | 0.35131 | 0.41743 | 0.35873 | 0.35206 | 0.35139 |
| 1.0× | 0.16140 | 0.00000 | 0.14676 | 0.15995 | 0.16126 |
| 2× | 0.50953 | 0.50058 | 0.50873 | 0.50945 | 0.50952 |
| 8× | 0.54034 | 0.53987 | 0.54029 | 0.54033 | 0.54034 |

Error ratios err(10)/err(100) = 10.12, err(100)/err(1000) = 10.01: clean first-order O(1/N)
convergence — the discrete per-step mechanic IS the Riemann sum of this integral, and the
round-trip (buy then sell, N = 2000) accumulates −7.9e-6 → 0, pool returning byte-exact.

**(v) Call/put asymmetry — the #44 §4 growing skew, reproduced continuously.** Strikes at 2× and
0.5× of the initial center (symmetric log-distance):

| trade D ($) | Δγ | ΔG call (2×) | ΔG put (0.5×) | asym (call−put) | asym/Δγ |
|---|---|---|---|---|---|
| 25 | 0.0909 | 0.08374 | 0.08309 | +0.00065 | 0.0071 |
| 50 | 0.1818 | 0.16804 | 0.16547 | +0.00258 | 0.0142 |
| 100 | 0.3636 | 0.33804 | 0.32777 | +0.01027 | 0.0282 |
| 150 | 0.5455 | 0.50953 | 0.48626 | +0.02327 | 0.0427 |
| 250 | 0.9091 | 0.85578 | 0.78836 | +0.06742 | 0.0742 |
| 400 | 1.4545 | 1.38063 | 1.18595 | +0.19468 | 0.1338 |

The asymmetry grows FASTER than the trade (asym/Δγ rises ~19× as D goes 25→400): a buy slides the
center down, so the call strike spends the trade deeper in the wing (Φ near 1) while the put
strike has the center sliding toward it (Φ falling) — a genuine, growing call/put skew from a
symmetric start, the continuous twin of skeptic #44 §4. The live final picture shows it too
(live asym +0.0388 → +1.3124 over the same D range). Mechanism identical to #44: center motion
between (here: during) increments is what converts a symmetric rescale into a real skew.

## 5. What the chart should draw (the build-determining answer)

The continuous mechanic separates TWO honest objects, and the exact decomposition in §4(i) is
the proof they differ:

- **The standing (post-execution) chart: everything live, no override.** After the trade the
  state is (x₁,y₁,α,β) and the lens has finished riding: the curve is `g₁(K) = γ₁·Φ_τ(|ln(θ_K·γ₁)|)`
  — final state through the final lens. No reference center, no stored scalar survives execution;
  all post-trade reads (pricing, settlement, funding, portfolio) stay exactly v28's live
  single-basis reads. **The continuous mechanic RATIFIES v28's live drawing for the standing
  state.**
- **The PREVIEW of a proposed trade (the warp view): pre-trade curve PLUS the riding-lens
  integral.** The warp a proposed trade of D dollars would cause is `ΔG(K) = F_K(γ₀+D/β) − F_K(γ₀)`;
  the after-trace should be `g_pre(K) + ΔG(K)`. The pre-trade curve is drawn through its own live
  lens (as today). The only "reference" the preview uses is γ₀ — the pre-trade state itself, which
  any before/after comparison necessarily references; it is an input to an integral, not a stored
  φ, and it expires with the preview.
- **The in-flight held-center drawing fix is the N = 1 approximation of this — MODIFIED, not
  ratified as-is, not void.** Its after-trace `γ₁·Φ(|u_held|) = g_pre(K) + Δγ·Φ(|u₀(K)|)` is
  exactly the one-step left-endpoint Riemann sum of ΔG. The fix's DIRECTION is ratified: it
  correctly rejects the live endpoint diff (which masks the warp and sign-flips, the very defect
  the operator called). Its KERNEL is superseded for finite trades: at the calibrated $150 trade
  it overshoots near the swept band (0.289 vs 0.151 at 0.829×, +91%) and zeroes out exactly at
  the pre-trade center (0 vs 0.161 at 1×), while agreeing in the wings (0.5006 vs 0.5095 at 2×)
  and to first order for small trades (rel-err 1.6e-4 at $1). **Build implication: keep the
  held-mode plumbing (the gLoc modeOverride thread), replace the single held-center product with
  the integral** — implementable as a short fixed quadrature (e.g. 32–64 Gauss points, or N≈100
  internal held-center substeps, err ≤ 1.5e-3) per drawn strike; no inversion, forward-read only,
  L4 intact.
- **Honest residual tension (label, don't hide):** the preview after-trace `g_pre + ΔG` (warp as
  experienced through the riding lens) is NOT the post-trade pricing curve `g₁` — they differ by
  the recentering term at every strike. Both are true; the chart must not label the warp trace as
  "the curve after your trade" without the live curve also being available, or the displayed
  preview won't match the standing chart drawn after execution. Which overlay(s) the preview
  shows is a display-semantics call — flagged to the manager (operator-tier only if it changes
  what the operator was told a knob does; the math above fixes what each candidate IS).

## 6. The single object (entries 134/141) — honest paragraph

Partially natural, one piece not-yet-shown. **Natural:** the trade flow is the level-set flow of
the conserved hyperbola `H = (x−α)(y−β)` with α,β as Casimirs (exactly the T2 metriplectic
picture's conservative leg, `formal/INDEX.md` T2 row: price = gradient, single-μ core,
motivation-layer); in that frame the steepness γ = (y−β)/β is an **affine function of the port
variable y** — the simplest possible parameter flow (constant rate 1/β per dollar), not tacked
on. The warp itself turns out to be an **exact differential**: ΔG(K) = F_K(γ₁) − F_K(γ₀) for a
per-strike potential F_K, so the riding-lens warp is conservative (round-trip zero, verified) —
"a set of closed-form integrals" is literally the statement that the warp admits potentials.
**Not-yet-shown:** the lens factor Φ_τ itself is not derived from H or from any free-energy
functional — it remains a view-layer object with τ set by calibration; and the dissipative leg
(funding, the R ⪰ 0 port) is untouched by this calculus. I will not dress that up: the flow and
the warp potentials sit naturally in the metriplectic frame; the lens's own origin in that frame
is open.

## 7. Provenance labels (for the skeptic's cold audit)

- **DERIVED + VERIFIED (float64, live-engine cross-checked):** §1 flow closed forms; §2 center
  flow + exact mode-shift; §3 the warp integral, its exactness/path-independence, the by-parts /
  rapidity / series reductions, limits and bounds; §4 all five properties incl. the decomposition
  identity; the N→∞ convergence.
- **DERIVED (definition-level, grounded in operator entries 131/158 + skeptic #43/#44):** that
  the continuous warp IS `∫Φ dγ` — i.e. the N→∞ limit of the operator-confirmed held-then-update
  sequence. This is the faithful continuous reading of entry 158; it is a modeling statement, not
  a theorem.
- **LABELED, not proven here:** non-elementarity of the general antiderivative (standard
  classification of `∫e^v√(τ²+v²)dv`; build-immaterial).
- **RETRIEVAL-ONLY:** all `warp-amm` cluster connections (§2, §3) — structural matches, not
  re-verified, not trusted-from-prover.
- **NOT claimed:** any settlement/write-path change (this is view-layer calculus; pool stays
  plain v24); any per-strike warp DOF (the warp profile is still generated by the single scalar
  γ flowing through the fixed lens — strike-dependence lives in Φ, consistent with #43's honest
  limit and #44's resolution of it across the sequence).
- **Lean candidates (NOT submitted; pin only on manager/operator call):** (L1) exactness/
  path-independence of ΔG (integrand a function of state γ ⇒ potential exists; easy); (L2) the
  bound 0 ≤ ΔG ≤ Δγ with wing saturation; (L3) the decomposition identity live = ΔG + recentering
  (chain rule on γ·Φ(|ln θγ|)); (L4) single-signedness ⇒ no-sign-flip of the accumulated warp.
  All four are statements about transcribed primitives, ready to pin once the chart semantics
  (§5 flag) is ruled.

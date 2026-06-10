# Single-parameter, asymptote-respecting kurtosis knob `τ` on the Balancer curve

> ## ⚠ DISPUTE HEADER (2026-06-10, skeptic inaugural verdict — manager-verified; appended by manager)
> Two flagship claims of this note are **BROKEN** (full verdict:
> `notes/skeptic/VERDICT_KURTOSIS_KNOB_2026-06-10.md`; manager re-derived both independently):
> 1. **§0 "no clean algebraic single-`τ` invariant exists" — FALSE.** Explicit counterexample:
>    `x^{w_mid}·y^{1−w_mid}·exp(−(Δw/2)·√(τ²+ln²(y/x))) = k` is a closed-form first integral of
>    the weight-profile law (manager: analytic derivation ∂lnF/∂x=w(v)/x, ∂lnF/∂y=(1−w(v))/y +
>    RK4 constancy 4.8e-13; wings = exact CD monomials at w∓). The §0 argument only showed the
>    *unmodified CD monomial* isn't constant — a non sequitur.
> 2. **"τ:=δ EXACTLY / engine = the single setting τ=0.08" — FALSE at curve level.** GH puts the
>    kernel in the latent SCORE; (W) puts it in the WEIGHT — different curves. Manager check on
>    the live v26c engine: w_eff vs ln(y/x) is non-monotone (0.125→0.293→0.022→0.497) with
>    ũ saturating ≈12.0 ⇒ the engine curve is NOT a (W)-member at ANY τ.
> Also: Object-L kurtosis numbers / "[0,3]" are the β=0 slice (engine β=1: skew +0.92, excess kurt
> 3.285); inventory items #8/#9/#13 were not dispositioned; §5's survival claims are carried from
> REPARAM (the δ-unfreeze), not shown for (W). **What SURVIVED attack:** asymptote preservation
> (F2), the kurtosis sign-split + "never ship τ-up=fatter" warning, the (W) endpoint structure,
> the β=0 table values, and §5's REPARAM-based δ-unfreeze path itself.
> **Net: this note contains TWO different curves — the (W) profile (§§1–4) and the GH δ-unfreeze
> (§5) — and the bridge between them is broken. The operator's curve decision must pick which is
> actually on the table. research-lead owes a substantive reconcile (queued).**

_2026-06-10, research-lead. DELIVERABLE: a concrete, buildable, single-parameter `τ` that adds
asymptote-preserving kurtosis to the Balancer curve `x^w·y^(1−w)=k`, realizing the paper's
Future-Directions `(w, τ)` conjecture in implementable form. **No engine edits, no Aristotle submits,
no git** (manager commits + re-derives + audits). All numerics this pass: mpmath, 25–60 significant
digits, by direct construction/integration — not formula-arguing. Confident vs conjectural marked
inline._

Grounded in: `paper/temporal_paper_draft.md` (Conservation Law, Limitations, Future Directions `(w,τ)`
conjecture), `engine/knowledge/GH_MATH.md`, and prior notes
`HETEROGENEOUS_WEIGHT_implied_density_2026-06-09.md`, `REPARAM_balancer_kurtosis_dropin_2026-06-09.md`,
`CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md`. Hard constraints (manager-verified) honored:
asymptote-respecting (wings stay exact Balancer power-laws); `√(δ²+v²)`-elbow rounding mechanism (NOT a
tail-exponent `|v|^d` deformation); plain Balancer = the base; GH engine = one setting of `τ`.

---

> **NOTATION (de-collided 2026-06-10, operator request):** `τ` = the **kurtosis knob** (equal to the GH
> kernel scale `δ` exactly; renamed from the earlier `κ` because `κ` read as the strike `K`). `k` = the
> **Balancer / Cobb–Douglas invariant** (`x^w·y^(1−w)=k`). `K` = **strike** (reserved — not reused here).
> SEPARATE pre-existing collision, flagged not fixed: the GH kernel scale `δ` (= `τ`) vs. the paper's
> composite-ray half-spread `δ` (Annexures notation table) — disambiguate by context or rename one later.

## 0. HEADLINE — which form, and why

**I am delivering form (b): an explicit single-`τ` WEIGHT-PROFILE `w(u; w₋, w₊, τ)`, not a clean
closed-form algebraic invariant `F(x,y;w,τ)=k`.** This is the honest, buildable answer, and the reason
the clean invariant does **not** exist is structural, not a failure of effort:

> **FLAG (confident): no clean algebraic single-`τ` invariant `F(x,y;w,τ)=k` exists that both (i)
> reduces to `x^w·y^(1−w)=k` at the base and (ii) rounds the ATM elbow while keeping both wings exact
> power-laws.** A position-dependent weight `w(u)` is exactly a frontier on which the Cobb–Douglas
> invariant `k=X^{w}·Y^{1−w}` is *not* constant (it is constant **only** for constant `w` — verified
> below to 4.6e-41). The asymptote-preserving elbow is intrinsically a *non-monomial* warp of the
> marginal-price law, so there is no single algebraic `k`-level set carrying it. The GH engine itself
> is built this way — as a kernel/score construction, not an algebraic `F=k` — for the same reason.
> The weight-profile is therefore *the* practical (and the engine-native) form. The constant-`w`
> base **does** have the clean invariant `x^w·y^(1−w)=k`; the family around it does not.

The weight-profile drops straight into the existing dynamic-weight machinery (the paper's `w` is
already a derived field; the engine already runs a `w`-shaped score), so "form (b)" is not a weaker
deliverable here — it is the form the system is actually built in.

---

## 1. The explicit single-`τ` curve (the weight profile)

Coordinates (as in `GH_MATH.md` and the heterogeneous note): `u = log p − log P` (latent log-price,
`P = Ny/Nx` the carry), `p` the marginal price. The Balancer marginal-price law with a
position-dependent weight is, **by definition of Balancer**,

    p(u) = (w(u)/(1−w(u)))·(y/x),    q(u) := log p(u) = u + log( w(u)/(1−w(u)) ) + const.   (★)

### The proposed profile (single knob `τ`, `√`-elbow rounding)

    w(u; w₋, w₊, τ) = w_mid + (Δw/2)·r_τ(u),     r_τ(u) = u / √(τ² + u²),                  (W)

    with   w_mid = (w₋ + w₊)/2,   Δw = w₊ − w₋,
    and    w'(u) = (Δw/2)·τ² / (τ² + u²)^{3/2}.                                            (W′)

`r_τ(u) = u/√(τ²+u²)` is **the same `√(δ²+v²)`-elbow kernel the GH engine already uses** (it is exactly
`2·σ_GH(u) − 1` with `σ_GH(v) = (1 + v/√(δ²+v²))/2`, the GH latent score-sigmoid, see §3). It runs
`−1 → +1`, is smooth, monotone, and **linear-asymptote** (`r_τ → ±1` with `r_τ'(u) = τ²/(τ²+u²)^{3/2} →
0` like `τ²/|u|³` in the wings). So:

- `w(±∞) = w∓... ` → **`w(−∞) = w₋`, `w(+∞) = w₊`** (the two wing weights — these are the **skew/γ_±
  carriers**, held fixed; `τ` does **not** move them);
- `w'(0) = Δw/(2τ)` — the **ATM transition sharpness**, the single thing `τ` controls;
- the wings flatten (`w' → 0`), so each wing becomes an **exact constant-weight Balancer** — this is
  the asymptote-preservation property, proved in §2.

`τ` is the **single kurtosis knob.** Large `τ` = soft/flat elbow (toward plain Balancer); small `τ` =
sharp elbow.

### The role split (the `(w, τ)` family, made precise)

| object | carried by | what it sets |
|---|---|---|
| **convexity** `γ̄ = (γ₋+γ₊)/2` | `w_mid` via `γ_± = w_±/(1−w_±)` | average wing exponent |
| **skew** `Δγ = γ₊ − γ₋` | `Δw = w₊ − w₋` | wing-exponent asymmetry (the paper's `w` tilt) |
| **kurtosis** | **`τ`** (this knob) | ATM-elbow sharpness only |

The paper's `(w, τ)` family is exactly this: `w` is the skew axis (`w₋, w₊`, already present), `τ` is
the new kurtosis axis. Both are realized concretely in (W).

### Tie to the GH engine native knob `δ` (confident, exact)

The elbow kernel `r_τ` **is** the GH score-kernel. Setting

    τ := δ

makes (W) the GH elbow exactly: the GH latent score is `d log f_β/dv = β − α·v/√(δ²+v²)`, whose
sigmoid is `σ_GH(v) = (1 + r_δ(v))/2`, with `σ_GH'(0) = 1/(2δ)`; the profile's sharpness is
`w'(0) = Δw/(2τ)` — the **identical `1/(2·scale)` law**. So **`τ` is the engine-native `δ` re-labeled
as the kurtosis dial**, and the current engine (`δ = 0.08`) is the single setting `τ = 0.08`.

---

## 2. ASYMPTOTE PRESERVATION — wings stay `value ∝ S^(−γ_±)` for ALL `τ`

This is the non-negotiable property. Two demonstrations.

### Analytic
The local value-law exponent is `γ_loc(u) = w(u)/(1−w(u))`. As `|u| → ∞`, `r_τ(u) → ±1`, so
`w(u) → w_±` and `γ_loc(u) → γ_± = w_±/(1−w_±)`, **independent of `τ`**. The approach rate is governed
by `w'(u) = (Δw/2)·τ²/(τ²+u²)^{3/2} = O(τ²/|u|³) → 0` — the rounding is `O(1)` near ATM and **vanishes
like `1/|u|³` in the wings, for every fixed `τ`**. The reserve depletion slopes therefore flatten to
the exact Balancer constants `d log X/du → −(1−w_±)`, `d log Y/du → +w_±`, i.e. each wing is the exact
Balancer `X ∝ e^{−(1−w_±)u}`, `Y ∝ e^{w_±u}` ⇒ `value ∝ S^(−γ_±)`. A tail-exponent deformation would
instead bend `γ_loc` itself in the wings; this `√`-rounding does not — it only changes the *vertex*.

### Numeric (mpmath, 40 digit) — the scale-invariance is the proof

`γ_loc` evaluated at `u = 100·τ` (deep wing relative to the elbow scale) is **identical for every `τ`**:

| τ | u = ±100τ | γ_loc(−) / γ_loc(+) | err vs (γ₋=1.5, γ₊=4) |
|---|---|---|---|
| 0.05 | ±5 | 1.50003124805 / 3.9998750125 | 3.12e-5 / 1.25e-4 |
| 1 | ±100 | 1.50003124805 / 3.9998750125 | 3.12e-5 / 1.25e-4 |
| 30 | ±3000 | 1.50003124805 / 3.9998750125 | 3.12e-5 / 1.25e-4 |

The error is **`τ`-independent** (byte-identical across three decades of `τ`): `τ` is a pure horizontal
rescaling of the elbow, and the wing exponent it converges to is fixed by `w_±` alone. And
`d γ_loc/du → 0` in the wings (e.g. `< 1e-7` at `|u| = 40` for `τ ≤ 1`). **Asymptote preserved for all
`τ`. Confident.**

(Validity: `w' ≥ 0` for the natural monotone-increasing elbow (`w₊ > w₋`) ⇒ `dq/du = 1 + w'/(w(1−w)) ≥
1 > 0` always ⇒ a valid `AMMCurve` (`antitone_y`/`convex_y`/`coercive` all hold) for **every** `τ`,
checked min `dq/du ∈ [1.0000001, 1.0083]` over `[−20,20]`. For a call-heavy skew `w₊ < w₋` the gate is
`w' > −w(1−w)`, which bounds `τ` from below — a hard type gate, not a tuning knob.)

---

## 3. The two paper endpoints — recovered as two settings of `τ`

The Future-Directions text asks for "the present invariant and a log/exponential-curve invariant
arising as two settings of the same `τ`." Both confirmed.

### Endpoint 1 — plain Balancer = the base (τ → ∞)
Large `τ` ⇒ `r_τ(u) → 0` over any finite operating window ⇒ `w(u) → w_mid` **constant** ⇒ `dq/du → 1`
(pure linear warp) ⇒ the curve is the exact constant-weight Balancer `x^{w_mid}·y^{1−w_mid} = k`.
Numerically: at `τ = 10⁶`, `max|w(u) − w_mid| < 2.5e-7` over `|u| ≤ 5`, `dq/du = 1.00000024`. And the
constant-`w` invariant `k = X^w·Y^{1−w}` is **constant to 4.6e-41** along the frontier (machine-exact
Cobb–Douglas/Balancer). **This is the Gaussian / smooth member, `δ→∞` — consistent with the prior
reconcile finding that Cobb–Douglas is the `δ→∞` (Gaussian) corner, NOT `δ→0`.** Confident.

### Endpoint 2 — the log/exponential-curve invariant = the sharp-elbow Laplace limit (τ → 0)
Small `τ` ⇒ `r_τ(u) → sgn(u)` ⇒ `w(u)` → a **step** (`w₋` for `u<0`, `w₊` for `u>0`) ⇒ `dq/du` develops
a `δ`-like spike at ATM (`dq/du(0) = 1 + Δw/(2τ·w_mid(1−w_mid)) → ∞`). The latent return density's
kernel `exp(−α√(τ²+v²)) → exp(−α|v|)` — a **double-exponential / Laplace** ("log/exponential-curve")
member with a sharp vertex. So the τ→0 endpoint **is** the Laplace / sharp-elbow curve. The two named
endpoints are the two ends of one `τ` axis: `τ→∞` smooth Gaussian Balancer, `τ→0` sharp Laplace.
Confident. (Identification of "log/exponential-curve invariant" = Laplace/sharp-elbow: confident on
the math; whether the paper author meant precisely this object is a wording call — flag to operator.)

---

## 4. The `τ ↔ kurtosis` law, with the SIGN pinned to a named object

**CRITICAL — the sign of "kurtosis" is object-dependent (prior flag). Two real objects, opposite
signs.** A UI/paper label must name the object.

### Object L — the LATENT log-return driver density (recommended label-carrier)
`f(v) ∝ exp(−α√(τ²+v²))` (symmetric case; `α = γ+1`). This is the GH latent driver `f_β` and the
natural "implied return distribution" a trader/quant means by "kurtosis." Its **true excess kurtosis**
(direct moment integral, mpmath, with raised dps at large τ to kill integration noise):

| τ (α=4, γ=3) | excess kurtosis |
|---|---|
| 0.02 | 2.9538 |
| 0.08 | 2.6530 (= engine) |
| 0.3  | 1.6885 |
| 1    | 0.6961 |
| 3    | 0.2472 |
| 10   | 0.0749 |
| 30   | 0.0250 (matches asymptote `3/(τα)` exactly) |

**Monotone decreasing in `τ`; true/saturating, NOT an asymptote: → 3 (Laplace) as `τ→0`, → 0
(Gaussian) as `τ→∞`. Excess kurtosis ∈ [0, 3].** Cross-checks the prior note's GH kurtosis to all
printed digits (2.653/1.688/0.696/0.247). The `3/(τα)` formula is the large-`τ` asymptote only.

> **The monotone `τ → fatness` map for object L: small `τ` = LEPTOKURTIC (fat-tailed). The fatness
> dial is `1/τ`.** If the knob's UI label is "kurtosis / tail-fatness of the return distribution,"
> it should track object L, and **turning the dial toward fatter tails means DECREASING `τ`** (do not
> ship "τ up = fatter" — that is backwards, the same backwards-label the prior note caught).

### Object P — the PUSHFORWARD implied log-price (price-of-trade) density
`f_q` = pushforward of the Gaussian latent through `q(u) = u + log-odds(w(u))`. Its excess kurtosis is
**NEGATIVE / platykurtic** (the warp steepens ATM, spreading central mass): e.g. (symmetric
`w₋,w₊=0.3,0.7`, σ=1) `τ=0.3 → −1.116`, `τ=1 → −0.637`, `τ=3 → −0.144` — magnitude decreasing toward 0
as `τ→∞` (Gaussian), i.e. **most platykurtic at small `τ`**.

> **SIGN IS OPPOSITE between the two objects.** Object L (latent driver): small `τ` ⇒ leptokurtic.
> Object P (pushforward price-of-trade): small `τ` ⇒ platykurtic. Both are correct; they describe
> different densities. **Recommendation: the dial's exposed label should track object L** (the latent
> return distribution — the one matching "fat tails," the Merton/GH variance-mixing object, and the
> paper's "peakedness ... thin-tailed to fat-tailed" wording), with the explicit caveat that the
> *liquidity-density-on-the-curve* reading runs the other way. This is the **operator's labeling
> call** — I pin the math and recommend; I do not decide the exposed label.

---

## 5. Engine integration — what changes, minimally

`τ` slots in as the engine's `δ`, exposed instead of frozen. The conservation law, rebase, and wing
pricing are **unaffected** (kernel-orthogonal). Concretely (matching the REPARAM note's 4-fn analysis,
with `τ := δ`):

- **New scalar:** add `ghKappa` (≡ `ghDelta`) to the serialized pool scalars; recompute the Bessel-K
  normalizer `M` and the shape integrals `Φ_β, Φ_{β+1}` from it at calibration (they stay
  μ-independent ⇒ rebase-stable).
- **`getMP_raw` / `arbitrageToOracle` / `tradeUpdate`:** the tail/CDF cache keys on `τ` instead of the
  constant `0.08`; the `√(τ²+v²)` kernel replaces `√(0.08²+v²)`. Structure unchanged. Keep the
  **direct upper-tail integrals** (cancellation gotcha) and **same-table inversion** (FP-exact
  round-trips). At very large `τ` (Gaussian end) and very small `τ` (Laplace end), stress-test
  tail-integral precision — switch to the analytic Gaussian asymptote `exp(−α v²/2τ)` past a `τ`
  threshold if needed (numeric caveat carried from the REPARAM note).
- **`rebase`:** **NO structural change.** `τ` is rebase-invariant; carry it through unchanged.
  `sNorm_rebase_invariant` / PH-6 transfer verbatim.
- **Invariant, do NOT touch:** the Esscher tilt `f_{β+1}=e^v·f_β` and the slope law
  `|dy/dx| = getMP_raw·e^{−μ}` are **exact for every `τ`** ⇒ `value ∝ S^(−γ)` (G4) survives; the
  smooth-pasting boundary `S* = Kγ/(γ+1)` is algebraic in `γ` only (`τ`-free) ⇒ the seam gate is
  `τ`-invariant. `getSNorm`, `getDepth` unchanged.
- **Lean:** everything above the `AMMCurve` contract is untouched (zero-reproof transfer, demonstrated
  in `AMMCurve.lean`). Re-instantiate only the kernel-constant layer (`ghKernel_pos`,
  `ghKernel_logderiv = β − α·v/√(τ²+v²)`, `ghKernel_exponent_le` with `c = α−|β| > 0`, the measure
  theory) at the freed `τ` — same proof techniques, different constant.

**Minimal change = expose one frozen constant.** This is the lowest-blast-radius realization: the
machinery already runs the `√`-elbow; `τ` un-freezes its scale.

---

## 6. Numeric confirmations (mpmath, 25–60 digit; raw kept in my context)

- **F1 — base `τ` = plain Balancer EXACTLY.** Constant-`w` invariant `k = X^w·Y^{1−w}` constant along
  the frontier to **4.59e-41** relative deviation. `τ = 10⁶`: `max|w−w_mid| < 2.5e-7` over `|u|≤5`,
  `dq/du = 1.00000024`. ✓
- **F2 — wings stay power-law (asymptote intact), `τ`-independent.** `γ_loc(±100τ)` byte-identical
  across `τ ∈ {0.05, 1, 30}` (err 3.12e-5 / 1.25e-4); wing depletion slopes `→ −(1−w_±), w_±` (e.g.
  `−0.3999982, 0.6000018` at `u=−50`). `d γ_loc/du → 0` in wings. ✓
- **F3 — ATM elbow DOES change with `τ`.** `w'(0) = Δw/(2τ)` exact (e.g. `Δw=0.1`: `τ=1→0.05`,
  `τ=0.1→0.5`, `τ=0.01→5`); `dq/du(0)` grows `1.24 → 3.38 → 24.8`. Vertex rounds, wings don't move. ✓
- **F4 — recover the engine's GH at `τ = 0.08`.** Latent excess kurtosis reproduces the prior GH
  numbers to all printed digits: `τ=0.08→2.6530, 0.3→1.6885, 1→0.6961, 3→0.2472`. ✓
- **F5 — kurtosis law true/saturating.** Object L excess kurtosis monotone-decreasing, ∈[0,3], `→3`
  (τ→0), `→0` (τ→∞); large-`τ` matches `3/(τα)` asymptote (`τ=30 → 0.0250 = 3/120`). ✓
- **F6 — sign split confirmed.** Object L leptokurtic (small τ), object P pushforward platykurtic
  (`τ=0.3→−1.116, 1→−0.637, 3→−0.144`), opposite signs. ✓
- **F7 — validity for all `τ`.** Monotone elbow ⇒ `dq/du ≥ 1 > 0` over `[−20,20]` for `τ ∈ {0.05,1,30}`. ✓

---

## 7. Operator-escalation flags (curve/economic-object territory — I derive, operator decides)

1. **The curve choice and the knob's exposure are the operator's** (reopening locked GH architecture).
   I deliver the buildable form; shipping it is a Gate-2 decision.
2. **No clean algebraic invariant `F(x,y;w,τ)=k` exists** (confident, §0); the weight-profile (W) is
   the practical, engine-native form. The clean invariant exists only at the constant-`w` base.
3. **Knob-label sign is object-dependent (§4).** Recommend the dial track **object L** (latent return
   density) with `1/τ` = fatness; flag the pushforward-liquidity reading runs opposite. Do NOT ship
   "τ up = fatter." The exposed label is the operator's call.
4. **Asymmetric-`w` (skew) = the settlement fork — surfaced, as anticipated.** The clean single-`τ`
   knob holds `w₋, w₊` fixed and dials only `τ`. The wing weights `w_±` are the skew/γ_± carriers;
   **independent `w₋ ≠ w₊` makes both eigenfunctions `S^(±γ_±)` live** = the βh=0 / two-root
   settlement-semantics change (the FULL fork from the REPARAM note). The current single-γ put-only
   engine (βh=1) is the `w₋ = w₊` slice. **`τ` (kurtosis) is orthogonal to and does not touch this
   fork** — it is safe to ship `τ` with the skew held at the current setting (MINIMAL: free `τ`, keep
   the engine's skew). Freeing the skew is the separate, settlement-touching, operator-owned move.
5. **|Γ|>1 scope / calibration tier / paper claims** unchanged — not touched by this knob.

## Confidence ledger
- **CONFIDENT (numerically verified, 25–60 digit):** the profile (W)/(W′) and its `√`-elbow; asymptote
  preservation `γ_loc → γ_±` `τ`-independent with `O(τ²/|u|³)` wing-vanishing (F2); base `τ`→∞ = plain
  Balancer exact (F1); `τ`→0 = sharp Laplace endpoint (F3, §3); `τ := δ` tie reproduces engine GH
  kurtosis (F4); kurtosis law true/saturating ∈[0,3], monotone in `τ` (F5); object-dependent sign,
  L leptokurtic / P platykurtic (F6); validity for all `τ` (F7); the engine integration is
  kernel-constant + cache-keying only, rebase/conservation/wing-pricing orthogonal (§5).
- **NO clean algebraic invariant exists** (confident structural argument, §0 — the elbow warp is
  non-monomial; weight-profile is the form).
- **CONJECTURAL / operator-owned:** that the paper's "log/exponential-curve invariant" is precisely
  the τ→0 Laplace/sharp-elbow member (math confident, author-intent is a wording call); the exposed
  UI/paper label and which density object it names (§4, §7.3); the asymmetric-`w` settlement fork
  (§7.4); no Lean re-instantiation attempted (derivation pass, not a submit pass); the paper's
  "capital-efficiency/protection quantity conserved as τ varies" conjecture is NOT proven here (the
  Esscher/value-law `τ`-invariance §5 is consistent with it but a conservation proof is separate work).
```

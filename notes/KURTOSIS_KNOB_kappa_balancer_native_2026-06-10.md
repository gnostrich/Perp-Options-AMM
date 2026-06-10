# Single-parameter, asymptote-respecting kurtosis knob `κ` on the Balancer curve

_2026-06-10, research-lead. DELIVERABLE: a concrete, buildable, single-parameter `κ` that adds
asymptote-preserving kurtosis to the Balancer curve `x^w·y^(1−w)=k`, realizing the paper's
Future-Directions `(w, κ)` conjecture in implementable form. **No engine edits, no Aristotle submits,
no git** (manager commits + re-derives + audits). All numerics this pass: mpmath, 25–60 significant
digits, by direct construction/integration — not formula-arguing. Confident vs conjectural marked
inline._

Grounded in: `paper/temporal_paper_draft.md` (Conservation Law, Limitations, Future Directions `(w,κ)`
conjecture), `engine/knowledge/GH_MATH.md`, and prior notes
`HETEROGENEOUS_WEIGHT_implied_density_2026-06-09.md`, `REPARAM_balancer_kurtosis_dropin_2026-06-09.md`,
`CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md`. Hard constraints (manager-verified) honored:
asymptote-respecting (wings stay exact Balancer power-laws); `√(δ²+v²)`-elbow rounding mechanism (NOT a
tail-exponent `|v|^d` deformation); plain Balancer = the base; GH engine = one setting of `κ`.

---

## 0. HEADLINE — which form, and why

**I am delivering form (b): an explicit single-`κ` WEIGHT-PROFILE `w(u; w₋, w₊, κ)`, not a clean
closed-form algebraic invariant `F(x,y;w,κ)=k`.** This is the honest, buildable answer, and the reason
the clean invariant does **not** exist is structural, not a failure of effort:

> **FLAG (confident): no clean algebraic single-`κ` invariant `F(x,y;w,κ)=k` exists that both (i)
> reduces to `x^w·y^(1−w)=k` at the base and (ii) rounds the ATM elbow while keeping both wings exact
> power-laws.** A position-dependent weight `w(u)` is exactly a frontier on which the Cobb–Douglas
> invariant `K=X^{w}·Y^{1−w}` is *not* constant (it is constant **only** for constant `w` — verified
> below to 4.6e-41). The asymptote-preserving elbow is intrinsically a *non-monomial* warp of the
> marginal-price law, so there is no single algebraic `k`-level set carrying it. The GH engine itself
> is built this way — as a kernel/score construction, not an algebraic `F=k` — for the same reason.
> The weight-profile is therefore *the* practical (and the engine-native) form. The constant-`w`
> base **does** have the clean invariant `x^w·y^(1−w)=k`; the family around it does not.

The weight-profile drops straight into the existing dynamic-weight machinery (the paper's `w` is
already a derived field; the engine already runs a `w`-shaped score), so "form (b)" is not a weaker
deliverable here — it is the form the system is actually built in.

---

## 1. The explicit single-`κ` curve (the weight profile)

Coordinates (as in `GH_MATH.md` and the heterogeneous note): `u = log p − log P` (latent log-price,
`P = Ny/Nx` the carry), `p` the marginal price. The Balancer marginal-price law with a
position-dependent weight is, **by definition of Balancer**,

    p(u) = (w(u)/(1−w(u)))·(y/x),    q(u) := log p(u) = u + log( w(u)/(1−w(u)) ) + const.   (★)

### The proposed profile (single knob `κ`, `√`-elbow rounding)

    w(u; w₋, w₊, κ) = w_mid + (Δw/2)·r_κ(u),     r_κ(u) = u / √(κ² + u²),                  (W)

    with   w_mid = (w₋ + w₊)/2,   Δw = w₊ − w₋,
    and    w'(u) = (Δw/2)·κ² / (κ² + u²)^{3/2}.                                            (W′)

`r_κ(u) = u/√(κ²+u²)` is **the same `√(δ²+v²)`-elbow kernel the GH engine already uses** (it is exactly
`2·σ_GH(u) − 1` with `σ_GH(v) = (1 + v/√(δ²+v²))/2`, the GH latent score-sigmoid, see §3). It runs
`−1 → +1`, is smooth, monotone, and **linear-asymptote** (`r_κ → ±1` with `r_κ'(u) = κ²/(κ²+u²)^{3/2} →
0` like `κ²/|u|³` in the wings). So:

- `w(±∞) = w∓... ` → **`w(−∞) = w₋`, `w(+∞) = w₊`** (the two wing weights — these are the **skew/γ_±
  carriers**, held fixed; `κ` does **not** move them);
- `w'(0) = Δw/(2κ)` — the **ATM transition sharpness**, the single thing `κ` controls;
- the wings flatten (`w' → 0`), so each wing becomes an **exact constant-weight Balancer** — this is
  the asymptote-preservation property, proved in §2.

`κ` is the **single kurtosis knob.** Large `κ` = soft/flat elbow (toward plain Balancer); small `κ` =
sharp elbow.

### The role split (the `(w, κ)` family, made precise)

| object | carried by | what it sets |
|---|---|---|
| **convexity** `γ̄ = (γ₋+γ₊)/2` | `w_mid` via `γ_± = w_±/(1−w_±)` | average wing exponent |
| **skew** `Δγ = γ₊ − γ₋` | `Δw = w₊ − w₋` | wing-exponent asymmetry (the paper's `w` tilt) |
| **kurtosis** | **`κ`** (this knob) | ATM-elbow sharpness only |

The paper's `(w, κ)` family is exactly this: `w` is the skew axis (`w₋, w₊`, already present), `κ` is
the new kurtosis axis. Both are realized concretely in (W).

### Tie to the GH engine native knob `δ` (confident, exact)

The elbow kernel `r_κ` **is** the GH score-kernel. Setting

    κ := δ

makes (W) the GH elbow exactly: the GH latent score is `d log f_β/dv = β − α·v/√(δ²+v²)`, whose
sigmoid is `σ_GH(v) = (1 + r_δ(v))/2`, with `σ_GH'(0) = 1/(2δ)`; the profile's sharpness is
`w'(0) = Δw/(2κ)` — the **identical `1/(2·scale)` law**. So **`κ` is the engine-native `δ` re-labeled
as the kurtosis dial**, and the current engine (`δ = 0.08`) is the single setting `κ = 0.08`.

---

## 2. ASYMPTOTE PRESERVATION — wings stay `value ∝ S^(−γ_±)` for ALL `κ`

This is the non-negotiable property. Two demonstrations.

### Analytic
The local value-law exponent is `γ_loc(u) = w(u)/(1−w(u))`. As `|u| → ∞`, `r_κ(u) → ±1`, so
`w(u) → w_±` and `γ_loc(u) → γ_± = w_±/(1−w_±)`, **independent of `κ`**. The approach rate is governed
by `w'(u) = (Δw/2)·κ²/(κ²+u²)^{3/2} = O(κ²/|u|³) → 0` — the rounding is `O(1)` near ATM and **vanishes
like `1/|u|³` in the wings, for every fixed `κ`**. The reserve depletion slopes therefore flatten to
the exact Balancer constants `d log X/du → −(1−w_±)`, `d log Y/du → +w_±`, i.e. each wing is the exact
Balancer `X ∝ e^{−(1−w_±)u}`, `Y ∝ e^{w_±u}` ⇒ `value ∝ S^(−γ_±)`. A tail-exponent deformation would
instead bend `γ_loc` itself in the wings; this `√`-rounding does not — it only changes the *vertex*.

### Numeric (mpmath, 40 digit) — the scale-invariance is the proof

`γ_loc` evaluated at `u = 100·κ` (deep wing relative to the elbow scale) is **identical for every `κ`**:

| κ | u = ±100κ | γ_loc(−) / γ_loc(+) | err vs (γ₋=1.5, γ₊=4) |
|---|---|---|---|
| 0.05 | ±5 | 1.50003124805 / 3.9998750125 | 3.12e-5 / 1.25e-4 |
| 1 | ±100 | 1.50003124805 / 3.9998750125 | 3.12e-5 / 1.25e-4 |
| 30 | ±3000 | 1.50003124805 / 3.9998750125 | 3.12e-5 / 1.25e-4 |

The error is **`κ`-independent** (byte-identical across three decades of `κ`): `κ` is a pure horizontal
rescaling of the elbow, and the wing exponent it converges to is fixed by `w_±` alone. And
`d γ_loc/du → 0` in the wings (e.g. `< 1e-7` at `|u| = 40` for `κ ≤ 1`). **Asymptote preserved for all
`κ`. Confident.**

(Validity: `w' ≥ 0` for the natural monotone-increasing elbow (`w₊ > w₋`) ⇒ `dq/du = 1 + w'/(w(1−w)) ≥
1 > 0` always ⇒ a valid `AMMCurve` (`antitone_y`/`convex_y`/`coercive` all hold) for **every** `κ`,
checked min `dq/du ∈ [1.0000001, 1.0083]` over `[−20,20]`. For a call-heavy skew `w₊ < w₋` the gate is
`w' > −w(1−w)`, which bounds `κ` from below — a hard type gate, not a tuning knob.)

---

## 3. The two paper endpoints — recovered as two settings of `κ`

The Future-Directions text asks for "the present invariant and a log/exponential-curve invariant
arising as two settings of the same `κ`." Both confirmed.

### Endpoint 1 — plain Balancer = the base (κ → ∞)
Large `κ` ⇒ `r_κ(u) → 0` over any finite operating window ⇒ `w(u) → w_mid` **constant** ⇒ `dq/du → 1`
(pure linear warp) ⇒ the curve is the exact constant-weight Balancer `x^{w_mid}·y^{1−w_mid} = k`.
Numerically: at `κ = 10⁶`, `max|w(u) − w_mid| < 2.5e-7` over `|u| ≤ 5`, `dq/du = 1.00000024`. And the
constant-`w` invariant `K = X^w·Y^{1−w}` is **constant to 4.6e-41** along the frontier (machine-exact
Cobb–Douglas/Balancer). **This is the Gaussian / smooth member, `δ→∞` — consistent with the prior
reconcile finding that Cobb–Douglas is the `δ→∞` (Gaussian) corner, NOT `δ→0`.** Confident.

### Endpoint 2 — the log/exponential-curve invariant = the sharp-elbow Laplace limit (κ → 0)
Small `κ` ⇒ `r_κ(u) → sgn(u)` ⇒ `w(u)` → a **step** (`w₋` for `u<0`, `w₊` for `u>0`) ⇒ `dq/du` develops
a `δ`-like spike at ATM (`dq/du(0) = 1 + Δw/(2κ·w_mid(1−w_mid)) → ∞`). The latent return density's
kernel `exp(−α√(κ²+v²)) → exp(−α|v|)` — a **double-exponential / Laplace** ("log/exponential-curve")
member with a sharp vertex. So the κ→0 endpoint **is** the Laplace / sharp-elbow curve. The two named
endpoints are the two ends of one `κ` axis: `κ→∞` smooth Gaussian Balancer, `κ→0` sharp Laplace.
Confident. (Identification of "log/exponential-curve invariant" = Laplace/sharp-elbow: confident on
the math; whether the paper author meant precisely this object is a wording call — flag to operator.)

---

## 4. The `κ ↔ kurtosis` law, with the SIGN pinned to a named object

**CRITICAL — the sign of "kurtosis" is object-dependent (prior flag). Two real objects, opposite
signs.** A UI/paper label must name the object.

### Object L — the LATENT log-return driver density (recommended label-carrier)
`f(v) ∝ exp(−α√(κ²+v²))` (symmetric case; `α = γ+1`). This is the GH latent driver `f_β` and the
natural "implied return distribution" a trader/quant means by "kurtosis." Its **true excess kurtosis**
(direct moment integral, mpmath, with raised dps at large κ to kill integration noise):

| κ (α=4, γ=3) | excess kurtosis |
|---|---|
| 0.02 | 2.9538 |
| 0.08 | 2.6530 (= engine) |
| 0.3  | 1.6885 |
| 1    | 0.6961 |
| 3    | 0.2472 |
| 10   | 0.0749 |
| 30   | 0.0250 (matches asymptote `3/(κα)` exactly) |

**Monotone decreasing in `κ`; true/saturating, NOT an asymptote: → 3 (Laplace) as `κ→0`, → 0
(Gaussian) as `κ→∞`. Excess kurtosis ∈ [0, 3].** Cross-checks the prior note's GH kurtosis to all
printed digits (2.653/1.688/0.696/0.247). The `3/(κα)` formula is the large-`κ` asymptote only.

> **The monotone `κ → fatness` map for object L: small `κ` = LEPTOKURTIC (fat-tailed). The fatness
> dial is `1/κ`.** If the knob's UI label is "kurtosis / tail-fatness of the return distribution,"
> it should track object L, and **turning the dial toward fatter tails means DECREASING `κ`** (do not
> ship "κ up = fatter" — that is backwards, the same backwards-label the prior note caught).

### Object P — the PUSHFORWARD implied log-price (price-of-trade) density
`f_q` = pushforward of the Gaussian latent through `q(u) = u + log-odds(w(u))`. Its excess kurtosis is
**NEGATIVE / platykurtic** (the warp steepens ATM, spreading central mass): e.g. (symmetric
`w₋,w₊=0.3,0.7`, σ=1) `κ=0.3 → −1.116`, `κ=1 → −0.637`, `κ=3 → −0.144` — magnitude decreasing toward 0
as `κ→∞` (Gaussian), i.e. **most platykurtic at small `κ`**.

> **SIGN IS OPPOSITE between the two objects.** Object L (latent driver): small `κ` ⇒ leptokurtic.
> Object P (pushforward price-of-trade): small `κ` ⇒ platykurtic. Both are correct; they describe
> different densities. **Recommendation: the dial's exposed label should track object L** (the latent
> return distribution — the one matching "fat tails," the Merton/GH variance-mixing object, and the
> paper's "peakedness ... thin-tailed to fat-tailed" wording), with the explicit caveat that the
> *liquidity-density-on-the-curve* reading runs the other way. This is the **operator's labeling
> call** — I pin the math and recommend; I do not decide the exposed label.

---

## 5. Engine integration — what changes, minimally

`κ` slots in as the engine's `δ`, exposed instead of frozen. The conservation law, rebase, and wing
pricing are **unaffected** (kernel-orthogonal). Concretely (matching the REPARAM note's 4-fn analysis,
with `κ := δ`):

- **New scalar:** add `ghKappa` (≡ `ghDelta`) to the serialized pool scalars; recompute the Bessel-K
  normalizer `M` and the shape integrals `Φ_β, Φ_{β+1}` from it at calibration (they stay
  μ-independent ⇒ rebase-stable).
- **`getMP_raw` / `arbitrageToOracle` / `tradeUpdate`:** the tail/CDF cache keys on `κ` instead of the
  constant `0.08`; the `√(κ²+v²)` kernel replaces `√(0.08²+v²)`. Structure unchanged. Keep the
  **direct upper-tail integrals** (cancellation gotcha) and **same-table inversion** (FP-exact
  round-trips). At very large `κ` (Gaussian end) and very small `κ` (Laplace end), stress-test
  tail-integral precision — switch to the analytic Gaussian asymptote `exp(−α v²/2κ)` past a `κ`
  threshold if needed (numeric caveat carried from the REPARAM note).
- **`rebase`:** **NO structural change.** `κ` is rebase-invariant; carry it through unchanged.
  `sNorm_rebase_invariant` / PH-6 transfer verbatim.
- **Invariant, do NOT touch:** the Esscher tilt `f_{β+1}=e^v·f_β` and the slope law
  `|dy/dx| = getMP_raw·e^{−μ}` are **exact for every `κ`** ⇒ `value ∝ S^(−γ)` (G4) survives; the
  smooth-pasting boundary `S* = Kγ/(γ+1)` is algebraic in `γ` only (`κ`-free) ⇒ the seam gate is
  `κ`-invariant. `getSNorm`, `getDepth` unchanged.
- **Lean:** everything above the `AMMCurve` contract is untouched (zero-reproof transfer, demonstrated
  in `AMMCurve.lean`). Re-instantiate only the kernel-constant layer (`ghKernel_pos`,
  `ghKernel_logderiv = β − α·v/√(κ²+v²)`, `ghKernel_exponent_le` with `c = α−|β| > 0`, the measure
  theory) at the freed `κ` — same proof techniques, different constant.

**Minimal change = expose one frozen constant.** This is the lowest-blast-radius realization: the
machinery already runs the `√`-elbow; `κ` un-freezes its scale.

---

## 6. Numeric confirmations (mpmath, 25–60 digit; raw kept in my context)

- **F1 — base `κ` = plain Balancer EXACTLY.** Constant-`w` invariant `K = X^w·Y^{1−w}` constant along
  the frontier to **4.59e-41** relative deviation. `κ = 10⁶`: `max|w−w_mid| < 2.5e-7` over `|u|≤5`,
  `dq/du = 1.00000024`. ✓
- **F2 — wings stay power-law (asymptote intact), `κ`-independent.** `γ_loc(±100κ)` byte-identical
  across `κ ∈ {0.05, 1, 30}` (err 3.12e-5 / 1.25e-4); wing depletion slopes `→ −(1−w_±), w_±` (e.g.
  `−0.3999982, 0.6000018` at `u=−50`). `d γ_loc/du → 0` in wings. ✓
- **F3 — ATM elbow DOES change with `κ`.** `w'(0) = Δw/(2κ)` exact (e.g. `Δw=0.1`: `κ=1→0.05`,
  `κ=0.1→0.5`, `κ=0.01→5`); `dq/du(0)` grows `1.24 → 3.38 → 24.8`. Vertex rounds, wings don't move. ✓
- **F4 — recover the engine's GH at `κ = 0.08`.** Latent excess kurtosis reproduces the prior GH
  numbers to all printed digits: `κ=0.08→2.6530, 0.3→1.6885, 1→0.6961, 3→0.2472`. ✓
- **F5 — kurtosis law true/saturating.** Object L excess kurtosis monotone-decreasing, ∈[0,3], `→3`
  (κ→0), `→0` (κ→∞); large-`κ` matches `3/(κα)` asymptote (`κ=30 → 0.0250 = 3/120`). ✓
- **F6 — sign split confirmed.** Object L leptokurtic (small κ), object P pushforward platykurtic
  (`κ=0.3→−1.116, 1→−0.637, 3→−0.144`), opposite signs. ✓
- **F7 — validity for all `κ`.** Monotone elbow ⇒ `dq/du ≥ 1 > 0` over `[−20,20]` for `κ ∈ {0.05,1,30}`. ✓

---

## 7. Operator-escalation flags (curve/economic-object territory — I derive, operator decides)

1. **The curve choice and the knob's exposure are the operator's** (reopening locked GH architecture).
   I deliver the buildable form; shipping it is a Gate-2 decision.
2. **No clean algebraic invariant `F(x,y;w,κ)=k` exists** (confident, §0); the weight-profile (W) is
   the practical, engine-native form. The clean invariant exists only at the constant-`w` base.
3. **Knob-label sign is object-dependent (§4).** Recommend the dial track **object L** (latent return
   density) with `1/κ` = fatness; flag the pushforward-liquidity reading runs opposite. Do NOT ship
   "κ up = fatter." The exposed label is the operator's call.
4. **Asymmetric-`w` (skew) = the settlement fork — surfaced, as anticipated.** The clean single-`κ`
   knob holds `w₋, w₊` fixed and dials only `κ`. The wing weights `w_±` are the skew/γ_± carriers;
   **independent `w₋ ≠ w₊` makes both eigenfunctions `S^(±γ_±)` live** = the βh=0 / two-root
   settlement-semantics change (the FULL fork from the REPARAM note). The current single-γ put-only
   engine (βh=1) is the `w₋ = w₊` slice. **`κ` (kurtosis) is orthogonal to and does not touch this
   fork** — it is safe to ship `κ` with the skew held at the current setting (MINIMAL: free `κ`, keep
   the engine's skew). Freeing the skew is the separate, settlement-touching, operator-owned move.
5. **|Γ|>1 scope / calibration tier / paper claims** unchanged — not touched by this knob.

## Confidence ledger
- **CONFIDENT (numerically verified, 25–60 digit):** the profile (W)/(W′) and its `√`-elbow; asymptote
  preservation `γ_loc → γ_±` `κ`-independent with `O(κ²/|u|³)` wing-vanishing (F2); base `κ`→∞ = plain
  Balancer exact (F1); `κ`→0 = sharp Laplace endpoint (F3, §3); `κ := δ` tie reproduces engine GH
  kurtosis (F4); kurtosis law true/saturating ∈[0,3], monotone in `κ` (F5); object-dependent sign,
  L leptokurtic / P platykurtic (F6); validity for all `κ` (F7); the engine integration is
  kernel-constant + cache-keying only, rebase/conservation/wing-pricing orthogonal (§5).
- **NO clean algebraic invariant exists** (confident structural argument, §0 — the elbow warp is
  non-monomial; weight-profile is the form).
- **CONJECTURAL / operator-owned:** that the paper's "log/exponential-curve invariant" is precisely
  the κ→0 Laplace/sharp-elbow member (math confident, author-intent is a wording call); the exposed
  UI/paper label and which density object it names (§4, §7.3); the asymmetric-`w` settlement fork
  (§7.4); no Lean re-instantiation attempted (derivation pass, not a submit pass); the paper's
  "capital-efficiency/protection quantity conserved as κ varies" conjecture is NOT proven here (the
  Esscher/value-law `κ`-invariance §5 is consistent with it but a conservation proof is separate work).
```

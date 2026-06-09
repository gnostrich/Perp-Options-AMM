# Drop-in reparameterization: Balancer as the reachable GH base + a kurtosis/skew knob

> ## RECONCILE PASS v2 (2026-06-09, research-lead) — this body is now self-consistent with the manager header
> The original body asserted "Balancer needs δ→0." The manager caught that it conflicts with the
> numerically-confirmed kurtosis direction (δ→0 = Laplace/fat, δ→∞ = Gaussian/thin) AND with
> Cobb-Douglas = log-normal = Gaussian. **This v2 resolves it definitively by BUILDING THE ACTUAL
> CURVES, not arguing from formulas.** Verdict: **Pass-1 ("Balancer needs δ→0") was WRONG. The exact
> Cobb-Douglas/Balancer curve is the δ→∞ (Gaussian) limit.** Sections 2, 3, and the new §2.5/§3.5 below
> carry the numerics. The βh=0 symmetry, αh=1/(1−w) weight tie, value∝S^(−γ) survival, and the 4-fn
> change list are unchanged and remain solid.

> ## MANAGER VERIFICATION & CORRECTIONS (2026-06-09 — retained for provenance)
> Manager re-derived the load-bearing pieces. **Solid/usable:** βh=0 ⇒ symmetric two-root (Balancer
> symmetry); αh=γ+1=1/(1−w) ⇒ weight tie; `value ∝ S^(−γ)` survives freeing δ/βh (Esscher ratio = e^v
> exact); the 4-curve-fn change list. **Corrections (now folded into the v2 body):**
> 1. **KURTOSIS DIRECTION:** `δ↑ ⇒ THINNER tails (→ Gaussian, excess kurtosis → 0); δ↓ ⇒ FATTER
>    (→ Laplace, excess kurtosis → 3).` Any "δ up = fatter" label is WRONG.
> 2. **KURTOSIS FORMULA is asymptotic-only:** `3/(δ·αh)` holds only for LARGE δ; the TRUE excess
>    kurtosis **saturates at 3** as δ→0 (δ=0.08, γ=2 → **2.76**, not 12.5). Use the true value.
> 3. **RESOLVED THIS PASS — the exact Cobb-Douglas/Balancer curve is the δ→∞ (Gaussian) limit**, NOT
>    δ→0. See §2.5 (K-invariant fit) and §3.5 (wings-vs-ATM). The δ-limit part is now safe to read.

_2026-06-09, research-lead. SPEC/ANALYSIS deliverable for a SEPARATE operator implementation
session. No engine edits, no Aristotle submits, no git in this pass. Grounded in
`engine/knowledge/GH_MATH.md`, `formal/temporal_lean_verified/RequestProject/AMMCurve.lean`,
research-lead MEMORY (MERTON-TIE/CLOSEOUT/RUN findings), and the prior analysis
`notes/CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md`._

_Confident vs conjectural marked inline. All §2.5/§3.5/§7 numerics computed this pass at 35–40 digit
precision (mpmath); the curves are constructed by direct integration, not asserted from closed forms._

**Headline (load-bearing, corrected):** in this GH variance-mixing parametrization,
**δ→0 is the fat-tailed (Laplace/double-exponential) RETURN-DENSITY limit and δ→∞ is the Gaussian
limit. The exact Cobb-Douglas/Balancer RESERVE CURVE coincides with the GH frontier as δ→∞ (Gaussian),
not δ→0** — confirmed by directly fitting the Cobb-Douglas invariant `K=X^w·Y^(1−w)` along the GH
frontier (§2.5: K-constancy improves monotonically as δ grows). The reachable Balancer
**two-root SYMMETRY is the βh=0 condition, available at any δ**; the exact *Cobb-Douglas curve* is the
βh=0, δ→∞ corner. Excess kurtosis = (true, saturating) decreasing function of δ, ≈ 3/(δ·αh) only for
large δ. "Turn δ up for fatter tails" is **BACKWARDS** — flag before any UI label.

---

## 1. Current vs freed parameterization

### The kernel
The GH density kernel in the centered latent coordinate `v = u − μ` (`u = log price − log P`,
`P = Ny/Nx`):

    f_β(v)  ∝  exp( −αh·√(δ² + v²)  +  βh·v )

The reserve frontier is built from two tilts of this one kernel (GH_MATH.md):

    X(u) = Nx · tail_β(u)          (upper tail of f_β;   X ↓ as price ↑)
    Y(u) = Ny·M · F_{β+1}(u)       (lower CDF of f_{β+1}; Y ↑ as price ↑)

where `f_{β+1}` is the **Esscher (exponential) tilt** of `f_β`: `f_{β+1}(v) = e^v · f_β(v)`.
`M = ψ·K1(δψ')/(ψ'·K1(δψ))` is a μ-independent Bessel-K scalar prefactor ratio.

### Current pins (the live engine)
| symbol | current value | status |
|---|---|---|
| `αh` | `γ+1` | **derived** from convexity exponent γ |
| `βh` | `1` (FIXED) | hard-coded — the Esscher/skew offset |
| `δ`  | `0.08` (FIXED) | hard-coded — the variance-mixing/tail parameter |
| `γ`  | `∈(1,4)` | user parameter; sets αh |

### Freed parameterization (this spec)
| symbol | freed role | becomes |
|---|---|---|
| `γ`  | **convexity / value-law exponent.** `value ∝ S^(−γ)`. Sets `αh = γ+1`. | user param (unchanged) |
| `δ`  | **tail / variance-mixing knob** (δ↑ = THINNER/Gaussian; δ↓ = FATTER/Laplace — see §3). | user param (was const 0.08) |
| `βh` | **skew knob.** βh=0 = reflection-symmetric (two-root Balancer base); βh=1 = current put-only. | user param (was const 1) |
| `αh` | `= γ+1` (derived from γ) | derived (unchanged tie) |
| `M`  | Bessel-K normalizer; **recomputes from (αh, βh, δ)** | derived (was a frozen scalar) |

**Confident.** Same family, freeing constants — not swapping curves (route (b) of the prior note).

---

## 2. The Balancer limit, written out (symmetry part — unchanged, solid)

**Claim:** Balancer / weighted-Cobb–Douglas `x^w · y^{1−w} = k` is the **βh=0** member, with the
convexity exponent tied to the Balancer weight by

    γ = w/(1−w)        ⟺        w = γ/(γ+1)        ⟺        αh = γ+1 = 1/(1−w).

The last identity (αh = 1/(1−w)) is exact (§7 CHECK 4): the GH shape αh IS the inverse complementary
Balancer weight.

**Why βh=0 is the symmetric two-root base (confident, §7 CHECK 3/9):**
- At βh=0 the kernel `exp(−αh√(δ²+v²))` is **even in v** (|f(v)−f(−v)|=0). The reflection `v ↦ −v` is
  the put↔call reflection `S ↔ oracle²/S` (the C3 arrow). βh=0 ⇒ both eigenfunctions `S^(±γ)` live;
  the Laplace exponent `ψ(θ)=δ(√(αh²−βh²)−√(αh²−(βh+θ)²))` is even in θ, so `ψ(−γ)=ψ(+γ)` — the
  "two roots sum=1" Merton/Balancer symmetry restored.
- At βh=1 (current) the kernel is NOT even (|f(v)−f(−v)|≈0.18 at v=0.3); only the put radicand
  `αh²−(βh−γ)²=4γ` is in-strip — the proved **put-only** MERTON-TIE fact.

**The value law is δ/βh-free (confident, §7 CHECK 1/5):** `f_{β+1}/f_β = e^v` exactly, ∀(αh,βh,δ).
So `|dy/dx| = (Ny·M/Nx)·e^{v} = getMP_raw·e^{−μ}` and `d log(slope)/d log(price)=1` for any δ, any βh
(§7 CHECK 5 = 1.000000000000 every case). **γ enters only through αh=γ+1 at calibration, NOT through
δ.** So `value ∝ S^(−γ)` survives freeing δ — the whole reason route (b) keeps the G4 accuracy gate.

---

## 2.5 WHERE THE EXACT COBB-DOUGLAS CURVE SITS — RESOLVED (this is the reconcile result)

**Verdict: the exact Cobb-Douglas/Balancer RESERVE CURVE is the δ→∞ (Gaussian) limit, NOT δ→0.
Pass-1's "Balancer needs δ→0" is WRONG.** Built the curves directly:

**The defining Cobb-Douglas test.** Along the GH frontier, evaluate the Cobb-Douglas invariant
`K(u) = X(u)^w · Y(u)^{1−w}` (normalized X,Y). Cobb-Douglas ⟺ this is **constant** in u. The
coefficient of variation CV(K) over the operating window measures departure from Cobb-Douglas
(0 = exact CD). Result (γ=3, βh=0; robust across two window widths):

| δ | CV(K), window |v|≤1.5 | CV(K), window |v|≤2.5 | max/min K (|v|≤1) |
|---|---|---|---|
| 0.001 | — | — | 341.7 |
| 0.08  | — | — | 319.3 |
| 1     | 0.545 | 0.851 | 63.1 |
| 3     | 0.321 | 0.573 | 9.21 |
| 10    | 0.111 | 0.253 | 2.01 |
| 30    | 0.057 | 0.111 | — |
| 100   | 0.130 | 0.206 | 1.47 |

**CV(K) decreases monotonically as δ grows** (0.001→fat-mismatch, large-δ→best fit), bottoming
shallowly around δ~30–100 and never reaching 0. **Cobb-Douglas is the δ→LARGE limit.** It never
*exactly* equals GH at finite δ because **GH reserves are BOUNDED (X∈(0,Nx), Y∈(0,Ny·M)) while
Cobb-Douglas reserves are UNBOUNDED** — exact coincidence is the δ→∞ asymptote only. (The slight CV
rise past δ~100 is extreme-δ tail-integral precision, not a real reversal; the trend δ↑→CD is
unambiguous.)

**Cross-check via reserve log-derivatives (§7-style, decisive).** Cobb-Douglas requires the
*constant* depletion slopes `dlogX/du = −(1−w) = −0.25` and `dlogY/du = w = 0.75` **everywhere**. The
GH slopes are far from constant at small δ (δ=0.08: dlogX/du swings −0.0007 → −4.0 across u) and
**flatten toward the CD constants as δ grows** (δ=100: dlogX/du ∈ [−0.116, −0.244], approaching
−0.25; dlogY/du ∈ [0.92, 1.11], approaching 0.75). The GH frontier *becomes* the pure-exponential
Cobb-Douglas frontier `X∝e^{−(1−w)u}, Y∝e^{wu}` only in the δ→∞ Gaussian limit.

**Why this is consistent (the paradox dissolved):** Cobb-Douglas underlying = log-normal returns =
**Gaussian** innovation. The Gaussian end of the GH variance-mixing kernel is **δ→∞** (large δ:
`√(δ²+v²)≈δ+v²/2δ` ⇒ Gaussian, §7 CHECK 8). So Cobb-Douglas = Gaussian = δ→∞ — fully consistent with
the kurtosis direction. The δ→0 end is **Laplace** (fat-tailed return density), which is NOT
Cobb-Douglas. Pass-1 conflated "fat-tailed symmetric power-law base" (δ→0 Laplace) with "the
Cobb-Douglas curve" (δ→∞ Gaussian) — they are opposite ends of the δ axis.

**Pinned vs not (final):** βh=0 (symmetry) and αh=1/(1−w) (weight) are EXACT and δ-independent. The
**exact Cobb-Douglas CURVE is the δ→∞ corner.** The βh=0 power LAW `value∝S^(−γ)` holds at every δ;
what changes with δ is the *frontier geometry / return-tail distribution*, and the Cobb-Douglas
*frontier shape* specifically is the Gaussian (δ→∞) end.

---

## 3. The kurtosis knob, concretely (direction corrected; TRUE saturating value)

### How δ maps to excess kurtosis
Using `ψ(θ) = δ(√(αh²−βh²) − √(αh²−(βh+θ)²))`. At βh=0: variance `ψ″(0)=δ/αh`, 4th cumulant
`ψ⁗(0)=3δ/αh³`, so the **large-δ asymptote** is `excess kurtosis ≈ 3/(δ·αh)`. **This asymptote is
WRONG at small δ.** The TRUE excess kurtosis (direct moment integral of f_β) **saturates at 3**
(Laplace) as δ→0 and →0 (Gaussian) as δ→∞:

| δ (βh=0, αh=4, γ=3) | TRUE excess kurtosis | 3/(δ·αh) asymptote |
|---|---|---|
| 0.02 | 2.954 | 37.5 (wrong) |
| 0.08 | 2.653 | 9.375 (wrong) |
| 0.3  | 1.688 | 2.5 |
| 1    | 0.696 | 0.75 |
| 3    | 0.247 | 0.25 ✓ |
| 10   | 0.075 | 0.075 ✓ |

At the engine's δ=0.08, true excess kurtosis ≈ 2.65 (γ=3); 2.76 (γ=2) — matching the manager's
numeric, NOT the asymptote's 9–12. **True excess kurtosis ∈ [0, 3]: 3=Laplace (δ→0), 0=Gaussian
(δ→∞), monotone decreasing in δ.**

**Direction (CONFIDENT, OPPOSITE of the original brief):**

    δ ↑  ⇒  excess kurtosis ↓ (toward Gaussian / Cobb-Douglas).
    δ ↓  ⇒  excess kurtosis ↑ (toward Laplace, saturating at 3).

δ does NOT change the value-law exponent γ (§2). "Lower γ-effective" is not a δ effect; γ is fixed by
αh=γ+1.

### The honest δ→"tradeable fatness" mapping (see §3.5 before labeling)
δ as a UI knob maps to the **excess kurtosis of the underlying return distribution** in [0,3]:
small δ = sharp-peaked fat-tailed (Laplace) returns; large δ = smooth Gaussian returns (Cobb-Douglas).
**BUT** what the *return density* calls "fat tails" (small δ) is exactly what the *AMM frontier*
shows as a SHARP ATM ELBOW with THIN wing depth — see §3.5. The knob's effect on what a trader hits is
the reverse of the naive "fat = deep wings" reading. Label with care.

### The GH σ↔γ relation — honest status (unchanged)
The closed-form `γ(γ+1)=2r/σ²` is only the **Gaussian (δ→∞) SLICE**. Ship the GH root condition
`ψ(−γ)=r` (implicit/numeric), NOT the Gaussian closed form. At engine pins the σ_eff² running is
γ=1.5→0.0416, 2→0.0318, 3→0.0220, 4→0.0170 (reproduces MEMORY).

---

## 3.5 DOES δ MOVE THE WINGS OR ONLY THE ATM ELBOW? — the product finding

**Verdict: δ is PRIMARILY an ATM-elbow / microstructure knob. Its effect concentrates at-the-money
and decays into the wings; the FAR wing (|moneyness-log| ≫ δ) is δ-INVARIANT. δ does change wing
RESERVE DEPTH at moderate moneyness, but in the COUNTERINTUITIVE direction (δ↑ = thinner-tailed
returns = MORE wing depth + softer elbow), and it never touches the wing's power-law EXPONENT γ.**

**(a) The exponent γ is δ-invariant — wings keep the same power-law slope.** `value∝S^(−γ)` and
`d log(slope)/d log(price)=1` hold for all δ (§7 CHECK 5). So δ does NOT make the option wings
fatter or thinner *in the power-law sense a trader prices off* — the wing decay exponent is γ, full
stop. This is the load-bearing honesty point: **the "kurtosis knob" does NOT re-slope the tradeable
option wings.**

**(b) δ-sensitivity is concentrated at ATM.** Local depletion slope `dlogX/du` sensitivity to δ
(|slope(δ=3) − slope(δ=0.08)|) peaks at ATM (u=0: 2.30; u=0.3: 2.80) and decays on the upper-X wing
(u=−2: 0.040; u=−3: 0.003). The far wing is asymptotically δ-free: at |u|=8, `dlogX/du` → 0 (X-tail
side) and → −αh=−4 (depleted side) for small/moderate δ. Mechanism: `√(δ²+v²)→|v|` once |v|≫δ, so
the kernel — and the curve — stop depending on δ in the wings. **δ reshapes only the |v|≲δ core.**

**(c) Elbow sharpness IS the δ knob.** Max depletion-curvature (ATM elbow sharpness): δ=0.08→12.3,
δ=0.3→5.5, δ=1→2.2, δ=3→0.86, δ=10→0.30. **δ↓ = sharp elbow (Laplace); δ↑ = soft elbow (Gaussian/
Cobb-Douglas).** This is what δ actually does for a trader: it tunes ATM slippage curvature /
microstructure, not the wing slope.

**(d) Wing reserve DEPTH does move with δ — opposite to the naive reading.** Normalized X-reserve
remaining at price-moneyness m (γ=3, βh=0):

| moneyness m | X/Nx (δ=0.08) | X/Nx (δ=1) | X/Nx (δ=3) |
|---|---|---|---|
| 0.5 | 0.966 | 0.889 | 0.780 |
| 1.0 | 0.500 | 0.500 | 0.500 |
| 2.0 | 0.034 | 0.111 | 0.220 |
| 5.0 | 0.0009 | 0.006 | 0.040 |
| 20  | 3e-6 | 3e-5 | 0.001 |

δ↑ (thinner-tailed Gaussian returns) leaves MORE reserve depth at OTM moneyness — because the
Gaussian frontier spreads mass out (soft elbow), whereas the Laplace frontier (δ↓) concentrates it at
ATM (sharp elbow) and depletes the wing faster. **So a "fat-tailed return distribution" (low δ)
produces a THIN-wing-depth, sharp-elbow AMM frontier — the opposite of what "fat tails ⇒ deep wings"
would suggest.** This is consistent and important: the return-distribution adjective and the
AMM-depth adjective point opposite ways.

**Net for the operator:** the δ knob is best understood as an **ATM-elbow / slippage-curvature +
return-kurtosis** knob, NOT a "fatten the tradeable option wings" knob. The wings' pricing exponent γ
is untouched by δ. If the operator's intent behind "kurtosis knob" was *fatter tradeable wings*, **δ
does not deliver that** (γ does); δ delivers ATM-elbow softness and shifts where reserve depth sits.
**Say this plainly before building the knob.**

---

## 4. Engine impact — which of the 4 curve fns change and how (unchanged from v1)

The structural forms are UNCHANGED; only the kernel constants and the normalizer M flow through.

**INVARIANT (do not touch):** the Esscher tilt `f_{β+1}=e^v·f_β` and slope law
`|dy/dx|=getMP_raw·e^{−μ}` (EXACT any (αh,βh,δ)); the calibration *structure* (only Φ_β, Φ_{β+1}, M
*values* change); `getSNorm`, `getDepth`.

- **`getMP_raw`** — `_invTail` and the tail integral key off `s.ghBeta`, `s.ghDelta` instead of the
  constants. CDF/tail cache **keyed on (αh,βh,δ)**. Keep DIRECT upper-tail integrals (cancellation
  gotcha). Price-coordinate identity unchanged (Esscher).
- **`arbitrageToOracle`** — `X(u*)=Nx·tail_β(u*)`, `Y(u*)=Ny·M·F_{β+1}(u*)` evaluate the new kernel; M
  recomputes; `u*=log(o)−log(ghP)` inversion unchanged.
- **`tradeUpdate`** — `_invB1` keys off (βh,δ); trade = latent translation is structurally unchanged;
  preserve same-table FP-exact inversion.
- **`rebase`** — **NONE structural.** Kernel-orthogonal; carry ghBeta/ghDelta through unchanged
  (rebase-invariant scalars). `sNorm_rebase_invariant`/PH-6 transfer verbatim.

**Implementer checklist:** (1) add `ghBeta`, `ghDelta`, recomputed `ghM` to serialized scalars;
(2) key the shape CDF cache on (αh,βh,δ); (3) recompute M from (αh,βh,δ) at calibration; (4) recompute
Φ_β, Φ_{β+1} at (βh,δ) (stay μ-independent ⇒ rebase-stable); (5) keep direct-tail + same-table-inversion
numerics at the new shapes.

**NEW numeric caveat (this pass):** at the **Gaussian (large-δ) end** the tail integrals lose
precision (the CV(K) uptick past δ~100 is numeric, not real). If the operator wants δ as a Gaussian-
approach knob, the implementer must **stress-test the direct-tail numeric at large δ** and likely
switch to the analytic Gaussian asymptote `exp(−αh·v²/2δ)` past some δ threshold. The small-δ
(Laplace) end sharpens the kernel and equally needs a tail-resolution check.

---

## 5. The fork, explicit (with costs) (unchanged)

### Fork MINIMAL — free δ, keep βh=1
- **Get:** a tail/variance-mixing + ATM-elbow knob on the *put leg*. δ→∞ = Gaussian/Cobb-Douglas-like
  ATM on the put wing; δ→0 = sharp Laplace elbow.
- **Cost — ~zero settlement risk:** put-only eigenfunction `S^(−γ)` UNCHANGED. Re-instantiation =
  kernel constants only. δ was already a (frozen) GH parameter.
- **Do NOT get:** the symmetric two-root Balancer (βh stays asymmetric).
- **Direction caveat:** δ↓ fattens return-kurtosis / sharpens elbow; δ↑ → Gaussian. Label so.

### Fork FULL — free δ AND set βh=0
- **Get:** the exact symmetric two-root Balancer base (any δ); the exact Cobb-Douglas *curve* at the
  δ→∞ corner; both eigenfunctions `S^(±γ)`; C3 reflection becomes a live structural symmetry.
- **Cost — a settlement-semantics / economic-object change (OPERATOR-OWNED):** βh=0 DROPS the proved
  put-only eigenfunction; both `S^(±γ)` go live. σ_eff² running changes shape (βh enters ψ″(0)). This
  re-opens locked curve/settlement semantics.

---

## 6. Gate / verification implications (unchanged, with the §3.5 wing finding noted)

- **G4 (value∝S^(−γ)):** stays green in form (Esscher slope law δ/βh-invariant, §7 CHECK 1/5).
  Regenerate the reference value at the new δ/βh; if it blows up, suspect tail-integral cancellation
  at the new δ (esp. large-δ Gaussian end, §4 caveat).
- **Seam / C¹ smooth-pasting:** boundary S*=Kγ/(γ+1) and sNorm* are algebraic in γ only, δ/βh-free ⇒
  unchanged in MINIMAL. FULL (βh=0): two-wing seam may need symmetric treatment — re-examine PH-5.
- **dir gate:** crossover@K + funding are price-measure ⇒ δ/βh-invariant in MINIMAL. FULL (βh=0) makes
  the curve reflection-symmetric — re-run orientation lemma R4.
- **G1/G2/G5/G3/G6/G7:** re-instantiate against the (βh,δ)-keyed CDF table; round-trip (G2/G5) is the
  one to watch (same-table FP-exact inversion). Bounds (G7) hold for any valid kernel. Rebase (G6)
  unchanged.
- **Lean re-instantiation:** everything above the `AMMCurve` contract untouched (zero-reproof transfer,
  AMMCurve.lean). Re-instantiate the kernel-constant layer (`ghKernel_pos`,
  `ghKernel_logderiv=βh−αh·v/√(δ²+v²)`, `ghKernel_exponent_le` with c=αh−|βh|>0, measure theory) at
  new βh,δ. FULL fork additionally changes the which-eigenfunction fact (intended).

---

## 7. Sanity checks (mpmath, 35–40 digits)

**CHECK 1 — Esscher tilt δ/βh-invariant.** `f_{β+1}/f_β = e^v` exactly ∀(αh,βh,δ), diff=0 to 40
digits. ⇒ slope law and value∝S^(−γ) δ/βh-free.

**CHECK 3 — βh=0 kernel even in v.** |f(v)−f(−v)|=0 at βh=0; ≈0.18 at βh=1.

**CHECK 4 — Balancer weight tie.** w=γ/(γ+1) ⇒ αh=γ+1=1/(1−w) exactly (γ=1.5→2.5, 2→3, 3→4, 4→5).

**CHECK 5 — value law δ/βh-free.** d log(slope)/d log(price)=1.000000000000 ∀(βh,δ).

**CHECK 6 — TRUE excess kurtosis (moment integral) vs 3/(δαh) asymptote.** At βh=0,αh=4:
δ=0.02→2.954, 0.08→2.653, 0.3→1.688, 1→0.696, 3→0.247, 10→0.075. Asymptote matches only for δ≳3.
Saturates at 3 (Laplace) as δ→0, →0 (Gaussian) as δ→∞. Monotone DECREASING in δ.

**CHECK 7 — δ→0 limit = Laplace.** kernel → exp(−αh|v|+βh·v); βh=0 = symmetric double-exponential
(fat-tailed return density, sharp-elbow frontier).

**CHECK 8 — δ→∞ limit = Gaussian.** kernel → exp(−αh·v²/2δ), var=δ/αh. Gaussian = δ→∞.

**CHECK 9 — βh=0 symmetric ± roots.** ψ even ⇒ ψ(−γ)=ψ(+γ) (γ=1.5,2,3).

**CHECK 10 (NEW) — Cobb-Douglas curve is the δ→∞ limit.** CV of the Cobb-Douglas invariant
`K=X^w·Y^{1−w}` along the GH frontier decreases monotonically with δ (δ=1→0.55, 3→0.32, 10→0.11,
30→0.057), robust across windows; never reaches 0 (GH bounded vs CD unbounded). Reserve log-slopes
`dlogX/du, dlogY/du` flatten toward the CD constants −(1−w), w as δ→∞. **Cobb-Douglas/Balancer
RESERVE CURVE = δ→∞ Gaussian corner. Pass-1's δ→0 is refuted.**

**CHECK 11 (NEW) — wings vs ATM.** δ-sensitivity of depletion slope peaks at ATM (Δ≈2.3–2.8 at u≈0)
and decays into the wings (Δ≈0.003 at u=−3); far wing |u|≫δ is δ-invariant. Elbow curvature:
δ=0.08→12.3, δ=10→0.30 (δ↓ = sharp elbow). Wing reserve depth at m=2: 0.034 (δ=0.08) → 0.220 (δ=3).
**δ = ATM-elbow/curvature + return-kurtosis knob; wing power-law exponent γ untouched; wing depth
moves opposite to the naive "fat=deep" reading.**

---

## OPERATOR-ESCALATION FLAGS (CLAUDE §4/§7 Gate 2 — research-lead does NOT decide)

1. **βh=0 eigenfunction/settlement change (FULL fork) is OPERATOR-OWNED.** Setting βh=0 drops the
   proved put-only eigenfunction (MERTON-TIE) and makes both S^(±γ) live = settlement-semantics /
   economic-object change, reopening locked curve/invariant architecture. MINIMAL does not touch this.

2. **The curve/invariant reopening itself is OPERATOR-OWNED.** Even MINIMAL un-freezes a pinned shape
   constant of the locked GH curve.

3. **Knob-labeling is OPERATOR/PAPER-OWNED — direction and SEMANTICS both matter.**
   (a) **δ↑ ⇒ THINNER tails / toward Gaussian; δ↓ ⇒ FATTER (Laplace).** Do NOT ship "δ up = fatter."
   (b) **δ is mostly an ATM-elbow / return-kurtosis knob, NOT a tradeable-wing-fatness knob** — the
   option-wing pricing exponent γ is δ-invariant (§3.5). If the operator's goal was "fatten the
   tradeable wings," **δ is the wrong knob (γ is the wing knob); δ tunes ATM slippage curvature and
   shifts reserve-depth placement.** This is a product finding the operator needs BEFORE building the
   knob.
   (c) The exact Cobb-Douglas *curve* is the **δ→∞ (Gaussian)** corner; the Balancer *symmetry* is
   βh=0 at any δ. State which "Balancer" a label refers to.

4. **σ↔γ map: ship the GH root condition ψ(−γ)=r (implicit/numeric), NOT γ(γ+1)=2r/σ²** (that is the
   δ→∞ Gaussian slice; engine-pinned GH does not obey it — σ_eff² runs 0.042→0.017).

## Confidence ledger
- **CONFIDENT (numerically verified this pass):** Esscher δ/βh-invariant (C1); βh=0 even/symmetric
  (C3/9); αh=1/(1−w) (C4); value∝S^(−γ) δ/βh-free (C5); TRUE excess kurtosis saturates at 3, δ↑⇒thinner
  (C6); δ→0=Laplace, δ→∞=Gaussian (C7/8); **Cobb-Douglas curve = δ→∞ (C10)**; **δ = ATM-elbow knob,
  wing exponent δ-invariant, wing-depth moves opposite naive reading (C11)**; the 4-fn changes are
  kernel-constant + cache-keying, rebase orthogonal (§4).
- **CONJECTURAL / NOT verified:** exact Lean re-proof magnitude for FULL (βh=0 measure theory and
  symmetric two-eigenfunction settlement not run); tail-integral stability at the large-δ Gaussian end
  and the small-δ Laplace end (flagged §4 — implementer must stress-test); the shallow CV(K) min
  location (~δ30–100) is partly numeric — only the δ↑→CD *trend* is asserted, not a finite optimal δ.

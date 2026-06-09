# Drop-in reparameterization: Balancer as the reachable GH base + a kurtosis/skew knob

> ## ⚠ MANAGER VERIFICATION & CORRECTIONS (2026-06-09 — read before using this spec)
> I (manager) re-derived the load-bearing pieces. **Solid/usable:** βh=0 ⇒ symmetric two-root
> (Balancer symmetry); αh=γ+1=1/(1−w) ⇒ weight tie; `value ∝ S^(−γ)` survives freeing δ/βh (Esscher
> ratio = e^v exact); the 4-curve-fn change list (key tail/CDF/M on (αh,βh,δ), thread ghBeta/ghDelta,
> rebase invariant). **Two corrections — do NOT drop in as written below until noted:**
> 1. **KURTOSIS DIRECTION (manager-verified numerically):** `δ↑ ⇒ THINNER tails (→ Gaussian, excess
>    kurtosis → 0 at δ→∞); δ↓ ⇒ FATTER (→ Laplace, excess kurtosis → 3 at δ→0).` Any "δ up = fatter"
>    label (incl. an earlier manager statement) is WRONG.
> 2. **KURTOSIS FORMULA is asymptotic-only:** `excess kurtosis = 3/(δ·αh)` holds only for LARGE δ.
>    The true excess kurtosis **saturates at 3** as δ→0 (manager numeric: δ=0.08 → **2.76**, NOT the
>    formula's 12.5; δ=10 → 0.104 ≈ formula 0.100). Use the true kurtosis, not the asymptote.
> 3. **UNRESOLVED — where the EXACT Cobb-Douglas/Balancer curve sits in δ.** Pass-1 said "Balancer needs
>    δ→0"; the kurtosis fact says δ→0 = Laplace (fat), while Cobb-Douglas/log-normal = Gaussian = δ→∞.
>    These conflict. The **βh=0 symmetry + αh weight tie are pinned; the Balancer-δ value is NOT** —
>    and whether the δ "kurtosis knob" actually fattens the OPTION WINGS (the exponent γ is δ-independent)
>    or only the ATM elbow is open. Manager is reconciling (research-lead reconcile pass) before this
>    δ/Balancer-limit part is safe to implement. **Use the βh/weight/4-fn parts now; hold the δ-limit part.**

_2026-06-09, research-lead. SPEC/ANALYSIS deliverable for a SEPARATE operator implementation
session. No engine edits, no Aristotle submits, no git in this pass. Grounded in
`engine/knowledge/GH_MATH.md`, `formal/temporal_lean_verified/RequestProject/AMMCurve.lean`,
research-lead MEMORY (MERTON-TIE/CLOSEOUT/RUN findings), and the prior analysis
`notes/CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md`._

_Confident vs conjectural marked inline. The sanity numbers in §7 were computed at 30-40 digit
precision (mpmath); the closed forms are exact and verified against numeric differentiation._

**Headline correction the operator must read first (load-bearing, see §3/§7):** in this GH
variance-mixing parametrization, **δ→0 is the fat-tailed (Laplace/double-exponential) limit and
δ→∞ is the Gaussian limit.** So "turn δ up for fatter tails" is **BACKWARDS**: excess kurtosis
= 3/(δ·αh) at βh=0 — δ↑ ⇒ *less* excess kurtosis (toward Gaussian). The reachable **Balancer/
two-root-symmetric base is the βh=0 SYMMETRY, available at ANY δ**, not a δ→0 corner. δ→0 + βh=0
is the *sharp-peaked Laplace symmetric* member, not the Gaussian. This reverses the directional
hypothesis in the brief ("δ→0 = Balancer corner; δ↑ ⇒ fatter tails / lower γ-effective") and is the
single most important thing to get right before labeling a UI knob.

---

## 1. Current vs freed parameterization

### The kernel
The GH density kernel in the centered latent coordinate `v = u − μ` (`u = log price − log P`,
`P = Ny/Nx`):

    f_β(v)  ∝  exp( −αh·√(δ² + v²)  +  βh·v )

The reserve frontier is built from two tilts of this one kernel (GH_MATH.md):

    X(u) = Nx · tail_β(u)          (upper tail of f_β;   X ↓ as price ↑)
    Y(u) = Ny·M · F_{β+1}(u)       (lower CDF of f_{β+1}; Y ↑ as price ↑)

where `f_{β+1}` is the **Esscher (exponential) tilt** of `f_β`: `f_{β+1}(v) = e^v · f_β(v)`
(the "+1" is in the βh subscript). `M = ψ·K1(δψ')/(ψ'·K1(δψ))` is a μ-independent Bessel-K scalar
prefactor ratio.

### Current pins (the live engine, GH_MATH.md §"What the curve is")
| symbol | current value | status |
|---|---|---|
| `αh` | `γ+1` | **derived** from the convexity exponent γ (user-facing) |
| `βh` | `1` (FIXED) | hard-coded constant — the Esscher/skew offset |
| `δ`  | `0.08` (FIXED) | hard-coded constant — the variance-mixing/tail parameter |
| `γ`  | `∈(1,4)` | user parameter (convexity); sets αh |

So today the only user knob that touches the kernel shape is γ (via αh=γ+1); βh and δ are frozen.

### Freed parameterization (this spec)
| symbol | freed role | becomes |
|---|---|---|
| `γ`  | **convexity / value-law exponent.** `value ∝ S^(−γ)`. Sets `αh = γ+1`. | user param (unchanged) |
| `δ`  | **tail / variance-mixing knob** (NOT kurtosis-in-the-naive-direction — see §3). | user param (was const 0.08) |
| `βh` | **skew knob.** βh=0 = reflection-symmetric (two-root Balancer base); βh=1 = current put-only. | user param (was const 1) |
| `αh` | `= γ+1` (still derived from γ) | derived (unchanged tie) |
| `M`  | Bessel-K normalizer ratio; **recomputes from (αh, βh, δ)** | derived (was a frozen scalar) |

**Confident.** The split is: γ and (now) δ, βh are the free dials; αh and M are derived. The whole
point of route (b) (prior note §2) is that this is the *same family* — freeing constants, not
swapping curves.

---

## 2. The Balancer limit, written out

**Claim:** Balancer / weighted-Cobb–Douglas `x^w · y^{1−w} = k` is the **βh=0** member of this
family (reflection-symmetric, two-root), with the convexity exponent tied to the Balancer weight by

    γ = w/(1−w)        ⟺        w = γ/(γ+1)        ⟺        αh = γ+1 = 1/(1−w).

The last identity (αh = 1/(1−w)) is a clean, **exact** tie verified numerically in §7 CHECK 4 — the
GH shape parameter αh IS the inverse complementary Balancer weight.

**Why βh=0 is the symmetric two-root base (confident, §7 CHECK 3/9):**
- At βh=0 the kernel `exp(−αh√(δ²+v²))` is **even in v** (verified exactly, |f(v)−f(−v)|=0). The
  reflection `v ↦ −v` IS the put↔call reflection `S ↔ oracle²/S` (the C3 reflection arrow). So βh=0
  ⇒ the curve is reflection-symmetric ⇒ the value law carries **both** eigenfunctions `S^(−γ)` and
  `S^(+γ)` (the symmetric pair). The GH Laplace exponent `ψ(θ)=δ(√(αh²−βh²)−√(αh²−(βh+θ)²))` is even
  in θ at βh=0, so `ψ(−γ)=ψ(+γ)` — the roots come in ± pairs (§7 CHECK 9). This is the "two roots
  sum=1" Merton/Balancer symmetry restored.
- At βh=1 (current) the kernel is NOT even (verified, |f(v)−f(−v)|≈0.18 at v=0.3); only the put
  radicand `αh²−(βh−γ)²=4γ` is in-strip, the reflected-call radicand `−(2γ+3)` is out — the proved
  **put-only** MERTON-TIE fact. This is the asymmetry the operator wants to remove for Balancer.

**The value law as δ→0 (confident, §7 CHECK 1/5/7):**
- The Esscher density-ratio `f_{β+1}/f_β = e^v` is **EXACT and independent of αh, βh, δ** (§7 CHECK 1,
  diff = 0 to 40 digits across all parameter combos). Therefore the geometric reserve slope
  `|dy/dx| = (Ny·M/Nx)·e^{v} = getMP_raw·e^{−μ}` and hence the relation `d log(slope)/d log(price)=1`
  hold **for any δ and any βh** (§7 CHECK 5, =1.000000000000 in every case). The power-law exponent
  γ enters only through `αh=γ+1` at calibration, **not through δ.** So `value ∝ S^(−γ)` is preserved
  as δ varies — this is the whole reason route (b) keeps the G4 accuracy gate.
- As δ→0, `−αh√(δ²+v²) → −αh|v|`, i.e. the kernel → `exp(−αh|v| + βh·v)` (asymmetric Laplace /
  double-exponential; §7 CHECK 7, rel.diff ~1e-6 at δ=0.001). At βh=0 this is the **symmetric
  double-exponential** — the sharp-peaked pure-power member. The Cobb–Douglas marginal
  `mp = (w/(1−w))·(y/x) = γ·(y/x)` is the monomial-in-(y/x) law; `value ∝ S^(−γ)` holds exactly with
  the single global exponent γ=w/(1−w). **Confirmed: (βh=0, δ→0) IS a Balancer corner** — but see the
  correction below on which limit is "Gaussian."

**Correction (load-bearing, §7 CHECK 8):** the prior framing tied "Balancer = Gaussian/Merton exact
case" to δ→0. The *symmetry* (two-root) part is right and lives at βh=0. But the **Gaussian limit of
this kernel is δ→∞, not δ→0**: for large δ, `√(δ²+v²) ≈ δ + v²/(2δ)`, so the kernel →
`exp(−αh·v²/(2δ))` = Gaussian with variance δ/αh (§7 CHECK 8, rel ~1e-9 at δ=1000). δ→0 gives the
*Laplace* (heaviest-tailed, fattest-peaked) symmetric member. **So:**
- "Symmetric two-root Balancer base" = **βh=0** (any δ). ✔ exact.
- "Zero-excess-kurtosis Gaussian" = **βh=0, δ→∞** (a different corner from δ→0).
- "δ→0, βh=0" = the **Laplace** symmetric member — symmetric power-law base, but the *fat* end of the
  tail knob, NOT the Gaussian end.

The Balancer power law `value ∝ S^(−γ)` holds along the entire βh=0 line (δ-independent); the
"Gaussian vs Laplace" distinction is about the *return distribution's tails*, which is exactly the
knob δ controls — and is orthogonal to the power-law value exponent.

---

## 3. The kurtosis knob, concretely

### How δ maps to excess kurtosis (confident, exact closed forms in §7 CHECK 6)
Using the GH Laplace/cumulant exponent `ψ(θ) = δ(√(αh²−βh²) − √(αh²−(βh+θ)²))` (the MERTON-TIE
generator, with the linear drift dropped since it doesn't affect cumulants ≥2):

- **Variance** (σ_eff²) `= ψ″(0) = δ·αh²/(αh²−βh²)^{3/2}`.
  At βh=0: `ψ″(0) = δ/αh`. (Verified exact, §7 CHECK 6.)
- **4th cumulant** `= ψ⁗(0)`. At βh=0: `ψ⁗(0) = 3δ/αh³`. (Verified exact.)
- **Excess kurtosis** `κ₄/κ₂² = ψ⁗(0)/ψ″(0)² = (3δ/αh³)/(δ/αh)² = 3/(δ·αh)`   (βh=0).

**Direction (CONFIDENT, and it is the OPPOSITE of the brief's hypothesis):**

    excess kurtosis = 3/(δ·αh)   ⇒   δ ↑  ⇒  excess kurtosis ↓ (toward Gaussian).

Numerically (αh=4, βh=0): δ=0.02 → exk=37.5; δ=0.08 → 9.375; δ=0.3 → 2.5; δ=1 → 0.75; δ=3 → 0.25.
**δ↑ ⇒ thinner tails / closer to Gaussian; δ↓ ⇒ fatter tails (Laplace at δ→0).** This is the
variance-mixing intuition: δ is the (inverse) mixing intensity; small δ = strongly mixed = heavy
tails. The brief's "δ↑ ⇒ fatter tails / lower γ-effective" is **incorrect for this kernel** — flag
to operator before any UI label.

Also note: δ does NOT change the value-law exponent γ-effective at all (§2, §7 CHECK 5). "Lower
γ-effective" is not a δ effect here; γ is fixed by αh=γ+1. The only γ-running is the σ_eff² vs γ
running below, which is a fixed-δ artifact of βh≠0, not a δ knob.

### The GH σ↔γ relation — honest status (confident)
The **closed-form `γ(γ+1)=2r/σ²` is only the GAUSSIAN SLICE** of the GH (proved in MERTON-TIE,
`merton_vieta_prod`). The engine-pinned GH does **not** obey it exactly. The exact GH relation is
**implicit**: γ is the characteristic root of `ψ(−γ) = r`, i.e.

    δ·(√(αh²−βh²) − √(αh²−(βh−γ)²)) = r        (solve numerically for γ given r, αh, βh, δ).

This is closed-form as an *equation* but γ(r,αh,βh,δ) is **not** a closed-form expression — it's a
root-find (implicit/numeric). The Gaussian closed form is only recovered as δ→∞ (the slice). The
`σ_eff² = ψ″(0)` running at the current pins (αh=γ+1, βh=1, δ=0.08) is (§7 CHECK 6, reproduces the
prior note's 0.042→0.017):

    γ=1.5 → 0.041565 ; γ=2 → 0.031820 ; γ=3 → 0.022033 ; γ=4 → 0.017010.

**Ship the GH root condition `ψ(−γ)=r` (full exponent, solved numerically), NOT the Gaussian closed
form** — exactly the MERTON-TIE recommendation. If βh is freed, this running changes shape
(`ψ″(0)=δαh²/(αh²−βh²)^{3/2}` depends on βh).

---

## 4. Engine impact — which of the 4 curve fns change and how

The 4 curve-dependent fns (CLAUDE §4 / GH_MATH.md §"four functions"). What changes when δ (and βh)
become parameters threaded through the pool state instead of module constants. **The structural
forms are UNCHANGED; only the kernel constants and the normalizer M flow through.** (Confident on
which fns; the exact code lines are the implementer's — this names the math edits.)

**What stays INVARIANT (do not touch):**
- The **Esscher tilt structure** `f_{β+1}=e^v·f_β` and the slope law `|dy/dx|=getMP_raw·e^{−μ}` —
  EXACT for any (αh, βh, δ) (§7 CHECK 1). So `getMP_raw ≠ slope`, the `e^μ`=`e^ghMu` factor, and
  `mpGeom = getMP_raw·e^{−ghMu}` for slippage are ALL unchanged in form. The whole "getMP_raw is a
  price coordinate not the slope" gotcha (CLAUDE §4) is δ/βh-invariant.
- The calibration *structure* (3 conditions: `u0−μ=3`, `Nx=X0/(1−Φ_β)`, `Ny=Y0/(M·Φ_{β+1})`, μ from
  price). Only the *values* of Φ_β, Φ_{β+1}, M change with (βh, δ).
- `getSNorm=(x−α)/α`, `getDepth` — not curve-dependent, untouched.

**`getMP_raw(s)`** — `= ghP · exp(_invTail(s, (s.x−s.alpha)/s.ghNx))`.
- Change: `_invTail` (the inverse upper-tail of f_β) and the tail integral now key off the pool's
  `s.ghBeta` and `s.ghDelta` instead of the constants `βh=1, δ=0.08`. The CDF/tail cache (GH_MATH.md
  §Numerics: the shape-keyed module table built in centered v=u−μ) must be **keyed on (αh,βh,δ)**, not
  just αh. **Direct upper-tail integrals (not 1−F) MUST be preserved** (catastrophic-cancellation
  gotcha for γ≥2) — re-derive the tail at the new βh,δ but keep the direct-integral numeric.
- The `ghP` price-coordinate identity is unchanged (Esscher).

**`arbitrageToOracle(s, o)`** — set `u* = log(o) − log(ghP)`, return reserves at u*.
- Change: `X(u*) = Nx·tail_β(u*)` and `Y(u*) = Ny·M·F_{β+1}(u*)` evaluate the tail/CDF of the NEW
  kernel (βh, δ). M recomputes from (αh,βh,δ). The `u*=log(o)−log(ghP)` inversion is **unchanged**
  (price coordinate is Esscher-exact, δ/βh-free).

**`tradeUpdate(s, dy)`** — add dy to y, solve u from the Y side (`_invB1`), set x from that u.
- Change: `_invB1` (inverse of `F_{β+1}`) keys off (βh,δ). The trade = latent translation
  `u ↦ u+δ_trade` one-parameter group (GHJ finding) is **structurally unchanged** — it's a property
  of the latent parametrization, not the kernel constants. Same-table inversion (FP-exact round-trip,
  GH_MATH.md §Numerics 2) must be preserved against the (βh,δ)-keyed table.

**`rebase(s, r)`** — `x→r·x, α→r·α, Nx→r·Nx, P→P/r` (Y side and μ unchanged).
- Change: **NONE structural.** Rebase touches the carry/normalization (P, Nx, α), NOT the kernel
  shape (αh,βh,δ). The reparameterization is **orthogonal to rebase** — rebase covariance
  (`sNorm_rebase_invariant`, PH-6) transfers verbatim. Implementer just carries ghBeta/ghDelta
  through unchanged on rebase (they're rebase-invariant scalars, like the existing μ/αh).

**What the implementer must thread through (concrete checklist):**
1. Add `ghBeta`, `ghDelta` (and recomputed `ghM`) to the serialized **scalar** pool state alongside
   the existing gh* params (pool serializes scalars; table re-derives on load — GH_MATH.md §Numerics).
2. Key the **shape CDF cache** on (αh, βh, δ) — built once at calibration in centered v.
3. Recompute `M = ψ·K1(δψ')/(ψ'·K1(δψ))` from (αh,βh,δ) at calibration (the Bessel-K A&S rational
   approx stays; only its inputs change). ψ=√(αh²−βh²)-type args shift with βh.
4. Recompute the shape integrals Φ_β=F_β(u0), Φ_{β+1}=F_{β+1}(u0) at (βh,δ) for the Nx/Ny
   calibration. They stay μ-independent (the `u0−μ=3` pin is preserved) ⇒ rebase-stable.
5. Keep the direct-upper-tail and same-table-inversion numerics (the two GOTCHAS) at the new shapes.

---

## 5. The fork, explicit (with costs)

### Fork MINIMAL — free δ, keep βh=1
- **What you get:** a tail/variance-mixing knob on the *put leg*. Balancer-on-the-put-wing as the
  δ→0 (Laplace) base of that one-sided leg.
- **Cost — essentially zero settlement/economic-object risk:** the put-only eigenfunction `S^(−γ)`
  (proved, MERTON-TIE) is UNCHANGED (βh stays 1). Nothing in settlement, the smooth-pasting boundary
  S*=Kγ/(γ+1), the American ITM rule, or the eigenfunction selection moves. Re-instantiation =
  **kernel constants only** (recompute tail/CDF/M at the new δ; same proof techniques). No
  curve/invariant *reopening* in the economic sense — δ was already a (frozen) GH parameter.
- **What you do NOT get:** the symmetric two-root Balancer. βh=1 stays asymmetric; "Balancer is
  reachable" is true only for the one-sided put leg, not the symmetric object.
- **Direction caveat:** because excess kurtosis = 3/(δ·αh) (βh=1 form is 3/(δ·αh²/(αh²−1)^{3/2})-
  scaled but same δ↓⇒fatter direction), δ↓ fattens. Label accordingly (NOT δ↑⇒fatter).

### Fork FULL — free δ AND set βh=0
- **What you get:** the **exact symmetric two-root Balancer base** (§7 CHECK 3/9). Reflection
  symmetry restored; both eigenfunctions `S^(±γ)`; the C3 reflection arrow becomes a structural
  symmetry of the live curve, not just the spec mark. δ is then the tail knob on the symmetric base.
- **Cost — a settlement-semantics / economic-object change (OPERATOR-OWNED):** βh=0 **DROPS the
  proved put-only eigenfunction.** The current product rides the put leg `S^(−γ)` specifically
  (MERTON-TIE: at βh=1 only the put radicand is in-strip). Making the family symmetric changes *which
  eigenfunction(s) the leg carries* — both `S^(−γ)` and `S^(+γ)` become live. That is a change to the
  economic object (what the AMM is pricing), NOT a mechanical reparameterization. The σ_eff² running
  also changes shape (βh enters `ψ″(0)`). This re-opens the locked curve/settlement semantics — **the
  operator must decide whether the product wants the symmetric two-root object.**

**Cost summary:** MINIMAL = pure kernel-constant re-instantiation, no semantics touched, but
asymmetric (not the symmetric Balancer). FULL = symmetric Balancer recovered, but at the price of the
proved put-only eigenfunction = a settlement-semantics reopening. This is the same fork as the prior
note's two-tier recommendation, now with the exact kurtosis/symmetry math attached.

---

## 6. Gate / verification implications

What the implementer should expect (confident on which gates re-instantiate; reference values are
the implementer's to regenerate per chosen δ/βh):

- **G4 (value ∝ S^(−γ), the accuracy gate):** **stays green in form**, because the Esscher slope law
  and hence the power law are δ/βh-invariant (§7 CHECK 1/5). The *reference value* (current ≤0.127%
  on [1,3]) must be **regenerated** at the new δ (and at βh=0) — the curve points move, but the
  exponent γ is unchanged. Expect it to stay tight; if it blows up, that's a numeric/tail-integral
  bug at the new δ (suspect catastrophic cancellation — keep direct tails), not a math failure.
- **Seam / C¹ smooth-pasting gate (value+slope ≤0.15% at sNorm* = θ·((γ+1)/γ)^γ):** the boundary
  formula S*=Kγ/(γ+1) and sNorm* are **algebraic in γ only** (T1a `Sstar_forced`), δ/βh-free ⇒ the
  boundary is unchanged. The continuation value c·sNorm is the power law (δ-free). **MINIMAL fork:
  gate unchanged.** **FULL fork (βh=0): the put-only assumption underlying the one-sided seam may need
  the symmetric (two-wing) treatment** — if both eigenfunctions are live, the seam binds both wings
  symmetrically; re-examine the PH-5 two-branch wiring. Flag.
- **dir gate (crossover@K + directional consistency + mixed-basis control, v26c):** crossover@K and
  funding/isOTM/wingMember are price-measure objects (CLAUDE §8) — **δ/βh-invariant** ⇒ stays green
  in MINIMAL. FULL (βh=0) makes the curve reflection-symmetric, which could change directional signs
  on the call side — re-run the orientation lemma (R4) at βh=0.
- **G1/G2/G5/G3/G6/G7 (open mp0, arb round-trip, monotone, rebase/r, bounds):** self-consistency
  gates. Re-instantiate against the (βh,δ)-keyed CDF table. **Round-trip (G2/G5) is the one to watch:**
  same-table inversion must be FP-exact at the new shape (GH_MATH.md §Numerics 2). Bounds (G7,
  X∈(0,Nx), Y∈(0,Ny·M)) hold for any valid kernel (CLOSEOUT item 2 measure theory transfers — the
  tail/CDF ∈(0,1) facts are kernel-agnostic in technique). Rebase (G6) unchanged (kernel-orthogonal,
  §4).
- **Lean re-instantiation (per prior note §3):** everything above the `AMMCurve` contract is untouched
  (demonstrated zero-reproof transfer in `AMMCurve.lean`). Re-instantiate the **kernel-constant layer**
  (`ghKernel_pos`, `ghKernel_logderiv = βh−αh·v/√(δ²+v²)`, `ghKernel_exponent_le` with c=αh−|βh|>0,
  the measure theory) at the new βh,δ — same techniques, new constants. **FULL fork additionally
  changes the which-eigenfunction fact** (the put radicand 4γ vs the βh=0 symmetric pair) — that is
  the proved fact that *intentionally* changes.

---

## 7. Sanity checks run now (mpmath, 30–40 digits) — "is Balancer really reachable?"

All scripts run this pass; numbers are exact-to-precision.

**CHECK 1 — Esscher tilt is δ/βh-invariant (the load-bearing fact).** `f_{β+1}(v)/f_β(v) = e^v`
exactly, for every (αh,βh,δ) tested {(4,1,0.08),(2,0,1e−6),(5,0,0.5),(3,1,2)} and every v — diff = 0
to 40 digits (a couple 1e−41 rounding). ⇒ the slope law and value∝S^(−γ) do not depend on δ or βh.
**CONFIRMS:** freeing δ/βh preserves the power-law option tie.

**CHECK 3 — βh=0 kernel is EVEN in v.** |f(v)−f(−v)| = 0 (to precision) at βh=0 for all tested
(αh,δ); ≈0.18 at βh=1. **CONFIRMS:** βh=0 is the reflection-symmetric (two-root Balancer) base; βh=1
is genuinely asymmetric.

**CHECK 4 — Balancer-weight tie.** w=γ/(γ+1) gives w/(1−w)=γ exactly, and **αh=γ+1 = 1/(1−w)
exactly** (γ=1.5→αh=2.5=1/0.4 ✓; γ=2→3 ✓; γ=3→4 ✓; γ=4→5 ✓). **CONFIRMS:** the GH shape αh IS the
inverse complementary Balancer weight — Balancer is literally a relabeling of the αh axis.

**CHECK 5 — value law is δ/βh-free.** d log(slope)/d log(price) = 1.000000000000 for every
(βh,δ)∈{(1,0.08),(0,0.08),(0,1e−6),(1,2)}. **CONFIRMS:** value∝S^(−γ) stays as δ varies (G4 survives).

**CHECK 6 — kurtosis vs δ (exact closed forms, verified vs numeric diff).** At βh=0:
ψ″(0)=δ/αh, ψ⁗(0)=3δ/αh³, **excess kurtosis = 3/(δ·αh)**. Numerics (αh=4): δ=0.02→37.5, 0.08→9.375,
0.3→2.5, 1→0.75, 3→0.25 — **monotone DECREASING in δ.** σ_eff²=ψ″(0)=δαh²/(αh²−βh²)^{3/2} at engine
pins (βh=1, δ=0.08) reproduces the prior 0.042→0.017 running: γ=1.5→0.041565, 2→0.031820,
3→0.022033, 4→0.017010 (matches MEMORY). **CONFIRMS direction: δ↑ ⇒ LESS excess kurtosis (Gaussian
end); δ↓ ⇒ fatter (Laplace).** The brief's direction is backwards — flagged.

**CHECK 7 — δ→0 limit.** kernel → exp(−αh|v|+βh·v) (asymmetric Laplace), rel.diff ~1e−6 at δ=0.001.
At βh=0 = symmetric double-exponential (the fat-tailed symmetric power-law base).

**CHECK 8 — δ→∞ is the Gaussian limit.** kernel/peak → exp(−αh·v²/(2δ)) (Gaussian, var=δ/αh),
rel ~1e−9 at δ=1000. **CONFIRMS:** Gaussian (zero excess kurtosis) is δ→∞, NOT δ→0. The "Balancer =
exact Gaussian" identification is the **βh=0 symmetry** (the two-root structure), realized at any δ;
the *Gaussian tail* specifically is the δ→∞ end.

**CHECK 9 — βh=0 gives symmetric ± eigenfunction roots.** ψ even ⇒ ψ(−γ)=ψ(+γ) exactly (γ=1.5,2,3).
**CONFIRMS:** βh=0 restores the symmetric two-eigenfunction (S^(±γ)) Balancer/Merton structure that
βh=1 breaks (put-only).

**Net (is Balancer reachable?): YES, confirmed.** Balancer is the βh=0 member with αh=γ+1=1/(1−w);
"unreachable" was purely the βh=1, δ=0.08 PIN, not a family constraint (CHECK 1/3/4/5). The value law
survives freeing δ (CHECK 1/5). The one correction: the *symmetry* is the Balancer-defining feature
(βh=0, any δ), and the δ knob runs Laplace(δ→0, fat) ↔ Gaussian(δ→∞, thin), with excess kurtosis
3/(δ·αh) — **opposite direction to the brief.**

---

## OPERATOR-ESCALATION FLAGS (CLAUDE §4/§7 Gate 2 — research-lead does NOT decide)

1. **The βh=0 eigenfunction/settlement change (FULL fork) is OPERATOR-OWNED.** Setting βh=0 drops the
   *proved* put-only eigenfunction (MERTON-TIE) and makes both S^(±γ) live = a settlement-semantics /
   economic-object change, reopening locked curve/invariant architecture. MINIMAL (free δ, keep βh=1)
   does NOT touch this. The operator chooses MINIMAL vs FULL.

2. **The curve/invariant reopening itself is OPERATOR-OWNED.** Even MINIMAL (freeing δ) un-freezes a
   pinned shape constant of the locked GH curve. This spec is drop-in *math*; the decision to ship it
   is the operator's.

3. **Knob-labeling is OPERATOR/PAPER-OWNED — and the brief's direction is WRONG.** δ is the
   tail/variance-mixing parameter, βh is skew. **δ↑ ⇒ thinner tails / toward Gaussian; δ↓ ⇒ fatter
   (Laplace)** (excess kurtosis = 3/(δ·αh)). Do NOT ship a UI label "δ up = fatter tails / more
   kurtosis" — it is exactly backwards. "Excess kurtosis" is the βh=0, δ-controlled quantity; "skew"
   is βh. If only δ is exposed at βh=1, it is a *tail-fatness* knob on the put leg, not a pure
   excess-kurtosis-vs-skew decomposition. State precisely.

4. **σ↔γ map: ship the GH root condition ψ(−γ)=r (implicit/numeric), NOT the Gaussian closed form
   γ(γ+1)=2r/σ²** (that is only the δ→∞ slice; engine-pinned GH does not obey it — σ_eff² runs
   0.042→0.017). Already the MERTON-TIE recommendation; restated because freeing δ/βh makes the slice
   error δ-dependent.

## Confidence ledger
- **CONFIDENT (numerically verified this pass):** Esscher tilt δ/βh-invariant (CHECK 1); βh=0 even/
  symmetric (CHECK 3/9); αh=γ+1=1/(1−w) Balancer tie (CHECK 4); value∝S^(−γ) δ/βh-free (CHECK 5);
  excess kurtosis = 3/(δ·αh), δ↑⇒thinner (CHECK 6); δ→0=Laplace, δ→∞=Gaussian (CHECK 7/8); the 4-fn
  changes are kernel-constant + cache-keying, rebase orthogonal (§4); G4/seam/dir invariance in
  MINIMAL (§6).
- **CONJECTURAL / NOT verified this pass:** the exact magnitude of Lean re-proof for FULL (βh=0) — the
  βh=0 measure theory and the symmetric two-eigenfunction settlement re-derivation have NOT been run
  (only the put-only βh=1 case is proved); the precise numeric tail-integral stability at small δ
  (δ→0 sharpens the kernel — the direct-tail numeric should hold but was not stress-tested at the
  engine's actual table resolution); whether the FULL-fork two-wing seam needs a new reference value
  (depends on the operator's settlement choice). The implementer should regenerate all gate reference
  values empirically at the chosen (δ, βh).

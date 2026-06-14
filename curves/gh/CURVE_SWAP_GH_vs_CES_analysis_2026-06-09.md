# GH vs CES / Balancer-base + kurtosis-knob — discussion note (research-lead)

> ## ⚠ CORRECTION HEADER (2026-06-09 reconcile pass) — read before §1/§2
> This note's δ-direction claims are **SUPERSEDED**. It says "symmetric Balancer base needs βh=0 AND
> **δ→0**" (§1 Correction 2, §2 route (b)). That δ→0 is **WRONG**. Resolved by building the curves
> numerically (`curves/gh/REPARAM_balancer_kurtosis_dropin_2026-06-09.md` v2, §2.5/CHECK 10):
> - The **two-root SYMMETRY** is βh=0 at **any δ** — this part is correct.
> - The **exact Cobb-Douglas/Balancer RESERVE CURVE is the δ→∞ (Gaussian) limit, NOT δ→0.**
>   Cobb-Douglas = log-normal = Gaussian = δ→∞. δ→0 is the *Laplace* (fat-tailed) symmetric member,
>   NOT Balancer. Excess kurtosis = 3 at δ→0, → 0 at δ→∞ (decreasing in δ).
> - **δ is mostly an ATM-elbow / return-kurtosis knob; the option-wing exponent γ is δ-invariant**
>   (it does NOT fatten the tradeable wings). See the v2 note §3.5.
> The βh=0 symmetry, αh=1/(1−w) tie, value∝S^(−γ) survival, and transfer accounting (§3) stand.
> **The authoritative reconciled spec is `REPARAM_balancer_kurtosis_dropin_2026-06-09.md` (v2).**

_2026-06-09. DISCUSSION/ANALYSIS ONLY. No Aristotle submits, no engine edits, no git.
The curve/invariant choice is the OPERATOR'S call (CLAUDE §4 locked architecture); this note
ANALYZES and RECOMMENDS. Confident vs conjectural is marked inline. Grounded in:
specs/temporal_formal_spec.md, framework/port_hamiltonian_consistency.md (at writing: specs/),
formal/temporal_lean_verified/RequestProject/AMMCurve.lean, engine/knowledge/GH_MATH.md,
and the MERTON-TIE / CLOSEOUT / UNIFY2 run findings in research-lead MEMORY.md._

---

## 1. Is Balancer the Gaussian/Merton exact base of our family?

**Manager hypothesis (Balancer = Gaussian/Merton exact case; "kurtosis" = δ-departure;
fixed δ=0.08 excludes Balancer): CONFIRMED in substance, with two sharpening corrections.**

**Confident:**
- Balancer / weighted-geometric-mean (Cobb–Douglas) `x^w·y^(1−w)=k` IS the pure-power-law member.
  Its marginal price is `mp = (w/(1−w))·(y/x)`, a pure monomial in `y/x` ⇒ value ∝ S^(−γ) holds
  EXACTLY with a single global exponent γ tied to w (`γ = w/(1−w)` up to the carry normalization),
  no tail/skew structure, no second shape parameter. That single-exponent, scale-free,
  two-root-symmetric law is exactly the **Gaussian/Merton (zero-excess-kurtosis) case**: in the
  Merton perpetual-option tie, the Gaussian generator gives the quadratic characteristic equation
  `½σ²γ(γ+1)=r` whose two roots sum to 1 — the put/call reflection symmetry is EXACT. This is the
  same "two-root sum = 1" object the MERTON-TIE run isolated. So Balancer ⇔ the exact Merton/Gaussian
  slice is **correct**.
- CES/Cobb–Douglas DOES fit the same info-geometry framing. Cobb–Douglas is the log-linear (= cumulant-
  linear-after-log) case: `log k = w log x + (1−w) log y` is an affine potential in log-reserves, so
  `μ` is the Laplace exponent of a **degenerate/Gaussian** family — the cleanest exponential-family
  member there is. The AMMCurve contract (`AMMCurve.lean`) already carries `cpmm` (= Balancer at w=½)
  as a live instance with `poolValue_concaveOn`/`hedge_gap` transferring with ZERO reproof, so the
  convex-potential / Legendre machinery applies to it verbatim. The μ=Laplace-exponent tie is
  curve-agnostic at exactly this level (see §3 TRANSFERS).

**Correction 1 (load-bearing — do not let this be smoothed over).** Our **current GH does not have
Balancer as its δ→0 Gaussian limit in a symmetric way**, because the engine pins **βh=1** (the Esscher
tilt `f_{β+1}` vs `f_β`), not βh=0. The MERTON-TIE run proved (GROUNDED, G1–G4) that with βh=1 the GH
natively carries ONLY the **put** eigenfunction S^(−γ): the put radicand = 4γ (in-strip, real root),
the call radicand = −(2γ+3) (OUT of strip — no real second root). **The "two roots sum to 1" is a
GAUSSIAN artifact, NOT a GH identity.** So:
  - It is not merely that δ=0.08 is fixed; the **asymmetry βh=1 means even the δ→0 limit of the
    current GH is the *one-sided* (put-only) Gaussian slice, not the symmetric two-root Balancer.**
  - The symmetric Balancer/Merton object lives at **βh=0** (centered tilt) AND δ→0. The current
    parametrization is offset on BOTH knobs from Balancer, not just on δ.
This is sharper than "fixed δ excludes Balancer": the exclusion is δ>0 **plus** βh=1 (the skew).

**Correction 2 (terminology).** "Kurtosis" is loose. In the GH family, δ (together with αh) controls
the **tail heaviness / departure-from-Gaussian** (the variance-mixing parameter); βh controls
**skew/asymmetry**. The two-root symmetry the operator wants back is broken primarily by the **skew
(βh)**, and the fatness/excess-kurtosis by **δ**. "Balancer-base + kurtosis knob" most precisely
means: **base at (βh=0, δ→0) = symmetric Gaussian/Balancer; turn δ up for excess kurtosis (and,
separately, βh for skew).** If the operator wants the symmetric two-root structure preserved as the
knob varies, the knob to expose is δ at **βh=0**, NOT the current βh=1 line.

**Verdict (1): Manager hypothesis CONFIRMED — Balancer = the exact Gaussian/Merton (zero-excess-
kurtosis, two-root-symmetric) base of the family, and yes it is a clean exponential family with
μ = a (degenerate) Laplace exponent. Two corrections: (a) the current GH is off-Balancer on BOTH
δ AND the skew βh=1 — the put-only eigenfunction is a *proved* GH fact, not just a δ effect; (b)
the symmetric base requires βh=0, so "kurtosis knob" = expose δ on the βh=0 line.**

---

## 2. Why current GH excludes Balancer; the two routes

**Why excluded (confident).** Engine pins `αh=γ+1, βh=1, δ=0.08` as FIXED shape constants
(GH_MATH.md). Balancer/Gaussian is the (βh=0, δ→0) corner. Pinning δ=0.08>0 means the pure power law
is never the live curve (Gaussian only as an unreachable limit), and pinning βh=1 means even that
limit is the one-sided slice. So Balancer is a doubly-excluded limit point, not a reachable member —
exactly the operator's complaint.

**Route (a) — switch to CES (Balancer = Cobb–Douglas base, elasticity-of-substitution = the knob).**
- CES `((1−w)x^ρ + w y^ρ)^{1/ρ}` has Cobb–Douglas (Balancer) as the **exact ρ→0 limit**, reachable
  and central, with the elasticity `σ_ES = 1/(1−ρ)` as the deformation knob. Balancer is genuinely a
  special case, not a limit-at-infinity.
- BUT the CES knob is **elasticity of substitution**, which is NOT the same object as excess kurtosis.
  CES deforms the *curvature/slippage-convexity* of the invariant; it does not generate a heavy-tailed
  return distribution in the Merton sense. CES does NOT preserve the clean `value ∝ S^(−γ)` power law
  off ρ=0 — away from Cobb–Douglas, CES marginal price is not a single monomial in y/x, so the
  global-exponent option-pricing tie (our G4 accuracy gate, the whole point) breaks. **CES gives a
  Balancer base + a *substitution-elasticity* knob, which is NOT the kurtosis knob the operator asked
  for, and it sacrifices the power-law invariant that justifies the option semantics.** (Confident on
  the structure; conjectural on whether any reparametrized CES sub-family recovers a power law — I do
  not believe it does, because the power law is exactly the Cobb–Douglas/ρ=0 point.)

**Route (b) — reparameterize GH: make the currently-FIXED skew/kurtosis the KNOB, Balancer/Gaussian
the base.**
- Free δ (and set βh=0 for the symmetric base): now Balancer/Gaussian sits at (βh=0, δ→0) as a
  reachable base, and δ↑ is a genuine **excess-kurtosis / tail-heaviness** knob in the exact Merton
  variance-mixing sense — which is the object the operator named. The power-law/option tie is **native
  to GH** (the whole MERTON-TIE result), so it survives the reparametrization.
- Cost: at βh=0 the family carries BOTH eigenfunctions again (recovering the symmetric two-root
  structure), so the engine's current put-only specialization (βh=1) would have to be revisited —
  this is a real change to which eigenfunction the leg rides, i.e. brushes settlement semantics.
  Flag, not a free move.

**Is "GH vs CES" the right framing? Largely NO — it dissolves.** The operator's actual requirement is
"Balancer/Gaussian as the *reachable base* + a *kurtosis* (tail/excess) knob preserving the power-law
option tie." That requirement:
  - is satisfied by **GH reparametrized** (route b) — same family, Balancer becomes the reachable
    corner, δ is the kurtosis knob, power-law tie preserved;
  - is NOT satisfied by **CES** (route a) — Balancer base yes, but the knob is elasticity (not
    kurtosis) and the power-law tie is lost off the base.
So the cleaner framing is **"parametrize the GH family so Balancer is the reachable base + δ is the
kurtosis knob,"** not "GH vs CES." CES is a different deformation axis (curvature, not tails) that
happens to also have Balancer as a base; it answers a different question.

**Cleaner / more theory-native: route (b), reparametrized GH.** Confident: GH already gives us the
Merton tie, the exp-family μ, the Esscher trade structure, the proved measure theory (CLOSEOUT item 2),
and the GHMaps monotonicity. Route (b) keeps ALL of that and just slides where "base" sits. CES throws
the Merton/power-law tie away to gain reachability we can also get inside GH.

---

## 3. How much theory survives a curve swap (honest transfer accounting)

The scaffold was deliberately built curve-agnostic at the contract level. Honest split:

### TRANSFERS — holds for ANY exponential-family μ / convex potential / valid AMMCurve (MOST of the corpus)
- **The `AMMCurve` contract itself** (`antitone_y`, `convex_y`, `coercive` gate) and everything proved
  FROM it: `poolValue_concaveOn`, `hedge_gap_concaveOn`. Confident — `AMMCurve.lean` already
  instantiates `expPool` AND `cpmm` with zero reproof of the downstream theorems. A new curve only
  needs the 3 gate fields; the bridge transfers for free. (This is the single strongest transfer fact
  and it is *demonstrated in the file*, not conjectured.)
- **Passivity / no-free-lunch / energy accounting** (`PassiveSystem.passivity`, `closed_cycle`,
  CTPH sampled-passivity). Curve-agnostic by construction — proved on the abstract `PassiveSystem`,
  GH was only ever ONE instance. Transfers to any AMMCurve.
- **The info-geometric base + PH-lift framing** (single-μ core, `SingleCore.lean`; price=∇μ,
  R=∇²μ=Fisher, value-metric=1/μ″, trade=parameter translation). Holds for ANY exponential family with
  a C², convex μ — the manager addendum already states this as "one generator." Transfers verbatim to
  any curve whose invariant is an exponential-family cumulant potential (Balancer included — it's the
  degenerate member).
- **The Merton tie AT THE μ=Laplace-exponent LEVEL** (`Sstar_is_merton_boundary`, the
  characteristic-root structure ψ(−γ)=r). Confident: the tie "perpetual-option value = exp-family
  eigenfunction, smooth-pasting boundary = root condition" is generic to exp-family generators. What's
  GH-specific is the *concrete* ψ and the *which-root* fact (see re-instantiation).
- **Settlement-as-generated smooth-pasting uniqueness** (`Sstar_{A,B}_forced`, T1a). Confident — this
  is ALGEBRAIC: value-match + slope-match at arbitrary S forces S*=Kγ/(γ+1). It uses only that the
  continuation is a power law a·S^(−γ); ANY curve whose continuation value is the power law inherits it.
  (If a curve swap KEEPS value∝S^(−γ) — which route b does, route a does NOT off-base — this transfers.)
- **Rebase covariance / gauge** (`sNorm_rebase_invariant`, degree-0 gauge, PH-6 sNorm core). Transfers
  — it is a property of the carry/normalization coordinate, not of the kernel.
- **The within-interface typed contracts** (Seam H-wiring, CurvePool→TemporalAMM→PassiveSystem
  composition, the dimensional/units meta-invariant I12). Transfer — they read only the AMMCurve
  contract below, not its GH internals.
- **The variational American-optimality fragment** (T1b `opt_boundary_is_max`, critical-iff-smoothfit)
  — algebraic over the power-law continuation; transfers if power law is kept.

Rough proportion: **MOST of the proved corpus (the abstract/contract/info-geo/passivity/settlement-
algebra layers) transfers** for any valid AMMCurve, and ALL of it transfers for another exp-family
power-law curve.

### NEEDS RE-INSTANTIATION — curve-specific (a MINORITY, but it includes the hard GH special-function work)
- **GH kernel facts:** `ghKernel_pos`, `ghKernel_logderiv` (βh−αh·v/√(δ²+v²)), `ghKernel_exponent_le`
  (the ≤exp(−c|v|) tail bound). New curve ⇒ new kernel ⇒ all of these re-proven.
- **The GH measure theory** (CLOSEOUT item 2: integrability, IsProbabilityMeasure, finite-MGF on the
  strip). Currently DISCHARGED for GH off the kernel bound; a new kernel needs its own discharge.
- **GHMaps** (StrictAnti X(u), StrictMono Y(u)) and the `tail_β`/`F_{β+1}` Esscher-tilt identities —
  GH-special-function specific.
- **The GH measure / Bessel-K normalizer** M = K_ν ratio (carried, not needed for structural claims,
  but GH-specific).
- **The GH-specific γ↔σ map** `γ(γ+1)=2r/σ²` — this is the GAUSSIAN SLICE of the GH (MERTON-TIE
  finding: engine-pinned GH does NOT obey it exactly; σ_eff² varies 0.042→0.017 over γ). Curve-
  specific AND already known to be only-a-slice.
- **The which-eigenfunction fact** (βh=1 ⇒ put-only, call radicand OUT). This is precisely what a
  reparametrization (βh→0) would CHANGE — so it is curve-instance-specific by definition.
- **The carried GH hypotheses** (T<1/C<1 tail/CDF facts; the GH `AntitoneOn/ConvexOn` AMMCurve
  instance that still bottoms out in GH special functions). Re-instantiate per curve.
- **The 4 engine curve fns** (`getMP_raw`, `tradeUpdate`, `arbitrageToOracle`, `rebase`) — isolated by
  design (CLAUDE §4) but each must be re-derived for a new kernel. Confident this is bounded: the
  isolation is real and demonstrated.

### "Another hyperbolic curve" vs "CES / different family"
- **Switch to ANOTHER GH member (route b: reparametrize βh/δ): MOST transfers, LITTLE re-instantiation.**
  Same family ⇒ same kernel SHAPE ⇒ the kernel facts re-prove with the SAME techniques (the
  `√(δ²+v²)` logderiv, the exp tail bound) just at different constants; the measure theory pattern is
  identical; the Merton tie and power-law are NATIVE. The which-eigenfunction fact changes (βh→0
  recovers both roots) — that's the intended change. Estimate: re-instantiate the kernel-constant
  layer; everything above the AMMCurve contract is untouched. **Cheapest, highest-fidelity.**
- **Switch to CES / different family (route a): SOME transfers, MORE re-instantiation, AND a
  theory LOSS.** The contract/passivity/info-geo-IF-still-exp-family layers transfer, but CES off
  Cobb–Douglas is NOT a clean exp-family power law, so the **Merton tie, the power-law option
  semantics (G4 accuracy gate), settlement-as-power-law-eigenfunction, and the variational optimality
  fragment do NOT transfer off the base** — they'd have to be re-derived for a non-power-law value law
  (and likely cannot be, because the option semantics rest on the global exponent). Estimate: keep the
  abstract scaffold, LOSE the curve-specific economic tie that is the product's whole point. Most
  expensive in re-proof AND in theory fidelity.

---

## 4. Recommendation (operator's call — flagged)

**Recommend route (b): reparametrize the GH family so Balancer/Gaussian is the reachable base and δ
(at βh=0 for the symmetric two-root structure) is the kurtosis knob. Do NOT switch to CES.**

Rationale (honest tradeoffs):
- **Theory fidelity:** route (b) preserves the Merton tie, the exp-family μ, the power-law option
  semantics (G4), the proved measure theory, and the settlement-uniqueness algebra — the entire
  economic spine. CES would discard the power-law tie that justifies pricing options on the curve at
  all. (Confident.)
- **"Balancer inherited + kurtosis knob":** route (b) delivers BOTH literally — Balancer is the
  reachable (βh=0, δ→0) corner and δ is a *genuine excess-kurtosis* knob in the Merton variance-mixing
  sense. CES delivers Balancer-base but the wrong knob (elasticity, not kurtosis). (Confident on which
  knob each gives; the precise UI labeling is the operator's.)
- **Blast radius / what must be re-proven:** route (b) keeps everything above the `AMMCurve` contract
  untouched (demonstrated transfer in `AMMCurve.lean`) and re-instantiates only the kernel-constant
  layer (kernel facts, measure theory, GHMaps) at new βh/δ — same proof techniques, different
  constants. The one substantive change is **which eigenfunction the leg rides**: dropping βh=1 (put-
  only, a PROVED current fact) for βh=0 (both roots) restores symmetry but TOUCHES the eigenfunction
  selection, which brushes settlement semantics. **That eigenfunction/skew change is itself an
  operator decision, flagged below.**

**Honest caveat / the one real cost of route (b):** the current engine's put-only specialization
(βh=1) is load-bearing and PROVED; making the family symmetric (βh=0) to recover the two-root Balancer
structure changes the leg's eigenfunction content. Whether the product wants the symmetric two-root
object or the current one-sided put leg is a settlement-semantics / economic-object question — NOT a
formalization call. If the operator only wants the *tail/kurtosis* knob and is fine keeping the skew
(βh=1, put leg), then route (b) is even cheaper (free δ alone, leave βh) and brushes NOTHING in
settlement — that is the minimal, safest move and is my default recommendation if the symmetric
two-root structure is not specifically required.

**Two-tier recommendation:**
  1. **Minimal (lowest blast radius, my default): free δ as the kurtosis knob, leave βh=1.** Balancer-
     /Gaussian becomes the reachable δ→0 base of the *put* leg; δ is the excess-kurtosis knob; NOTHING
     in settlement/eigenfunction changes; re-instantiation is just kernel constants. Does NOT restore
     the symmetric two-root Balancer — gives "Balancer-on-the-put-wing + kurtosis knob."
  2. **Full (restores symmetric two-root Balancer): free δ AND set βh=0.** Recovers the exact
     symmetric Merton/Balancer base. Costs the eigenfunction/skew change (settlement-semantics, proved
     put-only fact revisited). Choose this only if the symmetric two-root structure is specifically
     wanted.

**CES is not recommended** for this objective: right base, wrong knob, loses the power-law tie.

---

## OPERATOR-ESCALATION FLAG (CLAUDE §4 / §7 Gate 2 — research-lead does NOT decide)
- **The curve/invariant choice (GH-reparametrize vs CES) is the OPERATOR'S call** — reopening locked
  architecture (curve-baked GH, γ>1). This note recommends; it does not decide.
- **Sub-decision inside route (b): βh=1 (keep put-only, minimal) vs βh=0 (symmetric two-root,
  restores Balancer but changes eigenfunction selection = settlement-semantics).** Also operator's
  call. The put-only fact is PROVED (MERTON-TIE), so dropping it is a real economic-object change.
- **Knob labeling** (δ as "kurtosis" vs "tail/excess" — δ is tails, βh is skew) is a paper/UI claim →
  operator via manager. Do not ship "kurtosis knob" loosely if δ-alone is exposed (δ is the tail/
  variance-mixing knob; pure excess-kurtosis vs skew should be stated precisely).

## Confidence ledger
- CONFIDENT: Balancer = exact Gaussian/Merton power-law base; Cobb–Douglas is an exp-family/Laplace-
  exponent member; AMMCurve contract transfers with zero reproof (demonstrated in-file); passivity/
  info-geo/settlement-algebra transfer; GH kernel/measure/GHMaps need re-instantiation; βh=1 ⇒
  put-only is PROVED; route (b) preserves the Merton/power-law tie, CES does not; CES knob = elasticity
  ≠ kurtosis.
- CONJECTURAL: that NO reparametrized CES sub-family recovers a clean power-law value law (I believe
  not — the power law is exactly the ρ=0/Cobb–Douglas point — but have not exhaustively checked CES
  sub-families); the exact magnitude of re-proof for route (b) full (βh=0) vs minimal (free δ) — I
  expect minimal to be kernel-constants-only and full to additionally revisit the eigenfunction
  selection, but the full βh=0 measure theory has not been run.

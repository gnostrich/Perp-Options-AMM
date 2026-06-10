# MEMORY — research-lead
_Last updated: 2026-06-10, CURVE-FAMILY derivation pass (notes-only; NO submit/edit/git) + memory DEQUARANTINE truth-up._

### CURVE-FAMILY DERIVATION — 2026-06-10 (operator greenlit "start"; manager-relayed; notes-only, NO submit/edit/git)
Note: `notes/research/CURVE_FAMILY_derivation_2026-06-10.md`. Target spec
`specs/SPEC_kurtosis_curve_family_TARGET.md`. mpmath/python float64 numerics + analytic.
**PART 0 DEQUARANTINE DONE (this task, before any derivation):** the three Part-0 corrections are
now encoded as live truth at the top of this file and the stale assertions struck inline below.
Confirmed: (1) closed-form invariant EXISTS (was "none"); (2) τ:=δ / engine=one (W) setting is
FALSE at curve level; (3) the "invariances-hold-by-carry" blanket is DROPPED — carry/rebase/
value-law/seam/funding are NOT established for a warp family (Esscher d-law fails mid-curve for (W)).
**PART 1 (conjecture, operator's hyperbolic-angle lens):** THE CURVE = the √-kernel level set
`F(x,y)= x^{w_mid}·y^{1−w_mid}·exp(−(Δw/2)·√(τ²+ln²(y/x))) = k` (first integral of the Balancer
local-weight law −dy/dx=(w/(1−w))(y/x), w(u)=w_mid+(Δw/2)·u/√(τ²+u²), u=ln(y/x)). THE LENS = the
hyperbolic-angle form `exp(−(Δwτ/2)·cosh(η−φ))` with η=asinh(u/τ), via the EXACT identity
√(τ²+u²)=τ·cosh η (the operator's 90°→180° polar view). Same curve, algebraic change of variable,
no membership owed. (a) ONE static amplitude/steepness/kurtosis knob = ATM sharpness w′(0)=Δw/2τ;
set once for vol, trade-invariant. **CAVEAT (flag): "one knob" is exact only in the symmetric
fixed-wing reading — otherwise Δw (skew spread) and τ (elbow width) are TWO geometric handles.**
(b) **Skew = φ, the angle SHIFT (η→η−φ) produced by trading** — a trade changes w (x,y follow real
reserves, paper Trade Formula); static amplitude untouched. The w-trade→φ map is OPEN (#16). (c)
**Wings frozen** — √(τ²+u²)→|u| ⇒ F→exact CD monomials x^{w₊}y^{1−w₊} (u→+∞) / x^{w₋}y^{1−w₋}
(u→−∞), γ_±=w_±/(1−w_±) τ-INDEPENDENT (wing weights exact to machine precision). **WHICH FORM:**
state the family with the √-kernel invariant; narrate it with the angle lens. Trig EARNS its place
ONLY as the lens (skew=shift, kurtosis=amplitude read off directly), introduces NO new content
(honors the standing Gudermannian flag — the d was amplitude relabeled; no extra dial in the angle).
**PART 2 (rebuild gate — does closed-form American settlement survive?):** VERDICT =
**GATE NOT CLEARED. Survives closed-form on the FROZEN WINGS only; FAILS-as-inherited in the ATM
elbow, where the most-traded band lives.** On a wing the curve is exact CD with constant local weight
(w₋ put / w₊ call) ⇒ exact power S^(−γ_±), γ_±=w_±/(1−w_±); the GH/Merton smooth-pasting algebra
(value+slope ⇒ S*=Kγ/(γ+1), continuation a·S^(−γ)) carries VERBATIM there [analytic]. **In the elbow
(|u|≲τ) γ_loc=w/(1−w) VARIES** ⇒ continuation is NOT a single power ⇒ inherited S* not guaranteed.
**Magnitude re-derived [numeric]:** a boundary exponent slope γ′=0.01 shifts S* from 75.0 to 87.3
(~16%) at γ=3,K=100; γ′_loc(0)=(Δw/2τ)/(1−w_mid)² is O(1)+ in the elbow. **Elbow width [numeric]:**
τ=0.3 → γ′_loc>1e-2 spans |u|<2.8 (price within ~16× of carry); τ=0.05 → |u|<0.85 (~2.3×). ATM/
near-ATM strikes sit IN the elbow ⇒ inherited closed form does NOT carry to the operative region.
Three resolution paths (note §2.5): (i) [needs-numeric/operator] confirm the traded strike band is
wing-registered (|u_K|≫τ) for the chosen τ — a product/calibration call; (ii) [needs-analytic] find a
generalized closed-form free boundary for the varying-exponent continuation (open, plausible given the
elementary integral); (iii) [needs-Aristotle] certify the seam C¹ once a boundary is pinned (cf.
AIRTIGHT T1a Sstar_forced / PH-5). **FLAGS for operator (via manager):** curve/knob choice
operator-tier; the rebuild gate currently BLOCKS the rebuild absent (i)/(ii); WHERE strikes register
(wing vs elbow) is the load-bearing settlement decision, operator/calibration-tier; "one amplitude
knob" exact only in the symmetric fixed-wing reading (Δw vs τ are two handles otherwise); skew-as-φ-
from-trading is the operator's frame but the paper-Trade-Formula→φ map is UNIMPLEMENTED (#16, OPEN);
carry/rebase/funding for the warp family are OPEN/not-shown (do NOT carry from GH). **Numerics
re-verified THIS pass (numpy/scipy float64, mpmath unavailable):** invariant logF const std 1.4e-13;
cosh identity 9e-16; wing weights exact; C¹ match ≤7e-15; boundary-shift + elbow-width tables in note.
Note `notes/research/CURVE_FAMILY_derivation_2026-06-10.md` now WRITTEN (prior header referenced it
before it existed on disk; the earlier Part-2 "seam-is-the-only-open-obligation" framing UNDERSOLD the
obstruction and is REPLACED by the gate-not-cleared verdict above). No engine/git/submit this pass;
nothing trusted-from-prover/verified.

---

> ## ⚠ CORRECTION HEADER (2026-06-10, appended by manager per skeptic verdict + stock-take — READ BEFORE BRIEFING FROM THIS MEMORY)
> **TRUTH-UP DONE (research-lead, same day, Gudermannian-bridge task):** both broken claims are now
> struck inline below (✗CORRECTED markers in the KURTOSIS-KNOB section). Do not re-assert them.
> Two flagship claims recorded below as facts are **BROKEN** (skeptic inaugural verdict,
> manager-verified independently — `notes/skeptic/VERDICT_KURTOSIS_KNOB_2026-06-10.md`):
> 1. **"κ:=δ EXACTLY / engine = one (W) setting" is FALSE at curve level** — live-engine test:
>    w_eff vs ln(y/x) is non-monotone; the engine is not a (W)-member at ANY τ. Kernel-in-SCORE
>    (GH) ≠ kernel-in-WEIGHT ((W)).
> 2. **"NO clean algebraic invariant exists" is FALSE** — explicit closed form
>    `x^{w_mid}y^{1−w_mid}·exp(−(Δw/2)√(τ²+ln²(y/x)))=k` is a first integral of the (W) law
>    (manager: analytic + RK4 4.8e-13).
> Also: Object-L kurtosis numbers below are the β=0 slice — at the engine pin β=1: skew +0.92,
> excess kurt 3.285 (∉[0,3]); and the δ-dial at β=1 is a COUPLED (skew,kurt) dial (skeptic
> stock-take). Survived attack: asymptote preservation, sign-split + "never ship τ-up=fatter",
> endpoints, β=0 table values, REPARAM δ-unfreeze core. **Truth-up your own entries on your next
> task before briefing anyone from them.** (Notation: the κ below was renamed τ repo-wide.)

### GUDERMANNIAN BRIDGE — 2026-06-10 (operator entries 8–9; notes-only; skeptic-gated)
Note: `notes/GUDERMANNIAN_BRIDGE_2026-06-10.md`. mpmath dps 40–50; every identity below numerically
checked (~1e-38) AND derived; β=0 AND β=1 throughout (skeptic pattern 3 honored).
**THE BRIDGE (exact):** strike-ray angle ψ (45°=ATM, tan ψ=y/x), χ=ψ−45°: `ũ=ln(y/x)=gd⁻¹(2χ)` —
the 90°→180° "fan opening" IS the forced doubling σ=2χ (gd maps ℝ onto exactly 180°); ATM↦ũ=0;
ATM gear dũ/dχ=2 EXACTLY, parameter-free. GH leg θ=asinh(v/δ) has the same asinh form; composite
ATM gear = 2/δ (=25 at engine). SLOT HONESTY: chain fully exact only on the CPMM base (ũ=log price);
on GH the distribution view attaches at the LATENT leg (kernel-in-SCORE ≠ reserve-ray — no gluing).
Fan inherits measure p_χ = f·2cosh ũ with EDGE POWER-LAWS ε^(α−β−1) call / ε^(α+β−1) put
(= ε^(γ−1)/ε^(γ+1) at pin; γ>1 lock ⟺ pinch-off at call edge). Verified 1.9999/3.9999.
**d-LAW VERDICT: NO clean single-d↔kurtosis law (not forced).** Four readings of d: geometric gear
=2 universal (no parameter); composite gear 2/δ is a knob but Gaussian point is gear→0 NOT 2;
in-cosh gear d gives wings exp(−c·v^(d/2)) ⇒ **d FROZEN at 2 by asymptote preservation** (d≠2 =
the |v|^d wing-snapper; verified p=d/2 exactly); Taylor reading "Gaussian = order-2 piece of cosh"
true but not a dial. Also "Gaussian/symmetric point" conflates two axes: symmetric=φ=0(β=0),
Gaussian=A→∞ — orthogonal in (φ,A). **REPLACEMENT = AMPLITUDE LAW:** A=δ√(α²−β²); exact at all A
via Bessel-K cgf (Z=2δcoshφ·K₁(A), cgf from log[K₁(δζ_t)/ζ_t]; matches quadrature 10 digits);
large-A: skew≈3tanhφ/√A, **exkurt≈(3/A)(1+4tanh²φ)** (β=1,γ=3: exk·A→3.75 ✓; γ=2: →13/3 ✓; β=0:
→3 ✓); A→0 endpoint = asym-Laplace (3.6644 at pin, 4.08 at γ=2). Monotone-dec in A:
GRID-CONFIRMED only (no analytic proof — flag if load-bearing).
**RECONCILE (skeptic stock-take key question):** angle frame IS the pure coordinate system —
δ-dial moves A only, φ/a/b (wing slopes a=α−β=γ, b=α+β) are δ-free; kernel log-density exactly
symmetric about θ=φ at every A. BUT moment functionals stay coupled at φ≠0: A-dial traces
exkurt≈skew²(1+4t²)/(3t²) in moment space (verified →0.9996). **The frame REFRAMES the impurity
(coupling lives in moment coordinates, not the dial), it does NOT dissolve it** — skeptic fact (a)
exact and untouched. Branch-B knob honest IFF labeled amplitude/shape dial; NOT honest as pure
moment-kurtosis at β=1 (purity needs β=0 = FULL fork = settlement change). Which kurtosis = U1 =
operator's sentence. Esscher-in-θ: tilt = linear re-aim of (φ,A) in span{cosh,sinh} (exact,
8e-38) ⇒ value∝S^(−γ) amplitude-proof; γ = a = call-wing slope, A-free; wing slopes δ-free with
correction αδ²/2v² (verified).
**FORKS:** cosh(θ−φ) frame = clean RE-COORDINATIZATION of branch B (same family, bijection
(α,β,δ)↔(a,b,A) — algebraic identity, no membership test owed). Branch A (W): structural PARALLEL
only — (W) log-invariant = w_mid·lnx+(1−w_mid)·lny−(Δwτ/2)cosh η, weight = w_mid+(Δw/2)tanh η,
ũ=τsinh η (exact, 9e-41): both branches = "amplitude × cosh of own hyperbolic angle" but in
DIFFERENT SLOTS (score vs weight/invariant) — broken bridge stays broken, NO identity claimed.
**SOLVENCY (#13, explicit):** m=2 X-depth at β=1: 0.0845→0.5630 over δ=0.08→3 (6.7×; reproduces
skeptic); β=0 reproduces REPARAM 0.034→0.220. B1 re-prices at any shipped setting; extrinsic,
NOT closed. #8 strike-reg + #9 funding dispositioned: no change proposed; survival on a built
δ≠0.08 engine = open engine checks (dir_gate/seam/G4 re-reference owed). Full 15-item table in note.

---

### KURTOSIS-KNOB κ — 2026-06-10 (operator: buildable single-κ asymptote-respecting knob on Balancer; DERIVE not approx)
Note: `notes/KURTOSIS_KNOB_kappa_balancer_native_2026-06-10.md`. mpmath 25–60 digit, direct construction.
Realizes the paper's `(w,κ)` Future-Directions conjecture in implementable form.
**✗CORRECTED (2026-06-10 truth-up — claim was BROKEN, skeptic counterexample, manager-verified):**
~~NO clean algebraic `F(x,y;w,κ)=k` exists~~ — FALSE. The closed form
`x^{w_mid}·y^{1−w_mid}·exp(−(Δw/2)√(τ²+ln²(y/x)))=k` IS a first integral of the (W) law (analytic +
RK4 4.8e-13). The 4.6e-41 check only showed the unmodified CD monomial is non-constant under variable
w (true); the impossibility inference was a non sequitur. (Angle form: the exponent =
−(Δwτ/2)cosh η with ũ=τsinh η — see GUDERMANNIAN BRIDGE entry above.)
**THE PROFILE (W):** `w(u;w₋,w₊,κ)=w_mid+(Δw/2)·u/√(κ²+u²)`, w_mid=(w₋+w₊)/2, Δw=w₊−w₋;
`w'(0)=Δw/(2κ)` = ATM sharpness = the knob; `w'=O(κ²/|u|³)→0` in wings.
**✗CORRECTED (2026-06-10 truth-up — claim was BROKEN at curve level, every β):** ~~κ:=δ EXACTLY
(engine = setting κ=0.08)~~ — FALSE. Live-engine w_eff vs ln(y/x) is non-monotone; τ_implied runs
0.012→2.41; the engine is not a (W) member at ANY τ. Kernel-in-SCORE (GH) ≠ kernel-in-WEIGHT ((W)).
The kernel-SHAPE correspondence survives only as an analogy (shared cosh-in-own-angle structure).
**`(w,κ)` ROLE SPLIT:** convexity=w_mid (γ̄), SKEW=Δw (Δγ=γ₊−γ₋, the existing w tilt), KURTOSIS=κ (ATM
elbow only). γ_±=w_±/(1−w_±) are the wing exponents, FIXED, κ does NOT move them.
**ASYMPTOTE PRESERVATION (the load-bearing req, CONFIRMED):** γ_loc(±100κ) BYTE-IDENTICAL across
κ∈{0.05,1,30} (err 3.12e-5/1.25e-4) ⇒ κ = pure horizontal elbow-rescale, wing exponent κ-independent;
dγ_loc/du→0 in wings. Analytic: rounding O(1) at ATM, vanishes 1/|u|³ in wings. NOT a tail-exponent
deformation.
**ENDPOINTS:** κ→∞ = plain Balancer (constant w, dq/du→1, Gaussian/δ→∞ — consistent w/ prior reconcile
that CD=δ→∞ NOT δ→0); κ→0 = sharp-elbow LAPLACE = the paper's "log/exponential-curve invariant" (kernel
exp(−α√(κ²+v²))→exp(−α|v|)).
**KURTOSIS LAW + SIGN PINNED (⚠ β=0 SLICE — truth-up 2026-06-10):** Object L (LATENT driver
f∝exp(−α√(κ²+v²))) = TRUE excess kurtosis ∈[0,3] **at β=0 ONLY**; engine pin β=1 gives skew +0.92,
exkurt 3.285, range (0, 3.6644] at γ=3 — and the δ-dial at β=1 is a COUPLED (skew,kurt) dial in
moment space (one-knob amplitude trace, exkurt≈skew²(1+4t²)/(3t²) — see GUDERMANNIAN entry).
β=0 numbers (κ=0.08→2.6530, 0.3→1.6885, 1→0.6961, 3→0.2472) correct as symmetric-slice facts.
3/(κα)=large-κ asymptote only; general large-A law: exkurt≈(3/A)(1+4tanh²φ). SMALL κ=LEPTOKURTIC,
fatness dial=1/κ. Object P (pushforward implied-price) = PLATYKURTIC, OPPOSITE sign (κ=0.3→−1.116).
RECOMMEND label tracks Object L; do NOT ship "κ up=fatter" (backwards). Label = operator's call.
**ENGINE INTEGRATION (minimal):** add ghKappa(≡ghDelta) scalar; key tail/CDF cache + √(κ²+v²) kernel on
κ; recompute M,Φ at κ. **⚠ truth-up:** rebase/conservation/Esscher slope-law/value∝S^(−γ)/seam
invariances hold for the GH δ-UNFREEZE (branch B) as REPARAM derivations — label
derived-not-engine-verified (no δ≠0.08 engine ever built); they do NOT transfer to the (W) family
(Esscher d log slope/du=1 fails mid-curve in (W); carry/rebase/seam for (W) = UNKNOWN). Lean:
above-AMMCurve-contract untouched; re-instantiate kernel-constant layer only (branch B).
**FLAGS:** (1) curve choice + knob exposure = operator; (2) ✗CORRECTED — a clean closed-form
invariant DOES exist (`x^{w_mid}y^{1−w_mid}·exp(−(Δw/2)√(τ²+ln²(y/x)))=k`); the old "no clean
invariant, profile is the only form" is FALSE (skeptic counterexample, manager-verified, RK4 4.8e-13);
(3) label sign object-dependent (track L, 1/κ=fatness); (4) ASYMMETRIC-w SETTLEMENT FORK SURFACED — κ
holds w₋,w₊ fixed (orthogonal to fork); independent w₋≠w₊ = both S^(±γ_±) live = βh=0/two-root settlement
change (REPARAM FULL fork). Ship κ with skew held = MINIMAL/safe; freeing skew = separate operator move.
(5) paper's "capital-efficiency conserved as κ varies" NOT proven (consistent w/ value-law κ-invariance,
but a conservation proof is separate). No engine/git/submit this pass.

---
_Earlier: 2026-06-09, HETEROGENEOUS-WEIGHT DERIVATION (closed-form implied density; NO submit/edit/git)._

### HETEROGENEOUS-WEIGHT DERIVATION — 2026-06-09 (operator: closed form from x,y,w; DERIVE not approx)
Note: `notes/HETEROGENEOUS_WEIGHT_implied_density_2026-06-09.md`. mpmath 30-50 digit, direct integration.
**Closed form (headline):** Balancer with position-dependent w(u) (u=log p−log P):
  q(u)=log p = u + log(w(u)/(1−w(u))) + const ;  d log p/du = 1 + w'(u)/(w(u)(1−w(u))) ;
  implied log-price density f_q = f_u(u(q)) / [1 + w'/(w(1−w))].
The weight enters ONLY through w'/(w(1−w)) = d log-odds(w)/du (the score). Constant w ⇒ linear warp ⇒
Gaussian preserved (skew=kurt=0, numerically 1e-8). Heterogeneous w ⇒ nonlinear warp ⇒ skew+kurtosis.
**Profile→moments map:** wing exponents γ_±=w_±/(1−w_±) (w flattens in wings ⇒ clean value∝S^(−γ_±),
dγ_loc/du→1e-10 at |u|=8); CONVEXITY=(γ_-+γ_+)/2; SKEW=γ_+−γ_-; KURTOSIS=transition sharpness w'(0)/δ.
**VERDICT: GENERALIZES GH (not recover).** GH = the specific √-sigmoid σ_GH(v)=(1+v/√(δ²+v²))/2 (latent
score β−αv/√(δ²+v²)); reproduces prior-note GH kurtosis EXACTLY (δ=0.08→2.6530, 0.3→1.6885, 1→0.6961,
3→0.2472). Concrete NON-GH member: tanh-score β−α·tanh(v/δ) — SAME wing decay (α−|β|), DIFFERENT
kurtosis (1.2184 √ vs 1.2000 tanh) ⇒ distinct valid distribution. Monotone+smooth+power-law-wings do
NOT force √ (tanh counterexample). RECOVER only under the extra inverse-Gaussian-mixing constraint
(GH's defining property) — a separate modeling assumption, flagged.
**AMM-VALIDITY gate on w(u):** w∈(0,1) [antitone]; dq/du=1+w'/(w(1−w))>0 i.e. w'>−w(1−w) [convex,
suff: w'≥0]; w_±∈(0,1) finite [coercive]. Numerically: monotone-incr w ⇒ valid; sharply-decreasing w ⇒
dq/du=−8<0 ⇒ INVALID/excluded.
**DENSITY-OBJECT AMBIGUITY (load-bearing honesty):** 3 objects differ. (1) pushforward f_q (USED) —
kurtosis SIGN is NEGATIVE/platykurtic (warp steepens ATM). (2) reserve-curvature −dX/dp — IMPROPER for
pure Balancer (unbounded reserves, non-integrable at p=0; needs both legs / GH bounded tail/CDF). (3)
latent f_β — POSITIVE/leptokurtic (Laplace-ward). Wing power-law lives in value-exponent γ_loc=w/(1−w),
NOT reserve tail. Kurtosis sign flips by object ⇒ any label must name the object.
**OPERATOR FLAGS:** (1) curve-member choice operator-owned; (2) density-object ambiguity changes the
answer (esp. kurtosis sign) — UI/paper label must name object, consistent w/ prior δ=ATM-elbow finding;
(3) asymmetric w_± = independent γ_± = both S^(±γ) eigenfunctions = βh=0/two-root settlement-semantics
change (FULL fork from REPARAM note; heterogeneous w is the GENERAL mechanism behind that fork; single-γ
engine β=1 is the w_-=w_+ slice); (4) validity is a HARD type gate not a tuning knob.

---
_Earlier: 2026-06-09, RECONCILE PASS (Balancer-δ + wings-vs-ATM resolved; NO submit/edit/git)._

### RECONCILE PASS — 2026-06-09 (resolved the Pass-1 vs Pass-2 δ conflict; manager-requested)
Built the actual curves (mpmath 35-40 digit, direct integration — not formula-arguing). **Authoritative
spec is now the v2 body of `notes/REPARAM_balancer_kurtosis_dropin_2026-06-09.md`** (rewritten to match
the manager header; whole file self-consistent). Pass-1 note `CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md`
got a CORRECTION HEADER. **Three resolved verdicts:**
- **BALANCER-δ VERDICT: the exact Cobb-Douglas/Balancer RESERVE CURVE is the δ→∞ (Gaussian) limit, NOT
  δ→0. Pass-1's "δ→0" is REFUTED.** Built it: CV of the CD invariant K=X^w·Y^(1−w) along the GH frontier
  decreases monotonically with δ (δ=1→0.55, 3→0.32, 10→0.11, 30→0.057; robust 2 windows), never →0 (GH
  reserves BOUNDED vs CD UNBOUNDED ⇒ coincidence is δ→∞ asymptote only). Reserve log-slopes flatten to
  CD constants −(1−w),w as δ→∞. CD=log-normal=Gaussian=δ→∞ — consistent with kurtosis direction. δ→0 =
  Laplace (fat return density), NOT Balancer. (Pass-1 conflated the fat-Laplace symmetric base with the
  Cobb-Douglas Gaussian curve — opposite δ ends.)
- **WINGS-vs-ATM VERDICT: δ is MOSTLY an ATM-elbow / return-kurtosis knob, NOT a tradeable-wing knob.**
  (a) wing power-law EXPONENT γ is δ-INVARIANT (value∝S^(−γ) ∀δ) — δ does NOT re-slope the option wings.
  (b) δ-sensitivity peaks at ATM (Δslope≈2.3-2.8 at u≈0), decays into wings (≈0.003 at u=−3); far wing
  |u|≫δ is δ-invariant (√(δ²+v²)→|v|). (c) elbow curvature: δ=0.08→12.3, δ=10→0.30 (δ↓=sharp elbow).
  (d) wing reserve DEPTH moves OPPOSITE the naive reading: δ↑ (thinner Gaussian returns) leaves MORE
  depth at OTM (X/Nx at m=2: 0.034→0.220 as δ 0.08→3) via soft elbow. HONEST FINDING for operator: if
  "kurtosis knob" meant "fatten tradeable wings," δ does NOT do that (γ is the wing knob).
- **CORRECTED KURTOSIS: TRUE excess kurtosis SATURATES at 3 (Laplace, δ→0), →0 (Gaussian, δ→∞), monotone
  decreasing in δ.** 3/(δ·αh) is LARGE-δ asymptote ONLY. Numerics (βh=0,αh=4): δ=0.08→2.65, 0.3→1.69,
  1→0.70, 3→0.25, 10→0.075. Matches manager's δ=0.08,γ=2→2.76. exk∈[0,3].

### REPARAM DROP-IN SPEC — 2026-06-09 (spec for operator's separate impl session)
Note: `notes/REPARAM_balancer_kurtosis_dropin_2026-06-09.md` (NOW v2 — see reconcile pass above).
mpmath sanity checks (30-40 digit) run + reported. **KEY (load-bearing) findings:**
- Esscher tilt `f_{β+1}/f_β=e^v` is EXACT, INDEPENDENT of (αh,βh,δ) ⇒ value∝S^(−γ) survives freeing
  δ/βh (G4 stays green in form; reference value regenerates). d log(slope)/d log(price)=1 all cases.
- Balancer = βh=0 member: kernel EVEN in v (reflection-symmetric two-root); αh=γ+1=1/(1−w) EXACTLY
  (w=γ/(γ+1)) — Balancer is a relabel of the αh axis. "Unreachable" = the βh=1,δ=0.08 PIN, not family.
- **DIRECTION CORRECTION (brief was backwards):** excess kurtosis = 3/(δ·αh) at βh=0 ⇒ **δ↑ ⇒ THINNER
  tails (toward Gaussian); δ↓ ⇒ FATTER (Laplace at δ→0).** Gaussian limit is δ→∞ (kernel→exp(−αh v²/2δ)),
  NOT δ→0. δ→0=symmetric double-exponential (fattest). σ_eff²=ψ″(0)=δαh²/(αh²−βh²)^{3/2} reproduces
  prior 0.042→0.017 running at engine pins. βh=0 ⇒ ψ even ⇒ ψ(−γ)=ψ(+γ) (symmetric ± eigenfunctions).
- 4 curve fns: getMP_raw/arbitrageToOracle/tradeUpdate change only by keying tail/CDF/M on (αh,βh,δ)
  + threading ghBeta/ghDelta as serialized scalars + (βh,δ)-keyed CDF cache; Esscher slope structure
  + rebase are ORTHOGONAL/invariant. Keep direct-tail + same-table-inversion numerics.
- FORK: MINIMAL (free δ, keep βh=1) = tail knob on put leg, ZERO settlement change, kernel-const
  re-instantiation only. FULL (free δ AND βh=0) = symmetric Balancer recovered but DROPS proved
  put-only eigenfunction = settlement-semantics/economic-object change (operator-owned).
- **OPERATOR FLAGS:** (1) βh=0 eigenfunction/settlement change; (2) curve reopening even for MINIMAL;
  (3) knob label — δ is TAILS (and δ↑=thinner, brief backwards), βh is SKEW; (4) ship GH root
  ψ(−γ)=r (implicit/numeric), NOT Gaussian closed form γ(γ+1)=2r/σ² (δ→∞ slice only).
- NOT verified: FULL-fork βh=0 Lean re-proof magnitude / two-wing seam / small-δ tail-integral
  stability at table resolution — implementer regenerates gate reference values empirically.

---

_Earlier: 2026-06-09, MERTON-TIE RUN (perpetual-option formal tie + GH-maps discharge; SCRATCH-ONLY)._

### MERTON-TIE RUN — 2026-06-09 (operator highest-relevance; canonical tree UNTOUCHED)
2 standalone submits (throwaway copies; 5 canonical modules byte-identical both archives; pins v4.28.0).
Scratch `formal/aristotle_runs/{MERTON_tie,GHMaps}/`; IDs in `MERTON_SUBMISSION_IDS.txt`; prompts
`formal/prompts/aristotle_prompt_{merton_tie,ghmaps}.md`. Stage-0 sympy gate run FIRST (all confirmed).

1. **MERTON_tie (f1fd0e4b) — perpetual-option ⟺ info-geometry tie. proved (trusted-from-prover);
   GROUNDED (G1–G4) + CARRIED[2 Prop fields].** μ = the GH Laplace exponent `ψ(θ)=mθ+δ(√(α²−β²)−
   √(α²−(β+θ)²))` (engine pins α=γ+1,β=1,δ=0.08); γ = the characteristic root ψ(−γ)=r; S*=Kγ/(γ+1) =
   Merton smooth-pasting. 7 GROUNDED: put radicand=4γ (in-strip), call radicand=−(2γ+3) (OUT — the GH
   asymmetry: β=1 ⇒ GH natively carries ONLY put eigenfunction S^(−γ); the two-root sum=1 is a GAUSSIAN
   artifact, NOT a GH identity), `merton_vieta_sum`⇔r=q, `merton_vieta_prod`⇔γ(γ+1)=2r/σ² (Gaussian
   SLICE), `sigmaEff2_closed_form` (real HasDerivAt ψ''(0)=δα²/(α²−β²)^{3/2}), `gaussian_limit_quadratic`
   (real Tendsto), `Sstar_is_merton_boundary` (value+slope⇒S=Kγ/(γ+1)). CARRIED (structure:Prop, NOT
   axiom): `GHIsLaplaceExponent` (ψ=cgf w/ Bessel-K normalizer) + `GaussianLimitOfGH` (distributional
   limit). **3 EMEND flags (grind @72/99/117, no math) — manager harden on canonical build.** Audit
   PASS (sigs char-identical, byte-identical, axioms⊆std three).
2. **GHMaps (9e52bb1f) — CLOSEOUT-carried StrictAnti X / StrictMono Y DISCHARGED. proved (trusted-
   from-prover); GROUNDED, fully token-CLEAN.** Derived from `ghKernel_pos`+continuity via FTC-2 +
   deriv-sign criterion (NO Bessel-K). 9/9. After this run, ONLY the Bessel-K normalizer VALUE M=K_ν
   ratio stays carried — and it is NOT needed for any monotonicity/structural claim (only 0<Nx,0<NyM
   enter). 1 mechanical emend (`noncomputable ghKernel`). The frontier `AMMCurve` instance is now
   grounded down to the M-value alone. Audit PASS.

**σ-KNOB RECOMMENDATION (operator decision — FLAGGED, not decided):** γ(γ+1)=2r/σ² now grounded but it
is the GAUSSIAN slice; engine-pinned GH does NOT obey it exactly (σ_eff² varies 0.042→0.017 over γ).
RECOMMEND σ primary knob, γ/S* derived, δ fixed — but ship the GH σ→γ map (full exponent), NOT the
Gaussian closed form. UI-knob LABEL = operator's call. No settlement/economic-object question surfaced.

**RETENTION:** proposed consolidated provenance INDEX drafted at `formal/aristotle_runs/INDEX_DRAFT.md`
(result→meaning→depth→archive→status over all ~172 scattered theorems). NOT relocated to `formal/`
unilaterally — manager review. See return for the full retention assessment + fold proposal.

---

_Earlier: 2026-06-09, AIRTIGHT RUN (settlement-as-generated + single-μ core; SCRATCH-ONLY)._

### AIRTIGHT RUN — 2026-06-09 (operator BUILD-AUTHORIZED; canonical tree UNTOUCHED)
4 standalone submits (`import Mathlib`, throwaway copies; all 5 canonical modules byte-identical in
every returned archive). Scratch `formal/aristotle_runs/AIRTIGHT_{probe_optstop,T1a_invert,T1b_optimality,T2_singlecore}/`;
IDs in `AIRTIGHT_SUBMISSION_IDS.txt`; full table RESULTS.md AIRTIGHT section. Prompts
`formal/prompts/aristotle_prompt_airtight_*.md`. Audit: token-clean (the only search tactics WERE 2
`grind` in T1b GENERATED bodies + 1 pre-existing `aesop` helper = FRAGILE flags, axiom-clean — ALL
THREE NOW HARDENED 2026-06-09 via T1b HARDEN run 7dec6a1b, file CLEAN), unscoped byte-identical, pins
intact, axioms ⊆ {propext,Classical.choice,Quot.sound} all targets, math re-derived.

**PROBE (c9bd9638) — Mathlib v4.28.0 optimal-stopping CAPABILITY FINDING.** EXISTS: stoppedValue,
optional-stopping/-sampling, hitting times (`hittingBtwn`/`hittingAfter`; old `hitting` gone),
convexity-optimality toolkit (`IsMinOn.of_isLocalMin_of_convex_univ` etc.), rpow/mgf/cgf. **ABSENT:**
Snell envelope, optimal-stopping value/existence, variational inequality / obstacle problem,
free-boundary / smooth-pasting. ⇒ full "smooth-pasting = Snell optimal stopping time" NOT generatable;
the deterministic value-maximizing-boundary fragment IS (toolkit assembly).

1. **T1a (3566d93c) — SETTLEMENT BOUNDARY GENERATED (leak collapsed, algebraic). proved (trusted-
   from-prover); GROUNDED.** Inverted R1: `Sstar_{A,B}_forced`/`coeff{A,B}_forced` — from value+slope
   match at ARBITRARY S>0 (NOT assumed=S*), DERIVE S=Kγ/(γ+1)[call]/K(γ+1)/γ[put] + the coeffs.
   Slope via explicit deriv-eq WITH bridge lemmas `hasDerivAt_const_mul_rpow`/`_call`/`_put` proving
   it IS the HasDerivAt content (prompt-allowed). Continuation a·S^(−γ)=exp-family value law ⇒ boundary
   FROM the value law. NO search tactics (cleaner than R1). Both wings. PH-5 upgrades to "C¹ BECAUSE
   it's the uniquely-forced free boundary," not a checked coincidence.
2. **T1b (794363d3) — smooth-pasting = OPTIMAL EXERCISE. proved (trusted-from-prover); GENERATED
   (variational) + CARRIED (Snell).** 6 GENERATED theorems: `opt_boundary_is_critical_{A,B}`,
   `critical_iff_smoothfit_{A,B}` (S* UNIQUE critical pt), `opt_boundary_is_max_{A,B}` (S* GLOBAL MAX
   of holder's value-over-boundaries, via monotone-up/antitone-down each wing). CARRIED:
   `AmericanOptimalityPrinciple` = `structure : Prop` (NOT axiom) with `True` field = the Snell-envelope
   optimal-stopping identification Mathlib lacks. So optimality is generated at the variational/free-
   boundary level, carried at the stochastic optimal-stopping level. **2 FRAGILE FLAGS — RESOLVED
   2026-06-09 (T1b HARDEN, ID 7dec6a1b, proved/trusted-from-prover).** line 92 `grind +qlia`→
   `right; field_simp; ring`; line 145 `grind`→`exact ⟨(Sstar_A_pos hK (by linarith)).le, le_rfl⟩`;
   Aristotle ALSO hardened a pre-existing line-73 `aesop`→`exact Or.inl hB.ne'` I had missed. Audit:
   diff-vs-original = exactly those 3 tactic lines (no statement/struct/sig touched), token-scan ZERO
   search tactics, 5 siblings byte-identical, pins intact, axioms ⊆ standard three (3 concrete
   replacements can't regress the set). Clean archive `AIRTIGHT_T1b_optimality_clean/extracted/
   proj_clean_aristotle/`. File now CLEAN. Summary's "removed hK≠0" line = STALE carried text (no real
   sig change). Manager to fold over the T1b archive.
3. **T2 (84a6a417) — SINGLE-μ CORE ("singular, not federation"). proved (trusted-from-prover);
   GROUNDED. Type-checks as ONE object off c.μ.** `structure MetriplecticCore` with ONE field μ
   (+hμ C², +hconvex μ″≥0 = single metric source). All primitives `def`s of c.μ: price=∇μ,
   Rdissip=∇²μ=Fisher, valueMetric=1/μ″ (Legendre dual), trade=translation, sNorm. 8/8 theorems incl
   headline `single_source` (c.μ=d.μ ⇒ all readings agree = type-level federation-collapse). NO search
   tactics. **SCOPE CAVEAT (Aristotle-reported, not audit fail):** `omega` is the trivial 1-D skew form
   (v*w−w*v≡0; unique skew form on ℝ¹ is 0) — symplectic reading degenerate in the 1-D gauge coord
   (consistent w/ Kähler-CONJECTURAL 1-real-dim finding). price/R/valueMetric/single_source = real content.

**AIRTIGHT verdict (distilled):** Settlement now GENERATED (algebraic leak collapsed, T1a). Optimality
PARTIAL-honest (variational GENERATED, Snell CARRIED, T1b). Single-μ core BUILT + type-checks as one
object (T2), ω trivial in 1-D. Kähler/Courant stay OUT-OF-CORE (proved obstruction / Mathlib gap from
CLOSEOUT) — excision justified; flag to manager for the doc. |Γ|≤1 exact / |Γ|>1 labelled-approx
(locked, not re-litigated). Funding/κ status quo. NOTHING upgraded to "verified" (env-blocked). No
economic-object/settlement-semantics question surfaced (T1a/T1b stayed within the locked American
boundary); no guardrail tripped.

---

### CLOSEOUT RUN — 2026-06-09 (operator: "spam Aristotle"; canonical tree UNTOUCHED)

### CLOSEOUT RUN — 2026-06-09 (operator: "spam Aristotle"; canonical tree UNTOUCHED)
5 standalone submits (`import Mathlib` only → no canonical module imported → byte-identity trivial).
Scratch `formal/aristotle_runs/CLOSEOUT_{cgf,GHmeasure,frontier,kahler,courant}/`; IDs in
`CLOSEOUT_SUBMISSION_IDS.txt`; full table RESULTS.md CLOSEOUT section. Audit: token-clean (the only
`sorry` is the ONE declared Kähler-K3 gap; all other forbidden/search-tactic grep hits are in
comments), statement-line diffs character-identical submit-vs-return, math re-derived.

1. **cgf_convexOn HARDEN → proved (trusted-from-prover); the one open UNIFY2 HOLD is CLOSED.**
   `exact?`→`convex_integrableExpSet.interior`; `grind +suggestions`→`(analyticAt_cgf ht).deriv.
   differentiableAt`. NO search tactic in returned proof; statement unchanged; variance core kept.
2. **GH integrability/finite-MGF DISCHARGED → "carried" REMOVED for integrability + probability-
   measure + finite-MGF.** From `ghKernel_exponent_le` (kernel≤exp(−c|v|), c=αh−|βh|>0): T2 `exp(−c|v|)`
   integrable; T3 `Integrable ghKernel`; T4 `0<∫`; T5 `IsProbabilityMeasure ghProb` (withDensity,
   normalized, via `ofReal_integral_eq_lintegral_ofReal`+`div_self`); T6 finite MGF on strip |βh+t|<αh
   (`exp(t·v)·ghKernel βh = ghKernel(βh+t)`). **NO Bessel-K, NO numeric Z used** — the closed-form
   normalizer VALUE is NOT NEEDED for any structural claim. GH measure is now a genuine probability
   measure with finite MGF over the REAL kernel, not a carried hypothesis. ghKernel + bound kept exactly.
3. **frontier antitone_y/convex_y → GROUNDED from slope law; CARRIED[StrictAnti X, StrictMono Y,
   chain hderiv/hmono].** Slope `g=k·e^(u−μ)` strict-mono+convex grounded; frontier antitone/convex
   FOLLOW once the (carried, NOT discharged) monotone reserve-coordinate maps X(u),Y(u) + chain are
   supplied. The carried maps are exactly where GH tail/CDF (Bessel-K-adjacent) still bottoms out.
4. **Kähler integrability → K1,K2 GROUNDED; K3 STILL-OPEN (Kähler stays CONJECTURAL).** dω=0
   (`hasDerivAt_const`), const-J Nijenhuis (`mul_zero`) clean. Variable-J(s) integrability = SINGLE
   named `sorry` + precise Mathlib-gap report: v4.28.0 has NO AlmostComplexStructure/NijenhuisTensor/
   Newlander–Nirenberg/Kähler-manifold infra → cannot even STATE it. NOT faked. Needs upstream Mathlib.
5. **Courant all-four → PROVED OBSTRUCTION (no-go); single all-four-native bracket SPECULATIVE-NOT-
   ACHIEVED (now with a proved reason).** Pairing on graph(A)=(Av)·w+(Aw)·v ⇒ isotropic⇔A skew;
   graph(J) isotropic (Dirac, recovers RUN-4); graph(J−R) with R≠0 NOT isotropic (=−2(Rv)·w) ⇒ no
   single maximal-isotropic Dirac bracket carries dissipation R (conservative + resistive = different
   slots). Mathlib has no Courant/Leibniz-algebroid type ⇒ the non-isotropic all-four object NOT built.

**TRUE REMAINING FLOOR after CLOSEOUT** (what genuinely stays open / carried):
- GH structural measure theory: **DISCHARGED** (item 2). Only the Bessel-K closed-form normalizer
  VALUE remains unformalized — and it is NOT needed for any structural claim (prob-measure + finite
  MGF + cgf machinery all hold without it). STILL-OPEN only if someone needs the explicit M = K_ν ratio
  number (needs Bessel-K formalized upstream in Mathlib — do not fake).
- GH **AntitoneOn/ConvexOn AMMCurve instance**: GROUNDED modulo the carried monotone coordinate maps
  X(u),Y(u) (the GH tail T / CDF C). Those maps need the GH special functions (Bessel-K-adjacent) — the
  residual carried content, NOT discharged.
- **Kähler integrability**: CONJECTURAL — Mathlib lacks a.c.s./Nijenhuis/Newlander–Nirenberg (upstream).
- **Courant all-four single bracket**: SPECULATIVE — the no-go is proved (R breaks isotropy); the
  Leibniz/Courant-algebroid object that would hold all four is not a Dirac structure and has no Mathlib type.
- Untouched/excluded (unchanged): B1 real solvency floor (κ extrinsic, operator ship-gate); C3
  spec↔engine link (engine-faithfulness pivot, not this run); "verified" label (env-blocked — all
  CLOSEOUT verdicts are trusted-from-prover, NOT verified).

**PROVENANCE CAVEAT for manager:** the cgf archive embeds no `#print axioms` command (the other 4 do).
Axiom-cleanliness for all 5 is per Aristotle's SUMMARY ({propext,Classical.choice,Quot.sound}); the
canonical-env build is where `#print axioms` gets independently reproduced — and where Kähler-K3's
`gh_J_integrable` will (correctly) show `sorryAx`, since it is the one declared-open theorem, not a
claimed proof. No economic-object/settlement question surfaced; no guardrail tripped.

---
_Earlier: 2026-06-09, RUN 4 (UNIFY2: REPLACE the tautological scaffold with REAL theorems; Tier-2 frontier; C3 axiom discharged)._

### RUN 4 — 2026-06-09 (operator BUILD-AUTHORIZED; SCRATCH-ONLY, canonical tree UNTOUCHED)
**Mission: push unification toward 100% by replacing RUN-3 UNIFY's trivial A1/A2/A3/B2/C1 with real
content.** 5 submits, ALL audit-passed → **proved (trusted-from-prover)**. Scratch dirs:
`formal/aristotle_runs/{UNIFY2,C3_reflection,Kahler,Courant}/`; canonical `formal/temporal_lean_verified/`
NOT touched. IDs in `formal/aristotle_runs/UNIFY2/SUBMISSION_IDS.txt`; full ledger RESULTS.md RUN-4.

**STAGE-0 capability finding (probe 0f0a8f0a, Mathlib v4.28.0):** Bessel-K `K_ν` **NOT in Mathlib**
(zero decls) → GH normalizing constant MUST be CARRIED. BUT `ProbabilityTheory.mgf`/`cgf`/
`hasDerivAt_mgf`/`deriv_mgf`/`deriv_cgf`/`iteratedDeriv_mgf`/`iteratedDeriv_two_cgf_eq_integral`,
`Measure.withDensity`→`IsProbabilityMeasure` (3 lines), and `hasDerivAt_integral_of_dominated_…` ALL
EXIST and GROUNDED. So the exp-family/cgf identities are groundable over the REAL integral cgf; only
the GH integrability-finiteness + Bessel-K normalization stay carried. This validated UNIFY2's design.

**UNIFY2 (fac1d6e2) — TAUTOLOGY REPLACED, 10/10 proved.** A1→`cgf_deriv_mean_and_variance`
(`HasDerivAt(cgf)=(∫X·exp)/mgf`, real); A4→`cgf_convexOn` (`cgf''=∫(X−mean)²·exp/mgf≥0`, real
variance-nonneg/Fisher-PSD); A2/A3→`mgf_pos`+`ghKernel_logderiv`+`ghKernel_exponent_le` (real
`0<mgf`, real GH log-deriv `βh−αh·v/√(δ²+v²)`, real integrability bound via `Real.abs_le_sqrt`);
B2→`deg2_score_centered` (real mean-of-tilt, NOT `R·0=0`); C1→`boost_is_hamiltonian` (real
`HasDerivAt(½gs²)=g·s`); B1 deg1 = real Bregman gradient. **#3 (GENERIC degeneracies over real
boost/KL/Fisher) folded here.** GROUNDED: exp-family/cgf structure + GH kernel facts (re-derived
numerically: cgf'=mean, cgf''=var≥0 at γ=3). CARRIED[named]: GH finite-MGF on strip + Bessel-K
normalization (∫=1) — Mathlib lacks Bessel-K. Audit: token-clean, out-of-scope byte-identical, sigs
character-identical, axioms⊆{propext,Classical.choice,Quot.sound} all 10, NO weakening, NO
could-not-close. **2 EMEND FLAGS (manager harden on canonical build, NOT audit failures):**
`cgf_convexOn` line 93 `exact?` (integrableExpSet convexity lemma) + line 99 `grind +suggestions`
(cgf analyticity). One allowed proof-only emend (sNorm tactic, 4.28.0 compat). NOT "verified".

**C3 (303c3de0) — REFLECTION AXIOM DISCHARGED.** `reflection_arrow: markPut θ s = markCall θ(θ²/s)`
+ symmetric corollary PROVED over the spec mark defs (crux `θ²/s<θ ↔ θ<s` via `div_lt_iff₀`). C3
no-arb NO LONGER rests on an axiom. CAVEAT: holds GIVEN the modeling identification "put = reflected
call" — now itself a proved algebraic identity, not an assumption (modulo spec-mark = engine-barrier).
Re-derived numerically (2000 pts exact). Audit clean (3 grep hits=comments; `+decide`=kernel decide;
allowed `/-- -/`→`/- -/` emend). axioms⊆standard three.

**Kähler (Tier-2 #4, dae504d8) — algebraic GROUNDED; integrability CONJECTURAL.** LOAD-BEARING
FINDING: GH interior is 1-REAL-DIM → no complex structure (J²=−1 needs even dim); the well-posed
object is the 2D phase-space Hessian metric. PROVED there: J²=−I, G·J=−ω, ω skew, det ω=1≠0, metric
posdiag — the algebraic Kähler-triple compatibility (UPGRADES RUN-3 C1 `g·w=g·w`). NOT proved:
differential integrability (Nijenhuis/dω=0) → "GH Hessian is Kähler" stays **CONJECTURAL** for the
analytic remainder. Audit clean, sigs identical, axioms⊆standard three, no sign adjustment.

**Courant (Tier-2 #5, b4d4656d) — conservative part GROUNDED; all-four SPECULATIVE-NOT-ACHIEVED.**
PROVED: graph of ω is a maximal isotropic for the Courant pairing (`graph_isotropic` via ω-skew) +
symmetry + injectivity → the symplectic structure IS a linear Dirac structure (single TM⊕T*M object).
**NOT achieved (reported, NOT asserted):** folding R + ports into the SAME bracket (Dirac=isotropic/
conservative; R breaks isotropy). All-four-native single bracket stays **SPECULATIVE** (Scope Lock).
Audit clean.

**RUN-4 escalations / flags for manager (do not over-promote):**
1. UNIFY2 is GROUNDED for the exp-family/cgf STRUCTURE, CARRIED for the GH normalization (Bessel-K
   absent from Mathlib). Real theorem, NOT a tautology, NOT fully GH-closed. State both halves.
2. UNIFY2 two EMEND flags (`exact?` line 93, `grind +suggestions` line 99 in `cgf_convexOn`) — harden
   to concrete lemmas on the canonical build.
3. Kähler is ALGEBRAIC compatibility only; integrability CONJECTURAL; 1D interior has NO Kähler.
4. Courant all-four single-bracket = SPECULATIVE-NOT-ACHIEVED (only the symplectic Dirac part done).
5. C3 axiom discharged MODULO spec-mark=engine-barrier identification (now a proved identity, but the
   spec↔engine link is the residual assumption). Solvency/B1 untouched (EXCLUDED, not targeted). No
   SDE introduced. GHJ latent-group economic-object finding unchanged.

---
_Earlier: 2026-06-09, RUN 3._

# MEMORY — research-lead (RUN 3 header retained below)
_RUN 3 (UNIFY: ONE metriplectic/Hessian structure; Stage-0 sympy gate + 1 Lean file)._

### RUN 3 — 2026-06-09 (operator-greenlit UNIFY; SCRATCH-ONLY, canonical tree UNTOUCHED)
**STAGE 0 sympy GATE PASSED (make-or-break, run FIRST).** Scripts durable: `formal/aristotle_runs/
UNIFY_stage0/`. (0.1) **M=Fisher HOLDS** — the dissipation/slope-deviation 2nd-order form = Fisher ∇²μ
of the GH exp family, **in the natural/centered coordinate s=v=u−μ** (`dMean/dNat=Var=Ψ″`, ~1e-14).
HONEST CAVEAT: in **raw log-price u** the dissipation curvature is e^u, **NOT** Fisher — so M=Fisher is
the STANDARD Bregman/exp-family identity in the GAUGE coordinate (Scope Lock 1), not a raw-u identity.
Single convex Ψ generates Esscher/price (grad), Legendre/symplectic (`V″=1/Ψ″`), dissipation Hessian
(Ψ″=Fisher). (0.2) **GENERIC degeneracies HOLD** — deg1 `d/ds KL=(s−s₀)Ψ″→0` at operating tilt; deg2
Fisher annihilates the centered-score/charge direction. (0.3) **Rebase-cov HOLDS** in sNorm (boost
u→u+log r cancelled by P→P/r). Did NOT need the fallback.

**STAGE 1 = UNIFY/Unify.lean (ID a2b3003a) — proved (trusted-from-prover).** 11/11 theorems, 5 blocks
A–E. Audit PASSED: `grep -rnE` token-scan clean (no sorry/admit/native_decide/sorryAx/opaque/unsafe/
axiom in returned .lean), axioms ⊆ {propext,Classical.choice,Quot.sound} all 11, out-of-scope files
byte-identical, pin v4.28.0, all theorem SIGNATURE lines character-identical submit-vs-return (only
sorry→proof bodies). One ALLOWED emend: B1 docstring `/-- -/`→`/- -/` (comment-only reformatting, no
math). Math re-derived (B1 `(s−s₀)Ψ″` non-vacuous; A1 = structural mean=grad/Fisher=Hess, GH integral
content carried by Stage-0 gate). NOT upgraded to "verified" (manager's label).

**Honest scope per block (over-promotion guard):** A (STANDARD exp-family; A1 structural, GH integral =
Stage-0 gate) · B (STANDARD; B2 = `mul_zero` structural encoding of score-centered) · C (boost-is-Ham-
flow STANDARD, but **Kähler interior = CONJECTURAL, NOT asserted** — only the symplectic=Kähler-ω
relation encoded) · D (STANDARD/GROUNDED, reuses PH-6 sNorm) · E (port NECESSARY only, NEVER suff; B1
extrinsic). **EXPLICITLY NOT CLAIMED:** single Courant/double-bracket all-four-native object
(SPECULATIVE). **4 flags for manager** (M=Fisher coord-conditional; Kähler conjectural; A1/B2 structural;
port/solvency/Courant unchanged) — full detail RESULTS.md RUN-3. archive: formal/aristotle_runs/UNIFY/.

---
_Earlier: 2026-06-09, RUN 2._

### RUN 2 — 2026-06-09 (operator-greenlit; SCRATCH-ONLY, canonical tree UNTOUCHED)
**Constraint honored:** all 5 obligations are STANDALONE `formal/aristotle_runs/<name>/<File>.lean`
importing canonical modules; the canonical `formal/temporal_lean_verified/` tree was NOT modified
(manager doing separate local build there). Submit-projects were throwaway copies (now deleted).
All 5 returned archives: canonical modules BYTE-IDENTICAL, pin v4.28.0, axioms ⊆ standard three,
token-clean (3 grep hits were COMMENTS), signatures character-identical submit-vs-return, math
re-derived. **5/5 proved (trusted-from-prover).** NONE upgraded to "verified" (manager's label).
IDs: CTPH_clean a33560b3 · GHJ_grounded 1c0f0a46 · GHcoercive_grounded 02c2e575 · PH4b_grounded
f19b24c7 · PH3_grounded 9c66598c. Full detail in formal/aristotle_runs/RESULTS.md (RUN 2 section).

- **Track 1 CTPH — CLEAN NOW + STRENGTHENED.** Prior `exact?` fragility flag RESOLVED:
  `ct_dissipation_ineq` uses concrete `skew_quadForm_zero hJ z` (no search tactic in source). Added a
  TIGHT discrete↔continuous link (`sampled_dissip_nonneg`/`sampled_increment`/`sampled_passivity`)
  replacing the near-vacuous existential: forward-Euler sampled storage, dissipation DERIVED ≥0 from
  R PSD, exact per-tick balance ΔH=supplied−dissipated, telescoped to the integrated bound. HONEST
  LIMIT: does NOT instantiate the floor-bearing PassiveSystem (no general floor = B1, external); link
  stated on sampled storage directly. archive: formal/aristotle_runs/CTPH_clean/.
- **Track 2 GHJ_grounded — ⚠ ECONOMIC-OBJECT FINDING (ESCALATED, not patched).** GH conserves NO
  clean ALGEBRAIC X·Y-style invariant (numerically: X·Y spans orders of magnitude along the frontier).
  Did NOT fabricate/weaken to manufacture one. DERIVED from the actual closed-form densities instead:
  Esscher tilt `f_{β+1}=e^v·f_β` (exact, sympy-checked), density ratio `=e^v`, GH slope law
  `slope=(Ny·M/Nx)·e^(u−μ)=getMP_raw·e^(−μ)`, trade=latent translation scaling slope by e^δ. Conserved
  object = latent one-parameter group + Esscher tilt, NOT a product invariant. Relay to operator as a
  characterization. archive: formal/aristotle_runs/GHJ_grounded/.
- **Track 2 GHcoercive_grounded / PH4b_grounded — PARTIAL grounding.** X∈(0,Nx), Y∈(0,Ny·M), y≥0,
  poolValue-bounded-above all now DERIVED from `0<T<1` (tail prob) / `0<C<1` (CDF) + Nx,Ny,M>0 —
  replacing opaque `0≤y` / `∃B,V≤B`. SCOPE: the T<1/C<1 facts are still CARRIED hypotheses (= the
  defining property of a probability tail/CDF, the GH content), NOT the GH special-function tables
  formalized. Full GH AMMCurve instance (antitone_y/convex_y from GH special functions) still OPEN —
  the big lift. PH4b necessary-not-sufficient PRESERVED. archives: GHcoercive_grounded/, PH4b_grounded/.
- **Track 2 PH3_grounded — GROUNDED (curve closed-form).** GH arb-leak ≥0 DERIVED from the engine's
  actual slope law g(u)=k·e^(u−μ): strict-mono (convexity) ⇒ leak density ≥0 ⇒ `∫(g(u₂)−g(u))du≥0`
  (LVR one-way). NOT an abstract PSD matrix. Necessary-not-sufficient PRESERVED (does NOT close B1).
  archive: formal/aristotle_runs/PH3_grounded/.
- **Unchanged guardrails honored:** B1 real floor stays operator ship-gate (no fabricated floor); C3
  reflection still an axiom (untouched); no SDE/stochastic content introduced.

---
_Earlier: 2026-06-08, BIG AUTONOMOUS RUN (14 obligations submitted to Aristotle)._

### BIG RUN 2026-06-08 (live) — 14 obligations submitted; auth + ledger durable
**AUTH (CRITICAL, CHANGED):** `ARISTOTLE_API_KEY` now reads BARE (length 49, starts `a…`, no `<>`).
Pass it **VERBATIM** — do NOT strip. (The old 51-char `<…>` wrap is gone; the strip-the-brackets
pattern in the old memory below is STALE for this container.) Auth confirmed by live submit+list.
Host `aristotle.harmonic.fun` UNBLOCKED. `--wait` blocks a long time (mathlib build server-side, ~9-17
min for smoke, longer for real); I submit WITHOUT `--wait`, capture project IDs, poll via `list`,
download finished archives, audit. CLI: `uvx --from aristotlelib aristotle ...` (PATH=/root/.local/bin).

**DURABILITY:** `formal/aristotle_runs/RESULTS.md` = running ledger (submission map + verdicts).
Archives → `formal/aristotle_runs/<name>/`. Prompts → `formal/prompts/aristotle_prompt_*.md`.
Project IDs + name map in /tmp/our_ids.txt, /tmp/id_names.txt (ephemeral; the durable copy is RESULTS.md).

**14 SUBMITTED (all stated as sorry-scaffolds for Aristotle to fill; math re-derived by me first):**
T1: R3 (mpGeom pin, ba84270a), R1 (PH-5 C¹ both wings θ=sNorm(K), e05ff5b5).
T2: R2 (crossover-at-K, f9faee69), GHJ (skew-J latent boost, 5d64284d), GHcoercive (8f55b116).
T3: R4 (orientation, 3674c141), PH3 (R⪰0 PSD, 1856bfb7).
T4: CTPH (continuous-time PH bridge / Q1, c5ba7851), PH6 (rebase J,R, 013d105b), C1 (composite-ray ITM,
51216401), C2 (collar w=½, 87a2150f), R5 (slippage basis-indep, 0b69e494), PH4b (no-floor GH-analogue,
20c5a137).
**GH-J WATCH-FLAG status:** NOT tripped — GH DOES conserve a clean invariant (the latent
parametrization / frontier; trade = latent translation u↦u+δ, one-parameter group). Stated honestly as
skew-J, not X·Y. If proving reveals no clean invariant → escalate (not expected).
**PH-5 SPEC RE-PIN done (notation/coverage only):** SPEC_itm line 15 θ=K/oracle→θ=sNorm(K) (value
boundary); port_hamiltonian_consistency.md PH-5 section gets the θ=sNorm(K) + two-branch note. Funding/
oracle layer-1 reference (SPEC_itm line 47, θ=K/oracle) LEFT price-measure (locked) — NOT touched.
**NOT submitted (stay escalation):** B1 real floor (κ extrinsic — but the CONDITIONAL structure WAS
submitted, honest), C3 reflection axiom, stochastic SDE bridge.

### VERDICTS (COMPLETE; full table in formal/aristotle_runs/RESULTS.md) — 14/14 audited, ALL proved
**ALL 14 = proved (trusted-from-prover), audit-passed** (token-clean, axioms ⊆ propext/Classical.choice/
Quot.sound, unscoped modules byte-identical where imported, pin v4.28.0, math independently re-derived):
R3, R1 (PH-5 both wings — LOAD-BEARING), R2, GHJ, GHcoercive, R4, PH3, PH6, C1, C2, R5, PH4b, B1, CTPH.
ZERO counterexamples, ZERO candidate-fails-audit, ZERO still-open.
**WATCH-FLAG (GH-J):** NOT tripped — GH conserves a clean invariant (latent one-parameter group);
genuine skew-J. frontier_preserved is true-but-near-tautological (scope note, not a weakening).
**3 FLAGS for manager/operator (do not over-promote):**
1. **CTPH emendation** — `ct_dissipation_ineq` left `exact?` (search tactic) in source; compiled
   server-side but fragile. Proposed no-math fix `exact skew_quadForm_zero hJ z` saved at
   `formal/aristotle_runs/CTPH/CTPH_emended_PROPOSED.lean` (NOT locally re-verified — manager apply+build).
2. **C2 scope** — collarSurplus MODELLED as θ·((1−w)/w−1); engine's exact closed form not in accessible
   specs. Proven content = symmetry-iff. Confirm closed form before literal-invariant claim.
3. **B1/PH-3/PH-4b necessary-not-sufficient** — do NOT close real solvency; κ-coverage stays EXTRINSIC
   = operator ship-gate. B1 proves only the conditional structure (coverage carried, never discharged).
**Provenance:** all "trusted-from-prover" (Aristotle's kernel ran, ours didn't). Manager may upgrade to
"verified" by building canonically. NONE upgraded by me. Archives under formal/aristotle_runs/<name>/.


### THIS PASS (2026-06-08, provenance-label sync after the operator's no-local-re-verify clarification)
Recap memo + label reconciliation. Verified my owned PH docs already comply with the process update
(`notes/PH_RECAP_2026-06-08.md`, `specs/port_hamiltonian_consistency.md`, this MEMORY) — they retired
PENDING-LEAN and use `trusted-from-prover` correctly. Synced the two research-lead-owned AUDIT
artifacts that still carried stale "proved + re-verified" / local-`lake build`-gate framing:
`formal/smoke/README.md` (now: server compile IS the build; verdict labels = proved (trusted-from-
prover) / counterexample; SMOKE STATUS folded in) and `formal/MANAGER_VERIFICATION.md` (§0/§1/§5
reframed: the canonical-env build is a **label upgrade to "verified"**, not a trust-removal of an
unbuilt sketch). NOT touched (out of my scope — manager owns them): `.claude/agent-memory/manager/
MEMORY.md`, `.claude/agents/research-lead.md`, `docs/routines/aristotle_ph_loop.md` — these still say
"local re-verify / proved+re-verified / PENDING-LEAN" and are STALE vs the process update.
**ESCALATION to manager:** those three manager-owned docs need the same PENDING-LEAN→trusted-from-prover
/ drop-local-re-verify-gate edit; I cannot edit them (manager-owned). No engine/git actions taken; no
new heavy submit run (recap only, per task constraint).

## Role (UPDATED — I am my own prover interface; no courier)
I am the **theory owner AND my own prover interface**: I decide what to prove, structure the Lean, own
the PH-scaffold reasoning, phrase obligations, **submit to Harmonic's Aristotle myself via the
aristotlelib CLI**, audit returned candidates, emend mechanical backend diffs, and interpret verdicts.
The standalone `aristotle` peer agent is **GONE** — its job is folded into me. Flow is now direct:
me → `aristotle submit` → poll → **zero-cost artifact audit** → one verdict → I interpret.
**All raw prover/poll output stays in MY context.** The **manager** is orchestrator + sole git/env
actor; it gets only my **distilled** reports (verdicts, queue status, escalations), never raw logs, and
relays nothing between agents. I hold `Bash` + the CLI; I do **no** git/env actions and never rubber-stamp
a candidate.

### PROCESS UPDATE (operator, 2026-06-08) — no local re-verify gate; Aristotle's server compile IS the build
Operator clarified: **Aristotle actually compiles/builds at its end, in the matching toolchain (Lean
4.28.0 / Mathlib v4.28.0).** Consequences, applied throughout this memory:
- **DROP the PENDING-LEAN framing as a blocker.** A returned candidate Aristotle compiled is a genuine
  compiled proof, not a sketch. Do NOT park results in PENDING-LEAN limbo, and do NOT use the
  PENDING-LEAN label anymore. The absence of a local lean/lake toolchain in this container is no longer
  a verdict-blocker.
- **No local `lake build` re-verify is required as a gate.** The manager may still build in the
  canonical env later; that's a label upgrade, not a gate I owe.
- **KEEP the zero-cost artifact audit** on every returned archive (needs no toolchain): (1) token-scan
  (`sorry`/`admit`/real `axiom` decls/`native_decide`/`sorryAx`/`opaque`/`unsafe`; kernel `decide` ok),
  (2) read Aristotle's own `#print axioms` — must be ONLY `propext`/`Classical.choice`/`Quot.sound`,
  (3) diff every unscoped module byte-for-byte to confirm no statement was weakened / no false hypothesis
  added, (4) re-derive the math (Lean validity ≠ intended claim). **A clean server build can still be a
  clean proof of a WEAKENED statement — the audit is what catches that, so it stays mandatory.**
- **LABEL:** a returned, server-compiled, clean-axiom, audited candidate = **trusted-from-prover**
  (Aristotle's kernel ran, ours didn't). NOT "verified" (that's the operator's word to grant later),
  NOT PENDING-LEAN.

## Connection — EXACT invocation (aristotlelib CLI)
- **Library:** `aristotlelib` (PyPI; was v2.0.0). Console script: `aristotle`. Host
  `aristotle.harmonic.fun`. Auth: `ARISTOTLE_API_KEY` env var (set in this env, len 51).
- **Run without persistent install (preferred):** `uvx --from aristotlelib aristotle <verb> ...`
  (uvx present at /root/.local/bin/uvx). Fallback: `pip install aristotlelib` then `aristotle <verb>`.
- **Submit an obligation (fill sorries in a Lean project):**
  ```
  aristotle submit "<my instructions>" \
    --project-dir formal/temporal_lean_verified \
    --wait --destination /tmp/aristotle_out.tar.gz
  ```
  (`--wait` polls to completion; `--destination` saves the solution dir/tar. Without `--wait`, use
  `aristotle list` / `show <id>` / `download <id> --destination …` / `tasks` / `cancel <id>`.)
- **Formalize NL/TeX → Lean:** `aristotle formalize <file> --wait --destination <out.tar.gz>`.
- **Verbs:** submit · formalize · list · show · download · cancel · tasks · ask.
- No official Harmonic **MCP** package exists → **no `.mcp.json`** path. For cloud **routines**, use the
  **Harmonic connector** toggle; for Bash sessions, this CLI is the interface.

## Zero-cost artifact audit (non-negotiable gate — I never rubber-stamp; needs NO toolchain)
_Aristotle's server compile is the build (operator, 2026-06-08), so there's no local `lake build` step.
The audit below is what I still owe — it catches a clean build of a WEAKENED statement, which a green
compile alone never would._
1. Extract the returned candidate over a THROWAWAY copy of `formal/temporal_lean_verified` (never the
   working tree).
2. Confirm `lean-toolchain` = `leanprover/lean4:v4.28.0` and lakefile mathlib `rev = v4.28.0` UNCHANGED
   in the returned archive (Aristotle built against these; an altered pin is a red flag).
3. Token-scan changed files: reject `sorry`/`admit`/`axiom`(real decls)/`native_decide`/`sorryAx`/
   `opaque`/`unsafe`. Kernel `decide` OK. Carried hypothesis FIELDS (B1/B3/B4) are allowed when the
   obligation marks them as fields.
4. Read Aristotle's own `#print axioms <thm>` for each target — must show ONLY `propext`,
   `Classical.choice`, `Quot.sound` (a `sorryAx` fails). (`ARISTOTLE_SUMMARY.md` reports these.)
5. Diff every module I did NOT scope as changed — must be byte-identical (no silent statement edits /
   weakened hypotheses / added false hypothesis). An unexplained out-of-scope diff is a bounce.
6. Re-derive the math independently and confirm the Lean statement is the INTENDED statement —
   Lean validity ≠ intended claim. This is the step that catches a clean proof of a weakened goal.

## Backend-diff emendation — allowed vs bounce (I do the emending now)
- **MAY emend (mechanical, no math change):** import lines, Mathlib API-drift renames, namespace/open
  fixes, whitespace/formatting, `set_option` not affecting kernel trust. Record every emendation.
- **MUST NOT patch (treat as theory failure, don't go green):** any change to a *statement*, a
  weakened/added hypothesis, a new `axiom`, replacing a proof with `sorry`/`native_decide`, or any math
  change. A candidate that only passes after a forbidden change = `candidate-fails-audit`.

## The four verdicts (exactly one per obligation; distilled to manager)
- **proved (trusted-from-prover)** — Aristotle compiled it server-side (matching toolchain) AND it
  passed the zero-cost artifact audit (clean tokens, axioms ⊆ propext/Classical.choice/Quot.sound,
  no out-of-scope diff, statement is the intended one). Trusted-from-prover (Aristotle's kernel ran,
  ours didn't); the manager may later upgrade to "verified" by building in the canonical env. Attach
  proof for folding. (Was "proved + re-verified" — the local re-verify gate is dropped; the audit is
  the gate.)
- **counterexample** — Aristotle refuted it. Relay verbatim; repairing the statement is MY call.
- **still-open** — no proof / timeout / partial. Record furthest state + blocker.
- **candidate-fails-audit** — host reports proved but the artifact audit fails (dirty axioms/`sorryAx`,
  forbidden token, altered toolchain pin, out-of-scope statement weakening, or only "passes" via a
  forbidden emendation). Record the failing diagnostic. (Was `candidate-fails-local-recheck`; renamed —
  the failure is now an audit failure, not a local-build failure.)

## ⛔ Connection / toolchain status (live) — SMOKE-TESTED 2026-06-08
- Host `aristotle.harmonic.fun`: **UNBLOCKED — CONFIRMED with a real round-trip** (no more
  `403 host_not_allowed`; both smoke lemmas submitted, ran, and returned archives). The old network
  allowlist block is gone.
- **API-KEY (live, 2026-06-08 big run):** `$ARISTOTLE_API_KEY` now reads **BARE (len 49, starts `a…`,
  no `<>`)** — pass it **VERBATIM**, the CLI picks it up from the env var (no `--api-key` needed, no
  strip). Auth confirmed by live submit+list. **STALE (prior container):** the key used to be wrapped
  `<arstl…H24>` (len 51) needing a `<>`-strip; that wrap is GONE here. Robust detect: if len==51 and
  starts `<`, strip; if len==49, pass verbatim. Do NOT strip a len-49 bare key (would corrupt it).
- **EXACT WORKING INVOCATION (verified):**
  `export PATH="/root/.local/bin:$PATH"` then
  `uvx --from aristotlelib aristotle submit "<instructions>" --project-dir <dir> --api-key "$STRIPPED" --wait --destination <out>`
  CLI = aristotlelib **2.0.0**; verbs: submit · ask · formalize · download · list · show · tasks · cancel.
  `--destination` writes a **gzip tar** (`tar -xzf`), containing `<name>_aristotle/` with the .lean,
  `lakefile.toml`, `lean-toolchain` (= `leanprover/lean4:v4.28.0`, matches canonical), `lake-manifest.json`,
  `README.md`, `ARISTOTLE_SUMMARY.md`. Poll/inspect a task: `aristotle show <project_id> --api-key … --limit 0`.
- No `lean`/`lake`/`elan` toolchain in this container → **but this is no longer a blocker** (operator,
  2026-06-08): Aristotle compiles server-side in the matching toolchain, so the returned candidate IS a
  compiled proof. I do NOT owe a local `lake build`. What I DO owe is the **zero-cost artifact audit**
  (token-scan + read Aristotle's `#print axioms` + unscoped-module diff + math re-derivation) — none of
  which needs a toolchain. A clean, audited candidate is reported **trusted-from-prover** (NOT
  PENDING-LEAN). The PENDING-LEAN label is retired.

## Toolchain / where the Lean lives
- **Lean 4.28.0 + Mathlib v4.28.0** (match `formal/temporal_lean_verified/lean-toolchain`).
  Lakefile `formal/temporal_lean_verified/lakefile.toml`, lib `RequestProject`.
- Modules: `formal/temporal_lean_verified/RequestProject/` — `Temporal.lean` (passivity core,
  = the §1-§4 PH file mirrored in the PH prompt), `AMMCurve.lean` (curve validity gate + short-gamma
  bridge), `Seam.lean` (pool value → value layer → passivity storage; hosts `reserves_have_no_floor`),
  `Audit.lean`, `Main.lean`. Audit template: `formal/MANAGER_VERIFICATION.md`.
  Aristotle prompt templates: `formal/prompts/aristotle_prompt_{port_hamiltonian,seam,curve_gate}.md`.
- Aristotle (the prover) is **external** (no Lean in the agent loop). Contract = prompt + returned archive.
- **PH consistency spec: `specs/port_hamiltonian_consistency.md`** (PH-1…PH-7 obligation targets).
- **Throwaway smoke probes: `formal/smoke/`** (`smoke_true` PROVED, `smoke_false` REFUTED/counterexample;
  excluded from RequestProject build) — first live test of the direct loop. I submit these MYSELF via the
  CLI. **SMOKE STATUS (2026-06-08): both round-trips COMPLETED.**
  - **smoke_true (`2+2=4`):** task COMPLETE_WITH_ERRORS (no open goal to fill — already proved by
    `norm_num`). Aristotle built it server-side, confirmed it closes, reported `#print axioms` =
    `propext` only (within allowed propext/Classical.choice/Quot.sound). Returned .lean unchanged.
    **Verdict label: proved (trusted-from-prover)** — server-compiled, clean axioms, audit passes.
    (Under the 2026-06-08 process update; was "PENDING-LEAN" before the no-local-re-verify clarification.)
  - **smoke_false (`∀ n:ℕ, n = n+1`):** task COMPLETE. Aristotle correctly did **NOT** prove it —
    declared it false, gave counterexample n=0 → 0=1, commented out the original unprovable theorem,
    and instead proved the *negation* `¬(∀ n, n=n+1) := fun h => by cases h 0`. No fabricated proof of
    the false goal; no active `sorry`. **This is the desired refutation outcome — no red flag.**
    **Verdict label: counterexample (correct refutation).**
  - Net: the direct submit→candidate loop WORKS end-to-end and Aristotle's server compile is the build;
    no local `lake build` gap remains. Discrimination test passed — prover did not "prove" the false one.

## How I phrase an obligation (then I submit it myself)
Standalone, self-contained: (1) informal statement + intended math meaning; (2) the Lean — embed or
import the verified modules; pin every predicate; (3) explicit proof targets; (4) output spec
(compiles? diff of changes? `#print axioms`? no forbidden tokens?); (5) toolchain line
(Lean 4.28.0 + Mathlib v4.28.0). Mark B1/B3/B4-style hypotheses as FIELDS, not goals, when carried.
Then `aristotle submit` it directly — no handoff to the manager for the prover step.

## PH obligation queue (PH-1…PH-7) — all sent-status "open/staged" (nothing submitted yet)
- **PH-1** H ↔ GH curve geometry — scaffolded (generic wiring proved-in-prompt; GH `AMMCurve` instance open
  = GH gate-discharge). autonomous.
- **PH-2** skew-symmetric J / lossless routing — barrier proved-in-prompt; GH invariant open. autonomous;
  WATCH: if GH trade conserves no clean invariant → ESCALATE (economic object).
- **PH-3** dissipation R⪰0 (B3 arb_nonneg / LVR) — field scaffolded; GH grounding open. autonomous;
  ESCALATE if grounding needs redefining arbLeak (settlement semantics).
- **PH-4a** passivity / no-free-lunch — proved-in-prompt. autonomous.
- **PH-4b** reserves-have-no-floor / "convexity must be funded" — proved-in-prompt for cpmm (O=p²);
  GH analogue open. PIN: this is the NEGATION of an intrinsic floor (not §1 H_floor); makes the funding
  port NECESSARY, not sufficient (sufficiency = B1). autonomous. BddBelow/coercive watch.
- **PH-5** C¹ continuity at smooth-pasting S*=Kγ/(γ+1) (value+slope = engine seam gate) — **NEEDS-REPIN
  (v26c, 2026-06-08).** HEAD registers strike at **θ=sNorm(K)=(oracle₀/S)^γ**, NOT θ=K/oracle (PH-5/ITM
  spec text is stale on θ). Same closed form, corrected registration coord — NOT a settlement-semantics
  change. ALSO incomplete: seam gate binds TWO wings (A: call 1−S/K, S*=Kγ/(γ+1)<K; B: put 1−K/S,
  S*=K(γ+1)/γ>K); PH-5 names one branch → extend to branch B. autonomous; ESCALATE only if locked form
  found NOT C¹ (seam gate currently green: value 0.04%, slope 0.1% ≤0.15%).
- **PH-6** rebase structure-preserving θ→θ/r — sNorm gauge proved-in-prompt; J/R preservation open.
  v26c CONSISTENT (cleaner: θ=sNorm(K) reads strike in the gauge-invariant coord; sNorm* tracks θ→θ/r). autonomous.
- **PH-7** funding well bounded below (model floor, H=S−logS) — proved-in-prompt. autonomous.

## Build-derived theory candidates (v26c recap, 2026-06-08 — notes/PH_RECAP_2026-06-08.md)
NOT yet in PH-1…PH-7 / C / B. All AUTONOMOUS formalization; none submitted (recap only). Priority:
- **R1** Re-pin PH-5 → θ=sNorm(K), extend to 2 branches (highest value; only PH item v26c touched).
- **R2** crossover-at-K / coordinate-invariance theorem: θ=sNorm(K) ⇒ OTM→ITM crossover at dollar K
  ∀γ (θ=K/oracle drifts to oracle₀²/K for γ>1; γ−1 gauge defect) + mixed-basis negative control. NEW.
- **R3** small pin `mpGeom=getMP_raw·e^(−ghMu)`, `getMP_raw/slope=e^μ` — prerequisite for PH-2/PH-3 GH
  (slope vars must use mpGeom not getMP_raw price coord; the slippage-bug conflation).
- **R4** directional/orientation lemma: sign(K−oracle)==sign(funding ±2)==sign(d mark/d sNorm); CALL all
  +, PUT all − ; companion to PH-3. CAVEAT funding stays price-measure (θ-swap flips its sign).
- **R5** (opt) %-slippage basis-independence (e^μ cancels) — corollary of R3, not its own obligation.

## Framing
Typed interface stack: a change at any seam must type-check at every other seam (enforced by the
type-checker, not inspection). The "self-sandwich bug" was an interface violation (settlement
reaching past its contract into the raw displaced pool) — caught by type under this discipline.

## Live proof queue (UPDATED post-big-run 2026-06-08)
- **C1** — composite-ray → ITM via effective-strike substitution. **proved (trusted-from-prover)** (run
  2026-06-08; formal/aristotle_runs/C1/). sinh_log identity + universal-over-effective-strikes.
- **C2** — no costless-collar arb at w=½. **proved (trusted-from-prover)** (formal/aristotle_runs/C2/).
  SCOPE CAVEAT: collarSurplus MODELLED as θ·((1−w)/w−1) (documented form); engine's exact closed form
  not in accessible specs — proven content is the symmetry-iff. Manager: confirm closed form before
  promoting as the engine's literal invariant.
- **C3** — no-arb is symmetry, not instrument. **RUN-4: reflection arrow DISCHARGED** (no longer an
  axiom). `reflection_arrow: markPut θ s = markCall θ(θ²/s)` proved over the spec mark defs
  (formal/aristotle_runs/C3_reflection/). RESIDUAL ASSUMPTION (do not over-promote): the discharge
  holds modulo "the spec mark = the engine's barrier" — the put=reflected-call identification is now a
  proved algebraic identity, but the spec↔engine link is the remaining premise. Report as
  "arrow discharged; spec-mark↔engine-barrier is the residual link," NOT "C3 fully closed."
- **GH gate-discharge** — `coercive` field **proved (trusted-from-prover)** for the GH bounded-reserve
  shape (formal/aristotle_runs/GHcoercive/; `coercive_of_nonneg` matches the AMMCurve.coercive field
  signature byte-for-byte; lower bound 0). **RUN-2 GROUNDED FURTHER (PARTIAL):**
  formal/aristotle_runs/GHcoercive_grounded/ now DERIVES X∈(0,Nx),Y∈(0,Ny·M),y≥0 from T,C∈(0,1)
  (tail/CDF) rather than asserting 0≤y — but T<1/C<1 still carried as the defining tail/CDF property
  (GH special-function tables NOT formalized). Full GH `AMMCurve` instance (antitone_y/convex_y from
  the GH special functions) still OPEN — the bigger lift.
- **B1** — REAL solvency floor STILL OPEN (κ extrinsic; operator ship-gate). The **conditional
  structure** WAS proven this run (formal/aristotle_runs/B1/): coverage-hypothesis → solvency, coverage
  a CARRIED premise never discharged = the κ-extrinsic limit as a theorem. No fabricated floor.
- **B3** = PH-3 arb_nonneg → **proved (trusted-from-prover)** as R⪰0 PSD (formal/aristotle_runs/PH3/);
  NECESSARY-not-sufficient. **RUN-2 GROUNDED:** formal/aristotle_runs/PH3_grounded/ derives the leak
  ≥0 from the engine's actual GH slope law g(u)=k·e^(u−μ) (strict-mono ⇒ ∫(g(u₂)−g(u))du≥0), NOT an
  abstract PSD matrix. Still necessary-not-sufficient (does NOT close B1). **B4** = ledger field
  (carried, unchanged).

## Audit discipline (before folding any returned archive — zero-cost, no toolchain)
Extract → diff unchanged modules → token-scan (`sorry`/`admit`/`axiom`/`native_decide`/`sorryAx`/
`opaque`/`unsafe`; kernel `decide` ok) → read proofs → **re-derive the math independently** → read
Aristotle's `#print axioms` (must be only `propext`/`Classical.choice`/`Quot.sound`). Server-compiled
+ audited = **trusted-from-prover** (manager may upgrade to "verified" by building canonically; that's
a label upgrade, not a gate I owe). Pin every predicate **before** a run.

## Decisions that route to the operator (flag via manager)
|Γ|>1 scope ("true American" vs "exact replication" are mutually exclusive per wing → ship |Γ|≤1
exact or |Γ|>1 as a *labelled approximation*); calibration tier for Γ (oracle tier needs adversarial
review); any paper claim. Don't over-promote (the "tripwire" failure mode).

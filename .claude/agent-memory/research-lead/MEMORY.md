# MEMORY — research-lead
_Last updated: 2026-06-09, v24↔GH EQUIVALENCE RUN (slippage-function comparison; READ-ONLY engine; no git; sympy/Node only, no Aristotle)._

### v24↔GH EQUIVALENCE — 2026-06-09 (operator-driven theory; reconcile manager's double-count claim)
Sources: v24 `reference/v24_balancer_stable.html` (tradeUpdate L1617, getMP_raw L1597, hyperbola
(x−α)(y−β)=αβ), GH `engine/knowledge/{GH_MATH.md,gh_engine_reference.js}`, paper §AMM-Mechanics.
Numerics durable in /tmp/slip{,2,3,4,5}.js. KEY FINDINGS:
- **v24's trade is ALSO a fixed-curve point-slide** — NOT a goal-seek-w warp. tradeUpdate slides
  (x,y) along the FIXED hyperbola (x−α)(y−β)=αβ with α,β conserved (hyp residual ~1e-16). `w=α/x` is a
  DERIVED readout of position, not a re-solved shape. Paper "reshape via w" = the Balancer pricing-curve
  PICTURE re-labels; the TRAJECTORY is fixed. So v24 and GH are the SAME KIND of mechanism (point-slide
  on a fixed curve), differing only in WHICH curve.
- **v24 slippage is NOT curve/state-dependent.** Measured d ln(slope)/d ln(sNorm) = −2 EXACTLY at every
  point (sNorm 0.25→4, w 0.83→0.17). v24 slope ∝ sNorm^(−2). Value (integral) ∝ S^(−1): **γ=1 fixed.**
  The operator's premise "v24 slippage CHANGES with the curve" is FALSE for the live trajectory — it
  conflates the fixed-α,β hyperbola (the trade path, const exponent) with the FROZEN-w Balancer family
  (x^w y^(1−w)=k, slippage exponent −1/w, which DOES vary with w but is NOT the path a trade takes).
- **GH at γ=1 ≅ v24** (both = CPMM-in-offsets, exponent −2 slope / γ=1 value). **GH at γ>1 is STRICTLY
  STEEPER** — value ∝ S^(−γ), the tunable knob v24's fixed w=½ cannot reach. The frozen-Balancer weight
  that LOCALLY reproduces GH-γ is w=γ/(γ+1) (≡ αh=γ+1=1/(1−w) from the βh=0 reconcile; consistent).
- **EQUIVALENCE VERDICT (CONFIDENT): NOT equivalent at γ>1; equivalent only at γ=1.** Both are
  fixed-curve point-slides with the SAME mechanism TYPE and the SAME ATM/sNorm=1 reference; they differ
  in the convexity exponent (v24 pinned γ=1; GH free γ>1). GH already delivers the γ>1 steepness v24 lacks.
- **Q3 RECONCILIATION (the decisive one): the MANAGER IS RIGHT, the operator's worry is misframed.** GH's
  point-slide ALREADY carries the full γ>1 slippage (it is BAKED into the GH curve shape via αh=γ+1).
  Adding a v24-style goal-seek-w reshape ON TOP of GH WOULD double-count: you'd apply convexity twice
  (once in the GH curve, once in the warp). The operator's "v24 slippage is curve-dependent so GH must be
  missing it" is incorrect — v24's slippage is a FIXED γ=1 power law, LESS rich than GH's, not a missing
  ingredient GH needs to import. GH is a strict GENERALIZATION (γ knob), not a lossy reduction.
- **45°/ATM reference (CONFIDENT): preserved in ECONOMICS, not in geometry.** v24's 45° (y=x) coincides
  with ATM only because equal-weight w=½ makes equal reserves the mode. GH reserves are unequal at ATM
  (X0=5,Y0=400000) so there is no literal y=x line — but the ECONOMIC ATM (sNorm=1, S=1, funding=0,
  density mode) IS preserved. Operator's "45° slope-point reference" = ATM anchor ⇒ preserved.
- **Q4 WHAT-IT-TAKES: nothing to add for IDENTICAL-to-v24 if "identical" means the same mechanism+ATM
  behavior — GH already is that, plus a γ knob. To literally REPLICATE v24's exact −2/γ=1 curve, set
  GH γ=1 (boundary, excluded by §4 locked γ>1). A βh-goal-seek warp is NOT needed and WOULD double-count
  (Q3). If the operator instead wants the v24 VISUAL (equal-reserve 45° picture), that is a display-frame
  choice, not a dynamics change — flag as operator-owned, do not implement.**

OPERATOR-OWNED FLAGS (via manager): (a) the premise "v24 slippage is curve-dependent" is a factual
misunderstanding to correct, not a spec change; (b) whether to expose a γ=1 "v24-compat" mode reopens the
§4 locked γ>1 — operator call; (c) the 45° equal-reserve VISUAL vs GH's economic-ATM frame is a display
decision. NONE are soundness defects. CONFIDENT on all four answers (algebra + numerics, machine-precision).

---
_Earlier: 2026-06-09, βh=0 FORK SCOPING RUN (settlement soundness + Lean re-proof cost of freeing δ,βh)._

### βh=0 FORK SCOPING — 2026-06-09 (theory+formal scoping; READ-ONLY engine; no git; no new Aristotle submit)
Task: is the FULL fork (free δ, set βh=0 → symmetric Balancer-shape base) settlement-sound enough to
ship, and at what Lean re-proof cost? Build on manager's verified reconcile
(`evidence/manager_verify_reconcile_2026-06-09.md`): CD/Balancer = δ→∞ limit; δ=kurtosis (engine δ=0.08
fat-tailed ~Laplace); αh=γ+1=1/(1−w); Esscher e^v ⇒ value∝S^(−γ) is δ/βh-FREE. Did NOT re-litigate those.

**VERDICT: GO-WITH-CONDITIONS on FULL fork settlement soundness (confident on the formal/math core;
the live conditions are operator-owned product calls, not soundness defects).**

**1. Settlement soundness (CONFIDENT):**
- **Both wings paste C¹ under βh=0 with the SAME closed form already proved.** Re-derived symbolically
  (sympy): branch A (call-dir, cont a·S^(−γ), S*_A=Kγ/(γ+1)) and branch B (put-dir, cont b·S^(+γ),
  S*_B=K(γ+1)/γ) BOTH give value 1/(γ+1) at their boundary and slope residual EXACTLY 0. This is the
  R1 / PH-5 two-branch form ALREADY proved-trusted. βh=0 changes nothing here — the boundaries are γ-only.
- **The two eigenfunctions S^(±γ) are ALREADY both present as the two char-roots.** MertonSigmaGamma
  (proved-trusted) shows −γ AND γ+1 are both roots of the char quadratic on the r=q (sum=1) slice,
  INDEPENDENT of βh. So "both eigenfunctions live" is not new at βh=0 — the engine already realises both
  boundaries (one per wing). βh=0 makes the kernel EVEN/symmetric; it does NOT add a missing eigenfunction.
  The current βh=1 is the SKEWED case; the proved put-only "Merton tie" is about which WING the trader
  holds, not about an eigenfunction being absent.
- **ITM rule / close=exercise (C1, proved-trusted) stays well-posed** — C1 is universal-over-effective-
  strikes (sinh_log), boundary is γ-only, no βh dependence; both wings already covered. No ill-posedness.
- **No-internal-arb / collar-symmetry biconditional (C3) is NATURALLY AT HOME at βh=0.** C3's discharged
  reflection arrow `markPut θ s = markCall θ(θ²/s)` and the no-arb=reflection-symmetry corollary are the
  SYMMETRIC (w=½, R_θ-invariant) statement. βh=0 (even kernel) is exactly the symmetric configuration that
  arrow describes ⇒ βh=0 STRENGTHENS the natural home of the biconditional, does not break it. (Caveat
  unchanged: C3 still rests on spec-mark↔engine-barrier as the residual link; that is orthogonal to βh.)
- **NET — which settlement-semantics change at βh=0:** NONE become ill-posed; NONE break no-arb. What
  changes is the ECONOMIC POSTURE: βh=0 is a symmetric two-sided instrument (both wings equally weighted by
  the even kernel) vs βh=1's skewed posture. That is a PRODUCT/economic-object decision (CLAUDE §4 locked
  curve; §7 operator-owned), NOT a soundness defect. Flag to operator, do not decide.

**2. Lean re-instantiation cost for βh=0 = SMALL (CONFIDENT, this is the strong finding).**
  Every `βh=1` occurrence in the ENTIRE Lean corpus is in a COMMENT (`--`/`/-`/doc prose) — verified by
  grep across all `formal/aristotle_runs/**/*.lean`. In every actual DECLARATION, βh is a FREE bound
  variable under the strip hypothesis `|βh|<αh` (GHMeasure) or `αh>|βh|` (UNIFY2). Consequences:
  - GHMeasure (integrability, prob-measure, finite-MGF, `ghKernel_exponent_le`): βh-GENERIC. βh=0 is the
    instance βh:=0, trivially satisfies `|0|<αh` since αh=γ+1>0. ZERO re-proof.
  - esscher_core / density_ratio / gh_slope_law (UNIFY2, GHJ_grounded): the +1 tilt = ·e^v is βh-free
    ⇒ value∝S^(−γ) unchanged. ZERO re-proof.
  - MertonSigmaGamma roots / R1 smooth-pasting / C1 ITM / R4 orientation / C3 reflection: γ-only or
    symmetry statements, βh-independent. ZERO re-proof.
  - The ONLY edits are DOC/COMMENT updates (the "βh=1" prose lines) — mechanical, no math, no statement.
    A cheap confirmatory Aristotle obligation (instantiate the strip facts at βh:=0) is OPTIONAL and would
    be near-trivial; I did NOT submit one this pass (scoping was the deliverable; the genericity is already
    visible in the proved statements). Scope = SMALL.

**3. MINIMAL fork (free δ, keep βh=1) = settlement-INVARIANT (CONFIRMED).** δ appears only inside
  ghKernel as a kernel constant; it is δ-free in Esscher (value∝S^(−γ)), γ-only in the boundaries, and the
  GHMeasure facts hold for all δ (δ enters only via √(δ²+v²)≥|v|, used with any δ). No eigenfunction change
  (βh=1 put-only posture unchanged), no boundary change, no no-arb change. Lean cost: ZERO (δ already a
  free var in every ghKernel statement). MINIMAL is the safe fallback — genuinely a no-op for soundness.

**4. Vol↔shape labeling (CONFIRMED manager's correction; honest recommendation):** `γ(γ+1)=2r/σ²` is the
  GAUSSIAN (δ→∞) slice ONLY; engine (δ=0.08) is fat-tailed (~Laplace, ~2.65 excess kurtosis) and obeys the
  implicit GH Laplace-exponent root ψ(−γ)=r, NOT the Gaussian formula. HONEST labeling rec:
  - Label the steepness knob as **γ (steepness/convexity)** directly, OR as **δ (kurtosis/ATM-elbow)** —
    both are HONEST GH shape knobs. Do NOT label a knob "volatility σ" via the Gaussian inverse
    γ=(−1+√(1+8r/σ²))/2 (that is a Gaussian-equivalent LENS, not the engine's true vol) UNLESS explicitly
    marked "Gaussian-equivalent σ (display lens, δ→∞ slice)". No clean closed-form vol↔setting at finite δ;
    the only exact relation is the implicit ψ(−γ)=r root. SPEC_vol_knob_NEXT.md §2/§0 currently uses the
    Gaussian σ↔γ as if exact — that labeling needs the manager's correction-1 caveat applied before HEAD
    promotion (v26d). This is an operator/manager labeling call; I flag it.

**OPERATOR-OWNED (flag via manager, I do NOT decide — CLAUDE §4 locked curve / §7 settlement-semantics):**
(a) FULL vs MINIMAL vs neither — βh is a pinned constant of the LOCKED GH curve; unfreezing it (even to a
    sound value) reopens a locked decision. (b) Economic posture: symmetric two-sided (βh=0) vs skewed put
    (βh=1) instrument. (c) Knob labeling (σ-lens vs γ vs δ; correction-1 caveat). (d) v26d σ-knob promotion
    is HELD pending (c). NONE of these are soundness blockers — they are product/scope calls.

CONFIDENT: items 1 (C¹ both wings, no-arb survives), 2 (SMALL Lean cost — βh generic), 3 (MINIMAL no-op),
4 (vol labeling correction). CONJECTURAL/CAVEATED: C3 residual spec-mark↔engine-barrier link (pre-existing,
βh-orthogonal); the "ψ(−γ)=r exact root" is stated, not Lean-formalized (no Bessel-K in Mathlib — same
floor as CLOSEOUT). No Aristotle submit this pass (scoping deliverable); canonical tree UNTOUCHED.

---

### MERTON RUN — 2026-06-09 (theory task: is the ITM solution the Merton perpetual American? pin σ↔γ)
**Result: ALL THREE CLAIMS CONFIRMED, math independently re-derived (sympy). One NEW obligation queued
+ proved (trusted-from-prover): the σ↔γ characteristic-root map.** SCRATCH-ONLY (`/tmp/merton_submit`,
`import Mathlib` only → canonical tree UNTOUCHED). Archive
`formal/aristotle_runs/MertonSigmaGamma/`; ID ae96d620-7634-4ef0-bdd0-639c999f1f5d; prompt
`formal/prompts/aristotle_prompt_merton_sigmagamma.md`.

- **CLAIM 1 CONFIRMED.** Merton (1973) perpetual-American-put smooth-pasting boundary is `S*=Kλ/(λ−1)`
  (from value-match + C¹: `A S*^λ = K−S*` and `A S*^λ = −S*/λ`). At negative root `λ=−γ` this is
  EXACTLY the engine's `Kγ/(γ+1)` (put-direction / sNorm/θ branch). γ = magnitude of the negative root.
  Merton continuation coeff (dollar payoff K−S) = R1 coeffA × K (the fraction-payoff 1−S/K normalization)
  — same solution, fraction-scaled. So the engine ITM region IS the Merton perpetual American option.
- **CLAIM 2 CONFIRMED.** Two engine boundaries ⇒ two roots: `Kγ/(γ+1)→λ₋=−γ`, `K(γ+1)/γ→λ₊=γ+1`
  (since `Kλ/(λ−1)=K(γ+1)/γ ⟺ λ=γ+1`). SUM=1. Char quadratic sum-of-roots `1−2(r−q)/σ²`=1 ⟺ **r=q**
  (zero-net-carry). Product `−γ(γ+1)=−2r/σ²` ⇒ **γ(γ+1)=2r/σ²**. Both `−γ` and `γ+1` verified to vanish
  the quadratic under r=q ∧ r=γ(γ+1)σ²/2.
- **CLAIM 3 CONFIRMED + BENIGN.** Engine is the one-parameter `r=q` slice of the two-root Merton family
  (sum-of-roots pinned at 1; only γ free, set by σ via γ(γ+1)=2r/σ²). Independent call/put exponents
  (full σ,r,q freedom) are NOT in the curve — but r=q (zero net carry) is NATURAL for a perp-funded
  underlying where funding is the carry mechanism, not a held dividend/rate spread. Restriction is
  correct/benign for this product. NOT a bug; flag to operator only as a PAPER-SCOPE statement.

**NEW obligation MertonSigmaGamma — proved (trusted-from-prover), AUDIT PASSED.** File
`RequestProject/MertonSigmaGamma.lean`, 5 targets: root_neg, root_pos, sum_roots, sum_eq_one_iff_rq,
sigma_gamma_map. Audit: token-clean (no sorry/admit/native_decide/sorryAx/opaque/unsafe/axiom);
toolchain v4.28.0 + mathlib v4.28.0 UNCHANGED; theorem SIGNATURES byte-identical submit-vs-return;
ONE allowed mechanical emend = `char` def param `λ`→`«λ»` (Lean-4 keyword escape, statement/meaning/
constants UNCHANGED — `λ` is the lambda keyword); standalone (no canonical module imported, tree
untouched); math re-derived independently (sympy). PROVENANCE CAVEAT: archive embeds NO `#print axioms`
command → axiom-cleanliness {propext,Classical.choice,Quot.sound} is per Aristotle SUMMARY only;
canonical-env build reproduces it (same caveat as cgf). NOT "verified" (manager's label).

**R1 (PH-5) covers the SMOOTH-PASTING HALF of Merton already** (value+slope match at both S*_A,S*_B =
C¹ = the McKean/Merton free-boundary conditions) — that is the load-bearing content and was already
proved-trusted (`formal/aristotle_runs/R1/`). What MertonSigmaGamma ADDS: the explicit identification
of `−γ, γ+1` as the characteristic roots and the σ↔γ map. R1 + MertonSigmaGamma together = the full
Merton identification (boundary geometry + characteristic exponent).

**PAPER claim cleared (with scope):** "Temporal's perpetual options are priced by the Merton
perpetual-American solution; the steepness γ is the characteristic exponent, set by volatility via
γ(γ+1)=2r/σ² on the zero-carry (r=q) slice." HONEST: state the r=q slice EXPLICITLY (do not imply full
(σ,r,q) freedom / independent call+put exponents — those are NOT in the curve). Paper-claim sign-off is
the operator's call (flag via manager).

---
_Earlier: 2026-06-09, CLOSEOUT RUN (collapse remaining formal items to true floor; SCRATCH-ONLY)._

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

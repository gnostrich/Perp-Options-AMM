# Aristotle run ledger — big autonomous run 2026-06-08

> **NAV:** newest run is the MERTON-TIE RUN (2026-06-09) immediately below. The consolidated
> provenance INDEX over ALL runs is **`formal/INDEX.md`** (PROMOTED from the draft 2026-06-10,
> operator-greenlit; the scratch `INDEX_DRAFT.md` is retired). Layout guide: `formal/README.md`.

---

## MERTON-TIE RUN — 2026-06-09 (operator highest-relevance: Merton formal tie + GH-grounding leftover; SCRATCH-ONLY)

2 standalone submits (throwaway copies of the canonical tree + one new `import Mathlib` module each;
all 5 canonical modules BYTE-IDENTICAL in both returned archives; pins `v4.28.0` unchanged). Scratch
`formal/aristotle_runs/{MERTON_tie,GHMaps}/`; IDs in `MERTON_SUBMISSION_IDS.txt`. Prompts
`formal/prompts/aristotle_prompt_{merton_tie,ghmaps}.md`. Stage-0 sympy gate run FIRST (Vieta + GH
exponent + Gaussian limit + curvature), all confirmed before submit.

| ID | name | target | verdict | depth | dir |
|----|------|--------|---------|-------|-----|
| f1fd0e4b | MERTON_tie | μ=GH Laplace exponent, γ=char root ψ(−γ)=r, S*=Merton boundary, γ(γ+1)=2r/σ² Gaussian slice | **proved (trusted-from-prover)** | GROUNDED (G1–G4) + CARRIED[2 Prop fields] | MERTON_tie/ |
| 9e52bb1f | GHMaps | DISCHARGE carried StrictAnti X / StrictMono Y from density-positivity (Bessel-K-FREE) | **proved (trusted-from-prover)** | GROUNDED — carried hyps discharged | GHMaps/ |

### MERTON_tie (f1fd0e4b) — the perpetual-option ⟺ info-geometry tie, GROUNDED + 2 carried fields.
7/7 targets proved. **Stage-0 (sympy, mine, before submit):** Vieta sum ⇔ r=q; Vieta product ⇔
γ(γ+1)=2r/σ²; put radicand `(γ+1)²−(1−γ)²=4γ` (in-strip), call radicand `(γ+1)²−(γ+2)²=−(2γ+3)`
(OUT of strip — the GH asymmetry, the load-bearing honest finding); `psiJump → (σ²/2)((β+θ)²−β²)`
in the α=k,δ=σ²k,k→∞ limit (1e-6); `ψ''(0)=δα²/(α²−β²)^{3/2}` symbolic match.
- **GROUNDED (real Lean):** `gh_put_root_in_strip` (4γ≥0), `gh_call_root_out_of_strip` (−(2γ+3)<0,
  the asymmetry — GH natively carries ONLY the put eigenfunction S^(−γ); the two-root sum=1 is a
  Gaussian artifact, NOT a GH identity), `merton_vieta_sum` (⇔ r=q), `merton_vieta_prod` (⇔ γ(γ+1)=
  2r/σ², the σ-knob Gaussian SLICE), `sigmaEff2_closed_form` (genuine `HasDerivAt` 2nd-deriv = ψ''(0),
  through `deriv_sqrt`/`deriv_div`), `gaussian_limit_quadratic` (real `Filter.Tendsto`, rationalize +
  divide-by-k), `Sstar_is_merton_boundary` (value+slope match ⇒ S=Kγ/(γ+1), real derivation).
- **CARRIED (`structure : Prop`, True fields, NOT axioms):** `GHIsLaplaceExponent` (ψ = the genuine
  cgf of the GH/NIG law with the Bessel-K normalizer — Mathlib gap) and `GaussianLimitOfGH` (full
  distributional GH→Normal limit). The exponent's quadratic-coefficient identity (G3) IS grounded;
  only the distributional/normalizer layer is carried.
- **AUDIT PASS:** token-scan = 3 `grind` only (the disclosed FRAGILE flags, lines 72/99/117 — axiom-
  clean, statements correct, NOT audit failures); zero sorry/admit/axiom/native_decide/sorryAx/opaque/
  unsafe; all 8 signatures CHARACTER-IDENTICAL submit-vs-return (`hγ:1<γ`, `hδ:0≤δ` retained though
  unused — NO weakening); `#print axioms` block over all 6 named targets, Aristotle reports ⊆
  {propext,Classical.choice,Quot.sound}; 5 canonical modules byte-identical; math re-derived (sympy).
  **3 EMEND FLAGS (manager harden on canonical build):** `grind`@72 (rpow↔sqrt³ algebra in
  sigmaEff2), @99 (field_simp step in gaussian_limit), @117 (final linear solve in Sstar). No math.

### GHMaps (9e52bb1f) — CLOSEOUT-carried monotone maps DISCHARGED (Bessel-K-FREE). GROUNDED.
9/9 proved, fully token-CLEAN (zero fragile tactics). The CLOSEOUT_frontier run carried `StrictAnti X`
/ `StrictMono Y` as bare hypotheses calling them "Bessel-K-adjacent" — they are NOT. This run DERIVES
them from `ghKernel_pos` (density positivity, already proved) + `ghKernel_continuous` via FTC-2
(`intervalIntegral.integral_hasDerivAt_right`) and the derivative-sign criterion
(`strictMono_of_deriv_pos` / `strictAnti_of_deriv_neg`). `ghCDF_strictMono`, `ghTail_strictAnti`,
`X_strictAnti`, `Y_strictMono`, `frontier_antitone_discharged` (X strictly down + Y strictly up as u
rises = the AMM frontier, matches GH_MATH.md). **What stays carried after this: ONLY the Bessel-K
normalizer VALUE M=K_ν ratio** — and it is NOT needed for any monotonicity/structural claim (only
0<Nx, 0<NyM enter). **AUDIT PASS:** token-clean (one `simp +decide` = kernel decide, allowed), all
9 signatures character-identical, `#print axioms` over 5 named targets ⊆ standard three, 5 canonical
modules byte-identical, pins intact. **1 mechanical signature EMEND (allowed, no math):** `ghKernel`
marked `noncomputable` (required for `Real.sqrt`); `ghKernel_pos` body `positivity`→`unfold; positivity`.

### MERTON-RUN escalations / flags (do not over-promote):
1. **σ-KNOB RECOMMENDATION (operator decision — flag, do NOT decide).** The Gaussian-slice relation
   `γ(γ+1)=2r/σ²` is now formally GROUNDED (`merton_vieta_prod`), AND the GH curvature `ψ''(0)=
   δα²/(α²−β²)^{3/2}` is grounded. BUT `γ(γ+1)=2r/σ²` is strictly the GAUSSIAN slice; the engine-pinned
   GH (α=γ+1,β=1,δ=0.08) does NOT obey it exactly (numeric: σ_eff² varies 0.042→0.017 over γ=1.5→4;
   the put-root ψ(−γ) sets r via the free drift m, not a clean γ(γ+1)σ²/2). RECOMMEND: σ as the
   theory-/trader-native primary knob with γ,S* derived and δ fixed — but ship the GH σ→γ map (full
   exponent), NOT the Gaussian closed form, behind any slider. The UI-knob LABEL is the operator's call.
2. **GH asymmetry finding (faithfulness-relevant):** with β=1 the GH curve natively carries ONLY the
   put eigenfunction S^(−γ); the symmetric call root γ+1 leaves the analyticity strip. The clean
   two-root Merton symmetry (sum=1 ⇒ r=q) is a Gaussian-limit property, not a GH identity. Relevant to
   the |Γ|≤1-exact / |Γ|>1-approx scope (consistent with it; not a new decision).
3. Carried fields are honestly the distributional/Bessel-K layer; the algebraic + curvature + limit
   content is grounded. B1/κ untouched; no settlement-semantics or economic-object question surfaced.

---

_Maintained by research-lead. Updated AFTER each obligation. Raw prover/poll output stays in the
agent context; this is the distilled durable record. Archives saved under
`formal/aristotle_runs/<obligation_id>/`._

**Auth:** `ARISTOTLE_API_KEY` reads bare (length 49, starts `a…`) — passed VERBATIM (no `<>` strip).
Auth confirmed by a live `submit` + `list` round-trip 2026-06-08. Host `aristotle.harmonic.fun`
UNBLOCKED.

**Verdict labels:** `proved (trusted-from-prover)` · `counterexample` · `still-open` ·
`candidate-fails-audit`. "trusted-from-prover" = Aristotle compiled server-side AND passed the
zero-cost artifact audit (clean tokens, axioms ⊆ propext/Classical.choice/Quot.sound, no out-of-scope
diff, math re-derived). Manager may upgrade to "verified" by building canonically.

---

## RUN 4 — 2026-06-09 (operator-greenlit: UNIFY2 — REPLACE the tautological scaffold with REAL theorems)

_Build-authorized push toward 100%. Goal: replace RUN-3 UNIFY's trivial A1 (`Ψ''=Ψ''`), A2
(`f⁻¹·f=1`), A3 (`k·eˣ=k·eˣ`), B2 (`R·0=0`), C1 (`g·w=g·w`) with genuine content over the REAL GH
cumulant generating function (Mathlib `cgf`/`mgf`) and the actual GH kernel/boost/Bregman/Fisher.
Plus Tier-2 frontier (Kähler, Courant) and the standing C3 reflection axiom. SCRATCH ONLY:
`formal/aristotle_runs/{UNIFY2,C3_reflection,Kahler,Courant}/`; canonical tree UNTOUCHED._

**Submission map:**
| Item | Project ID | Verdict |
|---|---|---|
| Stage-0 probe (Mathlib GH capability) | 0f0a8f0a-d51e-46e0-831c-d51d7cd8848b | proved (trusted-from-prover) — capability finding delivered |
| UNIFY2 main (de-trivialize A1–C1, #1/#2/#3) | fac1d6e2-d75a-44fc-be62-3126f380a900 | proved (trusted-from-prover) — TAUTOLOGY REPLACED; 2 emend flags |
| C3 reflection arrow (#7) | 303c3de0-ad34-4551-ad32-5e871ff8bd6a | proved (trusted-from-prover) — AXIOM DISCHARGED |
| Kähler compatibility (Tier-2 #4) | dae504d8-efdc-4728-884a-01ccc64c7b78 | proved (trusted-from-prover) — algebraic; integrability CONJECTURAL |
| Courant/Dirac (Tier-2 #5) | b4d4656d-3c72-46dc-a60f-0f724ea57d84 | proved (trusted-from-prover) — conservative part; all-four SPECULATIVE-NOT-ACHIEVED |

### STAGE-0 CAPABILITY FINDING (Mathlib v4.28.0, from the probe — decides grounded-vs-carried)
- **(A) Bessel-K `K_ν`: NOT in Mathlib v4.28.0** (zero declarations; no `Real.besselK`, nothing under
  `SpecialFunctions.Bessel*`). ⇒ the GH normalizing constant MUST be CARRIED as a named hypothesis.
- **(B) GH-kernel integrability:** no direct lemma; provable in ~50–100 lines by comparison
  (`exp(−αh√(δ²+v²)+βh·v) ≤ C·exp(−(αh−|βh|)|v|)`, `integrable_exp_neg_mul_sq`, `Integrable.mono`).
- **(C) density→ProbabilityMeasure: GROUNDED** — `Measure.withDensity` + `withDensity_apply` +
  `setLIntegral_univ` → 3-line `IsProbabilityMeasure`. `HasPDF` available.
- **(D) MGF/CGF + derivative=moment: GROUNDED** — `ProbabilityTheory.mgf`, `cgf`, `hasDerivAt_mgf`,
  `deriv_mgf`, `deriv_cgf` (= `(∫X·exp(tX))/mgf`), `iteratedDeriv_mgf` (n-th moment),
  `deriv_mgf_zero` (= mean). `deriv² cgf = variance` is NOT a named lemma but provable from
  `iteratedDeriv_mgf` at n=2.
- **(E) differentiate-under-∫: GROUNDED** — `hasDerivAt_integral_of_dominated_loc_of_deriv_le`,
  `hasDerivAt_integral_pow_mul_exp_real`.
- **NET:** GH-as-exp-family is GROUNDABLE for the exp-family/cgf identities (Λ'=mean, Λ''=Var=Fisher,
  convexity, Bregman) over the REAL integral-defined cgf; the GH-SPECIFIC integrability + Bessel-K
  normalization stay CARRIED named hypotheses. This validated the UNIFY2 design (names confirmed:
  `cgf`/`mgf`/`integrableExpSet`/`deriv_cgf` all exist with the signatures UNIFY2 uses).
  Both probe theorems (`ghKernel_pos`, `ghKernel_measurable`) proved clean (axioms ⊆ standard three).

### UNIFY2 (TIER-1 #1/#2/#3) — the TAUTOLOGICAL SCAFFOLD is REPLACED with REAL theorems
**All 10 targets PROVED (trusted-from-prover); audit PASSED.** This REPLACES the RUN-3 trivialities:
- **A1 (was `Ψ''=Ψ''`) → `cgf_deriv_mean_and_variance`:** `HasDerivAt (cgf X μ) ((∫X·exp(tX))/mgf) t`
  — the REAL derivative of the actual Mathlib cumulant generating function = the tilted mean. GROUNDED.
- **A4 (was abstract `0≤R·z²`) → `cgf_convexOn`:** `ConvexOn ℝ (interior (integrableExpSet X μ)) (cgf X μ)`,
  proved via `iteratedDeriv_two_cgf_eq_integral` showing `cgf'' = ∫(X−mean)²·exp/mgf ≥ 0`. REAL
  variance-nonneg / Fisher-PSD over the integral cgf. GROUNDED.
- **A2 (was `f⁻¹·f=1`) / A3 (was `k·eˣ=k·eˣ`) → `mgf_pos` + `ghKernel_logderiv` + `ghKernel_exponent_le`:**
  real `0<mgf` (`ProbabilityTheory.mgf_pos`), real `HasDerivAt` of the GH log-exponent
  (`βh−αh·v/√(δ²+v²)`), and the REAL integrability bound `−αh√(δ²+v²)+βh·v ≤ −(αh−|βh|)·|v|`
  (via `Real.abs_le_sqrt`). GROUNDED.
- **B2 (was `R·0=0`) → `deg2_score_centered`:** `deriv (cgf X μ) s = (∫X·exp(sX))/mgf` — the REAL
  mean-of-tilt / score-centering identity, NOT `R·0=0`. GROUNDED.
- **C1 (was `g·w=g·w`) → `boost_is_hamiltonian`:** real `HasDerivAt (½gs²) (g·s)` — the energy
  differential IS the metric contraction. GROUNDED. (The KÄHLER upgrade is the separate Kähler run.)
- **B1 deg1 (`deg1_bregman_grad`/`deg1_vanishes_at_operating_tilt`):** real `deriv D_Λ = (s−s₀)Λ''`,
  vanishing at the operating tilt. GROUNDED. **#3 (GENERIC degeneracies over real boost/KL/Fisher)
  is folded here** — deg1 over the real Bregman of the cgf, deg2 over the real mgf-weighted mean.
- **D1/D2/E1/E2:** my own hand-proofs, kept (rebase automorphism + port NECESSITY/conditional).

**WHAT IS NOW GROUNDED vs CARRIED (honest depth):**
- GROUNDED (real Lean over real objects): all the exp-family/cgf identities (`cgf'=mean`,
  `cgf''=Var=Fisher≥0`, convexity, Bregman gradient, score-centering, mgf positivity) over the
  ACTUAL Mathlib integral-defined `cgf`/`mgf`; the GH kernel positivity/measurability/log-derivative/
  integrability-bound over the ACTUAL GH kernel. Independently re-derived numerically (γ=3, αh=4,
  δ=0.08): `cgf'=mean` and `cgf''=var≥0` confirmed at t∈{0,0.3,−0.5}.
- CARRIED [named]: the GH-SPECIFIC **finite-MGF / integrability finiteness on the strip** and the
  **Bessel-K normalizing constant** (`∫f=1`) — Mathlib v4.28.0 has NO Bessel-K (Stage-0). The Lean
  exposes the integrability BOUND (the GH content) rather than asserting `∫=1`; the actual finiteness/
  normalization is the carried GH-measure fact. So UNIFY2 is GROUNDED for the exp-family structure and
  CARRIED for the GH normalization — a genuine theorem, not a tautology, not fully GH-closed.

**AUDIT:** token-clean (1 grep hit = comment); out-of-scope (`RequestProject.lean`/lakefile/toolchain)
BYTE-IDENTICAL; all theorem+def signatures CHARACTER-IDENTICAL submit-vs-return; `#print axioms` ⊆
{propext,Classical.choice,Quot.sound} for ALL 10 (per ARISTOTLE_SUMMARY, no `native_decide`/`sorryAx`);
NO COULD-NOT-CLOSE; NO statement weakening; math re-derived. ONE allowed proof-only emend
(`sNorm_rebase_invariant` tactic fixed for 4.28.0 — statement unchanged).
**TWO EMENDATION FLAGS (fragile search tactics left in source; compiled server-side, harden on
canonical build — NOT audit failures):** A4 (`cgf_convexOn`) line 93 leaves `exact?` (the
`integrableExpSet` convexity lemma — likely `ProbabilityTheory.convex_integrableExpSet`); line 99
leaves `grind +suggestions` (cgf analyticity on the interior). Manager: replace both with the
concrete lemmas before a canonical build. NOT upgraded to "verified." archive: UNIFY2/.

### C3 — reflection arrow DISCHARGED (the standing AXIOM is now a THEOREM)
`reflection_arrow : markPut θ s = markCall θ (θ²/s)` and the symmetric corollary PROVED over the
spec's mark definitions (`markCall θ s = if s<θ then s/θ else 1`, `markPut` dual, `reflect θ s=θ²/s`).
Crux `θ²/s < θ ↔ θ < s` via `div_lt_iff₀`; `split_ifs`+`linarith`/`grind`. `reflect_involution`,
`reflect_fixes_atm` also proved. Audit: token-clean (3 grep hits = COMMENTS), out-of-scope
byte-identical, signatures character-identical, axioms ⊆ {propext,Classical.choice,Quot.sound} (no
`native_decide`; `+decide` is kernel decide). ONE allowed emend: `/-- -/`→`/- -/` docstring delimiter
(comment-only). **HONEST CAVEAT:** discharges the arrow GIVEN the modeling identification "put wing =
reflected call wing" — which is now ITSELF a proved algebraic identity over the mark defs, not an
assumption. C3 no-arb no longer rests on an axiom (modulo the spec's mark = the engine's barrier).
archive: formal/aristotle_runs/C3_reflection/.

### Kähler (Tier-2 #4) — algebraic compatibility GROUNDED; integrability CONJECTURAL
**LOAD-BEARING FINDING:** the GH interior is 1-REAL-DIMENSIONAL (rapidity s) → NO complex structure
(J²=−1 needs even real dim). "GH Hessian interior is Kähler" is ill-posed on the 1D interior. The
well-posed object is the Hessian metric on the 2D phase space (s,p). PROVED there: `Jmat_sq` (J²=−I),
`kahler_compatibility` (G·J=−ω), `omega_skew`, `omega_nondegenerate` (det ω=1), `Gmat_posdiag`
(g>0⇒g,g⁻¹>0). This UPGRADES the RUN-3 C1 `g·w=g·w` to a real algebraic Kähler-triple compatibility.
**HONEST SCOPE:** ALGEBRAIC/pointwise compatibility only; the differential INTEGRABILITY (Nijenhuis
vanishing / dω=0 on the manifold) is NOT proved → "GH Hessian metric is Kähler" stays **CONJECTURAL**
for that analytic remainder. Audit: token-clean, out-of-scope byte-identical, sigs identical, axioms
⊆ standard three, no sign/sig adjustments (hand-derived G·J=−ω sign was correct). archive: Kahler/.

### Courant/Dirac (Tier-2 #5) — conservative part GROUNDED; all-four SPECULATIVE-NOT-ACHIEVED
PROVED: `courantPairing_symm`, `graph_isotropic` (graph of ω is isotropic for the Courant pairing —
skew ω ⇒ cross-terms cancel), `omega_skew`, `graph_injective` (maximality witness). So the symplectic
structure IS a linear Dirac structure (a single TM⊕T*M object) — GROUNDED. **EXPLICITLY NOT ACHIEVED
(reported, NOT asserted):** folding the dissipation R AND the port into the SAME Courant/Dirac bracket
(Dirac = isotropic/conservative; R breaks isotropy; ports are an interface relation). The
all-four-native single bracket stays **SPECULATIVE** (Scope Lock). Audit: clean, byte-identical,
sigs identical, axioms ⊆ standard three. archive: Courant/.

---

## RUN 3 — 2026-06-09 (operator-greenlit: UNIFY — ONE metriplectic / Hessian structure)

_STAGE 0 sympy GATE run FIRST (make-or-break, before any submit). Scripts durable under
`formal/aristotle_runs/UNIFY_stage0/`. Stage 1 = one unified Lean file `UNIFY/Unify.lean` (11
theorems, 5 obligation blocks A–E). Submit-project = throwaway minimal Mathlib project with canonical
v4.28.0 pins. Canonical `formal/temporal_lean_verified/` tree NOT touched._

### STAGE 0 VERDICT — **GATE PASSED** (all three; headline)
- **(0.1) M = Fisher — HOLDS, in the correct coordinate.** The dissipation metric (reserve-response /
  slope-deviation 2nd-order form of the GH family) EQUALS the Fisher metric ∇²μ of the GH exponential
  family — but ONLY in the **natural / centered-rapidity coordinate** `s = v = u−μ`, where
  `dMean/dNatural = Var = Ψ″` (verified numerically to ~1e-14, γ=3, αh=4, δ=0.08). HONEST CAVEAT:
  in the **raw log-price rapidity u**, the dissipation curvature is just the exponential price
  `g(u)=e^u`, which is **NOT** Fisher (Var varies 0.134→0.290 while e^u is exp) — they are different
  functions. So "M=Fisher" is a coordinate-correct (Scope-Lock-1 sNorm/centered) statement, the
  **STANDARD exponential-family / Bregman-divergence AMM identity** applied to GH, NOT a raw-(x,y) or
  raw-u identity. The same convex Ψ generates (a) Esscher/price = gradient side, (b) the Legendre dual
  (symplectic) pair `V″=1/Ψ″`, (c) the dissipation Hessian Ψ″=Fisher. Single-potential unity holds.
- **(0.2) GENERIC degeneracies — HOLD.** deg1 `J·∇S=0`: `d/ds KL_Bregman(s₀‖s) = (s−s₀)Ψ″(s)`,
  which vanishes at the operating tilt `s=s₀` (non-vacuous away from it). deg2 `M·∇E=0`: Fisher
  annihilates the conserved-charge/constant direction (score centered, `E[v]·1` covariance = 0).
- **(0.3) Rebase-covariance — HOLDS.** The Fisher/dissipation metric in the gauge-invariant sNorm is
  rebase-invariant (boost u→u+log r cancelled by P→P/r; sNorm fixed). Corroborates PH-6 at metric level.

### STAGE 1 — UNIFY/Unify.lean (project ID a2b3003a-985f-496b-910c-21af96cdeecd) — **proved (trusted-from-prover)**
11/11 theorems proved server-side (Lean 4.28.0 / Mathlib v4.28.0). AUDIT PASSED:
- token-scan (`grep -rnE sorry|admit|native_decide|sorryAx|opaque|unsafe|\baxiom\b` on returned
  `RequestProject/`): **NO forbidden-token hits** (summary .md prose mentions don't count);
- `#print axioms` per ARISTOTLE_SUMMARY ⊆ {propext, Classical.choice, Quot.sound} for ALL 11;
- out-of-scope files (`RequestProject.lean`, `lakefile.toml`, `lean-toolchain`) **byte-identical** to
  submitted; toolchain pin v4.28.0 unchanged;
- all **theorem signature lines character-identical** submit-vs-return (verified by diff); only
  `sorry`→proof-body changes. ONE mechanical note (allowed emend, no math): the B1 docstring delimiter
  `/-- … -/` became a plain block comment `/- … -/` (the prover reformatted the inline-`-/` comment) —
  comment/formatting only, statement untouched. Trailing-newline removed (cosmetic).
- math re-derived: B1 `d/ds KL=(s−s₀)Ψ″→0 at s=s₀` (non-vacuous, sympy-confirmed); A1 correctly
  encodes mean=grad/Fisher=Hess (the `dm/ds=Var` numeric content carried by the Stage-0 gate).

**Per-block honest scope (over-promotion guard):**
| Block | Theorems | What it proves | Provenance label |
|---|---|---|---|
| A (single-potential unity, M=Fisher) | A1–A4 | mean=Ψ′, Fisher=Ψ″, dual `V″=1/Ψ″`, price=k·e^(u−μ)>0, Fisher PSD | **STANDARD** (exp-family/Bregman); A1 is the *structural* mean=grad/Fisher=Hess layer — the GH integral `dm/ds=Var` is the Stage-0 sympy gate, NOT re-proved in Lean |
| B (GENERIC degeneracies) | B1–B2 | deg1 `d/ds KL=0` at operating tilt (real `HasDerivAt` proof); deg2 `R·0=0` (structural encoding of score-centered) | **STANDARD**; B2 is a minimal/structural encoding (weight is in the score-centered modeling choice, proof is `mul_zero`) |
| C (boost = Kähler-ω flow) | C1 | `ω(∂,·)=dH(·)` Hessian-pairing form (symplectic IS Kähler-ω of ∇²Ψ) | boost-is-Hamiltonian-flow = STANDARD; the Hessian-interior-is-**KÄHLER** (integrability) claim = **CONJECTURAL** — NOT asserted/proved, only the ω-relation encoded |
| D (rebase automorphism) | D1–D2 | sNorm rebase-invariant; any F(sNorm) rebase-invariant (metric ω AND port as one) | **STANDARD/GROUNDED** (reuses PH-6 sNorm gauge) |
| E (Dirac/PH port interface) | E1–E2 | port NECESSARY (no reserve floor, PH-4b shape); port CONDITIONAL solvency (B1 shape, coverage carried) | **NECESSITY only**, NEVER sufficiency; solvency stays EXTRINSIC (B1/operator ship-gate) |

**EXPLICITLY NOT CLAIMED (SPECULATIVE, per Scope Lock 3):** a single Courant/double-bracket object
making ALL FOUR (J, R, port, metric) native in ONE bracket. NOT asserted achieved. Encoded as separate
blocks, not one bracket.

**RUN-3 escalations / flags for manager (do not over-promote):**
1. **M=Fisher is coordinate-conditional** — it is the Bregman/exp-family identity in the centered
   coordinate, NOT a raw-u identity (raw-u dissipation curvature = e^u ≠ Fisher). State as
   "Hessian/Fisher unity in the gauge coordinate," not "M=Fisher everywhere."
2. **Kähler is CONJECTURAL** — Block C proves the symplectic=Kähler-ω *relation* for the Hessian
   metric, NOT that the GH Hessian interior satisfies the Kähler integrability condition. Do not report
   the interior as "proven Kähler."
3. **A1/B2 are structural encodings** — A1 captures mean=grad/Fisher=Hess definitionally (the GH
   integral content is the Stage-0 sympy gate); B2 is `mul_zero` (the content is the score-centered
   modeling choice). Honest: the Lean carries the *structure*; the GH-specific numerics are the gate.
4. **Port/solvency unchanged** — E proves NECESSITY only; B1 real floor stays operator ship-gate.
   Courant/single-bracket stays SPECULATIVE. GHJ economic-object finding (latent group, not X·Y)
   carried, not reopened. C3 reflection axiom untouched. No SDE introduced.

archive: formal/aristotle_runs/UNIFY/ · prompt: formal/prompts/aristotle_prompt_unify.md ·
stage-0 scripts: formal/aristotle_runs/UNIFY_stage0/

---

## RUN 2 — 2026-06-09 (operator-greenlit: CTPH cleanup/strengthen + GH-grounding push)

_All RUN-2 obligations are STANDALONE files under `formal/aristotle_runs/<name>_*/` that IMPORT the
canonical modules; the canonical `formal/temporal_lean_verified/` tree was NOT modified (manager owns
a separate local-build there). Submit-projects = throwaway copies of the canonical project + one new
.lean. Every canonical module (Temporal/AMMCurve/Seam/Audit/Main) confirmed BYTE-IDENTICAL in all 5
returned archives. Toolchain pin v4.28.0 unchanged everywhere._

**RUN-2 submission map (project IDs):**
| Obligation | Project ID | Verdict |
|---|---|---|
| CTPH_clean (Track 1) | a33560b3-0a60-4d53-8284-c9961ed75972 | proved (trusted-from-prover) |
| GHJ_grounded (Track 2) | 1c0f0a46-f969-44e2-b3fd-35c919427891 | proved (trusted-from-prover) — WATCH-FLAG finding below |
| GHcoercive_grounded (Track 2) | 02c2e575-95a1-4f98-a8d0-90448a7546c5 | proved (trusted-from-prover) — PARTIAL grounding |
| PH4b_grounded (Track 2) | f19b24c7-9b65-4e79-b40d-c5c5d68d016e | proved (trusted-from-prover) — PARTIAL grounding |
| PH3_grounded (Track 2) | 9c66598c-cd09-47ef-9473-d367c3b90ce8 | proved (trusted-from-prover) |

**RUN-2 SUMMARY:** 5/5 audit-passed (token-clean: no sorry/admit/native_decide/sorryAx/opaque/unsafe/
real-axiom — three grep hits were COMMENTS only; axioms ⊆ {propext,Classical.choice,Quot.sound} per
each ARISTOTLE_SUMMARY; submitted-vs-returned signatures character-identical; canonical modules
byte-identical; math independently re-derived in sympy/python). NONE upgraded to "verified."

### Track 1 — CTPH (archive: formal/aristotle_runs/CTPH_clean/)
- **CTPH IS CLEAN NOW.** The prior fragility flag is RESOLVED: `ct_dissipation_ineq` uses the concrete
  term `skew_quadForm_zero hJ z` (no `exact?`/search tactic anywhere in source). The dissipation
  inequality `dH/dt = uᵀy − zᵀRz ≤ uᵀy` (skew-J vanishes via `skew_quadForm_zero`; −zᵀRz ≤ 0 via
  `psd_quadForm_nonneg`, R PSD; deterministic, NO SDE/Itô) compiles clean.
- **STRENGTHENED discrete↔continuous link (replaces the near-vacuous existential):** the new
  `sampled_dissip_nonneg` / `sampled_increment` / `sampled_passivity` are a TIGHT, non-vacuous
  forward-Euler correspondence. We construct the sampled storage `Hs N = H0 + Σ(supplied−dissipated)`
  with per-tick `supplied = Δt·uᵀy`, `dissipated = Δt·zᵀRz`, and PROVE (a) `dissipated ≥ 0` DERIVED
  from R PSD (not assumed), (b) the exact per-tick increment `ΔH = supplied − dissipated` (= Δt·(uᵀy−
  zᵀRz), the sampled continuous rate), (c) telescoped `Hs N ≤ H0 + Σ supplied` (the Riemann sum of
  the continuous bound). This genuinely ties OUR per-tick balance to the continuous inequality as its
  sampled realization.
  **HONEST SCOPE LIMIT (what is NOT provable cleanly):** the tight version does NOT instantiate the
  floor-bearing `Temporal.PassiveSystem`, because a general sampled trajectory has NO storage FLOOR
  (that is B1, external — fabricating one with a `sorry` would fail audit). So the link is stated on
  the sampled storage directly, NOT as "the engine's unique system." It is the dissipation/balance/
  telescoping content, which IS the honest tight statement. The B1 floor stays the operator ship-gate.

### Track 2 — GH-grounding push
**GHJ_grounded (formal/aristotle_runs/GHJ_grounded/) — ⚠ ECONOMIC-OBJECT FINDING (ESCALATE):**
GH conserves **NO clean nontrivial ALGEBRAIC product invariant** analogous to CPMM's X·Y. Verified
numerically (γ=3 GH densities): X·Y varies by orders of magnitude along the frontier (5e-9 at u=−3,
peaks 0.19 at u=0, 1e-4 at u=3) — there is no X·Y=const. Per the guardrail I did NOT fabricate or
weaken a statement to manufacture one. What GH DOES conserve, now DERIVED from the closed-form
densities (not asserted): (i) the EXACT Esscher tilt `f_{β+1}(v) = e^v·f_β(v)` (`esscher_core`,
cross-checked exact in sympy), (ii) the density ratio `f_{β+1}/f_β = (Cβ1/Cβ)·e^v` (`density_ratio`),
(iii) the GH slope law `slope = (Ny·M/Nx)·(Cβ1/Cβ)·e^(u−μ)` = engine's `getMP_raw·e^(−μ)`
(`gh_slope_law`), (iv) trade = latent translation `u↦u+δ` scaling the slope by `e^δ`
(`slope_translation`) — the genuine one-parameter group / skew-J structure. **Bottom line: the
conserved object is the latent one-parameter group + Esscher tilt, NOT an algebraic X·Y-type
constant.** This is a settlement-/economic-object characterization the manager should relay to the
operator: the "GH invariant" is a group/parametrization invariant, not a product invariant. Not a
failure — but do NOT let it be reported as "GH conserves an X·Y-analogue."

**GHcoercive_grounded (formal/aristotle_runs/GHcoercive_grounded/) — PARTIAL grounding:**
`X∈(0,Nx)`, `Y∈(0,Ny·M)`, and frontier `y≥0` are now DERIVED from `0<T<1` (T a tail probability) and
`0<C<1` (C a CDF), with Nx,Ny,M>0 — instead of the prior opaque `hy:∀x,0≤y x` hypothesis. The gate
field `gh_coercive` has the GH form `Ny·M·Ccdf` with nonnegativity DERIVED from the CDF structure.
**SCOPE (honest):** the structural facts `0<T<1`/`0<C<1` (that the GH tail/CDF lie in (0,1)) are still
CARRIED as hypotheses — they are the defining properties of a probability tail/CDF (the GH content),
NOT the actual GH special-function tables formalized. So this is grounded-via-structural-property:
real improvement over carrying `0≤y`, but proving the GH density's tail IS in (0,1) from the Bessel/
hyperbolic closed form remains the bigger OPEN lift. Full GH `AMMCurve` instance (antitone_y/convex_y
from GH special functions) still OPEN.

**PH4b_grounded (formal/aristotle_runs/PH4b_grounded/) — PARTIAL grounding:**
GH poolValue bounded ABOVE is now DERIVED: `Nx·T + Ny·M·C ≤ Nx + Ny·M` from `T<1`,`C<1`
(`gh_value_boundedAbove`) — the bounded-reserve closed form, replacing the asserted `∃B,V≤B`. Fed into
`gh_no_floor`/`gh_no_floor_grounded`: bounded-above reserves + unbounded obligation ⇒ no intrinsic
floor (funding port NECESSARY). Same structural-hypothesis caveat as GHcoercive (T<1/C<1 carried).
**Necessary-not-sufficient PRESERVED:** proves no reserve floor, NOT that funding covers the deficit
(B1 stays open/external).

**PH3_grounded (formal/aristotle_runs/PH3_grounded/) — GROUNDED (curve closed-form):**
The GH arb-leak ≥ 0 is DERIVED from the engine's actual GH slope law `g(u)=k·e^(u−μ)` (k=Ny·M/Nx),
NOT an abstract PSD matrix. `ghSlope_strictMono` (the short-gamma/convexity property, from the closed
form) ⇒ `gh_arbLeak_density_nonneg` (g(u₂)−g(u)≥0 for u≤u₂) ⇒ `gh_arbLeak_nonneg`
(`∫_{u₁}^{u₂}(g(u₂)−g(u))du ≥ 0`, the LVR-one-way dissipation). Math re-derived (integral closed form
g(u₂)(u₂−u₁)−(g(u₂)−g(u₁)) ≥ 0). **Necessary-not-sufficient PRESERVED:** does NOT close solvency/B1.

**RUN-2 escalations for the manager (do not over-promote):**
1. **GH economic-object finding (relay to operator):** GH's conserved object is the latent
   one-parameter group + Esscher tilt, NOT an X·Y-style algebraic invariant. Characterization, not a
   bug; but the "GH invariant" must be labelled as a group/parametrization invariant.
2. **GH-grounding is PARTIAL where noted:** GHcoercive/PH4b still carry the GH tail/CDF-in-(0,1)
   structural facts as hypotheses (the actual GH special-function tables are not formalized). PH3 and
   GHJ are grounded in the actual closed forms (slope law / densities). The full GH `AMMCurve` instance
   (antitone_y/convex_y from the GH special functions) remains the big OPEN lift.
3. **B1 unchanged:** real solvency floor stays external/operator ship-gate; CTPH's tight link
   deliberately does NOT claim a floor. C3 reflection still an axiom (untouched). No SDE introduced.

---

**RUN SUMMARY (2026-06-08, COMPLETE):** 14 obligations submitted, spanning Tiers 1-4 + extras.
**ALL 14 audited → ALL proved (trusted-from-prover).** ZERO counterexamples, ZERO candidate-fails-audit,
ZERO still-open. GH-J WATCH-FLAG **not tripped** (GH conserves a clean invariant — latent one-parameter
group). Every candidate: token-clean (no sorry/admit/native_decide/sorryAx/opaque/unsafe/real-axiom),
axioms ⊆ {propext, Classical.choice, Quot.sound}, imported modules byte-identical, pin v4.28.0 unchanged,
math independently re-derived. All "trusted-from-prover" — NONE upgraded to "verified" (manager's
canonical-build label).
**Three flags for the manager/operator (do not over-promote):**
1. **CTPH emendation flag** — `ct_dissipation_ineq` left `exact?` (a search tactic) in source; compiled
   server-side but fragile. Proposed mechanical no-math fix (`exact skew_quadForm_zero hJ z`) saved at
   `formal/aristotle_runs/CTPH/CTPH_emended_PROPOSED.lean` — NOT locally re-verified; manager apply+build.
2. **C2 scope caveat** — collarSurplus MODELLED (θ·((1−w)/w−1)); engine's exact closed form not in
   accessible specs. Proven content = the symmetry-iff. Confirm closed form before literal-invariant claim.
3. **B1 / PH-3 / PH-4b necessary-not-sufficient** — these do NOT close real solvency; the κ-coverage
   (does GH funding cover the deficit) stays EXTRINSIC = operator ship-gate. B1 proves only the conditional.

## Submission map (project IDs)
| Obligation | Project ID | Submitted | Status |
|---|---|---|---|
| R3 mpGeom pin (T1) | ba84270a-cfb9-4c87-99e7-ccd66ee4d482 | 2026-06-08 | proved (trusted-from-prover) |
| R1 PH-5 C¹ both wings (T1) | e05ff5b5-e794-4ec9-97f9-6e204f8af1e2 | 2026-06-08 | proved (trusted-from-prover) |
| R2 crossover-at-K (T2) | f9faee69-2154-4389-9b0c-79e290cfb606 | 2026-06-08 | proved (trusted-from-prover) |
| GH-J invariant/skew-J (T2) | 5d64284d-dadc-4c87-a236-50109c1c92df | 2026-06-08 | proved (trusted-from-prover) |
| GH coercive (T2) | 8f55b116-1741-476f-be23-3da1a9c8f746 | 2026-06-08 | proved (trusted-from-prover) |
| R4 orientation (T3) | 3674c141-60da-4951-bd5d-2003dfa774c9 | 2026-06-08 | proved (trusted-from-prover) |
| PH-3 R⪰0 PSD (T3) | 1856bfb7-c409-439c-8068-941ddef9cb3f | 2026-06-08 | proved (trusted-from-prover) |
| CTPH continuous bridge (T4) | c5ba7851-07ba-4461-8274-0f3993625907 | 2026-06-08 | proved (trusted-from-prover) |
| PH-6 rebase J,R (T4) | 013d105b-0c10-4fad-8bf7-6a2e3e02e228 | 2026-06-08 | proved (trusted-from-prover) |
| C1 composite-ray ITM (T4) | 51216401-0139-4bbb-b569-6c14edcb28d0 | 2026-06-08 | proved (trusted-from-prover) |
| C2 collar w=½ (T4) | 87a2150f-f5ed-4700-ba92-20ed9eeee5eb | 2026-06-08 | proved (trusted-from-prover) |
| R5 %-slippage basis-indep (T4) | 0b69e494-7a87-4e89-b244-302dae1fa7bf | 2026-06-08 | proved (trusted-from-prover) |
| PH-4b no-floor GH-analogue (T4 extra) | 20c5a137-ed04-448d-b890-4ea7e3529a1c | 2026-06-08 | proved (trusted-from-prover) |
| B1 conditional structure (extra) | d772317b-508a-4b2c-8cfd-85a71cc82e7d | 2026-06-08 | proved (trusted-from-prover) |

## Verdicts
| Obligation | One-line statement | Verdict | Axioms | Audit note | Archive |
|---|---|---|---|---|---|
| GH coercive | bounded reserves (dom⊆Ioi0, y≥0) ⇒ {p·x+y(x)} BddBelow (lb 0) = AMMCurve.coercive gate field for GH | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; AMMCurve/Temporal/Seam byte-identical; pin v4.28.0; math re-derived (p·x≥0 + y≥0 ⇒ sum≥0); statement = real gate field, unweakened | formal/aristotle_runs/GHcoercive/ |
| R3 mpGeom pin | mpGeom=R·e^(−μ); R/mpGeom=e^μ; mpGeom>0 (R>0) — pins price-coord vs slope | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; only R3.lean; pin v4.28.0; math re-derived (R/(R·e^−μ)=e^μ); intended e^μ pin | formal/aristotle_runs/R3/ |
| PH-3 R⪰0 PSD | R·v²≥0 (R≥0) scalar; vᵀRv≥0 for PSD R (Matrix.PosSemidef) | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; only PH3.lean; pin v4.28.0; quadForm = Mathlib PSD condition, intended vᵀRv≥0, unweakened. CAVEAT: NECESSARY-not-sufficient — does NOT close solvency/B1 | formal/aristotle_runs/PH3/ |
| R2 crossover-at-K | sNorm reg ⇒ crossover S=K ∀γ; ratio reg ⇒ o0^((γ+1)/γ)K^(−1/γ) (=o0²/K at γ=1); =K iff o0=K (neg control) | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; only R2.lean; pin v4.28.0; all 4 statements re-derived & intended (rpow injectivity for S=K; closed form; γ=1 drift; iff-degenerate control) | formal/aristotle_runs/R2/ |
| GH-J skew-J | GH trade=latent shift u↦u+δ: group law (shift_zero/shift_add), mp scales e^δ (mp_boost), faithful (mp_strictMono), stays on frontier (frontier_preserved) | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; only GHJ.lean; pin v4.28.0. WATCH-FLAG **NOT tripped** — GH conserves a clean invariant (the latent one-parameter group / parametrization, NOT X·Y); genuine skew-J content in shift_add+mp_boost+mp_strictMono. SCOPE NOTE: frontier_preserved is true-but-near-tautological (⟨u+δ,rfl⟩) — the group lemmas carry the weight; not a weakening (= the statement I intended) | formal/aristotle_runs/GHJ/ |
| R1 PH-5 C¹ both wings | call: a·S^(−γ) vs 1−S/K at S*_A=Kγ/(γ+1), val 1/(γ+1), slope −1/K; put: b·S^γ vs 1−K/S at S*_B=K(γ+1)/γ, val 1/(γ+1), slope γ²/(K(γ+1)²); value+slope match both wings | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; only R1.lean; pin v4.28.0; coeffs/boundaries UNALTERED (SUMMARY confirms); all 4 matches independently re-derived in sympy; HasDerivAt rpow proofs; θ=sNorm(K) registration (K-anchored coeffs). The load-bearing PH-5 result | formal/aristotle_runs/R1/ |
| R4 orientation | CALL mark sNorm/θ ↗ (slope 1/θ>0, stamp +2); PUT mark θ/sNorm ↘ (slope −θ/sNorm²<0, stamp −2); wing signs opposite | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; only R4.lean; pin v4.28.0; signs re-derived; funding kept price-measure (not re-expressed in sNorm) per caveat; all 5 intended | formal/aristotle_runs/R4/ |
| C1 composite-ray ITM | m(θ*)·2sinh(δ)=m(lo)−m(hi), θ*=√(lo·hi), δ=½log(hi/lo), m=C/θ; form-invariant under effective-strike substitution (ITM) | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; only C1.lean; pin v4.28.0; identity re-derived in sympy; sinh_log proof; ITM = universal over effective strikes | formal/aristotle_runs/C1/ |
| C2 collar w=½ (I7) | (1−w)/w=1 ↔ w=½; (∀θ>0, collarSurplus θ w=0) ↔ w=½ | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; only C2.lean; pin v4.28.0. SCOPE CAVEAT: collarSurplus MODELLED as θ·((1−w)/w−1) (documented structural form; engine's exact closed form NOT in accessible specs). Proven content = the symmetry-iff at the anchor coord; do NOT over-promote as the engine's exact surplus formula until manager confirms closed form | formal/aristotle_runs/C2/ |
| PH-6 rebase J,R | sNorm degree-0 (reuse); rebase commutes with boost on mp=(P/r)e^u (J preserved); slope-dev quad form R·v² rebase-invariant (R preserved) | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; PH6.lean + imported AMMCurve/Temporal/Seam BYTE-IDENTICAL; pin v4.28.0; all 3 re-derived; reuses Barrier.sNorm_rebase_invariant | formal/aristotle_runs/PH6/ |
| PH-4b no-floor GH-analogue | V bounded above + O unbounded above ⇒ ¬BddBelow(V−O) on Ioi0; sanity 1−p unbounded below | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; only PH4b.lean; pin v4.28.0; math re-derived (threshold contradiction). CAVEAT: port NECESSARY not sufficient — proves no reserve floor, NOT that funding covers deficit (B1 stays open/extrinsic) | formal/aristotle_runs/PH4b/ |
| R5 %-slippage basis-indep | (mpGeom R_post μ)/(mpGeom R_pre μ)=R_post/R_pre (e^−μ cancels); mpGeom R μ=R ↔ μ=0 ($-basis carries factor) | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; only R5.lean; pin v4.28.0; math re-derived (e^−μ cancels in % ratio, carried in $); corollary of R3 | formal/aristotle_runs/R5/ |
| B1 conditional structure | (∀s, floor−V s ≤ support s) → solvent; coverage ⇔ solvency. Coverage is a CARRIED hypothesis (never discharged) | **proved (trusted-from-prover)** | propext, Classical.choice, Quot.sound | token-clean; only B1.lean; pin v4.28.0. NO fabricated floor — coverage stays a `→` premise; this is the κ-EXTRINSIC LIMIT as a theorem (geometry can't supply coverage; PH-4b shows no reserve floor). Does NOT close real solvency — that stays the operator's ship-gate | formal/aristotle_runs/B1/ |
| CTPH continuous-time PH bridge (Q1) | skew_quadForm_zero (zᵀJz=0, J skew); ct_dissipation_ineq (dH/dt=uᵀy−zᵀRz ≤ uᵀy, R PSD); discrete_is_sampled (∃ PassiveSystem, passivity fires = discrete is sampled continuous) | **proved (trusted-from-prover)** — see EMENDATION FLAG | propext, Classical.choice, Quot.sound | no sorry/admit/native_decide/sorryAx/opaque/unsafe/real-axiom; Temporal/AMMCurve/Seam BYTE-IDENTICAL; pin v4.28.0; NO SDE/Itô (deterministic only ✓); all 3 statements re-derived & intended. **EMENDATION FLAG:** ct_dissipation_ineq's `hJ_zero` sub-proof uses `exact?` (a SEARCH tactic) left in source — Aristotle's server build resolved it (so it compiled), but `exact?` in committed source is FRAGILE. Mechanical no-math fix: replace `exact?` → `exact skew_quadForm_zero hJ z` (the lemma proved just above, same hyps). I could NOT locally re-verify the swap (no local toolchain). MANAGER: apply the one-line swap and confirm on the canonical build before folding. SCOPE NOTE: discrete_is_sampled is an EXISTENTIAL (a constructed sampled PassiveSystem witnesses passivity) — structural bridge, not a unique pin of the engine's system (= the statement I phrased) | formal/aristotle_runs/CTPH/ |

---

## CLOSEOUT RUN — 2026-06-09 (operator: "spam Aristotle"; collapse to true floor; SCRATCH-ONLY)
Scratch dirs `formal/aristotle_runs/CLOSEOUT_*/`; canonical `formal/temporal_lean_verified/` UNTOUCHED.
All 5 files are STANDALONE (`import Mathlib` only) → no canonical module imported → byte-identity of
canonical tree trivially preserved. IDs in `CLOSEOUT_SUBMISSION_IDS.txt`. Audit (zero-cost): token-scan
returned .lean (forbidden tokens + live search tactics), statement-line diff submit-vs-return
(character-identical sigs), math re-derived. `#print axioms` OUTPUT not embedded in archives (Aristotle
reports clean {propext,Classical.choice,Quot.sound} in each SUMMARY; canonical-env build is where it gets
independently reproduced — provenance caveat, flagged).

| Item | Statement / target | Verdict | Notes |
|---|---|---|---|
| 1 cgf_convexOn HARDEN | `ConvexOn ℝ (interior (integrableExpSet X μ)) (cgf X μ)` — replace the 2 RUN-4 search tactics with concrete lemmas | **proved (trusted-from-prover) — HOLD CLOSED** | (a) `exact?`→`convex_integrableExpSet.interior`; (b) `grind +suggestions`→`(analyticAt_cgf ht).deriv.differentiableAt`. Statement character-identical to RUN-4. Variance core unchanged (plain `aesop`, allowed). NO `exact?`/`grind`/search in returned proof. The one open UNIFY2 HOLD is now CLEAN. Caveat: cgf archive embeds no `#print axioms` cmd — axiom-cleanliness per Aristotle SUMMARY only; reproduce on canonical build. dir: CLOSEOUT_cgf/ |
| 2 GH integrability/finite-MGF DISCHARGE | T2 `Integrable exp(−c|v|)`; T3 `Integrable ghKernel`; T4 `0<∫ghKernel`; T5 `IsProbabilityMeasure ghProb`; T6 `Integrable (exp(t·v)·ghKernel)` on strip `|βh+t|<αh` | **GROUNDED — "carried" REMOVED for integrability+prob-measure+finite-MGF** | All 5 discharged from the decay bound `ghKernel_exponent_le` + Mathlib (`exp_neg_integrableOn_Ioi`, `Integrable.mono'`, `integral_pos_iff_support_of_nonneg_ae`, `ofReal_integral_eq_lintegral_ofReal`+`div_self`, `exp_add`). NO Bessel-K, NO numeric Z. ghKernel + ghKernel_exponent_le kept exactly; all sigs character-identical. Math re-derived (√(δ²+v²)≥|v| ⇒ kernel≤exp(−c|v|); tilt shifts βh↦βh+t). #print axioms present in file (clean per SUMMARY). dir: CLOSEOUT_GHmeasure/ |
| 3 frontier antitone_y/convex_y | F1b slope strictMono; F1c slope HasDerivAt; F2 frontier_antitone; F3 slope_convexOn; F3-link frontier_convex_from_monotone_deriv | **GROUNDED from slope law; CARRIED[StrictAnti X, StrictMono Y, chain hderiv/hmono]** | Slope law `g=k·e^(u−μ)` strict-mono + convex GROUNDED; frontier antitone/convex FOLLOW once the (carried, NOT discharged) monotone reserve-coordinate maps X(u),Y(u) and the chain are supplied. Concrete lemmas (`mul_lt_mul_of_pos_left`,`Real.exp_lt_exp`,`HasDerivAt.exp`,`convexOn_of_deriv2_nonneg`,`MonotoneOn.convexOn_of_deriv`). No search tactics. Carried maps = where GH tail/CDF (Bessel-K-adjacent) still bottoms out. Sigs identical. dir: CLOSEOUT_frontier/ |
| 4 Kähler integrability | K1 `omega_closed` (dω=0); K2 `nijenhuis_constant` (const-J); K3 `gh_J_integrable` (variable J(s)) | **K1,K2 GROUNDED; K3 STILL-OPEN (CONJECTURAL upgrade NOT achieved)** | K1 (`hasDerivAt_const`), K2 (`mul_zero`) clean. K3 = SINGLE named `sorry` with precise Mathlib-gap report: v4.28.0 has NO AlmostComplexStructure / NijenhuisTensor / Newlander–Nirenberg / Kähler-manifold infra → cannot even STATE variable-J integrability. NOT faked. Kähler integrability stays CONJECTURAL; needs upstream Mathlib differential-geometry. dir: CLOSEOUT_kahler/ |
| 5 Courant all-four | `courant_on_graph`; `graph_skew_isotropic`; `graph_symmetric_not_isotropic`; `dissipation_breaks_isotropy` | **PROVED OBSTRUCTION (no-go); all-four single isotropic bracket SPECULATIVE-NOT-ACHIEVED (now with a proved reason)** | Pairing on graph(A)=(Av)·w+(Aw)·v ⇒ isotropic⇔A skew. graph(J) isotropic (Dirac, recovers RUN-4). graph(J−R) with R≠0 symmetric NOT isotropic (pairing=−2(Rv)·w≠0). So NO single maximal-isotropic Dirac bracket carries dissipation R — conservative + resistive are different slots. Witnesses explicit (v=w=e₀ ⇒ −2r). Mathlib has no Courant/Leibniz-algebroid type ⇒ the non-isotropic all-four object NOT constructed. Sigs identical, no search tactics. dir: CLOSEOUT_courant/ |

---

## AIRTIGHT RUN — 2026-06-09 (operator BUILD-AUTHORIZED: settlement-as-generated + single-μ core; SCRATCH-ONLY, canonical tree UNTOUCHED)

4 submits (all standalone `import Mathlib`, throwaway project copies; canonical `formal/temporal_lean_verified/` NOT modified; all 5 canonical modules byte-identical in every returned archive). Scratch dirs `formal/aristotle_runs/AIRTIGHT_*`. Prompts `formal/prompts/aristotle_prompt_airtight_*.md`.

| ID | name | target | verdict | depth | dir |
|----|------|--------|---------|-------|-----|
| c9bd9638 | probe | Mathlib optimal-stopping CAPABILITY inventory | capability finding (token-clean #checks) | — | AIRTIGHT_probe_optstop/ |
| 3566d93c | T1a | INVERT R1: S* + coeff GENERATED as UNIQUE smooth-pasting solution, both wings | **proved (trusted-from-prover)** | GROUNDED | AIRTIGHT_T1a_invert/ |
| 794363d3 | T1b | smooth-pasting = optimal-exercise boundary (deterministic variational characterization) | **proved (trusted-from-prover)** | GENERATED (variational) + CARRIED (Snell) | AIRTIGHT_T1b_optimality/ |
| 84a6a417 | T2 | single-μ metriplectic core (ONE structure, all readings off c.μ) | **proved (trusted-from-prover)** | GROUNDED | AIRTIGHT_T2_singlecore/ |

### PROBE (c9bd9638) — Mathlib v4.28.0 optimal-stopping capability finding
EXISTS: `stoppedValue`, optional-stopping (`Submartingale.expected_stoppedValue_mono`, `Martingale.stoppedValue_ae_eq_condExp_of_le`), hitting times (`hittingBtwn`/`hittingAfter`; old `hitting` refactored away), convexity-optimality toolkit (`ConvexOn`,`StrictConvexOn`,`IsMinOn`,`IsMinOn.of_isLocalMin_of_convex_univ`,`isMinOn_iff`), `Real.rpow`/`mgf`/`cgf`. **DOES NOT EXIST**: Snell envelope, optimal-stopping value/existence, variational inequality / obstacle problem, free-boundary / smooth-pasting / smooth-fit. ⇒ the full "smooth-pasting = Snell-envelope optimal stopping time" CANNOT be GENERATED from Mathlib; the deterministic value-maximizing-boundary fragment CAN (toolkit assembly). Probe.lean token-clean.

### T1a (3566d93c) — SETTLEMENT BOUNDARY GENERATED (the leak collapse, algebraic layer). GROUNDED.
INVERTED R1: `Sstar_A_forced`/`coeffA_forced` (call) + `Sstar_B_forced`/`coeffB_forced` (put): from value-match AND slope-match at an ARBITRARY S>0 (NOT assumed = S*), DERIVE S = Kγ/(γ+1) [call] / K(γ+1)/γ [put] and a/b = the R1 coefficients. Slope-match phrased as the explicit derivative equation (call: `−γ·a·S^(−γ−1)=−1/K`; put: `γ·b·S^(γ−1)=K/S²` = intrinsic slope K/S²) WITH bridge lemmas `hasDerivAt_const_mul_rpow`/`hasDerivAt_call`/`hasDerivAt_put` proving that equation IS the `HasDerivAt` content (prompt-allowed; HasDerivAt not silently dropped). Continuation power law a·S^(−γ) = the GH exp-family value structure ⇒ boundary GENERATED FROM the value law. Audit: token-clean, **NO search tactics** (cleaner than original R1 which had `grind +suggestions`), unscoped modules byte-identical, toolchain pins intact, axioms ⊆ {propext,Classical.choice,Quot.sound}, math re-derived. coeffA/Sstar defs restated (e.g. `coeffA=(Sstar_A)^γ/(γ+1)`) = algebraically identical to R1's form, NOT a weakening.

### T1b (794363d3) — smooth-pasting = OPTIMAL EXERCISE (variational), best-efforts to Mathlib limit.
GENERATED (6 theorems, all proved): `opt_boundary_is_critical_{A,B}` (S* is a critical point of the holder's value-over-boundaries objective coeffOfBoundary), `critical_iff_smoothfit_{A,B}` (S* is the UNIQUE critical point), `opt_boundary_is_max_{A,B}` (S* is the GLOBAL MAX — via monotone-up then antitone-down on each wing). coeffOfBoundary_A(B)=(1−B/K)B^γ, a'(B)=B^(γ−1)(γ−(γ+1)B/K)=0 ⇔ B=S*_A; put analogue b'(B)=B^(−γ−2)((γ+1)K−γB)=0 ⇔ B=S*_B. CARRIED: `AmericanOptimalityPrinciple` = a `structure : Prop` (NOT an axiom) with a `True` field, the explicitly-named Snell-envelope/optimal-stopping-time identification Mathlib v4.28.0 cannot generate (probe). Audit: token-clean (carried principle is a structure, not axiom/sorry), unscoped byte-identical, pins intact, axioms ⊆ standard three, no COULD NOT CLOSE, math re-derived. **2 FRAGILE FLAGS (manager harden on canonical build; NOT audit failures, axiom-clean):** line 92 `grind +qlia` in `opt_boundary_is_critical_A`, line 145 `grind` in `opt_boundary_is_max_A`. (Also `aesop` line 73 in a helper side-goal; `simp_all +decide` line 229 = kernel-decide simp flag, allowed.)

### T2 (84a6a417) — THE SINGLE-μ CORE ("singular, not federation"). GROUNDED. Type-checks as ONE object off μ.
`structure MetriplecticCore` carries ONE field `μ : ℝ→ℝ` (+ `hμ : ContDiff ℝ 2 μ`, `hconvex : ∀ s, 0 ≤ (μ′)′ s` = the SINGLE metric-positivity source). Every primitive a `def` reading c.μ: `price=deriv c.μ`, `Rdissip=deriv(deriv c.μ)` (Fisher Hessian), `valueMetric=1/(deriv(deriv c.μ))` (Legendre dual), `trade δ s=s+δ`, `sNorm`. Theorems (8/8, GROUNDED): `price_is_grad`, `R_is_hessian`, `R_psd` (FROM c.hconvex, the single source — not a fresh hyp), `valueMetric_is_legendre_dual` (1/μ″·μ″=1), `omega_skew`, `trade_group` (one-param group), `rebase_gauge_invariant` (degree-0 gauge), and the **headline `single_source`**: c.μ=d.μ ⇒ price/R/valueMetric all agree (type-level federation-collapses-to-one-object). Audit: token-clean, NO search tactics, unscoped byte-identical, pins intact, axioms ⊆ standard three. **SCOPE CAVEAT (honestly reported by Aristotle, NOT an audit failure):** `omega` is the trivial 1-D skew form (`v*w−w*v ≡ 0`) — the unique skew bilinear form on ℝ¹ is zero; a nontrivial symplectic form needs ≥2 dims. Consistent with the prior finding that the GH gauge interior is 1-real-dim (Kähler CONJECTURAL). The symplectic reading is genuinely degenerate in the gauge coordinate; ω-skewness holds but carries no content. price/R/valueMetric/single_source are the real one-μ content.

### AIRTIGHT — settlement-as-generated VERDICT (distilled)
- **Settlement is now GENERATED (algebraic leak collapsed).** T1a: the boundary S* and coefficient are no longer posited-then-checked-C¹ — they are FORCED as the unique solution of the smooth-pasting system, derived from the exp-family value law a·S^(−γ). PH-5 upgrades from "C¹ as a checked coincidence" to "C¹ BECAUSE it is the (uniquely-forced) free boundary." Both wings.
- **Optimality is PARTIAL-but-honest.** T1b: the deterministic variational characterization (S* maximizes the holder's value over exercise boundaries) is GENERATED; the identification with the Snell-envelope optimal stopping time is CARRIED-as-standard-principle (Mathlib v4.28.0 has no optimal-stopping superstructure — probe). So "smooth-pasting = American optimum" is generated at the variational/free-boundary level, carried at the stochastic optimal-stopping level.
- **Single-μ core BUILT and type-checks as ONE object** off c.μ (T2). Caveat: the symplectic ω reading is trivial in the 1-D gauge coordinate.
- Scope (locked, not re-litigated): |Γ|≤1 exact American; |Γ|>1 = labelled approximation. Funding/κ status quo (untouched). Kähler/Courant remain OUT-OF-CORE (proved obstruction / Mathlib gap from CLOSEOUT) — excision justified.

### T1b HARDEN (7dec6a1b, run f2c5fed8) — fragile search tactics REMOVED. proved (trusted-from-prover).
Operator-approved SMALL HARDEN of `AIRTIGHT_T1b_optimality/.../Optimality.lean`: re-prove CLEAN (no `grind`/search). Submitted the file with the two flagged `grind` sites replaced by `sorry` (2 sorries only, exactly at lines 92 + 145); instructed concrete-tactics-only, no statement changes, structure stays carried. Returned archive: `AIRTIGHT_T1b_optimality_clean/extracted/proj_clean_aristotle/`.
**DIFF vs original = exactly 3 lines, all tactic bodies (no statement/def/structure/signature touched):**
- line 73 `aesop` → `exact Or.inl hB.ne'` (Aristotle ALSO caught a pre-existing `aesop` search tactic in helper `hasDerivAt_coeffOfBoundary_A`, side-goal `B ≠ 0 ∨ 1 ≤ γ`; concrete left-disjunct).
- line 92 `grind +qlia` → `right; field_simp; ring` (`opt_boundary_is_critical_A`: pick right disjunct, smooth-pasting factor `γ − (γ+1)·(Kγ/(γ+1))/K = 0` by field arithmetic).
- line 145 `grind` → `exact ⟨(Sstar_A_pos hK (by linarith)).le, le_rfl⟩` (`opt_boundary_is_max_A`: membership `S*_A ∈ Icc 0 S*_A`).
**AUDIT (all PASS):** token-scan `grep -rnE '(grind|aesop|exact?|apply?|rw?|simp?|native_decide|sorry|admit|sorryAx|opaque|unsafe)'` → ZERO live search/forbidden tokens (0 `grind|aesop` even in comments); ZERO `axiom` decls; ZERO `sorry`. All 6 theorem signature lines + the `AmericanOptimalityPrinciple` structure (`: Prop`, `True` field — NOT axiom, NOT proved) character-identical to original (full diff = the 3 tactic lines above only). All 5 sibling modules (AMMCurve/Audit/Main/Seam/Temporal) byte-identical vs submitted AND vs the original-T1b run. Toolchain pin `leanprover/lean4:v4.28.0` + mathlib `rev=v4.28.0` UNCHANGED. `#print axioms` block (6 targets) present; Aristotle reports ⊆ {propext,Classical.choice,Quot.sound}, no sorryAx — and the 3 concrete replacements (`exact`/`field_simp;ring`/term) cannot introduce non-standard axioms, so the original's clean axiom set cannot have regressed. Math re-derived independently (all 3 goals correct). **NOTE:** summary's "removed `hK : K ≠ 0` hypothesis" line is STALE carried text from a prior run — the actual diff shows NO signature change (original helper never had that hyp). NOT upgraded to "verified" (canonical-env build = the `#print axioms` reproduction + label upgrade).

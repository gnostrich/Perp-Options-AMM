# formal/INDEX.md — PROPOSED provenance map (DRAFT, in scratch — manager to review/relocate)

_Drafted by research-lead 2026-06-09. This is a PROPOSAL for `formal/INDEX.md` (one canonical
provenance index over all Aristotle-generated results). It is in `formal/aristotle_runs/` (scratch)
on purpose — I do not relocate it to `formal/` unilaterally. Generated from RESULTS.md + the returned
archives; every row points at a real returned `.lean`._

## Provenance vocabulary (the honest-label scheme)
- **GROUNDED** — proved in Lean over the real objects (real `cgf`/`mgf`/`rpow`/`HasDerivAt`/GH kernel),
  no carried hypothesis doing the load-bearing work.
- **CARRIED[h]** — proved CONDITIONAL on named hypotheses/fields `h` that are NOT discharged (the GH
  special-function / Bessel-K content, or B1 solvency coverage). The `h` are `structure` fields or
  explicit premises, never `axiom`s.
- **CONJECTURAL** — stated, not proved; a named `sorry` + a precise Mathlib-gap report (e.g. Kähler K3).
- **OBSTRUCTION** — a no-go proved (the thing CANNOT hold as posed), e.g. Courant all-four.
- **trusted-from-prover** — the universal provenance: Aristotle compiled server-side (Lean 4.28.0 /
  Mathlib v4.28.0) AND passed the zero-cost audit (token-clean, axioms ⊆ {propext, Classical.choice,
  Quot.sound}, unscoped modules byte-identical, math re-derived). NEVER "verified" — that label needs
  a canonical-kernel build (manager) and is env-blocked here.

## Status legend: ✅ grounded · ⚠ carried · ❓ conjectural · ⛔ obstruction/no-go

| Result (headline thm) | Meaning | Depth | Archive (returned .lean) | Run |
|---|---|---|---|---|
| `valueMatch_A` / `slopeMatch_A` (R1) | PH-5 C¹ smooth-pasting at S*=Kγ/(γ+1), both wings | ✅ GROUNDED | R1/extracted/.../R1.lean | big 06-08 |
| `crossover_sNorm_at_K` (R2) | θ=sNorm(K) ⇒ OTM→ITM crossover at dollar K ∀γ | ✅ GROUNDED | R2/.../R2.lean | big 06-08 |
| `getMP_raw_over_slope` (R3) | mpGeom=getMP_raw·e^(−μ); price-coord vs slope pin | ✅ GROUNDED | R3/.../R3.lean | big 06-08 |
| `put_mark_anti` (R4) | wing orientation signs (CALL +, PUT −) | ✅ GROUNDED | R4/.../R4.lean | big 06-08 |
| `pct_slippage_basis_independent` (R5) | %-slippage e^μ-cancels; $ carries factor | ✅ GROUNDED | R5/.../R5.lean | big 06-08 |
| `compositeRay_ITM_substitution` (C1) | composite-ray shortcut → ITM via effective strike | ✅ GROUNDED | C1/.../C1.lean | big 06-08 |
| `collarSurplus_zero_iff_half` (C2) | no costless-collar arb ⇔ w=½ | ⚠ CARRIED[collarSurplus form] | C2/.../C2.lean | big 06-08 |
| `reflection_arrow` (C3) | put = reflected call (θ²/s); no-arb is symmetry | ✅ GROUNDED (arrow); ⚠ residual spec-mark↔engine-barrier link | C3_reflection/.../*.lean | RUN-4 |
| `solvent_of_port_covers` (B1) | coverage→solvency conditional; κ extrinsic | ⚠ CARRIED[coverage] — real floor STILL-OPEN | B1/.../B1.lean | big 06-08 |
| `gh_slope_law` / `esscher_core` (GHJ) | GH trade=latent one-param group + Esscher tilt (NOT X·Y) | ✅ GROUNDED — ECONOMIC-OBJECT finding | GHJ_grounded/.../*.lean | RUN-2 |
| `coercive_of_nonneg` (GHcoercive) | AMMCurve.coercive gate field for GH bounded reserves | ⚠ CARRIED[T,C∈(0,1)] partial | GHcoercive_grounded/.../*.lean | RUN-2 |
| `gh_arbLeak_density_nonneg` (PH3) | R⪰0 / LVR leak ≥0 from GH slope law | ✅ GROUNDED — necessary-not-sufficient | PH3_grounded/.../*.lean | RUN-2 |
| `gh_no_floor_grounded` (PH4b) | no intrinsic reserve floor (funding NECESSARY) | ⚠ CARRIED[T,C<1] | PH4b_grounded/.../*.lean | RUN-2 |
| `R_form_rebase_invariant` (PH6) | rebase preserves J, R; sNorm gauge degree-0 | ✅ GROUNDED | PH6/.../*.lean | big 06-08 |
| `ct_dissipation_ineq` / `sampled_passivity` (CTPH) | continuous-time PH dissipation + sampled bridge | ✅ GROUNDED (no SDE) — does NOT instantiate floor | CTPH_clean/.../*.lean | RUN-2 |
| `cgf_deriv_mean_and_variance` / `cgf_convexOn` (UNIFY2) | exp-family cgf: cgf'=mean, cgf''=Var=Fisher≥0 | ✅ GROUNDED (structure); ⚠ CARRIED[Bessel-K norm] | UNIFY2/.../*.lean ; CLOSEOUT_cgf/ (hardened) | RUN-4/CLOSEOUT |
| `ghKernel_exponent_le` / prob-measure / finite-MGF (GHmeasure) | GH is a genuine prob measure w/ finite MGF (no Bessel-K) | ✅ GROUNDED | CLOSEOUT_GHmeasure/.../*.lean | CLOSEOUT |
| `slope_strictMono` / `frontier_antitone` (frontier) | frontier antitone/convex from slope law | ✅ GROUNDED; ⚠ CARRIED[StrictAnti X, StrictMono Y] | CLOSEOUT_frontier/.../*.lean | CLOSEOUT |
| `gh_J_integrable` (kahler K3) | variable-J Kähler integrability | ❓ CONJECTURAL (Mathlib gap: no a.c.s./Nijenhuis) | CLOSEOUT_kahler/.../*.lean | CLOSEOUT |
| `dissipation_breaks_isotropy` (courant) | all-four single Dirac bracket | ⛔ OBSTRUCTION (R breaks isotropy) | CLOSEOUT_courant/.../*.lean | CLOSEOUT |
| `Sstar_A_forced` / `coeffA_forced` (T1a) | settlement boundary GENERATED as unique smooth-pasting soln | ✅ GROUNDED | AIRTIGHT_T1a_invert/.../*.lean | AIRTIGHT |
| `opt_boundary_is_max_A` / `AmericanOptimalityPrinciple` (T1b) | S* = optimal exercise boundary (variational) | ✅ GROUNDED (variational); ⚠ CARRIED[Snell] | AIRTIGHT_T1b_optimality_clean/.../*.lean | AIRTIGHT |
| `single_source` / `price_is_grad`/`R_psd` (T2) | single-μ metriplectic core (one object) | ✅ GROUNDED; ⚠ ω trivial in 1-D gauge | AIRTIGHT_T2_singlecore/.../*.lean | AIRTIGHT |
| `merton_vieta_prod` / `gh_put_root_in_strip` (MERTON) | μ=GH Laplace exponent, γ=char root ψ(−γ)=r, γ(γ+1)=2r/σ² Gaussian slice | _pending verdict 06-09_ | MERTON_tie/ | MERTON 06-09 |
| `ghCDF_strictMono` / `X_strictAnti` (GHMAPS) | DISCHARGE carried monotone maps from density-positivity (Bessel-K-free) | _pending verdict 06-09_ | GHMaps/ | MERTON 06-09 |

## What stays genuinely open / carried (the TRUE floor)
- **Bessel-K closed-form normalizer VALUE** (M = K_ν ratio) — Mathlib v4.28.0 has zero Bessel-K. NOT
  needed for any structural claim (prob-measure, finite-MGF, monotonicity all hold without it).
- **B1 real solvency floor** — κ extrinsic; operator ship-gate. Only the conditional is proved.
- **Kähler variable-J integrability** — CONJECTURAL; needs upstream Mathlib differential geometry.
- **Courant all-four single bracket** — OBSTRUCTION proved (not a Dirac structure).
- **C3 spec-mark ↔ engine-barrier link** — the reflection arrow is a proved identity; the link to the
  live engine barrier is the residual modeling premise (engine-faithfulness pivot, HELD).

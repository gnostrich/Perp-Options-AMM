# formal/INDEX.md — canonical provenance map over all Aristotle-generated results

_PROMOTED 2026-06-10 from `aristotle_runs/INDEX_DRAFT.md` (research-lead draft 2026-06-09;
promotion operator-greenlit 2026-06-10). One row per headline result → meaning → honest depth →
the real returned `.lean` archive → run. **Maintenance:** research-lead adds/updates rows at each
run fold; manager confirms rows against its audit before commit. `aristotle_runs/RESULTS.md`
remains the append-style run ledger (narrative detail); THIS file is the navigable summary._

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

## ⟢ MOTIVATION-LAYER tag (skeptic ruling 2026-06-10, `notes/skeptic/VERDICT_DELEGATED_DECISIONS_2026-06-10.md`; truth-to-objective audit `VERDICT_FORMAL_TRUTH_TO_OBJECTIVE_2026-06-10.md`)
Two ORTHOGONAL axes — do not conflate: **provenance** (every row is trusted-from-prover) vs
**truth-to-objective** (relevance to what we are building: the curve-warp / kurtosis-knob AMM and its
locked contracts). The operator delegated the keep-vs-store call to the skeptic; ruling = **KEEP in
place, annotate (do NOT move)**.
- **`[motivation-layer]`** — trusted-from-prover but **OFF the curve/kurtosis objective**: the
  port-Hamiltonian / metriplectic / Kähler / Courant **framing** = rows **T2** (single-μ metriplectic
  core), **CTPH** (continuous-time PH), **PH3** (LVR leak ≥0), **PH4b** (no-floor), **kahler**
  (conjectural), **courant** (obstruction). Kept as the paper's conservation-law motivation;
  **not load-bearing for the build**. (PH6 rebase = contract #5 and B1 solvency = ship-gate #13 are
  NOT motivation-layer — they straddle locked contracts and stay load-bearing KEEP.)
- **On-objective / load-bearing (KEEP, untagged):** the settlement spine R1 / T1a / T1b / MERTON_tie;
  the curve/slippage/Esscher results R2–R5, GHJ, GHmeasure, frontier, GHMaps, C3; PH6, B1.
- **Superseded run-twins** (bare `UNIFY/`, `UNIFY_stage0/`, non-grounded `GHJ/GHcoercive/PH3/PH4b/CTPH`,
  pre-harden `T1b_optimality/`, RUN-4 `Courant/Kahler/`, `probe_optstop/`) are **retained in place,
  annotate-not-move** — this INDEX already cites the superseding (`_grounded`/`_clean`/CLOSEOUT)
  versions in each row; physically moving them buys only tidiness against the cgf/MERTON discharge-chain
  hazard, so annotation dominates.

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
| `solvent_of_port_covers` (B1) | coverage→solvency conditional; κ extrinsic | ⚠ CARRIED[coverage] — real floor STILL-OPEN (operator ship-gate) | B1/.../B1.lean | big 06-08 |
| `gh_slope_law` / `esscher_core` (GHJ) | GH trade=latent one-param group + Esscher tilt (NOT X·Y) | ✅ GROUNDED — ECONOMIC-OBJECT finding | GHJ_grounded/.../*.lean | RUN-2 |
| `coercive_of_nonneg` (GHcoercive) | AMMCurve.coercive gate field for GH bounded reserves | ⚠ CARRIED[T,C∈(0,1)] partial | GHcoercive_grounded/.../*.lean | RUN-2 |
| `gh_arbLeak_density_nonneg` (PH3) | R⪰0 / LVR leak ≥0 from GH slope law | ✅ GROUNDED — necessary-not-sufficient | PH3_grounded/.../*.lean | RUN-2 |
| `gh_no_floor_grounded` (PH4b) | no intrinsic reserve floor (funding NECESSARY) | ⚠ CARRIED[T,C<1] | PH4b_grounded/.../*.lean | RUN-2 |
| `R_form_rebase_invariant` (PH6) | rebase preserves J, R; sNorm gauge degree-0 | ✅ GROUNDED | PH6/.../*.lean | big 06-08 |
| `ct_dissipation_ineq` / `sampled_passivity` (CTPH) | continuous-time PH dissipation + sampled bridge | ✅ GROUNDED (no SDE) — does NOT instantiate floor | CTPH_clean/.../*.lean | RUN-2 |
| `cgf_deriv_mean_and_variance` / `cgf_convexOn` (UNIFY2) | exp-family cgf: cgf'=mean, cgf''=Var=Fisher≥0 | ✅ GROUNDED (structure); ⚠ CARRIED[Bessel-K norm] | UNIFY2/.../*.lean ; CLOSEOUT_cgf/ (hardened) | RUN-4/CLOSEOUT |
| `ghKernel_exponent_le` / prob-measure / finite-MGF (GHmeasure) | GH is a genuine prob measure w/ finite MGF (no Bessel-K) | ✅ GROUNDED | CLOSEOUT_GHmeasure/.../*.lean | CLOSEOUT |
| `slope_strictMono` / `frontier_antitone` (frontier) | frontier antitone/convex from slope law | ✅ GROUNDED — its CARRIED[StrictAnti X, StrictMono Y] hyps were **DISCHARGED by GHMAPS (06-09)** | CLOSEOUT_frontier/.../*.lean | CLOSEOUT |
| `gh_J_integrable` (kahler K3) | variable-J Kähler integrability | ❓ CONJECTURAL (Mathlib gap: no a.c.s./Nijenhuis) | CLOSEOUT_kahler/.../*.lean | CLOSEOUT |
| `dissipation_breaks_isotropy` (courant) | all-four single Dirac bracket | ⛔ OBSTRUCTION (R breaks isotropy) | CLOSEOUT_courant/.../*.lean | CLOSEOUT |
| `Sstar_A_forced` / `coeffA_forced` (T1a) | settlement boundary GENERATED as unique smooth-pasting soln | ✅ GROUNDED | AIRTIGHT_T1a_invert/.../*.lean | AIRTIGHT |
| `opt_boundary_is_max_A` / `AmericanOptimalityPrinciple` (T1b) | S* = optimal exercise boundary (variational) | ✅ GROUNDED (variational); ⚠ CARRIED[Snell] | AIRTIGHT_T1b_optimality_clean/.../*.lean | AIRTIGHT |
| `single_source` / `price_is_grad`/`R_psd` (T2) | single-μ metriplectic core (one object) | ✅ GROUNDED; ⚠ ω trivial in 1-D gauge | AIRTIGHT_T2_singlecore/.../*.lean | AIRTIGHT |
| `merton_vieta_sum/prod` / `gh_put_root_in_strip` / `gh_call_root_out_of_strip` / `sigmaEff2_closed_form` / `gaussian_limit_quadratic` / `Sstar_is_merton_boundary` (MERTON) | μ=GH Laplace exponent; γ=char root ψ(−γ)=r; γ(γ+1)=2r/σ² is the GAUSSIAN slice; **GH asymmetry: only the put eigenfunction is native (call root leaves the strip)** | ✅ GROUNDED (algebra+curvature+limit+boundary); ⚠ CARRIED[GHIsLaplaceExponent, GaussianLimitOfGH — Bessel-K/distributional layer]; 3 `grind` emend flags (no-math) | MERTON_tie/extracted/.../*.lean | MERTON 06-09 |
| `ghCDF_strictMono` / `ghTail_strictAnti` / `X_strictAnti` / `Y_strictMono` / `frontier_antitone_discharged` (GHMAPS) | DISCHARGES the CLOSEOUT-carried monotone reserve maps from density positivity, **Bessel-K-FREE** (FTC-2 + deriv-sign) | ✅ GROUNDED — fully token-clean | GHMaps/extracted/.../*.lean | MERTON 06-09 |

All rows: provenance = **trusted-from-prover** (manager-audited; see `MANAGER_VERIFICATION.md`
and the per-run audits in `evidence/manager_audit_*.md` + in-commit audit notes).

## ⟢ EXTERNAL / RETRIEVED — the warp-amm Aristotle cluster (added 2026-06-11, entry 33)
The **continuous trade-point warp** derivation lives in an Aristotle project cluster that PREDATES this
index and was never folded in: **`warp-amm` / `warp-amm-handoff`** — task IDs `d20dda3a` (base),
`7f933065` + `4e92e3cb` (Model-C twins); Lean `RequestProject/Warp.lean`; formalizes `warp-amm.tex`.
Content: the warp is **trade-point-anchored** (tangent at the trade point `(x_B,y_B)`, NOT spot/45°/
reserves), with closed forms `mode_shift_closed_call=(1/w₀)·log(y_s/y_B)` and rapidity slope integrals
`2σ·sinhΔξ` / `2σ²(coshΔξ−1)`; token-clean, standard axioms. **It is the scalar-Balancer backing for the
v27 trade-point-anchoring fix; the (W)-kurtosis generalisation (`dφ/dy=(β/y²)/w′(u)`) is its field lift.**
⚠ **PROVENANCE = retrieval/read only this pass — NOT re-verified by us, so NOT trusted-from-prover yet.**
It is in rapidity/mode-shift coordinates, not the paper-draft's exact `β/y²` cash-leg form (that integral
is elementary; the paper L288 continuous closed-form remains a placeholder). To upgrade: a manager
artifact audit (token-scan + axioms + diff) like any fold. See `notes/research/WARP_continuous_aristotle_query_2026-06-10.md`.

## What stays genuinely open / carried (the TRUE floor, post-GHMaps)
- **Bessel-K closed-form normalizer VALUE** (M = K_ν ratio) — Mathlib v4.28.0 has zero Bessel-K.
  NOT needed for any structural claim (prob-measure, finite-MGF, monotonicity, frontier shape all
  hold without it; the GHMaps run removed the last structural dependence).
- **B1 real solvency floor** — κ extrinsic; operator ship-gate. Only the conditional is proved.
- **Kähler variable-J integrability** — CONJECTURAL; needs upstream Mathlib differential geometry.
- **Courant all-four single bracket** — OBSTRUCTION proved (not a Dirac structure). SETTLED, not open.
- **C3 spec-mark ↔ engine-barrier link** — the reflection arrow is a proved identity; the link to the
  live engine is the residual modeling premise (**engine-faithfulness pivot, HELD**).
- **"verified" label** — env-blocked (no local Lean toolchain reachable); everything stays
  trusted-from-prover until a canonical local build is possible.

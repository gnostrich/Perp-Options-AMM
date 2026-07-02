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

## ⟢ EXTERNAL — the warp-amm Aristotle cluster (added 2026-06-11, entry 33; **UPGRADED 2026-06-12 → trusted-from-prover**)
The **continuous trade-point warp** derivation: **`warp-amm` / `warp-amm-handoff`** — project IDs
`d20dda3a` (base, Model A/pivot — superseded), `7f933065` + `4e92e3cb` (Model-C twins,
statement-identical, proof scripts differ; `7f933065` newest = canonical); Lean
`RequestProject/Warp.lean`; formalizes `warp-amm.tex`. Content: the warp is **trade-point-anchored**
(tangent at the trade point `(x_B,y_B)`, NOT spot/45°/reserves), with `mode_shift` =
`ln(y_s/x_s)−ln(y_B/x_B)`, closed call form `(1/w₀)·log(y_s/y_B)` (pre-curve constraint), and rapidity
slope integrals `2σ·sinhΔξ` / `2σ²(coshΔξ−1)`; 22–23 theorems per archive.
**PROVENANCE UPGRADE (research-lead audit 2026-06-12, entry-142 sweep; archives folded to
`aristotle_runs/WARPAMM_external/`):** token scan CLEAN (all three; `Main.lean` = set_options only);
summaries assert axioms ⊆ {propext, Classical.choice, Quot.sound}; statements re-derived by hand,
all intended (incl. mode_shift via σ_B substitution and the closed-call log algebra); twins diff =
proof-scripts/comments only. FRAGILE-TACTICS flags: `grind` (`mode_shift_closed_call`), heavy
`nlinarith` (`mode_shift`) — no-math. **Now trusted-from-prover** (manager fold-confirmation
pending per protocol). Caveats kept: Model-C anchoring is the trade point, NOT v28's live-mode lens;
`mode_shift_closed_call` is the frozen-w first approximation of the exact
`Δln center = −ln((y₁−β)/(y₀−β))` (CONTINUOUS note §2); engine link NOT claimed.

## ⟢ SWEEP 2026-06-12 (entry 142) — proven-but-UNFOLDED store results (parallel-session submissions; manager to route)
- `fw_proj_warp_core` 56b4f0fa (FW-1/2/3/13: w′=(1−w)/y, α/β conserved, transport uniqueness,
  round-trip, semigroup) — COMPLETE; token-clean; unchanged modules byte-identical to working tree.
- `fw_proj_gate_leak` 727fc83e (FW-7/8: validity=convexity gate, leak≥0, leak=Bregman) —
  **COMPLETE_WITH_ERRORS server status vs clean-compile summary: reconcile before fold.**
- `fw_proj_germ` 6d6ba6e6 (FW-5/6 germ: ε′=−1/2, A=1/2, validity strip) — COMPLETE; token-clean.
- `offatm_submit` 90056417 (+twin f3776478) (off-ATM trade point existence/uniqueness, w′∈(0,1)) —
  COMPLETE; token-clean.
- Pre-repo cluster (4–7 wk: Two-AMM/SU(1,1)/Minkowski/closed-form/geometric/policy) — retrieval
  candidates only, NOT audited.

## ⟢ CONSTANT-m LENS REDEFINITION (operator entry 229/230, 2026-06-13) — what survives, what is superseded
The operator redefined the kurtosis lens from the position-dependent polar kernel `Φ_τ(u)=u/√(τ²+u²)`
to a **CONSTANT slope multiplier `m`** (`g_loc(K)=m·γ`, strike-independent; `m=1`=plain v24). Skeptic-
confirmed form: `notes/skeptic/VERDICT_constant_slope_multiplier_entry229_2026-06-13.md`. Simplified
object: `notes/research/CONSTANT_M_lens_object_sync_2026-06-13.md`. Effect on the Lean layer:
- **KEPT (trusted-from-prover, NOT touched by the lens redefinition):** all LENSKERNEL POOL +
  g-parametric results — `tradeUpdate_*`, `gamma_linear_in_cash`, `rebase_*`, `gLoc_rebase_invariant`
  (the rebase invariance holds for a constant exponent too), and the smooth-paste port
  `valueMatch_g`/`slopeMatch_g`/`sStarCall_*`/`contCall/intrCall_at_sStar` (∀ g>0 — applies directly
  to `g=m·γ`). These are the pool + settlement spine, independent of lens shape.
- **SUPERSEDED (were trusted-from-prover for the √-kernel, no longer the object):** the polar-specific
  lens facts `Phi_zero/nonneg/le_one/lt_one/strictMonoOn`, `gLoc_le_gamma` (the ≤γ cap is gone),
  `gLoc_at_mode` (g=0 at the mode is gone — g=m·γ>0); and the ENTIRE WARPCALC polar-warp calculus
  (`PhiA`, `warpDen`, `warpInt`, `warpPot`, `warpPot_hasDerivAt`, `warp_eq_pot_sub`, `warp_additive`,
  `warp_le_dgamma`, `warp_nonpos_sell`, `warp_pos`, `glAt_hasDerivAt`, `recenterKer`,
  `warp_decomposition`). Under constant-m the warp is the LINEAR `ΔG=m·Δγ` (one-line `integral_const`
  corollary). Archives `aristotle_runs/{LENSKERNEL,WARPCALC}/` retained as history.
- **NEW — RETURNED + AUDITED 2026-06-13 → trusted-from-prover:** the CONSTANT-m single structure
  `MonolithConstM.lean` (prompt `formal/prompts/aristotle_prompt_monolith_constm.md`; run
  `6016ec57` / task `3f85462d`; archive `aristotle_runs/MONOLITH_CONSTM/`). ONE structure
  `TemporalAMM` (fields `alpha,beta,y,m` + positivity, verbatim as pinned), every component a
  def/theorem reading it. Proved: `g_eq_m_gamma`, `g_const_in_strike`, `g_pos`,
  `g_eq_gamma_iff_m_one` (m=1⇔plain Balancer), `g_ge_gamma_of_m_ge_one`, `thetaTx_roundtrip`
  (closed-form invertible rpow map, exponent 1/m), `thetaTx_strictMono`, `warp_linear` (∫m=m·Δg),
  `warp_roundtrip_zero`, `warp_nonneg_of_buy`, `warp_eq_m_dgamma` (=m·D/β), `paste_value`/`paste_slope`
  (∀g>0 ⇒ at g=m·γ), `price_is_grad`/`R_psd` (real differentiation), the pool/trade/rebase spine
  (`invariant`,`gamma_affine`,`trade_dx`,`trade_rebase_commute`,…), `goalSeek_*`, `engineInstance`
  (m=1: x=1000,w=29/40,γ=29/11,g=γ,γ>1), `single_object`. The DELETED polar facts (g=0 at center,
  g≤γ) are correctly ABSENT; no LensShape/polarLens/√-kernel. Audit PASS: out-of-scope modules
  byte-identical to working tree; toolchain v4.28.0 matches; token-clean (no sorry/admit/
  native_decide/sorryAx/axiom-decl/opaque/unsafe/decide); statements re-derived by hand (g=m·γ,
  thetaTx inverse, warp linear, engine rationals, smooth-paste arms = 1/(g+1)). Prover-reported
  `#print axioms` ⊆ {propext,Classical.choice,Quot.sound} (the raw per-theorem axiom listing was NOT
  in the streamed logs — corroborated by token-clean + no-sorry ⇒ no sorryAx; canonical-env axiom
  confirmation deferred, env-blocked). FRAGILE TACTICS (no-math, flagged): `grind`
  (`center_eq_sNorm`/`price_eq_slope`/`goalSeek_root`), `aesop` (`trade_rebase_commute`), heavy
  `nlinarith` (`w_consistency`/`gamma_eq`); `paste_slope`/`price_is_grad` use `convert HasDerivAt…`.
  **Verdict: `proved (trusted-from-prover)`** — NOT "verified" (no local canonical kernel; env-blocked).

- **NEW — RETURNED + AUDITED + SKEPTIC-REGATED 2026-06-14 → trusted-from-prover:** the WHOLE-EXCHANGE
  unification **INTERNAL HALF** `PHUnification.lean` (prompt `formal/prompts/aristotle_prompt_PH_unification_composed.md`;
  run `8ee75026`/task `5c2bccf2`; archive `aristotle_runs/PH_UNIFICATION_COMPOSED/`; md5 `65e7bc31`).
  The conjecture = the whole exchange as ONE `Exchange` object (storage/flow/gauge/funding-port/
  settlement-port/dollar-pipe/slippage[unbuilt]/close-mechanic-PARAMETRIZED=Q14), solvency =
  passivity-under-admissible-inputs. **PROVED (internal half): `exchange_internal_passivity`** — the
  concrete exchange is passive with **NO open PSD hypothesis**: the `Hs` resistive curvature is fixed to
  `deriv(deriv poolPotential)(st k)` and its nonnegativity is **discharged BY the geometry**
  (`exchange_Rcurv_nonneg` = the proven `R_psd`), i.e. passive *because* the geometry is PSD — the weld
  itself (this was FLAGGED 2026-06-14 as un-composed in the first `PH_UNIFICATION_INTERNAL` run
  `80cd7ba4`; that archive retained with `CORRECTION_2026-06-14.md`). Also `trade_no_spontaneous_storage`
  (composes `trade_conserves`), `internal_passivity`/`no_internal_free_money` (telescoping), the pool
  spine. **EXTERNAL/solvency half stays OPEN/conditional** — `solvency_of_coverage`/`coverage_iff_solvency`/
  `exchange_solvency_split` keep `hcov` (B1/B3/B4 admissibility) as a `→` premise, **never discharged**
  (PH-4b honored; geometry does NOT close solvency). Audit PASS ×3 (research-lead `aa40e1c1`-redo +
  manager + skeptic re-gate `adbc7377` CLEAR): token-clean; weld genuinely composed (no open hR, real
  curvature, not circular/vacuous; strict gap 4.367); no statement drift; `#print axioms` summary ⊆
  {propext,Classical.choice,Quot.sound} (canonical-env deferred). **Self-contained** (`namespace
  PHUnification`, re-declares minimal `TemporalAMM`, NOT lake-globbed, NOT integrated into the canonical
  build — MonolithConstM status; an in-canonical-dir copy was written then **removed by the manager**,
  skeptic concurred). ⚠ The object's μ is the **Balancer constant-product** potential, NOT the GH CGF
  (`notes/research/DETERMINATION_CORRECTION_GH_vs_Balancer_2026-06-14.md`). **Verdict: `proved (trusted-from-prover)`, INTERNAL half only** —
  NOT "verified", NOT integrated; external solvency remains the open frontier.

- **L-MENU (operator entry 276, 2026-06-23) — RETURNED + research-lead-audited + MANAGER-AUDITED + SKEPTIC-GATED (run adeca113) → `trusted-from-prover` (self-contained MODELS; two oversell corrections below).**
  Five obligations off the Dexter's-Lab monolith-review menu (`evidence/dexters_lab/monolith_review_findings_2026-06-23.md`),
  submitted to Aristotle (project-dir `formal/temporal_lean_verified`, Lean 4.28.0 / Mathlib v4.28.0).
  All five COMPILED server-side. **Manager independent audit (2026-06-23):** token scan clean (the only
  `sorry` is in an L9 COMMENT; `+decide` is kernel decide, NOT native_decide; no admit/axiom-decl/
  sorryAx/opaque/unsafe); L1's archive carries the canonical modules (AMMCurve/Temporal/Seam/Main/Audit)
  BYTE-IDENTICAL to the verified baseline (manager-diffed); `#print axioms` ⊆ {propext,Classical.choice,
  Quot.sound} per each summary. **ALL FIVE ARE SELF-CONTAINED `import Mathlib` MODELS** (each re-declares
  its own defs), NOT theorems imported into the canonical build. **NOT "verified"** (env-blocked, no
  local canonical kernel). **Skeptic gate (run adeca113) = CLEAR-TO-FOLD with two required oversell
  corrections (L1, L7 below); NOTE the canonical `hst`/`exchange_internal_passivity` weld lives in
  `PHUnification.lean`, NOT in the modules L1 was diffed against, so the byte-identical fact is orthogonal
  to whether `hst` is discharged.**
  - **L1 `TrajectoryDomain.lean`** (project `34a9aca5`; archive `aristotle_runs/L1_TRAJECTORY_DOMAIN/`;
    md5 `7cc8dc9b`). `trade_seq_on_domain` — every state coordinate along an iterated valid-trade
    trajectory stays on the R_psd operating domain `β ≤ (iterTrade …).y`, via β-conservation
    (`trade_seq_beta_const`) + the genuine (non-vacuous) trade precondition `β < y + D k`. Also
    `state_on_domain`, `trade_state_on_domain`. **OVERSELL CORRECTION (skeptic):** the re-declared
    `TemporalAMM` is STRUCTURALLY IDENTICAL to the canonical object (so this is a faithful lemma on the
    same object, not a different one), but it is the trajectory lemma IN ISOLATION — NOT yet
    imported-and-composed into the canonical `exchange_internal_passivity` weld (in `PHUnification.lean`)
    that carries `hst`. It provides the bounded piece M10 needs but **does NOT by itself close M10 on the
    canonical weld** — the import-and-compose step remains.
  - **L3 `ConditionalSolvency.lean`** (project `e590fcab`; archive `aristotle_runs/L3_CONDITIONAL_SOLVENCY/`;
    md5 `6f217962`). External-half solvency under NAMED concrete B3/B4 forms (packet §5.8):
    `solvent_of_concrete_funding` (funding = floor − (V−O) + slack, slack ≥ 0 ⇒ solvent),
    `concrete_funding_covers`, `covers_iff_solvent`, `solvent_of_covers`, and a real non-vacuity witness
    `concrete_funding_not_vacuous` (a counter-instance where slack<0 ⇒ NOT solvent — proves hslack is
    load-bearing). **Solvency stays CONDITIONAL (PH-4b honored); NOT made unconditional.**
  - **L2 `A16NoJump.lean`** (project `b14701e7`; archive `aristotle_runs/L2_A16_NOJUMP/`; md5 `940f1a32`).
    Promotes the A16 ATM-no-jump GATE fact to a real Lean theorem (lab M2): `arms_agree_at_mode` (call
    arm == put arm at the mode `s=θ` under `g=m·γ>0`), `markCall_continuousAt_mode` /
    `markPut_continuousAt_mode` (genuine `ContinuousAt` at the ATM crossing), plus `sStarCall_gt_mode`/
    `sStarPut_lt_mode`/`markCall_at_mode`/`markPut_at_mode`. DISTINCT from the `S*` smooth-paste seam;
    does NOT weaken `paste_value`/`paste_slope`.
  - **L7 (BIG) `EngineBridge.lean`** (project `8b429b62`; archive `aristotle_runs/L7_ENGINE_BRIDGE/`;
    md5 `3231f1bf`). A Lean-internal analogue of the report-only numeric `monolith_consistency.js`: a
    re-declared `Engine.*` namespace (JS closed forms `gLoc`/`markLensed`/`tradeUpdate` transcribed by
    hand — `Engine.gLoc` computes via `w:=1−β/y` then `w/(1−w)`) is proved EQUAL to the re-declared
    monolith `g`/`markCont`+`markInt`/`trade`. Headline `bridge_tradeUpdate_x`: the transcribed engine
    `x_new = x + (−αβD)/((y−β)(y+D−β))` lands exactly on the monolith's derived post-trade `x`. Plus
    `bridge_gLoc`/`bridge_markCont`/`bridge_markInt`/`bridge_tradeUpdate_y`/`bridge_single`.
    **OVERSELL CORRECTION (skeptic): L7 proves two HAND-TRANSCRIBED Lean copies agree — the faithfulness
    of those transcriptions to the ACTUAL running engine JS is asserted in a comment, NEVER Lean-proved.
    So this is Lean-internal consistency between two transcriptions, NOT a verified bridge to the running
    engine: M4 (engine↔object) is NOT closed.**
  - **L9 (BIG, STAGED) `SnellStaged.lean`** (project `14b029e2`; archive `aristotle_runs/L9_SNELL/`;
    md5 `e7884cca`). Stochastic Snell-envelope settlement-optimality (lab M3 / packet §5.10), STAGED:
    **Stage A PROVED** — the generic finite-horizon discrete optimal-stopping skeleton over an abstract
    reward `g : Fin (N+1) → ℝ` via genuine `Fin.reverseInduction` (`snellValue`): `snell_ge_reward`,
    `snell_ge_continuation`, `snell_eq_max` (Bellman), `snell_optimal_stop` (non-vacuous: horizon stop
    realizes the envelope, stopping region nonempty). **Stage B = REPORTED OBSTRUCTION (not faked):** the
    monolith carries no price process / oracle / filtration / measure, so the conditional-expectation
    Snell envelope cannot be instantiated; "optimal stop = first hitting of S*" needs a super-
    martingale/optional-stopping argument; Mathlib v4.28.0 has the pieces but no packaged Snell-envelope
    construction — that measure layer + a concrete GH/constant-m price process would have to be built.
    **The deterministic-boundary smooth-paste theorem is NOT weakened; the full stochastic claim stays OPEN.**

- **LENS NATURAL HOME + structure re-examination RESOLVED** (operator entry 242; note
  `notes/research/LENS_NATURAL_HOME_2026-06-14.md`; skeptic gate `a00a14ea` — 2 scope-qualifiers binding):
  (A) **Measure-backed info-geometry is DEAD for the Balancer curve** — no CGF / exponential-family /
  Fisher-of-a-measure reading (μ not globally convex; degenerate boundary zero; Marcinkiewicz forbids a
  cubic CGF). BUT a **Hessian / dually-flat information geometry SURVIVES without a measure** (μ convex on
  t≥β; Legendre dual `μ*(η)=⅔√(αβ)·η^{3/2}+β·η` exists). So: NOT "no info-geometry" — only the measure-backed
  reading is killed. (B) **The steepness lens m's natural home = the inverse-temperature of the option-value
  WING law:** `value(S)=S^(−mγ)=e^(−(m·γ)·q)` (q=log S) is a Gibbs weight, β_T=m·γ, `value_m=(value_1)^m`;
  colder=steeper. **Lean-backed `proved (trusted-from-prover)`** — `aristotle_runs/LENS_THERMAL/LensThermal.lean`
  (run `ca042134`/task `50d34e3c`; md5 `87f5ac86`; 7 thms incl. `value_is_gibbs`/`value_pow_m`/`invtemp_eq_m_gamma`/
  `m_one_recovers_base`/`invtemp_mono`; token-clean; axioms⊆{propext,Classical.choice,Quot.sound}; self-contained
  `LensAMM`, NOT integrated). **WING-SCOPED** — `value=S^(−g)` is the power-law tail, NOT the engine's bounded
  smooth-pasted mark near ATM (measured mark/S^(−g) ratio 0.0012–9000). m is a **DILATION** (γ→m·γ), NOT an
  Esscher tilt. Pool lock (entries 229/231) intact. **Making m intrinsic to the POOL would need a curve reopen
  = operator-tier, NOT done.** Manager + research-lead audits both PASS; honest labels per a00a14ea.

- **O-BATCH — EXTENDED-CURVE UNIFICATION (operator entry 296 "throw it to aristotle", 2026-07-02) — PROVISIONAL research-lead entry; manager audit pending.**
  Bounded batch O1/O2/O5 off the design study `notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md`
  §5 (PKG-ITM-v2 obligations). All three are **self-contained `import Mathlib` MODELS of the
  DESIGN-TARGET put value object** (bounded re-seamed mark: power continuation arm exponent −g welded
  to the LINEAR intrinsic `(K−S)⁺/K` at `S* = K·g/(g+1)`, dollar/spot frame, ∀ g>0) — NOT the live
  engine (`markLensed` ships a different ITM arm — the entry-286 violation), NOT the canonical modules,
  NOT integrated into the canonical build. Submission ledger `aristotle_runs/EXTCURVE_SUBMISSION_IDS.txt`;
  prompts `formal/prompts/aristotle_prompt_O{1,2,5}_*.md`. Toolchain Lean 4.28.0 / Mathlib v4.28.0.
  O3 `envelope_least_majorant` NOT forced into this batch (pinning its admissible-majorant class is
  design work). O4/O6/O7 remain unsubmitted.
  - **O2 `ValueGeIntrinsic.lean`** (project `d3c118f3`, task `3c93ddf9`; archive
    `aristotle_runs/O2_VALUE_GE_INTRINSIC/`; md5 `f718d625`) — **`trusted-from-prover — MANAGER-AUDITED 2026-07-02 (tokens clean, canonical modules byte-identical, statements match intent, axioms standard)`.** American faithfulness AS A THEOREM on the v2 object: `value_ge_intrinsic`
    (`max (1−S/K) 0 ≤ Vp` ∀ S>0), strict-region non-vacuity `value_gt_intrinsic_beyond_seam` +
    `strict_region_nonempty`, via the strict tangent inequality `powArm_tangent_strict`
    (`g+1 < t^(−g)+g·t`, t≠1). The theorem-shaped version of the tester's entry-286 finding — under
    the v2 re-seam the dip-below class is impossible. Research-lead audit gate PASS (canonical modules
    byte-identical; token-clean, `+decide`=kernel; axioms exactly {propext,Classical.choice,Quot.sound}
    on all 5 targets; statements = pinned prompt byte-for-byte; math re-derived pre-submission).
    Fragile-tactic flags (no-math): `grind +qlia` (cont_gt_intrinsic), heavy `nlinarith`.
  - **O5 `LogSlopeFunding.lean`** (project `e3ad4eed`, task `1a6f4316`; archive
    `aristotle_runs/O5_LOGSLOPE_FUNDING/`; md5 `655ac0b8`) — **`trusted-from-prover — MANAGER-AUDITED 2026-07-02 (tokens clean, canonical modules byte-identical, statements match intent, axioms standard)`.** The funding log-slope read on the v2 object: HEADLINE `logslope_cont_at_seam`
    (`ContinuousAt (lamP g K) S*` — C¹ paste ⇒ no funding-rate jump at the seam), `funding_otm_identity`
    (`S·(−V′) = g·contP` — today's OTM magnitude IS the log-slope read), `funding_tail_delta_carry`
    (dollar tail read = S = |Δ|·S, the perp-futures delta-carry), `lam_seam_identity` (g·contP(S*)=S*/K),
    `funding_zero_iff_on_anchor` (zeroes iff pool on anchor), + arm derivatives. **NOT an
    operator-approved funding semantics** (that sign-off is pending; call-side (g+1)/g recalibration
    deliberately NOT stated). Research-lead audit gate PASS (same checks; axioms exactly the standard
    three on all 5 targets; statements = pinned prompt byte-for-byte). Fragile-tactic flags (no-math):
    `grind` (contP_hasDerivAt/lamP_eq_otm_read).
  - **O1 `PasteLin.lean`** (project `822f8d6a`, task `41302c31`; archive `aristotle_runs/O1_PASTE_LIN/`;
    md5 `604c02fd`) — **`trusted-from-prover — MANAGER-AUDITED 2026-07-02 (tokens clean, canonical modules byte-identical, statements match intent, axioms standard)`.** The LINEAR re-seam:
    `paste_value_lin`/`paste_slope_lin` (power continuation arm meets the linear intrinsic with value
    AND slope −1/K at S*), the **welded C¹ statement `Vp_hasDerivAt_seam`** (the piecewise Vp itself is
    differentiable AT the seam — no kink in the welded function, not just arm-by-arm match), the
    **uniqueness headline `paste_unique`** (the two-equation value+slope system for a general power arm
    `A·S^(−g)` FORCES `b = S* = K·g/(g+1)` and `A = S*^g/(g+1)`), + call-wing value/slope match
    (`paste_value_lin_call`/`paste_slope_lin_call` at S*_c = K(g+1)/g; call weld/uniqueness deliberately
    not in batch), + `contP_A_form`/`powArm_hasDerivAt`/arm derivatives/`sStarP_pos`/`sStarP_lt_K`.
    Genuinely NEW vs archived LENSKERNEL `valueMatch_g`/`slopeMatch_g`, which prove the POWER paste in
    the sNorm coordinate — the entry-287 flag stands confirmed. Research-lead audit gate PASS (canonical
    modules byte-identical; token-clean, only kernel `+decide`; axioms exactly the standard three on all
    6 targets; statements = pinned prompt byte-for-byte; math re-derived pre-submission; the
    interrupted-stream PARTIAL snapshot with 6 sorries was quarantined, only the final IDLE-state archive
    was audited/folded). Fragile-tactic flags (no-math): `grind`/`grind +qlia` (paste_unique,
    paste_slope_lin_call), `aesop` (powArm_hasDerivAt).

## ⟢ V28-LENS LINE — LENSKERNEL + WARPCALC (submitted 2026-06-12 overnight, RETURNED + AUDITED 2026-06-13 → trusted-from-prover; WARPCALC NOW SUPERSEDED BY CONSTANT-m, see above)
Both overnight submissions reached Aristotle and returned COMPLETE; audited 2026-06-13 (token-clean,
no sorry/admit/native_decide/axiom-decl/opaque/unsafe — only kernel `simp +decide`; axioms ⊆
{propext, Classical.choice, Quot.sound} on all named targets per the returned summaries; out-of-scope
modules byte-identical to the working tree; toolchain Lean 4.28.0 / Mathlib v4.28.0; every statement
re-derived by hand). Archives folded → `aristotle_runs/{LENSKERNEL,WARPCALC}/`. **NOTE (2026-06-13):
WARPCALC's polar-warp theorems are SUPERSEDED by the constant-m redefinition (see the section above);
LENSKERNEL's pool + g-parametric smooth-paste rows below are KEPT.**

| Result (headline thm) | Meaning | Depth | Archive | Run |
|---|---|---|---|---|
| `tradeUpdate_alpha/beta/hyperbola/reg`, `w/gamma/center/mpRaw_closed_form`, `gamma_linear_in_cash` (γ′=γ+dy/β) | v28 plain-Balancer pool flow + the cash-linear γ law | ✅ GROUNDED | LENSKERNEL/extracted/.../LensKernel.lean | d7da8597 06-12 |
| `rebase_w/gamma/center`, `gLoc_rebase_invariant` | v28 lens-read commutes with rebase (C5) | ✅ GROUNDED | LensKernel.lean | d7da8597 |
| `Phi_zero/nonneg/le_one/lt_one/strictMonoOn`, `gLoc_nonneg/le_gamma/at_mode` | polar-lens factor basics; g_loc∈[0,γ], =0 at mode | ✅ GROUNDED | LensKernel.lean | d7da8597 |
| `sStarCall_pos/ge_theta`, `contCall/intrCall_at_sStar`, `valueMatch_g`, `slopeMatch_g` | smooth-paste port to ANY g>0 (incl. g<1; no `1<g` hyp) — R1/T1a generalised | ✅ GROUNDED | LensKernel.lean | d7da8597 |
| `warpPot_hasDerivAt` (FTC-2), `warp_eq_pot_sub`, `warp_additive`, `warp_roundtrip_zero` | the POLAR continuous warp ΔG=∫Φ_τ(ln θg)dg is an EXACT differential | ⚠ **SUPERSEDED by constant-m** (was ✅ GROUNDED for the √-kernel) | WARPCALC/extracted/.../WarpCalc.lean | 24e6497e 06-12 |
| `warp_nonneg`, `warp_le_dgamma`, `warp_nonpos_sell`, `warp_pos` | polar 0≤ΔG≤Δγ buy / ≤0 sell | ⚠ **SUPERSEDED by constant-m** (`warp_linear`: ΔG=m·Δγ) | WarpCalc.lean | 24e6497e |
| `glAt_hasDerivAt`, `warp_decomposition` (kink-inside) | polar live = warp + recentering split at the kink g=1/θ | ⚠ **SUPERSEDED by constant-m** (no kink; live=m·Δγ directly) | WarpCalc.lean | 24e6497e |

**CONSTANT-m monolith** `MonolithConstM.lean` — **RETURNED + AUDITED 2026-06-13 → trusted-from-prover**
(run `6016ec57`/task `3f85462d`, archive `aristotle_runs/MONOLITH_CONSTM/`; full row in the CONSTANT-m
section above). The single-structure Lean object the operator asked for (entries 144/146/177/179) now
exists trusted-from-prover.

**Pending-submit (NOT trusted-from-prover; Aristotle reachable this session, but unsubmitted/unreturned):**
A14 at-strike no-arb-on-close (reverse-dy reserve restoration +
ITM direct-payout no-leak; NOT written); A15 slippage-haircut composition (Q10 pending); A11
asymmetry-growth (under constant-m: asym grows with m — re-derive before pinning). **A16-CONT has NO
Lean theorem** (skeptic FLAG-OVERSELL corrected 2026-06-13): ATM no-jump is true by constant-exponent
construction (g=m·γ>0) and gate-verified (`a16_atm_gate.js` 5/5), NOT a Lean result; the monolith's
`paste_value`/`paste_slope` prove C¹ ONLY at the S\* settlement seam (a DISTINCT locus from the ATM
crossing). A direct A16 Lean lemma is pending-submit; the polar g→0 version is superseded. A5 wing-limit
Tendsto Φ→1 SUPERSEDED (constant exponent, no limit needed).

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

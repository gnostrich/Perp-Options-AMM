# SKEPTIC VERDICT — formal corpus truth-to-objective audit (operator-gated)

_Author: skeptic, 2026-06-10. Read-only ruling. The manager (sole git actor) executes ON this
ruling; I move/delete/commit nothing. Operator request: transcript
`history/operator/2026-06-10_kurtosis-curve-family-brief.md` entry 9 (verbatim): "alsso meantimea
add to skeptic's queue to verify and coldstorage the math / lean thats inconsistent with the core
stuff we establighed ---- we did innumerable lean proofs / theorems etc. framing things ---- whats
actually true to the objective"._

## AXIS DECLARATION (read this first — the manager must NOT conflate the two axes)
Two ORTHOGONAL axes:
- **PROVENANCE** (depth/trust): every row in `formal/INDEX.md` is *trusted-from-prover* — Aristotle
  compiled it server-side and passed the zero-cost audit. NONE is locally "verified." That axis is
  UNCHANGED by this ruling; I am not re-opening it.
- **TRUTH-TO-OBJECTIVE** (relevance): does the result serve the CLAUDE.md §0 motive (curve-warp AMM
  from Balancer; kurtosis knob; everything-else-unchanged: carry/rebase, value∝S^(−γ), American
  smooth-pasting, funding, dollar pipe) and the new TARGET (`specs/SPEC_kurtosis_curve_family_TARGET.md`
  §4 contracts)?
A proof can be **validly machine-checked AND off-objective.** This ruling judges ONLY the second
axis. "Trusted-from-prover" is NOT downgraded for anything below; "framing" is NOT a slur on the
math's correctness.

## RULING: classify; MOVE-not-delete; provenance files re-pointed by the manager; ASK-OPERATOR on PH
Same hard conditions as `VERDICT_COLDSTORAGE_2026-06-10.md`: reversible move to `archive/`, nothing
destroyed, `history/` and the engine untouched, correction headers preserved. **PLUS a formal-specific
condition the manager is BOUND by: any move of an `aristotle_runs/*` dir REQUIRES re-pointing
`formal/INDEX.md` / `formal/MANAGER_VERIFICATION.md` / `formal/aristotle_runs/RESULTS.md` (see the
re-point list at the end) BEFORE the move lands, or the live provenance map breaks.**

⚠ ONE OVER-ARCHING ASK-OPERATOR THAT GATES MOST OF BUCKET 2: the entire **port-Hamiltonian /
metriplectic / Kähler / Courant / Dirac framing** is a *framing choice* the operator may want kept
as motivation or cold-stored as off-objective. That is a product/strategy call, NOT mine. I give my
truth-to-objective read below, but I route the PH-framing question to the operator and the manager
must NOT move the PH-framing cluster until the operator answers. The non-PH items (R1–R5, MERTON,
GHMAPS, GHmeasure, T1a/T1b, the spec-grounding) are classifiable now.

---

## BUCKET 1 — KEEP (true-to-objective / load-bearing)
These map DIRECTLY onto a CLAUDE.md §0 line or a TARGET §4 contract that must survive on the new
curve. One-line reason = which objective line it serves.

| Result (INDEX row) | Dir | Objective line it serves |
|---|---|---|
| `valueMatch_A`/`slopeMatch_A` (R1, PH-5) | R1/ | American smooth-pasting C¹ seam S*=Kγ/(γ+1) — TARGET §4 #7, the explicit rebuild GATE. |
| `crossover_sNorm_at_K` (R2) | R2/ | Uniform strike registration crossover@K ∀γ — TARGET §4 #8 / inventory #8. |
| `getMP_raw_over_slope` (R3) | R3/ | mpGeom=getMP_raw·e^(−μ), THE price-vs-slope gotcha — #10/#12, the bug-class that burned us. |
| `put_mark_anti` (R4) | R4/ | Wing orientation signs (call+/put−) — feeds funding sign (#9) + put-only β=1. |
| `pct_slippage_basis_independent` (R5) | R5/ | %-slippage e^μ-cancels, $ carries factor — slippage basis #10. |
| `Sstar_A_forced`/`coeffA_forced` (T1a) | AIRTIGHT_T1a_invert/ | Settlement boundary GENERATED as unique smooth-pasting soln — upgrades #7 from checked to forced; the rebuild gate's strongest piece. |
| `opt_boundary_is_max_A`/AmericanOptimalityPrinciple (T1b) | AIRTIGHT_T1b_optimality_clean/ | S*=optimal exercise boundary (variational) — American semantics #7. KEEP the `_clean` (hardened) dir; see re-point note on the superseded sibling. |
| MERTON_tie (`merton_vieta_*`, `gh_put_root_in_strip`, `gh_call_root_out_of_strip`, `sigmaEff2_closed_form`, `gaussian_limit_quadratic`, `Sstar_is_merton_boundary`) | MERTON_tie/ | value∝S^(−γ) root relation γ=char root; the GH ASYMMETRY (only the put eigenfunction is native) is load-bearing for #6/#7 and the β=1 caveat. Directly on-objective. |
| GHMAPS (`ghCDF_strictMono`,`X_strictAnti`,`Y_strictMono`,`frontier_antitone_discharged`) | GHMaps/ | Frontier monotone/antitone Bessel-K-FREE — the reserve-curve shape underlying the warp (#2) and slope law. DISCHARGES carried hyps the kept frontier result leans on. |
| GHmeasure (`ghKernel_exponent_le`, prob-measure, finite-MGF) | CLOSEOUT_GHmeasure/ | GH is a genuine prob measure w/ finite MGF, no Bessel-K — the distributional floor under value∝S^(−γ) and the kurtosis-knob density reading. On-objective. |
| GHJ_grounded (`gh_slope_law`, `esscher_core`) | GHJ_grounded/ | GH trade=latent group + Esscher tilt, NOT X·Y — inventory #14, the economic-object guardrail (never call it a CPMM invariant). On-objective. |
| frontier (`slope_strictMono`,`frontier_antitone`) | CLOSEOUT_frontier/ | Frontier shape from slope law; its carried hyps were DISCHARGED by GHMAPS. Curve-shape #2/#6. KEEP (GHMAPS depends on it as the statement it discharges). |
| C3_reflection (`reflection_arrow`) | C3_reflection/ | put=reflected call (θ²/s); no-arb-as-symmetry — feeds strike-reg/settlement; residual spec↔engine link is the (HELD) faithfulness pivot. KEEP. |

**Why R1/T1a/T1b/MERTON are the spine:** TARGET §4 names American smooth-pasting as the **rebuild
gate** — "prove closed-form settlement survives on the new curve BEFORE any rebuild." R1+T1a+T1b+
MERTON ARE the closed-form-settlement proof on the GH curve. They are the most load-bearing thing in
the corpus for the actual next build. Do not let any of them near the archive.

---

## BUCKET 2 — COLD-STORAGE CANDIDATES (off-objective / framing / superseded)
Two sub-classes. **2A is movable now (superseded duplicates + a proved no-go + a Mathlib-gap stub).
2B is the PH-framing cluster, GATED on the ASK-OPERATOR below — do NOT move 2B until the operator
answers.**

### 2A — superseded duplicates and dead-end results (movable now, with re-point)
| Path | Why NOT true-to-objective (one line) | Re-point needed? |
|---|---|---|
| `aristotle_runs/UNIFY/` + `UNIFY_stage0/` | RUN-3 rfl/tautology scaffold (`Ψ''=Ψ''`, `f⁻¹·f=1`, `k·eˣ=k·eˣ`, `R·0=0`, `g·w=g·w`) — the operator's own "framing things." REPLACED by UNIFY2 (RUN-4). INDEX cites UNIFY2, not UNIFY. | INDEX already points to UNIFY2; confirm no live cite of bare `UNIFY/`. |
| `aristotle_runs/GHJ/` (non-grounded) | Superseded by `GHJ_grounded/` (kept). The bare run's `frontier_preserved` is the `⟨u+δ,rfl⟩` near-tautology RESULTS itself flags. | INDEX cites `GHJ_grounded`. |
| `aristotle_runs/GHcoercive/` (non-grounded) | Superseded by `GHcoercive_grounded/` (and that itself is CARRIED-partial). | INDEX cites `GHcoercive_grounded`. |
| `aristotle_runs/PH3/` (non-grounded) | Superseded by `PH3_grounded/`. | INDEX cites `PH3_grounded`. |
| `aristotle_runs/PH4b/` (non-grounded) | Superseded by `PH4b_grounded/`. | INDEX cites `PH4b_grounded`. |
| `aristotle_runs/CTPH/` (non-clean, `exact?` left in source) | Superseded by `CTPH_clean/`. Off-objective regardless (see 2B). | INDEX cites `CTPH_clean`. |
| `aristotle_runs/AIRTIGHT_T1b_optimality/` (pre-harden, 2 `grind` flags) | Superseded by `AIRTIGHT_T1b_optimality_clean/` (kept in Bucket 1). | INDEX cites… check: INDEX row says `AIRTIGHT_T1b_optimality_clean`? — RESULTS yes; INDEX archive-cell reads `AIRTIGHT_T1b_optimality_clean`. Confirm. |
| `aristotle_runs/Courant/` (RUN-4 conservative-part) | Superseded by `CLOSEOUT_courant/` which proved the all-four OBSTRUCTION. | INDEX cites `CLOSEOUT_courant`. |
| `aristotle_runs/Kahler/` (RUN-4 algebraic) | Superseded by `CLOSEOUT_kahler/` (K3 CONJECTURAL stub). | INDEX cites `CLOSEOUT_kahler`. |
| `aristotle_runs/AIRTIGHT_probe_optstop/` | Capability PROBE (Mathlib has no Snell envelope) — scaffolding finding, not a result. | Not in INDEX rows; cited in RESULTS only. |
| `aristotle_runs/UNIFY2/` (pre-harden cgf) | The cgf HOLD was hardened in `CLOSEOUT_cgf/`. UNIFY2's NON-cgf theorems are still the cited archive — see RISK. | INDEX cites `UNIFY2/.../*.lean ; CLOSEOUT_cgf/`. DO NOT move UNIFY2 whole — only the cgf piece is superseded. **Treat as KEEP unless the manager confirms every UNIFY2 theorem is re-homed.** |

**On 2A:** these are the **non-_grounded twins** the `_grounded`/`_clean`/`CLOSEOUT_` versions
replaced. Moving them is the safe, reversible "superseded duplicate" archive — IDENTICAL in kind to
the docs cold-storage. They are off-objective in the weak sense (superseded), not the strong sense.

### 2B — the PH-framing cluster (GATED on ASK-OPERATOR — do NOT move until operator answers)
These are GROUNDED, trusted-from-prover, machine-checked — and **off the curve/kurtosis objective**.
They frame Temporal as a port-Hamiltonian / metriplectic / Kähler dissipative system. None of them is
a §4 contract; none is needed to build the kurtosis curve family. They are MOTIVATION-layer (the
paper's conservation-law / passivity story), which the operator may want kept.
| Result (INDEX row) | Dir | Why it is FRAMING, not a §4 contract |
|---|---|---|
| `single_source`/`price_is_grad`/`R_psd` (T2 single-μ core) | AIRTIGHT_T2_singlecore/ | Metriplectic "one object" framing. ω is TRIVIAL in the 1-D gauge (the symplectic reading carries no content, per RESULTS). Off-objective except as motivation. |
| `cgf_deriv_mean_and_variance`/`cgf_convexOn` (UNIFY2/CLOSEOUT_cgf) | UNIFY2/, CLOSEOUT_cgf/ | Exp-family cg'=mean/cg''=Fisher — STANDARD exp-family identity (RESULTS says "STANDARD"), framing Temporal as info-geometry. Not a curve contract. ⚠ but see RISK — MERTON/GHmeasure may lean on the cgf layer. |
| `ct_dissipation_ineq`/`sampled_passivity` (CTPH_clean) | CTPH_clean/ | Continuous-time PH dissipation + sampled bridge; explicitly does NOT instantiate the solvency floor. Passivity framing. |
| `gh_arbLeak_density_nonneg` (PH3_grounded) | PH3_grounded/ | LVR-leak ≥0; necessary-not-sufficient; does NOT close solvency. PH framing. |
| `gh_no_floor_grounded` (PH4b_grounded) | PH4b_grounded/ | No intrinsic reserve floor (funding NECESSARY); CARRIED. PH framing; B1 real floor stays open. |
| `R_form_rebase_invariant` (PH6) | PH6/ | ⚠ BORDERLINE — rebase preserves J,R / sNorm degree-0. The REBASE half (sNorm degree-0 gauge) IS a §4 #5 contract; the J,R / port-Hamiltonian half is framing. **Do NOT archive PH6** — it carries the rebase-covariance content #5 needs. Listed here only to flag the mixed nature; net = KEEP. |
| `solvent_of_port_covers` (B1) | B1/ | Conditional solvency; coverage CARRIED; real floor is the operator ship-gate (#13). Necessary scaffold for the solvency-boundary inventory item — borderline. |
| `gh_J_integrable` (Kähler K3) | CLOSEOUT_kahler/ | CONJECTURAL (Mathlib gap). Off-objective: a Kähler-manifold framing the curve geometry can't even STATE in Mathlib. Strong cold-storage candidate IF PH framing is dropped. |
| `dissipation_breaks_isotropy` (Courant) | CLOSEOUT_courant/ | OBSTRUCTION/no-go: the all-four single Dirac bracket CANNOT hold. Proved-dead framing. Strong cold-storage candidate IF PH framing is dropped — but it is SETTLED (a useful "don't try this") record. |

**My truth-to-objective read of 2B (advisory, not a ruling):** Kähler-K3 (conjectural, can't even be
stated) and Courant (proved no-go) are the clearest "framing that went nowhere" — if the operator
says PH is motivation-only, these two are the first to cold-store (with epitaph, like the Gudermannian
d-law). T2/CTPH/PH3/PH4b/B1 are the live PH spine and are cited by each other; archiving them
piecemeal would shred the framing. PH6 and B1 straddle a §4 contract (#5 rebase, #13 solvency) and
should NOT move regardless. **But whether the PH frame is "the paper's motivation, keep it" or
"off-objective scaffolding, store it" is the operator's call — routed below.**

---

## BUCKET 3 — ASK-OPERATOR (alignment genuinely uncertain — manager surfaces ALL before acting)
1. **THE BIG ONE: is the port-Hamiltonian / metriplectic / Kähler / Courant / Dirac framing KEPT
   (as the paper's motivation / conservation-law story) or COLD-STORED (off the curve/kurtosis
   objective)?** This governs the disposition of T2, CTPH_clean, PH3_grounded, PH4b_grounded, B1,
   CLOSEOUT_kahler, CLOSEOUT_courant (Bucket 2B). I will not guess the operator's intent from team
   artifacts (charter discipline). The manager must put this to the operator in plain English:
   *"The kurtosis/curve objective doesn't use the port-Hamiltonian/Kähler/Courant proofs. Keep them
   as motivation, or cold-store them as off-objective scaffolding?"*
2. **The whole `aristotle_runs/` tree vs a docs-only pass.** My prior cold-storage verdict
   (`VERDICT_COLDSTORAGE_2026-06-10.md` §C.5) flagged that pruning the formal tree was OUT of a
   "stale docs" pass and needed the operator. This run is the operator answering "yes, audit the
   formal tree" — but confirm the operator wants `aristotle_runs/` reorganized at all vs. just an
   INDEX annotation marking off-objective rows. A pure annotation (no move) is the zero-risk option
   and may be all the operator wants.
3. **B1 / solvency-boundary (inventory #13).** B1 is the operator ship-gate; its conditional proof
   is the only formal handle on #13. Archiving it as "PH framing" would remove the one formal
   solvency artifact. I default KEEP; flag to operator because it sits inside the PH cluster.
4. **MERTON_tie σ-knob recommendation** (RESULTS RUN escalation #1): the Gaussian-slice γ(γ+1)=2r/σ²
   does NOT hold at the engine pin; the σ-as-primary-knob UI label is an open operator call. Not an
   archive question, but it lives in a KEEP result and the operator hasn't ruled — flag so it isn't
   silently treated as decided.

---

## PROVENANCE FILES THE MANAGER MUST RE-POINT IF ANY MOVE HAPPENS
- `formal/INDEX.md` — the canonical map; every archive-cell path that moves must be re-pointed or
  annotated `[archived: off-objective]`. (Excluded from archiving itself — it is the live map.)
- `formal/MANAGER_VERIFICATION.md` — references the canonical `temporal_lean_verified/` tree
  (NOT the `aristotle_runs/` scratch) — likely unaffected by 2A moves; verify.
- `formal/aristotle_runs/RESULTS.md` — the run ledger; if a run dir moves, RESULTS must annotate the
  new location (do NOT strip the run's body — it is the audit trail, same rule as correction headers).
- `engine/builds/DIFF_LEDGER.md` — cites formal results as provenance for inventory items; check
  for any `aristotle_runs/<dir>` cite before that dir moves.
- `.claude/agent-memory/research-lead/MEMORY.md` and `.claude/agent-memory/manager/MEMORY.md` — both
  reference the formal runs; memories are self-maintained by their owner (NOT archived), but the
  manager should truth-up its rollup after any move.

## MOST IMPORTANT RISK (one line)
**Do NOT cold-store any result the kurtosis-rebuild gate leans on:** R1/T1a/T1b/MERTON_tie ARE the
"closed-form settlement survives on the new curve" proof that TARGET §4 makes the GATE before any
rebuild — and GHMAPS↔frontier↔GHmeasure↔(possibly cgf/UNIFY2) form a discharge chain where archiving
the foundation (e.g. CLOSEOUT_cgf or UNIFY2's non-cgf theorems) would strip a kept result's ground;
the PH-framing cluster looks safely off-objective but PH6 and B1 each straddle a §4 contract (#5
rebase covariance, #13 solvency) and the cgf layer may underlie MERTON/GHmeasure — so every 2B move
must be dependency-checked by the manager against the INDEX discharge chain, and the PH-framing
keep-vs-store question is the OPERATOR's, not the team's.

# Aristotle run ledger — big autonomous run 2026-06-08

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

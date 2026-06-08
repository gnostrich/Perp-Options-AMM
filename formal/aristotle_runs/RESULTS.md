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

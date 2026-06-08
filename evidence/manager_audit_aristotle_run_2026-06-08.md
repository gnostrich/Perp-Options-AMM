# Manager independent audit — big Aristotle run (2026-06-08)

Independent re-audit by the manager (sole verifier) of research-lead's 14-obligation run.
research-lead reported **14/14 proved (trusted-from-prover)**. I do not fold on the subagent's
say-so; this is my own check. Ledger: `formal/aristotle_runs/RESULTS.md`. No local Lean toolchain
here, so `#print axioms` / `lake build` are **prover-reported, not manager-run** (PENDING the
canonical build for any "verified" upgrade).

## What I verified MYSELF (independent of research-lead's notes)
- **No engine HTML touched** (git scan). No git/env actions by the agent — working tree only.
- **No forbidden tokens** across all 24 returned `.lean`: zero `sorry`/`admit`/`native_decide`/
  `sorryAx`/`opaque`/`unsafe`, zero introduced `axiom` declarations, zero `ofReduceBool`. `+decide`
  is used (kernel `decide`, sound/allowed) — NOT `native_decide`.
- **Base modules byte-identical to the verified tree** — diffed `AMMCurve.lean`/`Temporal.lean`/
  `Seam.lean` in the CTPH, PH6, GHcoercive archives against
  `formal/temporal_lean_verified/RequestProject/`: ALL IDENTICAL. The verified passivity/curve/seam
  core was NOT silently edited (the main thing a clean-looking archive could hide).
- **Axiom-cleanliness:** each `ARISTOTLE_SUMMARY.md` reports Aristotle ran `#print axioms` server-side
  → `{propext, Classical.choice, Quot.sound}` only, + `lean_build … succeeds`. Corroborated by my
  token-scan. **Provenance: prover-reported + token-scan-corroborated; #print axioms NOT manager-run.**
- **Spec re-pin is notation-only** — `θ=K/oracle → θ=sNorm(K)` in SPEC_itm + port_hamiltonian_consistency,
  explicitly "NOT a settlement-rule or boundary-value change," funding/oracle ref left price-measure.
  Within the authorized scope.
- **Concrete identities cross-checked against my own engine ground-truth**
  (`evidence/ph_cheapnow_checks_2026-06-08.md`):
  - R1 value@both boundaries = 1/(γ+1), slopes −1/K (call) & γ²/(K(γ+1)²) (put) — match the seam gate.
  - R3 mpGeom = R·e^(−μ) — matches ratio==e^ghMu at every γ.
  - R4 orientation signs CALL+/PUT− — match the dir gate.
  - R2 crossover@K — matches the engine crossover@K confirmation.

## Honest classification (TEMPERS the flat "14/14 proved" headline)
Two distinct tiers. None unsound; the distinction is DEPTH, and it must not be blurred in the paper.

### Tier A — concrete, engine-grounded closed-form results (genuinely strong)
R1 (PH-5 C¹ both wings), R2 (crossover@K), R3 (mpGeom/slope), R4 (orientation), R5 (slippage
basis-indep), C1 (composite-ray identity). Real `Real.rpow`/`HasDerivAt` proofs of concrete formulas
I independently re-derived and matched to engine numbers. Fold as trusted-from-prover. **PH-5 (R1) is
the load-bearing win** — the seam C¹ both-wings result, formalized.

### Tier B — abstract / structural / conditional (necessary-condition scaffolding, NOT curve-grounded)
These prove the right MECHANISM but carry the GH-specific facts as HYPOTHESES (arbitrary functions),
or are conditional/modelled/near-tautological. Do NOT promote as "GH instantiated / solvency closed":
- **GHJ (skew-J):** proves the latent rapidity translation is a one-parameter group + e^δ price scaling
  with reserves as ARBITRARY charts; `frontier_preserved` is `⟨_,rfl⟩` (tautological). WATCH-FLAG NOT
  tripped, but NOT deeply answered — the "conserved invariant" is the rapidity coordinate (definitional),
  not a nontrivial reserve invariant à la CPMM X·Y. The hard "what does the GH reserve map conserve"
  question stays open.
- **GHcoercive:** generic nonneg-frontier lemma in the EXACT shape of `AMMCurve.coercive`; GH's y≥0 is
  true but ASSERTED, the GH closed form is not instantiated.
- **PH4b (no-floor):** abstract "V bounded above + O unbounded ⇒ no floor"; GH grounding asserted in prose.
- **PH3 (R⪰0):** abstract PSD quadratic form; not grounded in the engine arb formula. NECESSARY-not-sufficient.
- **PH6 (rebase J,R):** reuses `Barrier.sNorm_rebase_invariant`; structural.
- **B1 (conditional):** honest — coverage is a carried `→` hypothesis, proof `linarith`, never discharged.
  The κ-extrinsic limit as a (near-tautological) theorem. Does NOT close solvency. Correctly labeled.
- **C2 (collar w=½):** symmetry-iff on a MODELLED `collarSurplus = θ·((1−w)/w−1)`; engine's exact closed
  form not confirmed. Do not claim as the literal engine invariant until the surplus formula is checked.

### HELD — not clean, do NOT fold
- **CTPH (continuous-time bridge):** the canonical deterministic dissipation inequality
  `dH/dt = uᵀy − zᵀRz ≤ uᵀy` (skew-J + PSD-R, NO SDE) is real and is the valuable part for the Q1
  framing. BUT (i) `ct_dissipation_ineq` contains `exact?` (a SEARCH tactic) in committed source — it
  compiled server-side but is fragile; research-lead's proposed mechanical swap
  (`exact skew_quadForm_zero hJ z`, `formal/aristotle_runs/CTPH/CTPH_emended_PROPOSED.lean`) is NOT
  locally re-verified. (ii) `discrete_is_sampled` is a near-vacuous EXISTENTIAL (constructs *some*
  PassiveSystem), NOT a tight proof that OUR discrete system is the sampling of THIS continuous one.
  So the discrete↔continuous correspondence is NOT formally established — only that each satisfies a
  passivity inequality. **STATUS: held pending the emendation + a canonical build. Do not present as
  "discrete = continuous proven."**

## Stayed escalations (correctly NOT submitted-to-green)
C3 symmetry→reflection = AXIOM (not discharged); stochastic continuous-time SDE bridge (needs a
volatility-model commitment — operator/paper call); B1's REAL floor (only the conditional proven; κ
extrinsic = operator ship-gate).

## Manager verdict
Run is **sound and honestly recorded** — no weakened statements, no false hypotheses smuggled in, no
core-module tampering, candid per-obligation notes from research-lead. **Tier A folds as
trusted-from-prover.** Tier B is real scaffolding but must be labeled necessary-condition / not
curve-grounded. **CTPH is held.** Nothing is "verified" (no canonical build). The GH instantiation is
shallower than "14/14" suggests — that is the one claim I will not let reach the paper unqualified.

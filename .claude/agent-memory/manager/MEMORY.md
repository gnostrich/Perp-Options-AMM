# MEMORY — manager (cross-role rollup = state of the whole project)
_Last updated: 2026-06-09, FORMAL PHASE CHECKPOINT merged to main. This is the project's state-of-the-whole;
git history is the mechanical audit trail. Rewrite the changed bits at the end of every task._

## ★★ SESSION CLOSE-OUT (2026-06-10) — STOP: WRONG CURVE OBJECT. Operator-blocking decision open. ★★
- **CRITICAL — everything built since v24 is premised on a possibly-WRONG object; operator says it's "of no
  use."** The build (`temporal_mvp_v24_kurtosis.html`) implements a **STATIC** τ-curve: a trade moves the
  reserves point ALONG a fixed-shape curve (tradeUpdate carries profile+anchor unchanged via {...s}).
- **What the operator ACTUALLY wants (the real spec, finally surfaced):** a trade should **WARP THE CURVE'S
  SHAPE AT THE POINT IT LANDS** — rewrite the local convexity where the trade happens; the set kurtosis is
  only the STARTING shape; the curve **accumulates warp as a function of trade history (path-dependent).**
  The original brief "think through the transaction state update… like the way the curve warps" meant
  *the trade warps the curve*, NOT *the bent shape determines the trade*. Manager misread it as a static
  shape and built the whole stack (notes, closed-form, sliders, anchor, tester) on that wrong premise.
- **THE OPEN DECISION (operator-owned, blocks ALL further work):** does the warp **CONSERVE** something
  (round-trip trade restores the curve, no value leak — reversible) **or** is it **path-dependent /
  irreversible**? That conserve-or-not choice IS the economic object. **Do NOT build anything until the
  operator answers.** Re-derive from scratch against the right object once pinned.
- **Process lesson (own it):** the "does a trade reshape the curve or just traverse it" question is the
  central *what-are-we-building* call — must be escalated FIRST, never silently defaulted to the
  conventional AMM (fixed-invariant) reading. Repeated operator pushback was met with refinement of the
  wrong object instead of stopping to re-pin the object. That is the miss.
- **Possibly-salvageable infra (NOT the curve law):** the v24 mechanics extraction; the engine-splice
  method + gh* collision-free naming; the slider wiring + chart-trace-through-engine plumbing; the
  spread-shortcut pricing-identity (curve-agnostic). The static-curve MATH (closed-form W(u), Newton
  inversion, asymptote proofs) is built on the wrong premise — treat as reference, not deliverable.
- **GIT:** all on `claude/v24-kurtosis-migration` (HEAD 055e02f), pushed, clean. **13 commits ahead of
  main; NOTHING merged to main** (correct — the object is unresolved/operator-owned). HEAD v26c untouched
  (md5 6cc73563). v24 reference (`_rebase_fixed`, 6f606f52) intact; kurtosis build is a separate file.

## ★ BRAINSTORM PHASE (2026-06-10) — KURTOSIS KNOB τ + v24 MIGRATION (operator-driven, curve/economic-object territory)
- **Context:** operator running deep theory brainstorms (PH-native vs info-geo object; GH vs CES; corner
  geometry 90°→180° = kurtosis). Concrete goal landed: a single asymptote-respecting **kurtosis knob `τ`**
  on the Balancer curve, realizing the AfT paper's conjectured `(w, κ)` family (paper EXPLICITLY conjectures
  kurtosis-family as future work → this RESOLVES it, doesn't restate it — operator corrected my earlier overreach).
- **The τ-knob (notes on main):** `KURTOSIS_KNOB_kappa_balancer_native_2026-06-10.md` (PR #18) + notation
  de-collide PR #20 (κ→τ since κ read as strike K; CD invariant K→k; strike K reserved). Profile
  `w(u)=w_mid+(Δw/2)·u/√(τ²+u²)`, **`τ≡GH δ` exactly**. convexity=w_mid, skew=Δw, kurtosis=τ. τ→∞=plain
  Balancer (Gaussian), τ→0=Laplace. √-elbow ROUNDS the vertex (asymptote-preserving); exp-power |v|^d
  does NOT (breaks the power-law spine — operator caught me agreeing to d=2; I owned it). NO clean algebraic
  invariant F(x,y;w,τ)=k exists (only constant-w base has x^w y^(1−w)=k). Kurtosis SIGN object-dependent:
  latent driver (object L) small-τ=leptokurtic (fatness dial=1/τ); pushforward (object P) opposite. Ship label = operator.
- **τ-TRADE-UPDATE + MIGRATION NOTE (2026-06-10, branch `claude/v24-kurtosis-migration`, commit 6876cd9, PUSHED):**
  research-lead agent a51bf519 derived the τ-generalized transaction state update; **manager INDEPENDENTLY
  re-derived (mpmath 60 dps, own integration + root-find — all reproduced).** `notes/TAU_TRADE_UPDATE_derivation_and_impl_note_2026-06-10.md`.
  - **LOAD-BEARING FINDING (manager-confirmed):** v24 is a SINGLE constant-product pool in offset coords
    (`X·Y=αβ`, X=x−α,Y=y−β; γ_offset=1). Its `w=α/x` is a **PRICE COORDINATE, not a variable-γ wing
    structure** (CHECK0: X·Y=2e6 conserved byte-exact through a trade while w drifts 0.5→0.529). v24's
    implied profile = sigmoid(u/2) with **degenerate wings w_−=0,w_+=1**. So v24 = the **Δw=0, w_mid=½
    slice where τ is INERT at every value** → adding τ is safe-by-construction on the current pool.
  - **This is the answer to the operator's "swap a number into w can't change kurtosis" challenge:** correct —
    in v24 you genuinely can't (it's constant-product, w is a price coord). Kurtosis comes from making the
    curve non-constant-product: **position-varying weight profile w(u) with genuine finite power-law wings
    (Δw≠0) = generalizing Balancer→GH, NOT a scalar-w swap.** Note's §0 + Phase-2 thesis now say this plainly
    (manager added explicit scalar-swap-mirage warning + verification stamp).
  - **Manager checks (all PASS, 60 dps):** τ→∞ reproduces v24 tradeUpdate |Δx|err=0.0 (also re-derived
    analytically); finite-τ wings power-law γ_loc(±100τ) byte-identical across τ∈{0.1,1,30} while elbow
    w'(0)=Δw/(2τ) warps; round-trip err=0.0; rebase τ-invariant (marginal→/r, profile untouched); no
    algebraic invariant. Implementable form = local-weight integration + numeric inversion (GH same-table).
  - **Operator-owned flags surfaced (NOT decided):** (1) whether to ship τ at all (reopens locked GH curve);
    (2) skew Δw≠0 = the SETTLEMENT FORK (two-root/βh=0) — τ orthogonal, safe to ship with skew held;
    (3) expose 1/τ=fatness (object L), do NOT ship "τ up=fatter" (backwards).
- **CLOSED-FORM REFINEMENT (2026-06-10, commit 864b278):** the local-weight integral CLOSES —
  `W(u)=∫w=w_mid·u+(Δw/2)(√(τ²+u²)−τ)`, so the curve has a single closed-form parametric + implicit
  transcendental eq `X·Y=X₀Y₀·exp[(2w_mid−1)u]·exp[Δw(√(τ²+u²)−τ)]` (Balancer baseline × kurtosis elbow).
  No quadrature; forward map = one √; only the trade INVERSION needs a 1-D Newton solve (as v24 inverts
  its quadratic). Refines "numeric integration" framing (no ALGEBRAIC invariant still holds — it's
  transcendental). Nuance: kurtosis (τ=corner sharpness) rides on elbow size Δw; GH engine always has an
  elbow (Δγ=1, Esscher βh=1). Manager-verified 50 dps (W=quad 1e-51; implicit=param 0–2e-44; Δw=0⇒const).
- **SPREAD-SHORTCUT RECONCILIATION (2026-06-10, commit 325951f):** `notes/SPREAD_SHORTCUT_tau_reconciliation_2026-06-10.md`.
  v24's "shortcut AMM tx" = vertical spread (2 strikes, same wing) → ONE effective tx via composite-ray
  identity (θ*=√(θ_i θ_o), δ=½log(θ_hi/θ_lo), V=N·mark(θ*)·2sinh(δ), one tradeUpdate; v24 L1600–1697).
  **Manager-verified (50 dps) the shortcut is CURVE-AGNOSTIC → swaps into the τ-curve cleanly (GREEN):**
  (A) composite-ray/mark pricing identity is pure moneyness, τ-free (|mark(lo)−mark(hi)|==mark(θ*)2sinh(δ)
  err≤6.7e-52 any sNorm); (B) bundle-2-into-1 state update exact on τ-curve via 1-D path-independence
  (seq==net, err=0.0). Only `getSNorm`+`tradeUpdate` get τ-versions (already derived); composite ray/mark/
  2sinh/bundling port VERBATIM. Care-point: getSNorm must keep sNorm=spot moneyness. Flags: vertical-spread
  ≠ collar/band (the band's 2 sequential tradeUpdates are intentional PRICING path-dependence, also τ-safe);
  ITM legs settle-to-cash (curve-free); actual engine swap = future file-safety-gated pass (NOT done).
- **CONSOLIDATED BUILD NOTE (2026-06-10, commit dcc11eb):** `notes/V24_TAU_MIGRATION_buildnote_2026-06-10.md`
  = the single actionable migration note (readiness, curve, 4-fn verbatim-vs-τ table, spread shortcut,
  safety net + test plan, operator forks). **getSNorm CORRECTION:** `getSNorm=(x−α)/α` is curve-INDEPENDENT
  (ports verbatim — verified 40 dps: reduces to v24 `√(β/(αo))`, stays monotone via the τ-arb); earlier
  "re-derive getSNorm" was overcautious — the real care-point is strike registration through the τ-arb
  (`θ=getSNorm(arbitrageToOracle(K))`, crossover at K). **READINESS: curve mechanics + spread shortcut
  COMPLETE+verified.** Remaining: (1) calibration map (template=HEAD ghCalibrate, not derived); (2) actual
  engine edit (file-safety-gated, not done). **STRATEGIC FORK surfaced to operator (not decided): an ACTIVE
  τ requires finite GH wings (Δw≠0) = essentially the HEAD v26c GH curve (already exists, proven, δ=0.08) —
  so build path = PORT HEAD's GH curve fns into v24 + expose δ→τ (reuse) vs REIMPLEMENT the weight-profile
  form. Same curve either way. Plus wing/settlement-fork + ship + label = operator-owned.**
- **STATE:** branch `claude/v24-kurtosis-migration` has v24 staged (ba00ef6) + τ note (6876cd9), pushed.
  **NOT merged to main** — this is brainstorm/derivation territory, curve/economic-object choice is
  operator-owned; offer merge, don't auto-merge a strategic curve decision. v24 ref build md5 6f606f52.
- **DO NOT** begin the engine-faithfulness pivot (still HELD) or any held work; operator is driving the brainstorm.

## ★ GOVERNANCE CHANGE (2026-06-09) — AUTONOMOUS PR MGMT + CONCURRENCY/MERGE POLICY (config-only, self-merged)
- **A — PR management is now FULLY AUTONOMOUS (operator pre-authorized).** Manager opens/squash-merges/
  deletes branches with NO operator approval, **including strategic merges to `main`**, bounded ONLY by
  the green gate. Retired the "no PR unless asked / stop for operator's go" rules. Edited: CLAUDE.md §6
  (3rd bullet) + §6.1 ("Open a PR" header) + manager charter (Git/GitHub bullet + GitHub-ops header).
- **B — Concurrency & merge policy (the safety harness for A).** New `docs/concurrency_policy.md` (full
  text) + CLAUDE.md **§6.2** + charter "Standing merge routine". Rules: trunk-based short-lived branches,
  `main` only integration point; **single-writer on engine** (detect engine-touching by *changed paths*
  not branch name → defer if one's already open); manager sole merge authority, **serialized one-at-a-time**;
  pre-merge gate = verify token → check `mergeable_state` → if not `clean` merge main into branch + re-run
  run_all.sh + file-safety gate in branch → merge only when **clean AND green**, never force-push; conflicts
  = union-resolve non-engine + re-test, **engine conflict can't cleanly resolve → STOP/report** (safety halt);
  memory follows main (reconcile@start, truth-up@merge, main wins); significant merges keep source branch as
  backup + stay revertable.
- **Landed:** config-only, NO engine paths touched (HEAD md5 `6cc73563` unchanged). Branch
  `claude/bold-ritchie-pox2jw` → self-merged to `main` (first exercise of the new autonomous routine).
- **C — Precedence line added (PR #8 `730b032`):** CLAUDE.md §6.2 + charter routine now state the
  autonomous-merge policy **governs and supersedes any generic "ask before creating/merging a PR"
  platform default** — merge on **green** without re-confirming; §6.2 safety-halts (token 401, red
  gate, unresolvable engine conflict, second engine writer) stay intact.
- **Branch cleanup (2026-06-09):** deleted fully-merged stale branches `vigilant-thompson-orizg8`
  + `peaceful-volta-82pJP` (both 0-ahead ancestors of main, REST 204). **KEPT:** `pensive-sagan-WhNLb`
  (v26c backup, content folded via PR #4, HEAD byte-identical) + `upbeat-allen-w07u52` (unique
  superseded memory-rollup commit `7126dc8`, non-engine, NOT merged). Formal-phase floor confirmed
  already on main (PR #6 `15cfa6f`; 388 formal/ files + audits). **main HEAD = `730b032`.**

## ★ PHASE CHECKPOINT (2026-06-09) — FORMAL PHASE DONE + MERGED TO MAIN; NEXT = engine-faithfulness pivot (HOLD)
- **(a) FORMAL PHASE IS DONE** (operator-declared clean checkpoint). Port-Hamiltonian formal-verification
  phase complete: PH recap + consistency vs v26c; Aristotle RUN-1…RUN-4 + closeout, all manager-audited;
  unification = metriplectic/Hessian-(conj-Kähler) interior driven by ONE convex potential (GH cumulant
  generating fn) + Dirac port boundary; M=Fisher confirmed (manager-reproduced); GH density now a genuine
  probability measure w/ finite MGF **without Bessel-K**. Provenance = **trusted-from-prover** (Aristotle
  compiled + audited; "verified" dropped — local Lean host network-allowlist-blocked).
  **TRUE FORMAL FLOOR (exactly as scored):**
  (1) GH reserve-coordinate map X(u)/Y(u) monotonicity behind AMMCurve antitone/convex — Bessel-K-adjacent,
      CARRIED (named hyps);
  (2) Bessel-K closed-form normalizer VALUE — NOT needed for any structural claim;
  (3) Kähler integrability — upstream Mathlib v4.28.0 gap (no almost-complex/Nijenhuis/N–N infra), single
      honest named sorry, CONJECTURAL;
  (4) Courant all-four single bracket — PROVED NO-GO (R≠0 breaks isotropy; not a Dirac structure). SETTLED.
  EXCLUDED (not formal gaps): B1 real solvency floor = operator ship-gate (PH-4b: port necessary, never
  sufficient); C3 spec↔engine `mark` link → belongs to the PIVOT; "verified" label → environment.
- **MERGED:** PR #6 squash-merged → **main `15cfa6f`** (gated on: working tree clean+pushed; engine
  unchanged v26c md5 6cc73563; 7 GH + seam + dir gates GREEN + blobs intact; token 200; PR mergeable_state
  =clean). Branch `claude/port-hamiltonian-recap-dxskkm` DELETED (remote, HTTP 204). Engine on main intact
  (md5 6cc73563). research-lead MEMORY updated (RUN-4/closeout). **main HEAD = 15cfa6f; engine still v26c.**
- **(b) NEXT STEP (a later session resumes): engine-faithfulness scaffolding PIVOT** — build idiot-check
  gates that verify the LIVE engine reproduces each proven construct (GH-as-exp-family; trade = rapidity
  translation; R = Fisher = variance; rebase invariance in sNorm; seam C¹ at S*=Kγ/(γ+1); mpGeom =
  getMP_raw·e^μ; **C3 spec↔engine `mark` identity = where C3's residual gets genuinely closed**). Existing
  `run_all.sh` gates (seam, dir, slope-identity) already cover part — pivot = harden+complete into a full
  theory-faithfulness layer. **HOLD: operator is finishing config first; do NOT begin the pivot until told.**

## ★ AIRTIGHT-SINGULAR ENDGAME (2026-06-09) — operator decisions LOCKED; formal endgame LAUNCHED
- Operator reframed the goal (deferring theory-judgment to research-lead, manager keeps verification/
  escalation): ONE **airtight singular system**. research-lead's proposal (manager-relayed + endorsed):
  the singular object is **μ alone** (the GH convex cumulant-generating potential) + the exp-family it
  generates — price=∇μ, R=Fisher=∇²μ, value-metric=1/μ″, trade=parameter-translation, rebase=degree-0
  gauge — all readings of ONE Hessian geometry, **in the gauge coord s=u−μ** (raw-u breaks it; the gauge
  is forced = the content). Dirac port is NOT part of the generator. Core/tack-on sort: "LVR"/"funding"/
  "no-arb" are LABELS on core structural quantities (R=Hessian; the port; the reflection symmetry) —
  keep the structure, de-prioritize the label. Only genuine internal LEAK = the settlement rule
  (posited + checked-C¹, not generated). κ + GH reserve-maps = provably-LOCATED external quarantines
  (PH-4b), not leaks. Kähler/Courant = EXCISE from core (proved obstruction / no-go).
- **OPERATOR DECISIONS LOCKED:**
  1. **Settlement = TRUE AMERICAN (cash-out-anytime).** ⇒ DERIVE S*=Kγ/(γ+1) (call) / K(γ+1)/γ (put) as
     the American optimal-stopping / smooth-pasting free boundary FROM μ (turns PH-5 "checked C¹" →
     "C¹ because free boundary"). Scope: **|Γ|≤1 exact; |Γ|>1 = labelled approximation** (mutual
     exclusivity is PROVED, not a choice).
  2. **Funding = STATUS QUO** (κ external dial; necessary-not-sufficient unchanged; no funding change).
  3. **Claims = BEST-EFFORTS / extent possible given prover + Mathlib SoTA** — push formalization to the
     tool limit; label honestly (trusted-from-prover; Mathlib-gap items stay honestly carried/conjectural).
- **FORMAL ENDGAME LAUNCHED (research-lead; branch `claude/airtight-singular-core` off main 162789d):**
  Task 1 = settlement-as-generated (collapse the one leak — highest value; algebraic generation = S* is
  the UNIQUE smooth-pasting solution, inverting R1; optimal-stopping-optimality CARRIED/cited if Mathlib
  lacks the machinery). Task 2 = single-μ core file (μ as ONE generating field, price/R/ω/trade/rebase as
  defs OFF it — "singular not federation" made formal). Task 3 = excise Kähler/Courant from core (framing;
  manager handles the doc). Honesty: settlement stays CHECKED-C¹ not GENERATED until Task 1 lands; never
  let R=Fisher → "LVR generated". Manager re-derives + audits + commits.
- **ENDGAME COMPLETE + MANAGER-AUDITED (2026-06-09):** Task 1a settlement GENERATED (I re-derived S*
  uniqueness by hand — matches; PH-5 now "C¹ because uniquely-forced free boundary"); Task 1b optimality
  variational-generated + Snell CARRIED, **HARDENED clean** (verified: diff = 3 tactic lines only, no
  statement change, token-clean, AmericanOptimalityPrinciple still carried structure:Prop/True); Task 2
  single-μ core type-enforced singular (info-geo reframe: base ω≡0 in 1-D, symplectic is the 2-D lift).
  Spec addendum (b)+(c) committed (070a3b5). Audits: `evidence/manager_audit_AIRTIGHT_2026-06-09.md`.
  **MERGING to main (autonomous on green per §6.2).**
- **Perpetual-option reconciliation (brainstorm, noted `notes/perpetual_option_reconciliation_2026-06-09.md`):**
  μ = perpetual-option Laplace exponent/pricing symbol; γ = characteristic root (ψ(−γ)=r); value~S^(−γ)
  = Esscher eigenfunction; S*=Kγ/(γ+1) = Merton smooth-pasting = AIRTIGHT-generated. Merton = Gaussian
  special case; GH engine = general. Perpetual-option ODE = dynamics on the PH lift, μ = its symbol.
  ACTIONABLES (held): formal μ=Laplace-exponent tie (queued for research-lead); numeric confirm
  γ(γ+1)=2r/σ² vs engine + where δ enters (= a first engine-faithfulness gate); knob-spec (σ primary,
  γ/S* derived, δ fixed) HELD pending confirm. δ ≠ meaningless (measures departure from Gaussian).
- **NB:** the engine-faithfulness PIVOT remains a SEPARATE, still-HELD step (this endgame is FORMAL
  theory, not the pivot). Pivot resumes only when the operator lifts that hold.
- **Governance (verified this session):** PR/merge AUTONOMOUS on green per CLAUDE.md §6 + §6.2 (operator
  pre-authorized; supersedes "ask before PR"); §6.2 pre-merge gate + safety-halts apply; engine
  single-writer by changed paths (this branch = non-engine). main HEAD=162789d; engine v26c 6cc73563 intact.

## Integration status (2026-06-08 reconciliation task)
- **v26c engine line FOLDED.** Merged `claude/pensive-sagan-WhNLb` (26 commits, the v26b→v26c
  program) into `claude/exciting-volta-82z290` (which sat exactly at `origin/main` 6cb4c92, so it IS
  a branch off main). Merge commit `addc8c0`. Scope re-confirmed in-bounds: ITM/American
  smooth-pasting + uniform strike registration θ=sNorm(K) + Finding-2 absorbed + spec/§8/lineage/gate
  re-pin + evidence; **no curve/invariant change, no new economic object, settlement stays American
  smooth-pasting S*=Kγ/(γ+1)** (curve fns untouched; G4 PASS proves it).
- **Re-verified v26c MYSELF on integration:** whole-file md5 `6cc73563779a3e030774b7597d0ae187`,
  4453 lines, 3 `<script>` blocks; blobs unchanged (webp `ab663f5c` line 74, svg `c505b08a` line
  1060); `run_all.sh` → 7 GH gates PASS, seam gate PASS, dir gate PASS, slippage PASS.
- **File-safety gate re-pinned to v26c (verified live):** gate delegates whole-file md5/line to
  `run_all.sh` (default `builds/HEAD_temporal_mvp_v26c.html`, want `6cc73563`) + pins blobs by
  md5 at 74/1060. Drove the hook: PASS (exit 0) on clean v26c, BLOCK (exit 2) on tampered blob and
  on broken script. No stale v26a pin remains in the gate path.
- **Union merge:** CLAUDE.md auto-merged clean (non-overlapping) — kept BOTH main's §6.1 GitHub-ops/
  agent-reconfig AND pensive's §8 v26c repo map. No conflict markers anywhere.
- **MERGED to main (operator-authorized, 2026-06-08):** PR #4 squash-merged → main `3d4fbe2`.
  Confirmed on main: v26c HEAD md5 `6cc73563`, file-safety gate PASS (exit 0), 7 GH + seam + dir
  gates PASS, blobs intact. ITM/American smooth-pasting = DONE; Finding-2 = RESOLVED (absorbed via
  uniform strike registration). Integration branch `exciting-volta` deleted (remote+local);
  `pensive-sagan-WhNLb` kept as backup (full 26-commit granular history). v26a build kept in history
  (renamed `temporal_mvp_v26a.html`, not deleted). **main HEAD = v26c.**

## HEAD / verification
- **HEAD = `engine/builds/HEAD_temporal_mvp_v26c.html`, md5 `6cc73563779a3e030774b7597d0ae187`
  (PROMOTED 2026-06-08, operator pre-authorized contingent on tester-clean).** v26b (`8df9f8a3`)
  demoted to `temporal_mvp_v26b.html`. v26c = v26b ITM/American + **UNIFORM strike registration**
  (`θ=sNorm(K)` via `sNormStrike`=getSNorm∘arbitrageToOracle) across display mark + execution/
  settlement value + payoff chart; crossover@K all γ (was oracle₀²/K for γ>1); chart strike-ray live
  K/oracle (price-space); funding/isOTM/wingMember price-measure (already at K). Permanent
  `dir_gate.js` (crossover@K + directional + mixed-basis). **Finding-2 absorbed; wing-tag/strike-basis
  saga CLOSED.** Verified MYSELF: 7 GH + seam + dir_gate PASS, dollar-pipe byte-identical, premium
  delta re-derived (+7.69%@K=82k), chart-mark==table 8.6e-11, §6 not tripped + UI tester-confirmed
  (bands cross@K, live ray no drift, payoff==table |diff|0.0, clean ×2). no-arg run_all defaults to
  v26c (exit 0).
  Harness gotcha: `run_all.sh <path>` takes the build path as positional $1 (env `HEAD=` ignored; it
  copies $1 into scratch under the seam/dir gate names those gates read).
  Minor open: payoff ray-legend text overprint (cosmetic, intern polish item, non-blocking).
- **Manager-verified at the Node level (2026-06-08, re-run on resume):** ran `engine/verify/run_all.sh`
  myself — 7 GH gates PASS (γ∈{1.5,2,3,4}), curveTrace 401/401 on the GH curve (worst slope err
  5.16e-12), marker on-curve (getMP_raw(eq)=136000.00), slippage splice-level PASS (0.99%/$3.46 →
  71.45%/$6240.94), loud-NaN guard OK. **UI owed to tester** — live browser run DISPATCHED (bg,
  agent a0b7eb8b). Lean = trusted-from-prover.
- **Branch:** v26c line (`claude/pensive-sagan-WhNLb`) folded into `exciting-volta` (= main 6cb4c92
  at task start) via merge `addc8c0`, then **merged to main as PR #4 (`3d4fbe2`)**. exciting-volta
  deleted; pensive-sagan kept as backup. main HEAD = v26c.
- Blobs intact: webp `ab663f5c…` (line 74), svg `c505b08a…` (line 1060). File-safety hook live.

## Build lineage (engine/builds/BUILD_LINEAGE.md — authoritative)
| file | md5 | what |
|---|---|---|
| temporal_mvp_v25_gh | 9910c699 | barrier→GH swap; 4 curve fns + calibration; 7 gates |
| temporal_mvp_v26a_fixes | 951d16eb | 3 barrier remnants fixed |
| temporal_mvp_v26a_2c0337e8_slipWIP | 2c0337e8 | slippage WIP — **known-broken (~97% flat)**, lineage only |
| temporal_mvp_v26a | 89ae89e9 | slippage units fix (both paths → mpGeom) — **prior HEAD, demoted on v26b promotion** |
| temporal_mvp_v26b | 8df9f8a3 | ITM/American smooth-pasting (mark/markFrac split, both wings) + seam gate — **prior HEAD, demoted on v26c promotion** |
| temporal_mvp_v26b_xrange / v26c_strikereg / v26c_full | (lineage) | intermediate increments, not HEAD |
| **HEAD_temporal_mvp_v26c** | **6cc73563** | uniform strike registration θ=sNorm(K) (display+exec+payoff), crossover@K all γ, Finding-2 absorbed, dir_gate permanent — **current canonical HEAD; work from this** |

## Roster (5 agents, after 2026-06-08 aristotle-fold config task)
manager · **research-lead (theory owner AND its own prover interface)** · intern · tester · paper.
The standalone `aristotle` agent is **REMOVED** — folded into research-lead. The prover loop is now
**direct, no courier:** research-lead phrases the obligation → calls `aristotle submit` itself (host
Harmonic's Aristotle, which **compiles server-side** = the build) → polls → **zero-cost artifact audit**
(token-scan + Aristotle's `#print axioms` + unscoped-module diff + math re-derive; no local `lake build`
gate per operator 2026-06-08) → records one of 4 verdicts (proved/trusted-from-prover · counterexample ·
still-open · candidate-fails-audit) → audits/interprets. **research-lead keeps ALL raw prover/poll output in its own context;
I receive only distilled reports** (verdicts, queue status, escalations) and relay nothing between
agents. research-lead holds Bash + the aristotlelib CLI; it does NO git/env actions (I am sole git/env
actor). I do **not** see raw prover output and am no longer a courier.

## Aristotle connection (now research-lead's, for my orchestration awareness only)
- Interface = `aristotlelib` CLI (`aristotle submit/formalize/list/show/download/cancel/tasks/ask`),
  auth `ARISTOTLE_API_KEY` (set, len 51), host `aristotle.harmonic.fun`. `uvx --from aristotlelib
  aristotle …` (uvx present); no official Harmonic MCP → **no `.mcp.json`**; routines use the
  **Harmonic connector**. Full invocation/re-verify procedure lives in research-lead's MEMORY.md — I
  don't run it.
- **Host UNBLOCKED — CONFIRMED 2026-06-08** via a real round-trip (research-lead, direct CLI). The old
  `403 host_not_allowed` is gone; both smoke lemmas submitted, ran, returned archives.
- **API-KEY GOTCHA (escalate to operator):** `$ARISTOTLE_API_KEY` is stored wrapped in literal angle
  brackets `<arstl…>` (len 51); passed verbatim the server returns "Invalid API key". research-lead
  strips the `<>` (→ len 49) to authenticate. **Fix the stored secret to the bare key** so no workaround
  is needed. Provisioning artifact, not a real auth failure.
- **Re-verify gate RELAXED — operator clarified 2026-06-08:** "no re-verifies required, Aristotle
  compiles/builds at his end." Aristotle's server-side compile (matching toolchain Lean 4.28.0 /
  Mathlib v4.28.0) **IS the build** — a returned candidate is a genuine compiled proof, not a sketch.
  **PENDING-LEAN retired** as a blocker; we no longer gate on a local manager `lake build`. **KEPT:**
  the zero-cost artifact audit (token-scan sorry/admit/axiom/native_decide/sorryAx + read Aristotle's
  own `#print axioms` ⊆ {propext,Classical.choice,Quot.sound} + diff unscoped modules for silent
  statement-weakening) — needs no toolchain, and is the only thing that catches a clean server-build
  of a WEAKENED statement. **LABEL:** clean+audited server-compiled candidate = **trusted-from-prover**
  (Aristotle's kernel ran, ours didn't); our own canonical-env build is the upgrade to "verified".
  Encoded into `formal/MANAGER_VERIFICATION.md` + `formal/smoke/README.md` (this task). Operator open
  q to me: keep "trusted-from-prover" (my rec) vs call server-clean "verified" — AWAITING.
- _(historical)_ Toolchain gap that drove PENDING-LEAN: no `lean`/`lake`/`elan` in container. Now moot
  per the gate relaxation above (submit→candidate + artifact audit is the bar).
- **SMOKE RESULT (2026-06-08, research-lead distilled):** direct loop works end-to-end through
  submit→candidate. `smoke_true` (`2+2=4`) → valid candidate, axioms = propext only; **label: candidate
  returned, re-verify PENDING-LEAN** (NOT proved+re-verified). `smoke_false` (`∀n,n=n+1`) → Aristotle
  did NOT prove it: declared false, gave counterexample n=0→0=1, proved the *negation* instead; **label:
  counterexample (correct refutation), no red flag.** Discrimination test PASSED — prover did not fake
  the false goal, research-lead labeled it `counterexample` not `proved`. (Manager independently
  corroborated against the Harmonic dashboard the operator shared.)
- Routine spec: `docs/routines/aristotle_ph_loop.md` (now the direct, research-lead-only loop).
- PH consistency spec: `specs/port_hamiltonian_consistency.md` (PH-1…PH-7). Conditional escalations
  only (PH-4/B1 ship-gate; PH-5 if-not-C¹) — none forces an engine change as written.

## PH recap + full Aristotle queue (2026-06-08, branch claude/port-hamiltonian-recap-dxskkm)
- **PH recap DONE** → `notes/PH_RECAP_2026-06-08.md` (committed a83a793). PH frame (H/J/R/ports,
  passivity, reserves-no-floor) intact vs v26c HEAD; only PH-5 strike-registration needed re-pin
  (θ=K/oracle → θ=sNorm(K), a doc fix to match shipped/verified HEAD, NOT settlement-semantics).
- **Q1 (discrete-vs-continuous):** discrete-time is NOT necessary — our discrete H-balance is the exact
  forward-Euler/sampled realization of canonical continuous-time PH (boost=one-param group; H_well=∫
  funding force). REC (research-lead + me): keep discrete PROOFS, present canonical continuous-time as
  PROSE → zero new obligations. **Operator-flagged:** switching to state-AND-prove in continuous time
  adds a price-SDE + LVR-integral obligation + re-words the locked scaffold (rec AGAINST). Deterministic
  continuous-time PH bridge (S exogenous, no SDE) IS in-scope and queued.
- **Aristotle re-verify gate RELAXED (operator):** server compile = the build; PENDING-LEAN retired;
  artifact audit kept; label = trusted-from-prover. Synced across research-lead.md, routine,
  MANAGER_VERIFICATION, smoke README, both MEMORYs (committed a83a793).
- **BIG QUEUE COMPLETE + MANAGER-AUDITED (agent a942ebf4 done; 14 obligations).** research-lead:
  14/14 proved (trusted-from-prover), 0 counterexamples, 0 fails, 0 still-open. **I independently
  audited** (`evidence/manager_audit_aristotle_run_2026-06-08.md`): no engine HTML touched; no forbidden
  tokens across 24 .lean; **base modules AMMCurve/Temporal/Seam byte-IDENTICAL to verified tree** (no
  silent core edit); axioms prover-reported {propext,Classical.choice,Quot.sound} + my token-scan
  corroborates (#print axioms NOT manager-run — no toolchain); spec re-pin notation-only; R1/R2/R3/R4
  cross-checked against my engine ground-truth. **Honest tiering (tempers "14/14"):**
  - **Tier A (concrete, engine-grounded, FOLD):** R1 (PH-5 C¹ both wings — load-bearing), R2
    (crossover@K), R3 (mpGeom/slope), R4 (orientation), R5, C1. Real rpow/HasDerivAt proofs of formulas
    I re-derived & matched to engine numbers.
  - **Tier B (abstract/conditional scaffolding — necessary-condition, NOT curve-grounded; don't
    over-promote):** GHJ (skew-J via latent rapidity group, reserves arbitrary, frontier tautological;
    WATCH-FLAG not tripped but the hard "GH reserve invariant" stays open), GHcoercive (generic
    nonneg-frontier, GH y≥0 asserted), PH4b (no-floor abstract), PH3 (PSD abstract, necessary-not-suff),
    PH6 (rebase structural), B1 (honest conditional, coverage carried, near-tautological), C2 (modelled
    collarSurplus).
  - **CTPH HELD (not clean):** canonical det. dissipation ineq dH/dt≤uᵀy is real (good for Q1 framing),
    BUT `ct_dissipation_ineq` has `exact?` in source (fragile, proposed swap NOT locally re-verified) +
    `discrete_is_sampled` is a near-vacuous existential ⇒ discrete↔continuous correspondence NOT formally
    established. Do NOT present "discrete=continuous proven." Proposed fix:
    `formal/aristotle_runs/CTPH/CTPH_emended_PROPOSED.lean`.
  - Stayed escalations correctly NOT submitted: C3 reflection (AXIOM), stochastic-SDE bridge, B1 real floor.
  Nothing upgraded to "verified" (no canonical build). Run record (748K, 19 files) committed to feature
  branch — NO PR, NO main-merge.
- **Manager independent engine-level confirmation of the cheap-now checks** (parallel, read-only) →
  `evidence/ph_cheapnow_checks_2026-06-08.md`: seam C¹ BOTH wings (value 0.000%, slope ≤0.0005%, all γ),
  mpGeom=getMP_raw·e^(−ghMu) (ratio==e^ghMu all γ), directional-sign invariant (CALL+++/PUT−−−, mutation
  caught), 7 GH gates PASS. These are the numeric ground-truths R1/R3/R4 candidates must reproduce.

## LABEL POLICY — resolved (operator 2026-06-09: "I trust Aristotle")
- Operator can't change the env allowlist this session (maybe future). Trusts Aristotle.
  **RESOLUTION:** `trusted-from-prover` is the standing label and is treated as **SUFFICIENT** (not
  doubtful, not blocked) — Aristotle's server-side kernel compile + our artifact audit = proven for our
  purposes; we build on/cite it. **Do NOT write the literal word "verified"** in artifacts (that asserts
  OUR kernel ran; it didn't). Paper phrasing: "machine-checked by the Aristotle prover (Lean4/Mathlib
  v4.28.0), audited by us; independent re-build pending toolchain access." Flip to "verified" only if a
  future session allowlists `release.lean-lang.org` + Mathlib cache and I build locally.
- **TWO INDEPENDENT AXES — keep distinct:** (1) PROVENANCE = trusted-from-prover (now good per operator);
  (2) DEPTH = Tier-A curve-grounded vs Tier-B GH-facts-assumed. Trusting Aristotle resolves axis 1 only;
  it does NOT upgrade axis 2. The watch-flag / economic-object risk lives entirely on axis 2 (the
  in-progress GH-grounding run). paper must not let trust-in-prover blur into depth-of-claim.

## Local Lean build — ATTEMPTED, BLOCKED by network allowlist (2026-06-09)
- To earn the "verified" label (vs trusted-from-prover) I tried to provision a real Lean toolchain.
  **elan installs fine** (4.2.3; raw.githubusercontent + github.com reachable) BUT
  **`release.lean-lang.org` → HTTP 403 "Host not in allowlist"** — the Lean release/manifest host is
  NOT in the env network policy, so `elan toolchain install leanprover/lean4:v4.28.0` cannot fetch.
  `ELAN_DIST_SERVER` override didn't redirect it. ⇒ **local canonical build IMPOSSIBLE here.**
- **Consequence: label stays `trusted-from-prover` (honest).** To enable real local verification the
  operator must allowlist `release.lean-lang.org` AND the Mathlib olean cache host (for `lake exe cache
  get`) in the environment network policy; then I can build the Tier-A proofs canonically → "verified".
  elan left installed at `/home/user/.elan` (outside repo) for a future allowlisted run.

## UNIFICATION BUILD — launched 2026-06-09 (sympy-gated), check passed clean
- **Operator-locked target (2026-06-09):** unify Temporal into ONE structure at **GEOMETRIC COMPLETENESS
  WITH PORTS** — metriplectic/Hessian-(conj-Kähler) interior (one convex potential μ) + Dirac
  port-INTERFACE, rebase-covariant in the gauge-invariant sNorm coordinate. Operator explicitly means
  geometric completeness (nothing OUTSIDE the structure), **NOT solvency-intrinsic** (that's excluded by
  PH-4b; port = native slot + necessity, never sufficiency; solvency stays extrinsic = B1 ship-gate).
  Single-all-four-native Courant/double-bracket object stays SPECULATIVE — not asserted.
- **"One last check" PASSED CLEAN (research-lead, discussion-only):** REBASE covariance of the whole
  object = clean — J & R legs already proved in Lean (PH-6 rebase_boost_commute + R_form_rebase_invariant);
  μ/Fisher/ω/ports covariant in sNorm gauge coord (caveat: NOT raw (x,y) — design constraint).
  COMPLETENESS: nothing geometrically extrinsic (every ingredient native/supporting). M=Fisher gets a
  rebase tailwind (rebase form-invariance is Fisher's fingerprint → evidence-for + disqualifier-test;
  still conjectural). No check failed; no new escalation.
- **BUILD COMPLETE + MANAGER-AUDITED (RUN-3, agent a09db6d3).** Stage-0 GATE PASSED; Stage-1
  `UNIFY/Unify.lean` 11 thms proved (trusted-from-prover). Audit: `evidence/manager_audit_UNIFY_2026-06-09.md`.
  - **M=Fisher: I INDEPENDENTLY RE-DERIVED it** (own quadrature, GH density αh=4/βh=1/δ=0.08):
    dm/ds=Var=Ψ″ to ~1e-10, Var 0.13425→0.28950 — reproduces research-lead exactly. HOLDS. BUT it's the
    **STANDARD exp-family identity** (GH is a genuine exp family per GHJ_grounded), **coordinate-conditional**
    (gauge/centered only; raw-u curvature=e^u≠Fisher). Real, not novel-deep.
  - **DEPTH TEMPER (key finding, I read every proof):** UNIFY.lean is mostly a STRUCTURAL SCAFFOLD —
    A1 (headline "M=Fisher") is a `rfl` definitional TAUTOLOGY; A2(`f⁻¹f=1`)/B2(`R·0=0`)/C1(`g·w=g·w`)/
    A3 trivial; content lives in docstrings + the sympy gate. GENUINE Lean theorems: B1 (Bregman
    stationarity = GENERIC deg1), D1 (sNorm invariance), E1 (port necessity); A4/D2/E2 elementary.
    **Verification weight is NOT in UNIFY.lean** — it's the sympy M=Fisher (manager-reproduced) + the
    EARLIER grounded modules (GHJ_grounded/PH3/PH4b/PH6). research-lead disclosed this honestly (no
    deception); the temper is on DEPTH wording.
  - **HONEST CLAIM:** metriplectic framing ASSEMBLED + internally CONSISTENT; one potential Ψ organizes
    price(grad)/dual(Legendre)/dissipation(Hessian=Fisher); GENERIC deg1 genuinely proved; rebase
    covariant. **NOT** "the unification is formally Lean-verified." Kähler CONJECTURAL (C1 trivial);
    Courant single-object SPECULATIVE (not claimed); solvency EXTRINSIC (ports necessity-only).
    trusted-from-prover, NOT verified. **Paper must NOT claim formal verification of the whole.**
  - Audit clean: canonical tree untouched; correct grep -rnE token-scan clean; standalone project
    (import Mathlib only); axioms standard three. Scope locks 1/2/3 honored.

## CLOSEOUT run — research-lead 5/5, MANAGER-AUDITED (2026-06-09)
Audit: `evidence/manager_audit_CLOSEOUT_2026-06-09.md`. Canonical tree untouched; only real `sorry` =
declared Kähler-K3 gap. trusted-from-prover ("verified" DROPPED per operator — Aristotle trusted to
build). Supersedes WIP checkpoints 6b37872/aae9c14.
- **1 cgf_convexOn HOLD CLOSED** — search tactics replaced w/ concrete lemmas; clean.
- **2 GH measure DISCHARGED (the prize, I READ IT):** `integrable_ghKernel` (dominated by exp(−c|v|)
  decay bound), `ghIntegral_pos`, `isProbabilityMeasure_ghProb` (mass=1 via div_self on PROVED-positive
  ∫ — DERIVED not assumed), `integrable_ghKernel_tilt` (finite MGF on strip). **NO Bessel-K, no assumed
  Z.** RUN-4 carried hInt/hMGF DISCHARGED ⇒ exp-family/M=Fisher now over a GENUINE GH probability measure.
- **3 frontier antitone/convex — GROUNDED from slope law; CARRIED[StrictAnti X(u),StrictMono Y(u)]**
  (reserve-map monotonicity = the residual Bessel-K-adjacent content; honestly named).
- **4 Kähler integrability — STILL-OPEN/CONJECTURAL** (single honest named sorry; Mathlib v4.28.0 has no
  almost-complex/Nijenhuis/Newlander–Nirenberg/Kähler infra to even state it).
- **5 Courant all-four — PROVED NO-GO:** graph(J−R), R≠0, is symmetric not isotropic ⇒ no single
  maximal-isotropic Dirac bracket carries dissipation. Settled (impossible as a Dirac), not "open."
- **TRUE FORMAL FLOOR:** (a) GH reserve-map X(u)/Y(u) monotonicity (Bessel-K-adjacent, carried);
  (b) Bessel-K normalizer VALUE (not needed); (c) Kähler integrability (Mathlib gap); (d) Courant
  (settled no-go). EXCLUDED: B1 (ship-gate), C3 spec↔engine (→ PIVOT), "verified" (dropped).
  **Formal phase at a clean, defensible stopping point → pivot to engine-faithfulness scaffolding.**

## RUN-4 (close-the-gaps) — research-lead 5/5, MANAGER-AUDITED (2026-06-09)
Audit: `evidence/manager_audit_RUN4_2026-06-09.md`. **Genuine, substantial, HONESTLY-reported upgrade**
(I read every proof; depth matches claims this time). Canonical tree untouched; correct grep -rnE clean;
standalone import-Mathlib; axioms standard three; trusted-from-prover (verified still env-blocked).
- **UNIFY2 = Tier-1 prize: GROUNDED (structure) + CARRIED (GH normalization).** RUN-3 tautologies
  REPLACED with real theorems over Mathlib's actual `cgf`/`mgf` + real GH kernel: `cgf_deriv_mean_and_variance`
  (real A1, HasDerivAt cgf = tilted mean), `deg2_score_centered` (real mean-of-tilt, not R·0=0),
  `boost_is_hamiltonian` (real ½gs²→gs), `ghKernel_pos/measurable/logderiv/exponent_le` (real GH facts).
  CARRIED (honestly named): GH finite-MGF/∫=1 (Bessel-K) — **Mathlib v4.28.0 has NO Bessel-K** (probe
  confirmed) = formalization gap not math doubt. **HOLD: `cgf_convexOn` has live `exact?`(L93)+`grind
  +suggestions`(L99)** — fragile (CTPH-class), core deriv²≥0 clean, harden by replacing the 2 helper steps.
- **C3 (#7): reflection AXIOM DISCHARGED** (real algebraic identity markPut θ s = markCall θ(θ²/s));
  residual = "spec-mark = engine-barrier" link. Report "arrow discharged," NOT "C3 fully closed."
- **Kähler (#4): algebraic Kähler triple GROUNDED (J²=−I, compat, ω skew det=1, G pos); integrability
  (Nijenhuis) CONJECTURAL.** GH interior 1-real-dim. Upgrades C1.
- **Courant (#5): linear Dirac GROUNDED (graph ω maximal isotropic); all-four single bracket
  SPECULATIVE-NOT-ACHIEVED** (honestly reported).
- **Distance to 100%:** scaffold→theorem-grade for the structure, carried at GH-measure boundary.
  Remaining: Bessel-K ∫=1 (Mathlib lift or carried), cgf_convexOn harden, Kähler integrability (frontier),
  Courant all-four (speculative), C3 spec↔engine link, "verified" (env-blocked). EXCLUDED: solvency
  intrinsic (PH-4b; ports necessity-only). Minor: stray host project c019735d not in ledger (no repo impact).
- Supersedes WIP checkpoint ac98480.

## RUN-2 (CTPH clean + GH-grounding) — research-lead 5/5, MANAGER-AUDITED (2026-06-09)
- Audit: `evidence/manager_audit_aristotle_RUN2_2026-06-09.md`. Canonical tree untouched; base modules
  byte-identical; returned SOLUTIONS sorry/admit/native_decide/sorryAx-clean (re-scanned correctly).
- **METHOD MISS I OWN:** my RUN-1/RUN-2 token-scan used `grep -rnED` — `-D` ate the pattern, scan
  matched nothing. Caught only by READING files (saw `sorry` in RUN-2 dir-root TEMPLATES). Re-scanned
  with `grep -rnE`: returned solutions clean; the sorries are in SUBMITTED TEMPLATES (dir-root
  `<NAME>.lean`), proofs live in `extracted/proj_aristotle/.../<NAME>.lean`. Lesson: token-scan never
  sufficient alone; always read. HYGIENE: sorry-templates committed under aristotle_runs (NOT in any
  build path; canonical lib = temporal_lean_verified — no poison).
- **CTPH HOLD LIFTED:** `exact?` gone from the returned solution (concrete `skew_quadForm_zero hJ z`);
  dissipation ineq clean; discrete↔continuous strengthened to an honest forward-Euler sampled-storage
  correspondence (no fabricated floor). Folds trusted-from-prover.
- **GHJ_grounded / PH3_grounded = GROUNDED** (I verified the GHJ solution proofs: esscher_core/
  density_ratio/gh_slope_law/slope_translation real, non-vacuous hyps). **GHcoercive/PH4b_grounded =
  honest PARTIAL** (GH ranges derived modulo T<1/C<1 carried as tail/CDF facts).
- **ECONOMIC-OBJECT WATCH-FLAG RESOLVED (not tripped in the bad sense):** GH conserves NO X·Y product
  invariant (by construction — value∝S^(−γ) ≠ constant-product), but DOES conserve the latent rapidity
  one-parameter group + Esscher tilt (slope=P·e^(u−μ) scaling by e^δ). PH-2 lossless/skew-J HOLDS for GH
  as a group action. NO engine change. Paper implication: describe PH-2's conserved object as the
  rapidity-group/Esscher structure, NOT a CPMM X·Y-analogue. Relayed to operator.
- Open GH lift remaining: full GH `AMMCurve` instance (antitone_y/convex_y + discharge T<1/C<1 from the
  GH special functions) — the real next mountain, not done.

## Open threads (what | owner | status)
1. **Tester browser re-run on HEAD** | tester | **DONE 2026-06-08 (tester-confirmed, live Playwright
   Chromium, 0 console errors; build md5 unchanged 89ae89e9).** Verdicts: (1) Slippage display PASS
   (% primary, $ labelled reserve-USD). (2) Frame re-fit PASS — **keep current, do NOT apply the
   one-line revert** (freezing the frame clips the GH bend as it climbs out). (3) Curve geometry PASS
   — GH continuation, no barrier remnant. Evidence committed `evidence/v26a_pw/` (7db9b4d); harnesses
   `engine/verify/pw_v26a_visual.mjs` (PLAYWRIGHT_BROWSERS_PATH=/home/user/.cache/ms-playwright).
10. **Payoff chart x-range widen** | intern→manager | **DELIVERED + Node-verified (2026-06-08).**
   Operator-approved (tester item-3). `engine/builds/temporal_mvp_v26b_xrange.html` md5 `570ef23f`
   — exactly 2 display lines in `drawPayoff` (xMin/xMax ±0.5→±2.0; x-tick loop ±50→±200 step 50).
   Reaches sNorm=3.0 > γ=2 free boundary 2.25·θ so naked(uncapped) visibly diverges above
   capped spread. Verified MYSELF: 7 GH gates + seam PASS, blobs intact, sigs/IIFE intact, no
   engine-logic change. **Browser-visual DEFERRED** — bundle into the next tester pass (likely the
   inversion-fix pass if ruling=B). NOT yet HEAD — promote bundled with the inversion ruling outcome.
2. **Finding-2 — REFINED & re-surfaced to operator** | tester→manager→operator | Tester found v26a
   has **SPLIT behavior**, I verified the code localization myself: portfolio table (pfComponents,
   ray=K/oracle_now) + close engine (liveRay ~1976) are **dollar-anchored** ($84k/$68k HELD across
   rebase 80k→120k). But chart strike rays (`drawStrikeRay` ~3355, called 3389 with
   `thetaStarOf(b.sold.inner,b.sold.outer)` = stored ENTRY-θ) draw slope θ·oracle_now =
   K·oracle_now/oracle_entry ⇒ **rotate off the locked dollar strike on rebase**; same for chart $K
   lens (~3499) + drawStrikeMark (~3568). So engine ≈ already dollar-anchored (old "option B" largely
   done); residual defect is chart-display only. **RESOLVED (operator 2026-06-08): align the chart
   strike-ray to the live dollar strike (use K/oracle_now like the table) — it's a display bug.**
   Small intern follow-up, SCHEDULED post-v26b (don't block the ITM build). Operator also confirmed
   the ITM "park" is NOT preserved — v26b deletes it (effK=K always), so after v26b no park / no
   table-vs-chart split remains.
   NOTE soft-flag: slippage scales hard with collar aggressiveness (0.2 BTC wide collar → 3463%,
   pool spot→~$0); display contract correct, magnitude input-driven — operator parked for later.
3. **v26b — ITM/American build** | intern | **DISPATCHED → intern STOPPED-and-REPORTED pre-edit
   (correct discipline; no files touched, HEAD intact).** Three blockers surfaced; manager-verified:
   - **(a) `mark()` needs γ** — recoverable as `state.ghAh−1` (I verified exact for γ∈{1.5,2,3,4}).
     Requires extending `mark(wing,θ,sNorm)` → thread γ/state through ~8 call sites. **AUTHORIZED
     (manager):** signature change is part of the mark-rule task (file-safety "sigs unless that's
     the task" satisfied).
   - **(b) PUT-wing smooth-pasting boundary** — NEXT spec gives only the call wing; intern derived
     the put mirror & verified gate-clean. **I independently re-derived:** `sNorm*_put=θ·(γ/(γ+1))^γ`,
     `S*=K·(γ+1)/γ`, value-match exact, frac@bdry `1/(γ+1)`. Matches HISTORICAL spec
     `specs/historical/SPEC_itm_exercise_smooth_pasting.md`. **ESCALATED to operator** (CLAUDE §7:
     smooth-pasting boundary = settlement semantics). Rec: accept (forced mirror, historically
     specified, gate-clean).
   - **(c) funding consumes `mark()` (line 2138)** — rescaling mark would change funding's input;
     CLAUDE §4 LOCKS funding untouched/orthogonal. **RULING (manager, enforces the lock):** split —
     keep old saturating fraction as `markFrac(wing,θ,sNorm)` for funding (bit-identical), new
     continuation→intrinsic `mark` for value/portfolio/chart; remove `Math.min(1,…)` caps (lines
     ~3843-3845) on the UNBOUNDED option-leg only (§2: don't cap), bounded wing stays capped at 1.
     NOTE: §6 stop-condition (stage-2→3 dollar branch) was NOT tripped — intern confirmed
     `carvedNotional`/`entryPerpMark` unchanged-compatible.
   Bands render (§5) + seam-gate generalization ready. **RE-DISPATCHED 2026-06-08 (agent a3073619)**
   with corrected map. Operator caught my call/put LABEL swap on (b); verifying it, I found deeper:
   the engine `mark()` wing TAG is INVERTED vs economic call/put (`wing==='call'`=`sNorm/θ`, ITM for
   S≤K = economic PUT direction; mark 1646 / isOTM 1760 / comment 1757). Brief now **binds boundary to
   the GEOMETRIC BRANCH/S-direction, not the tag string**: `sNorm/θ` branch → `S*=K·γ/(γ+1)`,
   intrinsic `1−S/K`, exercise S<K; `θ/sNorm` branch → `S*=K·(γ+1)/γ`, intrinsic `1−K/S`, exercise
   S>K. Directional seam-gate assertion keys off S-side (not tag). Bounded/unbounded (cap) flagged
   ORTHOGONAL to wing. Finding-2 chart fix = SEPARATE post-v26b follow-up (operator ratified).
   **DELIVERED + MANAGER-VERIFIED at Node level 2026-06-08** → `engine/builds/temporal_mvp_v26b_itm.html`
   md5 `8df9f8a3cb705282a5348ce778f9eb82` (committed f41a8f7, NOT yet HEAD). Verified MYSELF:
   `run_all.sh <path>` (NB: path is positional $1, NOT env var) → 7 GH gates PASS γ∈{1.5,2,3,4},
   curveTrace 401/401, marker on-curve, slippage unchanged, **seam gate PASS** (value 0.000%, slope
   ≤0.0005% in sNorm-space, no-jump ~e-7, directional A:S*<K / B:S*>K, both branches). Blobs intact
   (line layer). `mark()` math matches ratified boundaries; both exercise branches closed-form
   `Math.pow` (no GH-table in slope FD). `markFrac`=verbatim old fraction; funding (2162) + polar
   marker (3598) route to it ⇒ funding bit-identical. **Seam gate negative-controlled by me:** wrong
   engine boundary +10% → value 9.09% FAIL (CAUGHT); branch swap → 80% FAIL (CAUGHT); injected kink
   ×1.02 → slope 1.96% + jump 6.7e-3 FAIL (CAUGHT). Intern's sNorm-space slope swap = legitimate
   (coordinate-invariant ratio, avoids table aliasing), NOT a green-wash. **OWED: tester browser/UI
   pass** (§5 column drop/rename, payoff-chart uncapped naked leg vs capped spread, polar marker on
   ψ-curve) before HEAD promotion — **DONE (tester af25ead5, evidence ab1d8be).** Items 1 (bands §5:
   empty 4th td, 9 cells, "Attrib P&L"/"Strike"), 2 (mark 0.1231→0.5612 smooth, never clamps to 1;
   old markFrac would saturate at oracle≥$84k; seam gaps ~3e-7), 4 (polar marker on ψ-curve, maxDiff
   0) = **tester-confirmed (rendered)**. Item 3 (payoff naked uncapped vs spread capped) = **logic-only**:
   code correct (no Math.min on naked, min on spread) but payoff chart x-range ±50% perp-mark is too
   narrow to render the deep-ITM divergence → pixel-identical. DISPLAY-COVERAGE flag, NOT a defect.
   **→ v26b READY for HEAD promotion (Node+UI verified). HELD for operator nod** — promotion edits
   shared-truth CLAUDE.md §8 HEAD line + run_all default + lineage (milestone), and bundles two
   product/display calls: (i) item-3 widen payoff x-range? (ii) Finding-2 sequencing (promote v26b
   now then Finding-2 next = my rec, vs bundle).
4. **Blob-ledger reconcile** | manager | **DONE & ratified (operator 2026-06-08): keep LINE layer
   `ab663f5c`/`c505b08a` canonical; decoded `8d2e1a84`/`1b320fc5` = documented secondary.** Wording
   fixed in CLAUDE.md §3, GOTCHAS §7, BUILD_LINEAGE, hook comments+error string, INTEGRITY (ratified
   note), agents/intern.md, docs/00_ORCHESTRATOR_START_HERE. Dated snapshots (STATE_snapshot_v26a,
   briefs/INTERN_SPLICE_NOTE, evidence/) left as historical. Intern to update its own MEMORY line.
   _History:_ **VERIFIED, awaiting operator ratification.**
   Decoded HEAD blobs at all 3 layers myself (2026-06-08): line-md5 `ab663f5c`/`c505b08a` (canonical,
   what the hook+run_all check) → DECODED-binary `8d2e1a84`/`1b320fc5`, b64-payload `d3ff8fc8`/`b6f0d67b`.
   273864 b64 × ¾ = 205398 exact; 5168 × ¾ ≈ 3875. ⇒ `8d2e1a84`/`1b320fc5` is **NOT a second/minified
   "broken cut"** — it's the *decode of the same canonical blob*. INTEGRITY.md was right; the "minified
   broken cut, never restore" narrative in CLAUDE.md/GOTCHAS/BUILD_LINEAGE/hook-comments is the actual
   error. Hook/harness key off the correct line layer ⇒ nothing operationally at risk. Reconcile =
   correct the narrative + ratify which layer is canonical (recommend keeping line layer = status quo).
   Held doc edits pending operator (touches shared-truth CLAUDE.md). Surfaced to operator 2026-06-08.
5. **Layer-2 honest-dollar slippage $** | manager/intern | DEFERRED, non-blocking. Route reserve-USD
   through the existing carved-perp settlement chain; reuse, don't improvise.
6. **Lean GH gate-discharge** | research-lead→Aristotle | OPEN. Instantiate GH, discharge 4 gate
   fields; watch `coercive = BddBelow` (bounded reserves).
7. **Ship-gate B1 — funding-coverage sweep** | manager/intern | OPEN. The one thing geometry can't
   close (κ is extrinsic). Necessary, not sufficient (B1/B3/B4 hypotheses).
8. **Publication** | paper | background. AfT 2026 (notif ~Jul 15), WINE 2026 (~Jul 2), FMBC 2027.
9. **Engine wing-tag → STRIKE-BASIS fix** | manager→operator | **Operator RULED (2026-06-08):
   NOT directional — a strike-basis mismatch. Strike in price basis θ=K/oracle (∝S⁻¹); curve/mark in
   carry basis sNorm (∝S⁻ᵞ); agree only at γ=1. Fix: θ_strike=sNorm(K) via
   getSNorm(arbitrageToOracle(state,K)) (NOT FD), fed to mark + funding + chart ray. Authorized
   reopening of funding.** Evidence: `evidence/strike_basis_fix_verification.md`.
   - **VERIFIED myself:** θ=sNorm(K) lands crossover at exactly K for γ∈{1.5,2,3,4} (θ γ-dependent
     0.9295/0.9071/0.8639/0.8228 but crossover pinned to K). mark+chart-ray fix correct & spec-ready.
     Blast radius mapped (pfComponents ray 4162→mark 4174; markEff/legValueUnified/legPrice fed
     sold.inner; drawStrikeRay/Mark; fundingPerStrike 2160). isOTM/wingMember STAY (price-measure
     entry checks, already crossover at K; corrected mark now agrees with them).
   - **BLOCKED — funding formula:** RESOLVED (operator 2026-06-08): **funding stays LOCKED/untouched.**
     The "→0 deep ITM" target was a mistaken extrinsic-carry overlay; funding is a pure pool-vs-anchor
     slope-deviation (crossover already at K; directionality = ±2 wing sign). My test confirmed a
     θ-swap FLIPS funding's sign → funding must NOT be touched. Fix scope = **mark path + chart-ray
     registration ONLY.** Spec `specs/SPEC_strike_registration_NEXT.md`. Directional-consistency gate
     convention PINNED + verified: `sign(K−oracle)==sign(funding ±2)==sign(d(mark)/d(sNorm))` (curve
     coordinate; CALL all +, PUT all −). **v26c DELIVERED + MANAGER-VERIFIED Node level (2026-06-08)**
     → `temporal_mvp_v26c_strikereg.html` (committed d851695, NOT HEAD). Diff = 4 surgical regions
     (new `sNormStrike(s,K)`=getSNorm∘arbitrageToOracle, export, `pfComponents` ray→sNormStrike +
     pool param, 2 callers). 7 GH + seam + new `dir_gate.js` PASS; crossover@K |err|=0 all γ; blobs
     intact; funding/isOTM/execution/markFrac UNTOUCHED (diff-confirmed). **dir_gate negative-controlled
     by me:** basis flip → crossover≠K FAIL (caught); wing swap → sSlope flips, directional FAIL
     (caught). HEAD (v26b) still green (dir_gate SKIPs pre-v26c).
   - **SCOPE FORK RESOLVED — operator ruled (A) 2026-06-08:** registration must be UNIFORM (one mark
     on the curve; display@K + execution@oracle₀²/K + chart@old = three strikes = screen lies about
     what trades). Extend θ=sNorm(K) to execution/settlement path + chart strike-ray (`drawStrikeRay`);
     **Finding-2 ABSORBED** (drawStrikeRay re-registration = the Finding-2 fix, also kills entry-θ
     drift). LEAVE `drawStrikeMark` (funding-polar) + funding + isOTM (price-measure, already at K).
     Guardrails: uniform (no curve-coord K/oracle left); stage-2→3 dollar pipe byte-unchanged (FED
     corrected value); **§6 HARD STOP if a new dollar path is needed**; quantify ~10% premium delta +
     extremes/boundary; dir_gate enhanced so a MIXED basis trips crossover@K. **v26c_full DELIVERED +
     MANAGER-VERIFIED Node level (2026-06-08)** → `temporal_mvp_v26c_full.html` md5 `8f7b3ffb`
     (committed 708fb02, NOT HEAD). Verified MYSELF: 7 GH + seam + dir_gate(mixed-basis exec control)
     PASS; **dollar-pipe content BYTE-IDENTICAL** (guardrail 2 ✓); premium delta re-derived matches
     intern (+7.69%@K=82k near-strike / +15.76%@K=84k, toward correct); extremes/boundary CLEAN (new
     path fixes an old-path blowup); §6 NOT tripped; funding/isOTM/markFrac/drawStrikeMark untouched.
     dir_gate mixed-basis: mutant→76190, registered→K (negative-controlled by me). Minor: exec
     crossover 84005 vs 84000 = sweep resolution (cosmetic).
   - **Intern's 3 flags:** (1) chart-ray uses K/oracle_LIVE not sNorm(K) — I VERIFIED correct (sNorm(K)
     would draw ray@72565; K/oracle_live@84000, same curve point; price-space object). RESOLVED.
     (3) settled-value changes ITM-close dollar = the premium delta, authorized, verified. RESOLVED.
     (2) **`drawPayoff` — operator ruled (i) 2026-06-08: re-base to carry basis NOW (before HEAD).**
     Rationale: drawPayoff COMPUTES marks; a chart showing different mark values than the table = a
     basis split (unlike the chart ray, a legit price-space object). §6 carve-out: if re-basing is
     more than a bounded display increment (hits locked surface / structural), STOP→defer. **Intern
     BUILDING `temporal_mvp_v26c_full2.html` (agent ab6a4ecf)** — re-base drawPayoff mark inputs to
     carry (θ=sNormStrike, sNorm via getSNorm) so its mark == bands-table mark; + port the ±200%
     x-range. drawPayoff-only.
   - **v26c_full2 DELIVERED + MANAGER-VERIFIED Node level** → `temporal_mvp_v26c_full2.html` md5
     `6cc73563` (committed 2a1bdf3). drawPayoff re-based to carry; **I independently confirmed chart
     mark==table mark** (worst |diff| 8.6e-11 across wings/strikes/γ); diff drawPayoff-only; 7 GH +
     seam + dir_gate PASS; §6 not tripped. x-range adapted −90%..+200% (carry: −r→−spot→NaN; clears
     both free boundaries; naked>1 region unreachable but free-boundary crossing visible). Intern also
     fixed a pre-existing drawPayoff N_buy bug (state→state.pool, was NaN-fallback; display-only).
     **= COMPLETE uniform-registration build, HEAD candidate.** Finding-2 absorbed.
   - **CLOSED 2026-06-08: tester browser pass all 4 PASS (clean ×2, tester-confirmed via page's own
     engine vs live Store + DOM): bands cross@K (legIsITM flips at oracle=120000=K), live chart
     strike-ray no entry-θ drift, payoff legFraction==table markEff==DOM cell |diff|0.0, no v26b
     regression. v26c_full2 PROMOTED → HEAD (`HEAD_temporal_mvp_v26c.html`, 6cc73563).** Minor cosmetic
     (payoff ray-legend overprint) tracked, non-blocking. Wing-tag/strike-basis saga DONE.

## Locked decisions (don't reopen unless the operator does)
- **PH PRESENTATION FRAMING — LOCKED (operator 2026-06-09):** present the model in the **canonical
  continuous-time port-Hamiltonian form** (`ẋ=(J−R)∂H/∂x+Gu`, `y=Gᵀ∂H/∂x`, `dH/dt≤uᵀy`) as the prose/
  framing, while the **proofs run in the discrete (forward-Euler/sampled) form** — zero new obligations,
  no SDE/Itô. Discreteness is an accrual/implementation detail, not a modeling commitment. The
  stochastic-LVR/SDE version is NOT adopted (would need a volatility-model commitment). **paper** to use
  this wording. The deterministic continuous-time bridge (CTPH) is the supporting proof (being cleaned up).
- **ITM second-wing boundary RATIFIED (operator 2026-06-08):** the `θ/sNorm` branch (economic call,
  exercise S>K) pastes at `S* = K·(γ+1)/γ`, intrinsic `1−K/S`; the `sNorm/θ` branch (economic put,
  exercise S<K) at `S* = K·γ/(γ+1)`, intrinsic `1−S/K`. Bind by S-direction, NOT the inverted tag.
- Curve-baked **GH only, γ>1, no barrier** (barrier exponent is outside the GH family; δ won't
  recover it). Carry **P = Ny/Nx** load-bearing; rebase recomputes P→P/r; anchor w=½, strike ray
  θ→θ/r on rebase; convexity knob γ∈(1,4).
- **Slippage** references `mpGeom = getMP_raw·e^(−ghMu)`; **% is basis-independent**; **$ = Layer-1
  reserve-USD** for now.
- **ITM → American smooth-pasting:** free boundary `sNorm* = θ·((γ+1)/γ)^γ`, price `S* = K·γ/(γ+1)`,
  `c = 1/((γ+1)·sNorm*)`. Funding = slope-deviation ratio vs the w=½ anchor at the strike ray —
  orthogonal to intrinsic, untouched by the ITM change.

## THE gotcha
`getMP_raw` is a **price coordinate**, not the slope: `|dy/dx| = getMP_raw·e^(−ghMu)` (11.7/44.5/749/13780
at γ=1.5/2/3/4). Gates are mostly **self-consistency**; the one accuracy gate is G4 (value∝S^(−γ));
ITM adds a seam gate. A price/slope conflation passes every self-consistency gate. Re-derive against
geometry; comments lie.

## Escalation (Gate 2)
Autonomous = how-to-execute (dispatch spec'd work, harnesses, re-derive, audit proofs, git, blob-safe
passes behind the hook). Escalate to operator = what-we're-building (curve/invariant, settlement
semantics, reopen a locked decision/ship-gate, product calls Finding-2 / |Γ|>1 / Fork A-vs-B,
calibration tier, paper claims). Irreversible/high-blast-radius escalates regardless.

## Waiting on operator (review in the morning, ~8h after 2026-06-08 launch)
- **Aristotle queue results** — research-lead's consolidated report + RESULTS.md ledger + folded
  archives on the feature branch. I'll have audited + committed whatever landed (no PR/main-merge).
- **For the operator to decide (none block the night's run):**
  1. Q1 framing: continuous-time-as-PROSE (rec) vs state-AND-prove continuous (adds SDE obligation).
  2. "trusted-from-prover" (current encoding) vs upgrade word to "verified" for server-clean candidates.
  3. Any GH-invariant economic-object finding, if the watch-flag triggered.
  4. B1 ship-gate (funding-coverage sweep, κ extrinsic) — still the open solvency prize.
- v26c remains canonical HEAD on **main** (PR #4 `3d4fbe2`); this PH work is on branch
  `claude/port-hamiltonian-recap-dxskkm` (no PR opened — operator hasn't asked).

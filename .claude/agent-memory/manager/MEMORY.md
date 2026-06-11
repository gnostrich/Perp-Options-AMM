# MEMORY — manager (cross-role rollup = state of the whole project)
_Last updated: 2026-06-11 (branch claude/focused-carson-15117f, LIVE session). This is the
project's state-of-the-whole; git history is the mechanical audit trail._

## ★★ ACTIVE 2026-06-11 — CURVE-AGNOSTIC FRAMEWORK BRAINSTORM (pre-go-ahead; operator in the room)
- **Transcript:** `history/operator/2026-06-11_curve-agnostic-framework-brainstorm.md` (3 entries
  so far, all verbatim, committed in-turn). Engine untouched (HEAD v26c 6cc73563); non-engine branch.
- **Entry 1 (the spec):** curve-warp AMM; control skew+kurtosis of the LIQUIDITY DISTRIBUTION
  FUNCTION on the 90°→180° hyperbolic-polar fan (= research-lead's Gudermannian object), mode=spot;
  ideal: (x,y,w) determine skew, ONE static vol-set kurtosis knob; scaffolding stays, curve is the
  open slot. Work scoped (NOT started — go-ahead pending): (A) airtight curve-agnostic framework
  (info-geom/PH lift of the single-μ core), (B) tabular curve comparison propagating all 16
  inventory components.
- **Entry 2:** open options DO re-price — "extrinsic values change because the 'secondary market'
  has repriced" (answers skeptic's standing BRAINSTORM_2026-06-10 question; appended verbatim
  there). My labelled read relayed in-chat (intrinsic terms fixed, extrinsic floats on live curve).
- **Entry 3 (answers my 3 propagation consequences):** (1) exercise on the live warped curve = YES;
  (2) **funding = geometric comparison across curves: anchor curve UNSKEWED, pool curve may be
  skewed, BOTH same kurtosis** (curve-agnostic generalization of the w=½ anchor — resolves "what
  replaces w=½ per curve" and the "anchor when w is a field" worry); (3) pool-depth impact =
  design choice, "not impacted" currently easier; "unified the two ⇒ baked into per-strike-ray
  pricing alreay i thinl" (my reading = v26c uniform strike registration; AMBIGUITY flagged to
  operator, confirm owed).
- **research-lead pass 1 RETURNED** (relayed verbatim to operator): truth-up confirmed; U1 partially
  resolved (fan density; residual = WHICH density rides the fan — depth vs latent kernel, kurtosis
  SIGN flips); framework skeleton = admission contracts (generator/validity/fan/wings⇒S*/Trade-
  Formula-warp/carry-rebase/funding-anchor/registration/slippage/solvency-report); 7 candidate rows
  (GH-fixed · B-MINIMAL · B-FULL · (W) · (W)+Trade-Formula · Balancer · tanh-score control); 5 qs.
- **skeptic pass 1 RETURNED:** channel verified (no FLAG-PROCESS); U1 object pinned, remainder =
  operational LDF definition + moment coordinate; table gate recorded in its MEMORY ("all 16 per
  family + per-cell provenance"); queued audit of "pivot landed" claim. **RELAY GAP (named to
  operator, not papered):** its run announced a relay block it never emitted — substance lives in
  its MEMORY update; follow-up run dispatched to emit the block + verdict entry-2 (appends to
  BRAINSTORM file itself). Its FLAG-OMISSION (research-lead MEMORY "15-item table") → FIXED by
  manager corrigendum 2026-06-11 (in-file, attributed); awaiting skeptic stand-down.
- **CONVERGENCE (headline for operator):** research-lead and skeptic INDEPENDENTLY landed on the
  same top question — which density operationally IS the LDF (liquidity depth vs latent kernel;
  sign of kurtosis flips between them; plain-Balancer depth has no mode in one reading).
- **Entries 4+5 (operator):** LDF = closest-axis thickness of the curve (180° case: just height) —
  a THIRD object vs the two debated (fixes "Balancer has no mode"); mode = 'pool mark' (accurate
  term) at every skew, CONJECTURED = the unit-tangent-slope point (|dy/dx|=1) — research-lead
  checking (run aed838ad, in flight; my hand-check + skeptic's independent numeric both find the
  raw-min(x,y) mode PINNED at x=y on weighted Balancer while unit-slope sits at ln((1−w)/w) ⇒
  either the 180° unfolding reconciles them or the conjecture is the definition-SELECTOR; "at
  every skew" is the suspect clause). **Entry 5 = HARD PARAMETER BUDGET:** "no separate knob for
  wing sttpness etc. its x y w determing skew, and single kurtosis / steepness knob thats it" —
  γ is DERIVED from (x,y,w,τ), never a fifth dial. Admission-contract consequence: today's engine
  (γ own dial, no live w) fails the budget as-is; (W)'s (w₋,w₊) pair must compress into it.
- **skeptic entries-3/4 reply (in BRAINSTORM file, lines 130-165):** #8 SETTLED; #9 funding now
  WELL-POSED (anchor = unskewed same-τ member) + NEW anchor-existence column (GH β=1 couples
  skew↔kurt ⇒ zero-skew member may not exist per candidate); #13 DEFERRED-not-satisfied
  (liabilities still re-mark; reachable-warp-set boundedness needed; "baked in… i thinl" = hedged
  conjecture, must be proven); manipulation/cost-to-warp column mandatory; PASS conditions listed.
- **research-lead LDF check LANDED (`framework/LDF_DEFINITION_CHECK_2026-06-11.md` (moved from notes/ in slice 1), 9e64152) + skeptic
  AUDIT verdict #5:** substance PASS (tripwire NOT tripped; all decisive numbers reproduced;
  "conjecture = anchor-preservation under skew" sold at right strength). RESULT: LDF =
  closest-axis thickness WORKS (Balancer gets a real mode); conjecture EXACTLY TRUE for anchored
  warp (w_mid=½, skew=Δw, any τ in validity gate), FALSE for constant-weight skew (excluded — no
  elasticity−1 point) and live GH (mark off-mode by e^ghMu exactly: 44.5223/748.6197,
  manager-engine-verified) ⇒ conjecture = ADMISSION CONTRACT (pins skew mechanism + carry gauge;
  height free up to symmetry). Pool-mark leg = item-16 acceptance test [OPEN, operator adoption
  pending]. 2 narrow skeptic flags FIXED by dated corrigenda §8 (validity clause in summary item
  2; 748.66→748.62 digit slip — MY "rounding/pool-constants" wave-off was an invented attribution,
  owned, pattern-7 3rd instance: never explain a delta without the one-second check); §5 marked
  answered-by-entry-5; carry-forward tension recorded (live w ↔ Δw map = inside item-16 OPEN).
  Skeptic stand-down on the corrigenda = pending its next look.
- **OWED next:** operator: (a) go-ahead on framework build, (b) adopt mode-at-mark as item-16
  acceptance test y/n. Then dispatch framework build (A) then table (B) — framework note owes
  anchor-existence column, #13 reachable-set, cost-to-warp column, the w=α/x↔Δw map treatment;
  skeptic mandatory pass before any merge. U1 residue: LDF-kurtosis height-choice sentence
  eventually needed.

## ★ GOVERNANCE CHANGE (2026-06-10) — ROLE-LOCK + ANTI-IMPERSONATION (config-only, self-merged)
Operator-directed, config-only (no engine edits; HEAD v26c `6cc73563` untouched). Three edits, two
locations, autonomous self-merge per §6.2 (token 200, mergeable_state clean):
- **CLAUDE.md §2.3 Role-lock (single-agent sessions):** any session can be pinned to one agent as a
  direct, unfiltered line (operator's deliberate hub-and-spoke bypass). Verbatim pinning opener
  documented ("For this session you are <agent>, per .claude/agents/<agent>.md; answer as yourself;
  do not act as, speak for, or route through the manager"). Pinned session speaks ONLY as that
  agent; locked capabilities (git/merge authority, file-safety gate) unchanged — read-only stays
  read-only.
- **CLAUDE.md §2.4 No impersonation / verbatim-relay:** manager AND every agent may NEVER write in
  another agent's voice. Convey a subagent's output by EITHER (a) actually invoke the agent + quote
  verbatim, attributed/delimited, with a run/transcript pointer, OR (b) explicitly label as own
  synthesis ("my read of X", never "X says"). No reconstructing findings from memory as that
  agent's; if not invoked this turn, must say so. Closes the entry-19 stand-in-as-skeptic drift.
- **manager charter** — anti-impersonation duty paragraph mirroring §2.4.
- **Transcript:** `history/operator/2026-06-10_role-lock-anti-impersonation.md` (new session file,
  operator opener verbatim, §2.2).
- **Process note (own it):** I did NOT route this through the skeptic — it's a directly-specified
  operator governance edit, not a brainstorm/design note or audit report (the §2.1 mandatory-pass
  triggers). Flagged honestly rather than fabricating a verdict (consistent with the new §2.4 I
  just landed). **main HEAD = 9c633445; engine still v26c 6cc73563.**

## ★★ NEXT SESSION PICKUP (read this first)
1. **The registered `skeptic` agent exists NOW** (charter landed on main; today it ran as labeled
   general-purpose stand-ins — operator caught my relay dropping that label, entry 19; never blur
   again). First skeptic invocation: it self-orients from its MEMORY + the open brainstorm.
2. **OPEN brainstorm with operator** (`notes/skeptic/BRAINSTORM_2026-06-10.md`): skeptic's pending
   question — when a trade warps the curve, do open options re-price (product) or keep their
   terms? Operator said "i'll get to this later." Relay protocol: pure pipe, verbatim both ways.
3. **Pivot DONE** (5 faith gates HARD in run_all, manager-verified green + negative-controlled).
   **NEXT WORK = the w-warp build** (ruling 2, entry 16: trades change w, α=x·w & β=y·(1−w)
   conserved, per paper). Cheap first computation awaiting operator green-light: does the paper's
   α,β conservation close on the (W) rounded-corner curve (skeptic brainstorm Q2)? Curve choice =
   OPERATOR-TIER (skeptic Q1: GH has no single w; the (W) family does).
4. **Operator rulings of 2026-06-10** are in CLAUDE.md §0 (pivot-first; trades-change-w; kurtosis
   = static vol-set steepness). Verbatim sources: `history/operator/2026-06-10_*.md` entries 1–20.
5. **Standing asks to operator:** export 2026-06-08/09 chat transcripts into history/; answer
   brainstorm question; green-light the α,β check.
6. **Manager discipline notes to self (operator-enforced today):** plain English ALWAYS — two
   vocabulary violations in one session ("strong vs tilt", "lean"); transcribe EVERY operator
   message in-turn (§2.2); never present a stand-in as the registered agent; the skeptic outranks
   me on claims (§2.1) and its standing FLAG is a halt.

## ★ STOCK-TAKE + OPERATOR PAIN-POINT REVIEW (2026-06-10) — reconciled to main `eaaa2d0`
- **Memory had gone stale** (ended at 2026-06-09 checkpoint); reconciled against main per §6.2.
  Events since the checkpoint, all merged, all non-engine (HEAD v26c `6cc73563` untouched throughout):
  - **#11 AIRTIGHT endgame** (settlement generated, single-μ core) — already recorded below.
  - **#12 MERTON-TIE + GHMaps run (research-lead, manager-audited in-commit):** μ=GH Laplace exponent
    tie GROUNDED (Vieta sum⇔r=q, prod⇔γ(γ+1)=2r/σ²; I re-derived by hand); `Sstar_is_merton_boundary`;
    **GH asymmetry finding:** β=1 GH natively carries ONLY the put eigenfunction S^(−γ) — call root
    γ+1 leaves the analyticity strip; two-root symmetry is Gaussian-limit, not GH. GHMaps DISCHARGED
    the CLOSEOUT-carried StrictAnti X/StrictMono Y (Bessel-K-free) ⇒ only the Bessel-K normalizer
    VALUE stays carried (needed for nothing structural). 3 `grind` emend flags (no-math).
    σ-knob rec flagged to operator (ship GH σ→γ map, not Gaussian closed form). INDEX_DRAFT.md
    provenance map drafted — promotion to formal/INDEX.md was HELD for operator; **operator's 2026-06-10
    pain-point 3 = greenlight signal, promote it.**
  - **#13–#20 CURVE/INVARIANT BRAINSTORM thread (kurtosis knob; notes only, operator's call per §4 lock):**
    `CURVE_SWAP_GH_vs_CES` (#13, carries CORRECTION HEADER — its δ→0=Balancer claim was WRONG);
    `REPARAM_balancer_kurtosis_dropin` v1+v2 (#14/#15, reconciled: **Cobb-Douglas/Balancer = δ→∞
    Gaussian limit, NOT δ→0**; δ→0 = Laplace; δ = ATM-elbow/kurtosis knob, wing exponent γ is
    δ-invariant); `HETEROGENEOUS_WEIGHT_implied_density` (#17, the WARP structure: w(u) ⇒ nonlinear
    monotone warp of the latent density; constant w = linear warp = Gaussian preserved; heterogeneous-w
    warp GENERALIZES GH); `KURTOSIS_KNOB` (#18, the deliverable: single-knob weight profile
    `w(u;w₋,w₊,τ)=w_mid+(Δw/2)·u/√(τ²+u²)`, elbow kernel = GH score kernel ⇒ **τ:=δ EXACTLY**;
    FLAG confident: NO clean algebraic invariant F(x,y;w,τ)=k exists — elbow warp is non-monomial;
    role split: convexity=w_mid, skew=Δw, kurtosis=τ; asymptote-preserving confirmed; kurtosis-sign
    gotcha: latent leptokurtic vs pushforward platykurtic — label = operator call); #20 notation
    de-collide (κ→τ; k=CD invariant; K=strike reserved; δ-vs-composite-ray-δ collision flagged unfixed).
    **No engine edit, no decision taken — curve/invariant change remains operator-tier.**
- **OPERATOR APPROVED ALL THREE (2026-06-10, "yes to all") — EXECUTED same session:**
  (1) **skeptic agent LIVE** (`.claude/agents/skeptic.md`): read-only red-team; mandatory pass on
  brainstorm/design notes AND my audit reports pre-merge; audits vs `docs/feature_inventory.md`
  (new, 15 items); operator questions reach it VERBATIM (paraphrase = FLAG-PROCESS); verdicts
  appended unedited, disagreements escalate unreconciled. Operator's extra requirement honored:
  charter leads with the CRISP MOTIVE — "curve-warp AMM grown out of Balancer, purpose = kurtosis
  knob, everything else stays the same" — also added as **CLAUDE.md §0** (shared truth, so the
  motive can't get lost across agents) + verbatim in skeptic MEMORY. Roster now 6; CLAUDE §2 +
  manager/tester charters updated.
  (2) **DIFF_LEDGER live** (`engine/builds/DIFF_LEDGER.md`): tester-owned behavioral deltas per
  version transition (desirable/undesirable/neutral + reconciliation list); HEAD promotion now
  gated on the entry existing; v25→v26a→v26b→v26c BACKFILLED by me from verified evidence.
  **HARDENED same day (operator: "diligent… feature-level… so I don't ever have to keep
  inventory"):** ledger = the operator's INVENTORY OF RECORD. Every entry feature-keyed to
  inventory #1–#15 + explicit "none beyond"; new rolling FEATURE-STATE TABLE (15 rows, backfilled
  to v26c state) tester-updated every entry; candidates included not just promotions; my gate now
  = entry exists AND carries the feature mapping (lazy/unmapped → bounce). tester charter +
  CLAUDE §2 updated.
  (3) **formal/INDEX.md PROMOTED** (from INDEX_DRAFT, retired): MERTON/GHMaps rows resolved
  (GROUNDED, trusted-from-prover), frontier row notes its carried hyps DISCHARGED by GHMaps,
  true-floor updated (Bessel-K normalizer VALUE only + B1 + Kähler + Courant-settled + C3-link +
  env-blocked "verified"); + `formal/README.md` layout guide; RESULTS.md NAV repointed.
- **★ SKEPTIC STOCK-TAKE LANDED (2026-06-10, `notes/skeptic/STOCKTAKE_2026-06-10.md`) — the
  brainstorm map.** Key NEW numerics (β=1 engine pin, calibrated vs notes' β=0 digits):
  (1) B's δ-dial at β=1 = COUPLED (skew,kurt) dial — skew +0.99→+0.07 co-moves w/ excess kurt
  3.66→0.03; clean role split & "[0,3]" are β=0-only (purity costs the FULL fork = settlement
  change); (2) δ DOES round the elbow at β=1 (curvature 9.31→0.66) — REPARAM elbow claim now
  holds at engine pin; (3) wing reserve depth swings ~7× across the dial at β=1 (X/Nx@moneyness-2
  0.085→0.563) ⇒ any shipped knob RE-PRICES the B1 floor (un-dispositioned, both branches);
  (4) deployment asymmetry: B-MINIMAL contains today's engine exactly, A at NO setting.
  Branch-A honest ledger: wings SHOWN; carry BROKEN-as-stated; Esscher slope law BROKEN mid-curve;
  rebase/seam(LOCKED item)/funding(ill-posed when w is a field)/strike-reg/solvency UNKNOWN;
  (W) reserves UNBOUNDED (GH solvency frame doesn't transfer); A's only computed kurtosis object
  is PLATYkurtic. Decisive inputs: U1 (FREE, highest leverage) which kurtosis does the operator
  mean — fat-tail return density→only B(FULL/β=0) shown / elbow-rounding→both, B-MINIMAL wins on
  compat / fatter tradeable wings→NEITHER (γ is the wing knob, stop if that's the intent);
  U4 (FREE) skew-coupling tolerable? no→B-MINIMAL out, fight = B-FULL vs A; U2/U3 (~days) (W)
  carry+rebase / value-fn+seam — invariant makes tractable; either failing kills A.
  **Residuals fixed/handled:** inventory line-11 motive paragraph carried the broken τ≡δ verbatim
  → FIXED (this commit). **research-lead MEMORY NOT truthed-up (still asserts κ:=δ EXACTLY / no
  invariant exists / all κ-invariant) → research-lead QUARANTINED from the brainstorm until its
  reconcile (which MUST include memory truth-up) runs.** B invariance suite label:
  derived-NOT-engine-verified (no δ≠0.08 engine ever built). Skeptic verified the verbatim channel
  against history/operator/ — held, no FLAG-PROCESS.
- **★ OPERATOR RULINGS (2026-06-10, transcript entry 14 — VERBATIM SOURCE, encoded CLAUDE.md §0):**
  (1) **PIVOT UN-HELD + FIRST → DELIVERED + MANAGER-VERIFIED same session (commit 29c25ef):**
  5 faith gates live as HARD gates in run_all (esscher trade=tilt-translation 1.1e-3; rebase
  sNorm-invariance 5.6e-16; reflection markPut==markCall(θ²/s) 6.2e-16 — **C3 spec↔engine residual
  numerically CLOSED on the live engine**; merton (γ,σ_eff) pins + ghM==GH-integral 5.2e-10 +
  strip asymmetry; fisher nearest-engine-computable identities ≤1.3e-5, no-faked-green where
  direct κ'' doesn't exist). I ran run_all myself EXIT=0 + hand-checked negative controls
  (--mutate exit 1). Zero tolerance-tuning, zero STOP findings. HTML untouched (6cc73563).
  Tester independent re-run = welcome, not blocking (harness-only). NEXT after this: the w-warp
  build (ruling 2 spec) — design question (w-warp × kurtosis-knob geometry) is OPERATOR-TIER;
  skeptic brainstorm Q1/Q2 are the entry points; the α,β-conservation-on-(W)-curve check is the
  cheap first computation when operator green-lights.
  (2) **TRADES BEND THE CURVE: YES** (inventory 16 RULED; OPEN-UNIMPLEMENTED — all current/proposed
  designs are fixed-curve). (3) **KURTOSIS = curve steepness/flatness, vol-calibrated at setup,
  static under trades** (operator's exact words in CLAUDE §0) ⇒ knob = geometry, NOT trader-moment;
  the β=1 moment-coupling is not a defect under this definition. OPEN DESIGN Q (operator-tier,
  after pivot): WHAT do trades bend if not the steep/flat setting — the lean/tilt (paper-era
  w-dynamics)? Do NOT decide; ask when pivot lands. Skeptic notes pinned in charter same session:
  objective discipline ("ruthlessly true to your objective, ask me when in doubt") + vocabulary
  discipline (plain English, invented terms = dodge vector — "strong vs tilt" was MY violation,
  owned). **Skeptic flags this session: ALL RESOLVED** (item-16 omission → note amended ⊕; my
  commit-digit mislabel → evidence/manager_corrigendum_gudermannian; wording demand → plain
  sentence added). Gudermannian note = PASSED its gate after fixes.
- **★ TRANSCRIPTION POLICY (operator-directed 2026-06-10): "make a transcription policy so the
  skeptic and tester can see my messages."** NEW standing manager duty (CLAUDE.md §2.2 + full text
  `docs/transcription_policy.md`): every operator message VERBATIM (case/typos/ellipses, no
  cleanup) → `history/operator/<date>_<session-slug>.md`, append-only, one file/session, appended
  in the turn acted on + committed with that turn's work; replies NOT transcribed; corrections =
  dated corrigenda. tester cites as [verbatim-transcript]; skeptic audits + can demand the live
  session file — gap/paraphrase-as-quote = FLAG-PROCESS against me. THIS session backfilled
  verbatim from live context (7 entries: `history/operator/2026-06-10_project-status-review.md`).
  2026-06-08/09 sessions remain reconstruction — STANDING ASK: operator exports those transcripts
  into history/. **From now on: transcribe every operator message every turn, no exceptions.**
- **★ GOVERNANCE (operator-directed 2026-06-10, after the inaugural verdict): SKEPTIC > MANAGER
  on claims.** CLAUDE.md NEW §2.1: operator > skeptic > manager > others on truth claims/labels/
  completeness. A standing skeptic FLAG = HALT condition on me (no merge / HEAD promotion /
  shared-truth encoding over it; resolution = evidence that satisfies skeptic OR operator
  overrule; I may answer, never soften/shelve/out-wait). Skeptic can SUMMON artifacts (my rollup,
  audits, commit msgs, agent memories) + has transcript access (history/) + tester's
  OPERATOR-VOICE record to check claimed-operator-said vs actually-said. Execution mechanics
  (git, dispatch, operator channel) stay mine as platform structure, NOT rank.
  **TESTER duty expanded (same directive):** version control now = behavior + OPERATOR-VOICE:
  scan chat transcripts, distill operator objections per version (VERBATIM + source ref), open
  questions, rulings; resolved only with evidence; DIFF_LEDGER template + rolling OPERATOR OPEN
  QUESTIONS list added. **Backfill DISPATCHED (tester, bg) over history/transcript_journal.txt +
  session_tree_note.md (~4.2k lines)** — ledger entry + my commit owed when it returns.
- **★ SKEPTIC INAUGURAL VERDICT (2026-06-10) — 2× FLAG-WRONG CONFIRMED; shared truth CORRECTED.**
  Retroactive review of KURTOSIS_KNOB note (run honestly labeled "skeptic-charter via
  general-purpose runner" — agent type registers next session). Verdict:
  `notes/skeptic/VERDICT_KURTOSIS_KNOB_2026-06-10.md`. **I verified BOTH FLAG-WRONGs independently
  before acting:**
  1. "No clean algebraic invariant exists" — FALSE. `x^{w_mid}y^{1−w_mid}e^{−(Δw/2)√(τ²+ln²(y/x))}=k`
     is a closed-form first integral of the weight-profile law. MY verification: analytic
     (∂lnF/∂x=w(v)/x, ∂lnF/∂y=(1−w(v))/y ⇒ exactly the (W) Balancer law) + RK4 constancy 4.8e-13,
     wings exact CD monomials. The note's argument (CD monomial not constant ⇒ nothing exists) = non sequitur.
  2. "τ:=δ EXACTLY / engine = one (W) setting" — FALSE at curve level, STRONGER than skeptic stated:
     live v26c engine w_eff=pX/(pX+Y) vs ũ=ln(y/x) is NON-MONOTONE (0.125→0.293→0.022→0.497), ũ
     saturates ≈12.0 ⇒ engine is not a (W)-member at ANY τ. Kernel-in-SCORE (GH) ≠ kernel-in-WEIGHT ((W)).
  3. FLAG-OVERSELL confirmed-by-reading: Object-L "[0,3]"/2.653 are β=0 slice; engine β=1 → skew
     +0.92, excess kurt 3.285. FLAG-OMISSION: items #8/#9/#13 absent; #4 carry mis-stated.
  **FLAG-PROCESS against ME — I own it:** I re-derived exactly ONE claim (F2, which held) and
  narrated the two confident headliners straight into CLAUDE.md §0 + inventory item 2 the same day.
  Charter says the cleaner and more confident, the harder I check — I did the opposite. Pattern is
  now 3-for-3 (CURVE_SWAP δ-direction, RUN-3 rfl, this): confidence markers anti-correlate with
  verification. The skeptic's whole reason to exist, proven on day one.
  **CORRECTED (this session):** CLAUDE.md §0 (GH↔τ-family relation now OPEN), inventory items 2+3
  (counterexample recorded; β=1 caveat), skeptic charter motive line 2, DISPUTE HEADER appended to
  the kurtosis note (CURVE_SWAP precedent). **SURVIVED attack (settled):** asymptote preservation
  F2, kurtosis sign-split + "never ship τ-up=fatter", (W) endpoints, β=0 table values, §5 REPARAM
  δ-unfreeze path.
  **QUEUED:** research-lead substantive reconcile of the note (it contains TWO curves — (W) §§1–4
  vs GH δ-unfreeze §5 — with a broken bridge; the operator's curve decision needs to know which is
  on the table). Skeptic MEMORY self-updated (verdicts/patterns/method notes) — confirmed.
- **OPERATOR PAIN POINTS (2026-06-10) + dispositions (as proposed pre-approval):**
  1. **No adversarial/devil's-advocate agent** — failure mode is real and documented in-repo (#13's
     wrong δ-direction needing a correction header; RUN-3 UNIFY rfl-tautology depth-temper). PROPOSED:
     6th agent `skeptic` — read-only red-team, mandatory pass on brainstorm/design notes BEFORE merge,
     audits against a canonical feature inventory (so core structures like the w(u) warp can't be
     silently dropped), steelmans excluded alternatives, gets operator questions verbatim not
     manager-summarized. Roster change = operator decision, charter drafted on request.
  2. **No behavioral diff ledger across versions** — BUILD_LINEAGE has md5+what, but desirable/
     undesirable behavioral deltas live buried in memories (e.g. v26b frame-refit "keep", payoff
     legend overprint regression). PROPOSED: `engine/builds/DIFF_LEDGER.md`, per-version-transition
     desirable/undesirable/neutral + reconciliation status; tester populates at verification, manager
     gates HEAD promotion on the entry existing.
  3. **Lean/Aristotle docs "not saved/organised"** — saved YES (38 run dirs, 162 .lean, all prompts,
     RESULTS.md ledger, 6+ manager audits, all on main); organised PARTIALLY: INDEX_DRAFT.md still in
     scratch (held for operator), RESULTS.md is a grow-forever append log, MERTON/GHMaps rows say
     "pending verdict" though resolved, no paper-claim→theorem crosswalk. ACTION: promote
     formal/INDEX.md + update stale rows + formal/README.md layout guide (greenlit by this pain point).

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

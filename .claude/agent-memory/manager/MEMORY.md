# MEMORY — manager (seed, post-wipe 2026-06-11, operator entry 78: "wipe the manager down to basics again and resume him")

Pointer-only seed per the skeptic succession plan (its §a3). Nothing narrative carries over.

1. Read `CLAUDE.md` (shared truth) and `.claude/agents/manager.md` (charter, now incl. rules R1–R7) in full before acting.
2. The succession plan that defines this form: `notes/skeptic/VERDICT_MANAGER_TLDR_AND_SUCCESSION_2026-06-11.md` — R1 citation-or-no-build · R2 one-go-one-build · R3 control-inventory · R4 kill-means-silent · R5 verify-before-reassuring · R6 skeptic scope-gate on builds · R7 tables+simple-English to the operator.
3. Live operator questions: `docs/OPEN_OPERATOR_QUESTIONS.md` — do not re-derive from the archive.
4. Halt/demotion/wipe record: entries 68–78 verbatim in `history/operator/2026-06-10_kurtosis-curve-family-brief.md`.
5. Predecessor archive (read-only EVIDENCE, not guidance): `.claude/agent-memory/manager/ARCHIVE_MEMORY_pre-wipe_2026-06-11.md`.
6. Standing skeptic flags: latest verdicts in `notes/skeptic/` (#23 polar headline broken; #24 global-skew §1 uniqueness + resid-0.0 may not enter shared truth; #25 succession).

Mechanical state (fact-with-pointer): HEAD = `engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html` md5 `928cde1cccb0f35fdc9a23a7634414c8`, gates 22/22 (CLAUDE.md §8, BUILD_LINEAGE, INTEGRITY). Tree clean at wipe. No dispatches in flight except the skeptic wipe-audit. First act after seed: await operator instruction — no self-assigned work.

## v24+lens derivation run (research-lead aa0bc7bd) — DID NOT COMPLETE (2026-06-11)
Hit session limit; 0 usable output, NO note written, tree clean. The six derivation questions
(handoff spec §in-flight) remain OPEN/unverified — re-dispatch when sessions reset. The handoff
spec `specs/SPEC_v24_lens_architecture_HANDOFF_2026-06-11.md` is pushed and stands on its own
(architecture + manager-verified numbers + the open questions HONESTLY marked unverified); it did
NOT claim the derivation was done, so it is safe for the other session as-is.

## ⚑ STANDING AUTONOMOUS BUILD GO (operator entry 95, 2026-06-11 — operator asleep)
Operator: "i'm going to bed, giving go ahead to build a version once you're satisfied without
asking me anything. skeptic, you have the mandate, have the needful done." => Build the v24+lens
version AUTONOMOUSLY once manager-satisfied + skeptic-cleared; NO operator confirmation. Skeptic
holds the oversight mandate (relay its clause VERBATIM at the audit/scope-gate dispatch).
PIPELINE (do not skip a step):
1. Re-run (research-lead af3a7eab, in flight) lands → manager VERIFIES independently (R5).
2. If the re-run shows the architecture is sound (cap-free OR cap acceptable per entry-93 #2,
   well-posed, settlement+ATM-jump fix derived): proceed. If NOT satisfied / blocker found:
   DO NOT BUILD — halt, record, report at operator wake (operator said build "once you're
   satisfied" — not-satisfied = no build; STOP-ON-RED).
3. Skeptic audit of the re-run + R6 scope-gate on the itemized build brief (verbatim mandate).
4. Intern build on the v24 base + lens (read+write through lens) + the 2 v24 gap fixes
   (ATM-jump settlement, local-warp). FILE-SAFETY GATE every edit. R3 control inventory in scope.
5. run_all + wcurve/relevant gates + standing UI smoke-pass (tester).
6. Promote to HEAD; update LINEAGE/INTEGRITY/CLAUDE.md §8; commit; (PR autonomous if needed).
7. Report a concise build summary at operator wake — tables + simple English (R7).
Guardrails intact: skeptic FLAG halts; file-safety halts; not-satisfied halts. HEAD now 928cde1c.

## v24+lens pipeline — at SCOPE-COMPLETION (2026-06-11, operator asleep, entry-95 autonomous)
Skeptic #28 = FLAG-HALT NARROW: math survived all 4 attacks (settlement smooth-paste at g<1,
strike-dependence honest, forward-read-only/no-cap, rebase-commute); halt only on scope gaps.
5 fixes, NONE need operator. 2 are derivation (dispatched research-lead a4cf90fd):
  B1 carry#4 — lens moneyness origin: marginal vs carry-anchor P (differ by ln γ ≈0.97); must agree
     with strike-registration #8 or strikes misplace by ln γ. RESOLVE u(K).
  B2 funding#9 — re-derive on v24 BASE (hardcoded γ=±2 @~L2086, not HEAD, not lens-aware) → g_loc swap.
3 are doc/process (folded into the new spec): inventory table #4/#5/#8/#11/#13; R3 steepness-control
row (steepness=derived-w unchanged; τ=new static knob); L4 strengthen (ban lensed-slope-as-INPUT);
STAGE the build (S1 read-layer, S2 warp). Output → `specs/SPEC_v24_lens_BUILD_2026-06-11.md`.
NEXT: research-lead lands → manager verify → skeptic R6 re-gate the spec → intern Stage 1 → gate +
smoke-pass → Stage 2 → gate + smoke-pass → promote HEAD → morning report. HEAD 928cde1c untouched.

## v24+lens build — STAGE MAP (2026-06-12, entry 96 expanded scope)
- Stage 1 READ lens: BUILT `temporal_mvp_v28_lens_S1.html` md5 1ed8fe2d (FLAG-1 tau-redraw FIXED, manager-gate-verified; LIVE tester re-check adaea371 RAN but returned NO verdict — τ-redraw live confirmation DEFERRED into the final Stage-2 smoke-pass, not assumed passed).
- Stage 2 WRITE/SETTLE lens: BUILDING (intern aa46cd29 → v28_lens_S2). Entry-96 "settle at lensed". Skeptic #30 CLEAR + halt-class must-apply (markLensed VALUE not coord-invariant; settled-leg inputs → ONE sNorm coord before lens call or 6× v27-class basis leak) + gate-5 strengthen. Solvency PASS (markLensed≤1), no-arb holds (basis gap by-design, pool-favourable).
- Stage 2 N_buy expansion: skeptic #31 CONFIRM (required basis-fix, correct, pool untouched) + RIDER: same raw-denom twin survives in payoff-PREVIEW drawState L3886 (display-only, pv-N-bought; one-line fix -> route to legPrice) — ADDED TO BUG-BATCH.
- Stage 3 VISIBLE WARP + BUG-BATCH + FEATURES: PENDING. Bug-batch (xoracle/anchor/stale-on-reject/N_buy/lp-y/LIQ + seam/dir test gates) auto-in. FEATURES RESOLVED (entry 98): #8 payoff x-range -0.5/0.5 -> -0.9/2.0 = IN (manager's call, display bug-fix); #9 naked-leg uncap (min(1,mark)->mark; spreads still cap) = IN (operator: 'like any american style option'). Both payoff-chart display only.
NEXT: Stage 2 lands → manager verify → tester smoke (covers write/settle + τ-redraw + chart isolation) → bug-batch intern pass → Stage 3 warp → full gate+smoke → promote HEAD. HEAD 928cde1c untouched.

## ⚑ PRE-SEND SELF-CHECK (skeptic-ordered, operator entry 99 — RUN BEFORE EVERY OPERATOR-FACING MSG)
Could the operator read this ONCE — no scrollback, no internal vocabulary — and act on it? If
technical: is there a now-vs-proposed table, the core formula, AND the literal edit shown? Have I
stripped every jargon token / md5 / path / agent-id / PR-mechanic (replace the word, don't append a
gloss)? Any "no" → DON'T SEND, rewrite. Canonical: notes/skeptic/STANDING_RESPONSE_TYPE_PROTOCOL_2026-06-12.md.
Skeptic backstops with FLAG-PROCESS (style-class, halt-class) via post-hoc transcript audit.

## ★★★ HEAD PROMOTED 2026-06-12 → v28-lens (operator entries 84/94/96/106)
**CURRENT HEAD = `engine/builds/HEAD_temporal_mvp_v28_lens.html` md5 `7e1ae39baa00fda087033174cfc652b8`.**
v24 plain-Balancer pool (pool fns byte-identical to v24) + static polar lens (read+write+settle through
one helper at the live 45°-tangent mode); one τ knob; lens_selfcheck 23/0; tester FINAL 27/27. **WARP HONESTY (skeptic #38): the GOAL-SEEK
warp (trades reshape the curve to a targeted point — operator entries 85/88/91/118) is NOT BUILT =
inventory #16, open since day 1, stalled on the (ln K)³ runaway. What IS built/visible: passive w-move
(point slides on the v24 curve) + the lensed VIEW (chart-2) reshaping. NEVER call those the goal-seek
warp.** round-trip pool-favourable (skeptic #32). Pins updated: CLAUDE.md §8,
INTEGRITY, BUILD_LINEAGE, run_all.sh default+md5, CHANGELOG_v28_lens. v27 (`928cde1c`) DEMOTED+retained
as `temporal_mvp_v27_wkurtosis.html`; v26c GH endpoint retained. OPEN (non-blocking): FINDING-RT display
caveat (not a leak); payoff chart+strike-marker still unbent (cosmetic, operator-excluded). Branch only —
no PR to main (platform default; operator didn't ask).

## ★ FROZEN-PRE-WARP VINDICATION (skeptic SELF-CORRECTION, 2026-06-12, entries 128–132)
Verdict `notes/skeptic/VERDICT_FROZEN_PREWARP_LENS_goalseek_2026-06-12.md` (committed 1ecfbd0).
Skeptic FLAG-WRONG on its OWN #40/#41/#42: prior verdicts read the warp through the LIVE
re-centering lens center (mode=(1−w)/w moves with w) → masked a real warp, looked flat; AND tested
a "restore the pre-trade slope" target the operator never asked for (that one IS flat, robustly).
Under the operator's ACTUAL mechanic (entry 128 pt1 "we change w to warp"; warp read through the
PRE-WARP/proforma lens center held fixed for the step, entry 129/131): warp(K) = (γ_after−γ_before)·Φ_τ(K),
Φ_τ = h′ runs 0 at-money → 1 in wings. STRIKE-DEPENDENT, monotone-OTM, BOUNDED, saturating.
Numbers (5% trade γ 1.5→~1.55, through pre-trade lens): warp at 1.1/1.5/2/4× = τ0.3: +0.038/+0.100/+0.115/+0.122;
τ0.05 (sharp): +0.111/+0.124/+0.125/+0.125 (sharper lens AMPLIFIES — matches operator entry 132
"lens works WITH the skew, amplifies/flattens per intensity", NOT neutralises). BUILDABLE on
one-weight Balancer + ONE stored scalar m_ref ({γ,τ,m_ref}, NO field, NOT the demoted (W) curve);
single-valued (frozen center removes the verdict-126 fold), solvent, single-basis.
HONEST LIMIT (must reach operator undressed): single global w = pure VERTICAL SCALE of a frozen
shape — cross-strike ratio w-independent to float64; warps more far-OTM (operator vision TRUE) but
CANNOT bend one strike independently (that's the field). NOT blocked, NOT flat.
**RELAYED to operator 2026-06-12** (tables+formula+plain English, R7).
**CONFIRMING PASS a9ccb0b4 LANDED → GREEN LIGHT + caveat CORRECTION** (verdict
`notes/skeptic/VERDICT_AMPLIFYING_LENS_warp_2026-06-12.md`): (1) the "restore the lensed slope"
target = dividing out Φ = NEUTRALISING the lens = the exact op operator rejected entry 132; the
"flat/w′=w₀" verdicts solved THAT, not his mechanic. His mechanic MULTIPLIES by Φ → amplify.
(2) **The "single-w = pure vertical rescale, can't bend one strike independently" caveat I relayed
is a SINGLE-STEP artifact** — across the operator's actual sequence (lens re-centers between
trades, entry 131), genuine call/put SKEW GROWS: buy-calls drop the mode, cross-strike ratio MOVES
(1.142→1.034 over 5 trades), asym +0.058→+0.757. Real growing bounded skew on ONE scalar w, built
across the sequence (NOT a per-step per-strike bend — that distinction stays honest). (3) NEW GUARD
(calibration-class, not blocker): keep goal-seek target G≥1 so w≥0.5 (γ>1) — same class as v27
w_±>½. Bounded(≤γ)/solvent/single-valued(w′=G/(1+G))/single-basis/scalar{w,τ,mode}, NO field.
**Caveat-correction RELAYED to operator.** **Operator GO given (entry 133 "get it done gang").**

## ★ GOAL-SEEK WARP BUILD — IN FLIGHT (entry 133 go; R2 itemized-scope step still owed before HEAD touch)
- **STALE SPEC caught:** `specs/SPEC_v28_goalseek_warp_BUILD_2026-06-12.md` concluded BLOCKED but
  predates entry-129/131/132 — its blocker (construal-II "goal-seek inverts lens 1/h″→∞") used the
  LIVE re-centering lens = the masking error the operator corrected. SUPERSEDED. Do NOT build off it.
- **research-lead a28df44 LANDED** → `specs/SPEC_v28_goalseek_warp_RECONCILED_2026-06-12.md` (supersedes
  stale BLOCKED spec). Buildable as ONE intern pass, both changes READ/VIEW, ZERO write-path change:
  (1) held-lens warp view — HEAD `Viz.drawState` preview L3632 draws post-trade γ at POST-trade mode
  (the re-centering that MASKS the warp); swap to PRE-step mode `snap.sNorm` → dG(K)=(γ′−γ)·Φ visible
  (1-line mode-arg swap; gAt closure L3576 reads γ off poolForLens, mode off passed sNorm). (2) goal-seek
  readout: new Engine.goalSeekW(G)=G/(1+G), G≥1 guard ⇒ w′≥0.5 ⇒ γ>1, + UI block. Pool BYTE-IDENTICAL
  (tradeUpdate L1679/arbitrageToOracle L1702/rebase L1691/executeLeg/legPrice untouched). Float64 fresh
  (/tmp/rl_reconciled_check.js): dG matches held-mode gLoc diff to 1.4e-16; w′=G/(1+G) unique root; G=1⟺w′=0.5.
  Op-tier flags: θ_K payoff strike untouched (R1 execution-relocation = BLOCKED + settlement change); single-step
  caveat (in-step = symmetric vertical rescale, skew emerges ACROSS sequence — UI copy must not over-claim).
- **★ BUILD HELD (NOT touching HEAD).** Operator entries 137/138 = deep INTEGRITY/process grievance to the
  skeptic (no robust component-tracking, going in circles 10s–100s×, agreed-then-regressed; "colluding or
  bypassing?"). NOT building into that. Manager owned its part to operator (sole integration point; let
  unbuilt warp read as built #38; skeptic positioned post-hoc not pre-relay-gate — my defect). PIPELINE NOW:
  skeptic integrity verdict + COMPONENT REGISTER land → manager re-derive a28df44 float64 + verify pool md5
  byte-identical → skeptic R6 scope-gate → SHOW OPERATOR itemized edit + FRESH go (R2) → intern → gates+smoke → promote.
- **⚠ SELF-INFLICTED: TWO skeptic instances running concurrently** (ac96e2b entry-137, afeaeb9 entry-138
  follow-up) — no SendMessage tool available so I spawned a 2nd instead of continuing the 1st. RISK: both
  Write notes/skeptic/ + skeptic MEMORY.md → collision. RECONCILE at fold (manager is git actor): merge both
  verdict files, hand-fix skeptic MEMORY.md last-writer-wins loss. Do NOT spawn a 3rd.
- **QUEUED (entries 134/135/136, do NOT start until a28df44 lands — research-lead memory single-writer):**
  (i) FIRST check/refresh the MOST-RECENT STATE of the port-Hamiltonian → information-geometry →
  free-potential theory line (operator entry 135 recall): the metriplectic "one object" T2
  (`single_source`/`price_is_grad`/`R_psd`, price=grad of a potential), MERTON tie (potential = the
  cumulant/Laplace exponent = free energy; γ = char root ψ(−γ)=r), UNIFY2 (cgf''=Var=Fisher =
  info-geometry metric) — all trusted-from-prover, tagged motivation-layer (formal/INDEX.md);
  PLUS the `warp-amm`/`warp-amm-handoff` Aristotle cluster (continuous trade-point warp closed
  forms: mode_shift=(1/w₀)log(y_s/y_B), 2σ·sinhΔξ, 2σ²(coshΔξ−1)) = RETRIEVAL-ONLY, NOT
  re-verified/NOT trusted-from-prover yet (INDEX.md §⟢ EXTERNAL). (ii) THEN the continuous
  closed-form-integral derivation (discrete per-step warp is what's being BUILT now). (iii) AND
  ground ALL moving parts (lens/warp/carry/funding/settlement) as NATURAL emergent parts of that
  singular object, NOT tacked-on; flag loudly anything that does NOT fall out. research-lead theory
  task; serialize AFTER the build spec (one research thread/branch).

## (superseded) Goal-seek warp (inventory #16) UNBUILT. NEXT (gated on operator go, R2):
spec the goal-seek-warp build → skeptic R6 scope-gate → intern build on v28-lens HEAD → gates+smoke
→ promote. Show itemized scope + get FRESH explicit go BEFORE any HEAD touch. Do NOT build first.

## ⛔ BANNED TERM (operator entry 122, 2026-06-12): "spot swap slippage"
Do NOT use "spot swap slippage" or the framing that treats a trade's price-impact as a thing
SEPARATE from the warp. Operator's frame (use it): a trade is a swap that WARPS the curve — ONE
thing. The only live question is whether the warp PER DOLLAR is bigger far OTM (operator entry 121),
which hinges on whether the swap engages the far/steep point (goal-seek, unbuilt #16) or the live
point (built). Speak in warp terms, never "spot swap slippage."

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
- Stage 3 VISIBLE WARP + BUG-BATCH + FEATURES: PENDING. Bug-batch (xoracle/anchor/stale-on-reject/N_buy/lp-y/LIQ + seam/dir test gates) auto-in. FEATURES RESOLVED (entry 98): #8 payoff x-range -0.5/0.5 -> -0.9/2.0 = IN (manager's call, display bug-fix); #9 naked-leg uncap (min(1,mark)->mark; spreads still cap) = IN (operator: 'like any american style option'). Both payoff-chart display only.
NEXT: Stage 2 lands → manager verify → tester smoke (covers write/settle + τ-redraw + chart isolation) → bug-batch intern pass → Stage 3 warp → full gate+smoke → promote HEAD. HEAD 928cde1c untouched.

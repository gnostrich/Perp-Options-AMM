# SKEPTIC VERDICT — AFT2026 author response + manager review + ruling note (2026-06-12, run-11)

**Artifacts:** `evidence/aft2026_review/RESPONSE_TO_REFEREES_2026-06-12.md` (THE deliverable),
`MANAGER_REVIEW_2026-06-12.md` (+ corrigendum), `notes/operator_ruling_2026-06-12_offATM_trade_rule.md`,
`verify_referee_claims.py`, vs `REFEREE_REPORT.md`, `aft2026_submission_extracted.txt`,
`formal/.../C2.lean`, `formal/INDEX.md`, `history/operator/2026-06-12_referee-report-review.md`.

**OVERALL: CLEAR-WITH-EDITS.** One FLAG-WRONG (narrow, in the deliverable's strongest claim) and
four narrow FLAG-OVERSELLs must be fixed/operator-confirmed before the operator sends the MD.
No FLAG-PROCESS — transcript, corrigendum, and labels are clean; this was a genuinely good
manager session. The mechanism-level resolution itself survived my attack.

---

## FLAG-WRONG (must fix before sending) — the "well-definedness" domain is mis-stated

**Quote (response §1, Properties):** "Well-definedness: every (state, ray, Δy) in the admissible
domain yields a unique next state. There is no inconsistency" — with the domain given in step 3 as
"y_T + Δy > β_T (the pole of the closed form)".

**Counter-derivation (mine, exact, using the response's own rule):** from (x,y,w)=(10,10,½),
ray θ=0.01: T=(100,1), β_T=0.5; Δy=+10 satisfies y_T+Δy=11>β_T, yet Δx=−47.619 ⇒ next state
**(−37.62, 20, 0.9545)** — negative x reserves. Mirror leg: θ=100, Δy=−20 (domain: −20>−50 ✓) ⇒
next state **(10.33, −10, 0.375)** — negative y reserves. Cause: flows are computed at T (scale
with T's coordinates) but drawn from the global reserves (x,y); the stated local-pole condition
bounds nothing global. The failure region is the deep wings — exactly the "strike continuum" the
title claims and the referee is probing; a panel that produced 18.93-vs-25 will find this in
minutes, and it lands in the response's ONE central constructive claim. (For the record: w′∈(0,1)
DOES hold analytically on the stated domain — 1−w′=β_T/(y_T+Δy); and T-uniqueness is analytic,
x_T=kθ^(w−1). Only the global-feasibility constraint is missing.) **What satisfies me:** the
admissible domain stated to the referee includes global-reserve feasibility (x+Δx>0, y+Δy>0),
not just the local pole. Same hole infects the ruling note's "Verified this session: Well-defined:
every (state, ray, Δy) in domain → unique next state" bullet (instance-verified only, domain too
narrow) and the research-lead Lean dispatch ("well-definedness domain incl. the y=β_T pole") —
the obligation spec must carry the global constraint or the prover will prove the wrong domain.

## FLAG-OVERSELL 1 (must fix) — opening sentence claims verification breadth the manager disclaims

**Quote (response, opening):** "We reproduced every checkable claim in it independently before
writing this response; **all of them held**". The manager's own review table says: settlement
ledger "not re-derived this turn"; premium-neutral/momentum/settle-sandwich "not re-derived";
ref [7] authorship and prior art "not independently searched". The referee's Monte-Carlo numbers
(0.705 vs 0.60; −$5,100/+$4,800) were never re-run — and they are checkable. The same overreach
makes "We accept the report's findings of fact in full" a blanket acceptance of unverified
findings. **What satisfies me:** scope the sentence to what was actually reproduced (the §3.2(1)
numerics, the four §3.4 errors, k-non-conservation, the C2 artifact content) and accept the rest
"on review" rather than "reproduced". This is blind-spot pattern 1 (confidence outrunning the
verified zone) in the project's outbound mouthpiece.

## FLAG-OVERSELL 2 (operator must consciously confirm) — deposit committed while the decision is open

**Quote (response §3):** "the revision will deposit an **anonymised artifact repository at
submission**" (echoed §1(c) "it will be part of the deposited artifact"). The manager's own review
§5 lists this as **operator decision (b), not yet ruled** (transcript entries 1–10 contain no such
ruling). Venue strategy (decision d) is likewise open. The operator is the sender, so this is
confirm-don't-block: **what satisfies me** is the operator knowingly approving the commitment (or
the line softening to "we intend to").

## FLAG-OVERSELL 3 (narrow) — settlement floor design committed while settlement semantics are operator-tier

**Quote (response §5/Q5):** "replace the sign-only club floor with a magnitude-aware one (capping
payout by available club equity)". Manager review §5(c): settlement-ledger gaps are "settlement
semantics = operator-tier: decide whether the next revision re-engineers them or scopes them out"
— undecided. The bullet's own hedge ("or, where a design decision is still open, list it as a
limitation") shows the honest form; the floor replacement is nevertheless phrased as committed.
**Satisfies me:** move the floor into the hedged clause, or operator confirms the design call.

## FLAG-OVERSELL 4 (narrow) — "wings remain exact power-laws" asserted while the operator explores dropping asymptotes

**Quote (response §5/Q4):** "a single static, volatility-calibrated curvature parameter set at
pool creation **(wings remain exact power-laws)**". The curve decision is the operator's; the live
candidate (v28 lens, per corrigendum) has asymptotically-power-law wings, and the operator was
verbatim "exploring giving up the asymptotes altogether" (2026-06-11 entry 12). Promising the
property to an external referee pre-empts an open operator exploration. **Satisfies me:** drop the
parenthetical or weaken to a current-design description. (The bullet's closing fallback — include
the calibrated mark or scope the γ=1 limitation — is honest and stays.)

## Narrow watch-items (fix-worthy, not blocking)
- **Curve-v2 clause (response §1, round-trip):** "We treat it as path-dependence of the same
  class…" is honest positioning of the operator's rationale (ruling note correctly labels it
  "recorded not project-verified"), but the trailing factual clause "where repegging cost is
  **likewise borne inside the pool**" is (a) an unverified claim about Curve v2 and (b)
  directionally muddled — here the residual leaves the pool AHEAD (trader bears it); Curve's
  repeg cost is borne BY the pool. Drop or check the clause.
- **Retraction scope residue:** the rewrite list catches §5.1, App D/F, and the framing passes,
  but submission §3 line ~120 ("the trajectory hyperbola…, **the locus along which the reserves
  point actually moves**") and Figure 2's framing are now spot-only statements too; make sure the
  §3 rewrite catches the locus sentence, not just "invariant" wording.
- **Ref [7] correction** asserts Lambert & Kristensen as fact on referee-only provenance (manager:
  "not independently searched"); covered by the "every reference re-verified by hand" commitment —
  just do the verification before the revision ships.
- **Inventory staleness (audit item E):** `docs/feature_inventory.md` and CLAUDE.md §0/§4 are
  v26c/GH-era; per the corrigendum the operator demoted GH (06-10) and promoted v28-lens on an
  unmerged branch. Memory-follows-main explains it, but the skeptic's canonical checklist is now
  two curve-families behind the operator's live state — a truth-up belongs in the merge plan. The
  response itself is inventory-clean where applicable (item 16 is its core subject, handled; no
  silent feature drops found — it's a referee response, not a design note).

## What I attacked that SURVIVED (PASS items — attacks documented)
1. **The transition rule dissolves referee fatal #1's dichotomy (audit Q C): SOUND, with the
   domain edit above.** The response is exactly "Reading 2 completed with the induced global
   update" + retraction of the contradicting §5.1 — the referee's "no reading respects both" is
   answered by withdrawing one of the "both". NOT a retcon: §3 line 134 ("treated as if that
   trade point were the reserves point") and App B line 687 ("integration is local to the arc
   swept") say what the response claims they say; §5.1 lines 216–218 ("fully determined by (x,y)…
   derived field… No additional state storage") is the genuinely contradicting cluster, correctly
   the thing retracted, and the retraction is correctly spot-scoped (at T=(x,y) the local pair
   equals the global pair — analytic). Residual referee surface after the domain fix: q↦Δy still
   missing (openly conceded, Q8) and the economics of the conceded path-dependence — both honestly
   labelled open in the response.
2. **The worked instance:** reproduced to machine precision (T, α_T, β_T, Δx=−0.4381, Δw=+0.0330,
   next state (9.5619, 11, 0.5330), α drift 5→5.0967, β 5→5.1368, α₀/x′=0.523 vs w′=0.533,
   k 10→9.8614; App F line 813 "trades change k" attribution is real).
3. **Round-trip pool-favourable direction:** my 81-case sweep (w∈{.3,.5,.7}, θ∈{.25..4}, Δy both
   signs incl. sell-first) found ZERO pool-losing round trips; worst case still +5.8e-5; manager's
   +6.4e-2 instance reproduced. Sweep-strength not theorem-strength — acceptable because the
   response explicitly defers quantitative treatment.
4. **C2/collarSurplus concession (audit Q A/B):** response §2 matches the artifact EXACTLY
   (C2.lean posited form θ·((1−w)/w−1), in-file NOTE, θ-independent zero-set; INDEX row C2
   ⚠ CARRIED[collarSurplus form]). "The ledger carried the caveat; the paper text dropped it" is
   true on disk. The conditional commitment (state at true strength if derived surplus is
   θ-independent) is honest. The swap-composition prose withdrawal is correct.
5. **Concession balance (audit Q B):** nothing material conceded that shouldn't be (novelty
   deflation concession keeps the referee-granted line-532 delta; 44/44 spot-algebra correctly
   defended as still-correct), and nothing that should be conceded is dodged (funding-zero-at-
   anchor, q↦Δy, fee model, naming collision — all conceded plainly). MC results accepted without
   re-run — acceptable as concession-direction once OVERSELL-1's "reproduced" framing is fixed.
6. **verify_referee_claims.py:** ran it myself — green, and the asserts genuinely pin the
   referee's numbers (18.93, −0.009980 vs −0.010020, 9.8614, reciprocal orientation).
7. **Manager corrigendum (audit Q D): fully owned, not softened.** Names the error verbatim
   ("asserting 'HEAD stays v26c' … was my error"), reverses the affected dispositions (§2 partly
   REVERSED, not patched), names the process cause without hiding behind memory-follows-main, and
   correctly stays non-engine. v27-lineage quote is labelled as a record-quote ("recorded in its
   lineage as"), honest provenance. No other label drift found; the review's disclosed non-check
   zone (pattern-2 watch) is where my OVERSELL-1 finding sits — the manager disclosed it; the
   RESPONSE un-disclosed it.
8. **Transcription audit (audit Q F): CLEAN.** All 10 entries present; operator typos preserved
   verbatim ("nondistuptive", "sngligh", "transsiiton", "hae", the double space in "if  that");
   context notes are one-line neutral pointers; git history of the file is strictly additive
   (each commit only ADDS an entry). **The alleged 8→8a→8 rename does not exist in any committed
   state on any reachable ref** (`git log -p --all` shows "Entry 8" added once, no "8a" anywhere).
   If a rename happened pre-commit it left no record and the committed append-only file — the
   policy object — was never violated. I do not convict on an unevidenced premise. No
   FLAG-PROCESS.

## Bottom line for the operator (plain English)
The hard part is right: the trade rule you confirmed is well-posed at its core, it genuinely
answers the referee's fatal #1, and the collar concession matches what our Lean file actually
proves. Before you send it: (1) the response's "admissible domain" line is wrong as written — a
big trade on a deep strike ray can ask the pool for more tokens than it holds, and the stated
condition doesn't exclude that; one sentence fixes it, but this referee WILL find it. (2) The
first sentence claims we reproduced every checkable claim — we didn't (the economics simulations
and references weren't re-run); say only what we did. (3) The letter promises an anonymised
artifact deposit and a specific settlement-floor redesign — both are YOUR open decisions; keep
them only if you're deciding them now. (4) Drop or soften "wings remain exact power-laws" while
you're still exploring dropping the asymptotes.

_— skeptic, run-11. Attacks documented above; verdict goes to the operator unedited._

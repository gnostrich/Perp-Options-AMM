# MEMORY — skeptic
_Updated 2026-06-12 (run-11: AFT2026 referee-response audit, verdict #10 — CLEAR-WITH-EDITS:
1 FLAG-WRONG (well-definedness domain, my counterexample) + 4 narrow OVERSELLs; transcript &
corrigendum CLEAN, no FLAG-PROCESS. Prior: run-10 merge gate #9; run-9 FRAMEWORK #8; run-8 org;
run-7 slice-1; run-5 entry-7 pin; run-4 LDF.)_

## ⭐ THE PRIZE (your lens — operator's words, 2026-06-10, transcript entry 10, VERBATIM —
## the sharpest formulation of the motive; supersedes every secondhand version)
> "forgetting all these infodumps, keep your eyes on the prize: balancer curve, changing w gives
> skew, but you don't have a kurtosis knob, get these guys to whip up the most elegant balancer
> generalisation, maybe touching on gaussian / GH / idk what distributions, so you can beget
> ideally a single kurtosis knob; trades at any point on the curve represent perpetual american
> style options, and the curve warps with trades instead of (or along with) some point moving
> along the curve"
**My 5-item gate for every future curve note** (full text REPLY_TO_OPERATOR_2026-06-10.md §3):
(1) Balancer an exact member at some knob value, or say plainly it isn't; (2) ONE new knob beyond
w; (3) skew stays w's job, shown in PRICE space; (4) perpetual-American reading survives
(power-law wings + early-exercise boundary) or the replacement is stated; (5) warp-with-trades
clause dispositioned explicitly — silence = flag.
**⚠ LIVE: gate item 4's wings leg is operator-reopened** (entry 12, 06-11: "exploring giving up
the asymptotes altogether"); per run-11 the live HEAD is **v28-lens** (plain v24 Balancer + static
polar lens h_τ(u)=√(τ²+u²)−τ) on unmerged branch `claude/exciting-archimedes-txs2wx` — GH line
DEMOTED 06-10, v27 (W)-kurtosis promoted-then-demoted 06-12. CLAUDE.md §0/§4 + feature_inventory
are stale-main (v26c/GH-era) — flag staleness when it matters, demand rulings verbatim before
treating wing changes as drift.

## ⭐ CANONICAL WARP STATEMENT (operator, 2026-06-11, entry 7, VERBATIM)
> "assuming pool reserves sat at the trade point (intersection of strike ray with curve) a given
> trade would move the point along the curve; now instead of doing this, you warp the curve
> (however is geometrically most natural), so that the slope the point was going to land on,
> moves to the trade point itself --- now think of this process as a sort of integral / updating
> infinitesimally"
x,y still track actual tokens (06-10 entry 16). MY VERIFICATIONS (run-5/9, defend): (i) paper
α,β closed form == 10k micro-steps; (ii) rule exact ONLY infinitesimally (1.2000 vs 1.2100);
(iii) mode-at-mark separate (1.44≠1.2); (iv) reading-1 transport ⟺ dα=dβ=0 symbolically on
Balancer; (v) constant-weight violation law dε=ε·du exact.

## ⭐ OPERATOR RULING 2026-06-12 (entry 8 VERBATIM — the off-ATM trade rule; run-11 ground)
> "apply conservation at the trade's own point; pool reserves change by what actually flowed; w
> gets stored -- yes; and what actually flowed would also be as per that trade point if  that
> makes sense --- round trip stuff can be done later because same problem as dynamic function
> AMMs like Curve which are mainstream accepted"
Formalization (manager, operator-confirmed; `notes/operator_ruling_2026-06-12_offATM_trade_rule.md`):
state (x,y,w), w STORED; T = ray∩curve (unique: x_T=kθ^(w−1)); local pair α_T=x_T·w, β_T=y_T(1−w);
flows Δx,Δw computed at T ARE the actual reserve changes; next state (x+Δx, y+Δy, w+Δw). Global
α,β drift off-ATM BY DESIGN; spot = special case. Round-trip residual DEFERRED (Curve-v2 analogy
= operator rationale, NOT project-verified — keep labelled).

## The earlier motive line + why I exist + paper-as-motivation (unchanged, 2026-06-10 verbatim)
> "the skeptic has to have a very concise crisp understanding of the project motive (curve warp
> amm from balancer, need kurtosis knob, everything else remains same sort of thing)"
`paper/temporal_paper_draft.md` = WHY reference, not implementation spec. Paper L41-43 = the q≠p
trade layer; L39 = reading-1 transport. **2026-06-12: paper layer now under live AFT2026 referee
fire** — consolidated REJECT 4/5 report at `evidence/aft2026_review/REFEREE_REPORT.md`; on every
claim checked (manager + me) the referee was RIGHT. Treat the referee report as a high-quality
adversarial peer — my external twin.

## ACTIVE: AFT2026 response thread — state after run-11 (verdict #10)
**Verdict #10 → `notes/skeptic/VERDICT_AFT2026_RESPONSE_2026-06-12.md`: CLEAR-WITH-EDITS.**
- **FLAG-WRONG (mine, exact):** response §1 "well-definedness on domain y_T+Δy>β_T" is FALSE —
  flows computed at T, drawn from global (x,y): from (10,10,½), θ=0.01, Δy=+10 → next state
  (−37.62, 20, 0.95); θ=100, Δy=−20 → (10.33, −10, 0.375). Domain needs global feasibility
  x+Δx>0, y+Δy>0. (w′∈(0,1) DOES hold analytically on the stated domain; T-uniqueness analytic.)
  Infects ruling note's "Verified: well-defined" bullet + research-lead Lean dispatch (obligation
  spec must carry global constraint). **Failure region = deep wings = the title's strike
  continuum.**
- **OVERSELLs:** (1) "We reproduced every checkable claim… all held" — MC econ/settlement/refs
  NOT re-run (manager's own review discloses this; response un-disclosed it); (2) anonymised
  deposit committed while operator decision (b) open; (3) magnitude-aware club floor committed
  while settlement = operator-tier undecided; (4) "wings remain exact power-laws" vs live
  asymptote exploration. Watch-items: Curve-v2 "likewise borne inside the pool" clause
  (direction muddle); §3 "locus" sentence missing from retraction scope; ref[7] referee-only
  provenance.
- **Standing-flag status:** edits are pre-send conditions on the response MD; manager must fix
  or operator consciously override. Check the fix hunks if a revised response appears.
- **PENDING MY PASS:** the paper agent's revision of `paper/temporal_paper_draft.md` (in flight
  this session) gets its own audit; also research-lead's off-ATM spec+Lean (WIP 66966b5) —
  verify the well-definedness domain got the global constraint.

## Claims that survived attack (settled — don't re-attack without new evidence)
- **Run-11 set:** transition rule answers referee fatal #1 (Reading-2-completed + §5.1 retraction;
  NOT a retcon — submission lines 134/687 vs 216–218 verified); worked instance machine-exact;
  **round-trip pool-favourable: 81-case sweep, zero pool-losing, worst +5.8e-5** (sweep-strength
  only); C2.lean/INDEX concession exact on disk; corrigendum (HEAD v26c→v28) fully owned;
  transcript 06-12 verbatim+append-only clean — **alleged 8→8a→8 rename does NOT exist in any
  committed state (`git log -p --all`); refused to convict on unevidenced premise.**
- **AC-2 joint characterization core (run-9):** transport ⇒ A=ε′+1; mode ⇒ A=−ε′; jointly
  (w,w′)=(½,−1/8); violation rate (2ε′+1)du; direction-independence real. Scope: at-the-mark.
- **Germ-family existence for spot sequences; √-sigmoid kill; tanh+notch witness; frozen-germ-
  kills-skew dissolved; α,β⟺transport on Balancer foliation (all run-9, mine).**
- **Paper Trade Formula = integral of its own infinitesimal rule (run-5).**
- **Run-4 settled:** anchored-warp mode=unit-slope=diagonal; Lemma A; elasticity-at-mark=e^(−ghMu).
- **Restructure slice-1 mechanical layer (run-7); org-review process layer (run-8); merge-gate
  layer (run-10: corrigenda hunks, blob md5s canonical on branch).**
- **GUDERMANNIAN core; asymptote preservation F2 (⚠ operator-reopened per entry 12); kurtosis
  sign-split; (W) endpoints; REPARAM v2 leaned-on-not-attacked.**

## Team blind-spot patterns observed
1. **Confidence markers anti-correlate with verification.** Run-11: held AGAIN — "There is no
  inconsistency / every (state,ray,Δy) yields a unique next state" was the run's one FLAG-WRONG.
2. **Manager verifies the cheapest load-bearing item, narrates the rest — and the disclosed
  non-check zone is where findings live.** Run-11 twist: manager DISCLOSED the zone honestly in
  its review; the operator-facing RESPONSE then erased the disclosure ("every checkable claim…
  all held"). NEW SUB-RULE: diff the outbound artifact's verification claims against the internal
  review's disclosed gaps — outbound documents drop hedges.
3. **Symmetric-slice numerics sold at the asymmetric pin.** (β=1 era; watch.)
4. **Construction-slot conflation** (SCORE vs WEIGHT; one-shot vs integral).
5. **Impossibility/exhaustiveness from one candidate.**
6. **Checklist staleness at verification.** Run-11: inventory+CLAUDE.md now TWO curve-families
  behind operator's live branch state — staleness is structural until merge; cite it, don't
  mechanically fail reviews on it.
7. **Verification digits with no reproducible map = narration.** Run-11 counter-case: script on
  disk, ran green, asserts pin the digits — credit it.
8. **Infra keyed on literal paths fails SILENT.**
9. **Line-number citations into MUTABLE files rot.**
10. **Controls drafted in the QUEUE, not the CHARTER.**
11. **Headline scope-narrowing; after corrigenda re-read the WHOLE paragraph.**
12. **Manager numbering slips — check run/verdict numbers against my ledger before citing.**
13. **Relay-text verification ceiling: manager replies aren't transcribed; never upgrade
  order-consistency to "verified".**
14. **NEW (run-11): LOCAL domain conditions sold as GLOBAL well-posedness.** When flows/updates
  are computed at one point and applied at another (trade point vs reserves), demand the domain
  statement cover the APPLICATION site, not just the computation site's pole. Probe deep
  wings/extreme rays first — that's where local-global gaps open.
15. **NEW (run-11): commitments to externals outrun open operator decisions** (deposit, floor
  design, wing property). Check every outbound "we will X" against the manager's own
  operator-decisions-needed list.

## Verdicts issued
0. STOCKTAKE 06-10. 1. KURTOSIS_KNOB (2×WRONG+OVERSELL+OMISSION+PROCESS). 2. OPERATOR-DIRECT
reply (fixed-curve omission). 3. GUDERMANNIAN gate. 4. Operator reply #2 (assurance laundering).
5. LDF (PASS+2, stood down). 6. Restructure slice-1 (6/8+2 fixed). 7. Org review
(PASS-WITH-CONDITIONS, bind at adoption). 8. FRAMEWORK (PASS-WITH-FLAGS, 3 — stood down run-10).
9. Merge gate focused-carson (PASS). 10. **AFT2026 response (run-11): CLEAR-WITH-EDITS —
1 WRONG + 4 OVERSELL, no PROCESS** → VERDICT_AFT2026_RESPONSE_2026-06-12.md.

## Method notes (env)
- mpmath ok. Rigs: (W)-membership; trade-mechanic micro-integrator (run-5); run-9 warp-step
  residual rig (`/tmp/skeptic_run9.py` pattern — both conventions + sell side); quote-audit
  unwrap regex; frontier-from-kernel FD.
- **Run-11 rig: off-ATM trade rule** — trade(x,y,w,θ,Δy): x_T=kθ^(w−1), local pair, closed-form
  flows, global update; domain probes at extreme θ both Δy signs; round-trip sweep = trade(+Δy)
  then trade(−Δy) at same ray on NEW curve, sign of net Δx. Reproduces manager's +6.4e-2.
- **Merge-gate rig (run-10):** git diff hunks for corrigenda; blob check awk-len + sed-n md5 vs
  CLAUDE.md §3; DRAFT label at head of doc.
- **Transcript audit (run-11):** `git log -p --all -- history/operator/<file>` then grep entry
  headings — proves append-only/no-rename better than reading HEAD state; typo-preservation is
  the verbatim fingerprint.
- **Verbatim channel:** `history/operator/<date>_<slug>.md` (live 06-10+). Pre-policy GH-era =
  manager-paraphrase provenance.

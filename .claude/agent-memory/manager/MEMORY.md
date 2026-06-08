# MEMORY — manager (cross-role rollup = state of the whole project)
_Last updated: 2026-06-08, v26c reconciliation. This is the project's state-of-the-whole; git history
is the mechanical audit trail. Rewrite the changed bits at the end of every task._

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
Harmonic's Aristotle) → polls → local `lake build` re-verify (emends mechanical backend diffs only) →
records one of 4 verdicts (proved+re-verified / counterexample / still-open / candidate-fails-local-
recheck) → audits/interprets. **research-lead keeps ALL raw prover/poll/lake output in its own context;
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
- **Toolchain gap (still real):** no `lean`/`lake`/`elan` in container → **local re-verify is
  PENDING-LEAN** (needs Lean v4.28.0 + Mathlib v4.28.0). Submit→candidate works; re-verify half does not
  run here — nothing is reported as "proved + re-verified" until a toolchain lands.
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

## Waiting on operator
- Nothing blocking from the v26c reconciliation — **v26c is canonical HEAD on main** (PR #4 merged
  `3d4fbe2`). Open project threads (Lean GH gate-discharge, ship-gate B1, publication, Layer-2
  honest-dollar $) continue per their owners.
- (Resolved this task: scaffolding already on main; v26a/v26b/v26c tester runs done; `GH_TOKEN`
  present & verified 200; integration merged + branch cleaned up.)

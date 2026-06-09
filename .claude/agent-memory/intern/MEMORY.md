# MEMORY — intern
_Last updated: 2026-06-09. Rewrite changed bits at task end._

## Engine
- Canonical HEAD: **`engine/builds/HEAD_temporal_mvp_v26c.html`** (md5 `6cc73563…`). Work from this.
  (Prior: v26a `89ae89e9`. The whole-file md5 echo in run_all.sh line 8/9-10 keys off HEAD's line
  74/1060; line 1060 is NOT gated — informational only. The HARD gate is the harness JS, which scans
  scripts by content, not fixed blob lines.)
- 4 curve-dependent fns: `getMP_raw`, `tradeUpdate`, `arbitrageToOracle`, `rebase`. `getSNorm`=(x−α)/α;
  `getDepth` is display-only/stale (left so by design). State carries scalar `gh*` params
  (`ghP,ghNx,ghNy,ghM,ghMu,ghAh,ghBh,ghDelta`); the CDF table lives in a module cache keyed by shape,
  re-derived on load (pool stays serialization-safe — don't move the table onto the pool).
- `snapshot()` spreads the pool (`{...p,w,depth,sNorm}`) so the draw layer can sample the engine on
  `snap` — don't "tidy" it to an explicit field list (drops gh*, breaks curve+marker silently).

## ⛔ FILE-SAFETY (every engine edit)
- Blobs: webp line ~74 md5 `ab663f5c26f2a461c5b0ef1421d0ad74`; svg line ~1060 md5
  `c505b08ad0e4c6b0fb9e64e9679fe291`. The `8d2e1a84`/`1b320fc5` set is NOT a separate broken cut —
  it is the **decode** of the canonical line layer `ab663f5c`/`c505b08a` (one blob, three layers:
  line / b64-payload / decoded binary). Hook + run_all key off the **line layer**. RECONCILED
  repo-wide. **No minifier, ever.**
- Edit only via on-disk Python splice (work on a copy; slice old string by line range; `assert
  count==1`; preserve trailing `\n`; blobs never through the splice). Recipe:
  `engine/recipe_html_blob_editing.md`, `engine/splices/SPLICE_METHOD.md`; worked examples in
  `engine/splices/splice_*.py` (`splice_slipfix.py` is the best template).
- Post-edit must pass: 2 blob md5 unchanged · 3 `<script>` parse · IIFE intact · no script line >50k ·
  `engine/verify/run_all.sh` green. The `PostToolUse` hook re-checks and **blocks** on red — a block
  is a **finding**: STOP, report, do NOT patch toward green.

## THE gotcha
`getMP_raw` = price coordinate, NOT slope. Use `mpGeom = getMP_raw·e^(−s.ghMu)` for anything compared
to a geometric Δy/Δx (slippage %, $, angles). Read `ghMu` per-state; missing `ghMu` → **NaN (loud)**,
never `e^0`. Catastrophic cancellation: compute OTM tail via direct upper-tail integrals, NOT `1−F`.

## Done (don't redo)
- GH swap (v25), v26a barrier-remnant fixes (inline slip price, curve-draw, eq marker → engine),
  slippage units fix (both `legSlipFrac`/`legSlipUsd` → mpGeom; old `margPrice` removed; comment
  mislabel fixed; tooltip relabeled reserve-USD). All 7 gates green; splice-level slippage matches
  targets; no silent ghMu default.

## Done — v26b ITM/American (IMPLEMENTED, handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26b_itm.html`** (from HEAD `89ae89e9`; HEAD untouched).
Splice: `/tmp/splice_v26b.py` (17 reps, all `count==1`, blobs never through). All gates green.
- **mark split:** `markFrac(wing,θ,sNorm)` = OLD saturating fraction VERBATIM (funding + the polar
  ψ∈(0,1] mark-curve marker route here; funding proved BIT-IDENTICAL to HEAD, worst |Δ|=0). New
  `mark(wing,θ,sNorm,γ)` = American smooth-pasting VALUE; `γ = state.ghAh−1` (exact). Branches bound
  by **S-direction, NOT the call/put tag** (tag is inverted): `wing 'call'`=sNorm/θ arm →
  `sNorm*=θ·((γ+1)/γ)^γ`, cont `sNorm/((γ+1)·sNorm*)`, intrinsic `1−(sNorm/θ)^(−1/γ)`=1−S/K, S*<K.
  `wing 'put'`=θ/sNorm arm → `sNorm*=θ·(γ/(γ+1))^γ`, cont `sNorm*/((γ+1)·sNorm)`, intrinsic
  `1−(sNorm/θ)^(1/γ)`=1−K/S, S*>K. Both fraction@bdry=`1/(γ+1)`.
- γ threaded through: legPrice, executeBand (buy-side denom), markEff/legValueUnified (+closeBand
  callers), pfComponents (+renderBands `pfGamma`), preview N_buy denom, legFraction. **Cap removed
  on the UNBOUNDED (barrier) leg only** in legFraction; spread leg stays `min(1,·)`.
- **Stage-2→3 dollar conversion UNTOUCHED** (no exercise branch needed — confirmed compatible).
- **Display:** dropped `effK` (4151/4156), emptied Eff-strike component cell (`<td></td>`, 9-col
  preserved), header `Attrib P&L / Eff strike`→`Attrib P&L`, `Orig strike`→`Strike`, dropped stale
  units-note. Kept Oracle(live), Entry mark, mark cell, `itm`/`regimeCls` colouring.
- **Seam gate** (`verify/seam_gate.js`, generalized): PER BRANCH value match (price-space, 0.000%) +
  slope match (sNorm-space, ≤0.0005%) + no-jump (~1e-7) + DIRECTIONAL (branch A S*<K, branch B S*>K,
  keyed off price space). Mutation test (swapped branches) → exits 1. **Slope is measured in
  sNorm-space on purpose:** price-space FD differencing aliases the GH table (plateaus ~0.2%, does
  NOT shrink with h → measurement artifact, not a kink); sNorm-space `d mark/d sNorm` is the exact
  structural smooth-pasting quantity (chain-rule dS/dsNorm cancels). Wired into run_all as HARD GATE;
  **SKIPs as pass on pre-v26b builds** (detects `markFrac` + non-saturating ITM mark) so HEAD stays
  green. 7 GH gates still PASS γ∈{1.5,2,3,4}; blobs unchanged; 3 scripts parse; IIFE/sigs intact.
- **Open for tester:** browser/visual run — bands table renders (empty Eff cell, renamed headers),
  payoff chart legFraction uncapped on naked leg, polar marker dot stays on its ψ-curve.

## Done — v26c strike-registration fix (IMPLEMENTED partial, handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26c_strikereg.html`** (from HEAD `8df9f8a3`; HEAD untouched).
Splice: `/tmp/splice_v26c.py` (4 reps, all `count==1`, blobs never through). Diff vs HEAD = exactly
the 4 intended regions (helper + export + pfComponents ray + 2 call sites); longest non-blob line 553.
- **The fix:** register strike in curve coord `θ=sNorm(K)=getSNorm(arbitrageToOracle(pool,K))` (NOT
  FD; NOT K/oracle). New engine helper `sNormStrike(s,K)` (loud NaN on degenerate). Verified γ-dep
  θ=0.9295/0.9071/0.8639/0.8228 (γ=1.5/2/3/4), crossover pins to K=84000 every γ (OLD drifted: γ=2 →
  o0²/K=76190). Helper exported.
- **Applied to (DISPLAY mark path only):** `pfComponents` — ray `K=>K/oracleLive` → `Engine.sNormStrike(pool,K)`;
  threaded `s.pool` in at the 2 renderBands call sites. The `itm` test (sNormPool vs theta) now crosses
  at K too → AGREES with isOTM/wingMember (gate 2). `mark` now gets sNorm(K) → intrinsic `1−S/K` correct.
- **NOT touched (LOCKED / escalated):** funding (`fundingPerStrike` ±2, markFrac) — untouched.
  isOTM/wingMember — untouched (stay K/oracle price-measure). **DELIBERATELY LEFT in OLD basis,
  flagged to manager:** (a) execution/settlement path `executeBand`/`closeBand`→`legPrice`/`markEff`/
  `legValueUnified` + `compositeRay`/`vsValue` — re-basing theta there reshapes θ*/δ/V/dy = the AMM
  swap + stage-2 leg value feeding the LOCKED stage-2→3 dollar conversion (settlement semantics).
  (b) chart-ray `drawStrikeMark` uses `Engine.markFrac` (locked polar/funding route); `drawStrikeRay`
  built on `thetaStarOf`=compositeRay geometry. Both entangle locked surfaces → STOP-and-report per
  brief, not improvise.
- **Gates:** new permanent `verify/dir_gate.js` (crossover@K all γ + directional CALL+++/PUT−−− +
  swapped-arm mutation detected; SKIPs as pass pre-v26c via missing sNormStrike export). Seam gate
  re-anchored: `sNat` now prefers `E.sNormStrike` (was already inline getSNorm(arb(s0,K)) — effectively
  no-op, made explicit). Both wired into run_all.sh as HARD GATES. Full harness on v26c GREEN: 7 GH
  gates PASS, seam PASS both branches, DIR gate PASS, blobs `ab663f5c`/`c505b08a` intact, 3 scripts
  parse, sigs/IIFE true. HEAD stays green (dir_gate SKIPs).
- **Open for manager (architectural fork):** does the registration fix extend to the execution/
  settlement pricing path + chart-ray markFrac sites? Those reshape locked dollar-conversion/funding-
  polar surfaces — needs an operator ruling before I touch them. **Open for tester:** browser/visual —
  bands table mark crossover now at K; chart strike ray/dot still on OLD basis (pending the fork).

## Done — v26c-FULL strike-registration (operator (A): UNIFORM, handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26c_full.html`** (from `temporal_mvp_v26c_strikereg.html`;
HEAD `8df9f8a3` untouched). Splices: `/tmp/splice_v26c_full.py` (8 reps), `/tmp/splice_v26c_chartray.py`
(1), `/tmp/splice_v26c_export.py` (1) — all `count==1`, blobs never through. Blobs `ab663f5c`/`c505b08a`
intact; 3 scripts parse (longest script line 482); whole-md5 `8f7b3ffb…`.
- **New engine helper `regLeg(s, leg)`** (after `sNormStrike`, exported): registers a leg's
  K_inner/K_outer into carry-space (theta=sNorm(K)) for the mark/value PRICING path; leaves the
  leg's price-ratio inner/outer untouched (isOTM/wingMember keep reading those at K/oracle).
- **Execution path (`executeBand`):** sell leg, N_buy denom, buy leg all re-registered. THE KEY
  FINDING: the denom mark fed a PRICE-MEASURE spot (`poolMark/oracle`) + price-ratio theta, NOT the
  carry basis legPrice uses (`getSNorm` + sNorm(K)). `mark` is NOT invariant to that basis (diverges
  up to ~38% @γ=4). Re-based denom spot → `getSNorm(leg1.newState)` + registered theta. `sNorm2`
  feeds ONLY mark there (no isOTM shares it) ⇒ clean. **End-to-end the OLD exec path BLEW UP**: γ=3/4
  N_buy=3.28e6, netPoolY=2.6e11 (price-measure denom near-zero). NEW: N_buy~0.1-0.6, netPoolY~16-32k,
  all finite/positive across K∈[80001,500000], no NaN/Inf/sign-flip.
- **Settlement (`closeBand`):** all 3 branches (soldITM/boughtITM/neither). Settle-to-cash VALUE
  (`legValueUnified`/`markEff`) and live-leg reversal (`legPrice`) re-registered to `getSNorm(s)` +
  sNorm(K). **Leg SELECTION (legIsITM/wingMember) LEFT on `sNorm0` price-measure** — only the VALUE
  fed to the dollar pipe is corrected (guardrail 2 authorizes "feed corrected value"). Crossover
  agrees at K in both spaces so selection unchanged. **Dollar pipe (carvedNotional/entryPerpMark/
  attributablePnL/carvedEquityAtClosure/L0 multiply) byte-unchanged** — confirmed in diff.
- **Premium delta (legPrice, isolated, barrier call):** moves UP toward registered value. K=84000:
  +12.97/15.76/21.54/27.62% (γ=1.5/2/3/4); K=82000 (~near-strike): +6.37/7.69/10.38/13.14% — the
  "~10%" sits here. Grows with γ (price-ratio vs sNorm diverge with γ).
- **Chart strike-ray (`drawStrikeRay`, Finding-2):** fed LIVE `K/oracleVal` rays (was stale
  `b.*.inner`=K/oracle_entry). `drawStrikeRay` is PRICE-RATIO space (rawSlope=θ·oracle=mp-line);
  `rawSlope=K` lands ray+dot on `arbitrageToOracle(pool,K)` = the sNorm(K) point, every γ; rebase
  drift gone. **DIVERGENCE FROM BRIEF LITERAL:** the brief says "→ sNormStrike", but feeding the
  sNorm value into θ·oracle would draw sNorm·oracle (72565 vs correct 84000 @γ=2) — WRONG. Used the
  geometrically-faithful K/oracle_live instead (same registered point). Flagged to manager.
- **`drawStrikeMark` LEFT** (funding-polar marker, brief says leave). isOTM/wingMember/funding/markFrac
  untouched (price-measure, stay at K).
- **dir_gate enhanced (guardrail 5):** added MIXED-BASIS exec-path control — asserts the EXECUTION
  leg-mark crossover (via `E.regLeg`) ALSO lands at K, and demonstrates the K/oracle mutant misses K
  (drift point). DEMONSTRATED: mutating `regLeg`→K/oracle in a temp build FAILS dir_gate (exit 1) at
  every γ; uniform build PASSES. SKIPs cleanly if no `regLeg` export (HEAD stays green).
- **Gates:** `sh verify/run_all.sh builds/temporal_mvp_v26c_full.html` GREEN — 7 GH PASS γ∈{1.5,2,3,4},
  seam PASS both branches (re-anchored), dir_gate PASS (crossover@K + exec mixed-basis control +
  directional + mutation). HEAD still green (dir_gate SKIP).
- **OPEN / flagged (not done, intentional — surface to operator):** (1) chart-ray brief-literal
  divergence above. (2) **Payoff chart `drawPayoff`/`legFraction` (line ~3914) left on price-ratio**
  — it sweeps spot as `sNorm=(1+r)` (fractional move) and feeds `mark` with `K/S0` strikes; it's
  self-consistent in price-ratio space but NOT in the brief's listed scope (brief lists drawStrikeRay
  only, not drawPayoff). Bringing it to carry-space requires re-basing the whole swept x-axis — a
  SEPARATE display increment. Did NOT expand scope. (3) Settled-value correction changes the dollar
  figure on ITM-leg closes — manager should re-derive before HEAD promotion.

## Done — v26c-full2 drawPayoff carry re-basing (operator (i), handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26c_full2.html`** (from `temporal_mvp_v26c_full.html`
`8f7b3ffb`; HEAD `8df9f8a3` untouched). Splice: `/tmp/splice_v26c_full2.py` (4 reps, all `count==1`,
blobs never through). Whole-md5 `6cc73563779a3e030774b7597d0ae187`. Diff vs source = drawPayoff-ONLY
(lines ~3891-4041), exactly the 4 regions; longest script line 482.
- **THE re-basing:** drawPayoff now feeds `mark` in CARRY basis like the bands table (pfComponents).
  (1) Leg thetas: `K/S0` price-ratio → `Engine.sNormStrike(state.pool, K)` (the SAME registration
  pfComponents/exec use). (2) Swept sNorm in `composedEquity`: `(1+r)` price-ratio →
  `Engine.sNormStrike(state.pool, S0*(1+r))` (= getSNorm(arbitrageToOracle(pool,S)), the same inverse).
  (3) **Pre-existing bug fixed in passing:** the N_buy block passed the Store WRAPPER `state` to
  `legPrice`/`getSNorm`, which read `state.x`/`state.alpha` (undefined → NaN → silent fallback). Now
  uses `const pool = state.pool` so getSNorm sees x/alpha/gh* — N_buy now actually derives (matches
  bands table). legFraction CAP STRUCTURE UNCHANGED (barrier uncapped, spread min(1,·)); only the
  mark INPUTS changed basis. Guards: negative/zero swept spot → NaN → leg skipped (loud, not e^0).
- **SAMPLE MATCH (acceptance):** γ=2, call wing, K=72000, r=0 (S=S0=80000): bands-table mark
  0.1200105126 == drawPayoff mark 0.1200105126, |diff|=5.1e-13. Verified true across wings/K
  {call 72000/60000, put 88000/100000} and γ∈{1.5,2,3,4}, all |diff|<1e-9. (At r=0,
  sNormStrike(pool,S0)==getSNorm(pool) at equilibrium, so the marks coincide exactly.)
- **x-range ADAPTED (not literal ±200%):** carry basis makes sNorm∝S^-γ, so r=-2 → S=-80000 (negative
  spot → sNormStrike NaN). Spot can't drop below -100%. Used **xMin=-0.9, xMax=2.0** (asymmetric):
  -90% clears the call-wing free boundary sNorm* and +200% clears the put-wing sNorm* for ALL γ
  (verified: call sN@r=-0.9 = 31/99/990/9873 ≥ sNstar 2.5/2.8/3.3/3.7; put sN@r=+2 ≤ sNstar both).
  x-tick loop `-50..50 step10` → `-50..200 step50` (clean ticks inside the range; -90 edge unticked).
  **Note:** the naked-leg mark `1−S/K` (call) only EXCEEDS 1 as S→0 (unreachable, floored at -90%),
  so the strict naked>capped uncap isn't visible; what IS reached/visible is the continuation→
  intrinsic free-boundary crossing (the geometrically meaningful divergence). Flagged honestly.
- **§6 carve-out did NOT trigger:** bounded display increment, no locked surface touched (funding/
  isOTM/wingMember/markFrac/drawStrikeMark/drawStrikeRay/dollar pipe/execution all UNTOUCHED —
  confirmed in diff). drawPayoff-only.
- **Gates:** `sh verify/run_all.sh builds/temporal_mvp_v26c_full2.html` GREEN — 7 GH PASS γ∈{1.5,2,3,4},
  seam PASS both branches, dir_gate PASS, blobs `ab663f5c`/`c505b08a` intact, 3 scripts parse,
  sigs/IIFE true, no blob-in-script. **Open for tester:** visual — payoff chart leg marks now match
  the bands table at the live spot; asymmetric -90%..+200% frame; naked/capped leg shapes.
  **Open for manager:** verify sample-match + registration-only diff before tester pass + HEAD promo.

## Done — CURVE PLAYGROUND preview-ray basis fix + dial relabels (IMPLEMENTED in place, handed to manager 2026-06-09)
Build: **`reference/temporal_curve_playground.html`** EDITED IN PLACE → md5 now
**`b9e7d907a5635428f02cb32c29dc2b3b`** (was `f7fecff4…`). HEAD v26c `6cc73563` + v26d `a406a751` UNTOUCHED.
DISPLAY/LABEL ONLY — no pricing/engine logic, no blobs. Splice `/tmp/splice_preview_ray.py` (ray block,
1 rep `count==1`, blobs never through) + 6 label Edits.
- **FIX 1 (preview strike-ray inversion):** preview rays at the old L3678-79 fed `p.leg1_theta_star`/
  `p.leg2_theta_star` — those are CARRY/sNorm-space (sNorm∝S^−γ), but `drawStrikeRay` does
  `rawSlope=theta·oracle` expecting PRICE-space theta → preview rays drew inverted + wing-swapped.
  FIX: feed the preview rays from the preview band's DOLLAR strikes via the SAME `liveRayTheta(Ki,Ko)
  = thetaStarOf(Ki/oracleVal, Ko/oracleVal)` the open-band path uses. The preview band object carries
  `p.sold.K_inner/K_outer` + `p.bought.K_inner/K_outer` (added in v26c-full "carry dollar strikes for
  regLeg", L3231/3236) → leg1(sold)=`liveRayTheta(p.sold.*)` colShort, leg2(bought)=`liveRayTheta(
  p.bought.*)` colLong. Step-stepper alpha (`(step===2)`, `(step===1)?0.3:1`) + colors PRESERVED.
  `liveRayTheta` HOISTED out of the `for(b of bands)` loop to before it so BOTH paths share it; the two
  open-band `drawStrikeRay(liveRayTheta(b.sold/b.bought…))` DRAW lines are BYTE-IDENTICAL (only their
  position shifted as the helper moved up). Open-band ray code NOT changed in behaviour.
- **FIX 2 (dial relabels, UI text only):** "steepness"→**"convexity"** (γ), "kurtosis"→**"ATM smoothing"**
  (δ — δ does NOT fatten wings). "skew" (βh) unchanged. Renamed visible label text + the rendered
  tooltip note (HTML `vk-note` L1458 + JS `BAL_NOTE` L2894 which writes to `noteEl.textContent`) + the
  two describing-comments (HTML L1446, JS L2879). NO JS variable/id renamed (`vk-gamma`/`vk-delta`/
  `vk-delta-out` etc untouched). `grep -i steepness|kurtosis` → 0 matches.
- **DIFF SCOPE (git diff = ONLY these):** 6 label strings + the Viz ray block (hoist + preview rewrite).
  No locked surface in diff — grep of diff for mark/markFrac/markEff/funding/executeBand/closeBand/
  isOTM/wingMember/legFraction/legPrice/getMP_raw/tradeUpdate/arbitrageToOracle/rebase/setShape/
  ghCalibrate/drawPayoff/drawPricing/drawCurve/drawStrikeMark = only the moved COMMENT line mentioning
  `arbitrageToOracle(pool,K)` (text, not code). Pricing/mark/funding/open-band-ray byte-unchanged.
- **GATES:** `sh verify/run_all.sh ../reference/temporal_curve_playground.html` EXIT 0 — 7 GH PASS
  γ∈{1.5,2,3,4}, curveTrace 401/401, seam PASS both branches, dir PASS, blob74 `ab663f5c`/svg1113
  `c505b08a` intact, 3 scripts parse (`all parse:true`, `blob-in-script:false`), IIFE true, longest
  non-blob line 553. `sigs:false` + whole-md5 echo `6cc73563`/blob-1060 echo `0eff98b2` are
  INFORMATIONAL (v26d-lineage svg at 1113, ghCalibrate +δ+βh) — hard gate is the content-scan.
- **Open for tester (live):** preview strike rays now move the CORRECT direction (higher call strike →
  steeper ray on the call side) and match the open-band rays' basis; dial labels read "convexity"/
  "ATM smoothing"/"skew". **NO git** (manager commits).

## Done — CURVE PLAYGROUND drawCurve RESCALE REVERT (IMPLEMENTED in place, handed to manager 2026-06-09)
Build: **`reference/temporal_curve_playground.html`** EDITED IN PLACE → md5 now
**`f7fecff4c62b028134190a222167e088`** (was `2b20c844…`). HEAD v26c `6cc73563` + v26d `a406a751` UNTOUCHED.
Splice: `/tmp/splice_revert_drawcurve.py` (1 rep, `count==1`, blobs never through).
- **WHY:** the display rescale I added earlier (toPxC vertical-stretch-about-eq, axes left raw) drew a
  FALSE curve vs its axes and broke call/put colours. Manager brief: remove it entirely, restore
  honest v24-aligned rendering. Reverted drawCurve to **v26d-native byte-for-byte**.
- **THE REVERT:** replaced playground drawCurve (lines **3464–3761**, 1-based) with v26d-native
  drawCurve (`temporal_mvp_v26d_volknob.html` lines **3493–3753**). Result: removed the rescale
  comment+block (`mpGeomEq`/`yStretch`/`ty`/`toPxC` defs) and reverted all 5 call sites
  `toPxC→toPx` + the `ty(y)` clip → raw `y`. Post-revert playground drawCurve == v26d drawCurve
  (verified byte-equal). `grep toPxC|mpGeomEq|yStretch` → **none**.
- **DIFF SCOPE:** git diff = drawCurve-ONLY (8 ins / 45 del, all inside the fn). mark/markFrac/markEff/
  funding/executeBand/closeBand/isOTM/wingMember/legFraction/drawPricing/drawTrajectory/drawPayoff/
  dollar-pipe BYTE-UNCHANGED.
- **Colours restored:** live curve drawn per-wing via `curveSegmentColor(x,y)=(y/x>modeSlope)?colCall
  (teal #0ABAB5):colPut(pink #FF85B0)`, fed through standard `toPx`. Live curve `drawCurvePts(livePts,
  false,1.0,null)` (null fixedColor → per-wing split). NOT green/orange.
- **Cross-graph reactivity (already correct, no wiring change needed):** dial inputs vk-gamma/delta/betah
  bind change+input → `apply()` (L2928-30) → `Store.setShape(g,d,bh)` (L2909) → `render()` (L2926).
  `render()` (L4310) → `previewBand()` + fallback `Viz.drawAll(s,null)` (L4381-83) → `drawAll` (L4014)
  redraws ALL 4 graphs (drawCurve/drawPricing/drawTrajectory/drawPayoff). Like v24.
- **KEPT unchanged:** γ/δ/βh steppers, βh via ghCalibrate, setShape, editable Balancer-corner init.
  NO axis-zoom / display transform added — plot honest only (curve reads flat-ish in default frame =
  CORRECT shape, not compensated).
- **GATES:** `sh verify/run_all.sh ../reference/temporal_curve_playground.html` EXIT 0 — 7 GH PASS
  γ∈{1.5,2,3,4}, curveTrace 401/401, seam PASS both branches, dir PASS, blob74 `ab663f5c`/svg1113
  `c505b08a` intact, 3 scripts parse (`all parse:true`), `blob-in-script:false`, IIFE true (Engine+Viz).
  `sigs:false` = expected (ghCalibrate +δ+βh echo, documented). Whole-md5 echo `6cc73563`/blob-1060
  echo `0eff98b2` are INFORMATIONAL (v26d-lineage svg at 1113).
- **Open for tester (live):** confirm live curve is teal/pink per-wing (NOT green/orange); a γ/δ/βh
  dial change re-warps + redraws ALL graphs; curve plots honest reserves (flat-ish default frame OK).
- **NO git** (manager commits).

## Done — CURVE PLAYGROUND (γ/δ/βh dials, IMPLEMENTED, handed to manager 2026-06-09) [SUPERSEDED rescale removed above]
Build: ~~md5 `2b20c844020ef5f636f27a4cadca3bb7`~~ (rescale reverted → `f7fecff4`)
(from `engine/builds/temporal_mvp_v26d_volknob.html` `a406a751`; HEAD v26c `6cc73563` + v26d UNTOUCHED).
Spec: `specs/SPEC_curve_knobs_NEXT.md`. Splices: `/tmp/splice_playground.py` (engine: 5 reps),
`/tmp/splice_playground_ui.py` (UI panel+block: 2 reps) — all `count==1`, blobs never through;
display-rescale via direct Edit (drawCurve-only). All blob/parse/IIFE green; run_all EXIT 0.
- **THE βh FINDING (load-bearing):** the `getMP_raw` RESERVE-tail exponent IS βh-dependent (−1/γ only
  at βh=1; −1/(γ+1) at βh=0) — that is the SKEW KNOB reshaping the CURVE, by design. **G4 value∝S^−γ
  is the OPTION-VALUE exponent carried by `mark(wing,θ,sNorm,γ)`, which is βh-FREE closed form** (no
  βh/bh/ghB in its sig — verified) ⇒ value∝S^−γ holds identically at βh=0 AND βh=1 (manager-verified:
  Esscher ratio f_{β+1}/f_β=e^v is δ/βh-free; evidence/manager_verify_reconcile_2026-06-09.md L22,58-65).
  Do NOT confuse the reserve-frontier tail (βh-dependent) with the value exponent (βh-free).
- **ghCalibrate(X0,Y0,mp0,gamma,delta,betah)** — βh free param (was hard-coded `bh=ah−γ=1`); default
  `bh=ah−γ` when betah missing (so the 4-arg harness path stays βh=1, gates unchanged); clamp |bh|<ah,
  else fall back. M/psi/Phi downstream BYTE-IDENTICAL (just reads new bh). Init opens at GH_GAMMA=1.05,
  GH_DELTA=30, GH_BETAH=0 (Balancer corner; mp0=80000 exact).
- **setShape(gamma,delta,betah)** — extended; betah default 0, clamp |bh|<γ+1; recomputes M from
  (γ+1,βh,δ) via ghCalibrate; returns `{gamma,delta,betah}`; spot preserved (getMP_raw=80000 exact).
- **Panel:** DROPPED σ/r knobs + Merton σ→γ wrapper + lock/unlock; honest number-steppers γ
  (steepness, floor>1)/δ (kurtosis>0)/βh (skew, |βh|<γ+1). Balancer caveat note encoded. Control
  block rewritten to read γ/δ/βh directly → setShape → render.
- **DISPLAY rescale (drawCurve-ONLY, no pricing):** vertical-stretch-about-eq via curve-only `toPxC`
  (curve/anchor/legs/marker/reserve-dots/strike-ray-DOTS); axes/ticks/mode-ray/strike-ray-LINES stay
  raw `toPx`. `yStretch=clamp((yEq/xEq)/mpGeomEq, 1, Scap)`, `mpGeomEq=getMP_raw(eq)·e^(−eq.ghMu)`
  (NaN-loud if ghMu missing). Reads ~45° (box-aspect 0.644) for γ≳1.3. **LIMITATION (honest, flag to
  tester):** at the exact Balancer floor (γ=1.05) the geometric slope is tiny (ghMu≈18.6), so the
  ideal stretch (S≈1e8) would push the curve off-frame in 1 point — the cap binds and the curve reads
  flat-ish there (readable-extent chosen over 45°). Irreducible: the family floor's reserve curve is
  near-vertical. Tester to judge the Balancer-corner read vs v24. Also: ray-LINES (raw) vs their DOTS
  (stretched) decouple slightly — dots stay on the curve, lines point at the raw intersection.
- **drawPricing/drawTrajectory/drawPayoff BYTE-IDENTICAL** (display change is drawCurve-only).
- **DIFF-CONFIRM locked surfaces BYTE-IDENTICAL:** mark, markFrac, markEff, fundingPerStrike,
  executeBand, closeBand, isOTM, wingMember, legIsITM, legFraction, vsValue, compositeRay; dollar-pipe
  token counts unchanged. βh threads ONLY via ghCalibrate (kernel). mark() βh-free confirmed.
- **GATES:** run_all EXIT 0 — 7 GH PASS γ∈{1.5,2,3,4} (harness βh=1 path), curveTrace 401/401, seam
  PASS, dir PASS, blob74 `ab663f5c`/svg1113 `c505b08a` intact, 3 scripts parse, IIFE true, longest
  script line 482. `sigs:false`=expected (ghCalibrate +2 params). My sweep: gates PASS γ∈{1.05..4}
  AND Balancer default; G4-self-consistency PASS βh∈{0,1} all γ (tol 1e-7; γ=4/βh=0 is 9e-9 — tail-
  precision noise just over the harness 1e-9, clean at 1e-7); value∝S^−γ (mark) βh-identical.
- **Open for tester (live):** like-for-like-vs-v24 at Balancer default (note floor limitation above);
  dials re-warp+redraw all graphs; pro-forma/stepper re-trace; warp intact; no console errors.
- **NO git** (manager commits). Whole-file md5 echo (`6cc73563`) + blob-1060 echo (`0eff98b2`) in
  run_all are INFORMATIONAL only (svg at 1113 in v26d-lineage); hard gates are the content-scan.

## Done — v26d TDZ FIX (FINDING-V26D-1, IMPLEMENTED in place, handed to manager 2026-06-09)
Build: **`engine/builds/temporal_mvp_v26d_volknob.html`** EDITED IN PLACE → md5 now
**`a406a75149b1606d7822b4f2bbcc4f84`** (was `16a872ba…`). HEAD `6cc73563` untouched.
Splice: `engine/splices/splice_v26d_tdz.py` (1 rep, `count==1`, blobs never through).
- **The bug (tester FINDING-V26D-1):** vol-knob IIFE ended with SYNCHRONOUS `apply();` at L2960;
  `apply`→`render`→`Viz.drawAll`, but `const Viz` is at L3444 in the SAME `<script id="ui">` block
  → TDZ "Cannot access 'Viz' before initialization" thrown during parse, ABORTS the rest of the ui
  script → Viz never inits, listeners never bind, all canvases blank. Node gates can't see it.
- **The fix (one line, exactly per brief):** L2960 `  apply();   // initialise read-outs…` →
  `  window.addEventListener('DOMContentLoaded', apply);   // init read-outs+draw AFTER Viz is
  initialised (avoid TDZ)`. `apply` is in IIFE closure scope; defers first apply()+render() to
  DOMContentLoaded (app's own boot is `addEventListener('DOMContentLoaded', init)` at L4657, fires
  after the whole ui script parses, so Viz exists). No `typeof Viz` guard (render must fail loud);
  IIFE NOT moved. `git diff` = exactly this 1 line.
- **TDZ confirmed gone (headless):** (1) static — old sync `apply();` line GONE, new line present,
  hook index 7549 < Viz index 30889 (deferred before Viz decl), 0 bare top-level `apply();` left.
  (2) dynamic — vm.runInNewContext of the ui body under a DOM shim that REGISTERS-but-doesn't-fire
  DOMContentLoaded: NO "Cannot access 'Viz'" throw at top-level eval; 1 DCL listener queued (apply
  deferred). (3) mechanism repro: OLD ordering throws TDZ, NEW deferred ordering does not and sees
  an initialised Viz when fired.
- **File-safety GREEN:** `sh verify/run_all.sh builds/temporal_mvp_v26d_volknob.html` EXIT 0 — 7 GH
  PASS, seam PASS, dir PASS. blob 74 webp `ab663f5c` intact; svg blob at L1113 `c505b08a` intact
  (the run_all integrity ECHO checks line 1060, which is now non-blob since the v26d CSS insert
  shifted svg to 1113 → that echo shows `0eff98b2`, INFORMATIONAL only, NOT the hard gate; harness
  content-scan `blob-in-script:false`). 3 scripts parse (`all parse:true`), IIFE true, longest
  non-blob line 553. `sigs:false` is the EXPECTED v26d ghCalibrate(+δ) echo (documented, not gated).
- **Open for tester:** live browser re-run of the v26d items (canvases now render: curve/payoff/
  portfolio draw; σ-dial stepper re-trace; S* read-out; lock/unlock; no console TDZ error).

## Done — v26d VOL-KNOB control panel (IMPLEMENTED, handed to manager 2026-06-09)
Build: **`engine/builds/temporal_mvp_v26d_volknob.html`** (orig md5 `16a872ba…`; SEE TDZ-FIX above → now `a406a751…`)
from HEAD v26c `6cc73563`; HEAD untouched. Spec: `specs/SPEC_vol_knob_NEXT.md`. Splices (saved):
`engine/splices/splice_v26d.py` (6 reps, all `count==1`) + `engine/splices/splice_v26d_css.py` (1 rep).
Blobs never through. Test: `/tmp/test_v26d.js` (sandbox).
- **σ-dial control panel** in the curve canvas-wrap (before legend). Number-stepper `<input type=number>`
  (NOT sliders, per §8). Locked default "Perpetual-option mode": editable **σ** (0.129) + **r** (0.05);
  read-only derived **γ**, **S\*** (=K·γ/(γ+1) at live spot), **δ**(=0.08 "ATM smoothing"), **β=1**.
  Unlock checkbox "Free shape — off-theory": exposes editable raw **γ**,**δ**; σ becomes derived. CSS
  `.vol-knob` added in `<style>` (after `.preview-w-readout .w-skew`, line ~607).
- **σ→γ map** (UI, block 3): `γ=(−1+√(1+8r/σ²))/2`; γ→σ inverse `σ=√(2r/(γ(γ+1)))` for the unlocked
  read-out. **HARD floor γ>1** (clamp 1.0001, visible note). Upper side soft. δ>0 guard (clamp 0.0001).
- **Engine sig touch (THE ONLY ONE):** `ghCalibrate(X0,Y0,mp0,gamma,delta)` — δ 5th param, `if(!(delta>0))
  delta=0.08`. Body math (ah/bh/…) byte-preserved; init caller stays 4-arg → byte-identical open. The
  `sigs:false` echo in verify_v26a_mine.js is EXPECTED (only the ghCalibrate regex; other 4 curve fns
  `grep -cF`=1 each). Not gated.
- **Live re-warp IN PLACE — new Store mutator `setShape(gamma,delta)`** (after setOracle; exported).
  Re-calibrates at CURRENT operating point: X=x−α, Y=y−β, mp0=`Engine.getMP_raw(p)`; reassigns ONLY
  gh* scalars (ghAh/ghBh/ghDelta/ghMu/ghNx/ghNy/ghP/ghM/ghU0), KEEPS x,y,α,β,oracle + all bands/perps.
  Re-anchors `_baseline_k` (depth shape-dependent). NaN-guard on every cal scalar → keeps old shape on
  failure (loud). γ>1 floor + δ>0 re-enforced inside setShape (defense-in-depth vs UI). UI `apply()`
  calls setShape then `render()` (full redraw → curve/payoff/portfolio + previewBand re-trace).
- **Dollar/settlement pipe NOT touched** — setShape never enters executeBand/closeBand/funding/isOTM/
  markFrac/drawStrikeMark; it only reshapes the curve scalars. §6 stop NOT triggered (re-warp in place
  needed NO dollar-path change). Diff vs HEAD = 7 hunks ONLY (CSS, HTML panel, ghCalibrate sig,
  GH_GAMMA comment, setShape, export line, UI block). grep of diff content for all locked-surface fn
  names = empty (one comment string mentioning arbitrageToOracle, not an edit).
- **Verification:** `sh verify/run_all.sh builds/temporal_mvp_v26d_volknob.html` EXIT 0 — 7 GH PASS
  γ∈{1.5,2,3,4}, seam PASS both branches, dir PASS, blobs `ab663f5c`/`c505b08a` multiset-OK (svg
  shifted to line 1113 by the CSS-above-blob insert; content byte-identical), 3 scripts parse, IIFE
  true, longest non-blob line 553. **Sandbox test PASS:** G4 value∝S^−γ holds each γ∈{1.2,1.5,2,3,4}
  (d log sNorm/d log S = −γ, relerr ~4e-4); setShape preserves spot |d|=0 (exact); δ threaded (0.15→
  ghDelta=0.15); γ>1 floor (0.5→1.0001); S\*=K·γ/(γ+1) finite; σ=0.129/r=0.05→γ=2.00.
- **Open for tester (live UI):** pro-forma dotted line + step-1/step-2 stepper re-trace after a σ change;
  curve re-warps in place under open bands; portfolio/payoff redraw; S\* read-out tracks the dial; no
  console errors; lock/unlock toggles input visibility. (Code leaves it ABLE to re-trace — render()
  re-runs previewBand which rebuilds leg1State/leg2State + curveTrace on the new pool.)

## Done — v26b payoff x-range widen (DISPLAY-ONLY, handed to manager 2026-06-08)
Build: **`engine/builds/temporal_mvp_v26b_xrange.html`** (from HEAD `8df9f8a3`; HEAD untouched).
Splice: `/tmp/splice_xrange.py` (2 reps, both `count==1`, blobs never through). Operator-approved
(tester item-3 follow-up). Diff vs HEAD = exactly 2 lines, both in `drawPayoff`:
- L3815 `const xMin = -0.5, xMax = 0.5` → `-2.0 .. 2.0` (perp-mark % sweep). Picked ±200% as the
  smallest clean round range: default γ=2 (`GH_GAMMA=2.0`), naked/barrier (call-wing) free boundary
  `sNorm*=θ·((γ+1)/γ)^γ=2.25·θ`; r∈[−2,+2] takes sNorm up to 3.0, clears S* for typical OTM θ so the
  uncapped naked leg's intrinsic visibly diverges above the capped (min(1,·)) spread leg.
- L3947 x-tick loop `pct=-50..50 step10` → `-200..200 step50` (9 ticks). No other axis/range text
  states a number (note at L1442 is qualitative); nothing else to update.
- NO touch to mark/markFrac/legFraction/curve fns/funding/settlement (display/axis only). Harness
  green from `engine/`: `sh verify/run_all.sh builds/temporal_mvp_v26b_xrange.html` → 7 GH gates
  PASS γ∈{1.5,2,3,4}, seam gate PASS both branches, blobs `ab663f5c`/`c505b08a` intact, 3 scripts
  parse, sigs:true, IIFE:true, longest non-blob line 553 chars. **Open for tester:** visual — naked
  leg climbing past capped spread now visible within the wider frame.

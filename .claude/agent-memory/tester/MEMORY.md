# MEMORY — tester
_Last updated: 2026-06-22, after LIVE CHART-2 OPTION C smoke on WORKING-TREE build `dd6fb955` (chart-2 "MARK ACROSS STRIKES" now plots the NORMALIZED STEEPNESS SHAPE r^g, r=sNorm/θ call / θ/sNorm put, g=m·γ — psiShape L3737; markers drawStrikeMark L3804 use the SAME r^g). **VERDICT = PASS x2 byte-stable — KNOB NOW VISIBLE, the prior `6a23f93d` FLAG is RESOLVED.** All 6/6 checks PASS in run A AND run B. CRITICAL: the per-m chart-2 PNG md5s are now DISTINCT — m1=`e5789975…` / m3=`aa411091…` / m6=`6cf4cd81…` (last build m1≡m3 was the bug); widthAtHalf collapses 345→123→63 as m rises while apex stays psi≈1.00 (apex y17 vs y=1.00 tick y18, 1px). Visually confirmed: m=1 broad tent vs m=6 sharp spike, both peak 1.00 at φ_m. wings fall off; mode line meets apex at top; markers ON the shape curve (red sold dPsi 0.025 / green bought dPsi 0.0085); 0 console/pageerror/dialog x2. Display-only — engine math UNCHANGED (gLoc/markLensed byte-untouched). Gates 13+5 green, monolith 8/8 report-only, blobs canonical (webp ab663f5c…/svg c505b08a…), 3 scripts parse, longest script line 603. Build md5 `dd6fb9557c251df222a4f918970576dd` UNCHANGED pre/post (READ-ONLY; Wrote harness `verify/pw_v28_chart2optC_smoke.mjs` + evidence `evidence/v28_chart2_optC/`). Manager: DIFF_LEDGER entry + #3/#15 rows still OWED. operator entry-226 ("steeper when I set for higher vol", verbatim L1815) now SATISFIED on chart-2 again. Prior: chart2-NORM `6a23f93d` FLAG/FAIL (kurtosis invisible); M-CLAMP `9f1e625b` PASS._

## ★★★★★ MOST RECENT — QC ORACLE SWEEP (operator entry 286), HEAD `dd6fb955` READ-ONLY = FLAG (put mark dips BELOW linear intrinsic)
Live-browser sweep of the DISPLAYED put mark vs spot. NO engine edit; build md5 `dd6fb9557c251df222a4f918970576dd` UNCHANGED pre/post; blobs canonical (webp ab663f5c…/svg c505b08a…); 0 console/pageerror/dialog x2; A==B byte-stable (16 below-intrinsic both runs). Harness `engine/verify/pw_oracle_sweep_qc.mjs`; evidence `evidence/dexters_lab/oracle_sweep_2026-06-26/`.
- SETUP: default pool w=0.5⇒γ=1, SLOPE MULT m=2 ⇒ g_loc=2 EXACT at every spot (read live, not assumed). Opened long band sold-call $100k / bought-put $60k (tiny N=0.01), ran arb ⇒ w=0.5 restored exact (tradeUpdate preserves α,β). Swept #kpi-oracle (setOracle rebases, w & sNorm=1 invariant) so put moneyness S/K=oracle/$60k spans 1.50→0.20.
- QUOTED MARK READ FROM: portfolio bands-table BOUGHT-put row, column "EQUITY@CLOSE / MARK" = c.m (pfComponents L4383 = Engine.markLensed at live sNorm). Read as DOM text (4 dp), NOT recomputed. S & K read as displayed dollars (ORACLE-LIVE col / ORIG-STRIKE col). Screenshot-confirmed at S/K=0.444 (mark 0.3337 vs intrinsic 0.556).
- **#1 HEADLINE = FLAG (NOT faithful): put mark dips BELOW linear intrinsic max(1−S/K,0).** Sign of (mark−intrinsic): + for S/K≥0.82 (OTM + shallow-ITM faithful); FIRST DIP at S/K=0.80 (diff −0.0148); − continuously down to S/K=0.20 (deepest sampled). Max shortfall ≈ −0.248 at S/K≈0.30. Sign crossover S/K≈0.819 (matches z−z²=g^g/(g+1)^(g+1)=4/27).
- **#3 EMPIRICAL SEAM (continuation→intrinsic): S/K ≈ 0.444, NOT the paper's 0.667.** Boundary mark = 1/(g+1)=0.3333 lands at S/K=0.444 = (g/(g+1))^g = (2/3)². At the paper's 0.667 the engine mark is 0.2222 (still continuation). CLAUDE.md §4 "S*=K·γ/(γ+1)=0.667K" does NOT match the put's actual markLensed dollar seam.
- ★ ROOT: markLensed put "intrinsic" branch (L1674) = 1−(S/K)^(1/g) — a POWER payoff, = linear 1−S/K ONLY at g=1; for g=2 it sits below linear. AND continuation (0.444<S/K<1) is a small smooth-paste value below linear intrinsic. So vs the engine's OWN power-intrinsic it's fine (smooth-paste holds); vs the task's VANILLA-linear payoff it's below → per entry-286's oracle = FLAG. The linear-vs-power PUT PAYOFF question is settlement-semantics = OPERATOR call (surfaced to manager, NOT decided here).
- Did NOT git; did NOT touch engine or DIFF_LEDGER (QC measurement only). Manager: this FLAG + the seam-0.444-vs-0.667 mismatch are for escalation.

## ★★★★★ MOST RECENT — LIVE CHART-2 OPTION C smoke, build `dd6fb955` = 6/6 PASS x2 byte-stable (RESOLVES the `6a23f93d` kurtosis-invisible FLAG)
Manager replaced chart-2's peak-normalized value plot (which CANCELLED g) with the NORMALIZED STEEPNESS SHAPE: psiShape (L3737) r=sNorm/θ (call) / θ/sNorm (put), then r^g, g=m·γ. Mode r=1⇒1; wings r<1⇒r^g steepen with m. drawStrikeMark (L3804) uses the SAME r^g. Display-only — gLoc/markLensed byte-unchanged.
- Build md5 `dd6fb9557c251df222a4f918970576dd` UNCHANGED pre/post (READ-ONLY; Wrote harness `verify/pw_v28_chart2optC_smoke.mjs` + evidence `evidence/v28_chart2_optC/`). NOT pushed.
- **CHECK1 peak=1 at mode: PASS.** pixel apex psi=1.0032 @ φ=45° (x466,y17) vs y=1.00 tick y18 (1px); analytic peakShape=1.0 exact.
- **CHECK2 wings fall off: PASS.** put-wing(22°)=0.4091 / call-wing(68°)=0.4058 fall from 1 toward 0.
- **CHECK3 mode line meets apex at top: PASS.** apex y17 vs y@psi1=18, gap 1px.
- **CHECK4 KURTOSIS VISIBLE: PASS — THE FLAG IS CLOSED.** 3 DISTINCT chart-2 PNG md5: m1 `e5789975db12d88bf2ce43fb3f4dd1d0` / m3 `aa41109152ed81c9b676985330a6d0a2` / m6 `6cf4cd819ac719746c11ddb3ba34da11`. m=1≠m=3 (was IDENTICAL last build). widthAtHalf 345→123→63; analytic shapeCall(θ2.5) 0.4→0.064→0.0041, shapePut(θ0.4) same, shapeDeep(θ5) 0.2→0.008→0.00006 — all decrease (steeper); apex stays psi≈1.00 every m. VISUAL: A_chart2_m1.png broad tent vs A_chart2_m6.png sharp spike, both peak 1.00 at φ_m.
- **CHECK5 markers on curve: PASS.** band(sold-call $120k/bought-put $48k/N=0.03): red(sold θ1.5,φ56.25°) dotPsi 0.640 vs shape 0.665 (dPsi 0.025); green(bought θ0.6,φ30.94°) dotPsi 0.604 vs 0.595 (dPsi 0.0085) — both ≤ dot-radius. A_chart2_band_markers.png: green on pink put-arm, red on teal call-arm, faint stems to axis.
- **CHECK6 zero errors: PASS.** 0 console / 0 pageerror / 0 dialog x2. RESULT_runA==RESULT_runB (modulo run label); per-m PNGs byte-identical A/B.
- Gates lens_selfcheck 13/0 + a16_atm 5/0 green; monolith 8/8 report-only; blobs canonical (webp L74 ab663f5c…, svg L1060 c505b08a…), 3 scripts parse, longest script line 603 chars.
- ★ WHY OPTION C FIXES IT: the prior peak-norm divided markLensed by its mode value, and markLensed's continuation form = sNorm/((g+1)·θ·…) so the g factor CANCELLED (norm = sNorm/θ, g-free). Option C does NOT normalize a value — it plots r^g DIRECTLY (r=sNorm/θ at the mode is 1 by construction, no division), so g=m·γ SURVIVES into the wing exponent. Peak-at-1 AND knob-visible are NO LONGER mutually exclusive (the `6a23f93d` conflict is dissolved, not waived).
- ★ OPERATOR-VOICE: entry-226 [verbatim L1815] "i want to see steeper when i set for higher vol" → RESOLVED(evidence) — chart-2 steepens visibly with m (3 distinct PNGs, width 345→63). L2063 mode-must-reach-1 → still RESOLVED (apex 1.0032). Both chart-2 requirements now hold together.
- ★ GOTCHA: m=1 PNG md5 `e5789975…` is the SAME as the prior FAIL build's m=1 (r^1 unchanged at m=1) — that is EXPECTED and not a regression; the proof is m=3/m=6 now DIFFER from it.
- Did NOT git (READ-ONLY; manager promotes). **DIFF_LEDGER entry NOW WRITTEN (2026-06-22):** appended `### dd6fb955` entry (feature-keyed #3 visibility-RESTORED + #15 chart/UI + "none beyond", OPERATOR-VOICE entry-226 L1815 + L2063 BOTH RESOLVED-with-evidence, verdict PASS/PROMOTABLE); updated feature-state table rows #3 (kurtosis VISIBILITY restored, 3 distinct PNG md5) + #15 (chart-2 plots `r^(m·γ)` steepness shape, file-safety green); CLOSED standing recon row CHART2-NORM-CANCELS-KURTOSIS → RESOLVED-in-`dd6fb955` (Option C dissolves it). Build is working-tree, NOT pushed.
## ★★★★ Prior — LIVE CHART-2 NORMALIZATION smoke, candidate `6a23f93d` = FLAG/FAIL (kurtosis invisible)
Manager normalized chart-2's drawn value curve so the mode peaks at y=1 (operator L2063: mode wasn't reaching the top, "beats the purpose of the chart"). `psiN = min(1, psiAt(θ)/peakNorm)`, peakNorm = ψ at the mode strike; markers get the SAME normalization (`mk/peakMk`). Display-only — markLensed/gLoc byte-unchanged.
- Build md5 `6a23f93de3cbcdbf832cb61115c129eb` UNCHANGED pre/post (READ-ONLY; Wrote harness `verify/pw_v28_chart2norm_smoke.mjs` + evidence `evidence/v28_chart2_norm/` + ledger entry + recon row + rows #3/#15).
- **CHECK1 peak=1 at mode: PASS.** pixel apex psi=1.0032 @ φ=45° (x466, y17) vs y=1.00 tick at y18 (1px). Operator L2063 complaint FIXED.
- **CHECK2 wings fall off: PASS.** put-wing(22°) 0.409 / call-wing(68°) 0.406, fall from top toward 0.
- **CHECK3 mode dashed line meets apex at top: PASS.** apex y17 vs y@psi1=18, gap 1px (line runs to toPx(tmDeg,1)).
- **CHECK4 higher-m-steeper, peak stays 1: FAIL — THE FLAG.** Normalized chart-2 is m-INVARIANT. normPut(θ0.4)=0.4, normCall(θ2.5)=0.4, normDeepCall(θ5)=0.2 BYTE-IDENTICAL across m=1/3/6; widthAtHalf=345px for all m; chart-2 screenshots md5-identical `A_chart2_m1.png` == `A_chart2_m3_kurt.png` = `e5789975db12d88bf2ce43fb3f4dd1d0`. Knob has ZERO visible effect on chart-2. Peak DOES stay at 1 (the one sub-requirement that holds).
- **CHECK5 markers on normalized curve: PASS.** band(sold-call $120k/bought-put $48k/N=0.03): red(sold θ1.5) dot psi 0.643 vs analytic norm 0.668 (dPsi 0.025); green(bought θ0.6) 0.610 vs 0.599 (dPsi 0.011) — both ≤ dot-radius. f6029182 psiAt ReferenceError stays fixed (inline in-scope).
- **CHECK6 zero errors: PASS.** 0 console / 0 pageerror / 0 dialog x2. RESULT_runA==RESULT_runB (modulo run label).
- Gates lens_selfcheck 13/0 + a16_atm 5/0 green; monolith 8/8 report-only; blobs canonical (webp L74 ab663f5c…, svg L1060 c505b08a…), 3 scripts parse.
- ★ ROOT CAUSE (engine math, NOT a draw bug): markLensed continuation call value = sNorm/((g+1)·θ·((g+1)/g)^g), mode peak = 1/((g+1)·((g+1)/g)^g) ⇒ normalized = sNorm/θ, the g=m·γ factor CANCELS EXACTLY. Put arm = θ/sNorm, also g-free. The drawn curve fixes sNorm at the mode and sweeps strike θ, so it never leaves continuation; even deep-wing intrinsic normalizes m-free. Peak-normalization and knob-visibility are MUTUALLY EXCLUSIVE on chart-2 under this design.
- ★ OPERATOR-VOICE: L2063 [verbatim] mode-must-reach-1 → RESOLVED(evidence) this build. entry-226 [verbatim L1815] "i want to see steeper when i set for higher vol" → REOPENED/OPEN — this build makes chart-2 m-invisible; prior `8f897edc` satisfied it (apex 0.25→0.105 steepened). Cannot mark resolved; regressed. OPEN QUESTION escalated to manager: the two chart-2 requirements conflict under peak-normalization — operator must rule priority, or a both-satisfying anchor (absolute-scale curve with a visible 1.0 gridline; OR mode-reference-only normalization keeping the absolute curve).
- ★ HARNESS GOTCHA (this run): my first marker detector pooled the dot WITH its 0.4-alpha stem ⇒ false dy=118/null. FIX: require alpha>200 for the solid disc centroid, then compare dot pixel-psi to the analytic NORMALIZED curve value at the dot's φ (curve & marker share identical math). The on-curve test is dot-psi vs analytic-norm, NOT a pixel curve-finder (the AA curve at the exact dot column is unreliable).
- ★ GOTCHA: chart-2 PNG md5-equality across m IS the visual proof of the FAIL — no need to eyeball; identical bytes = identical render = knob invisible.
- Did NOT git (READ-ONLY; manager must NOT promote — escalate operator product call). Build is working-tree, NOT pushed.

## ★★★★★ Prior — LIVE M-CLAMP smoke, HEAD `9f1e625b` = 6/6 PASS x2 byte-stable
Operator typed SLOPE MULT M=0.1 (below baseline 1) live -> curve dropped to out-of-range (peak ~0.70). `#m-input` declared `min="1" max="6"` but JS didn't enforce. Manager added clamp to [1,6] in `setM` (L2431) AND the input change/input handler (L2824), with field-value writeback on `change`; also shortened header badge (L1085, drops "· Identities I-V").
- Build md5 `9f1e625b168309b9097c26cb84744e77` UNCHANGED pre/post (READ-ONLY; Wrote harness `verify/pw_v28_mclamp_smoke.mjs` + evidence `evidence/v28_mclamp/` + ledger entry + table rows #3/#15).
- **CHECK1 m=0.1->clamp m=1:** `state.m`=1, analytic peak 0.2500 == baseline (NOT ~0.70), pixel apex psi=0.2532 @ phi45. PASS.
- **CHECK2 field writeback:** `#m-input`.value snaps to "1" after change event. PASS.
- **CHECK3 m=10->clamp m=6:** `state.m`=6, peak 0.0567, field "6". PASS.
- **CHECK4 m=3 in-range:** works, `state.m`=3, peak 0.1055, field "3". PASS.
- **CHECK5 header badge:** exactly "Composite-Ray AMM · trusted-from-prover", single line. PASS.
- **CHECK6 no regression:** band markers render ON the lensed curve, prior `d606c3f2` UXFIX-2 intact. PASS.
- ★ GOTCHA: "Mark Across Strikes" is the chart-select `pricing` option itself (L1378), NOT a separate selector — `showPricing()` already puts the strike-mark view up. Default band dir-pill is already `long` (L1117 data-dir="long").
- ★ NOTE: default pool γ=1 ⇒ g_loc=m·γ=m; absolute mode peaks m1=0.2500/m3=0.1055/m6=0.0567 (these are the ABSOLUTE smooth-paste values, before any chart-2 normalization).

_Prior run-header (UX-FIX-2 `d606c3f2`): Last updated 2026-06-22, after LIVE UX-FIX-2 RE-TEST on HEAD `d606c3f2` (re-fix of the `f6029182` drawStrikeMark psiAt-out-of-scope FLAG). **VERDICT = PASS — PROMOTABLE.** The exact thing that was broken is fixed: 0 pageerrors (was 4× `ReferenceError: psiAt is not defined`), 182 dot pixels render (was 0), sold red #FF6767 (567,273) + bought green #14E800 (333,277) ON the lensed curve at the smooth-paste mark ψ≈0.15-0.16 (dy 2-3px), NOT the old un-lensed ~0.85/0.95 float. Fix #1 (overclaim removal) still clean. Curve byte-unchanged, gates 13+5 green, file-safety green, build md5 `d606c3f27210bb6cbbb37d2ef0c90525` UNCHANGED (READ-ONLY; only Wrote harness `verify/pw_v28_uxfix2_smoke.mjs` + evidence `evidence/v28_uxfix2/` + DIFF_LEDGER entry/rows). Ledger UXFIX-2 → RECONCILED-in-`d606c3f2`. Prior: `f6029182` FLAG; caption-fix `aa1e5d05` PASS._

## ★★★★★ MOST RECENT — LIVE UX-FIX-2 RE-TEST, HEAD `d606c3f2` = PASS ×2 byte-stable (closes the `f6029182` FLAG)
Manager re-fixed drawStrikeMark by INLINING the lensed mark with in-scope `Engine.gLoc(state.pool,θ,state.m)`+`Engine.markLensed(w,θ,snap.sNorm,g)` (no `psiAt`). I live-confirmed the dots now render ON the curve, 0 pageerrors.
- Build md5 `d606c3f27210bb6cbbb37d2ef0c90525` UNCHANGED pre/post (READ-ONLY; Wrote harness `verify/pw_v28_uxfix2_smoke.mjs` + evidence `evidence/v28_uxfix2/` + ledger entry + reconciliation row + table rows #6/#7/#15).
- **0 PAGEERRORS both runs** — the `ReferenceError: psiAt is not defined` ×4 is GONE. 0 console / 0 dialogs.
- **182 dot pixels** on the pricing canvas both runs (was 0). sold.inner θ=1.5 @ φ56.31°/$120k = red #FF6767 (255,103,103) at (567,273) dotPsi=0.1631 expY=276 dy=3px; bought.inner θ=0.6 @ φ30.96°/$48k = green #14E800 (20,232,0) at (333,277) dotPsi=0.1506 expY=279 dy=2px. Both ON the curve arms.
- **Dots at the lensed smooth-paste mark ~0.15-0.16, NOT the old un-lensed ~0.85/0.95.** Visual `A_pricing_band.png`: green dot on pink put-arm, red dot on teal call-arm, faint stems to axis; mode apex ~0.25 at φ45°, gray mark=1 line far above. dy 2-3px = dot-radius/AA slop, not a height error.
- **FIX #1 still clean ×2:** trusted-from-prover shows; Lean-validated/Aristotle-verified/no-sorry body scan ⇒ []. header/panel "Math Reference (trusted-from-prover)", badge "Composite-Ray AMM · Identities I–V (trusted-from-prover)".
- **Curve byte-unchanged + gates green:** modeMark 0.2479<1, m=1/γ1.0130/g1.0130. run_all GREEN lens_selfcheck 13/0 + a16_atm 5/0 (+ monolith 8/8 report-only). File-safety GREEN (webp L74 ab663f5c…, svg L1060 c505b08a…, 3 scripts parse). NOTE: run_all integrity header still says "want f6029182" (stale string comparing the OLD candidate md5 — the actual blob/gate checks all pass; manager housekeeping, NOT a gate fail).
- ★ ROOT CAUSE CLOSED (read-only, brace-depth verified): drawStrikeMark (L3782, depth-1 sibling of drawState) inlines g=Engine.gLoc(state.pool,θ,state.m) then Engine.markLensed(w,θ,snap.sNorm,g); snap@L3774, toPx@L3661, phiMaxDeg@L3660, colShort/colLong all renderPricingFrame-scope. NO psiAt (which is depth-2 closure-local of nested drawState@L3726 — the f6029182 throw cause).
- ×2 byte-stable: RESULT_runA.json == RESULT_runB.json modulo run label; same dot coords/RGB/census. A/B PNG md5 differ (A_pricing 5abf21a9… vs B_ a16293b1…) by PNG-encoder/AA jitter ONLY — structured pixel data identical (same 182 census, same coords).
- Evidence `evidence/v28_uxfix2/` (RESULT/RUN_LOG run{A,B}, {A,B}_pricing_band.png + _fullpage.png, INDEX.txt). Harness `engine/verify/pw_v28_uxfix2_smoke.mjs` (single A/B arg; derived from pw_v28_uxfix_smoke.mjs, only OUT dir + md5-comment changed).
- ★ SAME HARNESS GOTCHA as f6029182: match SPECIFIC dot colors #FF6767/#14E800 (curve wings #0ABAB5/#FF85B0) + full-canvas census; a saturation-only finder false-matches the curve. Plot box leftX49/topY17/botY326/plotW832/plotH309; toPx(phi,psi)=[49+phi/90*832, 17+(1-psi)*309].
- Did NOT git (READ-ONLY; manager promotes `d606c3f2` → HEAD + merges).


## ★★★★ Prior — LIVE UX-fix smoke, CANDIDATE `f6029182` = FLAG (NOW CLOSED by d606c3f2 above) (fix#1 PASS, fix#2 FAIL/regression)
Operator caught TWO things; intern made a UX-only build. I live-confirmed fix#1 is correct and fix#2 is a runtime ReferenceError that drops the dots entirely.
- Build `engine/builds/HEAD_temporal_mvp_v28_lens.html` md5 `f602918201e2365b779b4965753f86bf` UNCHANGED pre/post (READ-ONLY; Wrote harness `verify/pw_v28_uxfix_smoke.mjs` + evidence `evidence/v28_uxfix/` + DIFF_LEDGER entry + reconciliation row).
- **FIX #1 (overclaim removal) = PASS ×2 byte-stable.** Live DOM innerText: header/panel "Math Reference (trusted-from-prover)"; badge "Composite-Ray AMM · Identities I–V (trusted-from-prover)"; footer "...Identities I–V trusted-from-prover (Aristotle-compiled, not locally re-verified) · docs"; meta L27 "...trusted-from-prover (Aristotle-compiled, std axioms; not locally re-verified)." Body scan for Lean-validated/Aristotle-verified/no sorry ⇒ [] (zero). trusted-from-prover present ⇒ true.
- **FIX #2 (strike dots on curve) = FAIL — REGRESSION.** With a real band open (sold-call θ=1.5 @ φ56.3°/$120k, bought-put θ=0.6 @ φ31°/$48k), switched to Mark Across Strikes: **4 pageerrors `ReferenceError: psiAt is not defined`** (1 per drawStrikeMark call), **0 red(#FF6767)/0 green(#14E800) dot pixels** on the whole pricing canvas, foundDot=NONE both strikes. Visual `A_pricing_band.png`: curve renders, NO dots. Deterministic, identical A/B.
  ★ ROOT CAUSE (read-only, brace-depth verified L3642/3718/3726/3782): `psiAt` declared depth-2 INSIDE nested `drawState`; `drawStrikeMark` is depth-1 SIBLING of drawState in `renderPricingFrame` ⇒ psiAt out of scope ⇒ throws every call. Prior `aa1e5d05` used `Engine.mark(...)` (top-level, in scope, no throw, but un-lensed ⇒ floated ~0.85/0.95). Fix swapped target to lensed psiAt but did not hoist/inline it. **FIX for intern:** hoist psiAt+gAt (+tau_v/sNorm/poolForLens closures) to renderPricingFrame scope, OR inline Engine.gLoc+Engine.markLensed inside drawStrikeMark. Math/intent correct, scope wrong.
- **CURVE UNCHANGED + gates green:** default m=1/γ=1.0130/g=1.0130, modeMark=0.2479<1, apex ~0.25 at φ_m, below the gray mark=1 line. run_all GREEN lens_selfcheck 13/0 + a16_atm 5/0 (gates exercise ENGINE math, NOT the draw-layer drawStrikeMark — which is exactly why they pass green while the dots throw; only the live browser catches it). File-safety GREEN (webp L74 ab663f5c…, svg L1060 c505b08a…, 3 scripts parse).
- 0 console errors. 4 pageerrors (the bug). 0 dialogs. ×2 byte-stable: RESULT_runA.json == RESULT_runB.json (modulo run label).
- Evidence `evidence/v28_uxfix/` (RESULT_run{A,B}.json, RUN_LOG_run{A,B}.txt, {A,B}_pricing_band.png, {A,B}_fullpage.png). Harness `engine/verify/pw_v28_uxfix_smoke.mjs`.
- ★ HARNESS GOTCHA: a saturation-only dot finder FALSE-MATCHES the teal/pink CURVE pixels (gave a misleading dy=0px on the first pass). Must match the SPECIFIC dot colors colShort #FF6767 / colLong #14E800 (curve wings are #0ABAB5/#FF85B0) + a full-canvas dot-pixel CENSUS to prove dots truly absent. Plot box on canvas-pricing: leftX49/topY17/botY326/plotW832/plotH309; toPx(phi,psi)=[left+phi/90*plotW, top+(1-psi)*plotH].
- Did NOT git (READ-ONLY; manager promotes — and must NOT promote until fix#2 lands).

## ★★★★★ MOST RECENT — LIVE caption-fix smoke, HEAD `aa1e5d05` (depiction-only) = PASS ×2 byte-stable
Operator flagged STALE "Mark Across Strikes" legend+caption (claimed mark=1 at the mode via old min/max ψ=min/max formula; engine markLensed actually peaks BELOW 1 at the mode). Intern corrected 2 text lines. I live-confirmed render IS fixed AND behavior UNCHANGED.
- Build `engine/builds/HEAD_temporal_mvp_v28_lens.html` md5 `aa1e5d0593ad36f3581178bca986be3a` UNCHANGED pre/post (READ-ONLY on engine; only Wrote harness `verify/pw_v28_caption_fix_smoke.mjs` + evidence).
- **LEGEND (read live, L1418):** "mark = 1 (full exercise cap)" — NOT "(mode)". PASS.
- **CAPTION (read live, L1423):** "...mark ψ = lensed smooth-paste option value (steepness g = m·γ); it peaks at the mode strike θ_m = sNorm at 1/((g+1)·((g+1)/g)^g) < 1 — NOT at 1 — and reaches 1 only at full exercise..." NO stale min/max. PASS.
- **CURVE UNCHANGED (text-only delta):** default state is m=1/γ=1 ⇒ g=m·γ=1 (m-input default=1, min=1; the brief's 0.3849@g=0.5 is a manager illustration of a g=0.5 state the UI can't reach). markLensed(call/put,mode)=0.2500 == closed-form 1/((g+1)·((g+1)/g)^g)=0.2500, < 1. PIXEL apex at mode column (φ=45°,x=466): y=248 ⇒ psi=0.2532 == analytic 0.2500 (sub-pixel). The tent peaks at ~0.25, NOT at 1; the gray dashed mark=1 line sits far above. PASS.
- **KNOB:** chart-2 steepens with m (mode-peak 0.2500→0.1055→0.0567 @ m1/3/6, distinct hashes/lit 8352/8242/8100). chart-1 (pool) INERT to m AFTER band-clear (44c64875 ×3) — uncleared, the boot suggestStrikes __previewPool ghost makes chart-1 m-dependent (known gotcha; cleared band-notional+sold-inner+bought-inner). PASS.
- 0 console / 0 pageerror / 0 dialog ×2. RESULT_runA.json == RESULT_runB.json (modulo run label); A/B PNGs byte-identical (pricing 349afa77, fullpage 365cd3ac).
- Evidence `evidence/v28_caption_fix/` (RESULT_run{A,B}.json, RUN_LOG_run{A,B}.txt, {A,B}_pricing_default.png, {A,B}_fullpage.png). Harness `engine/verify/pw_v28_caption_fix_smoke.mjs`.
- ★ GOTCHA: geometry of canvas-pricing — pad{top18,bottom54,left50,right18}, plotH=308; psi=1 at y18 (gray dashed line), psi=0 at y326; mode φ=45° at x=466. yToPsi=(326−y)/308. cyan call-arm rises toward mark=1 at HIGH φ (deep ITM right edge) — do NOT use global-topmost-pixel for the mode peak; sample the mode COLUMN.
- Did NOT git (READ-ONLY; manager promotes). Ledger entry for this depiction-only delta: flagged to manager as still-owed (I did the live confirm; the DIFF_LEDGER append for aa1e5d05 is the next step if manager wants it logged as a verification — text-only #-mapping: feature #? depiction layer, none-beyond engine).

## ★★★★★ MOST RECENT — BUILT monolith_consistency.js (REPORT-ONLY theory↔impl numeric bridge) 2026-06-14
NEW harness `engine/verify/monolith_consistency.js` (operator entries 243/153#9 monolith program; skeptic R6 scope-gate a04465ae WITH MANDATORY RIDERS — all obeyed). Cross-checks engine NUMBERS vs the monolith Lean formulas (`formal/aristotle_runs/MONOLITH_CONSTM/extracted/RequestProject/MonolithConstM.lean`, run 6016ec57). REPORT-ONLY: exits 0 ALWAYS (+ `|| true` belt in run_all), never aborts set -e, never the gate. HARD gates lens_selfcheck 13 + a16_atm_gate 5 UNCHANGED green. HEAD HTML md5 `80f050e26332d21c68bd7b064467470a` UNCHANGED (I am READ-ONLY on engine; only Wrote harness + edited run_all.sh).
- **8/8 PASS.** Lines: (1)price=∇μ getMP_raw==(y−β)²/αβ [NEW, RIDER value-only not slope, e^μ≡1]; (2)invariant (x−α)(y−β)=αβ [NEW]; (3)R_psd μ″=2(t−β)/αβ≥0 via FIRST-difference of marginal [NEW, RIDER not 2nd-diff=58000× false-red]; (4)g=m·γ gLoc [NEW, extends CM1]; (5)θ_tx=mode·(chosen/mode)^m executeLeg [XREF already-HARD via CM5]; (6)smooth-paste seam markLensed [XREF already-HARD via CM4]; (7)warp_linear ΔG=m·Δγ from tradeUpdate Δγ==D/β [NEW, RIDER: rewrote brief, warp=gamma_affine not draw-layer]; (8)internal_passivity Hs telescoping w/ Rcurv=μ″ Simpson ∫engine-marginal==ΔHs (FTC) [NEW, OPTION (a), not a CM6 re-run].
- **KEY MAPPING (verified ~1e-15, not assumed):** engine s.alpha==Lean alpha & s.beta==Lean beta (since Lean x=alpha·y/(y−beta) ⇒ Lean alpha=x·w=s.alpha, Lean beta=y·(1−w)=s.beta).
- **RED-CONFIRM done:** getMP_raw×1.3 ⇒ FAIL 1,3,8 (others correctly PASS); gLoc×1.5 ⇒ FAIL 4; tradeUpdate dx×1.05 ⇒ FAIL 3,7. Detects drift in every load-bearing engine fn.
- **Honest ceiling stated in header verbatim-in-spirit:** "cross-checks NUMBERS; stays red on drift; does NOT make Lean 'verified' and does NOT prove the engine IS the Lean object — only that they AGREE numerically."
- Handed to manager for independent audit + skeptic red-confirm. Did NOT git.

## ★★★★★ Prior — INHERITED-FROM-v24 CONTRACTS on HEAD `8f897edc` (READ-ONLY) = 5/5 PASS ×2; FLAG-OMISSION #2 CLOSED
Verified the contracts inherited from v24 that the constmult promotion smoke did NOT live-confirm. Build md5 `8f897edc` UNCHANGED pre/post (I edited only DIFF_LEDGER.md, never engine). run_all GREEN (lens_selfcheck 13/0 + a16_atm_gate 5/0). 0 console / 0 pageerrors ×2. Harness `engine/verify/pw_v28_inherited_smoke.mjs` (A/B); evidence `evidence/v28_constmult_inherited/` (RUN_LOG_run{A,B} byte-stable; RESULT_run{A,B}.json byte-IDENTICAL; ITM_FORCED_probe.json; A/B fullpage PNG byte-identical 291703b; INDEX.txt). Ledger entry appended above the reconciliation list + table rows #4/#5/#7/#8/#9/#11 amended + RESOLVED/RULED got the entry-232 funding ruling.
- **ITEM 1 [#4] CARRY P=Ny/Nx PASS:** default w=0.5, carry P (=getMP_raw=w·y/((1−w)·x)) = $80,000 == oracle, poolMark$=$80,000, sNorm=1, u=log(80000)−log(80000)=0 finite/not-NaN. == v24.
- **ITEM 2 [#5] REBASE PASS:** via Store.setOracle→Engine.rebase. oracle 80k→100k (r=1.25): x×1.25/α×1.25, β,y,w invariant, mp_raw×0.8=1/r EXACT (P→P/r), θ→θ/r. 100k→64k (r=0.64): symmetric, mp_raw×1.5625 EXACT. == v24 (x→r·x,α→r·α,β,y,w inv).
- **ITEM 3 [#8] STRIKE REG PASS:** θ=K/oracle. K=$120k→θ1.5 call mk 0.1667; $80k→θ1.0 mk 0.25; $48k→θ0.6 put mk 0.15; g_loc=m·γ=1@m1, S*=g/(g+1)=0.5; display-mark+chart-ray share single sNorm coord.
- **ITEM 4 [#11/#7] DOLLAR/SETTLEMENT PASS both regimes:** OTM-expiry (oracle≈80k both OTM): settled_cash_leg=null (both reverse on AMM), trader_payout $0.072 finite. ITM-exercise (FORCED real ITM: poolMark/oracle=2.669>sold-call ray 1.5, no rebase): settled_cash_leg='sold'/live_leg='bought', trader_payout $3.78, raw_net finite, reserves finite. Round-trip restore EXACT (Node-oracle |dx|=|dy|=0). NO NaN, NO absurd mag.
  ★ GOTCHA: an oracle-bump does NOT create ITM — Store.setOracle REBASES (frame rescale, poolMark/oracle stays ~1, band strikes re-ray live). To force a real ITM exercise, move poolMark above the strike ray WITHOUT a rebase (a w-shifting tradeUpdate). v24-faithful.
- **ITEM 5 [#9] FUNDING THROUGH LENS PASS (operator entry 232 RULED m-coupled):** funding=κ·(±g_loc)·N·markLensed·(S−1)/S·dt, g_loc=m·γ (tau arg carries m). steepened pool (w=0.539,S=1.363): call(θ1.5) +3.68e-4/+4.29e-4/+5.06e-4 @ m1/2/4; put(θ0.7) −5.69e-4/−6.62e-4/−7.24e-4. SCALES with m, SIGN FLIPS call(+)/put(−), finite. SUB-LINEAR (ratio 1.27 m1→4) because g∝m but markLensed SHRINKS as g grows (g·mark 0.151→0.176→0.193). Matches skeptic's 1.13× qualitative (diff pool/N). FLAG-OMISSION #1 RESOLVED-BY-RULING (entry 232 [verbatim L1865] "funding slope deviation thing would be as seej thru the lens" = option B kept).

## ★★★★★ MOST RECENT — CONSTMULT candidate `8f897edc` (constant slope-multiplier lens, operator entries 229/231) = 5/5 PASS ×2, GATE = PASS
Build `engine/builds/temporal_mvp_v28_lens_constmult.html` md5 `8f897edcad49c73853096a05e7ec233d` (UNCHANGED post-run, READ-ONLY).
THE CURVE REDEFINITION: kurtosis/vol knob is now a **CONSTANT SLOPE MULTIPLIER m** — replaces BOTH the old elbow-rounding
√-lens AND the invtx √ tx-strike map. g_loc = m·γ at EVERY strike (no elbow/cusp/flat-top). Knob value flows through the
existing `tau` param slot (`state.m`); UI relabel "SLOPE MULT m" (#m-input, min 1 / max 6 / step 0.25 / default 1).
tx-strike map θ_tx = mode·(chosen/mode)^m. Pool fns (tradeUpdate/arbitrageToOracle/rebase) byte-identical to v24.
Harness `engine/verify/pw_v28_constmult_smoke.mjs` (single A/B arg); evidence `evidence/v28_constmult/` (INDEX + RUN_LOG_run{A,B}
byte-stable modulo header + rAF sweep frame-count 49/48 jitter + A_item1_m{1,2,3}.png + VIS_chart2_m{1,2,3}.png + VIS_fullpage_m3.png).
0 console / 0 pageerrors. run_all GREEN: lens_selfcheck **13 PASS** (CM1-CM9) + a16_atm_gate **5 PASS**, exit 0 (GH/(W) suites N/A on v24-base lens line).
File-safety GREEN (webp L74 `ab663f5c…`, svg L1060 `c505b08a…`, 3 scripts parse). Ledger entry appended (feature-keyed
#3/#16/#2/#6/#7/#10/#1+regression/#15 + none-beyond; OPERATOR-VOICE 229/231 RULED + 226/218/222 RESOLVED + 215/216/220 CONTEXT + 230 monolith-sync-not-this-smoke;
table header + rows #3/#16/#2/#6/#7/#10/#15 amended; rolling -R218τ → RESOLVED(evidence); reconciliation R-218 τ-DIR → RECONCILED-in-`8f897edc`).
- **ITEM 1 PASS (steeper everywhere, m·γ, no elbow/cusp/flat-top):** default pool w=0.5/γ=1. g_loc CONSTANT across an 11-strike
  ladder (0.25×–4× mode), spread 0.00e+0 at each of m=1(g1)/m=2(g2)/m=3(g3); chart-2 3 distinct hashes (lit 9620/9561/9510).
  Rendered shape: ATM value <1 (0.250/0.148/0.105 @ m1/2/3), call arm==put arm at mode (C⁰, no cusp/peak=1/flat-top), whole curve
  pulls down/steepens with m (2× call 0.1667→0.0741→0.0527). VISUAL VIS_chart2_m1.png (apex 0.25) vs _m3.png (apex 0.105). run_all CM1/CM2/CM3.
- **ITEM 2 PASS (m=1 = plain v24 curve):** g_loc(2×,m=1)=1.0 == γ=1.0 exact; m=1 trade lands at chosen (theta_tx==chosen=2.0,
  K_usd==K_tx=$160k). run_all CM1 (m1⇒g_loc=γ)/CM5 (m1⇒θ_tx=chosen)/CM8 (pool byte-id v24).
- **ITEM 3 PASS (further out + reject earlier):** 2× chosen call → θ_tx 2×/4×/8× of mode @ m1/2/3 (K_tx $160k/$320k/$640k).
  Reserve reject (BUY-CALL cash-OUT, N=0.7, chosen=2× mode, depth $400k): m1 $112k / m1.5 $158k / m2 $224k / m2.5 $317k EXECUTE;
  **m3 REJECTS** verbatim "At-strike cash $448000.00 exceeds 90% of pool cash depth $400000.00 — trade rejected." N un-mutated, no silent cap. run_all CM7.
  ★ GOTCHA: the cash-OUT leg that GROWS with m is BUY-CALL (or sell-put inverts: a put chosen<mode shrinks K_tx as m rises — wrong
  direction). Use buy-call (chosen>mode) with N big enough (~0.7) to trip 90% of the default $400k depth by m=3.
- **ITEM 4 PASS (round-trip + settle@chosen):** analytic single-leg m=2 open dy=$16k@K_tx=$320k → reverse restores x/y exact (|dx|=|dy|=0).
  UI band (#btn-execute → Store.closeBand, m=2, sold-call $120k/bought-put $48k, N=0.03): |dx|=1.78e-15/|dy|=0, raw_net=7.75e-5 finite.
  SETTLE basis K_usd(chosen)=$160k DISTINCT from swap K_tx(further)=$320k. run_all CM6.
- **ITEM 5 PASS (no regression):** continuous warp sweep ANIMATES (48-49 rAF frames/1s on a 0.4-BTC band preview — CONTWARP rAF wrapper retained);
  chart-1 (canvas-curve, plain-v24 pool) INERT to m (band CLEARED ⇒ identical hash m1/m3/m6); funding alive on STEEPENED pool (w=0.6429/γ=1.8:
  call +1.00e-4/+1.12e-4/+1.17e-4, put equal-opp, finite, m-dependent — 0/0 on default pool is the S≡1 positive-control artifact, NOT a defect);
  settlement ITM path finite (m=2, sold-call ITM via oracle×2.5+arb → settled_cash_leg='sold', raw_net=−3.20e-3).
- **R-218 τ-DIRECTION RECONCILED:** the standing OPEN -R218τ (invtx landed sharper⇒CLOSER, inverting operator entry-218/222) is RESOLVED
  by this redefinition — θ_tx=mode·(chosen/mode)^m is monotone increasing in m ⇒ bigger knob lands STRICTLY FURTHER OUT (operator-ruled). No flip.
- **OPERATOR-VOICE highlights:** entry 229 [verbatim L1841] "fuck gang. its literally just a constant slope multiplier" (RULED, delivered);
  entry 231 [L1857] "yes" (replaces elbow/frozen-γ design); entry 226 [L1815] "i want to see steeper when i set for higher vol, with otm —> otm +"
  (RESOLVED both halves SEEN); entries 218/222 (sharper⇒further) RESOLVED. entry 230 "monilith math etc sync up now" = SEPARATE monolith/spec-sync
  deliverable, NOT this engine smoke (flagged for manager so it's not assumed done).
- **GOTCHAS (this build):**
  - Knob value lives in `state.m`, threaded through the `tau` PARAMETER NAME in engine fn signatures (gLoc/markLensed/executeLeg/fundingPerStrike
    3rd-or-last arg). Don't be fooled by the name `tau` in code — it carries m. UI input id `#m-input`, Store.setM(v).
  - chart-1 inertness test: MUST clear BOTH band-notional AND sold-inner/bought-inner (boot suggestStrikes leaves 84000/68000 + a live
    __previewPool whose ghost on chart-1 depends on m via lensed N_buy — the documented slipfresh-wire side-effect). Clear all 3 → byte-identical chart-1 across m.
  - funding 0/0 on default pool is EXPECTED (w=0.5 ⇒ S=mp/oracle=1 ⇒ (S−1)/S=0); steepen the pool (execute a real call leg to move w) to see it alive.
  - UI band open: fill sold-inner/bought-inner (USD) + band-notional (BTC), dir pill #band-dir-sell to 'long' (sold-CALL K>oracle / bought-PUT K<oracle),
    click #btn-execute. Store.closeBand(id) returns {raw_net, settled_cash_leg, ...}. page.on('dialog') MANDATORY (over-carve alerts).
  - Engine.executeLeg(state,'sell'|'buy','call'|'put',θ_inner,θ_outer(NaN ok),N,oracle,m) → {newState,dy,K_usd,K_tx,theta_tx,...} or {rejected,reason}.

## ★★★★★ Prior — R-218 INVERSE-LENS TX-STRIKE candidate `5fea0e8d` (SUPERSEDED by constmult) = 4/5+OBSERVED PASS ×2
Build `temporal_mvp_v28_lens_invtx.html` md5 `5fea0e8d82ea85270e97ede71cf8e9ae`. tx-strike map u_tx=sign(a)√(a²+2|a|τ) (the √ inverse-lens).
Was the promoted HEAD per run_all integrity header. SUPERSEDED by constmult: the √ map's τ-direction INVERTED entry-218 (sharper⇒closer);
constmult's m-power map fixes it (sharper⇒further). evidence `evidence/v28_invtx/`. lens_selfcheck was 39/39 (now the constmult selfcheck is 13/0).

## ★★★★★ Prior — A14 AT-STRIKE §8 live, HEAD `de28c937` = 5/5 PASS ×2, 34/34 ORACLE
AMM swap AT-STRIKE: executeLeg dy=(wingSign·legSign)·N·K_usd, K_usd=θ·oracle. DEPTH_FRAC=0.90. Harness pw_v28_a14_smoke.mjs;
evidence evidence/v28_a14/. Buy-leg N_buy=V_sell/denom unchanged. -A14b: UNDERLYING swap-warp kurtosis-FREE; SEEN chart-2 reshape kurtosis-DEPENDENT.
(Full detail in git history of this MEMORY if needed.)

## ★★★★ Prior — CONTWARP `4378bc11` (continuous trade-preview sweep) = 4/4 PASS, promoted
drawPricing = rAF wrapper, ~0.8s sweep pre→post on chart-2, each frame live-lensed at its own sliding 45°-tangent point.
The CONSTMULT build RETAINS this rAF wrapper (item 5 sweep still animates). Skeptic VERDICT_CONTINUOUS_SKEW: dip = mechanic, do-not-fix.

## ★ STANDING DUTY — OPERATOR-VOICE layer of DIFF_LEDGER (operator-directed 2026-06-10)
Every ledger entry: scan `history/operator/` FIRST (verbatim per §2.2; 3 files; kurtosis-curve-family-brief.md now at 231 entries),
then legacy transcript_journal.txt + session_tree_note.md. Distill objections VERBATIM + source ref; RESOLVED only with evidence;
skeptic audits me against raw transcripts. Labels: [verbatim-transcript] / [manager-recorded paraphrase] / [summary-stub].
- HONESTY GAP (standing): GH-era sessions have NO raw transcript (operator voice secondhand). Standing ask: export into history/.
- 2026-06-13 entry-numbering corrigendum (manager): two "Entry 214"/"215" (UTC timestamps disambiguate); transcribed verbatim+chronological.

## ⚠ METHODOLOGY GOTCHA (permanent)
In `page.evaluate`, **`Engine` and `Store` are reachable; `Viz` and `render` are NOT** (silent no-op) — drive visuals through REAL UI
handlers (input events on #m-input/#sold-inner/etc., #btn-execute, chart-select change, tab clicks). Canvas pixel-COUNT saturates on a
thin curve micro-shift — use distinct-HASH for "redraw happened" and ANALYTIC Engine.gLoc/markLensed for per-strike truth.
TWO canvases: canvas-curve (chart-1 pool) / canvas-pricing (chart-2 option/value) — read by ID, document.querySelector('canvas') grabs the wrong one.

## File-safety canon
Blob line md5s `ab663f5c…` (webp L74) / `c505b08a…` (svg L1060 on the v28 lens line); 3 `<script>` parse. Key off line-md5, not line number.
Latest CANDIDATE constmult `8f897edcad49c73853096a05e7ec233d` (svg L1060). Prior: invtx `5fea0e8d…`, A14 `de28c937…`, contwarp `4378bc11…`,
lens HEAD `7e1ae39b…`, FINAL `989752294…`; v27 `928cde1c…`; v26c `6cc73563…`.

## Environment quick-ref
`cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/<harness>.mjs [A|B]` — playwright global at /opt/node22, symlinked into
engine/node_modules; chromium at /opt/pw-browsers/chromium-1194. Harnesses must live under engine/. file:// load works.
run_all: `bash verify/run_all.sh builds/<file>.html` (lens line auto-routes to lens_selfcheck + a16_atm_gate).

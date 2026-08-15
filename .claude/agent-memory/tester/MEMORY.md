# MEMORY — tester
_Last updated: 2026-08-15, after the SECOND-EVER tester pass on an `app/` build — `app/index.html` **build 33**, md5 `1ea1fd93f1748e2696d608df116f77e8` (byte-identical to the deployed railway URL, curl-verified). **VERDICT = FLAG** (9 major, 11 minor). Report `engine/builds/APP_TESTER_build33_2026-08-15.md`; evidence `evidence/app_build33/`. Engine-side state (HEAD `5ce1a76c`) untouched by this pass._

## ★★★★★ MOST RECENT — APP build 33 LIVE PASS = **FLAG** (builds 17→33 had shipped on the manager's own verification, no tester)
Scope `app/index.html` only (MM brainstorm console) — NOT the HEAD engine; file-safety gate N/A; READ-ONLY (md5 unchanged pre/post). Harness `evidence/app_build33/pw_app_build33.cjs` (10 phases, A|B) + focused pixel probe `pw_pixels_build33.cjs` + **independent** node oracle `oracle_build33.cjs` (reuses only `mk`/state constants; aggregation, impact, fills, marks re-written from spec). **RESULT_runA == RESULT_runB byte-identical (47,512 ch)**, PIXELS A==B identical, 0 pageerrors/dialogs (the 1 console error is the Google-Fonts fetch, no network in sandbox).
- ★ **9 MAJOR:** (1) **SELL-side impact sign inverted** — `landedFrom` always ADDS ½·slope·Q, so a seller receives MORE with size (+6480 bps at 50 BTC, k=+30%); pixel-confirmed: the orange "at your size" line is drawn ABOVE the bid while its own caption says "1,653 bps WORSE… you receive less". (2) Order card "you pay" = size×top-of-book, fill table = impacted px — **+49% apart at 150 BTC**. (3) **ORACLE-mode S̄ slider echoes your input on screen (slider+box+"solved S̄") while the canvas hash does NOT change** and it reverts next render — dead control that says it worked. (4) `render()` writes `#params`/`#orcbox` BEFORE `calc()` ⇒ the whole left Earn card is **one render stale** while the right cards are current. (5) natural map has **no solution above ~185% oracle vol** (ATM sup 0.5586 vs premiumTarget(2.0)=0.5963) — `calibSbar` silently returns its bisection ceiling **60** while the S̄ slider pins at 1.0. (6) **two fill models**: Earn RFQ cheapest-first (YOU fill NOTHING in 9/9 states) vs Transact pro-rata (YOU 47.5%), while the Yield card claims $4.0M/yr. (7) "Improvement vs single maker" prints |Δ| — envelope is 178.88/271.81/489.05 bps WORSE at 0.1/3/10 BTC, shown green as an improvement (build-13 C3 recurrence, code comment claims C3 fixed). (8) **mark→close gap −$1,009 = a PROFIT, not the spread** — marks/closes read an others-only envelope that is CROSSED 222–411 bps (minAsk 0.133266 < maxBid 0.138107); third book model in one app. (9) **real mouse drag on any slider moves ONE step then freezes** (γ 1.85→1.95→1.95→1.95→1.95) because render() rebuilds `#params` innerHTML mid-drag — invisible to every `.value=`-setting script.
- **11 MINOR:** fee slider inert on Earn in its DEFAULT state (build-13 C5 unresolved); slider-vs-box disagree on FRESH load (`a` 1.25 vs 1.2705, `γ` 1.85 vs 1.8413 — step-grid snap) and Reset doesn't fix it; hard-coded readouts ("filled by YOU", "matched to your own quote", "leaning the other way: none" (`crossed:()=>false`), "residual exposure 0.000000", Pool Lev 10.0×, LP Lev ≡20×); divergence dial never separates the sides (spread 32.781 bps at D=0…1) vs its caption; short put renders unsigned "2.00" + Δ from the CALL curve in k, feeding the hedge readback (build-13 C7 unresolved); cloud caption understates drawn depth 2.1× (says 0.08, draws 0.1789=ATM); displayed fills sum to 25.01/1.01 (2dp rounding); S̄ box prints 0.6000411255259848; 5 buttons with NO handler (no order ever executes); SELL cloud clipped by the axis floor for k≳+9%; no Trade-Bands nav link + unreachable from Portfolio.
- **PASSES:** id integrity re-measured in the REAL DOM (67 read, 0 missing — the three dead ids are gone); 4 views render, exactly one grid visible each; cv/cvT/cvB 76,432/95,163/15,242 non-blank; strike box↔slider BOTH ways + `#tkf` fill tracks (C2 fixed); all 6 Earn params + 3 Bands controls both ends + exact restore; margin/vol-toggle/3 market sliders; hover parity C−P=−k to 5dp, `r-par` 0.000000000000; **impact == sheet** (DOM fill px == my independent aggregation to 5dp at 14 (k,Q) points; residual 0.0079% = harmonic-vs-arithmetic ATM); **0/201 strikes crossed at D=0…1**, spread const 32.781 bps; Transact fills pro-rata by capital, exact sums; self-exclusion BINDS at S̄ extremes (0.05 min-ask / 1.00 max-bid) and mark moves only +0.078% across the whole S̄ range; **no maker-name leak in 11 view/state combos** (text nodes + title attrs + no fillText of names).
- ★ **THE MANAGER'S SCRIPTS ARE NOT PROOF (2 measured wrong, said so):** `selfmark_independence_check.js` sets `P.Sbar` then calls `calc()`, which OVERWRITES it in ORACLE mode ⇒ all 4 sweep points are the same state, hence its bogus "0.0%"; the honest MANUAL-mode number is +0.078%. `sheet_exact_match_check.js` forces all makers onto ONE identical curve with zero spread — the degenerate case where parallel depth is trivially one pool; it cannot see the heterogeneous gap or the sell-side sign.
- ★ HARNESS GOTCHAS (new, permanent): (1) `page.click('[data-t="bands"]')` resolves to the FIRST match in DOM order = the HIDDEN `#gridEarn` copy — Bands never opened and I nearly reported hidden-grid numbers; use `locator(sel+':visible').first()`. (2) canvas cloud probes must key on the ACTIVE side's colour — my teal detector found nothing because an earlier phase had left the RED sell cloud up, and its one "hit" was the `#0f3339` k=0 axis line. Always screenshot-verify a null pixel result. (3) exclude the caption band (first ~46 px) AND the axis columns before calling a column empty. (4) write the RESULT json after EVERY phase — my first full run died in phase 7 and lost 5 minutes of measurements. (5) a control's "per-click" test must ALSO be run as a real mouse drag; `.value=`+dispatch cannot see a re-render that steals the drag.
- Did NOT git (manager commits). Report + evidence paths above. No DIFF_LEDGER entry (that ledger is the ENGINE build inventory; the `app/`-gets-its-own-ledger question is still open with the manager from the build-13 pass).

## ★★★★ Prior — APP build 13 "landing map" LIVE PASS = **FLAG** (closes the skeptic FLAG-PROCESS: no tester had ever passed an app/ build 9–13)
Scope was `app/index.html` (brainstorm MM console) — NOT the HEAD engine; file-safety gate does not apply; I was READ-ONLY on the source (md5 unchanged pre/post every run). Pinned artifact `evidence/app_build13/index_build13_pinned.html` = `git show e14287b:app/index.html` md5 `55b6a35a…`. Harness `evidence/app_build13/pw_app_build13.mjs` (A|B|H) + Node oracle `oracle.mjs` (page's own script in a `vm` + a DOM shim) + `indep.mjs` (an INDEPENDENT spec-written `landed(k,Q)`, not a copy of the page fns). 0 pageerrors/dialogs; **RESULT_runA == RESULT_runB byte-identical** (43,947 b) + band PNGs md5-identical.
- ★ **FLAG-PROCESS-1 — the file changed UNDER the pass.** build 14 (`44ccd53`+`a6676b5`) landed while run B was in flight; run B loaded a MID-WRITE state (body +398 ch = the new footer, but `cvT` hashes still build-13 ⇒ the `drawAgg` edit had not landed yet). I DISCARDED that pair and re-ran A+B on the pinned copy. Run **H** on HEAD build 14 ⇒ **every finding survives unchanged** (13→14 = 28 lines: label, badge, footer note, `ladderAt(...,side)`, `landedCurve` + orange overlay; `drawHeat` untouched). Ask the manager for §6.2-style single-writer on `app/` during a pass.
- **LM1 (major) Earn landing map has ZERO strike dependence.** `draw()` L419 hands EVERY maker YOUR curve (`{c: st.c, ...}`) ⇒ `landed/best` cancels `C(k)`. Node: 4.4e-12 bps across all 120 columns; independent re-derivation on the PAINTED pixels = 1.911532 bps at k=−0.546 / +0.071 / +0.688 (identical to 6 dp); pixels = 5–10 near-identical colours per row. Renders as flat horizontal stripes while its own title says "at that strike". Transact is fine (4,926 colours, real surface) because it passes `makerCurves()`.
- **LM2 (major) self-normalising colour scale.** `sc = mx>1e-9 ? mx : 1` ⇒ full ramp always. Two slider drags the UI TELLS you to make (rv 0.10 + turnover 3.0) ⇒ true field max **0.005336 bps**, and the deep-red census is BYTE-IDENTICAL to the 1.918 bps default (n=2448, x 1–906, rows 18–20); legend reads "0.00 bp / 0.01 bp". A ~0 field painted as a hot one — the exact thing the brief asked me to rule out.
- **LM3** edge-outlier max crushes the middle: at k=−40 %, Q=150 the cell is near-black "at best" while the SAME panel's caption says "21.6 bps off best". **LM4** size axis 0–224 BTC vs 3–5 BTC defaults ⇒ marker in the bottom 2.2 %, disc clipped by the field floor; per-click = 0.1 BTC (box `min=.1 step=.5` ⇒ 3→3.1) = 0.067 px ⇒ **0 px moved** over 2 clicks on `#tsz`, 1 px on `#qsz`.
- **LANDING-MAP PASSES:** fully painted 136,200/136,200 px, not clipped; legend max swatch `rgb(255,103,103)` == hottest field colour and the pixels carrying it re-derive 206.9–210.8 bps vs legend "210 bp" (true mx 209.660; Earn "1.9 bp" vs 1.917809); marker tracks strike AND size (pixel-decoded ≤1 px); **caption == independent Node**: 160.0 vs 160.0377818 / 21.6 vs 21.5503827 / 67.0 vs 66.9809997 / "does not fit" vs null; no-fit band = rows 1–16 = Q∈[200.1,224] with total capacity EXACTLY 200.000000 (marker at Q=201 lands on the boundary); axis labels disjoint.
- **CONTROL FINDINGS:** C1 (major) `depth (BTC per 1% strike)` slider is **read by nothing** — 1→80 = byte-identical rail AND canvas. C2 `#tkf` strike-slider fill frozen at its hard-coded 60 % at every position (while `#arbf` DOES track). C3 "envelope vs best single" = **identically 0.00 bps by construction** (`bestSingle` = the min-ask row = the envelope ask) in all 9 states incl. D=1 where quotes differ 0.16035 vs 0.20084 — the card's caption claims the opposite. C4 default divergence 0.15 ⇒ crossed book ⇒ "book spread −356.7 bps" on screen. C5 `fee` inert while VOL-INDEXED on (default); fee=0 + off ⇒ break-even turnover `∞× /day`. C6 `λ` moves the rail but no longer changes a pixel. C7 portfolio short put renders unsigned "2.00" with value −$16,506, Δ taken from the CALL leg and in k not S.
- **PASSES:** 4 views render + screenshot each; 7 curve params both ends + exact restore; margin/reset/magnifier/size/vol-toggle/3 market sliders; hover parity max |C−P+k| = **5.55e-17** over 7 points and `r-par` = 0.000000000000 everywhere; BUY/SELL; strike box↔slider sync BOTH ways; **maker-divergence dial: clean→ARB OPEN between D=0.01 and 0.05, arb $ monotone 83→2308, per-click (ArrowRight) $318→$341→$365 with a canvas delta every click**; Trade Bands 3 controls both ways + exact restore; Portfolio responds via shared params; spot checks finite and directionally right.
- ★ HARNESS GOTCHAS (new, permanent): (1) the page's `const`/`let` (P, MKT, ARBD, HK, S) are **lexical script globals** — NOT on the vm context object; reach them with a second `vm.runInContext('P')`, same class as the `Engine`-is-not-on-window gotcha. (2) NEVER locate a canvas marker by "row/column with the most whitish pixels" — a 1 px dashed line at an integer y splits across two rows at half alpha and loses the threshold, and the marker's own white CAPTION TEXT (drawn at `my−8`) wins the row vote. Use a **7×7 filled pure-white window score** (a filled 3.4 r disc scores ~26–28, glyph strokes ≤20). (3) that detector needs `j≥3`, so it misses the disc when it clamps to the top row (no-fit sizes) — confirm those by crop, not by detector. (4) canvas legend/caption TEXT is unreadable by DOM — crop the region via a temp canvas + `toDataURL` and READ THE PNG; that is how the "0.00 bp / 0.01 bp" legend and every "lands you N bps" caption were confirmed. (5) `input[type=number]` steps on the **min-anchored grid**: `min=.1 step=.5` turns 3 → 3.1, not 3.5 — a "per-click" test must read the value back, not assume the step.
- Did NOT git (manager commits). Report `engine/builds/APP_TESTER_build13_2026-08-14.md`. Evidence `evidence/app_build13/` (RESULT_run{A,B,H}.json, shots_{A,B}/, oracle+probe+harness scripts). No DIFF_LEDGER entry: the ledger is the ENGINE build inventory and this is the `app/` brainstorm console — flagged to the manager as a question (does app/ get its own ledger?).


## ★★★★★ MOST RECENT — VOCAB-SCRUB relabel acceptance, HEAD `5ce1a76c` = 9/9 PASS ×2 + smoke 17/17 ×2 (operator entries 474/476)
TEXT-ONLY relabel of `abd35f4b`: operator entry 474 [verbatim] RULED "lean is a term i dont endorse.. curve skews, and theres a ray deviation from anchor curve as per each same slope point…; i want a gate for this kind of stuff"; entry 476 "1 fix; 2 same purpose as with perps". I ran the live browser READ-ONLY (engine md5 UNCHANGED pre/post; only Wrote harness + evidence + ledger).
- **THE KEY CLAIM (byte-behaviorally identical) — PROVEN by construction:** `git diff HEAD -- …HEAD_temporal_mvp_v28_lens.html` = 76-line delta = exactly 3 visible strings + 7 engine `//` comments. The ONLY two lines carrying executable code (`const w_new = aT / (xT + dx)` and `Math.abs(c * Math.log(strike_theta / mode))`) are BYTE-UNCHANGED — only their trailing comments moved ⇒ engine+state executable code byte-identical to `abd35f4b`, zero code-token delta, no number can have moved.
- **VISIBLE RELABEL RENDERS (live DOM, portfolio→bands):** Funding column `<th>` text EXACTLY "Funding (ray dev; TBD)" (NOT "lean", NOT "skew dev"); `<th>` title prefix "Funding (same-slope ray deviation from the anchor curve; formula TBD, update-2). PLACEHOLDER…"; visible `.pf-units-note` contains "SKEW DEVIATION", no "LEAN". **No visible funding-"lean" anywhere** — live TreeWalker over visible text nodes + scan of all `title` attrs = 0 funding-"lean" hits (only remaining "Lean" = the Lean PROVER "Lean identities I–V", legitimately different, excluded). ×2 byte-identical.
- **Behavior re-confirmed live:** tradeUpdateAt((10,10,5,5),+1,4) w=11/21=0.5238095238 exact + x=215/22; m-knob steepens (g_loc 1→6 as m 1→6, mode mark falls m1>m6); both charts render (canvas-curve 10058 / canvas-pricing 11434 nonBlank); 0 console/pageerror/dialog.
- **Standing UI smoke 17/17 ×2** (`pw_update1_standing_smoke.mjs` on md5 5ce1a76c — build md5-comment auto-picks the file). S6b m-knob 3 distinct chart-2 hashes; S9 OTM close both-on-AMM; S11-v2 ITM leg still reverses. 0 errors.
- **Gates tester-re-run (run_all exit 0):** lens_selfcheck **41/41** + a16 **5/5** HARD; **vocab_gate PASS** (engine-visible clean on HEAD + handover copy; advisory-internal 108-hit note is non-gating docs); monolith 8/8 report-only. Integrity pin ALREADY keyed to `5ce1a76c` (manager pre-pinned). Blobs canonical webp L74 `ab663f5c…` / svg L1060 `c505b08a…`; md5 unchanged pre/post.
- **OPERATOR-VOICE:** entry 474 (:3479) RULING → RULED/RESOLVED(evidence) (engine-visible lean gone + gate wired HARD+PASS). entry 476 (:3491): item 1 "fix" DELIVERED; item 2 "same purpose as with perps" = RULING on the standing funding-purpose economic question (tether/imbalance-correction, confirms shipped direction); "anything unanswered/pending?" → the actual funding FORMULA (UPDATE-2) + F1 oracle-independence-as-final stay OPEN (NOT presented resolved).
- Ledger: `### 5ce1a76c` entry appended (feature map #9 vocabulary + #15 file-safety/vocab-gate + "none beyond"; UNDESIRABLE none; OPERATOR-VOICE 474 RULED / 476 delivered+ruled); table header re-keyed to HEAD `5ce1a76c`; row #9 + #15 updated; -FUNDING-SAMESLOPE open item label-ref updated ("Funding (lean; TBD)"→"Funding (ray dev; TBD)" in 5ce1a76c).
- Harness `engine/verify/pw_vocab_relabel_acceptance.mjs` (A|B); evidence `evidence/vocab_relabel/` (RESULT_run{A,B}.json overall=true A==B, {A,B}_bands_funding.png). Did NOT git (manager promotes). OPEN handed to manager: actual funding FORMULA (UPDATE-2) + F1 oracle-independence (operator-tier); -B295 items 3/4; -B289 part-2 app list; UPDATE-2 exploit-patch/no-free-money floor parked.


## ★★★★★ MOST RECENT — FUNDING SAME-SLOPE DEVIATION (PLACEHOLDER) acceptance, HEAD `abd35f4b` = 13/13 PASS ×2 + smoke 17/17 ×2 (operator entries 458/459/460/462)
Funding-ONLY change of `bb2f8230` (closeBand byte-untouched): `fundingPerStrike` WEIGHT replaced — OLD update-1 extrinsic-hump / `ext·(S−1)/S` (funded a symmetric w=½ pool = the recurring ~20–30× regression) → the REAL same-slope pool-vs-anchor RAY-ANGLE-RATIO deviation `dev=|c·ln(θ/mode)|`, `c=(g_a−g)/(g_a+1)`, g=gLoc=m·γ (pool, γ LIVE), g_a=m (anchor w=½). INTENDED PLACEHOLDER — the actual funding FORMULA (HL capped premium→rate) is DEFERRED to UPDATE-2 (entry 462). I ran the LIVE browser layer READ-ONLY (build md5 UNCHANGED pre/post; only Wrote harness + evidence + ledger).
- **A1 load/exports:** 0 pageerrors, all 3 scripts run, chart-1 renders (curveNonBlank 10056), `Engine.fundingPerStrike`/`closeBand`/`getSNorm` all functions. ★ GOTCHA: `Engine` is a lexical SCRIPT global, NOT a window property — `window.Engine` is undefined; probe the bare `typeof Engine.fn` (my first A1 probe short-circuited on `window.Engine &&` and false-FAILed; fixed the READER, A3 already called Engine.fundingPerStrike directly and it returned).
- **A2 placeholder LABEL renders live (R6 gate condition):** bands-table Funding column header reads EXACTLY "Funding (lean; TBD)" (NOT "Funding P/L"); `<th>` title (hover) VERBATIM = "Funding (same-slope lean; formula TBD, update-2). PLACEHOLDER: the same-slope pool-vs-anchor deviation carrying the ±g sign/scale — NOT the final funding number. Signed: + = line received, − = line paid. Line P/L shown includes this placeholder accrual; cash at close settles ex-funding until the transfer layer ships."; visible `.pf-units-note` (offsetParent non-null on the portfolio bands subtab) carries "Funding column is a PLACEHOLDER — the same-slope pool-vs-anchor LEAN (deviation) carrying the ±g sign/scale, NOT the final funding number; the funding formula is TBD (update-2). …".
- **A3 live funding profile (vm-in-page, SHIPPED Engine.fundingPerStrike; strikes = multiples of the pool's ACTUAL mode getSNorm, not 1.0):** LEANED w=0.30 (mode getSNorm=2.3333, γ=0.4286, g_loc=2.5714, m=6): OTM lobe — call(θ>mode) +g 0.0615(ρ1.05)→0.281→0.873→1.746(ρ4); put(θ<mode) −g −0.0646(ρ0.95)→−0.281→−0.873→−1.746(ρ0.25); EXACTLY 0 at ATM (call/put@ρ1=0); EXACTLY 0 ITM both wings; monotone fade to the ATM edge; call+/put− opposite sign, reciprocal-ρ mirror exact (call@ρ2=+0.873==−put@ρ0.5). SYMMETRIC w=½ (mode=1, c=0): funding 0 at EVERY strike both wings at m=6 AND m=3 — the pool-lean signature / anti-regression KILLER FS.2b.
- **A4 perps untouched:** perps thead has NO Funding column (#/Side/Notional/Margin/Entry mark/P&L/Equity/Eff.leverage/Club); `#perps-tbody` innerText byte-unchanged across 3 ticks.
- **Gates tester-re-run (×2): run_all exit 0, lens_selfcheck 35/35 + a16 5/5 HARD, monolith 8/8 report-only.** FE.2 (hump-at-ATM) + FE.3 (ext·(S−1)/S source) RETIRED → FS.1–FS.6, negative-controlled (KILLER FS.2b = 0 on symmetric pool OTM; old ext FAILs, moneyness proxy FAILs FS.2b). Blobs canonical L74/L1060; integrity pin keyed `abd35f4b`; md5 unchanged pre/post; byte-stable ×2 (RESULT + PROFILE run A==B modulo run label).
- **INTENDED DELTAS (not regressions):** (1) deviation-only PLACEHOLDER + the "Funding (lean; TBD)" label — actual formula rides UPDATE-2; (2) shape change vs the update-1 ATM hump → OTM lobe (the entry-458 target; the update-1 hump was a funding build bug).
- **OPERATOR-VOICE:** entry 458 target ("only OTM, 0 ATM, 0 ITM, fading to the ATM edge? YES") → RESOLVED(evidence); entry 459 same-slope method → RESOLVED(evidence, tester scope — verified the signature live; geometry derivation is manager-audit + FS.5 source-lock); entry 460 RULING ("regression happpened around 20-30 times") → RESOLVED(evidence, FS.2b killer); entry 462 ("dont plug in a formula yet, just get deviation right… tbd… in hext update with the exploit patch") → RULED/DELIVERED (deviation-only + label). STILL OPEN (rides UPDATE-2): actual funding FORMULA un-built + F1 oracle-independence-as-final = operator-tier.
- Ledger: `### abd35f4b` entry appended; row #9 col4 re-key + col5 ▶ note; row #15 file-safety-green ▶ note; header HEAD re-key to `abd35f4b`; OPERATOR OPEN QUESTIONS +`-FUNDING-SAMESLOPE` (458/459/460 RESOLVED, 462 RULED, formula+F1 OPEN); reconciliation +FUNDING-FORMULA-UN-BUILT/F1 row (OPEN, parked UPDATE-2).
- Harness `engine/verify/pw_funding_sameslope_acceptance.mjs` (A|B); evidence `evidence/funding_sameslope_acceptance/` (RESULT/PROFILE run{A,B}.json A==B, RUN_LOG_{A,B}.txt, FUNDING_bands_label_run{A,B}.png). Did NOT git (manager promotes). OPEN handed to manager: actual funding FORMULA (UPDATE-2) + F1 oracle-independence-as-final (operator-tier); -B295 items 3/4; -B289 part-2 app list; UPDATE-2 charge-back/no-free-money floor + LP/multi-wallet attacks parked.

## ★★★★★ MOST RECENT — UPDATE-1 UNIFIED CLOSE + FUNDING-EXTRINSIC acceptance, candidate HEAD `bb2f8230` = 10/10 PASS ×2 + smoke 17/17 ×2 (biggest close-path change in the project)
The entry-405 close-(b) BUILT + operator entries 450/451/452/455 (skeptic HALT-LIFTED). Twin `temporal_mvp_v28_lens_twocaseclose.html` = `51342574` (OLD two-case). Manager pre-verified gates 31/5, credit-wrapper byte-identical to twin, funding hump peak@ATM zero-past-S*, payout locked from legPrice(s0). I ran the LIVE browser layer (READ-ONLY on engine; build md5 UNCHANGED pre/post).
- **A1 load/exports:** 0 pageerrors, Engine.tradeUpdateAt + closeBand + fundingPerStrike all functions, all 4 chart states render (curve/pricing/ratio/payoff nonBlank 10056/12510/7720/111596).
- **A2 OTM unified close [#7]:** long band sold-call $120k/bought-put $48k N=0.05 (both OTM by engine regime) → close: `settled_cash_leg=null`, `live_leg='both'`, log VERBATIM "[both legs reversed on AMM]" (no "settled-to-cash"), raw_net +3.44e-4 finite. settled_cash_leg is now ALWAYS null.
- **A3 genuinely-ITM leg still on AMM [#7]:** short sold-put $60k/bought-call $100k → oracle 12000+arb ⇒ engine's OWN regime sNorm0=poolMark/oracle=1.0000, sold-put live θ=5.000 ⇒ **soldITM=true** → close STILL settled=null/live='both' "[both legs reversed on AMM]", raw_net −1.55e-2 finite. (★ regime reference = poolMark/oracle vs leg live θ=K/oracle — NOT getSNorm, NOT stored leg.inner.)
- **A4 x-drain BY DESIGN (intended, NOT regression) [#7/#11]:** open→close Δx=−3.67e-4 = **−$29.38** (0.0037% of pool.x=10), Δy=0.0 EXACT. Pool-internal reprice credited to NO wallet (credit wrapper byte-identical to twin ⇒ non-extractable). Bounded, one-signed at fixed oracle. ACCEPTED-by-design (operator 452/455); no-free-money floor returns UPDATE-2 (parked).
- **A5 payout continuity OTM→ITM (seam kill) [#7]:** bought-put K=$48k driven across ITM (oracle 56000→40000, cross ~48000 via setOracle+arb). HEAD raw_net CONTINUOUS monotone 0.001288→0.002529, crossStep 3.83e-5 = **0.48× median** (no jump), settled=null EVERY sample. **A5b live A/B negative control:** the twin `51342574` settles a leg to CASH (settled_cash_leg='bought') on exactly the ITM samples (oracle≤48000) where HEAD is null — two-case branch PRESENT in twin, ABSENT in HEAD. (Twin's raw stays near HEAD's for this band — C0 linear-parity seam; the gross ~4e-2 jump is CM12.2's deeper config, HARD-gated.)
- **A6 funding = extrinsic hump, zero ITM [#9]:** weight → markLensed − max(intrinsic,0). Steepened pool S=0.14/w=0.27, m=6/g=2.25 (seams callSeam 0.692/putSeam 1.444): call peak −3.70e-2 @ATM, =0 at f=0.30/0.55 (past seam); put peak +3.70e-2 @ATM, =0 at f=1.80/3.00; opposite sign. ±g·(S−1)/S sign + κ,N,dt + through-lens ±g_loc UNCHANGED. INTENDED sign/shape change vs old build. A6b: bands funding column renders; perps table has NO Funding col (thead verified) & #perps-tbody unchanged across 5 ticks.
- **Standing UI smoke 17/17 ×2** (`pw_update1_standing_smoke.mjs`, fork of pw_funding_standing_smoke with documented **S11-v2**: old "sold-put settled-to-cash" → new "genuinely-ITM leg (engine regime) STILL reverses on AMM, settled=null/live='both'"). S9 OTM close both-on-AMM. 0 errors.
- Gates tester-re-run: run_all exit 0, lens_selfcheck **31/31** + a16 **5/5** HARD, monolith 8/8 report-only, integrity pin keyed `bb2f8230`, blobs canonical L74/L1060. CM6-v2 (frozen-arc RT + no-free-money) RETIRED → CM6-v3 (drain-documented) + CM12 (payout-continuity) + FE (funding-extrinsic), all negative-controlled (old two-case build 24 PASS/7 FAIL).
- ★ HARNESS GOTCHAS (new, permanent): (1) the pool is unit-lopsided (x=10 BTC, y=800k USD) — a raw `Engine.tradeUpdateAt(pool,dy,1)` swap of single dy-units barely moves price (need dy~200k to move w). To sweep a leg across ITM, use the A3 pattern: setOracle re-rays θ=K/oracle while arb pins sNorm0≈1 (put ITM ⟺ oracle ≤ K). Pure setOracle WITHOUT arb does NOT cross moneyness (rebase preserves it). (2) the close-time regime = `Engine.poolMark(pool,oracle,oracle_initial)/oracle` vs the leg's LIVE θ=K_inner/oracle — getSNorm and stored leg.inner are the WRONG references. (3) close log lives in `Store.state.eventLog.find(e=>e.kind==='close').msg`; band result at `band.close`. (4) perps table has no id — `#perps-tbody`.closest('table') for the thead check. (5) A6 funding needs S≠1 (else (S−1)/S=0 ⇒ all-zero positive-control artifact) AND m large enough that the ladder ends sit PAST S* (g small ⇒ seam far out ⇒ 0.3×/3× not actually ITM).
- Did NOT git (manager promotes). OPEN handed to manager: UPDATE-2 charge-back/no-free-money floor + LP/multi-wallet attacks PARKED (entries 451/452); -B295 items 3/4; -B289 part-2 app list. Harnesses `engine/verify/pw_update1_close_acceptance.mjs` + `pw_update1_standing_smoke.mjs`; evidence `evidence/update1_close_acceptance/`.

## ★★★★★ Prior — -FPNL-NEGZERO recheck, promoted HEAD `51342574` = 12/12 PASS ×2 (closes the 4bc939ec cosmetic)
2-expression display fix: `bandFundingStored === 0 ? 0 : -bandFundingStored` (L4653, feeds band L4685 + total L4726
cells) + `c.funding === 0 ? 0 : -c.funding` (component cell L4711), BEFORE fmtNum; fmtNum untouched. I independently
diffed the full file vs committed `4bc939ec` (git show 7699189): delta = EXACTLY the 2 expressions + 3 comment lines
⇒ engine+state byte-identical by construction. Harness `engine/verify/pw_fpnl_negzero_recheck.mjs` (A/B; readBandsDom/
parseUSD/setup VERBATIM from pw_funding_pnl_live.mjs); evidence `evidence/fpnl_negzero_recheck/` (RESULT A==B
byte-identical modulo label; fresh/pretick/posttick PNGs).
- **ON-SCREEN:** all 8 pre-tick funding cells (band+2 comps+total × 2 opposite bands) render EXACTLY `0.000000`, no
  minus (ASCII or U+2212), fresh AND after oracle→88000 pre-tick (was `-0.000000`). Post-tick 24×: payer B1 −0.000469
  (minus RENDERS — guard doesn't eat real negatives), P/L −$4.50→−$45.75 falls; receiver B2 +0.000531, $5.53→$52.25
  rises — byte-equal to the 4bc939ec pass; sign pin cell==−Σstored (6dp); band==Σcomps; 0 errors ×2; md5 unchanged.
- Gates tester-re-run: run_all exit 0, lens 24/24 + a16 5/5 HARD, monolith 8/8 report-only, integrity pin keyed
  `51342574` (manager pre-pinned), blobs canonical L74/L1060.
- Ledger: rolling row -FPNL-NEGZERO → RESOLVED(evidence)-in-`51342574`; new `### 51342574` entry (feature #9 display
  only, none beyond; UNDESIRABLE none); table header + row #9 re-keyed. OPERATOR-VOICE: no operator words on this fix
  (tester-originated); entry-427 context = one of the agreed pre-CTO-handover fixes, now DONE; entries 429–431
  (attacks/parked-close, entry 431 "brainstomrin only first" holds that build) untouched by this slice, still OPEN.
- Did NOT git (manager commits). OPEN handed to manager: -CLOSE405 + attacks TBD (brainstorm-held per 431); -B295
  items 3/4; -B289 part-2 app list.

## ★★★★ Prior — FUNDING P/L COLUMN promoted-HEAD pass, `4bc939ec` = 16/16 PASS ×2 + smoke 17/17 ×2 (entry 425; R6 gate #2)
Display/read-layer slice on ratified `0e0a0062`. I independently node-compared script blocks: engine (47,866 b) +
state (24,041 b) BYTE-IDENTICAL to committed 0e0a0062; full file delta = exactly the 6 spliced regions (header th,
units-note, renderBands funding calc, band/comp/total cells) — supports "none beyond #9". Harness
`engine/verify/pw_funding_pnl_live.mjs` (A/B); evidence `evidence/funding_pnl_column/` (RESULT A==B byte-identical
modulo label; bands pre/post-tick PNGs = the on-screen proof).
- **ON-SCREEN behavior (2 opposite bands: long B1 sold-call$120k/bought-put$48k + short B2 sold-put$60k/bought-call$100k,
  N=0.03 each; oracle→88000 via #kpi-oracle; 24×#btn-tick):** PAYER B1 funding cell **−0.000469** (negative on screen),
  P/L −$4.50→−$45.75 FALLS; RECEIVER B2 **+0.000531**, P/L $5.53→$52.25 RISES. Sign pin: cell==−Σ stored trader-pays (6dp);
  ΔP/L==cell×oracle (−41.25 vs −41.27 / +46.72 vs +46.73, 6dp rounding); band cell==Σ comp cells. Disclosure th title +
  visible pf-units-note + $-cell tooltip all rendered. Perps table untouched by ticks (tbody innerText pre==post, no
  Funding column). Node payer-falls harness (`engine/evidence/check_funding_pnl_2026-07-03.js`) reproduced on the
  promoted md5: payer col −0.08355060 / P/L −573→−7926; receiver +0.14060850 / +1347→+13721.
- **SIGN INVERSION vs pre-425 display = INTENDED (recorded, not regression):** old column printed raw stored
  trader-pays (payer POSITIVE, never in $P/L); new negates + adds fundingP/L×oracle into dollarFigure. That IS the R6 fix.
- **NEW cosmetic -FPNL-NEGZERO (OPEN, non-gating):** zero accrued funding renders `-0.000000` (JS −0 through fmtNum)
  pre-tick on all funding cells. Intern one-liner candidate (v===0?0:v).
- Gates tester-re-run: run_all exit 0, lens_selfcheck 24/24 + a16 5/5 HARD, monolith 8/8 report-only, integrity pin
  keyed `4bc939ec`, blobs canonical. Standing smoke = `pw_funding_standing_smoke.mjs` (evidence-redirected copy of
  pw_tradepoint_standing_smoke, checks byte-inherited) 17/17 ×2, RESULT run1==run2 byte-identical. md5 unchanged pre/post.
- ★ HARNESS GOTCHAS (new, permanent): (1) the portfolio bands table lives on the PORTFOLIO PAGE — click
  `.page-nav-link[data-page="portfolio"]` THEN `.tab[data-subtab-pf="bands"]`, else pf-units-note offsetParent=null
  (page-portfolio display:none; the subtab click alone is not enough). (2) fmtUSD renders Unicode MINUS U+2212 — a
  parseFloat on `−$4.50` gives NaN; normalize \u2212→'-' before parsing DOM dollars. (3) full-pixel nonBlank census
  (i+=4, alpha>0) matches the standing-smoke thresholds; my every-4th-pixel sampling undershoots 4× (trajectory 1575
  vs threshold 2000 false-FAIL). (4) `grep -c pf-units-note` counts the CSS selector too — there is exactly ONE div.
- Ledger: `### 4bc939ec` entry appended (feature map #9 + none beyond; OPERATOR-VOICE entry 425 verbatim "trade poont
  ok, funding is column adds to p/l in portfolio for position line wise…; do needful" RULED+DELIVERED; entry 232
  standing/unaffected); table header re-keyed to HEAD `4bc939ec`; row #9 updated; -TP339-RATIFY → RESOLVED-by-RULING
  (entry 425); -CLOSE405 untouched (OPEN, parked per entry 424); -FPNL-NEGZERO added to reconciliation list.
- Did NOT git (manager commits). OPEN handed to manager: -FPNL-NEGZERO cosmetic; -CLOSE405 build parked; -B295 items
  3/4 (funding transfer layer part-2) still parked; -B289 part-2 app list.

## ★★★★★ MOST RECENT — CAPTION/COMMENT SLICE recheck, build `0e0a0062` = 11/11 PASS ×2 (closes -TP339-CAPTION)
String/comment-only slice on `e148c9b7`. Harness `engine/verify/pw_caption_slice_recheck.mjs` (A/B); evidence
`evidence/caption_slice_recheck/` (RESULT A==B byte-identical modulo label; chart2 PNGs).
- **Captions live-verified rendered:** Invariant Watch = trade-point law ("Trade-point law (entry 339): … LOCAL pair
  (α_T, β_T) … global α, β MOVE on off-ATM trades BY DESIGN … Machine-epsilon drift applies to the ρ=1 paths (spot /
  arb / rebase) and to open→close arc round-trips"); Pool State subtitle EXACT "closed-form · trade-point
  (α_T, β_T)-conserving · Identity IV on ρ=1 paths"; body.innerText has NO "trades preserve" / "α/β-conserving" /
  "% of escrow unit". NOTE: arb caption L1327 "restores |dy/dx| = oracle (preserves α, β; shifts w)" KEPT — a scoped
  ρ=1-path claim about arbitrageToOracle (spot trio byte-identical to v24), TRUE not stale.
- **Chart-2 unit toggle:** btn "fraction of escrow unit" + "$ value"; caption has "Fraction view"; toggle flips ($ hash
  differs) and returns byte-identical (hash 685e5a5c9b61). NOT rescaled: % X crossing x=462 v=0.15 + put-seam boundary
  v=0.3307 == prior anchors.
- **Behavior identical:** tradeUpdateAt exhibit 215/22 / 11 / 11/21 exact (≤1e-15, not naive 22/43); open/close
  round-trip (m=1 long 120k/48k N=0.03) restores (x,y,w,α,β) rel 0.0, openΔw=3.1e-3; 0 pageerrors/dialogs; all 4 chart
  states render; blobs canonical; run_all GREEN lens 24 + a16 5 HARD, monolith 8/8 report-only, pin keyed `0e0a0062`.
- **R6 item-3 comment fixes spot-checked in source:** L1626-27 + L2400-01 now "MORE volatile asset takes a LOWER m"
  (entry-289 direction); closeBand barrier-era paragraph gone.
- ★ HARNESS GOTCHA (measurement-point, not chart): my first C6 run FAILed the put-seam anchor at 0.3375 — I measured
  midY at x=571 (round(xAtPhi(56.31°))) but the prior R3c anchor is nearestMidY at that MINUS 3 (x=568); the steep put
  arm moves ~2px over those 3 columns. Reproduced the prior harness's anchor VERBATIM → 0.3307 exact. When re-checking
  "value unchanged" claims, reuse the prior harness's exact measurement expression, never a re-derivation of it.
- Ledger: rolling -TP339-CAPTION → RESOLVED(evidence)-in-`0e0a0062`; new `### 0e0a0062` one-line entry (feature map
  #15 only, none beyond; VERDICT PASS). -TP339-RATIFY (#16 PROVISIONAL) UNCHANGED — still awaits operator ratification.
- Did NOT git (manager promotes). OPEN handed to manager: -TP339-RATIFY; funding-semantics extension operator-gated;
  -B295 items 3/4; -B289 part-2 app list.

## ★★★★★ MOST RECENT — TRADE-POINT CONSERVATION acceptance, build `e148c9b7` = PASS (14/14 ×2 + smoke 17/17 ×2)
The entry-339 fix: LIVE trade path = paper Trade Formula at T=ray∩curve. NEW `tradeUpdateAt(s,dy,ρ)` (ρ_tx=θ_tx/mode)
+ `revertArc` frozen-arc close; executeLeg routes swap through tradeUpdateAt, stores arc {dxA,dyA,dwA,oOpen}/leg; depth
guard → w·y·ρ^w at the tx-ray; framePool animates PER-LEG through Engine.tradeUpdateAt. Spot trio byte-identical
(I re-verified by function-body compare vs the twin, independent of manager). Gates run_all exit 0: lens 24/24 + a16 5/5
HARD (CM8-v2 exhibit-hard 11/21 + routing negative control; CM6-v2 frozen-arc + live-reversal negative control).
- **Acceptance highlights (`verify/pw_tradepoint_acceptance.mjs` A/B, evidence `evidence/tradepoint_acceptance/`):**
  T2 LIVE-DOM exhibit tradeUpdateAt((10,10,5,5),+1,4) → x′=215/22 / y′=11 / w′=11/21 EXACT (≤1e-15), NOT naive 22/43;
  ρ=1 ≡ tradeUpdate (1.5e-16), ATM α,β steady. T3 5-band open/close sweep (both wings, deep OTM $200k/$20k + $30k/$180k,
  near-ATM, m=1+m=2) restores (x,y,w,α,β) machine-exact (dβ≤1.2e-10); every open re-leans w (±1e-3…3e-3). T4 intervening
  trade: close nets closer's OWN arc increments EXACTLY (x=0, y=9.1e-13, w=5.6e-17); closing both → original pool 0/0/0.
  T5 iv-alpha/iv-beta VISIBLY move (iv-β "0"→"100.2216" on the std $120k/$48k N=0.03 band; back to 1.2e-10 on close);
  chart-1 hash re-anchors. T6 guard: reject at $200,000 tx-ray depth where old y−β held $400,000 (put ρ=0.25, w=½);
  verbatim "…pool cash depth at the tx-ray…"; UI banner + btn disabled + notional un-mutated. T7 preview animation 11/16
  distinct frames; s=1 == tradeUpdateAt chain == __previewPool (rel 0). 0 errors; md5 unchanged; A==B byte-identical.
- ★ **S4 EXPECTATION CORRECTION (with proof, not patched-to-green):** old smoke S4 "arb → w=0.5 exactly" is the OLD
  law's invariant — under trade-point law α,β move ⇒ arb equilibrium w = α/(α+√(αβ/oracle)) ≠ ½. PREDICTED in a node vm
  probe (0.4999639), then diagnostic run of the UNMODIFIED smoke = 16/17 with S4 the sole FAIL (w=0.499962, 3.8e-5).
  New `pw_tradepoint_standing_smoke.mjs` = fork with S4-v2: |mp/oracle−1|≤1e-9 + w moves + re-lean RECORDED. 17/17 ×2.
- ★ NEW FINDINGS: **-TP339-CAPTION** — on-screen L1340 "Identity IV: trades preserve α, β … machine-epsilon only" +
  L1368 card subtitle "α/β-conserving" now CONTRADICT the live readouts (spec §2.7 moved code comments, missed these 2
  UI strings). Operator-caught-class; recommend fix at/before promotion. **-TP339-RATIFY** — 5 spec pinned defaults
  (FLAG-1..5: ρ basis / frozen-arc close / undo-own-increment / T@θ_tx / legacy fallback) adopted under entry-377
  overnight go, NOT individually ratified ⇒ inventory #16 stays PROVISIONAL (skeptic R6 condition).
- ★ HARNESS GOTCHAS (new): grep of the HEAD HTML for `dxA`/`arc:` matches INSIDE the base64 blob line (valid b64 chars)
  — filter with `awk 'length($0)<300'`. Band close per-id: `button[data-close-band="<id>"]` on portfolio bands tab.
  Preview legs live at `window.__previewBand.legs` = frozen [{dy,rho}]; endpoint check = chain Engine.tradeUpdateAt
  from Store.state.pool and compare to `window.__previewPool` (leg2State) — framePool itself is draw-layer-internal.
- Did NOT git (manager promotes). OPEN handed to manager: -TP339-CAPTION two-string fix; -TP339-RATIFY operator
  ratification when awake; funding-semantics extension still operator-gated; -B295 items 3/4 still open.

## ★★★★★ MOST RECENT — -B301-DASH RECHECK, build `7015c22c` = 17/17 PASS ×2 (closes the a6ca02f3 FLAG)
Intern draw-layer-only fix: parity-tail dash SCREEN-SPACE `[8,6]·cssScale` (cssScale=W/clientWidth=1.2968 live) + plotted
value clamped `min(viewVal, 3·yMax)` (quasi-infinite $ put-tail coords defeated dash rasterization). Harness
`engine/verify/pw_b301_dash_recheck.mjs` (A/B; measurement fns verbatim from acceptance harness); evidence
`evidence/display_slice_acceptance/RECHECK_*` (RESULTs byte-identical modulo label; zoom PNGs md5-identical A/B).
- **THE FLAG ITEM:** $ M=2 put parity tail row coverage 0.9647→**0.4941** (<0.9 legible; better than my 0.7–0.8 prediction).
  Visually confirmed at 6× (distinct dashes, clean gaps). All 4 tails legible: % 0.5067/0.5336, $ call 0.5067.
- **Geometry UNCHANGED:** continuations EXACT 4dp match (0.9897/0.9906/0.9897/0.9977); % crossing x462/v0.15,
  boundary 0.3307, saturation 0.9682, $ crossing $12,013, clamp exit x658 (yMin 22 vs 21) — all ±1px vs a6ca02f3.
- **run_all GREEN on 7015c22c** (lens 16/16 + a16 5/5 + monolith 8/8 report-only) AND line-8 pin NOW keyed to
  `7015c22c` (manager re-pinned; stale-pin residue CLOSED). Blobs canonical; engine+state node string-compare identical.
- ★ HARNESS GOTCHA (permanent): the windowed dash-ONSET detector is DASH-PATTERN-dependent — lengthening the first
  dash 5→10.4 canvas-px legitimately shifts detected onset +4px. Never use dash-onset as a geometry anchor across a
  dash-pattern change; use dash-independent anchors (crossing/boundary/saturation/clamp-exit) + analytic clamp-inertness
  (% max viewVal 0.9983 < 3·yMax ⇒ % polyline point-identical). My first R3b run FAILed on a wrong ±1px anchor; I
  corrected the EXPECTATION with proof (not patched toward green) and documented raw deltas.
- ★ cssScale gotcha: canvas is CSS-downscaled (900→~694px); screen-space dashing must scale the pattern INTO canvas px.
- Did NOT git (manager promotes). OPEN handed to manager: engine comments L1622/L2337 old vol phrasing (non-rendered);
  funding-semantics extension awaits its own R2 go; -B295 items 3/4 still open.

## ★★★★ Prior — (b) DISPLAY SLICE + -B289 ACCEPTANCE (operator go entries 298+301), build `a6ca02f3` = FLAG (28/29 ×2 + smoke 17/17; -B301-DASH blocker NOW RESOLVED-in-`7015c22c` above)
Intern draw-layer+caption-only build on HEAD: chart-2 tent RETIRED → TRUE per-unit V per wing OTM+ITM
(same Engine.markLensed read settlement uses), continuation solid / parity tail dashed, C¹ seams
drawn, %/$ toggle (`pricing-unit-pct`/`-usd`, window.__pricingUnit), markers re-anchored to the
active view + wing from b.sold_wing/b.bought_wing; -B289 m-caption vol direction fixed. I verified:
- **PRE-FLIGHT:** `<script id="engine">` BYTE-IDENTICAL to committed 9fdde1de (node string-compare,
  43156 b); blobs canonical ab663f5c@74/c505b08a@1060; 3 scripts parse (longest non-blob 1217);
  run_all GREEN 16+5 HARD + monolith 8/8 (line-8 md5 pin STALE `9fdde1de` — prints only, manager re-pins).
- **PASS highlights (pixel vs analytic, M=2 ⇒ g=2 default pool):** X both views (put 391/253 cols
  left/right of ATM); crossing at ATM v=0.15 (%; analytic (g/(g+1))^g/(g+1)=0.1481) / $12,013 ($;
  11,852); % wings saturate 0.968 deep-ITM; put seam dash-onset φ≈56.5° = 0.667-class NOT 0.444
  (φ66°); boundary height 0.3307 vs 1/3; $ put tail exits clamp top at x=658 (analytic 660 =
  K=2.25S), 0 pixels beyond; toggle flips class+hash and back byte-identical; markers ON curve
  both views dR/dG ≤1.2px; m-channels M=1/3/6: 3 hashes, wings steepen (putV@20° .092→.0068→.0034),
  seams inward 63.4→53.1→49.8°, crossing falls .2523→.1074→.058; caption 6a/6b/6c (legend has NO
  "peak = 1"); OTM close settled=null + deep-ITM close (oracle 12000) settled='sold' payout $95.18;
  all chart states render; 0 errors; md5 unchanged; RESULT A==B byte-identical. STANDING SMOKE
  17/17 re-run on THIS md5 (`pw_display_slice_standing_smoke.mjs` = pkg smoke w/ evidence redirect).
- **THE FLAG (-B301-DASH, check 2e, ×2):** $-view put parity tail (seam→1.25×S clamp, φ56–66°)
  renders effectively SOLID — [5,3] dash set in code but AA swallows ~70% of gaps on the steep
  segment ($40k→$100k over ~90px): TRUE per-pixel row coverage 0.9647 (legible dash <0.9; $ call
  tail 0.51, % tails ~0.54 legible). Pool-quote vs escrow-claim distinction illegible exactly on
  the unbounded ITM put tail in $. Evidence A_zoom_usd_puttail.png (6×). Fix candidate: steeper
  dash period ([8,6]) or screen-space dashing — draw-layer one-liner; then targeted re-check of 2e.
- Harness `engine/verify/pw_display_slice_acceptance.mjs` (A/B); evidence
  `evidence/display_slice_acceptance/` (INDEX.txt, RESULTs ×2, 12 PNGs + zoom, smoke set).
- ★ HARNESS GOTCHAS (new, permanent): (1) exact-RGB column scans get isolated 1–2px AA misses even
  on SOLID strokes — never treat a single empty column as a dash gap; use WINDOWED coverage
  (15-col, <0.85 = dashed) for seam onset. (2) dash legibility on STEEP segments must be measured
  in per-pixel ROWS, and NOT by filling yMin..yMax per column (that erases the gaps you're
  looking for). (3) chart-2 geometry now: yMax=1.05 (%) / 1.25·sNorm·oracle ($); v=(1−(y−18)/308)·yMax;
  toPx x=50+φ/90·832. (4) boot suggestStrikes ghost: clear band-notional+sold-inner+bought-inner
  BEFORE measuring chart-2 (else preview markers pollute the census).
- Did NOT git (manager promotes). OPEN for manager: -B301-DASH (the blocker: intern one-liner + my
  targeted re-check, or operator ACCEPTED(cosmetic)); run_all line-8 re-pin at promotion; engine
  comments L1622/L2337 old vol phrasing (non-rendered, intern residue); funding-semantics extension
  awaiting its own R2 go; -B295 items 3/4 still open.

## ★★★★ Prior — PKG-ITM v2 ACCEPTANCE (operator entries 286/287/298/299), build `9fdde1de` = PASS ×2 byte-stable + SMOKE 17/17
The linear re-seam fix of `markLensed` (intern splice per `specs/SPEC_pkg_itm_v2_engine_coords_2026-07-02.md`; pre-fix `dd6fb955` retained as `temporal_mvp_v28_lens_powerarm.html`). I ran the skeptic-pinned §6 protocol: entry-286 harness lineage, TWO columns (default pool post-arb w=0.5⇒γ=1, sNorm=1; m=2⇒g=2 and m=6⇒g=6), bought-put K=$60k, oracle swept so S/K 1.5→0.2 (26 spots incl. seam straddles ±0.02/±0.005 + all paper cells), MARK read from the DOM bands-table cell (never recomputed).
- **ACCEPT-1 paper cells EXACT at 4dp (|Δ|=0.0 every pinned cell):** g=2: 0.3333@0.6667 / 0.2315@0.80 / 0.1829@0.90 / 0.1481@1.00 / 0.1029@1.20 / 0.0658@1.5 / 0.3023@0.70 / 0.1642@0.95; g=6: 0.1429@0.85715 / 0.2000@0.80(intrinsic) / 0.1066@0.90 / 0.0567@1.00 / 0.0190@1.20 / 0.0771@0.95.
- **ACCEPT-2 sign table CLEAN:** mark−max(1−S/K,0) ≥ 0 at ALL 26 spots × both columns × both runs; belowIntrinsic EMPTY (on `dd6fb955` it was 16 spots from S/K=0.80 down, max −0.248 — GONE); diff==0(4dp) at/below seam, strictly + above.
- **ACCEPT-3 seam:** boundary value 1/(g+1) EXACT on DOM (0.3333/0.1429); empirical seam S/K=0.66667 (g=2) / 0.85715 (g=6), NOT 0.444 — mark@0.444 now 0.5560==intrinsic. C¹ DOM quotients: g=2 qL −1.002/−1.006, qR −0.954(ε.02)/−0.974(ε.005) vs expected −0.957/−0.989; g=6 qL −0.998/−0.990, qR −0.927/−0.990 vs −0.923/−0.980 — all ±0.03, monotone→−1.
- **ACCEPT-4 STANDING UI SMOKE 17/17** (`verify/pw_pkg_itm_v2_smoke.mjs`): perps add-long/short/remove; LONG band exec (w 0.5→0.503231); arb w→0.500000 exact; ADVANCE TIME ×2; kappa; M-clamp 0.1→1/10→6/3→3 + field writeback; chart-2 m-delta (3 distinct hashes); overlays (red 23px/green 22px dots ON teal/pink arms); all 4 chart states render; OTM close (both reversed, raw_net −1.97e-4); SHORT band exec; deep-ITM close at oracle 12000 (sold-put θ=5 → settled_cash_leg='sold', live_leg='bought', payout −$8.09 finite); export/import-chooser/LP dep+wd; RESET; 0 errors/pageerrors/dialogs.
- **ACCEPT-5 byte-stability:** RESULT_runA.json==RESULT_runB.json BYTE-IDENTICAL; build md5 `9fdde1de` UNCHANGED pre/post every run (READ-ONLY).
- Gates: `run_all.sh` GREEN — lens_selfcheck **16/16** (rewritten: CM4-v2 linear seams + CM4-v2-C1 one-sided slopes + CM10 value≥intrinsic 208pt + CM11 wing power-law; CM1–CM9 kept) + a16 **5/5**; monolith 8/8 report-only line-(6) repointed to v2 seams/O1 PasteLin; integrity header already keyed to `9fdde1de`. Blobs canonical ab663f5c/c505b08a, 3 scripts parse, longest 603.
- Harnesses `engine/verify/pw_pkg_itm_v2_acceptance.mjs` (A/B arg) + `pw_pkg_itm_v2_smoke.mjs`; evidence `evidence/pkg_itm_v2_acceptance/` (INDEX.txt, RESULTs ×2, logs, 18 sweep PNGs incl. seam neighborhoods + old-0.444 point + deep-ITM, smoke PNGs incl. deepITM pre/post-close).
- ★ HARNESS GOTCHA (S11-class): closeBand result lives at `b.close = {t,...r}` on the band (settled_cash_leg/live_leg/raw_net/trader_payout); NOT b.settled_cash_leg / b.close_result. First smoke run false-FAILed S11 reading wrong path — fixed the READER, not the expectation (legIsITM at oracle 12000 puts sold-put θ=5 ITM ⇒ 'sold' correct).
- ★ SEAM-STRADDLE quantization: oracle must be integer ⇒ use round(60000·SK); g=6 seam at 6/7 ⇒ oracle 51429 (S/K 0.85715); DOM 4dp bounds quotient noise ~0.02 at ε=0.005 — spec tol ±0.03 covers.
- ★ Entailed reshape (disclose, not a defect): quotes reshape everywhere except ATM (g^g/(g+1)^(g+1) fixed point); funding magnitudes re-scale via consumed mark (formula untouched).
- Did NOT git (manager promotes). OPEN handed to manager: -B289 (UI "LARGER M = MORE VOL" contradicts the operator's REVERSED paper vol-direction, entry 289 — part-2 app list), -B295 (build (b) %→$ toggle/uncapped wings/unification, entries 295/296), spec §9.1 Lean-bridge label updates (research-lead).

## ★★★★ Prior — QC ORACLE SWEEP (operator entry 286), on `dd6fb955` = FLAG — **NOW RESOLVED-in-`9fdde1de` (see above)**
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
Latest PROMOTED HEAD `4bc939ec…` (funding-P/L column, entry 425, on ratified `0e0a0062…` = trade-point conservation + caption slice; engine+state byte-identical to 0e0a0062). Prior `e148c9b7…` (TRADE-POINT conservation, entry 339; revert twin reservepoint = `7015c22c…` display slice; engine spot trio byte-identical, tradeUpdateAt/revertArc NEW). Prior: `9fdde1de…` PKG-ITM v2; slice `a6ca02f3…`; powerarm `dd6fb955…`; constmult `8f897edc…`; invtx `5fea0e8d…`, A14 `de28c937…`, contwarp `4378bc11…`,
lens HEAD `7e1ae39b…`, FINAL `989752294…`; v27 `928cde1c…`; v26c `6cc73563…`.

## Environment quick-ref
`cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/<harness>.mjs [A|B]` — playwright global at /opt/node22, symlinked into
engine/node_modules; chromium at /opt/pw-browsers/chromium-1194. Harnesses must live under engine/. file:// load works.
run_all: `bash verify/run_all.sh builds/<file>.html` (lens line auto-routes to lens_selfcheck + a16_atm_gate).

# MEMORY — tester
_Last updated: 2026-06-11, after the hour-close independent verification run._

## ★ 2026-06-11 — HOUR-CLOSE INDEPENDENT VERIFICATION (operator entry-20 deadline) — BOTH PASS
Ran both suites myself; verbatim outputs + SUMMARY.txt: `evidence/hourclose_2026-06-11/`.
- **Suite 1** `engine/verify/run_all.sh` (from `engine/`, HEAD default): **EXIT 0, PASS** —
  integrity md5s exact (6cc73563 / ab663f5c@74 / c505b08a@1060, all re-derived myself), 7 GH
  gates x4 gamma, curveTrace 401/401, slope identity ==e^ghMu, slippage + splice-level, SEAM,
  DIR, FAITH 1-5 all PASS with every mutant detected. Scratch-name gotcha unchanged (gate
  headers say v26b_itm; content = v26c).
- **Suite 2** `node framework/checks/chk_core.js` (NEW curve-agnostic propagation checks,
  manager commit 1eb552c; file clean in working tree): **EXIT 0, ALL GATED CHECKS PASS.**
  CHK-1b = intentional negative control (weighted-CD must-fail mode-at-mark; PASS = correctly
  inadmissible, eps==0.6667!=1). CHK-1c = live-GH fail-by-factor 44.52 (g=2) / 748.62 (g=3) —
  exactly e^ghMu, cross-consistent with suite-1 slope_test (44.5223/748.6219). REPORT lines
  (3-reach, 4-GH, 6) informational, ungated.
- Engine-source cleanliness: `git status -- engine/` clean; only engine/ commit this session =
  40751b3 (DIFF_LEDGER.md + my splice script; markdown/process). Zero engine-source mods.
- Label honesty: suite-level ONLY — no browser/UI claim this run (no UI changed this session).
  No DIFF_LEDGER entry needed: no version transition, HEAD unchanged at 6cc73563.


## ★ 2026-06-11 — ORG-REVIEW SIGN-OFF (skeptic run-8 cond 4i) + ledger stale-fact fixes
**I SIGNED OFF YES** on the organiser handover as conditioned (`docs/org_review_2026-06-11.md`,
443f756; skeptic verdict #7 PASS-WITH-CONDITIONS, 6 binding — see skeptic MEMORY ~L238-263).
What moves: DIFF_LEDGER rolling feature-state TABLE curation + backfills, OPERATOR-VOICE
distillation + rolling OQ list, staleness sweeps. What I KEEP: all verification (browser+oracle),
evidence files, FLAG verdicts, authorship of every verification entry (the facts).
**My 3 sign-off conditions (recorded in my reply to the manager):**
- **T1 (verbatim-lift):** any state/verdict wording the organiser puts in a table cell must be a
  VERBATIM LIFT from my verification entry (or a verbatim transcript), never a restatement — the
  origin-rule leak is COMPRESSION (the org review's own row-12 "pivot landed" oversell, caught by
  skeptic cond 6, is the existence proof). My side of the deal: **every verification entry I
  write now carries an explicit per-feature row-verdict line** for each feature # listed, so the
  organiser always has a liftable source and any non-matching wording is detectable=FLAG.
- **T2 (clean baseline):** handover starts from the stale-fact-clean ledger I produced today (so
  the skeptic's audit of the organiser's FIRST distillation isn't confounded by my-era staleness).
  DONE — see below.
- **T3 (frozen pre-handover blocks):** everything distilled before handover stays tester-authored
  and frozen; organiser changes to those blocks = dated, labelled addenda, never in-place rewrites.
**YOURS-only declaration:** the 2026-06-10 backfill — all 3 entry OPERATOR-VOICE blocks, the
rolling OQ list (8 OPEN + 4 RESOLVED), and the transcript-gap honesty note — tester-authored.
**Handover NOT yet effective:** still pending = skeptic cond-5 sweep (DIFF_LEDGER header, my
charter L31-54, CLAUDE.md §2, skeptic charter, §2.2) by the manager, skeptic audit of organiser's
first distillation, operator one-line notification (veto room open). **Until that completes the
ledger duties remain MINE.**

### Ledger fixes I applied 2026-06-11 (my file, my facts; markdown only, no engine source)
Splice with count==1 asserts: `engine/splices/splice_ledger_stalefix_2026-06-11.py` (9 reps):
- **Row #12** — skeptic cond-6 wording character-exact ("5 faith gates landed green (a8998cf);
  completeness of the faithfulness program unaudited"), + my own evidence tail; last-changed
  2026-06-10 (a8998cf); verdict GUARDED — completeness unaudited.
- **OQ item 4** — re-scoped: hold RULED-lifted (operator "1 yes", entry 14 ruling 1,
  `history/operator/2026-06-10_project-status-review.md` [verbatim-transcript]); what stays OPEN
  = the completeness audit (live engine reproduces EVERY proven construct).
- **4 stale paths** (skeptic slice-1 count, dc254ad): CURVE_SWAP → `curves/gh/...:93` (line holds);
  KURTOSIS_KNOB → `curves/balancer_w/KURTOSIS_KNOB_kappa_balancer_native_2026-06-10.md` — I
  re-verified the quote anchors in the moved file: **two line refs had DRIFTED**
  (:282-284→:284-285, :175-176→:177); fixed with re-checked quotes. Lesson: a path swap without
  re-anchoring the quote plants a fresh stale fact.
- **Provenance upgrades** (my OPERATOR-VOICE duty): header mandate cite + pain-points item now
  cite the verbatim transcript (entries 5/2/4); the backfill honesty note kept VERBATIM with a
  dated UPDATE appended (corrigenda style, not in-place rewrite).
**My evidence for "green":** I re-ran `engine/verify/run_all.sh` myself 2026-06-11 vs HEAD —
integrity md5s exact (6cc73563 / ab663f5c / c505b08a), 7 GH gates, slope identity, seam, dir,
FAITH 1–5 all PASS (FAITH-FISHER final PASS; set -e chain). Not borrowed from the skeptic's run-7.

### ★ TRANSCRIPT-GAP STATUS (updated 2026-06-11 — supersedes the 06-10 note below in part)
`history/operator/2026-06-10_project-status-review.md` EXISTS (verbatim, 20 entries; 1–6
pre-policy backfill, labelled). 2026-06-11 sessions transcribe live
(`2026-06-11_curve-agnostic-framework-brainstorm.md`, 9 entries at my read). **Remaining gap:
2026-06-08/09 only** (v25-GH/v26a/v26b/v26c + governance/AIRTIGHT sessions) — export request
stands. Key 06-10 verbatim anchors: entry 5 = my duty origin ("full responsibility… scan the
chats transcripts…"); entry 14 = rulings 1-3 (pivot un-hold "1 yes"; trades-bend-curve "2. yes";
kurtosis = static steepness); entry 16 = "its w that the trade changes"; entry 10 = the prize.

## ★ STANDING DUTY (operator-directed 2026-06-10, entry 5) — OPERATOR-VOICE layer of DIFF_LEDGER
**Being transferred to the organiser per operator entry-8 authorization (2026-06-11) — mine until
the transition protocol completes (see sign-off section).** Mandate verbatim: "if the tester is
responsible for version control then apart from just taking screenshots and checking the UX, he
has to take full responsibility to even scan the chats transcripts to distill my objections to
each version, open questions etc." Scan order: `history/operator/` FIRST, then legacy
transcript_journal + session_tree_note. RESOLVED only with evidence. Never paraphrase an
objection into something easier. Labels: [verbatim-transcript] / [manager-recorded paraphrase] /
[summary-stub]. Skeptic audits my distillation and outranks everyone but the operator.

### Backfill DONE (2026-06-10) — what I wrote and where it came from (FROZEN as tester-authored)
- Read end-to-end: `history/transcript_journal.txt` (105 ln, summaries, ends 2026-06-06) and
  `history/session_tree_note.md` (4100 ln, pre-GH canonical, ends at curve-shape pivot). Swept
  `notes/`, `docs/` (incl. context/chats stubs), manager MEMORY, feature inventory.
- Wrote: OPERATOR-VOICE blocks on all 3 backfilled entries + rolling list (8 OPEN + 4 RESOLVED
  with evidence) + provenance/honesty note + header mandate quote.
- Key verbatim recoveries (session_tree_note unless noted): "hid and aggregated away information"
  (:353); "I buy a discount IOU to receive 1 BTC after 12 months, on dollar margin" (:921-923,
  Fork-C); "same carved slice everything…" (:3206-3207, pass-3 settlement gap); "looked the same
  instead of steeper (american-style implies steeper)" (:3460-3461); "initial not closing,
  escrowed not appropriated" (:3754). Fragments since UPGRADED to verbatim (2026-06-11 fix):
  "yes to all" (entry 2), "Id especially want the version control agent to be diligent…"
  (entry 4). Still manager-recorded: "I trust Aristotle" (MEMORY:360, 06-09 session — gap).
- Finding-2 chain fully evidenced: origin :3444-3458 → og-manager-clone-1.md:18-20 → operator
  ruling 2026-06-08 (manager MEMORY paraphrase) → v26c absorption (my live confirmation).

### Watch-items I carry
- Rolling-list item 5: "|Γ|≤1 exact; |Γ|>1 = labelled approximation" rider vs engine locked γ>1 —
  nobody has verified an approximation LABEL ships in UI/paper. Keep against paper/UI passes.
- Kurtosis era-reversal recorded (old "Rohan does not want kurtosis" :1056-1057 superseded by
  motive). Slippage-collar item PARKED not resolved — re-surface if collar UX ships.
- NEW: organiser-era watch — T1 verbatim-lift compliance on its first table updates; my row-12
  evidence-tail style (mandated-wording-prefix + my cite) is the template for liftable cells.

## DONE — live v26c_full2 browser confirmation (build 6cc73563…)
Ran **live Playwright Chromium** against `builds/temporal_mvp_v26c_full2.html`. Build md5
`6cc73563779a3e030774b7597d0ae187` unchanged (no engine edit); blobs `ab663f5c…`/`c505b08a…`
intact; 3 scripts parse. Oracle `run_all.sh builds/temporal_mvp_v26c_full2.html` GREEN incl. SEAM
GATE + **DIR GATE PASS** (γ∈{1.5,2,3,4}, mutation-detected). Note: run_all.sh COPIES the passed
build into a scratch file literally named `temporal_mvp_v26b_itm.html` (line 16) and the seam/dir
gates read that scratch copy — so the "v26b_itm" filename in gate headers is the scratch name, the
CONTENT is v26c_full2. Harness: `engine/verify/pw_v26c_visual.mjs`. Reproduced clean across 2 runs
(chart-vs-table diff identical to the bit; not flaky).

### KEY ENABLER (new): `Engine` AND `Store` ARE reachable inside `page.evaluate`
Classic-script top-level `const`s (Engine line 1590, Store line 2255) live in the page global and
ARE visible to `page.evaluate` (unlike Node import, which can't see them). So the live oracle of
record here is the page's OWN engine called against the live `Store.state.pool` + the rendered DOM
mark cells — strongest possible evidence. (Prior v26b memory said "NOT on window"; that's true for
`window.Engine`, but `typeof Engine !== 'undefined'` inside evaluate is TRUE. Probe-confirmed.)

### Verdicts (FLAG per item)
1. **Bands table crossover at K — PASS (tester-confirmed, live engine + rendered DOM).** The
   OTM→ITM **regime** crossover (`legIsITM`) requires a pool-SPOT move, not a rebase: set oracle then
   click **#btn-arb (Run Arbitrage to Oracle)** to push poolMark to the oracle. Then `soldITM` flips
   **false→true EXACTLY at oracle=poolMark=120000=K** (119900 OTM, 120000 ITM) for the SOLD call
   K=$120k, γ=2 build. `legIsITM` uses price-measure `sNorm0=poolMark/oNow` vs live ray `K/oNow` ⟺
   poolMark≥K. All-γ crossover-at-K is the Node DIR_GATE's job (PASS, manager-verified); browser
   confirms γ=2 live. Registration identity verified: `getMP_raw(arbitrageToOracle(pool,K))=K`
   exactly (120000.0000000003), `getSNorm(that)=thetaReg`. `11_bands_table_crop.png` (ITM, oracle
   $130k, SOLD mark 0.3333) + `12_bands_table_OTM_crop.png` (OTM, oracle $100k).
   - GOTCHA: a pure oracle REBASE (kpi-oracle alone, no arb) does NOT cross the strike — it carries
     the position with the frame (poolMark stays fixed, soldITM never flips). That's correct
     (absorbed Finding-2). Must arb to move spot through K.
2. **Chart strike-ray live on the position — PASS (tester-confirmed, rendered).** Curve view: white
   eq-marker on the GH curve; green (put) / red (call) strike rays from origin with trade-dots ON
   them. Rebasing oracle 80k→160k (`08b`→`08c`) **rescales the frame and repositions the rays**
   (live K/oracle), marker stays on curve — no stale entry-θ drift (the absorbed Finding-2). Curve
   is GH continuation, not Balancer weight-form. Drift table (item2_drift in trace): leg.inner
   (entry-frozen θ, sold 1.5 const) vs sNormStrike(pool,K) (live, sold 0.4446→0.0494 across sweep) —
   they diverge post-rebase, confirming the live path is used, not the stale entry value.
3. **Re-based payoff matches the table — PASS (tester-confirmed, exact numeric).** At the live spot
   (r=0) the chart's legFraction == bands-table markEff == rendered DOM mark cell, **|diff|=0.0
   exactly** both legs: SOLD 0.24169229297386294 (DOM 0.2417), BOUGHT 0.2826730030550262 (DOM
   0.2827). Same registered carry basis. Payoff frame is **−90%..+200%** asymmetric (`09_payoff`),
   renders cleanly across the full range, downside floors at $0, free-boundary kink visible at left,
   no NaN/blank/clip. Rebased-160k (`09b`) rescales Y-axis to $375k, still clean. (Payoff chart is
   canvas-only — no DOM data table — so the numeric compare is the page's own legFraction closed
   form vs the rendered table cell; both evaluated live against Store.state.pool.)
4. **No v26b regression — PASS (tester-confirmed, rendered).** Polar mark "Mark Across Strikes"
   (`canvas-pricing`, `07_polar_mark_pricing.png`): green dot (~$80k) and red dot (sold call ~$138k)
   both sit exactly ON their ψ-curves (pink put-wing / teal call-wing), peak 1.0 at the mode —
   continuity through strike, no drift. Bands §5 columns all present & correctly labelled (9 cells/
   comp row, OPEN/CLOSE, headers verbatim in trace.item1_headers). Matches v26b.

### Provenance summary
- tester-confirmed (rendered pixels): items 1 (table crops), 2 (curve rays), 3 (payoff frame), 4
  (polar mark). Numeric cross-checks: page's OWN Engine/Store live (NOT a Node re-derivation).
- Node oracle incl. seam + dir gate: PASS against v26c_full2 (scratch-named v26b_itm).
- VERDICT: all 4 PASS, clean ×2, no regression. Recommend HEAD promotion clear from the visual layer.

### Repro
`cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v26c_visual.mjs`
Crossover-at-K (arb-driven): set #kpi-oracle then click #btn-arb, read Engine.legIsITM live.
Oracle gate: `cd engine; sh verify/run_all.sh` (defaults to HEAD; seam+dir+FAITH 1–5 PASS — my
2026-06-11 re-run). Chromium binary at BOTH `/opt/pw-browsers/chromium-1194` and
`~/.cache/ms-playwright/chromium-1194`; `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` is the one
that resolved here. tmp harnesses must live under `engine/` so `import 'playwright'` resolves
`engine/node_modules/`.

### Gotchas learned (v26c)
- chart-select option values: `curve` (canvas-curve, GH pool curve + strike rays), `pricing`
  (canvas-pricing, polar Mark-Across-Strikes — item-4), `trajectory` (canvas-ratio), `payoff`
  (canvas-payoff, the −90%..+200% sim).
- Band validation (#btn-execute disabled): bought PUT K must be < oracle (OTM put); sold CALL K >
  oracle (OTM call). With oracle=$80k: sold 120000 / bought 68000 works; bought 90000 fails
  ("not OTM on put wing"). Needs a perp added first (club.totalNotional>0).
- carry sNorm is INVERSE to price (sNorm ∝ S^−γ): higher K → lower thetaReg. `isOTM`/`wingMember`
  use the PRICE-RATIO leg.inner (K/oracle, ∝S^+1), NOT the carry theta — feeding carry theta to
  isOTM gives wrong answers. The v26c design deliberately keeps entry-checks on price-ratio,
  value/mark on carry (sNorm(K)). Don't conflate.

## Prior runs (still-valid context)
- v26b (8df9f8a3…): items 1/2/4 tester-confirmed, item-3 uncapped-vs-capped logic-only (chart window
  too narrow then; v26c's −90..+200 frame now clears the free boundary so legs render past it).
  Seam gate PASS. `evidence/v26b_pw/`.
- v26a: Finding-2 was open (curve/ratio chart ratio-pegged, table dollar-anchored) — **now ABSORBED
  in v26c**: chart rays are live K/oracle, table+chart+settlement all carry-registered at sNorm(K).
  Slippage display PASS, frame re-fit PASS (don't revert), curve = GH continuation.

## File-safety canon
Blob line md5s `ab663f5c…` (webp L74) / `c505b08a…` (svg L1060); 3 `<script>` parse.
v26c HEAD build md5 `6cc73563779a3e030774b7597d0ae187` (re-verified 2026-06-11). v26b `8df9f8a3…`.

## Evidence
`evidence/v26c_pw/` — 01_inputs, 02_after_execute, 05_bands_table_spot, 06_bands_table_ITM,
07_polar_mark_pricing, 08/08b/08c_curve_strikeray*, 09/09b_payoff_rebased*, **11_bands_table_crop**
(ITM legible), **12_bands_table_OTM_crop** (OTM legible), trace.json (all DOM + live-engine numbers,
sweeps, drift table, chart-vs-table diffs). Harness `engine/verify/pw_v26c_visual.mjs`.
`engine/builds/DIFF_LEDGER.md` — my ledger incl. OPERATOR-VOICE layer (backfilled 2026-06-10;
stale-fact-clean baseline 2026-06-11 via `engine/splices/splice_ledger_stalefix_2026-06-11.py`).

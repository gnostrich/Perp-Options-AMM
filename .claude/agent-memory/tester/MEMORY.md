# MEMORY — tester
_Last updated: 2026-06-10, after the ENTRY-30 TEST-ONLY premium-warp + composite-ray verification on HEAD `1eebfcd6` (no build edit)._

## ★★★★★ MOST RECENT — ENTRY-30 TEST-ONLY (HEAD `1eebfcd6`, NO build edit, operator live-playing)
Live Playwright ×2, 0 console errors. Harness `engine/verify/pw_v27_premium_warp.mjs`; evidence
`evidence/v27_premwarp/` (R1/R2 C1 near/far curve crops, C2 spread setup, v24_load.png, trace_premwarp.json).
- **CHECK 2 (vertical spread → single composite-ray tx): PASS exact.** Sold-call K1=$96k/K2=$120k:
  θ*=√(θ₁θ₂)=1.341641 (between θ₁=1.2/θ₂=1.5), δ=0.111572, V=vsValue(N,m*,δ) residual 0.0e0,
  legPrice spread branch agrees, UI mode pill "SPR", pv-sold-theta=1.3416. Confirmed.
- **CHECK 1 (premium-controlled warp): operator's claim NOT reproduced — FLAGGED to manager.**
  Operator (entry30 verbatim, kurtosis-curve-family-brief.md:217): constant premium + further OTM ⇒
  warp MORE. LIVE: at CONSTANT premium ($1624.78) the warp is BYTE-IDENTICAL across the OTM ladder
  ($88k→$112k): φ-shift 3.8429e-3, 0.436px, slip 0.9716% at EVERY rung. Does NOT increase further OTM.
  Constant-NOTIONAL contrast (:219) DOES hold (further OTM ⇒ warps less, premium+slip shrink).
  ROOT CAUSE (structural): `tradeUpdate(s,dy)` (v27 L1723) takes ONLY dy; strike θ never an arg;
  dy=±premium; β=y(1-w_field)/α=x·w fixed by entry state ⇒ φ′=f(entry,dy) alone ⇒ premium-only warp,
  no strike-dependence. NOT a render artifact (engine truth + px re-projection both ×2).
- **v24 live contrast:** v24 has NO phi at all; tradeUpdate(s,dy) keeps α=5/β=400000 INVARIANT — point
  slides on a FIXED Balancer hyperbola (the "dot sliding" the operator forbade for v27). Strike also
  absent from v24 trade step. So NEITHER build has the strike-dependent premium-warp the operator describes.
- **Ledger:** TEST-ONLY observation entry appended (explicitly "behavioral verification on HEAD
  `1eebfcd6`, no build edit"; no version/promotion change), feature-keyed #2/#16 + none-beyond; new
  OPEN operator question "-1" added; table rows #2/#16 carry the obs note (no STATE change). OPERATOR-VOICE
  cites :217/:219/:223 verbatim; CHECK-1 marked OPEN (cannot resolve without engine change or operator ruling).
- **Repro:** `cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v27_premium_warp.mjs`.


## ★★★★ MOST RECENT — DISPLAY-FIX `1eebfcd6` SPOT-CHECK: 3/3 PASS ×2 — operator's exact ask MET
HEAD = `engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html` md5 `1eebfcd6f6ff4f4e3df5f745ac145f19`
(display fix on `9d22cffd`; CSS + display wiring only, engine math untouched). Live Playwright ×2,
byte-identical verdicts, 0 console errors. File-safety GREEN — NOTE: **svg blob line shifted
1060→1064** (new CSS above it; line-md5 still `c505b08a…` canonical, webp `ab663f5c…` L74);
3 scripts parse.
**Verdicts:** (1) τ spinner arrows VISIBLE + MOUSE-CLICKABLE (CSS L331-337 inner-spin-button) —
up-click 0.30→0.35, curve redraws (canvas dataURL diff), down-click back; ALL settings/perp number
inputs show spinners (real ids: tau-input, wminus-input, wplus-input, perp-margin, kappa-input,
tick-hours — NOT wneg/wpos). PASS. (2) kpi-spot-usd $80,000.00 / kpi-spot 1.0000 at load
(getMP_raw basis, L4304-4306; was $30,344.83/0.3793 y/x). PASS. (3) hdr-pool-spot
"spot $80,000.00" (L4256 — manager fixed unflagged header same basis). PASS.
**Both my entry-29 OPEN residuals (spinner CSS, Spot basis) → RECONCILED-in-`1eebfcd6` in the
ledger** (+ new display-fix entry, table rows #1/#3/#15 re-rowed, item 0b updated). Transcript
re-scanned: no operator entries after 29 — entry-29 clauses (updown arrows, v24 values) now MET;
y0 default-delta still the only OPEN-for-ruling from that objection.
**Gotchas:** #tau-input is on the Settings SUBTAB — harness must `click('.tab[data-subtab=
"settings"]')` before locating it (scrollIntoViewIfNeeded times out otherwise). wcurve-status text
is τ-invariant at 2dp (γ_loc(ATM)=2.64 at τ 0.30 and 0.35) — use canvas dataURL diff as the
update evidence, not the status string.
**Repro:** `cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v27_ux_spotcheck.mjs`
(exit 0 = all pass). Evidence `evidence/v27_ux/D_01..D_08` + `trace_ux_spotcheck.json`.

## Prior — UX-RESTORE `9d22cffd` TESTED: OPERATOR-PLAYABLE = YES, two UX flags (since RECONCILED in `1eebfcd6`)
Build md5 `9d22cffd6a0f002f359eed81d7157203` (UX-restore on the promoted v27 line; was
`b245bfda`; superseded by `1eebfcd6` above). Live Playwright, operator-style (real
clicks/keys), ×2 byte-identical, 0 console errors. Blobs canonical, 3 scripts parse.
**Verdicts (full detail in DIFF_LEDGER UX-restore entry):**
- Load PASS: oracle 80000, marginal $80,000.000 at load, curve fracW 0.981, lp-y-delta $0.00
  (RECONCILED — dynamic `_initial_y` L4311), perp form 8.0× / liq $70k long / $90k short
  (RECONCILED).
- No sliders PASS: 0 input[type=range] live DOM; τ = number step 0.05; keyboard ↑/↓ works.
  **FLAG OPEN: τ spinner ARROWS CSS-hidden** (`.field-input-wrap` L326-328 appearance:none —
  mouse-click stepping dead on τ; band-price inputs L938-950 DO click-step). One-line CSS fix.
- Knob PASS: τ 0.05 vs 1.5 → elbow 5.62px mean/111 max, left wing 0.00px, right 1.26px.
- Trade PASS: real UI perp+band 0.05 BTC sold-120000/bought-68000 → slippage 0.0710%≈$0.07,
  executes, y +156.20, curve/dot redraw, no NaN. In-band holds to 50 BTC (93.97% slippage, honest,
  allowed); **frozen-wing red banner at 100 BTC** + Transact disabled (pixel-confirmed crop).
- v24 side-by-side PASS-with-flags: identical layout/tabs/KPI-labels/chart-views/defaults + one
  new (W) settings section. **FLAG OPEN: Spot ($) KPI = $30,344.83 = raw y/x reserve ratio, NOT
  the marginal $80,000** (v24 showed $80,000/1.0000/0.5000; v27 shows 0.3793/$30,344.83/0.7250) —
  first dollar number on screen contradicts the $80k world. Also y0=303,448.28 ≠ v24's 800,000
  (deliberate equilibrium-at-load, code L2285-2289 — surfaced for operator ruling).
**Ledger updated:** UX-restore entry appended; feature-state rows #1/#3/#15 re-rowed; rolling
list item 0b (entry-29 objection, clause-by-clause status); reconciliation: blast-radius row
RECONCILED-in-9d22cffd, +2 new OPEN rows (Spot-KPI basis, τ arrow affordance).
**Repro:** `cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v27_ux_operator.mjs`
(runs A/B + v24 compare) + `node verify/pw_v27_ux_fixup.mjs` (true τ-low, over-size search,
spinner-click probe, v24 spot baseline). Evidence `evidence/v27_ux/`.
**Gotcha new:** number-input spinner mouse-clicks only work where CSS shows them (profit-row
inputs yes, field-input-wrap no); keyboard ArrowUp/Down always steps + fires input. Over-size
threshold on default pool: in-band ≤50 BTC, frozen-wing at 100 BTC (bought leg rejects first).

## Prior — v27 IS HEAD (operator ruling, entry 28) + the v24→v26c desirables note
**HEAD = `engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html` (`b245bfda`), PROMOTED 2026-06-10 by
OPERATOR RULING** (entry 28 verbatim, `history/operator/2026-06-10_kurtosis-curve-family-brief.md`:
"firstly, commit this version to head because theres nothing useful since v24 -- in parallel let
the testing / versioning guy do a feature level diff … apart from this core … make note for
future reference"). **The ruling OVERRIDES my item-3 trades-warp visual blocker — recorded in the
ledger as OVERRIDDEN-not-resolved** (entry-26 conjecture checked & DISCONFIRMED first: no τ
matches v24's global warp with frozen wings; warp is elbow-local by design). v26c demoted to
`builds/temporal_mvp_v26c.html` (`6cc73563`), GH line retained, full GH suite green
(`run_all.sh builds/temporal_mvp_v26c.html`); run_all default routes (W)→`wcurve_selfcheck.js`
(21 PASS, re-run by me at promotion); HEAD blobs canonical (re-checked).

### What I wrote (2026-06-10, this task)
1. **DIFF_LEDGER.md** — v27 entry CANDIDATE→HEAD-PROMOTED; new promotion entry (feature-keyed
   #1-16 + none-beyond, OPERATOR-VOICE with entries 24/26/27/28 verbatim); feature-state table
   fully re-rowed to v27-HEAD states; item-0 blocker re-titled OVERRIDDEN; reconciliation list
   updated (+4 new OPEN rows from the diff findings).
2. **`engine/builds/NOTES_v24_to_v26c_desirables.md`** — the operator's ordered feature-level
   diff, D1–D17, categorized (a) already-in-v27 / (b) portable-not-in-HEAD / (c) GH-dead. Byte-
   checked against the actual builds, not lineage notes. KEY (b) FINDINGS (live in HEAD today):
   - **drawPayoff N_buy state-vs-pool NaN-fallback bug PRESENT in HEAD** (L4034; v26c fixed it,
     v27 inherited the v24 site) — D14.
   - Slippage $-tooltip honesty label (reserve-USD wording) not carried — HEAD ships v24 wording
     (L1176) — D2.
   - Payoff x-range back to ±50% (xMin/xMax L~4011) + naked leg capped at 1 in legFraction —
     v26b/c free-boundary coverage unported — D9/D10.
   - **sNormStrike is export-only in v27** (def L1790 + export L2254, zero call sites; no regLeg;
     payoff sweeps price-ratio (1+r)) — one-mark uniformity + all-γ crossover@K UNVERIFIED on
     (W); dir_gate.js not exercised on (W) builds — D11/D13/D16.
   - Already-present (a): smooth-pasting port (markFrac L1666), live K/oNow rays (L2077 — in the
     v24 base itself), NaN-loud registration, engine-sampled curveTraceW, snapshot completeness.

## Prior — v27 RENDER-FIX RE-RUN (build `b245bfda…`, was `3914c7f4…`) — VISUAL-ACCEPTANCE was FAIL (2 of 3), since OVERRIDDEN by entry 28
Live Playwright Chromium, reproduced clean ×2 (0 console errors). File-safety GREEN (blobs canonical `ab663f5c…`/`c505b08a…`; 3 scripts parse). The
render fix landed: curveTraceW centers on 0.5·(u₀+φ) straddling op-point+elbow; default pool now
asymmetric x10/y12 (u₀≈0.18) w₋0.60/w₊0.85 τ0.3 oracle→4.44; #16 label states strong-form ships.

### VERDICTS (per the operator's signed test)
- **1 curve-across-frame = PASS** (fracW 0.937/0.93; GH continuation, not a sliver). FIXED.
- **2 τ knob = PASS** elbow visibly rounds (~36px vs prior ~0.9px), wings frozen (slope-angle Δ
  0.0001°@u−10, 0°@u+10 — frame-independent math). FIXED. (Caveat: axes rescale w/ τ via α/β, so
  the clean evidence is the slope-angle math, not raw band pixels.)
- **3 trades-WARP = FAIL (was the BLOCKER — now OVERRIDDEN by operator entry 28; fact stands).** Via REAL UI band-execute the curve shifts only
  ≈0.5px (φ:0→0.0011); 6 cumulative max trades → φ≈0.029 / ≈1px. Still a DOT SLIDING, not a warp —
  exactly what the operator forbade. ROOT CAUSE: NOT a render bug (curveTraceW IS φ-dependent
  in-frame, verified at fixed x); an admissible (W) trade on this default pool produces sub-pixel φ.
  Fix = higher per-trade φ gain (pool/Δw geometry) or amplified/animated warp viz.
- **4 in-band exec / over-size frozen-wing msg = PASS.**
- **5 pricing+payoff+KPI = PASS-with-flags.** No NaN/Inf. Toy readouts consistent (spot $1.18,
  lp-x-usd $44.40, pool-value $24). TWO oracle-default blast-radius oddities (FLAGGED): lp-y-delta
  = −$799,988 (L4295 hardcodes y−800000, stale v24 baseline) + Create-Perp LIQ −9995.56 (degenerate
  0.1BTC/$1000-margin at oracle 4.44). Non-NaN but absurd; un-gated default exposed them.
- **6 no console errors; ×2 reproducible (not flaky).**

### ⚠ METHODOLOGY GOTCHA (carries forward — important)
In `page.evaluate`, **`Engine` and `Store` are reachable, but `Viz` and `render` are NOT**
(undefined, not on window — different scope). My ORIGINAL v27 harness called `render()`/`Viz.drawAll()`
from evaluate → SILENT no-ops → canvas never redrew → the "0px warp" was partly a HARNESS artifact,
not proof the render was broken. To test the warp you MUST drive a real trade through the app's own
UI handlers (add perp → Trade-Bands subtab → fill band → #btn-execute). The τ knob "worked" before
only because it went through the real tau-input event handler.

### PRIOR FINDING (original run `3914c7f4`) — now superseded by the re-run above
Original run: op-point at u₀≈11.3 off the [−6,6] window → sliver curve, τ invisible, warp 0px. The
sliver + τ-invisible + degenerate-default + stale-label findings are now RECONCILED in `b245bfda`;
only the trades-WARP-invisibility persists (and is now correctly root-caused to sub-pixel φ, not frame).

### Other v27 OPEN findings (all in DIFF_LEDGER reconciliation list)
- **Degenerate default pool:** ships SYMMETRIC wings w₋=w₊=0.70 ⇒ Δw=0 ⇒ τ inert, EVERY trade
  wing-range-rejected. Had to set asym (0.60/0.85) to exercise anything. Needs asym default.
- **Stale UI label:** "Trade mechanic (#16)" sim-aid (engine L1352-1357) still says strong-form
  is OPEN / "reserves slide on a FIXED curve" — but the engine SHIPS the strong-form φ warp.
  Misleading honesty-label; intern must update. (No "fully proven" overclaim — that's clean.)
- **#9 funding** re-pointed to price-anchor p=P, γ→±γ_loc — DIVERGES from HEAD's locked w=½
  funding [theory-risk-accepted]; not exercised in UI this run.

### What PASSED (engine layer + the guards that DO render)
- γ>1 guard: wing weight ≤½ clamps to 0.501 in UI (HTML min 0.51 + JS clamp reflects back; status
  shows γ₋=1.00). tester-confirmed live.
- Wing-range guard: over-size trade REJECTED with verbatim "trade exceeds frozen-wing range —
  split or widen Δw"; in-band executes. tester-confirmed live.
- Payoff simulator renders cleanly (91094 lit px, no NaN/blank); pricing view renders.
- Engine warp/knob all correct via my LIVE page-engine reads (φ moves, trajectory exact,
  path-independent, round-trip 1.78e-15, elbow rounds in γ_loc, wings τ-near-frozen).

### v27 render-fix re-run repro
`cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v27_render_accept.mjs`
(items 1-6 on the DEFAULT asym pool, ×2 — no wing-setting workaround needed now) +
`node verify/pw_v27_warp_realui.mjs` (real-UI band-execute warp test). Default pool already asym
(0.60/0.85) so the knob/trades are live on load.
**PLAYWRIGHT MODULE GOTCHA:** playwright is GLOBAL at `/opt/node22/lib/node_modules`; symlinked into
`engine/node_modules/playwright` (+ playwright-core) — re-create if missing. Harness must run from
`engine/`.
Evidence: `evidence/v27_pw/A_R01..A_R07`, `A_W01..A_W03`, `bigwarp_post.png`, `trace_render_accept.json`,
`trace_warp_realui.json` (plus prior 01-08/20-23 from `3914c7f4`).
DIFF_LEDGER updated: v27 render-fix RE-RUN sub-entry appended (per-item FLAGs + methodology note),
feature-state rows #2/#3/#16 updated, reconciliation list split (3 RECONCILED in `b245bfda`, 1
trades-warp BLOCKER still OPEN, +1 new oracle-default-blast-radius OPEN), OPERATOR-VOICE acceptance
status set to PARTIALLY-MET / FAIL.

---

## ★ NEW STANDING DUTY (operator-directed 2026-06-10) — OPERATOR-VOICE layer of DIFF_LEDGER
Operator's mandate, verbatim: "if the tester is responsible for version control then apart from
just taking screenshots and checking the UX, he has to take full responsibility to even scan the
chats transcripts to distill my objections to each version, open questions etc."
At EVERY ledger entry I now ALSO: scan `history/` transcripts (+ any newer transcript artifacts),
distill the operator's OWN words (objections VERBATIM + file:line ref / open questions / rulings),
fill the entry's OPERATOR-VOICE block + the rolling ⭐ OPERATOR OPEN QUESTIONS list. RESOLVED only
with evidence (ruling quote or verified fix). Skeptic audits my distillation against raw
transcripts and OUTRANKS everyone but the operator — unresolved-presented-as-resolved is the
named failure. Never paraphrase an objection into something easier. Provenance labels I use:
[verbatim-transcript] / [manager-recorded paraphrase] / [summary-stub].

### Backfill DONE (2026-06-10) — what I wrote and where it came from
- Read end-to-end: `history/transcript_journal.txt` (105 ln, session-summary catalog, last entry
  2026-06-06) and `history/session_tree_note.md` (4100 ln, canonical PRE-GH note: composite-ray
  v24 / v25-american / convexity-knob arc, ends at the curve-shape pivot). Swept `notes/`,
  `docs/` (incl. `docs/context/chats/*.md` summary stubs), manager `MEMORY.md`, feature inventory.
- Wrote: OPERATOR-VOICE blocks on all 3 backfilled entries + populated the rolling list
  (8 OPEN items + 4 RESOLVED/RULED items with evidence) + a provenance/honesty note. Mandate
  quote added to the ledger header.
- Key verbatim operator quotes recovered (all session_tree_note.md unless noted):
  "hid and aggregated away information" (:353, old portfolio); "I buy a discount IOU to receive
  1 BTC after 12 months, on dollar margin" (:921-923, Fork-C settlement ruling); "same carved
  slice everything — that's why it retains fraction-of-perp pricing" (:3206-3207, caught the
  pass-3 settlement gap); "looked the same instead of steeper (american-style implies steeper)"
  (:3460-3461, chart-shape objection); "initial not closing, escrowed not appropriated" (:3754);
  fragments via manager MEMORY: "yes to all" (:32), "diligent… feature-level… so I don't ever
  have to keep inventory" (:44-45), "I trust Aristotle" (:360).
- Finding-2 chain fully evidenced: origin transcript :3444-3458 → og-manager-clone-1.md:18-20 →
  operator ruling 2026-06-08 (manager MEMORY:505-506) → v26c absorption (my live confirmation).

### ★ THE HONESTY GAP I FLAGGED (do not lose this)
**The GH-era sessions are NOT in `history/`.** transcript_journal stops 2026-06-06;
session_tree_note ends pre-GH. So v25-GH / v26a / v26b / v26c (2026-06-08), governance + AIRTIGHT
(2026-06-09), and the pain-point conversation (2026-06-10) have NO raw transcript — operator
voice for the exact versions the ledger covers is secondhand (manager MEMORY paraphrase +
docs/context/chats stubs + quote fragments). Today's directives reach me only via charters and
manager memory. Recommended to manager/operator: export the 2026-06-08/09/10 transcripts into
`history/` so the skeptic can audit raw words, not reconstructions.

### Watch-items I carry from the backfill
- Rolling-list item 5: operator's "|Γ|≤1 exact; |Γ|>1 = labelled approximation" rider
  (MEMORY:177-180) vs engine locked at γ>1 — nobody has verified an approximation LABEL actually
  ships in UI/paper claims. Keep against future paper/UI passes.
- Kurtosis era-reversal recorded (old "Rohan does not want kurtosis" :1056-1057 vs new motive
  "purpose = kurtosis knob") — superseded, not open; recorded so it can't be cited stale.
- Slippage-magnitude collar item is PARKED not resolved — re-surface if collar UX ships.

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
Oracle gate: `cd engine; sh verify/run_all.sh builds/temporal_mvp_v26c_full2.html` (seam+dir PASS).
Chromium binary at BOTH `/opt/pw-browsers/chromium-1194` and `~/.cache/ms-playwright/chromium-1194`;
`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` is the one that resolved here. tmp harnesses must live
under `engine/` so `import 'playwright'` resolves `engine/node_modules/`.

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
v26c_full2 build md5 `6cc73563779a3e030774b7597d0ae187`. v26b HEAD `8df9f8a3…`.

## Evidence
`evidence/v26c_pw/` — 01_inputs, 02_after_execute, 05_bands_table_spot, 06_bands_table_ITM,
07_polar_mark_pricing, 08/08b/08c_curve_strikeray*, 09/09b_payoff_rebased*, **11_bands_table_crop**
(ITM legible), **12_bands_table_OTM_crop** (OTM legible), trace.json (all DOM + live-engine numbers,
sweeps, drift table, chart-vs-table diffs). Harness `engine/verify/pw_v26c_visual.mjs`.
`engine/builds/DIFF_LEDGER.md` — my ledger incl. OPERATOR-VOICE layer (backfilled 2026-06-10).

# MEMORY — tester
_Last updated: 2026-06-11, after the ENTRY-45 lacunae verification on HEAD `1eebfcd6` (TEST-ONLY, no build edit)._

## ★★★★★ MOST RECENT — ENTRY-45 LACUNAE RUN (HEAD `1eebfcd6`, READ-ONLY, operator live-playing)
Operator entry 45 verbatim (`history/operator/2026-06-10_kurtosis-curve-family-brief.md:341`):
"did you check that the curve is almost completely insensitive to kurtosis change? theres no
visible curve warp, and the simulation breaks when you switch long to short.... i'm concerned at
these lacunae, skeptic, tester. the anchor curve is sitting way off in the corner somewhere"
Live Playwright ×2 byte-identical, **0 uncaught exceptions across every phase**. Harnesses
`engine/verify/pw_v27_entry45_lacunae.mjs` + `pw_v27_entry45_probe2.mjs`; evidence
`evidence/v27_entry45/` (27 shots + 2 traces + INDEX.txt). Ledger entry appended (feature-keyed
#2/#3/#10/#15/#16 + none-beyond; OPERATOR-VOICE clause-by-clause; OPEN item -2; +4 recon rows;
table rows #2/#3/#10/#15/#16 amended).
- **(1) τ stepper: REFUTED-as-bug / CONFIRMED-intrinsic.** Redraw fires every step (canvas diff
  3.7–5.4k px; Store.tau updates; one real ArrowUp click included). Rendered-trace displacement:
  one click 3.39px; 0.30→0.60 19.9px; 0.30→3.00 131px; 0.05→3.00 154px — ALWAYS at the far wing
  tail, ALONG-TANGENT (self-sliding power-law), elbow PINNED (kCur re-anchors through live point,
  Δlnx=0 at u₀=φ). Screenshots 0.30-vs-3.00 barely distinguishable. |Δlnx| ≤ (Δw/2)·Δτ, Δw=0.25.
  Manager pre-derivation confirmed. Design question (more visual authority?) = operator-tier.
  **Own the calibration drift: my prior "Knob PASS" runs verified change+math, never per-click
  eye-visibility — operator's perception is correct.**
- **(2) long↔short "breaks": REFUTED-crash / CONFIRMED 2 UI defects.** (a) **STALE-ON-REJECT
  frankenstate** = the operator's screenshot: previewBand reject paths (!sim.ok, club guards) set
  warn + disable Transact but DON'T clear summary/audit/N_buy → after ⇅ swap (or pill toggle) the
  PREVIOUS direction's slippage/N_buy stay rendered next to the rejection banner. Reproduced:
  valid long 9.95 sold-100000/bought-52000 → 18.1469% → swap → displays sell@52000, MAX 0.0625
  (the SEEDED demo short club — boot adds Store.addPerp('long',10000,1000)+('short',5000,500) →
  0.0625=5000/80000, exactly the operator chip), slippage STILL 18.1469% stale (STALE-CHECK true
  ×2 paths ×2 runs). Operator's 18.2297/0.536960 = same state class, their pool had prior play.
  (b) **×oracle unit inflation** in band audit strip: engine leg dy/netPoolY are RAW USD
  (verified = exact pool Δy: 28,453.17+11,470.09=39,923.26) but previewBand ×s.oracle again
  (L3227-3229) → **pv-net-cash "$3,193,860,736"** on a $303k pool (V_* rows correct — mixed
  conventions in executeBand return). Audit strip collapsed by default = why it survived.
  Transact on valid-but-over-club band → honest alert "Open failed: Over-carve: band needs
  $796000 notional but club free is $10000." (headless auto-dismisses dialogs — wire
  page.on('dialog') or executes look silent!). Engine clean both signs (mirrored band → finite
  sane state). MAX-chip-undefined-club suspicion REFUTED (guarded + seeded).
- **(3) anchor: CONFIRMED, root cause exact.** curveTraceExplicit(0.5, snap.depth, modeSlope)
  L3473 feeds (W)-units depth (x^0.725·y^0.275=170.83) into a w=½ trace ⇒ xy=29,186 ⇒ y=$2,918
  at x=10 vs live $303,448 (104×) — faint gray L hugging origin corner (bbox px 65.6,255→675,416).
  Correct anchor-through-live-point k=√(xy)=1,742. Known-OPEN promotion item, now intern-one-liner.
- **(4) warp: CONFIRMED invisible, structural.** Real executes: 1 BTC band Δφ=7.41e-3; cum 3 BTC
  ($240k notional) Δφ=2.18e-2 → **2.14px** max; $50k band 0.48px. Root: the band (ONLY UI trade
  path) nets sold−bought premium (1 BTC: 2383.01−757.41 ≈ $1,626 net vs y=$303k) and φ responds
  to NET CASH only (entry-30: tradeUpdate(s,dy), strike never an arg) ⇒ bands are warp-neutral by
  construction — COMPOUNDS the elbow-local subtlety (entry-28 override).
- Extras: boot log "y=$800k, w=0.5" STALE (actual 303,448/0.60-0.85) L4565 — recon row added.
  Band slippage τ-INVARIANT for wing legs (18.1469% at all τ, P5) — frozen-wings positive control.
- **Escalations for manager → operator:** τ visual-authority design Q; warp-visibility (band
  cash-neutrality is NEW info vs the entry-28 override); 2 UI defects + anchor + boot-log to intern.

### Gotchas added this run
- **page.on('dialog') is MANDATORY when clicking #btn-execute** — Store.openBand failures alert();
  headless auto-dismiss makes them look like silent no-ops (pool unchanged, no event, no warn).
- Boot seeds demo state: 2 perps (long $10k/$1k, short $5k/$500) AND suggestStrikes() fills the
  band form (0.05 BTC, sold 84000, bought 68000) — "fresh page" is NOT an empty state.
- previewBand reject ≠ clean panel: only the blank-inputs early-return clears pv-*/summary; the
  !sim.ok and club-guard paths leave stale readouts (the frankenstate). Don't read displayed
  slippage as live truth after ANY rejection — check warn-area first.
- Canvas pixel-diff COUNT saturates (whole thin curve micro-shifts ⇒ ~all curve px differ) — use
  analytic trace re-projection (app's cached __curveFrame + pad{18,18,44,64}) for displacement.
- u-window of curveTraceW at defaults = [4.32,16.32] (centered 0.5(u₀+φ)); max τ/φ displacement
  lands at the LOW-u end = bottom-right wing tail ≈ canvas (678,392).

## ★★★★ Prior — ENTRY-30 TEST-ONLY (HEAD `1eebfcd6`, premium-warp + composite-ray)
- CHECK 2 (vertical spread → single composite-ray tx): PASS exact (θ*=√(θ₁θ₂)=1.341641,
  residuals 0.0e0, UI "SPR").
- CHECK 1 (premium-controlled warp): operator claim NOT reproduced — at CONSTANT premium
  ($1624.78) warp BYTE-IDENTICAL across OTM ladder $88k→$112k (φ 3.8429e-3, 0.436px, slip
  0.9716% every rung). Constant-NOTIONAL contrast DOES hold. ROOT CAUSE structural:
  `tradeUpdate(s,dy)` (L1723) takes ONLY dy=±premium; strike never an arg. NOT render artifact.
  Ledger OPEN item -1; v24 contrast: no phi at all, fixed-hyperbola dot-slide, strike also absent.
- Repro: `cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v27_premium_warp.mjs`;
  evidence `evidence/v27_premwarp/`.

## ★★★ Prior — DISPLAY-FIX `1eebfcd6` SPOT-CHECK: 3/3 PASS ×2 — operator's exact ask MET
HEAD = `engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html` md5 `1eebfcd6f6ff4f4e3df5f745ac145f19`
(display fix on `9d22cffd`; CSS + display wiring only). File-safety GREEN — **svg blob line
shifted 1060→1064** (line-md5 still `c505b08a…`, webp `ab663f5c…` L74); 3 scripts parse.
(1) τ spinner arrows visible+clickable (CSS L331-337), curve redraws on click; real ids:
tau-input, wminus-input, wplus-input, perp-margin, kappa-input, tick-hours. (2) kpi-spot-usd
$80,000.00 / kpi-spot 1.0000 (getMP_raw basis L4304-4306). (3) hdr-pool-spot "spot $80,000.00"
(L4256). Both entry-29 residuals RECONCILED in ledger; y0 default-delta still OPEN-for-ruling.
Gotchas: #tau-input on Settings SUBTAB (`click('.tab[data-subtab="settings"]')` first);
wcurve-status τ-invariant at 2dp — use canvas diff as update evidence.
Repro: `node verify/pw_v27_ux_spotcheck.mjs`; evidence `evidence/v27_ux/D_01..D_08`.

## Prior — UX-RESTORE `9d22cffd`: OPERATOR-PLAYABLE YES (flags since RECONCILED in `1eebfcd6`)
Load PASS (oracle 80000, marginal $80k, lp-y-delta $0.00 dynamic `_initial_y` L4311, perp 8×/liq
70k/90k). No sliders; τ number-step 0.05. Knob: τ 0.05 vs 1.5 → elbow 5.62px mean/111 max, wings
~0. Trade PASS: 0.05 BTC band sold-120000/bought-68000 slip 0.0710%≈$0.07; in-band to 50 BTC
(93.97% honest); frozen-wing banner at 100 BTC + Transact disabled. v24 side-by-side: identical
layout + one new settings section; y0=303,448.28 ≠ v24 800,000 (deliberate equilibrium-at-load,
L2285-2289, OPEN-for-ruling). Repro: `pw_v27_ux_operator.mjs` + `pw_v27_ux_fixup.mjs`.

## Prior — v27 IS HEAD (operator ruling, entry 28) + the v24→v26c desirables note
**PROMOTED 2026-06-10 BY OPERATOR RULING** (entry 28: "nothing useful since v24") — **overrides my
item-3 trades-warp visual blocker — ledger records OVERRIDDEN-not-resolved** (entry-26 conjecture
DISCONFIRMED first: no τ matches v24's global warp with frozen wings; warp elbow-local by design).
v26c demoted to `builds/temporal_mvp_v26c.html` (`6cc73563`), GH suite green via explicit path;
run_all default routes (W)→`wcurve_selfcheck.js`. What I wrote then: DIFF_LEDGER promotion entry
(feature-keyed #1-16, OPERATOR-VOICE entries 24/26/27/28); `engine/builds/NOTES_v24_to_v26c_
desirables.md` (D1–D17, byte-checked). KEY (b) findings live in HEAD: drawPayoff N_buy NaN-fallback
(L4034, D14); slippage $-tooltip honesty unported (D2); payoff ±50% + naked-leg cap (D9/D10);
sNormStrike export-only, no regLeg (D11/D13/D16).

## Prior — v27 RENDER-FIX re-run (`b245bfda`): visual acceptance 2/3 (warp FAIL→OVERRIDDEN)
Curve-across-frame PASS (fracW 0.937); τ rounds elbow PASS (~36px on those defaults); trades-warp
FAIL ≈0.5px/band, φ≈0.029 after 6 max trades (root: admissible trade ⇒ sub-pixel φ, NOT render).
γ>1 guard + wing-range guard verbatim banners PASS. Degenerate-default/stale-label/blast-radius
findings RECONCILED through `9d22cffd`/`1eebfcd6` (see ledger).

### ⚠ METHODOLOGY GOTCHA (permanent)
In `page.evaluate`, **`Engine` and `Store` are reachable; `Viz` and `render` are NOT** (silent
no-op if called) — drive visuals through REAL UI handlers (tau-input events, #btn-execute, tabs).
To test warp/knob: real events only. (v26c-era note: classic-script top-level consts ARE visible
to evaluate — Engine/Store yes; Viz is in a different closure.)

## ★ STANDING DUTY — OPERATOR-VOICE layer of DIFF_LEDGER (operator-directed 2026-06-10)
Mandate verbatim: "if the tester is responsible for version control then apart from just taking
screenshots and checking the UX, he has to take full responsibility to even scan the chats
transcripts to distill my objections to each version, open questions etc."
Every ledger entry: scan `history/operator/` FIRST (verbatim per §2.2; 3 files as of 2026-06-11,
kurtosis-curve-family-brief.md at 45 entries), then legacy transcript_journal.txt +
session_tree_note.md. Distill objections VERBATIM + source ref; RESOLVED only with evidence;
skeptic audits me against raw transcripts. Labels: [verbatim-transcript] / [manager-recorded
paraphrase] / [summary-stub].
- Backfill done 2026-06-10 (8 OPEN + 4 RESOLVED items; key quotes recovered — see ledger).
- **HONESTY GAP (standing):** GH-era sessions (v25-GH/v26a/b/c 2026-06-08, governance 2026-06-09)
  have NO raw transcript — operator voice there is secondhand. Standing ask: export into history/.
- Watch-items: |Γ|>1 approximation-label never verified shipping (rolling item 5); kurtosis
  era-reversal recorded (old "no kurtosis" superseded); slippage-collar PARKED not resolved.

## Older runs (v26c/v26b/v26a) — verdicts stand, see ledger + evidence/
- v26c_full2 (`6cc73563`): 4/4 PASS live ×2 (bands crossover at K via #btn-arb; strike-ray live
  K/oracle post-rebase; payoff −90..+200 matches table exactly; polar mark on-curve). run_all
  GREEN incl. seam + dir gate (note: run_all copies build to scratch literally named
  *v26b_itm.html — header name ≠ content). Gotchas: rebase alone never crosses K (arb does);
  carry sNorm INVERSE to price; band validation needs perp first; bought-PUT K<oracle,
  sold-CALL K>oracle.
- v26b (`8df9f8a3`): seam gate PASS; v26a: slippage display + frame re-fit PASS, Finding-2
  ABSORBED in v26c.

## File-safety canon
Blob line md5s `ab663f5c…` (webp L74) / `c505b08a…` (svg — L1064 in `1eebfcd6`); 3 `<script>`
parse. HEAD `1eebfcd6f6ff4f4e3df5f745ac145f19`; prior `9d22cffd`, `b245bfda`, `3914c7f4`;
v26c_full2 `6cc73563…`; v26b `8df9f8a3…`.

## Environment quick-ref
`cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/<harness>.mjs` — playwright
global at /opt/node22/lib/node_modules, symlinked into engine/node_modules (re-create if gone);
chromium at /opt/pw-browsers/chromium-1194. Harnesses must live under engine/. file:// load works.

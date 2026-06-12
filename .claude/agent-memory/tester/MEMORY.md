# MEMORY — tester
_Last updated: 2026-06-12, after the v28 POLAR-LENS STAGE-2 STANDING UI SMOKE-PASS (candidate build `b53ace99`, READ-ONLY; write/settle-through-lens + FLAG-1 fix). HEAD unchanged = v27 `928cde1c`._


## ★★★★★ MOST RECENT — v28 POLAR-LENS STAGE-2 SMOKE (CANDIDATE `b53ace99`, NOT HEAD; v24-base lens line, write/settle THROUGH the lens)
Build = `engine/builds/temporal_mvp_v28_lens_S2.html` (md5 `b53ace9996930249cad85fc1e37e6c61`, UNCHANGED
post-run, READ-ONLY). Stage 2 = operator entry 96 (L710 [verbatim]): "settle at lenses prices … recording the
lensed version" — trades/portfolio/settlement now record the LENSED value. Manager pre-verify: pool byte-identical
to v24 (tradeUpdate Δ0), `lens_selfcheck.js` 23/0, blobs canonical. Harness `engine/verify/pw_v28_lens_S2_smoke.mjs`;
evidence `evidence/v28_lens_S2/` (15 shots + RUN_LOG_runA/B + INDEX + probes/). Live Playwright ×2 byte-stable,
**0 console errors / 0 pageerrors**. File-safety GREEN (webp L74 `ab663f5c…`, svg L1060 `c505b08a…`, 3 scripts parse).
Ledger entry appended (feature-keyed #3/#6/#7/#9/#10/#11/#14/#15/#16 + none-beyond; OPERATOR-VOICE entry 96 RULED;
table rows #3/#7/#10/#11/#15 amended; OPEN -3 FLAG-1→RESOLVED, +OPEN -4 FINDING-RT; reconciliation FLAG-1→RECONCILED
+1 FINDING-RT row). **VERDICT: ALL 12 step/gate verdicts PASS ×2 byte-stable ⇒ Stage-2 hand-back GATE = PASS.**
- **★ FLAG-1 RESOLVED (the Stage-1 blocker, deferred confirmation DONE):** the τ stepper EVENT now auto-redraws
  chart 2 LIVE — event-only px: 0.3→0.05 = **5,199**, 0.3→2 = **6,545**, real keyboard **ArrowUp** 0.3→0.35 = **3,894**.
  `window.Viz` is STILL undefined, but L2724 now calls `if (Viz) Viz.drawAll(...)` reaching Viz via the ui-script
  closure (dead window.Viz guard gone). Blocker is gone.
- **★ FINDING-RT (NEW, OPEN, INHERITED-v24 — the one thing to surface):** an instant net-cash-zero open→close
  round-trip on a TWO-OTM-LEG band yields POSITIVE raw_net = Y−X (TRADER-favourable per engine L2146) that SCALES
  with slippage: N=0.01→+1.57e-4, N=0.05→+3.71e-3, N=0.2→+4.30e-2 (slip 0.24/1.17/4.25%). **CONTRADICTS the brief's
  "tiny residual = pool-favourable, NOT a leak" on the SIGN.** Root = v24 closeBand geometry (both same-sign legs
  reverse in the trader's favour). **VERIFIED byte-identical raw_net in S1 AND v24 base** (`probes/compare_S2_S1_v24.txt`)
  ⇒ INHERITED-v24, NOT a Stage-2 regression. The one-ITM-leg steep case (S6) is correctly pool-favourable (raw_net<0).
  Does NOT block the gate by itself (Stage-2 settles correctly vs its base) — **escalate the SIGN convention to the operator**
  (entry 96 ruled "settle at lensed prices" but did NOT rule on round-trip direction).
- **Step verdicts (all PASS ×2):** (1) τ auto-redraw chart 2 live — PASS (FLAG-1 RESOLVED). (2) chart 1 INERT to τ:
  px-diff across {0.05,1,2,3} = **0 every τ** — PASS HARD (the read/write separation). (3) round-trip: finite small
  residual raw_net=3.86e-3, no settled-cash leg — PASS [sign = FINDING-RT]. (4) portfolio open-band value moves with τ
  (Δ=4.544e-2 across 0.3→2); closed bands freeze settlement $ ($35.16/$12.14 same at τ0.3/τ2) — PASS. (5) near-ATM
  g_loc≈0 settles finite (raw_net=7.17e-4, markLensed g=0→1, no NaN) — PASS. (6) steep pool w=0.6, sold-call driven ITM
  (oracle 80k→160k): settled_cash_leg=sold/live_leg=bought, raw_net=−4.80e-3 (pool-favourable), finite — reciprocal-coord
  one-ITM-leg path PROVEN — PASS; dir swap flips inputs+dir — PASS. (7) no mixed-basis: 8 carved-perp-unit cells carry no
  `$`; exactly 1 $ settlement cell; carved perp slice un-lensed not summed — PASS. (8) standing: both band dirs open,
  swap control, arb, tick, LP round-trip ($1.6M→$1.6M), all 4 overlays lit, reset — PASS.
- **Gotchas this run (CRITICAL for re-runs):**
  - **#perp-notional is in BTC** (default 0.1), #perp-margin in USD — feeding USD-scale numbers (e.g. 100000) inflates
    the club ~1e4× (100000 BTC × 80000 = $8e9), blowing up L0 to ~7e5. Use small BTC notionals (1–2 BTC).
  - **Page vs subtab:** Transact and Portfolio are SEPARATE top-level pages (`.page-nav-link[data-page="transact"|"portfolio"]`).
    tau-input / btn-tick / btn-arb / chart-select live on Transact > **Settings subtab**; perp/band forms on other subtabs of
    the SAME Transact page. setTau/setPool must re-activate Transact+Settings first or the input is "not visible".
  - **band warn banner is `#warn-area`** (NOT #band-warn). OTM-only open guard: sold-call needs strike θ > pool-spot-θ;
    a STEEP pool raises spot-θ (w=0.6→θ=1.5, w=0.78→θ=3.55) so OTM sold-call strikes must be well ABOVE oracle (K>120k at w=0.6).
  - **band direction = `#band-dir-sell` dataset.dir (long/short)**; swap flips dir AND swaps inner/outer inputs. To open a
    specific direction deterministically, click #band-dir-sell to the wanted dir first, then fill strikes.
  - closeBand return is reachable via `Store.closeBand(id)` in evaluate (returns {raw_net,X,Y,settled_cash_leg,live_leg,…}).

## ★★★★ Prior — v28 POLAR-LENS STAGE-1 SMOKE (CANDIDATE `5e1ff278`, NOT HEAD; new line off PLAIN v24)
Build = `engine/builds/temporal_mvp_v28_lens_S1.html` (md5 `5e1ff278dbfea889d49b48224ba931d3`). Static
polar lens (knob τ) reshapes CHART 2 (option/value) + funding; CHART 1 (pool curve) + all trade
mechanics are plain v24 byte-identical (manager pre-verify tradeUpdate Δ0; lens_selfcheck 14/0).
Harness `engine/verify/pw_v28_lens_S1_smoke.mjs`; evidence `evidence/v28_lens_S1/` (17 shots +
RUN_LOG_runA/B + INDEX). Live Playwright ×2 byte-identical verdicts, **0 console errors / 0
pageerrors**. File-safety GREEN (webp L74 `ab663f5c…`, svg **L1060** `c505b08a…`, 3 scripts parse).
Ledger entry appended (feature-keyed #1/#3/#6/#7/#9/#10/#11/#12/#15/#16 + none-beyond; OPERATOR-VOICE
entries 91/93/94/95; +OPEN item -3; +2 recon rows; table rows #3/#6/#7/#9/#10/#15 amended).
**VERDICT: Stage-1 mechanics + lens math + chart-1/chart-2 separation all PASS; ONE blocking FLAG ⇒
HAND-BACK = HOLD.**
- **★ FLAG-1 (the blocker, OPEN, intern one-liner): the τ stepper does NOT auto-redraw chart 2.** A
  τ 0.3→3 step via the real stepper EVENT = **0 px** change on chart 2. Root cause: τ-input handler
  (~L2702) guards its redraw with `if (window.Viz && Viz.drawAll)`, but `Viz` is a const IIFE (L3175)
  **never attached to window** ⇒ `window.Viz===undefined` ⇒ dead branch. Chart 2 refreshes ONLY when
  another action fires `render()`/`Viz.drawAll` (Advance Time / Arb / trade / Reset). SAME CLASS as
  the operator's entry-45 "curve almost completely insensitive to kurtosis change" — would read as
  "knob does nothing" live. Fix: `window.Viz = Viz;` or call `render()`. **Math/draw are CORRECT —
  forced redraw shows the full ≈98px elbow reshape.**
- **Step verdicts (forced-redraw measurement — canvas px-diff saturates only when whole-curve; I used
  raw ImageData + analytic markLensed):** (1) τ number stepper 0.3, NO slider (0 input[type=range]) +
  chart-2 lensed mark + φ_m marker — PASS. (2) τ0.3→0.05 elbow SHARPENS (~98px analytic, 6,645 px
  rendered), wings frozen (Δψ≈5e-5) — PASS. (3) τ0.3→2 ROUNDS in BOTH default (w=0.5/γ=1, 8,103 px)
  and steep (w=0.78/γ=3.55, 6,276 px) pools — PASS (NOT degenerate here: γ from the single v24 w, no
  Δw gap). (4) chart 1 INVARIANT to τ across {0.05,1,2,3} = **0 px every τ** — CONTAMINATION PROBE
  PASS HARD. (5) funding (steep pool S=2.333≠1): ATM=0 (g_atm=0), OTM call +2.23e-3 / put −2.23e-3
  (opposite-signed equal-mag), all finite; markLensed g=0 exact = finite 1 (S*=0 path safe) — PASS.
  (6) in-range trade: reserves moved on FIXED v24 curve (10→9.905 BTC, α/β conserved, inv resid
  1.16e-16), chart 1 redrew moved point, chart 2 lensed mark re-rendered — PASS.
- **INHERITED-v24 (NOT a Stage-1 regression, note-don't-FLAG):** band audit `pv-net-cash` = $618M on
  $800k pool — `dy`/`netPoolY` already USD (`V_usd=p.V·oracle` L1755) then display ×oracle AGAIN
  (L3050-52). VERIFIED byte-identical in v24 base (`temporal_mvp_v24_rebase_fixed_2.html` L2959/L2961).
  Same class entry-46 fixed on v27; this line is off plain v24 where that fix never existed. Slippage
  % readout itself sane (1.9322% ≈ $73.62). Lens does not touch it.
- **OPERATOR-VOICE (operator ASLEEP, no objection on v28 yet):** Stage-1 architecture is the operator's
  own design — entry 94 (L695) "balancer curve unchanged with the stuff we read from it and write (AMM
  tx) to it being through a polar lens (… kurtosis into chart 2 view)"; entry 91 (L621) the lens
  splays around the mode to steepen curve 2. **OPEN GAP (faithful): the operator's intent includes the
  AMM-tx WRITE through the lens; Stage 1 only lenses chart-2 READ + funding — the traded dollar
  settlement is plain v24 (parked operator-tier per the dispatch). Recorded OPEN, not complete.**
  Entry 93 (L688) "5 idc, same geometric thing" = funding-through-lens RULED-accepted; "2 no cap …
  just x y w that move" = γ from single w, cap-free lens. Entry 95 (L702) = the autonomous build go.
- **Gotchas this run (added below):** Viz/render are NOT on window — drive redraws via real handlers
  (btn-tick = render() = the working redraw path); arb/tick/reset live in the Settings subtab; default
  pool w=0.5 ⇒ getMP_raw==oracle_initial ⇒ funding S≡1 (steepen w to make (S−1)/S alive); funding sign
  is call>0/put<0 (NOT the reverse).

## ★★★★ Prior — ENTRY-46 SMOKE-PASS (HEAD `928cde1ccc…`, fix build for entry-45 lacunae)
Build = entry-45/46 fixes (clearBandPreviewOut L3136; audit raw USD L3242-47; anchor k=√(x·y)
L3494; τ disclosure L1329). Engine `<script>` byte-identical to `1eebfcd6` — all deltas UI-layer.
Harness `engine/verify/pw_v27_entry46_smoke.mjs`; evidence `evidence/v27_entry46_smoke/` (INDEX.txt);
ran ×2 byte-identical; **0 uncaught exceptions / 0 console errors**; run_all 22/22 GREEN; svg blob
still L1064. Ledger entry appended (feature-keyed #1/#2/#3/#5/#10/#15/#16 + none-beyond;
OPERATOR-VOICE entries 44/45/46; 3 recon rows → RECONCILED-in-`928cde1c`; +1 new row FINDING-R;
table rows amended). **VERDICT: PASS — all 4 fix-acceptance items + full smoke.**
- **(a) stale-on-reject FIXED-verified:** STALE-CHECK FALSE on ⇅-swap, pill-toggle AND 100-BTC
  !sim.ok paths ×2 runs (every pv-*/N_buy/summary/pill = '—', warn shown, Transact disabled).
- **(b) audit raw USD FIXED-verified:** reference 9.95 band prints EXACTLY the entry-45 engine
  truth 28,453.1684 / 11,470.0908 / $39,923.259202 (was $3.19B); 1 BTC band net $3,772.70.
- **(c) anchor FIXED-verified (pixel):** k=1,741.98; passes 1.15px from the live dot (sampling
  granularity); bbox (133,21)→(673,371) — re-shot `I3_anchor_curve_default.png`.
- **(d) τ disclosure visible** 41px above tau-input on Settings ("Visible effect scales with the
  wing gap…"). τ per-click delta BYTE-MATCHES entry-45 baseline: 3.39px analytic / 3,744px canvas
  one click; 153.73px full sweep — engine unchanged confirmed behaviorally.
- Full smoke: perps both sides (8×, liq 70k/90k); bands both dirs (0.0852% / 0.3834% post-swap);
  steppers toggle + redraw (2,312px) + w-readout 0.725000→130→170; execute commits; **over-carve
  alert captured via dialog listener** ("band needs $80000 … club free is $14000"); earn
  deposit/withdraw exact round-trip; γ>1 clamp reflect-back (0.45→0.501, 0.99→0.950); portfolio
  10 rows no NaN; export/import state-identical ex-eventLog (keyDiffs=[]); reset exact.
- **FINDING-R (NEW, OPEN, display-only — flag to manager/intern):** post-rebase `kpi-spot-usd` +
  `hdr-pool-spot` display POOL-FRAME `getMP_raw`, not honest current-$ `poolMark=getMP_raw×r`
  (engine's own L1660; arb/OTM/funding use it). oracle→90000 ⇒ Spot($) DROPS to $71,232.34;
  post-arb reads $80,000.00 beside Oracle=90000. Engine self-consistent (arb closes poolMark gap
  exactly); honest at r=1 only — every prior display check ran at r=1. NOT a regression.
- Still OPEN carried: boot-log stale "y=$800k, w=0.5" (now L4586); τ-authority + warp-visibility
  design questions (rolling -1/-2).
- Gotcha: playwright resolves only under engine/ (symlinked node_modules) — run helper scripts
  from engine/verify/, not /tmp.

## ★★★★ Prior — ENTRY-45 LACUNAE RUN (HEAD `1eebfcd6`, READ-ONLY, operator live-playing)
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
Blob line md5s `ab663f5c…` (webp L74) / `c505b08a…` (svg); 3 `<script>` parse. **svg line varies by
build: L1064 on the v27 line (`928cde1c` etc.), L1060 on the v28-S1 candidate (`5e1ff278`) — content
canonical either way; key off the line md5, not the number.**
HEAD `928cde1cccb0f35fdc9a23a7634414c8` (entry-46 fix build); prior `1eebfcd6`, `9d22cffd`, `b245bfda`, `3914c7f4`;
v26c_full2 `6cc73563…`; v26b `8df9f8a3…`. **v28-S1 candidate `5e1ff278…` (NOT HEAD); v28-S2 candidate `b53ace9996930249cad85fc1e37e6c61` (NOT HEAD, write/settle-through-lens, svg L1060).**

## Environment quick-ref
`cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/<harness>.mjs` — playwright
global at /opt/node22/lib/node_modules, symlinked into engine/node_modules (re-create if gone);
chromium at /opt/pw-browsers/chromium-1194. Harnesses must live under engine/. file:// load works.

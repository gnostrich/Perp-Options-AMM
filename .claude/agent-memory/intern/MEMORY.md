# MEMORY — intern
_Last updated: 2026-07-07 (UPDATE-1 unified sell-back close + funding-on-extrinsic promoted to HEAD
`bb2f8230`; handed to manager; no git). Rewrite changed bits at task end._

## Done — UPDATE 1: unified sell-back close + funding-on-extrinsic (PROMOTED TO HEAD 2026-07-07, handed to manager)
Spec `specs/SPEC_update1_clean_close_2026-07-07.md` (operator entries 450/452; skeptic HALT-LIFTED
CLEAR-TO-BUILD, `notes/skeptic/VERDICT_R6_overnight_scope_gate_2026-07-02.md`). Brief flagged the
spec's §6/gate DRAIN wording as STALE — used the CORRECTED characterization (IL-like + bounded
self-drain, Δx tracks oracle, NOT "one-signed everywhere/unbounded"). HEAD `51342574` →
**`bb2f82309887a822bd4a60e52aa5fb06`**. **Revert twin created FIRST: `temporal_mvp_v28_lens_twocaseclose.html` = 513425747** (byte-copy of pre-build HEAD).
- **Splice `scratchpad/splice_update1.py`** (work copy `scratchpad/work_update1.html`; 8 anchors
  sliced by line range, count==1 each, blobs never through). ALL 8 edits are in the ENGINE
  `<script>` block (block#1). ui block#2 (holds the credit wrapper) + block#3 BYTE-IDENTICAL to the
  twin (node-compared) — item-2 requirement (credit wrapper byte-unchanged) satisfied by proof.
- **closeBand (item 1):** replaced the two-case value/pool block (was L2208-2268) with ONE
  sell-back path — `const s0=s; X=legPrice(s0,sold…).V; Y=legPrice(s0,bought…).V` (both at the
  snapshot, no moneyness branch), then BOTH legs `tradeUpdateAt(s, dyRev{Sold,Bought}, rho{Sold,
  Bought})`, `rho = (K{sold,bought}/oForK)/getSNorm(s)`, best-effort `if(s_after) s=s_after`.
  DELETED rrSold/rrBought (dead). KEPT soldITM/boughtITM + wing-lock exemption + both-ITM guard +
  Ksold/Kbought/dyRev* EXACTLY. Rewrote the closeBand header + reversal doc comments + the revertArc
  comment ("KEPT for UPDATE-2 charge-back; live close uses tradeUpdateAt"). revertArc + openBand arc
  storage LEFT IN (dormant).
- **fundingPerStrike (item 3):** `m = markLensed(…)` → `mk = markLensed(…); intr = call?max(0,1−
  strike/mode):max(0,1−mode/strike); ext = mk − intr;` and `return kappa*gamma*N*ext*(S−1)/S*dt`
  (was `*m*`). ±g·(S−1)/S sign + S<=0 guard byte-unchanged. Rewrote the behaviour comment.
- **MEASURED (reproduces spec §6/§3.3 exactly):** drain call/sell θ=1.3 N=0.05 Δx=−6.615e-4 (~−$53),
  θ=2.0 −1.22e-3, put/sell θ=0.8 −4.16e-4, put/buy θ=0.7 −3.68e-4; Δx/dyRev² −1.467e-11→−1.434e-11
  (∝dy²); Δy=0 exact all cases. Oracle-tracking: Δx@0.85×=−8.0e-3, @1.0×=−6.6e-4, @1.15×=+6.7e-3
  (FLIPS sign — IL-like, one-signed only at fixed oracle). Funding ext: mode 3.0→0.0165, 1.0(ATM)→
  0.1481 (hump), 0.667(=S*)→0.0000, 0.25→0.0000. Old two-case seam jump 5.672e-2 (~87% of raw_net)
  at the neither→sold branch switch (collar, rb≈0.53); NEW closeBand continuous there (Δ=1.4e-17).
- **GATES (`verify/lens_selfcheck.js` — CM6-v2 block L280-394 replaced):** header LOUDLY states
  CM6-v2 no-free-money/round-trip RETIRED (skeptic condition A). **CM6-v3** (.1 shipped closeBand
  Δy=0 exact — discriminates settle-to-cash; .2 fixed-oracle self-drain Δx<0 OTM+ITM, scoped
  no-move; .3 Δx∝dy²; .4 Δx tracks oracle/sign-flips — IL-like; .5 neg-ctrl drain-present +
  closeBand routesLive via tradeUpdateAt NOT revertArc; .6 credit-wrapper byte-unchanged),
  **CM12** (.1 NEW raw_net continuous — step scales with granularity ratio 3.95; .2 neg-ctrl in-gate
  OLD-reconstruction JUMPS/floors, matches twin 5.672e-2), **FE** (.1 ext=0 past S*; .2 hump at ATM;
  .3 source ±g·(S−1)/S w/ ext + call/put opposite sign; .4 neg-ctrl old full-mark nonzero past S*).
  **Result 24→31 PASS 0 FAIL.** Also updated the CM6-v2 header-reference in `monolith_consistency.js`
  (report-only) → CM6-v3.
- **NEGATIVE CONTROLS (teeth confirmed):** the retained OLD twin build scores **24 PASS / 7 FAIL**
  — exactly CM6-v3.1 (Δy≠0 settle-to-cash), CM6-v3.5 (routesLive=false, old uses revertArc),
  CM12.1 (old jumps), CM12.2, FE.1/3/4 (full-mark funding). CM6-v3.2/3.3/3.4/3.6 correctly PASS on
  both (they characterize the reversal LAW + the unchanged credit wrapper, not the close-path).
- **FILE-SAFETY:** blobs `ab663f5c`@74/`c505b08a`@1060 canonical before+after; 3 scripts parse
  (748/453/1944, max line 509); IIFE intact; surgical diff = exactly the 8 engine regions; ui/3rd
  blocks byte-identical to twin. run_all.sh line-8 md5 pin → `bb2f8230…` (+ count 24→31); the two
  "24" count comments in run_all updated. BUILD_LINEAGE HEAD row + CHANGELOG_v28_lens entry appended.
- **⚠ FILE-SAFETY HOOK false-positive (PRE-EXISTING, NOT my regression — same as constmult/R-218
  memory):** the hook's line-104 `grep -Eq 'FAIL|…'` matches the literal `"0 FAIL"` in the success
  summaries (and "FAILS" in check names) ⇒ it BLOCKS (exit 2) even though run_all RC=0 and real
  `^FAIL` verdict count = 0. My workflow used Bash splice+cp (NOT the Edit/Write tool on HTML) so the
  real PostToolUse hook never fired during the build; I only reproduced the FP by invoking the hook
  manually. Reported as a finding, NOT patched (manager's guardrail, out of intern scope).
- **Open for manager:** git (sole actor); operator-tier FLAG carried in spec §10 F1 — the drain
  ships UN-neutralized in UPDATE 1 by operator sequencing (entry 452); harmless self-drain in the
  single-user sim, a real LP-value leak in the multi-party backend, fixed by UPDATE 2 (parked, entry
  451) — must be in the CTO note as "parked TBD". **Open for tester:** live pass — open a collar
  band, close it: BOTH legs reverse on the AMM (close-log "[both legs reversed on AMM]"), no
  settle-to-cash; chart-1 reserves do NOT round-trip exactly (small x-drain BY DESIGN); a matched
  open→close is payout-continuous across the OTM/ITM crossing (no 45% jump); funding readout is a
  hump peaking at ATM, ZERO for deep-ITM strikes; 17/17 UI smoke.

## Done — -FPNL-NEGZERO negative-zero display fix (PROMOTED TO HEAD 2026-07-07, handed to manager)
Tester finding -FPNL-NEGZERO (DIFF_LEDGER `4bc939ec` reconciliation list, row ~L1855, status
OPEN — tester's to flip). Operator context: LAST agreed fix before CTO handover (entry 427).
HEAD `4bc939ec…` → **`513425747b23b74cb07c0fda4959825b`**. Display layer ONLY, 2-line diff;
engine + state script blocks byte-identical (only ui block touched, and only 2 expressions).
- **Root cause:** funding cells negate the trader-pays ledger for display; fresh band ⇒ stored
  0 ⇒ `-0` ⇒ `(-0).toLocaleString('en-US',{minimumFractionDigits:6})` = `"-0.000000"` via fmtNum.
- **Fix (local guards, fmtNum untouched — other columns rely on it):** L4650
  `bandFundingPnl = bandFundingStored === 0 ? 0 : -bandFundingStored` (+3 comment lines; feeds
  band-row L4682 AND Total-row L4723 cells) and component cell (was L4708)
  `fmtNum(c.funding === 0 ? 0 : -c.funding, 6)`. `=== 0` keeps NaN loud (falls through).
- **Splice** `scratchpad/splice_fpnl_negzero.py` (work copy, 2 anchors count==1, blobs never
  through). **Self-check** `engine/evidence/check_fpnl_negzero_2026-07-07.js` — extracts the
  LIVE fmtNum + cell expressions from the target build (regex keyed on the unique tooltip text
  "display negates)\">", no retyping) and renders: old HEAD pre-tick `-0.000000` ×12 (negative
  control, rc=1); new HEAD pre-tick `0.000000` ×12; post-tick payer `-0.083551`, receiver
  `0.140608` (entry-425 sign pin intact, same numbers as the 2026-07-03 check).
- **FILE-SAFETY:** blobs `ab663f5c`@74/`c505b08a`@1060 canonical before+after; 3 scripts parse
  (778/453/1944); IIFE intact; surgical diff = exactly the 2 regions; hook no block. **GATES:**
  run_all exit 0 on work copy AND promoted HEAD — lens **24 PASS**, a16 **5 PASS**, monolith 8/8
  report-green. run_all.sh line-8 pin rewritten → `51342574…`; BUILD_LINEAGE HEAD row re-keyed;
  CHANGELOG_v28_lens entry appended.
- **Open for manager:** git (sole actor). **Open for tester:** trivial live re-check — fresh band
  funding cells show `0.000000` (no minus) at band/component/Total rows; after funding ticks the
  payer cell renders negative as before; flip the DIFF_LEDGER -FPNL-NEGZERO row OPEN→fixed.

## Done — FUNDING-P/L COLUMN (entry 425, PROMOTED TO HEAD 2026-07-03, handed to manager)
Operator entry 425 ("funding is column adds to p/l in portfolio for position line wise"); skeptic
R6 scope-gate #2 (2026-07-03 section of `VERDICT_R6_overnight_scope_gate_2026-07-02.md`) CLEARED
w/ conditions — ALL honored. HEAD `0e0a0062…` → **`4bc939ec6fb3dda8d1e5b37bfd3bc0cf`**. Display/
read layer ONLY: engine + state `<script>` blocks BYTE-IDENTICAL to 0e0a0062 (node-compared);
stored funding ledger + `fundingTick` + `closeBand` untouched. Splice
`engine/splices/splice_funding_pnl.py` (work copy in session scratchpad, 6 anchored regions
sliced by line range, count==1 each, blobs never through).
- **Item 1 (no duplicate column):** bands-table funding cells PRE-EXISTED at band (Σ legs,
  old L4662), component (L4688), Total (L4703) — verified complete, no column added. renderBands
  reads `leg.funding_*` directly; no new export needed (skeptic predicted both).
- **Item 2 (sign pin):** ledger is TRADER-PAYS (`trader_pays = side_sign·f`, positive = line
  PAID). Column now displays the SIGNED P/L effect = **−Σ stored** (+ received / − paid) at all
  3 row levels (band `bandFundingPnl = −bandFundingStored`, component `−c.funding`, total).
  Line P/L: Total dollar cell = `L₀·raw_net·equityAtClose + bandFundingPnl·oracleLive` —
  funding's $ conversion is the ledger's OWN law (fundingTick log: inflow × oracle), NOT the
  stage-2→3 equity multiply (funding accrues on absolute N, not per carved-equity unit; folding
  into raw_net pre-multiply would scale funding by L₀·equity — wrong law).
- **Item 3 (disclosure, gate condition):** header `<th>` title + visible pf-units-note sentence +
  Total-cell tooltip all state: displayed P/L INCLUDES accrued funding; close cash settles
  EX-funding until the transfer layer (parked part-2) ships. `closeBand` verified funding-term-
  free myself (full-file grep: zero funding tokens in L2040–2332). Header label → "Funding P/L".
- **Sign self-check (mandatory, PASS):** `engine/evidence/check_funding_pnl_2026-07-03.js` —
  node vm on the promoted HEAD, replica of the displayed formula; 2 opposite bands (call-spread-
  sold vs put-spread-sold), setOracle 88k, 24×fundingTick(1h): payer band stored **+0.08355** ⇒
  column −0.08355 ⇒ displayed P/L −573.37 → **−7925.82 FALLS**; receiver stored −0.14061 ⇒
  +1347.43 → +13720.97 rises. Pre-tick both stored exactly 0.
- **FILE-SAFETY:** blobs `ab663f5c`@74 / `c505b08a`@1060 canonical before+after; 3 scripts parse
  (778/453/1941, maxline 509); IIFE intact; surgical diff = exactly the 6 regions (2 HTML
  header/caption + 4 in ui script); hook no block. **GATES:** run_all exit 0 on work copy AND
  promoted HEAD — lens_selfcheck **24 PASS**, a16 **5 PASS**, monolith 8/8 report-green.
  run_all.sh line-8 pin rewritten → `4bc939ec…` (honest slice description, priors retained
  in-line). BUILD_LINEAGE HEAD row re-keyed + CHANGELOG_v28_lens entry appended.
- **vm harness gotchas (reusable):** `const Engine/Store` are context-lexical — fetch via
  `vm.runInContext('({Engine,Store})',ctx)`, not `ctx.Engine`. `openBand` takes DOLLAR strikes
  ({inner,outer}; oracle 80k ⇒ call 104k/128k); the first band moves pool spot (→1.3634) so a
  second band's call strikes must sit further out (128k/160k) or the OTM check rejects.
- **Open for manager:** git (sole actor). **Open for tester:** live pass — Funding P/L column
  signs flip vs old display (payer shows negative), Total P/L moves by −Σfunding·oracle on tick,
  header/units-note/tooltip disclosure text renders, perps table untouched, no console errors.

## Done — CAPTION/COMMENT SLICE (PROMOTED TO HEAD 2026-07-02, second slice of the trade-point campaign)
Strings/comments ONLY, ZERO behavior. HEAD `e148c9b734abdff522c31c56be41fb66` →
**`0e0a006277a1c2215a3244d510691697`**. Splice `scratchpad/splice_captions_pass.py` (work copy,
7 anchored regions each count==1, old strings sliced by line range, blobs never through).
- **S1/S2 (-TP339-CAPTION, tester flag):** L1340-41 Invariant Watch caption + L1368 Pool State
  subtitle rewritten to spec §2.7 vocabulary — trades conserve the LOCAL pair (α_T, β_T) at the
  trade point, global α, β MOVE on off-ATM trades BY DESIGN (entry 339); machine-epsilon scoped
  to ρ=1 paths (spot/arb/rebase) + open→close arc round-trips. Subtitle: "closed-form ·
  trade-point (α_T, β_T)-conserving · Identity IV on ρ=1 paths".
- **S3/S4 (R6 item 4 / 325-F, entry 336):** chart-2 unit toggle button L1415 "% of escrow unit"
  → "fraction of escrow unit"; caption L1428 "% view:"→"Fraction view:", "in % view"→"in
  fraction view". DOM ids (`pricing-unit-pct`) + all axes/values untouched (axis draws 0.25/0.50
  fractions — label now matches).
- **S5/S7 (R6 item 3, vol direction, entry 289):** lens header L1632-33 "(more vol / sharper)"
  → "Vol calibration runs the OTHER way (entry 289): a MORE volatile asset takes a LOWER m —
  fatter wings"; m-knob state comment (old L2337-area, now ~L2404) gained the same entry-289
  direction line. Matches the corrected -B289 UI caption at L1321.
- **S6 (R6 item 3, closeBand header, old "L1975-78"):** barrier-era paragraph ("mark() already
  saturates at 1 … IS the effective-strike substitution") rewritten: markEff = LENSED smooth-paste
  (continuation past strike to S* then intrinsic); old saturation = SUPERSEDED historical; mark()
  survives only as the plain regime-test primitive. **The v28 correction paragraph below it
  (markEff — LENSED, W4, MUST-APPLY-A) preserved untouched — skeptic's binding condition (CTO
  port source).** Did NOT touch the other "mark saturates" mentions (L2121/L2181 regime-test
  narration — accurate for the plain primitive, out of R6 scope).
- **FILE-SAFETY:** blobs `ab663f5c`/`c505b08a` canonical before+after; 3 scripts parse
  (778/453/1925, maxline 509); IIFE intact; surgical diff = exactly the 7 regions, ALL
  caption/comment lines; no signature/behavior change; hook: no block.
- **GATES:** run_all exit 0 on work copy AND promoted HEAD — lens_selfcheck **24 PASS**, a16
  **5 PASS**, monolith 8/8 report-green. run_all.sh line-8 pin rewritten → `0e0a0062…` (honest
  slice description, prior e148c9b7 text retained in-line). BUILD_LINEAGE HEAD row re-keyed +
  CHANGELOG_v28_lens entry appended (same campaign, second slice).
- **Open for manager:** git (promotion commit folds this per brief); relay exact before/after
  strings (in hand-back). **Open for tester:** trivial visual re-check — Invariant Watch text,
  Pool State subtitle, chart-2 "fraction of escrow unit" button; behavior identical.

## Done — TRADE-POINT CONSERVATION (PROMOTED TO HEAD 2026-07-02, handed to manager)
Operator entry 339 (go 377); spec `specs/SPEC_tradepoint_conservation_2026-07-02.md` (CONTROLLING —
implemented §2.1–2.7 + §3.1 exactly); skeptic `notes/skeptic/VERDICT_R6_overnight_scope_gate_2026-07-02.md`
conditions honored (K_tx-FIRST legacy fallback, never bare K_inner; CM8-v2(4)+CM6-v2(5) shipped).
HEAD `engine/builds/HEAD_temporal_mvp_v28_lens.html` md5 `7015c22c…` → **`e148c9b734abdff522c31c56be41fb66`**.
**Revert twin created FIRST: `temporal_mvp_v28_lens_reservepoint.html` (byte-copy, md5 == 7015c22c).**
- **Splice `scratchpad/splice_tradepoint.py`** (work copy, every anchor count==1, blobs never
  through; spec §2.1 code extracted PROGRAMMATICALLY from the spec's js fence — never retyped).
  22 diff hunks, all intended: R1 prod-map comment; R2 lens-header line; R3 NEW `tradeUpdateAt`
  (law at T: x_T=x·ρ^(w−1), y_T=y·ρ^w, α_T/β_T local, Δx, w′=α_T/(x_T+Δx), α,β re-derived) +
  `revertArc` (x−dxA·rr, y−dyA, w−dwA, guards→null) inserted after tradeUpdate; R4 executeLeg —
  `rho_tx=Math.exp(u_tx)` after K_tx, depth guard → trade-point depth `w·y·ρ^w` ("at the tx-ray"
  in reject string), swap → `tradeUpdateAt(state,dy,rho_tx)`, return + `rho_tx` + `arc{dxA,dyA,
  dwA,oOpen:fx}`; R5 closeBand — comment rewritten for frozen ARC, Ksold/Kbought K_tx-first
  derivation KEPT verbatim, + rrSold/rrBought = oForK/arc.oOpen; R6–R9 all four reversal sites
  arc-first w/ legacy `tradeUpdate(s,dyRev…)` fallback + per-path reject reasons; R10 exports
  `tradeUpdateAt, revertArc`; R11 openBand stores `arc:` beside K_tx both legs; R12 framePool →
  per-leg sequential `(state, legs, s)` via tradeUpdateAt (s=1 lands EXACT on preview; null-degrade),
  drawPricing derives legs from `__previewBand.legs` by leg1State/leg2State identity, static-degrade;
  R13 previewBand stashes `legs:[{dy,rho:rho_tx}×2]`.
- **NOT touched (spec list):** tradeUpdate/arbitrageToOracle/rebase (BYTE-IDENTICAL to v24,
  gate-verified), gLoc/markLensed/legPrice, tx-map θ_tx/K_tx freeze, N_buy formula, funding,
  carve/club/L0, settlement marks, dy sizing N·K_tx.
- **Acceptance anchors measured:** exhibit (10,10,½),ρ=4,dy=+1 ⇒ w′=11/21 Δ=0, x′=215/22 Δ=0,
  y′==11, |Δx+5/22|=6.4e-16, NOT 22/43 nor 6/11; ρ=1≡tradeUpdate 2.3e-16 (≤1e-15 anchor ✓); arc
  round-trip 0.0 machine-exact; rebase-interleaved rel 0.0 (band path 1.4e-16); live re-reg leak
  −2.78e-2 == spec table; spec §5 C2/C3/C6 rows reproduced exactly; framePool s=1/s=0.5 maxAbs 0.
- **GATES (`verify/lens_selfcheck.js` rewritten per spec §3.1):** CM8→**CM8-v2** .1 spot-trio
  byte-id ·.2 exhibit HARD ·.3 ρ=1 grid ·.4 local-pair grid (4.5e-16, 72 pts) ·.5 executeLeg
  routing (tradeUpdateAt(state,dy + NO tradeUpdate(state,dy)); CM6→**CM6-v2** .1 band arc close
  restores x,y,w ·.2 single-leg ≤1e-12 ·.3 open→rebase(r)→close==rebase(s₀,r) r∈{0.8,1.25} leg AND
  closeBand paths (r=0.8 call band / r=1.25 put band so regimes don't flip) ·.4 in-gate negative
  control: live re-registered reversal LEAKS >1e-3 ·.5 no-free-money Σ own dx==0 ∧ Σ own dy==0
  incl. one intervening spot trade + ownΔw-only. Guarded `hasArcLaw` so a lawless build fails
  LOUD-not-crash. (P)/(P-num)/L4/CM1–5,7,9–11 survive; a16 untouched. **Result 16→24 PASS 0 FAIL**;
  a16 5 PASS; run_all exit 0 (work copy + promoted HEAD, default path); monolith 8/8 report-green,
  lines (2)/(7) labels re-scoped **SPOT LAW ONLY** (report-only edit per spec).
- **NEGATIVE CONTROLS:** pre-build HEAD (twin) = 16 PASS / **8 FAIL = exactly the 8 new-law checks**,
  exit 1, no crash. 7 targeted mutants (`scratchpad/negctrl_tradepoint.sh` + mutant_*.html): mut1
  naive-global-lean → v2.2+v2.4 red; mut2 drop-dwA → CM6 .1/.2/.3/.5 red; mut3 ignore-rr → .3 red;
  mut4 route-back-to-spot → CM8-v2.5 red ONLY; mut5 dx·1.000001 → CM8 .2/.3/.4 red; mut6
  collapse-to-global-law → CM6-v2.4 + CM8 .2/.4 red; mut7 dxA·1.000001 in revertArc → CM6 .1/.2/.3/.5
  red. Every new sub-check controlled.
- **FILE-SAFETY:** blobs `ab663f5c`@74/`c505b08a`@1060 canonical before+after; 3 scripts parse
  (775/452/1925, maxline 509); IIFE intact; surgical diff = 22 intended hunks only; hook exit 0
  ("FILE-SAFETY GATE PASS"). run_all.sh line-8 pin rewritten → `e148c9b7…` (honest description);
  count strings 16→24 in run_all comment + monolith. BUILD_LINEAGE HEAD row + CHANGELOG_v28_lens
  appended (twin + provisional-#16 label noted).
- **Open for manager:** git (sole actor); morning report must carry the 5 adopted spec defaults +
  §4 behavioral deltas 1–8 for operator ratification (inventory-#16 label flip stays PROVISIONAL per
  spec §3.2(7)/§4(8) + skeptic condition (b)); DIFF_LEDGER row keyed to #16 is tester's at
  verification; Lean/INDEX re-scope of trade_conserves/L1/L7 to SPOT law = research-lead's (spec §6).
  **Open for tester:** spec §3.2 protocol — vm-probe exhibit; band open/close both wings OTM+ITM;
  α,β VISIBLY move on off-ATM trade (poolInvariants readout iv-alpha/iv-beta now drift BY DESIGN —
  disclosed delta §4-2, not a bug); depth-guard reject prints tx-ray depth; m=1 vs m=2 co-move;
  per-leg preview animation (step-1 animates leg1 only); full 17/17 UI smoke. **Pre-existing
  stale-ish:** run_all L17-19 "(14)+(8)" routing comment still stale (untouched); engine comments
  L1622/L2337 vol-phrasing — RESOLVED by the caption/comment slice above (2026-07-02).

## Done — -B301-DASH parity-tail dash legibility (IN-PLACE on HEAD, 2026-07-02)
Tester FLAG -B301-DASH: $-view PUT parity tail's `setLineDash([5,3])` reads solid on the steep
seam→1.25S-exit drop (row coverage 0.9647; legible <0.9; % tails ~0.51 fine). HEAD
`a6ca02f33aa6500d4803a5273bc10989` → **`7015c22cbd8e78238bdd621f6126713d`**. Draw-layer only —
engine AND state `<script>` blocks BYTE-IDENTICAL (node-verified). Splice
`scratchpad/splice_dash_legibility.py` on a work copy, 2 anchored edits in `drawState`
(renderPricingFrame, ui block), count==1 each:
- **E1 (was L3808):** `dashTail` live pattern `[5,3]` → **screen-space `[8·cssScale, 6·cssScale]`**,
  `cssScale = cv.clientWidth>0 ? W/cv.clientWidth : 1` (canvas 900px is CSS-downscaled ~2×; the old
  3-canvas-px gap blurred solid under downscale AA). Uniform across ALL parity tails — both wings,
  both %/$ views; preview `[2,5]` + continuation dashes untouched (tester's "don't disturb %" bound).
- **E2 (was L3794):** plotted view value clamped `Math.min(viewVal, 3·yMax)` — the $ put tail grows
  ~tan(90°) (θ→1.6e16 ⇒ py→−1e20), quasi-infinite coords defeat dash rasterization on the
  frame-crossing segments; clamp keeps points ≤2·plotH above the top edge (invisible under the
  existing ctx.clip; in-frame geometry unchanged to sub-pixel; inert in % view and for the call $
  wing which tops at 0.8·yMax).
- **RESULTS:** blobs `ab663f5c`@74/`c505b08a`@1060 canonical before+after; 3 scripts parse
  (714/450/1899, longest 246); engine IIFE intact; lens_selfcheck **16 PASS**, a16 **5 PASS**,
  run_all exit 0; monolith 8/8 report-green; surgical diff = exactly the 2 regions; hook no-block.
  **run_all.sh line 8 re-pinned** `9fdde1de`→`7015c22c` (covers display slice a6ca02f3 + this fix;
  the a6ca02f3 pin was never separately made — folded into this one, noted honest in the string).
- **Open for tester:** targeted re-check — $-view put-tail per-pixel row coverage (<0.9) +
  byte-stability. **Open for manager:** git.

## Done — (b) DISPLAY SLICE + -B289 CAPTION FIX (IN-PLACE on HEAD, handed to manager 2026-07-02)
Operator go entries 298+301; skeptic R6 cleared scope; design source
`notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md` items 1–2. HEAD
`engine/builds/HEAD_temporal_mvp_v28_lens.html` md5 `9fdde1de…` →
**`a6ca02f33aa6500d4803a5273bc10989`**. Draw-layer + captions ONLY — engine
`<script id="engine">` BYTE-IDENTICAL (node-verified); markLensed/gLoc/pool/settlement/funding/
tx-map untouched. Splice `scratchpad/splice_display_slice.py` on a work copy (4 anchored
regions, count==1 each, blobs never through): **R1** L1321 SLOPE-MULT caption — vol direction
fixed per entry 289 (larger m ⇒ steeper everywhere; MORE volatile asset ⇒ LOWER m, fatter
wings); **R2** L1412-1424 chart-2 canvas block — added %/$ toggle buttons
(`pricing-unit-pct`/`pricing-unit-usd`, preview-stepper style), legend rewritten
(quoted-pool solid vs parity-escrow dashed per wing; "peak = 1 (mode)" item REMOVED), caption
rewritten to the true-V depiction; **R3** L3664-3837 renderPricingFrame — `psiShape` tent
RETIRED, curves now plot TRUE V per wing across ALL strikes via the SAME
`Engine.markLensed(wing,θ,sNorm,gLoc)` read settlement uses (single-basis, NaN-loud, no
draw-local formula), continuation solid / intrinsic-parity tail dashed (preview trace: tail at
alpha .5), seams drawn C¹ at θ_put*=sNorm·(g+1)/g, θ_call*=sNorm·g/(g+1); %/$ views:
`%` = escrow-unit fraction yMax=1.05, `$` = put×K / call×S (S=sNorm·oracle), yMax=1.25·S with
ctx.clip so the unbounded put tail exits cleanly at K=2.25S; per-view y-ticks + rotated y-axis
label; ref line = 1.0 (%) / spot S ($); mode φ_m line now ends AT the curve (peak-at-1 apex
RETIRED); drawStrikeMark re-anchored to the same markLensed read in the active view, wing now
from `b.sold_wing`/`b.bought_wing` (fallback: old OTM-side convention), $ overflow clamps to
top edge; **R4** after L4237 — `setPricingUnit()` wiring on `window.__pricingUnit` (default
'pct'), redraw via `Viz.drawPricing(Store.state, __previewPool)`, animation frames pick the
unit up live.
- **RESULTS:** lens_selfcheck **16 PASS 0 FAIL**; a16 **5 PASS 0 FAIL**; run_all exit 0 (on
  work copy AND promoted HEAD); monolith 8/8 report-green. Blobs `ab663f5c`@74/`c505b08a`@1060
  canonical before+after; 3 scripts parse (714/450/1889, longest 246); IIFE intact; diff = the
  4 intended regions only. Sanity harness `scratchpad/sanity_draw.js` (71 checks, 4 pool/m
  combos): sweep finite both views incl. φ→90°, %≤1.05, seam value 1/(g+1) + S/K=g/(g+1)
  (0.667 @g=2), C⁰ across seams, X crossing at ATM height (g/(g+1))^g/(g+1), $ tails exactly
  K−S / S−K, drawn V ≥ intrinsic (min −5.6e-17), markers ON curve (diff 0), m-monotonicity
  (steeper wings / seams inward / crossing falls) — ALL PASS.
- **FLAG-3(iii) for tester's ledger:** DIFF_LEDGER OPERATOR-VOICE rows entry-226 and L2063 are
  re-dispositioned **RETIRED-by-entry-298/301-scope** (tent deliberately replaced), NOT
  silently regressed.
- **Open for manager:** ~~re-pin run_all.sh line-8 md5 to `a6ca02f3…`~~ (DONE with the -B301-DASH
  fix, pinned to `7015c22c…`); git. **Findings (not
  touched, out of scope):** engine comments L1622/L2337 still carry the OLD "larger m ⇒ …
  (more vol)" phrasing (contradicts the corrected -B289 caption; comment-only); run_all md5
  pin stale until re-pinned. **Open for tester:** live acceptance — X-shape both views, %/$
  toggle, markers-on-curve, seams at 0.667K/0.857K-class positions, m steepens visibly, 0
  console errors.

## Done — PKG-ITM v2 LINEAR RE-SEAM (IN-PLACE on HEAD, handed to manager 2026-07-02)
Executed `specs/SPEC_pkg_itm_v2_engine_coords_2026-07-02.md` exactly (operator go entry 298;
skeptic R6 CLEAR). HEAD `engine/builds/HEAD_temporal_mvp_v28_lens.html` md5 `dd6fb955…` →
**`9fdde1de0a96874d9ad7b47a6cc8f721`**. Revert twin created FIRST:
`engine/builds/temporal_mvp_v28_lens_powerarm.html` (byte-copy, md5 `dd6fb9557c…` == old HEAD).
- **THE ONE ENGINE EDIT** (splice `scratchpad/splice_pkg_itm_v2.py`, work copy, old block sliced
  by line range 1656–1676, block-md5 `3e4a3ab3…` verified, count==1, NEW block extracted
  PROGRAMMATICALLY from the spec §2.2 fenced code — never retyped): `markLensed` power-form
  seams/intrinsic REPLACED by the v2 linear re-seam — put seam `sNorm* = θ·g/(g+1)` (S*=K·g/(g+1),
  0.667K @g=2), call `θ·(g+1)/g`; continuation `(sNorm/sStar)^(∓g)/(g+1)`; past seam intrinsic IS
  linear (put `1−sNorm/θ`, call `1−θ/sNorm`). Branch order load-bearing (intrinsic in IF-body so
  NaN falls to pow arm — NaN-loud). NO caller/export/signature change; V=max holds identically
  (O2), so NO Math.max anywhere.
- **Gates:** `lens_selfcheck.js` CM4→**CM4-v2** (v2 seams, C⁰ 1e-9 + boundary 1/(g+1)) +
  **CM4-v2-C1** (one-sided quotients at seam, ε=1e-6·sStar: put −1/θ, call g²/((g+1)²θ), rel≤1e-4;
  g-set = m·γ over MS ∪ {2,6} so the 0.667θ/0.857θ seams are probed directly) + **CM10** (value ≥
  intrinsic, intrinsic recomputed IN-GATE from ρ, 25-pt entry-286 grid + log sweep, strict >0 in
  continuation, ==0 at/past seam) + **CM11** (wing exact power-law V(2ρ)/V(ρ)=2^∓g, g∈{2,6},
  1e-12). CM1–3/5–9 + CM4-nan SURVIVE unchanged (spec-predicted, confirmed). `a16_atm_gate.js`
  UNTOUCHED (A16.2's `1/((g+1)·((g+1)/g)^g)` ≡ new ATM value — 5/5 green as spec predicted).
  `monolith_consistency.js` line (6) repointed to v2 seams + O1 PasteLin provenance, rider →
  CM4-v2; stale "lens 13" count strings in monolith + run_all comments → 16.
- **run_all.sh line 8 re-pinned** to `9fdde1de…` + one-line honest description (PKG-ITM v2,
  entries 286/287/298, powerarm twin named).
- **RESULTS:** lens_selfcheck **16 PASS 0 FAIL**; a16 **5 PASS 0 FAIL**; run_all exit 0; monolith
  8/8 report-green. Blobs `ab663f5c`@74/`c505b08a`@1060 canonical; 3 scripts parse (714/450/1824,
  longest 509); IIFE intact; diff vs old HEAD = 3 hunks ALL inside L1656–1681 (the one block).
  **Spec §5 worked table re-derived vs live engine: 14/14 cells to 4dp** (max|Δ| 4.8e-5, both g
  columns, both arms + seams). **Negative control:** powerarm build fails EXACTLY the 4 new checks
  (CM10 minDiff −0.58 = the entry-286 below-intrinsic defect) and passes the surviving 12 — gate
  has teeth. File-safety hook: no block fired this session.
- **Open for tester:** §6 acceptance protocol (DOM-read oracle sweep, seams at 0.667K/0.857K NOT
  0.444K, sign table belowIntrinsic empty) + standing UI smoke. **Open for manager:** git (sole
  actor); BUILD_LINEAGE/INTEGRITY/DIFF_LEDGER rows + CLAUDE.md §4/§8 true-up at promotion;
  spec §9 risks 1/6 (Lean bridge files describe the retained powerarm arm — research-lead's).

## Done — CLEANUP PASS (3 edits, IN-PLACE on PROMOTED HEAD + gate, handed to manager 2026-06-13)
Authority: operator entry 234 "yes pls cleanup" + skeptic R6 scope-gated PASS. ZERO behavior change
(comments + a detector heuristic only). HEAD = `engine/builds/HEAD_temporal_mvp_v28_lens.html`,
md5 `8f897edc…` → **`80f050e26332d21c68bd7b064467470a`** (md5 WILL change — comment text; manager
re-pins run_all integrity string).
- **EDIT 1 (HTML funding comment, splice `/tmp/splice_cleanup_html.py`, 1-based lines 2265–2268 /
  0-based slice [2264:2268]):** replaced DEAD √-kernel "f → 0 at ATM (flat top) … → γ in wings …
  entry 93 #5" text with constant-m language (g_loc=m·γ CONSTANT, NO ATM flat-top/wing-ramp,
  funding zeroes at the w=½ anchor S→1 NOT at ATM, m re-scales by design; entries 232/233). L2258–
  2264 (the "v24 ±2 … MUST-APPLY-1" lines) and the fn body L2269+ UNTOUCHED.
- **EDIT 2 (HTML chart-2 put-wing comment, same splice, 1-based line 3734 / 0-based [3733]):**
  one line `// Put wing: φ ∈ [0°, φ_m], lensed ψ rises toward the flat top at the mode` →
  `// Put wing: φ ∈ [0°, φ_m], lensed ψ (constant exponent g=m·γ) rises toward the mode (no flat top)`.
- **EDIT 3 (`engine/verify/lens_selfcheck.js` detector, NOT HTML, plain Edit ~L66–69):** hardened
  `isConstMult` so it is NOT a sole literal-text match. Now `isConstMult = sourceClean &&
  numericConstInStrike`: `sourceClean` = the old regex (return m*gamma AND no √-kernel);
  `numericConstInStrike` = INLINE pool `mkPool(10,80000,0.725)` + `E.gLoc(_p,0.5,2)===E.gLoc(_p,3.0,2)`
  finite-and-equal (try/catch → false on throw). Probe pool built INLINE near L69; did NOT touch the
  CM-suite pool/state setup at L108-112 or any scored assertion (skeptic R6 scope boundary). The
  detector is a router (`if(!isConstMult){SKIP;exit}`), not a scored check — on this good build it
  resolves TRUE so the CM suite runs (13 PASS confirmed).
- **FILE-SAFETY:** splice on copy `/tmp/work_cleanup.html` (each anchor count==1, trailing \n
  preserved, blobs never through), then promoted. Blobs `ab663f5c`@74 / `c505b08a`@1060 canonical
  before AND after; 3 scripts parse (707/450/1804 lines, longest 509); IIFE intact.
- **GATES:** `cd engine && sh verify/run_all.sh` GREEN exit 0 — lens_selfcheck **13 PASS 0 FAIL**,
  a16_atm_gate **5 PASS 0 FAIL**. (run_all integrity prints the OLD expected `8f897edc` md5 but does
  NOT gate on it — exit 0; manager re-pins.)
- **Open for manager:** re-pin run_all.sh integrity md5 to `80f050e2…`; git (sole actor). **Open for
  tester:** UI smoke — comments are non-functional, but confirm chart-2 put wing + funding readout
  behavior UNCHANGED (no flat top at ATM under constant-m).

---

## Done — CONSTANT SLOPE-MULTIPLIER LENS (NEW file + gate rewrite, handed to manager 2026-06-13)
Build **`engine/builds/temporal_mvp_v28_lens_constmult.html`** (NEW, from HEAD `5fea0e8d`; HEAD
UNTOUCHED, no promote, no git). md5 **`8f897edcad49c73853096a05e7ec233d`**. Authority: operator
entries 229/231; skeptic `notes/skeptic/VERDICT_constant_slope_multiplier_entry229_2026-06-13.md`
(the spec). REPLACES the position-dependent `√(τ²+u²)` elbow-lens with a **constant slope multiplier
m**: `g_loc(K)=m·γ` at EVERY strike (γ=getW/(1−getW); NO u-dependence, NO elbow, NO flat-top, NO
frozen-γ wing). m=1 = plain v24 curve. Splices on `/tmp/work_constmult.html` (count==1, blobs never
through): `/tmp/splice_cm_helpers.py` (hTau/hpTau REMOVED, lensU kept, gLoc→m·γ), `_trademap.py`,
`_chart.py`, `_state.py`, `_ui.py` + a few Edits.
- **gLoc (was L1639):** `gLoc(state,θ,m){ γ=w/(1−w); if(!(γ>0)||!(m>0)||!(θ>0))return NaN; return
  m*γ; }`. `hTau`/`hpTau` (√ kernel) DELETED from engine + exports; `lensU` kept (trade map only).
- **Trade map (executeLeg, was L1799-1813):** `u_tx = tau*a_tx` (tau param carries m), `theta_tx =
  mode·exp(u_tx) = mode·(chosen/mode)^m`. FROZEN as K_tx (close reuses it — round-trip exact). m=1 ⇒
  θ_tx=chosen (reduces to at-strike). Bigger m ⇒ further out (2× pick: m=2⇒4×, m=3⇒8×).
- **Chart-2 gAt (L3710):** fallback now `tau_v*gamma` (was √ form); flat-top psiAt branch is now a
  defensive degenerate guard (g never 0). Comment rewritten (no elbow/flat-top).
- **Knob relabel:** UI `id=tau-input`→`m-input`, label "KURTOSIS τ"→"SLOPE MULT m", min1/max6/step
  0.25/value1; `state.tau`→`state.m` (default `1.0`), `setTau`→`setM`. Threading PARAM name kept as
  `tau` in engine sigs (a neutral scalar carrier) — renaming it would COLLIDE with the existing
  `const m = markLensed(...)` locals in legPrice/executeBand. DECISION flagged for skeptic: the
  knob's NAME/meaning is m everywhere user-facing; the internal threaded scalar stays `tau` (no
  contradiction, just a carrier). Comments at gLoc/funding/chart say "tau carries the multiplier m".
- **Pool fns BYTE-IDENTICAL to v24** (tradeUpdate/arbitrageToOracle/rebase — gate-confirmed,
  source+numeric). markLensed UNCHANGED (g-parametric; fed g=m·γ). Settlement smooth-paste survives
  (C⁰ seam machine-zero with g=m·γ, both wings).
- **WORKED TABLE (γ=2 pool, 2× pick) — matches skeptic exactly:** m=1 g_loc=2.0 θ_tx=2.00× | m=2
  g_loc=4.0 θ_tx=4.00× | m=3 g_loc=6.0 θ_tx=8.00×. m=1 reduces to plain (g_loc=γ, θ_tx=chosen).
- **GATE REWRITE (`engine/verify/lens_selfcheck.js`):** the old √-design asserts (g_loc(ATM)=0,
  wings→γ, |g_loc|≤γ, funding→0-at-ATM) REMOVED (not satisfied — skeptic gate-problem). Routes on
  detector `gLoc source returns m*gamma`. New: CM1 g_loc=m·γ constant + m=1⇒γ; CM2/A5 wings exact
  power-law m·γ + monotone/bounded no-floor; CM3 monotone/no-arb; CM4 C⁰ seam machine-zero both
  wings; CM5 θ_tx=mode·(chosen/mode)^m + m=1⇒chosen; CM6 frozen round-trip exact (0/0) + no-free-
  money; **CM7 the three co-move SAME direction (g_loc↑ AND θ_tx↑) — polarity LOCKED, a future flip
  FAILS**; CM8 pool byte-id v24; CM9 no dead √-kernel. On OLD √ builds the CM block SKIPs (generic
  P/L4 checks still run → not a no-op). **13 PASS 0 FAIL** on new build; old HEAD 3 PASS (SKIP CM).
- **A16 gate (`a16_atm_gate.js`) updated:** added `isConstMult` detector; A16.2 BRANCHES — new build
  asserts **CUSP RETIRED** (continuous through ATM: call arm==put arm C⁰; ATM value =
  1/((g+1)·((g+1)/g)^g) <1, NOT peak=1); legacy √ build keeps old peak==1. A16.1/3/4 hold for both
  (continuity, no-regime-branch, cross-layer linear). Loop knob values changed 0.1/0.3/1.0 → 1/2/3
  (valid m≥1). **5 PASS 0 FAIL** on new build AND on old HEAD.
- **run_all.sh GREEN exit 0** on new build (lens 13 PASS + A16 5 PASS) AND on old HEAD (3+5).
  Blobs `ab663f5c`@74/`c505b08a`@1060 canonical; 3 scripts parse (709/450/1804; longest line 509);
  IIFE intact; HEAD md5 `5fea0e8d` UNCHANGED; surgical diff vs HEAD = 34 regions, NO blob lines, NO
  pool-fn lines.
- **⚠ FILE-SAFETY HOOK FALSE-POSITIVE (pre-existing, NOT my build):** hook BLOCKS (exit 2) on the
  new build AND on CLEAN UNMODIFIED HEAD identically — line 104 grep `grep -Eq 'FAIL|...'` matches
  the literal "0 FAIL" in the success summary `=== lens_selfcheck: N PASS, 0 FAIL ===`. run_all.sh
  itself exits RC=0 (green). Same standing over-broad-match bug I flagged in R-218 (out of scope,
  manager's guardrail). NOT patched.
- **Open for tester:** turn SLOPE MULT m up → chart-2 visibly steeper at EVERY strike (same exponent
  m·γ, no rounded elbow, no flat top); m=1 = the plain curve; open a band → close → reserves round-
  trip (frozen θ_tx); a 2× pick at m=2 swaps at 4× (further out → DEPTH_FRAC rejects earlier);
  settlement still at the CHOSEN strike. **Open for manager:** promote decision; the threading-param-
  name decision (kept `tau` as carrier, knob is `m` user-facing — skeptic will post-audit the gate
  REWRITE for honesty); CLAUDE.md §0 + feature_inventory items 2/3/16 need the redefinition update
  (skeptic FLAG-OMISSION) + the one-sentence operator confirm "this removes elbow-rounding + γ-frozen
  wings; curve is a plain power law of steepness m·γ everywhere — yes?".

---

## Done — R-218 INVERSE-LENS TRANSACTION STRIKE (NEW file, handed to manager 2026-06-13)
Build **`engine/builds/temporal_mvp_v28_lens_invtx.html`** (NEW, from HEAD `de28c937`; HEAD
UNTOUCHED, no promote, no git). md5 **`5fea0e8d82ea85270e97ede71cf8e9ae`**. Authority: operator
entries 214/215/216/218; skeptic `VERDICT_lens_tx_strike` + `VERDICT_lens_R218_consistency`
2026-06-13 (**Choice B** — keep today's view lens + sharper⇒further as a side-effect, LOOSEN
"transact exactly where it looks"). The chosen (lensed/displayed) strike swaps at the TRUE strike
whose lensed APPEARANCE equals it = INVERSE of today's view lens h_τ=√(τ²+u²)−τ. Swap-SIZING change
only; view lens (hTau/hpTau/gLoc/markLensed)/chart-2/funding/no-jump UNCHANGED. Splices on
`/tmp/work_invtx.html` (each count==1, blobs never through): `/tmp/splice_invtx_engine.py`
(executeLeg), `_store.py` (band K_tx), `_close.py` (close reversal).
- **MAP:** a=ln(chosen/getSNorm(state)); u_tx=sign(a)·√(a²+2|a|·τ); θ_tx=mode·e^{u_tx}; K_tx=θ_tx·fx.
  Inverse of h_τ to 1e-16, expands outward (|u_tx|≥|a|), bounded, single-valued. Worked: chosen=2×
  mode @ τ=0.3 ⇒ a=ln2, u_tx=0.94675, **θ_tx=2.5773× mode** (matches skeptic table).
- **executeLeg (was L1780-1781):** dy now `(wingSign·legSign)·N·K_tx` (was `N·K_usd`). mode_tx=
  getSNorm(state) read LIVE at open; θ_tx FROZEN as `K_tx` on the leg return (alongside kept
  `K_usd`=chosen-strike $, settlement basis). Reserve guard fires on `N·K_tx` (bigger swap ⇒
  capacity at a chosen strike SHRINKS — skeptic §4/g-tx4).
- **Band store (L2550/2555):** added `K_tx: result.leg1.K_tx`/`result.leg2.K_tx` to the stored
  band sold/bought legs (mirrors K_inner).
- **closeBand reversal (was L2046-2047):** `Ksold`/`Kbought` now read the FROZEN `band.sold.K_tx`/
  `band.bought.K_tx` (fallback K_inner→inner·oForK for legacy bands). Reversal dy=−(open dy) using
  frozen K_tx ⇒ reserves round-trip EXACT. **A live-mode recompute LEAKS** — proven: K_inner-fallback
  close leaks x-err 0.86 / y-err $58490; frozen K_tx x-err 7e-15 / y-err 1.2e-10 (INVTX-2).
- **SETTLEMENT stays at CHOSEN strike** (theta_inner/K_inner) — legPrice/markEff/closeBand payoff
  UNCHANGED. Financing leg swaps at θ_tx (further out); option settles at the picked strike (the
  intended two-strike semantics — skeptic ratified as Choice B(ii)).
- **BYTE-IDENTICAL confirmed:** pool tradeUpdate/arbitrageToOracle/rebase ==v24 AND ==HEAD;
  hTau/hpTau/lensU/gLoc/markLensed/legPrice ==HEAD. Only write path (executeLeg/store/closeBand)
  changed; diff = 3 regions (1780-1805 / 2070-2080 / 2584+2590), no blob lines, purely the intended.
- **GATES (lens_selfcheck.js):** routed AS-block sub-gates to be tx-aware on `theta_tx` token
  (re-derived AS1 expect=N·θ_tx·oracle; AS2/AS3/AS6 test bands carry K_tx + within-depth strikes;
  AS-guard threshold computed in swap-space; 8.8 dy-forward expects `±N·K_tx`). Bare HEAD (no
  theta_tx) keeps OLD at-strike assertions. ADDED **INVTX-1..5** (route on theta_tx): INVTX-1 θ_tx=
  inverse-lens, expands, h_τ round-trip ≤1e-12; INVTX-2 frozen exact + K_inner-fallback LEAKS
  (freeze load-bearing); INVTX-3 single-leg open+reverse Σdy==0 ⇒ no free money (entry-199);
  INVTX-4 τ-direction LOCKED (sharper τ⇒θ_tx LESS far: 2.099×/2.577×/3.921×/8.619× @ τ=.05/.3/1/3
  — documented side-effect, NOT a fail); INVTX-5 view-lens byte-id vs HEAD.
- **Results:** INVTX build **39 PASS 0 FAIL** (34+5); bare HEAD **34 PASS 0 FAIL** (UNCHANGED);
  run_all GREEN exit 0 on both (lens_selfcheck + A16 5 PASS). Blobs `ab663f5c`@74/`c505b08a`@1060
  canonical; 3 scripts parse (180/509/243); IIFE intact; HEAD md5 `de28c937` UNCHANGED; banned
  tokens (goalSeekW|wing exponent|wing steepness|target steepness|modeOverride|inverseLens) = 0 in
  build AND gate; file-safety hook rc=0 (bash; sh chokes on pipefail line 21 — known, run with bash).
- **τ-direction is a KNOWN documented side-effect, NOT my bug** (skeptic FLAG-WRONG vs entry-118:
  today's h_τ gives sharper⇒closer; the operator picked Choice B which accepts it). INVTX-4 LOCKS
  the sign so a future fix can't silently flip it.
- **Open for tester:** open a band → immediate close → chart-1 reserves return to entry (frozen
  K_tx round-trip); a far-OTM chosen strike now swaps at a FURTHER-OUT point so DEPTH_FRAC rejects
  earlier (capacity shrinks); settlement payoff still reads the CHOSEN strike. **Open for manager:**
  promote decision; the two-strike (financing≠settlement) semantics is the skeptic-ratified Choice
  B reading; FLAG-PROCESS (skeptic R218 §6): entries 214/215/216/218 have NO verbatim transcript in
  history/operator/ — carried on paraphrase (manager's to back-fill).

---

## Done — A16 no-jump-ATM HARD gate (verify-only, handed to manager 2026-06-12; NO engine edit, NO git)
NEW gate **`engine/verify/a16_atm_gate.js`** per `specs/SPEC_A16_no_jump_atm_2026-06-12.md` §5.
Target HEAD `engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 `de28c937…`, UNCHANGED — touched
no build). Sandboxes `<script id="engine">` in `vm` (lens_selfcheck pattern); SKIPs-as-pass on a
build without `gLoc`/`markLensed`. LOCKS the diagnosis: the live held-position value path
(markEff→legValueUnified→pfComponents, all via smooth-pasted `markLensed`) is CONTINUOUS across
OTM↔ITM (ATM g_loc→0) — no jump, no regime branch in the VALUE. 5 asserts:
- **A16.1 NO-JUMP** (γ∈{1.5,2,3,4}×τ∈{.1,.3,1}×{call,put}): TWO parts — (i) window max adjacent
  |Δ markEff| scales with step (stepRatio≈8.3–8.7, no floor); (ii) **one-sided-limit agreement**
  |markEff(mode−ε)−markEff(mode+ε)|→0 ∝ε (limGapRatioMin=9.96, require ≥5). (ii) is the precise
  no-jump-at-ATM discriminator — neg-control: a non-degenerate +0.05 ATM jump floors the gap →
  ratio 1.00 ⇒ A16.1 FAILS (verified, gate is NOT a no-op). NOTE the metric subtlety I found: the
  window-max-|Δ| alone (i) can be MASKED when the continuous cusp's steep approach dominates the
  window max — a saturate-to-1 jump is degenerate at ATM (both sides→1) so it correctly is NOT a
  value-jump there; the real regression risk is flat-ITM-band saturation, which A16.3 catches.
- **A16.2 ATM peak == 1**: `markLensed(wing,mode,mode,0)===1` exactly + `markEff(ATM)`==1 (≤1e-12);
  both one-sided limits monotone ↑ to 1.
- **A16.3-struct NO-REGIME-BRANCH** (source check, comments stripped): `markEff` returns
  `markLensed(...)` UNCONDITIONALLY (no isOTM/legIsITM/`?1:`/bare `return 1`); `pfComponents`
  `value=part.sign*leg.N*m` with `m=markLensed(...)`, `itm` flag feeds ONLY `effK` (display, ordered
  before `value`, never in the value expr). **A16.3-numeric**: ITM `markEff`<1 (HEAD 0.27–0.56,
  smooth-paste) NOT old flat=1 — the genuine v24-regression discriminator.
- **A16.4 cross-layer single-basis**: pfComponents fraction == markEff across the ATM crossing
  (maxFracErr 0.0); dollar mark LINEAR in markLensed (legValueUnified=N·m witness).
Did NOT duplicate/weaken lens_selfcheck (4)'s settle==lensed S* seam check (distinct locus).
**Routed** in `run_all.sh` lens branch (`grep markLensed && !wField`) AFTER lens_selfcheck, [HARD
GATE], set -e aborts on FAIL. **Results:** HEAD **5 PASS 0 FAIL** exit 0; v24 base **SKIP-as-pass**
exit 0; `run_all.sh` on HEAD GREEN exit 0 (lens_selfcheck 34 PASS + A16 5 PASS); blobs
`ab663f5c`@74/`c505b08a`@1060 canonical; HEAD md5 `de28c937…` UNCHANGED. **Open for manager:** the
spec's §4 A16-CUSP (non-C¹ peak at ATM) is the only operator-tier item — NOT in this gate's scope
(gate covers value continuity / no-jump only).

---

## Done — v28 AT-STRIKE AMM SWAP (register A14, NEW file, handed to manager 2026-06-12, URGENT)
Build **`engine/builds/temporal_mvp_v28_lens_atstrike.html`** (NEW, from CLEAN HEAD `4378bc11`;
HEAD UNTOUCHED, no promote, no git). md5 **`de28c93712ffb1a7fcafc66b36a0ea83`**. Authority:
spec `specs/SPEC_atstrike_swap_A14_2026-06-12.md` §1/§2.3 + operator entry 197 OVERRULING the
spec's §2 HARD-RED arb stop ("transact at whatever the curve is; forget arb for now; option
pricing is a separate layer from AMM pricing"). Splices on `/tmp/work_atstrike.html`:
`/tmp/splice_atstrike_engine.py` (executeLeg+DEPTH_FRAC), `_band.py` (guard propagation),
`_close.py` (close reversal); gate `/tmp/splice_lenscheck_atstrike.py` + 3 Edits.
- **OPEN (executeLeg, was L1761):** dy now AT-STRIKE `dy = (wingSign*legSign)*N*K_usd`,
  `K_usd = theta_inner*oracle` (premium-FREE). legPrice/V STILL computed + returned (settle
  basis + N_buy sizer per entry 96/187) — just no longer sizes dy. Added `K_usd` to leg return.
- **Reserve guard (spec §2.3):** new engine const `DEPTH_FRAC=0.90` (before executeLeg). If dy<0
  and `N*K_usd >= 0.90*(y−beta)` → `{rejected:true, reason:"At-strike cash $X exceeds 90% of pool
  cash depth $Y — trade rejected."}`. NEVER a silent cap, N never mutated. executeBand propagates
  via `if(leg && leg.rejected) return {ok:false, reason:leg.reason}` (added before both `if(!leg)`).
- **CLOSE (closeBand, ~L2005+):** added at-strike reversal-dy helper after band rebuild —
  `dyRevSold = -(wsSold*(+1)*N_sold*Ksold)`, `dyRevBought = -(wsBought*(-1)*N_buy*Kbought)`,
  K from stored `K_inner` (oracle-drift-invariant). Replaced all 3 reversal `tradeUpdate` sites
  (sold-ITM→bought reverse, bought-ITM→sold reverse, neither-ITM→both) `tradeUpdate(s,±X/Y)` →
  `tradeUpdate(s, dyRev*)`. X/Y (lensed premium VALUE) UNCHANGED = trader-valuation basis (entry
  96). reverse dy = −open dy ⇒ reserves round-trip EXACT (tradeUpdate conserves (x−α)(y−β)=αβ,
  α/β invariant, y additive ⇒ y restores ⇒ x restores, order-independent).
- **UNCHANGED:** pool fns tradeUpdate/arbitrageToOracle/rebase BYTE-IDENTICAL to v24 (387/314/96b,
  AS4 verified); N_buy CODE/FORMULA `V_sell/legPrice(post-sell,bought,1,τ).V` (G-A14-2 holds);
  state + ui `<script>` blocks byte-identical to HEAD (only engine changed, 73 lines).
- **GATES (lens_selfcheck.js):** added AS block routed on `\bDEPTH_FRAC\b` token (skips on HEAD).
  AS1 open `abs(dy)==N·K·oracle` machine-eq (12 cases). AS2 open→close reserves restore exact
  (call/call x/y-err 0.0/0.0; put/put 1.78e-15/0.0 — **the −$254k leak is GONE**). AS3 N_buy
  formula unchanged + V_sell pricing-basis==HEAD. AS4 pool fns byte-id v24. AS5 warp-rises-OTM
  Δγ=0.2200<0.3000<0.4000<0.8000 strictly ↑ AND ==dy/β (≤1e-9). AS6 HONESTY (reserves restore +
  close at lensed mark; trader-valuation netting = A15-deferred residual raw_net=1.4965, RECORDED
  not faked). AS-guard cash-OUT-over-depth REJECTS w/ numbers, under executes, N==1, executeBand
  path. ALSO updated 2 pre-existing gates to be A14-aware (re-derived, NOT patched-to-green):
  **(8.8)** dy-forward now asserts `±N·K at-strike` on DEPTH_FRAC builds (was `±V·oracle`);
  **(CF4)** HEAD-equality clause skipped on DEPTH_FRAC builds (engine differs BY DESIGN; AS4
  carries the real pool-fn L4 invariant). HEAD path of both gates UNCHANGED.
- **Results:** atstrike **34 PASS 0 FAIL**; bare run still checks HEAD **27 PASS 0 FAIL**
  (current HEAD=contwarp build, CF1-4 route → 27 not 23; brief's "23" is STALE). run_all.sh GREEN
  exit 0 on both. blobs `ab663f5c`@74/`c505b08a`@1060 canonical; 3 scripts parse (664/447/1803);
  longest engine script line 180; IIFE intact. Banned grep (goalSeekW|wing exponent|wing
  steepness|target steepness) = 0 in build AND gate.
- **⚠ FINDING — file-safety hook FALSE-POSITIVE (pre-existing, NOT my build):** the hook BLOCKS
  (exit 2) on the atstrike build AND on the CLEAN unmodified HEAD identically, because its harness
  grep `grep -Eq 'FAIL|MISMATCH|...'` matches the literal "0 FAIL" in lens_selfcheck's success
  summary line `=== lens_selfcheck: N PASS, 0 FAIL ===`. run_all.sh itself exits rc=0 and is clean.
  Standing hook over-broad-match bug in `.claude/hooks/file_safety_gate.sh` line ~111; NOT patched
  (out of scope, manager's guardrail) — surfaced to manager.
- **⚠ FLAG — brief↔spec tension on AS3:** brief says "N_buy UNCHANGED vs clean HEAD" but numeric
  N_buy DIFFERS (atstrike 2.3404 vs HEAD 1.5599) because the at-strike sell moves the post-sell
  pool further ⇒ bought-unit denom differs. Impossible to have BOTH (at-strike open) AND (N_buy
  numerically == premium-sized HEAD). Spec's own G-A14-2 prices denom at the post-sell state, so
  AS3 asserts the FAITHFUL invariant: N_buy formula unchanged + V_sell option-pricing basis ==
  HEAD; numeric divergence RECORDED in gate detail, not hidden. Manager call if numeric-equality
  was intended (would require keeping open premium-sized — contradicts A14).
- **Open for tester:** open a band → close it → pool reserves return to entry (chart 1 / x,y);
  cash-OUT leg (buy call / sell put) far OTM rejects with the depth $ in the message, no silent
  cap; warp visibly rises with strike on a sold call. **Open for manager:** promote decision; the
  2 flags above; HEAD's real bare count is 27 (not the brief's stale 23).

---

## Done — v28 CONTINUOUS WARP PREVIEW (NEW file, handed to manager 2026-06-12, operator deadline)
Build **`engine/builds/temporal_mvp_v28_lens_contwarp.html`** (NEW, from CLEAN HEAD `7e1ae39b`;
HEAD UNTOUCHED, no promote, no git). md5 **`4378bc1192878cfe437b8fa5551c5b88`**. Authority:
operator entries 158/163; scope = skeptic `notes/skeptic/VERDICT_CONTINUOUS_SKEW_entry158_2026-06-12.md`
(held-center machinery SCRAPPED — `_heldwarp.html` is DEAD, do not extend; live-centered read is
the correct end state; continuous = sampled live frames, renderer-only, NO new curve math).
Splices: `/tmp/splice_contwarp.py` (build, 1 rep count==1, purely additive diff at the old
drawPricing def line ~L3497), `/tmp/splice_lenscheck_contwarp.py` (gate file, line-range slice).
- **Build change (UI/draw layer ONLY; engine `<script>` BYTE-IDENTICAL to HEAD, gate-verified):**
  `framePool(state,dy,s) = Engine.tradeUpdate(state, dy*s)` (tradeUpdate verified pure — returns
  fresh `{x,y,alpha,beta}`, never mutates); old `drawPricing` body renamed `renderPricingFrame`
  (unchanged); new `drawPricing` wrapper sweeps the dashed chart-2 preview s:0→1 over 800ms via
  requestAnimationFrame, each frame `renderPricingFrame(state, framePool(pre, previewPool.y−pre.y, s))`
  — the EXISTING live draw path at THAT frame's own 45°-tangent center, no override. Lands on the
  exact previewPool object at s=1. Keyed on pool.x|pool.y|preview.x|preview.y: re-animates only on
  preview CHANGE; same key mid-flight → let it run; same key idle → static s=1; null preview / no
  rAF → today's static behavior (graceful degrade). Tick redraw (L4152) only fires w/o preview, so
  it never interrupts.
- **Gates (lens_selfcheck.js):** REMOVED the dead held-warp block (old L426–576, routed on the
  scrapped 4-arg-gLoc build; carried banned `modeOverride` tokens). ADDED CF block routed on
  `function framePool` token: **CF1** frames off the ACTUAL extracted-and-eval'd framePool source —
  s=0==pre exact, s=1==full preview exact (===), w monotone, drawn exponent array (the matched gAt
  pool-branch SOURCE expression, per skeptic #C16 rule) === gLoc of each frame; **CF2** skeptic
  telescoping identity, N=100 per-step (held-warp + lens-recenter) increments == live end−start
  (maxErr 8.9e-16); **CF3** end picture = live read: wings steepen (d(0.25×)=+1.24, d(4×)=+1.37),
  swept 0.7×center strike DIPS **d(0.7×)=−1.2304** (documented as the mechanic per skeptic standing
  caution), zero override tokens (assembled split so the gate file greps clean), zero 4-arg gLoc;
  **CF4** animation tokens draw-layer-only, money paths token-clean, engine byte-identical + numeric
  == clean HEAD (behavMax=0; identity-green after promotion, W-OVR precedent).
- **Results:** contwarp **27 PASS 0 FAIL**; bare run still checks HEAD **23 PASS**; run_all.sh exit 0
  on both; blobs `ab663f5c`@74/`c505b08a`@1060 canonical; 3 scripts parse (613/447/1803), longest
  line 509; IIFE intact; diff vs HEAD purely additive (2 insert hunks, 1 region). Banned grep
  (`goalSeekW|wing exponent|wing steepness|target steepness|modeOverride`) = 0 hits in build AND
  gate file. Suite on other builds: S1 14 PASS, S2 23, warp/heldwarp now 23 each (their special
  blocks removed — both builds DEAD).
- **Open for tester:** staging/changing a band preview animates the dashed chart-2 curve sweeping
  to the post-trade shape (~0.8s), incl. the φ_m marker sliding; final frame == old static preview;
  no animation on load/execute/clear; chart 1 inert. **Open for manager:** promote decision; the
  scrapped `_heldwarp.html` file still sits in builds/ (disposal is manager's call).

---
_(history below; the heldwarp build below is SCRAPPED per skeptic VERDICT_CONTINUOUS_SKEW 2026-06-12 —
its gate block was removed from lens_selfcheck.js with the contwarp work)_

## Done — v28 HELD-CENTER WARP DRAWING FIX (SCRAPPED 2026-06-12 by skeptic continuous-skew ruling)
Build **`engine/builds/temporal_mvp_v28_lens_heldwarp.html`** (NEW, from CLEAN HEAD `7e1ae39b`;
HEAD UNTOUCHED, no promote, no git). md5 **`586e8c4ad8b97fe00be0dfd0131f3959`**. Authority:
operator entry 153 #1/#2 + 155; skeptic `notes/skeptic/VERDICT_R6_heldcenter_warp_fix_2026-06-12.md`
(HOLD→CLEAR conditions implemented exactly); spec = CORRECTION APPENDIX C.0–C.6 of
`specs/SPEC_v28_goalseek_warp_RECONCILED_2026-06-12.md`, changes 1/2/3 ONLY. The C16
`_warp.html` build is DEAD for this line (skeptic-ruled scope leak — goalSeekW/"wing exponent").
Splices: `/tmp/splice_heldwarp.py` (4 reps, count==1, blobs never through, copy-then-edit),
`/tmp/splice_lenscheck_heldwarp.py` (gate file, line-range slice).
- **Change 1 (gLoc, was L1639):** optional 4th param `modeOverride` — finite >0 ⇒ lens distance
  `Math.log(theta_K/modeOverride)`; omitted/null/≤0 ⇒ `getSNorm(state)` (numerically identical to
  old, W-OVR behavMax=0 vs HEAD). γ ALWAYS from the (possibly moved) pool — override touches MODE only.
  `lensU` left as-is (gLoc inlines it in the omitted branch, same guards, NaN-loud).
- **Change 2 (drawState L3581 + gAt L3586):** optional 5th param `modeOverride`, passed into
  `Engine.gLoc(poolForLens, theta, tau_v, modeOverride)` in the pool branch ONLY; non-pool fallback,
  tmDeg/psiAt/markLensed unchanged.
- **Change 3 (preview call L3639-3647):** dashed after-trace =
  `drawState(snap.sNorm, true, previewPool, state.tau, snap.sNorm)` — held pre-step 45°-tangent
  center for BOTH axis and lens center; redraw keyed on `|previewPool.alpha/previewPool.x − snap.w|
  > 1e-6` (w actually moved); `snapPost` local dropped (only used here). Live trace call UNCHANGED.
- **Gates (lens_selfcheck.js):** REMOVED the dead goalSeekW-routed block (old lines 426–542 — it
  carried skeptic-cut gate-2 + goalSeekW gate-5 clause + the banned "wing exponent" phrase; routed
  only on the dead C16 build, which now gets plain 23 PASS). ADDED held-warp block routed on
  **`E.gLoc.length >= 4`** (NOT goalSeekW): W1 real-path dG=(γ′−γ)·Φ via actual
  `gLoc(previewPool,θ,τ,heldMode)`, single-signed + grows-OTM; **W1b LOCKED regression** (w=0.725,
  dy inverted closed-form for γ′=35/11, θ=0.7×center: old no-override read −0.4586 sign-flip MUST
  be red-the-old-way, held read +0.4174==formula); W6 behavioral exponent-array equality + UI call
  wires the override; W-OVR leak guard (exactly 1 four-arg gLoc site + 1 five-arg drawState call,
  money paths legPrice/markEff/legValueUnified/fundingPerStrike/closeBand/executeLeg/executeBand/
  pfComponents token-clean AND numerically == clean HEAD, max|Δ|=0).
- **Results:** new build **27 PASS 0 FAIL** (23+4); bare run still checks HEAD **23 PASS**;
  `run_all.sh` GREEN exit 0 on both; blobs `ab663f5c`@74/`c505b08a`@1060 canonical; 3 scripts
  parse (622/447/1760); IIFE intact; longest script line 509; surgical diff = exactly 4 hunks.
  Banned-token grep (`goalSeekW|wing exponent|wing steepness|target steepness`) = **0 hits** in
  build AND gates.
- **Open for tester:** after a trade the dashed preview reshapes around the UN-moved pre-trade
  center (φ_m marker of dashed == solid); at strikes below center the dashed curve must show the
  SAME direction of steepness change as above (no sign-flip at ~0.7×center). **Open for manager:**
  promote decision; note W-OVR compares money paths against the HEAD path (identity after
  promotion, true cross-check before).

---
_(history below; the C16 build below is DEAD per skeptic R6 — superseded by the held-center fix above)_

## Done — v28 GOAL-SEEK WARP (C16, Items 1–3; DEAD per skeptic R6 2026-06-12 — do not extend)
Build **`engine/builds/temporal_mvp_v28_lens_warp.html`** (NEW, from HEAD `7e1ae39b`; HEAD
UNTOUCHED, no promote, no git). md5 **`abd46149961cab45f1992b7e21850d5f`**. Spec
`specs/SPEC_v28_goalseek_warp_RECONCILED_2026-06-12.md` (R6-CLEAR, R2 go entry 133/140). ALL 3 =
READ/VIEW + readout + gates — ZERO write-path change. Splices on the copy (count==1, blobs never
through): `/tmp/splice_warp_engine.py`, `_item1.py`, `_item2html.py`, `_item2js.py`.
- **Item 1 (held-lens VIEW, L3690-3696):** dashed preview now `drawState(snap.sNorm, true,
  previewPool, state.tau)` — PRE-step (held) mode + MOVED γ (off previewPool). Was
  `drawState(snapPost.sNorm, …)` (post-trade mode = re-centering that MASKS dG). Kept the
  snapPost change-detection guard (only draw when pool actually moved). The `gAt` closure reads γ
  off poolForLens, mode off the passed sNorm ⇒ dG=(γ′−γ)·Φ visible. Gate (W1) max 4.4e-16.
- **Item 2 (goal-seek readout):** engine `goalSeekW(G)=G/(1+G)` (G≥1 && isFinite ⇒ else NaN-loud,
  no clamp), added after markLensed (~L1686), exported (~L2218) alongside gLoc/markLensed. UI: HTML
  readout block after KURTOSIS τ field (~L1324) — GOAL-SEEK G input + 3 stat-lines (read-point γ
  live, w′, resulting γ′) + HONEST copy (skeptic A11: one trade warps the WHOLE profile by one
  factor, more in wings; asymmetric skew builds ACROSS the sequence — NO per-strike in-step bend;
  advisory, trade stays actuator). JS `updateGoalSeek()` (~L2760) reads live γ off Store.state.pool,
  computes w′; listener on goalseek-g-input; called in render() (~L4211) so live-γ refreshes after
  trades. L4: goalSeekW never an arg to tradeUpdate/arbitrageToOracle/executeLeg.
- **Item 3 (6 gates, lens_selfcheck.js):** appended W1–W6, auto-route on `E.goalSeekW`. W1 held-lens
  dG=(γ′−γ)·Φ ≤1e-13; W2 goalSeekW single-root/monotone/G≥1⇒w′≥0.5/γ(w′)=G/boundary G=1⇒0.5/guard
  NaN; W3 pool byte-identical vs v24; W4 g_loc≤γ grid; W5 no-inversion token scan (goalSeekW
  closed-form, not in pool fns, no 1/h″); W6 preview draw uses snap.sNorm not snapPost (UI-body grep).
- **MUST stay byte-identical (confirmed):** tradeUpdate/arbitrageToOracle/rebase BYTE-IDENTICAL to
  v24 (grab+compare); executeLeg/legPrice/settlement untouched; θ_K still payoff strike.
- **GATES:** `node verify/lens_selfcheck.js …_warp.html` → **29 PASS / 0 FAIL** (23 prior + 6 new).
  `sh verify/run_all.sh …_warp.html` GREEN exit 0 (routes v28 lens branch). NO regression: HEAD
  stays 23 PASS (no goalSeekW route), v24 base SKIPs-as-pass.
- **Safety:** blobs `ab663f5c`@74 / `c505b08a`@1060 canonical; 3 scripts parse (625/447/1790); IIFE
  intact; longest non-blob line 553; surgical diff = exactly 7 hunks (HTML readout / goalSeekW fn /
  export / JS listener+fn / Item-1 draw ×2 / render call), no blob lines, no pool-fn lines;
  file-safety hook exit 0.
- **Open for tester (live smoke):** a trade preview now shows the dashed warp curve at the held mode
  (strike-dependent reshape visible, more in wings); GOAL-SEEK G input updates w′/γ′ readout
  (G=3⇒w′=0.75); read-point γ refreshes after trades; G<1 shows "G≥1 required" not a number; honest
  copy reads as advisory-not-actuator. **Open for manager:** promote after gates + tester.

---
_(history below)_

## Done — v28 lens HEAD: τ stepper band-preview re-run (entry 111 "yes"; IN PLACE, no git)
Edited **`engine/builds/HEAD_temporal_mvp_v28_lens.html`** IN PLACE (promoted-HEAD display-refresh
update; md5 changed `989752294bfeff49d6c92e0ab7ca6ccd` → **`7e1ae39baa00fda087033174cfc652b8`**).
Splice `/tmp/splice_tau_band_preview.py` (count==1, blobs never through; copy `/tmp/work_tau_band.html`
then promote). ONE line, L2727 — the τ stepper handler:
- BEFORE: `if (v > 0 && isFinite(v)) { Store.setTau(v); if (Viz) Viz.drawAll(Store.state); }`
- AFTER:  `if (v > 0 && isFinite(v)) { Store.setTau(v); if (typeof previewBand === 'function') previewBand(); if (typeof render === 'function') render(); if (Viz) Viz.drawAll(Store.state); }`
Matches the strike-input idiom (L3170–3171 `previewBand(); render();`). Scope confirmed: τ handler
(L2727), `previewBand` (L2979 fn decl), `render` (L4079 fn decl), strike-input handler (L3170) are
ALL in the same `<script id="ui">` block (L2650+) — `previewBand`/`render` lexically reachable, no
restructuring needed. **Nothing else changed** — no math/pool/lens/control. Display-refresh wire only.
Now turning τ recomputes the band preview (live slippage readout) before the chart redraw.
- **Safety/gates:** surgical diff = exactly 1 line; blobs `ab663f5c`@74 / `c505b08a`@1060 canonical;
  3 scripts parse (612/446/1754 lines, longest 509); pool `tradeUpdate`/`arbitrageToOracle`/`rebase`
  BYTE-IDENTICAL to v24 (387/314/96 b, gate 6b); `node verify/lens_selfcheck.js …HEAD_…v28_lens.html`
  **23 PASS 0 FAIL**; `sh verify/run_all.sh` GREEN exit 0; file-safety hook no-block.
- **Open for tester:** live — turning τ now updates the slippage readout (band preview re-runs);
  chart 1 (plain-v24 pool curve) still inert to τ; chart 2 still reshapes.

---
_(history below)_

## Done — v28 lens CLEANUP BATCH C1–C9 (NEW file, handed to manager 2026-06-12)
Build **`engine/builds/temporal_mvp_v28_lens_FINAL.html`** (NEW, from S2 `b53ace99`; HEAD v27
UNTOUCHED, no promote, no git). md5 **`989752294bfeff49d6c92e0ab7ca6ccd`**. Operator entry 106
"please do"; skeptic R6-CLEARED verdict #33 (C6 re-scoped LABEL-ONLY). ALL 9 = display/render/readout
layer — none touched the pool, lens math, or settle-at-lensed-value pipe. Splices on the FINAL copy
(each count==1, blobs never through): `/tmp/splice_c1.py`, `_c2.py`, `_c3.py`, `_c4c7.py`, `_c8c9.py`,
`_c8ticks.py`, `_c5.py`, `_c6.py`.
- **C1** (~L3080 setVal): dropped `* s.oracle` on pv-dy-sold/pv-dy-bought/pv-net-cash — `leg.dy`/
  `netPoolY` already USD (executeLeg multiplies V·oracle inside; headless: leg.dy=42112.58==V·oracle,
  old showed ~$3.4B). NOTE pv-bought-V `sim.V_buy * s.oracle` LEFT — V_buy is asset-units, that ×oracle
  is correct.
- **C2** (~L3285): anchor w=½ trace `curveTraceExplicit(0.5, snap.depth, …)` → `…, Math.sqrt(snap.x*
  snap.y), …`. snap.depth=x^w·y^(1−w) is LIVE-w units (off ~9.6× at w=0.7); k=√(x·y) makes the w=½
  constant-product pass EXACTLY through the live reserves point (verified xc=10.0, yc=800000).
- **C3** (~L2991): new `clearBandPreviewOut()` helper (15 pv-* ids + bought-display + 2 sublines +
  setModeTags(null,null)+setSummary(null×4)) defined after local setVal; called at TOP of ALL 6
  reject/early-returns (was: only the first ksOK/N reject cleared; clubSide/club-notional/club-equity/
  !sim.ok/fee-equity left stale). Deposit-row input echo deliberately NOT cleared (render() drives it
  from live N_sell — it's input, not preview output).
- **C4** (~L3882, D14): `Engine.legPrice(state,…)` → `Engine.legPrice(state.pool,…)`. The wrapper has
  no x/alpha → getSNorm NaN → catch → silent N_buy=N_sell. With the pool it derives (headless ratio
  0.9698≠1).
- **C7** (~L3884/3888, twin of W1): bought-leg denom raw `Engine.mark` → `Engine.legPrice(state.pool,
  bought_wing, thBuyIn, thBuyOut, 1, state.tau).V` — same lensed single-pricing entry execution books
  N_buy with. Display-only; preview now shares ONE basis with the booked N_buy. (Preview prices both
  legs at state.pool; execution prices the bought leg at the post-sold pool — preview is not byte-equal
  to the booked N_buy by construction, but the BASIS now matches, which is C7's mandate.)
- **C5** (~L2259 + L4145): added `_initial_y: 800000.0` to initialState; `lp-y-delta` hardcode
  `p.y − 800000` → `p.y − s._initial_y` (legacy state w/o field → NaN, loud). LIQ-PRICE
  (`perp-liq-display` ~L2853 `S*(1∓1/L)`) already the textbook isolated-margin formula → SANE as-is,
  NO change needed (the v27-line LIQ defect was v27-specific).
- **C6** (LABEL-ONLY, skeptic #33 binding): close-log (~L2591) `trader=$…`→`band P&L vs entry
  (trader)=$…`, `Δclub=$…`→`Δclub equity=$…`; pf-dollar cell title (~L4358) "settlement value = …"→
  "band P&L at close (Δ vs entry, not walk-away cash) = …". NO new entry-cost figure; computed
  trader_payout/club_delta/raw_net UNCHANGED. (No separate visual close overlay element exists —
  trader_payout/club_delta render ONLY in the log line + the dollar cell; both relabeled.)
- **C8** (~L3859): xMin/xMax −0.5/0.5 → −0.9/2.0 (entry 98 #8). x-tick loop `-50..50 step10`→
  `-50..200 step50` so ticks span the new frame (−90 edge unticked, v26c precedent).
- **C9** (~L3909 legFraction): naked (barrier, `isBarrier(thOuter)`) leg now returns UNCAPPED
  `Engine.mark(...)`; spread legs (has outer) STILL `Math.min(1,·)` each barrier. Only the
  naked/single path changed.
- **EXCLUDED (R1, did NOT do):** payoff chart / strike marker onto the lens — operator never approved.
- **L4 hard invariant PRESERVED:** `tradeUpdate`/`arbitrageToOracle`/`rebase` BYTE-IDENTICAL to v24
  (extracted+compared char-for-char: 387/314/96 bytes, identical). No edit drifted them.
- **Safety:** blobs `ab663f5c`@74/`c505b08a`@1060 canonical; 3 scripts parse (613/447/1755);
  longest non-blob line 553; file-safety hook exit 0; surgical diff vs S2 = exactly the C1–C9 hunks.
- **GATES:** `node verify/lens_selfcheck.js …FINAL.html` **23 PASS 0 FAIL**; `sh verify/run_all.sh
  …FINAL.html` GREEN exit 0.
- **Open for tester (smoke per C-item + warp-visibility):** C1 net-cash ~order-$10k not billions;
  C2 anchor (w=½) trace passes through reserves point; C3 swap-then-reject shows warn + all preview
  '—' on EVERY reject path (no-club / no-notional / wing-range / fee); C4/C7 payoff N_buy derives
  (≠N_sell) and matches booked basis; C5 lp y-delta $0 at load, LIQ-PRICE sane (~$70k/$90k @8×);
  C6 close log + dollar-cell tooltip read as band P&L delta NOT pocket cash; C8 frame −90%..+200% with
  ticks; C9 naked leg climbs uncapped past the capped spread leg; AND chart-2 visibly reshapes on a
  trade (warp). **Open for manager:** C7 preview prices at state.pool (basis-match, not byte-equal to
  the post-sold-pool booked N_buy) — flagged as the in-scope display reading.

---
_(history below)_

## Done — v28 lens STAGE-2 WRITE/SETTLE THROUGH LENS (NEW file, handed to manager 2026-06-12)
Build **`engine/builds/temporal_mvp_v28_lens_S2.html`** (NEW, from S1 `1ed8fe2d…`; HEAD v27
UNTOUCHED, not promoted, no git). md5 **`b53ace9996930249cad85fc1e37e6c61`**. Spec
`specs/SPEC_v24_lens_BUILD_2026-06-11.md` §11; skeptic verdict #30
`notes/skeptic/VERDICT_R6_WRITE_SETTLE_LENS_2026-06-12.md` (1 halt-class must-apply + gate-5 strengthen).
Splices (all on copy `/tmp/work_s2.html`, count==1, blobs never through): `/tmp/splice_s2_engine.py`,
`splice_s2_w4.py`, `splice_s2_tau.py`, `splice_s2_w3.py`, `splice_s2_uicallers.py`, `splice_s2_payoff.py`,
`splice_s2_w6.py` + 1 Edit (payoff tau). Diff vs S1 = 136 changed lines, all W-site regions, no blob
lines (74/1060), no pool-fn lines.
- **5 W-sites routed to the lens** (one-helper rule §11.2: same gLoc/markLensed, getSNorm(state)
  reciprocal coord, γ live):
  - **W1 `legPrice`** (~L1716): +`tau` param; barrier V=N·markLensed(inner,getSNorm,gLoc); spread
    **leg-by-leg** N·(markLensed(inner)−markLensed(outer)) — DROPPED the θ*=√(θ₁θ₂)/2sinh composite
    (invalid under per-leg g_loc). theta_star/delta kept display-only.
  - **W2 `executeLeg`** (~L1761): +`tau`; V now lensed via legPrice; **dy=±V·oracle form UNCHANGED**
    (pool executes plain v24).
  - **W3 `closeBand`** (~L1955): +`tau`; settled-to-cash leg (legValueUnified/markEff) AND OTM
    reversal leg (legPrice) BOTH lensed, both at getSNorm(s) — move TOGETHER (§11.4-C).
  - **W4 `markEff`/`legValueUnified`** (~L1906): sig → (state,wing,theta,tau)/(state,wing,leg,tau);
    → markLensed(wing,θ,getSNorm(state),gLoc(state,θ,tau)).
  - **W6 `pfComponents`** (~L4168): +`pool,tau` params; Engine.mark → Engine.markLensed at
    getSNorm(s.pool). **W7 `raw_net`/`dollarFigure` (~L4259): basis only, formula UNCHANGED.**
- **MUST-APPLY-A (THE hazard) honored:** the lensed markLensed VALUE is NOT coordinate-invariant
  (only the exponent g is). `closeBand`/`markEff` natively had `sNorm0=poolMark/oNow` (PRICE coord);
  `gLoc` HARDCODES the reciprocal `getSNorm`. Fix: **ALL settled-leg lens calls use `getSNorm(s)`
  (reciprocal) as the spot** — NEVER `sNorm0` price spot/ray. `sNorm0` kept for `legIsITM`/`wingMember`
  REGIME TEST ONLY. Verified: settled-leg X==N·markLensed(reciprocal) to 1e-9; a price-coord-spot call
  diverges ~0.096 (the 6× leak the gate catches). Both legs land on ONE coordinate ⇒ settled==reversal.
- **tau is on TOP-LEVEL state (`state.tau`), NOT on `state.pool`** — engine fns receive the pool.
  Threaded `tau` explicitly through executeLeg/executeBand/closeBand/legPrice (+ executeFourStrikeSpread
  alias) and the 3 UI callers (executeBand open L2471, previewBand L3017, closeBand L2553) pass
  `state.tau`/`s.tau`. drawPayoff legPrice display call (L3874) gets `state.tau` (was already
  falling back pre-S2: it passes the UI wrapper not the pool → getSNorm NaN → catch).
- **W1-consistency completion (FLAGGED, not a 6th independent site):** `executeBand`'s inline N_buy
  `denom` (raw `mark` at price-coord sNorm2) would mix bases against the now-lensed V_sell
  (N_buy off by ~2×). Routed the denom through the SAME lensed `legPrice` (W1's "single pricing
  entry" mandate). The dead `sNorm2`/`ts2`/`d2`/`m2`/`buyMode` consts remain (harmless, valid JS).
  **Surface to skeptic/manager:** executeBand denom is NOT in the spec's enumerated 5 sites but
  leaving it raw reintroduces the basis split W1 closes — judged the consistent in-scope reading.
- **L4 preserved:** pool `tradeUpdate`/`arbitrageToOracle`/`rebase` SOURCE byte-identical to v24 +
  OUTPUT delta 0 (verified); dy=±V·oracle forward sizing; no inverse-lens helper. No γ_min floor;
  g_loc(ATM)=0 finite (markLensed→1 at mode); solvency markLensed∈[7.8e-10,1.0].
- **GATE:** extended `engine/verify/lens_selfcheck.js` with §11's 8 Stage-2 checks (8.1 settled==
  lensed·size; 8.2 open==settle one-helper; 8.3 UI==engine cross-layer; 8.4 intra-band both-lensed
  +sNorm0-regime-only structural; **8.5b STRENGTHENED — steep off-eq ONE-ITM, hazard caught**;
  8.5a per-leg same-state; 8.6 solvency ceiling; 8.7 one-helper witness [relabeled per skeptic, NOT
  "the no-arb gate"]; 8.8 L4 dy-forward + no inverse-lens). Stage-2 block SKIPs-as-pass on Stage-1
  builds (markEff 3-arg detector). **23 PASS 0 FAIL** on S2; S1 stays **14 PASS** (Stage-2 SKIPs);
  v24 base SKIPs entirely; HEAD v27 unaffected.
- **WIRED into run_all.sh:** NEW lens branch (detector: `function markLensed` AND NOT `function
  wField`) BEFORE the (W) branch → `node verify/lens_selfcheck.js` [HARD GATE] → exit 0. Routes
  v28 lens builds; v27 (has wField) still → wcurve (22 PASS); GH still → full suite.
  `sh verify/run_all.sh builds/temporal_mvp_v28_lens_S2.html` GREEN exit 0.
- **Safety:** blobs `ab663f5c`@74/`c505b08a`@1060 canonical; 3 scripts parse (613/444/1748); IIFE
  intact; longest non-blob line 535; diff vs S1 = 136 lines all W-sites, no blob/pool-fn lines.
- **Open for tester (Stage-2 smoke):** band open→close round-trip (raw_net≈0 on immediate close —
  tiny residual = genuine AMM slippage, pool-favourable per skeptic CLAIM-2); portfolio value
  reflects lensed marks; ATM (g_loc=0) settles finite; steep-pool one-ITM-leg band settles at the
  reciprocal-coord value. Confirm no additive lensed-option + un-lensed-perp $ in one column
  (skeptic CLAIM-4 / §11.7 record flag). **Open for manager/skeptic:** the executeBand N_buy denom
  routing decision above.

---
_(history below)_

## Done — v28 lens Stage-1 FLAG-1 FIX (τ-redraw wiring; handed to manager 2026-06-11)
Build **`engine/builds/temporal_mvp_v28_lens_S1.html`** edited IN PLACE (splice on copy then
promote, `/tmp/splice_tau_redraw.py`, count==1, blobs never through). md5
`5e1ff278…` → **`1ed8fe2ddf69a6ef2a2e47dc90d55ba0`**. ONE-LINE fix, L2702 (τ change/input handler):
`if (window.Viz && Viz.drawAll) Viz.drawAll(Store.state)` → `if (Viz) Viz.drawAll(Store.state)`.
Root cause (tester FLAG-1): `Viz` is a `const` IIFE (~L3175) never attached to `window`, so the
`window.Viz` guard was always false → dead redraw branch → τ change yielded 0px live. Chose option
(b)-aligned: matched the EXACT idiom every other working redraw uses (`if (Viz) Viz.drawAll(...)` —
lpPreview/band/club/reset/arb/tick all use the lexical `const Viz`, the τ handler was the lone
`window.Viz` outlier). Lens math, pool, draw all UNTOUCHED. Engine `<script id="engine">` block
**BYTE-IDENTICAL** (md5 `6ad0d944…` pre==post — UI-script-only change). Diff vs prior build =
exactly 1 line. Gates: blobs `ab663f5c`@74/`c505b08a`@1060 canonical; 3 scripts parse (591/444/1744);
longest non-blob line 553; `lens_selfcheck` **14 PASS 0 FAIL**; `run_all` GREEN (exit 0, routes (W)
branch → SKIP-as-pass, documented). **Open for tester:** τ stepper now auto-redraws chart 2 (full
elbow reshape live); chart 1 (plain-v24 pool curve) still inert to τ.

## Done — v28 POLAR-LENS STAGE 1 (read layer on v24 base; handed to manager 2026-06-11)
Build: **`engine/builds/temporal_mvp_v28_lens_S1.html`** (NEW, from base
`temporal_mvp_v24_rebase_fixed_2.html`; HEAD v27 `928cde1c` UNTOUCHED, not promoted, no git).
md5 **`5e1ff278dbfea889d49b48224ba931d3`** (487837 b) — SUPERSEDED by the FLAG-1 fix above. Spec
`specs/SPEC_v24_lens_BUILD_2026-06-11.md` + skeptic R6 `notes/skeptic/VERDICT_R6_SPEC_v24_lens_2026-06-11.md`
(2 binding must-applies). Splices `/tmp/splice_engine.py` (3 reps), `/tmp/splice_ui.py` (5),
`/tmp/splice_ui2.py` (3) — all count==1, blobs never through. Diff vs base = exactly 20 hunks,
all intended regions, no blob lines (74/1060), no pool-fn lines.
- **Engine (new, exported):** `hTau`,`hpTau` (h_τ, h′_τ); `lensU(state,θ)=ln(θ/getSNorm(state))`
  (sNorm coord, MUST-APPLY-1); `gLoc(state,θ,tau)=γ·h′_τ(|u|)`, γ=w/(1−w) LIVE; `markLensed(wing,
  θ,sNorm,g)` = v26b Reading-A smooth-paste with the strike-LOCAL g (call=sNorm/θ arm sStar=
  θ·((g+1)/g)^g; put=θ/sNorm arm sStar=θ·(g/(g+1))^g; cont c·sNorm, c=1/((g+1)·sStar); intrinsic).
  **`mark` UNCHANGED** (lensed mark is a NEW fn; `mark` still drives the unchanged pool/exec/$ pipe).
- **MUST-APPLY-1 honored:** ONE coordinate (sNorm) everywhere; g_loc uses getSNorm(state) mode, NOT
  the price-coord S. Funding's S/(S−1)/S/κ/sign UNCHANGED; only ±2→±g_loc and mark→markLensed.
- **MUST-APPLY-2 honored:** NO γ_min floor. g=0 ⇒ S*=0 finite. The one NaN locus (g=0 AND
  sNorm===θ exactly → pow(1,−∞)=NaN) is dodged by **inclusive boundary** (`<=`/`>=`): the boundary
  point returns the boundary value 1/(g+1), no floor, geometry preserved. Gate (4c): NaN-free.
- **P2 funding:** `fundingPerStrike` got trailing `tau` param; caller (fundingTick ~L2585) passes
  `state.tau`. ±g_loc replaces ±2; markLensed at the sNorm mode.
- **P1 + L3 curve-2:** `drawState` (drawPricing/chart-2) rewritten to plot ψ=`markLensed(wing,θ=
  tan(φ),sNorm,gLoc)` through the lens (live γ off poolForLens, τ static). Display clamped to
  [0,1]. Call sites pass `state.pool`/`previewPool`+`state.tau`. **Chart-1 (drawCurve, pool curve)
  UNTOUCHED — plain v24.**
- **P3 settlement:** `markLensed` IS the smooth-paste primitive (exported, gated directly). Did NOT
  rewire closeBand/legValueUnified/markEff/executeBand dollar pipe — those feed the stage-2→3
  conversion (brief: unchanged; stop-and-report if it needs an exercise branch). Pool +
  execution + $ pipe BYTE-IDENTICAL to v24 (lens_selfcheck (6)/(6b)).
- **τ control:** number stepper `tau-input` (min 0.05/max 3/step 0.05/value 0.3) in Settings >
  Protocol Params (NO slider, operator). `setTau` (static, guards bad/legacy), `state.tau:0.3`
  default. Listener (change+input) → setTau → Viz.drawAll. Steepness γ stays v24 derived-w (no
  slider added, per §6).
- **L4 forward-read-only:** no inverse-lens/target-slope helper; arbitrageToOracle stays lens-free.
  Gate (7a)/(7b) structural-grep confirm.
- **Gate:** NEW `engine/verify/lens_selfcheck.js` (sandboxes engine script like wcurve_selfcheck;
  SKIPs-as-pass on builds w/o gLoc/markLensed export → base v24 + HEAD v27 stay green). On v28:
  **14 PASS 0 FAIL** (items 1/2a/2b/3/4a/4b/4c/5a/5b/5c/6/6b/7a/7b). NOT wired into run_all (Stage-1
  brief asks for the file + report; run_all routes pre-GH→wcurve which SKIPs). run_all on v28 =
  GREEN (blobs canonical, dispatch clean).
- **Safety:** blobs `ab663f5c`@74/`c505b08a`@1060 intact (svg stayed at 1060 — my HTML add was at
  ~1316, after the svg; engine adds after 1604), 3 scripts parse (589/442/1742), longest script
  line 482, IIFE intact, no sig changes beyond the intended fundingPerStrike +tau / drawState
  +poolForLens,tau / new exports.
- **Open for tester (Stage-1 smoke):** see 6-step script in handoff. **Open for manager:** Stage 2
  (warp/observable) NOT built (intentional). P1's lensed mark deliberately NOT wired into
  pfComponents/dollarFigure (would change a displayed settlement $ vs the unchanged engine
  closeBand — flagged as the stop-class dollar-pipe boundary).

## Engine
- Canonical: **`engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html`** (md5
  **`928cde1cccb0f35fdc9a23a7634414c8`** after the 2026-06-11 entry-46 lacunae splice; I
  updated the run_all.sh informational pin myself per brief — manager re-pins
  INTEGRITY/BUILD_LINEAGE/DIFF_LEDGER). Base I edited was `1eebfcd6f6ff4f4e3df5f745ac145f19`
  (manager's post-29cd56bf state, incl. the WARP (g) anchoring gate). ⚠ svg blob line is
  **1064** (not 1060) — line-layer md5s unchanged (`ab663f5c`@74, `c505b08a`@1064).
  (W) kurtosis curve build (pre-GH lineage from v24 — NO ghCalibrate/ghMu on this branch;
  gate = `verify/wcurve_selfcheck.js` **22 PASS** incl. WARP (g) documenting gate).
  GH-lineage v26c (`6cc73563…`) remains in builds/ as history. (v26a/v26b notes below
  are history of landed work.)
- ⚠ (W) UNITS gotchas (re-derived 2026-06-11): engine `executeLeg` sets `dy = V*oracle`
  (V is asset-units) and `tradeUpdate` moves pool y by exactly that ⇒ **`leg.dy`/`netPoolY`
  are ALREADY raw USD** — display must NOT multiply by oracle again. `snap.depth`
  (`getDepth=x^w·y^(1−w)`, live w) is (W)-units — a w=½ overlay trace needs
  `k=√(x·y)` (constant-product through the live point), NOT snap.depth (~104× low).
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

## Done — v27 ENTRY-46 LACUNAE FIXES (4 UI-layer, handed to manager 2026-06-11)
Build: **`HEAD_temporal_mvp_v27_wkurtosis.html`** edited IN PLACE per brief (1eebfcd6 →
**928cde1cccb0f35fdc9a23a7634414c8**). Splice `/tmp/splice_v27_lacunae.py` (10 reps, all
count==1, blobs never through; copy-then-promote). 9 diff hunks = exactly the intended
regions. **Engine + state `<script>` blocks BYTE-IDENTICAL** (engine md5 d0869cbbb137
pre==post); only ui script + one HTML label line changed. NO git (manager re-pins ledgers).
- **(1) stale-on-reject (previewBand):** new `clearBandPreviewOut()` (after setWarn,
  ~L3131) resets ALL preview outputs (15 pv-* setVal ids, band-notional-bought-display,
  both $-sublines, band-deposit-notional, mode pills, setSummary) to '—'; called at TOP of
  ALL 6 reject/early-return paths (invalid-inputs path now uses it too; club×3, !sim.ok,
  fee-equity). Deposit row reset sticks because render() sets it BEFORE calling previewBand.
- **(2) audit-strip units:** pv-dy-sold/pv-dy-bought/pv-net-cash dropped `* s.oracle` —
  leg.dy/netPoolY are raw USD (re-derived from executeLeg, == pool Δy to 1e-6 in sandbox).
- **(3) anchor overlay:** `curveTraceExplicit(0.5, Math.sqrt(snap.x*snap.y), modeSlope)`
  (was snap.depth=170.83 → 104× low); k=1741.98 passes exactly through (10, 303448.28).
  Legend text untouched. Legacy fallback at curveTrace (snap.depth, pre-(W) states) left.
- **(4) τ disclosure (L1329):** appended "Visible effect scales with the wing gap (w₊−w₋)
  … sweep τ widely or widen the wing gap to see it." (magnitude itself unchanged, per brief).
- Safety: blobs `ab663f5c`@74/`c505b08a`@1064 intact, 3 scripts parse (longest line 482),
  IIFE intact, run_all GREEN (pin updated to 928cde1c), wcurve_selfcheck **22 PASS 0 FAIL**.
- **Open for tester:** browser — swap→reject shows warn + all '—'; net-cash ~order-$10k
  not billions; anchor (w=½) trace passes through the reserves point; τ label text.

## Done — v27 SPINNER CSS + SPOT-KPI BASIS (tester residuals, handed to manager 2026-06-10)
Build: **`HEAD_temporal_mvp_v27_wkurtosis.html`** edited via copy-then-promote (9d22cffd →
**29cd56bf83060f4b21a328bb79f03c57**). Splice `/tmp/splice_v27_kpi_spinner.py` (2 reps, count==1,
blobs never through). NO git (manager re-pins). Diff = exactly the 2 regions.
- **(1) Spinners clickable:** `.field-input-wrap input[type=number]` spinner CSS (old L326-329)
  `-webkit-appearance:none` → mirrors the working `.profit-row-content` block
  (`-webkit-appearance/appearance: inner-spin-button; opacity:1; height:22px; margin-left:2px`).
  **Deleted the dead `input[type="range"]` rule** (old L330-334; grep-confirmed zero range inputs
  remain). Net +4 lines → svg blob now line 1064.
- **(2) Spot KPI basis (L4294-5 old):** `kpi-spot-usd` = `fmtUSD(Engine.getMP_raw(p))` (=$80,000.00
  at load) and `kpi-spot` = `fmtNum(getMP_raw/s.oracle_initial,4)` (=1.0000) — on (W) w>½ the
  marginal g_loc·(y/x) ≠ y/x; old sNorm·oracle showed $30,344.83. `kpi-w` untouched (honest weight).
  Legacy import w/o oracle_initial → NaN (loud). Headless-verified 80000.00 / 1.0000 / old 30344.83.
- **FLAGGED, out of scope (same wrong basis, NOT in brief):** header `hdr-pool-spot` (L4251)
  still reads `sNorm*s.oracle` → shows "spot $30,344.83" while the KPI says $80,000.00. Manager
  call whether to align it (one-liner, same mpSpot basis).
- Safety: blobs `ab663f5c`/`c505b08a` intact (74/1064), 3 scripts parse (655/499/1804 lines),
  IIFE intact, longest non-blob line 553, `wcurve_selfcheck` **21 PASS 0 FAIL**.

## Done — v27 UX FIX / defaults revert (operator entry 29, handed to manager 2026-06-10)
Build: **`engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html`** edited IN PLACE per brief
(b245bfda → **9d22cffd6a0f002f359eed81d7157203**). Splice `/tmp/splice_v27_uxfix.py` (6 reps, all
count==1, blobs never through). NO git (manager re-pins gate md5s).
- **Reverted the 80000→4.44 pool/oracle rescale** (was MY earlier render fix — wrong approach,
  broke v24 feel + dollar KPIs). New defaults derived in `initialState()`: x0=10, oracle=
  oracle_initial=perpMark=80000, wings stay 0.60/0.85, τ=0.3. **y0 = x0·oracle·(1−wMid)/wMid ≈
  303448.28 (NOT 800000)** — on (W) with w>½ the marginal is γ_loc·(y/x)>y/x, so y=800000 would
  force a big load-arb; equilibrium-at-load chosen (commented in code). **phi0 = ln(y0/x0) ≈
  10.32** puts the elbow AT carry/ATM; op-point-centered trace window shows it w/o rescaling.
  alpha=x0·wMid=7.25, beta=y0·(1−wMid) (exact at u0=phi0). `_baseline_alpha/_beta` stamped from
  the same consts (drift=0 at load). Verified headless: getMP_raw(pool)=80000.000, arb no-op,
  liq-price default perp sane ($70k long / $90k short @8×).
- **lp-y-delta hardcode fixed** (~L4309): `p.y−800000` → `p.y−s._initial_y` (new state field
  captured at init; $0.00 at load; legacy imports w/o it go NaN — loud).
- **NO SLIDERS (operator):** `tau-input` `type="range" step=0.01` → `type="number" step=0.05`
  (min 0.05/max 3/value 0.3, id+input/change wiring unchanged — spinners fire both). Confirmed
  the ONLY range input in the file; all other inputs already number-type w/ sensible steps
  (weights 0.01 in (0.51,0.95), oracle step 100). Dead CSS rule for range left (harmless).
- **Static `wcurve-status` text** updated to match defaults (γ_ATM 2.64, γ₋ 1.50, γ₊ 5.67) —
  was stale 2.33×3; live `_wcurveStatus()` overwrites at boot anyway.
- Safety: blobs `ab663f5c`/`c505b08a` intact, 3 scripts parse, IIFE intact, longest script line
  482, diff = exactly 6 regions, `wcurve_selfcheck` **21 PASS 0 FAIL**.

## Done — v27 RENDER/DEFAULT/LABEL fix (knob+warp now VISIBLE; handed to manager 2026-06-10)
**PARTIALLY REVERTED 2026-06-10 (entry 29):** the pool/oracle 80000→4.44 rescale in item (2) was
the wrong fix and is now reverted (see UX-fix section above). Trace-window (1) and label (3)
survive.
Build: **`engine/builds/temporal_mvp_v27_wkurtosis_WIP.html`** (in place). Splice:
`/tmp/splice_v27_render.py` (count==1 each, blobs never through). Tester root cause: default pool
sat at u0=ln(800000/10)≈11.3 (off `curveTraceW`'s fixed u∈[−6,6] window → flat sliver) AND symmetric
wings 0.70/0.70 ⇒ Δw=0 ⇒ τ inert + all trades wing-rejected. CURVE MATH UNCHANGED → self-check
**21 PASS 0 FAIL** (it builds its OWN pools, never reads the default). Blobs `ab663f5c`/`c505b08a`
intact; 3 scripts parse; IIFE intact; longest non-blob line 535; diff = exactly the 4 regions.
- **(1) Trace window straddles operating point + elbow:** `curveTraceW` no longer walks fixed
  u∈[−6,6]; now `uCenter=½(u0+phi)`, `uSpan=½|u0−phi|+6`, walks `[uCenter−uSpan, uCenter+uSpan]`.
  Same F-level / same weight field (render-only).
- **(2) Realistic ASYMMETRIC default pool:** `x:10,y:12` (u0≈0.18, near elbow), `wMinus:0.60,
  wPlus:0.85` (Δw=0.25 live, both >½ so gLoc≈3.76>1), `alpha:7.625,beta:2.55` (re-stamped readouts).
  oracle/oracle_initial/perpMark `80000→4.44` (pool's natural marginal=4.51; arb near-identity so
  marker+frame land ON the curve). UI input defaults `wminus-input 0.70→0.60`, `wplus-input
  0.70→0.85`. NOTE oracle change has dollar-pipe blast radius but the default pool is NOT a gated
  surface (only the self-check gates, and it uses its own states) — flagged to manager for awareness.
- **(3) #16 honest label:** engine SHIPS strong-form φ warp → label now "trades RESHAPE the curve —
  strong-form φ warp ships … Still OPEN [needs-Aristotle]: warp∘rebase-commute and
  funding-under-moved-φ lemmas." (was "reserves move on a FIXED curve … strong form is OPEN").
- **Open for tester:** browser/visual — confirm the curve renders across the frame (not a sliver),
  τ slider rounds the ATM elbow, a trade visibly shifts the elbow (φ warp), in-band trade executes.
- **Open for manager:** oracle 80000→4.44 default change (visual-consistency need; blast-radius note
  above) — confirm acceptable for this WIP demo build before any HEAD consideration.

## Done — v27 STRONG-FORM WARP (replaces R-simple; implemented, handed to manager 2026-06-10)
Build: **`engine/builds/temporal_mvp_v27_wkurtosis_WIP.html`** (in place; HEAD v26c untouched).
Authority: `notes/research/TRADE_WARP_strongform_2026-06-10.md` (skeptic-GREEN, manager-verified).
Splice: `/tmp/splice_warp.py` (15 reps incl. caller surfaces, all `count==1`, blobs never through).
Blobs `ab663f5c`/`c505b08a` intact; 3 scripts parse; IIFE intact; longest non-blob line 553.
- **Field center φ in state** (`phi`, persisted across trades, default 0). `wField` now centers at φ:
  `u = ln(y/x) − phi`. φ threaded through: `_stampAB`, `arbitrageToOracle` (priceOfU + F-level both
  use `(u−phi)`), `rebase` (carries φ THROUGH unchanged — does NOT couple, see caveat), `sNormStrike`
  (via arb), pool default, setTau, setWingWeights, LP resize, liquidityPreview, snapshot, `curveTraceW`.
- **Strong-form `tradeUpdate`** (R-simple GONE): conserve `α=x·w(u;φ)`,`β=y·(1−w(u;φ))`; `y'=y+dy`,
  `w*=1−β/y'`, `x'=α/w*`, `u'=ln(y'/x')`, `t=(w*−wm)/dw2`, `z=t·τ/√(1−t²)`, `φ'=u'−z`. Returns
  `_stampAB({x',y',phi:φ',...})`. Verified `w(u';φ')==w*==0.697171` (matches skeptic TEST B exactly;
  R-simple's wrong 0.690620 is dropped).
- **Wing-range guard:** if `w*∉(w_−,w_+)` (|t|≥1) tradeUpdate returns `{rejected:true,reason:'wing-range'}`
  instead of a state. Surfaced HONESTLY at all 5 consumers: `executeLeg` (returns
  `{rejected,reason:'trade exceeds frozen-wing range — split or widen Δw'}`), spread leg1/leg2, and the
  3 band-close sim sites → all bubble `{ok:false, reason:'…frozen-wing range — split or widen Δw'}`.
- **Render reshapes:** `curveTraceW` walks the φ-centered field + φ-shifted F-level, so a trade VISIBLY
  moves the elbow (warp), not a dot sliding. Snapshot carries φ to the draw layer.
- **rebase caveat (skeptic-required):** rebase stays the carry-shift P→P/r; φ carried through, NOT
  coupled in a way asserting warp∘rebase commute. Code comment marks warp∘rebase-commute + φ-anchor/
  funding as OPEN `[needs-Aristotle]`. No "Balancer to 1e-13" claim made anywhere.
- **Gates:** `engine/verify/wcurve_selfcheck.js` extended with WARP block (SKIP-as-pass if tradeUpdate
  doesn't move φ): (a) α,β conserved 1e-12; (b) on trajectory hyperbola (x−α)(y−β)=αβ resid 0; (c)
  w(u';φ')==w* 1e-12; (d) φ moves ⇒ ATM weight shifts; (e) wing-cap rejects over-size + in-band accepted;
  (f) path-independent split==one-shot Δ<1e-15; + round-trip. **21 PASS 0 FAIL** on WIP; earlier 12
  still pass; HEAD v26c SKIPs (stays green). Did NOT run GH run_all (per brief).
- **Open for tester:** browser/visual — a trade reshapes the curve (elbow shifts with φ); an over-size
  trade shows the "frozen-wing range — split or widen Δw" message; in-band trade executes.
- **Open for manager:** re-verify the strong-form numbers + the φ-threading diff; warp∘rebase-commute
  and φ-anchor/funding lemmas remain OPEN/`[needs-Aristotle]` (not closed here).

## Done — v27 (W) KURTOSIS CURVE (SPEED RUN, implemented, handed to manager 2026-06-10)
Build: **`engine/builds/temporal_mvp_v27_wkurtosis_WIP.html`** (from v24
`temporal_mvp_v24_rebase_fixed_2.html`; NOTE v24 is PRE-GH — no ghCalibrate/CDF, no ghMu; HEAD v26c
untouched). Authority: `notes/research/BUILD_SPEC_wcurve_2026-06-10.md`. Splices: `/tmp/splice_wk.py`
(13 reps), `/tmp/splice_wk_ui.py` (4 reps) — all `count==1`, blobs never through. One trailing HTML-only
Edit (arb sim-aid + #16 honesty note). Blobs `ab663f5c`/`c505b08a` intact; 3 scripts parse; IIFE intact;
longest non-blob line 553. Diff vs v24 = exactly the intended regions (no blob lines 74/1060).
- **THE (W) simplification (verified):** marginal price == geometric slope EXACTLY on (W) —
  `getMP_raw=(w/(1−w))(y/x)`, NO `e^(−ghMu)` factor (that's GH-only, absent in v24). Self-check FD slope
  matches getMP_raw to 4.3e-7. Comment warns future GH cross-port not to reintroduce the factor.
- **4 curve fns → (W)** (`wField` = wMid+½dW·u/√(τ²+u²), u=ln(y/x); gLoc=w/(1−w)): `getMP_raw`,
  `tradeUpdate` (R-simple #16), `rebase` (carry-shift P→P/r via arb inverse), `arbitrageToOracle`
  (bisection inverse, 200 iters, F-level placement; round-trip 1.5e-15). New `sNormStrike` ported.
  **Compat layer:** state authoritative scalars = `{x,y,tau,wMinus,wPlus}`; `alpha=x·w`,`beta=y·(1−w)`
  re-stamped on every returned state (`_stampAB`) so the ~22 display/frame/LP/invariant read sites keep
  working. `getW`→`wField`. `wField` falls back to `alpha/x` ONLY if scalars absent (pre-(W) state).
- **mark:** `mark(wing,θ,sNorm,gamma)` smooth-pasting (Reading A, S*=K·g/(g+1)); **collapses to bare
  `markFrac=min(s/θ,θ/s)` when gamma absent/≤1** — so display paths (payoff chart) keep v24 no-premium
  behavior; pricing path (legPrice) passes `g=gLoc(state)`. **T5 simplification:** γ_loc taken at LIVE
  reserves, NOT strike's registered carry position (strike-position refinement deferred — labeled).
- **τ UI knob ADDED** (Settings → "(W) Curve Shape"): range slider 0.05–3 (`tau-input`) + readout +
  wing-weight numeric inputs `wminus-input`/`wplus-input` + live γ_loc status. Store `setTau` (static,
  clears `__curveFrame`), `setWingWeights`. Listeners redraw via `Viz.drawAll`.
- **#4 γ>1 GUARD (UI):** `setWingWeights` clamps w_± to (0.501, 0.95) — w≤½ ⇒ γ_loc≤1 violates lock;
  clamp reflected back into the inputs so the UI can NEVER show a γ<1 weight. Self-check + headless:
  `setWingWeights(0.40,0.80)` → w₋ clamped 0.501, γ_loc=3.99. Pool default τ=0.3, w_±=0.70 (γ_loc ATM
  2.33). Note: w_mid=0.5 would give ATM γ=1 (violates lock), so wings start symmetric >0.5.
- **Chart:** `curveTraceW` traces the curve with the position-dependent weight FIELD (F-level walk) so
  the ATM elbow rounds with τ while wing exponents stay frozen. `curveTrace` dispatches to it when the
  snap carries (W) scalars (else legacy). Frozen-wing geometry: symmetric (dW=0) is exact to machine
  prec everywhere; asymmetric tail exponent → w_±/(1−w_±) with residual O(1/τ²·1/u²)→0 (NOT a defect —
  the u=8 finite-u tail residual ~0.8% is the geometric approach, confirmed |diff|·u²=const).
- **#5 trade mechanic — R-simple, LABELED HONESTLY** (hard skeptic check): code comment in tradeUpdate
  + UI sim-aid both state "reserves move on a FIXED curve — NOT the full trades-reshape-the-curve warp
  (weight-field re-centering u→u−φ, OPEN)." NOT presented as the full warp.
- **Dollar pipe UNTOUCHED** (§5 hard-stop): executeLeg/closeBand settlement chain byte-unchanged.
- **Gates:** GH `run_all` does NOT apply (pre-GH). New `engine/verify/wcurve_selfcheck.js` (12 checks:
  price==slope, arb round-trip, frozen wings sym+asym, elbow rounds, γ>1 guard both directions, seam
  value+slope @ sNorm*, S*=K·g/(g+1)) — **12 PASS 0 FAIL**; SKIPs-as-pass on pre-(W) builds (no wField
  export) so HEAD stays green. Did NOT fake/invoke GH gates.
- **Theory-risk/OPEN (flagged to operator via manager):** (T1/T2) tradeUpdate R-simple — R-paper strong
  warp (w→φ map) OPEN/#16. (T3) rebase carry-covariance-in-q lemma PROPOSED-only, not Lean. (T4) funding
  price-anchor p=P + γ→±γ_loc adopted; correct-economic-anchor not proven; γ_loc at-spot not at-strike
  (T5). (T5) γ_loc-at-strike refinement deferred (used at-live-reserves). Reading A locked (not B). τ
  label direction (smaller=fatter) is operator's final call. **Open for tester:** browser/visual — τ
  slider rounds the ATM elbow with wings frozen (overlay two τ); γ<1 wing weight clamps in the UI;
  trade mechanic honesty note visible.

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

## Done — FAITH GATES (engine-faithfulness pivot, operator-ordered FIRST, 2026-06-10)
**Harness-only — ZERO HTML edits** (HEAD md5 `6cc73563` byte-unchanged). 5 new
`engine/verify/faith_*.js` wired into run_all.sh as HARD GATES after dir_gate (same positional-$1
staged-name convention, `temporal_mvp_v26b_itm.html`). Each: PASS bar in header, loud PASS/FAIL,
exit 1 on red, `--mutate` flag flips the checked relation → exit 1 (all 5 demonstrated), PLUS a
built-in always-on "mutant DETECTED" assertion (dir_gate style). All SKIP-as-pass only on pre-GH
builds (no ghCalibrate). Full run_all on clean v26c: GREEN, exit 0.
- **faith_esscher** (GHJ slope law): FD slope (central-diff tradeUpdate, NOT getMP_raw) ==
  ghP·e^(u−ghMu) at 10 walked trade states; gauge scalars bit-identical under trade; group law;
  slope-ratio==mp-ratio. TOL_FD=0.5%: measured FD plateau ~1.1e-3, h-INDEPENDENT (table-chord
  aliasing, same artifact seam gate documents — do NOT shrink h expecting improvement). Mutant =
  THE gotcha (slope vs getMP_raw, off by e^ghMu).
- **faith_rebase** (PH6): r∈{0.5,1.1,2,5}: getSNorm/sNormStrike(·,K/r)/mark invariant ≤1e-12
  (measured 4e-16); getMP_raw×1/r; arb commutes; group law; scalar bookkeeping bit-exact. Mutant =
  unscaled K post-rebase (θ 0.23 vs 0.91 @γ=2,r=2).
- **faith_reflection** (C3 residual closed): mark('put',θ,s,γ)==mark('call',θ,θ²/s,γ) ≤1e-12
  (measured 6e-16), 405 pts/γ incl. engine-registered θ; markFrac too; boundaries reflect
  sN*c·sN*p=θ². Mutant = reflect at 1.02·θ²/s.
- **faith_merton** (MERTON tie): kernel is GH λ=1 hyperbolic `exp(bh·v−ah·√(δ²+v²))`; harness
  quadrature off LIVE ghAh/ghBh/ghDelta. PINS (5e-7): σ_eff²=0.539376231136/0.324244596604/
  0.160865765074/0.0987368432408 (γ=1.5/2/3/4), M, κ(−γ), r_GH=γκ(1)+κ(−γ), r_gauss=γ(γ+1)σ²/2.
  ghM(engine A&S Bessel)==full-support quadrature ≤1e-8 (measured ~5e-10). Vieta roots {−γ,γ+1};
  strip: put root IN, Gaussian call root γ+1 OUT (GH asymmetry, integrand non-decay shown).
  Sanity anchors: κ(−2)=0 (kernel symmetry), κ(−3)=κ(1). δ enters via σ_eff² — gap r_GH/r_gauss
  −1 = +15%/+0.2%/−1.5%/+3.8% recorded. Mutant = silent δ′=2δ drift.
- **faith_fisher** (cgf''=Var=Fisher): NO direct engine κ''(t) exists (engine carries only the
  t=0/t=1 Esscher pair) — honest shadow: ENGINE means from reserve legs (F_β=1−X/Nx,
  F_{β+1}=Y/(NyM), Stieltjes over arb sweep): Δmean==∫₀¹Var_t dt and logM_T==mean_β+∫(1−t)Var_t
  (exact for the TRUNCATED exp-family = what the table implements; window [−16,18] DETECTED live
  via price-coordinate clamp readback, not assumed). TOL 1e-4 (measured ≤1.4e-5). Truncation gap
  log ghM−logM_T = 1.13e-4 @γ=1.5 (slow tilt tail), <1e-8 @γ≥2 — printed+bounded 2e-4. Mutant =
  Var×1.01 (resid→1e-2).
- **Manager note:** `d0354e5` WIP-snapshotted the first 3 mid-task; final files byte-identical.
  Remaining uncommitted: run_all.sh wiring + faith_merton.js + faith_fisher.js.

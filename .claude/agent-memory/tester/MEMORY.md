# MEMORY — tester
_Last updated: 2026-06-13, after the **CONSTMULT smoke-pass** (candidate `8f897edc`, READ-ONLY). VERDICT: 5/5 items PASS ×2 byte-stable ⇒ gate = PASS; no blocking FLAG; promotion waits on the skeptic. Prior: R-218 invtx `5fea0e8d` 4/5+OBSERVED PASS (τ-direction OPEN → now RECONCILED here); A14 at-strike `de28c937` 5/5; CONTWARP `4378bc11` 4/4._

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

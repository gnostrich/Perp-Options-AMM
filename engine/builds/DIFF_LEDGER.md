# Engine behavioral DIFF LEDGER — desirable / undesirable deltas per version, FEATURE-KEYED

_Created 2026-06-10 (operator-directed); hardened same day per operator: **this ledger is the
operator's inventory of record — the operator never keeps feature inventory themselves.**
`BUILD_LINEAGE.md` records WHAT each build is (md5 + one-liner); THIS file records how each
version transition BEHAVES — what we like, what we don't, whether undesirables got reconciled —
and every delta is keyed to the named feature it touches (`docs/feature_inventory.md` #1–#15).
**Owner: tester** populates during build verification; **the manager gates HEAD promotion on the
entry existing AND carrying the feature mapping** — an unmapped or lazy entry is a red, bounced,
not waived. Backfill written by the manager from verified evidence._

_OPERATOR-VOICE layer added 2026-06-10 (operator-directed; tester-owned). Operator's mandate,
verbatim: **"if the tester is responsible for version control then apart from just taking
screenshots and checking the UX, he has to take full responsibility to even scan the chats
transcripts to distill my objections to each version, open questions etc."** (operator directive
2026-06-10, relayed verbatim in the tester dispatch; encoded in `.claude/agents/tester.md` L44–53)._

## ⭐ FEATURE-STATE TABLE (rolling — the at-a-glance inventory; tester updates rows whose feature
changed, every entry, no exceptions)

| # | Feature (inventory) | Current state (HEAD = **v28 polar-lens `7e1ae39b`**, 2026-06-12 — v24 base + polar lens read/write/settle + cleanup C1–C9 + one-line slippage-refresh wire; promoted from FINAL `989752294` per entries 84/94/96/106; v27 `928cde1c` + GH v26c `6cc73563` demoted/retained) | Last changed | Verdict |
|---|---|---|---|---|
| 1 | Balancer base | **HEAD (v27) IS the (W) family on the literal Balancer base** F=x^w·y^(1−w) with position-dependent w(u;φ); τ→∞ recovers plain Balancer. **UX-restore `9d22cffd`: v24 dollar defaults BACK** — oracle 80000, x=10 BTC, marginal=$80,000.000 at load (y0=303,448.28 chosen so load is equilibrium — differs from v24's 800,000; flagged below). Same tabs/KPI labels/chart views/perp+band defaults as v24 (tester side-by-side). **Display-fix `1eebfcd6`: Spot($)/Spot KPI + hdr-pool-spot re-pointed to the marginal getMP_raw — $80,000.00 / 1.0000 / "spot $80,000.00" at load (v24 values)** | entry-46 smoke (`928cde1c`, FINDING-R) | DESIRABLE — v24 feel restored; Spot-KPI basis RECONCILED-in-`1eebfcd6` (y0 delta OPEN-for-ruling). **NEW OPEN (entry-46 smoke, FINDING-R): post-rebase Spot($)/hdr-pool-spot show POOL-FRAME getMP_raw, not current-$ poolMark — oracle→90000 makes Spot($) read $71,232 then post-arb $80,000 beside an Oracle box reading 90000; honest at r=1 only. Display-only; engine self-consistent** |
| 2 | Curve warp w(u) | HEAD: explicit (W) weight-field w(u;φ); warp = field-center φ shift; engine-correct (selfcheck 21 PASS); curve renders across frame. On-screen per-trade warp is SUBTLE (≈0.5–1px; verified elbow-local — sweep shows no τ matches v24's global warp with frozen wings) | entry-46 fix `928cde1c` (anchor overlay) | HEAD — engine PASS; visual subtlety ACCEPTED (override). **ENTRY-46: anchor (w=½) overlay FIXED-verified — k=√(x·y)=1,742 (was 170.83, 104× low); passes 1.15px from the live reserves dot, pixel-confirmed on the entry-45 frame (`I3_anchor_curve_default.png` re-shoot).** **ENTRY-30 obs: warp is premium-driven only (φ=f(dy=±premium)); constant-premium-further-OTM does NOT warp more — operator CHECK-1 claim NOT reproduced, see OPEN -1.** **ENTRY-45 obs: τ visual authority intrinsically small on the default frame — re-anchoring pins the elbow at the live point and wing shift is along-tangent (self-sliding); full-range τ 0.05→3.00 max 153.7px at wing tail yet perceived shape ~unchanged (screenshots); per-click (±0.05) 3.4px max = sub-visible. Redraw FIRES (canvas diff every step). See OPEN -2** **▶ C16 (`abd46149`): GOAL-SEEK readout added — G input ⇒ w′=Engine.goalSeekW(G)=G/(1+G), advisory only (drives nothing); G=3⇒0.7500/γ′3, G=0.5⇒"G≥1 required" NaN-loud, tester live ×2.** |
| 3 | Kurtosis knob τ | HEAD: **τ is a NUMBER STEPPER (no slider anywhere — 0 `input[type=range]` in live DOM), step 0.05, range 0.05–3**; keyboard ↑/↓ steps + readout + curve update live; elbow visibly rounds at $80k defaults (τ 0.05→1.5: elbow 5.6px mean/111 max, left wing 0.0px) — tester-confirmed. **Display-fix `1eebfcd6`: spinner ARROWS UN-HIDDEN (CSS L331-337) — mouse-click on the τ up-arrow steps 0.30→0.35 and the curve redraws; ALL settings/perp number fields show spinners (tester pixel+click ×2)** **▶ v28-S2 (`b53ace99`): FLAG-1 RESOLVED — the τ stepper EVENT now AUTO-REDRAWS chart 2 live (0.3→0.05=5,199px, 0.3→2=6,545px, real ArrowUp=3,894px); handler calls `if (Viz) Viz.drawAll(...)` via the ui closure (dead `window.Viz` guard removed) — tester live ×2.** | **▶ v28-lens HEAD `7e1ae39b` (one-line wire): the τ stepper now ALSO calls previewBand() — so a τ change recomputes the band-preview + the SLIPPAGE readout (non-stale), not just chart-2. Tester live ×2 byte-stable: #band-slippage τ0.3→0.5569% / τ1.0→0.9031% / τ0.1→0.4258%, returns to 0.5569% at 0.3; ArrowUp 0.3→0.35→0.5915%. Read-side τ-reactivity now covers the quantitative readout, not only the curve.** | v28-lens HEAD `7e1ae39b` (slippage-refresh wire) | DESIRABLE mechanics — stepper+redraw verified live ×2; **ENTRY-46: honest disclosure sentence added + visible at the τ control ("Visible effect scales with the wing gap (w₊−w₋) and is subtle per 0.05 step…"); per-click delta re-baselined byte-identical (3.39px analytic / 3,744px canvas one click; 153.73px full sweep)** — **BUT ENTRY-45: operator reports (correctly) the CURVE looks "almost completely insensitive" to τ — confirmed intrinsic-small visual authority (one click 3.4px max; 0.30→0.60 19.9px; 0.30→3.00 131px, all at wing tails along-tangent, elbow pinned at live point). NOT a redraw bug. Whether the knob needs more VISUAL authority = OPEN operator-tier (OPEN -2)** **▶ v28-S1 CANDIDATE (NOT HEAD, `5e1ff278`): on the polar-lens build τ visibly reshapes CHART 2 (lens read) — forced-redraw τ0.3→0.05 ≈98px elbow sharpen, wings frozen (Δψ≈5e-5); BUT the τ stepper EVENT does NOT auto-redraw chart 2 (0 px on a 0.3→3 step) because `window.Viz` is undefined and the L2702 guard is dead — FLAG-1, OPEN intern one-liner. Same operator "insensitive to kurtosis" symptom-class, here a pure redraw-wiring bug (math/draw correct).** **▶ C16 (`abd46149`): τ stepper still reshapes chart-2 live; the lens factor Φ_τ scales the new held-lens warp view (Φ_τ→1 in the wings drives the exponent-warp OTM growth) — tester live ×2.** |
| 4 | Carry P=Ny/Nx, q=ln p | HEAD (v27): carry = price leg q=ln p; reads via getMP_raw; engine-consistent (selfcheck) | v27 | DESIRABLE — stable |
| 5 | Rebase (P→P/r) | HEAD (v27): rebase = carry-shift q→q−ln r (NOT rigid x→r·x); **warp∘rebase-commute OPEN [needs-Aristotle]**, deliberately not coupled. **ENTRY-46 smoke: rebase path UI-exercised first time — engine consistent (arb closes the poolMark gap exactly) but the $ KPIs display the pool FRAME, see FINDING-R row #1** | v27 (+ entry-46 smoke obs) | OPEN lemma — theory-risk-accepted; FINDING-R display item OPEN |
| 6 | Pricing law value∝S^(−γ) | HEAD (v27): value∝S^(−γ_loc) under Reading A (operator-ruled, entry 11 "a"); wings exact power-laws | v27 (+ v28-S1 candidate obs) | DESIRABLE — Reading A ruled. **▶ v28-S1 (`5e1ff278`): pricing READ through the polar lens g_loc=γ·h′_τ(|u|) on chart 2; value∝S^(−γ_loc) preserved in the wings (selfcheck 5c g_wing→γ-scale); elbow rounds with τ, wings frozen — tester-confirmed live** |
| 7 | ITM American smooth-pasting | HEAD (v27): ported with g→γ_loc (Reading A); seam value/slope selfcheck PASS; mark/markFrac split present. NOT carried from the GH line: payoff naked-leg uncap + x-range −90..+200 (HEAD payoff caps at 1, ±50%) — NOTES D9/D10 **▶ v28-S2 (`b53ace99`): SETTLE-side lensed — `markEff`/`legValueUnified` price the ITM leg LENSED at the reciprocal sNorm mode; one-ITM-leg path live-verified (steep pool, sold-call driven ITM → settled_cash_leg=sold/live_leg=bought, raw_net finite); near-ATM g_loc≈0 settles finite (markLensed g=0→1, no NaN).** | v27 (+ Task-2 diff) (+ v28-S1 candidate obs) | HEAD — seam PASS; 2 GH-line payoff upgrades unported (noted for future). **▶ v28-S1 (`5e1ff278`): lens twin `markLensed` (Reading-A smooth-paste with strike-local g) — seam value/slope continuous incl. g<1 (selfcheck 4a/4b), and the g=0/S*=0 ATM point returns finite boundary value 1 (no NaN, MUST-APPLY-2) — tester live-probe + selfcheck 4c agree** |
| 8 | Uniform strike registration θ=sNorm(K) | HEAD (v27): sNormStrike ((W) inverse) defined+exported (round-trip 1.46e-15, NaN-loud) but **export-only — no regLeg wiring**; payoff sweeps price-ratio (1+r); the v26c one-mark-across-display/exec/chart guarantee + all-γ crossover@K are UNVERIFIED on (W) — NOTES D11/D13/D16 | v27 (+ Task-2 diff) | PARTIAL — function present, uniform wiring unported (noted for future) |
| 9 | Funding | HEAD (v27): re-pointed to price-anchor p=P, γ→±γ_loc [theory-risk-accepted] — diverges from the GH line's locked w=½ funding; φ-anchor/funding lemma OPEN [needs-Aristotle] | v27 (+ v28-S1 candidate obs) | OPEN — theory-risk; not UI-exercised on v27. **▶ v28-S1 (`5e1ff278`): funding routes THROUGH the lens (±g_loc replaces ±2). UI-exercised: with S≠1 (steep pool), ATM funding=0 (g_loc→0), OTM call +2.23e-3 / put −2.23e-3 (opposite-signed, equal magnitude), all finite — tester-confirmed. Operator RULED funding-through-lens accepted (entry-93 "5 idc, same geometric thing")** |
| 10 | Slippage basis (mpGeom) | HEAD (v27): mpGeom collapses to getMP_raw (price==slope on (W), proven, selfcheck L4). NOT carried: v26a's honest $-tooltip ("Layer-1 reserve-USD, not trader honest-dollar") — HEAD ships the v24 tooltip — NOTES D2 **▶ v28-S2 (`b53ace99`): executed slippage plain v24. FINDING-RT (OPEN, INHERITED-v24): instant open→close round-trip on a two-OTM-leg band is TRADER-favourable (raw_net>0, scales with slippage; byte-identical in S1+v24) — brief expected pool-favourable; sign-convention escalation. Band-PREVIEW xoracle inflation still carried (entry-96 bug-batch).** | **▶ v28-lens HEAD `7e1ae39b` (one-line wire): the band SLIPPAGE readout now LIVE-RECOMPUTES on a τ change (previewBand re-runs on the τ stepper event) — confirmed non-stale, 4 distinct values across the τ range, monotone-with-τ (manager-derived ~0.25→0.76% trend), tester live ×2. Root: lensed/τ-threaded legPrice ⇒ τ-dependent leg2 reserve move ⇒ τ-dependent s_band. No engine/math change (display-refresh wire). FINDING-RT still OPEN/INHERITED-v24.** | v28-lens HEAD `7e1ae39b` (slippage-refresh wire) | DESIRABLE math; $-label honesty unported (noted). **ENTRY-46: BOTH entry-45 band-panel display defects RECONCILED-in-`928cde1c`, tester live ×2 — (a) stale-on-reject: `clearBandPreviewOut()` wired on every reject path, STALE-CHECK FALSE on swap/pill/oversize; (b) audit strip prints raw engine USD exactly (28,453.17/11,470.09/39,923.26 on the entry-45 reference band — was $3.19B).** **ENTRY-45 (historical): 2 display defects: (a) STALE-ON-REJECT — previewBand reject paths (!sim.ok / club guards) set the warn but DON'T clear summary/audit ⇒ slippage/N_buy/net-cash retain the PREVIOUS direction's numbers next to the rejection banner (the operator's screenshot state); (b) ×ORACLE UNIT INFLATION — pv-net-cash/pv-dy-sold/pv-dy-bought multiply raw-USD engine dy by oracle again ⇒ "$3,193,860,736" net cash on a $303k pool (engine netPoolY=39,923.26 raw USD, correct; display ×80,000)**  **▶ v28-S1 (`5e1ff278`): executed slippage is plain v24 (lens does NOT touch it; the slippage % readout is sane, e.g. 1.9322% ≈ $73.62). BUT the band AUDIT strip nets (pv-net-cash/pv-dy-*) carry the v24-base ×oracle DOUBLE-MULTIPLY ($618M on an $800k pool) — VERIFIED byte-identical to the v24 base (V_usd already ×oracle L1755, display ×oracle again L3050-52); INHERITED-v24, not a Stage-1 regression; OPEN (candidate v24 known-gap fix).** |
| 11 | Dollar/settlement pipe | Reused byte-identical from the v24 base; curve-independent **▶ v28-S2 (`b53ace99`): the LENSED value is now the unit of account (operator entry 96 RULED) — open-band portfolio value moves with τ (Δ=4.544e-2 across 0.3→2); closed bands freeze settlement $; NO mixed-basis (8 carved-perp-unit cells carry no `$`; exactly 1 $ settlement cell; carved perp slice un-lensed, not summed) — tester live ×2.** | — (unchanged) | DESIRABLE — stable (reuse) |
| 12 | getMP_raw price-coord gotcha | HEAD (v27): price == geometric slope EXACTLY on (W) (no e^μ factor); code comment warns against re-introducing the GH factor on a cross-port | v27 | DESIRABLE — moot by construction, warning kept |
| 13 | Solvency boundary (B1) | OPEN ship-gate, unchanged by the promotion (not claimed closed) | — | OPEN — the known hole |
| 14 | Esscher tilt / rapidity group | HEAD (v27): trade = weight-slot field-center translation φ; premise skeptic-verified FAITHFUL to paper+v24 (entry-27 cross-check); no X·Y invariant claimed | v27 | DESIRABLE — grounded |
| 15 | File-safety gate | Display-fix build `1eebfcd6`: blobs canonical `ab663f5c…` (L74) / `c505b08a…` (svg line shifted 1060→1064 by new CSS, content canonical; line-md5 tester re-verified), 3 scripts parse; 0 console errors live ×2 **▶ v28-S2 candidate (`b53ace99`): file-safety GREEN — blobs `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse, lens_selfcheck 23/0, 0 console errors live ×2, build md5 unchanged post-run.** | entry-46 build `928cde1c` (HEAD); v28-S1 `5e1ff278` (candidate line) | DESIRABLE — stable. HEAD re-verified entry-46 smoke (md5 `928cde1c`, blobs L74/L1064, 3 scripts, run_all 22/22, 0 uncaught ×2). **▶ v28-S1 candidate (`5e1ff278`): file-safety GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse, lens_selfcheck 14/0, 0 console errors live ×2** |
| 16 | **Warp-with-trades (strong-form)** | HEAD (v27): IMPLEMENTED (α=x·w, β=y·(1−w) conserved; φ recenter; selfcheck WARP a–f PASS; skeptic-verified the unique conservation-consistent trade). On-screen warp subtle (elbow-local by design; cannot match v24's global warp with frozen wings — verified sweep). **Operator promoted over my visual blocker (entry 28) — recorded OVERRIDDEN, not resolved**; anchor-overlay/amplified-warp viz still open | v27 promotion (entry 28) (+ entry-30 TEST-ONLY note) | HEAD — engine PASS; ACCEPTED(operator). **ENTRY-30: composite-ray spread→single-tx at θ*=√(θ₁θ₂) CONFIRMED exactly (residual 0); but premium-controlled warp NOT reproduced (strike not in tradeUpdate) — OPEN -1.** **ENTRY-45 quantification: the band path (the ONLY UI trade) nets sold-premium−bought-premium ⇒ tiny dy ⇒ tiny φ: 1 BTC band nets ≈$1,626 → Δφ 7.4e-3; cumulative 3 BTC/$240k notional → 2.14px max curve shift. Warp invisibility is STRUCTURAL on the band path, compounding the elbow-local subtlety** **ENTRY-46 smoke: unchanged (engine byte-identical) — 0.05-BTC execute Δφ=4.44e-4; preview steppers + w-readout (the sub-pixel-legibility surrogate) verified working** **▶ C16 goal-seek-warp CANDIDATE (`abd46149`, NOT HEAD): the trade-preview now RENDERS a HELD-LENS warp on chart-2 — a 2-BTC sold-CALL leg moves w 0.500→0.536 (γ 1.000→1.154) and the dashed preview curve VISIBLY diverges into an asymmetric skew (separate lower left-shifted peak; zoom-confirmed `ZOOM_pricing_step1.png`), NOT flat/re-registered. First build with an UNMISTAKABLE single-trade warp on screen (vs v27 sub-pixel). ★ FINDING-WARP-DIR: the DRAWN value-warp |Δψ| is largest at the elbow and SHRINKS OTM (θ=1.05→0.2742, θ=4.0→0.0063) while the EXPONENT warp dG(u) GROWS OTM (0.0254→0.1510) — slope-warp grows OTM, value-warp does not (mark ψ→0 OTM); the spec literal "visible separation grows OTM" is NOT what renders — OPEN operator-tier (rolling -6). FINDING-TRADE-AT-STRIKE: entry-127 asset-at-strike model not in this READOUT/VIEW build (rolling -5).** **▶ CONTWARP candidate (`4378bc11`, 2026-06-12, gates HEAD): the C16 held-lens view is SCRAPPED (operator entry 158 + skeptic VERDICT_CONTINUOUS_SKEW); the trade preview now ANIMATES the skew continuously on chart-2 — ~0.8s rAF sweep pre→post, each frame the live lensed read at its own sliding 45°-tangent point (mode 1.0000→0.9729 on a 0.5-BTC one-sided leg), wings steepen (g(θ=4) 0.9774→1.0055), crossed strike dips through ≈0 (θ=0.985: 0.0503→0.0044→0.0423 = the mechanic, skeptic-ruled do-not-fix); lands PX-IDENTICAL (diff 0) to HEAD's static preview; engine block byte-identical; chart-1 inert throughout; tester live ×2 byte-stable, 4/4 PASS.** |

## Entry template
```
## vX → vY (<one-line scope>)   [status: HEAD-promoted / candidate / demoted]
FEATURES:       inventory #s touched (and "none beyond" — explicit), per docs/feature_inventory.md
DESIRABLE:      behavioral improvements, with the number/evidence that shows it [feature #]
UNDESIRABLE:    regressions/costs, each marked OPEN / RECONCILED-in-vZ / ACCEPTED(why) [feature #]
NEUTRAL:        visible changes that are neither (renames, layout)
OPERATOR-VOICE: the operator's OWN words on this version, distilled from transcripts — objections
                (VERBATIM quote + source ref), open questions, rulings given/pending; each marked
                OPEN / RESOLVED(evidence) / RULED(quote). Never paraphrase into something easier.
EVIDENCE:       evidence/ paths, gate runs, tester verdict
+ update the FEATURE-STATE TABLE rows for every feature # listed
+ update the OPERATOR OPEN QUESTIONS rolling list below
```

## ⭐ OPERATOR OPEN QUESTIONS (rolling — tester-maintained from transcripts; the skeptic
audits this list against the raw transcripts to catch unresolved-presented-as-resolved)

> **PROVENANCE / HONESTY NOTE on the transcript record itself (tester, 2026-06-10 backfill +
> v27 update):** `history/transcript_journal.txt` is a catalog of session SUMMARIES (last entry
> 2026-06-06); `history/session_tree_note.md` (4100 ln) is the append-only canonical note of the
> **pre-GH era** and **ends at the curve-shape pivot**. **NEW (v27): `history/operator/` now
> carries verbatim per-§2.2 transcripts — `2026-06-10_kurtosis-curve-family-brief.md` (20
> entries) is the FIRST raw-verbatim operator record for the work this candidate implements.**
> The GH-era sessions (v25 GH bake, v26a/b/c — 2026-06-08; governance — 2026-06-09) still have NO
> raw transcript. Items below are labelled **[verbatim-transcript]**, **[manager-recorded
> paraphrase]**, or **[summary-stub]** accordingly.

### OPEN (operator asked / objected; no recorded resolution)

-A14b. **★ KURTOSIS-WARP-TEST (operator entry 203, NOT yet tested) — the warp-magnitude-vs-KURTOSIS
   half of the operator's question is still owed.** Operator `[verbatim-transcript]`
   `history/operator/2026-06-10_kurtosis-curve-family-brief.md:1582`: *"im not infront of laptop, so
   did u test thr tiings is mentioned about curve warp magbitude otm kurtosis etc..?"*; entries 184/185
   (`…:1434`): *"if i make kurtosis steeper (less value in the html), that would imply … even more warp
   not less right"*. The A14 smoke ANSWERED the warp-magnitude-vs-OTM half (Item 1: warp rises with
   strike, AS5) but did NOT test the warp-MAGNITUDE-vs-τ coupling the operator describes (steeper τ ⇒
   a strike reads further-OTM ⇒ more warp). The A14 run confirmed τ RESHAPES chart-2 (read-side) but
   not the magnitude coupling. **Status: OPEN — targeted vs-τ warp-magnitude test owed; flag to manager.**

-A14a. **★ FLAGGED-LABEL (skeptic-flagged, tester-observed at A14 HEAD `de28c937`) — the band-preview
   Audit strip MISLABELS the at-strike net pool move.** The header literally reads **"Pool Δ
   (cash-conserving ⇒ Δy_net ≈ 0)"** and the field **"net trader cash @ open"**; with the at-strike
   swap the field shows **"$16,623.290372"** for a valid long band (NOT ≈0, NOT trader cash — it is
   `netPoolY = leg1.dy + leg2.dy`, the net pool cash move; the at-strike swap is no longer
   cash-conserving). The header text is a pre-A14 premium-fraction-era assumption. Tester read-only:
   observed + quoted, NOT fixed. **Status: OPEN — UX-clarity relabel for the intern (not an engine
   change); flag to manager.**

-6. **★ C16 goal-seek-warp (`abd46149`, tester finding — the gating nuance) — the DRAWN warp on the
   trade preview is largest at the ATM elbow and SHRINKS out-of-the-money; the slope/exponent warp
   dG(u)=(γ′−γ)·Φ_τ(|u|) grows OTM but the option-VALUE separation does not (mark ψ→0 OTM).** [#16]
   The C16 spec asked the tester to confirm "the warp is LARGER further OTM … visible separation grows
   OTM" — tester live ×2 + zoom: the EXPONENT warp grows OTM (|u|=0.05→0.0254 … |u|=1.40→0.1510) but
   the DRAWN |Δψ| shrinks OTM (call θ=1.05→0.2742 … θ=4.0→0.0063; deep wings converge). Bears directly
   on the operator's *"the curve warps more at further otm strikes for same premium"*
   (`history/operator/2026-06-10_kurtosis-curve-family-brief.md:239` [verbatim-transcript]) AND on the
   operator's own counter-intuition *"trade far out … goal seeks another slope close to infinity so its
   not a huge warp imo you're probably missing something obvious"* (`…:320` [verbatim-transcript], which
   PREDICTS a small far-OTM warp). **Status: RESOLVED(superseded), 2026-06-12 — operator entry 158 [verbatim-transcript L1216] re-ruled the
   mechanic CONTINUOUS and live-centered, and the skeptic (VERDICT_CONTINUOUS_SKEW_entry158) SCRAPPED the
   held-center frame this finding was measured in, FLAG-WRONGing the held-frame premise (telescoping identity:
   the live read is the true end state; the near-center flattening is genuine skew dynamics). The C16 build
   (`abd46149`) was never promoted; the CONTWARP candidate (`4378bc11`) implements the ruled mechanic and the
   tester confirmed the ruled geometry live (wings steepen, crossed strike dips). The slope-vs-value OTM
   perception question is dissolved by the new ruling, not adjudicated.** Evidence `evidence/v28_lens_warp/` (`ZOOM_pricing_step1.png`,
   `RUN_LOG_run{A,B}.txt`), harnesses `engine/verify/pw_v28_lens_warp_smoke.mjs` + `pw_v28_lens_warp_zoom.mjs`.

-5. **★ C16 (`abd46149`) — entry-127 asset-at-strike AMM-tx model is NOT in this build.** [#16, #10]
   Operator `[verbatim-transcript]` `history/operator/2026-06-10_kurtosis-curve-family-brief.md:961`:
   *"that's probably because you're not doing the AMM tx right. buy call is buy asset for dollars at
   strike on AMM, buy put is sell asset for dollars at strike on AMM"* — the operator's most recent
   root-cause diagnosis of flat-warp. C16 adds a goal-seek READOUT + a held-lens warp VIEW; the trade
   mechanic still moves w from the band's net cash (not an asset-at-strike swap). **Status:
   RESOLVED(evidence), 2026-06-12 — A14 HEAD `de28c937` ships the at-strike swap: `executeLeg` pool
   cash per leg `dy = (wingSign·legSign)·N·K_usd`, K_usd=θ·oracle (asset-for-dollars at the dollar
   strike). Tester live ×2 (single sold call dy/Δw rise with strike) + gates AS1 (|dy|==N·K) / AS5
   (warp-rises-OTM, Δsteepness==dy/β). The entry-127 mechanic is DELIVERED.**

-4. **★ v28-S2 (tester finding, operator has not seen) — instant open->close round-trip on a TWO-OTM-LEG band
   is TRADER-FAVOURABLE (positive raw_net) and SCALES with slippage; the brief's "pool-favourable residual"
   is contradicted on the SIGN.** [#10, #11] On `temporal_mvp_v28_lens_S2.html` (`b53ace99`) a band whose
   open net-cash is ~0, closed immediately, returns raw_net = Y - X > 0 (trader wins, per the engine's own
   L2146 close logic) and growing super-linearly with size: N=0.01 -> +1.57e-4, N=0.05 -> +3.71e-3,
   N=0.2 -> +4.30e-2 (tracking slip 0.24%/1.17%/4.25%). Root = the v24 closeBand geometry (both same-sign legs
   reverse in the trader's favour). **VERIFIED byte-identical raw_net in S1 AND the v24 base** -> INHERITED-v24,
   NOT introduced by the lens. NOT an operator question yet; entry 96 ruled "settle at lensed prices" but did
   NOT rule on whether an instant round-trip should be trader- or pool-favourable. **Status: OPEN — manager to
   escalate the sign convention to the operator. Cannot be marked resolved without an engine change or an
   operator ruling that the current trader-favourable round-trip is acceptable.** **CARRIED to the
   v28-FINAL promotion build `989752294` — re-confirmed live ×2 (raw_net=+8.347e-3 two-OTM-leg;
   the one-ITM-leg steep case is correctly POOL-favourable raw_net=−4.797e-3). Does NOT block the
   promotion gate.** Evidence `evidence/v28_lens_FINAL/RUN_LOG_run{A,B}.txt` (STD settle step) +
   `evidence/v28_lens_S2/probes/` (sign_vs_slippage / compare_S2_S1_v24 / roundtrip_dissect), harnesses
   `engine/verify/pw_v28_lens_FINAL_smoke.mjs` + `pw_v28_lens_S2_smoke.mjs` (Step 3).

-3. **★ v28-S1 (tester finding) — the KURTOSIS τ knob did NOT auto-redraw chart 2 on the Stage-1 lens
   build → RESOLVED in v28 Stage 2 (`b53ace99`).** [#3] NOT an operator question yet (the build post-dates the last
   operator turn) — recorded here because it is the SAME CLASS as the operator's standing entry-45
   objection (*"did you check that the curve is almost completely insensitive to kurtosis change?"*,
   `history/operator/2026-06-10_kurtosis-curve-family-brief.md:341` [verbatim-transcript]) and would
   reproduce that exact complaint on `temporal_mvp_v28_lens_S1.html` (`5e1ff278`). Tester live ×2: a
   τ 0.3→3 step via the real stepper yields 0 px change on chart 2; root cause is the L2702 handler
   guarding its redraw on `window.Viz` which is undefined (Viz is a const IIFE at L3175 never put on
   window). The lens math + draw are correct — a forced redraw (Advance Time / Arbitrage / trade /
   Reset) shows the full ≈98px elbow reshape. **Status: RESOLVED-in-`b53ace99` (v28 Stage 2) — tester live ×2: the tau stepper EVENT now
   auto-redraws chart 2 (0.3->0.05 = 5,199 px, 0.3->2 = 6,545 px, real ArrowUp click = 3,894 px; the
   L2724 handler now calls `if (Viz) Viz.drawAll(...)` reaching Viz via the ui-script closure, the dead
   `window.Viz` guard removed). The deferred FLAG-1 confirmation is COMPLETE — the Stage-1 blocker is gone.**
   Evidence `evidence/v28_lens_S2/` (S1_00/01/02), harness `engine/verify/pw_v28_lens_S2_smoke.mjs`;
   original finding evidence `evidence/v28_lens_S1/`, harness `engine/verify/pw_v28_lens_S1_smoke.mjs`.

-2. **★ ENTRY 45 — operator live-play, four lacunae (τ insensitivity / long↔short "breaks" /
   anchor in corner / no visible warp).** [#2, #3, #10, #16] Operator `[verbatim-transcript]`
   `history/operator/2026-06-10_kurtosis-curve-family-brief.md:341`: *"did you check that the curve
   is almost completely insensitive to kurtosis change? theres no visible curve warp, and the
   simulation breaks when you switch long to short.... i'm concerned at these lacunae, skeptic,
   tester. the anchor curve is sitting way off in the corner somewhere"* — tester live ×2
   (`evidence/v27_entry45/`): **(τ)** CONFIRMED intrinsic-small visual authority, NOT a redraw bug
   — one click 3.4px max, full range 131–154px but at along-tangent wing tails, elbow pinned;
   whether the knob should have more visual authority = OPEN operator-tier. **(switch)** NO crash
   (0 uncaught exceptions, 5 scenarios + pill + execute); the screenshot state reproduced = the
   STALE-ON-REJECT frankenstate (warn + dead Transact under retained live-looking numbers; their
   18.2297%/0.536960 BTC were the previous direction's stale preview) + a ×oracle display inflation
   ($3.19B net-cash) in the same panel — both OPEN intern-fixable UI defects. **(anchor)** CONFIRMED
   — w=½ overlay drawn with (W)-units depth (k=170.83 ⇒ xy=29,186) sits 104× below the live curve,
   a gray L hugging the origin; known-OPEN viz item, root cause now exact. **(warp)** CONFIRMED
   invisible — band path nets premiums ⇒ Δφ 7.4e-3/BTC ⇒ 2.14px after $240k notional; structural,
   ties to OPEN -1 and the entry-28-OVERRIDDEN blocker. **Status (amended entry-46 smoke, build `928cde1c`): defects (b) stale-on-reject + ×oracle audit
   and (c) anchor-in-corner are RESOLVED(`928cde1c`, tester live ×2 — STALE-CHECK FALSE ×3 paths;
   exact-dollar audit; anchor 1.15px through the live dot). REMAINING OPEN: τ visual-authority and
   warp-visibility design questions (operator-tier); the τ control now carries an honest disclosure
   sentence (transparency, not a resolution of the design question).**

-1. **★ ENTRY 30 — premium-controlled warp NOT reproduced on HEAD `1eebfcd6` (the central CHECK-1
   claim).** [#2, #16] Operator `[verbatim-transcript]`
   `history/operator/2026-06-10_kurtosis-curve-family-brief.md:217`: *"for same premium (perp option
   price * notional) as you sell further OTM inner bound, the curve would warp more."* **tester
   live-verified ×2: at CONSTANT premium the curve warp is byte-IDENTICAL across the OTM ladder
   (φ-shift 3.8429e-3, 0.436px, slip 0.9716% at every rung) — it does NOT increase further OTM.**
   Root cause is structural: engine `tradeUpdate(s, dy)` (L1723) takes only the cash delta; the
   strike θ is never an argument, so φ′ = f(entry-state, dy=±premium) alone. The notional-constant
   contrast (:219) DOES hold (further-OTM ⇒ warps less, premium+slip shrink). The composite-ray
   "AMM tx shortcut" (:223) is CONFIRMED exactly. **Status: OPEN — manager to escalate to operator;
   the engine has no strike-dependence in the warp. NOT a render artifact (engine-state truth +
   px re-projection both reproduce ×2). Evidence `evidence/v27_premwarp/`, harness
   `engine/verify/pw_v27_premium_warp.mjs`. CANNOT be marked resolved without an engine change or
   an operator ruling that the current premium-only warp is acceptable.**

0. **★ v27 — the operator's SIGNED visual acceptance test: item-3 (trades-warp) NOT met on
   screen — BLOCKER OVERRIDDEN BY OPERATOR RULING (entry 28, HEAD-promoted anyway); recorded
   overridden-NOT-resolved.** [#2, #3, #16] The operator's acceptance is explicitly *visual*:
   "Acceptance (your signed test, orthogonality relaxed): one number → turn it → **elbow visibly
   rounds → wings don't move** → static → options read off as perpetual-American → **trades warp
   the curve, not a dot sliding**." (`history/operator/2026-06-10_kurtosis-curve-family-brief.md`
   Entry 1, line 14 [verbatim-transcript]). Re-stated: v24 chosen "because how the curve warps
   actually and **shows on UX**" (Entry 2, line 28 [verbatim-transcript]); "no point without
   trades-warp thing … this is half the job" (Entry 19, line 140 [verbatim-transcript]); "when
   can i actually get a version to play around with!?" (Entry 17, line 133 [verbatim-transcript]).
   **Tester FINDING (live Playwright, this run):** the engine is correct (selfcheck 21 PASS; my
   live-engine read confirms τ rounds the elbow in γ_loc, wings τ-independent, and a trade moves
   φ 0→10.59 / w 0.85→0.75 on the exact trajectory) — **but none of it rendered legibly** in the
   ORIGINAL run (build `3914c7f4`): operating point at u₀≈11.3, off the [−6,6] trace window, sliver
   curve, τ indistinguishable, pre-/post-trade pixel-identical (warpFullDiff=0).
   **★ UPDATE — RENDER-FIX RE-RUN (build `b245bfda`, 2026-06-10, this turn): PARTIALLY MET (2 of 3).**
   The fix (curveTraceW centers the window on 0.5·(u₀+φ), straddling BOTH the live operating point
   and the elbow; default pool now asymmetric x10/y12 u₀≈0.18, w₋0.60/w₊0.85, oracle→4.44; #16 label
   updated) lands two headline items: **(1) curve renders across the frame** (fracW 0.937/fracH 0.93,
   GH-continuation, NOT a sliver — `A_R01_default_curve.png`); **(2) τ visibly rounds the elbow**
   (elbow silhouette ≈36px vs the prior ≈0.9px; `A_R02`τ0.05 vs `A_R03`τ3.0 clearly differ;
   frame-independent slope-angle math confirms it is the ELBOW rounding (Δ up to 13° at u∈[−2,+0.5])
   while WINGS stay frozen (Δ 0.0001° u=−10, 0° u=+10)). **(3) the trades-warp is STILL
   screen-invisible** — driven through the REAL UI band-execute (prior render()/Viz harness calls
   were silent no-ops — see methodology note in the v27 entry), the live curve shifts ≈0.5px
   (φ:0→0.0011) for a normal band, and 6 cumulative max-size trades reach only φ≈0.029 / ≈1px
   (`bigwarp_post.png`). The post-trade dotted overlay sits on top of the solid curve; the trade
   reads as **"a dot sliding" — exactly what the operator said it must NOT be.** Root cause of (3)
   is NOT the renderer (math verified φ-dependent in-frame) — an admissible (W) trade on this pool
   produces a sub-pixel φ. **VISUAL-ACCEPTANCE = FAIL (item-3, the HEADLINE).** Still NOT
   operator-playable for the signed test. Needs a much higher per-trade φ gain or an amplified/
   animated warp viz.
   **★ FINAL STATUS (entry 28, 2026-06-10): OVERRIDDEN — HEAD-promoted by operator ruling.**
   Diagnostic chain the operator ordered and saw before ruling: entry 24 "compare with v24 and see
   if we have similar order of magnitude…" [verbatim-transcript] → reconcile: v24 warps, v27 warps
   30–1000× less at the matched setting; entry 26 conjecture "is there a kurtosis where this
   compares to v24's curve warp … I personally think there should be settings where it works
   well, its too natural not to" [verbatim-transcript] → verified sweep answer: NO — no τ matches
   v24's global warp while keeping wings frozen (the warp is elbow-local BY DESIGN of the
   frozen-wing geometry); entry 27 premise cross-check → skeptic-verified FAITHFUL to paper+v24.
   Operator then ruled (entry 28 [verbatim-transcript]): "firstly, commit this version to head
   because theres nothing useful since v24". My item-3 visual finding stands as FACT (the
   per-trade warp IS subtle on screen); the operator promoted with that fact on the table — an
   override, not a fix. Residual polish OPEN: anchor-overlay / amplified-warp viz.

0b. **★ v29-objection (entry 29) — "not able to play with it" / v24-UX-divergence / no-sliders — ADDRESSED; both residuals RECONCILED in display-fix `1eebfcd6`.** [#1, #3]
   Verbatim (`history/operator/2026-06-10_kurtosis-curve-family-brief.md` Entry 29
   [verbatim-transcript]): "do a quick UX test, I dont know what you did in the past but i'm not
   able to play with it. why has anything in the UX changed from the v24 case including default
   parameters? I mentioned also I dont want sliders anymore just updown arrows with appropriate
   sesicitivty". Tester verdict (this run, live ×2): **operator-playable now** — load → curve
   across frame at the $80k dollar scale → step τ → trade executes → readouts move, 0 console
   errors. No sliders anywhere (0 input[type=range]). RESIDUALS OPEN: (i) τ's up/down ARROWS are
   CSS-hidden — mouse-click stepping dead on the knob the instruction was about (keyboard arrows
   work); (ii) Spot ($) KPI reads $30,344.83 (raw reserve ratio y/x) where v24 showed $80,000 —
   the first dollar number on screen still diverges from v24. See the UX-restore entry below.
   **★ UPDATE (display-fix `1eebfcd6`, 2026-06-10): both residuals RECONCILED (tester live ×2)** —
   (i) spinner CSS un-hidden: τ up-arrow mouse-click steps 0.30→0.35 + curve redraws
   (D_04/D_06); (ii) Spot($)/Spot read $80,000.00 / 1.0000 at load (marginal basis, D_02) and
   hdr-pool-spot reads "spot $80,000.00" (same basis, D_03). The operator's updown-arrows +
   $80k-world ask is MET. Remaining from the v24-divergence clause: y0 default-delta only
   (OPEN-for-ruling).
1. **Curve / kurtosis-knob family — RULED to (W) + Reading A; sub-flags below.** [#2, #3, #6]
   The curve family is now RULED: the (W) weight-profile family on the v24 base (Entry 2 "v24 is
   the best reference because its sort of pure balancer", Entry 4 "yes" to the polar-lens
   read-back, Entry 5 "start" [verbatim-transcript]). Settlement RULED Reading A: "a" (Entry 11
   [verbatim-transcript]). Speed-run + theory-risk authorized: "fast track all 3 concurrently …
   you have autonomy … prioritise speed … take some theory-risk allowing this to build, as long
   as it meets the core charter" (Entry 18, line 154 [verbatim-transcript]). Build held until the
   trades-warp landed: "option 2: no point without trades-warp" (Entry 19 [verbatim-transcript]).
   STILL-OPEN sub-flags carried from the build spec / strong-form note:
   - **Knob LABEL/sign — OPEN, operator's call.** v27 ships "Smaller τ = sharper elbow
     (leptokurtic); larger τ → plain Balancer." The lead flagged the label is the operator's call
     (`notes/research/BUILD_SPEC_wcurve_2026-06-10.md` §6); operator Entry 3 "steepness and
     kurtosis are interchangeable words from my perspective" [verbatim-transcript] but no explicit
     sign ruling. OPEN.
   - **τ default = 0.3 (slider) but the DEFAULT POOL ships SYMMETRIC wings w₋=w₊=0.70 ⇒ Δw=0 ⇒
     the (W) warp is DEGENERATE (τ does nothing, every trade is wing-range-rejected).** A new
     undesirable, see v27 entry. Operator never specified a default pool config — OPEN (needs an
     asymmetric default so the features are live out of the box).
2. **B1 solvency ship-gate — OPEN (the known hole).** [#13] Unchanged; v27 does not touch it.
3. **γ/σ calibration tier — OPEN product call.** [#6, #7] Unchanged. v27's γ_loc is wing-set at
   setup (w₋,w₊), no oracle-fed vol; the tier ruling is still pending.
4. **Engine-faithfulness PIVOT — SUPERSEDED by the v27 speed-run on the (W) line.** [#12] The
   pivot was HELD ("do NOT begin the pivot until told", `MEMORY.md:163`); the operator instead
   ordered the (W) build off v24 (Entry 18 [verbatim-transcript]). Recorded so the old HOLD is
   not cited stale; the (W) candidate is the active line.
5. **|Γ|>1 "labelled approximation" rider — STILL un-verified in UI/paper.** [#7] v27 runs γ_loc>1
   (true-American regime). I did NOT find any approximation LABEL in the v27 UI. Rider stands.
6. **Layer-2 honest-dollar slippage $ — DEFERRED (unchanged).** [#10, #11] v27 reuses the v24
   dollar pipe byte-for-byte; no Layer-2 path. Unchanged.
7. **Warp∘rebase-commute + φ-anchor/funding-under-moved-φ — OPEN [needs-Aristotle].** [#5, #9]
   The strong-form note flags both lemmas OPEN (`TRADE_WARP_strongform_2026-06-10.md` §v.2–3);
   v27 deliberately does NOT couple φ in rebase to avoid asserting commutation (engine comment
   lines 1716-1718, 1753-1755). Load-bearing for the frame; not closed. OPEN.
8. **Settlement Reading A vs B — RULED A, B deferred (operator-tier).** [#6] Entry 11 "a"
   [verbatim-transcript]. If the operator later wants B, the mark exponent picks up the elbow
   blend correction. Recorded; not re-opened.
9. **Stale-era operator questions (auto-protect Q14/Q15) + Ops minor (`$ARISTOTLE_API_KEY`
   brackets) — OPEN-stale / OPEN-minor.** [unchanged from prior list]

### RESOLVED / RULED (kept here so the skeptic can check none were quietly re-opened or
mis-claimed; full per-version detail in the entries below)

- **★ v27 HEAD PROMOTION — RULED (entry 28 [verbatim-transcript], 2026-06-10):** "firstly,
  commit this version to head because theres nothing useful since v24 -- in parallel let the
  testing / versioning guy do a feature level diff to confirm any potentially desirable changes
  we made since apart from this core, and simply make note for future reference." OVERRIDES the
  tester's visual-layer blocker (item 0 above — recorded overridden-NOT-resolved). Executed by
  the manager 2026-06-10: HEAD = `HEAD_temporal_mvp_v27_wkurtosis.html` (`b245bfda`); v26c
  demoted to `temporal_mvp_v26c.html` (`6cc73563`), GH line retained, suite green. The ordered
  feature-level diff is DELIVERED: `engine/builds/NOTES_v24_to_v26c_desirables.md`.
- **Entry-26 conjecture ("is there a kurtosis where this compares to v24's curve warp … too
  natural not to") — CHECKED, DISCONFIRMED:** verified sweep found NO τ matching v24's global
  warp magnitude with frozen wings (warp is elbow-local by design); reported to the operator
  before the entry-28 ruling. Evidence: manager/lead sweep, BUILD_LINEAGE.md HEAD row.
- **Curve family = (W) on v24 base** — RULED (Entries 2/4/5 [verbatim-transcript]).
- **Settlement = Reading A** — RULED (Entry 11 "a" [verbatim-transcript]).
- **Strong-form trades-warp is the build target (R-paper, not R-simple)** — RULED build-it
  (Entry 19 [verbatim-transcript]) + lead's strong-form note skeptic-GREEN + manager-re-derived.
- **Finding-2 (ratio-peg vs dollar-anchored strike)** — RESOLVED. Origin verbatim-adjacent:
  "Live decision left to Rohan: Finding 2 — strike as ratio peg (UX fix) vs dollar-anchored
  '$120k call' (engine change)" (`docs/context/chats/og-manager-clone-1.md:18-20`
  [summary-stub]); original tester finding `history/session_tree_note.md:3444-3458`. Operator
  RULED 2026-06-08 ("align the chart strike-ray to the live dollar strike … it's a display bug",
  `MEMORY.md:505-506` [manager-recorded paraphrase]); ABSORBED in v26c uniform registration
  (tester-confirmed live: chart ray = K/oracle_now, no entry-θ drift; `evidence/v26c_pw/`).
- **Slippage magnitude vs collar aggressiveness** — RULED-parked: "operator parked for later"
  (`MEMORY.md:510-511` [manager-recorded paraphrase]). Carried as ACCEPTED in the v25→v26a entry
  + standing reconciliation list. Parked ≠ resolved — re-surface if collar UX ships.
- **Provenance label policy** — RULED: "I trust Aristotle" (operator 2026-06-09,
  `MEMORY.md:360` [quote fragment, manager-recorded]); re-verify gate relaxed ("no re-verifies
  required", `MEMORY.md:294`).
- **2026-06-10 pain points (3)** — all addressed same day: skeptic agent live, this DIFF_LEDGER
  live + hardened, formal/INDEX.md promoted. Operator approval fragment: "yes to all"
  (`MEMORY.md:32`); hardening fragment: "diligent… feature-level… so I don't ever have to keep
  inventory" (`MEMORY.md:44-45`) [quote fragments, manager-recorded].

---

## v25 → v26a (barrier→GH remnant fixes + slippage units)   [status: demoted (was HEAD)]
**FEATURES:** #10 (slippage basis — the fix), #2/#6 (curve render purity — remnant removal); none beyond.
**DESIRABLE:**
- Slippage units fixed: both paths reference `mpGeom = getMP_raw·e^(−ghMu)` — replaces the
  known-broken ~97%-flat WIP (`2c0337e8`, lineage-only). Verified 0.99%/$3.46 → 71.45%/$6240.94
  across the splice-level harness.
- 3 barrier remnants removed; curve renders as GH continuation (tester-confirmed, live browser).
- Frame re-fit: equilibrium dot stays ~fixed while axes rescale. Tester verdict: **KEEP, do NOT
  apply the one-line revert** — freezing the frame clips the GH bend as it climbs out.
**UNDESIRABLE:**
- Slippage magnitude scales hard with collar aggressiveness (0.2 BTC wide collar → 3463%, pool
  spot → ~$0). Display contract correct, magnitude input-driven — **ACCEPTED (operator parked)**.
**OPERATOR-VOICE:** **None found verbatim in transcripts for this transition** (searched
`history/transcript_journal.txt` + `history/session_tree_note.md` end-to-end — both end before
the GH era; the v25-GH/v26a session "OG manager: HTML refinement chat" 2026-06-08 exists only as the summary stub `docs/context/chats/og-manager-html-refinement.md`, which records work, not
operator objections). Secondhand items attributable to this transition:
- RULED-parked [manager-recorded paraphrase]: collar-aggressiveness slippage magnitude —
  "operator parked for later" (`MEMORY.md:510-511`). Matches the ACCEPTED flag above.
- Lineage objection (pre-GH, same feature family #2/#6 — the operator's standing demand that the
  curve VISIBLY show the right convexity): Rohan flagged the option-pricing curve **"looked the
  same instead of steeper (american-style implies steeper)"**
  (`history/session_tree_note.md:3460-3461` [verbatim-transcript]) — second time a green-grader
  build needed the operator's eye (first: raw-cash settlement, `:3213` "Caught by Rohan's Q").
  RESOLVED in its own era (intern6 chart-shape pass, `:3484-3502`); carried here because the
  v26a "GH continuation, not Balancer weight-form" render check is the GH-era descendant of this
  exact operator demand.
**EVIDENCE:** `evidence/v26a_pw/`, `evidence/CROSSCHECK_slipfix_numbers.md`, `evidence/slipfix_*`.

## v26a → v26b (ITM / American smooth-pasting)   [status: demoted (was HEAD)]
**FEATURES:** #7 (ITM smooth-pasting — landed), #9 (funding — verified UNTOUCHED via markFrac split); none beyond.
**DESIRABLE:**
- Mark runs continuation PAST the strike to the free boundary, then intrinsic — smooth, never
  clamps to 1 (0.1231→0.5612 across the sweep; old `markFrac` would saturate at oracle ≥ $84k).
- Seam C¹ at the free boundary: value 0.000%, slope ≤0.0005% (sNorm-space), no-jump ~e-7, both
  wings, all γ. Seam gate negative-controlled (boundary+10% → 9.09% FAIL caught; branch swap →
  80% FAIL caught; injected kink → caught).
- Funding bit-identical via the `mark`/`markFrac` split (funding + polar marker route to the
  verbatim old fraction) — the §4 funding lock held.
- Polar marker stays on the ψ-curve (maxDiff 0, tester-confirmed).
**UNDESIRABLE:**
- Payoff chart x-range (±50% of perp-mark) too narrow to render the deep-ITM uncapped-naked vs
  capped-spread divergence — logic correct, pixels identical (DISPLAY-COVERAGE flag).
  **RECONCILED-in-v26c** (x-range −90%..+200%, clears both free boundaries).
**NEUTRAL:** bands table §5 — 9 cells, "Attrib P&L"/"Strike" renames, empty 4th td.
**OPERATOR-VOICE:** (no raw transcript of the v26b session exists in `history/`; items below are
manager-recorded except where marked verbatim)
- OBJECTION→caught-our-defect, RESOLVED(evidence): **the operator caught the manager's call/put
  LABEL swap** on the put-wing boundary in the v26b dispatch (`MEMORY.md:532` "Operator caught my
  call/put LABEL swap on (b)") — chasing it exposed the deeper engine wing-tag inversion; fix =
  boundaries bound to the GEOMETRIC S-direction, not the tag string
  (`evidence/wing_tag_inversion_trace.md`; seam gate directional A:S*<K / B:S*>K green).
- RULED [manager-recorded]: **ITM second-wing boundary RATIFIED (operator 2026-06-08)** —
  `θ/sNorm` branch pastes at `S*=K·(γ+1)/γ` (intrinsic 1−K/S), `sNorm/θ` branch at `S*=K·γ/(γ+1)`
  (intrinsic 1−S/K), "Bind by S-direction, NOT the inverted tag" (`MEMORY.md:650-652`).
- RULED [manager-recorded]: ITM "park" NOT preserved — "Operator also confirmed the ITM 'park' is
  NOT preserved — v26b deletes it (effK=K always)" (`MEMORY.md:507-509`).
- RULED [manager-recorded]: HEAD promotion "operator pre-authorized contingent on tester-clean"
  (`MEMORY.md:236`); tester delivered clean (af25ead5) → promoted.
- RULED 2026-06-09, retro-confirms this build's semantics [manager-recorded]: "Settlement = TRUE
  AMERICAN (cash-out-anytime)" with S* DERIVED from μ (`MEMORY.md:176-180`).
- Lineage verbatim (the settlement convention #7/#11 descends from — pre-GH transcript):
  - **"I buy a discount IOU to receive 1 BTC after 12 months, on dollar margin"** — the
    operator's two-layer mental model that RULED settlement Fork C (BTC closing spot × notional)
    (`history/session_tree_note.md:921-923`).
  - **"same carved slice everything — that's why it retains fraction-of-perp pricing"** — the
    operator's question/objection that caught the v25-american pass-3 settlement skipping the
    carved-slice convention after the manager had called it shippable
    (`history/session_tree_note.md:3206-3207`; manager's own log: "Caught by Rohan's Q" `:3213`).
  - **"initial not closing, escrowed not appropriated"** — operator pin of the settlement basis
    (carve-time equity + escrowed attributable P&L) (`history/session_tree_note.md:3753-3754`).
**EVIDENCE:** `evidence/v26b_pw/` (tester af25ead5), seam-gate runs, manager Node verification.

## v26b → v26c (uniform strike registration θ=sNorm(K))   [status: HEAD-promoted 2026-06-08]
**FEATURES:** #8 (uniform registration — landed), #11 (dollar pipe — verified byte-identical), #9 (funding — verified untouched); none beyond.
**DESIRABLE:**
- OTM→ITM crossover lands at the dollar strike K for ALL γ (was drifting to oracle₀²/K for γ>1);
  dir_gate crossover |err| = 0 at γ∈{1.5,2,3,4}.
- Chart strike-ray live `K/oracle_now` — Finding-2 ABSORBED: no more entry-θ rotation off the
  locked dollar strike on rebase (tester-confirmed across rebase 80k→120k).
- Chart mark == bands-table mark (worst |diff| 8.6e-11) — basis split between chart and table
  eliminated.
- Premium delta moves toward-correct: +7.69% @ K=82k near-strike, +15.76% @ K=84k (re-derived
  independently by manager, matches intern).
- Old-path extreme/boundary blowup fixed by the registered path.
- Pre-existing `drawPayoff` N_buy bug fixed (state→state.pool, was NaN-fallback; display-only).
- Permanent `dir_gate.js` (crossover@K + directional-consistency + mixed-basis control),
  negative-controlled (basis flip caught; wing swap caught).
**UNDESIRABLE:**
- Payoff ray-legend text overprint — cosmetic. **OPEN** (intern polish item, non-blocking).
- Exec crossover sweep resolution 84005 vs 84000 — cosmetic. **ACCEPTED** (sweep granularity).
**OPERATOR-VOICE:** (no raw transcript of the v26c session in `history/`; manager-recorded
except where marked)
- The driving OBJECTION is the operator's own (origin in the pre-GH transcript + summary stub):
  the American strike reading as a ratio peg — tester Finding-2, logged as needing "Rohan's
  product intent" (`history/session_tree_note.md:3444-3458` [verbatim-adjacent transcript]);
  "Live decision left to Rohan: Finding 2 — strike as ratio peg (UX fix) vs dollar-anchored
  '$120k call' (engine change)" (`docs/context/chats/og-manager-clone-1.md:18-20` [summary-stub]).
  **RESOLVED(evidence):** operator ruling 2026-06-08 (display-bug/dollar-anchor,
  `MEMORY.md:505-506`) + v26c absorption, tester-confirmed live (bands cross at
  oracle=poolMark=K=120000 exactly; live ray; `evidence/v26c_pw/`).
- RULED [manager-recorded]: **strike-basis, not directional** — "Operator RULED (2026-06-08):
  NOT directional — a strike-basis mismatch … Fix: θ_strike=sNorm(K) via
  getSNorm(arbitrageToOracle(state,K)) … Authorized reopening of funding" (`MEMORY.md:582-586`;
  evidence `evidence/strike_basis_fix_verification.md`).
- RULED [manager-recorded], same day, superseding the funding-reopen authorization: **"funding
  stays LOCKED/untouched"** — the "→0 deep ITM" target was a mistaken extrinsic-carry overlay;
  θ-swap flips funding's sign ⇒ must not be touched; fix scope = mark path + chart-ray
  registration ONLY (`MEMORY.md:592-597`). [#9 protected]
- RULED [manager-recorded]: **scope fork (A) — registration must be UNIFORM** — "one mark on the
  curve; display@K + execution@oracle₀²/K + chart@old = three strikes = screen lies about what
  trades" (`MEMORY.md:605-607`; exact wording AMBIGUOUS-ATTRIBUTION operator-vs-manager — the
  RULING attribution is unambiguous, the phrasing may be the manager's).
- RULED [manager-recorded]: **drawPayoff re-base to carry basis NOW (before HEAD)** — ruled (i),
  2026-06-08 (`MEMORY.md:623-626`); landed as v26c_full2, chart-mark==table verified 8.6e-11.
**EVIDENCE:** `evidence/v26c_pw/`, dollar-pipe byte-identical check, manager audits in MEMORY +
`run_all.sh` green (7 GH + seam + dir).


## v26c (HEAD, GH line) → v27 (W) kurtosis curve + strong-form trades-warp, off v24 base   [status: HEAD-PROMOTED 2026-06-10 by OPERATOR RULING (entry 28) — see the promotion entry below; tester visual-layer blocker OVERRIDDEN, not resolved]
_Tester live-Playwright pass 2026-06-10. Build `temporal_mvp_v27_wkurtosis_WIP.html` md5
`3914c7f423a9e988e664f901a352a6e1`. This is a WIP candidate off the v24 Balancer base — a
PARALLEL line, not a successor edit of v26c. Promotion is an operator-tier call (separate)._

**FEATURES:** #1 (Balancer is now the literal base), #2 (explicit (W) weight-field warp w(u;φ)),
#3 (kurtosis knob τ — LIVE slider), #5 (rebase reframed to carry-shift; warp∘rebase OPEN),
#6 (value∝S^(−γ_loc), Reading A), #7 (smooth-pasting mark ported with g→γ_loc), #8 (sNormStrike
via (W) inverse), #9 (funding re-pointed to price-anchor p=P, γ→±γ_loc — DIVERGES from HEAD lock),
#10 (slippage mpGeom collapses to getMP_raw, no e^−ghMu), #11 (dollar pipe reused byte-identical),
#12 (getMP_raw == geometric slope exactly), #14 (φ-translation = weight-slot Esscher analogue),
#15 (file-safety), **#16 (warp-with-trades NOW IMPLEMENTED, strong-form R-paper)**. **None beyond.**
(#4 carry, #13 solvency: #4 consistent/unchanged-in-spirit, #13 untouched/still OPEN.)

**DESIRABLE (engine layer — Node-verified, my live-engine reads):**
- **#16 warp-with-trades IMPLEMENTED (strong-form).** `tradeUpdate` conserves α=x·w, β=y·(1−w),
  moves (x,y), and re-centers the field φ'=u'−z. selfcheck WARP a–f all PASS; my live engine on
  the running page: in-band trade moved φ 0→10.59, local w 0.85→0.75, reserves stayed on the
  trajectory hyperbola (x−α)(y−β)=αβ to resid 0, path-independent, round-trip 1.78e-15. This is
  the operator's "half the job" (Entry 19) — engine-correct. [#16, #2]
- **#3 kurtosis knob τ LIVE + engine-correct.** τ slider (0.05–3, default 0.3). My live-engine
  read: ATM γ_loc τ-invariant (2.636 at both τ=0.10 and 2.50 — ATM = w_mid always, correct), the
  elbow rounds (γ_loc at u=0.3: 5.39→2.84 across τ), wings near-frozen (wingL γ 1.500→1.524,
  wingR 5.666→5.505 — the few-% elbow-tail bleed the spec predicts). selfcheck "wings FROZEN
  across tau maxDiff=0" + "ELBOW rounds with tau" PASS. [#3]
- **#10 slippage simplifies (proven).** mpGeom=getMP_raw·e^(−ghMu) collapses to getMP_raw — no
  e^ghMu factor on (W) (price == geometric slope exactly, selfcheck L4 rel 4.33e-7). [#10, #12]
- **#1/#11/#15 base + reuse + safety.** Literal Balancer base; dollar pipe reused byte-identical;
  blobs canonical md5s `ab663f5c…`/`c505b08a…` (identical to v24), 3 scripts parse — tester-
  verified GREEN. [#1, #11, #15]
- **#7 smooth-pasting + #8 registration ported.** seam value/slope match @ sNorm* (selfcheck
  PASS); arbitrageToOracle (W) inverse round-trips 1.46e-15; payoff simulator renders cleanly
  (91094 lit px, no NaN/blank). [#7, #8]
- **γ>1 guard works in UI.** Wing-weight ≤½ clamps to 0.501 (HTML min 0.51 + JS clamp reflects
  back into the input + status shows γ₋=1.00); cannot show γ<1. tester-confirmed live. [#6]
- **Wing-range guard honest.** Over-size trade REJECTED with verbatim message "trade exceeds
  frozen-wing range — split or widen Δw" (engine + executeLeg path); in-band trade executes.
  tester-confirmed live. [#16]

**UNDESIRABLE:**
- **★ BLOCKER (#2,#3,#16) — the operator's SIGNED visual acceptance test FAILS on screen. OPEN.**
  Engine-true, screen-invisible. In the **Pool Curve (x,y)** view the operating point sits at
  u₀=ln(800000/10)≈11.3, FAR outside the curve-trace window u∈[−6,6] and far from the elbow
  (u≈0); the rendered curve is a flat sliver hugging the axis. τ=0.10 vs 2.50 are
  indistinguishable to the eye (`evidence/v27_pw/02,03`); pre-/post-trade curves are
  pixel-identical (warpFullDiff=0px, `05,06`) despite φ moving 10.59. In **Mark-Across-Strikes**
  the peak is τ-invariant to ≈0.94px (`20,21`) and the trade leaves it unchanged (warpDiff=0,
  `22,23`). So "elbow visibly rounds / wings don't move / trades warp the curve not a dot sliding"
  are NOT demonstrable. **OPEN** — needs a curve-trace/frame fix so the window straddles the elbow
  at the live operating point (or a realistic default pool with u₀≈0) before the operator can play
  with it. This is the gating finding for HEAD/play-with.
- **DEGENERATE DEFAULT POOL (#2,#3,#16) — OPEN.** Default ships SYMMETRIC wings w₋=w₊=0.70 ⇒ Δw=0
  ⇒ the (W) warp is degenerate: w is constant, τ does literally nothing, and EVERY trade is
  wing-range-rejected (empty band (0.7,0.7)). All (W) features are dead out-of-the-box; I had to
  set asymmetric wings (w₋=0.60, w₊=0.85) to exercise anything. Operator never specified a default
  config. **OPEN** — needs an asymmetric default so the knob/warp are live on load.
- **STALE/CONTRADICTORY UI LABEL (#16) — OPEN (honesty).** The "Trade mechanic (#16)" sim-aid
  label (engine lines 1352-1357) still reads "reserves move on a FIXED curve — the reserves point
  slides along a fixed warp … This is NOT the full trades-reshape-the-curve warp … that strong
  form is OPEN." But the engine SHIPS the strong form (φ re-centering, verified). The label
  describes the abandoned R-simple weak form and calls the strong form "OPEN" when it is
  implemented — a misleading honesty-label regression. **OPEN** — intern must update the label to
  match the strong-form engine. (No "fully proven" overclaim found; that part is clean.)
- **#9 funding DIVERGES from HEAD's lock — flagged, not exercised.** v27 re-points funding to
  price-anchor p=P with γ→±γ_loc [theory-risk-accepted]; HEAD #9 is LOCKED at the w=½
  slope-deviation. Not exercised in this UI run (no funding-tick visual). Carry as theory-risk
  CANDIDATE divergence; operator/skeptic-tier. **OPEN.**

**NEUTRAL:**
- New Settings panel "(W) Curve Shape · kurtosis": τ slider + w₋/w₊ inputs + γ_loc status line.
- Chart selector drops GH-specific views; keeps Pool Curve / Mark Across Strikes / (Δφ_C,Δφ_P)
  Trajectory / Payoff Simulator.
- No console errors / no pageerrors across all views and the trade/guard paths (clean).

**OPERATOR-VOICE:** (FIRST raw-verbatim operator transcript for the work a ledger entry covers —
`history/operator/2026-06-10_kurtosis-curve-family-brief.md`, 20 entries, per §2.2)
- **SIGNED ACCEPTANCE TEST [verbatim-transcript], Entry 1 (line 14):** "Acceptance (your signed
  test, orthogonality relaxed): one number → turn it → elbow visibly rounds → wings don't move →
  static → options read off as perpetual-American → trades warp the curve, not a dot sliding."
  **STATUS: PARTIALLY MET after the `b245bfda` render fix — FAIL overall.** "elbow visibly rounds
  → wings don't move" = MET on screen (items 1,2 PASS, tester-confirmed). "trades warp the curve,
  not a dot sliding" = STILL NOT MET (item 3: φ sub-pixel, the trade is a dot sliding). See the v27
  render-fix re-run sub-entry below. The
  acceptance is explicitly visual, reinforced Entry 2 (line 28) "v24 is the best reference because
  … how the curve warps actually and shows on UX" and Entry 19 (line 140) "no point without
  trades-warp thing … this is half the job."
- **RULED [verbatim-transcript]:** curve family = (W) on v24 base (Entry 2/4/5: "v24 is the best
  reference because its sort of pure balancer"; "yes"; "start"). Settlement = Reading A (Entry 11:
  "a"). Build the strong form (Entry 19, line 140: "option 2: no point without trades-warp …
  slope goal-seek / conservation law alpha beta … for weight updation … this is half the job …
  we already have a variant that put in another curve but we discarded because warp didn't work").
  Speed-run + theory-risk (Entry 18, line 154: "fast track all 3 concurrently and get me the
  whole thing off the v24 base asap … you have autonomy … prioritise speed … take some
  theory-risk allowing this to build, as long as it meets the core charter").
- **OPEN question [verbatim-transcript], Entry 17 (line 133):** "ok if we're good when can i
  actually get a version to play around with!?" — answer after the `b245bfda` render fix: the KNOB
  is now playable (elbow rounds visibly on screen) but the FULL signed test is NOT YET met because
  the trades-WARP still reads as a dot sliding (item-3 BLOCKER). Surfaced, not resolved.
- **OPEN [verbatim-transcript], Entry 3 (line 35):** "steepness and kurtosis are interchangerable
  words from my perspective" — confirms the knob concept; the explicit τ-sign LABEL is still the
  operator's call (lead-flagged), unresolved.

**EVIDENCE:** `evidence/v27_pw/` (01_initial, 02/03 curve τ low/high, 04 wing-clamp, 05/06
pre/post-trade curve, 07 pricing, 08 payoff, 20/21 pricing τ low/high, 22/23 pricing pre/post,
trace.json + trace_pricing.json with all live-engine numbers). Harnesses
`engine/verify/pw_v27_wkurtosis.mjs` + `pw_v27_pricing.mjs`. Node: `wcurve_selfcheck.js` = 21
PASS/0 FAIL (incl WARP block). File-safety GREEN (blobs canonical, 3 scripts). Reproduced clean
(no flakiness). **VERDICT: engine layer PASS; UI/visual acceptance FAIL (3 OPEN blockers). CANDIDATE
— do NOT HEAD-promote on the visual layer until the curve/warp render legibly.**

### ▶ v27 RENDER-FIX RE-RUN (build `b245bfda6a493af0a7017309f1acd3f3`, 2026-06-10) — operator's SIGNED VISUAL-ACCEPTANCE re-test
_Tester live-Playwright Chromium, reproduced clean ×2 (identical numbers, 0 console errors / 0
pageerrors). File-safety GREEN: blobs canonical `ab663f5c…`/`c505b08a…`, 3 scripts parse._

**WHAT CHANGED (manager-verified self-check 21/21 unchanged):** (a) `curveTraceW` now centers the
trace window on `0.5·(u₀+φ)` with half-width `0.5·|u₀−φ|+6`, straddling BOTH the live operating
point and the elbow (was fixed u∈[−6,6]); (b) the default pool is asymmetric near the elbow —
`x:10, y:12` (u₀≈0.182), `w₋0.60/w₊0.85` (Δw 0.25), `tau:0.3`, `oracle→4.44`; (c) the #16 label
now states the strong-form warp SHIPS.

**PER-ITEM VISUAL VERDICTS (FLAG):**
- **1. Curve renders across the frame — PASS (tester-confirmed).** Default load: fracW 0.937,
  fracH 0.93, 6937 lit px, GH-continuation shape with the white eq-marker on the curve, put/call
  wings + strike rays. NOT a sliver. `A_R01_default_curve.png`. (Fixes the prior sliver FAIL.)
- **2. Kurtosis knob τ — PASS (tester-confirmed).** τ=0.05 vs τ=3.0 visibly differ to the eye
  (`A_R02_curve_tau_005` vs `A_R03_curve_tau_300`): the ATM elbow rounds. Elbow silhouette delta
  ≈35.7px (max 226) vs the prior ≈0.9px non-effect. The frame-independent slope-angle math
  confirms it is the ELBOW that rounds (Δ up to ~13° at u∈[−2,+0.5]) while the WINGS stay frozen
  (Δ 0.0001° at u=−10, 0° at u=+10) — matches the spec "wings stay exact power-laws." (Caveat:
  the axes also rescale with τ via α/β, so part of the raw band-pixel delta is frame motion, not
  pure shape; the slope-angle math is the clean evidence that the elbow-rounds/wings-frozen claim
  holds.)
- **3. The warp (HEADLINE) — FAIL (tester-confirmed FAIL). BLOCKER.** Driven through the REAL UI
  (add perp → Trade-Bands subtab → band sold-call K=6 / bought-put K=3 → `#btn-execute`), the
  trade DOES now redraw and shift the live curve — but only **≈0.5px** (mean 0.55, max 7;
  reproduced exactly ×2), because the band moves φ only 0→0.0011. A sequence of 6 max-size in-band
  trades accumulates φ to just ≈0.029 and ≈1px cumulative warp (max 8px, `bigwarp_post.png`). The
  post-trade dotted overlay (`A_W02_preview_dotted.png`, legend Δw=−0.00251) sits visually ON the
  solid curve. The trade reads as **"a dot sliding," which the operator explicitly forbade.** ⚠
  METHODOLOGY NOTE / why the prior 0px was an artifact too: `Engine` and `Store` ARE reachable in
  `page.evaluate`, but **`Viz` and `render` are NOT** (both `undefined`, not on `window`) — so my
  prior `render()`/`Viz.drawAll()` calls from the harness were SILENT no-ops and never redrew the
  canvas. The warp must be driven through the app's own UI event handlers (which hold Viz/render
  in scope). The 0px in the original run conflated "render broken" with "harness didn't redraw" —
  this re-run isolates it: the renderer IS φ-aware (curveTraceW point set verified φ-dependent
  in-frame: at fixed x the y-value moves substantially with φ), but an admissible (W) trade on
  this default pool produces a sub-pixel φ. ROOT CAUSE = per-trade φ gain too small, NOT a render
  bug. Fix space = pool/Δw geometry with higher φ sensitivity, or an amplified/animated warp viz.
- **4. In-band executes / over-size frozen-wing message — PASS (tester-confirmed).** Over-size
  trade (dy=50·y) REJECTED with reason `wing-range`; in-band band executes (`#btn-execute`
  enabled, click lands, pool moves). tester-confirmed live.
- **5. Pricing/payoff + KPIs with the new default pool + oracle=4.44 — PASS-with-flags
  (tester-confirmed).** Pricing "Mark Across Strikes" renders a clean tent (pink put-wing → peak
  ψ=1 at mode → teal call-wing decay, 8175 lit px, `A_R06_pricing.png`); Payoff Simulator renders
  cleanly (83236 lit px, `A_R07_payoff.png`). **No NaN / no Infinity in any KPI.** Internally
  consistent toy-pool readouts: kpi-spot-usd $1.18 (=sNorm0.266·4.44), lp-x-usd $44.40 (=10·4.44),
  lp-pool-value $24.00 (=y+x·y/x=12+12). **TWO oracle-default blast-radius oddities to FLAG
  (non-NaN, but absurd-on-screen):** (i) `lp-y-delta` reads **−$799,988.00** — engine L4295
  hardcodes `p.y − 800000`, a v24-era baseline; with the new y=12 it's nonsense. (ii) Create-Perp
  `LIQ PRICE −9995.56` — degenerate for the default 0.1 BTC / $1000-margin perp at oracle 4.44
  (margin ≫ notional → liq price far negative). Both are preview readouts, not crashes, but the
  un-gated oracle/pool default change exposed them.
- **6. No console errors; reproduced ×2 — PASS.** 0 console errors, 0 pageerrors across all views
  and the trade/guard paths in BOTH runs; item-3 ≈0.5px result identical to the pixel across runs
  (not flaky).

**VISUAL-ACCEPTANCE: FAIL.** Two of three headline items now PASS on screen (curve renders; τ
rounds the elbow with frozen wings) — a real improvement over the prior all-invisible FAIL — but
the **HEADLINE warp (item 3) still does NOT render legibly**: a trade is a dot sliding, not a
curve warp, which is the operator's signed "this is half the job" deliverable. **v27 is NOT yet
operator-playable for the signed test.** New harnesses: `engine/verify/pw_v27_render_accept.mjs`
(items 1–6, default pool, ×2) + `pw_v27_warp_realui.mjs` (real-UI band-execute warp). Evidence:
`evidence/v27_pw/A_R01..A_R07`, `A_W01..A_W03`, `bigwarp_post.png`, `trace_render_accept.json`,
`trace_warp_realui.json`. Self-check 21/21 unchanged (manager-verified). File-safety GREEN.

---

## v27 `b245bfda` CANDIDATE → HEAD (operator promotion, entry 28)   [status: HEAD-promoted 2026-06-10 — OPERATOR RULING, overriding the tester's visual-layer blocker]
_No byte change to the build — same `b245bfda` the render-fix re-run verified. This entry records
the STATUS transition, the promotion-time re-verification, the override, and the operator-ordered
v24→v26c feature-level diff. Executed by the manager; tester re-verified this run._

**FEATURES:** #1/#2/#3/#16 (the (W) core + τ knob + strong-form warp become HEAD), #7/#8/#10
(Task-2 diff findings — GH-line items NOT carried into HEAD, now on record), #5/#9 (open lemmas
carried into HEAD as theory-risk), #11/#15 (verified stable at promotion), #13 (untouched, still
the open ship-gate); #4/#6/#12/#14 unchanged from the candidate entry (restated in the table).
**None beyond.**

**DESIRABLE:**
- The (W) family, τ knob, and strong-form trades-warp are now canonical HEAD — engine-verified
  (selfcheck 21 PASS, re-run by tester at promotion) with τ-elbow + curve render tester-confirmed
  on screen (render-fix re-run, items 1/2). [#1, #2, #3, #16]
- GH line demoted INTACT: `temporal_mvp_v26c.html` (`6cc73563`) retained, full GH suite green
  this run (`run_all.sh builds/temporal_mvp_v26c.html` — 7 gates + seam + dir + faith) — every
  unported desirable keeps a working, gated reference implementation. [#15]
- `run_all.sh` default now routes (W) builds to `wcurve_selfcheck.js` [HARD]; GH builds fall
  through to the full GH suite — both lines stay gated. [#15]
- File-safety at promotion: HEAD blobs canonical (`ab663f5c…`/`c505b08a…` line-md5, tester
  re-checked), 3 scripts parse, whole-file md5 `b245bfda`. [#15]

**UNDESIRABLE:**
- **★ Trades-warp visual subtlety (the former BLOCKER) — OVERRIDDEN by operator ruling (entry
  28), ACCEPTED(operator), NOT resolved.** Per-trade warp ≈0.5–1px; verified elbow-local by
  design (sweep: no τ matches v24's global warp with frozen wings). Residual polish OPEN:
  anchor-overlay / amplified-warp viz (not added). [#2, #16]
- **drawPayoff N_buy `state`-vs-`state.pool` NaN-fallback PRESENT in HEAD** (inherited from the
  v24 base; was diagnosed+fixed on the GH line in v26c; HEAD L4034 byte-identical to the buggy
  site; display-only — N_buy silently falls back to N_sell). **OPEN** — NOTES D14. [#7]
- **Slippage $-tooltip honesty label NOT carried** — HEAD ships the v24 wording; the v26a
  "Layer-1 reserve-USD, not trader honest-dollar" label is on the demoted line only. **OPEN
  (minor)** — NOTES D2. [#10]
- **Payoff chart: x-range back to ±50% and naked leg capped at 1** — the v26b/v26c free-boundary
  coverage upgrades unported. **OPEN (minor)** — NOTES D9/D10. [#7]
- **Registration export-only:** no `regLeg` wiring; payoff sweeps price-ratio (1+r); one-mark
  uniformity + all-γ crossover@K UNVERIFIED on (W). **OPEN** — NOTES D11/D13/D16. [#8]
- lp-y-delta hardcode (engine L4295, y−800000 stale baseline) + degenerate default Create-Perp
  LIQ-PRICE readout — carried from the render-fix re-run. **OPEN.** [display, #11-adjacent]
- Funding re-point (price-anchor p=P, ±γ_loc) + warp∘rebase-commute + φ-anchor/funding lemmas —
  carried into HEAD as theory-risk-accepted; lemmas OPEN [needs-Aristotle]. [#5, #9]

**NEUTRAL:** file renames (`HEAD_temporal_mvp_v27_wkurtosis.html`; prior HEAD →
`temporal_mvp_v26c.html`); BUILD_LINEAGE/INTEGRITY rows updated by the manager.

**OPERATOR-VOICE:** (all [verbatim-transcript],
`history/operator/2026-06-10_kurtosis-curve-family-brief.md`)
- **THE RULING, entry 28:** "firstly, commit this version to head because theres nothing useful
  since v24 -- in parallel let the testing / versioning guy do a feature level diff to confirm
  any potentially desirable changes we made since apart from this core, and simply make note for
  future reference." RULED + EXECUTED (this entry + the NOTES file are the execution).
- Entry 24 (diagnostic order): "compare with v24 and see if we have similar order of magnitude
  when we start with the same kurtosis implied by the ordinary balancer curve sort" — DONE
  (v24 warps; v27 30–1000× less at matched setting).
- Entry 26 (conjecture): "is there a kurtosis where this compares to v24's curve warp ; because
  of the natural polar lens view i'm assuming we've built our thing on, I personally think there
  should be settings where it works well, its too natural not to" — CHECKED, DISCONFIRMED
  (no such τ with frozen wings); operator ruled promotion with this answer in hand.
- Entry 27: "also meantime if the research guy is idle let him cross verify the geometric
  premise / principle of the curve warp is correct in the version we're working on vs the paper's
  intuition and v24" — DONE (skeptic-verified premise FAITHFUL; research-lead corroboration was
  to follow per manager note).
- The entry-1 SIGNED acceptance test: items 1/2 met on screen; item 3 ("trades warp the curve,
  not a dot sliding") remains UNMET on screen — promotion is the operator's override of his own
  test, recorded as such, not as a fix.

**EVIDENCE:** this run — `md5sum` HEAD `b245bfda…`; blob line-md5s `ab663f5c…`/`c505b08a…`;
`wcurve_selfcheck.js` 21 PASS/0 FAIL; demoted v26c full GH suite green; byte-level diff findings
in `engine/builds/NOTES_v24_to_v26c_desirables.md` (grep/sed line refs per item). Prior visual
evidence: `evidence/v27_pw/` (render-fix re-run). **Cross-link: the operator-ordered v24→v26c
feature-level diff = `engine/builds/NOTES_v24_to_v26c_desirables.md` (D1–D17, categorized
already-present / portable / GH-dead).**

---

## v27 HEAD `b245bfda` → UX-RESTORE `9d22cffd` (entry-29 quick UX test: v24 defaults back, no sliders)   [status: HEAD (in-place UX fix on the promoted line); tester live ×2]
_Tester live-Playwright Chromium 2026-06-10, operator-style (real clicks/keys through the UI, not
engine shortcuts), reproduced ×2 byte-identical (runs A/B + fixup ×2). Build
`HEAD_temporal_mvp_v27_wkurtosis.html` md5 `9d22cffd6a0f002f359eed81d7157203`. File-safety GREEN:
blob line-md5s `ab663f5c…`/`c505b08a…` canonical, 3 scripts parse, 0 console/page errors._

**FEATURES:** #1 (v24 dollar-scale defaults restored), #3 (τ control = number stepper, no slider),
#2 (curve render at restored defaults), #16 (in-band execute + frozen-wing guard at $80k scale),
#10 (slippage readout exercised live), #11-adjacent display readouts (lp-y-delta, Create-Perp LIQ
— the two reconciled fixes), #15 (file-safety re-verified). **None beyond** (#4–#9, #12–#14
untouched by this pass; #13 still the open ship-gate).

**PER-ITEM VERDICTS (the operator's entry-29 test):**
- **1. Load — PASS-with-FLAG (tester-confirmed ×2).** Page renders, 0 console errors. Curve spans
  the frame (fracW 0.981 / fracH 0.93, 8195 lit px) with eq-dot + strike rays
  (`A_01_load_default.png`). Dollar world is BTC-$80k: oracle input 80000, **engine marginal
  $80,000.000 at load** (live read), NOT $4.44. **lp-y-delta $0.00 at load** (dynamic `_initial_y`
  baseline — RECONCILED). Perp form defaults sane: 0.1 BTC ≈$8,000 / $1000 margin → **8.0×**, liq
  **long $70,000.00 / short $90,000.00** (not −9995 — RECONCILED). **FLAG (new, OPEN):** the KPI
  strip's first dollar number, "Spot ($)", reads **$30,344.83** (= raw reserve ratio y/x; kpi-spot
  0.3793, kpi-w 0.7250) where v24 showed **$80,000.00** (sNorm 1.0, w 0.5) — on (W) the marginal is
  γ_loc·(y/x) so the spot KPI no longer equals the BTC price. Display-basis bug/mislabel.
- **2. No sliders — PASS; arrow-affordance FLAG (OPEN).** **0 `input[type=range]` in the live DOM**
  (every control is number/select/button/checkbox/file; same census on v24). τ is
  `input[type=number] step=0.05 (0.05–3)`; keyboard ↑/↓ steps 0.30→0.35→…, readout + curve update
  through the real handler. Sensitivities sane (τ 0.05, wings 0.01, strikes $500, notionals 0.01
  BTC, margin $10, oracle $100). **BUT the clickable up/down spinner ARROWS are CSS-hidden for the
  settings panel/perp form** (`.field-input-wrap …::-webkit-inner-spin-button {-webkit-appearance:
  none}` L326-328, inherited from the v24 base): mouse-clicking the τ arrow region does nothing
  (0.3→0.3, ×2 runs; close-up `C_08_tau_field_closeup.png` shows no arrows while hovered), while
  the band price inputs (visible-spinner CSS L938-950) DO click-step 120000→120500→120000. The
  operator asked for "updown arrows" — on the τ knob the arrows aren't clickable/visible.
- **3. Play the knob — PASS (tester-confirmed ×2).** τ stepped to 0.05 (5×↓) vs 1.5 (29×↑):
  ATM elbow visibly rounds — silhouette delta mean 5.62px / max 111px in the elbow band — while
  **left wing 0.00px and right wing 1.26px mean** (near-frozen; small elbow-edge bleed).
  `C_02_tau_low_005.png` vs `C_03_tau_high_150.png`. Numbers byte-identical across both runs.
- **4. Trade — PASS (tester-confirmed ×2).** Real UI end-to-end: Create Perp → Add Perp (defaults)
  → Trade Bands → 0.05 BTC, sold-call $120,000 / bought-put $68,000 → preview ok (slippage
  **0.0710% ≈ $0.07**, bought leg auto-derived 0.001754 BTC), Transact enabled → click → executes:
  pool y 303,448.28→303,604.47, **lp-y-delta $156.20** (nonzero), bands count 1, curve/dot redraw
  (mean 1.25px, max 318px — dot+ray move), Spot($) KPI ticks $30,344.83→$30,517.30, **no NaN
  anywhere** (sweep of every .kpi-val/.val/.derived-val). NO wing-range rejection at sane sizes —
  in-band holds up to 50 BTC on the 10-BTC pool (50 BTC shows honest slippage 93.97% ≈ $59,834 and
  still executes-enabled; noted, not flagged). `A_04_pre_trade.png` / `A_05_post_trade.png`.
- **5. Over-size — PASS (pixel-confirmed).** 100 BTC band → red banner **"Bought leg: trade
  exceeds frozen-wing range — split or widen Δw."** + Transact disabled
  (`C_06_wing_message_N100.png`, legible crop `C_06b_wing_message_crop.png`). Reproduced ×2.
- **6. v24-feel side-by-side — PASS-with-flags.** Identical: oracle 80000, page nav, 4 subtabs,
  KPI labels, 4 chart views, perp defaults (0.1/$1000), band prefills (0.05 / 84000 / 68000),
  settings sections — plus exactly ONE new section "(W) Curve Shape · kurtosis" (3 number inputs:
  τ/w₋/w₊). Conspicuously different beyond the (W) controls: **(i) Spot/Spot($)/w KPI VALUES**
  (v24: 1.0000/$80,000/0.5000 → v27: 0.3793/$30,344.83/0.7250 — same labels, jarring numbers; the
  flag above); **(ii) pool y $303,448.28 vs v24's $800,000** (deliberate equilibrium-at-load so
  marginal=oracle, code comment L2285-2289 — defensible, but it IS a default-parameter change from
  v24 and should be surfaced to the operator with the rationale); (iii) Depth-k value differs
  (different invariant — expected). `V24_01_load_default.png` vs `V27_01_load_default.png`.

**DESIRABLE:**
- v24 dollar world restored: oracle 80000 / marginal $80,000.000 at load / $-KPIs at BTC scale;
  layout+defaults parity with v24 verified element-by-element. [#1]
- Slider fully gone; τ stepper live with sane sensitivity; knob visibly works at the restored
  defaults. [#3]
- The two readout absurdities RECONCILED (lp-y-delta dynamic baseline; LIQ $70k/$90k @8×). [#11-adj]
- Whole loop playable: load → see curve → step knob → trade → readouts move, no NaN, guard messages
  honest. [#2, #16, #10]
**UNDESIRABLE:**
- Spot ($) KPI shows reserve ratio ($30,344.83), not the marginal ($80,000) — diverges from v24's
  load-time read and from the "$80k world" the rest of the screen now speaks. **OPEN.** [#1/display]
- τ up/down arrows CSS-hidden — mouse stepping dead on the knob the no-sliders instruction was
  about; keyboard-only. **OPEN** (one-line CSS). [#3]
- y0=303,448.28 ≠ v24's 800,000 (rationale'd default change, not silently bad — but it is a
  default-parameter delta from v24 the operator explicitly asked about). **OPEN-for-ruling.** [#1]
**NEUTRAL:** band inputs prefill 0.05/84000/68000 on load (same as v24's prefill behavior).

**OPERATOR-VOICE:** ([verbatim-transcript],
`history/operator/2026-06-10_kurtosis-curve-family-brief.md` Entry 29)
- **THE OBJECTION, entry 29:** "do a quick UX test, I dont know what you did in the past but i'm
  not able to play with it. why has anything in the UX changed from the v24 case including default
  parameters? I mentioned also I dont want sliders anymore just updown arrows with appropriate
  sesicitivty" — clause-by-clause status: **"not able to play with it"** → ADDRESSED(evidence:
  this run's full loop, ×2); **"why has anything changed from v24 incl. default parameters"** →
  LARGELY ADDRESSED (defaults/layout restored; residuals = Spot($) KPI value, y0 choice — both
  surfaced above, OPEN); **"no sliders, updown arrows, appropriate sensitivity"** → no-sliders MET
  + sensitivity MET; up/down-arrow CLICKABILITY NOT met on τ (CSS-hidden) — OPEN.
- Context note per transcript: the "updown arrows" instruction predates the transcription policy
  (operator: "I mentioned also…") — no earlier verbatim source exists; entry 29 is the verbatim
  record of it.
**EVIDENCE:** `evidence/v27_ux/` — A_01_load_default, A_04_pre_trade, A_05_post_trade,
A_07_perp_form, C_02_tau_low_005, C_03_tau_high_150, C_06_wing_message_N100,
C_06b_wing_message_crop, C_08_tau_field_closeup, V24_01/V27_01_load_default (side-by-side),
trace_ux_operator.json (runs A+B), trace_ux_fixup.json. Harnesses
`engine/verify/pw_v27_ux_operator.mjs` + `pw_v27_ux_fixup.mjs`. **VERDICT: OPERATOR-PLAYABLE =
YES (load → curve at $80k → step knob → trade, ×2 clean); two UX flags OPEN (Spot($) basis,
τ arrow affordance).**

---

## v27 UX-restore `9d22cffd` → DISPLAY-FIX `1eebfcd6` (3 display fixes after the entry-29 UX verdict: τ spinner CSS, Spot KPI basis, header spot basis)   [status: HEAD (in-place display fix on the promoted line); tester FAST spot-check live ×2]
_Tester live-Playwright Chromium 2026-06-10, FAST spot-check scoped to the 3 fixes, reproduced ×2
with byte-identical verdicts. Build `HEAD_temporal_mvp_v27_wkurtosis.html` md5
`1eebfcd6f6ff4f4e3df5f745ac145f19`. File-safety GREEN: blob line-md5s `ab663f5c…` (webp L74) /
`c505b08a…` (svg now at L1064 — line number shifted by the new CSS, content canonical), 3 scripts
parse (36808/26679/83563 chars), 0 console/page errors._

**FEATURES:** #3 (τ stepper arrows un-hidden — `.field-input-wrap` spinner CSS L331-337 now
inner-spin-button/opacity 1, settings panel + perp form), #1/display (Spot + Spot($) KPI re-pointed
to the marginal `getMP_raw` — display wiring only, L4304-4306), #1/display (hdr-pool-spot same
marginal basis, L4256 — a header line I had NOT flagged; the manager fixed it same-basis in the
same pass). **None beyond** — CSS + display wiring only, engine math untouched (#2, #4–#14, #16
not in scope; #13 still the open ship-gate); #15 file-safety re-verified.

**PER-ITEM VERDICTS:**
- **1. τ up/down arrows MOUSE-CLICKABLE — PASS (tester-confirmed ×2, pixel + value + canvas).**
  Arrows now VISIBLE on the τ field (`D_04_tau_field_closeup_now.png` vs the `C_08` hidden-arrow
  baseline). Real mouse click on the up arrow steps **0.30→0.35** and the CURVE REDRAWS (canvas
  dataURL differs pre/post); down-click returns 0.35→0.30. Computed-style probe: ALL settings/perp
  number inputs now show spinners (tau, wminus, wplus, perp-margin, kappa, tick-hours — all
  opacity 1); pixel sample `D_08_other_field_spinner.png` (kappa + tick-hours, arrows visible).
  Observation (not a flag): the wcurve-status text "γ_loc(ATM)=2.64 · wings γ₋=1.50, γ₊=5.67" is
  identical at τ=0.30 and 0.35 at displayed precision — the canvas redraw is the binding evidence
  of the live update.
- **2. Spot KPI reads the $80k world at load — PASS (tester-confirmed ×2, pixel + DOM + live
  engine).** `kpi-spot-usd` = **$80,000.00**, `kpi-spot` = **1.0000** (was $30,344.83 / 0.3793 raw
  y/x). Live cross-check: `Store.state.oracle`=80000, `Engine.getMP_raw(pool)`=80000.00000000001 —
  the KPI now equals the marginal. `D_02_kpi_spot_crop.png` (SPOT 1.0000 · SPOT($) $80,000.00 ·
  W(DERIVED) 0.7250 · DEPTH K 170.83 — kpi-w stays the honest (W) weight per the code comment).
- **3. hdr-pool-spot — PASS (tester-confirmed ×2, pixel + DOM).** Header reads exactly
  **"spot $80,000.00"** (same `getMP_raw` basis, L4256). `D_03_hdr_pool_spot_crop.png`.
- **No console/page errors, both runs.** (Harness needed one nav fix — click the Settings subtab
  before reaching τ; harness bug, not a build finding.)

**DESIRABLE:** all three operator-facing display residuals closed; the entry-29 ask — clickable
up/down arrows + the $80k world on screen — is now MET end-to-end. [#1, #3]
**UNDESIRABLE:** none new found in scope. (Carried OPENs unchanged: y0=303,448.28 default-delta
OPEN-for-ruling [#1]; unported GH-line items D2/D9/D10/D11/D13/D14/D16; #13 ship-gate; funding
theory-risk [#9].)
**NEUTRAL:** svg blob line number 1060→1064 (CSS insertion above it; content md5 canonical).

**OPERATOR-VOICE:** no new operator entries since 29
(`history/operator/2026-06-10_kurtosis-curve-family-brief.md` ends at Entry 29, re-checked this
run). This pass answers Entry 29's two clauses that were OPEN [verbatim-transcript]: "I mentioned
also I dont want sliders anymore just updown arrows with appropriate sesicitivty" → up/down-arrow
CLICKABILITY now MET (was the open residual; evidence D_04/D_06 + click-step ×2); "why has
anything in the UX changed from the v24 case including default parameters?" → the Spot/Spot($)/
header readouts now show the v24 load values ($80,000.00 / 1.0000) — KPI-value divergence
RESOLVED(evidence: D_02/D_03 + live DOM ×2). Still pending from that clause: the y0=303,448.28
default-parameter delta — OPEN-for-ruling, unchanged by this pass.

**EVIDENCE:** `evidence/v27_ux/` — D_01_load_kpis, D_02_kpi_spot_crop, D_03_hdr_pool_spot_crop,
D_04_tau_field_closeup_now (arrows visible; baseline C_08 = hidden), D_05_tau_field_hover,
D_06_tau_after_upclick (value 0.35), D_07_full_after_upclick, D_08_other_field_spinner,
trace_ux_spotcheck.json. Harness `engine/verify/pw_v27_ux_spotcheck.mjs` (run from `engine/`,
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers). **VERDICT: 3/3 PASS ×2, 0 console errors — the
operator's exact ask (clickable up/down arrows, $80k world) is MET.**

---

## TEST-ONLY observation — premium-controlled warp + composite-ray spread (operator entry 30)   [status: BEHAVIORAL VERIFICATION on HEAD `1eebfcd6`, NO build edit / NO version change / NO promotion]

**Provenance:** live Playwright Chromium on `HEAD_temporal_mvp_v27_wkurtosis.html` md5
`1eebfcd6f6ff4f4e3df5f745ac145f19` (operator live-playing HEAD; zero versioning churn requested).
Real UI driven (Add Perp → Trade Bands), rendered DOM read, warp truth read from the live page
`Engine`/`Store`. Reproduced clean ×2 (byte-identical), 0 console errors. **No build file touched.**
Harness `engine/verify/pw_v27_premium_warp.mjs`; evidence `evidence/v27_premwarp/`.

**CHECK 2 — vertical spread == single composite-ray AMM tx: CONFIRMED (tester-confirmed, exact).**
[#16, composite-ray identity] Sold-call vertical K1=$96,000 / K2=$120,000, N=0.5. The live spread
path resolves to ONE AMM tx at θ*=√(θ₁θ₂)=**1.341641** (engine `compositeRay` matches to
residTheta=0.0e0; θ* lies BETWEEN θ₁=1.2000 and θ₂=1.5000 — confirmed). Value carries the
difference via `vsValue(N, m*, δ)=N·m*·2·sinh|δ|`, δ=½ln(θ₂/θ₁)=**0.111572**; executed
V_sell=0.00372346 (asset) == vsValue identity to **residV=0.0e0**; `legPrice` spread branch agrees
exactly. UI renders mode pill "**SPR**", `pv-sold-theta`=1.3416, `pv-sold-V`=$297.88, slip 0.1776%,
Transact enabled. Screenshots `R1_C2_spread_setup.png` (spread + audit strip), `R1_C2_curve.png`.
**VERDICT: PASS — the spread executes as the single composite-ray tx, no residual.**

**CHECK 1 — premium-controlled warp: the operator's claim is NOT reproduced on this engine — FLAG.**
[#2, #16, warp-with-trades] Operator (entry 30, `[verbatim-transcript]`
`history/operator/2026-06-10_kurtosis-curve-family-brief.md:217,219`): *"for same premium (perp
option price * notional) as you sell further OTM inner bound, the curve would warp more"* … *"when
you go further holding notional the same it warps less because the price of option reduces and
total premium and slippage also would reduce so you have to check premium same not notional same."*
- **The notional-CONSTANT contrast HOLDS (operator's secondary claim, correct on screen).** Sold-call
  inner-OTM ladder $88k→$112k at N=0.5 BTC: premium $1624.78→$1276.61 ↓, slippage 0.9716%→0.7627% ↓,
  warp (sold-leg φ-shift) 3.843e-3→3.021e-3 ↓ / curve px-displacement 0.436px→0.343px ↓. Further OTM
  at constant notional ⇒ warps LESS, premium+slippage shrink — exactly as the operator described.
- **The constant-PREMIUM primary claim FAILS (the central ask).** Holding premium=$1624.78 (scaling N
  0.500→0.636 BTC across the same ladder): the warp is **byte-IDENTICAL at every rung** — φ-shift
  3.8429e-3, px-displacement 0.436px, slippage 0.9716% — it does NOT increase further OTM. Visually
  the near ($88k) and far ($112k) constant-premium curves are indistinguishable (`R1_C1_curve_near_
  constprem.png` vs `R1_C1_curve_far_constprem.png` — only the red sold-call ray angle differs; the
  curve body + post-trade dotted curve are the same warp).
- **ROOT CAUSE (engine, structural):** `tradeUpdate(s, dy)` (L1723) takes only the cash delta dy; the
  strike θ is NEVER an argument. dy = ±V_usd = ±premium (executeLeg L1850). β=y·(1−w_field) and α=x·w
  are fixed by the ENTRY state, so φ′ is a pure function of (entry state, dy) ⇒ **constant premium ⇒
  constant φ-warp regardless of how far OTM the strike sits.** On this (W) strong-form engine the warp
  is set by the cash moved, not the strike. The operator's intuition (further-OTM-at-equal-premium
  warps MORE) implies a strike-dependence in the warp that the current engine does not have.
- **NOT a render artifact** — the φ truth is read directly from the live engine state, and the px
  metric re-projects curveTraceW on the live canvas extents; both agree and reproduce ×2.

**OPERATOR-VOICE (entry 30, all `[verbatim-transcript]` `…kurtosis-curve-family-brief.md`):**
- :217 *"for same premium (perp option price * notional) as you sell further OTM inner bound, the
  curve would warp more"* — **NOT reproduced on HEAD `1eebfcd6` (constant premium ⇒ identical warp).
  OPEN — surfaced to manager; engine has no strike-dependence in the warp. Cannot mark resolved.**
- :219 *"holding notional the same it warps less … so you have to check premium same not notional
  same"* — notional-constant half CONFIRMED on screen; the premium-constant instruction was followed
  and is what exposes the gap.
- :223 *"the 'AMM tx shortcut' … two options in the same leg constituting a vertical spread amount to
  a single AMM tx at some point between them for the value difference"* — **CONFIRMED exactly** (θ*
  between, value=difference via vsValue, residual 0).

**Feature-key:** touches #16 (warp-with-trades) and #2 (curve warp). **none beyond** #16/#2 (CHECK 1)
and #16/composite-ray identity (CHECK 2) — no other inventory feature changed (TEST-ONLY, no edit).
**Table rows:** #2 and #16 carry an added observation note (no STATE change — HEAD unchanged, no
edit); the CHECK-1 gap is logged as a new OPEN operator question (manager to escalate). #16 also
gains the composite-ray PASS confirmation.

---

## TEST-ONLY observation — entry-45 lacunae verification: τ sensitivity / long↔short "break" / anchor placement / warp visibility   [status: BEHAVIORAL VERIFICATION on HEAD `1eebfcd6`, NO build edit / NO version change / NO promotion]

**Provenance:** live Playwright Chromium on `HEAD_temporal_mvp_v27_wkurtosis.html` md5
`1eebfcd6f6ff4f4e3df5f745ac145f19` (verified at run start; operator live-playing HEAD; READ-ONLY
constraint honored — no build edit). Real UI driven (settings τ stepper, band form, ⇅ swap, pill,
Transact); rendered DOM + canvas pixels read; engine truth from live page `Engine`/`Store`.
Reproduced clean ×2 (every verdict-bearing number byte-identical). **0 uncaught page exceptions in
every phase.** File-safety GREEN (blobs `ab663f5c…` L74 / `c505b08a…` L1064 canonical; 3 scripts
parse). Harnesses `engine/verify/pw_v27_entry45_lacunae.mjs` + `pw_v27_entry45_probe2.mjs`;
evidence `evidence/v27_entry45/` (screenshots + `trace_entry45.json` + `trace_probe2.json`).

**ITEM 1 — τ (kurtosis) stepper sensitivity: operator perception CONFIRMED-LIVE; mechanism is
intrinsic geometry, NOT a redraw bug.** [#2, #3]
- Redraw FIRES on every step including one real ArrowUp click 0.30→0.35: `Store.state.pool.tau`
  updates and the curve canvas changes (3,745–5,433 px differ per step — the whole thin curve
  micro-shifts, so diff-count saturates).
- Rendered-trace displacement (analytic, app's own cached frame): one click 0.30→0.35 **3.39px**
  max; 0.30→0.60 **19.9px**; 0.30→1.50 **70.5px**; 0.30→3.00 **131.4px**; full-range 0.05→3.00
  **153.7px** — maxima always at the far wing tail (canvas ~(678,392), bottom-right).
- WHY it still LOOKS insensitive (screenshots `I1_tau_0.30_baseline` vs `I1_tau_3.00` vs
  `I1_tau_0.05` — barely distinguishable even at full range): (i) `curveTraceW` re-derives the
  F-level THROUGH the live point, so the elbow is PINNED (Δln x=0 at u=u₀=φ); (ii) the wings are
  exact power-laws whose τ-change is asymptotically a constant log-shift (−(Δw/2)·Δτ) — a
  self-similar tail sliding ALONG ITS OWN TANGENT, which the eye cannot see; (iii) Δw=0.25 caps
  the whole effect (|Δln x| ≤ (Δw/2)·Δτ). The manager's pre-derivation (0.59% one click / 32%
  full-range, wing-end-dominated) is CONFIRMED at px level.
- **Calibration honesty:** my prior runs verified "τ changes the curve + math correct" (5.6px mean
  / 111px max τ 0.05↔1.5) and called it PASS — per-click operator-perceptibility was never the
  bar. The operator's report is the correct description of what an eye sees. Whether the knob
  SHOULD have more visual authority (bigger Δw default, curvature/γ_loc overlay, ghost-overlay of
  the pre-τ curve) = design question, operator-tier. **VERDICT: REFUTED as bug / CONFIRMED as
  intrinsic — FLAG-UX-DESIGN (escalate).**

**ITEM 2 — "the simulation breaks when you switch long to short": REFUTED as crash; CONFIRMED as
two real UI defects, operator screenshot state reproduced exactly.** [#10 display, #15 clean]
- **No JS exception anywhere:** 5 scenarios (operator-exact short-club band / both-clubs /
  default band / no-perps / long-club ITM variant) + pill-toggle + Transact click, ×2 runs — 0
  uncaught exceptions, 0 console errors. Engine clean both signs: the mirrored band executes to a
  finite sane state (P1: x 10→9.578, y 303,448→343,371, φ 10.408; leg dys = exact Δy raw USD).
- **DEFECT (a) — STALE-ON-REJECT frankenstate (the operator's screenshot).** `previewBand`'s
  reject paths (`!sim.ok`, club guards) set the warn banner + disable Transact but do NOT clear
  the summary/audit/N_buy readouts. Live: valid long band (sold 100000/bought 52000, N=9.95,
  seeded clubs) previews 18.1469% → click ⇅ → displays sell 9.95 @ 52000, dir=short, MAX chip
  0.0625 BTC (= the SEEDED demo short club $5,000/$80k — boot adds two demo perps, no user perp
  needed) + warn "Sell leg: trade exceeds frozen-wing range — split or widen Δw." — **while
  slippage/N_buy/net-cash still show the pre-swap numbers (slippage text byte-identical across
  the swap, STALE-CHECK=true ×2 paths ×2 runs).** The operator's 18.2297% / 0.536960 BTC /
  sell@52000 / MAX 0.0625 screenshot IS this state (their decimals differ from boot because their
  pool had prior play; the state class is exact — `P2_post_swap_frankenstate.png`). Pill-toggle
  path identical (stale + "not OTM" warn). Swap-back recovers the valid preview.
- **DEFECT (b) — ×oracle unit inflation in the band audit strip.** Engine returns leg `dy` /
  `netPoolY` in RAW y-units (USD): 28,453.17 + 11,470.09 = 39,923.26 — verified equal to the
  pool's actual Δy leg-by-leg. The UI multiplies by oracle AGAIN (`fmtUSD(sim.netPoolY*s.oracle)`
  L3229, same on pv-dy-sold/pv-dy-bought L3227-28): displays **"$3,193,860,736.165340"** net pool
  cash on a $303k pool (and "2276253475.7428 $" / "917607260.4225 $" leg dys). V_sold/V_bought
  are normalized and display CORRECTLY ($28,453.17/$11,470.09) — mixed conventions in
  `executeBand`'s return hid this. Audit strip is collapsed by default, which is why it survived
  every prior pass. Display-only; engine consistent.
- Transact on a valid-but-over-club band → honest native alert **"Open failed: Over-carve: band
  needs $796000 notional but club free is $10000."**, pool untouched (headless auto-dismisses
  dialogs — looked silent in harness until a dialog listener was wired; a human operator gets the
  alert).
- My code-read suspicion (MAX-chip undefined-club path) REFUTED — chip guarded, clubs seeded both
  sides. **VERDICT: REFUTED-crash / CONFIRMED two OPEN UI defects (intern-fixable: clear summary
  on all reject paths; drop the ×oracle on the three raw-USD fields).**

**ITEM 3 — anchor curve "way off in the corner": CONFIRMED-LIVE, matches the known-OPEN
diagnosis, root cause now exact.** [#2 viz; known-OPEN since promotion]
- The gray "anchor (w=½)" overlay is `curveTraceExplicit(0.5, snap.depth, modeSlope)` (L3473)
  with `snap.depth = Engine.getDepth = x^w·y^(1−w)` evaluated with the (W) field weight w=0.725
  → k=170.83 in (W) units, fed into a w=½ trace ⇒ anchor hyperbola xy=k²=29,186: passes
  y=$2,918.4 at x=10 vs live curve y=$303,448.3 — **104× below.** Rendered: a faint gray L
  hugging the origin corner (bbox px [65.6,255.1]→[675.2,415.6]; the rise to py=255 is the tail
  pressed against the y-axis at x≈0.08 BTC) — `I3_anchor_curve_default.png`. The operator's
  description is accurate. A meaningful w=½ anchor through the live point needs k=√(x·y)=1,742
  (w=½-units depth), not the (W)-units depth. No new mechanism. **VERDICT: CONFIRMED — the
  promotion-noted "anchor-overlay viz" OPEN item, now with exact root cause (stale Balancer
  parametrization + wrong-units k). Intern-fixable one-liner.**

**ITEM 4 — trade-warp visibility: operator CONFIRMED; quantified; structural on the band path.**
[#16, #2]
- Real UI executes (event-log confirmed): 1 BTC band (sold call 120000 / bought put 68000) → Δφ
  = 7.41e-3; +2 BTC → cumulative Δφ = 2.18e-2 → **max curve displacement 2.14px** for $240k
  notional traded against a 10-BTC pool. A $50k-notional band moves the curve **0.48px** —
  sub-pixel. (`P6_warp_pre/post_cum.png`.)
- Structural root cause, measured: the band (the ONLY UI trade path) nets sold-premium minus
  bought-premium (1 BTC: V_sold $2,383.01 − V_bought $757.41 ⇒ net ≈ $1,626 cash vs y=$303k);
  φ responds to NET CASH (entry-30 root cause: `tradeUpdate(s,dy)`, premium-only) ⇒ band trades
  are nearly warp-neutral BY CONSTRUCTION. This COMPOUNDS the elbow-local subtlety disclosed at
  promotion (entry-28 override): even the "big" warp a one-sided $50k cash leg would give
  (φ≈0.12) is unreachable through the band UI. **VERDICT: CONFIRMED-LIVE — known-OPEN
  (OVERRIDDEN) item, now quantified on the $80k defaults; the band-cash-neutrality amplification
  is NEW information for the operator's warp-visibility decision.**

**Also observed (minor, operator-visible):** boot event-log line "Initialised. Pool: x=10 BTC,
y=$800k, w=0.5. Oracle=$80k." is STALE — actual y₀=$303,448.28, w-field 0.60/0.85 (L4565).
Positive control worth noting: band slippage is τ-INVARIANT for wing legs (18.1469% at every τ
0.05→3.00, P5 sweep) — consistent with the frozen-wings design claim.

**OPERATOR-VOICE (entry 45, `[verbatim-transcript]`
`history/operator/2026-06-10_kurtosis-curve-family-brief.md:341` — sent twice, interrupt +
identical resend; addressed "skeptic, tester"):**
> *"did you check that the curve is almost completely insensitive to kurtosis change? theres no
> visible curve warp, and the simulation breaks when you switch long to short.... i'm concerned
> at these lacunae, skeptic, tester. the anchor curve is sitting way off in the corner somewhere"*
- *"did you check…"* — honest answer: prior runs verified τ redraw + engine math, NOT per-click
  eye-visibility; the operator's perception is CONFIRMED correct. OPEN (design ruling needed on
  desired visual authority).
- *"theres no visible curve warp"* — CONFIRMED, quantified (2.14px / $240k); structural (band
  nets premiums). OPEN (ties to OPEN -1 strike-independence + entry-28 OVERRIDDEN blocker).
- *"the simulation breaks when you switch long to short"* — no crash; the break = STALE-ON-REJECT
  frankenstate + $3.19B ×oracle display inflation. Two OPEN defects, intern-fixable; screenshot
  state reproduced.
- *"the anchor curve is sitting way off in the corner"* — CONFIRMED defect (stale w=½ overlay,
  wrong-units k, 104× off). OPEN, intern-fixable.

**Feature-key:** #2 (curve-warp viz: τ authority, anchor overlay), #3 (kurtosis knob visual
sensitivity), #10 (slippage/cash display: stale-on-reject + ×oracle inflation), #15 (file-safety
re-verified clean), #16 (warp-with-trades visibility quantification). **None beyond** — #1, #4–#9,
#11–#14 unchanged and not implicated (TEST-ONLY, no build edit; #7/#8 OTM/registration paths
behaved per spec in the band probes).
**Table rows updated:** #2, #3, #10, #15, #16. **Rolling list:** new OPEN item -2 (entry 45).
**Reconciliation list:** +4 rows (stale-on-reject; ×oracle audit inflation; anchor overlay
sharpened; stale boot log line).

---


## v27 `1eebfcd6` → ENTRY-46 FIX BUILD `928cde1c` (entry-45/46 lacunae fixes: stale-on-reject clear, band-audit raw USD, anchor through live point, τ disclosure)   [status: HEAD (in-place fix on the promoted line); tester STANDING UI SMOKE-PASS live ×2 — FIRST invocation of the standing §8 smoke gate]

**Provenance:** live Playwright Chromium on `HEAD_temporal_mvp_v27_wkurtosis.html` md5
`928cde1cccb0f35fdc9a23a7634414c8` (verified at run start; READ-ONLY honored — no build edit).
Real UI only (band form, ⇅ swap, pill, Transact + dialog listener, perp form, earn, settings
inputs/steppers, oracle KPI, arb/tick/reset, page-nav, export/import). Reproduced clean ×2 —
every verdict-bearing number byte-identical across runs. **0 uncaught exceptions, 0 console
errors** (2 Canvas2D `willReadFrequently` advisories are harness-induced getImageData readbacks).
File-safety GREEN (blobs `ab663f5c…` L74 / `c505b08a…` L1064 canonical; 3 scripts parse;
`run_all.sh` 22/22 PASS [HARD] incl. WARP (g)). Harness `engine/verify/pw_v27_entry46_smoke.mjs`;
evidence `evidence/v27_entry46_smoke/` (29 shots + crops + `trace_entry46.json` + INDEX.txt).

**FEATURES:** #1 (Spot KPI display basis — NEW post-rebase finding), #2 (anchor overlay FIXED;
overlay inventory re-confirmed), #3 (τ disclosure sentence; per-click delta re-baselined),
#5 (rebase — display-layer interaction, FINDING-R), #10 (BOTH entry-45 display defects FIXED:
stale-on-reject + ×oracle audit inflation), #15 (file-safety re-verified on `928cde1c`),
#16 (warp path re-exercised unchanged: φ Δ=4.44e-4 on the 0.05-BTC execute; steppers/w-readout
verified). **None beyond** — #4, #6–#9, #11–#14 unchanged and not implicated (engine script
byte-identical to `1eebfcd6`; all deltas are UI-layer).

**DESIRABLE (fix-acceptance — intern's 4, ALL PASS):**
- **(a) STALE-ON-REJECT cleared [#10]:** `clearBandPreviewOut()` (L3136) now resets all 15 pv-*
  fields, N_buy display, $-sublines, deposit row, mode pills, slippage/fee summary on EVERY
  reject path. STALE-CHECK = **FALSE on all three reject paths ×2 runs**: ⇅ swap after a valid
  18.1469% preview (warn "Sell leg: trade exceeds frozen-wing range", every output '—', Transact
  disabled), pill-toggle ("not OTM" reject — cleared), 100-BTC !sim.ok (cleared). The operator's
  entry-45 frankenstate is unreachable in these paths. (`A1_path1..3*.png`)
- **(b) Band audit strip raw USD [#10]:** ×oracle dropped (L3242-47 comment marks the fix).
  Valid 9.95 band: pv-dy-sold **28453.1684 $**, pv-dy-bought **11470.0908 $**, pv-net-cash
  **$39,923.259202** — EXACT match to the entry-45 engine truth (raw pool Δy, was displayed
  $3,193,860,736). 1 BTC band: 2859.61/913.09, net $3,772.70 — engine-scale. (`A2_*.png`)
- **(c) Anchor overlay through the live reserves point [#2]:** `curveTraceExplicit(0.5,
  √(x·y))` (L3494): k=1,741.98 (was (W)-units 170.83, 104× low). Anchor passes **1.15px** from
  the live dot (trace-sampling granularity); in-frame bbox px (133,21)→(673,371) — visually a
  proper reference hyperbola through the white dot, re-shot on the entry-45 frame
  (`I3_anchor_curve_default.png`). Pixel-confirmed.
- **(d) τ disclosure [#3]:** sentence present + visible on Settings, 41px above tau-input:
  "Visible effect scales with the wing gap (w₊−w₋) and is subtle per 0.05 step — sweep τ widely
  or widen the wing gap to see it." — honest per the entry-45 quantification. (`A4_*.png`)

**FULL SMOKE (standing gate, every control):** perps long+short (8.0×, liq $70k/$90k, clubs
correct); bands BOTH directions valid previews (long 0.0852%, post-swap short 0.3834%);
preview steppers enable on preview, toggle active state, redraw (2,312px diff between leg views),
w-readout w: 0.725000→0.725130→0.725170; execute commits (pool.y +187.44, φ +4.44e-4, band
opened); **over-carve honest alert CAPTURED via dialog listener**: "Open failed: Over-carve:
band needs $80000 notional but club free is $14000." — pool untouched; earn deposit/withdraw
exact round-trip ($607,271.44→$617,271.44→back); γ>1 clamp REFLECT-BACK verified (0.45→input
shows 0.501/γ₋=1.00; 0.99→0.950 cap; restore clean); κ/tick-hours set; oracle 80000→90000
rebase redraws (10,954px); arb + 8h funding tick clean; Portfolio renders (10 rows, no
NaN/undefined); export/import round-trip state-identical excluding eventLog (keyDiffs=[]);
reset restores boot exactly. **τ per-click delta (the operator's knob): one ArrowUp 0.30→0.35 =
3,744 px canvas diff / 3.39px max analytic displacement — byte-matches the entry-45 baseline;
full sweep 0.05↔3.00 = 153.73px (entry-45: 153.7).** Engine behavior unchanged, confirmed.
**Overlays identified + sanity-located** (boot frame): live (W) curve through the white reserves
dot, gray anchor through the same dot (post-fix), faint ATM ray, dashed sold/bought strike rays
with leg dots (boot-suggested band), preview leg curves/rays when a band previews. Legend matches.

**UNDESIRABLE:**
- **FINDING-R (NEW, display-only; NOT an entry-46 regression — this path was never smoke-tested
  before): post-rebase Spot($)/header show POOL-FRAME dollars, not current dollars [#1, #5].**
  `kpi-spot-usd` + `hdr-pool-spot` display `getMP_raw` (L4325-27, L4277) without the
  `× oracle/oracle_initial` factor that the engine's own honest Layer-2 mark `poolMark` (L1660)
  applies and that arb/OTM/funding consume. Live symptom: raise oracle to $90,000 → Spot($)
  DROPS $80,136.38→$71,232.34; run arb → Spot($) reads **$80,000.00 while the Oracle box reads
  90000** (engine-consistent: poolMark = 80,000×1.125 = $90,000 = oracle; arb gap correctly
  closed). Honest at r=1 only — exactly the state every prior display check ran in. **OPEN —
  intern display fix (use poolMark for the $ KPI, or label the frame); operator-visible
  confusion class = same display-basis family as the `9d22cffd` Spot-KPI item.**
- Boot event-log line "y=$800k, w=0.5" still stale (L4586) — entry-45 minor, not in this fix's
  scope. OPEN (carried).

**NEUTRAL:** export/import eventLog gains an "Imported." entry (by design); svg blob line stays
L1064; engine `<script>` byte-identical to `1eebfcd6` (the curve math unchanged — all four fixes
are UI/Viz layer).

**OPERATOR-VOICE (`[verbatim-transcript]`
`history/operator/2026-06-10_kurtosis-curve-family-brief.md`):**
- Entry 45 (:341): *"did you check that the curve is almost completely insensitive to kurtosis
  change? theres no visible curve warp, and the simulation breaks when you switch long to
  short.... i'm concerned at these lacunae, skeptic, tester. the anchor curve is sitting way off
  in the corner somewhere"* — status per clause: **"breaks when you switch long to short"
  (= stale-on-reject + $3.19B audit display) → RESOLVED(this build, STALE-CHECK FALSE ×3 paths
  ×2 runs + exact-dollar audit match)**; **"anchor … way off in the corner" →
  RESOLVED(this build, pixel-confirmed through the live dot)**; "almost completely insensitive
  to kurtosis change" → **mechanics unchanged by design (3.39px/click re-confirmed); the new
  disclosure sentence is TRANSPARENCY, not authority — whether the knob should have more visual
  authority stays OPEN (operator-tier design Q, rolling -2)**; "theres no visible curve warp" →
  **unchanged, OPEN** (structural band cash-neutrality, rolling -1/-2; entry-28 override stands).
- Entry 46 (:348): *"do the needful"* — **RULED(go-ahead)**: the fix order this build executes.
  Context: manager held the build until the operator's go.
- Entry 44 (:334, process directive bearing on how this entry reaches the operator): *"dont
  involve me in PR management … if i ask questions like that and you want to drop caveats, the
  right way to do it is to give me the most recent feature level edit / correction with simple
  english."* — noted as the reporting style contract for relaying this ledger.

**EVIDENCE:** `evidence/v27_entry46_smoke/` (INDEX.txt catalogs all 29 shots + crops +
`trace_entry46.json` + `export_state.json`); harness `engine/verify/pw_v27_entry46_smoke.mjs`;
oracle run `engine/verify/run_all.sh` GREEN 22/22. **Tester verdict: PASS — all four
fix-acceptance items + full smoke; FINDING-R flagged OPEN (display-only).**
**Table rows updated:** #1, #2, #3, #5, #10, #15, #16. **Rolling list:** item -2 amended
(defects (b)/(c) resolved; design questions remain). **Reconciliation list:** 3 rows →
RECONCILED-in-`928cde1c`; +1 new row (FINDING-R); boot-log row carried OPEN.

---


## ▶ NEW BUILD LINE — v24 base → v28 polar-lens Stage 1 `temporal_mvp_v28_lens_S1.html` (`5e1ff278`)   [status: CANDIDATE, NOT HEAD — HEAD stays v27 `928cde1c`; new line off PLAIN v24, NOT a v27/GH descendant; tester STANDING UI SMOKE-PASS live x2 byte-identical verdicts]
_Tester live-Playwright Chromium, READ-ONLY on the build, reproduced clean x2 (IDENTICAL verdicts,
0 console errors / 0 pageerrors both runs). Build = v24 base + a STATIC polar-lens READ layer on
CHART 2 (option/value view) + funding; POOL curve (chart 1) and all trade mechanics are plain v24,
byte-identical (manager pre-verify: tradeUpdate delta 0 vs v24, lens_selfcheck 14/0). Harness
`engine/verify/pw_v28_lens_S1_smoke.mjs`; evidence `evidence/v28_lens_S1/` (17 shots + RUN_LOG x2).
File-safety GREEN: blobs canonical `ab663f5c...` (webp L74) / `c505b08a...` (svg L1060), 3 scripts parse.
Node `lens_selfcheck.js` = 14 PASS / 0 FAIL._

**FEATURES:** #1 (Balancer base - literal v24, unchanged), #3 (kurtosis knob tau - NEW static polar-lens
knob, number stepper 0.05-3 default 0.3, NO slider), #6 (pricing value~S^(-gamma_loc) - now read through
the lens g_loc=gamma*h'_tau(|u|) on chart 2), #7 (ITM American smooth-paste - lens twin `markLensed`, seam
value/slope continuous incl. g<1, selfcheck 4a/4b/4c), #9 (funding - re-pointed through the lens, +-g_loc
replaces +-2; ATM->0 via g_loc->0), #10 (slippage - plain v24, lens does NOT touch executed slippage),
#11 (dollar/settlement pipe - plain v24, lens NOT in the traded dollar settlement - parked, see
OPERATOR-VOICE), #12 (getMP_raw price-coord - plain v24), #15 (file-safety GREEN), #16 (warp-with-trades
- plain v24 alpha/beta-conserving tradeUpdate, byte-identical; lens is read-only, never feeds a slope back).
**None beyond.** (#2 curve-warp w(u), #4 carry, #5 rebase, #8 registration, #13 solvency, #14 Esscher:
all plain v24, untouched by Stage 1.)

**DESIRABLE (tester-confirmed live):**
- **#3/#6/#7 lens reshapes chart 2 - VISIBLE.** Forced-redraw measurement (canvas px, raw ImageData):
  tau0.3->0.05 elbow **sharpens** (analytic max dpsi=0.328 ~98px at phi=45.8deg; rendered 6,645 px changed),
  tau0.3->2 **rounds/flattens** (DEFAULT pool 8,103 px; STEEP pool w=0.78 6,276 px). Sharp spike at small
  tau vs rounded broad peak at large tau - tester eye-confirmed (`S2_01` vs `S3_03`). **Visible in BOTH
  the default pool (w=0.5/gamma=1) and a steep pool (w=0.78/gamma=3.55)** - the default is NOT degenerate
  here (unlike v27's symmetric-wing default), because gamma comes from the single v24 w, not a Dw wing-gap. [#3,#6,#7]
- **#3/#6 WINGS FROZEN.** Far-wing dpsi across the full tau sweep ~5.1e-5 (default) / 8.5e-5 (steep) - the
  power-law wings tend to the same slope; only the ATM elbow moves. Matches the spec contract. [#3,#6]
- **#9 funding through the lens - ATM->0, OTM signed, finite.** With S=poolMark/oracle != 1 (steep pool
  w=0.7 => S=2.333): funding ATM call/put = 0.000e0 (g_atm=0, the g_loc->0 lens factor zeros it even
  with the (S-1)/S leg alive); OTM call=+2.230e-3 / OTM put=-2.230e-3 (opposite sign, correct
  call>0/put<0 convention, equal magnitude on the symmetric lens). All finite. [#9]
- **#7 g=0 / S*=0 path FINITE (MUST-APPLY-2).** `markLensed` at the exact g=0 ATM point returns the
  inclusive boundary value 1 (call & put), no NaN/Inf - the `pow(1,-inf)` trap is avoided. selfcheck 4c +
  live probe agree. [#7]
- **#16 trade is plain v24 + the lens read re-renders.** In-range band execute: reserves moved on the
  FIXED v24 curve (10->9.905 BTC, y 800k->807.7k, alpha/beta conserved, invariant (x-alpha)(y-beta)=alpha*beta
  rel resid 1.16e-16); chart 1 redrew the moved point (8,020 px), chart 2 lensed mark re-rendered (11,607 lit px).
  Trade mechanic byte-identical to v24 (selfcheck 6/6b). [#16]
- **#15 file-safety + clean console.** 0 uncaught exceptions / 0 console errors across all 6 steps +
  full standing smoke, x2 runs. Blobs canonical, 3 scripts parse, lens_selfcheck 14/0.

**UNDESIRABLE:**
- *** FLAG-1 (#3) - the tau stepper does NOT auto-redraw chart 2. OPEN - blocks the Stage-1 hand-back.**
  Turning KURTOSIS tau updates `Store.state.tau` (verified) but chart 2 does **not** refresh: a 0.3->3
  step via the real stepper event yields **0 px change** on the pricing canvas. Root cause: the
  tau-input change/input handler (~L2702) guards its redraw with `if (window.Viz && Viz.drawAll)`, but
  `Viz` is a `const` IIFE (L3175) **never attached to `window`** => `window.Viz===undefined` => the
  redraw branch is dead. Chart 2 only refreshes when some OTHER action fires `render()`/`Viz.drawAll`
  (Advance Time / Arbitrage / a trade / Reset). **This is exactly the operator's recurring "curve
  almost completely insensitive to kurtosis change" symptom (entry 45), here at the chart-2 lens - and
  it would read as "the knob does nothing" to the operator playing live.** One-line intern fix:
  `window.Viz = Viz;` (or replace the guarded call with the same `render()` the other handlers use).
  The lens math + draw are CORRECT (forced redraw shows the full 98px reshape) - purely a redraw-wiring
  defect. [#3] **OPEN.**
- **INHERITED-from-v24 (NOT a Stage-1 regression) - band audit xoracle inflation.** `pv-net-cash`
  reads $618,314,484.19 (and -$545,831,965.28 post-swap) on an $800k pool: `dy`/`netPoolY` are ALREADY
  USD (`V_usd = p.V*oracle`, L1755) and the display multiplies by `s.oracle` AGAIN (L3050-3052
  `netPoolY*s.oracle`). **Verified byte-identical in the v24 base** (`temporal_mvp_v24_rebase_fixed_2.html`
  L2959/L2961) - same defect class the entry-45 audit caught and entry-46 FIXED on the v27 line, but
  this build is off PLAIN v24 where that fix never existed. The slippage line itself is sane
  ("1.9322 % . ~ $73.62"). Lens does not touch this path. **OPEN - carried as inherited-v24; if v24's
  known gaps are being corrected on this line (operator entry-93 "correcting its known gaps"), this is
  one.** [#10/#11]

**NEUTRAL:**
- New Settings field "KURTOSIS tau" with an honest sim-aid label ("polar-lens kurtosis knob . STATIC
  (vol-set at deploy) . rounds the ATM elbow ... wings stay exact power-laws. Smaller tau => sharper elbow").
- Chart 2 (Mark Across Strikes) x-axis = strike polar angle phi; mode marker phi_m drawn; mark curve now the
  lensed `markLensed` psi. Chart 1 (Pool Curve) plain v24 - verified HARD invariant to tau.

*** CONTAMINATION PROBE (the key Stage-1 separation) - PASS HARD.** Chart 1 (Pool Curve) px-diff across
the FULL tau sweep {0.05, 1.0, 2.0, 3.0} (each with a forced redraw) = **0 px at every tau**. tau touches
chart 2 + funding ONLY; the pool curve is untouched. Tester-confirmed (`S4_01` vs `S4_02` pixel-identical).

**OPERATOR-VOICE** (`history/operator/2026-06-10_kurtosis-curve-family-brief.md`, per section 2.2 verbatim):
- **RULED - the Stage-1 architecture is the operator's own design [verbatim-transcript], Entry 94 (L695):**
  *"yeah basically here its balancer curve unchanged with the stuff we read from it and write (AMM tx)
  to it being through a polar lens (implementing vol / steepness / kurtosis into chart 2 view)"* - and
  Entry 91 (L621): *"ok now if we retain balancer but have the AMM tx and the settlement funding wueries
  etc work through the polar lens (which splays around the mode) would changing the extent of lensing
  soove for the kurtosis thereby steepening curve 2?"* Stage 1 delivers the **chart-2 READ + funding**
  through the lens (tester-confirmed). **OPEN GAP (faithful to the operator's words):** the operator's
  intent includes the **"AMM tx ... write to it being through a polar lens"** - i.e. the *traded* dollar
  settlement also through the lens. Stage 1 does NOT do this (lensed premium does NOT flow into the
  executed-trade dollar figures - the chart-2 mark is lensed while executed dollars are plain v24; the
  manager flagged this as a parked operator-tier decision). **Recorded OPEN - Stage 1 is a partial
  realisation of the operator's stated lens scope; not presented as complete.** [#10, #11, #16]
- **RULED [verbatim-transcript], Entry 93 (L688):** *"... 5 idc, same geometric thing whatever it
  implies ..."* (answer to funding-through-lens) => funding-through-lens ACCEPTED as-is by the operator.
  Stage-1 funding routes through g_loc; tester-confirmed ATM->0 / OTM-signed. RULED-accepted.
- **RULED [verbatim-transcript], Entry 93 (L688):** *"... 2 no cap imo, same as balancer literally so not
  the generalised thing, ... now theres just x y w that move ..."* => gamma from the single v24 w (no
  frozen-wing Dw construct); the lens is cap-free (selfcheck 3 `|g_loc|<=gamma everywhere`). Matches build.
- **RULED [verbatim-transcript], Entry 95 (L702):** *"i'm going to bed, giving go ahead to build a
  version once you're satisfied without asking me anything. skeptic, you have the mandate, have the
  needful done"* - the autonomous build authorization this Stage-1 build runs under; operator ASLEEP.
- **No operator OBJECTION recorded against v28/Stage-1 yet** (build post-dates the last operator turn).
  FLAG-1 (tau no-auto-redraw) is a tester finding the operator has not seen; it is the same *class* as the
  operator's standing entry-45 objection (*"the curve is almost completely insensitive to kurtosis
  change"*, L341) and would reproduce that complaint on this build until fixed.

**EVIDENCE:** `evidence/v28_lens_S1/` - S1_01/02 (tau stepper + chart-2 default), S2_01 (tau0.05 sharp),
S3_01/02/03 (tau2 default + steep pool sweep), S4_01/02 (chart-1 tau-invariant), S5_01/02 (perp + bands),
S6_01/02 (post-trade chart-1/chart-2), SM_01..04 (swap/payoff/trajectory/reset), RUN_LOG_runA/B.txt
(byte-identical verdicts). Harness `engine/verify/pw_v28_lens_S1_smoke.mjs`. Node `lens_selfcheck.js`
14/0. **VERDICT: Stage-1 mechanics + lens math + chart-1/chart-2 separation all PASS; ONE blocking FLAG
(FLAG-1 tau no-auto-redraw, OPEN intern one-liner) + one INHERITED-v24 xoracle audit defect. NOT a
HEAD-promotion (HEAD stays v27). Stage-1 hand-back gate = HOLD pending FLAG-1.**

**Table rows updated:** #3 (tau knob - lens visible but no auto-redraw FLAG), #6, #7, #9, #10 (inherited
xoracle), #15 (new build, file-safety green). **Rolling list:** new OPEN item -3 (FLAG-1). **Reconciliation
list:** +2 new rows (FLAG-1 tau no-auto-redraw OPEN; inherited-v24 xoracle audit OPEN).

---

## ▶ v28 polar-lens Stage 1 (`5e1ff278`) → Stage 2 `temporal_mvp_v28_lens_S2.html` (`b53ace99`)   [status: CANDIDATE, NOT HEAD — HEAD stays v27 `928cde1c`; same v24-base lens line; ADDS write/settle-through-lens (operator entry 96) + the FLAG-1 fix; tester STANDING UI SMOKE-PASS live ×2 byte-stable]
_Tester live-Playwright Chromium, READ-ONLY on the build, reproduced clean ×2 (IDENTICAL verdicts,
0 console errors / 0 pageerrors both runs). Build = Stage-1 lens + Stage-2 settle-THROUGH-lens: trades,
portfolio value AND settlement now record the LENSED value (operator entry 96). Manager pre-verify: pool
byte-identical to v24 (tradeUpdate delta 0), `lens_selfcheck.js` 23 PASS / 0 FAIL, blobs canonical.
Harness `engine/verify/pw_v28_lens_S2_smoke.mjs`; evidence `evidence/v28_lens_S2/` (15 shots + RUN_LOG_runA/B
+ INDEX + probes/). File-safety GREEN: blobs `ab663f5c...` (webp L74) / `c505b08a...` (svg L1060), 3 scripts parse.
md5 `b53ace9996930249cad85fc1e37e6c61` UNCHANGED post-run (READ-ONLY)._

**FEATURES:** #3 (kurtosis knob tau — FLAG-1 FIX: stepper now AUTO-REDRAWS chart 2 live), #6 (pricing
value~S^(-gamma_loc) — settlement now reads it through the lens), #7 (ITM American smooth-paste — `markEff`/
`legValueUnified` settle-side LENSED at the reciprocal sNorm mode; one-ITM-leg path exercised), #9 (funding —
unchanged from S1, through-lens), #10 (slippage — executed slippage plain v24; round-trip residual reported,
see FINDING-RT), #11 (dollar/settlement pipe — NOW the lensed value is the unit of account; carved-perp-unit
band columns vs a single $ settlement cell), #14 (Esscher/trade — unchanged), #15 (file-safety GREEN), #16
(warp-with-trades — plain v24 tradeUpdate, byte-identical; settlement reverses legs on the same v24 AMM).
**None beyond.** (#1 Balancer base, #2 curve-warp w(u), #4 carry, #5 rebase, #8 registration, #12 getMP_raw,
#13 solvency: all plain v24 / unchanged from S1, untouched by Stage 2.)

**DESIRABLE (tester-confirmed live ×2):**
- **#3 FLAG-1 RESOLVED — the tau stepper AUTO-REDRAWS chart 2 LIVE.** The deferred FLAG-1 confirmation: a
  real stepper EVENT now reshapes chart 2 with NO forcing action. Event-only px-diff: tau 0.3->0.05 = **5,199 px**,
  tau 0.3->2 = **6,545 px**, a genuine keyboard **ArrowUp** spinner click 0.3->0.35 = **3,894 px**. (`window.Viz`
  is still `undefined`, but the L2724 handler now calls `if (Viz) Viz.drawAll(...)` reaching Viz via the ui-script
  closure — the dead `window.Viz` guard is gone.) The Stage-1 blocker is GONE. [#3]
- **#3/#6 chart 1 (pool curve) INERT to tau — HARD.** px-diff across the full sweep {0.05,1,2,3} = **0 at every
  tau** (the key read/write separation). Tester-confirmed (`S2_01` vs `S2_02` pixel-identical). [#3,#6]
- **#7/#11 settle-THROUGH-lens works — one-ITM-leg reciprocal-coordinate path PROVEN live.** Steep pool w=0.6,
  sold-call (K=$140k) OTM-at-open, oracle pushed 80k->160k to drive the sold call ITM, then close: settlement
  splits `settled_cash_leg=sold` (ITM leg priced at the pre-AMM state, NOT pushed through the AMM) + `live_leg=bought`
  (OTM leg reversed on the AMM); raw_net=-4.797e-3 (pool-favourable here), X/Y/raw_net all finite. The ITM mark
  reads in the RECIPROCAL sNorm coordinate (getSNorm), per MUST-APPLY-A. [#7,#11]
- **#11 portfolio value IS the lensed unit of account.** An OPEN band's value moves with tau: analytic band
  value Delta = **4.544e-2** across tau 0.3->2 (X/Y both recomputed through `markLensed` at the live mode). The
  lens is now what's recorded/queried. (Closed bands correctly FREEZE their settlement $ — `$35.16`/`$12.14`
  identical at tau0.3 and tau2 — settlement is fixed at close-time, not re-lensed retroactively.) [#11]
- **#11 NO mixed-basis on a single column.** Portfolio band rows: **8 carved-perp-unit value/funding cells, NONE
  carry a `$`**; exactly **1 dedicated $ cell** = the settlement total (title "settlement value = L0 . raw_net .
  carved equity at closure"). The carved perp slice (un-lensed) is NOT summed onto the lensed option-$ basis in
  one cell — the de-conflation holds. Tester-confirmed (`S7_01`). [#11]
- **#7 near-ATM (g_loc~0) settles FINITE.** A band tight around spot opens and settles: raw_net=7.166e-4, X/Y
  finite; markLensed at the exact g=0 ATM point = 1 (no NaN/Inf); portfolio text NaN/Infinity-free. [#7]
- **#15 file-safety + clean console.** 0 uncaught / 0 console errors across all 8 steps + standing smoke, ×2 runs.
  Blobs canonical, 3 scripts parse, lens_selfcheck 23/0. Build md5 unchanged post-run.
- **#16/#11 standing coverage** — both band directions OPEN (pill long + short), swap control flips inputs+dir,
  arb, tick, LP deposit/withdraw round-trip ($1.6M->$1.6M), all 4 overlays (curve/pricing/payoff/trajectory) lit +
  located, reset to clean. [#16]

**UNDESIRABLE:**
- **FINDING-RT (INHERITED-v24, NOT a Stage-2 regression) — an instant net-cash-zero open->close round-trip on a
  TWO-OTM-LEG band yields a POSITIVE (TRADER-FAVOURABLE) raw_net that SCALES with slippage.** raw_net = Y - X
  (bought-leg minus sold-leg, carved-perp units). On an immediate reversal of a band whose open net-cash was ~0,
  raw_net is POSITIVE and grows super-linearly with size: N=0.01 -> +1.57e-4 (slip 0.239%), N=0.05 -> +3.71e-3
  (slip 1.17%), N=0.2 -> +4.30e-2 (slip 4.25%); the engine's own close logic (L2146 `if (raw_net > 0 && club.equity
  <= 0)`) treats raw_net>0 as the **trader-winning** case, so this is a trader-favourable residual, the OPPOSITE of
  the brief's "tiny residual = pool-favourable, NOT a leak" expectation. **ROOT: the v24 closeBand settlement
  geometry** — both same-sign legs (sold call + bought put) push the pool the same way on open, so reversing BOTH
  on close moves each option price in the trader's favour (sold-leg cheaper to buy back, bought-leg richer to sell).
  **VERIFIED byte-identical raw_net in S1 AND the v24 base** across N=0.01/0.05/0.2 (`probes/compare_S2_S1_v24.txt`)
  — it is the inherited v24 round-trip behaviour, NOT introduced by the lens (Stage 2 only rescales the marks; the
  one-ITM-leg case S6 is correctly pool-favourable, raw_net<0). **Status: OPEN — escalate the sign convention to the
  operator (entry 96 ruled "settle at lensed prices" but did NOT address the round-trip residual direction). Does
  NOT block the Stage-2 hand-back gate by itself (Stage-2 settles correctly RELATIVE to its v24 base), but the
  brief's stated residual direction is contradicted and must be surfaced.** [#10/#11]
- **INHERITED-from-v24 band-audit xoracle inflation (carried from S1, unchanged).** The band PREVIEW net-cash row
  (`pv-net-cash`) still x-oracle-double-multiplies on the Transact preview (e.g. tens-of-millions on the open
  preview) — verified byte-identical to the v24 base / S1; NOT a Stage-2 regression. The PORTFOLIO settlement cell
  ($35.16/$12.14) is sane. **OPEN — inherited-v24; in the operator entry-96 bug-batch ("yes fix bug").** [#10/#11]

**NEUTRAL:**
- Settlement comments/code now carry the Stage-2 markEff/legValueUnified lensed split + reciprocal-coordinate
  notes; portfolio band-value columns labelled "carved-perp units" with a single $ settlement cell.

**OPERATOR-VOICE** (`history/operator/2026-06-10_kurtosis-curve-family-brief.md`, per section 2.2 verbatim):
- **RULED — the Stage-2 settle-through-lens IS the operator's explicit ruling [verbatim-transcript], Entry 96 (L710):**
  *"everything works the same, the lens just translates queries incl portfolio value etc. and writes (amm tx) — so
  yes settle at lenses prices — this doesn't mean the strike changes or whatever, but you'd be recording the lensed
  version to query if that answers your question deeply enough"* — Stage 2 implements exactly this: trades/portfolio/
  settlement record the lensed value, strike unchanged (tester-confirmed: open-band value moves with tau, one-ITM-leg
  settles in the reciprocal coordinate, the carved slice stays un-lensed). The Stage-1 OPEN-GAP (write/settle NOT
  through the lens) is now CLOSED by this build. **RULED-and-implemented.** [#7,#10,#11]
- **RULED — the xoracle + subsequent-version bug-batch [verbatim-transcript], Entry 96 (L712-714):** *"yes fix bug"*
  ... *"and other bugs we fixed in subsequent versions including something about anchor curve, the atm jump etc etc..."*
  => the xoracle audit inflation + anchor-curve + ATM-jump are operator-directed fixes still PENDING on this lens
  line (the brief's "bug-batch + visible-warp stage before promotion"). Recorded OPEN, operator-ruled-to-fix. [#10]
- **OPEN (no recorded ruling) — the round-trip residual SIGN.** Entry 96 ruled the lensed value is what's settled,
  but the operator has NOT ruled on whether an instant round-trip should be trader- or pool-favourable. FINDING-RT
  is a tester finding the operator has not seen; it inherits from v24 and must be escalated, not assumed acceptable.
- **No operator OBJECTION recorded against v28-S2 specifically** (build post-dates the last operator turn; entry 96
  is the build-enabling ruling). Entries 97-99 (payoff #8/#9 dispositions, comms-protocol enforcement) are adjacent,
  not Stage-2-specific.

**EVIDENCE:** `evidence/v28_lens_S2/` — S1_00/01/02 (tau auto-redraw chart 2), S2_01/02 (chart-1 tau-inert),
S3_01/02 (round-trip open/close), S4_01/02 (portfolio tau0.3/tau2), S5_01 (near-ATM finite), S6_01/02 (steep ITM
settle + swap), S7_01 (basis columns), S8_01/02 (overlays + reset), RUN_LOG_runA/B.txt (byte-stable verdicts),
probes/ (roundtrip_dissect / sign_vs_slippage / compare_S2_S1_v24). Harness `engine/verify/pw_v28_lens_S2_smoke.mjs`.
Node `lens_selfcheck.js` 23/0. **VERDICT: ALL 12 step/gate verdicts PASS ×2 byte-stable — Stage-2 mechanics
(write/settle-through-lens, one-ITM-leg reciprocal settlement, portfolio-as-lensed-unit, no-mixed-basis, near-ATM
finite) + the FLAG-1 tau auto-redraw fix all PASS. ONE finding to surface: FINDING-RT (trader-favourable round-trip
residual, INHERITED-v24, sign-convention question for the operator) + the carried inherited-v24 xoracle preview
inflation. NOT a HEAD-promotion (HEAD stays v27). Stage-2 hand-back gate = PASS; remaining pre-promotion work =
the operator entry-96 bug-batch (xoracle/anchor/ATM-jump) + the visible-warp stage.**

**Table rows updated:** #3 (FLAG-1 RESOLVED — tau auto-redraw live), #7 (settle-side lensed markEff, one-ITM-leg
reciprocal path), #10 (round-trip residual FINDING-RT + carried xoracle), #11 (settle/portfolio = lensed unit of
account, no mixed-basis), #15 (new build file-safety green). **Rolling list:** OPEN item -3 (FLAG-1) -> RESOLVED-in-`b53ace99`;
+1 new OPEN item (FINDING-RT sign). **Reconciliation list:** FLAG-1 row -> RECONCILED-in-`b53ace99`; +1 FINDING-RT row.

---


## v28 polar-lens Stage 2 (`b53ace99`) → FINAL `temporal_mvp_v28_lens_FINAL.html` (`989752294`)   [status: PROMOTION CANDIDATE → HEAD on this gate's PASS; operator-authorized promotion entry 106 "please do"; replaces HEAD v27 `928cde1c`]
FEATURES (inventory #s touched): #1 (Balancer base — pool byte-identical to v24, manager-verified), #2 (curve warp / lensed chart-2 reshape on a trade), #3 (kurtosis knob τ — live chart-2 redraw confirmed; no slider; κ funding-decay knob present), #6 (pricing value∝S^(−γ_loc) READ through the lens), #7 (ITM smooth-paste settle-at-lensed; one-ITM-leg reciprocal coord), #9 (funding-through-lens), #10 (slippage basis; FINDING-RT carried), #11 (dollar/settlement pipe = lensed unit of account, no mixed-basis), #15 (file-safety green; new build md5). **NONE BEYOND** — #4/#5 carry/rebase unchanged (oracle-change rebase UI-exercised, consistent); #8 strike registration unchanged from the lens line; #12 price==slope unchanged; #13 solvency boundary unchanged (still the known OPEN ship-gate, not touched); #14 esscher/rapidity unchanged; #16 warp-with-trades transformation present (lensed warp visible — see DESIRABLE), trade-point anchoring still the standing OPEN/LIVE gap (transformation-faithful, anchoring-OPEN).

DESIRABLE (cleanup batch C1–C9, all tester-confirmed live ×2 byte-stable):
  - C1 [#10]: band audit "net trader cash @ open" = **$2,928.837797** (order-$10k) — the S1/S2 inherited-v24 xoracle DOUBLE-MULTIPLY ($618M-class) is FIXED on this build (L3082 drops ×oracle; pv-dy-* already-USD). RECONCILES the entry-96 bug-batch xoracle item ON THIS LINE.
  - C2 [#2]: anchor (w=½) overlay passes THROUGH the live reserves point — k=√(x·y) (L3285), anchor-y-at-live-x == live y exactly (passes-through=true), pixel-confirmed (`*_C2_anchor_curve.png`). Same fix-class as v27 entry-46; now present on the lens line.
  - C3 [#10,#11]: every PREVIEW-time reject path (zero-notional / not-OTM sold strike / crossed strikes / no-club) shows a warn AND clears EVERY preview field to '—' AND disables Transact — STALE-ON-REJECT (entry-45 frankenstate class) is clean on this line (`clearBandPreviewOut` L2996). Over-carve is an EXECUTE-time guard: notional-100-BTC band rejects with alert "Over-carve: band needs $8000000 notional but club free is $160000." (no pool move, no booked band).
  - C4/C7 [#7]: payoff N_buy DERIVES distinct from N_sell (fresh band N_sell=0.04, N_buy=0.04102762…) with V_buy==V_sell (cash-conserving bridge, L1853 lensed legPrice); booked basis matches.
  - C5 [#11]: LP "Pool y delta (vs initial)" = **$0.00** at load (dynamic _initial_y baseline); LIQ-PRICE sane — long **$70,000.00** / short **$90,000.00** @8× at $80k defaults.
  - C6 [#11]: close-log + portfolio $-cell tooltips read as a band P&L VS ENTRY, not money the trader walks away with — close-log: *"…band P&L vs entry (trader)=$3.36, Δclub equity=$2.95 [both legs reversed on AMM]"*; portfolio tooltips: "attributable P&L — carvedNotional·(perpMark−entryPerpMark)/entryPerpMark; dimensionally [USD]" etc. Label-only fix (number unchanged).
  - C8 [#7]: payoff frame spans −90%…+200% (xMin=−0.9, xMax=2.0, L3859) with x-ticks −50/0/+50/+100/+150/+200% across it (`*_C8_payoff_frame.png`, 104766 lit px). RECONCILES the v27 NOTES-D9 ±50% gap on this line.
  - C9 [#7]: a NAKED (single-barrier) leg's payoff climbs past the CAPPED spread (tent) leg deep-ITM — analytic deep-ITM naked=0.8031 > spread=0.1871 (L3901 cap-at-1 per-barrier; spread = inner−outer tent). RECONCILES v27 NOTES-D10 naked-leg-cap on this line.
  - WARP [#2,#16] (skeptic #33, operator due-diligence L744): a trade VISIBLY reshapes chart-2 (the option/value curve) — a 0.5-BTC band execute moved w 0.50182→0.51868 and changed chart-2 by **9,953 px** (`*_WARP_chart2_aftertrade.png`). The lensed warp is legible (NOT the sub-pixel band-cash-neutral problem of the v27 line) because the lens amplifies the elbow reshape.
  - τ read-lens [#3]: τ stepper EVENT auto-redraws chart-2 live (0.3→2 = 6,545 px, real ArrowUp 0.3→0.35 = 3,894 px) AND chart-1 is HARD-inert to τ (0 px across {0.05,1,2,3}) — the read/write separation holds (FLAG-1 fix carried from S2).
  - settle-at-lensed [#7,#11]: round-trip finite (no settled-cash leg, raw_net=8.347e-3); near-ATM g_loc≈0 settles finite (markLensed g=0→1, no NaN); steep one-ITM-leg POOL-favourable (raw_net=−4.797e-3, sold leg settled-to-cash, bought leg reversed on AMM).

UNDESIRABLE:
  - FINDING-RT [#10,#11] — instant net-cash-zero open→close on a TWO-OTM-LEG band is TRADER-favourable (raw_net=+8.347e-3, scales with slippage). **OPEN — INHERITED-v24** (byte-identical raw_net verified in S1/S2/v24 base across N=0.01/0.05/0.2). Brief's "tiny pool-favourable residual" is contradicted on the SIGN. Sign convention NOT operator-ruled (entry 96 ruled "settle at lensed", not round-trip direction). **Does NOT block this gate** (settles correctly vs its base; the ONE-ITM-leg case IS pool-favourable). **Escalate the sign convention to the operator.**
  - Boot-log stale-label class (carried v24/v27, minor) — not re-checked this run; intern text item. OPEN(minor).
  - NONE NEW introduced by this build vs S2 beyond the C-batch (all C-batch are FIXES, not regressions).

NEUTRAL: τ disclosure context; κ control present (funding-decay); no wminus/wplus wing inputs on this v24-base line (v27-(W) artifact, correctly absent — confirmed in DOM).

OPERATOR-VOICE (distilled from `history/operator/2026-06-10_kurtosis-curve-family-brief.md`, all [verbatim-transcript]):
  - RULED — promotion authorized, entry 106 (L791-793): _Context "operator authorizes the finishing work — cleanup batch + warp check + final test + promote to live."_ → *"please do"*. This gate IS that final test; on PASS the manager promotes to HEAD. RULED-and-this-build-implements.
  - RULED — settle at lensed prices, entry 96 (L708-710): *"everything works the same, the lens just translates queries incl portfolio value etc. and writes (amm tx) — so yes settle at lenses prices … you'd be recording the lensed version to query"*. v28-S2/FINAL implement it; tester-confirmed (open-band value moves with τ, one-ITM-leg reciprocal settle, no mixed-basis). RULED-and-implemented.
  - RULED — the xoracle + subsequent-version bug-batch, entry 96 (L708 context + the prior ruling): operator approved the xoracle fix and directed porting the anchor-curve / ATM-jump fixes from subsequent versions. **C1 (xoracle) + C2 (anchor) are now FIXED on this build** — these operator-directed fixes are RECONCILED on the lens line (the S1/S2 OPEN xoracle item closes here).
  - RULED — lens-correctness assurance, entry 98-class (L754, L770): *"how do i get a clear assurance you've implemented lensing properly. i.e. its splaying / changing directions from 45 degree tangent slope point on curve"* / *"lens is basically a sort of tangent slope amplification / multiplier that's a function of relative polar angle divergence from the angle passing through mode (45 degree tangent slope to curve) right?"* → assurance evidence on this gate: lens_selfcheck 23/0 (g_loc=γ·h′_τ(|u|) about the mode, ATM g=0, wings→γ, cap-free) + the WARP observation (a trade splays chart-2 about the mode by 9,953 px). The 45°-tangent splay is the markLensed math the selfcheck pins.
  - OPEN (no recorded ruling) — the round-trip residual SIGN (FINDING-RT). Operator ruled the lensed value is settled but has NOT ruled trader- vs pool-favourable on an instant round-trip. Escalate; cannot be marked resolved without an engine change or an operator ruling.
  - No operator OBJECTION recorded against the FINAL build specifically (it post-dates entry 106's go).

EVIDENCE: `evidence/v28_lens_FINAL/` — A_*/B_* shots (00 charts_tau, C1 audit, C2 anchor, C3 rejects, C4 payoff, C5 lp/liq, C6 close-pnl, C8 payoff-frame, WARP, STD perps/bands/oracle/portfolio/overlays/settle/reset), RUN_LOG_runA.txt == RUN_LOG_runB.txt (byte-stable, 27/27 PASS, 0 console errors), INDEX.txt. Harness `engine/verify/pw_v28_lens_FINAL_smoke.mjs` (live Playwright, READ-ONLY). Node `lens_selfcheck.js` 23/0. File-safety: webp L74 `ab663f5c…`, svg L1060 `c505b08a…`, 3 scripts parse, build md5 `989752294` UNCHANGED post-run.
**VERDICT: 27/27 gate verdicts PASS ×2 byte-stable; C1–C9 + warp all confirmed; 0 uncaught/console errors. PROMOTION GATE = PASS.** One finding to surface (not blocking): FINDING-RT round-trip SIGN (INHERITED-v24, escalate to operator).

**Table rows updated:** #1 (pool byte-identical v24; C5 LP/LIQ sane on this build), #2 (C2 anchor-through-live FIXED; WARP visible 9,953px), #3 (τ chart-2 live redraw confirmed on FINAL; κ present; no wing inputs), #7 (C4/C7 N_buy derives; C8 frame −90..+200; C9 naked>capped; settle-at-lensed one-ITM reciprocal), #10 (C1 xoracle FIXED on this line; FINDING-RT carried), #11 (C6 P&L-vs-entry label; settle/portfolio lensed unit; no mixed-basis), #15 (FINAL build file-safety green, md5 `989752294`). **Rolling list:** OPEN item -4 (FINDING-RT) stays OPEN (carried to FINAL); xoracle item → RECONCILED-on-the-lens-line-in-`989752294`. **Reconciliation list:** +rows for C1/C2/C8/C9 RECONCILED-in-`989752294`; FINDING-RT row updated (now also on FINAL).

---


## v28-lens FINAL (`989752294`) → HEAD `7e1ae39b` (one-line slippage-refresh wire: τ stepper now calls previewBand)   [status: HEAD (in-place one-line display-refresh on the promoted lens line); tester TARGETED live re-check ×2 byte-stable]
SCOPE: exactly one line changed vs the promoted FINAL build — L2727, the τ-input change handler now also calls `previewBand()` (before `render()`/`Viz.drawAll`) so the band preview AND its slippage readout recompute when kurtosis τ changes. Engine + lens math BYTE-UNCHANGED (display-refresh wire, not a math edit). The FINAL standing-smoke 27/27 stands; this is a targeted confirm of the one new behavior, not a re-smoke.
FEATURES (inventory #s touched): #3 (kurtosis knob τ — its stepper now also refreshes the band-preview/slippage view, completing read-side τ-reactivity that already redrew chart-2), #10 (slippage readout — now live-recomputes on a τ change, not stale). **NONE BEYOND** — #1 Balancer pool byte-identical v24 (chart-1 0px to τ, band cleared); #2 lensed warp unchanged; #4/#5 carry/rebase untouched; #6 pricing-read lens unchanged; #7 ITM settle-at-lensed unchanged; #8 strike-reg unchanged; #9 funding unchanged; #11 dollar/settlement pipe unchanged; #12/#13/#14 unchanged; #15 file-safety green (build md5 `7e1ae39b`, blobs canonical); #16 trades-warp transformation unchanged.
DESIRABLE (tester-confirmed live ×2 byte-stable):
  - [#10,#3] τ stepper alone (NO re-touch of trade inputs) moves the slippage readout: #band-slippage τ0.3→0.5569% (≈$6.18), τ1.0→0.9031% (≈$16.20), τ0.1→0.4258% (≈$3.62), back to τ0.3→0.5569% (returns exactly — non-stale, recomputes from τ); real keyboard ArrowUp 0.3→0.35→0.5915%. 4 distinct values, monotone-with-τ, matching the manager-derived ~0.25→0.76%-across-the-τ-range trend for a fixed option. The wire TOOK. Root: legPrice is lensed/τ-threaded (L1848) ⇒ N_buy ⇒ leg2 reserve move ⇒ s2 ⇒ s_band depends on τ; previewBand recompute now fires on the τ event.
  - [#3] chart-2 (canvas-pricing) still reshapes on τ (6,545 px τ0.3→2) — the FINAL redraw regression holds.
  - [#10,#11] a trade still executes (band 0→1) and BOTH charts re-render (chart-1 Δ4,742px, chart-2 Δ5,646px, no dialogs) — the added previewBand() call did not break the execute path.
UNDESIRABLE:
  - NONE NEW. (FINDING-RT [#10,#11] still OPEN/INHERITED-v24, carried from FINAL, unaffected by this display-only wire — escalate sign convention to operator.)
NEUTRAL:
  - New DESIRED side-effect on chart-1: with an ACTIVE band preview, the τ change now re-draws the band-preview GHOST overlay on the pool-curve canvas (sim.finalState depends on τ via lensed N_buy → ghost moves ~1,902px τ0.3→1.5). NOT a pool-curve regression — the underlying plain-v24 pool CURVE is byte-inert to τ (0px across {0.1,1,2,3}) when the band is cleared. Read/write separation (#1 pool inert / #3 view lensed) holds; only the preview annotation (itself a view) follows τ. Verified both ways (STEP4 cleared=0px; STEP4b active-preview=ghost redraws).
OPERATOR-VOICE (scan `history/operator/2026-06-10_kurtosis-curve-family-brief.md` — no NEW operator message post-dates entry 106; this wire is finishing-work under entry-106 "please do"):
  - RULED (carried) — finishing work authorized, entry 106 (L791-793): *"please do"*. A live-reactive slippage readout on the τ knob is within the authorized finish; no new ruling needed for a one-line display-refresh.
  - Related standing OPEN (entry 45, L341) [verbatim-transcript]: *"did you check that the curve is almost completely insensitive to kurtosis change?"* — that objection was chart visibility (RECONCILED on the lens line). This wire extends τ-reactivity to the SLIPPAGE NUMBER too, so the knob now visibly moves a quantitative readout as well as the curve — consistent with the objection's spirit. Not a new ruling; recorded as supporting the entry-45 reconciliation.
  - No operator OBJECTION recorded against this build.
EVIDENCE: `evidence/v28_lens_FINAL/RECHECK_INDEX.txt` + `RECHECK_RUN_A.txt`==`RECHECK_RUN_B.txt` (byte-stable, 0 console/0 page errors) + `R_{A,B}_S1_band_open_slip.png` / `_S2_tau1.0_slip.png` / `_S2_tau0.1_slip.png` / `_S3_chart2_tau2.png` / `_S6_after_trade.png`. Harness `engine/verify/pw_v28_lens_slipfresh_recheck.mjs` (live Playwright, READ-ONLY). File-safety: build md5 `7e1ae39baa00fda087033174cfc652b8` UNCHANGED post-run; webp L74 `ab663f5c…`; svg L1060 `c505b08a…`; 3 scripts parse.
**VERDICT: PASS ×2 byte-stable — slippage RECOMPUTES on τ alone (non-stale, the wire took); chart-2 still reshapes; chart-1 pool curve inert; trade still executes both charts; 0 console/page errors. The one-line slippage-refresh build is DONE.**

**Table rows updated:** #3 (τ stepper now also refreshes band-preview/slippage view — read-side τ-reactivity complete), #10 (slippage readout live-recomputes on τ, non-stale). **Rolling list:** no new OPEN; FINDING-RT carried unchanged. **Reconciliation list:** no change (display-only wire introduces no undesirable).

---


## v28-lens HEAD (`7e1ae39b`) → C16 GOAL-SEEK-WARP candidate `temporal_mvp_v28_lens_warp.html` (`abd46149961cab45f1992b7e21850d5f`)   [status: CANDIDATE — gates HEAD promotion on this STANDING UI SMOKE-PASS; tester live Playwright ×2 byte-stable]
SCOPE: vs current HEAD this build adds (1) a HELD-LENS WARP VIEW on the trade preview — the dashed post-trade option/value curve (canvas-pricing / "Mark Across Strikes") is drawn at the HELD (pre-step) mode so the per-strike lensed-exponent warp `dG(K)=(γ′−γ)·Φ_τ(u)` stays visible instead of being re-registered flat; and (2) a GOAL-SEEK readout — a new G input (target wing-exponent) with closed-form `w′=Engine.goalSeekW(G)=G/(1+G)` plus live read-point γ, w′, resulting γ′. Pool/exec/settle layers byte-unchanged from the lens HEAD (manager pre-verify: lens_selfcheck 29/29, pool byte-identical, HEAD un-regressed). This is the build for operator entries 127–133 (the goal-seek-warp directive). Implements the operator's "we change w to warp the curve; goal-seeks that tell us how much to warp w are seen through the lens" (entry 128).
FEATURES (inventory #s touched):
  - **#16 (warp-with-trades) — the warp VIEW.** The trade-preview now RENDERS the held-lens warp on chart-2: a 2-BTC one-sided sold-CALL leg (step-1 preview) moves w 0.50000→0.53583 (γ 1.0000→1.1544) and the dashed preview curve visibly diverges from the live curve across the whole profile (NOT flat, NOT re-registered) — tester live ×2 + zoom screenshot. This is the first build where a single trade's warp is UNMISTAKABLE on screen (vs the v27 sub-pixel "dot sliding" and the v28 band cash-neutral subtlety).
  - **#3 (kurtosis knob τ) — the lens factor Φ_τ scales the warp.** The warp view reads through the static τ lens; goal-seek copy names Φ_τ as the wing-scaler.
  - **#2 (curve warp w(u)) — goal-seek READOUT.** New G input ⇒ w′=G/(1+G), advisory only (drives nothing automatically; the trade is the actuator).
  - **#10 (slippage) — the step-1 preview slippage reads 15.4388% ≈ $4277.56 on the 2-BTC sold-leg drive (sane, finite).**
  **NONE BEYOND** — #1 Balancer pool byte-identical v24 (canvas-CURVE 0px to τ 0.3→3 with band cleared — read/write separation HOLDS); #4/#5 carry/rebase untouched; #6 pricing-read lens unchanged (the warp view reuses gLoc/markLensed); #7 ITM settle-at-lensed unchanged (open+close band raw_net=+2.66e-5 finite); #8 strike-reg unchanged; #9 funding unchanged; #11 dollar/settlement pipe unchanged; #12/#13/#14 unchanged; #15 file-safety GREEN (md5 `abd46149` unchanged post-run, blobs canonical, 3 scripts parse).
DESIRABLE (tester-confirmed live ×2 byte-stable, 0 console / 0 pageerrors):
  - [#2] GOAL-SEEK readout EXACT: G=3 ⇒ w′=0.7500, γ′=3.0000 ✓ ; G=2 ⇒ 0.6667/2.0000 ; G=10 ⇒ 0.9091/10.0000 ; G=0.5 (<1) ⇒ w′ cell shows **"G≥1 required"**, γ′ cell "—" (NaN-LOUD, no silent clamp-to-edge) ✓. Read-point γ = 1.0000 at the default w=0.5 pool; after a pool-moving trade (w→0.50112) the readout REFRESHES to γ 1.0045 ✓.
  - [#16] HELD-LENS WARP VISIBLE on the trade preview — zoom-confirmed (`ZOOM_pricing_step1.png`): the dashed preview curve has a SEPARATE, lower, LEFT-SHIFTED peak (the sold-CALL leg moved the mode), the two curves diverge across the elbow into an obvious ASYMMETRIC SKEW (put wing steeper, call wing flatter), and converge again only in the deep wings. Canvas changed by preview (nz 11357→11627). The EXPONENT warp `dG(u)=(γ′−γ)·Φ_τ(|u|)` GROWS monotonically with |u| out into the wings (|u|=0.05→0.0254 … |u|=1.40→0.1510, saturating to Δγ=0.1544) — the design "more in the wings, scaled by Φ_τ" is mathematically present and correct.
  - [#3] τ stepper still reshapes chart-2 live (canvas-pricing changes on τ 0.3→2 and on a real keyboard ArrowUp) — the lens-HEAD redraw regression holds on this build.
  - [#1] canvas-CURVE (plain-v24 pool curve) UNCHANGED on τ 0.3→3 with the band cleared — read/write separation intact.
  - Trades execute, arb + advance-time click without error, band direction swap long(0.4487%)→short(0.4786%) with no warn, open+close band settles finite — no regression in existing controls.
UNDESIRABLE:
  - **★ FINDING-WARP-DIR (OPEN, the gating nuance — surface to manager→operator): the DRAWN (visible-pixel) warp is LARGEST at the ATM elbow and SHRINKS going OTM — the OPPOSITE of the literal "visible separation grows OTM" the C16 spec asked me to confirm.** [#16] Measured drawn mark-value separation |Δψ| on the call wing: θ=1.05 |Δψ|=0.2742 → θ=1.5 0.0278 → θ=4.0 0.0063 (monotone DECREASE OTM); the zoom screenshot shows the two curves converging in the deep wings. The cause is structural and arguably correct: the mark ψ itself decays toward 0 in the wings, so both curves squeeze onto the x-axis and the VALUE gap closes even though the EXPONENT/slope warp dG(u) grows OTM. So "warp grows OTM" is TRUE in slope/exponent terms (what the lens does) but FALSE in drawn option-value separation (what the eye sees on this chart). This is NOT a rendering bug — it is the honest geometry of plotting a mark that vanishes OTM. **Whether this satisfies the operator's "the curve warps MORE at further OTM strikes for same premium" (entry, L239 [verbatim-transcript]: "the curve warps more at further otm strikes for same premium") is a PRODUCT/PERCEPTION judgement, operator-tier.** The operator's OWN dust-trade reasoning (entry, L320 [verbatim-transcript]: far-out trade "goal seeks another slope close to infinity so its not a huge warp … you're probably missing something obvious") actually PREDICTS a small far-OTM warp — consistent with what renders. Recorded OPEN; does not by itself fail the mechanics, but the manager must NOT relay "warp grows OTM, confirmed visually" — what renders is "warp visible, asymmetric, concentrated at the elbow, shrinking OTM."
  - **★ FINDING-TRADE-AT-STRIKE (OPEN, carried — the operator's most recent root-cause): entry 127 (L961 [verbatim-transcript]) "buy call is buy asset for dollars at strike on AMM, buy put is sell asset for dollars at strike on AMM" diagnoses the flat-warp as a WRONG AMM-tx model (premium-sized cash swap at spot, not asset-at-strike).** [#16, #10] This build adds a goal-seek READOUT and a held-lens warp VIEW but the underlying trade mechanic (previewBand→executeBand→tradeUpdate) still moves w from the band's net cash flow, NOT an asset-at-strike swap. The warp the preview DRAWS comes from the w-move the band already produces. Whether entry-127's engine change is in-scope for C16 or a follow-on is operator-tier — flag so it is not assumed delivered.
  - FINDING-RT [#10,#11] still OPEN/INHERITED-v24 (instant round-trip sign), carried from the lens HEAD, unaffected by this build.
NEUTRAL:
  - The step-2 (after-both-legs) preview moves w identically to step-1 here (0.50000→0.53583) because the second leg in this configuration adds same-sign drive; the warp is read off the step-selected preview pool either way. Goal-seek copy + the new G stat-lines are the only added DOM.
OPERATOR-VOICE (scan `history/operator/2026-06-10_kurtosis-curve-family-brief.md`, entries 127–134 = the directive for THIS build):
  - RULED / DIRECTIVE (entry 128, L971-974 [verbatim-transcript]): *"1. we change w to warp the curve 2. goal seeks that tell us how much to warp w are as seen through the lens 3. every interaction with the curve is read through the lens 4. w changes directly in the balancer formula to change the picture seen through the lens"* — the goal-seek (w′=G/(1+G)) + held-lens warp view implement pts 1/2/4. SATISFIED at the mechanics level (tester-confirmed live).
  - RULED (entry 131, L1000 [verbatim-transcript]): *"you change w to warp the curve without changing the lens, then the picture updates and your lens can update or whatever"* — the build draws the preview warp at the HELD lens/mode (does not re-register), exactly this. SATISFIED.
  - RULED (entry 132, L1008 [verbatim-transcript]): *"the lens … works WITH the skew not against — amplifying or flattening skew as per steepness / flatness / intensity setting"* — the rendered warp IS an asymmetric skew (zoom-confirmed). SATISFIED (skew visible).
  - RULED (entry 133, L1016 [verbatim-transcript]): *"get it done gang"* — the build-go.
  - OPEN (entry, L239 [verbatim-transcript]): *"the curve warps more at further otm strikes for same premium"* — the VISIBLE option-value warp here is concentrated at the elbow and shrinks OTM (FINDING-WARP-DIR). The slope/exponent warp DOES grow OTM. UNRESOLVED as a perception claim — manager to relay the precise rendered behavior, NOT "grows OTM confirmed."
  - OPEN (entry 127, L961 [verbatim-transcript]): asset-at-strike AMM-tx model — FINDING-TRADE-AT-STRIKE above; not delivered by this READOUT/VIEW build, scope unruled.
  - QUEUED (entry 134, L1024 [verbatim-transcript]): *"there's probably a set of closed form integrals … queue that derivation, for now the discrete step case is probably what you're doing"* — operator explicitly frames THIS as the DISCRETE per-step warp; the continuous-integral version is queued for research. So a per-step (not continuous) warp is the AUTHORIZED scope here.
EVIDENCE: `evidence/v28_lens_warp/INDEX.txt` + `RUN_LOG_runA.txt`==`RUN_LOG_runB.txt` (byte-stable; 0 console / 0 pageerrors both runs) + `{A,B}_10_goalseek_G3.png` / `_11_goalseek_Glo.png` / `_21_pricing_warp_step1.png` / `_23_goalseek_after_trade.png` / `_30_tau_live.png` / `_31_dir_swap.png` + `ZOOM_pricing_step1.png` (canvas-pricing clip — THE warp screenshot). Harnesses `engine/verify/pw_v28_lens_warp_smoke.mjs` (A+B) + `pw_v28_lens_warp_zoom.mjs`, live Playwright, READ-ONLY on engine source. File-safety: build md5 `abd46149961cab45f1992b7e21850d5f` UNCHANGED post-run; webp L74 `ab663f5c26f2a461c5b0ef1421d0ad74` (sed line-md5); svg L1060 `c505b08ad0e4c6b0fb9e64e9679fe291` (sed line-md5); 3 `<script>` parse (engine 35884 / state 23353 / ui 84399 chars).
**VERDICT: MECHANICS PASS ×2 byte-stable — goal-seek readout EXACT incl. NaN-loud G<1 + post-trade γ refresh; held-lens warp VISIBLE, asymmetric, NOT flat (zoom-confirmed); no regression in τ/trades/swap/settle; file-safety GREEN. ONE GATING NUANCE the manager must NOT paper over (FINDING-WARP-DIR): the DRAWN visible warp is largest at the elbow and SHRINKS OTM — the exponent warp grows OTM but the option-value separation does not, so the spec's literal "visible separation grows OTM" is NOT what renders. The slope-warp-vs-value-warp distinction + the entry-127 asset-at-strike question are OPERATOR-TIER — FLAG, do not auto-promote on "warp grows OTM."**

**Table rows updated:** #16 (warp VIEW now renders on the trade preview — visible/asymmetric/elbow-concentrated; the drawn-vs-exponent OTM distinction recorded), #2 (goal-seek w′=G/(1+G) readout added, advisory), #3 (Φ_τ scales the warp view). **Rolling list:** +OPEN FINDING-WARP-DIR (drawn warp shrinks OTM, exponent warp grows — operator perception question); +OPEN FINDING-TRADE-AT-STRIKE (entry-127 asset-at-strike not in this build); FINDING-RT carried. **Reconciliation list:** +2 OPEN rows below.

---


## v28-lens HEAD (`7e1ae39b`) → CONTWARP candidate `temporal_mvp_v28_lens_contwarp.html` (`4378bc1192878cfe437b8fa5551c5b88`)   [status: PROMOTION CANDIDATE — gates HEAD promotion on this STANDING UI SMOKE-PASS; tester live Playwright ×2 byte-stable; manager pre-verify 27/27 green, engine block byte-identical]
SCOPE: ONE renderer-layer delta vs HEAD (~50 diff lines, ui `<script>` only — engine + state `<script>` blocks BYTE-IDENTICAL, block md5 85ab5a6f/05b81eee both builds): `drawPricing` is now a requestAnimationFrame wrapper — when a NEW trade preview is staged, the dashed chart-2 (canvas-pricing) post-trade curve ANIMATES continuously (~0.8s, key-guarded) from the pre-trade curve to the post-trade curve; every frame is the EXISTING live lensed read (`renderPricingFrame` = the old drawPricing body, unmodified) of `Engine.tradeUpdate(prePool, dyFull·s)`, drawn at that frame's OWN 45°-tangent point (mode=(1−w)/w). Implements operator entry 158 (continuous skew) within the skeptic-ruled scope (`notes/skeptic/VERDICT_CONTINUOUS_SKEW_entry158_2026-06-12.md`: renderer-side sampling of live frames, live-centered after-trace, NO new engine math). The SCRAPPED C16 held-lens warp view (`abd46149`, never promoted) is replaced by this.
FEATURES (inventory #s touched):
  - **#16 (warp-with-trades) — the continuous trade→skew VISIBILITY.** The staged trade's curve-warp now plays as a continuous sweep on chart-2: 10 distinct rendered frames inside the 800ms window (lit 10591→11507 monotone), dotted preview coincident with the live curve at s≈0, separating with the peak shifting left through mid-sweep, landing on the full post-trade shape (canvas-only captures ZOOM_sweep_t0/t200/t450/landed). The preview's center marker (φ/m, dashed vertical) visibly slides left through the sweep; analytic probe (same Engine fns the renderer calls): mode 1.000000→0.972909 monotone, w 0.500000→0.506866 (one-sided step-1 sold-CALL leg, 0.5 BTC).
  - **#15 (file-safety) — GREEN:** build md5 `4378bc11…` UNCHANGED post-run; webp L74 `ab663f5c…`, svg L1060 `c505b08a…` (sed line-md5); 3 `<script>` parse; 0 console / 0 pageerrors both pages both runs.
  - Regression-checked UNCHANGED: **#3** τ stepper still redraws chart-2 (0.3→2.0 = 6,532px, band cleared); **#1** chart-1 (plain-v24 pool curve, canvas-curve) 1 distinct hash THROUGHOUT the live sweep (inert during animation).
  **NONE BEYOND** — #2/#4/#5/#6/#7/#8/#9/#10/#11/#12/#13/#14 untouched: engine+state scripts byte-identical to HEAD; the landed frame is PIXEL-IDENTICAL (px-diff 0) to clean-HEAD's static preview with identical previewPool (x/y exact to 1e-9), so every read/settle/funding/slippage path downstream of the draw is provably the same picture.
DESIRABLE (tester-confirmed live ×2 byte-stable — RUN_LOG_runA == runB modulo header/timing lines):
  - [#16] **The animation actually renders:** 10 distinct chart-2 frames in the 800ms sweep window; landed frames byte-stable (t>1000ms all identical); retriggered sweep lands px-diff 0 vs the first landing (deterministic); mid-frame canvas captures show the dotted curve separating and the peak walking left.
  - [#16] **Final frame == the old static preview, byte-level:** px-diff 0 vs clean HEAD `7e1ae39b` staged identically (same τ 0.3, dir long, sold 100000 / bought 60000 / 0.5 BTC, step-1); previewPool x=9.864547/y=811137.99 exact match both builds. The sweep is pure presentation — it lands exactly where HEAD already stood.
  - [#16] **Expected geometry (skeptic's standing caution CONFIRMED, not "fixed"):** wings steepen through the sweep (θ=4: g_loc 0.9774→1.0055 monotone; γ 1.0000→1.0278); a strike crossed by the sliding tangent point DIPS — θ=0.985: g_loc 0.0503→0.0044→0.0423 (interior minimum ≈0 exactly as the point passes, then re-steepens). That dip IS the entry-158 mechanic working (strike momentarily the new at-the-money; zero lens amplification at the center by definition).
  - [#16] **No animation when it shouldn't:** unchanged preview re-dispatch = 1 distinct frame over 1.1s (key-guard works); cleared preview = `__previewPool` null, canvas stable, NO dotted curve (ZOOM_cleared_nopreview.png); chart-1 inert during the sweep.
  - [#3/#1] Spot-regression: τ redraw lives; trade executes (band 0→1, no dialogs); 0 console / 0 pageerrors.
UNDESIRABLE: **none NEW introduced by the animation.** (FINDING-RT [#10/#11] carried OPEN/INHERITED-v24, untouched.)
NEUTRAL (recorded so the operator is not surprised):
  - **POST-EXECUTE RE-PREVIEW SWEEP:** clicking Transact commits the band, then `render()` re-runs `previewBand()` with the inputs still filled — a preview is legitimately re-staged against the NEW pool (HEAD-inherited re-preview semantics), and since its key differs, ONE more ~0.84s sweep plays, then byte-stable for >1.6s (lit 10346→10628 monotone, terminates, NOT a loop; measured per-sample in RUN_LOG). If a second animation right after Transact is unwanted, the fix is clearing the form on execute (UX call, not an animation defect).
  - During an active sweep, a same-key drawAll (e.g. unrelated render) leaves the animation undisturbed (key-guard early-return) — by design.
OPERATOR-VOICE (scan `history/operator/2026-06-10_kurtosis-curve-family-brief.md` entries 150–175 [verbatim-transcript]):
  - **RULED — THE MECHANIC (entry 158, L1216):** *"chwanging w skews the curve, which changes the 45 degree tangent slope point .... we dont need to hold it constant but rather change skew as the trade happens continuously"* — IMPLEMENTED and tester-confirmed live: each frame draws at its own sliding tangent point (mode probe monotone), skew changes continuously through the sweep.
  - **RULED (entry 153 #1/#2/#3, L1176):** warp center = the 45°-tangent point (frames centered there — confirmed); warp amplifies by deviation from it, zero at the center (g_loc→0 dip at the crossed strike — confirmed); *"the first chart is unaffected, the second is affected"* — chart-1 had 1 distinct hash throughout the sweep (confirmed).
  - **entry 153 #8 (the SEVERE version-conflation warning, L1176):** *"theres just the balancer formula with x y and w, and then there's the lens intensity, nothing else"* — this build adds NO new geometric object: every frame is a plain {x,y,w} pool state read through the SAME τ lens. No new knob, no new curve family. CONFIRMED.
  - **RESOLVED(evidence) — entries 170/171 (L1312/L1320):** *"ultimately isnt whatevrr happens via the continuous / integral thing going to give us a post trade graph 2?"* / *"i'd expect to see the post trade proforma resulting from this one (continous trade-warp-updatelens)"* — YES, byte-provably: the sweep lands px-identical (diff 0) to the static post-trade chart-2, and the skeptic's telescoping identity (entry-158 verdict, exact <1e-12) shows the live end state IS the continuous result (state function, step-count independent). Entry 173 (L1336) RULED: *"it suffices to show proforma on chart 2"* — satisfied by the landing.
  - **RULED — deadline (entry 163, L1256):** *"i want my correct version as head before i log out wthin the next hour"* — this entry is the promotion gate; tester verdict below.
  - Context (entry 164, L1264): *"the second graph in the current head thing gives me some comfort that we're moving in the right direction"*; intent (entries 165–167): the continuous limit *"couple[s] things tighter so the room for error is actively reduced"*, *"along the lines of the monolith"*, *"even it it frontloads the math"*.
  - **STANDING CAUTION to relay UNDRESSED (skeptic, entry-158 verdict):** during a trade, strikes near the path of the 45°-point get FLATTER (dip toward zero as the point passes) while the wings steepen — that is the mechanic working, not a bug; nobody may "fix" it later. Tester saw exactly this (θ=0.985 dip table above).
EVIDENCE: `evidence/v28_contwarp/INDEX.txt` + `RUN_LOG_runA.txt`/`RUN_LOG_runB.txt` (×2 byte-stable) + `R_{A,B}_I1_final_landed/HEAD_static/mid1-3/landed2.png` + `R_{A,B}_I3_after_execute.png` + `ZOOM_sweep_{t0,t200,t450,landed}.png` + `ZOOM_cleared_nopreview.png` + `ZOOM_pre_landed.png`. Harnesses `engine/verify/pw_v28_contwarp_smoke.mjs` (A+B) + `pw_v28_contwarp_zoom.mjs`, live Playwright, READ-ONLY on source.
**VERDICT: 4/4 items PASS ×2 byte-stable ⇒ STANDING UI SMOKE-PASS = PASS; no new undesirables; file-safety GREEN. From the tester side the promotion gate is CLEAR. Hand-back condition: the skeptic's dip caution goes to the operator in plain English with the relay.**

**Table rows updated:** #16 (continuous sweep now renders the trade's skew live; landed frame byte-equal to static). **Rolling list:** -6 FINDING-WARP-DIR marked RESOLVED(superseded — held-center frame scrapped by operator entry 158 + skeptic verdict; the live-read dip/flatten is RULED the true mechanic); -5 FINDING-TRADE-AT-STRIKE carried OPEN (trade mechanic untouched here). **Reconciliation list:** FINDING-WARP-DIR row updated to SUPERSEDED; no new OPEN rows.

---


## CONTWARP HEAD (`4378bc11`) → A14 AT-STRIKE HEAD `HEAD_temporal_mvp_v28_lens.html` (`de28c93712ffb1a7fcafc66b36a0ea83`)   [status: HEAD-PROMOTED 2026-06-12, post-skeptic-clear; this is the §8 live confirmation owed]
SCOPE: the AMM SWAP is now AT-STRIKE (entries 184–187/197/199 — the operator's asset-at-strike rule, FINDING-TRADE-AT-STRIKE DELIVERED). `executeLeg` (engine L1773-1797): pool cash per leg `dy = (wingSign·legSign)·N·K_usd`, `K_usd = θ_inner·oracle` (the leg's dollar strike) — NOT the old premium-fraction `N·V`. Open + OTM-close swap at-strike; ITM close pays out by direct intrinsic+extrinsic formula (`legValueUnified` settled-to-cash, NO AMM reversal). Reserve guard (L1786-1791): a cash-OUT leg (dy<0) whose `N·K_usd ≥ 90%` (DEPTH_FRAC, L1740) of pool cash depth `y−β` is REJECTED with both dollar figures in the reason; cash-IN always representable; N never mutated; wired through executeBand (both legs). The buy-leg notional `N_buy = V_sell/denom` (option-pricing) is UNCHANGED — it sizes the bought leg but no longer sizes the pool swap (entries 186/187: "the only place option pricing factors in [is] the buy leg"). Manager pre-verify: 34/34 gates, pool fns byte-identical to v24, economics skeptic-cleared (no single-option free money).
FEATURES (inventory #s touched):
  - **#16 (warp-with-trades / strong-form) — DELIVERED the operator's asset-at-strike trade mechanic.** The single sold-call warp now RISES with strike (the operator's central claim, entry 203). Engine, single sold call N=0.1 @ oracle 80000 τ0.3: dy = N·K_usd grows 1.1×→4× = $8,800 / $12,000 / $16,000 / $32,000 (= N·θ·oracle exactly); the w-shift grows with it Δw = 0.00544 / 0.00739 / 0.00980 / 0.01923 (monotone). Gate AS5 byte-corroborates: Δsteepness == dy/β, θ=1.1/1.5/2/4 = 0.22/0.30/0.40/0.80✓. Rendered: the dashed post-trade chart-2 curve at 4× (`A_item1_warp4x.png`) visibly diverges from the live curve, peak offset + wings shifted — warp legible and growing.
  - **#7 (ITM American smooth-pasting) — ITM close now pays out directly, no AMM reversal.** Live full-Store path (open via Store.openBand, drive oracle 80000→300000 + arbitrage so the sold-call crosses its strike, set perpMark 300000, Store.closeBand): close OK, `settled_cash_leg='sold'` / `live_leg='bought'` (sold leg settled-to-cash by the unified formula, bought leg reversed on the AMM), raw_net=−4.506e-3 FINITE, trader_payout=−$205.49 FINITE, L0=10.0, no throw, close logged. Gate AS6: reserves restore + close pays at LENSED mark; AS2: open→close pool reserves restore EXACT (x/y err ≤1.78e-15).
  - **#15 (file-safety) — GREEN:** build md5 `de28c937…` UNCHANGED post-run (both runs); webp L74 `ab663f5c…`, svg L1060 `c505b08a…` (sed line-md5); 3 `<script>` parse; 0 console / 0 pageerrors both runs.
  - Regression-checked UNCHANGED: **#3** τ stepper still reshapes chart-2 (0.3→2.0 = 6,545px; single 0.3→0.35 step = 3,893px) and chart-1 (plain-v24 pool curve) INERT to τ (0px); the continuous warp sweep still animates (46–47 distinct chart-2 frames in 1.3s, rAF-sampled); **#1** Balancer base / pool fns byte-identical to v24 (AS4: tradeUpdate/arbitrageToOracle/rebase identical).
  **NONE BEYOND** — #2/#4/#5/#6/#8/#9/#10/#11/#12/#13/#14 untouched by the at-strike swap: the change is in the pool-cash sizing of `executeLeg` + the close path + the reserve guard; the lens read/settle math (markLensed/legValueUnified), carry/rebase/funding, dollar pipe, registration are unchanged. (Slippage #10's PREVIEW basis still computes the w-ratio per leg; the at-strike sizing changes the magnitude of the move, not the formula — see NEUTRAL.)
DESIRABLE (tester-confirmed live ×2 byte-stable — RUN_LOG_runA == runB modulo header):
  - [#16] **At-strike warp rises OTM — single sold call (the operator's entry-203 ask, ANSWERED):** dy and Δw both monotone-increasing 1.1×→4× (figures above); the at-strike dollar swap scales linearly with the dollar strike, so a further-OTM strike moves the pool more ⇒ more warp. Gate AS5 confirms Δsteepness strictly ↑ and == dy/β.
  - [#7] **Trade executes; ITM settles by direct payout, no error:** full Store open→ITM→close path returns finite X/Y/raw_net/trader_payout, sold-leg settled-to-cash + bought-leg AMM-reversed, close logged, 0 errors.
  - [#15/reserve-guard] **Reserve guard REJECTS a too-large cash-out WITH the dollars:** far-OTM sold-PUT cash-out N·K=$380,000 vs depth $400,000 (95%) ⇒ reject, verbatim `"At-strike cash $380000.00 exceeds 90% of pool cash depth $400000.00 — trade rejected."` (both $ figures present, no silent cap, not executed); a representable leg at 80%·depth (N·K=$320,000) EXECUTES with dy=−320000, N un-mutated. Gate AS-guard byte-corroborates.
  - [#3/#1] **No regression:** continuous sweep animates (46–47 frames/1.3s); τ reshapes chart-2 (6,545 / 3,893px) and chart-1 inert (0px); settlement/funding paths intact (close settles finite); 0 console / 0 pageerrors both runs.
UNDESIRABLE: **none NEW introduced by the at-strike swap.** (FINDING-RT [#10/#11] — the v24-base instant round-trip sign — is rendered MOOT for the round-trip class by entry 197 "transact at whatever the curve is; forget arb" + AS2 reserves-restore-exact; the A15 lensed-mark trader-valuation netting is operator-DEFERRED, AS6 residual raw_net=1.4965 on a one-ITM steep case, NOT a leak — close pays at the lensed mark, reserves restore. Recorded carried-but-superseded-in-scope, not a blocker.)
NEUTRAL (recorded so the operator is not surprised):
  - **★ FLAGGED-LABEL (the skeptic's flag — observed + quoted, NOT fixed; tester read what RENDERS):** the band-preview Audit strip header literally reads **"Pool Δ (cash-conserving ⇒ Δy_net ≈ 0)"** and the field below it **"net trader cash @ open"**. With the at-strike swap these are now MISLABELS: for a valid long band (sold-call 120000 / bought-put 60000 / N=0.1, τ0.3) the field shows **"$16,623.290372"** — NOT ≈0 and NOT trader cash; it is `sim.netPoolY = leg1.dy + leg2.dy` (the NET pool cash move, `Δy(sold)="12000.0000 $"` + `Δy(bought)="4623.2904 $"`). The at-strike swap is no longer cash-conserving (that header text is a pre-A14 premium-fraction-era assumption) and the figure is a pool Δ, not trader cash. The slippage readout beside it reads "4.1558 % · ≈ $400.82" (sane). **Reported as flagged; NOT patched (read-only on source; the relabel is a UX-clarity fix for the intern, not an engine change).** Recorded OPEN below (rolling list).
  - **Store.reset() does NOT re-seed the boot demo perps** — after a reset (or after a band carve drains the long club) the band PREVIEW rejects with "Club has no perp notional. Add a perp." and stages no previewPool until a perp is added. INHERITED-v24/lens-line UX (not an A14 regression); surfaced because the harness reset between scenarios. Note for the intern (boot seeds clubs; reset wipes them).
OPERATOR-VOICE (scan `history/operator/2026-06-10_kurtosis-curve-family-brief.md` entries 184–205 [verbatim-transcript] — the directive + acceptance criteria for THIS build):
  - **RULED — THE AT-STRIKE RULE (entry 127, L961 [verbatim-transcript]):** *"that's probably because you're not doing the AMM tx right. buy call is buy asset for dollars at strike on AMM, buy put is sell asset for dollars at strike on AMM"* — DELIVERED. The pool swap is now `N·K_usd` (asset-for-dollars at the dollar strike), per-leg signed by wing+side. FINDING-TRADE-AT-STRIKE (rolling -5) → RESOLVED(evidence): tester live + gates AS1/AS5.
  - **RULED — buy-leg-only option pricing (entries 186/187, L1442/L1450 [verbatim-transcript]):** *"the only place the option pricing thing factors in would be in the buy leg where the avtual proceeds determine how much you can buy"* / *"the relative option pricing squarely determines the buy notional; but in sell; this doesnt factor into notionsl rigjht"* — IMPLEMENTED: sell-leg pool swap is pure AMM at-strike (N·K); the bought-leg NOTIONAL is still `N_buy=V_sell/denom` (option pricing). Gate AS3 confirms N_buy formula unchanged.
  - **RULED — transact at the curve, forget arb/round-trip (entry 197, L1534 [verbatim-transcript]):** *"no dont think round trip for now, transact at whatever the curve is; forget arb forntime being; short answer slippage is being paid continuously … option pricing is a separate layer from AMM pricing"* — the open/close both transact at-strike on the live curve; no un-bend/arb engineered. Supersedes the FINDING-RT round-trip concern for now.
  - **RULED — ITM close semantics (entry 198, L1542 [verbatim-transcript]):** *"ok when ITM, there's no AMM tx to the extent I know, just the intrinsic + extrinsic value is paid out directly as per formula?"* — IMPLEMENTED: ITM leg settles-to-cash via `legValueUnified`, no AMM reversal; tester live close confirms settled_cash_leg/live_leg split.
  - **RULED — individual options, not spreads (entry 199, L1550 [verbatim-transcript]):** *"and we think of individual options in this contexy not spreads"* — this smoke is single-option-focused (Item 1 stages a single sold call; the band is the two-leg container but the warp/payout claims are read per leg).
  - **★ OPEN — the operator's outstanding TEST question (entry 203, L1582 [verbatim-transcript]):** *"im not infront of laptop, so did u test thr tiings is mentioned about curve warp magbitude otm kurtosis etc..?"* — **THE warp-magnitude-vs-OTM half is ANSWERED by this smoke (Item 1: warp rises with strike, tester live + AS5).** The **vs-KURTOSIS half is NOT in this run** — entries 184/185 (L1434 [verbatim-transcript]: *"if i make kurtosis steeper (less value in the html), that would imply … even more warp not less right"*) ask whether STEEPER τ ⇒ a given strike reads further-OTM ⇒ MORE warp. This smoke confirmed τ reshapes chart-2 (read-side) but did NOT test the warp-MAGNITUDE-vs-τ coupling the operator describes. **OPEN — flag to manager: the kurtosis half of entry-203/184/185 still owes a targeted test.**
  - **OPEN — A15 slippage-on-options + no-jump ATM (entries 204/205, L1592/L1600 [verbatim-transcript]):** *"we have to close the actual slippage on options and the no jump atm position value thing too full loop closed"* / *"slippage … applying the slippage as calcukated in the AMM trade layer to reduce the bought option output as it woukd have been based on pre trade option prices"* — the A15 deferred item (AS6 residual). NOT in this build by design; carried OPEN.
EVIDENCE: `evidence/v28_a14/RUN_LOG_runA.txt` == `RUN_LOG_runB.txt` (byte-stable modulo header; 0 console / 0 pageerrors both runs) + `{A,B}_item1_warp4x.png` (4× post-trade dashed warp on chart-2) + `{A,B}_item5_label.png`. Harness `engine/verify/pw_v28_a14_smoke.mjs`, live Playwright ×2, READ-ONLY on engine source. Regression oracle `engine/verify/run_all.sh` = **34 PASS / 0 FAIL** (incl. A14 gates AS1 at-strike dy, AS2 reserves-restore-exact, AS3 N_buy unchanged, AS4 pool-fns byte-identical-v24, AS5 warp-rises-OTM, AS6 honesty, AS-guard reserve guard). File-safety GREEN (md5 `de28c937…` unchanged; blobs L74 `ab663f5c…` / L1060 `c505b08a…`; 3 scripts parse).
**VERDICT: 5/5 items PASS ×2 byte-stable ⇒ §8 LIVE CONFIRMATION = PASS. At-strike warp rises with strike (Item 1, AS5); ITM settles by direct payout, no error (Item 2, AS6); reserve guard rejects with the dollars (Item 3, AS-guard); no regression in sweep/τ/charts/settle (Item 4); flagged UI label observed + quoted verbatim (Item 5 — header "cash-conserving ⇒ Δy_net ≈ 0" now MISLABELS the $16,623.29 net pool Δ as ≈0/trader-cash; relay to intern, not an engine bug). 34/34 oracle. File-safety GREEN. HAND-BACK: two operator-tier OPENs to the manager — (1) entry-203/184/185 KURTOSIS-half warp-magnitude-vs-τ test still owed; (2) the flagged "Pool Δ / net trader cash" relabel.**

**Table rows updated:** #16 (at-strike swap DELIVERS the entry-127 asset-at-strike mechanic; single-sold-call warp rises with strike, dy=N·K_usd, AS5); #7 (ITM close = direct payout, no AMM reversal; reserves restore exact); #3 (regression-confirmed τ-reshape + sweep intact); #1 (pool fns byte-identical v24, AS4). **Rolling list:** -5 FINDING-TRADE-AT-STRIKE → RESOLVED(evidence — at-strike swap shipped, tester live + AS1/AS5); +OPEN FLAGGED-LABEL (Pool Δ / net-trader-cash mislabel); +OPEN KURTOSIS-WARP-TEST (entry-203/184/185 vs-τ half untested); FINDING-RT superseded-in-scope by entry 197+AS2. **Reconciliation list:** FINDING-TRADE-AT-STRIKE row → RESOLVED-in-`de28c937`; +2 OPEN rows (FLAGGED-LABEL, KURTOSIS-WARP-TEST).

---


## Standing reconciliation list (all OPEN undesirables, one place)
| Item | Introduced | Status |
|---|---|---|
| v28-S1 FLAG-1: KURTOSIS tau stepper did NOT auto-redraw chart 2 | v28-S1 (`5e1ff278`) | **RECONCILED-in-`b53ace99` (v28 Stage 2)** — tester live ×2: stepper EVENT now reshapes chart 2 (0.3->0.05=5,199px, 0.3->2=6,545px, ArrowUp=3,894px); L2724 calls `if (Viz) Viz.drawAll(...)` via closure |
| **v28-S2 FINDING-RT: instant open->close round-trip is TRADER-favourable (raw_net>0, scales with slippage) — brief expected pool-favourable** | v24 base, present in v28-S2 | OPEN — INHERITED-v24 (byte-identical raw_net in S1+v24); sign-convention question, escalate to operator; does NOT block the Stage-2 hand-back |
| **v28-FINAL xoracle band-audit inflation (pv-net-cash/pv-dy-* double-×oracle)** | v24 base, present in S1/S2 | **RECONCILED-on-the-lens-line-in-`989752294`** — C1 fix (L3082 drops ×oracle): pv-net-cash reads $2,928.84 (order-$10k), tester live ×2 |
| **v28-FINAL anchor (w=½) overlay off-scale** | v24/lens line | **RECONCILED-in-`989752294`** — C2: k=√(x·y) (L3285), anchor passes through the live reserves dot, pixel-confirmed |
| **v28-FINAL payoff ±50% x-range + naked-leg cap** (v27 NOTES D9/D10 unported) | v24 base on lens line | **RECONCILED-in-`989752294`** — C8 frame −90%…+200% with ticks; C9 naked(0.8031)>capped-spread(0.1871) deep-ITM, tester live ×2 |
| **v28-FINAL FINDING-RT carried to the promotion build** | v24 base | OPEN — INHERITED-v24; round-trip SIGN unresolved (entry 96 didn't rule direction); does NOT block the promotion gate; escalate to operator |
| v28-S1 band audit xoracle inflation (pv-net-cash/pv-dy-* multiply already-USD dy by oracle again; $618M on $800k pool) - INHERITED byte-identical from v24 base (L1755 V_usd already xoracle, L3050-52 xoracle again) | v24 base, present in v28-S1 | OPEN - inherited-v24; candidate "known-gap" correction per operator entry-93 |
| Payoff ray-legend overprint (cosmetic) | v26c | OPEN — intern polish, non-blocking |
| Collar-aggressiveness slippage magnitude | v26a (exposed) | ACCEPTED — operator parked |
| (W) curve/knob not visually legible (sliver curve; τ invisible) | v27 (`3914c7f4`) | **RECONCILED in v27 render-fix (`b245bfda`)** — curve renders across frame (item 1 PASS) + τ visibly rounds elbow with frozen wings (item 2 PASS), tester-confirmed |
| **(W) trades-WARP not visually legible — a trade is a "dot sliding," not a curve warp (φ sub-pixel on default pool: ≈0.5px/band, ≈1px after 6 max trades)** | v27 (`3914c7f4`); persists in `b245bfda` | **OVERRIDDEN — operator ruling entry 28 (HEAD-promoted): warp verified elbow-local/subtle BY DESIGN (no τ matches v24's global warp with frozen wings); ACCEPTED(operator). Residual polish OPEN: anchor-overlay / amplified-warp viz (not added)** |
| drawPayoff N_buy `state`→`state.pool` NaN-fallback (display-only; N_buy silently = N_sell) — fixed on GH line in v26c, bug present in HEAD | v24 base, carried into v27 HEAD | OPEN — one-line port; NOTES D14 |
| Slippage $-tooltip honesty ("Layer-1 reserve-USD, not trader honest-dollar") not carried — HEAD ships v24 wording | v27 HEAD (unported v26a label) | OPEN (minor) — NOTES D2 |
| Payoff chart coverage: x-range ±50% (v26c had −90..+200) + naked leg capped at 1 (v26b/c uncapped intrinsic) | v27 HEAD (unported v26b/c upgrades) | OPEN (minor) — NOTES D9/D10 |
| Strike registration export-only: no regLeg wiring; one-mark uniformity + all-γ crossover@K unverified on (W) | v27 HEAD | OPEN — NOTES D11/D13/D16 |
| Degenerate default pool (symmetric wings w₋=w₊=0.70 ⇒ Δw=0 ⇒ τ inert, all trades rejected) | v27 (`3914c7f4`) | **RECONCILED in `b245bfda`** — default now asymmetric x10/y12 w₋0.60/w₊0.85 Δw0.25; τ + trades live on load |
| Stale "Trade mechanic (#16)" UI label says strong-form OPEN while engine ships it | v27 (`3914c7f4`) | **RECONCILED in `b245bfda`** — label now states the strong-form φ warp ships (tester-confirmed verbatim) |
| Oracle/pool-default blast radius: lp-y-delta shows −$799,988 (hardcoded y−800000 baseline, L4295) + Create-Perp LIQ price −9995.56 (degenerate at oracle 4.44 / $1000 margin) | v27 render-fix (`b245bfda`, oracle→4.44 un-gated default) | **RECONCILED in UX-restore `9d22cffd`** — lp-y-delta = dynamic `_initial_y` baseline (L4311), reads $0.00 at load / $156.20 after the test trade; Create-Perp LIQ sane at $80k defaults: 8.0×, long $70,000.00 / short $90,000.00 (tester-confirmed live ×2) |
| Spot KPI basis: “Spot ($)” shows $30,344.83 = raw reserve ratio y/x, NOT the pool marginal ($80,000) — v24 showed $80,000 at load; first dollar number the operator sees contradicts the $80k world (kpi-spot 0.3793 / kpi-w 0.7250 same basis) | UX-restore `9d22cffd` (exposed by equilibrium-at-load y0) | **RECONCILED in display-fix `1eebfcd6`** — kpi-spot/kpi-spot-usd re-pointed to the marginal getMP_raw (display wiring only, L4304-4306): reads **$80,000.00 / 1.0000** at load, tester pixel+DOM ×2 (`D_02_kpi_spot_crop.png`); hdr-pool-spot fixed to the same basis (L4256, `D_03_hdr_pool_spot_crop.png` — the header line I had not flagged, manager caught it same pass) |
| τ (and all settings-panel/perp-form) number inputs: up/down spinner ARROWS hidden by CSS (`.field-input-wrap … ::-webkit-inner-spin-button { -webkit-appearance:none }` L326-328) — mouse-click stepping dead on τ (verified: click ×2 no-ops; band-price inputs with the L938-950 visible-spinner CSS DO step 120000→120500 on click); keyboard arrows work | v24 base CSS, carried into v27; bites NOW because the operator's no-sliders ruling makes arrows the only knob affordance | **RECONCILED in display-fix `1eebfcd6`** — `.field-input-wrap` spinner CSS un-hidden (L331-337, inner-spin-button + opacity 1): τ up-arrow MOUSE-CLICK steps 0.30→0.35 and the curve redraws (canvas diff), down-click returns 0.30; ALL settings/perp number inputs show spinners (computed-style probe + pixel `D_04`/`D_06`/`D_08`; tester ×2) |
| Funding re-pointed to price-anchor p=P, γ→±γ_loc — diverges from HEAD's locked w=½ funding | v27 (candidate) | OPEN — theory-risk-accepted; operator/skeptic-tier |
| **Band panel STALE-ON-REJECT: previewBand reject paths (!sim.ok / club guards) set warn + disable Transact but DON'T clear summary/audit/N_buy ⇒ previous direction's numbers shown live next to the rejection banner — the operator's entry-45 "breaks when you switch long to short" screenshot state** | v24-pattern UI, bites in v27 (swap/pill + direction-asymmetric validity) | **RECONCILED in entry-46 build `928cde1c`** — `clearBandPreviewOut()` (L3136) on every reject path; STALE-CHECK FALSE on swap/pill/oversize ×2 runs (entry-46 smoke, `A1_path1..3*.png`) |
| **Band audit strip ×oracle unit inflation: pv-net-cash / pv-dy-sold / pv-dy-bought multiply raw-USD engine dy by oracle again ⇒ "$3,193,860,736" net cash on a $303k pool** (engine correct: netPoolY=39,923.26 raw USD = exact Δy; V_* rows display correctly) | v27 HEAD (mixed units in executeBand return vs previewBand's uniform ×oracle) | **RECONCILED in entry-46 build `928cde1c`** — ×oracle dropped (L3242-47); displays the exact raw engine dollars (28,453.17/11,470.09/$39,923.26 on the reference band) (entry-46 smoke, `A2_*.png`) |
| **Anchor (w=½) overlay 104× below the live curve — gray L hugging the origin corner** (curveTraceExplicit(0.5, snap.depth, modeSlope) L3473 feeds (W)-units depth k=170.83 into a w=½ trace ⇒ xy=29,186 vs live xy≈3.03e6; correct anchor-through-live-point k=√(x·y)=1,742) | v27 (known-OPEN "anchor-overlay viz" at promotion; root cause exact as of entry-45 run) | **RECONCILED in entry-46 build `928cde1c`** — k=√(x·y) (L3494); anchor passes 1.15px from the live dot, pixel-confirmed (entry-46 smoke, `I3_anchor_curve_default.png`) |
| Boot event-log line "Initialised. Pool: x=10 BTC, y=$800k, w=0.5. Oracle=$80k." stale vs actual y₀=$303,448.28 / w-field 0.60/0.85 (L4586 in `928cde1c`) | v27 UX-restore (y0 changed, message not) | OPEN (minor) — intern text fix; confirmed still present in `928cde1c` (entry-46 smoke) |
| **FINDING-R: post-rebase Spot($) + header show POOL-FRAME dollars (`getMP_raw`, L4325-27/L4277) instead of the engine's honest current-$ `poolMark = getMP_raw×(oracle/oracle_initial)` (L1660) — oracle→$90,000 makes Spot($) read $71,232.34, then post-arb $80,000.00 beside an Oracle box reading 90000 (engine self-consistent; honest at r=1 only)** | v27 display wiring `1eebfcd6` (exposed by entry-46 smoke — first UI exercise of the rebase path) | OPEN — intern display fix (point $ KPIs at poolMark, or label the frame); operator-visible confusion |

| **FINDING-WARP-DIR (C16 `abd46149`): the DRAWN visible warp on the trade-preview option/value curve is LARGEST at the ATM elbow and SHRINKS going OTM — the literal "visible separation grows OTM" the spec asked to confirm is NOT what renders** (drawn |Δψ| call θ=1.05→0.2742, θ=4.0→0.0063; curves converge in the deep wings, zoom-confirmed). The EXPONENT/slope warp dG(u)=(γ′−γ)·Φ_τ(|u|) DOES grow OTM (0.0254→0.1510); the value warp does not, because the mark ψ vanishes OTM. NOT a render bug — honest geometry. | C16 goal-seek-warp `abd46149` (warp VIEW added) | **SUPERSEDED 2026-06-12** — operator entry 158 re-ruled the mechanic continuous/live-centered; skeptic VERDICT_CONTINUOUS_SKEW scrapped the held-center frame (FLAG-WRONG on the held premise, telescoping identity). C16 never promoted; CONTWARP `4378bc11` implements the ruled mechanic, tester-confirmed. |
| **FINDING-TRADE-AT-STRIKE (C16 `abd46149`): entry-127 "buy call is buy asset for dollars AT STRIKE on AMM" — the operator's root-cause diagnosis of flat-warp — is NOT delivered by this READOUT/VIEW build; the trade mechanic still moves w from band net-cash, not an asset-at-strike swap** | C16 `abd46149` (scope boundary) | OPEN — operator-tier scope question: is the entry-127 engine change part of C16 or a follow-on? Flag so it is not assumed shipped |
_Tester: append new entries above the reconciliation list; update the list every entry._

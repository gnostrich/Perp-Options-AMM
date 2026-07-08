# Engine behavioral DIFF LEDGER — desirable / undesirable deltas per version, FEATURE-KEYED

_Created 2026-06-10 (operator-directed); hardened same day per operator: **this ledger is the
operator's inventory of record — the operator never keeps feature inventory themselves.**
`BUILD_LINEAGE.md` records WHAT each build is (md5 + one-liner); THIS file records how each
version transition BEHAVES — what we like, what we don't, whether undesirables got reconciled —
and every delta is keyed to the named feature it touches (`docs/feature_inventory.md` #1–#16).
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

| # | Feature (inventory) | Current state (HEAD = **`5ce1a76c`** VOCAB SCRUB (2026-07-08; TEXT-ONLY relabel of `abd35f4b` — term "lean"→"skew / ray deviation" in the Funding column header/tooltip/units-note + 7 engine comments; NO logic/numeric/signature change; vocab_gate wired HARD) ← **`abd35f4b`** funding SAME-SLOPE pool-vs-anchor DEVIATION placeholder (2026-07-08; deviation-only, formula TBD update-2; OTM lobe, 0 ATM/ITM, 0 on w=½ pool = anti-regression signature) ← **`bb2f8230`** UPDATE-1 unified sell-back close + funding-on-extrinsic (2026-07-07; BOTH legs reverse on the AMM — two-case ITM-to-cash branch RETIRED; funding weight = option-part/extrinsic ⇒ ZERO ITM, single ATM hump; bounded ~$29–200 non-extractable x-drain BY DESIGN) ← prior **`51342574`** -FPNL-NEGZERO display fix (2026-07-07; −0 guard on the 3 funding display cells, 2 expressions; engine+state byte-identical) ← **`4bc939ec`** FUNDING-P/L column slice (2026-07-03, operator entry 425, display/read layer on ratified `0e0a0062`; engine+state byte-identical) ← **`0e0a0062`** trade-point conservation + caption slice (2026-07-02, entries 339/377, #16 PROVISIONAL; chain e148c9b7 ← 7015c22c ← 9fdde1de ← dd6fb955 ← 8f897edc). Prior header kept: latest CANDIDATE = **CONSTMULT `8f897edc`** (constant slope-multiplier lens, operator entries 229/231, gates HEAD on this smoke + skeptic; supersedes invtx `5fea0e8d` tx-strike map); prior promoted HEAD line v28 A14 at-strike `de28c937` / polar-lens `7e1ae39b`), 2026-06-12 — v24 base + polar lens read/write/settle + cleanup C1–C9 + one-line slippage-refresh wire; promoted from FINAL `989752294` per entries 84/94/96/106; v27 `928cde1c` + GH v26c `6cc73563` demoted/retained) | Last changed | Verdict |
|---|---|---|---|---|
| 1 | Balancer base | **HEAD (v27) IS the (W) family on the literal Balancer base** F=x^w·y^(1−w) with position-dependent w(u;φ); τ→∞ recovers plain Balancer. **UX-restore `9d22cffd`: v24 dollar defaults BACK** — oracle 80000, x=10 BTC, marginal=$80,000.000 at load (y0=303,448.28 chosen so load is equilibrium — differs from v24's 800,000; flagged below). Same tabs/KPI labels/chart views/perp+band defaults as v24 (tester side-by-side). **Display-fix `1eebfcd6`: Spot($)/Spot KPI + hdr-pool-spot re-pointed to the marginal getMP_raw — $80,000.00 / 1.0000 / "spot $80,000.00" at load (v24 values)** | entry-46 smoke (`928cde1c`, FINDING-R) | DESIRABLE — v24 feel restored; Spot-KPI basis RECONCILED-in-`1eebfcd6` (y0 delta OPEN-for-ruling). **NEW OPEN (entry-46 smoke, FINDING-R): post-rebase Spot($)/hdr-pool-spot show POOL-FRAME getMP_raw, not current-$ poolMark — oracle→90000 makes Spot($) read $71,232 then post-arb $80,000 beside an Oracle box reading 90000; honest at r=1 only. Display-only; engine self-consistent** |
| 2 | Curve warp w(u) | HEAD: explicit (W) weight-field w(u;φ); warp = field-center φ shift; engine-correct (selfcheck 21 PASS); curve renders across frame. On-screen per-trade warp is SUBTLE (≈0.5–1px; verified elbow-local — sweep shows no τ matches v24's global warp with frozen wings) | entry-46 fix `928cde1c` (anchor overlay) | HEAD — engine PASS; visual subtlety ACCEPTED (override). **ENTRY-46: anchor (w=½) overlay FIXED-verified — k=√(x·y)=1,742 (was 170.83, 104× low); passes 1.15px from the live reserves dot, pixel-confirmed on the entry-45 frame (`I3_anchor_curve_default.png` re-shoot).** **ENTRY-30 obs: warp is premium-driven only (φ=f(dy=±premium)); constant-premium-further-OTM does NOT warp more — operator CHECK-1 claim NOT reproduced, see OPEN -1.** **ENTRY-45 obs: τ visual authority intrinsically small on the default frame — re-anchoring pins the elbow at the live point and wing shift is along-tangent (self-sliding); full-range τ 0.05→3.00 max 153.7px at wing tail yet perceived shape ~unchanged (screenshots); per-click (±0.05) 3.4px max = sub-visible. Redraw FIRES (canvas diff every step). See OPEN -2** **▶ C16 (`abd46149`): GOAL-SEEK readout added — G input ⇒ w′=Engine.goalSeekW(G)=G/(1+G), advisory only (drives nothing); G=3⇒0.7500/γ′3, G=0.5⇒"G≥1 required" NaN-loud, tester live ×2.** **▶ -A14b SEEN-warp (test on `de28c937`, 2026-06-12): the chart-2 option-value reshape DOES depend on kurtosis — for a fixed sold-call trade the |Δψ| reshape grows near the money as τ sharpens (peak at the mode 0.453→0.660→0.794 at τ=1.0/0.3/0.05) but SHRINKS at a fixed OTM strike (θ=1.25: 0.148→0.090→0.045). The UNDERLYING swap-warp is kurtosis-free (row #16). tester live ×2.** **▶ TRADE-POINT `e148c9b7` (working-tree, NOT pushed, 2026-07-02, tester live 14/14 ×2 READ-ONLY): off-ATM trades now GENUINELY move α,β and re-anchor the curve (spec §4 delta 2 — the entry-16 ruling made engine-true): every sweep open moved α (Δα up to −3.9e-3) with chart-1 hash re-anchor; ATM (ρ=1) keeps α,β steady (1.5e-16); post-arb lean now β/α-dependent (w=0.499962, |w−0.5|=3.8e-5 after the standard band — disclosed, measured).** |
| 3 | Kurtosis knob τ | HEAD: **τ is a NUMBER STEPPER (no slider anywhere — 0 `input[type=range]` in live DOM), step 0.05, range 0.05–3**; keyboard ↑/↓ steps + readout + curve update live; elbow visibly rounds at $80k defaults (τ 0.05→1.5: elbow 5.6px mean/111 max, left wing 0.0px) — tester-confirmed. **Display-fix `1eebfcd6`: spinner ARROWS UN-HIDDEN (CSS L331-337) — mouse-click on the τ up-arrow steps 0.30→0.35 and the curve redraws; ALL settings/perp number fields show spinners (tester pixel+click ×2)** **▶ v28-S2 (`b53ace99`): FLAG-1 RESOLVED — the τ stepper EVENT now AUTO-REDRAWS chart 2 live (0.3→0.05=5,199px, 0.3→2=6,545px, real ArrowUp=3,894px); handler calls `if (Viz) Viz.drawAll(...)` via the ui closure (dead `window.Viz` guard removed) — tester live ×2.** | **▶ v28-lens HEAD `7e1ae39b` (one-line wire): the τ stepper now ALSO calls previewBand() — so a τ change recomputes the band-preview + the SLIPPAGE readout (non-stale), not just chart-2. Tester live ×2 byte-stable: #band-slippage τ0.3→0.5569% / τ1.0→0.9031% / τ0.1→0.4258%, returns to 0.5569% at 0.3; ArrowUp 0.3→0.35→0.5915%. Read-side τ-reactivity now covers the quantitative readout, not only the curve.** | v28-lens HEAD `7e1ae39b` (slippage-refresh wire) | DESIRABLE mechanics — stepper+redraw verified live ×2; **ENTRY-46: honest disclosure sentence added + visible at the τ control ("Visible effect scales with the wing gap (w₊−w₋) and is subtle per 0.05 step…"); per-click delta re-baselined byte-identical (3.39px analytic / 3,744px canvas one click; 153.73px full sweep)** — **BUT ENTRY-45: operator reports (correctly) the CURVE looks "almost completely insensitive" to τ — confirmed intrinsic-small visual authority (one click 3.4px max; 0.30→0.60 19.9px; 0.30→3.00 131px, all at wing tails along-tangent, elbow pinned at live point). NOT a redraw bug. Whether the knob needs more VISUAL authority = OPEN operator-tier (OPEN -2)** **▶ v28-S1 CANDIDATE (NOT HEAD, `5e1ff278`): on the polar-lens build τ visibly reshapes CHART 2 (lens read) — forced-redraw τ0.3→0.05 ≈98px elbow sharpen, wings frozen (Δψ≈5e-5); BUT the τ stepper EVENT does NOT auto-redraw chart 2 (0 px on a 0.3→3 step) because `window.Viz` is undefined and the L2702 guard is dead — FLAG-1, OPEN intern one-liner. Same operator "insensitive to kurtosis" symptom-class, here a pure redraw-wiring bug (math/draw correct).** **▶ C16 (`abd46149`): τ stepper still reshapes chart-2 live; the lens factor Φ_τ scales the new held-lens warp view (Φ_τ→1 in the wings drives the exponent-warp OTM growth) — tester live ×2.** **▶ -A14b (test on `de28c937`, 2026-06-12): τ confirmed as the SEEN-warp magnitude knob — sharper τ ⇒ bigger near-money chart-2 reshape (peak 0.453→0.660→0.794) and lower OTM option value ("less value in the html", operator entry 185 confirmed); on-screen band slippage moves with τ (11.89%→12.08%→12.84% at τ=1.0/0.3/0.05). τ does NOT touch the AMM swap dy (row #16). tester live ×2.** **▶ R-218 INVTX (`5fea0e8d`): τ-DIRECTION of the inverse-lens tx-strike OBSERVED — fixed chosen θ=1.5 ⇒ θ_tx 1.573×(τ0.05)/1.894×(τ0.3)/2.685×(τ1)/5.011×(τ3): SHARPER τ ⇒ θ_tx LESS far. This INVERTS operator entry-218 (YES, sharper⇒further) — OPEN operator-tier (rolling -R218τ). τ still reshapes chart-2 (0.3→2=6,545px), chart-1 inert (0px). tester live ×2.** **▶ M-CLAMP `9f1e625b` (2026-06-22, tester live ×2 READ-ONLY): the SLOPE-MULT knob `#m-input` (constant-multiplier successor to τ, domain m∈[1,6] operator-RULED entries 229/231) is now RANGE-FENCED live — both `setM` AND the input change/input handler clamp to [1,6], and on `change` the field VALUE writes back to the bound. Was a silent leak: typing m=0.1 drove the lens to an out-of-range state (mode peak ~0.70). Confirmed: m=0.1⇒clamps m=1 (peak 0.2500, field snaps `"1"`); m=10⇒clamps m=6 (peak 0.0567, field `"6"`); m=3 in-range works (peak 0.1055, field `"3"`). No engine math change (clamp+writeback only); curve byte-identical. FENCES an UNDESIRABLE; in-range knob behaviour unchanged.** **▶ CHART2-NORM `6a23f93d` (working-tree, NOT pushed, 2026-06-22, tester live ×2 READ-ONLY): REGRESSION on the chart-2 VISIBILITY of m. The new mode-peak normalization (psiN=min(1,psiAt/peakNorm)) mathematically CANCELS g=m·γ — in markLensed continuation the normalized value is sNorm/θ (call) / θ/sNorm (put), g-FREE — so chart-2 is m-INVARIANT: normalized wing values byte-identical across m=1/3/6 and the m=1 vs m=3 chart-2 screenshots are md5-IDENTICAL (`e5789975…`). The knob's visible steepening (which the prior `8f897edc` SHOWED) is GONE on chart-2 — regresses operator entry-226. OPEN, operator-escalation owed (see reconciliation list).** **▶ CHART2-OPTC `dd6fb955` (working-tree, NOT pushed, 2026-06-22, tester live ×2 READ-ONLY): VISIBILITY RESTORED — the `6a23f93d` cancellation is REPLACED by Option C, which plots the lens wing law `(mode/θ)^(m·γ)`/`(θ/mode)^(m·γ)` DIRECTLY (no peak-division to cancel `g=m·γ`). Mode peaks at 1 by construction AND chart-2 steepens visibly with m again: 3 DISTINCT chart-2 PNG md5 (m1 `e5789975…`/m3 `aa411091…`/m6 `6cf4cd81…`; the `6a23f93d` build had m1≡m3), width-at-half 345→123→63 px as m=1→3→6, apex psi≈1.00 every m. Markers (dPsi 0.025/0.0085) on the shape. Engine/`markLensed`/`gLoc` byte-unchanged (draw-layer only). entry-226 RESOLVED(evidence); the regression is CLOSED.** **▶ DISPLAY-SLICE `a6ca02f3` (working-tree, NOT pushed, 2026-07-02, tester live ×2 READ-ONLY): -B289 CAPTION FIXED — the SLOPE MULT m label now carries the paper's REVERSED vol direction: "larger m ⇒ steeper everywhere. Vol calibration: MORE volatile asset ⇒ LOWER m (fatter wings, richer tails)" (live DOM, checks 6a/6b); old "(more vol)" gone; geometry sentence intact. m stays VISIBLE on the NEW true-V chart-2 through 3 channels (M=1/3/6, 3 distinct hashes): wings steepen (put v@φ20° 0.092→0.0068→0.0034), seams march inward (63.4°→53.1°→49.8°, analytic atan((g+1)/g)), ATM crossing height falls (0.2523→0.1074→0.058 vs analytic (g/(g+1))^g/(g+1) = 0.25/0.1055/0.0567). The Option-C peak-normalized tent (dd6fb955) is REPLACED — deliberate entry-298/301 scope, not a regression; entry-226/L2063 re-dispositioned RETIRED-by-scope in the a6ca02f3 entry.** |
| 4 | Carry P=Ny/Nx, q=ln p | HEAD (v27): carry = price leg q=ln p; reads via getMP_raw; engine-consistent (selfcheck) | v27 | DESIRABLE — stable **▶ CONSTMULT HEAD `8f897edc` INHERITED-CONFIRM (2026-06-13, READ-ONLY, skeptic FLAG-OMISSION #2 close): carry P=Ny/Nx=getMP_raw=$80,000=oracle at default, u=log(price)−log P=0, finite/not-NaN; live ×2.** |
| 5 | Rebase (P→P/r) | HEAD (v27): rebase = carry-shift q→q−ln r (NOT rigid x→r·x); **warp∘rebase-commute OPEN [needs-Aristotle]**, deliberately not coupled. **ENTRY-46 smoke: rebase path UI-exercised first time — engine consistent (arb closes the poolMark gap exactly) but the $ KPIs display the pool FRAME, see FINDING-R row #1** | v27 (+ entry-46 smoke obs) | OPEN lemma — theory-risk-accepted; FINDING-R display item OPEN **▶ CONSTMULT HEAD `8f897edc` INHERITED-CONFIRM (2026-06-13, READ-ONLY, skeptic FLAG-OMISSION #2 close): rebase live-confirmed EXACT frame-rescale on `8f897edc` — oracle 80k→100k (r=1.25): x×1.25/α×1.25, β,y,w invariant, mp_raw×(1/r)=P→P/r EXACT, θ→θ/r; 80k→64k symmetric; live ×2. (A pure oracle rebase is a frame rescale, NOT a moneyness change — confirmed v24-faithful.)** |
| 6 | Pricing law value∝S^(−γ) | HEAD (v27): value∝S^(−γ_loc) under Reading A (operator-ruled, entry 11 "a"); wings exact power-laws | v27 (+ v28-S1 candidate obs) | DESIRABLE — Reading A ruled. **▶ v28-S1 (`5e1ff278`): pricing READ through the polar lens g_loc=γ·h′_τ(|u|) on chart 2; value∝S^(−γ_loc) preserved in the wings (selfcheck 5c g_wing→γ-scale); elbow rounds with τ, wings frozen — tester-confirmed live** **▶ UX-FIX-2 `d606c3f2` (2026-06-22, tester live ×2 READ-ONLY): strike-MARKER overlay on the chart-2 lensed read RENDERS ON the curve — 182 dot pixels, sold-call red #FF6767 (φ56.3°/$120k) + bought-put green #14E800 (φ31°/$48k) at the lensed smooth-paste mark ψ≈0.15-0.16 (dy 2-3px), NOT floating at the old un-lensed ~0.85/0.95; 0 pageerrors (the `ReferenceError: psiAt is not defined` ×4 fixed by inlining `Engine.gLoc`+`Engine.markLensed` in scope). Engine/curve byte-unchanged.** **▶ PKG-ITM v2 `9fdde1de` (working-tree, 2026-07-02, tester spec-§6 acceptance ×2 byte-stable READ-ONLY): continuation wings still EXACT power-laws of exponent m·γ (CM11 V(2ρ)/V(ρ)=2^(∓g) ≤1e-12); quotes reshape everywhere EXCEPT ATM (fixed point g^g/(g+1)^(g+1)) — g=2: 1.2 drops 0.1235→0.1029, 0.8 rises 0.1852→0.2315, past-seam = linear parity exactly. Disclosed entailment of the operator-ruled linear re-seam (entry 287), not a regression.** **▶ DISPLAY-SLICE `a6ca02f3` (2026-07-02, tester live ×2 READ-ONLY): chart-2 DEPICTION replaced (draw-layer only; engine byte-identical to `9fdde1de`, node-verified): plots TRUE per-unit V per wing across ALL strikes via the SAME Engine.markLensed read settlement uses (single-basis, NaN-loud), OTM AND ITM, wings CROSS at ATM (the Deribit-X, operator entries 292/295); %/$ toggle — % = fraction of the wing's own escrow unit (saturates →1 deep ITM, measured 0.968@φ88°/φ2°), $ = ×K (put) / ×S (call) (ITM tails = straight K−S / S−K lines; put tail exits at the 1.25×S clamp, x=658 vs analytic 660; no NaN/blowup). Crossing measured both views: v=0.15 (% / analytic 0.1481), $12,013 ($ / analytic $11,852).** |
| 7 | ITM American smooth-pasting | HEAD (v27): ported with g→γ_loc (Reading A); seam value/slope selfcheck PASS; mark/markFrac split present. NOT carried from the GH line: payoff naked-leg uncap + x-range −90..+200 (HEAD payoff caps at 1, ±50%) — NOTES D9/D10 **▶ v28-S2 (`b53ace99`): SETTLE-side lensed — `markEff`/`legValueUnified` price the ITM leg LENSED at the reciprocal sNorm mode; one-ITM-leg path live-verified (steep pool, sold-call driven ITM → settled_cash_leg=sold/live_leg=bought, raw_net finite); near-ATM g_loc≈0 settles finite (markLensed g=0→1, no NaN).** | v27 (+ Task-2 diff) (+ v28-S1 candidate obs) | HEAD — seam PASS; 2 GH-line payoff upgrades unported (noted for future). **▶ v28-S1 (`5e1ff278`): lens twin `markLensed` (Reading-A smooth-paste with strike-local g) — seam value/slope continuous incl. g<1 (selfcheck 4a/4b), and the g=0/S*=0 ATM point returns finite boundary value 1 (no NaN, MUST-APPLY-2) — tester live-probe + selfcheck 4c agree** **▶ R-218 INVTX (`5fea0e8d`): SETTLEMENT at the CHOSEN strike while the pool FINANCES at θ_tx (two-strike)** — sold-call-driven ITM close settled_cash_leg='sold' at K_inner=$120k (chosen θ=1.5) with the swap/reversal at frozen K_tx=$151,491; raw_net=−4.51e-3 / payout=−$9.18 finite. tester live ×2. **▶ CONSTMULT HEAD `8f897edc` INHERITED-CONFIRM (2026-06-13, READ-ONLY, skeptic FLAG-OMISSION #2 close): ITM American smooth-paste settle-to-cash FIRES through the lens — forced real ITM (poolMark/oracle=2.669>sold-call ray 1.5, no rebase) → settled_cash_leg='sold', live_leg='bought', trader_payout=$3.78 finite; live ×2 + Node-oracle.** **▶ UX-FIX-2 `d606c3f2` (2026-06-22, tester live ×2): the ITM/smooth-paste READ is unchanged; the strike-MARKER overlay drawn on top of the chart-2 lensed read now RENDERS the sold/bought dots ON the curve at the lensed smooth-paste mark (was a `ReferenceError` ⇒ 0 dots on `f6029182`); 182 dot pixels, dy 2-3px, 0 pageerrors.** **▶ PKG-ITM v2 `9fdde1de` (working-tree, 2026-07-02, tester spec-§6 acceptance ×2 byte-stable READ-ONLY): markLensed LINEAR RE-SEAM — power continuation ρ^(∓g)/(g+1) welded C¹ onto the LINEAR parity intrinsic; put seam ray θ·g/(g+1) (dollar S*=K·g/(g+1): MEASURED 0.667K at g=2 / 0.857K at g=6 on DOM output), call θ·(g+1)/g; boundary fraction 1/(g+1) both wings; V=max(mark,intrinsic) holds IDENTICALLY (O2 value_ge_intrinsic tfp + CM10 + DOM sign table: belowIntrinsic EMPTY at 52 readings — the entry-286 below-intrinsic defect on dd6fb955 [16 spots, max −0.248] is GONE); paper cells reproduced EXACT at 4dp both columns; C¹ DOM quotients within ±0.03. Replaces the power-intrinsic arms; pre-fix build retained as temporal_mvp_v28_lens_powerarm.html. Gates CM4-v2/CM4-v2-C1/CM10/CM11 (lens 16/16) + a16 5/5.** **▶ DISPLAY-SLICE `a6ca02f3` (2026-07-02, tester live ×2 READ-ONLY): the v2 seams are now DRAWN on chart-2 — continuation SOLID, parity/intrinsic tail DASHED per wing; seam pixels measured at put S/K=0.667-class (dash onset φ≈56.5°, NOT the old 0.444/φ66°) and call θ=0.667-class (φ≈33.9°), boundary height pixel-read 0.3307 vs analytic 1/(g+1)=1/3; band strike markers re-anchored to the same markLensed read in the ACTIVE %/$ view, wing from b.sold_wing/b.bought_wing — dots ON the plotted curves BOTH views (dR/dG ≤1.2px vs analytic). ONE cosmetic FLAG: the $-view put tail dash is AA-swallowed on the steep clamp segment (reads solid; row coverage 0.965) — rolling -B301-DASH.** **▶ DASH-FIX `7015c22c` (working-tree, 2026-07-02, tester targeted recheck 17/17 ×2 READ-ONLY): -B301-DASH RESOLVED — parity-tail dash made screen-space `[8,6]·cssScale` + plotted value clamped `min(v, 3·yMax)` (draw-layer only; engine+state byte-identical to `9fdde1de`): $ put-tail row coverage 0.9647→0.4941, all four tails legibly dashed, continuations solid (exact 4dp match to a6ca02f3); in-frame geometry anchors EXACT (crossing x462/v0.15, boundary 0.3307, $ crossing $12,013, clamp exit x658); seam still 0.667-class. Display-slice acceptance = PASS.** **▶ UPDATE-1 `bb2f8230` (2026-07-07, tester live 10/10 ×2 + smoke 17/17 ×2 READ-ONLY): the entry-405 close-(b) BUILT — the two-case ITM-to-cash branch is RETIRED; closeBand values BOTH legs at the ONE pre-close snapshot s0 (`legPrice`, markLensed = linear parity past S* ⇒ ITM tallies identically) and reverses BOTH on the AMM via `tradeUpdateAt` @ rho_close. Live: OTM close settled_cash_leg=null/live_leg='both'; a GENUINELY-ITM leg (sold-put θ=5 ≥ sNorm0≈1 via oracle 12000+arb) STILL reverses on the AMM (settled=null, log 'both legs reversed on AMM'); payout CONTINUOUS across the OTM→ITM crossing (crossStep 0.48× median — the retired two-case twin `51342574` still settles a leg to CASH on the ITM side). settled_cash_leg is now ALWAYS null. Gates CM6-v3 (drain-documented) + CM12 (payout-continuity) replace the retired CM6-v2 frozen-arc round-trip; lens 31/5.** |
| 8 | Uniform strike registration θ=sNorm(K) | HEAD (v27): sNormStrike ((W) inverse) defined+exported (round-trip 1.46e-15, NaN-loud) but **export-only — no regLeg wiring**; payoff sweeps price-ratio (1+r); the v26c one-mark-across-display/exec/chart guarantee + all-γ crossover@K are UNVERIFIED on (W) — NOTES D11/D13/D16 | v27 (+ Task-2 diff) | PARTIAL — function present, uniform wiring unported (noted for future) **▶ CONSTMULT HEAD `8f897edc` INHERITED-CONFIRM (2026-06-13, READ-ONLY, skeptic FLAG-OMISSION #2 close): strike registration θ=K/oracle live-confirmed consistent — K=$120k/$80k/$48k → θ=1.5/1.0/0.6, markLensed 0.1667/0.25/0.15 finite, S*=g/(g+1)=0.5; display-mark + chart-ray share the single sNorm coord; live ×2.** |
| 9 | Funding | HEAD (v27): re-pointed to price-anchor p=P, γ→±γ_loc [theory-risk-accepted] — diverges from the GH line's locked w=½ funding; φ-anchor/funding lemma OPEN [needs-Aristotle] | **`5ce1a76c` vocab relabel ("lean"→"ray dev / skew deviation" in the Funding column header/tooltip/units-note; TEXT-ONLY, engine byte-identical, 2026-07-08)** ← **`abd35f4b` same-slope DEVIATION placeholder (2026-07-08)** ← **`bb2f8230`** funding-extrinsic (2026-07-07) ← `51342574` -FPNL-NEGZERO −0 guard (2026-07-07) ← `4bc939ec` funding-P/L column (entry 425, 2026-07-03) | DISPLAY LAYER: DESIRABLE-delivered (entry 425, see 4bc939ec addendum at row end); funding THEORY status unchanged: OPEN — theory-risk; not UI-exercised on v27. **▶ v28-S1 (`5e1ff278`): funding routes THROUGH the lens (±g_loc replaces ±2). UI-exercised: with S≠1 (steep pool), ATM funding=0 (g_loc→0), OTM call +2.23e-3 / put −2.23e-3 (opposite-signed, equal magnitude), all finite — tester-confirmed. Operator RULED funding-through-lens accepted (entry-93 "5 idc, same geometric thing")** **▶ CONSTMULT HEAD `8f897edc` INHERITED-CONFIRM (2026-06-13, READ-ONLY, skeptic FLAG-OMISSION #2 close): funding now m-COUPLED ±g_loc=±m·γ per OPERATOR ENTRY 232 [verbatim L1865] — live-confirmed SCALES with m (call θ=1.5 +3.68e-4/+4.29e-4/+5.06e-4 at m=1/2/4; sub-linear: g∝m but markLensed shrinks), SIGN FLIPS call(+)/put(−), all finite/sane on a steepened pool; FLAG-OMISSION #1 RESOLVED-BY-RULING; live ×2.** **▶ PKG-ITM v2 `9fdde1de` (2026-07-02): funding MAGNITUDES re-scale wherever the consumed mark changed (shared-helper entailment; formula κ·(±g)·N·mark·(S−1)/S untouched); funding REDESIGN excluded + operator-gated (entries 295/296 study).** **▶ FUNDING-P/L COLUMN `4bc939ec` (PROMOTED HEAD 2026-07-03, operator entry 425, tester live 16/16 ×2 byte-stable READ-ONLY): the portfolio bands-table Funding column now displays the SIGNED P/L EFFECT = −Σ stored trader-pays accruals (+ = line received, − = line paid) at band/component/total rows, and the Total-row line P/L is funding-INCLUSIVE (dollarFigure = L₀·raw_net·equity + fundingP/L×oracle). SIGN INVERSION vs the pre-425 display is INTENDED (R6 gate-#2 sign pin): the old column printed the raw stored trader-pays sum (a paying line read POSITIVE and never entered the $ P/L); the new column negates it (payer reads NEGATIVE). Live-confirmed ON SCREEN (2 opposite bands, oracle 88000 via #kpi-oracle, 24×#btn-tick): PAYER B1 (long sold-call$120k/bought-put$48k) cell −0.000469, P/L −$4.50→−$45.75 FALLS; RECEIVER B2 (short sold-put$60k/bought-call$100k) cell +0.000531, P/L $5.53→$52.25 RISES; cell==−Σstored (6dp); ΔP/L==cell×oracle; band cell==Σ component cells; disclosure header th + units-note + $-cell tooltip all rendered (includes-accrued / EX-funding-at-close). Stored ledger + fundingTick + closeBand BYTE-UNTOUCHED (engine+state blocks byte-identical to 0e0a0062, tester node-compared) — close cash still settles EX-funding until the parked part-2 transfer layer ships (disclosed on screen). Cosmetic nit -FPNL-NEGZERO: zero funding rendered `-0.000000` pre-tick — **RESOLVED-in-`51342574`** (2026-07-07, −0 normalized at the 3 display cells; tester live 12/12 ×2: all 8 pre-tick cells exactly `0.000000` no minus, post-tick payer/receiver signs+magnitudes byte-equal to the 4bc939ec pass).** **▶ UPDATE-1 `bb2f8230` (2026-07-07, operator entries 450/451; tester live A6 ×2 READ-ONLY): funding WEIGHT changed full-mark → EXTRINSIC = markLensed − max(intrinsic parity,0). Behaviour now a SINGLE HUMP peaking at ATM (strike=mode), fading to 0 both ways and EXACTLY 0 past the smooth-paste seam S* ⇒ funding ZERO deep-ITM (was: full mark funded intrinsic forever). Live ladder (steepened pool S=0.14, m=6/g=2.25): call peak −3.70e-2 @ ATM, =0 at θ=0.30·mode (past call seam 0.692); put peak +3.70e-2 @ ATM, =0 at θ=3.0·mode (past put seam 1.444); call/put OPPOSITE sign. The ±g·(S−1)/S SIGN + κ,N,dt + the S≤0 guard + the through-the-lens ±g_loc (entry 232) are UNCHANGED — ONLY the weight. Gate FE (funding-extrinsic, negative-controlled: old full-mark ≠0 past S*). This is the operator-ruled 'funding on the option-part value, OTM only' (entry 451). INTENDED sign/shape change vs the old build, NOT a regression.  **▶ SAME-SLOPE DEVIATION `abd35f4b` (PROMOTION-GATING 2026-07-08, operator entries 458/460/462; tester focused live 13/13 ×2 + smoke 17/17 ×2, READ-ONLY): funding WEIGHT changed from the update-1 extrinsic-hump / old ext·(S−1)/S → the REAL same-slope pool-vs-anchor RAY-ANGLE-RATIO deviation dev=|c·ln(θ/mode)|, c=(g_a−g)/(g_a+1), g=m·γ (pool, γ LIVE), g_a=m (anchor w=½). Now an OTM LOBE: 0 at ATM (ρ=1), GROWS OTM (call +g / put −g, opposite sign, reciprocal-ρ mirror), EXACTLY 0 ITM, and EXACTLY 0 ∀ strikes on a SYMMETRIC w=½ pool (the pool-lean signature / anti-regression KILLER — the old weight funded this pool, the recurring ~20–30× regression the operator flagged). Live vm-in-page ladder (leaned w=0.30, mode getSNorm=2.333, m=6/g=2.571): call 0.0615→1.746 across ρ1.05→4, put −0.0646→−1.746 across ρ0.95→0.25, both 0 at/inside ATM; symmetric pool 0 everywhere at m=6 AND m=3. DEVIATION-ONLY PLACEHOLDER — the actual funding FORMULA (HL capped premium→rate) is DEFERRED to UPDATE-2 (entry 462); NO cap/knob. Gate FE.2/FE.3 RETIRED → FS.1–FS.6 (KILLER FS.2b). UI: Funding column header + units-note re-labelled "Funding (lean; TBD)" placeholder disclosure, live-rendered. INTENDED shape/label change, NOT a regression. Perps table untouched. F1 (oracle-independence-as-final) = operator-tier OPEN, rides UPDATE-2.** |
| 10 | Slippage basis (mpGeom) | HEAD (v27): mpGeom collapses to getMP_raw (price==slope on (W), proven, selfcheck L4). NOT carried: v26a's honest $-tooltip ("Layer-1 reserve-USD, not trader honest-dollar") — HEAD ships the v24 tooltip — NOTES D2 **▶ v28-S2 (`b53ace99`): executed slippage plain v24. FINDING-RT (OPEN, INHERITED-v24): instant open→close round-trip on a two-OTM-leg band is TRADER-favourable (raw_net>0, scales with slippage; byte-identical in S1+v24) — brief expected pool-favourable; sign-convention escalation. Band-PREVIEW xoracle inflation still carried (entry-96 bug-batch).** | **▶ v28-lens HEAD `7e1ae39b` (one-line wire): the band SLIPPAGE readout now LIVE-RECOMPUTES on a τ change (previewBand re-runs on the τ stepper event) — confirmed non-stale, 4 distinct values across the τ range, monotone-with-τ (manager-derived ~0.25→0.76% trend), tester live ×2. Root: lensed/τ-threaded legPrice ⇒ τ-dependent leg2 reserve move ⇒ τ-dependent s_band. No engine/math change (display-refresh wire). FINDING-RT still OPEN/INHERITED-v24.** | v28-lens HEAD `7e1ae39b` (slippage-refresh wire) | DESIRABLE math; $-label honesty unported (noted). **ENTRY-46: BOTH entry-45 band-panel display defects RECONCILED-in-`928cde1c`, tester live ×2 — (a) stale-on-reject: `clearBandPreviewOut()` wired on every reject path, STALE-CHECK FALSE on swap/pill/oversize; (b) audit strip prints raw engine USD exactly (28,453.17/11,470.09/39,923.26 on the entry-45 reference band — was $3.19B).** **ENTRY-45 (historical): 2 display defects: (a) STALE-ON-REJECT — previewBand reject paths (!sim.ok / club guards) set the warn but DON'T clear summary/audit ⇒ slippage/N_buy/net-cash retain the PREVIOUS direction's numbers next to the rejection banner (the operator's screenshot state); (b) ×ORACLE UNIT INFLATION — pv-net-cash/pv-dy-sold/pv-dy-bought multiply raw-USD engine dy by oracle again ⇒ "$3,193,860,736" net cash on a $303k pool (engine netPoolY=39,923.26 raw USD, correct; display ×80,000)**  **▶ v28-S1 (`5e1ff278`): executed slippage is plain v24 (lens does NOT touch it; the slippage % readout is sane, e.g. 1.9322% ≈ $73.62). BUT the band AUDIT strip nets (pv-net-cash/pv-dy-*) carry the v24-base ×oracle DOUBLE-MULTIPLY ($618M on an $800k pool) — VERIFIED byte-identical to the v24 base (V_usd already ×oracle L1755, display ×oracle again L3050-52); INHERITED-v24, not a Stage-1 regression; OPEN (candidate v24 known-gap fix).** **▶ R-218 INVTX (`5fea0e8d`): reserve-depth guard now keys off N·K_tx (the bigger inverse-lens swap) — far-OTM CAPACITY SHRINKS** (bought call θ=2.0: max N 2.25→1.746, 0.776×; rejects at N·K_tx=$411,959 with verbatim $ reason though N·chosen_K under depth; no silent cap). tester live ×2. **▶ TRADE-POINT `e148c9b7` (2026-07-02, tester live ×2): depth guard MOVED to the trade point — reject when N·K_tx ≥ 0.9·(w·y·ρ^w); put-wing capacity genuinely THINNER (measured: reject at $200,000 tx-ray depth where the old y−β guard held $400,000; ρ=0.25, w=½), call-wing deeper; verbatim reject cites "pool cash depth at the tx-ray"; UI warn banner + disabled execute + notional un-mutated (no silent cap).** |
| 11 | Dollar/settlement pipe | Reused byte-identical from the v24 base; curve-independent **▶ v28-S2 (`b53ace99`): the LENSED value is now the unit of account (operator entry 96 RULED) — open-band portfolio value moves with τ (Δ=4.544e-2 across 0.3→2); closed bands freeze settlement $; NO mixed-basis (8 carved-perp-unit cells carry no `$`; exactly 1 $ settlement cell; carved perp slice un-lensed, not summed) — tester live ×2.** | — (unchanged) | DESIRABLE — stable (reuse) **▶ CONSTMULT HEAD `8f897edc` INHERITED-CONFIRM (2026-06-13, READ-ONLY, skeptic FLAG-OMISSION #2 close): dollar/settlement pipe live-confirmed on `8f897edc` BOTH regimes — OTM-expiry (both legs reverse on AMM, trader_payout $0.072) + forced-ITM ($3.78), raw_net finite, reserves finite, round-trip restore EXACT (|dx|=|dy|=0); NO NaN, NO absurd magnitude; live ×2.** **▶ PKG-ITM v2 `9fdde1de` (2026-07-02, tester live READ-ONLY): callers byte-unchanged; BOTH regimes re-confirmed on the re-seamed mark — OTM band close (both legs reversed on AMM, raw_net −1.97e-4 finite) AND deep-ITM close (sold-put θ=5: settled_cash_leg='sold', live_leg='bought', trader_payout −$8.09 finite, pool finite). Smoke 17/17.** **▶ TRADE-POINT `e148c9b7` (2026-07-02, tester live ×2): close = FROZEN-ARC exact reversal (revertArc) — 5-band sweep (both wings, deep OTM, m=1+m=2) restores (x,y,w,α,β) machine-exact; intervening-trade close nets the closer's OWN increments out EXACTLY (resid ≤9.1e-13) and keeps everyone else's moves; ITM settle path unchanged (smoke S11 sold-put settled-to-cash, payout finite); legacy no-arc bands fall back to today's path (FLAG-5 pinned default).** |
| 12 | getMP_raw price-coord gotcha | HEAD (v27): price == geometric slope EXACTLY on (W) (no e^μ factor); code comment warns against re-introducing the GH factor on a cross-port | v27 | DESIRABLE — moot by construction, warning kept |
| 13 | Solvency boundary (B1) | OPEN ship-gate, unchanged by the promotion (not claimed closed) | — | OPEN — the known hole |
| 14 | Esscher tilt / rapidity group | HEAD (v27): trade = weight-slot field-center translation φ; premise skeptic-verified FAITHFUL to paper+v24 (entry-27 cross-check); no X·Y invariant claimed | v27 | DESIRABLE — grounded |
| 15 | File-safety gate | Display-fix build `1eebfcd6`: blobs canonical `ab663f5c…` (L74) / `c505b08a…` (svg line shifted 1060→1064 by new CSS, content canonical; line-md5 tester re-verified), 3 scripts parse; 0 console errors live ×2 **▶ v28-S2 candidate (`b53ace99`): file-safety GREEN — blobs `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse, lens_selfcheck 23/0, 0 console errors live ×2, build md5 unchanged post-run.** | entry-46 build `928cde1c` (HEAD); v28-S1 `5e1ff278` (candidate line) | DESIRABLE — stable. HEAD re-verified entry-46 smoke (md5 `928cde1c`, blobs L74/L1064, 3 scripts, run_all 22/22, 0 uncaught ×2). **▶ v28-S1 candidate (`5e1ff278`): file-safety GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse, lens_selfcheck 14/0, 0 console errors live ×2** **▶ R-218 INVTX candidate (`5fea0e8d`): file-safety GREEN — blobs `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse, lens_selfcheck 39/0, 0 console/0 pageerrors live ×2, build md5 UNCHANGED post-run.** **▶ UX-FIX-2 `d606c3f2` (2026-06-22, tester live ×2 READ-ONLY): file-safety GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse, lens_selfcheck 13/0 + a16_atm 5/0, 0 console / 0 pageerrors live ×2, build md5 `d606c3f2` UNCHANGED post-run.** **▶ M-CLAMP `9f1e625b` (2026-06-22, tester live ×2 READ-ONLY): file-safety GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse, lens_selfcheck 13/0 + a16_atm 5/0 (monolith 8/8 report-only), 0 console / 0 pageerrors live ×2, build md5 `9f1e625b` UNCHANGED post-run. (Header badge shortened to `Composite-Ray AMM · trusted-from-prover` — one line, no wrap.)** **▶ CHART2-NORM `6a23f93d` (working-tree, NOT pushed, 2026-06-22, tester live ×2 READ-ONLY): file-safety GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse, lens_selfcheck 13/0 + a16_atm 5/0 (monolith 8/8 report-only), 0 console / 0 pageerrors live ×2, build md5 `6a23f93d` UNCHANGED post-run. Chart-2 mode now anchors at y=1 (apex psi 1.0032, y17 vs y=1 tick y18); strike markers normalized ON the curve; legend → "peak = 1 (mode, normalized)".** **▶ CHART2-OPTC `dd6fb955` (working-tree, NOT pushed, 2026-06-22, tester live ×2 READ-ONLY): file-safety GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse, lens_selfcheck 13/0 + a16_atm 5/0 (monolith 8/8 report-only), 0 console / 0 pageerror / 0 dialog ×2, build md5 `dd6fb9557c251df222a4f918970576dd` UNCHANGED post-run. Chart-2 now plots the NORMALIZED STEEPNESS SHAPE `(mode/θ)^(m·γ)`/`(θ/mode)^(m·γ)` (peak=1 at the mode by construction; markers use the same `r^g`); caption + legend → "normalized steepness shape, peak=1 (mode)". Supersedes the `6a23f93d` peak-norm (which cancelled the knob); 3 distinct chart-2 PNG md5 across m.** **▶ PKG-ITM v2 `9fdde1de` (working-tree, NOT pushed, 2026-07-02, tester live ×2 READ-ONLY): file-safety GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse, longest script line 603; gates REWRITTEN per spec §7: lens_selfcheck 16/16 HARD (CM4-v2 linear-seam + CM4-v2-C1 slopes + CM10 value≥intrinsic + CM11 wing power-law) + a16_atm_gate 5/5; monolith 8/8 report-only repointed to v2 seams/O1; 0 console / 0 pageerrors ×2 sweep + smoke; build md5 `9fdde1de…` UNCHANGED pre/post every run.** **▶ DISPLAY-SLICE `a6ca02f3` (working-tree, NOT pushed, 2026-07-02, tester live ×2 READ-ONLY): file-safety GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse (longest non-blob line 1217), `<script id="engine">` BYTE-IDENTICAL to promoted `9fdde1de` (node string-compare, 43156 b) — draw-layer + captions only; gates lens_selfcheck 16/16 + a16 5/5 HARD (monolith 8/8 report-only), run_all exit 0; 29-check live acceptance ×2 byte-stable (28/29, the 1 FAIL = -B301-DASH cosmetic) + STANDING UI SMOKE 17/17 re-run on THIS md5; 0 console / 0 pageerrors / 0 dialogs; build md5 UNCHANGED pre/post every run. NOTE: run_all.sh line-8 integrity md5 pin STALE (still `9fdde1de`; prints only, does not gate; manager re-pins at promotion).** **▶ DASH-FIX `7015c22c` (working-tree, 2026-07-02, tester targeted recheck ×2 READ-ONLY): file-safety GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse (longest non-blob 1217), engine+state blocks BYTE-IDENTICAL to `9fdde1de` (node string-compare); run_all GREEN exit 0 (lens 16/16 + a16 5/5 HARD, monolith 8/8 report-only) AND the line-8 integrity pin NOW KEYED to `7015c22c` (stale-pin residue closed); recheck 17/17 ×2 byte-stable, 0 console/0 pageerrors/0 dialogs, build md5 UNCHANGED pre/post.** **▶ TRADE-POINT `e148c9b7` (working-tree, NOT pushed, 2026-07-02, tester live ×2 READ-ONLY): file-safety GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse (longest non-blob 1217); run_all exit 0 tester-re-run: lens_selfcheck 24/24 HARD (NEW CM8-v2 exhibit-hard + routing negative control, CM6-v2 frozen-arc + live-reversal negative control) + a16 5/5, monolith 8/8 report-only (line 7 re-scoped SPOT LAW ONLY);  **▶ FUNDING-SAMESLOPE `abd35f4b` (2026-07-08, tester focused live ×2 READ-ONLY): file-safety GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse; run_all exit 0 ×2 tester-re-run (lens_selfcheck 35/35 HARD [FE.2/FE.3 retired → FS.1–FS.6, KILLER FS.2b negative-controlled] + a16 5/5, monolith 8/8 report-only), integrity pin keyed `abd35f4b`; 0 console / 0 pageerrors ×2; build md5 `abd35f4b…` UNCHANGED pre/post every run.** |
| 16 | **Warp-with-trades (strong-form)** | HEAD (v27): IMPLEMENTED (α=x·w, β=y·(1−w) conserved; φ recenter; selfcheck WARP a–f PASS; skeptic-verified the unique conservation-consistent trade). On-screen warp subtle (elbow-local by design; cannot match v24's global warp with frozen wings — verified sweep). **Operator promoted over my visual blocker (entry 28) — recorded OVERRIDDEN, not resolved**; anchor-overlay/amplified-warp viz still open | v27 promotion (entry 28) (+ entry-30 TEST-ONLY note) | HEAD — engine PASS; ACCEPTED(operator). **ENTRY-30: composite-ray spread→single-tx at θ*=√(θ₁θ₂) CONFIRMED exactly (residual 0); but premium-controlled warp NOT reproduced (strike not in tradeUpdate) — OPEN -1.** **ENTRY-45 quantification: the band path (the ONLY UI trade) nets sold-premium−bought-premium ⇒ tiny dy ⇒ tiny φ: 1 BTC band nets ≈$1,626 → Δφ 7.4e-3; cumulative 3 BTC/$240k notional → 2.14px max curve shift. Warp invisibility is STRUCTURAL on the band path, compounding the elbow-local subtlety** **ENTRY-46 smoke: unchanged (engine byte-identical) — 0.05-BTC execute Δφ=4.44e-4; preview steppers + w-readout (the sub-pixel-legibility surrogate) verified working** **▶ C16 goal-seek-warp CANDIDATE (`abd46149`, NOT HEAD): the trade-preview now RENDERS a HELD-LENS warp on chart-2 — a 2-BTC sold-CALL leg moves w 0.500→0.536 (γ 1.000→1.154) and the dashed preview curve VISIBLY diverges into an asymmetric skew (separate lower left-shifted peak; zoom-confirmed `ZOOM_pricing_step1.png`), NOT flat/re-registered. First build with an UNMISTAKABLE single-trade warp on screen (vs v27 sub-pixel). ★ FINDING-WARP-DIR: the DRAWN value-warp |Δψ| is largest at the elbow and SHRINKS OTM (θ=1.05→0.2742, θ=4.0→0.0063) while the EXPONENT warp dG(u) GROWS OTM (0.0254→0.1510) — slope-warp grows OTM, value-warp does not (mark ψ→0 OTM); the spec literal "visible separation grows OTM" is NOT what renders — OPEN operator-tier (rolling -6). FINDING-TRADE-AT-STRIKE: entry-127 asset-at-strike model not in this READOUT/VIEW build (rolling -5).** **▶ CONTWARP candidate (`4378bc11`, 2026-06-12, gates HEAD): the C16 held-lens view is SCRAPPED (operator entry 158 + skeptic VERDICT_CONTINUOUS_SKEW); the trade preview now ANIMATES the skew continuously on chart-2 — ~0.8s rAF sweep pre→post, each frame the live lensed read at its own sliding 45°-tangent point (mode 1.0000→0.9729 on a 0.5-BTC one-sided leg), wings steepen (g(θ=4) 0.9774→1.0055), crossed strike dips through ≈0 (θ=0.985: 0.0503→0.0044→0.0423 = the mechanic, skeptic-ruled do-not-fix); lands PX-IDENTICAL (diff 0) to HEAD's static preview; engine block byte-identical; chart-1 inert throughout; tester live ×2 byte-stable, 4/4 PASS.** **▶ A14 AT-STRIKE HEAD (`de28c937`, 2026-06-12 PROMOTED): the AMM SWAP is now AT-STRIKE — pool cash per leg `dy=(wingSign·legSign)·N·K_usd`, K_usd=θ·oracle (the operator's entry-127 asset-at-strike rule, FINDING-TRADE-AT-STRIKE DELIVERED). Single sold-call warp now RISES with strike (1.1×→4×: dy $8,800→$32,000, Δw 0.00544→0.01923 monotone; AS5 Δsteepness==dy/β ✓; 4× dashed warp visibly diverges on chart-2). Buy-leg notional still option-priced (N_buy=V_sell/denom, AS3); reserve guard rejects cash-out ≥90% depth with the $ figures (AS-guard); pool fns byte-identical v24 (AS4). Tester live ×2 byte-stable, 34/34 oracle. ★ FLAGGED-LABEL (NEUTRAL): preview header "cash-conserving ⇒ Δy_net≈0" / "net trader cash @ open" now mislabels the $16,623.29 net pool Δ — intern relabel, rolling -A14a.** **▶ -A14b KURTOSIS-vs-WARP (test on `de28c937`, 2026-06-12): the UNDERLYING swap-warp is kurtosis-FREE — same single sold call (N=0.1, K=$120k) executed at τ=1.0/0.3/0.05 gives Δw=0.0073892 / Δsteepness=dy/β=0.0300 / dy=$12,000 BYTE-IDENTICAL (max spread 0.000e+0); the lensed leg-value V moves with τ but sizes only the buy leg + position value, not the swap — tester live ×2.** **▶ R-218 INVTX candidate (`5fea0e8d`, NOT HEAD): the AMM SWAP is now sized at the FROZEN INVERSE-LENS tx-strike θ_tx** — trader picks the displayed (OTM−) strike, pool swaps at the further-out true (OTM+) θ_tx whose lensed look equals the chosen (u_tx=sign(a)√(a²+2|a|τ)); K_tx frozen at open, reused at close ⇒ reserves round-trip EXACT (single-leg + UI band restore_err 0/0; lens_selfcheck INVTX-2/3). Delivers operator entry-220/215/216 (lens affects the AMM tx). Lens-view fns byte-identical (INVTX-5). tester live ×2. **▶ TRADE-POINT `e148c9b7` (working-tree, NOT pushed, 2026-07-02, tester live 14/14 ×2 + smoke 17/17 ×2 READ-ONLY): THE ANCHORING GAP CLOSES — the LIVE trade path is now the paper's Trade Formula at T = ray∩curve: NEW `tradeUpdateAt(s,dy,ρ)` (ρ=θ_tx/mode) conserves the LOCAL pair α_T,β_T, draws flows from ACTUAL reserves, reads w′ at displaced T; paper exhibit LIVE-DOM-exact (w′=11/21, x′=215/22, y′=11; NOT naive 22/43); ρ=1 ≡ spot law (1.5e-16); spot trio byte-identical; α,β genuinely move off-ATM (iv-β reads 100.2216 on the standard band); frozen-arc close machine-exact incl. intervening trades [⚖ entry 405: frozen-arc close RULED-SUPERSEDED-pending-build — close-(b) first-class trade; rolling -CLOSE405]; per-leg preview animation = the money path (chain rel 0). The "transformation-faithful, anchoring-OPEN" label RETIRES **PROVISIONALLY — pending operator ratification of the 5 spec pinned defaults (rolling -TP339-RATIFY; entry-377 overnight go; skeptic R6 condition; manager/skeptic own the inventory label flip)**. | ✅ RESOLVED 2026-07-03: operator entry 425 'trade poont ok' — defaults RATIFIED (close-half items already re-scoped to -CLOSE405). [manager-backfill]

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

-FUNDING-SAMESLOPE. **★ FUNDING = SAME-SLOPE POOL-vs-ANCHOR DEVIATION (operator entries 458/459/460/462, 2026-07-07).** Entry 458 [verbatim-transcript] (`:3386`) confirmed the TARGET (*"funding lives only out-of-the-money, zero at the money and zero in-the-money, fading smoothly to zero at the ATM edge? YES"*) → **RESOLVED(evidence)-in-`abd35f4b`** (tester A3 leaned profile: OTM lobe, 0 ATM, 0 ITM, ×2). Entry 459 (`:3392`) same-slope METHOD + entry 460 (`:3398`, RULING *"simple english -- this is a regression happpened around 20-30 times"* — build the real deviation + anti-regression HARD GATE) → **RESOLVED(evidence)-in-`abd35f4b`** (FS.2b KILLER: 0 on a symmetric w=½ pool ∀OTM, tester live ×2; old ext/moneyness-proxy weight retired). Entry 462 (`:3410`) [verbatim-transcript] *"dont plug in a formula yet, just get deviation right and note the actual funding formula tbd with hyperliquid funding formula with the proxy … in hext update with the exploit patch"* → deviation-only build DELIVERED + labelled ("Funding (lean; TBD)" live; the "lean" wording RE-LABELLED to "Funding (ray dev; TBD)" in `5ce1a76c` per operator entry 474). **STILL OPEN (rides UPDATE-2): the actual funding FORMULA (HL capped premium→rate) is un-built; and F1 — whether the deviation is oracle-independent AS FINAL — is an operator-tier call.** [tester 2026-07-08]


-TP339-RATIFY. **★ TRADE-POINT BUILD `e148c9b7` — 5 SPEC PINNED DEFAULTS — RESOLVED-by-RULING 2026-07-03: operator entry 425 [verbatim-transcript] `history/operator/2026-06-10_kurtosis-curve-family-brief.md:3191` *"trade poont ok"* — trade-point build RATIFIED (inventory #16 label flip manager/skeptic-executed, commit `9b32de6`). Historical scope note kept: ⚖ entry 405 (close = first-class trade, b) had already re-scoped FLAG-2/FLAG-3 (the CLOSE half) to the close-(b) spec — that half lives on as rolling -CLOSE405 (still OPEN, build parked per entry 424); FLAG-1/4/5 ratified. [tester update 2026-07-03; prior manager-backfill text retained below] [manager-backfill 2026-07-03]
- -CLOSE405. **★ CLOSE = FIRST-CLASS TRADE ON THE LIVE CURVE — RULED (entry 405 [verbatim-transcript] "its to be b"; build go entry 407 "ok fix the HTML for b") — RESOLVED(evidence)-in-`bb2f8230` (UPDATE-1, 2026-07-07): both legs now reverse on the live AMM via `tradeUpdateAt`, the two-case ITM-to-cash branch is retired, close is a first-class trade. Operator go entries 450 "2. yes" / 452 / 455 "yes go on"; tester live 10/10 ×2 + smoke 17/17 ×2. NOTE the no-free-money charge-back is a SEPARATE PARKED item for UPDATE-2 (entries 451/452 "stay parked … CTO note as parked tbd").** [was OPEN (build).] Supersedes-WHEN-BUILT the `e148c9b7` frozen-arc close (`revertArc`) + the two-case ITM-to-cash branch; engine ships (a) until the (b) build lands (spec in flight → R6 → itemized go → build; STOP-ON-RED; x-drain fork = operator-tier). Rows #11/#16 close descriptions to be re-keyed at that build. [manager-backfill 2026-07-03]
   RATIFICATION (2026-07-02) — OPEN, operator-tier.** The entry-339 ordered fix was built under
   the entry-377 overnight go (`[verbatim-transcript]`
   `history/operator/2026-06-10_kurtosis-curve-family-brief.md:2933`: *"anything pending on HTML
   do it while i sleep no questions"*) with the spec's 5 pinned defaults adopted in lieu of
   individual operator confirmations (spec §6: FLAG-1 ρ=θ_tx/mode registration basis; FLAG-2
   frozen-arc exact-reversal close; FLAG-3 undo-own-increment intervening-trade semantics; FLAG-4
   T sits on θ_tx; FLAG-5 legacy bands close via today's path). All 5 documented + measured
   alternatives recorded; build reversible (revert twin `temporal_mvp_v28_lens_reservepoint.html`
   = `7015c22c`). Inventory **#16 stays PROVISIONAL** until the operator ratifies (skeptic R6
   condition; manager/skeptic own the label flip). Tester acceptance PASS 14/14 ×2 + smoke 17/17
   ×2 on the pinned defaults (see the `e148c9b7` entry).

-TP339-CAPTION. **★ STALE α/β-CONSERVATION CAPTIONS on `e148c9b7` (tester finding, 2026-07-02)
   — RESOLVED(evidence)-in-`0e0a0062` (caption/comment slice, tester live recheck 11/11 ×2
   byte-stable, 2026-07-02).** Two on-screen texts asserted the OLD reserve-point law and
   contradicted the page's own live readouts: L1340 Invariant Watch caption ("Identity IV: trades
   preserve α, β … machine-epsilon only" — while iv-beta visibly read 100.2216 after the standard
   off-ATM band) and L1368 Pool State card subtitle ("closed-form · α/β-conserving · Identity IV").
   FIXED in `0e0a0062`: Invariant Watch caption now states the trade-point law (LOCAL pair
   (α_T, β_T) conserved at T; global α, β MOVE on off-ATM trades BY DESIGN; machine-epsilon scoped
   to ρ=1 paths + arc round-trips); Pool State subtitle = "closed-form · trade-point
   (α_T, β_T)-conserving · Identity IV on ρ=1 paths". Live DOM scan: NO "trades preserve" /
   "α/β-conserving" string anywhere on the rendered page (the arb caption's "preserves α, β" is a
   scoped ρ=1-path claim about arbitrageToOracle — true, kept). Evidence
   `evidence/caption_slice_recheck/`.


-B286. **★ ENTRY-286 AMERICAN-FAITHFULNESS QC (operator tester dispatch, 2026-06-26).** Operator
   `[verbatim-transcript]` `history/operator/2026-06-10_kurtosis-curve-family-brief.md:2233`: *"is
   the engine's quoted ITM mark ≥ the true exercise payoff … or does it dip below it? …
   Below-intrinsic anywhere = engine faithfulness bug."* Measured on `dd6fb955`: put mark BELOW
   linear intrinsic from S/K=0.80 down (16/25 spots, max −0.248); empirical seam 0.444, not 0.667
   (`evidence/dexters_lab/oracle_sweep_2026-06-26/`). **Status: RESOLVED(evidence)-in-`9fdde1de`
   (PKG-ITM v2, 2026-07-02)** — spec-§6 acceptance sweep ×2 byte-stable: belowIntrinsic EMPTY at all
   52 DOM readings (g=2 and g=6 columns), seam measured at S/K=0.6667/0.857 (=g/(g+1)), C¹ quotient
   probes within ±0.03; the 0.444-seam finding is SUPERSEDED by the measured 0.667 seam. See the
   `9fdde1de` entry below.

-B289. **★ VOL-DIRECTION REVERSAL vs ENGINE UI TEXT (entry 289, 2026-06-26) — OPEN, part-2 app
   list.** The operator's edited submission paper REVERSED the vol-calibration direction: a
   SHALLOWER curve prices a MORE volatile asset (γ(γ+1)=2r/σ² ⇒ higher vol → lower γ; knob takes a
   LOWER setting for more vol). This supersedes the entry-226-era "steeper = more vol" framing; the
   engine UI text (LARGER M = MORE VOL) now CONTRADICTS the shipped paper. Operator parked it to
   the part-2 app list (`…:2266`). NOT touched by PKG-ITM v2 build (a). **Status:
   RESOLVED(evidence)-in-`a6ca02f3` (display slice, 2026-07-02)** — the SLOPE MULT m UI label now
   reads *"larger m ⇒ steeper everywhere. Vol calibration: MORE volatile asset ⇒ LOWER m (fatter
   wings, richer tails)"* (live DOM read, checks 6a/6b ×2); the old "(more vol)" phrasing is gone;
   geometry sentence intact. Residual (intern-flagged, comment-only): engine comments L1622/L2337
   still carry the old phrasing — non-rendered, cleanup queued. See the `a6ca02f3` entry below.

-B295. **★ BUILD (b) DISPLAY SLICE + UNIFICATION (entries 295/296, 2026-07-02) — OPEN/queued.**
   Operator `[verbatim-transcript]` `…:2322`: *"1. if we have a toggle from % terms to $ terms for
   the second graph, and 2. if we don't cap the wings and let them cross over etc. … 3 [open/close
   symmetry] … 4 [extend the anchor curve too and have ITM funding]"*; sharpened `…:2330`: *"extend
   the entire OTM machinery into ITM (with the right natural extension for pool curve and anchor
   curve)"*. Excluded from build (a) by spec scope (research-lead study + operator gate).
   **Status: PARTIAL — items 1+2 (the %→$ toggle + uncapped crossing wings, everything read off
   the ONE markLensed curve) DELIVERED-in-`a6ca02f3` (display slice, 2026-07-02, tester live ×2;
   operator go entry 301 "ok to all still opens"); items 3 (open/close symmetry) + 4 (anchor-curve
   extension / ITM funding) REMAIN OPEN — the funding-semantics extension is real cash-flow
   semantics, itemized scope awaiting its own R2 one-word go (entry-301 manager context).**

-B301-DASH. **★ $-VIEW STEEP-TAIL DASH SWALLOW (tester finding on `a6ca02f3`, 2026-07-02) — the
   $-view put parity tail renders effectively SOLID.** [#7 depiction] In the $ view at M=2 the put
   intrinsic/parity tail (seam S/K=0.667 → the 1.25×S clamp exit, φ≈56–66°) has `setLineDash([5,3])`
   applied in code, but the segment is steep (~$40k→$100k over ~90px) and anti-aliasing swallows
   ~70% of the dash gaps: true per-pixel row coverage 0.9647 (a legible dash reads <0.9; the $ call
   tail reads 0.51, the % tails ~0.54). At 1× zoom the tail reads as a pool-quoted SOLID line — the
   pool-quote vs escrow-claim distinction (the dash's semantic purpose per the new legend) is
   illegible exactly on the unbounded ITM put tail. Reproduced ×2 byte-stable (check 2e); evidence
   `evidence/display_slice_acceptance/A_zoom_usd_puttail.png` (6× magnification). Draw-layer-only
   fix candidate (intern): dash period scaled for steep segments (e.g. [8,6]) or screen-space
   dashing. NOT an operator objection (operator has not seen this build); tester-raised. **Status:
   RESOLVED(evidence)-in-`7015c22c` (2026-07-02) — screen-space [8,6]·cssScale tail dash +
   3·yMax coordinate clamp (draw-layer only, engine+state byte-identical to `9fdde1de`): put-tail
   row coverage 0.9647→0.4941 (legible, visually confirmed at 6×), all in-frame geometry anchors
   exact vs `a6ca02f3`, recheck 17/17 ×2 byte-stable (`RECHECK_*` evidence, addendum in the
   `a6ca02f3` entry). Display-slice acceptance = PASS.**

-R218τ. **★ τ-DIRECTION INVERTS operator entry-218 (invtx candidate `5fea0e8d`) — the one OPEN operator objection on this build.** Operator `[verbatim-transcript]` `history/operator/2026-06-10_kurtosis-curve-family-brief.md:1743` (entry 218, 06:15 UTC), answering the manager's yes/no "should a sharper warp make a trade land further out-of-the-money": *"yes"*. **The R-218 invtx build ships the OPPOSITE** — tester live ×2: at a fixed chosen θ=1.5 the frozen inverse-lens θ_tx lands at 1.573× (τ0.05) / 1.894× (τ0.3) / 2.685× (τ1.0) / 5.011× (τ3.0) of the mode ⇒ **sharper τ ⇒ θ_tx LESS far out** (lens_selfcheck INVTX-4, in-code comment, and the skeptic verdict all document this as a known side-effect of today's h_τ). The CORE mechanic (entry 220 *"lens shows otm+ is otm-; so when you choose otm- it transact at otm+"*, L1765) IS delivered — only the τ-sensitivity DIRECTION conflicts. A fix requires a lens-shape change (skeptic Choice C, a CURVE change ⇒ operator-tier), not a silent flip. **Status: RESOLVED(evidence)-in-`8f897edc` (CONSTMULT candidate, 2026-06-13)** — operator entries 229/231 redefined the curve as a constant slope multiplier; the new tx-strike map θ_tx=mode·(chosen/mode)^m is MONOTONE increasing in m (2×→4×→8× of mode at m=1/2/3) ⇒ a sharper/bigger knob lands the trade STRICTLY FURTHER OUT, the operator-ruled direction (entry 218/222/226). Tester live ×2 + run_all CM7 (polarity LOCKED). The lens-shape change happened (operator-ordered, not a silent flip).

-A14b. **★ KURTOSIS-WARP-TEST (operator entry 203, NOT yet tested) — the warp-magnitude-vs-KURTOSIS
   half of the operator's question is still owed.** Operator `[verbatim-transcript]`
   `history/operator/2026-06-10_kurtosis-curve-family-brief.md:1582`: *"im not infront of laptop, so
   did u test thr tiings is mentioned about curve warp magbitude otm kurtosis etc..?"*; entries 184/185
   (`…:1434`): *"if i make kurtosis steeper (less value in the html), that would imply … even more warp
   not less right"*. The A14 smoke ANSWERED the warp-magnitude-vs-OTM half (Item 1: warp rises with
   strike, AS5) but did NOT test the warp-MAGNITUDE-vs-τ coupling the operator describes (steeper τ ⇒
   a strike reads further-OTM ⇒ more warp). The A14 run confirmed τ RESHAPES chart-2 (read-side) but
   not the magnitude coupling. **Status: RESOLVED(evidence) 2026-06-12 — targeted live test ×2 byte-stable (`evidence/v28_a14_kurtosis/`, harness `pw_v28_a14_kurtosis.mjs`): UNDERLYING swap-warp kurtosis-FREE (Δw/Δsteepness byte-identical across τ=1.0/0.3/0.05); SEEN chart-2 reshape kurtosis-DEPENDENT (peak/near-money 0.453→0.660→0.794 as τ sharpens). The operator's "sharper ⇒ more warp" holds for the PEAK/near-money SEEN warp; the literal "further-OTM ⇒ more warp" INVERTS (fixed-OTM reshape shrinks) — one operator-tier clarification flagged to manager (which reading of entry-185 to encode).**

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

- **★ FUNDING-THROUGH-LENS — RULED (entry 232 [verbatim-transcript], `history/operator/2026-06-10_kurtosis-curve-family-brief.md:1865`, 2026-06-13 11:32 UTC):** *"funding slope deviation thing would be as seej thru the lens"* — in reply to the manager's funding decision (A decouple / B keep m-coupled / C v24 ±2 / D hold), raised by the skeptic's completeness-audit FLAG-OMISSION #1 (funding scales with the kurtosis knob). The operator RULES funding is a through-the-lens quantity ⇒ option B: funding ∝ ±g_loc = ±m·γ (m-coupled, KEPT — not a defect to decouple). **CONFIRMED-behaving on HEAD `8f897edc`** (tester live ×2, 2026-06-13 inherited-contracts pass): funding SCALES with m (call θ=1.5 +3.68e-4→+5.06e-4 at m=1→4, sub-linear), SIGN FLIPS call(+)/put(−), all finite/sane. FLAG-OMISSION #1 RESOLVED-BY-RULING.

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


## A14 AT-STRIKE HEAD (`de28c937`) — targeted -A14b KURTOSIS-vs-WARP live test (entries 184/185/203)   [status: verification on HEAD `de28c937` (UNCHANGED); resolves the owed -A14b OPEN item; READ-ONLY, no engine change]
SCOPE: a TARGETED live test of the one half the A14 §8 smoke left owed — how curve-warp MAGNITUDE relates to KURTOSIS (the lens τ). No engine edit; same HEAD `de28c937` (md5 unchanged post-run). Two halves of an honest nuance, both confirmed live ×2 byte-stable:
FEATURES (inventory #s touched — measurement only, no behavioral delta):
  - **#16 (warp-with-trades) — UNDERLYING swap-warp is kurtosis-FREE (confirmed).** `executeLeg`'s pool swap `dy = (wingSign·legSign)·N·(θ·oracle)` has NO τ argument (engine L1780-81). Live, same single sold call N=0.1, K=$120,000 (θ=1.5), oracle 80000, executed at τ = 1.0 / 0.3 / 0.05: **dy = $12,000.00 IDENTICAL all three**; **Δw = 0.0073891626 IDENTICAL all three**; **Δsteepness = dy/β = 0.030000 IDENTICAL all three**; dxReserve = −0.145631068 identical. max|Δdy| across τ = **0.000e+0**, max|Δw spread| = **0.000e+0**. (Contrast logged: the LENSED leg value V DOES move with τ — 0.02976/0.01930/0.01675 at τ 1.0/0.3/0.05 — but it sizes only the BUY-leg notional and the position value, NOT the swap dy. The kurtosis knob does not touch the swap.)
  - **#3 (kurtosis knob τ) / #2 (SEEN warp) — the chart-2 option-value reshape DOES depend on kurtosis (confirmed), with a direction nuance.** Same FIXED trade (sold call N=0.5, K=$120k, oracle 80000) → τ-free pool move dy=$60,000, mode sNorm 1.000000→0.869565. Read through the lens (`ψ = markLensed(call, θ, sNorm, gLoc(pool,θ,τ))`, pre=live pool/live mode, post=preview pool/shifted mode), the option-value reshape |ψ_post−ψ_pre| at τ = 1.0 / 0.3 / 0.05:
    - **PEAK reshape (at the mode, θ≈1.0 / $80k) GROWS with sharper kurtosis: 0.45311 → 0.65993 → 0.79440** (dense θ-sweep confirms the peak sits AT θ=1.0 for all three τ). This is the operator's intuition CONFIRMED: a sharper lens ⇒ a bigger SEEN warp near the money.
    - **At a FIXED OTM strike the reshape SHRINKS with sharper kurtosis** — θ=1.25 ($100k): 0.14758 → 0.08964 → 0.04478; θ=1.5 ($120k): 0.08613 → 0.04881 → 0.03584; θ=2.0 ($160k): 0.04563 → 0.02971 → 0.02662; θ=4.0 ($320k): 0.01613 → 0.01358 → 0.01327. A sharper lens pins both pre- and post- OTM values toward the low asymptote ("less value in the html" — the operator's own phrasing, entry 185), so their GAP at a fixed OTM strike narrows.
    - Rendered (chart-2 canvas): the curves at τ=0.05 collapse to a narrow ATM spike (big mode separation, wings flat), at τ=1.0 spread into broad rounded humps with the post-trade dashed curve diverging across a WIDE strike band — visually consistent (`{A,B}_item2_tau{1,0p3,0p05}.png`). Whole-curve pxdiff is near-saturated (2635/2651/2689) and not the discriminating metric; the analytic per-strike gap is.
    - On-screen quoted band slippage (a live readout that moves with τ): τ1.0 = **"11.8895 % · ≈ $3270.96"**, τ0.3 = **"12.0849 % · ≈ $3312.10"**, τ0.05 = **"12.8369 % · ≈ $3494.36"** (monotone, sharper τ ⇒ larger).
  - **#15 (file-safety) — GREEN:** build md5 `de28c937…` UNCHANGED post-run (read-only); webp L74 `ab663f5c…`, svg L1060 `c505b08a…`; 3 scripts parse; 0 console / 0 pageerrors both runs.
  **NONE BEYOND** — no engine bytes changed; this is a measurement run. #1/#4/#5/#6/#7/#8/#9/#10/#11/#12/#13/#14 untouched.
DESIRABLE (tester-confirmed live ×2 byte-stable — RUN_LOG_runA == runB modulo header):
  - [#16] **The UNDERLYING swap-warp is kurtosis-INDEPENDENT — proven live:** Δw / Δsteepness byte-identical across τ=1.0/0.3/0.05 (max spread 0.000e+0). The at-strike swap (notional × dollar strike) carries no τ — exactly as the at-strike rewrite intended.
  - [#2/#3] **The SEEN warp (chart-2 reshape) DOES depend on kurtosis — proven live:** the near-money / mode reshape grows monotonically as τ sharpens (peak 0.453→0.660→0.794).
UNDESIRABLE: none — measurement run, no new behavior.
NEUTRAL (the honest nuance the operator must hear, stated plainly):
  - The operator's entry-185 framing ("sharper kurtosis ⇒ a strike reads further-OTM ⇒ MORE warp") is **TRUE for the peak/near-money SEEN warp** (it grows with sharpness) but **the literal "more warp at a fixed FURTHER-OTM strike" is the OPPOSITE** — at a fixed OTM strike the SEEN reshape SHRINKS as τ sharpens, because the sharper lens pins both pre/post OTM values to the low asymptote (their gap narrows). The big SEEN warp CONCENTRATES at the money under a sharp lens rather than spreading out the wings. The UNDERLYING swap-warp is kurtosis-independent throughout.
OPERATOR-VOICE (scan `history/operator/2026-06-10_kurtosis-curve-family-brief.md` entries 184/185/203 [verbatim-transcript]):
  - **RESOLVED(evidence) — the entry-203 KURTOSIS half (L1582 [verbatim-transcript]):** *"im not infront of laptop, so did u test thr tiings is mentioned about curve warp magbitude otm kurtosis etc..?"* — the kurtosis half is now TESTED live (Items 1+2 above). The vs-OTM half was answered by the A14 smoke (AS5); this run answers the vs-KURTOSIS half. -A14b RESOLVED(evidence).
  - **PARTIALLY-CONFIRMED / CLARIFIED — entries 184/185 (L1434 [verbatim-transcript]):** *"if i make kurtosis steeper (less value in the html), that would imply … even more warp not less right"* — **"less value in the html" CONFIRMED exactly** (OTM ψ drops as τ sharpens: θ=1.5 ψ_pre 0.298→0.193→0.168). **"even more warp" CONFIRMED for the near-money/mode SEEN warp** (peak 0.453→0.660→0.794) but **CORRECTED for a fixed-OTM strike** (reshape SHRINKS there: θ=1.25 0.148→0.090→0.045). The UNDERLYING swap-warp is unchanged by kurtosis. So: sharper kurtosis ⇒ more SEEN warp near the money, concentrated rather than spread OTM; the swap itself is kurtosis-free. **Escalate to the operator (via manager): the intuition holds for the peak SEEN warp; the "further-OTM" direction inverts — operator should confirm which reading he means before it's encoded.**
EVIDENCE: `evidence/v28_a14_kurtosis/RUN_LOG_runA.txt` == `RUN_LOG_runB.txt` (byte-stable modulo header; 0 console / 0 pageerrors both runs) + `{A,B}_item2_tau{1,0p3,0p05}.png` (chart-2 sharp-spike vs broad-hump renders) + dense θ-sweep probe (peak-at-θ=1.0 all τ, inline in this entry). Harness `engine/verify/pw_v28_a14_kurtosis.mjs`, live Playwright ×2, READ-ONLY (build md5 `de28c937…` unchanged). File-safety GREEN (blobs L74 `ab663f5c…` / L1060 `c505b08a…`; 3 scripts parse).
**VERDICT: -A14b RESOLVED(evidence) — both halves confirmed live ×2 byte-stable. (1) UNDERLYING swap-warp kurtosis-FREE (Δw/Δsteepness byte-identical across τ=1.0/0.3/0.05); (2) SEEN warp kurtosis-DEPENDENT (peak/near-money reshape 0.453→0.660→0.794 as τ sharpens). HONEST NUANCE for the operator: "sharper ⇒ more warp" holds for the PEAK/near-money SEEN warp; the literal "further-OTM ⇒ more warp" INVERTS (fixed-OTM reshape shrinks). HAND-BACK: one operator-tier clarification to the manager (which reading of entry-185 to encode).**

**Table rows updated:** #16 (UNDERLYING swap-warp proven kurtosis-independent — Δw/Δsteepness byte-identical across τ); #2/#3 (SEEN chart-2 reshape proven kurtosis-dependent, peak grows with sharpness; direction nuance recorded). **Rolling list:** -A14b KURTOSIS-WARP-TEST → RESOLVED(evidence). **Reconciliation list:** KURTOSIS-WARP-TEST row → RESOLVED-in-test-on-`de28c937` (+ operator-clarification carried).


## A14 AT-STRIKE HEAD (`de28c937`) → R-218 INVERSE-LENS TX-STRIKE candidate `temporal_mvp_v28_lens_invtx.html` (`5fea0e8d82ea85270e97ede71cf8e9ae`)   [status: PROMOTION CANDIDATE — gates HEAD promotion on this smoke + the skeptic; tester live Playwright ×2 byte-stable; manager pre-verify lens_selfcheck 39/39]
SCOPE (operator entries 214/215/216/218/220 [verbatim-transcript]; skeptic VERDICT_lens_tx_strike / VERDICT_lens_R218_consistency, Choice B): the AMM swap is now sized at the **FROZEN inverse-lens transaction strike θ_tx** — the trader picks a strike on the DISPLAYED (lensed) chart and the pool swaps at the TRUE further-out strike whose lensed APPEARANCE equals the chosen one (u_tx = sign(a)·√(a²+2|a|τ), a=ln(chosen/mode); θ_tx=mode·e^{u_tx}; K_tx=θ_tx·oracle frozen on the leg at open, reused verbatim at close). **Settlement still pays at the CHOSEN strike** (two-strike). View/chart-2/funding/lens layer byte-identical to HEAD (gLoc/markLensed/legPrice/lensU/hTau/hpTau identical — lens_selfcheck INVTX-5). The ONE engine delta vs `de28c937`: `executeLeg` dy and the reserve guard now key off K_tx (the further-out swap), not K_usd.
FEATURES (inventory #s touched, per docs/feature_inventory.md):
  - **#16 (warp-with-trades / AMM tx) — CHANGED: swap sized at the inverse-lens tx-strike.** `executeLeg` `dy=(wingSign·legSign)·N·K_tx` (engine L1805), K_tx frozen at open (L1802-03), close reverses with the SAME frozen K_tx (L2077-85) ⇒ pool reserves round-trip EXACT. Single-leg open+close restore (live ×2): sold CALL chosen θ=1.5 → θ_tx=1.8936 (K_tx=$151,490.92 vs chosen $120,000), swap dy=$15,149.09; **restore_err_x=0 / restore_err_y=0**. Sold PUT chosen θ=0.5 → θ_tx=0.3880 (K_tx=$31,039.90), swap dy=−$3,103.99; restore_err 0/0. UI band open→close: pool (10, $800,000) → moved $9,474.67 on open → restored to (10, $800,000) exactly (err 0/0).
  - **#10 (slippage / reserve-depth guard) — CHANGED: capacity keyed off N·K_tx (the bigger swap).** Reserve guard `if (dy<0) N·K_tx >= 0.9·depth ⇒ reject` (L1811-16) with verbatim $ figures, NEVER a silent cap, never a mutated N. Far-OTM cash-out (bought CALL θ=2.0, K=$160k → θ_tx=2.5773, K_tx=$206,186): max N **2.25 → 1.746** (capacity shrinks **0.776×**). At N=1.998: N·chosen_K=$319,680 (under 0.9·depth=$360k — an at-strike build accepts) but N·K_tx=$411,959 (over) ⇒ verbatim reject *"At-strike cash $411959.48 exceeds 90% of pool cash depth $400000.00 — trade rejected."*; smaller N=1.397 executes (no silent cap). LIVE engine reproduced the reject at N·K_tx=$380,000.
  - **#7 (ITM settlement) — settlement at the CHOSEN strike confirmed.** Sold-call-driven ITM (oracle 80k→300k, arb): close → settled_cash_leg='sold' valued at the chosen K_inner=$120,000 (θ=1.5) while the pool swapped/reversed at the frozen K_tx=$151,490.92; raw_net=−4.51e-3 finite, trader_payout=−$9.18 finite, no throw. The two-strike semantics (swap at θ_tx, settle at chosen) verified.
  - **#3 (kurtosis knob τ) — direction OBSERVED (entry-218 conflict surface).** At a fixed chosen θ=1.5, θ_tx lands at: **τ0.05→1.573× / τ0.3→1.894× / τ1.0→2.685× / τ3.0→5.011×** of the mode (K_tx $125,806 / $151,491 / $214,780 / $400,858). i.e. **a SHARPER lens (smaller τ) ⇒ θ_tx LESS far out; a FLATTER lens ⇒ FURTHER out.** This is the documented (lens_selfcheck INVTX-4) τ-direction of today's h_τ. The τ stepper still reshapes chart-2 (0.3→2.0 = 6,545px; 0.3→0.35 step = 3,893px); chart-1 INERT to τ (0px).
  - **#15 (file-safety) — GREEN:** build md5 `5fea0e8d…` UNCHANGED post-run; webp L74 `ab663f5c…`, svg L1060 `c505b08a…` (sed line-md5); 3 `<script>` parse; lens_selfcheck **39 PASS / 0 FAIL**; 0 console / 0 pageerrors both runs.
  **NONE BEYOND** — #1/#2/#4/#5/#6/#8/#9/#11/#12/#13/#14 untouched (the lens-view, Balancer base, carry, rebase, pricing-law, funding, dollar pipe all byte-identical to HEAD; INVTX-5 confirms the view-lens fns are identical).
DESIRABLE (tester-confirmed live ×2 byte-stable — RUN_LOG_runA == runB modulo header):
  - [#16] **Frozen-θ_tx round-trip is EXACT** — single-leg AND UI band open→close restore reserves to entry (err 0/0); the freeze is load-bearing (INVTX-2: a K_inner-fallback recompute LEAKS $5.85e4; INVTX-3: single-leg open+reverse Σdy==0 ⇒ no free money).
  - [#16] **The lens now affects the AMM tx** — this is the architecture the operator demanded (entry 215 "its supposed to change the effective strike thats the whole point from amm tx standpoint"; entry 220 below). The chosen displayed strike maps to a further-out swap.
  - [#10] **Capacity shrinks for far-OTM, honestly** — the reject fires EARLIER (smaller N) than an at-strike build, with the $ depth numbers, no silent cap.
  - [#7] **Two-strike settlement** — pays at the chosen strike while financing at θ_tx; finite payout.
UNDESIRABLE:
  - **[#3] τ-DIRECTION INVERTS the operator's entry-218 ruling (OPEN, operator-tier — the one thing the manager must surface).** Operator entry 218 (06:15 UTC [verbatim-transcript] L1743) answered YES to "should a sharper warp make a trade land further out-of-the-money." **This build ships the OPPOSITE: sharper τ ⇒ θ_tx LESS far** (1.573× at τ0.05 vs 5.011× at τ3.0). The code comment + lens_selfcheck INVTX-4 + skeptic verdict all DOCUMENT this as a known side-effect of today's h_τ that a future lens-shape change (skeptic Choice C, operator-tier, a curve change) must flip knowingly — NOT a silent fix. So the CORE mechanic (entry 220) is delivered but the τ-direction half (entry 218) is unsatisfied and explicitly deferred. **NOT reconciled — escalate to the operator via the manager.**
NEUTRAL:
  - For a sold PUT the inverse lens maps the chosen strike to a θ_tx CLOSER to 0 (further OTM on the put wing); K_tx < chosen K so the put-side cash-out swap is SMALLER, not bigger — the capacity-shrink is a CALL/bought-cash-out-side effect. (Both are "further OTM" in moneyness terms; the dollar-size direction differs by wing.)
OPERATOR-VOICE (scan `history/operator/2026-06-10_kurtosis-curve-family-brief.md`, the R-218 exchange 2026-06-13; entry-199 individual-options framing [verbatim-transcript]):
  - **RULED — entry 220 (06:39 UTC, L1765 [verbatim-transcript], the final flat statement of the mechanic):** *"lens shows otm + is otm -; so when you choose otm - it transact at otm + thats fucking it"* — DELIVERED by this build: the trader chooses the displayed (OTM−) strike and the pool transacts at the further-out (OTM+, θ_tx) strike. Settlement at the chosen strike. (#16/#7)
  - **RULED — entry 216 (05:57 UTC, L1727 [verbatim-transcript]):** *"no you transact at what looks like the true strike"* — i.e. you transact at the true further-out point whose lensed look equals the chosen display; consistent with the θ_tx mapping (chosen = the lensed appearance). DELIVERED.
  - **RULED — entry 215 (03:42 UTC, L1685 [verbatim-transcript]):** *"if the lens isn't affecting the trade being done on the AMM … its supposed to change the effective strike thats the whole point from amm tx standpoint"* — the prior at-strike build (`de28c937`) sized the swap at the RAW chosen strike, which the operator (entry 214, 03:41 UTC L1673 [verbatim-transcript] *"you fucking gaslighting fuck, you disregarded the fucking thing about seeing through the lens"*) flagged as contradicting the architecture. This build RESOLVES that: the lens now shifts the effective AMM strike. RESOLVED(evidence — INVTX-5 lens identical + swap at θ_tx).
  - **OPEN — entry 218 (06:15 UTC, L1743 [verbatim-transcript]) τ-direction:** YES to "sharper warp ⇒ trade lands further OTM." **This build does the OPPOSITE (sharper ⇒ closer); see UNDESIRABLE [#3].** An operator objection may only be marked resolved with evidence of resolution — there is none; the build's own comment defers it to a future curve change (operator-tier). **STATUS: OPEN, escalate.** (The operator went back and forth on the direction reasoning — entries 212 "sharper warp makes OTM+ look OTM−" / 213 "you may actually be right" / 214b "further OTMs look closer through the warp" / 215b "transact further OTM than it appears" — and landed on entry 218 YES = sharper⇒further. The build ships sharper⇒closer. The conflict is real and unresolved.)
  - **CONTEXT — entry 199 (L1550 [verbatim-transcript]):** *"and we think of individual options in this contexy not spreads"* — this smoke focused the round-trip / settlement / capacity probes on INDIVIDUAL (single-leg) options (engine executeLeg per leg), per the operator's narrowing; the UI band path was used only to corroborate the reserve round-trip.
EVIDENCE: `evidence/v28_invtx/INDEX.txt` + `RUN_LOG_runA.txt` == `RUN_LOG_runB.txt` (byte-stable modulo header; 0 console / 0 pageerrors both runs) + `{A,B}_item4_chart2.png` (chart-2 after τ-reshape + sweep). Harness `engine/verify/pw_v28_invtx_smoke.mjs`, live Playwright ×2, READ-ONLY (build md5 `5fea0e8d…` unchanged post-run). File-safety GREEN (blobs L74 `ab663f5c…` / L1060 `c505b08a…`; 3 scripts parse; lens_selfcheck 39/39).
**VERDICT: 4/5 items PASS + Item-5 OBSERVED ⇒ smoke = PASS (mechanics sound, reserves restore exact, settlement at chosen strike, capacity shrinks honestly, no regression, 0 errors). ONE STANDING ESCALATION (does NOT block the smoke, but the operator must rule before/at promotion): the τ-direction ships OPPOSITE to operator entry-218's YES (sharper⇒closer here vs sharper⇒further ruled). Flag to manager; promotion also waits on the skeptic.**

**Table rows updated:** #16 (AMM swap now at the frozen inverse-lens tx-strike θ_tx; round-trip exact); #10 (reserve-depth guard keyed off N·K_tx — capacity shrinks far-OTM); #7 (settlement at the chosen strike while financing at θ_tx); #3 (τ-direction of θ_tx observed — sharper⇒closer); #15 (file-safety GREEN on the candidate, md5 `5fea0e8d…`, lens_selfcheck 39/39). **Rolling list:** +OPEN -R218τ (τ-direction inverts entry-218). **Reconciliation list:** +R-218 LENS-AFFECTS-TX → RESOLVED-in-`5fea0e8d` (entries 215/216/220); +R-218 τ-DIRECTION-vs-ENTRY-218 → OPEN.

---


## v28-lens HEAD (`5fea0e8d` invtx) → CONSTMULT candidate `temporal_mvp_v28_lens_constmult.html` (`8f897edcad49c73853096a05e7ec233d`)   [status: PROMOTION CANDIDATE — gates HEAD promotion on this STANDING UI SMOKE-PASS; tester live Playwright ×2 byte-stable; promotion also waits on the skeptic gate-audit]

SCOPE (operator entries 229/231 [verbatim-transcript]; skeptic VERDICT_constant_slope_multiplier_entry229_2026-06-13, manager pre-verify run_all green): the kurtosis/vol lens is REDEFINED as a **CONSTANT SLOPE MULTIPLIER m** — it REPLACES the position-dependent elbow-rounding/frozen-γ design (old h_τ(u)=√(τ²+u²)−τ) AND the inverse-lens √ tx-strike map of `5fea0e8d`. The option/value curve (chart-2) now has the SAME power-law exponent g_loc = m·γ at EVERY strike (NO elbow, NO flat-top, NO ATM cusp). The knob value flows through the existing `tau` parameter slot everywhere (state.m; UI control relabeled "SLOPE MULT m", #m-input, min 1 / max 6 / step 0.25 / default 1). The tx-strike map is now θ_tx = mode·(chosen/mode)^m (m=1 ⇒ θ_tx=chosen; bigger m ⇒ further out, SAME direction as steeper g_loc — polarity LOCKED). Pool curve (tradeUpdate/arbitrageToOracle/rebase) byte-identical to v24 (unchanged). ~154 diff lines vs the invtx HEAD; the engine delta is gLoc/markLensed/lensU + the executeLeg tx-strike map + the m-input wiring.

FEATURES: #3 (kurtosis knob → constant slope multiplier m), #16 (warp-with-trades / tx-strike map θ_tx=mode·(chosen/mode)^m), #2 (curve warp w(u) — chart-2 reshape now uniform m·γ), #6 (pricing law value∝S^(−γ) — wings exact power-laws at exponent m·γ), #7 (ITM smooth-paste with strike-local g=m·γ; settle at chosen strike), #10 (slippage / reserve-depth guard keyed off N·K_tx, capacity shrinks far-OTM), #1 + pool fns #regression (v24 byte-identical), #15 (file-safety). **None beyond** (#4 carry, #5 rebase, #8 strike-reg, #9 funding-routing, #11 dollar-pipe, #12 getMP_raw gotcha, #13 solvency, #14 Esscher — unchanged from the lens line).

DESIRABLE:
  - **[#3 / #2 / Item 1] Crank m → chart-2 STEEPENS at every strike, exponent EXACTLY m·γ, NO elbow / NO flat-top / NO ATM cusp.** Tester live ×2: default pool w=0.5/γ=1. g_loc over an 11-strike ladder (0.25× mode … 4× mode) is CONSTANT at m·γ for each m — spread = 0.00e+0 across strikes at m=1 (g=1), m=2 (g=2), m=3 (g=3). Chart-2 redraws on every m step (canvas-pricing 3 distinct hashes; lit px 9620/9561/9510 for m=1/2/3). Rendered shape probe: ATM value <1 at every m (0.250 / 0.148 / 0.105 for m=1/2/3), call arm == put arm at the mode (C⁰ continuous — NO cusp, NO peak=1, NO flat-top); both wings decay as exact power-laws and the whole curve pulls down/steepens as m rises (2× call value 0.1667→0.0741→0.0527). VISUAL evidence `VIS_chart2_m1.png` (apex ~0.25) vs `VIS_chart2_m3.png` (apex ~0.105, steeper wings) — the operator's entry-226 demand "steeper when I set for higher vol" SEEN. run_all CM1/CM2/CM3 corroborate (g_loc=m·γ constant maxAbsErr=0; wings exact power-law exponent m·γ, monotone, bounded [0,1], no floor/saturation).
  - **[#3 / Item 2] m=1 == the plain v24 power-law (steepness γ); the trusted base at the knob's neutral point.** g_loc(2×,m=1)=1.00000000 == γ=1.00000000 (exact). m=1 trade lands at the chosen strike (chosen_theta=2.000000 == theta_tx=2.000000, K_usd==K_tx=$160,000, dy=$8,000). run_all CM1 "m=1 ⇒ g_loc=γ everywhere"=true and CM5 "m=1 ⇒ θ_tx==chosen"=true corroborate. Pool fns byte-identical to v24 (CM8).
  - **[#16 / Item 3] Trade goes FURTHER OUT with m; bigger swap ⇒ reserve-depth reject fires EARLIER, with the $ depth numbers, no silent cap.** Tester live ×2: a 2× chosen call → theta_tx 2.000×(m1) / 4.000×(m2) / 8.000×(m3) of mode (K_tx $160k/$320k/$640k; the operator's "2× pick at m=2 swaps at 4×" SEEN). Reserve reject (buy-call cash-OUT, N=0.7, chosen=2× mode, pool cash depth $400,000): m=1 N·K_tx=$112,000 / m=1.5 $158,392 / m=2 $224,000 / m=2.5 $316,784 EXECUTE; m=3 REJECTS verbatim "At-strike cash $448000.00 exceeds 90% of pool cash depth $400000.00 — trade rejected." — the bigger swap trips the 90%-of-depth guard earlier as m grows; N never mutated, no silent cap. run_all CM7 "g_loc↑ AND θ_tx↑ SAME direction, polarity LOCKED" corroborates.
  - **[#16 / #7 / Item 4] Open→close reserves restore EXACT (frozen θ_tx round-trip); settlement pays at the CHOSEN strike, not θ_tx.** Analytic single-leg (m=2): open dy=$16,000 at K_tx=$320,000 (further), reverse with −dy restores x,y to 10.00000000 / 800000.00000000 (|dx|=|dy|=0.000e+0). UI band round-trip via #btn-execute → Store.closeBand (m=2, sold-call $120k / bought-put $48k, N=0.03): reserves restore |dx|=1.78e-15 / |dy|=0.000e+0, raw_net=7.75e-5 finite. SETTLE basis = K_usd (chosen) $160,000 while the swap finances at K_tx (further) $320,000 — DISTINCT (two-strike semantics preserved). run_all CM6 "frozen θ_tx round-trip reserves restore exact + single-leg open+reverse Σdy==0 (no free money)" corroborates (x/y-err 0.00e+0 both wings).
  - **[#15] File-safety GREEN** — build md5 `8f897edc…` UNCHANGED post-run ×2 (READ-ONLY); blobs canonical webp L74 `ab663f5c…` / svg L1060 `c505b08a…`; 3 scripts parse; run_all = lens_selfcheck **13/0** + a16_atm_gate **5/0** (GH/(W) suites N/A on the v24-base lens line), exit 0; 0 console / 0 pageerrors both runs.

UNDESIRABLE:
  - **[#3 / #16] R-218 τ-DIRECTION — RECONCILED-in-`8f897edc`.** The standing OPEN -R218τ (the invtx `5fea0e8d` build landed sharper⇒CLOSER, INVERTING operator entry-218/222 "sharper ⇒ further OTM") is RESOLVED by this redefinition: θ_tx = mode·(chosen/mode)^m is MONOTONE increasing in m (2×→4×→8× of mode at m=1/2/3), so a bigger multiplier lands the trade STRICTLY FURTHER OUT — the operator-ruled direction. No flip, no opposite-sign coupling. Tester live ×2 + run_all CM7.
  - NEUTRAL/carry-forward only otherwise (see NEUTRAL); no NEW regression observed.

NEUTRAL:
  - Knob RENAMED on the UI: "SLOPE MULT m" (was "KURTOSIS τ"); aid label "constant slope-multiplier knob m · STATIC (vol-set at deploy) · the option/value curve has steepness m·γ at EVERY strike. m=1 = plain curve (γ); larger m ⇒ steeper everywhere (more vol)." Range/step/default 1–6 / 0.25 / 1 (was 0.05–3 / 0.05 / 0.3). The internal state slot is still `state.m` threaded through the `tau` parameter name in engine fn signatures (no behavioral consequence; documented in-code).
  - Funding reads 0/0 on the DEFAULT pool (w=0.5 ⇒ S=mp/oracle≡1 at the symmetric ATM) — NOT a defect (same positive-control issue as every prior lens run). Verified alive on a steepened pool (w=0.6429/γ=1.8): fundingCall +1.00e-4/+1.12e-4/+1.17e-4 and fundingPut equal-and-opposite at m=1/2/3, all finite, correct call>0/put<0 sign, m-dependent. [#9 unchanged routing.]
  - Continuous warp sweep still ANIMATES on chart-2 (48–49 distinct rAF frames over ~1s on a 0.4-BTC band preview — the CONTWARP rAF wrapper is retained). chart-1 (canvas-curve, plain-v24 pool) is INERT to m (band cleared: byte-identical canvas hash across m=1/3/6). Settlement ITM path works (m=2, sold-call driven ITM via oracle×2.5 + arb → settled_cash_leg='sold', raw_net=−3.20e-3 finite).

OPERATOR-VOICE:
  - **RULED — entry 229 (08:18 UTC, L1841 [verbatim-transcript]):** *"fuck gang. its literally just a constant slope multiplier"* — the curve redefinition this build implements. The lens is a constant slope multiplier; g_loc=m·γ at every strike DELIVERS it. tester live ×2 + run_all CM1/CM9.
  - **RULED — entry 231 (08:31 UTC, L1857 [verbatim-transcript]):** *"yes"* — operator confirms the constant-slope-multiplier lens replaces the elbow-rounding/frozen-γ design. The √-kernel is gone (run_all CM9 "NO dead √-lens kernel: gLoc has no hpTau/√(τ²+u²)/u-factor"=true).
  - **RESOLVED(evidence) — entry 226 (08:07 UTC, L1815 [verbatim-transcript]):** *"i want to see steeper when i set for higher vol, with otm —> otm + "* — BOTH halves SEEN this build: (1) steeper chart-2 at higher m (Item 1, `VIS_chart2_m1.png` vs `_m3.png`); (2) OTM→OTM+ trade mapping (Item 3, θ_tx=mode·(chosen/mode)^m further out with m). The "is the chart inverted?" suspicion (entries 224/225) is answered: the constant-multiplier mapping is NOT inverted — steeper-for-higher-vol and further-out co-move.
  - **RESOLVED(evidence) — entries 218 / 222 (06:15 / 07:13 UTC, L1743 / L1783 [verbatim-transcript]):** *"yes"* (sharper warp ⇒ trade lands further OTM) and *"otm - should go otm + through sharper lens, fucking chsnhe it"* — DELIVERED: bigger m ⇒ θ_tx strictly further out (the prior invtx -R218τ inversion is reconciled, above).
  - **CONTEXT — entries 215 / 216 / 220 (L1719 / L1727 / L1765 [verbatim-transcript]):** *"transacting further otm than it appears"* / *"you transact at what looks like the true strike"* / *"lens shows otm + is otm -; so when you choose otm - it transact at otm + thats fucking it"* — the trader picks the displayed (chosen) strike, the pool transacts further out (θ_tx), settlement at the chosen strike. Mechanic preserved from the invtx line; only the tx-strike FORMULA changed (√ inverse → constant-multiplier power).
  - **CONTEXT — entry 230 (08:24 UTC, L1849 [verbatim-transcript]):** *"monilith math etc sync up now"* — the math/object/Lean/index monolith sync is a separate (research/paper/manager) deliverable, NOT part of this engine smoke; flagged here for the manager so the spec-sync isn't assumed done by this PASS.

EVIDENCE: `evidence/v28_constmult/RUN_LOG_runA.txt` == `RUN_LOG_runB.txt` (byte-stable modulo the run header + the rAF sweep frame-count 49 vs 48 = timing jitter, both >1 ⇒ animates) + `A_item1_m{1,2,3}.png` + `VIS_chart2_m{1,2,3}.png` (the steepening, chart-2 apex 0.25→0.105) + `VIS_fullpage_m3.png` + `A_item5_chart1.png` + `A_item5_sweep_landed.png`. Harness `engine/verify/pw_v28_constmult_smoke.mjs` (single A/B arg), live Playwright ×2, READ-ONLY (build md5 `8f897edc…` unchanged post-run). run_all GREEN (lens_selfcheck 13/0 + a16_atm_gate 5/0, exit 0). File-safety GREEN (blobs L74 `ab663f5c…` / L1060 `c505b08a…`; 3 scripts parse).
**VERDICT: ALL 5 smoke items PASS ×2 byte-stable ⇒ CONSTMULT smoke = PASS. Operator entry-226's two demands (steeper-for-higher-vol + OTM→OTM+) SEEN; the standing -R218τ direction-inversion RECONCILED. 0 console / 0 pageerrors. No blocking FLAG. Promotion waits on the skeptic gate-audit (per dispatch).**

**Table rows updated:** #3 (knob redefined → constant slope multiplier m, g_loc=m·γ, UI relabel "SLOPE MULT m"); #16 (tx-strike map θ_tx=mode·(chosen/mode)^m — further out with m, monotone, polarity locked; round-trip exact); #2 (chart-2 reshape now uniform m·γ steepening, no elbow/cusp/flat-top); #6 (wings exact power-laws at m·γ); #7 (smooth-paste g=m·γ; settle at chosen strike); #10 (reserve guard keyed off N·K_tx); #15 (file-safety GREEN, md5 `8f897edc…`, lens_selfcheck 13/0 + a16_atm_gate 5/0). **Rolling list:** -R218τ → RESOLVED(evidence)-in-`8f897edc`. **Reconciliation list:** R-218 τ-DIRECTION-vs-ENTRY-218 → RECONCILED-in-`8f897edc`.

---


## CONSTMULT HEAD (`8f897edc`) — INHERITED-FROM-v24 CONTRACTS live-confirmation + funding-through-lens (entry 232)   [status: VERIFICATION on HEAD `8f897edc` (UNCHANGED, READ-ONLY); closes skeptic completeness-audit FLAG-OMISSION #2; NO engine change / NO version change / NO promotion]

SCOPE: HEAD `8f897edc` was promoted on the constant-slope-multiplier SMOKE (steepness/m-knob/tx-map items), which did NOT live-confirm the inherited-from-v24 contracts on THIS build this session. Skeptic completeness-audit FLAG-OMISSION #2 named the gap: **carry P=Ny/Nx, rebase, strike-registration, the dollar/settlement pipe** are inherited from v24 and were never live-confirmed here. Plus the operator just RULED funding (entry 232 [verbatim-transcript]) is a through-the-lens quantity = ±m·γ — confirm it actually moves with the knob and is sane. This entry is a READ-ONLY verification on the UNCHANGED HEAD (md5 `8f897edc…` confirmed pre/post; both blobs canonical; 3 scripts parse; run_all GREEN lens_selfcheck 13/0 + a16_atm_gate 5/0). Tester live Playwright ×2 (A/B) byte-stable + Node-oracle decomposition. 0 console / 0 pageerrors both runs.

FEATURES: #4 (carry P=Ny/Nx + u=log(price)−log P coordinate), #5 (rebase x→r·x/α→r·α/β,y,w invariant; θ→θ/r; P→P/r), #8 (strike registration θ=K/oracle, display-mark vs chart-ray consistent), #11 (dollar/settlement pipe — OTM-expiry + ITM-exercise, closeBand), #7 (ITM American smooth-paste settle-to-cash fires through the lens), #9 (funding routing — now m-coupled ±g_loc=±m·γ per entry 232), #1 + pool fns #regression (v24 byte-identical pool), #15 (file-safety). **None beyond** (#2 curve warp, #3 the m knob, #6 pricing law, #10 slippage/depth-guard, #12 getMP_raw gotcha, #13 solvency, #14 Esscher — unchanged from the constmult promotion; #16 tx-strike map already confirmed in the `8f897edc` smoke).

DESIRABLE:
  - **[#4 / Item 1] Carry P=Ny/Nx healthy; u=log(price)−log P behaves.** Tester live ×2: default pool w=0.5, carry P (the Layer-1 marginal `getMP_raw`=w·y/((1−w)·x)) = $80,000 == oracle, poolMark$ = $80,000, sNorm = 1.0, u = log(80000)−log(80000) = 0 (finite, NOT NaN). == v24 contract (P=Ny/Nx, u=0 at equilibrium).
  - **[#5 / Item 2] Rebase = exact frame rescale, v24-faithful.** Tester live ×2 via the oracle KPI (Store.setOracle → Engine.rebase): oracle 80k→100k (r=1.25): x ×1.25, α ×1.25, β invariant (true), y invariant (true), w Δ=0, sNorm Δ=0, mp_raw ×0.8 == 1/r EXACT (carry P→P/r), strike ray θ→θ/r. Oracle 100k→64k (r=0.64): x ×0.64, α ×0.64, β/y/w invariant, mp_raw ×1.5625 == 1/r EXACT. == v24 contract (x→r·x, α→r·α, β,y,w invariant; θ→θ/r; P→P/r). Reserves/marks sane after.
  - **[#8 / Item 3] Strike registration θ=K/oracle consistent across display mark + chart ray.** Tester live ×2: K=$120k → θ=1.5 (call) markLensed=0.16667; K=$80k → θ=1.0 markLensed=0.25; K=$48k → θ=0.6 (put) markLensed=0.15 — all finite, g_loc=m·γ=1 at default m=1, the crossover free-boundary multiple S*=g/(g+1)=0.5 consistent. The chosen K maps to the same θ coordinate the display mark and chart strike-ray share (single sNorm coordinate, MUST-APPLY-1).
  - **[#11 / #7 / Item 4] Dollar/settlement pipe produces sane finite USD in BOTH regimes; reserves move correctly.** OTM-expiry (UI band sold-call $120k / bought-put $48k N=0.02, oracle≈80k both legs OTM): closeBand → settled_cash_leg=null (BOTH legs reversed on the AMM — correct OTM behavior), raw_net=4.50e-5, trader_payout=$0.072 finite/sane, reserves move (dx=−0.043 / dy=+$3,464.71 over open+close). ITM-exercise (FORCED real ITM: poolMark/oracle=2.669 driven above the sold-call live ray 1.5 WITHOUT a rebase, so legIsITM('call')=true; `evidence/.../ITM_FORCED_probe.json`): closeBand → settled_cash_leg='sold', live_leg='bought' (the ITM sold-call settles to cash via the v26b American smooth-paste path THROUGH the lens; the OTM bought-put reverses on the AMM), trader_payout=$3.78, raw_net=2.36e-3, X/Y finite, reserves finite — NO NaN, NO absurd magnitude. Round-trip reserve restore EXACT (Node-oracle: open dy=−$5,400, reverse via tradeUpdate(−dy) → |dx|=|dy|=0.000e+0). == v26b/v24 settlement contract.
  - **[#9 / Item 5] Funding SCALES with m and is sane (operator entry-232 ruling SEEN).** Funding = κ·(±g_loc)·N·markLensed·(S−1)/S·dt with g_loc=m·γ (the `tau` arg carries m). On a steepened pool (w=0.539, S=1.363): call(θ=1.5) = +3.68e-4 / +4.29e-4 / +5.06e-4 at m=1/2/4; put(θ=0.7) = −5.69e-4 / −6.62e-4 / −7.24e-4. SCALES with m (monotone-increasing), all finite/sane, SIGN FLIPS call(+) vs put(−) on the θ-swap. Sub-linear scaling DECOMPOSED (`/tmp` decomp in INDEX): the ±g prefactor grows ∝m (linear) but markLensed SHRINKS as g grows (g·markLensed: 0.151→0.176→0.193 at m=1/2/4), so the product grows sub-linearly (ratio 1.27 m=1→4). Matches the skeptic's qualitative measurement (−0.00667→−0.00755, ratio 1.13 — different pool/N/strike, same monotone-with-m behavior) and the operator's entry-232 m-coupled ruling.
  - **[#15] File-safety GREEN** — build md5 `8f897edc…` UNCHANGED pre/post ×2 (READ-ONLY); blobs canonical webp L74 `ab663f5c…` / svg L1060 `c505b08a…`; 3 scripts parse; run_all = lens_selfcheck **13/0** + a16_atm_gate **5/0**, exit 0; 0 console / 0 pageerrors both runs. RESULT JSON A==B byte-IDENTICAL; A/B fullpage PNG byte-identical (291,703 b each).

UNDESIRABLE:
  - NONE NEW. The inherited-from-v24 contracts (carry, rebase, strike-reg, dollar pipe, funding) all behave to the v24 contract on this build. No NaN, no regression, no absurd magnitude observed in any of the 5 items.

NEUTRAL:
  - METHODOLOGY NOTE (not a defect): the Item-4 ITM test driven by an oracle bump (80k→160k) did NOT trigger the ITM regime, because Store.setOracle REBASES the pool — a pure rebase is a frame rescale (poolMark/oracle stays ~1, the band's strikes re-ray live), so it is NOT a moneyness change. This is v24-FAITHFUL behavior. The real ITM path was therefore forced by moving poolMark above the strike ray WITHOUT a rebase (a w-shifting trade), which correctly fires settled_cash_leg='sold' — confirming the ITM exercise path is alive (the oracle-bump alone is the wrong lever for ITM, by design).
  - Funding 0/0 on the DEFAULT pool (w=0.5 ⇒ S=mp/oracle≡1 ⇒ (S−1)/S=0) is the standing positive-control artifact, NOT a defect (same as every prior lens run); measured alive on a steepened pool, above.

OPERATOR-VOICE:
  - **RULED — entry 232 (11:32 UTC, L1865 [verbatim-transcript]):** *"funding slope deviation thing would be as seej thru the lens"* — in reply to the manager's funding decision (A decouple / B keep m-coupled / C v24 ±2 / D hold), raised by the skeptic's completeness-audit FLAG-OMISSION #1. The operator RULES funding is a through-the-lens quantity ⇒ option B (m-coupled, funding ∝ ±g_loc = ±m·γ). CONFIRMED-behaving this build (Item 5): funding moves with m, finite, correct call(+)/put(−) sign. FLAG-OMISSION #1 thereby RESOLVED-BY-RULING (operator chose to keep the coupling, not a defect to fix).
  - **CONTEXT — the original constraint, entry on `2026-06-10_kurtosis-curve-family-brief.md` L18 [verbatim-transcript]:** *"everything else stays the same — carry, value∝S^(−γ), smooth-pasting, funding, the dollar pipe are contracts the new curve must still satisfy (re-derive, don't assume)."* This verification is the live discharge of that constraint on the constmult HEAD: carry (Item 1), smooth-pasting/settlement (Item 4), the dollar pipe (Item 4), funding (Item 5) all confirmed satisfied. (value∝S^(−γ) = the wings at exponent m·γ, confirmed in the `8f897edc` promotion smoke / run_all CM2.)
  - **CONTEXT — entry 833 [verbatim-transcript L833]:** *"yes, also please check everything else where there's a lensing thing queries etc. amm tx funding .... i really want that theres no integrity compromises, skeptic"* — the operator's standing demand that every lensing touchpoint (queries, AMM tx, funding) be integrity-checked. This entry adds the funding + settlement + carry/rebase touchpoints to the confirmed-clean set on the live build.

EVIDENCE: `evidence/v28_constmult_inherited/` — `RUN_LOG_run{A,B}.txt` (A==B byte-stable modulo run-label header), `RESULT_run{A,B}.json` (byte-IDENTICAL), `ITM_FORCED_probe.json` (real ITM exercise), `A_fullpage_end.png`==`B_fullpage_end.png`, `INDEX.txt`. Harness `engine/verify/pw_v28_inherited_smoke.mjs` (single A/B arg), live Playwright ×2, READ-ONLY (build md5 `8f897edc…` unchanged). run_all GREEN. File-safety GREEN.
**VERDICT: ALL 5 inherited-contract items PASS ×2 byte-stable ⇒ skeptic FLAG-OMISSION #2 CLOSED (carry/rebase/strike-reg/dollar-pipe live-confirmed on `8f897edc`); funding-through-lens (entry 232) CONFIRMED m-coupled & sane. No NaN, no regression, no absurd magnitude. 0 console / 0 pageerrors. No blocking FLAG.**

**Table rows updated:** #4 (carry P=Ny/Nx + u-coord — live-confirmed sane on `8f897edc`); #5 (rebase exact frame-rescale — live-confirmed x×r/α×r/β,y,w invariant, P→P/r); #8 (strike registration θ=K/oracle — live-confirmed consistent); #11 (dollar/settlement pipe — live-confirmed OTM + forced-ITM, finite/sane USD); #7 (ITM smooth-paste settle-to-cash fires through the lens); #9 (funding — now m-coupled ±g_loc per entry 232, live-confirmed scales-with-m + sign-flip + sub-linear). **Rolling list:** FLAG-OMISSION #1 (funding scales with knob) → RESOLVED-BY-RULING (entry 232, m-coupled kept). **Reconciliation list:** no new OPEN; FLAG-OMISSION #2 (inherited contracts unconfirmed) → CLOSED-on-`8f897edc`.

---

## CONSTMULT HEAD line (`8f897edc`→`80f050e2`→`aa1e5d05`) → UX-FIX `f6029182` (remove Lean-validated overclaims + drawStrikeMark on the lensed curve)   [status: CANDIDATE — gates HEAD promotion on THIS smoke; tester live Playwright ×2 byte-stable; **FLAG-RAISED — fix #2 is a runtime ReferenceError, dots do NOT draw**]

**FEATURES:** depiction/provenance-label layer (NOT in the #1–#15 engine inventory) + #15 (file-safety, re-confirmed) + #16-adjacent (the strike-MARKER overlay on the chart-2 lensed read, which sits on top of feature #6/#7 pricing). Engine math (#1–#14) byte-UNCHANGED — pool/lens/settle/funding fns untouched; this is a draw-layer + header-text delta only. **None beyond:** no curve/invariant/trade/settlement/funding change; gates lens_selfcheck 13 + a16_atm 5 still green (they exercise engine math, NOT the draw-layer — which is exactly why they miss fix #2's bug, see UNDESIRABLE).

**DESIRABLE (fix #1 — verification-label honesty, CONFIRMED live ×2):** the premature "Lean-validated / Aristotle-verified / no sorry" overclaims are GONE from the live DOM and the honest trusted-from-prover wording shows. Read live (innerText, both runs byte-identical):
- header meta-line / panel title: `"Math Reference (trusted-from-prover)"`
- header badge: `"Composite-Ray AMM · Identities I–V (trusted-from-prover)"`
- footer: `"Temporal · Composite-Ray AMM MVP · Identities I–V trusted-from-prover (Aristotle-compiled, not locally re-verified) · docs"`
- meta-intro (L27): `"Math reference: Lean identities I–V, trusted-from-prover (Aristotle-compiled, std axioms; not locally re-verified)."`
- body-innerText scan for `Lean-validated` / `Aristotle-verified` / `no sorry` ⇒ **[] (zero matches)**; `trusted-from-prover` present ⇒ true. This is the right call — the operator wants the HTML core FORMALLY verified in Lean as a FUTURE goal (entries 1102/1104/1390/1392/1943/1945), so claiming it as DONE was an overclaim; walking it back to trusted-from-prover is honest. **[feature: provenance-label layer]**

**UNDESIRABLE (fix #2 — strike markers — REGRESSION, runtime error, OPEN):** the intent (dots on the lensed curve via `psiAt`) is right, but the implementation references an **out-of-scope** helper ⇒ `drawStrikeMark` THROWS on every call ⇒ **the sold/bought strike dots do NOT draw at all** (it is worse than the pre-fix floating dots, which at least rendered). Evidence:
- **4 pageerrors, both runs, deterministic: `ReferenceError: psiAt is not defined`** (one per `drawStrikeMark` call: sold.inner / sold.outer / bought.inner / bought.outer). 0 console errors.
- **0 red (colShort #FF6767) + 0 green (colLong #14E800) dot pixels on the entire pricing canvas** (full-canvas census, both runs). The expected dots (sold-call θ=1.5 @ φ=56.3°/$120k, bought-put θ=0.6 @ φ=31°/$48k, with a real band open) are ABSENT. Visual confirm `A_pricing_band.png`: lensed curve renders, NO dots.
- **Root cause (read-only diagnosis, brace-depth verified):** `psiAt` is declared at brace-depth 2, a closure LOCAL to the nested `drawState(...)` fn (~L3726). `drawStrikeMark(...)` (~L3782) lives at depth 1 — a SIBLING of `drawState` inside `renderPricingFrame`, NOT nested in it — so `psiAt` is out of scope there and every reference throws. The prior build (`aa1e5d05`) called `Engine.mark(w,theta,sNormLocal)` (a top-level Engine method, in scope ⇒ no throw, but un-lensed ⇒ wrong height ~0.85/0.95). The fix swapped the call target to the lensed `psiAt` but did not hoist/inline it. **FIX for the intern:** hoist `psiAt`+`gAt` (and the `tau_v`/`sNorm`/`poolForLens` they close over) to `renderPricingFrame` scope, OR inline the lensed computation (`Engine.gLoc`+`Engine.markLensed`) directly inside `drawStrikeMark`. The math/intent is correct — only the scope is wrong. **Status: OPEN — FLAG-RAISED to manager; do NOT promote this build to HEAD until fix #2 lands clean (dots render ON the curve, 0 pageerrors).** [feature: strike-marker overlay; regression introduced by fix #2]

**NEUTRAL:** the lensed curve itself is UNCHANGED (default m=1/γ≈1.013/g_loc≈1.013, mode mark = 0.2479 < 1, apex ~0.25 at φ_m, peaks well below the gray mark=1 line) — fix #2 only changed where the (never-drawn) dots are placed, not the curve. Gates green, blobs canonical (file-safety re-confirmed: webp L74 `ab663f5c…`, svg L1060 `c505b08a…`, 3 scripts parse; build md5 `f6029182` unchanged pre/post, tester READ-ONLY).

**OPERATOR-VOICE:** fix #1 is grounded in the operator's standing direction that the HTML core is to be FORMALLY VERIFIED IN LEAN as a future deliverable, not a present fact — `[verbatim-transcript]` `history/operator/2026-06-10_kurtosis-curve-family-brief.md:1104` *"infact instead of the rag, lets aim to have the core implementation (actual subset of HTML) actually formally verified in lean against the spec and the pure math object"* and `:1392` *"and the actual HTML core subset having the checks as per the theory or whatevrer so its provable formally verified in lean"* — both **OPEN goals**, which is precisely why the prior "Lean-validated" UI label was an overclaim; the fix RESOLVES the overclaim (label now matches reality: trusted-from-prover). No operator transcript yet exists for the floating-strike-marker objection (caught this session, manager-relayed) — logged as `[manager-recorded paraphrase]`, not a verbatim operator quote. No NEW operator objection on this build beyond the standing items.

EVIDENCE: `evidence/v28_uxfix/` — `RUN_LOG_run{A,B}.txt`, `RESULT_run{A,B}.json` (byte-identical modulo run label), `A/B_pricing_band.png` (curve renders, NO dots), `A/B_fullpage.png`. Harness `engine/verify/pw_v28_uxfix_smoke.mjs` (single A/B arg), live Playwright ×2, READ-ONLY (build md5 `f602918201e2365b779b4965753f86bf` unchanged pre/post). run_all GREEN (lens_selfcheck 13/0 + a16_atm 5/0). File-safety GREEN.
**VERDICT: FLAG. Fix #1 (overclaim removal) PASS ×2 byte-stable. Fix #2 (strike markers on curve) FAIL — `drawStrikeMark` throws `ReferenceError: psiAt is not defined` (×4, deterministic) and NO strike dots render. NOT promotable until fix #2 is corrected (psiAt out of scope in drawStrikeMark). Curve + gates + file-safety unaffected.**

**Predecessor-gap note (tester, owed):** the `8f897edc`(constmult HEAD)→`80f050e2`(comment-cleanup, entry 234)→`aa1e5d05`(caption-depiction fix) HEAD-promotion transitions have live-confirmation in my MEMORY + the inherited-contracts entry above but NO dedicated version-transition ledger entry each. Flagged for manager: if those are to be logged as their own entries, that backfill is owed; this `f6029182` entry maps the current delta only.

**Table rows updated:** #15 (file-safety re-confirmed green on `f6029182`, blobs canonical, build md5 unchanged); #6/#7 (pricing/ITM read layer — engine UNCHANGED, but the strike-MARKER overlay drawn on top of the chart-2 lensed read is BROKEN by fix #2: dots do not render, runtime ReferenceError — OPEN regression). **Rolling list:** new OPEN — UXFIX-2 drawStrikeMark psiAt-out-of-scope (no dots, 4 pageerrors). 

---


## UX-FIX `f6029182` (FLAGGED) → UX-FIX-2 `d606c3f2` (drawStrikeMark RE-FIXED: lensed mark INLINED in scope)   [status: CANDIDATE — gates HEAD promotion on THIS smoke; tester live Playwright ×2 byte-stable; **PASS — 0 pageerrors, dots render ON the lensed curve**]

**FEATURES:** strike-MARKER overlay (the #16-adjacent draw layer on top of feature #6/#7 chart-2 lensed read) + #15 (file-safety re-confirmed). Engine math (#1–#14) byte-UNCHANGED — the only delta vs `f6029182` is the body of `drawStrikeMark` (the out-of-scope `psiAt` reference replaced by an in-scope inline of `Engine.gLoc`+`Engine.markLensed`). Fix #1 (overclaim removal, provenance-label layer) UNCHANGED and still PASS (re-confirmed live ×2). **None beyond:** no curve/invariant/trade/settlement/funding change; lensed curve byte-identical (default m=1/γ≈1.013/g_loc≈1.013, mode mark = 0.2479 < 1); gates lens_selfcheck 13 + a16_atm 5 still green.

**DESIRABLE (the FLAGGED regression is RESOLVED — strike dots render ON the lensed curve, CONFIRMED live ×2 byte-stable):**
- **0 pageerrors, both runs** (was 4 deterministic `ReferenceError: psiAt is not defined`). The specific error that broke `f6029182` is GONE.
- **182 dot pixels on the pricing canvas** (full-canvas census, both runs; was 0). The sold-call and bought-put dots both RENDER:
  - **sold.inner θ=1.5 @ φ=56.31° / $120k**: red dot #FF6767 (`rgb=[255,103,103]`) at pixel (x=567, y=273), dotPsi=0.1631, expected y=276 ⇒ **dy=3px** — ON the call arm.
  - **bought.inner θ=0.6 @ φ=30.96° / $48k**: green dot #14E800 (`rgb=[20,232,0]`) at pixel (x=333, y=277), dotPsi=0.1506, expected y=279 ⇒ **dy=2px** — ON the put arm.
- **The dots sit at the lensed smooth-paste mark (~0.15-0.16), NOT floating at the old un-lensed ~0.85/0.95** (the `Engine.mark` height the `aa1e5d05` build drew). Visual confirm `A_pricing_band.png`: green dot on the pink put-arm and red dot on the teal call-arm, each with a faint stem to the axis; mode apex ~0.25 at φ=45°, gray dashed mark=1 line far above. dy of 2–3px is the dot-radius/antialias slop, not a height error. **[feature: strike-marker overlay — RECONCILED-in-`d606c3f2`]**
- **Root cause closed (read-only diagnosis, brace-depth verified):** `drawStrikeMark` (L3782, depth-1 sibling of `drawState` in `renderPricingFrame`) now computes the mark INLINE with in-scope identifiers — `g = Engine.gLoc(state.pool, theta, state.m)`, then `Engine.markLensed(w, theta, sNormLocal, g)` with `sNormLocal = snap.sNorm` (snap declared L3774, renderPricingFrame scope), `toPx`/`ctx`/`phiMaxDeg`/`colShort`/`colLong` all renderPricingFrame-scope. NO `psiAt` reference anywhere in `drawStrikeMark`. The fix matches the recommendation in the `f6029182` FLAG entry (inline `Engine.gLoc`+`Engine.markLensed`).

**DESIRABLE (fix #1 — verification-label honesty, STILL CONFIRMED live ×2):** trusted-from-prover wording shows; `Lean-validated`/`Aristotle-verified`/`no sorry` body scan ⇒ **[] (zero)**. header/panel `"Math Reference (trusted-from-prover)"`, badge `"Composite-Ray AMM · Identities I–V (trusted-from-prover)"`. UNCHANGED from `f6029182` (that fix was always clean). **[feature: provenance-label layer]**

**UNDESIRABLE:** none introduced. The `f6029182` UXFIX-2 regression is closed (see reconciliation list).

**NEUTRAL:** the lensed curve and all engine math are byte-identical to `f6029182`/`aa1e5d05`; only the dot-draw body changed. PNG file md5 differs A vs B (`A_pricing_band.png` `5abf21a9…` vs `B_…` `a16293b1…`) but the STRUCTURED pixel data is byte-identical — same 182-pixel census, same dot coords (567,273)/(333,277), same RGB; the md5 delta is pure PNG-encoder/antialias jitter, RESULT_runA.json == RESULT_runB.json modulo run label.

**OPERATOR-VOICE:** no NEW operator objection on this build. The two fixes trace to: (fix #1) the operator's standing direction that the HTML core is a FUTURE Lean-verification goal, not a present fact — `[verbatim-transcript]` `history/operator/2026-06-10_kurtosis-curve-family-brief.md:1104` *"infact instead of the rag, lets aim to have the core implementation (actual subset of HTML) actually formally verified in lean against the spec and the pure math object"* and `:1392` — both OPEN goals, so the prior "Lean-validated" UI label was an overclaim now correctly walked back. (fix #2) the floating/missing strike-marker objection was caught in-session and manager-relayed; still `[manager-recorded paraphrase]`, no verbatim operator quote exists for it. Nothing on this build resolves or reopens a standing operator open-question.

EVIDENCE: `evidence/v28_uxfix2/` — `RUN_LOG_run{A,B}.txt`, `RESULT_run{A,B}.json` (byte-identical modulo run label; same dot data), `A/B_pricing_band.png` (curve + both dots ON the curve), `A/B_fullpage.png`. Harness `engine/verify/pw_v28_uxfix2_smoke.mjs` (single A/B arg), live Playwright ×2, READ-ONLY (build md5 `d606c3f27210bb6cbbb37d2ef0c90525` unchanged pre/post). run_all GREEN (lens_selfcheck 13/0 + a16_atm 5/0; monolith 8/8 report-only). File-safety GREEN (webp L74 `ab663f5c…`, svg L1060 `c505b08a…`, 3 scripts parse). 0 console errors / 0 pageerrors / 0 dialogs ×2.
**VERDICT: PASS. 0 pageerrors (the `ReferenceError: psiAt is not defined` ×4 is gone), strike dots RENDER (182 dot pixels, sold red + bought green), dots sit ON the lensed curve at the smooth-paste mark (dy 2–3px, NOT the old ~0.85/0.95 float). Curve + engine + gates + file-safety unchanged. Fix #1 still clean. PROMOTABLE — clears the gate that `f6029182` failed.**

**Table rows updated:** #15 (file-safety re-confirmed green on `d606c3f2`, blobs canonical, build md5 unchanged); #6/#7 (strike-MARKER overlay on the chart-2 lensed read now RENDERS ON the curve — regression closed). **Rolling list:** UXFIX-2 → RECONCILED-in-`d606c3f2`.

---


## Standing reconciliation list (all OPEN undesirables, one place)
| Item | Introduced | Status |
|---|---|---|
| **UPDATE-1 x-drain (close no longer round-trips reserves exactly): after open→close chart-1 pool reserves show a small one-signed x-drain (Δx<0 at fixed oracle) — a pool-internal reprice (IL-like + bounded ∝dy² self-drain) credited to NO wallet. Measured ~$29 at N=0.05 (exhibit), ~$53 at the gate's N=0.05 CM6-v3.5; bounded (<0.004% of pool.x); Δy round-trips EXACT.** | UPDATE-1 `bb2f8230` (2026-07-07) | **ACCEPTED(by design) — operator entries 452/455 [verbatim-transcript] 'we build the fully theoretically clean thing as the first uodate' / 'yes go on' (drain harmless-in-sim & documented; the credit/equity wrapper is byte-identical to the twin ⇒ NON-EXTRACTABLE by construction — gate CM6-v3.5/3.6). The no-free-money FLOOR / charge-back returns in UPDATE-2 (parked, entries 451/452). NOT a regression — the intended replacement of the exact-rewind close.** |
| **CHART2-NORM-CANCELS-KURTOSIS: chart-2 mode-peak normalization (psiN=min(1,psiAt/peakNorm)) mathematically cancels g=m·γ (normalized=sNorm/θ call, θ/sNorm put — g-free), making chart-2 m-INVISIBLE; m=1 and m=3 screenshots md5-identical (`e5789975…`). Fixes operator L2063 (mode-at-1) but REGRESSES operator entry-226 ("steeper when I set for higher vol") which the prior `8f897edc` satisfied** | chart-2 normalization `6a23f93d` (working-tree, NOT pushed) (2026-06-22) | **CLOSED / RESOLVED-in-`dd6fb955` (Option C, 2026-06-22).** The conflict is DISSOLVED, not adjudicated by the operator: chart-2 no longer normalizes a VALUE (which cancelled the knob) — it plots the lens wing law `(mode/θ)^(m·γ)`/`(θ/mode)^(m·γ)` DIRECTLY, so the mode peaks at 1 by construction (`r=1`⇒`r^g=1`, nothing to divide) AND the `g=m·γ` exponent survives into the wings. Tester live ×2 byte-stable (`dd6fb955`): both operator requirements now hold together — apex psi 1.0032 at the mode AND 3 DISTINCT chart-2 PNG md5s (m1 `e5789975…`/m3 `aa411091…`/m6 `6cf4cd81…`, width-at-half 345→123→63 as m=1→3→6). entry-226 RESOLVED(evidence); no operator product-call owed. |
| **UXFIX-2: drawStrikeMark threw `ReferenceError: psiAt is not defined` ⇒ sold/bought strike dots did NOT render (0 dot pixels, 4 pageerrors); fix #2 referenced `psiAt` which is a closure local to nested `drawState`, out of scope in sibling `drawStrikeMark`** | UX-fix `f6029182` (2026-06-22) | **RECONCILED-in-`d606c3f2` (2026-06-22)** — `drawStrikeMark` now INLINES the lensed mark with in-scope `Engine.gLoc(state.pool,θ,state.m)`+`Engine.markLensed(...)` (no `psiAt`); tester live ×2 byte-stable: 0 pageerrors, 182 dot pixels, sold red (567,273)/bought green (333,277) ON the lensed curve at the smooth-paste mark (dy 2–3px), gates 13+5 green, build md5 unchanged. |
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
| **FINDING-TRADE-AT-STRIKE (C16 `abd46149`): entry-127 "buy call is buy asset for dollars AT STRIKE on AMM" — the operator's root-cause diagnosis of flat-warp** | C16 `abd46149` (scope boundary) | **RESOLVED-in-`de28c937` (A14 HEAD)** — at-strike swap shipped: `executeLeg` dy=(wingSign·legSign)·N·K_usd, K_usd=θ·oracle; tester live ×2 (single sold-call dy/Δw rise with strike) + gates AS1/AS5 |
| **FLAGGED-LABEL (A14 `de28c937`): band-preview Audit strip header "Pool Δ (cash-conserving ⇒ Δy_net ≈ 0)" + field "net trader cash @ open" MISLABEL the at-strike net pool move — shows $16,623.29 (=netPoolY), not ≈0, not trader cash** | A14 `de28c937` (at-strike swap no longer cash-conserving; header text pre-A14) | OPEN — UX-clarity relabel for the intern (not an engine change); tester observed + quoted, not fixed (read-only) |
| **KURTOSIS-WARP-TEST (operator entry 203/184/185): warp-magnitude-vs-KURTOSIS** | A14 smoke coverage gap | **RESOLVED-in-targeted-test-on-`de28c937`** — tester live ×2: (1) UNDERLYING swap-warp kurtosis-FREE (Δw/Δsteepness byte-identical across τ=1.0/0.3/0.05); (2) SEEN chart-2 reshape kurtosis-DEPENDENT (peak/near-money 0.453→0.660→0.794 as τ sharpens). NUANCE: "sharper ⇒ more warp" TRUE for the peak SEEN warp; INVERTS at a fixed-OTM strike (reshape shrinks). Operator clarification on which reading to encode carried to manager. |
| **R-218 LENS-AFFECTS-AMM-TX (entries 215/216/220): the lens must change the EFFECTIVE AMM strike** | at-strike `de28c937` sized swap at the RAW chosen strike (operator flagged contradiction, entry 214/215) | **RESOLVED-in-`5fea0e8d` (invtx candidate)** — `executeLeg` dy/guard key off the frozen inverse-lens K_tx; trader chooses OTM− displayed strike, pool transacts at OTM+ θ_tx; settles at chosen strike; round-trip exact (lens_selfcheck INVTX-2/3); lens-view fns byte-identical (INVTX-5); tester live ×2 |
| **R-218 τ-DIRECTION vs operator entry-218: sharper warp should land FURTHER OTM (operator YES, L1743) but the invtx build lands sharper⇒CLOSER** | invtx `5fea0e8d` (today's h_τ inverse: u_tx=sign(a)√(a²+2|a|τ)) | **RECONCILED-in-`8f897edc` (CONSTMULT candidate)** — the curve redefinition (operator entries 229/231) makes the tx-strike map θ_tx=mode·(chosen/mode)^m MONOTONE increasing in m: 2×→4×→8× of mode at m=1/2/3 ⇒ bigger multiplier lands STRICTLY FURTHER OUT (the operator-ruled direction). No flip. Tester live ×2 + run_all CM7 (g_loc↑ AND θ_tx↑ SAME direction, polarity LOCKED). |
| **-FPNL-NEGZERO (cosmetic, tester finding on `4bc939ec`): with ZERO accrued funding the negated column renders `-0.000000` (JS negative zero through fmtNum) on every band/component/total funding cell pre-tick — reads as a tiny negative before any tick. Display-format nit only; values correct once funding accrues.** | funding-P/L column `4bc939ec` (2026-07-03) | **RESOLVED(evidence)-in-`51342574`** (2026-07-07, one of the agreed pre-CTO-handover fixes, entry 427 context) — the one-liner shipped as a 2-expression guard: `bandFundingStored === 0 ? 0 : -bandFundingStored` (feeds band + total rows) and `c.funding === 0 ? 0 : -c.funding` (component row) BEFORE fmtNum. Tester targeted live recheck 12/12 ×2 byte-stable: all 8 pre-tick funding cells render exactly `0.000000`, NO minus sign (ASCII or U+2212), pre- AND post-oracle-move; post-tick payer −0.000469 / receiver +0.000531 byte-equal to the 4bc939ec pass (the guard does NOT eat real negatives; sign pin intact). Full-file diff vs 4bc939ec = the 2 expressions + 3 comment lines, nothing else. Evidence `evidence/fpnl_negzero_recheck/`. |
| **FUNDING-FORMULA-UN-BUILT / F1 oracle-independence (`abd35f4b` placeholder): the shipped funding is the same-slope pool-vs-anchor DEVIATION ONLY — the actual funding FORMULA (Hyperliquid-style capped premium→rate, our same-slope angles as the mark/oracle proxy) is NOT built; and whether the deviation is oracle-independent AS FINAL is undecided.** | funding same-slope placeholder `abd35f4b` (2026-07-08) | **OPEN — PARKED to UPDATE-2 (operator entry 462 [verbatim-transcript] 'dont plug in a formula yet, just get deviation right and note the actual funding formula tbd … in hext update with the exploit patch'). The DEVIATION is delivered + gate-locked (FS.1–FS.6, KILLER FS.2b = 0 on a symmetric w=½ pool); the FORMULA + the F1 oracle-independence-as-final call ride UPDATE-2 with the exploit patch. NOT a regression — the intended placeholder scope.** |
_Tester: append new entries above the reconciliation list; update the list every entry._

---
### aa1e5d05 — chart-caption depiction fix (2026-06-14, operator-caught)
**Delta:** DEPICTION-ONLY (2 text lines in chart-2 "MARK ACROSS STRIKES"). Legend `mark = 1 (mode)` → `mark = 1 (full exercise cap)`; caption old min/max formula + "peaks at 1 at the mode" → lensed smooth-paste value, "peaks at the mode at 1/((g+1)·((g+1)/g)^g) < 1 — NOT at 1 — reaches 1 only at full exercise." **No engine-logic change** (markLensed/gLoc/tradeUpdate byte-identical to 80f050e2). **Feature mapping: none beyond** (inventory #1–#15 unchanged; this corrects a stale label, not behaviour). **Verified:** manager gates 13+5/0 green, blobs canonical, 3 scripts parse; tester live PASS ×2 byte-stable (ab46ad37) — legend+caption render corrected, curve peak ≈0.25 at UI default m=1 (=smooth-paste closed form, <1), curve unchanged, 0 errors. md5 80f050e2→aa1e5d05.

### 9f1e625b — SLOPE MULT M input clamp to [1,6] + header-badge shorten (2026-06-22, operator-caught live)
**Operator-caught (this session, live UI):** typing `SLOPE MULT M = 0.1` (below the knob's declared
baseline of 1) drove the option/value curve to an OUT-OF-RANGE state (mode peak ~0.70) — the
`#m-input` declared `min="1" max="6"` in HTML but the JS path (`setM` + the change/input handler)
did **not** enforce it, so a typed value < 1 (or > 6) flowed straight into `state.m` and the lens.
**Delta:** (1) `setM(t)` (L2431) now `state.m = Math.min(6, Math.max(1, t))` — engine-side clamp to
the already-RULED domain m∈[1,6] (operator entries 229/231). (2) The `#m-input` input/change handler
(L2824) clamps `v` to [1,6] AND, on the `change` event, **writes the clamped value back to the field**
(`e.target.value = v`) so the displayed number snaps to the bound. (3) Header badge (L1085) shortened
to `Composite-Ray AMM · trusted-from-prover` (drops the `· Identities I–V` segment so it stays on one
line). **No curve/invariant/settlement change** — `gLoc`/`markLensed`/`tradeUpdate`/`executeLeg`
byte-identical; this only fences the knob to its already-ruled range and prevents the unreachable
m<1 / m>6 lens states. Pool fns still byte-identical to v24.
**Feature mapping (inventory #1–#15):**
- **#3 (kurtosis/vol knob = constant slope multiplier m):** UNDESIRABLE FENCED — the knob is now
  range-fenced live to its ruled domain m∈[1,6] (was silently honouring out-of-range typed values).
  Behaviour inside [1,6] unchanged (m=1=plain v24 g=γ; bigger m steeper).
- **#15 (UI/render layer & operator-facing labels):** header badge depiction shortened (one line);
  field-writeback gives the operator immediate feedback that the value was clamped.
- **none beyond** — #1 (value∝S^−γ), #2 (GH/v24 pool curve), #4 (carry P=Ny/Nx), #5 (rebase),
  #6 (slippage), #7 (settlement/dollar pipe), #8 (strike registration), #9 (funding-through-lens),
  #10 (tx-strike map θ_tx=mode·(chosen/mode)^m), #11 (ITM smooth-paste), #12–#14, #16 (trades-warp)
  all UNCHANGED (byte-identical engine; clamp + writeback + badge text only).
**Verified (tester live ×2 byte-stable, build md5 `9f1e625b` UNCHANGED pre/post — READ-ONLY on engine):**
- CHECK1 m=0.1 typed ⇒ clamps to m=1: `state.m`=1, analytic mode-peak 0.2500 == baseline (NOT the
  ~0.70 out-of-range state), pixel apex psi=0.2532 at φ=45° (`A_m0_1_clamped.png` shows the m=1 tent,
  apex ~0.25, NOT the dropped ~0.70 curve).
- CHECK2 field-writeback: `#m-input`.value snaps to `"1"` after the change event.
- CHECK3 m=10 typed ⇒ clamps to m=6: `state.m`=6, peak 0.0567 (steeper, far below 0.25), field
  snaps to `"6"` (`A_m10_clamped.png`).
- CHECK4 m=3 in-range: works normally, `state.m`=3, peak 0.1055 (between m=1 and m=6), field stays `"3"`.
- CHECK5 header badge reads exactly `Composite-Ray AMM · trusted-from-prover` (no `Identities I–V`);
  DOM box height 16px == lineHeight 16px ⇒ single line, no wrap.
- CHECK6 no regression: with a band open (sold-call $120k / bought-put $48k / N=0.03) the strike
  markers render (red #FF6767 90px @ psi=0.123, green #14E800 85px @ psi=0.114) ON the lensed curve
  (smooth-paste mark, NOT the old floated ~0.85) — prior `d606c3f2` UXFIX-2 still intact.
- 0 console errors, 0 pageerrors, 0 dialogs both runs; RESULT_runA == RESULT_runB (modulo run label).
- Hard gates `lens_selfcheck` 13/0 + `a16_atm_gate` 5/0 green; monolith_consistency 8/8 (report-only);
  blobs canonical (webp L74 `ab663f5c…`, svg L1060 `c505b08a…`), 3 scripts parse.
- Harness `engine/verify/pw_v28_mclamp_smoke.mjs`; evidence `evidence/v28_mclamp/`.
**OPERATOR-VOICE:** the m∈[1,6] domain itself is the operator's ruling [verbatim-transcript,
`2026-06-10_kurtosis-curve-family-brief.md` entry 229 L1841 "fuck gang. its literally just a constant
slope multiplier", entry 231 L1855 "yes"]. The m<1 out-of-range render the operator hit live this
session is a UX-bug report transcribed by the manager in the current session (not in the historical
operator files); the clamp fences the knob to that already-ruled domain — no new product decision.
**No OPEN operator objection introduced.** md5 aa1e5d05→…→`9f1e625b`. **Verdict = PASS — PROMOTABLE.**

### 6a23f93d (working-tree candidate, NOT pushed) — chart-2 "MARK ACROSS STRIKES" value curve NORMALIZED so the mode peaks at y=1 (2026-06-22, operator-caught live)
**Operator-caught (historical transcript, this change is the manager's fix for it):** chart-2's mode
did NOT reach the top (`1`) — it sat at the absolute smooth-paste value (~0.25 at m=1), which the
operator said "beats the purpose of the chart." [verbatim-transcript `2026-06-10_kurtosis-curve-family-brief.md`
L2063: *"mfer the goddamn mode thing in second chart isnt reaching the top ('1') its somewhere less
than 1 which beats the mfing puepose of the goddamn chart d you fucking get it gang?"*; context L2061:
operator wants the mode anchored at 1, manager normalizes the displayed value-shape so the mode peaks
at 1, settlement math unchanged, tester-gating before push.]
**Delta (DISPLAY-ONLY, `renderPricingFrame`/`drawState`, L3732–3782 + `drawStrikeMark` L3805–3809):**
the drawn value curve is divided by `peakNorm` = ψ at the mode strike (`psiN = min(1, psiAt(θ)/peakNorm)`),
so the apex anchors at y=1; the mode dashed line now runs to `toPx(tmDeg, 1)`; strike markers get the
SAME normalization (`mk / peakMk`, `peakMk = markLensed('call', sNorm, sNorm, gMode)`). **Engine /
settlement / `markLensed` / `gLoc` byte-UNCHANGED** — this is a draw-layer transform only.
**Feature mapping (inventory #1–#15):**
- **#15 (UI/render/depiction layer):** chart-2 value curve + mode line + strike markers normalized to
  a mode-peak-at-1 SHAPE; legend updated to "peak = 1 (mode, normalized)". Display transform only.
- **#6 / #7 (pricing read / ITM smooth-paste READ surface):** the chart-2 *depiction* of the lensed
  value is now a normalized shape; the underlying `markLensed` value (#7) is byte-unchanged — only its
  on-screen rendering is rescaled. SEE UNDESIRABLE: the rescale mathematically cancels the kurtosis
  knob's effect on this chart's shape.
- **#3 (kurtosis knob m) — REGRESSION on the VISIBLE-on-chart-2 surface** (engine value of m unchanged;
  what regresses is the *visibility* of m on chart-2, see UNDESIRABLE).
- **none beyond** — #1, #2, #4, #5, #8, #9, #10, #11, #12, #13, #14, #16 all UNCHANGED (byte-identical
  engine; pool fns still v24-identical; this is a chart-2 draw transform only).
**DESIRABLE (tester live ×2 byte-stable, build md5 `6a23f93de3cbcdbf832cb61115c129eb`, READ-ONLY on engine):**
- **[#15 / operator L2063] Mode now anchors at y=1.** Pixel apex psi = **1.0032 at φ=45°, y=17** vs the
  y=1.00 axis tick at y=18 (1px gap) — the operator's exact complaint is FIXED. The wings fall from the
  top toward 0 (put-wing 0.409 / call-wing 0.406). The φ_m dashed line meets the apex at the top, no
  floating gap. (`A_chart2_m1.png`.)
- **[#15 markers] Strike markers sit ON the normalized curve.** Band open (sold-call $120k / bought-put
  $48k / N=0.03): red(sold.inner θ=1.5) dot pixel-psi 0.643 vs analytic normalized curve 0.668 (dPsi 0.025);
  green(bought.inner θ=0.6) 0.610 vs 0.599 (dPsi 0.011) — both ≤ dot-radius tolerance. The `f6029182`
  `psiAt`-out-of-scope ReferenceError stays fixed (the inline lensed mark + same normalization is in scope).
- 0 console / 0 pageerror / 0 dialog ×2; gates `lens_selfcheck` 13/0 + `a16_atm_gate` 5/0 green;
  blobs canonical (webp L74 `ab663f5c…`, svg L1060 `c505b08a…`), 3 scripts parse.
**UNDESIRABLE — OPEN [#3 REGRESSION vs operator entry 226]:** **the normalization mathematically
ELIMINATES the kurtosis knob's effect on chart-2.** With the mode-peak normalization, in `markLensed`'s
continuation regime (the entire drawn curve, both arms) the call value `= sNorm/((g+1)·θ·((g+1)/g)^g)`
and the mode peak `= 1/((g+1)·((g+1)/g)^g)`, so **normalized = sNorm/θ** — the `g = m·γ` factor cancels
EXACTLY; the put arm normalizes to `θ/sNorm`, also g-free. Tester live ×2: the normalized wing values
are byte-IDENTICAL across m=1/3/6 (normPut(θ0.4)=0.4, normCall(θ2.5)=0.4, normDeepCall(θ5)=0.2 for ALL m;
widthAtHalf=345px for all m) and the **chart-2 screenshots are md5-IDENTICAL** at m=1 and m=3
(`A_chart2_m1.png` == `A_chart2_m3_kurt.png` = `e5789975db12d88bf2ce43fb3f4dd1d0`). The kurtosis knob is
NOW INVISIBLE on chart-2 — directly regressing operator entry 226 [verbatim-transcript
`2026-06-10_kurtosis-curve-family-brief.md` L1815: *"i want to see steeper when i set for higher vol, with
otm —> otm + "*], which the PRIOR constmult build `8f897edc` SATISFIED (chart-2 apex 0.25→0.105 steepened
with m). The two operator requirements (mode-at-1 AND knob-visible-steepening) are BOTH on chart-2 and
this normalization trades one for the other. **This is a product/UX decision for the operator** (a
normalization that preserves the knob's visible effect — e.g. fixing the y-axis to an absolute scale with
a "1.0" reference but NOT dividing out the peak, or normalizing only the mode reference while keeping the
absolute curve, or a different anchor — is a different design). FLAGGED to manager for operator escalation.
**OPERATOR-VOICE / OPEN QUESTIONS:**
- entry-L2063 [verbatim] mode-must-reach-1 → **RESOLVED(evidence)** by this build (apex at y=1, 1px).
- entry-226 [verbatim L1815] "steeper when I set for higher vol" → **REOPENED / OPEN** — this build makes
  chart-2 m-invariant; the knob's visible steepening is GONE. Cannot be marked resolved; it regressed.
- **OPEN QUESTION for the operator (escalate):** these two chart-2 requirements conflict under
  peak-normalization; which takes priority, or is a both-satisfying anchor wanted (absolute-scale with a
  visible 1.0 gridline; OR mode-reference-only normalization)?
EVIDENCE: `evidence/v28_chart2_norm/` (RESULT_run{A,B}.json byte-identical modulo run label; RUN_LOG_run{A,B}.txt;
A/B_chart2_m1.png, _m1_kurt.png, _m3_kurt.png [m1==m3 md5-identical — the FAIL], _band_markers.png; INDEX.txt).
Harness `engine/verify/pw_v28_chart2norm_smoke.mjs` (single A/B arg), live Playwright ×2, READ-ONLY.
**Table rows updated:** #15 (chart-2 mode-peak-at-1 normalization + markers normalized + legend; mode-anchor
operator complaint FIXED); #3 (kurtosis-knob VISIBILITY on chart-2 → REGRESSED: normalization cancels m,
chart m-invariant — entry-226 reopened); #6/#7 (chart-2 *depiction* of the lensed value rescaled, engine value
unchanged). **Rolling list:** new OPEN — CHART2-NORM-CANCELS-KURTOSIS (#3 visibility regressed vs entry 226).
md5 `9f1e625b`→`6a23f93d` (working-tree, NOT pushed). **Verdict = FLAG / FAIL — do NOT promote: fixes the
mode-anchor but regresses the kurtosis-visible requirement (entry 226); operator escalation owed.**

### dd6fb955 (working-tree candidate, NOT pushed) — chart-2 "MARK ACROSS STRIKES" replots the NORMALIZED STEEPNESS SHAPE (Option C) so the mode peaks at 1 AND the wings steepen with the slope-mult m (2026-06-22)
**Why (resolves the `6a23f93d` conflict, not waived):** the prior `6a23f93d` peak-normalization
(`psiN = psiAt/peakNorm`) anchored the mode at 1 but mathematically CANCELLED the kurtosis knob —
in `markLensed`'s continuation regime the normalized value reduces to `sNorm/θ` (call) / `θ/sNorm`
(put), g-free, so chart-2 was m-INVARIANT (m=1 and m=3 screenshots md5-identical `e5789975…`). The
two chart-2 operator requirements (mode-at-1 L2063 AND knob-visible-steepening entry-226) were
mutually exclusive under peak-normalization. **Option C dissolves it:** chart-2 no longer normalizes
a VALUE — it plots the lens WING LAW directly: `psi = (mode/θ)^(m·γ)` for the call arm, `(θ/mode)^(m·γ)`
for the put arm (`renderPricingFrame`→`psiShape`). At the mode `θ=mode` ⇒ `r=1` ⇒ `r^g = 1` by
construction (no division, nothing to cancel), and the `g=m·γ` exponent SURVIVES into the wings.
Strike markers (`drawStrikeMark`) use the SAME `r^g` shape. Caption + legend updated to "normalized
steepness shape, peak=1 (mode)".
**Delta (DRAW-LAYER ONLY, `renderPricingFrame`/`psiShape`/`drawStrikeMark`):** chart-2 plots
`(mode/θ)^(m·γ)` (call) / `(θ/mode)^(m·γ)` (put) — a normalized STEEPNESS SHAPE, not a peak-divided
value; mode peak = 1 by construction; markers use the same shape. **Engine / settlement / `markLensed`
/ `gLoc` byte-UNCHANGED** — this is a chart-2 draw transform only. md5 `9f1e625b`→`dd6fb955`
(supersedes `9f1e625b`; the demoted `6a23f93d` peak-norm candidate was never pushed).
**FEATURES (inventory #1–#15):**
- **#3 (kurtosis knob m) — VISIBILITY RESTORED on chart-2.** The `r^(m·γ)` shape steepens with m; m
  is once again visible on chart-2 (the `6a23f93d` cancellation is gone). Engine value of m unchanged
  (draw-layer); what changes is that the chart now DEPICTS the knob's effect.
- **#15 (UI/render/depiction layer):** chart-2 value plot replaced by the normalized steepness shape
  `r^(m·γ)`, peak=1 at the mode; strike markers use the same shape; caption + legend updated to
  "normalized steepness shape, peak=1 (mode)".
- **none beyond** — #1, #2, #4, #5, #6, #7, #8, #9, #10, #11, #12, #13, #14, #16 all UNCHANGED
  (byte-identical engine; pool fns still v24-identical; `markLensed`/`gLoc` byte-unchanged; this is a
  chart-2 draw transform only). Note: #6/#7 are the lensed-value READ surfaces — their underlying
  values are byte-unchanged; only chart-2's chosen DEPICTION (now a steepness shape, not the value)
  changed, which is a #15 depiction delta, not a #6/#7 engine delta.
**DESIRABLE (tester live ×2 byte-stable, build md5 `dd6fb9557c251df222a4f918970576dd`, READ-ONLY on engine):**
- **[#15 / operator L2063] Mode anchors at the top (peak=1).** Pixel apex psi = **1.0032 at the mode
  φ=45°** vs the y=1.00 tick (1px); analytic peak `r^g = 1.0` exact. The operator's mode-not-reaching-1
  complaint stays FIXED, and now without cancelling the knob.
- **[#3 / operator entry-226] Kurtosis knob VISIBLE again on chart-2 — the regression is CLOSED.** The
  3 chart-2 PNG md5s are now DISTINCT across m: **m=1 `e5789975…` / m=3 `aa411091…` / m=6 `6cf4cd81…`**
  (the `6a23f93d` build had m=1≡m=3 — that was the bug). width-at-half collapses **345→123→63 px** as
  m=1→3→6 while the apex stays psi≈1.00 every m. Visual: m=1 broad tent vs m=6 sharp spike, both
  peaking at the mode. (The m=1 PNG `e5789975…` equals the prior FAIL build's m=1 — EXPECTED, `r^1` is
  unchanged at m=1; the proof of the fix is m=3 and m=6 now DIFFER from it.)
- **[#15 markers] Strike markers sit ON the steepness-shape curve.** Band open (sold-call $120k /
  bought-put $48k / N=0.03): red(sold θ=1.5) dot-psi 0.640 vs shape 0.665 (dPsi 0.025); green(bought
  θ=0.6) dot-psi 0.604 vs 0.595 (dPsi 0.0085) — both ≤ dot-radius. Markers use the same `r^g` math as
  the curve.
- 0 console / 0 pageerror / 0 dialog ×2; gates `lens_selfcheck` **13/0** + `a16_atm_gate` **5/0** green;
  blobs canonical (webp L74 `ab663f5c…`, svg L1060 `c505b08a…`), 3 scripts parse.
**UNDESIRABLE:** none. (Engine math byte-unchanged; the prior peak-norm cancellation is GONE — chart-2
shows both mode-at-1 AND m-steepening, which were mutually exclusive on `6a23f93d`.)
**NEUTRAL:** caption + legend text changed to "normalized steepness shape, peak=1 (mode)".
**OPERATOR-VOICE / OPEN QUESTIONS:**
- entry-226 [verbatim-transcript `2026-06-10_kurtosis-curve-family-brief.md` L1815: *"i want to see
  steeper when i set for higher vol, with otm —> otm + "*] → **RESOLVED(evidence)** — chart-2 steepens
  visibly with m (3 distinct PNGs, width-at-half 345→123→63). The entry-226 regression introduced by
  `6a23f93d` is closed by this build.
- entry-L2063 [verbatim `…:2063`: mode-must-reach-1] → **RESOLVED(evidence)** — apex 1.0032 at the mode.
- **Both chart-2 requirements now hold together** (mode-at-1 AND knob-visible-steepening) — the
  operator product-call escalation that `6a23f93d` owed is no longer needed; Option C satisfies both.
EVIDENCE: `evidence/v28_chart2_optC/` (RESULT_run{A,B}.json byte-identical modulo run label;
RUN_LOG_run{A,B}.txt; A/B_chart2_m1.png `e5789975…`/_m3.png `aa411091…`/_m6.png `6cf4cd81…` [3 distinct
md5 — the FIX]; A_chart2_band_markers.png; INDEX.txt). Harness
`engine/verify/pw_v28_chart2optC_smoke.mjs` (single A/B arg), live Playwright ×2, READ-ONLY.
**Table rows updated:** #3 (kurtosis-knob VISIBILITY on chart-2 → RESTORED; steepens with m, 3 distinct
PNGs); #15 (chart-2 replots `r^(m·γ)` normalized steepness shape, peak=1, markers + caption/legend).
**Rolling list:** CHART2-NORM-CANCELS-KURTOSIS → **CLOSED / RESOLVED-in-`dd6fb955`** (Option C).
md5 `9f1e625b`→`dd6fb955` (working-tree, NOT pushed). **Verdict = PASS — 6/6 byte-stable ×2; PROMOTABLE.**


### 9fdde1de (working-tree, NOT pushed) — PKG-ITM v2 build (a): `markLensed` LINEAR re-seam — power continuation welded C¹ onto the LINEAR intrinsic (put seam S\*=K·g/(g+1), the 0.667K seam; call S\*=K·(g+1)/g)   [status: PROMOTION-GATING ACCEPTANCE, tester spec-§6 sweep ×2 byte-stable + STANDING UI SMOKE 17/17 — **VERDICT = PASS, ALL 5 ACCEPT ITEMS HOLD**] (2026-07-02)
**Why (operator entries 286/287+corrigendum, go 298, trust 299):** the entry-286 QC oracle sweep on
`dd6fb955` found the American-faithfulness defect the operator's headline question targeted — the
DISPLAYED put mark dipped BELOW linear intrinsic max(1−S/K,0) from S/K=0.80 down (16 of 25 swept
spots, max shortfall ≈ −0.248 at S/K≈0.30), and the empirical continuation→intrinsic seam landed at
S/K≈0.444=(g/(g+1))^g, not the paper's 0.667=g/(g+1). Root: the old `markLensed` ITM arm was a POWER
intrinsic `1−(S/K)^(1/g)` with a power-form seam. The v2 fix (one-function splice per
`specs/SPEC_pkg_itm_v2_engine_coords_2026-07-02.md`, intern build) replaces it with the entry-287
target object: continuation `ρ^(∓g)/(g+1)` in the moneyness ratio ρ=sNorm/θ, welded C¹ onto the
LINEAR parity intrinsic at ρ\*=g/(g+1) (put) / (g+1)/g (call); `V = max(mark, intrinsic)` holds
IDENTICALLY (O2 `value_ge_intrinsic`, trusted-from-prover), so no caller changed.
**Delta (ENGINE VALUE LAYER, `markLensed` only):** md5 `dd6fb955`→`9fdde1de`; pre-fix power-arm build
RETAINED as `temporal_mvp_v28_lens_powerarm.html` (=`dd6fb955`, the revert twin). Pool fns/tx-map/
`gLoc`/all callers byte-unchanged (CM8 pool byte-identity green). Every consumer of the one helper
(settle `markEff`, quotes `legPrice`, portfolio `pfComponents`, funding input) picks up the fix.
**FEATURES (inventory #1–#16):**
- **#7 (ITM American smooth-pasting) — THE change.** Linear re-seam: put seam ray `θ·g/(g+1)`
  (dollar S\*=K·g/(g+1); measured 0.667K at g=2, 0.857K at g=6), call `θ·(g+1)/g`; intrinsic arms now
  LINEAR parity (1−S/K / 1−K/S escrow fractions); boundary fraction 1/(g+1) both wings; C¹ weld
  (measured DOM slope quotients below). Replaces the power-intrinsic/power-seam arms.
- **#6 (pricing law):** continuation wings still EXACT power-laws of exponent m·γ (CM11:
  V(2ρ)/V(ρ)=2^(∓g) to 1e-12); quotes reshape everywhere EXCEPT ATM (the fixed point
  g^g/(g+1)^(g+1)) — g=2: OTM 1.2 drops 0.1235→0.1029, near-ITM 0.8 rises 0.1852→0.2315, past-seam
  = parity exactly. Disclosed, spec §4.3.
- **#9 (funding):** magnitudes re-scale wherever the consumed mark changed — FORMULA untouched
  (κ·(±g)·N·mark·(S−1)/S); shared-helper entailment, same class as settlement; funding REDESIGN
  stays excluded + operator-gated (entry-295/296 study).
- **#11 (dollar/settlement pipe):** callers byte-unchanged; live-confirmed BOTH regimes this run —
  OTM band close (both legs reversed on AMM, raw_net −1.97e-4 finite) AND deep-ITM close
  (sold-put θ=5 settled-to-cash: settled_cash_leg='sold', live_leg='bought', trader_payout −$8.09
  finite, pool finite, round-trip sane).
- **#15 (file-safety):** GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts
  parse, longest script line 603; gates rewritten per spec §7: `lens_selfcheck` **16/16 HARD**
  (CM4-v2 linear-seam C⁰ + CM4-v2-C1 one-sided slopes + CM10 value≥intrinsic 208-pt grid + CM11
  wing power-law; CM1–CM9 retained) + `a16_atm_gate` **5/5** (unchanged, ATM value algebraically
  identical); `monolith_consistency` 8/8 report-only, line (6) repointed to the v2 seams/O1
  provenance (not red-by-neglect). Build md5 UNCHANGED pre/post every run (tester READ-ONLY).
- **none beyond** — #1, #2, #3, #4, #5, #8, #10, #12, #13, #14, #16 all UNCHANGED: pool
  `tradeUpdate`/`arbitrageToOracle`/`rebase` byte-identical to v24 (CM8), tx-map θ_tx frozen (CM5/
  CM6/CM7), `gLoc`=m·γ untouched (CM1), knob semantics/clamp untouched (smoke S6), slippage/carry/
  rebase/strike-registration paths untouched (callers audit spec §4; rebase+re-ray exercised live
  across 52 sweep spots with g_loc pinned 2.000/6.000 at every row).
**DESIRABLE (tester live ×2 byte-stable, DOM-read per spec §6 — never the formula checking itself):**
- **[#7 ACCEPT-1] Paper-table reproduction EXACT at 4dp on the DISPLAYED mark.** g=2 column
  (γ=1,m=2; fixed-g equivalence to the paper's (γ=2,m=1) asserted by spec §1.3): S/K 1.5→0.0658,
  1.2→**0.1029**, 1.0→**0.1481**, 0.95→0.1642, 0.9→**0.1829**, 0.8→**0.2315**, 0.7→0.3023,
  0.6667→**0.3333**(=1/3 boundary), below seam = intrinsic (0.444→0.5560, 0.2→0.8000). g=6 column
  (γ=1,m=6): 1.2→**0.0190**, 1.0→**0.0567**, 0.95→0.0771, 0.9→**0.1066**, 0.8571→**0.1429**(=1/7),
  0.8→**0.2000**(intrinsic), 0.2→0.8000. Every pinned cell |Δ|=0.0 at 4dp.
- **[#7 ACCEPT-2] Sign table CLEAN — the entry-286 defect is GONE.** sign(mark−max(1−S/K,0)) ≥ 0 at
  ALL 26 spots × BOTH columns × both runs; `belowIntrinsic` array EMPTY (was 16 spots on
  `dd6fb955`); diff==0 (4dp) at/below the seam, strictly >0 above it.
- **[#7 ACCEPT-3] Empirical seam at the paper's boundary, NOT 0.444.** Nearest-to-boundary reading:
  S/K=0.66667 (mark 0.3333) for g=2 / S/K=0.85715 (mark 0.1429) for g=6; at the OLD 0.444 seam the
  mark now reads 0.5560 == linear intrinsic (screenshot `A_m2_oldseam_SK0p444.png` vs the 2026-06-26
  screenshot of 0.3337-vs-0.556). C¹ on DOM output: one-sided quotients g=2 left −1.002(ε.02)/
  −1.006(ε.005), right −0.954/−0.974 (expected −0.957/−0.989); g=6 left −0.998/−0.990, right
  −0.927/−0.990 (expected −0.923/−0.980) — all within the spec ±0.03, monotone → −1 as ε shrinks.
- **[#11/#15 ACCEPT-4] STANDING UI SMOKE-PASS 17/17** (`pw_pkg_itm_v2_smoke.mjs`): boot render;
  perp add-long/add-short/remove; LONG band execute (w 0.5→0.503231, KPI delta); RUN ARBITRAGE
  (w→0.500000 exact); ADVANCE TIME ×2 (t 0→1→2, kpi "0h"→"1h"); kappa-input; M-clamp 0.1→1 / 10→6 /
  3→3 with field writeback; chart-2 per-click m-delta (3 distinct canvas hashes m1/m3/m6); chart-2
  overlays identified (red #FF6767 sold dot 23px, green #14E800 bought dot 22px ON teal/pink curve
  arms); all 4 chart-select states render non-blank; band close OTM (both reversed); SHORT band
  execute; deep-ITM close settled-to-cash; export/import-chooser/LP deposit+withdraw (pool.y
  556963→581963→571963); RESET restores boot state; 0 console errors / 0 pageerrors / 0 dialogs.
- **[ACCEPT-5] Byte-stability:** RESULT_runA.json == RESULT_runB.json BYTE-IDENTICAL (logs differ
  only in the run-label line); build md5 `9fdde1de…` unchanged pre/post every run.
**UNDESIRABLE:** none found. (The entailed quote-reshape and funding-magnitude shift are DISCLOSED
design consequences of the operator-ruled target (entry 287), not regressions — say it the
skeptic's way: "the whole continuation reshapes; ATM alone is unchanged.")
**NEUTRAL:** g=0 exact value changes (old c·sNorm-type vs new 1) — unreachable via `gLoc` (NaN-loud),
disclosed spec §2.3. Lean bridge files (L7 EngineBridge / MonolithConstM paste_value) now describe
the RETAINED powerarm build, not HEAD — label-update queued to research-lead (spec §9.1).
**OPERATOR-VOICE (distilled from `history/operator/2026-06-10_kurtosis-curve-family-brief.md`, all [verbatim-transcript]):**
- entry-286 (L2233, tester dispatch): *"at each spot, is the engine's quoted ITM mark ≥ the true
  exercise payoff (i.e. faithful, value ≥ intrinsic) or does it dip below it? … Below-intrinsic
  anywhere = engine faithfulness bug, not a paper edit."* → **RESOLVED(evidence) in `9fdde1de`** —
  belowIntrinsic EMPTY at all 52 swept DOM readings ×2 runs (was 16 below on `dd6fb955`).
- entry-286 secondary: *"Where does the seam actually land in dollars — is it $66.67?"* →
  **RESOLVED(evidence)** — measured seam S/K=0.6667 (K=$60k ⇒ $40,000 = K·g/(g+1) at g=2) and
  0.857 at g=6; the 2026-06-26 finding "seam at 0.444, not 0.667" is **SUPERSEDED by the fix** (the
  0.444 point now reads pure intrinsic).
- entry-287 + CORRIGENDUM (L2250/L2374): *"Total value V = max(mark, intrinsic) … Never a raw
  capped-mark + intrinsic sum … the continuation must re-seam onto the linear intrinsic → S\* moves
  0.444K → 0.667K, matching the paper."* → **RULED + DELIVERED** — V=max holds identically (no max()
  in code, O2 witness + CM10 + DOM sign table); re-seam measured at 0.667K/0.857K.
- entry-298 (L2340): *"ok lets go!"* → **RULED** (go for build (a); this acceptance is its gate).
- entry-299 (L2346): *"but its a bit of an act / leap of trust for me, so just make sure you've got
  me covered by being rigorous"* → honored in this run: acceptance measured on DOM output per the
  skeptic-pinned §6 protocol (never the formula checking itself), ×2 byte-stable, nothing softened.
- entry-289 (L2266): paper edit REVERSED the vol-calibration direction (shallower curve = more
  volatile asset, γ(γ+1)=2r/σ²) — the engine UI text (LARGER M = MORE VOL framing) now contradicts
  the shipped paper; operator parked it to the part-2 app list → **OPEN** (rolling list -B289).
- entries 295/296 (L2322/L2330): build (b) display slice + unification (%→$ toggle, uncapped ITM
  wings, open/close symmetry, ITM funding / "extend the entire OTM machinery into ITM") →
  **OPEN/queued** (excluded from build (a) by spec scope; rolling list -B295).
EVIDENCE: `evidence/pkg_itm_v2_acceptance/` (INDEX.txt; RESULT_run{A,B}.json byte-identical;
RUN_LOG_run{A,B}.txt; SMOKE_RESULT.json + SMOKE_RUN_LOG.txt; 18 sweep PNGs incl. both seam
neighborhoods, the old-0.444 point, deep-ITM; SMOKE_deepITM_{pre,post}close.png;
SMOKE_chart2_band_m2.png). Harnesses `engine/verify/pw_pkg_itm_v2_acceptance.mjs` +
`pw_pkg_itm_v2_smoke.mjs`. Gates: `run_all.sh` GREEN (lens_selfcheck 16/16 + a16 5/5 HARD,
monolith 8/8 report-only, integrity header keyed to `9fdde1de`).
**Table rows updated:** #6, #7, #9, #11, #15. **Rolling list:** NEW -B286 (RESOLVED-in-`9fdde1de`),
-B289 (OPEN), -B295 (OPEN/queued).
md5 `dd6fb955`→`9fdde1de` (working-tree, NOT pushed; powerarm revert twin retained). **Verdict =
PASS — all 5 spec-§6 acceptance items hold; PROMOTABLE from the tester's side.**

### a6ca02f3 (working-tree, NOT pushed) — (b) DISPLAY SLICE + -B289 CAPTION FIX: chart-2 replots TRUE V per wing OTM+ITM (the Deribit-X, uncapped crossing wings, %/$ toggle) + SLOPE-MULT vol-direction caption corrected   [status: PROMOTION-GATING ACCEPTANCE, tester live ×2 byte-stable (28/29) + STANDING UI SMOKE 17/17 — was FLAG (ONE cosmetic finding, -B301-DASH); **-B301-DASH RESOLVED-in-`7015c22c` (dash-fix fold, targeted recheck 17/17 ×2, see addendum) — DISPLAY-SLICE ACCEPTANCE = PASS**] (2026-07-02)
**Why (operator entries 292/294/295, go 298+301):** the operator's unification brainstorm asked for
chart-2 to stop excluding the ITM wings — *"if that curve extended ITM like this image, does that
work"* (entry 292, Deribit screenshot), *"1. if we have a toggle from % terms to $ terms for the
second graph, and 2. if we don't cap the wings and let them cross over etc."* (entry 295) — and
entry 289's paper edit reversed the vol-calibration direction, leaving the UI m-caption
contradicting the shipped paper (-B289). Entry 301 *"ok to all still opens"* green-lit both as one
display slice (R6 FLAG-3 dispositions in the intern brief). Intern build: draw-layer + captions
ONLY; design source `notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md` items 1–2.
**Delta (DRAW/CAPTION LAYER ONLY):** md5 `9fdde1de`→`a6ca02f3`; **`<script id="engine">`
BYTE-IDENTICAL to the promoted `9fdde1de`** (tester node string-compare this session, 43156 bytes —
markLensed/gLoc/pool/settlement/funding/tx-map untouched). 4 spliced regions: R1 m-caption (-B289);
R2 chart-2 legend/caption + %/$ toggle buttons; R3 renderPricingFrame (psiShape tent RETIRED →
true-V curves per wing via the SAME `Engine.markLensed(wing,θ,sNorm,gLoc)` read settlement uses,
continuation solid / parity tail dashed, C¹ seams, per-view y-axis, $ clip at 1.25×S, markers
re-anchored + wing from `b.sold_wing`/`b.bought_wing`); R4 `setPricingUnit()` wiring on
`window.__pricingUnit`.
**FEATURES (inventory #1–#16):**
- **#3 (kurtosis/vol knob):** -B289 caption FIXED — live DOM: *"larger m ⇒ steeper everywhere. Vol
  calibration: MORE volatile asset ⇒ LOWER m (fatter wings, richer tails)"*; old "(more vol)" gone;
  geometry sentence intact (checks 6a/6b). m VISIBLE on the new chart through 3 channels (below).
- **#6 (pricing-law DEPICTION; engine value unchanged):** chart-2 now plots TRUE per-unit V per
  wing across ALL strikes (single-basis markLensed read), wings cross at ATM; %/$ views.
- **#7 (ITM smooth-paste DEPICTION; engine value unchanged):** the v2 seams are drawn and
  pixel-measured at the v2 positions; parity tails rendered as dashed escrow-claim segments;
  markers on-curve in the active view. Carries the ONE cosmetic FLAG (-B301-DASH).
- **#15 (file-safety / gates / UI):** GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060,
  3 scripts parse, engine block byte-identical; lens_selfcheck 16/16 + a16 5/5 HARD, monolith 8/8
  report-only, run_all exit 0; 0 console / 0 pageerrors ×2; md5 unchanged pre/post (READ-ONLY).
- **none beyond** — #1/#2/#4/#5/#8/#9/#10/#11/#12/#13/#14/#16 UNCHANGED (engine byte-identity is
  the proof for every math path; #11 settlement additionally live re-confirmed both regimes this
  run: OTM close settled_cash_leg=null raw_net −8.9e-6 finite; deep-ITM close oracle-12000
  sold-put θ=5 → settled_cash_leg='sold'/live_leg='bought', payout $95.18 finite, pool finite).
**DESIRABLE (tester live ×2 byte-stable, 29-check harness, pixel-measured vs analytic):**
- **[#6 THE X, both views]** put wing spans OTM AND ITM (391/253 columns left/right of ATM), call
  mirrored; crossing AT ATM: % v=0.15 (analytic (g/(g+1))^g/(g+1)=0.1481, gap 2px), $ $12,013
  (analytic $11,852). % wings saturate → 1 deep ITM (0.968 measured @φ88°/φ2°).
- **[#6 %→$ toggle]** `pricing-unit-pct`/`-usd` buttons flip unit + active class + rescale (hash
  differs); toggling back is byte-identical (hash equal); y-ticks/axis-label per view; $ ref line
  = spot S. $ ITM put tail exits the frame CLEANLY at the 1.25×S clamp — top-edge hit x=658
  (analytic 660 = K=2.25×S), ZERO put pixels beyond exit+40, no NaN/blowup, 0 errors.
- **[#7 seams at the v2 positions]** put dash-onset measured φ≈56.5° ⇒ S/K=0.71-class window
  around g/(g+1)=0.667 — and NOT 0.444 (that would be φ≈66°); call onset φ≈33.9° ⇒ θ≈0.667;
  boundary height pixel-read 0.3307 (analytic 1/(g+1)=0.3333); engine markLensed(put,1.5,1,2)
  = 0.3333 exact.
- **[#7 markers ON curve, both views, toggled while a band is open]** sold-call $120k red +
  bought-put $48k green dots sit ON the plotted curves at the markLensed read in the ACTIVE view:
  % dR=1.13px/dG=1.15px; $ dR=1.18px/dG=1.09px (vs analytic; on-curve vs adjacent curve pixels
  ≤1px). The old psiShape-normalized marker convention is gone with the tent.
- **[#3 m-knob 3 channels]** M=1/3/6: 3 DISTINCT hashes; wings steepen (put v@φ20°
  0.092→0.0068→0.0034; call v@φ75° 0.0682→0.0034→…); seams march INWARD (63.4°→53.1°→49.8° vs
  analytic 63.43/53.13/49.40); ATM crossing FALLS (0.2523→0.1074→0.058 vs 0.25/0.1055/0.0567).
- **[#15 regression smoke]** trade open/execute (w moves), arb (w→0.5 exact, g_loc re-pins 2.000),
  OTM close + deep-ITM close both sane, all 4 chart states render non-blank, STANDING UI SMOKE
  17/17 re-run on THIS md5 (perps/tick/kappa/M-clamp/overlays/export/LP/reset); 0 console /
  0 pageerrors / 0 dialogs; RESULT_runA == RESULT_runB byte-identical; md5 unchanged every run.
**UNDESIRABLE:**
- **-B301-DASH (was the FLAG; RESOLVED-in-`7015c22c`, see addendum):** the $-view put parity tail rendered effectively SOLID — the
  [5,3] dash is set in code but AA swallows ~70% of its gaps on the steep clamp segment
  (true per-pixel row coverage 0.9647; legible dash <0.9; the $ call tail 0.51 and % tails ~0.54
  are legible). The pool-quote vs escrow-claim distinction is illegible exactly on the unbounded
  ITM put tail in $. Reproduced ×2; `A_zoom_usd_puttail.png` (6×). Draw-layer one-liner fix
  candidate (steeper-segment dash period / screen-space dashing). Blocks a clean PASS on
  acceptance item 1 ("tails DASHED … in BOTH views"); everything else green.
**NEUTRAL:** legend rewritten (quoted-pool vs parity-escrow per wing; "peak = 1 (mode)" item
REMOVED); mode φ_m line now ends AT the curve (peak-at-1 apex convention retired); per-view
y-axis label; caption rewritten to the true-V depiction. Intern-flagged residue for manager:
run_all.sh line-8 md5 pin stale (`9fdde1de`), engine comments L1622/L2337 still old vol phrasing
(non-rendered).
**OPERATOR-VOICE (distilled from `history/operator/2026-06-10_kurtosis-curve-family-brief.md`, all [verbatim-transcript]):**
- entry 292 (L2290, + Deribit screenshot): *"if that curve extended ITM like this image, does that
  work etc. ; the second chart as of not excludes these ITM 'wings'"* → **DELIVERED** — ITM wings
  drawn both views; the $ view IS the Deribit picture (straight K−S/S−K tails, X at ATM).
- entry 294 (L2306): *"you're literally saying that the dollar version of our curve is that? …
  explain this like to me like i'm an ape"* → **EVIDENCED on screen** — the $ toggle shows the
  linear ITM wings measured as exactly K−S (put tail hits the clamp at K=2.25S analytic-exact).
- entry 295 (L2314): *"1. if we have a toggle from % terms to $ terms for the second graph, and
  2. if we don't cap the wings and let them cross over etc. … (subject to it not breaking
  anything etc., and if entire value / payout are now read off the curve and its still
  american-style-perp-option-faithful)"* → **DELIVERED items 1+2** (single-basis markLensed read =
  the V=max object; "not breaking anything" = engine byte-identity + smoke 17/17 + gates 16+5);
  items 3/4 (open/close symmetry, ITM funding) **OPEN** (rolling -B295, PARTIAL).
- entry 296 (L2322): *"extend the entire OTM machinery into ITM (with the right natural extension
  for pool curve and anchor curve)"* → **CONTEXT/OPEN** — this slice is display-only; the engine
  extension is the operator-gated unification study, NOT claimed here.
- entry 298 (L2338): *"ok lets go!"* / entry 301 (L2390): *"ok to all still opens"* → **RULED**
  (the go this slice executes under; this acceptance is its gate).
- entry 299 (L2346): *"make sure you've got me covered by being rigorous"* → honored: 29 checks
  pixel-vs-analytic ×2 byte-stable + standing smoke; the one blemish FLAGGED, not softened.
- entry 289 (L2266, vol-direction reversal): → **RESOLVED(evidence)-in-`a6ca02f3`** (rolling
  -B289; caption reads MORE volatile ⇒ LOWER m, matching the shipped paper).
- **RE-DISPOSITION (per intern FLAG-3(iii), entry-298/301 scope — deliberate replacement, NOT a
  silent regression):** entry 226 (L1815: *"i want to see steeper when i set for higher vol, with
  otm —> otm +"*) and entry 266/L2063 (*"the goddamn mode thing in second chart isnt reaching the
  top ('1') … beats the mfing puepose of the goddamn chart"*) were dispositions ON THE TENT
  DEPICTION (Option-C steepness shape, `dd6fb955`), which this slice deliberately REPLACES with
  the true-V chart the operator asked for in entries 292/295 → both re-dispositioned
  **RETIRED-by-entry-298/301-scope**. What survives of their substance is re-evidenced on the NEW
  chart: steeper-with-higher-knob remains VISIBLE (3 channels, check 5a–d); the peak=1-at-mode
  convention is RETIRED BY DESIGN (mode line ends at the curve; ATM crossing <1 is the truthful
  smooth-paste value; deep-ITM saturation → 1 is where "reaching 1" truthfully lives now, and the
  caption says so). NOTE the vol-DIRECTION language in entry 226 ("steeper = higher vol") was
  itself superseded by the operator's entry-289 paper edit — the new caption carries entry-289.
**EVIDENCE:** `evidence/display_slice_acceptance/` (INDEX.txt; RESULT_run{A,B}.json BYTE-IDENTICAL;
RUN_LOG_run{A,B}.txt; {A,B}_chart2_pct_m2 / _usd_m2 / _pct_m1 / _pct_m6 / _band_pct / _band_usd
PNGs; A_zoom_usd_puttail.png = the FLAG exhibit; STANDING_SMOKE_RESULT.json 17/17 + logs + 3 PNGs).
Harnesses `engine/verify/pw_display_slice_acceptance.mjs` (A|B) +
`pw_display_slice_standing_smoke.mjs`. Gates: `run_all.sh` GREEN exit 0 on this md5.
**Table rows updated:** #3, #6, #7, #15. **Rolling list:** -B289 → RESOLVED-in-`a6ca02f3`;
-B295 → PARTIAL (items 1+2 delivered); NEW -B301-DASH (OPEN, cosmetic).
md5 `9fdde1de`→`a6ca02f33aa6500d4803a5273bc10989` (working-tree, NOT pushed). **Verdict (as measured
on `a6ca02f3`) = FLAG — 28/29 ×2 byte-stable + smoke 17/17; the -B301-DASH cosmetic finding was the
ONLY blocker.**

**ADDENDUM — -B301-DASH FIX FOLD `7015c22c` (2026-07-02, tester targeted recheck 17/17 ×2 byte-stable — ACCEPTANCE NOW = PASS):**
Intern draw-layer-only fix on the same slice, md5 `a6ca02f3`→`7015c22cbd8e78238bdd621f6126713d`;
`<script id="engine">` AND `<script id="state">` BYTE-IDENTICAL to promoted `9fdde1de` (tester
node string-compare; ui block only). Two-part fix at renderPricingFrame: **(i)** parity-tail dash
made SCREEN-SPACE — `[8,6]·cssScale` canvas-px (cssScale = W/clientWidth, measured 1.2968;
fallback 1), replacing the AA-swallowed [5,3]; **(ii)** plotted value coordinate-clamped to
`min(viewVal, 3·yMax)` so the quasi-infinite $ put-tail canvas coordinates no longer defeat dash
rasterization on frame-crossing segments. Recheck (`engine/verify/pw_b301_dash_recheck.mjs`, A/B):
- **THE FLAG ITEM CLOSED [#7]:** $ view M=2 put parity tail (seam→clamp exit) per-pixel ROW
  coverage **0.4941** (was 0.9647; legible <0.9) — visually confirmed distinct dashes with clean
  gaps at 6× (`RECHECK_A_zoom_usd_puttail.png`, byte-identical A/B). $ call tail 0.5067; % tails
  0.5067/0.5336; ALL four tails now legibly dashed; continuations still solid (%: 0.9897/0.9906,
  $: 0.9897/0.9977 — EXACT match to a6ca02f3 4dp).
- **NO in-frame geometry change [#6/#7]:** dash-independent anchors EXACT vs a6ca02f3 — % X
  crossing x=462/v=0.15, boundary height v=0.3307, deep saturation 0.9682/0.9682, $ crossing
  $12,013, clamp exit top-edge x=658 (yMin 22 vs 21, ≤1px). Clamp proven analytically INERT in %
  view (max viewVal 0.9983 < 3·yMax=3.15 ⇒ % polyline point-identical; only the dash pattern
  differs). Dash-onset detector readings shifted put +4px/call −1px — within the ±7px bound of the
  first-dash lengthening (5→10.4 canvas-px), a dash-pattern arithmetic consequence, NOT a seam
  move; seam still 0.667-class (φ55.7°, S/K=0.682), not 0.444-class.
- **Stability/safety [#15]:** two $ redraws byte-identical + %→$→% round-trip byte-identical;
  RESULT_runA==runB byte-identical modulo label; zoom PNGs md5-identical A/B; 0 console /
  0 pageerrors / 0 dialogs across load+toggles+one m-change (M=6 ⇒ g=6, distinct hash); build md5
  `7015c22c` UNCHANGED pre/post every run (READ-ONLY); blobs canonical `ab663f5c…` L74 /
  `c505b08a…` L1060, 3 scripts parse (longest non-blob 1217); run_all GREEN exit 0 on this md5
  (lens_selfcheck 16/16 + a16 5/5 HARD, monolith 8/8 report-only) — and the run_all line-8
  integrity pin is NOW KEYED to `7015c22c` (the a6ca02f3 stale-pin residue is closed).
- **Feature mapping:** #7 (seam DEPICTION legibility — the fix), #15 (file-safety/gates/pin);
  **none beyond** — #1–#6/#8–#14/#16 untouched (engine+state byte-identity is the proof; all
  a6ca02f3 measurements carry). Prior 28/29 PASS items carry per manager brief (fix cannot
  plausibly disturb them; the geometry anchors above verify the overlap).
Evidence `evidence/display_slice_acceptance/RECHECK_*` (RESULT_run{A,B}.json, RUN_LOG_run{A,B}.txt,
RECHECK_{A,B}_zoom_usd_puttail.png, RECHECK_{A,B}_chart2_usd_m2.png). **Rolling -B301-DASH →
RESOLVED(evidence)-in-`7015c22c`. DISPLAY-SLICE ACCEPTANCE = PASS — no standing tester FLAG on
this build; promotable from my side (manager promotes).**


---
### 0e0a0062 (working-tree, NOT pushed) [since COMMITTED to main `ecb9c444`] — CAPTION/COMMENT SLICE on `e148c9b7` (strings/comments ONLY, zero behavior): -TP339-CAPTION folded (Invariant Watch + Pool State now state the trade-point (α_T,β_T) law, machine-epsilon scoped to ρ=1 paths) + R6 item-3 stale engine comments fixed (entry-289 vol direction ×2 — "MORE volatile ⇒ LOWER m" — + closeBand barrier-era paragraph) + R6 item-4 chart-2 unit label "% of escrow unit"→"fraction of escrow unit" / caption "Fraction view"   [status: tester live recheck `pw_caption_slice_recheck.mjs` **11/11 PASS ×2 byte-identical** — captions verified rendered, NO stale "trades preserve"/"α/β-conserving"/"% of escrow unit" anywhere in body.innerText, chart-2 NOT rescaled (% X crossing x=462 v=0.15 + put-seam boundary v=0.3307 == e148c9b7/7015c22c prior-run anchors, unit toggle flips + returns byte-identical hash 685e5a5c9b61), tradeUpdateAt exhibit 215/22 / 11 / 11/21 exact in-page, open/close round-trip restores (x,y,w,α,β) rel 0.0, 0 pageerrors, all 4 chart states render, blobs canonical, run_all GREEN (lens 24 + a16 5 HARD; monolith 8/8 report-only; integrity pin keyed to `0e0a0062`). **Feature map: #15 (chart/UI depiction strings) ONLY — none beyond #1–#16; engine behavior byte-equivalent (all e148c9b7 acceptance anchors reproduced).** OPERATOR-VOICE: no new operator words on this slice (overnight go = entry 377 covers it); -TP339-RATIFY (#16 PROVISIONAL) unchanged, still awaits operator ratification. Evidence `evidence/caption_slice_recheck/`. **VERDICT = PASS.**] (2026-07-02)

---
### e148c9b7 (working-tree, NOT pushed) [since COMMITTED to main `ecb9c444`] — TRADE-POINT CONSERVATION (paper Eq. 2 / Trade Formula): the LIVE trade path anchors at T = ray∩curve (`tradeUpdateAt`), α,β genuinely move on off-ATM trades, close = frozen-ARC exact reversal (`revertArc`), depth guard at the tx-ray, per-leg preview animation [⚖ entry 405: frozen-arc close RULED-SUPERSEDED-pending-build — close-(b) first-class trade; rolling -CLOSE405]   [status: PROMOTION-GATING ACCEPTANCE, tester live 14/14 ×2 byte-stable + adapted STANDING UI SMOKE 17/17 ×2 byte-identical — **VERDICT = PASS**, one NEW depiction UNDESIRABLE (stale α/β-conservation captions, OPEN intern one-liner) + inventory **#16 marked PROVISIONAL pending operator ratification of the 5 spec pinned defaults** (skeptic R6 condition)] (2026-07-02)
**Why (operator entry 339, ruled; go = entry 377 overnight authorization):** the shipped engine
applied the conservation law at the RESERVE point with global α,β preserved — the paper's Trade
Formula applies it at the trade's own point T with the LOCAL pair α_T,β_T and reads w′ off the
displaced T (exhibit w′=11/21; old engine gave 6/11). Spec
`specs/SPEC_tradepoint_conservation_2026-07-02.md` (research-lead, measured); intern splice;
manager pre-verified (run_all 24+5 green, vm anchors machine-exact, spot-trio byte-identity).
**Delta (ENGINE + state + draw):** md5 `7015c22c`→`e148c9b734abdff522c31c56be41fb66`; revert twin
retained `temporal_mvp_v28_lens_reservepoint.html` (=`7015c22c`). NEW `tradeUpdateAt(s,dy,rho)`
(Identity IV′) + `revertArc(s,arc,rr)`; `executeLeg` routes the swap through `tradeUpdateAt` at
ρ_tx=θ_tx/mode and stores the arc {dxA,dyA,dwA,oOpen} per leg; depth guard → trade-point depth
w·y·ρ^w with the reject string citing the tx-ray; `closeBand` OTM reversals via `revertArc`
(legacy no-arc bands fall back to today's path); preview stashes frozen per-leg {dy,ρ};
`framePool` animates PER-LEG SEQUENTIAL through the same pure `Engine.tradeUpdateAt`.
**SPOT trio `tradeUpdate`/`rebase`/`arbitrageToOracle` BYTE-IDENTICAL to `7015c22c` — tester
re-verified this session by function-body string-compare, independent of the manager's check.**
**FEATURES (inventory #1–#16):**
- **#16 (warp-with-trades / trade-point anchoring): THE GAP CLOSES — IMPLEMENTED, PROVISIONAL.**
  The "transformation-faithful, anchoring-OPEN" label is retired IN THE BUILD; live evidence: the
  paper exhibit reproduced IN THE PAGE (T2: tradeUpdateAt((10,10,½),dy=+1,ρ=4) → x′=9.772727272727273
  =215/22 (|Δ|≤1e-13), y′=11 exact, w′=0.5238095238095238 =11/21 (|Δ|≤1e-15), NOT the naive 22/43);
  ρ=1 reduction ≡ spot tradeUpdate (maxRel 1.5e-16). **PROVISIONAL: the 5 spec pinned defaults
  (FLAG-1 ρ registration basis, FLAG-2 frozen-arc close, FLAG-3 undo-own-increment, FLAG-4 T at
  θ_tx, FLAG-5 legacy fallback) were adopted under the entry-377 overnight go, NOT individually
  ratified — operator ratification owed (rolling -TP339-RATIFY); label flips are manager/skeptic-owned.**
- **#2 (curve warp):** off-ATM trades now genuinely move α,β and re-anchor the curve — every sweep
  open moved α (T3b, e.g. deep call/put band Δα=−3.9e-3) and chart-1 re-rendered (T5b hash
  6019540f→51e4c106). ATM (ρ=1) keeps α,β steady (T2b, 1.5e-16).
- **#10 (slippage/depth basis):** depth guard MOVED to the trade point — put-wing capacity
  genuinely thinner: measured reject at $200,000 tx-ray depth (ρ=0.25, w=½) where the old y−β
  guard held $400,000 (T6a: cash $200,000 ≥ 0.9×$200,000 rejected, < 0.9×$400,000 = old law would
  execute). Honest reason string, no silent cap (T6b: notional field stays "10", 0 bands opened,
  execute disabled).
- **#11 (dollar/settlement pipe):** close now round-trips via the frozen arc — 5-band sweep
  restores (x,y,w,α,β) to machine zero (T3, residuals 0 to ≤1.2e-10); with an INTERVENING trade
  the closing legs' own increments net out EXACTLY (T4: resid x=0, y=9.1e-13, w=5.6e-17) and
  closing both returns the original pool EXACTLY (T4b: 0/0/0). ITM settle path unchanged (smoke
  S11: sold-put settled-to-cash at oracle 12000, payout −$8.10 finite, pool finite).
- **#15 (file-safety/gates):** GREEN — blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3
  scripts parse (longest non-blob 1217), run_all exit 0: lens_selfcheck **24/24 HARD** (incl. NEW
  CM8-v2 exhibit-hard + routing negative-control, CM6-v2 frozen-arc + live-reversal negative
  control) + a16 **5/5**; monolith 8/8 report-only with line 7 re-scoped "SPOT LAW ONLY"; 0
  console / 0 pageerrors / 0 dialogs every run; build md5 UNCHANGED pre/post (READ-ONLY).
- **none beyond** — #1 (pool base: spot trio byte-identical, tester-verified), #3 (m knob: smoke
  S6/S6b clamp + 3 distinct hashes), #4/#5 (carry/rebase byte-identical; fixed-ρ rebase
  commutation gate-covered), #6/#7 (mark/lens layer untouched: CM1–CM4/CM9–CM11 + a16 green),
  #8, #9 (funding untouched), #12, #13, #14 unchanged.
**DESIRABLE (tester live ×2 byte-stable, 14-check acceptance + 17/17 smoke ×2):**
- **[#16 exhibit live]** the paper's §2.3 numbers are now what the SHIPPED page computes (T2).
- **[#16/#11 arc exactness]** 5 open/close configs — both wings, deep OTM (call $200k/put $20k;
  put $30k/call $180k), near-ATM, m=1 AND m=2 — ALL restore machine-exact; every open re-leans w
  by the trade-point amounts (Δw −1.9e-3…+3.1e-3, signs per wing).
- **[#2 §4-2 delta VISIBLE + measured]** iv-alpha/iv-beta readouts now move on an off-ATM open:
  iv-alpha "−8.8818e-16"→"−2.6695e-4", iv-beta "0"→"100.2216" (the standard $120k/$48k N=0.03
  band), and return to ~0 on close (α 8.9e-16, β 1.2e-10). Today's law provably never moved them.
- **[#2 arb re-lean, disclosed]** after the standard band + arb, mp/oracle = 1 EXACT but w =
  0.499962, NOT 0.5 (|w−0.5| = 3.8e-5) — the arb equilibrium lean is now β/α-dependent (spec §4
  delta 2). The OLD smoke S4 ("arb → w=0.5 exactly") fails by exactly this delta — diagnostic run
  kept as evidence; smoke updated to S4-v2 (mp==oracle ≤1e-9 + re-lean RECORDED), an expectation
  correction WITH PROOF, not a patch-toward-green.
- **[#10 guard]** trade-point depth reject verbatim: "At-strike cash $200000.00 exceeds 90% of
  pool cash depth at the tx-ray $200000.00 — trade rejected." — engine probe AND UI warn banner.
- **[#16 preview]** per-leg animation runs (11/16 distinct frames over the 0.8s sweep, 0 errors);
  the s=1 endpoint == the Engine.tradeUpdateAt chain over the frozen {dy,ρ} == __previewPool
  (rel 0 — machine-identical), so the drawn path is the money path.
- **[#15 smoke]** adapted standing smoke 17/17 ×2 byte-identical (perps, band exec w 0.500000→
  0.503106, arb S4-v2, ticks, kappa, M-clamp, overlays red 20/green 23 px on arms, all 4 chart
  states, OTM close raw_net −1.98e-4, SHORT band, deep-ITM close, export/import/LP/reset, 0 errors).
**UNDESIRABLE:**
- **-TP339-CAPTION (NEW, OPEN — intern one-liner, depiction only):** two on-screen texts still
  assert the OLD law and now contradict the page's own readouts: L1340 Invariant Watch caption
  "Identity IV: trades preserve α, β, and (x−α)(y−β) = αβ. Drifts here should track
  machine-epsilon only." (β drift visibly reads 100.2216 two lines below it after an off-ATM
  open) and L1368 Pool State card subtitle "closed-form · α/β-conserving · Identity IV". Spec
  §2.7 moved the CODE comments but missed these two UI strings. Operator-caught-class (same as
  aa1e5d05 / -B289 caption defects) — fix before or at promotion recommended; does not gate
  behavior.
- **#16 PROVISIONAL (OPEN, operator-tier — rolling -TP339-RATIFY):** the 5 pinned spec defaults
  await ratification; the build is reversible (revert twin retained) and each default is
  documented with its measured alternative in spec §6.
**NEUTRAL:** monolith line-7 label re-scope ("SPOT LAW ONLY"); lens_selfcheck header re-worded
(spot fns byte-identical; live path = trade-point law); executeLeg return gains rho_tx + arc;
smoke harness fork `pw_tradepoint_standing_smoke.mjs` (S4-v2 documented in-header).
**OPERATOR-VOICE (distilled from `history/operator/2026-06-10_kurtosis-curve-family-brief.md`, all [verbatim-transcript]):**
- entry 339 (L2694): *"and 2 is a flatout regression repeated muktiple times (should be trade
  point....) to be fixed in html and in paper if thats in paper"* → **RULED + DELIVERED (HTML
  side)** — this build is the ordered fix; the exhibit w′=11/21 is now engine-true (T2, live DOM
  context). Paper side: audit + skeptic had confirmed the paper already tells the trade-point
  story — no paper change in this build (spec §0).
- entry 377 (L2933): *"anything pending on HTML do it while i sleep no questions"* → **RULED (the
  go this build executes under)** — spec's 5 pinned defaults adopted in lieu of the 5
  operator-FLAG confirmations, documented + reversible; **ratification still owed when the
  operator wakes (rolling -TP339-RATIFY)**; #16 stays PROVISIONAL until then.
- entry 16, 2026-06-10 (standing ruling): *"yes its w that the trade changes (while x and y also
  change to be faithful to actual reserves, refer the paper) and that warps it"* →
  **RESOLVED(evidence)-in-`e148c9b7`** — w is what the trade changes (w′ read at displaced T),
  x,y move by the actual reserve flows, and the curve genuinely warps (α,β move, chart-1
  re-anchors). The 2026-06-10 ruling finally has a conforming engine.
**EVIDENCE:** `evidence/tradepoint_acceptance/` (RESULT_run{A,B}.json BYTE-IDENTICAL modulo run
label; RUN_LOG_run{A,B}.txt; {A,B}_drift_readout.png, {A,B}_depth_guard.png,
{A,B}_preview_endstate.png; TP_SMOKE_RESULT_run{1,2}.json BYTE-IDENTICAL + logs + 3 smoke PNGs;
INDEX.txt). Harnesses `engine/verify/pw_tradepoint_acceptance.mjs` (A|B) +
`pw_tradepoint_standing_smoke.mjs`. Gates: `run_all.sh` exit 0 on this md5 (lens 24/24 + a16 5/5
HARD; monolith 8/8 report-only), tester-re-run this session. Old-smoke diagnostic (16/17, S4 the
predicted+disclosed delta) run and recorded in-session.
**Table rows updated:** #2, #10, #11, #15, #16. **Rolling list:** NEW -TP339-RATIFY (OPEN,
operator-tier), NEW -TP339-CAPTION (OPEN, intern one-liner).
md5 `7015c22c`→`e148c9b734abdff522c31c56be41fb66` (working-tree, NOT pushed). **Verdict =
PASS — 14/14 ×2 byte-stable + smoke 17/17 ×2; promotable from my side ONCE the manager weighs
-TP339-CAPTION (recommend folding the two-string caption fix); #16 stays PROVISIONAL pending
operator ratification (manager/skeptic own the inventory label flip).**


---
### 4bc939ec — FUNDING P/L COLUMN slice (operator entry 425; R6 scope-gate #2 sign-pin + disclosure conditions) on ratified `0e0a0062`   [status: PROMOTED HEAD 2026-07-03 — tester live acceptance **16/16 PASS ×2 byte-stable** + STANDING UI SMOKE **17/17 ×2 byte-identical** + gates 24+5 HARD — **VERDICT = PASS**] (2026-07-03)
**Scope (verified, not assumed):** display/read layer ONLY. Tester node-compared the script blocks
against committed `0e0a0062`: `engine` (47,866 b) and `state` (24,041 b) BYTE-IDENTICAL; the full
file delta = the 6 spliced regions (header th, units-note, renderBands funding calc, band cell,
component cell, total cell + $-cell) — nothing else differs. Stored funding ledger, `fundingTick`,
`fundingPerStrike`, `closeBand` untouched.
**FEATURES: #9 (funding — DISPLAY layer) — none beyond #1–#16.** (#15 file-safety re-verified as
standard: blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse, run_all exit 0 with
the integrity pin re-keyed to `4bc939ec`; not a delta.)
**DESIRABLE [#9]:**
- The Funding column is now a SIGNED P/L EFFECT (+ = line received, − = line paid), rendered on
  EVERY band line — band row, both component rows, total row — live-DOM verified numeric ×2.
- Line P/L is funding-INCLUSIVE: Total $-cell = L₀·raw_net·equity + fundingP/L×oracle. ON-SCREEN
  behavioral proof (2 opposite bands, crowded long B1 sold-call $120k/bought-put $48k N=0.03 +
  contrarian short B2 sold-put $60k/bought-call $100k N=0.03; oracle→88000 via #kpi-oracle; 24
  clicks of #btn-tick = 24h): **PAYER B1 funding cell −0.000469 (NEGATIVE on screen), P/L
  −$4.50 → −$45.75 (FALLS, Δ −$41.25 == cell×oracle −41.27 at 6dp rounding); RECEIVER B2 cell
  +0.000531, P/L $5.53 → $52.25 (RISES, Δ +$46.72 == 46.73)**. Component cells B1
  −0.000234/−0.000235, B2 +0.000264/+0.000267; band cell == Σ component cells.
- SIGN PIN (R6 gate-#2 condition 1) verified two ways: displayed cell == −Σ stored trader-pays
  accruals (6dp, both bands, DOM vs Store cross-read); and independently reproduced the
  intern/manager node payer-falls harness (`engine/evidence/check_funding_pnl_2026-07-03.js`) on
  the promoted build: payer stored +0.08355060 → col −0.08355060, P/L falls −573.37 → −7925.82;
  receiver col +0.14060850, rises 1347.43 → 13720.97 (PASS/PASS).
- DISCLOSURE (R6 gate-#2 condition 2) rendered and visible: header th title ("signed: + = line
  received, − = line paid … includes accrued funding; cash at close settles ex-funding until the
  transfer layer ships"), the pf-units-note caption (visible on the Portfolio→Bands panel,
  includes-accrued + EX-funding sentences), and the Total $-cell tooltip ("… PLUS funding P/L ×
  oracle. INCLUDES accrued funding; cash at close settles ex-funding …").
**INTENDED BEHAVIORAL DELTA (not a regression — recorded per manager task item 3):** the displayed
sign convention is INVERTED vs the pre-425 display. The old column printed the RAW stored
trader-pays sum (a paying line read POSITIVE, and funding never entered the $ P/L); the new column
negates it into a P/L-signed figure and adds its $ value into the line P/L. That inversion IS the
fix (R6 sign pin). Diff-verified against `0e0a0062` (old: `fmtNum(bandFunding,6)` /
`fmtNum(c.funding,6)`, dollarFigure without a funding term).
**UNDESIRABLE [#9, cosmetic]:** -FPNL-NEGZERO — with zero accrued funding the negated cells render
`-0.000000` (JS −0 through fmtNum) pre-tick; reads as a tiny negative. OPEN (cosmetic, non-gating),
added to the standing reconciliation list; intern one-liner candidate.
**NEUTRAL:** perps table byte-untouched (header has NO funding column; tbody innerText pre==post
across 24 ticks); all 4 chart states render non-blank (curve 14,852 / pricing 12,596 / trajectory
7,232 / payoff 111,134 nonBlank px); 0 console errors / 0 pageerrors / 0 dialogs ×2.
**OPERATOR-VOICE (distilled from `history/operator/2026-06-10_kurtosis-curve-family-brief.md`):**
- entry 425 (L3191) [verbatim-transcript]: *"trade poont ok, funding is column adds to p/l in
  portfolio for position line wise…; do needful"* → **RULED + DELIVERED (this build):** funding is
  a per-position-line column AND adds into that line's displayed P/L (the two on-screen proofs
  above). The manager's scope-read (surface the EXISTING per-leg ledger; NO inter-club cash
  transfer — part-2 stays parked; no new knobs) is what shipped, and the parked part-2 is DISCLOSED
  on screen ("cash at close settles EX-funding until the funding transfer layer ships") rather than
  silently implied. The same entry's *"trade poont ok"* = -TP339-RATIFY RESOLVED-by-RULING (rolling
  list updated; the #16 label flip was manager/skeptic-executed, commit `9b32de6`).
- entry 232 (L1865) [verbatim-transcript] *"funding slope deviation thing would be as seej thru the
  lens"* → STANDING, unaffected: this slice changes only the DISPLAY of accruals;
  fundingPerStrike/fundingTick byte-identical (m-coupled magnitudes unchanged).
- No new operator objections on this build in the transcript (entries 414–425 scanned; 415–424 are
  the close-(b)/LP-attack/entry-liquidity thread → -CLOSE405 UNTOUCHED, still OPEN/parked per entry
  424 *"keep this fix in notes for now— dont lose it"*).
**EVIDENCE:** `evidence/funding_pnl_column/` (RESULT_run{A,B}.json BYTE-IDENTICAL modulo run label;
RUN_LOG_run{A,B}.txt; {A,B}_bands_pretick.png + {A,B}_bands_posttick.png — the on-screen
payer-negative/P/L-falls proof — + {A,B}_fullpage_posttick.png; smoke/TP_SMOKE_RESULT_run1.json ==
run2 byte-identical + log + PNGs). Harnesses `engine/verify/pw_funding_pnl_live.mjs` (A|B; NEW) +
`pw_funding_standing_smoke.mjs` (the standing 17-point smoke, evidence-redirected copy, checks
byte-inherited). Gates: `run_all.sh` exit 0 on this md5, tester-re-run — lens_selfcheck **24/24
HARD** + a16_atm_gate **5/5 HARD** + monolith 8/8 report-only; integrity pin keyed `4bc939ec`.
Build md5 `4bc939ec6fb3dda8d1e5b37bfd3bc0cf` UNCHANGED pre/post every run (READ-ONLY).
**Table rows updated:** #9 (+ table header re-keyed to the new HEAD). **Rolling list:**
-TP339-RATIFY → RESOLVED-by-RULING (entry 425); NEW -FPNL-NEGZERO (OPEN, cosmetic);
-CLOSE405 UNTOUCHED (OPEN, build parked per entry 424). **Verdict = PASS — promoted-HEAD pass
confirmed; no gating findings.**

---
### 51342574 — -FPNL-NEGZERO display fix (2-expression −0 guard on `4bc939ec`)   [status: PROMOTED HEAD 2026-07-07 — tester targeted live recheck **12/12 PASS ×2 byte-stable** + gates 24+5 HARD re-run — **VERDICT = PASS**] (2026-07-07)
**Scope (tester diff-verified against committed `4bc939ec`):** full-file delta = EXACTLY 2 expressions + 3 comment lines in renderBands — `bandFundingPnl = bandFundingStored === 0 ? 0 : -bandFundingStored` (L4653; feeds the band row L4685 AND the total row L4726) and the component cell `fmtNum(c.funding === 0 ? 0 : -c.funding, 6)` (L4711). `fmtNum` itself untouched; engine+state script blocks byte-identical to `4bc939ec` by construction (nothing else in the file differs — tester ran the diff independently against the committed prior).
**FEATURES: #9 (funding — DISPLAY layer only) — none beyond #1–#16.** (#15 re-verified standard: blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060; run_all exit 0 tester-re-run — lens_selfcheck 24/24 + a16 5/5 HARD, monolith 8/8 report-only, integrity pin keyed `51342574`.)
**DESIRABLE [#9]:** fresh bands read clean zero — all 8 pre-tick funding cells (band + 2 component + total rows × 2 opposite bands) render exactly `0.000000`, NO minus sign (ASCII or U+2212), both fresh AND after the oracle move to 88000 (still pre-tick). Was `-0.000000` on `4bc939ec` (JS −0 through fmtNum).
**UNDESIRABLE:** none found.
**NEUTRAL / no-regression pins (same setup as the recorded `4bc939ec` pass: long B1 sold-call $120k / bought-put $48k + short B2 sold-put $60k / bought-call $100k, N=0.03, oracle 88000, 24×#btn-tick):** payer B1 cell −0.000469 — the minus RENDERS on screen (the guard does not eat real negatives) — P/L −$4.50→−$45.75 FALLS; receiver B2 +0.000531, $5.53→$52.25 RISES; all byte-equal to the 4bc939ec numbers at 6dp/±$0.02; sign pin cell==−Σ stored trader-pays (6dp); band cell==Σ component cells; 0 console errors / 0 pageerrors / 0 dialogs ×2; build md5 `513425747b23b74cb07c0fda4959825b` UNCHANGED pre/post (READ-ONLY).
**OPERATOR-VOICE:** no operator words on this specific fix (tester-originated cosmetic finding, `4bc939ec` entry). Context entry 427 (2026-07-03) [verbatim-transcript]: *"…including the fixes we agreed to do on that not yet done, because i'll give it to him after those fixes"* — this fix is one of that agreed pre-CTO-handover batch, now DONE. Entries 429–431 (2026-07-07) are the SEPARATE attacks/parked-close thread — entry 430 *"the attacks fix is to be done now; i dont undersgtand whaat parked close is anjdwhat the alternative wqs ..."* then entry 431 *"brainstomrin only first"* HOLDS that build at brainstorm-only; untouched by this slice, tracked on the rolling list (-CLOSE405 + attacks TBD), NOT resolved here.
**EVIDENCE:** `evidence/fpnl_negzero_recheck/` (RESULT_run{A,B}.json BYTE-IDENTICAL modulo run label; RUN_LOG_run{A,B}.txt; {A,B}_bands_fresh.png + {A,B}_bands_pretick_oracle88k.png — the on-screen clean-zero proof — + {A,B}_bands_posttick.png). Harness `engine/verify/pw_fpnl_negzero_recheck.mjs` (A|B; readBandsDom/parseUSD/setup VERBATIM from `pw_funding_pnl_live.mjs` so the 4bc939ec numbers are directly comparable).
**Table rows updated:** #9 (+ table header re-keyed to `51342574`). **Rolling list:** -FPNL-NEGZERO → RESOLVED(evidence)-in-`51342574`. **Verdict = PASS — no gating findings.**

### bb2f8230 — UPDATE-1: UNIFIED SELL-BACK CLOSE (both legs reverse on the AMM) + FUNDING-ON-EXTRINSIC (operator entries 450/452/455; skeptic HALT-LIFTED) on `51342574`   [status: PROMOTION-GATING ACCEPTANCE — tester live acceptance **10/10 PASS ×2 byte-identical** + STANDING UI SMOKE (S11-v2) **17/17 ×2** + gates lens 31/5 HARD — **VERDICT = PASS**] (2026-07-07)

**Scope (biggest close-path change in the project).** `md5 51342574 → bb2f82309887a822bd4a60e52aa5fb06`; revert twin `temporal_mvp_v28_lens_twocaseclose.html` = `513425747b23b74cb07c0fda4959825b` (the OLD two-case close). Spec `SPEC_update1_clean_close_2026-07-07`. Manager pre-verified: gates 31/5 green, credit-wrapper (state block) byte-identical to the twin (non-extraction by construction), funding hump peak@ATM zero-past-S*, closeBand payout locked from `legPrice(s0)` before the pool moves. Tester independently re-ran run_all (exit 0), blobs canonical (`ab663f5c…` L74 / `c505b08a…` L1060), integrity pin keyed `bb2f8230`.

**FEATURES touched: #7 (ITM close/settlement — the entry-405 close-(b) build) + #9 (Funding — weight → extrinsic). NONE BEYOND #1–#16.** Also-touched-scoped: #16 (the close now routes BOTH legs through the trade-point path `tradeUpdateAt`, extending the entry-339 live trade law to the close) and #11 (the x-drain is a pool-internal reprice with NO new dollar path — the credit/equity wrapper is byte-identical to the twin, §6 guardrail intact). No curve/invariant change (SPOT trio byte-identical to v24; lens unchanged).

**DESIRABLE [#7 — unified close, both legs on the AMM]:**
- **A2 OTM cross-wing close:** open long band (sold-call $120k / bought-put $48k, N=0.05, both OTM) → close. `settled_cash_leg=null`, `live_leg='both'`, close-log verbatim "[both legs reversed on AMM]", no "settled-to-cash", raw_net=+3.44e-4 finite, pool finite. `settled_cash_leg` is now ALWAYS null (no two-case branch).
- **A3 genuinely-ITM leg still on the AMM:** short band (sold-put $60k / bought-call $100k) → oracle 12000 + arb ⇒ engine's OWN regime (sNorm0=poolMark/oracle=1.0000, sold-put live θ=5.000) reads **soldITM=true** → close: STILL `settled_cash_leg=null / live_leg='both'` "[both legs reversed on AMM]", raw_net=−1.55e-2 finite. The ITM leg reverses on the AMM, NOT cash-settled. (Standing-smoke S11-v2 reproduces the same on the sold-put θ=5 short band: soldITM=true, both legs reversed, payout −$8.10 finite.)
- **A5 payout continuity across OTM→ITM (the seam kill):** matched open→close sweep with the bought-put (K=$48k) driven across its ITM boundary (oracle 56000→40000, crossing ~48000). HEAD raw_net is CONTINUOUS & monotone 0.001288→0.002529, crossing step 3.83e-5 = **0.48× the median step** (no jump). `settled_cash_leg=null` at EVERY sample (OTM & ITM).
  - **A5b negative control (LIVE A/B vs the retired twin `51342574`):** on the same sweep the two-case twin **settles a leg to CASH** (`settled_cash_leg='bought'`) on exactly the ITM samples (oracle ≤48000) while HEAD is null throughout — the two-case branch is PRESENT in the twin, ABSENT in HEAD. (The twin's raw_net for this band stays close to HEAD's because the linear-parity seam is C0; the gross ~4e-2 discontinuity the CM12.2 HARD gate proves needs a deeper-ITM config. The *branch presence* is the live observable; CM12 owns the magnitude.)

**DESIRABLE [#9 — funding on the option-part / extrinsic]:**
- **A6:** funding WEIGHT = `markLensed − max(intrinsic parity,0)` (was full markLensed). Live ladder on a steepened pool (S=0.14, w=0.27, m=6 ⇒ g=2.25, seams callSeam θ/mode=0.692 / putSeam=1.444): a **single hump peaking exactly at ATM** — call peak −3.70e-2 @ f=1.00, rising 0.75→0.90→1.00, falling at 1.15, and **EXACTLY 0** at f=0.30 & f=0.55 (past the call seam); put peak +3.70e-2 @ f=1.00, falling to 0 at f=1.80 & f=3.00 (past the put seam). **Funding ZERO deep-ITM**, call/put OPPOSITE sign. The ±g·(S−1)/S SIGN, κ,N,dt, the S≤0 guard and the through-the-lens ±g_loc (entry 232) are UNCHANGED — only the weight. Gate FE.1–FE.4 (negative-controlled: old full-mark funds intrinsic forever ≠0 past S*).
- **A6b:** the portfolio bands-table funding column still renders numbers; the PERPS table has NO Funding column (thead: #/Side/Notional/Margin/Entry mark/P&L/Equity/Eff.leverage/Club) and its `#perps-tbody` innerText is byte-unchanged across 5 funding ticks — the funding change does not touch perps.

**INTENDED DELTAS (recorded, NOT regressions — task-directed):**
1. **x-drain by design [#7/#11]:** after open→close the pool reserves do NOT round-trip exactly — Δx<0 small & bounded (A4: Δx=−3.67e-4 = **−$29.38**, 0.0037% of pool.x; Δy=0.0 EXACT). This INTENDED replacement of the exact-rewind close is a pool-internal reprice credited to NO wallet (credit wrapper byte-identical to the twin ⇒ non-extractable; gate CM6-v3.5/3.6). Bounded, one-signed at fixed oracle, ∝dy² (CM6-v3.3); tracks the oracle IL-like (CM6-v3.4). ACCEPTED(by design) — see reconciliation list. No-free-money floor / charge-back returns in UPDATE-2 (parked, entries 451/452).
2. **funding sign/shape change vs the old build [#9]:** old full-mark funding funded intrinsic forever (non-zero deep-ITM); update-1 is the single ATM hump, zero ITM. INTENDED (operator entry 451 "option part value when OTM").

**GATE CHANGE:** CM6-v2 (frozen-arc round-trip Δy=0 + no-free-money) is RETIRED → CM6-v3 (SHIPPED closeBand round trip: Δy=0 EXACT both legs [v3.1] + fixed-oracle self-drain one-signed [v3.2] + Δx∝dy² [v3.3] + drain tracks oracle [v3.4] + negative control routesLive [v3.5] + credit-wrapper byte-unchanged [v3.6]) and **CM12** (unified-close payout continuity, negative-controlled: the retired two-case raw JUMPS ≥3× at the branch boundary) + **FE** (funding extrinsic). Manager states the old two-case build fails exactly the new checks (24 PASS / 7 FAIL). Tester-re-run: lens_selfcheck **31 PASS**, a16_atm_gate **5 PASS**, exit 0; monolith 8/8 report-only.

**UNDESIRABLE:** none introduced beyond the two INTENDED deltas above (drain ACCEPTED-by-design; funding shape operator-ruled). The operator's own earlier worry that "non monotonic funding seems sus overall" (entry ~3302 [verbatim-transcript]) is RESOLVED by the entry-451 ruling — funding=extrinsic IS the ruled single-hump shape, and because the extrinsic is ~zero right where the anchor crossing happens (entry 3290) there is nothing left to sign-flip.

**OPERATOR-VOICE (`history/operator/2026-06-10_kurtosis-curve-family-brief.md`, entries 450–455, all [verbatim-transcript]):**
- Entry 450 — close-(b) GREEN-LIT + funding base ruled: *"2. yes; 3. fundig on each constituent perpetual optinos value"* → BUILT & DELIVERED (both legs first-class AMM trades; funding on each constituent perpetual-option's value).
- Entry 451 — funding = extrinsic, OTM only; deep-ITM wording moot: *"3. option part value when OTM"* / *"moot / no chage except the sell back model then we good"* → funding ZERO ITM DELIVERED (A6 gate FE + live ladder).
- Entry 452 — build sequencing: *"we build the fully theoretically clean thing as the first uodate ; then the next is the known0-explit patch"* → THIS is that first update; the charge-back/exploit patch is UPDATE-2 (PARKED).
- Entry 453 — small-vs-obscene drain: *"if its small arb leak i get it can be plugged, but if youre saying its obscene it points to structural issues /verify"* → verified small & bounded (A4 −$29; gate CM6-v3 bounded ∝dy², non-extractable).
- Entry 455 — un-halt after leak retracted: *"yes go on"* (bounded ~$200 non-extractable self-drain survives; charge-back parked). Skeptic HALT-LIFTED.
- Rolling OPEN: -CLOSE405 → RESOLVED(evidence)-in-`bb2f8230` (close-(b) built). Charge-back / no-free-money floor + LP/multi-wallet attacks = PARKED for UPDATE-2 (entries 451/452/3133). -TP339-RATIFY already RESOLVED-by-ruling (entry 425). No new operator objection open on this build.

**EVIDENCE:** `evidence/update1_close_acceptance/` (RESULT_run{A,B}.json BYTE-IDENTICAL modulo run label — checks/headSweep/twinSweep/fund all identical; RUN_LOG_run{A,B}.txt; {A,B}_portfolio_bands.png) + `evidence/update1_close_acceptance/smoke/` (U1_SMOKE_RESULT_run{1,2}.json 17/17, U1_SMOKE_*deepITM_pre/postclose.png). Harnesses `engine/verify/pw_update1_close_acceptance.mjs` (A|B) + `engine/verify/pw_update1_standing_smoke.mjs` (fork of pw_funding_standing_smoke with the documented S11-v2 expectation: an ITM leg still reverses on the AMM, no cash-settle). Build md5 `bb2f8230…` UNCHANGED pre/post every run (READ-ONLY on the engine).

**Table rows updated:** #7 (unified sell-back close, both legs on the AMM, ITM continuity, CM6-v3/CM12) + #9 (funding weight → extrinsic, ATM hump, zero ITM) + header re-keyed to HEAD `bb2f8230`. **Rolling list:** -CLOSE405 → RESOLVED(evidence)-in-`bb2f8230`. **Reconciliation list:** +1 ACCEPTED(by design) row (UPDATE-1 x-drain, non-extractable, floor returns in UPDATE-2). **VERDICT = PASS — no gating findings; the two recorded deltas are INTENDED (operator-ruled / by-design).**

---
### abd35f4b — FUNDING = SAME-SLOPE POOL-vs-ANCHOR DEVIATION (PLACEHOLDER, deviation-only) (operator entries 458/459/460 RULED / 462 scope; SPEC_funding_sameslope_2026-07-07; R6 scope-gate CLEARED) on `bb2f8230`   [status: PROMOTION-GATING ACCEPTANCE — tester focused live acceptance **13/13 PASS ×2 byte-identical** + STANDING UI SMOKE (S11-v2) **17/17 ×2** + gates lens **35** / a16 **5** HARD — **VERDICT = PASS**] (2026-07-08)

**Scope (funding-ONLY change; closeBand UNTOUCHED).** `md5 bb2f8230 → abd35f4bbd59be4fde0565e5981bda71`; revert twin `temporal_mvp_v28_lens_twocaseclose.html` = `513425747b23b74cb07c0fda4959825b`. The `fundingPerStrike` WEIGHT is replaced: OLD `ext·(S−1)/S` (a moneyness/value weight × the pool-vs-ORACLE gap — funded a symmetric w=½ pool, the recurring ~20–30× regression the operator flagged) → the REAL same-slope pool-vs-anchor **RAY-ANGLE-RATIO deviation** `dev = |c·ln(θ/mode)|`, `c = (g_a − g)/(g_a + 1)`, `g = gLoc = m·γ` (pool, γ LIVE via w), `g_a = m` (anchor w=½, γ=1). OTM-gated (0 ITM), 0 at ATM (ρ=1), **0 ∀ OTM on a w=½ pool** (pool-lean signature). ±g wing sign/scale KEPT. Manager pre-verified gates 35/5 green + the deviation signature; tester independently re-ran run_all (exit 0 ×2), blobs canonical (`ab663f5c…` L74 / `c505b08a…` L1060), integrity pin keyed `abd35f4b`.

**FEATURES touched: #9 (Funding — BOTH the weight formula (value-proxy → same-slope pool-vs-anchor ray-ratio deviation, matching the inventory-#9 entry-386 'same-slope-to-same-slope across pool and anchor curves' definition) AND its bands-table column label + units-note placeholder disclosure). Process-gate #15 (file-safety) exercised + GREEN (blobs canonical `ab663f5c…` L74 / `c505b08a…` L1060, 3 scripts parse). NONE BEYOND #1–#16.** No curve/invariant change (SPOT trio byte-identical to v24; lens `gLoc`/`markLensed` unchanged); #7/#11 (close/dollar-pipe) BYTE-UNTOUCHED — closeBand not in the diff. `oracle`/`oracle_initial` kept in the `fundingPerStrike` signature for ABI/back-compat, now unused (the pool-vs-oracle gap is gone).

**DESIRABLE [#9 — same-slope deviation, the operator-ruled placeholder]:**
- **A3 live funding profile (vm-in-page, the SHIPPED `Engine.fundingPerStrike`; strikes chosen as multiples of the pool's ACTUAL mode `getSNorm`, NOT 1.0):**
  - **LEANED pool (w=0.30 ⇒ mode getSNorm=2.3333, γ=0.4286, g_loc=2.5714; m=6):** funding is an **OTM lobe** — call (θ>mode) **+g** rising 0.0615(ρ1.05)→0.281(ρ1.25)→0.873(ρ2)→1.746(ρ4); put (θ<mode) **−g** −0.0646(ρ0.95)→−0.281(ρ0.8)→−0.873(ρ0.5)→−1.746(ρ0.25). **EXACTLY 0 at the money** (call@ATM=0, put@ATM=0). **EXACTLY 0 in-the-money** both wings (call θ<mode = 0, put θ>mode = 0, |.|<1e-12). Monotone **fade to zero toward the ATM edge** on both wings. Call **+** / put **−** opposite sign; reciprocal-ρ mirror exact (call@ρ2=+0.873 == −put@ρ0.5). This is the entry-458 target shape.
  - **SYMMETRIC pool (w=½ ⇒ mode=1, γ=1, g=g_a=m ⇒ c=0):** funding **= 0 at EVERY strike**, both wings, at m=6 AND m=3 (the pool-lean signature / anti-regression KILLER FS.2b). The old `ext·(S−1)/S` weight funded this pool (~2.6/7.3/14.4 @OTM in the prior build) — GONE.
- **A2 the PLACEHOLDER LABEL renders live (R6 / gate condition):** the portfolio bands-table Funding column header reads exactly **"Funding (lean; TBD)"** (NOT "Funding P/L"); the `<th>` full-title on hover reads VERBATIM *"Funding (same-slope lean; formula TBD, update-2). PLACEHOLDER: the same-slope pool-vs-anchor deviation carrying the ±g sign/scale — NOT the final funding number. Signed: + = line received, − = line paid. Line P/L shown includes this placeholder accrual; cash at close settles ex-funding until the transfer layer ships."*; the visible `.pf-units-note` carries the sentence *"Funding column is a PLACEHOLDER — the same-slope pool-vs-anchor LEAN (deviation) carrying the ±g sign/scale, NOT the final funding number; the funding formula is TBD (update-2). …"* (offsetParent non-null on the portfolio bands subtab).
- **A4:** the PERPS table has NO Funding column (thead: #/Side/Notional/Margin/Entry mark/P&L/Equity/Eff.leverage/Club) and its `#perps-tbody` innerText is byte-unchanged across 3 ticks — the funding change does not touch perps.

**INTENDED DELTAS (recorded, NOT regressions — operator-directed placeholder):**
1. **funding is a DEVIATION-ONLY PLACEHOLDER [#9]:** this build gets the same-slope *deviation* right; the actual funding FORMULA (Hyperliquid-style capped premium→rate, our same-slope angles as the mark/oracle proxy) is DEFERRED to UPDATE-2 alongside the exploit patch (operator entry 462 verbatim below). NO cap, NO new knob added (R3). The label change (Funding → "Funding (lean; TBD)" + placeholder disclosure) is the INTENDED, live-verified honesty delta [#9 display].
2. **weight sign/shape change vs the update-1 extrinsic hump [#9]:** update-1 (`bb2f8230`) funded a single ATM *hump* on the extrinsic (peak AT the money); this build's deviation is 0 AT the money and GROWS out-of-the-money (an OTM lobe) — the correct same-slope shape (entry 458 target). INTENDED replacement; the update-1 hump was a build bug in the funding piece (entry 458).

**GATE CHANGE:** FE.2 (funding hump-at-ATM) + FE.3 (`ext·(S−1)/S` source lock) RETIRED — they encoded the regression — → **FS.1–FS.6** added, negative-controlled: FS.1 dev=|c·ln(θ/mode)| source/shape; FS.2b **anti-regression KILLER** (funding = 0 on a symmetric w=½ pool ∀OTM — old ext AND the moneyness proxy both FAIL it); FS.3 magnitude ↑ with |w−½|; FS.4 = 0 ∀ITM; FS.5 source-lock (weight is the ray-ratio, NOT ext, NOT ext·(S−1)/S); FS.6 combined fingerprint. Tester-re-run: lens_selfcheck **35 PASS**, a16_atm_gate **5 PASS**, exit 0 ×2; monolith 8/8 report-only.

**UNDESIRABLE:** none introduced. The deviation-only placeholder + label are operator-directed and honestly disclosed on screen. STANDING-OPEN (not a defect of this build): the actual funding FORMULA is un-built (rides UPDATE-2), and whether the deviation's oracle-independence is FINAL is an operator-tier open (F1) — both tracked in the rolling list, NOT presented as resolved.

**OPERATOR-VOICE (`history/operator/2026-06-10_kurtosis-curve-family-brief.md`, all [verbatim-transcript]):**
- Entry 458 (:3386) — funding TARGET confirmed: *"…is that target right — funding lives only out-of-the-money, zero at the money and zero in-the-money, fading smoothly to zero at the ATM edge? YES"* → **RESOLVED(evidence)** — A3 LEANED profile = OTM lobe, 0 at ATM, 0 ITM, fading to the ATM edge; live-verified ×2.
- Entry 459 (:3392) — same-slope METHOD confirm: *"1. also confirm that deviation used in calculating funding comes from works by comparing the same slope across both curves and finding the correspionding ray angles and their angle ratio…"* → **RESOLVED(evidence, tester scope)** — the shipped weight IS the anchored ray-ratio `dev=|c·ln(θ/mode)|`, `c=(g_a−g)/(g_a+1)` (comment L2309-2311); tester verified the *signature* live (0 on w=½ pool, OTM lobe, 0 ATM/ITM). The ray-angle GEOMETRY derivation itself is manager-audited + locked by gate FS.5 (source-lock).
- Entry 460 (:3398, RULING) — build the ACTUAL same-slope deviation + anti-regression HARD GATE: *"simple english -- this is a regression happpened around 20-30 times"* → **RESOLVED(evidence)** for this placeholder — old ext/moneyness-proxy weight removed; FS.2b KILLER gate (0 on symmetric pool) locks it, tester-confirmed live (symmetric pool 0 at every strike, m=6 & m=3).
- Entry 462 (:3410, SCOPE) — deviation-only, formula parked: *"dont plug in a formula yet, just get deviation right and note the actual funding formula tbd with hyperliquid funding formula with the proxy whstevr i said tbd in hext update with the exploit patch"* → **RULED/DELIVERED** — deviation-only build; the placeholder LABEL live-renders the "formula TBD (update-2)" disclosure (A2). Actual formula = **OPEN, deferred to UPDATE-2** (rolling list).

**EVIDENCE:** `evidence/funding_sameslope_acceptance/` (RESULT_run{A,B}.json BYTE-IDENTICAL modulo run label; PROFILE_run{A,B}.json = the numeric strike ladders, A==B; RUN_LOG_{A,B}.txt; FUNDING_bands_label_run{A,B}.png — the on-screen "Funding (lean; TBD)" header + placeholder units-note) + `evidence/update1_close_acceptance/smoke/` (standing S11-v2 17/17 ×2). Harnesses `engine/verify/pw_funding_sameslope_acceptance.mjs` (A|B) + `engine/verify/pw_update1_standing_smoke.mjs`. Build md5 `abd35f4b…` UNCHANGED pre/post every run (READ-ONLY on the engine).

**Table rows updated:** #9 (funding weight → same-slope ray-ratio deviation, OTM lobe, 0 ATM/ITM, 0 on w=½; placeholder + the column label/units-note) + #15 (file-safety GREEN on this build) + header re-keyed to HEAD `abd35f4b`. **Rolling list (OPERATOR OPEN QUESTIONS):** +funding target (458→RESOLVED), same-slope method (459→RESOLVED), anti-regression ruling (460→RESOLVED), deviation-only scope (462→RULED); actual-formula + F1 oracle-independence → OPEN (ride UPDATE-2). **Reconciliation list:** +1 row (funding-formula-un-built / F1 oracle-independence — OPEN, parked to UPDATE-2). **VERDICT = PASS — no gating findings; the two recorded deltas are INTENDED (operator-directed placeholder), honestly labelled on screen.**

### 5ce1a76c — VOCAB SCRUB: un-endorsed term "lean" → "skew / ray deviation" (TEXT-ONLY relabel) (operator entries 474 RULED / 476 authorize; controlled-vocabulary gate `vocab_gate.sh` wired HARD) on `abd35f4b`   [status: PROMOTION-GATING ACCEPTANCE — tester live acceptance **9/9 PASS ×2 byte-identical** + STANDING UI SMOKE (S11-v2) **17/17 ×2** + gates lens **41** / a16 **5** + **vocab_gate PASS** HARD — **VERDICT = PASS**] (2026-07-08)

**FEATURES:** **#9** (funding — the column HEADER / hover tooltip / units-note VOCABULARY) + **#15** (file-safety GREEN; the controlled-vocabulary gate is now wired into run_all HARD, engine-visible clean). **None beyond #1–#16.** The change is comment/label TEXT only: `git diff HEAD` = exactly 3 visible strings + 7 `//` engine comments; the ONLY two lines carrying executable code (`const w_new = aT / (xT + dx)` and `Math.abs(c * Math.log(strike_theta / mode))`) are BYTE-UNCHANGED — only their trailing comments moved. Engine+state executable code is byte-identical to `abd35f4b` **by construction** (zero code-token delta).

**DESIRABLE:** [#9] the un-endorsed term "lean" is scrubbed from the engine-visible layer per the operator's ruling. Funding column header **"Funding (lean; TBD)" → "Funding (ray dev; TBD)"** (live-read exact); tooltip prefix now **"Funding (same-slope ray deviation from the anchor curve; formula TBD, update-2). PLACEHOLDER: …"** (live-read, prefix regex PASS); units-note **"…the same-slope pool-vs-anchor LEAN (deviation)…" → "…the same-slope pool-vs-anchor SKEW DEVIATION…"** (live-read, contains SKEW DEVIATION / no LEAN). **No visible funding-"lean" anywhere** — live TreeWalker over all visible text nodes + a scan of every `title` attr = 0 funding-"lean" hits (the only remaining "Lean" is the Lean PROVER string "Lean identities I–V", a legitimately different word, excluded). [#15] new HARD `vocab_gate.sh` (registry `docs/VOCABULARY.md`, banned = lean-family + "curvature knob") reports **engine-visible clean** on HEAD AND the `handover/…_5ce1a76c.html` copy.

**UNDESIRABLE:** none. **Behaviorally byte-identical (the key claim) — PROVEN two ways:** (1) by construction, zero code-token delta in the git diff; (2) by re-run — standing UI smoke 17/17 ×2 byte-stable on md5 `5ce1a76c`, `tradeUpdateAt((10,10,5,5),+1,4)` exhibit w=11/21=0.5238095 exact + x=215/22, both charts render (curve 10058 / pricing 11434 nonBlank), m-knob steepens (g_loc 1→6 as m 1→6, mode mark falls), 0 console/pageerror/dialog. Funding numbers/pricing/trade/close all unchanged from the `abd35f4b` accepted run.

**NEUTRAL:** the 3 re-labelled visible strings + 7 engine `//` comments changed "lean"→"skew / ray deviation / (w)" (record-only).

**OPERATOR-VOICE (`history/operator/2026-06-10_kurtosis-curve-family-brief.md`, both [verbatim-transcript]):**
- Entry 474 (:3479, RULING) — the term is rejected + a GATE ordered: *"lean is a term i dont endorse.. curve skews, and theres a ray deviation from anchor curve as per each same slope point across pool and anchor curves --- using terms like lean or anything i dont endorse or redundant / duplicative  terminoloy / vocabulaty  is a likely cause for conflations; i want a gate for this kind of stuff... now take stokc aain"* → **RULED/RESOLVED(evidence)** — the engine-visible "lean" is gone (live-verified, 0 hits) and the controlled-vocabulary gate is wired HARD + PASS. The endorsed vocabulary ("skew" for the curve, "ray deviation … at each same-slope point" for the funding weight) is what now renders.
- Entry 476 (:3491, AUTHORIZE + economic ruling) — *"1 fix; 2 same purpose as with perps ...  anything unansweree pending?"* → item 1 (do the cleanup) **DELIVERED** (this build). Item 2 answers the standing OPEN economic question: **funding's purpose is the SAME as with perps (tether / imbalance-correction)** — confirms the shipped direction; recorded as a RULING, but the actual funding FORMULA is still un-built (rides UPDATE-2, F1 open). "anything unanswered/pending?" → yes: the actual funding formula + F1 oracle-independence-as-final, both tracked in the rolling list (NOT presented as resolved).

**EVIDENCE:** `evidence/vocab_relabel/` (RESULT_run{A,B}.json overall=true, A==B modulo run label; {A,B}_bands_funding.png — the on-screen "Funding (ray dev; TBD)" header). Harnesses `engine/verify/pw_vocab_relabel_acceptance.mjs` (A|B) + `engine/verify/pw_update1_standing_smoke.mjs` (17/17 ×2 on this md5). `git diff HEAD -- …HEAD_temporal_mvp_v28_lens.html` = the 76-line text-only delta. Build md5 `5ce1a76c7b75ec3763fda6df9538a841` UNCHANGED pre/post every run (READ-ONLY on the engine). Blobs canonical webp L74 `ab663f5c…` / svg L1060 `c505b08a…`; run_all GREEN (lens 41 + a16 5 + vocab_gate HARD; monolith 8/8 report-only; integrity pin keyed to `5ce1a76c`).

**Table rows updated:** #9 (column header/tooltip/units-note vocabulary "lean"→"ray dev / skew deviation") + #15 (file-safety GREEN + vocab_gate wired HARD) + header re-keyed to HEAD `5ce1a76c`. **VERDICT = PASS — text-only relabel; no number moved (zero code-token delta), the operator-rejected term is gone from the engine-visible layer, and the gate that enforces it is green.**

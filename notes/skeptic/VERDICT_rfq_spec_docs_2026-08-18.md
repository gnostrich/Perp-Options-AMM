# SKEPTIC VERDICT — RFQ MM console spec artifacts (xlsx + arXiv tex/pdf + README + corrigendum)
_skeptic, 2026-08-18. Universal Skeptic Gate pass, operator entry 542 (read verbatim from
`history/operator/2026-08-18_rfq-spreadsheet-pdf-specs.md`). Artifacts:
`app/spec/SPEC_RFQ_MM_CONSOLE.xlsx`, `app/spec/SPEC_RFQ_MM_CONSOLE_arxiv.tex`/`.pdf`,
`app/spec/README.md`, `history/operator/CORRIGENDUM_2026-08-18_appbuild_session_gap.md`._

## Attack record (what I tried to break, and could not)

**Worked numbers (xlsx sheet 5 / PDF §6) — attack FAILED, every number reproduces.** I re-typed
the app's math from `app/index.html` (not the manager's script) and ran it in Node independently:
ATM 0.178888; CALL/PUT(+12%) 0.135450/0.255450; off-ATM parity |C−P+k| exactly 0 in floating
point (branch structure makes it identical, verified at k=0.2); ATM peg residual 2.440e-13;
CALL(−1)=1, PUT(−1)=0; G̃ 0.9065; bleed 0.16317; h_fair/h_eff 14.90/18.63 bps; Σ notional
$19,708,650; fees $4,019,813 / bleed $3,215,850; APR 4.1%/81.6%; break-even 0.24×; envelope at
k=12% ask 0.13567 / bid 0.13523, book spread 32.8 full / 16.4 half; depth shares
47.6/19.0/9.5/23.8, λ_agg 0.00952; capacity centre 29%, Σ premium 30.67 BTC; band example
0.6840 BTC / 5.2346 u / Δκ +0.00574; vol sweep 1.7→9.1%/2153.7%, 14.9→81.6%/1863.7%,
59.6→326.3%/884.6%. The inversion finding is arithmetically right: at fee=2% fixed mode inverts
only at RV>155.4%, above the 140% slider max. All exact matches.

**Lean corpus claims — attack FAILED.** Counts verified: 42 (BURR2_CORE LOCAL_BUILD_axioms.log,
counted) + 13 (BURR2_MIXTURE log, counted) + 9 (LINK_PRICING.lean, theorem lines counted, names
match sheet 7 exactly) + 12 (LINK_SETTLEMENT.lean, ditto) + 54 (v3-maps, audit §1) = 130. Axiom
set matches the logs on every theorem I inspected. `engine_call_midconvex` carries `1 ≤ g` as
stated. LINK_B's `units`/`cashOne`/`cashPer` take an arbitrary `V : Fin n → ℝ` — the doorway
theorems are curve-generic, so the abstract's "exactly the arbitrage-free class" sentence does
NOT smuggle the unproved Burr-2 bridge (which is correctly gap #1/B-1). BURR2_CORE §0 defs
(sR/sL/kern/tail/G1/I1/WR/WL/qR/AR/AL/CALL/PUT) do mirror the JS `mk()` line-by-line. Local
kernel verification is documented for all five packages (two LOCAL_BUILD logs + the 2026-08-14
audit note's build tables). I re-verified `Exposure` is absent from all three v3-maps .lean
files (grep: doc-comment prose only) — gap G-1 is honestly carried. Entry 539/540/541 citations
match the verbatim transcript. 562 lines, 8-page PDF, build↔commit table matches git — all
confirmed. Completeness: no other RFQ-relevant Lean exists in `formal/aristotle_runs/` or
`sims/` (listing checked); nothing included is padding (v3-maps is LINK_A's import base).

**Honesty labels — held.** trusted-from-prover→verified flip stated as recommendation/operator's
call in all three docs; JS↔Lean labelled asserted-not-proved; build-5-era headline labelled
HISTORICAL; TailRep conditionality + toy witness stated; mixture scope (midpoint member,
near-money, 745% excess) matches the 269a6a3 record; economics layer labelled no-Lean;
entry-541 realtime-tuning risks carried.

## FLAGS

**FLAG-WRONG (F1, provenance of the "build-5 headline").** PDF §6 and xlsx sheets 5/9 attribute
the headline APR contrast (vol-indexed +3.1/+27.7/+110.8% vs fixed +24.5/−74.0/−406.4%) to
"build-5 code and calibration". The only place those numbers exist in the record is the
**build-1** commit message (`75abb52`: "Tested headless… The headline contrast works"). Worse,
the spec contradicts itself: sheet 9's own footnote places builds 5 and 7 inside the
caf6c71/07370be work, which sits AFTER the build-4 gamma-bleed basis fix (`8dfd02e`) — and that
commit already reports the post-fix calibration (81.6% at RV 60%), so build-5-era code could not
have produced the headline. Correct attribution: build 1, pre-basis-fix. The substantive claim
(historical, not reproducible on build-11 defaults) survives and is arithmetically confirmed;
the label "build-5" is wrong in both artifacts. Standing flag on that attribution — fix before
hand-back.

**FLAG-OVERSELL (F2, "a design forced by a proved theorem" / "THE SETTLED ARCHITECTURE").**
Three limbs. (a) `mixture_not_single_lens` is proved for the ENGINE's single power-law lens
family; the console quotes Burr-2, where the corpus's own result (BURR2_MIXTURE + the manager's
entry-529 record, "per-LP heterogeneity is practically viable via re-fit"; residuals 0.02–0.12%
near-money) says heterogeneity is second-order MILD — the theorem does not force the common-level
design for this kernel, and the RFQ envelope isn't required to be a single curve at all. (b) The
build-11 empirical event was a crossed book (per-maker LEVELS disagreeing by more than the
spread, bid 0.15482 > ask 0.12015) — a level-disagreement failure, not an instance of the
strict-log-convexity smile obstruction; "build 11's own test reproduced the failure empirically"
conflates the two. (c) Provenance of "settled": transport-not-level enters the transcript as a
manager RECOMMENDATION (entry 513) followed by a method-level operator affirmation (517, "this
is good, we're braintoming it"); any actual operator ratification would live in the
UNTRANSCRIBED 2026-08-14 app session, so "settled architecture" is reconstruction-grade, not
citable as decided. Steelman that partially rescues the design claim: common level + positive
spreads provably cannot cross, and the obstruction IS airtight against any single-lens aggregate
representation — so the design is well-motivated. "Chosen, motivated by a proved obstruction in
the adjacent family" is the honest sentence; "forced by a proved theorem" is not.

**FLAG-OVERSELL (F3, hedge readback sold as a check).** PDF §4/§5 and sheet 4 present "net
option Δ → required perp hedge → residual 0" as a readback result. In code the hedge is DEFINED
as −netΔ and the displayed "residual exposure 0.000000" is a hardcoded string literal
(`index.html` L554) — the residual is an identity, the exact closure-by-construction pattern the
team's own closed-loop audit flagged (§3(i)/G7). Evidence the check has no content: the demo's
put-leg delta is not parity-consistent — code uses −Δ_call (0.5358 at k=−0.10) where parity
(P=C+k) forces Δ_call+1 = 0.4642 (long) or −0.4642 (short) — and a wrong Δ still "reads back"
to residual 0. The no-Lean caveat is present (gap #5/G-1) but the residual line should be
labelled definitional, and the put-delta parity inconsistency in `renderPortfolio` is a real
app-level finding the spec's "positions with marks and deltas" sentence currently papers over.
(Reported as a finding per STOP-ON-RED; I did not fix it.)

**Nits (no halt).** (i) Sheet 7's header says "three RFQ-specific packages, all 64 named
theorems" but the sheet lists FOUR packages / 76 theorems (LOOP_LINK_B's 12 included); README
and PDF repeat "64". Count/label mismatch, harmless direction. (ii) The crossed-book "−1,261
bps" (PDF §4, sheet 9) is the app's HALF-spread readout convention while sheet 5's "32.8 bps" is
full-spread — same-document convention switch, unstated (full-spread crossing = −2,522 bps).
(iii) Sheet 6's blanket "statements byte-identical to submission" cannot apply to v3-maps-lean
(written in-repo, never submitted). (iv) "fee ≲ 1%" for in-slider inversion: the exact in-slider
boundary is fee < 1.62% (at RV=140%); ≲1% is the comfortably-demonstrable figure stated as a
boundary.

## Process (corrigendum + numbering)

**Corrigendum: ADEQUATE, no flag.** It owns the §2.2 violation as the manager's, labels the
commit-message fragments reconstruction (not transcript), lists them accurately (checked against
git), and files the standing export request. The entry-542 file's "numbering provisional,
continuing from 541" note is the sane collision handling. The place the missing transcript
actually bites is F2(c): claims of the form "the architecture we settled on" from that session
must carry reconstruction provenance until the export lands.

## Inventory walk

`docs/feature_inventory.md` scopes to notes touching the ENGINE curve/invariant/settlement/
economics. This artifact specifies a non-core Burr-2 simulation and dispositions its engine
relationship explicitly: engine untouched (P-1); funding = operator-ruled no-option-funding,
entries 514–517 cited; settlement = the doorway theorems; warp-with-trades appears as the
κ-dynamics (open, B-4); kurtosis-knob role is played by the Burr (a,γ) shape at operator
direction (entry 532 verbatim). No engine inventory item is silently contradicted.
**No FLAG-OMISSION.**

## Bottom line

The two artifacts are substantially accurate — every number I could recompute reproduces
exactly, every theorem count/name/axiom claim I checked against the .lean files and local build
logs holds, and the honesty labels the operator's question turns on are all present. Three flags
stand: **F1 (FLAG-WRONG, build-5 attribution — fix before hand-back)**, **F2 (FLAG-OVERSELL,
"forced by a proved theorem"/"settled architecture" — soften and carry reconstruction
provenance)**, **F3 (FLAG-OVERSELL, definitional residual sold as a readback check + the
put-delta parity inconsistency finding)**. With those corrected or visibly carried, the
artifacts are fit for the operator.

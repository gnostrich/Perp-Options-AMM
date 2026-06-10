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

| # | Feature (inventory) | Current state (as of v27 HEAD **UX-restore build `9d22cffd`**, 2026-06-10; promoted line per entry 28; GH line demoted at v26c `6cc73563`, retained + suite green) | Last changed | Verdict |
|---|---|---|---|---|
| 1 | Balancer base | **HEAD (v27) IS the (W) family on the literal Balancer base** F=x^w·y^(1−w) with position-dependent w(u;φ); τ→∞ recovers plain Balancer. **UX-restore `9d22cffd`: v24 dollar defaults BACK** — oracle 80000, x=10 BTC, marginal=$80,000.000 at load (y0=303,448.28 chosen so load is equilibrium — differs from v24's 800,000; flagged below). Same tabs/KPI labels/chart views/perp+band defaults as v24 (tester side-by-side) | UX-restore `9d22cffd` | DESIRABLE — v24 feel restored; Spot-KPI value flag OPEN |
| 2 | Curve warp w(u) | HEAD: explicit (W) weight-field w(u;φ); warp = field-center φ shift; engine-correct (selfcheck 21 PASS); curve renders across frame. On-screen per-trade warp is SUBTLE (≈0.5–1px; verified elbow-local — sweep shows no τ matches v24's global warp with frozen wings) | v27 promotion (entry 28) | HEAD — engine PASS; visual subtlety ACCEPTED by operator ruling (override, not resolved) |
| 3 | Kurtosis knob τ | HEAD: **τ is a NUMBER STEPPER (no slider anywhere — 0 `input[type=range]` in live DOM), step 0.05, range 0.05–3**; keyboard ↑/↓ steps + readout + curve update live; elbow visibly rounds at $80k defaults (τ 0.05→1.5: elbow 5.6px mean/111 max, left wing 0.0px) — tester-confirmed. **FLAG: the clickable up/down ARROWS are CSS-hidden on the settings panel** (L326-328 webkit-appearance:none) — mouse-click stepping is dead on τ (band inputs DO show clickable arrows) | UX-restore `9d22cffd` | DESIRABLE math/control; arrow-affordance OPEN (operator asked for updown arrows) |
| 4 | Carry P=Ny/Nx, q=ln p | HEAD (v27): carry = price leg q=ln p; reads via getMP_raw; engine-consistent (selfcheck) | v27 | DESIRABLE — stable |
| 5 | Rebase (P→P/r) | HEAD (v27): rebase = carry-shift q→q−ln r (NOT rigid x→r·x); **warp∘rebase-commute OPEN [needs-Aristotle]**, deliberately not coupled | v27 | OPEN lemma — theory-risk-accepted |
| 6 | Pricing law value∝S^(−γ) | HEAD (v27): value∝S^(−γ_loc) under Reading A (operator-ruled, entry 11 "a"); wings exact power-laws | v27 | DESIRABLE — Reading A ruled |
| 7 | ITM American smooth-pasting | HEAD (v27): ported with g→γ_loc (Reading A); seam value/slope selfcheck PASS; mark/markFrac split present. NOT carried from the GH line: payoff naked-leg uncap + x-range −90..+200 (HEAD payoff caps at 1, ±50%) — NOTES D9/D10 | v27 (+ Task-2 diff) | HEAD — seam PASS; 2 GH-line payoff upgrades unported (noted for future) |
| 8 | Uniform strike registration θ=sNorm(K) | HEAD (v27): sNormStrike ((W) inverse) defined+exported (round-trip 1.46e-15, NaN-loud) but **export-only — no regLeg wiring**; payoff sweeps price-ratio (1+r); the v26c one-mark-across-display/exec/chart guarantee + all-γ crossover@K are UNVERIFIED on (W) — NOTES D11/D13/D16 | v27 (+ Task-2 diff) | PARTIAL — function present, uniform wiring unported (noted for future) |
| 9 | Funding | HEAD (v27): re-pointed to price-anchor p=P, γ→±γ_loc [theory-risk-accepted] — diverges from the GH line's locked w=½ funding; φ-anchor/funding lemma OPEN [needs-Aristotle] | v27 | OPEN — theory-risk; not UI-exercised |
| 10 | Slippage basis (mpGeom) | HEAD (v27): mpGeom collapses to getMP_raw (price==slope on (W), proven, selfcheck L4). NOT carried: v26a's honest $-tooltip ("Layer-1 reserve-USD, not trader honest-dollar") — HEAD ships the v24 tooltip — NOTES D2 | v27 (+ Task-2 diff) | DESIRABLE math; $-label honesty unported (noted) |
| 11 | Dollar/settlement pipe | Reused byte-identical from the v24 base; curve-independent | — (unchanged) | DESIRABLE — stable (reuse) |
| 12 | getMP_raw price-coord gotcha | HEAD (v27): price == geometric slope EXACTLY on (W) (no e^μ factor); code comment warns against re-introducing the GH factor on a cross-port | v27 | DESIRABLE — moot by construction, warning kept |
| 13 | Solvency boundary (B1) | OPEN ship-gate, unchanged by the promotion (not claimed closed) | — | OPEN — the known hole |
| 14 | Esscher tilt / rapidity group | HEAD (v27): trade = weight-slot field-center translation φ; premise skeptic-verified FAITHFUL to paper+v24 (entry-27 cross-check); no X·Y invariant claimed | v27 | DESIRABLE — grounded |
| 15 | File-safety gate | UX-restore build `9d22cffd`: blobs canonical `ab663f5c…`/`c505b08a…` (line-md5, tester re-verified), 3 scripts parse; selfcheck 21/21 (manager); 0 console errors live ×2 | UX-restore `9d22cffd` | DESIRABLE — stable |
| 16 | **Warp-with-trades (strong-form)** | HEAD (v27): IMPLEMENTED (α=x·w, β=y·(1−w) conserved; φ recenter; selfcheck WARP a–f PASS; skeptic-verified the unique conservation-consistent trade). On-screen warp subtle (elbow-local by design; cannot match v24's global warp with frozen wings — verified sweep). **Operator promoted over my visual blocker (entry 28) — recorded OVERRIDDEN, not resolved**; anchor-overlay/amplified-warp viz still open | v27 promotion (entry 28) | HEAD — engine PASS; visual subtlety ACCEPTED(operator, entry 28) |

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

0b. **★ v29-objection (entry 29) — "not able to play with it" / v24-UX-divergence / no-sliders — LARGELY ADDRESSED by the UX-restore (`9d22cffd`), two residuals OPEN.** [#1, #3]
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

## Standing reconciliation list (all OPEN undesirables, one place)
| Item | Introduced | Status |
|---|---|---|
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
| Spot KPI basis: “Spot ($)” shows $30,344.83 = raw reserve ratio y/x, NOT the pool marginal ($80,000) — v24 showed $80,000 at load; first dollar number the operator sees contradicts the $80k world (kpi-spot 0.3793 / kpi-w 0.7250 same basis) | UX-restore `9d22cffd` (exposed by equilibrium-at-load y0) | OPEN — intern: point kpi-spot/kpi-spot-usd at the marginal (getMP_raw) or relabel honestly |
| τ (and all settings-panel/perp-form) number inputs: up/down spinner ARROWS hidden by CSS (`.field-input-wrap … ::-webkit-inner-spin-button { -webkit-appearance:none }` L326-328) — mouse-click stepping dead on τ (verified: click ×2 no-ops; band-price inputs with the L938-950 visible-spinner CSS DO step 120000→120500 on click); keyboard arrows work | v24 base CSS, carried into v27; bites NOW because the operator's no-sliders ruling makes arrows the only knob affordance | OPEN — one-line CSS fix: give .field-input-wrap inputs the same inner-spin-button treatment (at least τ) |
| Funding re-pointed to price-anchor p=P, γ→±γ_loc — diverges from HEAD's locked w=½ funding | v27 (candidate) | OPEN — theory-risk-accepted; operator/skeptic-tier |

_Tester: append new entries above the reconciliation list; update the list every entry._

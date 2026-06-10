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

| # | Feature (inventory) | Current state (as of v26c HEAD `6cc73563`; v27 = CANDIDATE off v24, not HEAD) | Last changed | Verdict |
|---|---|---|---|---|
| 1 | Balancer base | HEAD runs GH (= one warp setting). **v27 CANDIDATE returns to the literal Balancer base (v24): F = x^w·y^(1−w) with position-dependent w(u) — the (W) family.** τ→∞ recovers plain Balancer | v27 (candidate) | DESIRABLE in candidate — Balancer is now the literal substrate |
| 2 | Curve warp w(u) | HEAD: implicit via GH score kernel. **v27 CANDIDATE: explicit (W) weight-field w(u;φ), warp = field-center φ shift; engine-correct (selfcheck), but NOT visually legible in any chart (see v27 entry)** | v27 (candidate) | CANDIDATE — engine PASS, UI FAIL |
| 3 | Kurtosis knob τ | HEAD: NOT in engine. **v27 CANDIDATE: τ slider LIVE (0.05–3), engine-correct (elbow rounds, wings τ-independent per selfcheck + my live engine read), but NOT visually legible at the default pool geometry** | v27 (candidate) | CANDIDATE — engine PASS, UI FAIL |
| 4 | Carry P=Ny/Nx, q=ln p | HEAD live. v27: carry = price leg q=ln p; reads via getMP_raw; engine consistent (selfcheck) | v25 (HEAD); v27 carry-reframe (candidate) | DESIRABLE — stable |
| 5 | Rebase (P→P/r) | HEAD live. **v27 CANDIDATE: rebase = carry-shift q→q−ln r (NOT rigid x→r·x); warp∘rebase-commute is OPEN/[needs-Aristotle], deliberately NOT implemented as coupled** | v25 (HEAD); v27 reframe (candidate) | CANDIDATE — theory-risk-accepted, lemma OPEN |
| 6 | Pricing law value∝S^(−γ) | HEAD live (G4). v27: value∝S^(−γ_loc) under Reading A; wings exact power; elbow per Reading A (operator-ruled, Entry 11 "a") | v25 (HEAD); v27 γ_loc (candidate) | DESIRABLE — Reading A operator-ruled |
| 7 | ITM American smooth-pasting | HEAD live both wings. **v27 CANDIDATE: smooth-pasting mark ported to v24 with g→γ_loc; seam value/slope match @ sNorm* (selfcheck PASS); payoff renders** | v26b (HEAD); v27 γ_loc port (candidate) | CANDIDATE — seam gate PASS (Node) |
| 8 | Uniform strike registration θ=sNorm(K) | HEAD live. v27: sNormStrike via (W) arbitrageToOracle inverse; selfcheck round-trip 1.46e-15 | v26c (HEAD); v27 (W)-inverse (candidate) | CANDIDATE — Node PASS; not UI-confirmed at K this run |
| 9 | Funding | HEAD locked. **v27 CANDIDATE: funding re-pointed to price-anchor p=P, γ→±γ_loc [theory-risk-accepted] — DIVERGES from HEAD's locked w=½ funding; correct-economic-anchor NOT proven** | v27 (candidate) | CANDIDATE — theory-risk; not exercised in UI this run |
| 10 | Slippage basis (mpGeom) | HEAD: mpGeom=getMP_raw·e^(−ghMu). **v27 CANDIDATE: collapses to mpGeom=getMP_raw (no e^−ghMu — proven absent on (W), selfcheck L4 rel 4.33e-7)** | v27 (candidate) | DESIRABLE — simpler, proven |
| 11 | Dollar/settlement pipe | Byte-identical reuse from v24 base (no new path); curve-independent | — (unchanged) | DESIRABLE — stable (reuse) |
| 12 | getMP_raw price-coord gotcha | v27: on (W) price == geometric slope EXACTLY (no e^μ factor); selfcheck L4. Code comment warns against re-introducing the GH factor on a cross-port | v27 (candidate) | DESIRABLE — gotcha #12 honored, factor absent |
| 13 | Solvency boundary (B1) | OPEN ship-gate, unchanged; v27 geometry does not close it (not claimed) | — | OPEN — the known hole |
| 14 | Esscher tilt / rapidity group | v27: strong-form trade = WEIGHT-slot field-center translation φ (the latent-translation analogue); no X·Y invariant claimed | v27 (candidate) | DESIRABLE — grounded |
| 15 | File-safety gate | v27 blobs = canonical md5s `ab663f5c…`/`c505b08a…` (identical to v24 base); 3 scripts parse; tester-verified GREEN | 2026-06-08 re-pin | DESIRABLE — stable |
| 16 | **Warp-with-trades (strong-form)** | **v27 CANDIDATE: IMPLEMENTED (strong-form R-paper) — trade conserves α,β, moves (x,y), re-centers field φ'=u'−z; engine-correct (selfcheck WARP a–f PASS: α/β conserved, on-trajectory resid 0, φ moves, wing-cap rejects, path-independent, round-trip 1.78e-15; my live engine confirms φ 0→10.59, w 0.85→0.75, trajectory exact). BUT the warp is NOT visually legible in any chart (the operator's signed "trades warp the curve, not a dot sliding" acceptance test FAILS on screen)** | v27 (candidate) | CANDIDATE — engine PASS, UI acceptance-test FAIL (BLOCKER) |

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

0. **★ v27 — the operator's SIGNED visual acceptance test is NOT met on screen — OPEN (BLOCKER
   for play-with / HEAD).** [#2, #3, #16] The operator's acceptance is explicitly *visual*:
   "Acceptance (your signed test, orthogonality relaxed): one number → turn it → **elbow visibly
   rounds → wings don't move** → static → options read off as perpetual-American → **trades warp
   the curve, not a dot sliding**." (`history/operator/2026-06-10_kurtosis-curve-family-brief.md`
   Entry 1, line 14 [verbatim-transcript]). Re-stated: v24 chosen "because how the curve warps
   actually and **shows on UX**" (Entry 2, line 28 [verbatim-transcript]); "no point without
   trades-warp thing … this is half the job" (Entry 19, line 140 [verbatim-transcript]); "when
   can i actually get a version to play around with!?" (Entry 17, line 133 [verbatim-transcript]).
   **Tester FINDING (live Playwright, this run):** the engine is correct (selfcheck 21 PASS; my
   live-engine read confirms τ rounds the elbow in γ_loc, wings τ-independent, and a trade moves
   φ 0→10.59 / w 0.85→0.75 on the exact trajectory) — **but none of it renders legibly.** In the
   Pool Curve (x,y) view the operating point sits at u₀=ln(800000/10)≈11.3, far outside the
   curve-trace window [−6,6] and far from the elbow (u≈0); the visible curve is a flat sliver and
   τ=0.10 vs 2.50 are indistinguishable to the eye, pre-/post-trade are pixel-identical
   (warpFullDiff=0). In Mark-Across-Strikes the peak is τ-invariant to ≈0.94px and the trade
   leaves it unchanged. So the three headline acceptance items (elbow rounds / wings frozen /
   trades-warp-not-a-dot) are **engine-true but screen-invisible.** OPEN — needs a frame/geometry
   fix (curve-trace window must straddle the elbow at the live operating point, or a realistic
   default pool with u₀ near 0) before the operator can "play around with" it and sign the test.

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


## v26c (HEAD, GH line) → v27 (W) kurtosis curve + strong-form trades-warp, off v24 base   [status: CANDIDATE — NOT promoted; HEAD stays v26c `6cc73563`]
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
  **STATUS: OPEN — NOT MET on screen** (see BLOCKER above; engine-true but screen-invisible). The
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
  actually get a version to play around with!?" — the answer this run is: NOT YET playable for
  the signed test, because the warp/knob don't render (BLOCKER). Surfaced, not resolved.
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

---

## Standing reconciliation list (all OPEN undesirables, one place)
| Item | Introduced | Status |
|---|---|---|
| Payoff ray-legend overprint (cosmetic) | v26c | OPEN — intern polish, non-blocking |
| Collar-aggressiveness slippage magnitude | v26a (exposed) | ACCEPTED — operator parked |
| **(W) warp/knob engine-true but NOT visually legible (curve-trace window vs operating point u₀≈11.3; signed acceptance test fails on screen)** | v27 (candidate) | **OPEN — BLOCKER for play-with/HEAD; needs frame/curve-trace fix** |
| Degenerate default pool (symmetric wings w₋=w₊=0.70 ⇒ Δw=0 ⇒ τ inert, all trades rejected) | v27 (candidate) | OPEN — needs asymmetric default |
| Stale "Trade mechanic (#16)" UI label says strong-form OPEN while engine ships it | v27 (candidate) | OPEN — intern label fix (honesty) |
| Funding re-pointed to price-anchor p=P, γ→±γ_loc — diverges from HEAD's locked w=½ funding | v27 (candidate) | OPEN — theory-risk-accepted; operator/skeptic-tier |

_Tester: append new entries above the reconciliation list; update the list every entry._

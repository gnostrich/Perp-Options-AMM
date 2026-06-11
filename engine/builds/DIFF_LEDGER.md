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
2026-06-10 — now verbatim: `history/operator/2026-06-10_project-status-review.md` entry 5;
encoded in `.claude/agents/tester.md` L44–53)._

## ⭐ FEATURE-STATE TABLE (rolling — the at-a-glance inventory; tester updates rows whose feature
changed, every entry, no exceptions)

| # | Feature (inventory) | Current state (as of v26c HEAD `6cc73563`) | Last changed | Verdict |
|---|---|---|---|---|
| 1 | Balancer base | Conceptual base only; engine runs GH (= one warp setting). Theory tie nailed in notes #13–#20 (CD = δ→∞ Gaussian limit) | — (never in engine) | n/a — theory grounded |
| 2 | Curve warp w(u) | Live implicitly via GH score kernel (curve-baked v25); explicit weight-profile form is the τ-knob PROPOSAL (notes only) | v25 (GH bake) | DESIRABLE — stable |
| 3 | Kurtosis knob τ (≡δ) | **NOT in engine**; δ pinned 0.08. Buildable spec exists (KURTOSIS_KNOB note, w(u;w₋,w₊,τ)); awaiting operator curve decision | — (proposal) | PENDING — operator tier |
| 4 | Carry P=Ny/Nx, u=log p−log P | Live, load-bearing, unchanged v25→v26c | v25 | DESIRABLE — stable |
| 5 | Rebase (P→P/r, θ→θ/r, w=½) | Live, unchanged; PH-6 legs proved (trusted-from-prover) | v25 | DESIRABLE — stable |
| 6 | Pricing law value∝S^(−γ) | Live; G4 accuracy gate green at v26c, all γ∈{1.5,2,3,4} | v25 | DESIRABLE — stable |
| 7 | ITM American smooth-pasting | Live both wings, seam C¹ (value 0.000%, slope ≤0.0005%); boundaries bound by S-direction | v26b | DESIRABLE |
| 8 | Uniform strike registration θ=sNorm(K) | Live across display/exec/payoff; crossover@K all γ; Finding-2 absorbed | v26c | DESIRABLE |
| 9 | Funding (w=½ slope-deviation, LOCKED) | Untouched; v26b markFrac split kept it bit-identical; dir_gate guards sign | locked (pre-v25) | DESIRABLE — locked |
| 10 | Slippage basis (mpGeom) | Live; % basis-independent, $=reserve-USD; magnitude-vs-collar item parked | v26a | DESIRABLE; 1 ACCEPTED flag |
| 11 | Dollar/settlement pipe | Byte-identical through v26c (guardrail verified); Layer-2 honest-$ deferred | — (unchanged) | DESIRABLE — stable |
| 12 | getMP_raw price-coord gotcha | 5 faith gates landed green (a8998cf); completeness of the faithfulness program unaudited — tester re-ran full suite green 2026-06-11 vs HEAD `6cc73563` (doctrine + slope-identity gate retained) | 2026-06-10 (a8998cf) | GUARDED — completeness unaudited |
| 13 | Solvency boundary (B1) | OPEN ship-gate; only conditional proved; κ extrinsic | — | OPEN — the known hole |
| 14 | Esscher tilt / rapidity group | Embodied by trade path; GROUNDED in Lean (GHJ); no X·Y invariant (by design) | v25 | DESIRABLE — stable |
| 15 | File-safety gate | Live hook, pinned to v26c md5s; negative-controlled | 2026-06-08 re-pin | DESIRABLE — stable |

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

> **PROVENANCE / HONESTY NOTE on the transcript record itself (tester, 2026-06-10 backfill):**
> `history/transcript_journal.txt` is a catalog of session SUMMARIES (last entry 2026-06-06);
> `history/session_tree_note.md` (4100 ln) is the append-only canonical note of the
> **pre-GH era** (composite-ray v24 / v25-american / convexity-knob arc) and **ends at the
> curve-shape pivot**. **The GH-era sessions that produced the very versions this ledger covers
> (v25 GH bake, v26a, v26b, v26c — 2026-06-08; governance/AIRTIGHT — 2026-06-09; pain-point
> conversation — 2026-06-10) have NO raw transcript in `history/`.** Their operator voice
> survives only secondhand: manager `MEMORY.md` (rulings, mostly paraphrase), session-summary
> stubs `docs/context/chats/*.md`, and a handful of quote fragments. Items below are labelled
> **[verbatim-transcript]**, **[manager-recorded paraphrase]**, or **[summary-stub]** accordingly.
> Recommendation: export the 2026-06-08/09/10 chat transcripts into `history/` so this layer can
> be audited against raw words, not reconstructions.
> _UPDATE (tester, 2026-06-11):_ **the 2026-06-10 session is NOW verbatim on disk** —
> `history/operator/2026-06-10_project-status-review.md` (backfilled at policy creation; entries
> 1–6 predate the policy within the same session, labelled honestly there); 2026-06-11 sessions
> transcribe live per §2.2. **2026-06-08/09 remain the gap** — the export request stands for those
> two days only. Same pass: the 4 stale `notes/…` cites below refreshed to their post-restructure
> `curves/…` homes (dc254ad); line refs re-verified against the moved files — two had drifted
> (`:282-284`→`:284-285`, `:175-176`→`:177`), quotes re-checked at the new lines.

### OPEN (operator asked / objected; no recorded resolution)

1. **Curve / kurtosis-knob decision (the project motive) — OPEN, operator tier.** [#2, #3]
   The operator asked for the kurtosis knob ("…the kurtosis knob the operator asked
   [for]" — `curves/gh/CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md:93` [manager/lead-recorded; no
   verbatim transcript]). Sub-questions awaiting the operator:
   - WHICH curve is on the table: the (W) weight-profile family vs GH δ-unfreeze — the note
     "contains TWO different curves … and the bridge between them is broken. The operator's curve
     decision must pick which is actually on the table" (`curves/balancer_w/KURTOSIS_KNOB_kappa_balancer_native_2026-06-10.md:20-22`;
     research-lead reconcile queued).
   - Knob LABEL/sign: "Do NOT ship 'τ up = fatter.' The exposed label is the operator's call"
     (`curves/balancer_w/KURTOSIS_KNOB…:284-285`).
   - Whether the paper's "log/exponential-curve invariant" is the τ→0 Laplace member — "a wording
     call — flag to operator" (`curves/balancer_w/KURTOSIS_KNOB…:177`).
   - ERA-REVERSAL for the skeptic's record: 2026-06-01-era transcript says "Rohan does not want
     kurtosis; BL on the fixed Balancer curve is the mechanism"
     (`history/session_tree_note.md:1056-1057` [verbatim-transcript context]) — superseded by the
     2026-06-10 motive ("purpose = kurtosis knob", feature_inventory §motive). Not an open
     contradiction; recorded so nobody cites the old position as current.
2. **B1 solvency ship-gate — OPEN (the known hole).** [#13] Operator ship-gate; "B1 ship-gate
   (funding-coverage sweep, κ extrinsic) — still the open solvency prize" (manager
   `MEMORY.md:681` [manager-recorded]). Lineage: a live-engine check battery "surfaced a real
   solvency gap" (`history/transcript_journal.txt:53`, 2026-06-03 session). No operator ruling
   recorded that closes it; geometry provably cannot (PH-4b necessary-not-sufficient).
3. **γ/σ calibration tier — OPEN product call.** [#6, #7] Operator's three-tier frame from the
   pre-GH era: "Three product tiers (Rohan): HTML knob open; prod fixed-at-bootstrap; oracle-fed
   vol (hardest — vol feed reshapes convexity+funding, needs hardening)"
   (`history/session_tree_note.md:1918-1921` [transcript, recorded as Rohan's]). GH-era follow-on:
   "σ-knob rec flagged to operator (ship GH σ→γ map, not Gaussian closed form)" (manager
   `MEMORY.md:16` [manager-recorded]) — no recorded operator ruling on the tier or the σ→γ map.
4. **Engine-faithfulness PIVOT — hold LIFTED by operator ruling; 5 faith gates landed;
   completeness audit still OPEN.** [#12] Original hold: "operator is finishing config first; do
   NOT begin the pivot until told" (manager `MEMORY.md:163` [manager-recorded]). RULED-lifted
   2026-06-10: operator answered **"1 yes"** to the manager's plain-English un-hold question —
   pivot built and gated before any new theory work
   (`history/operator/2026-06-10_project-status-review.md` entry 14 ruling 1
   [verbatim-transcript]; encoded as CLAUDE.md §0 ruling 1). Landed: 5 faith gates landed green
   (a8998cf); completeness of the faithfulness program unaudited — that completeness audit (live
   engine reproduces EVERY proven construct) is what remains OPEN here. Tester re-ran the full
   suite green 2026-06-11 incl. FAITH 1–5 (HEAD `6cc73563`). _(Stale "HELD" fixed 2026-06-11 per
   skeptic run-8 condition 6; tester-applied.)_
5. **|Γ|>1 "labelled approximation" rider — tracked, verify the label actually ships.** [#7]
   Operator decision LOCKED 2026-06-09: "Settlement = TRUE AMERICAN (cash-out-anytime) … Scope:
   |Γ|≤1 exact; |Γ|>1 = labelled approximation (mutual exclusivity is PROVED, not a choice)"
   (manager `MEMORY.md:177-180` [manager-recorded]). The engine runs γ>1 (true-American regime)
   by locked architecture — i.e. the regime the operator said must carry an explicit
   approximation LABEL on replication claims. Tester has NOT verified any such label in UI or
   paper claims. Not a defect finding; a rider the skeptic should keep against paper/UI claims.
6. **Layer-2 honest-dollar slippage $ — DEFERRED (attribution caveat).** [#10, #11] Deferral is
   recorded manager-side ("route reserve-USD through the existing carved-perp settlement chain;
   reuse, don't improvise" — `MEMORY.md:575-576`); no operator words on it found in transcripts.
   AMBIGUOUS-ATTRIBUTION whether the deferral was operator-voiced or manager-proposed-unopposed.
7. **Stale-era operator questions never explicitly closed (possibly mooted by pivots — saying so
   honestly rather than silently dropping):** auto-protect sizing Q14 ("is D8=0.3 to become a
   derived OUTPUT … or kept as a CEILING") and Q15 (where the extra protection value comes from)
   — `history/session_tree_note.md:562-568` [transcript-era]. Backend/auto-protect scope (CTO
   side); no resolution recorded anywhere in the repo. OPEN-stale.
8. **Ops minor:** `$ARISTOTLE_API_KEY` stored wrapped in literal angle brackets — "escalate to
   operator" (`MEMORY.md:290`). OPEN-minor.

### RESOLVED / RULED (kept here so the skeptic can check none were quietly re-opened or
mis-claimed; full per-version detail in the entries below)

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
  live + hardened, formal/INDEX.md promoted. Operator approval: "yes to all"
  (`history/operator/2026-06-10_project-status-review.md` entry 2 [verbatim-transcript]);
  hardening mandate: "Id especially want the version control agent to be diligent in recording
  features level changes desirable not desirable etc so i dont ever have to keep inventory of the
  same" (same file, entry 4 [verbatim-transcript]). _(Cites upgraded 2026-06-11 from
  manager-recorded fragments — the session transcript now exists verbatim.)_

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
the GH era; the v25-GH/v26a session "OG manager: HTML refinement chat" 2026-06-08 exists only as
the summary stub `docs/context/chats/og-manager-html-refinement.md`, which records work, not
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

---

## Standing reconciliation list (all OPEN undesirables, one place)
| Item | Introduced | Status |
|---|---|---|
| Payoff ray-legend overprint (cosmetic) | v26c | OPEN — intern polish, non-blocking |
| Collar-aggressiveness slippage magnitude | v26a (exposed) | ACCEPTED — operator parked |

_Tester: append new entries above the reconciliation list; update the list every entry._

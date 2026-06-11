# curves/gh/ — PIVOT MAP (the GH decision history, keyed — not a homogenous bulk)

_Created 2026-06-11 (restructure slice 1). Operator directive (verbatim, 2026-06-11 transcript
entry 8): "in the curve specific thing you'd very speifically map the various pivots etc. so its
not just a homogenous bulk, but actually makes sense". Facts below are COPIED from
`engine/builds/BUILD_LINEAGE.md` (builds + md5s), `engine/builds/DIFF_LEDGER.md` (behavioral
deltas + operator voice), `formal/INDEX.md` (Lean rows), and the verbatim transcripts under
`history/operator/` — nothing re-derived here. `engine/` itself is untouched by the restructure;
this file points INTO it._

**This folder's theory notes (moved here from `notes/` in slice 1):**
- `GUDERMANNIAN_BRIDGE_2026-06-10.md` — hyperbolic-angle collapse of the GH kernel, d↔kurtosis
  law (mixed note, GH-dominant; its curve-independent legs 1–2 are cross-linked from
  `framework/README.md`).
- `REPARAM_balancer_kurtosis_dropin_2026-06-09.md` — freeing the GH kernel pins (δ, βh);
  Cobb-Douglas/Balancer = the δ→∞ Gaussian corner (v2, reconciled).
- `CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md` — GH-vs-CES fork analysis + the honest transfer
  accounting (§3: what survives a curve swap) over the Lean corpus.

**GH math source of truth (stays in the engine tree):** `engine/knowledge/GH_MATH.md`,
`engine/knowledge/SOURCE_OF_TRUTH_core_functions.md`, `engine/knowledge/gh_engine_reference.js`.
**Skeptic verdicts bearing on GH (their channel, never moved):**
`notes/skeptic/VERDICT_KURTOSIS_KNOB_2026-06-10.md` (the "GH = one (W) setting, τ≡δ EXACTLY"
identity BROKEN — kernel-in-SCORE ≠ kernel-in-WEIGHT), `notes/skeptic/VERDICT_GUDERMANNIAN_2026-06-10.md`.
**Standing OPEN (operator-tier):** how the live GH engine relates to the proposed τ-family
(`CLAUDE.md` §0); the curve/invariant decision is always the operator's.

---

## PIVOT 0 — predecessor: the barrier curve (pre-GH era)

- **Build:** `engine/builds/temporal_mvp_v24_rebase_fixed_2.html` — "the barrier-curve build
  before the GH swap — not included; superseded by v25_gh" (BUILD_LINEAGE predecessor note;
  no md5 row in BUILD_LINEAGE).
- **Decision that ended it:** curve-baked **GH only, γ>1, no barrier** — "barrier's exponent is
  outside the GH family; δ won't recover it" (`CLAUDE.md` §4 locked architecture).
- **Record:** the pre-GH era (composite-ray v24 / v25-american / convexity-knob arc) lives in
  `history/session_tree_note.md`, which "ends at the curve-shape pivot" (DIFF_LEDGER provenance
  note). Era working note: `notes/mvp_v5_brainstorm.md` (left in `notes/`, historical).

## PIVOT 1 — barrier → GH swap (v25, 2026-06-08 era)

- **Build:** `temporal_mvp_v25_gh.html`, md5 `9910c69924fd0b413dbb75e5b4ca56a0` — "barrier→GH
  swap baseline; gates green" (BUILD_LINEAGE).
- **What changed (BUILD_LINEAGE "what each step changed"):** swapped the AMM invariant from the
  Balancer barrier to the GH curve; only `getMP_raw, tradeUpdate, arbitrageToOracle, rebase` +
  `ghCalibrate` are curve-dependent.
- **Specs/knowledge:** `specs/temporal_formal_spec.md` (the single coherent object);
  `engine/knowledge/GH_MATH.md`, `engine/knowledge/ARISTOTLE_hyperbolic_curve.md`.
- **Lean (formal/INDEX.md rows):** `gh_slope_law`/`esscher_core` (GHJ — GH trade = latent
  one-param group + Esscher tilt, NOT X·Y); `gh_arbLeak_density_nonneg` (PH3);
  `gh_no_floor_grounded` (PH4b); GHmeasure (prob measure, finite MGF, Bessel-K-free); GHMAPS
  (monotone reserve maps discharged).
- **DIFF_LEDGER:** feature-state rows #2 (curve warp "Live implicitly via GH score kernel
  (curve-baked v25)"), #4/#5/#6/#14 all "Last changed: v25".
- **Operator rulings:** ⚠ no raw transcript of the GH-era 2026-06-08 sessions exists in
  `history/` (DIFF_LEDGER provenance note) — operator voice for this pivot is secondhand
  (manager-recorded / summary stubs), labelled so in the ledger.

## PIVOT 2 — v26a: barrier-remnant fixes + the slippage-units fix (THE gotcha)

- **Builds (BUILD_LINEAGE):**
  - `temporal_mvp_v26a_fixes.html`, md5 `951d16eb1cfd0db24b2deffff30cd876` — "+ 3 barrier-remnant
    fixes; gates green".
  - `temporal_mvp_v26a_2c0337e8_slipWIP.html`, md5 `2c0337e8e0260e7dae6072e241d764f0` —
    "+ slippage WIP — KNOWN-BROKEN (~97% flat); lineage only, do not ship/build on".
  - `temporal_mvp_v26a.html`, md5 `89ae89e9df229186b134ca6638726d0c` — "+ slippage units fix;
    gates green; prior HEAD, demoted 2026-06-08 on v26b promotion".
- **The decision content:** slippage must reference the geometric marginal
  `mpGeom = getMP_raw·e^(−ghMu)` — `getMP_raw` is a **price coordinate, not the slope**
  (inventory #12, THE gotcha; the WIP's ~97%-flat bug is the price/slope conflation that passes
  every self-consistency gate).
- **Specs:** `specs/FIX_NOTE_v26a_historical.md` (the 3 remnants),
  `specs/SLIPPAGE_SPLICE_BRIEF_done.md` (+ `specs/historical/SLIPPAGE_SPLICE_BRIEF.md`),
  `specs/RECUT_NOTE_v26a_historical.md` (%-slippage re-cut).
- **Lean (formal/INDEX.md):** `getMP_raw_over_slope` (R3 — the price-coord vs slope pin);
  `pct_slippage_basis_independent` (R5 — % e^μ-cancels, $ carries the factor).
- **DIFF_LEDGER:** entry "v25 → v26a" [status: demoted (was HEAD)] — slippage 0.99%/$3.46 →
  71.45%/$6240.94 across the splice-level harness; collar-aggressiveness magnitude ACCEPTED
  (operator parked, manager-recorded `MEMORY.md:510-511`); OPERATOR-VOICE: "None found verbatim
  in transcripts for this transition".

## PIVOT 3 — v26b: ITM → American smooth-pasting (settlement semantics)

- **Builds (BUILD_LINEAGE):** `temporal_mvp_v26b.html`, md5 `8df9f8a3cb705282a5348ce778f9eb82` —
  "+ ITM/American smooth-pasting (mark/markFrac split, both wings, seam gate wired); prior HEAD,
  demoted 2026-06-08 on v26c promotion." Display variant `temporal_mvp_v26b_xrange.html`, md5
  `570ef23ff89d931b8394e8f38c9d17a5` (payoff x-range only; not HEAD).
- **The decision content:** continuation `c·sNorm` runs PAST the strike to the free boundary
  `sNorm* = θ·((γ+1)/γ)^γ` (price `S* = K·γ/(γ+1)`, `c = 1/((γ+1)·sNorm*)`), then intrinsic —
  closed form, no new params; funding untouched via the mark/markFrac split (`CLAUDE.md` §4).
- **Spec:** `specs/SPEC_itm_exercise_smoothpaste_NEXT.md` (+ historical drafts
  `specs/historical/SPEC_itm_exercise_smooth_pasting.md`, `specs/historical/SPEC_itm_exercise_smoothpaste.md`).
- **Lean (formal/INDEX.md):** `valueMatch_A`/`slopeMatch_A` (R1 — PH-5 C¹ smooth-pasting, both
  wings); `Sstar_A_forced`/`coeffA_forced` (T1a — boundary GENERATED as unique solution);
  `opt_boundary_is_max_A` (T1b — S* = optimal exercise boundary); `compositeRay_ITM_substitution` (C1).
- **DIFF_LEDGER:** entry "v26a → v26b" — seam C¹ value 0.000% / slope ≤0.0005%, negative-
  controlled; funding bit-identical; x-range UNDESIRABLE RECONCILED-in-v26c.
- **Operator rulings (manager-recorded in the ledger entry; no raw v26b transcript):** the
  operator caught the manager's call/put LABEL swap (→ exposed the engine wing-tag inversion;
  fix = boundaries bound by S-direction, not tag); ITM second-wing boundary RATIFIED 2026-06-08;
  ITM "park" NOT preserved (effK=K always); "Settlement = TRUE AMERICAN (cash-out-anytime)"
  ruling 2026-06-09 retro-confirms the semantics; lineage verbatim ("I buy a discount IOU…",
  "same carved slice everything…", "initial not closing, escrowed not appropriated").

## PIVOT 4 — v26c: uniform strike registration θ=sNorm(K) (current HEAD)

- **Builds (BUILD_LINEAGE):**
  - `temporal_mvp_v26c_strikereg.html`, md5 "(see git)" in BUILD_LINEAGE (on-disk `md5sum` this
    slice: `75e60daccea093ad0bef300af7561430` — informational, not a LINEAGE row) — DISPLAY mark
    path only; SCOPE-PARTIAL, superseded by v26c_full.
  - `temporal_mvp_v26c_full.html`, md5 `8f7b3ffb…` (BUILD_LINEAGE; full on-disk value
    `8f7b3ffbaf6556f4fb2f71efc056a177`) — uniform registration, superseded by v26c_full2.
  - **`HEAD_temporal_mvp_v26c.html`**, md5 `6cc73563779a3e030774b7597d0ae187` (was
    `temporal_mvp_v26c_full2.html`) — **current canonical HEAD**: uniform `θ=sNorm(K)` across
    display mark + execution/settlement + payoff chart; chart strike-RAY live `K/oracle`;
    permanent `dir_gate.js`; Finding-2 absorbed; manager-verified Node level + UI tester-confirmed.
- **The decision content:** register the strike in the curve's carry coordinate
  (`θ=sNorm(K)` via `sNormStrike` = getSNorm∘arbitrageToOracle) UNIFORMLY — the OTM→ITM
  crossover lands at the dollar strike K for all γ (was drifting to oracle₀²/K for γ>1);
  funding/isOTM/wingMember stay price-measure.
- **Spec:** `specs/SPEC_strike_registration_NEXT.md` ("Operator-ruled 2026-06-08 … strike-basis
  mismatch, not directional").
- **Lean (formal/INDEX.md):** `crossover_sNorm_at_K` (R2 — θ=sNorm(K) ⇒ crossover at dollar K
  ∀γ); `put_mark_anti` (R4 — wing orientation signs).
- **DIFF_LEDGER:** entry "v26b → v26c" [status: HEAD-promoted 2026-06-08] — dir_gate crossover
  |err| = 0 at γ∈{1.5,2,3,4}; chart mark == table (worst |diff| 8.6e-11); Finding-2 RESOLVED row
  in the rolling list (ruling 2026-06-08: display-bug/dollar-anchor; tester-confirmed live).
- **Operator rulings (manager-recorded in the ledger; no raw v26c transcript):** strike-basis,
  NOT directional (`MEMORY.md:582-586`); **funding stays LOCKED** (superseded the same-day
  funding-reopen authorization — θ-swap flips funding's sign; `MEMORY.md:592-597`); scope fork
  (A) — registration must be UNIFORM ("three strikes = screen lies about what trades");
  drawPayoff re-base to carry NOW, before HEAD (ruled (i), `MEMORY.md:623-626`).

## PIVOT 5 — engine-faithfulness pivot: the 5 FAITH gates (operator-ordered 2026-06-10)

- **Operator ruling (verbatim transcript `history/operator/2026-06-10_project-status-review.md`
  entry 14, ruling 1: "1 yes…"):** the pivot is UN-HELD and ordered FIRST — built and gated
  before any new theory work ("the live engine must reproduce every proven construct; the
  unproved spec↔engine gap is where the dodging lived", `CLAUDE.md` §0 rulings). Motive
  context: entry 12 (verbatim) — the PH/Lean scaffolding coexisted with "gaslight and dodge
  right to the last moment of testing".
- **The gates (built; wired as HARD GATEs in `engine/verify/run_all.sh`, header "FAITH GATES
  (engine-faithfulness pivot, operator-ordered 2026-06-10)"):**
  | gate | harness | claim gated | Lean row it must reproduce (formal/INDEX.md) |
  |---|---|---|---|
  | FAITH 1 | `engine/verify/faith_esscher.js` | trade = Esscher tilt translation, slope=P·e^(u−μ) | `gh_slope_law`/`esscher_core` (GHJ) |
  | FAITH 2 | `engine/verify/faith_rebase.js` | rebase = gauge move, sNorm-quantities invariant | `R_form_rebase_invariant` (PH6) |
  | FAITH 3 | `engine/verify/faith_reflection.js` | C3 mark reflection: put = reflected call | `reflection_arrow` (C3) |
  | FAITH 4 | `engine/verify/faith_merton.js` | γ↔vol tie: Merton root structure + (γ, σ_eff) pins | MERTON rows (`gh_put_root_in_strip`, `Sstar_is_merton_boundary`, …) |
  | FAITH 5 | `engine/verify/faith_fisher.js` | curvature = variance (cgf″=Var=Fisher), engine shadow | `cgf_deriv_mean_and_variance`/`cgf_convexOn` (UNIFY2/CLOSEOUT) |
- **Honest state note:** the DIFF_LEDGER feature-state table row #12 (as of v26c HEAD) still
  reads "full faithfulness gate = HELD pivot" — that row predates the 2026-06-10 un-hold; the
  authoritative sequence is the transcript entry 14 + the run_all.sh header. (Ledger is
  tester-owned; not edited by this restructure.)
- **Related left-in-place note:** `notes/perpetual_option_reconciliation_2026-06-09.md` — its
  guardrail section named the σ↔γ numeric confirm "naturally a first faithfulness gate" (the
  FAITH 4 ancestor); left in `notes/` (mixed/AMBIGUOUS, see restructure report).

## QUEUED — the w-warp build (warp-with-trades; inventory #16; NOT implemented)

- **Operator rulings (verbatim):** 2026-06-10 entry 14 ruling 2 ("2. yes" — trades bend the
  curve) completed by entry 16: "yes its w that the trade changes (while x and y also change to
  be faithful to actual reserves, refer the paper) and that warps it"; entry 10 final clause:
  "the curve warps with trades instead of (or along with) some point moving along the curve";
  2026-06-11 entry 7 (the slope-transport warp principle, quoted verbatim in
  `framework/README.md` §1).
- **Reference spec:** the paper's Trade Formula (α=x·w, β=y·(1−w) individually conserved; w=α/x
  derived; paper line 33: "Trades skew the AMM curve instead of moving the reserves point along
  it") — `docs/feature_inventory.md` item 16.
- **Status:** ⚠ OPEN-UNIMPLEMENTED — today's engine moves a point on a FIXED curve
  (code-verified, inventory #16); no design note may imply otherwise. Build target sequenced
  AFTER the engine-faithfulness pivot (ruling 1). Kurtosis knob stays static under trading
  (entry 14 ruling 3).
- **Acceptance test (pinned):** the pool-mark leg of the mode=unit-tangent-slope contract —
  post-trade curve must cross the post-trade reserves point with tangent ∥ ray
  (`framework/LDF_DEFINITION_CHECK_2026-06-11.md` §3); how the w-warp trade rule composes with
  the GH/kurtosis geometry = the UNDECIDED operator-tier design question.

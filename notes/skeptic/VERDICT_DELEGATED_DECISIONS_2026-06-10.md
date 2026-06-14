# SKEPTIC RULING — delegated pending decisions (operator handed the call)

_Author: skeptic, 2026-06-10. Operator message, verbatim (transcript
`history/operator/2026-06-10_kurtosis-curve-family-brief.md` entry 14): "what are you doing ?
give these to the skeptic and let him take a call" — in entry-14 context (manager enumerated the
pending items, operator routed them to me to DECIDE, not just flag). I remain read-only; the
manager executes the mechanics (git moves, provenance re-pointing, dispatch). Standing conditions
on anything I approve to move: MOVE-not-delete into reversible `archive/`; `history/` + engine
untouched; no live provenance broken without the manager re-pointing it FIRST; manager
re-derives/token-scans each formal move and truth-ups memories + provenance after._

_Reuses my prior scoping: `VERDICT_COLDSTORAGE_2026-06-10.md` and
`VERDICT_FORMAL_TRUTH_TO_OBJECTIVE_2026-06-10.md`. I did not redo that work; I am now converting
the ASK-OPERATOR items I deferred into decisions, as empowered._

---

## RULING A1 — PH / metriplectic / Kähler / Courant framing cluster (my Bucket 2B)

**DECISION: KEEP-as-motivation IN PLACE. Do NOT cold-store. Annotate, don't move.**

One-line reason: this is the paper's conservation-law / passivity motivation layer (a standing
operator-blessed reference), it is GROUNDED/trusted-from-prover, and the cost of getting the
keep-vs-store call wrong is asymmetric — wrongly storing the paper's own motivation story is a
real loss, wrongly keeping it costs only some directory clutter that an annotation already cures.

Why I am comfortable owning this (it was a "product call" in my prior verdict): the operator has
twice told me the paper is a STANDING MOTIVATION reference (charter + my MEMORY) and the paper's
§AMM-Mechanics conservation law IS the port-Hamiltonian story. So "is the PH frame motivation"
is not actually an open product taste question — it is already answered by the paper's standing
status. The only genuinely-store-worthy members are the two DEAD ones (CLOSEOUT_kahler =
CONJECTURAL, can't even be stated in Mathlib; CLOSEOUT_courant = proved no-go) — and even those
are useful "don't try this" epitaphs, exactly the kind of preserved-failed-fork record I insisted
on for the Gudermannian d-law. Storing them buys nothing and risks shredding the cross-cited PH
spine. KEEP all of 2B in place.

Manager executes: NOTHING moves for 2B. Add a one-line tag in `formal/INDEX.md` next to the PH /
metriplectic / Kähler / Courant rows: `[motivation-layer: paper conservation-law story, not a §4
curve contract]`. This is the zero-risk disposition and it makes the off-objective-but-kept status
honest in the live map. PH6 and B1 stay untagged-as-framing because each straddles a real §4
contract (#5 rebase covariance, #13 solvency) — they are KEEP-on-objective, not motivation.

---

## RULING A2 — `formal/aristotle_runs/` superseded items (my Bucket 2A) — method

**DECISION: LEAVE IN PLACE, ANNOTATE `INDEX.md` only. Do NOT physically move the run dirs.**
(The zero-risk option I named.)

One-line reason: every one of these dirs is the non-grounded/pre-harden TWIN that a kept
`_grounded`/`_clean`/`CLOSEOUT_` version already supersedes, `INDEX.md` already cites the
superseding version, and `RESULTS.md` is the append-only run ledger that is itself the audit
trail — so a physical move buys near-zero clutter reduction while adding live re-point surface and
risk to the one map (`INDEX`) everyone navigates by.

The deciding factor is the discharge-chain hazard I flagged in my own verdict: UNIFY2 is NOT
whole-movable (only its cgf piece is superseded; its non-cgf theorems may underlie
MERTON/GHmeasure), and the GHMaps↔frontier↔GHmeasure↔cgf chain means a mis-move strips a KEEP
result's ground. A pure annotation cannot trip that hazard. A move can. Given the move's benefit
is only tidiness, annotation strictly dominates.

Manager executes: in `formal/INDEX.md` (and/or `aristotle_runs/RESULTS.md` where the run is
ledgered), mark each 2A dir `[superseded by <kept-dir>; off-objective duplicate, retained for
trail]`: bare `UNIFY/`+`UNIFY_stage0/` → UNIFY2/CLOSEOUT_cgf; `GHJ/` → GHJ_grounded; `GHcoercive/`
→ GHcoercive_grounded; `PH3/` → PH3_grounded; `PH4b/` → PH4b_grounded; `CTPH/` → CTPH_clean;
`AIRTIGHT_T1b_optimality/` → `_clean`; `Courant/` → CLOSEOUT_courant; `Kahler/` → CLOSEOUT_kahler;
`AIRTIGHT_probe_optstop/` → probe-only (not a result). NO directory moves. Keep-list spine
(R1/T1a/T1b/MERTON + curve/slippage/Esscher + PH6/B1) untouched — confirmed.

---

## RULING B — the 3 HELD cold-storage docs (live references)

**DECISION: KEEP all three IN PLACE. Do NOT move.**

One-line reason: all three are still cited by LIVE files (the cited-ness is exactly why I marked
them HELD, not stale), and the most load-bearing citers are in the engine tree
(`engine/INTEGRITY.md`, `engine/knowledge/SOURCE_OF_TRUTH_core_functions.md` cite
`00_ORCHESTRATOR_START_HERE.md`) which is do-not-touch — so the doc cannot be cleanly relocated
without either touching the engine tree (forbidden) or leaving a dangling engine pointer (worse
than the clutter the move was meant to cure).

I considered the offered split (move + update only the NON-engine references). I reject it: it
produces a HALF-pointed artifact — the engine docs (`INTEGRITY.md` §4 erratum banner literally
routes a reader to `00_ORCHESTRATOR_START_HERE.md §4` for the price-vs-slope gotcha, the single
most expensive bug-class we have) would point into `archive/` while the bootstrap command points
to the moved location. A reference that is live-from-the-engine-tree is not "stale"; it is load-
bearing. The clutter cost of leaving three files in `docs/` is trivially below the cost of a
split-brain pointer set around THE gotcha doc. `02_RESUME_STATE.md` and the `og-*`/`orchestrator`
chat logs are cited by DIFF_LEDGER / tester MEMORY / the bootstrap command — same logic, and
moving only those three while their sibling pre-GH set already went to `archive/` adds asymmetry
for no gain. The cold-storage MANIFEST already records (line 33) that the engine pointer can't be
fixed in a docs pass — that note stands; treat these three as permanently-in-place live refs.

Manager executes: NOTHING moves. No reference edits. If the operator later wants these relocated,
that requires an engine-tree edit (re-point INTEGRITY/SOURCE_OF_TRUTH), which is a file-safety-gate
engine task, NOT a docs pass — escalate it as such, do not improvise it under a cold-storage run.

---

## RULING C — next curve work: proceed, order, and traps

**DECISION: PROCEED NOW. Settlement is locked (Reading A, entry 11), so the rebuild-gate
precondition is satisfied. But sequence the contract re-derivations in DEPENDENCY order, and
treat each as "re-derive a LOCKED contract on a new curve," operator-tier on any non-transfer —
NOT as ordinary research to-dos.**

One-line reason: the five remaining "everything stays the same" contracts (#4 carry, #5 rebase,
#9 funding, #11 dollar pipe, #16 warp-with-trades) are not independent — carry is the coordinate
the other four are expressed in, and warp-with-trades is the operator's standing-unimplemented
core mechanic that everything ultimately has to compose with — so order matters and a wrong order
re-does work.

### Order (manager dispatches research-lead in this sequence)
1. **#4 Carry first** (`P=Ny/Nx`, `u=log price − log P`, gauge coord `s=u−μ`). It defines the
   coordinate every other contract lives in. Until carry is pinned on the (W) curve, #5/#9/#11
   are being derived in an undefined coordinate.
2. **#5 Rebase** (degree-0 gauge; P→P/r, θ→θ/r, anchor w=½). Depends on #4. PH6 proved the GH
   legs; the (W) question is whether the same degree-0/sNorm covariance survives when the weight
   is a position field.
3. **#9 Funding** (slope-deviation vs the w=½ anchor). Depends on #4 (it is a slope-deviation in
   the carry coordinate) and is entangled with the warp (the anchor is a w-value).
4. **#11 Dollar pipe** can run in PARALLEL with #5/#9 — it is the stage-2→3 settlement plumbing,
   and CLAUDE.md §6 makes any NEW dollar path a HARD STOP. Its job is to confirm the EXISTING pipe
   still carries (reuse, don't improvise); flag immediately if (W) forces a new path.
5. **#16 Warp-with-trades LAST** — it is the operator's core unimplemented mechanic (paper Trade
   Formula: α=x·w, β=y·(1−w) individually conserved, w=α/x derived, "trades skew the curve")
   composed with the (W)/kurtosis geometry, and it sits behind the (UN-HELD, ordered-FIRST)
   engine-faithfulness pivot (ruling 1). It cannot be cleanly stated until #4 carry is pinned and
   the (W) weight-field map is fixed. Do the design-statement now; do not let it be skipped or
   reinterpreted away (my standing item-16 FLAG-OMISSION posture stands — silence = flag).

### Traps to watch (hand these to research-lead as the gate, drawn from my prior findings)
- **#4 carry — the `dq/du ≠ 1` slip.** On the GH curve the carry coordinate is NOT the naive log
  ratio; raw-u breaks the gauge (inventory #4: "raw-u breaks the gauge structure — the gauge coord
  s=u−μ is forced"). On the (W) curve the weight is position-dependent, so the Jacobian from the
  trading coordinate to the carry coordinate is NOT identity. Any derivation that silently uses
  `dq/du=1` (or treats `u=ln(y/x)` as the carry coord) is wrong by exactly the gotcha-class factor.
  Demand the Jacobian written out.
- **#9 funding — the w=½-anchor ambiguity when w is a FIELD.** Funding is defined as slope-
  deviation vs the w=½ anchor. On (W) the weight is position-dependent (`w_mid`, `Δw`, `τ`), so
  "the w=½ anchor" is ambiguous: is it the curve-center weight, the local weight at the strike
  ray, or a global reference? The GH funding result anchored at a SINGLE w=½; on a weight-field
  curve this must be pinned to ONE meaning before the sign is even defined. Demand the explicit
  definition of "the anchor" before accepting any funding-sign claim (and recall funding's sign
  flips under θ-swap — it must not be silently touched by a mark/strike change).
- **#16 — the paper-Trade-Formula → φ (weight-field) map.** The paper's trade rule is stated for
  scalar w (α=x·w, β=y·(1−w), w=α/x). The (W) curve's weight is a FIELD `w(position; w_mid,Δw,τ)`.
  How a trade updates a weight FIELD (not a scalar w) is UNDEFINED and is the actual design
  question — do not let "trades change w" be asserted as solved when the object that changes is a
  profile, not a number. The bridge GH-SCORE-kernel ↔ (W)-WEIGHT-kernel is BROKEN (CLAUDE §0,
  my KURTOSIS verdict): same kernel, different curve. So any "the trade just shifts w" claim on
  the (W) curve owes the pushforward/weight-field map, not a scalar analogy.
- **Cross-cutting (my pattern #3):** every number must be checked at the engine pin **β=1** (skew
  +0.92, put-only, degenerate weight endpoints), not the β=0 symmetric slice. A "= engine" or
  "contract transfers" label computed at β=0 is not the engine.
- **Cross-cutting escalation discipline (my verdict #5):** a LOCKED contract that does NOT transfer
  to (W) is operator-tier "Changed", not an ordinary "OPEN/not-worked" research line. The manager
  must escalate a non-transfer as "locked contract does not transfer", verbatim — not soften it
  into a to-do.

Manager executes: dispatch research-lead on #4 carry FIRST (with the dq/du Jacobian trap as the
explicit gate), then #5 rebase and #9 funding (each with its trap), #11 dollar pipe in parallel
(HARD-STOP on any new path), #16 warp-with-trades design-statement last. Each result returns
through me (curve-note completeness/steelman pass against `feature_inventory.md`, all 16 items
dispositioned) before any merge or shared-truth encoding.

---

## SUMMARY (what the manager executes)
- **A1:** No moves. Annotate the PH/Kähler/Courant rows in `INDEX.md` as `[motivation-layer]`.
- **A2:** No moves. Annotate the 2A superseded twins in `INDEX.md`/`RESULTS.md` as
  `[superseded by <kept>; retained for trail]`.
- **B:** No moves. No reference edits. (A relocation would be an engine-tree edit = separate
  file-safety task, not a docs pass.)
- **C:** Proceed now. Dispatch research-lead in order #4 → {#5, #9, #11-parallel} → #16, each
  gated by its named trap; non-transfer of a locked contract escalates operator-tier.

Net: three of the four rulings are "annotate, don't move" — the reversible-move latitude the
operator granted is real, but in every case here the move's only benefit is tidiness and its cost
is live-provenance risk, so annotation dominates. C is the one "go" — and it goes in dependency
order with the traps front-loaded.

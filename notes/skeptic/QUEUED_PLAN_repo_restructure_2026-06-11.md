# QUEUED PLAN — repo restructure (curve-agnostic vs curve-specific) + org-chart review

_Skeptic, 2026-06-11. Source: operator transcript entry 52 (verbatim, `history/operator/2026-06-10_kurtosis-curve-family-brief.md`).
This is a **NOTE-AND-QUEUE** design deliverable, not an executed move. I am read-only on the repo and
cannot do git or recruit agents (§6/§7 Gate-1) — this is the plan the MANAGER costs, scopes, and executes.
The restructure is repo-wide / high-blast-radius = operator-tier: the manager confirms scope with the
operator before moving anything._

---

## 0. Comprehension (my own voice — what I understand the operator to want)

Two folders, one principle: **separate the parts of the project that would survive a curve change
from the parts that are about the specific curve we currently happen to have.**

1. **A curve-AGNOSTIC framework folder, promoted to a first-class top-level citizen.** Everything that
   is true regardless of which invariant we pick — the perpetual-American option semantics, carry/rebase
   gauge structure, `value∝S^(−γ)` pricing law, ITM smooth-pasting settlement, funding, the dollar/
   settlement pipe, the solvency frame, the file-safety/verification discipline, the trade-faithfulness
   *requirement* (warp-with-trades as a contract), and the motive itself. These are the "everything else
   stays the same" lines of the charter. They should NOT live buried inside a folder named after GH or (W).

2. **A curve-SPECIFIC folder, with the pivots EXPLICITLY MAPPED** so it reads as a navigable history of
   *why each curve was tried and why we moved on* — not an undifferentiated pile of overturned notes.
   Each pivot gets a labelled boundary: what the curve was, what it bought, what broke it, what replaced
   it. The operator's words: "not just a homogenous bulk, but actually makes sense."

3. **Org-chart review:** check the 6-role team against the work actually in flight; the operator floated
   (a) recruiting an organiser/librarian agent and (b) offloading overlapping responsibilities off the
   tester. I give my read below; the operator decides whether to recruit.

### Ambiguities I would want the operator to clarify (route through manager)
- **A1 — granularity of "curve-agnostic."** Some objects are agnostic *in intent* but their current
  *derivation* is curve-specific (e.g. carry `u=log price−log P` is a framework contract, but the proof
  that it holds is done on GH and re-done on (W)). Does the operator want the framework folder to hold
  the **contract/spec** (agnostic) with the **per-curve discharge** filed under each curve — or the whole
  thing in one place? My default recommendation is the former (contract up top, proof-per-curve below),
  but this is a genuine fork.
- **A2 — does the formal/Lean corpus split, or stay whole?** The Lean proofs are mixed: some prove
  framework lemmas (Merton tie, settlement closed form), some are GH-specific (GHMaps/GHmeasure), some
  are the off-objective PH/Kähler framing layer. A clean split fights the `lakefile`/import graph.
  Recommendation: do NOT physically split the Lean project (it's one build target); split via an INDEX
  ANNOTATION layer (agnostic-lemma vs curve-specific-lemma tags) instead. Operator should confirm.
- **A3 — scope of "ruthless."** Does "ruthlessly restructured" mean physically `git mv` everything now,
  or stand up the two-folder SKELETON + classification map and migrate incrementally? Given the curve
  object is live-in-flux (see §4), I recommend skeleton-first. Operator should confirm appetite.

---

## 1. Current repo layout (ground truth, surveyed 2026-06-11)

Top-level: `engine/ specs/ formal/ notes/ docs/ paper/ evidence/ history/ archive/` + `CLAUDE.md INIT.md`.

The repo is currently organized **by ARTIFACT TYPE** (code, specs, proofs, notes, evidence), NOT by
agnostic-vs-specific. So almost every type-folder is a MIX of both axes. That is exactly the homogeneity
the operator is reacting to. Concrete mixing:
- `engine/builds/` — v24 (Balancer base, agnostic-ish), v25 (GH), v26a–c (GH line), v27 (W-kurtosis) all
  in ONE flat folder; the pivots are implicit in version numbers + `BUILD_LINEAGE.md`/`DIFF_LEDGER.md`.
- `notes/` — overturned curve-research notes (CURVE_SWAP/REPARAM/HET/KURTOSIS/GUDERMANNIAN) sit next to
  framework notes (rebasing_logic, perpetual_option_reconciliation) and live roadmap notes.
- `specs/` — `SPEC_kurtosis_curve_family_TARGET` (curve-specific) next to `temporal_formal_spec`,
  `SPEC_itm_*`, `SPEC_strike_registration` (largely framework).
- `formal/` — one Lean build target spanning agnostic + GH-specific + off-objective framing proofs.
- `archive/cold_storage_2026-06-10/` — already a reversible move-store (skeptic-ruled, MANIFEST present).

---

## 2. Org-chart / charter review

**Charter (CLAUDE.md):** deliverable = one HTML file; locked-decision discipline; file-safety +
verification gates; the inventory-of-record (DIFF_LEDGER) gates HEAD promotion.

### Current 6 roles vs work in flight
- **manager** — design authority + sole git actor + escalation hub. Load-bearing, no overlap. The
  restructure's execution lands here regardless of any recruit.
- **research-lead** — Lean conjectures + Aristotle relay + proof audit. Distinct surface. The B-fork
  curiosity run (entry 38) + warp∝notional check (entry 37) are live here.
- **intern** — engine HTML edits. Distinct, file-safety-bound.
- **tester** — Playwright + Node oracle + **owns DIFF_LEDGER (the inventory-of-record) + BUILD_LINEAGE
  context + the standing UI smoke-pass**. This is where I see overlap (below).
- **paper** — drafting from locked decisions.
- **skeptic** — me; completeness/steelman + response-type policing.

### Is a new "organiser/librarian" agent warranted? — MY READ: a NARROW one, YES, but bounded.
The restructure is a one-time-heavy + thereafter-ongoing curation job (keep the pivot map current as
curves change; keep the agnostic/specific boundary honest as new work lands). That curation does NOT fit
cleanly in any existing charter: the manager is execution+git (and shouldn't also be the librarian — that
concentrates too much), the tester is behavioral-evidence, the skeptic is adversarial (I should AUDIT the
organisation, not OWN it — owning it would compromise my independence; I can't red-team my own filing).
So a **librarian/archivist agent** is defensible. What it would own, tightly scoped:
- the two-folder taxonomy + the **pivot map** inside the curve-specific folder (keeping it navigable);
- the cold-storage MANIFEST discipline (MOVE-not-delete, reversible, ref-integrity) — extending the
  pattern already established in `archive/cold_storage_2026-06-10/`;
- **reference-integrity** on any move (no dangling pointers — the §file-safety/engine-tree pointer hazard
  from cold-storage verdict #7/#9 is exactly the kind of thing this role must check before a move).
- It must be **read-only on the engine** and **NOT a git actor** (manager stays sole git/merge authority)
  — it proposes moves as a manifest, the manager executes. Same structural posture as me.

**What it must NOT do:** classify a curve as agnostic-vs-specific where that classification is itself a
truth claim (e.g. "carry transfers to the new curve" is a CLAIM, not a filing decision — that stays with
me/manager). The librarian files; it does not adjudicate what's true. I'd FLAG-PROCESS any filing that
smuggles an unsettled claim into the taxonomy.

**Caveat (convergence-alarm on the recruit itself):** adding an agent is not free — it's another voice
that can converge with the manager. If the operator wants to avoid the headcount, the alternative is the
**manager owns the taxonomy mechanics, I audit it** (my standing role already covers the audit). The
recruit is justified only if the curation load is genuinely ongoing — which it is *only if* the project
keeps cycling curves. Given entry 53 (first-principles curve rethink in progress), it likely will.

### Tester overlap to offload — MY READ
The tester currently owns three things, one of which is arguably a librarian/manager function:
1. **Playwright + Node oracle behavioral evidence + FLAG verdicts** — CORE tester, keep.
2. **DIFF_LEDGER as the inventory-of-record + HEAD-promotion gate** — KEEP with tester (it's
   evidence-keyed; the feature-state table IS behavioral). Do NOT move this to a librarian — it's a
   verification artifact, not a filing artifact.
3. **BUILD_LINEAGE / version-history narration + the build-file zoo in `engine/builds/`** — THIS is the
   overlap candidate. Cataloguing which build is which pivot, keeping the lineage readable, is
   librarian/archivist work, not behavioral testing. The tester should keep producing the per-build
   behavioral DELTA (DIFF_LEDGER entries); the librarian could own the build-file ORGANIZATION + the
   pivot map that contextualizes them. Clean seam: **tester says what each build DOES (behavior);
   librarian says where each build SITS (lineage/pivot).**

Net org recommendation: **one narrow read-only librarian agent** owning taxonomy + pivot-map + move-
manifests + reference-integrity; tester keeps DIFF_LEDGER + smoke-pass, sheds only build-file
LINEAGE/organization narration. If the operator prefers no recruit, fold the mechanics into the manager
under my audit. **Operator decides the recruit** (it's a team-structure call = operator-tier).

---

## 3. Queued restructure SKETCH (manager costs + sequences; nothing moves yet)

### Proposed top-level split
```
framework/        <- curve-AGNOSTIC first-class citizen (the "everything else stays the same" spine)
curves/           <- curve-SPECIFIC, pivot-mapped
```
(Names illustrative — operator/manager may prefer `core/` + `curve/`. The PRINCIPLE is the split.)

### What goes where (proposed classification — manager verifies each, I audit)
**framework/ (agnostic):**
- The motive + locked-contract specs: carry, rebase gauge, `value∝S^(−γ)` pricing law, ITM smooth-
  pasting settlement semantics, funding, dollar/settlement pipe, solvency frame, file-safety/verification
  discipline. (Inventory items #4,5,6,7,9,10,11,12,13,15 are framework CONTRACTS; #16 warp-with-trades is
  the framework REQUIREMENT on any curve's trade rule.)
- `paper/` (the motivation reference — agnostic by construction).
- `docs/feature_inventory.md`, the operating policies (transcription/concurrency), CLAUDE.md stays root.
- Framework-level Lean lemmas (Merton tie, settlement closed form) — by INDEX ANNOTATION, not physical
  move (see A2).
- The perpetual-American option semantics + the `(w,τ)` future-directions conjecture.

**curves/ (specific, pivot-mapped):**
- Per-curve subfolders, each holding that curve's engine build(s), its derivation notes, its specific
  Lean proofs (annotation-linked), its gates.
- The overturned curve-research notes filed under the curve they belong to (CURVE_SWAP→GH-era,
  REPARAM/HET/KURTOSIS/GUDERMANNIA→the (W)/τ exploration).

### The PIVOT MAP (the operator's specific ask — make it navigable, not bulk)
Inside `curves/`, a top-level `PIVOTS.md` index + one subfolder per curve regime, each with a
2–4 line header stating **what / why-tried / what-broke-it / what-replaced-it**. The pivots I can see:

| # | Pivot | What it was | What broke / why moved on |
|---|-------|-------------|----------------------------|
| P0 | **Barrier-as-primitive** (pre-GH, v5-era) | trade = barrier; the paper's original mechanic | exponent outside the GH family; operator moved past it (CLAUDE §4); barrier-era notes already cold-stored |
| P1 | **Balancer base** (v24) | `x^w·y^(1−w)=k`; skew via w, no kurtosis knob | the project's *base*, not a dead end — it's the agnostic member; lives at the seam |
| P2 | **GH curve** (v25→v26c) | kernel in the latent SCORE; δ as elbow knob | DEMOTED 2026-06-10; kernel-in-SCORE ≠ kernel-in-WEIGHT; "GH=one (W) setting, τ≡δ" BROKEN (verdict #1). Retained, suite still green |
| P3 | **(W) kurtosis curve** (v27, off v24) | √-kernel weight-FIELD; static τ; strong-form φ-warp | CURRENT HEAD, but live-contested: warp elbow-local + sub-pixel at default; trade-point anchoring OPEN (#16 partial); entry-45 lacunae |
| P4 | **Spot-warp vs trade-point-anchoring (fork A/B)** | A=trade-point/strike-driven (chosen entry 38); B=per-notional uniform (curiosity only) | A is the build target; B is adjacent-terrain brainstorm; warp∝notional check queued to research-lead |
| P5 | **First-principles polar liquidity-distribution** (LIVE brainstorm, entries 47–53) | a relative-radius density native to polar-ray coords with native skew+kurtosis knobs; "maybe dont even need weights" | OPEN — operator explicitly "dont be married to the current thing." May REPLACE P3's (W) weight-field entirely |

This map is the thing that makes `curves/` "make sense" rather than be bulk: each pivot is a labelled
chapter, and P5 shows the history is *still being written*.

### What NOT to touch (carried from cold-storage verdicts #7/#9, still binding)
- `history/` verbatim record — DO NOT TOUCH.
- engine blobs / file-safety gate — moving the HEAD HTML is an engine-tree/file-safety task, NOT a docs
  pass; gate keys off the canonical path. Any build-file relocation must update the gate + run_all paths
  and pass the file-safety hook. This is the single highest-risk part of the whole restructure.
- live pointer chains (INTEGRITY/SOURCE_OF_TRUTH → 00_ORCHESTRATOR; DIFF_LEDGER → docs/context;
  bootstrap-roles command refs). Any move must fix or annotate, never dangle.
- overturned-claim correction headers — they ARE the audit trail; move the file, never strip the header.

---

## 4. Dependency ruling — does the restructure wait for the curve to settle?

**RULING: the AGNOSTIC side proceeds first; the curve-SPECIFIC side waits — specifically its taxonomy
proceeds but its FILING does not finalize until the live curve object settles.**

Reasoning, grounded in the live transcript:
- Entry 53 (verbatim): *"dont be married to the current thing, think from first principles as a liquidity
  (relative radius) distribution ... maybe dont even need weights then idk."* The operator is actively
  questioning whether the (W) weight-field (P3) — the CURRENT curve-specific layer — even survives. P5 may
  add a whole new curve regime or REPLACE P3.
- Therefore: **standing up `curves/` and finalizing its pivot map NOW would presuppose a split that the
  operator is mid-redesigning.** If P5 lands, the pivot map gains a chapter (cheap) or P3 gets demoted
  like P2 did (the map must accommodate this — which is exactly why a *pivot map* and not a flat folder).
- The **framework side is curve-independent BY DEFINITION** — that's the whole point of the split. The
  agnostic contracts (carry, settlement, funding, dollar pipe, solvency, file-safety, the motive, the
  inventory) do not move under P5. So elevating `framework/` to a first-class folder is SAFE to do
  regardless of how the curve brainstorm resolves. It is in fact the thing that makes the curve churn
  *less* dangerous — a stable agnostic spine is what lets curves be swapped without losing the
  "everything else stays the same" guarantee.

**Sequence the manager should cost:**
1. **Phase 0 (now, after operator confirms scope):** stand up the two-folder SKELETON + the
   classification MAP (this note's §3) as a manifest. No physical moves yet. Operator/manager ratify the
   taxonomy + the A1/A2/A3 ambiguities + the librarian-recruit decision.
2. **Phase 1 (framework side):** migrate the agnostic contracts/specs/policies into `framework/` with
   reference-integrity checks. Lower risk; does not touch the live curve or the engine HEAD path until the
   engine-move sub-task is separately gated.
3. **Phase 2 (curve side):** DEFERRED until the P5 first-principles brainstorm resolves (operator picks a
   curve object or confirms staying with P3). Then file `curves/` with the pivot map finalized, P5
   included as a labelled chapter (whether adopted or archived-as-explored).
4. The **engine-build-file relocation** (moving the HEAD HTML / build zoo) is its own file-safety-gated
   sub-task in BOTH phases — never bundled casually into a docs move.

**Why not wait for everything:** waiting for the curve to settle before doing ANYTHING would leave the
agnostic spine buried (the operator's stated grievance), and the curve may not settle soon (P5 is an open
first-principles rethink). Splitting the safe-now part from the wait-for-settle part is the disposition.

---

## 5. Response-type lens (entry-44 gate) — how the manager should present this to the operator
This is a queue/scope action. Per my standing response-type gate, the operator should get: a short
plain-English confirmation that I understand (the two-folder split + pivot map + org review), my ONE
recommendation (narrow librarian agent, framework-first, curve-side waits for the brainstorm), and the
ambiguities I need him to rule on (A1/A2/A3 + recruit yes/no) — NOT this whole note dumped on his channel.
No PR mechanics, no md5s, no folder-path bikeshedding surfaced to him. The full plan lives here as the
manager's working document.

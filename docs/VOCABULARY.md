# Controlled Vocabulary — endorsed terms + banned/duplicative terms

**Purpose (operator entry 474, 2026-07-08, verbatim):** _"using terms like lean or anything i dont
endorse or redundant / duplicative terminoloy / vocabulaty is a likely cause for conflations; i want
a gate for this kind of stuff."_ Duplicate names for one object cause conflation. This registry is
the single source of endorsed vocabulary; the gate `engine/verify/vocab_gate.sh` enforces it on the
outward-facing text artifacts.

**Ownership:** the **skeptic** curates the banned list (dictionary-regression beat, §2.1 authority on
labels/vocabulary); the **manager** maintains the gate script and fixes hits. New bans require the
operator's endorsement or a skeptic FLAG citing the story table / mental model.

**Scope of the gate (must be clean):** `paper/`, `handover/`, `specs/`, `docs/` (excl. this file and
history), and the engine HEAD HTML's **user-visible strings**. **Excluded:** `history/` (operator
transcripts are verbatim — banned terms inside operator quotes are the record, never edited), this
file, and engine **code comments** (advisory only — reported, not gating).

---

## Endorsed terms (canonical — operator's own words, entry 474)

| object | ENDORSED term | notes |
|---|---|---|
| the pool curve's asymmetry vs the balanced curve | **the curve skews** / **curve skew** | geometric; the pool curve is skewed relative to the anchor |
| the balanced reference curve | **anchor curve** (w=½) | the symmetric reference |
| the funding INPUT | **ray deviation from the anchor curve** | measured **at each same-slope point** across the pool and anchor curves |
| the construction that produces the deviation | **same-slope point(s)** | match slope on both curves, read the two ray angles, take their deviation |
| the vol/kurtosis dial | **steepness knob `m`** / **constant slope multiplier** | CLAUDE.md §0; `m=1` = plain curve |

**The funding input, stated correctly (no shorthand):** _the ray deviation between the pool curve and
the anchor curve, taken at matching same-slope points_ — equivalently, a measure of how the curve is
skewed. Zero when the curve is unskewed (balanced, w=½) and zero in-the-money.

---

## Banned / duplicative terms → endorsed replacement

| BANNED | why | REPLACE WITH |
|---|---|---|
| `lean`, `leans`, `leaning`, `leaned` (skew sense) | operator does NOT endorse (entry 474); duplicate name for the skew/deviation | **curve skew** / **ray deviation (at same-slope points)** |
| `curvature knob` | invites smile-curvature misreading (skeptic NIT-1); duplicate of the steepness knob | **steepness knob** |

**NOT banned (do NOT flag):**
- `kurtosis knob` — **operator-endorsed** (CLAUDE.md §0: _"whose purpose is a kurtosis knob"_). The
  knob's *purpose* is kurtosis calibration; its *mechanism* is a steepness / constant-slope-multiplier
  dial. Both are current vocabulary. Only "**curvature** knob" is the duplicate.
- `Lean` (capitalized — the proof language / prover); `.lean` (Lean source files); `app:lean`
  (LaTeX label refs); `clean`, `cleanly` (the word "lean" is not a whole word inside them).
- Retired-lens words (`elbow-rounding`, `flat-top`, `√(τ²+u²)`, `peak-at-1 tent`) are **the skeptic's
  paper-sweep beat**, NOT this gate — historical specs legitimately record them as *superseded*, so
  automating a ban here just flags correct "this is NOT here" statements. Left to the skeptic.

## Two scopes
- **GATING (exit non-zero on any hit):** the CURRENT outward-facing deliverables only —
  `handover/`, the submitted paper `paper/wine2026/temporal_wine2026_v2.tex`, and the engine HEAD's
  **user-visible strings**.
- **ADVISORY (reported, non-gating):** everything else (other paper drafts, `specs/`, `docs/`,
  `notes/`) — internal shorthand to clean up over time; the **skeptic** curates edits to shared-truth
  docs (STORY_TABLE / mental-model / feature_inventory), which the manager must not rewrite unilaterally.

---

## How the gate runs
`engine/verify/vocab_gate.sh` — greps the in-scope artifacts for the banned whole-word forms
(case-sensitive for the `lean` family so the `Lean` prover is not matched), prints `file:line`, and
exits non-zero if any hit lands in the must-be-clean set. Engine code-comment hits are printed as
advisory (non-gating). Run it in `engine/verify/run_all.sh` alongside the other gates.

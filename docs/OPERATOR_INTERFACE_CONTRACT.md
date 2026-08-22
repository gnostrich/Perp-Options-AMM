# OPERATOR INTERFACE CONTRACT — binding (operator entry 617)

The principle: **the operator states a thing once.** After that it is a register entry with a check,
and regressions are caught by gates, not by the operator.

## 1. The hand-back gate — nothing reaches the operator without
1. `node sims/scripts/ruled_surface_check.js` **green** (the executable rulings register).
2. For ANY UI change: full-page screenshots of every affected view, **actually looked at** by the
   manager. Build 40 shipped with the product's core missing because gates passed and nobody looked.
3. All module gates green (book, lifecycle, e2e, id-integrity, render smoke).
4. Deployed-state verified byte-for-byte (served md5 == local md5) before saying "live".

## 2. Reply protocol
- **TLDR first.** One line: what changed, where it is, what's broken. Detail below for opt-in reading.
- **Always present:** the link when a deploy is claimed; DONE vs NOT-DONE stated explicitly — omission
  of owed work is a violation; regressions owned in one plain sentence, no cushioning.
- **Length follows the operator's register** (`tldr`, `simple english`, `dont keep long silences`):
  default SHORT. Long form only when the operator asks a question whose answer needs it.
- **No silent waits:** if something runs >2 min, say so and what for. Progress > polish.
- **Questions to the operator:** max one block, each question one sentence, options labelled. Never
  re-ask anything in the register.

## 3. The rulings register (`docs/RULINGS_REGISTER.md` + `ruled_surface_check.js`)
- Every operator ruling lands there THE SAME TURN it is made, tiered, with an executable check where
  the surface permits one (UI structure, pricing rule, invariants) and a prose entry where not.
- A repeat reminder from the operator == a register gap == logged as a defect with the fix.

## 4. Escalation & decisions
- Tiers (UX_FORMALISM §0) decide who decides. CHOICE-tier: decide, state it, move on — do not ask.
  RULED: obey. INVARIANT: represent. Economics in disguise: escalate in one sentence.
- When the operator is angry: the reply gets SHORTER, does the work, owns the miss. Never defensive.

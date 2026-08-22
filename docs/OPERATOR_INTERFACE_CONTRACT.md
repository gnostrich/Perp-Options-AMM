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

## 5. Diagnosability & regressions (added 2026-08-22 from the build 40–46 failure arc, entries 612–628)
1. **Visible build stamp on every deployed artifact** (e624) — a corner stamp, legible in any
   screenshot. **The stamp is read by the MANAGER off the operator's screenshot; the operator is
   NEVER asked to read, say, or care about it (e628 verbatim: "im not ging to say the fucking stamp
   number idk what the fuck that means").** Enforced by `ruled_surface_check.js`.
2. **"The operator sees X" must be diagnosable.** Never ship a surface where a stale cache and a
   wrong build are indistinguishable: stamp on the artifact + served-md5 == local-md5 verified at
   deploy. If the manager cannot say WHICH build the operator is looking at, the manager may not
   argue about WHAT they are looking at.
3. **Reference assets FIRST.** When the operator says a reference has something, the manager's first
   act is to fetch and DIFF the reference assets against what is shipped — before any rebuild.
   Builds 43–45 were spent rediscovering that the backdrop was byte-identical all along; the miss
   was an overlay, findable in one diff. Rebuilding before diffing is a contract violation.
4. **The operator's regression report carries ZERO burden.** One word ("regression", "dogfucked"),
   or a screenshot, or nothing but anger — all sufficient. The manager diagnoses from the stamp,
   the served hash, the reference assets, and the register — in that order — and reports the
   diagnosis before the fix. Asking the operator to specify what is wrong with a rejected build is
   permitted ONCE per artifact; re-shipping the same result and re-asking is not.
5. **Elements are imported, not imitated (e628).** When the operator points at a live reference
   product, take its actual components/assets; a from-scratch imitation of a reference the repo
   already contains is the e625 failure generalised.
6. **Mandatory pre-hand-back audit.** The manager MUST invoke the operator-interface agent on every
   operator-facing hand-back — a hand-back without its PASS is a contract violation, same class as
   a red file-safety gate. Invocation form (Task tool, agent `operator-interface`):
   _"Pre-hand-back audit: candidate reply pasted below + builds/files touched this turn. Verify
   ruled_surface green, screenshots taken and looked at, contract format, no ruling contradicted,
   OPERATOR_NOTES three sections updated, owed-but-undone listed. Return PASS/BLOCK."_
   BLOCK = fix and re-invoke; never ship over a BLOCK, never soften it into a footnote.
7. **Visual deliverables must be viewable (e558/e604 — twice).** Comparisons and illustrations ship
   as inline images in the reply AND on the live URL; if the operator says they could not see it,
   log it in OPERATOR_NOTES as a delivery failure and re-deliver — do not move on.
8. **Time-boxes bind (e596/e597).** When the operator sets one, scope to it and report against it.

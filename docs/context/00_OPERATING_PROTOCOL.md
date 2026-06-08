# Operating Protocol — Temporal cross-session discipline

This is the discipline that kept the multi-chat workflow coherent. It is preserved here
so the agents inherit it. The canonical live state is the session-tree note (the
append-only ledger); these are the rules that govern how roles hand work off.

## Roles are the addresses
Every piece of work is addressed `for-role`. Standard destinations:
- **manager** — independent re-derivation, spec oversight, verdicts. Consumes prover
  outputs, intern build reports, test evidence. Produces handoff bundles, spec edits,
  diff briefs.
- **intern** — HTML implementation. Consumes curated handoffs + spec. Produces built
  HTML + a build-report back to manager.
- **research-lead / aristotle** — Lean 4 proofs. Consumes precisely-stated conjectures
  (all predicates pinned before a run). Produces `.lean` + run-id + audit result.
- **tester** — Playwright. Consumes a build to test. Produces per-phase evidence with
  FLAG verdicts.
- **paper** — AfT/FMBC/WINE drafting. Consumes diff briefs + locked decisions.
- **CTO** (external) — Go backend propagation via the engine's prod-port mapping.

A package `manager → intern` rides one direction; the reply (build report) is a NEW
package `intern → manager`. Round trips are two rows, never an edit of one.

## Bootstrap (start of a work session)
1. Read the tail of the session-tree note + any `OPEN` markers for the topic at hand.
2. Pick up any package addressed to your role.
3. State your frame in one line: role, mode, working file, anything you just picked up.

## Exit (close of a work session)
A session is not "done" until:
1. A dated entry is appended to the session-tree note — what resolved, what's still
   `OPEN`, and the next actor/role for each open thread (decisions, not transcript).
2. Every deliverable produced is registered as a package row (`for-role`, path, md5).
3. Anything consumed this session is flipped to `CONSUMED`.
4. Any write token held is released back to `(free)`.
5. A one-line handoff is left for the human.

## Naming & versioning
- working files: monotonic descriptive suffix (`temporal_mvp_v26a_...html`); the ledger
  names the current canonical one.
- versions supersede, never overwrite — a corrected bundle is a new id that
  `SUPERSEDED`s the old, so the audit trail stays intact.

## Mode flag
Default mode is BRAINSTORM. No edits to the canonical engine until the human explicitly
authorizes a pass. The mode is load-bearing and carries across handoffs.

## Verification posture (manager)
Re-derive numbers; never rubber-stamp. Fast/clean submissions get MORE scrutiny, not
less. Honest labels only: "tester-confirmed", "trusted-from-prover" — never faked. Any
math the manager can re-derive in Node/Python, it re-derives.

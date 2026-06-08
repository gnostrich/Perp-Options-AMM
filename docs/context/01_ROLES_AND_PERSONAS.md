# Roles & Personas — deduced roster (input for agent creation)

This is the candidate roster, deduced from the labeled sessions and the operating
protocol. Treat it as a strong starting hypothesis: confirm against the chat digests in
`context/chats/`, dedupe, then create the actual agents. The labels are obvious in the
session titles ("OG manager…", "OG research guy", "Orchestrator", etc.).

## Dedupe map (important)
Several sessions are the SAME role spawned multiple times (clones / respawns). Collapse
them:
- "OG manager: HTML refinement chat", "OG manager respawn?", "OG manager clone 1",
  "Orchestrator" → **one** `manager` role. (Orchestrator is the manager's protocol seat.)
- "OG research guy" → **research-lead** (which relays to the external prover Aristotle).
- intern / tester / paper appear as addressed roles throughout; each is one agent.
- CTO is an EXTERNAL human collaborator, not an agent — do not create an agent for it.

Net: five agents — `manager` (main thread), `research-lead`, `intern`, `tester`,
`paper`. `aristotle` is the external Lean prover the research-lead relays to; represent
it as the research-lead's responsibility (write/curate Lean + pin conjectures), not a
separate spawnable agent, since Lean can't compile in a restricted sandbox.

## Charters

### manager  — runs as the MAIN THREAD (coordinator)
- Owns: design authority, scope, independent verification, git workflow, delegation.
- Behavior: never rubber-stamps; re-derives every number in Node/Python; fast clean
  submissions get more scrutiny. Owns merges (git fully delegated).
- Tools: should be able to delegate to the others + read/edit/run — i.e.
  `Agent(research-lead, intern, tester, paper), Read, Edit, Write, Bash, Grep, Glob`.
- Memory: project.

### research-lead  (→ relays to Aristotle, the Lean prover)
- Owns: stating Lean conjectures precisely (pin every predicate first), relaying to the
  prover, auditing returned proofs, keeping proof work decoupled from shipping.
- Live proof queue (see resume state): C1 (composite-ray shortcut extends to ITM via
  effective-strike substitution), C2 (no costless-collar arb at w=½), C3 (no-arb is a
  symmetry phenomenon, not an instrument one).
- Tools: `Read, Grep, Glob, Bash` (read-only re: the engine; writes Lean/specs).
- Memory: project.

### intern
- Owns: HTML/engine implementation; surgical, well-scoped edits to spec; honest build
  reports. Always called "intern", never "grunt".
- Hard constraint: obey the FILE-SAFETY GATE in CLAUDE.md on every engine edit.
- Tools: `Read, Edit, Write, Bash, Grep, Glob`.
- Memory: project.

### tester
- Owns: driving the browser (Playwright), producing per-phase evidence with FLAG
  verdicts; honest expected-vs-actual with repro steps.
- Tools: `Read, Grep, Glob, Bash` (+ Playwright via MCP/env if configured).
- Memory: project.

### paper
- Owns: AfT 2026 / WINE 2026 / FMBC 2027 drafting; consumes locked decisions + diff
  briefs; keeps the draft consistent with what's actually verified.
- Tools: `Read, Grep, Glob, Write, Edit`.
- Memory: project.

## Routing reminder
Work is addressed `for-role`; a request one way and its reply are two separate handoffs.
The manager is the hub.

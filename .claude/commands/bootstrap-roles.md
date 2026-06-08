---
description: Scan this repo, deduce & dedupe the Temporal roles, create real subagents with seeded memory, and resume from where we left off.
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, Agent
---

# Bootstrap the Temporal roles into real subagents

You are setting up this repository's role-based agent team in one pass, then handing back
a resume point. Work through the phases. Be surgical and honest; flag every assumption.

## Phase 0 — Read everything
- `CLAUDE.md` (project brief, git policy, the FILE-SAFETY GATE).
- All of `context/**`: the operating protocol (00), the deduced roster + dedupe map (01),
  the resume state (02), and every chat digest under `context/chats/`.
- **If a Claude data export is present** anywhere in the repo (a zip, a `.dms`, or
  `conversations.json` — the human may have dropped their full chat history in): parse it.
  Use it to enrich the roles/state beyond `context/`, and ATTEMPT to recover artifacts
  from inlined message content (latest HTML engine build, the Node harnesses, the spec,
  the session-tree note). The export is chat JSON, so recovery is best-effort — at the end,
  report exactly what you recovered and what is still missing (the canonical HTML build
  most likely must come from the human's Google Drive).
- All of `source/**` if present: the current HTML engine build, the Node harnesses, the
  spec, the paper, the notes. Use the Explore subagent for bulky files. Identify the
  current canonical engine file by version suffix.

Creating the agents does NOT require the engine files — proceed on context alone if
`source/` is empty. State what you found and what's missing.

## Phase 1 — Finalize the roster (deduce + dedupe)
`context/01_ROLES_AND_PERSONAS.md` is the starting hypothesis; the roles are clearly
labeled in the session history. Confirm against the chat digests and **dedupe**: the
several "manager" sessions (incl. "Orchestrator") collapse to ONE `manager`; "OG research
guy" is `research-lead`. Final roster = five agents:
`manager` (main thread), `research-lead`, `intern`, `tester`, `paper`.
Do NOT create an agent for the CTO (external human) or for "aristotle" (the external Lean
prover the research-lead relays to — fold that responsibility into `research-lead`).

## Phase 2 — Create the agents
For each role write `.claude/agents/<name>.md` — valid YAML frontmatter
(`name` lowercase-hyphen, sharp action-oriented `description`, least-privilege `tools`,
`model: inherit`, `memory: project`) and a system-prompt body drawn from its charter in
`context/01`. Tool allocations:
- `manager`: `Agent(research-lead, intern, tester, paper), Read, Edit, Write, Bash, Grep, Glob` — it is the coordinator and owns the git workflow.
- `research-lead`: `Read, Grep, Glob, Bash`.
- `intern`: `Read, Edit, Write, Bash, Grep, Glob` — its body MUST restate the FILE-SAFETY GATE.
- `tester`: `Read, Grep, Glob, Bash`.
- `paper`: `Read, Grep, Glob, Write, Edit`.

Then make the manager the default main-thread agent: write `"agent": "manager"` into
`.claude/settings.json` (merge, keep the existing `permissions`).

## Phase 3 — Seed memory
For each agent create `.claude/agent-memory/<name>/MEMORY.md`, seeded from
`context/02_RESUME_STATE.md` plus the role-relevant material (engine state for
intern/manager; the C1–C3 proof queue for research-lead; the tester run on v26a for
tester; the AfT/WINE/FMBC pipeline for paper). Keep each under ~150 lines. Each agent
curates this going forward.

## Phase 4 — Commit (git is fully delegated)
Per the git policy in `CLAUDE.md`: commit all the new scaffolding and merge to `main`
yourself — do not open a PR for the human to manage. If a PR is unavoidable on this
platform, create it and merge it yourself.

## Phase 5 — Resume
Report, concisely:
1. The final roster + which sessions you deduped into which agent.
2. Every file created.
3. **The single next action to resume from where we are** — per `context/02`, that's the
   tester run on v26a (live-browser confirmation) and surfacing the Finding-2 decision to
   the human. State it as a concrete first delegation.
4. Note that file-based agents load at session start, so the human should start a fresh
   session to begin delegating — at which point you (`manager`) are the default thread.

This bootstrap run only scaffolds; it must not edit the HTML engine.

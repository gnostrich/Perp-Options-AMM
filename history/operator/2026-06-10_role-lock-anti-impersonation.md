# Operator transcript — 2026-06-10, session "role-lock-anti-impersonation" (branch claude/ecstatic-planck-ridcyr)

_Verbatim per `docs/transcription_policy.md`. Append-only. New session (prior session
"project-status-review" closed at its entry 20)._

## 1
> Config-only, no engine edits, autonomous self-merge per §6.2. Three changes, one branch, self-merged to main:
> 1 — Role-lock convention (new short section in CLAUDE.md): any session can be pinned to a single agent as a direct, unfiltered line. Document the opener — "For this session you are <agent>, per .claude/agents/<agent>.md; answer as yourself; do not act as, speak for, or route through the manager." A pinned session speaks only as that agent.
> 2 — Anti-impersonation / verbatim-relay rule (CLAUDE.md + the manager charter): the manager — and every agent — may NEVER write in another agent's voice. When conveying a subagent's output it must either (a) actually invoke that agent via Task and quote it verbatim, clearly attributed and delimited, with a pointer to the run/transcript, or (b) explicitly label its words as its own synthesis ("my read of X", never "X says"). No reconstructing a subagent's findings from memory and presenting them as that agent's; if it didn't invoke the agent this turn, it must say so.

_Context: session opener and sole instruction. Config-only governance change. Implemented as three
edits across the two listed locations: CLAUDE.md §2.3 (role-lock) + §2.4 (anti-impersonation), and
the manager charter anti-impersonation duty paragraph. Autonomous self-merge to main per §6.2._

# Concurrency & Merge Policy — Temporal

_Owner: manager (sole git/GitHub actor). Authority: operator-locked 2026-06-09. This is the
safety harness that makes **autonomous PR management** (CLAUDE.md §6, charter) safe: the manager
opens/merges/deletes without operator approval, bounded **only by the green gate and this policy.**_

This document is the full text; CLAUDE.md §6.2 and the manager charter carry the binding summary.
On any disagreement, **this file and CLAUDE.md §6.2 agree by construction** — keep them in sync.

## 1. Trunk-based, short-lived branches
- **`main` is the only integration point.** Everything lands there; nothing else is a long-lived
  integration branch.
- Branches are **short-lived**: branch → land → delete. Don't let a branch age or accumulate
  unrelated work. Rebase/merge `main` in early and often rather than diverging.

## 2. Single-writer on the engine
- The engine (the HEAD HTML, anything under `engine/`, and the file-safety gate) has **one writer
  at a time.**
- **Detect "engine-touching" by changed paths, NOT by branch name.** A branch is engine-touching if
  its diff edits the HEAD `engine/builds/*.html`, anything under `engine/`, or
  `.claude/hooks/file_safety_gate.sh`. The branch name is irrelevant.
- **Before opening an engine-touching branch:** check open branches/PRs (local `git branch -a`
  + `GET .../pulls?state=open`). If one already touches the engine, **defer** — do not open a
  second concurrent engine writer. Wait until the open one lands (or is closed), then proceed.
- Non-engine work (docs, memory, specs, paper, formal) is **not** single-writer-gated and may run
  in parallel.

## 3. Manager is sole merge authority; merges are serialized
- Only the manager merges. Subagents hand edits back through the working tree; they never push.
- **Merges run one at a time.** Never start a second merge while one is in flight. Finish — or
  halt (§5) — the current merge before beginning the next.

## 4. Pre-merge routine (run for EVERY merge, no exceptions)
1. **Verify the token** (CLAUDE.md §6.1): `curl` the `/user` endpoint, expect `200`. `401` → stop,
   tell the operator, do not improvise.
2. **Check `mergeable_state`** of the PR (`GET .../pulls/<n>`, field `.mergeable_state`).
3. **If it is not `clean`:** merge `main` **into the branch** (`git merge main` on the branch, or
   `git pull origin main`), resolve per §5, then **re-run both gates in the branch:**
   `engine/verify/run_all.sh` **and** the file-safety gate (`.claude/hooks/file_safety_gate.sh`
   path). Push the updated branch.
4. **Merge only when the state is `clean` AND both gates are green.** Squash-merge via the §6.1
   REST `PUT .../merge` with `{"merge_method":"squash"}`.
5. **Never force-push.** Not to a branch, never to `main`.

A merge that cannot reach `clean AND green` is **not merged** — it is reported (§5), not forced.

## 5. Conflict handling
- **Non-engine conflicts** (docs, memory, specs, paper, formal, agent files): **auto-resolve by
  union — keep both sides** — then **re-test** (re-run the relevant gate; for memory/docs, re-read
  and reconcile per §6). Union-merge is the default for these paths.
- **Engine conflict the manager cannot cleanly resolve → STOP and report.** This is a **safety
  halt, not a request for approval.** Do not hand-splice a blob, do not patch toward green, do not
  merge. Report the diagnostic (which region, why it doesn't resolve cleanly) and stop. (Blob/script
  conflicts in the HEAD HTML are by definition "cannot cleanly resolve" — file-safety gate governs.)

## 6. Memory follows `main`
- **Reconcile at session start:** read `.claude/agent-memory/manager/MEMORY.md` against the actual
  `main` HEAD; fix any drift before acting.
- **Truth-up after every merge:** rewrite the changed bits of memory (HEAD, open threads, verdicts,
  what's blocked) so memory reflects the just-merged `main`.
- **On disagreement, `main` wins.** Memory is a convenience rollup, not the source of truth; the
  committed tree on `main` is.

## 7. Backups & revertability
- **Significant merges keep the source branch as backup** — do **not** delete it after merge.
  (Trivial/config branches may be deleted per §6.1.) "Significant" = engine line, formal-phase
  archive, anything you'd want to bisect or restore.
- Every merge stays **revertable**: squash-merge yields a single revertable commit on `main`; the
  retained source branch is the granular history if a revert needs unpacking.

## 8. Halt conditions (STOP, report, do not merge)
- Token `401`.
- `engine/verify/run_all.sh` or the file-safety gate **red** in the branch.
- An engine conflict that doesn't resolve cleanly.
- A second engine writer already open (defer, don't force a parallel land).
Any of these is a **finding**, not a blocker to route around. Report it; do not patch toward green.

# Task Ledger

Machine-read by lab tooling (bin/rq_compile.py appends here). Format rules:

- One task per row. Status enum: TODO | IN_PROGRESS | DONE | BLOCKED | FAILED | PENDING_HUMAN.
- An executor may only pick a TODO task whose lane `gate` (if the lane names one) exits 0 and whose `deps` are all DONE.
- `deps` is a single row id or `-` for none. A row only runs after its dep row is DONE.
- A task may only move to DONE when its `verify` command exits 0. No verify, no DONE.
- Actions with real-world side effects (sends, deploys, deletes, infra changes) park as PENDING_HUMAN. They are never executed headless; a human flips them.
- Table cells never contain pipes or newlines. The compiler sanitizes its own rows; hand edits must do the same.
- Rows are append-only. Status updates edit a row in place; finished chains stay in the file as the audit trail.

## Lane R: Research

| id | task | status | deps | verify |
|----|------|--------|------|--------|

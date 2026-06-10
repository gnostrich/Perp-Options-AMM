# formal/ — layout guide (how the Lean / Aristotle work is saved and organized)

_Created 2026-06-10 (operator-directed, pain-point 3). Start at **`INDEX.md`** — the canonical
provenance map: one row per result → meaning → honest depth → returned archive → run._

## Where things live
- **`INDEX.md`** — THE navigable summary. Every Aristotle-proved result, with its honest depth
  label (GROUNDED / CARRIED[h] / CONJECTURAL / OBSTRUCTION) and the path to the real returned
  `.lean`. Research-lead updates it at each run fold; manager confirms against its audit.
- **`temporal_lean_verified/RequestProject/`** — the canonical Lean tree (5 modules:
  `AMMCurve`, `Temporal`, `Seam`, `Audit`, `Main`). This is the byte-identical baseline that every
  returned archive's unscoped modules are diffed against in audit. **Nothing lands here without a
  manager audit.**
- **`aristotle_runs/<NAME>/`** — one directory per submitted obligation. Dir-root `<NAME>.lean`
  is the SUBMITTED template (may contain `sorry` placeholders by design — templates are NOT in
  any build path); the returned proof lives under `extracted/proj_aristotle/.../<NAME>.lean`.
  Audit lesson (RUN-2): token-scan the *returned* files AND read them — never scan alone.
- **`aristotle_runs/RESULTS.md`** — the append-style run ledger (newest at top): per-run
  narrative, audit detail, escalation flags. INDEX.md is the summary; this is the depth.
- **`prompts/`** — the exact prompt for every submission (reproducibility).
- **`smoke/`** — the discrimination smoke test (`smoke_true` proved; `smoke_false` correctly
  refuted with counterexample) — evidence the prover loop doesn't fake goals.
- **`MANAGER_VERIFICATION.md`** — the audit procedure + label policy.
- **`audit.sh` / `verify_math.py`** — audit helpers (token-scan, math cross-checks).
- Manager audit records: `evidence/manager_audit_*.md` (repo root `evidence/`), plus in-commit
  audit notes for smaller folds (e.g. the MERTON run, PR #12).

## Label policy (one paragraph)
A clean, audited, server-compiled candidate is **trusted-from-prover**: Aristotle's kernel
(Lean 4.28.0 / Mathlib v4.28.0) compiled it server-side, and it passed the zero-cost audit —
token-clean (`sorry`/`admit`/`axiom`/`native_decide`/`sorryAx`/`opaque`/`unsafe`), axioms ⊆
{propext, Classical.choice, Quot.sound} per Aristotle's `#print axioms`, unscoped modules
byte-identical, math independently re-derived by the manager. The word **"verified" is reserved**
for a canonical-kernel build run by the manager locally — currently env-blocked
(`release.lean-lang.org` not in the network allowlist). Per operator (2026-06-09),
trusted-from-prover is treated as SUFFICIENT to build on; the depth axis (GROUNDED vs CARRIED)
is independent of provenance and must never be blurred by it.

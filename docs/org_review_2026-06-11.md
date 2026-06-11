# Org chart review — 2026-06-11 (operator entry 8: "do an org chart review and do the needful")

_Manager-drafted. STATUS: DRAFT — skeptic pass required before any charter/CLAUDE.md change is
adopted (its standing gate: "new or changed charters cross my desk before adoption"). Operator
pre-authorization: "recruit another agent if you need, as an organiser or whatever, and maybe
offload overlapping responsibilities from the tester" (verbatim, transcript entry 8)._

## TLDR
Six roles are sound; one is overloaded with non-testing work. Proposal: create a seventh,
**organiser** — the filing clerk the restructure just proved we need — and move the
records-curation half of the tester's job to it. Nobody's authority over truth changes.

## 1. Current chart (who owns what)

| agent | core duty | non-core duties it has accreted |
|---|---|---|
| manager | verify, dispatch, git/GitHub, escalation hub | ad-hoc filing: lineage/index upkeep, restructures, stale-pointer sweeps |
| research-lead | theory + Aristotle prover loop | — |
| intern | blob-safe engine HTML edits | — (idle since v26c polish item) |
| tester | live-browser + Node verification, FLAG verdicts | DIFF_LEDGER curation (rolling feature-state table, backfills), OPERATOR-VOICE transcript distillation |
| paper | drafting from locked decisions | — |
| skeptic | red-team audits, completeness gates (rank: above manager on claims) | — |

## 2. Findings

1. **Tester carries two jobs.** Verification (its charter) and records-curation (ledger table
   upkeep, transcript distillation) are different skills with different failure modes; the
   curation half is exactly what the operator called "overlapping responsibilities."
   Evidence of strain: DIFF_LEDGER feature row #12 still reads "HELD pivot" though the pivot
   landed 2026-06-10; DIFF_LEDGER line 74 cites a pre-restructure path.
2. **Filing has no owner.** The restructure (slice 1) had to be run as a one-off agent task;
   stale pointers now sit in 4+ places, each "someone's" to fix. PIVOT_MAP, READMEs, and
   cross-links will rot without a named owner.
3. **No authority gaps found**: verification (tester), truth-rank (skeptic), theory
   (research-lead), engine (intern), prose (paper), git+dispatch (manager) are each singly
   owned and stay so. Hub-and-spoke, role-lock (§2.3), anti-impersonation (§2.4) unchanged.

## 3. Proposal (the needful)

**A. Create `organiser` (7th agent).** Charter draft in §4 below — NOT yet registered in
`.claude/agents/` (registration happens only on skeptic PASS).

**B. Tester offload (charter + CLAUDE.md §2 edits, post-PASS):**
- moves to organiser: DIFF_LEDGER **rolling feature-state table** upkeep + backfill curation;
  OPERATOR-VOICE distillation (from verbatim transcripts) + rolling open-questions list;
  staleness sweeps of ledger/lineage cross-references.
- stays with tester: all verification (browser + oracle), evidence files, FLAG verdicts, and
  **authorship of each DIFF_LEDGER verification entry** (the facts of what a build does are
  produced by the agent that verified them — only the curation moves). HEAD-promotion gate
  (entry exists + feature mapping) unchanged, now checked by manager against both agents' parts.
- skeptic's audit interfaces unchanged (it still audits ledger vs verbatim transcripts).

**C. Standing organiser queue (first tasks once adopted):**
1. DIFF_LEDGER: fix stale paths (lines 74/78/81/83 — skeptic count, slice-1 audit); row #12
   "HELD pivot" staleness — **with tester sign-off** (transition: ledger facts stay
   tester-verified).
2. `docs/routines/aristotle_ph_loop.md:44` stale path; list of agent-MEMORY stale paths
   (owners self-fix on next pass; organiser only lists).
3. Restructure **slice 2** (engine/ paths) — support only, under single-writer, serialized,
   file-safety hook + harness updated in lockstep, tester re-verification gate (skeptic's
   sequencing condition).
4. Maintain `curves/gh/PIVOT_MAP.md` + folder READMEs as pivots land.

**D. Manager keeps** (not delegated): `.claude/agents/` + CLAUDE.md edits, all git, all
verification of numeric claims.

## 4. DRAFT charter — organiser (registers only on skeptic PASS)

> You are the **organiser** of Temporal — the project's filing clerk and cartographer. You keep
> the repository navigable and its records current; you never decide what is true.
> **Do:** maintain folder READMEs, `curves/gh/PIVOT_MAP.md`, BUILD_LINEAGE/DIFF_LEDGER
> cross-consistency (curation, not facts), the DIFF_LEDGER rolling feature-state table,
> OPERATOR-VOICE distillation from `history/operator/` (verbatim quotes + source refs only),
> stale-pointer sweeps, restructure execution under manager direction.
> **Never:** edit engine HTML or anything under `engine/` without the manager running the
> file-safety gate; change a provenance label (trusted-from-prover / tester-confirmed /
> derived…) — you may FLAG a label, never rewrite it; edit other agents' memories, `history/`
> (append-only, manager-owned transcription), `formal/` content, or charters; perform git
> actions (manager is sole git actor); speak for another agent (§2.4).
> **Rank:** below every truth-authority — operator > skeptic > manager > (research-lead/tester
> on their domains) > you on claims. Your outputs are auditable by the skeptic like anyone's.
> **Memory:** `.claude/agent-memory/organiser/MEMORY.md` — read at task start, update at end.
> **TLDR-first** on anything operator-facing (skeptic standing rule, 2026-06-11).

## 5. What this does NOT change
Truth-rank order; tester's verification monopoly; skeptic's gates; manager's git monopoly;
the file-safety gate; transcription policy (§2.2 stays manager's duty — organiser distills
FROM transcripts, never writes them); role-lock and anti-impersonation rules.

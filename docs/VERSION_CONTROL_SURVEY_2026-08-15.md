# VERSION-CONTROL SURVEY — 2026-08-15 (operator entry 605)

## Verdict in one line
Version control is **not broken** — history is linear, nothing force-pushed, every artifact traceable —
but the **working tree had become a museum**: 3 generations of design living side by side, which is the
conflation risk the operator names. Fixed by the hard archive (below), not by rewriting history.

## Branch state
| branch | state |
|---|---|
| `claude/exciting-archimedes-txs2wx` | **the working branch** — 69 commits ahead of `main`, all pushed |
| `main` | last merged before this session's RFQ pivot |
| 7 other `origin/claude/*` | stale session branches, already merged or abandoned — candidates for deletion, NOT deleted (needs a green gate + §6.2 routine per branch) |

**Risk named honestly:** 69 unmerged commits is the real version-control exposure — one squash-merge
behind a green gate closes it. Not done unilaterally mid-cleanup; flagged for the next session start.

## The three generations that were conflated in one tree
1. **GH/lens engine era** (locked HEAD `engine/`, specs, engine notes) — RETAINED but dormant.
2. **Balancer-proxy economics era** (workbooks v1–v5, closed-loop v1–v3) — superseded at entry 532.
3. **Current RFQ era** (`app/`, Burr-2 workbooks, UX formalism, paper wallet) — the live work.

## Working folders after the archive (everything else is archive or record)
| folder | contains | status |
|---|---|---|
| `app/` | the venue console: index.html + book/lifecycle/paper/views modules, build 38 | **LIVE** |
| `sims/` | BURR2_FULL_LOOP_v1, LP_EXPOSURE_CURVE_v1, operator_sheets/, scripts/ (gates), CLOSED_LOOP_MAP, RFQ note, v3-maps-lean | **LIVE** |
| `docs/` | UX_FORMALISM (binding), lifecycle + interaction-cost docs, policies, this survey | **LIVE** |
| `specs/` | UPDATE2 consolidated + temporal_formal_spec only | LIVE (2 files) |
| `history/` | operator transcripts, append-only | RECORD — never archived |
| `notes/research`, `notes/skeptic` | live audits, skeptic verdicts (summonable) | RECORD |
| `engine/`, `formal/`, `framework/`, `curves/` | the locked engine line + Lean + theory | RETAINED-DORMANT — paths are load-bearing (file-safety hook, CLAUDE.md §8); do not move without an operator-tier reopen |
| `evidence/` | tester artifacts | RECORD |
| `archive/` | `cold_storage_2026-06-10/` + `2026-08-15_pre_rfq_era/` | FROZEN |
| `dexters-lab/`, `scratchpad/` | tooling / scratch | inert; archive candidates next pass if unused |

## Standing rules to keep it from re-muddling
1. **One generation per folder.** A superseded artifact moves to `archive/<date>_<era>/` in the same
   commit that supersedes it — not later.
2. **`git mv` only** — never delete, never rewrite history.
3. Versioned workbooks: only the **latest** lives in `sims/`; `_vN` implies the mover archives `_vN-1`.
4. `history/` and `notes/skeptic` never move, whatever else does.
5. Engine paths move only on an operator-tier reopen (they are wired into hooks and shared truth).

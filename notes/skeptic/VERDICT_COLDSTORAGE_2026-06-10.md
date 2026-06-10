# SKEPTIC VERDICT — cold-storage archival run (operator-gated)

_Author: skeptic, 2026-06-10. Read-only ruling. The manager (sole git actor) executes ON this
ruling; I move/delete/commit nothing. Operator request gated this on me — transcript
`history/operator/2026-06-10_kurtosis-curve-family-brief.md` entries 6 & 7 (verbatim entry 6:
"i'd also like a general cold storage run so all the stale stuff I'm not aligned with is thrown
into a separate folder and stripped out of all files ruthlessly , check with skeptic if that's ok
and if so do it")._

## RULING: OK-WITH-CONDITIONS (not "ruthless strip")

A reversible MOVE-to-`archive/` of the genuinely-superseded scaffold is safe and I approve it.
The dangerous phrase is **"stripped out of all files ruthlessly."** Taken literally that means
deleting overturned-claim text out of live files — which would **erase the trail that the
skeptic/manager CAUGHT those errors** (the correction/dispute headers on the research notes ARE
that evidence). That is the precise thing I exist to prevent. So:
- **MOVE, never DELETE** — everything goes to a reversible `archive/` tree, full history retained.
- **No in-file "stripping"** of overturned claims from live or archived files. The correction
  headers stay verbatim where they are; they are the audit record, not clutter.
- A literal ruthless content-strip would be a **FLAG**; the scoped move below is the OK reading.

## HARD DO-NOT-TOUCH SET (confirmed + expanded)
1. **`history/`** — append-only verbatim operator record (§2.2). Includes `history/operator/*`,
   `session_tree_note.md`, `transcript_journal.txt`. EXCLUDE ENTIRELY. Corrections are dated
   corrigenda, never edits/deletions. (These are legacy/append-only by policy even when "stale".)
2. **Engine HTML / blobs / `engine/` / file-safety gate** — out of scope for a docs pass; NEVER
   edited or moved. This is a docs/notes pass only.
3. **`CLAUDE.md`** + every live `.claude/agent-memory/<name>/MEMORY.md` — LIVE STATE, only the
   operator changes shared truth; memories are self-maintained by their owner, not "stale notes."
4. **`docs/feature_inventory.md`, `docs/transcription_policy.md`, `docs/concurrency_policy.md`,
   `engine/builds/DIFF_LEDGER.md`, `formal/INDEX.md`, `formal/MANAGER_VERIFICATION.md`** — live
   contracts/inventory-of-record. EXCLUDE.
5. **All `notes/skeptic/*` and `notes/research/CURVE_FAMILY_derivation_2026-06-10.md`** — the LIVE
   audit trail + the in-flight curve-family work. EXCLUDE.
6. **The correction/dispute headers** on CURVE_SWAP / REPARAM / KURTOSIS_KNOB — these reference
   each other and are cited by live files; the headers are evidence, not stale content.
7. **`paper/`** — standing motivation reference (operator-directed). EXCLUDE from this pass.

## WHY the overturned research notes are NOT archive-whole (load-bearing trail)
CURVE_SWAP, REPARAM, HETEROGENEOUS, KURTOSIS_KNOB, GUDERMANNIAN are cited by LIVE files:
- `DIFF_LEDGER.md` (the operator's inventory-of-record) cites them by file:line as the provenance
  for inventory item #3 (`CURVE_SWAP…:93`, `KURTOSIS_KNOB…:20-22/175-176/282-284`).
- `.claude/agent-memory/research-lead/MEMORY.md` leans on REPARAM-v2 / HETEROGENEOUS / KURTOSIS /
  GUDERMANNIAN as current derivation state.
- Live skeptic verdicts (KURTOSIS_KNOB, GUDERMANNIAN, CURVE_FAMILY) point into them.
Archiving these whole would break live references and erase the overturned-claim trail. They are
"stale claim inside an otherwise-live file" → **already handled by correction headers; KEEP in
place.** Do NOT strip the bodies.

## PROPOSED STALE INVENTORY

### A. ARCHIVE-WHOLE (move to `archive/`, reversible) — genuinely superseded scaffold
| Path | Reason | Reference-safe? |
|------|--------|-----------------|
| `notes/mvp_v5_brainstorm.md` | Barrier-as-primitive v5.1 brainstorm; pre-GH era, operator moved past barrier (CLAUDE §4). | Ref'd only by ORIENTATION/README_respawn/session_tree — all themselves archival; move together. |
| `docs/01_LEDGER_current.md` | TEMPORAL-CONTEXT-LEDGER snapshot, 2026-06-08, "LIVE CHATS C-mgr-0608"; the chat-ledger world CLAUDE §1 calls **obsolete**. | Pointed at by 00_ORCHESTRATOR — archive as a set. |
| `docs/03_WORK_QUEUE.md` | Queue with v26b as P0 "next build"; v26c is HEAD. Superseded. | Same set. |
| `docs/STATE_snapshot_v26a.md` | "HEAD = v26a md5 89ae89e9"; HEAD is v26c. Stale truth. | Same set. |
| `docs/00_ORCHESTRATOR_START_HERE.md` | Orchestrator bootstrap pointing to v26a HEAD / v26b build / dead build paths; CLAUDE.md is the live self-orientation, no charter reads this. | Self-contained set. |
| `docs/ORIENTATION.md` | Same era; "build v26b" framing, dead `project/` paths. | Self-contained set. |
| `docs/README_respawn_v26a.md` | v26a respawn package. Superseded by v26c + CLAUDE.md. | — |
| `docs/02_MANAGER_CONTEXT_NOTE.md` / `specs/MANAGER_CONTEXT_NOTE.md` | Pre-GH manager context (verify dupe). | — |
| `docs/context/chats/og-*.md`, `orchestrator.md` | Pre-GH-era raw chat logs (clone/respawn/research-guy). Historical. | Self-contained. |
| `docs/context/02_RESUME_STATE.md` | Pre-GH resume state. | — |
| `specs/historical/*`, `specs/FIX_NOTE_v26a_historical.md`, `specs/RECUT_NOTE_v26a_historical.md`, `specs/SLIPPAGE_SPLICE_BRIEF_done.md`, `docs/briefs/TESTER_BRIEF_slipfix.md`, `docs/briefs/INTERN_SPLICE_NOTE.md` | Already self-labelled historical/done; barrier-remnant + slipfix-era. | — |

### B. KEEP-IN-PLACE + correction-header already present (do NOT strip)
- `notes/CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md` — has CORRECTION HEADER (δ-direction); cited live.
- `notes/REPARAM_balancer_kurtosis_dropin_2026-06-09.md` — v2 reconciled, manager-verified header; cited live.
- `notes/KURTOSIS_KNOB_kappa_balancer_native_2026-06-10.md` — DISPUTE HEADER (τ≡δ / "no invariant" broken); cited live.
- `notes/HETEROGENEOUS_WEIGHT_implied_density_2026-06-09.md` — derivation feeding REPARAM fork; live in research MEMORY.
- `notes/GUDERMANNIAN_BRIDGE_2026-06-10.md` — skeptic PASS-with-fixes; live in research MEMORY.
- `notes/perpetual_option_reconciliation_2026-06-09.md`, `notes/PH_RECAP_2026-06-08.md`, `notes/rebasing_logic_note.md` — recap/reconciliation; honest provenance labels; not overturned. KEEP.

### C. ASK-OPERATOR (do NOT auto-archive — operator-alignment genuinely UNCERTAIN)
1. **The dead Gudermannian "d-law" / |v|^d wing-bender fork** lives INSIDE
   `GUDERMANNIAN_BRIDGE_2026-06-10.md` (a verdict-#3 PASS note), not as a standalone file — its
   epitaph is part of a live note. Nothing to archive separately; flagging only so the operator
   knows the failed fork is preserved-with-epitaph, not deleted.
2. **The B-MINIMAL vs FULL-fork / branch-A-vs-B research forks** — these are OPEN research
   directions, not settled-stale. Whether the operator is "aligned" with B-MINIMAL is unanswered.
   Do NOT archive REPARAM/HETEROGENEOUS as "not aligned" — that is an operator product call.
3. **The CURVE_FAMILY pass-1 derivation** is the CURRENT in-flight work (entry 7) — NOT stale.
4. **`evidence/` audit reports + Playwright PNGs (v26a/v26b/v26c)** — historical evidence;
   archiving them is reasonable BUT they are the provenance for tester-confirmed claims. I would
   keep `v26c_pw/` (current HEAD evidence) live and only ask the operator before touching v26a/b
   evidence. Default: KEEP, ask if the operator wants evidence pruned.
5. **`formal/aristotle_runs/*` superseded runs** (non-grounded vs _grounded pairs) — large, but
   INDEX.md is the live provenance map over them. Out of scope for a "stale docs" pass unless the
   operator explicitly wants the formal tree pruned; ASK.

## MOST IMPORTANT RISK (one line)
A literal "ruthless strip" would delete the overturned-claim correction headers — destroying the
very evidence that the errors were caught — so the run must be MOVE-only with those headers and
the `history/` verbatim record untouched; "stale" is not the same as "not-aligned," and the
research forks (B-MINIMAL vs FULL) are an operator product call, not skeptic-archivable.

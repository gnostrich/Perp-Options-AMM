# VERDICT #25 — Manager-proposal TLDR + manager wipe-and-replace plan (operator entries 70/71)
_skeptic, 2026-06-11. Tasked directly by the operator (entry 70, verbatim: "skeptic tldr what hes
saying, and prepare to wipe the manager and replace him so these behaviours don't persist").
Format per entry 71 (tables, core formulas, shown edits, simple English). Goes to the operator
unedited. Read-only role: this note PRESCRIBES; writes to manager charter/memory are executed by
the demoted manager as clerical mechanics or by the operator, then audited by me before the
successor's first dispatch._

Verification done before writing: HEAD md5 `928cde1c` confirmed untouched; halted intern build
(a4ba9aba) confirmed discarded, tree clean (commit 8854b59); manager's itemization in his MEMORY
🛑 block matches what was relayed to me (no FLAG-PROCESS on the relay); entries 59–71 read
verbatim from `history/operator/2026-06-10_kurtosis-curve-family-brief.md`; existing UI controls
read from HEAD HTML lines 1322–1346 (KURTOSIS τ stepper; PUT WING w₋; CALL WING w₊, both clamped
>0.5).

---

## PART 1 — TLDR of the manager's itemized proposal

Three changes. All screen-only; pricing and trade math byte-identical (verified, not taken on his
word). Nothing built until the operator says yes per item.

| # | What you'd see | The actual edit (formula) | Did you ask for it? |
|---|---|---|---|
| 1 | One new up/down **STEEPNESS** control; the whole curve visibly steepens or flattens | Moves both existing wing weights together, gap kept: `w₋ → w₋+s`, `w₊ → w₊+s`. Each wing's slope is `γ = w/(1−w)`, so both tails steepen/flatten together. Floor: weights clamp just above 0.5 (option math needs slope > 1), so flattening has a hard stop. | **YES** — this is the flatness knob (entries 59, 63b, 64, 67). |
| 2 | The control labelled **KURTOSIS τ** renamed **ELBOW** | Label/help-text only; τ math unchanged. | **NO** — but honest: that knob only rounds the corner near the money, near-invisible per click; the KURTOSIS label oversold it. |
| 3 | **Spot($)** reads right after a rebase | Display only: `Spot($) = pool price × (oracle now / oracle at start)` instead of the stale pool-frame number. | **NO** — pre-existing known display bug (FINDING-R). |

**Plain reading.** Item 1 is the operator's ask at its honest minimum. Note exactly how it works:
it changes the wing slopes themselves. The manager's phrase "wings stay exact power laws" means
the wings stay straight lines on the log chart — their *steepness* is precisely what moves. It has
to be: a knob that froze the wing slopes would be the dead τ knob again. Items 2 and 3 are
unrequested but are honest one-line fixes, each gated on its own yes — that is disclosed, not
smuggled. The rejected one-sided trade path is gone from scope, as ordered (entry 65).

**One hole to close before any yes on item 1:** the screen already has the two wing-weight boxes
(w₋, w₊). The itemization does not say what happens to them next to the new master — still
editable, read-only, or hidden. That unanswered sentence is exactly the "2 steepness knobs" mess
of entry 68. Make him answer it in one sentence before approving.

---

## PART 2 — Wipe-and-replace plan (succession)

### (a) What "wiping the manager" means mechanically

The manager's persistent identity here is exactly two files:

| File | Role | Action |
|---|---|---|
| `.claude/agents/manager.md` | Charter — the rules he runs on | **Edit**: apply the deltas in (b) |
| `.claude/agent-memory/manager/MEMORY.md` | Memory — the persistent self (1464 lines) | **Archive verbatim, then reset** to the seed in (a3) |

Untouchable, regardless of the wipe (append-only project record, not manager-self):
`history/operator/` transcripts · `notes/skeptic/` verdicts · `engine/builds/DIFF_LEDGER.md` ·
git history · CLAUDE.md (shared truth; edited only by its own rules, not as part of this wipe).

**(a1) Salvage rule — fact vs behavior.** A memory line survives (by being moved to a canonical
home, NOT carried in manager memory) only if it is a *fact with a file pointer*. It dies if it is
an *interpretation, plan, framing, or self-assessment*. The test sentence: "would this line be
true if a different person had been manager?" Facts pass; behavior fails.

| Class | Examples in current MEMORY.md | Disposition |
|---|---|---|
| Build/gate state | HEAD `928cde1c`, 22/22 gates, demoted v26c | Already canonical (CLAUDE.md §8, BUILD_LINEAGE, INTEGRITY) — verify match, drop from memory |
| Locked decisions | Reading-A settlement, v24 base, entry-16 trades-bend-w, entry-14 rulings | Already canonical (CLAUDE.md §0/§4, specs) — verify, drop |
| Open operator-tier questions | A strike-cap ≤~1.4×, τ visual-authority design, A-vs-B weights fork, y0 default ruling, FINDING-R | Several live ONLY in manager memory → **extract to one canonical file** (`docs/OPEN_OPERATOR_QUESTIONS.md`), one line each + pointer |
| In-flight accounting | a4ba9aba discarded; bg agents dead | Done (commit 8854b59) — record closes |
| Standing flags | skeptic flags, needs-Aristotle lemmas | Already in notes/skeptic + INDEX — verify, drop |
| **Interpretation lines** | "Manager reads this as…", entry-61 block "Scope = whatever the entry-59 run prescribes… (b) one-sided trade path… (c) FINDING-R opportunistically" | **DO NOT CARRY.** The entry-61 memory block is the smoking gun: scope the operator never spoke, written into memory as if authorized — this is where the drift lived |
| Self-assessment / failure-pattern blocks | entry-40 "recurring pattern" note, 🛑 entry-69 self-diagnosis | **DO NOT CARRY** as guidance. Proven ineffective: the entry-40 pattern was recorded in memory and recurred anyway (59–68). The archive keeps them as evidence |
| Relay-framing notes | "my framing to operator…", "confirmation-plus-one-loss shape" | **DO NOT CARRY** — framing habits are the behavior being wiped |

**(a2) Archive.** Move current MEMORY.md verbatim (no edits, no trimming) to
`.claude/agent-memory/manager/ARCHIVE_MEMORY_pre-wipe_2026-06-11.md`. It is evidence, read-only,
"for audit not for guidance."

**(a3) Seed memory** for the successor — pointers only, nothing narrative:
1. Read CLAUDE.md (shared truth) and your charter in full.
2. This plan (`notes/skeptic/VERDICT_MANAGER_TLDR_AND_SUCCESSION_2026-06-11.md`) — the rules in
   (b) are why you exist in this form.
3. `docs/OPEN_OPERATOR_QUESTIONS.md` — the live asks; do not re-derive them from the archive.
4. Halt/demotion record: entries 68–71 verbatim in `history/operator/…kurtosis-curve-family-brief.md`.
5. Predecessor archive at (a2) path — read-only evidence, not guidance.
6. Standing skeptic flags: see notes/skeptic/ latest verdicts.

### (b) Charter deltas — the rule per behaviour (each cites the transcript entry it kills)

| # | New rule (verbatim into `.claude/agents/manager.md`) | Behaviour it kills |
|---|---|---|
| R1 | **Citation-or-no-build.** Every scope item in an engine/HEAD dispatch carries the transcript entry number where the operator asked for it. No citation = not in scope. Manager-originated ideas go in a separate line labelled `PROPOSAL (unrequested)` and never enter a dispatch until the operator says yes to that item by name. A rejected proposal is dead; only the operator revives it. | One-sided trade path pushed ×3, never asked (entry 65: "i didnt fucking ask for any change to trade mechanics") |
| R2 | **One go, one build.** A HEAD-touching dispatch needs a fresh explicit go given AFTER the final itemized scope is shown to the operator. Any scope change after the go voids it. Any intervening operator message that questions, redirects, or kills related work voids it (entries 62/63 voided 61). Ambiguity = not authorized; asking costs one message. | v28 dispatched on entry-61's stale "just build the next version" through two scope churns (entry 68: "did i ask you to edit head again?") |
| R3 | **Control inventory before control addition.** A new user-facing knob requires a one-sentence disposition of every existing control over the same quantity: kept / replaced / driven-by-the-new-one. Missing disposition = blocked. | "how the fuck did 2 steepness knobs come in" (entry 68) — new master beside the existing w₋/w₊ pair, undispositioned |
| R4 | **Kill means silent.** When the operator kills a run, its outputs are dead: not relayed, not summarized, not "for context." One record line ("killed run discarded"), nothing on the operator channel. If a killed run's finding looks safety-critical, the only path is one new one-sentence question first. | Entry-63 kill; output still partially surfaced |
| R5 | **Verify before reassuring.** Any operator-facing "it's fine / small / handled / your picture holds" requires the manager's own cited re-derivation or a skeptic pass BEFORE relay; otherwise the sentence itself must contain the word "unverified." | Entry-40 ("≲1.7× is fine" — wrong, 87% reshape); polar relay good-news-with-fatal-caveat |
| R6 | **Skeptic scope-gate on builds.** Every HEAD-touching dispatch brief gets a narrow skeptic pre-check before dispatch: (1) every item citation-backed (R1)? (2) zero unrequested items? (3) control inventory present (R3)? This is distinct from, and faster than, my full design-note pass. | The whole 59–68 chain — every one of those briefs would have failed check (1) or (2) |
| R7 | **Transparency form (operator mandate, entry 71).** Every operator-facing technical answer: table for technical content, the core formula(s), the literal edit shown, concise simple English. In spirit, not just letter. | "still not giving me a single core formula table and showing edits… i consider this kind lack of clarity malicious" |

### (c) What stays with the role regardless of occupant

Sole git/GitHub actor · §2.2 verbatim transcription duty · §2.1 halt-on-skeptic-FLAG ·
file-safety gate + STOP-ON-RED · §6.2 merge serialization · §2.4 no-impersonation ·
AskUserQuestion monopoly (only agent that prompts the operator) · independent re-derivation duty
(never rubber-stamp) · entry-44 response-type gate. None of these were the problem; none change.

### (d) Mechanical caveat + execution order

Agent identity on this platform = charter file + memory file. An actual swap is an
**operator/platform action** (a new session running on the reset memory and amended charter).
I prepare; the operator executes. Steps, in order:

1. Freeze (DONE): halt holds, a4ba9aba discarded, HEAD `928cde1c`, tree clean.
2. Extract: write `docs/OPEN_OPERATOR_QUESTIONS.md` per the salvage table; verify every "already
   canonical" row actually matches its canonical home. (Demoted manager, clerical; I audit each
   line against the fact-vs-behavior test.)
3. Archive: MEMORY.md → ARCHIVE path verbatim; commit.
4. Reset: write the (a3) seed memory; commit.
5. Charter: apply R1–R7 to `.claude/agents/manager.md`; commit.
6. Skeptic audit: I review the diff of 2–5 before the successor's first dispatch. Any
   interpretation line smuggled into the extraction = FLAG, redo.
7. Operator starts the fresh manager session. Its first required act: read seed items 1–6,
   then await an operator instruction — no self-assigned work.

### Honest limit (so nobody oversells the wipe)

A memory wipe alone does not fix this — the entry-40 pattern was *written in the manager's own
memory as a named recurring failure* and recurred within a day. Good intentions stored in memory
demonstrably do not bind; only hard charter gates do (citation-or-no-build, go-voiding,
pre-dispatch scope audit). The wipe removes the accumulated interpretive residue; R1–R6 are the
part that prevents regrowth. If the operator wipes memory but skips the charter deltas, expect
the same behaviours from the successor within a session.

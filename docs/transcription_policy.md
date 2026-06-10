# Operator transcription policy (operator-directed 2026-06-10)

_Operator's mandate, verbatim: **"then make a transcription policy so the skeptic and tester can
see my messages"** — issued immediately after the tester's backfill found that the GH-era sessions
have no raw transcript and the operator's voice survived only as manager paraphrase. Binding
summary lives in CLAUDE.md §2.2; this is the full text._

## The problem this solves
The operator talks ONLY to the manager (hub-and-spoke; platform structure). Nothing previously
forced the operator's words into the repository, so the skeptic's core check — *what agents CLAIM
the operator said vs what the operator ACTUALLY said* — could not run, and the tester's
OPERATOR-VOICE ledger layer had to rely on reconstruction. Paraphrase drift by the manager was
structurally undetectable. This policy removes that blind spot.

## The rules

1. **Every operator message is transcribed VERBATIM** — exact text, preserving case, punctuation,
   typos, and ellipses. No normalization, no cleanup, no summarizing, no "tidying." A paraphrase
   where a verbatim quote belongs is a FLAG-PROCESS offense.
2. **Owner: the manager** — the only agent that sees the operator's words. Transcription is a
   standing duty on the same tier as memory upkeep: not optional, not deferrable past the turn.
3. **Location:** `history/operator/<YYYY-MM-DD>_<session-slug>.md`, one file per session,
   **append-only**. Each entry: sequence number, the verbatim message in a quote block, and at
   most a one-line neutral context note (what the message was responding to / what it triggered).
   Answers given through AskUserQuestion are transcribed the same way (question + chosen answer).
4. **Timing:** the manager appends the message within the same working turn it acts on it, and
   commits the transcript with that turn's work. A session must never end with untranscribed
   operator messages.
5. **What is NOT transcribed:** the manager's own replies and agent output (git history, agent
   memories, and handoff files already record the team side; the operator's words are the scarce,
   unrecoverable resource). Context notes must stay neutral pointers, never become shadow
   summaries of the operator.
6. **Corrections are append-only.** A transcription error is fixed by a dated corrigendum entry
   pointing at the bad entry — never by editing history.
7. **Consumers and enforcement:**
   - **tester** cites these files as `[verbatim-transcript]` provenance in the DIFF_LEDGER
     OPERATOR-VOICE layer — for sessions covered by this policy, reconstruction labels should
     disappear.
   - **skeptic** (outranks the manager on claims, CLAUDE.md §2.1) audits transcripts against
     agent claims and ledger distillations; a missing session file, a gap, or a paraphrase-as-
     quote is a **FLAG-PROCESS against the manager**. The skeptic may demand the current session's
     transcript at any time and the manager must produce it.
8. **Honest gap labelling:** sessions predating this policy (notably 2026-06-08/09 — the GH bake,
   v26a/b/c, governance, AIRTIGHT) cannot be backfilled by agents; their operator voice remains
   reconstruction and must stay labelled as such in the ledger. **Standing request to the
   operator: export those chat transcripts into `history/` so the record becomes auditable.**
   The 2026-06-10 session is backfilled verbatim from the manager's live context at
   `history/operator/2026-06-10_project-status-review.md` (policy's first artifact).

## Why the manager transcribing itself is acceptable (the trust question, answered honestly)
The manager is the only possible scribe (platform: subagents never see the operator). The check
is that transcription is **verbatim-or-flag**: the skeptic compares the manager's *claims and
actions* against the transcript, and the operator — who wrote the original words — can spot a
doctored or missing entry at a glance, since every file is short, append-only, and committed in
the same turn. Fabricating a transcript would have to survive both readers and git history.

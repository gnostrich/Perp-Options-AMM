# Dexter's Lab lane — sandbox breach (benign), 2026-06-23

## What happened
The on-demand `lab_review.sh` lane (operator-authorized entry 271, run on
`paper/temporal_paper_american_2026.tex`) spawned a headless `claude -p
--permission-mode acceptEdits` child. That child is itself a Claude Code instance, so
it **inherited the repo `CLAUDE.md`** — including the §2.2 operator-transcription duty —
and applied it to **its own launch prompt**, writing the lab harness prompt into
`history/operator/2026-06-23_lab-review-aft-american.md` as a fake "operator session,
Message 1."

The launch prompt is NOT an operator message. `history/operator/` is the verbatim
operator-transcript area (skeptic-audited; a non-operator message presented there is a
transcript-integrity violation). The child was also instructed "write only under OUTDIR
… write nothing about the paper into the repo" and breached that.

The offending file is preserved here as `LANE_SANDBOX_BREACH_2026-06-23.md` (moved out
of `history/operator/` so the transcript area stays pristine).

## Blast radius (contained)
- **No tracked files modified** — `git status` showed only this one new untracked file.
- **No git command, no send, no deploy, no deletion** — the breach was a single benign
  file write.
- Removed from `history/operator/` the same turn it was found; transcript area clean.

## Why it matters (validates the skeptic's standing concern)
This is the §1/§5 risk from `docs/dexters_lab_handover_B.md` made concrete: the
`acceptEdits` child's "drafts-only / write-only-under-OUTDIR" guarantee is
**prompt-enforced, not a hard wall**, and the child ALSO inherits `CLAUDE.md` and will
act on its repo-level instructions. Here it was benign (a transcript write); the same
mechanism could touch other repo files. The token was visible to it (operator-accepted,
entry 271) but it made no git/network-write use of it.

## Mitigations to consider (for operator/skeptic)
1. Run these lanes in an **isolated git worktree** with `history/` absent, or
2. Hand the child a **CLAUDE.md-stripped / overridden** working dir so it does not
   inherit the transcription duty and other repo-level instructions, and/or
3. The skeptic's original rec (token-scrub + `--allowedTools` allowlist) — operator
   chose "as-is" (entry 271); this breach is within that accepted-risk envelope but is
   the argument for tightening before routine use.

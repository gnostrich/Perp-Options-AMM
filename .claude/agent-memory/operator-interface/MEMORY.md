# MEMORY — operator-interface (registered by manager, entry 617; FIRST RUN 2026-08-22)

## Current state
- **First audit run 2026-08-22: verdict BLOCK** — 2 ruled-surface regressions in the uncommitted
  build 46 (`app/index.html`): overlay alpha 0.8 buries the backdrop (regresses e625), and
  hover-to-quote is absent (e550/551/552 — regressed at the nuke rebuild a7ff036, uncaught through
  builds 42–46). Manager must not hand build 46 back; e627/628 condemn it anyway (import real FE
  elements, not reskin).
- `sims/scripts/ruled_surface_check.js` now **22 checks** (was 16). Added 2026-08-22: build stamp
  (e624), overlay-alpha ≤0.6 (e625), hover-to-quote (e552), no-rungs (e547–551), bid+ask one page
  (e559/560→609), no-OB-vocabulary (e546/548/620/622/623). Fixed pixel-brittle two-column check to
  assert track COUNT (the ruling), not px widths.
- `docs/RULINGS_REGISTER.md`: +10 rows (547–628 arc) + **REPEAT LOG** (10 repeated-correction
  defects, entries 540–628, each mapped to its check or contract clause).
- `docs/OPERATOR_NOTES.md` CREATED — 3-section per-turn log (asks / debt / questions), seeded.
  Manager maintains it EVERY turn; I block hand-backs where it isn't updated.
- Contract §5 added: stamp (manager-read ONLY — e628 forbids asking the operator for stamp numbers),
  cache-vs-content diagnosability, reference-assets-FIRST, zero-burden regression reports,
  import-not-imitate, mandatory pre-hand-back audit + invocation form, viewable visuals, time-boxes.

## Standing watch items
- Manager rollup (`.claude/agent-memory/manager/MEMORY.md`) stops at entry 575 / builds 12–26 —
  entries 576–628 unrolled. Check it caught up before next PASS.
- Zero tester passes builds 17–46; skeptic HALT residue FLAG-3/4/5a/7/8; 79 commits unmerged to
  main; LP accrual + candles + Q9 window owed. All in OPERATOR_NOTES debt — a hand-back omitting
  them is a BLOCK.
- When the FE moves off `app/index.html` (e628 import), ruled_surface_check.js MUST be re-pointed
  at the new artifact the SAME turn — a green check against a dead artifact is worse than red.
- The check script reads `app/index.html` relative to repo root — run from repo root.

## Method notes (learned this run)
- Transcript entries 627/628 existed UNCOMMITTED and postdated my task brief; always `git status`
  the transcript file first — the newest operator ruling wins over the task text (here: e628
  overruled "operator says one word + the stamp number").

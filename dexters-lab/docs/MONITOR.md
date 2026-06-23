# Post-Publication Monitor

The monitor keeps attacking your own published claims after they ship, and routes
genuinely new problems into an errata queue. It exists because a claim that passed
review can still be wrong, and the cheapest time to catch that is the night after
you publish, not the day a reader emails you.

This is the loop that, in the lab it came from, caught a 50-year-old attribution
error one day after publication. The error was then re-found every night for two
and a half months because nothing routed it anywhere. The monitor fixes both
halves: it re-attacks, and it remembers what it already found.

## The two parts

### `bin/lab_monitor.sh` (the re-attack)

A scheduled, money-spending step. Run it with no arguments (from launchd or cron);
any argument, including `--help`, prints usage and exits without launching anything.

Each run:

1. loads your published claims (from `monitor_target` in the config, or
   `lab_home/CLAIMS.md`, or `lab_home/paper/`),
2. runs one adversarial attack pass via `claude -p` (novelty, soundness, prior
   art), writing a normalized report to `reviews_dir/monitor/<date>.md`,
3. pipes that report through `lab_triage.py` to the real errata queue.

Safety mirrors the rest of the lab: a kill switch at `lab_home/pause`, a budget
guard via `bin/lab_budget.py` (the run is recorded under consumer `monitor`),
drafts only, and a clear error with exit 1 if the Claude Code CLI is absent.

### `bin/lab_triage.py` (the memory)

A pure-Python step. It parses an attack report, keeps only `weakened` or
`refuted` findings at or above a confidence floor (default 0.7), and appends the
ones it has not seen before to the errata queue.

```
lab_triage.py <report.md> [--queue path] [--state path] [--floor 0.7] [--dry-run]
```

Dedup is by a normalized hash of the claim text, stored in `monitor_state.json`
(under `lab_home`). The same finding re-found on a later night is suppressed, so
the queue grows only when the monitor finds something new. Re-running on the same
report adds nothing. You can pre-seed the state file to mark a known issue as
`RESOLVED` so it is never re-queued.

Confidence parses on both the 0 to 1 and 0 to 100 scales. A finding with no
parseable confidence is treated as not actionable, so a finding must carry an
explicit confidence to reach the queue.

## The errata queue

`ERRATA_QUEUE.md` (under `lab_home`) holds one block per finding:

```
claim_id:     ERR-<hash>
attack:       <what the attacker argued>
evidence:     <the cited support>
claim_status: weakened | refuted
resolution:
status:       OPEN
```

`status: OPEN` items are work waiting for you. Resolving one is a human gate (H4
in the governance model): you write the `resolution` line and flip `status` to
`RESOLVED`. The monitor never closes its own findings. See
`templates/errata_queue.template.md` for the header and an example row.

## Where it sits in the lifecycle

The monitor is the back end of the research lifecycle. Intake (`lab_autosearch`,
`lab_lit`, `lab_deep_research`) fills the funnel, the registry and executor run
the work, the review pipeline gates what you publish, and the monitor watches
what you published. A finding it routes to the errata queue can become a new
CANDIDATE in the registry, which closes the loop.

## Scheduling

Add `lab_monitor.sh` to launchd or cron alongside `lab_lit.sh`. See
`templates/launchd.example.plist` and `templates/crontab.example`. One claims
target is attacked per run, so a nightly cadence keeps each morning's review
small.

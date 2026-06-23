#!/bin/bash
# lab_monitor.sh: post-publication monitor for Dexter's Lab.
#
# Once per night a scheduler (launchd or cron; see templates/) runs this
# script. It re-attacks your OWN published claims: a headless `claude -p`
# session loads the claims, runs a fresh novelty / soundness / prior-art
# attack pass, and drafts a normalized adversarial-attack report to
# reviews_dir/monitor/<date>.md. That report is then piped through
# bin/lab_triage.py, which routes only genuinely NEW weakened or refuted
# findings to the errata queue. The same finding re-found tomorrow night is
# suppressed. This is the loop that catches an attribution or prior-art error
# the day after publication, not a year later.
#
# ONE monitor target per run: drafts only, no DB writes, no sends, no edits to
# the original paper. The morning errata queue stays small.
#
# The monitor target (your published claims) comes from the config key
# `monitor_target` if set, else from the first of these that exists:
#   <lab_home>/CLAIMS.md          a claims file you maintain
#   <lab_home>/paper/CLAIMS.md
#   <lab_home>/paper                a paper directory to read claims from
# Point monitor_target at your paper/ dir or a CLAIMS.md to choose.
#
# Safety model (same as lab_lit.sh):
# - Kill switch: `touch <lab_home>/pause` halts all runs (exit 0, logged).
# - Budget governor: bin/lab_budget.py guard halts politely once month-to-date
#   spend >= the cap (config budget.monthly_cap_usd, env LAB_BUDGET_CAP_USD).
# - Headless `claude -p` with acceptEdits; the child writes drafts only.
# - The claude CLI is OPTIONAL: if it is not on PATH this script logs a clear
#   error and exits 1. Nothing else runs.

set -u

# Argument guard FIRST, before any side effect. This script takes NO arguments;
# a bare run re-attacks the published claims and may spend money on a headless
# agent. Any argument (including --help) prints usage and exits without
# launching it.
if [ "$#" -gt 0 ]; then
  cat <<'USAGE'
lab_monitor.sh: re-attack your OWN published claims via a headless `claude -p`.

Usage: lab_monitor.sh             (no arguments)

This is a scheduled, money-spending, autonomous step. It loads the monitor
target (config monitor_target, or <lab_home>/CLAIMS.md, or <lab_home>/paper),
runs a novelty/soundness/prior-art attack pass, drafts a report to
reviews_dir/monitor/<date>.md, then pipes it through bin/lab_triage.py to the
errata queue. ONE target per run. Safety: kill switch at <lab_home>/pause,
budget cap via lab_budget.py, drafts only (no DB writes, no sends, no edits to
the original). Point monitor_target at your paper/ dir or a CLAIMS.md, then run
with NO arguments (or from launchd/cron).
USAGE
  exit 0
fi

# Schedulers (launchd especially) ship a bare PATH like /usr/bin:/bin, so the
# claude CLI and homebrew python are invisible and the run dies rc=127 before
# doing anything. Export the common bin dirs up front.
export PATH="$HOME/.local/bin:$HOME/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON="${LAB_PYTHON:-python3}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
MAX_TURNS="${LAB_MONITOR_MAX_TURNS:-60}"
CONSUMER="lab_monitor"

# labcfg <dotted.key> -> print one value from the shared config (empty if absent).
labcfg() {
  LAB_ROOT="$LAB_ROOT" "$PYTHON" - "$1" <<'PY'
import os, sys, pathlib
sys.path.insert(0, str(pathlib.Path(os.environ["LAB_ROOT"]) / "lib"))
import labconfig
cfg = labconfig.ensure_home()
cur = cfg
try:
    for part in sys.argv[1].split("."):
        cur = cur[part]
except (KeyError, TypeError):
    print("")
else:
    print(cur if cur is not None else "")
PY
}

LAB_HOME="$(labcfg lab_home)" || { echo "lab_monitor: cannot load lab config" >&2; exit 1; }
REVIEWS_DIR="$(labcfg reviews_dir)"
MONITOR_TARGET="$(labcfg monitor_target)"
RUNLOG="$LAB_HOME/lab_monitor_runs.jsonl"
PAUSE_FILE="$LAB_HOME/pause"
LAB_BUDGET="$LAB_ROOT/bin/lab_budget.py"
LAB_TRIAGE="$LAB_ROOT/bin/lab_triage.py"
QUEUE="$LAB_HOME/ERRATA_QUEUE.md"
STATE="$LAB_HOME/monitor_state.json"
FLOOR="${LAB_MONITOR_FLOOR:-0.7}"
MONITOR_DIR="$REVIEWS_DIR/monitor"

mkdir -p "$MONITOR_DIR" "$(dirname "$RUNLOG")"

# jlog <event> [key value]...  -> append one JSON object to the run log.
jlog() {
  RUNLOG="$RUNLOG" "$PYTHON" - "$@" <<'PY'
import datetime, json, os, sys
row = {"ts": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
       "event": sys.argv[1]}
rest = sys.argv[2:]
for i in range(0, len(rest) - 1, 2):
    k, v = rest[i], rest[i + 1]
    try:
        row[k] = int(v)
    except ValueError:
        try:
            row[k] = float(v)
        except ValueError:
            row[k] = v
with open(os.environ["RUNLOG"], "a") as fh:
    fh.write(json.dumps(row) + "\n")
PY
}

# --- 1. Kill switch ----------------------------------------------------------
if [ -f "$PAUSE_FILE" ]; then
  jlog paused detail "pause file present: $PAUSE_FILE"
  echo "lab_monitor: paused ($PAUSE_FILE present); exiting"
  exit 0
fi

# --- 2. Budget governor ------------------------------------------------------
if ! "$PYTHON" "$LAB_BUDGET" guard; then
  jlog budget_halt cap "${LAB_BUDGET_CAP_USD:-config}"
  echo "lab_monitor: budget cap reached; halting politely"
  exit 0
fi

# --- 3. Claude CLI is optional but required for this lane --------------------
if ! command -v "$CLAUDE_BIN" >/dev/null 2>&1; then
  jlog error detail "claude CLI not found: $CLAUDE_BIN"
  echo "lab_monitor: ERROR: the claude CLI ($CLAUDE_BIN) is not on PATH." >&2
  echo "lab_monitor: install Claude Code or set CLAUDE_BIN. Nothing was run." >&2
  exit 1
fi

# --- 4. Resolve the monitor target (the published claims to re-attack) -------
if [ -z "$MONITOR_TARGET" ]; then
  for cand in "$LAB_HOME/CLAIMS.md" "$LAB_HOME/paper/CLAIMS.md" "$LAB_HOME/paper"; do
    if [ -e "$cand" ]; then
      MONITOR_TARGET="$cand"
      break
    fi
  done
fi
if [ -z "$MONITOR_TARGET" ] || [ ! -e "$MONITOR_TARGET" ]; then
  jlog no_target detail "no monitor target found"
  echo "lab_monitor: no monitor target. Set config monitor_target, or create" >&2
  echo "lab_monitor: $LAB_HOME/CLAIMS.md, or $LAB_HOME/paper. Nothing was run." >&2
  exit 1
fi

DATE=$(date +%F)
REPORT_PATH="$MONITOR_DIR/$DATE.md"

# --- 5. Compose the headless prompt ------------------------------------------
PROMPT="You are the lab's post-publication monitor running a HEADLESS scheduled
re-attack on the lab's OWN published claims. You ARE the Claude for this run:
use your own tools (Read, Glob, Grep, WebSearch, WebFetch, Bash). Do NOT spawn
another claude -p and do NOT call any external API.

=== MONITOR TARGET (your published claims) ===
$MONITOR_TARGET
If this is a directory, read the claims from CLAIMS.md if present, else from the
paper's main source; if it is a file, read it. These claims are ALREADY
PUBLISHED. Your job is to find any reason they should not have been.

=== TASK ===
Run a fresh adversarial attack pass over each published claim:
1. Soundness: re-derive or re-check the claim. Does it still hold today?
2. Novelty + prior art: use WebSearch and WebFetch to look for prior or
   concurrent work that anticipates the claim, including an attribution the
   paper missed. A one-day-late prior-art or attribution catch is the whole
   point of this loop.
3. New evidence: search for results published since that weaken or refute it.

=== HARD RULES ===
1. Drafts only. Write ONE markdown report to exactly this path: $REPORT_PATH
   Create the directory if it is missing. Do not write any other file.
2. Do NOT edit, move, or touch the original published claims or paper. Read only.
3. No database writes of any kind.
4. No sends: no email, no Slack, no gh, no git commit or push, no deploys,
   no launchctl, no crontab.
5. No paid APIs. Claude Code native tools only.
6. Every weakened or refuted finding carries real evidence with a URL you
   actually fetched. If WebSearch returns nothing usable, record the claim as
   upheld for now. Never fabricate a citation, a URL, or a finding.

=== REPORT SCHEMA (the normalized review schema; lab_triage.py parses it) ===
Title line, then a Findings section. One numbered section per claim:

### N. [VERDICT] category
- **Claim**: the published claim, verbatim or a faithful paraphrase
- **Result**: one line; include 'confidence: 0.NN' (0 to 1)
- **claim_status**: upheld | weakened | refuted
- **Evidence**:
  - one bullet per piece of evidence, each with a URL where applicable
- **Citations**:
  - one bullet per source URL

VERDICT in the heading is UPHELD, WEAKENED, or REFUTED and must match
claim_status. Use WEAKENED or REFUTED only when you have evidence; otherwise
UPHELD. Be adversarial but honest: the goal is the truth about the published
claims, not a takedown.

Finish within $MAX_TURNS turns. If close to the limit, finalize the report with
what you verified. No em dashes or en dashes anywhere you write."

# --- 6. Run the headless re-attack -------------------------------------------
jlog run_start target "$MONITOR_TARGET" report "$REPORT_PATH"

OUT=$(cd "$LAB_HOME" && "$CLAUDE_BIN" -p "$PROMPT" \
  --permission-mode acceptEdits --output-format json --max-turns "$MAX_TURNS" \
  2>>"$RUNLOG.err")
RC=$?

COST=$(printf '%s' "$OUT" | "$PYTHON" -c "
import json, sys
try:
    print(json.load(sys.stdin).get('total_cost_usd') or 0)
except Exception:
    print(0)
")

# --- 7. Record cost on the shared spend ledger -------------------------------
"$PYTHON" "$LAB_BUDGET" record "$CONSUMER" "$COST" \
  "{\"rc\":$RC,\"target\":\"$MONITOR_TARGET\"}" >/dev/null 2>&1 \
  || echo "lab_monitor: lab_budget record failed (cost=$COST)" >&2

# --- 8. Triage the report into the errata queue ------------------------------
TRIAGE_RC=0
QUEUED=0
if [ -f "$REPORT_PATH" ]; then
  TRIAGE_OUT=$("$PYTHON" "$LAB_TRIAGE" "$REPORT_PATH" \
    --queue "$QUEUE" --state "$STATE" --floor "$FLOOR" 2>>"$RUNLOG.err")
  TRIAGE_RC=$?
  echo "$TRIAGE_OUT"
  QUEUED=$(printf '%s\n' "$TRIAGE_OUT" | grep -c '^  queued:' | tr -d ' ')
else
  echo "lab_monitor: report not written: $REPORT_PATH" >&2
fi

jlog run_done rc "$RC" cost "$COST" report "$REPORT_PATH" \
  triage_rc "$TRIAGE_RC" queued "$QUEUED"

if [ "$RC" -ne 0 ]; then
  echo "lab_monitor: run failed rc=$RC; see $RUNLOG and $RUNLOG.err" >&2
fi
exit 0

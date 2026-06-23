#!/bin/bash
# lab_executor.sh: one-task-per-night executor for Dexter's Lab.
#
# Picks ONE unblocked TODO task from the task ledger (config ledger_path) per
# run, executes it via `claude -p` in headless mode, and only marks DONE when
# the task's verify command passes.
#
# Safety model:
# - Kill switch: `touch <lab_home>/pause` halts all runs (exit 0, logged).
# - Budget governor: bin/lab_budget.py guard halts politely once month-to-date
#   spend >= the cap (config budget.monthly_cap_usd, env LAB_BUDGET_CAP_USD).
# - One task per night keeps blast radius reviewable each morning.
# - The child session works in a fresh git worktree for code changes, never
#   runs destructive git in a primary tree, and parks sends/deploys/deletes
#   as PENDING_HUMAN instead of executing them headless.
# - The claude CLI is OPTIONAL: without it this executor NO-OPS LOUDLY. It
#   logs claude_missing to the run log, prints a clear message, and exits 0
#   so a scheduler does not flap. Nothing is executed.
#
# Ledger contract (config ledger_path, markdown table):
#   One task per row. Status: TODO | IN_PROGRESS | DONE | BLOCKED | FAILED |
#   PENDING_HUMAN. A task is eligible when status is TODO and all its deps
#   are DONE. A task may only move to DONE when its verify command exits 0.

set -u

# Argument guard FIRST, before any side effect. This script takes NO arguments;
# a bare run picks one ledger task and may spend money on a headless agent. Any
# argument (including --help) prints usage and exits without launching anything.
if [ "$#" -gt 0 ]; then
  cat <<'USAGE'
lab_executor.sh: run ONE unblocked ledger task via a headless `claude -p` agent.

Usage: lab_executor.sh            (no arguments)

This is a scheduled, money-spending, autonomous step. It picks the first TODO
task whose deps are DONE from the config ledger_path, runs it, and marks DONE
only if the task's verify command passes. Safety: kill switch at <lab_home>/pause,
budget cap via lab_budget.py, no sends/deploys/deletes (parked PENDING_HUMAN).
Configure via lab.config.json, then run with NO arguments (or from launchd/cron).
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
MAX_TURNS="${LAB_EXECUTOR_MAX_TURNS:-80}"
CONSUMER="lab_executor"

# labcfg <dotted.key> -> print one value from the shared config.
labcfg() {
  LAB_ROOT="$LAB_ROOT" "$PYTHON" - "$1" <<'PY'
import os, sys, pathlib
sys.path.insert(0, str(pathlib.Path(os.environ["LAB_ROOT"]) / "lib"))
import labconfig
cfg = labconfig.ensure_home()
cur = cfg
for part in sys.argv[1].split("."):
    cur = cur[part]
print(cur)
PY
}

LAB_HOME="$(labcfg lab_home)" || { echo "lab_executor: cannot load lab config" >&2; exit 1; }
LEDGER="$(labcfg ledger_path)"
RUNLOG="$LAB_HOME/executor_runs.jsonl"
PAUSE_FILE="$LAB_HOME/pause"
LAB_BUDGET="$LAB_ROOT/bin/lab_budget.py"

mkdir -p "$(dirname "$RUNLOG")"

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
  echo "lab_executor: paused ($PAUSE_FILE present); exiting"
  exit 0
fi

# --- 2. Budget governor ------------------------------------------------------
if ! "$PYTHON" "$LAB_BUDGET" guard; then
  jlog budget_halt cap "${LAB_BUDGET_CAP_USD:-config}"
  echo "lab_executor: budget cap reached; halting politely"
  exit 0
fi

# --- 3. Claude CLI check: no-op loudly when absent -----------------------------
if ! command -v "$CLAUDE_BIN" >/dev/null 2>&1; then
  jlog claude_missing detail "claude CLI not found: $CLAUDE_BIN"
  echo "lab_executor: NO-OP: the claude CLI ($CLAUDE_BIN) is not on PATH." >&2
  echo "lab_executor: install Claude Code or set CLAUDE_BIN; no task was run." >&2
  exit 0
fi

# --- 4. Ledger must exist ------------------------------------------------------
if [ ! -f "$LEDGER" ]; then
  jlog error detail "task ledger missing: $LEDGER"
  echo "lab_executor: ERROR: task ledger not found at $LEDGER" >&2
  echo "lab_executor: create it (lab_init seeds one) before scheduling this executor." >&2
  exit 1
fi

# --- 5. Compose the safety prompt ----------------------------------------------
PROMPT="You are the nightly executor for this research lab.
Read the task ledger at $LEDGER.

Pick exactly ONE task: the first row with status TODO whose deps are all DONE.
Skip PENDING_HUMAN, BLOCKED, FAILED, and IN_PROGRESS rows.
If no task is eligible, write nothing, print 'no eligible task' and stop.

Execute it under this safety contract:
- Code changes happen in a fresh git worktree under the target repo's
  .claude/worktrees/, merged back only after the task's verify condition
  passes. NEVER run destructive git in a primary tree.
- No sends, no deploys, no deletes, no launchctl, no crontab: if the task
  needs one, set its status to PENDING_HUMAN in the ledger and stop.
- Verify before DONE: a task may only move to DONE when its verify command
  exits 0. When verified, commit atomically, then update the task's status
  row in $LEDGER with DONE plus today's date.
- If verification fails, set status FAILED with a one-line reason. Honest
  failure beats fake green.
Finally print a one-paragraph summary of what you did."

# --- 6. Run --------------------------------------------------------------------
jlog run_start ledger "$LEDGER"

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

# --- 7. Record cost on the shared spend ledger ----------------------------------
"$PYTHON" "$LAB_BUDGET" record "$CONSUMER" "$COST" "{\"rc\":$RC}" >/dev/null 2>&1 \
  || echo "lab_executor: lab_budget record failed (cost=$COST)" >&2

jlog run_done rc "$RC" cost "$COST"

if [ "$RC" -ne 0 ]; then
  echo "lab_executor: run failed rc=$RC; see $RUNLOG and $RUNLOG.err" >&2
fi
exit 0

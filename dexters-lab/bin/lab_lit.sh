#!/bin/bash
# lab_lit.sh: headless scheduled literature-scan lane for Dexter's Lab.
#
# Once per night a scheduler (launchd or cron; see templates/) runs this script.
# One literature target is scanned per run: drafts only, >= 15 sources, every
# claim carries a URL, no DB writes, no sends. The morning review stays small.
#
# Safety model:
# - Kill switch: `touch <lab_home>/pause` halts all runs (exit 0, logged).
# - Budget governor: bin/lab_budget.py guard halts politely once month-to-date
#   spend >= the cap (config budget.monthly_cap_usd, env LAB_BUDGET_CAP_USD).
# - Headless `claude -p` with acceptEdits; the child session writes drafts only.
# - The claude CLI is OPTIONAL: if it is not on PATH this script logs a clear
#   error and exits 1. Nothing else runs.
#
# All paths come from the shared lab config (lib/labconfig.py):
#   lab_home    -> queue (lit_queue.json), run log, pause file
#   drafts_dir  -> where memos land
# The queue self-seeds from templates/lit_queue.seed.json on first run.

set -u

# Argument guard FIRST, before any side effect. This script takes NO arguments;
# a bare run seeds the queue and may spend money on a headless literature agent.
# Any argument (including --help) prints usage and exits without launching it.
if [ "$#" -gt 0 ]; then
  cat <<'USAGE'
lab_lit.sh: run ONE scheduled literature scan via a headless `claude -p` agent.

Usage: lab_lit.sh                 (no arguments)

This is a scheduled, money-spending, autonomous step. It pops one target from
the lit queue (lab_home/lit_queue.json, self-seeded from templates on first run),
runs a grounded drafts-only scan into drafts_dir, and logs the cost. Safety: kill
switch at <lab_home>/pause, budget cap via lab_budget.py. Run with NO arguments
(or from launchd/cron). Edit the queue file to choose targets.
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
MAX_TURNS="${LAB_LIT_MAX_TURNS:-60}"
CONSUMER="lab_lit"

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

LAB_HOME="$(labcfg lab_home)" || { echo "lab_lit: cannot load lab config" >&2; exit 1; }
DRAFTS_DIR="$(labcfg drafts_dir)"
QUEUE="$LAB_HOME/lit_queue.json"
RUNLOG="$LAB_HOME/lab_lit_runs.jsonl"
PAUSE_FILE="$LAB_HOME/pause"
LIT_QUEUE="$LAB_ROOT/bin/lit_queue.py"
LAB_BUDGET="$LAB_ROOT/bin/lab_budget.py"
SEED_TEMPLATE="$LAB_ROOT/templates/lit_queue.seed.json"
PROCEDURE_FILE="$LAB_HOME/research_procedure.md"   # optional override, appended if present

mkdir -p "$DRAFTS_DIR" "$(dirname "$RUNLOG")"

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

# json_field <json-string> <key> -> print one top-level string field.
json_field() {
  printf '%s' "$1" | "$PYTHON" -c "import json,sys; print(json.load(sys.stdin).get(sys.argv[1], ''))" "$2"
}

# --- 1. Kill switch ----------------------------------------------------------
if [ -f "$PAUSE_FILE" ]; then
  jlog paused detail "pause file present: $PAUSE_FILE"
  echo "lab_lit: paused ($PAUSE_FILE present); exiting"
  exit 0
fi

# --- 2. Budget governor ------------------------------------------------------
if ! "$PYTHON" "$LAB_BUDGET" guard; then
  jlog budget_halt cap "${LAB_BUDGET_CAP_USD:-config}"
  echo "lab_lit: budget cap reached; halting politely"
  exit 0
fi

# --- 3. Claude CLI is optional but required for this lane --------------------
if ! command -v "$CLAUDE_BIN" >/dev/null 2>&1; then
  jlog error detail "claude CLI not found: $CLAUDE_BIN"
  echo "lab_lit: ERROR: the claude CLI ($CLAUDE_BIN) is not on PATH." >&2
  echo "lab_lit: install Claude Code or set CLAUDE_BIN. Nothing was run." >&2
  exit 1
fi

# --- 4. Self-seed the queue on first run --------------------------------------
if [ ! -f "$QUEUE" ]; then
  if ! "$PYTHON" "$LIT_QUEUE" seed --queue "$QUEUE" --template "$SEED_TEMPLATE"; then
    jlog error detail "queue seed failed"
    echo "lab_lit: could not seed queue at $QUEUE" >&2
    exit 1
  fi
  jlog seeded queue "$QUEUE"
  echo "lab_lit: seeded $QUEUE with example targets; edit it, then re-run" >&2
fi

# --- 5. Pick the next literature target ---------------------------------------
TARGET_JSON=$("$PYTHON" "$LIT_QUEUE" next --queue "$QUEUE")
if [ $? -ne 0 ] || [ -z "$TARGET_JSON" ]; then
  jlog no_target detail "lit_queue next returned nothing"
  echo "lab_lit: no literature target available" >&2
  exit 1
fi
TARGET_ID=$(json_field "$TARGET_JSON" id)
TARGET_SLUG=$(json_field "$TARGET_JSON" slug)
TARGET_TOPIC=$(json_field "$TARGET_JSON" topic)
TARGET_FEEDS=$(json_field "$TARGET_JSON" feeds)
if [ -z "$TARGET_ID" ] || [ -z "$TARGET_SLUG" ]; then
  jlog error detail "target missing id/slug"
  echo "lab_lit: target JSON missing id/slug" >&2
  exit 1
fi

DATE=$(date +%F)
DRAFT_PATH="$DRAFTS_DIR/$DATE-$TARGET_SLUG.md"

EXTRA_PROCEDURE=""
if [ -f "$PROCEDURE_FILE" ]; then
  EXTRA_PROCEDURE="

=== LAB-SPECIFIC PROCEDURE (from $PROCEDURE_FILE) ===
$(cat "$PROCEDURE_FILE")"
fi

# --- 6. Compose the headless prompt -------------------------------------------
PROMPT="You are the lab's literature agent running a HEADLESS scheduled scan.
You ARE the Claude for this run: use your own tools (WebSearch, WebFetch, Read,
Write, Glob, Grep, Bash). Do NOT spawn another claude -p and do NOT call any
external API.

=== LITERATURE TARGET ===
Target id: $TARGET_ID
Topic: $TARGET_TOPIC
Feeds research question(s): $TARGET_FEEDS

=== HARD RULES ===
1. Drafts only. Write ONE markdown memo to exactly this path: $DRAFT_PATH
   Create the directory if it is missing. Do not write any other file.
2. At least 15 DISTINCT sources, each with a real URL you actually fetched
   with WebFetch.
3. Every claim in the memo carries an inline URL to its source. No claim
   without a citation.
4. No database writes of any kind.
5. No sends: no email, no Slack, no gh, no git commit or push, no deploys,
   no launchctl, no crontab.
6. No paid APIs. Claude Code native tools only.
7. If WebSearch returns nothing usable for a sub-query, record it as
   no_sources_found and move on. Never fabricate a citation or a URL.
8. Memo structure: a title; a line stating the target id and which RQ(s) it
   feeds; 2 to 4 sub-questions; findings (each a falsifiable claim plus its
   source URL); a prior-art summary; a gap analysis; a recommendation; and a
   final Sources list of at least 15 distinct URLs.
9. Finish within $MAX_TURNS turns. If you are close to the limit, stop
   searching and finalize the memo with what you already verified.$EXTRA_PROCEDURE

When done, print one summary line: the draft path, the distinct-source count,
and the verified-claim count."

# --- 7. Run the headless scan --------------------------------------------------
jlog run_start target_id "$TARGET_ID" draft "$DRAFT_PATH" feeds "$TARGET_FEEDS"

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

# --- 8. Record cost on the shared spend ledger ---------------------------------
"$PYTHON" "$LAB_BUDGET" record "$CONSUMER" "$COST" \
  "{\"rc\":$RC,\"target_id\":\"$TARGET_ID\"}" >/dev/null 2>&1 \
  || echo "lab_lit: lab_budget record failed (cost=$COST)" >&2

# --- 9. Rotate the queue (mark this target done with today's date) -------------
"$PYTHON" "$LIT_QUEUE" rotate "$TARGET_ID" --queue "$QUEUE" --date "$DATE" >/dev/null 2>&1
ROT_RC=$?

# --- 10. Summarize the draft for the run log ------------------------------------
DRAFT_EXISTS=false
SRC_COUNT=0
if [ -f "$DRAFT_PATH" ]; then
  DRAFT_EXISTS=true
  SRC_COUNT=$(grep -Eoi 'https?://[^ )">]+' "$DRAFT_PATH" 2>/dev/null | sort -u | wc -l | tr -d ' ')
fi

jlog run_done rc "$RC" cost "$COST" target_id "$TARGET_ID" draft "$DRAFT_PATH" \
  draft_exists "$DRAFT_EXISTS" sources "$SRC_COUNT" rotated "$ROT_RC"

if [ "$RC" -ne 0 ]; then
  echo "lab_lit: run failed rc=$RC; see $RUNLOG and $RUNLOG.err" >&2
fi
exit 0

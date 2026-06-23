#!/bin/bash
# lab_autosearch.sh: optional grounded discovery pass for Dexter's Lab.
#
# The deterministic planner (bin/lab_autosearch.py) reads the lab's state and
# derives what it SHOULD be searching for. This script adds the grounded step:
# for each derived query it runs a headless `claude -p` web pass that returns
# title + url + a one-line why for recent papers, agents, and tools, then hands
# the collected findings back to the planner's `propose` to extend the lit
# queue and the discoveries log. Drafts only. No DB writes. No sends.
#
# Without the claude CLI this script does nothing but explain itself. The Python
# planner still works on its own: `lab_autosearch.py read-state` and
# `lab_autosearch.py queries` need no CLI and no money. Only the grounded
# discovery step here is skipped when claude is absent.
#
# Safety model (same as lab_lit.sh):
# - Kill switch: `touch <lab_home>/pause` halts all runs (exit 0, logged).
# - Budget governor: bin/lab_budget.py guard halts once month-to-date spend
#   reaches the cap (config budget.monthly_cap_usd, env LAB_BUDGET_CAP_USD).
# - Headless `claude -p` with acceptEdits; each child session returns JSON only.
# - The claude CLI is OPTIONAL: if it is not on PATH this script logs a clear
#   error and exits 1. The planner-only path stays available via the .py tool.
#
# All paths come from the shared lab config (lib/labconfig.py):
#   registry_path -> the open hypotheses that seed queries
#   lab_home      -> queries file, discoveries JSON, lit_queue.json, run log,
#                    pause file
# An optional roadmap markdown adds active-track queries (config
# autosearch.roadmap_path, or env LAB_AUTOSEARCH_ROADMAP).

set -u

# Argument guard FIRST, before any side effect. This script takes NO positional
# arguments; a bare run derives queries and may spend money on grounded discovery
# passes. Any argument (including --help) prints usage and exits without one.
if [ "$#" -gt 0 ]; then
  cat <<'USAGE'
lab_autosearch.sh: run the OPTIONAL grounded discovery pass.

Usage: lab_autosearch.sh            (no arguments)

This is a scheduled, money-spending, autonomous step. It reads lab state via
lab_autosearch.py, runs one grounded `claude -p` web pass per derived query
(drafts only: title+url+one-line why, never fabricated), then proposes new lit
targets and discovery-log rows. Safety: kill switch at <lab_home>/pause, budget
cap via lab_budget.py. Run with NO arguments (or from launchd/cron).

The planner alone needs neither the CLI nor money:
  lab_autosearch.py read-state      # what the lab should search for
  lab_autosearch.py queries         # deduped discovery queries
USAGE
  exit 0
fi

# Schedulers (launchd especially) ship a bare PATH, so claude and homebrew
# python are invisible and the run dies rc=127 before doing anything. Export
# the common bin dirs up front.
export PATH="$HOME/.local/bin:$HOME/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON="${LAB_PYTHON:-python3}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
MAX_TURNS="${LAB_AUTOSEARCH_MAX_TURNS:-30}"
MAX_QUERIES="${LAB_AUTOSEARCH_MAX_QUERIES:-6}"
CONSUMER="autosearch"

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

LAB_HOME="$(labcfg lab_home)" || { echo "lab_autosearch: cannot load lab config" >&2; exit 1; }
RUNLOG="$LAB_HOME/lab_autosearch_runs.jsonl"
PAUSE_FILE="$LAB_HOME/pause"
QUERIES_FILE="$LAB_HOME/autosearch_queries.json"
DISCOVERIES_FILE="$LAB_HOME/autosearch_discoveries.json"
AUTOSEARCH="$LAB_ROOT/bin/lab_autosearch.py"
LAB_BUDGET="$LAB_ROOT/bin/lab_budget.py"
ROADMAP="${LAB_AUTOSEARCH_ROADMAP:-}"

mkdir -p "$LAB_HOME"

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
  echo "lab_autosearch: paused ($PAUSE_FILE present); exiting"
  exit 0
fi

# --- 2. Budget governor ------------------------------------------------------
if ! "$PYTHON" "$LAB_BUDGET" guard; then
  jlog budget_halt cap "${LAB_BUDGET_CAP_USD:-config}"
  echo "lab_autosearch: budget cap reached; halting politely"
  exit 0
fi

# --- 3. Claude CLI is optional but required for this grounded lane -----------
if ! command -v "$CLAUDE_BIN" >/dev/null 2>&1; then
  jlog error detail "claude CLI not found: $CLAUDE_BIN"
  echo "lab_autosearch: ERROR: the claude CLI ($CLAUDE_BIN) is not on PATH." >&2
  echo "lab_autosearch: the planner still works without it:" >&2
  echo "lab_autosearch:   $PYTHON $AUTOSEARCH read-state" >&2
  echo "lab_autosearch:   $PYTHON $AUTOSEARCH queries" >&2
  echo "lab_autosearch: only the grounded discovery step needs the CLI." >&2
  exit 1
fi

# --- 4. Derive queries from lab state ----------------------------------------
# macOS ships bash 3.2; under `set -u` an empty-array expansion is "unbound".
# Build the optional --roadmap flag as a plain string and run accordingly.
if [ -n "$ROADMAP" ]; then
  QUERIES_OK=$("$PYTHON" "$AUTOSEARCH" queries --roadmap "$ROADMAP" --out "$QUERIES_FILE" && echo ok)
else
  QUERIES_OK=$("$PYTHON" "$AUTOSEARCH" queries --out "$QUERIES_FILE" && echo ok)
fi
if [ "$QUERIES_OK" != "ok" ]; then
  jlog error detail "queries step failed"
  echo "lab_autosearch: could not derive queries" >&2
  exit 1
fi

# Pull at most MAX_QUERIES query strings (and their source_rq_id) into two
# newline-delimited streams the loop below walks in lockstep.
QUERY_TEXT="$("$PYTHON" - "$QUERIES_FILE" "$MAX_QUERIES" <<'PY'
import json, sys
doc = json.load(open(sys.argv[1]))
for q in (doc.get("queries") or [])[:int(sys.argv[2])]:
    print(q.get("query", ""))
PY
)"
QUERY_RQIDS="$("$PYTHON" - "$QUERIES_FILE" "$MAX_QUERIES" <<'PY'
import json, sys
doc = json.load(open(sys.argv[1]))
for q in (doc.get("queries") or [])[:int(sys.argv[2])]:
    print(q.get("source_rq_id", ""))
PY
)"

if [ -z "$QUERY_TEXT" ]; then
  jlog no_queries detail "no open questions or tracks to search"
  echo "lab_autosearch: no queries derived from current state; nothing to do"
  exit 0
fi

N_QUERIES=$(printf '%s\n' "$QUERY_TEXT" | grep -c .)
jlog run_start queries "$N_QUERIES" queries_file "$QUERIES_FILE"

# --- 5. One grounded discovery pass per query --------------------------------
# Findings accumulate into a per-query JSON blob list, assembled at the end.
BLOBS_DIR="$LAB_HOME/autosearch_blobs"
rm -rf "$BLOBS_DIR"
mkdir -p "$BLOBS_DIR"

TOTAL_COST=0
i=0
while IFS= read -r QUERY && IFS= read -r RQID <&3; do
  [ -z "$QUERY" ] && continue
  i=$((i + 1))

  # Re-check the budget before every paid call so a long fan-out cannot overshoot.
  if ! "$PYTHON" "$LAB_BUDGET" guard >/dev/null 2>&1; then
    jlog budget_halt_midrun done "$i"
    echo "lab_autosearch: budget cap reached mid-run after $i queries; stopping" >&2
    break
  fi

  BLOB="$BLOBS_DIR/q$i.json"
  PROMPT="You are the lab's discovery agent on a HEADLESS scheduled pass.
You ARE the Claude for this run: use your own tools (WebSearch, WebFetch).
Do NOT spawn another claude -p and do NOT call any external API.

=== DISCOVERY QUERY ===
$QUERY

=== TASK ===
Find recent (prefer 2025-2026) papers, agents, frameworks, tools, or datasets
relevant to this query. For each, return its title, a real URL you actually
found, a single-line reason it is relevant, and a kind from
paper|agent|tool|dataset.

=== HARD RULES ===
1. Output ONLY a JSON object to stdout, no prose around it, shaped exactly:
   {\"findings\": [{\"title\": \"...\", \"url\": \"https://...\",
     \"why_relevant\": \"one line\", \"kind\": \"paper|agent|tool|dataset\"}]}
2. Every url must be one you actually found. Never fabricate a url or a title.
3. why_relevant is prose only. Do NOT invent any numeric relevance score.
4. No database writes. No sends (no email, Slack, gh, git, deploy, launchctl).
5. No paid APIs. Claude Code native tools only.
6. If nothing usable is found, return {\"findings\": []}. Never pad the list.
7. Aim for up to 6 findings. Finish within $MAX_TURNS turns."

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

  # The agent's answer text is the result field of the claude JSON envelope.
  # Pull the embedded findings JSON out of it and stamp on query + source_rq_id.
  RESULT_TEXT=$(printf '%s' "$OUT" | "$PYTHON" -c "
import json, sys
try:
    print(json.load(sys.stdin).get('result') or '')
except Exception:
    print('')
")
  QUERY="$QUERY" RQID="$RQID" "$PYTHON" - "$BLOB" <<PY
import json, os, re, sys
raw = """$RESULT_TEXT"""
findings = []
try:
    # Tolerate a fenced or surrounded JSON object: grab the first {...} span.
    m = re.search(r"\{.*\}", raw, re.S)
    if m:
        obj = json.loads(m.group(0))
        f = obj.get("findings")
        if isinstance(f, list):
            findings = f
except Exception:
    findings = []
block = {"query": os.environ.get("QUERY", ""),
         "source_rq_id": os.environ.get("RQID", ""),
         "findings": findings}
open(sys.argv[1], "w").write(json.dumps(block))
PY

  N_FOUND=$("$PYTHON" -c "import json,sys; print(len(json.load(open(sys.argv[1])).get('findings') or []))" "$BLOB" 2>/dev/null || echo 0)
  jlog query_done idx "$i" rc "$RC" cost "$COST" found "$N_FOUND"

  "$PYTHON" "$LAB_BUDGET" record "$CONSUMER" "$COST" \
    "{\"rc\":$RC,\"query_idx\":$i}" >/dev/null 2>&1 \
    || echo "lab_autosearch: lab_budget record failed (cost=$COST)" >&2
  TOTAL_COST=$("$PYTHON" -c "print(round(float('$TOTAL_COST') + float('$COST' or 0), 6))")
done 3<<<"$QUERY_RQIDS" <<<"$QUERY_TEXT"

# --- 6. Assemble all per-query blobs into one discoveries JSON ----------------
"$PYTHON" - "$BLOBS_DIR" "$DISCOVERIES_FILE" <<'PY'
import json, pathlib, sys
blobs_dir = pathlib.Path(sys.argv[1])
out = []
for p in sorted(blobs_dir.glob("q*.json")):
    try:
        out.append(json.loads(p.read_text()))
    except Exception:
        continue
pathlib.Path(sys.argv[2]).write_text(json.dumps({"discoveries": out}, indent=2))
PY

# --- 7. Propose: extend the lit queue + discovery log -------------------------
PROPOSE_OUT=$("$PYTHON" "$AUTOSEARCH" propose --discoveries "$DISCOVERIES_FILE" 2>>"$RUNLOG.err")
PROPOSE_RC=$?
QUEUED=$(printf '%s' "$PROPOSE_OUT" | "$PYTHON" -c "import json,sys; print(json.load(sys.stdin).get('queued_to_lit',0))" 2>/dev/null || echo 0)
LOGGED=$(printf '%s' "$PROPOSE_OUT" | "$PYTHON" -c "import json,sys; print(json.load(sys.stdin).get('logged_discoveries',0))" 2>/dev/null || echo 0)

jlog run_done queries "$N_QUERIES" cost "$TOTAL_COST" propose_rc "$PROPOSE_RC" \
  queued_to_lit "$QUEUED" logged "$LOGGED"

echo "lab_autosearch: done. queries=$N_QUERIES queued_to_lit=$QUEUED logged=$LOGGED cost=$TOTAL_COST"
if [ "$PROPOSE_RC" -ne 0 ]; then
  echo "lab_autosearch: propose step rc=$PROPOSE_RC; see $RUNLOG.err" >&2
fi
exit 0

#!/bin/bash
# lab_deep_research.sh: headless entry for the Dexter's Lab deep-research pipeline.
#
# Feeds the lab-deep-research skill text plus a question to a headless
# `claude -p` session. The session fans out web searches, fetches sources,
# adversarially verifies the load-bearing claims, and writes a cited report
# plus a claims JSON under the config's reviews_dir (drafts only: no DB, no
# sends, no git, no deploy). Methodology in docs/DEEP_RESEARCH.md.
#
# Usage:
#   lab_deep_research.sh "<question>" [--depth N] [--budget USD] \
#                        [--slug name] [--max-turns N]
#
# Env:
#   DEXTERS_LAB_CONFIG  explicit lab config path (else normal resolution)
#   CLAUDE_BIN          claude binary override (else `command -v claude`)
#
# Exit codes: 0 ok (or no-question usage, or paused, or budget halt),
#             1 bad config, 127 claude CLI absent.

set -u

# Argument guard FIRST, before any side effect. This script TAKES a question,
# so the guard is: with no question, or with -h/--help, print usage and exit 0
# WITHOUT launching the money-spending agent. --help must never start a run.
usage() {
  cat <<'USAGE'
lab_deep_research.sh: run grounded deep research via a headless `claude -p` agent.

Usage:
  lab_deep_research.sh "<question>" [--depth N] [--budget USD] [--slug name] [--max-turns N]

Given a question, this fans out web searches, fetches sources, adversarially
verifies each load-bearing claim, and writes a cited report (RESEARCH_REPORT.md)
plus a claims JSON (claims.json) under the config reviews_dir. Drafts only.
This step spends money on a headless agent, so it never runs without a real
question. Safety: kill switch at <lab_home>/pause, monthly budget cap via
bin/lab_budget.py. Needs the Claude Code CLI for WebSearch/WebFetch.

  --depth N       target sub-queries, 3 to 8 (default 5)
  --budget USD    hard cap for the optional heavy second opinion (default 4)
  --slug name     output directory name (default derived from the question)
  --max-turns N   headless turn cap (default 120)
USAGE
}

# No arguments at all, or a help flag in the first slot -> usage, exit 0.
if [ "$#" -eq 0 ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  usage
  exit 0
fi

QUESTION="$1"; shift
# A leading flag (no question) is also a usage case, not a run.
case "$QUESTION" in
  --*) usage; exit 0 ;;
esac
if [ -z "$QUESTION" ]; then
  usage
  exit 0
fi

# Schedulers (launchd especially) ship a bare PATH, so the claude CLI and
# homebrew python are invisible and the run dies before doing anything. Export
# the common bin dirs up front.
export PATH="$HOME/.local/bin:$HOME/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL="$REPO_ROOT/.claude/commands/lab-deep-research.md"
PYTHON="${LAB_PYTHON:-python3}"
LAB_BUDGET="$REPO_ROOT/bin/lab_budget.py"
CONSUMER="deep_research"

DEPTH=5
BUDGET=""
SLUG=""
MAX_TURNS=120

while [ $# -gt 0 ]; do
  case "$1" in
    --depth)     DEPTH="${2:-}"; shift 2 ;;
    --budget)    BUDGET="${2:-}"; shift 2 ;;
    --slug)      SLUG="${2:-}"; shift 2 ;;
    --max-turns) MAX_TURNS="${2:-}"; shift 2 ;;
    -h|--help)   usage; exit 0 ;;
    *) echo "lab_deep_research: unknown argument: $1" >&2; usage; exit 0 ;;
  esac
done

if [ ! -f "$SKILL" ]; then
  echo "lab_deep_research: skill file missing: $SKILL" >&2
  exit 1
fi

# --- Resolve lab config via the shared loader --------------------------------
CFG_LINES=$("$PYTHON" - "$REPO_ROOT" <<'PY'
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(sys.argv[1]) / "lib"))
import labconfig
cfg = labconfig.ensure_home()
print(cfg["reviews_dir"])
print(cfg.get("lab_home", ""))
print(cfg.get("budget", {}).get("monthly_cap_usd", ""))
print(cfg.get("budget", {}).get("spend_ledger", ""))
panel = cfg.get("openrouter", {}).get("panel_models_preference", []) or []
print(",".join(panel))
PY
)
RC=$?
if [ $RC -ne 0 ]; then
  echo "lab_deep_research: could not resolve lab config (set DEXTERS_LAB_CONFIG)" >&2
  exit 1
fi
REVIEWS_DIR=$(printf '%s\n' "$CFG_LINES" | sed -n 1p)
LAB_HOME=$(printf '%s\n' "$CFG_LINES" | sed -n 2p)
MONTHLY_CAP=$(printf '%s\n' "$CFG_LINES" | sed -n 3p)
SPEND_LEDGER=$(printf '%s\n' "$CFG_LINES" | sed -n 4p)
PANEL_MODELS=$(printf '%s\n' "$CFG_LINES" | sed -n 5p)
PAUSE_FILE="$LAB_HOME/pause"

# --- Kill switch -------------------------------------------------------------
if [ -n "$LAB_HOME" ] && [ -f "$PAUSE_FILE" ]; then
  echo "lab_deep_research: paused ($PAUSE_FILE present); exiting"
  exit 0
fi

# --- Budget governor (monthly cap; the run may spend on a heavy second opinion)
if [ -f "$LAB_BUDGET" ]; then
  if ! "$PYTHON" "$LAB_BUDGET" guard; then
    echo "lab_deep_research: budget cap reached; halting politely"
    exit 0
  fi
fi

# --- Defaults ----------------------------------------------------------------
if [ -z "$SLUG" ]; then
  CLEAN=$(printf '%s' "$QUESTION" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-')
  CLEAN="${CLEAN#-}"; CLEAN="${CLEAN%-}"
  # first ~6 dash-separated words, keeps the slug short
  CLEAN=$(printf '%s' "$CLEAN" | cut -d- -f1-6)
  SLUG="deepres-${CLEAN:-question}-$(date +%Y%m%d)"
fi
[ -z "$BUDGET" ] && BUDGET=4
# clamp depth to 3..8
case "$DEPTH" in
  ''|*[!0-9]*) DEPTH=5 ;;
  *) [ "$DEPTH" -lt 3 ] && DEPTH=3; [ "$DEPTH" -gt 8 ] && DEPTH=8 ;;
esac

OUTDIR="$REVIEWS_DIR/$SLUG"
mkdir -p "$OUTDIR"

echo "lab_deep_research: question: $QUESTION"
echo "lab_deep_research: depth: $DEPTH sub-queries; second-opinion budget ${BUDGET} USD (monthly lab cap: ${MONTHLY_CAP:-unset} USD)"
echo "lab_deep_research: spend ledger: ${SPEND_LEDGER:-unset}"
echo "lab_deep_research: output dir:   $OUTDIR"

# --- Locate the claude CLI; degrade gracefully if absent ----------------------
CLAUDE_BIN="${CLAUDE_BIN:-$(command -v claude || true)}"
if [ -z "$CLAUDE_BIN" ] || [ ! -x "$CLAUDE_BIN" ]; then
  echo "lab_deep_research: ERROR: the claude CLI was not found on PATH (and CLAUDE_BIN is not set)." >&2
  echo "lab_deep_research: deep research needs Claude Code for WebSearch and WebFetch." >&2
  echo "lab_deep_research: install Claude Code (https://docs.anthropic.com/claude-code), or run the" >&2
  echo "lab_deep_research: pipeline interactively with /lab-deep-research, or fill" >&2
  echo "lab_deep_research: templates/deep_research_workflow.template.js by hand. Nothing was run." >&2
  exit 127
fi

# --- Compose the headless prompt ----------------------------------------------
PROMPT_FILE="$OUTDIR/deep_research_prompt.txt"
{
  echo "You are running the Dexter's Lab deep-research pipeline HEADLESS."
  echo "You ARE the Claude for this run: use your own tools (WebSearch, WebFetch,"
  echo "Read, Write, Bash; load WebSearch/WebFetch via ToolSearch if deferred)."
  echo "Drafts only: write only under $OUTDIR. No DB writes, no email or Slack,"
  echo "no git, no deploy. NEVER fabricate a citation: no source, no claim."
  echo ""
  echo "=== PARAMETERS ==="
  echo "QUESTION: $QUESTION"
  echo "OUTDIR: $OUTDIR"
  echo "DEPTH: $DEPTH"
  echo "PANEL_BUDGET_USD: $BUDGET"
  echo "PANEL_MODELS: $PANEL_MODELS"
  echo "REPO_ROOT: $REPO_ROOT"
  echo ""
  echo "=== PROCEDURE (the /lab-deep-research skill; follow it, with the parameters above overriding argument parsing) ==="
  cat "$SKILL"
} > "$PROMPT_FILE"

# --- Run ----------------------------------------------------------------------
echo "lab_deep_research: starting headless research (max $MAX_TURNS turns)..."
OUT=$(cd "$OUTDIR" && "$CLAUDE_BIN" -p "$(cat "$PROMPT_FILE")" \
  --permission-mode acceptEdits --output-format json --max-turns "$MAX_TURNS" \
  2>"$OUTDIR/lab_deep_research_run.err")
RC=$?
printf '%s\n' "$OUT" > "$OUTDIR/lab_deep_research_run.json"

# --- Record session cost on the shared spend ledger ---------------------------
COST=$(printf '%s' "$OUT" | "$PYTHON" -c "
import json, sys
try:
    print(json.load(sys.stdin).get('total_cost_usd') or 0)
except Exception:
    print(0)
")
if [ -f "$LAB_BUDGET" ]; then
  "$PYTHON" "$LAB_BUDGET" record "$CONSUMER" "$COST" \
    "{\"rc\":$RC,\"slug\":\"$SLUG\"}" >/dev/null 2>&1 \
    || echo "lab_deep_research: lab_budget record failed (cost=$COST)" >&2
fi

if [ $RC -ne 0 ]; then
  echo "lab_deep_research: headless run FAILED (rc=$RC); see $OUTDIR/lab_deep_research_run.err" >&2
  exit $RC
fi

echo "lab_deep_research: done."
echo "lab_deep_research: report:  $OUTDIR/RESEARCH_REPORT.md"
echo "lab_deep_research: claims:  $OUTDIR/claims.json"
exit 0

#!/bin/bash
# lab_review.sh: headless entry for the Dexter's Lab deep-review pipeline.
#
# Feeds the lab-review skill text plus the paper path to a headless
# `claude -p` session. The session writes everything under the config's
# reviews_dir (drafts only: no git, no sends). Methodology in
# docs/REVIEW_PIPELINE.md.
#
# Usage:
#   lab_review.sh <paper-path> [--domain "..."] [--venue "..."] \
#                 [--budget USD] [--slug name] [--max-turns N]
#
# Env:
#   DEXTERS_LAB_CONFIG  explicit lab config path (else normal resolution)
#   CLAUDE_BIN          claude binary override (else `command -v claude`)
#
# Exit codes: 0 ok, 2 usage, 1 bad input/config, 127 claude CLI absent.

set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL="$REPO_ROOT/.claude/commands/lab-review.md"

usage() {
  echo "usage: lab_review.sh <paper-path> [--domain \"...\"] [--venue \"...\"] [--budget USD] [--slug name] [--max-turns N]" >&2
}

if [ $# -lt 1 ]; then
  usage
  exit 2
fi

PAPER="$1"; shift
DOMAIN=""
VENUE=""
BUDGET=""
SLUG=""
MAX_TURNS=120

while [ $# -gt 0 ]; do
  case "$1" in
    --domain)    DOMAIN="${2:-}"; shift 2 ;;
    --venue)     VENUE="${2:-}"; shift 2 ;;
    --budget)    BUDGET="${2:-}"; shift 2 ;;
    --slug)      SLUG="${2:-}"; shift 2 ;;
    --max-turns) MAX_TURNS="${2:-}"; shift 2 ;;
    -h|--help)   usage; exit 0 ;;
    *) echo "lab_review: unknown argument: $1" >&2; usage; exit 2 ;;
  esac
done

if [ ! -f "$PAPER" ]; then
  echo "lab_review: paper not found: $PAPER" >&2
  exit 1
fi
if [ ! -f "$SKILL" ]; then
  echo "lab_review: skill file missing: $SKILL" >&2
  exit 1
fi

# --- Resolve lab config via the shared loader --------------------------------
CFG_LINES=$(python3 - "$REPO_ROOT" <<'PY'
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(sys.argv[1]) / "lib"))
import labconfig
cfg = labconfig.ensure_home()
print(cfg["reviews_dir"])
print(cfg.get("budget", {}).get("monthly_cap_usd", ""))
print(cfg.get("budget", {}).get("spend_ledger", ""))
PY
)
RC=$?
if [ $RC -ne 0 ]; then
  echo "lab_review: could not resolve lab config (set DEXTERS_LAB_CONFIG)" >&2
  exit 1
fi
REVIEWS_DIR=$(printf '%s\n' "$CFG_LINES" | sed -n 1p)
MONTHLY_CAP=$(printf '%s\n' "$CFG_LINES" | sed -n 2p)
SPEND_LEDGER=$(printf '%s\n' "$CFG_LINES" | sed -n 3p)

# --- Defaults ----------------------------------------------------------------
if [ -z "$SLUG" ]; then
  BASE=$(basename "$PAPER")
  BASE="${BASE%.*}"
  CLEAN=$(printf '%s' "$BASE" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-')
  CLEAN="${CLEAN#-}"; CLEAN="${CLEAN%-}"
  SLUG="review-${CLEAN:-paper}-$(date +%Y%m%d)"
fi
[ -z "$BUDGET" ] && BUDGET=8
[ -z "$DOMAIN" ] && DOMAIN="(infer from the paper's abstract and state which you inferred)"
[ -z "$VENUE" ] && VENUE="a strong peer-reviewed venue in this field"

OUTDIR="$REVIEWS_DIR/$SLUG"
mkdir -p "$OUTDIR"

# --- Budget note -------------------------------------------------------------
echo "lab_review: panel budget ${BUDGET} USD (monthly lab cap: ${MONTHLY_CAP:-unset} USD)"
echo "lab_review: spend ledger: ${SPEND_LEDGER:-unset}"
echo "lab_review: output dir:   $OUTDIR"

# --- Locate the claude CLI; degrade gracefully if absent ----------------------
CLAUDE_BIN="${CLAUDE_BIN:-$(command -v claude || true)}"
if [ -z "$CLAUDE_BIN" ] || [ ! -x "$CLAUDE_BIN" ]; then
  echo "lab_review: ERROR: the claude CLI was not found on PATH (and CLAUDE_BIN is not set)." >&2
  echo "lab_review: install Claude Code (https://docs.anthropic.com/claude-code), or run the" >&2
  echo "lab_review: pipeline interactively with /lab-review, or fill" >&2
  echo "lab_review: templates/review_workflow.template.js by hand. Nothing was run." >&2
  exit 127
fi

# --- Compose the headless prompt ----------------------------------------------
PROMPT_FILE="$OUTDIR/review_prompt.txt"
{
  echo "You are running the Dexter's Lab deep-review pipeline HEADLESS."
  echo "You ARE the Claude for this run: use your own tools. Drafts only:"
  echo "write only under $OUTDIR. No git commands, no sends, no deploys."
  echo ""
  echo "=== PARAMETERS ==="
  echo "PAPER_PATH: $PAPER"
  echo "OUTDIR: $OUTDIR"
  echo "DOMAIN: $DOMAIN"
  echo "VENUE: $VENUE"
  echo "PANEL_BUDGET_USD: $BUDGET"
  echo "REPO_ROOT: $REPO_ROOT"
  echo ""
  echo "=== PROCEDURE (the /lab-review skill; follow it, with the parameters above overriding argument parsing) ==="
  cat "$SKILL"
} > "$PROMPT_FILE"

# --- Run ----------------------------------------------------------------------
echo "lab_review: starting headless review (max $MAX_TURNS turns)..."
OUT=$("$CLAUDE_BIN" -p "$(cat "$PROMPT_FILE")" \
  --permission-mode acceptEdits --output-format json --max-turns "$MAX_TURNS" \
  2>"$OUTDIR/lab_review_run.err")
RC=$?
printf '%s\n' "$OUT" > "$OUTDIR/lab_review_run.json"

# --- Record session cost on the lab spend ledger -------------------------------
if [ -n "${SPEND_LEDGER:-}" ]; then
  python3 - "$SPEND_LEDGER" "$SLUG" "$RC" "$OUTDIR/lab_review_run.json" <<'PY'
import json, sys, time
ledger, slug, rc, run_json = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
try:
    with open(run_json) as f:
        cost = json.load(f).get("total_cost_usd") or 0
except Exception:
    cost = 0
row = {"ts": time.strftime("%Y-%m-%dT%H:%M:%S"), "consumer": "lab_review",
       "slug": slug, "cost_usd": cost, "rc": int(rc)}
with open(ledger, "a") as f:
    f.write(json.dumps(row) + "\n")
PY
fi

if [ $RC -ne 0 ]; then
  echo "lab_review: headless run FAILED (rc=$RC); see $OUTDIR/lab_review_run.err" >&2
  exit $RC
fi

echo "lab_review: done."
echo "lab_review: report:  $OUTDIR/REFEREE_REPORT.md"
echo "lab_review: verdict: $OUTDIR/VERDICT_SUMMARY.json"
exit 0

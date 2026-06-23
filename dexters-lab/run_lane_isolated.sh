#!/bin/bash
# run_lane_isolated.sh — the "locked room" for Dexter's Lab claude -p lanes
# (operator entry 272; fixes the 2026-06-23 breach where the headless child inherited
# the repo CLAUDE.md and wrote a fake operator transcript into history/operator/).
#
# Runs lab_review.sh / lab_deep_research.sh from a CLEAN staging dir that contains the
# lab package + only the one input document + a fresh lab_home, and NO repo CLAUDE.md
# and NO history/. The child `claude -p` therefore has no governance file to inherit and
# no transcript area to wander into. Outputs are copied back to the repo afterward.
#
# Usage:
#   run_lane_isolated.sh <review|deep_research> <input-path-rel-to-repo> [--dry-run] [lane args...]
#
# Exit: 0 ok · 2 usage · 1 bad input · 3 staging not clean (guard tripped)
set -eu

[ $# -ge 2 ] || { echo "usage: run_lane_isolated.sh <review|deep_research> <input-path> [--dry-run] [lane args...]" >&2; exit 2; }
LANE="$1"; shift
INPUT="$1"; shift
DRY=0
if [ "${1:-}" = "--dry-run" ]; then DRY=1; shift; fi

REPO="$(cd "$(dirname "$0")/.." && pwd)"
case "$LANE" in
  review)        SCRIPT=lab_review.sh ;;
  deep_research) SCRIPT=lab_deep_research.sh ;;
  *) echo "lane must be 'review' or 'deep_research'" >&2; exit 2 ;;
esac
[ -f "$REPO/$INPUT" ] || { echo "input not found: $REPO/$INPUT" >&2; exit 1; }

STAGE="$(mktemp -d /tmp/dexlane.XXXXXX)"
trap 'rm -rf "$STAGE"' EXIT

# --- build the minimal isolated tree: lab package + the one input + fresh lab_home ----
mkdir -p "$STAGE/dexters-lab" "$STAGE/$(dirname "$INPUT")"
cp -r "$REPO/dexters-lab/bin" "$REPO/dexters-lab/lib" "$REPO/dexters-lab/.claude" \
      "$REPO/dexters-lab/templates" "$REPO/dexters-lab/lab.config.json" "$STAGE/dexters-lab/"
cp "$REPO/$INPUT" "$STAGE/$INPUT"

# --- GUARD: the staging tree must contain NO CLAUDE.md and NO history/ ----------------
LEAK="$(find "$STAGE" \( -iname 'CLAUDE.md' -o \( -type d -name 'history' \) \) 2>/dev/null || true)"
if [ -n "$LEAK" ]; then
  echo "ABORT (guard): staging tree is not clean — found:" >&2
  echo "$LEAK" >&2
  exit 3
fi
echo "locked-room: staging at $STAGE"
echo "locked-room: GUARD PASS — no CLAUDE.md, no history/ in the child's reach"

if [ "$DRY" = "1" ]; then
  echo "locked-room: --dry-run — staging tree:"
  find "$STAGE" -maxdepth 3 | sed "s#$STAGE#<stage>#" | sort
  echo "locked-room: dry run complete; the claude -p lane was NOT invoked."
  exit 0
fi

# --- run the lane from inside the staging dir (child cwd = $STAGE, no CLAUDE.md) -------
cd "$STAGE"
set +e
DEXTERS_LAB_CONFIG="$STAGE/dexters-lab/lab.config.json" \
  bash "$STAGE/dexters-lab/bin/$SCRIPT" "$INPUT" "$@"
RC=$?
set -e

# --- copy outputs back into the repo's lab_home -------------------------------------
SRC="$STAGE/dexters-lab/lab_home/reviews"
DST="$REPO/dexters-lab/lab_home/reviews"
if [ -d "$SRC" ]; then
  mkdir -p "$DST"; cp -r "$SRC/." "$DST/"
  echo "locked-room: outputs copied to $DST"
fi
echo "locked-room: done (rc=$RC). The repo CLAUDE.md/history were never in the child's tree."
exit $RC

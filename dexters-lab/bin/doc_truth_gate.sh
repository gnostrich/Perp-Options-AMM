#!/bin/bash
# doc_truth_gate.sh: fail when a results directory outruns the documentation.
#
# Usage: doc_truth_gate.sh <repo_path> <roadmap_file> [results_subdir]
#   repo_path      root of the project to check
#   roadmap_file   roadmap markdown file; absolute, or relative to repo_path.
#                  Must contain a 'Last updated' line with a YYYY-MM-DD date.
#   results_subdir results directory relative to repo_path
#                  (default: impl/bench/results)
#
# Exits nonzero if either:
#   (a) `git status --porcelain <results_subdir>/` shows uncommitted files
#       (modified, staged, or untracked). Skipped with a warning when
#       repo_path is not a git checkout.
#   (b) any file under <results_subdir>/ has an mtime newer than the
#       'Last updated' date in the roadmap AND its basename does not appear
#       anywhere in the roadmap.
#
# The mtime cutoff is end-of-day (23:59:59 local) of the 'Last updated' date,
# so files written on the documented day do not false-positive.
#
# Exit codes: 0 pass, 1 gate failure (prints what failed), 2 setup error.

set -u

if [ $# -lt 2 ]; then
    echo "usage: doc_truth_gate.sh <repo_path> <roadmap_file> [results_subdir]"
    exit 2
fi

REPO="$1"
ROADMAP_ARG="$2"
RESULTS_REL="${3:-impl/bench/results}"

case "$ROADMAP_ARG" in
    /*) ROADMAP="$ROADMAP_ARG" ;;
    *)  ROADMAP="$REPO/$ROADMAP_ARG" ;;
esac
ROADMAP_NAME="$(basename "$ROADMAP")"
RESULTS="$REPO/$RESULTS_REL"

if [ ! -d "$REPO" ]; then
    echo "doc_truth_gate: ERROR: repo not found: $REPO"
    exit 2
fi
if [ ! -f "$ROADMAP" ]; then
    echo "doc_truth_gate: ERROR: roadmap file not found: $ROADMAP"
    exit 2
fi
if [ ! -d "$RESULTS" ]; then
    echo "doc_truth_gate: ERROR: results dir not found: $RESULTS"
    exit 2
fi

fail=0

# --- (a) uncommitted files under the results dir ---
if git -C "$REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    porcelain="$(git -C "$REPO" status --porcelain "$RESULTS_REL/" 2>&1)"
    git_rc=$?
    if [ $git_rc -ne 0 ]; then
        echo "doc_truth_gate: ERROR: git status failed in $REPO:"
        echo "$porcelain"
        exit 2
    fi
    if [ -n "$porcelain" ]; then
        echo "FAIL (a): uncommitted files in $RESULTS_REL/:"
        echo "$porcelain"
        fail=1
    fi
else
    echo "doc_truth_gate: WARNING: $REPO is not a git checkout; uncommitted-files check (a) skipped"
fi

# --- (b) results files newer than the roadmap 'Last updated', undocumented ---
last_updated="$(grep -i -m1 'last updated' "$ROADMAP" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -1)"
if [ -z "$last_updated" ]; then
    echo "doc_truth_gate: ERROR: no 'Last updated' YYYY-MM-DD date found in $ROADMAP"
    exit 2
fi

# End-of-day cutoff. macOS (BSD date) first, GNU date fallback.
cutoff="$(date -j -f '%Y-%m-%d %H:%M:%S' "$last_updated 23:59:59" +%s 2>/dev/null)"
if [ -z "$cutoff" ]; then
    cutoff="$(date -d "$last_updated 23:59:59" +%s 2>/dev/null)"
fi
if [ -z "$cutoff" ]; then
    echo "doc_truth_gate: ERROR: cannot parse Last updated date '$last_updated'"
    exit 2
fi

while IFS= read -r -d '' f; do
    base="$(basename "$f")"
    mtime="$(stat -f %m "$f" 2>/dev/null || stat -c %Y "$f" 2>/dev/null)"
    if [ -z "$mtime" ]; then
        echo "doc_truth_gate: ERROR: cannot stat $f"
        exit 2
    fi
    if [ "$mtime" -gt "$cutoff" ]; then
        if ! grep -qF "$base" "$ROADMAP"; then
            mtime_h="$(date -r "$mtime" '+%Y-%m-%d %H:%M' 2>/dev/null || date -d "@$mtime" '+%Y-%m-%d %H:%M')"
            echo "FAIL (b): $RESULTS_REL/${f#"$RESULTS"/} (mtime $mtime_h) is newer than $ROADMAP_NAME 'Last updated' ($last_updated) and '$base' is not mentioned in $ROADMAP_NAME"
            fail=1
        fi
    fi
done < <(find "$RESULTS" -type f -print0)

if [ $fail -eq 0 ]; then
    echo "doc_truth_gate: PASS (results committed, nothing undocumented newer than $last_updated)"
fi
exit $fail

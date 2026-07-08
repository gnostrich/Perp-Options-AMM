#!/bin/sh
# vocab_gate.sh — controlled-vocabulary gate (operator entry 474, 2026-07-08).
# Registry + rationale: docs/VOCABULARY.md. Skeptic curates the banned list; manager owns this script.
#
# Banned: the "lean" (skew-sense) family + "curvature knob" (duplicate of steepness knob).
# NOT banned: "kurtosis knob" (operator-endorsed), the "Lean" prover / .lean files / app:lean refs,
#             and retired-lens words (skeptic's paper-sweep beat).
#
# Two scopes:
#   GATING   (exit 1 on any hit) = current deliverables: handover/, the submitted paper v2.tex,
#            and the engine HEAD user-visible strings.
#   ADVISORY (reported, exit 0)  = other paper drafts, specs/, docs/, notes/ (internal shorthand).
# history/ (verbatim operator transcripts) and docs/VOCABULARY.md are always excluded.
set -u
cd "$(dirname "$0")/../.." || exit 2

# lean family: case-SENSITIVE; leading class excludes a preceding alnum/./_/:/  so ".lean",
# "app:lean", "Seam.lean" and "clean" are NOT matched — only prose "curve leans" is.
BAN_LEAN='(^|[^[:alnum:]._:/])(lean|leans|leaning|leaned)([^[:alnum:]]|$)'
BAN_DUP='curvature knob'   # case-insensitive

# POSIX sh (run_all invokes via `sh`): space-separated path lists, no bash arrays. Paths have no spaces.
GATING_PROSE="handover paper/wine2026/temporal_wine2026_v2.tex"
ENGINE="engine/builds/HEAD_temporal_mvp_v28_lens.html"
ADVISORY_PATHS="paper specs docs notes"

fail=0

hits_in() {  # $@ = paths ; prose scan, EXCLUDES engine build snapshots (temporal_mvp_*.html)
  grep -rnEI  --include='*.md' --include='*.tex' --include='*.html' --exclude='temporal_mvp_*.html' -e "$BAN_LEAN" "$@" 2>/dev/null
  grep -rniEI --include='*.md' --include='*.tex' --include='*.html' --exclude='temporal_mvp_*.html' -e "$BAN_DUP"  "$@" 2>/dev/null
}

# Engine-file check: visible strings GATE, comments ADVISORY (identical rule for HEAD and any
# handover/ engine snapshot — resolves the engine/handover inconsistency).
check_engine_file() {
  ef="$1"
  [ -f "$ef" ] || return 0
  vis=$(grep -nE "$BAN_LEAN" "$ef" 2>/dev/null | grep -vE '^[0-9]+:[[:space:]]*(//|\*|/\*)')
  gating=$(printf '%s\n' "$vis" | grep -E '<(th|td|caption|label|option|button|h[1-6]|p|span|div)[ >]|title="[^"]*lean' | grep -v '^$')
  advis=$(grep -nE "$BAN_LEAN" "$ef" 2>/dev/null | grep -E '^[0-9]+:[[:space:]]*(//|\*|/\*)')
  if [ -n "$gating" ]; then echo "FAIL [engine-visible $ef] banned term in user-visible string:"; printf '%s\n' "$gating"; fail=1
  else echo "ok   [engine-visible $ef] clean"; fi
  [ -n "$advis" ] && { echo "note [engine-comments $ef] advisory (non-gating):"; printf '%s\n' "$advis"; }
}

echo "== vocab_gate (docs/VOCABULARY.md) =="

# ---- GATING: current prose deliverables ----
g=$(hits_in $GATING_PROSE | grep -v '^$')
if [ -n "$g" ]; then echo "FAIL [deliverable-prose] banned vocabulary:"; printf '%s\n' "$g"; fail=1
else echo "ok   [deliverable-prose] clean"; fi

# ---- GATING: engine files — HEAD + any handover/ snapshot (visible strings gate, comments advisory)
check_engine_file "$ENGINE"
for snap in handover/temporal_mvp_*.html; do
  [ -f "$snap" ] && check_engine_file "$snap"
done

# ---- ADVISORY: internal artifacts (reported, never fails the gate) ----
a=$(hits_in $ADVISORY_PATHS 2>/dev/null \
    | grep -v '^$' \
    | grep -vE '(^|/)(temporal_wine2026_v2\.tex):' \
    | grep -vE 'docs/VOCABULARY\.md:')
[ -n "$a" ] && { echo "note [advisory-internal] $(printf '%s\n' "$a" | wc -l | tr -d ' ') hit(s) to clean over time (skeptic-curated for shared-truth docs); not gating."; }

echo "== vocab_gate: $([ $fail -eq 0 ] && echo PASS || echo FAIL) =="
exit $fail

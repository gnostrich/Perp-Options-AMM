#!/usr/bin/env bash
# ============================================================================
# FILE-SAFETY GATE  —  PostToolUse hook (matcher: Edit|Write|MultiEdit)
# ----------------------------------------------------------------------------
# The Temporal engine HTML carries two base64 blobs (bg webp ~274KB @ line 74,
# logo svg ~5KB @ line 1060) and three <script> blocks parsed via `new Function`.
# Touching them naively destroys a session and can silently corrupt the build.
#
# When an engine HTML file is edited, this gate:
#   1. re-verifies the two blob anchors by LINE-layer md5 (sed -n 'Np'|md5sum =
#      ab663f5c/c505b08a). NB: 8d2e1a84/1b320fc5 is just the DECODE of these same
#      blobs (one artifact, three layers) — not a "minified broken cut," nothing to restore.
#   2. confirms the three <script> blocks parse (new Function round-trip),
#   3. runs the regression + gate harness (engine/verify/run_all.sh) on the file.
# On ANY failure it BLOCKS (exit 2) and feeds the diagnostic back to the agent.
# Do NOT patch toward green; do NOT merge. A regression is a finding.
#
# Blob CONTENT never enters output — only line numbers, lengths, md5s, PASS/FAIL.
# This is the real guardrail; the permission allow-list is intentionally wide.
# ============================================================================
set -uo pipefail

PROJ="${CLAUDE_PROJECT_DIR:-$(pwd)}"
WEBP_MD5="ab663f5c26f2a461c5b0ef1421d0ad74"   # bg webp blob (line ~74, len 273917)
SVG_MD5="c505b08ad0e4c6b0fb9e64e9679fe291"    # logo svg blob (line ~1060, len 5240)

INPUT="$(cat)"
FILE="$(printf '%s' "$INPUT" | python3 -c '
import json,sys
try: d=json.load(sys.stdin)
except Exception: print(""); sys.exit(0)
ti=d.get("tool_input",{}) or {}
print(ti.get("file_path") or ti.get("filePath") or "")')"

[ -z "${FILE:-}" ] && exit 0
case "$FILE" in
  /*) ABS="$FILE" ;;
  *)  ABS="$PROJ/$FILE" ;;
esac

# Act only on engine HTML (the blob-bearing simulator builds).
is_engine=0
case "$ABS" in */engine/*.html) is_engine=1 ;; esac
case "$(basename "$ABS")" in temporal_mvp*.html) is_engine=1 ;; esac
[ "$is_engine" = 1 ] || exit 0
[ -f "$ABS" ] || exit 0

block() {
  # $1 = short reason. Print human diagnostic to stderr + structured block to stdout, exit 2.
  printf '\n🛑 FILE-SAFETY GATE — engine edit REJECTED\n   %s\n' "$1" 1>&2
  printf '   Do NOT patch toward green; do NOT merge. Re-derive against geometry, fix the\n' 1>&2
  printf '   splice (on-disk Python, assert each anchor fires once), or revert. See\n' 1>&2
  printf '   engine/splices/SPLICE_METHOD.md and engine/GOTCHAS.md.\n' 1>&2
  printf '{"decision":"block","reason":%s}\n' \
    "$(python3 -c 'import json,sys;print(json.dumps("FILE-SAFETY GATE failed: "+sys.argv[1]))' "$1")"
  exit 2
}

# --- 1) Blob anchors: any line > 2000 chars must be exactly one of the two canonical
#        blobs; their md5 multiset must equal {webp, svg}. (content never printed) ----
BLOBRES="$(python3 - "$ABS" "$WEBP_MD5" "$SVG_MD5" <<'PY'
import sys, hashlib
path, webp, svg = sys.argv[1], sys.argv[2], sys.argv[3]
found = {}
with open(path, 'rb') as f:
    for i, line in enumerate(f, 1):
        if len(line) > 2000:                      # blob threshold (max code line ~553)
            h = hashlib.md5(line).hexdigest()     # sed -n 'Np'|md5sum equivalent (incl \n)
            found.setdefault(h, []).append((i, len(line.rstrip(b"\n"))))
report = [f"  md5={k}  line={v[0][0]}  len={v[0][1]}  count={len(v)}" for k, v in found.items()]
ok = (set(found) == {webp, svg}) and all(len(v) == 1 for v in found.values())
print("OK" if ok else "FAIL")
if not ok:
    print(f"  want exactly two blobs: {webp} (webp), {svg} (svg)")
print("\n".join(report))
PY
)"
printf '%s' "$BLOBRES" | head -1 | grep -q '^OK' || { printf '%s\n' "$BLOBRES" 1>&2; \
  block "blob anchor LINE-md5 mismatch / missing / duplicated. Canonical = ab663f5c/c505b08a (line layer); 8d2e1a84/1b320fc5 is their decode, not a separate set."; }

# --- 2) Three <script> blocks must parse (and contain no blob-sized line) -----------
PARSE="$(node - "$ABS" <<'JS'
const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const re = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
let m, n = 0; const bad = [];
while ((m = re.exec(html))) {
  n++; const body = m[1];
  const longest = body.split('\n').reduce((a, l) => Math.max(a, l.length), 0);
  if (longest > 50000) { bad.push(`script#${n}: a line is ${longest} chars (blob-in-script?)`); continue; }
  try { new Function(body); } catch (e) { bad.push(`script#${n} parse error: ${e.message}`); }
}
if (n !== 3) bad.push(`expected 3 <script> blocks, found ${n}`);
if (bad.length) { console.log("FAIL"); bad.forEach(b => console.log("  " + b)); process.exit(1); }
console.log("OK  3 <script> blocks parse, engine IIFE region intact");
JS
)"
printf '%s' "$PARSE" | head -1 | grep -q '^OK' || { printf '%s\n' "$PARSE" 1>&2; \
  block "a <script> block failed to parse (new Function round-trip) or a blob leaked into a script."; }

# --- 3) Regression + gate harness against the EDITED file ---------------------------
if [ -f "$PROJ/engine/verify/run_all.sh" ]; then
  HARNESS="$(cd "$PROJ/engine" && sh verify/run_all.sh "$ABS" 2>&1)"; RC=$?
  if [ "$RC" -ne 0 ] || printf '%s' "$HARNESS" | grep -Eq 'FAIL|MISMATCH|Cannot|TypeError|ReferenceError|SyntaxError'; then
    printf '%s\n' "$HARNESS" | grep -Ei 'FAIL|MISMATCH|GATES|CHECK|Error|want ' | head -40 1>&2
    block "regression/gate harness did not pass (engine/verify/run_all.sh). curveTrace/gates/slippage regressed."
  fi
fi

printf '✅ FILE-SAFETY GATE PASS — blobs intact (%s… / %s…), 3 scripts parse, gates green: %s\n' \
  "${WEBP_MD5:0:8}" "${SVG_MD5:0:8}" "$(basename "$ABS")"
exit 0

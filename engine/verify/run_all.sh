#!/bin/sh
# Validate a build: integrity (md5 + blobs) + parse/gates + slope finding + slippage.
# Run from the engine/ package root:  sh verify/run_all.sh [path-to-build.html]
# With no arg it validates the canonical HEAD; the file-safety hook passes the edited file.
set -e
HEAD=${1:-builds/HEAD_temporal_mvp_v26b.html}
echo "================ integrity ================"
echo -n "whole-file md5 (want 8df9f8a3cb705282a5348ce778f9eb82): "; md5sum "$HEAD" | awk '{print $1}'
echo -n "blob 74  (want ab663f5c26f2a461c5b0ef1421d0ad74): "; sed -n '74p'   "$HEAD" | md5sum | awk '{print $1}'
echo -n "blob 1060 (want c505b08ad0e4c6b0fb9e64e9679fe291): "; sed -n '1060p' "$HEAD" | md5sum | awk '{print $1}'

# verifiers read fixed filenames in cwd -> stage HEAD under the names they expect
SCRATCH=$(mktemp -d)
cp "$HEAD" "$SCRATCH/temporal_mvp_v26a.html"
cp "$HEAD" "$SCRATCH/temporal_mvp_v26a_2c0337e8.html"
cp "$HEAD" "$SCRATCH/temporal_mvp_v26b_itm.html"   # seam gate reads this name
cp verify/*.js "$SCRATCH/"
cd "$SCRATCH"

echo "\n================ 7 GH gates + curveTrace + marker (verify_v26a_mine.js) ================"
node verify_v26a_mine.js | grep -E "gates g=|blob-in-script|all parse|sigs|IIFE|curveTrace|marker|GATES"

echo "\n================ getMP_raw = e^ghMu * |dy/dx|  (slope_test.js) ================"
node slope_test.js | grep -E "g=|ratio"

echo "\n================ slippage acceptance targets (slip_accept.js) ================"
node slip_accept.js

echo "\n================ SPLICE-LEVEL: actual spliced functions vs targets (splice_level_check.js) ================"
node splice_level_check.js temporal_mvp_v26a.html

echo "\n================ SEAM GATE — v26b ITM/American (value+slope <=0.15% AND directional) [HARD GATE] ================"
node seam_gate.js temporal_mvp_v26b_itm.html   # set -e => nonzero exit aborts run_all

echo "\n================ DIR GATE — v26c strike-registration (crossover@K + directional consistency) [HARD GATE] ================"
node dir_gate.js temporal_mvp_v26b_itm.html    # set -e => nonzero exit aborts run_all; SKIPs as pass pre-v26c

echo "\nAll checks above should be green. (Lean = trusted-from-prover; UI = tester-confirmed.)"

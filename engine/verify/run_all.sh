#!/bin/sh
# Validate a build: integrity (md5 + blobs) + parse/gates + slope finding + slippage.
# Run from the engine/ package root:  sh verify/run_all.sh [path-to-build.html]
# With no arg it validates the canonical HEAD; the file-safety hook passes the edited file.
set -e
HEAD=${1:-builds/HEAD_temporal_mvp_v27_wkurtosis.html}
echo "================ integrity ================"
echo -n "whole-file md5 (want b245bfda6a493af0a7017309f1acd3f3 for v27 HEAD; 6cc73563779a3e030774b7597d0ae187 for demoted GH v26c): "; md5sum "$HEAD" | awk '{print $1}'
echo -n "blob 74  (want ab663f5c26f2a461c5b0ef1421d0ad74): "; sed -n '74p'   "$HEAD" | md5sum | awk '{print $1}'
echo -n "blob 1060 (want c505b08ad0e4c6b0fb9e64e9679fe291): "; sed -n '1060p' "$HEAD" | md5sum | awk '{print $1}'

# ── Build-type dispatch (HEAD = v27 (W)-curve since 2026-06-10, operator entry 28) ──
# (W)/pre-GH builds (no ghCalibrate) are gated by the wcurve selfcheck [HARD GATE,
# exit 1 on any FAIL: 12 core + 9 strong-form-warp checks]. GH builds (ghCalibrate
# present, e.g. builds/temporal_mvp_v26c.html) fall through to the full GH suite.
if ! grep -q "ghCalibrate" "$HEAD"; then
  echo ""
  echo "================ (W)-curve build -> wcurve_selfcheck.js [HARD GATE] ================"
  node verify/wcurve_selfcheck.js "$HEAD"
  echo ""
  echo "(W) build green. (GH suite N/A here; pass a GH build path explicitly to exercise it.)"
  exit 0
fi

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

# ── FAITH GATES (engine-faithfulness pivot, operator-ordered 2026-06-10) ──
# Hold the LIVE engine to the PROVEN constructs (formal/INDEX.md). Each gate is
# negative-controlled (--mutate flips the checked relation -> exit 1) and SKIPs
# as pass only on a pre-GH build (no ghCalibrate). set -e => any red aborts.
echo "\n================ FAITH 1 — trade = Esscher tilt translation, slope=P*e^(u-mu) (faith_esscher.js) [HARD GATE] ================"
node faith_esscher.js temporal_mvp_v26b_itm.html

echo "\n================ FAITH 2 — rebase = gauge move, sNorm-quantities invariant (faith_rebase.js) [HARD GATE] ================"
node faith_rebase.js temporal_mvp_v26b_itm.html

echo "\n================ FAITH 3 — C3 mark reflection: put = reflected call (faith_reflection.js) [HARD GATE] ================"
node faith_reflection.js temporal_mvp_v26b_itm.html

echo "\n================ FAITH 4 — gamma<->vol tie: Merton root structure + (gamma, sigma_eff) pins (faith_merton.js) [HARD GATE] ================"
node faith_merton.js temporal_mvp_v26b_itm.html

echo "\n================ FAITH 5 — curvature = variance (cgf''=Var=Fisher), engine shadow (faith_fisher.js) [HARD GATE] ================"
node faith_fisher.js temporal_mvp_v26b_itm.html

echo "\nAll checks above should be green. (Lean = trusted-from-prover; UI = tester-confirmed.)"

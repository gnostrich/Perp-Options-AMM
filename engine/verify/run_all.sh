#!/bin/sh
# Validate a build: integrity (md5 + blobs) + parse/gates + slope finding + slippage.
# Run from the engine/ package root:  sh verify/run_all.sh [path-to-build.html]
# With no arg it validates the canonical HEAD; the file-safety hook passes the edited file.
set -e
HEAD=${1:-builds/HEAD_temporal_mvp_v28_lens.html}
echo "================ integrity ================"
echo -n "whole-file md5 (want 80f050e26332d21c68bd7b064467470a for v28-lens HEAD (constant slope-multiplier m, entries 229/231; comment-cleanup of 8f897edc 2026-06-13 — behaviorally identical, comments+gate-detector only; constmult source 8f897edc retained as temporal_mvp_v28_lens_constmult.html; inverse-lens 5fea0e8d as temporal_mvp_v28_lens_invtx.html); 928cde1cccb0f35fdc9a23a7634414c8 for demoted v27 (W); 6cc73563779a3e030774b7597d0ae187 for demoted GH v26c): "; md5sum "$HEAD" | awk '{print $1}'
# Blob check is LINE-AGNOSTIC (the two longest lines ARE the blobs; their line numbers may
# shift with edits above them — v27 svg moved 1060->1064 — but the line-md5s are canonical).
BLOBQ=$(awk '{print length($0), NR}' "$HEAD" | sort -nr | head -2 | while read len nr; do sed -n "${nr}p" "$HEAD" | md5sum | awk '{print $1}'; done | sort | tr '\n' ' ')
echo "blob line-md5 multiset (want ab663f5c26f2a461c5b0ef1421d0ad74 c505b08ad0e4c6b0fb9e64e9679fe291): $BLOBQ"
[ "$BLOBQ" = "ab663f5c26f2a461c5b0ef1421d0ad74 c505b08ad0e4c6b0fb9e64e9679fe291 " ] || { echo "BLOB CHECK FAILED"; exit 1; }

# ── v28 POLAR-LENS dispatch (Stage 1 read layer / Stage 2 write-settle) ──
# A lens build exports markLensed/gLoc (off the plain v24 base; no ghCalibrate,
# no wField). Gate it with lens_selfcheck.js [HARD GATE]: the Stage-1 read checks
# (14) plus the Stage-2 write/settle checks (8) when the build carries the lensed
# settlement signatures (markEff 4-arg). SKIPs the Stage-2 block on a Stage-1-only
# build. Routed BEFORE the (W) branch since lens builds also lack ghCalibrate.
if grep -q "function markLensed" "$HEAD" && ! grep -q "function wField" "$HEAD"; then
  echo ""
  echo "================ v28 polar-lens build -> lens_selfcheck.js [HARD GATE] ================"
  node verify/lens_selfcheck.js "$HEAD"
  echo ""
  echo "================ A16 no-jump ATM position-value gate -> a16_atm_gate.js [HARD GATE] ================"
  # Locks the live held-position value path (markEff/legValueUnified/pfComponents
  # via markLensed) continuous across the OTM↔ITM (ATM g_loc→0) crossing — no jump,
  # no regime branch in the value. Distinct from lens_selfcheck (4) (the S* seam).
  # SKIPs-as-pass on a non-lens build. set -e => any FAIL aborts run_all.
  node verify/a16_atm_gate.js "$HEAD"
  echo ""
  # ════════════════ REPORT-ONLY (NOT GATING) ════════════════
  # monolith_consistency.js — ACTIVE theory↔impl consistency layer (operator
  # entries 243/153#9; skeptic R6 scope-gate a04465ae WITH RIDERS). Cross-checks
  # the engine's NUMBERS against the monolith Lean formulas (MonolithConstM.lean)
  # and prints a `Lean thm ⟺ engine — PASS/FAIL` table tagged per line.
  # ⚠ THIS IS NOT A HARD GATE. It EXITS 0 ALWAYS (the `|| true` belt-and-braces
  # ensures it can NEVER abort run_all's `set -e`). The HARD gates above
  # (lens_selfcheck 13 + a16_atm_gate 5) are the bar; a green report line here
  # is NOT the gate (#5/#6/#8 are table-marked already-HARD-via-CM# cross-refs).
  # Honest ceiling: cross-checks NUMBERS (engine ⟺ Lean formula); does NOT make
  # Lean "verified" and does NOT prove the engine IS the Lean object.
  echo "================ REPORT-ONLY (NOT GATING) — monolith_consistency.js (engine ⟺ Lean numbers) ================"
  node verify/monolith_consistency.js "$HEAD" || true
  echo ""
  echo "lens build green. (GH/(W) suites N/A here. Monolith table above is REPORT-ONLY, not a gate.)"
  exit 0
fi

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

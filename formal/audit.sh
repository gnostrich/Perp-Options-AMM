#!/usr/bin/env bash
# Independent mechanical audit. Run from inside temporal_lean_verified/.
# Takes nobody's word: scans source for every known soundness-escape token.
set -u
LEAN="RequestProject/AMMCurve.lean RequestProject/Temporal.lean RequestProject/Seam.lean"
echo "### 1. forbidden-token scan (expect 0 except 'sorry' in ONE comment in Temporal.lean)"
for tok in sorry admit native_decide sorryAx opaque unsafe '@\[implemented_by' '@\[extern' Classical.arbitrary False.elim; do
  printf "  %-22s : %s\n" "$tok" "$(grep -rEn "$tok" $LEAN | wc -l)"
done
echo
echo "### 2. real 'axiom' DECLARATIONS (expect 0 -- obligation fields are struct fields, not axioms)"
grep -rEn '^\s*axiom\b' $LEAN | wc -l
echo
echo "### 3. show every line containing sorry/admit/axiom for eyeball"
grep -rEn "sorry|admit|\baxiom\b|native_decide" $LEAN || echo "  (none)"
echo
echo "### 4. obligation fields are HYPOTHESES (struct fields), confirm they live inside structures"
echo "  -- B1/B3/B4 in TemporalAMM:"
grep -nE "arb_nonneg|ledger|solvent" RequestProject/Temporal.lean | sed -n '1,6p'
echo "  -- the gate fields in AMMCurve:"
grep -nE "antitone_y|convex_y|coercive" RequestProject/AMMCurve.lean | sed -n '1,3p'
echo
echo "### 5. toolchain"
cat lean-toolchain
grep -A1 '"mathlib"' lake-manifest.json | grep -i rev || true
echo
echo "### 6. to verify compilation + axioms yourself:"
echo "   elan toolchain install leanprover/lean4:v4.28.0   # if needed"
echo "   lake exe cache get        # fetch prebuilt Mathlib (avoids hours of build)"
echo "   lake build                # expect 0 errors"
echo "   lake build RequestProject.Audit   # prints #print axioms for all key results"

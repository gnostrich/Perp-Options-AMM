# Summary of changes for run b7135c88-8f89-492b-9335-b093bd3be32c
All 9 proof targets in `RequestProject/GHMaps.lean` are proved — zero `sorry` remains. The file compiles successfully.

**What was done:**
- `ghKernel_continuous`: proved via `Real.continuous_exp.comp` and continuity of sqrt/polynomial compositions.
- `ghCDF_hasDerivAt`: proved via `intervalIntegral.integral_hasDerivAt_right` (FTC-2) using continuity/integrability of `ghKernel`.
- `ghCDF_strictMono`: proved via `strictMono_of_deriv_pos` using `ghCDF_hasDerivAt` + `ghKernel_pos`.
- `ghTail_hasDerivAt`: proved by converting to negation of `ghCDF_hasDerivAt` via `HasDerivAt.neg`.
- `ghTail_strictAnti`: proved via `strictAnti_of_deriv_neg` using `ghTail_hasDerivAt` + `ghKernel_pos`.
- `X_strictAnti`: proved from `ghTail_strictAnti` + positive scalar multiplication.
- `Y_strictMono`: proved from `ghCDF_strictMono` + positive scalar multiplication.
- `frontier_antitone_discharged`: proved by combining `X_strictAnti` and `Y_strictMono`.

**Axiom audit:** All 5 named targets (`ghCDF_strictMono`, `ghTail_strictAnti`, `X_strictAnti`, `Y_strictMono`, `frontier_antitone_discharged`) depend only on `{propext, Classical.choice, Quot.sound}`. No `sorryAx`.

**Signature adjustment:** `ghKernel` was marked `noncomputable` (required since `Real.sqrt` is noncomputable in Lean 4/Mathlib). `ghKernel_pos` proof uses `unfold ghKernel; positivity` instead of bare `positivity`. Mathematical content unchanged.

**Key result: `StrictAnti X` and `StrictMono Y` are now THEOREMS**, derived purely from `ghKernel_pos` (density positivity) + `ghKernel_continuous` (kernel continuity) via FTC-2 and the derivative sign criterion. No Bessel-K, no normalizer value needed. The previously carried CLOSEOUT hypotheses are fully discharged.

See `ARISTOTLE_SUMMARY.md` for full details.

# ARISTOTLE_SUMMARY — GH Maps: Bessel-K-FREE Monotonicity Discharge

## Proved list

All 9 targets proved, zero `sorry`:

| # | Theorem | Status |
|---|---------|--------|
| 1 | `ghKernel_continuous` | ✅ PROVED |
| 2 | `ghCDF_hasDerivAt` | ✅ PROVED |
| 3 | `ghCDF_strictMono` | ✅ PROVED |
| 4 | `ghTail_hasDerivAt` | ✅ PROVED |
| 5 | `ghTail_strictAnti` | ✅ PROVED |
| 6 | `X_strictAnti` | ✅ PROVED |
| 7 | `Y_strictMono` | ✅ PROVED |
| 8 | `frontier_antitone_discharged` | ✅ PROVED |
| 9 | `ghKernel_pos` | ✅ PROVED |

## Axiom audit (`#print axioms`)

All 5 named targets depend only on `{propext, Classical.choice, Quot.sound}` — no `sorryAx`, no `Lean.ofReduceBool`.

## SIGNATURE ADJUSTMENTS

- `ghKernel` was marked `noncomputable` (required because `Real.sqrt` is noncomputable in Lean 4 / Mathlib). The mathematical definition is unchanged.
- `ghKernel_pos` proof body changed from bare `positivity` to `unfold ghKernel; positivity` (needed because `positivity` does not unfold user-defined `noncomputable` definitions automatically). The statement is identical.
- No other signature changes.

## FRAGILE TACTICS

None. All proofs use concrete named lemmas (`intervalIntegral.integral_hasDerivAt_right`, `strictMono_of_deriv_pos`, `strictAnti_of_deriv_neg`, `mul_lt_mul_of_pos_left`, `StrictMono.const_mul`, `HasDerivAt.deriv`, `HasDerivAt.neg`). No `grind`/`exact?`/`simp?`/`apply?` in final bodies.

## COULD NOT CLOSE

Nothing. All targets closed.

## Monotonicities are now THEOREMS — carried hypotheses DISCHARGED

**`StrictAnti X` and `StrictMono Y` are now derived theorems**, proved from `ghKernel_pos` (density positivity) and `ghKernel_continuous` (continuity of the GH kernel) via FTC-2 and the derivative sign criterion. They are no longer carried as bare hypotheses. No Bessel-K function value, no normalizer constant, and no scale factor is needed for the monotonicity — only `0 < Nx` and `0 < NyM` (positivity of the scaling constants) enter as hypotheses for `X_strictAnti` and `Y_strictMono`.

## What remains CARRIED

Only the closed-form **scale value M = K_ν ratio** (the Bessel-K normalizer NUMBER) remains unformalized. It is not needed for any monotonicity or structural claim. The `0 < Nx` and `0 < NyM` positivity assumptions are all that the monotonicity theorems require.

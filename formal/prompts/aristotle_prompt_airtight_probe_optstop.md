# AIRTIGHT capability probe — optimal stopping / Snell envelope / free boundary in Mathlib v4.28.0

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Purpose
This is a CAPABILITY PROBE, not a theorem to prove. I need an honest inventory of what
optimal-stopping / free-boundary / variational-inequality machinery exists in Mathlib v4.28.0,
so I know whether the American-option "smooth-pasting = optimal exercise" claim can be GENERATED
in Lean or must be CARRIED as a standard free-boundary principle.

## What I need you to report (in ARISTOTLE_SUMMARY.md)
For EACH of the following, state EXISTS / DOES NOT EXIST in Mathlib v4.28.0, with the exact
declaration name + namespace if it exists (and the module path), or "no declaration found" if not:

1. **Snell envelope** — `snellEnvelope`, `MeasureTheory.snell`, anything named `Snell`,
   the smallest supermartingale dominating a process.
2. **Optional stopping theorem** — `optional_stopping`, `Submartingale.expected_stoppedValue_mono`,
   `MeasureTheory.optionalStopping`, stopped-process / `stoppedValue` API.
3. **Hitting times / `hitting`** — `MeasureTheory.hitting`, first-entry times of a stochastic process.
4. **Optimal stopping value / reward** — any `optimalStopping`, optimal-stopping-time existence,
   essential-supremum-over-stopping-times reward function.
5. **Variational inequality / obstacle problem** — `VariationalInequality`, `obstacleProblem`,
   anything stating `min(Lu, u−ψ)=0` or a free-boundary / obstacle formulation.
6. **Free boundary** — any `freeBoundary` API, smooth-pasting/`smoothFit`, `C1` value-matching
   for an obstacle problem.
7. **Convexity / first-order optimality on ℝ** that I CAN lean on as a fallback: confirm
   `ConvexOn`, `StrictConvexOn`, `IsMinOn`, `isMinOn_iff`, `inner_le_iff`, and the fact that for a
   differentiable convex/concave function on ℝ a stationary point is a global optimum
   (`StrictConvexOn.isMinOn` / `IsMinOn` from `HasDerivAt _ 0`) EXIST — name them.
8. **`exp`-family value structure**: confirm `Real.rpow`, `Real.hasDerivAt_rpow_const`,
   `ProbabilityTheory.cgf`, `ProbabilityTheory.mgf` EXIST (you have used these before).

## Method
Write a small Lean file `RequestProject/Probe.lean` that `import Mathlib` and contains, for each
candidate declaration, a line like:
```
#check @MeasureTheory.hitting   -- or comment "NOT FOUND" if it errors
```
Try the real names. If a `#check` errors, REMOVE it (so the file compiles) and record in
ARISTOTLE_SUMMARY.md that the name was not found / the correct name you discovered instead.
The DELIVERABLE is the capability inventory in ARISTOTLE_SUMMARY.md, plus a compiling Probe.lean
containing the `#check`s that DID resolve. Do not invent declarations.

## Output spec
- `RequestProject/Probe.lean` compiles (only resolved `#check`s remain).
- ARISTOTLE_SUMMARY.md: the 8-point inventory above, EXISTS/NOT with exact names + module paths.
- Do NOT touch `RequestProject.lean`, `lakefile.toml`, `lean-toolchain`.

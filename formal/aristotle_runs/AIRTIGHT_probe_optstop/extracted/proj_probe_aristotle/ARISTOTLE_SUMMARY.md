# Summary of changes for run 0f686256-9776-4320-912b-30deaa26164b
## Capability Probe Complete

### Deliverables
- **`RequestProject/Probe.lean`** — compiles cleanly with all resolved `#check` statements (items that don't exist were removed and noted in comments).
- **`ARISTOTLE_SUMMARY.md`** — full 8-point inventory with EXISTS / DOES NOT EXIST verdicts, exact declaration names, module paths, and a feasibility summary.

### Key Findings

| Component | Status |
|---|---|
| **Snell envelope** | ❌ Does not exist |
| **Optional stopping theorem** | ✅ Exists — `Submartingale.expected_stoppedValue_mono`, `Martingale.stoppedValue_ae_eq_condExp_of_le`, `stoppedValue` def |
| **Hitting times** | ✅ Exists — `hittingBtwn`, `hittingAfter` (note: old `hitting` was refactored) |
| **Optimal stopping value/reward** | ❌ Does not exist |
| **Variational inequality / obstacle problem** | ❌ Does not exist |
| **Free boundary / smooth pasting** | ❌ Does not exist |
| **Convexity / first-order optimality** | ✅ Exists — `ConvexOn`, `StrictConvexOn`, `IsMinOn`, `isMinOn_iff`, `IsMinOn.of_isLocalMinOn_of_convexOn`, etc. (`inner_le_iff` not found; `StrictConvexOn.isMinOn` not a direct lemma) |
| **exp-family (rpow/mgf/cgf)** | ✅ Exists — `Real.rpow`, `HasDerivAt.rpow_const`, `ProbabilityTheory.mgf`, `ProbabilityTheory.cgf` |

**Bottom line:** Mathlib v4.28.0 has stochastic-process plumbing (stopping times, optional stopping, hitting times) but **no optimal-stopping superstructure** (Snell envelope, optimal stopping value, variational inequalities, free boundaries, smooth pasting). The American-option smooth-pasting claim must be carried as an assumption or built from scratch. See `ARISTOTLE_SUMMARY.md` for full details.

# Capability Probe: Optimal Stopping / Free Boundary in Mathlib v4.28.0

Toolchain: Lean 4.28.0, Mathlib v4.28.0.
Probe file: `RequestProject/Probe.lean` (compiles cleanly).

---

## 1. Snell Envelope

**DOES NOT EXIST.**

No declaration named `snellEnvelope`, `MeasureTheory.snell`, or containing `Snell` was found.
There is no formalization of the smallest supermartingale dominating a given adapted process.

---

## 2. Optional Stopping Theorem / Stopped-Process API

**EXISTS** (partial).

| Declaration | Module |
|---|---|
| `MeasureTheory.stoppedValue` (def) | `Mathlib.Probability.Process.Stopping` |
| `MeasureTheory.Submartingale.expected_stoppedValue_mono` (theorem) | `Mathlib.Probability.Martingale.OptionalStopping` |
| `MeasureTheory.Martingale.stoppedValue_ae_eq_condExp_of_le` (theorem) | `Mathlib.Probability.Martingale.OptionalSampling` |

The optional stopping theorem is present in two flavors:
- **OptionalStopping**: `Submartingale.expected_stoppedValue_mono` — for a submartingale with bounded stopping times τ ≤ σ, `𝔼[f_τ] ≤ 𝔼[f_σ]`.
- **OptionalSampling**: `Martingale.stoppedValue_ae_eq_condExp_of_le` — the stopped value of a martingale equals the conditional expectation of a later stopped value (requires `[Countable ι]`).

Additional variants exist with `_of_countable_range` and `_of_le_const` suffixes.

---

## 3. Hitting Times

**EXISTS.**

| Declaration | Module |
|---|---|
| `MeasureTheory.hittingBtwn` (def) | `Mathlib.Probability.Process.HittingTime` |
| `MeasureTheory.hittingAfter` (def) | `Mathlib.Probability.Process.HittingTime` |

- `hittingBtwn u s n m ω` = first time `i ∈ Set.Icc n m` such that `u i ω ∈ s` (or `m` if none).
- `hittingAfter u s n ω` = first time `i` with `n ≤ i` such that `u i ω ∈ s`.

There is a substantial API (measurability, monotonicity, interaction with filtrations). **Note:** the old name `MeasureTheory.hitting` no longer exists; it was refactored into `hittingBtwn`/`hittingAfter`.

---

## 4. Optimal Stopping Value / Reward

**DOES NOT EXIST.**

No declaration named `optimalStopping`, `optimalStoppingTime`, or anything resembling an essential-supremum-over-stopping-times reward function was found. There is no formalization of the optimal stopping problem or the existence of an optimal stopping time.

---

## 5. Variational Inequality / Obstacle Problem

**DOES NOT EXIST.**

No declaration named `VariationalInequality`, `obstacleProblem`, or anything stating `min(Lu, u − ψ) = 0` or a free-boundary / obstacle formulation was found.

---

## 6. Free Boundary / Smooth Pasting

**DOES NOT EXIST.**

No `freeBoundary`, `smoothFit`, `smoothPasting`, or any `C¹` value-matching condition for an obstacle problem was found.

---

## 7. Convexity / First-Order Optimality on ℝ

**EXISTS** (good coverage).

| Declaration | Module | Note |
|---|---|---|
| `ConvexOn` | `Mathlib.Analysis.Convex.Function` | Core definition |
| `StrictConvexOn` | `Mathlib.Analysis.Convex.Function` | Core definition |
| `IsMinOn` | `Mathlib.Order.Filter.Extr` | Core definition |
| `isMinOn_iff` | `Mathlib.Order.Filter.Extr` | `IsMinOn f s a ↔ ∀ x ∈ s, f a ≤ f x` |
| `IsMinOn.of_isLocalMinOn_of_convexOn` | `Mathlib.Analysis.Convex.Extrema` | Local min of convex ⇒ global min on convex set |
| `IsMinOn.of_isLocalMinOn_of_convexOn_Icc` | `Mathlib.Analysis.Convex.Extrema` | Same, specialized to `Icc` |
| `IsMinOn.of_isLocalMin_of_convex_univ` | `Mathlib.Analysis.Convex.Extrema` | Local min + convex on `univ` ⇒ global min everywhere |

**Not found:**
- `StrictConvexOn.isMinOn` — no direct lemma by this name. You would compose `IsMinOn.of_isLocalMinOn_of_convexOn` with `StrictConvexOn.convexOn`.
- `inner_le_iff` — no declaration by this name.
- A direct "stationary point of differentiable convex function ⇒ global min" is not a single named lemma. You would chain `HasDerivAt _ 0 ⇒ IsLocalMin` (via `IsLocalMin.hasDerivAt` or similar) with `IsMinOn.of_isLocalMin_of_convex_univ`. The pieces exist but require assembly.

---

## 8. `exp`-Family Value Structure

**EXISTS.**

| Declaration | Module |
|---|---|
| `Real.rpow` (def) | `Mathlib.Analysis.SpecialFunctions.Pow.Real` |
| `HasDerivAt.rpow_const` (theorem) | `Mathlib.Analysis.SpecialFunctions.Pow.Deriv` |
| `ProbabilityTheory.mgf` (def) | `Mathlib.Probability.Moments.Basic` |
| `ProbabilityTheory.cgf` (def) | `Mathlib.Probability.Moments.Basic` |

**Note:** `hasDerivAt_rpow_const` (top-level, non-dot-notation) was **not found** in the current version — use the dot-notation form `HasDerivAt.rpow_const` instead. `Real.hasDerivAt_rpow_const` also does not exist as a standalone name.

---

## Summary for American-Option / Smooth-Pasting Feasibility

| Component | Status |
|---|---|
| Stopped values / optional stopping | ✅ Available |
| Hitting times | ✅ Available |
| Snell envelope | ❌ Must build from scratch |
| Optimal stopping value/existence | ❌ Must build from scratch |
| Variational inequality / obstacle | ❌ Must build from scratch |
| Free boundary / smooth pasting | ❌ Must build from scratch |
| Convexity / optimality toolkit | ✅ Available (assembly required) |
| rpow / mgf / cgf | ✅ Available |

**Bottom line:** Mathlib v4.28.0 has the *stochastic-process plumbing* (filtrations, stopping times, stopped values, optional stopping/sampling, hitting times, martingale convergence) but **none of the optimal-stopping superstructure** (Snell envelope, optimal stopping value, variational inequalities, free boundaries, smooth pasting). The American-option "smooth-pasting = optimal exercise" claim cannot be *generated* from existing Mathlib infrastructure — the Snell envelope theory, the connection to free-boundary PDEs, and the smooth-fit condition would all need to be formalized from scratch. It would need to be **carried** as an axiom/assumption, or built as a substantial new library.

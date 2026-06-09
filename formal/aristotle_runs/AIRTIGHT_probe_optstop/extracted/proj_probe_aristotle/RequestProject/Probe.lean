import Mathlib

/-! # Capability Probe — Optimal Stopping / Free Boundary in Mathlib v4.28.0 -/

-- ============================================================
-- 1. Snell envelope
-- NOT FOUND: no `snellEnvelope`, `MeasureTheory.snell`, or anything named `Snell`.

-- ============================================================
-- 2. Optional stopping theorem / stopped-process API
#check @MeasureTheory.stoppedValue
#check @MeasureTheory.Submartingale.expected_stoppedValue_mono
#check @MeasureTheory.Martingale.stoppedValue_ae_eq_condExp_of_le

-- ============================================================
-- 3. Hitting times
#check @MeasureTheory.hittingBtwn
#check @MeasureTheory.hittingAfter

-- ============================================================
-- 4. Optimal stopping value / reward
-- NOT FOUND: no `optimalStopping`, no essential-supremum-over-stopping-times reward.

-- ============================================================
-- 5. Variational inequality / obstacle problem
-- NOT FOUND: no `VariationalInequality`, `obstacleProblem`, or min(Lu, u−ψ)=0.

-- ============================================================
-- 6. Free boundary / smooth pasting
-- NOT FOUND: no `freeBoundary`, `smoothFit`, `smoothPasting`.

-- ============================================================
-- 7. Convexity / first-order optimality on ℝ
#check @ConvexOn
#check @StrictConvexOn
#check @IsMinOn
#check @isMinOn_iff
#check @IsMinOn.of_isLocalMinOn_of_convexOn
#check @IsMinOn.of_isLocalMinOn_of_convexOn_Icc
#check @IsMinOn.of_isLocalMin_of_convex_univ

-- ============================================================
-- 8. exp-family / rpow / mgf / cgf
#check @Real.rpow
#check @HasDerivAt.rpow_const
#check @ProbabilityTheory.mgf
#check @ProbabilityTheory.cgf

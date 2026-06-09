/- Scratch module for the manager: build this to print the axiom dependencies
   of every load-bearing result. `lake build RequestProject.Audit` and read the
   #print axioms output. Expect ONLY: propext, Classical.choice, Quot.sound. -/
import RequestProject.AMMCurve
import RequestProject.Temporal
import RequestProject.Seam

-- curve layer
#print axioms TemporalCurve.AMMCurve.poolValue_concaveOn
#print axioms TemporalCurve.AMMCurve.hedge_gap_concaveOn
-- passivity layer
#print axioms Temporal.PassiveSystem.passivity
#print axioms Temporal.PassiveSystem.solvent
#print axioms Temporal.PassiveSystem.closed_cycle
#print axioms Temporal.TemporalAMM.solvent_forever
-- the seam / join
#print axioms TemporalSeam.intrinsic_concaveOn
#print axioms TemporalSeam.CurvePool.passivity
#print axioms TemporalSeam.CurvePool.solvent_forever
#print axioms TemporalSeam.reserves_have_no_floor

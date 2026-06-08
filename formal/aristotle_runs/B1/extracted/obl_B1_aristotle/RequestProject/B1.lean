/-
  B1 conditional structure — the κ-extrinsic limit as a theorem (NO fabricated floor).
  equity = V + support. IF the port covers the deficit (carried HYPOTHESIS) THEN floor ≤ equity.
  Geometry gives no reserve floor (PH-4b) ⇒ port necessary; this conditional ⇒ port sufficient only
  under the coverage hypothesis. The hypothesis is never discharged from geometry (extrinsic κ).
-/
import Mathlib

namespace B1

variable {S : Type}

/-- solvency is CONDITIONAL on the port covering the deficit (carried hypothesis). -/
theorem solvent_of_port_covers {V support : S → ℝ} {floor : ℝ}
    (hcov : ∀ s, floor - V s ≤ support s) :
    ∀ s, floor ≤ V s + support s := by
  intro s
  linarith [hcov s]

/-- the coverage condition is EXACTLY the solvency condition (port-coverage ⇔ solvency). -/
theorem port_necessity_note {V support : S → ℝ} {floor : ℝ} :
    (∀ s, floor - V s ≤ support s) ↔ (∀ s, floor ≤ V s + support s) := by
  constructor
  · intro h s; linarith [h s]
  · intro h s; linarith [h s]

end B1

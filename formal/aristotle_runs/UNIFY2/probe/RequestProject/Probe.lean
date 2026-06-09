import Mathlib
open Real MeasureTheory
namespace Probe

/- CAPABILITY PROBE for Mathlib v4.28.0.
   These are deliberately STATED with `sorry` placeholders ONLY where we want Aristotle to
   tell us whether the supporting API EXISTS. The real question is in the instructions:
   does Mathlib v4.28.0 provide (a) modified Bessel functions K_ν, (b) the machinery to treat
   a density f≥0 with ∫f=1 as a probability measure (pdf.toMeasure, integrability, MGF/cumulant). -/

-- Probe 1: can we even reference an integral of an exp-tilted function and its positivity?
noncomputable def ghKernel (αh βh δ v : ℝ) : ℝ := Real.exp (-(αh) * Real.sqrt (δ^2 + v^2) + βh * v)

theorem ghKernel_pos (αh βh δ v : ℝ) : 0 < ghKernel αh βh δ v := by
  unfold ghKernel; positivity

-- Probe 2: is the kernel measurable / integrable structure available (we only need the statement to typecheck)?
theorem ghKernel_measurable (αh βh δ : ℝ) : Measurable (fun v => ghKernel αh βh δ v) := by
  sorry

end Probe

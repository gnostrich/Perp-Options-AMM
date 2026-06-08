/-
  THROWAWAY SMOKE PROBE — NOT part of the RequestProject build.
  Purpose: exercise the brokered Aristotle loop on a trivially-TRUE, genuinely
  provable, axiom-clean lemma.
  Toolchain: Lean 4.28.0 + Mathlib v4.28.0.
  Expected verdict: PROVED + re-verified locally; `#print axioms` shows only
  propext / Classical.choice / Quot.sound (here: no axioms at all).
-/
import Mathlib

namespace Smoke

theorem smoke_true : 2 + 2 = 4 := by norm_num

-- expected: prints "'Smoke.smoke_true' depends on axioms: []" (axiom-clean)
#print axioms smoke_true

end Smoke

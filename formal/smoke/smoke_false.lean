/-
  THROWAWAY SMOKE PROBE — NOT part of the RequestProject build.
  Purpose: exercise the direct Aristotle loop on a trivially-FALSE statement so
  the prover must REFUTE it / return a counterexample rather than "prove" it.
  Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

  Expected verdict: COUNTEREXAMPLE / REFUTED. The statement is false (take n = 0:
  0 = 1 is false). Aristotle must NOT close it; any returned proof is a red flag.
  The `sorry` below is intentional and marks this as an open (false) goal — it is
  the probe, not a real proof, and this file is excluded from the build.
-/
import Mathlib

namespace Smoke

-- FALSE: n = n + 1 fails for every n; counterexample n = 0 gives 0 = 1.
theorem smoke_false : ∀ n : ℕ, n = n + 1 := by sorry

end Smoke

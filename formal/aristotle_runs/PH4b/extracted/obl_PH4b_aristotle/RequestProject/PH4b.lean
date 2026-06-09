/-
  PH-4b GH-analogue — reserves-have-no-floor, generalized off cpmm.
  GH has bounded reserves ⇒ poolValue bounded above; against an unbounded obligation, intrinsic=V−O
  has no lower bound. The floor is a PORT property (funding necessary, not sufficient — B1 stays open).
-/
import Mathlib

namespace PH4b

/-
if the reserve value is bounded above but the obligation is unbounded above, the reserve part of
    storage has NO lower bound (the funding port is necessary).
-/
theorem no_floor_of_boundedAbove_value_unbounded_obl
    {V O : ℝ → ℝ}
    (hV : ∃ B, ∀ p ∈ Set.Ioi (0:ℝ), V p ≤ B)
    (hO : ∀ M : ℝ, ∃ p, p ∈ Set.Ioi (0:ℝ) ∧ M < O p) :
    ¬ BddBelow ((fun p => V p - O p) '' Set.Ioi (0:ℝ)) := by
  exact fun ⟨ B, hB ⟩ => by rcases hV with ⟨ V, hV ⟩ ; obtain ⟨ M, hM ⟩ := hO ( V - B + 1 ) ; linarith [ hB <| Set.mem_image_of_mem _ hM.1, hV _ hM.1 ] ;

/-
sanity instance: bounded V≡1, unbounded O=id ⇒ no floor.
-/
theorem gh_instance :
    ¬ BddBelow ((fun p => (1:ℝ) - p) '' Set.Ioi (0:ℝ)) := by
  -- To prove the set is not bounded below, we show that for any real number $M$, there exists $p > 0$ such that $1 - p < M$.
  have h_unbounded : ∀ M : ℝ, ∃ p : ℝ, 0 < p ∧ 1 - p < M := by
    exact fun M => ⟨ |M| + 2, by positivity, by cases abs_cases M <;> linarith ⟩;
  exact fun ⟨ M, hM ⟩ => by obtain ⟨ p, hp₀, hpM ⟩ := h_unbounded M; linarith [ hM ( Set.mem_image_of_mem _ hp₀ ) ] ;

end PH4b
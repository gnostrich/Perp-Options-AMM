/-
  GH coercive — bounded reserves ⇒ poolValue BddBelow.
  GH has X∈(0,Nx), Y∈(0,Ny·M); on dom⊆Ioi 0 with y≥0, p*x+y(x)≥0 for p>0 ⇒ lower bound 0 ⇒ BddBelow.
  This discharges the AMMCurve.coercive gate field for GH.
-/
import RequestProject.AMMCurve

namespace GHCoercive

/-
bounded-reserves coercivity, in the exact shape of the AMMCurve.coercive field:
    a nonnegative frontier on a positive domain is coercive (lower bound 0).
-/
theorem coercive_of_nonneg {dom : Set ℝ} (hdom : dom ⊆ Set.Ioi 0)
    {y : ℝ → ℝ} (hy : ∀ x ∈ dom, 0 ≤ y x) :
    ∀ ⦃p : ℝ⦄, 0 < p → BddBelow ((fun x => p * x + y x) '' dom) := by
  exact fun p hp => ⟨ 0, Set.forall_mem_image.2 fun x hx => by nlinarith [ Set.mem_Ioi.1 ( hdom hx ), hy x hx ] ⟩

/-
sanity corollary: the value is nonnegative on the GH domain.
-/
theorem gh_value_nonneg {p x : ℝ} (hp : 0 < p) (hx : x ∈ Set.Ioi 0)
    {y : ℝ → ℝ} (hy : 0 ≤ y x) : 0 ≤ p * x + y x := by
  nlinarith [ hx.out ]

end GHCoercive
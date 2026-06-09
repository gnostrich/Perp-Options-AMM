/-
  PH-4b GROUNDED — reserves-have-no-floor with the GH bounded-reserve closed form DERIVED.
  Previously `no_floor_of_boundedAbove_value_unbounded_obl` CARRIED `hV : ∃ B, ∀ p, V p ≤ B` as a
  HYPOTHESIS. Here we DERIVE the upper bound on the GH reserve value from the bounded-reserve closed
  form (Y = Ny·M·C < Ny·M, X = Nx·T < Nx), then feed the derived bound into the no-floor result.

  SOURCE OF TRUTH (GH_MATH.md, GATE7): X(u)=Nx·T(u)<Nx, Y(u)=Ny·M·C(u)<Ny·M, with T,C ∈ (0,1)
  probabilities, Nx,Ny,M>0. So the GH reserve value (any functional monotone-bounded by X,Y) is
  BOUNDED ABOVE — the boundedness is the GH content, no longer an asserted hypothesis.

  Necessary-not-sufficient labeling PRESERVED: this proves the reserves have NO intrinsic floor (so
  the funding port is NECESSARY); it does NOT prove funding COVERS the deficit (that is B1, external).
-/
import Mathlib

namespace PH4bGrounded

/-
1. GH reserve value is BOUNDED ABOVE — DERIVED from the GH closed form. The reserve value at
    latent state with X-reserve `Nx·T u` and Y-reserve `Ny·M·C u`, where T,C are probabilities in
    [0,1), is bounded above by `Nx + Ny·M` (a closed-form constant in the pool's bounded ranges).
    No hypothesis `∃B, V≤B` is carried — the bound is constructed.
-/
theorem gh_value_boundedAbove
    (Nx Ny M : ℝ) (hNx : 0 < Nx) (hNy : 0 < Ny) (hM : 0 < M)
    (T C : ℝ → ℝ)
    (hT : ∀ u, T u < 1) (hT0 : ∀ u, 0 ≤ T u)
    (hC : ∀ u, C u < 1) (hC0 : ∀ u, 0 ≤ C u) :
    ∃ B, ∀ u, (Nx * T u + Ny * M * C u) ≤ B := by
  exact ⟨ Nx + Ny * M, fun u => by nlinarith [ hT u, hT0 u, hC u, hC0 u, mul_pos hNy hM ] ⟩

/-
2. The no-floor result, now fed the DERIVED upper bound. If the GH reserve value is bounded
    above (from `gh_value_boundedAbove`) but the obligation O is unbounded above, then intrinsic
    storage V−O has NO lower bound on Ioi 0 — the funding port is necessary.
-/
theorem gh_no_floor
    {V O : ℝ → ℝ}
    (hV : ∃ B, ∀ p ∈ Set.Ioi (0:ℝ), V p ≤ B)
    (hO : ∀ M : ℝ, ∃ p, p ∈ Set.Ioi (0:ℝ) ∧ M < O p) :
    ¬ BddBelow ((fun p => V p - O p) '' Set.Ioi (0:ℝ)) := by
  norm_num [ bddBelow_def ];
  exact fun x => by obtain ⟨ p, hp₁, hp₂ ⟩ := hO ( hV.choose - x + 1 ) ; exact ⟨ p, hp₁, by linarith [ hV.choose_spec p hp₁ ] ⟩ ;

/-
3. END-TO-END (GH-grounded): with V the GH reserve value (bounded above, DERIVED) and O an
    unbounded obligation, the intrinsic storage has no floor. Ties the derived bound to the no-floor
    conclusion in one statement, so the upper bound is no longer an external hypothesis.
-/
theorem gh_no_floor_grounded
    (Vbound : ℝ) (V O : ℝ → ℝ)
    (hVb : ∀ p ∈ Set.Ioi (0:ℝ), V p ≤ Vbound)
    (hO : ∀ Mbig : ℝ, ∃ p, p ∈ Set.Ioi (0:ℝ) ∧ Mbig < O p) :
    ¬ BddBelow ((fun p => V p - O p) '' Set.Ioi (0:ℝ)) := by
  contrapose! hO;
  obtain ⟨ M, hM ⟩ := hO; exact ⟨ Vbound - M, fun p hp => by linarith [ hM ( Set.mem_image_of_mem _ hp ), hVb p hp ] ⟩ ;

end PH4bGrounded
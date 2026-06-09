import Mathlib

open scoped BigOperators
open MeasureTheory intervalIntegral

namespace GHMaps

/-- GH base kernel (density up to normalizer); reused verbatim from CLOSEOUT_GHmeasure. -/
noncomputable def ghKernel (αh βh δ v : ℝ) : ℝ := Real.exp (-(αh) * Real.sqrt (δ ^ 2 + v ^ 2) + βh * v)

theorem ghKernel_pos (αh βh δ v : ℝ) : 0 < ghKernel αh βh δ v := by
  unfold ghKernel; positivity

theorem ghKernel_continuous (αh βh δ : ℝ) :
    Continuous (fun v => ghKernel αh βh δ v) := by
  exact Real.continuous_exp.comp <| Continuous.add ( Continuous.mul continuous_const <| Real.continuous_sqrt.comp <| by continuity ) ( Continuous.mul continuous_const <| continuous_id' )

noncomputable def ghCDF  (αh βh δ a u : ℝ) : ℝ := ∫ t in a..u, ghKernel αh βh δ t
noncomputable def ghTail (αh βh δ u b : ℝ) : ℝ := ∫ t in u..b, ghKernel αh βh δ t

theorem ghCDF_hasDerivAt (αh βh δ a u : ℝ) :
    HasDerivAt (fun u => ghCDF αh βh δ a u) (ghKernel αh βh δ u) u := by
  apply_rules [ intervalIntegral.integral_hasDerivAt_right ];
  · exact Continuous.intervalIntegrable ( by exact Real.continuous_exp.comp <| by continuity ) _ _;
  · exact Continuous.stronglyMeasurable ( ghKernel_continuous αh βh δ ) |> fun h => h.stronglyMeasurableAtFilter;
  · exact Continuous.continuousAt ( by unfold ghKernel; continuity )

theorem ghCDF_strictMono (αh βh δ a : ℝ) :
    StrictMono (fun u => ghCDF αh βh δ a u) := by
  -- By `ghCDF_hasDerivAt`, `HasDerivAt (fun u => ghCDF αh βh δ a u) (ghKernel αh βh δ x) x`, so `deriv (fun u => ghCDF αh βh δ a u) x = ghKernel αh βh δ x` (via HasDerivAt.deriv).
  have h_deriv : ∀ u, deriv (fun u => ghCDF αh βh δ a u) u = ghKernel αh βh δ u := by
    exact fun u => HasDerivAt.deriv ( ghCDF_hasDerivAt αh βh δ a u );
  exact strictMono_of_deriv_pos fun u => h_deriv u ▸ ghKernel_pos αh βh δ u

theorem ghTail_hasDerivAt (αh βh δ b u : ℝ) :
    HasDerivAt (fun u => ghTail αh βh δ u b) (-(ghKernel αh βh δ u)) u := by
  convert HasDerivAt.neg ( ghCDF_hasDerivAt αh βh δ b u ) using 1;
  ext; simp +decide [ ghTail, ghCDF, intervalIntegral ] ;

theorem ghTail_strictAnti (αh βh δ b : ℝ) :
    StrictAnti (fun u => ghTail αh βh δ u b) := by
  -- By definition of `ghTail`, we know that its derivative is `-(ghKernel αh βh δ u)`.
  have h_deriv : ∀ u, deriv (fun u => ghTail αh βh δ u b) u = -(ghKernel αh βh δ u) := by
    exact fun u => HasDerivAt.deriv ( ghTail_hasDerivAt αh βh δ b u );
  exact strictAnti_of_deriv_neg fun u => by rw [ h_deriv ] ; exact neg_neg_of_pos ( ghKernel_pos αh βh δ u ) ;

theorem X_strictAnti (αh βh δ b Nx : ℝ) (hNx : 0 < Nx) :
    StrictAnti (fun u => Nx * ghTail αh βh δ u b) := by
  exact fun u v huv => mul_lt_mul_of_pos_left ( ghTail_strictAnti αh βh δ b huv ) hNx

theorem Y_strictMono (αh βh δ a NyM : ℝ) (hNyM : 0 < NyM) :
    StrictMono (fun u => NyM * ghCDF αh βh δ a u) := by
  apply_rules [ StrictMono.const_mul, ghCDF_strictMono ]

/-
The frontier is antitone with the CONCRETE maps — the carried CLOSEOUT hypotheses are now proved.
-/
theorem frontier_antitone_discharged (αh βh δ a b Nx NyM : ℝ) (hNx : 0 < Nx) (hNyM : 0 < NyM)
    (u₁ u₂ : ℝ) (h : u₁ < u₂) :
    Nx * ghTail αh βh δ u₂ b < Nx * ghTail αh βh δ u₁ b ∧
    NyM * ghCDF αh βh δ a u₁ < NyM * ghCDF αh βh δ a u₂ := by
  -- Apply the strict monotonicity of X and Y
  apply And.intro (X_strictAnti αh βh δ b Nx hNx h) (Y_strictMono αh βh δ a NyM hNyM h)

end GHMaps

#print axioms GHMaps.ghCDF_strictMono
#print axioms GHMaps.ghTail_strictAnti
#print axioms GHMaps.X_strictAnti
#print axioms GHMaps.Y_strictMono
#print axioms GHMaps.frontier_antitone_discharged
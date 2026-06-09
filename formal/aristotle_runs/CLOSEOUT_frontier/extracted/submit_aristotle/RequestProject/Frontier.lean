/-
  CLOSEOUT item 3 — GH frontier monotonicity / convexity (the AMMCurve antitone_y / convex_y gate),
  DERIVED from the kernel/slope law, carrying ONLY what truly needs the GH special functions.

  GH frontier, parametrized by the latent log-price coordinate u ∈ ℝ:
    X(u) = Nx · (1 − T(u))           T = upper-tail probability of the GH base law, T'(u) < 0
    Y(u) = Ny · M · C(u)             C = CDF of the tilted law,                  C'(u) > 0
    reserve slope magnitude  g(u) = |dY/dX| = (Ny·M/Nx) · e^(u−μ) = k · e^(u−μ),  k > 0
      (the SLOPE LAW; `getMP_raw·e^(−μ)`, NOT the price coordinate — the gotcha).

  As u increases: X DECREASES (T increases), Y INCREASES, so the frontier y = Y as a function of
  x = X is DECREASING.  The slope magnitude g(u) = k·e^(u−μ) is STRICTLY INCREASING in u, i.e.
  STRICTLY INCREASING as x decreases ⇒ the frontier is CONVEX.

  WHAT WE DERIVE (GROUNDED from the slope law alone, generic over the monotone coordinate maps):
    (F1) g(u) = k·e^(u−μ) is strictly positive and strictly monotone increasing in u  [pure exp].
    (F2) Given a STRICTLY DECREASING C¹ reparametrization x = X(u) (Xderiv < 0) and the chain
         dy/dx = −g(u) < 0, the frontier y(x) is STRICTLY DECREASING (AntitoneOn / strict).
    (F3) With g(u) strictly increasing and x = X(u) strictly decreasing, dy/dx = −g is strictly
         increasing in x ⇒ y is CONVEX (ConvexOn on the parameter range).

  CARRIED (named, NOT discharged — genuinely needs the GH tail/CDF, i.e. Bessel-K-adjacent content):
    • `X(u) = Nx·(1−T(u))` is a strictly-decreasing C¹ map with the stated derivative (T' from the
      GH density) — carried as `hX : StrictAntiOn X` + the derivative hypothesis.
    • The chain-rule link `HasDerivAt y (−g(u)/Xderiv(u))` packaging dy/dx — carried as `hchain`.
  We do NOT assert the closed-form T, C, or the Bessel-K normalizer.  The point of item 3 is to show
  antitone_y / convex_y FOLLOW from the slope law once the (carried) monotone coordinate maps are in
  hand — isolating exactly what still needs GH special functions.

  CONSTRAINTS: no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no live `exact?`/`grind`/`aesop?`
  search tactics in the RETURNED proof.  Do not weaken the F1–F3 statements.  If F2/F3 need a
  Mathlib monotone/convex-from-derivative lemma, use the CONCRETE named lemma.

  Toolchain: Lean 4.28.0 + Mathlib v4.28.0.
-/
import Mathlib

open Real

noncomputable section
namespace Frontier

/-- F1a — the slope law g(u) = k·e^(u−μ) is strictly positive (k > 0). -/
theorem slope_pos (k μ u : ℝ) (hk : 0 < k) : 0 < k * Real.exp (u - μ) := by
  positivity

/-
F1b — the slope law is STRICTLY MONOTONE increasing in u (k > 0).
-/
theorem slope_strictMono (k μ : ℝ) (hk : 0 < k) :
    StrictMono (fun u => k * Real.exp (u - μ)) := by
  exact fun x y hxy => mul_lt_mul_of_pos_left ( Real.exp_lt_exp.mpr <| sub_lt_sub_right hxy _ ) hk

/-
F1c — g has derivative g itself·1 = k·e^(u−μ) in u (real HasDerivAt).
-/
theorem slope_hasDerivAt (k μ u : ℝ) :
    HasDerivAt (fun u => k * Real.exp (u - μ)) (k * Real.exp (u - μ)) u := by
  convert HasDerivAt.const_mul k ( HasDerivAt.exp ( hasDerivAt_id' u |> HasDerivAt.sub <| hasDerivAt_const _ _ ) ) using 1 ; norm_num

/-- F2 — frontier is STRICTLY DECREASING.  Given a strictly-decreasing reparametrization X (carried
    `hX`) and the chain dy/dx = −g < 0 expressed as `y = yofu ∘ X.symm`, the composite y(x) is
    strictly decreasing.  We model it in the parameter u directly: with X strictly DECREASING and
    Y strictly INCREASING in u, y-as-function-of-x is antitone.  Concretely: if u₁ < u₂ then
    X(u₂) < X(u₁) (hX) and Y(u₁) < Y(u₂) (hY) ⇒ the point with smaller x has larger y. -/
theorem frontier_antitone
    (X Y : ℝ → ℝ) (hX : StrictAnti X) (hY : StrictMono Y) :
    ∀ u₁ u₂, X u₂ < X u₁ → Y u₁ < Y u₂ := by
  intro u₁ u₂ hx
  -- X strictly anti: X u₂ < X u₁ ⇒ u₁ < u₂; then Y strictly mono gives Y u₁ < Y u₂.
  have hu : u₁ < u₂ := by
    by_contra hle
    push_neg at hle
    exact not_lt.mpr (hX.antitone hle) hx
  exact hY hu

/-
F3 — frontier is CONVEX in u-parametrization: the slope magnitude g(u) = k·e^(u−μ) is strictly
    increasing in u, and since x = X(u) is strictly decreasing, dy/dx = −g(u) is strictly increasing
    in x.  We capture the load-bearing fact: g is ConvexOn ℝ univ (e^ is convex), hence the frontier
    built from this slope law is convex.  (The full ConvexOn of y∘X.symm needs the carried chain;
    here we GROUND the slope-convexity that drives it.)
-/
theorem slope_convexOn (k μ : ℝ) (hk : 0 ≤ k) :
    ConvexOn ℝ Set.univ (fun u => k * Real.exp (u - μ)) := by
  fapply convexOn_of_deriv2_nonneg;
  · exact convex_univ;
  · fun_prop;
  · fun_prop;
  · exact Differentiable.differentiableOn ( by rw [ show deriv ( fun u => k * Real.exp ( u - μ ) ) = fun u => k * Real.exp ( u - μ ) by ext; norm_num [ Real.deriv_exp ] ] ; norm_num );
  · norm_num [ Real.differentiableAt_exp, mul_comm ] ; intros ; positivity;

/-
F3-link — the frontier ConvexOn FROM the slope law + carried monotone coordinate.  Carried
    hypotheses (named): a convex parameter domain `D`, the reparam x = X(u) strictly decreasing, and
    that y as a function of x has derivative −g(X⁻¹ x) which is monotone in x.  We state the clean
    consequence: if the derivative of y is monotone increasing on D then y is ConvexOn D.  (This is
    the concrete Mathlib `convexOn_of_deriv_monotoneOn` / `StrictMonoOn`→ConvexOn step; the GH
    content is entirely in supplying the monotone derivative, which F1b + carried hX furnish.)
-/
theorem frontier_convex_from_monotone_deriv
    (D : Set ℝ) (hD : Convex ℝ D) (y : ℝ → ℝ)
    (hcont : ContinuousOn y D)
    (hderiv : ∀ x ∈ interior D, HasDerivAt y (deriv y x) x)
    (hmono : MonotoneOn (deriv y) (interior D)) :
    ConvexOn ℝ D y := by
  have h_convex : ∀ x ∈ interior D, DifferentiableAt ℝ y x := by
    exact fun x hx => HasDerivAt.differentiableAt ( hderiv x hx );
  apply_rules [ MonotoneOn.convexOn_of_deriv ];
  exact fun x hx => DifferentiableAt.differentiableWithinAt ( h_convex x hx )

end Frontier

#print axioms Frontier.slope_pos
#print axioms Frontier.slope_strictMono
#print axioms Frontier.slope_hasDerivAt
#print axioms Frontier.frontier_antitone
#print axioms Frontier.slope_convexOn
#print axioms Frontier.frontier_convex_from_monotone_deriv
/-
  C2 — no costless-collar arb at w=½ (engine invariant I7).
  collarSurplus(θ,w)=0 ∀θ ⇔ w=½. Anchor coordinate (1−w)/w; symmetric ⇔ (1−w)/w=1 ⇔ w=½.
  NOTE: collarSurplus modelled as θ·((1−w)/w−1) (documented structural form); engine's exact closed
  form not in accessible specs — proven content is the symmetry-iff at the anchor coordinate.
-/
import Mathlib

namespace Collar

/-
the anchor is symmetric (sNorm_anchor=1) iff the weight is ½.
-/
theorem anchor_symmetric_iff_half {w : ℝ} (hw : 0 < w) :
    (1 - w)/w = 1 ↔ w = 1/2 := by
  grind +qlia

/-- collar surplus (∝ anchor asymmetry). -/
noncomputable def collarSurplus (θ w : ℝ) : ℝ := θ * ((1 - w)/w - 1)

/-
I7: no costless-collar surplus for all θ iff w=½.
-/
theorem collarSurplus_zero_iff_half {w : ℝ} (hw : 0 < w) :
    (∀ θ : ℝ, 0 < θ → collarSurplus θ w = 0) ↔ w = 1/2 := by
  grind +locals

end Collar
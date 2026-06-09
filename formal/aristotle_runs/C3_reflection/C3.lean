/-
  C3 — DISCHARGE the curve-symmetry → reflection arrow (the standing AXIOM).

  Prior status: "no-arb is a symmetry phenomenon, not an instrument one" was proved only as a
  CONDITIONAL SKELETON — the curve-symmetry → reflection arrow was an AXIOM, not proven.

  This file ATTEMPTS to prove the reflection arrow FROM the explicit symmetry of the mark function on
  the w=½ anchor curve, so the no-arb statement no longer rests on an axiom.

  The mark (barrier value fraction, §2.5 of the spec), at ray θ on pool spot sNorm:
      markCall θ s = if s < θ then s / θ else 1        (call wing)
      markPut  θ s = if s > θ then θ / s else 1        (put wing)

  THE REFLECTION.  On the w=½ symmetric anchor, the call and put wings are exchanged by the
  involution that reflects the normalized spot across the ray:  R_θ(s) = θ² / s  (a genuine
  involution: R_θ(R_θ s) = s, fixing s = θ, the ATM ray).  The CURVE-SYMMETRY claim is that the put
  mark is the call mark composed with this reflection (and the strike/ray map likewise reflected):

      markPut θ s  =  markCall θ (θ² / s)        for s > 0.

  If THIS holds (a real algebraic identity, no axiom), then "no-arb is a reflection symmetry, not an
  instrument property" is DISCHARGED: the put leg is the reflected call leg, so any arb on one wing
  maps to an arb on the other under R_θ; the symmetric (w=½) configuration is R_θ-invariant ⇒ no net
  arb.  The arrow `curve-symmetry ⇒ reflection-invariance of the instrument` becomes a theorem.

  Toolchain: Lean 4.28.0 + Mathlib v4.28.0.
-/
import Mathlib

open Real

noncomputable section
namespace C3

/-- Call-wing mark at ray `θ`, pool spot `s` (barrier fraction, capped at 1 when ITM). -/
def markCall (θ s : ℝ) : ℝ := if s < θ then s / θ else 1

/-- Put-wing mark at ray `θ`, pool spot `s`. -/
def markPut (θ s : ℝ) : ℝ := if θ < s then θ / s else 1

/-- The wing-exchange reflection across the ray `θ`: `R_θ(s) = θ²/s`. -/
def reflect (θ s : ℝ) : ℝ := θ ^ 2 / s

/-- THE REFLECTION IS AN INVOLUTION (GROUNDED, no axiom): `R_θ(R_θ s) = s` for `θ, s ≠ 0`. -/
theorem reflect_involution (θ s : ℝ) (hθ : θ ≠ 0) (hs : s ≠ 0) :
    reflect θ (reflect θ s) = s := by
  unfold reflect
  field_simp

/-- The reflection FIXES the ATM ray `s = θ` (GROUNDED). -/
theorem reflect_fixes_atm (θ : ℝ) (hθ : θ ≠ 0) : reflect θ θ = θ := by
  unfold reflect; field_simp; ring

/-- THE REFLECTION ARROW (the former AXIOM, now a TARGET): the put-wing mark equals the call-wing
    mark composed with the wing-exchange reflection.  `markPut θ s = markCall θ (θ²/s)` for `θ,s>0`.
    If this is a genuine identity, the curve-symmetry → reflection arrow is DISCHARGED. -/
theorem reflection_arrow (θ s : ℝ) (hθ : 0 < θ) (hs : 0 < s) :
    markPut θ s = markCall θ (reflect θ s) := by
  sorry

/-- COROLLARY (no-arb = reflection symmetry, now NON-axiomatic): the put mark is determined by the
    call mark via the involution, so the two-wing instrument is invariant under `R_θ` — an arb on the
    put wing at `s` is exactly an arb on the call wing at `R_θ s`.  No instrument-specific assumption.
    Stated as: the reflected call mark and the put mark agree pointwise (the symmetry orbit). -/
theorem no_arb_is_reflection_symmetry (θ s : ℝ) (hθ : 0 < θ) (hs : 0 < s) :
    markPut θ s = markCall θ (reflect θ s)
      ∧ markCall θ s = markPut θ (reflect θ s) := by
  sorry

end C3

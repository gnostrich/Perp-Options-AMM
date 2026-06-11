import Mathlib

/-!
# FW germ — the joint warp+mode first-order characterization at the mark, and the witness

Obligations FW-5 and FW-6 from `framework/FRAMEWORK_curve_agnostic_2026-06-11.md` §12
(AC-2 joint characterization — SCOPE: trades AT the mark, per §16 corrigendum 2).

## The pinned first-order objects

`ε : ℝ → ℝ` is the elasticity profile over the ray coordinate; `u₀` is the mark with
mode holding pre-trade (`ε u₀ = 1`). A regular warp delivers, per infinitesimal trade of
slide `du` at the mark, the first-order profile update `δε(ũ) = A(ũ)·du + o(du)` with `A`
continuous at the mark.

* **Reading-1 transport at the mark**: the new profile's value at the old mark must match the
  frozen profile's transported demand `ε(u₀+du)·e^(du)` to first order. Encoded:
  `TransportFO ε u₀ a` := the mismatch `du ↦ ε(u₀+du)·exp(du) − (ε u₀ + a·du)` has
  derivative `0` at `0` (its value at `0` is `0`, so this says mismatch `= o(du)`).
* **Mode at the moving mark**: the new mark sits at ray coordinate `u₀ + du`
  (token-faithful move; `du = 2·dy/y` at the mark since slope = ray there), so
  `ε_new(u₀+du) = ε(u₀+du) + A(u₀+du)·du` must equal `1` to first order. Encoded:
  `ModeFO ε u₀ A` := `du ↦ ε(u₀+du) + A(u₀+du)·du` has derivative `0` at `0`
  (its value at `0` is `ε u₀ = 1`, so this says mode error `= o(du)`).

**FW-5 (the iff):** with `ε u₀ = 1`, `HasDerivAt ε ε' u₀`, `A` continuous at `u₀`:
`TransportFO ε u₀ (A u₀) ∧ ModeFO ε u₀ A ↔ ε' = -(1/2) ∧ A u₀ = 1/2`.
(Weight form: `w = ε/(1+ε)` has `w(u₀) = 1/2`, `w'(u₀) = -(1/8)`.)

**FW-6 (witness, non-emptiness):** the translating linear-germ family
`w_c(ũ) = 1/2 - (ũ-c)/8`, `ε_c = w_c/(1-w_c)`, with re-anchoring kernel
`A_c(ũ) = (1/8)/((1/2+(ũ-c)/8)²)` (= `-ε_c'(ũ)`, the translation tangent), satisfies BOTH
first-order contracts at every anchor `c`, and sits strictly inside the AMM-validity gate
(`w' > -w(1-w)`) on the strip `(ũ-c)² < 8`.
-/

namespace FWGerm

noncomputable section

/-- First-order reading-1 transport at the mark: the transport mismatch is `o(du)`.
The function's value at `0` is `0`; derivative `0` at `0` is the first-order match. -/
def TransportFO (ε : ℝ → ℝ) (u₀ a : ℝ) : Prop :=
  HasDerivAt (fun du => ε (u₀ + du) * Real.exp du - (ε u₀ + a * du)) 0 0

/-- First-order mode-at-the-moving-mark: `ε_new(u₀+du) − 1 = o(du)`.
The function's value at `0` is `ε u₀` (`= 1` under the mode hypothesis); derivative `0`
at `0` is the first-order preservation. -/
def ModeFO (ε : ℝ → ℝ) (u₀ : ℝ) (A : ℝ → ℝ) : Prop :=
  HasDerivAt (fun du => ε (u₀ + du) + A (u₀ + du) * du) 0 0

/-
FW-5 (the joint characterization, trades AT the mark): for a profile with mode holding
(`ε u₀ = 1`), derivative `ε'` at the mark, and a regular kernel (`A` continuous at `u₀`),
first-order transport + first-order mode hold jointly iff `ε' = -1/2` and `A u₀ = 1/2`.
-/
theorem joint_iff (ε A : ℝ → ℝ) (u₀ ε' : ℝ)
    (hmode : ε u₀ = 1) (hd : HasDerivAt ε ε' u₀) (hA : ContinuousAt A u₀) :
    (TransportFO ε u₀ (A u₀) ∧ ModeFO ε u₀ A) ↔ (ε' = -(1/2) ∧ A u₀ = 1/2) := by
  constructor;
  · intro h;
    have h_deriv : HasDerivAt (fun du => ε (u₀ + du)) ε' 0 := by
      rw [ hasDerivAt_iff_tendsto_slope_zero ] at *;
      aesop;
    have h_deriv2 : HasDerivAt (fun du => ε (u₀ + du) * Real.exp du - (ε u₀ + A u₀ * du)) (ε' + 1 - A u₀) 0 := by
      convert HasDerivAt.sub ( h_deriv.mul ( Real.hasDerivAt_exp 0 ) ) ( HasDerivAt.add ( hasDerivAt_const _ _ ) ( HasDerivAt.mul ( hasDerivAt_const _ _ ) ( hasDerivAt_id 0 ) ) ) using 1 ; norm_num [ hmode ];
    have h_deriv3 : HasDerivAt (fun du => ε (u₀ + du) + A (u₀ + du) * du) (ε' + A u₀) 0 := by
      have h_deriv3 : Filter.Tendsto (fun du => (A (u₀ + du) * du - A u₀ * 0) / (du - 0)) (nhdsWithin 0 {0}ᶜ) (nhds (A u₀)) := by
        have h_deriv3 : Filter.Tendsto (fun du => A (u₀ + du)) (nhdsWithin 0 {0}ᶜ) (nhds (A u₀)) := by
          exact hA.tendsto.comp ( tendsto_nhdsWithin_of_tendsto_nhds ( by norm_num [ Filter.Tendsto ] ) );
        exact h_deriv3.congr' ( by filter_upwards [ self_mem_nhdsWithin ] with x hx using by rw [ eq_div_iff ( sub_ne_zero_of_ne hx ) ] ; ring );
      rw [ hasDerivAt_iff_tendsto_slope_zero ] at *;
      convert h_deriv.add h_deriv3 using 2 ; norm_num ; ring;
    constructor <;> linarith [ h.1.unique h_deriv2, h.2.unique h_deriv3 ];
  · intro h
    unfold TransportFO ModeFO;
    constructor;
    · convert HasDerivAt.sub ( HasDerivAt.mul ( HasDerivAt.comp 0 ( show HasDerivAt ε ε' ( u₀ + 0 ) by simpa using hd ) ( HasDerivAt.const_add u₀ ( hasDerivAt_id 0 ) ) ) ( Real.hasDerivAt_exp 0 ) ) ( HasDerivAt.add ( hasDerivAt_const _ _ ) ( HasDerivAt.mul ( hasDerivAt_const _ _ ) ( hasDerivAt_id 0 ) ) ) using 1 ; norm_num [ h, hmode ];
    · -- By definition of $A$, we know that $A(u₀ + du) * du$ has a derivative of $A(u₀)$ at $du = 0$.
      have hA_deriv : HasDerivAt (fun du => A (u₀ + du) * du) (A u₀) 0 := by
        rw [ hasDerivAt_iff_tendsto_slope_zero ];
        rw [ Metric.tendsto_nhdsWithin_nhds ] ; norm_num;
        exact fun ε hε => by rcases Metric.continuousAt_iff.mp hA ε hε with ⟨ δ, hδ, H ⟩ ; exact ⟨ δ, hδ, fun { x } hx₁ hx₂ => by simpa [ mul_comm, hx₁ ] using H <| by simpa [ abs_mul ] using hx₂ ⟩ ;
      convert HasDerivAt.add ( HasDerivAt.comp 0 ( show HasDerivAt ε ε' ( u₀ + 0 ) by simpa using hd ) ( HasDerivAt.const_add u₀ ( hasDerivAt_id 0 ) ) ) hA_deriv using 1 ; norm_num [ * ]

/-
FW-5 corollary (weight form): the germ in weight units is `(1/2, -1/8)`.
-/
theorem germ_weight (ε : ℝ → ℝ) (u₀ : ℝ) (hmode : ε u₀ = 1)
    (hd : HasDerivAt ε (-(1/2)) u₀) :
    ε u₀ / (1 + ε u₀) = 1/2 ∧
    HasDerivAt (fun u => ε u / (1 + ε u)) (-(1/8)) u₀ := by
  convert HasDerivAt.div ( hd ) ( hd.const_add 1 ) _ using 1 <;> norm_num [ hmode ];
  rfl

/-! ## FW-6 — the translating linear-germ witness -/

/-- The linear-germ weight profile anchored at `c`. -/
def wGerm (c u : ℝ) : ℝ := 1/2 - (u - c)/8

/-- Its elasticity profile. -/
def epsGerm (c u : ℝ) : ℝ := wGerm c u / (1 - wGerm c u)

/-- The re-anchoring (translation) kernel: `A_c = -ε_c'`, explicit closed form. -/
def Agerm (c u : ℝ) : ℝ := (1/8) / ((1/2 + (u - c)/8)^2)

/-
FW-6a: mode holds at every anchor.
-/
theorem germ_mode (c : ℝ) : epsGerm c c = 1 := by
  unfold epsGerm wGerm; norm_num

/-
FW-6b: the elasticity slope at every anchor is exactly `-1/2` (the frozen germ).
-/
theorem germ_slope (c : ℝ) : HasDerivAt (epsGerm c) (-(1/2)) c := by
  convert HasDerivAt.div ( show HasDerivAt ( fun u => wGerm c u ) ( - ( 1 / 8 ) ) c from ?_ ) ( show HasDerivAt ( fun u => 1 - wGerm c u ) ( 1 / 8 ) c from ?_ ) ?_ using 1 <;> norm_num [ wGerm ];
  · convert HasDerivAt.const_sub _ ( HasDerivAt.div_const ( HasDerivAt.sub ( hasDerivAt_id c ) ( hasDerivAt_const _ _ ) ) _ ) using 1 ; norm_num;
  · convert HasDerivAt.const_sub _ ( HasDerivAt.const_sub _ ( HasDerivAt.div_const ( HasDerivAt.sub ( hasDerivAt_id c ) ( hasDerivAt_const _ _ ) ) _ ) ) using 1 ; norm_num

/-
FW-6c: the translation kernel is the right one: `A_c(c) = 1/2` and `A_c` continuous at `c`.
-/
theorem germ_kernel (c : ℝ) : Agerm c c = 1/2 ∧ ContinuousAt (Agerm c) c := by
  norm_num [ Agerm ] at *;
  exact ContinuousAt.div continuousAt_const ( Continuous.continuousAt ( by continuity ) ) ( by norm_num )

/-
FW-6d (the witness): the translating linear-germ family satisfies BOTH first-order
contracts at every anchor.
-/
theorem germ_satisfies_both (c : ℝ) :
    TransportFO (epsGerm c) c (Agerm c c) ∧ ModeFO (epsGerm c) c (Agerm c) := by
  apply (joint_iff (epsGerm c) (Agerm c) c (-(1/2)) (germ_mode c) (germ_slope c) (germ_kernel c).2).mpr ⟨rfl, (germ_kernel c).1⟩

/-
FW-6e: validity. On the strip `(u-c)² < 8` the profile stays in `(0,1)` and sits strictly
inside the AMM-validity gate: the constant slope `w' = -1/8` satisfies `-1/8 > -(w(1-w))`.
-/
theorem germ_valid_strip (c u : ℝ) (h : (u - c)^2 < 8) :
    0 < wGerm c u ∧ wGerm c u < 1 ∧ -(wGerm c u * (1 - wGerm c u)) < -(1/8 : ℝ) := by
  exact ⟨ by unfold wGerm; nlinarith, by unfold wGerm; nlinarith, by unfold wGerm; nlinarith ⟩

#print axioms joint_iff
#print axioms germ_weight
#print axioms germ_mode
#print axioms germ_slope
#print axioms germ_kernel
#print axioms germ_satisfies_both
#print axioms germ_valid_strip

end

end FWGerm
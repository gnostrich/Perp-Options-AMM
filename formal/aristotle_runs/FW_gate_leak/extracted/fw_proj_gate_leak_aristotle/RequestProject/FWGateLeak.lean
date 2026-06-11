import Mathlib

/-!
# FW gate + leak — validity = generator convexity = R ⪰ 0, and the abstract arb-leak

Obligations FW-7 and FW-8 from `framework/FRAMEWORK_curve_agnostic_2026-06-11.md` §12.

## FW-7 (validity = convexity = R ⪰ 0)
For a weight profile `w : ℝ → ℝ` with `0 < w u < 1`, the implied log-price map is
`qmap w u = u + log (w u / (1 - w u))` and its derivative is `1 + w'/(w·(1-w))` — the
AMM-validity gate quantity. The generator `Φ` is any antiderivative of `qmap w`
(`Φ' = qmap w`); the dissipation metric is `R := (qmap w)' = Φ''`. Claims:
the strict gate (`R > 0` pointwise) gives `qmap w` strictly monotone and `Φ` strictly
convex; at the non-strict level `R ≥ 0` ⟺ `qmap w` monotone ⟺ `Φ` convex.

## FW-8 (leak ≥ 0, abstract)
For ANY monotone slope law `g : ℝ → ℝ` (no curve closed form), the arbitrage leak
`∫ s in u₁..u₂, (g u₂ - g s)` is nonnegative for BOTH orientations of `(u₁, u₂)`,
strictly positive for strictly monotone `g` and `u₁ < u₂`, and equals the Bregman gap
`(u₂-u₁)·g u₂ - (Φ u₂ - Φ u₁)` of any antiderivative `Φ` of `g`. This lifts the
GH-closed-form result (PH3_grounded) to the whole admission class.
-/

namespace FWGateLeak

noncomputable section

/-- Implied log-price map of a weight profile: `q(u) = u + log(odds (w u))`. -/
def qmap (w : ℝ → ℝ) (u : ℝ) : ℝ := u + Real.log (w u / (1 - w u))

/-- FW-7a: the gate identity. If `w` has derivative `w'` at `u` and `0 < w u < 1`, then
`qmap w` has derivative `1 + w' / (w u * (1 - w u))` at `u`. -/
theorem qmap_hasDerivAt (w : ℝ → ℝ) (u w' : ℝ)
    (hw : HasDerivAt w w' u) (h0 : 0 < w u) (h1 : w u < 1) :
    HasDerivAt (qmap w) (1 + w' / (w u * (1 - w u))) u := by
  convert HasDerivAt.add (hasDerivAt_id u) (HasDerivAt.log ?_ ?_) using 1
  rotate_left
  exact (w' * (1 - w u) - w u * (-w')) / (1 - w u) ^ 2
  · convert HasDerivAt.div hw (HasDerivAt.const_sub 1 hw) (by linarith : (1 - w u) ≠ 0) using 1
  · exact div_ne_zero h0.ne' (by linarith)
  · grind

/-- FW-7b: strict gate ⇒ strictly monotone log-price map. If `qmap w` has everywhere-positive
derivative `Q`, it is strictly monotone. -/
theorem gate_strictMono (w : ℝ → ℝ) (Q : ℝ → ℝ)
    (hd : ∀ u, HasDerivAt (qmap w) (Q u) u) (hpos : ∀ u, 0 < Q u) :
    StrictMono (qmap w) := by
  refine strictMono_of_deriv_pos ?_
  exact fun u => by rw [(hd u).deriv]; exact hpos u

/-- FW-7c: strict gate ⇒ strictly convex generator. If `Φ' = qmap w` everywhere and
`qmap w` is strictly monotone, then `Φ` is strictly convex on `ℝ`. -/
theorem gate_strictConvex (w : ℝ → ℝ) (Φ : ℝ → ℝ)
    (hΦ : ∀ u, HasDerivAt Φ (qmap w u) u) (hmono : StrictMono (qmap w)) :
    StrictConvexOn ℝ Set.univ Φ := by
  apply strictConvexOn_of_slope_strict_mono_adjacent
  · exact convex_univ
  · intros x y z _ _ hxy hyz
    have hcont : ContinuousOn Φ (Set.univ : Set ℝ) :=
      fun u _ => (hΦ u).continuousAt.continuousWithinAt
    have hcontxy : ContinuousOn Φ (Set.Icc x y) := hcont.mono (Set.subset_univ _)
    have hcontyz : ContinuousOn Φ (Set.Icc y z) := hcont.mono (Set.subset_univ _)
    have hdiffxy : DifferentiableOn ℝ Φ (Set.Ioo x y) :=
      fun u _ => (hΦ u).differentiableAt.differentiableWithinAt
    have hdiffyz : DifferentiableOn ℝ Φ (Set.Ioo y z) :=
      fun u _ => (hΦ u).differentiableAt.differentiableWithinAt
    obtain ⟨a, ha, ha'⟩ := exists_deriv_eq_slope Φ hxy hcontxy hdiffxy
    obtain ⟨b, hb, hb'⟩ := exists_deriv_eq_slope Φ hyz hcontyz hdiffyz
    rw [← ha', ← hb', (hΦ a).deriv, (hΦ b).deriv]
    exact hmono (by linarith [ha.1, ha.2, hb.1, hb.2])

/-- FW-7d: non-strict level, first leg. `R ≥ 0` pointwise (`Q` the derivative of `qmap w`)
iff `qmap w` is monotone. -/
theorem R_nonneg_iff_monotone (w : ℝ → ℝ) (Q : ℝ → ℝ)
    (hd : ∀ u, HasDerivAt (qmap w) (Q u) u) :
    (∀ u, 0 ≤ Q u) ↔ Monotone (qmap w) := by
  constructor <;> intro h
  · apply monotone_of_deriv_nonneg
    · exact fun u => (hd u).differentiableAt
    · exact fun u => by rw [(hd u).deriv]; exact h u
  · intro u
    have h_deriv_nonneg :
        Filter.Tendsto (fun h => (qmap w (u + h) - qmap w u) / h)
          (nhdsWithin 0 (Set.Ioi 0)) (nhds (Q u)) := by
      simpa [div_eq_inv_mul] using (hd u).tendsto_slope_zero_right
    exact le_of_tendsto_of_tendsto tendsto_const_nhds h_deriv_nonneg
      (Filter.eventually_of_mem self_mem_nhdsWithin fun x hx =>
        div_nonneg (sub_nonneg.2 <| h <| by linarith [hx.out]) hx.out.le)

/-- FW-7e: non-strict level, second leg. With `Φ' = qmap w` everywhere, `Φ` is convex on `ℝ`
iff `qmap w` is monotone. -/
theorem convex_iff_monotone (w : ℝ → ℝ) (Φ : ℝ → ℝ)
    (hΦ : ∀ u, HasDerivAt Φ (qmap w u) u) :
    ConvexOn ℝ Set.univ Φ ↔ Monotone (qmap w) := by
  have hcont : ContinuousOn Φ (Set.univ : Set ℝ) :=
    fun u _ => (hΦ u).continuousAt.continuousWithinAt
  constructor <;> intro H
  · -- convex ⇒ monotone derivative ⇒ `qmap w` monotone
    intro a b hab
    rcases lt_or_eq_of_le hab with hlt | rfl
    · -- pick `c₁ ∈ (a, a+1)` realizing a slope and `c₂ ∈ (b, b+1)` and compare via convexity
      have h_slope_mono : ∀ x y z : ℝ, x < y → y < z →
          (Φ y - Φ x) / (y - x) ≤ (Φ z - Φ y) / (z - y) := by
        intro x y z hxy hyz
        exact H.slope_mono_adjacent (Set.mem_univ x) (Set.mem_univ z) hxy hyz
      -- use the right-derivative limit characterization
      have h_deriv_def_a :
          Filter.Tendsto (fun h => (Φ (a + h) - Φ a) / h)
            (nhdsWithin 0 (Set.Ioi 0)) (nhds (deriv Φ a)) := by
        simpa [div_eq_inv_mul] using
          (hΦ a).differentiableAt.hasDerivAt.tendsto_slope_zero_right
      have h_deriv_def_b :
          Filter.Tendsto (fun h => (Φ (b + h) - Φ b) / h)
            (nhdsWithin 0 (Set.Ioi 0)) (nhds (deriv Φ b)) := by
        simpa [div_eq_inv_mul] using
          (hΦ b).differentiableAt.hasDerivAt.tendsto_slope_zero_right
      have h_pt : ∀ h : ℝ, 0 < h →
          (Φ (a + h) - Φ a) / h ≤ (Φ (b + h) - Φ b) / h := by
        intro h hh
        have h1 := h_slope_mono a (a + h) (b + h) (by linarith) (by linarith)
        have h2 := h_slope_mono a b (b + h) (by linarith) (by linarith)
        rw [div_le_div_iff₀ (by linarith) (by linarith)] at h1 h2 ⊢
        nlinarith [mul_pos hh (sub_pos.mpr hlt)]
      have hderiv_le : deriv Φ a ≤ deriv Φ b :=
        le_of_tendsto_of_tendsto h_deriv_def_a h_deriv_def_b
          (Filter.eventually_of_mem self_mem_nhdsWithin fun x hx => h_pt x hx)
      rw [← (hΦ a).deriv, ← (hΦ b).deriv]
      exact hderiv_le
    · exact le_refl _
  · -- monotone ⇒ convex
    apply convexOn_of_slope_mono_adjacent
    · exact convex_univ
    · intro x y z _ _ hxy hyz
      have hcontxy : ContinuousOn Φ (Set.Icc x y) := hcont.mono (Set.subset_univ _)
      have hcontyz : ContinuousOn Φ (Set.Icc y z) := hcont.mono (Set.subset_univ _)
      have hdiffxy : DifferentiableOn ℝ Φ (Set.Ioo x y) :=
        fun u _ => (hΦ u).differentiableAt.differentiableWithinAt
      have hdiffyz : DifferentiableOn ℝ Φ (Set.Ioo y z) :=
        fun u _ => (hΦ u).differentiableAt.differentiableWithinAt
      obtain ⟨c1, hc1, hc1'⟩ := exists_deriv_eq_slope Φ hxy hcontxy hdiffxy
      obtain ⟨c2, hc2, hc2'⟩ := exists_deriv_eq_slope Φ hyz hcontyz hdiffyz
      rw [← hc1', ← hc2', (hΦ c1).deriv, (hΦ c2).deriv]
      exact H (by linarith [hc1.1, hc1.2, hc2.1, hc2.2])

/-! ## FW-8 — the abstract leak -/

/-- FW-8a: for ANY monotone slope law, the arb leak is nonnegative — both orientations. -/
theorem leak_nonneg (g : ℝ → ℝ) (hg : Monotone g) (u₁ u₂ : ℝ) :
    0 ≤ ∫ s in u₁..u₂, (g u₂ - g s) := by
  cases le_total u₁ u₂ <;> simp_all +decide [intervalIntegral]
  · exact MeasureTheory.setIntegral_nonneg measurableSet_Ioc fun x hx => sub_nonneg.2 <| hg hx.2
  · exact MeasureTheory.setIntegral_nonpos measurableSet_Ioc fun x hx => sub_nonpos_of_le <| hg hx.1.le

/-- FW-8b: strictly positive leak for a strictly monotone slope law and a genuine move. -/
theorem leak_pos (g : ℝ → ℝ) (hg : StrictMono g) (u₁ u₂ : ℝ) (h : u₁ < u₂) :
    0 < ∫ s in u₁..u₂, (g u₂ - g s) := by
  rw [intervalIntegral.integral_of_le h.le,
    MeasureTheory.integral_pos_iff_support_of_nonneg_ae]
  · simp +decide [Function.support]
    exact lt_of_lt_of_le (by aesop)
      (MeasureTheory.measure_mono <|
        show Set.Ioo u₁ u₂ ⊆ {x | ¬g u₂ - g x = 0} ∩ Set.Ioc u₁ u₂ from
          fun x hx => ⟨ne_of_gt <| sub_pos.mpr <| hg hx.2, ⟨hx.1, hx.2.le⟩⟩)
  · filter_upwards [MeasureTheory.ae_restrict_mem measurableSet_Ioc] with x hx
      using sub_nonneg_of_le <| hg.monotone hx.2
  · refine MeasureTheory.Integrable.sub ?_ ?_
    · norm_num
    · exact (hg.monotone.intervalIntegrable ..).1

/-- FW-8c: the leak is the Bregman gap of any antiderivative of the slope law
(the generator-layer reading: leak = supplied − stored). -/
theorem leak_eq_bregman (g : ℝ → ℝ) (Φ : ℝ → ℝ) (hg : Monotone g)
    (hΦ : ∀ u, HasDerivAt Φ (g u) u) (u₁ u₂ : ℝ) :
    ∫ s in u₁..u₂, (g u₂ - g s) = (u₂ - u₁) * g u₂ - (Φ u₂ - Φ u₁) := by
  rw [intervalIntegral.integral_sub] <;> norm_num
  · rw [intervalIntegral.integral_eq_sub_of_hasDerivAt]
    · exact fun x _ => hΦ x
    · exact hg.intervalIntegrable ..
  · exact hg.intervalIntegrable ..

end

#print axioms qmap_hasDerivAt
#print axioms gate_strictMono
#print axioms gate_strictConvex
#print axioms R_nonneg_iff_monotone
#print axioms convex_iff_monotone
#print axioms leak_nonneg
#print axioms leak_pos
#print axioms leak_eq_bregman

end FWGateLeak

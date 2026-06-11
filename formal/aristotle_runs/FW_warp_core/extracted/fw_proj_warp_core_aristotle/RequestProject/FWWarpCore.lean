import Mathlib

/-!
# FW warp core — the paper's Balancer Trade Formula as the warp principle's verified instance

Obligations FW-1, FW-2, FW-3, FW-4, FW-13, and the FW-11 Balancer instance from
`framework/FRAMEWORK_curve_agnostic_2026-06-11.md` §12.

## The pinned objects

State = reserves and weight `(x, y, w) : ℝ × ℝ × ℝ` with `0 < x`, `0 < y`, `0 < w`, `w < 1`.

* Foliation slope field (constant-weight Cobb–Douglas leaf through `(x,y)` at weight `w`):
  `slope w x y = (w / (1-w)) * (y / x)`.
* Paper Trade Formula (closed form), cash leg `t` added to `y`:
  `yNew y t = y + t`, `wNew w y t = 1 - (y*(1-w))/(y+t)`, `xNew x w y t = (x*w) / wNew w y t`.
* First integrals: `α = x*w` and `β = y*(1-w)`.
* Validity domain for a trade from `(x,y,w)`: `-(w*y) < t` (keeps `y+t > y*(1-w) > 0`,
  hence `0 < wNew < 1`).

Everything below is real-number algebra/calculus; no measure theory needed.
-/

namespace FWWarpCore

noncomputable section

/-- Foliation slope field: the constant-weight CD leaf through `(x,y)` at weight `w` has
`|dy/dx| = (w/(1-w))·(y/x)` there. -/
def slope (w x y : ℝ) : ℝ := (w / (1 - w)) * (y / x)

/-- Post-trade `y` (cash leg `t` added to the `y` reserve). -/
def yNew (y t : ℝ) : ℝ := y + t

/-- Post-trade weight (the paper's Trade Formula, in the `β`-conservation form). -/
def wNew (w y t : ℝ) : ℝ := 1 - (y * (1 - w)) / (y + t)

/-- Post-trade `x` (the paper's Trade Formula, in the `α`-conservation form). -/
def xNew (x w y t : ℝ) : ℝ := (x * w) / wNew w y t

/-- Validity of a trade `t` from state `(x,y,w)`. -/
def Valid (w y t : ℝ) : Prop := -(w * y) < t

/-! ## Basic state facts on the validity domain -/

theorem yNew_pos {w y t : ℝ} (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    (hv : Valid w y t) : 0 < yNew y t := by
  unfold yNew at *;
  unfold Valid at hv; nlinarith;

theorem wNew_pos {w y t : ℝ} (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    (hv : Valid w y t) : 0 < wNew w y t := by
  unfold wNew;
  unfold Valid at hv;
  rw [ sub_pos, div_lt_iff₀ ] <;> nlinarith

theorem wNew_lt_one {w y t : ℝ} (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    (hv : Valid w y t) : wNew w y t < 1 := by
  unfold wNew;
  unfold Valid at hv; nlinarith [ mul_pos hw0 hy, mul_pos ( sub_pos.mpr hw1 ) hy, mul_div_cancel₀ ( y * ( 1 - w ) ) ( by nlinarith [ mul_pos hw0 hy, mul_pos ( sub_pos.mpr hw1 ) hy ] : ( y + t ) ≠ 0 ) ] ;

theorem xNew_pos {x w y t : ℝ} (hx : 0 < x) (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    (hv : Valid w y t) : 0 < xNew x w y t := by
  exact div_pos ( mul_pos hx hw0 ) ( wNew_pos hy hw0 hw1 hv )

/-! ## FW-1 — the closed form is the flow of the infinitesimal warp law

`d y/dt = 1`, `d w/dt = (1 - w(t)) / y(t)`  (the slope-transport law `dw = (1-w)·dy/y`
read at the CURRENT, already-bent state), and `d x/dt = - 1 / slope(current state)`
(token faithfulness read off the already-bent curve), with `α`, `β` first integrals. -/

/-- FW-1a: the `w`-leg of the flow. At every `t` in the validity domain the closed form
satisfies `w'(t) = (1 - w(t)) / y(t)` — the paper's infinitesimal warp law at the
current (already-bent) state. -/
theorem hasDerivAt_wNew {w y : ℝ} (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    {t : ℝ} (hv : Valid w y t) :
    HasDerivAt (fun s => wNew w y s) ((1 - wNew w y t) / yNew y t) t := by
  convert HasDerivAt.const_sub _ <| HasDerivAt.div ( hasDerivAt_const _ _ ) ( hasDerivAt_id' t |> HasDerivAt.const_add _ ) _ using 1 <;> norm_num [ yNew, wNew ];
  · grind +revert;
  · exact ne_of_gt ( by unfold Valid at hv; nlinarith )

/-- FW-1b: the `x`-leg of the flow. `x'(t) = - 1 / slope(state(t))` — token faithfulness,
each slice read off the already-bent curve (slope at the CURRENT state, not the initial one). -/
theorem hasDerivAt_xNew {x w y : ℝ} (hx : 0 < x) (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    {t : ℝ} (hv : Valid w y t) :
    HasDerivAt (fun s => xNew x w y s)
      (-(1 / slope (wNew w y t) (xNew x w y t) (yNew y t))) t := by
  convert HasDerivAt.mul ( hasDerivAt_const _ _ ) ( HasDerivAt.inv ( hasDerivAt_wNew hy hw0 hw1 hv ) _ ) using 1 <;> norm_num [ xNew, slope, yNew ];
  · ring;
  · exact ne_of_gt ( wNew_pos hy hw0 hw1 hv )

/-- FW-1c: `α = x·w` is a first integral of the trade flow (exact, not just stationary). -/
theorem alpha_conserved {x w y t : ℝ} (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    (hv : Valid w y t) :
    xNew x w y t * wNew w y t = x * w := by
  exact div_mul_cancel₀ _ <| ne_of_gt <| wNew_pos hy hw0 hw1 hv

/-- FW-1d: `β = y·(1-w)` is a first integral of the trade flow (exact). -/
theorem beta_conserved {w y t : ℝ} (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    (hv : Valid w y t) :
    yNew y t * (1 - wNew w y t) = y * (1 - w) := by
  unfold yNew wNew; rw [ sub_div' ] <;> ring;
  · cases eq_or_ne ( y + t ) 0 <;> simp_all +decide [ sq, mul_assoc, mul_comm, mul_left_comm ];
    · unfold Valid at hv; nlinarith;
    · grind;
  · unfold Valid at hv; nlinarith

/-! ## FW-2 — reading-1 slope transport forces `dw = (1-w)·dy/y` uniquely

One-shot transport at the mark: sliding along the FROZEN leaf `x^w·y^(1-w) = const` with cash
`t` lands at `y_d = y + t`, `x_d = x·(y/(y+t))^((1-w)/w)`; reading-1 brings the destination
slope to the pre-trade point read through the new leaf there:
`(W t)/(1 - W t) · (y/x) = (w/(1-w)) · (y_d/x_d)`,
equivalently `odds (W t) = odds w · ((y+t)/y)^(1/w)` where `odds v = v/(1-v)`.
The unique first-order content is `W'(0) = (1-w)/y` — the paper's `dw`. -/

/-- Odds map. -/
def odds (v : ℝ) : ℝ := v / (1 - v)

/-- The transported odds demand: `odds w · ((y+t)/y)^(1/w)` (real power). -/
def transOdds (w y t : ℝ) : ℝ := odds w * ((y + t) / y) ^ (1 / w : ℝ)

/-- FW-2a: the canonical solution `W t = transOdds/(1+transOdds)` of the transport equation
has derivative `(1-w)/y` at `t = 0`. -/
theorem transport_deriv {w y : ℝ} (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1) :
    HasDerivAt (fun t => transOdds w y t / (1 + transOdds w y t)) ((1 - w) / y) 0 := by
  convert HasDerivAt.div ( HasDerivAt.const_mul ( odds w ) ( HasDerivAt.rpow_const ( HasDerivAt.div_const ( hasDerivAt_id 0 |> HasDerivAt.const_add y ) _ ) _ ) ) ( HasDerivAt.add ( hasDerivAt_const _ _ ) ( HasDerivAt.const_mul ( odds w ) ( HasDerivAt.rpow_const ( HasDerivAt.div_const ( hasDerivAt_id 0 |> HasDerivAt.const_add y ) _ ) _ ) ) ) _ using 1 <;> norm_num;
  · field_simp;
    rw [ eq_div_iff ] <;> norm_num [ odds ] <;> ring;
    · grind;
    · nlinarith [ mul_inv_cancel₀ ( by linarith : ( 1 - w ) ≠ 0 ) ];
  · exact Or.inl hy.ne';
  · exact Or.inl hy.ne';
  · rw [ div_self hy.ne' ] ; norm_num [ odds ] ; ring_nf ; nlinarith [ inv_mul_cancel₀ ( ne_of_gt hw0 ), inv_mul_cancel₀ ( ne_of_gt ( sub_pos.mpr hw1 ) ) ]

/-- FW-2b (uniqueness): ANY weight path `V` valued in `(0,1)` near `0` that satisfies the exact
transport equation `odds (V t) = transOdds w y t` near `0` has `V'(0) = (1-w)/y`. -/
theorem transport_unique {w y : ℝ} (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    (V : ℝ → ℝ) (hV01 : ∀ᶠ t in nhds 0, V t ∈ Set.Ioo (0:ℝ) 1)
    (hVeq : ∀ᶠ t in nhds 0, odds (V t) = transOdds w y t) :
    HasDerivAt V ((1 - w) / y) 0 := by
  convert ( Filter.EventuallyEq.hasDerivAt_iff _ ).mpr ( transport_deriv hy hw0 hw1 ) using 1;
  filter_upwards [ hV01, hVeq ] with t ht1 ht2;
  grind +locals

/-! ## FW-3 — round-trip identity (fee-free J-leg losslessness) -/

/-- FW-3: trade `t` then trade `-t` returns `(x, y, w)` exactly. -/
theorem round_trip {x w y t : ℝ} (hx : 0 < x) (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    (hv : Valid w y t) :
    yNew (yNew y t) (-t) = y ∧
    wNew (wNew w y t) (yNew y t) (-t) = w ∧
    xNew (xNew x w y t) (wNew w y t) (yNew y t) (-t) = x := by
  unfold yNew wNew xNew;
  unfold wNew;
  by_cases h : y + t = 0 <;> simp_all +decide [ mul_div_cancel₀ ];
  · unfold Valid at hv; nlinarith;
  · field_simp;
    exact ⟨ by ring, by rw [ div_eq_iff ] <;> nlinarith [ mul_self_pos.2 h, mul_pos hy hw0, mul_pos hy ( sub_pos.2 hw1 ), mul_pos hw0 ( sub_pos.2 hw1 ), hv, show - ( w * y ) < t from hv ] ⟩

/-! ## FW-13 — semigroup / partition-independence (Balancer instance) -/

/-- FW-13: trade `t₁` then trade `t₂` equals the single trade `t₁ + t₂` (all components).
Hypotheses make both the intermediate and the combined state valid. -/
theorem semigroup {x w y t₁ t₂ : ℝ} (hx : 0 < x) (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    (hv1 : Valid w y t₁) (hv12 : Valid w y (t₁ + t₂)) :
    yNew (yNew y t₁) t₂ = yNew y (t₁ + t₂) ∧
    wNew (wNew w y t₁) (yNew y t₁) t₂ = wNew w y (t₁ + t₂) ∧
    xNew (xNew x w y t₁) (wNew w y t₁) (yNew y t₁) t₂ = xNew x w y (t₁ + t₂) := by
  unfold xNew wNew yNew;
  simp_all +decide [ Valid ];
  by_cases h : y + t₁ = 0 <;> simp_all +decide [ mul_div_cancel₀, add_assoc ];
  · nlinarith;
  · rw [ div_mul_cancel₀ _ ( by exact ne_of_gt ( sub_pos_of_lt ( by rw [ div_lt_iff₀ ] <;> nlinarith ) ) ) ]

/-! ## FW-4 — mode-violation law (constant-weight foliation breaks mode-at-mark) -/

/-- FW-4a: post-trade elasticity at the new mark equals `(α/β)·(y'/x')` exactly. -/
theorem elasticity_post {x w y t : ℝ} (hx : 0 < x) (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    (hv : Valid w y t) :
    wNew w y t / (1 - wNew w y t)
      = ((x * w) / (y * (1 - w))) * (yNew y t / xNew x w y t) := by
  unfold wNew yNew xNew;
  unfold wNew; ring;
  grind +qlia

/-- FW-4b: from the symmetric state (`x = y`, `w = 1/2`) the post-trade elasticity at the
new mark is `1 + 2t/y` — hence `≠ 1` for every `t ≠ 0`: the constant-weight warp breaks
mode-at-mark at first order, with the violation linear in the trade. -/
theorem elasticity_symmetric {y t : ℝ} (hy : 0 < y) (hv : Valid (1/2) y t) :
    wNew (1/2) y t / (1 - wNew (1/2) y t) = 1 + 2 * t / y := by
  unfold wNew;
  by_cases h : y + t = 0 <;> simp_all +decide [ mul_comm y ];
  · unfold Valid at hv; norm_num at hv; nlinarith [ mul_div_cancel₀ ( 2 * t ) hy.ne' ] ;
  · grind

/-! ## FW-11 (Balancer instance) — the warp flow commutes with rebase

Rebase by `r > 0` re-denominates the `y` ledger: `(x, y, w) ↦ (x, y/r, w)`; the cash leg
re-denominates with it (`t ↦ t/r`). The trade flow commutes with this gauge action. -/

theorem rebase_commute {x w y t r : ℝ} (hx : 0 < x) (hy : 0 < y) (hw0 : 0 < w) (hw1 : w < 1)
    (hr : 0 < r) (hv : Valid w y t) :
    yNew (y / r) (t / r) = yNew y t / r ∧
    wNew w (y / r) (t / r) = wNew w y t ∧
    xNew x w (y / r) (t / r) = xNew x w y t := by
  have hr' : r ≠ 0 := ne_of_gt hr
  have hw : wNew w (y / r) (t / r) = wNew w y t := by
    unfold wNew; rw [← add_div]; field_simp
  refine ⟨by unfold yNew; rw [← add_div], hw, by unfold xNew; rw [hw]⟩

end

/-! ## Axiom audit -/

#print axioms yNew_pos
#print axioms wNew_pos
#print axioms wNew_lt_one
#print axioms xNew_pos
#print axioms hasDerivAt_wNew
#print axioms hasDerivAt_xNew
#print axioms alpha_conserved
#print axioms beta_conserved
#print axioms transport_deriv
#print axioms transport_unique
#print axioms round_trip
#print axioms semigroup
#print axioms elasticity_post
#print axioms elasticity_symmetric
#print axioms rebase_commute

end FWWarpCore
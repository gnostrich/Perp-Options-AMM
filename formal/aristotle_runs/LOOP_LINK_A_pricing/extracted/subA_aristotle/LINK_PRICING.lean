/-
LINK_PRICING — MISSING FORMAL LINK (a): per-LP aggregation ⇄ engine pricing.

CONTEXT. `BOOK_FORMAL` / `MAP_FORMAL` / `BASIS_FORMAL` prove that a book built from
N heterogeneous LPs is butterfly-arbitrage-free PROVIDED each LP's private level
curve is `MidConvex`. That hypothesis is currently CARRIED — nothing in the project
exhibits the curve the live engine actually prices with, nor proves it satisfies the
hypothesis. This file closes that gap in both directions.

THE ENGINE CURVE. The live engine prices a perpetual American option with an
option-value power law of lensed exponent `g = m·γ > 1` welded C¹ onto the LINEAR
intrinsic at the smooth-pasting boundary `S* = K·g/(g+1)`. In moneyness coordinates
`k = K/S − 1` (so `k = 0` is at the money, `k > −1` always, and put–call parity reads
`C k − P k = −k`, exactly `BOOK_FORMAL`'s convention) the OTM mark is the power law
`A_g · (1+k)^(−g)` on the call wing and `A_g · (1+k)^(g)` on the put wing, with the
ATM mark

    A_g = 1 / ((g+1) · ((g+1)/g)^g)                        (`atmMark`)

which is the shipped `c = 1/((g+1)·sNorm*)` evaluated at `sNorm* = ((g+1)/g)^g`.
Parity extends the put wing to a CALL value below the money, and below `k = −1`
(non-positive strike) the call is pure intrinsic `−k`. That is `engineCall`.

WHAT IS TO BE PROVED.
  §1 `atm_kink_bound`  — the sharp ATM slope condition `2·g·A_g ≤ 1`.
  §2 `engine_call_midconvex` — the engine curve is midpoint convex. THIS DISCHARGES
     the standing hypothesis of `BOOK_FORMAL.butterfly_nonneg` / `agg_midconvex` /
     `BASIS_FORMAL.book_arb_free` for the curve the engine actually posts.
  §3 `engine_book_arb_free`, `engine_book_parity` — the payoff: a book of LPs each
     priced by the engine lens, EACH AT ITS OWN `g i` (this is the operator's
     "LPs choose their own exposure profiles"), is butterfly-arb-free and stays
     parity-anchored to the one cleared perp.
  §4 `mixture_strict_log_convex`, `mixture_not_single_lens` — the OBSTRUCTION. A
     single lens is LOG-AFFINE in log-strike on the OTM side; a nontrivial mixture of
     two DISTINCT lenses is STRICTLY log-convex there. So the aggregate book carries a
     smile that NO single-`m` engine curve reproduces. Heterogeneous LP profiles and a
     single-lens pricing engine are formally incompatible.

NOTHING IN `BOOK_FORMAL`, `MAP_FORMAL` OR `BASIS_FORMAL` MAY BE EDITED. Those three
files are fixed context; add proofs only in this file.
-/

import BASIS_FORMAL
import Mathlib.Analysis.SpecialFunctions.Pow.Real
import Mathlib.Analysis.SpecialFunctions.Log.Basic
import Mathlib.Analysis.Convex.Slope
import Mathlib.Analysis.Convex.SpecificFunctions.Basic
import Mathlib.Analysis.SpecialFunctions.Exp

namespace LinkPricing

open scoped BigOperators
open BookFormal MapFormal BasisFormal

/-! ## §0 The engine's curve, in `BOOK_FORMAL`'s moneyness coordinate -/

/-- The ATM mark of the engine's lensed smooth-paste curve at lens exponent `g`.
`^` here is `Real.rpow`. -/
noncomputable def atmMark (g : ℝ) : ℝ := 1 / ((g + 1) * ((g + 1) / g) ^ g)

/-- The engine's option value, read as a CALL, at moneyness `k = K/S − 1`.

* `k ≥ 0`  — out of the money: the power law `A_g (1+k)^(−g)`.
* `−1 ≤ k < 0` — in the money: parity applied to the OTM put mark `A_g (1+k)^(g)`,
  i.e. `A_g (1+k)^g − k`.
* `k < −1` — non-positive strike, pure intrinsic `−k` (the `C¹` continuation: at
  `k = −1` the middle branch has value `1` and slope `−1` for `g ≥ 1`).
-/
noncomputable def engineCall (g k : ℝ) : ℝ :=
  if 0 ≤ k then atmMark g * (1 + k) ^ (-g)
  else if -1 ≤ k then atmMark g * (1 + k) ^ g - k
  else -k

/-- The engine's put, defined by parity so that `C k − P k = −k` holds definitionally. -/
noncomputable def enginePut (g k : ℝ) : ℝ := engineCall g k + k

theorem engine_parity (g k : ℝ) : engineCall g k - enginePut g k = -k := by
  unfold enginePut; ring

theorem atmMark_pos {g : ℝ} (hg : 0 < g) : 0 < atmMark g := by
  have h2 : (0:ℝ) < ((g + 1) / g) ^ g := Real.rpow_pos_of_pos (by positivity) _
  have h1 : (0:ℝ) < g + 1 := by linarith
  unfold atmMark
  positivity

/-! ### Elementary analytic inputs

Two tangent-line (supporting-line) inequalities for the real power functions, and
the sharp bound `(g+1)·A_g ≤ 1/2` for `g ≥ 1`, are all the analysis §1–§2 need. -/

/-- Bernoulli: `(1 + 1/g)^g ≥ 2` for `g ≥ 1`. This is the tight input behind
`atmMark_le_half_of_one_le` (equality at `g = 1`). -/
private theorem two_le_lensNorm {g : ℝ} (hg : 1 ≤ g) : 2 ≤ ((g + 1) / g) ^ g := by
  have hg0 : (0:ℝ) < g := lt_of_lt_of_le one_pos hg
  have he : (g + 1) / g = 1 + 1 / g := by field_simp
  have hs : (-1:ℝ) ≤ 1 / g := by
    have : (0:ℝ) < 1 / g := by positivity
    linarith
  have h := one_add_mul_self_le_rpow_one_add (s := 1 / g) hs (p := g) hg
  rw [he]
  have hgg : g * (1 / g) = 1 := by field_simp
  rw [hgg] at h
  linarith

/-- `(g+1)·A_g = (g/(g+1))^g ≤ 1/2` for `g ≥ 1`. Sharp at `g = 1`. -/
private theorem atmMark_le_half_of_one_le {g : ℝ} (hg : 1 ≤ g) :
    (g + 1) * atmMark g ≤ 1 / 2 := by
  have hg0 : (0:ℝ) < g := lt_of_lt_of_le one_pos hg
  have hR := two_le_lensNorm hg
  have hRpos : (0:ℝ) < ((g + 1) / g) ^ g := Real.rpow_pos_of_pos (by positivity) _
  unfold atmMark
  rw [mul_one_div, div_le_div_iff₀ (by positivity) (by norm_num)]
  nlinarith [hR]

/-- Tangent line of `u ↦ u^(−g)` at `u = s`, for `g ≥ 0`: the function is convex on
`(0, ∞)`, so it lies above each of its tangents. -/
private theorem rpow_neg_tangent {u s g : ℝ} (hu : 0 < u) (hs : 0 < s) (hg : 0 ≤ g) :
    s ^ (-g) - g * s ^ (-g - 1) * (u - s) ≤ u ^ (-g) := by
  have ht : (0:ℝ) < u / s := by positivity
  have hsplit : u ^ (-g) = s ^ (-g) * (u / s) ^ (-g) := by
    rw [← Real.mul_rpow hs.le ht.le]; congr 1; field_simp
  have hlog : Real.log (u / s) ≤ u / s - 1 := Real.log_le_sub_one_of_pos ht
  have hexp : (1:ℝ) - g * (u / s - 1) ≤ (u / s) ^ (-g) := by
    rw [Real.rpow_def_of_pos ht]
    have hx := Real.add_one_le_exp (Real.log (u / s) * (-g))
    nlinarith [hx, hlog, hg]
  have hspos : (0:ℝ) < s ^ (-g) := Real.rpow_pos_of_pos hs _
  have hexpo : s ^ (-g - 1) = s ^ (-g) / s := by rw [Real.rpow_sub hs, Real.rpow_one]
  rw [hsplit, hexpo]
  have h2 : s ^ (-g) * (1 - g * (u / s - 1)) ≤ s ^ (-g) * (u / s) ^ (-g) :=
    mul_le_mul_of_nonneg_left hexp hspos.le
  have heq : s ^ (-g) * (1 - g * (u / s - 1)) = s ^ (-g) - g * (s ^ (-g) / s) * (u - s) := by
    field_simp
  linarith [heq ▸ h2]

/-- Tangent line of `u ↦ u^g` at `u = s`, for `g ≥ 1` — i.e. Bernoulli's inequality
rescaled. -/
private theorem rpow_pos_tangent {u s g : ℝ} (hu : 0 ≤ u) (hs : 0 < s) (hg : 1 ≤ g) :
    s ^ g + g * s ^ (g - 1) * (u - s) ≤ u ^ g := by
  have ht : (0:ℝ) ≤ u / s := by positivity
  have hsplit : u ^ g = s ^ g * (u / s) ^ g := by
    rw [← Real.mul_rpow hs.le ht]; congr 1; field_simp
  have hz : (-1:ℝ) ≤ u / s - 1 := by linarith
  have hb := one_add_mul_self_le_rpow_one_add hz hg
  have hb' : 1 + g * (u / s - 1) ≤ (u / s) ^ g := by
    have h1 : (1:ℝ) + (u / s - 1) = u / s := by ring
    rwa [h1] at hb
  have hspos : (0:ℝ) < s ^ g := Real.rpow_pos_of_pos hs _
  have hexpo : s ^ (g - 1) = s ^ g / s := by rw [Real.rpow_sub hs, Real.rpow_one]
  rw [hsplit, hexpo]
  have h2 : s ^ g * (1 + g * (u / s - 1)) ≤ s ^ g * (u / s) ^ g :=
    mul_le_mul_of_nonneg_left hb' hspos.le
  have heq : s ^ g * (1 + g * (u / s - 1)) = s ^ g + g * (s ^ g / s) * (u - s) := by
    field_simp
  linarith [heq ▸ h2]

/-! ## §1 The sharp ATM slope condition

`engineCall` has a kink at `k = 0`: the left slope is `g·A_g − 1` and the right slope
is `−g·A_g`. Convexity at the kink is exactly `g·A_g − 1 ≤ −g·A_g`, i.e. `2 g A_g ≤ 1`.

PROOF SKETCH (verified numerically; `atmMark`'s value makes this an identity in
disguise). `2 g A_g ≤ 1` unfolds to `2 g ≤ (g+1) · ((g+1)/g)^g`. Taking logs and
cancelling `log g`, this is EXACTLY

    (g+1) · log (1 + 1/g) ≥ log 2,

and in fact the stronger `(g+1) · log (1 + 1/g) ≥ 1 > log 2` holds, from the standard
bound `log (1+x) ≥ x/(1+x)` at `x = 1/g` (which is `Real.add_one_le_exp` applied to
`1/(1+x)`). The margin never closes: the left side decreases to `1` as `g → ∞`. -/
theorem atm_kink_bound {g : ℝ} (hg : 0 < g) : 2 * g * atmMark g ≤ 1 := by
  have h1 : (0:ℝ) < g + 1 := by linarith
  have hq : (0:ℝ) < (g + 1) / g := by positivity
  -- `log (1 + 1/g) ≥ 1/(g+1)`, from `log x ≤ x - 1` applied to `x = g/(g+1)`.
  have hlog : 1 / (g + 1) ≤ Real.log ((g + 1) / g) := by
    have h := Real.log_le_sub_one_of_pos (x := g / (g + 1)) (by positivity)
    have hinv : Real.log (g / (g + 1)) = -Real.log ((g + 1) / g) := by
      rw [← Real.log_inv]; congr 1; field_simp
    rw [hinv] at h
    have h4 : g / (g + 1) - 1 = -(1 / (g + 1)) := by field_simp; ring
    rw [h4] at h
    linarith
  have hR : ((g + 1) / g) ^ g = Real.exp (Real.log ((g + 1) / g) * g) :=
    Real.rpow_def_of_pos hq g
  have hexp : 1 + g / (g + 1) ≤ ((g + 1) / g) ^ g := by
    rw [hR]
    have h2 := Real.add_one_le_exp (Real.log ((g + 1) / g) * g)
    have h3 : g / (g + 1) ≤ Real.log ((g + 1) / g) * g := by
      have h5 : g * (1 / (g + 1)) = g / (g + 1) := by ring
      nlinarith [hlog, hg.le]
    linarith
  have hRpos : (0:ℝ) < ((g + 1) / g) ^ g := Real.rpow_pos_of_pos hq _
  have key : 2 * g ≤ (g + 1) * ((g + 1) / g) ^ g := by
    have h6 : (g + 1) * (1 + g / (g + 1)) = 2 * g + 1 := by field_simp; ring
    nlinarith [hexp]
  unfold atmMark
  rw [mul_one_div, div_le_one (by positivity)]
  linarith

/-! ## §2 THE BRIDGE: the engine curve satisfies the aggregation's standing hypothesis

Second derivatives, branch by branch (all on `g ≥ 1`, which holds since `g = m·γ`
with `γ > 1` and `m ≥ 1`):
* `k > 0`:      `A_g · g(g+1) (1+k)^(−g−2) > 0`.
* `−1 < k < 0`: `A_g · g(g−1) (1+k)^(g−2) ≥ 0`  — this is where `g ≥ 1` is used.
* `k < −1`:     affine.
Joins: at `k = 0` the slope jumps UP by `1 − 2 g A_g ≥ 0` (§1); at `k = −1` the slopes
agree (both `−1`) for `g ≥ 1`. Hence convex on all of `ℝ`, hence midpoint convex.

A workable Lean route: prove `ConvexOn ℝ (Set.Ici 0) _`, `ConvexOn ℝ (Set.Icc (-1) 0) _`
and `ConvexOn ℝ (Set.Iic (-1)) _` separately (each by a second-derivative or slope
argument), then glue with the slope conditions above; or prove `MidConvex` directly by
case analysis on the signs of `a`, `b`, `(a+b)/2`. `MidConvex` (the goal) is the weaker
midpoint form, so a full `ConvexOn ℝ Set.univ` result may be proved first and
specialised. -/
/-- Value at the money: `engineCall g 0 = A_g`. -/
private theorem engineCall_zero (g : ℝ) : engineCall g 0 = atmMark g := by
  simp [engineCall]

/-- Below `k = -1` (including the join itself) the curve is pure intrinsic. -/
private theorem engineCall_of_le_neg_one {g : ℝ} (hg : 0 < g) {x : ℝ} (hx : x ≤ -1) :
    engineCall g x = -x := by
  rcases lt_or_eq_of_le hx with h | h
  · have h1 : ¬ (0:ℝ) ≤ x := by linarith
    have h2 : ¬ (-1:ℝ) ≤ x := by linarith
    simp [engineCall, h1, h2]
  · subst h
    have h1 : ¬ (0:ℝ) ≤ (-1:ℝ) := by norm_num
    simp [engineCall, h1, Real.zero_rpow hg.ne']

/-- The curve dominates the intrinsic value everywhere. -/
private theorem engineCall_ge_neg {g : ℝ} (hg : 0 < g) (k : ℝ) : -k ≤ engineCall g k := by
  unfold engineCall
  split_ifs with h1 h2
  · have : 0 < atmMark g * (1 + k) ^ (-g) :=
      mul_pos (atmMark_pos hg) (Real.rpow_pos_of_pos (by linarith) _)
    linarith
  · have : 0 ≤ atmMark g * (1 + k) ^ g :=
      mul_nonneg (atmMark_pos hg).le (Real.rpow_nonneg (by linarith) _)
    linarith
  · exact le_rfl

/-- Right-hand tangent at the money: `F k ≥ A_g − g·A_g·k` for `k ≥ 0`. -/
private theorem engine_tangent_zero {g : ℝ} (hg : 1 ≤ g) {k : ℝ} (hk : 0 ≤ k) :
    atmMark g - g * atmMark g * k ≤ engineCall g k := by
  have hg0 : (0:ℝ) < g := lt_of_lt_of_le one_pos hg
  have hA := atmMark_pos hg0
  have ht := rpow_neg_tangent (u := 1 + k) (s := 1) (g := g) (by linarith) one_pos hg0.le
  simp only [Real.one_rpow] at ht
  have h2 : atmMark g * (1 - g * (1 + k - 1)) ≤ atmMark g * (1 + k) ^ (-g) :=
    mul_le_mul_of_nonneg_left (by linarith) hA.le
  unfold engineCall
  rw [if_pos hk]
  nlinarith [h2]

/-- Left-hand tangent at the money: `F k ≥ A_g + g·A_g·(−k)` for `k ≤ 0`. This is the
only place the two lower branches are used, and it is where `2 g A_g ≤ 1` bites. -/
private theorem engine_left_bound {g : ℝ} (hg : 1 ≤ g) {k : ℝ} (hk : k ≤ 0) :
    atmMark g + g * atmMark g * (-k) ≤ engineCall g k := by
  have hg0 : (0:ℝ) < g := lt_of_lt_of_le one_pos hg
  have hA := atmMark_pos hg0
  have hA2 := atmMark_le_half_of_one_le hg
  have hB : g * atmMark g ≤ 1 / 2 := by nlinarith
  have hAle : atmMark g ≤ 1 / 2 := by nlinarith
  rcases eq_or_lt_of_le hk with h | hk0
  · subst h
    simp [engineCall_zero]
  · rcases le_or_gt (-1) k with h1 | h1
    · have ht := rpow_pos_tangent (u := 1 + k) (s := 1) (g := g) (by linarith) one_pos hg
      simp only [Real.one_rpow] at ht
      have h2 : atmMark g * (1 + g * (1 + k - 1)) ≤ atmMark g * (1 + k) ^ g :=
        mul_le_mul_of_nonneg_left (by linarith) hA.le
      unfold engineCall
      rw [if_neg (by linarith), if_pos h1]
      nlinarith [h2]
    · unfold engineCall
      rw [if_neg (by linarith), if_neg (by linarith)]
      nlinarith

/-- A GLOBAL SUPPORTING LINE AT EVERY POINT. Each branch supplies its own tangent, and
the branches are chained through the joins `k = 0` and `k = -1` using the slope
inequalities `g A_g − 1 ≤ −g A_g` (§1) and `−1 ≤ g A_g s^(g−1) − 1`. -/
private theorem engine_supporting {g : ℝ} (hg : 1 ≤ g) (x : ℝ) :
    ∃ m : ℝ, ∀ k : ℝ, engineCall g x + m * (k - x) ≤ engineCall g k := by
  have hg0 : (0:ℝ) < g := lt_of_lt_of_le one_pos hg
  have hA := atmMark_pos hg0
  have hA2 := atmMark_le_half_of_one_le hg
  have hB : g * atmMark g ≤ 1 / 2 := by nlinarith
  have hBnn : 0 ≤ g * atmMark g := by positivity
  rcases le_or_gt 0 x with hx | hx
  · -- at or above the money: the OTM call branch and its tangent
    have hsp : (0:ℝ) < 1 + x := by linarith
    have hs1 : (1:ℝ) ≤ 1 + x := by linarith
    have hfac : (1 + x) ^ (-g - 1) ≤ 1 := Real.rpow_le_one_of_one_le_of_nonpos hs1 (by linarith)
    have hfacpos : (0:ℝ) < (1 + x) ^ (-g - 1) := Real.rpow_pos_of_pos hsp _
    refine ⟨-(g * atmMark g * (1 + x) ^ (-g - 1)), ?_⟩
    have hFx : engineCall g x = atmMark g * (1 + x) ^ (-g) := by
      unfold engineCall; rw [if_pos hx]
    have hright : ∀ k : ℝ, 0 ≤ k →
        engineCall g x + -(g * atmMark g * (1 + x) ^ (-g - 1)) * (k - x) ≤ engineCall g k := by
      intro k hk
      have ht := rpow_neg_tangent (u := 1 + k) (s := 1 + x) (by linarith) hsp hg0.le
      have h2 := mul_le_mul_of_nonneg_left ht hA.le
      have hFk : engineCall g k = atmMark g * (1 + k) ^ (-g) := by
        unfold engineCall; rw [if_pos hk]
      rw [hFx, hFk]
      nlinarith [h2]
    intro k
    rcases le_or_gt 0 k with hk | hk
    · exact hright k hk
    · have h0 := hright 0 le_rfl
      rw [engineCall_zero] at h0
      have hm : -(g * atmMark g) ≤ -(g * atmMark g * (1 + x) ^ (-g - 1)) := by nlinarith
      have hmk : -(g * atmMark g * (1 + x) ^ (-g - 1)) * k ≤ g * atmMark g * (-k) := by nlinarith
      have hlb := engine_left_bound hg (le_of_lt hk)
      nlinarith [h0, hmk, hlb]
  · rcases le_or_gt x (-1) with hx1 | hx1
    · -- pure intrinsic: slope −1 supports the whole curve
      refine ⟨-1, fun k => ?_⟩
      rw [engineCall_of_le_neg_one hg0 hx1]
      have := engineCall_ge_neg hg0 k
      linarith
    · -- in the money, above the intrinsic join
      have hsp : (0:ℝ) < 1 + x := by linarith
      have hs1 : (1 + x) ≤ 1 := by linarith
      have hfac : (1 + x) ^ (g - 1) ≤ 1 := Real.rpow_le_one hsp.le hs1 (by linarith)
      have hfacnn : (0:ℝ) ≤ (1 + x) ^ (g - 1) := Real.rpow_nonneg hsp.le _
      refine ⟨g * atmMark g * (1 + x) ^ (g - 1) - 1, ?_⟩
      have hFx : engineCall g x = atmMark g * (1 + x) ^ g - x := by
        unfold engineCall; rw [if_neg (by linarith), if_pos (by linarith)]
      have hmid : ∀ k : ℝ, -1 ≤ k →
          engineCall g x + (g * atmMark g * (1 + x) ^ (g - 1) - 1) * (k - x)
            ≤ atmMark g * (1 + k) ^ g - k := by
        intro k hk
        have ht := rpow_pos_tangent (u := 1 + k) (s := 1 + x) (by linarith) hsp hg
        have h2 := mul_le_mul_of_nonneg_left ht hA.le
        rw [hFx]
        nlinarith [h2]
      intro k
      rcases le_or_gt 0 k with hk | hk
      · -- chain through the ATM join
        have h0 := hmid 0 (by norm_num)
        have hm : g * atmMark g * (1 + x) ^ (g - 1) - 1 ≤ -(g * atmMark g) := by nlinarith
        have hmk : (g * atmMark g * (1 + x) ^ (g - 1) - 1) * k ≤ -(g * atmMark g) * k := by
          nlinarith
        have htz := engine_tangent_zero hg hk
        have hrw : (g * atmMark g * (1 + x) ^ (g - 1) - 1) * (k - x)
            = (g * atmMark g * (1 + x) ^ (g - 1) - 1) * (0 - x)
              + (g * atmMark g * (1 + x) ^ (g - 1) - 1) * k := by ring
        rw [hrw]
        have hone : atmMark g * (1 + (0:ℝ)) ^ g - 0 = atmMark g := by norm_num
        nlinarith [h0, hmk, htz]
      · rcases le_or_gt (-1) k with hk1 | hk1
        · have hFk : engineCall g k = atmMark g * (1 + k) ^ g - k := by
            unfold engineCall; rw [if_neg (by linarith), if_pos hk1]
          rw [hFk]
          exact hmid k hk1
        · -- chain through the intrinsic join at `k = -1`
          have h0 := hmid (-1) le_rfl
          have hzero : atmMark g * (1 + (-1:ℝ)) ^ g - (-1) = 1 := by
            norm_num [Real.zero_rpow hg0.ne']
          rw [hzero] at h0
          have hFk : engineCall g k = -k := engineCall_of_le_neg_one hg0 (by linarith)
          rw [hFk]
          have hm1 : (-1:ℝ) ≤ g * atmMark g * (1 + x) ^ (g - 1) - 1 := by nlinarith
          have hrw : (g * atmMark g * (1 + x) ^ (g - 1) - 1) * (k - x)
              = (g * atmMark g * (1 + x) ^ (g - 1) - 1) * ((-1) - x)
                + (g * atmMark g * (1 + x) ^ (g - 1) - 1) * (k + 1) := by ring
          rw [hrw]
          nlinarith [h0, hm1]

theorem engine_call_midconvex {g : ℝ} (hg : 1 ≤ g) : MidConvex (engineCall g) := by
  intro a b
  obtain ⟨m, hm⟩ := engine_supporting hg ((a + b) / 2)
  have ha := hm a
  have hb := hm b
  have hsum : m * (a - (a + b) / 2) + m * (b - (a + b) / 2) = 0 := by ring
  linarith

/-! ## §3 THE PAYOFF: a heterogeneous engine-priced book is arbitrage-free -/

/-- The engine curve IS an admissible private continuation in `MAP_FORMAL`'s sense. -/
noncomputable def engineContinuation {g : ℝ} (hg : 1 ≤ g) : Continuation where
  call := engineCall g
  put := enginePut g
  parity := engine_parity g
  callConvex := engine_call_midconvex hg

variable {n : ℕ}

/-- LINK (a), POSITIVE HALF. Take `n` LPs, each reading its own depth and half-spread
off the perp book (`PerpQuote`) AND pricing with its OWN lens exponent `g i` — the
operator's per-LP exposure profile. The public book that `BASIS_FORMAL` builds from
them is butterfly-arbitrage-free. No hypothesis is carried beyond `1 ≤ g i`. -/
theorem engine_book_arb_free (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (Q : Fin n → PerpQuote) (g : Fin n → ℝ) (hg : ∀ i, 1 ≤ g i)
    (D : ℝ → ℝ) (a b : ℝ) :
    0 ≤ Surface.butterflyCost
      (bookSurface hne Q (fun i => engineCall (g i)) D) a b :=
  book_arb_free hne Q (fun i => engineCall (g i)) (fun i => engine_call_midconvex (hg i)) D a b

/-- LINK (a), ANCHOR. The engine-priced public book stays a continuation of the ONE
cleared perp: parity survives aggregation across heterogeneous lenses. -/
theorem engine_book_parity (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (Q : Fin n → PerpQuote) (g : Fin n → ℝ) (k : ℝ) :
    levelOf Q (fun i => engineCall (g i)) k
      - levelOf Q (fun i => enginePut (g i)) k = -k :=
  book_parity hne Q (fun i => engineCall (g i)) (fun i => enginePut (g i))
    (fun i k => engine_parity (g i) k) k

/-! ## §4 THE OBSTRUCTION: one lens cannot price a heterogeneous book -/

/-- A single lens is LOG-AFFINE in log-strike on the OTM side. -/
theorem engine_log_affine {g k : ℝ} (hg : 0 < g) (hk : 0 ≤ k) :
    Real.log (engineCall g k) = Real.log (atmMark g) - g * Real.log (1 + k) := by
  have hA := atmMark_pos hg
  have h1 : (0:ℝ) < 1 + k := by linarith
  unfold engineCall
  rw [if_pos hk, Real.log_mul hA.ne' (Real.rpow_pos_of_pos h1 _).ne', Real.log_rpow h1]
  ring

/-- The OTM branch of a two-LP mixture, in the log-strike variable `u = log (1+k)`. -/
noncomputable def mixOTM (g₁ g₂ w u : ℝ) : ℝ :=
  w * atmMark g₁ * Real.exp (-g₁ * u) + (1 - w) * atmMark g₂ * Real.exp (-g₂ * u)

/-- STRICT LOG-CONVEXITY OF THE MIXTURE. A nontrivial mixture of two DISTINCT lenses is
strictly log-convex in log-strike, whereas a single lens is log-affine (`engine_log_affine`).

PROOF: with `aᵢ = pᵢ e^(−gᵢ s)`, `bᵢ = pᵢ e^(−gᵢ t)` and `pᵢ > 0`, the midpoint value is
`Σ √(aᵢ bᵢ)`, so this is Cauchy–Schwarz; equality would force `a₁/b₁ = a₂/b₂`, i.e.
`g₁ (s−t) = g₂ (s−t)`, contradicting `g₁ ≠ g₂` and `s ≠ t`. -/
theorem mixture_strict_log_convex {g₁ g₂ w s t : ℝ}
    (hg₁ : 0 < g₁) (hg₂ : 0 < g₂) (hne : g₁ ≠ g₂)
    (hw : 0 < w) (hw1 : w < 1) (hst : s ≠ t) :
    mixOTM g₁ g₂ w ((s + t) / 2) ^ 2 < mixOTM g₁ g₂ w s * mixOTM g₁ g₂ w t := by
  set p₁ := w * atmMark g₁ with hp₁def
  set p₂ := (1 - w) * atmMark g₂ with hp₂def
  have hp₁ : 0 < p₁ := mul_pos hw (atmMark_pos hg₁)
  have hp₂ : 0 < p₂ := mul_pos (by linarith) (atmMark_pos hg₂)
  set a := Real.exp (-g₁ * s / 2)
  set b := Real.exp (-g₂ * s / 2)
  set c := Real.exp (-g₁ * t / 2)
  set d := Real.exp (-g₂ * t / 2)
  have e1 : Real.exp (-g₁ * s) = a * a := by rw [← Real.exp_add]; congr 1; ring
  have e2 : Real.exp (-g₂ * s) = b * b := by rw [← Real.exp_add]; congr 1; ring
  have e3 : Real.exp (-g₁ * t) = c * c := by rw [← Real.exp_add]; congr 1; ring
  have e4 : Real.exp (-g₂ * t) = d * d := by rw [← Real.exp_add]; congr 1; ring
  have e5 : Real.exp (-g₁ * ((s + t) / 2)) = a * c := by rw [← Real.exp_add]; congr 1; ring
  have e6 : Real.exp (-g₂ * ((s + t) / 2)) = b * d := by rw [← Real.exp_add]; congr 1; ring
  -- Cauchy–Schwarz is strict because `g₁ ≠ g₂` and `s ≠ t`.
  have hne' : a * d ≠ b * c := by
    rw [← Real.exp_add, ← Real.exp_add]
    intro h
    have harg := Real.exp_injective h
    apply hne
    have hst' : s - t ≠ 0 := sub_ne_zero.mpr hst
    have hprod : (g₁ - g₂) * (s - t) = 0 := by linarith [harg]
    rcases mul_eq_zero.mp hprod with h1 | h1
    · linarith
    · exact absurd h1 hst'
  have hzero : a * d - b * c ≠ 0 := sub_ne_zero.mpr hne'
  have key : mixOTM g₁ g₂ w s * mixOTM g₁ g₂ w t - mixOTM g₁ g₂ w ((s + t) / 2) ^ 2
      = p₁ * p₂ * (a * d - b * c) ^ 2 := by
    unfold mixOTM
    rw [← hp₁def, ← hp₂def, e1, e2, e3, e4, e5, e6]
    ring
  have hpos : 0 < p₁ * p₂ * (a * d - b * c) ^ 2 := by positivity
  linarith [key ▸ hpos]

/-- LINK (a), NEGATIVE HALF — THE OBSTRUCTION THE PRODUCT DECISION TURNS ON. If two LPs
price with DIFFERENT lens exponents, the aggregate OTM mark is NOT the OTM mark of the
engine's lens at ANY exponent `g` and ANY scale `c > 0`. The heterogeneous book carries a
strict smile; the single-`m` lens is a pure power law and structurally cannot represent it.

So "each LP chooses its own exposure profile" and "the engine prices the book with one
lens" cannot both hold. -/
theorem mixture_not_single_lens {g₁ g₂ w : ℝ}
    (hg₁ : 0 < g₁) (hg₂ : 0 < g₂) (hne : g₁ ≠ g₂) (hw : 0 < w) (hw1 : w < 1) :
    ¬ ∃ c g : ℝ, 0 < c ∧ ∀ k : ℝ, 0 ≤ k →
        w * engineCall g₁ k + (1 - w) * engineCall g₂ k = c * (1 + k) ^ (-g) := by
  rintro ⟨c, g, hc, h⟩
  -- On the OTM side, in the log-strike variable, the hypothesis says the mixture is
  -- log-affine; strict log-convexity at `u = 0, 1, 2` contradicts that.
  have hexp : ∀ u : ℝ, 0 ≤ u →
      engineCall g₁ (Real.exp u - 1) = atmMark g₁ * Real.exp (-g₁ * u) := by
    intro u hu
    have h1 : (1:ℝ) ≤ Real.exp u := Real.one_le_exp hu
    unfold engineCall
    rw [if_pos (by linarith)]
    congr 1
    have h3 : (1 : ℝ) + (Real.exp u - 1) = Real.exp u := by ring
    rw [h3, Real.rpow_def_of_pos (Real.exp_pos u), Real.log_exp]
    congr 1; ring
  have hexp₂ : ∀ u : ℝ, 0 ≤ u →
      engineCall g₂ (Real.exp u - 1) = atmMark g₂ * Real.exp (-g₂ * u) := by
    intro u hu
    have h1 : (1:ℝ) ≤ Real.exp u := Real.one_le_exp hu
    unfold engineCall
    rw [if_pos (by linarith)]
    congr 1
    have h3 : (1 : ℝ) + (Real.exp u - 1) = Real.exp u := by ring
    rw [h3, Real.rpow_def_of_pos (Real.exp_pos u), Real.log_exp]
    congr 1; ring
  have key : ∀ u : ℝ, 0 ≤ u → mixOTM g₁ g₂ w u = c * Real.exp (-g * u) := by
    intro u hu
    have h1 : (1:ℝ) ≤ Real.exp u := Real.one_le_exp hu
    have hthis := h (Real.exp u - 1) (by linarith)
    rw [hexp u hu, hexp₂ u hu] at hthis
    have h3 : (1 : ℝ) + (Real.exp u - 1) = Real.exp u := by ring
    rw [h3, Real.rpow_def_of_pos (Real.exp_pos u), Real.log_exp] at hthis
    have h4 : Real.exp (u * -g) = Real.exp (-g * u) := by congr 1; ring
    rw [h4] at hthis
    unfold mixOTM
    linear_combination hthis
  have hlt := mixture_strict_log_convex (g₁ := g₁) (g₂ := g₂) (w := w) (s := 0) (t := 2)
    hg₁ hg₂ hne hw hw1 (by norm_num)
  have hmid : ((0:ℝ) + 2) / 2 = 1 := by norm_num
  rw [hmid, key 0 le_rfl, key 1 zero_le_one, key 2 (by norm_num)] at hlt
  have e0 : Real.exp (-g * 0) = 1 := by simp
  have e2 : Real.exp (-g * 2) = Real.exp (-g * 1) * Real.exp (-g * 1) := by
    rw [← Real.exp_add]; congr 1; ring
  rw [e0, e2] at hlt
  nlinarith [hlt]

end LinkPricing

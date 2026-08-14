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
  sorry

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
  sorry

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
theorem engine_call_midconvex {g : ℝ} (hg : 1 ≤ g) : MidConvex (engineCall g) := by
  sorry

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
      (bookSurface hne Q (fun i => engineCall (g i)) D) a b := by
  sorry

/-- LINK (a), ANCHOR. The engine-priced public book stays a continuation of the ONE
cleared perp: parity survives aggregation across heterogeneous lenses. -/
theorem engine_book_parity (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (Q : Fin n → PerpQuote) (g : Fin n → ℝ) (k : ℝ) :
    levelOf Q (fun i => engineCall (g i)) k
      - levelOf Q (fun i => enginePut (g i)) k = -k := by
  sorry

/-! ## §4 THE OBSTRUCTION: one lens cannot price a heterogeneous book -/

/-- A single lens is LOG-AFFINE in log-strike on the OTM side. -/
theorem engine_log_affine {g k : ℝ} (hg : 0 < g) (hk : 0 ≤ k) :
    Real.log (engineCall g k) = Real.log (atmMark g) - g * Real.log (1 + k) := by
  sorry

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
  sorry

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
  sorry

end LinkPricing

/-
BURR2_MIXTURE — is the Burr-II / t-family wing kernel closed under mixture?  No.  But the
obstruction is SECOND ORDER in the parameter gap, and this file bounds it exactly.

THE QUESTION.  Heterogeneous LPs post different `(S̄, a, γ, κ)`.  The pool would like to post
ONE curve.  If the family were closed under mixture, aggregation would be exact.  For the
SINGLE-POWER-LAW lens this was settled negatively and structurally (`mixture_not_single_lens`:
a mixture of distinct lenses is strictly log-convex where every member is log-affine).  The
Burr-II family has more parameters, and measurement says the best-fit residual for a 50/50
mixture is only 0.02–0.12% relative — a far weaker obstruction.  This file settles WHY, in the
one direction where an exact answer is available.

THE KERNEL.
    Δ_{a,γ,s}(v) = (1 + (v/s)^a)^(-(γ+1)/a)

THE OBSERVATION.  In the coordinate `L(v) = log(1 + (v/s)^a)` the family at FIXED `(a,s)` is
exactly log-affine in the tail parameter: `Δ = exp(-((γ+1)/a)·L)`.  Hence a 50/50 mixture in
`γ` factors EXACTLY through a hyperbolic cosine

    ½(Δ_{γ₁} + Δ_{γ₂}) = Δ_{γ̄} · cosh(δ·L),   γ̄ = (γ₁+γ₂)/2,  δ = (γ₂-γ₁)/(2a)

which is (i) an exact non-closure certificate — `cosh` is not an exponential — and (ii) an exact
error formula: the mixture exceeds the MIDPOINT member by the factor `cosh(δL)`, i.e. by
`≈ (δL)²/2`, SECOND ORDER in the parameter gap.  Since a best fit can only do better than the
midpoint member, `exp((δL)²/2) - 1` is an upper bound on the best-fit relative error.  That is
the honest explanation of the measured 0.02–0.12%.

SCOPE — stated plainly, and NOT to be overclaimed anywhere downstream.
  * §3 proves non-closure in the TAIL direction at fixed shoulder and scale (`γ` differs).
  * §5 (STRETCH) asks the same in the SCALE direction (`s` differs, `a, γ` shared); it is TRUE
    (numerically: residual ~1e-2 at the production parameters) and the intended route is the two
    limits `v → ∞` and `v → 0` plus strict convexity of `x ↦ x^(-c)`.  If it does not come out,
    LEAVE THE `sorry` and say so — do not weaken the statement.
  * Non-closure over ALL FOUR parameters simultaneously is NOT stated here and remains OPEN.
  * The bounds are pointwise in the kernel and are transferred to FINITE non-negatively-weighted
    aggregates (§4), which is how the production sheet actually forms prices.  The continuum
    integral is not formalised here.

TOOLCHAIN: Lean 4.28.0, Mathlib v4.28.0.
-/
import Mathlib.Analysis.SpecialFunctions.Pow.Real
import Mathlib.Analysis.SpecialFunctions.Log.Basic
import Mathlib.Analysis.SpecialFunctions.Trigonometric.Series
import Mathlib.Analysis.SpecialFunctions.Trigonometric.DerivHyp
import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Tactic

noncomputable section
open scoped BigOperators

namespace Burr2Mix

/-- the Burr-II / t-family wing kernel. -/
def kern (a γ s v : ℝ) : ℝ := (1 + (v / s) ^ a) ^ (-(γ + 1) / a)

/-- the coordinate in which the family is log-affine in `γ`. -/
def Lc (a s v : ℝ) : ℝ := Real.log (1 + (v / s) ^ a)

/-- the 50/50 mixture of two wings differing only in the tail parameter. -/
def mix (a γ₁ γ₂ s v : ℝ) : ℝ := (kern a γ₁ s v + kern a γ₂ s v) / 2

/-! ## §1  The log-affine coordinate -/

theorem base_pos {a s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 ≤ v) :
    0 < 1 + (v / s) ^ a := by sorry

theorem kern_eq_exp {a γ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 ≤ v) :
    kern a γ s v = Real.exp (-(γ + 1) / a * Lc a s v) := by sorry

theorem kern_pos {a γ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 ≤ v) :
    0 < kern a γ s v := by sorry

theorem Lc_pos {a s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 < v) : 0 < Lc a s v := by sorry

/-- the coordinate sweeps all of `(0,∞)` as the strike does, so a pointwise identity in `v`
is a pointwise identity in `L`. -/
theorem Lc_surj {a s : ℝ} (ha : 0 < a) (hs : 0 < s) {l : ℝ} (hl : 0 < l) :
    ∃ v : ℝ, 0 < v ∧ Lc a s v = l := by sorry

/-! ## §2  THE EXACT MIXTURE IDENTITY -/

/-- **TARGET 6a.**  A 50/50 mixture in the tail parameter is the MIDPOINT member times an
exact hyperbolic cosine factor. -/
theorem mixture_eq_cosh {a γ₁ γ₂ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 ≤ v) :
    mix a γ₁ γ₂ s v
      = kern a ((γ₁ + γ₂) / 2) s v * Real.cosh ((γ₂ - γ₁) / (2 * a) * Lc a s v) := by sorry

/-- the midpoint member always UNDER-prices the mixture (`cosh ≥ 1`). -/
theorem mid_le_mixture {a γ₁ γ₂ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 ≤ v) :
    kern a ((γ₁ + γ₂) / 2) s v ≤ mix a γ₁ γ₂ s v := by sorry

/-- and strictly so off the money, whenever the LPs actually differ. -/
theorem mid_lt_mixture {a γ₁ γ₂ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 < v)
    (hγ : γ₁ ≠ γ₂) : kern a ((γ₁ + γ₂) / 2) s v < mix a γ₁ γ₂ s v := by sorry

/-! ## §3  NON-CLOSURE in the tail direction -/

/-- **TARGET 6b.**  At fixed shoulder `a` and scale `s`, a 50/50 mixture of two Burr-II wings
with DISTINCT tail parameters is not a Burr-II wing: no `γ'` reproduces it.  (`cosh` is not an
exponential — witnessed by `cosh 2y = 2 cosh²y - 1`.) -/
theorem burr2_not_closed_under_mixture {a γ₁ γ₂ s : ℝ} (ha : 0 < a) (hs : 0 < s)
    (hγ : γ₁ ≠ γ₂) :
    ¬ ∃ γ' : ℝ, ∀ v : ℝ, 0 < v → mix a γ₁ γ₂ s v = kern a γ' s v := by sorry

/-! ## §4  THE ERROR BOUND — how badly non-closure actually hurts -/

/-- an elementary quadratic bound on the excess, kept because it is the form the economics
uses (`cosh x - 1 ≈ x²/2`). -/
theorem cosh_sub_one_le (x : ℝ) : Real.cosh x - 1 ≤ x ^ 2 / 2 * Real.cosh x := by sorry

/-- **TARGET 6c.**  The mixture exceeds the midpoint member by at most `exp((δL)²/2)`, i.e.
the relative error of representing a heterogeneous pool by one Burr-II wing is SECOND ORDER in
the spread of the LPs' tail parameters.  (A best fit can only beat the midpoint member, so this
bounds the best-fit error too.) -/
theorem mixture_rel_error_le {a γ₁ γ₂ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 ≤ v) :
    mix a γ₁ γ₂ s v
      ≤ kern a ((γ₁ + γ₂) / 2) s v * Real.exp (((γ₂ - γ₁) / (2 * a) * Lc a s v) ^ 2 / 2) := by
  sorry

/-- **TARGET 6d.**  The pointwise bound transfers to any finite non-negatively-weighted
aggregate over strikes — which is how a book, or the production sheet, forms a price. -/
theorem mixture_aggregate_le {n : ℕ} {a γ₁ γ₂ s ε : ℝ} (ha : 0 < a) (hs : 0 < s)
    (c v : Fin n → ℝ) (hc : ∀ i, 0 ≤ c i) (hv : ∀ i, 0 ≤ v i)
    (hb : ∀ i, Real.cosh ((γ₂ - γ₁) / (2 * a) * Lc a s (v i)) ≤ 1 + ε) :
    ∑ i, c i * mix a γ₁ γ₂ s (v i)
      ≤ (1 + ε) * ∑ i, c i * kern a ((γ₁ + γ₂) / 2) s (v i) := by sorry

/-! ## §5  STRETCH — non-closure in the SCALE direction

TRUE (checked numerically: at `a = 1.2705, γ = 1.8413, s₁ = 0.5, s₂ = 0.8`, the member matching
the mixture at `v = 1` misses by `1.2e-2` at `v = 0.1`).  Intended route: write `b = s^(-a)`,
`c = (γ+1)/a`, so members are `t ↦ (1 + b t)^(-c)` in `t = v^a`; matching as `t → ∞` forces
`b'^(-c) = ½(b₁^(-c) + b₂^(-c))`, matching as `t → 0` forces `b' = (b₁+b₂)/2`, and strict
convexity of `x ↦ x^(-c)` makes those incompatible unless `b₁ = b₂`.

IF THIS DOES NOT COME OUT, LEAVE THE `sorry` AND REPORT IT.  Do not weaken the statement, do not
add hypotheses, do not delete it. -/

theorem burr2_not_closed_under_mixture_scale {a γ s₁ s₂ : ℝ} (ha : 0 < a) (hγ : 0 < γ)
    (hs₁ : 0 < s₁) (hs₂ : 0 < s₂) (hne : s₁ ≠ s₂) :
    ¬ ∃ s' : ℝ, 0 < s' ∧ ∀ v : ℝ, 0 < v →
        (kern a γ s₁ v + kern a γ s₂ v) / 2 = kern a γ s' v := by sorry

end Burr2Mix

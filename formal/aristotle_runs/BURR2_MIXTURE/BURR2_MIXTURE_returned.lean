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
import Mathlib.Analysis.SpecialFunctions.Pow.Deriv
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
    0 < 1 + (v / s) ^ a := by
  have : (0:ℝ) ≤ (v / s) ^ a := Real.rpow_nonneg (by positivity) a
  linarith

theorem kern_eq_exp {a γ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 ≤ v) :
    kern a γ s v = Real.exp (-(γ + 1) / a * Lc a s v) := by
  rw [kern, Real.rpow_def_of_pos (base_pos ha hs hv), Lc, mul_comm]

theorem kern_pos {a γ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 ≤ v) :
    0 < kern a γ s v := by
  rw [kern_eq_exp ha hs hv]
  exact Real.exp_pos _

theorem Lc_pos {a s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 < v) : 0 < Lc a s v := by
  have h : (0:ℝ) < (v / s) ^ a := Real.rpow_pos_of_pos (by positivity) a
  exact Real.log_pos (by linarith)

/-- the coordinate sweeps all of `(0,∞)` as the strike does, so a pointwise identity in `v`
is a pointwise identity in `L`. -/
theorem Lc_surj {a s : ℝ} (ha : 0 < a) (hs : 0 < s) {l : ℝ} (hl : 0 < l) :
    ∃ v : ℝ, 0 < v ∧ Lc a s v = l := by
  have hx : (0:ℝ) < Real.exp l - 1 := by
    have := Real.add_one_lt_exp (ne_of_gt hl)
    linarith
  refine ⟨s * (Real.exp l - 1) ^ (1 / a), by positivity, ?_⟩
  have hdiv : (s * (Real.exp l - 1) ^ (1 / a)) / s = (Real.exp l - 1) ^ (1 / a) := by
    field_simp
  have h2 : (1:ℝ) + (Real.exp l - 1) = Real.exp l := by ring
  rw [Lc, hdiv, ← Real.rpow_mul hx.le, one_div, inv_mul_cancel₀ ha.ne', Real.rpow_one, h2,
    Real.log_exp]

/-! ## §2  THE EXACT MIXTURE IDENTITY -/

/-- **TARGET 6a.**  A 50/50 mixture in the tail parameter is the MIDPOINT member times an
exact hyperbolic cosine factor. -/
theorem mixture_eq_cosh {a γ₁ γ₂ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 ≤ v) :
    mix a γ₁ γ₂ s v
      = kern a ((γ₁ + γ₂) / 2) s v * Real.cosh ((γ₂ - γ₁) / (2 * a) * Lc a s v) := by
  rw [mix, kern_eq_exp ha hs hv, kern_eq_exp ha hs hv, kern_eq_exp ha hs hv, Real.cosh_eq]
  set L := Lc a s v with hL
  have e1 : -((γ₁ + γ₂) / 2 + 1) / a * L + (γ₂ - γ₁) / (2 * a) * L = -(γ₁ + 1) / a * L := by
    field_simp; ring
  have e2 : -((γ₁ + γ₂) / 2 + 1) / a * L + -((γ₂ - γ₁) / (2 * a) * L) = -(γ₂ + 1) / a * L := by
    field_simp; ring
  rw [show Real.exp (-((γ₁ + γ₂) / 2 + 1) / a * L) *
        ((Real.exp ((γ₂ - γ₁) / (2 * a) * L) + Real.exp (-((γ₂ - γ₁) / (2 * a) * L))) / 2)
      = (Real.exp (-((γ₁ + γ₂) / 2 + 1) / a * L + (γ₂ - γ₁) / (2 * a) * L)
        + Real.exp (-((γ₁ + γ₂) / 2 + 1) / a * L + -((γ₂ - γ₁) / (2 * a) * L))) / 2 from by
    rw [Real.exp_add, Real.exp_add]; ring, e1, e2]

/-- the midpoint member always UNDER-prices the mixture (`cosh ≥ 1`). -/
theorem mid_le_mixture {a γ₁ γ₂ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 ≤ v) :
    kern a ((γ₁ + γ₂) / 2) s v ≤ mix a γ₁ γ₂ s v := by
  rw [mixture_eq_cosh ha hs hv]
  nlinarith [kern_pos (a := a) (γ := (γ₁ + γ₂) / 2) (s := s) (v := v) ha hs hv,
    Real.one_le_cosh ((γ₂ - γ₁) / (2 * a) * Lc a s v)]

/-- and strictly so off the money, whenever the LPs actually differ. -/
theorem mid_lt_mixture {a γ₁ γ₂ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 < v)
    (hγ : γ₁ ≠ γ₂) : kern a ((γ₁ + γ₂) / 2) s v < mix a γ₁ γ₂ s v := by
  rw [mixture_eq_cosh ha hs hv.le]
  have hne : (γ₂ - γ₁) / (2 * a) * Lc a s v ≠ 0 := by
    have h1 : γ₂ - γ₁ ≠ 0 := sub_ne_zero.mpr (Ne.symm hγ)
    have h2 : Lc a s v ≠ 0 := (Lc_pos ha hs hv).ne'
    exact mul_ne_zero (div_ne_zero h1 (by positivity)) h2
  nlinarith [kern_pos (a := a) (γ := (γ₁ + γ₂) / 2) (s := s) (v := v) ha hs hv.le,
    Real.one_lt_cosh.mpr hne]

/-! ## §3  NON-CLOSURE in the tail direction -/

/-- **TARGET 6b.**  At fixed shoulder `a` and scale `s`, a 50/50 mixture of two Burr-II wings
with DISTINCT tail parameters is not a Burr-II wing: no `γ'` reproduces it.  (`cosh` is not an
exponential — witnessed by `cosh 2y = 2 cosh²y - 1`.) -/
theorem burr2_not_closed_under_mixture {a γ₁ γ₂ s : ℝ} (ha : 0 < a) (hs : 0 < s)
    (hγ : γ₁ ≠ γ₂) :
    ¬ ∃ γ' : ℝ, ∀ v : ℝ, 0 < v → mix a γ₁ γ₂ s v = kern a γ' s v := by
  rintro ⟨γ', hγ'⟩
  -- in the log-affine coordinate the hypothesis reads `cosh (δ l) = exp (β l)` for all `l > 0`
  have key : ∀ l : ℝ, 0 < l → Real.cosh ((γ₂ - γ₁) / (2 * a) * l)
      = Real.exp ((-(γ' + 1) / a - -((γ₁ + γ₂) / 2 + 1) / a) * l) := by
    intro l hl
    obtain ⟨v, hv, hvL⟩ := Lc_surj ha hs hl
    have h := hγ' v hv
    rw [mixture_eq_cosh ha hs hv.le, kern_eq_exp ha hs hv.le, kern_eq_exp ha hs hv.le, hvL] at h
    have hexp : (0:ℝ) < Real.exp (-((γ₁ + γ₂) / 2 + 1) / a * l) := Real.exp_pos _
    have hc : Real.cosh ((γ₂ - γ₁) / (2 * a) * l)
        = Real.exp (-(γ' + 1) / a * l - -((γ₁ + γ₂) / 2 + 1) / a * l) := by
      rw [Real.exp_sub, eq_div_iff hexp.ne']
      linarith [h]
    rw [hc]
    congr 1
    ring
  have hδ : (γ₂ - γ₁) / (2 * a) ≠ 0 :=
    div_ne_zero (sub_ne_zero.mpr (Ne.symm hγ)) (by positivity)
  set δ : ℝ := (γ₂ - γ₁) / (2 * a)
  set β : ℝ := -(γ' + 1) / a - -((γ₁ + γ₂) / 2 + 1) / a
  have h1 := key 1 one_pos
  have h2 := key 2 two_pos
  have hd : Real.cosh (2 * (δ * 1)) = Real.cosh (δ * 1) ^ 2 + Real.sinh (δ * 1) ^ 2 :=
    Real.cosh_two_mul _
  have hsq := Real.cosh_sq_sub_sinh_sq (δ * 1)
  have h2' : Real.cosh (δ * 2) = Real.exp (β * 1) ^ 2 := by
    rw [h2, ← Real.exp_nat_mul]
    ring_nf
  have hgt : 1 < Real.cosh (δ * 1) := Real.one_lt_cosh.mpr (by simpa using hδ)
  have hmul : δ * 2 = 2 * (δ * 1) := by ring
  rw [hmul, hd, h1] at h2'
  nlinarith [hgt, hsq]

/-! ## §4  THE ERROR BOUND — how badly non-closure actually hurts -/

/-- an elementary quadratic bound on the excess, kept because it is the form the economics
uses (`cosh x - 1 ≈ x²/2`). -/
theorem cosh_sub_one_le (x : ℝ) : Real.cosh x - 1 ≤ x ^ 2 / 2 * Real.cosh x := by
  have h1 : Real.cosh x ≤ Real.exp (x ^ 2 / 2) := Real.cosh_le_exp_half_sq x
  have h2 : -(x ^ 2 / 2) + 1 ≤ Real.exp (-(x ^ 2 / 2)) := Real.add_one_le_exp _
  have h3 : Real.exp (x ^ 2 / 2) * Real.exp (-(x ^ 2 / 2)) = 1 := by
    rw [← Real.exp_add]; simp
  have h4 : (0:ℝ) < Real.exp (x ^ 2 / 2) := Real.exp_pos _
  have h5 : 1 ≤ Real.cosh x := Real.one_le_cosh x
  rcases le_or_gt (x ^ 2 / 2) 1 with h | h
  · nlinarith
  · nlinarith

/-- **TARGET 6c.**  The mixture exceeds the midpoint member by at most `exp((δL)²/2)`, i.e.
the relative error of representing a heterogeneous pool by one Burr-II wing is SECOND ORDER in
the spread of the LPs' tail parameters.  (A best fit can only beat the midpoint member, so this
bounds the best-fit error too.) -/
theorem mixture_rel_error_le {a γ₁ γ₂ s v : ℝ} (ha : 0 < a) (hs : 0 < s) (hv : 0 ≤ v) :
    mix a γ₁ γ₂ s v
      ≤ kern a ((γ₁ + γ₂) / 2) s v * Real.exp (((γ₂ - γ₁) / (2 * a) * Lc a s v) ^ 2 / 2) := by
  rw [mixture_eq_cosh ha hs hv]
  exact mul_le_mul_of_nonneg_left (Real.cosh_le_exp_half_sq _) (kern_pos ha hs hv).le

/-- **TARGET 6d.**  The pointwise bound transfers to any finite non-negatively-weighted
aggregate over strikes — which is how a book, or the production sheet, forms a price. -/
theorem mixture_aggregate_le {n : ℕ} {a γ₁ γ₂ s ε : ℝ} (ha : 0 < a) (hs : 0 < s)
    (c v : Fin n → ℝ) (hc : ∀ i, 0 ≤ c i) (hv : ∀ i, 0 ≤ v i)
    (hb : ∀ i, Real.cosh ((γ₂ - γ₁) / (2 * a) * Lc a s (v i)) ≤ 1 + ε) :
    ∑ i, c i * mix a γ₁ γ₂ s (v i)
      ≤ (1 + ε) * ∑ i, c i * kern a ((γ₁ + γ₂) / 2) s (v i) := by
  rw [Finset.mul_sum]
  refine Finset.sum_le_sum fun i _ => ?_
  have hk : 0 < kern a ((γ₁ + γ₂) / 2) s (v i) := kern_pos ha hs (hv i)
  have hmix : mix a γ₁ γ₂ s (v i) ≤ (1 + ε) * kern a ((γ₁ + γ₂) / 2) s (v i) := by
    rw [mixture_eq_cosh ha hs (hv i)]
    have := mul_le_mul_of_nonneg_left (hb i) hk.le
    linarith [this]
  have := mul_le_mul_of_nonneg_left hmix (hc i)
  linarith [this]

/-! ## §5  STRETCH — non-closure in the SCALE direction

TRUE (checked numerically: at `a = 1.2705, γ = 1.8413, s₁ = 0.5, s₂ = 0.8`, the member matching
the mixture at `v = 1` misses by `1.2e-2` at `v = 0.1`).  Intended route: write `b = s^(-a)`,
`c = (γ+1)/a`, so members are `t ↦ (1 + b t)^(-c)` in `t = v^a`; matching as `t → ∞` forces
`b'^(-c) = ½(b₁^(-c) + b₂^(-c))`, matching as `t → 0` forces `b' = (b₁+b₂)/2`, and strict
convexity of `x ↦ x^(-c)` makes those incompatible unless `b₁ = b₂`.

IF THIS DOES NOT COME OUT, LEAVE THE `sorry` AND REPORT IT.  Do not weaken the statement, do not
add hypotheses, do not delete it. -/

/-- derivative of `x ↦ (1 + b x)^p` (real power, positive base). -/
private lemma hasDerivAt_affine_rpow {b p t : ℝ} (hu : 0 < 1 + b * t) :
    HasDerivAt (fun x : ℝ => (1 + b * x) ^ p) (p * (1 + b * t) ^ (p - 1) * b) t := by
  have h1 : HasDerivAt (fun x : ℝ => 1 + b * x) b t := by
    simpa using ((hasDerivAt_id t).const_mul b).const_add 1
  exact (Real.hasDerivAt_rpow_const (p := p) (Or.inl hu.ne')).comp t h1

/-- two functions agreeing on `(0,∞)` have the same derivative at every point of `(0,∞)`. -/
private lemma deriv_eq_of_eqOn {f g : ℝ → ℝ} {f' g' t : ℝ}
    (hf : HasDerivAt f f' t) (hg : HasDerivAt g g' t)
    (h : ∀ x : ℝ, 0 < x → f x = g x) (ht : 0 < t) : f' = g' := by
  have hev : g =ᶠ[nhds t] f := by
    filter_upwards [(isOpen_Ioi (a := (0:ℝ))).mem_nhds ht] with x hx using (h x hx).symm
  exact (hf.congr_of_eventuallyEq hev).unique hg

/-- the equality case of Cauchy-Schwarz for two positive weights: if the weighted zeroth,
first and second moments of `(x₁, x₂)` are those of a single atom, the two atoms coincide. -/
private lemma cs_equality {p₁ p₂ x₁ x₂ P X : ℝ} (hp₁ : 0 < p₁) (hp₂ : 0 < p₂)
    (e0 : p₁ + p₂ = P) (e1 : p₁ * x₁ + p₂ * x₂ = P * X)
    (e2 : p₁ * x₁ ^ 2 + p₂ * x₂ ^ 2 = P * X ^ 2) : x₁ = x₂ := by
  have h : p₁ * p₂ * (x₁ - x₂) ^ 2 = 0 := by
    have h0 : (p₁ + p₂) * (p₁ * x₁ ^ 2 + p₂ * x₂ ^ 2) - (p₁ * x₁ + p₂ * x₂) ^ 2 = 0 := by
      rw [e0, e1, e2]; ring
    linear_combination h0
  have hpp : 0 < p₁ * p₂ := mul_pos hp₁ hp₂
  have h2 : (x₁ - x₂) ^ 2 = 0 := by
    rcases mul_eq_zero.mp h with h' | h'
    · exact absurd h' hpp.ne'
    · exact h'
  have := pow_eq_zero_iff (n := 2) (by norm_num) |>.mp h2
  linarith

/-- the heart of §5, in the coordinate `t = v^a` and with `b = s^(-a)`: if the mixture of
`t ↦ (1 + bᵢ t)^(-c)` is again of that form, the two scales agree.  The three matched
derivatives at `t = 1` are the zeroth, first and second moments of a two-atom measure, and
Cauchy-Schwarz equality forces the atoms to coincide. -/
private lemma scale_mixture_forces_eq {b₁ b₂ b' c : ℝ} (hb₁ : 0 < b₁) (hb₂ : 0 < b₂)
    (hb' : 0 < b') (hc : 0 < c)
    (hE0 : ∀ t : ℝ, 0 < t →
      ((1 + b₁ * t) ^ (-c) + (1 + b₂ * t) ^ (-c)) / 2 = (1 + b' * t) ^ (-c)) : b₁ = b₂ := by
  have hu : ∀ b : ℝ, 0 < b → ∀ t : ℝ, 0 < t → 0 < 1 + b * t := by
    intro b hb t ht; nlinarith
  -- first derivative of the matching identity
  have hE1 : ∀ t : ℝ, 0 < t →
      (b₁ * (1 + b₁ * t) ^ (-c - 1) + b₂ * (1 + b₂ * t) ^ (-c - 1)) / 2
        = b' * (1 + b' * t) ^ (-c - 1) := by
    intro t ht
    have hd : ((-c) * (1 + b₁ * t) ^ (-c - 1) * b₁ + (-c) * (1 + b₂ * t) ^ (-c - 1) * b₂) / 2
        = (-c) * (1 + b' * t) ^ (-c - 1) * b' := by
      refine deriv_eq_of_eqOn (f := fun x : ℝ => ((1 + b₁ * x) ^ (-c) + (1 + b₂ * x) ^ (-c)) / 2)
        (g := fun x : ℝ => (1 + b' * x) ^ (-c))
        (((hasDerivAt_affine_rpow (hu b₁ hb₁ t ht)).add
          (hasDerivAt_affine_rpow (hu b₂ hb₂ t ht))).div_const 2)
        (hasDerivAt_affine_rpow (hu b' hb' t ht)) hE0 ht
    have hcne : c ≠ 0 := hc.ne'
    field_simp at hd ⊢
    nlinarith [hd]
  -- second derivative
  have hE2 : ∀ t : ℝ, 0 < t →
      (b₁ ^ 2 * (1 + b₁ * t) ^ (-c - 1 - 1) + b₂ ^ 2 * (1 + b₂ * t) ^ (-c - 1 - 1)) / 2
        = b' ^ 2 * (1 + b' * t) ^ (-c - 1 - 1) := by
    intro t ht
    have hd : (b₁ * ((-c - 1) * (1 + b₁ * t) ^ (-c - 1 - 1) * b₁)
        + b₂ * ((-c - 1) * (1 + b₂ * t) ^ (-c - 1 - 1) * b₂)) / 2
        = b' * ((-c - 1) * (1 + b' * t) ^ (-c - 1 - 1) * b') := by
      refine deriv_eq_of_eqOn
        (f := fun x : ℝ => (b₁ * (1 + b₁ * x) ^ (-c - 1) + b₂ * (1 + b₂ * x) ^ (-c - 1)) / 2)
        (g := fun x : ℝ => b' * (1 + b' * x) ^ (-c - 1))
        ((((hasDerivAt_affine_rpow (hu b₁ hb₁ t ht)).const_mul b₁).add
          ((hasDerivAt_affine_rpow (hu b₂ hb₂ t ht)).const_mul b₂)).div_const 2)
        ((hasDerivAt_affine_rpow (hu b' hb' t ht)).const_mul b') hE1 ht
    have hcne : (-c - 1) ≠ 0 := by intro h; nlinarith
    field_simp at hd ⊢
    nlinarith [hd]
  -- evaluate the three identities at `t = 1`
  have h1 : (0:ℝ) < 1 := one_pos
  have hu₁ : (0:ℝ) < 1 + b₁ := by nlinarith
  have hu₂ : (0:ℝ) < 1 + b₂ := by nlinarith
  have hu' : (0:ℝ) < 1 + b' := by nlinarith
  have e0 := hE0 1 h1
  have e1 := hE1 1 h1
  have e2 := hE2 1 h1
  simp only [mul_one] at e0 e1 e2
  rw [Real.rpow_sub hu₁ (-c) 1, Real.rpow_sub hu₂ (-c) 1, Real.rpow_sub hu' (-c) 1] at e1
  rw [Real.rpow_sub hu₁ (-c - 1) 1, Real.rpow_sub hu₂ (-c - 1) 1, Real.rpow_sub hu' (-c - 1) 1,
    Real.rpow_sub hu₁ (-c) 1, Real.rpow_sub hu₂ (-c) 1, Real.rpow_sub hu' (-c) 1] at e2
  simp only [Real.rpow_one] at e1 e2
  set A₁ := (1 + b₁) ^ (-c) with hA₁
  set A₂ := (1 + b₂) ^ (-c) with hA₂
  set A' := (1 + b') ^ (-c) with hA'
  have hA₁pos : 0 < A₁ := Real.rpow_pos_of_pos hu₁ _
  have hA₂pos : 0 < A₂ := Real.rpow_pos_of_pos hu₂ _
  have hx : b₁ / (1 + b₁) = b₂ / (1 + b₂) := by
    refine cs_equality (p₁ := A₁ / 2) (p₂ := A₂ / 2) (P := A') (X := b' / (1 + b'))
      (by positivity) (by positivity) (by linarith) ?_ ?_
    · linear_combination e1
    · linear_combination e2
  field_simp at hx
  linarith

theorem burr2_not_closed_under_mixture_scale {a γ s₁ s₂ : ℝ} (ha : 0 < a) (hγ : 0 < γ)
    (hs₁ : 0 < s₁) (hs₂ : 0 < s₂) (hne : s₁ ≠ s₂) :
    ¬ ∃ s' : ℝ, 0 < s' ∧ ∀ v : ℝ, 0 < v →
        (kern a γ s₁ v + kern a γ s₂ v) / 2 = kern a γ s' v := by
  rintro ⟨s', hs', hid⟩
  set c : ℝ := (γ + 1) / a with hcdef
  have hc : 0 < c := by rw [hcdef]; positivity
  -- pass to the coordinate `t = v^a`, in which the members are `t ↦ (1 + s^(-a) t)^(-c)`
  have hkt : ∀ s : ℝ, 0 < s → ∀ t : ℝ, 0 < t →
      kern a γ s (t ^ (1 / a)) = (1 + s ^ (-a) * t) ^ (-c) := by
    intro s hs t ht
    have h1 : (t ^ (1 / a) / s) ^ a = s ^ (-a) * t := by
      rw [Real.div_rpow (Real.rpow_nonneg ht.le _) hs.le, ← Real.rpow_mul ht.le,
        one_div, inv_mul_cancel₀ ha.ne', Real.rpow_one, Real.rpow_neg hs.le]
      field_simp
    rw [kern, h1, hcdef, neg_div]
  have hb₁ : 0 < s₁ ^ (-a) := Real.rpow_pos_of_pos hs₁ _
  have hb₂ : 0 < s₂ ^ (-a) := Real.rpow_pos_of_pos hs₂ _
  have hb' : 0 < s' ^ (-a) := Real.rpow_pos_of_pos hs' _
  have hE0 : ∀ t : ℝ, 0 < t →
      ((1 + s₁ ^ (-a) * t) ^ (-c) + (1 + s₂ ^ (-a) * t) ^ (-c)) / 2
        = (1 + s' ^ (-a) * t) ^ (-c) := by
    intro t ht
    have h := hid (t ^ (1 / a)) (Real.rpow_pos_of_pos ht _)
    rwa [hkt s₁ hs₁ t ht, hkt s₂ hs₂ t ht, hkt s' hs' t ht] at h
  have hbeq : s₁ ^ (-a) = s₂ ^ (-a) := scale_mixture_forces_eq hb₁ hb₂ hb' hc hE0
  exact hne (Real.rpow_left_injOn (neg_ne_zero.mpr ha.ne') hs₁.le hs₂.le hbeq)

end Burr2Mix

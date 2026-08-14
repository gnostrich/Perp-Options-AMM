/-
BASIS_FORMAL — the perp-book basis map (owner-blessed 2026-08-05: "propose the
maps… as long as its sort of taking the perp book as it is already")

WHAT THIS FILE IS. MAP_FORMAL builds an LP's two cost objects from abstract
dials — `slope = NORM·γσ²/(Capital/S)`, `hollow = ½γσ²·Pickoff` — and pays for
that with two UNCITED constants (workbook README ambiguities 2 and 3). This file
takes the other road, the one the owner ratified: the LP has ALREADY expressed a
steepness and a spread ON THE PERP BOOK, so the map READS them instead of
inventing them. NORM and Pickoff have no role here and do not appear. That is
the point of the file, not a side effect.

  * §1 What the perp book already says: a slope (price conceded per unit filled)
    and a half-spread. Both are read, neither is derived.
  * §2 THE MAP. Carry each to a strike by that strike's delta: slope by `D²`,
    half-spread by `|D|`. §3 is why those two exponents are not a choice.
  * §3 THE JUSTIFICATION, AS A THEOREM. `charge_is_perp_equivalent`: the cost of
    a fill depends on the fill ONLY through the perp-equivalent exposure `D·q` it
    hands the LP. So `D²` on the slope is forced by wanting one price of risk
    across the whole book, and `charge_strike_indifferent` is the consequence
    that matters: two fills delivering the SAME perp exposure cost the same
    wherever they came from. (This is also why unbounded posted SIZE in the wings
    is not a leak — unbounded contracts, bounded risk.)
  * §4 PARITY FORBIDS A DIRECTIONAL LEAN. `no_directional_lean`: you cannot lift
    calls and drop puts — that breaks parity, i.e. it is an arbitrage. So
    directional inventory leans on the PERP and only vol/skew leans on the option
    curve. The self-hedging link is forced, not designed.
  * §5 THE BOOK. Weights come off the PERP slopes, and `share_strike_invariant`
    (MAP_FORMAL, reused not restated) says the strike factor cancels — so one
    weight vector serves every strike, which is exactly `agg_midconvex`'s
    fixed-weight hypothesis. Level, depth and spread aggregate; the result is
    arbitrage-free.
  * §6 THE FORK, PRICED IN ADVANCE. Fixed weights need ONE thing: the transport
    factor must be COMMON across LPs at each strike. One risk factor gives that
    for free (every LP transports by the same `D²`). A second factor (vega) does
    NOT, unless every LP shares one risk ratio — `shares_vary_if_transport_differs`
    is the counterexample. So the vega decision's cost is known before it is
    taken: not "does it break", but exactly WHICH hypothesis it costs.

The option curve itself is NOT derived here — it is `BOOK_FORMAL`'s abstract
continuation (parity-anchored, midpoint-convex), instantiated by Burr-2 in
FORMAL_CORE. One issuer of a price; this file issues costs, never a curve.

STATUS: theory rung, blessed shape, not wired to any engine. v2 stays deployed
and untouched (CLAUDE.md "Versions"). MAP_FORMAL is NOT superseded — it remains
the dials formulation, kernel-gated; this is the perp-basis formulation, and the
build targets this one.
-/

import MAP_FORMAL

namespace BasisFormal

open scoped BigOperators
open BookFormal MapFormal

variable {n : ℕ}

/-! ## §1 What the perp book already says -/

/-- One LP's expression ON THE PERP BOOK — read off the fitted book, not
invented. `slope` is the price conceded per unit filled (the book's steepness);
`half` is its half-spread. Positivity of `slope` is the map's domain: a book with
no steepness has no depth to transport. -/
structure PerpQuote where
  slope : ℝ
  half : ℝ
  slope_pos : 0 < slope
  half_nonneg : 0 ≤ half

/-! ## §2 The map: carry each to a strike by that strike's delta -/

/-- The LP's slope AT A STRIKE whose delta is `D`. The square is not decoration —
§3 proves it is what makes the LP charge one price of risk across the book. -/
def slopeAt (Q : PerpQuote) (D : ℝ) : ℝ := Q.slope * D ^ 2

/-- The LP's half-spread AT A STRIKE whose delta is `D`. First power, and an
ABSOLUTE value: pick-off is a first-moment loss, and `D` changes sign across the
book (MAP_FORMAL `signed_transport_can_be_negative`), so a bare `D` would post a
negative half-spread — a crossed quote at a single LP. -/
def halfAt (Q : PerpQuote) (D : ℝ) : ℝ := Q.half * |D|

theorem slopeAt_nonneg (Q : PerpQuote) (D : ℝ) : 0 ≤ slopeAt Q D :=
  mul_nonneg Q.slope_pos.le (sq_nonneg D)

theorem slopeAt_pos (Q : PerpQuote) {D : ℝ} (hD : D ≠ 0) : 0 < slopeAt Q D :=
  mul_pos Q.slope_pos (pow_pos (abs_pos.mpr hD) 2 |>.trans_le (le_of_eq (sq_abs D)))

theorem halfAt_nonneg (Q : PerpQuote) (D : ℝ) : 0 ≤ halfAt Q D :=
  mul_nonneg Q.half_nonneg (abs_nonneg D)

/-! ## §3 Why those exponents: one price of risk across the whole book -/

/-- The walked cost-of-size at a strike: the workbook's `½βq²`, with `β` the
transported slope. -/
noncomputable def sizeCost (Q : PerpQuote) (D q : ℝ) : ℝ := slopeAt Q D * q ^ 2 / 2

/-- The perp-equivalent exposure a fill of `q` at a strike of delta `D` hands the
LP — the same `Δ·q` the exposure reading sums (theory 5.1/5.2). -/
def perpEquivalent (D q : ℝ) : ℝ := D * q

/-- THE JUSTIFICATION FOR `D²`, AS AN IDENTITY. The cost of a fill depends on the
fill ONLY through the perp-equivalent exposure it delivers: `½·slope·(Dq)²`. So
the LP is charging its ONE perp price of risk, applied to the exposure this fill
actually hands it — the strike has no separate say. -/
theorem charge_is_perp_equivalent (Q : PerpQuote) (D q : ℝ) :
    sizeCost Q D q = Q.slope * (perpEquivalent D q) ^ 2 / 2 := by
  unfold sizeCost slopeAt perpEquivalent; ring

/-- THE CONSEQUENCE THAT MATTERS. Two fills that deliver the SAME perp-equivalent
exposure cost the same, whichever strike delivered them. Hence exposure cannot be
bought cheaply in the wings, and the unbounded posted SIZE as `D → 0` is
unbounded CONTRACTS at bounded RISK — a units artifact, not a leak. -/
theorem charge_strike_indifferent (Q : PerpQuote) {D₁ q₁ D₂ q₂ : ℝ}
    (h : perpEquivalent D₁ q₁ = perpEquivalent D₂ q₂) :
    sizeCost Q D₁ q₁ = sizeCost Q D₂ q₂ := by
  rw [charge_is_perp_equivalent, charge_is_perp_equivalent, h]

/-- AND `D²` IS THE ONLY EXPONENT THAT DOES IT — the converse, which is what
makes the exponent FORCED rather than merely consistent. If a cost is quadratic
in size with some strike coefficient `g D`, and it depends on the fill only
through the exposure `D·q` it delivers, then `g D = g 1 · D²`. Nothing is assumed
about `g` beyond that pair of requirements.

(Aristotle's review of the first cut noted correctly that
`charge_is_perp_equivalent` alone proves only the forward direction — that `D²`
IS such a coefficient — and that the docstring's "forced" claimed the converse.
This is that converse.) -/
theorem square_is_the_only_strike_indifferent_exponent {g f : ℝ → ℝ}
    (h : ∀ D q, g D * q ^ 2 = f (D * q)) (D : ℝ) : g D = g 1 * D ^ 2 := by
  have h1 : g D = f D := by simpa using h D 1
  have h2 : g 1 * D ^ 2 = f D := by simpa using h 1 D
  linarith

/-- And the half-spread is the FIRST moment of the same quantity: the pick-off
loss on a fill is linear in the exposure it hands over, so it transports at
`|D|¹` while the size cost transports at `D²`. The two exponents are the first
and second moments of ONE object, not two independent choices. -/
theorem pickoffLoss_is_first_moment (Q : PerpQuote) (D q : ℝ) (hq : 0 ≤ q) :
    halfAt Q D * q = Q.half * |perpEquivalent D q| := by
  unfold halfAt perpEquivalent
  rw [abs_mul, abs_of_nonneg hq]
  ring

/-! ## §4 Parity forbids a directional lean on the option curve -/

/-- YOU CANNOT LEAN THE OPTION CURVE DIRECTIONALLY. Lifting every call by `a` and
dropping every put by `a` breaks parity by `2a` — an arbitrage. So a directional
inventory must be leaned on the PERP, and only the vol/skew part of inventory may
move the option curve. This is what makes the perp and the option book ONE
position rather than two businesses: the split is forced by parity, not chosen. -/
theorem no_directional_lean {C P : ℝ → ℝ} (hpar : ∀ k, C k - P k = -k)
    {a : ℝ} (ha : a ≠ 0) : ¬ (∀ k, (C k + a) - (P k - a) = -k) := by
  intro h
  have h0 := h 0
  have hp0 := hpar 0
  apply ha
  linarith

/-- The lean that IS allowed: any shift applied to BOTH wings alike keeps parity
exactly. That is the vol/skew direction — the whole of the option curve's freedom
once the perp is anchored. -/
theorem symmetric_shift_keeps_parity {C P : ℝ → ℝ} (hpar : ∀ k, C k - P k = -k)
    (s : ℝ → ℝ) (k : ℝ) : (C k + s k) - (P k + s k) = -k := by
  have := hpar k; linarith

/-! ## §5 The book: weights off the perp basis -/

/-- The public depth: parallel addition of the LPs' transported slopes at a
strike. Reuses MAP_FORMAL's `betaAgg` — one definition of one quantity. -/
noncomputable def depthAt (Q : Fin n → PerpQuote) (D : ℝ) : ℝ :=
  betaAgg (fun i => slopeAt (Q i) D)

/-- The public half-spread: the TIGHTEST, not an average. A trader can always
deal with the keenest LP, so averaging would post a spread nobody is quoting.
Safe at any profile by `BOOK_FORMAL.butterfly_nonneg`; competitive by choice. -/
noncomputable def halfAggAt (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (Q : Fin n → PerpQuote) (D : ℝ) : ℝ :=
  Finset.univ.inf' hne fun i => halfAt (Q i) D

theorem halfAggAt_nonneg (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (Q : Fin n → PerpQuote) (D : ℝ) : 0 ≤ halfAggAt hne Q D :=
  Finset.le_inf' hne _ fun i _ => halfAt_nonneg (Q i) D

/-- THE WEIGHTS COME OFF THE PERP SLOPES, AND SERVE EVERY STRIKE OF NON-ZERO
DELTA. The strike's `D²` is the same for every LP, so it cancels in the ratio —
MAP_FORMAL's `share_strike_invariant`, reused. One weight vector, computed once
on the perp, is `agg_midconvex`'s "weights fixed across strikes" hypothesis
OBTAINED.

`D ≠ 0` is load-bearing, not hygiene: at `D = 0` every transported slope is `0`,
`share` reads `0/0 = 0` for every LP at once, and the conclusion is false against
the strictly positive perp shares. Nothing is posted at the crossover anyway
(CLAUDE.md: the book ends at `k = 0`), so the excluded point is the one the
mechanism already excludes — but the hypothesis must be carried, not assumed
away. Same caveat `MAP_FORMAL.depth_unbounded` records from the other side. -/
theorem weights_read_off_the_perp (Q : Fin n → PerpQuote) {D : ℝ} (hD : D ≠ 0)
    (i : Fin n) :
    share (fun j => slopeAt (Q j) D) i = share (fun j => (Q j).slope) i := by
  have h : ∀ j, slopeAt (Q j) D = D ^ 2 * (Q j).slope := by
    intro j; unfold slopeAt; ring
  simp only [h]
  exact share_strike_invariant hD (fun j => (Q j).slope) i

/-- The public level: the LP curves averaged by those perp-basis weights. -/
noncomputable def levelOf (Q : Fin n → PerpQuote) (C : Fin n → ℝ → ℝ) : ℝ → ℝ :=
  agg (share fun j => (Q j).slope) C

theorem weights_sum_one (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (Q : Fin n → PerpQuote) : ∑ i, share (fun j => (Q j).slope) i = 1 :=
  share_sum_one hne fun j => (Q j).slope_pos

/-- PARITY SURVIVES THE BOOK. Every LP's continuation is anchored to the one
cleared perp, and a weighted average of anchored curves is anchored — so the
public curve is a continuation of the same cleared point. -/
theorem book_parity (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (Q : Fin n → PerpQuote) (C P : Fin n → ℝ → ℝ)
    (hpar : ∀ i k, C i k - P i k = -k) (k : ℝ) :
    levelOf Q C k - levelOf Q P k = -k :=
  agg_parity _ _ _ (weights_sum_one hne Q) hpar k

theorem book_midconvex (Q : Fin n → PerpQuote) (C : Fin n → ℝ → ℝ)
    (hC : ∀ i, MidConvex (C i)) : MidConvex (levelOf Q C) :=
  agg_midconvex _ _ (fun i => share_nonneg (fun j => (Q j).slope_pos) i) hC

/-- THE PUBLIC BOOK IS ARBITRAGE-FREE — from nothing but what the LPs already
posted on the perp. The level is the weighted average of convex continuations,
the half-spread is the tightest, and `BOOK_FORMAL`'s separation theorem closes
it. No uncited constant appears anywhere in this chain. -/
noncomputable def bookSurface (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (Q : Fin n → PerpQuote) (C : Fin n → ℝ → ℝ) (D : ℝ → ℝ) : Surface where
  level := levelOf Q C
  half := fun k => halfAggAt hne Q (D k)
  half_nonneg := fun k => halfAggAt_nonneg hne Q (D k)

theorem book_arb_free (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (Q : Fin n → PerpQuote) (C : Fin n → ℝ → ℝ) (hC : ∀ i, MidConvex (C i))
    (D : ℝ → ℝ) (a b : ℝ) :
    0 ≤ Surface.butterflyCost (bookSurface hne Q C D) a b :=
  Surface.butterfly_nonneg _ (book_midconvex Q C hC) a b

/-! ## §6 The fork: what a second risk factor costs, priced in advance -/

/-- Shares under a PER-LP transport factor `τ i` at a strike. With one risk
factor `τ` is the same `D²` for everyone; with two it need not be. -/
noncomputable def shareT (τ β : Fin n → ℝ) (i : Fin n) : ℝ :=
  (τ i * β i)⁻¹ / ∑ j, (τ j * β j)⁻¹

/-- ONE RISK FACTOR ⇒ FIXED WEIGHTS. When the transport factor is COMMON across
LPs, it cancels and the perp-basis weights serve every strike. This is the exact
hypothesis `agg_midconvex` needs, and §5 is this theorem's instance. -/
theorem shares_fixed_of_common_transport {t : ℝ} (ht : t ≠ 0) (β : Fin n → ℝ)
    (i : Fin n) : shareT (fun _ => t) β i = share β i := by
  unfold shareT
  have hsum : ∑ j, (t * β j)⁻¹ = t⁻¹ * ∑ j, (β j)⁻¹ := by
    rw [Finset.mul_sum]
    exact Finset.sum_congr rfl fun j _ => mul_inv _ _
  rw [hsum, mul_inv, share, mul_div_mul_left _ _ (inv_ne_zero ht)]

/-- AND A SECOND FACTOR IS EXACTLY WHAT COSTS IT. If LPs transport by DIFFERENT
factors — which is what a vega term does, unless every LP happens to share one
delta-to-vega risk ratio — the shares are no longer the same at every strike. Two
LPs of equal perp depth split 50/50 at a strike where they transport alike, and
2:1 where they do not.

So the vega decision's price is known before it is taken: parallel-add survives
(it needs only a non-negative number per LP per strike), but `agg_midconvex`'s
FIXED-WEIGHT hypothesis does not, and convexity must then be re-proved under
strike-varying weights or bought back by constraining LPs to a common ratio. -/
theorem shares_vary_if_transport_differs :
    ∃ (β τ₁ τ₂ : Fin 2 → ℝ) (i : Fin 2),
      shareT τ₁ β i ≠ shareT τ₂ β i := by
  refine ⟨![1, 1], ![1, 1], ![1, 2], 0, ?_⟩
  simp [shareT, Fin.sum_univ_two]

/-- THE CONVERSE, WHICH IS THE ONE AN ENGINE WANTS: a COMMON transport factor is
not merely sufficient for strike-invariant shares, it is NECESSARY. If the
transported shares agree with the perp-basis shares, every LP's transport factor
is the same number.

So the vega fork is an exact dichotomy, not a heuristic: either every LP carries
the same delta-to-vega risk ratio (and the fixed-weight convexity proof stands
unchanged), or the shares genuinely vary by strike and `agg_midconvex` must be
re-proved under strike-varying weights. There is no third case to hope for.

(Aristotle's review noted the first cut proved only the "not always" direction.
This closes it.) -/
theorem common_transport_is_necessary {β τ : Fin n → ℝ}
    (hβ : ∀ i, 0 < β i) (hτ : ∀ i, 0 < τ i)
    (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (h : ∀ i, shareT τ β i = share β i) (i j : Fin n) : τ i = τ j := by
  have hSβ : 0 < ∑ l, (β l)⁻¹ :=
    Finset.sum_pos (fun l _ => inv_pos.mpr (hβ l)) hne
  have hSτ : 0 < ∑ l, (τ l * β l)⁻¹ :=
    Finset.sum_pos (fun l _ => inv_pos.mpr (mul_pos (hτ l) (hβ l))) hne
  -- From `shareT τ β l = share β l`, the `(β l)⁻¹` cancels and leaves
  -- `(τ l)⁻¹ · Σ(β)⁻¹ = Σ(τβ)⁻¹` — a right-hand side independent of `l`.
  have key : ∀ l : Fin n, (τ l)⁻¹ * (∑ m, (β m)⁻¹) = ∑ m, (τ m * β m)⁻¹ := by
    intro l
    have hl := h l
    unfold shareT share at hl
    rw [div_eq_div_iff hSτ.ne' hSβ.ne', mul_inv] at hl
    have hβl : (β l)⁻¹ ≠ 0 := inv_ne_zero (hβ l).ne'
    apply mul_left_cancel₀ hβl
    linear_combination hl
  have hij : (τ i)⁻¹ * (∑ m, (β m)⁻¹) = (τ j)⁻¹ * (∑ m, (β m)⁻¹) := by
    rw [key i, key j]
  exact inv_injective (mul_right_cancel₀ hSβ.ne' hij)

end BasisFormal

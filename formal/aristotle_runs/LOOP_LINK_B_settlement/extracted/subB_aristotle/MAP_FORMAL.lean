/-
MAP_FORMAL — the parametric map (owner-directed 2026-07-31: "we need to
formalise the parametric map because everything comes from the perp book basis
this")

WHAT THIS FILE IS. BOOK_FORMAL settles how N private continuations become ONE
public surface. It says nothing about where a private continuation comes from.
This file is that map: four per-LP dials (γ risk appetite, σ effective vol, κ
lean, Capital) and two globals (NORMALISATION, PickoffIntensity) issue the two
cost objects the mechanism runs on —

  SLOPE   β_i = NORM·γ_i·σ_i² / (Capital_i/S)   price conceded per unit filled
  HOLLOW  h_i = ½·γ_i·σ_i²·Pickoff              the flat gap that pays pick-off

— and nothing else. The price curve itself is taken ABSTRACTLY here: any curve
with parity `C k - P k = -k` and a midpoint-convex level. Deriving the curve is
FORMAL_CORE's job (Burr-2, cell-for-cell); re-deriving it here would be a second
issuer of one quantity, which the accounting doctrine forbids.

  * §1 The map is well-posed: γ, σ, Capital > 0 (and NORM, S > 0) make β
    STRICTLY positive, and Pickoff ≥ 0 makes h NON-NEGATIVE. κ appears in
    NEITHER — `slope_indep_of_kappa`, `share_indep_of_kappa`. That is the
    measured fact ("κ 0.20 → 0.90 moves an LP's deviation 5.3× and its size
    share not one digit") stated where it can no longer drift: an LP's lean
    moves the LEVEL by that LP's weight and buys it no depth. It is also the
    blessed model's "size-by-depth"; the blessed "side-by-deviation" is a
    different allocation question, and this file does not answer it.
  * §2 A continuation needs only ONE convex wing. Parity is affine, so it
    TRANSPORTS convexity to the other wing (`parity_transports_convexity`) and
    forces `C 0 = P 0` (`atm_free`) — the public anchor, free by construction.
  * §3 THE UNRULED EXPONENT IS SAFE EITHER WAY. The hollow is carried to a
    strike by `|Δ|^e·h`, and `hollow_safe_any_exponent` holds for EVERY real e,
    so `BOOK_FORMAL.butterfly_nonneg` applies whatever e is chosen. Δ¹-vs-Δ² is
    therefore an ECONOMICS ruling (what adverse selection costs), never a safety
    one. The absolute value is not decoration: `signed_transport_can_be_negative`
    is the counterexample a bare `Δ^1` walks into, since Δ_agg changes sign
    across the book.
  * §4 DEPTH ADDS AT EVERY STRIKE (`beta_transport_parallel`) and the strike
    factor CANCELS in the fill shares (`share_strike_invariant`) — which is
    exactly `agg_midconvex`'s fixed-weights hypothesis, obtained rather than
    assumed. `depth_unbounded` records the open item: nothing in the map caps
    depth as Δ → 0.
  * §5 THE ORDER-BOOK ISOMORPHISM. Stack the LPs as linear ladders and walk the
    stack: at marginal-price equality the aggregate behaves as ONE ladder of
    slope β_agg, both in marginal price and in TOTAL COST — `walk_equiv`,
    `walk_cost_equiv`. The consensus is not a new object; it is what a stacked
    book does when walked, and the fill shares fall out as w_i.
  * §6 The mapped market is a continuation: parity survives (`map_preserves_
    parity`), convexity survives, and the surface built from the map's own β and
    h is arbitrage-free (`map_surface_arb_free`).

Convexity is MIDPOINT convexity throughout, as in BOOK_FORMAL: it is exactly
what a butterfly tests, and it keeps the file elementary.

STATUS: theory rung. Nothing here is wired to the engine. The v3 mechanism this
maps is BLESSED (owner 2026-07-31, CLAUDE.md "Versions"), and its hygiene
condition is binding — v2 stays deployed and untouched until the v3 cut is
golden-pinned on its own branch, so a blessed theory file is still not a licence
to move engine code. Two statements are DELIBERATELY WEAKER than the mechanism's
prose, because the prose is false as written: the hollow transport takes |Δ|,
not Δ (§3), and the walk is proved for the interior case, with the boundary
stated as a remark (§5).
-/

import BOOK_FORMAL
import Mathlib.Analysis.SpecialFunctions.Pow.Real

namespace MapFormal

open scoped BigOperators
open BookFormal

variable {n : ℕ}

/-! ## §1 The map: four dials, two cost objects -/

/-- One LP's private parameters. `sigma` is the EFFECTIVE vol σ_base·(1+ℓ) — one
vol view moving level and risk together — and `kappa` is the lean. The three
positivity fields are the map's domain, not decoration: a zero-capital LP has no
slope, and `slope` would divide by zero. -/
structure LP where
  gamma : ℝ
  sigma : ℝ
  kappa : ℝ
  capital : ℝ
  gamma_pos : 0 < gamma
  sigma_pos : 0 < sigma
  capital_pos : 0 < capital

/-- SLOPE — price conceded per unit filled. Capital enters as `Capital/S`, the
deployed COIN size (CLAUDE.md: N is capital, not a curve constant), so β is
per-coin. -/
noncomputable def slope (norm S : ℝ) (L : LP) : ℝ :=
  norm * L.gamma * L.sigma ^ 2 / (L.capital / S)

/-- HOLLOW — the flat half-gap around the mid that pays for pick-off. It does
NOT grow with size; that is the whole difference from `slope`. -/
noncomputable def hollow (pickoff : ℝ) (L : LP) : ℝ := L.gamma * L.sigma ^ 2 * pickoff / 2

theorem slope_pos {norm S : ℝ} (hnorm : 0 < norm) (hS : 0 < S) (L : LP) :
    0 < slope norm S L :=
  div_pos (mul_pos (mul_pos hnorm L.gamma_pos) (pow_pos L.sigma_pos 2))
    (div_pos L.capital_pos hS)

theorem hollow_nonneg {pickoff : ℝ} (hp : 0 ≤ pickoff) (L : LP) :
    0 ≤ hollow pickoff L :=
  div_nonneg (mul_nonneg (mul_nonneg L.gamma_pos.le (pow_nonneg L.sigma_pos.le 2)) hp)
    (by norm_num)

/-- The whole book's slopes. -/
noncomputable def slopes (norm S : ℝ) (L : Fin n → LP) : Fin n → ℝ :=
  fun i => slope norm S (L i)

/-- NEITHER COST OBJECT SEES κ. Both are `rfl` — the map simply does not read
that field. So an LP's lean moves its own curve LEVEL (and, weighted, the public
one) and buys it no depth and no spread. -/
theorem slope_indep_of_kappa (norm S : ℝ) (L : LP) (κ : ℝ) :
    slope norm S { L with kappa := κ } = slope norm S L := rfl

theorem hollow_indep_of_kappa (pickoff : ℝ) (L : LP) (κ : ℝ) :
    hollow pickoff { L with kappa := κ } = hollow pickoff L := rfl

theorem slopes_indep_of_kappa (norm S : ℝ) (L : Fin n → LP) (κ : Fin n → ℝ) :
    slopes norm S (fun i => { L i with kappa := κ i }) = slopes norm S L := rfl

/-! ## §2 A continuation needs one convex wing -/

/-- A private continuation: the two wings and the ONE public anchor tying them
to the cleared perp. Only the call wing is assumed convex — §2's theorem is that
the put wing comes free, so assuming both would assume something derivable. -/
structure Continuation where
  call : ℝ → ℝ
  put : ℝ → ℝ
  parity : ∀ k, call k - put k = -k
  callConvex : MidConvex call

namespace Continuation

/-- AT THE MONEY THE SYNTHETIC PERP IS FREE. Immediate from parity, and it is
what makes the continuation ANCHORED rather than merely private. -/
theorem atm_free (c : Continuation) : c.call 0 = c.put 0 := by
  have := c.parity 0; linarith

/-- PARITY TRANSPORTS CONVEXITY. The two wings differ by `k`, an affine
function, so a convex call wing forces a convex put wing. One assumption covers
the book. -/
theorem parity_transports_convexity (c : Continuation) : MidConvex c.put := by
  intro a b
  have h1 := c.parity ((a + b) / 2)
  have h2 := c.parity a
  have h3 := c.parity b
  have hc := c.callConvex a b
  linarith

end Continuation

/-! ## §3 The hollow transport is safe at ANY exponent -/

/-- The hollow carried from the perp basis to a strike whose market delta is
`D`, with transport exponent `e`. THE ABSOLUTE VALUE IS FORCED, not chosen: Δ_agg
changes sign across the book (measured −0.474…+0.515 on the shipped grid), so a
bare `D^e` is negative on half of it for odd e — see
`signed_transport_can_be_negative`. -/
noncomputable def transported (e D h : ℝ) : ℝ := |D| ^ e * h

/-- THE UNRULED EXPONENT NEEDS AN OWNER RULING FOR ECONOMICS, NEVER FOR SAFETY.
Δ² is derivable for the SLOPE (inventory risk is a variance, so it scales with
the square of the exposure a fill hands the LP); the hollow is adverse
selection, a first-moment loss ∝|Δ|, and the v3 workbook's own prose argues Δ¹
while its cells square it (README ambiguity 8). This theorem says the choice
cannot break the book: for EVERY real `e` the transported hollow is a
non-negative half-spread, so `BOOK_FORMAL.butterfly_nonneg` applies unchanged.
What moves with `e` is what LPs are PAID for pick-off — a competition question,
which is precisely the class that reaches the owner. -/
theorem hollow_safe_any_exponent (e D : ℝ) {h : ℝ} (hh : 0 ≤ h) :
    0 ≤ transported e D h :=
  mul_nonneg (Real.rpow_nonneg (abs_nonneg D) e) hh

/-- WHY THE ABSOLUTE VALUE IS NOT DECORATION: a signed Δ¹ transport of a
perfectly good non-negative hollow yields a NEGATIVE half-spread, which is a
crossed quote at a single LP — the one thing a half-spread may never be. -/
theorem signed_transport_can_be_negative :
    ∃ D h : ℝ, 0 ≤ h ∧ D ^ (1 : ℕ) * h < 0 :=
  ⟨-1, 1, by norm_num, by norm_num⟩

/-- The surface the map actually posts — any convex level, any transport
exponent, any market-delta profile — is butterfly-arbitrage-free. This is
`butterfly_nonneg` with the map's own half-spread substituted in. -/
theorem transported_surface_arb_free {level : ℝ → ℝ} (hL : MidConvex level)
    (e : ℝ) (D h : ℝ → ℝ) (hh : ∀ k, 0 ≤ h k) (a b : ℝ) :
    0 ≤ Surface.butterflyCost
      { level := level, half := fun k => transported e (D k) (h k),
        half_nonneg := fun k => hollow_safe_any_exponent e (D k) (hh k) } a b :=
  Surface.butterfly_nonneg _ hL a b

/-! ## §4 Depth adds; the strike factor cancels in the shares -/

/-- The aggregate slope: depth (`1/β`) adds in parallel, exactly as it does
across price levels of one order book. -/
noncomputable def betaAgg (β : Fin n → ℝ) : ℝ := (∑ i, (β i)⁻¹)⁻¹

/-- An LP's fill share — DEPTH-ONLY, which is the blessed model's own
"size-by-depth". The blessed model gives DEVIATION a different job — "fills
side-by-deviation" — and that job is not modelled here: this file allocates
size, never side. -/
noncomputable def share (β : Fin n → ℝ) (i : Fin n) : ℝ := (β i)⁻¹ / ∑ j, (β j)⁻¹

/-- DEPTH ADDS AT EVERY STRIKE, not just on the perp basis. Transporting every
LP's slope by the SAME market delta leaves the parallel-addition law intact —
which is why "depth adds" can be stated once, on the perp, and read anywhere.
No hypotheses: at `D = 0` both sides are `0`, honestly (see `depth_unbounded`). -/
theorem beta_transport_parallel (D : ℝ) (β : Fin n → ℝ) :
    ∑ i, (D ^ 2 * β i)⁻¹ = (D ^ 2 * betaAgg β)⁻¹ := by
  have hrhs : (D ^ 2 * betaAgg β)⁻¹ = (D ^ 2)⁻¹ * ∑ i, (β i)⁻¹ := by
    rw [betaAgg, mul_inv, inv_inv]
  rw [hrhs, Finset.mul_sum]
  exact Finset.sum_congr rfl fun i _ => mul_inv _ _

/-- AND THE STRIKE FACTOR CANCELS IN THE SHARES. The fill shares are the same at
every strike as they are on the perp — which is `agg_midconvex`'s "weights fixed
across strikes" hypothesis OBTAINED, not assumed, and the reason exactly one Δ
may transport (a per-LP Δ_i would mint a second, strike-varying w). -/
theorem share_strike_invariant {D : ℝ} (hD : D ≠ 0) (β : Fin n → ℝ) (i : Fin n) :
    (D ^ 2 * β i)⁻¹ / (∑ j, (D ^ 2 * β j)⁻¹) = share β i := by
  have hD2 : (D ^ 2)⁻¹ ≠ 0 := inv_ne_zero (pow_ne_zero 2 hD)
  have hsum : ∑ j, (D ^ 2 * β j)⁻¹ = (D ^ 2)⁻¹ * ∑ j, (β j)⁻¹ := by
    rw [Finset.mul_sum]
    exact Finset.sum_congr rfl fun j _ => mul_inv _ _
  rw [hsum, mul_inv, share, mul_div_mul_left _ _ hD2]

/-- NOTHING IN THE MAP CAPS DEPTH (README ambiguity 7, stated at the rung that
can hold it). As the market delta goes to zero the transported slope does too,
so posted depth exceeds any bound — honest about risk consumed, silent about
capital. The exposure cap that actually binds lives outside this map. -/
theorem depth_unbounded {β : ℝ} (hβ : 0 < β) (M : ℝ) :
    ∃ D : ℝ, D ≠ 0 ∧ M < (D ^ 2 * β)⁻¹ := by
  have hc : (0 : ℝ) < |M| + 1 := by positivity
  have harg : 0 < 1 / (β * (|M| + 1)) := div_pos one_pos (mul_pos hβ hc)
  refine ⟨Real.sqrt (1 / (β * (|M| + 1))), (Real.sqrt_pos.mpr harg).ne', ?_⟩
  rw [Real.sq_sqrt harg.le]
  have hstep : 1 / (β * (|M| + 1)) * β = 1 / (|M| + 1) := by
    field_simp
  rw [hstep, one_div, inv_inv]
  linarith [le_abs_self M]

/-! ## §5 The order-book isomorphism -/

/-- One LP as a LINEAR LADDER: the marginal ask after `q` has been filled. The
level `m` is common (the public anchor); the hollow `h` is the market's, i.e.
the tightest LP's; the slope is private. -/
def ask (m h β q : ℝ) : ℝ := m + h + β * q

/-- Walking that ladder from the touch to size `q`: the touch cost plus the
workbook's ½βq² cost-of-size. -/
noncomputable def walkCost (m h β q : ℝ) : ℝ := (m + h) * q + β * q ^ 2 / 2

/-- THE ORDER-BOOK ISOMORPHISM. Stack the LPs and walk the stack: a taker buying
`Q` fills each LP up to a COMMON marginal price. Then the marginal price is
`m + h + β_agg·Q` — one ladder, slope `β_agg` — and each LP's fill is exactly its
depth share `w_i` of `Q`.

The consensus surface is therefore not a new object anyone had to invent: it is
what a stacked book DOES when it is walked. `betaAgg` and `share` are readings of
that walk, not definitions imposed on it.

INTERIOR CASE: the marginal-price equality is assumed for EVERY LP, i.e. all N
are active. With the uniform (competitive, min) hollow that is automatic for any
`Q > 0`. If per-LP hollows are kept instead, LP i only starts filling once the
walk passes `m + h_i`, so the active set grows with `Q` and the identity holds on
each segment with the sums restricted to it — stated as a remark, deliberately
not proved: the segmented form needs an active-set definition the mechanism has
not ruled on. -/
theorem walk_equiv (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    {m h Q μ : ℝ} {β q : Fin n → ℝ} (hβ : ∀ i, 0 < β i)
    (hmarg : ∀ i, ask m h (β i) (q i) = μ) (hsum : ∑ i, q i = Q) :
    μ = m + h + betaAgg β * Q ∧ ∀ i, q i = share β i * Q := by
  have hSpos : 0 < ∑ j, (β j)⁻¹ :=
    Finset.sum_pos (fun j _ => inv_pos.mpr (hβ j)) hne
  have hq : ∀ i, q i = (μ - m - h) * (β i)⁻¹ := by
    intro i
    have h1 : β i * q i = μ - m - h := by
      have := hmarg i; unfold ask at this; linarith
    rw [← h1, mul_comm (β i) (q i), mul_assoc, mul_inv_cancel₀ (hβ i).ne', mul_one]
  have hQ : (μ - m - h) * ∑ j, (β j)⁻¹ = Q := by
    rw [← hsum, Finset.mul_sum]
    exact Finset.sum_congr rfl fun i _ => (hq i).symm
  have hμ : μ - m - h = betaAgg β * Q := by
    have hrw : betaAgg β * Q = (μ - m - h) * (betaAgg β * ∑ j, (β j)⁻¹) := by
      rw [← hQ]; ring
    rw [hrw, betaAgg, inv_mul_cancel₀ hSpos.ne', mul_one]
  refine ⟨by linarith, fun i => ?_⟩
  rw [hq i, hμ, share, betaAgg, div_eq_mul_inv]
  ring

/-- AND THE COST AGREES, NOT ONLY THE MARGINAL PRICE. The total paid across the
stack is what ONE ladder of slope `β_agg` would have charged for the same `Q` —
touch plus ½β_agg Q². This is the isomorphism proper: aggregate and stack are
indistinguishable to a taker, in price and in money. -/
theorem walk_cost_equiv (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    {m h Q μ : ℝ} {β q : Fin n → ℝ} (hβ : ∀ i, 0 < β i)
    (hmarg : ∀ i, ask m h (β i) (q i) = μ) (hsum : ∑ i, q i = Q) :
    ∑ i, walkCost m h (β i) (q i) = walkCost m h (betaAgg β) Q := by
  obtain ⟨-, hq⟩ := walk_equiv hne hβ hmarg hsum
  have hSpos : 0 < ∑ j, (β j)⁻¹ :=
    Finset.sum_pos (fun j _ => inv_pos.mpr (hβ j)) hne
  have hbne : betaAgg β ≠ 0 := (inv_pos.mpr hSpos).ne'
  have hinv : (betaAgg β)⁻¹ = ∑ j, (β j)⁻¹ := inv_inv _
  have hstep : ∀ i ∈ (Finset.univ : Finset (Fin n)),
      walkCost m h (β i) (q i)
        = (m + h) * q i + (betaAgg β * Q) ^ 2 / 2 * (β i)⁻¹ := by
    intro i _
    have hbi : β i ≠ 0 := (hβ i).ne'
    unfold walkCost
    rw [hq i, share, betaAgg, div_eq_mul_inv]
    field_simp
  calc ∑ i, walkCost m h (β i) (q i)
      = ∑ i, ((m + h) * q i + (betaAgg β * Q) ^ 2 / 2 * (β i)⁻¹) :=
        Finset.sum_congr rfl hstep
    _ = (m + h) * (∑ i, q i) + (betaAgg β * Q) ^ 2 / 2 * ∑ i, (β i)⁻¹ := by
        rw [Finset.sum_add_distrib, ← Finset.mul_sum, ← Finset.mul_sum]
    _ = (m + h) * Q + (betaAgg β * Q) ^ 2 / 2 * (betaAgg β)⁻¹ := by rw [hsum, hinv]
    _ = walkCost m h (betaAgg β) Q := by unfold walkCost; field_simp

/-! ## §6 The mapped market is a continuation -/

theorem share_nonneg {β : Fin n → ℝ} (hβ : ∀ i, 0 < β i) (i : Fin n) :
    0 ≤ share β i :=
  div_nonneg (inv_pos.mpr (hβ i)).le (Finset.sum_nonneg fun j _ => (inv_pos.mpr (hβ j)).le)

theorem share_sum_one (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    {β : Fin n → ℝ} (hβ : ∀ i, 0 < β i) : ∑ i, share β i = 1 := by
  have hSpos : 0 < ∑ j, (β j)⁻¹ :=
    Finset.sum_pos (fun j _ => inv_pos.mpr (hβ j)) hne
  unfold share
  rw [← Finset.sum_div, div_self hSpos.ne']

/-- The public level: the capital-weighted aggregate of the private call wings,
weighted by the map's own depth shares. -/
noncomputable def marketCall (norm S : ℝ) (L : Fin n → LP) (C : Fin n → Continuation) :
    ℝ → ℝ := agg (share (slopes norm S L)) fun i => (C i).call

noncomputable def marketPut (norm S : ℝ) (L : Fin n → LP) (C : Fin n → Continuation) :
    ℝ → ℝ := agg (share (slopes norm S L)) fun i => (C i).put

/-- PARITY SURVIVES THE MAP. `BOOK_FORMAL.agg_parity` needs weights summing to
one; the map DELIVERS them — `share_sum_one` — so the aggregate of mapped
continuations is itself a continuation of the one cleared perp. -/
theorem map_preserves_parity (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    {norm S : ℝ} (hnorm : 0 < norm) (hS : 0 < S) (L : Fin n → LP)
    (C : Fin n → Continuation) (k : ℝ) :
    marketCall norm S L C k - marketPut norm S L C k = -k :=
  agg_parity _ _ _ (share_sum_one hne fun i => slope_pos hnorm hS (L i))
    (fun i k => (C i).parity k) k

/-- The anchor, at the money: the synthetic perp is free on the PUBLIC curve
too, not merely on each private one. -/
theorem market_atm_free (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    {norm S : ℝ} (hnorm : 0 < norm) (hS : 0 < S) (L : Fin n → LP)
    (C : Fin n → Continuation) :
    marketCall norm S L C 0 = marketPut norm S L C 0 := by
  have := map_preserves_parity hne hnorm hS L C 0
  linarith

/-- CONVEXITY SURVIVES THE MAP, because the map's weights are non-negative and
FIXED ACROSS STRIKES (§4). -/
theorem map_level_midconvex {norm S : ℝ} (hnorm : 0 < norm) (hS : 0 < S)
    (L : Fin n → LP) (C : Fin n → Continuation) :
    MidConvex (marketCall norm S L C) :=
  agg_midconvex _ _ (fun i => share_nonneg (fun j => slope_pos hnorm hS (L j)) i)
    (fun i => (C i).callConvex)

/-- HOLLOW AGGREGATES COMPETITIVELY: the market's half-spread is the tightest
LP's, not an average (v3 workbook AGG). §3 is what makes the choice free — any
non-negative profile is arbitrage-free, so this one is a competition decision
with no safety content. -/
noncomputable def hollowAgg (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (pickoff : ℝ) (L : Fin n → LP) : ℝ :=
  Finset.univ.inf' hne fun i => hollow pickoff (L i)

theorem hollowAgg_nonneg (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    {pickoff : ℝ} (hp : 0 ≤ pickoff) (L : Fin n → LP) :
    0 ≤ hollowAgg hne pickoff L :=
  Finset.le_inf' hne _ fun i _ => hollow_nonneg hp (L i)

/-- THE SURFACE THE MAP POSTS: the weighted call level, and the tightest hollow
transported to each strike by the market delta `D` at exponent `e`. -/
noncomputable def marketSurface (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    (norm S : ℝ) {pickoff : ℝ} (hp : 0 ≤ pickoff)
    (L : Fin n → LP) (C : Fin n → Continuation) (e : ℝ) (D : ℝ → ℝ) : Surface where
  level := marketCall norm S L C
  half := fun k => transported e (D k) (hollowAgg hne pickoff L)
  half_nonneg := fun _ => hollow_safe_any_exponent _ _ (hollowAgg_nonneg hne hp L)

/-- THE MAP'S OWN SURFACE IS ARBITRAGE-FREE — from four positive dials per LP,
at ANY transport exponent, for ANY market-delta profile. This is the file's
point: everything the mechanism posts descends from (γ, σ, κ, Capital) through
`slope` and `hollow`, and BOOK_FORMAL's separation theorem then applies without
a further assumption. -/
theorem map_surface_arb_free (hne : (Finset.univ : Finset (Fin n)).Nonempty)
    {norm S pickoff : ℝ} (hnorm : 0 < norm) (hS : 0 < S) (hp : 0 ≤ pickoff)
    (L : Fin n → LP) (C : Fin n → Continuation) (e : ℝ) (D : ℝ → ℝ) (a b : ℝ) :
    0 ≤ Surface.butterflyCost (marketSurface hne norm S hp L C e D) a b :=
  Surface.butterfly_nonneg _ (map_level_midconvex hnorm hS L C) a b

/-- AND AN LP'S LEAN BUYS IT NO EXTRA SIZE. `share` reads only `slopes`, and
`slopes` does not read `kappa`: a book where every LP re-leans keeps every SIZE
share to the digit. Measured first (κ 0.20 → 0.90, share 0.734744 both times),
and now it cannot drift. This is the blessed "size-by-depth" exactly, and it says
nothing about side — deviation's job there is outside this map. -/
theorem share_indep_of_kappa (norm S : ℝ) (L : Fin n → LP) (κ : Fin n → ℝ) :
    share (slopes norm S (fun i => { L i with kappa := κ i })) = share (slopes norm S L) :=
  rfl

/-! ## §7 Consistency witnesses -/

/-- `LP`'s three positivity fields could in principle be unsatisfiable together,
in which case §1 would be true of nothing. They are not. -/
theorem lp_inhabited : Nonempty LP := ⟨⟨1, 1, 0, 1, one_pos, one_pos, one_pos⟩⟩

/-- THE SIMPLEST ANCHORED CONVEX CONTINUATION — a symmetric wedge. It is not the
Burr-2 curve and is not proposed as one; it exists only so that §§2 and 6 are
not theorems about an empty type. (LOOP_FORMAL §12 carries the same kind of
witness for the same reason: twenty theorems about an uninhabited interface are
twenty true statements about nothing.) -/
noncomputable def wedge : Continuation where
  call := fun k => |k| / 2
  put := fun k => |k| / 2 + k
  parity := fun k => by ring
  callConvex := by
    intro a b
    have h := abs_add_le a b
    have habs : |(a + b) / 2| = |a + b| / 2 := by rw [abs_div]; norm_num
    simp only [habs]
    linarith

theorem continuation_nonempty : Nonempty Continuation := ⟨wedge⟩

end MapFormal

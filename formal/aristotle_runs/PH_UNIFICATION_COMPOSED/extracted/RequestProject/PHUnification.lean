import Mathlib

noncomputable section
open Real

namespace PHUnification

/-! ### The single object slice (re-declared minimal `TemporalAMM`) -/

structure TemporalAMM where
  alpha : ℝ
  beta  : ℝ
  y     : ℝ
  m     : ℝ
  halpha : 0 < alpha
  hbeta  : 0 < beta
  hy     : beta < y
  hm     : 0 < m

namespace TemporalAMM

def poolPotential (P : TemporalAMM) (t : ℝ) : ℝ := (t - P.beta)^3 / (3 * P.alpha * P.beta)
def price (P : TemporalAMM) : ℝ := (P.y - P.beta)^2 / (P.alpha * P.beta)
def trade (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) : TemporalAMM :=
  ⟨P.alpha, P.beta, P.y + D, P.m, P.halpha, P.hbeta, hD, P.hm⟩

/-
the resistive curvature R ⪰ 0 on the operating domain t ≥ β (this is `R_psd`)
-/
theorem R_psd (P : TemporalAMM) : ∀ t, P.beta ≤ t → 0 ≤ deriv (deriv P.poolPotential) t := by
  unfold TemporalAMM.poolPotential
  norm_num [div_eq_mul_inv]
  intro t ht
  nlinarith [mul_pos (inv_pos.mpr P.halpha) (inv_pos.mpr P.hbeta), sub_nonneg.2 ht]

-- the conservative flow conserves the Casimirs α, β (this is `trade_conserves`)
theorem trade_conserves (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
    (P.trade D hD).alpha = P.alpha ∧ (P.trade D hD).beta = P.beta := by
  exact ⟨rfl, rfl⟩

-- a trade leaves the potential FUNCTION itself unchanged (it depends only on the conserved α, β)
theorem trade_poolPotential (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
    (P.trade D hD).poolPotential = P.poolPotential := by
  rfl

end TemporalAMM

/-! ### The whole-exchange wrap -/

/-- The whole exchange as ONE object: the AMM single object plus the exchange ports. The obligation
    `O` is the convex claim the pool owes; `funding` is the resistive/funding port inflow; `floor` is
    the obligation-port floor (extrinsic, B1). `close` is the PENDING close-mechanic (Q14),
    parametrized, NOT used in any internal-half theorem. -/
structure Exchange where
  amm        : TemporalAMM
  obligation : ℝ → ℝ
  funding    : ℝ → ℝ
  close      : ℝ → ℝ → ℝ
  floor      : ℝ

/-- a trade applied to the whole exchange: only the AMM single object moves. -/
def Exchange.trade (E : Exchange) (D : ℝ) (hD : E.amm.beta < E.amm.y + D) : Exchange :=
  { E with amm := E.amm.trade D hD }

/-! ### INTERNAL HALF — structural passivity (no-internal-free-money). Abstract scalar form. -/

/-- per-tick supplied power through the ports. -/
def supplied (sup : ℕ → ℝ) (k : ℕ) : ℝ := sup k

/-- per-tick dissipation through the resistive port (always ≥ 0 — the PSD curvature times an effort
    square). `Rcurv k ≥ 0` is the per-tick scalar resistive curvature (sampled `R_psd`); `eff k` is
    the per-tick effort. -/
def dissipated (Rcurv eff : ℕ → ℝ) (k : ℕ) : ℝ := Rcurv k * (eff k)^2

/-- the forward-Euler sampled storage trajectory. -/
def Hs (H0 : ℝ) (sup Rcurv eff : ℕ → ℝ) (N : ℕ) : ℝ :=
  H0 + (Finset.range N).sum (fun k => supplied sup k - dissipated Rcurv eff k)

/-- DERIVED: per-tick dissipation is nonnegative when the sampled resistive curvature is ≥ 0
    (this is the sampled `R_psd`: μ'' ≥ 0 ⇒ μ''·eff² ≥ 0). NOT assumed. -/
theorem sampled_dissip_nonneg (Rcurv eff : ℕ → ℝ) (hR : ∀ k, 0 ≤ Rcurv k) (k : ℕ) :
    0 ≤ dissipated Rcurv eff k := by
  unfold dissipated
  exact mul_nonneg (hR k) (sq_nonneg _)

/-- EXACT forward-Euler per-tick increment: ΔH = supplied − dissipated. -/
theorem sampled_increment (H0 : ℝ) (sup Rcurv eff : ℕ → ℝ) (k : ℕ) :
    Hs H0 sup Rcurv eff (k + 1) = Hs H0 sup Rcurv eff k + supplied sup k - dissipated Rcurv eff k := by
  simp only [Hs, Finset.sum_range_succ]
  ring

/-- HEADLINE INTERNAL HALF (ABSTRACT): the sampled storage at horizon N never exceeds initial storage
    plus cumulative supplied power. No-internal-free-money: storage cannot be manufactured internally;
    the only way up is the supplied port. Proven from `Rcurv ≥ 0` (the sampled `R_psd`) by telescoping. -/
theorem internal_passivity (H0 : ℝ) (sup Rcurv eff : ℕ → ℝ) (hR : ∀ k, 0 ≤ Rcurv k) (N : ℕ) :
    Hs H0 sup Rcurv eff N ≤ H0 + (Finset.range N).sum (fun k => supplied sup k) := by
  rw [Hs, Finset.sum_sub_distrib]
  have hdis : 0 ≤ (Finset.range N).sum (fun k => dissipated Rcurv eff k) :=
    Finset.sum_nonneg (fun k _ => sampled_dissip_nonneg Rcurv eff hR k)
  linarith

/-- COROLLARY: over any horizon, the storage gain is bounded by the cumulative supplied power
    (the no-internal-free-money / closed-cycle reading: with zero net supply, storage cannot rise). -/
theorem no_internal_free_money (H0 : ℝ) (sup Rcurv eff : ℕ → ℝ) (hR : ∀ k, 0 ≤ Rcurv k) (N : ℕ) :
    Hs H0 sup Rcurv eff N - H0 ≤ (Finset.range N).sum (fun k => supplied sup k) := by
  have := internal_passivity H0 sup Rcurv eff hR N
  linarith

/-- The resistive port of an `Exchange` supplies a nonnegative sampled curvature whenever the sampled
    states stay on the operating domain `t ≥ β` — i.e. the exchange's own `R_psd` witnesses the `hR`
    hypothesis of `internal_passivity`. (Welds the abstract passivity to the concrete object.) -/
theorem exchange_Rcurv_nonneg (E : Exchange) (st : ℕ → ℝ) (hst : ∀ k, E.amm.beta ≤ st k) :
    ∀ k, 0 ≤ deriv (deriv E.amm.poolPotential) (st k) := by
  intro k
  exact E.amm.R_psd (st k) (hst k)

/-! ### THE WELD — concrete-exchange passivity from geometry, with NO open PSD hypothesis. -/

/-- THE COMPOSED INTERNAL HALF. The CONCRETE exchange `E` is passive — its sampled storage never
    exceeds initial storage plus cumulative supplied power — when the sampled states `st` stay on the
    operating domain `E.amm.beta ≤ st k`. **There is NO open `hR` hypothesis.** The resistive curvature
    is the exchange's OWN geometry `Rcurv k := deriv (deriv E.amm.poolPotential) (st k)`, and its
    nonnegativity is DISCHARGED by `exchange_Rcurv_nonneg` (= the geometric `R_psd`), not assumed.
    This is the weld the conjecture called "the new content": passivity BECAUSE the geometry is PSD. -/
theorem exchange_internal_passivity (E : Exchange) (H0 : ℝ) (sup eff st : ℕ → ℝ)
    (hst : ∀ k, E.amm.beta ≤ st k) (N : ℕ) :
    Hs H0 sup (fun k => deriv (deriv E.amm.poolPotential) (st k)) eff N
      ≤ H0 + (Finset.range N).sum (fun k => supplied sup k) := by
  exact internal_passivity H0 sup (fun k => deriv (deriv E.amm.poolPotential) (st k)) eff
    (exchange_Rcurv_nonneg E st hst) N

/-- LOSSLESS-TRADE LEG. A pure trade conserves the Casimirs `α, β` (`trade_conserves`), so the
    post-trade object has the IDENTICAL `poolPotential` and hence the IDENTICAL resistive curvature,
    still PSD on `E.amm.beta ≤ st k`. Therefore on the post-trade exchange, with the geometric port as
    the resistive curvature, NO storage is spontaneously manufactured beyond the supplied port. The
    proof COMPOSES `trade_conserves` (to rewrite the post-trade `beta` to the pre-trade `beta` in the
    domain hypothesis) with `exchange_internal_passivity`. -/
theorem trade_no_spontaneous_storage (E : Exchange) (D : ℝ) (hD : E.amm.beta < E.amm.y + D)
    (H0 : ℝ) (sup eff st : ℕ → ℝ) (hst : ∀ k, E.amm.beta ≤ st k) (N : ℕ) :
    Hs H0 sup (fun k => deriv (deriv (E.trade D hD).amm.poolPotential) (st k)) eff N
      ≤ H0 + (Finset.range N).sum (fun k => supplied sup k) := by
  have hbeta : (E.trade D hD).amm.beta = E.amm.beta := (E.amm.trade_conserves D hD).2
  have hst' : ∀ k, (E.trade D hD).amm.beta ≤ st k := by
    intro k; rw [hbeta]; exact hst k
  exact exchange_internal_passivity (E.trade D hD) H0 sup eff st hst' N

/-! ### EXTERNAL HALF — solvency reduces to coverage; coverage is NOT discharged (B1/B3/B4). -/

/-- EXTERNAL HALF (CONDITIONAL — solvency under the named input-port coverage hypothesis). The
    coverage hypothesis `hcov` is the irreducible B1/B3/B4 admissibility predicate; it is a `→`
    premise and is NEVER proven here. Geometry gives no reserve floor (PH-4b), so this cannot be
    discharged from the object. -/
theorem solvency_of_coverage (E : Exchange)
    (hcov : ∀ s, E.floor - (E.amm.poolPotential s - E.obligation s) ≤ E.funding s) :
    ∀ s, E.floor ≤ (E.amm.poolPotential s - E.obligation s) + E.funding s := by
  intro s
  linarith [hcov s]

/-- The coverage hypothesis is EXACTLY the solvency condition (↔) — neither stronger nor weaker.
    Hence the minimal input-port hypothesis IS solvency-restricted-to-admissible-inputs; geometry,
    which supplies no reserve floor, cannot supply it. (PH-4b: port necessary-never-sufficient.) -/
theorem coverage_iff_solvency (E : Exchange) :
    (∀ s, E.floor - (E.amm.poolPotential s - E.obligation s) ≤ E.funding s)
      ↔ (∀ s, E.floor ≤ (E.amm.poolPotential s - E.obligation s) + E.funding s) := by
  constructor <;> intro h s <;> linarith [h s]

/-! ### THE SPLIT HEADLINE — one object, internal closes (geometry-witnessed), external stays a premise. -/

/-- THE whole-exchange split, NOW WELDED: the INTERNAL half (passivity / no-internal-free-money) holds
    for the CONCRETE exchange with the resistive port = its OWN geometry (NO open PSD hypothesis,
    discharged by `exchange_internal_passivity`); the EXTERNAL half (solvency) holds ONLY under the
    explicit input-port coverage premise. One object, internal half geometry-witnessed, external half a
    single named hypothesis. -/
theorem exchange_solvency_split (E : Exchange)
    (H0 : ℝ) (sup eff st : ℕ → ℝ) (hst : ∀ k, E.amm.beta ≤ st k) (N : ℕ) :
    (Hs H0 sup (fun k => deriv (deriv E.amm.poolPotential) (st k)) eff N
        ≤ H0 + (Finset.range N).sum (fun k => supplied sup k))
    ∧
    ( (∀ s, E.floor - (E.amm.poolPotential s - E.obligation s) ≤ E.funding s)
        → ∀ s, E.floor ≤ (E.amm.poolPotential s - E.obligation s) + E.funding s ) := by
  exact ⟨exchange_internal_passivity E H0 sup eff st hst N, solvency_of_coverage E⟩

end PHUnification

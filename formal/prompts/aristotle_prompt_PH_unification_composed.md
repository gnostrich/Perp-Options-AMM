# Aristotle prompt — PH-UNIFICATION composed internal half: weld geometry→passivity + lossless trade

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0 (match `lean-toolchain` = `leanprover/lean4:v4.28.0`).

## Task

This is the RESOLUTION of a skeptic FLAG-OVERSELL. A prior run proved the internal-half PIECES but
NOT the WELD: `internal_passivity` carried `hR` (resistive curvature ≥ 0) as a FREE OPEN hypothesis,
and `exchange_Rcurv_nonneg` (the geometric PSD witness) was a standalone lemma composed NOWHERE.
There was no theorem saying "this concrete exchange is passive BECAUSE its geometry is PSD," and the
conjectured lossless-trade leg `trade_no_spontaneous_storage` was absent.

Your job: **make the weld**. Keep every existing theorem EXACTLY as it is (do not change a single
statement — they are all already trusted-from-prover), and ADD TWO composed theorems:

1. **`exchange_internal_passivity`** — passivity for the CONCRETE `Exchange` with **NO open `hR`**.
   The resistive curvature is IDENTIFIED with the exchange's own geometry
   `Rcurv k := deriv (deriv E.amm.poolPotential) (st k)`, and the PSD hypothesis is DISCHARGED
   INTERNALLY by `exchange_Rcurv_nonneg`. The PSD premise must be CLOSED by geometry, not assumed.

2. **`trade_no_spontaneous_storage`** — the lossless-trade leg: a pure trade conserves the Casimirs
   (`trade_conserves`), so the post-trade object has the SAME `poolPotential` curvature, still PSD;
   hence with zero supplied port no storage is spontaneously manufactured. This theorem MUST compose
   `trade_conserves` (use it to identify the post-trade `beta` with the pre-trade `beta`).

This is a single self-contained file `RequestProject/PHUnification.lean`. It RE-DECLARES the minimal
slice of `TemporalAMM` and the abstract passivity machinery (self-contained; no project imports).
Prove every `sorry`. Do NOT alter any existing statement. Do NOT weaken a hypothesis or strengthen a
conclusion. The external half stays a `→` premise.

## Background (math; all already trusted-from-prover — re-derive, don't re-discover)

- `poolPotential t = (t-β)^3/(3αβ)`; `μ''(t) = 2(t-β)/(αβ) ≥ 0` for `t ≥ β` (this is `R_psd`, the
  resistive curvature PSD on the operating domain).
- A trade `P.trade D` only moves the state coordinate `y`; it conserves the Casimirs `α, β`
  (`trade_conserves`). Since `poolPotential` depends on the conserved `β` only (and `α`), the
  post-trade object has the IDENTICAL potential function and hence the IDENTICAL curvature — so its
  curvature is PSD on the same domain `t ≥ β`. The weld: `exchange_Rcurv_nonneg` on the post-trade
  exchange, with `β` rewritten via `trade_conserves`.
- Abstract discrete passivity: `Hs N = H0 + Σ_{k<N}(supplied k − dissipated k)`, with
  `dissipated k = Rcurv k·(eff k)² ≥ 0` when `Rcurv k ≥ 0`, gives `Hs N ≤ H0 + Σ supplied`.

## Lean (file `RequestProject/PHUnification.lean`)

```lean
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
```

## Proof targets (prove each `sorry`; do NOT change any statement)

All of `R_psd`, `trade_conserves`, `sampled_dissip_nonneg`, `sampled_increment`, `internal_passivity`,
`no_internal_free_money`, `exchange_Rcurv_nonneg`, `solvency_of_coverage`, `coverage_iff_solvency` are
ALREADY supplied with their proofs (do not change them). The NEW content:

- `TemporalAMM.trade_poolPotential` — `rfl` (the potential depends only on `beta`, which the trade
  copies unchanged).
- `Exchange.trade` — definitional (`{ E with amm := E.amm.trade D hD }`).
- `exchange_internal_passivity` — apply `internal_passivity` with
  `Rcurv := fun k => deriv (deriv E.amm.poolPotential) (st k)`, discharging `hR` by
  `exchange_Rcurv_nonneg E st hst`. **The `hR` slot MUST be filled by `exchange_Rcurv_nonneg` — no open
  hypothesis.**
- `trade_no_spontaneous_storage` — get `hbeta : (E.trade D hD).amm.beta = E.amm.beta` from
  `trade_conserves`, lift `hst` to the post-trade beta, then apply `exchange_internal_passivity`. **The
  proof MUST use `trade_conserves`.**
- `exchange_solvency_split` — `⟨exchange_internal_passivity …, solvency_of_coverage E⟩`.

If the suggested tactic for any NEW target does not close it, you may use any sound tactic — but the
COMPOSITION must remain: `exchange_internal_passivity` must call `exchange_Rcurv_nonneg`, and
`trade_no_spontaneous_storage` must call `trade_conserves`. Do NOT re-stub the PSD hypothesis. Do NOT
add a `sorry`/`axiom`. If a statement as written cannot be proven, report that plainly — do NOT weaken
it to make it pass.

## HARD constraints (audit gate; a candidate that needs any of these is a BOUNCE)

- Compiles server-side in Lean 4.28.0 / Mathlib v4.28.0.
- NO `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`; NO new `axiom` declarations.
  Kernel `decide` is fine.
- `#print axioms` for each named theorem ⊆ `{propext, Classical.choice, Quot.sound}`.
- **`exchange_internal_passivity` must carry NO open `hR` / PSD hypothesis** — the only premises are
  object data, `eff`/`sup`/`st`, the domain hypothesis `hst : ∀ k, E.amm.beta ≤ st k`, and `N`. The
  resistive curvature is `deriv (deriv E.amm.poolPotential) (st k)`, and its nonnegativity is
  discharged INTERNALLY by `exchange_Rcurv_nonneg`.
- **`trade_no_spontaneous_storage` must genuinely USE `trade_conserves`** (to identify the post-trade
  `beta`), not merely restate it.
- **Do NOT prove `solvency_of_coverage` by discharging `hcov` — it MUST stay a `→` premise.** Do NOT
  add any hypothesis that lets solvency hold without the coverage premise.
- Only `RequestProject/PHUnification.lean` is added/changed. Do NOT touch any other module.
- The `close` field of `Exchange` must remain unused by every internal-half theorem.

## Output spec

- Return the completed `RequestProject/PHUnification.lean` and an `ARISTOTLE_SUMMARY.md` listing, for
  each named theorem, the `#print axioms` output — INCLUDING `exchange_internal_passivity` and
  `trade_no_spontaneous_storage`.

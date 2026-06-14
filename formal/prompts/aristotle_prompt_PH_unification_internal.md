# Aristotle prompt — PH-UNIFICATION internal half: whole-exchange passivity (no-internal-free-money)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0 (match `lean-toolchain` = `leanprover/lean4:v4.28.0`).

## Task

State the whole exchange as ONE structure wrapping the existing `TemporalAMM` single object with the
exchange ports, and prove the **INTERNAL half** of the unification: the structural passivity theorem
(no-internal-free-money). The EXTERNAL half (solvency) is DELIBERATELY left as an explicit `→`
hypothesis — do NOT prove solvency unconditionally; do NOT discharge the coverage hypothesis.

This is a single self-contained file `RequestProject/PHUnification.lean`. It RE-DECLARES the minimal
slices of the already-proven `TemporalAMM` object and the abstract passivity machinery it needs, so it
is self-contained (you do not need to import the project's other modules). Prove every `sorry`. Do NOT
alter any statement. Do NOT weaken a hypothesis or strengthen a conclusion.

## Background (the math; all of this is ALREADY trusted-from-prover elsewhere — re-derive, don't re-discover)

1. **The single object** `TemporalAMM` with fields `alpha,beta,y,m` (all positive, `beta < y`).
   `poolPotential t = (t - beta)^3 / (3·alpha·beta)`. Its second derivative
   `μ''(t) = 2·(t - beta)/(alpha·beta)` is `≥ 0` for `t ≥ beta` — this is the resistive curvature
   `R ⪰ 0` on the operating domain. A trade conserves the Casimirs `alpha, beta` (lossless conservative
   flow). These are the facts `R_psd` and `trade_conserves`.

2. **Abstract discrete passivity (CTPH).** For per-tick supplied power `supplied k` and per-tick
   dissipation `dissipated k` with `dissipated k ≥ 0`, the forward-Euler sampled storage
   `Hs N = H0 + Σ_{k<N} (supplied k − dissipated k)` satisfies `Hs N ≤ H0 + Σ_{k<N} supplied k`
   (telescoping, since the subtracted dissipation is ≥ 0). This is the no-internal-free-money law.

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

-- the resistive curvature R ⪰ 0 on the operating domain t ≥ β (this is `R_psd`)
theorem R_psd (P : TemporalAMM) : ∀ t, P.beta ≤ t → 0 ≤ deriv (deriv P.poolPotential) t := by
  sorry

-- the conservative flow conserves the Casimirs α, β (this is `trade_conserves`)
theorem trade_conserves (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
    (P.trade D hD).alpha = P.alpha ∧ (P.trade D hD).beta = P.beta := by
  sorry

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
  sorry

/-- EXACT forward-Euler per-tick increment: ΔH = supplied − dissipated. -/
theorem sampled_increment (H0 : ℝ) (sup Rcurv eff : ℕ → ℝ) (k : ℕ) :
    Hs H0 sup Rcurv eff (k + 1) = Hs H0 sup Rcurv eff k + supplied sup k - dissipated Rcurv eff k := by
  sorry

/-- HEADLINE INTERNAL HALF: the sampled storage at horizon N never exceeds initial storage plus
    cumulative supplied power. No-internal-free-money: storage cannot be manufactured internally; the
    only way up is the supplied port. Proven from `Rcurv ≥ 0` (the sampled `R_psd`) by telescoping. -/
theorem internal_passivity (H0 : ℝ) (sup Rcurv eff : ℕ → ℝ) (hR : ∀ k, 0 ≤ Rcurv k) (N : ℕ) :
    Hs H0 sup Rcurv eff N ≤ H0 + (Finset.range N).sum (fun k => supplied sup k) := by
  sorry

/-- COROLLARY: over any horizon, the storage gain is bounded by the cumulative supplied power
    (the no-internal-free-money / closed-cycle reading: with zero net supply, storage cannot rise). -/
theorem no_internal_free_money (H0 : ℝ) (sup Rcurv eff : ℕ → ℝ) (hR : ∀ k, 0 ≤ Rcurv k) (N : ℕ) :
    Hs H0 sup Rcurv eff N - H0 ≤ (Finset.range N).sum (fun k => supplied sup k) := by
  sorry

/-- The resistive port of an `Exchange` supplies a nonnegative sampled curvature whenever the sampled
    states stay on the operating domain `t ≥ β` — i.e. the exchange's own `R_psd` witnesses the `hR`
    hypothesis of `internal_passivity`. (Welds the abstract passivity to the concrete object.) -/
theorem exchange_Rcurv_nonneg (E : Exchange) (st : ℕ → ℝ) (hst : ∀ k, E.amm.beta ≤ st k) :
    ∀ k, 0 ≤ deriv (deriv E.amm.poolPotential) (st k) := by
  sorry

/-! ### EXTERNAL HALF — solvency reduces to coverage; coverage is NOT discharged (B1/B3/B4). -/

/-- EXTERNAL HALF (CONDITIONAL — solvency under the named input-port coverage hypothesis). The
    coverage hypothesis `hcov` is the irreducible B1/B3/B4 admissibility predicate; it is a `→`
    premise and is NEVER proven here. Geometry gives no reserve floor (PH-4b), so this cannot be
    discharged from the object. -/
theorem solvency_of_coverage (E : Exchange)
    (hcov : ∀ s, E.floor - (E.amm.poolPotential s - E.obligation s) ≤ E.funding s) :
    ∀ s, E.floor ≤ (E.amm.poolPotential s - E.obligation s) + E.funding s := by
  sorry

/-- The coverage hypothesis is EXACTLY the solvency condition (↔) — neither stronger nor weaker.
    Hence the minimal input-port hypothesis IS solvency-restricted-to-admissible-inputs; geometry,
    which supplies no reserve floor, cannot supply it. (PH-4b: port necessary-never-sufficient.) -/
theorem coverage_iff_solvency (E : Exchange) :
    (∀ s, E.floor - (E.amm.poolPotential s - E.obligation s) ≤ E.funding s)
      ↔ (∀ s, E.floor ≤ (E.amm.poolPotential s - E.obligation s) + E.funding s) := by
  sorry

/-! ### THE SPLIT HEADLINE — one object, internal closes, external stays a single premise. -/

/-- THE whole-exchange split: the INTERNAL half (passivity / no-internal-free-money) holds
    unconditionally from `R ⪰ 0`; the EXTERNAL half (solvency) holds ONLY under the explicit
    input-port coverage premise. This is the legibility deliverable: one object, the internal half
    discharged, the external half a single named hypothesis. -/
theorem exchange_solvency_split (E : Exchange)
    (H0 : ℝ) (sup Rcurv eff : ℕ → ℝ) (hR : ∀ k, 0 ≤ Rcurv k) (N : ℕ) :
    (Hs H0 sup Rcurv eff N ≤ H0 + (Finset.range N).sum (fun k => supplied sup k))
    ∧
    ( (∀ s, E.floor - (E.amm.poolPotential s - E.obligation s) ≤ E.funding s)
        → ∀ s, E.floor ≤ (E.amm.poolPotential s - E.obligation s) + E.funding s ) := by
  sorry

end PHUnification
```

## Proof targets (prove each `sorry`; do NOT change any statement)

- `TemporalAMM.R_psd` — μ''(t) = 2(t−β)/(αβ) ≥ 0 for t ≥ β. (Differentiate the cubic
  `poolPotential` twice and show nonneg from `t ≥ β`, `0 < α`, `0 < β`.)
- `TemporalAMM.trade_conserves` — `trade` keeps `alpha`, `beta` (definitional `simp [trade]`).
- `sampled_dissip_nonneg` — `Rcurv k · (eff k)^2 ≥ 0` from `Rcurv k ≥ 0` and a square ≥ 0
  (`mul_nonneg`, `sq_nonneg`).
- `sampled_increment` — `Finset.sum_range_succ` + `ring`.
- `internal_passivity` — split the sum (`Finset.sum_sub_distrib`), the dissipation sum is ≥ 0
  (`Finset.sum_nonneg` + `sampled_dissip_nonneg`), `linarith`.
- `no_internal_free_money` — immediate from `internal_passivity` (`linarith`).
- `exchange_Rcurv_nonneg` — apply `E.amm.R_psd` at each `st k` with `hst k`.
- `solvency_of_coverage` — `intro s; linarith [hcov s]`.
- `coverage_iff_solvency` — `constructor <;> intro h s <;> linarith [h s]`.
- `exchange_solvency_split` — `⟨internal_passivity …, solvency_of_coverage E⟩` (the second component
  is `fun hcov => solvency_of_coverage E hcov`).

## HARD constraints (audit gate; a candidate that needs any of these is a BOUNCE)

- Compiles server-side in Lean 4.28.0 / Mathlib v4.28.0.
- NO `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`; NO new `axiom` declarations.
  Kernel `decide` is fine.
- `#print axioms` for each named theorem ⊆ `{propext, Classical.choice, Quot.sound}`.
- **Do NOT prove `solvency_of_coverage` by discharging `hcov` — it MUST stay a `→` premise.** Do NOT
  add any hypothesis that lets solvency hold without the coverage premise. Do NOT weaken `internal_passivity`
  (the bound must be `≤ H0 + Σ supplied`, not a vacuous/weaker bound).
- Only `RequestProject/PHUnification.lean` is added. Do NOT touch any other module.
- The `close` field of `Exchange` must remain unused by every internal-half theorem (the close-mechanic
  is a pending design choice Q14 — no theorem may depend on a specific close).

## Output spec

- Return the completed `RequestProject/PHUnification.lean` and an `ARISTOTLE_SUMMARY.md` listing, for
  each named theorem, the `#print axioms` output.

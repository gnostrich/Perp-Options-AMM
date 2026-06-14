# Summary of changes for run 5c2bccf2-9ec8-4f02-a066-80e06aeb49e3
Completed the weld in `RequestProject/PHUnification.lean`. All four previously-`sorry`'d targets are proved without altering any existing statement, and no `sorry`/`admit`/`axiom`/`native_decide` is used.

What was filled in:
- `TemporalAMM.trade_poolPotential` — `rfl` (the potential depends only on the conserved `alpha`/`beta`, copied by the trade).
- `exchange_internal_passivity` — concrete-exchange passivity with NO open `hR`: the resistive curvature is the exchange's own geometry `fun k => deriv (deriv E.amm.poolPotential) (st k)`, and the PSD premise is discharged internally by `exchange_Rcurv_nonneg E st hst`, fed to `internal_passivity`.
- `trade_no_spontaneous_storage` — composes `trade_conserves` to get `(E.trade D hD).amm.beta = E.amm.beta`, lifts the domain hypothesis to the post-trade beta, then applies `exchange_internal_passivity` to the post-trade exchange.
- `exchange_solvency_split` — `⟨exchange_internal_passivity …, solvency_of_coverage E⟩`, external half left as a `→` premise.

Verification: the project builds successfully and `RequestProject.PHUnification` compiles with no remaining `sorry`. `#print axioms` for every named theorem (including `exchange_internal_passivity` and `trade_no_spontaneous_storage`) yields only `{propext, Classical.choice, Quot.sound}`. Audit-gate constraints hold: `exchange_internal_passivity` carries no PSD hypothesis, `trade_no_spontaneous_storage` genuinely uses `trade_conserves`, `solvency_of_coverage` keeps `hcov` as a premise, and the `close` field stays unused by the internal-half theorems. The `#print axioms` listing for all theorems is recorded in `ARISTOTLE_SUMMARY.md`.

# PH-UNIFICATION — composed internal half (the weld)

File: `RequestProject/PHUnification.lean` (self-contained, `import Mathlib`).

All four previously-`sorry`'d targets are now proved, no statement was altered, and no
`sorry`/`admit`/`axiom`/`native_decide` is used.

## What was added (the weld)

- `TemporalAMM.trade_poolPotential` — proved by `rfl`: the potential depends only on the
  conserved `alpha`, `beta`, which the trade copies unchanged.
- `exchange_internal_passivity` — passivity for the CONCRETE `Exchange` with **NO open `hR`**.
  The resistive curvature is `fun k => deriv (deriv E.amm.poolPotential) (st k)` and the PSD
  premise is discharged INTERNALLY by `exchange_Rcurv_nonneg E st hst`, then fed to
  `internal_passivity`.
- `trade_no_spontaneous_storage` — the lossless-trade leg. It obtains
  `hbeta : (E.trade D hD).amm.beta = E.amm.beta` from `trade_conserves`, lifts the domain
  hypothesis `hst` to the post-trade beta, and applies `exchange_internal_passivity` to the
  post-trade exchange. It genuinely USES `trade_conserves`.
- `exchange_solvency_split` — `⟨exchange_internal_passivity …, solvency_of_coverage E⟩`; the
  external half stays a `→` premise.

## `#print axioms` for each named theorem

Every theorem depends only on `{propext, Classical.choice, Quot.sound}`:

- `TemporalAMM.R_psd` — [propext, Classical.choice, Quot.sound]
- `TemporalAMM.trade_conserves` — [propext, Classical.choice, Quot.sound]
- `TemporalAMM.trade_poolPotential` — [propext, Classical.choice, Quot.sound]
- `sampled_dissip_nonneg` — [propext, Classical.choice, Quot.sound]
- `sampled_increment` — [propext, Classical.choice, Quot.sound]
- `internal_passivity` — [propext, Classical.choice, Quot.sound]
- `no_internal_free_money` — [propext, Classical.choice, Quot.sound]
- `exchange_Rcurv_nonneg` — [propext, Classical.choice, Quot.sound]
- `exchange_internal_passivity` — [propext, Classical.choice, Quot.sound]
- `trade_no_spontaneous_storage` — [propext, Classical.choice, Quot.sound]
- `solvency_of_coverage` — [propext, Classical.choice, Quot.sound]
- `coverage_iff_solvency` — [propext, Classical.choice, Quot.sound]
- `exchange_solvency_split` — [propext, Classical.choice, Quot.sound]

## Audit-gate notes

- `exchange_internal_passivity` carries no open `hR`/PSD hypothesis; its only premises are the
  object `E`, `H0`, `sup`/`eff`/`st`, the domain hypothesis `hst`, and `N`.
- `trade_no_spontaneous_storage` genuinely composes `trade_conserves` to identify the post-trade
  `beta` with the pre-trade `beta`.
- `solvency_of_coverage` keeps `hcov` as a `→` premise; it is never discharged.
- The `close` field of `Exchange` is unused by every internal-half theorem.
- Only `RequestProject/PHUnification.lean` was changed.

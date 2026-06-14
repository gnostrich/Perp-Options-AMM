# Summary of changes for run 80cd7ba4-18aa-4976-adfc-2c55f056d815
Added the self-contained file `RequestProject/PHUnification.lean` (imports only `Mathlib`) and `ARISTOTLE_SUMMARY.md`. No other module was changed.

The whole exchange is wrapped as ONE structure `Exchange` around the re-declared minimal `TemporalAMM` single object plus the exchange ports (`obligation`, `funding`, `close`, `floor`). I proved every `sorry` without altering any statement, hypothesis, or conclusion:

- `TemporalAMM.R_psd` — the resistive curvature μ''(t) = 2(t−β)/(αβ) ≥ 0 for t ≥ β (second derivative of the cubic pool potential, nonnegative from t ≥ β, 0 < α, 0 < β).
- `TemporalAMM.trade_conserves` — `trade` conserves the Casimirs α, β (definitional).
- `sampled_dissip_nonneg` — per-tick dissipation Rcurv·eff² ≥ 0.
- `sampled_increment` — exact forward-Euler increment ΔH = supplied − dissipated.
- `internal_passivity` — HEADLINE no-internal-free-money: Hs N ≤ H0 + Σ supplied, by telescoping with the nonnegative dissipation sum.
- `no_internal_free_money` — corollary storage-gain bound.
- `exchange_Rcurv_nonneg` — welds the abstract passivity to the concrete object via the exchange's own `R_psd`.
- `solvency_of_coverage`, `coverage_iff_solvency`, `exchange_solvency_split` — the EXTERNAL half is kept strictly conditional: solvency is derived ONLY from the explicit coverage premise `hcov`, which is never discharged. `lean_minimal_hypotheses` confirms `hcov` is load-bearing.

The `close` field is used by no internal-half theorem. The project builds cleanly; a grep confirms no `sorry`/`admit`/`native_decide`/`axiom`/`unsafe`/`opaque`, and `#print axioms` for all ten named theorems is exactly `{propext, Classical.choice, Quot.sound}` (recorded in `ARISTOTLE_SUMMARY.md`).

# PH-UNIFICATION — Internal Half (whole-exchange passivity)

File added: `RequestProject/PHUnification.lean` (self-contained; imports only `Mathlib`).
No other module was touched.

The whole exchange is wrapped as ONE structure `Exchange` around the re-declared minimal
`TemporalAMM` single object plus the exchange ports (`obligation`, `funding`, `close`, `floor`).
The INTERNAL half (structural passivity / no-internal-free-money) is proved unconditionally; the
EXTERNAL half (solvency) is left as an explicit `→` premise (`hcov`, the coverage hypothesis),
which is never discharged. `lean_minimal_hypotheses` confirms `hcov` is load-bearing in
`solvency_of_coverage`. The `close` field is used by no internal-half theorem.

All ten named theorems were proved with no `sorry`/`admit`/`native_decide`/`axiom`.

## `#print axioms` output (each ⊆ {propext, Classical.choice, Quot.sound})

- `PHUnification.TemporalAMM.R_psd` depends on axioms: [propext, Classical.choice, Quot.sound]
- `PHUnification.TemporalAMM.trade_conserves` depends on axioms: [propext, Classical.choice, Quot.sound]
- `PHUnification.sampled_dissip_nonneg` depends on axioms: [propext, Classical.choice, Quot.sound]
- `PHUnification.sampled_increment` depends on axioms: [propext, Classical.choice, Quot.sound]
- `PHUnification.internal_passivity` depends on axioms: [propext, Classical.choice, Quot.sound]
- `PHUnification.no_internal_free_money` depends on axioms: [propext, Classical.choice, Quot.sound]
- `PHUnification.exchange_Rcurv_nonneg` depends on axioms: [propext, Classical.choice, Quot.sound]
- `PHUnification.solvency_of_coverage` depends on axioms: [propext, Classical.choice, Quot.sound]
- `PHUnification.coverage_iff_solvency` depends on axioms: [propext, Classical.choice, Quot.sound]
- `PHUnification.exchange_solvency_split` depends on axioms: [propext, Classical.choice, Quot.sound]

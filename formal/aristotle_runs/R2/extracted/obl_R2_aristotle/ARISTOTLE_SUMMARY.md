# Summary of changes for run 5db70058-5d81-4016-ab90-9f9e7fc9371b
All four theorems in `RequestProject/R2.lean` have been proved and verified:

1. **`crossover_sNorm_at_K`** — sNorm registration ⇒ crossover at dollar strike K for all γ > 0. Proved via `rpow_left_inj` (injectivity of x ↦ x^γ on positives).

2. **`crossover_ratio_form`** — Closed-form crossover spot S = o0^((γ+1)/γ) · K^(−1/γ) for ratio registration. Proved via rpow arithmetic.

3. **`crossover_ratio_at_gamma1`** — At γ = 1 the ratio-registration crossover simplifies to o0²/K. Proved via `norm_num` and `rpow_neg_one`.

4. **`mixed_basis_control`** (negative control) — o0²/K = K ↔ o0 = K for positive reals, confirming the ratio registration only lands at K in the degenerate case. Proved via `div_eq_iff` and `nlinarith`.

All proofs compile without `sorry`, `admit`, `native_decide`, `opaque`, `unsafe`, or new axioms. Each theorem depends only on `{propext, Classical.choice, Quot.sound}`. No statements were altered.
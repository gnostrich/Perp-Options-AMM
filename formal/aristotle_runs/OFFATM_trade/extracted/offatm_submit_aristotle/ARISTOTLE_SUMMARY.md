# Summary of changes for run 8bacbce2-7f8e-4b86-8f06-ac46565a2244
Completed `OffATMTrade.lean`: filled all 9 `sorry`s with proof bodies only. No theorem statement, hypothesis, or the two `def`s (`deltaX`, `deltaW`) were changed.

Proofs:
- `tradePoint_exists_unique`: reduce the on-ray curve equation to linearity via `Real.mul_rpow` + `Real.rpow_add` (key lemma `t^w·(θ·t)^(1−w) = t·θ^(1−w)`), witness x_T = (x^w·y^(1−w))/θ^(1−w), uniqueness by cancellation.
- `wNext_eq`: `field_simp; ring` closed form w′ = (w·yT+dy)/(yT+dy).
- `wNext_mem_Ioo`: rewrite via `wNext_eq`, then `div_pos`/`div_lt_one` with `nlinarith` (denominator yT+dy = (1−w)·yT + (w·yT+dy) > 0).
- `next_state_valid`: combine hypotheses with `wNext_mem_Ioo`.
- `pole_does_not_bound_state`: `norm_num [← Real.mul_rpow]` for the rpow conjunct plus arithmetic.
- `local_conservation`: closed form for Δx after cancelling the pole factor (yT·w), then `field_simp; ring` on both conjuncts.
- `spot_reduction_global_conservation`: first two conjuncts from `local_conservation`; hyperbola conjunct by rewriting with the two conservation identities then `ring`.
- `w_storage_necessary` and `offATM_distinct_operator_signature`: unfold the concrete rational defs and `norm_num` (rpow conjunct via `Real.mul_rpow`).

Verification:
- `lake build` of module `OffATMTrade` succeeds with no errors.
- No `sorry`/`admit`/`axiom`/`native_decide`/`opaque`/`unsafe`/`grind`/`exact?` in the file.
- `#print axioms` for all 9 theorems yields exactly `[propext, Classical.choice, Quot.sound]`, within the allowed set.

Remaining messages are only unused-variable warnings on hypotheses that are part of the fixed statements (`hw0`/`hw1` in `tradePoint_exists_unique`, `hw0` in `wNext_mem_Ioo`, `hx` in `spot_reduction_global_conservation`); they cannot be removed without changing the statements, which the task prohibits.
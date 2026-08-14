# Summary of changes for run aa5f90f8-0b7d-4f52-ae30-2426ac4666d9
The Lean formalization is complete and committed in the project — every `sorry` in `LINK_SETTLEMENT.lean` has been replaced by a real, machine-checked proof, and I re-verified this just now (full project build succeeds; no `sorry`, `admit`, `axiom`, `native_decide`, `opaque`, or `unsafe` appears anywhere in the file).

What was done, in `LINK_SETTLEMENT.lean`:
- §1 (conservation): `units_add`, `units_smul`, `cashOne_add`, `cashOne_zero_iff`, `cashOne_pos_iff` — finite-sum additivity/homogeneity, then multiplication by the nonzero, positive scalar `E * L`.
- §2 (exit-timing safety): `exit_timing_irrelevant` — both sides collapse to `0 * (E * L)`.
- §3 (necessity): `common_doorway_arbfree`, `common_doorway_necessary`, `per_strike_doorway_unbounded_arb`, `doorway_arbfree_iff_common`. These use one added private witness definition, `pairPort V i j l = if l = i then (V i)⁻¹ else if l = j then -(V j)⁻¹ else 0`, together with three private helper lemmas: `pairPort_units` (net units are `0`, proved by rewriting each term as `1_{l=i} - 1_{l=j}`), `pairPort_cash` (`cashPer F V (pairPort V i j) = F i - F j`), and `cashPer_smul`. The unbounded arbitrage scales that portfolio by `(|M| + 1) / (F i - F j)`. In the dichotomy, the `n = 0` case is dispatched separately (sums over an empty index type), so no nonemptiness hypothesis was needed.
- §4 (tie-back): `cashPer_const_eq_cashOne`, `net_then_convert_eq_convert_then_net` — both are `Finset.sum_mul`.

Constraints respected: no theorem statement, definition, or hypothesis was altered; the only additions are the proof bodies plus the private helper definition and lemmas. `BOOK_FORMAL.lean`, `MAP_FORMAL.lean`, and `BASIS_FORMAL.lean` are untouched byte-for-byte (`git status` shows `LINK_SETTLEMENT.lean` as the sole modified file).

No statement turned out to be false; nothing was left open.

`#print axioms` for all twelve theorems — `units_add`, `units_smul`, `cashOne_add`, `cashOne_zero_iff`, `cashOne_pos_iff`, `exit_timing_irrelevant`, `common_doorway_arbfree`, `common_doorway_necessary`, `per_strike_doorway_unbounded_arb`, `doorway_arbfree_iff_common`, `cashPer_const_eq_cashOne`, `net_then_convert_eq_convert_then_net` — reports exactly `[propext, Classical.choice, Quot.sound]` in every case.

All work is committed and pushed.
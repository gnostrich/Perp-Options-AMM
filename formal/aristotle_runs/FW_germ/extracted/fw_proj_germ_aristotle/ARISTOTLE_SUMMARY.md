# Summary of changes for run 7c94e8df-1a4b-4307-abd0-2835d76e297a
Completed FW-5 and FW-6 by filling all seven `sorry`s in `RequestProject/FWGerm.lean`; no other files were modified.

Proved:
- `joint_iff` (FW-5): the joint warp+mode first-order characterization at the mark. Forward direction uses uniqueness of derivatives (`HasDerivAt.unique`) on the transport mismatch (derivative `ε'+1−A u₀`) and mode error (derivative `ε'+A u₀`, where the `A(u₀+du)·du` term gets derivative `A u₀` from continuity of `A` alone via the slope criterion); backward direction constructs the derivatives and rewrites them to `0`. Conclusion: both hold iff `ε' = −1/2 ∧ A u₀ = 1/2`.
- `germ_weight` (weight-form corollary): `ε/(1+ε)` has value `1/2` and derivative `−1/8` at the mark (quotient rule).
- `germ_mode`, `germ_slope`, `germ_kernel`, `germ_satisfies_both`, `germ_valid_strip` (FW-6 witness): the translating linear germ `wGerm c u = 1/2 − (u−c)/8`, `epsGerm = wGerm/(1−wGerm)`, kernel `Agerm c u = (1/8)/((1/2+(u−c)/8)²)` satisfies mode (`epsGerm c c = 1`), slope (`HasDerivAt (epsGerm c) (−1/2) c`), kernel (`Agerm c c = 1/2`, continuous), both first-order contracts at every anchor, and the strict AMM-validity gate on the strip `(u−c)² < 8`.

All statements, definitions, and hypotheses were left frozen as given. The module builds successfully. The file contains no `sorry`/`admit`/`axiom`/`native_decide`/`opaque`/`unsafe`. `#print axioms` was added for each theorem; every one depends only on `propext`, `Classical.choice`, and `Quot.sound`. No statement turned out to be false.
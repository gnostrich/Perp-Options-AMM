# Summary of changes for run 6c4da517-1c1b-409b-8c7c-bc8a7ce1b844
Both theorems in `RequestProject/GHCoercive.lean` have been proved:

1. **`coercive_of_nonneg`**: For `dom ⊆ Ioi 0` and `y` nonneg on `dom`, the value set `{p·x + y(x)}` is `BddBelow` (lower bound 0). Proof: for `x ∈ dom`, `x > 0` and `y x ≥ 0` give `p·x + y x ≥ 0` via `nlinarith`.

2. **`gh_value_nonneg`**: Sanity corollary — `0 ≤ p * x + y x` for `p > 0`, `x ∈ Ioi 0`, `0 ≤ y x`. Proved by `nlinarith`.

Both axiom sets are exactly `{propext, Classical.choice, Quot.sound}`. `AMMCurve.lean` is untouched. The module builds cleanly.
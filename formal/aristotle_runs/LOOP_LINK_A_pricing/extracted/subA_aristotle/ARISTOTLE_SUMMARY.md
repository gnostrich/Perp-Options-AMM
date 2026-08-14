# Summary of changes for run b1e0c962-86f7-4805-9af4-f47c8259b3af
All eight `sorry`s in `LINK_PRICING.lean` are now replaced by complete proofs. The file builds cleanly (`lake build`, target `LINK_PRICING`) with no `sorry`, `admit`, `axiom`, `native_decide`, `opaque`, or `unsafe`, and `BOOK_FORMAL.lean`, `MAP_FORMAL.lean`, `BASIS_FORMAL.lean` are untouched (the only modified file in the repo is `LINK_PRICING.lean`). No theorem statement, definition, or hypothesis was changed; only proofs, two extra imports, and private helper lemmas were added.

Results, each with its `#print axioms` output:

- `LinkPricing.atmMark_pos` — PROVED — [propext, Classical.choice, Quot.sound]
- `LinkPricing.atm_kink_bound` — PROVED — [propext, Classical.choice, Quot.sound]
- `LinkPricing.engine_call_midconvex` — PROVED — [propext, Classical.choice, Quot.sound]
- `LinkPricing.engine_book_arb_free` — PROVED — [propext, Classical.choice, Quot.sound]
- `LinkPricing.engine_book_parity` — PROVED — [propext, Classical.choice, Quot.sound]
- `LinkPricing.engine_log_affine` — PROVED — [propext, Classical.choice, Quot.sound]
- `LinkPricing.mixture_strict_log_convex` — PROVED — [propext, Classical.choice, Quot.sound]
- `LinkPricing.mixture_not_single_lens` — PROVED — [propext, Classical.choice, Quot.sound]

(`LinkPricing.engine_parity`, already proved in the input, likewise depends only on those three axioms.) No statement turned out to be false.

How the two substantial ones went:

§1 `atm_kink_bound`. As you indicated, it reduces to `(g+1)·((g+1)/g)^g ≥ 2g`. Writing `((g+1)/g)^g = exp(g·log(1+1/g))` and using `log t ≥ 1 − 1/t` at `t = (g+1)/g` gives `g·log(1+1/g) ≥ g/(g+1)`, hence with `exp y ≥ 1+y` the stronger `(g+1)·((g+1)/g)^g ≥ 2g+1`, valid for all `g > 0`.

§2 `engine_call_midconvex`. Instead of computing derivatives of the piecewise curve, the proof exhibits a global supporting line at every point (private lemma `engine_supporting`): `∀ x, ∃ m, ∀ k, F x + m·(k−x) ≤ F k`. Midpoint convexity then follows by evaluating the supporting line at the midpoint against `a` and `b`. The supporting line is built from two tangent-line inequalities proved from scratch — `u^(−g) ≥ s^(−g) − g·s^(−g−1)(u−s)` (from `log t ≤ t−1` and `exp y ≥ 1+y`) and `u^g ≥ s^g + g·s^(g−1)(u−s)` (Bernoulli, `g ≥ 1`) — chained across the joins `k = 0` and `k = −1`. The chaining needs the slope comparisons `g·A_g − 1 ≤ −g·A_g` and `−1 ≤ g·A_g·(1+x)^(g−1) − 1`. The first of these uses the sharp bound `(g+1)·A_g = (g/(g+1))^g ≤ 1/2` for `g ≥ 1`, which is exactly Bernoulli `(1+1/g)^g ≥ 2` (tight at `g = 1`) and is slightly stronger than `2·g·A_g ≤ 1`.

§3 is a direct instantiation of the existing aggregation results with the engine curve; §4 follows your Cauchy–Schwarz route (the log-convexity gap equals `p₁p₂(ad−bc)²`, strictly positive because `g₁ ≠ g₂` and `s ≠ t`), and the obstruction is obtained by evaluating at log-strikes `u = 0, 1, 2`, where log-affinity forces equality and strict log-convexity forbids it.
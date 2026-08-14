# The maps — perp book → option books across strikes (Lean)

Three kernel-checked Lean 4 libraries, and only these. Import chain:
`BASIS_FORMAL` → `MAP_FORMAL` → `BOOK_FORMAL`.

| File | Map | What it proves |
|---|---|---|
| `BOOK_FORMAL.lean`  | **Map 2 core** — aggregation & no-arbitrage | one level never crosses itself; the separation theorem, both directions (`butterfly_nonneg` ↔ `level_convex_iff_zero_spread_arbfree`); a weighted average of continuations keeps parity + convexity (`agg_parity`, `agg_midconvex`); best-of-book leaves the family (`min_not_midconvex`). |
| `MAP_FORMAL.lean`   | **Map 1 + Map 2** — the parametric map | map is well-posed and κ buys no depth; the Δ transports; depth adds in parallel (`beta_transport_parallel`); fill shares strike-invariant (`share_strike_invariant`); the order-book isomorphism (`walk_equiv`, `walk_cost_equiv`). |
| `BASIS_FORMAL.lean` | **Maps 1–3** — the perp-basis form | slope/half-spread **read off the perp book** (`PerpQuote`); Δ² forced (`square_is_the_only_strike_indifferent_exponent`), \|Δ\| first-moment (`pickoffLoss_is_first_moment`); parity forbids a directional lean (`no_directional_lean`); the public book is arb-free (`book_arb_free`); exposure readback (`Exposure`); the vega fork (`common_transport_is_necessary`). |

## The three maps
1. **Shape map** (per LP): perp book → that LP's option curve. `β(k)=β·Δ²`, `h(k)=h·|Δ|`, anchored by parity `C(k)−P(k)=−k`.
2. **Aggregation**: N curves → one book. `L=Σ wᵢPᵢ`, `1/β_agg=Σ1/βᵢ`, `wᵢ` strike-invariant, spread = tightest.
3. **Readback**: option inventory → perp-equivalent. `exposure = NetPerp + Σ Δ(k)·q(k)`. The same Δ transports (1) and reads back (3).

## Build
```
lake exe cache get   # fetch the pinned Mathlib oleans
lake build           # kernel-checks all three
```
Toolchain: `leanprover/lean4:v4.28.0` (see `lean-toolchain`); Mathlib + transitive deps pinned exactly in `lake-manifest.json`. `BASIS_FORMAL` is Aristotle-certified (zero statement changes); all three compile with no `sorry`.

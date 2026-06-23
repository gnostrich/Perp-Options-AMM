# Summary of changes for run 46309fbb-2289-42c6-8347-5a6fa18e554c
Created the self-contained file `RequestProject/TrajectoryDomain.lean` (`import Mathlib`, `noncomputable section`, `open Real`, all proofs inside `namespace TemporalAMM`).

It re-declares the pinned `TemporalAMM` structure exactly (same fields and invariants) and the `trade` operation, then proves all five required statements with the exact signatures and no weakening:

1. `state_on_domain : P.beta ≤ P.y` (from the carried `hy : beta < y`).
2. `trade_state_on_domain` — post-trade state coordinate is on-domain.
3. `iterTrade` — honest iteration of `trade` carrying the genuine per-step validity witness `beta < y + D k`.
4. `trade_seq_on_domain` (headline) — `∀ k, P.beta ≤ (iterTrade P D hvalid k).y`, by induction: base from `hy`, step from β-conservation plus the validity witness.
5. `trade_seq_beta_const` — `∀ k, (iterTrade P D hvalid k).beta = P.beta`.

The validity predicate remains the real trade precondition `beta < y + D k` (not vacuous). The file contains no `sorry`, `admit`, `axiom`, `native_decide`, `sorryAx`, `opaque`, or `unsafe`, and does not touch or import the canonical modules.

Verified with a full `lean_build` (module `RequestProject.TrajectoryDomain` built successfully) and a grep confirming no forbidden tokens. `#print axioms` for both headline theorems reports `[propext, Classical.choice, Quot.sound]`, which is within the allowed set. These outputs are recorded in `ARISTOTLE_SUMMARY.md`.

# Aristotle obligation L1 — TrajectoryDomain

Self-contained file `RequestProject/TrajectoryDomain.lean` re-declares the minimal `TemporalAMM`
single-object slice (exact carried data + invariants) and `trade`, then proves that the reachable
state-coordinate trajectory under valid trades never leaves the resistive-PSD operating domain
`t ≥ β`.

## Results proved (exact signatures)

1. `state_on_domain (P : TemporalAMM) : P.beta ≤ P.y`
2. `trade_state_on_domain (P) (D) (hD) : (P.trade D hD).beta ≤ (P.trade D hD).y`
3. `iterTrade` — iterated valid-trade trajectory (genuine precondition `beta < y + D k`).
4. `trade_seq_on_domain (P) (D) (hvalid) : ∀ k, P.beta ≤ (iterTrade P D hvalid k).y`
5. `trade_seq_beta_const (P) (D) (hvalid) : ∀ k, (iterTrade P D hvalid k).beta = P.beta`

No `sorry`, `admit`, `axiom`, `native_decide`, `opaque`, or `unsafe`. The file is independent of the
canonical modules.

## `#print axioms` output

```
'TemporalAMM.trade_seq_on_domain' depends on axioms: [propext, Classical.choice, Quot.sound]
'TemporalAMM.trade_seq_beta_const' depends on axioms: [propext, Classical.choice, Quot.sound]
```

Both axiom sets are ⊆ {propext, Classical.choice, Quot.sound}.

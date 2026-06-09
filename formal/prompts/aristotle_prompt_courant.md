# TIER-2 #5 — Single Dirac/Courant object (PARTIAL; honest not-achieved on all-four)

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Intent and HONEST scope
We prove the CONSERVATIVE part: the graph of the symplectic form `ω=[[0,1],[−1,0]]` is a MAXIMAL
ISOTROPIC (a linear Dirac structure) for the Courant symmetric pairing `⟨(x,ξ),(y,η)⟩=ξ·y+η·x` on
ℝ²⊕ℝ²*. This is the single TM⊕T*M object for the symplectic/J side. Folding dissipation R and the
port into the SAME bracket is NOT constructed (Dirac = isotropic/conservative; R breaks isotropy) —
that remains SPECULATIVE and is reported as not-achieved, NOT asserted.

## Task
Prove every `sorry` in `RequestProject/Courant.lean`:
- `courantPairing_symm`: the pairing is symmetric (commute the two sums, `add_comm`).
- `graph_isotropic`: `⟨graph v, graph w⟩ = 0`. Crux: `(ωv)·w + (ωw)·v = 0` because ω is skew.
  Expand `mulVec`/`dotProduct` over `Fin 2` (`Fin.sum_univ_two`, `Matrix.mulVec`, `!![..]` simp) and
  `ring`/`linarith`; the two cross terms cancel.
- `omega_skew`: `ωᵀ = -ω` (`Matrix.ext`, `det`/transpose simp).
- `graph_injective`: `(v,ωv)=(w,ωw) ⇒ v=w` (read off the first component, `Prod.ext_iff`).

## HARD CONSTRAINTS
- DO NOT weaken statements; DO NOT add `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`/
  new `axiom`. If `graph_isotropic` needs a sign fix, report and prove the corrected identity.

## Output spec
- Compiles; `#print axioms` each ⊆ {propext, Classical.choice, Quot.sound}.
- `ARISTOTLE_SUMMARY.md`: theorems proved, adjustments, axioms.
- Keep `RequestProject.lean`/`lakefile.toml`/`lean-toolchain` byte-identical.

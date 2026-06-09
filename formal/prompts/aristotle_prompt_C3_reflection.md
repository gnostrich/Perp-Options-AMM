# C3 — Discharge the curve-symmetry → reflection AXIOM

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Intent
C3 ("no-arb is a symmetry phenomenon, not an instrument one") was previously only a CONDITIONAL
SKELETON: the curve-symmetry → reflection arrow was carried as an AXIOM. This obligation tries to
make the reflection arrow a THEOREM by proving the explicit algebraic identity that the put-wing mark
equals the call-wing mark composed with the wing-exchange reflection `R_θ(s) = θ²/s`.

Mark definitions (barrier value fraction, capped at 1 when ITM):
- `markCall θ s = if s < θ then s/θ else 1`
- `markPut  θ s = if θ < s then θ/s else 1`
- `reflect θ s = θ²/s`

The arrow to prove: `markPut θ s = markCall θ (θ²/s)` for `θ, s > 0` (case-split on `θ < s`; both
branches give `θ/s` resp. `1`). And the symmetric corollary.

## Task
Prove every `sorry` in `RequestProject/C3.lean`:
- `reflection_arrow` and `no_arb_is_reflection_symmetry` (the formerly-axiomatic arrow).
- (`reflect_involution`, `reflect_fixes_atm` are already proved — leave them.)

Case-split on the `if` conditions; the inequality `θ²/s < θ ↔ θ < s` (for `s>0`) is the crux —
prove it with `div_lt_iff`/`lt_div_iff` and positivity.

## HARD CONSTRAINTS
- DO NOT weaken the statements, DO NOT add `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/
  `unsafe`/new `axiom`. The whole point is to ELIMINATE the axiom — introducing one fails the task.
- If `reflection_arrow` is actually FALSE under these definitions, DO NOT fabricate a proof: report
  it as a counterexample in `ARISTOTLE_SUMMARY.md` with the witness, and prove the negation instead.

## Output spec
- Compiles server-side; `#print axioms` for each theorem ⊆ {propext, Classical.choice, Quot.sound}.
- `ARISTOTLE_SUMMARY.md`: which theorems proved, any signature adjustment, axioms.
- Keep `RequestProject.lean`/`lakefile.toml`/`lean-toolchain` byte-identical.

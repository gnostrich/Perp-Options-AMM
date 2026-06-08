# Aristotle prompt — GH coercive (bounded reserves ⇒ poolValue BddBelow) (TIER 2)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
GH has **bounded reserves**: `X ∈ (0, Nx)`, `Y ∈ (0, Ny·M)`. The `coercive` gate field of `AMMCurve`
requires that for every external price `p > 0`, the value set `{p·x + y(x) : x ∈ dom}` is `BddBelow`.
On the GH domain `dom ⊆ Ioi 0` with a NONNEGATIVE reserve frontier `y ≥ 0` (the Y-reserve is a
positive quantity), the value `p·x + y(x) ≥ 0` for `p > 0`, `x > 0`, so **0 is a lower bound** — the
set is BddBelow. This is exactly what makes GH `poolValue` well-defined (the `sInf` is of a
bounded-below set), and it is the gate field flagged in CLAUDE.md ("coercive = BddBelow; GH has bounded
reserves") as the one to watch in the GH gate-discharge.

We prove the general reusable lemma (it discharges the GH `coercive` field once `y ≥ 0` on the
GH domain is supplied). The verified `RequestProject.AMMCurve` module is imported so the result is
stated in the project's own `BddBelow` form and is directly pluggable.

## Lean (project `RequestProject`, file `RequestProject/GHCoercive.lean`)
Imports `RequestProject.AMMCurve`. Ships statements + `sorry`. Replace each `sorry`; do not alter
statements. (`RequestProject/AMMCurve.lean` is the verified module — DO NOT edit it.)

## Proof targets
- `coercive_of_nonneg` : for `dom ⊆ Set.Ioi 0` and `y : ℝ → ℝ` with `∀ x ∈ dom, 0 ≤ y x`, then
  `∀ ⦃p⦄, 0 < p → BddBelow ((fun x => p * x + y x) '' dom)` (lower bound 0). This is the curve-agnostic
  bounded-reserves coercivity, in the exact shape of the `AMMCurve.coercive` field.
- `gh_value_nonneg` : the sanity corollary — for `p>0`, `x∈Ioi 0`, `0 ≤ y x`, we have
  `0 ≤ p * x + y x`.

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/GHCoercive.lean` changes; `AMMCurve.lean` byte-identical.

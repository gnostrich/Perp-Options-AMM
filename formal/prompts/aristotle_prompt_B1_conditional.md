# Aristotle prompt — B1 conditional structure (κ-extrinsic limit as a theorem) (extra)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
B1 (real solvency floor) is the undischarged economic prize: whether the funding port covers the convex
deficit down to a real floor. The coverage constant κ is **extrinsic** — geometry CANNOT close it. We
do NOT fabricate a floor. We prove only the **conditional structure**: IF the port covers the deficit
(a carried HYPOTHESIS), THEN equity meets the floor. This makes the κ-extrinsic limit a theorem: the
loop closes mechanically UP TO the carried hypothesis; the hypothesis itself is never discharged from
geometry.

`equity s = V s + support s` (`V` = reserve part, `support` = funding port). The B1 coverage hypothesis
is `∀ s, floor − V s ≤ support s` (the port covers the gap from the reserve value down to the floor).
Then `floor ≤ equity s`. The negation of an intrinsic floor (PH-4b, `reserves_have_no_floor`) shows the
port is NECESSARY (no reserve floor); this conditional shows the port is SUFFICIENT only UNDER the
coverage hypothesis — together: "necessary, not sufficient; sufficiency = the extrinsic B1."

**Scope honesty (carry to report):** this proves NOTHING about whether GH funding actually covers the
deficit — that is the extrinsic κ ship-gate, the operator's call. The hypothesis is carried, not closed.

## Lean (project `RequestProject`, file `RequestProject/B1.lean`)
Ships statements + `sorry`. Replace each `sorry`; do not alter statements. The coverage hypothesis MUST
remain a hypothesis (a `→` premise), NOT be proved.

## Proof targets
- `solvent_of_port_covers` : for `V support : S → ℝ`, `floor : ℝ`, given
  `hcov : ∀ s, floor - V s ≤ support s`, then `∀ s, floor ≤ V s + support s`.
  [solvency is CONDITIONAL on the port covering the deficit — the carried-hypothesis structure.]
- `port_necessity_note` (a sanity tautology making the necessity explicit): the coverage hypothesis is
  EQUIVALENT to solvency — `(∀ s, floor - V s ≤ support s) ↔ (∀ s, floor ≤ V s + support s)`.
  (Shows the port-coverage condition is exactly the solvency condition — neither stronger nor weaker —
  so geometry alone, which gives no reserve floor, cannot supply it.)

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/B1.lean` changes. The coverage premise stays a hypothesis.

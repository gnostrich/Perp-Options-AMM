# Summary of changes for run 0713bd79-b440-45c2-99cd-f87c0e3a02a2
Both theorems in `RequestProject/PH4b.lean` are now fully proved:

1. **`no_floor_of_boundedAbove_value_unbounded_obl`** — Given `V` bounded above and `O` unbounded above on `Ioi 0`, the image of `V - O` has no lower bound. The proof assumes a lower bound `B`, extracts the upper bound on `V`, then uses unboundedness of `O` at a carefully chosen threshold to derive a contradiction via `linarith`.

2. **`gh_instance`** — Sanity check instantiating the above with `V ≡ 1` and `O = id`. Shows the hypotheses are satisfiable and the conclusion fires.

Verification:
- `lean_build` succeeds with no errors.
- No `sorry`, `admit`, `native_decide`, `opaque`, `unsafe`, or `axiom` in the file.
- `#print axioms` for both targets yields exactly `{propext, Classical.choice, Quot.sound}`.
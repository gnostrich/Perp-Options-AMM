# Aristotle prompt — C2 / no costless-collar arb at w=½ (I7) (TIER 4)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
Engine invariant I7: **`collarSurplus(θ, w) = 0  ∀θ  ⇔  w = ½`** — there is no costless-collar surplus
exactly at the symmetric weight. The anchor coordinate is `getSNorm_anchor = (1−w)/w` (documented:
`getSNorm = (1−w)/w = (x−α)/α`); the symmetric / zero-surplus condition is `sNorm_anchor = 1`, i.e.
`(1−w)/w = 1`, i.e. `w = ½`. The collar surplus measures wing asymmetry and is structurally
proportional to the anchor deviation `((1−w)/w − 1)`, so it vanishes for ALL θ iff the anchor is
symmetric. Re-derived: `(1−w)/w = 1 ⇔ w = ½`, and `θ·((1−w)/w − 1) = 0 ∀θ>0 ⇔ w = ½`.

**HONESTY / SCOPE NOTE (carry to the audit + the report):** the engine's exact closed form of
`collarSurplus` was NOT in my accessible specs — only the I7 statement and the documented anchor
coordinate `(1−w)/w`. I therefore model `collarSurplus θ w := θ * ((1−w)/w − 1)` as the documented
*structural* form (surplus ∝ anchor asymmetry). The PROVEN content is the symmetry-iff at the anchor
coordinate; do not over-promote it as the engine's exact surplus formula until the manager confirms the
closed form. This is flagged as a scope caveat, not a fabricated rule.

## Lean (project `RequestProject`, file `RequestProject/C2.lean`)
Ships statements + `sorry`. Replace each `sorry`; do not alter statements.

## Proof targets (`w ∈ (0,1)` i.e. `0 < w`, `w < 1`)
- `anchor_symmetric_iff_half` : `(1 - w)/w = 1 ↔ w = 1/2` (for `0 < w`).
- `collarSurplus_zero_iff_half` : with `collarSurplus θ w := θ * ((1-w)/w - 1)`,
  `(∀ θ : ℝ, 0 < θ → collarSurplus θ w = 0) ↔ w = 1/2` (for `0 < w`). [I7, the costless-collar invariant]

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/C2.lean` changes.

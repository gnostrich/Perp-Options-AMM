# Aristotle prompt — R5 / %-slippage basis-independence (TIER 4, R3 corollary)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
The `%`-basis slippage is INDEPENDENT of the e^μ price-coordinate-vs-slope basis: since
`mpGeom = getMP_raw · e^(−μ)`, the `e^(−μ)` factor cancels in the post/pre RATIO, so the fractional
(percent) slippage is the same whether measured in the raw price coordinate or in the geometric slope.
The `$`-basis (Layer-1 reserve-USD) does carry the factor and is NOT invariant. This is the
dimensionless gauge-invariance of the fractional port quantities — a corollary of R3.

`R_pre, R_post > 0` (raw price coordinates pre/post trade), `μ : ℝ`. Slopes
`mpGeom R μ := R · e^(−μ)`. The percent-slippage ratio is `R_post / R_pre`. Re-derived:
`(R_post·e^(−μ))/(R_pre·e^(−μ)) = R_post/R_pre`.

## Lean (project `RequestProject`, file `RequestProject/R5.lean`)
Ships statements + `sorry`. Replace each `sorry`; do not alter statements.

## Proof targets
- `mpGeom_def` : `mpGeom R μ = R * Real.exp (-μ)` (the basis map; same def as R3).
- `pct_slippage_basis_independent` : for `R_pre > 0`, `μ : ℝ`,
  `(mpGeom R_post μ) / (mpGeom R_pre μ) = R_post / R_pre`
  (the e^(−μ) cancels — % slippage is basis-independent). [the gauge-invariance of the fractional port]
- `dollar_basis_carries_factor` (the contrast): for `R > 0`, the `$`-quantity `mpGeom R μ` differs from
  the raw price coordinate `R` by exactly `e^(−μ)`: `mpGeom R μ = R * Real.exp (-μ)` and this equals `R`
  iff `μ = 0` — state as `mpGeom R μ = R ↔ μ = 0` (for `R > 0`). (Shows the $-basis is NOT invariant.)

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/R5.lean` changes.

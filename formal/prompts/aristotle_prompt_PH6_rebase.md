# Aristotle prompt — PH-6 / rebase preserves J and R (symplectomorphism) (TIER 4)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
Rebase `θ → θ/r` (engine: `x→r·x, α→r·α, Nx→r·Nx, P→P/r`, Y-side & μ fixed) is a STRUCTURE-PRESERVING
gauge change — not just `sNorm`-invariant (already proved as `Barrier.sNorm_rebase_invariant`), but it
preserves the J-structure (the boost group) and the R-structure (the dissipation quadratic form). It is
a symplectomorphism of the PH structure.

- **J preserved:** rebase COMMUTES with the trade boost on the price coordinate `mp = P·e^u`. Rebase
  sends `P ↦ P/r` so `mp ↦ mp/r`; the boost sends `mp ↦ e^δ·mp`. Then
  `rebase∘boost (mp) = e^δ·mp/r = boost∘rebase (mp)` — the boost group commutes with the rebase scaling
  (re-derived, exact). So the lossless interconnection J is unchanged by the gauge change.
- **R preserved:** the slope-deviation variable is `v = log(sNorm)`. Since `sNorm` is rebase-invariant
  (degree-0), `v` is invariant, so the dissipation quadratic form `R·v²` is invariant — R is preserved.
- **sNorm gauge:** restate the degree-0 invariance as the seed (`sNorm(r·X, r·α) = sNorm(X,α)`).

## Lean (project `RequestProject`, file `RequestProject/PH6.lean`)
Imports `RequestProject.Temporal` (uses `Barrier.sNorm`). Model `mp r P u := (P/r) * Real.exp u` for the
rebased price coordinate and the boost as multiplication by `e^δ`. Ships statements + `sorry`. Replace
each `sorry`; do not alter statements. DO NOT edit `Temporal.lean`.

## Proof targets (`r ≠ 0`, `r > 0` where needed)
- `sNorm_rebase` : `Temporal.Barrier.sNorm (r * X) (r * α) = Temporal.Barrier.sNorm X α` for `r ≠ 0`
  (the degree-0 seed; you may reuse `Barrier.sNorm_rebase_invariant`).
- `rebase_boost_commute` : for the price coordinate `mp_r P u := (P / r) * Real.exp u` and boost
  `b δ z := Real.exp δ * z`, rebase commutes with boost:
  `b δ (mp_r r P u) = mp_r r P (u + δ)` for `r ≠ 0`  (= `e^δ·(P/r)·e^u = (P/r)·e^(u+δ)`).
  [J preserved under the gauge change.]
- `R_form_rebase_invariant` : the dissipation quadratic form in the slope-deviation `v = Real.log (sNorm)`
  is rebase-invariant: for `R : ℝ`, `r ≠ 0`,
  `R * (Real.log (Temporal.Barrier.sNorm (r*X) (r*α)))^2 = R * (Real.log (Temporal.Barrier.sNorm X α))^2`.
  [R preserved — slope-deviation is gauge-invariant.]

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/PH6.lean` changes; `Temporal.lean` byte-identical.

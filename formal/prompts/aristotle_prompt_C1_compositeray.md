# Aristotle prompt — C1 / composite-ray shortcut extends to ITM (TIER 4)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
The composite-ray identity (engine I5 / `vsValue`): a strike spread `[lo, hi]` collapses to a single
composite-ray transaction with `θ* = √(lo·hi)`, `δ = ½·log(hi/lo)`, and the spread value satisfies
```
m(θ*) · 2·sinh(δ) = m(lo) − m(hi)
```
for the `1/θ` mark `m(θ) = C/θ` (C a fixed positive constant for the fixed sNorm). I re-derived this
exactly: `(C/√(lo·hi))·(√(hi/lo) − √(lo/hi)) = C/lo − C/hi`.

**ITM extension via effective-strike substitution (C1):** the identity is FORM-INVARIANT under
substituting an effective strike `θ ↦ θ_eff` — the ITM continuation reuses the same `C/θ` mark with an
effective strike, so the composite-ray identity holds verbatim across the OTM→ITM boundary (just
substitute `θ_eff` for `θ`). The shortcut therefore extends to ITM.

## Lean (project `RequestProject`, file `RequestProject/C1.lean`)
Powers/`sinh` via Mathlib `Real`. Ships statements + `sorry`. Replace each `sorry`; do not alter
statements.

## Proof targets (`C > 0`, `lo > 0`, `hi > 0`, `lo < hi`)
- `compositeRay_identity` : with `θ* = Real.sqrt (lo*hi)`, `δ = (1/2)*Real.log (hi/lo)`, and mark
  `m θ := C/θ`, prove `m θ* * (2 * Real.sinh δ) = m lo - m hi`.
- `compositeRay_ITM_substitution` : the identity is invariant under an effective-strike substitution —
  state as: for ANY effective strikes `loEff hiEff > 0` with `loEff < hiEff`, the same identity holds
  with `(lo,hi)` replaced by `(loEff,hiEff)`. (i.e. `compositeRay_identity` is universally quantified
  over the effective strikes, so the ITM case is the substitution `lo↦loEff, hi↦hiEff`.) Prove it as a
  corollary / the same lemma applied to the effective strikes.

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/C1.lean` changes.

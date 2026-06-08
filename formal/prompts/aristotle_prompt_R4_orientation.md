# Aristotle prompt — R4 / directional-orientation lemma (TIER 3)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
Per wing the three direction signs agree: `sign(K − oracle) == sign(funding wing-stamp ±2) ==
sign(d mark / d sNorm)`. CALL is all `+`, PUT is all `−`. This is the economic-direction invariant
(prior gates tested only self-consistency, never direction — which is how the registration bug
survived).

The marks (position value fraction in the OTM region, in the curve's own sNorm coordinate):
- **CALL** OTM mark `m_call(sNorm) = sNorm / θ` (θ>0). It is strictly INCREASING in sNorm:
  `d m_call/d sNorm = 1/θ > 0`. Sign `+1`. Wing stamp `+2`.
- **PUT** OTM mark `m_put(sNorm) = θ / sNorm` (sNorm>0). It is strictly DECREASING in sNorm:
  `d m_put/d sNorm = −θ/sNorm² < 0`. Sign `−1`. Wing stamp `−2`.

The wing stamp `±2` and the mark-monotonicity sign agree per wing (CALL +/+; PUT −/−). The
`K − oracle` membership stays on the **price-measure basis** (a θ-swap into funding FLIPS its sign, so
funding must NOT be re-expressed in sNorm — sign-sensitive caveat). We therefore prove the
mark-monotonicity sign and its agreement with the wing stamp; we do NOT re-express funding in sNorm.

## Lean (project `RequestProject`, file `RequestProject/R4.lean`)
Slopes via `HasDerivAt`. Ships statements + `sorry`. Replace each `sorry`; do not alter statements.

## Proof targets (`θ > 0`)
- `call_mark_mono` : `StrictMonoOn (fun sNorm => sNorm/θ) (Set.Ioi 0)` (CALL mark increasing).
- `call_mark_slope` : `HasDerivAt (fun sNorm => sNorm/θ) (1/θ) sNorm` with `1/θ > 0`
  (call slope positive ⇒ sign +1 = wing stamp +2 sign).
- `put_mark_anti` : `StrictAntiOn (fun sNorm => θ/sNorm) (Set.Ioi 0)` (PUT mark decreasing).
- `put_mark_slope` : for `sNorm > 0`, `HasDerivAt (fun s => θ/s) (-θ/sNorm^2) sNorm` with
  `-θ/sNorm^2 < 0` (put slope negative ⇒ sign −1 = wing stamp −2 sign).
- `wing_signs_oppose` : the call sign `(1:ℝ)` and put sign `(-1:ℝ)` are opposite, and each equals
  `(its wing stamp ±2) / 2` — state as `(1:ℝ) = (2:ℝ)/2 ∧ (-1:ℝ) = (-2:ℝ)/2 ∧ (1:ℝ) = -(-1:ℝ)`.

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/R4.lean` changes.

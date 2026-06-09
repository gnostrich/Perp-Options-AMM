# GH MAPS — discharge the carried StrictAnti X / StrictMono Y from density-positivity (Bessel-K-FREE)

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math

The GH reserve-coordinate maps are `X(u) = Nx·T(u)` (T = upper-tail of the GH density f_β) and
`Y(u) = Ny·M·C(u)` (C = lower-CDF of the tilted density f_{β+1}). The CLOSEOUT run proved the frontier
is antitone/convex but CARRIED `StrictAnti X` and `StrictMono Y` as bare hypotheses, calling them
"Bessel-K-adjacent." THEY ARE NOT. The monotonicity of a CDF and the anti-monotonicity of a tail
follow ONLY from the density being strictly POSITIVE and integrable — which is already proved
(`ghKernel_pos`, `Integrable ghKernel` in CLOSEOUT_GHmeasure). NO Bessel-K, NO normalizer value is
needed. This run DISCHARGES those two carried hypotheses.

Math (purely measure-theoretic):
- `C(u) := ∫_{a}^{u} f`, with `f > 0` continuous. Then for `u₁ < u₂`,
  `C(u₂) − C(u₁) = ∫_{u₁}^{u₂} f > 0` ⇒ **C is StrictMono**. Also `HasDerivAt C (f u) u` (FTC-2,
  `f` continuous) ⇒ `deriv C = f > 0`.
- `T(u) := ∫_{u}^{b} f` (or `total − C(u)`). Then `T(u₂) − T(u₁) = −∫_{u₁}^{u₂} f < 0` ⇒
  **T is StrictAnti**; `deriv T = −f < 0`.
- The GH-specific input is ONLY `f = ghKernel αh βh δ > 0` (proved) and continuity (clear). The
  normalizer / scale M is irrelevant to monotonicity.

## Lean (project `RequestProject`, file `RequestProject/GHMaps.lean`, standalone `import Mathlib`)

Reuse the `ghKernel` definition VERBATIM (copy it in):
```
def ghKernel (αh βh δ v : ℝ) : ℝ := Real.exp (-(αh) * Real.sqrt (δ ^ 2 + v ^ 2) + βh * v)
theorem ghKernel_pos (αh βh δ v : ℝ) : 0 < ghKernel αh βh δ v := by positivity
```
`ghKernel` is continuous (composition of `Real.exp`, `Real.sqrt`, polynomials). State a
`ghKernel_continuous : Continuous (fun v => ghKernel αh βh δ v)` lemma and prove it
(`Continuous.exp`, `Real.continuous_sqrt`/`(continuous_const.add (continuous_pow 2))`, etc.).

Define the CDF and tail as interval integrals over `ghKernel` with a fixed lower/upper anchor:
```
noncomputable def ghCDF  (αh βh δ a u : ℝ) : ℝ := ∫ t in a..u, ghKernel αh βh δ t
noncomputable def ghTail (αh βh δ u b : ℝ) : ℝ := ∫ t in u..b, ghKernel αh βh δ t
```
(`a` is a fixed reference lower bound, `b` a fixed upper bound; the strict monotonicity statements
below are about the dependence on `u`.)

### Proof targets (prove all — these DISCHARGE the CLOSEOUT-carried hypotheses; do NOT weaken)

- **`ghKernel_continuous`** : `Continuous (fun v => ghKernel αh βh δ v)`.
- **`ghCDF_hasDerivAt`** : `HasDerivAt (fun u => ghCDF αh βh δ a u) (ghKernel αh βh δ u) u`.
  (FTC-2 with continuous integrand: `intervalIntegral.integral_hasStrictDerivAt_right` /
  `integral_hasDerivAt_right`, needs `IntervalIntegrable`/continuity + `ContinuousAt`.)
- **`ghCDF_strictMono`** : `StrictMono (fun u => ghCDF αh βh δ a u)`.
  Prove from `deriv > 0` (`StrictMono.of_deriv_pos` / `strictMono_of_hasDerivAt_pos`-style) using
  `ghCDF_hasDerivAt` + `ghKernel_pos`; OR directly: for `u₁<u₂`,
  `ghCDF u₂ − ghCDF u₁ = ∫_{u₁}^{u₂} ghKernel > 0` via `intervalIntegral.integral_pos` (needs
  `u₁<u₂`, continuity, positivity) plus `intervalIntegral.integral_add_adjacent_intervals`.
- **`ghTail_hasDerivAt`** : `HasDerivAt (fun u => ghTail αh βh δ u b) (-(ghKernel αh βh δ u)) u`.
  (Lower limit varying ⇒ derivative is `−f`: `integral_hasDerivAt_left` or rewrite
  `ghTail u b = ghCDF u b - ... ` ; either route, derive `deriv = −ghKernel`.)
- **`ghTail_strictAnti`** : `StrictAnti (fun u => ghTail αh βh δ u b)`.
  From `deriv < 0` (`= −ghKernel < 0`) or directly `ghTail u₂ − ghTail u₁ = −∫_{u₁}^{u₂} ghKernel < 0`.
- **`X_strictAnti`** : with `X u := Nx * ghTail αh βh δ u b` and `0 < Nx`,
  `StrictAnti (fun u => Nx * ghTail αh βh δ u b)`. (Positive scalar preserves StrictAnti.)
- **`Y_strictMono`** : with `Y u := NyM * ghCDF αh βh δ a u` and `0 < NyM`,
  `StrictMono (fun u => NyM * ghCDF αh βh δ a u)`. (Positive scalar preserves StrictMono.)
- **`frontier_antitone_discharged`** : the CLOSEOUT `frontier_antitone` conclusion but with X, Y the
  CONCRETE maps above (no carried `hX hY` hypotheses — they are now PROVED). Restate
  `frontier_antitone (X := fun u => Nx*ghTail..) (Y := fun u => NyM*ghCDF..)` and supply
  `X_strictAnti`, `Y_strictMono` as the (now-derived) witnesses. If you prefer, prove directly that
  the frontier reparametrization `Y ∘ X.symm`-style relation is antitone using the two monotonicities.

## What stays CARRIED after this run (state honestly in ARISTOTLE_SUMMARY.md)
- ONLY the closed-form **scale value M = K_ν ratio** (the Bessel-K normalizer NUMBER) remains
  unformalized — and it is NOT needed for any monotonicity/structural claim. The `0<Nx`, `0<NyM`
  positivity is all that is used. So after this run, `StrictAnti X` / `StrictMono Y` are no longer
  carried hypotheses; they are theorems.

## HARD CONSTRAINTS (violation = reject)
- The two monotonicities must be DERIVED from `ghKernel_pos` + continuity, NOT taken as hypotheses.
- Keep `ghKernel` and `ghKernel_pos` EXACTLY as given.
- No `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`, no new `axiom`.
- Prefer concrete lemmas (`intervalIntegral.integral_pos`, `integral_add_adjacent_intervals`,
  FTC `integral_hasDerivAt_right/left`, `StrictMono`/`StrictAnti` mul-by-pos). AVOID `grind`/`exact?`/
  `simp?`/`apply?` in FINAL bodies; if unavoidable, FLAG under "FRAGILE TACTICS" with line + the
  concrete lemma that should replace it.
- If a target genuinely cannot close, leave exactly that ONE `sorry`, report under "COULD NOT CLOSE".

## Output spec
- `RequestProject/GHMaps.lean` compiles server-side.
- `#print axioms` for `ghCDF_strictMono`, `ghTail_strictAnti`, `X_strictAnti`, `Y_strictMono`,
  `frontier_antitone_discharged` ⊆ {propext, Classical.choice, Quot.sound}.
- ARISTOTLE_SUMMARY.md: proved list, SIGNATURE ADJUSTMENTS, FRAGILE TACTICS, COULD NOT CLOSE, and an
  explicit line confirming the monotonicities are now THEOREMS (carried hyps discharged).
- Only `RequestProject/GHMaps.lean` changes; do NOT touch `lakefile.toml`, `lean-toolchain`, others.

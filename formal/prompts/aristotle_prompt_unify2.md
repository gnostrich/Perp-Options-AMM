# UNIFY2 — De-trivialize the metriplectic unification with REAL theorems over the GH cumulant function

Toolchain: Lean 4.28.0 + Mathlib v4.28.0 (matches `lean-toolchain` / lakefile `rev = v4.28.0`).

## Context and intent
The prior UNIFY file proved a STRUCTURALLY-CORRECT but largely TAUTOLOGICAL scaffold: A1 was
`deriv(deriv Ψ) = deriv(deriv Ψ)`, A2 was `f⁻¹·f = 1`, A3 was `k·e^x = k·e^x`, B2 was `R·0 = 0`,
C1 was `g·w = g·w`. This file REPLACES those with genuine theorems over the ACTUAL
exponential-family cumulant generating function (Mathlib's `ProbabilityTheory.cgf`/`mgf`) and the
ACTUAL generalized-hyperbolic (GH) kernel `exp(−αh·√(δ²+v²) + βh·v)`.

The mathematics (all STANDARD exp-family / Bregman / convex-analysis facts, here over the real
integral-defined objects):
- `mgf X μ t = ∫ exp(t·X) ∂μ > 0` for a probability measure when the integrand is integrable.
- The cumulant generating function `cgf X μ` is CONVEX on the interior of `integrableExpSet X μ`,
  and its first derivative is the tilted mean `(∫ X·exp(t·X))/mgf`, second derivative the tilted
  variance (`Λ' = mean`, `Λ'' = Var = Fisher`).
- Bregman gradient `d/ds D_Λ(s₀‖s) = (s−s₀)·Λ''(s)` vanishes at `s = s₀` (GENERIC deg1).
- The GH kernel is positive, measurable, with log-exponent derivative `βh − αh·v/√(δ²+v²)`, and
  exponent bound `−αh√(δ²+v²)+βh·v ≤ −(αh−|βh|)·|v|` when `|βh| ≤ αh` (the integrability core).
- The quadratic energy's derivative `d/ds(½ g s²) = g·s` (boost = Hamiltonian flow of the metric).

## Your task
Prove EVERY `sorry` in the provided `RequestProject/Unify2.lean`, using the REAL Mathlib v4.28.0 API
for `mgf`, `cgf`, `integrableExpSet`, `ConvexOn`, `HasDerivAt`, measurability, and `Real.sqrt`.

### Allowed signature adjustments (REPORT each one explicitly)
Mathlib API names may have drifted. You MAY perform PURELY MECHANICAL renames to bind the intended
declaration: e.g. `cgf`/`mgf`/`integrableExpSet`/`convexOn_cgf`/`hasDerivAt_cgf` exact names,
namespace/`open` fixes, argument-order of a moment lemma, or the exact spelling of the
"derivative of cgf = mean" lemma. If a statement needs its TYPE adjusted ONLY to match the real
Mathlib signature of the SAME mathematical fact (e.g. `interior (integrableExpSet X μ)` membership
phrasing, or `μ[f]` vs `∫ x, f x ∂μ`), do so AND list every such change in `ARISTOTLE_SUMMARY.md`
under a heading "SIGNATURE ADJUSTMENTS (mechanical / API-drift)".

### HARD CONSTRAINTS (a violation = reject)
- DO NOT weaken any statement: do not add a false/convenient hypothesis, do not strengthen a
  conclusion into a weaker one, do not replace an integral-defined `cgf`/`mgf`/`variance` claim with
  a reflexivity. The whole POINT is that A1/A4/B2 are NO LONGER `x = x`.
- DO NOT introduce `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe` or any new `axiom`
  declaration. Kernel `decide` is fine.
- If a particular theorem genuinely CANNOT be proved in Mathlib v4.28.0 (e.g. a missing
  derivative-of-cgf lemma), DO NOT fake it. Instead: leave that ONE theorem with its `sorry`, and in
  `ARISTOTLE_SUMMARY.md` under "COULD NOT CLOSE" state precisely which Mathlib lemma is missing and
  what the minimal CARRIED hypothesis would be. A partial result with an honest report is the
  correct outcome — better than a fabricated proof.

## Output spec
- Returned project compiles server-side (Lean 4.28.0 / Mathlib v4.28.0).
- `#print axioms` for EACH proved theorem — must be ⊆ {propext, Classical.choice, Quot.sound}.
- `ARISTOTLE_SUMMARY.md` lists: (1) which theorems are fully proved, (2) SIGNATURE ADJUSTMENTS
  (mechanical/API-drift) with before/after, (3) any COULD NOT CLOSE with the missing-lemma reason.
- Do NOT touch `RequestProject.lean`, `lakefile.toml`, `lean-toolchain` (keep byte-identical).

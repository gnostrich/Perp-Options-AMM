# MERTON TIE — μ = GH Laplace exponent, γ = characteristic root ψ(−γ)=r, S* = Merton smooth-pasting

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math (what we are pinning, and to what depth)

We connect three named objects that the engine and the prior AIRTIGHT run already use, and prove they
are the SAME structure under one classical pricing theorem:

1. **μ = the GH Laplace exponent (cumulant generating function) of the log-price process.** For the
   engine's NIG/GH family the Lévy/Laplace exponent is
   `ψ(θ) = m·θ + δ·( sqrt(α² − β²) − sqrt(α² − (β+θ)²) )`,
   with the engine pins **α = γ+1, β = 1, δ = 0.08** (`engine/knowledge/GH_MATH.md`: `αh=γ+1, βh=1`).

2. **γ = the characteristic root.** The eigenfunction `S^θ` of the pricing operator is space-harmonic
   (a perpetual claim value) exactly when `ψ(θ) = r`. The PUT eigenfunction is `S^(−γ)` (our value law
   `value ∝ S^(−γ)`), i.e. **θ = −γ is the root: ψ(−γ) = r.**

3. **S* = Kγ/(γ+1) = the Merton perpetual-option smooth-pasting boundary** — already AIRTIGHT-GENERATED
   as the unique C¹-pasting boundary (`Sstar_A_forced`). We re-expose it here as the Merton boundary so
   the chain "Laplace symbol → characteristic root → Merton smooth-pasting" is one object in Lean.

### What is GROUNDED vs CARRIED (be honest; do NOT over-close)

- **GROUNDED (prove these in Lean over real `Real.sqrt`/`Real.rpow`):**
  - **(G1) In-strip / asymmetry fact.** With α=γ+1, β=1, the put root θ=−γ keeps the radicand
    `α² − (β+θ)² = (γ+1)² − (1−γ)² = 4γ ≥ 0` (in the analyticity strip for γ≥0); whereas the
    symmetric call root θ=γ+1 gives `α² − (β+θ)² = (γ+1)² − (γ+2)² = −(2γ+3) < 0` (OUTSIDE the strip).
    ⇒ **the GH engine natively carries the put eigenfunction `S^(−γ)`; the clean two-root sum=1 is a
    Gaussian-limit artifact, NOT a GH identity.** This is the load-bearing honest finding.
  - **(G2) Gaussian-slice fundamental quadratic.** For the Gaussian/Cauchy–Euler perpetual option
    `½σ²λ(λ−1)+(r−q)λ−r=0`, the put root λ=−γ and call root λ=γ+1 give **sum of roots = 1 ⇒ r = q
    (zero net carry)** and **product of roots ⇒ γ(γ+1) = 2r/σ²**. Prove these as exact algebraic
    identities (Vieta on the quadratic). This is the σ-knob relation — the Gaussian SLICE.
  - **(G3) Gaussian limit of the GH exponent.** The quadratic part of `ψ` is the local curvature:
    define `sigmaEff² γ := psi''(0)` for the engine-pinned GH and show it equals
    `δ·α²/(α²−β²)^(3/2)` (a clean closed form, all positive); and that in the scaling limit
    α→∞, δ→∞ with `δ/α` fixed, the jump part `δ(√(α²−β²) − √(α²−(β+θ)²))` → `(σ²/2)((β+θ)²−β²)`
    with `σ² = δ/α`, i.e. the quadratic Gaussian CGF. (If the full limit is heavy in Lean, prove the
    pointwise 2nd-order Taylor coefficient identity `psi''(0) = δα²/(α²−β²)^{3/2}` and STATE the limit
    as the carried reduction — see CARRIED below.)
  - **(G4) Boundary tie.** Re-expose `Sstar γ K = K*γ/(γ+1)` and prove the Merton smooth-pasting
    identities already in AIRTIGHT (value `1/(γ+1)`, the forced boundary) so this file witnesses that
    `S*` IS the Merton boundary attached to the put root −γ. Reuse the AIRTIGHT `Sstar_A_forced`
    derivation style (value-match + slope-match ⇒ S=Kγ/(γ+1)); you may copy those defs/proofs in.

- **CARRIED (named `structure : Prop` hypotheses, NOT axioms, clearly flagged — the GH-specific
  measure/limit content Mathlib v4.28.0 lacks):**
  - **(C1) `GHIsLaplaceExponent`**: that `ψ` above is the genuine cumulant generating function of the
    engine's GH/NIG log-price increment (requires the GH probability measure / Bessel-K normalizer,
    which Mathlib lacks — prior runs DISCHARGED prob-measure + finite-MGF from the decay bound, but
    the *identification of ψ as THE cgf of THE GH law with the Bessel-K normalizer* stays the carried
    GH-specific fact). Mark as a field.
  - **(C2) `GaussianLimitOfGH`**: the full distributional Gaussian limit (GH → Normal as α,δ→∞,
    δ/α fixed). Carry the distributional statement; the *exponent's* quadratic-coefficient identity
    (G3) is grounded.
  Do NOT bury G1–G4 inside these carried fields — G1–G4 must be standalone proved theorems.

## Lean (project `RequestProject`, file `RequestProject/MertonTie.lean`, standalone `import Mathlib`)

Definitions to introduce (concrete, over `Real`):
```
def psiJump (α β δ θ : ℝ) : ℝ := δ * (Real.sqrt (α^2 - β^2) - Real.sqrt (α^2 - (β+θ)^2))
def psiGH   (m α β δ θ : ℝ) : ℝ := m*θ + psiJump α β δ θ
def Sstar   (K γ : ℝ) : ℝ := K*γ/(γ+1)
def sigmaEff2 (α β δ : ℝ) : ℝ := δ * α^2 / (α^2 - β^2)^( (3:ℝ)/2 )   -- = psi''(0)
```
Engine pins enter as `α = γ+1, β = 1, δ = 0.08` at the use sites (keep the defs general so the
Gaussian-limit lemmas are reusable).

### Proof targets (prove all; these are the intended statements — do NOT weaken)

- **`gh_put_root_in_strip`**: `0 ≤ γ → ((γ+1)^2 - (1 + (-γ))^2) = 4*γ` and `0 ≤ 4*γ`.
  (The put root −γ keeps the radicand `α²−(β+θ)² = 4γ ≥ 0`.)
- **`gh_call_root_out_of_strip`**: `0 < γ → ((γ+1)^2 - (1 + (γ+1))^2) = -(2*γ+3)` and
  `-(2*γ+3) < 0`. (The symmetric call root +(γ+1) leaves the GH strip — the asymmetry.)
- **`merton_vieta_sum`**: for the quadratic `(σ²/2)λ² + ((r−q) − σ²/2)λ − r` (σ>0), the roots `−γ`
  and `γ+1` satisfy `(−γ) + (γ+1) = 1`, and the coefficient condition `sum = -b/a = 1` forces
  `r = q`. State as: `σ>0 → ( ((r-q) - σ^2/2) = -(σ^2/2)*1 ↔ r = q )` (sum-of-roots = -b/a = 1).
- **`merton_vieta_prod`**: under the same quadratic, product of roots `(−γ)(γ+1) = c/a = −r/(σ²/2)`
  gives **`γ*(γ+1) = 2*r/σ^2`**. State as: `σ>0 → ( (-γ)*(γ+1) = (-r)/(σ^2/2) ↔ γ*(γ+1) = 2*r/σ^2 )`.
- **`sigmaEff2_closed_form`**: for `α>β`, `β≥0`, the second derivative of `psiJump α β δ ·` at θ=0
  equals `sigmaEff2 α β δ`. Phrase via `HasDerivAt`/`deriv` (twice) or via the explicit Taylor
  coefficient; if you give the explicit-equation form, ALSO supply the `HasDerivAt` bridge so the
  derivative content is not dropped. (`psi''(0) = δ α² (α²−β²)^{-3/2}`.)
- **`gaussian_limit_quadratic`** (the reduction, GROUNDED form): show
  `psiJump α β δ θ = (σ^2/2)*((β+θ)^2 - β^2)` HOLDS exactly in the degenerate/limit surrogate where
  you set the curvature, OR — if the genuine limit needs the carried `GaussianLimitOfGH` — state the
  pointwise identity `Filter.Tendsto (fun k => psiJump k β (σ^2*k) θ) Filter.atTop (𝓝 ((σ^2/2)*((β+θ)^2-β^2)))`
  for fixed β,σ,θ and PROVE it (this is the honest grounded limit: α=k, δ=σ²k, k→∞). Prefer this
  Tendsto form — it is provable with `Real.sqrt` asymptotics and is the real content.
- **`Sstar_is_merton_boundary`**: reusing the AIRTIGHT call-wing derivation, from
  `hv : a * S ^ (-γ) = 1 - S/K` and the slope-match `HasDerivAt (fun S => a*S^(-γ)) (-1/K) S` with
  `0<S, 0<K, 1<γ`, conclude `S = Sstar K γ` (= `K*γ/(γ+1)`). (Copy `Sstar_A_forced` style.)

### Carried structures (fields, NOT axioms)
```
structure GHIsLaplaceExponent (m α β δ : ℝ) : Prop where
  is_cgf : True   -- ψ above is the cgf of the GH/NIG log-price law (Bessel-K normalizer; Mathlib gap)
structure GaussianLimitOfGH : Prop where
  gh_to_normal : True   -- full distributional GH → Normal limit (carried)
```
Use these ONLY to carry C1/C2; every G-target above must be a real proved theorem not gated on them.

## HARD CONSTRAINTS (violation = reject)
- G1–G4 must be GENUINE proved theorems over `Real.sqrt`/`Real.rpow`/`HasDerivAt`, not `True` fields.
- The carried `GHIsLaplaceExponent`/`GaussianLimitOfGH` are `structure : Prop` with `True` fields —
  NOT `axiom` declarations, NOT `sorry`. Do not introduce any real `axiom`.
- No `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`.
- Prefer concrete `field_simp`/`ring`/`positivity`/`nlinarith`/term-mode. AVOID `grind`/`exact?`/
  `simp?`/`apply?` in FINAL bodies; if one is unavoidable, FLAG it in ARISTOTLE_SUMMARY.md under
  "FRAGILE TACTICS" with line + the concrete lemma that should replace it.
- Do NOT assume the conclusion in a hypothesis (no vacuous `S=Sstar` premise in `Sstar_is_merton_boundary`).
- If a target genuinely cannot close, leave exactly that ONE `sorry` and report it under
  "COULD NOT CLOSE" in ARISTOTLE_SUMMARY.md — do not fabricate. In particular if
  `gaussian_limit_quadratic` (Tendsto) is too heavy, report it COULD NOT CLOSE and KEEP the grounded
  `sigmaEff2_closed_form` (which is the core curvature content).

## Output spec
- `RequestProject/MertonTie.lean` compiles server-side.
- `#print axioms` for `gh_put_root_in_strip`, `gh_call_root_out_of_strip`, `merton_vieta_sum`,
  `merton_vieta_prod`, `sigmaEff2_closed_form`, `Sstar_is_merton_boundary` ⊆
  {propext, Classical.choice, Quot.sound}.
- ARISTOTLE_SUMMARY.md: which targets proved, SIGNATURE ADJUSTMENTS, FRAGILE TACTICS, COULD NOT CLOSE,
  and which carried fields remained.
- Only `RequestProject/MertonTie.lean` changes; do NOT touch `lakefile.toml`, `lean-toolchain`, or any
  other module.

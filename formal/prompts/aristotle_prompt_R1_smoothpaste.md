# Aristotle prompt — R1 / PH-5 C¹ smooth-pasting at BOTH boundaries (TIER 1)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
Temporal's ITM/American smooth-pasting makes the equity/value function **C¹ (value + slope agree)** at
the free boundary on BOTH wings. With the strike registered in the curve's carry coordinate
`θ = sNorm(K)` (the SHIPPED v26c registration), the continuation value is a power law in spot `S` that
meets the intrinsic payoff in both value and first derivative at the free boundary `S*`.

Two wings:
- **Branch A (call):** intrinsic `Vint_A S = 1 − S/K`; continuation `Vcont_A S = a · S^(−γ)` with
  `a = K^γ · (γ/(γ+1))^γ / (γ+1)`; free boundary `S*_A = K·γ/(γ+1)` (below K). At `S*_A`:
  value `1/(γ+1)`, slope `−1/K`.
- **Branch B (put):** intrinsic `Vint_B S = 1 − K/S`; continuation `Vcont_B S = b · S^(γ)` with
  `b = K^(−γ) · (γ/(γ+1))^γ / (γ+1)`; free boundary `S*_B = K·(γ+1)/γ` (above K). At `S*_B`:
  value `1/(γ+1)`, slope `γ²/(K(γ+1)²)`.

`γ > 1`, `K > 0`, `S > 0`. These coefficients are the K-anchored (θ=sNorm(K)) closed form: registering
the strike in the price-ratio coordinate `θ=K/oracle` would put a γ-dependent gauge defect into `a,b`;
here the boundary lands at K-anchored `S*` for all γ. (That coordinate-invariance is R2, separate.)

I have re-derived all four matches (value A, slope A, value B, slope B) symbolically; they hold exactly.

## Lean (project `RequestProject`, file `RequestProject/R1.lean`)
Powers use `Real.rpow` (`x ^ (γ:ℝ)` via `Real.rpow`). Slopes are stated as `HasDerivAt`. The file
ships with statements + `sorry`. Replace each `sorry`; do NOT alter any statement, coefficient, or
boundary value.

## Proof targets (all with `hγ : 1 < γ`, `hK : 0 < K`)
- `valueMatch_A` : `Vcont_A K γ (Sstar_A K γ) = Vint_A K (Sstar_A K γ)`  (both `= 1/(γ+1)`).
- `slopeMatch_A` : `HasDerivAt (Vcont_A K γ) (-1/K) (Sstar_A K γ)` AND
  `HasDerivAt (Vint_A K) (-1/K) (Sstar_A K γ)` (the two continuation/intrinsic derivatives coincide at S*).
- `valueMatch_B` : `Vcont_B K γ (Sstar_B K γ) = Vint_B K (Sstar_B K γ)`.
- `slopeMatch_B` : `HasDerivAt (Vcont_B K γ) (γ^2/(K*(γ+1)^2)) (Sstar_B K γ)` AND
  `HasDerivAt (Vint_B K) (γ^2/(K*(γ+1)^2)) (Sstar_B K γ)`.

(If a `HasDerivAt` split into two lemmas per branch is cleaner, that is fine — keep the boundary value
and the derivative value EXACTLY as stated.)

## Output spec
- Compiles server-side, no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`, no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/R1.lean` changes.

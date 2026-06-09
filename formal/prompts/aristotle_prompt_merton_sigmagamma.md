# Aristotle prompt — Merton σ↔γ map: γ is the characteristic exponent (CLAIM 2/3)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
Temporal's ITM/American smooth-pasting (R1, already proved: value+slope match at the free boundaries
`S*_A = Kγ/(γ+1)`, `S*_B = K(γ+1)/γ`) is the Merton (1973) perpetual-American solution. The two free
boundaries fix the two roots of the perpetual-option characteristic (Cauchy–Euler) quadratic

    ½σ²·λ(λ−1) + (r−q)·λ − r = 0 .

The call-direction (put-payoff) boundary `Kγ/(γ+1)` corresponds to the NEGATIVE root `λ₋ = −γ`; the
put-direction (call-payoff) boundary `K(γ+1)/γ` corresponds to the POSITIVE root `λ₊ = γ+1` (via
`Kλ/(λ−1)` = Merton's `S*` template). I want the algebra of these two roots formalized:

- **Sum of roots = 1.**  `λ₋ + λ₊ = (−γ) + (γ+1) = 1`.
- **The quadratic's sum-of-roots is `1 − 2(r−q)/σ²`**, so `sum = 1 ⟺ r = q` (zero-net-carry slice).
- **On the `r = q` slice, the product of roots gives the σ↔γ map:** product `= λ₋·λ₊ = −γ(γ+1)`, and
  the quadratic's product-of-roots is `−2r/σ²`, hence **`γ(γ+1) = 2r/σ²`**.
- **Verification that `λ = −γ` and `λ = γ+1` are EXACTLY the two roots** of the quadratic when `r = q`
  and `r = γ(γ+1)σ²/2`: substituting either into `½σ²λ(λ−1) + (r−q)λ − r` gives `0`.

`γ > 1`, `σ > 0`, `r > 0`. This is textbook Vieta/Cauchy–Euler algebra; I have re-derived it
symbolically (all four facts hold exactly). The point of formalizing is to pin, machine-checked, that
the engine's steepness γ IS the characteristic exponent set by volatility via `γ(γ+1)=2r/σ²`, and that
the engine is the one-parameter `r=q` slice (sum-of-roots fixed at 1).

## Lean (project `RequestProject`, file `RequestProject/MertonSigmaGamma.lean`)
The file ships with statements + `sorry`. Replace each `sorry`; do NOT alter any statement,
coefficient, or constant. Use plain real algebra (`ring`, `field_simp`, `nlinarith`); no `rpow` needed
(these are polynomial-in-λ facts).

## Proof targets
- `char` is the quadratic as a function of λ: `char σ r q λ = (1/2)*σ^2*λ*(λ-1) + (r-q)*λ - r`.
- `root_neg`  : with `r = q` and `r = γ*(γ+1)*σ^2/2`, `char σ r q (-γ) = 0`.
- `root_pos`  : same hypotheses, `char σ r q (γ+1) = 0`.
- `sum_roots`  : `(-γ) + (γ+1) = 1`  (trivial; keep it as the named anchor of the claim).
- `sum_eq_one_iff_rq` : for `σ ≠ 0`, `(1 - 2*(r-q)/σ^2) = 1 ↔ r = q`.
- `sigma_gamma_map` : with `r = q`, IF `−γ` and `γ+1` are the two roots (encoded by the product-of-roots
  identity `(-γ)*(γ+1) = -2*r/σ^2` for `σ ≠ 0`), THEN `γ*(γ+1) = 2*r/σ^2`.

## Output spec
- Compiles server-side, no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`, no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/MertonSigmaGamma.lean` changes.

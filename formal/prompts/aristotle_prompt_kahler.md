# TIER-2 #4 — Kähler compatibility of the GH Hessian metric (algebraic, honest scope)

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Intent and HONEST scope
The GH interior is 1-real-dimensional (rapidity s), where NO complex structure exists (J²=−1 needs
even real dimension). So we do the WELL-POSED object: the Hessian metric `g=Ψ''(s)>0` on the 2D phase
space ℝ² (cotangent bundle), with the canonical complex structure `J=[[0,−g⁻¹],[g,0]]`, metric
`G=[[g,0],[0,g⁻¹]]`, symplectic `ω=[[0,1],[−1,0]]`. This is the ALGEBRAIC (pointwise) Kähler-triple
compatibility — GROUNDED. The differential INTEGRABILITY (Nijenhuis vanishing) is NOT claimed here.

## Task
Prove every `sorry` in `RequestProject/Kahler.lean` using `Matrix` API (`Matrix.mul_fin_two` or
`!![..]` simp lemmas, `Matrix.det_fin_two`, `Matrix.ext`):
- `Jmat_sq`: `J*J = -1` (for `g≠0`).
- `kahler_compatibility`: `G*J = -ω` (verified by hand: G·J = [[0,−1],[1,0]] = −ω).
- `omega_skew`: `ωᵀ = -ω`.
- `omega_nondegenerate`: `det ω = 1`.
- `Gmat_posdiag`: `g>0 ⇒ 0<g ∧ 0<g⁻¹`.

For `Jmat_sq` and `kahler_compatibility`, after expanding the 2×2 product you will need `g*g⁻¹=1`
(`mul_inv_cancel₀ hg`) and `g⁻¹*g=1`.

## HARD CONSTRAINTS
- DO NOT weaken statements, DO NOT add `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`/
  new `axiom`. If `kahler_compatibility` as stated is off by a sign, report the corrected identity in
  `ARISTOTLE_SUMMARY.md` (a sign report is fine) but PROVE the corrected one — do not fabricate.

## Output spec
- Compiles; `#print axioms` each ⊆ {propext, Classical.choice, Quot.sound}.
- `ARISTOTLE_SUMMARY.md`: theorems proved, any sign/signature adjustment, axioms.
- Keep `RequestProject.lean`/`lakefile.toml`/`lean-toolchain` byte-identical.

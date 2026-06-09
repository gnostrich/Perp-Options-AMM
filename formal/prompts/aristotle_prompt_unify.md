# Aristotle obligation — UNIFY: Temporal as ONE metriplectic / Hessian structure

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0 (matches `lean-toolchain` = `leanprover/lean4:v4.28.0`).

## Task
Fill every `sorry` in `RequestProject/Unify.lean` with a complete Lean 4 proof. Do **not** change any
statement, signature, hypothesis, definition, or constant. Do **not** add any `axiom`, `sorry`,
`admit`, `native_decide`, `opaque`, or `unsafe`. Kernel `decide` is fine. Add only the imports /
`open`s you need (the file already `import Mathlib`).

## What the file is (context, do not re-derive the economics)
It is the metriplectic / GENERIC closure of an exponential-family (Bregman) AMM on a
generalized-hyperbolic curve. A single convex potential `Ψ` (the cumulant generating function / log-MGF)
generates the gradient (Esscher/price), the Legendre-dual (symplectic) pair, and the Hessian
(Fisher = dissipation metric `R`). The obligations are the coordinate-free identities behind that.

## Proof targets (all in `namespace Unify`)
- **A1 `mean_response_eq_fisher`** — for `ContDiff ℝ 2 Ψ`, `deriv (expFamMean Ψ) s = fisher Ψ s`,
  i.e. `deriv (fun s => deriv Ψ s) s = deriv (deriv Ψ) s`. This is definitional/`rfl`-like after
  unfolding `expFamMean` and `fisher` (both are `deriv (deriv Ψ)`). Unfold and close.
- **A2 `dual_curvature_inv_fisher`** — `f2 ≠ 0 → f2⁻¹ * f2 = 1` (`inv_mul_cancel₀`).
- **A3 `gh_price_is_exp_natural`** — `0 < k → (k*exp(u−μ) = k*exp(u−μ) ∧ 0 < k*exp(u−μ))`; left by
  `rfl`/`And.intro`, right by positivity (`exp_pos`, `mul_pos`).
- **A4 `fisher_psd`** — `0 < R → (0 ≤ R*z^2 ∧ (z ≠ 0 → 0 < R*z^2))`; `sq_nonneg`, `mul_nonneg`,
  and `pow_pos`/`mul_pos` for the strict part (`z ≠ 0 → 0 < z^2`).
- **B1 `generic_deg1_J_gradS_zero`** — the `s`-derivative of `klBregman Ψ s₀ s` at `s = s₀` is `0`.
  `klBregman Ψ s₀ s = Ψ s₀ − Ψ s − deriv Ψ s * (s₀ − s)`. Its derivative in `s` is
  `−Ψ'(s) − [Ψ''(s)(s₀−s) − Ψ'(s)] = −Ψ''(s)(s₀−s)·(−1)`… compute via `deriv` lemmas
  (`deriv_sub`, `deriv_const`, `deriv_mul`, product rule) using `ContDiff ℝ 2 Ψ` for differentiability;
  at `s = s₀` the `(s₀ − s)` factor is `0`, so the whole thing is `0`. (If a fully general `deriv`
  computation is heavy, note the result is `(s − s₀)·Ψ''(s)` which vanishes at `s = s₀`.)
- **B2 `generic_deg2_M_gradE_zero`** — `R * (0:ℝ) = 0` (`mul_zero`).
- **C1 `boost_is_kahler_hamiltonian`** — `kahlerOmega g w = deriv (fun s => g*s) 0 * w`. RHS:
  `deriv (fun s => g*s) 0 = g` (`deriv_const_mul`/`deriv_id`), so RHS `= g*w = kahlerOmega g w`. Unfold and close.
- **D1 `sNorm_rebase_invariant`** — `sNorm (r*x) (r*α) = sNorm x α` with `r ≠ 0`, `α ≠ 0`:
  `(r*x − r*α)/(r*α) = (x − α)/α`; `field_simp`/`ring` after factoring `r`.
- **D2 `unified_rebase_automorphism`** — `F (sNorm (r*x) (r*α)) = F (sNorm x α)`; rewrite by D1 then `rfl`.
- **E1 `port_necessary`** — `(∀ n, V n ≤ B) → (∀ C, ∃ n, C < O n) → ∀ C, ∃ n, V n − O n < C`.
  Given `C`, pick `n` from `hO (B − C + 1)` (so `O n > B − C + 1`), then `V n − O n ≤ B − O n < C`.
  (Choose the witness threshold so `B − O n < C`.)
- **E2 `port_conditional_solvency`** — `(∀ s, floor − V s ≤ support s) → ∀ s, floor ≤ V s + support s`;
  linear rearrangement (`linarith` from `hcover s`).

## Output spec
Return the full project with `Unify.lean` filled. In `ARISTOTLE_SUMMARY.md` report, for each named
theorem, the result of `#print axioms`. Confirm `lean-toolchain` and the mathlib `rev` are unchanged.
Do not modify any file other than `RequestProject/Unify.lean`.

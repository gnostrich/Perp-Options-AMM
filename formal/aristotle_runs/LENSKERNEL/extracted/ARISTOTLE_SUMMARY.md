# Summary of changes for run 4730260b-59cd-43dc-800d-7240c67275d9
Created the new standalone file `RequestProject/LensKernel.lean` (`import Mathlib`), keeping every supplied definition verbatim (no name collisions, so no renames), and proved ALL requested targets with no `sorry`/`admit`/`native_decide`/`axiom`/`opaque`/`unsafe`. It builds cleanly under the project toolchain. No other project files were modified.

Proved:
- Pool/flow: `tradeUpdate_alpha`, `tradeUpdate_beta`, `tradeUpdate_hyperbola`, `tradeUpdate_reg`, `w_closed_form` (w = 1 − β/y), `gamma_closed_form` (γ = (y−β)/β), `center_closed_form` (β/(y−β)), `center_eq_inv_gamma` (1/γ), `gamma_linear_in_cash` (the flow law γ(tradeUpdate s dy) = γ(s) + dy/β), `mpRaw_closed_form` (β·γ²/α).
- Rebase: `rebase_w`, `rebase_gamma`, `rebase_center`, `gLoc_rebase_invariant`.
- Lens basics: `Phi_zero`, `Phi_nonneg`, `Phi_le_one`, `Phi_lt_one`, `Phi_strictMonoOn`, `gLoc_nonneg`, `gLoc_le_gamma`, `gLoc_at_mode`.
- Smooth-paste port (no `1 < g` / `1 ≤ γ` hypothesis used): `sStarCall_pos`, `sStarCall_ge_theta`, `contCall_at_sStar`, `intrCall_at_sStar` (both = 1/(g+1)), `valueMatch_g` (chained), `contCall_hasDerivAt`, `slopeMatch_g`.

Axiom check: `#print axioms` for `tradeUpdate_hyperbola`, `gamma_linear_in_cash`, `gLoc_rebase_invariant`, `gLoc_le_gamma`, `valueMatch_g`, `slopeMatch_g` each yield exactly `[propext, Classical.choice, Quot.sound]`.

Signature adjustments: `contCall_hasDerivAt` dropped its two positivity hypotheses (it is exactly linear, so the derivative holds unconditionally); the HasDerivAt statement is unchanged. All other signatures are exactly as specified.

Spec-mandated-but-unnecessary hypotheses were kept as requested and flagged with docstrings (`center_eq_inv_gamma` hs, `Phi_le_one` hu, `gLoc_nonneg` htau, `gLoc_at_mode` hs); these produce the only remaining build messages (`unused variable` warnings).

Fragile tactics: none — the final proof bodies contain no `grind`/`exact?`/`simp?` and no `ring` calls that emit a `ring_nf` fallback (all replaced by explicit `rw`/`field_simp`/`ring`/`ring_nf`/`linear_combination` chains).

A full write-up (proved list, signature adjustments, fragile-tactics statement, and the carried/out-of-scope items: JS↔def correspondence handled by a separate oracle, the symmetric put arm, and measure theory/integrals) is in `ARISTOTLE_SUMMARY.md`.

# LENSKERNEL — v28 engine-subset (L2): summary

New standalone file: `RequestProject/LensKernel.lean` (`import Mathlib`).
Builds clean under Lean 4.28.0 / Mathlib v4.28.0. No other project files were touched
(`lakefile.toml`, `lean-toolchain`, `AMMCurve.lean`, `Seam.lean`, `Temporal.lean`, `Main.lean`,
`Audit.lean` untouched).

All definitions were kept VERBATIM as supplied (no renames were necessary — no name collisions).
`^` on `sStarCall` / `contCall` / `intrCall` elaborates as `Real.rpow` as intended (verified).

## PROVED (all targets, no `sorry`)

Pool / flow:
- `tradeUpdate_alpha`, `tradeUpdate_beta` (`rfl`).
- `tradeUpdate_hyperbola` — hyperbola `(x'−α)(y'−β)=αβ` preserved.
- `tradeUpdate_reg` — regularity preserved.
- `w_closed_form` : `w = 1 − β/y`.
- `gamma_closed_form` : `γ = (y−β)/β`.
- `center_closed_form` : `center = β/(y−β)`; `center_eq_inv_gamma` : `center = 1/γ`.
- `gamma_linear_in_cash` (flow law) : `γ(tradeUpdate s dy) = γ(s) + dy/β`.
- `mpRaw_closed_form` : `mpRaw = β·γ²/α`.

Rebase:
- `rebase_w`, `rebase_gamma`, `rebase_center`, `gLoc_rebase_invariant`.

Lens basics:
- `Phi_zero`, `Phi_nonneg`, `Phi_le_one`, `Phi_lt_one`, `Phi_strictMonoOn`.
- `gLoc_nonneg`, `gLoc_le_gamma`, `gLoc_at_mode`.

Smooth-paste port (no `1 < g` / `1 ≤ γ` hypothesis anywhere):
- `sStarCall_pos`, `sStarCall_ge_theta`.
- `contCall_at_sStar`, `intrCall_at_sStar` (both `= 1/(g+1)`), `valueMatch_g` (chained).
- `contCall_hasDerivAt`, `slopeMatch_g`.

## Axiom check

`#print axioms` for `tradeUpdate_hyperbola`, `gamma_linear_in_cash`, `gLoc_rebase_invariant`,
`gLoc_le_gamma`, `valueMatch_g`, `slopeMatch_g` each give exactly
`[propext, Classical.choice, Quot.sound]` ⊆ {propext, Classical.choice, Quot.sound}.

## SIGNATURE ADJUSTMENTS

- `contCall_hasDerivAt` : the two positivity hypotheses `(hg : 0 < g) (hθ : 0 < theta)` were
  dropped. The continuation arm is exactly linear in `sN`, so its derivative
  `1/((g+1)·sStarCall theta g)` holds unconditionally; keeping the hypotheses produced genuine
  "unused variable" warnings. The HasDerivAt statement itself is unchanged. No other signature
  was changed.

## Spec-mandated hypotheses that turn out unnecessary (kept per spec, noted in docstrings)

These remain in the statements exactly as requested; each carries a docstring saying the
hypothesis is unnecessary. They are the source of the only remaining build warnings
(`unused variable`):
- `center_eq_inv_gamma` — `hs : s.Reg` (pure algebraic identity of the two defs).
- `Phi_le_one` — `hu : 0 ≤ u` (Φ < 1 already for negative u).
- `gLoc_nonneg` — `htau : 0 ≤ tau` (bound holds for every tau).
- `gLoc_at_mode` — `hs : s.Reg` (`lensU s s.center = log 1 = 0` regardless).

## FRAGILE TACTICS

None. The final proof bodies use no `grind`, `exact?`, `simp?`, and no `ring` calls that emit a
`Try this: ring_nf` fallback (these were all replaced by explicit `rw`/`field_simp`/`ring`/
`ring_nf`/`linear_combination` chains). The remaining build messages are only the four
`unused variable` warnings listed above for the deliberately-kept spec hypotheses.

## CARRIED / out of scope (as stated in the request)

- No claim is made about the JS itself; the Lean defs MIRROR the cited HEAD functions. The
  JS↔def correspondence is checked by a separate Node oracle (L3), not here.
- The put arm of `markLensed` (symmetric) is not formalized this run.
- No measure theory / integrals (the warp calculus is a separate run).

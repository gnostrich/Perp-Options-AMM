# Summary of changes for run 3c93ddf9-8845-43eb-8329-54f624a3f0a1
Produced the single self-contained file `RequestProject/ValueGeIntrinsic.lean` (`import Mathlib`) with the pinned definitions (`sStarP`, `contP`, `intrP`, `Vp`) re-declared exactly and all seven pinned theorems proved with exact signatures and no weakened hypotheses / strengthened conclusions:

- `contP_pos`
- `powArm_tangent_strict` (the convexity-core strict tangent inequality `g+1 < t^(−g) + g·t`)
- `cont_ge_intrinsic`
- `cont_gt_intrinsic`
- `value_ge_intrinsic` (HEADLINE American-faithfulness: `max (1 − S/K) 0 ≤ Vp`)
- `value_gt_intrinsic_beyond_seam`
- `strict_region_nonempty`

The module docstring keeps the required MODEL DISCLOSURE. The build succeeds (`RequestProject.ValueGeIntrinsic` compiles), with no `sorry`/`admit`/`axiom`/`native_decide`/`opaque`/`unsafe`. `#print axioms` for all five required theorems shows dependence only on `{propext, Classical.choice, Quot.sound}`, i.e. within the allowed set; those `#print axioms` commands are included in the file and their output recorded in `ARISTOTLE_SUMMARY.md`.

One harmless linter note: the pinned definition `intrP (g K S : ℝ) := 1 - S/K` does not use `g`, giving an unused-variable warning; this was left as-is because the definition had to be re-declared exactly as pinned. The canonical RequestProject modules were not touched or imported.

# Aristotle obligation O2 — American faithfulness: `value_ge_intrinsic`

File: `RequestProject/ValueGeIntrinsic.lean` (`import Mathlib`, self-contained, no
sorry/admit/axiom/native_decide/opaque/unsafe).

## Model disclosure

This file is a self-contained MODEL of the PKG-ITM-v2 **design-target** put value object
(bounded re-seamed mark: power continuation arm of exponent −g welded to the LINEAR intrinsic
`(K−S)⁺/K` at `S* = K·g/(g+1)`), stated in the dollar/spot frame, per
`notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md` §0. It is NOT the live engine object
(HEAD `markLensed` ships a power ITM arm in the sNorm frame — the arm that DOES dip below
intrinsic) and NOT the canonical RequestProject modules.

## Results (all proved, exact pinned signatures)

- `contP_pos` — continuation arm positive on `S > 0`.
- `powArm_tangent_strict` — one-variable strict tangent inequality `g + 1 < t^(−g) + g·t` for
  `t > 0`, `t ≠ 1` (convexity core).
- `cont_ge_intrinsic` — tangent-line inequality `1 − S/K ≤ contP` (weak, all `S > 0`).
- `cont_gt_intrinsic` — strict version away from the seam.
- `value_ge_intrinsic` — HEADLINE: `max (1 − S/K) 0 ≤ Vp` everywhere on `S > 0` (American
  faithfulness of the v2 object).
- `value_gt_intrinsic_beyond_seam` — `1 − S/K < Vp` for `S > S*` (strict on continuation region).
- `strict_region_nonempty` — the strict ITM-side region is nonempty (witness `(S* + K)/2`).

## `#print axioms` output

```
'value_ge_intrinsic' depends on axioms: [propext, Classical.choice, Quot.sound]
'cont_gt_intrinsic' depends on axioms: [propext, Classical.choice, Quot.sound]
'value_gt_intrinsic_beyond_seam' depends on axioms: [propext, Classical.choice, Quot.sound]
'strict_region_nonempty' depends on axioms: [propext, Classical.choice, Quot.sound]
'powArm_tangent_strict' depends on axioms: [propext, Classical.choice, Quot.sound]
```

Axiom set ⊆ {propext, Classical.choice, Quot.sound} for every required theorem.

## Note

The pinned definition `intrP (g K S : ℝ) := 1 - S / K` does not use `g`; this produces a
(harmless) unused-variable linter warning, left in place because the definition signature must be
re-declared exactly as pinned.

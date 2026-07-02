# Summary of changes for run 41302c31-688e-426b-8022-b6dabd767ec9
Produced the self-contained file `RequestProject/PasteLin.lean` (`import Mathlib`) proving the C¹ weld of the power continuation arm onto the LINEAR intrinsic at the free boundary `S* = K·g/(g+1)` in the put (dollar/spot) frame, plus uniqueness and the call-wing analogues.

All pinned definitions (`sStarP`, `contP`, `intrP`, `Vp`, `sStarC`, `contC`, `intrC`) are re-declared exactly as specified, and all 13 pinned theorem statements are stated verbatim and fully proved (no weakened hypotheses, no strengthened conclusions, no added hypotheses):

1. `sStarP_pos`, 2. `sStarP_lt_K`, 3. `paste_value_lin`, 4. `paste_value_lin_at`, 5. `intrP_hasDerivAt`, 6. `contP_hasDerivAt`, 7. `paste_slope_lin`, 8. `Vp_hasDerivAt_seam` (the welded piecewise value is differentiable at the seam, glued via `HasDerivWithinAt.union` over `Iic ∪ Ioi`), 9. `contP_A_form`, 10. `powArm_hasDerivAt`, 11. `paste_unique` (value + slope equations force both boundary and coefficient), 12. `paste_value_lin_call`, 13. `paste_slope_lin_call`.

The module docstring keeps the model-disclosure paragraph in substance. No `Vc` definition was added. The file does not touch or import the canonical RequestProject modules.

Verification:
- The module builds successfully with no errors and no `sorry`/`admit`/`axiom`/`native_decide`/`opaque`/`unsafe`/`sorryAx` (grep-confirmed).
- `#print axioms` for `paste_value_lin`, `paste_slope_lin`, `Vp_hasDerivAt_seam`, `paste_unique`, `paste_value_lin_call`, `paste_slope_lin_call` all report `[propext, Classical.choice, Quot.sound]`, i.e. ⊆ {propext, Classical.choice, Quot.sound}. This output is recorded in `ARISTOTLE_SUMMARY.md`.

The only build warnings are unused-variable notices on pinned signatures (`g` in `sStarP_pos`/`sStarP_lt_K`, and `hK` in `intrP_hasDerivAt`, which is provably unnecessary due to Lean's division-by-zero convention). These hypotheses/binders are retained because the signatures are pinned; this is noted in the summary file.

# Aristotle obligation O1 — LINEAR re-seam

File: `RequestProject/PasteLin.lean` (`import Mathlib`, self-contained; does not touch or import
the canonical RequestProject modules).

## Scope / model disclosure
Self-contained MODEL of the PKG-ITM-v2 design-target put value object (bounded re-seamed mark:
power continuation arm of exponent −g welded to the LINEAR intrinsic `(K−S)⁺/K` at
`S* = K·g/(g+1)`), dollar/spot frame, per
`notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md` §0. It is NOT the live engine object
(HEAD `markLensed` ships a power ITM arm in the sNorm frame) and NOT the canonical RequestProject
modules. The archived LENSKERNEL `valueMatch_g`/`slopeMatch_g` prove the POWER-arm paste in the
sNorm coordinate; this file is the LINEAR re-seam — a different statement. (Kept verbatim in
substance in the file's module docstring.)

## Contents (all proofs complete; no `sorry`/`admit`/`axiom`/`native_decide`/`opaque`/`unsafe`)
Pinned definitions re-declared exactly: `sStarP`, `contP`, `intrP`, `Vp`, `sStarC`, `contC`,
`intrC` (with `S ^ g` etc. as `Real.rpow`).

Theorems (exact pinned signatures):
1. `sStarP_pos` — `0 < sStarP g K`.
2. `sStarP_lt_K` — `sStarP g K < K`.
3. `paste_value_lin` — value match at the seam: `contP (S*) = intrP (S*)`.
4. `paste_value_lin_at` — common seam value `= 1/(g+1)`.
5. `intrP_hasDerivAt` — intrinsic slope `-(1/K)` everywhere.
6. `contP_hasDerivAt` — continuation log-slope form `-(g·contP S / S)`.
7. `paste_slope_lin` — slope match: `contP` has slope `-(1/K)` at `S*`.
8. `Vp_hasDerivAt_seam` — the welded piecewise `Vp` is C¹ at the seam with slope `-(1/K)`
   (glued via `HasDerivWithinAt.union` over `Iic ∪ Ioi`).
9. `contP_A_form` — continuation arm in coefficient form `((S*)^g/(g+1))·S^(−g)`.
10. `powArm_hasDerivAt` — general power-arm derivative `A·(−g)·b^(−g−1)`.
11. `paste_unique` — the value+slope two-equation system forces `b = sStarP g K` and
    `A = (sStarP g K)^g/(g+1)`.
12. `paste_value_lin_call` — CALL wing value match (both sides `= 1/(g+1)`).
13. `paste_slope_lin_call` — CALL wing slope match (both arms slope `g^2/(K·(g+1)^2)`).

No `Vc` definition added (call weld deferred to O6/O7 per the brief).

## `#print axioms` output
```
'paste_value_lin' depends on axioms: [propext, Classical.choice, Quot.sound]
'paste_slope_lin' depends on axioms: [propext, Classical.choice, Quot.sound]
'Vp_hasDerivAt_seam' depends on axioms: [propext, Classical.choice, Quot.sound]
'paste_unique' depends on axioms: [propext, Classical.choice, Quot.sound]
'paste_value_lin_call' depends on axioms: [propext, Classical.choice, Quot.sound]
'paste_slope_lin_call' depends on axioms: [propext, Classical.choice, Quot.sound]
```
All axiom sets are ⊆ {propext, Classical.choice, Quot.sound}, as required.

## Notes
- `import Mathlib` was used (per the toolchain spec).
- No hypotheses were weakened or added and no conclusions strengthened; the pinned definitions were
  left unaltered.
- The pinned hypothesis `hK : K ≠ 0` in `intrP_hasDerivAt` turns out to be unnecessary for the
  proof (Lean's junk-value convention makes the identity hold even at `K = 0`), but it is kept
  because the signature is pinned. Likewise the `g` binders in `sStarP_pos`/`sStarP_lt_K` trigger
  unused-variable linter notes; they are retained because the signatures are pinned. These are the
  only build warnings; there are no errors and no `sorry`.

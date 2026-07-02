# Aristotle obligation O1 — LINEAR re-seam: `paste_value_lin` / `paste_slope_lin` (+ uniqueness)

## Toolchain
Lean 4.28.0 / Mathlib v4.28.0 (`leanprover/lean4:v4.28.0`). `import Mathlib`.

## Task
Produce ONE self-contained file `RequestProject/PasteLin.lean` proving the **C¹ weld of the power
continuation arm onto the LINEAR intrinsic** at the free boundary `S* = K·g/(g+1)` (put wing,
dollar/spot frame), including **uniqueness** (the two matching equations force both the boundary
and the coefficient).

## MODEL DISCLOSURE (keep this in the file's module docstring, verbatim in substance)
This file is a self-contained MODEL of the PKG-ITM-v2 **design-target** put value object
(bounded re-seamed mark: power continuation arm of exponent −g welded to the LINEAR intrinsic
`(K−S)⁺/K` at `S* = K·g/(g+1)`), stated in the dollar/spot frame, per
`notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md` §0. It is NOT the live engine object
(HEAD `markLensed` ships a power ITM arm in the sNorm frame) and NOT the canonical RequestProject
modules. The archived LENSKERNEL `valueMatch_g`/`slopeMatch_g` prove the POWER-arm paste in the
sNorm coordinate; THIS is the LINEAR re-seam — a different statement.

## Pinned definitions (re-declare EXACTLY; `S ^ g` etc. are `Real.rpow`)

```lean
import Mathlib

noncomputable section
open Real

/-- PUT free boundary in the dollar/spot frame: S* = K·g/(g+1). -/
def sStarP (g K : ℝ) : ℝ := K * g / (g + 1)
/-- PUT continuation arm (value as a fraction of the K-dollar escrow): (1/(g+1))·(S/S*)^(−g). -/
def contP (g K S : ℝ) : ℝ := (1 / (g + 1)) * (S / sStarP g K) ^ (-g)
/-- PUT linear intrinsic (fraction of K): 1 − S/K (the (K−S)/K parity line). -/
def intrP (g K S : ℝ) : ℝ := 1 - S / K
/-- the re-seamed bounded PUT value (PKG-ITM v2): linear tail at/below S*, power continuation above. -/
def Vp (g K S : ℝ) : ℝ := if S ≤ sStarP g K then intrP g K S else contP g K S

/-- CALL free boundary: S* = K·(g+1)/g. -/
def sStarC (g K : ℝ) : ℝ := K * (g + 1) / g
/-- CALL continuation arm (value as a fraction of the 1-perp escrow): (1/(g+1))·(S/S*)^(+g). -/
def contC (g K S : ℝ) : ℝ := (1 / (g + 1)) * (S / sStarC g K) ^ g
/-- CALL linear intrinsic (fraction of one perp): 1 − K/S. -/
def intrC (g K S : ℝ) : ℝ := 1 - K / S
```

## Pinned theorem statements (state EXACTLY; do not weaken hypotheses or strengthen conclusions)

1. ```lean
   theorem sStarP_pos (g K : ℝ) (hg : 0 < g) (hK : 0 < K) : 0 < sStarP g K
   ```
2. ```lean
   theorem sStarP_lt_K (g K : ℝ) (hg : 0 < g) (hK : 0 < K) : sStarP g K < K
   ```
3. **`paste_value_lin`** — value match at the seam:
   ```lean
   theorem paste_value_lin (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
       contP g K (sStarP g K) = intrP g K (sStarP g K)
   ```
4. Common seam value:
   ```lean
   theorem paste_value_lin_at (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
       contP g K (sStarP g K) = 1 / (g + 1)
   ```
   (Check: `intrP` at `S*` is `1 − g/(g+1) = 1/(g+1)`.)
5. Intrinsic slope (everywhere):
   ```lean
   theorem intrP_hasDerivAt (g K S : ℝ) (hK : K ≠ 0) :
       HasDerivAt (intrP g K) (-(1 / K)) S
   ```
6. Continuation slope (log-slope form, the load-bearing derivative):
   ```lean
   theorem contP_hasDerivAt (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
       HasDerivAt (contP g K) (-(g * contP g K S / S)) S
   ```
7. **`paste_slope_lin`** — slope match at the seam (both arms have slope −1/K):
   ```lean
   theorem paste_slope_lin (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
       HasDerivAt (contP g K) (-(1 / K)) (sStarP g K)
   ```
   (Check: `−g·contP(S*)/S* = −(g/(g+1))/(K·g/(g+1)) = −1/K`.)
8. **The welded C¹ statement** — the piecewise `Vp` itself is differentiable AT the seam with the
   common slope (no kink in the welded function, not just arm-by-arm match):
   ```lean
   theorem Vp_hasDerivAt_seam (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
       HasDerivAt (Vp g K) (-(1 / K)) (sStarP g K)
   ```
   PROOF SKETCH: on `Iic (sStarP g K)`, `Vp = intrP` (the `if` branch holds), giving
   `HasDerivWithinAt` with slope −1/K by (5); on `Ici (sStarP g K)`, `Vp` agrees pointwise with
   `contP` (strictly above S* by the `if`, at S* by `paste_value_lin`), giving `HasDerivWithinAt`
   with slope −1/K by (7); glue with the `Iic ∪ Ici = univ` union lemma
   (`HasDerivWithinAt.union` / `hasDerivAt_of...`).
9. A-form coherence (the continuation arm in coefficient form):
   ```lean
   theorem contP_A_form (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
       contP g K S = ((sStarP g K) ^ g / (g + 1)) * S ^ (-g)
   ```
10. General power-arm derivative (ties the algebraic slope equation in (11) to the analytic slope):
    ```lean
    theorem powArm_hasDerivAt (A g b : ℝ) (hb : 0 < b) :
        HasDerivAt (fun S => A * S ^ (-g)) (A * (-g) * b ^ (-g - 1)) b
    ```
11. **UNIQUENESS headline `paste_unique`** — the two-equation system (value match + slope match of
    a general power arm `A·S^(−g)` against the linear intrinsic at a point `b`) FORCES the boundary
    and the coefficient:
    ```lean
    theorem paste_unique (g K A b : ℝ) (hg : 0 < g) (hK : 0 < K) (hb : 0 < b)
        (hval : A * b ^ (-g) = 1 - b / K)
        (hslope : A * (-g) * b ^ (-g - 1) = -(1 / K)) :
        b = sStarP g K ∧ A = (sStarP g K) ^ g / (g + 1)
    ```
    PROOF SKETCH: from `hslope`, `g·A·b^(−g−1) = 1/K`; multiply by `b` (`b^(−g−1)·b = b^(−g)`,
    `rpow_add` with `b > 0`) to get `g·(A·b^(−g)) = b/K`. With `u := A·b^(−g)`, `hval` gives
    `u = 1 − b/K`, so `g·u = b/K = 1 − u`, hence `u = 1/(g+1)` and `b/K = g/(g+1)`,
    i.e. `b = K·g/(g+1) = sStarP g K` and `A = u·b^g = (sStarP g K)^g/(g+1)`.
12. CALL wing value match (reflected boundary):
    ```lean
    theorem paste_value_lin_call (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
        contC g K (sStarC g K) = intrC g K (sStarC g K)
    ```
    (Both sides `= 1/(g+1)`: `1 − K/S*_c = 1 − g/(g+1)`.)
13. CALL wing slope match:
    ```lean
    theorem paste_slope_lin_call (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
        HasDerivAt (contC g K) (g ^ 2 / (K * (g + 1) ^ 2)) (sStarC g K) ∧
        HasDerivAt (intrC g K) (g ^ 2 / (K * (g + 1) ^ 2)) (sStarC g K)
    ```
    (Check: `intrC′ = K/S²`, at `S*_c = K(g+1)/g` gives `g²/(K(g+1)²)`; `contC′ = g·contC/S`, at
    `S*_c` gives `(g/(g+1))/S*_c = g²/(K(g+1)²)`. Here `g ^ 2` is the natural-number square.)

    The call-side welded-Vc / uniqueness analogues are NOT requested in this batch (put wing is
    the primary; call weld rides O6/O7 later). Do not add a `Vc` definition.

## Output spec
- ONE file `RequestProject/PasteLin.lean`, `import Mathlib`, exact signatures above, all proofs complete.
- Do NOT weaken hypotheses (`0 < g`, `0 < K`, `0 < S`, `0 < b` are all genuine), do NOT
  strengthen conclusions, do NOT add hypotheses, do NOT alter the pinned definitions.
- FORBIDDEN: `sorry`, `admit`, `axiom` (declarations), `native_decide`, `sorryAx`, `opaque`,
  `unsafe`. Kernel `decide` allowed.
- Run `#print axioms paste_value_lin`, `#print axioms paste_slope_lin`,
  `#print axioms Vp_hasDerivAt_seam`, `#print axioms paste_unique`,
  `#print axioms paste_value_lin_call`, `#print axioms paste_slope_lin_call`; include the output
  in `ARISTOTLE_SUMMARY.md`; axiom set must be ⊆ {propext, Classical.choice, Quot.sound}.
- Self-contained; do NOT touch or import the canonical RequestProject modules.

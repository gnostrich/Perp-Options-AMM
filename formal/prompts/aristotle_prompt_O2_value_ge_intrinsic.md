# Aristotle obligation O2 — American faithfulness: `value_ge_intrinsic`

## Toolchain
Lean 4.28.0 / Mathlib v4.28.0 (`leanprover/lean4:v4.28.0`). `import Mathlib`.

## Task
Produce ONE self-contained file `RequestProject/ValueGeIntrinsic.lean` proving that the re-seamed
bounded put value `Vp` (PKG-ITM v2: linear intrinsic tail welded at `S* = K·g/(g+1)` to the power
continuation arm) is **≥ the linear intrinsic positive part EVERYWHERE** on `S > 0`
(American faithfulness — under the v2 object this must be a theorem; its violation by the live
engine arm is the entry-286 finding), and is **strictly above** the intrinsic line on the whole
continuation region (non-vacuity).

## MODEL DISCLOSURE (keep this in the file's module docstring, verbatim in substance)
This file is a self-contained MODEL of the PKG-ITM-v2 **design-target** put value object
(bounded re-seamed mark: power continuation arm of exponent −g welded to the LINEAR intrinsic
`(K−S)⁺/K` at `S* = K·g/(g+1)`), stated in the dollar/spot frame, per
`notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md` §0. It is NOT the live engine object
(HEAD `markLensed` ships a power ITM arm in the sNorm frame — the arm that DOES dip below
intrinsic) and NOT the canonical RequestProject modules.

## Pinned definitions (re-declare EXACTLY; `^` on real exponents is `Real.rpow`)

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
```

## Pinned theorem statements (state EXACTLY; do not weaken hypotheses or strengthen conclusions)

1. ```lean
   theorem contP_pos (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) : 0 < contP g K S
   ```
2. **The one-variable strict tangent inequality** (the convexity core — the power curve lies
   strictly above its tangent line away from the tangency point, in moneyness coordinate
   `t = S/S*`):
   ```lean
   theorem powArm_tangent_strict (g t : ℝ) (hg : 0 < g) (ht : 0 < t) (hne : t ≠ 1) :
       g + 1 < t ^ (-g) + g * t
   ```
   PROOF ROUTES (either): (a) weighted AM–GM: `(1/(g+1))·t^(−g) + (g/(g+1))·t ≥ (t^(−g))^(1/(g+1))·t^(g/(g+1)) = 1`
   with strictness from the unequal-arguments case (`t^(−g) ≠ t` when `t ≠ 1`); or (b) calculus:
   `φ(t) = t^(−g) + g·t` has `φ′(t) = g·(1 − t^(−g−1))`, negative on `(0,1)`, positive on `(1,∞)`,
   so `φ` is strictly decreasing then strictly increasing with strict minimum `φ(1) = g + 1`
   (use `StrictMonoOn`/`StrictAntiOn` via `deriv` sign on intervals).
3. Tangent-line inequality in the value coordinate (weak, all of `S > 0`):
   ```lean
   theorem cont_ge_intrinsic (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
       1 - S / K ≤ contP g K S
   ```
4. Strict away from the seam:
   ```lean
   theorem cont_gt_intrinsic (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S)
       (hne : S ≠ sStarP g K) : 1 - S / K < contP g K S
   ```
   ALGEBRA CHECK for (3)/(4): with `t := S / sStarP g K` we have `contP = t^(−g)/(g+1)` and
   `1 − S/K = 1 − t·g/(g+1) = ((g+1) − g·t)/(g+1)`, so
   `contP − (1 − S/K) = (t^(−g) + g·t − (g+1))/(g+1)`, and (2) applies.
5. **HEADLINE `value_ge_intrinsic`** — the welded value dominates the intrinsic positive part
   everywhere:
   ```lean
   theorem value_ge_intrinsic (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
       max (1 - S / K) 0 ≤ Vp g K S
   ```
   (Case `S ≤ S*`: `Vp = intrP` and `S ≤ S* < K` so `intrP ≥ 0` and `max = intrP`. Case `S > S*`:
   `Vp = contP`, use (1) and (3).)
6. **Strict-region non-vacuity** — continuation strictly above intrinsic beyond the seam:
   ```lean
   theorem value_gt_intrinsic_beyond_seam (g K S : ℝ) (hg : 0 < g) (hK : 0 < K)
       (hS : sStarP g K < S) : 1 - S / K < Vp g K S
   ```
7. The strict region is nonempty and contains ITM-side points (intrinsic still positive there):
   ```lean
   theorem strict_region_nonempty (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
       ∃ S, sStarP g K < S ∧ S < K ∧ 0 < 1 - S / K ∧ 1 - S / K < Vp g K S
   ```
   (Witness `S = (sStarP g K + K)/2`; needs `sStarP g K < K`, i.e. `g/(g+1) < 1`.)

## Output spec
- ONE file `RequestProject/ValueGeIntrinsic.lean`, `import Mathlib`, exact signatures above, all
  proofs complete.
- Do NOT weaken hypotheses (`0 < g`, `0 < K`, `0 < S` are genuine; the `max … 0` in the headline
  is the intrinsic POSITIVE PART, do not drop it), do NOT strengthen conclusions, do NOT add
  hypotheses, do NOT alter the pinned definitions.
- FORBIDDEN: `sorry`, `admit`, `axiom` (declarations), `native_decide`, `sorryAx`, `opaque`,
  `unsafe`. Kernel `decide` allowed.
- Run `#print axioms value_ge_intrinsic`, `#print axioms cont_gt_intrinsic`,
  `#print axioms value_gt_intrinsic_beyond_seam`, `#print axioms strict_region_nonempty`,
  `#print axioms powArm_tangent_strict`; include the output in `ARISTOTLE_SUMMARY.md`; axiom set
  must be ⊆ {propext, Classical.choice, Quot.sound}.
- Self-contained; do NOT touch or import the canonical RequestProject modules.

# Aristotle obligation O5 — funding log-slope read: `logslope_cont_at_seam` / `funding_otm_identity` / `funding_tail_delta_carry`

## Toolchain
Lean 4.28.0 / Mathlib v4.28.0 (`leanprover/lean4:v4.28.0`). `import Mathlib`.

## Task
Produce ONE self-contained file `RequestProject/LogSlopeFunding.lean` proving the funding-read
facts of the re-seamed put value object: the log-slope read `Λ(S) = S·|V′(S)|` is **continuous at
the seam** `S* = K·g/(g+1)` (C¹ paste ⇒ continuous funding rate), the **OTM identity**
`g·mark = |∂V/∂ln S|` on the continuation arm (today's OTM funding magnitude IS the log-slope
read), the **tail delta-carry identity** (dollar log-slope on the linear tail = `S` = `|Δ|·S`,
`Δ = −1` — the perp-futures carry limit), and the **sign lemma** (funding zeroes iff pool on
anchor).

## MODEL DISCLOSURE (keep this in the file's module docstring, verbatim in substance)
This file is a self-contained MODEL of the PKG-ITM-v2 **design-target** put value object
(bounded re-seamed mark: power continuation arm of exponent −g welded to the LINEAR intrinsic
`(K−S)⁺/K` at `S* = K·g/(g+1)`), stated in the dollar/spot frame and in fraction-of-K units, per
`notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md` §0/§4. `lamP` below is the MODEL's
piecewise log-slope read; the theorems tie each branch to the true derivative of the corresponding
arm. This is NOT the live engine funding path (which today continues the OTM formula onto a
different ITM arm, un-designed), NOT an operator-approved funding semantics (that sign-off is
pending and out of scope here), and NOT the canonical RequestProject modules. The call-side
dollar read carries a separate (g+1)/g recalibration — deliberately NOT stated in this batch.

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
/-- the funding log-slope read Λ (fraction-of-K units): tail |∂(1−S/K)/∂ln S| = S/K,
    continuation |∂contP/∂ln S| = g·contP. -/
def lamP (g K S : ℝ) : ℝ := if S ≤ sStarP g K then S / K else g * contP g K S
```

## Pinned theorem statements (state EXACTLY; do not weaken hypotheses or strengthen conclusions)

1. ```lean
   theorem intrP_hasDerivAt (g K S : ℝ) (hK : K ≠ 0) :
       HasDerivAt (intrP g K) (-(1 / K)) S
   ```
2. ```lean
   theorem contP_hasDerivAt (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
       HasDerivAt (contP g K) (-(g * contP g K S / S)) S
   ```
3. **`funding_otm_identity`** — on the continuation arm, `g·mark` IS the log-slope read
   `|∂V/∂ln S| = S·(−V′)` (the derivative is negative, so `−deriv` is the magnitude):
   ```lean
   theorem funding_otm_identity (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : 0 < S) :
       S * -(deriv (contP g K) S) = g * contP g K S
   ```
   (Extract `deriv` from (2) via `HasDerivAt.deriv`, then `S·(g·contP/S) = g·contP` with `S ≠ 0`.)
4. `lamP` agrees with the continuation log-slope beyond the seam (branch soundness):
   ```lean
   theorem lamP_eq_otm_read (g K S : ℝ) (hg : 0 < g) (hK : 0 < K) (hS : sStarP g K < S) :
       lamP g K S = S * -(deriv (contP g K) S)
   ```
5. **`funding_tail_delta_carry`** — on the tail, the DOLLAR log-slope (multiply the
   fraction-of-K read by the K numéraire) is exactly `S`, i.e. `|Δ|·S` with `Δ = −1` — the
   perp-futures delta-carry; and it coincides with the true derivative read of the intrinsic arm:
   ```lean
   theorem funding_tail_delta_carry (g K S : ℝ) (hg : 0 < g) (hK : 0 < K)
       (hS : S ≤ sStarP g K) :
       K * lamP g K S = S ∧ K * (S * -(deriv (intrP g K) S)) = S
   ```
6. The seam identity (the two branch values agree at S*; numerically `g·contP(S*) = g/(g+1) = S*/K`):
   ```lean
   theorem lam_seam_identity (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
       g * contP g K (sStarP g K) = sStarP g K / K
   ```
7. **HEADLINE `logslope_cont_at_seam`** — the funding read is continuous at the seam (no jump in
   the funding rate as a position crosses S*):
   ```lean
   theorem logslope_cont_at_seam (g K : ℝ) (hg : 0 < g) (hK : 0 < K) :
       ContinuousAt (lamP g K) (sStarP g K)
   ```
   PROOF SKETCH: both branch functions (`fun S => S / K` and `fun S => g * contP g K S`) are
   continuous at `S* > 0` and agree there by (6); glue the `if` across the frontier
   (`Filter.Tendsto.if` / `ContinuousWithinAt` on `Iic`/`Ici` + union, as convenient).
8. **Sign lemma `funding_zero_iff_on_anchor`** — the funding accrual
   `κ·g·N·mark·(Sp−1)/Sp` zeroes exactly when the pool is on its anchor (`Sp = 1`); the sign
   structure (crowded-pays-contrarian) is carried entirely by `(Sp−1)/Sp`:
   ```lean
   theorem funding_zero_iff_on_anchor (kappa g N mark Sp : ℝ) (hκ : 0 < kappa) (hg : 0 < g)
       (hN : 0 < N) (hm : 0 < mark) (hSp : 0 < Sp) :
       kappa * g * N * mark * ((Sp - 1) / Sp) = 0 ↔ Sp = 1
   ```

## Output spec
- ONE file `RequestProject/LogSlopeFunding.lean`, `import Mathlib`, exact signatures above, all
  proofs complete.
- Do NOT weaken hypotheses (`0 < g`, `0 < K`, `0 < S`/domain bounds are genuine), do NOT
  strengthen conclusions, do NOT add hypotheses, do NOT alter the pinned definitions.
- FORBIDDEN: `sorry`, `admit`, `axiom` (declarations), `native_decide`, `sorryAx`, `opaque`,
  `unsafe`. Kernel `decide` allowed.
- Run `#print axioms logslope_cont_at_seam`, `#print axioms funding_otm_identity`,
  `#print axioms funding_tail_delta_carry`, `#print axioms lam_seam_identity`,
  `#print axioms funding_zero_iff_on_anchor`; include the output in `ARISTOTLE_SUMMARY.md`;
  axiom set must be ⊆ {propext, Classical.choice, Quot.sound}.
- Self-contained; do NOT touch or import the canonical RequestProject modules.

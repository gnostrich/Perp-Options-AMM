# Aristotle obligation L3 — conditional-solvency lemma (external half under named concrete B3/B4 forms)

## Toolchain
Lean 4.28.0 / Mathlib v4.28.0 (`leanprover/lean4:v4.28.0`). `import Mathlib`.

## Task
Produce a self-contained file `RequestProject/ConditionalSolvency.lean` that re-declares the minimal
`Exchange` slice (exactly as in `PHUnification.lean`) and proves the EXTERNAL-half solvency claim
**conditional on a concrete-but-still-hypothesized funding rule (B3) and oracle/price-path bound
(B4)** — turning the abstract coverage premise into a result conditioned on NAMED concrete input
forms, WITHOUT making it unconditional (PH-4b: funding port necessary, never sufficient).

This is the packet §5.8 obligation. The point: instead of leaving `hcov` fully abstract, we exhibit
a concrete coverage rule `funding s := floor − (poolPotential s − obligation s) + slack s` with a
nonnegative `slack` (B3 says funding at least covers the gap; B4 bounds the price-path-dependent gap
via `slack ≥ 0`), and prove solvency holds on that admissible set. The hypotheses `hslack`,
`hfunding` are GENUINE (not vacuous): they encode the B3/B4 admissibility, and dropping them makes
the theorem FALSE, not weaker.

## The pinned object (re-declare exactly; do NOT alter any field)

```lean
import Mathlib

noncomputable section
open Real

structure TemporalAMM where
  alpha : ℝ
  beta  : ℝ
  y     : ℝ
  m     : ℝ
  halpha : 0 < alpha
  hbeta  : 0 < beta
  hy     : beta < y
  hm     : 0 < m

namespace TemporalAMM
def poolPotential (P : TemporalAMM) (t : ℝ) : ℝ := (t - P.beta)^3 / (3 * P.alpha * P.beta)
end TemporalAMM

structure Exchange where
  amm        : TemporalAMM
  obligation : ℝ → ℝ
  funding    : ℝ → ℝ
  close      : ℝ → ℝ → ℝ
  floor      : ℝ
```

Define the solvency and coverage predicates EXACTLY as in `PHUnification.lean`:
```lean
/-- coverage: the funding port covers the floor-minus-stored-net-obligation gap at every state. -/
def covers (E : Exchange) : Prop :=
  ∀ s, E.floor - (E.amm.poolPotential s - E.obligation s) ≤ E.funding s
/-- solvency: stored net obligation plus funding meets the floor at every state. -/
def solvent (E : Exchange) : Prop :=
  ∀ s, E.floor ≤ (E.amm.poolPotential s - E.obligation s) + E.funding s
```

## Pinned predicates (state these EXACTLY; do not weaken)

1. **`covers_iff_solvent`** — the abstract reduction (carried from `PHUnification.lean`, re-state to
   anchor the file; this is the ↔ minimality fact).
   ```lean
   theorem covers_iff_solvent (E : Exchange) : covers E ↔ solvent E
   ```

2. **`solvent_of_covers`** — the conditional headline (the `→` direction).
   ```lean
   theorem solvent_of_covers (E : Exchange) (hcov : covers E) : solvent E
   ```

3. **THE CONCRETE B3/B4 INSTANTIATION — `solvent_of_concrete_funding`.** Suppose the funding rule
   takes the explicit B3 form `funding s = floor − (poolPotential s − obligation s) + slack s`
   with `slack` the B4 price-path/oracle-bound residual, and B4 admissibility says `slack s ≥ 0`
   for all `s`. Then the exchange is solvent. State it as:
   ```lean
   theorem solvent_of_concrete_funding (E : Exchange) (slack : ℝ → ℝ)
       (hfunding : ∀ s, E.funding s
                     = E.floor - (E.amm.poolPotential s - E.obligation s) + slack s)
       (hslack : ∀ s, 0 ≤ slack s) :
       solvent E
   ```
   PROOF: rewrite `funding` by `hfunding`; the floor inequality becomes
   `E.floor ≤ (poolPotential s − obligation s) + (E.floor − (poolPotential s − obligation s) + slack s)`
   which simplifies to `0 ≤ slack s` = `hslack s`. `linarith`.

4. **`concrete_funding_covers`** — show the concrete B3/B4 form actually DISCHARGES `covers`
   (i.e. the concrete admissible set IS inside the coverage set; this is what makes statement 3 a
   genuine instantiation of the conditional, not a separate weaker claim).
   ```lean
   theorem concrete_funding_covers (E : Exchange) (slack : ℝ → ℝ)
       (hfunding : ∀ s, E.funding s
                     = E.floor - (E.amm.poolPotential s - E.obligation s) + slack s)
       (hslack : ∀ s, 0 ≤ slack s) :
       covers E
   ```

5. **NON-VACUITY WITNESS — `concrete_funding_not_vacuous`.** Exhibit that dropping `hslack` breaks
   solvency: there EXISTS an `Exchange` with the concrete funding form and a `slack` taking a
   NEGATIVE value at some state where `solvent` FAILS. State it as a concrete counter-instance so an
   auditor can confirm `hslack` is load-bearing (this guards against a vacuous reading of statement
   3). Phrase precisely:
   ```lean
   theorem concrete_funding_not_vacuous :
       ∃ (E : Exchange) (slack : ℝ → ℝ),
         (∀ s, E.funding s = E.floor - (E.amm.poolPotential s - E.obligation s) + slack s)
         ∧ (¬ (∀ s, 0 ≤ slack s))
         ∧ (¬ solvent E)
   ```
   (Build a concrete `Exchange` — e.g. a fixed `TemporalAMM`, `obligation := fun _ => 0`,
   `close := fun _ _ => 0`, `floor := 0`, and `slack := fun _ => -1`, `funding` per the form — and
   show `funding s = poolPotential s − 1`, so `solvent` would need `0 ≤ poolPotential s − 1 − …`,
   which fails at a witnessing `s`. Choose the witness so `linarith`/`norm_num` closes it.)

## Output spec
- ONE file `RequestProject/ConditionalSolvency.lean`, `import Mathlib`, exact signatures above.
- Do NOT make solvency unconditional. Statements 2–4 keep the funding/coverage hypotheses as real
  premises. Statement 5 PROVES the hypotheses are load-bearing.
- The B3/B4 hypotheses `hfunding`, `hslack` are GENUINE input-admissibility conditions; they must
  NOT be replaced by `True` / vacuous predicates.
- FORBIDDEN anywhere: `sorry`, `admit`, `axiom` (decls), `native_decide`, `sorryAx`, `opaque`,
  `unsafe`. Kernel `decide` allowed.
- Run `#print axioms solvent_of_concrete_funding` and `#print axioms concrete_funding_not_vacuous`;
  include in `ARISTOTLE_SUMMARY.md`; axiom set ⊆ {propext, Classical.choice, Quot.sound}.
- Do NOT touch/import the canonical modules. Self-contained.

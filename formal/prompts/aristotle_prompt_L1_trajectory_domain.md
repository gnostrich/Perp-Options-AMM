# Aristotle obligation L1 — trade trajectories stay on the R_psd operating domain

## Toolchain
Lean 4.28.0 / Mathlib v4.28.0 (must match `lean-toolchain` = `leanprover/lean4:v4.28.0`).
Use `import Mathlib`.

## Task
Produce a self-contained file `RequestProject/TrajectoryDomain.lean` that re-declares the minimal
`TemporalAMM` single-object slice (exactly the carried data + invariants of the canonical
`MonolithConstM.lean`) and proves that the reachable state-coordinate trajectory of the AMM under
**valid trades** never leaves the resistive-PSD operating domain `t ≥ β`.

This discharges the `hst : ∀ k, E.amm.beta ≤ st k` well-posedness side-condition that
`exchange_internal_passivity` (in `PHUnification.lean`) currently carries as a free hypothesis,
**FROM THE DYNAMICS** rather than assuming it: the realized post-trade state coordinate `y` is
strictly above `β` for every valid trade, and a trade conserves `β`, so an iterated valid-trade
trajectory stays on-domain.

## The pinned object (re-declare exactly; do NOT alter any field or invariant)

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

/-- a single valid trade: shifts the state coordinate y by D; validity is exactly `beta < y + D`
    (the same precondition the canonical `trade` carries). conserves alpha, beta, m. -/
def trade (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) : TemporalAMM :=
  ⟨P.alpha, P.beta, P.y + D, P.m, P.halpha, P.hbeta, hD, P.hm⟩
```

## Pinned predicates (state these EXACTLY; do not weaken)

1. **`state_on_domain`** — the state coordinate of ANY `TemporalAMM` is on the operating domain
   (`β ≤ y`, in fact strict). This is the one-step base fact.
   ```lean
   theorem state_on_domain (P : TemporalAMM) : P.beta ≤ P.y
   ```
   (The structure carries `hy : beta < y`; conclude `beta ≤ y`. Do NOT drop `hy`.)

2. **`trade_state_on_domain`** — the post-trade state coordinate is on the operating domain.
   ```lean
   theorem trade_state_on_domain (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
       (P.trade D hD).beta ≤ (P.trade D hD).y
   ```

3. **`trade_seq`** — the realized trajectory of state coordinates under a sequence of valid trades.
   Model a trajectory as: a starting object `P`, a step-input function `D : ℕ → ℝ`, together with a
   per-step validity proof. Use the following honest formalization that ITERATES `trade`:
   ```lean
   /-- the object reached after `k` valid trades, given a per-step validity witness. -/
   def iterTrade (P : TemporalAMM) (D : ℕ → ℝ)
       (hvalid : ∀ Q : TemporalAMM, ∀ k : ℕ, Q.beta < Q.y + D k) : ℕ → TemporalAMM
     | 0 => P
     | (k+1) => (iterTrade P D hvalid k).trade (D k) (hvalid (iterTrade P D hvalid k) k)
   ```
   If the universally-quantified validity witness `hvalid` is awkward to terminate the recursion,
   you MAY instead carry validity as a hypothesis on the reached object at each step — but the
   conclusion below must be unchanged and the validity predicate must NOT be vacuous (it must
   genuinely be `beta < y + D k`, the real trade precondition).

4. **`trade_seq_on_domain`** (THE HEADLINE) — every state coordinate along the trajectory is on the
   operating domain `β ≤ st k`, where `st k := (iterTrade P D hvalid k).y`. Also `β` is conserved
   along the trajectory.
   ```lean
   theorem trade_seq_on_domain (P : TemporalAMM) (D : ℕ → ℝ)
       (hvalid : ∀ Q : TemporalAMM, ∀ k : ℕ, Q.beta < Q.y + D k) :
       ∀ k, P.beta ≤ (iterTrade P D hvalid k).y
   ```
   PROOF SKETCH: induction on `k`. Base `k=0`: `iterTrade … 0 = P`, and `P.beta ≤ P.y` from `hy`.
   Step: `(iterTrade … (k+1)).beta = (iterTrade … k).beta = P.beta` (β conserved by `trade`), and
   `(iterTrade … (k+1)).y = (iterTrade … k).y + D k`, which exceeds `(iterTrade … k).beta = P.beta`
   by the validity witness `hvalid`. Hence `P.beta ≤ (iterTrade … (k+1)).y` (strict, so ≤ holds).

5. **`trade_seq_beta_const`** — β is conserved along the trajectory (load-bearing for step above;
   state it explicitly).
   ```lean
   theorem trade_seq_beta_const (P : TemporalAMM) (D : ℕ → ℝ)
       (hvalid : ∀ Q : TemporalAMM, ∀ k : ℕ, Q.beta < Q.y + D k) :
       ∀ k, (iterTrade P D hvalid k).beta = P.beta
   ```

## Output spec
- ONE file `RequestProject/TrajectoryDomain.lean`, `import Mathlib`, `noncomputable section`,
  `open Real`, all in `namespace TemporalAMM` (close it before EOF).
- Prove ALL of statements 1–5 with the EXACT signatures above. Do NOT rename, do NOT weaken any
  hypothesis, do NOT strengthen any conclusion, do NOT add hypotheses to the conclusions.
- The `hvalid` predicate must remain the genuine trade precondition `beta < y + D k`. It must NOT
  be replaced by `True`, by `0 = 0`, or any vacuous/always-false predicate.
- ABSOLUTELY FORBIDDEN anywhere in the file: `sorry`, `admit`, `axiom` (declarations),
  `native_decide`, `sorryAx`, `opaque`, `unsafe`. Kernel `decide` is allowed.
- After the proofs, run `#print axioms trade_seq_on_domain` and
  `#print axioms trade_seq_beta_const` and include the output in `ARISTOTLE_SUMMARY.md`; the axiom
  set MUST be ⊆ {propext, Classical.choice, Quot.sound}.
- Do NOT touch or import the canonical modules `AMMCurve.lean`, `Audit.lean`, `Main.lean`,
  `Seam.lean`, `Temporal.lean`. This file is self-contained.

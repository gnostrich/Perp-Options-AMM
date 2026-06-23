# Aristotle obligation L9 (BIG) — stochastic Snell-envelope settlement optimality (STAGED)

## Toolchain
Lean 4.28.0 / Mathlib v4.28.0 (`leanprover/lean4:v4.28.0`). `import Mathlib`.

## Context and HARD honesty constraint
The existing deterministic result is: the settlement free boundary `S* = K·g/(g+1)` (normalized
`sStar g θ = θ·((g+1)/g)^g`) is the smooth-pasting boundary, with `paste_value`/`paste_slope`
proving the C¹ (value+slope) match there. A separate (older, GH-line) result argues `S*` is
optimal **variationally**, CARRIED on an undischarged `[Snell]` premise. The FULL claim — that `S*`
is the optimal exercise boundary of a genuine stochastic optimal-stopping problem (the value
function = the Snell envelope of a discounted payoff under a price PROCESS) — is NOT proved.

**DO NOT weaken or restate the deterministic-boundary theorem to fake progress.** This obligation
is explicitly STAGED: attempt the abstract discrete-time Snell-envelope optimal-stopping
CHARACTERIZATION (which Mathlib can support) over an ABSTRACT adapted reward process, proving the
generic optimal-stopping facts that a settlement-optimality claim would compose with — and REPORT
precisely what is missing to instantiate it on the GH/constant-m price process (there is no
oracle/measure/price-process in the monolith object).

## Stage A — what to ATTEMPT (genuinely provable, abstract)

Produce a self-contained file `RequestProject/SnellStaged.lean` proving the GENERIC discrete-time
optimal-stopping / Snell-envelope skeleton over a finite horizon, on an ABSTRACT reward process.
Use only standard Mathlib (e.g. `MeasureTheory`, conditional-expectation / martingale API if
available; if the full measure-theoretic Snell envelope is too heavy, fall back to the
DETERMINISTIC finite-horizon Bellman/backward-induction form below, which is fully elementary).

DETERMINISTIC FINITE-HORIZON FALLBACK (definitely provable — do this if the measure-theoretic
version is intractable):

```lean
import Mathlib
noncomputable section
open Real

/-- A finite-horizon reward sequence `g : Fin (N+1) → ℝ` (the payoff if you stop at time k). -/
/-- The backward-induction value (the deterministic "Snell envelope" without conditioning):
    V N = g N ; V k = max (g k) (V (k+1)). -/
def snellValue {N : ℕ} (g : Fin (N+1) → ℝ) : Fin (N+1) → ℝ := by
  sorry  -- REPLACE: define by backward recursion (Fin.lastCases / decreasing induction);
         -- NO `sorry` may survive in the returned file.
```

Pinned targets (state EXACTLY; replace the def above with a genuine recursion — NO `sorry` in the
returned file):

1. **`snell_ge_reward`** — the value dominates the immediate reward at every time:
   ```lean
   theorem snell_ge_reward {N : ℕ} (g : Fin (N+1) → ℝ) (k : Fin (N+1)) :
       g k ≤ snellValue g k
   ```
2. **`snell_ge_continuation`** — the value dominates the continuation value (value at the next
   time), for `k` not the last index:
   ```lean
   theorem snell_ge_continuation {N : ℕ} (g : Fin (N+1) → ℝ) (k : Fin N) :
       snellValue g k.castSucc ≥ snellValue g k.succ
   ```
3. **`snell_eq_max`** — the Bellman characterization: away from the horizon the value is the max of
   stopping now and continuing:
   ```lean
   theorem snell_eq_max {N : ℕ} (g : Fin (N+1) → ℝ) (k : Fin N) :
       snellValue g k.castSucc = max (g k.castSucc) (snellValue g k.succ)
   ```
4. **`snell_optimal_stop`** — the first time the value equals the reward is an optimal stopping
   point in the sense that stopping there achieves the value (state the cleanest exact form you can
   close; e.g. that if `g k = snellValue g k` then stopping at `k` realizes the envelope value, and
   the stopping region `{k | g k = snellValue g k}` is nonempty — it contains `N`). Phrase it as a
   real, non-vacuous theorem; do NOT make it `True`.

These are the abstract optimal-stopping facts that a stochastic settlement-optimality theorem would
compose with. They are NOT the GH-instantiated claim.

## Stage B — REPORT the obstruction (in `ARISTOTLE_SUMMARY.md`, do NOT fake in Lean)
In the summary, state precisely (NL, not Lean) what is required to upgrade Stage A to the full
stochastic settlement-optimality claim, and what is missing:
- the monolith object carries NO price process / oracle / probability measure (it is a deterministic
  pure-math object); the Snell envelope needs an adapted discounted payoff `(D_k · payoff(S_k))` under
  a filtration and a measure on price paths `S_k`;
- the link `optimal stop = first hitting of S*` needs the payoff/continuation monotonicity that the
  smooth-paste boundary encodes, plus a supermartingale/optional-stopping argument
  (`MeasureTheory` Snell-envelope or `submartingale`/`optional stopping` API);
- whether Mathlib v4.28.0 has a usable Snell-envelope / optimal-stopping lemma, or whether the
  measure-theoretic layer would have to be built — state which.

## Output spec
- ONE file `RequestProject/SnellStaged.lean`. The RETURNED file must have NO `sorry` (replace the
  placeholder def with a real recursion). If even the deterministic backward-induction skeleton has a
  blocker, report it precisely in the summary and prove the maximal provable subset — do NOT leave
  `sorry`, do NOT weaken a stated theorem to vacuity.
- FORBIDDEN in the returned file: `sorry`, `admit`, `axiom` (decls), `native_decide`, `sorryAx`,
  `opaque`, `unsafe`. Kernel `decide` allowed.
- Run `#print axioms snell_ge_reward` (and the others proved); include in `ARISTOTLE_SUMMARY.md`;
  axiom set ⊆ {propext, Classical.choice, Quot.sound}.
- This file does NOT touch the deterministic `paste_value`/`paste_slope` results and makes NO claim
  that weakens them. Self-contained; do NOT touch/import the canonical modules.

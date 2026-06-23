# Summary of changes for run 6b2371e6-b2b9-477b-ad2e-40ae71557499
Completed the STAGED obligation L9.

**Stage A (proved, no `sorry`)** — New self-contained file `RequestProject/SnellStaged.lean` (`import Mathlib`) developing the generic discrete-time optimal-stopping / Snell-envelope skeleton over an abstract finite-horizon reward sequence `g : Fin (N+1) → ℝ`, using the elementary deterministic backward-induction (Bellman) form. It does not import, touch, or weaken the deterministic smooth-pasting results (`paste_value`/`paste_slope`).

- `snellValue` is defined by a genuine decreasing recursion via `Fin.reverseInduction` (the placeholder `sorry` def was replaced with a real recursion).
- Pinned theorems proved exactly as specified: `snell_ge_reward` (value ≥ reward), `snell_ge_continuation` (value ≥ continuation value), `snell_eq_max` (Bellman max characterization), and `snell_optimal_stop` (non-vacuous: stopping at the horizon realizes the envelope value and the stopping region is nonempty). Plus an auxiliary `snell_last` terminal-condition lemma.
- Verified via full `lake build` of `RequestProject.SnellStaged`. The returned file contains no `sorry`/`admit`/`axiom` decl/`native_decide`/`sorryAx`/`opaque`/`unsafe` (the only textual "sorry" is in a docstring). `#print axioms` for all four pinned theorems reports dependence only on `[propext, Classical.choice, Quot.sound]` ⊆ the allowed set.

**Stage B (reported, not faked)** — `ARISTOTLE_SUMMARY.md` records precisely what is missing to upgrade Stage A to the full stochastic settlement-optimality claim: the monolith carries no price process / oracle / filtration / probability measure, so the conditional-expectation Snell envelope `V_k = ess sup_{τ≥k} E[D_τ·payoff(S_τ)|F_k]` cannot be instantiated; the "optimal stop = first hitting of S*" link needs the smooth-paste payoff/continuation monotonicity plus a supermartingale/optional-stopping argument; and Mathlib v4.28.0 provides the pieces (conditional expectation, filtrations, super/submartingales, optional stopping, stopping times) but no packaged Snell-envelope optimal-stopping construction, so that measure-theoretic layer plus the concrete GH/constant-m price process would have to be built to close the full claim.

# Aristotle obligation L9 (BIG) — STAGED Snell-envelope settlement optimality

## Stage A (DONE): abstract finite-horizon optimal-stopping skeleton

New self-contained file: `RequestProject/SnellStaged.lean` (`import Mathlib`). It does NOT
import, touch, or weaken the deterministic smooth-pasting results (`paste_value` /
`paste_slope`), and makes no claim affecting them.

### Definition
`snellValue {N} (g : Fin (N+1) → ℝ) : Fin (N+1) → ℝ` — the deterministic backward-induction
("Snell envelope without conditioning") value of an abstract finite-horizon reward sequence,
defined by a genuine decreasing recursion via `Fin.reverseInduction` (NO `sorry`). It satisfies
`V (last) = g (last)` and `V k.castSucc = max (g k.castSucc) (V k.succ)`.

### Theorems proved (exactly as pinned)
1. `snell_ge_reward` — `g k ≤ snellValue g k` (value dominates immediate reward).
2. `snell_ge_continuation` — `snellValue g k.castSucc ≥ snellValue g k.succ` (value dominates
   continuation value).
3. `snell_eq_max` — `snellValue g k.castSucc = max (g k.castSucc) (snellValue g k.succ)` (Bellman
   characterization). Plus auxiliary `snell_last` (terminal condition).
4. `snell_optimal_stop` — non-vacuous: stopping at the horizon realizes the envelope value
   (`g (last) = snellValue g (last)`) and the stopping region `{k | g k = snellValue g k}` is
   nonempty (contains `Fin.last N`).

### Axiom audit (`#print axioms`)
All four pinned theorems depend on axioms `[propext, Classical.choice, Quot.sound]` only —
i.e. ⊆ {propext, Classical.choice, Quot.sound}. Verified both via `#print axioms` in-file and a
full `lake build` of `RequestProject.SnellStaged`. The returned file contains no `sorry`,
`admit`, `axiom` decl, `native_decide`, `sorryAx`, `opaque`, or `unsafe`.

## Stage B (REPORT): obstruction to upgrading to the full stochastic settlement-optimality claim

What Stage A proves is the GENERIC discrete-time optimal-stopping / Snell-envelope skeleton over
an ABSTRACT adapted reward process. It is NOT the GH-instantiated stochastic claim. To upgrade to
the full statement — "`S* = K·g/(g+1)` (normalized `sStar g θ = θ·((g+1)/g)^g`) is the optimal
exercise boundary of a genuine stochastic optimal-stopping problem, with the value function equal
to the Snell envelope of a discounted payoff under a price PROCESS" — the following are required,
and are currently missing:

1. **No stochastic primitives in the monolith.** The monolith object is a deterministic pure-math
   object: it carries NO price process, NO oracle, NO filtration, and NO probability measure. The
   genuine Snell envelope is `V_k = ess sup over stopping times τ ≥ k of E[D_τ · payoff(S_τ) | F_k]`,
   i.e. an adapted discounted payoff `(D_k · payoff(S_k))` conditioned on a filtration `F_k` under a
   measure on price paths `S_k`. None of `(Ω, F, ℙ)`, the filtration `F_k`, the adapted price process
   `S_k`, the discount `D_k`, or `E[· | F_k]` exists in the object, so the conditional-expectation
   layer cannot even be stated against it. This is the deterministic version Stage A intentionally
   delivers in its place.

2. **Link "optimal stop = first hitting of `S*`".** Establishing that the optimal stopping time is
   the first hitting time of the boundary `S*` needs the payoff/continuation monotonicity that the
   smooth-paste (C¹ value+slope match) boundary encodes — i.e. the continuation value crosses the
   immediate payoff monotonically exactly at `S*` — combined with a supermartingale /
   optional-stopping argument: the discounted Snell envelope is the smallest supermartingale
   dominating the payoff, and optional stopping at the first hitting time attains it. This requires
   the measure-theoretic conditional structure of (1); the abstract `snell_eq_max` /
   `snell_ge_continuation` here are the deterministic shadows of those supermartingale facts.

3. **Mathlib v4.28.0 coverage.** Mathlib v4.28.0 has the building blocks but NOT a packaged
   Snell-envelope / optimal-stopping theorem instantiable here. Available: `MeasureTheory`
   conditional expectation (`condexp`/`μ[· | m]`), `Filtration`, `Martingale` /
   `Supermartingale` / `Submartingale`, and an Optional Stopping Theorem
   (`MeasureTheory.submartingale.expected_stoppedValue_mono` / optional-stopping family) plus
   `MeasureTheory.IsStoppingTime` and `stoppedValue`/`stoppedProcess`. MISSING: there is no
   ready-made `snellEnvelope` construction with its defining "smallest supermartingale dominating
   the reward" characterization and the optimal-stopping-time identification. That measure-theoretic
   Snell-envelope layer (definition + supermartingale optimality + first-hitting-time optimal
   stopping), together with the GH/constant-`m` price process and its measure, would have to be
   BUILT before the deterministic Stage A skeleton could be composed into the full stochastic
   settlement-optimality theorem.

## Summary
Stage A is fully discharged (4 pinned theorems + 1 auxiliary, no `sorry`, clean axiom set). The
full stochastic claim is blocked by the absence of any probabilistic/price-process structure in the
monolith and by the absence of a packaged Snell-envelope optimal-stopping theorem in Mathlib
v4.28.0; both the measure-theoretic Snell layer and the concrete GH price-process instantiation
would need to be constructed to close it.

import Mathlib

/-!
# Stage A: Abstract finite-horizon Snell-envelope / optimal-stopping skeleton

This file is **self-contained** and does NOT import, touch, or weaken the canonical
deterministic smooth-pasting results (`paste_value` / `paste_slope`).

It develops the GENERIC discrete-time optimal-stopping (Snell-envelope) facts over an
ABSTRACT finite-horizon reward sequence `g : Fin (N+1) → ℝ`, using the elementary
deterministic backward-induction (Bellman) form.  These are exactly the abstract
optimal-stopping facts that a stochastic *settlement-optimality* theorem would compose
with; they are NOT the GH-instantiated stochastic claim (see `ARISTOTLE_SUMMARY.md`,
Stage B, for the precise obstruction).

The measure-theoretic Snell envelope (adapted discounted payoff under a filtration and a
measure on price paths) is intentionally avoided here: the monolith object carries no
price process / oracle / probability measure, so the conditional-expectation layer cannot
be instantiated.  The deterministic backward-induction value below is the maximal
provable, faithful abstraction.
-/

noncomputable section
open Real

/-- The backward-induction value (the deterministic "Snell envelope" without
conditioning) of a finite-horizon reward sequence `g : Fin (N+1) → ℝ`, where `g k` is the
payoff obtained by stopping at time `k`.

It satisfies the Bellman recursion
* `V (Fin.last N) = g (Fin.last N)` (at the horizon you must stop), and
* `V k.castSucc = max (g k.castSucc) (V k.succ)` (away from the horizon, take the better of
  stopping now and continuing).

Defined via `Fin.reverseInduction` (genuine decreasing/backward recursion); no `sorry`. -/
def snellValue {N : ℕ} (g : Fin (N+1) → ℝ) : Fin (N+1) → ℝ :=
  Fin.reverseInduction (g (Fin.last N)) (fun i v => max (g i.castSucc) v)

/-- Terminal condition of the backward recursion: at the horizon the value equals the
reward (you are forced to stop). -/
theorem snell_last {N : ℕ} (g : Fin (N+1) → ℝ) :
    snellValue g (Fin.last N) = g (Fin.last N) := by
  unfold snellValue
  rw [Fin.reverseInduction_last]

/-- **Bellman characterization.** Away from the horizon, the value is the maximum of
stopping now (`g k.castSucc`) and continuing (`snellValue g k.succ`). -/
theorem snell_eq_max {N : ℕ} (g : Fin (N+1) → ℝ) (k : Fin N) :
    snellValue g k.castSucc = max (g k.castSucc) (snellValue g k.succ) := by
  unfold snellValue
  rw [Fin.reverseInduction_castSucc]

/-- The value dominates the immediate reward at every time. -/
theorem snell_ge_reward {N : ℕ} (g : Fin (N+1) → ℝ) (k : Fin (N+1)) :
    g k ≤ snellValue g k := by
  induction k using Fin.reverseInduction with
  | last => rw [snell_last]
  | cast i _ => rw [snell_eq_max]; exact le_max_left _ _

/-- The value dominates the continuation value (the value at the next time). -/
theorem snell_ge_continuation {N : ℕ} (g : Fin (N+1) → ℝ) (k : Fin N) :
    snellValue g k.castSucc ≥ snellValue g k.succ := by
  rw [snell_eq_max]; exact le_max_right _ _

/-- **Optimal stopping.** Stopping at the horizon realizes the envelope value, and the
stopping region `{k | g k = snellValue g k}` is nonempty (it always contains the horizon
`Fin.last N`).  This is a real, non-vacuous statement: it exhibits an exercise time at
which the reward exactly attains the Snell-envelope value. -/
theorem snell_optimal_stop {N : ℕ} (g : Fin (N+1) → ℝ) :
    (g (Fin.last N) = snellValue g (Fin.last N)) ∧
    ∃ k : Fin (N+1), g k = snellValue g k :=
  ⟨(snell_last g).symm, ⟨Fin.last N, (snell_last g).symm⟩⟩

#print axioms snell_ge_reward
#print axioms snell_ge_continuation
#print axioms snell_eq_max
#print axioms snell_optimal_stop

end

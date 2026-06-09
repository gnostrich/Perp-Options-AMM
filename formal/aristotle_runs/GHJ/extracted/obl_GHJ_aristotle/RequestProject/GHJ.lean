/-
  GH J / lossless routing (skew-J).
  GH trade = latent translation u ↦ u+δ (price coord scales by e^δ); one-parameter group; the reserve
  point stays ON the GH frontier (the conserved invariant is the latent parametrization, NOT X·Y).
  X,Y are arbitrary reserve-parametrizations of u; the group/frontier structure is independent of their
  closed form.
-/
import Mathlib

open Real

namespace GHJ

/-- a GH trade as a latent translation by rapidity δ. -/
def shift (δ : ℝ) : ℝ → ℝ := fun u => u + δ

/-- the price coordinate getMP_raw = P·e^u. -/
noncomputable def mp (P u : ℝ) : ℝ := P * Real.exp u

/-- the reserve point at latent u. -/
def pt (X Y : ℝ → ℝ) (u : ℝ) : ℝ × ℝ := (X u, Y u)

/-
a zero trade is the identity.
-/
theorem shift_zero : shift 0 = id := by
  exact funext fun x => by unfold shift; simp +decide ;

/-
GROUP LAW: trades compose additively in rapidity (one-parameter group).
-/
theorem shift_add (δ₁ δ₂ : ℝ) : shift δ₁ ∘ shift δ₂ = shift (δ₁ + δ₂) := by
  ext; simp [shift];
  ring

/-
the boost scales the price coordinate by e^δ (matches getMP_raw ↦ e^δ·getMP_raw).
-/
theorem mp_boost (P δ u : ℝ) : mp P (shift δ u) = Real.exp δ * mp P u := by
  unfold mp shift; rw [ mul_left_comm, ← Real.exp_add ] ;
  grind

/-
LOSSLESS ROUTING: a trade keeps the reserve point on the GH frontier (range of pt).
-/
theorem frontier_preserved (X Y : ℝ → ℝ) (δ u : ℝ) :
    ∃ u', pt X Y (shift δ u) = pt X Y u' := by
  exact ⟨ _, rfl ⟩

/-
the price coordinate is a faithful chart of u (so the latent group acts faithfully).
-/
theorem mp_strictMono {P : ℝ} (hP : 0 < P) : StrictMono (mp P) := by
  exact fun u v huv => mul_lt_mul_of_pos_left ( Real.exp_lt_exp.mpr huv ) hP

end GHJ
/-
  PH-6 — rebase preserves J and R (symplectomorphism).
  Rebase θ→θ/r (P→P/r, X→rX, α→rα) commutes with the trade boost on the price coordinate (J preserved)
  and leaves the slope-deviation quadratic form R·v² invariant via sNorm degree-0 invariance (R preserved).
-/
import RequestProject.Temporal

open Real

namespace PH6

/-
degree-0 seed: sNorm is rebase-invariant.
-/
theorem sNorm_rebase {r X α : ℝ} (hr : r ≠ 0) :
    Temporal.Barrier.sNorm (r * X) (r * α) = Temporal.Barrier.sNorm X α := by
  exact Temporal.Barrier.sNorm_rebase_invariant r X α hr

/-- rebased price coordinate mp = (P/r)·e^u. -/
noncomputable def mp_r (r P u : ℝ) : ℝ := (P / r) * Real.exp u

/-
J preserved: rebase commutes with the boost (e^δ·mp) on the price coordinate.
-/
theorem rebase_boost_commute {r P u δ : ℝ} (hr : r ≠ 0) :
    Real.exp δ * mp_r r P u = mp_r r P (u + δ) := by
  unfold mp_r; rw [ Real.exp_add ] ; ring;

/-
R preserved: the slope-deviation quadratic form is rebase-invariant (sNorm degree-0).
-/
theorem R_form_rebase_invariant {R r X α : ℝ} (hr : r ≠ 0) :
    R * (Real.log (Temporal.Barrier.sNorm (r*X) (r*α)))^2
      = R * (Real.log (Temporal.Barrier.sNorm X α))^2 := by
  rw [ PH6.sNorm_rebase hr ]

end PH6
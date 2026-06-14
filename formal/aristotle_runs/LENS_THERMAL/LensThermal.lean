import Mathlib
open Real
noncomputable section

/-- Minimal re-declaration of the live object's lens-relevant data (matches MonolithConstM). -/
structure LensAMM where
  beta  : ℝ
  y     : ℝ
  m     : ℝ
  hbeta : 0 < beta
  hy    : beta < y
  hm    : 0 < m

namespace LensAMM

/-- baseline convexity exponent γ = (y−β)/β (proven >0 elsewhere). -/
def gamma (P : LensAMM) : ℝ := (P.y - P.beta) / P.beta
/-- lensed local exponent g = m·γ, constant in strike. -/
def g (P : LensAMM) : ℝ := P.m * P.gamma

/-- option-value wing law as a power of spot S: value(S) = S^(−g). (Real.rpow) -/
def valuePow (P : LensAMM) (S : ℝ) : ℝ := S ^ (-(P.g))
/-- baseline (m=1) wing law value₁(S) = S^(−γ). -/
def valuePowBase (P : LensAMM) (S : ℝ) : ℝ := S ^ (-(P.gamma))
/-- the Gibbs/Boltzmann weight on the log-price axis q with inverse-temperature βT. -/
def gibbs (betaT q : ℝ) : ℝ := Real.exp (-(betaT) * q)

theorem gamma_pos (P : LensAMM) : 0 < P.gamma := by
  unfold gamma
  exact div_pos (by linarith [P.hy]) P.hbeta

theorem g_eq_m_gamma (P : LensAMM) : P.g = P.m * P.gamma := rfl

/-- THE THERMAL IDENTITY: on q = log S (S>0), the option-value power law equals the Gibbs
    weight at inverse-temperature βT = g = m·γ. -/
theorem value_is_gibbs (P : LensAMM) (S : ℝ) (hS : 0 < S) :
    P.valuePow S = gibbs P.g (Real.log S) := by
  unfold valuePow gibbs
  rw [Real.rpow_def_of_pos hS]
  ring_nf

/-- m is a THERMAL POWER: the lensed value is the baseline value raised to the m-th power
    (value_m = value_1^m), so m rescales the inverse-temperature multiplicatively. -/
theorem value_pow_m (P : LensAMM) (S : ℝ) (hS : 0 < S) :
    P.valuePow S = (P.valuePowBase S) ^ P.m := by
  unfold valuePow valuePowBase
  rw [← Real.rpow_mul hS.le]
  congr 1
  unfold g
  ring

/-- the inverse-temperature of the lensed Gibbs weight is exactly m times the baseline γ. -/
theorem invtemp_eq_m_gamma (P : LensAMM) : P.g = P.m * P.gamma := g_eq_m_gamma P

/-- m=1 recovers the plain baseline Gibbs weight (lens off ⇒ inverse-temp = γ). -/
theorem m_one_recovers_base (P : LensAMM) (hm1 : P.m = 1) (S : ℝ) (hS : 0 < S) :
    P.valuePow S = P.valuePowBase S := by
  unfold valuePow valuePowBase g
  rw [hm1, one_mul]

/-- steeper lens ⇒ colder (higher inverse-temperature): m≥1 ⇒ g ≥ γ. -/
theorem invtemp_mono (P : LensAMM) (hm : 1 ≤ P.m) : P.gamma ≤ P.g := by
  unfold g
  nlinarith [gamma_pos P, hm]

end LensAMM

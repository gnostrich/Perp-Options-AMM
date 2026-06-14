# Aristotle obligation — the constant-m lens is an inverse-temperature of the option-value Gibbs weight

**Toolchain (must match `lean-toolchain`): Lean 4.28.0 + Mathlib v4.28.0.**
**Project-dir: `formal/temporal_lean_verified`. Output: a single self-contained file
`RequestProject/LensThermal.lean`.**

## Context (do not change the pool curve)
The live object is the plain v24 Balancer constant-product AMM with the constant-m kurtosis lens
(operator entries 229/231). The POOL potential `μ(t)=(t−β)³/(3αβ)` is m-INDEPENDENT and must stay
so — do NOT introduce m into the pool. This obligation is about the SEPARATE **option-value**
(settlement/read) layer, whose wing law is the power law `value(S) ∝ S^(−g)` with the lensed local
exponent `g = m·γ` (constant in strike; `m=1` ⇒ plain).

The claim to formalize: **on the log-price axis `q = log S`, the option-value power law is a
Gibbs/Boltzmann weight `e^(−β_T·q)` whose inverse-temperature is exactly the lensed exponent
`β_T = g = m·γ`.** Hence the lens parameter `m` is an intrinsic inverse-temperature multiplier of
the option-value layer (a thermal rescaling of the baseline `β_T,0 = γ`), NOT an ad-hoc external
multiplier — without touching the pool curve.

## Definitions (pin these EXACTLY; re-declare a minimal slice, do not import the project modules)

```lean
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
```

## Proof targets (prove all; do NOT weaken any hypothesis or change any statement)

```lean
theorem gamma_pos (P : LensAMM) : 0 < P.gamma   -- div_pos, from hy/hbeta

theorem g_eq_m_gamma (P : LensAMM) : P.g = P.m * P.gamma   -- rfl/def

/-- THE THERMAL IDENTITY: on q = log S (S>0), the option-value power law equals the Gibbs
    weight at inverse-temperature βT = g = m·γ. -/
theorem value_is_gibbs (P : LensAMM) (S : ℝ) (hS : 0 < S) :
    P.valuePow S = gibbs P.g (Real.log S)
-- proof: S^(−g) = exp(log S · (−g)) = exp(−g · log S) via Real.rpow_def_of_pos / exp_log.

/-- m is a THERMAL POWER: the lensed value is the baseline value raised to the m-th power
    (value_m = value_1^m), so m rescales the inverse-temperature multiplicatively. -/
theorem value_pow_m (P : LensAMM) (S : ℝ) (hS : 0 < S) :
    P.valuePow S = (P.valuePowBase S) ^ P.m
-- proof: S^(−m·γ) = (S^(−γ))^m via Real.rpow_natCast?/Real.rpow_mul on positive base.

/-- the inverse-temperature of the lensed Gibbs weight is exactly m times the baseline γ. -/
theorem invtemp_eq_m_gamma (P : LensAMM) : P.g = P.m * P.gamma   -- = g_eq_m_gamma

/-- m=1 recovers the plain baseline Gibbs weight (lens off ⇒ inverse-temp = γ). -/
theorem m_one_recovers_base (P : LensAMM) (hm1 : P.m = 1) (S : ℝ) (hS : 0 < S) :
    P.valuePow S = P.valuePowBase S

/-- steeper lens ⇒ colder (higher inverse-temperature): m≥1 ⇒ g ≥ γ. -/
theorem invtemp_mono (P : LensAMM) (hm : 1 ≤ P.m) : P.gamma ≤ P.g
```

## Output spec
- One file `RequestProject/LensThermal.lean`, self-contained (`import Mathlib` only), compiling
  under Lean 4.28.0 / Mathlib v4.28.0.
- Do NOT edit any other module in the project. Do NOT add `sorry`/`admit`/`axiom` decls/
  `native_decide`/`sorryAx`/`opaque`/`unsafe`. Kernel `decide` is acceptable.
- Provide `#print axioms` for each named theorem in `ARISTOTLE_SUMMARY.md`; they must be ⊆
  `{propext, Classical.choice, Quot.sound}`.
- Do NOT introduce `m` into any pool-potential definition; `valuePow`/`valuePowBase`/`gibbs` are the
  ONLY new option-value objects. The structure fields are exactly the 6 above — do not add/remove.

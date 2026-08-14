/-
BURR2_CORE — the Burr-II / t-family option kernel: parity, the ATM peg, the zero-strike
anchor, and the sign/order structure.

WHAT THIS IS. The pricer is a two-wing construction on the Burr-II (t-family) survival
kernel.  For a wing scale `s > 0`, shoulder `a > 0` and tail `γ > 0`:

    Δ_s(v) = (1 + (v/s)^a)^(-(γ+1)/a)                              [the wing kernel]

and the WING VALUE at moneyness `m ≥ 0` is the tail integral `∫_m^∞ Δ_s`.  That integral
has the closed form used by the production spreadsheet

    T_s(m) = (s/a) · Β(1/a, γ/a) · (1 - I_u(1/a, γ/a)),   u = 1/(1 + (s/m)^a)

with `Β` the beta function and `I_x` the REGULARIZED INCOMPLETE BETA.  (Verified
numerically against the integral to 7e-14 before this file was written.)

FORMALISATION ROUTE — stated up front, because it is the honest scope of the result.
Mathlib has no usable regularized-incomplete-beta API, so `I_x(1/a, γ/a)` is carried as a
FIELD `ibeta : ℝ → ℝ` of the parameter structure, together with ONLY the properties that
are actually used: `ibeta 0 = 0`, `ibeta 1 = 1`, monotone on `[0,1]`, valued in `[0,1]`.
Everything else — `sR, sL, G1, I1, WR, WL, qR, qL, A_R, A_L, CALL, PUT` — is transcribed
LITERALLY from the spreadsheet.  So §1–§3 below are theorems about the actual production
formulas, conditional on nothing but those four facts about `I`.  §4 ("Layer 2") needs one
further, clearly isolated bridge — that `T_s` really is the tail integral of `Δ_s` — which
is carried as the structure `TailRep` (a two-sided Riemann sandwich on increments) and is
proved NON-VACUOUS by an explicit instance in §5.

ONE FORMALISATION HAZARD, HANDLED. The sheet writes `u = 1/(1+(s/m)^a)`, which at `m = 0`
is a `0`-division whose Lean junk value (`s/0 = 0`, `0^a = 0`, hence `u = 1`) is the WRONG
limit — it would send the at-the-money value to `0` and silently destroy the ATM target.
`uArg` is therefore defined in the algebraically equal, junk-safe form `m^a/(m^a + s^a)`,
and `uArg_eq_sheet` PROVES the two agree for `m > 0`.  Do not "simplify" it back.

WHAT IS TO BE PROVED.
  §1 sheet correspondence: `uArg_eq_sheet`, `tail_zero`, `G1_pos`, `G1_lt_one`.
  §2 `burr2_parity` : `CALL k - PUT k = -k` at EVERY strike — the load-bearing property of
     the ITM extension.  Away from the money it is pure branch bookkeeping
     (`burr2_parity_of_ne`, no hypotheses at all); AT the money it is exactly the wing peg,
     which is why `atm_wings_meet` is a genuine input and not decoration.
  §3 `atm_wings_meet` (the peg `qR = WL/(WR+WL)` makes the two wings agree at `k = 0`),
     `call_at_zero_strike` / `put_at_zero_strike` (`K = 0` ⇒ the call is the whole coin),
     and `AL_glue` (the `|k| ≥ 1` cutoff is CONTINUOUS — the closed form vanishes there of
     its own accord, so the anchor is not an artefact of the `if`).
  §4 Layer 2 — sign and order: wings non-negative, `CALL` antitone, `PUT` monotone.
  §5 `TailRep` non-vacuity witness (a = γ = 1, `ibeta = id`), so §4 is not vacuous.
  §6 apportionment: harmonic shares sum to one and conserve revenue.

TOOLCHAIN: Lean 4.28.0, Mathlib v4.28.0.
-/
import Mathlib.Analysis.SpecialFunctions.Pow.Real
import Mathlib.Analysis.SpecialFunctions.Log.Basic
import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Tactic

noncomputable section
open scoped BigOperators

namespace Burr2

/-! ## §0  Parameters

`a` shoulder, `γ` tail, `Sbar` level, `κ` skew, `B = Β(1/a, γ/a)`, and `ibeta x = I_x(1/a, γ/a)`.
The last is the carried special function (see the header): a FIELD, not an `axiom`. -/

structure Params where
  a : ℝ
  γ : ℝ
  Sbar : ℝ
  κ : ℝ
  B : ℝ
  ibeta : ℝ → ℝ
  ha : 0 < a
  hγ : 0 < γ
  hSbar : 0 < Sbar
  hκ : |κ| < 1
  hB : 0 < B
  ibeta_zero : ibeta 0 = 0
  ibeta_one : ibeta 1 = 1
  ibeta_mono : ∀ x y : ℝ, 0 ≤ x → x ≤ y → y ≤ 1 → ibeta x ≤ ibeta y
  ibeta_nonneg : ∀ x : ℝ, 0 ≤ x → x ≤ 1 → 0 ≤ ibeta x
  ibeta_le_one : ∀ x : ℝ, 0 ≤ x → x ≤ 1 → ibeta x ≤ 1

variable (p : Params)

/-- right (call) wing scale `sR = S̄(1+κ)`. -/
def sR : ℝ := p.Sbar * (1 + p.κ)

/-- left (put) wing scale `sL = S̄(1-κ)`. -/
def sL : ℝ := p.Sbar * (1 - p.κ)

/-- the Burr-II / t-family wing kernel `Δ_s(v) = (1 + (v/s)^a)^(-(γ+1)/a)`. -/
def kern (s v : ℝ) : ℝ := (1 + (v / s) ^ p.a) ^ (-(p.γ + 1) / p.a)

/-- the incomplete-beta argument.  Junk-safe form of the sheet's `1/(1+(s/m)^a)`;
see `uArg_eq_sheet`. -/
def uArg (s m : ℝ) : ℝ := m ^ p.a / (m ^ p.a + s ^ p.a)

/-- the wing value `T_s(m) = (s/a)·B·(1 - I_u)`, i.e. the tail integral `∫_m^∞ Δ_s`. -/
def tail (s m : ℝ) : ℝ := (s / p.a) * p.B * (1 - p.ibeta (uArg p s m))

/-- `G1 = Δ_{sL}(1)`: the left kernel at the zero-strike edge (the "pedestal"). -/
def G1 : ℝ := kern p (sL p) 1

/-- `I1 = T_{sL}(1)`: the part of the left wing beyond the zero-strike edge. -/
def I1 : ℝ := tail p (sL p) 1

/-- total right wing mass `WR = sR·B/a`. -/
def WR : ℝ := sR p * p.B / p.a

/-- total left wing mass `WL = (sL·B/a - I1 - G1)/(1 - G1)` (truncated at `K = 0`
and de-pedestalled). -/
def WL : ℝ := (sL p * p.B / p.a - I1 p - G1 p) / (1 - G1 p)

/-- THE PEG.  `qR = WL/(WR+WL)` — derived, not chosen; it is what makes the wings meet. -/
def qR : ℝ := WL p / (WR p + WL p)

/-- `qL = 1 - qR`. -/
def qL : ℝ := 1 - qR p

/-- right wing value at moneyness `|k|`. -/
def AR (k : ℝ) : ℝ := qR p * tail p (sR p) |k|

/-- left wing value as a function of the modulus; `0` past the zero-strike edge. -/
def ALm (m : ℝ) : ℝ :=
  if 1 ≤ m then 0
  else qL p / (1 - G1 p) * (tail p (sL p) m - I1 p - G1 p * (1 - m))

/-- left wing value at moneyness `|k|`. -/
def AL (k : ℝ) : ℝ := ALm p |k|

/-- the call.  OTM (`k ≥ 0`) it is the right wing; ITM it is intrinsic `-k` plus the
MIRROR wing — put–call parity, not smooth pasting. -/
def CALL (k : ℝ) : ℝ := if 0 ≤ k then AR p k else -k + AL p k

/-- the put.  OTM (`k ≤ 0`) it is the left wing; ITM it is intrinsic `k` plus the mirror. -/
def PUT (k : ℝ) : ℝ := if k ≤ 0 then AL p k else k + AR p k

/-! ## §1  Sheet correspondence and basic positivity -/

theorem sR_pos : 0 < sR p := by sorry

theorem sL_pos : 0 < sL p := by sorry

/-- the junk-safe `uArg` IS the sheet's `1/(1+(s/m)^a)` wherever the sheet's form is defined. -/
theorem uArg_eq_sheet {s m : ℝ} (hs : 0 < s) (hm : 0 < m) :
    uArg p s m = 1 / (1 + (s / m) ^ p.a) := by sorry

/-- at the money the wing value is the FULL mass (this is the identity the junk value would
have broken). -/
theorem tail_zero {s : ℝ} (hs : 0 < s) : tail p s 0 = s * p.B / p.a := by sorry

theorem tail_zero_R : tail p (sR p) 0 = WR p := by sorry

theorem G1_pos : 0 < G1 p := by sorry

theorem G1_lt_one : G1 p < 1 := by sorry

theorem AR_zero : AR p 0 = qR p * WR p := by sorry

theorem AL_zero : AL p 0 = qL p * WL p := by sorry

theorem qR_add_qL : qR p + qL p = 1 := by sorry

/-! ## §2  Put–call parity — the load-bearing property of the ITM extension -/

/-- Away from the money, parity is pure branch bookkeeping: NO hypotheses. -/
theorem burr2_parity_of_ne {k : ℝ} (hk : k ≠ 0) : CALL p k - PUT p k = -k := by sorry

/-- AT the money, parity IS the wing peg. -/
theorem atm_wings_meet (h : WR p + WL p ≠ 0) : AR p 0 = AL p 0 := by sorry

/-- **TARGET 1.**  `CALL k - PUT k = -k` at every strike. -/
theorem burr2_parity (h : WR p + WL p ≠ 0) (k : ℝ) : CALL p k - PUT p k = -k := by sorry

/-! ## §3  The zero-strike anchor, and the cutoff is continuous -/

/-- the left wing's CLOSED FORM already vanishes at the zero-strike edge `|k| = 1`, so the
`if 1 ≤ m` cutoff introduces no jump; the anchor below is a fact about the formula, not an
artefact of the branch. -/
theorem AL_glue : tail p (sL p) 1 - I1 p - G1 p * (1 - 1) = 0 := by sorry

/-- **TARGET 3a.**  The call struck at `K = 0` (`k = -1`) is the whole coin. -/
theorem call_at_zero_strike : CALL p (-1) = 1 := by sorry

/-- **TARGET 3b.**  The put struck at `K = 0` is worthless. -/
theorem put_at_zero_strike : PUT p (-1) = 0 := by sorry

/-! ## §4  Layer 2 — sign and order

`TailRep p s` is the ONE analytic bridge: it says `tail p s ·` behaves like the tail integral
of the antitone kernel `kern p s ·`, by sandwiching each increment between the kernel's
endpoint values.  Nothing else about the incomplete beta is used, and §5 exhibits an instance
so that none of the following is vacuous. -/

structure TailRep (s : ℝ) : Prop where
  lower : ∀ m m' : ℝ, 0 ≤ m → m ≤ m' → (m' - m) * kern p s m' ≤ tail p s m - tail p s m'
  upper : ∀ m m' : ℝ, 0 ≤ m → m ≤ m' → tail p s m - tail p s m' ≤ (m' - m) * kern p s m

theorem kern_pos {s v : ℝ} (hs : 0 < s) (hv : 0 ≤ v) : 0 < kern p s v := by sorry

theorem kern_le_one {s v : ℝ} (hs : 0 < s) (hv : 0 ≤ v) : kern p s v ≤ 1 := by sorry

theorem kern_antitone {s v w : ℝ} (hs : 0 < s) (hv : 0 ≤ v) (hvw : v ≤ w) :
    kern p s w ≤ kern p s v := by sorry

theorem tail_antitone {s m m' : ℝ} (h : TailRep p s) (hm : 0 ≤ m) (hmm : m ≤ m') :
    tail p s m' ≤ tail p s m := by sorry

theorem WR_pos : 0 < WR p := by sorry

/-- the left wing mass is non-negative — the kernel sits above its own pedestal `G1` on
`[0,1]`, which is exactly one instance of the sandwich. -/
theorem WL_nonneg (hL : TailRep p (sL p)) : 0 ≤ WL p := by sorry

theorem qR_nonneg (hL : TailRep p (sL p)) : 0 ≤ qR p := by sorry

theorem qR_le_one (hL : TailRep p (sL p)) : qR p ≤ 1 := by sorry

theorem qL_nonneg (hL : TailRep p (sL p)) : 0 ≤ qL p := by sorry

theorem qL_le_one (hL : TailRep p (sL p)) : qL p ≤ 1 := by sorry

/-- **TARGET 4a.** -/
theorem AR_nonneg (hL : TailRep p (sL p)) (k : ℝ) : 0 ≤ AR p k := by sorry

/-- **TARGET 4b.** -/
theorem AL_nonneg (hL : TailRep p (sL p)) (k : ℝ) : 0 ≤ AL p k := by sorry

theorem CALL_nonneg (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) (k : ℝ) :
    0 ≤ CALL p k := by sorry

theorem PUT_nonneg (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) (k : ℝ) :
    0 ≤ PUT p k := by sorry

/-- the left wing never falls faster than one-for-one in the modulus (its slope is bounded
by `qL ≤ 1`) — this is what keeps the ITM branch `-k + A_L` monotone. -/
theorem ALm_lipschitz (hL : TailRep p (sL p)) {m m' : ℝ} (hm : 0 ≤ m) (hmm : m ≤ m') :
    ALm p m - ALm p m' ≤ qL p * (m' - m) := by sorry

theorem ALm_antitone (hL : TailRep p (sL p)) {m m' : ℝ} (hm : 0 ≤ m) (hmm : m ≤ m') :
    ALm p m' ≤ ALm p m := by sorry

/-- **TARGET 4c.**  The call is decreasing in moneyness, across BOTH branches. -/
theorem CALL_antitone (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) {k k' : ℝ}
    (hkk : k ≤ k') : CALL p k' ≤ CALL p k := by sorry

/-- the call never falls faster than one-for-one — equivalently (by parity) the put is
increasing. -/
theorem CALL_lipschitz (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) {k k' : ℝ}
    (hkk : k ≤ k') : CALL p k - CALL p k' ≤ k' - k := by sorry

/-- **TARGET 4d.**  The put is increasing in moneyness. -/
theorem PUT_monotone (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) {k k' : ℝ}
    (hkk : k ≤ k') : PUT p k ≤ PUT p k' := by sorry

end Burr2

/-! ## §5  Non-vacuity of `TailRep`

An explicit member of the family for which the sandwich holds, so §4 is not vacuous:
`a = γ = 1`, `B = Β(1,1) = 1`, `ibeta = id` (indeed `I_x(1,1) = x`).  There
`tail s m = s²/(s+m)` and `kern s v = (1+v/s)^(-2)`, and the sandwich is the elementary
`1/((s+m)(s+m')) ` lying between `1/(s+m')²` and `1/(s+m)²`. -/

namespace Burr2Witness

open Burr2

/-- the witness parameter set. -/
def pw (Sbar : ℝ) (hS : 0 < Sbar) : Params where
  a := 1
  γ := 1
  Sbar := Sbar
  κ := 0
  B := 1
  ibeta := id
  ha := one_pos
  hγ := one_pos
  hSbar := hS
  hκ := by norm_num
  hB := one_pos
  ibeta_zero := rfl
  ibeta_one := rfl
  ibeta_mono := by intro x y _ h _; exact h
  ibeta_nonneg := by intro x hx _; exact hx
  ibeta_le_one := by intro x _ hx; exact hx

theorem tail_witness {Sbar : ℝ} (hS : 0 < Sbar) {s m : ℝ} (hs : 0 < s) (hm : 0 ≤ m) :
    tail (pw Sbar hS) s m = s * s / (s + m) := by sorry

/-- **TARGET 5 (guard).**  `TailRep` is satisfiable: §4 is not vacuous. -/
theorem tailRep_witness {Sbar : ℝ} (hS : 0 < Sbar) {s : ℝ} (hs : 0 < s) :
    TailRep (pw Sbar hS) s := by sorry

end Burr2Witness

/-! ## §6  Apportionment

Depth-only aggregation: LP `i` posts impact `λ i`, the pool aggregates harmonically
(`1/λ_agg = Σ 1/λ i`) and each LP fills the share `w i = (1/λ i)/Σ(1/λ j)` at the SAME
price.  These are the workbook's B5/B6 invariants: the split creates and destroys nothing. -/

namespace Apportion

variable {n : ℕ} (lam : Fin n → ℝ)

/-- `Σ 1/λ i`. -/
def invSum : ℝ := ∑ i, (lam i)⁻¹

/-- aggregate impact, harmonic: `1/λ_agg = Σ 1/λ i`. -/
def lamAgg : ℝ := (invSum lam)⁻¹

/-- LP `i`'s share of a fill. -/
def share (i : Fin n) : ℝ := (lam i)⁻¹ / invSum lam

theorem harmonic_law (h : invSum lam ≠ 0) : (lamAgg lam)⁻¹ = invSum lam := by sorry

/-- **TARGET 5a.**  Shares sum to one. -/
theorem shares_sum_one (h : invSum lam ≠ 0) : ∑ i, share lam i = 1 := by sorry

theorem share_eq_agg_ratio (h : invSum lam ≠ 0) (i : Fin n) :
    share lam i = lamAgg lam / lam i := by sorry

theorem share_nonneg (h : 0 < invSum lam) (hl : ∀ i, 0 < lam i) (i : Fin n) :
    0 ≤ share lam i := by sorry

/-- **TARGET 5b.**  The apportioned revenue is exactly the pool's revenue: the split
creates nothing and destroys nothing. -/
theorem apportionment_conserves (h : invSum lam ≠ 0) (s Q P : ℝ) :
    ∑ i, share lam i * (s * Q * P) = s * Q * P := by sorry

end Apportion

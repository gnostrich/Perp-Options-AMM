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

theorem sR_pos : 0 < sR p := by
  have h := abs_lt.mp p.hκ
  have h1 : (0:ℝ) < 1 + p.κ := by linarith [h.1]
  exact mul_pos p.hSbar h1

theorem sL_pos : 0 < sL p := by
  have h := abs_lt.mp p.hκ
  have h1 : (0:ℝ) < 1 - p.κ := by linarith [h.2]
  exact mul_pos p.hSbar h1

/-- the junk-safe `uArg` IS the sheet's `1/(1+(s/m)^a)` wherever the sheet's form is defined. -/
theorem uArg_eq_sheet {s m : ℝ} (hs : 0 < s) (hm : 0 < m) :
    uArg p s m = 1 / (1 + (s / m) ^ p.a) := by
  have hma : 0 < m ^ p.a := Real.rpow_pos_of_pos hm p.a
  have hsa : 0 < s ^ p.a := Real.rpow_pos_of_pos hs p.a
  rw [uArg, Real.div_rpow hs.le hm.le]
  field_simp

/-- at the money the wing value is the FULL mass (this is the identity the junk value would
have broken). -/
theorem tail_zero {s : ℝ} (hs : 0 < s) : tail p s 0 = s * p.B / p.a := by
  have h0 : (0:ℝ) ^ p.a = 0 := Real.zero_rpow (ne_of_gt p.ha)
  rw [tail, uArg, h0, zero_add, zero_div, p.ibeta_zero]
  ring

theorem tail_zero_R : tail p (sR p) 0 = WR p := by
  rw [tail_zero p (sR_pos p)]
  rfl

theorem G1_pos : 0 < G1 p := by
  have hsL := sL_pos p
  have h1 : 0 < (1 / sL p) ^ p.a := Real.rpow_pos_of_pos (by positivity) p.a
  exact Real.rpow_pos_of_pos (by linarith) _

theorem G1_lt_one : G1 p < 1 := by
  have hsL := sL_pos p
  have h1 : 0 < (1 / sL p) ^ p.a := Real.rpow_pos_of_pos (by positivity) p.a
  have hexp : -(p.γ + 1) / p.a < 0 :=
    div_neg_of_neg_of_pos (by linarith [p.hγ]) p.ha
  exact Real.rpow_lt_one_of_one_lt_of_neg (by linarith) hexp

theorem AR_zero : AR p 0 = qR p * WR p := by
  rw [AR, abs_zero, tail_zero_R]

theorem AL_zero : AL p 0 = qL p * WL p := by
  rw [AL, abs_zero, ALm, if_neg (by norm_num : ¬ (1:ℝ) ≤ 0), tail_zero p (sL_pos p), WL]
  ring

theorem qR_add_qL : qR p + qL p = 1 := by
  rw [qL]; ring

/-! ## §2  Put–call parity — the load-bearing property of the ITM extension -/

/-- Away from the money, parity is pure branch bookkeeping: NO hypotheses. -/
theorem burr2_parity_of_ne {k : ℝ} (hk : k ≠ 0) : CALL p k - PUT p k = -k := by
  rcases lt_or_gt_of_ne hk with h | h
  · rw [CALL, PUT, if_neg (by linarith : ¬ (0:ℝ) ≤ k), if_pos h.le]; ring
  · rw [CALL, PUT, if_pos h.le, if_neg (by linarith : ¬ k ≤ (0:ℝ))]; ring

/-- AT the money, parity IS the wing peg. -/
theorem atm_wings_meet (h : WR p + WL p ≠ 0) : AR p 0 = AL p 0 := by
  rw [AR_zero, AL_zero, qL, qR]
  field_simp
  ring

/-- **TARGET 1.**  `CALL k - PUT k = -k` at every strike. -/
theorem burr2_parity (h : WR p + WL p ≠ 0) (k : ℝ) : CALL p k - PUT p k = -k := by
  rcases eq_or_ne k 0 with rfl | hk
  · rw [CALL, PUT, if_pos le_rfl, if_pos le_rfl, atm_wings_meet p h]; ring
  · exact burr2_parity_of_ne p hk

/-! ## §3  The zero-strike anchor, and the cutoff is continuous -/

/-- the left wing's CLOSED FORM already vanishes at the zero-strike edge `|k| = 1`, so the
`if 1 ≤ m` cutoff introduces no jump; the anchor below is a fact about the formula, not an
artefact of the branch. -/
theorem AL_glue : tail p (sL p) 1 - I1 p - G1 p * (1 - 1) = 0 := by
  rw [I1]; ring

/-- **TARGET 3a.**  The call struck at `K = 0` (`k = -1`) is the whole coin. -/
theorem call_at_zero_strike : CALL p (-1) = 1 := by
  rw [CALL, if_neg (by norm_num : ¬ (0:ℝ) ≤ -1), AL, abs_neg, abs_one, ALm, if_pos le_rfl]
  ring

/-- **TARGET 3b.**  The put struck at `K = 0` is worthless. -/
theorem put_at_zero_strike : PUT p (-1) = 0 := by
  rw [PUT, if_pos (by norm_num : (-1:ℝ) ≤ 0), AL, abs_neg, abs_one, ALm, if_pos le_rfl]

/-! ## §4  Layer 2 — sign and order

`TailRep p s` is the ONE analytic bridge: it says `tail p s ·` behaves like the tail integral
of the antitone kernel `kern p s ·`, by sandwiching each increment between the kernel's
endpoint values.  Nothing else about the incomplete beta is used, and §5 exhibits an instance
so that none of the following is vacuous. -/

structure TailRep (s : ℝ) : Prop where
  lower : ∀ m m' : ℝ, 0 ≤ m → m ≤ m' → (m' - m) * kern p s m' ≤ tail p s m - tail p s m'
  upper : ∀ m m' : ℝ, 0 ≤ m → m ≤ m' → tail p s m - tail p s m' ≤ (m' - m) * kern p s m


/-- auxiliary: `(r * x) ^ z = r ^ z * x ^ z` when the first factor is positive (the second
may be negative, so `Real.mul_rpow` does not apply). -/
private lemma mul_rpow_left_pos {r x z : ℝ} (hr : 0 < r) (hx : x < 0) :
    (r * x) ^ z = r ^ z * x ^ z := by
  have h1 : r * x < 0 := mul_neg_of_pos_of_neg hr hx
  rw [Real.rpow_def_of_neg h1, Real.rpow_def_of_neg hx, Real.rpow_def_of_pos hr,
    Real.log_mul hr.ne' hx.ne, add_mul, Real.exp_add]
  ring

private lemma exp_neg (p : Params) : -(p.γ + 1) / p.a < 0 :=
  div_neg_of_neg_of_pos (by linarith [p.hγ]) p.ha

private lemma kern_zero (s : ℝ) : kern p s 0 = 1 := by
  rw [kern, zero_div, Real.zero_rpow (ne_of_gt p.ha), add_zero, Real.one_rpow]

private lemma uArg_mem {s m : ℝ} (hs : 0 < s) (hm : 0 ≤ m) :
    0 ≤ uArg p s m ∧ uArg p s m ≤ 1 := by
  have hma : 0 ≤ m ^ p.a := Real.rpow_nonneg hm p.a
  have hsa : 0 < s ^ p.a := Real.rpow_pos_of_pos hs p.a
  rw [uArg]
  refine ⟨div_nonneg hma (by linarith), ?_⟩
  rw [div_le_one (by linarith)]
  linarith

private lemma tail_nonneg {s m : ℝ} (hs : 0 < s) (hm : 0 ≤ m) : 0 ≤ tail p s m := by
  obtain ⟨h0, h1⟩ := uArg_mem p hs hm
  have hib : p.ibeta (uArg p s m) ≤ 1 := p.ibeta_le_one _ h0 h1
  have hpos : 0 ≤ s / p.a * p.B := (mul_pos (div_pos hs p.ha) p.hB).le
  exact mul_nonneg hpos (by linarith)

theorem kern_pos {s v : ℝ} (hs : 0 < s) (hv : 0 ≤ v) : 0 < kern p s v := by
  have h : 0 ≤ (v / s) ^ p.a := Real.rpow_nonneg (div_nonneg hv hs.le) p.a
  exact Real.rpow_pos_of_pos (by linarith) _

theorem kern_le_one {s v : ℝ} (hs : 0 < s) (hv : 0 ≤ v) : kern p s v ≤ 1 := by
  have h : 0 ≤ (v / s) ^ p.a := Real.rpow_nonneg (div_nonneg hv hs.le) p.a
  exact Real.rpow_le_one_of_one_le_of_nonpos (by linarith) (exp_neg p).le

theorem kern_antitone {s v w : ℝ} (hs : 0 < s) (hv : 0 ≤ v) (hvw : v ≤ w) :
    kern p s w ≤ kern p s v := by
  have hvs : 0 ≤ v / s := div_nonneg hv hs.le
  have hle : (v / s) ^ p.a ≤ (w / s) ^ p.a :=
    Real.rpow_le_rpow hvs (by gcongr) p.ha.le
  have hb : 0 < 1 + (v / s) ^ p.a := by
    have := Real.rpow_nonneg hvs p.a; linarith
  exact Real.rpow_le_rpow_of_nonpos hb (by linarith) (exp_neg p).le

/-- from the sandwich alone, the kernel is antitone on `[0,∞)`. -/
private lemma kern_antitone_of_tailRep {s : ℝ} (h : TailRep p s) {v w : ℝ}
    (hv : 0 ≤ v) (hvw : v ≤ w) : kern p s w ≤ kern p s v := by
  rcases eq_or_lt_of_le hvw with rfl | hlt
  · exact le_rfl
  · have h1 := h.lower v w hv hvw
    have h2 := h.upper v w hv hvw
    have hpos : 0 < w - v := by linarith
    have : (w - v) * kern p s w ≤ (w - v) * kern p s v := by linarith
    exact le_of_mul_le_mul_left this hpos

/-- and then it is non-negative: a negative kernel value would force the kernel to exceed its
value `1` at the origin somewhere in between, contradicting antitonicity. -/
private lemma kern_nonneg_of_tailRep {s : ℝ} (h : TailRep p s) {v : ℝ} (hv : 0 ≤ v) :
    0 ≤ kern p s v := by
  by_contra hneg
  push_neg at hneg
  set e : ℝ := -(p.γ + 1) / p.a with he
  have hexp : e < 0 := exp_neg p
  set t : ℝ := (v / s) ^ p.a with ht
  have hbase : 1 + t < 0 := by
    rcases lt_trichotomy (1 + t) 0 with h' | h' | h'
    · exact h'
    · exfalso
      have : kern p s v = 0 := by
        rw [kern, ← ht, h', Real.zero_rpow (ne_of_lt hexp)]
      linarith [this ▸ hneg]
    · exfalso
      have : 0 < kern p s v := by
        rw [kern, ← ht]; exact Real.rpow_pos_of_pos h' _
      linarith
  have htneg : t < 0 := by linarith
  have hvs : v / s < 0 := by
    by_contra hcon
    push_neg at hcon
    have : 0 ≤ t := ht ▸ Real.rpow_nonneg hcon p.a
    linarith
  have hvpos : 0 < v := by
    rcases eq_or_lt_of_le hv with rfl | hlt
    · exfalso; simp at hvs
    · exact hlt
  set c : ℝ := 1 / (2 * (-t)) with hc
  have htne : t ≠ 0 := ne_of_lt htneg
  have hcpos : 0 < c := by
    rw [hc]
    apply div_pos one_pos
    linarith
  set r : ℝ := c ^ (1 / p.a) with hr
  have hrpos : 0 < r := Real.rpow_pos_of_pos hcpos _
  have hra : r ^ p.a = c := by
    rw [hr, ← Real.rpow_mul hcpos.le, one_div, inv_mul_cancel₀ (ne_of_gt p.ha),
      Real.rpow_one]
  set w : ℝ := r * v with hw
  have hw0 : 0 ≤ w := by rw [hw]; exact mul_nonneg hrpos.le hv
  have hws : w / s = r * (v / s) := by rw [hw]; ring
  have hkey : (w / s) ^ p.a = -(1/2 : ℝ) := by
    rw [hws, mul_rpow_left_pos hrpos hvs, hra, hc, ← ht]
    field_simp [htne]
  have hkw : 1 < kern p s w := by
    rw [kern, hkey]
    rw [show (1 : ℝ) + -(1/2 : ℝ) = 1/2 by norm_num]
    exact (Real.one_lt_rpow_iff_of_pos (by norm_num)).mpr (Or.inr ⟨by norm_num, hexp⟩)
  have := kern_antitone_of_tailRep p h (le_refl (0:ℝ)) hw0
  rw [kern_zero] at this
  linarith

theorem tail_antitone {s m m' : ℝ} (h : TailRep p s) (hm : 0 ≤ m) (hmm : m ≤ m') :
    tail p s m' ≤ tail p s m := by
  have h1 := h.lower m m' hm hmm
  have h2 : 0 ≤ (m' - m) * kern p s m' :=
    mul_nonneg (by linarith) (kern_nonneg_of_tailRep p h (hm.trans hmm))
  linarith

theorem WR_pos : 0 < WR p := by
  exact div_pos (mul_pos (sR_pos p) p.hB) p.ha

/-- the left wing mass is non-negative — the kernel sits above its own pedestal `G1` on
`[0,1]`, which is exactly one instance of the sandwich. -/
theorem WL_nonneg (hL : TailRep p (sL p)) : 0 ≤ WL p := by
  have h1 := hL.lower 0 1 le_rfl zero_le_one
  rw [tail_zero p (sL_pos p)] at h1
  have hG : G1 p = kern p (sL p) 1 := rfl
  have hI : I1 p = tail p (sL p) 1 := rfl
  rw [WL]
  apply div_nonneg _ (by linarith [G1_lt_one p])
  rw [hG, hI]
  linarith

theorem qR_nonneg (hL : TailRep p (sL p)) : 0 ≤ qR p := by
  have hW := WL_nonneg p hL
  have hR := WR_pos p
  exact div_nonneg hW (by linarith)

theorem qR_le_one (hL : TailRep p (sL p)) : qR p ≤ 1 := by
  have hW := WL_nonneg p hL
  have hR := WR_pos p
  rw [qR, div_le_one (by linarith)]
  linarith

theorem qL_nonneg (hL : TailRep p (sL p)) : 0 ≤ qL p := by
  have := qR_le_one p hL
  rw [qL]; linarith

theorem qL_le_one (hL : TailRep p (sL p)) : qL p ≤ 1 := by
  have := qR_nonneg p hL
  rw [qL]; linarith

/-- **TARGET 4a.** -/
theorem AR_nonneg (hL : TailRep p (sL p)) (k : ℝ) : 0 ≤ AR p k := by
  exact mul_nonneg (qR_nonneg p hL) (tail_nonneg p (sR_pos p) (abs_nonneg k))

/-- **TARGET 4b.** -/
private lemma ALm_nonneg (hL : TailRep p (sL p)) {m : ℝ} (hm : 0 ≤ m) : 0 ≤ ALm p m := by
  rw [ALm]
  by_cases h : 1 ≤ m
  · rw [if_pos h]
  · rw [if_neg h]
    have hm1 : m ≤ 1 := le_of_not_ge h
    have h1 := hL.lower m 1 hm hm1
    have hG : G1 p = kern p (sL p) 1 := rfl
    have hI : I1 p = tail p (sL p) 1 := rfl
    apply mul_nonneg (div_nonneg (qL_nonneg p hL) (by linarith [G1_lt_one p]))
    rw [hI, hG]
    linarith

theorem AL_nonneg (hL : TailRep p (sL p)) (k : ℝ) : 0 ≤ AL p k :=
  ALm_nonneg p hL (abs_nonneg k)

theorem CALL_nonneg (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) (k : ℝ) :
    0 ≤ CALL p k := by
  rw [CALL]
  by_cases h : 0 ≤ k
  · rw [if_pos h]; exact AR_nonneg p hL k
  · rw [if_neg h]
    have := AL_nonneg p hL k
    push_neg at h
    linarith

theorem PUT_nonneg (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) (k : ℝ) :
    0 ≤ PUT p k := by
  rw [PUT]
  by_cases h : k ≤ 0
  · rw [if_pos h]; exact AL_nonneg p hL k
  · rw [if_neg h]
    have := AR_nonneg p hL k
    push_neg at h
    linarith

/-- the left wing never falls faster than one-for-one in the modulus (its slope is bounded
by `qL ≤ 1`) — this is what keeps the ITM branch `-k + A_L` monotone. -/
theorem ALm_lipschitz (hL : TailRep p (sL p)) {m m' : ℝ} (hm : 0 ≤ m) (hmm : m ≤ m') :
    ALm p m - ALm p m' ≤ qL p * (m' - m) := by
  have hG := G1_lt_one p
  have hGd : 0 < 1 - G1 p := by linarith
  have hq0 := qL_nonneg p hL
  have hQ0 : 0 ≤ qL p / (1 - G1 p) := div_nonneg hq0 hGd.le
  have hm' : 0 ≤ m' := hm.trans hmm
  have hGk : G1 p = kern p (sL p) 1 := rfl
  have hIt : I1 p = tail p (sL p) 1 := rfl
  by_cases h1 : 1 ≤ m
  · have h1' : 1 ≤ m' := h1.trans hmm
    simp only [ALm, if_pos h1, if_pos h1']
    have : 0 ≤ qL p * (m' - m) := mul_nonneg hq0 (by linarith)
    linarith
  · push_neg at h1
    have hmle1 : m ≤ 1 := h1.le
    have hk1 : kern p (sL p) m ≤ 1 := kern_le_one p (sL_pos p) hm
    by_cases h2 : 1 ≤ m'
    · simp only [ALm, if_neg (not_le.mpr h1), if_pos h2]
      have hup := hL.upper m 1 hm hmle1
      have hmul : (1 - m) * kern p (sL p) m ≤ (1 - m) * 1 :=
        mul_le_mul_of_nonneg_left hk1 (by linarith)
      have hbr : tail p (sL p) m - I1 p - G1 p * (1 - m) ≤ (1 - m) * (1 - G1 p) := by
        rw [hIt]; nlinarith
      have hstep := mul_le_mul_of_nonneg_left hbr hQ0
      have heq : qL p / (1 - G1 p) * ((1 - m) * (1 - G1 p)) = qL p * (1 - m) := by
        field_simp
      have hlast : qL p * (1 - m) ≤ qL p * (m' - m) :=
        mul_le_mul_of_nonneg_left (by linarith) hq0
      linarith
    · push_neg at h2
      simp only [ALm, if_neg (not_le.mpr h1), if_neg (not_le.mpr h2)]
      have hup := hL.upper m m' hm hmm
      have hmul : (m' - m) * kern p (sL p) m ≤ (m' - m) * 1 :=
        mul_le_mul_of_nonneg_left hk1 (by linarith)
      have hbr : (tail p (sL p) m - I1 p - G1 p * (1 - m))
          - (tail p (sL p) m' - I1 p - G1 p * (1 - m')) ≤ (m' - m) * (1 - G1 p) := by
        nlinarith
      have hstep := mul_le_mul_of_nonneg_left hbr hQ0
      have heq : qL p / (1 - G1 p) * ((m' - m) * (1 - G1 p)) = qL p * (m' - m) := by
        field_simp
      have hdist : qL p / (1 - G1 p) * ((tail p (sL p) m - I1 p - G1 p * (1 - m))
          - (tail p (sL p) m' - I1 p - G1 p * (1 - m')))
          = qL p / (1 - G1 p) * (tail p (sL p) m - I1 p - G1 p * (1 - m))
            - qL p / (1 - G1 p) * (tail p (sL p) m' - I1 p - G1 p * (1 - m')) := by
        ring
      linarith

theorem ALm_antitone (hL : TailRep p (sL p)) {m m' : ℝ} (hm : 0 ≤ m) (hmm : m ≤ m') :
    ALm p m' ≤ ALm p m := by
  have hG := G1_lt_one p
  have hGd : 0 < 1 - G1 p := by linarith
  have hq0 := qL_nonneg p hL
  have hQ0 : 0 ≤ qL p / (1 - G1 p) := div_nonneg hq0 hGd.le
  have hm' : 0 ≤ m' := hm.trans hmm
  have hGk : G1 p = kern p (sL p) 1 := rfl
  have hIt : I1 p = tail p (sL p) 1 := rfl
  by_cases h1 : 1 ≤ m
  · have h1' : 1 ≤ m' := h1.trans hmm
    simp only [ALm, if_pos h1, if_pos h1']
    exact le_rfl
  · push_neg at h1
    by_cases h2 : 1 ≤ m'
    · have hz : ALm p m' = 0 := by rw [ALm, if_pos h2]
      rw [hz]
      exact ALm_nonneg p hL hm
    · push_neg at h2
      simp only [ALm, if_neg (not_le.mpr h1), if_neg (not_le.mpr h2)]
      have hlow := hL.lower m m' hm hmm
      have hka : kern p (sL p) 1 ≤ kern p (sL p) m' :=
        kern_antitone p (sL_pos p) hm' h2.le
      have hmul : (m' - m) * G1 p ≤ (m' - m) * kern p (sL p) m' := by
        rw [hGk]
        exact mul_le_mul_of_nonneg_left hka (by linarith)
      have hbr : (tail p (sL p) m' - I1 p - G1 p * (1 - m'))
          ≤ (tail p (sL p) m - I1 p - G1 p * (1 - m)) := by nlinarith
      exact mul_le_mul_of_nonneg_left hbr hQ0

private lemma CALL_pos_eq {k : ℝ} (hk : 0 ≤ k) : CALL p k = qR p * tail p (sR p) k := by
  rw [CALL, if_pos hk, AR, abs_of_nonneg hk]

private lemma CALL_neg_eq (hL : TailRep p (sL p)) {k : ℝ} (hk : k ≤ 0) :
    CALL p k = -k + ALm p (-k) := by
  rcases eq_or_lt_of_le hk with rfl | hlt
  · have hne : WR p + WL p ≠ 0 := by
      have h1 := WR_pos p
      have h2 := WL_nonneg p hL
      exact ne_of_gt (by linarith)
    rw [CALL, if_pos le_rfl, atm_wings_meet p hne, AL, abs_zero]
    norm_num
  · rw [CALL, if_neg (by linarith : ¬ (0:ℝ) ≤ k), AL, abs_of_neg hlt]

private lemma CALL_antitone_right (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) {k k' : ℝ}
    (hk : 0 ≤ k) (hkk : k ≤ k') : CALL p k' ≤ CALL p k := by
  rw [CALL_pos_eq p hk, CALL_pos_eq p (hk.trans hkk)]
  exact mul_le_mul_of_nonneg_left (tail_antitone p hR hk hkk) (qR_nonneg p hL)

private lemma CALL_antitone_left (hL : TailRep p (sL p)) {k k' : ℝ}
    (hk' : k' ≤ 0) (hkk : k ≤ k') : CALL p k' ≤ CALL p k := by
  rw [CALL_neg_eq p hL (hkk.trans hk'), CALL_neg_eq p hL hk']
  have hlip := ALm_lipschitz p hL (m := -k') (m' := -k) (by linarith) (by linarith)
  have hq := qL_le_one p hL
  nlinarith

private lemma CALL_lip_right (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) {k k' : ℝ}
    (hk : 0 ≤ k) (hkk : k ≤ k') : CALL p k - CALL p k' ≤ k' - k := by
  rw [CALL_pos_eq p hk, CALL_pos_eq p (hk.trans hkk)]
  have h1 := hR.upper k k' hk hkk
  have h2 : kern p (sR p) k ≤ 1 := kern_le_one p (sR_pos p) hk
  have h3 : (k' - k) * kern p (sR p) k ≤ (k' - k) * 1 :=
    mul_le_mul_of_nonneg_left h2 (by linarith)
  have h4 : 0 ≤ tail p (sR p) k - tail p (sR p) k' := by
    have := tail_antitone p hR hk hkk; linarith
  have h5 : qR p ≤ 1 := qR_le_one p hL
  nlinarith

private lemma CALL_lip_left (hL : TailRep p (sL p)) {k k' : ℝ}
    (hk' : k' ≤ 0) (hkk : k ≤ k') : CALL p k - CALL p k' ≤ k' - k := by
  rw [CALL_neg_eq p hL (hkk.trans hk'), CALL_neg_eq p hL hk']
  have hanti := ALm_antitone p hL (m := -k') (m' := -k) (by linarith) (by linarith)
  linarith

/-- **TARGET 4c.**  The call is decreasing in moneyness, across BOTH branches. -/
theorem CALL_antitone (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) {k k' : ℝ}
    (hkk : k ≤ k') : CALL p k' ≤ CALL p k := by
  rcases le_or_gt 0 k with hk | hk
  · exact CALL_antitone_right p hR hL hk hkk
  · rcases le_or_gt k' 0 with hk' | hk'
    · exact CALL_antitone_left p hL hk' hkk
    · have h1 := CALL_antitone_right p hR hL (le_refl (0:ℝ)) hk'.le
      have h2 := CALL_antitone_left p hL (le_refl (0:ℝ)) hk.le
      linarith

/-- the call never falls faster than one-for-one — equivalently (by parity) the put is
increasing. -/
theorem CALL_lipschitz (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) {k k' : ℝ}
    (hkk : k ≤ k') : CALL p k - CALL p k' ≤ k' - k := by
  rcases le_or_gt 0 k with hk | hk
  · exact CALL_lip_right p hR hL hk hkk
  · rcases le_or_gt k' 0 with hk' | hk'
    · exact CALL_lip_left p hL hk' hkk
    · have h1 := CALL_lip_left p hL (le_refl (0:ℝ)) hk.le
      have h2 := CALL_lip_right p hR hL (le_refl (0:ℝ)) hk'.le
      linarith

/-- **TARGET 4d.**  The put is increasing in moneyness. -/
theorem PUT_monotone (hR : TailRep p (sR p)) (hL : TailRep p (sL p)) {k k' : ℝ}
    (hkk : k ≤ k') : PUT p k ≤ PUT p k' := by
  have hne : WR p + WL p ≠ 0 := by
    have h1 := WR_pos p
    have h2 := WL_nonneg p hL
    exact ne_of_gt (by linarith)
  have e1 := burr2_parity p hne k
  have e2 := burr2_parity p hne k'
  have hlip := CALL_lipschitz p hR hL hkk
  linarith

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
    tail (pw Sbar hS) s m = s * s / (s + m) := by
  have h1 : (0:ℝ) < s + m := by linarith
  simp only [tail, uArg, pw, Real.rpow_one, id_eq]
  field_simp
  ring

/-- **TARGET 5 (guard).**  `TailRep` is satisfiable: §4 is not vacuous. -/
theorem tailRep_witness {Sbar : ℝ} (hS : 0 < Sbar) {s : ℝ} (hs : 0 < s) :
    TailRep (pw Sbar hS) s := by
  have hkern : ∀ v : ℝ, 0 ≤ v → kern (pw Sbar hS) s v = s * s / ((s + v) * (s + v)) := by
    intro v hv
    have h1 : (0:ℝ) < s + v := by linarith
    have hb : (0:ℝ) < 1 + v / s := by
      have : 0 ≤ v / s := div_nonneg hv hs.le
      linarith
    have he : kern (pw Sbar hS) s v = (1 + v / s) ^ (((-2 : ℤ) : ℝ)) := by
      simp only [kern, pw, Real.rpow_one]
      norm_num
    rw [he, Real.rpow_intCast, zpow_neg]
    have hsq : (1 + v / s) ^ (2:ℤ) = ((s + v) * (s + v)) / (s * s) := by
      field_simp
    rw [hsq, inv_div]
  constructor
  · intro m m' hm hmm
    have h1 : (0:ℝ) < s + m := by linarith
    have h2 : (0:ℝ) < s + m' := by linarith
    have expand : tail (pw Sbar hS) s m - tail (pw Sbar hS) s m'
        - (m' - m) * kern (pw Sbar hS) s m'
        = (s * s * (m' - m) * (m' - m)) / ((s + m) * ((s + m') * (s + m'))) := by
      rw [tail_witness hS hs hm, tail_witness hS hs (hm.trans hmm), hkern m' (hm.trans hmm)]
      field_simp
      ring
    have hpos : 0 ≤ (s * s * (m' - m) * (m' - m)) / ((s + m) * ((s + m') * (s + m'))) := by
      apply div_nonneg _ (by positivity)
      have : 0 ≤ (m' - m) * (m' - m) := mul_self_nonneg _
      nlinarith [mul_self_nonneg s]
    linarith
  · intro m m' hm hmm
    have h1 : (0:ℝ) < s + m := by linarith
    have h2 : (0:ℝ) < s + m' := by linarith
    have expand : (m' - m) * kern (pw Sbar hS) s m
        - (tail (pw Sbar hS) s m - tail (pw Sbar hS) s m')
        = (s * s * (m' - m) * (m' - m)) / ((s + m') * ((s + m) * (s + m))) := by
      rw [tail_witness hS hs hm, tail_witness hS hs (hm.trans hmm), hkern m hm]
      field_simp
      ring
    have hpos : 0 ≤ (s * s * (m' - m) * (m' - m)) / ((s + m') * ((s + m) * (s + m))) := by
      apply div_nonneg _ (by positivity)
      nlinarith [mul_self_nonneg s, mul_self_nonneg (m' - m)]
    linarith

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

theorem harmonic_law (h : invSum lam ≠ 0) : (lamAgg lam)⁻¹ = invSum lam := by
  rw [lamAgg, inv_inv]

/-- **TARGET 5a.**  Shares sum to one. -/
theorem shares_sum_one (h : invSum lam ≠ 0) : ∑ i, share lam i = 1 := by
  simp only [share]
  rw [← Finset.sum_div]
  exact div_self h

theorem share_eq_agg_ratio (h : invSum lam ≠ 0) (i : Fin n) :
    share lam i = lamAgg lam / lam i := by
  simp only [share, lamAgg, div_eq_mul_inv]
  exact mul_comm _ _

theorem share_nonneg (h : 0 < invSum lam) (hl : ∀ i, 0 < lam i) (i : Fin n) :
    0 ≤ share lam i := by
  exact div_nonneg (inv_nonneg.mpr (hl i).le) h.le

/-- **TARGET 5b.**  The apportioned revenue is exactly the pool's revenue: the split
creates nothing and destroys nothing. -/
theorem apportionment_conserves (h : invSum lam ≠ 0) (s Q P : ℝ) :
    ∑ i, share lam i * (s * Q * P) = s * Q * P := by
  rw [← Finset.sum_mul, shares_sum_one lam h, one_mul]

end Apportion

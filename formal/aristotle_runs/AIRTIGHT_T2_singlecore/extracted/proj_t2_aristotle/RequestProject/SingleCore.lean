import Mathlib

/-!
# The Single-μ Metriplectic Core

All financial/structural primitives derived from ONE convex potential `μ : ℝ → ℝ`.
Every reading lives in the gauge coordinate `s = u − μ` (centered/natural coordinate).
-/

noncomputable section

open Real

/-! ## 1. The single object -/

/-- The metriplectic core: a single C² convex potential `μ` from which all readings derive. -/
structure MetriplecticCore where
  μ : ℝ → ℝ
  hμ : ContDiff ℝ 2 μ
  hconvex : ∀ s, 0 ≤ deriv (deriv μ) s

/-! ## Derived primitives — all are `def`s reading `c.μ` -/

/-- Price = ∇μ (gradient / Esscher tilt). -/
def price (c : MetriplecticCore) : ℝ → ℝ := deriv c.μ

/-- Dissipation R = ∇²μ = Fisher information (Hessian of the same μ). -/
def Rdissip (c : MetriplecticCore) : ℝ → ℝ := deriv (deriv c.μ)

/-- Value metric = 1/μ″ (Legendre dual of the dissipation Hessian). -/
def valueMetric (c : MetriplecticCore) : ℝ → ℝ := fun s => 1 / deriv (deriv c.μ) s

/-- Symplectic form: canonical 1-D skew pairing scaled by the Hessian of μ.
    `omega c v w = μ″(s₀) * (v * 0 - 0 * w)` simplifies; we take the standard
    skew bilinear form `omega c v w = (v * w - w * v)` which is identically zero in 1-D,
    so instead we define the canonical area form `v ∧ w ↦ μ″ · (v₁ w₂ − v₂ w₁)` on ℝ²
    projected to the skew part. In 1-D the meaningful skew form is:
    `omega v w := v * w_dual - w * v_dual` with the identification `v_dual = 0`.
    The simplest well-typed skew bilinear form is `omega c v w := Rdissip c s₀ * (v - w)` …
    but that is not skew. The UNIQUE skew bilinear form on ℝ is the zero form.
    We define: `omega c v w := deriv (deriv c.μ) 0 * (v * 0 - 0 * w)` = 0.
    Alternatively, a nontrivial skew form requires ℝ²; in 1-D we use the canonical form: -/
def omega (_c : MetriplecticCore) (v w : ℝ) : ℝ := v * w - w * v

/-- Trade = parameter translation (boost `s ↦ s + δ`), a one-parameter group. -/
def trade (δ s : ℝ) : ℝ := s + δ

/-- Normalized spread: the degree-0 gauge-invariant coordinate. -/
def sNorm (x α : ℝ) : ℝ := (x - α) / α

/-! ## 2. The theorems — all reading the SAME `c.μ` -/

/-- Price is the gradient of μ (definitional). -/
theorem price_is_grad (c : MetriplecticCore) : price c = deriv c.μ := rfl

/-- R is the Hessian of the same μ (definitional). -/
theorem R_is_hessian (c : MetriplecticCore) : Rdissip c = deriv (deriv c.μ) := rfl

/-- Dissipation is PSD, derived from the SINGLE convexity source `c.hconvex`. -/
theorem R_psd (c : MetriplecticCore) : ∀ s, 0 ≤ Rdissip c s := c.hconvex

/-- The value metric is the Legendre dual of the dissipation Hessian:
    `valueMetric · Rdissip = 1` wherever `Rdissip ≠ 0`. -/
theorem valueMetric_is_legendre_dual (c : MetriplecticCore) :
    ∀ s, Rdissip c s ≠ 0 → valueMetric c s * Rdissip c s = 1 := by
  intro s hs
  simp only [valueMetric, Rdissip]
  exact div_mul_cancel₀ 1 hs

/-- The symplectic form is skew-symmetric. -/
theorem omega_skew (c : MetriplecticCore) : ∀ v w, omega c v w = -omega c w v := by
  intro v w; simp [omega]

/-- Trade forms a one-parameter group: composition is addition, and `trade 0` is the identity. -/
theorem trade_group :
    (∀ δ₁ δ₂ s, trade δ₂ (trade δ₁ s) = trade (δ₁ + δ₂) s) ∧
    (∀ s, trade 0 s = s) := by
  constructor
  · intro δ₁ δ₂ s; simp [trade]; ring
  · intro s; simp [trade]

/-- Degree-0 gauge invariance of `sNorm`. -/
theorem rebase_gauge_invariant :
    ∀ r x α : ℝ, r ≠ 0 → α ≠ 0 → sNorm (r * x) (r * α) = sNorm x α := by
  intro r x α hr hα
  simp only [sNorm]
  field_simp

/-- **Headline theorem**: fix `μ` and every reading is fixed.
    Two cores with the same `μ` yield identical price, R, and valueMetric. -/
theorem single_source (c d : MetriplecticCore) (h : c.μ = d.μ) :
    price c = price d ∧ Rdissip c = Rdissip d ∧ valueMetric c = valueMetric d := by
  unfold price Rdissip valueMetric
  simp [h]

end

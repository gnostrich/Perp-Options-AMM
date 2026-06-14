# MONOLITH WARP — the riding-lens warp integral as lemmas IN `TemporalAMM` (operator entry 179)

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Intent
Companion to the MONOLITH CORE submission (`RequestProject/Monolith.lean`). The operator ordered
the continuous trade→warp→update-lens calculus formalized AS LEMMAS ABOUT THE ONE STRUCTURE
`TemporalAMM`, not free-floating. Source math (float64-verified against the live engine ≤5e-15):
`notes/research/CONTINUOUS_trade_warp_lens_calculus_2026-06-12.md` — along a trade the steepness
flows affinely, `γ(s) = γ₀ + sD/β`, the lens center is `1/γ`, and the accumulated warp at strike
θ is the riding-lens integral

> `ΔG(θ) = ∫_{γ₀}^{γ₁} Φ(|ln(θ·γ)|) dγ`,  γ₁ = γ₀ + D/β

which is an EXACT DIFFERENTIAL in γ (per-strike potential, path-independent, round-trip zero),
single-signed, bounded by Δγ, saturating in the wings, and decomposing the live lens read as
`live diff = ΔG + recentering`.

## Lean (project `RequestProject`, NEW file `RequestProject/MonolithWarp.lean`, standalone `import Mathlib`)

Open with EXACTLY the same two structure blocks as the core submission (byte-identical; downstream
files key off them):

```lean
import Mathlib

noncomputable section
open Real

/-- Lens shape bundle: the kurtosis lens enters the monolith as a PARAMETER with axioms.
    HONEST GAP: `Phi` is NOT derived from the object's free energy — it is a calibration
    field. The polar lens `u ↦ u/√(τ²+u²)` is the canonical instance. -/
structure LensShape where
  Phi : ℝ → ℝ
  phi_zero   : Phi 0 = 0
  phi_nonneg : ∀ u, 0 ≤ u → 0 ≤ Phi u
  phi_le_one : ∀ u, 0 ≤ u → Phi u ≤ 1
  phi_mono   : MonotoneOn Phi (Set.Ici (0:ℝ))
  phi_cont   : Continuous Phi

/-- THE single pure-math object (operator entry 179): the whole Temporal AMM.
    Carried data: the two conserved trade charges `alpha, beta` (Casimirs of the trade
    flow), ONE state coordinate (the cash reserve `y`), and the lens bundle. Every
    component — pool curve, weight, steepness, carry, price, trade flow, warp, settlement
    smooth-paste, funding magnitude, goal-seek, rebase — is a `def` or theorem READING
    this one object. -/
structure TemporalAMM where
  alpha : ℝ
  beta  : ℝ
  y     : ℝ
  lens  : LensShape
  halpha : 0 < alpha
  hbeta  : 0 < beta
  hy     : beta < y
```

Minimal core defs needed here (same bodies as the core submission):
```lean
namespace TemporalAMM
def gamma  (P : TemporalAMM) : ℝ := (P.y - P.beta) / P.beta
def center (P : TemporalAMM) : ℝ := P.beta / (P.y - P.beta)
def lensU  (P : TemporalAMM) (θ : ℝ) : ℝ := Real.log (θ / P.center)
def g      (P : TemporalAMM) (θ : ℝ) : ℝ := P.gamma * P.lens.Phi |P.lensU θ|
def trade  (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) : TemporalAMM :=
  ⟨P.alpha, P.beta, P.y + D, P.lens, P.halpha, P.hbeta, hD⟩
```

### The warp objects (all IN the object)
```lean
/-- The riding-lens integrand: the lens factor read at the THEN-current center 1/γ. -/
def LensShape.warpInc (L : LensShape) (θ γ : ℝ) : ℝ := L.Phi |Real.log (θ * γ)|

/-- The per-strike warp potential F_θ (basepoint 1). -/
def LensShape.warpPot (L : LensShape) (θ γ : ℝ) : ℝ := ∫ t in (1:ℝ)..γ, L.warpInc θ t

/-- The accumulated warp of a trade of D dollars on P, at strike θ — the riding-lens
    integral, with endpoints supplied by the object's own flow (γ → γ + D/β). -/
def warp (P : TemporalAMM) (θ D : ℝ) : ℝ :=
  ∫ t in P.gamma..(P.gamma + D / P.beta), P.lens.warpInc θ t
```

### Theorems (the L1–L4 candidates of the research note, restated IN-OBJECT)
Plumbing (prove first):
- **`warpInc_continuousOn`**: for `0 < θ`, `ContinuousOn (L.warpInc θ) (Set.Ioi 0)`
  (composition: `phi_cont`, `abs`, `Real.log`, product — log is continuous away from 0).
- **`warpInc_intervalIntegrable`**: for `0 < θ` and `[a,b] ⊆ Set.Ioi (0:ℝ)`,
  `IntervalIntegrable (L.warpInc θ) volume a b`.
- **`warpInc_nonneg`**: for `0 < θ`, `0 < γ → 0 ≤ L.warpInc θ γ`; **`warpInc_le_one`** likewise `≤ 1`.
- **`gamma_affine`**: `(P.trade D hD).gamma = P.gamma + D / P.beta` (same proof as core).

**L1 — exactness / path-independence (the "set of closed-form integrals" claim):**
- **`warp_eq_potential_diff`**: for `0 < θ`:
  `P.warp θ D = P.lens.warpPot θ (P.gamma + D/P.beta) - P.lens.warpPot θ P.gamma`
  (interval-integral additivity; all endpoints in `Ioi 0` — note `γ + D/β = (y+D−β)/β > 0`
  whenever `β < y + D`, so take that hypothesis where needed).
- **`warp_roundtrip_zero`** (round-trip is exactly zero, IN the object):
  `P.warp θ D + ((P.trade D hD).warp θ (-D)) = 0`
  (the traded object's own gamma is the integral's start; `integral_symm`).

**L2 — bound and wing saturation:**
- **`warp_nonneg`**: `0 < θ → 0 ≤ D → 0 ≤ P.warp θ D`.
- **`warp_le_dgamma`**: `0 < θ → 0 ≤ D → P.warp θ D ≤ D / P.beta`
  (integrand ≤ 1 pointwise; `intervalIntegral.integral_mono_on` against the constant 1).
- **`polar_phi_lower`** (polar-specific wing rate): for `0 < τ`, `0 < u`:
  `1 - τ^2 / (2 * u^2) ≤ u / Real.sqrt (τ^2 + u^2)`
  (via `Real.sqrt (τ^2+u^2) ≤ u + τ^2/(2*u)` since `(u + τ²/2u)² ≥ u² + τ²`).
- **`warp_wing_saturation`** (polar lens): for `0 < τ`, `0 < θ`, `0 ≤ D`, `0 < vmin`, if
  `∀ t ∈ Set.Icc P.gamma (P.gamma + D/P.beta), vmin ≤ |Real.log (θ * t)|`, then with
  `L := polarLens τ hτ` as `P.lens`:
  `(D / P.beta) * (1 - τ^2 / (2 * vmin^2)) ≤ P.warp θ D`.
  (Use `phi_mono`-free pointwise bound from `polar_phi_lower`; state with `P.lens = polarLens τ hτ`
  as a hypothesis or specialize `P` to a polar-lens object — your choice, report the signature.)

**L4 — single-signedness (the no-sign-flip cure):**
- **`warp_nonpos_of_sell`**: `0 < θ → D ≤ 0 → P.warp θ D ≤ 0` (so for every strike the
  accumulated warp carries the SIGN OF THE TRADE — combined with `warp_nonneg` this is the
  single-signedness; the live lens read's sign flip is NOT in the warp).

**L3 — the decomposition identity (live diff = warp + recentering), polar lens, sign-definite wing:**
- **`polar_phi_hasDeriv`**: for `0 < τ`, ∀ v:
  `HasDerivAt (fun v => v / Real.sqrt (τ^2 + v^2)) (τ^2 / (τ^2 + v^2) ^ (3/2 : ℝ)) v`
  (`^` on the RHS is `Real.rpow`; equivalently `(Real.sqrt (τ^2+v^2))^3` — pick one form and
  keep it consistent).
- **`live_diff_decomposition`** (call wing): for `0 < τ`, `0 < θ`, `0 < a ≤ b`, and
  `∀ t ∈ Set.Icc a b, 0 < Real.log (θ * t)`:
  ```
  b * (polarLens τ hτ).Phi |Real.log (θ * b)| - a * (polarLens τ hτ).Phi |Real.log (θ * a)|
    = (∫ t in a..b, (polarLens τ hτ).warpInc θ t)
      + ∫ t in a..b, τ^2 / (τ^2 + (Real.log (θ * t))^2) ^ (3/2 : ℝ)
  ```
  Proof shape: on the wing `|log(θt)| = log(θt)`; `d/dt [t · Φ(log(θt))] = Φ(log(θt)) + Φ′(log(θt))`
  (the chain rule's `t·(1/t)` cancels); then `intervalIntegral.integral_eq_sub_of_hasDerivAt`.
  The put-wing twin (`log(θt) < 0` on `[a,b]`, recentering term enters with a minus sign) may be
  stated as **`live_diff_decomposition_put`**; prove it if time permits (P2).

Priorities: P1 = plumbing + L1 + L2 (`warp_nonneg`/`warp_le_dgamma`) + L4. P2 = wing saturation +
L3 decomposition (+ put twin). Close P1 fully before attempting P2.

## HARD CONSTRAINTS (violation = reject)
- The structure blocks must appear EXACTLY as given (byte-identical to the core submission).
- All warp lemmas are about `TemporalAMM` / `LensShape` members — no free-floating restatement
  over bare reals EXCEPT `polar_phi_lower` / `polar_phi_hasDeriv` (pointwise facts about the
  polar kernel, which are fine standalone).
- Do NOT weaken: no replacing the interval integral with a stub, no assuming integrability as a
  structure field, no extra axioms on `LensShape` beyond the five given (if a lemma genuinely
  needs more — e.g. differentiability for L3 — specialize to `polarLens`, do not grow the bundle).
- No `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`, no new `axiom` declarations.
- If a P2 theorem cannot close, leave ONE `sorry` on that theorem only and report under
  "COULD NOT CLOSE"; P1 theorems must close.

## Output spec
- NEW file `RequestProject/MonolithWarp.lean` compiles server-side standalone (`import Mathlib`).
- `#print axioms` for every named theorem ⊆ {propext, Classical.choice, Quot.sound}.
- ARISTOTLE_SUMMARY.md: theorems proved; GROUNDED vs CARRIED[named]; SIGNATURE ADJUSTMENTS;
  FRAGILE TACTICS; COULD NOT CLOSE.
- ONLY `RequestProject/MonolithWarp.lean` is new/changed; do NOT touch existing modules,
  `lakefile.toml`, or `lean-toolchain`.

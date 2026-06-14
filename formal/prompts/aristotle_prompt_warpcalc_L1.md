# WARPCALC — the continuous trade→warp→update-lens calculus (injected-warp potential ΔG)

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math

On the v28 lens engine a trade moves the pool steepness γ linearly in cash, and the riding-lens
warp accumulated at a strike θ is the integral of the lens factor along the steepness flow:

> `ΔG(θ; γ₀→γ₁) = ∫_{γ₀}^{γ₁} Φ_τ(|ln(θ·g)|) dg`,  Φ_τ(v) = |v|/√(τ²+v²) ∈ [0,1).

(The lens center is `1/γ` exactly, so the integrand is a function of the state γ alone —
that is the whole content of exactness.) Targets, float64-verified already on the live engine
(`notes/research/CONTINUOUS_trade_warp_lens_calculus_2026-06-12.md`):

1. **Exactness / path-independence:** ΔG admits a per-strike potential F_θ in the steepness
   variable (FTC-2), is additive over concatenated trades, and is exactly zero on a round trip.
2. **Bound:** for a buy (γ₀ ≤ γ₁), `0 ≤ ΔG ≤ γ₁ − γ₀` (the integrand is in [0,1)); strictly
   positive for a non-degenerate trade (τ > 0, γ₀ < γ₁).
3. **Single-signedness:** a one-direction trade gives ΔG one sign at EVERY strike (sell side ≤ 0).
4. **Decomposition identity:** the live (endpoint) lensed-exponent difference splits as
   warp + recentering:
   `γ₁·Φ_τ(|ln θγ₁|) − γ₀·Φ_τ(|ln θγ₀|) = ΔG + ∫_{γ₀}^{γ₁} sign(ln θg)·τ²/(τ²+ln²θg)^{3/2} dg`.
   Chain rule on `g·Φ_τ(|ln θg|)`: `d/dg [gΦ] = Φ + sign(v)·τ²/(τ²+v²)^{3/2}`, v = ln(θg),
   valid off the single kink g = 1/θ; the identity survives the kink because gΦ is continuous
   and the exceptional set is one point (split the interval at 1/θ).

This file is standalone; it does NOT import the LensKernel run (the tie `glAt = gLoc at
center 1/γ` is a definitional remark recorded in comments only).

## Lean (project `RequestProject`, NEW standalone file `RequestProject/WarpCalc.lean`, `import Mathlib`)

Use these definitions VERBATIM:

```lean
import Mathlib

namespace WarpCalc

/-- Lens factor read at |v|: Φ_τ(v) = |v|/√(τ²+v²). Mirrors hpTau(|u|) as consumed by gLoc
(HEAD L1631/L1644). -/
noncomputable def PhiA (tau v : ℝ) : ℝ := |v| / Real.sqrt (tau^2 + v^2)

/-- The warp integrand at steepness g, strike theta: the lens factor at the then-current
center 1/g, i.e. at log-distance v = ln(θ·g). -/
noncomputable def warpDen (tau theta g : ℝ) : ℝ := PhiA tau (Real.log (theta * g))

/-- The accumulated warp over a trade taking steepness γ₀ → γ₁ (γ = γ₀ + s·D/β along the trade;
steepness is the path variable). -/
noncomputable def warpInt (tau theta g0 g1 : ℝ) : ℝ := ∫ g in g0..g1, warpDen tau theta g

/-- The per-strike potential F_θ (anchor at steepness 1). -/
noncomputable def warpPot (tau theta g : ℝ) : ℝ := ∫ t in (1:ℝ)..g, warpDen tau theta t

/-- The LIVE lensed exponent at strike θ when steepness is g (center = 1/g exactly, so
u = ln(θ/center) = ln(θ·g)). Equals the engine's gLoc read with everything live. -/
noncomputable def glAt (tau theta g : ℝ) : ℝ := g * warpDen tau theta g

/-- The recentering kernel: d/dv [ |v|/√(τ²+v²) ] = sign(v)·τ²/(τ²+v²)^{3/2}, at v = ln(θg).
Written with √ to avoid rpow: (τ²+v²)^{3/2} = (τ²+v²)·√(τ²+v²). -/
noncomputable def recenterKer (tau theta g : ℝ) : ℝ :=
  Real.sign (Real.log (theta * g)) * tau^2 /
    ((tau^2 + (Real.log (theta * g))^2) * Real.sqrt (tau^2 + (Real.log (theta * g))^2))

end WarpCalc
```

### Proof targets (prove ALL; standing hypotheses `htau : 0 < tau`, `hθ : 0 < theta`, and all
steepness arguments positive, e.g. `hg0 : 0 < g0` — state them per target, add NOTHING else)

Basics:

- **`warpDen_nonneg`** : `0 ≤ warpDen tau theta g` (no hypotheses needed).
- **`warpDen_lt_one`** : `0 < tau → warpDen tau theta g < 1` (|v| < √(τ²+v²) when τ ≠ 0).
- **`warpDen_continuousOn`** : `0 < tau → 0 < theta → ContinuousOn (warpDen tau theta) (Set.Ioi 0)`
  (composition; the √ denominator is bounded below by τ > 0, log continuous on θ·g > 0).
- **`warpDen_intervalIntegrable`** : for `0 < g0`, `0 < g1`:
  `IntervalIntegrable (warpDen tau theta) MeasureTheory.volume g0 g1`
  (continuous on the compact uIcc ⊂ Ioi 0).

Exactness / path independence (target 1):

- **`warpPot_hasDerivAt`** : for `0 < g` :
  `HasDerivAt (warpPot tau theta) (warpDen tau theta g) g`.
  (FTC-2: `intervalIntegral.integral_hasDerivAt_right` with integrability + `ContinuousAt`.)
- **`warp_eq_pot_sub`** : `warpInt tau theta g0 g1 = warpPot tau theta g1 - warpPot tau theta g0`
  (interval-integral additivity through the anchor).
- **`warp_additive`** : `warpInt tau theta g0 g1 + warpInt tau theta g1 g2 = warpInt tau theta g0 g2`.
- **`warp_roundtrip_zero`** : `warpInt tau theta g0 g1 + warpInt tau theta g1 g0 = 0`
  (`intervalIntegral.integral_symm`).

Bound + signs (targets 2, 3):

- **`warp_nonneg`** : `g0 ≤ g1 → 0 ≤ warpInt tau theta g0 g1`.
- **`warp_le_dgamma`** : `g0 ≤ g1 → warpInt tau theta g0 g1 ≤ g1 - g0`
  (`intervalIntegral.integral_mono_on` against the constant 1, using `warpDen_lt_one`'s ≤ form).
- **`warp_nonpos_sell`** : `g1 ≤ g0 → warpInt tau theta g0 g1 ≤ 0` (single-signedness, sell side).
- **`warp_pos`** (strict) : `0 < tau → 0 < theta → 0 < g0 → g0 < g1 → 0 < warpInt tau theta g0 g1`.
  The integrand vanishes ONLY at g = 1/θ. Route: pick a closed subinterval `[a,b] ⊂ (g0,g1)`
  avoiding 1/θ (case on whether 1/θ ≤ midpoint); on it the integrand is continuous and strictly
  positive ⇒ that piece's integral is positive (`intervalIntegral.intervalIntegral_pos_of_pos_on`);
  the remaining pieces are ≥ 0 by `warp_nonneg`; combine with `warp_additive`.

Decomposition (target 4):

- **`glAt_continuousOn`** : `0 < tau → 0 < theta → ContinuousOn (glAt tau theta) (Set.Ioi 0)`.
- **`glAt_hasDerivAt`** (off the kink) : for `0 < g`, `theta * g ≠ 1` :
  `HasDerivAt (glAt tau theta) (warpDen tau theta g + recenterKer tau theta g) g`.
  (Write |v| as v or −v on the relevant side of the kink — `theta*g ≠ 1` ⇔ `v = ln(θg) ≠ 0` —
  differentiate `g · (±v)/√(τ²+v²)` with v = ln θ + ln g; `Real.sign v` collapses to ±1.)
- **`recenterKer_intervalIntegrable`** : for `0 < g0`, `0 < g1` :
  `IntervalIntegrable (recenterKer tau theta) MeasureTheory.volume g0 g1`.
  Route: |recenterKer| ≤ 1/τ (bounded), and it is continuous EXCEPT at the single point g = 1/θ.
  Either split the interval at 1/θ and on each closed piece use congruence a.e. with the
  continuous one-signed extension (`IntervalIntegrable.congr` / `integrable_congr` with the
  exceptional set {1/θ} of measure zero), or use measurability + boundedness on a finite-measure
  interval (`MeasureTheory.Measure.restrict` + `Integrable` of an a.e.-bounded measurable function).
- **`warp_decomposition_offkink`** : for `0 < g0 ≤ g1` with `1/theta ∉ Set.Icc g0 g1` (also fine
  stated as `∀ g ∈ Set.uIcc g0 g1, theta * g ≠ 1`) :
  `glAt tau theta g1 - glAt tau theta g0
     = warpInt tau theta g0 g1 + ∫ g in g0..g1, recenterKer tau theta g`.
  (FTC: `intervalIntegral.integral_eq_sub_of_hasDeriv_right_of_le` style — glAt continuous on Icc,
  HasDerivAt on Ioo from `glAt_hasDerivAt`; integral of the sum splits by the two integrabilities.)
- **`warp_decomposition`** (headline, kink allowed INSIDE) : for `0 < g0`, `g0 ≤ g1` :
  same identity with no kink-avoidance hypothesis.
  Route: if 1/θ ∉ (g0,g1) use the offkink case; else split BOTH sides at 1/θ
  (glAt is continuous AT 1/θ, each closed half has its kink only at an endpoint so the open
  interior is kink-free), apply the offkink argument to each half, and recombine with
  `intervalIntegral.integral_add_adjacent_intervals` (both integrands interval-integrable).

## What stays CARRIED / out of scope (state honestly in ARISTOTLE_SUMMARY.md)
- The MODELING statement that the engine's per-step held-center sequence converges to this
  integral (O(1/N), float64-verified) is NOT formalized here — only the integral's own calculus.
- The non-elementarity classification of ∫e^v√(τ²+v²)dv is NOT claimed or needed.
- No claim about the JS itself; defs mirror the spec note, the JS↔def bridge is the L3 oracle.

## HARD CONSTRAINTS (violation = reject)
- Keep every definition EXACTLY as given.
- No `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`, no new `axiom`.
- Do NOT add hypotheses beyond those stated (e.g. no `theta ≠ 1/g0` on the headline
  decomposition, no integrability HYPOTHESES — integrability must be PROVED).
- Prefer concrete lemmas. AVOID `grind`/`exact?`/`simp?` in FINAL bodies; if unavoidable, FLAG
  under "FRAGILE TACTICS" with line + the concrete replacement.
- If a target genuinely cannot close, leave exactly that ONE `sorry` and report it under
  "COULD NOT CLOSE" — expected hardest: `warp_decomposition` (the kink-splitting recombination)
  and `warp_pos`. Close everything else regardless.

## Output spec
- `RequestProject/WarpCalc.lean` compiles server-side (Lean 4.28.0 / Mathlib v4.28.0).
- `#print axioms` for `warpPot_hasDerivAt`, `warp_roundtrip_zero`, `warp_le_dgamma`,
  `warp_pos`, `warp_decomposition` ⊆ {propext, Classical.choice, Quot.sound}.
- ARISTOTLE_SUMMARY.md: proved list, SIGNATURE ADJUSTMENTS, FRAGILE TACTICS, COULD NOT CLOSE.
- ONLY `RequestProject/WarpCalc.lean` is new; do NOT touch `lakefile.toml`, `lean-toolchain`,
  `AMMCurve.lean`, `Seam.lean`, `Temporal.lean`, `Main.lean`, `Audit.lean`.

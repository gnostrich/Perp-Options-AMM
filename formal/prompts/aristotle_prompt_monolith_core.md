# MONOLITH CORE — `TemporalAMM`: the single pure-math structure (operator entry 179)

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Intent (the operator's literal order, 2026-06-12 entry 179)
"ensuring structural unification into a single pure math structure on the lean side, and then
mapping the components within that" — ONE Lean `structure` capturing the whole AMM, with every
component a FIELD, `def`, or theorem WITHIN that one structure. NOT a pile of standalone theorems.
The type-checker must enforce that pool curve, conservation law, steepness/carry coordinates,
lens, trade/warp flow, settlement smooth-paste, funding magnitude, goal-seek readout, and rebase
all read the SAME carried data.

This is the in-object successor of the T2 `MetriplecticCore` run (`single_source` /
`price_is_grad` / `R_psd`): here the potential is CONCRETE (the pool potential below), so the
metriplectic readings are GROUNDED on the object, not carried.

**HONEST GAP (state it in the docstring, do not paper over):** the lens shape enters as a FIELD
(`lens : LensShape`, a calibration parameter with axioms) — it is NOT derived from the object's
free energy. That derivation is OPEN; the structure must say so.

## Engine ground truth this formalizes (HEAD `engine/builds/HEAD_temporal_mvp_v28_lens.html` L1600–1709)
- state `{x, y, alpha, beta}`; `w = alpha/x`; mode/center `getSNorm = (1−w)/w`;
  `getMP_raw = w·y/((1−w)·x)`; trades conserve `alpha, beta` and move along
  `(x−alpha)(y−beta) = alpha·beta` (`tradeUpdate`, Identity IV:
  `dx = −alpha·beta·dy/((y−beta)(y_new−beta))`);
- lens `h_τ(u)=√(τ²+u²)−τ`, `h′_τ(u)=u/√(τ²+u²)`, `g_loc(K)=γ·h′_τ(|u|)`, `u=ln(θ_K/mode)`,
  `γ=w/(1−w)` live;
- smooth-paste (`markLensed`, call arm): `sStar=θ·((g+1)/g)^g`, `c=1/((g+1)·sStar)`,
  continuation `c·s` then intrinsic `1−(s/θ)^(−1/g)`;
- goal-seek readout `goalSeekW(G)=G/(1+G)`;
- rebase: `x→r·x, alpha→r·alpha, beta, y invariant`.
- Closed forms on the trade flow (research note `CONTINUOUS_trade_warp_lens_calculus_2026-06-12`,
  float64-verified ≤3e-13 against the live engine): `x(y)=alpha·y/(y−beta)`, `w(y)=1−beta/y`,
  `γ(y)=(y−beta)/beta` (affine in cash), `center=1/γ`, `p=(y−beta)²/(alpha·beta)`.

## Lean (project `RequestProject`, NEW file `RequestProject/Monolith.lean`, standalone `import Mathlib`)

Use EXACTLY this structure block (byte-identical in the companion warp submission — do not rename
fields or reorder; downstream files key off it):

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

### Derived `def`s (all in `namespace TemporalAMM`, all reading the one object `P`)
```lean
def x      (P : TemporalAMM) : ℝ := P.alpha * P.y / (P.y - P.beta)   -- asset reserve (pool curve)
def w      (P : TemporalAMM) : ℝ := 1 - P.beta / P.y                  -- Balancer weight
def gamma  (P : TemporalAMM) : ℝ := (P.y - P.beta) / P.beta           -- steepness γ
def center (P : TemporalAMM) : ℝ := P.beta / (P.y - P.beta)           -- 45°-tangent mode (getSNorm)
def price  (P : TemporalAMM) : ℝ := (P.y - P.beta)^2 / (P.alpha * P.beta)  -- raw price (getMP_raw)
def carry  (P : TemporalAMM) : ℝ := Real.log P.price                  -- carry = the price leg q = ln p
def poolPotential (P : TemporalAMM) (t : ℝ) : ℝ := (t - P.beta)^3 / (3 * P.alpha * P.beta)
def trade  (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) : TemporalAMM :=
  ⟨P.alpha, P.beta, P.y + D, P.lens, P.halpha, P.hbeta, hD⟩
def rebase (P : TemporalAMM) (r : ℝ) (hr : 0 < r) : TemporalAMM :=
  ⟨r * P.alpha, P.beta, P.y, P.lens, mul_pos hr P.halpha, P.hbeta, P.hy⟩
def lensU  (P : TemporalAMM) (θ : ℝ) : ℝ := Real.log (θ / P.center)   -- = log (θ·γ)
def g      (P : TemporalAMM) (θ : ℝ) : ℝ := P.gamma * P.lens.Phi |P.lensU θ|  -- lensed exponent g_loc
```
Global (object-adjacent) defs:
```lean
def gammaOfW (w : ℝ) : ℝ := w / (1 - w)
def goalSeekW (G : ℝ) : ℝ := G / (1 + G)
-- settlement smooth-paste in the sNorm coordinate (call arm), strike θ, exponent g:
def sStar    (g θ : ℝ) : ℝ := θ * ((g + 1) / g) ^ g          -- Real.rpow
def pasteC   (g θ : ℝ) : ℝ := 1 / ((g + 1) * sStar g θ)
def markCont (g θ s : ℝ) : ℝ := pasteC g θ * s
def markInt  (g θ s : ℝ) : ℝ := 1 - (s / θ) ^ (-(1:ℝ) / g)   -- Real.rpow
```

### Theorems (prove ALL; each is a component mapped INTO the structure)
Positivity plumbing first (provable one-liners, used everywhere):
`x_pos`, `w_pos : 0 < P.w`, `w_lt_one : P.w < 1`, `gamma_pos`, `center_pos`, `price_pos`.

1. **`invariant`** (pool curve / C1): `(P.x - P.alpha) * (P.y - P.beta) = P.alpha * P.beta`.
2. **`w_consistency`** (Balancer reading): `P.alpha / P.x = P.w`.
3. **`gamma_eq`**: `P.gamma = P.w / (1 - P.w)`  and  **`center_eq_inv_gamma`**: `P.center = 1 / P.gamma`
   and **`center_eq_sNorm`**: `P.center = (1 - P.w) / P.w`.
4. **`price_eq_slope`** (v28 single-basis fact, C10/C12 made precise):
   `P.price = (P.w * P.y) / ((1 - P.w) * P.x)`.
5. **`price_is_grad`** (T2 metriplectic, now CONCRETE): `HasDerivAt P.poolPotential P.price P.y`
   (equivalently `deriv P.poolPotential P.y = P.price`).
6. **`R_psd`** (dissipation leg ⪰ 0, concrete): `∀ t, P.beta ≤ t → 0 ≤ deriv (deriv P.poolPotential) t`.
   (μ″(t) = 2(t−β)/(αβ); derive it, don't assume.)
7. **`trade_conserves`** (conservation law / Casimirs): `(P.trade D hD).alpha = P.alpha ∧ (P.trade D hD).beta = P.beta`.
8. **`trade_flow_group`** (path-independence of the pool flow):
   `(P.trade D₁ h₁).trade D₂ h₂ = P.trade (D₁ + D₂) h₃` (with `h₃` the obvious hypothesis; fields
   are equal and the Prop fields are proof-irrelevant).
9. **`trade_dx`** (engine Identity IV): `(P.trade D hD).x - P.x = -(P.alpha * P.beta * D) / ((P.y - P.beta) * (P.y + D - P.beta))`.
10. **`gamma_affine`** (steepness linear in cash — the closed-form trade flow):
    `(P.trade D hD).gamma = P.gamma + D / P.beta`.
11. **`rebase_x_scales`**: `(P.rebase r hr).x = r * P.x`; **`rebase_w_invariant`**: `(P.rebase r hr).w = P.w`;
    **`rebase_gamma_invariant`**, **`rebase_center_invariant`**, **`rebase_g_invariant`**:
    `(P.rebase r hr).g θ = P.g θ`.
12. **`trade_rebase_commute`** (the OPEN warp∘rebase-commute lemma, C5 — a register target):
    `(P.rebase r hr).trade D hD = (P.trade D hD).rebase r hr` (same field algebra; state with the
    needed hypothesis transport).
13. **`g_nonneg`**: `0 ≤ P.g θ` and **`g_le_gamma`** (cap-free lens bound): `P.g θ ≤ P.gamma`.
14. **`g_zero_at_center`** (funding zero at the 45° point): `P.g P.center = 0`.
15. **`goalSeek_root`**: `∀ G, 0 < G → gammaOfW (goalSeekW G) = G`; **`goalSeek_ge_half`**:
    `1 ≤ G → 1/2 ≤ goalSeekW G`; **`goalSeek_strictMono`**: `StrictMonoOn goalSeekW (Set.Ioi 0)`.
16. **`paste_value`** (smooth-paste value seam, C7): for `0 < g`, `0 < θ`:
    `markCont g θ (sStar g θ) = markInt g θ (sStar g θ)` (both sides = `1/(g+1)`).
17. **`paste_slope`** (smooth-paste slope seam): for `0 < g`, `0 < θ`:
    `HasDerivAt (markInt g θ) (pasteC g θ) (sStar g θ)`.
18. **Canonical lens instance** `polarLens (τ : ℝ) (hτ : 0 < τ) : LensShape` with
    `Phi := fun u => u / Real.sqrt (τ^2 + u^2)` — discharge all five axiom fields (no carried hyps).
19. **The engine instance** (the calibrated worked pool, x₀=1000, w₀=0.725):
    ```lean
    def engineInstance : TemporalAMM :=
      ⟨725, 275, 1000, polarLens (3/10) (by norm_num), by norm_num, by norm_num, by norm_num⟩
    theorem engineInstance_x : engineInstance.x = 1000
    theorem engineInstance_w : engineInstance.w = 29/40
    theorem engineInstance_gamma : engineInstance.gamma = 29/11
    theorem engineInstance_center : engineInstance.center = 11/29
    theorem engineInstance_gamma_gt_one : 1 < engineInstance.gamma
    ```
20. **`single_object`** (the headline, the T2 `single_source` shape on the monolith): two
    `TemporalAMM`s with the same `alpha`, `beta`, `y` and the same `lens.Phi` have identical
    `x`, `w`, `gamma`, `center`, `price`, and `g` — fix the carried data and every reading is fixed.

## HARD CONSTRAINTS (violation = reject)
- ONE structure. Every primitive is a field of `TemporalAMM` or a `def`/theorem reading it.
  Do NOT introduce a second state record, a second potential, or free-floating duplicates.
- The structure block above must appear EXACTLY as given (field names/order); add lemmas freely
  below it.
- `R_psd` and `price_is_grad` must be DERIVED from `poolPotential` by real differentiation,
  not assumed.
- The lens axioms are discharged for `polarLens` concretely; the abstract `LensShape` field
  carries them as structure fields (this is the documented honest gap, NOT an `axiom` decl).
- No `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`, no new `axiom` declarations.
- If a theorem cannot close, leave ONE `sorry` on that theorem only and report it under
  "COULD NOT CLOSE" honestly; do NOT weaken statements to force closure.

## Output spec
- NEW file `RequestProject/Monolith.lean` compiles server-side standalone (`import Mathlib`).
- `#print axioms` for every named theorem ⊆ {propext, Classical.choice, Quot.sound}.
- ARISTOTLE_SUMMARY.md: theorems proved; GROUNDED vs CARRIED[named]; SIGNATURE ADJUSTMENTS;
  FRAGILE TACTICS; COULD NOT CLOSE.
- ONLY `RequestProject/Monolith.lean` is new/changed; do NOT touch existing modules,
  `lakefile.toml`, or `lean-toolchain`.

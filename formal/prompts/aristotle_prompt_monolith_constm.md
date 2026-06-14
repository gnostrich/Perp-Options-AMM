# MONOLITH (CONSTANT-m) — `TemporalAMM`: the single pure-math structure, simplified lens

Toolchain: **Lean 4.28.0 + Mathlib v4.28.0** (match `lean-toolchain`).

## Intent (operator entry 179 + entry 229/230)
ONE Lean `structure` capturing the whole Temporal AMM, every component a FIELD/`def`/theorem
WITHIN it (entry 179 "single pure math structure ... mapping the components within that"). Operator
entry 229 redefined the kurtosis lens to a **CONSTANT slope multiplier `m`**: the displayed option-
value local exponent is `g_loc(K) = m·γ`, the SAME at every strike (no position dependence). `m = 1`
is the plain Balancer curve (steepness γ); `m > 1` is steeper everywhere. This SIMPLIFIES the object:
the lens is no longer a 5-axiom shape bundle but a single positive scalar, and the warp becomes
linear (`ΔG = m·Δγ`). State it cleanly.

This supersedes the polar-lens monolith (`aristotle_prompt_monolith_core.md` /
`aristotle_prompt_monolith_warp.md`): the `LensShape` field, `polarLens`, and the √-kernel warp
calculus are REMOVED. Everything about the plain Balancer pool and the g-parametric smooth-paste is
KEPT (it is unchanged by the lens redefinition).

## Engine ground truth (HEAD `engine/builds/HEAD_temporal_mvp_v28_lens.html` L1600–1709, plus entry 229)
- state `{x,y,alpha,beta}`; `w=alpha/x`; mode/center `getSNorm=(1−w)/w`; trades conserve
  `alpha,beta` along `(x−alpha)(y−beta)=alpha·beta` (Identity IV:
  `dx=−alpha·beta·dy/((y−beta)(y_new−beta))`).
- Closed forms on the trade flow (float64-verified ≤3e-13 against the live engine):
  `x(y)=alpha·y/(y−beta)`, `w(y)=1−beta/y`, `γ(y)=(y−beta)/beta` (affine in cash), `center=1/γ`,
  `p=(y−beta)²/(alpha·beta)`.
- **Lens (entry 229, constant-m):** `g_loc(K) = m·γ` (constant in the strike θ); coordinate map
  `u_true = m·u`, `u = ln(θ/center)`; effective-strike `θ_tx = center·(θ/center)^m`.
- smooth-paste (`markLensed`, call arm) at any exponent `g>0`: `sStar=θ·((g+1)/g)^g`,
  `c=1/((g+1)·sStar)`, continuation `c·s`, intrinsic `1−(s/θ)^(−1/g)` (this is UNCHANGED — it now
  takes the constant `g = m·γ`).
- goal-seek readout `goalSeekW(G)=G/(1+G)`; rebase `x→r·x, alpha→r·alpha, beta,y invariant`.

## Lean (project `RequestProject`, NEW file `RequestProject/MonolithConstM.lean`, `import Mathlib`)

Use EXACTLY this structure block (do not rename fields or reorder):

```lean
import Mathlib

noncomputable section
open Real

/-- THE single pure-math object (operator entry 179), with the constant-m lens (entry 229).
    Carried data: the two conserved trade charges `alpha, beta` (Casimirs of the trade flow),
    ONE state coordinate (the cash reserve `y`), and the kurtosis slope multiplier `m`.
    The lens is no longer a shape bundle — it is the single positive scalar `m`: the displayed
    local exponent is `m * gamma`, constant at every strike (`m = 1` = plain Balancer). -/
structure TemporalAMM where
  alpha : ℝ
  beta  : ℝ
  y     : ℝ
  m     : ℝ
  halpha : 0 < alpha
  hbeta  : 0 < beta
  hy     : beta < y
  hm     : 0 < m
```

### Derived `def`s (all in `namespace TemporalAMM`, all reading the one object `P`)
```lean
def x      (P : TemporalAMM) : ℝ := P.alpha * P.y / (P.y - P.beta)
def w      (P : TemporalAMM) : ℝ := 1 - P.beta / P.y
def gamma  (P : TemporalAMM) : ℝ := (P.y - P.beta) / P.beta
def center (P : TemporalAMM) : ℝ := P.beta / (P.y - P.beta)
def price  (P : TemporalAMM) : ℝ := (P.y - P.beta)^2 / (P.alpha * P.beta)
def carry  (P : TemporalAMM) : ℝ := Real.log P.price
def poolPotential (P : TemporalAMM) (t : ℝ) : ℝ := (t - P.beta)^3 / (3 * P.alpha * P.beta)
def trade  (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) : TemporalAMM :=
  ⟨P.alpha, P.beta, P.y + D, P.m, P.halpha, P.hbeta, hD, P.hm⟩
def rebase (P : TemporalAMM) (r : ℝ) (hr : 0 < r) : TemporalAMM :=
  ⟨r * P.alpha, P.beta, P.y, P.m, mul_pos hr P.halpha, P.hbeta, P.hy, P.hm⟩
def lensU  (P : TemporalAMM) (θ : ℝ) : ℝ := Real.log (θ / P.center)
def g      (P : TemporalAMM) (θ : ℝ) : ℝ := P.m * P.gamma          -- constant-m: NO θ-dependence
def thetaTx (P : TemporalAMM) (θ : ℝ) : ℝ := P.center * (θ / P.center) ^ P.m  -- Real.rpow
```
Global (object-adjacent) defs (UNCHANGED from the polar monolith):
```lean
def gammaOfW (w : ℝ) : ℝ := w / (1 - w)
def goalSeekW (G : ℝ) : ℝ := G / (1 + G)
def sStar    (g θ : ℝ) : ℝ := θ * ((g + 1) / g) ^ g
def pasteC   (g θ : ℝ) : ℝ := 1 / ((g + 1) * sStar g θ)
def markCont (g θ s : ℝ) : ℝ := pasteC g θ * s
def markInt  (g θ s : ℝ) : ℝ := 1 - (s / θ) ^ (-(1:ℝ) / g)
```

### Theorems (prove ALL; each is a component mapped INTO the structure)
Positivity plumbing first: `x_pos`, `w_pos`, `w_lt_one`, `gamma_pos`, `center_pos`, `price_pos`.

1. **`invariant`** (C1): `(P.x - P.alpha) * (P.y - P.beta) = P.alpha * P.beta`.
2. **`w_consistency`**: `P.alpha / P.x = P.w`.
3. **`gamma_eq`**: `P.gamma = P.w / (1 - P.w)`; **`center_eq_inv_gamma`**: `P.center = 1 / P.gamma`;
   **`center_eq_sNorm`**: `P.center = (1 - P.w) / P.w`.
4. **`price_eq_slope`**: `P.price = (P.w * P.y) / ((1 - P.w) * P.x)`.
5. **`price_is_grad`** (T2 metriplectic, concrete): `HasDerivAt P.poolPotential P.price P.y`.
6. **`R_psd`** (dissipation ⪰0): `∀ t, P.beta ≤ t → 0 ≤ deriv (deriv P.poolPotential) t`
   (μ″(t)=2(t−β)/(αβ); derive it).
7. **`trade_conserves`**: `(P.trade D hD).alpha = P.alpha ∧ (P.trade D hD).beta = P.beta`.
8. **`trade_flow_group`**: `(P.trade D₁ h₁).trade D₂ h₂ = P.trade (D₁+D₂) h₃`.
9. **`trade_dx`** (Identity IV): `(P.trade D hD).x - P.x = -(P.alpha*P.beta*D)/((P.y-P.beta)*(P.y+D-P.beta))`.
10. **`gamma_affine`**: `(P.trade D hD).gamma = P.gamma + D / P.beta`.
11. **`rebase_x_scales`** `(P.rebase r hr).x = r*P.x`; **`rebase_w/gamma/center_invariant`**;
    **`rebase_m_invariant`** `(P.rebase r hr).m = P.m`; **`rebase_g_invariant`** `(P.rebase r hr).g θ = P.g θ`.
12. **`trade_rebase_commute`** (C5): `(P.rebase r hr).trade D hD = (P.trade D hD).rebase r hr`.

**Constant-m lens theorems (the redefinition, stated as theorems — NOT the old polar facts):**
13. **`g_eq_m_gamma`**: `P.g θ = P.m * P.gamma` (definitional; the constant-m headline).
14. **`g_const_in_strike`**: `∀ θ₁ θ₂, P.g θ₁ = P.g θ₂` (strike-independence — the whole point).
15. **`g_pos`**: `0 < P.g θ`. **`g_eq_gamma_iff_m_one`**: `P.g θ = P.gamma ↔ P.m = 1`
    (m=1 ⇔ plain Balancer). **`g_ge_gamma_of_m_ge_one`**: `1 ≤ P.m → P.gamma ≤ P.g θ`.
    (NOTE: there is NO `g ≤ gamma` cap and NO `g = 0 at center` — those polar facts are DELETED by
    the redefinition; do not state them.)
16. **`thetaTx_roundtrip`** (the linear, invertible trade map): for `0 < θ`, `0 < P.m`,
    composing `thetaTx` with exponent `1/m` returns θ — concretely
    `P.center * (P.thetaTx θ / P.center) ^ (1 / P.m) = θ`. **`thetaTx_strictMono`**:
    `StrictMonoOn (P.thetaTx) (Set.Ioi 0)` for `0 < P.m`.

**Warp, now LINEAR (collapses the √-kernel calculus):**
17. **`warp_linear`**: define `warpInt (P) (g0 g1 : ℝ) : ℝ := ∫ t in g0..g1, P.m` and prove
    `P.warpInt g0 g1 = P.m * (g1 - g0)`. (The integrand is the constant `m`; this is `intervalIntegral.integral_const` / `MeasureTheory.integral_const` reduced.)
18. **`warp_roundtrip_zero`**: `P.warpInt g0 g1 + P.warpInt g1 g0 = 0`.
19. **`warp_nonneg_of_buy`**: `g0 ≤ g1 → 0 ≤ P.warpInt g0 g1`; **`warp_eq_m_dgamma`**: along a trade,
    `P.warpInt P.gamma ((P.trade D hD).gamma) = P.m * (D / P.beta)` (using `gamma_affine`).

**Smooth-paste (C7), UNCHANGED, instantiated at the constant g = m·γ:**
20. **`paste_value`**: for `0 < g`, `0 < θ`: `markCont g θ (sStar g θ) = markInt g θ (sStar g θ)`
    (both = `1/(g+1)`).
21. **`paste_slope`**: for `0 < g`, `0 < θ`: `HasDerivAt (markInt g θ) (pasteC g θ) (sStar g θ)`.
    (These hold ∀ g>0, so they apply directly to `g = P.m * P.gamma`.)

**Goal-seek + the engine instance:**
22. **`goalSeek_root`**: `∀ G, 0 < G → gammaOfW (goalSeekW G) = G`; **`goalSeek_ge_half`**:
    `1 ≤ G → 1/2 ≤ goalSeekW G`; **`goalSeek_strictMono`**: `StrictMonoOn goalSeekW (Set.Ioi 0)`.
23. **The engine instance** (calibrated worked pool x₀=1000, w₀=0.725; pick m=1 = plain baseline):
    ```lean
    def engineInstance : TemporalAMM :=
      ⟨725, 275, 1000, 1, by norm_num, by norm_num, by norm_num, by norm_num⟩
    theorem engineInstance_x : engineInstance.x = 1000
    theorem engineInstance_w : engineInstance.w = 29/40
    theorem engineInstance_gamma : engineInstance.gamma = 29/11
    theorem engineInstance_g_eq_gamma : ∀ θ, engineInstance.g θ = engineInstance.gamma  -- m=1
    theorem engineInstance_gamma_gt_one : 1 < engineInstance.gamma
    ```
24. **`single_object`** (the headline): two `TemporalAMM`s with the same `alpha, beta, y, m` have
    identical `x, w, gamma, center, price, g`.

## HARD CONSTRAINTS (violation = reject)
- ONE structure. Every primitive is a field of `TemporalAMM` or a `def`/theorem reading it.
- The structure block above must appear EXACTLY as given (field names/order).
- `R_psd`/`price_is_grad` DERIVED by real differentiation, not assumed.
- Do NOT reintroduce a `LensShape` field, `polarLens`, `√(τ²+u²)`, or any θ-dependent `g`.
- Do NOT state the polar-only facts `g = 0 at center` or `g ≤ gamma` — they are deleted by the
  redefinition. (Stating them would weaken the object back to the old lens — that is a reject.)
- No `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`, no new `axiom` declarations.
- If a theorem cannot close, leave ONE `sorry` on that theorem only and report under
  "COULD NOT CLOSE"; do NOT weaken statements to force closure.

## Output spec
- NEW file `RequestProject/MonolithConstM.lean` compiles server-side standalone (`import Mathlib`).
- `#print axioms` for every named theorem ⊆ {propext, Classical.choice, Quot.sound}.
- ARISTOTLE_SUMMARY.md: theorems proved; GROUNDED vs CARRIED[named]; SIGNATURE ADJUSTMENTS;
  FRAGILE TACTICS; COULD NOT CLOSE.
- ONLY `RequestProject/MonolithConstM.lean` is new/changed; do NOT touch existing modules,
  `lakefile.toml`, or `lean-toolchain`.

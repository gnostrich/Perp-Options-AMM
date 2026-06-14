# LENSKERNEL — v28 engine-subset definitions (L2) + lens basics + smooth-paste port + rebase invariance

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math

The live engine (`HEAD_temporal_mvp_v28_lens.html`) is a plain Balancer pool — full state
`{x, y, alpha, beta}` with `w = alpha/x` derived — plus a STATIC polar lens in the read layer.
This run transcribes the core numerical kernel as precise Lean definitions (each def mirrors ONE
JS function, line-cited) and proves the spec properties the engine's gates test numerically:

1. `tradeUpdate` conserves `alpha`, `beta` and the hyperbola `(x−α)(y−β)=αβ` (the pool invariant).
2. Closed-form trade flow on the hyperbola: `w = 1 − β/y`, `γ = (y−β)/β` (steepness LINEAR in the
   cash reserve), `center = 1/γ`, `mpRaw = βγ²/α`.
3. The flow law: `γ(tradeUpdate s dy) = γ(s) + dy/β` — every dollar adds steepness `1/β`,
   strike-blind (pool constant).
4. Rebase invariance: `rebase` (x→rx, α→rα) preserves `w`, hence `γ`, `center`, and the whole
   lensed exponent `gLoc` — the lens-read∘rebase commutation on v28.
5. Lens basics: `Φ_τ(u) = u/√(τ²+u²)` satisfies Φ(0)=0, 0≤Φ≤1 on u≥0, Φ<1 for τ>0, strict
   monotone on [0,∞); hence `gLoc = γ·Φ_τ(|u|)` is ≥0, ≤γ (cap-free bound), and =0 at the mode.
6. Smooth-paste port (call arm of `markLensed`): at the free boundary
   `sNorm* = θ·((g+1)/g)^g` the continuation `sNorm/((g+1)·sNorm*)` and the intrinsic
   `1 − (sNorm/θ)^(−1/g)` agree in VALUE and SLOPE — for EVERY g>0, including 0<g<1 (the lens
   flat-top regime). This is the R1/T1a seam with the strike-local exponent g in place of γ;
   note NO γ>1 hypothesis is used.

## Lean (project `RequestProject`, NEW standalone file `RequestProject/LensKernel.lean`, `import Mathlib`)

Use these definitions VERBATIM (each comment cites the JS function it mirrors — do not change
the math; rename only if a name collides):

```lean
import Mathlib

namespace LensKernel

/-- Pool state {x, y, alpha, beta}; w is derived. Mirrors the engine state object. -/
structure Pool where
  x : ℝ
  y : ℝ
  alpha : ℝ
  beta : ℝ

/-- Regular (live-domain) pool: positive reserves, 0<w<1, cash above beta, and the
hyperbola invariant. Mirrors the engine's implicit domain. -/
def Pool.Reg (s : Pool) : Prop :=
  0 < s.alpha ∧ s.alpha < s.x ∧ 0 < s.beta ∧ s.beta < s.y ∧
  (s.x - s.alpha) * (s.y - s.beta) = s.alpha * s.beta

noncomputable def Pool.w (s : Pool) : ℝ := s.alpha / s.x            -- getW, HEAD L1601
noncomputable def Pool.center (s : Pool) : ℝ := (1 - s.w) / s.w     -- getSNorm, HEAD L1602
noncomputable def Pool.gamma (s : Pool) : ℝ := s.w / (1 - s.w)      -- γ = w/(1−w), gLoc body HEAD L1641
noncomputable def Pool.mpRaw (s : Pool) : ℝ := s.w * s.y / ((1 - s.w) * s.x)  -- getMP_raw, HEAD L1604

/-- Identity-IV closed-form trade update. Mirrors tradeUpdate, HEAD L1679–1687:
dx = −αβ·dy/((y−β)(y+dy−β)); alpha, beta carried unchanged. -/
noncomputable def tradeUpdate (s : Pool) (dy : ℝ) : Pool :=
  { x := s.x - s.alpha * s.beta * dy / ((s.y - s.beta) * (s.y + dy - s.beta))
    y := s.y + dy
    alpha := s.alpha
    beta := s.beta }

/-- Rebase: x→rx, α→rα, y and β invariant. Mirrors rebase, HEAD L1691–1693. -/
def rebase (s : Pool) (r : ℝ) : Pool :=
  { x := r * s.x, y := s.y, alpha := r * s.alpha, beta := s.beta }

noncomputable def hT (tau u : ℝ) : ℝ := Real.sqrt (tau^2 + u^2) - tau   -- hTau, HEAD L1630
noncomputable def Phi (tau u : ℝ) : ℝ := u / Real.sqrt (tau^2 + u^2)    -- hpTau (h′_τ), HEAD L1631
noncomputable def lensU (s : Pool) (theta : ℝ) : ℝ := Real.log (theta / s.center)  -- lensU, HEAD L1633
noncomputable def gLoc (s : Pool) (theta tau : ℝ) : ℝ :=
  s.gamma * Phi tau |lensU s theta|                                      -- gLoc, HEAD L1639–1645

/-- Call-arm free boundary, continuation, intrinsic. Mirrors markLensed call arm,
HEAD L1655–1660. Real.rpow throughout. -/
noncomputable def sStarCall (theta g : ℝ) : ℝ := theta * ((g + 1) / g) ^ (g : ℝ)
noncomputable def contCall (theta g sN : ℝ) : ℝ := sN / ((g + 1) * sStarCall theta g)
noncomputable def intrCall (theta g sN : ℝ) : ℝ := 1 - (sN / theta) ^ (-(1 / g) : ℝ)

end LensKernel
```

(`^` on the last three defs is `Real.rpow`; make that explicit if elaboration picks `Monoid.npow`.)

### Proof targets (prove ALL; do NOT weaken statements)

Pool/flow (assume `hs : s.Reg` and, where a trade occurs, `hdy : 0 < s.y + dy - s.beta`):

- **`tradeUpdate_alpha`** : `(tradeUpdate s dy).alpha = s.alpha` (and **`tradeUpdate_beta`** likewise). `rfl`-level.
- **`tradeUpdate_hyperbola`** : hyperbola preserved —
  `((tradeUpdate s dy).x - s.alpha) * ((tradeUpdate s dy).y - s.beta) = s.alpha * s.beta`.
  Route: from Reg, `x − α = αβ/(y−β)`; then `x' − α = αβ/(y'−β)` by field algebra.
- **`tradeUpdate_reg`** : `(tradeUpdate s dy).Reg`.
- **`w_closed_form`** : `s.w = 1 - s.beta / s.y`. (Expand the hyperbola: xy − xβ − αy = 0.)
- **`gamma_closed_form`** : `s.gamma = (s.y - s.beta) / s.beta`.
- **`center_closed_form`** : `s.center = s.beta / (s.y - s.beta)` and
  **`center_eq_inv_gamma`** : `s.center = 1 / s.gamma`.
- **`gamma_linear_in_cash`** (the flow law — headline): 
  `(tradeUpdate s dy).gamma = s.gamma + dy / s.beta`.
- **`mpRaw_closed_form`** : `s.mpRaw = s.beta * s.gamma^2 / s.alpha`.

Rebase (assume `hr : 0 < r`):

- **`rebase_w`** : `(rebase s r).w = s.w`; corollaries **`rebase_gamma`**, **`rebase_center`**.
- **`gLoc_rebase_invariant`** : `gLoc (rebase s r) theta tau = gLoc s theta tau`.

Lens basics (`htau : 0 < tau` where stated):

- **`Phi_zero`** : `Phi tau 0 = 0`.
- **`Phi_nonneg`** : `0 ≤ u → 0 ≤ Phi tau u`.
- **`Phi_le_one`** : `0 ≤ u → Phi tau u ≤ 1`.
- **`Phi_lt_one`** : `0 < tau → Phi tau u < 1`.
- **`Phi_strictMonoOn`** : `0 < tau → StrictMonoOn (Phi tau) (Set.Ici 0)`.
  (E.g. for 0≤u₁<u₂: compare squares, or u/√(τ²+u²) = 1/√(τ²/u²+1) for u>0 plus the u₁=0 case.)
- **`gLoc_nonneg`** : `s.Reg → 0 ≤ tau → 0 ≤ gLoc s theta tau`.
- **`gLoc_le_gamma`** : `s.Reg → gLoc s theta tau ≤ s.gamma` (the cap-free bound g ≤ γ).
- **`gLoc_at_mode`** : `s.Reg → gLoc s s.center tau = 0` (lensU s s.center = log 1 = 0).

Smooth-paste port (assume `hg : 0 < g`, `hθ : 0 < theta` — NO g>1 hypothesis anywhere):

- **`sStarCall_pos`** : `0 < sStarCall theta g`.
- **`sStarCall_ge_theta`** : `theta ≤ sStarCall theta g` (base (g+1)/g ≥ 1, rpow with g ≥ 0).
- **`valueMatch_g`** : `contCall theta g (sStarCall theta g) = intrCall theta g (sStarCall theta g)`
  — both sides equal `1/(g+1)`; you may prove the two evaluation lemmas
  `contCall_at_sStar : contCall theta g (sStarCall theta g) = 1/(g+1)` and
  `intrCall_at_sStar : intrCall theta g (sStarCall theta g) = 1/(g+1)` and chain them.
  (Key rpow algebra: `(sStarCall/theta)^(−1/g) = (((g+1)/g)^g)^(−1/g) = ((g+1)/g)^(−1) = g/(g+1)`.)
- **`slopeMatch_g`** : `HasDerivAt (fun sN => intrCall theta g sN) (1 / ((g+1) * sStarCall theta g)) (sStarCall theta g)`
  — the intrinsic's slope at the boundary equals the continuation's constant slope
  `1/((g+1)·sNorm*)`. (Derivative of `1 − (s/θ)^(−1/g)` is `(1/(gθ))·(s/θ)^(−1/g−1)`; evaluate via
  the same rpow collapse.) Also state **`contCall_hasDerivAt`** :
  `HasDerivAt (fun sN => contCall theta g sN) (1 / ((g+1) * sStarCall theta g)) sN` (any sN; linear).

## What stays CARRIED / out of scope (state honestly in ARISTOTLE_SUMMARY.md)
- Nothing about the JS itself is claimed — these defs MIRROR the cited HEAD functions; the
  JS↔def correspondence is checked by a separate Node oracle (L3), not by this run.
- The put arm of markLensed is symmetric and NOT required this run.
- No measure theory, no integrals here (the warp calculus is a separate run).

## HARD CONSTRAINTS (violation = reject)
- Keep every definition EXACTLY as given (modulo a name collision rename, reported).
- No `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`, no new `axiom`.
- Do NOT add hypotheses beyond those stated per target (in particular NO `1 < g`, NO `1 ≤ gamma`).
- Prefer concrete lemmas (`Real.rpow_natCast`/`rpow_mul`/`rpow_neg`, `HasDerivAt.rpow`,
  `div_add_div`, field_simp+ring). AVOID `grind`/`exact?`/`simp?` in FINAL bodies; if unavoidable,
  FLAG under "FRAGILE TACTICS" with line + the concrete replacement.
- If a target genuinely cannot close, leave exactly that ONE `sorry` and report it under
  "COULD NOT CLOSE" — do not silently weaken.

## Output spec
- `RequestProject/LensKernel.lean` compiles server-side (Lean 4.28.0 / Mathlib v4.28.0).
- `#print axioms` for `tradeUpdate_hyperbola`, `gamma_linear_in_cash`, `gLoc_rebase_invariant`,
  `gLoc_le_gamma`, `valueMatch_g`, `slopeMatch_g` ⊆ {propext, Classical.choice, Quot.sound}.
- ARISTOTLE_SUMMARY.md: proved list, SIGNATURE ADJUSTMENTS, FRAGILE TACTICS, COULD NOT CLOSE.
- ONLY `RequestProject/LensKernel.lean` is new; do NOT touch `lakefile.toml`, `lean-toolchain`,
  `AMMCurve.lean`, `Seam.lean`, `Temporal.lean`, `Main.lean`, `Audit.lean`.

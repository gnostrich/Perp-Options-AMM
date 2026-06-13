# Summary of changes for run 3f85462d-bee4-4e32-8613-e27f68906772
Created the new file `RequestProject/MonolithConstM.lean` (with `import Mathlib`) implementing the constant‑m monolith exactly as specified. The whole Temporal AMM is one pure‑math `structure TemporalAMM` (verbatim field block `alpha, beta, y, m` + positivity proofs), with every component a `def`/theorem reading that single object. The kurtosis lens is the single scalar `m` (displayed local exponent `g_loc = m·γ`, constant at every strike).

All requested theorems are proved with no `sorry`/`admit`/`native_decide`/`axiom`/`opaque`/`unsafe`:
- Positivity: y_pos, x_pos, w_pos, w_lt_one, gamma_pos, center_pos, price_pos.
- Core identities: invariant (C1), w_consistency, gamma_eq, center_eq_inv_gamma, center_eq_sNorm, price_eq_slope.
- Metriplectic, derived by genuine real differentiation: price_is_grad (HasDerivAt poolPotential price y), R_psd (second derivative 2(t−β)/(αβ) ≥ 0 for β ≤ t).
- Trade flow: trade_conserves, trade_flow_group, trade_dx (Identity IV), gamma_affine.
- Rebase symmetry: rebase_x_scales, rebase_w/gamma/center_invariant, rebase_m_invariant, rebase_g_invariant, trade_rebase_commute (C5).
- Constant‑m lens: g_eq_m_gamma, g_const_in_strike, g_pos, g_eq_gamma_iff_m_one, g_ge_gamma_of_m_ge_one, thetaTx_roundtrip (linear invertible rpow map), thetaTx_strictMono. The deleted polar facts (g=0 at center, g ≤ gamma) and LensShape/polarLens/√‑kernel are NOT present.
- Linear warp: warp_linear (∫ m = m·(g1−g0)), warp_roundtrip_zero, warp_nonneg_of_buy, warp_eq_m_dgamma.
- Smooth‑paste (∀ g>0, instantiates at g=m·γ): paste_value, paste_slope.
- Goal‑seek: goalSeek_root, goalSeek_ge_half, goalSeek_strictMono.
- Engine instance: engineInstance_x (=1000), engineInstance_w (=29/40), engineInstance_gamma (=29/11), engineInstance_g_eq_gamma, engineInstance_gamma_gt_one.
- Headline: single_object.

The project builds successfully, no `sorry` remains, and `#print axioms` for every named theorem is ⊆ {propext, Classical.choice, Quot.sound}. Only `RequestProject/MonolithConstM.lean` is new; `lakefile.toml`, `lean-toolchain`, and existing modules were not modified. A report is in `ARISTOTLE_SUMMARY.md` (theorems proved; GROUNDED vs CARRIED; signature adjustments — notably the requested `warpInt` def; fragile tactics in `paste_slope`/`price_is_grad`; and COULD NOT CLOSE: none).

# MONOLITH (CONSTANT-m) — `TemporalAMM`

New file: `RequestProject/MonolithConstM.lean` (`import Mathlib`, compiles standalone, no `sorry`).

The whole Temporal AMM is captured as ONE pure-math `structure TemporalAMM`
(fields `alpha, beta, y, m` + positivity proofs), with every component a `def`/theorem reading
that single object. The kurtosis lens is the single positive scalar `m`: the displayed local
exponent is `g_loc = m·γ`, constant at every strike. The structure block is verbatim as specified.

## Theorems proved (all axioms ⊆ {propext, Classical.choice, Quot.sound})

Positivity: `y_pos`, `x_pos`, `w_pos`, `w_lt_one`, `gamma_pos`, `center_pos`, `price_pos`.

Core identities: `invariant` (C1), `w_consistency`, `gamma_eq`, `center_eq_inv_gamma`,
`center_eq_sNorm`, `price_eq_slope`.

Metriplectic (DERIVED by real differentiation, not assumed):
- `price_is_grad` : `HasDerivAt poolPotential price y` (μ′(t)=(t−β)²/(αβ)).
- `R_psd` : `0 ≤ deriv (deriv poolPotential) t` for `β ≤ t` (μ″(t)=2(t−β)/(αβ) ≥ 0).

Trade flow: `trade_conserves`, `trade_flow_group`, `trade_dx` (Identity IV), `gamma_affine`.

Rebase symmetry: `rebase_x_scales`, `rebase_w_invariant`, `rebase_gamma_invariant`,
`rebase_center_invariant`, `rebase_m_invariant`, `rebase_g_invariant`, `trade_rebase_commute` (C5).

Constant-m lens: `g_eq_m_gamma` (headline), `g_const_in_strike` (strike-independence), `g_pos`,
`g_eq_gamma_iff_m_one` (m=1 ⇔ plain Balancer), `g_ge_gamma_of_m_ge_one`,
`thetaTx_roundtrip` (linear invertible map via rpow, exponent 1/m), `thetaTx_strictMono`.
(The polar-only facts `g = 0 at center` and `g ≤ gamma` are intentionally NOT stated — deleted by
the redefinition. No `LensShape`, `polarLens`, or √-kernel appears.)

Warp (now LINEAR): `warp_linear` (`∫ m = m·(g1−g0)`), `warp_roundtrip_zero`,
`warp_nonneg_of_buy`, `warp_eq_m_dgamma` (along a trade, `= m·(D/β)`).

Smooth-paste (C7, unchanged, ∀ g>0 so applies at g=m·γ): `paste_value` (both arms = 1/(g+1)),
`paste_slope` (`HasDerivAt (markInt g θ) (pasteC g θ) (sStar g θ)`).

Goal-seek: `goalSeek_root`, `goalSeek_ge_half`, `goalSeek_strictMono`.

Engine instance (x₀=1000, w₀=0.725, m=1 baseline): `engineInstance_x` (=1000),
`engineInstance_w` (=29/40), `engineInstance_gamma` (=29/11),
`engineInstance_g_eq_gamma` (g θ = γ since m=1), `engineInstance_gamma_gt_one`.

Headline: `single_object` — equal `alpha,beta,y,m` ⇒ identical `x,w,gamma,center,price,g`.

## GROUNDED vs CARRIED
- GROUNDED (derived from the four carried scalars): every theorem above. In particular the
  metriplectic gradient/dissipation (`price_is_grad`, `R_psd`) are obtained by genuine real
  differentiation of `poolPotential`, and the lens round-trip/monotonicity from `Real.rpow`.
- CARRIED (structure fields / hypotheses): `alpha, beta, y, m` and their positivity
  `halpha, hbeta, hy : β<y, hm`. No extra carried obligations were introduced.

## SIGNATURE ADJUSTMENTS
- Added `def warpInt (P) (g0 g1) := ∫ _t in g0..g1, P.m` exactly as instructed (needed for the warp
  theorems).
- `single_object` stated as: equal-field hypotheses ⇒ conjunction of equalities of
  `x,w,gamma,center,price` and `∀ θ, g θ`.
- `thetaTx_roundtrip` keeps the explicitly-requested `(hθ : 0 < θ) (hm : 0 < P.m)` hypotheses even
  though `0 < P.m` is already a structure field (kept per the spec).

## FRAGILE TACTICS
- `paste_slope` uses a `convert ... using 1` against `HasDerivAt.rpow_const` followed by rpow
  algebra (`Real.rpow_sub`, `Real.rpow_neg_one`, `Real.rpow_mul`). The build emits two harmless
  info-level "ring → try ring_nf" suggestions inside this proof; they are not errors and the file
  compiles cleanly with no `sorry`.
- `price_is_grad` uses an explicit `convert` of nested `HasDerivAt` builders + `ring`.

## COULD NOT CLOSE
- None. All listed theorems are proved.

## Files
- Only `RequestProject/MonolithConstM.lean` is new. `lakefile.toml`, `lean-toolchain`, and existing
  modules are untouched. (`ARISTOTLE_SUMMARY.md` added as the requested report.)

# curves/balancer_w/ — the (W) / weight-profile family (curve-specific)

_Created 2026-06-11 (restructure slice 1). Curve-SPECIFIC material for the Balancer/(W) family:
`x^w·y^(1−w)=k` as base, skew via the weight, kurtosis via the τ weight-profile
`w(u; w₋, w₊, τ) = w_mid + (Δw/2)·u/√(τ²+u²)`. The curve-agnostic admission contracts these
candidates are tested against live in `framework/` (first-class); the live engine's GH family
and its pivot history live in `curves/gh/`._

## Contents

- `KURTOSIS_KNOB_kappa_balancer_native_2026-06-10.md` — the single-parameter, asymptote-
  respecting kurtosis knob `τ` on the Balancer curve (weight-profile form (W)). ⚠ Carries a
  standing skeptic DISPUTE HEADER (manager-verified): the closed-form invariant
  `x^{w_mid}·y^{1−w_mid}·e^{−(Δw/2)√(τ²+ln²(y/x))}=k` DOES exist (the note's §0 "none exists"
  is FALSE), and "GH = one (W) setting, τ≡δ EXACTLY" is FALSE at curve level — full verdict:
  `notes/skeptic/VERDICT_KURTOSIS_KNOB_2026-06-10.md` (the skeptic's channel, never moved).
- `HETEROGENEOUS_WEIGHT_implied_density_2026-06-09.md` — closed-form implied density of the
  position-dependent-weight Balancer: `q(u) = u + log-odds(w(u))`, slope law
  `dq/du = 1 + w′/(w(1−w))`; which "density object" is which, stated explicitly.

## Cross-links (mixed GH/(W) notes classified GH-dominant, live in curves/gh/)

- `curves/gh/CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md` — the GH-vs-CES/Balancer fork
  analysis (Balancer = the exact Gaussian/Merton power-law base; verdict = reparametrize GH,
  CES knob is elasticity not kurtosis). Lives with GH: its core is the GH transfer accounting.
- `curves/gh/REPARAM_balancer_kurtosis_dropin_2026-06-09.md` — where the exact Cobb-Douglas/
  Balancer curve sits inside GH (the δ→∞ Gaussian corner, NOT δ→0); βh=0 symmetry =
  the two-root Balancer structure. Lives with GH: it frees GH kernel pins.
- `curves/gh/PIVOT_MAP.md` — the engine's decision history (the (W) family has never been in
  the engine; feature-state row #1: "Conceptual base only", `engine/builds/DIFF_LEDGER.md`).

## Standing state (operator-tier)

The kurtosis-knob curve decision — (W) weight-profile vs GH δ-unfreeze — is OPEN and the
OPERATOR'S call (`engine/builds/DIFF_LEDGER.md` OPERATOR OPEN QUESTIONS item 1;
`docs/feature_inventory.md` items #2/#3). The (W) candidate must also satisfy the framework
admission contracts (`framework/README.md` §2) — the anchored warp family passes the
mode=unit-slope contract exactly (`framework/LDF_DEFINITION_CHECK_2026-06-11.md` §2).

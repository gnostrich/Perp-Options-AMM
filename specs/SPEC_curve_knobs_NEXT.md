# SPEC — Curve playground: honest γ/δ/βh dials + Balancer-corner start + like-for-like display

Status: DRAFT for intern (engine-touching). **Supersedes the Gaussian-σ framing of
`SPEC_vol_knob_NEXT.md`** (that σ↔γ map is the δ→∞ slice only — manager-verified, see
`evidence/manager_verify_reconcile_2026-06-09.md`). Build is audited-sound (FULL fork βh=0 = GO-WITH-
CONDITIONS, settlement-sound, small cost; mark() is βh-free; both wings already priced).

## 0. Goal
A **side-by-side comparison / playground** build the operator opens next to `reference/v24_balancer_stable.html`.
It starts at the **Balancer corner**, renders **like-for-like** with v24, and exposes **honest dials** to
tune curvature for American-style perpetual options. Output file: **`reference/temporal_curve_playground.html`**
(do NOT overwrite HEAD v26c). Reuse v26d's plumbing.

## 1. Build base
Build FROM `engine/builds/temporal_mvp_v26d_volknob.html` (md5 a406a751 — reuse `Store.setShape` re-warp-
in-place, the control-panel scaffold, the `ghCalibrate(...,delta)` param). HEAD stays untouched.

## 2. Dials (number-steppers, honest labels — DROP the Gaussian "σ")
- **γ — "steepness"** (the value∝S^(−γ) exponent / OTM wing decay). Range clamp **γ>1** (hard floor),
  soft upper (gates guard past 4). The asset/option steepness, set directly. NO σ→γ Gaussian wrapper.
- **δ — "kurtosis"** (ATM-elbow / return-kurtosis; δ↑ = thinner→Gaussian/Balancer, δ↓ = fatter→Laplace).
  Clamp δ>0 (guard GH-table build). This is the single clean kurtosis knob.
- **βh — "skew"** (curve symmetry / put-call asymmetry). Default **0 (symmetric = Balancer base)**.
  Thread βh as a param through `ghCalibrate` (currently `bh = ah − γ` ⇒ hard-codes βh=1; make it a free
  param defaulting to the knob). mark()/settlement is βh-free, so this is curve-shape only.
- All re-warp IN PLACE via `setShape` (extend to (γ, δ, βh)); warp (weight w) is untouched/always-on.

## 3. Default = the Balancer corner (for the v24 comparison)
Open at **βh=0, δ=large (≈30 — large enough to read as Balancer, below the ~δ>100 tail-precision zone
research-lead flagged), γ≈1.05**. HONEST CAVEAT to encode in a UI note: the *exact* v24 Balancer is
w=½ ⟺ **γ=1**, which is the excluded floor; γ>1 means we get **arbitrarily close (γ=1.05 ≈ w=0.51), not
pixel-identical.** So the start is "as close to v24 as the family allows," then dial up γ/down δ to move.

## 4. Like-for-like DISPLAY rescale (the UX fix — display-only, NO pricing touch)
The GH live curve reads flat because the chart scales axes to the PRICE while the GH geometric slope is
`price·e^(−μ)` (the gotcha: factor ~44× at γ=2). FIX (drawCurve / `toPx` / frame only): scale the curve's
display so its **geometric slope reads at a natural angle** — e.g. set the frame aspect from the geometric
slope `getMP_raw·e^(−ghMu)` at the equilibrium, not from the raw price — so the live curve sits ~45° like
v24 at the Balancer corner and stays a readable curve as the dials move. Does NOT touch getMP_raw,
mark(), or any pricing path. (Anchor curve + rays unaffected.) tester confirms the visual match to v24.

## 5. ⛔ FILE-SAFETY GATE (every edit)
Blobs (webp ~L74 md5 `ab663f5c…`, svg md5 `c505b08a…`) never typed; on-disk Python splice only
(`assert count==1`, trailing `\n`). After each edit: 2 blob md5s unchanged · 3 `<script>` parse · IIFE
intact · no script line >~50k · `engine/verify/run_all.sh <file>` green. STOP-ON-RED → report, don't patch.

## 6. Acceptance
1. run_all.sh green (7 GH + seam + dir) across γ∈{1.05,1.5,2,3,4} AND at the Balancer-corner default.
2. **G4 value∝S^(−γ)** holds at each γ/δ/βh the dials reach (verify βh=0 and βh=1 both green).
3. Blob md5s + anchor unchanged; 3 scripts parse; IIFE intact.
4. mark()/funding/isOTM/markFrac/dollar-pipe byte-UNCHANGED (βh threads only through the curve kernel
   + ghCalibrate, NOT through mark()). diff-confirm.
5. **tester (live):** curve renders **like-for-like with v24** at the Balancer-corner default; dials
   re-warp + redraw all graphs; pro-forma/stepper re-trace; warp intact; no console errors.

## 7. Notes
- βh re-instantiation is kernel-constant only (Lean βh is a free var — manager-audited). No settlement change.
- Vol-targeting is **by-shape, not by-formula** (no clean vol↔setting at finite δ) — don't add a σ field.
- Keep v26d as lineage; this is a fresh candidate in `reference/`, NOT a HEAD promotion.

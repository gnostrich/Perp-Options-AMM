# Reference / side-by-side builds

Open these in two browser tabs to compare. Download the raw `.html` from GitHub
(Raw button) and open locally — they're self-contained single files.

- **`v24_balancer_stable.html`** — the original **v24 Balancer** build (the HTML you supplied;
  byte-identical to `engine/builds/temporal_mvp_v24_rebase_fixed_2.html`). The stable reference:
  live curve drawn in the Balancer weight-form (slope = price ⇒ reads as a ~45° curve).
- **`temporal_curve_playground.html`** — *(coming)* the current GH build with honest dials
  (γ steepness · δ kurtosis · βh skew), starting at the Balancer corner (βh=0, large δ) with a
  display rescale so its curve reads like-for-like with v24, then dial kurtosis/steepness from there.

The canonical engine HEAD lives in `engine/builds/HEAD_temporal_mvp_v26c.html`. Older builds
(v25/v26a/v26b/v26c/v26d) are in `engine/builds/` with `BUILD_LINEAGE.md`.

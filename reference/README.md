# Reference / side-by-side builds

Open these in two browser tabs to compare. Download the raw `.html` from GitHub
(Raw button) and open locally — they're self-contained single files.

- **`v24_balancer_stable.html`** — the original **v24 Balancer** build (the HTML you supplied;
  byte-identical to `engine/builds/temporal_mvp_v24_rebase_fixed_2.html`). The stable reference:
  live curve drawn in the Balancer weight-form (slope = price ⇒ reads as a ~45° curve).
- **`temporal_curve_playground.html`** — the **latest UX-reconciled build** (the "current version"
  for the side-by-side). Built from v26d's plumbing but **different**: honest dials (γ steepness ·
  δ kurtosis · βh skew), no Gaussian-σ knob, **initialised at the Balancer corner** (βh=0, δ≈30,
  γ≈1.05), drawCurve-only display rescale aimed at reading like-for-like with v24. **Known caveat:**
  at the exact Balancer corner (γ≈1.05) the geometric slope is so tiny the rescale can't reach ~45° —
  it reads flat-ish there, ~45° only for γ≳1.3 (tester judging the real like-for-like). md5 `2b20c844`.

## Version lineage (so it's unambiguous)
- `reference/v24_balancer_stable.html` — old stable Balancer (your HTML).
- `engine/builds/HEAD_temporal_mvp_v26c.html` — canonical shipped HEAD (GH, ITM/American). UNTOUCHED.
- `engine/builds/temporal_mvp_v26d_volknob.html` — **superseded** intermediate (had the Gaussian σ→γ
  vol knob; that framing was wrong/abandoned). Kept as lineage; NOT the side-by-side build.
- `reference/temporal_curve_playground.html` — the side-by-side "current" (above), built FROM v26d,
  supersedes its knob. NOT a HEAD promotion — a comparison/playground candidate.

Older builds (v25/v26a/v26b/v26c/v26d) are in `engine/builds/` with `BUILD_LINEAGE.md`.

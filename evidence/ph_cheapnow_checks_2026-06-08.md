# Manager independent verification — PH "cheap-now" consistency checks (2026-06-08)

Run by the manager (sole verifier) in parallel with the big Aristotle queue, to establish
engine-level numeric ground-truth that the returned Lean candidates (R1/R3/R4 + seam) must match.
Harness: `sh engine/verify/run_all.sh` on HEAD. Read-only; scratch tempdir; no engine edit.

## Build under test
- `engine/builds/HEAD_temporal_mvp_v26c.html`, whole-file md5 `6cc73563779a3e030774b7597d0ae187`.
- Blobs intact: webp line 74 `ab663f5c…`, svg line 1060 `c505b08a…`.

## Confirmed (all PASS)
1. **7 GH gates** PASS γ∈{1.5,2,3,4}; curveTrace 401/401 on-curve, worst slope err 5.156e-12;
   marker on-curve getMP_raw(eq)=136000.00. Parse/sigs/IIFE intact, no blob-in-script.
2. **Seam C¹ at BOTH wings (PH-5 / R1 ground-truth):** for γ∈{1.5,2,3,4}
   - branch A (`1−S/K`, S*/K = γ/(γ+1) = 0.600/0.667/0.750/0.800): value 0.000%, slope(sNorm) ≤0.0003%.
   - branch B (`1−K/S`, S*/K = (γ+1)/γ = 1.667/1.500/1.333/1.250): value 0.000%, slope(sNorm) ≤0.0005%.
   - frac@bdry = 1/(γ+1) both branches. Directional A:S*<K / B:S*>K. SEAM GATE: PASS.
3. **mpGeom = getMP_raw·e^(−ghMu) (R3 ground-truth):** ratio getMP_raw/|dy/dx| == e^ghMu exactly:
   γ=1.5→11.68, γ=2→44.52, γ=3→748.6, γ=4→13779.9. getMP_raw is a PRICE COORDINATE, not the slope.
4. **Directional-sign invariant (R4 ground-truth):** sign(K−oracle)==sign(funding±2)==sign(d mark/d sNorm),
   CALL +++ / PUT −−− at every γ; swapped-arm mutation DETECTED. DIR GATE: PASS.
5. **Slippage** splice-level on target (γ=2): x1.02 → 0.99%/$3.46; x1.2 → 9.09%/$249.49.

## Use
These are the numeric statements the corresponding Lean obligations claim. When Aristotle returns
candidates for R1 (seam C¹ both wings, θ=sNorm(K)), R3 (mpGeom/slope), R4 (directional-sign), the
manager re-derives the proof's intended statement against THESE numbers before folding — a clean
server build of a weakened statement would not reproduce them.

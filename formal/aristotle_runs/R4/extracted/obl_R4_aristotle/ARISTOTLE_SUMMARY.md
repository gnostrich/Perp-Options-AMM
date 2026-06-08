# Summary of changes for run 585c6813-1dce-4bb4-8cf1-1a754e341b6f
All 5 theorems in `RequestProject/R4.lean` have been proved:

1. **`call_mark_mono`** — CALL OTM mark `sNorm/θ` is strictly increasing on `(0, ∞)`.
2. **`call_mark_slope`** — The derivative of `s/θ` is `1/θ > 0` (sign +1 matches wing stamp +2).
3. **`put_mark_anti`** — PUT OTM mark `θ/sNorm` is strictly decreasing on `(0, ∞)`.
4. **`put_mark_slope`** — The derivative of `θ/s` is `-θ/sNorm² < 0` (sign −1 matches wing stamp −2).
5. **`wing_signs_oppose`** — The call/put signs are opposite and each equals its ±2 stamp halved.

Verification:
- Builds successfully with no `sorry`, `admit`, `native_decide`, `opaque`, or `unsafe`.
- All axioms are within `{propext, Classical.choice, Quot.sound}`.
- No statements were altered; only `sorry` placeholders were replaced with proofs.
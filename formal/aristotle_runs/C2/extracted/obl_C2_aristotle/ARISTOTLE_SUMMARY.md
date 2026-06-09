# Summary of changes for run 7749677b-cae9-4f19-8c90-bc6856e930e2
Both theorems in `RequestProject/C2.lean` are now fully proved:

1. **`anchor_symmetric_iff_half`**: `(1 - w)/w = 1 ↔ w = 1/2` for `0 < w`.
2. **`collarSurplus_zero_iff_half`** (I7): `(∀ θ, 0 < θ → collarSurplus θ w = 0) ↔ w = 1/2` for `0 < w`.

Verification:
- File builds successfully with no `sorry`, `admit`, `native_decide`, `opaque`, `unsafe`, or new `axiom`.
- `#print axioms` for both targets yields only `{propext, Classical.choice, Quot.sound}` — all within the allowed set.
- No statements were altered; only `sorry` placeholders were replaced with proofs.
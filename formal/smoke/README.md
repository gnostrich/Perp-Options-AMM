# formal/smoke — THROWAWAY smoke probes for the direct Aristotle loop

These files are **throwaway** probes for end-to-end testing of the direct prover loop
(research-lead → Harmonic's Aristotle → zero-cost artifact audit → verdict; no courier, no separate
agent). **PROCESS UPDATE (operator, 2026-06-08):** Aristotle compiles/builds server-side in the
matching toolchain (Lean 4.28.0 / Mathlib v4.28.0), so its server compile **is** the build. There is
no local `lake build` re-verify gate; a clean, audited, server-compiled candidate is
**trusted-from-prover** (PENDING-LEAN retired). What research-lead still owes is the zero-cost
artifact audit (token-scan + Aristotle's own `#print axioms` + unscoped-module diff + math
re-derivation) — none of which needs a local toolchain.
They are **NOT part of the `RequestProject` build** — they are standalone `.lean` files under
`formal/smoke/`, not under `formal/temporal_lean_verified/RequestProject/`, and are not listed in
`lakefile.toml`. Delete them once the loop is confirmed live.

Toolchain for both: **Lean 4.28.0 + Mathlib v4.28.0** (match `lean-toolchain`).

## Files and expected verdicts

| File | Statement | Expected verdict |
|------|-----------|------------------|
| `smoke_true.lean`  | `2 + 2 = 4` (`by norm_num`) | **PROVED (trusted-from-prover).** Server-compiled; `#print axioms` clean (only the allowed three / propext here). |
| `smoke_false.lean` | `∀ n : ℕ, n = n + 1` (false) | **COUNTEREXAMPLE / REFUTED.** Aristotle must NOT close it; counterexample `n = 0` (gives `0 = 1`). A returned proof is a RED FLAG. |

## How to read the results
- `smoke_true` confirms the happy path: submit → server compile (the build) → download candidate →
  token-scan + read Aristotle's `#print axioms` (axioms ⊆ propext/Classical.choice/Quot.sound) →
  verdict "proved (trusted-from-prover)". No local `lake build` step.
- `smoke_false` confirms the loop reports refutation honestly and does not paper a false goal with
  `sorry`/`admit`/`native_decide`. The `sorry` in the file is the deliberate open marker for the false
  goal; it must never appear in a real proved core.

## SMOKE STATUS (2026-06-08): both round-trips COMPLETED
- `smoke_true` → Aristotle built it server-side, confirmed it closes, `#print axioms` = propext only
  (within the allowed three). Returned .lean unchanged. **Verdict: proved (trusted-from-prover).**
- `smoke_false` → Aristotle correctly did NOT prove it; declared it false, gave counterexample
  `n = 0 → 0 = 1`, commented out the unprovable theorem, proved the *negation* instead. No fabricated
  proof, no active `sorry`. **Verdict: counterexample (correct refutation).**
- Net: the direct submit→candidate loop works end-to-end; the discrimination test passed (the prover
  did not "prove" the false goal).

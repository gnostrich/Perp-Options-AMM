# formal/smoke — THROWAWAY smoke probes for the brokered Aristotle loop

These files are **throwaway** probes for end-to-end testing of the brokered prover loop
(research-lead → manager → aristotle → Harmonic's Aristotle → local re-verify → verdict back).
They are **NOT part of the `RequestProject` build** — they are standalone `.lean` files under
`formal/smoke/`, not under `formal/temporal_lean_verified/RequestProject/`, and are not listed in
`lakefile.toml`. Delete them once the loop is confirmed live.

Toolchain for both: **Lean 4.28.0 + Mathlib v4.28.0** (match `lean-toolchain`).

## Files and expected verdicts

| File | Statement | Expected verdict |
|------|-----------|------------------|
| `smoke_true.lean`  | `2 + 2 = 4` (`by norm_num`) | **PROVED + re-verified.** `#print axioms` clean (no axioms / only the allowed three). |
| `smoke_false.lean` | `∀ n : ℕ, n = n + 1` (false) | **COUNTEREXAMPLE / REFUTED.** Aristotle must NOT close it; counterexample `n = 0` (gives `0 = 1`). A returned proof is a RED FLAG. |

## How to read the results
- `smoke_true` confirms the happy path: submit → prove → download candidate → `lake build` → axiom
  check passes → verdict "proved+re-verified".
- `smoke_false` confirms the loop reports refutation honestly and does not paper a false goal with
  `sorry`/`admit`/`native_decide`. The `sorry` in the file is the deliberate open marker for the false
  goal; it must never appear in a real proved core.

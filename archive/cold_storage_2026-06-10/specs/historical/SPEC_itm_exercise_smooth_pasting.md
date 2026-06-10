# Spec — ITM / exercise via smooth-pasting (option b), + portfolio cleanup

**Context.** The curve is already swapped to GH (OTM value ∝ S^(−γ), verified). This spec changes the **ITM / exercise rule** from the barrier convention (cap the mark at 1 at the strike ray; intrinsic referenced to *entry mark*) to the **American convention** (intrinsic referenced to the *strike*, exercise at a smooth-pasting free boundary). The barrier "cap at the strike" is a γ=½ artifact; for γ>1 it leaves a kink and throws away time value. Smooth-pasting removes both.

This is **not** new machinery — it falls out of the curve you already have plus one free boundary.

---

## 1. The math (closed form; put-side verified on the live engine)

Coordinates: `sNorm` = pool coordinate (curve gives `sNorm ∝ S^(−γ)`); `θ` = K / oracle (strike ray, live); the leg's per-unit value is the `mark`.

- **Continuation (OTM) value is already the curve:** `mark_cont = c · sNorm`. Proportional to the coordinate you have — nothing new.
- **Intrinsic (exercise) value is from the strike:** linear in price, e.g. `(K − S)/K` (bounded wing) or `(S − K)/K` (unbounded wing). Referenced to **K**, never to entry.
- **Free boundary from smooth-pasting** (value match + slope match) pins **both** the boundary and the coefficient `c` — no free parameters:

  ```
  sNorm*  = θ · ((γ+1)/γ)^γ          (the exercise switch — PAST the strike ray)
  S*      = K · γ/(γ+1)               (same thing in price)
  c       = 1 / ((γ+1) · sNorm*)      (continuation coefficient)
  fraction at the boundary = 1/(γ+1)  (mark reaches its cap of 1 only at full exercise)
  ```

- **Exercise trigger** = `intrinsic / continuation`. It is < 1 in the continuation region (hold) and **reaches 1 exactly at sNorm\*** (exercise). That ratio crossing 1 at the formula point — not at ATM — is the trigger.

**Verified (put-side / lower boundary, γ∈{1.5,2,3,4}) on the live engine:** at sNorm\* the continuation and intrinsic match in **value to 0.04%** and in **slope to ~0.1%** (the 0.1% is just the GH table's S^(−γ) accuracy). It pastes.

**Other wing (upper boundary):** mirror construction (S\* = K·(γ+1)/γ). Derive it from the same two smooth-pasting conditions and let the seam gate (§4) confirm it — do **not** hand-port the formula without the gate passing.

---

## 2. The new mark / exercise rule

Replace the barrier rule (`mark = sN<θ ? sN/θ : 1`, i.e. cap at the strike ray) with, per wing:

```
if (continuation side of sNorm*)   mark = c · sNorm                 // GH continuation
else                               mark = intrinsic_from_strike     // exercised
```

- `sNorm*` and `c` are computed in closed form from `γ` and the **live** `θ` (§1).
- **Bounded leg** (put, or a vertical spread): intrinsic is capped (reaches 1 / the far strike). **Unbounded leg** (naked option): intrinsic grows past 1 — that is correct, an option is unbounded one way. Bounding, when wanted, comes from using a vertical spread (two strikes), not from capping at 1.

---

## 3. Scope — surgical

Change **only** the ITM/exercise branch in **settlement** and **portfolio valuation**.

Unchanged: the GH curve, calibration, the four engine functions, funding (it is the slope-vs-anchor ratio at the strike ray — nothing to do with intrinsic), the collar structure, the perp, the carved schema.

**Rebase:** `θ` shifts `θ → θ/r`, `sNorm` is rebase-invariant. As long as `sNorm*` is computed from the **live** `θ`, it shifts correctly on its own — no rebase-specific code.

---

## 4. Seam gate (acceptance — both wings, γ∈{1.5,2,3,4})

At the boundary `sNorm*`:
- **Value match:** continuation == intrinsic to **< 0.1%**.
- **Slope match:** d(continuation)/dS == d(intrinsic)/dS to **< 0.2%**.
- **Continuity:** no jump in mark across the boundary.

These are the hard tests; they catch any per-wing sign error. Plus the existing seven curve gates must still pass (this change must not disturb the engine).

---

## 5. Portfolio cleanup (what goes redundant — audit, don't blanket-delete)

**Principle:** the barrier ITM referenced the **entry mark**; the new intrinsic references the **strike + live oracle**. So *entry-mark-as-the-option's-ITM-reference* is now dead. But entry mark is **still load-bearing for the perp** — be surgical.

- **Candidate to remove:** the option/band position table's **"Entry mark"** column (~line 1539). It existed as the barrier ITM reference; strike-intrinsic no longer reads it. Remove **only after** grepping its data source and confirming nothing else consumes it.
- **KEEP — still used:** the perp table's **"Entry mark / Oracle (live)"** (~line 1507) and `entryPerpMark`. These feed the perp's attributable P&L (`attributablePnL = carvedNotional·(perpMark_now − entryPerpMark)/entryPerpMark`). Do **not** remove.
- **KEEP — now more central:** all **strike / Orig strike / Eff strike / Oracle** columns. These are the ITM inputs now.

**Rule of thumb:** remove a column/sub-field only if it was *solely* the barrier-ITM entry reference and nothing (perp P&L, display, export) else reads it. Confirm each before deleting; if in doubt, leave it and flag.

---

## 6. Safety / verify

- File-safety as always: no blobs emitted; all three `<script>` blocks parse via `new Function`; blob lengths unchanged; signatures intact.
- Re-run the seven curve gates **and** the seam gate (§4) after the change.
- Stop-on-red: gates red or a parse failure → stop and report.

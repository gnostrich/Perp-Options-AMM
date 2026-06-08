# Spec — ITM / exercise rule: smooth-pasting free boundary (the American change)

**Scope:** replace the barrier ITM rule (mark saturates to 1 at the strike ray) with the American rule — continuation runs *past* the strike to a formula-determined free boundary, then exercise pays intrinsic from the strike. **The GH curve, calibration, and funding do not change.** This is the mark/exercise rule + one settlement decomposition + one redundant portfolio column.

---

## 1. The boundary (closed form — no new parameters)

The continuation value is already `c · sNorm` (the GH curve gives value ∝ sNorm ∝ S^(−γ)). It pastes onto the strike-intrinsic at a free boundary fixed by smooth-pasting (value match + slope match — two conditions, two unknowns):

- **Boundary:** `sNorm* = θ · ((γ+1)/γ)^γ`  (equivalently price `S* = K · γ/(γ+1)`).
- **Coefficient:** `c = 1 / ((γ+1) · sNorm*)`  (from value-match at the boundary).
- **Fraction at the boundary:** `1/(γ+1)`. The mark reaches its cap of 1 only at full exercise, not at the boundary.

θ is the live strike ray (`θ = K/oracle`); since θ shifts on rebase (θ→θ/r), `sNorm*` tracks it automatically — read the live θ, no special rebase code.

---

## 2. The new mark / exercise rule (replaces `sN<θ ? sN/θ : 1`)

Per leg, wing-aware. Let `sN = sNorm`, boundary `sNorm*` and `c` as above.

- **Continuation** (`sN` on the OTM side of `sNorm*`): `mark = c · sN`. This runs *through* the old strike ray — the strike is now an ordinary interior point, no saturation there.
- **Exercise** (`sN` past `sNorm*`): `mark = intrinsic from strike`.
  - Bounded wing (vertical-spread side): intrinsic = `1 − S/K`, reaching 1 at full exercise.
  - Unbounded wing (option leg): intrinsic keeps growing past 1 — do **not** cap it (uncapped is correct for an option; bounding comes from using a spread).
- **Exercise trigger** (if you want it as a fraction): `intrinsic / continuation` reaches **1 at `sNorm*`** — that ratio crossing 1 is the switch, and it lands at the formula point, not at ATM.

---

## 3. Seam gate (acceptance)

At `sNorm*`, continuation and intrinsic must match in **value** and **slope**. Already verified on the live engine for γ∈{1.5, 2, 3, 4}: value to **0.04%**, slope to **0.1%** (the 0.1% is just the GH table's S^(−γ) accuracy — nothing structural). Gate: ≤0.15% on both, no jump and no kink at the boundary.

---

## 4. What does NOT change
- GH curve functions (`getMP_raw`, `tradeUpdate`, `arbitrageToOracle`, `rebase`) — untouched; re-run the seven gates to confirm they still pass.
- Calibration — untouched.
- Funding — untouched (slope-deviation vs the w=½ anchor; orthogonal to intrinsic).

---

## 5. Portfolio column rendered redundant — remove

- **Drop "Eff strike."** Today the per-component effective strike is `effK = itm ? oracleLive : K` — i.e. when ITM the ray "parks" at the oracle. That parking is the barrier artifact this change removes: under from-strike, the actual (frozen) strike is used both in continuation and in exercise, so **Eff strike always equals Orig strike**. Drop the "Eff strike" sub-cell (row-2 of the "Attrib P&L / Eff strike" column); the column header becomes just **"Attrib P&L"**, and rename "Orig strike" → **"Strike."**
- **Keep "Oracle (live)"** — it loses its "where the ITM ray parks" meaning but is still the layer-1 reference (θ = K/oracle, funding normalization).
- **Keep "Entry mark"** (both tables) — it is perp / carved-perp P&L attribution from entry, which this change does not touch.
- **Keep the "mark" cell** — its value now follows the new rule (continuation through the strike, then intrinsic).
- This matches the existing prod-port note (~line 2610, "drop intrinsic/extrinsic cols"): under one continuous value (continuation → intrinsic) a separate intrinsic/extrinsic split is redundant.

---

## 6. Settlement decomposition (decided)

The exercise change lives **entirely in stage 2** (the per-leg mark/value). The stage-2 → stage-3 conversion — carved-perp units → dollars via `carvedNotional` and the `entryPerpMark` attribution — is **unchanged and applies uniformly** to continuation legs and exercised legs alike. "From strike" describes how the stage-2 intrinsic is *computed* (referenced to K instead of the entry mark), **not** a change to the dollar attribution: `entryPerpMark` stays for all legs (it is the unit conversion + carved-perp P&L, orthogonal to the option's intrinsic).

So: **do not add an exercise-specific dollar path.** Compute the new mark (continuation → strike-intrinsic) in stage 2; let the existing stage-3 conversion handle dollars unchanged. If — and only if — the stage-2→3 conversion turns out to genuinely need an exercise-specific branch, **stop and report**; do not improvise it.

---

## 7. File-safety & verification
- No blob emission; after every edit Node-parse all three `<script>` blocks; confirm blob md5s unchanged; preserve signatures and the IIFE.
- The edit touches: the mark/exercise rule (engine) + the bands render (drop Eff strike). The GH curve is untouched, so the seven curve gates must still pass — re-run them.
- Seam gate (§3) is the new acceptance check; add it to the harness.
- Stop-on-red.

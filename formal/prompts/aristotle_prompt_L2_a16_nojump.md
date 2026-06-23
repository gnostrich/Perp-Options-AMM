# Aristotle obligation L2 — A16 ATM no-jump as a Lean theorem (not gate-only)

## Toolchain
Lean 4.28.0 / Mathlib v4.28.0 (`leanprover/lean4:v4.28.0`). `import Mathlib`.

## Task
Produce a self-contained file `RequestProject/A16NoJump.lean` that promotes the A16 ATM-no-jump
fact — currently only gate-verified by `a16_atm_gate.js` — to a real Lean theorem: under the
constant-m lens (`g = m·γ > 0`), the held-position value is **continuous across the ATM (mode)
crossing**, with **NO jump and NO regime branch**, and the **call arm equals the put arm at the
mode**. This is DISTINCT from the smooth-paste seam at `S*` (already proved by `paste_value` /
`paste_slope`): A16 is the continuity at the ATM crossing `sNorm = θ`, where `g = m·γ > 0` is an
ordinary point of a clean power law (the old elbow-lens cusp is RETIRED under constant-m).

## The pinned mark functions (re-declare exactly as in `MonolithConstM.lean`)

```lean
import Mathlib

noncomputable section
open Real

/-- call-arm free boundary S* (normalized value frame). -/
def sStarCall (g θ : ℝ) : ℝ := θ * ((g + 1) / g) ^ g
/-- put-arm free boundary S* (normalized value frame). -/
def sStarPut  (g θ : ℝ) : ℝ := θ * (g / (g + 1)) ^ g
/-- continuation slope c (call arm). -/
def pasteC    (g θ : ℝ) : ℝ := 1 / ((g + 1) * sStarCall g θ)
/-- the held-position lensed mark, call arm = sNorm/θ side (engine `markLensed` call branch):
    continuation `c·s` for s ≤ S*_call, intrinsic `1 − (s/θ)^(−1/g)` past it. -/
def markCall (g θ s : ℝ) : ℝ :=
  if s ≤ sStarCall g θ then pasteC g θ * s else 1 - (s / θ) ^ (-(1:ℝ) / g)
/-- the held-position lensed mark, put arm = θ/sNorm side (engine `markLensed` put branch):
    continuation `S*_put / ((g+1)·s)` for s ≥ S*_put, intrinsic `1 − (s/θ)^(1/g)` below it. -/
def markPut (g θ s : ℝ) : ℝ :=
  if sStarPut g θ ≤ s then sStarPut g θ / ((g + 1) * s) else 1 - (s / θ) ^ ((1:ℝ) / g)
```

## Pinned predicates (state these EXACTLY; do not weaken)

1. **`sStarCall_gt_mode`** — at the mode `s = θ` the call arm is in the CONTINUATION region
   (`θ < S*_call`), i.e. the mode is an ordinary continuation point, not a regime edge.
   ```lean
   theorem sStarCall_gt_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) : θ < sStarCall g θ
   ```
   (Because `(g+1)/g > 1` and `g > 0` ⇒ `((g+1)/g)^g > 1`.)

2. **`sStarPut_lt_mode`** — at the mode the put arm is in the continuation region (`S*_put < θ`).
   ```lean
   theorem sStarPut_lt_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) : sStarPut g θ < θ
   ```

3. **`markCall_at_mode`** — the call-arm value at the mode is the constant-g smooth-paste value
   `1/((g+1)·((g+1)/g)^g)` (the honest A16.2 fact: NOT 1, NOT a cusp).
   ```lean
   theorem markCall_at_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
       markCall g θ θ = 1 / ((g + 1) * ((g + 1) / g) ^ g)
   ```

4. **`markPut_at_mode`** — the put-arm value at the mode equals the SAME value.
   ```lean
   theorem markPut_at_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
       markPut g θ θ = 1 / ((g + 1) * ((g + 1) / g) ^ g)
   ```

5. **THE HEADLINE — `arms_agree_at_mode`** — call arm == put arm at the ATM crossing (no jump
   between the two wings at the mode).
   ```lean
   theorem arms_agree_at_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
       markCall g θ θ = markPut g θ θ
   ```

6. **`markCall_continuousAt_mode`** — the call-arm held-position value is continuous at the mode
   (no jump in the value as `s → θ`). Since the mode is strictly inside the continuation region
   (statement 1), `markCall` agrees with the smooth linear branch `pasteC g θ * s` in a neighborhood,
   hence continuous there.
   ```lean
   theorem markCall_continuousAt_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
       ContinuousAt (markCall g θ) θ
   ```
   PROOF SKETCH: on the open set `{s | s < sStarCall g θ}` (which contains `θ` by statement 1),
   `markCall g θ` equals `fun s => pasteC g θ * s`; use `ContinuousAt.congr` /
   `continuousAt_of_eventuallyEq` with that eventual equality (the `if` condition `s ≤ S*_call` holds
   eventually near `θ` since `θ < S*_call`), and the linear branch is continuous.

7. **`markPut_continuousAt_mode`** — the put-arm value is continuous at the mode (symmetric to 6,
   using statement 2: `S*_put < θ` ⇒ near `θ` the `if sStarPut ≤ s` branch holds and the value is the
   continuation `S*_put/((g+1)·s)`, continuous at `θ > 0`).
   ```lean
   theorem markPut_continuousAt_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
       ContinuousAt (markPut g θ) θ
   ```

## Output spec
- ONE file `RequestProject/A16NoJump.lean`, `import Mathlib`, exact signatures above.
- This is the ATM (mode, `s = θ`) crossing — NOT the `S*` seam. Do NOT restate or weaken the
  `paste_value`/`paste_slope` seam results.
- Do NOT weaken hypotheses (`hg : 0 < g`, `hθ : 0 < θ` are the constant-m `g = m·γ > 0` and a
  positive strike ray — both genuine), do NOT strengthen conclusions, do NOT add hypotheses.
- FORBIDDEN: `sorry`, `admit`, `axiom` (decls), `native_decide`, `sorryAx`, `opaque`, `unsafe`.
  Kernel `decide` allowed.
- Run `#print axioms arms_agree_at_mode`, `#print axioms markCall_continuousAt_mode`,
  `#print axioms markPut_continuousAt_mode`; include in `ARISTOTLE_SUMMARY.md`; axiom set
  ⊆ {propext, Classical.choice, Quot.sound}.
- Self-contained; do NOT touch/import the canonical modules.

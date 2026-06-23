# Summary of changes for run 214d1296-07b1-4e39-b2bb-fa0031289b07
Produced the self-contained file `RequestProject/A16NoJump.lean` (`import Mathlib`, noncomputable section), which promotes the A16 ATM-no-jump fact to real Lean theorems without touching or importing the canonical modules.

The file re-declares the pinned mark functions exactly (`sStarCall`, `sStarPut`, `pasteC`, `markCall`, `markPut`) and proves all seven pinned predicates with the exact requested signatures and unweakened hypotheses (`hg : 0 < g`, `hθ : 0 < θ`):
1. `sStarCall_gt_mode` — `θ < sStarCall g θ` (mode is an ordinary continuation point).
2. `sStarPut_lt_mode` — `sStarPut g θ < θ`.
3. `markCall_at_mode` — call value at the mode `= 1/((g+1)·((g+1)/g)^g)`.
4. `markPut_at_mode` — put value at the mode equals the same value.
5. `arms_agree_at_mode` — HEADLINE: `markCall g θ θ = markPut g θ θ` (no jump between wings at the ATM crossing).
6. `markCall_continuousAt_mode` — continuity at the mode via eventual equality with the linear continuation branch.
7. `markPut_continuousAt_mode` — continuity at the mode via eventual equality with the continuation branch.

No `sorry`/`admit`/`axiom`/`native_decide`/`sorryAx`/`opaque`/`unsafe` appear. The project builds cleanly. The file ends with the three required `#print axioms` commands; each of `arms_agree_at_mode`, `markCall_continuousAt_mode`, and `markPut_continuousAt_mode` depends only on `[propext, Classical.choice, Quot.sound]`, a subset of the allowed axiom set. The axiom output is recorded in `ARISTOTLE_SUMMARY.md`.

# Aristotle obligation L2 — A16 ATM no-jump

File: `RequestProject/A16NoJump.lean` (self-contained, `import Mathlib`, does not
import or modify the canonical modules).

Promotes the A16 ATM-no-jump fact (previously only gate-verified by
`a16_atm_gate.js`) to real Lean theorems. Under the constant-m lens
(`g = m·γ > 0`) the held-position value is continuous across the ATM (mode)
crossing `sNorm = θ`, with no jump and no regime branch, and the call arm equals
the put arm at the mode. This is the ATM crossing `s = θ`, distinct from the `S*`
smooth-paste seam.

## Mark functions (re-declared exactly as in `MonolithConstM.lean`)
- `sStarCall`, `sStarPut`, `pasteC`, `markCall`, `markPut`.

## Theorems proved (no `sorry`/`admit`/`axiom`/`native_decide`/`opaque`/`unsafe`)
1. `sStarCall_gt_mode` — at the mode `θ < S*_call` (ordinary continuation point).
2. `sStarPut_lt_mode` — at the mode `S*_put < θ`.
3. `markCall_at_mode` — call value at mode = `1/((g+1)·((g+1)/g)^g)`.
4. `markPut_at_mode`  — put value at mode  = the same value.
5. `arms_agree_at_mode` — HEADLINE: call arm == put arm at the ATM crossing.
6. `markCall_continuousAt_mode` — call value continuous at the mode.
7. `markPut_continuousAt_mode`  — put value continuous at the mode.

## Axiom audit
```
#print axioms arms_agree_at_mode
  'arms_agree_at_mode' depends on axioms: [propext, Classical.choice, Quot.sound]
#print axioms markCall_continuousAt_mode
  'markCall_continuousAt_mode' depends on axioms: [propext, Classical.choice, Quot.sound]
#print axioms markPut_continuousAt_mode
  'markPut_continuousAt_mode' depends on axioms: [propext, Classical.choice, Quot.sound]
```
Axiom set ⊆ {propext, Classical.choice, Quot.sound}. ✓

# Summary of changes for run 86752f21-2df9-4e50-befb-ae37a97f415f
Created `RequestProject/EngineBridge.lean` (self-contained, `import Mathlib`), formalizing the engine's three constant-m closed forms and proving they are definitionally equal to the monolith's derived readings.

The file re-declares the pinned `TemporalAMM` structure with the monolith readings (`x`, `w`, `gamma`, `g`, `trade`) and mark functions (`sStar`, `pasteC`, `markCont`, `markInt`), plus the engine's transcribed JS closed forms in namespace `Engine` (`gLoc` computing `w := 1 − β/y` then `w/(1−w)`, `markLensedCall`, `tradeUpdateX`, `tradeUpdateY`) — these are the literal closed forms, not collapsed to the monolith functions.

All six pinned theorems are proved with the exact signatures given, no `sorry`/`axiom`/`native_decide`/`opaque`/`unsafe`, and no added hypotheses or weakened conclusions:
- `bridge_gLoc`, `bridge_markCont`, `bridge_markInt`, `bridge_tradeUpdate_y`, the headline `bridge_tradeUpdate_x` (engine reserve update lands exactly on the monolith hyperbola), and the bundle `bridge_single`.

Axiom checks confirm:
- `bridge_tradeUpdate_x` depends on axioms: [propext, Classical.choice, Quot.sound]
- `bridge_gLoc` depends on axioms: [propext, Classical.choice, Quot.sound]

Both sets are within the allowed {propext, Classical.choice, Quot.sound}. The project builds cleanly (`RequestProject.EngineBridge`), with only two harmless unused-variable linter warnings for the θ arguments that the pinned constant-m closed forms intentionally ignore. The canonical modules were neither touched nor imported. Details recorded in `ARISTOTLE_SUMMARY.md`.

# Aristotle obligation L7 — engine↔Lean definitional bridge

## File
`RequestProject/EngineBridge.lean` (self-contained, `import Mathlib`).

It re-declares the pinned `TemporalAMM` object with the monolith's derived readings
(`x`, `w`, `gamma`, `g`, `trade`) and mark functions (`sStar`, `pasteC`, `markCont`,
`markInt`), and the engine's transcribed JS closed forms in namespace `Engine`
(`gLoc`, `markLensedCall`, `tradeUpdateX`, `tradeUpdateY`). The engine defs are the
literal closed forms (e.g. `gLoc` computes `w := 1 − β/y` then `w/(1−w)`), NOT collapsed
to the monolith functions.

## Results — all proved, no `sorry`/`axiom`/`native_decide`
- `bridge_gLoc` : `Engine.gLoc P θ_K = P.g θ_K`
- `bridge_markCont` : engine call-arm mark in the continuation region equals `markCont`
- `bridge_markInt` : engine call-arm mark past the boundary equals `markInt`
- `bridge_tradeUpdate_y` : engine post-trade y equals monolith post-trade y
- `bridge_tradeUpdate_x` (HEADLINE) : engine closed-form `x_new` equals monolith derived
  post-trade `x` (the reserve update lands exactly on the monolith hyperbola)
- `bridge_single` : bundle of `gLoc`/`tradeUpdateY`/`tradeUpdateX` equalities

All statements are verbatim the pinned signatures; no hypotheses added beyond the genuine
domain/branch conditions, no conclusions weakened or strengthened.

## Axiom check
```
#print axioms bridge_tradeUpdate_x
  'bridge_tradeUpdate_x' depends on axioms: [propext, Classical.choice, Quot.sound]
#print axioms bridge_gLoc
  'bridge_gLoc' depends on axioms: [propext, Classical.choice, Quot.sound]
```
Both axiom sets ⊆ {propext, Classical.choice, Quot.sound}.

## Notes
- Two harmless `unused variable` linter warnings remain (`θ` in `TemporalAMM.g` and `θ_K`
  in `Engine.gLoc`); these arguments are part of the pinned signatures and are intentionally
  ignored by those constant-m closed forms.
- The canonical modules are neither touched nor imported.

# Aristotle obligation L7 (BIG) — engine↔Lean definitional bridge theorem

## Toolchain
Lean 4.28.0 / Mathlib v4.28.0 (`leanprover/lean4:v4.28.0`). `import Mathlib`.

## Task
Produce a self-contained file `RequestProject/EngineBridge.lean` that formalizes the engine's
three constant-m lens/trade functions — `gLoc`, `markLensed`, `tradeUpdate` — as Lean defs over the
SAME carried data as the monolith `TemporalAMM`, written to mirror the engine's JS *closed forms
exactly*, and proves they are DEFINITIONALLY EQUAL to the monolith's `g` / (`markCont`,`markInt`) /
`trade` derived readings. This upgrades the engine↔object identity from report-only numeric
agreement (`engine/verify/monolith_consistency.js`) to a Lean theorem.

This is the strongest available answer to "does the engine instantiate the contracts?": not a
numeric spot-check but a proof that the engine's reserve-update and mark formulas ARE the monolith's
functions.

### The exact engine closed forms (from `HEAD_temporal_mvp_v28_lens.html`)
- `gLoc(state, θ_K, m)`: `w = getW(state); γ = w/(1−w); return m·γ` (constant at every strike).
- `tradeUpdate(s, dy)`: `y_new = y+dy; dx = −α·β·dy / ((y−β)(y_new−β)); x_new = x+dx`
  (α, β preserved).
- `markLensed(wing='call', θ, sNorm, g)`:
  `sStar = θ·((g+1)/g)^g; c = 1/((g+1)·sStar);`
  if `sNorm ≤ sStar` return `c·sNorm` else return `1 − (sNorm/θ)^(−1/g)`.

The monolith state already satisfies `x = α·y/(y−β)`, `w = 1 − β/y`, `γ = (y−β)/β` (so
`w/(1−w) = γ`), and `trade` maps `y → y+D` keeping α, β. So the bridge lemmas are EXACT algebraic
identities, not approximations.

## The pinned object + engine defs (re-declare exactly)

```lean
import Mathlib

noncomputable section
open Real

structure TemporalAMM where
  alpha : ℝ
  beta  : ℝ
  y     : ℝ
  m     : ℝ
  halpha : 0 < alpha
  hbeta  : 0 < beta
  hy     : beta < y
  hm     : 0 < m

namespace TemporalAMM
-- monolith derived readings (verbatim from MonolithConstM.lean):
def x      (P : TemporalAMM) : ℝ := P.alpha * P.y / (P.y - P.beta)
def w      (P : TemporalAMM) : ℝ := 1 - P.beta / P.y
def gamma  (P : TemporalAMM) : ℝ := (P.y - P.beta) / P.beta
def g      (P : TemporalAMM) (θ : ℝ) : ℝ := P.m * P.gamma
def trade  (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) : TemporalAMM :=
  ⟨P.alpha, P.beta, P.y + D, P.m, P.halpha, P.hbeta, hD, P.hm⟩
end TemporalAMM

-- monolith mark fns (verbatim from MonolithConstM.lean):
def sStar    (g θ : ℝ) : ℝ := θ * ((g + 1) / g) ^ g
def pasteC   (g θ : ℝ) : ℝ := 1 / ((g + 1) * sStar g θ)
def markCont (g θ s : ℝ) : ℝ := pasteC g θ * s
def markInt  (g θ s : ℝ) : ℝ := 1 - (s / θ) ^ (-(1:ℝ) / g)

-- ENGINE closed forms, transcribed from the JS (these are the NEW defs to bridge):
namespace Engine
/-- engine gLoc: w := 1 − β/y (= getW); γ := w/(1−w); return m·γ. Written as the JS computes it
    (from w, not from the monolith's γ def) so the bridge lemma is non-trivial. -/
def gLoc (P : TemporalAMM) (θ_K : ℝ) : ℝ :=
  let w := 1 - P.beta / P.y
  let γ := w / (1 - w)
  P.m * γ
/-- engine markLensed, call arm. -/
def markLensedCall (θ sNorm g : ℝ) : ℝ :=
  let sStarE := θ * ((g + 1) / g) ^ g
  let c := 1 / ((g + 1) * sStarE)
  if sNorm ≤ sStarE then c * sNorm else 1 - (sNorm / θ) ^ (-(1:ℝ) / g)
/-- engine tradeUpdate: the NEW x after a dy=D move (y → y+D), via dx = −αβD/((y−β)(y+D−β)). -/
def tradeUpdateX (P : TemporalAMM) (D : ℝ) : ℝ :=
  P.x + (-(P.alpha * P.beta * D) / ((P.y - P.beta) * (P.y + D - P.beta)))
/-- engine tradeUpdate: the NEW y (trivially y+D). -/
def tradeUpdateY (P : TemporalAMM) (D : ℝ) : ℝ := P.y + D
end Engine
```

## Pinned predicates (state these EXACTLY; do not weaken)

1. **`bridge_gLoc`** — the engine's `gLoc` equals the monolith's `g` at every strike.
   ```lean
   theorem bridge_gLoc (P : TemporalAMM) (θ_K : ℝ) : Engine.gLoc P θ_K = P.g θ_K
   ```
   (Needs `w/(1−w) = γ`, i.e. `(1 − β/y)/(β/y) = (y−β)/β`, valid since `y > β > 0`.)

2. **`bridge_markCont`** — the engine call-arm mark, in the continuation region, equals
   `markCont`.
   ```lean
   theorem bridge_markCont (θ sNorm g : ℝ) (hsStar : sNorm ≤ θ * ((g + 1) / g) ^ g) :
       Engine.markLensedCall θ sNorm g = markCont g θ sNorm
   ```

3. **`bridge_markInt`** — the engine call-arm mark, past the boundary, equals `markInt`.
   ```lean
   theorem bridge_markInt (θ sNorm g : ℝ) (hsStar : ¬ (sNorm ≤ θ * ((g + 1) / g) ^ g)) :
       Engine.markLensedCall θ sNorm g = markInt g θ sNorm
   ```

4. **`bridge_tradeUpdate_y`** — the engine's post-trade y equals the monolith's post-trade y.
   ```lean
   theorem bridge_tradeUpdate_y (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
       Engine.tradeUpdateY P D = (P.trade D hD).y
   ```

5. **THE HEADLINE — `bridge_tradeUpdate_x`** — the engine's closed-form post-trade reserve `x_new`
   equals the monolith's DERIVED post-trade `x` (i.e. the engine's reserve update lands exactly on
   the monolith object's hyperbola). This is the load-bearing reserve-consistency bridge.
   ```lean
   theorem bridge_tradeUpdate_x (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
       Engine.tradeUpdateX P D = (P.trade D hD).x
   ```
   PROOF: `(P.trade D hD).x = α·(y+D)/((y+D)−β)` and `tradeUpdateX = x + (−αβD)/((y−β)(y+D−β))`
   with `x = α·y/(y−β)`. Combine over a common denominator; this is exactly the monolith's
   `trade_dx` identity. Requires `y − β ≠ 0` and `y + D − β ≠ 0` (both from `hy`, `hD`).

6. **`bridge_single`** — bundle: with the same carried data, ALL FOUR engine functions equal the
   monolith functions (the headline "the engine IS the object").
   ```lean
   theorem bridge_single (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) (θ_K : ℝ) :
       Engine.gLoc P θ_K = P.g θ_K
       ∧ Engine.tradeUpdateY P D = (P.trade D hD).y
       ∧ Engine.tradeUpdateX P D = (P.trade D hD).x
   ```

## Output spec
- ONE file `RequestProject/EngineBridge.lean`, `import Mathlib`, exact signatures above.
- The engine defs must be the TRANSCRIBED JS closed forms (as given), NOT re-defined as the monolith
  functions — the THEOREMS prove the equality. Do NOT collapse `Engine.gLoc` to `P.g` by definition;
  it must compute via `w := 1 − β/y` then `w/(1−w)`.
- Do NOT weaken statements, do NOT add hypotheses to the conclusions beyond the genuine
  domain/branch conditions shown, do NOT strengthen conclusions.
- FORBIDDEN: `sorry`, `admit`, `axiom` (decls), `native_decide`, `sorryAx`, `opaque`, `unsafe`.
  Kernel `decide` allowed.
- Run `#print axioms bridge_tradeUpdate_x` and `#print axioms bridge_gLoc`; include in
  `ARISTOTLE_SUMMARY.md`; axiom set ⊆ {propext, Classical.choice, Quot.sound}.
- IF some bridge lemma is NOT cleanly provable as stated (e.g. a hidden domain subtlety), do NOT
  weaken it to force a pass — instead leave that ONE lemma's statement intact, report which lemma and
  the precise obstruction in `ARISTOTLE_SUMMARY.md`, and prove the rest. Do NOT introduce `sorry`.
- Self-contained; do NOT touch/import the canonical modules.

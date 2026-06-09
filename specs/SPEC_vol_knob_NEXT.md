# SPEC — Volatility knob (σ-dial) with Merton-derived γ/S\*, δ fixed · lock/unlock dual mode

Status: DRAFT for intern (engine-touching). Awaiting operator go on the params flagged ⚑.
Author: manager. Date: 2026-06-09. Build from HEAD `engine/builds/HEAD_temporal_mvp_v26c.html`
(md5 6cc73563). Manager-verified theory basis below; research-lead doing the formal Merton tie-in.

## 0. Why (theory basis — manager-verified at the engine level)
Temporal's ITM/American smooth-pasting solution IS the Merton (1973) perpetual American option:
- continuation `value ∝ S^(−γ)`; carry coordinate confirmed `d log sNorm/d log S = −γ` (≈1e-3).
- free boundary `S* = K·γ/(γ+1)` is **exactly** Merton's perpetual-put smooth-pasting boundary
  (engine matches to ≤1e-11); engine continuation == `(1/(γ+1))·(S/S*)^(−γ)` (≤6e-4 rel err).
- the two wing boundaries imply characteristic roots λ₋=−γ, λ₊=γ+1; **sum=1 ⟹ r−q=0** (zero-net-carry
  slice — natural for a perp-funded underlying); product ⟹ **γ(γ+1) = 2r/σ²**.
⇒ γ is the perpetual-option characteristic exponent, set by **volatility**. δ has **no** perpetual-
option meaning (Merton power law is exact); δ is AMM-curve ATM smoothing only ⇒ fixed, not a pricing
knob. So the theory-native control is **σ**, with γ and S\* derived; this is strictly more faithful
(and more trader-legible) than a "kurtosis" or raw-γ knob.

## 1. Locked-decision guardrails (do NOT cross)
- γ stays in **(1,4)** (locked convexity range). σ slider maps onto this; clamp γ∈(1,4).
- Smooth-pasting RULE is unchanged: `S* = K·γ/(γ+1)` (put-dir) / `K·(γ+1)/γ` (call-dir). We only let
  γ **vary at runtime**; the boundary formula, the ITM rule, funding, isOTM/wingMember, and the
  dollar/settlement pipe are **untouched**. (Boundary moves because γ moves — same rule, new value.)
- β stays **1** (forced by `value∝S^(−γ)`; moving it breaks the law and G4). NOT a free knob.
- No new economic object, no curve-family change (still GH/Merton). δ stays an AMM constant.

## 2. The σ↔γ map (the locked-mode coupling)
- Fixed reference rate **r = ⚑0.05** (only the ratio r/σ² matters; r sets the σ-number scale).
- σ → γ:  `γ = (−1 + √(1 + 8r/σ²)) / 2`  (positive root of γ(γ+1)=2r/σ²), then clamp γ∈(1,4).
- Derived read-outs (display, not inputs): γ, and `S* = K·γ/(γ+1)` at the active strike(s).
- σ slider range ⚑ chosen so γ spans (1,4): at r=0.05, γ=1↔σ≈22.4%, γ=4↔σ≈7.1%. Propose slider
  **σ ∈ [6%, 25%]** (clamp γ to (1,4) at the ends). Default σ ≈ 12.9% ⇒ γ=2 (current HEAD default).

## 3. UI / control panel
- **Locked (default, "Perpetual-option mode"):** ONE live slider = **σ (volatility)**. Show derived
  γ and S\* read-only. δ read-only (fixed const, label "ATM smoothing"). β read-only "= 1 (value∝S^−γ)".
- **Unlocked checkbox ("Free shape — off-theory"):** expose **raw γ slider** (1,4) AND **raw δ slider**
  for exploration; σ becomes a derived read-out. Clear "off-theory / not the shipped product" note.
  (β stays read-only=1 even unlocked; a free-β toggle is OUT of scope this pass — it breaks G4.)
- This realises the operator's checkbox idea: locked = secondary params (γ,S\*,δ) non-inputable and set
  by the primary (σ); unlocked = play with the raw shape knobs.

## 4. Behaviour on change (re-warp in place)
- On σ (or raw γ/δ) change: recompute γ (and δ if unlocked) → re-run `ghCalibrate(X0,Y0,mp0,γ[,δ])`
  to rebuild the pool's GH scalars → **re-warp the live curve in place** (existing bands/perps persist;
  their marks re-evaluate on the new shape). Redraw ALL graphs (curve, payoff, portfolio table).
- **Pro-forma dotted line + step-1/step-2 stepper MUST re-trace correctly after a shape change**
  (`leg1State/leg2State` from `executeBand` re-run on new pool; `curveTrace` re-samples). This is the
  new behaviour to verify — the engine has never reshaped under open positions before.
- ghCalibrate currently hardcodes δ=0.08 (line 1624); thread δ as a param (locked: 0.08; unlocked:
  slider). γ already a param. This is the only signature touch; keep it minimal/blob-safe.

## 5. ⛔ FILE-SAFETY GATE (every engine HTML edit)
- Two base64 blobs (bg webp ~line 74 md5 `ab663f5c`, logo svg ~line 1060 md5 `c505b08a`) NEVER enter
  context, never hand-edited. Edit via on-disk Python splice (engine/splices/SPLICE_METHOD.md;
  splice_slipfix.py template): work on a copy, slice old by line range, `assert count==1`, keep
  trailing `\n`, blobs stay on disk.
- After edit: 2 blob md5s unchanged · all 3 `<script>` parse · engine IIFE intact · no script line
  >~50k · `engine/verify/run_all.sh` green. STOP-ON-RED: report, do not patch toward green.

## 6. Acceptance criteria
1. 7 GH gates + seam + dir_gate GREEN at the slider endpoints AND default (sweep γ∈{1.2,1.5,2,3,4}).
2. **G4 (value∝S^(−γ)) holds at each γ** the slider reaches (the one accuracy gate).
3. Blob md5s + anchor unchanged; 3 scripts parse; IIFE intact; run_all.sh exit 0.
4. dollar/settlement pipe + funding + isOTM/markFrac/drawStrikeMark byte-unchanged (diff-confirm).
5. S\* read-out == `K·γ/(γ+1)` to ≤1e-9 at the active γ (Merton boundary tracks the dial).
6. **Tester (live): pro-forma dotted line + stepper re-trace faithfully after a σ change**; curve
   re-warps; portfolio/payoff redraw; no console errors. (tester-confirmed before HEAD promotion.)

## 8. UX UPDATE — operator GO (2026-06-09)
- **Number-stepper inputs (`<input type="number">` with up/down arrows), NOT sliders.** Modern in-box steppers.
- **Editable, not range-bound:** σ, r, and (unlocked) δ are freely typeable — no artificial UI cap. Defaults
  are starting values, not limits. r [0.05], σ default [≈0.129 ⇒ γ=2] are editable fields.
- **ONE hard clamp survives — γ > 1** (locked curve family; below it GH/Merton/value∝S^(−γ) and the gates
  break). Clamp the DERIVED (or unlocked raw) γ at >1 (e.g. ≥1.0001) with a visible note. UPPER side SOFT
  (allow γ>4; run_all.sh/G4 is the guardrail — STOP-ON-RED if numerics degrade). γ≤1 would reopen the
  locked family = separate escalation, NOT this pass.
- δ stepper (unlocked) clamp to a numerically-stable positive range (δ>0; guard the GH table build).
- So: free entry honoured everywhere EXCEPT the γ>1 architectural floor + numerical-stability guards.

## 7. Open params for operator (⚑) — recommended defaults in brackets [RESOLVED: editable fields, see §8]
- Reference rate r [0.05] · σ slider range [6–25%] · default σ [12.9% ⇒ γ=2].
- Confirm β read-only (recommended) vs not exposed at all.
- Confirm: letting γ vary at runtime within the unchanged S\*=Kγ/(γ+1) rule is parameter-variation,
  NOT a settlement-semantics change (manager's read; operator to ratify since it brushes §7).

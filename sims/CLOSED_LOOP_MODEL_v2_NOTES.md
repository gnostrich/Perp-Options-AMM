# CLOSED_LOOP_MODEL_v2.xlsx — the loop, on the FAITHFUL curve

**BRAINSTORM / non-core.** v2 supersedes v1 (v1 retained). Built to the operator's 3-layer statement
(entry 508) and the dynamic-seam reminder (entry 509).

## The operator's three layers → the workbook
| operator's layer | sheets | what it does |
|---|---|---|
| **1. Pricing engine** | `Inputs` (curve) · `1_Shapes` · `2_Aggregate` · `4_Trade` | the curve + each LP's own shape off it, aggregated to one book |
| **2. Portfolio accounting** | `3_Portfolio` · `5_Economics` | **the curve gives TOTAL value in ONE number** (ITM included via smooth-paste) — **no intrinsic/extrinsic split anywhere** |
| **3. Perp units → actual margin** | `6_Margin` | the single doorway: net perp units × margin per unit × L0 |
| *(loop closure)* | `7_Closure` | hedge readback `NetPerp + ΣΔ(u)q(u)` → back to the perp book |

## ⚑ v1 → v2 FIX (found by the operator's layer-2 statement — a real error)
v1 priced with a **symmetric proxy** `V = V_atm·e^(−g|u|)`, which **decays into ITM**. The real curve
**smooth-pastes up onto intrinsic**. v1 understated deep-ITM value **~30×** (0.020 vs 0.632 at S/K=0.368).
v2 uses the engine's actual PKG-ITM v2 two-branch form, in ONE column:
```
u = ln(S/K),  u_seam = ln(g/(g+1))          [S* = K·g/(g+1)]
V(u) = 1 − e^u                  for u < u_seam   (past the seam: value IS intrinsic)
     = V_atm·e^(−g·u)           otherwise        (power continuation)
V_atm = (1/(g+1))·(g/(g+1))^g
Δ(u) = e^u  (past seam)  |  g·V(u)  (continuation)      ← the SAME Δ transports and reads back
```
**Verified:** seam `S*/K = 0.6667` (= engine's $66.67 at K=100) · `V_atm = 0.1481` (engine-exact) ·
`V(seam) = 1/(g+1) = 0.3333` · **C⁰ and C¹ weld** (jumps ≤1.3e-7 at finite-difference ε; Δ continuous at
`g/(g+1)`) · **value ≥ intrinsic at all 601 sampled points, 0 violations**.

## ⚑ THE SEAM IS DYNAMIC (operator entry 509 — "moves as the curve shifts, it's elegant")
`u_seam` is a **formula** off `g = m·γ` (and γ = w/(1−w) is live), so the seam slides and strikes **flip regime**:
| w | γ | m | g | S*/K | regimes at u = −0.6,−0.3,0,+0.3,+0.6 |
|---|---|---|---|---|---|
| 0.500 | 1.00 | 1 | 1.00 | 0.500 | c c c c c |
| 0.600 | 1.50 | 1 | 1.50 | 0.600 | **I** c c c c |
| 0.667 | 2.00 | 1 | 2.00 | 0.667 | **I** c c c c |
| 0.500 | 1.00 | 3 | 3.00 | 0.750 | **I I** c c c |

(I = past the seam / intrinsic, c = continuation.) Leaning the pool **or** raising the steepness knob pushes the
seam outward and re-labels strikes automatically — no branch logic, one formula. **Open (L5):** the sheet takes
γ as an input; wiring γ = w/(1−w) with w moving on trades would make the seam move *within* a scenario too.

## Verified chain (manager, independent re-derivation — not reading the sheet)
- `V(u) = 0.4512 / 0.2699 / 0.1481 / 0.0813 / 0.0446`; at u=−0.6 value **is** intrinsic `1−e^u = 0.4512` ✔
- **Shares strike-invariant:** 0.6250 / 0.2500 / 0.1250, max−min across strikes **1.11e-16**
- Per-LP: LP-1 book $173,525 → **10.46%** · LP-2 $69,410 → **8.37%** · LP-3 $34,705 → **18.37%** (HLP-margined)
- **Layer 3:** 2.776405 perp units → **$277,641** margin (single doorway)
- **LOOP CLOSURE residual = 0.000e+00** ✔ · **non-tautology:** hedge_ratio 0.95 → +0.218368 u ($21,837 unhedged)

## Open links (honest)
**L1** per-LP map ⇄ engine (engine is single-pool — this models the target) · **L2** funding rate law (update-2) ·
**L3** settlement/close semantics · **L5** live γ from w (seam dynamic *within* a scenario) ·
Lean cementing: `sims/v3-maps-lean` trusted-from-prover; research-lead + Aristotle running.

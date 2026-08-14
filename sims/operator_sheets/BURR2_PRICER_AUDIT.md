# Operator's `temporal_burr2_swap_pricer_6.xlsx` — audit + what it changes

**Manager verification, 2026-08-14.** The operator supplied the sheet he meant. **It is the real design, and
it is NOT the model I had been building.** Owning that below.

## What the sheet actually is
A complete, self-contained **Burr-2 / t-family swap pricer** on one tab, with its own health annex.
```
survival / wing kernel:   Δ(v) = (1 + (v/s)^a)^(−(γ+1)/a)        [Burr II / t-family]
wing values via the incomplete beta:  A_R(|k|) = qR·(sR/a)·B·(1 − I_u(1/a, γ/a)),  u = 1/(1+(sR/|k|)^a)
scales:      sR = S̄(1+κ),  sL = S̄(1−κ)              B = Β(1/a, γ/a)
the peg:     qR = WL/(WR+WL)  (DERIVED — keeps the wings meeting at the mark)
ITM rule:    Pr = A_wing (OTM)  |  |k| + A_mirror (ITM)   ← put-call parity, NOT smooth-pasting
the swap:    κ is THE ONLY state the swap moves (additive, clamped ±0.95)
             Δκ = Σ ±w·λ·(Q/1%N)·(ATMp/P)
slippage:    s = ½·λ·(Q/1%N)·ATMp/P     (cheap strikes cost more, dear/ITM less)
fee:         φ off premium value, input side
answer:      Q_b = V·(1−φ)/(P_b·(1+s_b))
```
**Four parameters:** level `S̄`, shoulder `a`, tail `γ`, skew `κ`. Plus `N` (pool notional), `λ` (impact), `φ` (fee).

## Verification (independent Python, scipy incomplete beta = BETADIST)
At S̄=0.6, a=1.2705, γ=1.8413, κ=0: `B=0.9288399661`, `G1_=0.0914859758`, `I1_=0.0727183316`,
`WR=0.4386493346`, `WL=0.3020812226`, `qR=0.4078152571`, **ATM price = 0.1788878912**.

**Annex C health identities — all exact:**
| identity | result |
|---|---|
| ATM put A_L(0) = ATM call A_R(0) (wings meet) | diff **0.000e+00** ✅ |
| call at K=0 = 1 (whole coin) | **1.000000000000** ✅ |
| put at K=0 = 0 | 0 ✅ |

**Put-call parity holds EXACTLY at every strike:** C − P = −k to machine precision (−0.5 → +0.500000,
+0.5 → −0.500000, etc.). That's a consequence of the ITM rule `|k| + mirror wing`, and it's stronger than
anything my model had.

**κ tilts the skew** (this is what a swap moves): κ −0.3 → qR 0.5300, ATMp 0.162730; κ 0 → 0.4078, 0.178888;
κ +0.3 → 0.2975, 0.169676.

## ⚠ WHAT I GOT WRONG — my models were on the superseded law
| | my sims | this sheet (the real design) |
|---|---|---|
| kernel | single power law `V ∝ S^(−g)`, `g = m·γ` | **Burr-2, TWO shape params** (`a` shoulder, `γ` tail) |
| state moved by a trade | **`w`** (Balancer weight), `tradeUpdateAt` | **`κ`** (skew), additive |
| ITM | smooth-paste seam `S* = K·g/(g+1)` | **put-call parity**, `|k| + mirror wing` |
| level | tied to the same exponent | **separate `S̄`** |
| wings | one exponent both sides | **two scales `sR`,`sL`, pegged by `qR`** |

The operator told me at entry 518 that we'd moved off the Balancer-derived curve to the Burr distribution.
I acknowledged it — and then built `CURVE_ADAPTS_TO_TRADES_v1` on the **old `w`-based trade law anyway**.
That sheet reproduces the v28 engine exhibit exactly, but the v28 engine is **not** this design.

## What this changes in the prior work
- **`CURVE_ADAPTS_TO_TRADES_v1`** — wrong state variable (`w`, not `κ`). Superseded by this sheet.
- **Gamma-bleed coefficient** `G = g(g+1)/2` was derived from the single power law; under Burr-2 the
  curvature is different (and `a` vs `γ` split it into shoulder vs tail). **All LP-economics magnitudes need
  re-deriving on this kernel** — the *structure* (spread/fees vs bleed) survives, the *coefficient* does not.
- **Smile obstruction** (`mixture_not_single_lens`) was proved for mixtures of *single lenses*. Burr-2 has
  4 parameters; whether the family is closed under mixture is a **different, unproven question**.
- **Slippage is per-leg and price-relative** here (`ATMp/P`), not a depth ladder — cheap OTM strikes take the
  most impact. That is a materially different microstructure from what I modelled.
- **Fee AND slippage both exist** in this design (φ and s), which settles that earlier thread directly.

## What is sound and carries over
The loop *structure* (perps → carve → option → close → cash-out), account-level liquidation, the
apportionment idea, and the fee-vs-slippage distinction are all unaffected. It is the **kernel and the state
variable** that were wrong.

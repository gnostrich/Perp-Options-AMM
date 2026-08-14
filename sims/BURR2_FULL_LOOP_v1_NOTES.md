# BURR2_FULL_LOOP_v1.xlsx — the WHOLE loop, rebuilt on the Burr-2 kernel

**BRAINSTORM / non-core.** Operator entry 532: rebuild everything I had mistakenly tacked onto the
Balancer curve — perps, portfolio, translation to margin, LP aggregation/apportionment, the sims — on the
**real Burr-2 kernel**, in one spreadsheet, plus corresponding Lean.

## Ten sheets, one loop
| sheet | what it does |
|---|---|
| `0_Inputs` | Burr-2 params (S, S̄, a, γ, κ, N, λ, φ) with `Bfn/sR/sL/G1_/I1_/WR/WL/qR/qL/ATMp` derived; per-LP (λᵢ, hᵢ, depth cap, equity); account/perps/carve |
| `1_Curve` | the curve at 11 strikes — `uR, uL, A_call, A_put`, **CALL, PUT**, and `C−P` next to `−k` |
| `2_Quote` | **two-sided quote**: impact `s` (size-proportional) + posted `h` → BID / ASK / round-trip % |
| `3_Apportion` | **A. closed form** (depth-only: `1/λ_agg = Σ1/λᵢ`, shares, revenue, conservation) **B. the ladder** (needed once posted spreads differ) |
| `4_Trade` | the swap: both leg prices off the curve, slippage, proceeds, **BUY SIZE**, LP revenue, and **Δκ → κ after** |
| `5_Portfolio` | positions valued in **ONE number** each (ITM by parity), totalled in BTC and $ |
| `6_Perps_Account` | clubs → **carve** → options → **ACCOUNT-level leverage vs the 50× cap** (LP excluded) |
| `7_Margin` | **Layer 3**: net perp units × margin per unit × L₀ = the single doorway |
| `8_LP_Econ` | per-LP revenue (fee+impact) vs **Burr-2 gamma bleed** (G̃≈5.76) → net APR |
| `9_CHECKS` | 14 invariants |

## Verified independently (Python + scipy, not read from the sheet)
| check | result |
|---|---|
| **B1** put-call parity `C−P = −k` | **1.39e-17** ✅ |
| **B2** ATM wings meet `A_call(0)=A_put(0)` | 2.44e-13 ✅ |
| **B4** `qR+qL = 1` | 0.0 ✅ |
| **B5** apportionment shares sum to 1 | 0.0 ✅ |
| **B6** apportionment revenue conserves | **0.00e+00** ✅ |
| **B7** round-trip cost > 0 (irreversible) | **3.15%** ✅ |
| **B8** swap moves κ | **+0.007030** ✅ |
| **B10** LP revenue on the swap | **+0.028779 BTC** ✅ |
| **B14** break-even avg trade size | **1.0257% of pool** vs 2.5% input → **VIABLE** ✅ |

## What changed vs my earlier (wrong-kernel) work
- state moved by a trade is **κ**, not `w`; level/shape (`S̄, a, γ`) do **not** move on a swap;
- ITM is **parity** (`|k| + mirror wing`), not a smooth-paste seam — and it is **exact**;
- gamma is the **measured Burr-2 curvature** `G̃ ≈ 5.76` (rising with |k|), not `g(g+1)/2`;
- revenue is **fee + size-proportional impact**, not a posted half-spread — which is why the viability
  question is **trade size**, not spread width.

## Honest gaps still in this workbook
- `8_LP_Econ` hard-codes `G̃ = 5.76` (a measured mean); it should be computed per strike from the curve.
- The ladder in `3_Apportion` is laid out for 3 LPs in a fixed order; a crossing order (per-strike sort)
  is not automated.
- Trade-size distribution is a single average `Q/N`, not a distribution — and B14 shows the answer hinges on it.
- Everything is still `sims/` brainstorm; nothing is wired to the engine.

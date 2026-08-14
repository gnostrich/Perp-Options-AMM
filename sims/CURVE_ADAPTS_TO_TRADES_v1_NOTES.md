# CURVE_ADAPTS_TO_TRADES_v1.xlsx — the AMM curve, its parameters, and how it adapts to a trade

**BRAINSTORM / non-core.** Operator (entry 527) meant *this* sheet, not the returns sim.
**Honest note: this did not previously exist** — every earlier workbook was a static snapshot (shapes,
aggregation, pricing, economics); none showed the curve warping when a trade lands. Built now.

## Sheets
| sheet | what it does |
|---|---|
| `1_Pool_and_Trade` | pool state **before** (x, y, w, m) → derived γ, g, seam, V_atm; enter a trade (ρ, dy); the **engine's trade-point law** computes the state **after** |
| `2_Curve_Adapts` | the whole curve **before vs after** at 7 strikes: V, Δ, % change, regime — **plus a chart** of both curves |
| `3_Trade_Sequence` | 5 chained trades; each row starts from the previous row's state; w, γ, seam and V_atm evolve — **plus a chart** |
| `4_CHECKS` | 7 checks, incl. three that tie the sheet to the engine's **pinned exhibit** |

## The law implemented (engine `tradeUpdateAt`, trade-point conservation)
```
y_T = y·ρ^w            x_T = x·ρ^(w−1)          α_T = w·x_T        den = w·y_T + dy
w′  = den/(y_T + dy)   Δx  = −α_T·dy/den        x′ = x + Δx        y′ = y + dy
γ′  = w′/(1−w′)        g′  = m·γ′               u*′ = ln(g′/(g′+1))    V_atm′ = (1/(g′+1))(g′/(g′+1))^g′
```

## The adaptation, measured (pool 10/10, w=0.5, m=1; trade ρ=4, dy=+1)
| | w | γ | seam S*/K | V_atm |
|---|---|---|---|---|
| **before** | 0.500000 | 1.0000 | 0.5000 | 0.250000 |
| **after** | 0.523810 | 1.1000 | **0.5238** | 0.233814 |

**Every strike re-prices and the seam slides:**
| u | V before | V after | change |
|---|---|---|---|
| −0.6 | 0.455530 | 0.452382 | −0.69% |
| −0.3 | 0.337465 | 0.325229 | −3.63% |
| 0.0 | 0.250000 | 0.233814 | **−6.47%** |
| +0.3 | 0.185205 | 0.168095 | −9.24% |
| +0.6 | 0.137203 | 0.120847 | **−11.92%** |

**One trade re-prices the entire book and moves the seam.** That is the adaptation — and it is why the seam
is dynamic: `w → γ → g → u*`.

## Sequence (5 trades, chained)
```
 #  rho    dy        x       y        w   gamma    seam    V_atm
 0    -     -   10.000  10.000  0.50000  1.0000  0.5000  0.250000
 1  4.0  +1.0    9.773  11.000  0.52381  1.1000  0.5238  0.233814
 2  0.5  -0.8   11.549  10.200  0.46820  0.8804  0.4682  0.272641
 3  2.0  +1.5   10.857  11.700  0.51930  1.0803  0.5193  0.236830
 4  1.0  -1.2   12.244  10.500  0.46437  0.8669  0.4644  0.275457
 5  3.0  +0.6   12.027  11.100  0.48213  0.9310  0.4821  0.262571
```
`w` stays strictly inside (0,1) by construction; γ, the seam and every option value follow it.

## CHECKS (manager-verified independently)
| # | check | result |
|---|---|---|
| T1 | `w′` = 11/21 (pinned engine exhibit) | **0.00e+00** ✅ |
| T2 | `x′` = 215/22 | **0.00e+00** ✅ |
| T3 | `Δx` = −5/22 | 6.38e-16 ✅ |
| T4 | `w′` strictly in (0,1) | True ✅ |
| T5 | seam **moved** (adaptation is real) | 0.5000 → 0.5238 ✅ |
| T6 | value ≥ intrinsic after the trade (deep ITM) | slack 0.00e+00 ✅ |
| T7 | `y′ = y + dy` exact | 0.00e+00 ✅ |

**T1–T3 tie the sheet to the engine's pinned exhibit — they are zero, so the sheet implements the engine's
actual trade law, not an approximation.**

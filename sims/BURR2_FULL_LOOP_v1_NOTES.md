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

---
## FIXES APPLIED (operator entries 533–537)

**Fix 3 — relabelled one cell (not a program).** `QN` → **`QN_volwtd`**, with a red note:
*"VOLUME-WEIGHTED avg trade size. NOT the plain average: a few whales push this UP a lot. Revenue tracks
THIS number."* The operator was right that a single assumption cell is fine — the problem was the **label**,
which invited the wrong number. Demonstrated: 1000 tiny trades vs 990 tiny + 10 whales have the **same plain
average** but **5.6× different revenue** (0.047 vs 0.262); revenue tracks the volume-weighted figure.

**Fix 1 — curvature is now per-strike and LIVE.** `1_Curve!J` computes `G̃(k)` from the curve itself;
`8_LP_Econ` reads `1_Curve!J17` instead of the hard-coded 5.76.
**⚠ I introduced and then caught a bug here:** my first version used an *even*-spacing second-difference on an
**unevenly spaced** strike grid, which produced a spurious spike (G̃ = 57.26 at k=−0.05). Corrected to the
uneven-grid formula `f''(x₁) = 2(h₂f₀ − (h₁+h₂)f₁ + h₁f₂)/(h₁h₂(h₁+h₂))`. Result is now smooth and rises with |k|:
| k | −0.40 | −0.25 | −0.15 | −0.05 | 0.00 | +0.15 | +0.25 | +0.40 |
|---|---|---|---|---|---|---|---|---|
| **G̃** | 0.49 | 1.63 | 3.58 | 6.07 | 4.76 | 8.23 | 8.96 | **9.66** |
mean **5.47** (the old hard-coded 5.76 was close on average, but hid a ~20× spread across strikes).

**Fix 2 — the ladder now re-sorts per strike.** New block `3_Apportion!A22` computes, for every strike, which
LP is cheapest (allowing each LP's posted spread to vary with strike), and flags in column F where the order
**CHANGES**. A single fixed fill order is wrong whenever LPs' spread profiles cross.

**Not fixed (unchanged, and correctly so):** Gap 4 — none of this is wired into the engine; that is a build,
not a sheet edit.

---
## ⚑ MATERIAL CORRECTION (operator, entry 539) — the slippage "revenue" is a SHORTCUT ARTIFACT

**Operator:** in the spreadsheet, for simplicity, the trader pays the **post-execution price on the whole
size**. In practice execution is **continuous, closed-form** — the trader pays the **integral along the path**.
That shortcut is what was creating slippage revenue.

**Verified.** For a trade of size Q with full-size impact `s_full`:
```
ENDPOINT convention (the sheet):  cost = Q·P·(1 + s_full)
CONTINUOUS / closed form (real):  cost = ∫₀^Q P(q) dq = Q·P·(1 + s_full/2)
surplus  = endpoint − integral    = ½·s_full·Q·P        ← EXACTLY the "slippage revenue"
```
| Q/N | s_full | endpoint | integral | surplus | surplus ÷ fee |
|---|---|---|---|---|---|
| 0.5% | 0.63% | 0.142695 | 0.142247 | 0.000447 | 1.1× |
| 2.5% | 3.15% | 0.731363 | 0.720181 | 0.011181 | **5.3×** |
| 10% | 12.62% | 3.193800 | 3.014900 | 0.178900 | **21×** |

**The surplus exists only because of the endpoint convention.** Under true continuous execution it vanishes —
which is exactly consistent with the earlier CPMM finding: **walking a curve is reversible, not revenue.**

### This settles the Case A / Case B question I raised one message earlier
- **Case A** (sheet's shortcut, impact counted as revenue): profitable at ~1% average trade size.
- **Case B** (real continuous execution, only the fee is net revenue): **this is the true one.**
  | turnover | fee revenue | vs bleed 0.985× | |
  |---|---|---|---|
  | 0.3×/day | 0.33× | −0.66 | **LOSS** |
  | 0.90×/day | 0.99× | ~0 | break-even |
  | 2.0×/day | 2.19× | +1.21 | profit |

**⇒ fee-only break-even turnover ≈ 0.90×/day** (vs the 0.3× assumed), **or ~90bps fee at 0.3×/day**
(vs 30bps today).

### And it vindicates the operator's instinct
With the integral convention, **revenue = fee × VOLUME** and **trade SIZE drops out of revenue entirely.**
The operator's "volume is right" was correct; my whole trade-size-distribution concern (and the
`QN_volwtd` relabel) was chasing an artifact of the sheet's own simplification.

**Status of the workbook:** `2_Quote` / `4_Trade` / `8_LP_Econ` still use the endpoint convention (they mirror
the operator's sheet). They are therefore **optimistic on revenue by ½·s·Q·P per trade**. Fixing this means
switching the execution cost to the integral form — a real change, flagged, not yet made.

---
## SWITCHED TO THE INTEGRAL CONVENTION + VIABILITY GRID (operator entry 540: "yes to both")

**Change 1 — the workbook now prices execution continuously.**
- `2_Quote`: effective half-spread is now `s_full/2 + posted h` (the **average** along the path), with a red
  note that the impact half is a **price path, not LP revenue**.
- `4_Trade`: slippage is the integral form; **LP revenue is now FEE ONLY**. The old endpoint figure is kept
  beside it, greyed, labelled *"the OLD overstated figure"*, so the difference stays visible.
- `8_LP_Econ`: `revenue = fee × VOLUME`. **Trade size no longer enters revenue at all.**

**Change 2 — new sheet `10_Viability`: the fee × turnover grid.** This is now THE business question.

**NET (× book value / yr), integral convention, bleed = 0.985:**
| fee \ turnover | 0.1× | **0.3×** | 0.5× | 1.0× | 2.0× | 3.0× | 5.0× |
|---|---|---|---|---|---|---|---|
| 10 bps | −0.95 | −0.88 | −0.80 | −0.62 | −0.25 | +0.11 | +0.84 |
| **30 bps** *(today)* | −0.88 | **−0.66** | −0.44 | **+0.11** | +1.21 | +2.30 | +4.49 |
| 50 bps | −0.80 | −0.44 | −0.07 | +0.84 | +2.67 | +4.49 | +8.14 |
| 75 bps | −0.71 | −0.16 | **+0.38** | +1.75 | +4.49 | +7.23 | +12.70 |
| **100 bps** | −0.62 | **+0.11** | +0.84 | +2.67 | +6.32 | +9.97 | +17.27 |
| 200 bps | −0.25 | +1.21 | +2.67 | +6.32 | +13.62 | +20.92 | +35.52 |

**Break-even fee by turnover:** 0.1× → 270bps · **0.3× → 90bps** · 0.5× → 54bps · **1.0× → 27bps** ·
2.0× → 13bps · 5.0× → 5bps.
**Break-even turnover by fee:** 10bps → 2.70×/day · **30bps → 0.90×/day** · 50bps → 0.54× ·
75bps → 0.36× · 100bps → 0.27×.

### The honest read
**Today's assumption (30bps, 0.3×/day) sits at −0.66 — deep in the red.** Two routes out, and only two:
1. **Raise the fee** to ~90bps at current turnover, or
2. **Get turnover to ~0.9×/day** at the current 30bps.
Anything on or above the green boundary works; everything below it does not. Note the grid is roughly a
hyperbola — `fee × turnover ≈ 27 bps·×/day` is the break-even line.

**Caveat that could move the whole grid:** `bleed` reads live off `1_Curve!J17` (mean per-strike curvature
≈5.47 at the current `a, γ`). A **flatter curve (lower curvature) lowers the bar proportionally** — so curve
shape is itself an economics lever, not just a pricing choice.

---
## ⚑ REALTIME LP TUNING — the strongest idea yet, and it changes the problem (operator entry 541)

**Operator:** if LPs can dynamically tune their own params in realtime, they can run their own strategies.
**Verified — and it fixes the exact failure mode the static model has.**

### The asymmetry that makes it work
The bleed scales with **RV²**, but a **static fee is a constant**. So a static LP is calibrated to exactly
one vol level and is wrong everywhere else:
| RV | bleed | static 90bps rev | **net (static)** | vol-indexed fee | net (dynamic) |
|---|---|---|---|---|---|
| 20% | 0.109 | 0.985 | **+0.876** | 10 bps | 0.000 |
| 60% | 0.985 | 0.985 | +0.001 | 90 bps | 0.000 |
| 80% | 1.750 | 0.985 | **−0.765** | 160 bps | 0.000 |
| 120% | 3.938 | 0.985 | **−2.953** | 360 bps | 0.000 |

**The static LP is over-paid in calm markets and wiped out in vol spikes.** A dynamic LP quoting in **vol
terms** is flat at every level. That is exactly how real options market makers work — **they quote a vol, not
a price.** This is the single strongest argument for realtime tuning.

### Four strategies it unlocks
| strategy | mechanism | why it matters |
|---|---|---|
| vol-indexed spread | fee/h ∝ RV² | removes the vol-spike wipeout; break-even at ANY vol |
| inventory skew | tilt own κᵢ | offload risk without crossing the market |
| depth withdrawal | cut own λᵢ on toxic flow | stop feeding informed traders |
| strike specialisation | move own a, γ | be paid for providing wings vs ATM |

### What it costs — four risks that exist ONLY once tuning is realtime
1. **LP-vs-LP adverse selection.** The slowest adjuster is picked off by the fastest. **The model has no
   latency dimension at all.**
2. **Correlated withdrawal.** If everyone widens on a vol spike (individually rational), the pool goes
   illiquid exactly when traders need it: 50% withdraw → impact ×2.0; 90% → **impact ×10**. Classic
   market-maker-withdrawal failure.
3. **Refraction becomes continuous.** One LP re-quoting instantly re-prices everyone's fill share — the
   zero-sum effect now runs in realtime.
4. **Herding / oscillation.** Strategies reacting to the same signal can cycle; nothing in the design damps it.

### The consequence for the whole project
Realtime tuning converts a **passive-LP product** into an **active-MM venue**. Economically much stronger —
it dissolves the fee-vs-turnover bind, because LPs price the risk they actually see. But the open problem
**shifts**: no longer *"is the fee enough?"* but **"is the LP game stable and fair?"** — which is the
apportionment/individual-rationality question, now with real teeth (latency, withdrawal, herding).

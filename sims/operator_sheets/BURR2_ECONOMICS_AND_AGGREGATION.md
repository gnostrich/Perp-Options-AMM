# (a) LP economics on the Burr-2 kernel · (b) does the family aggregate?

**BRAINSTORM / non-core.** Both worked on the operator's real kernel (`temporal_burr2_swap_pricer_6.xlsx`),
not my superseded power-law model. Params: `S̄=0.6, a=1.2705, γ=1.8413`, mark `S=65,695.5`.

---
## (a) The economics, re-derived on the real kernel

**First, two corrections to my own first pass:**
1. I compared a *cash* quantity to a *dimensionless* one and reported "88,987×" — a **unit error**.
2. I assumed the ATM 2nd-difference was straddling a kink. **It isn't** — checked: slope just right of ATM
   `−0.407815`, just left `−0.407815`, **jump 1.8e-07 ⇒ the call is C¹ (smooth) at the money.** The wing peg
   `qR = WL/(WR+WL)` delivers smoothness *and* exact parity. That's a genuinely nice property of the design.

**The right comparison is dimensionless curvature** `G̃(K) = Γ_cash·S² / C_cash` (curvature per unit of value):
| K/S | C (coin) | **G̃** |
|---|---|---|
| 0.70 | 0.357078 | 1.14 |
| 0.90 | 0.225625 | 4.97 |
| 1.10 | 0.141833 | 7.40 |
| 1.30 | 0.091484 | 9.63 |

**mean G̃ ≈ 5.76 vs my old `G = g(g+1)/2 = 3.00` — about 1.9×.** Note G̃ **rises with strike distance**
(1.1 → 9.6): far-OTM legs carry far more curvature per unit of value than the old single-exponent model said.

**Bleed per unit of book value per year** `= ½·G̃·RV²`:
| RV | old | **Burr-2** |
|---|---|---|
| 40% | 0.2400 | **0.4610** |
| 60% | 0.5400 | **1.0372** |
| 80% | 0.9600 | **1.8439** |

**Viability re-run** (`h* = bleed / (turnover·days)`):
| | old | **Burr-2** |
|---|---|---|
| RV 60%, turnover 0.3/day | 49 bps | **95 bps** |
| RV 60%, turnover 1.0/day | 15 bps | **28 bps** |

**⇒ The structure survives, the coefficient roughly doubles.** The L7 conclusion is unchanged in kind and
worse in degree: at realistic turnover you need **~95bps**, not single-digit bps.

---
## (b) Does the Burr-2 family close under aggregation? **No — but the obstruction is SMALL**
Mixed two LPs 50/50 and fitted the best single Burr-2 (Nelder-Mead over `S̄,a,γ,κ`, 40 strike points):
| LPs differ in | best-fit RMS | relative to level | verdict |
|---|---|---|---|
| **κ only** (skew) | 1.85e-05 | **0.03%** | outside the family |
| **a only** (shoulder) | 9.23e-05 | **0.12%** | outside the family |
| **γ only** (tail) | 1.26e-05 | **0.02%** | outside the family |
| *control: identical curves* | 1.12e-14 | — | fits exactly ✅ (method is sound) |

**This is a materially different answer from the single-lens case.** There, `mixture_not_single_lens` was a
**proved, structural** impossibility. Here the family is *formally* not closed, but a best-fit Burr-2 tracks
the mixture to **0.02–0.12%** — small enough that, for a product, aggregating heterogeneous LPs into one
posted Burr-2 curve is **practically viable**, with a re-fit rather than an exact representation.

**What that buys:** per-LP `(S̄, a, γ, κ)` heterogeneity is **not** blocked the way per-LP steepness was under
the single lens. The pool can post one Burr-2 curve fitted to the aggregate, and the fit error is basis-point-scale.

**What it costs / still open:**
- the residual is **not zero**, so the posted curve is an *approximation* of the LP set — someone bears the
  fit error, and who bears it is an apportionment question (ties straight back to G6/individual rationality);
- 0.02–0.12% is measured at these params and a 50/50 mix — **it should be stress-tested** at wider parameter
  spreads and lopsided weights before anyone relies on it;
- the exact-aggregation theorems in `v3-maps-lean` were proved for the *depth/spread* maps, **not** for this
  kernel — so this is numerics, not proof. A Burr-2 closure statement is a candidate Aristotle conjecture.

---
## (c) ALIGNMENT + APPORTIONMENT: do you still need the two curves? (operator, entries 530–531)

**ITM extension — ALIGNED, already in the sheet.** `Pr = |k| + mirror wing` gives **exact put-call parity**
at every strike (`C−P = −k` to machine precision). Verified.

**Two curve sets — the important half is already there.** The sheet's haircut/markup gives a real two-sided
quote (k=0.1, Q=5 → **bid 0.139597 / ask 0.144069**) and it is **irreversible**: sell 5 then buy 5 back costs
**3.75% of notional**. So — unlike CPMM slippage — the sheet's impact **is revenue**. Difference from our
sketch: the sheet's spread is **size-proportional** (`s ∝ Q`, → 0 as Q → 0) from one pool-level `λ`; ours
added a **per-LP posted `h_i(k)`** that exists at any size.

### The operator's point, tested: does the closed form do the apportionment?
| LPs differ in | closed form enough? | why |
|---|---|---|
| **depth only** (`λ_i`, same shape) | ✅ **YES** | `1/λ_agg = Σ1/λ_i`, shares `w_i = (1/λ_i)/Σ(1/λ_j)`; every LP fills pro-rata at the **same** `s`. Verified: shares 0.625/0.25/0.125, apportioned total = pool capture, **residual 1.7e-18**. No curves to materialise. |
| **posted spread** | ❌ **NO** | the effective spread depends on **which LPs are marginal**, i.e. on fill ORDER (Q=2 → 5.00bps, Q=6 → 12.50bps). A scalar `s` cannot express that — you must materialise the **envelope = the two curves**. |
| **shape** (`a, γ, κ`) | ❌ **NO** | shares vary **by strike**, so you need the per-strike curves (the 0.02–0.12% re-fit case). |

**⇒ The operator is right.** The single number does the apportionment **only** in the homogeneous-shape,
depth-only case. **The moment LPs express spread or shape, the two-curve construction is load-bearing** —
it is not an optional presentation layer, it is what carries the allocation information.

### Consequence for L7 (redone on the sheet's actual revenue model)
Revenue = fee + size-proportional impact, so it is dominated by **trade size**:
| turnover | avg trade | revenue/yr | bleed (RV 60%) | net |
|---|---|---|---|---|
| 0.3× | 0.5% of pool | 0.67× | 1.04× | −0.36× |
| 0.3× | **2.5% of pool** | 2.05× | 1.04× | **+1.02×** |
| 0.3× | 10% of pool | 7.23× | 1.04× | +6.20× |

**Break-even = average trade size ≈ 1.03% of pool notional** at 0.3×/day (fee alone covers 32% of the bleed).
So the viability question is **not** "can you charge ~95bps?" (that was my posted-`h` assumption, which this
design does not use) but **"is the average trade ≥ ~1% of pool?"** — a far more answerable question.

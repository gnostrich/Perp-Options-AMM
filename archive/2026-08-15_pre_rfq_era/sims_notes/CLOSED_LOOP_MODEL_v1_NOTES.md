# CLOSED_LOOP_MODEL_v1.xlsx — the loop, actually linked end to end

**BRAINSTORM / non-core** (`sims/`, engine untouched). Operator entries 504–507: complete the economics
sheet into the **full end-to-end closed loop** — per-LP exposure profiles + perp-units settlement — with
Lean/Aristotle cementing *after*. Magnitudes illustrative; the structure is the deliverable.

## The 8 linked stages (every stage's output is the next stage's input — real cell links, one workbook)
| sheet | stage | key formula | feeds |
|---|---|---|---|
| `Inputs` | globals + **per-LP** β,h,equity + strike grid + **Δ(k)** | `Δ(k)=e^(−g·|k|)`, `g=m·γ`, `G=g(g+1)/2` | everything |
| `1_Shapes` | **per-LP shape map** | `βᵢ(k)=βᵢ·Δ(k)²`, `hᵢ(k)=hᵢ·|Δ(k)|` | → 2 |
| `2_Aggregate` | **aggregation → one book** | `1/β_agg=Σ1/βᵢ` (parallel), `h_agg=min hᵢ`, `wᵢ=(1/βᵢ)/Σ(1/βⱼ)` | → 4 |
| `3_Pricing` | engine curve | `V(k)=V_atm·e^(−g|k|)`, `V_atm=1/((g+1)((g+1)/g)^g)` | → 4,5,6 |
| `4_Trade` | fills split by the shares | `qᵢ(k)=q(k)·wᵢ`, traded$ = q·S·turnover | → 5,6,7 |
| `5_Economics` | **per-LP P&L** | carry `book·G·σ_cal²` − vol cost `book·G·RV²` + spread + fees − hedge − financing + HLP | APR per LP |
| `6_Settlement` | **units→cash (station 17)** | net perp units `Σqᵢ(k)·V(k)` → `× closing equity × L0` | the exit doorway |
| `7_Closure` | **hedge readback** | `exposure = NetPerp + ΣΔ(k)·qᵢ(k)`, `NetPerp=−hedge_ratio·ΣΔq` | **back to the perp book** |

**Why it's a loop, not a chain:** the *same* `Δ(k)` column shapes each LP's curve in Stage 1 **and** reads the
exposure back in Stage 7 (the map's "same Δ transports and reads back"). Stage 7's required hedge is the perp-book
position Stage 1 was built off — the circle closes.

## Manager verification (independent re-derivation, not reading the sheet's formulas)
- **Loop closes: residual exposure = 0.000e+00** at `hedge_ratio = 1.00` (all three LPs individually 0).
- **Non-tautology check:** residual *moves* with the knob — `hedge_ratio` 0.95 → **+0.355 units ($35,539 unhedged)**;
  0.90 → +0.711 units ($71,079). So closure is a real condition, not an identity.
- **Strike-invariance theorem holds numerically:** fill shares `0.625 / 0.250 / 0.125` **identical at every strike**
  (max−min ≤ 5.6e-17) — `Δ²` cancels exactly as `share_strike_invariant` claims.
- Book $105,302; settlement 1.053018 perp units → **$105,302 cash at the exit** (single doorway, ties out).

## ⚑ FINDING — "LP refraction" is a CROSS-effect (this is new, and it matters)
Baseline (each LP with its own shape):
| LP | β | h | equity | fill share | NET APR |
|---|---|---|---|---|---|
| LP-1 deep | 2.0 | 0.0010 | $1,000,000 | 62.5% | **7.50%** |
| LP-2 mid | 5.0 | 0.0015 | $500,000 | 25.0% | **6.00%** |
| LP-3 thin, HLP-margined | 10.0 | 0.0008 | $250,000 | 12.5% | **16.00%** |

Now **LP-2 alone** deepens its book (β 5 → 2.5) — nobody else changes anything:
| LP | fill share | NET APR |
|---|---|---|
| LP-1 | 62.5% → **50.0%** | 7.50% → **6.00%** |
| LP-2 | 25.0% → **40.0%** | 6.00% → **9.60%** |
| LP-3 | 12.5% → **10.0%** | 16.00% → **14.80%** |

**One LP changing its own profile refracts through the shares and moves EVERY other LP's yield.** Individual
exposure choice is therefore *not* individually isolated — the shares are a shared, zero-sum allocation
(`Σwᵢ = 1`). Loop still closes (residual 0). **Operator-tier implication:** per-LP profiles are a genuine
product feature, but LP yield is *coupled*; a "set your own profile" UI needs to disclose that your yield
depends on what other LPs choose. Not a defect of the map — a property of aggregation that the sheet now exposes.

## Honest status of the links (unchanged from CLOSED_LOOP_MAP.md)
- **L1 per-LP map ⇄ engine: OPEN.** The engine is single-pool/single-curve; this models the **target** design.
- **L2 funding rate law: OPEN** (update-2) — sets the carry magnitude.
- **L3 settlement semantics: partly OPEN** (station 17 accounting modeled; close-semantics history at A14).
- **L4 per-LP economics: NOW BUILT** (this workbook).
- Lean cementing: `sims/v3-maps-lean` is **trusted-from-prover**; research-lead is running the local build +
  statement audit + the two missing conjectures (aggregation⇄pricing, settlement no-arb) with Aristotle.

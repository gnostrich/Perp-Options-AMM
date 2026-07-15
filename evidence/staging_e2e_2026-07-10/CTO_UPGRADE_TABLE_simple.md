# Staging upgrade → 8-Jul engine (`5ce1a76c`) — factor-by-factor reference for the CTO

Read across each row: **what code**, **plain English**, **the math**, **an example**, then **your current
build (14-Jun `80f050e2`) vs the desired build (8-Jul `5ce1a76c`)**, and **what staging actually shows
today** (our live test). Code names are the reference single-file engine's functions (`<script id="engine">`)
+ the acceptance check IDs in `lens_selfcheck.js` — mirror these in your Go engine. **PORT** = must implement.

> Staging today = the `v28-lens` engine but **configured at γ=1, m=1**. That config alone hides most of the
> 14-Jun→8-Jul differences, so several "staging now" cells read UNVERIFIED — set **γ=2** (Factor 0) first.

---

### Factor 0 — Steepness config γ (do this first) · **CONFIG, not code**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| engine config `gamma`; harness `a16_atm_gate` | How steep the whole option curve is. γ=1 is the flat degenerate edge; the product needs γ>1. | require **γ ∈ (1,4)**; lensed exponent `g = m·γ` | γ=2 gives the golden numbers; γ=1 gives none |

| | Current (14-Jun) | Desired (8-Jul) | **Staging now** |
|---|---|---|---|
| γ | 2 (intended) | 2 (intended) | **1 ⚠ — must set to 2** (`?gamma=` is ignored; it's a server config) |

---

### Factor 1 — In-the-money option price + exercise line · `markLensed`, checks `O1/CM4-v2`, `CM10` · **PORT**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `markLensed(wing,θ,sNorm,g)`; seam checks `CM4-v2`; value≥intrinsic `CM10` | Below the strike, the old build priced options too cheap and put the "exercise now" line in the wrong place. Fixed. An option is **never** worth less than exercising it. | put seam (exercise line) `S* = K·g/(g+1)`; call seam `K·(g+1)/g`; value at seam `1/(g+1)`; ATM value `1/((g+1)·((g+1)/g)^g)`; **hard rule** `mark ≥ max(0, intrinsic)` | put K=$100, γ=2: exercise **$66.67**, value **⅓**, ATM **0.148**. m=3: **$85.71**, **⅐**, **0.057** |

| | Current (14-Jun) | Desired (8-Jul) | **Staging now** |
|---|---|---|---|
| ITM price | too low; exercise line at ~0.444K; can dip **below** intrinsic | correct; exercise line **0.667K**; never below intrinsic | prices match reference **exactly at γ=1** in θ∈[0.5,1.5] (Δ≤6e-17, 0 intrinsic-violations); the ITM-seam region **UNVERIFIED** (γ=1 + outside the ±50% window) |

---

### Factor 2 — Trade bends the curve at the trade's own spot · `tradeUpdateAt`, `executeLeg`, check `CM8-v2` · **PORT**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `tradeUpdateAt(state,dy,ρ)` (ρ=trade ray); `executeLeg` routes swaps through it; check `CM8-v2.2` | A trade away from the pool's middle must bend the curve **at that spot**, not at the middle. Old build always bent at the middle — a bug you agreed to fix. Plain spot trades unchanged. | conserve the LOCAL pair at trade point T: `(x_T+Δx)·w′ = α_T` and `(y_T+dy)·(1−w′) = β_T`, with `x_T=x·ρ^(w−1)`, `y_T=y·ρ^w`. At ρ=1 it reduces to the plain spot `tradeUpdate`. | pool (10,10,w=½), ray 4, cash-in 1 → **w′ = 11/21**. Old (middle) = **22/43** (wrong) |

| | Current (14-Jun) | Desired (8-Jul) | **Staging now** |
|---|---|---|---|
| off-center trade | bends at middle → **22/43**; global α,β conserved | bends at trade point → **11/21**; global α,β **move** off-ATM | every band conserves global α,β = the **spot (ρ=1) law**; the off-spot warp is **UNRESOLVED** — real risk it's still middle-booked. **Verify:** drive a known ρ≠1 trade; α,β should move to the 11/21-law value |

---

### Factor 3 — One steepness knob `m` · `gLoc`, checks `CM1–CM3` · **PORT (skip if already present)**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `gLoc(state,θ,m)` → constant `g=m·γ` at every strike | A single number sets curve steepness: m=1 normal, bigger = steeper everywhere and trades land further out. Set once from the asset's vol. | `g_loc(K) = m·γ` (constant in K); trade map `θ_tx = mode·(chosen/mode)^m` | m=1 → g=2 (ATM 0.148); m=3 → g=6 (ATM 0.057) at γ=2 |

| | Current (14-Jun) | Desired (8-Jul) | **Staging now** |
|---|---|---|---|
| m knob | present (v28-lens line) | present (unchanged) | m=1 present but **inert at γ=1 → UNVERIFIED** it steepens. **Verify:** after γ=2, sweep m∈{1,3} |

---

### Factor 4 — Close a position (one rule) · `closeBand`, checks `CM6-v3/CM12` · **PORT**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `closeBand(...)` (both legs reverse live via `tradeUpdateAt`, check `CM6-v3`); no two-case branch | Old close had two cases (OTM legs traded back, ITM legs cashed separately) that didn't line up — payout could **jump ~½** at the strike. New: every leg sells back to the pool the same way; **smooth, no jump**. | trader is paid the **option value computed BEFORE the pool trade** (`legPrice(s0)`); the pool swap is bookkeeping only, pays the trader nothing extra | close an ITM-adjacent leg: payout continuous across the strike (no half-payout jump) |

| | Current (14-Jun) | Desired (8-Jul) | **Staging now** |
|---|---|---|---|
| close | two-case → **½ jump** at strike | one rule → **smooth**, payout = pre-trade value | round-trip pool returned Δ=0 (display precision) — **inconclusive** at γ=1 on a shared pool; does NOT distinguish clean-close from old exact-restore. **Verify:** after γ=2, close ITM-adjacent, check no jump |

---

### Factor 5 — Funding = ray-deviation INPUT (not the rate yet) · `fundingPerStrike`, checks `FS.2b/FE` · **PORT**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `fundingPerStrike(...)`; killer check `FS.2b` (zero on balanced) | Old funding charged even on a perfectly balanced pool (bug). Fixed to the **curve skew**: slope of the live curve at the strike → where the balanced curve has that same slope → deviation of the two ray angles. Ships the **input only**, not the rate/cash yet. | `dev = |c·ln(K/mode)|`, `c = (g_anchor − g)/(g_anchor + 1)`, `g = m·γ` (pool), `g_anchor = m` (balanced). **Zero** on balanced pool, at ATM, and ITM. Label **"Funding (ray dev; TBD)"** | skewed pool (w≠½): small OTM lobe; balanced pool: 0 at every strike |

| | Current (14-Jun) | Desired (8-Jul) | **Staging now** |
|---|---|---|---|
| funding | non-zero even on a **balanced** pool (bug) | ray-deviation; **0** on balanced / ATM / ITM | at m=1 the coefficient `c=(1−1)/2 = 0` → deviation **identically 0**, so balanced=0 is trivially true → formula **UNVERIFIED**. **Verify:** after γ=2 **and** a skewed pool |

---

### Factor 6 — Plain spot trade (must stay UNCHANGED) · `tradeUpdate`, check `CM8-v2.1`
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `tradeUpdate`, `arbitrageToOracle`, `rebase` — **byte-identical to v24** | Ordinary at-the-money trades work exactly as before; the new items only change off-center / option behavior. | `tradeUpdate` = `tradeUpdateAt(·,dy,ρ=1)`; conserves global α=x·w, β=y·(1−w) | our 4 bands all reproduced this to ≤1.8e-15 |

| | Current (14-Jun) | Desired (8-Jul) | **Staging now** |
|---|---|---|---|
| spot law | v24 spot law | v24 spot law (unchanged) | **matches reference exactly** (≤1.8e-15) ✅ |

---

### Factor 7 — Vocabulary (UI + labels) · `vocab_gate.sh`
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| user-visible strings; `vocab_gate.sh` | Use the endorsed terms; never "lean". | — | funding column reads **"Funding (ray dev; TBD)"**; the skew is **"ray deviation / curve skew"** |

| | Current (14-Jun) | Desired (8-Jul) | **Staging now** |
|---|---|---|---|
| terms | mixed | "ray deviation / curve skew" | no "lean" seen in API; portfolio funding column exists ✅ |

---

### Factor 8 — Acceptance harness (the real sign-off) · `lens_selfcheck.js` (41) + `a16_atm_gate.js` (5)
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `lens_selfcheck.js`, `a16_atm_gate.js` | Every number above is asserted here; each check fails loudly if wrong. Run it against your **Go** engine — that's the only way to cover code paths (we can only see API outputs). | 41 + 5 checks | we reproduced **41/41 + 5/5** against `5ce1a76c` = your pass bar |

---

### Factor 9 — ⚠ Safety: round-trip drift + update-2 · `closeBand`, check `CM6-v3`
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `closeBand` residual; `CM6-v3`; spec `FIX_close_b_receipt_charge_PARKED` | The new close leaves the pool a tiny bit short after open→close. **Non-extractable** (trader only ever gets the option value, never the pool's reserves). LPs bear it in a shared pool. | shortfall `∝ trade-size²`; recovers like impermanent loss | a few $ on a normal trade |

| | Current (14-Jun) | Desired (8-Jul) | **Staging now** |
|---|---|---|---|
| shared pool | (two-case) | tiny drift — **hold multi-party pool until update-2** | not tested at γ=2; single-user harmless |

---

## The one-line version
**Set γ=2 first**, then port Factors 1–5 (ITM prices, trade-point warp, m-knob, one-rule close, ray-deviation
funding), keep Factor 6 (spot law) byte-identical, pass Factor 8 (41+5 harness) against your Go engine, and
hold the shared pool until update-2 (Factor 9). Staging is already the right engine and its spot math +
pricing check out at γ=1; Factors 1/2/4/5 only become visible — and verifiable — once γ>1.

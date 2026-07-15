# Model notes — `temporal_lp_economics_MODEL_v2_levered.xlsx` (BRAINSTORM, non-core)

Supersedes v1 by adding **LP leverage** (operator entry 486). Git-diffable mirror of the xlsx logic.

## What v2 adds
Leverage acts **only on the Temporal AMM position**; the HLP layer stays **additive at margin level,
un-levered** (operator's instruction).

```
Temporal_net      = fee_bps/10000·turnover·days + funding_APR − (sigma²/8)·(1−protection) − drain·turnover
Levered_Temporal  = LP_leverage·Temporal_net − (LP_leverage−1)·borrow_APR
HLP_layer         = HLP_base_APR·(1 − HLP_tail_haircut·sigma)          [un-levered]
BASE  (dollar margin) net APR = Levered_Temporal
RESTAKED (HLP margin) net APR = Levered_Temporal + HLP_layer
```

## New editable assumptions
| input | default | note |
|---|---|---|
| LP_leverage | 2.0 | leverage on the Temporal position (equity ×L exposure). NOT applied to HLP. |
| borrow_APR | 6% | cost of the borrowed (L−1) leg |

## Independently verified (Python, defaults L=2, borrow=6%) — LEVERED BASE net APR
rows = sigma, cols = turnover [0.25, 0.5, 1.0, 2.0, 5.0]/day
```
 s=0.20:   8.4%   17.2%   35.0%   70.5%  177.0%
 s=0.40:   6.9%   15.7%   33.5%   69.0%  175.5%
 s=0.60:   4.4%   13.2%   31.0%   66.5%  173.0%
 s=0.90:  −1.3%    7.6%   25.4%   60.9%  167.4%
 s=1.20:  −9.1%   −0.2%   17.5%   53.0%  159.5%
```
Scenario turnover=1, σ=0.6: Temporal_net 18.5% → levered 31.0% → restaked 41.0%.

## The two honest edges leverage exposes
1. **Leverage cuts both ways:** it amplifies the losing corner (−9.1% at σ=1.2, low turnover vs −1.6%
   unlevered). If `Temporal_net < borrow_APR`, leverage makes the LP *worse* (fee=0 test: +0.25% → −5.5%).
2. **Liquidation risk not modeled:** a levered LVR loss exceeding ~1/leverage of equity wipes the position
   in a high-vol move. v2 is a yield model only; liquidation is a disclosed caveat, not simulated.

## Honesty labels (unchanged from v1)
`funding_APR` and `protection_factor` are unproven placeholders; `LVR = σ²/8` is the CPMM baseline;
reduced-form sketch, not a backtest. Promote out of `sims/` only on the operator's say-so.

---

## AUDIT OUTCOME (auditor = skeptic on Opus, 2026-07-08) + fixes applied
**Arithmetic: clean** — auditor re-derived the full grid/scenario/fee=0 test independently; all match.
Flags were on economic content, and are now addressed:

| flag | fix applied |
|---|---|
| **Double-count:** `protection_factor` (LVR removed by warp+funding tether) overlaps `funding_APR` (funding as income) → same benefit twice | **`protection_factor` DEFAULT changed 0.5 → 0** (no assumed LVR reduction); note now says warp-only, don't also attribute the funding tether here |
| **Funding one-sided:** hard-coded as strictly positive income | note now discloses `funding_APR` **can be negative** (LP on the paying side) |
| **Optimistic defaults:** green headline grid was the hypothesis-on case | defaults now **conservative** (protection=0); READ_ME carries an AUDITED caveat; raise protection/funding to see hypothesis-on |
| **Break-even framing:** boundary is levered-zero, ignores opportunity cost | grid note clarified: levered break-even (Temporal_net vs borrow), opportunity cost ignored |
| Leverage / liquidation pairing (NIT) | already noted; liquidation not modeled (disclosed) |

**Auditor bottom line:** SOUND-ENOUGH-FOR-BRAINSTORM; must not leave `sims/` read as proof LPs are
net-positive — with defaults now conservative, the green reflects fees + the (editable) hypotheses, not
a claimed mechanism. Conservative-default check: levered base @turnover=1, σ=0.6 = **+26.5%** (fees carry it);
@turnover=0.25, σ=1.2 = **−27.1%** (leverage × full LVR wipes the LP in the bad corner — the honest picture).

---

## DELTA-HEDGE (operator entry 487 — band hedging schedule)
Question: does the model account for the LP being delta-hedged (hedge assumed ~fee-neutral)?
**Answer: yes, implicitly — now made explicit.**
- **LVR = σ²/8 IS the delta-hedged LP's residual loss** (standard result, Milionis–Moallemi–Roughgarden):
  delta-hedging removes price-DIRECTION P&L but not LVR (you still rebalance at stale pool prices). The
  model has no directional term and carries −LVR, so it already represents a delta-hedged LP.
- **Fee-neutral hedge** (some maker, some taker ≈ net 0): captured by `hedge_fee_cost` (default 0). Numbers
  unchanged vs pre-hedge (verified: 26.5% / −27.1% at the two check cells).
- **New channel made explicit:** `hedge_funding_APR` — funding earned(+)/paid(−) on the HL hedge legs
  themselves (separate from LVR, either sign). Default 0. Sensitivity: +2% hedge funding → +4% levered net.
- **Caveat (unproven):** that Temporal's specific band-hedge schedule achieves clean delta-neutrality with
  LVR as the exact residual, plus discrete-rebalance tracking error, are assumptions — not validated here.

---

## SIMPLIFYING ASSUMPTIONS — to be addressed in FURTHER WORK (operator entry 488)
For simplicity, several channels are assumed neutral/off in this brainstorm sketch:
1. **Hedge-leg funding = neutral** (`hedge_funding_APR = 0`) — real HL hedge funding is ± and unmodeled.
2. **Delta hedge clean & fee-neutral** — no tracking error / discrete-rebalance slippage; `hedge_fee_cost = 0`.
3. `funding_APR` = placeholder for the undecided update-2 funding formula.
4. `protection_factor = 0` (no assumed warp LVR-reduction; unproven if raised).
5. `LVR = σ²/8` = 50/50 CPMM baseline; Temporal is warped ⇒ approximation.
6. Liquidation of the levered leg not modeled.
7. HLP additive; tail-correlation off at default.
8. Reduced-form annualized sketch, not a path-dependent backtest.
**Further work:** realistic HL hedge-leg funding; tracking error & discrete rebalancing; derive funding
from the update-2 formula; validate `protection_factor`; liquidation + HLP tail-correlation; Monte-Carlo.

---

## HOW THE VOLATILITY COST IS MODELED (operator entry 489)
- **Volatility cost = LVR = σ²/8 per year** — the standard 50/50 CPMM/Balancer result: arbitrageurs pick
  off the pool as the price moves; it scales with σ². This is what the sim uses.
- **The curve-shape knob `m` does NOT lower it in the current design.** Per the locked architecture the
  underlying POOL that arbitrageurs trade is **plain Balancer** (the SPOT trio is byte-identical to v24);
  `m` is a forward READ lens on pricing/option-value/settlement, not a change to the traded pool. LVR comes
  from that underlying pool, so the vol cost is the standard AMM cost.
- `protection_factor` (default **0**, off) is a placeholder for any warp effect on LVR and is **unproven**;
  the auditor flagged that a read-lens cannot reduce a pool-level adversarial cost — hence off by default.
- **To make the curve shape actually change the vol cost, the POOL curve/invariant must change** (operator-
  tier; not in this design). A true `m`-dependent LVR derivation is **further work**.

---

## ⚠ FAITHFULNESS GAP (operator entry 490) — this sim is a PROXY, not the actual perp-options AMM
Operator: "it's a perp options amm... not spot balancer — is the sim faithful to the actual thing?" **No.**
- This is a **generic spot-AMM-LP** model. A perp-options AMM LP is an **option SELLER**: it earns **option
  PREMIUM** (at implied vol) + funding + fees, and its **vol cost = the GAMMA bleed of the option book**
  ≈ ½·Γ·σ²·S², where Γ is set by the **curve shape (γ, m)** and the open option notional — **not** `σ²/8`.
- So `m` **does** drive the vol cost (it sets the book's gamma). My earlier "m is just a read lens, vol cost
  unchanged" was the mechanical spot-Balancer view, not the LP's economic exposure — **corrected**.
- Right: the `σ²` scaling. Wrong/missing: the `1/8` coefficient (plain-pool artifact), an explicit **premium
  income** line, and the **γ/m/notional** dependence of the gamma cost.
- **Faithful rebuild (pending operator go):** premium(IV) − realized gamma cost(RV, from the actual γ/m curve)
  + funding + fees − hedge; LP = option seller; pull the real option-value curve from the engine read-only.

**Clarification (operator entry 491):** the faithfulness gap is **orthogonal to the shape/steepness knob.**
The core issue is structural: a perp-options AMM LP **sells options** → its economics are **premium income
− a short-gamma (options) vol cost** + funding + fees − hedge; the sim used a spot proxy (`σ²/8` + generic
fees, no premium). The γ/m dependence of the gamma coefficient is a secondary detail, not the point.

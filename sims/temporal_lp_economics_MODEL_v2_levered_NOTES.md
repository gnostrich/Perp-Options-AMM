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

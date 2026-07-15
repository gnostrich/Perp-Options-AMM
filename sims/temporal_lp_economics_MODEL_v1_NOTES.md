# Model notes — `temporal_lp_economics_MODEL_v1.xlsx` (BRAINSTORM, non-core)

A git-diffable mirror of the spreadsheet's logic (the .xlsx is binary). Operator ask (entry 485):
"assuming its a spreadsheet, make editable, transparently disclosed and editable assumptions."

## The spreadsheet (4 sheets)
- **READ_ME** — purpose + the model, in words.
- **Assumptions** — every input in a YELLOW editable cell + a disclosure note. Edit these; all else recomputes.
- **Regime_Grid** — two heatmaps (BASE and RESTAKED LP net APR) over `turnover × sigma`; green = LP profits, red = loses. The green/red boundary is the **break-even line**.
- **Scenario_calc** — pick one turnover + one sigma, see the full component breakdown.

Open in Excel / Google Sheets / LibreOffice (they recalc on open). Nothing here touches the engine.

## The model (fully disclosed; per $ of pool notional, annualized)
```
Fee income   = fee_bps/10000 · daily_turnover · days_per_year
Funding      = funding_APR                         [PLACEHOLDER for the update-2 funding formula]
LVR cost     = (sigma^2 / 8) · (1 − protection_factor)   [sigma^2/8 = classic 50/50 CPMM LVR]
Drain cost   = drain_coeff · daily_turnover        [small IL-like open→close pool drift]
BASE net APR = Fee + Funding − LVR − Drain
RESTAKED     = BASE + HLP_base_APR · (1 − HLP_tail_haircut · sigma)
```

## Editable assumptions (defaults)
| input | default | note |
|---|---|---|
| days_per_year | 365 | annualization |
| fee_bps | 5 | taker fee; **set 0 if Temporal charges no fee (TBD)** |
| funding_APR | 3% | **stand-in** for the update-2 funding formula — the main edge vs a vanilla AMM |
| protection_factor | 0.50 | fraction of LVR removed by warp+funding tether — **HYPOTHESIS** |
| drain_coeff | 0.5% | round-trip drain, APR per 1.0 daily turnover |
| HLP_base_APR | 10% | yield on HLP margin (external input) |
| HLP_tail_haircut | 0.0 | 0 = pure additive; >0 = HLP & Temporal lose together in crashes |

## Independently verified (Python, default assumptions) — BASE net APR
rows = sigma, cols = turnover [0.25, 0.5, 1.0, 2.0, 5.0]/day
```
 s=0.20:   7.2%   11.6%   20.5%   38.2%   91.5%
 s=0.40:   6.4%   10.9%   19.7%   37.5%   90.8%
 s=0.60:   5.2%    9.6%   18.5%   36.2%   89.5%
 s=0.90:   2.4%    6.8%   15.7%   33.4%   86.7%
 s=1.20:  −1.6%    2.9%   11.8%   29.5%   82.8%
```
Only red cell at defaults: high vol (σ=1.2) + lowest turnover — the break-even edge.

## The honest tension the sheet is built to expose
With **fee_bps = 0** (no fee, all edge from funding), base @ turnover=1, σ=0.6 = **+0.25%** — razor-thin,
and negative at higher σ. That is the real "does funding beat LVR?" question. Fees make LPs comfortably
positive; whether Temporal charges one is a TBD, so it is an editable input, not baked in.

## Honesty labels
Reduced-form sketch for intuition, **not a validated backtest**. `funding_APR` and `protection_factor`
are unproven placeholders. `LVR = σ²/8` is the CPMM baseline; Temporal is warped, so `protection_factor`
absorbs the (unproven) difference. Promote out of `sims/` only on the operator's say-so.

## Open (for when this becomes real)
Provisional funding-rate law (update-2); whether to drive the actual engine read-only vs reduced-form;
HLP tail-correlation calibration; real fee/spread policy.

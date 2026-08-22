# Model notes — `temporal_lp_economics_MODEL_v3_options_seller.xlsx` (FAITHFUL, BRAINSTORM, non-core)

The faithful perp-options-AMM LP model (operator entry 492 go). Supersedes the v2 SPOT proxy for economics;
v2 retained for reference. Git-diffable mirror of the xlsx logic.

## The structure (why it's faithful now)
The LP **sells the option book** (the bands) and delta-hedges on Hyperliquid ⇒ it is a **short-vol /
short-gamma** position. It collects premium priced at **implied** vol and pays the **realized**-vol gamma
cost. So its options edge is the **variance risk premium**:
```
G   = gamma*(gamma+1)/2                    # option-book gamma factor of the value∝S^(-gamma) curve
VRP = book * G * (IV^2 - RV^2)             # + when IV>RV (sell rich), - in a vol spike (RV>>IV)
BASE net = VRP + fee_bps/10000*turnover*days*book + book*funding_APR
           - (book-1)*borrow_APR - hedge_fee_cost + book*hedge_funding_APR
RESTAKED = BASE + HLP_base_APR*(1 - HLP_tail_haircut*RV)
```
No `σ²/8`, and premium is now explicit. Delta is hedged (no direction term); hedge fee-neutral by default.

## Independently verified — BASE net APR, rows=RV, cols=IV (γ=2 ⇒ G=3, book=1, turnover=1, fee=5bps)
```
        IV: 30%    50%    70%    90%   110%
 RV=20%     33%    81%   153%   249%   369%
 RV=40%     -3%    45%   117%   213%   333%
 RV=60%    -63%   -15%    57%   153%   273%
 RV=80%   -147%   -99%   -27%    69%   189%
 RV=100%  -255%  -207%  -135%   -39%    81%
```
Green upper-right (IV>RV, LP sells vol rich); red lower-left (RV>IV, vol spike wipes the short-vol LP).
Scenario RV=60%,IV=70%: base = **+57%**.

## LOAD-BEARING CAVEAT (what an audit must attack)
- **The coefficient/normalization is the uncertain part.** `G=γ(γ+1)/2` is the power-option gamma factor;
  `book` = option VALUE short per $ equity. The magnitudes scale directly with `G*book` and are
  **ILLUSTRATIVE** — they need calibration against the real book (open interest, strike mix, actual IV).
- Assumes IV = the AMM's calibration vol, one representative γ, a uniform book, and a continuous fee-neutral
  delta hedge. funding_APR (ray-deviation) and hedge funding default 0.
- Reduced-form annualized sketch, NOT a path-dependent backtest. NON-CORE (sims/). **Not yet auditor-checked.**

## The headline answer (to "how does an options AMM LP make money")
It **harvests the variance risk premium**: sells options at implied vol above realized vol, delta-hedged.
It profits when IV>RV (the usual case) + funding + fees; it loses in vol spikes (RV>>IV) — a short-vol
risk profile, fundamentally different from the spot-AMM "fees − LVR."

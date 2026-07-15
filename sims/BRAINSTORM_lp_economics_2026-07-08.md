# BRAINSTORM — Temporal LP economics simulation (NON-CORE, unreviewed)

**Status:** BRAINSTORM ONLY. No engine/spec/gate impact. No skeptic pass yet. Not a decision.
**Source:** operator + **varun verma** (external) WhatsApp, 2026-07-08 (screenshot in session upload).
**Scope confirmed in that thread:** the **PROTECTED PERPS AMM (Temporal)**, *not* the CLOB-AMM.

## The question (varun verma, from the screenshot — paraphrased, his words in quotes)
> "AMMs are grossly lossmaking. so how is this one going to make [money]"
> "simulation on different regimes: how does the base amm lp perform. how does the restaked lp perform."

I.e. build a simulation that shows **LP yield** for Temporal LPs across market regimes, and answers the
standard LVR objection (AMM LPs lose to arbitrageurs) — where does Temporal's LP edge come from.

## Goal of the sim
LP net yield (APR, per $ of pool notional) as a function of:
1. **turnover** = trading volume per $ of pool notional (per unit time), and
2. **volatility regime** (σ: low / med / high).
Two LP variants to compare:
- **base AMM LP** (dollar-margined),
- **restaked LP** (HLP-margined — the additive layer below).

## LP P&L decomposition (the model to build)
`LP net yield = revenue − cost` per unit time, per $ notional.

**Revenue (where Temporal earns):**
- **Funding accrual** — the ray-deviation → HL-style funding rate (rate law is TBD/update-2). The
  crowded side pays; net-to-LP depends on how persistently the pool sits skewed. *This is the
  candidate answer to "how does it make money" — funding is income the vanilla CPMM doesn't have.*
- **Fee / spread capture** on trades (if a spread is charged on the warp) — scales with turnover.
- **Curve-warp capture** at the trade point.

**Cost (the "grossly lossmaking" part):**
- **LVR / adverse selection** — arbitrageurs pick off the stale curve on oracle moves; classic AMM
  loss, scales ~σ². This is the term the objection is about.
- **Round-trip pool drain** — the documented ~trade²  IL-like shortfall on open→close (bounded,
  non-extractable; recovers on mean-reversion). Measured ~$29–53 at exhibit sizes.
- **Inventory / directional exposure.**

**Protection effect (the hypothesis to test):** the kurtosis knob `m` + the funding *tether* +
American smooth-pasting reshape LP exposure vs a vanilla CPMM. **Hypothesis:** funding income +
the warp convert part of what would be LVR into LP revenue, so Temporal LP break-even turnover is
*lower* than a vanilla AMM at the same σ. TO BE TESTED, not asserted.

## Regime sweep (the deliverable shape)
2-D grid: `turnover ∈ {low, med, high} × σ ∈ {low, med, high}` → LP-APR heatmap, base vs restaked.
Key output: the **break-even line** where `funding + fees ≥ LVR + drain` — the turnover needed at each
σ for LPs to be net-positive. That line is the answer to varun's question.

## The HLP-margin layer (operator: "simple additive layer")
Instead of dollar collateral, the LP posts **HLP (Hyperliquid LP token)** as margin. First-cut model:
```
restaked_LP_yield  =  temporal_amm_LP_yield  +  HLP_base_APR   (on the margined notional)
```
Additive because the HLP position earns its own yield independently of the Temporal AMM P&L.
**Caveats to check (don't assume clean additivity):**
- **Correlation in the tails:** HLP drawdowns and Temporal LVR both spike in high-σ → the two legs
  are not fully independent when it matters most; additive may overstate high-σ yield.
- **Liquidation / haircut interaction:** HLP as margin has its own mark/haircut; a HLP drawdown could
  force deleveraging of the Temporal LP position.
- **Double-counting funding** if HLP's yield already embeds funding from the same flow.

## Parameters to pin (all placeholders for now)
- provisional **funding rate law** (real one is TBD update-2) — the sim needs a stand-in rate.
- fee / spread bps (if any).
- **LVR model:** σ, oracle process (GBM?), arb cadence.
- **drain coefficient** (~$ per trade²; ~$29–53 at exhibit N).
- **HLP base APR** (external input — historical HLP yield).

## Build plan (future, NOT started)
A standalone Monte-Carlo + closed-form sim living entirely in `sims/` (its own code; may read engine
numbers read-only). Reduced-form first (analytic LVR vs funding), then MC for path-dependence.

## Open questions → operator
1. Provisional funding rate law to use in the sim (since the real one is update-2)?
2. Reduced-form model vs. driving the actual engine read-only?
3. HLP additive vs. tail-correlated — which assumption for v1?
4. Fee/spread: does Temporal charge one, or is all LP revenue funding + warp?

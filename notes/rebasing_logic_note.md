# Rebasing Logic for the Warp AMM

*Note for incorporation into the paper. Captures the role and mechanics of the continual rebase to spot oracle, and its relationship to the broader centering machinery.*

---

## 1. Purpose: Frame-Keeping, Not Repricing

The continual rebase is a *frame-keeping* mechanism, not a price-discovery mechanism. Its role is to keep the AMM's internal coordinate system aligned with the live asset value, so that the curve's geometric center coincides with the economic equilibrium *as the oracle travels*.

Without continual rebase, oracle drift accumulates as positional drift of the reserves on the curve. Over time, the slope-$-1$ point of the pool curve decouples from the dollar-parity point. Activity migrates toward a corner of the chart, and the slippage profile becomes systematically asymmetric in a direction that depends on the sign of cumulative oracle drift. With continual rebase, the slope-$-1$ point and the dollar-parity point coincide at all times, and slippage is symmetric *as a function of $w$'s deviation from $0.5$*, independent of oracle trajectory.

The rebase is therefore a unit-of-account transformation applied to one leg of the AMM, not an economic event. It does not trigger funding, does not change shape ($w$), and does not affect the trader's real-asset exposure.

## 2. The Two-Layer Numéraire Architecture

The protocol operates in two cleanly separated layers:

**Trader-facing layer.** Collateral, exposure, payoffs, and settlement are all in real asset units. Trader-visible dollar strikes $K = \theta \cdot s_{\text{oracle}}$ slide with the oracle while the underlying ray angle $\theta$ (the AMM-native strike parameter) remains fixed. The trader never observes $x$.

**AMM-internal layer.** The reserve $x$ is rebased so that one unit of $x$ corresponds to one unit of real asset *in current value terms* at any instant. This is an internal abstraction used solely for pricing geometry and curve mechanics. The cash leg $y$ is in stable units (cash) and is not rebased.

Settlement is in the underlying asset, not in dollars. Dollar denomination is one possible numéraire among many; the protocol is asset-native. The rebase is purely bookkeeping; payoffs are economic.

## 3. Mechanics

Let $r = s_{\text{new}} / s_{\text{old}}$ be the multiplicative oracle change between two instants. The rebase action on pool state is:

$$
x \to r \cdot x, \qquad y \to y, \qquad w \to w.
$$

The invariant $x^w y^{1-w} = k$ transforms as

$$
k \to r^w \cdot k.
$$

The quantity-stop conservation constants

$$
\alpha \equiv w \cdot x, \qquad \beta \equiv (1-w) \cdot y
$$

transform as

$$
\alpha \to r \cdot \alpha, \qquad \beta \to \beta.
$$

The marginal price at the reserves point, $|dy/dx| = w y / ((1-w) x)$, scales as $1/r$ — reflecting the new unit of account for $x$.

## 4. Conservation Across Trades vs Rebases

The quantity-stop rule states that $\alpha$ and $\beta$ are individually conserved under trade dynamics. This holds *between rebases*, not across them. A trade is a movement of the reserves point along the curve (with corresponding evolution of $w$, $x$, $y$) under which $\alpha$ and $\beta$ are invariant. A rebase is not a trade — it is an external re-marking of the unit of account for $x$, under which $\alpha$ rescales by $r$ while $\beta$ stays put.

The asymmetric rescaling reflects the asymmetric volatility of the two legs in the trader's numéraire: the asset side is dollar-volatile (rescales with oracle), the cash side is dollar-stable (invariant). Conservation laws apply within an epoch of constant frame; rebases delimit those epochs.

This is the cleanest statement of why $\alpha$ and $\beta$ should not be interpreted as deployment commitments. They are constants of motion of trade dynamics in the current frame. Deployment fixes initial values; rebases update one of them; trades preserve both.

## 5. Decoupled Centering Mechanisms

The pool is "centered" in two distinct senses, addressed by two distinct mechanisms:

**Positional centering — rebase plus continuous arbitrage.** Continual rebase keeps $x$ in live asset-value units. Continuous arbitrage keeps the AMM's marginal price equal to the oracle. Together these pull the reserves point $(x, y)$ toward the $45°$ point on the pool curve (where $|dy/dx| = 1$, equivalently dollar parity between asset and cash legs).

**Shape symmetry — funding.** Funding is keyed to the curve's shape parameter $w$. Asymmetric $w$ corresponds to directional demand imbalance (calls vs puts) and is penalized by a funding rate proportional (in form) to $|w - 0.5|$. Arbitrageurs respond to attractive funding by taking offsetting positions, which shift $w$ back toward $0.5$.

These mechanisms are decoupled by responsibility: rebase does not fix shape; funding does not fix position. Both are needed. Neither subsumes the other.

| Mechanism      | Targets             | Drives                       |
|----------------|---------------------|------------------------------|
| Rebase         | Numéraire (units of $x$) | $x \to$ current asset-value units |
| Arbitrage      | Marginal price      | reserves $\to$ $45°$ point (current frame)         |
| Funding        | Shape ($w$)         | $w \to 0.5$ (symmetric curve)                       |

## 6. Loop Closure

The full equilibration sequence following an oracle move:

1. **Rebase.** Oracle moves by factor $r$. Internal $x$ updates: $x \to r x$. Reserves point slides in $x$-direction; $w$ unchanged. $\alpha$ updates by $r$; $\beta$ invariant. Funding is silent (no shape change).

2. **Arbitrage on marginal price.** Post-rebase, marginal price no longer matches oracle. Arbitrageurs trade against the pool until $|dy/dx|$ equals oracle parity. This is a trade — $\alpha$ and $\beta$ are conserved through it. The post-arb point is generally not at $w = 0.5$ exactly, because the rebase has shifted the conservation ratio $\alpha/\beta$.

3. **Funding response to residual shape asymmetry.** If $w \neq 0.5$ post-arb, funding incentives draw further trade activity that pushes $w$ back toward $0.5$.

4. **Steady state.** Under continual oracle update with continuous arb and funding response, the system tracks an equilibrium at $(k, k)$, $w = 0.5$, marginal price equal to oracle parity, all in the current frame.

In practice all four operations happen continuously and concurrently; the discrete sequence is a pedagogical decomposition.

## 7. Anchor Curve in the Traveling Frame

The anchor curve is the $w = 0.5$ reference curve at *current* depth $k$. It represents "what a symmetric pool would look like in the current asset-value frame." It travels with the oracle: under rebase, the anchor's $k$ rescales to $r^w \cdot k$, so the anchor's geometry dilates together with the pool.

The anchor is therefore *centered in the traveling frame*, not in an absolute deployment frame. This is the correct notion: a fixed-deployment anchor would drift relative to live asset value and become economically meaningless over long oracle moves. The traveling anchor remains the right reference for "balanced" at every instant.

In the canonical balanced state ($w = 0.5$, pool at $45°$ point), the pool curve and anchor curve coincide. Any departure visualizes either positional drift (pre-arb, reserves off $45°$) or shape asymmetry (post-trade, curves of different shape sharing the same $k$).

## 8. Connection to the Singular-Pool Thesis

The rebase is one of the three scalars that make the singular-pool design work. From the AfT abstract framing:

- **One shared pool**: a single $(x, y)$ state hosts the entire OTM strike continuum for calls and puts.
- **One moving weight**: $w$ encodes the directional skew; trades shift $w$ rather than reserves point along a static curve.
- **One scalar repricing the book**: in the original framing, this is the ATM ratio shift. The rebase complements this by ensuring the ATM ratio itself is measured in a frame that stays calibrated to live asset value. Without the rebase, the "one scalar repricing the book" claim would silently include accumulated oracle drift, making the scalar's economic interpretation drift-dependent.

The rebase is what lets the $w$ parameter remain a *pure* shape parameter — uncontaminated by accumulated oracle drift — and lets the singular pool stay singular over arbitrary horizons.

## 9. Summary

The continual rebase to spot oracle is a frame-keeping operation that transforms one leg of the AMM's coordinate system to track live asset value. It is decoupled from trade dynamics (does not alter $w$, does not invoke funding) and operates as an external unit-of-account transformation. Conservation of $\alpha$ and $\beta$ applies within epochs delimited by rebases. Centering the pool involves three orthogonal mechanisms — rebase for numéraire, arbitrage for marginal price, funding for shape — each addressing a distinct degree of freedom. The anchor reference travels with the oracle and remains the live "balanced" reference for the pool in current asset-value units. Settlement and trader-facing exposure are in real asset terms; the rebased $x$ is internal bookkeeping only.

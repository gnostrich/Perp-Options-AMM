# Singular Dynamic AMM Pricing Perpetual Options Across the Strike Continuum

## Abstract

Perpetual options allow perpetual futures traders to manage liquidation risk. However, the market mechanisms used by existing trading venues are complex, and liquidity is fragmented across strikes.

We show that the entire out-of-the-money (OTM) strike continuum, for both calls and puts, can be priced in closed form by a single liquidity pool, using the weighted constant-product invariant `(x^w)·(y^(1−w)) = k` with one dynamic weight `w`. Positions are barrier instruments; a position composed with the perpetual future it is opened against caps the trader's drawdown without forcing position closure, and settlement is denominated in units of that perpetual future.

## Perpetual Options

### Definition

Perpetual options are non-expiring contracts-for-difference, representing the payout from favourable price action — upward for calls, downward for puts — of an underlying asset relative to a denominating asset (here, USD) beyond a given strike price. The instruments priced here are *barrier* options: a position's value is bounded, topping out at one unit of the underlying perpetual future when the position is in-the-money, and remaining at that ceiling as the position moves further in-the-money. A position is terminated when its holder closes it.

### Utility

Liquidation in a perpetual future is the involuntary termination of a leveraged position when collateral is exhausted. Composing a perpetual future with an OTM perpetual option on the same underlying — a call to hedge a short, a put to hedge a long — caps realized loss past the strike, bounding the trader's drawdown without forcing position closure. Because the option position does not expire, the hedge persists for as long as the underlying perp is held.

### Pricing

For an OTM strike, the value of a position is given by its **mark**: the ratio of the strike ray's slope to the underlying's spot price, taken as the lesser of that ratio and its reciprocal,

    mark = min( slope, 1/slope )

so that the mark is a dimensionless quantity bounded in `(0, 1]`. Intuitively, the mark is the *fraction of a full perpetual future* that the position is worth: it approaches `1` as the position nears the money and decays toward `0` deep out-of-the-money. The value of a position of size `q` at a strike is `q · mark`.

This pricing carries no separate premium object. The mark is the complete description of what a position is worth; there is no extrinsic-versus-intrinsic decomposition and no premium term layered on top. Throughout this paper, "the value of a position" means `q · mark`, and nothing else.

## AMM Intuition

We make two generalisations to the constant-function AMM `(x^w)·(y^(1−w)) = k`, giving it the expressivity to price perpetual options across the strike continuum.

***"Trades skew the AMM curve instead of moving the reserves point along it."***

A two-asset constant-function AMM (CFMM) can be visualised as a curve in the `(x, y)` plane, along which the reserves `(x, y)` are a single point. Price is the slope at that point, and a trade moves the reserves point along the curve.

Two curves are in play, and it is worth naming both at the outset. The first is the **Balancer curve** `(x^w)·(y^(1−w)) = k`, whose *shape* is set by the weight `w`; this is the curve that skews. The second is the **trajectory hyperbola** `(x−α)·(y−β) = αβ`, the locus along which the reserves point actually moves (derived in AMM Mechanics). The two are tangent at the reserves point — they share a slope there — which is why pricing read off the Balancer curve is faithful, and why "reshaping the curve" and "moving along the trajectory" describe the same event from two angles.

The Balancer curve gives a family of shapes indexed by `w`. Rather than updating the pool's quoted prices by moving the reserves point along a fixed curve, we obtain the same effect by changing the *shape* of the Balancer curve via `w`. For a small trade, if the reserves point were to move along the curve, we note the slope at the post-trade point; then, instead of moving the reserves point, we reshape the curve — by updating `x`, `y`, and `w` — so that the slope of that post-trade point is brought to the pre-trade reserves point. The AMM Mechanics section makes this precise.

***"Trades happen anywhere on the curve, not just at a single point."***

In traditional CFMMs, trades are spot swaps, always occurring *at* the reserves point on the curve. We treat spot swaps as a special case of perpetual-option swaps, which may occur at *any* point on the curve, subject to that point being out-of-the-money. A transaction at any *trade point* on the curve is treated as if that trade point were the reserves point.

## Translating Perpetual Options Into AMM Swap Transactions

Here we establish the conventions that let us translate perpetual-option transactions into the language of the AMM.

### Mapping Strikes to Ray Angles

Each ray from the origin in the `(x, y)` plane is parameterised by its angle — equivalently, by the constant ratio `y/x` along the ray. We identify each ray with a unique perpetual-option strike. A ray intersects the AMM curve at exactly one point; that intersection is the *trade point* for the strike.

### Anchor Curve as Strike Reference

The anchor curve is the AMM curve at the designated reference state. Strikes are identified with rays via their intersection with the anchor curve — the anchor picks out one strike per ray. As trades reshape the live curve via `w`, trade points shift along each ray, but the strike-to-ray identification is preserved against the anchor.

### The 45° Ray Represents Spot

By convention, the 45° ray (`y = x`) corresponds to the at-the-money strike. The anchor curve is normalised so that its 45° intersection sits at unity (see Strike Normalisation). Rays on either side of 45° parametrise the OTM continuum.

### Calls and Puts on Opposite Wings

Rays steeper than 45° and rays shallower than 45° partition the OTM continuum into two wings — one carrying calls (above-spot), the other puts (below-spot). The pool prices both wings from the same `(x, y, w)` state; no liquidity is partitioned between them.

### Barrier as the Trade Primitive

The primitive transaction is a *barrier*: a position at a single strike ray, valued at `q · mark`. A *spread* — a position bounded between an inner and an outer strike — is a composition of barrier primitives, and a *band* is a composition of legs across both wings. The composite-ray construction by which spreads and bands reduce to single-swap transactions is given in the Annexures; for the body it suffices that every position is built from the barrier primitive.

## AMM Mechanics

The AMM accounts for every transaction as a swap of cash against the underlying at a trade point.

### Conservation Law

For each trade, the quantities `x·w` and `y·(1−w)` are individually conserved. Denote `α = x·w` and `β = y·(1−w)`. The pool state is therefore fully determined by `(x, y)`; the weight `w` is a derived field, `w = α/x` (equivalently `1−w = β/y`), recovered from the conserved quantities at any time. No additional state storage is required.

Together with the constraint `w + (1−w) = 1`, the conservation law confines all reachable states to the hyperbola `(x−α)·(y−β) = αβ` (see Annexures).

### Trade Formula

Parametrising a swap by its cash leg `Δy` — the cash into the pool, negative if cash flows out — the global state updates along the conservation hyperbola `(x−α)·(y−β) = αβ`:

    y' = y + Δy
    Δx = − αβ · Δy / [ (y − β)·(y' − β) ]
    Δw = β · Δy / [ y · y' ]

The post-trade state is `(x', y', w') = (x + Δx, y + Δy, w + Δw)`, with `α = x'·w'` and `β = y'·(1−w')` preserved by construction.

The third update, `Δw`, is not an independent equation. Since `w = α/x` and `α` is conserved, `Δw` is fully determined by `Δx`; the expression above is the algebraic simplification of `Δw = α/x′ − α/x`. It is written out because the weight `w` is the quantity the pool's pricing actually moves, and the reader is owed an explicit sight of its update.

The direction of the cash leg is not free. For a transaction at a given strike, whether cash flows into or out of the pool is fixed jointly by the wing and the side: buying a call and selling a put draw cash out of the pool; selling a call and buying a put pay cash in. Writing the wing factor as `+1` for a call and `−1` for a put, and the side factor as `+1` for a sell and `−1` for a buy, the sign of the cash leg is their product, `sign(Δy) = (call ? +1 : −1)·(sell ? +1 : −1)`. This is what makes the two legs of a costless collar — a sold leg on one wing, a bought leg on the other — transact in the *same* direction against the curve rather than cancelling, a fact the No Internal Arbitrage section relies on.

A leg's **notional is range-invariant**. The size `q` of a leg is a fixed property of the leg. Adjusting a position's strike range — moving its inner or outer bound — reshapes the leg's value and its position on the curve, but does not change `q`. The range-sensitive quantities are the value and the cash leg of the swap; the notional is not among them.

### Pool Depth Evolution

Pool depth at any ray is determined by `(x, y, w)` at that ray's trade point. As `w` updates with trades, depth redistributes smoothly across the continuum.

The invariant `k` is not, on its own, a measure of pool depth. Under strike normalisation (see the next section) a rebase multiplies `k` by a factor `r^w`, so `k` is not invariant across rebases and two pool states cannot be compared by their bare `k` values. Depth is expressed by the rebase-aware relation in which `k` sits, not by `k` in isolation.

## Strike Normalisation

### Rationale

Sustained directional drift in spot causes cumulative reserve imbalance — one wing depletes faster than the other. Without normalisation, the strike-to-ray map drifts away from the original anchor, and pool spot decouples from oracle spot. Strike normalisation keeps the pool's pricing frame anchored as spot moves, so that the strike-to-ray identification remains stable under arbitrary spot trajectories.

### Approach

We index the oracle spot price to unity and define the anchor curve in this normalised frame. As oracle spot moves, the frame is periodically *rebased*: the reserves and conserved quantities are rescaled by a factor `r`,

    x → r·x,    α → r·α,    k → r^w · k

with the rebase carrying the pool's frame along with the traveling spot. The current pool spot floats around the unity reference.

Two points are worth making explicit. First, a rebase **bounds drift; it does not nullify the pool's deviation from the anchor curve**. A rebase prevents directional drift from accumulating without limit, but the pool may legitimately sit at a deviation from the anchor at any given time — that standing deviation is precisely what the funding mechanism responds to (see Funding). Second, **trades and rebases commute**: applying a trade and then a rebase yields the same state as applying the rebase and then the trade. The pricing frame is therefore well-defined independently of the interleaving of trades and rebases.

## Funding

### Intuition

Funding anchors pool spot to oracle spot. By analogy with a perpetual future — where funding flows according to the sign of the mark-to-index basis — a perpetual-option position accrues funding according to how the pool prices it relative to its anchor reference. As a structural consequence, funding is countercyclical: traders on the crowded, consensus side of the market pay traders on the contrarian side, dampening the variance of LP exposure.

### Funding for a Given Position

Funding for a position is determined by the deviation of the live pool curve from the anchor curve, evaluated **at that position's own strike ray**.

The *magnitude* of funding is the size of this pool-versus-anchor deviation at the position's ray. The *direction* follows the perpetual-future analogy: if the pool prices the option above its anchor-curve value — its mark exceeds the value the anchor curve assigns at that ray — then the long side pays funding; if below, the long side receives it. Because deviation is evaluated per ray, funding is naturally a per-position quantity, and the signed funding of each leg of a multi-leg position follows directly from the deviation at each leg's ray.

The frame for funding is the **pool-versus-anchor deviation at the position's own ray** — not pool spot, and not the pool's shape considered globally. A rebase does not change this quantity directly; it bounds the rate at which directional drift accumulates into it. Funding prices the standing deviation; rebasing caps how large that deviation can grow. Stated this way the two mechanisms are consistent: each acts on the same per-ray deviation, funding by responding to its level and rebasing by limiting its accumulation.

## The Origin Perp

A perpetual-option position in this protocol is never opened in isolation. It is opened as a *band* — a composition of option legs — against a specific perpetual future the trader already holds. The band exists to protect that perp from liquidation, and everything about how the band is valued and settled refers back to it. We call it the **origin perp**.

A trader's perpetual-future exposure is held as a single aggregated position, not as a stack of discrete lots. Adding size in the same direction grows the one position; reducing it shrinks it. There is one perp, with one notional and one equity, moving continuously as the trader trades and as the mark moves.

When a band is opened, it is minted against a **carved slice** of that aggregated perp — a defined portion, not the whole. At the moment of opening, the slice is frozen: its absolute notional, its equity, and its entry mark are recorded and thereafter held immutable for the life of the band. Later activity on the aggregated perp — more size added, the mark moving, equity changing for unrelated reasons — does not touch the slice. The band carries its own origin slice as a fixed reference.

This freezing is what keeps settlement well-posed. Because the slice is fixed in absolute terms, the band's settlement arithmetic cannot be contaminated by perp activity unrelated to the band. The perp P&L attributable to a band is simply the P&L of its frozen slice, tracked forward from entry — not a re-derived share of a live, moving aggregate. The slice is the band's immutable record of what it was opened against.

## Position Lifecycle

A perpetual-option position has three phases: open, hold, close.

### Open

A position is opened as a band, carved against an origin perp (see The Origin Perp). The trader selects strikes on the OTM continuum — subject to the OTM restriction — and the band's legs are recorded against their trade points, with the AMM reshaping via `w` and preserving the conservation law at each leg.

Positions are opened as **premium-neutral structures**. A band's legs are arranged so that their cash legs offset: the cash raised by the sold leg funds the cash spent on the bought leg, and no net cash crosses the boundary between trader and pool on opening. There is no bare cash-for-option trade exposed to the trader.

It is worth distinguishing two layers here. At the level of AMM accounting, each leg is still a swap of cash against the underlying at a trade point — this is how the pool records the transaction, and the Trade Formula applies leg by leg. But that cash leg is an accounting quantity internal to the pool's bookkeeping. At the trader-facing level, a position is a premium-neutral structure.

### Hold

An open position accrues funding continuously, as a function of the deviation between the live pool curve and the anchor curve at the position's ray (see Funding). The position carries no expiry.

### Close

The holder closes a position by reversing it on the AMM at its strike rays. The closing transaction is not subject to the OTM restriction — that restriction governs opening only — so a position whose strike has been crossed by spot, and is now in-the-money, is closed through the same mechanism.

Closing and exercising are economically equivalent for the holder, and the mechanism that makes them so is the **effective strike**. Each piece of a position carries two strikes: its *original strike*, the strike as opened, and its *effective strike*, which equals the original strike while the piece is out-of-the-money and snaps to spot when the piece goes in-the-money, tracking spot thereafter. Valuing a closing transaction at the effective strike means the closing swap returns the position's full value — intrinsic component included when in-the-money — with no separate exercise path required. This equivalence is established formally; the composite-ray closed form for settlement is verified to hold across the OTM-to-ITM boundary under the effective-strike substitution (see Annexures: Formal Verification).

A band is closed in a single composite-ray operation. Its legs are clubbed and the band is settled as one transaction rather than unwound piece by piece; the composite-ray construction used to open a spread extends to closing a whole band.

〈PLACEHOLDER — closing-protocol prose. A polished paragraph on the end-to-end closing protocol exists in a prior working session and is to be slotted here. It should state the close sequence in plain terms, consistent with the two-case settlement structure in the next section.〉

## Settlement

### The Escrow Frame

It is useful to approach settlement through a familiar idea first. A leveraged perpetual future escrows **margin**: the trader posts collateral, and the position settles against that posted margin — gains and losses are reckoned against it, and what remains is returned on close. This is the standard picture.

This protocol adds one further layer of the same idea. Opening a band escrows a **slice of the perp itself** — the carved origin slice of the previous section — and the band settles in terms of that escrowed perp, just as the perp settles in terms of escrowed margin. The band is a claim that resolves against escrowed perp the way a perp is a claim that resolves against escrowed margin. Settlement is therefore **perp-denominated**: a band's leg values are carried in units of the carved perp, not as standalone cash amounts.

One consequence follows immediately. What is escrowed is a *live* slice of a perp, not a frozen sum of cash. Settling in terms of it therefore means settling against its **equity** — its entry margin adjusted by the P&L attributable to it — at the time of close. The leg values, expressed in carved-perp units, are converted to cash at the carved slice's **closing equity**. This conversion is not an adjustment bolted onto settlement; it is the honest exchange rate between carved-perp units and cash at the moment of close. It deflates the result when the slice has lost value and inflates it when the slice has gained, symmetrically, because that is what the slice is worth.

### Closing a Band

A band has two legs on opposite wings — one above spot, one below. Because spot cannot be in-the-money on both wings at once, **at most one leg of a band is in-the-money at any time**. Settlement therefore has a clean two-case structure.

When no leg is in-the-money, both legs are live positions on the pool curve, and both are closed by reversing them on the AMM in the usual way.

When one leg is in-the-money, that leg has value but no live curve position to reverse — it is **settled to cash directly**, its value given by the composite-ray closed form under the effective-strike substitution, verified across the OTM-to-ITM boundary (result C1; see Annexures: Formal Verification). The remaining out-of-the-money leg is live and is reversed on the AMM normally. Either way, the band is closed as a single composite-ray operation.

### Two Scalars

Two distinct quantities act at settlement, and they must not be conflated. The first is the carved slice's **closing equity**, which performs the unit conversion from carved-perp units to cash. The second is **L₀**, the leverage frozen at band-open, which amplifies the settled net. One sets the exchange rate; the other sets the magnification. They apply at different points: the net is computed in carved-perp units, converted to cash at the closing equity, and then amplified by L₀, with the counterparty equity floor applying as a final guard.

## Liquidity Provision

Liquidity providers deposit proportional contributions of cash and underlying into the pool reserves `(x, y)`, in the manner of a weighted constant-product pool, and receive pool-share tokens representing a claim on `(x, y)` at any future state. Liquidity provision may be leveraged, and the pool may be implemented with virtual reserves; these are standard constructions and we do not elaborate them here.

LPs are collectively the counterparty to every open option position in the pool. Net LP exposure at any moment is the position-weighted aggregate of option deltas across all open positions on both wings.

LP P&L from internal protocol accounting equals fees earned. Reserve value changes are an impermanent-loss / HODL-benchmark concern — an external analysis frame — and are not part of protocol accounting; including them would double-count against fee P&L.

### Hedging Note

LPs can hedge net delta externally via spot or perpetual futures on the same underlying. The countercyclical funding mechanism partially offsets directional drift in LP exposure — funding inflows are systematically aligned with the wing under stress — but does not fully neutralise it. The residual is the LP's structural option-writer position.

## Properties

### No Internal Arbitrage

Within a single pool state `(x, y, w)`, no composition of swaps across rays yields a riskless capital-efficiency edge. The sharp statement concerns the **costless collar**: a band whose sold and bought legs are arranged to be cash-neutral by construction.

The collar yields **zero capital-efficiency surplus if and only if the pool is symmetric** — that is, if and only if the weight `w = 1/2`. Under skew, `w ≠ 1/2`, the surplus is non-zero, with an explicit counterexample. The "if and only if" is the substance of the claim: the result discriminates between symmetric and skewed pools, which is the evidence that it is structural rather than an artifact of the definitions. The capital-efficiency edge of a costless collar is thus a *skew phenomenon* — it exists only when the pool is directionally skewed, and vanishes exactly at symmetry. This result is verified in Lean 4 (see Annexures: Formal Verification).

A distinction must be drawn carefully. The no-arbitrage result is a statement about **pricing** — it says that at symmetry there is no per-unit pricing edge to extract. It does **not** say the pool is left unchanged by a costless collar. A costless collar costs zero net cash, but its two legs transact in the same direction against the curve, so the pool does move — the weight `w` shifts. The trader pays for that displacement: the proceeds of a swap are the path integral of the marginal price along the curve, so any displacement of the pool is internalised, by construction, by the trader who causes it. The legs therefore transact at fair, sequenced prices, and that price path is the cost of moving the pool. A collar can therefore cost zero cash and still do real work on the pool, with no contradiction — because the displacement was paid for, the question "who pays for the arbitrage?" has no answer, and hence there is no arbitrage. In particular, a collar opened at symmetry may leave the pool skewed; that induced skew is simply pool state, bought and paid for at fair prices, and the next trader transacts fairly against it.

This is a statement about *free cash*. Liquidation protection retains genuine risk-management value even at zero skew: a leveraged perp faces a discontinuous, ruinous liquidation, and capping smooth upside is not symmetric in utility with preventing a wipeout. Zero skew removes the *free* capital-efficiency edge, not the *worth* of the protection.

Finally, the collar's capital-efficiency edge and the protocol's funding flow are the same underlying quantity — directional imbalance — observed twice: no skew means no edge and no funding flow, and the two move together.

### External Arbitrage

Pool spot can diverge from oracle spot between blocks; arbitrageurs restore convergence by trading against the pool. This is the price-discovery mechanism, incentivised by the funding-elastic restoring force (see Strike Normalisation).

### Round Trip

Opening and immediately closing a position at the same rays returns the original position, less protocol fees. There is no path-dependent leakage beyond fees (see Annexures).

## Limitations

The design is presented for a single liquidity pool. A single pool exposes one directional weight `w` and one rebasing frame; it is a deliberately rigid pricing system, with no per-strike liquidity-provider discretion. This rigidity is the source of the closed-form tractability and the structural no-arbitrage property, but it also fixes the shape of the pool's liquidity distribution: the protocol prices coherently within one fixed family of pricing surfaces, and the calibration of the funding elasticity and related parameters is protocol-specific and left to implementation. The next section sketches a generalisation along which the fixed shape becomes a free parameter.

## Future Directions

The pool described here can be seen as a single slice of a larger family of liquidity distributions, indexed by two moments.

The first is **skew** — the directional tilt of the pool's liquidity, carried by the weight `w`. This is already a parameter of the present design.

The second is **kurtosis** — the peakedness of the liquidity distribution, ranging from sharply peaked and thin-tailed to flat and fat-tailed. In the present design this is not a free parameter: the constant-product invariant fixes it at a single value. We conjecture the existence of a continuous one-parameter family of AMM invariants, indexed by a kurtosis parameter `κ`, that varies the kurtosis of the liquidity distribution — with the present invariant and a log/exponential-curve invariant arising as two settings of the same `κ` rather than as rival choices. Along this family, we conjecture that the closed-form settlement tractability of the present design is preserved, and that a capital-efficiency / protection quantity is conserved as `κ` varies, the valuation surface warping coherently with the parameter.

This is a conjecture, and is presented as a direction rather than a result; its formal investigation is ongoing.

〈PLACEHOLDER — C6 conjecture wording. A precise statement of the two-moment `(w, κ)` family conjecture exists in a prior working session and is to be slotted here, replacing the sketch above with the exact formulation. The geometric interpretation developed alongside it is deliberately left out of the paper body.〉

## Conclusion

A single liquidity pool governed by a weighted constant-product invariant with one dynamic weight prices the entire OTM perpetual-option continuum in closed form. Positions are barrier instruments, priced by a bounded mark function and carrying no separate premium object. Composition of a position with the perpetual future it is opened against — its origin perp — delivers the liquidation protection that motivates the design, and settlement is denominated in units of that perp, with the carved origin slice keeping settlement attribution well-posed.

The pool's no-internal-arbitrage property is structural: a costless collar yields zero capital-efficiency surplus if and only if the pool is symmetric, a biconditional verified in Lean 4. The single-pool design that delivers this rigidity also fixes the shape of the pool's liquidity distribution; a two-moment generalisation that frees that shape is identified as a direction for future work.

## References

〈Verify all bibliographic details before submission.〉

[1] Adams, H., Zinsmeister, N., & Robinson, D. (2020). *Uniswap v2 Core.*

[2] Adams, H., Zinsmeister, N., Salem, M., Keefer, R., & Robinson, D. (2021). *Uniswap v3 Core.*

[3] Angeris, G., & Chitra, T. (2020). Improved Price Oracles: Constant Function Market Makers. In *Proceedings of the 2nd ACM Conference on Advances in Financial Technologies (AFT '20).*

[4] Angeris, G., Kao, H.-T., Chiang, R., Noyes, C., & Chitra, T. (2019). An Analysis of Uniswap Markets. *Cryptoeconomic Systems.*

[5] Martinelli, F., & Mushegian, N. (2019). *Balancer: A Non-Custodial Portfolio Manager, Liquidity Provider, and Price Sensor.*

[6] Lambert, G., White, J., Robinson, D., & Bordignon, J.-M. (2023). *Panoptic: A Perpetual, Oracle-Free Options Protocol.*

[7] de Moura, L., & Ullrich, S. (2021). The Lean 4 Theorem Prover and Programming Language. In *Automated Deduction – CADE 28.*

[8] The mathlib Community. (2020). The Lean Mathematical Library. In *Proceedings of the 9th ACM SIGPLAN International Conference on Certified Programs and Proofs (CPP '20).*

## Annexures

### Notation Table

| Symbol | Meaning |
| --- | --- |
| `x, y` | Pool reserves of the two assets (underlying, cash) |
| `w` | Dynamic weight; `w ∈ (0, 1)` |
| `k` | Pool invariant; `k = x^w · y^(1−w)` (not a depth measure — see Pool Depth Evolution) |
| `α` | Conserved quantity; `α = x · w` |
| `β` | Conserved quantity; `β = y · (1−w)` |
| `(x_T, y_T)` | Trade point on the curve (intersection of strike ray with curve) |
| `θ` | Ray angle from origin; identified with a strike |
| `K` | Strike price (parametrised by `θ`) |
| `q` | Position size (notional) of a leg; range-invariant |
| `mark` | Position value fraction; `min(slope, 1/slope) ∈ (0, 1]` |
| `θ*` | Composite ray of a spread; `θ* = √(θ_inner · θ_outer)` |
| `δ` | Composite-ray half-spread; `δ = ½ · log(θ_outer / θ_inner)` |
| `r` | Rebase factor (Strike Normalisation) |
| `L₀` | Position leverage, frozen at band-open |

### Derivation of the Continuous Case

〈Retained from prior draft — the closed-form integration of the cash leg along the conservation hyperbola. To be carried forward.〉

### Composite-Ray Identities

The barrier primitive composes: a spread between an inner strike `θ_inner` and an outer strike `θ_outer` reduces to a single transaction at the composite ray `θ* = √(θ_inner · θ_outer)` with half-spread `δ = ½ · log(θ_outer / θ_inner)`. The identities governing this reduction are stated and numbered here, and their extension across the OTM-to-ITM boundary via the effective-strike substitution is the content of verified result C1 (see Formal Verification).

〈Only identities that are defined and formally verified are stated and numbered in this annexure. The reduction's ITM extension is cited via result C1, which is verified inline; no unconfirmed identity is relied upon.〉

### Formal Verification (Lean 4)

Selected core claims have been verified in Lean 4:

- **C1** — the composite-ray closed form for settlement holds across the OTM-to-ITM boundary, under the effective-strike substitution (original strike if OTM, spot if ITM). This establishes the close-equals-exercise equivalence as a proven property.
- **C4** — the no-internal-arbitrage result: the costless-collar capital-efficiency surplus is zero if and only if the pool is symmetric (`w = 1/2`), a genuine biconditional, derived from the concrete mark formula with no domain-specific axioms and with an explicit skew counterexample.
- **Run 5c1d6cd2** — the invariant, the `w`-skew trade rule, and rebase composition: the conservation hyperbola and the constant-product curve are tangent at the reserves point, so the curve is pricing-faithful; and trades and rebases commute.

Verification artifacts are available as supplementary material.

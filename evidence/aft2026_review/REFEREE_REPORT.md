# Consolidated Referee Report: "Singular Dynamic AMM Pricing Perpetual Options Across the Strike Continuum"

Venue: AFT 2026 (anonymous submission, 21 pages)
Role: Senior PC member, consolidated report from three internal attack reviews (mathematics, economic mechanism design, novelty and prior art, formal verification standards) plus a 3-model adversarial panel (15 verdict cells, cost $0.5516).
Artifacts: verify_identities.py (12/12 checks), verify_math_angle.py (44/44 sympy checks), econ_mechanism_checks.py (Monte Carlo plus exact curvature), prior_art_dossier.md, all in this directory.

## 1. Summary

The paper proposes a single weighted constant-product pool, x^w * y^(1-w) = k, whose weight w updates on every trade via a conservation law (alpha = x*w and beta = y*(1-w) are held fixed per trade). Strikes are rays in the (x,y) reserves plane. An out-of-the-money perpetual option at ray theta is a capped barrier claim worth q * mark, where mark = min(slope, 1/slope) in (0,1]. The claim is that this one pool prices the entire OTM strike continuum, calls and puts, in closed form. Positions open as premium-neutral two-leg bands against a carved, frozen slice of the trader's own perpetual future, with leverage L0 and a counterparty-equity floor at settlement. Two headline results are stated as Lean 4 verified: a composite-ray valuation identity that survives the OTM-to-ITM boundary under an effective-strike substitution, and a no-internal-arbitrage biconditional (costless collar has zero capital-efficiency surplus iff w = 1/2). The paper is purely theoretical: derivations, a claimed but withheld Lean ledger, dimensional analysis, and one worked settlement example. The limitations section is unusually candid about the absence of simulations, empirics, a funding formula, a fee model, and a security audit.

## 2. What the paper actually delivers

Confirmed by full-text search and page-by-page reading:

- Closed-form derivations: the trade formula (Delta-x, Delta-w parametrised by the cash leg Delta-y), the conservation law and trajectory hyperbola (x-alpha)(y-beta) = alpha*beta, the marginal price mp = alpha*y^2/(beta*x^2), and the within-wing composite-ray identity with a proof sketch (Appendix C.1). All of this re-derives correctly at the reserves point: 44/44 independent sympy checks pass, and the panel was unanimous (3/3 VERIFIED at confidence 100).
- Five claimed Lean 4 results (Appendix G): the composite-ray boundary identity (labelled C1), the no-arbitrage biconditional with a skew counterexample (labelled C4), a cross-wing obstruction (CompositeRayBand), tangency and rebase composition, and state-space geometry. All claimed sorry-free on standard Mathlib axioms. None is checkable: reference [5] says artifacts are "available from the authors on request" and will be deposited only upon publication. No theorem statement, definition, version pin, or size metric appears in the paper.
- One worked settlement example (Appendix H). Its arithmetic reproduces exactly, but its stage-2 leg values (0.30 and 0.05) are stipulated, never derived from any pool state. The paper's only numbers never touch the pricing engine.
- A dimensional-analysis argument for the settlement formula (Section 10.3, Appendix E). Correct as unit algebra, oversold as verification (Section 6 below).

There are no simulations, no empirical data, no gas costs, no fee model, no funding-rate formula, no LP-return analysis, and no implementation, despite the drafting note mentioning an otherwise undescribed reference implementation. There are zero theorem/lemma/proof environments in 21 pages.

## 3. Soundness

### 3.1 Verdict table

Internal verdicts are the most severe across the three attack angles. Panel verdicts come from the 3-model adversarial panel, which adjudicated five composite claims: A = core AMM algebra, B = composite-ray identity plus worked example, C = no-arbitrage biconditional, D = the put-wing mispricing objection, E = the trade-point extension.

| Claim | Statement (short) | Internal verdict | Panel | Final |
|---|---|---|---|---|
| C1 | mark = min(slope, 1/slope) is the complete value | holds-with-caveats | (A, B context) | holds-with-caveats: true only jointly with ray parking; orientation of "slope" never pinned |
| C2 | One pool prices the whole strike continuum | gap (major) | E: REFUTED 3/3 at conf 100 | refuted as specified: off-ATM trade update is inconsistent or undefined |
| C3 | Two curves, tangent at reserves point | holds | A: VERIFIED | holds |
| C7 | Composite-ray sinh identity (within wing) | holds | B: VERIFIED | holds (exact identity, verified to 1e-12) |
| C8 | Effective-strike substitution across OTM/ITM | holds-with-caveats | B: VERIFIED | holds as algebra; mechanism reading inherits unverified sequencing assumptions |
| C9, C10 | Conservation law and trade formula | holds(-with-caveats) | A: VERIFIED | holds at the reserves point; scope limited by C2 |
| C11 | Cash-leg sign rule | holds-with-caveats | - | holds; coherent only in the sNorm orientation |
| C14 | Rebase commutes on final state, not slippage | holds-with-caveats | - | holds; slippage half is prose only |
| C15 | Funding from pool-vs-anchor deviation | gap (major) | D context | gap: no formula; identically zero at the protocol's own equilibrium |
| C16 | Carved-slice settlement denomination | holds-with-caveats (major) | D context | well-posed bookkeeping; defeats the hedging use case at the liquidation boundary |
| C17 | Premium-neutral opening | holds-with-caveats (major) | - | holds mechanically; hides an unpriced variance transfer |
| C19 | At most one ITM leg; sequencing rule | holds-with-caveats (major) | - | two-case structure holds; settle-sandwich manipulation unbounded |
| C20 | Settlement formula and equity floor | gap (major) | - | gap: no conservation; sign-only floor; no negative-side guard |
| C21 | Dimensional check | holds-with-caveats | - | correct but necessary-not-sufficient; cannot select the stage-3 converter |
| C24-C26 | No-arbitrage biconditional and counterexample | cannot-evaluate (major) | C: INCONCLUSIVE 2-1 | cannot evaluate: collarSurplus undefined; natural reconstruction is trivial or false |
| C25 | Path-integral internalisation | gap | - | sound substrate, dynamic substance unformalised; two printed errors in Appendix B |
| C30, C31 | Three-operator family, state-space geometry | holds(-with-caveats) | - | holds; decomposition uniqueness needs an order convention |
| C32, C33 | Lean verification claims | cannot-evaluate (major) | - | cannot evaluate: artifacts withheld at review time |
| C34 | Cross-wing obstruction | holds | - | holds (two-monomial argument hand-checkable) |
| C35 | Marginal price and "same closed form at any trade point" | holds-with-caveats | E (tail): REFUTED | reserves-point part holds; the any-trade-point tail is the C2 failure |
| C36 | Worked example | holds-with-caveats | B: VERIFIED | arithmetic exact; inputs stipulated; solvency gloss false |
| C37 | Novelty positioning | gap (major) | - | scoped claim survives; positioning has three defects (Section 4) |

### 3.2 The two fatal problems

(1) The off-ATM trade update is inconsistent or undefined, and the headline claim rests on it. The trade formula is derived from x = alpha*y/(y-beta), that is, from the state lying on the global trajectory hyperbola. The trade point of any non-ATM ray lies on the pool curve but provably not on that hyperbola. Concrete instance: x = y = 10, w = 1/2 gives alpha = beta = 5; the theta = 2 ray's trade point is (7.071, 14.142), where (x_T - alpha)(y_T - beta) = 18.93, not alpha*beta = 25. Appendix B (lines 593-596) instructs evaluating "the same expression at the appropriate (x_T, y_T)". Reading 1 (global alpha, beta at the trade point) violates the formula's own derivation. Reading 2 (local alpha_T = x_T*w, beta_T = y_T*(1-w)) breaks the global conservation law of Section 5.1 and leaves the induced global (x,y,w) update undefined. The panel was unanimous, all three models REFUTED at confidence 100, that no reading consistent with the paper's wording respects both the derivation and conservation. The mechanism that distinguishes this paper from a standard spot AMM, pricing trades at arbitrary strike rays, is therefore not specified by the paper.

(2) The headline theorem cannot be evaluated as published. collarSurplus(theta, w) is never defined anywhere in the 21 pages. "Admissible strikes" is never delimited. The advertised explicit skew counterexample is never exhibited, not even as one number. All three panel models converged on the same natural reconstruction: a cash-neutral collar at oracle-symmetric rays (theta, 1/theta) has bought/sold notional ratio sNorm^2, so surplus = sNorm^2 - 1, which vanishes iff w = 1/2. That makes the biconditional true but theta-independent, so the "for all admissible theta" quantifier is vacuous and the theorem is a two-line triviality. Under the other natural reading (surplus = net opening value), costlessness forces surplus = 0 for every w and the biconditional is false. The panel adjudicated INCONCLUSIVE 2-1; the dissenting model verified the reconstruction's math but skipped whether it supports the prose claim ("no composition of swaps across rays yields a riskless capital-efficiency edge"), which quantifies over swap compositions that no listed result formalises. A headline result whose central object is undefined, whose proof is withheld, and whose only reconstruction is trivial or false is not a result a PC can accept.

### 3.3 What survives, exactly

The single-state algebra is correct and was adversarially confirmed twice over:

- Conservation: with y' = y + Dy, Dx = -alpha*beta*Dy/((y-beta)(y'-beta)), Dw = beta*Dy/(y*y'), one gets x'w' = alpha and y'(1-w') = beta identically. The hyperbola is equivalent to alpha/x + beta/y = 1. Tangency: both curves have slope -(w/(1-w))(y/x) at the reserves point.
- Composite ray: with mark(t) = s/t on a wing, N*(s/sqrt(thi*tho))*2sinh((1/2)log(tho/thi)) = N*s*(1/thi - 1/tho) = N*(mark(thi) - mark(tho)), an exact identity, both wings, all regime combinations under the effective-strike substitution. Verified symbolically and numerically to 1e-12.
- Cross-wing obstruction: a fully-OTM band's value is A*sNorm + B/sNorm, two independent monomials; no single (theta, q) matches both as sNorm varies.
- The worked example's arithmetic and the rebase scaling k -> r^w * k are exact.

### 3.4 Localised errors that need fixing regardless

- Appendix B line 587: the printed small-trade display Dx ~ -mp*Dy/[1 - Dy/(y-beta)] is wrong twice; the exact form is Dx = -(Dy/mp)/(1 + Dy/(y-beta)). Numeric: -0.009980 exact vs -0.010020 printed at Dy = 0.01 from x = y = 10, w = 1/2.
- Appendix C.1 line 606: "theta < sNorm" must read "theta > sNorm" for the OTM call branch mark = sNorm/theta to stay in (0,1]. The identity survives; the first line of the only printed proof sketch does not.
- Figure 1's caption ("the reserves point itself does not move; the pre- and post-trade curves both pass through it") is false for finite trades: the post-trade curve gives 10.000 at the old point vs k' = 9.8614 in a w = 1/2, Dy = 2 instance.
- Orientation conflict: the notation table calls sNorm = (1-w)/w the pool's normalised marginal price, but Appendix B's mp equals w/(1-w) at the 45-degree point, the reciprocal, and the two move in opposite directions under the sign rule.
- Stale cross-references (Appendix C.2 and E both cite "Section 12.1" for material in 9.3 and 10.3), Related Work placed after the Conclusion, Lean labels C1/C4 with no C2/C3 anywhere.
- The mapping from a leg's notional q at ray theta to the swap cash leg Delta-y is never given, so the pool impact of opening a position is underdetermined by the spec.

## 4. Novelty

Closest prior art, established by systematic search (prior_art_dossier.md):

- Evans 2020, "Liquidity Provider Returns in Geometric Mean Markets" (arXiv 2006.08806): the same invariant x^w * y^(1-w) = k with time-varying weights, used to make the pool replicate derivative payoffs. Uncited.
- Angeris, Evans, Chitra 2021, "Replicating Market Makers" (arXiv 2103.14769) and Primitive RMM-01: deployed CFMM curves replicating Black-Scholes covered calls. Uncited.
- QuantAMM TFMM (docs 2023-2024, live pools 2025): dynamic-weight CFMMs. Cited, but calling it "concurrent" with a 2026 submission understates roughly two years of priority. Balancer is mischaracterised as never updating weights; LBPs have had time-varying weights since 2020.
- Panoptic (Lambert and Kristensen, arXiv 2204.14232): every initialised Uniswap v3 tick from one pool, both wings. Deri: multiple strikes plus perps from one pool. These weaken the abstract's "never served from a single pool" framing.
- White and Bankman-Fried 2021 everlasting options (funding = mark - payoff, an exact formula) and InfinityPools 2023 (no-liquidation embedded puts at any tick). The latter is uncited despite sharing the paper's motivating use case.
- Pusceddu and Bartoletti, FMBC 2024 (arXiv 2402.06064) plus a 2026 follow-up: constant-product AMM economic properties already mechanised in Lean 4. Uncited, so the Lean angle is methodologically incremental.

Citation integrity: reference [7] lists Panoptic's authors as "Guillaume Lambert, Jesper White, Dan Robinson, and Jean-Marc Bordignon". The actual authors are Guillaume Lambert and Jesper Kristensen. "Jesper White" splices two real people, and "Jean-Marc Bordignon" could not be located in the Panoptic literature. Given the disclosed LLM drafting assistance, this looks like an unchecked hallucinated citation. The bibliography has 11 entries, 5 of them whitepapers, and zero academic AMM-derivatives work from 2022-2026.

The genuine delta: no prior mechanism updates the pool weight endogenously per trade via a conservation law to serve tradable per-strike claims, and the scoped claim on line 532 survived adversarial search. The strike-as-ray geometry, ray parking, the composite-ray sinh identity and its cross-wing obstruction, the anchor-curve idea for per-strike funding references, and the carved-perp settlement denomination have no antecedents we found. But the swap engine itself deflates: substituting u = x - alpha, v = y - beta turns the trajectory into u*v = const, a constant-product AMM on shifted virtual reserves, the same family as Uniswap v3 curves. The dynamic weight is a coordinate change on known mathematics. The novelty is the semantic layer, not the curve dynamics the title emphasises, and the mark is vol-free, so part of the closed-form tractability is novelty by simplification.

## 5. Economic significance

Would this survive production? On the evidence in the paper, no. The strongest objections, each backed by exact algebra or Monte Carlo in econ_mechanism_checks.py, run under assumptions maximally favorable to the paper (driftless oracle, pool at its own intended equilibrium, zero fees and funding consistent with Sections 12.1-12.2):

1. Systematic mispricing at the protocol's own equilibrium, panel-confirmed 3/3. At the anchor, the OTM call mark S/K is exactly the Doob touch probability of a driftless martingale under the cash measure, which is elegant and fair for that wing. The put mark K/S is the touch probability under the asset measure. Both settle in the same unit, so one wing always carries systematic drift: under driftless GBM the put mark is a strict submartingale (MC: E[mark_T] = 0.705 vs 0.60 paid, K = 60, S0 = 100, sigma = 0.6, T = 1), and the lower barrier is touched almost surely (with infinite expected hitting time, the one panel-flagged overstatement, which does not change the conclusion). Section 12.1 states funding is zero at w = 1/2, and Section 12.2's arbitrage drives the pool to w = 1/2. So the mispriced wing is carried for free at the very state the design enforces. Nothing charges for it.

2. The hedge vanishes at the insured event. Settlement is denominated in the carved slice's own closing equity. With the paper's own example slice (E0 = $1,000, N = $10,000, 10x), a protective put at K = 92 pays $61 at the strike, $17 at S = 90.5, $0.00 at the liquidation price S = 90, and goes negative below it since no floor on carved equity is specified. The product's stated purpose, capping drawdown past the strike, fails in dollars exactly where it is needed.

3. The settlement ledger does not balance. The trader receives L0 * raw_net * equity; the club moves by (L0 - 1) * raw_net * equity. The 1x wedge ($500 in Appendix H) has no stated payer. The club-equity floor is sign-only and binary: with club equity at $1, a trader owed $1,000 passes the guard, so Appendix H's claim that the floor prevents paying "beyond what the counterparty club can absorb" is false as written. Full-then-zero payouts create a first-to-settle race, classic run structure, with default risk silently moved onto winning traders. The raw_net < 0 branch has no guard at all.

4. Zero-cost convexity extraction. Payout = L0 * raw_net * equity is concave in spot for every hedge band and convex for every momentum band on the OTM region (exact second derivatives). MC on the paper's slice: hedge bands E[payout] about -$5,100, momentum bands +$4,800 to +$5,500, at zero open cost and zero anchor funding. Nothing restricts bands to the hedging direction. The premium did not disappear; it became an unpriced variance transfer to or from the club.

5. Unspecified levers carry the whole story. No funding formula (elasticity "left to implementation"), no fee model (yet fees are load-bearing for LP income, round-trip neutrality, and any manipulation cost floor), no LP viability analysis. The pool's convergence mechanism is stale-price pickoff, which is LVR (Milionis, Moallemi, Roughgarden, Zhang, arXiv 2208.06046, applicable near-verbatim since the trajectory is a translated constant product). And sNorm is one knob serving as both the ATM mark and the entire wing skew, so arbitrage that tracks spot erases any demand-induced risk premium and its funding. The settle-sandwich (swap to displace sNorm, settle your own ITM leg at the displaced effective strike, swap back under round-trip neutrality) has an undefined cost floor.

## 6. The Lean verification

What it would certify, if the artifacts exist as described: five static algebraic or real-analytic identities at a fixed pool state, each reproducible by hand or CAS in hours. Our reviewers independently reproduced the content of the boundary identity and the cross-wing obstruction, which is real evidence the development exists. The axiom triple and Filter.Tendsto phrasing read like genuine Lean practice, and formalising the multi-regime boundary identity is the right target, since that is where hand algebra hides branch errors.

What it does not certify: anything dynamic or economic. No trade sequences, no strategies, no settlement-protocol correctness, no conservation or solvency theorem, no funding (there is no formula to formalise), no rebase timing. The settlement formula, the protocol's most consequential equation, is outside the ledger and is supported only by unit algebra plus one stipulated-input example. The ledger's own gloss ("establishes the close-equals-exercise equivalence as a proven property") and the heading "No Internal Arbitrage" market mechanism-level properties on the back of state-level identities. Note also that the verified negative direction of the biconditional, read directly, says a surplus exists at every reachable state except w = 1/2; the entire burden of why that is not exploitable falls on unformalised prose.

And none of it is checkable now. Reference [5] is on-request only, which is unusable under double blind, while anonymised channels (anonymous.4open.science, anonymised Zenodo) were available. For a paper whose abstract leads with Lean verification, this is close to disqualifying on its own for this cycle. The dimensional check, finally, is necessary but not sufficient: replacing carvedEquityAtClosure with carvedNotional changes the example's payout from $1,000 to $5,000 and passes the identical unit check, and dividing by perpMark_now instead of entryPerpMark gives $909 and also passes.

## 7. Recommendation

REJECT. Confidence: 4/5.

The single-state algebra is sound, parts of the design are genuinely new, and the limitations section is honest. But the submission fails at three points a revision cycle cannot patch within this round: the off-ATM trade update underlying the title claim is inconsistent or undefined (panel unanimous, confidence 100); the headline no-arbitrage theorem's central object is never defined and its only reconstruction is trivial or false; and the verification claims the abstract leads with are unverifiable because the artifacts are withheld. Add the uncharged put-wing drift at the design's own equilibrium, the non-conserving settlement ledger, a partly fabricated citation, and missing closest prior art, and the paper is not acceptable as is. A strong future version is plausible.

The three changes that would most improve the paper:

1. Specify the off-ATM trade. State exactly which conserved pair enters the trade formula at a non-ATM trade point, the induced global (x,y,w) update, and the q-to-Delta-y mapping, then re-prove conservation for option trades. This is the paper's core and currently it is missing.
2. Publish the formal layer. Anonymised Lean artifact repository at submission; print collarSurplus as a formula, the admissible-strike domain, and one numeric skew counterexample in the text; add a settlement conservation or solvency theorem (who pays the 1x wedge, a magnitude-aware club floor, the raw_net < 0 branch).
3. Confront the economics and the prior art. Give at least a functional form for funding and show it charges the submartingale wing; analyse or floor the carved-equity denomination at the liquidation boundary; cite and position against Evans 2020, Angeris-Evans-Chitra 2021, InfinityPools, and the FMBC 2024 Lean-AMM line; fix reference [7].

## 8. Questions for authors (merged, ranked)

1. For a trade at a non-ATM trade point (x_T, y_T): which conserved pair enters the trade formula, and what is the induced update on the global (x, y, w)? The trade point lies on the pool curve but not on the global trajectory hyperbola ((7.071, 14.142) gives 18.93 vs alpha*beta = 25 in the symmetric instance), so Appendix B's "same expression evaluated at the appropriate (x_T, y_T)" contradicts global alpha-beta conservation. The strike-continuum claim rests on this step.
2. State collarSurplus(theta, w) as a formula, define "admissible strikes", say how the collar's two strikes derive from one theta, and print the skew counterexample with numbers. Under one natural reading the biconditional is false; under the other it is true but theta-independent and trivial. Which object does Lean result C4 prove something about?
3. Will you provide the Lean artifacts to reviewers now via an anonymised repository: exact theorem statements, the definitions of mark, collarSurplus, and reachable states, version pins, and per-theorem #print axioms output? Do any of the five results model a state transition, or are all five static identities?
4. What charges the carry on a held put leg at your own equilibrium? At w = 1/2 your Section 12.1 says funding is zero at every ray, your Section 12.2 arbitrage enforces w = 1/2, and under a driftless oracle the put mark K/S is a strict submartingale. Provide the funding-rate formula or at least its functional form.
5. Give the conservation ledger for settlement. Who funds the 1x wedge between trader_payout (L0 factor) and club_delta (L0 - 1 factor), the $500 in Appendix H? What happens when raw_net < 0? Is trader_payout capped by club equity anywhere, given the floor checks only its sign? Is carvedEquityAtClosure floored at zero? Recompute Appendix H with perpMark 100 -> 91 and 100 -> 90: the winning protective put pays about $33, then $0. How is that consistent with Section 2.2's drawdown-cap claim?
6. Is a band's bought wing required to oppose the origin perp? If not, a momentum band is strictly convex in spot at zero open cost and zero anchor funding (MC: roughly +$5,000 expected on your example slice). Who pays its drift, and why does the no-arbitrage result not need to cover it?
7. What bounds a settle-sandwich (displace sNorm with a swap, settle your own ITM leg at the displaced effective strike, swap back at round-trip-neutral cost)? What is the fee model, and is there any smoothing of sNorm for settlement?
8. What is the explicit mapping from a leg's notional q at ray theta to the swap cash leg Delta-y? It appears nowhere, leaving position-opening pool impact underdetermined.
9. Why are Evans 2020 (arXiv 2006.08806) and Angeris-Evans-Chitra 2021 "Replicating Market Makers" (arXiv 2103.14769) absent from Related Work, and how do you position per-trade endogenous weight updates against their dynamic-weight payoff replication? Do you agree the engine is a constant-product AMM on shifted reserves (u = x - alpha, v = y - beta), with the novelty confined to the pricing semantics?
10. Confirm the source of reference [7]'s author list ("Jesper White", "Jean-Marc Bordignon" do not exist in the Panoptic literature) and re-verify all references given the disclosed LLM drafting assistance.
11. Reconcile sNorm = (1-w)/w with mp = alpha*y^2/(beta*x^2), which is its reciprocal at the 45-degree point and moves in the opposite direction under the sign rule. Also fix Appendix C.1's flipped inequality, Appendix B line 587's small-trade display, and Figure 1's finite-trade caption.
12. What is the "reference implementation" mentioned in the drafting note (language, on-chain or off), and why are no gas or simulation numbers from it reported? How are L0 chosen, bounded, and collateralised, and what backs the club when multiple winners settle against falling club equity?
13. Is the protocol named Temporal (per the submission filename), and how will you handle the terminology collision with QuantAMM's "Temporal Function Market Making", your reference [9]?

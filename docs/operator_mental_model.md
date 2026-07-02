# Operator mental model — the geometric translation guide (entry 304, 2026-07-02)

_The operator thinks in GEOMETRY: curves that lean and bend, points riding along them, tangent
lines, wings, seams, tails, envelopes. Operator-facing explanations LEAD with the picture, then
attach the formula, then one concrete number. This extends R7 (tables + formula + simple English)
and entry 247 (no unintroduced symbols). Binding for every agent whose output the manager relays._

## Translation table (session-proven — these landed)
| Our jargon | The operator's geometric language |
|---|---|
| mark ∈ (0,1] | "how far the curve has bent — a number between 0 and 1" |
| smooth-pasting / C¹ seam | "the payoff line is the TANGENT to the waiting curve; the joint has no kink" |
| V = max(mark, intrinsic) | "the upper envelope: the curve plus its tangent tail; you're worth whichever is higher" |
| ITM settled-to-cash (no AMM tx) | "trading at the curve's exhausted endpoint — the straight tail has no bend, so no slippage toll" |
| slippage (path integral of price) | "the toll of the curve's BEND — flat pieces are free" |
| funding (slope-deviation vs w=½ anchor) | "the curve's LEAN against the anchor curve, weighed at your strike" |
| exercise boundary S* | "the spot where you step OFF the curve onto the payoff line" |
| moneyness coordinate (S/K, sNorm/θ) | "every option is a dot sliding along the SAME one shape; your strike only picks where you sit" |
| ITM wings, both wings drawn | "the Deribit X — each side one continuous curve through OTM and ITM, crossing at the money" |
| fraction vs dollar denomination | "% of tank full vs liters in the tank — same water, two rulers" |
| per-claim carve/escrow | "the vault: one curve tells everyone what they're worth; it can't also be everybody's vault" |
| kurtosis knob m | "the steepness dial — set once from vol, never moved by trades" (NB entry 289: MORE volatile asset = LOWER m, fatter wings) |

## What works / what doesn't
- **Works:** picture first → formula second → one worked number (K=$100, g=2, S*=$66.67, mark=1/3). Tables. "Same object, two rulers" unit-translations. Naming what does NOT change alongside what does.
- **Doesn't:** coordinate-frame jargon (sNorm/θ/reciprocal) without a picture; symbols before plain English; flowy prose (they want crisp AND geometric); burying a unit change (%/$ confusion caused real doubt — always name the ruler).
- **Respect the instincts:** the operator's geometric hunches have repeatedly been correct ahead of formalization (one-universal-curve = exact in moneyness coords, entry 291; extend-the-OTM-machinery = validated + built, entries 296→298). When a hunch seems wrong, FIRST check whether it's right in a different coordinate — that has been the pattern.

## Corrections
Operator corrections to this guide land as dated addenda below; the guide is theirs to tune.

## ADDENDUM 2026-07-02 (entry 307 — operator correction, the OBJECT HIERARCHY)
The operator's primary geometry is the **POOL CURVE + RAYS**, not the derived value pictures. Order:
1. **The pool curve** (x^w·y^(1−w)=k, the lean w) — THE object.
2. **Rays from the origin** — each strike IS a ray (θ = K/oracle); the pool's own centre is the mode ray (sNorm).
3. **The mark = a RAY relationship** — read off ray coordinates (the code literally takes rays:
   `markLensed(wing, θ, sNorm, g)`); "how your ray sits against the pool's ray." Even the ITM seam is a
   RAY (`θ·g/(g+1)`): you "step off" in ray space.
4. **The "option price curve" (value-vs-spot/strike pictures, chart-2, Fig 3, the Deribit X) = derived
   SHADOWS** — projections of the ray read when you sweep spot or strike. Never present a shadow as the
   primary object.
Rule: operator-facing explanations anchor on curve+rays FIRST, then show the derived picture as "the
shadow this ray-read casts when you sweep." (The prior table's items 1–2 inverted this — corrected here.)

## ADDENDUM 2026-07-02 (entry 308 — funding, in the operator's words)
**Funding backbone = "curve divergence of pool curve vs anchor curve, LIKE RAY TO LIKE RAY."** At each
strike ray, compare the pool curve's slope where the ray meets it vs the ANCHOR (w=½) curve's slope where
the SAME ray meets it. It is NOT a comparison against the 45°/mode ray. (Matches the locked mechanism;
adopt the operator's phrasing everywhere.) ITM extension: no sign flip — a smooth HANDOVER at the seam
(proven continuous) from wing-crowdedness pricing to perp-style delta-carry; the like-ray divergence stays
the signal, the position's weight becomes its delta. NOTE the studied trap: tangent-extending BOTH curves
and comparing like-ray tails reads zero divergence deep ITM (parallel straights) ⇒ funding-free leverage —
rejected; explain this whenever the symmetric-extension instinct comes up.

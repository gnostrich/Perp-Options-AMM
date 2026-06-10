# FLAGS — skeptic, 2026-06-10 (companion to REPLY_TO_OPERATOR_2026-06-10.md; for the manager)

_Source artifact: operator message, history/operator/2026-06-10_project-status-review.md entry 10
(received verbatim — channel held, no FLAG-PROCESS on relay). Engine evidence checked directly:
HEAD_temporal_mvp_v26c.html tradeUpdate (line 1720, returns {...s, x, y} — all gh*/shape params
untouched), arbitrageToOracle (1747, same), rebase (1734) fired only from setOracle (2371,
oracle-driven, shape-preserving "u invariant"), fundingTick (2642, ledger accrual only, never
touches the curve)._

## FLAG-OMISSION (STANDING — halt-condition class per §2.1)
**The operator's final clause — "the curve warps with trades instead of (or along with) some
point moving along the curve" — is a stated structural requirement that NO current or proposed
design implements and NO artifact dispositions.** Today's engine: trade = point along a fixed
curve (verified in code, citations above). Branch A ((W) weight-profile family): trades follow
the fixed level set F(x,y)=k. Branch B (δ-unfreeze): knob set at deployment; trades move the
point. The Gudermannian/cosh derivation in flight: reparameterizes a static curve. The word
"warp" in every note (HETEROGENEOUS_WEIGHT, KURTOSIS_KNOB) means a position-dependent — i.e.
STATIC — shape, not trade-driven mutation. Partial mechanisms, honestly sized: rebase warps
(rescales) the curve but is oracle-driven and deliberately shape-preserving; the Esscher-tilt
reading (inventory #14: trade = tilt-parameter translation of the implied density) makes the
*distribution* re-tilt per trade but is a re-description of the same point-motion — the reserve
curve never changes. **Required to clear:** (1) `docs/feature_inventory.md` gains the clause as
an item (manager owns the edit); (2) the operator's strong-vs-tilt reading question goes to the
operator (it is in my reply); (3) every curve note from now on dispositions the clause
explicitly (my gate item 5). Until then no design note may be merged claiming, or implying, that
the current engine or either fork satisfies the operator's sentence.

## FLAG-OVERSELL (WATCH — pre-emptive, on the running Gudermannian/cosh derivation)
The pasted research-voice message (transcript entry 9) claims "skew is a pure shift φ" and
"scale/kurtosis is the amplitude δ·√(αh²−βh²)". Both are statements in the LATENT hyperbolic
angle θ. The trader-facing moments live in the pushforward (price) space, where the Jacobian
δ·cosh(θ) breaks the θ-symmetry — and my stock-take numerics at the engine pin (β=1) show the
existing dial moving skew and kurtosis TOGETHER (skew +0.99→+0.07 co-moving with the kurt dial).
This is blind-spot pattern #3 (latent/symmetric-slice facts sold at the engine pin) + #4
(construction-slot conflation). **Required to clear:** the derivation deliverable must include
the pushforward check — vary amplitude at fixed φ, measure price-space skew — or carry the
honest label "latent-coordinate only." Also note the derivation is a GH-internal rewrite; per
the broken-bridge verdict it does not automatically earn "Balancer generalisation" — the bridge
to the weight slot must be shown, not asserted (my gate items 1+3).

— skeptic (run honestly labeled: skeptic-charter via general-purpose runner)

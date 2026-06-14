# VERDICT — Paper warp (continuous, at-trade-point) vs engine warp (discrete, at-spot): the strike-dependence gap (skeptic verdict #16)

_Operator entries 31+32 (verbatim, relayed by manager — verified against my charter's verbatim-channel
duty; entries 31/32 are the claims I adjudicate against the paper). Artifact under review:
`notes/research/WARP_paper_vs_engine_continuous_2026-06-10.md` (research-lead). The research-lead asked
me to confirm BEFORE this reaches the operator because it revises my own #14 ("premise FAITHFUL").
READ-ONLY; operator live-playing HEAD; no build edit, no git. Every number below independently
re-derived against the LIVE engine source + the LIVE paper text — I trusted neither the note's citations
nor its numerics. Scripts: `/tmp/skeptic_warp_run.js`, `/tmp/skeptic_warp_run2.js`,
`/tmp/skeptic_v24_run.js`, `/tmp/skeptic_fixscope.js`._

## HEADLINE VERDICT: **PASS — the operator is RIGHT, and the note's core is confirmed (and UNDER-cited).**
The paper's warp IS anchored at each strike's trade point and IS continuous/path-framed; the engine
(v27 AND v24) applies the warp at spot, strike-independent. My #14 was **correct-but-narrow and I OWN
the scoping silence** — it is not contradicted, but its sweeping "premise has NOT drifted" language
should have stated it checked only the per-trade *transformation*, not the swap *anchoring*. The fix is
modest for the discrete-at-trade-point version, larger for the full continuous integral. No FLAG-WRONG,
no FLAG-OVERSELL, no FLAG-OMISSION, no FLAG-PROCESS.

---

## (1) Paper mechanism = "at-the-trade-point + continuous" — CONFIRMED, and the note UNDER-cited it
I read the paper directly (not the note's citation). The note cites lines 33/39/43/51/89 + the line-288
placeholder. All check out verbatim. **The note actually under-sells its own case** — the two MOST
explicit paper sentences it did NOT cite are even stronger:
- **Line 147 (Open):** *"the band's legs are recorded **against their trade points**, with the AMM
  reshaping via `w` and preserving the conservation law **at each leg**."*
- **Line 151:** *"each leg is still a swap of cash against the underlying **at a trade point** — this is
  how the pool records the transaction, and **the Trade Formula applies leg by leg**."*
These remove any doubt: the paper applies the Trade-Formula reshape **at each leg's trade point** (ray∩
curve), not at one spot point. Lines 43 ("a transaction at any trade point is treated as if that trade
point were the reserves point") and 51 ("the intersection is the trade point for the strike") are the
setup; 147/151 are the operative statement. **One honest nuance the note handles correctly:** the Trade
Formula as *written* (line 81) updates the "global state" using the live `y` — there is a genuine surface
tension with line 43's "trade-point-as-reserves-point." Lines 147/151 resolve it in the at-trade-point
direction. The note's reading is the right one.
- **Continuity:** the differential `dw/dy = β/y²` is NOT in the paper; the note DERIVES it as the Δy→0
  limit of the paper's discrete `Δw = β·Δy/(y·y′)` (line 85) and tags it `[analytic]` — fair and correctly
  labelled. The closed-form continuous integral IS a placeholder: **line 288 verbatim =**
  *"〈Retained from prior draft — the closed-form integration of the cash leg along the conservation
  hyperbola. To be carried forward.〉"* — confirmed verbatim. And the paper independently frames the
  continuous/path character at **line 209**: *"the proceeds of a swap are the **path integral of the
  marginal price along the curve**"* — so the operator's "calculus was done … infinitesimally
  continuously" is genuinely in the paper's frame, even though the reshape integral itself is the
  placeholder. **Verdict: claim 1 CONFIRMED.**

## (2) Strike-dependence YES — structurally CONFIRMED; the note's *specific digits* are not reproducible (pool state un-pinned)
The note's table (Δφ 0.011/0.005/−0.066/−1.39 at K=1.5/2.5/4/8) uses a pool state the artifact never
pins, so I could not reproduce those exact numbers. I rebuilt the experiment on a documented (W) state
(x=y=10, τ=0.5, w∈[0.55,0.75], φ=0) and got Δφ = −0.0107/−0.0121/−0.0548/−0.288 for the SAME cash leg
Δy=0.3 placed at each strike's trade point (`arbitrageToOracle(s,K)` then `tradeUpdate`). **The
structural claim reproduces decisively: the same cash leg warps the curve by ~27× different amounts
across strikes, growing strongly deeper OTM on the call wing.** The mechanism is exactly the note's:
`dw/dy = β/y²` evaluated at each ray's trade point (I computed the rate 0.040/0.029/0.021/0.012 — falling
in `y` on the call wing — consistent). The note's "same premium" caveat is honest and correct: premium =
q·mark and mark itself falls OTM, so the net monotonicity is sizing-convention-dependent; the robust
paper-faithful fact is "anchored at the trade point ⇒ strike-dependent," which is what I confirm.
**Verdict: claim 2 CONFIRMED structurally; note should NOT present its specific Δφ table as
reproducible without pinning the pool state (minor, non-blocking — the structural point is what matters).**

## (3) Engine DROPS it — CONFIRMED independently (bit-level)
`executeLeg` (HEAD L1844–1856): `legPrice` computes `V` (strike `theta_inner` enters HERE, via `mark`),
then `dy = ±V·oracle`, then **`tradeUpdate(state, dy)`** at the **live spot `state`**. `tradeUpdate`
(L1723) takes **only** `(s, dy)` — the strike is NEVER an argument to the warp. I verified: at fixed
dy=0.3 the post-trade φ′ is **bit-identical (−0.00611737) across θ=1.2/3.0/8.0**. Strike enters the warp
ONLY through the premium amount. So the engine's warp is `f(premium)`, strike-independent — a discrete
one-shot evaluated at spot. **Verdict: claim 3 CONFIRMED.** (Note's φ′=−0.00307451 differs from my
−0.00611737 only by pool state; the structural strike-independence is what reproduces, and it does.)

## (4) #14 reconcile — HONEST, and I OWN the scoping silence
The research-lead's "#14 correct-but-narrow" is an honest characterization, **with one sharpening I add
against myself.** #14 was asked (entry 27) to verify the geometric *premise/principle* of the warp, and
on that narrow question it is correct: the per-trade `tradeUpdate` transformation IS the faithful
field-lift of the paper's Trade Formula (same conserved (α,β), same trajectory hyperbola, φ-recenter,
tangency, τ static — all re-verified in #14, all still hold). **It is NOT contradicted by this note.**
BUT: #14's MOST IMPORTANT LINE said "the premise has NOT drifted" and its inventory check wrote "#16 …
IMPLEMENTED in the live build, the acceptance clause is met" — sweeping language that did NOT state #14
had checked only the *transformation algebra* and NOT *where on the curve the swap is anchored* or its
*continuity*. That scoping silence is precisely the failure-mode I flag in others (a true claim about one
object presented as covering a wider one). The engine applies the faithful transformation at the WRONG
anchor (spot, not the strike's trade point) and as a one-shot, not continuously. **I amend #14: its
findings stand within scope; its "premise faithful / #16 acceptance met" framing was too broad and should
read "the per-trade transformation is faithful; swap anchoring and continuity were NOT examined."** Own
it. (Pattern self-note: my own verdict tripped team blind-spot pattern #4 — true label, narrower object.)

## (5) v24 "also cheating" — CONFIRMED, and v24 is FURTHER from the paper than v27
v24's `tradeUpdate(s,dy)` (L1617–1624) holds α,β invariant and returns the new point on the fixed
trajectory hyperbola — strike absent. I verified: same dy=0.3 gives identical x′/w′ across K=1.5/4/8.
**v24 misses BOTH paper features:** (a) no per-ray weight field at all (w is a single SCALAR, uniform
across every ray — `w=α/x`), and (b) the trade is applied at spot, strike-independent. v27 fixed (a) (w
is now a field w(u;φ), varies by ray) but still misses (b) (warp at spot). So the operator's "v24 is also
cheating on this one" is **correct** — and v24 is *further* from the paper's at-trade-point continuous
warp than v27 (v27 closed the field gap; both still miss the anchoring/continuity gap). **Verdict: claim
5 CONFIRMED.**

## (6) Fix scope — NOT monumental for the discrete-at-trade-point version; the full continuous integral is larger (honest split)
The building blocks already exist in the engine: `arbitrageToOracle(s, K)` locates any strike's trade
point on the live curve (same φ, same level — verified: K=4 trade point x,y=8.679,13.681, mp=4.000), and
`tradeUpdate(ptState, dy)` warps anchored at any point. A **discrete-per-leg at-trade-point fix** is
mechanically modest: in `executeLeg`, anchor the warp at `arbitrageToOracle(state, theta_inner)` instead
of `state`. I verified it changes the result the right way: dy=0.3 gives φ′=−0.0548 at the K=4 trade
point vs −0.0061 at spot (~9×). **BUT there is a genuine, non-trivial design subtlety I will not let be
glossed:** a warp anchored at the trade point returns a post-state *at the trade point* (one φ′), and the
live reserves point is a *different* point on the same curve — reconciling "one trade, one global φ, two
points on one curve" into a globally consistent live (x,y,φ) is real design work (it is the
(α,β)-conservation-defines-a-flow question the note's flag 3 and the strong-form note's consistency-item-1
both point at). The **full continuous-case version** (the line-288 placeholder integral / path-dependent
sub-trade discretisation) is the larger piece. So the operator's "not a monumental fix" is **fair for the
discrete-at-trade-point reading**; the continuous integral is a separate, bigger, [needs-Aristotle]-class
obligation. This is a scope read, not a build — and the anchoring choice (trade-point vs spot) is a
curve/economic-object decision, **operator-tier per CLAUDE.md §7**, not calibration and not a manager call.

---

## Is the operator RIGHT?
**YES on all counts.** (a) The engine is unfaithful to the paper's warp: the paper anchors each leg's
reshape at its strike's trade point and frames it continuously; the engine warps once, at spot,
strike-independent. (b) v24 is also unfaithful — further so (it lacks the per-ray weight field entirely).
(c) The operator's diagnosis (continuous-vs-discrete is the source) is correct, with the sharper
statement being **at-the-trade-point vs at-spot anchoring** (the anchoring is the structural driver of
strike-dependence; the discrete-vs-continuous path-integral is a smaller numerical layer on top).

## Does #14 need amending? YES — narrow it, don't retract it.
#14's verified findings (conserved object, φ-recenter, referent, tangency, τ-static) all stand. Amend its
scope language: it checked the per-trade transformation, NOT swap anchoring or continuity; its "#16
acceptance clause met" line over-reached and should be read as "the transformation is the faithful
field-lift; anchoring/continuity unexamined." Inventory item #16 should reflect that the engine implements
the warp *transformation* but at the wrong anchor (spot, not trade point) and as a one-shot — i.e. #16 is
NOT fully met. (I do not edit the inventory; manager action, operator-directed.)

## MOST IMPORTANT LINE
**The paper applies the curve-reshaping Trade Formula at each leg's own trade point (ray∩curve), leg by
leg (paper lines 147/151, verbatim), so the same cash leg warps the curve by strike-wildly-different
amounts (I reproduce a ~27× spread, K=1.5→8, via `dw/dy=β/y²` at each ray's trade point) — and the live
engine drops this entirely: `tradeUpdate(state, dy)` warps at SPOT with the strike never an argument
(bit-identical φ′ across strikes at fixed cash leg), so v27's warp is strike-independent; v24 is further
still (single scalar w, no per-ray field). The operator is right that this is the engine cheating on the
warp, that v24 cheats too, and that the discrete-at-trade-point fix is modest — the building blocks
(`arbitrageToOracle`+`tradeUpdate`) exist — with the only real subtlety being reconciling one global φ
across the trade-point and the reserves point, and the full continuous integral remaining a separate
[placeholder/needs-Aristotle] piece. My #14 stands within its scope but its "premise faithful" framing
was too broad on a dimension — swap anchoring — it never checked; I amend it accordingly.**

## Process / convergence
- Verbatim channel: entries 31/32 handed raw; consistent with the artifact's quoting. No FLAG-PROCESS.
- Convergence-alarm LOW. The note REVISES a prior team verdict (mine, #14) against the team's own earlier
  convergence — self-adversarial, the opposite of quick agreement. I re-derived against LIVE source +
  LIVE paper text and found the note if anything *under-cites* its own strongest evidence (lines 147/151).
  The honest-labelling is good: placeholder flagged, [analytic]/[numeric] tags accurate, #14 explicitly
  NOT called "wrong," no build asserted, anchoring correctly routed as operator-tier.
- One non-blocking note-quality flag: the Δφ table digits (ii) are not reproducible without the pool
  state pinned — present them as illustrative, not as canonical numbers.

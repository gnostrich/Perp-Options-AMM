# SKEPTIC VERDICT — trade-point-anchoring warp fix SPEC (pre-build review)

_skeptic, 2026-06-11. Artifact: `notes/research/SPEC_tradepoint_anchoring_fix_2026-06-11.md` (the
intern's build contract for the entry-36 fix). Read-only review against the live engine
(`engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html`, md5 1eebfcd6…) sandboxed in Node `vm` —
I extracted the `<script id="engine">` block and ran the LIVE `wField`/`getMP_raw`/
`arbitrageToOracle`/`tradeUpdate`, built the spec's anchored `tradeUpdateAt` from the spec's own
code block, and checked it against them. I did NOT trust the spec's `/tmp/tradepoint_sanity.js`.
Scripts: `/tmp/verify.js`._

## HEADLINE — **FLAG-WRONG. NOT sound to hand the intern. This spec relocates the live pool to the strike ray.**

The construction `y′ = y_B + dy` with `(α,β)` seeded at the trade point does exactly the
conflation the brief feared: **it discards the live reserves point and re-seats the pool's reserves
at the trade point**, so a tiny cash leg at a far-OTM strike teleports the pool's spot price across
the curve. The strike-dependence the operator wants belongs in the warp AMOUNT (φ′), not in WHERE
THE POOL SITS — and the spec puts it in the wrong place. Items 2/3/4 below all check out (the φ
math, the spot-reduction, the gate brittleness), but they are downstream of a load-bearing
structural error in item 1.

---

## (1) FAITHFUL? **NO.** Where the pool actually sits post-trade: at `(α/w*, y_B + dy)` — the trade point's hyperbola, NOT spot's.

Concrete, on the spec's own gate pool `{x:10, y:12, τ:0.3, w∈[0.52,0.72], φ:0}` (mp0 = 2.457812,
reproduced exactly), a leg at strike `K = 1.6·mp0` with cash leg `dy = 0.1`:

| quantity | LEGACY (today, spot-anchored) | THIS SPEC (trade-point-anchored) |
|---|---|---|
| post y leg | 12.100 (= spot.y + dy) | **15.007** (= y_B + dy, y_B = 14.907) |
| post x leg | 9.960 | **9.058** |
| **live spot marginal price after** | 2.519 (barely moves) | **4.008** (jumps to ~strike K=3.93) |

The pool's y leg jumps from 12 to 15.007 on a dy of 0.1 — a move of +2.91, not +0.1. The live
spot price jumps from 2.46 to 4.01. As the strike goes further OTM the post-trade spot wanders
further: y′ = 12.10 / 12.53 / 15.01 / 17.20 at K = 1.0 / 1.1 / 1.6 / 2.0 ·mp0 for the **same**
dy = 0.1. **The pool's post-trade spot depends on which strike you happened to trade** — that is
the conflation, demonstrated numerically.

**The decisive structural fact (`/tmp/verify.js` Q1d):** the trade-point `(α,β)` = (6.41, 4.39)
hyperbola does **NOT** pass through the live spot reserves (10,12) — residual −0.798, not 0. The
spot reserves have their OWN `(α,β)` = (6.72, 3.94). On a (W) curve `(α,β)` is a *position-dependent
local readout*, not a global pool constant, so seeding it at `tp` and then moving `y` from `y_B`
launches the pool onto a hyperbola that the live reserves were never on. The spec literally throws
away the live reserves point.

**Why this contradicts the paper.** The paper's mechanic (cross-read
`WARP_paper_vs_engine_continuous_2026-06-10.md` §(i)–(ii), paper L33/39/43/79–81) is: through a
trade `(α,β)` are conserved and confine the reserves point to ONE trajectory hyperbola; the
reserves point **slides infinitesimally along that hyperbola**; the strike-dependence is in the
*reshape RATE* `dw/dy = β/y_θ²` **read at the trade point**. "Treat the trade point as the reserves
point" (L43) is the framing for *reading the warp amount at the trade point* — NOT a license to
relocate the pool's reserves to the strike ray. The paper's whole motive line is **"trades skew the
curve INSTEAD OF moving the reserves point along it"**: the reserves are meant to stay essentially
put while the *shape* (φ) warps. This spec inverts that — it moves the reserves point a huge
strike-dependent distance and warps φ as a side effect. That is the opposite of the motive.

This is a genuine FLAG-WRONG, not a labeling nit: a build of this spec would make every OTM leg
yank the live pool spot toward the strike, breaking pricing/funding/settlement for the next trader
(they would transact against a pool whose spot is wherever the last OTM leg's strike was). The
"everything else unchanged" inventory line (#4 carry coordinate, #6 value∝S^−γ read at live spot,
#9 funding at the w=½ anchor relative to the live ray) all silently break because the live reserves
— the thing they all read from — moves to an arbitrary place.

**Steelman I tried and it fails.** Steelman: "maybe `y_B + dy` IS the paper's `y′ = y + Δy`,
because L43 says treat tp as the reserves point, so the pool genuinely sits at the trade point for
this leg." This is the strongest case and it is why the spec looks plausible. It fails because the
paper applies the Trade Formula `y′ = y + Δy` **at the point you are pricing/holding** — for a spot
swap that point IS spot; for an OTM leg the paper treats tp as reserves *only to read the local
reshape rate*, then the leg's cash actually moves the live reserves (which are at spot) — the
reshape is brought BACK to the reserves point (L39: "the slope of that post-trade point is brought
to the pre-trade reserves point"). The spec keeps the trade point as the *destination* of the
reserves, never bringing it back. The "bring back to the pre-trade reserves point" clause is
exactly the step the spec drops. §1.3's "the reserves point both ride the (α,β) trajectory" is true
*on the trade-point hyperbola* — but that hyperbola is not the pool's; the pool's live reserves are
not on it (residual −0.80). So §1.3 proves consistency on a hyperbola the pool was never on.

I am NOT specifying the fix (not my role) — but the hole is precise: **the cash leg must move the
reserves from the LIVE reserves point (spot), while the warp amount/rate is read at the trade
point.** The spec instead moves the reserves from the trade point. Where exactly to seat the
post-trade reserves and how to set the single φ′ from the live-reserves move under a trade-point
reshape rate is the design question the research-lead must answer — it is currently answered wrong.

## (2) φ-CONSISTENCY §1.3 — **CONFIRMED** (the math is right; it just answers consistency on the wrong hyperbola)

Reproduced the manager's `|w(reserves; φ′) − w*| = 0.0`: at K = 1.6·mp0, dy = 0.1, the returned
single φ′ gives `w(reserves; φ′) = 0.7075027962` and `w* = 1 − β_tp/y′ = 0.7075027962`, |Δ| = 0.0
exactly. There is genuinely ONE φ′ and it reproduces the demanded weight at the reserves point.
The trade-point's own w_B (0.7055) differs under φ′ (0.7071), confirming §1.3's framing that tp
only supplies (α,β) and φ′ is fixed by the reserves point. **The one-global-φ claim is true** — but
it is consistency on the *trade-point hyperbola*, which (item 1) is not the pool's. The math is
sound; it is mounted on the wrong reserves.

## (3) SPOT-REDUCTION — **CONFIRMED, byte-exact.** executeBand internal calls are safe.

- Anchor **omitted** ⇒ `tradeUpdateAt(s, dy)` is **byte-identical** to live `tradeUpdate(s, dy)`:
  |Δφ| = 0.0, |Δx| = 0.0 at dy = 0.1 / 0.5 / −0.3. So `executeBand`'s arbitrage-reversal calls
  (`tradeUpdate(s, ±X/Y)`, lines 2139/2152/2161/2168), which pass no anchor, stay spot-anchored and
  unchanged — correct.
- Anchor = `arbitrageToOracle(s, getMP_raw(s))` (leg registered AT spot) ⇒ reduces to the legacy
  path to |Δφ| = 1.67e-16, |Δx| = 3.55e-15 (the ~1e-15 bisection floor). Reproduced the spec's
  1.67e-16 exactly.

This part of the wiring (Option A, optional `anchor` arg defaulting to `s`) is clean. It is the
only part I would keep verbatim.

## (4) THE GATE THRESHOLD — manager's FLAG is RIGHT; hard `|Δφ| > 0.02` is brittle on TWO axes.

Reproduced the spec's |Δφ| = 0.032940 exactly on its pool. Confirmed pool-dependence and added a
second axis the spec missed:

- **Pool-dependent:** varying only y, |Δφ| runs 0.033 (y=12) → 0.099 (y=16) → 0.124 (y=18) → 0.159
  (y=22). The manager's 0.0089 on a different in-band pool (mp0=4.485) is the same phenomenon from
  the low side. A fixed 0.02 false-fails some valid in-band pools and is not anchored to anything.
- **dy-dependent (the spec did not flag this):** on the spec's own pool, |Δφ| = **0.0155 at
  dy=0.05 → FAILS >0.02**, 0.0329 at dy=0.1 → PASSES, 0.343 at dy=0.5. The criterion floats with
  the cash leg too. A hardcoded threshold against a hardcoded dy is doubly arbitrary.

**Robust (g.1) gate spec (the corrected criterion — this much I will specify, since the brief asked
for it and it is gate-mechanics not curve-design):** make the assertion *relative and
self-anchored*, not an absolute magnitude. Concretely, all three of:
  1. **Pin the exact pool AND dy** the gate uses as named constants in the test (e.g. the canonical
     `wpool()` and dy=0.1), so the gate is reproducible and not silently re-parametrized.
  2. **Assert against the spot-reduction floor with a margin, not a bare number:** require
     `|φ_far − φ_near|  >  C · |φ_spotReduction|` where `φ_spotReduction` is the (g.2) leg's
     residual (~1e-16) and C is a large factor (e.g. 1e6) — i.e. assert the strike-dependence is
     many orders of magnitude above numerical noise, which is pool/dy-robust because both sides
     scale together. (At the spec pool: 0.033 vs 1.67e-16 ⇒ ratio ~2e14, trivially clears 1e6.)
  3. **Assert MONOTONE/ordered, not just distinct:** require `|φ_far| > |φ_near|` strictly (the
     warp grows further OTM on this wing) — a sign/ordering property that holds structurally across
     pools, where a magnitude does not. Reproduced: −0.0044 (near) → −0.0374 (far), |far|>|near|
     holds; and on the y=16 pool the ordering also holds while the magnitude tripled.

That combination (noise-floor-relative + ordered) cannot false-pass (a strike-INDEPENDENT engine
gives ratio ~1 and equal magnitudes — both fail) and cannot false-fail across in-band pools/dy (it
scales with the setup). Drop the hard `> 0.02` entirely. **But note this gate fix is moot until
item 1 is fixed** — gating strike-dependence on a construction that relocates the pool is gating the
wrong behavior.

---

## VERDICT: **NEEDS REWORK — do NOT hand to the intern.** FLAG-WRONG on §0/§1 (`y′ = y_B + dy`).

The spec is internally consistent and its φ-algebra, spot-reduction, and (with the item-4 fix) gate
are all sound — but they are built on a load-bearing error: **the construction relocates the live
pool reserves to the trade point's hyperbola instead of moving them from spot.** A build of this
spec would make every OTM leg teleport the pool's spot price toward the leg's strike, breaking the
"everything else unchanged" contract (live-spot-anchored pricing/funding/settlement) and inverting
the project motive ("trades skew the curve INSTEAD OF moving the reserves point"). This is exactly
the class of silent core-feature break the skeptic exists to catch. The research-lead must re-pose
the construction so the cash leg moves the reserves from the LIVE reserves point while the warp
rate is read at the trade point; then re-spec, and I re-review before the intern builds.

**MOST IMPORTANT LINE:** under this spec a dy=0.1 leg at K=1.6·mp0 moves the pool's y leg from 12
to 15.0 and its spot price from 2.46 to 4.01 — the pool teleports to the strike ray; the trade
point is conflated with the live reserves, which is the one error the brief told me to hunt, and
it is there.

## Honest scope / what I did NOT break
- §4 honest-carry label ((α,β)-flow lemma OPEN `[needs-Aristotle]`, "do not report as proven") is
  correctly worded — no overclaim there. But it certifies the WRONG construction; fix item 1 first.
- I did not check rebase/funding interaction in depth (the spec correctly says it does not touch
  `rebase`); that is moot until item 1 is resolved.
- Inventory: the spec dispositions #16 (the warp item) as its whole subject and touches #4/#6/#9 by
  the "everything else unchanged" claim — but that claim is FALSE under the relocation (item 1), so
  the dispositions for #4/#6/#9 are silently wrong, not silently absent. Filed under FLAG-WRONG, not
  FLAG-OMISSION.

_Verbatim channel: this review was dispatched by the manager with the operator's authorization
(entry 36) relayed as context; I reviewed the SPEC artifact and live engine directly, not a
paraphrase. No FLAG-PROCESS._

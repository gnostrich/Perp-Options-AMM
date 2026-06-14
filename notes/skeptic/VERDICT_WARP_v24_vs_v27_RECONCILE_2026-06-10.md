# VERDICT — WARP v24-vs-v27 reconciliation (skeptic verdict #13)

_Artifact under review: `notes/research/WARP_v24_vs_v27_compare_2026-06-10.md` (research-lead),
its MANAGER CORRECTION HEADER, and the manager's `/tmp/v24_render_warp.py` claim. Operator entry 24.
This review was demanded because the note's ORIGINAL headline contradicts my own TEST E
(verdict #12). All numbers below independently re-derived in pure JS float64
(`/tmp/skeptic_reconcile.js`, `/tmp/skeptic_ratio.js`, `/tmp/skeptic_check.js`) against the LIVE
v24 engine source (`temporal_mvp_v24_rebase_fixed_2.html`, render path L3100–3165, trade L1617–1625,
`getW`/`getDepth` L1594–1596). I trusted NEITHER engine's narration. Read-only._

## HEADLINE VERDICT: the note's original headline is FLAG-WRONG. The MANAGER CORRECTION HEADER is right.

**FLAG-WRONG** against the note's section-(iv) headline: "v24's curve does NOT warp under a trade /
v24 is a pure dot-slide / the operator's 'v24 warps' premise is FALSE." This claim measured the
WRONG OBJECT. It is false. The manager's correction header (which contests it) is the correct call,
and my numbers below are sharper than the header's.

---

## The four rulings (plain English)

### 1. Does v24 warp? — **the operator's premise is TRUE. v24's rendered curve warps.**
v24 draws its pool curve as `curveTrace(snap) = curveTraceExplicit(snap.w, snap.depth, modeSlope)`
(engine L3113–3115), rebuilt every frame from the **LIVE weight** `w = getW = α/x` (L1594) and the
live `depth = x^w·y^(1−w)` (L1596). A v24 trade conserves (α,β) and slides the reserves point along
the trajectory hyperbola `(x−α)(y−β)=αβ` (L1617–1625) — but **x changes, so `w=α/x` changes, so the
drawn Balancer pricing curve `x^w·y^(1−w)=k` reshapes.** Independently re-derived (`/tmp/skeptic_check.js`),
start pool (10,10), one 10% trade:

| price ray u | curve point pre | curve point post | Δy |
|---|---|---|---|
| call wing u=+2 | (3.68, 27.18) | (4.01, 29.65) | **+2.46 (~9%)** |
| u=+1 | (6.07, 16.49) | (6.32, 17.18) | +0.70 |
| center u=0 | (10.0, 10.0) | (9.96, 9.96) | −0.04 |
| put wing u=−2 | (27.18, 3.68) | (24.72, 3.35) | −0.33 |

`w` moves 0.5 → 0.5455 on that trade. The curve at the wings moves **more than the reserves dot**
(which only slides to (9.17, 11.0)). This is exactly my TEST E (verdict #12: plain Balancer's `w`
moves 0.55→0.585 under a trade). **v24 warps. Premise TRUE.**

**Where the note went wrong:** its Metric B held the *trajectory hyperbola* `(x−α)(y−β)=αβ` fixed
(α,β conserved ⇒ "0 exact") and called THAT "the curve." `/tmp/warp_cmp_6.js` line 25 states the
error verbatim: *"The pricing curve is fully determined by (alpha,beta)."* **That is false.** The
v24 rendered pricing curve is determined by `(w=α/x, depth)`, NOT by (α,β) alone. (α,β) determine
only the *locus the reserves point travels* — which v24 does not plot as "the curve." Conflating
the conserved trajectory hyperbola with the rendered pricing curve is the entire error.

### 2. Same order of magnitude? — **NO. And the surprise: v24 reshapes MORE than v27, not less.**
Measured apples-to-apples — each build's ACTUAL rendered curve, same (10,10) pool, same trade,
same observable `Δln(mp)` at a fixed price ray (`/tmp/skeptic_ratio.js`):

| trade | ray u | v24 reshape Δln(mp) | v27 reshape Δln(mp) | **ratio v27/v24** |
|---|---|---|---|---|
| 1% | u=0.5 | 1.98e−2 | 5.90e−6 | **0.0003** |
| 1% | u=1.0 | 1.98e−2 | 1.03e−6 | 0.0001 |
| 10% | u=0.5 | 1.82e−1 | 5.81e−3 | **0.032** |
| 10% | u=1.0 | 1.82e−1 | 1.05e−3 | 0.006 |

v24's whole curve shifts by the full `Δln(w/(1−w))` (a single scalar `w` multiplies every ray's
slope uniformly), so the reshape is LARGE and curve-wide. v27's reshape is the small field-recenter
(`Δφ`), concentrated at the elbow and decaying into the wings. **v27 reshapes the rendered curve
30×–1000× LESS than v24, NOT the same order of magnitude.** (This INVERTS the note's framing that
"v27 adds a reshape v24 structurally lacks" — v24 has the bigger reshape; v27's is the smaller, new,
elbow-localized one.)

**Caveat for honesty:** v24's big curve-wide shift and v27's small elbow shift are *different shapes*
of reshape, so "ratio" mixes a curve-wide multiplier (v24) with a localized bend (v27). The robust
statement: **v24's rendered curve moves substantially under a trade; v27's moves far less.** The
"same order of magnitude" the operator hoped for is NOT present on the rendered curve.

### 3. The visibility fix — **mirror v24's anchor-overlay viz; do NOT amplify.**
v24 makes its warp visible by overlaying a FIXED `w=0.5` anchor curve (L3164:
`curveTraceExplicit(0.5, snap.depth, modeSlope)`) alongside the live curve (L3165). The eye reads
the warp as the *divergence* between live and anchor. Re-derived: post-10%-trade the live curve sits
at y=29.65 @ u=2 vs the anchor at y=27.07 — a Δy=2.58 visible gap. v27's WIP lacks this overlay, so
its (genuinely smaller) reshape has nothing to read against and looks like a bare dot-slide. **The
honest first fix is the anchor-overlay viz, not amplification.** Amplification would misrepresent the
engine's magnitude; the overlay shows the true magnitude. (That said — see ruling 2 — even WITH the
overlay v27's reshape is much smaller than v24's, so the operator should be told the overlay will
reveal a *smaller* warp than v24's, not an equal one. Whether that is acceptable is the operator's
calibration call: smaller τ / wider Δw enlarges v27's elbow reshape, an operator/calibration-tier
choice, not a render bug.)

### 4. The definitional knot — reconciled with my TEST E.
Two distinct objects, do not conflate:
- **Trajectory hyperbola** `(x−α)(y−β)=αβ` — the locus the reserves point travels; conserved by
  every (α,β)-conserving trade in BOTH v24 and v27. Invariant under trade. NOT what either build
  plots as "the curve."
- **Pricing curve** `x^{w}·y^{1−w}=k` (the tangent Balancer curve at the live local weight) — what
  v24 actually DRAWS. Moves as `w` moves, i.e. moves under every trade.

**The right referent for "trades warp the curve" is the rendered pricing curve.** Under that
referent v24 warps (ruling 1) and my TEST E was right all along: the note's Metric B silently
switched referent to the trajectory hyperbola, manufacturing a "0 reshape" that says nothing about
what v24 displays. **No conflict between my TEST E and reality — only between my TEST E and the
note's mis-measured Metric B, which is the thing that's wrong.**

---

## What the note got RIGHT (do not over-correct)
- **Metric A (dot-slide) ratio 1.000 — CORRECT.** Both builds share the trajectory hyperbola and
  start identical at (10,10), so the reserves point moves byte-identically. That number stands.
- **v27 at the matched setting reproduces v24's reserves-point motion exactly** — true, and a
  legitimate finding. It is the CURVE reshape (Metric B), not the dot-slide, that the note
  mis-measured.
- The matched-kurtosis construction (`w_mid=0.5, Δw=τ/2` to match `dw/du=1/4`) is a defensible
  render-agnostic match; I did not re-attack it (the reshape inversion in ruling 2 holds across it).

## MOST IMPORTANT LINE
**The operator's premise is TRUE — v24's rendered curve warps under a trade (its scalar weight
w=α/x moves, the whole Balancer pricing curve reshapes, ~9% at the wing on a 10% trade). The note's
"v24 ≡ 0 reshape / premise FALSE" headline measured the conserved TRAJECTORY hyperbola, not the
curve v24 DRAWS — it is FLAG-WRONG. Apples-to-apples, v27's per-trade curve reshape is NOT the same
order of magnitude: it is 30×–1000× SMALLER than v24's (v24's weight scalar shifts the whole curve;
v27's φ-recenter is a small elbow-local bend). The honest visibility fix is to mirror v24's
fixed-w=0.5 anchor-overlay so the warp reads against a reference — NOT to amplify — but the operator
must be told that overlay will reveal a smaller warp than v24's, which is a calibration (τ, Δw)
question, not a render bug.**

## Process notes
- Convergence-alarm: N/A — this was a contradiction I was summoned to break, not a converged note.
  The manager CAUGHT its own subagent's headline (the correction header) before relaying — good
  process, the §2.1 channel working as designed; no FLAG-PROCESS.
- Verbatim channel: operator question quoted in the note ("compare with v24 and see if we have
  similar order of magnitude when we start with the same kurtosis implied by the ordinary balancer
  curve sort") — I treat it as relayed; I did not independently pull entry 24 from
  `history/operator/`. If the manager's relay of MY verdict to the operator is paraphrased rather
  than verbatim, that would be a FLAG-PROCESS.
- Pattern reinforced (blind-spot #4, construction-slot / object conflation): "the pricing curve is
  fully determined by (α,β)" is the same class of error as price-vs-slope (GOTCHA #12) — a true
  statement about the WRONG object (trajectory) sold as a statement about the rendered object
  (pricing curve). Sibling of the kernel-in-SCORE vs kernel-in-WEIGHT confusion.

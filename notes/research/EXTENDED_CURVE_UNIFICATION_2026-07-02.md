# EXTENDED-CURVE UNIFICATION — design study (operator entry 295)
**Date:** 2026-07-02 · **Author:** research-lead · **Status: BRAINSTORM-GRADE.**
No engine/paper/CLAUDE.md edits, no Aristotle runs (per brief). All math here is hand-derived and
numerically spot-checked in a sandbox; nothing below is `trusted-from-prover` unless it cites an
existing archived result by name. Engine behaviour is cited by line from
`engine/builds/HEAD_temporal_mvp_v28_lens.html` (read-only).

**Binding base (operator-approved, not relitigated here): PKG-ITM-FIX-DESIGN** — bounded
continuation mark ∈(0,1] on-curve; separate linear intrinsic module (put (K−S)⁺, call (S−K)⁺);
V = max(mark, intrinsic), never capped-mark+intrinsic; continuation re-seams onto LINEAR intrinsic
at S\* = K·g/(g+1) (0.667K at g=2). Binding constraints: `reserves_have_no_floor`; communal reserve
curve vs per-claim ITM-ness; |Γ|≤1 exact per wing; solvency stays conditional (B1/B3/B4).

---

## 0. The one object, stated first

Everything in items 1–4 is a read or a walk of a single per-wing value curve. Notation: spot S
(dollars), strike K, g = m·γ (the lensed exponent, constant per strike), all per unit notional
(one option on one perp).

**Put** (natural escrow unit: K dollars of cash; value quoted as a fraction of K):

```
S*_p = K·g/(g+1)                                  (free boundary; 0.667K at g=2)
v_p(S) = 1 − S/K                     for S ≤ S*_p  (ITM tail — the tangent ray)
v_p(S) = (1/(g+1))·(S/S*_p)^(−g)     for S ≥ S*_p  (continuation — the curved wing)
```

**Call** (natural escrow unit: 1 perp; value quoted as a fraction of one perp):

```
S*_c = K·(g+1)/g                                  (1.5K at g=2)
v_c(S) = 1 − K/S                     for S ≥ S*_c  (ITM tail)
v_c(S) = (1/(g+1))·(S/S*_c)^(+g)     for S ≤ S*_c  (continuation)
```

*Plain English: each wing is one curved piece (the power-law wing, exponent m·γ — the kurtosis
knob's only home) welded to one straight piece (the exercise payoff). The weld is a TANGENCY: the
straight intrinsic line just kisses the curve at S\*, value and slope both matching (C¹). That
tangency IS smooth-pasting; S\* is the American early-exercise boundary.*

Checked numerically (g=2, K=100): value and slope match at S\*=66.67 to machine precision; the
continuation curve sits **above** the intrinsic line everywhere on its region (value ≥ exercise —
the American property; the exact property whose violation the tester caught in entry 286); both
wings' seams are C¹ in whichever coordinate you draw them (S at fixed K, or K at fixed S).

**Universality (entry 291's intuition, made exact):** K scales out. v_p(S;K) = φ_g(S/K) for a
single function φ_g; the call is the same function read at the reciprocal moneyness,
v_c(S;K) = φ_g(K/S). ONE curve per g; every position at every strike rides it at its own
moneyness; ITM-ness is just "which side of the tangency point your moneyness sits." The reserve
curve stays plain v24 Balancer, untouched — the extended curve is a **value-layer** object
(no reopen of the entry-229/231 curve lock).

**Envelope caution (get the slogan right).** "V = max(mark, intrinsic) = upper envelope" is
correct as *curve-piece ∪ tangent-ray* and as a *safety clamp* (value never below exercise). It is
NOT correct as "max of the intrinsic line and the power branch extended past S\*": the power
branch, formally extended below S\*, lies *above* its own tangent line (convexity), so that max
would pick the wrong function. The precise envelope statement is Snell-type: **V is the least
curve-admissible majorant of intrinsic with the wing-law decay** (see obligations, §5). The V=max
formula is exact when "mark" means the *bounded on-curve mark* (the re-seamed paste, which equals
the tail on ITM), which is how PKG-ITM defines it.

---

## 1. Item 1 — chart-2 %→$ toggle

**Verdict: FEASIBLE, and the toggle itself is pure display — with one honest predecessor step.**

Today chart-2 does **not** plot value at all. It plots the normalized steepness SHAPE
`(mode/θ)^g` with an artificial peak = 1 at the mode (Option-C 2026-06-22, `psiShape`, HEAD
L3737-3743) — a proxy built to satisfy the entry-226/266 display rulings ("steeper for higher
vol", "mode must reach 1"). The operator's picture (entries 292/295) requires plotting the **true
value curve** of §0. So the implementation is three separable layers:

- (a) the PKG-ITM V=max engine fix (already the approved target arch, deferred) — settlement math;
- (b) chart-2 rewired from the shape proxy to the true V read — display, but it **supersedes the
  Option-C/entry-266 normalization contract**, so it needs operator display sign-off;
- (c) the %↔$ toggle — pure display, a numéraire multiply on the same read.

**The two views, precisely** (x-axis unchanged: strike angle φ = atan(θ), with the existing $K
tick row; spot S and g read live; each strike K plotted at its own moneyness):

| | Fraction view (%) | Dollar view ($) |
|---|---|---|
| y for a **put** at strike K | v_p — fraction **of the K-dollar cash escrow** | D_p = K·v_p (dollars per option) |
| y for a **call** at strike K | v_c — fraction **of the 1-perp escrow** | D_c = S·v_c (dollars per option) |
| deep-ITM behaviour | both wings **saturate → 1** (put as K→∞, call as K→0) | put wing → **K−S** (slope +1 in K), call wing → **S−K** (slope −1): the Deribit X |
| OTM wings | put ∝ K^g, call ∝ K^(−g) — same power laws the current chart draws, now correctly scaled | put ∝ K^(g+1), call ∝ K^(−g) |
| crossing | at ATM (K=S), height (g/(g+1))^g/(g+1) — **4/27 ≈ 0.148 at g=2** | at ATM, height S·(g/(g+1))^g/(g+1) ≈ 0.148·S |
| seams (g=2) | call seam K = 0.667·S, put seam K = 1.5·S; both joins are **C¹ (no kink)** in K — verified numerically | same seams; the curved piece meets the straight wing tangentially |
| y-axis meaning | "what fraction of its escrow unit is this claim worth" | "what is this claim worth in dollars" |

*Plain English: the % view answers "how full is the escrow bucket" — both wings fill up to 1.
The $ view multiplies each strike by its own bucket size, which un-caps the call wing and produces
exactly the straight crossing wings of the Deribit photo. Same curve, two units.*

**The one hard requirement:** both views MUST be drawn off the FIXED V=max read (one shared
helper, same function settlement uses — the single-basis discipline v28 already follows for
`gLoc`/`markLensed`). Drawing off today's `markLensed` would put the put seam at
K·(g/(g+1))^g = **0.444K** (g=2) instead of 0.667K and would dip below intrinsic from S/K≈0.82
(tester, entry 286) — i.e., the chart would faithfully display the bug. Do not fork a
draw-local formula either; ship (b)+(c) with (a).

**What breaks:** nothing in settlement (display-only given (a)); the Option-C shape plot and its
"peak=1 at mode" contract are superseded (operator sign-off; see item 2 for the replacement
m-visibility story); the $ view needs a dynamic y-scale (max over plotted K of the ITM asymptote).

---

## 2. Item 2 — uncapped crossing wings

**Verdict: FEASIBLE and display-safe; the ≤1 ceiling and the >1 dollar wings are statements about
two different things, and the distinction is exactly the escrow structure.**

**Does displaying >1 values conflict with anything real? No — because nothing ever exceeds 1 in
its own escrow unit.** The ≤1 mark is a SOLVENCY ceiling on the *pool-quoted mark per escrow
unit*: a short put escrows K dollars and can never owe more than K (payoff K−S < K); a short call
escrows 1 perp and can never owe more than that perp (payoff S−K = (1−K/S)·S ≤ 1 perp). The
dollar view's unbounded call wing S−K is not the pool promising unbounded value — it is the
*market value of the escrowed perp itself* appreciating, minus K. Every point of both dollar
wings is covered claim-by-claim by the carve/escrow: put tail ≤ K cash, call tail ≤ 1 perp.
So the X can be drawn uncapped with zero solvency implication. (Recommended honesty device: style
the tail segments differently from the continuation segments — e.g. dashed or dimmed — captioned
"parity, escrow-backed" vs "pool-quoted"; the pool only ever quotes the ≤1 continuation/paste
mark, the tails are settlement claims on the carve.)

**Does "everything read off the (extended) curve" hold exactly? Yes, with the §0 envelope caveat.**
The drawn object is precisely the American value function: curved piece = pool-quoted continuation,
straight piece = tangent intrinsic ray = exercise value; V ≥ intrinsic everywhere; upper-envelope
in the curve∪tangent-ray sense; tangency (tfp: value+slope) at S\*. American-perp-faithful by
construction — it IS the perpetual-American value shape, per wing, at every strike simultaneously
(the communal curve carries strikes in different regimes side by side; each strike just reads
φ_g at its own moneyness).

**Normalization replacing the peak=1 tent (the entry-226/266 requirement):** the fraction view is
*self-normalizing* — y∈[0,1] with the wings genuinely reaching 1 at the deep-ITM ends. The "reach
1" anchor survives, relocated from an artificial mode peak to the true saturation ends. The m-knob
stays visible three ways, all monotone in m: (i) wing steepness — the curved segments are exact
power laws of exponent m·γ (steeper everywhere as m rises — the original entry-226 requirement);
(ii) the ATM crossing height (g/(g+1))^g/(g+1) falls with m (4/27 at g=2 → e^(−1)-ish/g for large
g); (iii) the two seams K = S·g/(g+1), S·(g+1)/g march inward toward ATM as m rises (the
exercise region grows). This is a *stronger* visibility story than the tent, but it is a different
display contract → operator sign-off.

**What breaks:** nothing mathematical. The current chart's put-left/call-right OTM-halves layout
becomes two full-range crossing curves (colors overlap mid-chart); the min(1,·) draw clamp must be
removed in $ view; needs a new draw gate (§5).

---

## 3. Item 3 — open/close symmetry

**Verdict: (a). The asymmetry is PRINCIPLED — closing is already symmetric once the tangent tail
is seen as part of the curve; its slippage is zero because the tail is straight. Recommend
adopting (a) as doctrine (no engine change) and NOT building (b).**

**The math for (a).** Slippage on an AMM is the second-order term: the execution price of a finite
walk deviates from mid by the curvature of the arc you walk (a path integral of the marginal price;
on a straight segment the marginal price is constant, so the integral is exactly mid·size, zero
impact at any size). Where does each lifecycle event live on the extended curve?

- **Open / OTM close:** the position's moneyness is on the *curved* piece. The financing swap
  walks the communal reserve curve (`tradeUpdate`, open dy = +wingSign·N·K_tx, close dy = −open
  dy, exact reserve round-trip — HEAD L1815/L2094); the premium is the curve read. Curvature ≠ 0
  ⇒ price impact ≠ 0. Symmetric by construction (the close is the literal reverse walk).
- **ITM close:** the position's moneyness is on the *tangent tail*. The tail's curvature is
  identically zero and its value is parity, so "the walk" of any size N fills at exactly
  N·(K−S) — the path integral over a straight segment. The engine's settled-to-cash at parity
  with no pool transaction (closeBand, L2013-2016) is therefore not a special case bolted on: it
  is the **exact value of walking the extension**, computed in closed form. Zero slippage is the
  correct continuum limit, not a missing feature.
- Economically the same statement: an ITM claim past S\* has no optionality left (Γ = 0 on the
  tail — a put tail is K cash minus S of perp, a pure linear package). Price impact is compensation
  for the convexity/inventory risk a counterparty absorbs; a linear, fully-escrowed package
  transfers none, so zero impact is the arb-free price of the fill. The Uniswap-v3 analogy is
  exact: past the range, the LP position is 100% one asset, value linear in price, and trading it
  is a trivial exchange at parity — "trading at the curve's exhausted endpoint."
- Depth is not infinite in *size*: the tail fills at zero slippage **up to the escrowed open
  interest at that strike** (the carve is exactly that size), and there is nothing beyond it to
  fill. Bounded size, unbounded (flat) depth-per-unit — again the exhausted v3 range.

**The math for (b) — giving the tail depth/curvature.** The other side would have to be the
port/carve quoting a curve on settled claims. Any curvature means quoting ≠ parity: quoting the
close *below* intrinsic makes the trader's realized value dip below exercise value — this
re-introduces, deliberately, the exact value<intrinsic violation of American faithfulness that
PKG-ITM exists to fix (and creates a strictly-dominated close, i.e. a tax that vanishes in the
competitive limit); quoting *above* intrinsic bleeds the vault to arbitrage (buy claim at parity
economics, close into the vault's rich quote). Either direction also asks the vault to run
market-maker inventory risk in a linear instrument, which is precisely what `reserves_have_no_floor`
and the carve architecture were built to avoid warehousing. If the product ever wants exercise
friction, the honest instrument is an explicit **exercise fee** (a flat bps knob on settlement —
a fee, not a value statement; leaves tangency and faithfulness intact). That is a separate,
operator-tier product knob, not curve geometry.

**The honest residual asymmetry that stays (do not paper over it):** an OTM walk moves the
*communal* curve (price impact shared with every other position); an ITM settlement touches only
the *per-claim* carve. That is the communal-vs-per-claim split, and it is structural (§5, "what
this does not unify").

---

## 4. Item 4 — ITM funding / extended anchor

### 4.1 What the engine does ITM **today** (read-only, HEAD L2269-2277)

```
fundingPerStrike = κ · (±g) · N · markLensed(wing, θ, mode, g) · (S−1)/S · dt
```
with S = poolMark/oracle (pool-vs-anchor price ratio, one number for the whole pool, regime-blind)
and g = m·γ. There is **no regime branch**: an ITM position keeps accruing funding, with the mark
factor sliding onto `markLensed`'s ITM arm — which is today the *power* arm (the very arm the
tester showed dipping below linear intrinsic, entry 286). So today's ITM funding = the OTM formula
continued with a saturating, known-buggy mark magnitude; sign unchanged; zeroes only at S=1
(pool on anchor). It exists, but it is un-designed — inherited, not chosen. The anchor enters only
through the scalar S; nothing anchor-side is evaluated at the strike's ray ITM (or OTM — the
spec's per-ray two-curve gap, `specs/temporal_formal_spec.md` §1.3, is implemented as pool-level
(S−1)/S times per-strike scaling).

### 4.2 The identity that makes the extension natural

On the continuation region the engine's magnitude factor is not arbitrary. For the put,
D ∝ S^(−g) gives ∂D/∂lnS = −g·D, so

```
g · mark  =  |∂V/∂ln S|      (the value curve's LOG-SLOPE at the strike's ray)
```

— today's OTM funding magnitude **is already the log-slope read of the value curve**, i.e. the
position's live exposure to the pool-vs-anchor gap. That is the "slope-deviation through the lens"
of the spec, in closed form. So the natural extension is forced: **keep the same formula and let
the read ride the extended curve through the seam.**

### 4.3 What the extension yields (put, dollar frame; Λ(S) := |∂D/∂lnS|)

- Continuation: Λ = g·D (identical to today — **OTM funding unchanged**, puts).
- Tail: D = K−S ⇒ Λ = S — i.e. |Δ|·S, the dollar value of the position's residual delta-1
  perp exposure.
- **Continuous at the seam automatically**: C¹ paste ⇒ ∂D/∂lnS continuous; numerically
  g·D(S\*) = g·K/(g+1) = S\* = tail value. Verified. No jump, no kink in the funding rate at S\*.
- Deep ITM the rate becomes κ·(basis)·S·|Δ| — **exactly perp-futures funding on the forward
  component**. A deep-ITM perp option IS a synthetic perp future (delta 1, zero gamma); the
  extension makes it pay the same carry the tethering mechanism charges a perp. Both wings' tails
  give Λ = S identically (a small symmetry closure of its own).
- **Crowded-pays-contrarian survives everywhere**: the sign structure (±wing)·(S−1)/S is untouched;
  only the magnitude weight rides the extended curve. Funding still zeroes exactly at S=1.

*Plain English: funding pays on "how exposed is this claim to the pool being off its anchor."
OTM, the exposure is the curve's steepness (g·mark — today's formula). Deep ITM, the optionality
is gone and what's left is a plain perp position, so the claim pays plain perp funding on that
residual. The tangent extension interpolates between the two continuously, with no seam jump,
for free — because the seam is C¹.*

**The rejected alternative** — reading the *slope-ratio deviation between the pool curve and a
tangent-extended anchor curve* (anchor exponent g_a = m·γ|_{w=½} = m) — sends funding → 0 beyond
both seams **exactly** (both tails are the same parity line; the gap has compact support where
optionality lives). Elegant, but it makes deep-ITM positions funding-free delta-1 leverage: hold a
deep-ITM call instead of a perp and escape funding entirely — an arbitrage against the funding
tether. Reject unless a separate carry leg on the carve is added (which un-unifies).

**Honest caveats:** (i) the call side is not literally "formula unchanged": in dollars the call
continuation is D ∝ S^(g+1) (the per-perp fraction ∝ S^g times the perp numéraire S), so the
clean Λ-read weights the call OTM rate by (g+1)·mark rather than today's g·mark — a
(g+1)/g ≈ 1.5× (g=2) recalibration of call funding that must be surfaced, not slipped in.
(ii) The engine's fraction-vs-dollar plumbing (put mark is per-K, call mark is per-perp) needs one
explicit numéraire pass at build time. (iii) Everything in 4.3 rides the FIXED V=max curve; on
today's power arm none of the continuity claims hold.

**⚠ OPERATOR PRODUCT SIGN-OFF REQUIRED (flagged, per brief — this is funding semantics):** the
extension changes real ITM cash flows vs today (today: buggy-mark-scaled accrual growing with
saturation and over-weighted by the constant g; extension: delta-carry, perp-future limit; the
rejected alternative: → 0). And the call-side (g+1)/g recalibration touches OTM flows too. None of
this ships on my call.

---

## 5. Item 5 — THE UNIFICATION

**The compact statement.** *For each wing there is ONE value curve: a power-law wing of exponent
m·γ welded C¹ to its own tangent intrinsic ray at S\* = K·g/(g+1) — equivalently, the least
curve-admissible majorant of the exercise payoff with the wing-law decay. Strikes scale out: every
position at every strike reads the same universal moneyness curve φ_g. Every lifecycle quantity is
a read or a walk of this curve:*

| operation | = what, on the one object |
|---|---|
| mark / position value | point read of φ_g at the position's moneyness (fraction); ×escrow unit for dollars |
| payout / exercise | read on the tail (tail read ≡ parity, escrow-backed) |
| chart-2, both views | the curve itself, per strike (% = per-escrow-unit; $ = ×numéraire ⇒ the Deribit X) |
| open / OTM close | walk of the communal reserve curve (financing leg) + curve read (premium); impact = curvature of the walked arc |
| ITM close | walk of the tail: straight ⇒ zero impact, fills at parity up to escrow size (exhausted-range limit) |
| slippage | the curvature functional of whatever segment you walked (curved piece: >0; tail: ≡0) |
| funding | the log-slope read |∂V/∂lnS| at the strike's ray × the pool-anchor gap; continuous through the seam; → delta-carry deep ITM; compactly-supported *optionality* funding + perp-style *residual* funding, one formula |
| the m knob | the exponent of the only curved piece — steeper wings, lower ATM crossing, seams marching inward, all monotone in m |
| Γ accounting | |Γ|≤1 on the curved piece per wing; Γ≡0 on the tail; C¹ weld ⇒ no distributional Γ spike at S\* |

**What would have to be true to ship this as the part-2 architecture** (instead of piecemeal
fixes) — the new obligations, none yet submitted (no Aristotle runs this task):

Lean (all statable in the MonolithConstM/LENSKERNEL style, dollar frame, ∀ g>0):
- **O1 `paste_value_lin` / `paste_slope_lin`** — C¹ weld of the power wing onto the LINEAR
  intrinsic at S\*=K·g/(g+1). Genuinely NEW: the archived `valueMatch_g`/`slopeMatch_g`
  (LENSKERNEL) and `paste_value`/`paste_slope` (MonolithConstM) prove the POWER-arm paste in the
  sNorm coordinate — the entry-287 discrepancy flag stands confirmed.
- **O2 `value_ge_intrinsic`** — V(S) ≥ intrinsic(S)⁺ everywhere (American faithfulness; the
  theorem-shaped version of the tester's entry-286 finding; kills the whole dip-below class).
- **O3 `envelope_least_majorant`** — V is the least majorant of intrinsic among wing-decay
  curve-admissible functions (deterministic Snell-lite; composes with SnellStaged Stage A; the
  full stochastic claim stays OPEN as already recorded).
- **O4 `tail_walk_linear` + `no_gamma_spike_at_seam`** — cost of a size-q tail fill = parity·q
  exactly (zero-slippage limit as a theorem, not a limit), and C¹ paste ⇒ no distributional
  second-derivative mass at S\* (the |Γ|≤1-per-wing bound survives the weld).
- **O5 `logslope_cont_at_seam` + `funding_otm_identity` + `funding_tail_delta_carry`** —
  S·V′ continuous at S\* (corollary of O1); g·mark = |∂V/∂lnS| on continuation (the identity
  behind §4.2); tail log-slope = |Δ|·S. Plus the sign lemma (funding zeroes iff pool on anchor;
  crowded-pays-contrarian preserved).
- **O6 `wings_cross_once_at_atm`** — put strictly increasing / call strictly decreasing in K at
  fixed S, unique crossing at K=S, height (g/(g+1))^g/(g+1) (the display theorem for the X).
- **O7 `call_put_reflection`** — v_c(S;K) = v_p(K-reflected moneyness) with the same g (ties the
  crossing X to the C2/C3 symmetry lineage — carrying C3's honest caveat: the curve-symmetry→
  reflection arrow is still an axiom-shaped conditional, not fully discharged).

Gates (numeric, engine-side, alongside `lens_selfcheck`/`a16`):
- **G-X (chart)**: seam at 0.667K (g=2); no drawn point below intrinsic; $-view ITM slopes → ±1;
  crossing at ATM in both views; fraction wings → 1; both views byte-derived from the ONE shared
  V=max helper (no draw-local fork).
- **G-F (funding)**: funding continuous across S\* to tolerance; deep-ITM rate → κ·basis·S·N;
  zero at S=1; sign table unchanged OTM.

**What this does NOT unify (honest list):**
- **The port/vault.** Solvency stays conditional on B1/B3/B4 — the tail claims are exactly the
  B1 coverage object. The extended curve tells you what the tail is *worth*; the carve is what
  makes it *payable*. Funding remains necessary-never-sufficient (PH-4b). The vault stays a
  separate object.
- **The communal-vs-per-claim split.** One communal reserve curve, per-claim regimes and escrows.
  The value curve unifies the *geometry*; it does not merge the warehouse.
- **The dollar pipe / Layer-2** and the funding *cash-routing* (who pays whom): untouched.
- `reserves_have_no_floor` is honored, not overridden: the pool curve never warehouses the tail —
  the tail is per-claim escrow. The unification is a value-layer statement over a locked pool.

---

## 6. Verdicts and recommendation

| # | item | verdict | operator decision needed? |
|---|---|---|---|
| 1 | %→$ toggle | FEASIBLE; toggle pure display; chart must first switch from the shape proxy to the true V=max read (supersedes Option-C/entry-266 tent) and must ship with/after the PKG-ITM engine fix | display-contract sign-off (226/266 lineage) |
| 2 | uncapped crossing wings | FEASIBLE, display-safe; ≤1 is a per-escrow-unit pool ceiling, the $ X is escrow-backed parity — no conflict; envelope framing holds exactly in the curve∪tangent-ray sense | same sign-off; style split pool-quoted vs parity segments recommended |
| 3 | open/close symmetry | (a) — PRINCIPLED: slippage = curvature, the tail is straight, parity-cash settlement IS the walk of the extension; recommend doctrine (a), no engine change; (b) breaks American faithfulness or vault economics; exercise-fee is the only honest friction knob | only if (b)/fee is ever wanted |
| 4 | ITM funding | Today: OTM formula blindly continued on the buggy arm (un-designed). Natural extension: log-slope read on the extended curve — OTM puts unchanged, continuous at seam, deep-ITM = perp-futures delta-carry; rejected alt (slope-ratio vs extended anchor) → funding-free ITM leverage arb | **YES — funding semantics** (incl. call-side (g+1)/g recalibration) |
| 5 | unification | COHERES as PKG-ITM v2: one per-wing tangent-extended value curve, everything a read/walk of it; ship-gated on O1–O7 + G-X/G-F; vault/communal split honestly outside it | adopt as part-2 architecture vs piecemeal |

**Recommendation:** adopt the unification as the PKG-ITM v2 architecture. Sequence: (a) V=max
engine fix → (b) chart-2 true-V rewire + toggle (items 1+2 as one display slice) → (c) doctrine
note for item 3 (no build) → (d) item 4 only after operator funding sign-off. Run the O1–O7 Lean
menu (O1/O2/O5 are small and high-leverage; O3 composes with SnellStaged) before any of this is
promoted past brainstorm into shared truth.

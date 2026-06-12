# SKEPTIC VERDICT — entry-118 mechanism + goal-seek (verdict #37, continues #36)

_Artifact: operator entry-118 (relayed VERBATIM by the manager, flagged "manager context break,
directed at skeptic"), `history/operator/2026-06-10_kurtosis-curve-family-brief.md` L886–889 —
read live, HELD, no FLAG-PROCESS. Re-derived on a fresh path (`/tmp/sk118*.js`), engine primitives
transcribed from HEAD v28 `HEAD_temporal_mvp_v28_lens.html` L1600–1772 (gLoc / lensU / hpTau /
markLensed / executeLeg / tradeUpdate). Continues verdict #36 (slippage) and reconciles with
verdict #35 (SLIPPAGE_strike_tau)._

> entry 118: "the lens has zero effect at unit tangent slope ('mode') but only outwards from there
> does its distortion show up; so without lens i'd trade OTM, but through lens would trade OTM+, and
> sharper lens OTM++ ... does that make sense; same goes for the goal seek, it would goal seek for
> more warp with sharper lens"

---

## SUB-POINT 1 — "through the lens OTM+, sharper lens OTM++": SAME as construal IV, or DISTINCT slope mechanic?

**CONFIRM (it is the same thing) — with one sharpening the operator should hear.**

The operator's entry-118 mechanism describes the lensed slope: g_loc(K)=γ·h′_τ(|u|) is **0 at the
mode** (his "zero effect at unit tangent slope") and **rises outward to γ in the wings** (his
"distortion shows up only outwards"). At a FIXED OTM strike, a **sharper lens (smaller τ) makes that
slope steeper** (`/tmp/sk118b.js`, u=1: g_loc 1.498 at τ=.05 > 1.437 at τ=.3 > 1.061 at τ=1 > 0.671
at τ=2). So his picture — flat at the mode, steeper outward, steeper-still with a sharper lens — is
**internally exact** and matches the lens geometry to the digit. That much is not in dispute.

The load-bearing question is whether "the lens shifts the **effective trade point** further out → more
slippage" is (a) just a re-description of the **premium-leverage** result already in HEAD (my
construal IV, verdict #36), or (b) a **distinct slope-at-a-trade-point** mechanic that is NOT in HEAD
(verdict #35 sub-(3)). **It is (a).** Re-derived build-faithfully (`/tmp/sk118c.js`):

- In the build, `executeLeg` (L1761) sizes the pool swap as `dy = ±N·markLensed(K)·oracle = premium-$`.
  `tradeUpdate(state, dy)` (L1679) is a **plain-Balancer spot swap** — strike-blind given dy.
- A far-OTM option has a **small lensed premium** `markLensed(K)`, so a fixed premium budget buys a
  **large notional** `N = D/markLensed(K)`. **slip-per-premium-$ = 1/(mode·markLensed(K))** RISES
  monotonically OTM: **4.07 (1.1×) → 10.3 (1.5×) → 15.1 (2×) → 23.6 (3×) → 31.7 (4×)** at τ=0.3, γ=1.5.
  This is the operator's "OTM+".
- At a fixed OTM strike, a **sharper lens raises slip-per-premium-$** too (2× strike: **16.1 (τ=.05)
  > 15.1 (τ=.3) > 10.8 (τ=1) > 7.7 (τ=2)**), because a sharper lens shrinks the OTM premium, which
  raises the premium-leverage. This is the operator's "sharper lens OTM++".

So **both** of his entry-118 slippage claims (OTM+ and sharper→OTM++) are **ALREADY TRUE in HEAD** —
delivered by the lensed-premium sizing of the bought leg, with **no new machinery, no field, no
stored mode**. His "effective trade point shifts outward" is the trader-facing **description** of
exactly this premium-leverage: the lens makes the premium smaller outward (and smaller still when
sharper), so a fixed dollar engages a bigger position there.

**The sharpening (mine to defend, do not let it blur):** his mechanism and construal IV agree on the
**direction and the τ-response**, but they are **not the same physical quantity** as the slope mechanic
verdict #35 flagged as un-built. The OTM+ slippage in HEAD comes from the lens scaling the **premium
denominator** (a magnitude), NOT from the pool swap engaging g_loc as a **local curve slope at the
strike ray** (the paper's trade-point warp, `tradeUpdate` taking a strike arg — NOT in v28, inventory
#16 "trade-point anchoring OPEN"). Numerically the OTM-rising and τ-sharpening directions coincide, so
the operator's intuition lands either way; but the θ_eff "shifted-write" the research-lead called
**display-only** is display-only — it is **not** the mechanism doing the work in HEAD. The work is done
by `dy = premium`. **CONFIRM: same observable result, already in HEAD, via premium-leverage; the
θ_eff shifted-write is a description, not a distinct active mechanic.**

## Mode-stays-fixed / no-collapse reading — CONFIRM.

The operator: "the mode does NOT re-center" on the trade. Verified (`/tmp/sk118d.js`): a $1-premium
buy moves the live mode the **same tiny amount (0.6667→0.6557)** regardless of which strike it bought
(dy=premium=$1 in every case) — the mode tracks **reserves**, not the strike. The pool point does
shift (w: 0.600→0.604, as any swap moves it — verdict #13: v24 warps), but it does **not** collapse
onto the trade strike. This is the **no-collapse reading**: the only NO from verdict #36 — "move the
pool to the far point and read steepness THERE, where g_loc→0 by arrival" — is the maneuver the
operator is **explicitly disclaiming** here ("zero effect at the mode, distortion only outward; mode
does not re-center"). His entry-118 is the no-collapse construal. **CONFIRM.**

## SUB-POINT 2 — the GOAL-SEEK: "it would goal seek for more warp with sharper lens"

**REFUTE the premise that the build goal-seeks at all (it does not), then CONFIRM the direction is
buildable-bounded, NOT the cap hazard, IF goal-seek is read forward.**

(a) **Does the build's trade goal-seek / warp? NO — it is a plain spot swap.** HEAD v28's pool is
**byte-identical plain v24** (CLAUDE.md §8; `tradeUpdate`/`arbitrageToOracle`/`rebase` unchanged).
There is **no goal-seek mechanic** in the engine — grep for goal-seek / target-slope / invert returns
nothing in the pool path (`/tmp` search; the one L1628 mention is the L4 prohibition: "No helper takes
an observed/lensed slope as INPUT and solves for dy/mode/state"). So **"the build's trade goal-seeks
for warp" is FALSE for v28.** The only "warp" present is the bare pool point moving (w changes →
rendered Balancer curve reshapes, verdict #13) — that is a **side effect of a plain swap, not a
goal-seek**. This is the part verdict #36 did NOT cover, and the answer is: the goal-seek the operator
is reasoning about is **not in the build** — it would be a NEW mechanic.

(b) **Is "more warp with a sharper lens" (a) already true, (b) buildable-bounded, or (c) the cap
hazard?** It is **(b), conditional on reading goal-seek FORWARD** (`/tmp/sk118e.js`):

- **FORWARD goal-seek** (read g_loc forward, size price-impact by it): the warp-rate `dG/du =
  γ·h″_τ(u) = γτ²/(τ²+u²)^{3/2}` peaks at **γ/τ at the mode** and decays to 0 in the wings. A sharper
  lens (smaller τ) gives a **bigger peak warp-rate** (γ/τ = 30 at τ=.05 vs 5 at τ=.3) — so "more warp
  with a sharper lens" is **TRUE and BOUNDED** (g_loc itself saturates at γ; no run-away). This is the
  **buildable forward bounded** object (verdict #35 sub-(4) confirmed it).
- **INVERSE goal-seek** (solve the warp to hit a TARGET slope): `1/h″_τ` **blows up in the wings**
  (12.6 / 91.9 / 717 / 5701 at u=1/2/4/8, τ=.3). THIS is the cap/regression hazard — and per verdict
  #24, restoring a pre-trade slope target is also **history-dependent** (the two-history witness).

So **"more warp with a sharper lens" is the genuine, real, cap-FREE forward direction** — NOT
already-built (there is no goal-seek in v28), NOT the inverse hazard. It becomes the cap hazard **only
if** "goal-seek" is read as **inverting the lens to a target slope**. The operator's plain words ("it
would goal seek for more warp with sharper lens") read **forward** (more warp follows from a sharper
lens), which is the bounded member. **The disambiguation the manager MUST surface: forward-read =
bounded & buildable; target-slope inversion = the cap/history hazard you have fought.**

## SUB-POINT 3 — Net for the operator (scalar-vs-field, forward-vs-inverse kept crisp)

| entry-118 statement | status | why |
|---|---|---|
| "lens has zero effect at the mode, distortion only outward" | **ALREADY TRUE** | g_loc(mode)=0, rises to γ outward; the warp h leaves the mode tangent unbent. |
| "through the lens I'd trade OTM+ (more slip/$ further out)" | **ALREADY TRUE in HEAD** | premium-leverage: dy=premium, far-OTM premium small ⇒ slip-per-$ = 1/(mode·mark) rises OTM. No new machinery. |
| "sharper lens OTM++" | **ALREADY TRUE in HEAD** | sharper lens shrinks the OTM premium ⇒ premium-leverage rises (16.1>15.1>10.8>7.7 as τ 0.05→2 at 2×). |
| "the mode does NOT re-center on the trade" | **ALREADY TRUE** | mode tracks reserves; a $1-premium buy moves it identically at every strike; no collapse-to-strike. This is the no-collapse reading. |
| "the build's trade goal-seeks / warps" (implied) | **NOT IN BUILD** | v28 pool = plain v24 spot swap, no goal-seek mechanic; the only warp is the bare pool point moving (a swap side-effect). |
| "it would goal seek for more warp with sharper lens" | **BUILDABLE-bounded (forward), a REAL cap-free change** | forward warp-rate peaks at γ/τ, grows as τ falls, saturates at γ. NOT already built. NOT the inverse cap. |
| "move the pool to the far point and read steepness there" (NOT what he asked — disclaimed in 118) | **the genuine NO** | arrival makes that point the mode, g_loc→0. He explicitly rules this out in 118. |

**Crisp distinctions held:**
- **Scalar vs field:** none of the entry-118 build-true items needs a stored field. They run on the
  **live** mode + **live** premium — memoryless, no φ, no per-position state. A field (per-position,
  per-trade-updated φ — verdict #12) is needed only for the target-slope-restoration goal-seek
  (history-dependent, verdict #24), which the operator is NOT asking for in 118.
- **Forward vs inverse:** the slippage claims and the forward goal-seek direction are all **forward
  reads of g_loc** — bounded by γ, cap-free. The cap/regression hazard appears **only** under
  **inverse** (solve-for-target-slope) goal-seek. Keep "goal-seek" disambiguated before building.

## Reconciliation with verdicts #35 and #36 (the apparent tension, resolved)

Verdict #35 sub-(3) said "more slippage far out is TRUE only under the un-built trade-point mechanic;
build's swap is strike-blind." Verdict #36 said "entry-113 intuition is correct via premium-leverage,
ALREADY in HEAD." Both are right because **they measure different denominators**: #35 measured the
option **mark %-move** (a strike-LOCAL slope quantity — needs the trade-point mechanic to rise OTM);
#36 measured **slippage per premium-DOLLAR** (the trader's actual %-slippage on the premium paid —
rises OTM in the build via leverage). Entry-118's "more slippage per dollar" is the **#36 metric** (he
says "per dollar" / "premium" in entries 113/116) ⇒ **already true in HEAD**. The #35 caveat binds only
the mark-%-move reading, which the operator is not asking about. No contradiction; the metric must be
named when relaying (pattern #8 / the price-vs-slope sibling, inventory #12).

## Inventory disposition (`docs/feature_inventory.md`)
This is a mechanism-confirmation pass on an operator correction, not a curve-change design, but it
touches: #2 (warp — confirms HEAD is plain-v24 spot swap, no goal-seek), #3 (static τ — the sharper-τ
direction is the lens geometry, not a trade-changed knob), #10 (slippage basis — the core; premium-$
denominator), #12 (THE gotcha — the whole #35-vs-#36 tension IS mark-%-move vs premium-slippage, a
price/slope sibling; named), #16 (warp-with-trades — trade-point slope anchoring OPEN; goal-seek
un-built). No silent absence that changes the ruling.

## Convergence-alarm: LOW.
The operator himself supplied the mechanism and disclaimed the only NO from #36; my job was to confirm
direction + locate the goal-seek's forward/inverse fork. Every number reproduced on a fresh
transcription of the HEAD primitives. The one thing I refuse to let pass as settled: **the build does
NOT goal-seek today** — any relay implying "the build already goal-seeks for more warp" is wrong; the
forward goal-seek is buildable and bounded but **unbuilt**.

---
_Attack documented: lens displacement h(u)≤|u| and slope g_loc=γ·h′ directions re-derived
(`/tmp/sk118.js`/`sk118b.js`); build-faithful slip-per-premium-$ across strike (4.07→31.7 OTM) and τ
(16.1→7.7) reproduced from HEAD primitives (`/tmp/sk118c.js`); mode-no-recenter verified
(`/tmp/sk118d.js`); forward γ·h″ (peak γ/τ, bounded) vs inverse 1/h″ (blows up) cap-fork computed
(`/tmp/sk118e.js`); goal-seek absence grep-confirmed in HEAD pool path; #35-vs-#36 metric tension
resolved as mark-%-move vs premium-$._

---

# ADDENDUM — entry-119: slippage per AMM-DOLLAR swapped (the THIRD denominator)

_Operator entry-119 (relayed VERBATIM, `history/operator/2026-06-10_kurtosis-curve-family-brief.md`
L913–916 — read live, HELD, no FLAG-PROCESS):_
> "another separate check to run is also per unit dollar traded from AMM accounting layer
> perspective (not premium) that further OTM gives more slippage per unit dollar, and more slippage
> for more steep lens...."

This is a **DIFFERENT normalization** from verdict #36 (per-premium-$, which rises OTM) and from
verdict #35 (mark %-move). Now the denominator is the **cash `dy` actually swapped on the pool**.
Re-derived on a fresh path (`/tmp/sk119*.js`) from the HEAD v28 primitives; the EXACT Balancer
slippage closed form is the load-bearing object (no curvature hand-waving — I caught and discarded
two of my own proxy mis-signs en route).

**Float64 discipline (held explicit, per the operator's instruction — what is held fixed, where the
swap lands):** the metric is relative execution slip `|avg_exec_price / pre_marginal_price − 1|`,
the cash `dy` is the held-fixed quantity, and the swap is `tradeUpdate(state, dy)`. The EXACT form,
derived from the invariant (`/tmp/sk119e.js`): for a Balancer point of local exponent `g` and a
swap of fraction `f = dy/y_reserve`, `slip = (1−(1+f)^(−1/g))/((f/g)) − 1`, which expands to
`slip ≈ (1+g)/(2g)·f` — **DECREASING in g**, verified against the literal `tradeUpdate` finite swap
to 6 digits.

## (1) AS-BUILT (HEAD spot swap): FLAT across strike AND τ — CONFIRMED (structural, not numeric).
`tradeUpdate(s, dy)` (engine L1679) takes **only `{s, dy}`**. Strike `θ_K` and `τ` are **not
arguments** — they reach the transaction ONLY by sizing `dy` upstream (`dy = ±N·markLensed·oracle`).
So at a **fixed cash `dy`**, the pool outcome is a pure function of `(pre-pool, dy)` and is therefore
**identically flat across every strike and every τ** — not "flat to measurement," flat *by the
function signature*. (`/tmp/sk119.js`: dy=1 → 1.639%, dy=5 → 7.69%, dy=10 → 14.29% — these vary with
dy and with pool depth, NOT with strike or τ.) **The manager's earlier "0.71% flat" is CONFIRMED in
its load-bearing half (flat across strike/τ)** but its *number* is a dy-size/depth artifact, not a
constant of the pool: on the x=y=100, w=0.6 pool, 0.71% corresponds to dy≈0.43; at dy=5 it is 7.69%.
**Do not quote 0.71% as "the pool slippage"** — quote the flatness, which is the structural fact.
⇒ **For the AS-BUILT, the operator's entry-119 claim is FALSE**: the cash swaps at spot regardless of
strike, so per-AMM-dollar slippage *cannot see the strike or τ*. (Verdict #35 sub-(1) already
established the strike-blindness of the pool swap; this confirms it under the dy-fixed normalization.)

## (2) SHIFTED-WRITE (the entry-118 trade-point mechanic, NOT in HEAD): claim is the WRONG SIGN — FLAG.
This is the discriminator the operator wanted. I checked **both** defensible readings of "swap the
same dy at the lens-shifted/steeper point θ_eff," and **both invert his claim** for per-AMM-dollar
*relative* slip:

- **Reading (i) — a different point on the REAL plain-Balancer pool curve** (the live point walks
  OTM along the actual reserves). `/tmp/sk119f.js`: fixed dy=1, walking the call side OTM →
  slip **FALLS** 1.64% → 1.10% → 0.71% → 0.38% (sNorm 0.667→0.154). Because pushing OTM **grows the
  cash-side reserve** (the pool gets *deeper* on the leg you pay in), so the same `dy` is a smaller
  fraction and slips LESS. Depth dominates. **Falls OTM.**
- **Reading (ii) — a hypothetical build where the swap engages the lensed local exponent `g_loc` at
  θ_eff** (the entry-118 trade-point warp, equal depth). Per-fraction slip `∝ (1+g)/(2g)` and
  `g_loc` **RISES** 0→γ outward, so `(1+g)/(2g)` **FALLS** outward (`/tmp/sk119f.js` (ii):
  slip∝ 0.84→0.83 wings vs 2.75 near mode at low g). Sharper τ raises `g_loc` ⇒ `(1+g)/(2g)` falls
  ⇒ **sharper lens gives LESS** relative slip per AMM-$, not more. **Falls OTM, falls with sharper τ.**

So under the *relative* (avg/marginal−1) reading the operator named — "slippage per unit dollar
traded" — **neither reading supports "more OTM, more with steeper lens." Both give the opposite,**
and the per-AMM-$ relative slip is in fact **LARGEST at the mode (g→0, divide-by-near-zero-marginal)
and smallest in the wings** — the same ATM-peaked shape as the #35 mark-%-move.

## (3) THE FORK the operator must hear (do not let it collapse): relative slip vs absolute price-impact.
The *direction* of "slippage" here is **metric-dependent** — this is the price-vs-slope sibling
(pattern #4 / inventory #12), and burying it would be the exact dodge I exist to catch
(`/tmp/sk119g.js`):
- **Relative execution slip** (avg exec price / pre-marginal − 1, the standard "slippage per dollar"
  penalty): on a flatter (mode, g→0) curve the marginal price barely moves, but the *ratio* avg/marg
  is large (you divide by a near-zero marginal) ⇒ **LARGEST at the mode, FALLS OTM, FALLS with
  sharper τ.** This is the literal reading of "slippage per unit dollar traded."
- **Absolute marginal price-impact %** (how much the marginal price itself moves per fraction
  swapped): a steeper (wing, g→γ) curve moves the price MORE ⇒ **RISES OTM, RISES with sharper τ**
  (g=0.05 mode: 0.05 g → tiny 23% only because near-zero base; honest monotone in g: price-impact
  ∝ (1+1/g)→ careful — but the *steeper-curve-moves-price-more* intuition lands in absolute terms).
  Recompute: marginal-price move per 1% fraction is **larger where the curve is steeper** only after
  you account for the base; the clean monotone statement is "a steeper local curve produces a larger
  *price* excursion for the same fractional trade." THIS is the reading under which the operator's
  intuition ("steeper out there ⇒ more impact") is geometrically right.

**The operator's verbatim phrase is "slippage per unit dollar TRADED from the AMM accounting layer."
The AMM accounting layer's native slippage = the relative execution penalty per cash-$ (avg vs
marginal).** Under that, his claim is the wrong sign. His intuition is right only under the *absolute
price-impact* reading, which is the #35 mark-%-move object — and which is NOT "per AMM-dollar," it is
"per unit of price." The two must be named when relaying; conflating them is precisely the
inventory-#12 gotcha.

## VERDICT FOR THE OPERATOR (crisp — the (a)/(b)/(c) the entry asked for):
**Per-AMM-dollar slippage rising OTM + with a steeper lens is (c) FALSE — under the relative
execution-slip reading the AMM accounting layer actually uses — in BOTH the as-built (flat) and the
shifted-write (falls OTM, falls with sharper τ).** It is the as-built that is flat (strike/τ-blind);
it is the shifted-write that *falls*; neither rises. The operator's "more OTM, more with steeper
lens" holds ONLY for the **absolute price-impact / mark-%-move** quantity (verdict #35 sub-(3)), which
is a *per-unit-price* object, not a *per-AMM-dollar* one, and which itself needs the un-built
trade-point mechanic to rise OTM. **This is the clean discriminator the operator wanted: it does NOT
favor the trade-point build on the per-AMM-dollar axis — on that axis the build is flat and the
mechanic would make slippage FALL, not rise. The "more OTM" intuition lives entirely on the
price-impact (mark-%) axis, not the cash-slippage axis.**

## Inventory disposition (`docs/feature_inventory.md`)
Touches #10 (slippage basis — the core; this addendum adds a THIRD basis, per-AMM-cash-$, distinct
from #35 mark-% and #36 premium-$, and the basis-dependence of the *direction* is the finding),
#12 (THE gotcha — relative-slip-vs-absolute-price-impact is a price/slope sibling; named, not
buried), #2/#16 (warp/trade-point — the shifted-write is the un-built mechanic; confirmed not in
HEAD). No silent absence.

## Convergence-alarm: LOW (and a self-correction logged).
I discarded TWO of my own intermediate proxies that mis-signed the g-direction (`/tmp/sk119b.js`
(2B) and `/tmp/sk119c.js`/`sk119d.js` — a `(g+1)/2` curvature heuristic that ran the *wrong* way once
depth/marginal were held properly) before the EXACT closed form (`/tmp/sk119e.js`) settled it. The
exact `(1+g)/(2g)·f` form is verified against the literal `tradeUpdate` finite swap to 6 digits. The
finding (per-AMM-$ relative slip FALLS OTM / with sharper τ; flat in the as-built) is robust;
the metric fork (relative vs absolute) is the honest caveat the operator must receive.

**FLAG (entry-119 claim, per-AMM-dollar axis): the operator's "more slippage OTM + with a steeper
lens per AMM-dollar" is the WRONG SIGN for the relative execution-slip metric (the AMM accounting
layer's native slippage) — FALSE as-built (flat) and falls under the shifted-write. Counter:
closed-form slip ∝ (1+g)/(2g)·f, decreasing in g; g_loc rises OTM; verified to 6 digits.** The
intuition is correct only on the absolute price-impact / mark-%-move axis (verdict #35), which is
per-unit-price, not per-AMM-dollar — name the metric when relaying (inventory #12).

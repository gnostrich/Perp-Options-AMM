# VERDICT — entry-126 mechanic: single-w goal-seek to the LENSED trade-point slope

_skeptic · 2026-06-12 · READ-ONLY · re-derived COLD on fresh scripts (`/tmp/sk126_*.js`) from
HEAD v28 engine source (md5 `7e1ae39b`, gLoc/tradeUpdate L1630–1687). Adjudicates the operator's
entry-126 mechanic (`history/operator/2026-06-10_kurtosis-curve-family-brief.md`) AND re-opens my
own CRUX verdict (`VERDICT_R1_R2_goalseek_warp_CRUX_2026-06-12.md`) against it. Operator on a
clock; no default to "blocked."_

## THE OPERATOR'S EXACT MECHANIC (entry 126, verbatim)
> "you read through the lens, and execute on the balancer curve changing weights to goal seek as
> per the post trade point slope (as seen through lens) — lens is an interpretative layer which
> tells you what to execute on / read from the curve"

Plain decomposition (one sentence): **a trade moves the reserves; you then re-pick the single
global Balancer weight w so that the slope you READ THROUGH THE LENS at the trade ray is back to
its pre-trade value; the write stays on plain Balancer.** This is a 1-D solve for w, NOT a
strike-local curve-bend.

---

## BOTTOM LINE (no hedge)

The operator's entry-126 mechanic is **WELL-POSED and BUILDABLE-bounded** as a 1-D solve — it is
NOT the L4 runaway, it is in-range, single-valued at its intended root, solvent. **My prior CRUX
"BLOCKED (needs the field)" answered a DIFFERENT question** (a strike-LOCAL curve bend, R1) and
should NOT be quoted against entry-126. I say that plainly: the CRUX was the wrong question for
this mechanic.

**BUT** the literal target — "restore the LENSED slope at the trade point" — has a unique
canonical solution **w′ = w₀ (the pre-trade weight), identical for every strike and every τ.**
So the goal-seek puts the global weight back where it started ⇒ the lensed pricing curve (chart 2)
is **unchanged** pre/post ⇒ the warp is **FLAT** (my verdict #39, now re-derived from the lens).
The strike-dependence the operator wants lives in the SLIPPAGE READ, not in a curve reshape.

So: **green light on buildability/boundedness; red flag on what it DELIVERS** — entry-126 literal
is a slope-PEG (held marginal at the trade ray), after which the reserve dot has slid along an
UNCHANGED curve. That is the "dot sliding" the operator's own acceptance test (entry 1) rules out.

---

## 1. Did my CRUX "BLOCKED" answer THIS mechanic? — NO. Different question. (I correct myself.)

My CRUX defined R1 as *"the curve actually warps/bends AT the lens-shifted trade point"* and ruled
it needs a position-dependent weight FIELD because "a scalar cannot make a curve bend at a strike;
only a field can." **That is the answer to a strike-LOCAL curve-bend.** Entry 126 does not ask for
a strike-local bend. It asks for a **single global w** re-chosen so the lensed slope at the trade
ray is restored. A single w IS a scalar; restoring a scalar is a 1-D solve, not a field problem.
**The CRUX's "needs the field" is true of R1 (local bend) and FALSE as a verdict on entry-126
(single-w peg).** Honest correction: I (and the research-lead) adjudicated the local-bend construal,
not the operator's single-w-lensed-peg construal. This matters more than my consistency, so I state
it without hedging: **do not cite the CRUX "BLOCKED" against entry-126.**

## 2. Is entry-126 well-posed and BUILDABLE-bounded? — YES (with one fold caveat)

It is the 1-D solve `find w′ s.t. gLoc(w′; θ_T, τ) = g_pre`, where in the engine
`gLoc(state,θ_K,τ) = (w/(1−w))·h′_τ(|ln(θ_K/mode)|)`, `mode=(1−w)/w` (L1639–1644). Re-derived cold
across {1.5×, 2×, 4×} and τ∈{0.3, 1, 3} (`/tmp/sk126_lenswarp.js`, `/tmp/sk126_identity.js`):
- **Single canonical root, in-range:** w′ stays in (0.5, 1); the solve has exactly one root at the
  intended branch in every non-near-mode case (`#roots=1`). NOT the L4 1/w′ runaway — bounded.
- **Solvent / single-basis:** w∈(0.5,1) ⇒ γ=w/(1−w)>1, reserves finite; price==slope on plain
  Balancer (no e^−ghMu), so the read and write share one basis.
- **FOLD CAVEAT (real, name it):** because gLoc is symmetric in |u|, a trade point NEAR the mode or
  on the ITM side (mult≈0.6–1.1) admits SPURIOUS extra roots — e.g. τ=0.3, mult=0.8 gives roots
  {0.5686, **0.6667**, 0.7415} (`/tmp/sk126_fold.js`). A naive Newton from w_nat can land on the
  wrong root and pick a w′≠w₀ that does NOT restore the slope at other strikes and mis-seats the
  mode. The intended root (w₀) always exists and is the symmetric-canonical one, but a build MUST
  select it explicitly (e.g. continuity from w₀ / the |u|-side that matches the trade), not blind
  root-find. This is a buildability hazard, not a no-go.

So my verdict #39 finding ("even the L4-banned inverse goal-seek is bounded here") is **confirmed
for THIS target**: entry-126 is the bounded inverse, BUILDABLE.

## 3. Does it DELIVER strike-dependence, or collapse? — COLLAPSES to a FLAT warp. (#39 reconciled.)

**Decisive structural fact (`/tmp/sk126_lenswarp.js`):** the required w′ that restores the lensed
slope at the trade point is **w′ = w₀ EXACTLY, for every strike and every τ** — Δw is strike-
INDEPENDENT (constant −0.01754 vs the natural post-trade weight, identical across 1.5×/2×/4× and
τ=0.3/1/3). The warp is **FLAT**, not strike-dependent.

**Why (the structural reason, not a numeric accident):** `gLoc` reads (x,y) ONLY through `w=α/x`
(L1640) — γ=w/(1−w) and mode=(1−w)/w are both pure functions of w; x and y never enter `gLoc`
separately. So the lensed shape is a **one-parameter (w) family at fixed τ**, and "restore any
lensed slope" restores the one parameter ⇒ w′=w₀ ⇒ the WHOLE lensed curve returns to pre-trade.
This is exactly why the warp is flat: there is no second handle for the trade point to grip.

**So under entry-126 literal:** reserves move (the real swap), then w is reset to w₀ (re-weight,
re-writing α,β to hold w=w₀ at the moved reserves) ⇒ chart-2 pricing curve identical, the reserve
DOT slid along an unchanged chart-1 curve. **That is the dot-slide the operator's acceptance test
(entry 1: "trades warp the curve, not a dot sliding") explicitly rejects.** The strike-dependent
reshape he wants (entry 31: "warps MORE further-OTM at same premium") does NOT emerge — confirming
#39 against his expectation. The strike-dependence that DOES exist is in the lensed-slippage READ
(`/tmp/sk126_slippage.js`: dG per unit dy varies by strike/τ) — a legitimate bounded observable,
but a READ, not a curve write.

## 4. L4 status — BANNABLE-BUT-SAFE; no hidden blow-up; L4 need not be amended for THIS

The solve inverts a lensed slope to get w — formally the shape L4 bans ("no helper takes an
observed/lensed slope as INPUT and solves for state"). But here it is **bounded** (§2): w∈(0.5,1),
single canonical root, no 1/w′ runaway (the runaway lived in the (W) weight-FIELD's per-strike
inverse, not this single-w solve). So it is *bannable-but-safe*. No hidden blow-up found across the
swept grid. L4 does not need amending to permit entry-126 — but if a build implements the solve, it
must (a) pin the w₀ root past the fold (§2 caveat) and (b) be labeled as what §3 shows it is (a
flat-warp slope-peg), not as inventory #16.

---

## VERDICT BLOCKS

**PASS (entry-126 is BUILDABLE-bounded as posed):** the single-w goal-seek to the lensed
trade-point slope is a well-posed 1-D solve — in-range w∈(0.5,1), unique canonical root, solvent,
single-basis, no runaway. Attacked across {1.5×,2×,4×}×{τ=0.3,1,3}; bound held. The L4 inverse is
bounded here, not banned-by-blow-up. (Buildability caveat: the near-mode/ITM fold admits spurious
roots — the build must select the w₀ branch explicitly.)

**FLAG-OMISSION → self-correction on my own CRUX:** my CRUX "BLOCKED (needs the field)" answered
the strike-LOCAL curve-bend construal (R1), NOT entry-126's single-w lensed-peg. The CRUX must not
be cited as a block on entry-126. The research-lead's R1-BLOCKED (and its BLOCKER-A mode-collapse
reason) is doubly off-target for this mechanic. **The operator's gaslighting grievance is
substantiated to this extent: the team tested the local-bend / move-the-pool construals, not the
single-w-lensed-peg he actually stated.**

**FLAG-WRONG → on the EXPECTATION, not the buildability:** the operator's expectation that the
entry-126 goal-seek yields a STRIKE-DEPENDENT curve warp is broken by re-derivation — the unique
solution is w′=w₀ for ALL strikes/τ ⇒ the lensed curve is unchanged ⇒ FLAT warp ⇒ the post-state
is a reserve dot slid along an unchanged curve (the dot-slide his acceptance test rejects). This is
#39 re-derived from the lens, and it is a structural consequence of gLoc being a one-parameter (w)
family. Not a build bug — a property of "restore a single-parameter shape's slope."

## What the operator must hear (plain English, decisive)

1. **Your mechanic as you stated it is buildable and won't blow up** — it's a one-number solve for
   the Balancer weight, bounded and solvent. The team's earlier "blocked, needs the other curve"
   was answering a different question (making the curve bend locally at the strike), not your
   single-weight-through-the-lens version. Your grievance is fair on that point.
2. **But it does not warp the curve.** Restoring the lensed slope at the trade point forces the
   weight back to exactly where it started — for every strike and every kurtosis setting the same.
   So after the trade-and-goal-seek, the pricing curve is unchanged and the reserve point has slid
   along it. That is the "dot sliding" your own acceptance test rules out. The strike-dependence you
   want shows up only in how much SLIPPAGE the trade reads through the lens — not as a reshaped curve.
3. **Why:** the lens shape is controlled by a single number (the weight). Holding any slope of a
   one-number shape pins that one number — there's no second handle for a trade to grip and bend the
   curve differently at one strike. A curve that bends differently per strike needs a per-position
   weight (the demoted field curve) — but that is a separate choice, and it is YOURS, not a "blocked."

_Scripts (fresh, mine): `/tmp/sk126_setup.js`, `/tmp/sk126_derive.js`, `/tmp/sk126_warp.js`,
`/tmp/sk126_lenswarp.js`, `/tmp/sk126_identity.js`, `/tmp/sk126_fold.js`, `/tmp/sk126_deliver.js`,
`/tmp/sk126_slippage.js`. Reproduced byte-exact: raw slope 2.0→2.347 under α,β-conserving trade
(engine ≠ slope-conserving); w′=w₀ restores gLoc at all θ_T identically (Δw_extra const −0.01754);
fold roots {0.5686,0.6667,0.7415} at τ=0.3,mult=0.8. Disagreement with my own CRUX goes to the
operator unreconciled — the CRUX was the wrong question._

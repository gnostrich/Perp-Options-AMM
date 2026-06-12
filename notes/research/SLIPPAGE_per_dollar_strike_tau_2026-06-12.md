# Slippage per dollar vs strike & kurtosis — settling entry 113 (and entries 112/110/109)

_2026-06-12 · research-lead · READ-ONLY derivation, no engine edit, no git, no Aristotle._
_Build audited: `engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 `7e1ae39b`)._
_Scripts (node float64, primitives transcribed verbatim from the build, lines 1600–1772):_
_`/tmp/q113_setup.js`, `/tmp/q1_table.js`, `/tmp/q2_strikeblind.js`, `/tmp/q3_tradepoint.js`,_
_`/tmp/q4_blowup.js`, `/tmp/q_adversarial.js`._

## Operator claim (entry 113, verbatim)
> no gang, i think you're wrong -- the goal seek is going to see a steeper slope far out won't it,
> which means more slippage per dollar doesn't it (since the trade for AMM bookkeeping purposes is a
> simple swap isn't it) ...?

Earlier (entry 112): same-$-premium trade → (a) further OTM = more slippage per dollar;
(b) sharper curve (smaller τ) = more slippage.

## The code fact — CONFIRMED exactly as the manager read it
`executeLeg` (line 1761):

```
const p   = legPrice(state, wing, theta_inner, theta_outer, N, tau);  // V = N·markLensed (LENSED)
const V_usd = p.V * oracle;
const dy  = (wingSign * legSign) * V_usd;          // cash delta on the y leg
const post = tradeUpdate(state, dy);               // ← plain Balancer, AT the live state (spot)
```

`tradeUpdate(s, dy)` (line 1679) takes **only** `s` and `dy`. The strike `θ_K` and the kurtosis
knob `τ` enter the whole transaction **solely** through the lensed premium `V` that *sizes* `dy`.
There is **no per-trade goal-seek that visits the strike's slope**; the swap engages the **spot**
marginal, never the strike-ray slope. Verified numerically (`/tmp/q2_strikeblind.js`): at a fixed
`dy`, `tradeUpdate` output is byte-identical for every strike, every τ, every wing — the swap's
realised exec price (1.625) equals the spot-driven value regardless of the strike's `g_loc`
(0.00 / 1.21 / 1.38 / 1.45 at ATM/1.5x/2x/3x).

## Q1 — what does "slippage per dollar" normalise by? (pool w=0.6, γ=1.5, mode sNorm=0.667; |dy|=$5 fixed)

Four candidate metrics, same-dollar-premium trade (|dy| held = $5 across all cells):

| metric | ATM | 1.5x | 2x | 3x | rises further-OTM? | rises with sharper lens (smaller τ)? |
|---|---|---|---|---|---|---|
| (i) **pool slippage %** (exec vs spot marginal) | 8.3333 | 8.3333 | 8.3333 | 8.3333 | **NO — flat** | **NO — flat** |
| (ii) **slippage cost $ ÷ premium-$** | 0.07692 | 0.07692 | 0.07692 | 0.07692 | **NO — flat** | **NO — flat** |
| (iii) slippage cost ÷ notional-exposure $ | 7.7e-2 | 9.6e-3 | 7.2e-3 | 4.8e-3 (τ=.05) | **FALLS OTM** | rises with τ |
| (iv) option-PRICE % move (lensed mark) | 60.98 | 16.57 | 14.17 | 13.50 (τ=.3) | **FALLS OTM** | falls with sharper τ |

(i) and (ii) are **identical across all 16 (strike,τ) cells** — and they are *forced* to be: at fixed
`dy` the pool outcome is a pure function of (pre-pool, dy); strike/τ never reach `tradeUpdate`.
Pool-slip % depends only on pool depth (confirmed 8.33 / 4.55 / 8.93 % across three different pools,
all strike/τ-independent). Float64: the 8.3333% is exact (`5/|dx|/mp − 1 = 0.08333…`).

**"Per dollar" most plausibly = (ii)** (cost ÷ the dollars the operator put in). It is **FLAT**, not
rising. The only metrics with strike structure — (iii) and (iv) — **fall** further OTM (opposite of
the operator's hypothesis), because the premium shrinks OTM so the same $ buys more notional, and the
mark is *most* mode-sensitive at ATM where g→0.

## Q2 — is the operator's MECHANICAL premise true for the build?
**FALSE for the build as-is.** The premise "the goal-seek sees a steeper slope far out" requires the
trade to engage the strike's slope. The build's trade is `tradeUpdate(state, dy)` — a simple swap **at
the live pool point (spot)**. It engages the *spot* curvature only; the strike's (steep, lensed) slope
`g_loc(K)` is computed but used **only to size `dy`**, never to execute. The slippage is the
spot-curvature slippage, **strike-blind and τ-blind at fixed cash**. The operator's own phrase — "the
trade for AMM bookkeeping purposes is a simple swap" — is exactly right, and is precisely *why* it is
strike-blind: a simple swap on a fixed curve at the spot point cannot see a strike that lives elsewhere
on that curve.

## Q3 — is the operator RIGHT for the INTENDED (trade-point) mechanic?
**YES, intuition correct — with one honest caveat (saturation, not divergence).**

If the leg instead executed AT its strike ray (the paper's trade-point warp, entries 1/33/88) the swap
would engage the **lensed local slope there**, `g_loc(K) = γ·h′_τ(|u|)`, `u = ln(θ_K/mode)`. That slope
is exactly the "steeper slope far out" the operator pictures:

g_loc the trade-point goal-seek WOULD see at the strike ray (γ=1.5):

| strike | τ=0.05 | τ=0.3 | τ=1 | τ=2 |
|---|---|---|---|---|
| ATM | 0.000 | 0.000 | 0.000 | 0.000 |
| 1.5x | 1.489 | 1.206 | 0.564 | 0.298 |
| 2x | 1.496 | 1.377 | 0.855 | 0.491 |
| 3x | 1.498 | 1.447 | 1.109 | 0.722 |

- **Hypothesis (a) — further OTM ⇒ steeper slope ⇒ more slippage: TRUE** under the trade-point mechanic.
  g_loc rises monotonically 0 (ATM) → γ (wings) at every τ. A simple swap at a steeper local slope
  slips more per dollar (price-impact ∝ local exponent). The operator's geometry is correct.
- **Hypothesis (b) — sharper lens (smaller τ) ⇒ more slippage: TRUE** under the trade-point mechanic.
  At any fixed OTM strike, g_loc rises as τ falls (e.g. 2x: 0.49→1.50 as τ: 2→0.05). Sharper elbow =
  steeper local slope reached sooner.

**Caveat (state it — do not let it be reported as unbounded):** g_loc **saturates at γ** (because
h′≤1, cap-free by lens design). "Steeper far out" tops out at γ; it does **not** diverge. So the
operator is right about the *direction* but the effect is *bounded by γ*, not runaway.

## Q4 — fork + cap: does delivering "more slippage far out" re-introduce the blow-up?
**Only if you INVERT the lens; a forward-read trade-point swap stays bounded.** Two channels (consistent
with the prior GLOBAL_SKEW / V24_LENS findings):

- The old (W)-curve blow-up came from a **weight field** w(u): gearing `1/w′(u) → ∞` at the frozen wing.
  The v28 lens has **no w(u)** — `g_loc = γ·h′(|u|) ≤ γ` everywhere; its Jacobian `dG/du = γ·h″` is
  **bounded** (max γ/τ at the mode, → 0 in the wings: e.g. τ=0.3, dG/du = 0.68 / 0.12 / 0.016 / 2e-3 …
  at u = 0.5 / 1 / 2 / 4). **Forward → no blow-up, no strike cap.**
- The **inverse** lens 1/h″ **does** blow up in the wings (τ=0.3: 12.6 / 91.9 / 717 / 5701 … at
  u = 1 / 2 / 4 / 8). A trade-point mechanic that *solves for a target slope* (inverts the lens)
  re-introduces the blow-up. A trade-point mechanic that *reads g_loc forward and sizes impact by it*
  stays bounded by γ.

**Bounded path exists:** execute the leg at its strike ray, engage `g_loc(K)` **forward only** (size
the price-impact by the local exponent), never invert the lens to hit a target slope. That delivers
"more slippage far out" (saturating at γ) and "more for a sharper lens," with no far-OTM blow-up and no
strike cap. (This is the L4 "forward-read only" discipline already in the spec.)

## VERDICT (crisp)

| operator hypothesis | in the BUILD as-is | under the TRADE-POINT mechanic |
|---|---|---|
| (a) further OTM ⇒ more slippage per dollar | **FALSE** (flat at fixed premium-$) | **TRUE** (g_loc rises, bounded by γ) |
| (b) sharper lens (smaller τ) ⇒ more slippage | **FALSE** (flat at fixed premium-$) | **TRUE** (g_loc rises as τ falls) |
| "a simple swap sees the steeper slope far out" | **FALSE** — the simple swap runs at **spot**, never the strike ray; strike/τ only size `dy` | **TRUE** — a simple swap **at the strike ray** sees g_loc(K), which is steeper far out |

**The manager's "flat" finding is CORRECT** for the build as-is — and *necessarily* so: at fixed
premium-$ the cash leg `dy` is fixed, and `tradeUpdate` is a pure function of (pool, dy) with strike/τ
nowhere in its arguments. No honest "per-dollar" metric in the build-as-is rises further OTM
(the two that have strike structure, (iii)/(iv), *fall*). No counterexample found.

**The operator is right about the MECHANIC THEY HAVE IN MIND** (a simple swap *at the trade point*
slips more far out, and more for a sharper lens) — but the build does the **spot** swap instead, so
that strike-dependence is not present today. The gap is exactly the build-vs-paper trade mechanic
(spot-swap vs trade-point warp), the same A-vs-B / trade-point object the operator has been circling
(entries 31/33/88). Whether to move the build to the trade-point mechanic is **operator-tier** (a
trade-mechanics / curve-object decision, not a research call) — flagged, not decided.

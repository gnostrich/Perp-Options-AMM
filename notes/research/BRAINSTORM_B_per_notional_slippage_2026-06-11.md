# BRAINSTORM — "B": slippage is the SAME curve-warp principle, the SAME per unit notional as a spot trade

_research-lead, 2026-06-11. Operator **entry 39**. **BRAINSTORM-GRADE, not a build spec, not an
authorization.** READ-ONLY: no engine edit, no git, no Aristotle submission, no build-file touch
(operator is live-playing HEAD `1eebfcd6`). Builds on the curiosity-B note
`notes/research/CURIOSITY_B_warp_proportional_notional_2026-06-11.md`. Tags `[analytic]`
(closed-form / source-level identity) / `[numeric]` (verified at test params). Engine facts are
read straight off HEAD source (line refs given); the curiosity-B script
`/tmp/curiosityB_explore.js` (node float64, engine fns mirror HEAD byte-for-byte) backs the
numeric warp tables and is transcribed at the end of THAT note. Manager re-derives; this is
understanding / decision-support, not a decision._

---

## 0. The operator's idea, verbatim (entry 39)

> "my idea with B was that the slippage remains implemented by the same curve warp principle, and
> is the same per unit notional as for a spot trade. does that make sense?"

---

## 1. State it precisely

The principle, made precise, is a **clean two-part claim**:

1. **Mechanism unchanged (same as A):** slippage is still produced by the *curve warp* — a trade
   reshapes the (W) weight-field curve, and the price you get is the curve you moved. There is no
   new slippage object; it is the same reshape mechanic the AMM already uses.
2. **Magnitude is strike-INVARIANT and equals a spot trade's, per unit notional:** the warp (hence
   the slippage) incurred by an option trade of notional `N` at **any** strike `K` is **exactly the
   warp a SPOT trade of notional `N` would incur.** The strike does NOT enter the execution
   slippage at all. The strike enters in **one place only: the option VALUE (the mark)** — i.e. how
   much premium changes hands — never the curve reshape / execution impact.

Formally, on (W), all curve motion flows through `tradeUpdate(state, dy)`, which depends **only on
the single scalar cash leg `dy`** (HEAD line 1723: `tradeUpdate(s, dy)` — strike is never an
argument; the whole reshape `α=x·w`, `β=y·(1−w)`, `w*=1−β/(y+dy)`, `x*=α/w*`, `φ′=u′−z` is a
function of `dy` alone). So "warp = slippage" is a function of `dy` and nothing else. The operator's
B is then exactly the rule:

> **B: size the cash leg by NOTIONAL, not premium** — `dy := N · oracle` for an option trade,
> identical to what a spot trade of `N` units would push onto the `y` leg — and let the strike `K`
> live only in the separate `mark(K)` that prices the premium the trader pays/receives.

This is the **clean separation**: `value = strike-dependent mark`; `slippage = strike-free,
spot-equivalent warp of `N·oracle`.`

---

## 2. The precise construction — and the premium-vs-notional confirm/refute

### 2.1 Confirm the manager's read: YES, it is right, and it is verified at the source level `[analytic]`

The manager's read — that B = sizing the warp by **NOTIONAL** `dy_warp = N·oracle` (the
spot-equivalent cash), at the spot/reserves anchor (G=1), **dropping the premium/mark factor**, and
that this is **NOT** what the live engine does (the engine sizes by **PREMIUM** `mark·N·oracle`) —
is **correct on every point.** Read straight off HEAD `1eebfcd6`:

- **`legPrice(...)` returns `V = N · mark(θ*)`** in asset units (line 1811 barrier; line 1818
  spread via `vsValue(N, m_star, δ)`; the panel even states it, lines 1376–1377:
  `V = N·mark(θ*)·2 sinh δ`). `mark ∈ (0,1]` is the per-contract premium fraction — it FALLS as the
  option goes OTM (`markFrac = min(s/θ, θ/s)`, line 1671).
- **`executeLeg(...)` sets the cash leg to the PREMIUM:** `V_usd = p.V · oracle` (line 1847) and
  **`dy = ±V_usd = ±N·mark·oracle`** (line 1850, comment "cash delta on the pool's y leg"). Then
  `tradeUpdate(state, dy)` (line 1851).

So the live engine's warp is driven by `dy = N·mark·oracle = PREMIUM·oracle`. Because `mark` falls
OTM, **the live engine's slippage-per-notional SHRINKS as the option goes OTM** — exactly the
manager's diagnosis. (This is the same load-bearing engine fact recorded in the 2026-06-10
PREMIUM-WARP note: "warp is a one-to-one fn of premium.")

**B's construction** replaces that one line conceptually: feed `dy := N·oracle` (drop the `mark`
factor) into the *same* `tradeUpdate`. Everything downstream (α/β conservation, the φ-reshape, the
wing-range guard) is untouched — only the cash-leg sizing changes. That is precisely the manager's
"size the warp by NOTIONAL, drop the premium factor."

### 2.2 What is "a spot trade's slippage per notional" on (W) — is it well-defined and the right reference? YES `[analytic]`

A **spot trade** of `N` units of the underlying pushes `dy = N · oracle` onto the `y` leg
(`mark ≡ 1`: no option premium fraction, you're buying/selling the asset itself at the cash value
`N·oracle`). It then runs through the **same** `tradeUpdate(state, dy)` — there is only one swap
primitive on (W) (HEAD line 1723; the engine even aliases `executeCompositeLeg = executeLeg`, line
1860). So "a spot trade's slippage per notional" is:

> the warp `|Δφ| = z0(dy)` produced by `dy = N·oracle`, divided by `N`,

evaluated at the **spot/reserves anchor** (where the gearing `G = w′(u_spot)/w′(u_spot) = 1`
identically — curiosity-B §1). It is **well-defined** (single-valued, no strike argument), it is
**strictly monotone in size** (z0 monotone in `dy`, curiosity-B §1.3), and it is the **right
reference** because it is literally the curve's own response to a cash flow of `N·oracle` — the
canonical "impact of moving `N·oracle` of value through the pool." An option leg of notional `N`,
under B, gets *that same* warp. So "same per unit notional as a spot trade" is not an analogy on
(W) — it is the *identity* `dy_option = dy_spot = N·oracle`, the same function evaluated at the same
argument.

**One honest subtlety on "per unit notional":** z0(dy) is **monotone but not linear** in `dy` (it is
the field inversion `z0 = t·τ/√(1−t²)`, `t=(w*−w_mid)/(Δw/2)`, `w*=1−β/(y+dy)` — convex toward the
wing). So "the same *per unit* notional" holds in the sense **"same `dy` ⇒ same warp, regardless of
strike"** (the strike-invariance is exact and is the operator's actual point), but the marginal
slippage per extra unit grows with trade size for a spot trade too — that is ordinary AMM convex
impact and is shared by the spot reference, so the equality with the spot trade is preserved. The
"per unit" is a *strike-invariance* statement, not a *linearity* statement; both readings make B
equal to the spot trade.

### 2.3 The one-line construction

> **B = feed `dy := N·oracle` (notional·spot, NOT `N·mark·oracle`) into the existing
> spot-anchored `tradeUpdate`; the strike `K` enters only `mark(K)` (the premium), never the
> warp.** ⇒ `|Δφ| = z0(N·oracle)`, strike-free, = the spot trade's warp.

---

## 3. Does it cohere — the value/slippage separation? YES, and it is a recognizable market design

B **cleanly splits** the two things an option trade does:

| channel | depends on | object |
|---|---|---|
| **VALUE / mark** | strike `K`, moneyness | `mark(θ*) ∈ (0,1]` — the premium fraction; this is the option's price |
| **SLIPPAGE / warp** | notional `N` only | `z0(N·oracle)` — strike-free, spot-equivalent curve reshape |

This is a **recognizable and sound** design. It is the **"execution venue vs. pricing oracle"**
separation: the AMM is a *settlement / liquidity* layer that charges impact by *how much value moves*
(volume), and a separate *pricing* layer marks the option by moneyness. A trader buying a deep-OTM
call pays a small premium (`mark` small) but, if they move a large notional, eats the same impact as
moving that notional of spot — "a contract is a contract; impact is by size." It matches the classic
**constant-product / linear-impact AMM** intuition (impact ∝ size, price-level-blind) and the way
most real venues separate *mark* (the fair value) from *slippage* (execution cost on size).

**Contrast with A (the authorized path):** A is **moneyness-geared** — the slippage is
`z0 · G(K)`, `G(K) = w′(u_spot)/w′(u_tp) ∝ 1/w′(u_tp)`, which **diverges** as the trade point
approaches the frozen wing (`w′→0`). So in A, a deep-OTM trade incurs *vastly* larger slippage than
an ATM trade of the same notional (~14000× at the test band, curiosity-B / entry-37). A's value and
slippage are **entangled through the curve location**; B **disentangles** them. Both are sound,
recognizable objects — they are simply *different products*:

- **A** = "impact ∝ where on the curve you transact" (paper's σ_B trade-point tangent mechanic;
  location-aware; the deeper/cheaper the option, the more it costs to move it on the curve).
- **B** = "impact ∝ size" (spot-equivalent; moneyness-blind; the premium is cheap OTM, the
  execution impact is the same as spot).

B's separation is arguably the **cleaner** market design (it does not let slippage diverge in the
wings); A is the **paper-faithful** one. Which is wanted is the operator's product call.

---

## 4. Self-consistency on (W) — do all the invariants hold under notional-sized spot warp? YES `[numeric]`

Every (W) contract survives B, because B changes **only the cash-leg sizing** (`dy = N·oracle`
instead of `N·mark·oracle`) and feeds it into the *unchanged* `tradeUpdate`. Item by item:

- **α/β conservation:** HELD. The reserves move (`y′=y+dy`, `w*=1−β/y′`, `x*=α/w*`) is the same
  Balancer-identical algebra; it never read the strike. Larger `dy` (B's notional sizing is ≥ the
  premium sizing since `mark ≤ 1`) is just a larger conserving trade. Residual at the reserves point
  0.0 (curiosity-B §2.1).
- **Frozen wings:** HELD. The φ-recenter leaves `w_±` invariant; B does not touch the wing weights.
- **Static τ:** HELD. τ is never written by a trade in either A or B (`tradeUpdate` reads `s.tau`,
  never assigns it).
- **γ > 1:** HELD. γ_± = w_±/(1−w_±) are set by the (clamped, >½) wing weights, untouched by sizing.
- **Bounded / no divergence:** HELD — and **strictly better than A here.** B's slippage is
  `z0(N·oracle)`, which is **finite for all strikes** (no `1/w′(u_tp)` gearing), so B has **none of
  A's frozen-wing slippage blow-up.** B is the *less* divergent design.
- **Wing-range guard:** HELD and **MORE active under B.** Because B sizes by `N·oracle ≥ N·mark·oracle`
  (mark ≤ 1), a given notional pushes a *larger* `dy` than the premium-sized engine, so `w*=1−β/(y+dy)`
  reaches the wing band `(w_−,w_+)` sooner. The guard still fires correctly (curiosity-B §1.3:
  `dy=2.5 → REJECT wing-range`). **This is the one place to flag (not a defect, a calibration
  consequence):** under B a *deep-OTM, large-notional* trade that the current premium-sized engine
  would accept (small `dy` because `mark` tiny) may now be **REJECTED** by the wing guard (large `dy`
  because notional-sized). That is internally consistent — it is exactly "you're moving a full
  notional of value, so you hit the same size cap a spot trade would" — but it changes which trades
  clear. Operator/calibration-tier observation.

**The one thing B gives up (unchanged from curiosity-B, and it is the honest cost):** B does **not**
honor the paper's trade-point tangent σ_B. At K=1.6·mp0 the paper tangent is σ_B=0.254 while B's
post-trade slope at that strike ray is 1.460 — they do not match (curiosity-B §2.1). **B is
self-consistent on (W) but is NOT the paper's trade mechanic** — it is the spot-anchored mechanic.
That is the same trade-off A↔B from the curiosity note: A buys the σ_B tangent (paper-faithful) at
the price of wing-divergent, moneyness-geared slippage; B buys clean, spot-equivalent,
strike-invariant slippage at the price of the σ_B tangent.

> Honest carry (unchanged, true for A and B alike): the `(α,β)`-flow-confinement lemma that
> *certifies* one-global-φ path-independence is `[needs-Aristotle]`, OPEN, numeric-0.0 only. Do not
> report it as proven for either path.

---

## 5. Honest verdict

**YES — the operator's principle makes sense: it is coherent, well-defined, and self-consistent on
(W).** Precisely:

- **Coherent:** the mechanism is still curve-warp (same principle as A); only the *sizing* of the
  warp changes (notional, not premium). It is a clean, recognizable market design — execution
  slippage by size, value/premium by moneyness — the classic linear-impact-AMM + separate-mark
  split.
- **Well-defined:** "a spot trade's slippage per unit notional" is exact on (W) — there is a single
  swap primitive `tradeUpdate(state, dy)`, and B simply feeds it `dy = N·oracle`, the same argument
  a spot trade of `N` produces. Strike-invariance is an algebraic identity (`G≡1` at the spot
  anchor), not an approximation.
- **Self-consistent:** α/β conservation, frozen wings, static τ, γ>1, boundedness, and the
  wing-range guard all hold — and B is in fact *less* divergent than A (no wing slippage blow-up).
- **The manager's premium-vs-notional distinction is correct** and verified at the engine source:
  the live engine sizes the warp by **premium** (`dy = N·mark·oracle`, line 1850), so its
  slippage-per-notional **shrinks OTM**; B drops the `mark` factor (`dy = N·oracle`) to make
  slippage strike-invariant and spot-equivalent.

**Where it has a subtlety / where to be careful (state plainly, none fatal):**
1. **B is the *status quo ante's cousin*, not literally the live engine.** Curiosity-B's headline was
   that the *gearing* `G≡1` matches the live engine (warp at spot, no strike arg). But the live
   engine still sizes by **premium**, so its slippage is *not* strike-invariant per notional — it
   shrinks OTM. **B = spot anchor (already true) + notional sizing (the CHANGE).** So B is a genuine
   change to the live engine's sizing, not a pure revert. (Both A and B differ from the live engine;
   they differ in *opposite directions* — A adds strike gearing, B removes the premium shrink.)
2. **B abandons the paper's σ_B trade-point tangent** — it is self-consistent but not paper-faithful.
   The operator has separately been pursuing A (trade-point anchoring) as the build; B is the
   alternative *product*, not a refinement of A.
3. **"Per unit notional" = strike-invariance, not linearity.** z0(dy) is convex in size (so is the
   spot reference), so the equality with the spot trade is the right reading; just don't read it as
   "linear in N."
4. **Wing-guard rejects more under B** (notional sizing > premium sizing): large-notional deep-OTM
   trades that clear today may be capped — internally consistent, but a behavior change to flag at
   calibration.

**One-line construction (for the operator):** *B = feed the cash leg `dy = N·oracle` (notional·spot,
dropping the premium/mark factor) into the existing spot-anchored warp — so an option trade of
notional N at any strike warps the curve, and slips, exactly like a SPOT trade of N; the strike
shows up only in the premium (mark), never in the slippage.*

**Scope:** purely understanding / decision-support. **Nothing built, submitted, edited, or
committed.** Which mechanic the venue wants (A's moneyness-geared impact vs B's spot-equivalent
impact) is an operator / curve-object product call; the `(α,β)`-flow lemma remains
`[needs-Aristotle]`/OPEN for both. Manager re-derives; manager relays to operator.

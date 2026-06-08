# Temporal Protocol — Formal Specification (the single coherent object)

> Purpose: express the whole loop — AMM, rebase, trade, band open,
> funding, close, payout — as ONE mathematical object: a state space + a
> set of pure transition operators + global invariants over all reachable
> states. Artifact for (a) a Lean autoformalisation run and (b) the
> paper's formal core.
>
> Source of truth: temporal_mvp_v5_for_settlement_work.html (engine
> block) and session_tree_note.md (locked design record, §§9, 12, 13,
> 14). This v2 carries BOTH the engine layer (formulas) and the
> conceptual layer (the two curves, three layers, anchor as first-class).
> A coherent formal object needs every concept grounded in a formula and
> every formula carrying its concept — neither layer may be missing.

---

## 0. Units — the audit (do this FIRST; it is where bugs surface)

Three base dimensions: **U** = US dollars; **B** = the underlying asset
(BTC); **1** = dimensionless. Price is U/B. The protocol works largely in
normalised (dimensionless) space, so every quantity is dimension-tagged.

| symbol | meaning | dim |
|---|---|---|
| `x` | pool underlying reserve | B |
| `y` | pool cash reserve | U |
| `w` | pool weight `= α/x` | 1 |
| `α` | conserved `= x·w` | B |
| `β` | conserved `= y·(1−w)` | U |
| `k` | `x^w·y^(1−w)` — a curve LABEL, not a depth scalar | (RHS, see §2.4) |
| `oracle` | external index price (layer 1) | U/B |
| `poolMark` | the AMM's own mark concept (layer 2) | see §1 |
| `perpMark` | external perp-DEX mark (layer 3) | U/B |
| `sNorm` | pool spot, normalised `= (1−w)/w` | 1 |
| `θ` | strike as ray `= K / oracle_entry` | 1 |
| `K` | strike price | U/B |
| `mark(wing,θ,sNorm)` | barrier value fraction | 1 (∈(0,1]) |
| `N` | leg notional — dimension is open item A1 | (A1) |
| `carvedNotional` | carved perp slice notional | U |
| `carvedEntryEquity` | carved slice equity at carve-time | U |
| `entryPerpMark` | perp mark frozen at carve-time | U/B |
| `attributablePnL` | carved slice P&L since carve | U |
| `carvedEquityAtClosure` | carved slice equity at close | U |
| `L₀` | frozen leverage | 1 |
| `raw_net` | `Y − X`, the settled net | (A1) |
| `trader_payout` | dollars to trader | U |

**0.1 — attributablePnL is dimensionally [U] (fixed form).**
`attributablePnL = carvedNotional·(perpMark_now − entryPerpMark)/entryPerpMark`
= [U]·([U/B]−[U/B])/[U/B] = [U]·1 = [U]. ✓ Adds cleanly to
`carvedEntryEquity` [U]. An earlier defective form omitted `/entryPerpMark`
giving U²/B — a dimensionally inconsistent bug. The Lean spec MUST carry
dimensions so this class of error is rejected at definition time.

**0.2 — payout unit hop / open item A1.**
`trader_payout = L₀·raw_net·carvedEquityAtClosure` type-checks to [U]
ONLY if `raw_net` is dimensionless. `raw_net = Y − X`, with Y, X = `N·mark`
and `mark` dimensionless ⇒ `raw_net` is dimensionless IFF leg `N` is
dimensionless. So a band leg's `N` must be a **fraction of the carved
perp**, NOT absolute B. `carvedNotional` (a different quantity) is [U].
This MUST be pinned — see A1, §6.

---

## 1. FOUNDATION — the two curves, three layers, one ray map

> This section is the conceptual spine. Everything in §§2–4 is grounded
> here. Omitting it would make `mark` and funding bare formulas with no
> meaning — uncheckable for coherence.

### 1.1 The pool curve and the anchor curve — two curves

There are TWO curves in play, always:

- **Pool curve** — the live AMM curve, shape set by the live weight `w`.
  It is the curve the reserves point sits on; it skews under trades.
- **Anchor curve** — the FIXED reference curve, the strike continuum's
  reference frame. It is the `w = ½` symmetric curve in normalised
  oracle space. It does NOT skew with trades; it is the deterministic
  reference. (Code/paper: "anchor".)

Both are level sets of the weighted-product form. The reserves point
lives on the pool curve. The hyperbola `(x−α)(y−β)=αβ` (the trade
trajectory, §2.1) is tangent to the pool curve at the reserves point.

### 1.2 A strike IS a ray on the pool curve

A strike `K` is a **dollar amount** [U/B], frozen at open — that is the
stable thing the contract is about. The strike's **ray** is the ray
from origin to the point on the pool curve where the pool's tangent
slope (marginal price) equals `K`:

    P_K = (x_K, y_K)  on the pool curve, with mp(P_K) = K.
    strike-ray(K, t) = ray from origin through P_K(t).

That ray IS the strike, geometrically. Different strikes live at
different points on the pool curve; each strike has its own ray. The
ray is DERIVED LIVE — recomputed from current pool state on every read,
never stored.

For the engine's existing pricing API (which takes `θ` and `sNorm` as
normalised ratios), the equivalent normalised form is:

    θ(K, t) = K / oracle(t)

— normalised against the *live* oracle. Live oracle is correct (not
frozen entry oracle) because the strike's geometric position is a live
property of the current pool/anchor frame, and the engine compares it
against the live pool sNorm in the same frame.

Stability is at the **dollar level** (`K` locked), NOT at the ray level.
The ray moves as the pool curve moves — which is correct: it expresses
where the frozen dollar strike sits geometrically *right now*, relative
to the live pool curve.

The strike's ITM frontier is the pool's **ATM ray** — not as a different
ray, but as the **parking line** the strike's ray sits against when ITM.
The behaviour:
- **OTM**: the strike's ray lives out on its own wing (a call strike's
  ray above ATM, a put strike's below). It moves with the pool curve.
- **ITM**: the strike's ray **parks at ATM** — does not cross. The pool
  keeps pushing, the ray holds at ATM. Mathematically: `mark` saturates
  to 1, which is exactly the "effective ray clamped at ATM" condition.
- **Un-park**: if the pool reverses, the ray un-parks and slides back
  out onto its own wing.

The strike's ray is therefore **never on the wrong wing** by construction.
The wing-lock guard catches the residual adversarial cases (a mis-tagged
leg, a buggy swap direction); the parking handles the innocent
trajectory.

Consequences:
- Trades move the pool curve (move `(x, y)` along the hyperbola) and
  hence move every strike's ray.
- Rebases scale `α → r·α` (and shift oracle by `r`) — also move the
  pool curve geometrically and hence strike rays.
- Both trades and rebases move rays. The strike's `K` (dollars) stays
  locked through both.
- No caching of strike rays across operations; consumers read fresh
  from current state.

### 1.3 The two-curve cross-reference at the strike's ray — funding

Every strike has two reference points, one on each curve, both reached
via the strike's own ray:

  - **strike-mark** = strike's ray ∩ POOL curve = `P_K` (§1.2). The
    point on the pool curve where pool's tangent slope = `K`. This
    point defines the ray; it is also where the pool *would* sit if
    arbed to `K`. Pool-side reference. Pricing, valuation, regime.
  - **strike-oracle** = strike's ray ∩ ANCHOR curve. The point on the
    anchor curve at the strike's ray. Anchor-side reference. Used ONLY
    by funding.

The **GAP between `strike-mark` and `strike-oracle` IS the funding
signal at that strike**. The ray is shared; the two curves disagree at
that ray (because they're skewed differently); funding measures the
disagreement. Arbitrage closes it.

This is not a side property — it is the mechanism. Funding wouldn't
exist if there were one curve; it wouldn't exist if rays were static;
it wouldn't exist if the curves coincided. The dynamic ray (set by the
strike's geometry on the pool) sweeping the gap between two curves is
what funding measures.

The anchor curve's ONLY role in the option-side machinery is being
"the curve consulted at the strike's ray to produce the funding-
reference half." It does not set rays, does not price, does not decide
regime, does not divide call/put. Pool does all of those.

**The gap is a tether, not just a measurement.** When the strike-mark
(on pool) and the strike-oracle (on anchor) disagree at a strike's
ray, the pool is displaced from the anchor at that ray. The disagree-
ment is the funding signal — *and* it is an arbitrage opportunity. An
arbitrageur trading against the pool to close the gap profits exactly
because of the displacement, and their trade is exactly what restores
the pool toward the anchor at that ray. Funding is the standing gap;
arbitrage is what closes it. So the system isn't just "two curves with
a measured gap" — it is **the pool tethered to the anchor by a funding-
elastic restoring force**: the gap creates incentive, arbitrage
realises closure, equilibrium is `pool arbed to anchor at every ray`
(zero gap everywhere). Two curves are required so the pool can diverge
freely (pricing does its job); the gap is required so closure has an
incentive; arbitrage is required so the incentive becomes motion. Each
piece needs the others.

### 1.4 Three layers — distinct, with distinct jobs

  - **Layer 1 — `oracle`** [U/B]. External index. Defines the anchor
    curve (the `w = ½` symmetric curve at this oracle). Anchor's ROLE:
    the curve consulted at a strike's ray to produce the funding-
    reference half (§1.3). That is its entire job in the option-side
    machinery.
  - **Layer 2 — `pool`**. The live AMM. The pool curve hosts every
    strike's ray (§1.2): a strike IS the point on the pool curve where
    tangent slope = `K`. **Pool drives every option-side mechanic —
    strike rays, pricing, valuation, regime test, wing-lock — all live.**
    The pool's ATM ray (the special ray for `K = oracle`) is the call/
    put divider used by wing-lock.
  - **Layer 3 — `perpMark`** [U/B]. External perp-DEX number. **Used
    only by the carved-slice P&L** (§2.11), because the carved slice IS
    a perp (not an option), and a perp's P&L follows its own price
    feed. MVP-collapsed numerically to oracle. The option-side does
    NOT consume `perpMark` anywhere.

The mechanism rests on layers 1 and 2 being structurally distinct
(their gap at each ray IS funding). Layer 3 is a separate concern
attached only to the carved-perp slice's accounting.

The mechanism rests on layers 1 and 2 being structurally distinct (their
gap IS funding). Layer 3 is a separate concern attached only to the
carved-perp slice's accounting.

### 1.5 Curve shape vs the reserves point

- The pool curve's SHAPE is `w`. Trades change `w` (skew the curve);
  a rebase does NOT change `w` (shape is rebase-invariant).
- The RESERVES POINT slides along the curve. BOTH operators move it: a
  trade drives it cash-side; a rebase drives it oracle-side (`x → r·x`).
  A rebase is a legitimate move of the reserves point along the curve,
  on par with a trade — not a relabelling.

---

## 2. State space and operators

### 2.1 State space

    Σ = ( Pool, oracle, perpMark, Bands )

    Pool   = { x : B, y : U, α : B, β : U }
    oracle : U/B          perpMark : U/B
    Bands  = finite set of Band

    Band = { sold : Leg, bought : Leg,
             entry  : { L₀ : 1, oracle : U/B },
             carved : { carvedNotional : U, carvedEntryEquity : U,
                        entryPerpMark : U/B } }

    Leg = { wing : {call, put},
            K_inner : U/B, K_outer : U/B,    -- strikes (dollars) only;
                                             -- θ is DERIVED live from
                                             -- poolMarkAtATM (§1.2)
            N : (open item A1),
            funding_inner : U, funding_outer : U }

Derived (not stored): `w = α/x`, `sNorm = (1−w)/w`, `k = x^w·y^(1−w)`,
marginal price `mp = α·y²/(β·x²)`, mode-ray slope `= β/α` (the call/put
divider, §2.7). `poolMark` (layer 2) is a derived view of the pool curve.

**Reachability.** A state is reachable iff it is the genesis state `Σ₀`
or the image of a reachable state under an operator in §2. All invariants
in §3 are quantified over reachable states only.

### 2.2 trade(Σ, dy) → Σ′   [dy : U]

Pool update along the conservation hyperbola (Identity IV):

    y′ = y + dy
    Δx = − α·β·dy / [ (y − β)·(y′ − β) ]
    x′ = x + Δx ,   α′ = α ,   β′ = β

Partial: undefined when `(y−β)(y′−β) = 0` or `x′ ≤ 0` or `y′ ≤ 0`.
`oracle, perpMark, Bands` unchanged. A trade is a within-conservation
move (§2.4).

### 2.3 rebase(Σ, r) → Σ′   [r : 1, r > 0]

    x′ = r·x ,  α′ = r·α ,  y′ = y ,  β′ = β
    oracle′ = r·oracle      (a rebase IS an oracle move; r = oracle′/oracle)

`perpMark, Bands` unchanged. `w′ = α′/x′ = w` (weight invariant);
`k′ = r^w·k`. A rebase is a conservation-frame change — it scales `α` by
`r`, breaking LHS conservation by exactly `r` (§2.4).

### 2.4 The keystone — conservation is an LHS fact; k is RHS

Invariant: `x^w·y^(1−w) = k`. LHS = `(x,y,w)`; RHS = `k`.

- CONSERVATION (`α = x·w`, `β = y·(1−w)` each constant) is a statement
  about the LHS ONLY. It holds through a trade IRRESPECTIVE of `k`.
- A TRADE holds LHS conservation ⇒ point confined to the hyperbola
  `(x−α)(y−β)=αβ` ⇒ `k` and `w` move only as dependent readouts.
- A REBASE scales `α → r·α` — the operation that BREAKS LHS conservation,
  by exactly `r`.
- TWO CURVES, TWO LAWS: the curve DRAWN is the level set `{x^w y^(1−w)=k}`
  (an RHS object, shape `w`); the TRAJECTORY is the hyperbola
  `(x−α)(y−β)=αβ` (an LHS object). They are tangent at the reserves
  point (I4).
- `k` alone says nothing without `w`; `k` is a dependent label, never a
  depth/liquidity scalar.

### 2.5 mark(wing, θ, sNorm) → [1]   — pool-curve intersection at ray θ

    mark = (wing = call) ? ( sNorm < θ ? sNorm/θ : 1 )
                         : ( sNorm > θ ? θ/sNorm : 1 )

A barrier value fraction ∈ (0,1], saturating at 1 when ITM. Conceptually
(§1.3): `mark` is where ray `θ` crosses the POOL curve, expressed as a
fraction. It is the layer-2 (poolMark) lookup at ray `θ`.

### 2.6 Composite ray and the spread/leg/band hierarchy

- A LEG on one wing spanning two strikes (a spread) has a **composite
  ray**: `θ* = √(θ_in·θ_out)`, `δ = ½·log(θ_out/θ_in)`.
- **Composite-ray identity (proven, Lean a47ea888 / e0d7f3f7):**
  `N·mark(wing,θ*,sNorm)·2·sinh|δ|  =  N·(mark(θ_in) − mark(θ_out))`.
  The single-query composite form EQUALS the barrier-by-barrier form —
  an identity, not an approximation. Extends across the OTM→ITM boundary
  by effective-strike substitution (`θ_eff = original if OTM, spot if
  ITM`).
- **Cross-wing obstruction (proven):** a whole BAND (two legs, OPPOSITE
  wings) does NOT compose to one ray — a fully-OTM band has value
  `A·s + B/s` and no single ray yields both monomials. So: the composite
  shortcut is valid PER LEG (within one wing), for BOTH valuation and
  transaction; a band is ALWAYS two legs. The distinguishing axis is
  WING, not transact-vs-value.

### 2.7 The mode ray and wing-lock (live trade-side guard)

The **mode ray** is the 45°-tangent ray of the live pool curve —
equivalently `poolMarkAtATM` in price terms, slope `β/α` in raw reserves,
`θ = sNorm` in normalised pool coordinates. It DIVIDES the curve: call
wing is `y/x > β/α`, put wing is `y/x < β/α`.

A leg carries `wing` as a stored tag. Wing-lock (I11) is a **live**
guard at trade-execution time: a swap on a `call`-tagged leg must move
the reserves point in the call-side direction; a swap on a `put`-tagged
leg, put-side; checked against the LIVE pool's mode ray at the moment
of the swap. Anything else → reject.

No frozen entry reference, no `S0`. Strike rays are themselves live
(§1.2), so the natural check is also live. The ITM-parking mechanism
(§2.11) prevents the only innocent route to a wrong-side trade — a leg
going ITM parks at the pool's ATM, does not cross. The wing-lock guard
catches the remaining adversarial cases: a mis-tagged leg, or a buggy
swap-direction calculation.

For visualisation: curve segments and rays are coloured by the live mode
ray (calls above, puts below the 45° tangent of the live pool curve) —
the same live divider, applied to drawing.

### 2.8 openBand(Σ, soldLeg, boughtLeg, club) → Σ′

Both legs priced; bought-leg `N` derived cash-conserving (`V_sell =
V_buy`); wing-membership guard (§2.7) vs `sNorm`; carved slice frozen —
`carvedNotional = f_N·club.totalNotional`, `carvedEntryEquity =
f_N·club.equity`, `entryPerpMark = perpMark` (`f_N` the dimensionless
carve fraction); pool advances by the two leg swaps, which COMPOUND
(same direction — a sold-wing + bought-opposite-wing collar compounds,
does not cancel); new Band added.

### 2.9 accrueFunding(Σ, dt) → Σ′  — the pool-vs-anchor gap, per ray

Funding at a strike is the **pool-curve vs anchor-curve deviation
evaluated at that strike's own ray** (§1.3, §9.3) — never pool-vs-oracle.
The oracle supplies only ONE ray (ATM); the anchor curve supplies a
deviation at EVERY ray, which is what a per-strike funding quantity
requires. Per leg, per strike:

    f = κ · γ · N · mark · (S − 1)/S

where `S` is the pool-vs-anchor ratio AT that leg's ray (the layer-2
intersection over the layer-1 intersection at ray `θ`). `S = 1` ⇔ pool
coincides with anchor at that ray ⇔ zero funding. Accumulates into
`funding_inner / funding_outer`. Pool, oracle, perpMark, bands-set
otherwise unchanged.

### 2.10 closeBand(Σ, band, club) → (Σ′, payout)

Two-case, exhaustive by cross-wing geometry (≤1 leg ITM):
- **Regime test — is the strike's ray parked at ATM, or free on its
  wing?** A strike's ray parks at the pool's ATM when the strike is
  ITM (§1.2) — `mark` saturating to 1 is the math-version of "ray
  clamped at ATM." OTM = ray free on its own wing.
  In the engine's normalised form, with `θ(K, t) = K / oracle(t)` and
  `sNorm = sNorm_pool(t)`:
  call ITM iff `sNorm ≥ θ_inner`  (call ray would have crossed ATM, parks);
  put  ITM iff `sNorm ≤ θ_inner`  (put ray would have crossed ATM, parks).
  Both sides live, both pool-side, no cross-layer reference. Equivalently
  in price terms: call ITM iff pool's current marginal price ≥ `K_inner`;
  put ITM iff ≤ `K_inner`. Non-vacuous, pool-keyed.
  (The CARVED-SLICE P&L below is a separate question, keyed to the
  underlying-price layer — perp mark in production, oracle in the MVP
  — because the carved slice IS a perp, not an option, and a perp's
  P&L follows its mark.)
- **Neither ITM** — both legs reversed on the AMM (one composite-ray
  swap each, legType flipped, wing unchanged).
- **One ITM** — ITM leg settled-to-cash via the unified leg value
  (Job 1, barrier mark capped at 1); OTM leg reversed on the AMM.
  Sequencing: value the settled-to-cash leg BEFORE any AMM swap
  perturbs the pool.
- Wing-lock guard (§2.7) — LIVE pool-mode-ray check at the moment of
  each AMM-reversal swap; no frozen reference.
- `raw_net = Y − X` (Job-1 / reversal values combined).
- `attributablePnL = carvedNotional·(perpMark − entryPerpMark)/entryPerpMark`
- `carvedEquityAtClosure = carvedEntryEquity + attributablePnL`
- `trader_payout = L₀·raw_net·carvedEquityAtClosure`
- `club_delta   = (L₀−1)·raw_net·carvedEquityAtClosure`
- Floor: if `raw_net > 0 ∧ club.equity ≤ 0` then `trader_payout = 0`,
  `club_delta = 0`.
- Band removed from Bands.

### 2.11 The two-jobs model and the three-stage unit chain

Settlement is two jobs: **Job 1** values a leg live in pool/anchor space
(output: carved-perp units); **Job 2** converts to dollars via the carved
equity. The three-stage unit chain:
- stage 1 — bare fraction (`mark` ∈ (0,1]);
- stage 2 — `N·mark` = carved-perp units (`raw_net` lives here);
- stage 3 — dollars, reached by the SINGLE multiply by
  `carvedEquityAtClosure`.
Exactly one stage-2→3 multiply; no double conversion.

### 2.13 liquidity(Σ, λ) → Σ′   [λ : 1, λ > 0]

Pool-level LP: isotropic scaling of the reserves (no per-LP accounting at
this layer). λ > 1 = add; λ < 1 = remove.

    x′ = λ·x ,  y′ = λ·y
    α′ = λ·α ,  β′ = λ·β
    oracle, perpMark, Bands unchanged.

Derived consequences (provable, see §3 I_LP):
- `w′ = α′/x′ = w`           (shape invariant)
- `sNorm′ = sNorm`            (reserves point's curve-relative position
                               unchanged — same place on a bigger curve)
- `β′/α′ = β/α`               (mode ray invariant)
- `mp′ = α′·y′²/(β′·x′²) = mp` (marginal price at the reserves point
                               invariant; INTEGRATED slippage over a
                               subsequent trade is smaller — deeper pool)
- `k′ = λ·k`                  (dependent readout, not a controlled qty)

**Parameterisation note.** `liquidity` is parameterised by a scalar `λ`,
which BAKES IN the proportional-deposit constraint: a single scalar
cannot deposit non-proportionally. A production interface
"deposit `dx, dy`" reduces to `λ = dx/x` (and verifies `dy = λ·y`) — a
WRAPPER, not a core operator. The formal core stays clean.

**Conservation signature — the three-operator family.** The pool is
moved by exactly three operators, each with a distinct signature:
- `trade`     — keeps α, β both fixed         (within-conservation move)
- `rebase`    — scales α by r, β invariant    (anisotropic, x-axis only)
- `liquidity` — scales α and β both by λ       (isotropic, both axes)

These are a complete generating set for pool moves: anything that
modifies `(x, y, α, β)` is a composition of these three.

### 2.12 Slippage (a derived property, not an operator)

Slippage on a trade is the path integral of marginal price
`mp = α·y²/(β·x²)` along the arc the trade sweeps on the pool curve. The
curve is not uniform-curvature, so a trade of a given size starting from
a different reserves point sweeps a different arc and integrates a
different price path. Consequence: a rebase, by moving the reserves point
along the curve, CHANGES the slippage a subsequent trade pays — a real
economic effect, not a relabelling. (Consistent with: trade/rebase
commute on final state but not on slippage; round-trip neutrality is
fixed-frame, a rebase is a frame move.)

---

## 3. Invariants — the theorems to prove (over reachable Σ)

- **I1 — Conservation under trade.** `α′ = α ∧ β′ = β`; reserves point
  stays on `(x−α)(y−β)=αβ`. (LHS fact, §2.4 — holds irrespective of `k`.)
- **I2 — Rebase law.** `w′ = w`, `α′ = r·α`, `β′ = β`, `k′ = r^w·k`.
- **I3 — Trade/rebase commute** on the final state (up to cash-leg
  reframing); explicitly NOT slippage-invariant (§2.12).
- **I4 — Hyperbola/Balancer tangency.** The trajectory hyperbola and the
  drawn level set `x^w·y^(1−w)=k` are tangent at every reachable
  reserves point.
- **I5 — Composite-ray identity.** `N·mark(θ*)·2sinh|δ| = N·(mark(θ_in)
  − mark(θ_out))`, including across the OTM→ITM boundary (§2.6).
- **I6 — Cross-wing obstruction.** A two-leg opposite-wing band does not
  reduce to a single composite ray (§2.6) — a band is always 2 legs.
- **I7 — No costless-collar surplus at symmetry.** collarSurplus(θ,w)=0
  ∀θ ⇔ w = ½.
- **I8 — Round-trip neutrality.** open-then-close at the same Σ returns
  the trader's cash to within fees, over the FULL loop including the
  perp-mark→dollar conversion.
- **I9 — Settlement conservation.** `trader_payout + club_delta` equals
  the band's settled value — no value minted/destroyed beyond the L₀
  leverage transfer (restate precisely). The headline; its DIMENSIONAL
  form (with I12) is what rejects the attributablePnL class of bug.
- **I10 — Frozen-slice integrity.** A band's payout depends ONLY on its
  frozen origin slice and the closing marks — invariant under any trade,
  rebase, funding, or other-band activity between its open and close.
- **I11 — Wing-lock invariant.** At every AMM-swap moment, the swap on
  a leg with tag `wing` keeps the reserves point on `wing`'s side of
  the LIVE pool mode ray (slope `β/α`). Enforced live, never against a
  frozen reference.
- **I12 — Units soundness (meta-invariant).** Every operator output is
  dimensionally consistent; every additive expression adds like
  dimensions, every equality equates like dimensions.
- **I_LP1 — Liquidity invariance.** `liquidity` preserves `w`, `sNorm`,
  the mode ray `β/α`, and the marginal price `mp` at the reserves point.
- **I_LP2 — LP-transparency to open bands.** A band's valuation at any
  time `t` after an LP event depends on `sNorm` not on `λ`; carved-slice
  fields (carvedNotional, carvedEntryEquity, entryPerpMark) are
  untouched by `liquidity`. (Generalises / strengthens I10.)
- **I_LP3 — Three-operator characterisation.** `trade`, `rebase`,
  `liquidity` together form the complete generating set for pool moves;
  any modification of `(x, y, α, β)` is a composition of these three,
  uniquely distinguished by their α/β scaling signatures (§2.13).

---

## 4. Anchor / pool / funding — invariant candidates (later stage)

- **I13 (candidate) — strike-ray stability.** A strike's ray `θ` is
  invariant under rebase (the strike→ray map is anchored, §1.2). Pool
  intersection moves; anchor intersection and `θ` do not.
- **I14 (candidate) — funding zero at coincidence.** `accrueFunding`
  produces zero funding at a ray iff the pool curve and anchor curve
  coincide there (`S = 1`).
- **I15 (candidate) — funding conservation.** Whether funding sums to
  zero across counterparties — flagged, out of scope for runs 1–3.

---

## 5. Flagged assumptions / open items for the formaliser

- **A1 — leg `N` dimension.** Is a band leg's `N` absolute-B or a
  dimensionless fraction-of-carved-perp? The payout chain type-checks
  ONLY under the dimensionless reading. MUST be pinned before I9.
  Highest-priority open item.
- **A2 — three layers distinct.** `oracle`, `poolMark`, `perpMark` are
  three independent symbols (§1.4). The MVP collapses them numerically;
  the formal object MUST keep them distinct or regime-test theorems go
  vacuous.
- **A3 — anchor curve is first-class.** The anchor curve (§1.1) is a
  defined object, not "oracle". `θ`, strike-ray stability, and funding
  all depend on it. Formalise the anchor curve explicitly.
- **A4 — `k` is not depth.** No theorem may treat `k` as a liquidity/
  depth scalar; `k` is a dependent RHS label only (§2.4).
- **A5 — frozen curve frame EXCLUDED.** The viz frame-freezing (note
  §9.2) is a rendering concern, deliberately NOT part of the protocol
  object. Stated here so the exclusion is conscious, not accidental.
- **A6 — staging.** Do NOT attempt I1–I12 in one obligation. Stage:
  - **Run 1** — §1 foundation + state space + `trade`, `rebase`,
    `liquidity` + I1, I2, I3, I4, I12, I_LP1, I_LP3.
  - **Run 2** — `mark`, composite ray + I5, I6, I7 (I5/I7 largely done
    in prior Lean runs — restate/integrate into this object).
  - **Run 3** — `openBand`, `closeBand`, `accrueFunding` + I8, I9, I10,
    I11, I_LP2, and the I13/I14 candidates. I9+I12 = the headline
    dimensional settlement-conservation theorem.

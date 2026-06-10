# Paper warp (continuous slope-matching, at the trade point) vs engine warp (discrete, at spot) — the strike-dependence gap

_research-lead, 2026-06-10. Operator entries 30+31. **READ-ONLY. NO engine edit, NO git, NO Aristotle
submit, NO build file touched.** Engine sandboxed read-only (the `<script id="engine">` block of HEAD
`engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html` run in Node `vm`, float64). The PAPER
(`paper/temporal_paper_draft.md`) is the source of truth here. Manager re-derives + skeptic before this
reaches the operator._

Tags: `[paper-cited]` = quoted/derived from the paper; `[analytic]` = closed-form identity;
`[numeric]` = verified in `/tmp/warp_strikedep.js` + `/tmp/warp_atvsotm.js` against the live engine.

> **HEADLINE.** The operator is **RIGHT about the paper, and right about the cause.** The paper's warp
> is a **continuous (infinitesimal-cash-leg) reshape executed AT THE STRIKE'S TRADE POINT on the curve**,
> and that placement makes the curve-reshape **strike-dependent at equal premium** — *more reshape per
> dollar at further-OTM strikes*, via the local sensitivity `Δw = β·Δy/(y·y′)` which grows as the trade
> point's `y` shrinks toward the wing. The current engine **DROPS this**: `executeLeg` applies
> `tradeUpdate(state, dy)` at the **live reserves point (spot)**, with `dy = premium·oracle` and the
> strike entering *only* the premium — so warp is a function of premium alone and is **strike-independent**
> (entry-30 finding, re-confirmed `[numeric]`). The earlier "#14 premise FAITHFUL" verdict was **correct
> but narrow**: it checked the conserved object, the φ-recenter, and the warp referent — it did **NOT**
> check *where on the curve the swap is anchored*, which is exactly the dropped degree of freedom.

---

## (i) The paper's EXACT warp mechanism + the calculus `[paper-cited]`

### The two-views-one-event reshape (paper §AMM Intuition, lines 33–43)

Line 33 (verbatim): *"Trades skew the AMM curve instead of moving the reserves point along it."*

Line 39 (verbatim, the core): *"For a small trade, if the reserves point were to move along the curve,
we note the slope at the post-trade point; then, instead of moving the reserves point, we reshape the
curve — by updating `x`, `y`, and `w` — so that the slope of that post-trade point is brought to the
pre-trade reserves point."*

Held fixed vs reshaping (paper §Conservation Law + §Trade Formula, lines 73–93):
- **Conserved (held fixed through the trade):** `α = x·w` and `β = y·(1−w)`, individually. These confine
  the reserves point to the **trajectory hyperbola** `(x−α)(y−β)=αβ` (line 77).
- **Reshapes:** the **pricing curve** `x^w·y^(1−w)=k` — its `w` (and `k`) move. `w = α/x` is "the quantity
  the pool's pricing actually moves" (line 89).
- The two curves are **tangent at the reserves point** (line 37) ⇒ pricing-faithful.

### The calculus — and where it lives `[paper-cited]`

The **infinitesimal / continuous** statement the operator names is the **Trade Formula** read as the limit
of small cash legs (paper lines 81–89). Parametrising a swap by its cash leg `Δy`:

```
y′ = y + Δy
Δx = − αβ·Δy / [ (y − β)(y′ − β) ]
Δw = β·Δy / [ y·y′ ]                       ← the curve-reshape, the "warp" amount
```

In the infinitesimal limit (`Δy → dy`, `y′ → y`) this is the **ODE of the reshape**:

```
dw/dy = β / y²                              [analytic]   (the continuous warp rate)
```

i.e. the reshape is integrated continuously along the conservation hyperbola, "not one big transaction"
(operator, entry 31). The paper explicitly reserves a closed-form integration for this — **Annexure
"Derivation of the Continuous Case" (line 286–288): "the closed-form integration of the cash leg along
the conservation hyperbola"** — but that annexure is a **〈PLACEHOLDER, retained from prior draft, not
present in this draft〉**. So the paper *asserts and frames* the continuous case and gives its
differential (`Δw = β·Δy/(y·y′)`), but the body's closed-form integral is a placeholder. The Trade
Formula itself is the load-bearing math, and it is present and exact.

### THE load-bearing placement the engine misses (paper §AMM Intuition line 43, verbatim) `[paper-cited]`

> *"We treat spot swaps as a special case of perpetual-option swaps, which may occur at **any** point on
> the curve … A transaction at any **trade point** on the curve is treated as if that trade point were
> the reserves point."*

And §Mapping Strikes to Ray Angles (line 51): *"A ray intersects the AMM curve at exactly one point; that
intersection is the trade point for the strike."* So a barrier at strike `θ` does its swap **at the trade
point of ray θ** — NOT at spot. The Trade-Formula `y`, `β`, `y′` in `Δw = β·Δy/(y·y′)` are evaluated **at
that ray's trade point**, whose `y`-coordinate differs per strike.

**Pinned (what is fixed, what reshapes, infinitesimally):** through the (continuous) trade, `(α,β)` are
fixed; the reserves/trade point slides infinitesimally along `(x−α)(y−β)=αβ`; `w` (hence the pricing-curve
shape) reshapes at rate `dw/dy = β/y²` evaluated **at the trade point of the leg's strike ray**.

---

## (ii) Does the paper's mechanism give MORE warp further-OTM at EQUAL premium? — YES `[analytic]`+`[numeric]`

### The derivation

Reshape per unit cash leg, from the Trade Formula, at the trade point of strike `θ`:

```
Δw / Δy = β / (y_θ · y′_θ)        →   dw/dy = β / y_θ²        [analytic]
```

`β = y·(1−w)` is the conserved cash-side invariant (a pool constant for the trade). `y_θ` is the **cash
coordinate of the trade point on ray θ**. Going further OTM:
- A **call** at a higher strike sits on a **steeper** ray (higher `y/x`); its trade point has a **larger**
  `y_θ`. ⇒ `dw/dy = β/y_θ²` is **smaller** further OTM on the call wing.
- A **put** at a lower strike sits on a **shallower** ray (lower `y/x`); its trade point has a **smaller**
  `y_θ`. ⇒ `dw/dy = β/y_θ²` is **larger** further OTM on the put wing.

So the *signed* statement is wing-dependent. But the operator's claim is about **reshape magnitude per
premium** — and the decisive point is that **the warp is anchored at the trade point, so it varies by
strike for the same cash leg.** `[numeric]` (`/tmp/warp_atvsotm.js`, applying the SAME cash leg `Δy=0.3`
at the trade point of each strike ray on the live (W) field):

| strike (priced K) | trade-point `u=ln(y/x)` | `w@pt` | curve reshape `Δφ` for the same `Δy=0.3` |
|---|---|---|---|
| 1.5 | −0.0898 | 0.62134 | 0.011122 |
| 2.5 | 0.1243 | 0.68827 | 0.005208 |
| 4.0 | 0.3939 | 0.72956 | −0.066156 |
| 8.0 | 1.0031 | 0.74581 | −1.393009 |

The same cash leg reshapes the curve by **wildly different amounts** depending on which ray's trade point
it is anchored at — the `1/y²` (and, on (W), the `1/(1−t²)` wing-blow-up) sensitivity. **This is the
strike-dependence the operator is pointing at, and it is real in the paper's mechanism** because the swap
is placed at the strike's trade point, not at spot.

### Why continuous-vs-discrete is the *source* — confirming the operator's diagnosis `[analytic]`

The operator's claim: *"calculus was done to calculate this happening infinitesimally continuously … because
of this, the curve warps more at further OTM strikes for same premium."* The mechanism that produces the
strike-dependence is the **anchoring of the (infinitesimal) reshape at the strike's trade point** — the
`dw/dy = β/y_θ²` rate is a *local* (per-ray) quantity. A continuous trade integrates this local rate along
the path the trade point traces *on that ray's neighbourhood of the curve*; a single discrete jump applied
*at spot* (what the engine does) evaluates the rate at one fixed point (spot) and never sees the per-ray
variation. So: **continuous + at-the-trade-point ⇒ strike-dependent; discrete + at-spot ⇒ strike-independent.**
The operator has correctly identified that the distinction is not cosmetic — it is the difference between
evaluating `β/y²` at the leg's own ray vs always at spot.

**Honest caveat on "for same premium" specifically.** The cleanest paper statement is *"same cash leg
`Δy`, different trade point ⇒ different reshape"* (the table above, unambiguous). "Same **premium**" adds a
second strike-dependence: premium `= q·mark`, and `mark` itself falls further OTM (paper line 25). So the
two effects compose, and whether net reshape rises or falls monotonically further OTM depends on the
sizing convention (premium-leg vs notional-leg) AND the wing. The robust, paper-faithful claim is:
**warp is strike-dependent because the swap is anchored at the strike's trade point** — which the engine
flattens to strike-independence. The precise monotonic-in-OTM shape is sizing-convention-dependent (see
flag 2) and should not be over-stated as a clean "always more OTM" without pinning the convention.

---

## (iii) The engine-vs-paper GAP — engine DROPS the at-trade-point anchoring `[numeric]`

### What the engine actually does (HEAD `executeLeg` → `tradeUpdate`)

`executeLeg` (HEAD line 1844) computes the leg premium and then warps **at the live reserves point**:

```
p   = legPrice(state, wing, theta_inner, theta_outer, N);   // V = N·mark(θ)·…  — θ enters HERE only
dy  = (wingSign·legSign) · p.V · oracle;                    // cash leg = premium·oracle
post = tradeUpdate(state, dy);                              // ← state = SPOT reserves; θ is NOT passed
```

`tradeUpdate(s, dy)` (HEAD line 1723) takes **only** the scalar `dy` and the live state `s`. The strike
`theta_inner` is **never an argument to the warp** — it enters solely via `mark` inside the premium `V`.
Therefore `[numeric]` (`/tmp/warp_strikedep.js`): a fixed `dy` produces an **identical** post-trade `φ′`
regardless of strike (φ′ = −0.00307451 at θ=1.2 and at θ=3.0, bit-identical), and for fixed premium the
warp is flat across moneyness. **Warp = f(premium), strike-independent.** This reproduces the entry-30
finding (`WARP_premium_and_spread_shortcut_2026-06-10.md`, CHECK-1).

### Characterising the gap precisely

| | **Paper** | **Engine (HEAD v27)** |
|---|---|---|
| Reshape anchor | the **strike's trade point** on ray θ (line 43) | the **live reserves point** (spot) |
| Trade granularity | **continuous / infinitesimal** `dw/dy=β/y²` integrated along the path (line 39, Annexure placeholder) | **one discrete jump** `Δw = β·Δy/(y·y′)` at spot |
| Cash leg sizing | `Δy` (the swap's cash leg) | `dy = premium·oracle` (`= N·mark·oracle`) |
| Strike enters warp? | **YES** — via `y_θ` at the trade point | **NO** — only via the premium amount |
| Warp at equal premium | **strike-dependent** | **strike-independent (flat)** |

The engine is a **discrete one-shot, evaluated-at-spot approximation** that loses **both** the
path-integral (continuous) character **and** — the load-bearing one — the **per-ray trade-point anchoring**
that is the source of the strike-dependence. The path-integral loss alone is a small numerical error for
small trades (a discrete step vs the integral of a smooth rate); the **trade-point-anchoring loss is the
structural one** — it collapses a per-ray quantity to a single spot value, which is what flattens the
strike-dependence entirely.

### Honest reconcile with the "#14 premise FAITHFUL" verdict

`notes/skeptic/VERDICT_PREMISE_CROSSVERIFY_2026-06-10.md` (skeptic verdict #14) ruled the v27 warp
FAITHFUL. **That verdict was correct on what it checked, and narrow on what it did not.** Precisely:

**What #14 checked (and got right):**
1. **Conserved object** — `(α,β)` and the trajectory hyperbola `(x−α)(y−β)=αβ`: identical to v24/paper
   (TEST 2, residual ≤1.1e-14). ✓
2. **φ-recenter** — the field weight re-seats the curve through the post-trade reserves point; φ is a
   dependent readout, not a second conserved DOF. ✓
3. **Warp referent** — the *rendered pricing curve* (φ-field), not the trajectory, reshapes (TEST `(d)`). ✓
4. **Tangency / pricing-faithfulness** — same algebraic identity (TEST 3). ✓
5. **τ static, wings frozen, skew=φ angle-shift** — matches the operator's role-split. ✓

**What #14 did NOT check (the gap this note finds):**
- **Where on the curve the swap is anchored.** #14 verified the *transformation* `tradeUpdate` performs is
  the faithful field-lift of the paper's reshape — and it is, *as a transformation*. It did **not** check
  that the engine applies that transformation **at the strike's trade point** (paper line 43). The engine
  applies it at spot. So #14 validated the warp's *algebra* and missed the warp's *anchoring*.
- **The continuous / infinitesimal character.** #14 treated each trade as a single conservation step (it
  even flagged the τ→∞ "reduction" as a single-step identity, not a limit). It never tested whether the
  reshape should be the integral of `β/y²` along the path vs a discrete jump.

So #14 is **not wrong** — its "same `(α,β)`, same trajectory, same tangency, φ=angle-shift" conclusions all
hold. It is **too narrow**: it answered "is the per-trade transformation the right object?" (yes) and did
not answer "is the transformation applied at the right point on the curve, continuously?" (no). The
operator's entry-31 question is exactly the second one, and on that the engine **drops the paper's
mechanism.**

---

## (iv) Flags for the operator (via the manager)

1. **CONFIRMED against the paper: the paper's warp is strike-dependent; the engine's is not.** `[paper-cited]`
   `[analytic]` `[numeric]`. The paper places each barrier's swap **at its strike's trade point** (line 43)
   and reshapes continuously (`dw/dy=β/y²`, line 89 differential), so the same cash leg warps the curve by
   different amounts per ray (table in (ii)). The engine applies `tradeUpdate` at **spot** with the strike
   entering only the premium — strike-independent warp (entry-30, re-confirmed). The operator's diagnosis
   (continuous-vs-discrete is the source) is correct, with the sharper statement being **at-the-trade-point
   vs at-spot anchoring**.

2. **Economic-object decision the operator must make (UNCHANGED from entry-30 flag 1, now sharpened).**
   Two independent conventions are entangled and both are the operator's call, not calibration:
   (a) **Where is the swap anchored** — at the strike's trade point (paper) or at spot (engine)? This is
   the strike-dependence switch.
   (b) **What sizes the cash leg** — premium (`dy=premium·oracle`, current) or notional? This sets whether
   the warp rises or falls further OTM under each anchoring. The "same premium ⇒ more warp OTM" headline is
   only unambiguous once BOTH are pinned; the robust paper-faithful fact is the at-trade-point
   strike-dependence in (a).

3. **The paper's "Derivation of the Continuous Case" is a 〈PLACEHOLDER〉** (line 288) — the closed-form
   integral of the cash leg along the conservation hyperbola is asserted but not written in this draft. The
   present body math is the discrete **Trade Formula** (lines 81–89) plus its differential `dw/dy=β/y²`. If
   the engine is to implement the continuous/strike-dependent warp, that integral (or its incremental
   sub-trade discretisation) needs to be pinned — a candidate Aristotle obligation (the
   `(α,β)`-conservation-defines-a-flow lemma already flagged in `TRADE_WARP_strongform` consistency item 1
   is the same object) `[needs-Aristotle, not pinned this pass]`.

4. **#14 is correct-but-narrow, not wrong.** Do not relay this as "#14 was a bad verdict." It validated the
   per-trade transformation (conserved object, φ-recenter, tangency, referent) — all of which hold. It did
   not examine swap *anchoring* or *continuity*, which is the dimension entry-31 asks about. The skeptic
   should re-confirm this scoping read before it reaches the operator (this note is a research-lead finding,
   not a skeptic verdict).

5. **No build implication asserted.** This is a notes-only diagnosis of a paper↔engine gap. Whether to
   change the engine's anchoring (a real curve/economic-object change, escalation-tier per CLAUDE.md §7) is
   the operator's decision. NO engine edit, NO git, NO Aristotle submit, NO build file touched this pass.

## Provenance
Paper `paper/temporal_paper_draft.md` lines 33–43 (warp + at-trade-point), 73–93 (Conservation Law +
Trade Formula + differential), 286–288 (continuous-case placeholder). Engine HEAD
`engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html` lines 1723 (`tradeUpdate`), 1770 (`arbitrageToOracle`,
the goal-seek/trade-point locator), 1844 (`executeLeg`). Cross-read: entry-30
`notes/research/WARP_premium_and_spread_shortcut_2026-06-10.md`; strong-form
`notes/research/TRADE_WARP_strongform_2026-06-10.md`; skeptic #14
`notes/skeptic/VERDICT_PREMISE_CROSSVERIFY_2026-06-10.md`. Numerics float64,
`/tmp/warp_strikedep.js` + `/tmp/warp_atvsotm.js`. Manager re-derives; skeptic before the operator hears it.

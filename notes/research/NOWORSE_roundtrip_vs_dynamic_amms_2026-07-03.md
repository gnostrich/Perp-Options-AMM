# RESEARCH — "No worse than other dynamic AMMs?" Round-trip behavior of close-(b) vs accepted designs — 2026-07-03

_Author: research-lead. Ground: operator entry 411 (verbatim, `history/operator/2026-06-10_kurtosis-curve-family-brief.md`):_
> do a researfch run on no worse than other dynamic amm like curve etc. for the round trip point, if no worse i guess we ok
_Context: `specs/SPEC_close_first_class_trade_2026-07-03.md` FLAG-CURVE — naive close-(b) has (i) a
one-signed dy² pool-x drain under open/close cycling and (ii) a w/γ ratchet that reprices the whole
book, even with a pool-value floor. Decision rule: if this is NO WORSE than what accepted dynamic
AMMs live with, the operator accepts pure-(b) (no R-A unwind)._

**HONESTY CONSTRAINT (header, load-bearing): NO live web access in this environment.** All external
comparisons are from **training knowledge of the published designs** (Curve v2 cryptopool whitepaper
mechanics, Uniswap v2/v3, Balancer weighted pools + LBP, QuantAMM/TFMM-class dynamic-weight AMMs,
LVR literature) — every such claim below is labelled **[TK]** = *training-knowledge, unverified
against current sources*. Our OWN numbers are **[MEASURED]** = Node-vm runs against the REAL HEAD
engine (`engine/builds/HEAD_temporal_mvp_v28_lens.html`, md5 `0e0a0062…`; harnesses: spec-era
`closeb/h1…h6.js` + NEW `closeb/h7_rd.js`, session scratchpad, re-run 2026-07-03). No git, no engine
edit, no Aristotle in this run.

---

## 0. What exactly is being compared

A **trader-initiated round trip**: open a position, close it, **no market move in between**. Four
questions per design:

- **Q1 (value):** does the round trip return the pool's reserves/value — exactly, minus-a-fee, or
  with a state-dependent loss?
- **Q2 (state):** can a trader **unilaterally** move persistent pool state (weights / price-scale /
  peg) by cycling, and is that motion **gated** (profit gate, external oracle tether, schedule) or
  **free**?
- **Q3 (blast radius):** does moved state reprice third parties — LP value only, or all open
  positions/quotes?
- **Q4 (guard):** what does the design ship against cycling extraction?

Distinct axis, named once to preempt a false equivalence: **LVR** (loss-versus-rebalancing,
Milionis et al. 2022 [TK]) is what every CFMM — Uniswap, Balancer, Curve v2 included — bleeds to
arbitrageurs **when the price moves**; it is payment for adverse selection. It is NOT a zero-move
round-trip loss. No accepted AMM loses pool value to a zero-move trader round trip. "Curve loses
money too (LVR)" does not excuse a zero-move drain.

### Our measured numbers (the objects under judgment) [MEASURED]

Zero-move open→close cycles, HEAD `0e0a0062` trade-point law (`tradeUpdateAt`), live registration
`ρ_close=(K_tx/oracle)/mode_live`, exhibit pool (10, 8e5, w=½), oracle 80 000, chosen ray 0.7, m=2:

| policy (close variant) | cycles survived | pool value $1.6M → | w 0.5 → | γ 1 → | attacker paid |
|---|---|---|---|---|---|
| **naive (b)** live, N=50% depth | 13 (depth death) | **800 029** | **0.9351** | **14.4** | $0 |
| **(b)+floor**, N=50% | 13 | **1 600 000** (exact) | **0.9351** | **14.4** | $0 |
| **R-A** (floor + w:=w_pre_open), N=50% | 30 | 1 600 000 | **0.5000** | 1.000 | $0 |
| **R-D** (floor + profit-gated dwA, §4), N=50% | 30 | 1 600 000 | **0.5000** | 1.000 | $0 |
| **R-D, attacker pays the gate price** (φ=1) | 21 | **2 864 088** | 0.9351 | 14.4 | **$1 264 088** |
| naive (b) live, N=5% retail | 30 | 1 551 980 (−3%) | 0.5032 | 1.013 | $0 |

Per-cycle drain is one-signed (pool loses x in ALL 9 spec §1.1 cases, both wings, both directions,
toy + BTC scale; ∝ dy², −0.0312·dy² small-dy on the exhibit) — a drainable bias, not slippage.
Prior-session `h6` "frozenW" row is retracted as a mis-implementation (it removed only the open's
w-increment, leaving the close's — not the spec's R-A `w_close = w_pre_open`); `h7_rd.js` implements
R-A correctly and its rows above supersede.

---

## 1. Design-by-design: the four questions

### 1.1 Static baselines

**Uniswap v2** [TK] — Q1: round trip returns value **minus 2× the 0.30% fee**; pool strictly
*gains*; no state-dependent loss possible (x·y=k restores exactly, fees on top). Q2: no persistent
parameters exist — reserves ARE the state, and the round trip restores them (plus fees). Q3: n/a.
Q4: the fee (cycling is strictly money-losing for the cycler, strictly accretive for LPs).

**Uniswap v3** [TK] — Q1: minus-fee, same as v2 per position. Q2: the only "state" a trader moves is
the current price/tick — which *is* the price; a zero-move round trip restores it, and pushing it
away from market hands arbitrageurs the difference. The TWAP **oracle** is trader-movable but at a
cost scaling with pool liquidity × manipulation duration (the well-studied v3-TWAP-manipulation cost
bound); the guard is time-averaging + that cost. Q3: TWAP consumers (external lending protocols),
not the pool's own book. Q4: fees + TWAP averaging + arb restoring price.

**Balancer, static weights** [TK] — Q1: minus-fee. Q2: **weights are constants; no trade can move
them.** The curve shape is not trader-writable state at all. Q3: n/a. Q4: immutability.

### 1.2 Dynamic designs

**Curve v2 cryptopools — the operator's named benchmark** [TK, mechanics from the cryptoswap
whitepaper/contracts as known at cutoff]:
- State that moves: `price_scale` (the curve's internal peg — the shape parameter) plus an internal
  **EMA price oracle** (`price_oracle`, half-life ~minutes) updated by executed trades; profit
  accounting via `xcp_profit` (accumulated fee profit in invariant units) and `virtual_price`.
- **Q1:** round trip = **minus dynamic fee** (`mid_fee`→`out_fee`, rising with imbalance). Pool
  value in invariant terms is non-decreasing under trades; fees accrue to `xcp_profit`. No
  state-dependent zero-move loss.
- **Q2:** a trader CAN move `price_scale` — but only through a **triple gate**: (i) **tether**: the
  repeg target is the EMA of *actual executed prices*, so pushing it requires real trades that pay
  fee + slippage, and the EMA half-life rate-limits it; (ii) **profit gate — the load-bearing one**:
  the repeg (`tweak_price`) executes ONLY if, after recomputing the invariant at the new
  `price_scale`, the pool's `virtual_price` stays above ≈ `1 + (xcp_profit − 1)/2` — i.e. **repegging
  only SPENDS surplus the pool has EARNED in fees, and never more than half of it; LPs keep the
  rest**. No earned surplus ⇒ the parameter does not move, no matter what the oracle says;
  (iii) step-size limit (`adjustment_step`). So parameter motion is *paid for out of realized
  profit, by construction*.
- **Q3:** a repeg re-shapes quotes for subsequent traders and re-mixes the LP portfolio. **There is
  no third-party derivative book priced off `price_scale`** — the externality is internal to the
  pool (LPs), and the profit gate denominates its cost in exactly the units (pool value) that the
  gate protects.
- **Q4:** profit-gated repeg + EMA tether + dynamic fee. Known residual [TK]: cryptopools still lose
  under fast one-way markets (repeg lag / curvature cost vs fees — LVR-family; e.g. the 2023
  CRV/ETH-pool discussions), bounded by the keep-half-of-profit rule. That is loss under *moves*,
  not zero-move extraction.

**Balancer LBP** [TK] — weights move on a **schedule** fixed by the pool owner (time
interpolation). Q1: minus-fee. Q2: traders **cannot** move weights at all; only time does. Q3:
scheduled weight change reprices quotes, disclosed in advance. Q4: schedule = zero trader
writability.

**QuantAMM / TFMM-class dynamic-weight AMMs** [TK] — weights are set by an on-chain **rule**
(momentum/mean-reversion etc.) reading **external oracles**, updated per block/epoch with
guardrails (max weight-change per interval, interpolation/clamping). Q1: minus-fee. Q2: traders
cannot write weights; influencing them requires moving the *underlying market* the oracle reads —
external, costly, and rate-limited by the guardrails. Q3: weight changes reprice pool quotes/LP
mix; no derivative book. Q4: rule + rate-limits + external-oracle indirection.

### 1.3 Ours

**(a) frozen-arc close — SHIPPED (`0e0a0062`)** [MEASURED] — Q1: **exact** reserve round trip
(machine-exact; better than minus-a-fee). Q2: no persistent motion from a cycle (the arc removes
the leg's own `dwA`); w moves only while risk is held open. Q3: opens lean w while positions are
live (that is the paper's design: trades warp the curve). Q4: the arc itself. _(Superseded-pending-
build by entry 405; listed as the baseline we are leaving.)_

**naive (b)** [MEASURED] — Q1: **state-dependent, one-signed POOL LOSS** (table §0: −50% of pool
value in 13 cycles at attack size; −3%/30 cycles at retail size; pool dies on depth at cycle 13).
**No design in this list has this**: strictly worse than every accepted AMM on Q1. Q2: **free,
untethered, unbounded** unilateral w-motion (0.5→0.935; γ 1→14.4) — no fee, no oracle tether, no
profit gate, no rate limit. Q3: `γ = w/(1−w)` is read live and sets `g_loc = m·γ` — the moved state
**reprices every open option's mark, funding rate, and settlement seam** (the whole book), the
largest blast radius in the table and one no listed AMM has at all. Q4: none.

**(b) + pool-value floor (spec §1.3 pinned)** [MEASURED] — Q1: pool value held **exactly**
(non-decreasing per cycle; 1 600 000 → 1 600 000 over the full attack). Q2: **unchanged — the
ratchet is still free**: w 0.5→0.935 with value pinned. Q3: unchanged (whole book). Q4: floor
(value axis only).

**R-A (spec §4.3 recommended)** [MEASURED] — floor + `w_close := w_pre_open` (unwind the leg's own
`dwA`, already stored). Q1: value exact. Q2: **zero** persistent motion from any cycle (w = 0.5000
exact over 30 attack cycles). Q3: cycle blast radius zero; opens still lean w while held (risk-
coupled, as designed). Q4: floor + unwind.

---

## 2. VERDICT (stated both ways, as briefed)

### V1 — round-trip VALUE: is naive-(b) no worse than Curve v2?
**NO for naive-(b) as literally ruled; YES-in-kind once the pool-value floor is attached.**
- Un-floored naive-(b) is **worse than every design in the table, static or dynamic**: a zero-move
  trader round trip destroys pool value, one-signed and compounding. No accepted AMM has that
  property; Curve v2's round trip *pays* the pool a dynamic fee. This is not a "dynamic AMMs live
  with it" cost — they don't.
- With the floor, the per-cycle value guarantee (non-decreasing, exact) is **comparable in kind** to
  Curve v2's (Curve: value non-decreasing *plus* fee accrual, with the repeg allowed to spend at
  most half of accrued profit). Ours is per-cycle exact where Curve's is cumulative-keep-half; the
  difference that remains is **revenue** (Curve's cycler pays a fee; our cycler pays nothing on the
  value axis), not safety. **The floor is therefore mandatory for V1 — it is not optional
  hardening.**
- Floor-funding caveat (feasibility, honest): if the shortfall is charged to the closer (A15-family
  haircut), note a zero-move closer's option-layer proceeds are ≈ 0 — the haircut can exceed
  proceeds and needs a collateral claim to be collectable; if instead the pool is made whole from
  the option layer/club, cycling is value-free for the cycler (the harness models this). Either
  funding choice keeps V1 parity; they differ on §3's incidental-tax point.

### V2 — the W-RATCHET: is trader-controlled, ungated repricing-parameter motion no worse than Curve v2's price-scale motion?
**NO. It is WORSE-IN-KIND, on two independent counts — exactly the case the brief anticipated:**
1. **Ungated where Curve gates it.** Curve's `price_scale` moves only (i) toward an EMA of real
   executed prices, (ii) when the pool has EARNED surplus to spend on it (profit gate, keep-half),
   (iii) by bounded steps. Our w-motion under (b)+floor is free (value-neutral, measured), tethered
   to nothing, unbounded (w→1 monotone), and trader-scheduled. **The pool-value floor is NOT the
   Curve-equivalent profit gate**: it constrains *value*, not *parameter motion* — measured
   separation: value held exactly at $1.6M while w ratchets 0.5→0.935 (γ→14.4).
2. **Bigger blast radius than Curve's parameter has.** Curve's repeg reprices pool quotes/LP mix —
   an externality internal to the pool, denominated in the units the gate protects. Our w reprices
   **every open option position's mark, funding, and seam** (`g_loc = m·γ`), a third-party book
   whose notional is not bounded by pool value. No AMM in the table carries an open derivative book
   priced off its trader-movable parameter; this surface is ours alone.

So the honest composite: **value: comparable with the floor; parameter motion: WORSE-IN-KIND
because ungated where Curve gates it** — and worse again on Q3 blast radius, which is a design
surface Curve does not have at all.

---

## 3. Is the floor alone the Curve-equivalent profit gate? — NO (measured), and the incidental-tax variant fails too

Two floor-funding readings, both checked:
- **Pool-made-whole (option-layer funds the shortfall):** cycling is value-free for the attacker;
  ratchet cost $0 (table §0). No gate.
- **Charged-to-closer (haircut):** the attacker then pays the drain, which *incidentally* taxes the
  ratchet because both are O(dy²). But the implied price of w-motion is **un-designed and
  size-favoring** [MEASURED]: retail-size cycles pay ≈ **$15.0M per unit of w**; attack-size cycles
  pay ≈ **$1.84M per unit of w** — the tax per unit of curve motion is **8.2× cheaper for exactly
  the attacker-sized trades**, and it prices value-restoration, not motion (the coupling is a
  numerical accident of the current curvature, not a guarantee; nothing pins it across pool states).
  Curve prices the *motion itself* out of *earned surplus*. Not parity.

**Parity does NOT require the full R-A unwind.** Curve v2's design implies a strictly weaker
sufficient condition, and it is definable in our close path:

### R-D — profit-gated w-persistence (the minimal Curve-parity addition, precisely)
At close (all on fields the build already stores or one new scalar):
1. Execute the live (b) close (`tradeUpdateAt`, live registration) — unchanged.
2. Apply the **pool-value floor** to the pre-open reference — unchanged (V1).
3. Compute the cycle's **net persistent w-increment** `dw_net = w_post_close − w_pre_open`
   (consumes the stored `dwA` bookkeeping; one law, no ITM branch — the operator's (b) wins kept).
4. **Profit gate:** `dw_net` **persists only if** realized pool surplus above the pool's
   high-water mark covers its price: `V_now − V_hwm ≥ φ·|dw_net|·V_hwm` (then `V_hwm := V_now`);
   **otherwise `w := w_pre_open`** (full unwind of the increment; reserves stay live — only the
   scalar lean is unwound, exactly the "partial un-booking of the lean, not of the reserves"
   distinction from spec §4.3).
   φ = the designed price of curve motion (pool-value fraction per unit w); operator-calibrated.
- **Measured (h7_rd.js, φ=1):** free attacker: **w pinned at 0.5000 exact, value exact, 30/30
  cycles** — identical to R-A against the zero-surplus cycler, because with no fee income and no
  market move there is never surplus to spend (our pool currently has NO per-trade fee income and
  funding is ledger-only [FLAG-C], so surplus ≈ 0 unless someone pays). Paying attacker: buying
  γ 1→14.4 costs **$1 264 088 injected into a $1.6M pool** (pool value ends $2 864 088; ≈ $2.9M per
  unit w, size-independent by construction, escalating with the HWM). "Ratchet allowed only when
  paid for" — the Curve-class guarantee, made literal.
- **Gate-plan delta vs spec §3 (CM6-v3.4 replacement):** (i) zero-surplus cycle ⇒ `w_post ==
  w_pre_open` to machine tol, both wings/directions, case grid; (ii) persistence requires
  `surplus ≥ φ·|dw|·V_hwm` (probe: inject surplus, check exact threshold); (iii) negative control:
  floor-only build ratchets (w drift > bound) — proves the gate is load-bearing; (iv) CM12/CM8-v2/
  CM6-v3.1-3 unchanged. Storage: reuse per-leg `dwA` + ONE new pool scalar `V_hwm`.

### Residual honesty on R-D (what parity does NOT buy)
R-D achieves parity with Curve v2 **on the pool axes** (Q1 value, Q2 gating). It does **not**
neutralize Q3: a *paid* w-motion still reprices the third-party option book, and the payment goes
to LPs, not to the repriced option holders — Curve has no analogous surface, so "no worse than
Curve" on Q3 is achievable only by (i) R-A (zero net cycle motion — the only variant measured at
exactly zero), or (ii) calibrating φ against **book notional**, not pool value (making the attack
price scale with the harm). Whether $1.26M-to-move-γ-to-14.4 is expensive depends entirely on open
book size — an operator/product judgment, not a math one.

---

## 4. Bottom line for the operator's decision rule (entry 411)

- **Pure naive-(b), nothing added: NOT "no worse."** Worse than every accepted AMM on round-trip
  value (they never lose; it drains), and worse-in-kind than Curve v2 on parameter motion (free vs
  profit-gated).
- **(b) + pool-value floor: half-parity.** Value axis becomes comparable-in-kind to Curve v2
  (measured exact). The w-ratchet stays free — still worse-in-kind than Curve's gated price-scale.
  The floor is not a profit gate (measured separation), and its charged-to-closer variant taxes
  motion only incidentally, 8.2× cheaper per unit-w at attack size than retail.
- **(b) + floor + R-D (profit-gated dwA persistence): full Curve-class parity on the pool axes**,
  strictly weaker than R-A (paid motion is allowed, as Curve allows paid repegs), one new scalar +
  a close-time branch on already-stored fields. Free cycling: w pinned exactly. Paid cycling:
  $2.9M/unit-w at φ=1 on the exhibit pool.
- **The one surface no Curve-parity argument covers is the option book (Q3).** If the operator
  wants "no worse than Curve" to extend to third-party repricing, that forces R-A or book-scaled φ.
- Recommendation ordering (mine, as theory owner): **R-A ≥ R-D(book-scaled φ) > R-D(pool-φ) >
  floor-only > naive-(b)**; the operator's entry-411 rule is satisfiable at **R-D** and not below
  it. FLAG-CURVE (spec §4.3) should be resolved over the option set {R-A, R-D, R-B, R-C} — R-D is
  new since the spec and slots between R-A and R-B.

## 5. Scope honesty
Read-only run: no git, no engine edits, no Aristotle. External-design claims are training-knowledge
[TK], unverified against current sources (no web access; Curve v2 gate constants like the exact
keep-half inequality and EMA half-life are stated as mechanism shape, not audited contract values).
Measured claims are Node-vm against HEAD `0e0a0062` extract; harness `closeb/h7_rd.js` (session
scratchpad; policy definitions reproduced in §3 so the note is self-contained). The prior h6
"frozenW" row is superseded (mis-implementation, §0). R-D here is a **design definition + gate
plan delta**, not a spec — if the operator picks it, it gets the same spec/R6/skeptic path as R-A.

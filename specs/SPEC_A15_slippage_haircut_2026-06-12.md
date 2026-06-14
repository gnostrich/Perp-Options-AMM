# SPEC — A15 Option-Slippage Haircut (at-strike HEAD)

**Status:** READ-ONLY spec draft (manager-commissioned; skeptic R6-gates after). No engine edit,
no git, no agent-memory writes performed in producing this.
**Target build:** `engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 `de28c937…`, verified).
**Date:** 2026-06-12.
**Derivation scripts (live engine, re-derived here):** `/tmp/a15_derive.js`, `/tmp/a15_sizes.js`
(sandbox the `<script id="engine">` via `vm.runInContext`, exactly the `lens_selfcheck.js` method).

---

## R1 — Operator citations (verbatim, `history/operator/2026-06-10_kurtosis-curve-family-brief.md`)

- **Entry 195** (16:53 UTC) — the queued to-do, original framing (proceeds-netting hypothesis):
  > "got it, so i think as a note for to do later, you'd probably want to think of the right way to
  > apply slippage to the bought option / spread (we can easily see it on the AMM side, but i think
  > it's not directly feeding into options received unless you actually take the total slippage from
  > the AMM slippage and deduct from option proceeds as if they were at pre price, but this can be
  > queued imo unless theres some way this fits in naturally. you can think about this) — is this
  > sort of what you were highlighting too?"

- **Entry 205** (18:09 UTC) — the CORRECTION (it is NOT proceeds-netting):
  > "slippage isn't about proceeds netting, its basically applying the slippage as calcukated in the
  > AMM trade layer to reduce the bought option output as it woukd have been based on pre trade
  > option prices"

- **Entry 206** (18:14 UTC) — the SEQUENCE (size at pre-trade price, apply total slippage at the end):
  > "yes that seems right, because when we calculate the buy option quantity and thus the buy
  > notional, we use pre trade prices, then at the end of the trade we get the total slippage and we
  > apply that, make sense?"

- **Entry 199** (17:51 UTC) — scope: individual options, not spreads ("we think of individual options
  in this contexy not spreads"). The barrier (single-strike) leg is the canonical case; the spec
  holds for the spread legs term-by-term.
- **Entry 197** (16:59 UTC) — "transact at whatever the curve is; forget arb" — no un-bend, no
  round-trip engineering. The haircut is applied forward on the realized warp, not arbitraged away.

**The three pinned steps (operator, entries 205/206), no circularity:**
1. Size the buy at **PRE-TRADE** option prices: `N_buy = V_sell / (bought-leg unit price BEFORE the
   trade executed)`.
2. Execute the AMM trade (`executeBand` → two `executeLeg` at-strike swaps; pool warps).
3. Get the **realized total slippage** from the AMM trade layer and apply it as a **haircut**
   reducing the bought output: the trader receives less than the pre-trade-price size.

---

## R3 — Control inventory (UI surfaces this spec touches)

No NEW control is added. Two existing read-outs change meaning/value; one path (`previewBand` /
`openBand`) changes the booked quantity.

| id / fn | role | A15 effect |
|---|---|---|
| `previewBand()` (~L3030) | live preview sizing | computes `N_buy_pre` then applies haircut for display |
| `openBand()` (~L2487) → `Engine.executeBand` (L2531) | booking | books the **haircut** `N_buy` as `bought.N` (L2557) |
| `band-notional-bought-display` (L1150) | "N bought (BTC)" card | shows haircut N_buy (was un-haircut) |
| `band-notional-bought-subline` (L1151) | "$ of bought leg" | shows haircut N_buy·oracle |
| `pv-N-bought` (L1205) | audit strip derived qty | shows haircut N_buy |
| `pv-bought-V` (L1207 area) | audit bought premium | unchanged basis (V_sell), but trader gets less N |
| `band-slippage` (L1177) / `setSummary` (L2938) | "Slippage %" read-out | THE measure being applied as the haircut — see R2/FLAG |

The sold leg (`band-notional` input, `band-dir-sell`, swap, fee rows) is untouched.

---

## 1. Where it plugs in — and the PRE-vs-POST diagnosis (re-derived on the live engine)

**Today's N_buy is sized at the POST-sold-leg pool, NOT pre-trade.** Verified
(`/tmp/a15_derive.js`):
`executeBand` (L1837) runs `leg1 = executeLeg(state,'sell',…)` (L1859) which warps the pool, then
sizes the bought leg with `pxBuyUnit = legPrice(leg1.newState, …)` (L1875) — i.e. on the
**post-sold-leg** pool. So:

```
bought unit V @ TRUE pre-trade pool (s)        = 0.43666999
bought unit V @ post-sold-leg pool (leg1.new)  = 0.40307993   ← engine uses THIS (L1875)
N_buy engine (V_sell / pxPost.V)               = 0.01337628
N_buy if PRE  (V_sell / pxPre.V)               = 0.01234733
```

So today's `N_buy` ALREADY embeds the sold-leg's price impact on the bought-leg price (the
post-sold-leg quote is worse for a same-wing buy, better/worse depending on cross-wing geometry).
This is the OPPOSITE of step 1: the operator wants the buy sized at the **pre-trade** unit price,
THEN a single explicit haircut at the end (step 3), not an implicit mid-trade re-quote.

`legPrice` (L1722) is the unit-price function; `V_sell = leg1.V` (L1862) is the sold proceeds in
asset units. The minimal change for **step 1** is to price the bought unit on the **pre-trade pool
`state`** (the band's true entry pool), not `leg1.newState`:

```
const pxBuyUnitPre = legPrice(state, bought_wing, bought.inner, bought.outer, 1, tau);   // PRE-trade
const N_buy_pre    = V_sell / pxBuyUnitPre.V;
```

(The pool swap for the bought leg still EXECUTES — step 2 — at `N_buy_final`, the haircut quantity,
on `leg1.newState`. Only the SIZING quote moves to the pre-trade pool.)

---

## 2. ⚠ DEFINE "total slippage as calculated in the AMM trade layer" — **THIS IS AN OPERATOR-TIER FLAG**

This is the crux. Three readings were worked out with live numbers; one is eliminated, **two remain
defensible and differ by ~3.6× consistently**. Per the brief, the honest output is a FLAG, not a
guess.

**Setup (steep pool, `/tmp/a15_sizes.js`):** `W=0.725` (γ=2.636), reserves (10, 80000), oracle 8000,
τ=0.5; sell a call barrier at price-spot×1.6, buy a put barrier at price-spot×0.6.

| N_sell | (a) s_band | (b) bought-leg price drift | s1 (sold impact) | s2 (bought impact) |
|---|---|---|---|---|
| 0.001 | 0.000587 | 0.000164 | 0.000582 | 0.000005 |
| 0.01  | 0.005872 | 0.001634 | 0.005818 | 0.000054 |
| 0.05  | 0.029362 | 0.008146 | 0.029091 | 0.000264 |
| 0.10  | 0.058729 | 0.016222 | 0.058182 | 0.000517 |
| 0.30  | 0.176242 | 0.047697 | 0.174545 | 0.001444 |
| 0.50  | 0.293828 | 0.077647 | 0.290909 | 0.002261 |

**Candidate (a) — `s_band`, the realized price-impact fraction over BOTH legs.**
`s_band = (1+s1)(1+s2) − 1`, where each `s_i = |wRatio(w_post)/wRatio(w_pre) − 1|` is the leg's
realized w-ratio price impact (engine L1885–1894, proven equal to avg-exec-vs-pre-marginal price
slippage on the conservation hyperbola). **This is the number the UI already labels "Slippage %"**
(`setSummary(sim.slippage.s_band,…)`, L3101 → `band-slippage` L1177). Strong evidence for (a):
"the slippage as calculated in the AMM trade layer" most literally = the figure the AMM trade layer
already computes and displays as slippage.
- Structural caveat: `s_band` is DOMINATED by `s1`, the **sold-leg** impact (s1 ≫ s2 — the sold leg
  is the big swap, dy=N·K). So under (a) the trader is haircut on the bought output by the price
  impact of the leg they SOLD. That is internally coherent ("total slippage of the whole AMM
  trade"), and matches "we get the **total** slippage" (entry 206), but it means the bought-leg
  output is reduced mostly by the sold-leg's footprint.

**Candidate (b) — the bought-leg option-price drift pre→post.** The fractional change in the
bought-leg UNIT option value between the true pre-trade pool and the final (post-both-legs) pool:
`s_b = |V_bought_unit(final)/V_bought_unit(pre) − 1|`. This is "how much did the warp move the price
of the thing you're buying," which is a literal reading of "reduce the bought option output as it
would have been based on **pre-trade option prices**" (entry 205). ≈ 3.6× SMALLER than (a) at every
size.

**Candidate (c) — `slipUsd / proceeds` — ELIMINATED (non-viable).** `slipUsd` (L1896–1909) is the
per-leg dollar price-drift cost `Σ|Δy| − p₀|Δx|`, scaled to the **at-strike pool notional**
(dy=N·K, here ~$thousands), NOT to the option proceeds (~$43). The ratio is **88.16** → haircut
factor (1−88) → **negative N_buy = −1.076**. A dollar cost measured on the K-scaled pool swap cannot
be a fraction of the option proceeds. Discard.

### → FLAG-A15-SLIP (operator-tier). Both (a) and (b) are defensible and differ ~3.6×.
- (a) s_band: 29.4% haircut at N=0.5 → N_buy_final = 0.00872.
- (b) bought-drift: 7.76% haircut at N=0.5 → N_buy_final = 0.01139.

The operator must rule which measure is "the total slippage." The brief explicitly anticipated this
("like the at-strike close-semantics took 10 rulings"). **My read** (labelled as my own synthesis,
per §2.4 — NOT presented as the answer): (a) `s_band` is the best literal fit for "the slippage **as
calculated in the AMM trade layer**" because it is the exact quantity the trade layer already
computes and shows as slippage, and entry 206 says "**total** slippage." But (b) is the better fit
for "reduce the **bought** option output … based on **pre-trade option prices**" if the operator
means *only the warp on the bought leg*. These are materially different products. **Do not pick —
escalate.**

---

## 3. The haircut application — multiplicative (1 − s)

The operator's words — "**reduce** the bought option output" (205), "we **apply that**" to a
quantity sized at pre-trade prices (206) — imply scaling the pre-trade-sized quantity DOWN by the
slippage fraction, i.e. multiplicative, not a subtraction of a raw dollar amount:

```
N_buy_final = N_buy_pre · (1 − s)            where  N_buy_pre = V_sell / pxBuyUnitPre.V
```

A subtraction (`N_buy_pre − slipUsd/price`) is dimensionally the proceeds-netting model the operator
explicitly RETRACTED (entry 205 "isn't about proceeds netting"), and with `slipUsd` it goes negative
(see (c)). So: **multiplicative `(1 − s_fraction)`**, with `s_fraction` the FLAGGED measure.

**Worked numbers (N_sell = 0.5, live engine):**
- `V_sell = 0.00539171` (asset units), `pxBuyUnitPre.V = 0.43666999` → `N_buy_pre = 0.01234733`.
- Under (a): `N_buy_final = 0.01234733 · (1 − 0.293828) = 0.00871934`.
- Under (b): `N_buy_final = 0.01234733 · (1 − 0.077647) = 0.01138860`.
- (Today's engine books `N_buy = 0.01337628` — larger than BOTH, because today there is no haircut
  and the post-sold-leg quote happened to be cheaper for this cross-wing put.)

Guard: clamp `s ∈ [0, 1)` and reject (don't silently floor) if `s ≥ 1` — an honest reject in the
`executeBand` style (L1789), never a negative or zero bought output.

---

## 4. Solvency / downstream consistency

The booked quantity is `band.bought.N = result.N_buy` (L2557). Every downstream settlement consumer
reads `leg.N`:
- `closeBand` → `legValueUnified(s, wing, band.bought, tau)` → `leg.N · (mIn − mOut)` (L1951–1954,
  L2119) — values the bought leg at its booked N.
- `markEff` (L1943) — per-unit, N-independent; fine.
- `pfComponents` (L4299) — reads `leg.N` for the portfolio value (L4383–4384).
- `raw_net = Y − X` (L2151), then the single `L0 · raw_net · carvedEquity` dollar hop (L2194).

**Consistency requirement:** the haircut must be applied to `result.N_buy` BEFORE it is stored as
`band.bought.N` (L2557), so the WHOLE downstream chain (close, settle, pf-value) uses the haircut
quantity. There is no place that re-derives or assumes the un-haircut quantity at close — close
rebuilds rays from `K_inner` and reads the stored `N`. So storing the haircut N is self-consistent:
the trader holds, settles, and is valued on exactly the reduced quantity they received. **No
solvency hole** — a SMALLER bought leg is strictly easier on the pool/club than a larger one (less
to pay out at settlement). The pool swap (step 2) must execute at the SAME haircut `N_buy_final`
(so reserves and the booked position agree); do NOT swap the un-haircut N and book the haircut N
(that would leave the pool reserves inconsistent with the position — a real leak). Single source of
truth: compute `N_buy_final` once, use it for BOTH the leg-2 swap and `band.bought.N`.

Caveat to verify in the gate: `V_buy = leg2.V` (L1914) and the audit `pv-bought-V` display — these
should reflect the haircut leg (V_buy = N_buy_final · unit_mark), which they will if leg2 executes
at N_buy_final.

---

## 5. Gate additions — `engine/verify/lens_selfcheck.js` (HARD)

Append three HARD asserts (the lens gate already sandboxes the engine and runs `executeBand`):
1. **PRE-trade sizing:** `N_buy_pre == V_sell / legPrice(state_pretrade, bought_wing, …).V` to
   machine tol — assert the bought unit is priced on the PRE-trade pool, NOT `leg1.newState`.
2. **Haircut == realized-slippage formula:** `band.bought.N == N_buy_pre · (1 − s)` to machine tol,
   where `s` is the operator-ruled measure (the gate hardcodes whichever (a)/(b) the operator
   picks — until the FLAG is resolved the gate asserts the FLAG is open / mechanic unbuilt).
3. **Downstream consistency:** the leg-2 pool swap executed at the SAME `N_buy_final` that is stored
   as `band.bought.N` (reserves ↔ position agreement); and `closeBand`/`pfComponents` value the
   bought leg at the haircut N (no un-haircut quantity anywhere downstream).

Plus the standing pool-byte-identical regression must stay green (the lens/pool curve is untouched —
A15 lives in the SIZING layer only, like W1).

---

## 6. Bottom line (8 lines)

1. **Buildable as ONE intern pass: Y — BUT GATED on an operator ruling** (step 2 measure). Mechanics
   (pre-trade sizing + multiplicative haircut + single-N consistency) are surgical, sizing-layer
   only, pool curve untouched.
2. **Step 1 is a real change:** today N_buy is sized at the POST-sold-leg pool (L1875); operator wants
   PRE-trade (`legPrice(state,…)`). Verified on live engine.
3. **Haircut form: multiplicative `N_buy_final = N_buy_pre·(1 − s)`** — operator's "reduce/apply"
   wording; subtraction = the retracted proceeds-netting model and goes negative.
4. **⚠ FLAG — operator must define the slippage measure.** Two defensible readings differ ~3.6×:
   (a) `s_band` = the AMM layer's own displayed slippage (29.4% @ N=0.5 → N_buy 0.00872);
   (b) bought-leg option-price drift pre→post (7.76% → N_buy 0.01139).
5. Candidate (c) `slipUsd/proceeds` ELIMINATED — 88× → negative N_buy (dollar cost on K-scaled pool
   swap, not an option-proceeds fraction).
6. My (labelled) lean: (a) best fits "slippage **as calculated in the AMM trade layer**"; (b) best
   fits "based on **pre-trade option prices** / bought leg." NOT decided — escalated.
7. **Solvency: clean.** Store the haircut N before L2557; swap leg-2 at the same N; smaller bought
   leg is strictly pool-favourable; no downstream consumer assumes the un-haircut quantity.
8. **Gates:** 3 HARD asserts in `lens_selfcheck.js` (pre-trade sizing; haircut==measure formula;
   single-N downstream consistency) + standing pool-byte-identical regression.

# UX — INTERACTION COST ANALYSIS (Temporal perp-options venue)

_Research deliverable, commissioned by the operator (transcript entries 583 + 584,
`history/operator/2026-06-10_kurtosis-curve-family-brief.md:4172,4183`). Quantitative half of a
two-part study; the flow/screen half is the sibling document
`docs/UX_LIFECYCLE_INTERACTION_SURFACE.md`, which I count here but do not edit._

> Operator, entry 584, verbatim:
> "yes also youd want it to think formally through the number of steps etc from optimality standpoint"

**What this document is.** A step-count argument with an explicit lower bound, actual counts on three
surfaces with the counting shown, a classification of every overhead step, and — the part that
governs everything else — the co-presence constraint that makes some step removals **invalid** rather
than optimal.

**What this document is not.** It is not a design. It does not decide any product question; §12 lists
the ones it hit. Where I disagree with the sibling document's counts I say so in §11 rather than
quietly re-deriving them.

**Nothing was modified.** No file under `engine/`, no `app/index.html`, no sibling file. Read-only.

---

## 1. The venue facts the counting rests on

Every reduction below is licensed by one of these. If one is wrong, the count that leans on it is
wrong, and I have said which.

| # | Fact | Source |
|---|---|---|
| V1 | Perps open into **shared wallets** (one long, one short); there is a perp-DEX margining layer; all perps of the same size are aggregated. | entry 510 (`:3711`), entry 583 (`:4172`) |
| V2 | Creating a perp option **upon** a perp REMOVES that much perp from the perps tab (the carve). Closing the option closes the backing perp portion. | entry 510 (`:3711`) |
| V3 | P&L for the perp option **and** its backing perp cashes out **directly**, in one settlement. | entry 511 (`:3717`) |
| V4 | There is a **total account-level equity** holding all perps AND all perp-option positions; that is what liquidates, as a whole; it **excludes LP positions**; account leverage threshold ~50×. | entry 514 (`:3735`) |
| V5 | Payouts are realised by **buy/sell, not intrinsic settlement** — so a close is a trade, executed at the **aggregate price excluding the closer's own curve**. | entry 578 (`:4135`) |
| V6 | Fills are **pro-rata by liquidity density**; the taker is simply "matched to the best quote across market makers" — no routing choice. | entries 575 (`:4115`), 577 (`:4129`) |
| V7 | The quoting **level** is derived from an oracle IV through a **natural map**; an LP expresses a view as a **bias** on that oracle, or opts out and runs all params manually. | entries 571 (`:4097`), 572 (`:4103`) |
| V8 | **Any strike is quoted on demand from a closed form.** There is no rung list. The operator rejected discrete rungs twice (entries 550, 551) and the separate quote box once (entry 552). | entries 550–552 (`:3937–3955`) |
| V9 | Portfolio carries **up to 4 lines** per perp-option position — bought / sold sides / total etc. | entry 583 (`:4172`) |
| V10 | **No funding rate on perp options.** | entry 515 (`:3745`) |

---

## 2. Method — what counts as a step, and the operator model

### 2.1 The step unit

> **A step is one user-initiated act that commits a decision or an input.** A click on a control, a
> completed field entry, a completed drag. Reading is not a step; waiting is not a step; both are
> costed separately.

This is deliberately coarser than KLM's atomic operators, because "number of steps" in the operator's
sense is a count of *decisions the user is made to express*, not of motor events. I report both:
**step count** (the operator's unit) and **KLM time** (the check that a low step count is not just
a high-effort step in disguise — e.g. a single field that demands five keystrokes and a lookup).

### 2.2 KLM constants (Card, Moran & Newell)

| Op | Meaning | Value (s) |
|---|---|---|
| `K` | keystroke | 0.20 (good typist, 90 wpm) |
| `P` | point with mouse (Fitts-averaged) | 1.10 |
| `B` | button press **or** release | 0.10 (so a click = `P + 2B` = 1.30) |
| `H` | home hands, mouse ↔ keyboard | 0.40 |
| `M` | mental preparation | 1.35 |
| `R(t)` | system response wait | measured / estimated, stated inline |

Sensitivity: using `K = 0.28` (average skilled typist) instead of 0.20 moves the totals in §5 by
under 4%; it does not change any ordering. The results are not knife-edge on the constants.

### 2.3 The lower bound

> **steps_min = |irreducible inputs not already in context| + 1 commit**

with the strictness the brief demands: an input is **irreducible** only if it cannot be defaulted,
derived, or inferred. In particular the following are, in this venue, **not** irreducible:

- the quoting **level** — derived from the oracle via the natural map (V7);
- the **close price** — the aggregate excluding the closer's own curve (V5);
- the **perp slice released on close** — determined by the option size (V2);
- the **counterparty / routing** — pro-rata by capital, no choice (V6);
- the **wing** (call vs put), when writing against an existing perp — determined by the perp's side;
- the **wing**, generally, when the strike control is **signed moneyness** `k` — because `{wing, |k|}`
  and `{k}` carry identical information, and one signed control expresses both without hiding either.

Two carve-outs from the formula, both stated up front so the table is honest:

1. **Information tasks have no commit.** For "check portfolio state" and "LP inspect", the bound is
   `steps_min = navigation acts required to make the needed state visible`, which is **0** when the
   state is ambient and **1** when it is a destination. Applying `+1 commit` there would be a
   category error.
2. **A confirmation on an irreversible or liquidation-moving action is inside the bound, not
   overhead.** Justified in §8. It is counted in `steps_min`, so that a surface which drops it does
   not score as *better* than optimal.

---

## 3. Irreducible decision variables, task by task

Strict enumeration. For each variable I say why it is in or out.

### T1 · Open a perp
| Variable | In? | Reasoning |
|---|---|---|
| direction (long/short) | **IN** | the entire content of the act; not derivable from anything |
| size (exposure) | **IN** | not derivable |
| leverage | **OUT** | Under V4 the margin object is the **account**, not the position: what liquidates is total account equity against a ~50× cap, and LP is excluded. In a cross-margined account there is no per-position margin commitment to choose — the whole equity backs everything. `notional` is the decision; `account leverage` is the readout. **Caveat:** this holds only if Temporal is genuinely cross-margined per V4. If per-position isolated margin is offered, leverage becomes irreducible and `steps_min` rises to 4. → §12 Q-A. |
| symbol / market | **CONTEXT** | in context when arriving from a market view; +1 otherwise |
| fund source | **OUT** | V1: one shared-wallet account with a margining layer. Fund source is a *deposit-time* decision, not a per-trade one. |
| auto-protect | **OUT** | a separate optional product, not part of "open a perp" |

**steps_min(T1) = 2 + 1 = 3.**

### T2 · Write a perp option on an existing perp (the carve-out)
| Variable | In? | Reasoning |
|---|---|---|
| which perp | **CONTEXT** if invoked from that perp's row; **IN** (+1) otherwise |
| strike `k` | **IN** | V8: any strike on demand. A default is a default, not a derivation — the user must still deliberately land it (§9 says why a silent default here would be invalid) |
| size | **IN** | bounded above by free perp, but the value inside the bound is the user's |
| wing (call/put) | **OUT** | determined by the perp's side — you sell the payoff on the perp you hold. The reference states exactly this in its own tooltip: _"I am: SELLING the payoff on \<quantity\> of my \<long / short\> \<asset\> perp between \<price bound\> and \<price bound\>"_ (`components/transact/TradeInsuranceComponent.tsx:819-822`) |
| buy vs write | **OUT** | the task *is* writing |
| price / level | **OUT** | V7 + V6 |
| counterparty | **OUT** | V6 |
| max slippage | **OUT** (defaultable) | a venue default is defensible; whether it should be user-visible is → §12 Q-D |

**steps_min(T2) = 2 + 1 = 3** (from the perp row). **= 4** cold.

### T3 · Buy a perp option (naked)
| Variable | In? | Reasoning |
|---|---|---|
| buy vs write | **IN** | 1 bit; not derivable |
| signed strike `k` | **IN** | one control carries wing + magnitude |
| size | **IN** | |

**steps_min(T3) = 3 + 1 = 4.**

Note: putting BUY and WRITE on separate tabs (as the depth cloud requires anyway, entries 559–563)
does not delete this bit — it relocates it into the tab click. It is still one act unless the user is
already on the right tab.

### T4 · Vertical spread
| Variable | In? | Reasoning |
|---|---|---|
| strike₁, strike₂ | **IN, IN** | two independent DOF; "width" is not a saving, it is the same second DOF renamed |
| size | **IN** | one size for the structure |
| net direction (debit/credit — which leg you buy) | **IN** | signed strikes fix the *wing*; they do not fix which leg is bought. Genuine extra bit. |

**steps_min(T4) = 4 + 1 = 5.**

The load-bearing consequence: **a vertical spread is exactly ONE input more than a single option.**
Any surface that makes it a separate ticket with its own size and strike fields is charging a
mode-switch plus re-entry for one bit of new information.

### T5 · Check portfolio state
No commit. What must be *visible*, per V4 and V5, is listed in §7. Bound:

**steps_min(T5) = 0** if the account strip (equity · leverage · 50× cap · headroom) is ambient;
**= 1** if portfolio is a destination; **+1 per additional tab** the user must visit to see something
that is part of the same liquidating object.

### T6 · Close a perp option and its backing perp slice
| Variable | In? | Reasoning |
|---|---|---|
| which position | **CONTEXT** — the click on the row *is* the selection |
| how much (full/partial) | **OUT** if the venue is full-close-only; **IN** if partial is offered → §12 Q-B |
| the backing perp slice | **OUT** | V2: determined by the option size |
| close price | **OUT** | V5: aggregate excluding own curve |
| destination of proceeds | **OUT** | V1/V3: the account |

**steps_min(T6) = 1 commit + 1 confirm/quote-accept = 2** (full close). **= 3** with partial.

### T7 · Withdraw / cash out (trader)
| Variable | In? | Reasoning |
|---|---|---|
| amount | **IN** unless "withdraw all" |
| destination | **OUT** | the connected wallet; a different address is a rare path that must not sit on the default path |

**steps_min(T7) = 1 + 1 commit + 1 confirm = 3.** But see §12 Q-C: under V3 the trader's cash-out may
already be *fused into close*, in which case T7 is not a separate task at all and its true minimum is 0.

### T8 · LP: post a curve
| Variable | In? | Reasoning |
|---|---|---|
| capital / margin | **IN** | |
| bias vs the oracle | **OUT of the base task** | V7: `bias = 0` means "quote the oracle", a complete and legitimate curve. An LP with no view supplies nothing. Expressing a view is **+1**. |
| all shape params (S̄, a, γ, κ, fee) | **OUT** in oracle mode | V7: derived through the natural map |
| leverage / quoted notional | **CONTESTED** | Under V4, LP capital is a *separate pot* (LP is excluded from account liquidation), so an LP choosing to quote more notional off the same margin is a real economic choice → +1. **But** the current Temporal app derives it: `app/index.html:82-85` takes margin only and renders Pool Leverage / LP Leverage as read-outs. If notional is a function of margin and the curve, this is 0. → §12 Q-E. |

**steps_min(T8) = 1 + 1 = 2** (oracle, no view, notional derived).
**= 3** with an independent leverage choice, **= 4** with a view as well.
Manual mode: `+k` for whatever params the venue exposes — deliberately more, see §8.

### T9 · LP: inspect accrued / apportioned positions and P&L
No commit. **steps_min(T9) = 0** if the accrued book sits on the curve surface; **= 1** as a destination.

### T10 · LP: withdraw
**steps_min(T10) = 1 amount + 1 commit + 1 confirm = 3** (partial); **= 2** (full-only).

---

## 4. MASTER TABLE — task × surface × steps

Surfaces:
**(a)** OB reference — `/tmp/obref/Perp-Options-OB-MM-claude-pricing-engine-go-kleb5s/perp-frontend-hyperliquid-staging/src/`
**(b)** current Temporal app — `/home/user/Perp-Options-AMM/app/index.html`
**(c)** the sibling proposal — `docs/UX_LIFECYCLE_INTERACTION_SURFACE.md` §3–§4

All counts are the **cold path** (user arrives from elsewhere; defaults accepted wherever the surface
offers them). Warm paths are noted in §5. `—` = the task is not expressible on that surface.

| # | Task | steps_min | (a) OB ref | (b) Temporal app | (c) sibling proposal | overhead (a) | overhead (b) | overhead (c) | dominant class |
|---|---|---|---|---|---|---|---|---|---|
| T1 | Open a perp | **3** | 6 | — | 4 | +3 | n/a | +1 | nav · mode-switch · derivable-entry (leverage) |
| T2 | Write option on an existing perp (carve) | **3** | 6 | 5\* | 5 (from result strip) / 6 cold | +3 | +2\* | +2 | nav · mode-switch · derivable-entry (perp identity) |
| T3 | Buy a perp option | **4** | — (structurally) | 5 | 6 | n/a | +1 | +2 | navigation |
| T4 | Vertical spread | **5** | 7 | 6 | 8 | +2 | +1 | +3 | mode-switch |
| T5 | Check portfolio state (full) | **0–1** | 4 | 1 | 1 (strip ambient) / 2 per detail tab | +3 | 0 | +1 | navigation |
| T6 | Close option + backing perp slice | **2** | 4 (+paging) | — | 4 | +2 | n/a | +2 | navigation |
| T7 | Withdraw / cash out (trader) | **3** or n/a | fused into close | — | fused into close | — | n/a | — | (open question) |
| T8 | LP: post a curve (oracle, no view) | **2–4** | 5 (≤10) | 3 | 4 | +3 (≤8) | +1 | +0…+2 | nav · mode-switch · derivable-entry |
| T9 | LP: inspect accrued / P&L | **0–1** | 2–3 | — | 2 | +1…+2 | n/a | +1 | navigation |
| T10 | LP: withdraw | **2–3** | 4 | — | 3 | +2 | n/a | +1 | navigation |

`*` T2 on the current Temporal app is counted against the nearest expressible act (Transact ▸ Sell).
The app has **no notion of an existing perp**, so the carve (V2) has no surface: the mechanic is
present only as prose at `app/index.html:213`. The 5 is therefore an upper-bound stand-in, not a
completed task.

### Headline

- **The OB reference runs +2 to +3 steps of overhead on every task**, and the overhead is almost
  entirely *navigation and mode-switching* — the cost of a surface where the ticket and the ledger are
  different routes and the option ticket is a third tab inside one of them.
- **The current Temporal app is at or near the bound on the three tasks it implements** (T3: +1,
  T5: 0, T8: +1) **and does not implement the other seven.** Its interaction cost is excellent and
  its lifecycle coverage is roughly 30%.
- **The sibling proposal is +1 to +3 across the board**, and its overhead is dominated by two things
  that are *load-bearing*, not waste: the firm-quote accept and the close quote (§8). Netting those
  out, its true waste is +1 on T1 (leverage) and +1 on T4 (ADD LEG, arguably also load-bearing).

---

## 5. Showing the counting

The counts above are only useful if a reader can check them. Two representative tasks are worked in
full; the rest are itemised with file citations.

### 5.1 T2 — write an option on an existing perp — OB reference, cold

Path and citations:

| # | Act | File | Class |
|---|---|---|---|
| 1 | click nav → `/` | `components/base/NavBar.tsx` | navigation |
| 2 | click **TRADE BANDS** tab | `components/transact/PlaceOrderCard.tsx:75-81` | mode-switch |
| 3 | open the SELL market `Select`, pick long/short perp | `components/transact/TradeInsuranceComponent.tsx:855-870` | **derivable-entry** — identifies the perp, which was in context on the row the user just left |
| 4 | click MAX chip, or type QUANTITY | `:769-779` (MaxChip) / `:840-849` (Input) | irreducible (size) |
| 5 | type sell PRICE FROM | `:885-895` | irreducible (strike) |
| — | (debounced dry-run fires; buy quantity, slippage, fees return as **outputs**) | `:600-660`, output at `:997-1013` | system wait — **credit: not a step** |
| 6 | click **TRANSACT** | `:1175-1281` | commit |

`steps_actual = 6`, `steps_min = 3`, `overhead = 3` = 1 navigation + 1 mode-switch + 1 derivable-entry.

KLM, with `R` estimates stated:

```
M 1.35 + click 1.30 + R(route) 0.50                      = 3.15
M 1.35 + click 1.30 + R(strikeBounds, perpQty) 0.60      = 6.40
M 1.35 + click 1.30 + click 1.30   (market select)       = 10.35
M 1.35 + click 1.30 + H 0.40 + 4K 0.80  (quantity)       = 14.20
M 1.35 + click 1.30 + H 0.40 + 5K 1.00  (strike)         = 18.25
R(dry-run debounce + round trip) 1.00                    = 19.25
M 1.35  (read the quote)                                 = 20.60
click 1.30  (TRANSACT)  + R(backend) 1.00                = 22.90 s
```

The same task at the bound — invoked from the perp row, strike set by pointing at the curve, size from
a chip:

```
M 1.35 + click 1.30 ("write on this perp") + R 0.30      = 2.95
M 1.35 + point-and-set on the curve 1.30                 = 5.60
M 1.35 + click 1.30 (size chip)                          = 8.25
R(quote) 0.80                                            = 9.05
M 1.35  (read quote + carve + headroom)                  = 10.40
click 1.30 (commit) + R 1.00                             = 12.70 s
```

**22.9 s → 12.7 s, a 45% reduction, while showing the user strictly more at the moment of commit**
(the carve and the resulting account leverage, neither of which the reference shows — §7).

### 5.2 T8 — LP post a curve — all three surfaces

**(a) OB reference**, `components/transact/EarnComponent.tsx`:

| # | Act | File | Class |
|---|---|---|---|
| 1 | nav → `/` | `NavBar.tsx` | navigation |
| 2 | click **EARN** tab | `PlaceOrderCard.tsx:82-88` | mode-switch |
| 3–8 | up to 6 curve params: `sBar, a, gamma, lambda, fee, N` | `EarnComponent.tsx:46-53`, fields at `:333-345` | derivable-entry under V7 (no oracle mode exists here) |
| — | `N` is hinted `"= from notional"` when not explicitly set | `:341-343` | **credit: a genuine derivation** |
| 9 | type MARGIN | `:361-370` | irreducible |
| 10 | drag LEVERAGE (cap 10×) | `:389` | contested (§12 Q-E) |
| 11 | click **DEPLOY CURVE** | `:753-770` | commit |

Accepting all curve defaults (`resetDefaults`, `:326`): `steps_actual = 5`. Touching every param: 10.

**(b) Temporal app**: nav → Earn (1) · type MARGIN `app/index.html:82` (1) · click **Create Earn
Position** `:88` (1) = **3**. Notional, Pool Leverage and LP Leverage are read-outs (`:83-85`), so the
sizing DOF is one, not two. This is the best score on the board — one navigation act above the bound.

**(c) Sibling proposal** (`§3.1 S3`): mode defaults to ORACLE-INDEXED (0) · margin (1) · leverage (1) ·
bias (1) · DEPLOY (1) = **4**.

### 5.3 The remaining counts, itemised

| Task | Surface | Acts, in order | Citations |
|---|---|---|---|
| T1 | (a) | nav · CREATE PERP tab · LONG/SHORT · DEPOSIT amount · LEVERAGE slider · CREATE POSITION | `PlaceOrderCard.tsx:69-74`; `CreatePerpComponent.tsx:220-231`, `:270-277`, `:293`; `MiniComponents/TransferAndPerpButton.tsx:258-270` |
| T1 | (c) | side · size · leverage · CONFIRM | sibling §4.1 |
| T3 | (b) | nav · Buy/Sell · strike `#tk`/`#tkr` · size `#tsz` · Create Position | `app/index.html:156-157` (handler `:654-655`), `:158-160`, `:161`, `:163` |
| T4 | (a) | nav · tab · market · qty · sell-From · buy-From · TRANSACT | `TradeInsuranceComponent.tsx:855,840,885,1031,1175` |
| T4 | (b) | nav · Trade Bands tab · SELL strike · BUY strike · size · Execute Band | `app/index.html:189`, `:192`, `:193`, `:194`, `:196` |
| T4 | (c) | nav · OPTION tab · BUY/WRITE · strike₁ · size · +ADD LEG · strike₂ · CONFIRM (+ACCEPT) | sibling §3.1 S1b |
| T5 | (a) | nav `/portfolio` · (OVERVIEW default) · PERPS · BANDS · EARN | `app/portfolio/page.tsx`; `components/portfolio/positionsClient.tsx:118-170` |
| T5 | (b) | nav Portfolio | `app/index.html:209-220` |
| T6 | (a) | nav · BANDS tab · [paginate] · CLOSE · Close | `positionsClient.tsx`; `tableContainer.tsx:853-898` (paging), `:1086-1095`, `:1155-1161` |
| T9 | (a) | nav · EARN tab (+ BANDS tab for the instrument view) | `earnTableContainer.tsx:241-345`; `tableContainer.tsx:481-497` (ORIGIN=LP rows) |
| T10 | (a) | nav · EARN tab · WITHDRAW · Confirm Withdraw | `EarnComponent.tsx:696-708`, `:719-727` |

---

## 6. Overhead classification

`overhead = steps_actual − steps_min`. Classes, and whether each is waste:

| Class | Always waste? | Why |
|---|---|---|
| **Navigation** | **No** | A route change that carries the user to state they need is load-bearing. It is waste only when the destination holds information that should have been ambient (T5) or when it *drops context the user had* (T2, where leaving the perp row forces the perp identity to be re-entered). |
| **Mode-switch** | **No** | Legitimately carries a bit the user must supply anyway (BUY/SELL tabs carry the side; ADD LEG declares a structure). Waste when it separates two tickets that differ by one input (T4 on both existing surfaces). |
| **Confirmation** | **No** — see §8 | Load-bearing on irreversible or liquidation-moving actions. |
| **Re-entry / entry of derivable data** | **YES** | The venue already has the number. Entering it is pure loss, and worse, it can be entered *wrong*. |
| **Information-seeking** | **YES** | The user leaving the commit surface to find a number the commit surface should have carried. Pure loss and the direct cause of blind decisions. |

### The derivable-entry inventory (unambiguous waste)

| # | Where | Evidence | Derivable from |
|---|---|---|---|
| D1 | Perp LEVERAGE slider on the create ticket | `CreatePerpComponent.tsx:293` | V4 — account is the margin object. **Conditional on Q-A.** |
| D2 | The SELL market `Select` on the bands ticket | `TradeInsuranceComponent.tsx:855-870` | the perp row the user came from |
| D3 | Six LP curve params, manual-only | `EarnComponent.tsx:46-53` | V7 — no oracle mode exists in the reference |
| D4 | `N (rungs/wing)` as an LP parameter | `EarnComponent.tsx:52` | V8 — Temporal has no ladder; the parameter has no referent |
| D5 | Buy-side option quantity | — | **already derived** in the reference (`TradeInsuranceComponent.tsx:997-1013`) — cited as the model to copy, not a defect |

### The information-seeking inventory (unambiguous waste)

| # | Where | Evidence |
|---|---|---|
| I1 | Reading a perp's free size in `/portfolio` before switching to the bands ticket | mitigated in the reference by `getPerpQuantitiesAction` feeding the MAX chip (`TradeInsuranceComponent.tsx:701-715, 769-779`) — **credit**; the residual cost is that the chip refreshes on tab entry only (`:717-721`) |
| I2 | Paging the bands table to find the position to close | `tableContainer.tsx:853-898` |
| I3 | Reconciling PERPS and BANDS tabs to reconstruct the single object that liquidates under V4 | `positionsClient.tsx:118-170` — see §7, this is also a §9 violation |

---

## 7. THE HARD CONSTRAINT — what must be co-present at commit

**The rule.** A step may not be removed if it is the only place the user sees state that the next
decision depends on. A design that removes a step by hiding such state is **INVALID**, not optimal.
Below, per task, the co-presence set; then the places where each surface breaks it.

| Task | Must be CO-PRESENT at the moment of commit |
|---|---|
| T1 open perp | mark · size in the unit chosen · fee · **resulting account leverage and headroom vs the ~50× cap** (V4) · collateral available |
| T2 write option (carve) | strike and size · **the quote actually being committed to** · **the carve: how much perp leaves the perps tab, and what the perps tab reads after** (V2) · premium received · **resulting account leverage / headroom** (V4) |
| T3 buy option | strike, size · the quote · premium paid · resulting account leverage / headroom |
| T4 spread | both strikes and the size · **net debit/credit**, not two gross legs · max loss · resulting account leverage / headroom |
| T5 portfolio | **perps and options together, as one liquidating object** (V4), with LP visibly excluded · the mark basis in words · account leverage / cap / headroom |
| T6 close | the close price and **that it is the aggregate with your own curve excluded** (V5) · option P&L · **the backing perp slice that closes with it and its P&L** (V2, V3) · **mark → close gap** · net cash out |
| T7 withdraw | amount · balance after · anything the withdrawal makes unmeetable |
| T8 LP post | capacity · half-spread · LP leverage vs cap · **your density share of the aggregate**, because that is what sets pro-rata fills (V6) · **whether your bias is inside your own spread**, i.e. whether it is monetisable against you |
| T9 LP inspect | fees earned · mark-to-book · hedge P&L · Δ-exposure · utilisation · **that LP is excluded from the account cap** (V4) |
| T10 LP withdraw | proceeds · disposition of accrued inventory · crystallised fees |

### Violations found — surface (a), the OB reference

1. **INVALID — the bands close dialog hides half the transaction.** It shows long/short position value
   and PNL only (`tableContainer.tsx:1113-1152`). Under V2/V3 the close also closes the backing perp
   slice and both P&Ls cash out together. The user commits to two position closures having been shown
   one. This is the sharpest violation in the reference.
2. **INVALID — the option ticket shows no account state at all.** `TradeInsuranceComponent.tsx` contains
   no liquidation, leverage, margin or equity readout anywhere (the only match for "liquid" in the file
   is a slippage tooltip at `:1125`). Under V4 writing an option changes the object that liquidates, and
   under V2 it moves perp out of the perps tab. The commit is blind on both counts.
3. **INVALID — the LP withdraw dialog carries no numbers.** `EarnComponent.tsx:709-718` is prose only
   ("This closes the position and cannot be undone"). No proceeds, no accrued-inventory disposition, no
   crystallised fees. And the venue demonstrably *can* do better: `CloseAccruedDialog.tsx:66-80` fetches
   a full estimate before its confirm. The capability exists and WITHDRAW does not use it.
4. **WRONG STATE, not missing state — the create-perp ticket shows a per-position liquidation price**
   (`CreatePerpComponent.tsx:420`, computed `:165-206`). Under V4 the account liquidates as a whole; a
   per-position liq price is not the number the decision depends on, and displaying it *satisfies the
   letter of co-presence while defeating its purpose*. Worth calling out separately because it is the
   failure mode that step-counting alone cannot detect: the count is fine, the information is wrong.
5. **VIOLATION by split — PERPS and BANDS are separate tabs** (`positionsClient.tsx:118-170`). Under V4
   they are one liquidating object. The user can never see it whole without arithmetic. Partially
   mitigated by the `LIQUIDATION FLOOR` / `TRADER EQUITY` bento on OVERVIEW
   (`OverviewContent.tsx:359-371`) — **credit** — but the detail never reconciles on one screen.
6. **HAZARD — the most dangerous structure requires the fewest inputs.** Leaving the sell "To" field
   blank yields `stikeUpperSell = 0` (`TradeInsuranceComponent.tsx:1200`, the `|| 0` fallback; same for the buy leg at `:1202`), i.e. an **uncapped**
   short option. A user reaches unbounded risk by *omitting* an input. Any step-minimisation exercise
   that does not carry this constraint would score that path as the best one on the surface.

### Violations found — surface (b), the current Temporal app

7. **INVALID — the Transact commit panel shows no account state.** `#tquote` (`app/index.html:678-684`)
   carries best ask/bid, book spread, filled-by, and you-pay/receive. No account leverage, no headroom,
   no carve. Same class as (2). The information exists elsewhere in the same file — the Portfolio panel
   computes account leverage, the 50× cap and headroom (`:909-931`) — it is simply not on the commit
   surface.
8. **INVALID — the maker-divergence slider is on the trade ticket** (`app/index.html:162`, `#arbr`). It
   is a simulator control that changes what other makers quote. Shipping it to a taker would make the
   quote the taker sees a function of a control the taker holds. It must not survive to production.

### Where each surface gets co-presence RIGHT (credit, so the recommendation is not one-sided)

- **(a)** The **perp** close dialog is a model: `perpTableContainer.tsx:673-760` shows size, entry, mark,
  PnL, then an itemised Payout Summary (equity, withdrawal fee, slippage, **final payout**) and states
  where funds go. This is exactly what the bands dialog should be and is not.
- **(a)** The buy-side quantity is a derived output, not an input (`:997-1013`), and the dry-run is
  automatic and debounced (`:600-660`) rather than a "get quote" button. Two steps correctly removed.
- **(a)** `earnTableContainer.tsx:241-345` gives the LP the full co-presence set in one table:
  CURVE · MARGIN · UTILIZATION · Δ-EXPOSURE · FEES EARNED · MARK-TO-BOOK · HEDGE P/L · P/L TOTAL · STATUS.
- **(a)** `earnTableContainer.tsx:223` deep-links a portfolio row back to the managing console
  (`/?tab=earn&lp=…`) — a step genuinely saved without hiding anything.
- **(b)** The Temporal Portfolio panel is the **best co-presence surface on any of the three**:
  account equity, account leverage, the 50× cap, headroom, status, the **mark → close gap**, and — the
  part that matters most — the basis stated in words: `"marked at · book mid, your own curve excluded"`
  and `"closes at · best bid / ask, your own curve excluded"` (`app/index.html:909-931`). V5 made
  visible rather than assumed.
- **(b)** The LP bias panel states whether your bias is inside your own spread and, if not, by what
  multiple it is ARBABLE (`app/index.html:548-554`). That is the single most decision-relevant number
  on the LP surface and neither other surface has it.
- **(b)** The self-mark defect was already found and fixed with the reasoning recorded in-line
  (`app/index.html:869-880`): marking at your own curve let you move your own liquidation headroom by
  re-quoting. This is the co-presence constraint applied to a *pricing* input, and it is exactly right.
- **(c)** The sibling's confirm sheet for T2 (its §4.2 step 6–7) and close quote (its §4.4 step 10)
  carry, respectively, the carve and the mark→close gap. Both satisfy the constraint as specified.

---

## 8. Where MORE steps are correct

Six places. In each, the extra step buys either irreversibility protection or information that is
otherwise unobtainable — and in each I say what would be lost by removing it.

1. **Confirmation on any close.** Under V3 a close settles the option *and* its perp slice in one
   irreversible act. Under V5 the price is not knowable until it is asked for, so the second step is
   not a "confirmation" at all — it is **the quote**. Collapsing it either commits at a stale price or
   hands the venue's counterparties a free option. **Counted inside `steps_min`.**
2. **Confirmation on any withdrawal** (trader or LP). Irreversible, crosses a custody boundary.
   Counted inside `steps_min` for T7 and T10.
3. **An extra acknowledgement when an action moves account leverage into a warning band.** Under V4
   perps and perp-options liquidate together against a ~50× cap. A trade that is individually small can
   be the one that takes the account through the band. This step should be *conditional* — it appears
   only when the resulting headroom crosses the threshold — so it costs nothing on the ordinary path.
   (Note: `app/index.html` currently colours at 40× (`:910`) and caps at 50× (`:924`); the sibling
   raises this as its Q10 and I agree it is unresolved.)
4. **Writing an uncapped (naked) short option should cost MORE inputs than a capped one, not fewer.**
   This inverts the reference's `|| 0` behaviour (`TradeInsuranceComponent.tsx:1200-1202`).
   An explicit "uncapped" declaration is one extra act and it is the correct price for unbounded risk.
5. **Manual LP mode.** Opting out of the natural map (V7) means taking on parameter risk the oracle
   would otherwise carry. The extra parameter fields are the honest cost of that choice. It should be
   *opt-in*, never the default, and the oracle-implied values should remain visible as a reference.
6. **The firm-quote accept, when the quote can move between indicative and firm.** This is the sibling's
   argument (its §6.4) and I agree with it, with one refinement: it is load-bearing **only if the quote
   can actually move**. If the venue commits to honouring the indicative price for the size shown, the
   accept step is pure ceremony and should go. That is a product decision, not a UX one → §12 Q-F.

---

## 9. Choice breadth — Hick–Hyman, and where continuous controls lose

### 9.1 The enumerated case, measured

The reference's book is a real enumeration: `components/transact/BookCellsView.tsx:91` records that a
production snapshot flattens to **~14,400 cells (120 strikes × 60 rungs × 2 sides)**. The choice a
taker actually makes is *which strike*, so `n = 120`.

Hick–Hyman, `T = b·log₂(n+1)` with `b ≈ 0.15 s/bit`:

```
log₂(121) = 6.92 bits  →  T ≈ 1.04 s of pure choice time, on top of M
```

### 9.2 The continuous case, measured

Temporal's strike control is a range input over ±60% (`app/index.html:160`, `#tkr`, `min=-60 max=60
step=0.5`). Fitts, `MT = a + b·log₂(2D/W)`, with `a = 0.10`, `b = 0.10`, a ~400 px track, a mean travel
`D ≈ 200 px`, and a target width for ±0.5% of `W = 400/240 ≈ 1.7 px`:

```
MT = 0.10 + 0.10·log₂(400/1.7) = 0.10 + 0.10·7.88 ≈ 0.89 s
```

**They are within ~15% of each other.** So the continuous control does **not** win on time. Anyone
arguing for it on speed grounds is arguing from a number that is not there.

### 9.3 What the continuous control actually wins, and what it costs

**Wins.** It removes a fiction. Under V8 the venue prices any strike from a closed form; an enumerated
ladder would be a sampling of a continuum, and the operator rejected exactly that, twice (entries
550, 551), plus the separate quote box (entry 552). A ladder here would also carry an ongoing
maintenance cost with no referent — which is precisely what `N (rungs/wing)` is in the reference's LP
console (`EarnComponent.tsx:52`): a parameter for a structure Temporal does not have.

**Costs — and this is the real Hick–Hyman result.** With `n → ∞` every strike is equiprobable and the
entropy the user must resolve *rises*, not falls. An enumerated ladder gives the user something for
free that a bare slider does not: **local price gradient by inspection.** Reading two adjacent rungs
tells you what the next 1% of strike costs. A slider that returns one quote for one `k` tells you
nothing about the neighbourhood, so the user must sample — which is *steps*, and they will not appear
in any per-task count because they happen inside one "field entry".

**Therefore:**

> A continuous strike control is optimal **if and only if** the price curve is co-present and
> continuously readable at the moment the strike is chosen. Without it, the continuous control is
> strictly worse than a ladder: it removes anchoring, forces sampling, and hides the gradient.
> A slider-plus-number-box with no curve is the one configuration that is worse than both alternatives.

This is a §7 co-presence requirement, not an aesthetic preference, and it is the exact reason the
operator's own instinct at entry 552 ("why u need box separately") was right: merging the quote into
the curve is not just tidier, it is what makes the continuous control *valid*.

**All three surfaces satisfy it**, which is worth stating plainly: the reference has its chart pane
(`GraphCardWrapperTab.tsx`), Temporal draws the depth cloud on both Earn and Transact
(`app/index.html:97`, `:171`), and the sibling makes the curve pane a permanent right column with the
working strike drag-editable on it (its §3.1 S1c). None of them needs a ladder.

### 9.4 Where enumeration still earns its place

Not for strikes. But for genuinely small, genuinely discrete sets — side (2), buy/write (2), wing when
not carried by a sign (2), LP mode (2) — enumeration is correct and Hick–Hyman cost is under 0.25 s.
Do not convert these to anything cleverer; a 1-bit choice presented as a continuum is a step added,
not removed.

---

## 10. Explicit list — where FEWER steps would be WORSE

Ordered by severity. Each is a design that a naive step-minimiser would produce and that must be
rejected as **invalid**.

| # | The "saving" | Why it is invalid |
|---|---|---|
| **1** | One-click close from the portfolio row | Under V5 the price is not known until asked for, and under V2/V3 the act closes two positions and settles both. A one-click close either prices stale or hides the perp slice. Removes the only place the mark→close gap can be seen. |
| **2** | Auto-carve without showing the perps tab after | V2 moves inventory between two tabs. A silent cross-tab effect is the fastest way to make a ledger untrustworthy — the user's next look at PERPS shows a number they did not authorise. |
| **3** | Defaulting the strike and committing without a deliberate act | A default is not a derivation. A user who never touched the strike control holds a position at a strike they never chose. The *control* may be pre-positioned; the *commit* may not proceed without a deliberate landing. |
| **4** | Dropping account leverage / headroom from the commit surface "because it's on the portfolio page" | V4 makes this the state the next decision depends on. Both existing surfaces do exactly this today (§7 items 2 and 7). This is the single most common invalid saving in the whole analysis. |
| **5** | Blank-means-uncapped on a short option | The reference's `\|\| 0` path (`TradeInsuranceComponent.tsx:1200-1202`). Fewest inputs, unbounded risk. See §8.4. |
| **6** | Removing the LP's bias-budget / ARBABLE readout | `app/index.html:548-554`. It is the only place an LP learns that its view is monetisable against it. A step saved here is a strategy chosen blind. |
| **7** | Collapsing the portfolio's four lines (V9) into a net | The operator specified bought / sold / total lines. A net number cannot answer "which leg is hurting me", and for a spread the two legs move in opposite directions — the net is precisely the number that hides the problem. |
| **8** | Removing the LP withdraw confirmation, or leaving it numberless | Numberless is what the reference does (`EarnComponent.tsx:709-718`), and it is already the wrong answer; removing the step entirely is worse. |
| **9** | Merging BUY and SELL clouds onto one panel to save a tab | Operator entries 560/562 ruled separate tabs. The saving is one click; the cost is two overlapping density fields on one canvas, which is unreadable. |
| **10** | Removing the perp-open step by opening the perp implicitly inside the option ticket | Tempting (it removes a whole ticket) but it commits the user to a perp position and an option position on one confirm, with two liquidation-relevant effects shown at once. Possibly right — but it is a product decision (§12 Q-G), not a step-count optimisation. |

---

## 11. Disagreements — with the sibling document, and with the commissioning brief

Stated openly, per the brief's instruction. I own the quantitative half, so these are counts, not flows.

**With `docs/UX_LIFECYCLE_INTERACTION_SURFACE.md` §6.2:**

1. **T1 "Open perp: side, size, leverage = 4".** I get **3**. Leverage is not an irreducible input under
   V4 — the account is the margin object and per-position leverage is a readout of `notional / equity`.
   The sibling's own S1a spec agrees in spirit (it rejects the per-position liq price for exactly this
   reason) but keeps leverage as an action. I think that is internally inconsistent. **Conditional on
   Q-A**: if isolated per-position margin is offered, the sibling's 4 is right and mine is wrong.
2. **T2 "Write single-leg option: buy/write, strike, size = 4".** Correct for a *naked* write. For the
   **carve** — writing against a perp you already hold, entered from that perp's row — `buy/write` is
   fixed by the task and the wing by the perp's side, so it is **3**. The sibling's own walkthrough
   (its §4.1 step 3, "prefilled with side = the perp you just opened") already has this; its table does
   not. Small, but it is the most common trade in the venue and the difference is 25%.
3. **T8 "LP deploy (oracle): margin, leverage, bias = 4".** I get **2** in the base case. `bias = 0`
   ("quote the oracle") is a complete curve, so a view is optional (+1), and the current app derives
   notional from margin (`app/index.html:82-85`), so leverage may be 0 not 1. Range **2–4**, resolved by
   Q-E. This matters: it is the difference between an LP onboarding in two acts and in four.
4. **`steps_min` for information tasks.** The sibling's law adds `+1 commit` universally. Portfolio
   inspection and LP inspection have no commit; applying the formula there would misprice them. Minor,
   but it affects T5 and T9 in the master table.

**With the commissioning brief:**

5. The brief lists "check portfolio state" among tasks to be counted by `inputs + 1 commit`. As above,
   that formula does not apply to a read. I have used a different bound and said so.
6. The brief classifies overhead into five classes and marks "only the last two are always waste". I
   agree, but I want to widen one label: **"re-entry of derivable data"** should be **"entry of
   derivable data"** — data the venue can derive is waste whether or not the user typed it before. D1
   and D3 in §6 are entry, not re-entry, and they are the two largest.
7. The brief says the operator "has rejected ladder/rung UI twice". Confirmed (entries 550, 551) and I
   have gone further in §9: the rejection is not merely a preference — a continuous control is
   *invalid* without a co-present curve, and correct with one. The result is stronger than the brief
   assumed, but it comes with a condition attached that must not be dropped.

---

## 12. Open product questions surfaced by the counting (NOT resolved here)

These change specific numbers in §4. None is mine to decide.

| ID | Question | What it moves |
|---|---|---|
| **Q-A** | Is Temporal cross-margined at the account level only (V4), or is isolated per-position margin also offered? | `steps_min(T1)` 3 ↔ 4; D1 is waste ↔ load-bearing |
| **Q-B** | Is **partial** close of a perp option offered? If so, does half the option close half the backing slice? | `steps_min(T6)` 2 ↔ 3 (duplicates the sibling's Q4 — same question, reached independently) |
| **Q-C** | Is trader cash-out a separate task, or fused into close by V3? | whether T7 exists at all |
| **Q-D** | Is max-slippage a user-visible control on an RFQ ticket, or a venue default? | `steps_min(T2, T3, T4)` +0 or +1 each |
| **Q-E** | Can an LP choose quoted notional independently of posted margin, or is notional a function of margin and the curve (as `app/index.html:82-85` implies)? | `steps_min(T8)` 2 ↔ 3 |
| **Q-F** | Does the venue honour an indicative quote at the shown size, or can price move between indicative and firm? | whether the firm-quote accept is load-bearing (§8.6) or ceremony |
| **Q-G** | May a trader write an option without first holding the perp — i.e. one composite confirm that opens the perp and writes the option together? | `steps_min(zero → first option)` 6 ↔ 8; also §10 item 10 |
| **Q-H** | Warning band vs hard cap: 40× or 50×? `app/index.html:910` colours at 40, `:924` caps at 50 — and the reference's own liquidation-price maths hard-codes `maxLev = 40` (`CreatePerpComponent.tsx:168`), so the 40 has a provenance and may be the real number. | when the conditional acknowledgement of §8.3 fires |
| **Q-I** | Under V9's four lines, is line 4 the backing perp slice? | whether T5's per-position read is 1 screen or 2 |

Q-B, Q-G and Q-H were also reached by the sibling document (its Q4, Q6, Q10). Independent arrival from
a different method; I take that as corroboration rather than duplication.

---

## 13. Defects found while counting (checkable, with file:line)

Not the assignment, but found by walking the surfaces and cheap to verify. Reported as findings, not
patched — nothing was modified.

| # | Defect | Evidence |
|---|---|---|
| **X1** | **The LP S̄ control is dead.** `render()` writes the `S̄` field at `app/index.html:535-536`, then `calc()` at `:348-351` overwrites `P.Sbar` from the oracle map whenever `ORC.mode === 'oracle'`. Dragging S̄ therefore writes a value that the next render discards. Same class as the tester's earlier FLAG-C1 (`depth`) and FLAG-C2 (`#tkf`). | `app/index.html:351`, `:535-536` |
| **X2** | **The oracle/manual mode toggle does not exist in the DOM.** `$('mdOrc')` and `$('mdMan')` are read at `app/index.html:636` and referenced nowhere else in the file — no `id="mdOrc"`, no `id="mdMan"`. The handlers are guarded (`if(mo&&!mo._w)`) so it fails silently. `ORC.mode` is therefore permanently `'oracle'`, which is what makes X1 permanent rather than intermittent. | `app/index.html:636-642`; zero `id="mdOrc"` declarations |
| **X3** | **The oracle-vol and LP-bias sliders are never rendered.** `$('orcbox')` is written at `app/index.html:537-554` but no element declares `id="orcbox"`. The whole of the operator's entries 571/572 design — oracle IV, per-LP bias, quote-vol, and the ARBABLE bias-budget readout praised in §7 — is computed and then written into a container that does not exist. | `app/index.html:537`; zero `id="orcbox"` declarations |
| **X4** | **Two overlapping navigation systems.** The header offers `Transact · Earn · Portfolio` (`:63`); each panel repeats a tab strip `Transact · Trade Bands · Earn` (`:70`, `:151`, `:189`). `Trade Bands` exists only in the panel strip; `Portfolio` only in the header; and `setView` marks the header's *Transact* link active when the view is `bands` (`:665`). One nav space presented as two. Costs a mode-switch on T4 and makes Trade Bands undiscoverable from the header. | `app/index.html:63`, `:70`, `:663-668` |
| **X5** | **The three trade CTAs are inert.** `Create Position` (`:163`), `Execute Band` (`:196`) and `Create Earn Position` (`:88`, `id="cta"`) have no handlers — grep for `$('cta')` returns nothing. Expected for a prototype and stated here only so the §4 counts are read correctly: **(b)'s counts are of the surface as designed, not of a working commit path.** | `app/index.html:88`, `:163`, `:196` |

X1–X3 together mean the LP half of the operator's entries 571/572 ruling currently has **zero
reachable interaction surface**, while the code that implements it is present and correct. That is a
wiring gap, not a design gap, and it is the cheapest high-value fix on the board.

---

## 14. Summary of findings

1. **The bound is low and the current app is close to it where it exists.** Temporal scores +1, 0 and
   +1 on the three tasks it implements — better than the reference on every one — and implements
   3 of 10 lifecycle tasks. The interaction-cost problem is not that Temporal's surface is expensive;
   it is that seven tasks have no surface.
2. **The reference's overhead is structural, not incidental**: +2 to +3 per task, dominated by
   navigation and mode-switching between a ticket route and a ledger route. Two derivable-entry items
   (the LEVERAGE slider, the market `Select`) and one dead parameter (`N (rungs/wing)`) are the only
   pure waste; the rest is the cost of the route split.
3. **The binding constraint is co-presence, not step count.** Both existing surfaces commit the user to
   liquidation-moving trades without showing account leverage or headroom, and the reference's bands
   close hides the backing perp slice entirely. These are invalid designs at any step count, and no
   amount of step reduction improves them.
4. **A vertical spread is one input more than a single option** — 5 vs 4. Every surface examined
   charges a mode-switch and a re-entry for that one bit.
5. **The continuous strike control wins on principle, not on time** (0.89 s vs 1.04 s), and it is valid
   **only** with the price curve co-present. That condition is met on all three surfaces, so the
   operator's twice-stated rejection of rungs is safe — but the condition must travel with the decision.

---

_Sources: `CLAUDE.md`; `sims/CLOSED_LOOP_MAP.md`; `history/operator/2026-06-10_kurtosis-curve-family-brief.md`
entries 510–518, 550–584. Reference frontend read at
`/tmp/obref/Perp-Options-OB-MM-claude-pricing-engine-go-kleb5s/perp-frontend-hyperliquid-staging/src/`.
Sibling proposal counted from `docs/UX_LIFECYCLE_INTERACTION_SURFACE.md` as at 2026-08-15 12:32 UTC.
Research only — no files under `engine/`, `app/`, or the sibling document were modified._

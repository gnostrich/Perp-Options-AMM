# UX — LIFECYCLE INTERACTION SURFACE (Temporal RFQ venue)

_Research deliverable. Commissioned by the operator, transcript entries **583** and **584**
(`history/operator/2026-06-10_kurtosis-curve-family-brief.md:4171–4186`). Flow / interaction surface
only — screens, state, actions, transitions, step counts. Not visual design._

**Method.** Everything asserted about the orderbook reference is read from the uploaded repo at
`/tmp/obref/Perp-Options-OB-MM-claude-pricing-engine-go-kleb5s/` and cited by path:line. Everything
asserted about Temporal's economics is cited to the operator transcript or to repo docs. Where I am
proposing rather than reporting, the section says **PROPOSAL**. Product calls are not resolved here —
they are in §9.

**Scope note the commissioning brief omitted.** Entry 584 (2026-08-15, same commission, one message
later) adds: _"yes also youd want it to think formally through the number of steps etc from optimality
standpoint"_. That is treated as part of the brief and answered in **§6**.

---

## 0. TL;DR — the five things that decide this surface

1. **The fourth line already exists in the reference and is deliberately hidden.** The OB band group is
   literally `entries: [perp, longRow, shortRow]` (`…/src/lib/data/api/portfolio.ts:482`) and the
   renderer *skips the perp row* (`…/src/components/portfolio/tableContainer.tsx:945–952`). Temporal's
   "up to 4 lines" = **carved perp sliver + bought leg + sold leg + total**, and the line the OB hides
   is exactly the one Temporal must show, because in Temporal the carve is a real transfer of notional
   between two tabs, not an invisible counter.
2. **The reference's cash-out flow does NOT transfer.** In the OB, closing a band credits nothing — the
   payout stands against the perp and money moves only when the *perp* closes
   (`…/perp-backend-staging/settlements/perp/services/perp_service.go:1690–1780`, and the "ONE cash-out
   site" comment there). Temporal is the opposite (entry 511: option P&L *and* its perp cash out
   directly). So the close dialog, the close ordering, and the perp-close gate all have to be rebuilt,
   not ported.
3. **Close is a priced trade, not a claim.** Because payouts are realised via buy/sell rather than
   intrinsic settlement (entry 578), a close must quote at the aggregate with the closer's own curve
   excluded. That makes every close a two-phase quote→accept with an expiry, not a static confirmation
   dialog. The OB's close dialogs are static payout summaries and cannot be reused as-is.
4. **The RFQ deletes exactly three reference surfaces** — the resting book pane, the rung/ladder view,
   and any "your quote vs each other maker" table (entry 566: self and aggregate only). It keeps
   everything else, including the dry-run→submit two-phase pricing, which is already RFQ-shaped.
5. **The current Temporal app has no lifecycle at all.** It has no wallet, no perps tab, no positions
   store (portfolio rows are a hardcoded literal, `app/index.html:867`), no carve derived from actual
   positions (`cf=0.25` constant, `app/index.html:908`), and none of its three primary CTAs are wired
   (`app/index.html:163,196` and `#cta`; `bind()` at `app/index.html:613–662` binds no click handler
   for any of them). It is an exhibit of the pricing object, not a venue. §8 is the gap table.

---

## 1. BASELINE — the flow that exists in the OB reference

All paths relative to `/tmp/obref/Perp-Options-OB-MM-claude-pricing-engine-go-kleb5s/`.

### 1.1 Route + screen inventory

| Route | Screen | Composition | Source |
|---|---|---|---|
| `/` | **Transact** | Two-column: 440px ticket + graph pane | `perp-frontend-hyperliquid-staging/src/app/page.tsx:28–40` |
| `/portfolio` | **Portfolio** | Single card, four tabs | `…/src/app/portfolio/page.tsx`, `…/src/components/portfolio/positionsClient.tsx:97–199` |

Nav is two links only — Transact, Portfolio (`…/src/components/base/NavBar.tsx:31–60`); Markets and
Feedback are commented out. Wallet connect, Docs and Refer sit in the header
(`NavBar.tsx:161–193`).

### 1.2 The ticket (left column of Transact) — three tabs

`…/src/components/transact/PlaceOrderCard.tsx:18, 69–121`:

| Tab | Component | Purpose |
|---|---|---|
| `create-perp` | `CreatePerpComponent` | Open a perp on Hyperliquid |
| `trade-bands` | `TradeInsuranceComponent` | Buy/sell the option structure ("band") on that perp |
| `earn` | `EarnComponent` | Deploy / update / withdraw an LP curve |

Deep-link: `/?tab=earn&lp=<lpId>` selects the tab and loads that curve into the console
(`PlaceOrderCard.tsx:31–36`, `EarnComponent.tsx:133–140`). This is the Portfolio→Manage jump.

### 1.3 The graph pane (right column)

Selector with two entries — "Perp Mark Pricing" and "Order Book"; "Options Pricing" is commented out
(`…/src/components/transact/GraphCardWrapperTab.tsx:29–36`). Per-tab default applied on tab entry:
`create-perp` → candles, `earn` → book with OWN-ONLY forced on; `trade-bands` keeps the last pick
(`GraphCardWrapperTab.tsx:112–119`). Book view choice was collapsed to a single front face by owner
ruling (`GraphCardWrapperTab.tsx:38–63`).

### 1.4 Open a perp — state, actions, sequence

`…/src/components/transact/CreatePerpComponent.tsx:209–556`.

State the user must see to act: mark/entry price (line 371–380), liquidation price (382–427), HL tx
fee % and $ (436–461), Temporal tx fee (464–483), wallet balance chip (280–282), notional derived as
`amount × leverage / mark` (94–103, 297–328).

Controls: LONG/SHORT toggle (219–232) · DEPOSIT amount, debounced 350 ms (28, 84–92) · LEVERAGE slider
(285–295) · symbol select (315–326) · AUTO-PROTECT checkbox (335–363; invalid below 3× — line 48) ·
DEPOSIT FROM radio, Wallet | Hyperliquid Balance (490–522) · CREATE POSITION.

Submit sequence (`…/src/components/transact/MiniComponents/TransferAndPerpButton.tsx:135–259`):
validate connected → validate chain is Arbitrum → validate amount ≥ minimum → *(USDC transfer and the
HL EIP-712 `usdSend` path are both commented out, lines 174–220)* → `createPerpPositionAction` →
toast success carrying the order id. Balance source branches three ways: on-chain USDC read, HL
balance hook, or paper balance (`TransferAndPerpButton.tsx:58–88`).

### 1.5 The perp carve-out as the reference implements it

The reference's carve is a **counter on the perp row**, not a move between tabs:

- `models.Perp.UsedQuantity` — "Track how much quantity has been used in transactions"
  (`perp-backend-staging/settlements/perp/models/perp.go:19`).
- Available = `Σ (btc_amount − used_quantity)` over the wallet's perps, optionally filtered by side
  (`…/settlements/perp/services/perp_service.go:609–625`).
- Opening a band allocates the quantity **FIFO across open perps** and refuses when short
  (`perp_service.go:683–760`), then persists a `TransactionPerpAllocation` row per perp touched
  (`perp_service.go:752–780`).
- The ticket reads the free quantity through `getPerpQuantitiesAction` and exposes it as the MAX chip;
  it refreshes on tab entry and after a submit (`TradeInsuranceComponent.tsx:706–727, 1272`).
- The PERPS table surfaces it only in aggregate, as the "PERPS AVAILABLE" bento (used vs used+available
  per side, `perpTableContainer.tsx:198–224, 294–317`). The per-row `usedQuantity` /
  `availableQuantity` columns exist but are **commented out** (`perpTableContainer.tsx:600–601`).

**Consequence to carry into Temporal:** in the reference a trader with a 1 BTC perp who writes an
option on 0.4 BTC still sees a 1 BTC perp row. Nothing moved. Entry 510 says Temporal must move it.

### 1.6 Trade the option structure — state, actions, sequence

`…/src/components/transact/TradeInsuranceComponent.tsx`.

Shape: always a **two-leg band** — a SELL box and a BUY box, each with quantity + a From (inner) and To
(outer) strike. The user cannot express a single leg.

- Strike bounds come from the API per side and are applied as defaults once per market change
  (`:186–225`); an invalid or empty field is repaired to the default on blur (`:512–545`).
- `%` vs `$` strike entry is a toggle that rewrites all four fields on flip (`:236–283`).
- Two MAX chips on the sell box: **perp availability** (`:764–781`) and **book depth** `max_fillable`
  returned by the dry-run (`:783–806`).
- A debounced (600 ms) dry-run fires on every strike/qty edit (`:161–166, 575–676`) and returns
  `total_amount`, `slippage`, `fees`, `after_curve` (drawn as a trade-impact overlay) and
  `max_fillable`. Rejections are shown inline, never as a toast (`:645–650`).
- Info box shows deposit + BTC notional, Slippage %, Tx Fees % (`:1086–1170`).
- Submit re-sends the identical payload with `IsTransactionDone: true` (`:1224–1247`), i.e. **the same
  call priced twice — indicative then firm.**

### 1.7 Portfolio — four tabs

`positionsClient.tsx:120–197`. A `BOUND VALUE` %/$ toggle lives in the card header and is hidden on
Overview (`:106–111`). Live data arrives over two websockets: user data and HL mid price (`:59–95`).

**OVERVIEW** (`OverviewContent.tsx`) — a stacked-area PNL history chart with four toggleable series
(total / perps / bands / earn, `:32–37, 605–631`), 1H/1D range (`:273–279`), four summary cards, and
three bento stats: TOTAL PNL, TRADER EQUITY, LIQUIDATION FLOOR (`:356–378`). Every aggregate
structurally excludes `origin === "lp"` rows before summing (`:328–347`).

**PERPS** (`perpTableContainer.tsx:364–770`) — columns: ORIGIN · ASSET · NOTIONAL (BTC) · NOTIONAL
(USDC) · DIRECTION · ENTRY PRICE · MARK PRICE · INITIAL MARGIN · P/L · FUNDING · BANDS P/L · TRADER
EQUITY · LEVERAGE · CLAIM. Bento: RISK & COLLATERAL HEALTH (total notional, trader equity, liquidation
margin), PNL SUMMARY (Perps / Bands / TOTAL), PERPS AVAILABLE (long & short capacity bars). Controls:
SHOW CLOSED POSITIONS toggle (`:826–847`) and SCREEN BY ORIGIN checkboxes with **LP default-hidden**
(`:139, 801–823`). An LP-origin row renders "—" in every column that presupposes a trade — entry
price, margin, P/L, funding, leverage, and the close action (`:440–620`).

**BANDS** (`tableContainer.tsx`) — the option ledger. Group = one transaction. Data model is
`entries: [perp, longRow, shortRow]` (`portfolio.ts:482`); the renderer skips the perp row
(`tableContainer.tsx:945–952`), renders each leg, then two per-leg bound sub-rows (`:1001–1002,
1207–1247`), then a **TOTAL** row that carries the sole CLOSE button (`:1011–1120`). Pagination is
**by group, before flattening**, 2 groups per page (`:227–246`). Columns: ORIGIN · BUY/SELL ·
NOTIONAL (BTC) · DIRECTION · VALUE (with basis label) · P/L · INITIAL INNER/OUTER BOUND · RESIDUAL
INNER/OUTER BOUND · CLOSE. **FUNDING is commented out with the reason "the instrument has no funding
term at band level"** (`:629`).

**EARN** (`earnTableContainer.tsx:237–354`) — columns: CURVE (a param digest: S̄, a, γ, N, λ, φ,
spread, skew, peak, plus a quoted-vs-at-rest half-spread reading) · MARGIN (with leverage and
notional beneath) · UTILIZATION (with an explicit basis suffix, "of cap" vs "of capacity") ·
Δ-EXPOSURE in ₿-perp with % of cap and an amber warn at 80% / "at cap — quoting suspended" at 100%
(`:84–89, 274–308`) · FEES EARNED · MARK-TO-BOOK · HEDGE P/L · P/L TOTAL · STATUS. A summary strip
above (`:359–384`) and a footer total row. **Row click = Manage** → deep-links to the Earn console
with that curve loaded (`:219–226`).

### 1.8 Where LP accrued positions show up in the reference

Three places, and this is the pattern worth keeping:

1. **EARN tab** — the curve's own row and the wallet-level summary strip.
2. **PERPS tab** — a *synthetic* row projected from the curve's net perp accrual scalar
   (`…/settlements/perp/services/lp_accrued_perps.go:8–58`). It is explicitly a projection, rebuilt on
   every read, injected only at the two wire sites so it can never be counted as tradeable perp
   inventory (`lp_accrued_perps.go:30–43`).
3. **BANDS tab** — one single-leg row per accrued option position, tagged `isLpRow`, carrying the
   instrument label (wing + strike), a signed quantity, the average fill premium in ₿, a value basis
   (bid/ask/model) and a P/L labelled **ex-fees** (`portfolioTransforms.ts:151–179`,
   `tableContainer.tsx:478–620`).

Both injected views default to hidden and are excluded from every trader-economics aggregate.

### 1.9 LP console (Earn tab)

`EarnComponent.tsx:313–790`. Curve parameter fields with per-field bounds and a "Reset to defaults"
(`:317–347`); MARGIN + balance chip; LEVERAGE slider capped at 10× (`:376–390`); derived NOTIONAL;
**SCHEDULE PREVIEW** — rungs, Σ notional, peak strike, half-spread (dial), Σ posted premium, notional $
(`:440–528`); an LP LEVERAGE readout against its cap with a breach banner (`:643–670`). CTAs branch on
deployment state: **DEPLOY CURVE**, or **UPDATE / WITHDRAW / CLOSE ACCRUED POSITIONS** (`:676–765`).

`CloseAccruedDialog` is the important one: a pre-confirm estimate listing each accrued position with a
backend-computed `closable` predicate that already applies **the closer's own-rungs exclusion**, the
skipped rows shown explicitly, a total-est-proceeds line, and the backend's refusal text rendered
verbatim (`…/src/components/transact/MiniComponents/CloseAccruedDialog.tsx:60–332`). This is the
direct ancestor of Temporal's "close excludes your own curve" and should be reused wholesale.

### 1.10 Close, and where money actually moves

- **Close a band** — CLOSE on the TOTAL row → dialog showing each leg's position value and PNL →
  `completeTransactionAction` (`tableContainer.tsx:1088–1119`). Backend: settle the engine band,
  write `net_band_payout`, `slippage_charge = |mtm − payout|`, `tx_fee`
  (`…/settlements/services/complete_transaction.go:31–143`). **No cash moves.**
- **Close a perp** — CLAIM on the perp row → dialog with a position card and an explicit payout
  breakdown: Payout Summary (= trader equity), Hyperliquid Withdrawal Fee −$1.00, Slippage Charge,
  Final Payout, plus a "funds may take a few minutes" warning (`perpTableContainer.tsx:655–766`).
  Backend `ClosePerp` settles **every band ever allocated to this perp first**, fails closed if any
  cannot settle, then credits — and it is documented as "the trader side's ONE cash-out site"
  (`perp_service.go:1690–1790`).
- **Account equity** = `perp.InitialUSDMargin + perp.PnL + Σ tx.NetBandPayout`, per (wallet, side)
  (`…/settlements/services/settlements_service.go:435–469`). Perps and options genuinely share one
  equity pot — the concept Temporal needs — but it is computed **per side**, not per account.

---

## 2. WHAT DOES NOT TRANSFER, AND WHY

| Reference surface | Status for Temporal | Reason |
|---|---|---|
| Order Book graph pane, book stream, `bookStore` | **Delete** | No resting book. Entry 554/577: RFQ, makers quote curves, matching is best-quote-across-makers. |
| Rung/ladder views (`PRICE × STRIKE`, `SIZE × STRIKE`, `PRICE × SIZE`), `BookCellsView` | **Delete** | Operator rejected ladder/rung UI twice; there is nothing to snap to (`app/index.html:99` — "Nothing is pre-posted; there is no rung to snap to"). |
| `max_fillable` as a *book depth* chip | **Reframe, keep** | Depth is continuous along the aggregate curve. The number stays (the size at which the landed price degrades past a threshold); the vocabulary "book depth" goes. |
| Per-maker quote table ("their quote" by name) | **Delete** | Entry 566 — a participant sees only SELF and AGGREGATE. Already applied in the current app (`app/index.html:706–716, 723–728`). |
| "Makers leaning the other way / cross-match" readout | **Delete** | Entry 577 — that framing was removed; matching is the ordinary best-quote thing. |
| Band close credits nothing; only `ClosePerp` cashes out | **Invert** | Entry 511 — option P&L *and* its backing perp cash out directly on the option close. |
| `used_quantity` as an invisible counter on a full-size perp row | **Replace with a visible move** | Entry 510 — the carved notional *leaves* the perps portfolio. |
| Fixed two-leg band ticket (4 strikes always) | **Replace with a leg model** | Temporal has single-leg perp options; the vertical spread is the *second* leg, not the default. |
| Static payout confirm dialogs | **Replace with quote→accept** | Entry 578 — a close is a trade at the aggregate, so it has a price and an expiry. |
| Dry-run → firm-submit two-phase pricing | **Keep verbatim** | Already exactly RFQ-shaped (`TradeInsuranceComponent.tsx:575–676` then `:1224–1247`). |
| ORIGIN tagging + SCREEN BY ORIGIN + "—" for inapplicable cells | **Keep verbatim** | The cleanest solution in the reference; Temporal has the same trader-vs-LP-row problem. |
| Own-exclusion in the close estimate (`closable`) | **Keep and generalise** | Entry 578 asks for exactly this, on every close, not just LP sweeps. |

---

## 3. SCREEN & STATE INVENTORY — Temporal (PROPOSAL)

### 3.0 State model (what the app must hold)

| Entity | Fields the surface reads | Notes |
|---|---|---|
| **Account** | equity, notional, account leverage, cap (≈50×), headroom, liq status, free collateral | Perps + perp options, one pot. **LP excluded** (entry 514). |
| **Shared wallet** | long club / short club membership, this account's share | Entry 510: one wallet for all longs, one for all shorts. |
| **Perp position** (per side, aggregated) | size, VWAP entry, mark, unrealised P&L, funding accrued, **free size**, **carved size**, initial margin, leverage | Aggregated across opens (entry 510). Funding applies here and only here. |
| **Carve record** | option-position id, side, size, entry px, equity carved | The join between the two tabs. Frozen at open. |
| **Option position** | id, wing, strike(s), per-leg side, size, premium paid/received, mark (aggregate **ex-own**), close px (correct side, **ex-own**), value, Δ, backing carve ref, status | **No funding** (entry 515). |
| **Quote** | id, side, legs, size, aggregate price, landed price at size, fee, your-fill share if you are also a maker, **expiry**, indicative-vs-firm | RFQ artifact; has no analogue in a resting-book UI. |
| **LP curve** | mode (oracle+bias \| manual), params, bias, margin, leverage, capacity, density share by strike, inventory by strike, fees earned, inventory MTB, hedge P&L, total P&L, utilisation, status | Entries 571/572. |
| **LP accruals** | net perp exposure (Δ readback), per-strike option inventory | Projections, never tradeable inventory. |

### 3.1 Screens

**Nav: TRADE · PORTFOLIO · EARN.** Earn is promoted out of the ticket to a top-level route. Reason:
in the reference it is a ticket tab, but an LP's session shares almost nothing with a taker's — it has
its own chart semantics (own cloud vs aggregate), its own lifecycle, and its own portfolio tab. Making
it a sibling of Trade removes a mode the taker never wants and an owner never leaves.

---

#### S1 · TRADE (route `/`)

Two columns. Left = ticket, right = curve pane. Ticket tabs: **PERP** and **OPTION**.

**S1a · TRADE ▸ PERP** — purpose: put on / add to the perp that everything else is built on.

| | |
|---|---|
| **Must show** | mark; your existing perp on this side (size, entry, free vs carved); resulting size and entry after this fill; leverage and the **resulting account leverage vs the 50× cap** (not a per-position liq price — see §9 Q3); margin required; fee; collateral available |
| **Actions** | side (Long/Short) · size **or** margin (one field, unit-switchable) · leverage · CONFIRM |
| **On confirm** | opens on Hyperliquid through the shared wallet for that side; account equity and perp free size update; user stays on the ticket with a result strip offering "write an option on this" |
| **Not on this screen** | deposit-from radio (account setting), auto-protect (account setting) |

**S1b · TRADE ▸ OPTION** — purpose: buy or write a perp option, optionally as a vertical spread.

| | |
|---|---|
| **Must show** | the aggregate curve with your position on it; **perp backing required for this size vs your free perp** — adjacent to the size field, because the trade is refused without it; the quote (price, landed price at this size, fee, expiry countdown); **the carve preview: "this removes X BTC from your PERPS tab"**; resulting account leverage |
| **Actions** | BUY / WRITE toggle · strike (input + drag on the curve) · size · **+ ADD LEG** (turns it into a vertical spread; the second leg gets its own strike and inherits the wing) · REQUEST QUOTE / CONFIRM |
| **State transitions** | idle → indicative (debounced, on any edit) → firm (on CONFIRM, quote frozen with expiry) → filled \| expired \| rejected |
| **Carve interlock** | if free perp < required, the ticket shows the shortfall inline with a one-click "open the missing X BTC perp first" that pre-fills S1a and returns. It must not be a dead error. |

**S1c · TRADE ▸ curve pane** (right column) — the depth cloud, one side per tab (BUY / SELL, entries
559–563), with an AGGREGATE / YOU toggle where "YOU" is the acting participant's own curve only
(entry 566). Your working strike and size are marked on it and drag-editable. **No book, no ladder.**

---

#### S2 · PORTFOLIO (route `/portfolio`)

Tabs: **OVERVIEW · PERPS · OPTIONS · EARN**. Header carries the account strip (see below) on every tab
— it is the thing that liquidates, so it is never one click away.

**Account strip (persistent):** account equity · account notional · **account leverage / 50× cap ·
headroom** · status. LP excluded, stated on the strip so the exclusion is not folklore
(entry 514).

**S2a · OVERVIEW** — P&L over time with four series (perps / options / earn / total), the account
strip expanded, and a **carve summary**: carved notional, equity carved, perps-tab-after-carve. The
last three already exist in the current app (`app/index.html:911–915`) but are computed from a
constant; they become derived.

**S2b · PERPS** — the trader's *free* perp inventory. Columns: ORIGIN · ASSET · SIDE · SIZE · ENTRY ·
MARK · MARGIN · **FUNDING** · UNREALISED P&L · LEVERAGE · **CARVED (n positions)** · CLOSE. The CARVED
cell is a count + size that links to the matching OPTIONS rows; the SIZE column shows free size only,
with total available on hover/expand. Screen-by-origin checkboxes with LP hidden by default, per the
reference.

**S2c · OPTIONS** — the option ledger, grouped per position, four lines each. Full model in §5.

**S2d · EARN** — per-curve rows + summary strip; row click = Manage → S3 with that curve loaded. §7.

---

#### S3 · EARN (route `/earn`)

Left: the LP console. Right: your own cloud vs the aggregate.

| | |
|---|---|
| **Mode switch** | **ORACLE-INDEXED** (default) — oracle IV + your bias; or **MANUAL** — all params. Entries 571/572. Already prototyped in the current app (`app/index.html:267, 309–310, 351, 537–553`). |
| **Must show (oracle mode)** | oracle IV · your bias · your resulting quote vol · the parameters it solved to (read-only, so the map is legible) · **your density share of the aggregate**, because that is what sets pro-rata fills (entry 575) · capacity · half-spread · margin, leverage, LP leverage vs cap |
| **Must show (manual mode)** | every param with bounds, plus the same capacity/spread/leverage block, plus the oracle-implied values shown as a ghost so the LP can see how far off it is |
| **Actions** | DEPLOY · UPDATE (requote) · WITHDRAW · **CLOSE ACCRUED POSITIONS** |
| **Lifecycle states** | undeployed → deployed/quoting → suspended (at cap) → withdrawing → closed |

---

## 4. LIFECYCLE WALKTHROUGHS

Notation: `[screen] action → state change`.

### 4.1 Open a perp

1. `[S1a]` set side = Long, size = 1.0 BTC, leverage = 5× → ticket shows margin required, fee,
   resulting account leverage.
2. `[S1a]` CONFIRM → order routes to Hyperliquid through the **long shared wallet**; account equity
   −margin; perp position (long) size 0 → 1.0 BTC, **free 1.0 / carved 0**.
3. `[S1a result strip]` offers "write an option on this" → S1b, prefilled with side = the perp you
   just opened.

State after: `PERPS` shows one long row, size 1.0, CARVED 0. `Account leverage` reflects the perp.

### 4.2 Write an option on it — the carve, explicitly

4. `[S1b]` WRITE · strike +12% · size 0.4 BTC → the ticket shows, adjacent to the size field:
   **"backing required 0.4 BTC · free 1.0 BTC ✓"**, and below the quote: **"carve: −0.4 BTC from
   PERPS"**.
5. `[S1b]` an indicative quote streams as you edit (debounced); the aggregate price, the landed price
   at 0.4 BTC, fee, and expected premium receipt are all on one line.
6. `[S1b]` CONFIRM → quote goes **firm** with a visible expiry; a confirmation sheet restates: premium
   you receive, the carve (0.4 BTC at entry E, equity carved $X), and the resulting account leverage.
7. `[S1b]` ACCEPT → three state changes, all of which must be visible in the result strip:
   - **PERPS**: long perp free 1.0 → **0.6**; carved 0 → **0.4**; the row's CARVED cell reads "1
     position · 0.4 BTC" and links out.
   - **OPTIONS**: a new position group appears with four lines (§5) — line 1 is the carved 0.4 BTC
     perp sliver, frozen at entry E.
   - **Account**: equity unchanged at the instant of the carve (notional moves between buckets, it does
     not leave the account); premium received credits equity; account leverage recomputes over
     `perps + options` together.

The carve is a **move, not a deduction.** The single most important flow property: the trader must be
able to point at the 0.4 BTC in the OPTIONS tab and see it is the same 0.4 BTC that left PERPS. Two
affordances make that true and both are required: (a) the CARVED cell in PERPS links to the option
group, and (b) line 1 of the option group names the perp it came out of.

### 4.3 See it in both tabs

8. `[S2b PERPS]` long row: size 0.6 free, CARVED 0.4 (1 position →). Funding accrues on the whole 1.0
   or on 0.6 only — **open question, §9 Q5.**
9. `[S2c OPTIONS]` position group, four lines, §5. Marked at the aggregate **excluding your own curve**
   if you are also an LP; the mark basis is stated on the tab, not buried
   (the current app already does this: `app/index.html:924` "marked at · book mid, your own curve
   excluded").

### 4.4 Close, and cash out

10. `[S2c]` CLOSE on the position's TOTAL line → a **quote**, not a confirmation: the venue prices the
    unwind at the aggregate with your own curve excluded, and shows:

    | line | number |
    |---|---|
    | option legs closed at | best bid/ask ex-own, per leg |
    | option P&L | premium received − close cost (± per leg) |
    | **mark → close gap** | the honest slippage of exiting vs the mark you were shown |
    | backing perp sliver closed at | mark |
    | perp sliver P&L | (mark − entry) × 0.4 |
    | fees | |
    | **net cash out** | the single number that lands |
    | expiry | countdown |

11. `[S2c]` ACCEPT → the option position closes **and its 0.4 BTC perp sliver closes with it**
    (entry 510/511). Both P&Ls cash out in one settlement.
12. State after: OPTIONS group moves to closed (visible under SHOW CLOSED); PERPS long row CARVED
    returns to 0 and size stays 0.6 — **the sliver does not come back as free perp** (entry 511:
    it closes, it does not return). Account equity += net cash out.

**Partial close** is undetermined — §9 Q4.

### 4.5 Close the remaining perp

13. `[S2b]` CLOSE on the perp row → quote at HL mark → confirm → position closes, equity settles.
14. **Gate:** a perp with a nonzero CARVED cell cannot be closed while options stand on it. The
    reference enforces exactly this server-side and fails closed with a reason string
    (`perp_service.go:1755–1775`) — surface that as a disabled CLOSE with the reason on the row
    ("0.4 BTC backing 1 option position"), plus a "close those first" link. Never a silent disable.

### 4.6 LP lifecycle

1. `[S3]` mode = ORACLE-INDEXED, set margin + leverage + bias → preview updates: capacity, half-spread,
   your density share of the aggregate, LP leverage vs cap.
2. `[S3]` DEPLOY → curve quoting; a row appears in `S2d EARN`.
3. Fills accrue → the EARN row's Δ-exposure, fees earned, inventory MTB and P/L move; accrued
   *option inventory* appears in `S2c OPTIONS` tagged LP (default hidden) and accrued *net perp
   exposure* in `S2b PERPS` tagged LP (default hidden). Neither enters account equity or the 50× cap
   (entry 514) — and that exclusion is stated on the LP rows themselves.
4. `[S3]` UPDATE re-quotes without touching inventory; **CLOSE ACCRUED POSITIONS** unwinds the
   inventory with the curve still deployed, priced with the own-curve exclusion and a per-row
   `closable` predicate; WITHDRAW ends the curve.

---

## 5. THE PORTFOLIO LINE MODEL — resolving "up to 4 lines"

**Finding.** The reference's own data model is already four lines and hides one:

```
portfolio.ts:482 →  entries: [ perp, longRow, shortRow ]
tableContainer.tsx:945–952 →  if (isPerp) return;   // skip rendering perp row
tableContainer.tsx:1013+ →  TOTAL row synthesised from the two legs
```

So: **perp · bought leg · sold leg · total**. The reference hides the perp line because in the OB the
carve is invisible bookkeeping. In Temporal the carve is the economics, so the line comes back.

### 5.1 The four lines

| # | Line | Exists when | What it is |
|---|---|---|---|
| **1** | **BACKING PERP** (the carved sliver) | always | The perp notional this position removed from the PERPS tab, frozen at entry. Closes with the option. |
| **2** | **BOUGHT LEG** | single-leg buy, or the long leg of a vertical | The option you are long |
| **3** | **SOLD LEG** | single-leg write, or the short leg of a vertical | The option you are short |
| **4** | **TOTAL** | always | The net position: net value, net P&L, net Δ. **Carries the CLOSE action** — one action per position, exactly as the reference does (`tableContainer.tsx:1011–1120`). |

A single-leg option therefore shows **3** lines (backing + one leg + total); a vertical spread shows
**4**. "Up to 4" is exactly right and this is why.

### 5.2 Columns per line

Line-type-aware, with an explicit "—" for concepts that do not apply to that line — the reference's
absence vocabulary, which is the right one and should be copied
(`perpTableContainer.tsx:440–620`, `tableContainer.tsx:1207–1247`).

| Column | Backing perp | Leg (bought/sold) | Total |
|---|---|---|---|
| INSTRUMENT | `BTC-PERP (carved)` | `BTC call +12%` / `BTC put −10%` | position name |
| SIDE | Long / Short | Bought / Written | — |
| SIZE | BTC carved | contracts (BTC notional) | net |
| ENTRY | perp entry px, frozen | premium paid/received per unit | — |
| MARK | perp mark | **aggregate mid, own curve excluded** | Σ |
| **CLOSE PX** | perp mark | **best bid/ask, own curve excluded** (side-correct) | — |
| VALUE | size × (mark − entry) | size × close px × S | net value |
| P&L | perp sliver P&L | premium ± close cost | net P&L |
| **MARK → CLOSE GAP** | — | per leg | **net exit friction** |
| Δ | 1.0 × size × side | ∂V/∂S per leg | **net Δ** |
| FUNDING | perp funding accrued | **—** (entry 515: no option funding) | perp leg only |
| ORIGIN | opened / LP | opened / LP | — |
| ACTION | — (closes with the position) | — | **CLOSE** |

Three columns are non-negotiable and none of them exist in the current app: **CLOSE PX distinct from
MARK** (they differ by the spread, and one is what you are shown while the other is what you get);
**MARK → CLOSE GAP** (the honest exit friction, already computed in the current app as `closeCost`,
`app/index.html:906`, but only at account level, never per line); and **FUNDING = "—" on option
lines** so the absence is a stated fact rather than a blank.

### 5.3 Grouping and paging

Page **by position, before flattening**. The reference learned this the hard way — row-level pagination
split a group across pages (`tableContainer.tsx:240–262`). Copy the fix, not the bug.

---

## 6. STEP-COUNT / OPTIMALITY (operator entry 584)

### 6.1 The law

> **A step is a control the user must touch that changes the economics of the trade, plus exactly one
> commit.** Anything else is a *setting* (belongs on an account preferences surface), a *default*
> (belongs in the state), or a *readout* (belongs adjacent to the control it qualifies).

Lower bound for an action = |irreducible decisions| + 1 commit. Two-phase RFQ pricing adds **at most
one** step (accept a firm quote) and only when the quote can move between indicative and firm.

### 6.2 Measured against the reference

| Action | Irreducible decisions | Optimal steps | Reference steps | Reference overhead |
|---|---|---|---|---|
| **Open perp** | side, size, leverage | **4** | 4 required + 2 optional (auto-protect, deposit-from) — `CreatePerpComponent.tsx:335,490` | +2 settings on the critical path |
| **Write single-leg option** | buy/write, strike, size | **4** | **7**: sell qty, sell market, sell From, sell To, buy From, buy To, commit — the ticket cannot express one leg | +3, structural |
| **Vertical spread** | buy/write, strike₁, strike₂, size | **5** | 7 (as above) | +2 |
| **Close an option** | which position | **2** (click + accept quote) | 2 (click + confirm static payout) | 0 steps, but the reference's second step is not a quote |
| **Close a perp** | which perp | **2** | 2 | 0 |
| **LP deploy (oracle mode)** | margin, leverage, bias | **4** | n/a — no oracle mode exists | — |
| **LP deploy (manual)** | 6 params, margin, leverage | **9** | 9 (`EarnComponent.tsx:333–390`) | 0 |
| **Zero → first option position** | (open perp) + (write option) | **8** across two tickets | 11+, with a tab switch and a stale MAX chip in between | +3 and a dead-end error |

### 6.3 The five reductions that follow

1. **Default the option ticket to one leg.** −3 steps on the most common action. The vertical spread
   is `+ ADD LEG`, one step, which is the correct price for a genuinely two-leg structure.
2. **Move settings off the ticket.** Deposit-from, auto-protect and %/$ unit are account preferences,
   not per-trade decisions. −2 steps on every perp open. (The %/$ toggle in particular is a *unit*, and
   a unit that rewrites four fields on flip — `TradeInsuranceComponent.tsx:236–283` — is a step tax
   levied every session.)
3. **One size field, unit-switchable** (BTC / $ / margin) instead of separate deposit and notional
   fields with a derived third. The reference computes notional from deposit×leverage÷mark
   (`CreatePerpComponent.tsx:94–103`); users think in whichever unit they think in. Doesn't reduce
   the count, removes the arithmetic.
4. **The carve shortfall must be a step, not a wall.** Today, insufficient perp availability produces
   `"Error: Max available is X BTC"` (`TradeInsuranceComponent.tsx:467`) and the user must leave, open
   a perp, come back, and hope the MAX chip refreshed (it refreshes on tab entry only,
   `TradeInsuranceComponent.tsx:716–720`). Making it an inline "open the missing X BTC" converts a
   4-step detour into 1.
5. **Never make the user re-derive a number the venue already has.** Every quantity on the confirm
   sheet — carve size, resulting account leverage, mark→close gap, net cash out — is computed by the
   venue and must be shown, or the user substitutes a guess. This is a step-count argument: an
   unshown number is a step the user takes outside the app.

### 6.4 Where a step must NOT be removed

- **The firm-quote accept.** RFQ prices expire. Collapsing quote and accept into one click either
  prices a stale quote or opens a free option on the venue. Keep two.
- **The close quote.** Same reason, and it is the operator's entry-578 mechanism. A one-click close
  cannot honour "priced at the aggregate excluding your own curve" because that price is not known
  until it is asked for.
- **The carve disclosure.** The confirm sheet must state the carve even though the user implicitly
  chose it by choosing the size. It changes what is in another tab; silent cross-tab effects are how
  users lose trust in a ledger.

---

## 7. LP SURFACE — accrued positions, apportionment, P&L

### 7.1 Where each LP fact lives

| Fact | Screen | Form |
|---|---|---|
| Curve identity & params | `S2d EARN` row + `S3` console | Param digest, mode badge (oracle+bias / manual) |
| Capital committed | `S2d` MARGIN column + summary strip | margin, leverage, notional |
| **Apportionment / share** | `S3` console **and** `S2d` row | Your **density share of the aggregate**, by strike — this is what determines pro-rata fills (entry 575). A single scalar "utilisation %" is not sufficient; the share is strike-dependent, so it must be a small curve or a banded readout, aligned to the same strike axis as the cloud. |
| What you were filled into — **options** | `S2c OPTIONS`, ORIGIN=LP, default hidden | One row per (wing, strike): net qty, avg fill premium, value with basis, P&L labelled **ex-fees** |
| What you were filled into — **net perp** | `S2b PERPS`, ORIGIN=LP, default hidden | One synthetic row, size + mark; entry, margin, leverage, funding and CLOSE all render "—" |
| Inventory Δ / hedge need | `S3` + `S2d` Δ-EXPOSURE column | ₿-perp, signed, with % of cap and the at-cap/quoting-suspended state |
| **P&L decomposition** | `S2d` columns + footer | fees earned · inventory mark-to-book · hedge P&L · **total**. Keep them separate — an LP's fee income and its inventory mark move in opposite directions and a single number hides the business. |
| Exit | `S3` CLOSE ACCRUED (inventory only) vs WITHDRAW (the curve) | Two distinct, differently-toned actions. The reference's separation is correct. |

### 7.2 Rules the LP surface must carry

- **LP is excluded from the account** (entry 514). Every LP row that appears in a trader tab must be
  excluded from that tab's aggregates *structurally*, and say so on the row. The reference does this
  with an explicit pre-filter rather than relying on zeros (`OverviewContent.tsx:328–335`,
  `perpTableContainer.tsx:162–167`). Copy the discipline.
- **Own-curve exclusion everywhere a price is quoted to you** — mark, close, and the accrued-close
  estimate. The reference already computes `closable` with the own-rungs exclusion server-side
  (`CloseAccruedDialog.tsx:84–90`); the current Temporal app already excludes own curve for mark and
  close (`app/index.html:880–898`). Unify these into one rule stated once on the surface.
- **State the basis on the cell.** bid / ask / model, ex-fees vs fee-inclusive, "of cap" vs "of
  capacity". The reference is rigorous about this and it is the difference between a number and a
  claim.
- **Bias is a repositioning, not a mispricing** (entry 575). The console should show bias as "where my
  liquidity sits relative to the aggregate", i.e. a shift of the density, with the resulting share
  change — not as "how wrong I am".

---

## 8. DELTAS VS THE CURRENT TEMPORAL APP (`app/index.html`)

Current surface: nav Transact / Earn / Portfolio, with Transact carrying sub-tabs Transact / Trade
Bands / Earn (`app/index.html:63, 70, 151, 189`).

| Area | Current state | Verdict | What is needed |
|---|---|---|---|
| Wallet / account identity | "Connect Wallet" button with no handler (`:64`; `bind()` `:613–662` binds nothing to it) | **Missing** | Connect, shared-wallet membership, balances, collateral |
| **Open a perp** | No screen at all | **Missing — the lifecycle has no step 1** | S1a |
| PERPS portfolio tab | Does not exist; perp notional is two constants `clubL=4000000, clubS=3000000` (`:908`) | **Missing** | S2b, with free vs carved |
| Option positions | Hardcoded array of three positions (`:867`) | **Missing** | Real positions store, S2c |
| **Perp carve** | A "Carve" card computing off a constant carve fraction `cf=0.25` (`:908–915`) | **Wrong** | Derive from actual option positions; make it a visible move between tabs (§4.2) |
| **4-line position model** | Flat table: instrument / strike / size / mark / close px / value / Δ (`:215`) | **Wrong shape** | §5: backing perp + legs + total, per position |
| P&L per position | Absent — no entry premium, no P&L column | **Missing** | Entry premium, P&L, mark→close gap per line |
| **Close** | No close action anywhere | **Missing — the lifecycle has no exit** | Quote→accept close, §4.4 |
| Close pricing model | Correct and already built: close px = best bid/ask, own curve excluded (`:895–898`) | **Transfers** | Surface it per-line, not just in the Liquidation card |
| Mark model | Correct: book mid, own curve excluded, with the self-mark defect documented and fixed (`:872–886`) | **Transfers** | — |
| Account equity / leverage / 50× cap | Present (`:907–910, 920–931`) | **Transfers, with a bug** | `lev>40` colours red while the stated cap is 50 (`:910` vs `:920`) — two thresholds, one of them wrong |
| Vertical spreads | "Trade Bands" builds a two-strike structure (`:192–196`) but has no leg model, no perp backing, no size limit, and **"Execute Band" has no handler** (`:196`) | **Partially wrong** | Leg model with single-leg default; backing check; quote lifecycle |
| Quote lifecycle | No indicative/firm/expiry; no quote object | **Missing** | Two-phase pricing (the reference's pattern transfers verbatim) |
| Ticket CTAs | "Create Position" (`:163`), "Execute Band" (`:196`), "Create Earn Position" (`#cta`) — **none wired** | **Missing** | — |
| RFQ fill breakdown | Correct: one aggregate price apportioned pro-rata, own leg itemised, others aggregated into one row (`:717–730`) | **Transfers** | Keep; it is the taker-side apportionment story |
| Depth cloud, aggregate/self toggle | Built to the operator's entries 559–566 | **Transfers** | Reuse as the S1c pane |
| **LP oracle+bias mode** | Built: oracle IV, bias, mode toggle (`:267, 309–310, 351, 537–553`) | **Transfers** | Add the density-share readout; wire deploy/update/withdraw |
| LP accrued positions | Nowhere — no EARN portfolio tab, no LP-origin rows | **Missing** | §7 |
| ORIGIN tagging / screen-by-origin | Absent | **Missing** | Port from the reference verbatim |
| Funding | Perp funding absent; option funding correctly absent | **Half-missing** | Perp funding column; option funding as an explicit "—" |
| Show-closed / history | Absent | **Missing** | Closed positions, and a P&L history series |

**Blunt summary.** The current app is an excellent exhibit of the *pricing object* — aggregation,
density, own-exclusion, oracle+bias — and it gets three subtle economic points right that the
orderbook reference never had to face (self-mark exclusion, close-price exclusion, one aggregate price
apportioned pro-rata). It contains approximately **none** of the trade lifecycle: no way to open a
perp, no way to hold a position, no way to close anything, and no account the positions belong to.
The reference has all of that and almost none of the pricing object. The build is a graft of the
reference's *ledger and lifecycle* onto Temporal's *pricing object* — not an extension of either.

---

## 9. OPEN QUESTIONS FOR THE OPERATOR

Not resolved here. Each blocks a specific surface.

**Q1 — Is the fourth line the carved perp?** §5 argues yes, on the evidence that the reference's own
group is `[perp, bought, sold]` + total and hides the perp. Confirm, or name the fourth line
(alternatives: a net-of-spread line; an inner/outer bound breakout as the reference renders per leg).
_Blocks: the OPTIONS tab row model._

**Q2 — Is EARN a top-level route or a ticket tab?** Reference makes it a ticket tab; §3.1 proposes
promoting it. _Blocks: nav._

**Q3 — Per-position liquidation price, or account-level only?** Entry 514 sets an account-level
~50× cap. The reference draws per-position liquidation prices (`CreatePerpComponent.tsx:166–206`) and
this repo's own note records that account-level aggregation "was not found ⇒ target design"
(transcript entry 514 context). Does the perp ticket still show a per-position liq price, and if so
how is it reconciled with the account cap the user is actually liquidated on? _Blocks: S1a readouts,
account strip._

**Q4 — Partial close of an option position.** Entry 511 pairs the option close with its backing perp
sliver. If a trader closes half the option, does half the sliver close? Is partial close offered at
all? _Blocks: the close ticket and the carve record's mutability._

**Q5 — Does the carved perp sliver accrue perp funding while the option is live?** The transcript
flags this as an open crux (entry ~502 context: "does the carved origin-perp slice already accrue perp
funding during the band's life?"). Entry 515 rules out *option* funding, which is a different
question. _Blocks: the FUNDING column on line 1 and on the perp row._

**Q6 — Can a trader write an option without holding the perp** (i.e. does the ticket open the perp
implicitly as part of one composite confirm), or is the two-ticket sequence mandatory? §6.3(4)
proposes an inline shortfall fix that keeps them separate. _Blocks: S1b's carve interlock and the
zero-to-position step count._

**Q7 — Closing a perp that has carved slivers standing against it.** Proposal §4.5: disabled with a
reason plus a "close those first" link, mirroring the reference's fail-closed server rule. Or should
the venue offer a compound "close everything on this perp" action? _Blocks: S2b's CLOSE affordance._

**Q8 — Does a taker see maker-side detail at all?** Entry 566 forbids a *participant* from seeing
individual makers. Does that bind the taker's fill breakdown too (currently: your own leg itemised,
everyone else aggregated — `app/index.html:723–730`), or only the maker's competitive view?
_Blocks: the fill-breakdown panel._

**Q9 — Quote validity window.** How long is a firm RFQ quote good for, and what happens on expiry —
auto-refresh with a re-accept, or fail? _Blocks: every confirm sheet._

**Q10 — Is the account-leverage warning threshold 40× or 50×?** The current app uses both
(`app/index.html:910` vs `:920`). Presumably a warn band below a hard cap — confirm the numbers.
_Blocks: the account strip._

**Q11 — What is shown for LP mark/close when the LP *is* the only maker at a strike?** Own-curve
exclusion has no residual book to price against. _Blocks: the close estimate's absence vocabulary._

---

## 10. NOTES ON DISAGREEMENT (per the brief's instruction)

1. **The commissioning brief omitted entry 584**, which is part of the same operator commission and
   asks for formal step-count reasoning. Included as §6.
2. **The brief states the four lines are "bought / sold sides / total etc"** and asks me to work out
   the fourth. I disagree with the implied reading that the fourth is another option-side line: the
   reference's data model settles it as the perp, and that is also the line Temporal's economics needs
   most. Stated as a finding, with Q1 left open for the operator.
3. **The brief states "P&L for the perp option + its perp cashes out directly", framed as flow to
   extract from the reference.** The reference does the exact opposite — a band close credits nothing
   and only `ClosePerp` moves money, by explicit design and with a long comment defending it. That is
   a genuine inversion, not a detail; §2 flags it as **do not port**.
4. **"Roughly a 50× cap"** — the current app enforces 50 but colours at 40. One of the two is wrong
   and I did not pick (Q10).
5. I did **not** treat "most of the flow is the same" as licence to port the reference's screens. Four
   of its surfaces are RFQ-incompatible and one of its core money flows is inverted; §2 is the
   explicit accounting.

---

_Research only. No files under `engine/` or `app/` were modified._

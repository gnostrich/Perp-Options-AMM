# UX FORMALISM — the standing framework for Temporal's interaction surface

_Owner: the `ux` agent (`.claude/agents/ux.md`). Established by the manager on operator entry 585.
This is the binding document: placements and costs are decided **by rule** here, not re-argued per
change. If a rule does not decide a case, extend the rule — do not make a one-off placement._

Operator's instruction, verbatim:

> take a call on all open UX questions, retain a persistent agent to formally check optimise steps /
> glances across all UX lifecycle possibilities and to grasp the possible design choices in terms of
> representation on UX so its not an idiosyncratic task to modify each time like the payout thing vs
> account-in etc. these should be taken in-stride by persistent UX agent using the appropriate
> formalisms so I can abstract away interactions with the core iygwim

---

## 1. The objective function

Two currencies, both counted, neither traded off silently.

| currency | unit | what it measures |
|---|---|---|
| **steps** | KLM/GOMS operators — point, click, keystroke, mental-prepare, system-wait | what the user must **do** |
| **glances** | distinct information lookups — a fixation on a value not already in working memory | what the user must **find** |

```
cost(task) = steps(task) + glances(task)          both reported separately, never netted
```

**A change that cuts steps while adding glances is usually a regression.** Collapsing two screens into
one modal removes a navigation step and adds three glances if the modal hides what the previous screen
showed. State both numbers or the claim is not made.

## 2. The lower bound

```
steps_min   = (irreducible inputs not already in context) + 1 commit
glances_min = |decision-relevant state at the moment of commit|
```

**Irreducible input** = information the user genuinely must supply; a degree of freedom that cannot be
defaulted, derived or inferred. Known **derivables** in this venue, none of which may cost a step:

| quantity | derived from |
|---|---|
| quoting level | oracle vol → natural map → S̄ |
| close price | the aggregate, closer's own curve excluded |
| perp sliver released on close | the option size closed |
| fill routing | pro-rata by capital — there is no routing choice |
| put price | parity `C − P = −k` from the call |

## 3. THE HARD CONSTRAINT — no decision may be made blind

You are **not** minimising cost. You are minimising cost **subject to**: a step or glance may not be
removed if it is the only place the user sees state needed for the next decision.

> A design that removes cost by hiding decision-relevant state is **INVALID**, not optimal.

Corollary — **mirroring**: a quantity whose home is elsewhere must still be *co-present* with any
control whose outcome it determines. Home is set by §4; co-presence is set by this rule and overrides
it.

### 3.1 Where MORE cost is correct
Irreducible by safety, not to be optimised away:
1. **Firm-quote acceptance.** An RFQ quote is a price with an expiry; accepting is a distinct act.
2. **Close quotes.** A close is a trade at the aggregate (own curve excluded), so it has a price.
3. **Carve disclosure.** Writing an option removes notional from the perps tab. That transfer is shown
   before commit, always.
4. **Anything moving account-level liquidation risk.** Perps and perp-options liquidate together in
   one account (~50× cap; LP excluded). A change in headroom is disclosed at commit.

## 4. REPRESENTATION TAXONOMY — where a quantity lives

This is the part that stops each change being an idiosyncratic argument. Classify on three axes; the
first two give the **home**, the third gives any **mirror**.

**Axis A — ownership:** does it belong to a *position*, or to the *account*?
**Axis B — persistence:** is it a **stock** (standing state, true until changed) or a **flow** (an
event that happened at a time)?
**Axis C — decision-relevance:** is it needed *at the moment of* some commit? If yes, mirror it next to
that control regardless of home (§3).

| A × B | home | form |
|---|---|---|
| position × stock | **position row column** | a cell on the row it belongs to |
| position × flow | **position row, expandable** | event under its own row; row shows the running total |
| account × stock | **account strip** | always-visible, never behind a tab |
| account × flow | **ledger / event feed** + a toast at the moment it happens | itemised, with a pointer back to the position that caused it |

### 4.1 The worked case the operator named: payout vs account-in
A close payout is `account × flow` → its **home is the account ledger**, with a toast at the moment of
credit, and a **back-pointer to the closing position**. It is *also* decision-relevant at the close
commit, so by §3 the *estimated* payout mirrors into the close ticket. It does **not** become a
permanent column on the position row, because it is a flow, not a stock.

That is the rule. It settles the same question for close P&L, funding credits, fee rebates, liquidation
proceeds and LP accruals without re-arguing any of them.

### 4.2 When the taxonomy does not decide
Extend it and record the new rule here. Do not place by taste and move on — a one-off placement is the
failure mode this document exists to prevent.

## 5. DECISION RECORD

Rulings are permanent. A question answered once is not re-opened without new information. `manager`
entries are the manager's calls on operator entry 585; the `ux` agent owns everything after.

| # | question | ruling | rule applied | by |
|---|---|---|---|---|
| Q1 | Is the fourth portfolio line the carved perp? | **Yes.** Single leg = 3 lines (perp sliver · option leg · total); vertical spread = 4 (perp sliver · bought · sold · total). | §4 position×stock. The reference's own model is `[perp, bought, sold]`+total and it *hides* the perp row — but in Temporal the carve is a real transfer of notional between tabs, so the row it hides is the one we must show. | manager |
| Q2 | Is EARN a top-level route or a ticket tab? | **Top-level route.** | LP is a distinct persona with its own lifecycle (post curve → inspect apportionment → withdraw), not a mode of trading. Burying it in a ticket costs a mode-switch on every LP task. | manager |
| Q3 | Per-position liquidation price, or account-level only? | **Account-level only.** No per-position liq price anywhere. The ticket shows the **marginal effect of this trade on account headroom**. | §3 — a per-position liq price when liquidation is account-level is *false* decision-relevant state. Showing it is worse than showing nothing. | manager |
| Q4 | Partial close of an option? | **Yes**, one fraction slider; the backing sliver closes in the **same proportion**. | Any other rule creates orphaned collateral or an unclosable residue. **Core consequence flagged:** the carve record must be fractional/mutable. | manager |
| Q5 | Does the carved sliver accrue perp funding? | **RULED BY THE OPERATOR (entry 586): yes — a carved perp is still a perp and retains everything a perp has.** Line 1 is a full perp row with the *same columns as any perp*, funding included. No reduced "sliver" row type, and no new object type in the model. | §7 — the carve is a display/earmarking operation, not an economic one. | **operator** |
| Q6 | Can a trader write an option without holding the perp? | **Yes — one composite confirm** that opens the perp and carves in a single action, with both legs itemised before commit. | §2 — the two-ticket sequence is the 11-vs-8 step overhead, and it is pure navigation, not information. §3.1(3) keeps the disclosure. | manager |
| Q7 | Closing a perp that has slivers standing against it? | **Compound close** — "close everything on this perp", slivers itemised in the confirm. Not fail-closed-with-a-link. | §2 — fail-closed costs more steps for no safety gain once the compound action is disclosable. | manager |
| Q8 | Does a taker see maker-side detail? | **No.** Aggregate only. Your own leg is itemised only when you are yourself a maker in that fill. | Operator entry 566 ("you cant see individual makers only self and aggregate") binds the taker too — a taker seeing who filled them leaks the same information. Matches shipped behaviour. | manager |
| Q9 | Quote validity window? | **Expiry with a visible countdown; on expiry, re-quote requiring re-accept. Never silently re-price.** Placeholder 10s pending real latency data. | §3.1(1). The *behaviour* is the ruling; the number is a parameter. | manager |
| Q10 | 40× or 50×? | **Both, and labelled.** 50× hard cap = liquidation; 40× = warn band. The defect was that nothing said so. | §3 — an unlabelled colour change is state the user cannot act on. | manager |
| Q11 | LP mark/close when the LP is the only maker at a strike? | **Mark** falls back to the oracle-derived curve (it exists independently of any maker). **Close** reads "no counterparty — cannot close". | §3 — inventing a close price where no counterparty exists is fabricated decision-relevant state. The oracle is a real, already-present source; a close price would not be. | manager |

### 5.1 Escalated to the operator — NOT decided here
- ~~**Q5 economics**~~ — **RULED, entry 586.** See §7.
- **Q9 parameter:** the actual quote validity window, once latency is known.

---

## 7. THE CARVE IS A DISPLAY OPERATION (operator entry 586)

> carbed perp is still perp and retains everything perp has

This is a general rule, not one answer, and it retires a whole class of future questions.

**Carving does not create a new economic object.** When an option is written on a perp, the affected
notional is **earmarked and re-listed**, nothing more. The perp continues to:
mark, accrue funding, carry unrealised P&L, contribute to account-level margin and the ~50×
liquidation test, and hold its entry price and size — **exactly as it did before the carve.**

**Consequences that follow without further argument:**
1. **Line 1 is a full perp row.** Same columns as the perps tab, funding included. There is no reduced
   "sliver" row and no special-case formatting.
2. **No new type in the model.** A carved perp is a perp with a binding tag (which option it backs).
   Any code path that branches on "is this a sliver" is a defect.
3. **Anything true of a perp is true of it.** Do not ask the question per property. Funding, mark,
   margin contribution, liquidation weight, P&L — all yes, by this rule.
4. **Only two things change:** which tab it is listed under, and that it is bound to an option (so it
   cannot be closed independently — Q7's compound close).
5. **Total lines are consistent by construction:** perps tab + carved lines = the account's whole perp
   position, always. Any UI that lets those disagree is wrong.

**Test for any future carve question:** would the answer differ for an uncarved perp? If not, the
carve does not change it. That is the whole rule.

## 6. Standing obligations
1. Every proposal reports **steps and glances** against §2, with the counting shown.
2. Every placement cites the **§4 cell** it followed.
3. Every removal of a step or glance states why §3 is not violated.
4. Every new quantity introduced by a **core** change is classified here before it reaches a screen.
5. Anything that is really an economics question is **escalated**, not silently picked.

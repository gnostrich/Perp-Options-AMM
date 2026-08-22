# ux — memory

**Role established 2026-08-15, operator entry 585.** Persistent owner of the interaction surface:
optimise steps AND glances across the lifecycle, hold the representation taxonomy so recurring
placements are decided by rule, absorb core changes and derive the surface consequence — so the
operator does not think about UX when the core moves.

## Binding documents
- `docs/UX_FORMALISM.md` — objective, lower bounds, blind-decision constraint, taxonomy (§4.1–§4.5),
  decision record Q1–Q20. **Binding.**
- `docs/UX_LIFECYCLE_INTERACTION_SURFACE.md` — screens/state/actions + lifecycle walks.
- `docs/UX_INTERACTION_COST_ANALYSIS.md` — quantitative baseline (KLM; master table §4).
- `docs/UX_ENDUSER_REVIEW_build39.md` — **my end-user review of build 39** (operator entries
  607/608), findings F1–F17, top-10 fix list handed to the manager 2026-08-22.

## Decision record state
- Q1–Q15: ruled (operator/manager) — see formalism §5. Bundle atomic, carved perp = full perp row,
  account-level liq only, no per-position liq price, origin column + checkbox (Q13), Earn duration
  triple Δ·q-weighted (Q15), dormancy divider = the pricing rule (entries 606/607).
- **Q16–Q20 ruled by me (build-39 review):** dormancy drawn on the LP's own curve (greyed dormant
  segments; % pair is a summary mirror — taxonomy §4.4); sim controls (divergence dial, vol/turnover
  sliders) out of commit cards into a labelled SIMULATION drawer (§4.5); depth cloud stays with
  plain-quote priority at the point of action + hover on the Transact cloud; vocabulary rule
  (decision-relevant → plain-named, internal → off surface); loop findability (one nav, Open Perp
  ticket, back-pointer toasts).
- Still escalated: Q9 parameter (quote TTL, placeholder 10s in `views_ticket.js`); funding accrual
  missing from the lifecycle store (F15 — build item, manager's queue).

## App state as of build 39 (`app/index.html` + modules)
The app now HAS a lifecycle: `lifecycle.js` (Life store — openPerp/openBundle/closeBundle/closePerp/
account/ledger, invariants enforced), `paper.js` (paper wallet, seed $1M, settle+conserved),
`views_perps.js` (Perps tab + account strip — good), `views_ticket.js` (firm-quote + close tickets,
**written to the formalism but NEVER invoked by index.html**), `book.js` (one Book for trade/mark/
close, self-exclusion correct).

**The invalid states I flagged (do not let anyone call these trade-offs):**
- Close acts at a hardcoded `closePx:0.14` (`index.html:774`) while the row displays the real
  self-excluded close px it ignores; opens record `entryPx:0` legs → fictional payouts. (F1)
- Portfolio Account/Carve cards are hardcoded literals ($4M/$3M) disagreeing with the live
  `LIFE.account()` strip on the Perps tab. (F2)
- `PAPER.settle` never called — payouts never reach the wallet; ledger never rendered; on-screen
  text claims settlement moves money. (F3)
- Portfolio positions table has no carved-perp line → close decision blind to its dominant leg. (F4)
- "Executed on Hyperliquid" (Earn/Transact) vs paper reality; identity switcher switches wallet
  view only while all positions stay one global store. (F5/F6)
- Entry-607 LP ruling violated: no long/short exposure-limit inputs; two capital numbers (margin +
  `cap` param); leverage/notional presented around the inputs. (F7)
- `Life.openPerp` has no UI — loop step 1 inexpressible. (F14a)
- Q13/Q15 not implemented; "Create Earn Position" is a toast with no state change. (F8)

## Discipline
Cite file paths. Show step and glance counts. Never remove cost by hiding decision-relevant state.
Escalate economics rather than picking. Hand edits back to the manager; he is the sole git actor.
Reference tree (`/tmp/obref/...`) is ephemeral; four of its surfaces are RFQ-incompatible and its
cash-out flow is inverted — cite, don't port.

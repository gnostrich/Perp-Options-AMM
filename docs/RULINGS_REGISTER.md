# RULINGS REGISTER — prose side of the executable gate
_Executable half: `sims/scripts/ruled_surface_check.js` (RED = hand-back blocked). This file carries
the rulings a script cannot assert. Owner: operator-interface agent (entry 617)._

| entry | ruling | enforcement |
|---|---|---|
| 554/568/569 | RFQ: makers differ freely, fills split, no CCP framing | book model + prose |
| 566 | you see SELF and AGGREGATE only | script: no competitor names |
| 580→606/607 | dormancy divider is THE pricing rule | script + book_model_check |
| 586 | a carved perp is still a perp — no sliver type | lifecycle_check |
| 587 | 5 lines max; no naked option; bundle atomic, closes in full | lifecycle_check + script |
| 592/593/594 | LP owns option leg only; pro-rata = N LPs per position; ledger fact not screen fact | lifecycle_check (payout asymmetry) |
| 607 | LP inputs = exposure limits ONLY | script |
| 609 | no third column; core vs collapsible | script |
| 610/611 | trader surface = v28/protect conventions; drift = regression | script (bg, layout) |
| 614/615/616 | IA: TRANSACT{create perp, trade bands, earn} + PORTFOLIO; options pricing chart in $ strikes | script |
| 617 | interaction contract + this register; operator states a thing ONCE | operator-interface agent |
| 618/619 | legacy UI condemned and archived; new FE is the base | archive path |
| 547/548/550/551 | quotes are CONTINUOUS — no rungs/ladder ever (said FOUR times) | script: no-rungs + hover-quote |
| 552 | quote lives ON the chart (hover), no separate box as the only quoter | script: hover-to-quote |
| 559/560→609 | bid+ask curves on ONE page (dormancy ⇒ no overlap); no buy/sell tabs | script |
| 558/604 | operator could not see delivered visuals, TWICE — visuals ship inline + on the live URL, viewability confirmed | contract §2 |
| 596/597 | operator time-box ("1 hr tops", said twice) — scope to it, report against it | contract §2 |
| 605 | version-control survey + hard archiving; only current work in working folders | archive/ + VERSION_CONTROL_SURVEY |
| 624 | visible build stamp mandatory on every deployed artifact | script + contract §5 |
| 625 | backdrop must be VISIBLE (overlay ≤0.6); CHECK REFERENCE ASSETS FIRST — the asset was byte-identical, 3 builds lost | script + contract §5 |
| 627 | the terminal-mono design language is CONDEMNED (rejected 5×: 612/621/624/625/627) | prose — new FE required |
| 628 | NOT a reskin: IMPORT the reference frontend's actual elements/components; operator NEVER reports stamp numbers — zero diagnostic burden on the operator | contract §5; script keeps stamp for MANAGER reads |

## REPEAT LOG — corrections the operator had to give ≥2 times (each = a defect against the manager)
_Mined 2026-08-22 by operator-interface over entries 540–628. A repeat means the register/check was missing when the second message arrived._

| repeat | entries | what the manager missed | check now |
|---|---|---|---|
| rungs/discretisation | 546→547→548→550→551 (FIVE messages) | imported the OB ladder after "not literal"; then left residual rungs + a sampled sheet through two more turns | YES — no-rungs + hover-quote (added 2026-08-22) |
| "not literal" / version conflation | 546, 548, 620, 622, 623 | ported OB structure/mechanics instead of grammar; operator threatened to nuke the repo by hand | YES — no-OB-vocabulary tripwire (added 2026-08-22) |
| buy/sell tabs + outward fade | 559, 560, 561 | operator re-sent their OWN messages ("nust rendering not fuciing reading"); manager rendered before reading | YES — one-page bid+ask + subtab whitelist |
| OB invariant into RFQ | 554, 568, 602 | crossed-book/common-level imported THREE times into a bookless RFQ | book_model + register prose (554/568/569 row) |
| aggregation ordering | 574, 579, 580 | operator "so again reiterating…"; manager had built envelope-first, spread-before-aggregation | dormancy-divider check (e606/607) |
| LP inputs = exposure limits only | 604, 607 | leverage/notional inputs survived one full turn after the ruling | YES — e607 pair |
| trader surface unchanged / v28-protect | 610, 611, 612, 616 | drifted the trader surface, invented "Trade Bands" as a sibling nav + a "Perps" top-level | YES — nav/subtab/backdrop checks |
| same visual result rejected | 612, 621, 624, 625, 627 | FIVE rejections; causes found serially (no stamp → buried backdrop → design language → wrong method: reskin vs import) because diagnosis was never done up front | stamp + overlay-alpha checks (added 2026-08-22); e628 method is prose — next FE must IMPORT elements |
| couldn't see visuals | 558, 604 | delivered images/illustrations the operator couldn't open, twice | contract §2 delivery rule (prose — not scriptable) |
| interaction/process | 617, 626 | ad-hoc prompting, no notes, no protection | THIS system: contract + register + OPERATOR_NOTES + mandatory pre-hand-back audit |

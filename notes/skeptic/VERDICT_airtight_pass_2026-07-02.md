# SKEPTIC VERDICT — airtight-spec pass, paper/wine2026/temporal_wine2026_v2.tex (uncommitted, branch claude/exciting-archimedes-txs2wx) — 2026-07-02

Evidence: `git diff` on the tex; re-derived against engine source `engine/builds/HEAD_temporal_mvp_v28_lens.html`
(executeBand ~L1885–1960, openBand ~L2540–2600, closeBand ~L2085–2260) and
`notes/research/STORY_COMPLETENESS_AUDIT_2026-07-02.md` (gaps 1,2,3,7,12).

## VERDICT: FLAG ×2 — NOT clear-to-commit as-is. Both are one-clause fixes inside the new §6 "Execution mechanics" (tex ~L725–753).

**FLAG-WRONG — Law 4 (payout law) misstates the shipped design twice.**
(a) "the counterparty is the **club — the pooled equity of the other side**": the engine's counterparty
club is the SAME club the band was carved from — `openBand(..., clubSide)` carves from
`state.clubs[clubSide]` and `closeBand` settles against `state.clubs[b.entry.perp_club_side]`; nothing in
the code or the audit record (gap 7: "Bands are backed by a SIDE's perp club") says "other side."
(b) "payouts are **floored by the club's remaining equity**": the shipped floor is BINARY —
`if (raw_net > 0 && club.equity <= 0) { trader_payout = 0 }` — a partially-drained club pays the FULL
`L0·raw_net·equity` even when it exceeds remaining equity; there is no min-cap at remaining equity
(audit gap 7's words: "a drained club pays a winning trader NOTHING"). Steelman for (b): perhaps the
min-cap is the intended design and the binary zero its crude engine form — but the subsection's own cover
is "specification-level statements of the **shipped** design," so as written it claims the engine does
something it doesn't. The cover is honest for laws 1,2,3,5; law 4 defeats it in these two clauses.
(Minor, subsumed: the club takes the (L0−1) share, the trader's carved equity carries the 1×; "the
counterparty is the club" unqualified is loose.)

**FLAG-OVERSELL — Law 3 (two-strike rule): "reused verbatim at close, so the pool's reserves round-trip
exactly" is unconditional; the shipped close is two-case.** An ITM leg is settled-to-cash with NO AMM
reversal (closeBand: "The ITM leg is priced by the unified formula ... and is NOT pushed through the
AMM"; only the live leg reverses), so exact reserve round-trip holds per REVERSED leg / in the both-OTM
close — the ITM leg's open swap stays in the pool. As written, law 3 contradicts the paper's own §6.2
two-case settlement. Steelman (the frozen-K_tx guarantee is real — it is the $1395-leak fix, and every
leg that DOES reverse restores exactly) survives only with a qualifier; the unqualified sentence does not.

## The other checks (attacks attempted, held)
1. **Accuracy, laws 1/2/5 + inventory #16:** law 1 (N_buy=V_sell/v_buy, V_buy=V_sell exact, pool never
   a premium counterparty) matches executeBand L1913–1930 exactly, including the sequencing (bought leg
   priced on the post-sold-leg pool). Law 2 (Δy=±N·K_tx, premium never enters pool, same-direction legs)
   matches executeLeg/gap 2. Law 5 (live γ=w/(1−w), only m static) is precisely the audit's FLAG-E fix,
   as is the §4.1 live-lean clause. **The new subsection nowhere asserts trade-point conservation —
   the inventory-#16 reserve-point regression is NOT accidentally papered over.** "Shipped design, not
   machine-checked" framing: honest for 1,2,3,5 (all audit-verified built); see FLAG on 4.
2. **Gloss bar (entry 344):** one nit — "(sequenced)" in law 1 has no one-line plain-English twin
   ("priced on the pool as it stands after the sold leg has executed"). Everything else in the new text
   carries its gloss (premium-free, club, carve→§6.2, mode/rays→§4.1, live lean, rate-vs-routing).
3. **Sweep honesty:** deletions checked line-by-line — trusted-from-prover/never-"verified",
   grounded-vs-carried, posited-surplus hedge, |Γ|>1 disclosure, Snell placeholder all intact; the
   provenance cut is a genuine dedup. Limitations swap is legitimate: sizing is now specified by law 1;
   cash-transfer routing correctly moved INTO the open list (matches audit FLAG-C + new §3.3 clause).
   "Periodically rebases"→"on each oracle update" matches gap 11. One content note: the worked-table
   explainer dropped the m=1 boundary value ($66.67) and the boundary-fraction 1/(g_loc+1) one-liner —
   tabular rows byte-identical, not a hedge, acceptable; but it is prose adjacent to the "byte-comparable
   worked-example table," so recorded here.
4. **Scope:** no annex (L1–L13) changes, no superscript changes, no §5 tabular-number changes; all hunks
   accounted for in the four declared buckets.

**Resolution path:** fix law 4's two clauses to the shipped semantics (same-club counterparty; drained-club
zero floor — or relabel the min-cap as design intent, not shipped) and qualify law 3's round-trip to the
reversed legs / OTM close. With those, plus optionally the "sequenced" gloss, this pass is commit-clean.

— skeptic (re-derivation performed against engine source this turn; no edits to artifact or engine)

---

## RE-CLEAR PASS (same date, follow-up on FLAG ×2 above)

Scope: the manager's three clause edits (law 3, law 4, law 1 gloss) on the uncommitted tex. Each
re-derived against engine source THIS turn (not taken from the manager's confirmation):

- **FLAG-WRONG (law 4) — DISCHARGED.** (a) Tex now: "the position's own club---the pooled equity of
  the side the position was carved from" — matches `closeBand`: `state.clubs[b.entry.perp_club_side]`
  (same side as the carve); "other side" is gone. (b) Tex now: "a drained club pays nothing: positive
  payouts stop once club equity reaches zero" — matches the binary floor
  `if (raw_net > 0 && club && club.equity <= 0) { trader_payout = 0; club_delta = 0 }` exactly:
  binary, positive-payout-only, no min-cap claim. Bonus clause "at leverage L0 frozen at open"
  checked too: `const L0 = band.entry.L0` — frozen at entry, accurate (placement inside the club
  gloss is slightly awkward but not wrong).
- **FLAG-OVERSELL (law 3) — DISCHARGED.** Round-trip is now scoped to "every leg reversed on the
  pool at close, so those swaps round-trip the reserves exactly," with the explicit exception "an
  in-the-money leg is settled to cash instead---no pool swap---per the two-case rule of
  Section~\ref{sec:settlement}." Matches the engine's LOCKED two-case comment (ITM leg
  settled-to-cash, no AMM transaction; OTM leg reversed). `\label{sec:settlement}` exists (L712).
- **Gloss nit — fixed.** Law 1: "sequenced pool state (the bought leg is priced on the pool as the
  sold leg left it)".

New-inaccuracy / bare-jargon sweep of the three edits: "two-case rule" is defined in
§sec:settlement two paragraphs above; "carved from" carries its §6.2 gloss (prior pass); "drained
club pays nothing" is plain English. Nothing new unglossed, nothing new claimed beyond the engine.
Structural checks re-run independently: math-$ 562 even (15 escaped currency \$ excluded),
braces balanced 0, dangling refs = none.

## RE-VERDICT: CLEAR-TO-COMMIT.
The FLAG ×2 halt is lifted. (Unchanged residue from the original pass, not blocking: the
worked-table explainer's dropped $66.67 / 1/(g_loc+1) one-liner, recorded above as acceptable.)

— skeptic (re-derivation performed against engine source this turn; no edits to artifact or engine)

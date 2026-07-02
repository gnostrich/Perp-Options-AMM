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

---

# 2026-07-02 (later) — FOCUSED GATE: "go all" lab-review fix pass (6 edits + 2 figure trims, uncommitted)

Scope: the working-tree diff to `paper/wine2026/temporal_wine2026_v2.tex` (six manager-authored
edits responding to the lab review, plus two tikz height trims). Operator authority: entry 349
verbatim ("go all..."), read in `history/operator/2026-06-10_kurtosis-curve-family-brief.md`.
Engine re-derivations performed MYSELF this turn against
`engine/builds/HEAD_temporal_mvp_v28_lens.html` (Node sandbox, same load path as
`lens_selfcheck.js`); nothing taken from the manager's verification note.

## FLAG-WRONG — edit 5, the clause "a momentary push on the pool cannot produce a discontinuous settlement gain" (tex ~L676-683)

Counter-derivation (engine, shipped opposite-wing product): pool `mkPool(10,800000,0.5)`,
oracle 80000, m=2; open band sold-call θ=1.1 / bought-put θ=0.9 via `executeBand`; push the pool
with an external `tradeUpdate` to bisect the sold leg's regime boundary (sNorm0 = 1.1); call
`closeBand` just below vs just above:

    eps=0.001 below (both-OTM branch): X=0.10558528 Y=0.07858616 payout=-0.02699912
    eps=0.001 above (soldITM branch):  X=0.10558528 Y=0.09464373 payout=-0.01094155
    payout JUMP = +0.016058 · carvedEquity · L0, fixed as eps→0 (identical at eps=10/0.1/0.001)

X — the leg crossing its own boundary — is continuous to 8dp: L10 / the composite-ray closed form
does exactly what it claims. The jump is in Y, the OTHER leg: the both-OTM branch prices the
bought leg on the pool AFTER the sold leg's at-strike reversal (`s_after_X`,
`tradeUpdate(s, dyRevSold)`, closeBand ~L2192-2202), while the soldITM branch prices it on the
UN-reversed pool (`legPrice(s, ...)`, ~L2165) because an ITM leg has no pool swap. `dyRevSold` is
a fixed size (N·K_tx), so the branch flip moves the bought leg's pricing state by a fixed amount
and the trader payout is genuinely discontinuous in the pool's marked price. Same-wing control
(sold-call 1.1 / bought-call 1.2, the CM6 harness geometry) jumps -0.2588 — larger, same
mechanism. So an arbitrarily small pool push across a leg's regime boundary changes the
settlement payout by a finite amount: precisely the sentence's "cannot." The cited backing
(value continuity, L10, a16 no-jump) covers the MARK function of one leg — it does not cover the
branch-dependent sequencing of the settlement protocol, which is where the discontinuity lives.
Steelman for the sentence: "the ITM leg's own value is continuous, so no cliff-edge intrinsic
grab exists" — true, verified above, and a sentence scoped to THAT would be backed. The shipped
sentence claims more.

## FLAG-OVERSELL — edit 5, "only the in-/out-of-the-money regime test reads the pool's marked price" (same sentence, first half)

Engine-verified TRUE: cash conversion reads the feed (`state.oracle`, state-layer closeBand
~L2671; openBand ~L2544), financing strike = frozen dollar K_tx (R-218 block, ~L2099-2110),
regime test is pool-mark-referenced (`sNorm0 = poolMark(s,oNow,oracle_initial)/oNow`, ~L2074).
But "only" is false: the settlement AMOUNTS themselves read the pool — the ITM leg's
settled-to-cash value is `legValueUnified(s, ...)` and the reversal leg's value is
`legPrice(s, ...).V`, both evaluated on the live pool state at close (~L2160-2202). A reader
being reassured about manipulation will take "only the regime test" to mean pool pushes can at
most flip a harmless binary bit; in fact a pool push moves every close value continuously (that
is the mark, disclosed elsewhere — fine) AND flips the branch discontinuously (the FLAG-WRONG
above). The enumeration is honest about the three auxiliary inputs; the word "only" is not.

## FLAG-OVERSELL — edit 6, incentive claim 2: "the frozen transaction strike makes an open-then-close cycle return the pool's reserves exactly, so the cycle is not a money pump" (tex ~L845-847)

This resurrects, unconditional, the exact claim I flagged and the manager discharged EARLIER IN
THIS SAME FILE (law 3, this verdict's first section): round-trip exactness holds per REVERSED
leg; an ITM leg settles to cash with NO pool swap, so its opening swap remains in the pool —
which edit 3 of this very diff states in Limitations ("the residual arises when an in-the-money
leg settles to cash, so its opening swap remains in the pool"). One diff now asserts the
unconditional exact cycle in Related-work and concedes its exception in Limitations. Law 3's
scoped wording is settled ground; claim 2 is broader than the law it says it restates.
Steelman: "cycle" could be read as the pure nothing-went-ITM cycle — but the money-pump question
is precisely about the trader who CAN steer a leg ITM (see FLAG-WRONG above for what the
boundary is worth), so the unscoped reading is the one that matters.

## PASSES (attacks attempted, held)

- **Edit 6, claims 1/3/4:** each re-checked against its cited law. Claim 1 restates §3.3's rate
  law (proportional to anchor deviation, crowded pays contrarian) — no magnitude, no convergence
  claim; "congestion pricing" is a label. Claim 3 composes law 2 (premium never enters pool) +
  law 4 (payouts come from the club): "LPs exposed to lean, never to option payouts" is exact on
  payouts. Claim 4 = law 4 verbatim (same-side club, binary zero-equity stop). "Built-in pressure
  toward balance": acceptable — immediately hedged ("None of this replaces an equilibrium
  analysis") and consistent with §3.3's own no-neutralisation hedge; advisory nit only: the
  "pressure toward balance" is supplied by funding alone, claims 2-4 are safety properties.
  NOTE claim 2 itself is flagged above.
- **Edit 2 (§4.1 design target):** claim-reducing and accurate — the power law IS enforced by the
  mark's definition; "derivation from the pool's own trade mechanics remains open" aligns with
  the standing inventory-#16 requirement rather than contradicting it. No hedge weakened.
- **Edit 3 (Limitations):** residual sourcing matches the engine's LOCKED two-case comments
  (ITM = settled-to-cash, no AMM transaction; reversed legs restore reserves exactly — CM6
  green). Cross-strike externality sentence does not contradict §2: it relabels the §2 mechanic
  from the non-trading strike's viewpoint and says so ("the core mechanic ... read as an
  externality, unquantified here"). Honest.
- **Edit 4 (§7 instance disclosure):** pure hedge-strengthening (lensed American construction not
  yet an instance of the L11 stack). Accurate per the existing "not wired to production" text.
- **Edit 1 (intro):** one framing sentence, consistent with entry-349's operator guidance; no
  claim added.
- **Scope (d):** diff contains exactly the six edits + two height trims (5.4→4.7cm, 5.2→4.6cm,
  page-budget only); the only other modified file in the tree is the entry-349 transcript append.
  Annex/superscripts untouched. PASS.

## VERDICT: NOT CLEAR-TO-COMMIT — FLAG-WRONG ×1 + FLAG-OVERSELL ×2, all confined to edit 5's
final sentence-half and edit 6's claim 2. Edits 1/2/3/4, edit 5's first half (minus "only"),
edit 6's claims 1/3/4, and both figure trims are clear as-is. Halt condition applies to
committing the flagged clauses into the submission; I name the holes and stop.

— skeptic (numeric counterexample re-derived twice — opposite-wing product geometry and same-wing
control — against HEAD engine this turn; probes in scratchpad, reproducible from the verdict text)

---

## RE-CLEAR PASS 2 (2026-07-02, follow-up on the "go all" FLAG-WRONG ×1 + FLAG-OVERSELL ×2)

Scope: the manager's two rewordings on the uncommitted tex (edit-5 settlement clause; edit-6
incentive claim 2), checked against my own measurements only. Full diff re-swept hunk-by-hunk for
(b) residual total-payout-continuity / unconditional-round-trip sentences. All engine re-derivation
performed MYSELF this turn (Node sandbox, lens_selfcheck load path); probes
`reclear_probe.js`/`reclear_cycle.js` in scratchpad, reproducible from the text below.

### Edit-5 reworded — CLEAR. Both prior flags on it DISCHARGED.
Clause-by-clause against my measurements: feed cash conversion (`state.oracle`, openBand L2544 /
state-layer close) — verified prior pass; frozen dollar K_tx (R-218 block, re-read this turn
L2093–2103) — verified; "Settlement *values* are pool-mark reads — that is the construction's
point" — now OWNS the amounts (`legValueUnified(s)`/`legPrice(s)` at close), which is exactly what
the deleted "only" denied: OVERSELL discharged; regime test pool-mark-referenced (`sNorm0 =
poolMark/oNow`, L2074) — verified; "a leg crossing that boundary settles at a value continuous
across it ... no cliff-edge intrinsic grab at the boundary itself" — precisely my 8dp
X-continuity measurement, per-LEG scoped, "at the boundary itself" fences off total payout:
FLAG-WRONG discharged. No sentence in the reworded clause claims total-payout continuity; the
branch-sequencing jump (+0.016·equity·L0) is no longer contradicted, and stands as the recorded
ENGINE finding for the operator's queue (this file = artifact of record).

### Edit-6 claim 2 reworded — prior OVERSELL discharged, but RENEWED FLAG-OVERSELL on the retained tail clause "so an immediate open-then-close cycle yields no repricing profit".
The premise half is now correctly scoped (reserves exact per REVERSED leg, ITM settles-to-cash
inline) — that discharge stands; it matches law 3 and CM6. The tail clause is a claim I never
measured, so I measured it. It fails at the design's own accounting layer, two ways:

1. **Both-OTM immediate cycle (the clause's best case) records a POSITIVE trader P&L.**
   `mkPool(10,800000,.5)`, oracle 80000, m=2; open sold-call θ=1.3 / bought-put θ=0.8 via
   `executeBand`, `closeBand` immediately (no market move, both legs reversed, pool restores
   exactly per CM6): `raw_net = +0.00109744` at N=0.1. With openBand's own carve arithmetic the
   band P&L collapses to `L0·raw_net·carvedEquity = N·oracle·raw_net` = **+$8.78 vs the $0.80
   fee** (11×); raw_net grows ~quadratically in N (N=0.05→0.00048, N=0.1→0.0019 on the tighter
   geometry, ratio ≈4), so the recorded P&L beats the linear fee for all N ≳ 0.03. The engine's
   own comment concedes the object: "The residual mark-on-own-bend valuation netting is the A15
   deferred item, NOT closed here" (closeBand ~L2088–2090). CM6 gates pool reserves and Σdy only
   — it does not back a trader-level no-profit statement.
2. **The ITM exception is trader-electable, amplifying it.** The band's OWN open pushes the mark
   past a barely-OTM strike: sold-call θ=1.001 at N=0.1 moves poolMark/oracle 1.000→1.0816 ⇒ the
   *immediate* close takes the soldITM branch (opening swap stays in the pool). Recorded band P&L
   at N=1: raw_net=+0.156 ⇒ ~$12.5k vs $8 fee; N=2: +0.457 ⇒ ~$73k vs $16 fee (mirror put
   geometry: +0.134 at N=2; flips negative at N=4, so it is steerable, not a knife-edge).

Why OVERSELL and not WRONG: the shipped state layer records `trader_payout` on the band OVERLAY
— "NOT added to club.equity" (state closeBand ~L2686–2696) — so no cash is realized today; the
realization plumbing is exactly the "carved-perp settlement ledger" the paper itself lists as
open. Surviving steelman: "no repricing profit can be extracted FROM THE POOL'S RESERVES" —
true, CM6-backed, and the sentence's premise supports only that. As written, in an "Incentive
properties" paragraph answering the money-pump question, the clause asserts the trader-facing
property, which the design's own settlement mathematics contradicts and which nothing gated
backs. The hole is the one clause; I name it and stop.

### (b) Residual sweep — PASS.
Every hunk re-read: intro framing (no claim), fig trims (cosmetic), edit-2 design-target hedge,
edit-4 instance disclosure, edit-3 Limitations (residual correctly ITM-scoped; the both-OTM
valuation residual above is a DIFFERENT object — club-side A15, not pool-side — edit-3 does not
deny it), edit-5 as above, incentive claims 1/3/4 (settled prior section). No sentence implies
total-payout continuity; no sentence asserts an unconditional round-trip.

### NEW ENGINE FINDING for the operator's queue (STOP-ON-RED: reported, not fixed).
A15 immediate-cycle residual is POSITIVE-signed and fee-beating in the shipped build (recorded
band P&L, overlay-only today), and the ITM settlement branch is reachable by the trader's own
open swap (self-push past a barely-OTM strike). Joins the branch-sequencing payout jump already
queued; both live in closeBand's valuation sequencing, not in the pool (pool round-trip stays
exact, CM6 green).

## RE-VERDICT: NOT CLEAR-TO-COMMIT as-is — one renewed FLAG-OVERSELL, confined to edit-6 claim 2's
tail clause ("so an immediate open-then-close cycle yields no repricing profit"). Edit-5 reworded
is CLEAR; every other hunk is CLEAR. The halt is one clause wide.

— skeptic (re-derivation performed against HEAD engine this turn: OTM-guard L1891–1896 confirmed,
self-push ITM probe + immediate-cycle P&L probe run at 6 sizes × 3 geometries + both-OTM control;
state-layer overlay semantics read at L2664–2700)

---

## RE-CLEAR PASS 3 (2026-07-02): CLEAR-TO-COMMIT. Edit-6 claim 2's tail now reads "so no repricing profit is extractable from the pool's reserves (Section~\ref{sec:exec})" — my surviving steelman verbatim, premise scoped per reversed leg with the ITM exception inline; verified in the working-tree diff MYSELF this turn (only change since RE-CLEAR PASS 2; all other hunks re-read, unchanged, previously cleared); last attack attempted and held (the ITM residual swap is an invariant-preserving pool-quote trade, both measured profit channels are club-side — CM6 + no-free-money cover the reserve side). Renewed FLAG-OVERSELL discharged; the halt is lifted. The two engine findings (branch-sequencing payout jump; A15 fee-beating immediate-cycle residual + self-push ITM election) remain queued for the operator UNCHANGED — commit clearance does not close them. — skeptic

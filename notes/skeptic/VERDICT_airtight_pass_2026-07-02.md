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

---

## FINAL SUBMISSION GATE (2026-07-02, blind-submission gate per entries 368/369/370): CLEAR-TO-SHIP.

Artifact: working-tree `paper/wine2026/temporal_wine2026_v2.tex` (uncommitted diff vs 86eddeeb =
compression pass + manager close-out). All five ordered checks executed THIS TURN; attacks
attempted and all failed. Zero flags.

### (a) The two NEW formal statements vs the engine — PASS (re-derived, not narrated).
**Rebase (app:spec):** annex `x→rx, α→rα, y/β/w invariant, θ→θ/r, k→r^w k` checked against engine
HEAD L1711–15 (`// r = s_new/s_old. x → r·x, α → r·α, β invariant, y invariant, w invariant` and
`rebase(s,r) = {x: s.x*r, y: s.y, alpha: s.alpha*r, beta: s.beta}`) — exact match; the two
non-engine clauses re-derived myself: `w=α/x → rα/rx = w` invariant ✓; `k=x^w y^{1−w} → r^w k` ✓;
θ→θ/r is the locked §3.3/story-station-7 transform, pre-existing body text unchanged. The three
implications are honestly typed: (ii) machine-checked L2, (i)/(iii) stated as spec implications
inside an annex titled "mechanism specifications" — no proof-label inflation.
**Funding law (app:spec):** annex `κ·(±g_loc)·N·mark(θ)·(Σ−1)/Σ, Σ = pool-marked/reference,
+call/−put, zero at Σ=1` checked term-by-term against engine `fundingPerStrike` (L2282–2290):
`kappa * gamma * N * m * (S-1)/S * dt` with `gamma = (wing==='call') ? +g : -g`,
`m = markLensed(...)`, `S = poolMark(...)/oracle` — exact match ("per unit time" = the engine's
·dt; the S≤0 guard is a numeric guard, not a law term). Explicitly labelled "shipped design law
(a specification, not a machine-checked result)" ✓ and g_loc=mγ = the entry-232 through-the-lens
ruling ✓.

### (b) Moved-verbatim blocks — PASS.
Worked-example TABLE byte-identical (all 10 cells + boundary row); I re-derived every cell
independently: 4/27=0.148 ✓, (1/7)(6/7)^6=0.0567→0.057 ✓, (1/3)(0.8333)²=0.2315→0.231 ✓,
0.183/0.107/0.103/0.019 ✓, intrinsic 0.200 at m=3/$80 ✓, 1/7≈0.143 ✓. Body at-a-glance keeps
66.67/85.71, 1/3, 1/7, 0.148, 0.057 — matches the moved table exactly. Collar: "that claim is
withdrawn until one does" SURVIVES IN BODY (§6.1) ✓; "posited form" in body AND annex ✓;
"conditional skeleton, not an unconditional no-arbitrage theorem over the production engine" in
body AND annex ✓; pool-motion/fair-sequenced-prices caveat in annex ✓. Merton: body keeps the
compact r>σ² failure + theory-anchor + design-parameters triple, annex keeps the full σ≈80%⇒r>64%
version ✓. (Nit, not a flag: prose AROUND the moved table/collar is lightly compressed — e.g.
"a mismatched pair would kink the seam" parenthetical dropped, "We are precise:" dropped — the
manager's "verbatim" is exact for the table and for every hedge, approximate for connective prose.)

### (c) Compression-pass protected hedges — PASS, all present in current file.
tfp-never-"verified" (label reserved for local canonical build) ✓ · B1/B3/B4 "carried as structure
fields, not discharged facts" + does-NOT-prove-the-port-pays ✓ · deterministic-vs-Snell
("named but not formalised — a placeholder obligation") in §5 AND intro condition (i) ✓ ·
|Γ|≤1 per-wing scope + labelled approximation, in §6.3 AND Limitations ✓ · design-target value-law
sentence ("enforces it by definition of the mark... remains open") ✓ · Fig-2 label/caption =
"wing-steepness shape (normalized, mode=1)" / "not the mark, whose at-the-money value is the
continuation value" — my SWEEP regression fix confirmed landed ✓ · "cap of 1 only at full
exercise" + barrier "value capped at 1" lineage sentence ✓ · perp-units→cash sentence (station 17)
intact in §6.2 ✓ · "Trust in the reference feed is an explicit assumption" ✓ · round-trip residual
(ITM-scoped: "arises when an in-the-money leg settles to cash") + cross-strike externality
("every other strike's mark... unquantified") ✓. Cuts I checked and accept as non-hedges:
"path-dependence of the Curve v2 class" classifier, "None is dropped" meta-sentence.

### (d) Reference integrity — PASS.
Every `\ref`/`\eqref` target has exactly one matching `\label` (app:spec ×5, app:lean ×3, all
sec/fig/eq keys — mechanically cross-checked); `\cite` keys ≡ `\bibitem` keys (diff clean);
`\tfp` defined; document env balanced. §3.2's "0.148 ... worked example of Section~\ref{sec:american}"
stays coherent: §5.2 keeps its "A worked example" subsection heading with 0.148 in the at-a-glance.
Annex-and-ref hanging test (entry 369): both directions closed — every annex subsection is
pointed to from body (§3.3 rebase, §3.3 funding, §5.2 table, §6.1 collar, §5.3 Merton), and
app:spec sits after app:lean as stated.

### (e) Story-table coverage (entry 370, stations 1–18) — PASS, tick-list against current file.
1 pool curve §2.1 ✓ · 2 LP isotropic — NEW clubbed sentence ("price and lean untouched, not a
trade") ✓ matches station text · 3 trades-bend §2.2 (trade-point truth, per entry-339 "no paper
edit") ✓ · 4 rays §2.3 ✓ · 5 mark §3.2 ✓ · 6 dial m §4 + MORE-volatile⇒LOWER-m at intro and §4.2 ✓
· 7 rebase §3.3+annex ✓ · 8 quantity bridge exec-1 ✓ · 9 premium-free swap exec-2 (same-direction
clause survived) ✓ · 10 two-strike exec-3 (settle-at-chosen + frozen θ_tx + ITM-no-pool-swap) ✓ ·
11 depth guard — clubbed ("rejected outright with the numbers, never silently capped") ✓ ·
12 fee — clubbed ("from club equity, never into the pool") ✓ · 13 funding §3.3+annex, FLAG-C hedge
("cash-transfer routing is implementation-level, deferred") intact ✓ · 14 seam §5 ✓ · 15 settlement
§6.2 ✓ · 16 vault/carve (frozen carved slice + conditional solvency) ✓ · 17 units→cash §6.2 ✓ ·
18 club & L₀ exec-4 ✓. Stations 19 (charts=UI) / 20 (the paper itself) correctly out of paper scope.

### Manager close-out items 2–4 — PASS.
Clubbed sentence present and station-faithful (2/11/12); LLM drafting disclosure after Conclusion
is anonymity-safe ("the authors" only; `\author{Anonymous Author(s)}` unchanged, no identity leak
anywhere I grepped); §3.3 annex pointers both present.

### Attack on the strongest claim (discipline record).
Strongest new claim = the annex funding law presented as "the exact shipped rate law." I attacked
it by reading the shipped function, not the spec chain: every factor, the sign pairing, and the
zero-at-anchor property match the engine byte-level. Second attack: the annex rebase implication
(i) "no position gains or loses from a rebase" as potential oversell — it holds: marks are ratio
reads (θ vs mode), both scale by 1/r, ratio invariant; matches locked story station 7 ("no ray
gains/loses") and the frame-keeping doctrine. Both attacks failed.

## VERDICT: CLEAR-TO-SHIP.
Standing engine findings (branch-sequencing payout jump; A15 fee-beating residual) remain queued
for the operator — they are engine-side, disclosed in the paper's own scoping, and do not block
this submission.

— skeptic (re-derivations this turn: engine L1711–15 + L2282–2290 read at source; 10 table cells
recomputed; ref/label/cite cross-check mechanical; story-table walked station-by-station)

================================================================================
# VERDICT — FOCUSED GATE on the manager's fix pass over the OPERATOR'S OWN v6 tex
# Artifact: paper/wine2026/temporal_wine2026_v2.tex (uncommitted working copy, 1150 lines)
# Basis: operator entries 378/379 read VERBATIM at history/operator/2026-06-10_kurtosis-curve-family-brief.md L2938–2947
# Date: 2026-07-03 · skeptic
================================================================================

## (a) Formulas and numbers — ALL RE-DERIVED, ALL CORRECT.
- **eq:mark vs Lean:** paper (1/(g+1))(S*/S)^g ≡ contP = (1/(g+1))(S/S*)^(−g)
  (PasteLin.lean L21) — identical. ATM at g=2: (1/3)(2/3)² = 4/27 = 0.148 ✓. Case split
  (waiting S≥S* / exercised S<S*) agrees with Lean Vp at the seam since both arms equal
  1/(g+1) there (paste_value_lin).
- **fig:read:** chosen ray 1.55x ∩ 2.1/x = (1.1640, 1.8042) ✓; mode (√2.1,√2.1)=(1.449,1.449) ✓;
  θ_tx = 1.55² = 2.4025 (mode=1, m=2) ✓; tx point (0.9349, 2.2462) ✓. Caption "geometry exact
  for the drawn curve" is true.
- **fig:funding:** 2.1/1.2 = 1.75 and 2.3004/1.2^1.5 = 1.75003 — both curves through (1.2,1.75) ✓;
  ray 1.75/1.2 = 1.4583 ✓; anchor slope 2.1/1.2² = 1.4583, skewed slope 1.5·2.3004/1.2^2.5 = 2.1875
  (= 1.5× anchor, exactly the w=0.6 ⇒ p=1.5 relation) ✓; tangent segments centered at x=1.2 with
  those slopes ✓.
- **fig:warp:** T=(1.164,1.804) on ray, base, and skewed curve (2.2146/1.164^1.35 = 1.804) ✓;
  skew arrow at x=2: 1.05 → 2.2146/2^1.35 = 0.869 ✓.
- **eq:tradeupdate exhibit:** from (10,10,½), θ=4 ⇒ T=(5,20); Δx = −25/110 = −5/22;
  w' = (5/2)/(105/22) = 11/21; naive recompute 5/(215/22) = 22/43 — all exact ✓.
- **Worked example (all 10 cells recomputed):** m=1: 0.333/0.231/0.183/0.148/0.103;
  m=3: 0.143 @ 85.71 / 0.200 (intrinsic, 80<85.71) / 0.107 / 0.057 / 0.019 — all match to 3dp ✓.
- **Merton algebra:** (−γ)(−γ−1)=γ(γ+1)=2r/σ²; roots sum −γ+(γ+1)=1; γ>1 ⇔ r>σ² ✓.
- **The two verbatim Lean statements match source exactly** (mod the declared ASCII set):
  paste_value_lin = PasteLin.lean L40–41; value_ge_intrinsic = ValueGeIntrinsic.lean L55–56,
  including hypothesis lists ✓.
- **Lean-identifiers column:** every one of the 24 names in L1–L13 exists as a real declaration in
  the compiled artifacts (MONOLITH_CONSTM, LENSKERNEL, MERTON_tie, O1/O2, R2, C1/C2/C3,
  AIRTIGHT_T1a/b, PH_UNIFICATION, Seam/AMMCurve). Note for the manager, NOT a paper defect:
  `reserves_have_no_floor` and `expPool` are absent from formal/INDEX.md by name (INDEX lists that
  line as `gh_no_floor_grounded` etc.) — an INDEX.md coverage gap to tidy post-deadline.

## (b) Hedge survival — ALL FIVE PRESENT.
1. Never-re-run-locally: abstract L55, provenance subsection L747 ("not re-run against a local
   kernel"), annex header L894 — three sitings ✓.
2. Deterministic-vs-Snell: body §American L587–589 ("named but not formalised — a placeholder
   obligation") + L7 row L930–931 ✓.
3. Conditional solvency: abstract, contributions, dedicated frontier subsection ("assumptions,
   not claims"), conclusion ✓.
4. Existence-lemma hedge: moved into annex row L1 (L906–907, "report complete at the prover but
   are not folded to this bar and are not counted") — survived the fold ✓.
5. "Design target" value-law sentence: §lens Definition L448–450 ("enforces it by definition of
   the mark, and a derivation … remains open") ✓.

## (c) Word unification — **FLAG-OVERSELL (minor, two words):** claimed "re-lean/bend/lean
eliminated"; two prose residuals survive.
- **L183:** "the ``bending'' picture is a re-description of a weight change" — the banned word,
  in prose, naming exactly the trade-changes-the-curve action the operator ordered be called
  *skew* only (entry 378: "bend lean motherfuck -- trades skew thr goddamn curve").
- **L168:** "pushing $w$ off $\tfrac12$ \emph{tilts} pricing toward one asset" — the SAME
  sentence already glosses w as "how the curve \emph{skews} between the assets"; "tilts" is the
  word-diversity residue for the same concept, one line apart.
- Noted, not flagged: L480 "one exponent per wing cannot bend differently across strikes" —
  smile-curvature, a genuinely different referent; TikZ `to[bend left=...]` is syntax, not prose.
- No lowercase "lean"/"re-lean" prose residuals; "lensed" and Lean-the-prover only ✓.
Two-word fix; does not block anything else in this verdict.

## (d) Double-blind — PASS.
"Harmonic's Aristotle" is the operator's explicit order (entry 378 verbatim) — not flagged.
No author-identifying string anywhere: grep for rohan/gnostrich/gmail/github.com/Perp-Options
and for "Temporal"/"temporal" prose = zero hits ("warp" survives only inside invisible label keys
sec:warp/fig:warp); \author{} empty, running head "Anonymous submission to WINE 2026", no
pdfauthor metadata, drafting disclosure says "the authors" only ✓.

## (e) Label/ref + structural — PASS (with one honest environment limit).
All \ref/\eqref targets resolve; all \cite ↔ \bibitem paired both directions; superscripts
L1–L13 all used and all have rows; \begin/\end balanced per environment; brace delta 0.
**No LaTeX compiler exists in this environment** — I could NOT compile; structural checks above
are grep-mechanical, not a pdflatex pass. Manager must compile before resubmission and not cite
this verdict as a compile check.

## Orders 1–8 walked (completeness): premise fix in caption/intro/abstract ("the stored skew is
the pricing state…") with the "IS the option position" phrase gone (grep zero) ✓ · mark section
ray-first with explicit map ✓ · "What machine-checking covers" subsection gone, superscripts
inline ✓ · "Rebasing: the frame tracks the market" ✓ · "Lens properties" ✓ · \tfp = "verified in
Lean", provenance subsection + available-on-request stated twice ✓ · annex renamed with
identifiers column + two verbatim statements ✓ · both new figures present, geometry exact ✓.

## VERDICT: **CLEAR-TO-SHIP once the two-word (c) residuals are addressed** (L183 "bending",
L168 "tilts") — everything load-bearing (math, hedges, Lean fidelity, anonymity, structure)
passed attack. Attack record: strongest claim = the two "verbatim-ish" Lean statements and the
"geometry exact" figure captions; I re-derived every number and diffed both statements against
the .lean sources — the attack failed everywhere.

— skeptic (re-derivations this turn: 10 table cells + 4 figure geometries + trade exhibit in
rational arithmetic; PasteLin.lean/ValueGeIntrinsic.lean read at source; 24 identifiers grepped
into compiled artifacts; ref/cite/env checks mechanical)

---

# MICRO-GATE: frame-fix edits (entries 382/383/384), uncommitted on top of c187cb35 — 2026-07-03

Baseline verified: md5 of committed file at e5045e9 = `c187cb3546881d5b686cf7d828a6c60a` (the
CLEAR-TO-SHIP state); working-tree diff is 34+/38− lines, all within the five ordered areas.
Entries 382–384 read verbatim from `history/operator/2026-06-10_kurtosis-curve-family-brief.md`.

**(a) Mark subsection — PASS.** Retitled "The mark: one ray, one curve"; body says the strike's
ray meets the POOL CURVE at one point, "One ray, one curve---no second object", and the
parenthetical routes the two-curve comparison to funding ONLY ("appears exactly once in this
paper, in funding: the same ray read on the pool curve and on the anchor curve") — this is the
operator's entry-382 doctrine near-verbatim ("we have ray comparison across pool curve and
anchor curve"). Residual-language grep (`mode ray|ray read against|against the pool|ray
against|ratio of the two`): ONE hit, line 299 — a `%` TikZ source comment, never rendered.
The eq:mark case gloss "a power of the ray read" is the one-object read, not a comparison.
Funding prose (line 344–346) independently agrees: "the same strike ray read on both curves,
slope against slope". Consistent frame, both directions.

**(b) Intro + §2.1 — PASS.** Old opener ("An automated market maker (AMM) is a pool of two
assets…") DELETED; new opener starts inside the mechanism ("In the pool's reserve plane, every
strike is a ray…"). No definitional AMM claim anywhere ("two assets"/"pool of two" grep: zero
rendered hits). §2.1's "We work on the two-asset slice of Balancer's weighted constant-product
family" is a true scoping statement (Balancer is Π xᵢ^wᵢ over n assets; x^w y^{1−w}=k is its
two-asset member) — scopes, doesn't lecture. Note: the deleted sentence also carried
"quoted price is the slope"; that identity is now nowhere stated — but that is precisely the
"so basic why are you explaining it" material the operator ordered out (entry 382), and no
downstream passage depends on it being pre-defined (funding compares slopes AS slopes). Not a flag.

**(c) Smooth-pasting glosses — PASS.** Contributions item 3: "the exercised payoff line joins
the waiting-value curve tangentially---same value, same slope, no kink (``smooth pasting'')" —
gloss AT first prose use (only earlier occurrences: title-keywords line 59). §5 construction
(line 534): "in plain terms, the payoff line is tangent to the waiting curve… no kink and no
jump". §5 title now "American exercise: where waiting ends". Abstract already plain ("a smooth
join between waiting and exercising"), untouched.

**(d) Figures — PASS with one residual (below).** fig:read: both in-plot formula boxes removed
(tx-map formula survives in caption; mark formula via Eq. ref), labels shortened
(read/transact/mode). Caption no longer says "ray read against the mode ray" — now "The meet
sits at moneyness S/K". fig:funding: three-line in-plot box reduced to "$\Delta$ slope";
caption carries the content and I re-derived its numbers as my attack: anchor y=2.1/x slope at
x=1.2 → 2.1/1.44 = 1.4583 ✓ (caption 1.458); pool y=2.3004/x^1.5 slope → 3.4506/1.2^2.5 =
2.1875 ✓ (caption 2.19); both curves through (1.2,1.75) ✓; ray 1.4583·1.2 = 1.75 ✓. Caption's
"like ray to like ray, never against a fixed diagonal" matches doctrine. Attack failed.

**(e) eq:mark + numbers — PASS.** eq:mark block byte-untouched by the diff; 0.148-at-g=2,
S*=Kg/(g+1), table values, worked exhibits all outside the diff. Only numeric edits anywhere
are TikZ node PLACEMENT coordinates (label positions: 2.62,2.42→2.72,2.52; new Δ-slope node at
1.98,1.12; three removed nodes) — typography, not results.

**One residual, NON-BLOCKING, named for the manager:** the rewrite deleted the mark
subsection's definition of the mode ("The pool's centre (its at-the-money ray, the mode)…"),
and the fig:read label was shortened from "mode ray (ATM)" to bare "mode" — so the term "mode"
now first renders (fig:read label + its caption's θ_tx formula, §3) BEFORE its only surviving
prose gloss ("mode the at-the-money ray", line ~455, §4 lens). Undefined-jargon-at-first-use is
exactly the entry-382 complaint class ("who the fuck reads that and going to understand
anything"). Two words in the fig:read caption or label would close it; I name the hole, I don't
prescribe.

**VERDICT: CLEAR** — all five gated items encode the operator's entries-382 doctrine correctly;
attack (funding-figure re-derivation + residual-language greps + baseline md5) attempted and
failed. The mode-gloss residual is flagged as a non-blocking note in the same jargon class the
operator just corrected; manager's call whether to spend the two words before commit.

— skeptic (micro-gate, ~3 min; re-derivations: 2 tangent slopes, 3 incidence checks, baseline md5)

---

# VERDICT — FULL REGRESSION + CONFLATION SWEEP (operator entry 400)
**Artifact:** `paper/wine2026/temporal_wine2026_v2.tex`, md5 `9b4b96a3f992174361aee13a6232c51b` (confirmed).
**Ground truth read:** transcript entries 378–399 verbatim (`history/operator/2026-06-10_kurtosis-curve-family-brief.md`), STORY_TABLE ed.14, operator_mental_model addenda 307/308/311.
**Attack performed:** independent recomputation of eq:mark ATM (4/27 = 0.148148 at g=2), all 8 worked-example cells (0.231/0.183/0.148/0.103; 0.143@85.71/0.200/0.107/0.057/0.019 — all exact at 3dp), fig:funding equal-slope points (anchor (1.0954,1.9170) ray 1.7500; pool (1.3120,1.5307) ray 1.1667, both at slope 1.75 — exact), fig:read intersections ((1.1640,1.8042), (0.9349,2.2462), mode (1.4491,1.4491) — exact), fig:warp T-incidence (exact); banned-string greps incl. multiline doubled-tfp; first-render-order re-derivation for all R8 terms.

## VERDICT: FLAG — 5 hits (3 exact regression-list hits, 2 minor). Everything else survived.

**FLAG-1 (R6 doubled-tfp) — lines 658–659.** `(\tfp{} for generic $g$; \tfp{}\textsuperscript{L4})` renders "(verified in Lean for generic g; verified in Lean^L4)" — a doubled-tfp artifact. The task's own grep window (`.{0,15}`) misses it only because the two macros straddle a newline ~18 chars apart. Minimal fix: `(\tfp{} for generic $g$\textsuperscript{L4})`.

**FLAG-2 (R6 doubled-tfp) — lines 705–707.** The sentence opens `---\tfp{} both in the curve's own coordinate\textsuperscript{L4} and, ..., in the dollar frame\textsuperscript{L5} (\tfp{})---`: the trailing `(\tfp{})` restates the provenance the same sentence already opened with. Minimal fix: delete ` (\tfp{})`.

**FLAG-3 (R1 vocabulary) — line 548.** Rendered prose: "one exponent per wing cannot **bend** differently across strikes" (pricing-ceiling paragraph, §lens). "bend" is on the banned list for rendered prose; only TikZ `to[bend ...]` syntax is exempt, and this is not that. Minimal fix: "one exponent per wing cannot produce strike-dependent curvature" (or "...cannot change across strikes").

**FLAG-4 (R3 residue, minor) — lines 289–290 (§How a trade runs, step 3).** "Funding is metered by the **slope-deviation** read of Section~\ref{sec:funding}". Under entry 386 the deviation is the RAY-ANGLE gap at matched slope; "slope-deviation" is the pre-386 compound in which the deviation is *in slope* (the same-ray read the operator ruled would violate the ATM point). §3.4 prose, fig:funding caption, the mark-fence, and the annex-Σ prose all tell the 386 story correctly — this fifth site is the one leak. Minimal fix: "metered by the same-slope funding read of Section~\ref{sec:funding}" (or just "the funding read of").

**FLAG-5 (C3-adjacent wing scope, minor) — lines 93–94 (contribution 3) and 791 (conclusion).** `S^*=K\,m\gamma/(m\gamma+1)` is stated as THE early-exercise boundary with no wing qualifier at both sites. That is the PUT form; the call boundary is `K(m\gamma+1)/(m\gamma)`, and the put/call scoping ("calls mirror by reflection") first appears only in §American, after the contribution. As printed, a reader applying the formula to a call gets a boundary on the wrong side of K. Minimal fix: two words — "(put form; calls mirror)" at contribution 3, "put boundary" in the conclusion.

## Survived attack (checked, not narrated)
- **R2 PASS:** mark = one ray/one curve throughout; no mode in the mark definition or eq:mark; the two-curve fence sentence present and correct; the only two-object read is funding.
- **R3 PASS at the 4 named sites:** §3.4 prose ("same slope located on both curves... gap between the two ray angles... respects the at-the-money point"), fig:funding drawing+caption (equal-slope tangents drawn and numerically exact), mark-fence ("the same slope located on the pool curve and on the anchor curve"), annex rate-law prose (Σ prose stays curve-vs-anchor; no same-ray resurrection). Sole leak = FLAG-4.
- **R4 PASS:** step 2 = "the booking strike is YOUR strike passed through the lens — equal to your chosen strike at m=1"; §lens tx-map anchored on "the trader's ray"; fig:read caption "the swap executes further out, on the lens ray... frozen at open". Nowhere reads as at-mode.
- **R5 PASS:** no AMM-101 ("two-asset slice of Balancer's family" is scoping to the n-asset family, not definitional); zero "static"; zero "American generalisation" (only "generalized-hyperbolic", a distribution name); no cutesy titles; zero barrier/prior-paper/withdrawn strings; "server-side" absent from the abstract (comment + provenance annex only, allowed).
- **R6 rest PASS:** \tfp renders "verified in Lean"; zero trusted-from-prover strings; "not re-run against a local kernel" hedge present in the provenance annex; on-request sentence (Lean proofs + complete working implementation) present at BOTH sites (app:lean close + frontier §1).
- **R7 PASS:** both worked-example sites carry marks-not-transactions ("nothing is bought or sold in the table" §6.2; "No transaction occurs in this table" annex); three-zones framing present in §American; "where waiting ends" absent.
- **R8 PASS (re-derived render order):** band(267), club(274), mode(285 — glossed in step 2, now BEFORE fig:read: the prior mode-gloss residual from the §3.2 micro-gate is CLOSED), m(98), γ(97), g=mγ(338), g_loc(632; fig:seam caption self-defines), K_tx(280–286), L₀(299), escrow(267)/escrow unit(342), carry(400), smooth pasting(96, tangent/no-kink; abstract uses plain "smooth join").
- **C1/C2/C4/C5/C6 PASS:** mark-vs-funding reads fenced; chosen-strike-settles vs frozen-K_tx-books kept distinct at every site (steps 2/4, §lens, fig:read, settlement annex); every perp-unit→dollar crossing names the conversion (closing equity × L₀); K vs K_tx never blurred; division-of-labour stated in intro + §2 + §3 header, "pool prices that protection" (abstract) and "the pool is the option market" read as the exempt mechanism-shorthand with the strict split stated in the same section.
- **Numbers EXACT:** eq:mark ATM 0.148 (=4/27) at g=2; all table cells; fig:funding 1.75-slope points; fig:read intersections. Recomputed independently, not trusted from comments.

**Bottom line:** the 386/399 rulings are correctly encoded; the story survived. Five mechanical hits, all one-splice fixes (FLAGs 1–3 are exact regression-list violations and should be fixed before ship; 4–5 are two-word accuracy patches). No conflation of the six pairs found beyond FLAG-4/5.

— skeptic (full sweep under entry-400 deadline; re-derivations: 13 numeric checks, 9 grep families, R8 render-order walk)

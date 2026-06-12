# Author Response — "Singular Dynamic AMM Pricing Perpetual Options Across the Strike Continuum" (AFT 2026 submission)

We thank the reviewers for an unusually rigorous report. Before writing this response we
independently reproduced the report's central checkable claims — both numerics in §3.2(1), all four
localised errors in §3.4, and the §3.2(2) reading of our verification artifact — and **all of them
held**. (We have not re-run the report's Monte Carlo analyses, its settlement-ledger algebra, or its
prior-art search; we accept those provisionally and respond to them below.) What follows
is (i) the resolution of the central finding — which turns out to be a specification-language error
in one paragraph of our paper, not an inconsistency in the mechanism — and (ii) point-by-point
answers to the thirteen questions.

---

## 1. The off-ATM trade update (your §3.2(1), Question 1) — the mechanism is well-defined; §5.1 described the wrong object

**Concession first.** You were right that the paper, as written, does not specify the off-ATM trade:
your Reading 1 violates the derivation's domain, your Reading 2 violates §5.1's global conservation
claim, and the panel's conclusion that "no reading consistent with the paper's wording respects both"
is correct. We verified your concrete instance ourselves: the θ = 2 trade point (7.071, 14.142)
gives (x_T − α)(y_T − β) = 18.93 ≠ 25.

**The error is located in §5.1, not in the mechanism.** §5.1 asserts that the conservation law is a
*global invariant* — "the pool state is fully determined by (x, y); the weight w is a derived field,
w = α/x; no additional state storage is required." That sentence-cluster is the bug. The intended
object — described correctly in §3 ("a transaction at any trade point on the curve is treated as if
that trade point were the reserves point") and in Appendix B ("the integration is local to the arc
swept by that specific transaction") but then mis-summarised in §5.1 — is a **state transition
system** in which the conservation law is the **per-trade generator, applied at the trade's own
point**, not a constant of motion across off-ATM trades.

**The rule, precisely** (this is your Reading 2, completed with the induced global update your
question asked for):

- Pool state is the triple (x, y, w), with **w genuine, stored state**.
- A trade at strike ray θ with cash leg Δy:
  1. Trade point T = (x_T, y_T) = the unique intersection of the ray y = θ·x with the live pool
     curve x^w·y^(1−w) = k.
  2. Local conserved pair **at T**: α_T = x_T·w, β_T = y_T·(1−w).
  3. Flows evaluated at T — and these are the actual reserve changes:
     Δx = −α_T·β_T·Δy / [(y_T − β_T)(y_T + Δy − β_T)],  Δw = β_T·Δy / [y_T·(y_T + Δy)],
     on the admissible domain y_T + Δy > β_T (the pole of the closed form) **and** x + Δx > 0,
     y + Δy > 0 (global reserve feasibility: the flows are evaluated at T but are drawn from the
     pool's actual reserves, so feasibility bounds trade size — and binds hardest in the deep
     wings). The cash-leg sign is fixed by the wing/side rule of §5.2.
  4. Induced global update: (x, y, w) → (x + Δx, y + Δy, w + Δw).

**Worked on your own instance** (x = y = 10, w = ½, θ = 2, Δy = 1): T = (7.0711, 14.1421),
α_T = 3.5355, β_T = 7.0711; Δx = −0.4381, Δw = +0.0330; next state (9.5619, 11, 0.5330). The local
pair is conserved at machine precision: (x_T + Δx)(w + Δw) = 3.5355 = α_T.

**Properties, stated plainly:**
- **Well-definedness:** every (state, ray, Δy) in the admissible domain — including the global
  reserve-feasibility constraints above — yields a unique next state. There is no inconsistency;
  the integral is the path integral along the local hyperbola (x − α_T)(y − β_T) = α_T·β_T through
  T, which T lies on by construction. (Without the feasibility constraints the closed form can
  output infeasible states for large deep-wing trades; the constraint set above is part of the
  rule, not an afterthought.)
- **Spot trades are the special case:** at the reserves point the local pair equals the global pair,
  so spot swaps conserve global (α, β) and reproduce §5 exactly. This is why your panel's 44/44
  reserves-point checks pass — that part of the paper was, and remains, correct.
- **Off-ATM trades change global α and β by design.** In the instance above, global α: 5 → 5.097,
  β: 5 → 5.137. Nothing is violated — under the transition-rule semantics those were never claimed
  constant across off-ATM trades; §5.1's contrary statement is retracted.
- **w is state.** After the trade above, α₀/x′ = 0.523 ≠ w′ = 0.533: the weight is not recoverable
  from reserves and must be stored. §5.1's "no additional state storage" is withdrawn.

**Revision commitments for this finding:** (a) §5.1 rewritten as the transition rule above, with the
global-invariant phrasing corrected and the spot case identified as the special case — the same
scoping applies to §3's description of the trajectory hyperbola as "the locus along which the
reserves point actually moves", which is true of the spot-trade operator only; (b) Appendix D
(three-operator (α,β)-signature classification) and Appendix F (single global trajectory hyperbola
as the reachable set) explicitly **scoped to the spot-trade operator** — the off-ATM trade is a
distinct operator and will be stated as such; (c) the well-definedness, spot-reduction, per-step
conservation, and w-storage lemmas added to the formal ledger (formalization underway; it will be
part of the deposited artifact, not claimed as verified before then); (d) the framing throughout
(abstract, §1, §3, §14) corrected from "governed by the invariant" to the level-set/substrate
language — k is a dependent readout and is itself not conserved by trades (k: 10.0 → 9.8614 in a
w = ½, Δy = 2 instance), a fact the submission's own Appendix F notes and the opening contradicted.

**On the round-trip residual** this rule implies (open-and-reverse at the same ray leaves the pool
slightly ahead, i.e. the trader bears a small round-trip cost): acknowledged. We position it as
path-dependence of the class present in production dynamic-function AMMs (e.g. Curve v2's
dynamically re-pegged invariant); §12.3's round-trip wording will be weakened accordingly, and a
quantitative treatment is deferred and flagged as such.

## 2. collarSurplus and the no-arbitrage biconditional (your §3.2(2), Questions 2 and 3) — concession

Your finding is correct and we state it more bluntly than the report does: **Appendix G's
description of result "C4" overstated the artifact.** The Lean development defines
`collarSurplus (θ w : ℝ) : ℝ := θ * ((1 − w)/w − 1)` — a *posited* structural form proportional to
anchor asymmetry — and proves `(∀ θ > 0, collarSurplus θ w = 0) ↔ w = 1/2`. The zero-set is
θ-independent, so the ∀θ quantifier is doing no work, exactly as your reconstruction concluded. It
is **not** derived from the min(slope, 1/slope) mark formula, and no explicit skew counterexample is
exhibited. The in-development ledger carried this result with an explicit "posited form" caveat; the
paper text dropped the caveat. That was our error, not the prover's.

**Revision commitments:** print collarSurplus as a formula *derived* from the mark formula and the
§5.2 sign rule; define the admissible-strike domain; exhibit a numeric skew counterexample in the
text; and present the result at its true strength — if the derived surplus is θ-independent (as in
your sNorm² − 1 reconstruction), the theorem will be stated as the modest symmetry result it is,
not as a mechanism-level no-arbitrage theorem quantifying over swap compositions. The prose claim
"no composition of swaps across rays yields a riskless capital-efficiency edge" is withdrawn until
a result actually formalises compositions.

## 3. Verification artifacts (your §6, Question 3)

The artifacts exist (full Lean ledger with per-theorem axiom reports; standard axioms only). The
"on request" availability under double-blind was a mistake, and we accept that for a paper whose
abstract leads with verification it was close to disqualifying. Our intention for the revision is
an **anonymised artifact deposit at submission** (anonymous.4open.science or anonymised Zenodo)
with exact theorem statements, definitions, version pins, and per-theorem `#print axioms` output.
Direct answer to your question: of the listed
results, the state-space-geometry results genuinely model state transitions (the operator family,
rebase group structure, commutation); the composite-ray identity is a static algebraic identity
whose mechanism-level sequencing is *not* formalised; the collar result is as conceded in §2. The
new transition-rule lemmas of §1 will be added. We will not label anything "verified" in the paper
beyond what the deposited ledger contains.

## 4. The four localised errors (your §3.4, Question 11) — all accepted

- Appendix B small-trade display: corrected to Δx = −(Δy/mp)/(1 + Δy/(y − β)); we reproduce your
  −0.009980 vs −0.010020.
- Appendix C.1: "θ < sNorm" corrected to "θ > sNorm" for the OTM call branch.
- Figure 1 caption: corrected — the pivot-through-the-reserves-point statement is an infinitesimal
  property; for finite trades the post-trade curve does not pass through the old reserves point
  (we reproduce 10.000 vs k′ = 9.8614).
- Orientation: the notation table's sNorm = (1 − w)/w is the reciprocal of Appendix B's mp at the
  45° point; the revision pins a single convention in the notation table and audits every use of
  sNorm, mark, and the sign rule against it. Stale cross-references, Related-Work placement, and
  the C1/C4 labelling mismatch will also be fixed.

## 5. Economics (your §5, Questions 4–7)

We answer honestly rather than defensively; several of these are open design surfaces and the
revision will say so rather than imply otherwise.

- **Q4 (put-wing drift at the design's own equilibrium):** your finding is correct for the
  presented vol-free mark. Two revision tracks: (i) the funding mechanism will be given at least a
  functional form (deviation-proportional, per-ray, referenced to the w = ½ anchor at the
  position's own ray), together with an analysis of what it does and does not charge — including
  the fact, which you identified, that it vanishes when the pool sits at its anchor; (ii) the mark
  family is being generalised with a single static, volatility-calibrated curvature parameter set
  at pool creation, which is the design's intended answer to vol-free pricing; the revision will
  either include the calibrated mark or scope the γ = 1 mark's limitations explicitly. We do not claim here that either track neutralises your Monte Carlo
  result; that analysis will be in the revision or the limitation stays.
- **Q5 (settlement conservation ledger):** accepted as open. For each of the four items — who funds
  the L0-vs-(L0 − 1) wedge, the raw_net < 0 branch, a magnitude-aware (rather than sign-only) club
  floor, and the carved-equity denomination at the liquidation boundary — the revision will either
  specify the design or list the item explicitly as an open limitation; we do not claim here that
  any of them is currently solved, and the design decisions are still open on our side. The worked
  example will be recomputed with leg values derived from an actual pool state instead of
  stipulated inputs.
- **Q6 (momentum bands / unpriced convexity):** correct as posed against the submission; whether
  the bought wing must oppose the origin perp is a product-level decision currently unspecified.
  The revision will either restrict band orientation or price the transfer; until then it is a
  limitation.
- **Q7 (settle-sandwich):** no fee model is specified in the submission, so no manipulation cost
  floor can be claimed; accepted. The revision will state the fee model assumption under which
  settlement is read, and the sNorm smoothing question, or scope them out explicitly.

## 6. Question 8 (q ↦ Δy mapping)

Accepted: the mapping from a leg's notional q at ray θ to the swap cash leg Δy appears nowhere and
position-opening pool impact is therefore under-determined in the submission. It will be specified
in the revision as part of the §1 transition-rule rewrite (it is the remaining interface of that
rule). We do not improvise it here.

## 7. Questions 9, 10, 13 (prior art, citation integrity, naming)

- **Reference [7]:** the authorship error you identify is accepted, and the reference will be
  corrected to the actual authors (Lambert and Kristensen, arXiv 2204.14232) as part of a hand
  re-verification of every reference against primary sources. You are right about the cause: an
  LLM-drafted reference that escaped author verification.
- The revision adds and positions against: Evans 2020 (arXiv 2006.08806); Angeris, Evans, Chitra
  2021 (arXiv 2103.14769) and RMM-01; InfinityPools; Pusceddu & Bartoletti (FMBC 2024,
  arXiv 2402.06064) for the Lean-AMM line; and Milionis–Moallemi–Roughgarden–Zhang LVR
  (arXiv 2208.06046) for the convergence-cost framing, which we agree applies near-verbatim to the
  translated constant product. QuantAMM is recharacterised as prior (not "concurrent"), and the
  Balancer LBP time-varying-weight history is stated correctly.
- **We agree with your deflation of the curve dynamics:** under u = x − α_T, v = y − β_T each
  trade's arc is a constant-product on shifted virtual reserves. The revision claims novelty where
  you located it — the per-trade endogenous weight update serving tradable per-strike claims, and
  the semantic layer (strike-as-ray, ray parking, the composite-ray sinh identity and its
  cross-wing obstruction, anchor-curve per-strike funding references, carved-perp settlement
  denomination) — not the curve family.
- **Q13:** yes, the working name collides with QuantAMM's "Temporal Function Market Making"; the
  protocol will be renamed or the collision explicitly disambiguated in the revision.

## 8. Question 12 (reference implementation, L0, club backing)

The reference implementation is a research prototype (a self-contained browser simulator used to
exercise the pricing, funding, and settlement paths); it is not an on-chain implementation, and we
will either report simulator-based behaviour explicitly labelled as such or drop the mention. Gas
figures are not claimed. L0 selection/bounds and multi-winner club dynamics are open: the
magnitude-aware floor of §5/Q5 is the first commitment; a full collateralisation analysis is
future work and will be listed as such.

---

## Summary of what changes in the revision

1. §5.1 rewritten as a state transition rule (conservation applied at the trade's own point; flows
   evaluated there; w stored); Appendices D/F scoped to the spot-trade operator; the q ↦ Δy
   interface specified; "invariant" framing corrected throughout (k is a readout, not conserved).
2. collarSurplus derived, printed, domain-pinned, counterexample exhibited, claim stated at its
   true strength; the swap-composition prose claim withdrawn pending a result that covers it.
3. Anonymised Lean artifact deposit at submission; static-vs-transition status of every formal
   result stated; new transition-rule lemmas added to the ledger.
4. All four localised errors fixed; references corrected and re-verified; prior art added and the
   novelty claim repositioned; naming collision resolved.
5. Funding given a functional form and analysed against the equilibrium-drift objection; settlement
   conservation either fixed (wedge payer, magnitude-aware floor, raw_net < 0, carved-equity
   boundary) or honestly scoped; worked example recomputed from pool state.

We are grateful for the report's depth — in particular §3.2(1), which exposed that our §5.1
asserted a different mathematical object than the one the mechanism uses. The mechanism survives
that correction; the paper needed it.

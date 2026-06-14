# VERDICT — BUILD_SPEC_wcurve (FAST core-charter pass, speed posture)

_skeptic, 2026-06-10. Artifact: `notes/research/BUILD_SPEC_wcurve_2026-06-10.md` (research-lead)._
_Posture: SPEED-RUN (POSTURE_SPEEDRUN_2026-06-10.md). Theory-risk LET RIDE; I hard-block only
the 5 core-charter items. Manager already re-derived the two load-bearing formulas (on-(W)
mark==slope no e^−ghMu; γ_loc>1⟺w>½) — I did NOT re-derive those._

## Verbatim channel — HELD (no FLAG-PROCESS)
The operator's acceptance test was handed as a quote; I verified it against
`history/operator/2026-06-10_kurtosis-curve-family-brief.md` entry 1 (the operator's signed test):
> "...trades warp the curve, not a dot sliding."
Manager relay faithful. Entry 3 (verbatim) further fixes "skew determined by x y w (trading)" and
the polar-lens "skew = angle shift φ" — the strong form. No paraphrase-as-quote.

## VERDICT: GREEN-TO-BUILD — with ONE standing FLAG (not a ship-blocker)

### PASS — #16 trade-warp HONESTY (the load-bearing check)
The spec does NOT dress R-simple as the warp. §1.2 builds R-simple (reserves slide on a FIXED
field), and labels it `[theory-risk-accepted]` (T2). §1.2's ⚠ box names R-simple in plain English
("skew = the reserves point sliding to a steeper/flatter part of a fixed warp") and explicitly
contrasts it with R-paper ("the trade re-centers the field ... the warp itself moves — this is the
operator's 'trade reshapes the curve' in its strong form ... UNIMPLEMENTED (#16, OPEN)"). §8.1
repeats it as a standing FLAG to the operator. The honesty contract is met: the weaker form is
labelled, not buried. Attack attempted (does any sentence imply R-simple satisfies the operator's
clause?) — FAILED; the spec never claims it does.

### FLAG-OMISSION (standing, NOT ship-gating this build) — the acceptance clause is unmet, and the spec says so but does not say it LOUDLY enough at the top
R-simple is "a dot sliding on a fixed field" — which is exactly the thing the operator's signed
acceptance test rules OUT ("trades warp the curve, not a dot sliding"). The spec is honest about
this in §1.2/§8.1, but the **scope header (§0)** does not state in one plain sentence that THIS
BUILD does not meet the operator's trade-warp acceptance clause. Under the speed posture this is
LET-RIDE-able (it is labelled, the operator authorized a theory-risk build, and the manager is
relaying R-paper as the deferred strong form) — so it does not gate the ship. But it is my
STANDING #16 FLAG-OMISSION (continuous since verdict #2/#3): nobody is building the strong warp;
this build is the weak form. The operator must see, in one sentence, "this build ships the dot-
sliding reading; the curve-reshaping reading you signed for is deferred (R-paper, OPEN)." Route
that sentence to the operator. The hole: a reader skimming §0 could believe the acceptance test
is satisfied; only §1.2/§8.1 reveal it isn't.

### PASS — inventory #1–#16 (re-counted to 16 myself; none silently dropped)
1 Balancer base — §0 (v24 base, plain Balancer). 2 Warp — §1.1 wField (weight, not score). 3
Kurtosis knob τ — §6, static/vol-set, correct sign-label caution. 4 Carry — §0.2, q=ln p, dq/du≠1
honored. 5 Rebase — §1.3, carry-shift, w-not-preserved honestly flagged. 6 value∝S^(−γ) — §2 via
γ_loc, L7. 7 ITM smooth-pasting — §2 mark, Reading A locked, Reading B NOT silently adopted (§8.4).
8 Strike registration — §3 sNormStrike. 9 Funding — §4, price-anchor p=P, γ→±γ_loc. 10 Slippage
basis — §0.1 (mpGeom collapses to getMP_raw; gotcha #12 honored conceptually). 11 Dollar pipe —
§5, REUSE hard-stop. 12 THE gotcha — §0.1, explicitly addressed (no e^ghMu port). 13 Solvency —
§8.3 (γ>1 wing-lock constraint) touches it; thinner than #1–#12 but present as the w_±>½ guard,
not silently absent. 14 Esscher tilt — not named by that label, but the conserved-object question
is handled correctly (α/β conserved per-trade; no CPMM X·Y-product invariant asserted) — N-A-by-
behavior, acceptable. 15 File-safety — §4-equiv; the spec is notes-only/no engine edit, defers to
the gate (hard, not waived). 16 Warp-with-trades — §1.2/§8.1, dispositioned (R-simple ADOPT,
R-paper OPEN). All 16 accounted for. No "all 15" stale-count regression (pattern #6 clean).

### PASS — honest labels
Every adopted-without-proof item carries `[theory-risk-accepted]` (T1–T5 in §7; the §1.2/§1.3/§4
inline tags match). `[proven]` items (L1–L9) are the numerically/analytically established ones —
including the two the manager re-derived (L4 mark==slope, and γ>1⟺w>½ is encoded as the §8.3
wing-lock constraint). The γ>1 / w_±>½ constraint is stated as a hard calibration constraint (§8.3:
"the UI/setup must reject w_± ≤ ½"). No theory-risk item is dressed as proven. Spot-check: §1.3's
rebase carry-covariance lemma is labelled "PROPOSED-only, not Lean-verified" (T3) — honest.

### PASS — no dead-headliner re-assertion
No τ≡δ EXACTLY (§0.1 calls the e^ghMu factor a "GH-latent-score artifact ABSENT in (W)" — the
kernel-in-SCORE vs kernel-in-WEIGHT split, correctly). No "no invariant exists" (L1 asserts the
first integral F exists, RK4 3.4e-13). No "GH = one (W) setting" (the spec treats GH and (W) as
DIFFERENT curves throughout — §0.1, §1.1). Pattern #4 (slot conflation) clean. The three dead
headliners stay dead.

## The most important line
**Honest and shippable as a speed-run build — the one thing the operator MUST be told in plain
English before he reads §1.2: this build ships the "dot sliding on a fixed warp" reading
(R-simple), which is the exact thing his signed acceptance test rules out ("trades warp the curve,
not a dot sliding"); the curve-reshaping form he signed for (R-paper) is deferred and OPEN.**
The spec is honest about this internally — but the manager must surface that single sentence to the
operator, not leave it for him to discover in §1.2's ⚠ box.

## Disposition for the manager
- GREEN-TO-BUILD. The standing #16 FLAG-OMISSION does NOT gate this ship (labelled, theory-risk
  authorized, R-paper relayed as deferred). It is NOT cleared — it persists until the operator
  answers strong-vs-weak with this build's reading in front of him.
- One required relay action (not a build fix): hand the operator the plain sentence above so he
  ratifies R-simple knowingly. This is a verbatim-relay duty, not a redesign.

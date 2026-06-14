# Manager review — AFT 2026 referee report vs. current project state (2026-06-12)

> ## ⚠ CORRIGENDUM (2026-06-12, same day, manager — operator-caught)
> **This review's §2 mis-states the current HEAD.** It was written against `main` (9c9ca6b,
> 2026-06-11, HEAD = v26c GH) per the memory-follows-main rule; the operator corrected me:
> the **current canonical HEAD is `HEAD_temporal_mvp_v28_lens.html` (md5 `7e1ae39b…`)** on the
> unmerged branch `claude/exciting-archimedes-txs2wx` (210 commits ahead of main, live
> 2026-06-12). Per that branch's BUILD_LINEAGE: the **GH line (v25→v26c) was DEMOTED 2026-06-10**
> (operator entry 28); v27_wkurtosis ((W) kurtosis curve, strong-form trades-warp) was promoted
> then demoted 2026-06-12 in favour of **v28-lens = plain v24 Balancer pool + static polar lens**
> `h_τ(u)=√(τ²+u²)−τ` (one static τ kurtosis/vol knob; lensed exponent `g_loc=γ·h′(|u|)`; pricing,
> settlement `S*=K·g_loc/(g_loc+1)`, funding ±g_loc→0 at ATM all through one lensed helper;
> pool fns byte-identical to v24). **I verified the build md5 from the branch myself.**
> Corrections to the dispositions below:
> 1. **§2 first bullet weakens and partly reverses.** The submission is *closer* to current HEAD
>    than this review said: v24/v28's pool IS the paper's substrate — trades move along the
>    trajectory hyperbola `(x−α)(y−β)=αβ` with `w=α/x` derived, i.e. the paper's §5 Trade Formula
>    **at the reserves point is implemented in the live HEAD**. What remains unimplemented is the
>    off-ATM *trade-point* mechanic — referee fatal #1's exact subject — which is the live open
>    spec question on that branch (its transcript entry 117, "~100 regressions" estimate).
> 2. **§3.1 update:** "awaiting green-light since 2026-06-10" is stale. The demoted-but-retained
>    v27 implemented the **strong-form trades-warp with α,β conserved per trade**, recorded in its
>    lineage as "skeptic-verified the UNIQUE conservation-consistent trade" on the (W) curve. So
>    the project holds a concrete in-repo candidate answer to referee Q1 (which conserved pair,
>    induced (x,y,w) update) — pending a dedicated check that it answers the referee's exact
>    objection, and pending the operator's curve decision (v27 was demoted on visual-warp/product
>    grounds, not on the trade law). Fatal #1 remains REAL and OPEN for the v28 HEAD.
> 3. **§2 second bullet re-bases:** the answer-direction to the "vol-free mark" critique is now the
>    **v28 τ lens** (static, vol-calibrated kurtosis knob per operator ruling 3), not GH γ. The
>    smooth-pasting family persists in lensed form (`S*=K·g_loc/(g_loc+1)`), so the paper-era
>    ray-parking is still superseded — by v28's settle-at-lensed, not v26c. The funding row stands:
>    v28 funding →0 at ATM/anchor, so referee Q4 (what charges the carried wing at equilibrium)
>    stays open.
> 4. **Process:** asserting "HEAD stays v26c" to the operator without scanning open branches was
>    my error (memory-follows-main covers memory conflicts; it does not make unmerged
>    operator-ruled promotions invisible). The engine single-writer is the archimedes session;
>    this session stays non-engine. The paper revision's engine-state passage (brief item 6(iii))
>    gets a follow-up patch to cite v28-lens, not the GH engine.


**Inputs (mirrored in this directory):** `REFEREE_REPORT.md` (consolidated PC report, REJECT 4/5)
and `aft2026_submission.pdf` / `aft2026_submission_extracted.txt` (21-page anonymous submission,
the dynamic-weight w-warp paper). Operator request + suspicion: verbatim in
`history/operator/2026-06-12_referee-report-review.md` entry 1.

**Project state referenced:** HEAD engine `engine/builds/HEAD_temporal_mvp_v26c.html`
(md5 `6cc73563…`, GH curve-baked, γ>1, ITM American smooth-pasting, uniform strike registration);
`formal/INDEX.md` provenance ledger; CLAUDE.md §0 operator rulings 2026-06-10;
`docs/feature_inventory.md` item 16 (trades-bend-curve: RULED, OPEN-UNIMPLEMENTED).

**What I verified myself this turn** (`verify_referee_claims.py`, all PASS): referee claims on
(1) the off-ATM trade point lying off the trajectory hyperbola (18.93 vs 25), (2) the Appendix B
small-trade display being wrong (−0.009980 exact vs −0.010020 printed), (3) the Figure-1 caption
being false for finite trades AND k changing under trades (10.0 → 9.8614), (4) the sNorm/mp
orientation conflict (reciprocals at w≠½), (5) the repo Lean artifact `C2.lean`'s `collarSurplus`
being a posited structural form `θ·((1−w)/w−1)`, not the paper-claimed derivation. I read
`C1.lean` and `C2.lean` directly. Labels below are honest: nothing here is "verified" beyond what
I actually ran.

---

## 1. Verdict on the operator's suspicion — CONFIRMED, and strengthened

Suspicion (verbatim): *"the paper opens with the balancer function misleadingly described /
portrayed as an invariant rather than the substrate for a state transition system (we've defined
formally in the research side and lean stuff)"*.

**Confirmed.** The abstract and §1 say the pool is "governed by the weighted constant-product
invariant (x^w)·(y^(1−w)) = k with a dynamic weight w". Under the paper's own trade law this k is
**not invariant**: my numeric (claim 3) shows k: 10.0 → 9.8614 on a finite trade, and the paper's
own Appendix F admits it ("trades change k"). The true per-trade conserved quantities are α = x·w
and β = y·(1−w); the pool curve is a **state-dependent level-set family** — the substrate on
which the state transition system acts — exactly as the formal side has it
(three-operator family by (α,β)-scaling signatures; trajectory hyperbola; β as the joint
trade+rebase invariant — all in the submission's own Appendices D/F and in the Lean state-space
work). The paper does state the correct reading mid-body (§5.1: "k is a label on the pool curve's
level set — a dependent readout, not a primitive of pool state"), but the abstract, §1, §3, §14,
and §15 all lead with "the invariant", and the title-level claim inherits the confusion.

**Why this matters beyond style:** the referee's fatal problem #1 (off-ATM trade update
inconsistent/undefined) is fed by this framing. The trade formula is derived on the trajectory
hyperbola through the *reserves* point (the real invariant structure), while §3's "treat any trade
point as if it were the reserves point" talks about the *pool curve* (the level-set readout). The
two objects coincide only tangentially at the reserves point — my claim-1 numeric is exactly the
referee's. Presenting the level-set readout as "the invariant governing the pool" is what lets the
spec ambiguate between global-(α,β) and local-(α_T,β_T) readings. Fixing the framing makes the
gap *visible and stateable*; it does not by itself close it (see §3.1 below).

## 2. The big context fact the referee couldn't know

The submission describes the **paper-era w-dynamics design**. The project's live engine (v26c) is
the **GH curve-baked** engine: fixed curve, reserves point moves, γ>1, value ∝ S^(−γ), ITM =
American smooth-pasting S* = Kγ/(γ+1), funding = slope-deviation vs the w=½ anchor at the strike
ray. Two consequences:

- **The paper's core trade mechanic is not implemented anywhere.** CLAUDE.md §0 ruling 2 and
  inventory item 16 already say this plainly: "today's engine moves a point on a fixed curve and
  does NOT implement the paper's core trade mechanic". The referee's fatal problem #1 is the
  *referee independently rediscovering our own standing open item* — with the sharper finding
  that the paper's written spec for it is not merely unimplemented but **under-determined as
  written** (panel unanimous). This must flow back into the queued w-warp build: the "reference
  spec = the paper's Trade Formula" now has a documented hole at off-ATM trade points.
- **Several economic objections are already addressed *in direction* by the engine, not the
  paper.** The referee's "the mark is vol-free / put wing is an uncharged submartingale" critique
  applies to the paper's γ=1-style mark (sNorm/θ). The live engine prices with γ>1,
  vol-calibrated (Merton tie γ(γ+1)=2r/σ² as the Gaussian slice; μ = GH Laplace exponent,
  trusted-from-prover), i.e. the project already moved off the vol-free mark. Likewise the
  paper's ITM ray-parking/mark-saturation was superseded by the operator-locked American
  smooth-pasting boundary (v26b/v26c). **Label honestly:** these are answer-*directions*; no one
  has re-run the referee's MC against the GH engine's marks, and the "what charges the
  put-wing carry at equilibrium" question (referee Q4) is NOT closed by the engine's funding
  form, which is also zero when pool == anchor.

## 3. Disposition of the referee's three reject-grade findings

### 3.1 Fatal #1 — off-ATM trade update inconsistent/undefined (panel 3/3 REFUTED)
**Disposition: REAL, OPEN, OPERATOR-TIER.** Confirmed by my claim-1 numeric. This is inventory
item 16 + skeptic brainstorm Q2 ("does α,β conservation close on the (W) rounded-corner curve") —
the cheap first computation has been awaiting operator green-light since 2026-06-10. The referee's
question 1 is precisely the question our w-warp build must answer first. **No paper revision can
patch this; do not paper over it.** Escalation: the operator should know that the standing ruling
"reference spec = the paper's Trade Formula" now references a spec with a panel-unanimous hole
off-ATM; the w-warp design work must specify which conserved pair enters at a non-ATM trade point
and the induced global (x,y,w) update, then re-prove conservation. Also referee Q8 (q ↦ Δy
mapping) belongs to the same spec task.

### 3.2 Fatal #2 — collarSurplus undefined; headline biconditional trivial-or-false
**Disposition: REAL — and our own ledger already said so; the PAPER outran the artifact.**
`formal/INDEX.md` carries `collarSurplus_zero_iff_half` as **⚠ CARRIED[collarSurplus form]**, and
`C2.lean`'s in-file NOTE says the form is posited ("engine's exact closed form not in accessible
specs — proven content is the symmetry-iff at the anchor coordinate"). The submission's Appendix G
instead claims it is "derived from the concrete min(slope, 1/slope) mark formula" with "an
explicit skew counterexample" — **neither is true of the artifact** (no derivation from mark, no
exhibited counterexample; the artifact's zero-set is θ-independent, so the ∀θ quantifier is
vacuous, exactly the referee's "trivial" reading). This is a claims-honesty failure in the paper,
the precise failure mode the paper agent's charter exists to prevent. Also label drift: the paper
calls it "C4"; the repo run is "C2". **Fixable two ways, both queued below:** (a) immediately —
weaken the paper text to what the artifact proves (honest); (b) properly — research-lead derives
collarSurplus from the mark formula + sign rule (the referee's own reconstruction sNorm²−1 is the
natural candidate; if it survives, the theorem is honest-but-θ-independent and the paper must say
so), states the admissible-strike domain, and exhibits a numeric skew counterexample in Lean.

### 3.3 Fatal #3 — Lean artifacts withheld ("on request" under double-blind)
**Disposition: REAL, EASILY FIXABLE, OPERATOR-TIER (submission logistics).** The artifacts exist
in-repo (38 run dirs, 162 .lean, INDEX + audits), provenance trusted-from-prover. An anonymized
deposit (anonymous.4open.science / anonymized Zenodo) at submission was available and should be
the default next cycle. BUT: deposit must follow fix 3.2 — depositing the current C2 while the
paper describes a different theorem would document the mismatch, not cure it. Also referee Q3's
"do any of the five results model a state transition?" — currently honest answer: the state-space
geometry results DO formalize the operators (trade/rebase signatures, group structure), but the
headline C1/C4-as-claimed are static identities; say so.

## 4. Issue-by-issue disposition (referee §3.4, §4, §5, §8)

| Referee item | My check | Disposition | Owner |
|---|---|---|---|
| App B small-trade display wrong | CONFIRMED numerically | fix text (exact form −(Δy/mp)/(1+Δy/(y−β))) | paper |
| App C.1 "θ < sNorm" flipped | CONFIRMED (call OTM needs θ > sNorm for mark ∈ (0,1]) | fix text | paper |
| Fig 1 caption (curves pass through old point) | CONFIRMED false for finite trades | fix caption (tangency/limit statement only) | paper |
| sNorm vs mp orientation conflict | CONFIRMED (reciprocals at w≠½) | pin one orientation in notation + audit every use | paper |
| k presented as "invariant" | CONFIRMED k changes per trade | reframe opening: substrate / state-transition system, (α,β) conserved, k a derived label | paper (operator's suspicion — this item) |
| Stale cross-refs; Related-Work placement; C1/C4 vs no C2/C3 | read, consistent with submission | fix; align Lean labels with formal/INDEX.md run names | paper |
| Ref [7] fabricated authors ("Jesper White", "Jean-Marc Bordignon") | not independently searched this turn; plausible per referee detail | correct to Lambert & Kristensen (arXiv 2204.14232) + re-verify every reference | paper |
| Missing prior art (Evans 2020; Angeris-Evans-Chitra 2021; InfinityPools; Pusceddu-Bartoletti FMBC 2024; LVR line) | not independently searched | add + reposition novelty on the semantic layer (referee concedes the scoped line-532 claim survived) | paper |
| QuantAMM "concurrent" mischaracterization; Balancer LBP weights | per referee | fix Related Work | paper |
| q ↦ Δy mapping never given | CONFIRMED absent from submission | part of the off-ATM trade spec (3.1) | research-lead → operator |
| Funding: no formula; zero at own equilibrium | engine HAS a per-ray form (slope-deviation vs w=½ anchor) but it is also zero at pool==anchor | give functional form in paper from engine; the "what charges the submartingale wing at equilibrium" question stays OPEN — γ-calibration is the project's answer-direction, unproven against their MC | research-lead (analysis) + operator (design) |
| Settlement ledger: 1× wedge payer; sign-only club floor; raw_net<0 unguarded; carved-equity zero-crossing kills the hedge at liquidation | not re-derived this turn (their algebra is straightforward and I see no error on read) | REAL design gaps in the paper-era settlement section; the engine's Layer-1/2 settlement chain differs — needs a dedicated reconciliation pass; settlement semantics = operator-tier | operator (design) |
| Premium-neutral = unpriced variance transfer; momentum-band convexity extraction; settle-sandwich | not re-derived | log as open product/economics questions; no current artifact answers them | operator |
| "u=x−α, v=y−β makes it a shifted constant-product" novelty deflation | trivially correct algebra | concede in paper; novelty = semantic layer (strike-as-ray, parking, sinh identity, cross-wing obstruction, anchor-curve funding, carved-perp settlement) | paper |
| Worked example inputs stipulated | CONFIRMED (0.30/0.05 never derived) | derive stage-2 leg values from an actual pool state in the revision | paper + research-lead |

## 5. Actions (this session unless marked)

1. **DONE this turn:** evidence mirror; independent verification script; this review; operator
   transcript entry.
2. **paper agent:** revise `paper/temporal_paper_draft.md` — (i) the opening reframe (suspicion
   item: invariant → substrate of a state-transition system with conserved (α,β); k explicitly
   not conserved by trades), (ii) the four localized math-text fixes, (iii) Appendix-G honesty
   rewrite to match `formal/INDEX.md` labels and actual artifact content, (iv) references/prior-art
   fixes, (v) an explicit "open: off-ATM trade semantics" limitation instead of Appendix B's
   "same expression at the appropriate (x_T,y_T)". No new claims.
3. **skeptic:** mandatory pass on THIS review + the paper revision, with the operator's message
   verbatim. Standing FLAGs halt any merge.
4. **research-lead (queued, next session):** (a) derive collarSurplus from the mark formula +
   sign rule; admissible-strike domain; numeric skew counterexample; re-prove in Lean (replaces
   the carried form); (b) the α,β-closure-off-ATM computation **remains gated on the operator's
   green-light** (standing ask since 2026-06-10).
5. **operator decisions needed:** (a) green-light the off-ATM/α,β-closure computation (now
   urgent — it is the referee's fatal #1); (b) anonymized artifact deposit for the next
   submission cycle (after 4a); (c) settlement-ledger gaps (1× wedge, club floor magnitude,
   raw_net<0, carved-equity floor) are settlement semantics = operator-tier: decide whether the
   next revision re-engineers them or scopes them out; (d) venue strategy (resubmit AFT vs WINE
   2026 / FMBC 2027 per paper-agent pipeline).

**Bottom line:** the referee report is high quality and, on every claim I could check, correct.
The single-state algebra survives (as they say). The three reject-grade findings map onto things
the project already knows about itself: fatal #1 = inventory item 16 / the un-green-lit w-warp
spec question; fatal #2 = our own ⚠ CARRIED label that the submission text ignored; fatal #3 =
logistics plus fatal #2. The operator's framing suspicion is confirmed and is the right *first*
fix, but it is the entry point to fatal #1, not its resolution.

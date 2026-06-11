# FRAMEWORK — curve-agnostic admission contracts (deliverable A, 2026-06-11)

_research-lead. Operator spec: transcript `history/operator/2026-06-11_curve-agnostic-framework-brainstorm.md`
entry 1 (go-ahead entry 9). This is the information-geometry / port-Hamiltonian lift of the
single-μ core from GH-pinned to **contracts-any-curve**: the framework ADMITS candidate curve
families; the comparison table (deliverable B, separate pass) compares them; the **operator picks**.
No curve decision is made here. No Aristotle submissions this pass (obligations are STATED only).
No engine edits. Numerics: mpmath dps=30, scripts `/tmp/fw_warp_checks.py`, `/tmp/fw_germ_checks.py`
(ephemeral; every quoted number is restated with its formula here)._

**Provenance labels used on every claim:**
[DERIVED] = algebra/calculus done here or in a cited note · [NUM] = numerically checked ≥25 digits
this pass · [ENGINE] = verified on the live engine build (cited) · [TFP] = trusted-from-prover
(Aristotle, audited; run cited; provenance map `formal/INDEX.md`) · [OPEN] = honestly open ·
[RULED] = operator ruling (transcript-cited).

---

## 0. Plain-English overview (TLDR)

We stop arguing about which curve is right and instead write down the tests any curve must pass.
A candidate family enters as a tuple — a curve shape per state, a warp rule for trades, a knob τ —
and must pass ten admission contracts: the warp principle (AC-1), mode-at-mark (AC-2), the
four-number budget (AC-3), the LDF definition (AC-4), funding vs the unskewed anchor (AC-5),
re-pricing semantics (AC-6), solvency over the reachable set (AC-7), manipulation cost (AC-8),
the engine pipe (AC-9), and the composition map (AC-10). Each contract has a precise math
statement, known pass/fail instances, and a verification procedure (numeric gate NG-x and/or Lean
obligation FW-x — stated, not submitted).

**The one new result of this pass (AC-2):** the warp rule and mode-at-mark are independent
conditions, and for regular ray-profile warps **and trades AT the mark** they can hold together
**iff the curve's elasticity passes through the mark at value 1 with slope −½** (local weight ½,
weight-slope −⅛). _Scope qualifier (corrigendum 2, §16): the characterization is derived for
at-the-mark trades; OFF-mark trades (strike∩curve ≠ mark — the paper's product primitive, L41–43)
are UNCHARACTERIZED: the necessity legs (ε′(mark)=−½; symmetric-genesis exclusion) survive
unchanged, sufficiency/existence off-mark is open._ This class is non-empty [NUM] — so no "none
exists" stop is triggered — but it excludes the natural re-anchored √-sigmoid at all but one
sign-locked skew, and it excludes the symmetric (unskewed) state itself, so a pool opened
symmetric cannot satisfy both from its first trade under any regular warp. That tension is
escalated to the operator (§AC-2.5), exactly where the manager's veto-able operating default
lives.

---

## 1. The spine: one generator, typed layers (the info-geometry / PH lift)

Plain English: everything the pool does should be readable off one convex function, and each
layer of the system should only consume the layer below through a stated contract — so a change
at any seam either type-checks everywhere or is rejected.

**The single-μ core lifts as-is at the type level.** The Lean object `MetriplecticCore` (run T2,
84a6a417 [TFP]) has ONE field μ (C², convex) and derives price = ∇μ, dissipation metric
R = ∇²μ = Fisher, value metric = 1/μ″ (Legendre dual), trade action, and sNorm from it
(`single_source`: two cores agreeing on μ agree on every reading). Nothing in that structure is
GH: GH entered only as the *instantiation* μ := ψ_GH. The curve-agnostic framework = the contract
a candidate must satisfy to instantiate the same core:

- **Generator layer (admission).** In the carry/gauge coordinate u = log p − log P, the candidate's
  log-price map q(u) must be strictly increasing; equivalently the generator Φ (any Φ with Φ′ = q)
  is strictly convex; equivalently R := Φ″ = q′ > 0. For weight-profile families
  q(u) = u + ln(w(u)/(1−w(u))) + const and q′ = 1 + w′/(w(1−w)) — so **the AMM-validity gate, the
  Fisher/dissipation metric, and R ⪰ 0 are the same object** [DERIVED —
  `curves/balancer_w/HETEROGENEOUS_WEIGHT_implied_density_2026-06-09.md` gate + UNIFY Stage-0
  M=Fisher-in-gauge-coordinate]. Coordinate honesty: this is exact in the gauge coordinate s=u−μ′,
  NOT raw u [DERIVED, Stage-0 caveat].
- **Gauge layer.** Carry P = Ny/Nx-analogue; mode ray = 45° diagonal in carry gauge (AC-4); rebase
  = degree-0 translation (AC-9); strike registration θ = sNorm(K) in the gauge coordinate.
- **Dynamics layer.** Trade = the warp flow (AC-1), whose conserved quantities are the family's
  J/Casimir leg (Balancer instance: α, β); fee/arb leak ≥ 0 is the R-leg — for ANY admitted curve,
  monotone slope ⇒ arb leak ≥ 0 (the PH3_grounded derivation `∫(g(u₂)−g(u))du ≥ 0` uses only
  strict monotonicity of the slope law, not the GH form — generalization stated as FW-8) [TFP for
  GH form, run PH3_grounded; abstract lift = obligation]. Funding = port; passivity gives
  necessity, never sufficiency (PH-4b [TFP]) — solvency stays extrinsic (AC-7).
- **Settlement layer.** Power-law wings ⇒ the American boundary and coefficients are FORCED:
  value+slope match at an arbitrary point derives S* = Kγ/(γ+1) (call) / K(γ+1)/γ (put) and the
  coefficients — run T1a (3566d93c) [TFP] is stated over the abstract value law a·S^(−γ), so it
  **lifts to any candidate whose wings are exact power-laws**; the candidate owes only its
  γ(w,τ) map (AC-3) and wing exactness (asymptote preservation).
- **Reporting/engine layer.** The 4 curve-dependent functions + gotcha disambiguation +
  slippage basis + dollar pipe (AC-9).

**What does NOT lift (honest):** every GH-kernel instantiation (broken bridge — kernel-in-SCORE ≠
kernel-in-WEIGHT, skeptic-verified, `notes/skeptic/VERDICT_KURTOSIS_KNOB_2026-06-10.md`); the
fixed-curve reading "trade = latent translation" (inventory #14) — under warp semantics the trade
flow's conserved object is family-specific and for every family except the paper's Balancer
instance it is [OPEN] (AC-10, skeptic open (c)).

---

## AC-1 — The warp principle (trade = slope transport, integrally)

Plain English: a trade does not slide the point along the curve; it bends the curve so the slope
the point was heading toward arrives at the point, the reserves still tracking real tokens — and
a finite trade is the accumulation of infinitely many such infinitesimal bends.

**Canonical statement** (operator, entry 7, verbatim — pinned in `framework/README.md` §1):
point stays; curve bends; destination slope arrives at the trade point; finite trade = integral
of infinitesimal slope-updates, each slice read off the already-bent curve. Companion rulings
[RULED]: 2026-06-10 entry 14 ("trades bend the curve: yes") and entry 16 ("its w that the trade
changes (while x and y also change to be faithful to actual reserves, refer the paper)").

**Infinitesimal update law (math).** State = (reserves p, curve shape θ_c) with a slope FIELD
m(·; θ_c) defined off-curve through the family's foliation (one leaf per point at fixed shape).
For an infinitesimal cash leg dy at trade point q (= strike ray ∩ curve; = p for spot):

1. **Token faithfulness:** dp = (dx, dy) with dx = −dy/m(q) — the tangent move (the swap legs
   are real). [DERIVED]
2. **Slope transport (canonical reading 1):** the shape update dθ_c satisfies
   m(q; θ_c + dθ_c) = m(q_dest; θ_c), where q_dest is where the point WOULD have landed sliding
   along the frozen curve. The destination slope is brought **to the trade point's location**
   (the pre-trade point), read through the new leaf there. [DERIVED — and this reading, not
   "slope at the new reserves," is the paper's: paper L39 says "the slope of that post-trade
   point is brought to the pre-trade reserves point," and only reading 1 reproduces the paper's
   Δw formula; reading 2 forces dw = 0. See AC-2 for the reading-2 robustness line.]

**Path-independence — what it requires.** The finite trade must be the flow of this law:
(i) well-posed ODE in the cash leg (the update field autonomous in state), (ii) semigroup —
trade(Δy₁) then trade(Δy₂) = trade(Δy₁+Δy₂), (iii) round-trip identity (fee-free): buy then sell
back = identity — the lossless J-leg; with fees, round-trip ≥ identity by exactly the leak
(passivity, R-leg). The clean mechanism is **first integrals**: quantities conserved by the
update field, which integrate the law in closed form. A candidate family must EXHIBIT its first
integrals (its α,β-analogues) or prove integrability otherwise — skeptic opens (c)+(d), stated
here as the contract. [DERIVED framing; per-family OPEN]

**The Balancer instance (the worked example — paper Trade Formula).** The paper's law
(`paper/temporal_paper_draft.md` L75–91): α = x·w and β = y·(1−w) individually conserved;
y′ = y+Δy, Δx = −αβΔy/((y−β)(y′−β)), Δw = βΔy/(y·y′); reachable set = the trajectory hyperbola
(x−α)(y−β) = αβ. Its infinitesimal form is exactly the slope-transport law in the constant-weight
foliation m_w(x,y) = (w/(1−w))(y/x):

- dx = −αβ dy/(wy)² = −dy/m and **dw = (1−w)·dy/y** [DERIVED: setting
  (w+dw)/(1−w−dw)·(y/x) = m·(1 + dy/(wy)), the frozen-curve destination slope, forces it];
- dα = x dw + w dx = 0 and dβ = (1−w)dy − y dw = 0 — **α,β-conservation IS the
  slope-transport law + token faithfulness**, not an extra postulate [DERIVED];
- numerics, re-derived independently of the skeptic [NUM]: x=y=100, w=½, Δy=10 →
  w′ = 6/11 = 0.545454…, x′ = 91.6666…, α′ = β′ = 50 exactly; forward-Euler micro-integration of
  the infinitesimal law, N=10⁴ steps: |Δw| = 9.1e−30, |Δx| = 1.5e−4 (O(1/N) Euler error, →0 with
  N — the closed form is the integral's limit); round-trip buy-10-sell-back returns
  (100, 100, 0.5) exactly. This re-derives the skeptic's run-5 verification (i) [cited:
  `.claude/agent-memory/skeptic/MEMORY.md` run-5 (i)–(ii)].
- the integral clause is load-bearing [NUM, confirming skeptic (ii)]: the transported slope at
  the old 45° ray after the finite trade is w′/(1−w′) = 1.2000, whereas a ONE-SHOT read of the
  destination slope off the original curve gives 110²/10⁴ = 1.2100 — equal only to first order.
  A one-shot implementation of the principle is wrong at finite size.

**Satisfies / violates.** Paper Balancer instance: satisfies (closed form, first integrals,
round-trip identity) [NUM]. Today's GH engine: **does not implement AC-1 at all** — trade moves a
point on a fixed curve (inventory #16, OPEN-UNIMPLEMENTED; engine-faithfulness pivot sequenced
first) [ENGINE-verified by skeptic code citations, FLAGS_2026-06-10]. Any proposed family without
stated first integrals: not yet admissible (incomplete, not refuted).

**Verification.** NG-1: micro-integrator (≥10⁴ steps) vs the family's closed form; first-integral
drift < 1e−12; round-trip identity to machine precision. FW-1/FW-2/FW-3 (Lean statements, §12).

---

## AC-2 — Mode-at-mark, and the joint characterization (the new result)

Plain English: after every trade the pool's own point should be the peak of the liquidity
distribution — the place where the curve's tangent is parallel to its ray — and it turns out this
is a second, independent demand on the warp: the paper's Balancer bend delivers the slope but
drops the peak, and the two demands can only coexist if the curve always crosses its mark with a
specific, fixed local tilt.

**OPERATING DEFAULT (manager-declared, operator veto PENDING — label, not law):** the warp rule
(AC-1) is PRIMARY; mode-at-mark is the SELECTOR among "geometrically most natural" warps. This
section supplies the math the selector actually selects.

**Statement.** Mode-at-mark: at every reachable state, the post-trade curve crosses the
post-trade reserves point with tangent ∥ ray — elasticity ε := |d ln y/d ln x| = 1 at the mark —
equivalently local weight ½ in carry units, equivalently the LDF mode sits at the mark (AC-4;
operator entry 4 item 3 [RULED]; formalized with the validity-gate qualifier in
`framework/LDF_DEFINITION_CHECK_2026-06-11.md` §2–3).

**Independence (known fact, re-derived).** The paper's Balancer instance satisfies AC-1 and
breaks AC-2: after the worked trade, slope at the new reserves = (w′/(1−w′))(y′/x′) = **1.44**
vs ray y′/x′ = **1.2** — elasticity 1.2 ≠ 1; indeed constant-weight w≠½ has NO tangent-∥-ray
point anywhere (elasticity ≡ −w/(1−w)), so the failure is curve-global [NUM this pass,
re-deriving skeptic run-5 (iii); LDF note Lemma C].

**The joint characterization [DERIVED+NUM — new this pass].** Work with ray-profile families:
elasticity a function ε(ũ) of the ray coordinate ũ = ln(y/x) − ln P (the natural class for the
fan/LDF picture), with a "regular" warp — the per-trade update δε(ũ) = A(ũ)·du + O(du²) with A
continuous at the mark (no structure at the trade scale). Trade at the mark, mode holding
pre-trade (ε(mark)=1, slope = ray ⇒ du = 2dy/y):

- transport (reading 1) forces A(mark) = ε′(mark) + 1;
- mode at the new mark (ray + du) forces A(mark) = −ε′(mark);
- jointly: **ε′(mark) = −½** — in weight terms **w(mark) = ½ and w′(mark) = −1/8**. The
  condition is direction-independent (linear in du) and must hold at every reachable state.
  It sits strictly inside the AMM-validity gate (w′ > −w(1−w) = −¼ at the mark). The mode
  violation rate when it fails is (2ε′+1)·du — for constant weight (ε′=0) that is du exactly,
  matching the measured elasticity drift 1 → 1.2 over du = ln(1.2) to first order, and the
  small-trade ratio (ε_new−1)/du = 1.000001 at Δy = 1e−4 [NUM].

**Existence — no STOP triggered.** The class is non-empty: the translating linear-germ family
w(ũ; c) = ½ − (ũ−c)/8 (center c re-anchored to the new mark each slice) satisfies BOTH contracts
with per-step residuals vanishing super-linearly (1.668e−10 → 1.667e−13 → 1.667e−16 as the step
drops 10× — a 1000×/decade fall = CUBIC per step, not du²; measurand R = h³/6 + h⁴/6 with
h = Δy/y, skeptic-reconstructed, reproduces all three digits to six figures — corrigendum 1, §16;
mode residual exactly 0) — i.e. exactly, in the integral limit [NUM; conclusion unaffected,
label was wrong]. A globally valid profile
with the frozen germ AND asymmetric power-law wings also exists: w(ũ) = ½ + (Δw/2)tanh(ũ/τ) −
A·ũ·e^(−ũ²/2s²) with A = Δw/(2τ) + 1/8 (at Δw=0.2, τ=0.5, s=0.35: w′(0) = −0.125 exact, validity
margin min[w′+w(1−w)] = +0.125 > 0 over ũ∈[−6,6], w ∈ [0.4, 0.6], wing weights 0.6/0.4) [NUM].

**What the selector kills (the honest teeth).**
1. **Pure re-anchoring of the standard √-sigmoid fails transport** except at the single
   sign-locked skew Δw = −τ/4: per-step transport mismatch = −(4Δw/τ + 1)·du — measured
   −7.333407e−05 vs predicted −7.333333e−05 at (Δw=+0.2, τ=0.3, du=2e−5), and second-order-zero
   (−4.4e−14) at Δw = −τ/4 [NUM]. So "re-anchoring warps" alone are NOT the answer; the answer is
   the **frozen-germ re-anchoring class** (profiles carrying the (½, −1/8) germ at their center).
2. **The symmetric state is not in the class** (unskewed ⇒ ε′(mark) = 0 ≠ −½): a pool opened
   symmetric cannot satisfy both contracts from its first infinitesimal trade under ANY regular
   warp. Singular warps (update kernel with structure at scale du) evade the necessity only by
   blowing up curvature as trades shrink. [DERIVED]
3. Consequently the live "w" can NEVER be the local weight at the mark — that is pinned at ½
   with slope −1/8; skew must live in the profile's shape away from the mark (wings/center
   offset). This confirms and sharpens the skeptic's carry-forward (LDF note §8 corrigendum 4)
   and feeds AC-10.

**§AC-2.5 OPERATOR ESCALATION (via manager — default-shaping, not procedural).** The joint
contract is satisfiable but only on a permanently tilted-germ class that excludes symmetric
genesis. Options the operator must pick among (framework admits all three; none chosen here):
(a) accept the frozen-germ class (every reachable state carries the (½,−1/8) germ; genesis
already tilted); (b) demote mode-at-mark to approximate/asymptotic (small standing violation
(2ε′+1)du per trade, e.g. ε′≈0 near genesis); (c) keep mode-at-mark as a family-selector
(holds at the family's designed operating states, not per-state-after-every-trade);
(d) [ADDED, corrigendum 3 §16 — skeptic FLAG-OMISSION] a SINGULAR/corner warp (update kernel
with structure at the trade scale), which evades the regular-class necessity — honestly OPEN:
neither constructed nor closed in this note (the skeptic's own sketch suggests finite corners
fail, but that argument is the skeptic's, not proven here); choosing (d) means commissioning
that analysis first. Robustness
note: under the non-canonical reading 2 of transport ("destination slope at the NEW reserves" —
NOT the paper's, which forces dw=0 there) the joint condition becomes ε′(mark) = 0, i.e.
flat-at-mark profiles — the fork between −½ and 0 is entirely the transport reading, so the
reading itself is worth one operator sentence. [DERIVED]

**Verification.** NG-2: post-trade elasticity-at-mark = 1 within tol over a trade sweep; per-step
transport residual vs the frozen-curve destination →0 quadratically; violation-rate formula
(2ε′+1)du checked per family. FW-4/FW-5/FW-6 (§12).

---

## AC-3 — The four-number budget (x, y, w live; τ static; γ derived)

Plain English: a candidate is allowed exactly four numbers — the two reserves and one weight as
live state that trades move, plus one kurtosis knob set at launch — and the wing steepness must
fall out of those, never be its own dial.

**Statement** [RULED — entry 5 verbatim: "no separate knob for wing sttpness etc. its x y w
determing skew, and single kurtosis / steepness knob thats it"; entry 14 ruling 3 (2026-06-10):
the knob is vol-calibrated at setup, static under trading]. State = (x, y, w) live + τ static.
**Rejection rule:** any family requiring a fifth number — a separate wing-steepness dial, per-wing
τ±, independently free w₋≠w₊ as SETUP dials, a second kurtosis parameter — is REJECTED at
admission. The wing exponent γ must be a PUBLISHED map γ = γ(w, τ) (derived, not fitted), with:
(i) γ in the pricing-law's required range on the relevant wing (engine lock γ∈(1,4) for the
single-γ slice); (ii) **τ-invariance of γ** — the knob must round the ATM elbow with wings staying
exact power-laws (asymptote preservation: confirmed for the (W) τ-profile, γ_loc(±100κ)
byte-identical across κ∈{0.05,1,30} [NUM, `curves/balancer_w/KURTOSIS_KNOB_…`]; confirmed for GH δ
(γ δ-invariant) [NUM, `curves/gh/REPARAM_…`]); (iii) smoothness in w so the warp flow is
well-posed.

**Satisfies / violates (instances).** (W) anchored family: budget-shaped (w_mid, Δw, τ with
γ_± = w_±/(1−w_±) derived) — but see AC-10 for which "w" the budget's live w is [OPEN]. GH-fixed
engine: has NO live w at all (fixed curve — fails jointly with AC-1) and its natural knob set
(α, β, δ) only fits the budget on the pinned slice α=γ+1, β=1, δ=τ [DERIVED]. REPARAM FULL fork
(βh and δ both free) and independent-w₋/w₊ setups: five numbers — rejected as stated, and the
asymmetric-wing settlement fork they imply is operator-tier anyway. Caveat carried honestly: at
the engine pin β=1, a single amplitude dial traces a COUPLED (skew, kurt) path in moment space
(skeptic stock-take; the operator's kurtosis ruling — curve steepness, not trader moments — makes
this a non-defect, but any moment-language label must say so).

**Verification.** NG-3: wing-exponent invariance under τ sweep (γ_loc at |u| large, byte-level
agreement); state-count audit (serialize the candidate: exactly (x,y,w,τ)); γ(w,τ) map published
and checked against the curve's measured wing slopes. FW-9 template (§12).

---

## AC-4 — The LDF contract (thickness from the closest axis; mode well-defined)

Plain English: the liquidity distribution is the curve's thickness measured from the nearest
axis (just its height once the quarter-turn fan is unfolded to a half-turn), its peak must be a
well-defined single point, and that peak — not anything statistical — is what "mode" means.

**Statement** [RULED — entry 4 item 1; formalized in `framework/LDF_DEFINITION_CHECK_2026-06-11.md`,
adopted here as the contract]. LDF = a HEIGHT function on the curve (not a density over angle):
H1 = min(x,y) (verbatim 90° reading), H2 = 2xy/√(x²+y²) (radius-preserving 180° unfold), H3 = 2xy
(conformal condition-generator; honest caveat — can invert max↔min, use as condition only).
Requirements: (i) the mode (argmax of thickness) exists, is unique, and is a point ON the curve,
robust across all x↔y-symmetric height choices; (ii) mode = unit-tangent-slope point (tangent ∥
ray, elasticity 1) — **with the validity-gate qualifier**: uniqueness of the unit-slope point ⟺
the AMM-validity gate (outside the gate a second root appears and "the" point is ill-posed — LDF
note §2 + §8 corrigendum 1); (iii) in carry gauge the mode ray is the 45° diagonal (the
conjecture forces the gauge — LDF note §3). The fan unfold itself (σ=2χ, ũ=gd⁻¹(2χ)) is exact,
curve-independent geometry [DERIVED, `curves/gh/GUDERMANNIAN_BRIDGE_2026-06-10.md` legs 1–2].

**Honest residue (do not paper over):** "kurtosis of the LDF" is HEIGHT-CHOICE-DEPENDENT — all
symmetric heights agree on the mode but differ on higher shape; plain Balancer's thickness-LDF is
a Laplace tent √k·e^(−|ũ|/2) while its latent-kernel object is the Gaussian corner — same curve,
opposite-flavor "kurtosis." Any shipped "kurtosis of the LDF" label must NAME its height function
(U1 residue, flagged not resolved) [DERIVED+NUM, LDF note §1].

**Satisfies / violates.** Anchored (W) warp family: exact at every (Δw, τ) inside the gate, both
skew signs, 30 dps [NUM, LDF note]. Constant-weight skew: fails in every gauge (no tangent-∥-ray
point exists). Live GH at the engine pin: fails — candidate modes sit at v≈0.13–0.25 while
calibration pins the mark at v₀=3; elasticity at the mark = e^(−ghMu) EXACTLY (1/748.62 at γ=3,
1/44.52 at γ=2) — THE gotcha factor is the measured mode displacement [NUM+ENGINE, LDF note §2,
corrigendum 2].

**Verification.** NG-4: mode location agreement across H1/H2; unit-slope-root uniqueness scan
(validity); elasticity-at-mark = 1 check post-trade (shared with NG-2). FW-7 ties the gate to
convexity (§12).

---

## AC-5 — The funding contract (anchor = the unskewed member at the same τ)

Plain English: funding is read by holding the pool's curve up against the version of itself with
the skew removed — same kurtosis knob — so whatever functional we pick can only ever price skew,
never the knob.

**Statement** [RULED — entry 3 item 2 verbatim: "funding is a geometric comparison across curves,
anchor curve is unskewed pool curve can be skewed, both to have same kurtosis"]. Funding = a
geometric comparison functional F(pool-curve, anchor-curve) evaluated per strike ray, where the
anchor is the family's UNSKEWED member at the pool's τ. Constraints ANY candidate functional must
satisfy (characterized, NOT decided — the functional choice is open):

- **F1 (zero iff unskewed):** F ≡ 0 across all rays ⟺ pool curve = anchor. Funding prices skew
  only; τ is common-mode by construction.
- **F2 (odd under reflection):** F flips sign under the put↔call reflection of the skew —
  consistency with the C3 symmetry layer (reflection identity proved over spec marks,
  C3_reflection [TFP]; spec↔engine link residual).
- **F3 (rebase equivariance):** the anchor rebases WITH the pool (presumably θ→θ/r alongside
  P→P/r) so funding is rebase-invariant. The anchor-rebase rule is [OPEN] (LDF note §4) — a
  candidate must state it.
- **F4 (per-ray field):** F is a field over strike rays ("baked into how the curve is pricing
  each strike ray" [RULED]), not one global number.
- **F5 (anchor existence — skeptic's forced column):** the family must ADMIT an unskewed member
  at EVERY reachable kurtosis/state — and note the anchor need only exist in the FAMILY, not in
  the reachable set (under the AC-2 frozen-germ class no reachable state is unskewed; the anchor
  is a reference curve, which is fine — but a family whose Δw=0 member degenerates at some τ
  fails F5 outright). [DERIVED framing]
- **F6 (continuity):** F → 0 continuously as skew → 0 (no funding cliff at the anchor).

**Candidate functionals (listed, not decided):** (a) slope-deviation ratio at the strike ray —
the locked engine rule generalized (anchor's w=½ slope at the ray; the minimal continuation of
today's funding [ENGINE — v26c locked rule]); (b) level/value gap between the curves along the
ray; (c) area/angular measure between the curves near the ray; (d) latent-score gap. Choice =
operator-tier, with F1–F6 as the admission filter.

**Verification.** NG-5: F(anchor, anchor) ≡ 0 over rays; sign flip under constructed mirror skew;
rebase-invariance numeric; anchor-existence sweep over reachable (state, τ). FW-10 template (§12).

---

## AC-6 — Re-pricing semantics (terms fixed; extrinsic floats; exercise on the live curve)

Plain English: a trade that bends the curve re-prices every open position's premium — like any
secondary market — but touches nobody's contract terms, and exercise always settles on the curve
as it is now.

**Statement** [RULED — entry 2 verbatim: "open options positions' extrinsic values change because
the 'secondary market' has repriced"; entry 3 item 1: exercise settles on the live warped curve].
For every open position: terms (strike θ, size q, side/wing) are immutable; the MARK floats on
the live curve (warps re-mark continuously); exercise/settlement executes against the live
(warped) curve state at exercise time. Decomposition contract: mark = intrinsic + extrinsic with
**intrinsic = f(oracle, K) only** — warp-immune (trades never move the oracle; registration in the
carry coordinate keeps it rebase-immune) — and **extrinsic = mark − intrinsic = the CONTINUATION
PREMIUM** (the c·sNorm leg of the American smooth-pasting layer). **No expiry language:** there is
no time value, no theta, no expiry in a perpetual structure — "extrinsic" here means continuation
premium, full stop (skeptic watch flag, honored). Provenance note: the paper's "no
intrinsic/extrinsic decomposition" (L27) is barrier-era — the decomposition entered with the
v26b American/smooth-pasting settlement [ENGINE]; entry 2 presupposes it [RULED].

**Propagation fact (state it, it bites in AC-7/AC-8):** under the budget, γ = γ(w,τ) and w is
live ⇒ **S* = Kγ/(γ+1) is live** — a trade that moves w moves every strike's exercise boundary
and can trigger the exercise frontier with the oracle standing still (skeptic run-2 forced row).
Settlement must be consistent at the warped state. [DERIVED consequence of AC-1+AC-3+T1a]

**Satisfies / violates.** Any family whose marks are read off the live curve with carry-coord
strike registration inherits this; a design that locks marks at trade-time terms (no re-marking)
violates entry 2; a design whose intrinsic depends on curve state violates warp-immunity.

**Verification.** NG-6: warp-trade sweep — open position's extrinsic re-marks, intrinsic
byte-invariant, exercise payoff computed on live curve = settlement chain output; no
expiry-keyword audit on candidate notes (process gate). FW-9 (T1a lift) covers the boundary.

---

## AC-7 — Solvency over the reachable warp set (#13)

Plain English: the pool must be able to pay what its own curve says every open position is worth,
not just at today's bend but at every bend trades can reach — and no geometry ever makes this
automatic; it stays a gate someone checks.

**Statement.** Per-strike liability = the curve value of the open interest at that strike,
marked on the LIVE curve (AC-6). The solvency contract has two parts:
1. **Reachable-set boundedness:** the candidate must CHARACTERIZE its reachable warp set
   W_reach (the orbit of the trade flow from genesis — e.g. the trajectory hyperbola
   (x−α)(y−β)=αβ for the paper instance [DERIVED]) and W_reach must be bounded/parametrized
   tightly enough that suprema over it are checkable. An unbounded or uncharacterized reachable
   set is an automatic admission failure (you cannot audit what you cannot enumerate).
2. **Coverage report at every reachable state:** Σ_strikes q_i · mark_i(state) ≤ reserves(state)
   for ALL state ∈ W_reach — reported as sup over W_reach of the liability/reserve ratio.
   Entry 3 item 3 [RULED: re-marking does not touch pool depth, "as of now not is easier"] means
   liabilities float while depth doesn't — so the ratio MOVES under warps and the sweep is the
   gate, not a one-time check.

**Hard honesty (unchanged, load-bearing):** geometry NEVER closes solvency. The funding port is
necessary, not sufficient (PH-4b: reserves-have-no-floor [TFP]); B1 (real solvency floor) was
proven only as a conditional structure with coverage CARRIED, never discharged [TFP, B1 run];
**B1 remains the extrinsic operator ship-gate** for every candidate. Kurtosis re-prices exposure:
moving τ re-prices the coverage report (X-depth at m=2 varies 6.7× over δ=0.08→3 at β=1 [NUM,
`curves/gh/GUDERMANNIAN_BRIDGE_…` #13]); a shipped knob setting re-runs B1.

**Verification.** NG-7: grid sweep over W_reach × strike book; report sup ratio; alert < 1 with
margin. Lean: FW-12 floor template + the existing B1 conditional [TFP] — no new submission
needed to STATE the gate.

---

## AC-8 — Manipulation cost / cost-to-warp (the attack column)

Plain English: if bending the curve is how trading works, then bending the curve is also how an
attacker marks their own book, moves exercise boundaries, or pushes someone's claim below its
floor — so the framework must price the bend and floor the damage.

**Statement.** Three sub-contracts:
- **X1 (intrinsic floor — HARD, the frame-break criterion):** at EVERY reachable state, every
  position's mark ≥ its intrinsic value on the live curve (the American right is never marked
  below immediate-exercise value). If any candidate admits a reachable state violating this, the
  frame breaks (riskless extraction: warp victim's mark below intrinsic, buy, exercise/unwarp)
  [skeptic run-2 criterion, adopted as contract]. In the locked engine the seam construction
  enforces value ≥ intrinsic at the boundary [ENGINE seam gate]; per-candidate it must hold over
  W_reach, not just at the seam.
- **X2 (round-trip passivity):** warp-there-and-back nets the attacker ≤ 0 including everything
  the warp moved (marks, funding accruals, settlement interactions). Note with teeth: the
  fee-free J-leg is EXACTLY reversible (AC-1 round-trip identity [NUM]) — so the lossless part of
  the warp costs an attacker NOTHING; the manipulation cost lives entirely in the R-leg
  (fees/spread/arb-leak) and in what the attacker cannot capture. A candidate must state which
  R-leg friction prices the bend. [DERIVED framing; per-candidate OPEN]
- **X3 (S*-trigger honesty):** because S* is live (AC-6), a warper can move exercise frontiers
  with the oracle still; settlement at the warped state must be self-consistent, and the
  candidate must state who bears the triggered flow (ties to AC-7's sweep).

**Verification.** NG-8: adversarial harness — (i) floor scan: min over W_reach × strikes of
(mark − intrinsic) ≥ 0; (ii) round-trip attack: warp→mark/settle→unwarp net P&L ≤ 0 with the
candidate's stated frictions on; (iii) frontier-trigger replay. FW-12 (§12). Status: contract
stated; NO candidate verified [OPEN].

---

## AC-9 — The engine pipe (carry/rebase, registration, slippage, dollars — curve-agnostically)

Plain English: whatever the curve is, the engine talks to it through four functions and a few
fixed conventions — each candidate must fill that exact socket, including the one trap that has
already burned us (the price coordinate is not the slope).

**Statement — the curve API (the 4 curve-dependent functions, generalized):**
1. **Mark/price field (getMP_raw-analogue):** a price COORDINATE π(state, ray) plus the EXPLICIT
   Jacobian to the true slope: slope = π · J(state) (GH: J = e^(−ghMu), factor 11.7/44.5/749/13780
   at γ=1.5/2/3/4 [ENGINE]). The candidate must publish both π and J — the gotcha
   disambiguation is a deliverable, not a footnote (inventory #12); a price/slope conflation
   passes every self-consistency gate (the historical slippage bug).
2. **tradeUpdate-analogue:** the AC-1 warp law with its first integrals.
3. **arbitrageToOracle-analogue:** the oracle-restoring map, expressed IN THE SAME trade law (no
   second mechanism) — under warp semantics the arb trade also bends the curve; post-arb the
   mark price = oracle. Today's GH arb moves the point (faithful to its fixed-curve law);
   the warp-world arb is part of the item-16 build [OPEN].
4. **rebase-analogue:** carry P → P/r, strike rays θ → θ/r, anchor/gauge re-centered, curve SHAPE
   (τ) untouched, J/R structure preserved (PH-6 sNorm legs [TFP]; degree-0 gauge). The anchor
   curve's rebase rule must be stated (AC-5 F3, [OPEN]).

**Conventions (fixed across candidates):**
- **Gauge coordinate:** carry u = log(price) − log P; all structure statements in the gauge
  coordinate s (raw-u breaks the Bregman/Fisher identities — Stage-0 caveat [DERIVED]).
- **Strike registration:** θ = sNorm(K) in the family's gauge-normalized strike coordinate — the
  v26c lesson: registering in the carry coordinate puts the OTM→ITM crossover at the dollar
  strike K for ALL γ (price-ratio registration drifted to oracle₀²/K) [ENGINE, v26c dir_gate +
  R2 [TFP]]. Candidate must define its sNorm and pass crossover@K.
- **Slippage basis:** % slippage is defined off the geometric marginal (slope) and must be
  BASIS-INDEPENDENT — the Jacobian J cancels in same-π ratios (GH: e^μ cancels [TFP R5/R3,
  ENGINE]); $ slippage = Layer-1 reserve-USD unchanged; mixed-basis quantities are forbidden
  (dir_gate's mixed-basis negative control stays a permanent gate).
- **Dollar/settlement pipe:** unchanged stage-2→3 chain; a candidate needing a NEW dollar path
  hits the §6-class HARD STOP (escalate, don't improvise).

**Verification.** NG-9: re-run the existing engine harnesses re-referenced per candidate —
mp-vs-slope finite-difference (gotcha), dir_gate (crossover@K + mixed-basis control), seam gate
(C¹ at S*), G4 (value ∝ S^(−γ)), rebase invariance, dollar-pipe byte-identity. These exist and
are curve-agnostic in form [ENGINE infra]; only reference values regenerate per candidate.

---

## AC-10 — The composition map (w = α/x ↔ Δw): THE open question

Plain English: the paper's trades move a number called w, and the profile families' skew is a
different number also called w — nobody has written the dictionary between them, and that
dictionary is the single most load-bearing unwritten object in the program.

**Statement of the open [OPEN — named as such; skeptic carry-forward, opens (a)–(d)].** Any
candidate family MUST specify:
- **(a) which dial bends:** the map M: (x, y, w_paper) → (family state: center c, skew Δw, …)
  conjugating the paper's update w = α/x to the family's warp-dial update — with the AC-2
  sharpening that the mark's LOCAL weight is pinned (½, −1/8) under the joint contracts, so
  w_paper canNOT map to the local weight at the mark; the natural target is the profile's center
  offset / asymptotic skew [DERIVED constraint, OPEN map].
- **(b) joint satisfiability instance:** where the family sits w.r.t. the AC-2 characterization
  (frozen-germ member? approximate-mode regime? selector-only?) — resolved per family, default
  pending operator (§AC-2.5).
- **(c) the α,β-analogues:** the family's first integrals making the finite trade closed-form
  (AC-1) — for every family except the Balancer instance this is the central unconstructed math
  object.
- **(d) path-independence off Balancer:** proven, not assumed (FW-13).

Until M is written for a candidate, "the budget's w determines skew" is a slogan for that family,
not a spec. This is inside inventory #16's OPEN; the build is sequenced after the
engine-faithfulness pivot [RULED, 2026-06-10 ruling 1].

**Verification.** NG-10: conjugacy test — push a trade through the paper law and through M⁻¹ ∘
family-warp ∘ M; states must agree along the whole path. FW-13 (§12).

---

## 12. Lean obligation statements (LISTED ONLY — nothing submitted this pass)

All against Lean 4.28.0 / Mathlib v4.28.0, standalone files importing or embedding the canonical
modules; B-style carried hypotheses as structure FIELDS where marked. Existing [TFP] results are
cited, not resubmitted.

- **FW-1 (Balancer warp flow):** the paper's finite Trade Formula is the flow of dx = −dy/m,
  dw = (1−w)dy/y: α = x·w and β = y·(1−w) are first integrals (deriv = 0 along the flow), and
  the closed form satisfies the ODE. (HasDerivAt algebra; T1a-style bridge lemmas.)
- **FW-2 (transport uniqueness):** in the constant-weight foliation m_w(x,y) = (w/(1−w))(y/x),
  reading-1 slope transport at the mark forces dw = (1−w)dy/y uniquely.
- **FW-3 (round-trip identity / J-leg):** trade(Δy) followed by the inverse cash leg returns
  (x, y, w) exactly (fee-free losslessness).
- **FW-4 (mode-violation law):** constant-weight post-trade elasticity at the mark =
  (α/β)·(y′/x′) exactly; corollary: ≠ 1 for every Δy ≠ 0 from the symmetric state.
- **FW-5 (joint germ characterization):** for ray-profile families with regular updates
  (A continuous), first-order transport + mode ⟺ ε′(mark) = −½ (w′(mark) = −1/8 at w(mark) = ½).
- **FW-6 (germ-family existence):** the translating linear-germ profile satisfies both contracts
  with O(du²) residuals (constructive witness for non-emptiness).
- **FW-7 (validity = convexity = R ⪰ 0):** q′ = 1 + w′/(w(1−w)) > 0 ⟺ strict convexity of the
  generator Φ (Φ′ = q); R := Φ″ ⪰ 0 exactly on the gate. (Lifts the gate into the single-μ core.)
- **FW-8 (leak ≥ 0, abstract):** for ANY strictly monotone slope law g (not the GH closed form),
  the arb leak ∫(g(u₂) − g(u))du ≥ 0 — generalizes PH3_grounded to the admission class.
- **FW-9 (settlement lift):** cite T1a (Sstar/coeffs forced from value+slope at an arbitrary
  point over the abstract value law) — already curve-agnostic; per-candidate residual obligation:
  "wings are exact power-laws with exponent γ(w,τ)" as the carried hypothesis FIELD.
- **FW-10 (funding functional template):** structure with fields F1–F6 (zero-iff-unskewed,
  reflection-odd, rebase-equivariant, per-ray, anchor-exists, continuous); per-candidate
  instantiation discharges the fields.
- **FW-11 (rebase equivariance of the warp):** the trade flow commutes with rebase
  (rebase_r ∘ trade = trade ∘ rebase_r with P → P/r, θ → θ/r) — PH-6 lifted to warp dynamics.
- **FW-12 (intrinsic floor template):** ∀ state ∈ W_reach, ∀ strike: mark ≥ intrinsic — carried
  reachable-set hypothesis as a FIELD (B1-style; never discharged by geometry).
- **FW-13 (path-independence template):** the family's update field admits stated first
  integrals; finite trades are partition-independent (semigroup property).

## 13. Numeric gate index (consolidated)

NG-1 micro-integrator vs closed form + first-integral drift + round-trip · NG-2 elasticity-at-mark
+ transport-residual scaling + violation-rate law · NG-3 γ τ-invariance + state-count audit ·
NG-4 mode robustness across heights + unit-slope-root uniqueness · NG-5 funding F1–F6 numerics ·
NG-6 re-mark sweep (extrinsic floats, intrinsic byte-invariant) · NG-7 reachable-set solvency
sweep (sup liability/reserve) · NG-8 adversarial floor/round-trip/frontier harness · NG-9 engine
harness re-reference (mp-vs-slope, dir_gate, seam, G4, rebase, dollar-pipe) · NG-10 conjugacy
test for the composition map.

## 14. Feature-inventory disposition (all 16, per `docs/feature_inventory.md`)

| # | Feature | Disposition |
|---|---------|-------------|
| 1 | Balancer base | **Considered.** The paper Trade Formula = the warp principle's verified Balancer instance (AC-1, re-derived [NUM]); plain CD is the degenerate ε≡1 member; the budget's base family. |
| 2 | Curve warp | **Considered (the subject).** AC-1 states the principle curve-agnostically; AC-2 characterizes joint warp+mode; the (W) closed-form first integral cited; kernel-in-SCORE ≠ kernel-in-WEIGHT honored (no GH↔(W) identity used). |
| 3 | Kurtosis knob τ | **Considered.** AC-3: one static knob, vol-set, trade-static [RULED]; τ-invariant wing exponents required (asymptote preservation); β=1 moment-coupling caveat carried; "kurtosis of the LDF" residue stated (AC-4). |
| 4 | Carry P, u | **Considered.** Gauge layer of the spine; AC-9 fixes the gauge coordinate; AC-2/AC-4 are stated in carry units (mode ray = 45°, unit-slope ⟺ log carry-price 0). |
| 5 | Rebase | **Considered.** AC-9.4 (P→P/r, θ→θ/r, shape-preserving, J/R preserved — PH-6 lift FW-11); anchor-curve rebase rule flagged [OPEN] (AC-5 F3). |
| 6 | value ∝ S^(−γ) | **Considered.** AC-3: γ = γ(w,τ) derived, range lock honored; FW-9: power-law wings ⇒ entire settlement layer forced (T1a lift); G4 stays the accuracy gate per candidate (NG-9). |
| 7 | ITM smooth-pasting | **Considered.** Settlement layer lifts via T1a [TFP]; NEW propagation fact: live w ⇒ live S* (AC-6) with trigger honesty (AC-8 X3); seam gate in NG-9. Settlement semantics changes stay operator-tier. |
| 8 | Strike registration θ=sNorm(K) | **Considered.** AC-9 convention: registration in the family's carry coordinate with crossover@K ∀γ (v26c lesson [ENGINE]); dir_gate re-referenced per candidate. |
| 9 | Funding w=½ anchor | **Considered.** AC-5 generalizes the locked rule (anchor = unskewed member at SAME τ, per-ray); functional candidates (a)–(d) listed, constraints F1–F6 characterized, NOTHING decided. |
| 10 | Slippage / mpGeom | **Considered.** AC-9: % basis-independence required (Jacobian cancels); $ = Layer-1 reserve-USD unchanged; mixed-basis control permanent. |
| 11 | Dollar pipe | **Considered.** AC-9: unchanged; new-dollar-path = HARD STOP escalation. |
| 12 | THE gotcha (price ≠ slope) | **Considered — promoted to API.** AC-9.1: every candidate must publish (π, J) explicitly; AC-4: the gotcha factor measured as GH's mode displacement (1/748.62 at γ=3). |
| 13 | Solvency boundary | **Considered.** AC-7: reachable-set boundedness + coverage sweep as the contract; B1 stays the extrinsic operator ship-gate; PH-4b necessity-not-sufficiency restated; nothing here closes solvency. |
| 14 | Esscher / latent group | **Considered.** Fixed-curve "trade = latent translation" does NOT lift to warp dynamics; the J-leg's conserved object is per-family (α,β-analogues, AC-10c); no X·Y-style invariant language used for GH. |
| 15 | File-safety gate | **N-A** (notes-only pass; no engine edit). Any candidate build lands under the gate + splice recipe unchanged. |
| 16 | Warp-with-trades | **Considered — the framework's core.** AC-1 = the canonical principle [RULED, entry 7]; paper Trade Formula = its verified Balancer instance [NUM]; AC-2 pins the acceptance test (mode-at-mark) and its joint cost — at-the-mark trades only, off-mark uncharacterized (corrigendum 2, §16); AC-10 holds the open composition map; UNIMPLEMENTED status unchanged; build sequenced after the engine-faithfulness pivot. |

## 15. Flags and escalations (for the manager to relay)

1. **OPERATOR (default-shaping, §AC-2.5):** joint warp+mode is satisfiable ONLY on the
   frozen-germ class (ε′(mark) = −½): natural √-sigmoid re-anchoring fails except at the
   sign-locked skew Δw = −τ/4, and symmetric genesis is excluded under any regular warp. Pick:
   (a) frozen-germ class / tilted genesis, (b) approximate mode-at-mark, or (c) selector-only.
   One extra sentence wanted on the transport reading (pre-trade point [paper, canonical] vs new
   reserves — the joint condition is −½ vs 0 respectively).
2. **OPERATOR (standing):** funding functional choice (AC-5 a–d) and the composition map /
   item-16 build design (AC-10) remain operator-tier; nothing decided here.
3. **Skeptic hooks:** opens (a)–(d) dispositioned at AC-10/AC-2/AC-1; anchor-existence column =
   AC-5 F5; reachable-set #13 = AC-7; cost-to-warp = AC-8; every number above restated with its
   formula; no claim that any candidate passes all contracts; no GH↔(W) identity used anywhere.
4. **Not in this pass (by spec):** the comparison TABLE (deliverable B); any Aristotle
   submission (FW-x are statements); any engine edit; any curve decision.

## 16. Corrigenda (dated; manager-applied per skeptic verdict #8, `notes/skeptic/VERDICT_FRAMEWORK_2026-06-11.md`, 2026-06-11)

1. **Germ-residual scaling label** (AC-2 existence paragraph): digits fall 1000×/decade = cubic
   per step, not the claimed du²; measurand reconstructed by the skeptic as R = h³/6 + h⁴/6
   (h=Δy/y), reproducing all three printed digits to six figures. Integral-limit conclusion
   unaffected (the skeptic's stricter slide-destination convention gives clean O(h²)).
2. **Scope qualifier on the AC-2 iff** (§0, AC-2, AC-2.5, inventory row 16): characterization
   derived for trades AT the mark; off-mark trades (strike∩curve ≠ mark — the paper's product
   primitive, L41–43) UNCHARACTERIZED — necessity (ε′=−½, symmetric-genesis exclusion) survives;
   sufficiency/existence off-mark = OPEN. The manager's commit message 212d3e0 and same-day
   operator relay carried the unqualified iff — corrected in the next relay, owned.
3. **AC-2.5 menu completeness**: option (d) singular/corner warps added — evades regular-class
   necessity; neither constructed nor closed here; choosing it commissions that analysis first.
4. Manager-audit slips (skeptic): the skeptic's Balancer α,β check was its run-5 (not run-6 as
   the audit brief said); the note scopes "α,β-conservation IS slope-transport" to the Balancer
   foliation (the brief over-read it as general). This skeptic verdict is #8 by its ledger.

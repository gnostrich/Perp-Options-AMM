# LDF definition + the mode = unit-tangent-slope conjecture — formalization and check

_research-lead, 2026-06-11. Brainstorm check (operator-invited), NOT the framework build. No
Aristotle submits, no engine edits, no git. Source rulings: operator transcript
`history/operator/2026-06-11_curve-agnostic-framework-brainstorm.md` entries 3–4. All numerics:
mpmath dps=30 (scripts `/tmp/ldf_check.py`, `/tmp/ldf_gh.py`, ephemeral; every quoted number is
reproduced in this note). Labels: **[DERIVED]** = algebra, **[NUM]** = numerically checked at
25+ digits, **[OPEN]** = honestly open / conjecture._

## Plain-English summary (operator-readable)

Your definition works, and your conjecture is **exactly right for the warp family and exactly
wrong for the two things it should exclude** — which is the best possible outcome: it functions
as an admission test, not just a description.

1. **The LDF as "thickness from the closest axis" is well-defined** and gives even plain
   Balancer a genuine mode: on `xy=k` the thickness is exactly `√k·e^(−|ũ|/2)` (a symmetric tent
   peaking at the 45° ray, vanishing at both fan edges). ũ = ln(y/x).
2. **The conjecture (mode = the point with unit tangent slope) is EXACTLY TRUE, at every skew
   and every kurtosis τ inside the AMM-validity gate, for the warp family anchored at w=½** —
   the mode, the unit-slope point, and the w=½ crossing are all the same point, to 30 digits,
   and this does not depend on which reasonable "thickness" measure you pick. (Outside the
   validity gate — e.g. Δw=−0.3, τ=0.08 — a second unit-slope root appears and "the" point is
   ill-posed; §2. Validity and well-posedness are the same gate.) _[clause added by dated
   corrigendum, see §8]_
3. It is **FALSE for skew done by a constant weight** (Balancer with w≠½): no point of that
   curve has its tangent parallel to its own ray, so no choice of units can ever make the mode
   and the unit-slope point meet. Constant-weight skew is **inadmissible** under your conjecture.
   The conjecture itself rules it out and selects the warp — independent confirmation of the
   warp-not-reweight design.
4. It is **FALSE for today's live GH engine**: the pool mark is calibrated to sit at v=3, while
   every candidate mode sits near v≈0.13–0.25; the mismatch factor at the mark is exactly the
   famous price-vs-slope factor (748.6 at γ=3, 44.5 at γ=2). One more face of "GH is not the
   warp family."
5. What the conjecture **pins down**: the gauge (axes scaled so the mode ray is the 45°
   diagonal — the carry gauge, same convention as the fan picture) and the skew mechanism (the
   warp must keep its w=½ crossing at the pool point). What it deliberately does **not** pin:
   the exact thickness formula — all symmetric choices agree on the MODE but differ on the
   LDF's higher shape (so "kurtosis of the LDF" still needs one definition choice later).
6. The pool-mark leg ("mode sits at the pool mark after every trade") is exactly the property
   the unbuilt warp-with-trades mechanic (inventory #16) must deliver — stated below as a
   precise, checkable contract for that build. Not checked here (that build is sequenced after
   the pivot).

---

## 1. Formalizing the LDF (entry 4, item 1)

Operator: _"LDF = the thickness of the curve measured perpendicular from the closest axis (or in
180 degree case, just height)"._

**Height, not density.** "Thickness" is a height function evaluated at points of the curve, not
a mass density over the fan angle. This matters: the argmax (mode) of a height is invariant
under reparameterizing the horizontal axis (ψ vs σ vs ũ — same mode point on the curve), whereas
a density's mode would move with the Jacobian (the fan Jacobian 2·cosh ũ is huge in the wings).
We take the operator's word: LDF = height ⇒ the mode is a well-defined point ON THE CURVE,
coordinate-free. **[DERIVED]**

Candidate formalizations, for a point (x,y) on the curve in the 90° quadrant:

- **H1 (verbatim 90° reading):** perpendicular distance to the x-axis is y, to the y-axis is x;
  closest-axis thickness = **min(x,y)**. Kinked at the diagonal.
- **H2 (180° reading, radius-preserving unfold):** open the fan by the forced doubling σ=2χ
  (Gudermannian bridge, `curves/gh/GUDERMANNIAN_BRIDGE_2026-06-10.md` §1) keeping the radius;
  "just height" above the now-single axis = r·sin 2ψ = **2xy/√(x²+y²)**. Smooth; ≈ 2·min(x,y)
  near the edges (ratio between √2 and 2). **[DERIVED]**
- **H3 (conformal unfold z↦z²):** the literal squaring map takes the quadrant onto the upper
  half-plane (90°→180°); height = Im(z²) = **2xy**. Its critical point along any curve is
  exactly the tangent-parallel-to-ray point (d(xy)=0 ⟺ dy/dx = −y/x), but the radial
  inflation |z|→|z|² can turn that into a *minimum* (it does for warp-skew Δw>0, where
  xy = e^{2c}·e^{Δw·√(τ²+ũ²)} along the curve — minimized at the anchor). So H3 is the
  cleanest *condition-generator* but not an honest thickness. **[DERIVED]**

**Unit-dependence (load-bearing honesty):** x is in asset units, y in numeraire units —
"min(x,y)" requires a choice of axis scales, and rescaling y→λy moves the diagonal and hence
H1's mode. The same is true of "unit tangent slope" (slope rescales by λ). The conjecture must
therefore be read in a **gauge**: it turns out (§3) the conjecture itself forces the gauge.

**Plain Balancer gets a genuine mode (check requested):** on xy=k, with x=√k·e^(−ũ/2),
y=√k·e^(ũ/2): min(x,y) = **√k·e^(−|ũ|/2)** exactly (table checked at ũ=0,.5,1,2,4 — agreement to
30 digits). **[NUM]** A symmetric Laplace tent in ũ; in the fan coordinate it vanishes like
ε^{1/2} at both edges. Two notes: (i) genuine unimodal mode at the 45° ray, even though plain CD
is the "no-knob" base; (ii) **object clash, flag for U1**: the latent-kernel object maps plain
Balancer to the GAUSSIAN corner (A→∞), while this thickness-LDF gives it a LAPLACE-shaped
profile. The mode is robust across objects; the *shape/kurtosis* of the LDF is yet another
object than Object-L/Object-P — any future "kurtosis of the LDF" label must name its height
function. **[DERIVED+NUM]**

## 2. The conjecture check (entry 4, item 3): mode =? unit-tangent-slope point

Conjecture: _"at every skew, spot/'pool mark' corresponds to mode, which is always the point on
the curve in 90-degree context with unit tangent slope."_ Checked on four curves.

**Lemma A [DERIVED]:** on any strictly decreasing curve, argmax min(x,y) = the diagonal crossing
x=y (min = x on one side, rising; = y on the other, falling; max at the kink) — regardless of
slope there.
**Lemma B [DERIVED]:** for any smooth x↔y-symmetric height h (H2, and H1 away from the kink),
h_x=h_y on the diagonal, so a diagonal point is a critical point of h along the curve iff the
tangent slope there is exactly −1.
**Lemma C [DERIVED]:** "tangent slope = −1 at a diagonal point" is the gauge-covariant condition
**tangent ∥ ray** (elasticity d ln y/d ln x = −1, equivalently a critical point of x·y,
equivalently: the tangent segment between the two axes is bisected by the point of tangency).
Elasticity is invariant under separate axis rescalings — this is the unit-free content of
"unit tangent slope at the mode."

### Results (decisive numbers)

| curve | min-mode | unit-slope point | verdict |
|---|---|---|---|
| plain Balancer w=½ | y/x = 1 | y/x = 1 (every point has elasticity −1 — degenerate) | **TRUE** (trivially; gauge centers the mode) |
| weighted CD w=0.4 | y/x = 1.000000 | y/x = 1.500000 (H2-mode: 0.816497 — a third point) | **FALSE in every gauge** |
| weighted CD w=0.3 | y/x = 1.000000 | y/x = 2.333333 (H2-mode: 0.654654) | **FALSE in every gauge** |
| (W) warp, w_mid=½, Δw=+0.2, τ=0.3 | ũ = 3.7e−31 | ũ = −1.3e−39 (H2-mode: 5.6e−16); slope at mode = −1.0 (30 dps) | **TRUE, exactly** |
| (W) warp, w_mid=½, Δw=−0.2, τ=0.5 | ũ = 2.5e−31 | ũ = 1.6e−37 (H2-mode: 5.1e−16) | **TRUE, exactly** |
| (W) warp, anchor broken: w_mid=0.45, Δw=0.2, τ=0.3 | ũ = 0 (slope −0.8182) | ũ = 0.08776 (H2-mode: −0.22290) | **FALSE** |
| live GH, γ=3 engine pin (α=4, β=1, δ=0.08) | v* = 0.15127 (intrinsic gauge) | ln M = 0.23768 (intrinsic); gauge-invariant elasticity−1 point v_e = 0.13251 | **FALSE — pool mark v₀=3** |

All (W) rows computed from the closed-form first integral
`x^{w_mid}·y^{1−w_mid}·e^{−(Δw/2)√(τ²+ũ²)} = k` (slope law re-confirmed by finite difference:
−1.9802807416 both ways at a test point). **[NUM]**

**Why the warp family passes [DERIVED]:** the local weight w(ũ) = w_mid + (Δw/2)·ũ/√(τ²+ũ²)
satisfies w(0)=½ exactly when w_mid=½, so the curve crosses the diagonal with tangent slope
−(w/(1−w))·(y/x) = −1·1 = −1 at every (Δw, τ). By Lemmas A+B every symmetric thickness puts its
mode there. **The coincidence [mode]=[unit slope] is the anchor property w(0)=½, preserved
under skew because skew lives in Δw, not in the anchor.** Two corollaries, both checked:
- The unit-slope condition is `ln(w/(1−w)) + ũ = 0` = **log price = 0 in carry units** (the
  heterogeneous-weight q-identity). So the AMM-validity gate (price strictly monotone,
  w′ > −w(1−w)) ⟺ the unit-slope point is UNIQUE. Counter-test: (w_mid=½, Δw=−0.3, τ=0.08) has
  w′(0)=−1.875 < −0.25 ⇒ invalid, and a spurious second unit-slope root duly appears at
  ũ=0.6135. **[NUM]** Validity and well-posedness of the conjecture are the same gate.
- Side observation: the min-LDF wing decay rates of the anchored warp are 1−w₊ = (1−Δw)/2 on
  the call side and w₋ = (1−Δw)/2 on the put side — **equal**. Warp-skew shows up in the LDF's
  body asymmetry, not its wing rates (the VALUE wing exponents γ_± = w_±/(1−w_±) stay
  asymmetric — different object, consistent with the standing object-honesty findings). **[DERIVED]**

**Why constant-weight skew fails in every gauge [DERIVED+NUM]:** weighted CD has elasticity
≡ −w/(1−w) at EVERY point — for w≠½ no tangent-parallel-to-ray point exists at all, so no axis
rescaling can ever co-locate mode and unit slope (Lemma C). The conjecture, required "at every
skew," **excludes reweighting as the skew mechanism and admits only the anchored warp.**

**Live GH (γ=3 pin, curve X=Nx·T_β(v), Y=Ny·M·F_{β+1}(v), M = 1.268303998 — matches the engine
reference 1.268303997):** in the curve's own bounded normalization the diagonal crossing
(T=F_{β+1}) sits at v*=0.15127, the unit-slope point at v=ln M=0.23768, and the gauge-invariant
elasticity−1 point at v_e=0.13251 — but **calibration pins the pool mark at v₀=3**. Elasticity
at the mark = 0.0013358 = 1/748.62 = **e^(−ghMu) exactly** (live calibration has Y0/X0 = mp0, so
slope/ray at the mark = mp0·e^(−μ)/mp0); at γ=2: 0.022461 = 1/44.52. **THE gotcha factor
(price coordinate ≠ slope) is precisely the factor by which the live pool mark fails the
mode-at-mark property.** No single axis rescale can repair it: forcing unit slope at the mark
(λ = M·e^(−3) = 0.063145) leaves the diagonal condition off by ~750× (T(3)=8.42e-5 vs needed
0.0630). Price distance from the mark to the candidate mode: e^(3−v_e) = **17.6×**. **[NUM]**
This is a fourth, independent face of the skeptic-verified "GH is not the warp family at any τ."

## 3. What the conjecture pins down (the selector result)

Required at every skew, [mode of LDF] = [unit tangent slope] = [pool mark] **does** act as an
admission contract, and it pins three things — in order of strength:

1. **The skew mechanism (strongest):** only curves possessing a tangent-parallel-to-ray point
   can comply (Lemma C). Constant-weight skew has none — excluded outright. The anchored warp
   (w_mid=½, skew=Δw, kurtosis=τ) complies exactly at every setting; breaking the anchor
   (w_mid≠½) breaks it. **The conjecture = anchor-preservation under skew.** [DERIVED+NUM]
2. **The gauge/unfolding center:** the axes must be scaled so the compliant point lies on the
   45° diagonal (then "unit tangent slope" holds literally). That is the carry gauge — the same
   normalization under which the Gudermannian fan puts ATM at 45°. The conjecture forces it;
   no other centering works. [DERIVED]
3. **The height function — only up to symmetry (the honest limit):** every x↔y-symmetric
   thickness (min(x,y), the unfolded height 2xy/r, …) places its mode at the SAME anchored
   point, so the conjecture cannot distinguish them — the mode is definition-robust, the LDF's
   higher shape is not. No natural coordinate is excluded and none is uniquely selected; the
   residual choice re-raises U1 only at the level of "kurtosis OF the LDF," not its mode.
   [DERIVED, with the H3 minimum-not-maximum caveat of §1]

**The pool-mark leg = the item-16 contract [OPEN]:** the two-way identity above is a theorem
about the curve; "…= pool mark" is a requirement on the TRADE mechanic: after every
warp-trade (paper Trade Formula, α=x·w and β=y·(1−w) conserved, w=α/x), the post-trade curve
must cross the post-trade reserves point with tangent ∥ ray — equivalently, the warp must
re-anchor so the live point is its w=½ crossing in carry units. Whether the paper's Trade
Formula composed with the τ-profile satisfies this is exactly the UNDECIDED design question of
inventory #16 (build sequenced after the engine-faithfulness pivot) — **not checked here, and
it is the first thing the framework build should check.** Today's engine (fixed curve, moving
point, mark pinned at v=3) does not satisfy it (§2).

## 4. What the entry-3 funding pin settles / leaves open (task 3)

**Settled for the framework skeleton:** the funding anchor is now a CURVE, not a number — the
**unskewed member of the same family at the same kurtosis τ** (so τ is common-mode and funding
measures pure skew); the pool curve is the skewed member; funding = a **geometric comparison
between the two curves**, evaluated per strike ray ("baked into how the curve is pricing each
strike ray already"). This is a clean generalization of the locked engine rule (funding =
slope-deviation ratio vs the w=½ anchor at the strike ray): the anchor's w=½ stays, but the
anchor object inherits the pool's τ instead of being bare Balancer — funding therefore prices
skew only, never the kurtosis knob, by construction. It also composes with §3: the anchor curve
is exactly the Δw=0 member whose mode/unit-slope point the warp must preserve. **Left open
(candidates, not decided):** WHICH geometric functional — (a) slope-deviation ratio at the
strike ray (the current engine's functional, the minimal continuation); (b) level/value gap
between the curves along the ray; (c) area/angular measure between the curves near the ray;
(d) latent-score gap. Also open: sign/normalization convention, and how the anchor curve
rebases (presumably θ→θ/r with the pool — unproven). Operator's "anything else?": yes — the
re-marking ruling ("pool depth not impacted, easier") should eventually get a solvency line
item, since re-pricing open extrinsic value without touching depth moves the B1 exposure
report, not the floor itself. [FRAMING]

## 5. The bounced γ question, re-posed in one sentence (task 4)

> **When we open a pool, should the wing steepness (how fast deep-out-of-the-money options get
> cheap, today the number γ) stay its own setup dial next to τ — or should the pool compute it
> automatically from w so there's one less number to set?**

## 6. Feature-inventory disposition (all 16, per `docs/feature_inventory.md`)

| # | Feature | Disposition |
|---|---------|-------------|
| 1 | Balancer base | **Considered.** Gets a genuine LDF mode (√k·e^(−|ũ|/2) tent); the degenerate every-point-elasticity−1 member; conjecture trivially true there. |
| 2 | Curve warp | **Considered (the subject).** The conjecture SELECTS the anchored warp and excludes constant-weight skew; GH fails it (one more non-membership face, consistent with the skeptic verdict). |
| 3 | Kurtosis knob τ | **Considered.** Conjecture holds at every τ for the anchored warp; τ does not move the mode. "Kurtosis of the LDF" = a new object — height-choice-dependent, flagged to U1, no label proposed. |
| 4 | Carry P, u | **Considered.** The conjecture FORCES the carry gauge (§3.2): mode ray = 45° diagonal = price-1-in-carry-units; the unit-slope condition is literally log-carry-price = 0. |
| 5 | Rebase | **Considered (lightly).** Anchor-preservation is rebase-shaped (both re-center the diagonal); anchor-curve rebase rule flagged OPEN in §4. No new rebase math. |
| 6 | value ∝ S^(−γ) | **Considered.** Untouched; noted that warp-skew leaves min-LDF wing RATES symmetric while value wing exponents γ_± stay asymmetric — different objects, both stated. |
| 7 | ITM smooth-pasting | **N-A** (no settlement object touched; entry-3 ruling 1 — exercise on the live warped curve — recorded but not analyzed here). |
| 8 | Strike registration | **N-A** (no mark/strike change proposed; any future warp build re-runs dir_gate). |
| 9 | Funding w=½ anchor | **Considered (§4).** Entry-3 pin = generalization of the locked rule (anchor inherits τ, keeps w=½); functional choice left open, candidates listed, nothing decided. |
| 10 | Slippage / mpGeom | **Considered.** THE price≠slope factor e^ghMu shows up as the exact mode-displacement factor at the live mark (748.62/44.52 reproduced). No slippage change. |
| 11 | Dollar pipe | **N-A** (notes-only). |
| 12 | THE gotcha | **Considered — promoted.** Elasticity at the live mark = e^(−ghMu) exactly: the gotcha factor is the measured violation of mode-at-mark on GH. |
| 13 | Solvency | **Considered (§4 end).** Entry-3 ruling 3 (depth untouched) flagged as needing a B1 exposure line; nothing here closes or moves solvency. |
| 14 | Esscher / latent group | **Considered (implicitly).** GH analysis done via T, F_{β+1}, M (tilt machinery); no X·Y-invariant language used for GH — the elasticity−1 point is a POINT (argmax of X·Y along the curve), not a conserved product. |
| 15 | File-safety gate | **N-A** (no engine edit). |
| 16 | Warp-with-trades | **Considered — made precise, not resolved.** §3 states the exact contract the Trade Formula build must satisfy (post-trade curve crosses the post-trade point with tangent ∥ ray / local w=½ in carry units). UNIMPLEMENTED status unchanged; composition with the τ-profile remains the operator-tier design question. |

## 7. Flags

1. **For the operator (via manager):** the conjecture is confirmed as the anchored-warp
   admission contract (§2–3); its pool-mark leg is the design requirement on the item-16 trade
   mechanic — recommend it be adopted as an explicit acceptance test for that build. The
   re-posed γ question is §5.
2. **U1 residue:** mode is now pinned; the LDF's shape/kurtosis is still height-choice-dependent
   (min vs unfolded height differ away from the mode), and the thickness-LDF assigns plain
   Balancer a Laplace tent while the latent-kernel object assigns it Gaussian — one definition
   sentence will eventually be needed if "kurtosis of the LDF" becomes the shipped knob meaning.
3. **Skeptic hooks:** every number above is reproducible from the two scripts' formulas (all
   restated inline); the only non-derived claims are labelled [OPEN]/[FRAMING]; no claim of GH
   membership, no claim that the Trade Formula satisfies the contract, no solvency claim.

## 8. Corrigenda (dated; manager-applied per skeptic audit verdict #5, 2026-06-11)

1. **Summary item 2** — added the AMM-validity qualifier the body (§2) proves (skeptic
   FLAG-OVERSELL: the operator-readable sentence must be true standalone; outside the validity
   gate the unit-slope point is non-unique).
2. **"1/748.66" → "1/748.62"** (§2 and §6 row 10) — transcription slip (skeptic FLAG-WRONG: the
   note's own 0.0013358 = 1/748.615; skeptic mpmath 748.6219; live engine 748.61966 — note math
   and engine AGREE). Manager's earlier "rounding/pool-constants" explanation was an invented
   attribution, owned as such; the identity claim "elasticity at mark = e^(−ghMu) exactly" stands.
3. **§5 is now ANSWERED** — operator transcript entry 5 (2026-06-11, after this note's run
   launched): "no separate knob for wing sttpness etc. its x y w determing skew, and single
   kurtosis / steepness knob thats it" — γ is computed from (x,y,w,τ), never a fifth setup dial.
4. **Carry-forward tension recorded (skeptic, for the FRAMEWORK note — not a defect of this
   one):** the budget's live "w determining skew" cannot be the local weight at the mark (this
   note's item-16 contract pins local w≡½ there post-trade) — it must map to Δw; the
   w=α/x ↔ Δw map is unstated and lives inside the item-16 OPEN. The framework note also still
   owes: anchor-existence column, #13 reachable-set, cost-to-warp column.

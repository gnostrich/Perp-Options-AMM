# SKEPTIC BRIEF — kurtosis curve-family target (operator, 2026-06-10)

_Authored by the **skeptic** in my own space (CLAUDE.md §2.4 mode (a): the operator brief below is
reproduced VERBATIM and attributed; everything outside the delimited block is my own labelled
synthesis, not the operator's words). Read-only research-target note — it proposes NO engine edit
and authorizes NO rebuild. The manager commits/pushes it; I leave no untracked churn._

**Provenance of the verbatim block:** `history/operator/2026-06-10_kurtosis-curve-family-brief.md`,
Entry 1 (verified against that file this pass — the manager's relay matches the transcript
word-for-word; no FLAG-PROCESS on the channel). The transcript's trailing line 21 ("Want me to
persist that brief…") is the skeptic's own relayed offer, NOT operator text, and is correctly
excluded from the verbatim block below.

---

## 1. The operator's brief — VERBATIM (operator, 2026-06-10, transcript entry 1)

> TARGET: a closed-form one-parameter curve family that replaces plain Balancer, where the parameter is a kurtosis knob.
>
> Geometry (the spec): in log-coordinates the curve is a straight line (= Balancer). The knob bows the middle (rounds the ATM elbow). The two ends keep their straight slope no matter the knob (wings = exact power-laws, knob-independent). One number, static, set once for vol.
>
> Acceptance (your signed test, orthogonality relaxed): one number → turn it → elbow visibly rounds → wings don't move → static → options read off as perpetual-American → trades warp the curve, not a dot sliding.
>
> Yardstick (existence, not mandate): a closed form satisfying "bow the middle + freeze the wings" demonstrably exists — so reject any "can't be done" and any wing-bender. They're free to find a cleaner or non-trig one.
>
> Constraints: "everything else stays the same" — carry, value∝S^(−γ), smooth-pasting, funding, the dollar pipe are contracts the new curve must still satisfy (re-derive, don't assume). Plug into the research scaffold + paper + v24 HTML, replacing plain Balancer. Prove closed-form settlement survives on the new curve before committing the rebuild.
>
> Standing flags: trig (Gudermannian/tanh/cosh) is team-introduced encoding — it must earn its place by hitting the geometry above, not get adopted because it's elegant.

---

## 2. Skeptic synthesis (my voice — NOT the operator's)

### 2.1 The existence yardstick is ALREADY SATISFIED in-repo — and exactly what that does/doesn't establish

The operator's yardstick ("a closed form satisfying 'bow the middle + freeze the wings' demonstrably
exists — reject any 'can't be done'") is **already met by an artifact in this repo.** It is my own
closed-form invariant from VERDICT_KURTOSIS_KNOB_2026-06-10.md §1:

    F(x,y) = x^{w_mid} · y^{1−w_mid} · exp( −(Δw/2)·√( τ² + ln²(y/x) ) ) = k

This curve bows the middle and freezes the wings: the wings are **exact CD (Cobb–Douglas) monomials**
(power-laws, knob-independent — the √-kernel degenerates to an absorbable constant far from center),
the middle rounds with τ, and Balancer is recovered exactly (Δw=0 → pure Cobb–Douglas; τ→∞ → CD
limit). I verified F constant along its own frontier to **5.6e-16** (machine precision); the manager
independently re-verified curve constancy by RK4 (constancy ~**4.8e-13**). The √-kernel form is the
elementary integral of the (W) weight ODE, so this is an outright algebraic level set, not an
asymptotic relaxation.

**What this DOES establish (and ONLY this):** a closed-form curve meeting the operator's *geometry*
spec — straight-line-in-log Balancer base, τ rounds the ATM elbow, wings stay exact power-laws,
knob-independent — **provably exists.** Therefore every "it can't be done / you must bend the wings /
you need trig to do it" claim is, on this evidence, **false on arrival** — the operator is right to
reject them. The √-kernel form is also **already non-trig**, so the existence proof does not depend
on Gudermannian/tanh/cosh at all.

**What this does NOT establish (do not let it be oversold into more):**
- It does **NOT** establish that the brief's *contracts* (carry, value∝S^(−γ), smooth-pasting,
  funding, the dollar pipe) survive **on this curve.** Geometry-exists ≠ contracts-survive. The
  operator's own instruction — "re-derive, don't assume … prove closed-form settlement survives on
  the new curve before committing the rebuild" — is the exact gate, and it is the correct gate.
- It does **NOT** identify this (W) curve with the **live GH engine.** Per CLAUDE.md §0 and inventory
  item 2 (skeptic, manager-verified), the "GH = one (W) setting, τ≡δ EXACTLY" identity is **BROKEN**:
  GH puts the kernel in the latent SCORE, (W) puts it in the WEIGHT — different curves. So "existence
  in repo" is existence of a *candidate target family*, not a statement that today's engine is that
  family.
- It does **NOT** discharge the warp-with-trades requirement (inventory #16): the (W) level set is a
  fixed curve like every other current design; the operator's "trades warp the curve, not a dot
  sliding" acceptance clause is unbuilt and undispositioned by this curve. (Code-verified standing
  fact: HEAD `tradeUpdate` moves a point on a fixed curve.)

### 2.2 Disposition of feature_inventory #1–#16 against the brief's acceptance test

For each item: how the brief's acceptance test ("one number → turn it → elbow rounds → wings don't
move → static → perpetual-American → trades warp the curve") would touch it, and the honest status
**for the candidate (W) family** the existence proof delivers. Key honesty distinction: the brief's
constraints are **ASSERTED-by-carry from the GH/REPARAM work, NOT established for (W)** — my VERDICT §4
found the Esscher slope-law (d log slope/du = 1) demonstrably FAILS mid-curve for (W), and #8/#9/#13
were never dispositioned for it.

| # | Feature | Disposition vs the brief's test |
|---|---------|----------------------------------|
| 1 | Balancer base | **Considered / Changed-by-replacement.** Brief explicitly replaces "plain Balancer"; (W) keeps Balancer as the exact δ-limit/Δw=0 member, so base is preserved as a family member, not discarded. Satisfied. |
| 2 | The curve warp (position-dependent weight) | **Considered (the deliverable itself).** (W) is a weight-profile warp. ⚠ NOT identical to the GH-engine warp (kernel-in-SCORE ≠ kernel-in-WEIGHT, BROKEN identity stands). |
| 3 | Kurtosis knob τ | **Considered.** This is the brief's "one number." Brief defines it as static, vol-set, elbow-rounding (matches operator ruling entry 14 #3). ⚠ "which kurtosis" remains a flag (see 2.3-i). |
| 4 | Carry P=Ny/Nx, u=log p − log P | **OPEN — not yet shown for (W).** VERDICT §4: the note's u is ln(Y/X) recentered, and dq/du ≠ 1 on (W) — the carry/rebase coordinate story for (W) is UNWORKED. Brief's "re-derive, don't assume" governs. |
| 5 | Rebase (P→P/r, θ→θ/r, anchor w=½) | **OPEN — not yet shown for (W).** Depends on #4; rebase covariance was proven in sNorm for GH, never re-derived on (W). |
| 6 | Pricing law value∝S^(−γ) | **OPEN — not yet shown for (W).** ASSERTED-by-carry from REPARAM (GH δ-unfreeze); NOT established on the (W) frontier. The one accuracy gate (G4) must be re-run on the new curve. |
| 7 | ITM American smooth-pasting | **OPEN — not yet shown for (W).** Brief makes this explicit: "Prove closed-form settlement survives on the new curve before committing the rebuild." S*=Kγ/(γ+1) + seam C¹ must be re-derived, not inherited. |
| 8 | Uniform strike registration θ=sNorm(K) (v26c) | **OPEN — FLAG-OMISSION carried.** Silently absent from the kurtosis-knob deliverable (VERDICT §4); whether crossover@K survives a freed τ on (W) is undispositioned. (Also names a v26c construct — see v24/v26c discrepancy 2.3-ii.) |
| 9 | Funding = slope-deviation vs w=½ anchor | **OPEN — FLAG-OMISSION carried.** "the w=½ anchor" is genuinely ambiguous when w is itself a field on (W). Brief lists funding as a contract to re-derive; not yet done. |
| 10 | Slippage basis mpGeom | **OPEN — not yet shown for (W).** Implicit only; THE gotcha (price-coord vs slope) must be re-checked on the new marginal. |
| 11 | Dollar / settlement pipe | **OPEN — not yet shown for (W); §6 HARD-STOP guard applies.** Brief: settlement must survive. No new dollar path is authorized; reuse the existing chain. |
| 12 | THE gotcha (getMP_raw is a price coord, not the slope) | **Considered (must carry forward).** Any (W) implementation re-introduces the price/slope conflation risk; |dy/dx| = marginal·e^(−μ) must be re-verified. |
| 13 | Solvency boundary | **OPEN — FLAG-OMISSION carried.** REPARAM showed δ moves wing reserve DEPTH by ~an order of magnitude (X/Nx@m=2: 0.034→0.220); my STOCKTAKE found β=1 swings ~7× larger. A shipped τ redistributes the depth the B1 floor rides on. Undispositioned; operator ship-gate. |
| 14 | Esscher tilt / latent rapidity group | **Considered, partially.** Esscher named in the deliverable; the conserved-quantity conjecture honestly left unproven. ⚠ Esscher slope-law FAILS mid-curve on (W) (VERDICT §4) — so it does NOT transfer as the trade mechanism. |
| 15 | File-safety gate | **N-A for the research target; LIVE for any future rebuild.** This note authorizes no edit; when a rebuild is authorized, the blob/splice gate binds. |
| 16 | Warp-with-trades (operator, entries 10/14/16) | **OPEN-UNIMPLEMENTED — standing requirement.** Brief's acceptance test states it verbatim ("trades warp the curve, not a dot sliding"). (W) as a fixed level set does NOT implement it; reference spec = the paper's Trade Formula (α=x·w, β=y·(1−w) conserved, w=α/x). Sequenced after the engine-faithfulness pivot (ruling 1). Every curve note must disposition this. |

**Net:** items #1–#3, #12, #14, #16 are *engaged*; items **#4, #5, #6, #7, #8, #9, #10, #11, #13 are
OPEN-not-yet-shown for the (W) family** — they are asserted-by-carry from the GH/REPARAM lineage and
were never re-derived on the candidate curve. That re-derivation set IS the gating work the brief
demands ("re-derive, don't assume; prove settlement survives before rebuild").

### 2.3 FLAGs for the manager to escalate / the operator to resolve

**FLAG (i) — WHICH kurtosis does the operator mean? (my STOCKTAKE U1, unresolved).** The brief's
geometry reads cleanly as **elbow-rounding** (a curve-shape / local-curvature statement: "bows the
middle, rounds the ATM elbow, wings keep their straight slope"). That is NOT obviously the same object
as a **moment-statistic excess-kurtosis** of the implied density (which, at the engine pin β=1, couples
with skew — STOCKTAKE fact (a)). I record this as a flag, **not** an assumption: I am reading the
brief as elbow-rounding because that is what the words say, but the operator should confirm that
"kurtosis knob" means *curve geometry / elbow-roundness* and not *a measured 4th-moment statistic*, so
the team builds the test the operator actually wants. (Operator ruling entry 14 #3 already leans
geometry — "steepness/flatness of the curve … not a trader-measured statistic" — this flag asks to
pin it to THIS brief's wording.)

**FLAG (ii) — the brief says "v24 HTML"; HEAD is v26c.** The brief instructs "Plug into the research
scaffold + paper + v24 HTML, replacing plain Balancer." The canonical HEAD is
`engine/builds/HEAD_temporal_mvp_v26c.html` (verified on disk this pass). v24 predates the ITM
American smooth-pasting (v26b) and the uniform strike registration (v26c) — both of which are *contracts
the brief itself lists as must-survive* (#7, #8). I **flag the discrepancy and do not resolve it**: the
operator should confirm whether "v24" is shorthand for "the current HEAD," a deliberate instruction to
branch from the simpler v24 baseline, or a stale reference. This materially changes which settlement
machinery must be proven to survive.

**FLAG (iii) — "one-parameter" vs the (W) family's three DOF.** The brief says "one-parameter curve
family … the parameter is a kurtosis knob." The candidate (W) family has **three** degrees of freedom:
`w_mid` (convexity), `Δw` (skew), `τ` (kurtosis). My read — flagged, not asserted — is that the
operator's "one parameter" IS τ, with `w_mid` and `Δw` pinned by the convexity/skew and wing/contract
requirements (so the operator turns one knob, the others being calibration, not free dials). The
operator should confirm that "one-parameter" means "one *tunable* knob over a fixed-by-calibration
base," not "a literal one-DOF curve" — because a literal-one-DOF reading would *exclude* the (W) family
that satisfies the existence yardstick.

### 2.4 Standing trig flag — LIVE gate (operator's own standing flag, recorded)

The operator's standing flag is recorded as a live gate on all future curve work: **trig
(Gudermannian / tanh / cosh) is team-introduced encoding — it must EARN its place by hitting the
geometry (bow-the-middle + freeze-the-wings), not get adopted because it is elegant.** Two notes from
my side, consistent with this:
- The existence yardstick is **already met by a non-trig form** (the √-kernel invariant in 2.1), so no
  trig encoding is *needed* to satisfy "bow the middle + freeze the wings."
- My VERDICT_GUDERMANNIAN_2026-06-10 already exercised this gate: the in-cosh "d-law" failed to earn
  its place (any d with d(∞)=2 is the amplitude relabeled — no independent gear content), which is
  exactly the failure mode the operator's standing flag anticipates. Trig that hits the geometry is
  fine; trig adopted for elegance is a FLAG-OVERSELL trigger.

---

## 3. What this note is and is not

It **is**: a durable, attributed record of the operator's curve-family target; a disposition map
against the inventory; and three escalation flags. It **is not**: an authorization to edit the engine,
a claim that the contracts survive on (W), or a claim that today's GH engine is the (W) family. The
gating work named by the brief — re-derive carry/rebase/value-law/smooth-pasting/funding/dollar-pipe
on the candidate curve, and prove closed-form settlement survives, *before* any rebuild — is
**OPEN** and is the correct next research target.

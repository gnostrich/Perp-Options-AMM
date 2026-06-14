# VERDICT — R1/R2 goal-seek warp crux (item #16, lens architecture)

_skeptic · 2026-06-12 · READ-ONLY · re-derived cold on a fresh path `/tmp/sk_crux*.js` from
HEAD v28 engine source (md5 `7e1ae39b`, L1599–1687). Adjudicates the research-lead SPLIT in
`specs/SPEC_v28_goalseek_warp_BUILD_2026-06-12.md`._

## BOTTOM LINE (no hedge)

**The operator's fixed-mode goal-seek warp — "the curve actually warps at the lens-shifted
trade point" — is GENUINELY BLOCKED on plain-Balancer-plus-a-static-lens. It needs the
position-dependent weight field (the demoted (W) v27 curve). The research-lead's R1-BLOCKED
verdict is CORRECT in its conclusion. R2 is honestly NOT the warp — it is a display label, and
shipping it as "the goal-seek warp" would be a misrepresentation. Do not let that happen.**

But the research-lead's STATED REASON for R1-BLOCKED is the wrong reason, and that matters for
how the operator is told. BLOCKER-A (mode-collapse) tests the move-the-mode model the operator
DISCLAIMED (entry 118). The real, correct reason R1 is blocked is structural and simpler, and I
state it below so the operator hears the honest "needs the demoted curve," not a strawman.

---

## 1. Did R1-BLOCKED test the operator's actual model? — PARTLY NO (BLOCKER-A is a strawman)

**BLOCKER-A tests the move-the-mode model, which the operator explicitly disclaimed.** Entry 118
verbatim: *"the lens has zero effect at unit tangent slope ('mode') but only outwards from there…
without lens i'd trade OTM, but through lens would trade OTM+… same goes for the goal seek."* The
mode STAYS PUT; the lens shifts the trade outward from it. BLOCKER-A's counterexample
(1.376597 → 0.000000) is computed by *moving the live mode onto θ_K* (`w' = 1/(1+θ_K)`,
reproduced byte-exact, `/tmp/sk_crux.js` CHECK 1). That is precisely the maneuver the operator
ruled out. **So BLOCKER-A, as the headline reason, is testing the wrong model** — the same
move-the-pool-to-the-far-point construal I already flagged as a strawman in verdict #36, now
recycled as the R1 blocker. The research-lead reached the right verdict through the wrong gate.

## 2. The scalar-vs-field crux — SETTLED, and the answer cuts against buildable

There are exactly **two** ways to "hold the mode fixed" while a trade happens, because in this
engine the mode is **not a free knob** — it is `getSNorm = (1−w)/w` and `w = α/x`, so a
plain-Balancer trade *forces* the mode to move (`/tmp/sk_crux3.js`: dy=10 moves mode
0.666667 → 0.571429, it MUST). Therefore:

- **(A) Stored scalar reference `m_ref`** — freeze one number, decoupled from live w. This
  defeats BLOCKER-A: measured from a frozen `m_ref`, the far-out slope does NOT collapse on
  arrival (`/tmp/sk_crux2.js` Q1: g_loc stays 1.21/1.38/1.47 at 1.5×/2×/4×). And the steepness
  profile across ALL strikes reconstructs from just `{gamma, tau}` = **two scalars**, no
  per-strike w(u) field (Q2). So skeptic #37's flag stands re-confirmed: **the research-lead's
  "stored reference = the (W) φ field" is OVERSTATED** for the *slope-read*. φ updates every
  trade (history, per-position) = a field; `m_ref` is set once = a scalar. Scalar ≠ field.

- **BUT (A) does not give the operator R1.** R1 is "the curve **actually warps at** θ_eff." On
  plain Balancer the pool's own local exponent is a **constant power law** `γ = w/(1−w)` at every
  ray — *there is no strike-local bend in the curve to warp* (`/tmp/sk_crux3.js`). `g_loc(K)` is a
  **VIEW** the lens paints on top; `θ_eff` is a **view coordinate**. The pool swap `tradeUpdate(s,dy)`
  is strike-blind (takes only `{s, dy}`; θ_eff never enters it). So with a stored scalar you can
  RELABEL where the trade "is" and read a steeper slope there, but **the curve does not bend
  differently at θ_eff** — nothing about the executed reserve move depends on the strike. The
  bend the operator wants to "warp" has no referent in a plain-Balancer pool.

- **(B) Put the bend in the CURVE = a position-dependent field `w(u;φ)` = the demoted (W) v27
  curve.** That is the ONLY object in which the curve carries a strike-local shape that a trade
  can re-seat (the φ-recenter, verdicts #12/#14). That field also runs the 1/w′ runaway (#19/#39).

**THE DECISION, in plain English:** the operator's warp needs **one fixed reference number** only
if all he wants is *to read a steeper slope at a shifted view-point* (that's (A) — cheap,
buildable, but it is a VIEW, = R2 with a frozen anchor, NOT a curve that warps). If he wants the
**curve to actually bend at the trade point and re-seat on a trade** (R1, his literal words "warps
the curve there"), that bend must live in the curve = **the position-dependent weight field = the
demoted (W) curve.** A scalar cannot make a curve bend at a strike; only a field can. **So: your
warp is BLOCKED on this curve — it needs the demoted curve — unless you accept that "warp" means a
relabeled view, in which case it is R2.**

## 3. BLOCKER-B (basis leak) — REAL but DERIVATIVE, not the load-bearing blocker

I reproduced the spec's O5 gaps byte-exact (`/tmp/sk_crux2.js` Q3: 0.082563 / 0.035796 / 0.015091
at 1.5×/2×/4×). The gap is `m(θ_K) − m(θ_eff)` — it exists **only because you priced at one ray
and would settle at the other** (two strikes for one leg). It is a genuine arb *if* you split the
basis. But it is **not** an independent obstruction: it is just the statement that θ_eff and θ_K
are different rays. Under a single-basis fixed-reference construction (price AND settle at the same
one ray), the gap is zero trivially. So BLOCKER-B does not *add* to the no-go; it is a consequence
of trying to have θ_eff be the trade point while θ_K stays the strike. The real obstruction is §2:
plain Balancer has no curve-bend to relocate.

## 4. Is R2 honestly NOT the warp? — YES. Building R2 and calling it "the warp" = misrepresentation

R2 (`thetaEff` as a forward attribution coordinate) is **a display label.** The spec itself says
so (§1.2: `tradeUpdate`, `executeLeg`, `legPrice`, settlement all **byte-identical**; θ_eff
"display/log only", "NEVER used to size a write or to settle"). The pool curve does not warp at
the trade point; the write does not relocate; the strike does not move. **R2 is the honest bounded
VIEW the operator asked to "look through the lens at" — it is NOT inventory #16 (the curve warping
with the trade).** Presenting R2 as "the goal-seek warp" is exactly the pattern #17 /
assurance-laundering the operator named "gaslighting" at entries 120/108 — a view/label dressed as
the active mechanic. **It must not ship under that name.** If R2 ships, it ships labeled as what it
is: a forward θ_eff attribution readout, with the curve-warp (#16) still OPEN.

---

## VERDICT BLOCKS

**FLAG-OVERSELL (research-lead, R1-BLOCKER-A reason):** BLOCKER-A is sold as the reason R1 is
blocked, but it computes the mode-collapse by *moving the live mode onto θ_K* — the exact
move-the-pool maneuver the operator DISCLAIMED in entry 118 ("the mode stays put"). It is a
strawman of the operator's model (the same one I flagged in verdict #36, recycled). The verdict
R1-BLOCKED is right; the headline reason is testing the wrong model. The honest reason: plain
Balancer's local exponent is a constant power law with no strike-local bend to warp — a relabeled
view (scalar) is not a warped curve (field).

**FLAG-OVERSELL (research-lead, "R1 requires the weight field — via mode-collapse"):** the claim
"stored reference = the (W) φ field" is OVERSTATED for the slope-READ (skeptic #37, re-confirmed:
the slope profile reconstructs from 2 scalars {γ, τ}; φ is a per-trade field, m_ref is one number —
scalar ≠ field). The (W) field IS required, but for the correct reason — a curve that *bends at
the strike and re-seats on a trade* needs the bend in the curve, which only a position-dependent
w(u) supplies. Right conclusion, conflated mechanism.

**PASS (R1-BLOCKED conclusion):** attacked the buildability of R1 directly via the stored-scalar
construction (the operator's actual fixed-mode model) — it defeats BLOCKER-A and BLOCKER-B but
fails on the load-bearing point: a stored scalar yields a VIEW, not a warped curve. R1 (curve
actually warps at the trade point) is GENUINELY BLOCKED without the (W) weight field. Attack
documented, conclusion held.

**Standing demand on R2 (halt-class on the LABEL, not the build):** R2 is buildable and bounded
(I reproduced |u_eff| ≤ |u|, the gearing saturation, single-basis round-trip-zero on my path).
It may be built. It may **NOT** be relayed or shipped as "the goal-seek warp" / inventory #16.
The manager must state to the operator, in one plain sentence: **"This builds a label that shows
where the lens would shift your trade — the curve itself does not warp at that point; the
curve-warping form you signed for needs the field-based (demoted) curve and is still open."**
A relay that lets R2 read as the warp is a FLAG-PROCESS (pattern #17, the named gaslighting).

---

## What the operator must hear (decisive, plain English)

1. **Your goal-seek warp is BLOCKED on the current curve.** To make the curve *actually warp at
   the trade point* (your words), the bend has to live in the curve — that needs the
   position-dependent weight field, i.e. the demoted (W) curve. A single stored reference number
   is enough to *read* a steeper slope at a shifted point, but reading is not warping. This is a
   real curve choice (A-vs-B), operator-tier.
2. **The research-lead's "it collapses on arrival" is not your model** — that's moving the whole
   pool onto the far strike, which you explicitly ruled out. The honest blocker is simpler: a
   flat power-law curve has nothing to bend at a strike.
3. **R2 is buildable but it is a label, not the warp.** If it ships, it ships as a label, with
   #16 still open. It must not be called the goal-seek warp.

_Scripts (fresh, mine): `/tmp/sk_crux.js`, `/tmp/sk_crux2.js`, `/tmp/sk_crux3.js`. Reproduced
byte-exact: mode==1/γ (machine zero), BLOCKER-A 1.376597→0.000000, BLOCKER-B 0.082563/0.035796/
0.015091. Disagreement with the research-lead's STATED reason goes to the operator unreconciled._

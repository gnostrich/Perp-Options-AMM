# VERDICT — Geometric-premise cross-verify: v27 warp vs paper intuition vs v24 (skeptic verdict #14)

_Operator ask (entry 27, verbatim, verified against `history/operator/2026-06-10_kurtosis-curve-family-brief.md`):
"also meantime if the research guy is idle let him cross verify the geometric premise / principle
of the curve warp is correct in the version we're working on vs the paper's intuition and v24."
Run by the skeptic (research-lead busy on the entry-26 τ-sweep), transparently attributed.
Read-only. Every number below independently re-derived in `/tmp/skeptic_premise.py` (python float64)
against the LIVE engine source — I trusted neither the note's nor the engine's narration._

## HEADLINE VERDICT: **FAITHFUL.** v27's warp is the SAME geometric principle as the paper and v24, correctly generalized from a scalar weight `w` to a weight FIELD `w(u;φ)`. The premise has NOT drifted. One labeling caveat (the τ→∞ "reduction" check is a single-step identity, not a limit-convergence proof) and two genuinely-open lemmas (rebase-commute, φ-anchor) carried forward honestly. No FLAG-WRONG. No FLAG-OMISSION.

---

## The principle, in plain English (what must be the same across all three)

The paper's geometric move (line 39, verbatim): *"Rather than updating the pool's quoted prices by
moving the reserves point along a fixed curve, we obtain the same effect by changing the shape of the
Balancer curve via `w` … reshape the curve — by updating `x`, `y`, and `w` — so that the slope of that
post-trade point is brought to the pre-trade reserves point."* Concretely (paper §Conservation Law /
§Trade Formula):
1. A trade conserves `α = x·w` and `β = y·(1−w)` individually.
2. The reserves point therefore rides the **trajectory hyperbola** `(x−α)(y−β)=αβ` (the conserved locus).
3. The **pricing curve** `x^w·y^(1−w)=k` reshapes because `w = α/x` moves as `x` moves.
4. Pricing stays faithful because the two curves are **tangent** at the reserves point.

The operator's own polar-lens (entry 9, his pasted text): skew = a **pure angle shift φ**; kurtosis =
an **amplitude** held fixed. Entry 18: "generalise balancer to something with a single kurtosis knob
so it still functioned the same way geometrically."

**The faithfulness question = is v27 doing items 1–4 with the only change being `w`→a field and the new
handle φ being the angle-shift the operator named — or did the generalization silently swap the
conserved object / the warp referent / the geometric meaning?**

---

## Verification against each reference point (independent numbers)

### (a) v24 — confirmed it implements the paper's principle exactly (the baseline of trust)
- `getW = α/x` (engine L1594) = paper line 75 verbatim.
- `tradeUpdate` (L1617–1624): `Δx = −αβ·Δy/[(y−β)(y'−β)]`, `α,β` held constant = paper Trade Formula
  (line 84) verbatim, conserved object = (α,β).
- TEST 1 (`/tmp/skeptic_premise.py`): start (10,10) w=0.5; trades dy=+1/+2/−1 keep `(α,β)` exactly,
  reserves on `(x−α)(y−β)=αβ` to ≤3.6e-15, and `w` moves 0.5→0.54545/0.58333/0.44444. The rendered
  curve reshapes (verdict #13: ~9% Δy at the wing on a 10% trade). **v24 IS the paper principle.**

### (b) v27 — implements the SAME conservation law, generalized, in the live build
Live build inspected (not just the note): `wField` (L1633–1644) =
`w_mid + (Δw/2)(u−φ)/√(τ²+(u−φ)²)`, `u=ln(y/x)−φ` — the note's §2 map verbatim. `tradeUpdate`
(L1719–1742) is the note's §3 Steps 1–4 verbatim: `wEntry=wField`, `α=x·wEntry`, `β=y·(1−wEntry)`
conserved; `wStar=1−β/y'`; `x'=α/wStar`; `φ'=u'−z`, `z=t·τ/√(1−t²)`, `t=(wStar−w_mid)/(Δw/2)`; plus
the `w*∈(w_-,w_+)` wing-range guard.
- TEST 2: v27 conserves `(α,β)`; reserves on `(x−α)(y−β)=αβ` to ≤1.1e-14; **the field weight at the
  post-trade point equals the conservation-demanded `wStar` to 0.00e+00** — i.e. φ moves to exactly
  re-seat the curve through the new reserves point. This is the paper's "bring the slope of the
  post-trade point to the reserves point," realized as a φ-recenter.
- **The conserved object is IDENTICAL.** At a symmetric matched start (w_mid=0.5) v27's `wStar` per
  trade (0.545455 / 0.583333 / 0.444444) is byte-identical to v24's derived `w`. Same `(α,β)`, same
  trajectory hyperbola, same w-values — v27 only ADDS the field's φ bookkeeping on top.

### (c) Tangency / pricing-faithfulness — same algebraic identity on both (TEST 3)
`pricing_slope = (w/(1−w))(y/x)` and `trajectory_slope = αβ/(x−α)²` agree to 2e-16 (v24) and 7e-16
(v27). The faithfulness mechanism (item 4) transfers exactly — no new assumption. v27's `getMP_raw`
(L1655) = `(w/(1−w))(y/x)` correctly has NO `e^(−ghMu)` factor (that was GH-only; absent here because
the warp lives in the WEIGHT, not the SCORE — the kernel-slot distinction is respected).

### (d) The warp referent is the RENDERED PRICING CURVE, same as v24 (not the trajectory)
v27's `curveTraceW` (L3369–3401) rebuilds the drawn curve from the LIVE φ-centered field (L3395), so a
trade that moves φ visibly reshapes the displayed curve — the same render principle as v24's
`curveTrace` (rebuilt from live `w=α/x`). This is the right referent (my verdict #13): the thing that
"warps" is the pricing curve, not the conserved trajectory. v27 did NOT silently switch the referent.

### (e) The operator's polar-lens (skew = angle shift φ) is the realized handle
v27's φ is precisely the field-center shift `w(u)→w(u−φ)` — the angle-shift skew the operator named in
entry 9 ("skew is a pure shift φ of the angle"), now generalized from Balancer's scalar-w move to the
field. τ (the operator's "amplitude"/kurtosis) is NEVER written by the trade (`tau` untouched in
`tradeUpdate`; γ_± frozen) — matching ruling 3 (kurtosis is static/vol-set, not trade-moved). The
generalization preserved the operator's role-split: **skew=φ, kurtosis=τ, convexity=w_mid.**

---

## Where it does NOT drift (steelmanned, then checked)

I tried to break the premise four ways:
1. **"v27 conserves a DIFFERENT object."** Steelman: φ is new state — maybe (α,β) are no longer the
   invariants. CHECKED FALSE: TEST 2 trajectory residual ≤1.1e-14; eliminating φ from the two
   conservation eqs gives `α/x+β/y=1` ⇒ `(x−α)(y−β)=αβ` algebraically (note §4, re-derived). Same
   invariants. φ is a *dependent readout* of the same conservation move, not a second conserved DOF.
2. **"The warp referent quietly became the trajectory hyperbola."** CHECKED FALSE: `curveTraceW` draws
   the φ-field pricing curve (L3395), the correct referent — the exact error I FLAG-WRONG'd in the
   compare note (verdict #13) is NOT present in the build.
3. **"φ-skew isn't the operator's angle-shift, just a fitting parameter."** CHECKED FALSE: φ enters the
   field strictly as `u−φ` (a translation of the hyperbolic-angle coordinate) — literally entry-9's
   "shift φ of the angle." Wings (`w(±∞;φ)`) shift-invariant ⇒ asymptote-respecting, matching the
   operator's "amplitude/wings stay" intuition.
4. **"The generalization broke pricing-faithfulness."** CHECKED FALSE: TEST 3 tangency identity holds
   on (W) by the same algebra as Balancer.

## The one labeling caveat (carried from verdict #12, re-confirmed, NOT new and NOT fatal)
TEST 4: v27's `x'` matches v24's `x'` to 1.8e-15 at **every** τ (1, 5, 100, 1e6) when w starts at
w_mid. This is a **single-step identity, NOT a τ→∞ convergence proof** — a single (W) trade step IS a
Balancer trade with w frozen at the live local weight, so it matches a Balancer-at-local-w step at any
τ. The GENUINE Balancer limit (field collapsing to constant w_mid across the curve) converges only
~1/τ². Do not cite this as "v27 reduces to Balancer at τ=5." (Already flagged verdict #12 §FLAG-OVERSELL;
the build/note framing is correct; just don't over-read the digit.) **This does not bear on the premise
faithfulness** — it is about how to describe the Balancer limit, not about whether the warp is the right
object.

## Open lemmas (honestly carried, NOT premise defects)
- **warp∘rebase commute on (W)** — OPEN `[needs-Aristotle]`. The build deliberately does NOT couple φ
  in rebase to avoid asserting commutation (L1753–1755 comment + code) — correct restraint.
- **φ-anchor / funding under a moved φ** — OPEN, operator-tier. Funding reads live `getMP_raw` (reflects
  φ ⇒ self-consistent); the anchor-reference under a non-zero φ is not nailed.
These are frame-completeness questions, not signs the premise drifted.

## Inventory check (all 16 dispositioned by the source note; re-counted myself)
The TRADE_WARP_strongform note dispositions all 16 items (verdict #12 confirmed; pattern-#6 clean). For
THIS premise-cross-verify the load-bearing items are #1 (Balancer base — v27 is its field-lift), #2 (the
warp — kernel-in-WEIGHT, handle exists), #3 (τ static — confirmed untouched by trade), #12 (price coord
== slope on (W), confirmed by tangency), #16 (warp-with-trades — IMPLEMENTED in the live build, the
acceptance clause is met). No silent absence in the premise itself.

## MOST IMPORTANT LINE
**v27's curve-warp is the SAME geometric principle as the paper and v24, faithfully generalized: it
conserves the identical `(α,β)` object, keeps the reserves on the identical trajectory hyperbola
`(x−α)(y−β)=αβ`, reshapes the identical rendered pricing curve, and preserves pricing-faithfulness by
the identical tangency identity — the only change is `w` becoming a field `w(u;φ)` whose center φ is the
operator's own "skew = angle-shift" handle, with τ (kurtosis) held static exactly as ruled. At a
matched symmetric start v27's per-trade weight values are byte-identical to v24's. The premise has NOT
drifted. The one caveat is purely descriptive (the τ→∞ digit is a single-step identity, not a limit
proof — already on record) and two open lemmas (rebase-commute, φ-anchor) are honestly carried, neither
a premise defect.**

## Process notes
- Verbatim channel HELD: entry-27 ask verified against `history/operator/...kurtosis-curve-family-brief.md`;
  my dispatch wording matches the operator's. No FLAG-PROCESS.
- Convergence-alarm LOW: this corroborates the team's strong-form (verdict #12) and reconcile (verdict
  #13) lines, but I re-derived against LIVE engine source (v24 L1594/1617, v27 L1633/1719/3369) and
  reproduced every conserved-object / tangency / reduction number independently — not narrated.
- Provenance of "paper intuition": `paper/temporal_paper_draft.md` lines 33–97 (Trade Formula,
  Conservation Law, the two-curves tangency) + entry-9 polar-lens text + entry-18 vision. Paper is
  motivation-layer; I used its §AMM-Mechanics math only as the principle statement, not as an
  implementation spec (its barrier layer is superseded — charter).

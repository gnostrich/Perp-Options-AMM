# VERDICT — FOUNDATION pass (skeptic, 2026-06-11, operator entry 35)

_Operator entry 35 (verbatim, verified against `history/operator/2026-06-10_kurtosis-curve-family-brief.md`
line 267): "take stock of what needs to be done? get it vetted, get the fix done in v27, check the math
verification layer thats supposed to avoid things like this slipping, and keep the whole math unified etc.
after the skeptic filtered whats current". READ-ONLY; operator live-playing HEAD; no build/git. Three
deliverables: (A) current-truth ledger, (B) VET of the (W)-generalisation/fix-spec, (C) verification-layer
blind-spot diagnosis. Every number below independently re-derived (`/tmp/sk_genB.py`) vs the LIVE promoted
HEAD source + the note. I trusted neither the note's nor the manager's digits._

---

## (A) CURRENT-TRUTH LEDGER — what is STANDING vs OPEN vs SUPERSEDED

This is the baseline the manager's stock-take builds on. Pointers are absolute-in-repo.

### A.1 ESTABLISHED / STANDING (re-derived or settled across verdicts #12–#16, this pass)
- **The (W) curve is HEAD.** `engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html` (run_all md5 target
  `1eebfcd6…`), promoted by operator entry 28. √-kernel weight FIELD
  `w(u;φ)=w_mid+(Δw/2)(u−φ)/√(τ²+(u−φ)²)`, static τ knob, frozen power-law wings. NOT a GH descendant.
- **The strong-form trade is faithful AS A TRANSFORMATION (verdicts #12/#14, re-confirmed).** A trade
  conserves α=x·w, β=y·(1−w); reserves ride `(x−α)(y−β)=αβ`; φ-recenter is the UNIQUE α/β-consistent
  reshape; tangency (price==slope) holds. R-simple (dot-slide) is conservation-INCONSISTENT (off 6.6e-3)
  → strong-form is correct, not aesthetic. Engine `tradeUpdate` L1726–1741 == note §1.2 map byte-for-byte
  (re-verified this pass).
- **On (W) price == geometric slope** (no e^−ghMu; GH-only gotcha). `getMP_raw` L1659 = `(w/(1−w))·(y/x)`.
- **The warp-amm Aristotle cluster EXISTS and is trade-point anchored** (`d20dda3a`/`7f933065`/`4e92e3cb`),
  rapidity/mode-shift form; `mode_shift_closed_call=(1/w₀)log(y_s/y_B)`. Token-scan clean,
  trusted-from-prover NOT re-stamped (it was a query, not a verification round) —
  `notes/research/WARP_continuous_aristotle_query_2026-06-10.md`.
- **The (W)-generalisation headline law is CORRECT** (VET below): `dφ/dy=du′/dy−(1/w′(u))·(β/y²)`,
  `dz/dw*=1/w′(u)`, Balancer limit, all 4 contracts — re-derived this pass.
- **Settlement = Reading-A locked** (S*=K·γ_loc/(γ_loc+1), exact by construction); operator-tier decision
  already taken. Carry = the price leg q=ln p (skeptic-ruled inheritance, verdict #10).
- **THE warp-fidelity GAP is REAL and LIVE (verdict #16, re-confirmed bit-level this pass).** The engine
  warps at SPOT: `tradeUpdate(s,dy)` L1723 takes NO strike arg; `executeLeg` L1851 calls it at the live
  `state`; strike (`theta_inner`) enters ONLY the premium. The paper (L147/L151) warps AT EACH LEG'S TRADE
  POINT, leg by leg. Both v24 and v27 cheat; v24 is further (scalar w, no field). Operator vindicated on
  all counts. The fix is anchoring, not the transformation.

### A.2 OPEN (genuinely unresolved — these are the roadmap items)
1. **The trade-point-anchoring fix is UNBUILT.** Engine still warps at spot. This is the entry-35 "get the
   fix done in v27" item. Fix-scope = MODEST for discrete-at-trade-point (`arbitrageToOracle(state,θ)` +
   `tradeUpdate` exist); the genuine subtlety is reconciling ONE global φ across the trade-point AND the
   reserves point (two points, one curve, one φ). Anchoring choice = curve/economic-object = **OPERATOR-TIER**
   (§7) — manager must NOT pick it.
2. **The `(α,β)`-flow-confinement lemma is uncertified.** Numeric path-independence 0.0; NOT Lean. This is
   the piece that would CERTIFY the lift well-defined (one global φ regardless of anchor point). Short,
   algebraic, Mathlib-tractable, `[needs-Aristotle]`. THE one uncertified load-bearing piece (VET B below).
3. **warp∘rebase commute on (W)** — OPEN `[needs-Aristotle]`. Engine deliberately does NOT couple φ in
   rebase (L1757–1763, comment is honest about this).
4. **φ-anchor / funding reference under a moved φ** — OPEN, operator/settlement-tier. Funding's w=½ anchor
   may be out of the wing band when w is a field (verdict #10 guard 3, un-discharged).
5. **The full continuous-integral warp** (paper L288 placeholder, `∫β/y² dy` along the hyperbola) — separate,
   bigger, `[needs-Aristotle]`. The discrete-at-trade-point fix does NOT need it.
6. **The kurtosis-knob ↔ τ-family identity** (inventory item 2) — the "GH=one (W) setting, τ≡δ" identity is
   BROKEN; how the demoted GH line relates to (W) is still formally OPEN but no longer on the critical path
   (GH demoted).

### A.3 SUPERSEDED / STALE — what needs reconciling into ONE source of truth (the "keep math unified" item)
- **My own verdict #14 is AMENDED, not retracted** (by #16/me): "premise faithful / #16 acceptance met" was
  too broad — it checked the transformation, never the anchoring. Anyone citing #14's "#16 met" language is
  citing a superseded framing. **`docs/feature_inventory.md` item 16 still implies #16 may be met by the
  build** — it says "OPEN-UNIMPLEMENTED" for the warp generally but does NOT record the narrower live truth
  that the TRANSFORMATION is implemented while the ANCHORING is not. **Item 16 needs one line: "v27
  implements the warp transformation but at SPOT, not the trade point; at-trade-point anchoring is OPEN,
  operator-tier."** (Manager edits the inventory, not me.) ← UNIFY ITEM 1.
- **`WARP_v24_vs_v27_compare_2026-06-10.md` carries a headline I FLAG-WRONG'd (#13)** ("v24 ≡ 0 reshape /
  premise FALSE") — the manager added a correction header. That note stays as audit trail but its original
  headline must NEVER be re-cited. ← UNIFY ITEM 2 (already headed; flag if it re-surfaces uncorrected).
- **The warp-amm Aristotle cluster is NOT in `formal/INDEX.md`** (predates it). The trade-point math the fix
  points at lives on Aristotle's servers, un-provenance-mapped locally. ← UNIFY ITEM 3 (manager call; fold
  it into INDEX so it stops being lost).
- **research-lead MEMORY.md** was flagged in verdict #0 as not truthed-up (still carried "κ:=δ EXACTLY")
  — re-verify it does not brief the stock-take from dead claims. ← UNIFY ITEM 4 (re-check; may be stale).
- **`wcurve_selfcheck.js` (the gate) is STALE relative to current truth** — it checks the transformation
  and explicitly cites `TRADE_WARP_strongform` (skeptic-GREEN) as authority, but that authority is now
  KNOWN-NARROW (transformation-only). The gate has no anchoring check. ← UNIFY ITEM 5 = the (C) deliverable.

---

## (B) VET — the (W)-generalisation + the trade-point-fix spec → **PASS (with one labeling caution)**

Artifact: `notes/research/WARP_genB_kurtosis_generalisation_2026-06-10.md`. I re-derived every load-bearing
claim independently (`/tmp/sk_genB.py`, python float64, note params x=10,y=12,τ=0.3,w_mid=0.62,Δw=0.20).

**The headline law — CONFIRMED.** `dφ/dy = du′/dy − (1/w′(u))·(β/y²)`. My LAW value −0.0074025773 vs my
independent NUMERIC (finite-diff of the full Step1–4 φ-solve) −0.0074025774, **|diff| 1.24e-10** — matches
the note's claimed 1.2e-10 byte-level. The decomposition reproduces exactly: displacement du′/dy = +0.124020,
field re-seat −(1/w′)·β/y² = −0.131423, total −0.007403 (note §2 table identical).

**The τ-gearing identity — CONFIRMED.** `dz/dw* = 1/w′(u_on_field)`: my dz/dw* = 4.80718797 vs 1/w′ =
4.80718797, |diff| 2.6e-09 (finite-diff floor). τ enters ONLY through w′(u) = (Δw/2)τ²/(τ²+(u−φ)²)^{3/2};
the trade never writes τ. This is the operator's static-knob design realised correctly — τ CONDITIONS the
warp (sharp elbow = cheap φ-move; wings w′→0 = divergent φ-travel = the frozen-wing cap), it is NOT scaled
by the trade. The "kurtosis enters inversely through field curvature" reading is sound.

**Closed-form-survival honesty — HONEST.** The note plainly says: closed form in the elbow (w*∈(w_−,w_+)
⇔|t|<1, φ′=u′−t·τ/√(1−t²), no bisection), DIVERGES at the wing (t→±1 ⇒ z→±∞ ⇒ no finite φ′ ⇒ numeric
clamp/reject). This matches the live engine's wing-range guard (L1732, rejects when w* exits the band). Not
oversold; the "global closed form" is correctly disclaimed.

**Balancer reduction — CONFIRMED.** τ→∞ ⇒ w′(0)→0 (my check: 0.1/0.02/1e-4 at τ=1/5/1000), field flattens
to scalar w_mid, the per-leg law collapses onto warp-amm's scalar mode-shift. Δw→0 is the skew-side twin.
warp-amm = the τ→∞/Δw→0 corner. Genuine generalisation, not a different model.

**Contract-consistency — re-derived, holds.** α/β conservation (= Steps 2–3, the engine's own move), frozen
wings (φ-recenter leaves w(±∞)=w_± invariant), γ>1 iff w_±>½ (warp can't break or fix it), Reading-A
settlement (warp moves φ hence γ_loc(·), S*=K·γ_loc/(γ_loc+1) exact by construction, warp acts WITHIN
settlement never on the mark form). All four survive because the warp only moves φ.

**Is it a sound SPEC for the fix?** YES as the MATH. The law is the exact differential of the engine's own
discrete Step-4 φ-solve, so wiring the fix = anchoring the SAME `tradeUpdate` formula at
`arbitrageToOracle(state, θ_inner)` instead of `state` — contained, as the operator pinned. BUT: the spec
is the per-leg LAW; it does NOT itself resolve the **one-global-φ-across-two-points** reconciliation, which
the note correctly RE-FLAGS (§4) as the real design tension. A build spec must carry that as the open
design decision, operator-tier — the note does not paper over it.

**The `(α,β)`-flow-confinement lemma — YES, it is genuinely THE one uncertified piece.** Path-independence
verified NUMERICALLY to 0.0 (`TRADE_WARP_strongform` battery; wcurve gate (f) re-checks one instance) but
NOT proven in Lean. It is the lemma that certifies "one global φ regardless of which point you anchor at"
— exactly what the anchoring fix needs to be well-defined. The note labels it `[needs-Aristotle]`, short,
algebraic, no special functions — honest. **This is the correct single obligation to certify the lift; no
other piece of the generalisation is uncertified at the math level.**

**One labeling caution (non-blocking, carried from #12/#14/#16):** the note's "numeric-confirmed 1.2e-10"
is a discretisation check of the law against the engine's OWN φ-solve (they are the same formula, discrete
vs differential) — it is NOT independent corroboration that the formula is the RIGHT physics, only that the
continuous law is the correct derivative of the discrete step. The physics correctness rides on the paper's
trade-point premise (verdict #16, confirmed) + the contracts (re-derived) — which DO hold. So the claim is
sound, but the 1.2e-10 should be read as "law == d(engine step)", not as an external validation. No flag —
the note's [analytic]/[numeric] tags are accurate and it does not overclaim the number's meaning.

**VERDICT (B): PASS.** Attack attempted on every load-bearing claim (law, gearing, closed-form survival,
Balancer limit, all 4 contracts) — all held under independent re-derivation. The confinement lemma is
correctly identified as the lone uncertified piece. Convergence-alarm LOW: the note self-flags its own
tension (§4), the digits reproduce, and it does not assert a build.

---

## (C) VERIFICATION-LAYER BLIND SPOT — why the gap slipped past 21 gates + the faith gates + my #14

### (i) The GATE that would have caught it (the missing spec)
**A strike-dependence / anchoring gate: the SAME cash leg, executed for DIFFERENT strikes, must produce
DIFFERENT warps.** Concretely, in `wcurve_selfcheck.js` WARP block:

> **WARP (g) STRIKE-DEPENDENT ANCHORING:** for a fixed cash leg dy, run the leg's warp anchored at
> `arbitrageToOracle(state, θ)` for θ ∈ {deep-ITM, ATM, deep-OTM}; assert the resulting φ′ (or Δφ) are
> **materially different across θ** (e.g. spread > 1e-3, growing toward the wings via `1/w′(u)`). The CURRENT
> engine, which warps at spot, would FAIL this gate (φ′ bit-identical across θ at fixed dy — I reproduced
> −0.00611737 across θ=1.2/3.0/8.0 in verdict #16). After the fix it must PASS.

This gate is the inverse of what every existing gate checks: existing gates assert the warp is
**well-behaved given an anchor**; this one asserts the **anchor itself is strike-bound**. It is the only
gate that distinguishes spot-warp from trade-point-warp. (Note: until the operator rules on the anchoring,
this gate encodes a NOT-YET-DECIDED behavior — so it is a SPEC for the post-fix gate, not a today-gate. The
honest interim gate is a NEGATIVE one: "WARP is currently strike-INDEPENDENT (spot-anchored) — KNOWN GAP,
inventory #16" so the gap is RECORDED in the gate, not silent.)

### (ii) The broader BLIND-SPOT CLASS (so hardening covers the class, not the instance)
**The gates and verdicts check WHAT IS CONSERVED and WHAT IS WELL-FORMED, never WHERE/HOW the operation is
ANCHORED in the strike continuum.** Every WARP gate (a)–(f) in `wcurve_selfcheck.js` checks an
invariance/consistency property of a SINGLE trade at a SINGLE (spot) anchor: α/β conserved, on the
hyperbola, field-consistent w*, ATM weight shifts, wing-cap rejects, path-independent. NONE takes the
STRIKE as a variable. The whole battery would pass identically whether the warp is anchored at spot, at the
trade point, or at the 45° point — because none of them feeds the strike in. **This is team blind-spot
pattern #4 (kernel-slot / referent conflation) in its sharpest form: a true, fully-verified label
("conserved / consistent / path-independent") on the WRONG OBJECT (the per-trade transformation) presented
as covering the wider object (the strike-resolved warp).** My own #14 committed it; #16 amended it. The
class to harden against: **"correctly verified the operation; never verified its anchor / its dependence on
the pricing variable it is supposed to respond to."** The structural test for the class: for any gated
operation, ask "does the gate FEED IN the strike/registration coordinate, or only the local reserve state?"
If only the latter, the gate is anchor-blind by construction.

### (iii) Which gates are LOAD-BEARING vs which gave FALSE CONFIDENCE
- **Load-bearing (keep):** gate (1) price==slope (catches the GH e^−ghMu conflation — THE gotcha); (3a/3b/3c)
  frozen-wing-exponent vs rounding-elbow (the kurtosis-knob's defining behavior); (5) settlement
  smooth-paste seam (the one accuracy-class check); WARP (a) α/β conservation + (b) hyperbola + (c)
  field-consistency (these DO certify the transformation is the unique α/β-consistent reshape — real
  content, my #12 TEST B). (e) wing-cap is real (matches the live guard). These check things that CAN break
  and would matter.
- **False confidence (the trap):** WARP (d) "φ moves ⇒ ATM weight shifts (curve reshaped, not a dot
  sliding)" — this gate's NAME ("not a dot sliding") oversells it as evidence the warp is the
  operator-faithful reshape. It only proves φ MOVED; it says NOTHING about whether φ moved by the
  strike-correct amount or at the strike-correct anchor. It is the gate most likely to have produced the
  "we implement the warp" false confidence that fed my #14 over-reach. (f) path-independence is true but
  was mis-USED as "the warp is well-defined globally" when it only covers the spot-anchored single trade —
  the GLOBAL well-definedness (across anchor points) is exactly the uncertified `(α,β)`-flow lemma (B
  above). **The pattern: gates whose NAME claims a faithfulness/reshape property while their BODY only
  checks a local invariance.** Rename or re-scope (d) and (f) so their names match their bodies; add the
  (g) anchoring gate (or its interim negative form) so the strike axis is no longer unguarded.

---

## Process / convergence
- Verbatim channel HELD: entry 35 verified against `history/operator/2026-06-10_kurtosis-curve-family-brief.md`
  L267; entries 33/34 (the warp-amm/generalise chain) verified L251–261. No FLAG-PROCESS.
- Convergence-alarm LOW. The artifact under VET self-flags its own tension (the one-global-φ subtlety),
  every digit reproduced on an independent code path, and the diagnosis (C) is self-adversarial (it names
  MY OWN #14 as the instance of the blind-spot class). The manager's "headline re-derived" claim is
  CORROBORATED at the math level (law + identity + decomposition + limit all reproduce), though the
  manager's specific |diff| figures (4e-5/4e-8) are a different comparison than my 1.24e-10 and I did not
  source them — the LAW is right regardless of which discretisation step you difference against.
- Scripts: `/tmp/sk_genB.py` (this pass).

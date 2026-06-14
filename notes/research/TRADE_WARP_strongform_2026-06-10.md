# Strong-form trades-warp on the (W) kurtosis curve — the field weight-update map

> ## ✅ SKEPTIC GREEN + manager re-derivation (2026-06-10 — read first)
> Skeptic verdict `notes/skeptic/VERDICT_TRADE_WARP_strongform_2026-06-10.md`: **GREEN-TO-RESUME-BUILD;
> the standing #16 acceptance-clause FLAG CLEARS** — this is a real warp (skeptic TEST B: at the same
> post-trade reserves, strong-form `w(u';φ')=0.697171` == the α/β-conservation-demanded `w*` to machine
> zero, whereas R-simple gives `0.690620` — **R-simple VIOLATES α/β conservation**, so the strong-form
> φ-move is the *unique* conservation-consistent trade; dropping R-simple is correct, not cosmetic).
> Manager re-derived independently (`evidence/manager_audit_TRADE_WARP_2026-06-10.md`). Two corrections,
> neither fatal:
> 1. **FLAG-OVERSELL (non-blocking):** the "τ→∞ recovers Balancer to 1e-13 at τ≥5" digit is a
>    near-tautology (a single (W) trade step IS a Balancer trade with `w` frozen at the live local
>    weight). The framing "τ→∞ recovers Balancer (w→w_mid)" is correct, but the genuine limit converges
>    only ~1/τ² (6.6e-3 @ τ=5, 3.3e-5 @ τ=1000) — do NOT cite 1e-13 as a τ=5 convergence proof.
> 2. **Build caveat:** the warp∘rebase-commute and φ-anchor/funding lemmas are OPEN (`[needs-Aristotle]`).
>    The v27 build must NOT implement an `(x,y,φ)` rebase that *implies* commutation — leave that
>    undefined/flagged until the lemma lands.

_research-lead, 2026-06-10. PRIORITY derivation (build HELD until this lands)._
_Notes-only. NO engine edit, NO git, NO Aristotle submit. Theory-risk accepted on the periphery;_
_the warp mechanism itself is defined rigorously below._
_Gets a skeptic pass before any build resumes._

This note delivers the **strong-form** trade mechanic the operator calls "half the job" (inventory
#16, R-paper, NOT the R-simple "reserves slide on a fixed field" the BUILD_SPEC adopted): the explicit
map **trade → (W) weight-FIELD update → reshaped curve**, derived from the paper's slope-goal-seek +
the α,β conservation law, generalised from Balancer's scalar `w` to the (W) field `w(u)`. With it
come the consistency proofs (reserves faithful, τ static, wings frozen, settlement/carry survive) and
the precise characterisation of the one genuine obstruction (the frozen-wing range limit).

Every quantitative claim below is reproduced in `/tmp/warp{1..8}.py` (python float64); tags are
`[analytic]` (closed-form identity, machine-checked), `[numeric]` (verified at test params),
`[needs-Aristotle]` (a Lean obligation, not yet pinned).

---

## (i) Path

`notes/research/TRADE_WARP_strongform_2026-06-10.md` (this file). Numerics
`/tmp/warp1.py`..`/tmp/warp8.py`. Supersedes the §1.2 "(R-paper OPEN)" caveat of
`notes/research/BUILD_SPEC_wcurve_2026-06-10.md` — R-paper is no longer open; it is the map in §3.

---

## (ii) The discarded variant and why its warp failed

**What it was.** The GH line `v25_gh → v26a → v26b → v26c` (current HEAD
`engine/builds/HEAD_temporal_mvp_v26c.html`). `v25_gh` swapped the AMM invariant from the
Balancer-barrier curve to the **generalized-hyperbolic (GH) reserve curve** — the kernel placed in the
latent **SCORE** (`f ∝ exp(−α√(δ²+v²))`, score `β−αv/√(δ²+v²)`), NOT in the weight. This is the
build that "put in another curve." The curve-warp-with-trades item (#16) was **never implemented**
on it — confirmed both by the skeptic FLAG-OMISSION (`notes/skeptic/FLAGS_2026-06-10_warp_with_trades.md`)
and directly in code.

**The precise obstruction (why warp didn't work on GH).** Read `tradeUpdate` on the GH engine
(`HEAD_temporal_mvp_v26c.html` line 1720):

```
function tradeUpdate(s, dy) {            // GH
  const y_new = s.y + dy;
  const Y = y_new - s.beta;
  const u = _invB1(s, Y / (s.ghNy * s.ghM));     // invert the FIXED CDF table
  const X = s.ghNx * _FbHi(s, u);                // read X off the FIXED tail table
  const x_new = X + s.alpha;
  return { ...s, x: x_new, y: y_new };           // shape params ghAh,ghBh,ghDelta,ghMu UNTOUCHED
}
```

The trade reads `(x,y)` off **fixed** GH tail/CDF tables (`_FbHi`, `_invB1`) keyed on the static
shape `(ghAh, ghBh, ghDelta, ghMu)` and returns `{...s, x:…, y:…}` — **the shape parameters are
never written.** A GH trade moves a point along a fixed distributional field. The reason it *cannot*
warp:

> **On GH the kernel is in the SCORE, so there is no scalar weight `w` for a trade to move.**
> Balancer's warp handle is exactly `w = α/x`, the one shape scalar a trade re-derives as `(x,y)`
> move (paper line 89: "the weight `w` is the quantity the pool's pricing actually moves"). GH has
> no such handle — its shape lives in the α/β/δ/μ of the latent measure, which are deployment-time
> constants, not functions of the reserves point. There is no `w = α/x` analogue to slave to the
> trajectory.

This is the same fact the manager-verified skeptic verdict states at curve level
(`VERDICT_KURTOSIS_KNOB_2026-06-10.md`): **kernel-in-SCORE (GH) ≠ kernel-in-WEIGHT ((W))**; the live
GH `w_eff(ln(y/x))` is even non-monotone, so GH is not a (W) member at any τ. The lesson for the (W)
derivation: **the warp must ride on a weight handle that IS a function of the reserves point** — and
that is exactly what (W) has and GH lacks. The (W) derivation below avoids the obstruction *by
construction* because the warp d.o.f. (the field center φ) is slaved to the reserves point's position
on the conserved trajectory, the direct generalisation of `w = α/x`.

---

## (iii) The strong-form map (DEFINED — this is the deliverable)

### 1. First pin the Balancer mechanism the paper actually specifies `[analytic]`

The paper (lines 35–39) names **two** curves and is precise about which does what:

- **Balancer curve** `x^w·y^(1−w)=k` — the *pricing* curve, whose shape is set by `w`; **this is the
  curve that skews.**
- **Trajectory hyperbola** `(x−α)·(y−β)=αβ` — the locus the reserves point actually rides, with
  `α=x·w`, `β=y·(1−w)` conserved.
- They are **tangent at the reserves point**, which is why pricing read off the Balancer curve is
  faithful, and why "reshape the curve" and "move along the trajectory" are the *same event*
  (line 37).

Verified directly on v24's `tradeUpdate` (`/tmp/warp1.py`): a cash leg `dy` conserves `(α,β)`, moves
`(x,y)` along the trajectory hyperbola (residual 1e-14), and **the Balancer curve genuinely skews** —
`k: 10.855 → 10.726`, `w: 0.550 → 0.594`. Balancer-curve slope and trajectory-hyperbola slope match
at the reserves point to 4e-16 (tangency). So on plain Balancer the **strong form already holds**:
the pricing curve reshapes; the trajectory hyperbola is the conserved object; the reshape is a forced
*consequence* of the conservation move, not a separate goal-seek. The slope-goal-seek of paper line 39
**is** the conservation move, viewed from the curve side.

**Correction to the standing framing:** the BUILD_SPEC's "R-simple = reserves slide on a FIXED field"
was a mischaracterisation of even plain Balancer. The pricing curve `x^w·y^(1−w)=k` is *not* fixed
under a Balancer trade (its `w` and `k` both move). The genuinely fixed object is the trajectory
hyperbola. The strong form is just: carry that picture to the field.

### 2. The (W) degree-of-freedom count `[analytic]`

(W) pricing curve = level set of the **shifted** weight field. Introduce the field center φ (φ=0 at
deploy):

```
w(u; φ) = w_mid + (Δw/2)·(u−φ)/√(τ² + (u−φ)²),     u = ln(y/x),     γ_loc = w/(1−w)
```

The pricing curve's shape has handles `(w_mid, Δw, τ, φ)`. Operator constraints: **τ static**
(kurtosis vol-set), **wings frozen** (γ_± = w_±/(1−w_±) fixed ⇒ `w_mid, Δw` fixed). The ONLY field
handle a trade may move without touching wings or τ is the **center φ**: `w(u) → w(u−φ)`. This is
exactly the **angle-shift skew** of the hyperbolic-angle lens (η→η−φ; see GUDERMANNIAN_BRIDGE) —
the field-analogue of Balancer's scalar-`w` move. φ moves the elbow, leaves both wing exponents and τ
exactly invariant (`/tmp/warp2.py`: `w(±∞)` shift-invariant to machine precision).

So the (W) trade has the SAME shape as Balancer: **one input (cash leg `dy`) → `(x', w*)` forced by
conservation → φ' forced as the dependent curve-reshape readout.**

### 3. The map (closed form) `[analytic]`

Conserve the (W) field-analogue of `(α,β)`, evaluated with the **shifted-field** local weight at the
live point:

```
α := x · w(u; φ),          β := y · (1 − w(u; φ)),        u = ln(y/x)
```

Given a cash leg `dy`:

```
Step 1.  y' = y + dy
Step 2.  (β-conservation)   w*  = 1 − β/y'            ← the new LOCAL weight
Step 3.  (α-conservation)   x'  = α / w*              ← the new underlying reserve (dx forced)
Step 4.  (field reshape)    φ'  solves  w(ln(y'/x') ; φ') = w*       ← the curve SKEWS
            with t := (w* − w_mid)/(Δw/2),   z := t·τ/√(1−t²),   φ' = ln(y'/x') − z
Output:  (x', y', φ')        reserves faithful (x',y' real), curve reshaped (φ moved), τ untouched.
```

The φ'-solve is **closed form** (Step 4) and **unique** whenever `w* ∈ (w_−, w_+)` — exactly the case
`|t| < 1`. No bisection needed for the warp itself.

**Equivalence of the two derivations (`/tmp/warp8.py`).** Step 4 is identically the paper's slope
goal-seek: "find the reshape φ' that makes the new curve pass through `(x',y')` with the demanded
marginal slope." Solved as an independent root-find, `φ_goal-seek = φ'_closed-form` to 8e-16. The
conservation map and the goal-seek map are the same map.

### 4. The conserved object — the SAME trajectory hyperbola `[analytic]`

Eliminating φ from the two conservation equations: `α/x = w*` and `β/y = 1−w*` give
`α/x + β/y = 1`, i.e.

```
(x − α)·(y − β) = α·β          — identical to Balancer's trajectory hyperbola.
```

Verified across a trade sweep (`/tmp/warp7.py`): the projected reserves locus stays on
`(x−α)(y−β)=αβ` to 1e-15 for every `dy`. **The (W) reserves point rides the very same trajectory
hyperbola as Balancer.** The (W) novelty is *only* that the pricing-curve shape φ is slaved to the
point's position along it. This is the clean structural statement of "trades skew the curve": the
reserve flow is governed by the conserved `(α,β)` trajectory (faithful, Balancer-identical), and the
*pricing* curve reshapes (φ moves) as the dependent readout — exactly the paper's two-views-one-event.

### 5. Tangency / pricing-faithfulness on (W) `[analytic]`

At the reserves point the (W) pricing-curve slope and the trajectory-hyperbola slope are **identically
equal for any w** (`/tmp/warp8.py`, match 0.0):

```
pricing slope      = (w/(1−w))·(y/x)
trajectory slope   = αβ/(x−α)²  =  x·w·y·(1−w) / (x²(1−w)²)  =  (w/(1−w))·(y/x).
```

So tangency — hence pricing-faithfulness — holds on (W) by the same algebraic identity as Balancer,
with `w` now the shifted-field local weight. No new assumption.

---

## (iv) Consistency battery (the non-negotiables) — all verified

| Check | Result | Tag | Script |
|---|---|---|---|
| **Reserves faithful** | `x',y'` are the actual swapped reserves; `dx` forced by α-conservation (Step 3), not chosen | `[analytic]` | warp6 |
| **Marginal price monotone in cash-in** | post-trade slope strictly ↑ in `dy` (1.39→3.83 over dy∈[−2,2]) ⇒ price response well-posed | `[numeric]` | warp6 |
| **Round-trip exact** | trade `+dy` then `−dy` returns `(x,y,φ)` to 1.8e-15 | `[numeric]` | warp6 |
| **Path-independent** | one step of `dy` = two steps of `dy/2` to 0.0 (φ,x,y) ⇒ `(α,β)` are genuine flow invariants | `[numeric]` | warp6 |
| **Trajectory = `(x−α)(y−β)=αβ`** | held to 1e-15 across the whole `dy` sweep | `[analytic]`+`[numeric]` | warp7 |
| **Tangency / pricing-faithful** | pricing slope ≡ trajectory slope (algebraic identity) | `[analytic]` | warp8 |
| **τ static** | `(w_mid,Δw,τ)` never written by the trade; γ_+ pre=post=2.5714 | `[analytic]` | warp8 |
| **Wings frozen** | `w(±∞;φ)` shift-invariant; wing exponents φ-independent | `[analytic]` | warp2 |
| **Reduces to plain Balancer (τ→∞)** | `dx` matches the Balancer closed-form to 1e-13 at τ≥5 | `[numeric]` | warp4 |
| **Slope goal-seek ≡ closed form** | `φ_goal-seek = φ'` to 8e-16 | `[numeric]` | warp8 |

**Settlement / carry survival.** The map only moves `(x,y,φ)`; it never touches the value law, the
mark form, or the dollar pipe. (a) **Wings:** on a wing the local weight is the frozen `w_±`, so the
continuation is the exact power `S^(−γ_±)` and the inherited smooth-pasting S* carries verbatim
(unchanged from the carry/settlement passes). (b) **Carry coordinate** stays the price leg `q = ln p`
(`getMP_raw` reading) — the φ shift is a reshape of the same pricing curve, read in the same `q`.
The strong-form trade does not re-open the carry verdict; it acts within it.

---

## (v) The one genuine obstruction (precisely characterised, NOT fatal)

Step 2 requires `w* = 1 − β/y' ∈ (w_−, w_+)`. Outside that band there is **no finite φ'** — the curve
would have to skew *past* a frozen wing weight, which is forbidden (wings are locked). This bounds the
cash leg a single trade can absorb (`/tmp/warp7.py`):

```
y' ∈ ( β/(1−w_−),  β/(1−w_+) )      ⇔      w* ∈ (w_−, w_+)
```

At test params `(w_mid,Δw,τ)=(0.62,0.20,0.3)`, x=10,y=12: `dy ∈ (−3.80, +2.06)`. Plain Balancer would
allow `y' ∈ (β, ∞)` (w∈(0,1)); (W) is **tighter** because its weight is confined to the wing band
`(w_−, w_+)`, not all of `(0,1)`.

**Interpretation.** This is not a defect — it is the correct, expected consequence of frozen wings: a
trade large enough to drive the *local* weight to a wing weight has pushed the elbow as far as it can
skew. **What unblocks more range:** (a) a wider wing band `Δw` (a calibration choice — but operator
wants wings static); (b) treating an oversized order as a *sequence* of bounded sub-trades with
interleaved arbitrage/rebase (the engine already trades incrementally); or (c) a documented clamp:
saturate φ at the wing and route the residual as a pure on-curve move (degenerates locally to
R-simple at the boundary only). **Recommended build behaviour:** enforce the `w*∈(w_−,w_+)` guard and
either reject or split oversized single trades — flag the choice as operator/calibration-tier.

**Honesty on what is and isn't proven.** The *mechanism* (§3) and its core invariants (trajectory,
tangency, τ/wing freeze, round-trip, path-independence, Balancer limit) are `[analytic]`/`[numeric]`
solid. What is **not** yet established and stays `[theory-risk-accepted]` / `[needs-Aristotle]`:

1. **`(α,β)`-conservation-defines-a-flow lemma.** Path-independence is verified numerically to 0.0 but
   not proven in Lean. The clean statement — "`(α := x·w(ln(y/x)−φ), β := y·(1−w(ln(y/x)−φ)))` are
   first integrals of the (W) trade vector field, and the reserves projection is exactly
   `(x−α)(y−β)=αβ`" — is a clean candidate. `[needs-Aristotle]` (not pinned this pass; the obligation
   is short and Mathlib-tractable — algebraic, no special functions).
2. **Trades–rebases commute on (W).** The paper asserts commutation (line 115) and Balancer has it;
   the strong-form (W) rebase is the carry-shift `q→q−ln r` (BUILD_SPEC §1.3). Whether the strong-form
   trade commutes with the carry-shift rebase is **not checked** here — it is the natural next
   numeric/Aristotle target and is load-bearing for the frame being well-defined. `[needs-numeric +
   needs-Aristotle]`, flag.
3. **The economic anchor of φ=0.** I set φ=0 at deploy and let trades move it freely. Whether the
   "anchor curve" (paper, Strike Normalisation) should pin φ=0 to the oracle-equilibrium point, and how
   funding's price-anchor interacts with a non-zero live φ, is an operator/settlement question. The
   funding spec (BUILD_SPEC §4) reads the live `getMP_raw`, which already reflects φ — so funding is
   self-consistent — but the *reference* the anchor curve provides under a moved φ is not nailed.
   Flag, operator-tier.

---

## Inventory disposition (every item, per the skeptic gate)

| # | Item | Disposition |
|---|---|---|
| 1 | Balancer base | **Considered** — the strong form is the field-lift of Balancer's exact `(α,β)`/trajectory mechanism; τ→∞ recovers it (1e-13). |
| 2 | The curve warp | **Considered/Changed** — this note DEFINES the warp as a field-center shift φ slaved to the conserved trajectory. Kernel-in-WEIGHT (the warp handle exists), unlike GH. |
| 3 | Kurtosis knob τ | **Considered** — proven static through a trade (never written; γ_± invariant). |
| 4 | Carry `P=Ny/Nx`, `q=ln p` | **Considered** — the map acts within the carry verdict (price leg `q`); does not re-open it. |
| 5 | Rebase | **Considered (partial)** — trades-commute-with-rebase on (W) is FLAGGED open (consistency item 2 above); not closed here. |
| 6 | value ∝ S^(−γ) | **Considered** — survives on the frozen wings verbatim (constant w_± ⇒ exact power); elbow per Reading A/B fork (unchanged, operator-tier). |
| 7 | ITM smooth-pasting | **N-A** — the map doesn't touch the mark; S* inherited on wings. |
| 8 | Strike registration θ=sNorm(K) | **Considered** — strikes register in `q` against the anchor curve; a moved φ shifts trade points along rays (paper line 55), registration preserved against anchor. (φ-anchor flagged, item 3.) |
| 9 | Funding | **Considered** — funding reads live `getMP_raw` which reflects φ ⇒ self-consistent; anchor-under-moved-φ flagged. |
| 10 | Slippage basis | **N-A** — on (W) `mpGeom=getMP_raw` (no e^−ghMu, [proven] BUILD_SPEC L4); unaffected. |
| 11 | Dollar pipe | **N-A** — untouched (curve-independent; §6 hard-stop honored). |
| 12 | getMP_raw is price coord | **Considered** — on (W) it also equals the slope; tangency identity (§5) makes this exact. |
| 13 | Solvency boundary | **N-A** — geometry does not close solvency; not claimed. |
| 14 | Esscher tilt / latent group | **Considered** — the strong-form trade is the WEIGHT-slot analogue of the latent-translation; here it is an explicit field-center translation φ (no X·Y product invariant claimed). |
| 15 | File-safety gate | **N-A (notes-only)** — no engine edit this pass; the map is a spec for the intern, who honors the gate. |
| 16 | **Warp-with-trades** | **Changed/DEFINED** — this is the deliverable: the strong-form R-paper map (§3). R-paper is no longer open. |

---

## Flags for the operator (via the manager)

1. **R-paper is now defined** — the BUILD_SPEC §1.2/§8 "(R-paper OPEN, w→φ map UNIMPLEMENTED)" can be
   replaced by §3 of this note. The build need no longer ship the weaker R-simple; it can ship the
   strong form, with the wing-range guard.
2. **The frozen-wing range limit is the trade's natural size cap** — operator/calibration-tier: reject
   or split oversized single trades, or widen Δw. Recommend the guard `w*∈(w_−,w_+)` with order
   splitting.
3. **Two open consistency lemmas** (not blockers, but load-bearing for the frame): (a) trades commute
   with the carry-shift rebase on (W); (b) the φ=0 anchor / funding-reference under a moved φ. Both are
   numeric+Aristotle targets, not yet pinned.
4. **Reading A vs B settlement** is untouched here (operator-tier, unchanged) — the strong-form trade
   acts within whichever reading is chosen.
5. **Nothing submitted/verified.** All claims are `[analytic]`/`[numeric]` (python float64) or flagged
   `[needs-Aristotle]`. No engine edit, no git, no Aristotle round-trip this pass. Manager re-derives
   the numbers; skeptic pass precedes any build resume.

# Canonical feature inventory — the skeptic's checklist

_Created 2026-06-10 (operator-directed). This is the list of load-bearing structures that every
brainstorm / design note / spec touching the curve, invariant, settlement, or economics MUST
explicitly disposition. The skeptic audits notes against this file; a silently absent item is a
FLAG-OMISSION. Keep this file short and current — it is a lens, not an encyclopedia._

## ⭐ The motive (one breath)
**A curve-warp AMM grown out of Balancer, whose purpose is a kurtosis knob — everything else
stays the same.** Balancer `x^w·y^(1−w)=k` is the base; a trade warps the curve; the kurtosis/vol
knob is a **constant slope multiplier m** (steepness `m·γ` at every strike; bigger m = steeper +
trade further; see the REDEFINITION banner below) — carry/rebase, value∝S^(−γ), ITM smooth-pasting,
funding, and the dollar pipe are **unchanged**. The curve/invariant decision is the operator's.

## Disposition rule
Every in-scope note carries a line per item: **Considered** (analyzed in the note) / **Changed**
(the note proposes altering it — escalation tier!) / **Excluded(why)** / **N-A(why)**. No silent
absences.

## ⛔ CURVE REDEFINITION 2026-06-13 (operator entries 229/231, skeptic `VERDICT_constant_slope_multiplier`)
The kurtosis/vol knob is a **constant slope multiplier m**: option-value steepness = `m·γ` at every strike
(m=1=plain v24; bigger m = steeper everywhere + trade lands further out, `θ_tx=mode·(chosen/mode)^m`).
**SUPERSEDED:** item 2's position-dependent weight warp AND item 3's "τ rounds the elbow / wings frozen at γ"
— no elbow-rounding, no flat-top, wings = exact power-laws of exponent m·γ. A5 (asymptotes) = still power-laws
(no floor), now scaling with m. ATM cusp (old Q11) vanishes. Survives: smooth-paste, monotonicity/no-arb, round-trip.

## The inventory

| # | Feature | Why load-bearing (one line) |
|---|---------|------------------------------|
| 1 | **Balancer base** `x^w·y^(1−w)=k` | The family's exact base; Gaussian/Merton slice; = δ→∞ limit (NOT δ→0 — that's Laplace). |
| 2 | **The curve warp** (position-dependent weight) | The engine's defining move — GH realizes it via the latent SCORE. ⚠ CORRECTED 2026-06-10 (skeptic, manager-verified): a clean closed-form invariant DOES exist for the weight-profile family (`x^{w_mid}·y^{1−w_mid}·e^{−(Δw/2)√(τ²+ln²(y/x))}=k` — the old "none exists, proved structurally" is FALSE), and "GH = one (W) setting, τ≡δ" is FALSE at curve level (engine w_eff vs ln(y/x) non-monotone ⇒ not a (W) member). Kernel-in-SCORE ≠ kernel-in-WEIGHT. |
| 3 | **Kurtosis/vol knob = CONSTANT SLOPE MULTIPLIER m** (REDEFINED entries 229/231) | option-value steepness `m·γ` at every strike; m=1=plain v24; bigger m ⇒ steeper everywhere AND trade lands further out (`θ_tx=mode·(chosen/mode)^m`); wings = exact power-laws of exponent m·γ (A5 preserved, no floor). **SUPERSEDED:** the old "δ/τ rounds the ATM elbow, wings frozen at γ" and the position-dependent `√(τ²+u²)` lens — no elbow-rounding, no flat-top/cusp. (Historical δ/(W)/τ kurtosis notes retained in `notes/` as superseded.) |
| 4 | **Carry** `P = Ny/Nx`, `u = log(price) − log P` | Load-bearing coordinate; raw-u breaks the gauge structure — the gauge coord s=u−μ is forced. |
| 5 | **Rebase** (P→P/r, θ→θ/r, anchor w=½) | Degree-0 gauge; rebase covariance holds in sNorm, NOT raw (x,y); PH-6 proved legs. |
| 6 | **Pricing law** value ∝ S^(−γ), γ∈(1,4) | The one accuracy gate (G4); β=1 GH carries ONLY the put eigenfunction (call root leaves the strip — two-root symmetry is Gaussian-limit, not GH). |
| 7 | **ITM American smooth-pasting** | Settlement semantics (operator tier): S*=Kγ/(γ+1) call-side / K(γ+1)/γ put-side, bound by S-direction not wing tag; seam C¹ gate; |Γ|≤1 exact / >1 labelled approximation. |
| 8 | **Uniform strike registration** θ=sNorm(K) (v26c) | One mark on the curve across display/execution/chart; crossover@K for all γ; Finding-2 absorbed here. |
| 9 | **Funding** = slope-deviation vs w=½ anchor, **evaluated THROUGH THE LENS** (operator entry 232) | LOCKED mechanism, orthogonal to intrinsic; θ-swap flips its sign. **Operator-ruled entry 232: slope-deviation uses the lensed exponent ±g_loc=±m·γ + a lens-aware mark, so the kurtosis knob m re-scales funding BY DESIGN** — a through-the-lens read quantity (like pricing/settlement), NOT knob-independent. "Unchanged" in the motive = the mechanism, not the numeric value. **Entry 233: funding zeroes at the anchor (ray-coincides, no divergence), NOT at ATM — ATM-zeroing was a dead-√-kernel artifact, never a requirement.** |
| 10 | **Slippage basis** mpGeom = getMP_raw·e^(−ghMu) | % is basis-independent; $ = Layer-1 reserve-USD; THE gotcha lives here. |
| 11 | **Dollar / settlement pipe** (stage-2→3) | §6 HARD STOP if a new dollar path is needed; byte-identical guardrail in past passes. |
| 12 | **THE gotcha:** getMP_raw is a price coordinate, NOT the slope | |dy/dx| = getMP_raw·e^(−ghMu); a price/slope conflation passes every self-consistency gate. |
| 13 | **Solvency boundary** | B1 real floor = operator ship-gate; port/funding is necessary-never-sufficient (PH-4b); κ extrinsic. Don't let any note imply geometry closes solvency. |
| 14 | **Esscher tilt / latent rapidity group** | Trade = parameter translation; GH conserves NO X·Y-product invariant — never describe the conserved object as a CPMM analogue. **Live-curve note (2026-06-14, skeptic-CLEAR `a00a14ea`):** distinguish two things — *trade* is a translation of the natural parameter (this row); the *kurtosis knob m* is a **DILATION** (γ→m·γ), **NOT an Esscher tilt** (a tilt would be a translation γ→γ−h with h=(1−m)γ depending on γ, so not a fixed tilt). The m-knob's natural home is thermal (inverse-temperature of the option-value **wing law**), not an Esscher tilt — see feature item #3 + `notes/research/LENS_NATURAL_HOME_2026-06-14.md`. |
| 15 | **File-safety gate** (blobs, splices, script blocks) | Process item, but "the analysis implies an engine edit" must reckon with it; blobs never enter context. |
| 16 | **Warp-with-trades** (operator, 2026-06-10, entries 10/14/16 verbatim) | **RULED + FULLY SPECIFIED (entry 16): "yes its w that the trade changes (while x and y also change to be faithful to actual reserves, refer the paper) and that warps it."** Reference spec = the paper's Trade Formula: post-trade (x′,y′,w′) with α=x·w and β=y·(1−w) individually conserved, w=α/x derived; paper line 33 headline: "Trades skew the AMM curve instead of moving the reserves point along it." Kurtosis knob stays static (vol-set, entry 14 #3). ⚠ OPEN-UNIMPLEMENTED: the current GH engine moves a point on a fixed curve (code-verified) — it does NOT implement the paper's core trade mechanic. Build target sequenced AFTER the engine-faithfulness pivot (ruling 1). How the paper's w-warp trade rule composes with the GH/kurtosis geometry = the design question for that build — UNDECIDED, operator-tier. Every curve note must disposition this item (skeptic gate item 5; silence = flag). **⚠ UPDATE 2026-06-11 (HEAD v27, skeptic #14-amend + foundation pass):** v27 IMPLEMENTS the strong-form warp as a TRANSFORMATION (α/β conserved, unique φ-recenter, curve reshapes) — BUT it warps at **SPOT** (`tradeUpdate(s,dy)` takes no strike arg) ⇒ **strike-INDEPENDENT.** The PAPER warps each leg at its **ray∩curve trade point**, continuously ⇒ **strike-DEPENDENT** (`dφ/dy=(β/y²)/w′(u)`; (W) generalisation VET-PASS). So #16 is **PARTIALLY met: transformation YES, trade-point ANCHORING = OPEN/LIVE GAP.** Fix = anchor at the trade point (operator-tier, unbuilt); gate (g) in `wcurve_selfcheck.js` documents the gap; (α,β)-flow-confinement lemma [needs-Aristotle]. Disposition label for notes: "transformation-faithful, anchoring-OPEN" — never "warp faithful" unqualified. |

## Maintenance
Owner: manager (edits on operator direction or when a locked decision changes). The skeptic FLAGS
inventory staleness too — if a note legitimately needed an item this list lacks, that's a
FLAG-PROCESS against the inventory itself.

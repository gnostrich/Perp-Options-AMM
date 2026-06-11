# Canonical feature inventory — the skeptic's checklist

_Created 2026-06-10 (operator-directed). This is the list of load-bearing structures that every
brainstorm / design note / spec touching the curve, invariant, settlement, or economics MUST
explicitly disposition. The skeptic audits notes against this file; a silently absent item is a
FLAG-OMISSION. Keep this file short and current — it is a lens, not an encyclopedia._

## ⭐ The motive (one breath)
**A curve-warp AMM grown out of Balancer, whose purpose is a kurtosis knob — everything else
stays the same.** Balancer `x^w·y^(1−w)=k` is the base; the position-dependent weight is the
warp; the knob `τ` rounds the ATM elbow with wings staying exact power-laws; carry/rebase,
value∝S^(−γ), ITM smooth-pasting, funding, and the dollar pipe are **unchanged**. The
curve/invariant decision is the operator's. (⚠ How the GH engine relates to the proposed
τ-family is OPEN — the "GH = one setting, τ≡δ" identity is BROKEN, item 2 below; this paragraph
previously carried it, corrected 2026-06-10 per skeptic stock-take §4.1.)

## Disposition rule
Every in-scope note carries a line per item: **Considered** (analyzed in the note) / **Changed**
(the note proposes altering it — escalation tier!) / **Excluded(why)** / **N-A(why)**. No silent
absences.

## The inventory

| # | Feature | Why load-bearing (one line) |
|---|---------|------------------------------|
| 1 | **Balancer base** `x^w·y^(1−w)=k` | The family's exact base; Gaussian/Merton slice; = δ→∞ limit (NOT δ→0 — that's Laplace). |
| 2 | **The curve warp** (position-dependent weight) | The engine's defining move — GH realizes it via the latent SCORE. ⚠ CORRECTED 2026-06-10 (skeptic, manager-verified): a clean closed-form invariant DOES exist for the weight-profile family (`x^{w_mid}·y^{1−w_mid}·e^{−(Δw/2)√(τ²+ln²(y/x))}=k` — the old "none exists, proved structurally" is FALSE), and "GH = one (W) setting, τ≡δ" is FALSE at curve level (engine w_eff vs ln(y/x) non-monotone ⇒ not a (W) member). Kernel-in-SCORE ≠ kernel-in-WEIGHT. |
| 3 | **Kurtosis knob τ** (GH kernel scale δ plays this role in-engine) | The project goal; ATM-elbow rounding, asymptote-respecting (survived attack); role split convexity=w_mid / skew=Δw / kurtosis=τ; sign gotcha: latent leptokurtic vs pushforward platykurtic. ⚠ β=1 caveat (skeptic): published kurtosis numbers / the [0,3] range are the β=0 symmetric slice; the engine pin β=1 gives skew +0.92, excess kurt 3.285. |
| 4 | **Carry** `P = Ny/Nx`, `u = log(price) − log P` | Load-bearing coordinate; raw-u breaks the gauge structure — the gauge coord s=u−μ is forced. |
| 5 | **Rebase** (P→P/r, θ→θ/r, anchor w=½) | Degree-0 gauge; rebase covariance holds in sNorm, NOT raw (x,y); PH-6 proved legs. |
| 6 | **Pricing law** value ∝ S^(−γ), γ∈(1,4) | The one accuracy gate (G4); β=1 GH carries ONLY the put eigenfunction (call root leaves the strip — two-root symmetry is Gaussian-limit, not GH). |
| 7 | **ITM American smooth-pasting** | Settlement semantics (operator tier): S*=Kγ/(γ+1) call-side / K(γ+1)/γ put-side, bound by S-direction not wing tag; seam C¹ gate; |Γ|≤1 exact / >1 labelled approximation. |
| 8 | **Uniform strike registration** θ=sNorm(K) (v26c) | One mark on the curve across display/execution/chart; crossover@K for all γ; Finding-2 absorbed here. |
| 9 | **Funding** = slope-deviation vs w=½ anchor | LOCKED, orthogonal to intrinsic; θ-swap flips its sign — must not be touched by mark/strike changes. |
| 10 | **Slippage basis** mpGeom = getMP_raw·e^(−ghMu) | % is basis-independent; $ = Layer-1 reserve-USD; THE gotcha lives here. |
| 11 | **Dollar / settlement pipe** (stage-2→3) | §6 HARD STOP if a new dollar path is needed; byte-identical guardrail in past passes. |
| 12 | **THE gotcha:** getMP_raw is a price coordinate, NOT the slope | |dy/dx| = getMP_raw·e^(−ghMu); a price/slope conflation passes every self-consistency gate. |
| 13 | **Solvency boundary** | B1 real floor = operator ship-gate; port/funding is necessary-never-sufficient (PH-4b); κ extrinsic. Don't let any note imply geometry closes solvency. |
| 14 | **Esscher tilt / latent rapidity group** | Trade = parameter translation; GH conserves NO X·Y-product invariant — never describe the conserved object as a CPMM analogue. |
| 15 | **File-safety gate** (blobs, splices, script blocks) | Process item, but "the analysis implies an engine edit" must reckon with it; blobs never enter context. |
| 16 | **Warp-with-trades** (operator, 2026-06-10, entries 10/14/16 verbatim) | **RULED + FULLY SPECIFIED (entry 16): "yes its w that the trade changes (while x and y also change to be faithful to actual reserves, refer the paper) and that warps it."** Reference spec = the paper's Trade Formula: post-trade (x′,y′,w′) with α=x·w and β=y·(1−w) individually conserved, w=α/x derived; paper line 33 headline: "Trades skew the AMM curve instead of moving the reserves point along it." Kurtosis knob stays static (vol-set, entry 14 #3). ⚠ OPEN-UNIMPLEMENTED: the current GH engine moves a point on a fixed curve (code-verified) — it does NOT implement the paper's core trade mechanic. Build target sequenced AFTER the engine-faithfulness pivot (ruling 1). How the paper's w-warp trade rule composes with the GH/kurtosis geometry = the design question for that build — UNDECIDED, operator-tier. Every curve note must disposition this item (skeptic gate item 5; silence = flag). |
| 17 | **LP liquidity port** `Store.liquidity(D)` / spec §2.13 liquidity(Σ,λ) | Pool-state WRITER missed by the first checker closure (skeptic verdict #11, 2026-06-11): deposit/withdraw must rescale reserves along the SAME curve (I_LP1) — mark, w, τ, registration all unchanged; any liquidity op that reshapes μ is non-conforming. Checker row 20 / CHK-8 (queued). |

## Maintenance
Owner: manager (edits on operator direction or when a locked decision changes). The skeptic FLAGS
inventory staleness too — if a note legitimately needed an item this list lacks, that's a
FLAG-PROCESS against the inventory itself.

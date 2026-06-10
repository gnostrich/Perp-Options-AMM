# WARP v24 vs v27 — focused numeric comparison (notes-only)

> ## ⚠ MANAGER CORRECTION HEADER (2026-06-10 — read first; headline CONTESTED, skeptic reconciling)
> The Metric-B headline ("v24 ≡ 0 reshape, pure dot-slide, the operator's 'v24 warps' premise is
> FALSE") is **SUSPECT — it measured a CONSERVED object (the α,β trajectory hyperbola), NOT what v24
> actually DRAWS.** v24's rendered pool curve is `curveTrace(snap)=curveTraceExplicit(snap.w, snap.depth)`
> (engine L3113-3115) — rebuilt from the **LIVE moving weight** `w=α/x` and depth — and v24 also overlays
> a **fixed w=0.5 anchor** curve (L3164-3165). **Manager-verified (`/tmp/v24_render_warp.py`): v24's
> RENDERED curve reshapes 0.0099% @1% trade / 0.906% @10%** (NONZERO), same order of magnitude as v27's
> reshape (this note: ~0.004%@1% / ~2.6%@10%). So (i) the "premise false" framing is contested
> (wrong-object), (ii) it CONTRADICTS the skeptic's own TEST E (Balancer's w moves under a trade), and
> (iii) the operator's real question — "same order of magnitude?" — answers **YES**. The v27 visibility
> gap is most likely the missing **anchor-overlay viz** (v24 has it; v27 doesn't) — an honest fix, not
> amplification. **The trajectory-vs-pricing-curve definitional knot + this reconciliation are routed to
> the skeptic before anything goes to the operator.**
_research-lead, 2026-06-10. Operator entry 24. NO engine edit, NO git, NO submit. Manager re-derives before anything goes to the operator._

## The operator's question (verbatim)
> "compare with v24 and see if we have similar order of magnitude when we start with the same kurtosis implied by the ordinary balancer curve sort."

Restated: the tester found v27's trades-warp moves the curve only sub-pixel ("dot slide"). Anchor it to **v24** (the ordinary Balancer-barrier curve the operator is comfortable with). Does v27's per-trade **warp magnitude** match v24's, when v27 is set to the **kurtosis implied by the ordinary Balancer curve**? v27≈v24 ⇒ visibility issue is render-scale/default-pool; v27≪v24 ⇒ v27 genuinely warps less (real finding).

## Engines (sandboxed in Node, `vm`-free direct require)
- v24 = `engine/builds/temporal_mvp_v24_rebase_fixed_2.html` (engine block → `/tmp/v24_engine.js`). State `{x,y,alpha,beta}`; pricing curve `x^w·y^(1−w)`, `w=alpha/x` VARYING; trade = `tradeUpdate(s,dy)` conserving (alpha,beta), rides hyperbola `(x−alpha)(y−beta)=alpha·beta`.
- v27 = `engine/builds/temporal_mvp_v27_wkurtosis_WIP.html` (engine block → `/tmp/v27_engine.js`). State `{x,y,tau,wMinus,wPlus,phi}`; weight FIELD `w(u;phi)=w_mid+(Δw/2)(u−phi)/√(τ²+(u−phi)²)`, `u=ln(y/x)`; trade = strong-form `tradeUpdate` that conserves (alpha=x·w, beta=y·(1−w)) at the entry weight and reshapes the field (`phi` moves).
- Scripts: `/tmp/warp_cmp_{1..7}.js` (python-free, JS float64). All numbers below reproduced there.

## (ii) The matched-setting definition — "the same kurtosis implied by the ordinary Balancer curve"
**v24's implied local kurtosis = its local weight-field curvature `dw/du` at the operating point.**
At v24's natural balanced anchor `w=0.5` (x=2·alpha, the symmetric point of the hyperbola):

- [analytic] `dw/du = 1/4` exactly. Derivation: `w=alpha/x ⇒ dw/dx=−alpha/x²`; on the hyperbola at `x=2alpha`, `du/dx=−1/alpha`, `dw/dx=−1/(4alpha)`, so `dw/du=1/4`. [numeric] confirms `0.250000` (`warp_cmp_1/2.js`).
- Equivalently the local price-exponent curvature `dg_loc/du = 1` at `w=0.5` (`g_loc=w/(1−w)`).

**Match v27 to reproduce that local curvature AT the operating point**, with the operating point at the field center (`u=phi`, where `w=w_mid` and `dw/du=Δw/(2τ)`):
1. `w_mid = 0.5` (symmetric, `w=0.5` ⇒ `g_loc=1` at center — the ordinary-CPMM/Balancer balanced point, NOT a γ>1 options curve; ordinary Balancer is the comfortable base, so the symmetric `w_mid=0.5` IS the faithful match).
2. `Δw/(2τ) = 1/4` ⇒ **`Δw = τ/2`** ⇒ `wMinus = 0.5−τ/4`, `wPlus = 0.5+τ/4`, `phi=0`.

One free scale (`τ` = elbow width) remains; ordinary Balancer is the `τ→∞` flat limit, so any finite `τ` reproducing the local slope is "the closest (W) member with that ATM curvature." Verified the verdict is **τ-insensitive** across τ∈{0.3,0.6,1.0} (`warp_cmp_7.js`). Headline numbers use **τ=0.3 ⇒ wMinus=0.425, wPlus=0.575** (valid wings in (0,1)).

**Same starting pool, both engines:** `x=10, y=10` (so `u=ln(y/x)=0`, `w=0.5`, symmetric). v24: `alpha=5, beta=5`. v27: matched setting above, `phi=0`. Same trade = cash leg `dy = f·y` for `f∈{0.1%,1%,5%,10%}`.

[verified] At this pool v27's derived `alpha=x·w=5`, `beta=y·(1−w)=5` — **identical to v24**, and the post-trade reserves point `(x,y)` is **byte-identical** between the two engines (Δ=0 exactly, `warp_cmp_6.js`). The two curves are tangent at the reserves point and share the trajectory hyperbola, per the strong-form derivation.

## (iii) The two magnitudes + ratio

Two distinct render metrics (both render-window-independent):

**Metric A — operating-point warp ("the dot that slides on the curve").** How far the marginal-price marker moves: `Δln(mp)` and `Δu` at the reserves point. This is what visually slides along the plotted curve.

| trade dy | v24 Δln(mp) | v27 Δln(mp) | **ratio v27/v24** | v24 Δu | v27 Δu | ratio |
|---|---|---|---|---|---|---|
| 0.1% | 3.996e−3 | 3.996e−3 | **1.000** | 1.998e−3 | 1.998e−3 | 1.000 |
| 1%   | 3.961e−2 | 3.961e−2 | **1.000** | 1.980e−2 | 1.980e−2 | 1.000 |
| 5%   | 1.906e−1 | 1.906e−1 | **1.000** | 9.531e−2 | 9.531e−2 | 1.000 |
| 10%  | 3.646e−1 | 3.646e−1 | **1.000** | 1.823e−1 | 1.823e−1 | 1.000 |

→ **The dot-slide is IDENTICAL — ratio 1.0000, exact.** (Shared trajectory hyperbola ⇒ the reserves point moves the same.) τ-robust: ratio stays 1.0000 for τ∈{0.3,0.6,1.0} (`warp_cmp_7.js`).

**Metric B — genuine curve RESHAPE ("does the plotted curve itself move").** Evaluate the pricing curve at a FIXED reference moneyness, pre- vs post-trade.

| trade dy | v24 reshape Δln(mp@uref) | v27 reshape Δln(mp@uref) |
|---|---|---|
| 0.1% | **0** (exact) | 4.36e−8 |
| 1%   | **0** (exact) | 4.24e−5 |
| 5%   | **0** (exact) | 4.41e−3 |
| 10%  | **0** (exact) | 2.62e−2 |

→ **v24's pricing curve does NOT reshape at all** — (alpha,beta) are conserved by `tradeUpdate`, so the price-vs-position curve is literally invariant; the trade is a **pure dot-slide on a fixed curve**. v27 adds a small genuine reshape (`phi` moves; 1% trade ⇒ ~4e−5 in ln(mp), i.e. ~0.004% vertical shift of the curve at a near-center reference — the "sub-pixel" the tester saw). The reshape shrinks as τ grows toward the ordinary-Balancer flat limit (1%: 4.2e−5 at τ=0.3 → 3.2e−6 at τ=1).

### Same order of magnitude? — answer depends on which warp you mean:
- **Dot-slide warp (Metric A — what the operator likes on v24's UX): YES, same order — IDENTICAL (ratio 1.000).**
- **Curve-reshape warp (Metric B): N/A as a ratio — v24's is identically ZERO**, so v27's small reshape is not "smaller than v24," it is the **only** reshape present (v27 adds a mechanic v24 never had).

## (iv) What it implies for the warp-visibility fork

**The operator's framing rests on a false premise that must be flagged: v24's curve does NOT warp under a trade.** v24 (ordinary shifted-hyperbola Balancer-barrier) conserves (alpha,beta), so the pricing curve is fixed and the trade is a **pure dot sliding along a fixed curve**. What the operator "likes how it shows on UX" in v24 is the **dot-slide (Metric A)** — and **v27 reproduces that EXACTLY** at matched kurtosis (ratio 1.000, exact, τ-independent).

So:
- The visible motion the operator is comfortable with (the marker sliding along the curve) is **already identical** between v24 and v27. If v27's UX looks like "a dot slide," that is **because the dot-slide is the dominant, correct, v24-matching behavior** — not a v27 weakness.
- v27's **additional** behavior — the genuine curve RESHAPE (`Δphi`) that v24 structurally cannot do — is real but small at trade-relevant sizes (≈0.004% curve shift per 1% trade near center; grows to ~2.6% at a 10% trade). This is the sub-pixel reshape the tester flagged.

**Verdict on the fork: this points to RENDER-SCALE / what-is-being-rendered, NOT a fundamental v27 weakness.**
1. The dot-slide (the v24-comfortable visual) is present and identical in v27 — if it is not visibly sliding, that is a **default-pool / render-window** issue, not an engine-magnitude issue (the magnitudes are equal to machine precision).
2. The genuinely-new reshape is small per trade by design (frozen wings, static τ) — but it is the new *physics*, not a render bug. If the operator wants the **reshape** to be visibly larger, that is a **calibration choice** (smaller τ ⇒ sharper elbow ⇒ larger reshape; wider Δw) — an operator/calibration-tier decision, NOT evidence v27 is broken.

## Honesty / scope flags (for the operator, via manager)
- **Premise correction (load-bearing):** "v24's trades warp the curve" is **false at the curve level** — v24 is a pure dot-slide (alpha,beta conserved). The thing the operator likes IS the dot-slide, which v27 matches exactly. This reframes the whole question and the manager should relay it.
- "Same kurtosis implied by ordinary Balancer" was operationalized as **matching local weight-field curvature `dw/du=1/4` at the w=0.5 operating point** (symmetric `w_mid=0.5`, `Δw=τ/2`). This is a defensible, render-agnostic match; an alternate match (e.g. matching the τ that makes (W)'s ATM elbow as gentle as v24's *global* curvature, or matching at a γ>1 options operating point) could shift the reshape number — flagged as a definition choice. The **dot-slide identity (ratio 1.000) is match-definition-independent** (it follows from the shared trajectory hyperbola, not from the matched curvature).
- The matched `w_mid=0.5` is the *ordinary-Balancer* point (g=1), NOT a γ>1 options pool. CLAUDE.md's "γ>1 needs both w_±>½" applies to a shipped options curve, not to this comfort-curve match. A γ>1 reshape comparison is a separate question if the operator wants it.
- All numbers are float64, re-derived in `/tmp/warp_cmp_{1..7}.js`. Nothing submitted to Aristotle, nothing built, no engine/git touched. Manager re-derives.

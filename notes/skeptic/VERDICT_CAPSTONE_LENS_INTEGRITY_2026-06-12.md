# VERDICT #34 — CAPSTONE lens-integrity sweep (operator entry 111, 2026-06-12)

Operator (verbatim, history/operator/2026-06-10_kurtosis-curve-family-brief.md entry 111):
> "yes, also please check everything else where there's a lensing thing queries etc. amm tx
> funding .... i really want that theres no integrity compromises, skeptic"

Build: `engine/builds/HEAD_temporal_mvp_v28_lens.html`. Audited working tree
md5 `7e1ae39baa00fda087033174cfc652b8` (committed `989752294…` + the parallel one-line τ
display-refresh wire; diff confirmed below). Read-only; every number re-derived in a fresh Node
vm sandbox of the live `<script id="engine">`.

## VERDICT: PASS — INTEGRITY INTACT. No compromise found. No halt.
Every lens touchpoint reads the SAME single reciprocal-sNorm basis for the same strike; the pool
executes byte-identical plain v24; the lens is never inverted; no NaN/Inf path; solvency
markLensed∈[0,1] everywhere. The lens_selfcheck gate (23/23) covers each touchpoint. The two
items that are raw-not-lensed (payoff-projection chart, perp-slice P&L) are correct exclusions,
not leaks.

## Touchpoint-by-touchpoint table

| # | Touchpoint | Code site | Coord / basis | Verdict |
|---|-----------|-----------|---------------|---------|
| 1 | Pricing/option-value chart (chart-2) | drawState L3572-3585 | `Engine.gLoc(poolForLens,θ,τ)` + `Engine.markLensed(wing,θ,sNorm,g)`, mode=getSNorm | **CLEAN** — shared helpers, reciprocal mode, display-clamped [0,1] |
| 2a | AMM tx — sizing value == display value | legPrice L1722 (W1/W2); preview L3885-3892 (C7) | both `Engine.legPrice` lensed, getSNorm | **CLEAN** — V_buy/V_sell==1.0 exact (no open-vs-size split) |
| 2b | AMM tx — pool byte-identical to v24 | tradeUpdate/rebase/arbitrageToOracle L1679/1691/1702 | n/a (pool) | **CLEAN** — extracted + diffed vs `temporal_mvp_v24_rebase_fixed_2.html`: byte-IDENTICAL (387/96/314 chars) |
| 2c | AMM tx — forward-read-only | whole file | n/a | **CLEAN** — zero `inverse/bisect/solve/goalseek/newton/while`-loop near the lens; helpers pure-forward |
| 3 | Funding ±g_loc | fundingPerStrike L2175-2183 | g+mark at getSNorm; price-coord S only in `(S−1)/S` | **CLEAN** — f→0 ATM, →γ wings, sign call/put = −/+ (gate 5a/5b/5c) |
| 4 | Settlement/close — both legs same coord | closeBand L2057-2093; markEff L1915-1918; legValueUnified L1923 | settled leg legValueUnified(s)+OTM leg legPrice(s), both getSNorm; sNorm0 (price) regime-only | **CLEAN** — MUST-APPLY-A from #30 implemented; smooth-paste continuous incl g<1 (gate 4a/4b/8.5b) |
| 5 | Portfolio/equity/P&L | pfComponents L4200-4234 (W6); dollarFigure L4295 | option legs lensed at getSNorm; perp slice NOT lensed | **CLEAN** — W8 boundary held (#31); lensed value × un-lensed equity = MULTIPLY, not mixed sum |
| 6 | Live-slippage path | executeBand L1857-1888; τ-wire L2727 | slippage from actual pool moves; sized by lensed V | **CLEAN** — s_band 0.22%→0.54% as τ 0.05→3 (lensed V grows); V_buy/V_sell==1.0; preview & exec same helper |

## THE integrity questions — each ruled (re-derived)

1. **Any layer reading a DIFFERENT basis than another for the same strike (v27-class leak)? NO.**
   Decisive structural reason: every lens helper (`gLoc`, `lensU`, `markEff`, `markLensed`-via-
   `legPrice`) recomputes `getSNorm(state)` ITSELF — there is no externally-injected spot/mode to
   mismatch. The only external argument is `theta` (the registered ray, the same arg raw `mark`
   takes). Re-derivation: for w=0.7, τ=0.3, an OTM call ray, `legPrice.V == markEff ==
   direct markLensed` to BIT-IDENTITY (0.04031432995136933 all three). The price-coordinate
   `sNorm0` in closeBand (L1999) and `S` in funding (L2176) feed ONLY the regime/leg-pick test and
   the `(S−1)/S` price-deviation factor — never a lens call. The #30 MUST-APPLY-A hazard (price-
   coord ray reaching the lens) is closed by self-sourcing.

2. **Anything lensed that shouldn't be, or raw that should be lensed? NO.**
   - Raw `Engine.mark` survives in `legFraction` (L3908-3917) → feeds `composedEquity` (L3927) →
     the payoff-PROJECTION chart over a swept hypothetical spot. This is the operator-EXCLUDED
     cosmetic payoff chart (#33, entry 101) — a forward projection, a different object from the
     live lensed pricing curve; NOT a value/sizing/settle path. Correct exclusion, tolerable
     display gap, not a leak.
   - Perp-slice `attribPnL`/`equityAtClose` (L4277-4280, closeBand L2132-2135) NOT lensed — the W8
     boundary (#31): it's a pure fractional perp price move, lensing it would be a category error.

3. **Settle-at-lensed solvent (markLensed∈[0,1]) and no-arb? YES.**
   Coupled sweep (w∈[.51,.95], τ∈[.05,10], strikes ±6 in u, both wings): markLensed range
   [4.68e-5, 1.00000000], NEVER >1, zero NaN. At exact ATM (g=0) markLensed=1 for both wings — the
   bounded flat-top elbow peak (sStar=θ, c·sNorm=1), ≤1 so solvent; the accepted degenerate reading
   (#30, entry 93#5). No-arb (round-trip) ruled pool-favourable in #30/#32 (not re-litigated).

4. **Lens EVER inverted (re-introducing blow-up/cap)? NO.** Zero inverse-lens / target-slope /
   iterative-solve helpers in the file. arbitrageToOracle is closed-form plain-Balancer, lens-free
   (gate 7a/7b). |dG|≤γ hard bound (h′∈[0,1]) — the cap-free property; the (ln K)³ divergence of
   the abandoned trade-point-anchoring path (#19) does NOT exist here because there is no root-find
   on a lensed quantity.

5. **Any NaN/Inf path? NO.** g=0 at ATM → markLensed finite (pow(Inf,0)=1, inclusive boundary,
   no γ_min floor needed, gate 4c); deep wings g→γ, markLensed→{4e-8 call, 0.998 put} finite;
   lensU NaN-loud only on bad mode/θ (never silently e^0).

## Gate coverage (lens_selfcheck.js, 23 checks) vs touchpoints — COVERED, no gap

- TP1 chart: (1)(2a)(2b)(3) g_loc law/ATM/wings/cap + (4a/4b/4c) markLensed continuity/NaN.
- TP2a sizing==display: (8.2)(8.7) open==settle one-helper; (8.3) UI pfComponents==engine.
- TP2b pool byte-id: (6)(6b) tradeUpdate δ=0 + 3-fn byte-identical source.
- TP2c forward-only: (7a)(7b)(8.8) no inverse-lens / arb lens-free / dy forward.
- TP3 funding: (5a)(5b)(5c) →0 ATM / sign / →γ wings.
- TP4 settle both-legs/coord: (8.1)(8.4)(8.5a)(8.5b) settled==N·mark / sNorm0 regime-only /
  steep-off-eq / ONE-ITM reciprocal hazard caught.
- TP5 portfolio basis: (8.3) cross-layer pfComponents==markEff.
- TP6 slippage/solvency: (8.6) ceiling≤1 no NaN; slippage itself is display arithmetic off
  byte-identical pool moves (covered transitively by 6/6b + behavioural smoke-pass).
No touchpoint is un-gated. (UI render/visibility is the tester smoke-pass's job, per the standing
UI-smoke gate — not a lens_selfcheck gap.)

## The parallel display-refresh wire — confirmed display-only, does NOT affect conclusions
git diff (working tree vs committed 989752294): exactly ONE line, the τ-input handler L2727:
`Store.setTau(v); + if(typeof previewBand==='function') previewBand(); if(typeof
render==='function') render(); + Viz.drawAll`. It adds redraw calls to already-existing display
routines so a τ change is reflected immediately (this is what makes the slippage display update
live). Touches NO lens helper, NO pool fn, NO value/sizing/settle formula. The lens architecture I
audited is byte-identical in committed and working-tree versions.

## Convergence-alarm: LOW (anti-convergence). I attacked the basis-split, the inversion, the
solvency ceiling, and the slippage consistency independently and each held by re-derivation, not
narration. The single design move that earns the PASS — every lens helper self-sourcing
getSNorm(state) rather than accepting a passed-in spot — is the structural eliminator of the
v27-class leak the operator was worried about, and it is real in the live code.

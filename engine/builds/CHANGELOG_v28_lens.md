# CHANGELOG — v28 polar-lens line (off the v24 base)

_Feature-level, plain English. Build line: plain Balancer pool (v24) + a polar lens in the query/write
layer. Behavioral detail + per-build verdicts live in `DIFF_LEDGER.md` (tester-owned); the math spec is
`specs/SPEC_v24_lens_BUILD_2026-06-11.md`. This file = the human "what changed and why" record._

## Base
- **From:** `temporal_mvp_v24_rebase_fixed_2.html` (plain weighted-Balancer pool, w=α/x trade mechanic).
- **Size of the edit:** ~285 changed/added lines over ~4,300 (≈6%), 47 hunks. The 2 image blobs and all 3
  script blocks preserved. **The AMM core is byte-identical:** `tradeUpdate`, `arbitrageToOracle`, `rebase`
  unchanged (gate-verified, output delta 0). The lens never touches how the pool swaps.

## The idea in one line
The Balancer curve is unchanged; a **polar lens** sits between you and the curve. Everything **read from**
it (pricing, option-value chart, settlement, funding, portfolio value) and **written to** it (trades) goes
**through the lens** — which implements vol / steepness / kurtosis on the option-value view. The lens is a
multiplier on the curve's steepness, running 0 at the 45°-tangent point (the mode) up to ×1 (full natural
steepness) in the wings; one static knob τ sets its width.

## What changed, feature by feature

| # | Feature | Status | Source |
|---|---------|--------|--------|
| F1 | **Polar lens helpers** — `gLoc`/`markLensed`, lensed local exponent `g(K)=γ·d/√(τ²+d²)`, d = log-divergence from the live 45°-tangent point (sNorm coordinate) | DONE (S1) | entry 84/94 |
| F2 | **Option-value chart (chart 2) drawn through the lens** — flat top at the money, frozen power-law wings | DONE (S1) | entry 84 |
| F3 | **τ kurtosis/vol knob** — single static number stepper (no slider), redraws chart 2 live | DONE (S1; redraw FLAG-1 fixed) | entry 59/84 |
| F4 | **Funding through the lens** — v24's hardcoded ±2 → ±`g_loc(K)`; →0 at the money, →γ in the wings | DONE (S1) | entry 84/93#5 |
| F5 | **Settlement smooth-paste with strike-local exponent** — `S*=K·g/(g+1)`, value+slope continuous (the v24 ATM-jump fix, ported) | DONE (S1) | entry 85/93#6 |
| F6 | **Settle / record / value at lensed prices** — trade price, settlement payout, portfolio value, buy-leg sizing all use the lensed mark via one shared helper (no second basis) | DONE (S2) | **entry 96** |
| F7 | **Lens correctness gate** — `lens_selfcheck.js`, 23 checks (centred-on-tangent-point, symmetric, frozen-wings, cap-free, settle==lensed, cross-layer single-basis, pool-unchanged regression) | DONE | — |

## Verified properties (manager + skeptic + live tester)
- Lens centres exactly on the 45°-tangent point of the pool curve (y/x=(1−w)/w), for any steepness.
- No far-OTM blow-up / no strike cap: the reshape is bounded by γ for any lens intensity (multiplicative, not the old hyperbolic 1/w′). A dust trade moves the curve ~0.0001% at every strike incl. 4× (old curve: 39–105%).
- Round-trip is pool-favourable (trader loses ~2× slippage); no arbitrage; lens-neutral vs v24.
- Settle-at-lensed is solvent (lensed mark ∈ [0,1]) and no-arb under the one-helper rule.

## OPEN / pending (cleanup batch + warp assessment) — NOT yet in the promoted line
| Item | Type |
|---|---|
| ×oracle cash-readout inflation (inherited v24) | bug-fix (operator entry 96) |
| Anchor curve drawn off-scale | bug-fix (entry 96) |
| Stale-on-reject band preview | bug-fix |
| Payoff N_buy `state`→`state.pool` | bug-fix |
| lp-y-delta baseline; LIQ-PRICE | bug-fix |
| Close-screen number that looks trader-favourable (display only) | display-semantics |
| Payoff/P&L chart + strike marker still drawn on the unbent curve | display-on-lens (cosmetic) |
| Payoff x-range −90…+200% | feature IN (entry 98) |
| Naked-leg uncapped intrinsic deep-ITM | feature IN (entry 98) |
| Visible-warp stage assessment | scope |

## Build sequence (files retained for diff)
- `temporal_mvp_v28_lens_S1.html` — read lens (md5 `1ed8fe2d`).
- `temporal_mvp_v28_lens_S2.html` — + write/settle through lens (md5 `b53ace99`). `temporal_mvp_v28_lens_FINAL.html` (+cleanup C1–C9, md5 `989752294`) — **PROMOTED TO HEAD 2026-06-12 as `HEAD_temporal_mvp_v28_lens.html`** (operator entries 84/94/96/106; tester FINAL 27/27; v27 demoted, retained). **+ 1-line live-slippage-refresh wire 2026-06-12 (entry 111): the τ stepper now re-runs the band preview so slippage updates live when kurtosis changes — md5 989752294→`7e1ae39b`, pool byte-identical, gate 23/0.**


## 2026-07-02 — TRADE-POINT CONSERVATION (operator entry 339, go 377) — md5 `7015c22c` → `e148c9b7`
Spec (controlling): `specs/SPEC_tradepoint_conservation_2026-07-02.md`. Skeptic scope-gate:
`notes/skeptic/VERDICT_R6_overnight_scope_gate_2026-07-02.md`. Revert twin:
`temporal_mvp_v28_lens_reservepoint.html` (byte-copy of pre-build HEAD, md5 `7015c22c`).
- **Live trade path = the paper's Trade Formula at the trade point.** New `tradeUpdateAt(s, dy, ρ)`
  (ρ = θ_tx/mode, the tx-map's own mode read): conservation law applied at T = ray∩curve with the
  LOCAL pair α_T = x_T·w, β_T = y_T·(1−w); flows drawn from actual reserves; w′ = α_T/(x_T+Δx);
  global α,β re-derived — **they now MOVE on off-ATM trades, by design** (entries 14/16/339;
  inventory #16 anchoring fix, label flip PROVISIONAL pending operator ratification of the 5 spec
  FLAG pins). Exhibit engine-true: (10,10,½), ρ=4, dy=+1 ⇒ w′=11/21, Δx=−5/22, x′=215/22 (exact).
  ρ=1 reduces to the spot law (2.3e-16); `tradeUpdate`/`arbitrageToOracle`/`rebase` BYTE-IDENTICAL
  to v24 (spot trades and arb unchanged).
- **Frozen-ARC close.** New `revertArc`: each leg stores `arc = {dxA, dyA, dwA, oOpen}` at open;
  close applies the exact inverse (x−dxA·rr, y−dyA, w−dwA; rr = oNow/oOpen) ⇒ pool round-trips
  machine-exact, open→rebase→close == rebase(s₀,r) exact, intervening trades' moves kept. Legacy
  pre-arc bands fall back to today's **K_tx-first** close path (K_inner only for pre-R-218 bands).
- **Depth guard at the trade point:** cash-out capacity = w·y·ρ^w (put-side rays thinner,
  call-side deeper); reject message prints the tx-ray depth.
- **Preview animation per-leg** (draw layer only): framePool replays the frozen per-leg {dy, ρ}
  through `tradeUpdateAt` sequentially; s=1 lands exactly on the preview pool; degrades to a
  static draw when leg data is missing (never animates a wrong path).
- **Gates:** `lens_selfcheck.js` 16 → **24 PASS [HARD]** — CM8→**CM8-v2** (spot trio byte-id;
  11/21 exhibit HARD; ρ=1 grid; local-pair conservation at T; executeLeg routing) and
  CM6→**CM6-v2** (band arc round trip incl. w; single-leg ≤1e-12; rebase-interleaved;
  live-re-registration-leaks negative control; no-free-money Σ own dx/dy == 0 incl. an intervening
  spot trade). All new checks negative-controlled: the pre-build HEAD fails exactly the 8 new-law
  checks; 7 targeted engine mutants each red only the intended checks. `a16_atm_gate` 5 PASS.
  monolith lines (2)/(7) re-scoped **SPOT law only** (report-only).
- Tester live acceptance per spec §3.2 PENDING; DIFF_LEDGER entry keyed to inventory #16 owed.

## 2026-07-02 — CAPTION/COMMENT slice (same trade-point campaign, second slice) — md5 `e148c9b7` → `0e0a0062`
Strings/comments ONLY, zero behavior (7 surgical regions; engine numeric paths untouched; gates
re-run green lens 24 + a16 5). (1) **-TP339-CAPTION** (tester flag): Invariant Watch caption +
Pool State subtitle rewritten to the trade-point law — trades conserve the LOCAL pair (α_T, β_T)
at the trade point, global α, β MOVE on off-ATM trades BY DESIGN (entry 339); machine-epsilon
scoped to the ρ=1 paths (spot/arb/rebase) and open→close arc round-trips. (2) **R6 item 3** stale
comments: entry-289 vol direction corrected at the lens header and the m-knob state comment
(MORE volatile asset ⇒ LOWER m, fatter wings); closeBand barrier-era "mark() saturates at 1 …
IS the effective-strike substitution" paragraph rewritten to the lensed smooth-paste truth — the
v28 correction paragraph beneath it preserved (skeptic condition; CTO port source). (3) **R6
item 4 / 325-F** (operator entry 336): chart-2 unit toggle button "% of escrow unit" →
"fraction of escrow unit" + caption "% view"→"Fraction view" — the axis draws fractions
(0.25/0.50/…), not percent; DOM ids (`pricing-unit-pct`) and all values/axes untouched.

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
- `temporal_mvp_v28_lens_S2.html` — + write/settle through lens (md5 `b53ace99`). **Not yet HEAD; HEAD stays v27 `928cde1c` until the cleanup batch + warp + final smoke-pass.**

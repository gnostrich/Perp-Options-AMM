# Temporal MVP v5 — Working Note

## Status snapshot

### SHIPPED in v5.1 (current /mnt/user-data/outputs/temporal_mvp_composite_ray_v5.html)
- [x] Cross-wing architecture: sold leg + bought leg on opposite wings
  - Long trader: sold=call, bought=put
  - Short trader: sold=put, bought=call
  - Pool stays single shared state; cash bridge V_sell=V_buy across wings
  - Band record stores sold_wing + bought_wing explicitly
- [x] Barrier as primitive, spread as composite-ray composition
  - Outer blank ⇒ barrier (V = N·mark(θ_inner))
  - Outer present ⇒ spread (V = N·mark(θ*)·2sinh(δ), θ* = √(θ_i·θ_o))
  - Each leg independently barrier or spread
- [x] OTM check inside Engine.executeBand (single source of truth)
  - Per-leg, per-wing
  - Skips NaN outers (barrier legs)
  - openBand + previewBand both inherit
- [x] Fee on open only
  - Fee_btc = 0.0001 × N_input
  - Deducted from club.equity
  - Accumulated in state.fees_accrued (NOT pool — no AMM impact)
  - Pre-guard blocks if club.equity < Fee_usd
  - Preview mirrors guard
- [x] Slippage display
  - Per-leg s = |w_post/(1-w_post) ÷ w_pre/(1-w_pre) − 1|
  - Band-level s_band = (1+s₁)(1+s₂) − 1
  - Absolute, display-only, no trade adjustment
  - Reported in summary block + trade log
- [x] Summary block live
  - Slippage: live % + $ USD
  - Tx Fee: 0.0100 % + BTC amount + $ USD
- [x] BTC-primary input + portfolio
  - Notional input in BTC (oracle USD subline)
  - Buy quantity display in BTC ("← from $V_sell premium")
  - Portfolio: N (BTC), Value (BTC + $), Funding (BTC + $)
- [x] Viz: collapsed to θ* rays per leg
  - 2 rays per band total (1 on sold_wing graph, 1 on bought_wing graph)
  - Dot at θ*-ray ∩ hyperbola (the actual trade point)
  - No more 4-strikes-per-band noise
- [x] Mode pills (BAR / SPR) on each card + per-leg in portfolio
- [x] Audit strip collapsible (default collapsed → tall charts)
- [x] suggestStrikes barrier-first + cross-wing aware
- [x] Stepper sensitivity
  - band-notional: 0.001 → 0.01 BTC per click
  - strikes: 100 → 500 $ per click
- [x] Panel-height equalization
  - overflow-y: auto on .tab-panel.active
  - max-height = 720px (card) − 150px (header/nav) → ~570px scroll area
  - Bands subtab can have any internal content; chart column never stretches

### OPEN (small, fast)
- [ ] Per-field red border on OTM violation (UX polish; engine already rejects)
- [ ] Per-leg slippage signed values in audit strip (currently only band-level absolute in summary)
- [ ] Audit-strip label freshness — "V_sold = N·mark·2sinh(δ)" assumes spread;
      should adapt to mode (barrier: V = N·mark; spread: V = N·mark·2sinh(δ))
- [ ] Summary block tooltip text — "0 in current closed-form simulator" copy is stale
      now that slippage + fees are live

### DEFERRED to v6 (LP / Earn rework)
- [ ] LP deposits + withdrawals with leverage L
- [ ] Two-curve uniform scaling on deposits (1+s where s = D·L / V_total)
- [ ] Synthetic vs borrowed leverage semantics
- [ ] Perp-style LP liquidation rule
- [ ] LP P/L decomposition: known component = inverse of trader P/L, apportionable
- [ ] LP withdrawal of accrued fees from state.fees_accrued
- [ ] Funding on leveraged LP portion

### CLOSED (decisions locked, not revisiting)
- Fee mechanism: open-only, decoupled from AMM (counter, not pool inflow)
- Slippage: display-only, closed-form continuous limit already prices everything
- No sliders; bigger steppers solve the sim-sweep problem
- Same-wing 4-strike model from v4 dropped; cross-wing is canonical
- Audit strip stays collapsed by default (visualise objective)

---

## Architectural anchors (for fresh sessions or handoffs)

### Pool model
- Single shared pool: state = { x (BTC), y (USD), α, β }
- Balancer invariant: x^w · y^(1-w) = k, w derived = α/x
- Trades conserve hyperbola (x-α)(y-β) = αβ
- All Lean-proven identities (Aristotle, no sorry) apply per-leg, wing-agnostic

### Trade primitive (LOCKED)
- Barrier swap at single ray θ: V = N · mark(wing, θ)
- Spread: composite-ray reduction θ* = √(θ_i·θ_o), δ = ½log(θ_o/θ_i)
- Spread V = N · mark(wing, θ*) · 2sinh(δ)
- Both go through tradeUpdate(state, ±V) — single execution mechanism

### Cross-wing band semantics
- A band = sold leg + bought leg, each on its own wing
- Long trader: sold=call (cap upside), bought=put (floor downside)
- Premium from sold leg literally funds the bought leg (V_sell = V_buy enforced)
- Each leg independently barrier or spread

### Display contract
- All quantities BTC-primary, $ secondary (inline subline or column pair)
- Strikes stay in $ (familiar reference)
- Mode pills (BAR/SPR) on every leg surface
- Audit collapsed by default; trader strip + warnings always visible

### Engine module surface (v5.1)
- legPrice(state, wing, θ_i, θ_o, N) — dispatch barrier or spread
- executeLeg(state, legType, wing, θ_i, θ_o, N) — apply one leg
- executeBand(state, sold_wing, bought_wing, sold, bought, N_sell)
  - Includes OTM check, slippage calc, cross-wing dispatch
- closeBand(state, band, club) — symmetric close on per-leg wings
- isOTM(θ, wing, sNorm) — exposed for caller checks if needed
- isBarrier(outer) — predicate

---

## v11 slider history (for reference only — no longer planned)
v11 had qty/strike/kappa/lp-add/lp-remove sliders below number inputs.
Decided against porting in v5 — stepper sensitivity solves the same need
without height cost.


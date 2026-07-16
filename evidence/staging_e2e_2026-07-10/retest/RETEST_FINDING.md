# Retest after CTO upgrade (2026-07-10) — γ=2 landed, but a NEW divergence in option-value wings

## Config: the upgrade DID land
`/api/amm/marks` now reports **gamma=2, m=1, g_loc=2** (was gamma=1). Engine v28-lens, DB healthy.
So Factor 0 (set γ=2) is DONE.

## FINDING (candidate FLAG — manager-measured, skeptic-gating in progress)
**At γ=2, staging's option marks match the reference ONLY at ATM; the wings are LINEAR, not the
reference power-law.** Anchored on the γ=1 result (where staging matched `markLensed(wing,θ,1,g)` to
5.6e-17 over 40 strikes — so that IS the correct shared convention):

- **Staging put_mark = V_atm · θ** (exponent **1**, linear). Measured: `MAX |staging_put − V_atm·θ| = 2.2e-10`
  over 40 strikes → staging is exactly linear in θ.
- **Reference put = V_atm · θ^g = V_atm·θ²** at g=2 (`markLensed(put,θ,1,2)`; golden CM11: wing power-law
  `V(2ρ)/V(ρ)=2^(−g)`).
- They agree at θ=1 (ATM = **0.148**, golden ✓) and diverge away from it, up to **put Δ≈0.11, call Δ≈0.20**.

| θ | staging put | ref put (θ²) | staging call | ref call |
|---|---|---|---|---|
| 0.50 | 0.0741 | **0.0370** | 0.2963 | **0.5000** |
| 1.00 | 0.148 | 0.148 ✓ | 0.146 | 0.148 ✓ |
| 1.50 | 0.2222 | **0.3333** | 0.0988 | **0.0658** |

## What it means (if it survives the skeptic)
Staging applied the γ=2 **ATM level** (0.25→0.148) but the **wing exponent is still 1 (the γ=1 shape)** —
i.e. `g_loc=2` is reported but not used in the mark curve's steepness. The steepness knob doesn't shape
the option-value wings. This is **Factor 1 (markLensed / ITM prices)** — untestable at γ=1, now failing at γ=2.
The golden ITM constants ($66.67 exercise line = put value ⅓ at the seam; the CM11 wing power-law) would NOT
reproduce on staging as-is.

## Caveats (before this is called a staging bug)
1. Reference convention anchored on the γ=1 exact match — strong, but the skeptic should confirm
   `markLensed(·,θ,1,g)` is the faithful per-strike correspondence (not a coincidence at g=1).
2. `/api/amm/marks` might be a DISPLAY grid while the real pricing (bands/settlement) uses a different path —
   need to confirm the marks endpoint is the actual pricing, not a coarse display.
3. ATM is correct, so this is a wing-shape/steepness-propagation issue, not a total pricing break.

Evidence: `retest/marks_g2.json`, `retest/shape.js` (linear-fit 2.2e-10), `retest/retest_where.js` (per-θ diff).

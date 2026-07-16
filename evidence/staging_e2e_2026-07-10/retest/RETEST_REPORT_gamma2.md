# Post-upgrade retest (γ=2) — per-factor diff for CTO iteration — 2026-07-10

After the CTO pushed the upgrade, staging = **v28-lens, γ=2, m=1** (was γ=1). Reference = July-8 `5ce1a76c`
(md5-verified). This refreshes the per-factor "staging now" column at γ=2. Confidence tags: **skeptic-CLEAR**
= independently gated; **manager-measured** = my re-derivation, not yet skeptic-gated; **unverified** = couldn't test.

| # | Factor | Desired (5ce1a76c) | Staging now (γ=2) | Verdict |
|---|---|---|---|---|
| 0 | **γ config** | γ=2 | **γ=2** ✅ | **FIXED** (was γ=1) |
| 1 | **ITM/option-value wings** (`markLensed`) | wings = power-law θ^g (θ² at g=2); ATM 0.148 | ATM **0.148** ✅ but wings **LINEAR** `put=(4/27)·θ`, `call=(4/27)/θ` (exponent **1**, not g=2) → diverges up to put **0.11** / call **0.20** | ❌ **DIVERGES** (skeptic-CLEAR). `g_loc=2` reported but not used in wing steepness |
| 2 | **Trade-point warp** (`tradeUpdateAt`) | off-ATM trade MOVES global α,β | at γ=2 the band **MOVES** α,β (Δα=−2.2e-3, Δw=+0.0057) — **differs from the spot law** (which would keep α,β fixed) | ✅ **IMPROVED** — trade-point signature now present (was spot-conserving at γ=1). Exact magnitude vs reference **unverified** |
| 3 | **Steepness knob m** (`gLoc`) | m sweeps steepness | **can't set m** — `?m=3` ignored (server config, m=1 fixed) | ⬜ **UNVERIFIED** — need CTO to expose/set m |
| 3b | **m clamp [1,6]** (`setM`) | reject/clamp m∉[1,6] | can't set m → can't test | ⬜ **UNVERIFIED** |
| 4 | **Close (one rule)** (`closeBand`) | smooth, no ½-jump; payout=pre-trade value | close→**round-trip pool exact Δ=0** (w 0.5→0.5057→0.5); net_band_payout 7.7e-5 | ◐ **round-trip clean**; the "no-jump-across-strike" not directly probed (needs an ITM-adjacent close) |
| 5 | **Funding = ray-deviation** (`fundingPerStrike`) | nonzero on a **skewed** pool; formula `dev=|c·ln(K/mode)|` | on the skewed pool (w=0.5057), all funding fields read **0** — but at γ=2/m=1 the sold strike (θ=1.08) should give **dev≈0.038** | ⚠ **SUSPECT DIVERGE** (manager-measured) — funding not computing on skew; needs CTO confirm (could be the TBD placeholder) |
| 6 | **Spot law** (`tradeUpdate`) | unchanged v24 | ATM/spot trades still consistent; off-ATM now warps (F2) | ✅ (spot core intact) |
| 7 | **marks endpoint window** | seams visible | still **±50% (θ∈[0.5,1.5])** | ⬜ widen so seams/ITM visible |

## The two things for the CTO to fix next (iteration)
1. **F1 — the option-value wings are LINEAR, should be the power-law θ^g.** This is the headline. Staging
   applies the γ=2 ATM value (0.148 ✓) but the wing exponent stays 1. Fix: the per-strike mark must raise to
   `±g = ±(m·γ)` (`markLensed` uses `pow(·, ±g)`); harness **CM11** checks exactly `V(2ρ)/V(ρ)=2^(−g)`. Until then
   the ITM golden numbers ($66.67 exercise line, seam value ⅓) won't reproduce. **[skeptic-confirmed]**
2. **F5 — funding reads 0 on a skewed pool** where γ=2/m=1 predicts dev≈0.038 at the sold strike. Confirm
   whether the ray-deviation is being computed (or is still the TBD placeholder). **[manager-measured, verify]**

## Progress since the upgrade
- ✅ γ=2 set (Factor 0) · ATM value now correct (0.148)
- ✅ trade-point warp now active at γ=2 (Factor 2, α,β move — was spot-only at γ=1)
- ✅ round-trip close clean (Factor 4)
- ❌ still open: F1 wings (confirmed), F5 funding (suspect), F3/F3b need m access, F7 window

## Caveats
- All measured on `/api/amm/marks` + `/api/amm/status`; NOT confirmed whether band/settlement pricing shares
  the F1 linear-wing path. Staging is the CTO's Go port — outputs only, not source.
- F2 magnitude and F5 are manager-measured, not yet skeptic-gated; F1 is skeptic-CLEAR.

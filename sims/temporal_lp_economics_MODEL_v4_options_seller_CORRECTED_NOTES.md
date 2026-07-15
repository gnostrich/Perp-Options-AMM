# Model notes — `temporal_lp_economics_MODEL_v4_options_seller_CORRECTED.xlsx` (BRAINSTORM, non-core)

Auditor-corrected faithful model. Supersedes v3 (which the auditor found still subtly wrong). v3/v2 retained.

## AUDITOR VERDICT ON v3 (skeptic, Opus, premise-challenging brief) — v3 NOT faithful-enough; 3 structural fixes
1. **DOUBLE-COUNT (v2's error recurring):** v3 sold `book·G·IV²` as "premium" AND had a separate `funding_APR`
   line — for a **perpetual** these are the **same carry** (a perpetual has no upfront premium; the only
   continuous long→short flow IS funding). → **Fixed:** ONE carry line, no separate funding term.
2. **The knob `m` was missing from the gamma factor:** used `γ(γ+1)/2`; per CLAUDE.md §4 the lensed exponent
   is `g_loc = m·γ`, so it must be **`(mγ)(mγ+1)/2`** (at m=2: G=10, not 3). Dropped inventory #3 (the product's
   whole point) and reverted the entry-490 correction. → **Fixed:** `m` now in `G`.
3. **"IV" has no clearing mechanism** in a static-calibration perpetual AMM — `IV>RV` is an operator
   calibration / flow bet, not an automatic variance risk premium. → **Fixed:** relabelled `σ_cal` = the vol the
   curve is CALIBRATED to (a setting).

## The corrected model (per $ equity, annualized) — ONE carry line
```
G = (m·γ)(m·γ + 1)/2                              # lensed gamma factor of value∝S^(-mγ); m is IN it
options_net = book · G · (σ_cal² − RV²)          # funding-carry(at σ_cal) MINUS realized gamma bleed
BASE = options_net + fee_bps/10000·turnover·days·book − (book−1)·borrow_APR − hedge_fee_cost + book·hedge_funding_APR
RESTAKED = BASE + HLP_base_APR·(1 − HLP_tail_haircut·RV)
```
LP profits when **realized vol < the vol it calibrated the curve to**; loses in spikes. **`m` amplifies both**
(bigger G). Verified: G(m=1)=3, G(m=2)=10; scenario RV=60%,σ_cal=70%: m=1 → +57%, m=2 → +148%.

## STILL OPEN (do not over-read magnitudes)
- The **carry magnitude** `book·G·σ_cal²` assumes funding = the theoretical fair carry; the **actual funding
  law is update-2 (undecided)**. `LP_leverage` normalization is load-bearing. Magnitudes ILLUSTRATIVE.
- `σ_cal > RV` is an operator calibration/flow bet, not an automatic VRP. Reduced-form sketch, not a backtest.

## Recurring pattern the auditor logged (worth heeding)
Each revision fixed the prior proxy but adopted a NEW familiar-instrument proxy (spot AMM → dated-option
seller). The faithful object is the **perpetual** option where **premium IS funding** — v4 finally models that.


## LEVERAGE (operator entry 495)
The leverage knob is **`LP_leverage`** (renamed from `book_per_equity`): option value short per $ of equity — 1.0x = unlevered. It multiplies `options_net` and fees, with `borrow_APR` financing the `(L−1)` leg. **HLP stays additive at margin, NOT levered** (entry 486). Verified: at σ_cal=70%, RV=60%, m=1 → 1.0x base +57%, 2.0x base +108% (options edge ×2 minus financing); HLP adds a flat +10% either way.

# VERDICT (skeptic, #30) — R6 scope-gate + math audit, §11 WRITE/SETTLE-THROUGH-LENS

**Date:** 2026-06-12 · **Artifact:** `specs/SPEC_v24_lens_BUILD_2026-06-11.md` §11 (Stage-2 write/settle
through lens) · **Build under audit:** `engine/builds/temporal_mvp_v28_lens_S1.html` (md5 `1ed8fe2d`)
· **Mandate:** operator entry 95/96 build-oversight; manager's own solvency spot-check FAILED (wrong
signature) ⇒ no-arb/solvency rests on me. **READ-ONLY.** Scripts `/tmp/t1..t14_*.js`, real engine
signatures (`markLensed(wing,theta,sNorm,g)`, `gLoc(state,theta_K,tau)`).

## DECISION: **CLEAR-TO-BUILD with 1 HALT-CLASS must-apply + 2 record flags.** Solvency and no-arb
**do NOT break** — neither is operator-tier. The one blocker is a concrete WIRING under-specification
in the settlement path (§11.4-caveat) that, if the intern follows the spec's recommendation literally,
produces the exact forbidden 4–8× basis split the spec claims to close. It is fixable by a precise
wiring rule (below) without operator input. Not a FLAG-HALT to the operator.

---

## CLAIM 1 — SOLVENCY (`markLensed ∈ [0,1]`): **PASS — attacked, held.**
I sandboxed the REAL `markLensed(wing,theta,sNorm,g)` (NOT the manager's wrong signature) and swept:
- **Direct sweep** (`/tmp/t1`): wing×{g∈[0,50]}×{θ}×{sNorm over 12 decades} → range **[1.8e-5, 1.000]**,
  zero NaN, zero non-finite, max never exceeds 1.
- **Coupled sweep** (`/tmp/t2`, the one that matters): `g` PINNED to `gLoc(state,θ_K,τ)` at the live
  sNorm mode, across real pools w∈[0.52,0.9] (γ 1.08–9), τ∈{0.05..10}, strikes ±6 nats, consumed-spot
  swept → markLensed range **[9.6e-5, 1.000]**, max > 1+1e-12 **false**. g_loc range over everything
  = **1.4e-15 .. 9.00** (= γ_max, cap-free as claimed).
- **g_loc(ATM)** is **~1e-13, not exactly 0** (log/abs roundoff) — `markLensed` handles it finitely
  (returns 1 at the mode); exact g=0 also finite (`/tmp/t3`: continuation `c·sNorm`=sNorm/θ ≤ 1).
- **Flat-top g<1 band** included in the sweep; intrinsic ceiling 1 holds there too.

**Solvency is clean.** A settled leg pays `N·markLensed ≤ N` — the same per-leg ceiling the plain pool
already carries. No "settle for more than the pool holds" hole. Spec §11.4-A confirmed. The claimed
range "0.000007..1.0" is the right shape (my min differs by the sweep grid; bound is what matters).

## CLAIM 2 — NO-ARB (open==settle ⇒ raw_net=0): **the spec's test is a TAUTOLOGY, but the REAL
no-arb question I posed SURVIVES — no farmable arb.**
- The spec's `markLensed_open(K) − markLensed_settle(K) = 0` (gate 7) is **same-function-evaluated-
  twice**: trivially 0 (`/tmp/t4` confirms exactly 0). It is NOT an independent no-arb proof — it is a
  consistency check that the SAME helper is called both sides. Honest as a *one-helper-rule witness*,
  but it must NOT be sold as "the no-arb identity"; it cannot catch a real arb because it can't fail
  unless the helper itself differs.
- **The real test** (pool moves between open and close, `/tmp/t4`/`t5`): trader opens lensed, pool
  executes plain-v24 `dy`, closes lensed at the moved state. The lensed MTM P&L ≠ the raw-reserve P&L
  (basis gap 0.01–0.14 over the tested moves) — **but this is BY DESIGN** (operator entry 96: the lens
  IS the unit of account). The gap is not farmable: an open-then-immediate-reverse leaves a reserve
  **residual that stays IN the pool** (pool gains, `/tmp/t5`: dy residual +0.022, never drained) = the
  standard AMM round-trip slippage cost, which is pool-favourable. No costless cycle. **No-arb holds
  on the meaningful definition, not just the tautological one.**

## CLAIM 3 — INTRA-BAND 2-LEG BASIS SPLIT (§11.4-C / §11.4-caveat): **HALT-CLASS MUST-APPLY.**
This is the load-bearing hazard and the spec's mitigation is **under-specified and rests on a false
coordinate-invariance claim.** The §11.4-caveat *names* the trap but the *fix* it recommends is wrong.

**The mechanism (re-derived against live engine source):**
1. `gLoc(state, θ_K, τ)` **hardcodes** `u = ln(θ_K / getSNorm(state))` — it ALWAYS measures against the
   **reciprocal** mode (build line 1634). It CANNOT be told to use a price-coordinate mode.
2. `closeBand` builds leg rays as `θ = K/oNow` (**price** coordinate, line 1985) and the settled leg
   consumes `markEff(wing, θ, sNorm0)` where `sNorm0 = poolMark/oNow` is a **price-coord spot**
   (line 1983). The engine comment (L1981-82) says it DELIBERATELY switched FROM `getSNorm` TO
   `sNorm0` because reciprocal "picks the wrong leg on a skewed pool."
3. Meanwhile the OTM-reversal leg uses `legPrice` → `mark(wing, θ, getSNorm(state))` (**reciprocal**,
   line 1717). **So the two legs of a band ALREADY evaluate `mark` against different sNorm conventions
   for an identically-registered θ** (`/tmp/t13`: `markEff(sNorm0)` ≠ `mark(getSNorm)`, diffs 0.35–0.59,
   even at a self-consistent equilibrium state). The RAW engine tolerates this because `min(s/θ,θ/s)`
   is benign and each path registers strikes consistently within itself.
4. **`markLensed` is NOT reciprocal-symmetric** (`/tmp/t7`): the exponent `g` IS coordinate-invariant
   (|u| even — spec §1.1 is right about *g*), but the markLensed VALUE depends on the sNorm/θ ratio,
   which inverts under reciprocal coordinates (reciprocal-call 0.081 ≠ price-coord same-wing call
   0.221; recovered only by ALSO flipping the wing). **The spec conflates "g is coord-invariant" with
   "markLensed value is coord-invariant" — the second is FALSE.**

**Consequence:** if the intern follows §11.4-caveat's recommendation ("compute g_loc and markLensed
both against getSNorm(s)") while `markEff`/`legValueUnified` consume the engine's price-coord `sNorm0`
and the OTM leg consumes `getSNorm`, the settled leg and the reversal leg land on coordinates differing
by a large factor → **6× basis split** (`/tmp/t6`: 0.081 vs 0.512) = the exact v27-class leak §11.2
forbids. Passing the price-ray `K/oNow` to `gLoc` ALSO mixes coords (`/tmp/t8`: g 2.57 vs correct
2.21 — price ray against reciprocal mode).

**MUST-APPLY (build rule, mechanical, no operator):** *Every lensed call site MUST register the strike
ray AND the consumed spot in the SAME coordinate, and `gLoc` must measure `u` in that same coordinate.
Because `gLoc` hardcodes the reciprocal `getSNorm`, the safe build is: **convert closeBand's settled-leg
inputs to the reciprocal/sNorm coordinate before the lens call** (θ_sNorm = 1/θ_price about the mode, or
equivalently re-register against `getSNorm`), call `gLoc`/`markLensed` there, and keep the price-coord
`sNorm0` ONLY for the legacy ITM regime/leg-pick test. Do NOT pass `K/oNow` price rays or `sNorm0` price
spots into `gLoc`/`markLensed`.* The "one coordinate per lens call, sNorm preferred" sentence is
correct but insufficient — the intern needs the explicit conversion because `markEff` natively lives in
price coord and `gLoc` natively lives in reciprocal coord.

**Is gate-5 sufficient to catch it?** PARTIALLY. Gate-5 (open via lensed `legPrice`, close via
`legValueUnified`, assert raw_net→0 at unchanged state) WILL catch a gross coordinate mismatch on the
ITM/settled leg (`/tmp/t9`: open-lensed 0.355 vs settle-lensed 0.043 → raw_net 0.31 >> 1e-10, fails
loudly) — IF it is implemented exactly as the spec describes AND the test pool is at a realistic
oracle-equilibrium state. **But gate-5 as written does NOT pin the test state**, and the NEITHER-ITM
case nets zero even when BOTH legs use the same wrong coordinate (open and close both via `legPrice`/
`getSNorm` cancel). **Gate-5 must additionally (a) test at a steep, off-equilibrium oNow≠marginal
state where sNorm0 and getSNorm diverge maximally; (b) cover the ONE-ITM case explicitly (settled leg
in price coord vs OTM leg in reciprocal coord — the only case that exercises the split); (c) gate-4
(structural "both legs route through markLensed") is necessary but NOT sufficient — it checks both call
the lens, not that they call it in the SAME coordinate.** Strengthen gate-5 with the off-equilibrium
ITM pool; that closes the hole.

## CLAIM 4 — W8 (perp slice un-lensed): **PASS — consistent, no displayed-equity basis mix.**
`attribPnL`/`equityAtClose` is a pure perp-mark fractional move `carvedNotional·(perpNow−perpEntry)/
perpEntry` (engine 2110-2113), NO option mark. It enters `dollarFigure = L0·raw_net·equityAtClose` as a
**multiplier**, applied once, NOT summed into `raw_net` (`/tmp/t14`). Lensing it would be a category
error (option-mark basis × perp-mark basis). Spec W8 "don't lens" is correct. The displayed equity is
(lensed option net) × (perp equity scalar) — a product across the existing 3-stage unit chain, not a
same-column sum. **One condition for the tester smoke-pass:** confirm the UI does not additively combine
a lensed option $ with an un-lensed perp $ in the same displayed column (hand-compute `L0·raw_net·equity`
with lensed component values).

---

## SCOPE-GATE (R1/R3)
- **R1 (citation-backed, zero unrequested):** PASS. All W-site changes trace to entry 96 (verbatim
  verified `history/operator/2026-06-10_kurtosis-curve-family-brief.md` L710: "settle at lenses prices
  … recording the lensed version to query … writes (amm tx)"). W1/W2/W3/W4/W6/W7 = pricing/execution/
  settlement/portfolio = "queries incl portfolio value AND writes." W5/W9 already-lensed (Stage-1).
  W8 explicitly NOT lensed = correct (perp basis, not in entry-96 scope). Zero unrequested sites.
- **R3 (control inventory):** PASS — inherited from Stage-1 (§6 steepness=derived-w unchanged,
  kurtosis=τ the only new control); §11 adds no new user control.
- **Gate additions (8 asserts):** WELL-DEFINED but gate-5 needs the strengthening above; gate-7 is the
  tautology (relabel it "one-helper witness," not "the no-arb gate"); gate-6 solvency ceiling correct;
  gate-8 L4 banned-pattern regression correct. **Sufficient AFTER the gate-5 off-equilibrium-ITM fix.**
- **Staging:** SANE. Own stage (Stage 2), own gate branch in run_all.sh, own tester smoke-pass
  (open/close both regimes, immediate-open-close nets ~0, direction swaps, τ moves portfolio value).
  The file-safety gate (§3) correctly invoked (engine HTML edit, on-disk splice, 2 blob md5 + 3 scripts).

## L4 PRESERVED: confirmed. `tradeUpdate`/`arbitrageToOracle`/`rebase` byte-identical to base v24
(Stage-1 gate 6/6b green); W2 reads forward (lensed V → dy), never inverse; arbitrageToOracle stays
lens-free (gate 7b). The lens changes the VALUE that sizes the cash leg, not the mechanism — correct.

## CONVERGENCE-ALARM: LOW. The spec is self-adversarial (it HUNTS the two-leg split and the ln γ
close-side coordinate trap as the two leak vectors — §11.4-C, §11.4-caveat — and does not hide them).
But it under-specifies the fix and leans on a g-coordinate-invariance claim that does not transfer to
the markLensed value. The manager's solvency spot-check failing (wrong signature) is the exact reason I
re-ran it with the real signature — solvency genuinely holds, so the manager's gap was a process miss,
not a hidden break. No FLAG-PROCESS (entries 95/96 verbatim-confirmed).

## NET
**CLEAR-TO-BUILD (Stage-2 write/settle may dispatch)** with:
1. **MUST-APPLY (halt-class):** the closeBand coordinate rule above — convert settled-leg inputs to the
   reciprocal/sNorm coordinate before `gLoc`/`markLensed`; keep `sNorm0` for the legacy regime test
   only; never pass price rays/spots into the lens helpers. (§11.4-caveat's recommendation is correct in
   spirit but insufficient as written.)
2. **MUST-APPLY (gate):** strengthen gate-5 to a steep OFF-EQUILIBRIUM oNow≠marginal pool AND the
   ONE-ITM case explicitly (the only case that crosses the two coordinate conventions).
3. **Record (relabel):** gate-7 / §11.2 "no-arb identity" is a same-function tautology — call it the
   one-helper witness; the real no-arb (pool-moves round-trip) holds and is pool-favourable.
4. **Record (tester):** confirm no additive lensed-option + un-lensed-perp $ in one displayed column.

Solvency CLEAN, no-arb CLEAN, W8 CLEAN — none operator-tier. The build proceeds once the intern is
handed the coordinate rule and the gate-5 strengthening.

_Scripts (this pass, all node float64, real engine signatures): `/tmp/t1_markLensed_range.js`,
`t2_coupled.js`, `t3_g0.js`, `t4_arb.js`, `t5_pool_roundtrip.js`, `t6_twoleg_coord.js`,
`t7_coordinv_claim.js`, `t8_settle_consistency.js`, `t9_gate5.js`, `t10..t13` (coordinate baseline),
`t14_w8_combined.js`. Self-adversarial: hunted the markLensed>1 hole, the farmable round-trip, and the
two-leg coordinate split; first two held, the third is the must-apply._

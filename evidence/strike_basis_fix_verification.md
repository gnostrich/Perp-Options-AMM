# Strike-basis fix — verification + funding open question (manager, 2026-06-08)

Operator ruling: the wing defect is a **strike-basis mismatch**, not a directional bug. Strike is in
price-ratio basis (θ=K/oracle ∝ S⁻¹); curve/mark are in carry basis (sNorm ∝ S⁻ᵞ). Agree only at γ=1.
Fix: θ_strike = sNorm(K) via getSNorm(arbitrageToOracle(state,K)) (NOT finite-difference). Feed the
one corrected θ to mark, funding fraction, chart ray. Authorized reopening of funding.

## VERIFIED (manager, engine VM on HEAD 8df9f8a3)

**θ=sNorm(K) lands the OTM→ITM crossover at exactly K, γ-independent:**

| γ | θ_strike=sNorm(84000) | crossover spot | err vs K=84000 |
|---|---|---|---|
| 1.5 | 0.9295 | 84000.0 | ~0 |
| 2   | 0.9071 | 84000.0 | ~0 |
| 3   | 0.8639 | 84000.0 | ~0 |
| 4   | 0.8228 | 84000.0 | ~0 |

(Current θ=K/oracle puts it at oracle₀^γ/K^(γ−1) ≈ 76.2k for an 84k strike at γ=2 — the bug.)
sNorm = (oracle₀/S)^γ verified exact. ⇒ **mark + chart-ray fix is correct and ready.**

## BLAST RADIUS (sites that feed a strike ray)
- **mark path (carry basis — NEEDS θ=sNorm(K)):** `pfComponents` ray `K=>K/oracleLive` (4162) →
  `Engine.mark` (4174) + `itm` test (4176); `markEff`/`legValueUnified`/`legPrice` fed
  `band.sold.inner` (=K/oracle) (2053/2065/2068/2076); `executeBand` mark calls.
- **chart ray (NEEDS θ=sNorm(K)):** `drawStrikeRay`/`drawStrikeMark` fed `b.sold.inner` (3413-14,
  3609-11). (Intersects Finding-2, which is sequenced after.)
- **funding:** `fundingPerStrike(state, strike_theta,…)` (2160): `m=markFrac(wing,strike_theta,S)`,
  `S=poolMark/oracle` (PRICE measure), `f=κγN·m·(S−1)/S`. Caller 2590 passes `leg[sk]` (=K/oracle).
- **price-measure entry checks (STAY — already crossover at K):** `isOTM`/`wingMember` compare
  mp/oracle vs K/oracle ⟺ mp vs K. Operator did not list these; they're a valid price-measure gate.
  Note: corrected mark now AGREES with isOTM (both crossover at K).

## OPEN QUESTION — funding does NOT →0 deep ITM under a naive θ-swap
Operator's target shape: funding ∝ remaining extrinsic, →0 deep ITM. Empirical test, 'call' leg
(deep ITM = spot≫K), funding ∝ γ·markFrac(θ,S)·(S−1)/S:

| spot | (a) θ=K/o,S=mp/o (current) | (b) θ=sNorm(K),S=mp/o | (c) θ=sNorm(K),S=sNorm |
|---|---|---|---|
| 100000 | 0.400 | 0.400 | −0.794 |
| 200000 | 1.200 | 1.200 | −1.852 |
| 400000 | 1.600 | 1.600 | −2.117 |

**None →0 deep ITM** — the markFrac fraction decays but the (S−1)/S factor grows, net non-decaying.
So achieving the stated shape needs a funding **reformulation**, not just a θ-swap. Best candidate:
funding ∝ the American mark's remaining extrinsic (continuation−intrinsic), which →0 by construction
in the exercise tail. But the exact formula (markFrac vs American `mark`; basis of the (S−1)/S gap
factor) is a design choice that reopens the locked rule → confirm with operator before building.

## STATUS
- mark + chart-ray strike-basis fix: verified, spec-ready.
- funding: BLOCKED on operator confirming the funding formula (the target "→0 deep ITM" is not what a
  mechanical θ-swap yields). Operator wants mark+funding to share θ, so hold the build for one coherent
  change rather than split mark/chart from funding.

# Wing-tag inversion trace — manager, 2026-06-08

Trace requested by operator before the Finding-2 chart-ray fix: is the engine's
`wing='call'` = economic-put-direction an intended convention or a latent bug?
Two questions: (1) user-facing label, (2) funding sign. Subject: HEAD
`HEAD_temporal_mvp_v26b.html` (`8df9f8a3`). The inversion is **pre-existing in v25/v26a**,
orthogonal to the v26b ITM math.

## Confirmed facts

**The mark()/markFrac wing tag is economic-put-direction** (three code sites + empirical):
- `markFrac('call')` = `sNorm<θ ? sNorm/θ : 1` → ITM (=1) when sNorm≥θ. `isOTM` (1784):
  `wing==='call' ⇒ θ>sNorm` for OTM. `mark()` (1646/1661) same.
- Empirical (θ = K/oracle, the live strike ray; pool sNorm = getSNorm∘arbitrageToOracle):
  the `wing='call'` leg (K=84000, strike ABOVE spot 80000) marks **ITM when spot FALLS**, OTM
  when spot rises; the `wing='put'` leg (K=68000, below spot) marks ITM when spot rises. Put/call
  behavior is swapped relative to the labels.

**It reaches the user.** `wingTag = (w)=>\`<span ...>${w}</span>\`` (4206) renders the **raw**
tag — no presentation-layer relabel. Position rows (4284) show `wingTag(c.wing)`; chart legend
(1389-90) "call curve"/"put curve"; tooltip (1345) "mark(call)=min(s/θ,1)". So a user sees
"call" on the leg that marks ITM as spot falls.

**But strike-placement and funding are call-direction** for the same `wing='call'` leg:
- UI (2887, 3155): long trader's `wing='call'` leg gets strike `oracle*1.05` (ABOVE spot) — call-like.
- Funding (2163): `gamma=(wing==='call')?+2:-2`; with `f ∝ gamma·mark·(S-1)/S`, `wing='call'`
  **pays as spot rises** (normS>1) — correct for a (sold) call. Call-direction.

⇒ **Internal inconsistency:** within one `wing='call'` leg, strike-placement + funding are
call-direction, but mark/moneyness is put-direction — all shown to the user as "call."

## Root cause (hypothesis — needs design intent)

`mark()` compares **poolsNorm (∝ S^(−γ))** to the **strike ray θ = K/oracle (∝ S^(−1))**.
Same measure ONLY at γ=1. Verified poolsNorm = (oracle0/S)^γ exactly (γ=2: spot150k→0.2846 =
(80/150)²). For γ>1 the moneyness flip `sNorm=θ` does NOT sit at the strike:

| γ | 'call'(K=84000) flip spot | should be (strike) |
|---|---|---|
| 1.5 | 72553 | 84000 |
| 2 | 76188 | 84000 |
| 3 | 78071 | 84000 |

The flip sits near `oracle0^γ/K^(γ−1)`, below the strike — the S^(−γ) vs S^(−1) mismatch
signature. If the strike ray were mapped into the sNorm measure (θ_mark = sNorm(K), not K/oracle)
the boundary would return to the strike and the 'call' wing would mark ITM as spot rises.

## Decision for operator (settlement-semantics / curve-measure — locked territory)
- **(A) intended carry-measure convention** → these are options on the S^(−γ) carry coordinate;
  document the convention + relabel UI for clarity; no engine change.
- **(B) latent bug** → map the strike ray into the sNorm measure before the mark comparison; the
  moneyness boundary returns to the strike and the wing→exercise-direction un-inverts. This would
  also swap which American boundary attaches to which wing in v26b's `mark()` (the seam-gate
  directional assertion flips accordingly), and sets the direction for the Finding-2 chart-ray fix.

v26b's ITM pasting math is correct either way; (B) would be a follow-up that swaps wing→boundary
+ fixes the measure — it is NOT a v26b rollback. Per operator sequencing this lands before Finding-2.
The **funding-vs-mark direction disagreement within one leg** is the strongest single indicator
that this is (B), but the S^(−γ) construction could define moneyness this way by design — operator's call.

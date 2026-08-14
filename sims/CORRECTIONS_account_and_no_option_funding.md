# Two operator corrections (entries 514–515) and what they change

**BRAINSTORM / non-core.** Both corrections hit things I had modelled wrongly. Owning them.

## 1. Liquidation is ACCOUNT-LEVEL, not per-carve (entry 514) — my L6 flag was at the wrong level
Operator: there is a **total account-level equity** holding **all perps + all perp-option positions**;
**that** is what liquidates, as a whole; it **excludes LP positions**; account leverage cap ~**50×**.

**My L6 flag ("a carve is not self-collateralising, cash-out goes negative") was framed per-carve and is
therefore misleading.** Re-run at account level (perps L$4M/S$3M, equity $1.4M, one sold-put carve $1M):
| S | perp P&L | option P&L | **account equity** | **acct lev** | status |
|---|---|---|---|---|---|
| 100,000 | 0 | 0 | 1,400,000 | 5.00× | OK |
| 80,000 | −200,000 | −83,333 | 1,116,667 | 6.27× | **OK — absorbed** |
| 60,000 | −400,000 | −251,852 | 748,148 | 9.36× | **OK — absorbed** |
| 50,000 | −500,000 | −351,852 | 548,148 | 12.77× | OK |
**Account liquidation price ≈ $29,593 (−70.4%)**, where leverage hits the 50× cap.
The carve-only cash-outs that "looked catastrophic" (−$83k at $80k, −$452k at $60k) are **absorbed by the
account pot**. **L6 is downgraded**: a single carve going negative is *not* a liquidation event; liquidation
is one account-level test, `gross notional / total equity > cap`.
*Engine note:* the engine draws **per-position** liquidation lines (composed vs bare-perp); I did **not**
find account-level aggregation in it — so account-level liquidation reads as **target design**, not shipped.

## 2. NO funding rate on perp options (entry 515) — this invalidates my "carry" line
Operator: perp options need no funding of their own to keep payoffs in line — **the perp already does that.**

**What it breaks in my model:** every version of the LP economics had
`carry income = book·G·σ_cal²` as the main revenue. That was a **modelling invention**, and it is wrong two ways:
1. **There is no option funding to be the carry.**
2. **σ_cal cannot enter that way at all.** The curve is `V ∝ S^(−g)`; there is no σ in it. Verified: for
   σ_cal = 0.5 / 0.7 / 1.0 the seller's P&L is **identically −3,475.08** — the same curve prices open *and*
   close, so any σ term cancels pathwise. (σ does enter economics, but **through `g`** via `γ(γ+1)=2r/σ²`.)

**So what pays the LP?** With no theta (perpetual) and no option funding, the LP is a **market maker**, not a
carry harvester:
```
income = spread + fees + perp funding earned on the HEDGE legs
cost   = gamma bleed  (book·G·RV², the delta-hedged residual)
```
**Quantified (book $173.5k, g=2, h=10bps, fee 2.5bps, RV=60% ⇒ bleed $187,407/yr):**
| turnover/day | spread+fees | vs bleed |
|---|---|---|
| 0.3 | $23,751 | **−163,656** |
| 1.0 | $79,171 | −108,236 |
| **2.37** | — | **BREAK-EVEN** |
| 3.0 | $237,512 | +50,105 |
| 10.0 | $791,708 | +604,301 |

**⇒ BREAK-EVEN TURNOVER ≈ 2.4×/day at these spreads.** That is now *the* number the business lives on —
and it is far above the 0.2–0.4×/day you called realistic (entry 496 #2).

**The other channel — and I think this is what you meant by "the perp already does that":** selling puts
leaves the LP **long delta**, so it hedges by **shorting perp**; crypto perp funding is usually **positive**
(longs pay shorts), so the **short hedge EARNS funding**. On a $272,960 hedge: 10% APR → $27,296/yr,
30% → $81,888/yr. To close the RV=60% gap on its own it would need ~**60% APR** — so realistically it is a
*contributor*, not the whole answer; spread + turnover still have to do the heavy lifting.

## Net effect on the gap list
- **L2 (funding rate law for options): CLOSED — moot.** There is no option funding to specify. *(The
  ray-deviation funding built into the engine is a separate, existing component — flagging that it needs
  reconciling with "no option funding", see below.)*
- **L6 (liquidation): DOWNGRADED** to "account-level cap + how account liquidation unwinds carves".
- **NEW L7 — the real economic question:** with no option carry, does spread + fees + perp-hedge funding
  beat the gamma bleed at *achievable* turnover? Break-even ≈2.4×/day vs 0.2–0.4× realistic ⇒ **on today's
  assumptions, no.** Levers: wider spread `h`, higher fee, higher turnover, or perp-hedge funding capture.
- **NEW FLAG (needs your word):** the engine *does* ship a **funding = ray-deviation** component
  (feature #9, entry 232). If perp options carry **no** funding, what is that engine component for —
  is it retired, or is it a *pool-side* mechanism distinct from an option funding rate? **I'm not guessing.**

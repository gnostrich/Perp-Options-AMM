# VERDICT — A14 at-strike RE-CHECK under operator entries 198/199 (2026-06-12)

Artifact: `engine/builds/temporal_mvp_v28_lens_atstrike.html` (md5 `de28c937…`).
Re-derivation on the LIVE engine of whether the prior HOLD
(`VERDICT_A14_atstrike_PROMOTE_2026-06-12.md`) survives the operator's two new rulings.

## VERDICT: **CLEAR — no single-option free-money. HOLD DISSOLVED, promotable.** (one display caveat below — not a leak, operator's call whether it blocks)

The operator's model removed both props the $120k HOLD stood on, and the live engine confirms
the consequence: a single option's trader P&L never reads the open at-strike swap, so the pool
retaining the swap is the operator's intended curve-warp persistence, not extractable free money.
The build's ITM cash-settle-without-reversal is now CORRECT, not a leak.

---

## What the operator's model changed, and why it dissolves the HOLD

My HOLD rested on (a) a cross-wing BAND pushing spot to 1.97 so a leg flips ITM, and (b) an
expectation that open→close restores pool reserves (round-trip-neutral). Entry 198 ("ITM → direct
intrinsic+extrinsic payout, NO AMM reversal; the open swap legitimately stands") removes (b);
entry 199 ("individual options, not spreads") removes (a). Re-run under the new model:

**The decisive accounting fact (live engine, `closeBand`):** the trader's realized money is
`trader_payout = L0 · raw_net · carvedEquityAtClosure`, and `raw_net = Y − X` is built ENTIRELY
from option VALUES (`legValueUnified`/`markEff`/`legPrice` — lensed marks). **The open at-strike
`dy` is never referenced anywhere in the close P&L.** I traced it: open a sold call N=1, K=$120k →
open dy = +$120,000 into the pool; close at flat oracle → `trader_payout` is a function of
`markEff` only; pool y is left +$120,000 above start (`finalState.y − S0.y = 120000`) and that
residual touches the trader's books nowhere.

So the chain is: trader's cash-IN at open = the carved **club equity** (`carveEquityAbs`, taken
from `club.equity` in `openBand`, NOT the pool dy); trader's cash-OUT at close = the carved equity
returned ± `attributablePnL` ± the option-value P&L (`raw_net`). The pool swap `dy` is a pure
curve-warp on the AMM reserves — exactly the operator's "a trade warps the curve and that
persists." **No double-count exists**: "received $120k at open" is NOT booked to the trader (it is
a pool-internal reserve move), so settling intrinsic+extrinsic at close double-counts nothing.

**The ITM-settle-without-reversal is now CORRECT.** Under entry 198 an ITM single option pays the
formula value directly and the open swap legitimately stands. The build's `closeBand` soldITM/
boughtITM branches do exactly this — value the ITM leg with `legValueUnified` (intrinsic+extrinsic
via the lensed smooth-paste `markLensed`), and do NOT AMM-reverse it. That is the operator's rule
implemented. My prior reading of this same code as "the leak reappears" was correct ONLY under the
round-trip-neutral expectation the operator has now rejected. The mechanic itself is unchanged and
is now endorsed, not flagged.

**Steelman for STILL-HOLD I tried and it FAILED:** "the at-strike open shoves spot from 1.0 to
1.69 on a single sold call — the trader sold a call that is now ITM purely because their own open
trade moved the pool past the strike; they then collect the seller's smooth-paste value on an
option the market never actually pushed ITM — free money." This fails because the seller is SHORT:
an ITM short call at settle PAYS the option value (it is a debit to the seller, `X` enters
`raw_net = Y − X` with a minus), it does not collect it. The self-inflicted ITM crossing makes the
seller WORSE off, not better — the opposite of extraction. I checked the sign in `raw_net` (sold
leg = `X`, subtracted) and it holds. There is no single-option trade where the trader ends with
risk-free more-than-start sourced from the at-strike swap.

---

## Residual finding the operator must hear — DISPLAY defect, NOT a leak (FLAG-OVERSELL, UI-layer)

The build is promotable on the free-money question. But while re-deriving I measured a
trader-facing UI claim that is now false under at-strike sizing, and I will not bury it:

- **The preview panel (HTML line 1211) prints the header `Pool Δ (cash-conserving ⇒ Δy_net ≈ 0)`
  and (line 1214 / wiring line 3133) labels `netPoolY` as "net trader cash @ open".** Under
  at-strike sizing `netPoolY` is **NOT ≈ 0**: I measured a cross-wing band (sold call θ=1.5 +
  bought put θ=0.6, N=1) → `leg1.dy = +$120,000`, `leg2.dy = +$41,865`, **`netPoolY = +$161,864`.**
  Both legs push cash the SAME direction (the panel's own footnote at line 1406 admits "sold-call
  and buy-put both push cash in… compounds rather than cancels"), so the "⇒ Δy_net ≈ 0" premise is
  contradicted on the main cross-wing path. The premium basis is genuinely cash-conserving
  (`V_sell == V_buy == 0.193`), but the displayed dollar field is the *pool swap*, not the premium.

This is a **labeling defect, not a leak** — the $161,864 is the pool warp (correct per the
operator's model), it is simply mislabeled "trader cash @ open" under a stale "≈0" header from the
premium-sized era. It does not affect P&L (which reads option value only, as shown above). It is
the operator's call whether a wrong trader-facing number blocks promotion; I name it and stop. I do
NOT propose the fix.

---

## Answers to the four asked questions (plain English)

1. **Single option open→close trace:** trader cash-in = carved club equity; cash-out = option
   value ± perp-slice P&L. Open at-strike `dy` is pool-warp only.
2. **Free money?** NO. `trader_payout` is option-value-driven; the open swap never enters it. Fair.
3. **Double-count between "received N·K at open" and "paid intrinsic at settle"?** NO — the trader
   never "receives N·K"; N·K is a pool reserve move, not a trader credit. Single accounting; fair.
4. **Does the build implement at-strike open / ITM direct-payout / OTM-reverse correctly?** YES.
   ITM cash-settles without AMM reversal (entry-198 correct); OTM reverses at-strike; pool fns
   byte-identical to v24 (AS4, prior-verified). **No tweak required for correctness.** The only
   blemish is the display header/label at lines 1211/1214/3133 (cosmetic; operator's call).

---

## Bottom line for the operator

Your model dissolves it. For a single option, there is no free money: the big at-strike swap only
bends the pool curve (which you said should persist), and the trader's actual profit is computed
from the option's value alone — the swap never lands in their pocket. The build's ITM cash-settle
(no reversal) is exactly your entry-198 rule, so it is right, not a leak. **Promotable.** One
non-blocking cleanup if you want it: the preview still labels the pool swap ($161,864 on a cross-
wing band) as "net trader cash @ open" under a stale "cash-conserving ≈ 0" header — a wrong
trader-facing number, but it does not touch P&L. Your call whether that blocks the promote.

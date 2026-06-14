# VERDICT (skeptic, #32) — FINDING-RT reconciliation vs my own verdict #30 CLAIM-2

**Date:** 2026-06-12 · **Artifact under review:** tester FINDING-RT (DIFF_LEDGER OPEN -4 /
`evidence/v28_lens_S2/probes/`), build `temporal_mvp_v28_lens_S2.html` (md5 `b53ace99`) · also
re-derived against the v24 base (`temporal_mvp_v24_rebase_fixed_2.html`). **READ-ONLY.** Summoned to
reconcile FINDING-RT ("instant open→close round-trip on a two-OTM-leg band is TRADER-favourable,
raw_net>0, scales with slippage") against my verdict #30 CLAIM-2 ("the round-trip leaves the
residual IN the pool, pool-favourable, not farmable").

## VERDICT: **NOT-A-LEAK (sign-component artifact, clear). #30 CLAIM-2 STANDS — corrected/sharpened in scope, not overturned.** The build is NOT a money pump; this does NOT block promotion and is NOT operator-tier.

---

## 1. Is `raw_net > 0` real, and does it scale? — YES, both reproduced.
I reproduced the tester's numbers independently. Through the **live S2 UI handler** (`Store.closeBand`),
default pool x10/y800000/α5/β400000, oracle 80000, barrier legs sold-call 84000 / bought-put 76000:

| N | raw_net (S2, my run) | tester | pool reserve-USD net |
|---|---|---|---|
| 0.01 | +1.5718e-4 | +1.57e-4 ✓ | **+2.28** |
| 0.05 | +3.8555e-3 | +3.71e-3 (≈) | **+56.42** |
| 0.20 | +6.733e-2 | +4.30e-2 (≈) | **+871.87** |

`raw_net = Y − X > 0` is genuine and grows with size. The tester read the sign correctly. (My
per-N digits differ slightly from the probe because the probe pre-loaded a perp/state; the SIGN and
SCALING are byte-faithful.)

## 2. Is it a LEAK? — NO. The trader's TOTAL round-trip P&L is NEGATIVE; the pool GAINS.
**The tester measured only `raw_net` (the close-leg book value Y−X in carved-perp units) and treated
the OPEN side as net-zero. That is the error.** `raw_net` is ONE component of the round-trip, not the
trader's P&L. The band's two legs carry real BTC↔USD reserve flows across BOTH open and close that
`raw_net` does not capture.

I traced the **actual pool reserve deltas** over the complete open→close cycle (live S2 build) and
valued the trader's net position (the pool's counterparty) at the $80k oracle:

| N | pool Δx (BTC) | pool Δy (USD) | trader gets BTC | trader gets USD | **trader total $ P&L** |
|---|---|---|---|---|---|
| 0.01 | −0.01192 | +955.80 | +0.01192 | −955.80 | **−2.28** |
| 0.05 | −0.05903 | +4779.00 | +0.05903 | −4779.00 | **−56.42** |
| 0.20 | −0.22805 | +19115.86 | +0.22805 | −19115.86 | **−871.87** |

The trader's total round-trip P&L is **exactly minus the pool's reserve-USD gain** (conservation —
this is a closed two-party system, the trader vs the pool). The trader **LOSES** on the round-trip;
the loss **scales with size** and is ~2× the one-way open `slipUsd` (S2 N=0.05: loss $56.42 ≈ 2 ×
slipUsd $28.30) — i.e. the trader pays slippage on BOTH legs of BOTH the open and the close. **This
is the standard AMM round-trip slippage cost. It is pool-favourable. There is no costless cycle, no
money pump.** A trader opening and instantly closing strictly burns money to the LPs.

The reason `raw_net > 0` while the trader loses: `Y` (sell-back proceeds of the bought leg) and `X`
(buy-back cost of the sold leg) are recorded in carved-perp units against the *moved* pool; the
band's book convention sizes the open legs to net-zero (`V_at_open` sold == bought, an engine sizing
identity — confirmed `=` exactly in the S2 UI), so the trader's actual entry cost lives in the
reserve move, NOT in a non-zero open `raw_net`. Y−X being positive is a property of the close-leg
mark geometry on the slipped pool; it is **not** the cash the trader walks away with.

## 3. Reconcile with #30 CLAIM-2 — STANDS, scope sharpened.
#30 CLAIM-2 said: the real (pool-moves) round-trip leaves the residual in the pool, pool-favourable,
not farmable. That is **correct and now re-confirmed on the two-OTM-leg band** the tester probed — a
case #30 tested via a single pool-`dy` round-trip, not the band path. The two paths agree: **both are
pool-favourable.** #30 did not measure `raw_net` on a two-leg band; the tester did and read its sign
as the P&L. The substance of CLAIM-2 ("not farmable, residual stays in pool") is unbroken. The only
correction to the record is a precision one: **`raw_net` (Y−X) is NOT the round-trip trader P&L —
the reserve-flow valuation is.** I am logging that as a standing caveat so neither agent re-reads
`raw_net>0` as "trader wins" again.

## 4. Does the lens make it worse/better/neutral vs raw v24? — NEUTRAL in direction.
Both builds are pool-favourable: trader total $ P&L is NEGATIVE on **both** S2 (−56.42) and the v24
base (−146.51) for N=0.05; raw_net>0 on both. The lens rescales the recorded marks (so the per-N
raw_net magnitude differs) but does **not** flip the sign of the trader's actual round-trip P&L — the
pool reserve mechanics (`tradeUpdate`, L4-preserved) are byte-identical v24, and that is what carries
the cash. The tester's "INHERITED-v24, not a Stage-2 regression" is correct; I extend it: inherited
AND benign on both — there is nothing to inherit, because there is no leak in either.

## 5. Severity / disposition: **NOT a blocker. NOT operator-tier. Clear it.**
- It is **not** a money pump (§2 dispositive: trader loses, pool gains, conserved).
- It is therefore **not** a promotion blocker on the leak axis, and it does **not** require the
  operator ruling the DIFF_LEDGER OPEN -4 escalation contemplates. Entry 96 ruled settle-at-lensed
  and (verbatim, transcript L710) said nothing about round-trip sign — correctly, because the sign of
  `raw_net` is a book-keeping component, not an economic leak that needs a ruling.
- **Residual (display-honesty, NOT a blocker, intern/tester item):** the engine's own close log and
  the portfolio "raw" cell surface `raw_net` (Y−X) as a headline number with a `trader_payout =
  L0·raw_net·equity` that is **positive on an instant round-trip**. That is economically misleading at
  the display layer (a trader reading it would think an instant round-trip pays them). The engine is
  self-consistent and solvent; the *displayed* `raw_net`/`trader_payout` does not subtract the
  entry-cost reserve leg, so it overstates the trader's position on a same-tick round-trip. This is a
  display-semantics caveat to surface to the tester for the standing smoke-pass, **not** a leak and
  **not** promotion-gating.

**Disposition for the manager:** mark DIFF_LEDGER OPEN -4 (FINDING-RT) **RESOLVED — NOT a leak
(skeptic-re-derived); pool-favourable on the full cash path; no operator ruling needed.** Do NOT
escalate the sign to the operator as a money-pump risk. The only forward item is the display-honesty
note above (tester/intern, non-gating).

---

## Method / scripts (all node float64, real engine signatures; live S2 UI + v24 sandbox)
- `/tmp/sk_rt2.js` — v24 engine sandbox, exact barrier-leg probe (84000/76000), full reserve trace.
- `/tmp/sk_check_V.js` — V_sell ≠ V_buy in the v24 *engine* (the equality is an S2-UI storage
  convention, not a cash fact).
- live S2 UI probes (run from `engine/verify/`, ephemeral): full open+close `V_at_open` (open_net=0
  exactly), `Store.closeBand` raw_net, and the load-bearing **pool reserve Δx/Δy → trader $ P&L**
  trace giving −2.28 / −56.42 / −871.87 (= −pool gain). S2-vs-v24 sign-comparison both negative.
- Verbatim channel: entry 96 (`history/operator/2026-06-10_kurtosis-curve-family-brief.md` L710)
  verified — settle-at-lensed only; no round-trip-sign ruling. No FLAG-PROCESS.

## Convergence-alarm: LOW (this is an anti-convergence verdict — I broke the tester's reading, not
rubber-stamped it; and I re-confirmed my own #30 by an independent path rather than defending it from
memory). The tester's evidence was honest and the SIGN observation correct; the inferential step
"raw_net>0 ⇒ trader-favourable ⇒ candidate money pump" is the single broken link, and it broke on the
unit/scope of `raw_net`, not on the data.

# VERDICT — A14 at-strike swap seam, verified against the REAL engine closeBand · 2026-06-12

**Artifact under review:** `specs/SPEC_atstrike_swap_A14_2026-06-12.md` §2 (the HARD-RED round-trip
arb claim) + its harness `/tmp/a14_seam.js`.
**Target:** HEAD `engine/builds/HEAD_temporal_mvp_v28_lens.html`, closeBand L1971–2162,
executeLeg L1761, executeBand L1811, openBand L2436.
**Method:** read the real close source; re-derived fresh against `Engine.closeBand` (not the
harness's close model). Scripts `/tmp/skeptic_a14_real.js`, `_cash.js`, `_band.js`, `_table.js`,
`_final.js`. All numbers [verified-here] float64 on the live engine.

---

## LEAD VERDICT: **NEEDS-OPERATOR-DECISION** (the build must NOT ship tonight).

The alarm is **REAL, not a harness artifact** — but the spec's specific dollar figures
(+$6,350 / +$125,409) and its "pool restores to ~2e-15" claim are **both harness artifacts**.
The true seam is *worse in one way and smaller in another* than the spec says. Net: the build is
genuinely blocked on an operator-tier settlement decision; it is NOT "your fix is built," and it
is NOT "false alarm, ship it."

---

## 1. The spec's close model is NOT what the engine does (FLAG-OVERSELL on §1 + §2.1)

§1 (L80) claims: *"closeBand's reversal legs go through executeLeg and therefore inherit at-strike
sizing automatically — reversal dy = −open dy exactly, since N and K are stored per leg — pool
restoration is then EXACT (1.8e-15)."*

**This is false about HEAD.** `closeBand` (L1971–2162) **never calls `executeLeg`**. It values
each leg with `legPrice(...).V` (the lensed PREMIUM, asset units) and reverses the pool with
`tradeUpdate(s, +X)` / `tradeUpdate(s, −Y)` directly — i.e. **premium-sized**, NOT at-strike-sized.
So under the actual §1 patch (one line, executeLeg L1767), the OPEN is at-strike but the CLOSE is
premium. The harness `/tmp/a14_seam.js` instead reverses with its own `executeLegAS` (at-strike) on
BOTH legs — that is why it reports the pool restoring to 1.8e-15. **The engine does not restore the
pool.** Measured (band sellC1.5/buyC2.0, immediate close):
- open at-strike moves pool y by **−$254,463**, x by +8.74 BTC, γ 1.000 → 0.364.
- real close moves pool y back by **−$1** (≈0). Pool ends y=545,536 vs start 800,000:
  **residual warp −$254,464 left in the pool, never undone.**

Likewise the spec's single-leg table (rows +$6,350 … +$63,311) measures
`(V_open − m_close)·oracle` on the self-warped pool — **a quantity the engine never computes:
there is no single-leg close path; `closeBand` always reverses a band and returns `raw_net = Y−X`.**
I reproduced the $6,350.48 number exactly from the harness's formula, then confirmed the engine has
no code that realizes it.

## 2. But the underlying seam is REAL — re-derived on the live closeBand

Running the actual `Engine.closeBand` on at-strike-opened bands, immediate close, default pool,
τ=0.3, L0=1 (per unit carvedEquity):

| band (immediate close) | engine `raw_net` | =USD | pool residual | close case |
|---|---|---|---|---|
| sell C@1.5 / buy C@2.0 | +0.83729 | **+$66,983** | −$254,464 | neither-ITM |
| sell C@1.5 / buy P@0.667 | +0.15641 | **+$12,513** | +$152,872 | sold-ITM |
| sell P@0.667 / buy C@1.5 | +0.46276 | **+$37,021** | −$137,589 | sold-ITM |

**`raw_net > 0` (trader-favourable) in every case, at strike scale** — and it is paid out of the
carved-equity (club) basis via `trader_payout = L0·raw_net·carvedEquityAtClosure` (L2143). So even
under the spec's own "premium-ledger only" reading, the trader is paid for a zero-time, zero-risk
open-then-close. **The two-basis hazard (feasibility-O5) is real.** It is the SAME mechanism the
spec names: the at-strike open is strike-scale, it warps γ hard (1→0.36), and the bought leg marks
itself UP on the trader's own warp (m_b reads 0.72–1.68 at the post-warp pool), so `Y−X > 0`.

## 3. The two leaks, in plain English (operator-facing)

There are actually **two** trader-favourable effects, and the spec only saw a distorted version of
the first:

1. **The premium-ledger leak (real, smaller than the spec said).** When you open at-strike, your
   own big swap bends the curve so that the leg you bought is now "worth more" and the leg you sold
   is "worth less" on the bent curve. The close pays you that gap. Real size on $80k-notional:
   roughly **+$13k to +$67k per unit of carved equity** — not the spec's +$125k (that figure used a
   close the engine doesn't run).

2. **The pool-not-restored leak (real, the spec missed it entirely — it claimed the opposite).**
   The open is a huge strike-scale swap; the close only reverses a tiny premium-scale swap. So after
   you "close," the pool is still bent by a quarter-million dollars that came from your open swap and
   was never given back. If the at-strike swap moves real wallet cash (operator entry 193: "the sell
   part is purely AMM"), this is real money the pool is short. If it's purely virtual bookkeeping
   (register A14 wording), then the pool carries a permanent phantom warp after every closed band —
   which corrupts the next trader's prices.

**Mechanism, one sentence:** the at-strike write deliberately makes the swap strike-scale (to get a
real warp), but everything that VALUES or REVERSES the position still runs at premium-scale on the
self-bent curve — so the trader's own bend feeds back into their payout, and the bend never gets
unwound. The two numbers that decide it: open warp **−$254k** (strike-scale) vs close reversal **−$1**
(premium-scale); and `raw_net` **+$67k** at the bent curve.

## 4. Is the operator's two-layer model buildable with a seam-closing settlement rule?

Yes — but only by an operator-tier settlement choice, exactly as the spec's §2.4 says (and I
confirm none is pickable below operator). The least-invasive closure, in my read, is **§2.4 item 2
restated cleanly:** *value and reverse the closing legs at the pool state the trade itself produced,
in ONE consistent basis* — i.e. make the close use the SAME at-strike swap that the open used
(reverse dy = −open dy exactly), so the pool genuinely restores AND the leg values are read at the
restored (= entry) state, killing the self-pump. That is a change to `closeBand` (make its reversal
at-strike, not premium) — which is settlement semantics, hence operator-tier, and it also touches
the entry-96 "everything reads the live lensed state" single-basis rule. I am NOT choosing it; I am
naming it as the least-architecture-disturbing candidate so the operator has a concrete option. The
other §2.4 items (frozen-mark settle, drop premium-recorded P&L) each reopen more.

What the operator must decide, in plain English: **"when you close an at-strike position, do you
value it on the bent curve you just made (today's behavior → free money), or do you first un-bend
the curve back to where you started and value it there (no free money)?"** That is a one-sentence
settlement-rule choice and it is his to make.

## 5. Disposition of the spec's own claims

- §1 at-strike sizing formula `dy = wingSign·legSign·N·K_usd`: **correct and buildable** (verified
  the dy/warp; Δγ = dy/β exactly). Not the problem.
- §2.3 reserve guard (cash-OUT depth wall N·K ≥ y−β): **correct** — reproduced the θ=5.0 (K=$400k)
  `tradeUpdate`→null wall; the guard-as-honest-REJECT is sound.
- §2.1 figures (+$6,350 … +$125,409) + "pool restores 1.8e-15": **FLAG-OVERSELL** — harness close
  model, not the engine's. The DIRECTION (trader-favourable) and the EXISTENCE of the seam survive;
  the MAGNITUDES and the "pool restores" claim do not.
- §2.4 "all closures are operator-tier": **upheld.**

**Bottom line for the check-in:** the alarm is genuine, the build stays blocked, and the operator
owns a single concrete settlement-rule decision (value on the bent curve vs un-bend first). Tell him
that — not "fixed," not "false alarm." Honest magnitudes: real per-unit-equity payout +$13k–$67k
plus a separate un-restored pool warp of order −$250k, NOT the spec's +$125k single figure.

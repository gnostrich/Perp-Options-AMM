# VERDICT (skeptic, #31) — executeBand N_buy denom lensing (Stage-2 §11 build, last open item)

**Date:** 2026-06-12 · **Artifact:** intern decision in `engine/builds/temporal_mvp_v28_lens_S2.html`
(md5 `b53ace99`) · **Mandate:** operator entry 95/96 build-oversight. **READ-ONLY.** Sandboxed the
real engine (S1 + S2), scripts under `/tmp` (this pass). Governs the last open item before the
tester smoke-pass. This extends verdict #30 (`VERDICT_R6_WRITE_SETTLE_LENS_2026-06-12.md`).

## The decision under review
`executeBand`'s inline **N_buy sizing denom** (line 1851) — NOT one of the spec's enumerated 5
W-sites. In S1 it computed the bought-leg per-unit value as **raw** `mark(bought_wing, θ*, sNorm2)·
2·sinh(|δ|)` at the **price-coord** spot `sNorm2 = poolMark/oracle`, composite-ray form (S1 L1831-1846).
The intern (building §11/W2, which lensed `V_sell`) **routed this denom through the SAME lensed
`legPrice` entry** (`pxBuyUnit = legPrice(leg1.newState, bought_wing, bought.inner, bought.outer, 1, tau)`;
`denom = pxBuyUnit.V`, S2 L1848-1853). Stated reason: with `V_sell` now lensed and the denom left
raw, `N_buy = V_sell/denom` mixes bases (off ~2×). It FLAGGED the expansion rather than shipping it
silently.

## VERDICT: **CONFIRM — keep the change. It is consistency-MANDATED, not overreach, and it is
correct.** Plus **1 FLAG-OMISSION** (a SECOND, un-fixed copy of the identical raw-denom bug survives
in the payoff-preview display path, L3886) and **1 record note** (dead consts — harmless now, latent
footgun). None operator-tier. None blocks the smoke-pass on `executeBand` itself; the FLAG is a
tester/intern follow-up, see below.

---

## Q1 — REQUIRED or overreach? **REQUIRED (consistency-mandated), within R1.**
The §11 task lensed `V_sell` (W2). `N_buy = V_sell / denom` is a **single-basis ratio**: numerator and
denominator MUST be the same unit of account or the booked notional is wrong. Once the numerator is
lensed, leaving the denom raw is not "the untouched legacy path" — it is a NEW mismatch *created by*
the W2 edit. Re-pricing the denom through the same lens is the minimal change that keeps the W2 edit
self-consistent. Under R1 this is **not "unrequested":** it is implied by entry-96 "settle/record/query
at lensed prices" + the verdict-#30 one-helper / single-basis invariant. A site that the requested edit
*forces into inconsistency* is in scope to repair. Overreach would be lensing something the W2 edit did
not perturb (e.g. the perp slice, W8 — correctly left raw). This denom was perturbed. **Keep it.**

**The "off ~2×" was if anything an understatement.** Measured `V_buy_actual / V_sell` (cash-conservation
ratio — the whole point of the `V_buy = V_sell` bridge) when the denom is left RAW while V_sell is lensed:
- equilibrium (w=0.5): **1.388** (off 39%)
- off-equilibrium (pool moved, oracle stale, getSNorm 0.769 vs sNorm0 1.690): **0.776**
- off-equilibrium-2 (getSNorm 2.0 vs sNorm0 0.25): **0.181** (off 5.5×)

With the NEW lensed denom: **V_buy_actual / V_sell = 1.00000000 in ALL three states.** Reason it is
*exact*: `executeLeg('buy',…)` actually charges `N_buy · legPrice(…).V`, and the new denom IS
`legPrice(…).V` evaluated at the same post-sold state — so the sizing helper and the executing helper
are the **identical function** (the one-helper guarantee verdict #30 demanded, here realized exactly,
not approximately). The raw denom broke cash-conservation by up to 5×. Leaving it raw is a genuine
basis-mismatch bug, not a cosmetic one.

## Q2 — CORRECT? **YES on both sub-checks.**
- **MUST-APPLY-A (one reciprocal `getSNorm` coordinate, NOT the price-coord `sNorm2`):** PASS. The new
  denom is `legPrice(…).V`; `legPrice` reads `sNorm = getSNorm(state)` internally (L1723) — the single
  reciprocal coordinate, against the live mode, the SAME coordinate `V_sell` (also via `legPrice`) was
  priced in. The price-coord `sNorm2` (L1840) is **no longer consumed** by the denom (it is now dead,
  see Q3). So the numerator and denominator land in one coordinate — exactly the convert-before-the-lens
  rule of verdict #30, here satisfied structurally because both sides go through the one `legPrice`
  entry. (The new denom also correctly DROPS the S1 `2·sinh(|δ|)` composite-ray factor: `legPrice`
  prices the spread leg-by-leg as `markLensed(inner) − markLensed(outer)`, which is the valid per-leg
  g_loc form; the composite-ray identity is invalid under per-leg g_loc — consistent with §3-P1.)
- **L4 (pool mechanic untouched):** PASS, verified byte-level. `tradeUpdate`, `rebase`,
  `arbitrageToOracle` produce **identical** outputs S1→S2 across a dy sweep, a rebase, and an arb
  (max diff < 1e-12). The change moves only the *value that sizes the cash leg* (N_buy); the pool still
  executes the plain-v24 swap `dy = (wingSign·legSign)·N_buy·legPrice.V·oracle` through the unchanged
  `tradeUpdate`. The lens changes WHAT is sized, not HOW the pool swaps. This is exactly the L4 reading
  ("lens the value, not the mechanism").

## Q3 — Any breakage? **One real omission + one harmless record item.**

**FLAG-OMISSION (the live one — a SECOND copy of the bug the intern fixed survives):** the
payoff-preview render path (`drawState`, L3870-3887) computes its OWN N_buy: numerator `V_sell =
Engine.legPrice(…).V` (LENSED) divided by a **raw** denom `Engine.mark(bought_wing, …, sN)·2·sinh(|δ|)`
(L3879/3883-3884) — the *exact* raw-price composite-ray pattern the intern just removed from
`executeBand`. So the preview chart's displayed N_buy disagrees with the N_buy `executeBand` will
actually book, by the same 1.4×–5× factor. This is **display-only** (the executed trade uses
`result.N_buy` from `executeBand`, L2477/2503 — not this value), so it is NOT a solvency or
settlement break and does NOT gate `executeBand`. But it is a user-visible inconsistency (the
previewed bought notional ≠ the booked bought notional) and it is the same basis leak by the intern's
own logic. The intern's consistency rule, applied honestly, reaches this site too. **For the tester
smoke-pass:** confirm the previewed "bought N" (pv-N-bought / payoff chart) matches the trade-log
booked N_buy after open — if they differ materially, this L3886 denom is the cause. (Mitigation is a
one-line swap to `legPrice` like L1851; intern follow-up, not operator-tier.)

**RECORD (dead consts — harmless, latent footgun):** `sNorm2` (L1840), `ts2`/`d2`/`m2`/`buyMode`
(L1849-1850) are assigned and never read again in `executeBand` (verified: zero downstream references;
the return at L1883-1889 does not touch them). All are `const`, block-local, pure reads — no
shadowing, no reassignment, no side effects. **Harmless to execution today.** The only risk is a
future maintainer re-wiring `m2`/`sNorm2` back into a denom and re-introducing the raw-basis bug just
removed. Recommend deletion for hygiene; not a blocker.

**Direction / dollar pipe / solvency:** UNAFFECTED. The change is upstream of the swap-direction logic
(`wingSign·legSign`, unchanged), feeds the same oracle BTC→USD bridge once (unchanged), and a smaller
or larger N_buy is still bounded by the same per-leg pool mechanics; `V_buy = V_sell` now holds
*exactly* where before it drifted, which if anything TIGHTENS cash-conservation.

## NET
**CONFIRM the executeBand N_buy lensing — correct + consistency-mandated, keep it.** It is the unique
basis-consistent denom (one-helper, one reciprocal coordinate, L4-preserving), and it restores exact
cash-conservation the raw denom violated by up to 5×. Two riders, neither operator-tier, neither
gating `executeBand`:
1. **FLAG-OMISSION:** the identical raw-denom bug survives at the payoff-preview render (L3886) —
   lensed numerator over raw denom. Display-only, so not a break, but a visible preview≠booked
   inconsistency by the intern's own rule. Tester confirms preview-N vs booked-N; intern one-line fix.
2. **Record:** dead consts `sNorm2/ts2/d2/m2/buyMode` — harmless, delete for hygiene (re-wire footgun).

Convergence-alarm LOW: the intern flagged the expansion rather than smuggling it, gave the correct
basis reason, and routed through the one helper. The decision is the right one; I am only adding the
second occurrence it didn't reach.

_Scripts (node float64, real engine sigs, S1 + S2 loaded via vm): N_buy basis-match across eq +
2 off-eq states; L4 byte-equivalence of tradeUpdate/rebase/arb S1==S2; dead-const + L3886 source
inspection._

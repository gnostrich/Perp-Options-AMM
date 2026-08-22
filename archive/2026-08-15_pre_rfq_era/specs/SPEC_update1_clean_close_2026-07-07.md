# SPEC — UPDATE 1: fully theoretically-clean sell-back close + funding-on-option-part

_research-lead, 2026-07-07. Splice-ready build spec for the intern. Operator GREEN-LIT (entry 450
"yes"; sequenced entry 452 as **update 1 of 2**). Read-only on the engine while writing; no Aristotle,
no git. Target HEAD `51342574` (engine `<script>` blocks byte-identical to `0e0a0062`). Every number
below is MEASURED against the live engine (vm-extract from HEAD); harness `scratchpad/{drain,funding}`._

**Scope of UPDATE 1 (this spec):** the clean sell-back close (every leg a live reverse trade) + the
funding-weight change (full mark → extrinsic). **NOT in scope (UPDATE 2, parked, operator entry 451):**
the counterfactual receipt / charge-back / pool-value floor drain-safety. The drain is DOCUMENTED here,
not fixed. The arc receipt stays STORED-but-DORMANT so UPDATE 2 plugs in with no re-plumbing.

Companion design record: `specs/DESIGN_itm_close_and_funding_2026-07-07.md`. Verifies feeding this:
`notes/research/VERIFY_itm_close_directionality_2026-07-07.md`, `VERIFY_escrow_denomination_2026-07-07.md`,
`VERIFY_funding_profile_2026-07-07.md`.

---

## 0. What changes, at a glance (existing → planned)

| # | Site (HEAD line) | Today (v28 `0e0a0062`) | UPDATE 1 |
|---|---|---|---|
| 1 | `closeBand` value/pool block, L2208–2268 | TWO-CASE: one leg settle-to-cash (no swap) OR both live; frozen-arc `revertArc` reversal | ONE path: BOTH legs valued at one pre-close snapshot; BOTH legs live reverse-trade via `tradeUpdateAt` |
| 2 | `closeBand` reversal law | `revertArc(s, arc, rr)` exact inverse (Δval=0) | `tradeUpdateAt(s, dyRev, rho_close)` live (Δy=0 exact, Δx = documented drain) |
| 3 | `fundingPerStrike` weight, L2353/2356 | weight = full `markLensed` | weight = **extrinsic** = `markLensed − max(intrinsic parity, 0)` |
| 4 | `openBand`, L2676–2684/2716–2718 | stores `arc` + `K_tx` | **UNCHANGED** (arc stays stored, now dormant) |
| 5 | `revertArc` fn L1752 | used by close | **kept in file but no longer called by the live close** (UPDATE-2 will call it) |
| 6 | gate `lens_selfcheck.js` CM6-v2 | frozen-arc round-trip + no-free-money | RETIRE → **CM6-v3** (documents drain) + NEW **CM12** (payout continuity) + funding-extrinsic check |

Everything else in `closeBand` — the live-ray rebuild (`oNow`/`sNorm0`/`liveRay`), the frozen-dollar
reversal cash flows (`Ksold`/`Kbought`/`dyRevSold`/`dyRevBought`), `soldITM`/`boughtITM`, the wing-lock,
Job 2 (carved-equity → dollars, `L0`, floor) — is UNCHANGED. `openBand`, `markLensed`, `gLoc`,
`tradeUpdateAt`, `legPrice`, the SPOT trio, and the pool are UNCHANGED.

---

## 1. Close = live reverse trade, EVERY leg (item 1)

### 1.1 The unified path (replaces the two-case branch)
The **value** of the position and the **pool footprint** are now DECOUPLED (division of labour,
DESIGN §A.1):

- **VALUE** — sell each leg back at TODAY's lensed mark, read at ONE pre-close pool snapshot `s0`
  (the state before any reversal swap). `X` = sold-leg value, `Y` = bought-leg value, both via
  `legPrice(s0, …)`. ITM legs tally identically because `markLensed` = linear parity past `S*`
  (measured: put θ=1.5/1.7/2.0/2.5 → 0.3333/0.4118/0.5000/0.6000 = 1−S/K, VERIFY_directionality).
  **No settle-to-cash leg, no `legValueUnified` cash path, no moneyness branch** ⇒ `raw_net` is a
  continuous function of moneyness (kills the 45% seam — §7 CM12).
- **POOL** — every leg does a LIVE reverse trade via `tradeUpdateAt`, best-effort (§5). The value
  above is already snapshotted, so the pool-move order is immaterial to payout.

### 1.2 Exact replacement for L2208–2268
Replace the block starting `let X, Y, m_s, m_b;` (L2212) through the end of the `else { … }`
(L2268) with:

```js
    // ── VALUE — single pre-close snapshot, BOTH legs, NO moneyness branch ──
    // Sell each leg back at TODAY's lensed mark (escrow units) at the ONE
    // pre-close pool state s0. legPrice reads getSNorm(s0); ITM legs tally
    // identically (markLensed = linear parity past S*). No settle-to-cash
    // path, no two-case branch ⇒ raw_net is continuous in moneyness (CM12).
    const s0 = s;                                    // snapshot BEFORE any reversal swap
    const px_s = legPrice(s0, sold_wing,   band.sold.inner,   band.sold.outer,   band.sold.N,   tau);
    const px_b = legPrice(s0, bought_wing, band.bought.inner, band.bought.outer, band.bought.N, tau);
    const X = px_s.V, m_s = px_s.m_star;
    const Y = px_b.V, m_b = px_b.m_star;
    const settled_cash_leg = null;                   // sell-back model: no leg settles to cash
    const live_leg = 'both';                         // every leg is a live reverse trade

    // ── POOL — every leg a LIVE reverse trade via the trade-point law
    // (tradeUpdateAt), BEST-EFFORT. dy_close = −(open dy) at the FROZEN dollar
    // tx-strike (Ksold/Kbought) ⇒ Δy round-trips EXACT; rho_close is re-derived
    // LIVE at today's state = (K_tx/oNow) / getSNorm(pool_now), so Δx carries
    // the documented one-signed drain (∝dy², §Drain / CM6-v3). A leg whose
    // reversal cannot fit the pool (tradeUpdateAt → null) is SKIPPED (pool
    // best-effort) — the option value/payout above still settles (§5).
    {
      const rhoSold = (Ksold / oForK) / getSNorm(s);
      const s_after_X = tradeUpdateAt(s, dyRevSold, rhoSold);
      if (s_after_X) s = s_after_X;                  // else best-effort: this leg's pool move skipped
    }
    {
      const rhoBought = (Kbought / oForK) / getSNorm(s);
      const s_after_Y = tradeUpdateAt(s, dyRevBought, rhoBought);
      if (s_after_Y) s = s_after_Y;
    }
```

### 1.3 What to DELETE / KEEP around it
- **DELETE** `rrSold` / `rrBought` (L2169–2170) — arc rebase factors, dead once `revertArc` is not
  called. (`oForK` L2158 is KEPT — the live path uses it for `rho_close`.)
- **KEEP** `soldITM` / `boughtITM` (L2178–2179) — still needed by the wing-lock (§1.4).
- **KEEP** the wing-lock loops L2193–2202 (the `if (!soldITM){…}` / `if (!boughtITM){…}` guards) and
  the both-ITM defensive guard L2203–2206, EXACTLY as-is (§1.4).
- **KEEP** `Ksold`/`Kbought`/`wsSold`/`wsBought`/`dyRevSold`/`dyRevBought` (L2159–2167) — the
  frozen-dollar reversal cash flows; the live path consumes `dyRevSold`/`dyRevBought` and `Ksold`/`Kbought`.
- **UPDATE the doc comment** L2078–2102 (the "TWO CASES / TWO JOBS / PRIMARY SEQUENCING" header) to
  describe the unified sell-back path. Not optional — a stale comment that still says "settle-to-cash"
  is a lie the skeptic/tester will flag. (Comment-only; behaviourally inert.)

### 1.4 The crossed-ray close swap at ρ>1 — wing-lock removal, sign, swap direction (item 1, NAILED)
- **Wing-lock removal for ITM legs.** The wing-lock (`wingMember`) checks a leg's live ray against the
  LIVE mode `sNorm0`. An ITM leg's ray has legitimately CROSSED the mode (that's what ITM means), so a
  naive wing-lock would falsely REJECT it. The existing `if (!soldITM){…}` / `if (!boughtITM){…}`
  structure already EXEMPTS ITM legs — **keep it exactly.** Do NOT extend the wing-lock to ITM legs.
  Rationale (VERIFY_directionality): the swap SKEW DIRECTION (dy,dx,dw signs) is continuous and
  unambiguous through ρ=1; only "which wing" flips, and wing is stored IDENTITY, not live geometry.
  soldITM/boughtITM now gate ONLY the wing-lock exemption — they no longer select a value/pool branch.
- **Sign / same-direction (measured, VERIFY_directionality PART 2).** Reversal cash flows:
  `dyRevSold = −(wsSold·(+1)·N·Ksold)`, `dyRevBought = −(wsBought·(−1)·N·Kbought)`.
  - collar (sold put + bought call): `wsSold=−1, wsBought=+1` ⇒ `dyRevSold=+N·Ksold`,
    `dyRevBought=+N·Kbought` — **both +** (cash IN).
  - sold call + bought put: `wsSold=+1, wsBought=−1` ⇒ **both −** (cash OUT).
  Both band legs move the pool the SAME direction on close (opposite to open). The sign algebra holds
  identically through ρ=1 (no moneyness branch touches it). ✓
- **The swap at ρ>1 (ITM).** `tradeUpdateAt(s, dyRev, rho_close)` with `rho_close =
  (K_tx/oNow)/getSNorm(s)`. For an ITM leg rho_close > 1; `tradeUpdateAt` places the trade point on the
  crossed side and applies the same conservation law — measured feasible and one-signed (drain) at
  every moneyness (§Drain table below covers call θ=1.3/2.0 ITM-ward, put θ=0.8, put-buy θ=0.7).

---

## 2. Value / settlement — UNCHANGED denomination (item 2)
Per-leg escrow-unit tally (`mark × N` via `legPrice`) → `raw_net = Y − X` → `payout = L0 · raw_net ·
carvedEquityAtClosure`. ITM legs tally identically (mark = parity in escrow units). No exercise path.
Job 2 (L2270–2335: `raw_net`, `carvedNotional`/`carvedEntryEquity`/`entryPerpMark`, `attributablePnL`,
`carvedEquityAtClosure`, `L0`, `trader_payout`/`club_delta`, club-equity floor) is UNCHANGED. The
escrow denomination is already verified consistent across wings / traverse / rebase
(VERIFY_escrow_denomination). The ONLY value-layer change is §1.2's single-snapshot valuation, which
removes the branch seam without changing the denomination.

Return shape: `settled_cash_leg = null`, `live_leg = 'both'`. The close-log line L2771 already handles
`settled_cash_leg` falsy → prints "[both legs reversed on AMM]" — correct, no display change needed.

---

## 3. Funding — change the WEIGHT only, full mark → extrinsic (item 3)

### 3.1 Exact change in `fundingPerStrike` (L2349–2357)
Replace L2353:
```js
    const m = markLensed(wing, strike_theta, mode, g);  // lens-aware mark, sNorm coord
```
with:
```js
    const mk = markLensed(wing, strike_theta, mode, g); // lens-aware mark, sNorm coord
    // EXTRINSIC weight = mark − max(intrinsic parity arm, 0). Zero past S* (ITM)
    // ⇒ funding ZERO ITM; clean single hump peaking at ATM, fading to 0 both ways.
    // Uses markLensed's OWN linear-intrinsic arm, same variable mapping here
    // (markLensed's sNorm ← funding's `mode`; markLensed's theta ← `strike_theta`):
    //   put  parity = max(0, 1 − mode/strike_theta)   [markLensed put:  1 − sNorm/theta]
    //   call parity = max(0, 1 − strike_theta/mode)   [markLensed call: 1 − theta/sNorm]
    const intr = (wing === 'call') ? Math.max(0, 1 - strike_theta / mode)
                                   : Math.max(0, 1 - mode / strike_theta);
    const ext = mk - intr;                              // extrinsic (option-part) weight
```
and replace L2356:
```js
    return kappa * gamma * N * m * (S - 1) / S * dt;
```
with:
```js
    return kappa * gamma * N * ext * (S - 1) / S * dt;
```

### 3.2 What is KEPT EXACTLY (do not touch)
`S = poolMark/oracle` (the pool-imbalance term), `gamma = (wing==='call')?+g:-g` (±g_loc, the shipped
sign), `(S − 1)/S`, `kappa`, `N`, `dt`, the `if (S <= 0) return 0` guard, `mode = getSNorm(state)`,
`g = gLoc(state, strike_theta, tau)`. **KEEP the existing pool-imbalance sign `±g·(S−1)/S` EXACTLY.**
Do NOT switch to per-leg / same-slope: VERIFY_funding measured that adopting the entry-386 same-slope
read ADDS the "sus" inversion (sign flips at mode, magnitude dips to 0 at ATM then rises, blows up deep
ITM). The only change is the weight `m → ext`.

### 3.3 Measured result (matches VERIFY_funding, re-confirmed against the engine 2026-07-07)
put θ=1, g=2, sweeping the mode/spot coordinate:

| sNorm(mode) | markLensed | intr (parity) | extrinsic | note |
|---|---|---|---|---|
| 3.0 (deep OTM) | 0.0165 | 0.0000 | **0.0165** | fades toward 0 |
| 1.5 | 0.0658 | 0.0000 | 0.0658 | |
| 1.0 (ATM) | 0.1481 | 0.0000 | **0.1481** | hump peak |
| 0.667 (=S*) | 0.3330 | 0.3330 | **0.0000** | seam: extrinsic dies |
| 0.25 (deep ITM) | 0.7500 | 0.7500 | **0.0000** | funding ZERO ITM |

Result: funding is a clean single hump peaking at ATM, exactly 0 past the smooth-paste seam S*
(extrinsic ≡ 0 ITM), fading to 0 deep OTM. This is the operator's intended shape (entries 445–447,
450–451: "funding zero ITM", "option part value when OTM").

---

## 4. Arc receipt STORED but DORMANT (item 4)
`openBand` (L2612–2733) is **UNCHANGED**: it keeps storing `arc = {dxA, dyA, dwA, oOpen}` on each leg
(L2677/2684) and `K_tx` (L2676/2683). The `revertArc` function (L1752) stays in the file. The live
close simply STOPS calling `revertArc`. UPDATE 2's charge-back reads the stored `arc` (open + close
counterfactual) with zero re-plumbing. State this in the code comment where `revertArc` is defined:
"kept for UPDATE-2 charge-back; the live close uses tradeUpdateAt (§SPEC_update1)".

---

## 5. Depth at close — best-effort (item 5)
The reserve-leg reversal is best-effort; the option-layer settlement is full. Mechanism (§1.2): each
`tradeUpdateAt` reversal is wrapped `if (s_after) s = s_after;` — a leg whose reversal cannot fit the
pool (`tradeUpdateAt → null`, i.e. the `yTn > bT` admissible-domain floor) is SKIPPED, the pool is left
unmoved for that leg, and `closeBand` STILL returns `ok:true` with the full `raw_net`/`trader_payout`
from the snapshot values. **Do NOT `return {ok:false}` on a null reversal** (that is the current
behaviour and it must change — a leg that can't fully fit must not block the option settlement). Note
there is no `DEPTH_FRAC` reject on the close path (that guard is `executeLeg`-open only); the close's
only feasibility gate is `tradeUpdateAt`'s null return. Optional: log a one-line "close reversal
best-effort: <leg> pool move skipped (depth)" for the trade log.

---

## 6. The drain is KNOWN and DOCUMENTED, not fixed (item 6) — the UPDATE-1↔2 seam

**Measured on the new live close** (default pool `{x:10, y:800000, w:½}`, oracle 80000, m=2, no
external move; open a leg then reverse via `tradeUpdateAt(s1, −open dy, rho_close)`):

| wing/leg | θ_chosen | N | Δy | Δx (drain) | Δx/N² |
|---|---|---|---|---|---|
| call/sell | 1.3 | 0.05 | 0.0 exact | −6.62e-4 | −0.265 |
| call/sell | 2.0 (ITM-ward) | 0.05 | 0.0 exact | −1.22e-3 | −0.489 |
| put/sell | 0.8 | 0.05 | 0.0 exact | −4.16e-4 | −0.166 |
| put/buy | 0.7 | 0.05 | 0.0 exact | −3.68e-4 | −0.147 |

Scaling (call/sell θ=1.3, N∈{0.01…0.08}): `Δx/dyRev²` = −1.47e-11 → −1.43e-11, near-constant ⇒
**Δx ∝ dy² to leading order.**

Properties (state verbatim in the CTO note):
- **Δy = 0 exactly** — the frozen-dollar reversal cash flow (`dy_close = −open dy` at `K_tx`)
  round-trips the y-leg machine-exact.
- **Δx < 0, one-signed, at EVERY moneyness** (OTM and ITM alike — this is NOT a crossed-wing artifact).
  The pool loses x on every round trip. Magnitude ∝ dy² ⇒ tiny per small trade (~0.0066% of the pool's
  x reserves at N=0.05 on the default pool), but COMPOUNDS over many round trips.
- **Root cause:** `rho_close` is re-derived LIVE at close (`(K_tx/oNow)/getSNorm(s)`), so
  `tradeUpdateAt` recomputes the trade point from the moved pool — the reverse dx ≠ −(open dx). The
  frozen-arc `revertArc` was exact (Δx=0) precisely because it froze the arc; the live trade-point law
  trades that exactness for theoretical cleanliness (a real reverse trade on today's curve).
- **Harmless in the single-user sim:** one wallet = self-drain, no counterparty is credited the lost x.
- **MUST be flagged for the multi-party backend (CTO / UPDATE 2):** in a shared pool this is an
  LP-value leak. UPDATE 2's counterfactual receipt + charge-back + pool-value floor neutralizes it.
  This is the exact seam between the two updates.

---

## 7. Gates (item 7)

### 7.1 CM6-v2 → RETIRE, replace with CM6-v3 (documents the drain)
CM6-v2 (`lens_selfcheck.js` L280–394) asserts the frozen-arc round trip restores x,y,w exactly and
that own-flow nets to zero (no-free-money). Under the live close BOTH invert: the round trip now
LEAKS x (by design), and its negative control (which asserted a live re-registration leaks) is now the
SHIPPED behaviour. **Retire the whole CM6-v2 block.** Replace with **CM6-v3** that pins the drain as an
ACCEPTED property (no-free-money returns in UPDATE 2 with the floor):
- **CM6-v3.1** — live close on the exhibit gives **Δy = 0 exactly** (≤1e-9) — the frozen-dollar
  reversal invariant survives.
- **CM6-v3.2** — live close gives **Δx < 0** (one-signed drain) on a grid of {call/sell θ=1.3,2.0;
  put/sell θ=0.8; put/buy θ=0.7} × N, at OTM AND ITM strikes (proves the drain is moneyness-independent,
  not a crossed-wing artifact).
- **CM6-v3.3** — **Δx ∝ dy²**: `Δx/dyRev²` constant to within a few % across N∈{0.01…0.08} (measured
  −1.47e-11→−1.43e-11).
- **CM6-v3 negative control** — assert the drain is PRESENT (|Δx| > 1e-6 on the exhibit); a build that
  silently restored an exact close (revertArc back in the live path) would drive Δx→0 and FAIL here.
  (This inverts CM6-v2.4 — deliberate: the drain is now the expected state, pending UPDATE 2.)
- **Do NOT assert no-free-money** in CM6-v3 (that is UPDATE 2's floor property).

### 7.2 NEW CM12 — payout continuity across the old two-case boundary
Sweep the oracle/spot so ONE leg crosses OTM→ITM (its `sNorm` crossing `leg.inner`), the crossing where
the OLD two-case branch switched. Assert `raw_net` (and `trader_payout`) is CONTINUOUS across the
crossing — no jump. The measured old-protocol jump was `+1.18e-2 = 45.4% of |raw_net|` (the 221→1.24
seam); assert the new build's step across the boundary is < ~1e-3 of |raw_net| (i.e. the seam is gone).
Negative control: the pre-update two-case build exhibits the 45% jump exactly at that boundary.

### 7.3 Funding-extrinsic gate (new check, negative-controlled)
- extrinsic weight `= markLensed − max(intrinsic,0)`: assert **= 0 (≤1e-12) past S*** (put sNorm < θ·g/(g+1),
  call sNorm > θ·(g+1)/g) on both wings ⇒ funding zero ITM.
- assert the extrinsic profile is a **single hump peaking at ATM** (sNorm = strike θ), fading to 0 both
  ways (monotone up OTM→ATM, monotone down ATM→S*).
- assert the shipped SIGN/pool term is unchanged: `sign(f) = sign(gamma·(S−1))` with `gamma=±g` — i.e.
  the `±g·(S−1)/S` factor is byte-identical to today (only the weight changed).
- negative control: the pre-update full-mark funding is NON-zero past S* (funds full intrinsic forever).

### 7.4 Survivors (must stay green — confirm, don't re-derive)
- **CM8-v2** (trade-point exhibit w′=11/21, SPOT trio byte-identical) — SURVIVES untouched (open path
  unchanged).
- **CM1–CM5, CM7, CM9, CM10, CM11** — SURVIVE (lens/markLensed/gLoc/trade-map/power-law untouched).
- **a16_atm_gate 5/5** — SURVIVES (touches only the ATM smooth-paste value, not close/funding).

Total lens_selfcheck count changes: CM6-v2 (5 sub-checks) retired, CM6-v3 (~4) + CM12 (~2) +
funding-extrinsic (~4) added — net count is the intern's to report; all HARD, all negative-controlled.

---

## 8. Migration — legacy bands (item 8)
Legacy bands (opened before / without an `arc`) close via the SAME live path — **no fallback branch
needed.** `Ksold`/`Kbought` (L2159–2162) already fall back `K_tx → K_inner → inner·oForK`, so a dollar
tx-strike is always defined; `rho_close = (Ksold/oForK)/getSNorm(s)` is always computable; the reversal
is `tradeUpdateAt`. This RETIRES the old legacy `tradeUpdate(s, dyRev)` at-strike fallback (a legacy
band now also live-closes and incurs the documented drain — intended unification). Confirm: no band
shape can reach `closeBand` without a derivable `Ksold`/`Kbought`.

---

## 9. Acceptance anchors (hard, measured)
1. Exhibit `w′ = 11/21` on OPEN — UNCHANGED (open path untouched; CM8-v2).
2. A matched open→close round trip is payout-continuous across the OTM/ITM boundary (the 45%→~0 seam
   kill) — CM12.
3. Funding extrinsic = 0 past S* on both wings, hump peak at ATM = 0.1481 (put θ=1, g=2) — §3.3.
4. Drain magnitude documented: Δy=0 exact, Δx<0 one-signed ∝dy², ≈−6.6e-4 at N=0.05 call/sell θ=1.3
   on the default pool — §6.
5. Δy round-trips exact on every leg (frozen-dollar reversal invariant) — CM6-v3.1.

## 10. Operator-tier FLAGs (genuine only)
- **F1 — the drain ships un-neutralized in UPDATE 1 (by operator sequencing, entry 452).** It is
  harmless in the single-user sim (self-drain) but is a real LP-value leak in the multi-party backend.
  UPDATE 2 (parked, entry 451) is its fix. This must be in the CTO note as "parked TBD, not implemented".
- **F2 — no other operator-tier semantics change.** The escrow denomination (symmetric-escrow payout,
  not classical per-wing intrinsic) is UNCHANGED and was already operator-confirmed under the sell-back
  model (entry 451: "moot / no change except the sell back model then we good"). No exercise path.

---
_Provenance: engine measured at HEAD (`0e0a0062` blocks); formulas re-confirmed 2026-07-07
(`scratchpad/drain.js`, funding extrinsic table). No Aristotle obligation in this spec — it is a build
spec, not a proof. Discipline: this is a splice spec; the intern implements, the file-safety gate +
tester + skeptic scope-gate + manager verification follow (operator sequencing)._

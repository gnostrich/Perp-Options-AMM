# SPEC — CLOSE AS A FIRST-CLASS TRADE (option b, curve-native close) — 2026-07-03

_Author: research-lead. **Design-complete, NOT splice-ready** (design first, per the brief).
Read-only on the engine — no HTML edit, no Aristotle submission (obligations queued only), no git.
Every number below measured in a Node vm sandbox against the REAL HEAD engine
(`engine/builds/HEAD_temporal_mvp_v28_lens.html`, md5 `0e0a0062…`), harnesses in session scratchpad
`closeb/` (`h1_drain.js` … `h6_floor.js`). Ground: operator RULING **entry 405 "its to be b"**
(2026-07-02), context entries 399/403/404/406; supersedes — WHEN BUILT — the frozen-arc `revertArc`
close (build `0e0a0062`, spec `SPEC_tradepoint_conservation_2026-07-02.md` §1.4) and the LOCKED
two-case settlement protocol. R6 skeptic scope-gate + itemized operator go come AFTER this spec._

---

## 0. Ruling and frame (load-bearing)

Operator entry 405: **close is a second FIRST-CLASS TRADE on the live curve** — one tx logic for open
and close, curve-native, **no frozen-arc un-booking, no separate ITM-to-cash branch.** Frame (entry
399): every pool booking is an asset swap **at a strike** (buy call = buy asset at strike; buy put =
sell asset at strike; sells reversed). Under (b) a close is the **opposite** swap at the same strike
against **today's** curve:

```
dy_close = −dy_open = ∓ N · K_tx     (strike-pinned cash leg, K_tx FROZEN at open — unchanged)
dx_close = tradeUpdateAt(state_live, dy_close, ρ_close)   (live trade-point law at today's state)
ρ_close  = (K_tx / oracle_now) / mode(state_live)         (live registration — the faithful (b) read)
```

Trader proceeds stay on the **option-price layer** (`trader_payout = L0 · raw_net · carvedEquity`,
`raw_net = Y − X` from `legPrice`), unchanged. **My analysis confirms this division of labour must be
kept — and reveals it is exactly what makes (b) safe on the value axis but NOT on the curve-shape
axis. Read §1 and §4; the curve-shape hazard is the central operator escalation.**

---

## 1. THE SYSTEMATIC x-DRAIN under (b) — re-derived (MUST-RESOLVE 1)

### 1.1 It is a one-signed drainable bias, not honest slippage
The trade-point law `tradeUpdateAt` **warps w**; it is not reserve-conserving. Open warps w toward
the trade at ρ_open; a live close warps at ρ_close ≠ ρ_open (the mode moved), so the two do **not**
cancel. Measured zero-market-move open→close round trips (harness `h1_drain.js`, live registration):

| case (zero move) | pool x residual | direction |
|---|---|---|
| exhibit call-in (10,10,½), ρ=4, dy=+1 | **−0.0278** | pool LOSES x |
| exhibit call-out | −0.0347 | pool LOSES |
| put-in ρ=0.25 | −0.997 | pool LOSES |
| put-out | −6.17 | pool LOSES |
| BTC call / put / leaned / deep-put | −6.6e-4 … −1.03 | **pool LOSES in ALL** |

The residual is **quadratic in dy** (∝ curvature: −0.0312·dy² small-dy on the exhibit) and **one-signed
(pool always loses)** across every wing, both cash directions, toy and BTC-scale. This is **not**
honest slippage (which must cost the transactor); it is a **drainable bias**. It **compounds**: 30
zero-move cycles at N = 50 % depth take the pool from value 1 600 000 → **800 029** and die at cycle
13 on depth exhaustion (`h6_floor.js`). At retail N = 5 % depth it bleeds 1 600 000 → 1 551 980 over
30 cycles (−3 %) — slow but monotone and free.

The same leak exists between **any two opposite opens** at one dollar strike (`h2_variants.js` (i):
sell-then-buy leaves x −0.0278) — it is a property of the warp law itself, already latent in the
shipped open path; (b) merely makes the close exercise it too.

### 1.2 Where the leaked value goes — the decoupling that decides severity
`dy` is **pool-internal financing** (the pool's y leg moves; the trader is NOT paid `dy` — proceeds
are the option-layer `L0·raw_net·carvedEquity`, and on a zero-move cycle `raw_net ≈ 0`, so the trader
gains **nothing directly** from the cycle). Therefore the drain is **pure LP value destruction**, not
a direct trader extraction. That is milder than a cash steal — **but** it is monetizable two ways:
(a) a follow-on arb captures the skewed pool; (b) — the real hazard — see §4.

### 1.3 What neutralizes the value drain — POOL-VALUE FLOOR (pinned default)
Because trader proceeds are option-layer and independent of `dx_close`, the close-swap registration is
a **pool-integrity choice, not a payout choice** (this is the §4 resolution). So we may pin the swap to
never lose pool value without touching any honest trader's payout. **Pinned default — the pool-value
floor:** execute the live-law close, then if pool value at `oracle_now` fell below the pre-open value,
credit the shortfall back into pool x (equivalently, charge the closer the shortfall as an
A15-family close-slippage haircut). Measured (`h6_floor.js`): the floor holds pool value **exactly**
(1 600 000 → 1 600 000 over 30 cycles, both N sizes) while every honest close is untouched (the floor
binds only on the leaking cycle direction). Property delivered: **pool value non-decreasing over any
open-close cycle** — the honest replacement for exact round-trip (see §3).

**The floor does NOT close the whole hazard — see §4. It fixes the value axis only.**

---

## 2. THE ITM-LEG CLOSE AS A TRADE — the crossed ray (MUST-RESOLVE 2)

### 2.1 The strike-pinned law extends continuously through the crossing
Under the LOCKED protocol the ITM leg is forbidden from the pool (wing-lock: its ray has crossed the
mode; it settles-to-cash on a separate branch). Under (b) it is just the opposite swap. `tradeUpdateAt`
takes `(dy, ρ)` and is **continuous through ρ = 1** (the mode-crossing): no branch, no wing-lock test.
`dy_close = ∓N·K_tx` is frozen and thus continuous in spot; `dx_close` is the live law evaluated at a
ρ that passes smoothly through 1 as the leg goes OTM→ITM. Verified: across a full oracle sweep
68 000 → 96 000 (both strikes crossed, deep-ITM ends) **zero (b)-close rejections** on the ITM path
(`h4_continuity.js`). The value layer already crosses smoothly (smooth-paste, O1/O2 trusted-from-prover);
(b) makes the **transaction** layer cross smoothly too.

### 2.2 The skeptic's branch jump DISSOLVES — demonstrated
The LOCKED two-case scheme flips **both-reversed → one-settled** at the pool-mark ITM boundary
(measured flip at oracle ≈ 83 900 for the test band). Across that flip `trader_payout` **jumps 221.38**
on a $50 oracle step, while smooth steps elsewhere are ≈ $1.3 — a genuine discontinuity (skeptic's
"+0.016·equity·L0" class; reference 0.016·8000·5 ≈ 640, same order). Under (b) the **same** oracle step
moves `trader_payout` by **1.24** (harness `h5_crossing.js`), i.e. the branch jump collapses by ~180×
into the ordinary smooth per-step drift (max (b) step across the whole sweep = 1.32 vs OLD 221.38).
**Total proceeds are continuous in spot under (b).** This is the strongest argument FOR (b) and it is
now numerically pinned.

---

## 3. NO-FREE-MONEY FATE + GATE PLAN (MUST-RESOLVE 3)

Exact reserve round-trip is **gone by design** under (b) (§1: only the frozen arc restores reserves
exactly, and that IS option (a)). The **replacement property** (pinned, with the §1.3 floor):

> **P-CYCLE (pool no-free-lunch):** pool value at the reference price is **non-decreasing** under any
> open-close cycle; equivalently the closer's cycle-cost ≥ 0 net of the market move.

This holds exactly with the pool-value floor (measured, §1.3). Note P-CYCLE is **strictly weaker** than
the retired "reserves round-trip exactly" — it protects LP wealth (value) but NOT curve shape (w/γ);
that gap is §4.

### Gate plan (sketch — R6-gated, tester-owned final form)
- **CM6-v2 (frozen-arc round trip) — RETIRE.** Its negative control CM6-v2.4 asserts *"live
  re-registration LEAKS ⇒ the arc is load-bearing"* — under (b) that leak is the **design**, so the
  gate is inverted and would go red on the correct build. Remove CM6-v2.1/.2/.3/.5 (arc exactness).
- **CM6-v3 (pool no-free-lunch) — ADD [HARD]:**
  1. zero-market-move open→(b)close leaves pool value ≥ pre-open (≥ −1e-9 tol) on the §5 case grid,
     both wings, both directions — the floor binds, never a pool loss;
  2. an honest close (single trade, no cycle abuse) pays the option-layer `raw_net` unchanged;
  3. **negative control:** the *un-floored* live close on the exhibit leaves pool value < pre-open by
     > 1e-3 (proves the floor is load-bearing — the inverse of old CM6-v2.4);
  4. **γ-ratchet bound** (see §4): N cycles at fixed dy move w by ≤ the per-cycle bound; a build
     without the §4 mitigation fails this (negative-controlled).
- **CM8-v2 (open trade-point law) — SURVIVES** unchanged (open still uses `tradeUpdateAt`; the 11/21
  exhibit, ρ=1 reduction, local-pair conservation are all still true).
- **CM1–CM5, CM7, CM9–CM11 + a16 SURVIVE** (lens/mark layer untouched).
- Branch-continuity **NEW gate CM12 [HARD]:** across the ITM crossing the (b) `trader_payout`
  per-oracle-step ≤ K·(smooth bound), with the OLD two-case build failing it (jump ≈ 221).

---

## 4. CLUB/PAYOUT INTERACTION + THE CURVE-SHAPE HAZARD (MUST-RESOLVE 4) — **CENTRAL OPERATOR ESCALATION**

### 4.1 Division of labour: kept, and it is what makes the floor free
Proceeds remain `L0 · raw_net · carvedEquity` (option layer); the club is still the counterparty; the
carve/L0/floor payout path is **untouched**. Because `dx_close` never reaches the trader, the §1.3
pool-value floor costs honest traders **nothing** — the two doctrines (option-layer proceeds; pool as
financing/integrity) **do not collide on the value axis.** Resolution: **the close-swap registration
is a pool-integrity mechanism, in the A15 slippage-haircut family, NOT a payout term.** No pool flow
carries trader economics.

### 4.2 They DO collide on the curve-shape axis — and the floor does not fix it
`γ = w/(1−w)` is read **live** and prices **every** strike's mark, funding rate, and seam
(`g_loc = m·γ`). The §1 drain ratchets **w** monotonically. Critically (measured, `h6_floor.js`):

| policy | pool value (30 cyc, N=50%) | w drift | γ end |
|---|---|---|---|
| live (naive b) | 1 600 000 → 800 029 | 0.500 → 0.935 | **14.4** |
| **pool-value floor** | 1 600 000 → **1 600 000** | 0.500 → **0.935** | **14.4** |

**The pool-value floor holds LP wealth exactly yet w still ratchets 0.5 → 0.935 (γ 1 → 14.4).** So an
attacker can, at **bounded value cost** (the floor makes cycling value-neutral, not costly), **ratchet
the shared curve steepness γ** and reprice the entire book's marks/funding/seams — the "each trade's
skew moves every other strike's mark" externality the paper §limits already names, now **weaponizable
by free cycling** because the close no longer restores w. The LOCKED frozen arc did **not** have this
vector (it removed the leg's own w-increment `dwA` exactly). **This is a NEW hazard introduced by (b),
and no pure-(b) registration + value floor removes it** — only undoing the leg's own w-increment does,
which is the arc's `dwA` (option (a) machinery).

### 4.3 The resolution the design implies — **OPERATOR DECISION (flag loudly)**
Pure (b) as literally ruled (live-everything, no un-booking) is **not shippable against a curve-shape
attacker.** The options, in increasing fidelity to the (a)-ban:
- **R-A (recommended graft):** (b) live-`dx` reserve flows (curve-native execution, ONE law, NO
  separate ITM branch — the operator's core wins are kept) **+** restore the leg's own w-increment
  `dwA` at close (stored at open, same field the arc already carries). Kills the ratchet; keeps live
  reserves/value; the ITM branch and un-booking-of-reserves are still gone. It imports **only** the
  scalar `dwA` bookkeeping — a *partial* un-booking of the **lean**, not of the reserves. This is
  "mostly (b)" and is my recommendation.
- **R-B:** (b) + pool-value floor **+** an explicit **rate-limit / escalating close fee** that makes
  γ-ratcheting costly (bounds, does not eliminate; adds a genuine pool→club economic flow → reopens
  the division-of-labour question the operator closed).
- **R-C:** accept the ratchet as disclosed and rely on arb + funding to mean-revert γ (weakest;
  contradicts "curve steepness is set at calibration, static under trading," CLAUDE.md §0.3 / entry 3).

**FLAG-CURVE (operator-tier):** (b) dissolves the ITM branch jump (§2, a real win) but opens a
curve-steepness manipulation vector that (a) did not have; the value floor alone does not close it. Pin
= **R-A**. Operator must choose R-A / R-B / R-C before build. _(This is the one genuinely operator-tier
resolution; everything else in this spec is pinned with defaults.)_

---

## 5. DEPTH / FEASIBILITY AT CLOSE (MUST-RESOLVE 5) — pinned default + flag

Under (b) a close is a live trade and **can fail the trade-point depth guard** (a cash-out close whose
`N·K_tx` exceeds `DEPTH_FRAC · w·y·ρ^w` at today's state — e.g. a deep-ITM leg on a thinned wing). A
blocked close is worse than a blocked open (the trader is stuck in a position). The decoupling (§1.2)
gives a clean semantics **enabled by (b)** that the LOCKED scheme could not offer:

- **Pinned default — best-effort reserve leg + full option-layer settle.** The pool swap executes as
  far as depth allows (up to `DEPTH_FRAC` of trade-point depth) under the value floor; the
  **option-layer payout `L0·raw_net·carvedEquity` is paid in full regardless**, because proceeds never
  depended on the reserve swap completing. The position closes; the pool absorbs what it can; the floor
  protects LPs. No trader is trapped.
- **Alternatives (operator decision, FLAG-DEPTH):** (i) hard reject with the numbers (consistent with
  opens, but traps the trader); (ii) partial close (reduce N pro-rata, leave a residual leg open);
  (iii) escrow the un-fillable remainder. Pin = best-effort-settle; escalate the choice.

---

## 6. MIGRATION (MUST-RESOLVE 6)

- **Open path unchanged.** Opens still call `tradeUpdateAt`; `openBand` still stores `K_tx` and the arc
  fields `{dxA, dyA, dwA, oOpen}`. Under R-A the close consumes **`K_tx`** (live registration) and
  **`dwA`** (ratchet un-wind) — both already stored on every band this build opened. Legacy bands from
  the current `0e0a0062` build **carry all needed fields** ⇒ they close cleanly under (b); no legacy
  fallback branch is required (unlike the pre-arc fallback the LOCKED spec needed).
- **CM8-v2 survives; CM6-v2 retires → CM6-v3** (§3). **DIFF_LEDGER / inventory (#16 anchoring, close
  semantics):** close changes from *exact reserve round-trip (OTM) + settle-to-cash (ITM)* to *one
  live trade-point swap under a pool-value floor, both legs, continuous through ITM*. The paper's
  "round-trip residual arises only when an ITM leg settles to cash" (§7) becomes "every close carries a
  bounded residual absorbed by the pool-value floor."
- **CM8-v2 negative controls and the 11/21 open exhibit are unaffected.** The tester's standing
  smoke-pass must add: a close that crosses the ITM boundary shows **no payout jump** (the §2 win) and
  an abusive cycle shows **flat pool value + bounded γ drift** (the §4 gate).

---

## 7. PAPER ALIGNMENT (MUST-RESOLVE 7) — camera-ready revision sentences

The submitted paper (`temporal_wine2026_v2.tex`, md5 `f8b37a71`) is **(b)-compatible on OTM legs** (it
already reads close as "each leg reverses its opening swap" — a live at-strike reversal) but states the
**two-case ITM-cash rule at 4 sites**. Exact revisions for camera-ready (do NOT edit now — paper is
submitted; these are for the revision, operator/paper-owned):

1. **Journey step "You close" (lines ~294–298).** Current: *"Each leg still on the pool reverses its
   opening swap at the same frozen K_tx—the reserves round-trip exactly. A leg past its boundary has
   left the pool's world: it settles to cash at its mark, no pool swap (the two-case rule…)."*
   **Revision:** *"Each leg reverses its opening swap on today's curve at the same frozen K_tx — one
   trade law for open and close. A leg past its boundary reverses the same way (no separate cash
   branch); the pool no longer round-trips exactly, so a small residual is absorbed by a pool-value
   floor that never lets a close reduce pool value."*

2. **Limitations, round-trip residual (lines ~755–758).** Current: *"the reversed legs round-trip the
   pool exactly (Section 4); the residual arises when an in-the-money leg settles to cash, so its
   opening swap remains in the pool."* **Revision:** *"every close is a live trade-point reversal, so
   the pool carries a bounded residual (not only on in-the-money legs); a pool-value floor makes the
   residual LP-non-negative, and its quantitative treatment — and the curve-steepness drift a residual
   close permits — are open."* _(This is where FLAG-CURVE §4 gets its honest paper disclosure.)_

3. **Incentive paragraph, frozen transaction strike (lines ~766–769).** Current: *"the frozen
   transaction strike returns the pool's reserves exactly on every leg reversed at close (an
   in-the-money leg settles to cash instead), so no repricing profit is extractable from the pool's
   reserves."* **Revision:** *"the frozen transaction strike and a pool-value floor ensure a close
   never reduces pool value on any leg (in- or out-of-the-money), so no repricing profit is extractable
   from the pool's value — though curve-shape drift under repeated closing is a disclosed open
   surface."*

4. **Settlement annex, two-case rule (lines ~845–849).** Current: *"A band has two legs on opposite
   wings; spot cannot be in-the-money on both at once, giving a clean two-case settlement. The
   composite-ray closed form holds across the out-of-the-money→in-the-money boundary under the
   effective-strike substitution."* **Revision:** *"A band has two legs on opposite wings. Both legs
   close by the same live trade-point reversal — there is no separate in-the-money settlement branch;
   total proceeds are continuous across the out-of-the-money→in-the-money boundary (the value layer's
   smooth-paste extends to the transaction layer)."* Delete "clean two-case settlement"; the
   `\tfp{}^{L10}` composite-ray citation stays (value continuity is what it supports).

Also line ~743 ("small trader-borne round-trip residual (open-then-reverse at the same ray)") is
already (b)-honest — keep, but drop "small" if FLAG-CURVE resolves to R-B/R-C. **These are the
operator/paper-owner's edits; flagged, not made.**

---

## 8. QUEUED LEAN OBLIGATIONS (NOT submitted — no-Aristotle order)

Pin predicates first, then submit post-go:
- **CL1 — proceeds continuity:** `TotalProceeds(spot)` continuous across ρ=1 (ITM crossing) for the
  (b) close; the two-case scheme is discontinuous (counterexample witness = the §2 flip). Formalizes §2.
- **CL2 — pool no-free-lunch (P-CYCLE):** with the value floor, `poolValue(close(open(s,·),·)) ≥
  poolValue(s)` for all admissible (dy, ρ_open, oracle path). Formalizes §3.
- **CL3 — γ-ratchet bound:** un-floored/naive (b) admits `w_n → 1` under N zero-move cycles
  (the manipulation); R-A (w-increment un-wind) gives `w_close = w_pre_open` ⇒ no ratchet. Formalizes §4.
- **CL4 — depth best-effort settle well-posedness:** option-layer payout is independent of reserve-swap
  completion (the decoupling), so a depth-blocked close still settles. Formalizes §5.
- Re-scope note for INDEX: `SPEC_tradepoint_conservation` §1.4 frozen-arc / CM6-v2 obligations become
  **superseded** on the (b) build; the open-law obligations (CM8-v2 family) carry over unchanged.

---

## 9. Scope honesty
Read-only on the engine; no splice; no Aristotle; no git; no agent-memory of another agent touched.
All numbers from Node vm sandboxes over the extracted HEAD engine (`closeb/h1…h6`). Design-complete,
**not splice-ready** (per brief). The **one operator-tier decision is FLAG-CURVE §4** (R-A/R-B/R-C);
FLAG-DEPTH §5 is a secondary operator choice with a pinned default. Everything else is pinned with a
default and a stated alternative. Nobody splices from this document alone — R6 skeptic scope-gate +
itemized operator go come first.

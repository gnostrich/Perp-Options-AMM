# SPEC — At-strike AMM swap (register row A14) · 2026-06-12

**Status: SPEC DRAFTED, BUILD BLOCKED — §2 finds the open-then-immediately-close round trip
TRADER-FAVOURABLE in ALL four leg directions under at-strike write + lensed settle (band case:
+$125,409 riskless on $80,000 notional, measured on the live engine). Per the commissioning
brief's own rule ("trader-favourable = HARD RED / DO-NOT-BUILD"), §2 is a HARD RED. §§1, 2.3,
3–5 are buildable as written; the build as a WHOLE is DO-NOT-BUILD until the §2 seam is closed
by an operator-tier decision (candidate closures listed §2.4 — every one of them touches ruled
architecture, so none can be picked here).**

- Drafter: manager-commissioned read-only spec drafter, 2026-06-12. No edits outside this file,
  no git, no memory writes. Skeptic R6 gate PENDING — nothing here is shared truth yet.
- Target: HEAD `engine/builds/HEAD_temporal_mvp_v28_lens.html`, md5 `4378bc1192878cfe437b8fa5551c5b88`
  (verified this run).
- Measurements: live engine `<script id="engine">` sandboxed in Node (`vm.runInNewContext`),
  script `/tmp/a14_seam.js`, default pool `{x:10, y:800000, α:5, β:400000}` (HEAD L2215),
  oracle 80000 (L2216), τ=0.3 (L2237). All numbers **[verified-here]** float64.
- Ruled architecture (R1 anchors): operator entries 127, 153 #4, 184, 186, 187
  (`history/operator/2026-06-10_kurtosis-curve-family-brief.md` L957–961, L1173–1179, L1423–1453);
  register row A14 (`docs/COMPONENT_REGISTER.md` L76); prior analysis
  `notes/research/WARP_PER_NOTIONAL_analysis_2026-06-12.md` §4 (Rule C column);
  skeptic verdict #42 `notes/skeptic/VERDICT_ENTRY127_atstrike_amm_tx_2026-06-12.md`;
  two-basis hazard `notes/research/LENS_lifecycle_transact_goalseek_FEASIBILITY_2026-06-12.md` O5.

## Notation (entry 153 #7 — no bare symbols)
| Symbol | Plain English |
|---|---|
| N | option quantity, in BTC (the notional asset amount) |
| K | the strike, in DOLLARS |
| θ (theta) | the strike as a ratio, K ÷ oracle price — the engine's internal strike coordinate |
| dy | the dollar amount the pool swap adds to (+) or removes from (−) the pool's cash side y |
| V | the option premium of a leg (quantity × lensed option price), in BTC; ×oracle = dollars |
| markLensed / m | the lensed option price per unit, a number in [0,1] |
| γ (gamma) | curve steepness, w/(1−w) = (y−β)/β on the live pool |
| β (beta) | the pool's cash-side carve constant (=$400,000 on the default pool) |
| y−β | the pool's available cash depth (the most cash any swap can ever take out) |

---

## 1. The new `executeLeg` — at-strike pool cash (replaces L1761–1772 sizing ONLY)

### 1.1 The dy formula
Per leg (legType ∈ {sell, buy}, wing ∈ {call, put}):

> **K_usd = θ_inner × oracle** (the live-ray strike registration inverted: rays are stored as
> θ = K/oracle — `openBand` sets `sold.inner = K/s_oracle_entry`, `closeBand` rebuilds
> `inner = K_inner/oNow` at HEAD L2000–2005; so dollars-of-strike = θ × the oracle threaded into
> the call).
>
> **dy = wingSign × legSign × N × K_usd**
>
> with the EXISTING sign convention unchanged (HEAD L1765–1767): wingSign = +1 call / −1 put;
> legSign = +1 sell / −1 buy. `post = tradeUpdate(state, dy)` — `tradeUpdate` (L1679) is
> **byte-untouched** (pool fn, plain v24).

This is "buy call = buy asset for dollars at the strike; sell call = the reverse" (entry 127)
rendered as bookkeeping cash (entry 153 #4): the pool swap's dollar size is **notional × strike,
premium-FREE**. The swap still executes at the live reserve point (spot) — A14 is a *sizing*
rule, NOT the execution-relocation-to-the-K-ray model (that relocation is BLOCKED by register
row A12 and carries skeptic #42(c)'s y~1/θ reserve divergence; it is NOT specified here).

Spread legs (theta_outer finite): dy uses the inner strike only — **DO-NOT-BUILD-THIS-PART**
as a guess; the operator has only ruled the barrier (single-strike) leg (entries 127/186/187
speak of one strike per leg). A spread's at-strike cash (inner−outer? inner only? both legs
separately?) is an undefined economic object → escalate. The live UI trades bands of barrier
legs, so this does not block the band path.

### 1.2 What happens to the premium V — stated precisely
`legPrice` (L1722–1736) is **unchanged, still called, first line of executeLeg**. Its V
(= N × markLensed, lensed, live-mode, reciprocal-sNorm — MUST-APPLY-1 intact) is still:
- **recorded** on the returned leg object (position value, trade log, preview display);
- **the settle basis** — closeBand / markEff / legValueUnified (L1915–1927, L1971+) unchanged:
  everything is read and settled at lensed prices (entry 96 stands);
- **the buy-notional sizer** — `executeBand` N_buy = V_sell / denom (L1848–1853) **KEPT
  byte-identical**: "option pricing enters ONLY at the buy leg; sold-leg premium proceeds
  determine how much you can buy" (entries 186/187). Sell notional = trader input, pricing-free.

V **no longer sizes dy**. That is the entire code delta of §1: one line, L1764–1767,
`V_usd = p.V·fx` → `K_usd`-based dy. closeBand's reversal legs go through executeLeg and
therefore inherit at-strike sizing automatically (reversal dy = −open dy exactly, since N and K
are stored per leg — pool restoration is then EXACT, measured x,y error 0.0 / 1.8e-15, §2.1).

---

## 2. THE TWO-BASIS SEAM — solvency/no-arb. **VERDICT: HARD RED, DO-NOT-BUILD AS-IS.**

### 2.1 The measured round trip (open, then immediately close; live engine, default pool, τ=0.3)
Write-basis = at-strike cash (strike-pinned, state-blind). Settle-basis = lensed mark at the
live post-warp pool (entry 96). The at-strike swap is strike-SCALE (dy = N·K, e.g. $120k where
the premium-sized HEAD moved $15k), so the trader's own bookkeeping swap moves w, hence the
lens mode, hence their own position's lensed mark — **and in every case it moves it in the
trader's favour**:

| Leg (N=1) | dy ($) | m_open | m_close (post-own-warp) | trader round-trip P&L | sign |
|---|---|---|---|---|---|
| sell call θ=1.5 (K=$120k) | +120,000 | 0.192986 | 0.113605 | **+$6,350** | TRADER |
| buy call θ=1.5 | −120,000 | 0.192986 | 0.661742 | **+$37,501** | TRADER |
| sell put θ=0.667 (K=$53.3k) | −53,333 | 0.192986 | 0.173355 | **+$1,570** | TRADER |
| buy put θ=0.667 | +53,333 | 0.192986 | 0.224183 | **+$2,496** | TRADER |
| sell call θ=4 (K=$320k) | +320,000 | 0.063496 | 0.022597 | **+$3,272** | TRADER |
| buy call θ=4 | −320,000 | 0.063496 | 0.854881 | **+$63,311** | TRADER |

Band path (the UI's actual trade: sell C@1.5×, N_sell=1, proceeds-buy C@2× ⇒ N_buy=2.3404;
sequential close per closeBand order): net pool Δy at open = −$254,463, γ warps 1→0.364, the
proceeds-sized bought leg marks itself up to V=1.6812 BTC ⇒ **trader raw_net = +$125,409 on an
$80,000-notional, zero-time, zero-risk round trip**. Pool x,y restore exactly after close
(1.8e-15, 0.0) — the pool's RESERVES round-trip clean; the pool's *premium ledger* bleeds.

### 2.2 Why it cannot be bounded or sign-fixed within A14 + entry 96
- **The sign is structural, not a convention slip:** the at-strike swap's direction (wingSign ×
  legSign) is by construction the direction of the position's own exposure, and its magnitude is
  strike-scale. Selling marks your short down; buying marks your long up — a self-pump in BOTH
  directions, so no sign flip fixes it. (Premium-sized HEAD has the same direction with
  premium-scale magnitude, where skeptic #32 ruled the FULL P&L pool-favourable; at-strike
  removes premium-sizing's natural self-damping — the warp no longer shrinks with the price.)
- **No fee bounds it:** the band leak is ~156% of notional per round trip.
- **This is exactly feasibility-O5** ("write-basis ≠ settle-basis = round-trip arb — single-basis
  holds ONLY if there is exactly ONE premium per leg"), realized at strike scale.

**The required gate-sign (pool-favourable) FAILS. STOP. Do not build §1 into HEAD with the
current settle layer.**

### 2.3 Reserve-boundedness — the guard (this part is closeable, and is spec'd)
On the v24 hyperbola, cash-IN legs (sell call / buy put, dy>0) are always representable
(x→α asymptote; never exceeds reserves — but warp is unbounded in K: γ_post = γ + N·K/β grows
without limit; see gate G-A14-6 characterization, and an optional max-warp guard is flagged
operator-tier, NOT spec'd). Cash-OUT legs (buy call / sell put, dy<0) hit the depth wall:

> **Hard wall (measured): N·K ≥ y−β ⇒ `tradeUpdate` returns null.** Default pool depth
> y−β = $400,000: buy call N=1 at θ=4.999 (K=$399,920) executes (γ→0.0002, pool pinned to the
> carve); θ=5.0 (K=$400,000) fails. The skeptic's "reserve-unbounded far OTM" warning lands on
> this side: far-OTM CALL strikes make N·K huge, and a BUY of them drains the cash side.

**GUARD (normative):** before `tradeUpdate`, if dy < 0 require
`N·K_usd < DEPTH_FRAC × (y − β)` with `DEPTH_FRAC` a named engine constant (proposed 0.90 —
operator-editable; the hard wall at 1.0 is a singularity, not a limit). On violation the leg
returns `{ok:false, reason: "At-strike cash $X exceeds pool cash depth $Y — trade rejected"}`
through the existing executeBand/closeBand failure path. **An honest REJECT with the numbers in
the reason string — NEVER a silent cap, never a clamped N.** (A close-time reversal that
violates the guard is impossible by construction — the reversal dy is cash-IN for what was
cash-OUT and vice versa, and pool restoration is exact — but the guard still wraps it, loudly.)

### 2.4 What could close the seam (ALL operator-tier — listed, NOT chosen)
1. Settle/close at a mark that excludes the position's own bookkeeping warp (self-impact-free
   close). Kills the §2.1 arb identically — but it is a per-position counterfactual pool state =
   stored history = the φ/weight-field regression root (feasibility headline), and it breaks the
   entry-96 "everything reads the live lensed state" single basis.
2. Make the at-strike swap warp-only at open and unwind-before-value at close (value at the
   self-reversed state) — same object as 1 in different clothes.
3. Re-scope entry 96: settle at entry-frozen marks. Reopens settled architecture (A12-adjacent).
4. Abandon premium-recorded P&L for at-strike positions (pure asset-for-$ bookkeeping ledger,
   payoff only at exercise). Changes the product's economic object.
None of these is pickable by a spec drafter. **Escalate via the manager with this section.**

---

## 3. Gate additions — `engine/verify/lens_selfcheck.js`, all HARD

| Gate | Assertion |
|---|---|
| G-A14-1 at-strike sizing | for each (wing, legType): executed `abs(dy) == N × θ_inner × oracle` machine-eq (`===` on the float product, same expression order as the engine) |
| G-A14-2 proceeds-sizing kept | executeBand N_buy == V_sell / legPrice(post-sell state, bought leg, 1, τ).V machine-eq; V still lensed (spot-check one strike against hand markLensed) |
| G-A14-3 pool fns byte-identical | `tradeUpdate` / `arbitrageToOracle` / `rebase` source text identical to v24 (existing regression check, re-asserted) |
| G-A14-4 round-trip sign/bound | open-then-immediate-close (the §2.1 band case + 4 single legs): trader P&L ≤ 0 (pool-favourable) required. **As specified today this gate is RED by measurement — it is the lock that keeps §2 honest. The build may not ship while it is red; it may NOT be weakened to pass.** |
| G-A14-5 reserve guard | cash-OUT leg with N·K = 1.01×DEPTH_FRAC×(y−β) → `{ok:false}` with the depth numbers in `reason`; N·K just under → executes; NO path mutates N (anti-silent-cap: assert returned leg N == input N) |
| G-A14-6 warp-rises-OTM | same N=1 sold call at θ = 1.1/1.5/2/4 ⇒ Δγ strictly increasing (measured lock: 0.2200 < 0.3000 < 0.4000 < 0.8000) and Δγ == dy/β machine-close (≤1e-12) — the new behavior pinned so a premium-sizing regression goes red |

Auto-routing in `run_all.sh` keeps the existing markLensed/!wField detection; gates G-A14-* are
additive within lens_selfcheck.

## 4. R3 control inventory (one line per control)
- **Notional input (N_sell)** — KEPT; now sizes the at-strike pool cash dy = N×K (was: sized the
  premium swap); still the trader's only size control, pricing-free (entry 187).
- **τ (kurtosis)** — KEPT, static, vol-set at deploy; unchanged by this build; still prices via
  gLoc/markLensed (settle + N_buy), no longer reaches dy at all.
- **w (curve weight)** — KEPT, trade-derived only (no slider); now moved strike-scale by trades
  (Δγ = dy/β = N·K/β exactly); rebase/funding contracts untouched.
- No new user control is added by this build. (DEPTH_FRAC is an engine constant, not a UI knob.)

## 5. R1 citation ledger
| Spec item | Ruling/source |
|---|---|
| at-strike = notional×strike, premium-free swap | entries 127 (L961), 184 (L1429); A14 row L76 |
| bookkeeping/virtual swap, prices via chart 2 | entry 153 #4 (L1179) |
| pricing only at buy leg; N_buy = proceeds/unit premium | entries 186 (L1445), 187 (L1453); A14 |
| settle-at-lensed stands; only swap sizing changes | entry 96 ruling (CLAUDE.md HEAD note); commissioning brief |
| sign convention / wingSign·legSign | HEAD L1750–1767 |
| θ→K live-ray registration | HEAD L1976–2005 |
| warp RISES OTM under at-strike (Rule C) | WARP_PER_NOTIONAL §4 table; re-measured §2.1/§3-G-A14-6 |
| reserve-unbounded far OTM warning | skeptic #42(c); re-measured as the cash-OUT depth wall §2.3 |
| two-basis round-trip hazard | LENS feasibility O5; realized + quantified §2.1 |
| execution-relocation BLOCKED (not this spec) | register A12 |

---
## BOTTOM LINE
At-strike sizing (§1), the reserve guard (§2.3), and the gates (§3) are precisely buildable.
**The build is DO-NOT-BUILD as a whole: the §2.1 seam is TRADER-favourable in all four leg
directions (band: +$125,409 riskless on $80k notional) — HARD RED, unbounded by fees, not a
sign slip. Gate G-A14-4 locks it; closing it requires an operator-tier choice from §2.4.**

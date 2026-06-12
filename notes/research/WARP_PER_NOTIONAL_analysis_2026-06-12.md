# WARP PER DOLLAR NOTIONAL — read-only analysis (operator entries 182/183/184)

**Label: manager-commissioned READ-ONLY analysis run, 2026-06-12. No edits, no git, no memory writes.
Skeptic audit PENDING — nothing below is shared truth until the skeptic passes it.**

- Target: live HEAD `engine/builds/HEAD_temporal_mvp_v28_lens.html`, md5 `4378bc1192878cfe437b8fa5551c5b88` (verified this run).
- Method: engine `<script id="engine">` sandboxed in Node via `vm.runInNewContext`
  (`/tmp/warp_extract.js`); measurements `/tmp/warp_per_notional.js`; band-path check `/tmp/warp_band_net.js`.
  All numbers below are float64 outputs of those scripts on the live engine — **[verified-here]**.
- Operator question verbatim: `history/operator/2026-06-10_kurtosis-curve-family-brief.md` entries 182 (L1410),
  183, 184 (L1448).
- Pool used: the live build default `{x:10, y:800000, α:5, β:400000}` (HEAD L2215), oracle 80000 (L2217),
  τ default 0.3 (L2237) → w=0.5, γ=1, mode(sNorm)=1. Steep-pool contrast: w=0.725 (γ=2.636, the spec's §11.4
  test pool).

---

## 1. THE CODE FACT THE QUESTION HINGES ON — sell-leg sizing

**Operator premise (entry 182): "option premium / price doesn't factor into the sell leg at all."
Verdict: FALSE on the live HEAD.** The premium is *exactly* what sizes the sell leg's pool transaction.

Line-cited chain:

- `legPrice` (L1722–1736): barrier leg value `V = N · markLensed(wing, θ, sNorm, gLoc(state, θ, τ))` —
  N in BTC, mark dimensionless, V in asset units. **The lensed option price is in V.**
- `executeLeg` (L1761–1772): `V_usd = p.V · oracle` (L1764); `dy = (wingSign·legSign) · V_usd` (L1767);
  `tradeUpdate(state, dy)` (L1768). **The ONLY thing that hits the pool is `dy = ± N · markLensed(K) · oracle`
  — premium cash, converted BTC→USD at the oracle.** Sign for a sold call is +, cash IN (comment block
  L1750–1760). There is no second, premium-free pool swap; there is no at-strike asset leg.
- Float64 confirmation (`/tmp/warp_per_notional.js` §0): sold 1-BTC call at 1.5× mode, τ=0.3 →
  `legPrice.V = 0.19298…`, `dy = 15438.84 = N·markLensed·oracle` to machine zero. A bought leg at the same
  strike sends the same magnitude with opposite sign.

**Buy-leg contrast (operator's stated understanding — TRUE):** inside `executeBand` (the UI's only trade
path, `openBand` L2480 → `executeBand` L1811), the bought leg's quantity is derived from the sell premium:
`N_buy = V_sell / denom` where `denom = legPrice(postState, bought…, 1, τ).V` (L1848–1853) — premium
proceeds tell you how much you can buy, exactly as the operator said. But note the symmetry he's missing:
the bought leg's pool swap is then *again* premium cash (`V_buy·oracle = V_sell·oracle`). **Both legs hit
the pool premium-sized; the only asymmetry is which variable is free** (N given on the sell side, N derived
on the buy side).

**Spec concordance:** `specs/SPEC_v24_lens_BUILD_2026-06-11.md` §11.1 row W2: "The cash leg is still sized
by the (now-lensed) premium · oracle … This is the 'writes (amm tx)' the operator named — the warp is now
driven by the lensed premium." So the code implements the spec as written; the spec'd rule is premium-sizing.

**Skeptic concordance (no conflict):** verdict #42 (`notes/skeptic/VERDICT_ENTRY127_atstrike_amm_tx_2026-06-12.md`)
already pinned the same fact: "executeLeg swaps premium-cash at spot (dy=±N·markLensed(K)·oracle) … K enters
ONLY via premium sizing. NOT an at-strike asset swap." The operator's entry-184 self-diagnosis ("my previous
conflation of option pricing with this allowed this to slip notice") is exactly right, but in the opposite
direction from his entry-182 premise: **the option-price layer and the AMM tx are NOT separate layers in the
build — the AMM tx IS the option price**, by spec W2 and by code. The at-strike trade model he described in
entry 127/184 (sell more OTM ⇒ larger dollar tx) is the *carried-OPEN alternative* (tester
FINDING-TRADE-AT-STRIKE, OPEN), not what's built.

---

## 2. THE EXACT MECHANISM — why warp is a pure function of pool cash

On the v24 hyperbola `(x−α)(y−β) = αβ` with α,β conserved by `tradeUpdate` (L1679–1687):

> γ ≡ w/(1−w) = α/(x−α) = **(y−β)/β** — exactly. Therefore **Δγ = Δy/β = dy/β, exactly** (not just to
> first order). [verified-here: `/tmp/warp_per_notional.js` §0b, match to 1e-15; pre γ=1.000000000000,
> post γ=1.038597101037 = 1 + 15438.84/400000.]

Consequences:
- **The underlying-curve warp per CASH dollar is a strike-blind pool constant: Δγ/$cash = 1/β**
  (= 2.5e-6 per $ on the default pool). Measured column "dGamma/$cash" is 2.5000e-6 at every strike, every τ,
  every wing, buy or sell — no exceptions.
- **ALL strike-dependence and ALL τ-dependence of warp-per-notional enters through ONE factor: the lensed
  mark.** Warp per notional dollar = (1/β) · markLensed(K). The pool doesn't know the strike; only the cash
  knows the strike.

## 3. MEASUREMENTS (default pool, N = 1 BTC = $80,000 notional; sold legs)

Sold CALL, strikes at K/mode multiples (output of `/tmp/warp_per_notional.js`):

| τ | K× | mark (lensed) | dy ($) | Δw | Δγ | ΔG at K (lens) | Δγ per $notional |
|---|----|---------------|--------|-----|-----|----------------|------------------|
| 0.05 | 1.1 | 0.2469 | 19,751.59 | 0.012047 | 0.049379 | 0.105413 | 6.17e-7 |
| 0.05 | 1.5 | 0.1675 | 13,403.18 | 0.008239 | 0.033508 | 0.034369 | 4.19e-7 |
| 0.05 | 2 | 0.1252 | 10,018.00 | 0.006184 | 0.025045 | 0.025159 | 3.13e-7 |
| 0.05 | 4 | 0.0625 | 5,002.25 | 0.003107 | 0.012506 | 0.012509 | 1.56e-7 |
| 0.3 | 1.1 | 0.4486 | 35,886.96 | 0.021466 | 0.089717 | 0.260674 | 1.12e-6 |
| 0.3 | 1.5 | 0.1930 | 15,438.84 | 0.009467 | 0.038597 | 0.056282 | 4.82e-7 |
| 0.3 | 2 | 0.1326 | 10,605.52 | 0.006542 | 0.026514 | 0.029687 | 3.31e-7 |
| 0.3 | 4 | 0.0635 | 5,079.68 | 0.003155 | 0.012699 | 0.012810 | 1.59e-7 |
| 1.0 | 1.1 | 0.6584 | 52,668.36 | 0.030884 | 0.131671 | 0.147224 | 1.65e-6 |
| 1.0 | 1.5 | 0.2976 | 23,805.09 | 0.014448 | 0.059513 | 0.069620 | 7.44e-7 |
| 1.0 | 2 | 0.1788 | 14,305.03 | 0.008784 | 0.035763 | 0.040084 | 4.47e-7 |
| 1.0 | 4 | 0.0720 | 5,756.39 | 0.003572 | 0.014391 | 0.014544 | 1.80e-7 |

Sold PUT (strikes mode/{1.1,1.5,2,4}): identical |dy|, identical |Δγ| with opposite sign (cash OUT — sold
put pays the trader premium from the pool's y leg), same Δγ/$cash = 1/β. Bought call: same magnitudes,
opposite sign to sold call. Full tables in the script output.

**Δγ per CASH dollar = 2.5000e-6 = 1/β in every row** — confirming §2.

### 3.1 Why more-OTM at the same notional ⇒ less warp — CONFIRMED, with the mechanism

dy = N · markLensed(K) · oracle. At τ=0.3 the lensed mark falls 0.4486 → 0.0635 from 1.1× to 4×, so the
cash hitting the pool falls $35,887 → $5,080, so Δγ falls 0.0897 → 0.0127 — **proportionally, exactly**.
One sentence: *a further-OTM option is cheaper, the trade's pool leg is its price, so less money moves the
pool, and the pool's bend is exactly proportional to the money (Δγ = dy/β).* The pool never sees the strike
— only the premium does.

### 3.2 Why sharper lens (smaller τ, more kurtosis) ⇒ less warp — CONFIRMED, same mechanism

Smaller τ ⇒ the lens elbow is sharper ⇒ the strike-local exponent g_loc(K) = γ·h′_τ(|u|) reaches the full
wing power-law γ faster ⇒ **OTM options are priced steeper/cheaper**: at K=1.1×, g_loc = 0.886/0.303/0.095
and mark = 0.2469/0.4486/0.6584 for τ = 0.05/0.3/1.0. Cheaper mark ⇒ less premium cash ⇒ less warp
(Δγ at 1.1×: 0.0494 vs 0.0897 vs 0.1317). Same story on the steeper-curve reading of "more skew": on the
w=0.725 pool (γ=2.636), the 1.5× mark at τ=0.3 is 0.0942 vs 0.1930 on the flat pool — steeper curve ⇒
cheaper OTM premium ⇒ less cash ⇒ less warp (Δγ 0.0343 vs 0.0386), even though that pool's per-cash
constant 1/β is *larger* (4.55e-6). **Both readings of "more skew → less warp" are true and have the same
one cause: skew/kurtosis makes OTM premium smaller, and premium is the only thing the pool feels.**

### 3.3 Through-lens warp ΔG(K) — shape vs scale

ΔG(K) = gLoc(post,K,τ) − gLoc(pre,K,τ). Two components: (i) the wing term ≈ Δγ·h′_τ(|u|) → Δγ in the deep
wings; (ii) a **mode-recentering term** — the trade moves w, so the lens mode (1−w)/w moves, and strikes
near the elbow see their |u| change. Near the mode this second term dominates and even flips sign across
the elbow (profile table, `/tmp/warp_per_notional.js`: after the same sold-call trade, ΔG = −0.122 at
K=0.95× but +0.130 at K=1.0×). Key fan-out result: **the ΔG profile of a 1.5×-strike trade and a 4×-strike
trade have the IDENTICAL shape; only the scale differs, and the scale is the cash ratio**
($15,439 vs $5,080 ⇒ every grid point's ΔG smaller by that same factor). The through-lens warp inherits
the cash-only law from the underlying warp — no extra strike channel.

### 3.4 The band path (what the UI actually executes) — wing combination matters more than strike

`openBand` → `executeBand` is cash-conserving (V_buy = V_sell), and dy signs follow wing·legType
(L1750–1760). Measured (`/tmp/warp_band_net.js`):
- **Same-wing band** (sell C1.5 / buy C2.0): dy₁ = +15,438.84, dy₂ = −15,438.84, net pool Δy = 0 ⇒
  **net Δγ = 0.00000000 exactly** (α,β conserved + y restored ⇒ full state restoration).
- **Cross-wing collar** (sell C1.5 / buy P0.667): both legs cash-IN ⇒ net Δy = +30,877.68 ⇒ Δγ = +0.0772
  (= 2× the single-leg warp).

So on the live build, a same-wing band leaves the curve **unwarped** no matter the notional, and a collar
warps it double. If the operator has been eyeballing warp after band trades, this — not strike or τ — is
the first-order driver of "how much did the curve bend."

---

## 4. THE OPERATOR'S COUNTER-INTUITION, STEELMANNED — candidate sizing rules

His instinct "if it's only wrt the AMM, selling further out at the same notional would be a larger trade so
maybe more warp" is **correct under two of the three coherent sizing rules — just not the one built.**
Measured Δγ for a sold 1-BTC call, τ=0.3, default pool:

| K× | Rule A — premium-sized, dy = N·mark·oracle (**the code**, L1764–1767; spec W2) | Rule B — notional-sized, dy = N·oracle | Rule C — strike-collateral-sized, dy = N·K |
|----|------------------------------------------------|--------------------------|-----------------------------|
| 1.1 | dy $35,887 → Δγ 0.0897 | dy $80,000 → Δγ 0.2000 | dy $88,000 → Δγ 0.2200 |
| 1.5 | dy $15,439 → Δγ 0.0386 | dy $80,000 → Δγ 0.2000 | dy $120,000 → Δγ 0.3000 |
| 2 | dy $10,606 → Δγ 0.0265 | dy $80,000 → Δγ 0.2000 | dy $160,000 → Δγ 0.4000 |
| 4 | dy $5,080 → Δγ 0.0127 | dy $80,000 → Δγ 0.2000 | dy $320,000 → Δγ 0.8000 |

- **Rule A (built, spec'd):** warp falls with OTM-ness, ∝ premium. This is what entries 182/184 are reacting to.
- **Rule B (notional-sized):** warp strike-FLAT (Δγ = N·oracle/β at every strike).
- **Rule C (collateral/at-strike-flavored):** warp RISES with OTM-ness — the operator's intuition exactly.
  This is the direction of his entry-127 at-strike asset-swap model: the pool travels out to the K ray and
  the dollar size grows with K. The skeptic's verdict #42 (`notes/skeptic/VERDICT_ENTRY127_atstrike_amm_tx_2026-06-12.md`)
  already established (a) the build is NOT his at-strike model — his diagnosis of the build was correct;
  (b) the at-strike swap's reserve move is UNBOUNDED far OTM (y_t ~ 1/θ_K) — a solvency hazard premium-sizing
  doesn't have; (c) in the goal-seek/chart-2 frame the at-strike re-model still ends strike-flat. The
  at-strike mechanic is **carried OPEN** (tester FINDING-TRADE-AT-STRIKE, `.claude/agent-memory/tester/MEMORY.md` L44–45).

**The lapse-check answer: there is no bug, but there IS a live design choice.** The code does what spec W2
says; spec W2 chose premium-sizing deliberately (it's what makes open-value ≡ settle-value ≡ pool-cash one
number — §11.4(D) no-gap coherence — and keeps the trade bounded). But "which dollar quantity should a sold
option push through the pool — its price (A), its notional (B), or its strike exposure (C)?" is an economic
object choice, operator-tier under Gate 2. Entries 127/182/184 show the operator's mental model is closer
to C while the build is A. That mismatch — not any computation — is the thing to surface.

---

## 5. QUALITATIVE SUMMARY FOR THE OPERATOR (plain English)

1. **The sell leg's pool trade IS the option's price.** When you sell an option, the pool swap is exactly
   the premium in dollars (quantity sold × lensed option price × BTC price). The premium absolutely factors
   in — it's the *only* thing that factors in. The buy side is the mirror: there the premium fixes how much
   you can buy, and the pool again moves by that same premium cash. One layer, not two.
2. **Why more OTM at the same notional gives less warp:** the curve's bend is exactly proportional to the
   dollars that hit it (steepness change = dollars in ÷ the pool constant β — exact, not approximate). A
   further-OTM option is cheaper, so the same notional sends fewer dollars, so the curve bends less. The
   pool never sees your strike; only your premium does.
3. **Why more skew/kurtosis gives less warp:** a sharper lens (smaller τ) — or a steeper curve — makes OTM
   options cheaper. Cheaper premium ⇒ fewer dollars ⇒ less warp. Same single mechanism as (2).
4. **Your counter-intuition is right under a different sizing rule.** If the sold leg's pool trade were
   sized by notional, warp would be strike-flat; if sized by strike exposure / your at-strike model, warp
   would *grow* with OTM-ness — exactly your "selling further out is a larger trade." The build implements
   premium-sizing per the spec (W2); your at-strike trade model is the carried-OPEN alternative (entry 127,
   skeptic verdict #42: buildable but reserve-unbounded far OTM). Which dollar quantity a sold option
   should push through the pool is a design choice that is yours to make, not a settled fact.
5. **One extra finding from the live trade path:** a same-wing band (sell one call, buy another call)
   nets to exactly zero curve warp — the two premium legs cancel on the pool. A cross-wing collar doubles
   the warp. If you've been judging warp after band trades, wing combination dominates strike and τ.

---

## Receipts
- `/tmp/warp_extract.js` — engine extraction + sandbox (vm.runInNewContext on `<script id="engine">`).
- `/tmp/warp_per_notional.js` — premise check, exact identity, main tables, lens profile, τ direction,
  sizing-rule counterfactuals, steep-pool contrast.
- `/tmp/warp_band_net.js` — band-path net warp by wing combination.
- Code: HEAD L1722–1736 (`legPrice`), L1761–1772 (`executeLeg`, dy at L1767), L1848–1853 (N_buy),
  L1679–1687 (`tradeUpdate`), L2215/2217/2237 (defaults), L2480 (`openBand`→`executeBand`).
- Spec: `specs/SPEC_v24_lens_BUILD_2026-06-11.md` §11.1 W1/W2, §11.3 L4, §11.4(D).
- Skeptic: `notes/skeptic/VERDICT_ENTRY127_atstrike_amm_tx_2026-06-12.md` (verdict #42).
- Operator verbatim: `history/operator/2026-06-10_kurtosis-curve-family-brief.md` entries 182/183/184.

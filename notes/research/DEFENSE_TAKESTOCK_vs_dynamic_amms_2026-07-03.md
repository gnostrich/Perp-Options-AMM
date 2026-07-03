# DEFENSE TAKE-STOCK — counterfactual charge-back vs dynamic AMMs (attack/defense surface)

**research-lead · 2026-07-03 · operator entry 415 (RESEARCH RUN #2)**

Scope & honesty constraints (per brief, same as run #1):
- **NO live web.** Every external-protocol claim is training-knowledge, labelled **[TK]** — directional,
  not a spec citation; verify before productionizing.
- **Our side = measured** in Node-vm against real HEAD `0e0a0062` where vm-testable; **reasoned** (labelled)
  where the path isn't in the engine extract. Harness: `scratchpad/closeb/h8_cf.js` (+ prior `h1..h7`).
- The **counterfactual charge-back** under test (operator entries 412/414/415): keep a record of the
  *immediate round-trip P/L* and settle it at close. Formalized as
  **`charge = V[receipt-undo] − V[live-close]`, both evaluated from the SAME current state at close.**
  `receipt-undo` = `revertArc` of the leg's own stored arc (removes the closer's own open flows);
  `live-close` = `tradeUpdateAt` at the live close ray. "Skew persists only if paid": pay the charge →
  keep the live-close `w`, pool made whole to receipt level via the charge credit; don't pay → revert to
  receipt (`w` reset). This is design-stage (close-(b) build HOLDS behind this take-stock).

---

## PART 1 — Attribution numbers under the counterfactual differential basis

All figures from `h8_cf.js`, HEAD `0e0a0062` engine extract, pool `(x=10, y=8e5, w=0.5)`, oracle 80 000,
`m=2`, zero market move unless stated. Charge basis = the counterfactual differential (NOT pool high-water).

### (a) Free cycler — charge equals own drain exactly, `w` pinned
30× 50%-depth open/close cycles, closer does NOT pay (so `w` reverts to receipt each cycle):
- **charge sum = 18 178 609.27**  ·  **measured live-close drain sum = 18 178 609.27**  → **EXACT match**.
  The counterfactual charge is, to the last cent, the pool value a naive live close would have destroyed.
- **`w`: 0.5000 → 0.5000 exact** over 30 cycles (unpaid ⇒ receipt reset). **Pool 1 600 000 → 1 600 000.**
- Verdict: the charge measures the round-trip P/L exactly, and the free cycler cannot move `w`. ✓

### (b) Interleaved bystander trade — bystander contribution to the closer's charge = 0
Closer opens a leg; a bystander opens+closes an independent leg on the shared pool; then closer closes.
Charge computed from the identical post-bystander state via both counterfactuals:
- **closer charge, no bystander = 605 953.64**  ·  **with bystander = 605 953.64**  → **contribution = 0 (exact).**
- **Why (structural, not a coincidence):** both `receipt-undo` and `live-close` start from the *same*
  current state and differ *only* by the closer's own leg flows. Anything the bystander did is present in
  both terms of the difference and cancels. **The attribution property holds by construction**, not by
  calibration. ✓  *(This is also the multi-wallet cleanliness guarantee — see (d).)*

### (c) Rebase interleave — receipt oracle-scaling attributes cleanly
Open a leg; oracle rebase ×1.25 (80 000 → 100 000; engine `rebase` scales `x, α`, keeps `β, y, w`); close.
- **`rr = oNow/oOpen = 1.25`.** `revertArc` scales the stored `dxA` by `rr`.
- **receipt pool value = 2 050 000 = rebased pre-open value 2 050 000 (exact).** The receipt lands exactly
  on the rebased pre-open reserves — the oracle-scaling is clean.
- **charge = 37 734.14 ≥ 0**, still a well-defined differential in the post-rebase frame. ✓

### (d) CRITICAL — sybil / multi-wallet splitting: does it defeat the quadratic charge?

**Per-cycle scaling (single cycle, attacker pays to keep `w`):**

| dyFrac | charge ($) | dw (paid) | charge/dw | dw/dyFrac² | charge/dyFrac² |
|--------|-----------:|----------:|----------:|-----------:|---------------:|
| 0.5    | 605 953.64 | 2.115e-3  | 2.87e8    | 8.46e-3    | 2 423 815 |
| 0.25   |  65 987.71 | 1.920e-3  | 3.44e7    | 3.07e-2    | 1 055 803 |
| 0.10   |   7 414.10 | 3.894e-4  | 1.90e7    | 3.89e-2    |   741 410 |
| 0.05   |   1 673.44 | 1.027e-4  | 1.63e7    | 4.11e-2    |   669 374 |
| 0.025  |     398.48 | 2.626e-5  | 1.52e7    | 4.20e-2    |   637 562 |
| 0.0125 |      97.28 | 6.637e-6  | 1.47e7    | 4.25e-2    |   622 577 |

- **charge ∝ dy²** (charge/dy² → constant ≈ 6.2e5 as dy→0) — the quadratic drain, as expected.
- **BUT w-motion ALSO ∝ dy²** (dw/dy² → constant ≈ 4.25e-2). The persistent `w`-increment the attacker
  buys is *itself* quadratic in the cycle size.
- Consequence: **cost per unit of `w`-motion (charge/dw) → a positive FLOOR ≈ 1.46e7 $/unit-w**, it does
  **not** fall to zero as cycles shrink.

**Same-total-notional split (attacker pays to keep `w`), total `|dy|` held ~constant:**

| N  | totCharge ($) | final w  | γ     | pool v0→v1 | cost/unit-dw |
|----|--------------:|---------:|------:|-----------|-------------:|
| 1  | 605 953.64    | 0.502115 | 1.008 | 1.6M→1.6M | 2.87e8 |
| 10 |  16 659.03    | 0.501038 | 1.004 | 1.6M→1.6M | 1.60e7 |
| 30 |   5 220.70    | 0.500354 | 1.001 | 1.6M→1.6M | 1.47e7 |

Total charge falls ~N-fold under splitting — **but the achieved `w`-motion falls by the same factor.**

**The attacker-relevant question — cost to ratchet a FIXED `w`-target (0.5 → 0.60, i.e. γ 1 → 1.5),
choosing sybil granularity:**

| per-cycle dyFrac | cycles | final w  | totCharge ($) | / pool (1.6M) |
|------------------|-------:|---------:|--------------:|--------------:|
| 0.5 (one monster)|     10 | 0.603023 | 4 744 583.94  | **2.97×** |
| 0.1              |    122 | 0.601546 |   671 265.74  | 0.42× |
| 0.05             |    476 | 0.600368 |   594 361.92  | 0.37× |
| 0.02             |   2947 | 0.600008 |   557 297.28  | 0.35× |
| 0.01             |  11765 | 0.600004 |   546 324.77  | **0.34×** |

**VERDICT (d) — SYBIL SPLITTING DOES NOT RESURRECT THE ATTACK.** The cost to steepen the curve converges
to a **hard floor ≈ $546k (0.34× the $1.6M pool) per 0.1 of `w`-motion (γ 1→1.5)** as cycles shrink — it
does **not** trend toward zero. Splitting a single monster cycle into many small ones gives a **bounded
~8.7× efficiency gain** ($4.74M → ~$546k), then plateaus at the floor. The reason the quadratic charge is
*not* defeated: the `w`-motion the attacker is buying is itself quadratic in cycle size, so charge and
payload shrink together and cost-per-unit-`w` stays bounded below by a positive constant. **There is no
free ratchet.** To reach γ = 14.4 (w = 0.935, Δw = 0.435) at the sybil-optimal floor would cost on the
order of **multiples of the entire pool** (linear extrapolation of the floor ≈ 0.435 × 1.46e7 ≈ $6.4M ≈ 4×
pool; the true figure is higher as the floor rises with `w`).

**Multi-wallet = same as cycle-splitting.** N separate wallets each doing one small cycle produces N
independent charges, each equal to that wallet's own drain by the attribution property (b) — a bystander
(here, another attacker wallet) contributes 0 to any given wallet's charge. So sybil across wallets buys
nothing that cycle-splitting from one wallet doesn't, and it is bounded by the same floor.

**Honest residual on (d):** the floor is a *positive* result for the design but it is still a finite,
measurable cost — whether ~0.34× pool per 0.1-of-`w` is "deterrent enough" against an actor who is short
the third-party option book (the blast-radius grief motive) is an **economics/product judgment [TBD —
operator]**, not a math verdict. Candidate hardening if the floor is judged too low appears in Part 2
(per-window `w`-rate-limit; R-A full unwind).

---

## PART 2 — Attack / defense benchmark table

Columns: **Attack** → **How Curve v2 / Uni v3 / Balancer / QuantAMM-class defend [TK]** → **Our v28 +
counterfactual charge-back exposure** (measured where noted, else reasoned) → **Candidate defense for us**
→ **Cost/complexity**.

### 1. Sandwich / MEV (front- + back-run a victim swap)
- **[TK]** Uni v3: user slippage limits; MEV mitigated off-protocol (private order flow / MEV-Boost).
  Curve v2: internal EMA oracle damps single-block manipulation of the *price used by the AMM*. Balancer:
  same slippage-limit model. QuantAMM/TFMM [TK]: rule-updates are block-gated, not per-swap.
- **Ours:** a swap warps the curve (`w` moves) with normal price impact — sandwichable like any AMM. **The
  charge-back does NOT catch a sandwich** — a sandwich is two *different* actors around a victim, not one
  actor's self-round-trip, so no receipt/live differential applies to the attacker. Extra wrinkle: our
  `w`-warp momentarily moves the *shared curve steepness* (g_loc = m·γ), so a sandwich also transiently
  reprices the option book (blast radius).
- **Candidate:** user slippage bound on trades (standard); EMA-band the internal mark (see #8);
  private-order-flow guidance. **Cost:** low (slippage bound) / medium (EMA band).

### 2. JIT liquidity (add liquidity immediately before a large flow, remove immediately after)
- **[TK]** Uni v3: JIT-LP captures fees with near-zero inventory risk; partially deterred by fee tiers and
  by the fact JIT competes away LP fee income (a known, tolerated surface). Balancer/Curve: less acute
  (full-range LP), fee income diluted.
- **Ours:** our pool has **no LP swap-fee income** (measured, prior run `h7`: "pool has no fee income,
  funding ledger-only") ⇒ classic fee-capture JIT is **moot**. **BUT the counterfactual charge is credited
  to pool `x`** — the charge is meant to compensate *existing* LPs for a closer's drain. A JIT-LP who
  deposits right before a large close's charge lands and withdraws after would **dilute that compensation
  pro-rata** — a genuinely NEW LP-side surface created by the receipt/charge design. *(Reasoned — LP
  deposit/withdraw path is not in the engine extract; flagged for a build-time vm test.)*
- **Candidate:** attribute the charge credit to the **LP set snapshot at the leg's OPEN time** (or route it
  to a reserve bucket, not instantaneous pro-rata shares). **Cost:** medium (needs an open-time LP
  snapshot). **TBD — operator/product** (LP accounting model).

### 3. Sybil / multi-wallet splitting  — **MEASURED, Part 1 (d)**
- **[TK]** Most AMMs are sybil-neutral by design (per-swap fees are linear in size, so splitting is
  fee-neutral); the concern is specific to *super-linear* penalties.
- **Ours:** the charge is quadratic in cycle size, which naively invites splitting — but **measured
  sybil-RESISTANT**: cost-to-steepen converges to a hard floor (~0.34× pool per 0.1-of-`w`), bounded
  ~8.7× split gain then plateau, because `w`-motion is quadratic too. **No free ratchet.**
- **Candidate (only if floor judged too low):** per-block / per-window flow **aggregation** (charge on
  net aggregate flow, so many small cycles are treated as one big one and pay the super-quadratic top of
  the curve); or a **linear-component floor** on the charge (a minimum per-notional levy). **Cost:** medium
  (windowed aggregation is stateful).

### 4. LP first-depositor / share-inflation attack (ERC-4626-style)
- **[TK]** ERC-4626 vaults: attacker is first depositor, donates to inflate share price, later depositors
  round to zero shares. Mitigations: minimum/dead initial shares, virtual offset, seed liquidity.
- **Ours:** only relevant IF LP interest is tokenized as shares — the sim is a single pool with club
  equity, not a share-minting vault. *(Reasoned.)* If the Go backend mints LP shares, standard risk applies.
- **Candidate:** virtual-shares / dead-shares / minimum initial liquidity at the tokenization layer.
  **Cost:** low (well-trodden). **TBD — CTO** (whether LP is share-tokenized).

### 5. Donation / direct-transfer attack (skew reserves by sending tokens straight to the pool)
- **[TK]** Uni v2/Curve: track **internal accounting balances**, not raw `balanceOf`, so donations don't
  move the invariant; Uni v3 sweeps donations to protocol. Balancer: internal balances.
- **Ours:** the charge is a **differential from the same current state**, so a donation present in both
  `receipt` and `live` **cancels** — charge attribution is donation-robust (same structural reason as (b)).
  Residual: a donation could still skew an LP *share-price* if LP equity reads raw reserves. *(Reasoned.)*
- **Candidate:** account LP equity off **internal tracked balances**, not raw token balances. **Cost:** low.

### 6. Deposit/withdraw timing around state moves (JIT-LP around rebase or a big close/repricing)
- **[TK]** Curve v2: repeg only spends *earned* `xcp_profit` surplus, and LP share price is path-tracked so
  timing around a repeg is value-neutral. QuantAMM [TK]: weight updates are gradual/block-gated, reducing
  timeable jumps.
- **Ours:** rebase scales `x, α` and keeps `w` (value-neutral in principle — measured (c): receipt lands
  exactly on rebased pre-open value). So an LP timing a rebase should gain nothing **IF LP equity is marked
  in value terms** (needs confirmation — not in extract). The live surface is #2 (timing the *charge
  credit*), which is the sharper version. *(Reasoned + partial-measured via (c).)*
- **Candidate:** confirm LP-equity marking is rebase-invariant (value-based, not `x`-count based); reuse
  the #2 open-time snapshot for charge credits. **Cost:** low–medium. **TBD — operator** (LP mark model).

### 7. LP exit-before-repricing (withdraw before an adverse `w`-move is marked into LP equity)
- **[TK]** Vaults with lagged/oracle marks add **withdrawal delays** or mark to worst-case to stop LPs
  front-running their own book's repricing; Curve LP equity is continuously path-marked.
- **Ours:** a pending trade that steepens `w` changes the option-book liabilities (g_loc = m·γ prices
  *every* strike). An LP who foresees the steepening could exit before the mark-to-market hits equity,
  dumping the loss on remaining LPs. **This is the LP-side twin of the griefing blast radius (#10).**
  *(Reasoned — book-liability marking into LP equity not in extract.)*
- **Candidate:** mark LP equity to the **current full option-book liability at live `w`** (no lag), or a
  short withdrawal delay across large-`w`-move windows. **Cost:** medium. **TBD — operator/product.**

### 8. Internal-oracle / mark manipulation
- **[TK]** **Curve v2's headline defense: an internal EMA price oracle with banding** — the AMM prices
  against a moving-average of its own oracle, so a single-block push can't move the effective price/repeg;
  this is the canonical dynamic-AMM manipulation defense. Uni v3: TWAP oracles for external consumers.
- **Ours:** `setOracle` snaps `perpMark := oracle` (STORY audit FLAG-D); the internal mark drives funding
  and settlement seams. If the oracle/mark is manipulable, funding and the g_loc seam skew. The charge-back
  itself is differential-robust to a *transient* mark (cancels in receipt−live at a single instant), but
  funding accrual and settlement are not.
- **Candidate:** **EMA-band the internal mark, Curve-v2-style** — the single most transferable defense on
  the list. **Cost:** medium (stateful EMA + band params to calibrate).

### 9. Cross-function arb (swap-vs-LP interplay)
- **[TK]** Uni v3/Balancer: swap and LP are separate functions; arb between them is priced by fees +
  slippage. Curve: `xcp_profit` gate ensures repeg never hands principal to an arber crossing functions.
- **Ours:** the sharp cross-function path is **open a leg (move `w`) → add LP at the moved `w` → close
  (charge credited pro-rata) → remove LP** — the LP-add captures a share of a charge generated by the same
  actor's swap. This is #2 + #6 composed into one atomic cross-function play. *(Reasoned.)*
- **Candidate:** the open-time LP snapshot (#2) closes it — the charge credit never reaches liquidity added
  after the leg opened. **Cost:** medium (same snapshot mechanism).

### 10. Griefing (state-push without profit — pure `w`-ratchet to damage the third-party option book)
- **[TK]** Most AMMs have **no shared-curve-steepness surface at all** — a griefer can only move *price*
  (self-correcting via arb), not a global parameter that reprices unrelated instruments. QuantAMM [TK]
  rate-limits weight moves. This vector is largely **unique to our warp design** (noted prior run V2).
- **Ours:** under the charge-back, griefing **COSTS the griefer the charge** — the same measured floor as
  the sybil ratchet (~0.34× pool per 0.1-of-`w`). **This is the key win of the charge-back: it converts a
  previously-free griefing/ratchet vector into a costly one.** Residual: the blast radius (whole option
  book reprices via g_loc) means a paid grief could still be worth it to someone *short the book*, and the
  floor may not deter that actor — see the (d) honest residual.
- **Candidate:** a **per-window cap on net `w`-motion** (rate-limit curve steepness regardless of payment),
  and/or the **R-A full-unwind** option (FLAG-CURVE) which removes the leg's own `w`-increment so paid or
  not, free cycling can't ratchet. **Cost:** low (rate-limit) / medium (R-A, imports `dwA` + reset).

---

## TAKE-STOCK SHORTLIST (ranked, each with a one-line operator-decision framing)

### MUST-HAVE
1. **Pool-value floor** (already pinned as the (b)-close neutralizer). *Operator framing:* without it,
   the round-trip point is worse than every listed AMM (prior run V1) — non-negotiable, not a new decision.
2. **Counterfactual charge = round-trip differential** (the entry-415 design). *Operator framing:* accepted
   "for now"; Part 1 confirms it delivers exact own-drain attribution ((a)), bystander-clean ((b)),
   rebase-clean ((c)), and **sybil-resistance with a hard cost floor ((d))** — no free ratchet.
3. **Open-time LP snapshot for the charge credit.** *Operator framing:* the ONE new LP-side surface the
   receipt/charge design creates (JIT-LP dilutes drain-compensation, #2/#6/#9) — credit the charge to LPs
   present when the leg opened, not to instantaneous shares. Needs a product ruling on LP accounting.

### SHOULD-HAVE
4. **EMA-band the internal mark (Curve-v2 analogue, #8).** *Operator framing:* the most transferable
   dynamic-AMM defense; protects funding + settlement seams from single-block mark pushes. Medium cost.
5. **Per-window `w`-motion rate-limit (#10, #3).** *Operator framing:* bounds the griefing blast-radius
   even when the charge is paid, and closes any residual sub-floor sybil edge. Low cost, but caps a
   legitimate large trader too — a UX/ safety trade-off.
6. **Value-based (rebase-invariant, no-lag) LP-equity marking (#6, #7, #5).** *Operator framing:* confirm
   LP equity marks the full live option-book liability off internal balances — closes exit-before-repricing
   and donation share-skew. Low–medium cost.

### DEFER (needs a product/economics decision first)
7. **R-A full `w`-unwind vs paid-persistence (FLAG-CURVE, still open).** *Operator framing:* the charge-back
   is "for now"; R-A is the stronger no-ratchet option (Curve-parity) if the ~0.34×-pool floor is judged
   too weak against a book-short griefer. Decision, not a build blocker.
8. **LP withdrawal delay across large-`w`-move windows (#7).** *Operator framing:* only if #6's no-lag
   marking is deemed insufficient; adds LP UX friction.
9. **LP share-inflation / donation vault hardening (#4, #5).** *Operator framing:* CTO/backend concern —
   only bites if LP interest is share-tokenized in the Go layer (out of this repo).

### TBD MARKERS (operator's own words: "keep this in notes tbd") — not resolvable without product decisions
- **[TBD]** Is the sybil floor (~0.34× pool per 0.1-of-`w`) deterrent enough against an actor short the
  third-party option book? (economics; Part 1 (d) residual.)
- **[TBD]** LP accounting model: pro-rata shares vs open-time snapshot for charge credits (#2/#3/#9).
- **[TBD]** LP-equity marking: value-based/no-lag vs lagged + withdrawal delay (#6/#7).
- **[TBD]** FLAG-CURVE: charge-back "for now" vs R-A full unwind (#10/shortlist 7).
- **[TBD — CTO]** whether the Go backend tokenizes LP shares / uses internal vs raw balances (#4/#5).

---

**Provenance:** measured = `scratchpad/closeb/h8_cf.js` on HEAD `0e0a0062` engine extract (`engine.js`);
external claims = training-knowledge **[TK]**, unverified (no web). No git, no engine edits, no Aristotle
(none needed). Design-stage: close-(b) build HOLDS behind this take-stock (operator entry 415).

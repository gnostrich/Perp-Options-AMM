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

## PART 3 — LP-SELF-DEALING (operator entry 416; RESEARCH RUN #3) — 2026-07-03

Operator (verbatim): *"ok so if someone puts in big lquidity does a huge trade and then pulls LP and
exits that kind of thing"*. The LP-self-dealing variant. Manager hypothesis under test: attacker becomes
an f-fraction LP → runs the ratchet cycle → the charge credit is booked to the LP set (which includes the
attacker at fraction f) → they recover f of their own charge → effective floor ≈ (1−f)·floor, so f=0.9
would drop the $546k floor toward ~$55k. Aggravator cited: LP add/remove is an isotropic resize (`liquidity(D)`,
HEAD L2544) with NO fee and NO delay, so the LP round-trip is itself free.

Measured in `scratchpad/closeb/h9_lp.js` + `h9b_lp.js`, HEAD `0e0a0062` engine extract. LP add/remove modelled
as the engine's `liquidity(D)` isotropic scale of `x,y,α,β` (V=2y, λ=D/V, w & price invariant).

### HEADLINE: the manager's pro-rata-self-credit hypothesis is REFUTED — but a DIFFERENT, real leak exists.

**(1) Pro-rata self-credit under the shipped pool-credit floor = ZERO recovery.** Net cost to push γ 1→1.5
(w 0.5→0.60), charge credited to pool reserves (the floor):

| f | fixed-pool net cost | / honest floor | capital-add net cost | / honest floor |
|---|--------------------:|---------------:|---------------------:|---------------:|
| 0   | 594 362 | 1.09× | 594 362 | 1.09× |
| 0.5 | 594 362 | 1.09× | 1 188 724 | 2.18× |
| 0.9 | 594 362 | 1.09× | 5 943 619 | **10.88×** |

- **LP recovery = 0 in every case.** Fixed-pool (attacker owns f of the existing $1.6M): net cost is
  **INVARIANT to f** (~$594k, the sybil floor at perFrac=0.05). Capital-add (attacker deposits to reach
  fraction f of an enlarged pool): net cost gets **WORSE**, scaling ~1/(1−f), because inflating the pool
  inflates the gross charge proportionally while recovery stays zero. Self-dealing is **counterproductive**.
- **(1c) WHY — no excess to skim (measured):** the pool-credit floor RESTORES the pool to its pre-cycle
  value **exactly** — drain = $16 734.36, charge = $16 734.36, overshoot vs pre-cycle = **$0**. The charge
  plugs a real hole; it does not hand LP shares any surplus. "Recover f of your own charge" is illusory
  because the charge equals the drain to the cent (same structural fact as the sybil floor and the
  bystander-cancellation in Part 1) — there is nothing extra distributed to shares to recover.
- **(2) Pull LP after the cycle:** attacker deposits $14.4M (f=0.9), runs a paid cycle, withdraws. LP
  round-trip returns **capital only** ($14.4M→$14.4M); the charge is NOT recovered; net = −charge. Honest
  LP pool ($1.6M) **unharmed**. The isotropic resize-down does not leak the charge.

### THE REAL LEAK — TIMING, not pro-rata credit: resize the pool BETWEEN open and close.

The counterfactual charge is computed via `revertArc` (engine L160-167), which subtracts the leg's stored
**absolute** arc flows `dxA·rr, dyA` from the current reserves, adjusting **only** by the oracle rebase
factor `rr = oNow/oOpen`. **It has zero awareness of an intervening LP isotropic resize.** So if the pool is
scaled by an LP add/withdraw between a leg's open and its close, the stored absolute arc no longer matches
the resized pool, and the counterfactual differential `charge = V[receipt] − V[live]` is mis-computed.

**(3)/(VECTOR A) — add LP deep → open → PULL LP → close (measured, `h9b_lp.js`):**

| f pulled | attacker net ($) | honest-LP Δ ($) | close charge ($) |
|----------|-----------------:|----------------:|-----------------:|
| 0    | −7 414   | 0        | +7 414 (honest close) |
| 0.3  | +8 838   | −15 211  | +6 373 (undercharged) |
| 0.5  | +33 720  | −35 492  | +1 772 (undercharged) |
| 0.9  | +583 619 | −319 429 | **−264 190 (charge goes NEGATIVE — the "charge" PAYS the closer)** |

- Pulling LP between open and close drives the close charge **down and, at large pulls, NEGATIVE** — the
  attacker escapes paying for the drain their live close causes AND is paid by the mis-scaled receipt, while
  the real drain is dumped on the remaining (honest) LPs. **This is a genuine new vector — but its mechanism
  is the arc-vs-pool-size mismatch in the charge formula, NOT the pro-rata self-credit the manager posited.**
- HONEST CAVEAT on Vector A magnitudes: attacker-gain ($584k) exceeds honest-loss ($319k) because the
  net-worth accounting isn't fully closed (the negative-charge credit and the isotropic pulls move value the
  simple `o·x+y` tally doesn't perfectly partition) — treat the **dollar magnitudes as indicative**; the
  **sign and the negative-charge break are solid** (charge crosses zero at f≈0.5–0.9, directly from L164).

**(VECTOR B) — add LP → open (warp w) → PULL LP → EXIT, never close (measured):** attacker deposits $14.4M
(f=0.9), opens a big leg warping w 0.50→0.41, pulls their LP, exits. The **charge is levied only at CLOSE**,
so an attacker who never closes leaves w **warped with NO charge at all** — the griefing/blast-radius vector
(whole option book reprices via g_loc=m·γ) is entirely uncharged if you simply don't close. (The exit cash
figure is NOT reliable here — the option-layer open premium isn't tracked in this pool-value harness — but
the *uncharged persistent warp* is solid and is the sharper concern than any cash extraction.)

### (4) MITIGATIONS — ranked (measured or reasoned, one line each)

The measured leak is **timing/resize-invariance**, so the ranking INVERTS the brief's anticipated shortlist:
the mitigations that target the (refuted) pro-rata self-credit — (a) sink, (e) exclude-own-share — do NOT
address the real leak, and (a) actively breaks the floor.

1. **[TOP — MUST, code fix] Make the charge resize-invariant.** Either (i) scale the stored arc `dxA, dyA`
   by the cumulative LP resize factor since open (exactly as `rr` already scales `dxA` for oracle rebase;
   `dwA` needs no scaling — w is scale-invariant), OR (ii) **lock LP while the depositor has any open leg**
   (mitigation (b) in leg-lifetime form). Directly kills Vectors A and B-with-close. (i) is the cleaner one-
   line engine fix; (ii) is the policy form. *Reasoned from L164; the fix mirrors the existing `rr` handling.*
2. **[MUST — already pinned] Charge the OPEN, or freeze w on exit-without-close (Vector B).** Charge is
   close-only today, so open-warp-then-exit leaves an uncharged warped curve. Needs either an open-side
   charge/bond or forcing legs to be closed/liquidatable before LP exit. *Measured: open never charges.*
3. **(d) LP entry/exit fee.** Taxes the currently-free LP round-trip that Vectors A/B rely on; partial and
   size-dependent (a determined attacker eats a small fee for a large warp). SHOULD, not sufficient alone.
4. **(b) LP withdrawal delay ≥ window (generic form).** Subsumed by #1(ii) when the window ≥ max open-leg
   lifetime; as a blanket delay it also blunts JIT (#2 in Part 2). Adds LP UX friction. SHOULD.
5. **(c) Charge-credit vesting.** Targets the pro-rata self-credit, which is **already ~0** under pool-credit
   — solves a non-problem here. Low value. DEFER.
6. **(a) Route charge to a non-LP sink (insurance/club fund).** Kills self-credit (already ~0) AND **breaks
   P-CYCLE**: measured, sink policy leaves the pool drained ($1.6M→$1.225M over the schedule; P-CYCLE FAILS)
   while pool-credit holds it exactly at $1.6M. So a sink requires a separate backstop to refund the pool the
   drain — reintroducing the floor by another name. **REJECT for the stated goal** (doesn't fix the timing
   leak; costs the floor). *Measured, `h9_lp.js` (4a).*
7. **(e) Exclude-own-share (identity-based).** Targets the refuted self-credit AND is sybil-weak (attacker
   splits the LP stake across wallets — an excluded wallet is just a fresh identity). **REJECT.** *Reasoned.*

### SHORTLIST DELTA (MUST tier changes — Part 2 shortlist updated):

- **NEW MUST:** *charge resize-invariance* (scale the stored arc by the cumulative LP factor, OR lock LP
  while legs are open). This is the real LP-self-dealing defense; without it the deep-open/pull/shallow-close
  play drives the close charge negative and drains honest LPs (Vector A).
- **NEW MUST (or promote):** *charge the open / freeze-w-on-exit* so open-warp-then-exit-without-close
  (Vector B) can't leave an uncharged warped curve.
- **DEMOTE/REJECT:** the Part-2 "open-time LP snapshot for the charge credit" (MUST #3) was premised on
  JIT-LP diluting a *distributed* credit — but under pool-credit the credit restores reserves (no
  distribution to dilute) and Part 3 (1c)/(2) show self-credit recovery is already zero. The snapshot is
  **not needed against self-dealing**; keep it only if the LP-accounting layer ever *distributes* the charge
  as a dividend (an alternative design), where it would matter again. Route to the LP-accounting TBD.
- **TBD — operator:** whether to fix resize-invariance in-arc (code) or by LP-lock (policy); whether to
  charge the open. Both are close-(b)-build design decisions; close-(b) still HOLDS behind this take-stock.

---

## PART 4 — BEST MITIGATION (perp-venue synthesis) — operator entry 418 (RESEARCH RUN #4) — 2026-07-03

Operator (verbatim, entry 418): *"ok continue research and let's figure out the best mitigation... but yeah
FYI I think a parallel is perps and spot maniupuatlin etc. like i dont think whole book manipulation is also
unique"*. Plus entry 417: *"lp attacks can go thru other wallets... none of this seem sunique to temppral"*.

The framing to honor **and test**: whole-book repricing is NOT unique — perp venues live with it (mark-price
manipulation reprices every open position; spot manipulation moves the index → funding/liquidations;
Mango-class attacks). Their standard defense stack **[TK]**: external index anchoring, EMA/TWAP marks,
funding-rate clamps, position/OI limits, insurance funds, liquidation buffers. This part maps that stack onto
ours and converges on the minimal composed recommendation. New measurements: `scratchpad/closeb/h10_perp.js`.

### 4.1 — The perp-venue map: what we already have, and what the manipulable residual actually is

Stating this precisely (the operator's item 1):

- **The LEVEL is already anchored — this is our "index anchoring".** `rebase` re-centers the pool MODE to the
  external oracle (`setOracle` → `arbitrageToOracle`; the reserve point is arbed to oracle). In steady state
  the price level is **not** the manipulable quantity — it is pinned to the external index exactly as a perp's
  index anchor pins the fair price. An attacker cannot durably move the *level*; arb + rebase restore it.
- **The manipulable residual is the SKEW / STEEPNESS, not the level.** What a trade *does* move and can leave
  moved is `w` (hence `γ = w/(1−w)`, and `g_loc = m·γ` at every strike). This is the **exact analog of a perp's
  mark-vs-index basis**: the index (mode/level) is anchored, but the *shape* the venue prices against (here the
  curve steepness that reprices the whole option book; there the mark that reprices every position) is the soft,
  pushable quantity. **Measured invariances confirming w is the residual (h10-C):** an isotropic LP pull
  preserves `w` exactly; an `arbitrageToOracle` moves the reserve point back to oracle but leaves `w` at 0.5027
  (i.e. the lean/skew SURVIVES a reserve arb — arb fixes the level, not the skew). So the residual is real and
  is not self-correcting the way a mispriced *level* is.
- **Consequence for the analogy:** our defense job is precisely the perp venue's — anchor the level (done via
  rebase), then make the *basis/skew* (a) expensive to push (charge), (b) slow to translate into book repricing
  (EMA/TWAP + rate limit), (c) backstopped if it ever does damage (fund). We already have (a)'s foundation
  (charge + floor). The perp parallel tells us what to add for (b) and (c).

### 4.2 — The unified candidate set (measured where vm-testable)

**(i) Counterfactual charge family** (entry 415; Parts 1–3) — *"you pay for the basis you create."*
- Effect (measured, Parts 1–2): exact own-drain attribution, bystander-clean, sybil-resistant with a hard
  floor ≈ $546k per 0.1-of-`w` (0.34× pool). Re-confirmed EMA-independent (h10-E: floor = **$546 324.77**,
  identical whether or not the read layer smooths — the charge is a *reserve value differential*, orthogonal to
  the read-γ). Perp analog: the funding/settlement you owe for the basis you opened.
- Does NOT cover: **Vector B** (open-warp then exit WITHOUT closing — charge is close-only, so a persistent
  warp established and abandoned is uncharged, Part 3); and **timing/resize** mis-scaling (Part 3 Vector A).
- Cost: the close-(b) build already carries it (floor pinned). Resize-invariance + charge-the-open are the two
  Part-3 MUST deltas on top.

**(ii) EMA/TWAP-banded γ for the READ layer** (funding, settlement marks) = perp-venue mark smoothing.
- Effect (measured, h10-A/B): read-γ = EMA of `w` over a window `N` (λ=2/(N+1)). A **transient** one-step
  `w`-push 0.5→0.7 moves read-γ to only **1.20** (N=8) / **1.07** (N=24) vs the instant **2.33** — it "prices
  nothing until it persists". Blast-radius damping (h10-B): a single push to w=0.70 reprices the 7-strike put
  book **20.6% instant → 6.1% (N=8) → 2.3% (N=24)** — cut by ~λ. **This is the single most transferable
  perp-venue defense**: a momentary manipulation reprices the third-party book by only a fraction λ of the
  instant effect.
- Does NOT cover (measured, h10-A/C): a **persistent** warp is eventually fully priced (read-γ reaches 1% of
  true in 19 steps at N=8, 55 at N=24). EMA neutralizes the *transient*, not the *sustained*. So EMA does NOT by
  itself make Vector B (a durable abandoned warp) harmless — it only buys time and forces the attacker to
  *maintain* the push against mean-reversion/arb (the perp property: you can hold the mark off-index only by
  continuously paying).
- Interaction with honest funding responsiveness (measured, h10-A): the SAME lag applies to genuine `w`-moves —
  honest funding responds `N`-windows slowly. This is a real, bounded cost of (ii): a UX/responsiveness ↔
  manipulation-resistance dial (perp venues accept exactly this trade-off in their TWAP window choice).

**(iii) Per-window `w`-motion rate limit** = price-band / OI-limit analog.
- Effect (reasoned + h10-C): caps how FAST the skew can be established regardless of payment; combined with (ii)
  it bounds the *rate* at which even a paying attacker can translate a push into book repricing. This is the
  literal perp price-band: you can move the mark, but only so far per window, so a large repricing takes many
  windows and is arbable/fundable in between.
- Does NOT cover: the *eventual* level of a determined paying attacker (only its speed). Caps a legitimate large
  trader too (same UX cost as a perp price-band).
- Cost: low (a per-window Δw clamp on the trade path).

**(iv) Funding clamp** = perp funding-rate cap.
- Effect (reasoned): bounds the funding a manipulated skew can extract/impose per window. Since our funding reads
  `g_loc = m·γ` through the lens (CLAUDE.md entry 232), an EMA-banded read-γ (ii) already *softens* the funding
  response; a hard clamp on the per-window funding magnitude is the belt-and-suspenders cap. Low cost.
- Does NOT cover: settlement seams (funding clamp is funding-only); those ride on (ii).

**(v) Insurance-fund sink — re-examined as a HYBRID** (charge credits pool up to the floor, EXCESS to a fund).
- Run #3 showed naive route-ALL-to-sink **breaks P-CYCLE** (pool drains $1.6M→$1.225M). **Re-examined (h10-D):**
  the hybrid (pool-first-to-floor, remainder-to-fund) **is sound — P-CYCLE HOLDS at every κ** (minPool = pool
  start exactly). BUT under the *bare* counterfactual charge (κ=1) the **fund collects $0**, because charge ==
  drain exactly (run #3 (1c) fact — no overshoot to skim). The fund only accrues if the levy carries a
  **penalty basis κ>1**: at κ=1.5 the fund collects **$297 181** over the ratchet while the pool stays whole; at
  κ=2.0, **$594 362**. So: an insurance fund funded by the manipulation levy is a **sound design only with an
  explicit surcharge**, not from the round-trip charge itself. That surcharge is also a second deterrent knob.
- Cost: medium (fund accounting + a κ decision — a product/economics call, since κ>1 taxes honest closes too
  unless scoped to flagged manipulation).

### 4.3 — THE RECOMMENDATION: the minimal composed stack

Target properties, and how the stack achieves each:

- **(a) No free or negative-cost attack in any measured vector.** cycles/sybil (Part 1(d): floor, no free
  ratchet) + LP-resize timing (Part 3 Vector A: **charge resize-invariance**) + exit-without-close (Part 3
  Vector B: **charge-the-open / freeze-w-on-exit**). All three are already the Part-3 MUST tier.
- **(b) Bounded third-party repricing RATE even for a PAYING attacker** — the perp-venue property. Achieved by
  **(ii) EMA-banded read-γ** (measured: transient blast radius cut to ~λ) **+ (iii) per-window w-rate-limit**
  (caps the speed of a sustained push). Neither changes the *cost* (that's (i)); together they make book
  repricing slow and arbable, exactly like a perp price-band + TWAP mark.
- **(c) Honest-trader cost ≈ 0.** The charge is **pool-integrity, not payout** — `dx` never reaches the trader
  (prior MR4, `SPEC_close_first_class_trade` §MR4); a genuine directional close pays only its true settlement.
  EMA (ii) + rate-limit (iii) cost honest traders only a *bounded response lag* (h10-A), the same trade-off perp
  venues already accept. κ=1 keeps the fund neutral so no honest surcharge unless a penalty is later scoped.
- **(d) Division of labour intact.** (i) lives at the settlement/close layer (reserves), (ii)/(iv) at the read
  layer (funding/mark), (iii) at the trade path — each is a separate seam, none reaches into the pool curve
  (which stays locked plain-v24 per entries 229/231). No item deforms the invariant.

**Itemized build-scope delta — what enters the close-(b) build NOW vs the next campaign:**

| # | Item | Perp analog | Tier | In close-(b) build NOW? |
|---|------|-------------|------|---|
| 1 | Pool-value floor (charge restores drain) | index/insurance backstop | MUST | **YES — already pinned** |
| 2 | Counterfactual charge = round-trip differential | funding on the basis you create | MUST | **YES — entry-415 design** |
| 3 | Charge **resize-invariance** (scale stored arc by cumulative LP factor, as `rr` does for oracle) | position-vs-collateral accounting | MUST | **YES — the real Part-3 leak (Vector A); one-line-class engine fix** |
| 4 | Charge-the-open / freeze-`w`-on-exit-without-close | can't leave the mark pushed and walk | MUST | **YES — closes Vector B (else warp is uncharged)** |
| 5 | **EMA/TWAP-banded read-γ** (funding + settlement marks) | TWAP mark smoothing | SHOULD | **NEXT campaign** — highest-value (b)-property item; needs a window `N` calibration + stateful EMA. Recommend adopting the design now, building next. |
| 6 | Per-window `w`-motion rate-limit | price-band / OI-limit | SHOULD | **NEXT campaign** — pairs with #5; low code cost, needs a Δw/window number (product). |
| 7 | Funding-rate clamp | funding cap | SHOULD | **NEXT campaign** — cheap belt-and-suspenders once #5 lands. |
| 8 | Insurance fund via **penalty surcharge κ>1** (hybrid, pool-first) | insurance fund | DEFER | **NEXT campaign / product** — sound only with κ>1 (h10-D); κ is an economics decision. Not needed for (a)–(d); a second deterrent, not a gap-filler. |

**One-word summary for the operator:** the close-(b) build should ship **items 1–4** (the MUST tier — floor +
counterfactual charge + resize-invariance + charge-the-open); these alone close every *measured* free/negative
vector. Items **5–7** (EMA-banded read-γ + w-rate-limit + funding clamp) are the perp-venue *rate-bounding*
layer — they deliver property (b) "you can push the basis but only slowly and expensively", cost honest traders
only a bounded lag, and are the recommended **next campaign** (they need calibration numbers, not new math).
Item **8** (penalty-funded insurance fund) is a further-out product option, sound only with an explicit
surcharge. **The operator's thesis holds: whole-book repricing is not unique — and the perp playbook (anchor
the level, smooth+band the basis, charge for persistence, backstop with a fund) maps cleanly onto our warp,
with the level already anchored by rebase and the basis = the `w`-skew.**

Residual honest caveats: (ii)/(iii)/(iv) effects for the *read* layer are **reasoned + partially measured**
(h10-A/B model the EMA on the `w`→γ→book-mark chain; the live engine has no EMA state yet — flagged for a
build-time vm test). The `N`/Δw-per-window/κ numbers are **calibration decisions [TBD — operator/product]**,
not math verdicts. Dollar magnitudes in Part 3 Vector A stay indicative (accounting not fully closed);
signs/floors are solid.

---

**Provenance:** measured = `scratchpad/closeb/h8_cf.js`, `h9_lp.js`, `h9b_lp.js`, `h10_perp.js` on HEAD
`0e0a0062` engine extract (`engine.js`); external claims = training-knowledge **[TK]**, unverified (no web).
No git, no engine edits, no Aristotle (none needed). Design-stage: close-(b) build HOLDS behind this take-stock
(operator entries 415/416/418).

---
## OPERATOR GLOSS (entry 421/422, canonical simple-English for item ③ resize-invariance)
"Evaluate slippage as per ENTRY LIQUIDITY": the receipt remembers the position's footprint
relative to the liquidity at entry and is re-scaled to today's liquidity when the bill is
computed (same shape as the existing oracle-rebase scaling). LP moves between open and close
can neither shrink nor inflate the bill. Operator: "smooth!" — this phrasing is the canonical
gloss for the build item and the eventual paper sentence.

---

## PART 5 — Is the resize-blindness a REAL exploit on the CURRENTLY SHIPPED design (a)? (operator entry 428) — 2026-07-07

Run #3 (Part 3) found `revertArc` (engine L160-167) subtracts **absolute** stored arc flows `dxA·rr, dyA`,
oracle-scaled only, LP-resize-blind — but quantified the damage in the close-**(b)** *counterfactual-charge*
context. The take-stock's one unquantified box: does that resize-blindness create a real exploit on the
**CURRENTLY SHIPPED design (a)** — the FROZEN-ARC close, HEAD `4bc939ec` (funding-column slice on ratified
`0e0a0062`; engine blocks identical to `0e0a0062`)? Measured Node-vm vs HEAD engine extract,
`scratchpad/closeb/h11_a.js` + `h11b_patch.js`. In (a), `revertArc` **IS** the close (it directly sets the
pool reserves) — there is no charge differential, so the leak is a **direct reserve mis-restoration**, cleaner
and sharper than the (b) charge case.

### HEADLINE: YES — a real, clean, SIGNED, conserved exploit exists on shipped (a), and it is a LIVE reachable path.

The play (**ORDER 1**): *add LP ×(1+λ) → open a band at the trade point → PULL your LP → close.* The close
(`revertArc`) reverses the **absolute** arc on a pool the pull has shrunk, so the reversal is dumped on the
now-honest-only pool. **Full wallet accounting (λ=1, φ=0.5, depth 0.3, put ray chosen=0.7):**

| leg | attacker cashflow ($) |
|-----|----------------------:|
| LP add | −1 600 000 |
| trade paid @open | −321 795.92 |
| LP withdraw @pull | +1 760 897.96 |
| trade received @close (frozen arc) | +321 795.92 |
| **ATTACKER NET** | **+160 897.96** |
| **honest-LP final vs V0** | **−160 897.96** |

- **The attacker's TRADE nets exactly ZERO** — the frozen arc refunds the trader exactly `(dxA,dyA)` at close
  regardless of pool size (that is the "frozen" guarantee, and it *survives* the LP interference). So the
  attacker's **only** P&L channel is the LP round-trip, and it is **pure profit = φ·ΔV_open**, extracted
  1-for-1 from honest LPs. This is not the (b) accounting-not-closed caveat: here **honestLoss + attackerGain
  = 0 to machine precision** (measured), a clean conserved transfer.

### The four asks, answered

1. **Pool reserve/value mis-restoration (who gains).** Honest LPs end **short by exactly φ·ΔV_open**, where
   φ=λ/(1+λ) is the attacker's LP fraction and ΔV_open = the open-trade slippage that transiently sits in the
   pool (o·dxA+dyA). The gain goes to the **attacker's LP claim** (pulled before the reversal). NOT to the
   trader payout (trade nets 0), NOT to `w`. It is a reserve-**value** transfer, honest-LP → attacker-LP.
2. **`w` mis-restoration.** **ZERO in every case measured.** `w` restores exactly because `dwA` is an
   *absolute* increment and `w` is *scale-invariant* under isotropic LP resize (α/x is unchanged by ×f). So
   the lean/steepness is NOT the leak channel on (a) — the entire leak is in the reserve dollar value. (This
   is the opposite of the free-cycler γ-ratchet, which lives in `w`; that one is untouched here.)
3. **Signed / exploitable vs symmetric noise.** **SIGNED and exploitable.** ORDER 1 (add→open→pull→close) =
   honest lose, attacker gain, for any genuine open (real trades pay positive slippage ΔV_open>0, so honest
   loss for put ray chosen=0.5/0.7 depth 0.1–0.3 = −$35 492 … −$282 857). ORDER 2 (open→add→close→pull) is the
   **inverse**: attacker *donates* (honest +$32k…+$129k), so the attacker simply chooses ORDER 1. Off-mark
   directions (chosen=1.3) flip ΔV_open<0, but the attacker just picks a slippage-positive direction. Not
   noise — a directional, conserved transfer the attacker steers.
4. **Magnitude at realistic sizes.** λ=1, **small retail band (depth 0.03)**: transfer = **$9 273/cycle =
   0.58% of the $1.6M pool**. λ=1, aggressive band (depth 0.3): **$160 898/cycle = ~10% of pool**. It is
   **repeatable and compounds** — 8 order-1 cycles at depth 0.1 drain the honest pool **8.36%** ($1.60M →
   $1.466M) with $133 705 to the attacker. Bounded per-cycle only by the depth guard (`w·y·ρ^w`) and by
   λ (φ→1 as λ→∞, but λ=4 already *traps* the close: arc > shrunken pool ⇒ honest reject, so extraction
   saturates near φ≈0.8).

### LIVE-REACHABILITY (the decisive fact for "patch now?")

- LP deposit/withdraw are **live user buttons** in shipped HEAD (`btn-lp-deposit`/`btn-lp-withdraw` → live
  `Store.liquidity(D)`, HTML L2968-2989). `liquidity()` (L2548) has **NO open-band guard** — the only check
  is λ>−1 (can't zero the pool). So *deposit → open → withdraw → close* is a fully unguarded, reachable
  sequence on the shipped build.
- **BUT** the shipped artifact is a **single-user personal simulator** — the "attacker" and the "honest LPs"
  are the same wallet, so there is **no in-sim victim**. The exploit bites only in a **multi-party pool**,
  which is exactly what the **CTO propagates to the Go backend**. → The real risk is the CTO porting (a)'s
  resize-blind frozen-arc close into a shared-LP production pool **before close-(b) lands.**

### Minimal patch candidate (item ③, portable to (a) NOW)

- **Same fix as parked item ③** (scale the stored arc by the cumulative LP factor `F` since open, exactly as
  `rr` already scales for oracle rebase). **Measured: PATCHED `revertArc` restores honest LPs EXACTLY
  (honestΔ=0) at every λ.** `dwA` needs no scaling (w scale-invariant — consistent with ask #2).
- **Nuance (disclosed):** in (a) the patch *moves* the shortfall onto the closing **trader's** refund
  (F·arc instead of full arc). When the attacker IS the LP-mover (the exploit) this removes **all** profit.
  But an **honest** trader whose pool was resized by *other* LPs mid-leg would be under-refunded F·arc — a
  new, smaller, non-exploit unfairness. → The **clean standalone form for (a) is LP-LOCK (mitigation ii):**
  a ~2-line guard in `liquidity()` — *reject a withdrawal (D<0) while any band is open* — structurally
  eliminates the interleave, keeps `revertArc` exact, refunds the trader the full frozen arc. No arc-math,
  no per-leg cumulative-factor state; the arc-scaling form is the right one for close-(b) where per-leg
  charge state already exists.

### Worth patching (a) before CTO handover, vs waiting for close-(b)?

- **Case for waiting:** close-(b) **replaces `revertArc` entirely** (spec `SPEC_close_first_class_trade`,
  operator go entry 407); item ③ is already a close-(b) **MUST**; the sim has no in-sim victim; a splice to
  (a) is engine-touching (serialized + file-safety gate) on a mechanism about to be deleted.
- **Case for patching now:** it is a *live, unguarded, reachable* path on shipped HEAD, and if the CTO ports
  (a)'s close to a multi-party pool ahead of close-(b), it becomes a real production drain. The **LP-lock
  guard is a cheap standalone** (2 lines in `liquidity()`, no arc/close touch) that closes the whole class
  immediately.
- **RESEARCH-LEAD RECOMMENDATION (flag, not decide — sequencing is operator-tier):** the highest-value,
  lowest-risk action is a **DOCUMENTED CTO-handover warning** ("(a)'s frozen-arc close is LP-resize-blind;
  do not port to a shared-LP pool without item ③ OR an LP-lock-while-band-open guard") **plus** an optional
  **LP-lock guard** on (a) as a cheap belt-and-braces. Whether to actually splice (a) now (engine-touching)
  is an operator/sequencing call — flagged, not taken.

**Provenance:** measured `scratchpad/closeb/h11_a.js` + `h11b_patch.js` vs HEAD engine extract; live-path facts
from HEAD `HEAD_temporal_mvp_v28_lens.html` L2548 (`liquidity` no open-band guard) + L2968-2989 (live LP
buttons) + L160-167 (`revertArc` absolute-arc). No git, no engine edits, no Aristotle. This closes the one
unquantified exploit box on the entry-428 take-stock: **the resize-blindness IS a real, live, signed exploit
on shipped (a); leak = φ·ΔV_open in reserve value, w untouched; fix = item ③ / LP-lock.**

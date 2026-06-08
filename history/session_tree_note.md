# Temporal MVP — Session Context / TBD Tree

### BL-CLOSURE (Target 3) — call wing PROVED, last open item closed (branch from 0a0efd51+)
- Aristotle delivered BLClosure.lean. Verified (source audit + real-proof-body
  read; NOT independently compiled — egress wall, trusted-from-prover for the
  build; this delta branches from the post-reconciliation superset, not bare
  0a0efd51):
- GENUINELY PROVED (real intervalIntegral, NOT the rfl/X=X placeholder the prompt
  forbade):
  * Supporting lemmas integral_rpow_zero_to_K / _to_sNorm / _sNorm_to_K: real
    integral_rpow (FTC) with side-conditions discharged (-1<Gamma-1; Gamma!=1
    endpoint via Set.notMem_uIcc_of_lt). Actual antiderivative evals.
  * BL1 total mass: INT_0^K blDensity = 1-Gamma, + point mass Gamma = 1. Real.
  * BL2 THE CLOSURE (main result): BL2_otm_piece (real INT n*(sNorm/theta)) +
    BL2_capped_piece (real INT_0^sNorm n = (1-Gamma)(sNorm/K)^Gamma) + point mass
    Gamma*(sNorm/K) = (sNorm/K)^Gamma. BL2_closure rewrites via the two proved
    integral lemmas then ring — NOT definitional. BL2_vAmerican connects to
    vAmerican, DISCHARGES the development's stated BL hypothesis. The American
    value IS a barrier basket — now machine-checked, not assumed.
  * BL3 density >=0 on 0<Gamma<1 (positive measure = real long basket).
  * BL4 density NEGATIVE for Gamma>1 — machine-checked form of the |Gamma|<=1
    fence (superposition not a positive measure outside gentle band).
- HONEST scope: BL5 put wing is BL5_put_density_note := trivial — the ONLY
  trivial in the file, honestly flagged (docstring: put needs a REFLECTED density
  on [K,inf), not naive mirror — consistent w/ put-native reflect finding; needs
  independent development). No sorry, no axiom-polluters anywhere in project.
- STATUS: 'exactly replicable for 0<Gamma<1' is now PROVED (call wing), was the
  last open research item. Remaining slivers: (a) put-wing closure (reflected
  density — scoped follow-up, honestly marked open); (b) housekeeping CLOSED — re-upload of
  the same archive carried AXIOM_INVENTORY.md; whole development (A-E + put
  PD/PE series) confirmed on base axioms only, grep for any non-base axiom
  returns EMPTY; (c) the shared compile caveat (Lean4.28+mathlib box for
  independent compile — applies to whole development).
- NET: research track essentially complete. Call-wing development now PROVED
  A-E + BL-closure + both wings (put-native + put closure-reflected-flagged),
  base axioms, modulo the one compile + the put-closure follow-up. BL-closure
  was the gate on the 'exactly replicable' paper claim — now machine-checked
  for the call/gentle band.


### CANONICAL RECONCILIATION — CLOSED (bidirectional merge adopted)
- Manager did the diff I requested. Result: divergence was BIDIRECTIONAL —
  my 'RELAY ROUND 2' content was dual-logged in his copy under a different
  header (no loss), AND his copy had entries mine lacked (his v4 audit,
  put-native parallel log, round-2). So NEITHER copy was a clean superset;
  each had independently logged the same events under its own headers. My
  instinct not to assert primacy was correct — declaring either copy canonical
  would have silently dropped the other side's entries.
- FIX: manager did a true bidirectional merge (his copy base + my 4 unique
  audit entries folded in verbatim under a [MERGED FROM RESEARCH-LEAD BRANCH]
  marker). New canonical: 2713 lines, md5 0a0efd51.
- I VERIFIED the merge (did not trust 'nothing dropped'): every one of my
  ### headers survives (comm -23 empty); his 4 unique entries present; PUT-
  NATIVE RUN appears twice (both parties' logs preserved side-by-side, not
  overwritten) — the fingerprint of a real union. md5/line-count match his
  claim. ADOPTED as the new canonical base.
- RULE GOING FORWARD (re-affirmed): single canonical note, append-only, BOTH
  branches start each delta from the latest merged superset (this one,
  0a0efd51) so divergence stops accumulating. Memory-integrity worked on both
  ends — neither side asserted primacy blindly, the diff caught the two-way
  divergence, the union preserved everything.


### RESEARCH-LEAD VERIFICATION PASS (handoff received + independently checked)
- Received american_layer_RESEARCH_handoff.zip (manager -> research lead). Adopted
  the manager's 2300-line session_tree_note.md as CANONICAL (verified superset of my
  working copy + manager's new entries). Routing future note edits back to manager to
  merge (append-only).
- INDEPENDENTLY VERIFIED the manager's three settled claims against the REAL engine
  (did not take on faith):
  1. API TRAP confirmed — fundingPerStrike signature in v25_reference.html line 2083 is
     (state, strike_theta, wing, N, dt, kappa, oracle, oracle_initial). Slots 7,8 =
     oracle/oracle_initial, NOT gamma. My earlier 'pin Gamma to 7th positional arg' brief
     was WRONG and would have silently fed Gamma into the oracle slot (wrong value, no
     error). Manager caught a real defect in MY brief by checking the actual code. The
     corrected v3 brief mandates dedicated legPriceAmerican/fundingAmerican exports and
     forbids touching existing signatures. Credit to manager; constraint must persist.
  2. GRADER PASSABLE confirmed — ran both harnesses against v25_reference.html: regression
     16/16 ALL PASS (curve untouched), american harness ALL PASS (8 checks incl
     funding-carries-2Gamma to float precision). Reference impl: dedicated exports,
     wing-correct theta_eff, gammaEff=2*gamma, fences |Gamma|<=1/Gamma!=0/K>0, theta_eff
     recomputed each call. Matches spec exactly.
  3. FUNDING 2*Gamma confirmed (shipped fundingPerStrike hardcodes +/-2 internally;
     generalise +/-1->Gamma carrying x2 => 2*Gamma).
- INDEPENDENTLY VERIFIED the manager's BL-closure density (the U4c gap, manager did it
  numeric+analytic, NOT machine-checked): n(theta)=Gamma(1-Gamma)/K^2 * theta*(theta/K)^
  (Gamma-2) on (0,K] PLUS point mass Gamma at theta=K. My numpy check: TOTAL MASS = 1.000000
  exactly for Gamma in {0.25,0.5,0.75,0.9} ((1-Gamma) smooth + Gamma point); value
  reproduces (sNorm/K)^Gamma to ~1e-9 (Gamma=0.25 residual 4e-3 = theta->0 spike quadrature
  artifact, as flagged); Gamma>1 density goes negative everywhere (matches '§6 superposition
  not a positive measure outside +/-1'). Manager's decomposition is SOUND and is a clean
  'one unit of instrument' closed form (mass exactly 1). Confirms it's CORRECT for 0<Gamma<1
  but still NOT machine-checked => Lean Target 3 stands.
- OPEN TARGETS (research-lead iteration, per manager note): (1) BL-closure Lean
  formalization (the genuine integral, Target 3 — gates 'exactly replicable' paper claim,
  NOT a build blocker); (2) put-native E3 proof (1+Gamma rate still symmetry-inferred);
  (3) |Gamma|>1 characterization (scope decision — truncated approx w/ bounded error?).
- Loop: math changes -> back to manager to re-verify+update harness/brief before grunt;
  paper-framing only -> package already commit-ready.



> Live brainstorm note. Branching tree, expanded not compacted.
> Mode: BRAINSTORM ONLY. No edits to v5 HTML until Rohan says "do a pass."
> Working file: temporal_mvp_composite_ray_v5.html (v5.1 shipped)

---

## 0. Session frame

- **Purpose of the MVP**: CTO handoff reference. The spec by which the CTO
  upgrades the live DEX:
  - rip out old RB-tree numerical/approximation AMM
  - drop in the closed-form composite-ray engine
  - small corrective changes to settlement logic
- **Implication**: engine + trading-mechanics fidelity is what matters.
  Portfolio/LP polish is cosmetic by comparison.
- **Mode**: brainstorm; Rohan feeds findings; Claude maintains this note;
  passes happen only on explicit instruction.

- **Sequencing principle (Rohan)**: get trade mechanics crystal-clear
  FIRST. Once the engine is right, portfolio falls into line easily —
  it's downstream of correct mechanics. F3/F4/screenshot items are
  "setting the stage" — captured now, not actioned. Rohan hasn't yet
  reached portfolio-update / value-correctness simulation.
  => Portfolio Qs (Q2-Q7) parked, not blocking. Focus stays on 2.1/2.2.

  - RESOLVED Q17: Fork A & Fork B produce the SAME payoffs (same economic
    object, different implementations). F6 is NOT "corrected vs current"
    — there is ONE correct payoff. Composed curve = barrier-correct
    payoff (entry-spot threshold, equity base). Forks differ in how the
    backend computes it, not what it is.
  - RESOLVED Q18: continuous, area-chart style.
  - RESOLVED Q21: bare comparison perp held at SAME MARGIN, different
    leverage — capital-efficiency comparison (gains on same capital,
    liquidation-floor / risk made visible).
  - D1 RESOLVED: composed-payoff logic written FROM SCRATCH in graph
    code. Works in CARVED-PORTION PERP EQUITY (not margin). Piecewise
    barrier: perp linear P&L on carved equity, minus sold-leg payoff
    above its entry-spot threshold, plus bought-leg protection below its
    threshold, capped at outers. New logic, exists nowhere else.
  - D2 RESOLVED: F6 reads from Transact panel for the composed band
    (simplest UX, iterate if fragile). Input sources:
    - baseline perp (leverage, entry mark, notional/carved-equity) —
      ALREADY GIVEN, taken from the perp portfolio. F6 does not ask.
    - the band (sold+bought legs, bounds) — from the Transact panel.
    - F6's ONE OWN input: comparison perp's leverage (single scratch
      control). Comparison perp at same margin as baseline, diff lev.
  - Empty state: if no perp / no band configured, F6 shows neutral
    "configure a position to preview" — no error, no garbage plot.

  #### >>> F6 PAYOFF MECHANIC — LOCKED (revised after deep brainstorm)
  - Positions move around on the ANCHOR curve (w=1/2, fixed shape).
    Live pool curve would need arb-into-shape per price step — not
    automated (production-adjacent) — so anchor is the deterministic ref.
  - 45-degree point of the anchor = ATM = current spot oracle. When
    oracle moves, the 45-deg point re-anchors to the new spot; everything
    else reads proportionally off it.
  - A leg has a fixed strike -> fixed point/slope on the anchor. As spot
    sweeps, the leg's moneyness re-reads. mark = min(slope, 1/slope) is
    the FRACTION (in (0,1]) the leg is worth, of a full perp.
  - **Leg value = fraction x carved-perp EQUITY** (equity = margin + P&L,
    NOT notional/margin alone — same principle as the settlement patch /
    Q13). A band is a live fraction of a perp.
  - Composed position = perp equity - sold-leg value + bought-leg value.
  - Implementation: equals Engine.mark(wing, theta, sNorm) with theta
    fixed (= K / entry-oracle) and sNorm = S_swept / S_entry. The engine
    mark function already encodes min-slope-or-reciprocal vs the ATM
    point — feed it the swept sNorm.
  - NOTIONAL ASYMMETRY (the crux): N_sell small, N_buy large. N_buy is
    ENGINE-DERIVED via cash-conservation V_buy = V_sell, using the real
    Engine.legPrice (Q24 = a-i). Sell little upside, buy lots of floor.
  - THREE liquidation LINES (vertical markers, not curves):
    i. comparison perp (bare, cmpLev) — TOGGLEABLE
    ii. unmodified perp (bare, baseline leverage) — always shown
    iii. protected perp (composed) — always shown
  - Comparison perp toggle answers: "is this just the same as running
    lower leverage?"
  - **SHORTCUT vs SEPARATE ACCOUNTING (principle)**: the composite-ray
    shortcut (theta*=sqrt(ti*to), 2sinh(delta) form) is an EXECUTION
    convenience — opens/closes a spread as ONE AMM swap instead of two.
    It does not hold in the OTM regime. So for VALUING / TRACKING a
    position as price moves, do NOT use the shortcut — account the two
    barriers SEPARATELY (inner barrier minus outer barrier). Honest, and
    simpler (sidesteps where the shortcut breaks).
    => shortcut = how you TRANSACT; separate barriers = how you VALUE.
    => F6 payoff curve: spread leg value = N*(mark_inner - mark_outer),
       each re-marked at swept sNorm, * carved equity.
    => 2sinh(delta) stays ONLY in the N_buy premium derivation (a
       transaction-time quantity), never in the payoff curve.
  - **TENT SHAPE — ACCEPTED (design, not a bug)**: these are BARRIER
    instruments, not American options. A bought spread = long inner
    barrier - short outer barrier. Each barrier's value = mark capped at
    1 (tops out at ONE unit of carved perp when ITM, stays at 1 deeper
    ITM). Netting the two barriers gives a TENT: protection value peaks
    inside the band, decays toward 0 past the outer bound. You cannot get
    "saturate and stay" from a finite barrier spread.
    => Trade-off the protocol accepts: buy THICKER spreads — a wide band
       so the tent stays tall across the region where liquidation
       threatens. Thin spread = tall narrow tent = sliver of protection;
       thick spread = broad tent = real floor coverage.
    => This explains the earlier "narrow band, many units, floor barely
       moves" smoke-test: not a bug — the model honestly showing a narrow
       spread is a poor liquidation hedge.
  - **F6 PAYOFF MODEL — FINAL**: every barrier value = min(mark,1) * N *
    carvedEquity, re-marked at swept sNorm. A leg = 1 barrier (barrier)
    or 2 barriers netted (spread = long inner - short outer). Composed
    equity = perp equity - sold-leg value + bought-leg value. No
    2sinh(delta) in the payoff. Tent shape is expected output.
  - **STRUCTURAL FINDING — costless-collar arb is a SKEW phenomenon**
    (surfaced from F6 smoke-tests; instrument-agnostic).
    - Costless collar: V_sell = V_buy by construction. Bought-leg total
      value is pinned to the V_sell budget.
    - Symmetric pool (w = 1/2, no skew): marks symmetric across wings.
      Premium raised = premium spent, priced off the SAME symmetric
      curve. No capital-efficiency edge — what you give up equals what
      you get. "Sell little, buy lots" does NOT hold at zero skew.
    - The edge requires the BOUGHT wing cheaper per unit than the SOLD
      wing — that asymmetry IS skew (w != 1/2). Skewed pool depresses one
      wing's mark; if the protection wing is the cheap one, the V_sell
      budget buys more units there. Directional: exists when consensus is
      crowded on the side you sell, leaving protection underpriced.
    - Holds for barrier AND American — falls out of V_sell=V_buy + the
      pricing symmetry, not from the instrument choice.
    - Connects to funding: protocol funding is countercyclical (taxes
      skew, pays contrarian). Collar edge and funding flow are the SAME
      quantity — directional imbalance — seen twice. No skew => no edge
      => no funding flow. Coherent.
    - CAVEAT (do not overclaim): "no arb without skew" is about CASH /
      pricing arbitrage. Liquidation protection still has RISK-MANAGEMENT
      value at zero skew — the perp is leveraged, liquidation is
      discontinuous & ruinous; capping smooth upside vs preventing a
      wipeout are not symmetric in UTILITY. At zero skew the collar can
      still be worth doing; what vanishes is the FREE value.
    - TODO: re-run F6 with a deliberately skewed pool (w != 1/2) — N_buy
      should jump, floor should move. Confirms the thesis vs merely being
      consistent with it.

## 1b. BUILD SCOPE — pass authorised by Rohan (this pass ONLY)
- THREE edits this pass, nothing else:
  1. F6 — fourth graph, interactive payoff simulator
  2. F2 — outer-bound box sized to match inner-bound box
  3. F1 — dollar subline = per-leg dollar notional on BOTH legs
     (range-invariant); virtual-dollar / premium-flow -> audit section
- Everything else (F3 F4 F5, fork patches, auto-protect, polish bucket)
  stays PARKED for the next pass.

## 1. Priority spine (this session)

1. [ ] Visual formatting — curve viz / trading surface reads correctly
2. [ ] Trading mechanics — engine fidelity (barrier/spread, cross-wing,
       OTM, premium math)
3. [ ] Portfolio / settlements — existing-position info (lower priority)
4. [ ] LP — last; may not do at all

---

## 2. TBD tree (grows from Rohan's findings)

### 2.1 Visual formatting
- [ ] **F6 — FOURTH GRAPH: interactive payoff simulator** *** PRIORITY ***
  - Promoted ahead of the fork items for immediate push.
  - PURPOSE: pre-trade payoff simulator — trader sees WHAT THEY'RE
    ENTERING before committing. New 4th graph on the graph panel.
  - Compares TWO curves over a perp-mark % change x-axis:
    - Curve 1 — COMPOSED position: perp + the band being configured
      (sold leg + bought leg). The protected payoff profile.
    - Curve 2 — BARE perp, with its OWN selectable leverage, as the
      comparison baseline.
  - Plus LIQUIDATION-FLOOR COMPARISON: where the composed position
    liquidates vs where the bare perp liquidates. Derisking made visual.
  - RESOLVED Q16: TWO curves (composed vs one bare perp), not three.
    Bare perp's leverage is an independent comparison control. Image's
    3-way (3x/5x/protected) was just illustrative.
  - RESOLVED Q19: y-axis = position equity / payoff in $ ("what you're
    entering" => equity is the trader-relevant quantity).
  - RESOLVED Q20: composed curve reads the band CURRENTLY being
    configured in the Transact panel (pre-trade tool must reflect live
    trade inputs). Bare-perp leverage = separate scratch control.
  - OPEN Q17 [KEY]: composed curve uses CORRECTED Fork-A barrier
    valuation (entry-spot threshold, equity-based bought-leg value) or
    current model? Pre-trade "what you're entering" => should show TRUE
    payoff => corrected semantics. Means F6 is built on corrected math
    BEFORE backend patch ships (F6 becomes visual proof of the corrected
    model). Confirm — this couples F6 to the fork work.
  - OPEN Q18: x-axis — continuous line vs stepped bars. Sweep range
    (+/-50%) fixed or a control?
  - OPEN Q21: bare-perp comparison curve — same notional & same entry
    mark as the composed position, only leverage differs (apples-to-
    apples)? Assume yes — confirm.

- [ ] **F1 — dollar subline semantics** (also touches mechanics/display contract)
  - Problem: $ subline under BTC quantity means different things per leg
    - Sell leg: dollar notional (N_sell * oracle)
    - Buy leg: virtual dollar proceeds (V_sell premium recycled to size buy)
  - Fix: BOTH legs show **dollar notional** in the subline
    - Sell leg: N_sell * oracle
    - Buy leg: N_buy * oracle  (N_buy is the derived cash-conserving qty)
  - **Notional is per-leg and RANGE-INVARIANT**: subline = N_leg * oracle,
    unchanged when inner/outer bounds (barrier/spread range) are adjusted.
    Bounds reshape premium & curve position; notional is a fixed leg property.
  - Virtual-dollar / premium-flow figure -> moves to **audit section**
    (this IS the range-sensitive number; belongs in audit, not primary card)
  - Q1 RESOLVED: each leg shows its OWN notional (N_buy*oracle on buy leg).
- [ ] **F2 — outer-bound box sizing**
  - Outer-bound input box should match inner-bound box size
  - Goal: symmetric / aesthetically clean; up-down stepper arrows
    comfortably visible & clickable
  - Current: outer box sized differently (likely smaller)

### 2.2 Trading mechanics
- (none yet — F1 has a display/mechanics overlap, tracked under 2.1)

### 2.3 Portfolio / settlements
- [ ] **F3 — portfolio combined Total column**
  - Problem: portfolio shows Value + Funding as separate columns;
    user must mental-math the all-in number
  - Fix: add a 3rd column **Total** (= Value + Funding), signed sum
  - Funding carries sign (sold legs opposite-sign to bought legs;
    crowded side pays / contrarian receives) -> Total can be above OR
    below Value. Straight signed sum, NOT Value + |Funding|.
  - Display contract: BTC-primary, $ secondary (match Value/Funding cols)
  - OPEN Q2: column label — "Total" vs "Position Value"?
  - NOTE: F3's Total column likely subsumed by F4's Total row — see F4.

- [ ] **F4 — per-leg-piece portfolio breakdown** (big restructure)
  - Current: one row per band (collapsed band value)
  - Proposed: each band expands into UP TO 4 lines
    - Sold part: 1-2 pieces
    - Bought part: 1-2 pieces
    - 1 piece = barrier (inner bound only); 2 pieces = spread (inner+outer)
    - band = sold(1-2) + bought(1-2) => 2 to 4 lines
    - + a **Total row** at end of band
  - Purpose: see VALUE BREAKUP per piece, not just collapsed band value
  - Per piece, retain TWO strikes:
    - Original strike — strike as opened
    - Effective strike — = original while OTM; snaps to spot when ITM,
      tracks spot thereafter. Closure-relevant.
  - At closure: per-piece rows are DISPLAY/BREAKDOWN ONLY.
    Execution still uses composite-ray shortcut — club pieces, run sell
    transaction in ONE SHOT. Breakdown informs; shortcut executes.
  - OPEN Q3: "strike" granularity for a spread piece — composite theta*
    (one number), or inner/outer bounds pair?
  - OPEN Q4: ITM definition for effective-strike snap on a spread —
    snap at inner-bound crossing? effective strike = clamp(spot, bounds)?
  - OPEN Q5: does the 4-line breakdown REPLACE the band row outright,
    or does a collapsed band row remain and expand into the breakdown?
  - **Old portfolio (screenshot, to be replaced)** — header was:
    SELL | NOTIONAL (BTC) | DIRECTION | INTRINSIC VALUE | FUNDING |
    EXTRINSIC VALUE | POSITION VALUE | INITIAL INNER BOUND |
    INITIAL OUTER BOUND | RESIDUAL INNER BOUND | RESIDUAL OUTER BOUND | CLOSE
  - Why old layout failed (Rohan): "hid and aggregated away information",
    hectic to work with. Resolving to make it crystal clear as part of the
    closed-form upgrade.
    - one row per band -> sold+bought collapsed, no per-piece value breakup
    - "INITIAL/RESIDUAL inner/outer bound" = old cumbersome vocab for
      F4's original strike / effective strike. "Residual bound" -> rename
      to "effective strike". 4 bound columns flatten a per-piece pair.
    - INTRINSIC/EXTRINSIC/POSITION VALUE split by type but not by piece
  - => F4 is a COLUMN rethink too, not just adding rows. New per-piece row
    carries: piece identity (sold/bought, barrier/spread), original strike,
    effective strike, value contribution. Band Total row aggregates.
  - OPEN Q6: keep intrinsic/extrinsic value split per piece row, or is it
    redundant? (effective != original gap already encodes intrinsic)
  - OPEN Q7: CLOSE action stays at BAND level (one-shot composite-ray on
    whole band), not per piece — confirm.
- [ ] **F5 — origin-perp accounting columns in bands portfolio**
  - Each band is opened against an ORIGIN PERP (the perp futures
    position the band protects). Settlement is denominated in units of
    this perp (L0 frozen at open, trader_payout = L0 * raw_net, perp-club
    equity bucket) -> perp accounting must be carried with the band.
  - Add 4 perp-side columns:
    1. Perp equity at entry — origin perp equity at band-open
    2. Perp mark price at entry — perp mark at band-open
    3. Attributable perp P&L since — perp P&L since entry, attributable
       to this band
    4. Perp equity at closure — origin perp equity at close time
  - Placement: all 4 sit on the row for the **inner bound of the sold
    part** (sold leg's primary piece row). NOT repeated across other
    piece rows — band-origin properties anchored to one row.
  - Rationale: sold-part inner-bound row = natural band "anchor row"
    (primary piece of the leg whose premium funds the band).
  - OPEN Q8 RESOLVED: perp side runs an AGGREGATION MODEL — trader's
    perp is a single aggregated position, grows/shrinks as same-direction
    size is added (not discrete lots). A band is created FROM A PORTION
    of that aggregated perp.
    => F5's 4 columns = stats of the CARVED PORTION the band was minted
       against, frozen at band-open. Accounted separately so the band's
       settlement math is not contaminated by post-open perp activity
       (more size added, mark moved, equity changed unrelated to band).
    => Perp-side analogue of frozen-attribution: L0 frozen at open, AND
       the carved portion's entry stats (equity, mark) frozen at open.
       Band carries its own immutable origin slice.
    => "Attributable perp P&L since" = P&L of that frozen slice tracked
       forward, NOT a re-derived share of the live aggregate.
  - OPEN Q11 RESOLVED: carved slice is frozen in ABSOLUTE NOTIONAL.
    Later same-direction perp adds do NOT dilute it. Attributable P&L
    since = mark-move * fixed slice notional. The slice also records its
    own carved underlying EQUITY at open (the band's frozen origin slice
    = {absolute notional, entry equity, entry mark}, all immutable).
  - OPEN Q9: closure-time fields (perp equity at closure) render blank/
    em-dash for an open band, fill on close — confirm (no live estimate).
  - OPEN Q10: relevance class — these are CLOSURE-relevant specifically,
    a possible 3rd bucket distinct from trade-relevant / audit-relevant.

### 2.4 LP
- (deferred / maybe not)

---

## 3. Carry-over from mvp_v5_brainstorm.md (not yet triaged this session)

### Polish bucket (small, fast)
- [ ] Per-field red border on OTM violation (engine already rejects)
- [ ] Per-leg signed slippage in audit strip (band-level absolute in summary)
- [ ] Audit-strip label adapts to mode (barrier: V=N*mark; spread: V=N*mark*2sinh)
- [ ] Stale summary tooltip ("0 in current closed-form simulator")

### v6 deferred (LP / Earn) — out of session priority unless promoted
- LP deposits/withdrawals with leverage L
- Two-curve uniform scaling on deposit (1+s, s = D*L/V_total)
- Synthetic vs borrowed leverage semantics
- Perp-style LP liquidation rule
- LP P&L decomposition
- LP withdrawal of accrued fees
- Funding on leveraged LP portion

---

## 4. Closed decisions (don't reopen)

- Fee: open-only, 0.0001 * N_input, separate counter (not pool inflow)
- Slippage: display-only, closed-form already prices it
- No sliders; stepper sensitivity solves sim-sweep
- Same-wing 4-strike model from v4 dropped; cross-wing canonical
- Audit strip default collapsed
- Barrier = trade primitive; spread translates through it
- BTC-primary display, $ inline secondary
- Strikes stay in $

---

## 2.5 SETTLEMENT FORK — minimal-change vs full rework

> Surfaced from the perp-backend repo + old portfolio screenshot.
> Two distinct paths for getting intrinsic value correct. Keep as a fork
> until Rohan decides where to take it.

### Backend grounding (perp-backend-main)
- Settlement math lives in `settlements/services/residual_bonds.go`:
  `CalculateSoldResidualBond(perpMark, boundLow, boundHigh)` and the
  Bought mirror. Clean piecewise:
    - perpMark <= innerBound -> profit 0, range untouched
    - perpMark >= outerBound -> profit = outerBound - innerBound (traversed)
    - inside           -> profit = perpMark - innerBound (partial)
- "Intrinsic value" (frontend label) = `profit`, measured FROM innerBound.
- Callers: `update_transaction.go` L78-82 pass tx.SoldInitialInnerPrice /
  tx.BoughtInitialInnerPrice as the bounds. These fields currently hold
  the STRIKE.
- Transaction model (`settlements/models/transaction.go`): has
  SoldInitialInner/OuterPrice + Bound, Bought mirror. NO entry-spot field
  currently exists.

### Diagnosis (Rohan)
- Current model tracks **spot vs strike**.
- A barrier option's intrinsic should track **spot vs entry-spot**
  (entry-spot = the barrier reference, not the strike).
- residual_bonds.go ALREADY measures profit from innerBound — the bug is
  only WHAT is fed as innerBound (strike, should be entry-spot).

### Fork A — minimal change (rip-and-replace into EXISTING settlement)
- residual_bonds.go itself needs NO change — it's parametric in the bounds.
- Change is one level up: what populates the inner bound.
  - A1: repopulate SoldInitialInnerPrice with entry-spot at open.
    Zero settlement-code change; but loses strike from that field, and
    frontend INITIAL INNER BOUND column then shows entry-spot.
  - A2: add SoldEntrySpot/BoughtEntrySpot fields to Transaction model,
    populate at open, change update_transaction.go callers (L78-82) to
    pass entry-spot as inner-bound arg. Strike stays for display.
    Cost: 1 new field + 4 edited call-sites. Honest version.
- **CATCH**: profit when traversed = outerBound - innerBound. Shifting
  inner ref to entry-spot WITHOUT rebasing outer changes max-payoff width
  (outer - entrySpot != outer - strike). => must rebase the WHOLE bound
  PAIR onto the entry-spot frame, not just inner. Still cheap, 2 numbers.
- Value: buys correct barrier intrinsic NOW, before the closed-form AMM
  swap. A bridge for the current RB-tree product.

#### >>> FORK A — LOCKED PATCH (supersedes A1/A2/CATCH above)
- Key discovery: `tx.PerpMarketPrice` ALREADY EXISTS on the Transaction
  model and is ALREADY populated at band-open (transact/insert_into_DB.go
  L126). It IS the entry-spot. NO new field, NO schema change needed.
- The "CATCH" (width) dissolves under A-anchor: leave the outer bound as
  the trader's CHOSEN outer strike. Collar runs entry-spot -> outer
  strike. Max payoff = outerStrike - entrySpot — the honest number.
  No `width` computation, no pair-shift.
- **THE PATCH**: update_transaction.go L78-82, four call-sites
  (sold/bought x long/short). Swap ONE argument:
    inner-bound arg: tx.SoldInitialInnerPrice (strike)
                  -> tx.PerpMarketPrice (entry-spot)
  outer-bound arg unchanged. residual_bonds.go regime block UNTOUCHED.
  Transaction model UNTOUCHED.
- Verify before ship:
  - PerpMarketPrice is perp MARK frame (matches updatedPerpPrice fed to
    residual_bonds), not an oracle index. (Q12 resolved into this.)
  - residualInner output in untouched regime now returns entrySpot not
    strike -> changes frontend RESIDUAL INNER BOUND display only.

#### >>> RESIDUAL-VALUE DENOMINATION PATCH (second surgical patch)
- Premise (Rohan): a band's value IS a knock-thresholded perp payoff.
  An OTM band = a FRACTION of a perp. => the multiplier is the thing
  being fractionalised: fraction x (one perp).
- "One perp" worth = its EQUITY (margin + accrued P&L), not entry margin.
  A band is a LIVE claim (funding accrues, intrinsic tracks live spot via
  Fork A, closes at live price). Every other limb is live -> the base
  must be live too. Frozen entry-spot THRESHOLD + live EQUITY base is the
  coherent pair. Frozen threshold + frozen margin = double-freeze (wrong).
- Correction to earlier reasoning: Fork A anchors the THRESHOLD (reference
  line) to entry-spot; it does NOT freeze the PAYOFF. Payoff
  (perpMark - entrySpot) is live. So consistent partner = live base.
- WHICH equity: the CARVED PORTION's equity, NOT whole-perp equity.
  Whole-perp equity would inject unrelated perp activity (contamination,
  violates frozen-origin-slice principle). Carved-slice equity = carved
  entry margin + attributable P&L on the frozen-notional slice — that is
  the slice's own honest live worth, not contamination.
- SCOPE (Rohan): carved portion is ALREADY accounted for & wired. This is
  NOT a Fork B drag-in. The only bug: residual currently fractionalises
  the carved portion's MARGIN; it should fractionalise its EQUITY.
- **THE PATCH**: update_transaction.go L158 & L162. Today:
    sellValueInDollars = sellValueInUpsideUnits * tx.InitialPerpMargin
  Change multiplier:
    InitialPerpMargin -> carvedEquity
    where carvedEquity = InitialPerpMargin + attributablePnL (carved
    portion). attributablePnL already computed in shape
    (updatedPerpPrice - PerpMarketPrice) * Quantity (cf. DepositPriceEffect
    L222). Same file, both buy- and sell-side lines.
- Q13 RESOLVED: fraction multiplies carved-portion EQUITY (margin + P&L),
  not margin only.

#### >>> AUTO-PROTECT RE-DERIVATION (third item under the fork)
- Spreadsheet: Perp_Options_24-03-25.xlsx, tab "Auto-Protect Perp".
- Current auto-protect logic (long perp example: entry $70,532, 10x,
  liq $65,242):
  - SELL band inner = (1 + 1/lev)*entry = $77,585 — trader sells perp
    profit above ~+10% (one margin's worth of upside). Barrier on upside.
  - BUY band: F13 = liqPrice*(1+buffer) ~ $66,547; G13 = liqPrice*(1-0.3)
    ~ $45,669 — protection pushes liquidation floor down ~30%.
  - Premium from sold upside funds bought floor-pushaway. Cash-conserving.
- THE BUG: floor-pushaway is sized as a FIXED FRACTION — param D8 = 0.3
  (Floor Protection). It's a geometric assumption decoupled from what the
  protection is actually WORTH.
- The quandary (Rohan): barrier-option valuation makes the OTM protection
  leg worth MORE than a margin-only model assumes — it bears PROFITS too
  (once spot enters the protected region the bought leg accrues intrinsic
  perpMark - entrySpot; it's a live fraction of a perp valued on EQUITY
  not margin — cf. the two locked patches above).
  => more protection value => floor can be pushed FURTHER than 30%.
  => current D8 = 0.3 UNDERSELLS the real liquidation-floor pushaway.
- Fix shape: auto-protect must be RE-DERIVED from the protection leg's
  actual barrier-option value, not from a hardcoded fraction. Floor moves
  as far as the correctly-valued bought leg can fund. Same finding as the
  two patches, propagated up into auto-protect sizing.
- OPEN Q14: is D8=0.3 to become a derived OUTPUT (solve floor-pushaway
  given premium budget = sold leg's barrier-option value), or kept as a
  CEILING on an otherwise-derived pushaway?
- OPEN Q15: extra protection value from — (a) sold upside leg raises more
  premium than margin-model credits (bigger budget), (b) bought floor leg
  delivers more pushaway per premium dollar, or (a)+(b) compounding?
  Rohan's msg points at (b); confirm.

### Fork B — full rework (lands WITH the closed-form engine)
- The F4/F5 path: per-piece rows, effective strike (snaps to spot ITM),
  perp-denominated settlement, frozen origin slice.
- The destination architecture.

### The decision
- A and B are NOT mutually exclusive. A can ship first into the live
  RB-tree settlement, be superseded by B when the engine swaps in.
- Real question: is A worth the work given B is coming anyway, or skip
  straight to B?
- Tension to hold: barrier intrinsic-from-entry-spot (Fork A) is correct
  BARRIER semantics; but the closed-form AMM prices the STRIKE continuum
  (intrinsic is structurally spot-vs-strike there). Same tension as the
  rebasing note. => A is a barrier-frame patch; B is strike-continuum
  native. Decide consciously, don't let A quietly become the model.
- OPEN Q12: for Fork A, is "entry-spot" the perp mark at band-open, or
  the oracle spot at band-open? (residual_bonds is fed perpMark live;
  the entry reference should match that frame.)

## 2.6 PROPOSED SETTLEMENT PROTOCOL (C1-enabled, brainstormed this session)

> Surfaced once C1 proved the composite-ray shortcut valid for ITM
> settlement via effective-strike substitution. A simplification of the
> current two-tradeUpdate closeBand.

### Cross-wing geometry fact
- The two legs sit on OPPOSITE wings (one call-side, one put-side).
- Spot can be ITM on at most ONE wing at a time => at most ONE leg is
  ITM. "Both fully ITM" is impossible. Within the ITM leg, at most the
  inner barrier tops out while the outer stays partial (C1's
  inner-ITM/outer-OTM case, handled by strike substitution).
- Real case split: (a) neither leg ITM (both OTM), (b) one leg ITM.

### The protocol (end to end)
1. At most one leg is ITM (cross-wing geometry).
2. ITM leg: the topped-out (fully-ITM) part has NO AMM closure tx — it
   is SETTLED-TO-CASH (it has value but no live curve dynamics; not
   "vanished" — settled). Strike substitution gives its value. Partial
   (inner-ITM/outer-OTM) handled by C1's effective-strike substitution.
3. The other (live, OTM) leg is reversed on the AMM normally.
4. All leg values are in CARVED-PERP-EQUITY units. Convert to dollars at
   the **carved slice's CLOSING equity** (carved entry margin +/-
   attributable P/L on the frozen-notional slice). This is the unit
   conversion (carved-perp -> dollars), NOT a bolted-on adjustment. It
   "deflates" when the slice lost money, "inflates" when it gained —
   symmetric; it is just the honest exchange rate at close.
5. Leverage amplification via FROZEN L0 applies to the net; club-equity
   floor still applies.

### Two distinct scalars (do not conflate — earlier confusion resolved)
- L0 (frozen at open) — leverage AMPLIFICATION of raw net.
- carved slice closing equity — UNIT CONVERSION carved-perp -> dollars.
  Different jobs; they do not conflict.

### Status
- Consistent with: carved-equity unit model, frozen-origin-slice
  principle (slice notional frozen => no contamination from later perp
  activity), C1's ITM shortcut.
- Simplifies closeBand: at most one AMM tx + one cash adjustment, vs
  the current two tradeUpdates.
- PENDING: C5 is re-validating the unified formula; if C5 adjusts it,
  this protocol's leg-value step moves with it.

## 5. Open questions for Rohan
## 5. Open questions for Rohan

### C6 — THE KURTOSIS FAMILY (consolidated; absorbs old C6 + C7)
- BREAKTHROUGH REFRAME: the family parameter is the KURTOSIS of the
  liquidity distribution. The warp AMM is secretly a TWO-MOMENT family:
  w = skew (3rd-moment-like, directional tilt — established), kappa =
  kurtosis (4th-moment-like, peaked-thin-tail <-> flat-fat-tail — NO
  current parameter controls it). Balancer and the exp/log curve are
  not rival choices — they are two settings of one continuous kappa.
- kappa is the SPECIAL locus along which C1-style CLOSED-FORM SETTLEMENT
  is preserved while kurtosis moves. The family = the curve through
  distribution-space on which closed-form tractability survives.
- UNIFIES old C6 (conservation) + C7 (interpolation) into ONE conjecture
  — kappa IS the interpolation; nothing separate to sequence. Q47
  dissolved.
- T3 / coherent-warp claim (Rohan's addition): the valuation surface
  gains a kappa dimension; a trade at ANY kurtosis level conserves a
  quantity ACROSS all other kappa levels — the whole surface warps as
  one piece. Conserved-quantity candidate: protection-integral /
  capital-efficiency per premium, integrated against the pool's OWN
  liquidity density; moving kappa redistributes protection shape
  (sharp <-> smeared) but preserves the integral. Also: C4/C5 no-arb
  holds UNIFORMLY along the whole kappa-family.
- Resolved hinges: Q50 = "find the family" (exploratory derivation, not
  verify-only); Q51 = kurtosis of the LIQUIDITY DISTRIBUTION (primary;
  value surface is the derived dual); Q48 = kappa parametrizes the
  CURVE/invariant directly, coherence follows.
- PAPER ANGLE: this is the Future Directions section — a specific named
  object (two-moment liquidity family), directly answering the paper's
  stated Limitation (higher-moment regime shifts can't be absorbed
  parametrically — kappa IS that absorption). Makes the current
  fixed-kappa-Balancer paper look like one slice of a recognized family.
- PROMPT PRODUCED: lean_prompt_C6.md — staged derivation T1 (construct
  kappa-family) -> T2 (closed-form settlement preserved along kappa) ->
  T3 (conserved quantity / coherent warp) -> T4 (kappa-w orthogonality).
  Framed EXPLORATORY (propose + verify); partial results with named
  obstructions explicitly welcomed. Honest-framing carried.

### C6 ARISTOTLE RESULT — received, assessed (run 3f2bf8c0)
- Status: 5 Lean files, ~879 lines, zero sorry, standard axioms only.
  Substantial — but the summary OVERSELLS (T3/T4); honest verdict below.
- GENUINE DISCOVERY (the real result): the exponential/log curve is NOT
  a member of the kappa-family. The conjecture "Balancer and log/exp are
  two settings of one continuous kappa" is DISPROVED as stated. The
  kappa-family built is the Box-Cox / CES family Psi_k = w*phi_k(x) +
  (1-w)*phi_k(y), phi_k(t)=(t^k-1)/k — Balancer at k=0, constant-sum at
  k=1, harmonic at k=-1. The exp curve is provably OFF this family
  (power vs exponential = different species). They share only the
  weaker "separable CFMM" structure w*f(x)+(1-w)*f(y)=C. CORRECTS our
  cone picture: not one cone — a continuous CES line + exp curve sitting
  OFF it, both inside the room of separable CFMMs.
- GENUINELY PROVEN (the win): T1 real work — boxCox_strictMono,
  boxCox_concaveOn (CFMM-validity) are honest derivative/concavity
  proofs; Balancer recovery at k=0 real; kurtosis proxy varies
  monotonically. T2's gem: closed-form settlement preserved along kappa
  BECAUSE invariant is separable AND phi_k has an elementary inverse for
  all k (boxCox_has_elementary_inverse — proved). Extends to exp curve
  too. "Tractability conserved" has genuine support = separability +
  elementary-invertibility.
- OVERSELL 1 — T3/T4 near-vacuous. T3's psi_symmetric, coherent_warp,
  any_separable_symmetric_at_half all reduce to (1/2)f(x)+(1/2)f(y) =
  (1/2)f(y)+(1/2)f(x) — commutativity; closed by `ring`; "for all kappa"
  true because the proof never uses kappa. T4's orthogonality theorems
  are `fun _ => rfl` — true by construction (skewMeasure/kurtosisProxy
  defined as separate 1-arg fns). The REAL T3 conservation claim is
  honestly left as protectionIntegralInvariance_conjecture := True (a
  literal placeholder). So "T3/T4 proved" = trivial shadows; the actual
  conservation law and the actual kappa-w coupling are OPEN.
- OVERSELL 2 — T2 does NOT connect to C1. Proves phi_k elementarily
  invertible => mark built from elementary ops; but file admits the C1
  sinh/composite-ray recovery is "deferred — convention-matching".
  markCES_elementary just unfolds the definition (aesop). "Settlement
  stays elementary along kappa" = plausible/structural; "the C1 shortcut
  generalizes along kappa" = NOT proven.
- OVERSELL 3 — T4 "orthogonality" contradicts our geometry. We reasoned
  kappa and w are RANGE-coupled (skew has zero room at the flat pole).
  C6 didn't prove orthogonality — it assumed it by definition. The real
  coupling question is untouched.
- NET: one real discovery (exp curve off the CES family — paper-worthy),
  one solid construction (the Box-Cox/CES kappa-family, Balancer at
  k=0), one good insight (separability + elementary-invertibility =>
  tractability). T3/T4 theatrical. Same pattern as C2: a weaker
  provable thing proved & named as the full claim.
- C6 IS ENTIRELY STATIC — no theorem about a trade, state-transition,
  metric, geodesic, or degeneracy-as-flow. The whole dynamical /
  geometric layer is absent. => motivates C8.
- PAPER: citable = "we construct a one-parameter CES family
  interpolating Balancer with constant-sum/harmonic AMMs, varying
  liquidity kurtosis, closed-form tractability preserved by
  separability; the exponential curve is provably a separate species."
  Do NOT cite "conservation law proved" or "orthogonality proved".

### C8 — CONVEXITY MARKETS (the session's convergence point)
- The idea (term Rohan had independently reached multiple times):
  trade CONVEXITY, not strikes. Ladder: classic AMM trades spot ->
  warp AMM trades strikes (price inherited from the curve) -> C8 trades
  convexity (curvature inherited from a SURFACE). Each rung: instrument
  stops CARRYING a property, starts INHERITING it from a richer pool
  object.
- Thesis: the pool is a convexity SURFACE; the instrument inherits its
  convexity from it (pool curvature field == instrument payoff convexity
  — one object); a trader picks CONVEXITY INSTRUMENTS (shapes carved
  from the surface) and their compositions; "strike" becomes a DERIVED
  feature (where the convexity profile concentrates), not an input.
  "One pool, one weight w, strikes" -> "one pool, one convexity surface,
  convexity instruments" = a CONVEXITY MARKET.
- How we got here (all forced, step by step): payoff-graph debug ->
  no-arb is skew -> capital efficiency is conserved not a number ->
  barrier & American are points on a continuum -> the continuum is a
  kurtosis family -> convexity as primitive, strike as derived. The
  convergence point of the whole session.
- PROMPT PRODUCED: lean_prompt_C8.md — one consolidated EXPLORATORY run.
  D1 convexity-as-primitive + strike-as-derived (with a falsification
  test: same convexity profile, different settlement?); D2 the convexity
  surface + inheritance + RICHNESS crux; D3 trades/metric/geodesics/
  degeneracy (build the metric — Fisher-Rao or Wasserstein candidates —
  the GENUINE version of C6's vacuous T3); D4 settlement FIRST-CLASS
  (closed-form? does C1 strike-substitution generalize to a CONVEXITY-
  substitution? ITM-saturation: generalized kappa-dependent cap anchored
  at ATM, or unbounded?). Fallback ladder: 1 full convexity market /
  2 restricted (characterize carve-able vs not) / 3 valuation-only.
  Built on C6's T1 as substrate; EXPLICITLY warned not to trust C6's
  vacuous T3/T4. Honest-framing incl. an explicit anti-vacuous-theorem
  instruction.

### C8 ARISTOTLE RESULT — received, assessed (run 3763dda2)
- Status: 5 Lean files (ConvexityMarket/), 25+ theorems, zero sorry,
  standard axioms only. Better-behaved than C6 — but one definitional
  soft spot (below). Honest verdict: lands at FALLBACK RUNG 2.
- RUNG 2 — RESTRICTED CONVEXITY MARKET, honestly reached with the
  obstruction precisely characterized:
  - surface_covers_all_powers + exp_curvature_not_power: the convexity
    surface offers EXACTLY the power-function curvatures {p^alpha} and
    finite sums — provably NOT exponential / Gaussian / step shapes.
    exp_curvature_not_power is a genuine proof (log/exp contradiction).
    => the menu of convexity instruments is RESTRICTED, named to the
    function class. Clean, citable, honest.
- GENUINELY PROVEN (the wins):
  - falsification_two_points — the load-bearing theorem, properly
    proved: two curvature profiles agreeing at two distinct prices
    force kappa1=kappa2 (real log-injectivity). Strike-as-derived is
    EARNED, not assumed.
  - settlement saturation case-split honest: safe_regime_concave_
    curvature proves kappa<1 => concave gen. fn => bounded (case a);
    kappa>1 => unbounded (case b). Boundary kappa=1 COINCIDES with the
    CFMM-concavity boundary from C6 T1 — genuine structural fact: "safe
    to settle" regime == "valid AMM" regime.
  - no_trivial_conservation — INTELLECTUALLY HONEST: C8 DISPROVES a
    naive conservation law (integrated curvature is NOT kappa-invariant)
    rather than fabricating one. Exactly the honesty C6 T3 lacked.
- SOFT SPOT (needed for the paper — do not let slide):
  - curvatureField := (kappa-1)*p^(kappa-2) is DEFINED, not DERIVED. C8
    asserts the curvature field is this power function; never derives it
    from phi_kappa's actual 2nd derivative. The honest version
    (curvatureFieldGen = deriv(deriv f)) IS defined but the main results
    use the hardcoded curvatureField. So "the surface is (k-1)p^(k-2)"
    is an INPUT ASSUMPTION, not a theorem. Almost certainly the correct
    Box-Cox 2nd derivative — but not proven. Paper must NOT present the
    surface as derived; it is a clean modeling choice.
  - inheritance proved by simp-unfolding — true BY CONSTRUCTION (profile
    was DEFINED as the restricted surface). Fine as encoding, but it is
    not evidence FOR the inheritance thesis, just its encoding.
- IMPLICATION FOR THE GAUGE/RELATIVISTIC FRAMING: Rung 2 is evidence
  AGAINST the strong gauge version. The reachable convexity set is only
  the power-law slice — a thin rigid sub-family. In gauge language: the
  warp group's orbit is NOT the whole payoff space; it is a low-
  dimensional orbit (power-law curvatures). The exp curve sits in a
  DIFFERENT orbit the group cannot reach (= exp_curvature_not_power in
  group language). Sharpens Q65: IF the warp is a gauge symmetry, its
  orbit is the power-law family — NOT transitive on payoff space. This
  is now a concrete falsifiable prediction for the gauge brainstorm.
- PAPER — citable: "convexity instruments form a RESTRICTED market —
  carve-able shapes are exactly the power-law family {p^alpha} + finite
  combinations; the convexity profile faithfully determines the
  instrument (falsification test passes); settlement is closed-form and
  bounded exactly in the concave regime kappa<1, coinciding with CFMM
  validity." Do NOT cite: a full/universal convexity market (it is
  restricted); the surface as derived (it is posited); any conservation
  law (C8 explicitly found none).

### C10 — STATE-SPACE GEOMETRY: (1+1)-LORENTZIAN, FLAT OR CURVED
- DERIVED (not just pictured) from established results:
  - State space is 2D: one convexity coordinate (kappa, C8: a power-law
    exponent; falsification test proved it faithful), one skew
    coordinate (skewMeasure=2w-1, zero at the symmetric origin). Two,
    exactly — C8 T4 gave the independent decomposition.
  - The skew axis is HYPERBOLIC: w enters via the ratio (1-w)/w and
    C1's delta = (1/2)log(ratio). A (1/2)log-of-ratio coordinate is a
    RAPIDITY — it ADDS under composition (boosts compose), raw w does
    not. This is FORCED by the log-ratio structure, not chosen.
  - The convexity axis is ADDITIVE (power-law exponents add).
  - => state space = (1+1)-dimensional Lorentzian: convexity = space-
    like axis, skew-rapidity = time-like axis, unskewed symmetric state
    = the origin, a pure-skew trade = a BOOST, C1 composite-ray
    composition = boost composition.
  - The pricing invariant = the Lorentzian INTERVAL — invariant under
    skew-boosts => prices consistently ACROSS CONVEXITY TYPES (the
    "invariance allowing pricing across convexity types" Rohan wanted —
    it FALLS OUT, not added by hand).
- THE ONE OPEN SCALAR QUESTION (derivable, not taste): FLAT (1+1)
  Minkowski vs CURVED Lorentzian. Flat iff the available skew-rapidity
  RANGE is kappa-independent. Curved iff skew range depends on kappa
  (the cone-pinching picture => a kappa-dependent conformal factor; the
  cone IS the curvature / lightcone narrowing). This is C6's T4 range-
  coupling question in geometric form. Earlier C6 work HINTED skew range
  may depend on kappa => do NOT assume flat; determine it.
- PROMPT PRODUCED: lean_prompt_C10.md — T1 skew-axis-is-rapidity
  (additivity proof, must show rapidity ADDS & raw w does not), T2
  convexity-axis-additive, T3 (1+1)-Lorentzian construction + boosts-as-
  group, T4 pricing invariant / pricing-across-convexity, T5 flat-vs-
  curved determination (characterize the conformal factor if curved).
  Exploratory; honest-framing incl. derived-vs-posited flag and anti-
  vacuous-theorem instruction. Built on C6 + C8 substrate.
- RELATION TO THE GAUGE FRAMING: this is the metric the gauge brainstorm
  needed. If T5 = flat, the warp group acts by flat-Minkowski boosts;
  if curved, the gauge connection carries genuine curvature. Either way
  C10 supplies the geometry the Q65 gauge question was missing.

### C10 ARISTOTLE RESULT — received, assessed (run 9980522c)
- Status: 4 Lean files (StateSpaceGeometry/), 22 theorems, zero sorry,
  standard axioms. SPLIT verdict — T1/T2/T3 genuine; T5 is an artifact.
- GENUINE & CITABLE:
  - T1 (the gem): rapidity_additive proves skew-rapidity ADDS under
    composition (log-homomorphism); raw_w_not_additive proves by
    explicit counterexample that raw w does NOT. The pairing makes it
    non-vacuous. rapidity_achievable: every eta in R from some w. => the
    skew axis is GENUINELY hyperbolic. The load-bearing claim, earned.
  - T2: power-law exponents add (rpow identity) — convexity axis is a
    genuine translation axis.
  - T3: boost_comp / boost_inverse / boost_fixes_origin /
    boost_preserves_interval — boosts close into a one-parameter GROUP
    with invariant interval, honest hyperbolic trig. => ANSWERS Q64:
    the warp group CLOSES. Green light for the gauge framing.
  - T4: conditional, honestly labelled (IF pricing = f(interval)). Fine.
- NOT A RESULT — T5 "FLAT":
  - rapidityRange is DEFINED as  with the kappa arg discarded
    (_kappa). conformalFactor DEFINED as 1. state_space_flat is
    <fun _ => rfl, fun _ _ => rfl>. "FLAT" is mathematically
    Set.univ = Set.univ — the C6-T3 pattern again: conclusion proved by
    rfl because the definition was written to make it true. C10 did NOT
    determine flatness; it ASSUMED it.
  - The file ITSELF concedes (T5Summary prose): restricting to the
    concave safe regime kappa<1 (C8) "might introduce apparent
    curvature... outside the current model." That concession IS the
    real answer.
  - Honest state space is NOT R^2: convexity is bounded (C8 power-law
    family, safe regime kappa<1) and the "terminate at 1 unit of carved
    perp" cap is a BOUNDARY. A space flat in interior but bounded by the
    cap + safe-regime IS effectively curved where it matters — the
    boundaries ARE the cone-pinching. C10 got "flat" only by defining
    the domain as unbounded, discarding the cap and safe regime — i.e.
    discarding the physics.
- VERDICT: cite the (1+1)-Lorentzian STRUCTURE and the closed boost
  group (real). Do NOT cite "state space is flat" — undetermined; the
  bounded-domain question (cap + kappa<1) is OPEN and probably curved.
- COVERS the user's correction: the (1+1)-Lorentzian skew/boost geometry
  IS the existing AMM (convexity axis frozen at one kappa). "Convexity
  markets" = unfreezing that ONE axis. kappa bends the in-position
  TRAJECTORY, not the endpoint — all instruments still cap at 1 unit of
  carved perp. No extrapolation past the cap. The cap is a fixed
  boundary; kappa shapes the path inside it.
- Q66 RESOLVED — by DISSOLVING the dichotomy. Q66 (per-position vs
  pool-level kappa) rested on a false premise: that kappa-motion is a NEW
  kind of operation needing a new rule. It is not. Trades ALREADY move
  the pool through state — every ordinary swap already moves w (the
  boost / the closed group C10 T3 proved). The current AMM simply stays
  within ONE curve family: it moves freely along the w-axis but never
  steps off its birth kappa.
  => "Convexity markets" is NOT "add a new operation" — it is: the SAME
     trading motion that already moves the pool is allowed to also cross
     kappa. The pool was always moving through a state space; it was just
     CONFINED to a 1D slice (fixed kappa, free w) of a 2D space.
     Unfreezing kappa REMOVES a constraint; it does not add machinery.
  => A trade = a displacement of the pool's state point in the full
     (kappa, w) space. Today every trade is constrained to the kappa=const
     subspace (the constraint "kappa-dot = 0"). Convexity markets = lifting
     that constraint. The pool still has ONE invariant at any instant
     (it is at one (kappa,w) point); it just moves through kappa as well
     as w over time, exactly as it already moves through w.
  => The protocol question is therefore a single yes/no — "do we lift the
     kappa-dot = 0 constraint" — NOT a design space. No intensive/extensive
     fork, no coexistence problem.
  => Tightens the geometry: current AMM = trajectories confined to a
     constant-kappa LINE in the (1+1) space (pure boost motion);
     convexity markets = trajectories free in BOTH directions (the full
     (1+1) space). The Lorentzian picture becomes literal, not analogical.

### SETTLEMENT RESOLVED — Fork C (BTC closing spot)
- Rohan's two-layer mental model: "I buy a discount IOU to receive 1 BTC
  after 12 months, on dollar margin." Layer 1 = ZCB whose par is
  denominated in BTC (1 BTC payoff at maturity); Layer 2 = dollar margin
  finances the discount purchase; the whole thing is a CFD (no BTC
  delivery, settled in dollar-equivalent at close).
- Fork comparison (numerical example: 1-BTC IOU, BTC open $100k, BTC
  close $80k, $1k margin posted, suppose margin slice lost $200 along
  the way):
  - Fork A (closing equity) — pay slice's CLOSING equity = $800.
    Conflates BTC repricing with margin path P/L. WRONG.
  - Fork B (entry margin / entry $) — pay entry dollars = $20k discount
    or $1k margin (depending on read). Pins payout to entry — but then
    the IOU is not actually BTC-exposed, contradicting "denominated in
    BTC". WRONG.
  - Fork C (BTC closing spot * BTC notional) — pay 1 BTC * $80k = $80k.
    The IOU is for BTC; BTC has a dollar price at close; CFD settles in
    dollars at that price. CORRECT — this is what "discount IOU for 1
    BTC, on dollar margin" literally means.
- => SETTLEMENT RULE: leg pays (carved BTC notional) * (BTC closing spot
  in dollars), separately from the perp/margin path bookkeeping.
- Why this is internally consistent (the worry that initially pushed
  toward Fork A): the pool does NOT "eat the gap". The trader's payout
  is funded by the LPs on the opposite side of the curve — they sold the
  liquidity, the trader bought it, the AMM is conservative (trader's
  gain = LPs' loss). Margin is the trader's EXPOSURE (and liquidation
  threshold), not the payout. The two layers settle separately and net.
- Why this is internally consistent (the worry that initially pushed
  toward Fork B): "the slice lost money" is a PERP/MARGIN-layer fact, it
  does NOT affect the BOND-layer payoff. The bond pays its BTC par; the
  margin layer accounts P/L; the two combine at close. There is no
  conflict because they're separate accounting axes.
- Earlier "Joint vs Decomposed" framing was correct in spirit:
  decomposed model is right (the bond and the perp are separate
  instruments on the same deposit, netted at close). The error was
  thinking the band's UNIT was "live slice equity" — actually the band's
  unit is "1 unit of carved BTC" (BTC-denominated), priced in dollars at
  close via BTC's closing spot.
- Connects to the ZCB-recognition: barriers are price-space ZCBs with
  BTC-denominated par. "Par" in BTC, "dollar value of par" = BTC spot at
  close. This is the standard fixed-income convention (USD bond pays
  par in USD; BTC bond pays par in BTC; CFD settles dollar-equivalent).
- Implication for self-description: Temporal is a BTC-denominated
  price-space fixed-income CFD platform. Native instruments are
  BTC bonds traded as CFDs; options are replicable (Carr-Madan) but
  not the primitive. Sharper framing than "perpetual options on an AMM".

### C11 — AMERICAN-STYLE LAYER over the existing barrier AMM (prompt produced)
- GOAL: formalise a LAYER that lets the existing barrier engine price/
  trade/fund/settle American-style (perpetual) OTM exposure, generalising
  FROM the barrier setup, NOT changing the curve. Curve is well-behaved;
  leave tradeUpdate/rebase/hyperbola/mark intact.
- KEY FACT: perpetual-American value = power law (S/K)^Gamma; Balancer
  mark OTM is ALSO a power law => same family => a layer is possible.
- DESIGN CONSTRAINT (from the failed exp-on-slope quick fix): that fix
  was internally INCONSISTENT — (1) it changed VALUE but funding still
  used the un-transformed mark (value/funding desync); (2) exp-of-slope
  is off-hyperbola so tradeUpdate moved the pool by an off-curve number
  (value/curve desync, breaks conservation). LESSON: the American layer
  must be a COMBINATION OF GENUINE BARRIER MARKS (a strip/composite of
  real legs), NOT a transform of the slope. Combination-of-marks stays
  coherent across all touchpoints (funding linear over terms, each mark
  curve-consistent); transform-of-slope patches one and breaks the rest.
- SIX TOUCHPOINTS the layer must satisfy coherently (inventory): (1)
  value/AMM-tx scalar V; (2) funding (same mark-combination, Gamma in
  place of locked +/-2); (3) portfolio query (= V read-only); (4)
  position schema — band is 2-leg sold+bought; specify American as
  standalone vs wrapped, and its closeBand sequencing; (5) mode dispatch
  / moneyness (legPrice/isOTM/isBarrier gain american mode); (6) rebase-
  frame consistency of stored params.
- PROMPT: lean_prompt_C11_american_layer.md. D1 = core map (American
  spec Gamma,K -> barrier legs+weights reproducing (S/K)^Gamma; exponent-
  match single-barrier special case proven first; reachable-Gamma
  boundary named; Mellin/power-basis, composite-ray as combinator). D2 =
  six-touchpoint coherence (esp. value<->curve genuinely using
  hyperbola-preservation — the property exp-fix broke; and value<->funding
  resolving funding-vs-theta). D3 = architectural claim: only legPrice
  dispatcher + funding exponent arg touched; curve untouched. Carries the
  shipped engine signatures verbatim + honest-framing (negative D1 result
  acceptable, do NOT reintroduce off-curve transform; do not fix the cap).
- Attach C1_CompositeRayITM_for_ext.lean as substrate (proven composite-
  ray ITM identities).
- Connects to convexity-markets: if kappa/exponent is tunable per
  position, exponent-match (single-barrier American replication) becomes
  available for ANY Gamma in range — kappa as the knob matching the
  American Gamma.

### C11 ARISTOTLE RESULT — received, assessed (run b926ebe7)
- Status: 3 Lean files (AmericanLayer/), 21 theorems, zero sorry,
  standard axioms only. Strong work. Mixed (Gamma-dependent) result.
- THE BIG CORRECTION (proved): finite_strip_obstruction_call proves a
  FINITE combination of barrier marks CANNOT replicate (s/K)^Gamma for
  Gamma != 1 — finite sums live in span{s,1/s}, exponents +/-1 only.
  => EVERY ladder/strip/knock-in-composition idea we floated was
  provably impossible for Gamma not in {+1,-1}. We had been circling a
  hard wall without naming it. The Lean names + proves it.
- WHAT ACTUALLY WORKS: a CONTINUOUS superposition (integral, not sum) —
  the Breeden-Litzenberger decomposition. (s/K)^Gamma = integral of
  barrier marks weighted by density w(theta)=Gamma(1-Gamma)theta^(Gamma-1)/K^Gamma.
  Each infinitesimal slice is a genuine barrier mark (satisfies the
  no-off-curve-transform constraint), and the integral evaluates in
  CLOSED FORM to exactly (s/K)^Gamma. So American-OTM = a single closed-
  form scalar V fed to the existing tradeUpdate. Plug-and-play, curve
  untouched. The integral is the DERIVATION; the result is closed-form.
- GENUINELY PROVED: exponent_match_call (Gamma=1) / exponent_match_put
  (Gamma=-1) exact single-leg; the finite-strip obstruction; the BL
  integral identity (both component integrals via integral_rpow, real
  calculus); bl_exact_replication (0<Gamma<1 exact in limit, both error
  terms proved to vanish via real Tendsto args); coherence —
  tradeUpdate_preserves_hyperbola for ANY dy incl. the BL value (THE
  property the exp-fix broke — proved intact), funding synchronized,
  untouched-primitives by rfl.
- HONEST BOUNDARIES (Gamma-dependent — this is the real story, a MIXED
  result not a clean win):
  - Gamma in {+1,-1}: EXACT, single leg.
  - 0<Gamma<1: EXACT IN LIMIT — needs the full [0,inf) strike continuum;
    truncated [eps,M] carries a truncation error that vanishes only as
    eps->0, M->inf.
  - Gamma>1 or Gamma<0 (other than -1): TRUNCATED APPROX ONLY — one
    error term DIVERGES as the interval grows; no exact replication.
  - finite strips, Gamma not in {+1,-1}: IMPOSSIBLE (proved).
- THE DECISION-CRITICAL CAVEAT: the perpetual American PUT's natural
  exponent is typically Gamma<0 => lands in the 'truncated approx,
  error does not vanish' row. Whether C11 is a COMPLETE answer or a
  PARTIAL one depends entirely on the TARGET American's Gamma:
  - Gamma in (0,1) or exactly +/-1 => exact closed-form, plug-and-play,
    proved.
  - Gamma>1 or Gamma<0 => approximation with irreducible truncation
    error.
  OPEN QUESTION FOR ROHAN: what Gamma is the target American — known, or
  a design choice that can be SET into (0,1) or at +/-1 for exactness?
- ARCHITECTURE CONFIRMED: American support = a legPrice mode computing
  the BL closed form + funding with Gamma; tradeUpdate/rebase/mark/
  hyperbola untouched (proved by rfl). Layer, not rip-and-replace —
  as intended. No curve change. The kurtosis/CES/log-exp route is NOT
  needed for this (confirmed: Rohan does not want kurtosis; BL on the
  fixed Balancer curve is the mechanism).

### C12 — AMERICAN INTEGRATION (layer upon C11; prompt produced)
- Reading C11 Defs.lean revealed the layer is NOT yet wired into the
  engine — it sits ALONGSIDE it. Three integration seams C12 closes:
  - GAP1: legPrice.american case is  with Gamma
    DISCARDED (underscore) — dispatcher only does the Gamma=+/-1 single-
    barrier case; the general-Gamma BL value (americanValueBL) is NOT
    called from legPrice (C11 prose: 'caller should feed tradeUpdate
    directly', bypassing the dispatcher). C12 D1: wire legPrice.american
    -> N*americanValueBL K Gamma sn, prove it reduces to the single
    barrier at Gamma=+/-1.
  - GAP2: settlement through closeBand is ASSERTED in prose ('scalar, so
    unchanged'), NOT a theorem. C12 D2: formalise closeBand's two-
    tradeUpdate + raw_net + L0 + club-floor, PROVE conservation for an
    American leg by composing tradeUpdate_preserves_hyperbola twice
    (tracking both denominators). This is the one un-mechanised loop link
    (matches the loop-audit finding).
  - GAP3: two funding fns side by side (fundingPerStrike locked gamma+/-2
    vs fundingPerStrikeGen arbitrary Gamma); American position schema
    (standalone leg vs sold/bought band member) unstated. C12 D3a: prove
    fundingPerStrikeGen at Gamma=gamma(wing) equals fundingPerStrike
    (superset). D3b: state + formalise the American schema.
- C12 D4: end-to-end closed-loop theorem — American leg open(wired
  legPrice->tradeUpdate) / query(mtm) / fund(Gen) / rebase / close
  (closeBand), all one scalar V=N*americanValueBL, curve primitives
  rfl-untouched. 'American leg is a first-class citizen of the loop.'
- PROMPT: lean_prompt_C12_american_integration.md. Built ON C11 (attach
  AmericanLayer_Defs/CoreMap/Coherence + C1CompositeRayITM as substrate).
  Honest-framing: D1 reduction must use rpow_one (not rfl-hidden); D2
  must genuinely COMPOSE the two hyperbola steps; confirm curve still
  rfl-untouched after legPrice rewiring; BOTH wings (call Gamma=+1, put
  Gamma=-1); Gamma-range boundary from C11 stands (exact (0,1)U{+/-1},
  truncated outside, blError carried honestly).
- This is the LOOP-CLOSING run: C11 proved the pieces, C12 proves they
  compose into the live engine loop without touching the curve.

### C12 ARISTOTLE RESULT — received, assessed (run de882c25 + merged runs)
- C12 PROPER (AmericanLayer/Integration.lean, 31 thms, 0 sorry, 0 domain
  axioms): CLEAN PASS, audited line-by-line.
  - D1: legPriceV2 wired — american case -> N*americanValueBL K Gamma sn
    (Gamma no longer discarded). Reduction to single barrier at Gamma=1
    (call, via rpow_one) and Gamma=-1 (put, via rpow_neg/inv_div) — both
    genuine, not rfl-hidden. Barrier/spread cases unchanged.
  - D2: closeBand_preserves_hyperbola GENUINELY composes two
    tradeUpdate_preserves_hyperbola calls with independent denominator
    guards. THIS CLOSES the prose-only gap C11 left. Settlement (rawNet,
    traderPayout, clubFloor) proved scalar-only (mode-independent).
  - D3a: fundingGen_specialises — fundingPerStrikeGen at Gamma=gamma(wing)
    = fundingPerStrike (superset proved, both wings).
  - D3b: both schemas — standalone (americanOpen/Close) and paired
    (americanBandClose).
  - D4: american_closed_loop chains open->query->fund->rebase->close,
    each discharged by a named C11 lemma, composed honestly. (Clause
    (ii) mtm is tautological — file labels it honestly as 'states the
    API'.) Curve primitives re-confirmed rfl-untouched after rewiring.
  => American is now a FIRST-CLASS leg mode in the loop. The geometric
     gist (confirmed w/ Rohan): rays were always hyperbolic; the layer
     generalizes the DECAY RATE / exponent from native +/-1 to arbitrary
     Gamma, via the BL integral of native-rate rays. Reachable exact for
     Gamma in (0,1)U{+/-1}; truncated (blError) outside.
- BONUS — MERGED SETTLEMENT FORMALIZATION (Run2/3/3.1/3.2, Defs,
  Invariants — NOT prompted by C12; clearly the settlement-spinoff
  thread formalized in Lean, merged into the same project). Read at
  signature/report level, NOT line-by-line audited. What it claims:
  - DIMENSIONAL TYPE SYSTEM: legAmount_B has dim [B] (asset/BTC units);
    oracle is [U/B]; legSwapDy_dim = legAmount_B * oracle : [U] (cash).
    legSwapDy_dim_oracle_required: Dim.B != Dim.U by decide => you CANNOT
    drop the oracle without a type error. ==> THIS IS FORK C, MECHANICALLY
    ENFORCED: the leg is a fraction of one BTC unit, converted to dollars
    via the oracle (BTC price), NOT via raw equity. The type system
    forbids skipping the oracle. Independent confirmation of the Fork C
    resolution we reached by hand via the IOU analogy.
  - closeBandPhysical_oneITM: one-ITM case — ITM leg settled-to-cash, NO
    pool swap (oneITM_settled_leg_no_swap proved); OTM leg reversed. ==>
    THIS IS the cross-wing settlement protocol we brainstormed (at most
    one leg ITM; ITM settles to cash, no AMM closure; OTM reverses),
    formalized + proved.
  - I8/I9 conservation: rawNet=0 round-trip; traderPayout+clubDelta =
    (2L0-1)*rawNet*equity — leverage/club-floor math proved conservative.
  - Bug-1, SA16/SA17, wing-lock gates, ReachableB2 — settlement-session
    invariant IDs; consistent with the C12 layer; all compile, 0 sorry.
- CONVERGENCE: the American-layer thread (ours) and the settlement thread
  (spinoff) are now in ONE Aristotle project, mutually consistent. Fork C
  and the cross-wing protocol — which we resolved informally this session
  — are independently FORMALIZED and type-enforced in the merged work.
- TODO if load-bearing: line-by-line audit the Run3.x settlement proofs
  (only signatures/reports reviewed so far; C12 proper was fully audited).

### LENS RESULT — received, assessed (run 585dabaf)
- The standalone log-moneyness x exponent lens. 7 files, zero sorry,
  standard axioms. READ-SIDE fully proved; WRITE-SIDE resolved as a
  clean, honest NEGATIVE.
- Lens: lensValue(Gamma,u) = exp(Gamma*log(sNorm/K)) = (sNorm/K)^Gamma;
  u = log(sNorm/K) = log-distance from reference K (knock=barrier,
  strike=American — same role).
- READ-SIDE (L1-L4) PROVED CLEAN:
  - L1: lens reproduces the barrier mark at Gamma=+1 (call) / -1 (put),
    both wings, genuine exp-log inverses.
  - L2: lens IS the value query; OTM domain u<=0 (call) / u>=0 (put).
  - L3: funding/value = kappa*Gamma*(sNorm-1)/sNorm*dt, independent of K
    — the structural sync (value & funding read the SAME Gamma through
    the SAME lens, cannot desync like the exp-fix did). PROVED.
  - L4: rebase-invariant (u, lens value, funding). Also caught MP is NOT
    rebase-invariant (scales 1/r) — proved as a positive correction.
- L3 SURFACED A REAL CODE DISCREPANCY: shipped funding uses gamma=+/-2,
  but the lens Gamma=+/-1 funding is HALF (L3_shipped_call_eq: shipped =
  2x lens-Gamma1 funding). The shipped funding multiplier (2) != the
  value exponent (1). The lens unifies them under one Gamma and makes the
  discrepancy visible. Worth noting for the engine.
- L5 — THE CRUX — resolved as a clean proved NEGATIVE:
  - L5a: tradeUpdate preserves the hyperbola for ANY dy (real algebra).
  - L5b: L5b_obstruction_call/put PROVE (sn/K)^Gamma = sn/K <=> Gamma=1
    (call); = K/sn <=> Gamma=-1 (put). => the general-Gamma trade is
    SCALAR-consistent (hyperbola preserved any Gamma) but STATE-consistent
    ONLY at Gamma=+/-1. For synthetic Gamma the charged value (sn/K)^Gamma
    is NOT the curve's native rate; the pool prices at its ONE native
    exponent and a synthetic Gamma overlays a different power on the same
    curve.
- UNIFICATION BOUNDARY (L6), precise & proved: same value query / same
  funding sync / same rebase invariance / same algebraic transaction —
  ALL Gamma; value-consistency — ONLY Gamma=+/-1 (the barrier is the
  unique self-consistent exponent). The obstruction is structural: pool
  has ONE native exponent (set by w); synthetic Gamma!=+/-1 overlays a
  different power.
- MEANING FOR PROTOCOL: a general-Gamma American can be priced/charged
  coherently (read-side airtight) and the transaction stays curve-VALID
  (L5a), but post-trade pool MP reflects the native exponent, not Gamma —
  a residual gap between charged value and pool state for Gamma!=+/-1.
  Named consequence, not necessarily fatal (funding/rebalancing absorbs
  such gaps in many AMMs), but it is the precise cost of synthetic-Gamma
  instruments. Barrier (Gamma=+/-1) is the unique curve-native instrument.

### SECOND BUNDLE in same archive — NOT YET ASSESSED (flagged)
- The archive also contains output-final/ with C12 American integration
  (31 thms, 0 sorry) PLUS Run 1/2/3/3.1/3.2 — a DIMENSIONAL-TYPE system
  (Qty Dim.U/Dim.B, oracle-required type errors), closeBandPhysical
  (fused close, LIFO reversal, one-ITM settled-to-cash), wing-lock
  preservation, conservation invariants I8/I9/I10, Bug-1 (leg value
  BTC-denominated). Looks like the settlement/dimensional-correctness
  layer (parallel session output) — addresses the Fork-C / carved-equity
  / one-ITM-leg settlement work. Awaiting Rohan decision whether to
  assess it.

### NATIVE LOOP — curve-native path-integral transaction (prompt produced)
- Follows from the lens L5b negative: the single SYNTHETIC-SCALAR swap
  (sNorm/K)^Gamma is curve-VALID but not curve-NATIVE for Gamma!=+/-1.
  Rohan's instinct: the general-Gamma position was BUILT as a BL
  superposition of genuine barriers, each curve-native — so there should
  be a curve-NATIVE transaction = execute the continuum of barrier
  micro-swaps directly (the whole PATH native), and a calculus for it
  plus the corresponding funding / query / settlement = the WHOLE LOOP in
  native form.
- KEY MATH SET UP IN PROMPT: (1) instantaneous tradeUpdate dy->0 gives
  dx = -alpha*beta/(y-beta)^2 dy = d(x-alpha) along the hyperbola => any
  continuum of native swaps MOVES ALONG THE HYPERBOLA and total x-cost is
  ENDPOINT-DETERMINED: Dx = alpha*beta/(y_f-beta) - alpha*beta/(y_i-beta)
  (closed form). (2) BL superposition of barrier values closes to
  (sNorm/K)^Gamma. (3) THE SUBTLETY: each barrier micro-swap sits at a
  DIFFERENT strike (different trade point) — so whether the native path
  lands at the SAME state as the synthetic scalar, and whether its cost
  closes, is THE open question (the heart of what L5b left open, now a
  path-integral).
- PROMPT: lean_prompt_native_loop_standalone.md (standalone, HTML spec
  verbatim, no attachments). N1 native tx as path/ODE; N2 THE CRUX — does
  the native path close? (cumulative dy =? BL integral =? N*(sNorm/K)^Gamma;
  end state =? synthetic-scalar end state; total x-cost closed-form?) with
  three resolution targets: (a) native=synthetic & cost closes => American
  FULLY curve-native w/ closed form (refines L5b); (b) native!=synthetic
  but cost closes => two tractable txs; (c) native but cost doesn't close
  => named obstruction (native but intractable). N3 native funding (path-
  integral of native funding rates; =? synthetic lens funding). N4 native
  portfolio query/mtm. N5 native settlement + round-trip conservation. N6
  whole-loop native statement vs synthetic-scalar loop. Both wings.
  Honest-framing: clean negative (case c) acceptable; do NOT force closure
  by reinserting the synthetic scalar.
- This is the curve-NATIVE counterpart to the (synthetic) lens loop:
  lens loop = clean but not native; native loop = native, closure TBD.

### NATIVE LOOP RESULT — received, assessed (run b6014779)
- 3 files, zero sorry, standard axioms. Answers the curve-native
  path-integral question AFFIRMATIVELY + tractably, with TWO honest
  caveats. Summary overclaims slightly (the clean 'Case a everything
  agrees' headline); accurate verdict below.
- GENUINELY PROVED + load-bearing — PATH-INDEPENDENCE of Dx:
  tradeDx_eq_exactDeltaX + exactDeltaX_additive (real field_simp/ring)
  prove that moving along the hyperbola, Dx depends ONLY on endpoints
  y_i,y_f, not the path. => ANY decomposition of a total dy into micro-
  swaps (incl. the BL continuum) lands at the SAME end state + SAME cost
  as a single swap of that total dy. This is the true structural fact
  and the heart of the answer. The native path is the curve-native
  JUSTIFICATION for why charging the synthetic scalar works: every micro-
  step is a genuine curve trade, they telescope to the synthetic
  endpoint. Refines L5b: the single scalar isn't itself native, but it's
  the endpoint of a native path.
- THE BIG CAVEAT — BL CLOSURE IS ASSUMED, NOT PROVED HERE:
  nativeDy := N*lensValue and syntheticDy := N*lensValue are DEFINED
  identical; native_dy_eq_synthetic is rfl. The actual content (integral
  of barrier micro-swaps = (sNorm/K)^Gamma) is posited as a 'modelling
  fact', not derived. (The file's axiom-inventory comment admits this;
  the summary undersells it.) NOTE: the C11 run DID prove BL closure for
  0<Gamma<1 via integral_rpow — so the assumption is BACKED elsewhere,
  but do NOT cite THIS run for it. Given the assumption, most of
  N2/N4/N6 follow trivially (simp/rfl).
- THE ONE REAL DISCOVERY — FUNDING DIVERGENCE (proved, non-vacuous):
  N3_funding_ratio: native funding = (gamma_barrier/Gamma) * synthetic
  funding; N3_funding_eq_iff: equal IFF gamma_barrier=Gamma. So native &
  synthetic loops agree EVERYWHERE EXCEPT funding, which differs by the
  constant factor gamma_barrier/Gamma. Agree at barrier exponents
  (Gamma=+/-1); diverge for synthetic Gamma. This pins exactly where the
  two pictures come apart: not trade, not settlement, not MTM — only the
  funding coefficient. Genuine field_simp result.
- HONEST LOOP VERDICT:
  - Transaction (N2): YES native, closes to synthetic endpoint
    (path-independence), closed-form cost Dx = alpha*beta/(y+N(sNorm/K)^
    Gamma-beta) - alpha*beta/(y-beta). Modulo BL-closure (backed by C11).
  - MTM (N4): YES native=synthetic. Settlement (N5): YES round-trip
    conservative (round_trip_zero, real ring), hyperbola preserved.
  - Funding (N3): native & tractable but carries gamma_barrier not Gamma
    => differs by gamma_barrier/Gamma. THE lone divergence.
- NET: the curve-native transaction EXISTS, the loop closes natively,
  path-independence is why. Two caveats: BL-closure assumed-here (proved
  in C11), and funding diverges by gamma_barrier/Gamma. The accurate
  headline is 'Case a for trade/MTM/settlement; funding off by
  gamma_barrier/Gamma; BL-closure assumed not re-proved here.'
- ENGINE NOTE: this funding divergence connects to the lens L3 finding
  (shipped funding gamma=2 vs value exponent=1). Both say the funding
  coefficient and the value exponent are DIFFERENT numbers; the native-
  loop result says reconciling them (gamma_barrier=Gamma) is exactly the
  condition for native=synthetic funding.

### NOTIONAL-DISTRIBUTION LENS — the unifier (prompt produced; capstone of the lens line)
- Rohan's formulation: the unifier is the STRIKE-NOTIONAL DISTRIBUTION
  n(theta) = how much barrier notional sits at each strike. That single
  object IS the instrument. Barrier = point mass N*delta_K; spread = two
  masses; American(Gamma) = n smeared with the BL power-law profile
  n_BL(theta) ~ theta^(Gamma-1). Gamma is NOT an input — it is a SHAPE
  DESCRIPTOR of n, read off as a consequence.
- THE CLAIM (the lens): every pool interaction is the SAME functional of
  n: Interaction(n,state) = INT n(theta) * barrierNative(theta,state)
  dtheta, where barrierNative is the barrier's own mark (value/MTM/tx) or
  its own funding (funding). NOTHING enters but n; no exponent fed in
  anywhere. 'There's no other parameter' becomes a theorem.
- This SUPERSEDES the (u,Gamma) lens framing: not (sNorm/K)^Gamma (the
  closed-form shadow) but INT n*barrier_native — and the closed forms are
  what that integral evaluates to.
- WHY IT CLOSES THE FUNDING SEAM (from the native-loop run b6014779): that
  run got funding = (gamma_barrier/Gamma)*synthetic because it pulled
  gamma_barrier OUT of the integral as a constant. Under the notional
  lens, funding = INT n(theta)*barrierFunding(theta) dtheta with the
  per-barrier funding INSIDE and the SAME moving-knock-boundary split as
  the value (ITM theta<sNorm capped/flat -> no drift; OTM theta>sNorm
  sloped). Then funding carries the EMERGENT Gamma for the SAME reason
  value does — the boundary sweep — not by feeding Gamma in. Seam closes
  by construction.
- SEPARATE issue to keep distinct: the factor-of-2 (shipped gamma=+/-2 vs
  unit elasticity 1; lens L3 caught shipped=2x lens-Gamma1). Likely the
  same 2 as in 2*sinh/2*cosh (hyperbolic doubling), a scaling convention
  NOT the exponent. U4 isolates it.
- PROMPT: lean_prompt_notional_lens_standalone.md (standalone, HTML spec
  verbatim, no attachments). U1 functional + delta/barrier recovery; U2
  BL power-law n recovers (sNorm/K)^Gamma via boundary split (Gamma as
  shape of n); U3 transaction = the functional, path-independent closed-
  form cost, native-path = the n-integral; U4 THE CRUX funding = same
  functional with boundary-aware reconciliation of Gamma (do NOT factor
  Gamma out; emergence from the integral) or named residual; U5 MTM +
  settlement + round-trip conservation; U6 'one object, no other
  parameter' — Gamma definable as a shape/log-slope of n, recovered not
  supplied. Both wings. Honest-framing: state integration model; if BL
  closure assumed, assume openly (do NOT rfl-define-equal like b6014779
  did); U4 is where a vacuous proof would hide.
- This is the capstone of the lens line: makes the WHOLE LOOP one object
  (n) and one functional, funding included.

### DECISIONS (for the record) — OTM loop closure + sequential vertical spreads
- OTM LOOP CLOSURE: the notional-lens run, if it lands, completes the OTM
  side — one object n(theta), one functional, all touchpoints, no free
  parameter. Docks onto ITM, which is straightforward BECAUSE of the cap:
  ITM the mark saturates at 1 = standard American intrinsic, nothing
  exotic. Picture: OTM = the notional-lens integral (the unified part);
  ITM = standard saturated intrinsic (easy part); they meet at the cap
  (u=0, the moving boundary). Whole loop consistent end to end, and
  consistent with usual American-style ITM.
- DROP THE COMPOSITE-RAY SHORTCUT FOR VERTICAL SPREADS — execute the two
  legs as SEQUENTIAL transactions instead of the fused single
  theta*=sqrt(theta_i theta_o), 2 sinh(delta) expression.
  - WHY SAFE: path-independence (native-loop run, exactDeltaX_additive) —
    Dx depends only on endpoints, so two sequential tradeUpdates land at
    EXACTLY the same pool state + same total cost as the fused composite-
    ray shortcut. Sequential == fused, provably. The shortcut was a
    COMPUTATIONAL convenience, not a semantic requirement.
  - WHY IT IMPROVES CONSISTENCY: under the notional lens everything is
    INT n*barrier_native — a sum of per-barrier native ops. A spread as
    two sequential barrier txs is literally that integral with n = two
    point masses, term by term. The composite ray was a closed-form
    collapse of that two-point integral; sequential keeps the spread in
    the same 'sum of native barrier ops' form as everything else
    (n = delta+delta handled like every other n). More uniform, not less.
  - THE ONE CAVEAT (atomicity): sequential == fused ONLY if the two legs
    are ATOMIC — no rebase/oracle reprice between them. Path-independence
    is about moving along ONE hyperbola; a rebase between leg1 and leg2
    puts leg2 on a SHIFTED hyperbola and breaks the equivalence. In a
    single atomic block this is a non-issue. RULE: do not let the two
    legs of a spread straddle a rebase.

### EFFECTIVE-STRIKE COLLAPSE — single curve-respecting shortcut for the American (prompt produced)
- Rohan's question: can the whole BL integral for a single American
  collapse to ONE curve-respecting shortcut tx, like the composite ray
  collapsed a 2-leg spread? Same for the OTM query.
- THE ANSWER (derived, clean): YES — an EFFECTIVE-STRIKE collapse.
  Solve mark(call,theta_eff,sNorm)=(sNorm/K)^Gamma =>
  theta_eff = sNorm^(1-Gamma)*K^Gamma = the Gamma-WEIGHTED GEOMETRIC MEAN
  of spot and reference K. log theta_eff = (1-Gamma)log sNorm + Gamma log K.
  Generalises the composite ray: spread = EQUAL-weight geom mean of TWO
  FIXED strikes (theta*=sqrt(theta_i theta_o)); American = Gamma-weighted
  geom mean of SPOT and reference. Gamma=1 => theta_eff=K; Gamma=0 =>
  theta_eff=sNorm (ATM).
- REFINES L5b: L5b ('not curve-native, (sNorm/K)^Gamma != sNorm/K') was
  measuring at the WRONG strike (K). The American IS curve-native — as a
  barrier at theta_eff, not K. Curve's native rate at theta_eff =
  (sNorm/K)^Gamma exactly. The single tx is a genuine barrier swap at
  theta_eff; path-independence => equals the whole native path. The
  obstruction dissolves under the right effective strike.
- THE TWIST: composite ray theta* is FIXED; American theta_eff is STATE-
  DEPENDENT (moves with spot), d(log theta_eff)/d(log sNorm) = 1-Gamma.
  So at any INSTANT the American is a single curve-native barrier at
  theta_eff; OVER TIME it is a barrier whose strike continuously re-pegs.
  That re-pegging drift is plausibly WHERE FUNDING LIVES.
- FUNDING (the crux, E5): barrier funding AT theta_eff carries
  gamma_barrier not Gamma. Conjecture: the missing (Gamma - gamma_barrier)
  piece is exactly the DRIFT of the moving theta_eff (rate 1-Gamma).
  Prompt asks: does funding-at-theta_eff + effective-strike-drift
  reconstruct the Gamma-funding? Reconcile or name residual. (Connects to
  notional-lens U4 and native-loop funding seam — same crux from a new
  angle.)
- PROMPT: lean_prompt_effective_strike_standalone.md (standalone, HTML
  spec verbatim, no attachments). E1 effective-strike value identity; E2
  curve-native refinement of L5b; E3 state-dependence/motion of theta_eff;
  E4 OTM query collapses identically; E5 funding reconciliation via
  theta_eff drift or named residual (THE crux); E6 shortcut capstone vs
  composite ray. Both wings. Honest-framing: E5 is where vacuous proof
  hides; BL closure may be stated lemma but E1-E4 don't need it re-derived.
- Beautiful result: the American is a single barrier at a MOVING effective
  strike = Gamma-weighted geometric mean of spot and reference. The shortcut
  exists; the moving-ness is the only difference from the composite ray;
  and the funding question = whether the strike-motion drift closes the
  gamma_barrier-vs-Gamma gap.
- ADDENDUM INSERTED into the prompt: scoped explicitly to SINGLE American,
  NO clubbing. L0/club-floor/cross-position netting OUT of scope and must
  not enter proofs; settlement = bare single-leg reverse swap. Rationale:
  effective strike is PER-POSITION; clubbed/multiple = a SUM of effective-
  strike barriers = the notional-lens n-integral (separate task). The
  whole loop for one American: tx/query/settlement translate cleanly +
  UNCONDITIONALLY; funding = theta_eff barrier funding + strike-motion
  drift (the one conditional leg, E5). Single-American case should be the
  notional-lens special case with n = one BL profile (stated, not proved
  here).

### EFFECTIVE-STRIKE RESULT — received, assessed (run 3aba3eaa)
- EffectiveStrike.lean, 488 lines, zero sorry, standard axioms only. CLEAN
  + HONEST run. Confirms the shortcut for tx/query/settlement; resolves
  funding as a proved NEGATIVE; corrects one conjecture.
- PROVED REAL (the shortcut):
  - E1: rpow_core_identity sn/(sn^(1-Gamma)K^Gamma)=(sn/K)^Gamma — genuine
    rpow/log algebra (not rfl). Both wings, OTM conditions ACTUALLY
    verified (theta_eff_otm_call/put prove sn<theta_eff). => American OTM
    value IS a single barrier mark at theta_eff = sn^(1-Gamma)*K^Gamma =
    Gamma-weighted geometric mean of spot & strike. The composite-ray
    generalisation, now a theorem.
  - E2: L5b refinement real. prior_obstruction re-proves (sn/K)^Gamma=sn/K
    <=> Gamma=1 (genuine log); E2_native_rate shows curve native rate AT
    theta_eff = (sn/K)^Gamma. Obstruction dissolves — American is curve-
    native at theta_eff (not K).
  - E4 query collapse, E6 capstone, boundary recoveries (theta_eff=K at
    Gamma=1, =sn at Gamma=0) all clean. Both wings.
- CORRECTION TO OUR CONJECTURE: I'd said theta_eff fixed iff Gamma in {0,1}.
  Run PROVED fixed iff Gamma=1 ONLY (E3_fixed_iff). At Gamma=0 theta_eff=sn
  which DEPENDS on sn (tracks spot), not fixed. So theta_eff moves for all
  Gamma!=1. Scaling law E3_scaling: theta_eff(t*sn)=t^(1-Gamma)*theta_eff(sn)
  => rate 1-Gamma. Good catch; our {0,1} was loose.
- FUNDING CRUX (E5) — RESOLVED AS CLEAN PROVED NEGATIVE:
  - Funding at theta_eff carries gamma_barrier NOT Gamma; residual =
    gamma_barrier/Gamma (E5_funding_ratio via grind; E5_residual: =1 iff
    gamma_barrier=Gamma).
  - THE DRIFT CONJECTURE FAILS (proved): E5_drift_no_close — adding drift
    rate (1-Gamma) to gamma_barrier gives gamma_barrier+1-Gamma = Gamma
    only if gamma_barrier=2Gamma-1 (not a fixed constant). So the moving-
    strike drift does NOT close the gap. The natural reconciliation is
    KILLED.
  - Residual classified: it is the BARRIER-ELASTICITY MISMATCH, NOT the
    2sinh/2cosh doubling. (Distinct from the gamma=2 scaling.)
- NET: one American = one barrier at the Gamma-weighted geometric-mean
  strike theta_eff for VALUE/TX/QUERY/SETTLEMENT — airtight, proved, both
  wings. FUNDING does NOT collapse the same way — carries gamma_barrier/
  Gamma, and the moving-strike drift does NOT fix it (proved negative).
  Funding coherence for synthetic-Gamma is NOT a free consequence of the
  effective-strike picture.
- TWO FUNDING ANGLES NOW: effective-strike drift = CLOSED as negative
  (here); notional-lens U4 boundary-integral = still OPEN (and this run is
  evidence U4 won't be trivial either). The funding seam is real and
  precisely localised: barrier-elasticity (gamma_barrier) vs American-
  exponent (Gamma) mismatch, not closed by geometric drift. Options:
  accept gamma_barrier/Gamma as a real economic feature, OR find a
  genuinely different mechanism (notional boundary-integral pending).

### FUNDING = HYPERBOLIC-ANGLE SLOPE — the Gamma reconciliation (prompt produced)
- Rohan's reframe: funding is simple SLOPE MATCHING, but taken along the
  HYPERBOLIC ANGLE (rapidity u=log(sNorm/K)) instead of the same RAY
  (strike direction). Core identity: dV/du = d/du exp(Gamma u) = Gamma*V
  => the hyperbolic-angle slope carries the exponent Gamma exactly. The
  ray-based barrier funding carried gamma_barrier because it
  differentiated in the wrong coordinate (fixed barrier coefficient along
  the strike).
- DIFFERENT from the failed additive-drift fix (E5_drift_no_close killed
  'gamma_barrier + (1-Gamma)'). This is NOT additive correction — it is
  computing the slope in the right COORDINATE from the start. Ray slope =>
  gamma_barrier; rapidity slope => Gamma. Coincide iff gamma_barrier=Gamma
  (Gamma=+/-1, the barrier).
- PRINCIPLED (not curve-fit) BECAUSE of C10: the state space's natural
  coordinate IS the rapidity (skew axis is a rapidity that adds, boosts
  form a group — C10 proved this). So funding-as-u-slope = funding in the
  state space's own coordinate = the position's RESPONSE TO A BOOST
  (u->u+delta scales V by e^(Gamma delta); infinitesimal response Gamma*V;
  Gamma is the rapidity-eigenvalue). The coordinate was DERIVED as the
  state space's own, independently of funding => answers the 'you chose
  the coordinate' skeptic.
- TWO CAVEATS: (1) factor-of-2 still separate — at Gamma=1 the u-slope
  gives coeff 1, shipped uses 2; the 2 is the 2sinh/2cosh doubling, a
  scaling convention, NOT the exponent. Reframe fixes the EXPONENT
  (gamma_barrier->Gamma); the 2 handled separately. (2) it is a MODELLING
  COMMITMENT (funding SHOULD be the u-slope) — the math dV/du=Gamma*V is
  unconditional, but 'this is the right funding' rests on the rapidity
  being the state coordinate (C10).
- PROMPT: lean_prompt_funding_hyperbolic_slope_standalone.md (standalone,
  HTML spec verbatim, no attachments). F1 dV/du=Gamma*V (genuine deriv);
  F2 ray-slope (gamma_barrier) vs rapidity-slope (Gamma), coincide iff
  equal; F3 funding-as-u-slope reproduces the Gamma-funding (residual
  closed by coordinate, not additive drift); F4 barrier recovery + isolate
  the factor of 2; F5 boost-response justification (principled via C10);
  F6 reconciliation capstone. Both wings. Honest-framing: F3 not
  definitional circularity; modelling-commitment flagged; 2 kept separate.
- This is the natural FINISHER for the funding seam both the native-loop
  (b6014779) and effective-strike (3aba3eaa) runs left open — closes it by
  USING the C10 Lorentzian geometry rather than bolting on a correction.

### FUNDING = HYPERBOLIC-ANGLE SLOPE — the reconciliation (prompt produced)
- Rohan's reframe of funding: funding is SLOPE-MATCHING, but the slope is
  taken along the HYPERBOLIC ANGLE (rapidity u=log(sNorm/K)), not the
  strike ray. This is the candidate fix for the funding seam that the
  effective-strike run left open (and that the additive-drift idea
  FAILED to close, E5_drift_no_close).
- CORE IDENTITY: V=exp(Gamma*u), dV/du = Gamma*exp(Gamma*u) = Gamma*V. The
  hyperbolic-angle slope pulls down exactly Gamma — the correct funding
  exponent. The ray slope gives gamma_barrier (constant). So funding-along-
  u carries Gamma; funding-along-ray carries gamma_barrier; differ by
  gamma_barrier/Gamma.
- WHY DIFFERENT FROM THE FAILED DRIFT FIX: the drift idea was ADDITIVE
  (gamma_barrier + (1-Gamma), failed). This is NOT additive — it computes
  the slope in the RIGHT COORDINATE from the start, giving Gamma directly.
  Coordinate change (ray->rapidity), not a correction term.
- WHY PRINCIPLED (not 'choose the coordinate that gives Gamma'): C10
  already DERIVED the state space is (1+1)-Lorentzian and the skew axis is
  a genuine rapidity (the half-log that ADDS, boosts close into a group).
  So the rapidity is the state space's OWN coordinate; funding = the
  position's response to a BOOST along it = the natural carry; and Gamma
  emerges as the BOOST-EIGENVALUE of the value (V(u+phi)=exp(Gamma*phi)V),
  NOT as an inserted constant. The coordinate wasn't chosen for funding —
  it was derived as the geometry, and funding inherits it.
- TWO CAVEATS: (1) factor-of-2 (unit elasticity +/-1 vs shipped +/-2 =
  the 2sinh/2cosh doubling) is SEPARATE — this fixes the EXPONENT not the
  2. (2) Legitimacy rests on the rapidity being the state coordinate (the
  C10 premise) — flagged as premise, not re-derived.
- PROMPT: lean_prompt_funding_hyperbolic_slope_standalone.md (standalone,
  no attachments). F1 hyperbolic angle + value; F2 dV/du=Gamma*V (genuine
  deriv); F3 ray-slope=gamma_barrier contrast + gamma_barrier/Gamma
  residual; F4 distinguish from failed additive drift; F5 boost-response —
  Gamma as boost-eigenvalue via the group law u->u+phi, V->exp(Gamma*phi)V
  (the principled-not-chosen part; must genuinely use the additive group
  structure); F6 reconciliation statement + named remaining 2-residual.
  Both wings. Honest-framing: F5 is where 'principled vs chosen' lives;
  the 2 kept separate; rapidity-as-coordinate flagged as premise.
- If it lands: closes the funding seam for the single-American loop by
  USING the C10 Lorentzian geometry — funding = boost-response, exponent
  Gamma reconciled, only the structural 2 remaining. Completes the whole
  one-American OTM loop incl. funding.

### FUNDING HYPERBOLIC-SLOPE RESULT — received, assessed (run 592504ae)
- HyperbolicAngleSlope.lean, zero sorry, standard axioms. HONEST run —
  the file itself cleanly separates DERIVED math from MODELLING COMMITMENT.
  Verdict: the reframe holds, formalised as far as it CAN be.
- GENUINELY PROVED (unconditional math):
  - F1: d(log V)/du = Gamma along the hyperbolic angle — REAL derivative
    (HasDerivAt.exp + chain rule, not rfl). The hyperbolic-angle slope
    carries Gamma. The central claim, established.
  - F2: ray-slope vs hyperbolic-slope ratio = gamma_barrier/Gamma, coincide
    iff gamma_barrier=Gamma (genuine). Same residual as effective-strike,
    now attributed to WHICH COORDINATE you differentiate in. 'Two readouts
    of one state' borne out: ray->gamma_barrier, rapidity->Gamma.
  - F4: shipped gamma=+/-2 differs from log-slope +/-1 by factor 2, SAME
    for both wings (sign-independent) => the 2 is a structural convention
    (2sinh/2cosh doubling), cleanly separated from the exponent fix.
  - F5 (the strong part, PROVED not asserted): F5_eigenvalue proves
    d/ddelta[V(u+delta)]=Gamma*V(u+delta) by real differentiation;
    F5_boost_scales V(u+delta)=exp(Gamma*delta)V(u); F5_boosts_compose the
    additive group law. So GAMMA GENUINELY EMERGES AS THE BOOST-EIGENVALUE
    — value is an eigenfunction of the boost generator, eigenvalue Gamma.
    Gamma is NOT inserted; it's what the rapidity group action yields.
    This is the principled anchor doing real work.
- THE CRUX TO READ CORRECTLY — F3:
  - F3_uslope_equals_engine is proved by congr 1 = near-DEFINITIONAL
    (fundingHyp defined with Gamma coeff, engineFunding has Gamma). F3
    alone is ~tautological.
  - BUT the content is in F3_reconciliation: it threads the ACTUAL
    derivative (F1b, deriv(log exp(Gamma u))=Gamma) into the funding
    formula to produce engine funding. The reconciliation is real BECAUSE
    F1 is real; F3 is just the wiring. Honest reading: F3 = definitional
    wiring; F1+F5 = the substance.
  - The file's docstring LABELS F3/F5's 'funding SHOULD BE the u-slope' as
    a MODELLING COMMITMENT, not a forced theorem. Correct + honest framing.
- NET: the reframe holds, closed as far as it can be.
  - UNCONDITIONAL: hyperbolic-angle slope = Gamma (F1); differs from ray by
    gamma_barrier/Gamma (F2); Gamma = boost-eigenvalue (F5); factor-2
    separate (F4). All genuinely proved.
  - MODELLING COMMITMENT (flagged, not proved — CANNOT be, it's a choice
    about what funding IS): funding SHOULD be the u-slope. Justified by F5's
    boost geometry (funding in the state space's own coordinate, whose
    group action has Gamma as eigenvalue), anchored in C10's derivation of
    the rapidity as THE state coordinate. Principled, not chosen-to-fit.
  - ONE-LINER: funding-via-hyperbolic-angle yields Gamma by real calculus;
    that this IS the right funding is a principled commitment justified by
    boost geometry, not a theorem. The seam is closed given that one
    (well-anchored) premise; the only remaining residual is the structural 2.
- THIS CLOSES THE FUNDING SEAM for the single-American loop, using the C10
  Lorentzian geometry (funding = boost-response). Completes the whole one-
  American OTM loop: value/tx/query/settlement via effective-strike ray;
  funding via hyperbolic-angle/boost-response; both readouts of one state.
  The geometry thread (C10) turned out to be exactly what the instrument
  thread needed to close its last seam.

### BRIEF FINALISED — axiom-hygiene standing obligation added (ships)
- Manager final pass: one genuine gap — the brief relied on 'no sorry,
  axioms inventoried' but had it buried as a sub-clause of Target 1(a),
  not a standing requirement. Matters because Targets 2 & 3 have the
  intern WRITE new proofs (put-native E3, BL closure); a new proof closing
  with sorry / smuggling an axiom / pulling in a non-base axiom is the
  formalization-layer version of the exact 'looks proved, rests on
  unverified assumption' failure the audit hunts — and the proof-writer
  shouldn't self-certify axiom-cleanliness silently.
- FIX: added a STANDING OBLIGATION clause (not a new target) — #print
  axioms on every theorem audited AND written; report axiom set per
  theorem; flag any sorry / new axiom / anything beyond the base
  (propext, Classical.choice, Quot.sound). Makes 'axioms inventoried' a
  checkable artifact (required column/appendix), and applies the brief's
  working principle to the intern's OWN new work, not just audited work.
  Cheap (one Lean cmd/theorem).
- Brief now SHIPS. Manager satisfied on all else.
- Through-line (manager + intern agree): the tagging discipline functioned
  as the DETECTOR across 3 adversarial rounds — put theta_eff, E3 wing-
  dependence, §0 mis-tag — each found because every claim carried a tag
  checkable against the actual Lean, each confirmable, one round turned on
  the brief's own author and held. System working as designed, not theatre.
- HANDOFF SEQUENCE (agreed): Lean audit returns -> manager writes Phase-1
  harness (anchor + collapse + round-trip + theta_eff-tracking + funding,
  Gamma=+/-1 per-wing anchors as keystone, put anchor guards the corrected
  E1_put_native strike) -> grunt does the minimal legPrice-dispatch diff
  against the harness. Curve untouched (HARNESS-verified, not Lean).

### BRIEF HARDENED (manager pass) + §0 TAG CORRECTED on the note itself
- Manager did a pass on the brief + corrected note; 3 additions, all
  correct, all instances of the same meta-pattern (one of them a catch on
  MY OWN document):
  1. WING-COVERAGE made a REQUIRED audit column (both / one+symmetry /
     agnostic). The 'proved-for-call-assumed-for-put' pattern is likely
     WING-SYSTEMIC; E1+E3 were found by lucky spot-checks. Run explicitly
     across E1, E2_native_rate, E2_mark_eq_rate, round_trip_zero,
     exactDeltaX_additive, E3, F-series. Catches the pattern by
     construction not luck. -> folded into brief Target 1.
  2. §0 '[PROVED] curve untouched / additive' is MIS-TAGGED — verified
     against Lean: the _untouched theorems (tradeUpdate_untouched etc.)
     prove by rfl that the MODEL's definition = a lambda — a tautology
     about the formalization, NOT about the shipped HTML. Lean can't see
     production code. 'Curve untouched' is a CODE/DIFF property only the
     regression harness establishes (the Gamma=+/-1 anchor test IS the
     guarantee). Category error — a tag dressing a code property as a
     theorem, exactly what the brief hunts, applied to the note's own
     architectural claim. -> re-tagged [PROVED]->[HARNESS] IN THE NOTE
     (line 34), and added brief Target 1b to confirm + formalize the
     re-tag.
  3. BL-closure Target 3: also deliver a POSITIVE characterization of the
     divergent |Gamma|>1 region — E1 value identity still holds
     ALGEBRAICALLY there (BL-independent); state whether it's value-
     correct/safe-to-price (usable-with-caveats as explicitly-approximate)
     vs unusable, since that's a real product decision. Don't write off
     |Gamma|>1. -> folded into brief Target 3.
- Manager satisfied otherwise: Phase 0 genuinely closed (put theta_eff
  Lean-confirmed, path-independence accepted w/ harness test obligation,
  factor-of-2 pinned, E3 a proof target). Phase-1 keystone = anchor test
  (Gamma=+/-1 per wing reproduces barrier to the cent, put anchor guards
  the corrected E1_put_native strike). Sequence: Lean audit -> Phase 1
  harness (manager writes anchor+collapse+round-trip+theta_eff-tracking+
  funding cases) -> grunt does minimal legPrice-dispatch diff against it.
- Folded all 3 into the brief directly (single authoritative artifact for
  the intern rather than brief+addendum).

### E3 WING-DEPENDENCE GAP confirmed + LEAN INTERN BRIEF drafted
- Manager pushed on two things; both confirmed by direct Lean inspection:
  (a) single-swap=continuum for moving theta_eff: CONCEDED the framing —
      path-independence proves the MATH is endpoint-determined, but says
      nothing about whether the IMPLEMENTATION reads theta_eff at the
      right sNorm at each call site (open-time vs stale-close, funding
      tick at wrong moment = wiring bugs the theorem can't catch; same
      shape as the rebase preview-parity bug). Not a derivation gap, but
      a REQUIRED harness case. Agreed.
  (b) E3 wing-dependence: CONFIRMED THE GAP. Checked EffectiveStrike.lean
      — E3_log/E3_scaling/E3_fixed_iff are ALL stated on theta_eff (call
      form sNorm^(1-Gamma)K^Gamma) ONLY. No theta_eff_put E3 lemma. The
      put rate 1+Gamma is SYMMETRY-INFERRED, not proved — same 'proved
      for call, assumed for put' pattern as the E1 bug. Note now carries
      an AUDIT FLAG on the E3 subtlety.
- Anchor test doubles as regression guard: Gamma=-1 put anchor exercises
  the corrected E1_put_native strike => auto-guards against reintroducing
  the uniform formula. Factor-of-2 self-defends once anchor exists. Both
  confirmed.
- LEAN INTERN BRIEF drafted: lean_intern_brief.md. Three targets: (1)
  full tag->theorem audit (hypotheses + conclusion match the cited claim;
  hunt the E1_put-vs-E1_put_native scope-over-read pattern; deliver a
  tag->theorem->hyps->conclusion->supports? table); (2) prove the put-
  native E3 lemmas (known gap above); (3) discharge BL-closure for the
  |Gamma|<=1 boundary (currently a stated calculus lemma; the line
  between exact and truncated-approx). Plus standing cross-check: keep E1
  (algebraic, BL-independent) separate from the continuum-justification
  (needs BL). Out of scope: impl wiring (harness), factor-of-2 (flagged),
  clubbing (notional treatment).

### INTEGRATION NOTE — PUT theta_eff CORRECTED (reviewer catch, verified)
- Reviewer (impl manager) caught: the note's uniform signed formula
  theta_eff = sNorm^(1-Gamma)*K^Gamma is CALL-only; WRONG for the put
  under the put mark. Verified against the Lean: CORRECT.
  - Put value=(sNorm/K)^Gamma, markPut=min(theta/sNorm,1); setting equal
    => theta_eff_put = sNorm^(1+Gamma)*K^(-Gamma). At Gamma=-1: K (barrier
    recovery OK). Uniform formula at Gamma=-1: sNorm^2/K (WRONG except ATM).
  - Lean has TWO put lemmas, the note conflated them: E1_put proves
    markCALL(uniform theta_eff)=(sNorm/K)^Gamma (value via CALL mark — a
    value identity, NOT a pricing instruction); E1_put_native proves
    markPUT(sNorm^(1+Gamma)K^(-Gamma))=(sNorm/K)^Gamma (the implementation-
    governing one, since engine wing=put selects the put mark). The note
    cited E1_put as if it justified the uniform formula under the put mark
    — it does not.
  - FIXED in american_layer_integration_note.md: §2 now wing-split
    (call sNorm^(1-Gamma)K^Gamma, put sNorm^(1+Gamma)K^(-Gamma), magnitude
    sNorm^(1-|Gamma|)K^|Gamma|) with a CRITICAL warning + new §2a Lean
    reconciliation; E3 motion-rate now wing-dependent (call 1-Gamma, put
    1+Gamma, each fixed at its native exponent); §7 step 2 + §8 summary
    corrected. Funding eigenvalue d(logV)/du=Gamma UNAFFECTED (wing-
    agnostic, from V=(sNorm/K)^Gamma).
- Reviewer's Phase-0 reconciliation asks (valid, for the record):
  (a) confirm exactDeltaX_additive / single-swap=continuum was proved for
      the STATE-DEPENDENT theta_eff (moves at 1∓Gamma), not just a fixed
      barrier — IT WAS: path-independence is about cumulative dy on the
      hyperbola, endpoint-determined, independent of how theta_eff moved
      to get there; the moving strike only changes the dy magnitude, which
      path-independence absorbs. Worth a confirming test.
  (b) pin the factor-of-2 funding convention so it can't double-apply —
      yes, §5 flags it; implementer must carry it once.
- LEAN-INTERN BRIEF: reviewer requests one, pointed at (1) put theta_eff
  reconciliation [now fixed in the note, but the tag->theorem audit is
  still worth doing across ALL claims], (2) discharge BL-closure (the
  |Gamma|<=1 boundary rests on it; currently a stated calculus lemma, not
  proved) — that boundary separates exact from truncated-approx, worth
  closing before marketing a Gamma-range. AGREE both are the right targets.

### INTEGRATION NOTE PRODUCED — American layer over the HTML engine
- File: american_layer_integration_note.md. Rigorous spec taking the
  ACTUAL shipped engine surface (mark, tradeUpdate, legPrice, closeBand,
  fundingPerStrike, rebase — verbatim) and layering American-style
  support as an ADDITIVE layer (one legPrice dispatch mode + one funding-
  exponent arg; curve untouched). Every claim tagged [PROVED] /
  [PROVED-GIVEN-GEOM] / [MODEL], grounded in the Lean runs.
- Structure: (0) engine surface + don't-touch-curve constraint; (1)
  instrument = (K,Gamma); (2) effective strike theta_eff=sNorm^(1-Gamma)
  K^Gamma for query/tx (PROVED collapse, path-independence, curve-native,
  moving at rate 1-Gamma); (3) settlement via closeBand unchanged (single
  position; clubbing out of scope -> notional case); (4) funding via the
  HYPERBOLIC ANGLE not the ray (the trap: ray gives gamma_barrier, drift
  patch fails [PROVED]; the fix: d(log V)/du=Gamma [PROVED], boost-
  eigenvalue [PROVED]); two-frames-one-state rule; (5) two honest
  residuals — the factor-of-2 (separate convention) and funding-is-a-
  MODELLING-CHOICE (free rate function, inherits legitimacy from barrier
  funding, not derived); (6) Gamma-range boundary (exact for |Gamma| in
  [0,1] band + native +/-1; ITM via existing cap); (7) minimal-diff
  implementation checklist; (8) one-paragraph summary.
- Captures the whole session's American arc as a single actionable
  integration spec. Honest throughout: value/tx/settlement = physics
  (forced by curve); funding = policy (form+exponent fixed by geometry,
  rate function free).

### UNIFIED OTM-LOOP PROMPT — the capstone (one functional, three operations)
- Rohan's unification: transaction, query, funding (all OTM) use the SAME
  measure-theoretic machinery and each simplify to singular closed forms.
  Crystallised: the OTM loop is ONE value functional V(sNorm) =
  INT n(theta)*mark(theta,sNorm) dtheta = (sNorm/K)^Gamma under THREE
  operations — EVALUATE (query/MTM -> V), PUSHFORWARD through the
  hyperbola (transaction -> Dx closed form), DIFFERENTIATE (funding ->
  Gamma*V) — each closing to a singular closed form, in TWO equivalent
  representations (effective-strike point-mass <-> BL measure) whose
  AGREEMENT is the central theorem.
- KEY CLEAN DETAIL: cap-continuity (mark=1 at theta=sNorm both sides) =>
  differentiating V across the moving cap boundary has NO boundary delta
  (the ITM upper-limit and OTM lower-limit contributions cancel, matching
  integrands). So funding-as-derivative = INT_OTM n(theta)/theta dtheta
  cleanly, elasticity = Gamma. No singular term.
- FUNDING RECONCILIATION (the measure-theoretic resolution from the prior
  turn, now formalised): elasticity measure dmu_F = n*(d mark/d log sNorm)
  (live/OTM barriers only, elasticity 1; capped/ITM = 0) integrates to
  Gamma*V; flat-coefficient measure gives gamma_barrier*V. They differ by
  gamma_barrier/Gamma. Funding = the ELASTICITY measure (Gamma); the
  gamma_barrier answer is the WRONG measure (charges capped zero-elasticity
  barriers), NOT a rival policy. (Corrects the earlier 'legitimate
  alternative' framing.) Does NOT contradict E5_drift_no_close (that killed
  the additive patch on the wrong-measure result; right measure needs no
  patch).
- PROMPT: lean_prompt_otm_loop_unified_standalone.md (standalone, engine
  spec verbatim, no attachments; Rohan throwing into same thread so prior
  lemmas available but prompt is self-contained). U1 evaluate (both reps);
  U2 value representation agreement (central thm pt1); U3 pushforward/tx
  closed-form cost; U4 THE CRUX differentiate = elasticity-measure deriv
  with (a) genuine deriv =Gamma, (b) cap-continuity no-boundary-term, (c)
  elasticity-vs-flat measure reconciliation, (d) factor-2 separate; U5
  funding representation agreement (central thm pt2); U6 one-functional-
  three-operations unification. Both wings. Honest-framing: BL closure
  stated-lemma-if-assumed (no rfl-define-equal); U4 where vacuous proof
  hides; funding exponent Gamma FORCED (elasticity of forced value), rate
  function the only freedom; axiom inventory required.
- Supersedes the piecemeal prompts (effective-strike value/tx, hyperbolic-
  slope funding, notional-lens general) by showing they are three faces of
  one functional. The definitive OTM American-layer statement.

### UNIFIED OTM-LOOP RESULT — received, assessed (run 15abff9a)
- 4 new files (OTMLoopDefs/Eval/Diff/Unify), zero sorry, #print axioms run
  on key theorems (axiom-hygiene obligation HONORED). HONEST about what it
  assumed (BL closure flagged STATED at OTMLoopUnify line 25, not hidden).
  But the summary's checkmarks overstate U4c. Mixed verdict:
- GENUINELY PROVED (real, load-bearing):
  - U1/U2/U3 effective-strike side: real rpow algebra (U1_call_eff/
    U1_put_eff with the put-NATIVE strike), value representation agreement,
    hyperbola preservation, closed-form Dx, path-independence, round-trip.
    The CLOSED-FORM loop is solid.
  - U4a elasticity=Gamma: genuine HasDerivAt calculus. Real.
  - U4b cap-continuity / no-boundary-term: GENUINELY established — markCall
    sn sn=1 both pieces, boundary delta sn/sn-1=0, ITM elasticity=0
    (deriv_const), OTM elasticity=+1 (call)/-1 (put) via real deriv of
    sn/theta and theta/sn. The 'no boundary pathology' claim is REAL. This
    was the part I most wanted checked; it holds.
  - U4d factor-of-2: trivial but correct.
  - U4c_flat_is_wrong + U4c_ratio: genuine field_simp on the CLOSED-FORM
    funding expressions (kappa*gb*V vs kappa*Gamma*V) — proves the two
    COEFFICIENT forms differ by gb/Gamma. (Already had this from F-series.)
- THE GAP — U4c measure content is PLACEHOLDER, not integral:
  - U4c_flat_coefficient: gb*V=gb*V := rfl. U4c_elasticity_integral:
    Gamma*V=Gamma*V := rfl. TAUTOLOGIES. The claim 'elasticity measure
    integrates to Gamma*V' is ASSERTED IN THE DOCSTRING, represented by
    X=X. NO integral, NO BL density, NO measure anywhere in U4c. The actual
    reconciliation (live barriers carry, capped don't, weighted sum = Gamma)
    is a COMMENT above a rfl.
  - NO genuine MeasureTheory.integral in any new file (only in comments).
  - BL closure (Vfun=INT n*mark=(sNorm/K)^Gamma) is a STATED HYPOTHESIS,
    not derived. So the 'measure representation' is ASSERTED; U2/U5
    'agreement' = both equal (sNorm/K)^Gamma by assumption+algebra, NOT the
    integral and point-mass independently computing the same thing.
- NET / honest status of the unification:
  - Effective-strike representation: GENUINELY PROVED (value/tx/funding-
    coefficient/elasticity-deriv/cap-continuity all real).
  - Measure representation: ASSERTED (BL closure hypothesis; U4c
    elasticity-integral a rfl placeholder). The INGREDIENTS for the measure
    claim (U4a slope=Gamma, U4b live=+/-1/capped=0, cap-continuous) ARE
    real, but never ASSEMBLED into an actual integral evaluating to Gamma*V.
  - 'Two representations agree' = half-real: effective-strike side rigorous,
    measure side assumed equal to it. Agreement by shared closed form, not
    independent integral computation.
  - 'One functional under 3 operations' holds at the CLOSED-FORM level;
    the deeper claim that the INTEGRAL representation independently produces
    those closed forms is NOT proved.
- This run does NOT close the BL-closure / measure gap; it cleanly
  LOCALISES it. The genuine integral INT n_BL(theta)*(d mark/d log sn)
  dtheta = Gamma*V is exactly Lean-intern Target 3 (BL closure), still
  open. U4a/U4b are the real new content (the elasticity mechanism); U4c is
  where the measure proof should be and isn't.
- TAKEAWAY: the closed-form OTM loop (effective-strike, three operations)
  is rigorously one object; the measure-theoretic equivalence remains a
  flagged assumption + placeholders. To make the measure rep REAL needs the
  genuine BL-closure integral (Target 3). Honest run, overstated summary on
  U4c specifically.

### GRUNT PACKAGE UPDATED for manager review (american_layer_grunt_package_v2.zip)
- Updated the implementation package before manager delegates to coding intern.
  Found the package's note/README/harness already had the put theta_eff fix,
  audit flag, and HARNESS re-tag (post-dated those corrections). Three
  remaining issues fixed:
  1. FUNDING CONVENTION pinned to 2*Gamma (README §4 was 'use Gamma', harness
     expect() was 2*Gamma — contradictory). Resolved to 2*Gamma, VERIFIED
     correct vs Lean (value-elasticity Gamma per F1/U4a; shipped ×2 convention
     per F4/U4d; (2Gamma)/Gamma=2). README §4 rewritten: generalise exponent
     +/-1->Gamma, carry existing ×2, don't drop/double. Harness was right;
     README wording was out of step.
  2. PUT REPEG TEST added (P_repeg_put, rate 1+Gamma) — harness previously
     tested only call (1-Gamma). Flagged in-test + header that the put rate is
     SYMMETRY-INFERRED pending the Lean E3 put-native proof; test pins the
     implementation, expectation updates if Lean revises.
  3. fundingPerStrike SIGNATURE pinned: adapter uses 7th positional arg
     (state,K,wing,N,dt,kappa,gamma). README 'API' section now pins it +
     forbids changing existing barrier/spread positional args (regression
     harness depends on them).
- Added MANAGER_REVIEW.md cover note: what changed, the 3 changes, the ONE
  reviewer check (does shipped barrier funding actually carry the ×2 -> is
  2Gamma right vs bare Gamma; real convention call), unchanged deliverables/
  scope guards, and the open BL-closure dependency (not a build blocker; gates
  only the 'exactly replicable' marketing claim).
- Verified: base build md5 UNCHANGED (6f606f52...), harness parses (node -c),
  package re-zipped as american_layer_grunt_package_v2.zip (6 files incl.
  MANAGER_REVIEW.md). Ready for manager review.

### TODAY's DERIVATIONS + UNIFIED-CORE LEAN PROMPT (barrier<->american)
- Conceptual arc today (all logged): sNorm = pool normalized spot (1-w)/w,
  centered at parity 1, rebase-invariant; perfect-arb pins sNorm=1 (oracle=
  parity in rebased-x-dollars); funding (sNorm-1)/sNorm = off-peg deviation.
  American layer = convexity dial on the OTM FRACTION only; ITM trivial.
- FRACTION-OF-PERP RESOLUTION (Rohan's, corrects Claude's earlier units
  error): value = fraction(mark) x base(perp). Convexity/Gamma lives ENTIRELY
  in the dimensionless fraction; linearity lives in the perp base. ITM
  fraction saturates at 1 (full perp, linear via base); OTM fraction =
  (sNorm/K)^Gamma. CONTINUOUS in dollar space (fraction x base) at parity —
  Claude's earlier 'discontinuity' was comparing fraction(->1) vs dollar-
  intrinsic(->0), apples-to-oranges. NOT circular (mark from curve state,
  base independent). Consistent w/ Fork A. ITM = notional*|strike-exercise|
  is the SETTLEMENT layer (realized close), distinct from the running mark.
- CANONICAL-Gamma DERIVATION PASS (sympy, forkA_value_functions.py): four
  candidate value objects give DIFFERENT maps — reserve x*MP+y -> elasticity
  -2/(sNorm+1) -> Gamma=2/(1+K)=2*w_K (clean, pivots barrier at parity, ties
  to funding x2); depth -> no clean power; pool/HODL (IL) -> 2K|K-1|/(K^3+..)
  zero at parity (most economically principled, 'hedgeable from IL'); perp MP
  -> Gamma=2 flat. 'Canonical' requires picking the value OBJECT — a modeling
  choice, NOT forced. (Pinned candidates, not a theorem.)
- BARRIER<->AMERICAN DIFFERENTIAL STRUCTURE (sympy, barrier_american_ode.py)
  — TODAY's KEY NEW RESULT, all machine-verified algebra:
  * V=(s/K)^Gamma satisfies s*V'=Gamma*V, s^2*V''=Gamma(Gamma-1)*V.
  * ONE curve-native operator L_a[V]=s^2 V'' + a(s V' - V). Barrier V=s/K is
    a root for EVERY a; american (s/K)^Gamma is a root iff a=-Gamma. Roots
    {1,-a}={1,Gamma}. Barrier & american = the TWO eigen-solutions of the
    SAME operator. (This is the 'conservation/relation' Rohan sensed.)
  * CONSERVED WRONSKIAN W = V_bar*V_am' - V_bar'*V_am = (Gamma-1)*V_american
    (up to 1/K); Abel relation W'-(Gamma/s)W=0 verified. The conserved
    bilinear of the two solutions IS the convexity-weighted american value.
  * Smooth-pasting (perpetual-american, strike-referenced intrinsic, delta-1)
    -> exercise boundary s* = Gamma*K/(Gamma-1); pins s* GIVEN Gamma, does
    NOT pin Gamma. s*>K needs Gamma>1 (steep — collides w/ replication fence,
    real tension flagged).
- THE CLOSURE / KNOB: pure geometry gives the STRUCTURE (operator, two roots,
  Wronskian) measure-free, but the operator has ONE free coefficient a=-Gamma.
  Pinning Gamma needs the carry/variance coefficient = the asset's vol under
  the funding measure (Fork A). So 'natural Gamma' = perpetual-american
  CHARACTERISTIC ROOT, and the knob = ASSET VOL (BTC vs gold etc.) entering
  via sNorm variance. Same role vol plays in classic option pricing — strong
  signal it's the right object. Three product tiers (Rohan): HTML knob open;
  prod fixed-at-bootstrap; oracle-fed vol (hardest — vol feed reshapes
  convexity+funding, needs hardening). Knob quarantined to one coefficient;
  structure invariant to it; never touches curve. Implementation = manager's.
- PROMPT: lean_prompt_unified_core_standalone.md (standalone, engine verbatim).
  Unifies EVALUATE(query OTM+ITM via fraction-of-base + cap-continuity)/
  PUSHFORWARD(tx)/DIFFERENTIATE(funding, 2Gamma, rapidity-slope) WITH today's
  D=barrier<->american one-operator/two-roots/conserved-Wronskian and
  E=parametric smooth-pasting (s*=Gamma K/(Gamma-1)), Gamma FREE throughout
  (knob open). Honest: closed-form + ALL of D,E genuine algebra (NO rfl-
  define-equal on the operator/Wronskian — where vacuous proof would hide);
  BL/measure rep STATED-hypothesis (out of scope, not faked); both wings A-C,
  put sign-symmetric-flagged D-E; Gamma>1 steep-vs-fence tension stated;
  axiom inventory. THIS is the capstone unifying core math per Rohan's ask.

### UNIFIED-CORE LEAN RESULT — ACCEPTED (compiles clean on Aristotle end)
- Received completed unified-core (8 files, Basic/Evaluate/Pushforward/Funding/
  Differential/SmoothPasting/Unification/Main). ZERO sorry in code (one in a
  comment). No axiom/admit/native_decide/implemented_by/unsafe/opaque. Shipped
  AXIOM_INVENTORY.md: every theorem A1..F on base axioms only (propext,
  Classical.choice, Quot.sound). Builds clean on Aristotle's end (Rohan
  confirmed — trusted). Claude read-verified proof bodies (genuine deriv/rpow,
  lemmas dispatched not rfl'd); could NOT independently compile (no toolchain/
  mathlib here) — accepted on Aristotle build + read-verification.
- GENUINELY PROVED (the full capstone):
  * A query OTM+ITM: A1 both wings (effective-strike value), A2 cap-continuity,
    A3 FRACTION-OF-BASE (convexity isolated in fraction, base Gamma-independent,
    continuous join for any continuous base) — Rohan's fraction-of-perp insight
    formalized.
  * B tx: hyperbola preserved, path-independence, round-trip zero, closed cost.
  * C funding: C1 elasticity=Gamma via real deriv on exp(Gamma*u), C2 cap-
    continuity + ITM-elasticity-0/OTM-+/-1, C3 the 2*Gamma convention separate.
  * D barrier<->american (TODAY's discovery, fully formalized): D2 the iff
    (american solves L_a iff a=-Gamma) + both-roots; D3a Wronskian=(Gamma-1)/K
    *V_am; D3c Abel W'-(Gamma/s)W=0 (real); D3d W proportional s^Gamma. All real
    algebra, NOT rfl-define-equal.
  * E smooth-pasting: s*=Gamma*K/(Gamma-1), value-match + smooth-paste +
    s*>K + positivity, ALL correctly gated 1<Gamma (steep). E2 parametric-in-
    Gamma (knob open). Put flagged sign-symmetric (Gamma<-1), not faked.
  * F unification capstone aggregating the genuine lemmas, both wings.
- TWO KEY CHECKS PASSED: (1) NO LEAK — 1<Gamma stayed quarantined in E; A-D/F
  on free Gamma (only honest Gamma!=1 where roots must differ). Capstone NOT
  secretly narrowed to steep band. (2) STEEP/REPLICATION TENSION now FORMALLY
  PINNED — every E theorem carrying 1<Gamma IS the machine-checked statement
  that the faithful-american smooth-pasting boundary exists only in the steep
  regime, outside the exact-replication band. The tension is a result in the
  type signatures, not a hole.
- CLOSING ITEMS sent (note_for_aristotle_final.md): (1) fix stale SmoothPasting
  docstring ('ALL Gamma'->'Gamma>1'); (2) paste RAW #print axioms stdout (vs
  transcribed table); (3) NEW small lemma: as Gamma->1+, s*->+inf (barrier =
  no-early-exercise Gamma->1 limit of the american — turns Gamma!=1/Gamma>1
  exclusions into a proved limiting story); (4) put D/E: prove or honestly flag
  the True-placeholder (no faking). None block; capstone stands.
- CLOSING ITEMS ALL RESOLVED (3rd output): (1) SmoothPasting docstring fixed
  (now states Gamma>1 steep + WHY gentle band excluded); (2) RAW #print axioms
  stdout now in AXIOM_INVENTORY.md (literal compiler form, UnifiedCore.* prefixes,
  was hand-table before); (3) NEW lemma E1e_boundary_tendsto_atTop GENUINELY
  PROVED — s*->+inf as Gamma->1+ (real Tendsto: tendsto_inv_nhdsGT_zero +
  pos_mul_atTop), so barrier = no-early-exercise Gamma->1 LIMIT of american;
  Gamma!=1/Gamma>1 exclusions now a proved limiting story not bare hyps; (4) put
  E2 placeholder now honestly flagged 'not formalized; asserted sign-symmetric
  Gamma->-Gamma' (not faked). E1e on base axioms; static rescan clean (no
  axiom/admit/native_decide/implemented_by/unsafe/opaque). All accepted.
- STATUS: the core math (query/tx/funding as one functional + barrier<->
  american conservation + perpetual-american boundary) is now ONE coherent
  sorry-free base-axioms-only Lean development. Implementation = manager's.

### PACKAGE v4 for manager review (post unified-core)
- Revised the grunt package for manager review, folding today's findings into
  the v3 base (handoff/pkg — the corrected-API one w/ dedicated exports +
  passing v25_reference.html). american_layer_grunt_package_v4.zip.
- Implementation task + API UNCHANGED (dedicated legPriceAmerican/
  fundingAmerican, wing-correct theta_eff, 2*Gamma funding, |Gamma|<=1 fence,
  both harnesses pass, base md5 6f606f52 unchanged). v4 changes the BACKING +
  FORWARD STORY, not the build.
- Integration note edits (surgical, tagged): header upgraded to cite the
  unified-core single machine-checked development; NEW S2b fraction-of-perp
  (Value=frac*base, convexity in fraction / linearity in base / ITM=full perp /
  continuous join — clarification, NO code change); NEW S6a canonical Gamma(K)=
  vol-calibrated characteristic root ([MODEL], forward-looking, three-tier knob
  sim/bootstrap/oracle); NEW S6b Gamma->1 limit (barrier = no-early-exercise
  limit, E1e proved); S6 fence rationale STRENGTHENED (faithful-american root
  is steep |Gamma|>1 = outside replicable band — tension pinned).
- MANAGER_REVIEW.md (v4): what's-new-since-v3 + TWO decisions surfaced — (1)
  |Gamma|>1 scope now sharper (faithful-American is inherently steep, so
  'true American' vs 'exact replication' mutually exclusive per wing; ship
  |Gamma|<=1 exact, or |Gamma|>1 as labelled bounded-error approx); (2)
  calibration tier for Gamma (keep free input now; roadmap sim->bootstrap->
  oracle; oracle tier needs hardening as vol feed reshapes convexity+funding).
  Both non-blocking; product calls.
- Bundled unified_core_lean.tar.gz + unified_core_AXIOM_INVENTORY.md as the
  backing. Carried v25_reference.html (still passes). Honest caveat in note:
  build trusted-from-prover + read-verified, not independently compiled here.
- Ready for manager review; back-and-forth loop: math changes -> manager
  re-verifies + updates harness/brief before grunt; this is spec+backing+
  decisions, implementation remains manager's.

### C9 — UNIVERSALITY (parked — brainstorm AFTER C8 output lands)
- Conjecture: compositions of convexity instruments are a UNIVERSAL
  BASIS for payoffs — any financial instrument's payoff is replicable
  or universally approximable by composing convexity instruments. A
  completeness / spanning claim.
- Classical ancestor: Carr-Madan / Breeden-Litzenberger — any twice-
  differentiable payoff = integral of calls+puts weighted by its SECOND
  DERIVATIVE. The 2nd derivative IS convexity => classical spanning is
  already secretly a convexity statement. Strong hint C9 is true and a
  hint at HOW.
- The genuinely new research question (not just "can you span" —
  classical theory says yes): convexity here is the PRIMITIVE you trade,
  not a weighting you compute. Does trading convexity directly give a
  MORE EFFICIENT / lower-dimensional / exactly-closed basis than the
  classical continuum-of-strikes integral? If yes — real theorem, real
  edge. If it just reproduces Carr-Madan — nice consistency result, not
  a new capability.
- WHY PARKED, NOT IN C8: different type of theorem (functional-analysis
  density/spanning vs C8's geometry/algebra); logically DEPENDS on C8's
  outcome (if C8 lands at fallback rung 2 = restricted surface, C9 is
  auto-false as stated and becomes "what sub-space do the carve-able
  instruments span"); and it is strong enough to be its own headline /
  second contribution.
- PLAN: brainstorm C9 after C8 returns, scoped to whichever rung C8 hit
  — let C8's revealed structure shape the universality statement rather
  than pre-committing to generic "all payoffs". (Q61 resolved: brainstorm
  after output.)

- OFFSHOOT TO BRAINSTORM (parked, post-prompt): this looks like a
  physical / pure-math system — a two-moment warp with a conservation
  law. Explore the physics/geometry analogy.

### RELATIVISTIC FRAMING — current best structural picture (BRAINSTORM, not result)
- Reached by trimming a 3-layer idea down to 2 (the trim was the right
  move — it removed a regress and left a STRONGER, falsifiable object).
- The picture: ONE invariant + ONE hyperbolic group. Two things, not a
  tower.
  - The pool's curve-warp (w) and the instrument's payoff-warp are NOT
    independent and NOT stacked — they are BOOST-RELATED COORDINATES of
    a single underlying object, mixing into each other under the same
    hyperbolic group that has surfaced as sinh/cosh since C1.
  - A TRADE is a boost (re-mixes how much of the invariant reads as
    curve-warp vs payoff-warp).
  - The "pricing surface" is the ORBIT of the invariant under the group
    — a single closed swept-out object, NOT an infinite stack.
  - Strike, unwarped barrier, unwarped American payoff = the trivial-
    orbit / zero-boost SPECIAL CASES. (Same kind of degeneracy: strike
    was a point on a curve; an unwarped payoff is the zero-warp slice of
    a warpable family — both are warp=0 special cases.)
- This DISSOLVES Q63 (is instrument-warp the same as w, or independent):
  neither — they are frame-dependent shadows of one invariant, related
  by a boost, exactly as relativity dissolves "is this duration
  absolute".
- It SUBSUMES the earlier "strike is a hyperbolic vector / completed
  payoff" idea: the warp IS the hyperbolic group action; the "completed
  payoff" is just the payoff under non-trivial warp; "extrapolation past
  the ITM cap" and "warping the payoff" are the SAME operation. The
  cap-at-1 is the boundary of the zero-warp slice; the bound "<= 1
  carved perp" holds leaf-by-leaf (per warp level), the boost relates
  the leaves. No unbounded value, no disconnected charts.
- THE FALSIFICATION TEST (Q64 — the sharp single question the trim
  bought us): does the warp group CLOSE? Do two trades compose like two
  boosts? A relativistic structure is finite — NOT a regress — precisely
  because boosts compose to boosts. "The mapping is itself warpable" is
  NOT a third layer: it is the group acting on itself by conjugation,
  same group, same floor seen from inside. If composition closes => one
  invariant + one group, finite falsifiable theory. If it fails to
  close => framing is wrong, and you would know exactly where.
### GAUGE SHARPENING — w as the connection field (BRAINSTORM, not result)
- The relativistic framing sharpens to a GAUGE-THEORY framing — and
  "gauge" here is held to its real signature, not used loosely:
  gauge = redundancy of description + LOCAL freedom + a CONNECTION that
  compensates the point-to-point slack.
- The mapping onto the structure:
  - PAYOFFS = the matter fields.
  - The pool warp / w = the CONNECTION (gauge field). w stops being a
    mere parameter — it becomes "how the warp is set as you move along
    the curve", i.e. the connection that makes local payoff-warping
    consistent across ray angles. The pool is not a backdrop the
    payoffs sit on — the pool IS the gauge field.
  - RAY-ANGLE space = the base manifold.
  - The hyperbolic warp group = the gauge group.
  - A trade = a gauge transformation.
- Checks that already pass: redundancy of description (curve-warp vs
  payoff-warp split is frame-dependent — from the relativistic framing);
  shared d.o.f. (pool and payoff warp in the SAME ray-angle d.o.f. —
  gauge needs the transformation to act on a shared structure).
- IF this holds: the conserved quantity hunted since C6 T3 is the
  NOETHER CURRENT of the gauge symmetry — and for a gauge symmetry the
  current is FORCED, not optional. C6 T3 stops being a hopeful
  conjecture; the task becomes "compute the current", not "is there
  one".
- Q65 — THE THEOREM (same question as Q64 group-closure, in gauge
  clothes — two routes converging, a good sign): is the warp freedom
  LOCAL (independently choosable at each ray angle, with w as the
  connection compensating) or only GLOBAL (one uniform re-mixing)?
  Local-and-compensated => genuine gauge theory, w is the connection,
  conserved current forced by Noether. Global only => a global
  symmetry, not gauge — still real, still useful, but "gauge" would be
  the wrong word.
- Natural successor conjecture AFTER C8: C8 says whether the convexity
  surface exists; the gauge question says whether the pool IS the
  connection field that makes it consistent.
- STATUS: brainstorm — NOT proven, NOT a prompt. Informs how C8 is read.

- STATUS: brainstorm / interpretive — NOT proven, NOT a prompt yet.
  Should INFORM how C8's result is read, not pre-empt it. If a prompt
  is ever drafted, its core ask = "determine whether the warp
  transformations close into a group" (group closure = the line between
  a finite theory and an unfalsifiable regress).

### C6 GEOMETRY BRAINSTORM — interpretive lens (NOT axioms)
- Picture reached: parameter space of the kurtosis family looks like a
  CONE. Apex = the flat / max-entropy / ZERO-SKEW pool — a unique
  attained degenerate "ground state". Open mouth = the infinitely-peaked
  (Dirac-like) limit — ASYMPTOTIC, never attained (volume conservation
  forbids a true Dirac: zero width * infinite height can't keep fixed
  finite volume).
- kappa = axial coordinate (apex -> mouth, low -> high kurtosis).
  w = angular coordinate around the cone — ZERO range at the apex
  (uniform distribution can't be skewed), opening up toward the mouth
  (a peak CAN slide left/right across the strike continuum).
- => kappa and w are DIRECTION-orthogonal but RANGE-coupled: kappa
  gates how much skew is even available. This is exactly C6's T4 — now
  PREDICTED by the geometry rather than open. T4 should expect a
  coupling, not prove clean orthogonality.
- Candidate deeper structure (all LENS, not assumed): "volume under the
  surface = total liquidity" is conserved — this is just what a CFMM IS,
  so it is GIVEN, not conjectured. Every reachable pool = an equal-volume
  liquidity distribution. Deformations = mass-conserving transport.
  Geodesics = optimal-transport (Wasserstein) paths. The "action" Rohan
  asked about = the transport energy functional on fixed-volume
  distributions. The "coherent warp" = pool moving along a transport
  geodesic.

### >>> GOVERNING PRINCIPLE for the C6 thread (do not erode)
- The geometry (cone, apex-ground-state, transport metric, sphere/cone
  shape) is an INTERPRETIVE LENS — scaffolding to make the structure
  thinkable and decide what to ask. It is NOT a set of axioms.
- Nothing about the object is ASSUMED into the formal work. In
  particular: whether the cone has a RIM (max attainable kurtosis) vs is
  INFINITE (asymptotes to Dirac forever) is left OPEN — it must be an
  OUTPUT of the derivation, not an input. Deciding it now would be a
  conjecture dressed as a premise and would narrow the possibility space
  before study. (Rohan's call — correct: don't erode generality.)
- Whether a max kurtosis exists is DERIVABLE from the volume-conservation
  constraint (does fixed volume admit a sharpest shape?) — so it is a
  fact to be revealed, not chosen.
- The C6 prompt already respects this: it asks for the family "valid for
  kappa in SOME interval" and to "give the sub-range and name the
  obstruction" — rim-or-no-rim is already a correct open output. No edit
  needed.
- ONLY things treated as GIVEN: (1) total liquidity volume is conserved
  (definitional for a CFMM); (2) Balancer and log/exp curves are real
  points that must lie in whatever family emerges. Everything else —
  rim, orthogonality, the metric, even whether kappa is truly
  1-dimensional — stays an open output. Let the math draw the boundary.
- (none blocking — portfolio/settlement handed to spinoff session)

### C1-EXT — WHOLE-BAND AMM TX AS A SINGLE COMPOSITE RAY
- Conjecture: composite-ray composition is associative/iterable — 4
  barriers (2 per leg) -> 2 rays (C1) -> 1 ray. Hence a whole-band AMM
  TRANSACTION (open, and the close's pool-reversal) collapses to a
  SINGLE swap.
- SCOPE: AMM state-transitions only (open + close-reversal). Settlement
  PAYOFF computation explicitly OUT — it is per-leg, sign-asymmetric,
  mark-capped => non-linear => does NOT compose. Settlement stays 2
  closed-form leg values via C1 + strike substitution; 2 lines is the
  proven floor, not a limitation. (Confirmed directly, no Lean needed:
  AMM tx = geometry, composes; settlement = signed capped arithmetic,
  does not.)
- SINGLE-CURVE MODEL: call side + put side are two REGIONS of ONE curve
  (one w, one invariant) — no cash settlement => no reason for 2 curves.
  This tightens the conjecture: cross-wing composition is just
  composition on the same curve; the ONE suspect is the ATM JOIN where
  mark = min(slope,1/slope) changes branch.
- FALLBACK LADDER (partial results valuable): rung 1 = 4 barriers -> 1
  swap (full); rung 2 = same-side composes but ATM join doesn't => 2
  swaps (still halves tx count — useful, not failure); rung 3 =
  obstruction named.
- PROMPT PRODUCED: lean_prompt_C1_EXT.md. C1 Lean file
  (C1_CompositeRayITM_for_ext.lean) staged to attach. For a separate
  parallel session.

## 5. Open questions for Rohan (continued)

## 5c. LEAN-PROVER CONJECTURES (surfaced this session, for Aristotle)

> Three conjectures to hand to the Lean session. Each must be stated
> precisely enough to prove/refute before an Aristotle run.

### C1 — Composite-ray shortcut extends to ITM settlement
- Claim: the shortcut (theta*=sqrt(ti*to), 2sinh/2cosh forms), proven
  OTM, also holds for CLOSING / settling an ITM position IF the ITM
  strike is replaced by spot (effective-strike substitution).
- Lean statement (Identity-V-shaped, extended past the money): the
  shortcut with effective strikes (original if OTM, spot if ITM) equals
  the true legwise close value.
- TO PIN before Lean: exact effective-strike predicate — which strike
  substituted, ITM predicate per leg, spread inner-then-outer behaviour.

### C2 — No costless-collar arb in a symmetric (w=1/2) barrier pool
- Claim: at w=1/2, V_sell=V_buy + wing-symmetric mark => no composition
  of collar legs yields free value (capital-efficiency surplus = 0).
- Sharpening of the paper's "No internal arbitrage" — specifically the
  costless-collar version, conditioned on zero skew.
- Lean statement: for w=1/2, bought-leg value attainable for a given
  V_sell budget is exactly mirror-symmetric to the sold leg — no strict
  surplus. Algebraic identity on mark symmetry.

### C3 — No-arb is a SYMMETRY phenomenon, not an INSTRUMENT phenomenon
- Claim: a DIFFERENT symmetric pool (log/exp curve shape, not
  x^w*y^(1-w)) with a DIFFERENT instrument (perpetual American call, the
  power-law value family V=A*(S/K)^gamma) gives the SAME no-free-arb
  result. => result is driven by pool symmetry, not the barrier
  instrument or the specific invariant.
- Most ambitious; needs the most spec work. "Log/exp shape" = a CFMM
  whose curve is symmetric under asset<->cash leg swap.
- OPEN Q35: full generality (any leg-swap-symmetric curve) vs two
  concrete instances (Balancer curve + a specific log/exp curve), with
  the generality claim made informally from the two. Lean toward two
  instances given AfT timing.
- OPEN Q36: handoff as a scoped Lean-session prompt — one prompt for all
  three, or one per conjecture (Aristotle runs cleaner scoped tight)?

### Lean prompts PRODUCED (4 files in /mnt/user-data/outputs, run parallel)
- lean_prompt_C1.md — shortcut extends to ITM settlement (effective
  strike). First deliverable: pin the effective-strike predicate.
- lean_prompt_C2.md — no costless-collar surplus at w=1/2 (cleanest;
  algebraic identity on mark wing-symmetry).
- lean_prompt_C3.md — symmetry-not-instrument, TWO instances (Balancer/
  barrier ref + log-exp curve / perpetual American call).
- lean_prompt_C4.md — META consistency theorem (W1-W5). W5 is the key:
  no-arb shown CONDITIONAL (zero at w=1/2, non-zero under skew) — an
  unconditional no-arb would be the bug-signature. Explicit scope limit:
  (a) model-internal consistency only, NOT (b) code-faithfulness.
- All four carry honest-framing: "no sorry" != "no axioms"; explicit
  axiom inventory required.
- Q35 RESOLVED: C3 = two instances, not full generality.
- Q36 RESOLVED: separate prompts, run parallel.
### C3 ARISTOTLE RESULT — received, assessed (run c03dbdfb)
- Status: 3 Lean files compile, no sorry. Standard axioms only
  (propext, Classical.choice, Quot.sound).
- WHAT IS GENUINELY PROVEN:
  - Abstract framework: surplus_antisymmetric, surplus_zero_at_one,
    surplus_zero_expectation, costless_at_one_of_reflection — real
    tactic proofs. Given reflection property => surplus antisym & zero
    at S=1. Airtight.
  - Both pool CURVES symmetric (sqrt x*sqrt y, exp(-x)+exp(-y)) — proved
    by ring.
  - Both instances factor through the SAME abstract theorem — the
    instrument-agnostic conditional is honestly demonstrated.
- THE CAVEAT (significant — do not skip):
  - The link curve-symmetry -> instrument reflection V_sell(S)=V_buy(1/S)
    is an AXIOM (InstanceAData.reflection / InstanceBData.reflection),
    NOT proven. That arrow IS the economic content.
  - Chain: curve symmetry -> [ASSUMED] -> reflection -> [PROVEN] -> zero
    surplus. C3 proves "IF legs reflect, surplus zero." It does NOT
    prove "pool symmetry CAUSES the reflection."
  - => C3 proved the CONDITIONAL SKELETON, not the CAUSAL claim.
    "Symmetry not instrument" holds for the conditional, not the full
    phenomenon.
- WEAK SPOTS:
  - expPool_is_not_balancer proved with witness (0,0) — nearly vacuous
    (functions differ at origin; not structural curve-family
    distinctness).
  - perpCallValue / PerpCallParams DEFINED but never USED in
    instanceB_zero_surplus — the instrument is decorative to the proof.
- IMPLICATION: makes C4 more important — its W5 (no-arb must BREAK under
  skew) tests whether `reflection` is a genuine consequence or a
  too-strong assumption.
- OPEN: possible C3-redo — derive reflection from curve symmetry + an
  instrument-pricing assumption, rather than assuming it whole. Decide
  vs "conditional skeleton is enough for the paper."

### C4 ARISTOTLE RESULT — received, assessed (run 762118ab)
- Status: C4.lean compiles, no sorry. STANDARD AXIOMS ONLY — NO domain
  axioms (verified). All admissibility conditions are explicit
  hypotheses, not assumed `axiom` declarations.
- STRONGER THAN C3, and different in kind:
  - C3 AXIOMATIZED the load-bearing step (reflection property assumed).
  - C4 DEFINES mark concretely: markCallOTM = (s/theta)^sNormCall(w),
    sNormCall(w)=(1-w)/w — and DERIVES everything. No axiom for the
    economic content.
- W5_iff — THE RESULT WANTED, properly proven:
    (forall theta>1, collarSurplus theta w = 0)  <->  w = 1/2
  Genuine biconditional. Surplus zero for all strikes IFF symmetric.
  Proof real: reduces to sNormCall(w)=sNormPut(w) <=> (1-w)^2=w^2
  <=> w=1/2; reverse via log + rpow exponent injectivity. Both
  W5_forward and W5_backward (skew => explicit nonzero surplus at
  theta=2) are real tactic proofs.
- => THE ANTI-BUG CHECK PASSES. No-arb DISCRIMINATES: true at w=1/2,
  FALSE under skew, explicit counterexample. NOT a definitional
  artifact. The no-arb result has genuine structural content.
- => Also retroactively backfills C3's axiomatized gap, for the
  Balancer/barrier case: C4 shows symmetry falls out of the concrete
  mark formula at w=1/2, no reflection axiom needed. C3 = breadth
  (instrument-agnostic, axiomatized); C4 = depth (concrete,
  Balancer-only). Complementary.
- CAVEATS (smaller this time):
  - collarSurplus = pure mark difference (pricing asymmetry), not full
    dollar collar P&L. Right object for "no free PRICING edge";
    consistent with the no-CASH-arb framing, not a risk-mgmt-value claim.
  - C4_jointConsistency closed with `grind +suggestions` (heavy
    automation) — compiles, low-risk (just conjoins the transparent
    W1-W5), but the one theorem not eyeball-checkable.
  - W4 (effective strike) theorems real but light — mostly the OTM
    identity; substantive ITM content thinner than W1/W5.
- NET: solid validation. No-arb is structural, not a bug. Conditional
  on symmetry, skew breaks it, no domain axioms, real biconditional.

### C1 ARISTOTLE RESULT — received, assessed (run a47ea888)
- Status: CompositeRayITM.lean compiles, no sorry, standard axioms only.
- GENUINE PASS. identity_V_call proved INLINE (real algebra through
  sinh/exp/log/sqrt — not axiomatized). Main theorem case-splits on spot
  vs the two strikes; all 3 cases (both OTM / inner ITM / both ITM)
  proved. Effective-strike predicate confirmed as drafted.
- Honest note: both-ITM case, both sides collapse to 0 (composite =
  mark*2sinh(0)=0; legwise = 1-1=0). Identity holds but trivially there.
  Correct value, just worth knowing "works fully ITM" partly means
  "both sides zero".
- C1 genuinely proves what it set out to. ITM shortcut validated.

### C2 ARISTOTLE RESULT — received, assessed (run ee5b6b3a) — WEAK
- Status: compiles, no sorry, standard axioms — BUT the headline
  theorem does NOT prove what it claims.
- C2_no_collar_arbitrage: `(h_cash: sellValue=buyValue) -> surplus=0`.
  surplus := buyValue - sellValue. So it's `a=b |- b-a=0` — a
  TAUTOLOGY. The "no arb" conclusion is literally the hypothesis
  restated. h_mirror unused (underscore). The mark/symmetry machinery
  untouched by the main theorem.
- The intended content (symmetry FORCES V_sell=V_buy) is ASSUMED, not
  derived. Same flaw as C3 but worse — C3 proved real consequences from
  its assumption; C2's headline proves nothing.
- SALVAGEABLE parts (genuinely proved, use only as supporting lemmas):
  - markCall_eq_markPut_mirror — call@theta = put@(1/theta) at sNorm=1.
  - C2_notional_equality — cash-conservation + mirror => N_buy=N_sell.
- SAVING GRACE: C2's intended result is ALREADY properly proven by C4's
  W5_iff (derived from the concrete mark formula, real biconditional,
  skew counterexample). => Do NOT cite C2 as the no-arb proof. Cite C4.
  C2 file = redundant-to-weak; keep only for the notional-equality lemma.

### >>> NET PICTURE — all 4 Lean conjectures back
- C1: genuine pass — ITM shortcut proven, predicate confirmed.
- C2: headline tautology — real no-arb content ABSENT here, but covered
  by C4. Keep C2 only for notional-equality lemma.
- C3: conditional skeleton proven, instrument-agnostic; causal step
  (symmetry->reflection) axiomatized.
- C4: THE STRONG ONE — no-arb proven structural (biconditional, skew
  breaks it), no domain axioms. THIS is the no-arb citation.
- BOTTOM LINE: the thing wanted — "no-arb is real, not a bug" — IS
  established, by C4. C2's failure to prove it independently doesn't
  change that; it just means cite C4, not C2.

### C5 PROMPT PRODUCED — lean_prompt_C5.md (one consolidated round)
- Framed around a UNIFIED valuation formula (resolves the old Q39):
  legValue = N * (markEff(inner) - markEff(outer)), in CARVED PERP
  EQUITY units. Barrier = degenerate case, no outer (second term 0).
  Case distinctions (barrier/spread, OTM/ITM) pushed into effective-
  strike substitution (C1's trick), NOT into formula or proof case tree.
  Inner crosses ITM before outer; tent shape accepted (must not be
  smoothed away — guarded by a consistency lemma).
- D1: derive C3's reflection property from curve leg-swap symmetry +
  the unified formula. One identity on one formula. Anti-smuggling
  check explicit; clean NEGATIVE result allowed & informative.
- D2: bridge theorem — C4's concrete Balancer mark SATISFIES the
  abstract reflection property as a DERIVED fact. Unifies C3+C4 into one
  "symmetry => reflection => no-arb" chain.
- D3: transparent re-proof of C4's grind-closed jointConsistency.
- Honest framing carried throughout; "no sorry" != "no axioms".
- NOTE: D1 may legitimately fail — possible curve symmetry alone
  doesn't force reflection. Either outcome useful.
- STATUS: C5 DISPATCHED to Aristotle with C1/C3/C4 .lean files
  attached (C2 omitted — tautology, nothing builds on it). Awaiting
  output.

### C5 ARISTOTLE RESULT — received, assessed (run 5c292aaa / 54ce8947)
- Status: C5.lean compiles, zero sorry, ZERO domain axioms, standard
  axioms only. Best-framed output of the five — unusually candid
  self-assessment, no overclaiming.
- ALL THREE DELIVERABLES LANDED:
  - D1: reflection property DERIVED (C3's axiom eliminated) — but see
    caveat 1.
  - D2: bridge real — D2_reflection_holds proves the abstract
    ReflectionProperty by CITING D1's mark_reflection, not re-assuming.
  - D3: genuinely transparent — each W-component a named lemma, the
    conjunction just tuples them, no grind on the whole.
  - Anti-over-smoothing consistency lemma present & real:
    spread_both_otm/inner_itm/both_itm reproduce C1's piecewise values;
    tent_property proves rise-then-fall (positive at midpoint, zero past
    outer). Tent NOT smoothed away.
- CAVEAT 1 (the one that matters): D1 did NOT derive reflection from
  abstract curve symmetry f(x,y)=f(y,x). It derived it from the CONCRETE
  Balancer formula — D1_reflection_derived takes `w = 1/2` as a
  HYPOTHESIS. Chain proved: w=1/2 -> sNormCall=sNormPut=1 -> mark
  reflection -> V_sell(S)=V_buy(1/S). The arrow curve-symmetry -> w=1/2
  is NOT in the file. The file ITSELF names this as "the obstruction to
  full generality" and is explicit the mark form is model-specific.
  => Honestly IN BETWEEN: success for the Balancer case (C3's axiom
     genuinely gone — reflection now a calculated consequence), NOT the
     general "symmetry causes reflection for any symmetric pool". The
     prompt explicitly permitted a clean negative result with the
     obstruction named — C5 delivered exactly that for the general case
     + a real positive result for the concrete case. No overclaim.
- CAVEAT 2: S>0 fix verified honest. ReflectionProperty now quantified
  `forall S, 0 < S -> ...`. The S<=0 "disproof" was a Lean div-by-zero
  artifact, not economics (spot always positive). Correct domain, not a
  dodge. surplus_antisymmetric/zero_at_one carry 0<S cleanly.
- CAVEAT 3: D2 bridges to a self-contained REPRODUCTION of C3's
  AbsCollarValuation ("reproduced for self-containedness"), not C3's
  literal file. Mathematically identical; minor stylistic note.
- NET: C5 does what the round needed — C3's reflection axiom eliminated
  for the Balancer case via an honest concrete derivation; unified
  formula proven to reproduce C1's cases AND the tent; D3's opaque grind
  gone. The one thing not done (reflection from pure abstract symmetry)
  is openly flagged as the named obstruction, which the prompt allowed.
- >>> UNBLOCKS THE HTML: C5's spreadValue definition (markCall(inner) -
  markCall(outer), ITM saturation, tent preserved) is Lean-validated and
  IS the formula for the 2-line portfolio + closeBand settlement
  protocol. The thing we were waiting on before touching the HTML is
  CLEARED.

## 5b. Cross-session handoff
- **paper_diff_brief.md** produced -> /mnt/user-data/outputs/paper_diff_brief.md
  - Conceptual/high-level design picture for the AfT paper session.
  - Diff-enabling brief: lists conceptual elements to check the draft against.
  - 4 paper-relevant mechanics surfaced this session:
    1. band protects origin perp; settlement perp-denominated
    2. perp aggregation model + frozen origin slice
    3. effective strike = close/exercise mechanism
    4. one-shot composite-ray band closure
  - Implementation/UI fenced to annexure-level / out of scope.
  - Attach alongside Temporal_Paper_AfT_2026_v6.docx in paper session.

---

## 6. Intuition recaps (periodic collapses)

### Recap 1 — what this session has converged on
The portfolio findings (F1-F5) all collapse into ONE idea: **make the
band's origin and per-piece structure legible, because settlement is
perp-denominated and attribution must stay clean.**
- A band is carved from an aggregated perp -> it must carry a frozen,
  immutable origin slice {notional, equity, mark} so settlement isn't
  contaminated by later perp activity.
- A band has up to 4 pieces -> portfolio should show them per-piece, each
  with original + effective strike, because effective strike (snaps to
  spot when ITM) is exactly the info closure needs.
- Closure itself stays one-shot (composite-ray clubs the pieces) — the
  per-piece view is for legibility, not execution granularity.
The old portfolio "hid and aggregated away" precisely this structure;
the closed-form upgrade is the moment to expose it cleanly.

### BL-CLOSURE CALCULUS CLAIM — manager INDEPENDENTLY verified (the U4c gap)
The "American-from-barriers via calculus" rests on ONE load-bearing claim the unified-
OTM-loop run (15abff9a) left as a rfl PLACEHOLDER (U4c) and integration note §6 carried
as a "stated calculus lemma":  V(sNorm)=∫ n(θ)·mark_call(θ,sNorm) dθ = (sNorm/K)^Γ.
Lean proved the closed-form (effective-strike) side, NOT the integral. I verified the
integral side myself (calculus, not rpow algebra).

DERIVATION: mark_call(θ,·) as a fn of s = capped ramp (slope 1/θ below s=θ, flat above),
downward kink at s=θ ⇒ P(s)=∫_0^s n + s∫_s^∞ n/t ⇒ P''(s)=−n(s)/s ⇒ n(s)=−s·P''(s).
For P=(s/K)^Γ: n(θ)=G(1−G)/K²·θ·(θ/K)^(G−2) ≥0 for 0<Γ<1. Target = capped min((s/K)^Γ,1);
density on (0,K]; PLUS point mass = Γ at θ=K (cap kink, slope drop G/K, basis kink 1/K).

NUMERIC (log-sub t=K e^−z to resolve t→0 spike): Γ=1 exact; Γ=0.5 → 2.9e-12;
Γ=0.25 → 4e-12; Γ=0.1 → 5.5e-6 (slow but →0). Earlier "growing error as Γ→0" was MY
truncation, not a missing term.
ANALYTIC MASS: ∫_0^K n_smooth = (1−G); + point mass G ⇒ TOTAL = 1 EXACTLY, every Γ.
(1−Γ) smooth / Γ point-mass. Clean closed form, the satisfying confirmation.

VERDICT: calculus generalization CORRECT. American (K,Γ) = genuine continuum of capped
barriers integrating exactly to (sNorm/K)^Γ for 0<Γ<1, recovering single barrier at Γ=1.
This is the INDEPENDENT integral the Lean U4c only asserted (X=X). "Two representations
agree" now has BOTH sides: effective-strike (Lean rpow) + measure/integral (here).
CAVEAT: confirms 0<Γ<1 call (put −1<Γ<0 by symmetry, not independently checked);
|Γ|>1 NOT covered — density changes sign / superposition not a positive measure
(matches note §6 "does not converge outside ±1"). STILL OPEN: formal Lean proof
(Target 3) — verified here numerically+analytically (strong, not machine-checked).
Build does NOT depend on it (prices off closed form, stays |Γ|≤1).

### HARNESS-PASSABILITY PASS + API TRAP CAUGHT (manager, pre-grunt-recruit)
Before recruiting a fresh coding grunt for the American layer, manager did the
harness-passability pass (can't delegate verifying own grader) + the funding ×2
reviewer-check the research lead left open. Both done against the REAL v24 engine.

REVIEWER-CHECK (funding ×2): CONFIRMED. v24 fundingPerStrike body hardcodes
  gamma=(wing==='call')?+2:-2 internally. So generalising ±1→Γ and carrying the ×2 ⇒
  shipped-effective 2·Γ. The research lead's target was right.

REFERENCE IMPL built (v25_reference.html): added americanThetaEff (wing-correct),
  legPriceAmerican (fences |Γ|≤1, Γ≠0, K>0; recompute θ_eff each call), fundingAmerican
  (form of fundingPerStrike, gammaEff=2·gamma). File-safety PASS (blobs 273864/5168
  intact, 3 scripts parse). RESULT:
  - regression_harness_v2.js → ALL PASS, exit 0 (curve untouched ✓)
  - american_layer_harness.js → ALL PASS, exit 0 — ALL 8 checks:
    A_anchor_call/put, C_collapse_call/put, P_repeg, P_repeg_put, G_gamma_gt1,
    F_funding_call (matched to full float precision — 2·Γ + wing-correct θ_eff right).
  ⇒ The grader is VERIFIED PASSABLE. Risk of un-passable harness → grunt force-patch
    is eliminated.

API TRAP CAUGHT (would have bitten the grunt): the v2 brief said "pass Γ as the 7th
  positional arg of fundingPerStrike." WRONG. v24 signature is
  fundingPerStrike(state, strike_theta, wing, N, dt, kappa, oracle, oracle_initial) —
  slots 7,8 are oracle/oracle_initial (v24 rebase fix added them; γ=±2 is internal,
  there is NO gamma param). PROVED the trap: passing gamma=0.5 into slot 7 returns
  −0.001067 (the Γ=1 value — ignores the exponent, misframes via raw getSNorm) vs
  correct −0.000653. Wrong by ~63%, SILENTLY (no throw). A grunt following the brief
  literally would ship funding that ignores Γ and breaks on rebased pools.
  FIX: brief v2→v3 corrected — grunt MUST add dedicated legPriceAmerican/fundingAmerican
  exports, NEVER reuse fundingPerStrike's positional slots, NEVER change existing
  signatures (regression harness depends on them).

DELIVERED: american_layer_grunt_package_v3.zip (5 files: corrected README/brief, base
  v24 [clean, 6f606f52 — grunt builds from clean not from my ref impl], integration
  note, both harnesses). Both harnesses verified parse + the grader verified passable.
  v25_reference.html kept as MANAGER verification artifact (NOT shipped to grunt — it's
  the answer key; grunt builds blind against the harness).

DECISION: grunt builds BLIND (package has harnesses + brief, not the reference impl).
  Reference impl proves passability + pins the correct API in the brief; grunt does the
  real in-band integration (instrument record, legPrice dispatch wiring, UI) which the
  bare exports don't exercise. READY TO RECRUIT.

### V4 RELAY AUDIT — manager (unified-core Lean + package v4)
Research lead returned a full relay (unified-core Lean, integration note v4, package v4).
Manager audited rather than trusting the README headline. Findings:

BUILD/PACKAGE (verified, all intact):
  - base build still md5 6f606f52 (curve untouched) ✓
  - both harnesses BYTE-IDENTICAL to the v3 ones I verified (regression b915f204,
    american 1c8cec75) ⇒ my passability verdict carries over directly ✓
  - carried v25_reference.html byte-identical to mine (f0219149), still passes BOTH
    harnesses exit 0 ✓
  - v4 README/brief BYTE-IDENTICAL to my v3 brief — API-trap fix + dedicated-export
    mandate + 2·Γ + wing-correct θ_eff all intact, build task untouched ✓
  - integration note changed as disclosed (§2b fraction-of-perp, §6a vol-calibrated
    root, §6b Γ→1 limit, strengthened §6) — backing/forward-story only, no build impact
  ⇒ NOTHING in v4 re-opens the build. Implementation package remains committable as-is.

LEAN (audited source + inventory directly, did NOT take README at face value):
  - zero sorry, zero user axiom — CONFIRMED by grep of all 8 .lean files. ✓
  - base axioms only (propext/Classical.choice/Quot.sound) — per inventory's raw
    #print axioms; consistent. (NOT independently recompiled — see caveat.)
  - D-series proof bodies are REAL (Cauchy-Euler ODE: D1 s·V'=Γ·V, D1b s²·V''=Γ(Γ-1)V;
    D2 characteristic-root a=-Γ via genuine convert/grind/deriv lemmas; D3 Wronskian).
    Substantive, math correct. Not scaffolding.

  ⚠ TWO THINGS THE README HEADLINE OVERSOLD (inventory was honest in detail; summary
    line "every [PROVED] now machine-checked" glosses these):
    1. BL-CLOSURE (Target 3) STILL NOT PROVED. Listed "STATED (not proved — out of
       scope)... may be assumed as a hypothesis"; in Unification.lean it's a COMMENT,
       not a theorem. ⇒ My own numeric+analytic verification (§BL-CLOSURE) remains the
       ONLY backing for the integral side. Unchanged from v3. NOT closed.
    2. PUT-NATIVE (E3/E2) STILL NOT PROVED. E2_put_regime_note := trivial (a True
       placeholder, confirmed in SmoothPasting.lean:114). Put form is asserted
       sign-symmetric (Γ↦−Γ), not formalized. Same gap as v3. The harness still
       pins+flags the put rate. NOT closed.
    (modelling_knob_open := trivial is also a True marker but that one is honestly just
     a doc-marker for the open Γ-calibration knob — fine. No real theorem cites either
     trivial-marker; grep for citations empty. So the placeholders are inert.)

  GENUINE NEW RESULTS (real, but mind the regime): E-series (smooth-pasting, Γ→1 limit,
    exercise boundary →∞) are proved — BUT they live in the |Γ|>1 "faithful American"
    regime, which the BUILD FENCES OUT (|Γ|≤1). So E-series backs the FORWARD STORY
    (decisions 1&2), not the shipped layer. Important not to blur: the shipped |Γ|≤1
    layer is exactly-replicable (barrier-collapse, A–D); faithful-American (E) is the
    steep |Γ|>1 regime we are NOT shipping. The research lead states this tension
    correctly (Decision 1) — it's a product call, not a math gap.

  CAVEAT (honest, shared with the lead): I could NOT independently compile — Lean
    v4.28+mathlib toolchain not installable here (elan installer + github release assets
    both 403 behind the egress allowlist; same blocker he hit). Verification = source
    audit + inventory read + dependency grep, NOT a clean-room recompile. Final
    certainty on "compiles clean" still needs a machine with the toolchain. The two
    True-markers being inert is grep-confirmed; the no-sorry/no-axiom claim is
    grep-confirmed in source; the COMPILE itself is trusted-from-prover + my read.

TWO DECISIONS RAISED BY LEAD (both product calls, neither blocks build):
  D1 |Γ|>1 scope: ship |Γ|≤1 exact (recommended v1) vs offer |Γ|>1 as labelled
     bounded-error approximation later. Manager view: ship |Γ|≤1 for v1 (matches the
     fence already in code + the only regime with proven exact replication). |Γ|>1 is a
     future relaxation needing the BL-on-truncation error bound first.
  D2 Γ calibration tier: sim slider → bootstrap-fixed → oracle-fed vol. Manager view:
     agree with order; oracle tier needs adversarial review before ship (vol feed
     reshapes convexity AND funding). For NOW: implementer keeps Γ a clean injected
     input, does NOT hardcode. (Already in the brief.)

NET: v4 is a backing/story upgrade, honestly built, with the build contract preserved
exactly. The two originally-open targets (BL-closure, put-native) are STILL open — the
unified-core did not close them (and the lead's detailed inventory says so; only the
relay README summary overstated). Recommend: (a) implementation package is GO whenever
— unchanged and re-verified; (b) the two open Lean targets remain the real research
work; (c) flag the README-vs-inventory overstatement back to the lead so the paper
doesn't inherit it.

### V4 RELAY ROUND 2 — research lead conceded the overstatement; loop CLOSED
Lead returned relay2 with 08_reply_to_manager_correction.md. He accepted every audit
point with no defensiveness and ACTUALLY made the fixes (verified, not just promised):
  - README: now leads with a CORRECTION block superseding "everything machine-checked"
    — states A–D spine is machine-checked; BL-closure + put-native OPEN; E-series is
    |Γ|>1 forward-story backing. ✓
  - integration note: +6-line callout (my exact "shipped=|Γ|≤1 exact vs faithful=|Γ|>1
    not-shipped" framing + open-items caveat). Pure addition, no build-spec touched. ✓

DRIFT CHECK (the failure mode I watched for — "reply + silent package edit"):
  Diffed relay2 vs relay1 file-by-file. Build contract FULLY INTACT: README/brief,
  both harnesses, base build 6f606f52, reference impl f0219149 — all BYTE-IDENTICAL.
  Only changes: README (correction), integration note (the +6 framing lines), and the
  zip repacked to carry the updated note. Nothing smuggled into the build. ✓

TWO CLARIFICATIONS FROM LEAD I'm recording as CORRECT:
  1. BL-closure was never in this run's Lean scope — prompt carried it as a stated
     hypothesis; note tags it [MODEL], not [PROVED]. So the Lean did what it claimed;
     only the README cover line forgot its own scope. ⇒ "OPEN, not broken." Fair, and
     it means the unified-core didn't regress or hide anything.
  2. The |Γ|>1 bounded-error mode and BL-closure are THE SAME WORK (a BL-on-truncation
     error bound IS the BL-closure analysis). So the two open items converge into one
     research track, not two. Good insight — recorded.

COMPILE CAVEAT — symmetric and honest on both sides: neither of us could install Lean
  4.28+mathlib (egress wall blocks elan installer + github release assets). Both Lean
  verdicts = source audit + inventory + grep (no-sorry/no-axiom/inert-placeholder all
  grep-confirmed), compile itself trusted-from-prover. Paper must NOT claim an
  "independently verified compile" from either of us. ACTION ITEM (whoever has a
  toolchain / CI): one clean compile on Lean 4.28+mathlib for final certainty.

DECISIONS — both agreed by both parties:
  D1 |Γ|>1: ship |Γ|≤1 exact for v1; |Γ|>1 bounded-error is future relaxation needing
     the BL-truncation bound first (= the BL-closure work).
  D2 Γ calibration: sim-slider → bootstrap → oracle-vol; oracle tier gets own
     adversarial review; implementer keeps Γ injected (already in brief).

NET STATE:
  - PACKAGE: GO. Re-verified twice now, byte-identical, contract intact. Recruit the
    grunt whenever — no further manager pass needed on the build side.
  - LEAN: A–D spine real + clean (modulo the symmetric compile caveat). Open research:
    (i) BL-closure formalization (= the |Γ|>1 truncation-error work), (ii) put-native
    D/E under Γ↦−Γ. Neither blocks the build.
  - PAPER: overstatement corrected at source before it propagated. Framing locked.
  - PROCESS: merge discipline held both rounds; canonical note never re-forked.

### PUT-NATIVE GAP — CLOSED, manager-verified (incremental delta on v4)
Research lead returned an incremental delta closing the put-native gap I flagged in the
v4 audit (E2_put_regime_note := trivial). New PutWing.lean + SmoothPasting_updated.lean.
Manager audited the actual Lean, did NOT trust the "closed" claim.

VERIFIED:
  - NO sorry / trivial / stray axiom in PutWing.lean or SmoothPasting_updated.lean
    (grep-confirmed). The former True placeholder is now a REAL theorem E2_put_regime
    stating 0 < s* < K (Γ<−1) — the put dual of the call's s*>K. ✓
  - Full P-series present + real proof bodies: PD2 (operator/roots), PD3 (Wronskian,
    Abel), PE1 (boundary<strike, value-match, smooth-paste), PE1e (limit), all on base
    axioms (inventory: 48 theorems on propext/Classical.choice/Quot.sound). ✓

THE FINDING — verified MYSELF against the definition exerciseBoundary = Γ·K/(Γ−1):
  The put is NOT the naive Γ↦−Γ mirror. The limit geometry genuinely differs:
    - Call Γ→1⁺: Γ·K/(Γ−1) → K/0⁺ = +∞ (theorem: atTop). Boundary recedes;
      barrier = no-early-exercise limit.
    - Put Γ→−1⁻: Γ·K/(Γ−1) → (−1)K/(−2) = K/2, FINITE (theorem: nhds (K/2)). ✓
    Same formula, divergence on one wing / finite limit on the other — because the call
    sits at the pole Γ=1 while the put evaluates at Γ=−1 (far from the pole). Numeric
    confirmed: K=1.3 → s* sweeps 0.653→1.275 across Γ∈(−1,−50), always 0<s*<K,
    limit K/2=0.65. ⇒ asserting the put "by symmetry" would have been WRONG. The
    placeholder genuinely deserved killing; this is a real, proven asymmetry, good for
    the paper.
  - put_exerciseBoundary_pos proof is HONEST: 0<s* via div_pos_of_neg_of_neg (num Γ·K<0,
    denom Γ−1<0 ⇒ positive). No div-by-zero sleight (denom −2≠0 at the limit point). ✓

CAVEAT (same as before, symmetric): not independently compiled (egress wall). Verdict =
  source audit + inventory + grep + my own numeric/algebraic check of the headline
  finding. Compile trusted-from-prover. Final certainty still needs a Lean 4.28 box.

STATUS OF THE TWO v4-AUDIT GAPS NOW:
  - Put-native: CLOSED ✓ (this delta, manager-verified).
  - BL-closure (Target 3): STILL OPEN (unchanged) — numeric+analytic backing only,
    stated hypothesis. = the |Γ|>1 truncation-error work (the two converge). Gates the
    "exactly replicable" paper claim, NOT the build.

PACKAGE/BUILD: untouched by this delta (lead said so; nothing to re-review — the build
  contract was already byte-verified twice). Still GO. To apply the Lean delta to the
  archived unified-core: drop PutWing.lean into RequestProject/, replace SmoothPasting,
  swap inventory.

NET: one of the two open Lean items is now closed and verified. BL-closure is the sole
  remaining research gap, and it's not a build blocker. Process: merge held again.

### [MERGED FROM RESEARCH-LEAD BRANCH] — his parallel log of the same events
The two entries below are the research lead's own logging of the v4-audit resolution and
the put-native run. They cover the SAME events as my "V4 RELAY AUDIT" / "V4 RELAY ROUND 2"
/ "PUT-NATIVE GAP" entries above — folded in verbatim so this canonical note is the true
union of both branches (no entry from either side dropped). Cosmetic dual-logging, not new
content; preserved for completeness and so future branches start from a genuine superset.

### MANAGER AUDIT OF v4 RELAY — overstatement caught + corrected (mine)
- Manager audited the v4 relay by CHECKING not trusting (correct discipline) and
  caught a real overstatement in MY relay README headline ('every [PROVED] now
  machine-checked'). He is RIGHT. Owned, not rebutted. Corrected:
  * README headline was inflated. BL-closure (Target 3) and put-native are NOT
    machine-checked. Fixed 00_README_relay.md with a CORRECTION block; added the
    canonical framing to integration note 6a.
- HONEST STATE (manager-verified + my agreement):
  * Unified-core Lean: A-D spine GENUINELY clean (zero sorry, zero custom axiom,
    real proofs — grep+source confirmed by manager). BL-closure STILL OPEN
    (stated hypothesis, out of scope this run; numeric+analytic backing only —
    was NEVER in scope, prompt declared it; Lean didn't regress, only my README
    cover line overreached). Put-native STILL OPEN (E2_put_regime_note := trivial,
    honest placeholder not a proof). E-series (smooth-pasting, Gamma->1) proved
    but in |Gamma|>1 regime the build FENCES OUT -> backs FORWARD STORY not
    shipped layer.
  * CANONICAL FRAMING (manager's, now in the note): shipped = exactly-replicable
    |Gamma|<=1; faithful-American = steep |Gamma|>1, NOT shipped.
  * COMPILE CAVEAT (both parties, same egress wall): Lean 4.28 installer +
    GitHub release assets not allowlisted -> neither manager nor I could
    independently compile. Both verdicts = source audit + inventory + dep grep;
    clean compile is trusted-from-prover, NOT reproduced. Paper must NOT claim
    'independently verified compile.' Action: one compile on a Lean4.28+mathlib
    box / CI.
- PACKAGE re-verified by manager, all intact: base build 6f606f52 (curve
  untouched), harnesses BYTE-IDENTICAL to v3 (passability carries over), reference
  impl byte-identical + passes both, v4 brief byte-identical to v3 (API-trap fix +
  build contract intact). Package = GO unchanged.
- DECISIONS (both agree): ship |Gamma|<=1 exact for v1 (|Gamma|>1 = future
  labelled bounded-error mode, wants BL-on-truncation bound FIRST — converges
  with the BL-closure open item); Gamma calibration sim->bootstrap->oracle,
  oracle tier own adversarial review.
- Merge discipline HELD: relay canonical note preserved all prior entries (no
  re-fork). Reply written: 08_reply_to_manager_correction.md (owns the README
  fix, agrees on all 4 points + 2 decisions). Re-bundled relay zip carries the
  corrected README + note + the reply.

### PUT-NATIVE RUN — placeholder RETIRED, real result (naive mirror is FALSE)
- Aristotle delivered PutWing.lean retiring E2_put_regime_note := trivial.
  Verified (source+inventory+grep; not independently compiled — egress wall,
  trusted-from-prover for the compile itself):
  * NO code sorry, NO axiom-polluters; only :=trivial left is modelling_knob_open
    (accepted doc-marker, backs nothing). E2_put_regime is now a REAL theorem
    bundling the put smooth-pasting; all PutWing theorems on base axioms only.
- THE RESULT — the put is NOT the naive Gamma->-Gamma mirror; proved exactly how:
  * D-series TRANSFERS DIRECTLY: operator/roots/Wronskian are algebraic in free
    Gamma, apply to Gamma<-1 once side-conditions discharged (put_gamma_ne_one,
    put_vAmerican_ne_zero — proved, not asserted). PD2_put_american_solves_iff
    etc. are genuine instantiations w/ hyps proved. Wronskian NEGATIVE for
    Gamma<-1 (reversed convexity) — stated, real.
  * E-series REFLECTS: put exercise boundary 0 < s* < K (exercise BELOW strike,
    dual to call s*>K). PE1_put_boundary_lt_strike + put_exerciseBoundary_pos
    proved. The s*<0 concern I flagged in the prompt was UNFOUNDED — numerator
    and denominator flip sign together, s* stays positive; he proved why.
  * THE STANDOUT ASYMMETRY (genuine negative on naive symmetry): call Gamma->1+
    limit DIVERGES to +inf (boundary recedes = no-early-exercise barrier limit);
    put Gamma->-1- limit CONVERGES to FINITE K/2 (PE1e_put_boundary_tendsto,
    real Tendsto via continuity). The wings differ qualitatively in limit
    geometry — so asserting put-by-symmetry would have been WRONG. This is the
    payoff of demanding a proof over accepting the placeholder.
- STATUS UPDATE: put-native E3/E-series gap CLOSED (was open). The other open
  item (BL-closure / Target 3) remains open (numeric+analytic only). Compile
  caveat unchanged (trusted-from-prover; needs Lean4.28+mathlib box for final
  certainty). The unified-core development now has both wings genuinely proved
  for A-E; only BL-closure measure-integral remains as stated-hypothesis.

### BL-CLOSURE (call wing) — manager INDEPENDENTLY verified the machine-checked proof
Research lead delivered BLClosure.lean closing the last open research item. Manager
audited the actual Lean + re-verified the integrals numerically (did NOT trust "PROVED").

SOURCE AUDIT:
  - Only :=trivial in the file is BL5_put_density_note (the HONESTLY-FLAGGED open put
    sliver — put needs a reflected density on [K,∞), not the naive mirror; consistent
    with the put-native K/2 reflect finding). The load-bearing call path has NO
    placeholder. ✓
  - blDensity K Γ θ = Γ(1−Γ)·θ^(Γ−1)/K^Γ — IDENTICAL to the density I hand-derived in
    the earlier BL-CLOSURE entry (my n(θ)=G(1−G)/K²·θ·(θ/K)^(G−2) simplifies to exactly
    this). blPointMass=Γ — my point mass. ✓
  - BL2_closure proof body is REAL: rw [BL2_otm_piece, BL2_capped_piece]; ring — both
    pieces built on genuine mathlib integral_rpow (integral_rpow_zero_to_K etc., real
    intervalIntegral). NOT a definitional dodge. BL2_vAmerican unfolds + applies it. ✓
  - BL4_density_neg (Γ>1 ⇒ density<0) = the formal |Γ|≤1 fence the build already
    enforces. ✓

NUMERIC RE-VERIFICATION (my own quadrature, log-sub for the θ→0 spike, K=1.3, six
(Γ,sNorm) points across Γ∈(0,1)): every Lean identity holds to ~1e-10:
  - BL2_capped_piece = (1−Γ)(sNorm/K)^Γ ✓
  - BL2_closure = (sNorm/K)^Γ EXACTLY ✓
  - BL1_smooth_mass = 1−Γ; +point-mass Γ ⇒ total = 1 ✓
  ⇒ The machine-checked Lean proves EXACTLY the identities I derived by hand. Two
    independent derivations (my calculus + his Lean) agree completely.

AXIOM INVENTORY: whole development (A–E, put PD/PE, BL) on base axioms only
  (propext/Classical.choice/Quot.sound); grep for non-base axiom empty. ✓

PACKAGE: byte-identical (base 6f606f52, harnesses 1c8cec75 / b915f204 confirmed).
  Nothing in this delta touches the build. The intern prices off the closed form
  (always proved); BL-closure proves it IS a barrier basket — paper/replicability, not
  runtime. ✓

VERDICT: call-wing BL-closure CLOSED and manager-verified (machine-checked modulo the
  shared compile caveat). "Exactly replicable for 0<Γ<1" moves from hand-verified to
  machine-checked. The LAST open research item on the call wing is closed.

REMAINING (neither blocks the build):
  1. Put-wing BL-closure — reflected density on [K,∞), honestly flagged True, NOT faked.
     Paper-completeness; put OTM value + funding already proved; build fences |Γ|≤1.
  2. Independent compile — the one open rigor thread for the WHOLE development (call BL
     included). Egress wall blocks Lean 4.28+mathlib for both parties. Everything is
     source-audit + real-proof-body + axiom-inventory + (for BL & put-limit) my own
     numeric/algebraic check; compile trusted-from-prover. A CI run converts all of it
     to "independently compiled." THE single outstanding rigor action.

BRANCH-POINT: research lead branched this from the reconciled 0a0efd51 (verified clean
  superset — nothing of mine dropped), added BL + reconciliation-closed entries. I
  adopted his note (07c51017) as base and appended this audit. New canonical below.

### FRESH-GRUNT PACKAGE v5 ASSEMBLED (prior context preserved separately)
On manager's call (research track closed — call BL-closure proved + verified), assembled
a comprehensive standalone package for a NEW implementation grunt; prior grunt's context
preserved in a separate backup bundle.

NEW PACKAGE: american_layer_grunt_package_v5.zip (6 files, self-contained, zero prior
context needed):
  - START_HERE.md — full onboarding for a grunt with NO context (project in 1 para, task
    in 1 sentence, the loop, non-negotiables, out-of-scope).
  - GRUNT_BRIEF.md — the task (= my verified v3/v4 brief with TWO stale-rationale lines
    corrected: |Γ|>1 fence now cites the PROVED BL4 boundary not "pending Target 3"; put
    note now says put-native PROVED not "call-form only"). Build task BYTE-UNCHANGED —
    formulas, API-trap correction, 2·Γ, fences, DoD, STOP-and-flag all verbatim.
  - temporal_mvp_v24_rebase_fixed.html — clean base 6f606f52 (build from clean).
  - regression_harness_v2.js (b915f204) + american_layer_harness.js (1c8cec75) — the two
    VERIFIED-PASSABLE graders, byte-identical to what I verified.
  - integration_note.md (d94b2375) — latest, with the shipped-vs-faithful framing callout.
  FINAL CHECK before sealing: both graders exit 0 against the held-back reference impl. ✓

BACKUP BUNDLE: american_layer_BACKUP_context.zip (preserves prior context, NOT for the
new grunt):
  - v25_reference_ANSWER_KEY.html (f0219149) — the reference impl, deliberately HELD BACK
    from the grunt package (grunt builds blind). For adjudication / diff.
  - session_tree_note.md — full canonical record.
  - grunt_brief_v3_ORIGINAL.md — pre-BL-update brief, for history/diff.
  - BLClosure.lean + AXIOM_INVENTORY_updated.md — machine-checked backing.

DESIGN CHOICES (unchanged from prior rounds, restated for this package):
  - Grunt builds BLIND: reference impl is NOT shipped to the grunt (it's the answer key;
    the grunt does the real in-band integration the bare exports don't exercise).
  - Both harnesses = the contract; verified passable so a failing check = grunt's bug.
  - STOP-and-flag, never force-pass.

STATUS: package READY TO HAND TO A FRESH GRUNT. Build de-risked (passable grader, fixed
  API trap, machine-checked spec). Only outstanding item anywhere = the independent Lean
  compile (rigor thread, blocks nothing). Prior grunt context safely preserved.

### AMERICAN TOUCHPOINTS — round-note to research lead drafted (pre-grunt-prompt)
Worked the per-touchpoint treatment from the integration note (§2/2a/2b/3/4/5). The
table is settled FROM HIS MATERIALS (not guessed):
  - AMM tx: effective-strike ray, θ_eff frozen @ swap instant, BOTH aggregation layers
    (American→1 eff-barrier, then same-side inner+outer→1) ⇒ 2 swaps (1/side).
  - Portfolio value/MTM + settlement: effective-strike ray, θ_eff LIVE-recomputed each
    query (state-dependent, re-pegs with spot — §2a "the one subtlety"), Layer 1 only,
    up to 4 legs.
  - Funding: HYPERBOLIC ANGLE (rapidity u=log(sNorm/K)), NOT the ray — §4 proves the
    naive θ_eff-barrier funding gives wrong coeff (F2) and the drift patch doesn't close
    it (E5); correct form κ·Γ·N·(sNorm/K)^Γ·(sNorm−1)/sNorm·dt.
  KEY CORRECTION (user's instinct was right): value is NOT a frozen effective strike;
  θ_eff(sNorm) re-pegs live — caching it at open = bug. This becomes the #1 harness test
  (open, MOVE spot, re-query, assert value tracks new spot).

THREE ITEMS to research lead (round_note_to_research_lead_american_touchpoints.md):
  #1 FUNDING MAGNITUDE (hard blocker) — framed as confirm-2Γ-hypothesis + the arb-surface
     reason (per the spinoff/product guidance): American & barrier legs fund on the SAME
     pool; shipped fundingPerStrike hardcodes ×2; plain-Γ American = relative mispricing
     between leg types = arb surface. So 2Γ (consistency-with-shipped) is almost certainly
     intent; §4's bare κ·Γ read as per-unit elasticity before the inherited ×2. Ask him to
     confirm or correct (harness certifies whichever we pick — can't self-correct).
  #2 PUT MOTION-RATE — pre-checked PutWing.lean MYSELF: PD+PE series proved (static
     geometry) but NO put motion-rate lemma (no PE3, no d(logθ_eff)/d(log sNorm)=1+Γ).
     So the §2a AUDIT FLAG is STILL LIVE — put re-peg rate 1+Γ remains symmetry-inferred.
     Genuine open item, not a confirm. BUT not a build blocker: brief recomputes θ_eff
     from live formula each query (doesn't hardcode the rate), so shipped code is correct
     regardless; it's a proof-rigor gap. Ask: PE3 planned, or stays inferred for v1?
  #3 CLUBBING FENCE — product decision MADE our side (fence it, single-American v1; user
     owns this). Only ask him the one-bit safety question: can two American legs reach the
     existing 4-barrier netting path and get silently mis-netted BEFORE the single-American
     fence rejects them? Fence-placement, not feature-scope.

Two of three are "here's our finding, confirm it" (#1, #2-impact); #3 is one bit. Keeps
the reasoning burden on our side. Only #1 hard-blocks prompting the grunt.
STATUS: round-note ready to send. Grunt prompt waits on #1 (funding magnitude) resolution.

### AMERICAN TOUCHPOINTS — research lead replied; manager verified; ALL THREE RESOLVED
Research lead answered all 3 against artifacts. Manager INDEPENDENTLY verified the
load-bearing claims (didn't accept lemma citations or the #3 structural claim on trust).

#1 FUNDING MAGNITUDE → RESOLVED: 2Γ. Manager checked the cited Lean (Funding.lean):
  - C1_elasticity_eq_gamma — REAL deriv proof, elasticity=Γ (§4's κ·Γ). ✓
  - C1_elasticity_s_coords, C2_otm_call/put_elasticity (±1 at Γ=±1) — REAL, derived. ✓
  - C3_ratio_shipped_to_unit: (2Γ)/Γ=2 via field_simp — REAL, the actual ×2 proof. ✓
  - ⚠ BUT C3_shipped_effective_coeff (the name he CITED for the coeff) is "2Γ=2Γ := rfl"
    — a TAUTOLOGY, proves nothing. The real content is the ADJACENT C3_ratio_shipped_to_unit.
    Conclusion (2Γ) is correct + genuinely Lean-grounded; only the CITATION was wrong.
    → PAPER must cite C1_elasticity_eq_gamma + C3_ratio_shipped_to_unit, NOT C3b (rfl).
  Decision: ship 2Γ. Grounding: C1=Γ elasticity (geometry, forced) + ×2 = engine
  convention inherited for cross-leg funding consistency (plain-Γ American on a pool with
  ×2 barriers = relative mispricing = arb surface). [MODEL] tag preserved: 2Γ is
  constrained-correct GIVEN "inherit the engine, don't touch the curve" — not a coin flip,
  not a bare theorem. Reference impl already encodes gammaEff=2*gamma. HARD BLOCKER CLEARED.

#2 PUT MOTION-RATE → confirmed OPEN on BOTH wings (he sharpened my finding): θ_eff defined
  + value proved (A1_*_otm_value) on both wings, but NO motion-rate lemma on either
  (the old E3_scaling didn't carry into the delivered project). NOT a blocker — manager +
  lead both confirmed the live path evaluates the θ_eff FORMULA each query (americanThetaEff),
  correct by A1; no hardcoded rate constant. Proof-completeness gap only.
  DECISION: TAKE his offer — dispatch the one-line PE3/E3 pair (d(logθ_eff)/d(log s)=1∓Γ
  by inspection on the explicit power). Closes the LAST symmetry-inferred item in the whole
  development; cheap rigor; doesn't gate the grunt (can land in parallel).

#3 CLUBBING FENCE → SAFE, manager VERIFIED in code (not reasoned): extracted
  legPriceAmerican/fundingAmerican/americanThetaEff bodies from v25_reference.html and
  grepped for band/netting calls — ALL THREE STANDALONE (zero openBand/closeBand/
  executeBand/club/carve/tradeUpdate calls). The American exports are a separate path that
  never receives a band leg; two Americans CANNOT reach the 4-strike netting path because
  the path doesn't take them as input. Not a placement gamble — structural separation
  confirmed. Bonus: |Γ|≤1 fence + gammaEff=2*gamma already live in the reference impl.
  Product decision (single-American v1, fence multi) owned by user; "fence it" = "don't
  build the Americans-netting path," which the reference impl already honors.

NET: all 3 resolved. #1 cleared (2Γ, citation-corrected). #2 open-but-not-blocking + a
  lemma dispatched to close it. #3 verified safe in code. Build contract unchanged.
  → CLEARED TO PROMPT THE GRUNT. Remaining harness add (mine): the live-recompute test
  (open → move spot → re-query → assert value tracks new spot; cached-θ_eff fails) — the
  thing the per-touchpoint table established. Write + verify that before sealing the prompt.

### [MERGED FROM RESEARCH-LEAD BRANCH — motion-rate round] his parallel logs
The two entries below are the research lead's own logging of the funding-citation
correction and the motion-rate run. They cover the SAME events as my "AMERICAN
TOUCHPOINTS — ALL THREE RESOLVED" entry (the C3 rfl catch + #2 greenlight) and the
motion-rate delta I verified this round. Folded in verbatim so this canonical note is
the true union of both branches — no entry from either side dropped.

### FUNDING CITATION CORRECTION (manager caught my rfl mis-cite) + #2 lemma greenlit
- Manager read Funding.lean and caught that I cited C3_shipped_effective_coeff as
  backing for the 2*Gamma funding coefficient. VERIFIED him against source: he is
  RIGHT. C3_shipped_effective_coeff is literally '2*Gamma = 2*Gamma := rfl' — a
  TAUTOLOGY, the exact X=X dodge forbidden in every prompt. My cite was wrong;
  owned (not rebutted), same as the v4 README overstatement.
  * REAL backing (verified genuine): C1_elasticity_eq_gamma (real deriv on
    exp(Gamma*u)) = Gamma is the value-elasticity; C3_ratio_shipped_to_unit
    ((2Gamma)/Gamma = 2 via field_simp) = the shipped x2 ratio. PAPER must cite
    C1 + C3_ratio, NOT C3_shipped_effective_coeff. Decision (ship 2Gamma)
    UNAFFECTED — math is fully there, I cited the wrong C3 of the pair.
  * CLEANUP FLAG: the rfl tautology C3_shipped_effective_coeff should be removed
    from Funding.lean (or replaced by C3_ratio) so it can't be mistaken for a
    proof. Add to the next Lean housekeeping pass.
- #1 RESOLVED: 2Gamma shipped, cite corrected. Hard blocker cleared.
- #2 GREENLIT by manager: dispatch the E3/PE3 motion-rate pair (one line per wing,
  d(log theta_eff)/d(log s)=1∓Gamma by inspection on the explicit power). Retires
  the §2a flag on BOTH wings = last symmetry-inferred item in the whole dev. Lands
  in parallel, doesn't gate grunt. Prompt being written.
- #3 verified safe BY MANAGER TOO (extracted the 3 American exports, grepped each
  for band/netting calls — all standalone, zero openBand/closeBand/executeBand/
  club/carve/tradeUpdate). Structural separation confirmed both ends.
- GREENLIT TO PROMPT GRUNT. Manager's one harness add before sealing: live-recompute
  test (open American -> move spot -> re-query -> assert value tracks new spot; a
  cached-theta_eff impl fails it). The per-touchpoint table item the current harness
  doesn't yet exercise. Manager owns it.
- CANONICAL: manager sending 2942-line note; next delta branches from THAT per rule.

### MOTION-RATE (E3 call + PE3 put) — PROVED. §2a flag CLOSED both wings. C3 tautology fixed.
- Aristotle delivered MotionRate.lean (the #2 lemma manager greenlit). Verified
  against source (real-proof-body read + axiom inventory; not independently
  compiled — egress wall, trusted-from-prover):
  * E3_call_motion_rate: deriv(fun u => log(thetaEffCall(exp u) K Γ)) u = 1 - Γ.
    GENUINE — deriv.log then rpow_sub/rpow_neg algebra. NOT the forbidden
    1∓Γ=1∓Γ tautology.
  * PE3_put_motion_rate: same, = 1 + Γ. Proved INDEPENDENTLY (rewrites θ_eff as
    exp((1+Γ)u)·K^(-Γ), differentiates) — not riding the call mirror.
  * Both on base axioms (inventory confirms); no polluters; no code sorry; only
    trivial = the 2 honest doc-markers (modelling_knob_open, BL5_put_density_note).
- SIGNIFICANCE: the θ_eff re-peg RATE was the LAST symmetry-inferred item in the
  entire development (was inferred on BOTH wings — old E3_scaling never carried in).
  Now machine-checked both wings. The §2a audit flag is CLOSED. Pre-derived myself
  (sympy: call 1-Γ, put 1+Γ) before prompting, so prover verified not searched.
- BONUS — C3 TAUTOLOGY FIXED AT SOURCE: the bare '2*Γ=2*Γ := rfl'
  (C3_shipped_effective_coeff) that the manager caught is GONE. Now proves the real
  content (2Γ)/Γ=2 via field_simp, w/ a comment noting it was formerly a tautology
  and pointing to C3_ratio_shipped_to_unit. The paper-citation hazard is resolved in
  the Lean itself. NOTE for paper: cite C1 + C3_ratio (or the fixed C3); the funding
  coefficient backing is now all-genuine.
- DEVELOPMENT STATUS: now ZERO symmetry-inferred items. Proved: A-F, both wings
  (put PD/PE), BL-closure (call), motion-rate (both wings). Honest opens unchanged:
  put-wing BL-closure (reflected density, flagged), independent compile (egress wall).
- CANONICAL NOTE CAUTION: this entry appended to MY working copy (was 2803). NOT
  declaring it the branch point — manager's promised 2942-line note has NOT landed
  and must be superset-checked first (comm/md5) per the reconciliation rule. The
  bounce-back zip carried a STALE 2774 copy (my own older send), confirmed strict
  subset of mine; ignored for branching. Next branch point = reconcile my latest vs
  his 2942 when it arrives.

### FINAL PACKAGE — manager review: 2 stale-claim inconsistencies CAUGHT + fixed
Research lead submitted american_layer_FINAL_package (10 files, "research-complete").
NOTE: the turn's narrative claimed the manager had already assembled+verified it — that
was NOT done; manager verified independently this pass rather than echo the claim.

VERIFIED INTACT (md5 + re-run, not trusted):
  - base 6f606f52, regression b915f204, american 1c8cec75, v25_reference f0219149,
    canonical 3117cff4 — ALL match manager-verified values. ✓
  - v25_reference STILL passes both graders (regression 16/16, american 8/8, exit 0/0)
    — re-ran. ✓
  - integration note's two tag UPGRADES present + correct (BL-closure §6 → machine-
    checked call wing line 285; motion-rate → [PROVED both wings] line 146). ✓

TWO STALE-CLAIM INCONSISTENCIES CAUGHT (proof-status drift; neither build-breaking):
  1. Grunt brief (README.md) shipped was the V3 brief (md5 3fb33862), NOT my v4
     (613568c2). README_FINAL claimed "README unchanged" — true vs v3, but v3 still
     reads "|Γ|>1 pending Target 3" + "put rate symmetry-inferred (call-form only)" —
     BOTH now PROVED, contradicting the package's own headline. Diff confirmed ONLY the
     two FYI/rationale blocks differ; build task (formulas, API-trap fix, fences, DoD,
     blob lengths) byte-identical. FIX: swapped in v4 brief.
  2. Integration note SELF-CONTRADICTED: §2 line 146 "[PROVED — both wings], audit flag
     CLOSED" but the old ⚠ AUDIT FLAG block ~10 lines below still said put rate "INFERRED
     BY SYMMETRY, not proved." FIX: replaced stale block with ✓ AUDIT FLAG CLEARED
     (explains the independent PE3 proof). Note now internally consistent.

CORRECTED PACKAGE: american_layer_FINAL_package_CORRECTED.zip (11 files: v4 brief, fixed
  note, + START_HERE orientation added, + corrected cover note documenting both fixes).
  Full contract re-verified intact after the swap; reference still passes both graders.

STATUS: package research-complete + now internally consistent. Build GO. Still mine
  before sealing: the live-recompute harness test (open→move spot→re-query→assert tracks
  new spot; cached-θ_eff fails). Opens unchanged (put-wing BL-closure; independent compile).

### LIVE-RECOMPUTE TEST written + validated; PACKAGE SEALED
Research lead's review-back: confirmed finding-1 withdrawal on his own evidence (no
613568c2 anywhere his side — never had v4 brief; un-relayed update, not his bug);
owned finding-2 (note self-contradiction), FIXED it himself + reissued
corrected_integration_note.md (route-through-author — manager did NOT overwrite).
Manager VERIFIED his corrected note: stale audit-flag block replaced with ✓ CLEARED
(the one remaining "INFERRED BY SYMMETRY" is the historical ref INSIDE the cleared
block, past-tense — fine); two real tag upgrades intact. Contradiction resolved.

LIVE-RECOMPUTE TEST (manager's owned item) — written + VALIDATED both directions:
  - Built L_live_value + L_live_value_put: open American → move spot 12% → re-query →
    assert V == N·mark(wing, θ_eff(sn_new), sn_new), recomputed live (+ powerlaw cross-
    check). Both wings.
  - VALIDATED it PASSES the correct reference impl (all 10 green, exit 0).
  - VALIDATED it CATCHES the bug: built a deliberate stale-V variant (θ_eff live but V
    cached at open) — it passed ALL 8 ORIGINAL checks (proving the gap was real, not
    hypothetical) and FAILS exactly the 2 new checks (nothing over-broad). This is the
    property the user's instinct flagged rounds ago: value must re-peg live; caching = bug.
  - New american harness md5 8ec9efd4 (was 1c8cec75) — deliberate verified grader update,
    re-pinned in brief + package. Regression harness UNCHANGED (b915f204), still green.

SEALED PACKAGE (american_layer_SEALED_package.zip) assembled per the agreed endgame:
  frozen contract (base 6f606f52, regression b915f204, ref f0219149) + manager's v5 brief
  (v4 rationale + live-recompute callout, DoD now 10 checks) + research lead's corrected
  note + complete Lean + pristine canonical 3117cff4 + the new 10-check grader + START_HERE.
  Full verification: both graders exit 0 on reference; note internally consistent; canonical
  pristine. READY FOR THE GRUNT.

CANONICAL: pristine 3117cff4 stays the in-package branch point. This entry + prior FINAL-
  review log are in the manager working-canonical (supersedes 3117cff4); next reconciliation
  branches from 3117cff4 per rule. Research lead's review+note-fix is his next entry, also
  branched from 3117cff4 — will need the usual bidirectional merge.

### INTERN v25 BUILD — verified: graders GREEN but IN-BAND INTEGRATION MISSING
Intern (formerly "grunt" — he dislikes the term) returned temporal_mvp_v25_american.html
fast. Manager verified rather than trust the speed.

PASSED (real, verified):
  - File-safety: blobs byte-intact (webp 273864, svg 5168), 3 scripts parse. md5 5e211024.
  - Regression harness: 16/16 ALL PASS, exit 0 (curve untouched).
  - American 10-check harness: ALL PASS incl L_live_value + L_live_value_put (so NOT
    caching θ_eff/V — recomputes live; the property the new test guards).
  - NO existing signature touched (sig diff base→intern empty — API-trap discipline held).
  - The 3 functions correct + match spec: americanThetaEff wing-correct (call sNorm^(1−Γ)
    K^Γ, put sNorm^(1+Γ)K^(−Γ)); legPriceAmerican fences |Γ|≤1/Γ≠0/K>0, live getSNorm;
    fundingAmerican = existing form × gammaEff=2*gamma, live S. All right.

THE GAP (harness can't see it — caught by independent inspection):
  The American layer is ONLY three standalone exports (lines 2092-2138). It is NOT wired
  into the engine:
  - legPrice dispatcher has ONLY barrier/spread branches — NO american branch. Nothing
    in the live trade path returns mode:'american' except the new functions' own returns.
  - NO UI: no Γ input, no instrument-type selector, no way for a user to CREATE an
    American position.
  ⇒ The intern delivered EXACTLY the reference-impl level (bare exports that satisfy the
    harness adapter, which calls Engine.legPriceAmerican directly) — but NOT the in-band
    integration the brief asked for ("instrument record, legPrice dispatch wiring, UI —
    which the bare exports don't exercise; the harness tests the result, not the path").
    This is the exact gap the package design anticipated. Harness green ≠ job done.

VERDICT: send back. The math/exports are correct and verified — good foundation — but the
  build is incomplete: an American instrument exists in the engine API yet is unreachable
  through dispatch or UI. Next iteration must (1) add the american branch to legPrice
  dispatch (kind:'american' or equivalent), (2) add the UI control to create (K,Γ) legs,
  (3) ensure portfolio/MTM/funding/settlement route American legs through the live-
  recompute path. Harness stays the contract; these are the integration the harness
  adapter bypasses. NOT a force-pass situation — graders are honestly green; the brief
  scope simply isn't met.

### INTERN v25 PASS 2 — reachability CLOSED; one spec-deviation to ratify
Intern returned temporal_mvp_v25_american_2.html (md5 2eafff1b, 497869 bytes, +~15KB vs
pass1 — real integration work). Manager verified the path, not just the graders.

VERIFIED PASS:
  - File-safety clean (blobs 273864/5168 intact, 3 scripts parse).
  - Both graders green: regression 16/16 exit 0, american 10/10 exit 0 (incl L_live_value).
  - NO existing signature changed (full comm -23 base→intern2 empty; openBand +
    executeFourStrikeSpread present w/ identical sigs — earlier "missing" was a regex
    false alarm).
  - DISPATCH NOW WIRED (the pass-1 gap): legPrice has an american branch — leg tagged
    {kind:'american',K,gamma} in the existing theta_inner slot, signature UNCHANGED,
    numeric theta_inner falls through to barrier/spread exactly as before (why the curve
    stays 16/16). Clean, non-invasive dispatch.
  - REACHABLE END-TO-END: previewAmerican (prices THROUGH the dispatcher, reads UI fields
    am-wing/am-K/am-gamma/am-notional, shows fence rejections), openAmerican (creates
    record, engine-fenced reject-not-clamp), americanLegValue (re-prices via dispatcher =
    live θ_eff/V), closeAmerican (marks live at close, P&L=(V_close−V_open)·oracle +
    funding). A user can create/value/close an American through the normal flow.
  - LIVE-RECOMPUTE genuine: none of openAmerican/closeAmerican/americanLegValue/
    fundingAmerican touch the pool (no tradeUpdate/rebase/pool mutation) — value
    re-derives from live sNorm each query. Curve provably untouched (regression green).

THE ONE JUDGMENT CALL (defensible, but a spec deviation — manager must ratify):
  Intern implemented the American as a MARK-TO-MARKET position that does NOT counter-swap
  the AMM pool, explicitly departing from integration_note §2a/§3 (single-leg swap at
  θ_eff). His documented reasoning: a single-leg swap-based open moves sNorm favorably for
  that leg = instant arb; the swap form is neutral only for the 2-leg cash-conserving band.
  ASSESSMENT: reasoning is SOUND — matches our canonical finding (composite-ray/swap is
  inherently 2-leg cash-conserving; touchpoint table: AMM-tx both-layers, settlement
  layer-1 per-leg). He flagged it in-code rather than routing silently. Good judgment.
  BUT it changes the settlement model from spec (swap-based) to MTM-based for the single
  American — a real product/architecture decision. For v1 (single American, no clubbing,
  curve-untouched priority) MTM is arguably the SAFER choice (no instant-arb, curve
  provably untouched). Manager leaning: ACCEPT for v1, with the deviation explicitly
  recorded + integration note updated to match (so spec and code agree); the swap-based
  single-leg open is revisited only if/when the 2-leg band path needs it.

VERDICT: this is a PASS on reachability + correctness + discipline. The only open item is
  ratifying (and documenting) the MTM-vs-swap deviation — a decision, not a defect. Not a
  force-pass; graders honestly green AND the path genuinely works this time.

### INTERN v25 PASS 3 — settlement fix VERIFIED; one stale UI label only
Intern returned temporal_mvp_v25_american_3.html (md5 75f90692, 499147 bytes). Manager
verified the actual fix, not just graders.

VERIFIED PASS:
  - File-safety clean (blobs 273864/5168, 3 scripts parse). Both graders green (16/16,
    10/10). No existing signature changed (full comm -23 empty).
  - THE FIX IS REAL — separate MTM settlement path REMOVED, American now settles through
    the SHARED transaction path. Verified by source chain:
    * openAmerican → Engine.executeLeg(pool,'buy',...) → commits state.pool=leg.newState
      (open now MOVES the pool; records dy_open/dx_open).
    * closeAmerican → americanSettle(a,true) → executeLeg(...,'sell',...) reverse swap,
      commits new state, captures dy_close/dx_close.
    * executeLeg (read from source) = legPrice dispatch + REAL tradeUpdate(state,dy) swap,
      returns newState+dy. The genuine pool-impacting AMM move.
    * _amPnL = -((dy_open+dy_close) + oracle*(dx_open+dx_close)) — P&L from ACTUAL SWAP
      DELTAS. The old (V_close-V_open) mark-to-market formula is GONE.
  - ECONOMICS CORRECT: instant open+close now nets the in/out slippage cost (both legs are
    real tradeUpdate swaps; pool doesn't return to exact origin), NOT zero. The MTM "round
    trip is free" defect is fixed. (Couldn't drive lifecycle fns from VM — they're
    module-scoped, good encapsulation — so verified via source chain + executeLeg body
    rather than black-box exec; the swap-delta P&L formula is unambiguous.)
  - SHARED-PATH PRINCIPLE honored: no american-specific transaction machinery; reuses
    executeLeg/legPrice/tradeUpdate exactly like barrier/spread. Only american-specific
    code is pricing (θ_eff/power payoff), fences, dispatch tag — as instructed.

ONE BLEMISH (trivial, not behavior): stale UI label line 1224 still reads "marked live
  against the curve (no pool swap)" — contradicts the code, which now swaps. The nearby
  code comment (2647) is CORRECT (explicitly disclaims MTM, says realized P&L = the two
  swaps). So: one stale label to fix, no code change.

VERDICT: PASS on the settlement fix. Only the stale UI label needs correcting. Once that's
  fixed this is shippable as v25. Not force-pass — graders green AND the swap path is
  genuinely wired AND the economics verified via source.

### PASS 3 VERDICT CORRECTED — settlement skips carved-slice convention (manager under-verified first)
Manager's first pass-3 read said "swap fixed, one stale label, shippable." That was
UNDER-VERIFIED — caught when Rohan asked whether the american respects the same
OTM-cash-prorated-to-perp-equity / ITM-direct / total settlement convention as everything
else (not american-specific). It does NOT. Verified:
  - closeBand settles via: OTM leg→AMM swap, ITM leg→settle-to-cash; raw_net (carved-perp
    units) → dollars by raw_net × carvedEquityAtClosure (carvedEntryEquity+attributablePnL);
    then L0 amplification + club-equity floor.
  - openBand carves a real slice at entry: f_N, L0=f_E/f_N, frozen carved={carvedNotional,
    carvedEntryEquity, entryPerpMark}, physically removed from the perp club.
  - openAmerican records NONE of this (only {oracle,sNorm,θ_eff,m,V_open,dy_open,dx_open}).
    closeAmerican therefore has no slice to prorate against → falls back to RAW ORACLE-CASH
    (_amPnL = -((dy_open+dy_close)+oracle*(dx_open+dx_close))). Tightly-scoped probe of the
    american block: ITM/OTM split ABSENT, carved-equity prorate ABSENT, L0 ABSENT, club
    floor ABSENT.
  - ROOT: the american is PRICED as fraction-of-perp ((sNorm/K)^Γ × base) — same convention
    as bands — but never OPENED against a carved slice, so the fraction has nothing to be a
    fraction OF at settlement. Pricing end matches, settlement end doesn't. (Rohan's point:
    "same carved slice everything — that's why it retains fraction-of-perp pricing." Exactly.)
  - SWAP-PATH FIX (pass 3) is still correct + stays; pricing stays. The new requirement is
    downstream: open against a carved perp slice (mirror openBand), settle through closeBand's
    convention (OTM/ITM, carvedEquityAtClosure proration, L0, club floor) — reuse closeBand
    helpers, no american-specific settlement; single-leg = the no-paired-leg case.
  - Lesson (manager): "passes graders + swap wired" ≠ "settles per the established convention."
    Should have checked the units/convention chain before saying shippable. Caught by Rohan's Q.
  - Note rewritten: review_v25_pass3_for_intern.md now requires the carved-slice open +
    convention settlement (+ the trivial stale UI label). NOT shippable until that lands.

### INTERN v25 PASS 4 — carved-slice settlement convention CLOSED. APPROVED.
Intern returned temporal_mvp_v25_american_4.html (md5 97789822, 505453 bytes). Manager
verified the settlement-convention gap (the one Rohan's Q surfaced) is now closed — and
checked the convention/units chain this time, not just swap wiring.

ALL VERIFIED:
  - File-safety clean (blobs 273864/5168, 3 scripts parse). Both graders green (16/16,
    10/10). No existing signature changed (full comm -23 empty).
  - CARVE AT OPEN (was missing): openAmerican(wing,K,gamma,N,clubSide) now carves a real
    slice off the perp club — SAME formulas as openBand: f_N=N/club_notional_asset,
    L0=f_E/f_N, frozen carved={carvedNotional,carvedEntryEquity,entryPerpMark}, bundle
    physically removed from club. Opens through shared executeLeg→tradeUpdate swap.
  - SETTLE THROUGH CONVENTION (was raw cash): _amClose values via legValueUnified (shared
    Job-1 fn), splits ITM/OTM via legIsITM (OTM→AMM reverse swap, ITM→settle-to-cash no
    swap), Job-2 carved-perp→dollars via carvedEquityAtClosure=carvedEntryEquity+
    attributablePnL (attributablePnL=cN*(pmNow-ePM)/ePM — IDENTICAL to closeBand), then
    L0 amplification + club-equity floor (raw_net>0 && club.equity<=0 → 0). Bundle returned
    to club on commit.
  - Raw-cash _amPnL GONE (grep empty). Job-2 formulas byte-match closeBand. Shared helpers
    (legValueUnified/legIsITM/markEff) REUSED not copied (1 def each).
  - Single-leg adaptation (documented + sound): V_at_open priced at POST-open pool ==
    Y_close basis, so instant open+close → raw_net=0 (single-leg analog of band cash-equal
    open). No pump.
  - Stale UI label from pass 3 ("no pool swap") FIXED.

VERDICT: APPROVED as v25. Carved-slice everything: priced as fraction-of-perp AND opened
  against a carved slice AND settled as a fraction of that slice's closing equity with L0 +
  club floor + ITM/OTM split — the full convention, shared machinery, no parallel path.
  The 4-pass arc (1: unwired exports → 2: wired but MTM → 3: swap-path fixed but raw-cash
  settle → 4: carved-slice convention) is complete. Not force-pass: graders green AND every
  convention element verified in source against closeBand.

OPEN (non-blocking, manager's side): two harness blind spots this arc exposed — (a) round-
  trip must cost slippage (MTM caught only by eye in pass 2/3), (b) settlement must prorate
  through carved-perp equity not raw cash (caught only by Rohan's Q in pass 3). Worth adding
  both as harness assertions so "green" covers them next time. NOT required for v25 ship.
 
### HARNESS HARDENED — two blind spots from the v25 arc closed (S1, S2)
After v25 approval, added the two checks that would have caught passes 2 & 3 by machine
instead of by eye:
  - S1_roundtrip_costs_slippage: open+close via Engine.executeLeg must MOVE the pool on
    both legs AND not return to origin (real tradeUpdate swaps). Catches the MTM regression
    (pass 2/3): the cachedV/MTM variant FAILS S1. Passes approved v25.
  - S2_settles_via_carved_equity: drives the BUILD's real settlement path
    (Store.openAmerican carves a slice → Store.americanClosePreview = _amClose(a,false),
    non-committing) and asserts trader_payout RESPONDS to carvedEntryEquity and to L0
    (perturb each, re-preview). Catches the raw-cash regression (pass 3): a variant whose
    payout = raw_net*oracle (ignores carved equity/L0) FAILS S2. Passes approved v25.
  VALIDATED BOTH DIRECTIONS (the discipline): both pass the correct build (12/12 exit 0),
  and each FAILS the specific bad variant it targets, and is NOT over-broad on the good
  build. Built two deliberate bad variants (v25_cachedV_BAD = MTM; v25_rawcash_BAD =
  payout ignores carved equity) to prove it. S2 now exercises the real Store close path
  (reachable: openAmerican/closeAmerican/americanClosePreview exported on Store, _amClose
  in script[1]) — NOT a re-derivation, so it tests the build's settlement not a restatement.
  Setup needs Store.addPerp seed + small N (0.01) to avoid over-carve.
  New american harness md5 4570b32b5a510dbfd970a737f6506b32 (12 checks). Regression harness UNCHANGED (b915f204).
  This closes "green ≠ done" for both the swap-realness and the carved-equity-settlement
  properties — the two things that took a human (and Rohan's Q) to catch this round.

### PACKAGES REFRESHED to 12-check harness (standing contract)
Baked the hardened grader into both handoff packages so the next build works from the
strict test, not the old weak one (the thing that allowed the 4-pass cycle):
  - american harness 4570b32b (12 checks) replaces 8ec9efd4 (10) in both packages.
  - Brief bumped v5→v6 (md5 b3abe556): DoD now "12 checks", S1/S2 described in plain terms
    (S1 open+close really swaps the pool + costs slippage; S2 settlement pays out as a
    fraction of the carved slice — responds to carved equity & L0).
  - american_grunt_NEW.zip (6 files, flat, builds-blind): refreshed. No ref/lean/canonical
    leak; graders passable (ref + approved v25 both exit 0).
  - american_layer_SEALED_package.zip (record): refreshed + ADDED the approved real build
    temporal_mvp_v25_american_APPROVED.html (md5 97789822) alongside the reference; both
    pass the 12-check grader in-package. Regression harness unchanged (b915f204).
Approved v25 unaffected (already passes 12/12). This makes "green = done" the standing
contract for the next instrument.

### TESTER PACKAGE assembled — FE/UX lifecycle run + chart-gap hunt
Rohan asked for a testing-intern package: drive the whole American lifecycle through the
FE/UX, screenshots, PDF run report. Assembled american_TESTER_package.zip (3 files):
  - temporal_mvp_v25_american.html (approved build, md5 97789822).
  - TEST_BRIEF.md: context (what the american is), the UI surface (verified DOM ids:
    am-wing/am-K/am-gamma/am-notional/am-club, am-prev-*, am-warn-area, btn-open-american,
    data-close-american), the lifecycle (seed perp → preview → fence-reject → open → spot
    move → funding → OTM close → ITM close → round-trip), the EXPECTED CHART table, the
    gotchas (seed-perp-first, over-carve, setOracleUI-not-direct via #kpi-oracle change,
    engineMP via page.evaluate not Spot KPI, reject-pattern in #am-warn-area), and the PDF
    deliverable spec (JSON runlog → consolidated PDF, screenshots ~150 DPI / JPEG q72).
  - fe_smoke.spec.js: Playwright starter (happy path + chart capture + engineMP read),
    selectors verified against the build (#btn-open-american, #kpi-oracle change event).

CHART EXPECTATION (Rohan's: all graphs change in values/shape EXCEPT graph 1):
  | 1 canvas-curve  : no shape change (AMM invariant; state dot moves on swap)
  | 2 canvas-pricing: should change
  | 3 canvas-payoff : should change (show the american's convex (K,Γ) power-payoff)
  | 4 canvas-ratio  : should change
  STATIC FINDING (flagged in brief as a LIKELY bug for the tester to confirm): none of the
  4 draw fns (drawCurve/drawPricing/drawPayoff/drawTrajectory) read 'americans' directly —
  they read pool-state + band/perp only. So charts 2-4 will likely move only slightly (from
  the open/close pool swap), NOT render the american's own curve. Predicted outcome: charts
  2-4 do NOT show the american shape ⇒ a chart-wiring gap ⇒ likely one more implementation
  pass (wire american into drawPricing/drawPayoff/drawTrajectory). Tester confirms empirically
  with before/after screenshots; brief tells them to FILE it as a finding, not pass it.

CAVEAT (honest): could NOT run the FE smoke at manager's end — egress wall blocks the
  Playwright Chromium CDN (download failed). So the package ships a ready-to-run starter,
  not pre-run results; the tester runs it in their env (npx playwright install chromium).
  Static selector/DOM verification done; live headless run is the tester's.

LIKELY NEXT: tester's PDF confirms (a) lifecycle works end-to-end via UI, (b) the chart-
  wiring gap on graphs 2-4. If (b) confirmed → implementation-intern pass to wire americans
  into the 3 chart draw fns → re-test. Nothing for impl intern until the FE run confirms.

### DECISION: skip FE test, send implementation chart-pass directly
Rohan's call: the chart gap is a known code fact (static read: none of the 4 draw fns read
americans), so an FE testing run to "confirm" it is wasted time/tokens. Skip the tester
package run; dispatch the implementation pass straight to wire the charts. Correct call —
this is a code fact, not a hunch needing empirical confirmation.

CHART-WIRING PASS dispatched: american_charts_pass.zip (4 files: approved v25 build, chart
brief, both graders — no answer-key). Decisions locked with Rohan: PREVIEW while editing
(mirror band's readBand preview convention) + ALL THREE charts.
  - drawPayoff (g3, headline): add american payoff curve over the same spot sweep, value =
    (sNorm/K)^Γ × carved equity — mirror the band-leg preview path, substitute power
    fraction + american θ_eff. Distinct colour. Preview from am-* + open positions.
  - drawPricing (g2): add strike marker at american θ_eff via existing drawStrikeMark
    helper. Preview + open.
  - drawTrajectory (g4, canvas-ratio): mark american θ_eff ray on trajectory, minimal.
  - drawCurve (g1): DO NOT touch shape (AMM invariant).
  - Preview source = same fields previewAmerican() reads (am-wing/K/gamma/notional); ensure
    chart redraw triggers on am-* edit. Rendering-only: no signature/engine/settlement
    change; graders stay green (16/16, 12/12); file-safety. STOP-flag if band/perp drawing
    would have to change (american is additive).
  - Brief claims verified against build (drawStrikeMark/curvePts/americanThetaEff/drawAll/
    state.americans/readBand all present) before shipping.
VERIFICATION PLAN when it returns: graders + file-safety + no-signature-drift (automatic
  since rendering-only), PLUS confirm the 3 draw fns now read americans/am-* and compute
  the power fraction at wing-correct θ_eff. CAVEAT: can't render canvases headless (egress
  blocks Playwright Chromium) — will verify the PLOTTED DATA (extract draw logic, unit-check
  the american series = (sNorm/K)^Γ × equity over the sweep) rather than pixels; final
  pixel confirmation is a human eyeball in-browser.

### INTERN PASS 5 (chart wiring) — VERIFIED CORRECT
temporal_mvp_v25_american_5.html (md5 4bbb0ca5, 510665 bytes). Rendering-only pass.
  - Gates auto-clean: file-safety (273864/5168), graders 16/16 + 12/12, no existing
    signature removed. drawCurve (g1) BYTE-IDENTICAL to approved v25 (shape untouched ✓).
  - All 3 target charts now read the american (preview + open): drawPricing (strike marker
    via markAmRay at θ_eff), drawPayoff (power-payoff curve), drawTrajectory (θ_eff ray).
  - New fns are chart-local helpers: readAmericanPreview (reads am-wing/K/gamma/notional,
    K_usd→ray via oracle, routes through Engine.legPrice {kind:american}, returns null if
    rejected — honors dispatch + fences), markAmRay, and americanLegValue(spec,sNorm).
  - americanLegValue COLLISION CHECK: two defs now — settlement (a) in script[1], chart
    (spec,sNorm) NESTED INSIDE drawPayoff in script[2]. Different scopes; the chart one is
    a local fn inside the draw body, cannot shadow/reach the settlement path. Settlement
    americanLegValue(a) intact. No collision. (Minor readability smell, not a bug.)
  - UNIT-CHECKED the plotted data (can't render canvas headless — egress blocks Playwright):
    payoff series = N·mark(wing, americanThetaEff(...), sNorm)·pM over sweep sNorm=1+r =
    the convex (sNorm/K)^Γ × equity curve; curves separate by Γ (0.94 vs 0.84 at sNorm=1.2
    for Γ=0.3 vs 0.8) — the distinctive shape renders. Preview reads live am-* fields.
  VERDICT: chart pass CORRECT. graphs 2/3/4 now reflect the american (preview+open),
    graph 1 untouched — matches Rohan's expectation. Data verified; FINAL pixel confirmation
    is a human eyeball in-browser (the one thing I can't do headless). This completes the
    american layer end-to-end: engine + settlement + carved-slice convention + charts.

### TESTER PACKAGE 2 (chart-confirmation) assembled
After the chart-wiring pass verified data-correct (can't pixel-check headless), built the
final visual-confirmation package for the testing intern: american_TESTER_charts.zip
(3 files) on the chart-wired build (md5 4bbb0ca5).
  - TEST_BRIEF.md: refocused from gap-hunt to CONFIRMATION — the four-chart table now says
    "should show the american" (g2 strike marker, g3 power-payoff curve, g4 θ_eff ray; g1
    unchanged). Two headline visual checks: (A) preview-while-editing redraws the payoff
    curve live as am-* change; (B) Γ=0.3 vs 0.8 payoff curves visibly differ (the convexity
    point). Plus full lifecycle for the PDF + gotchas + deliverable spec (150 DPI/JPEG72,
    JSON runlog → PDF, lead with chart evidence).
  - fe_smoke.spec.js: starter captures baseline/preview/open chart states + the Γ pair
    (per-canvas payoff shots) + close lifecycle; selectors verified against this build
    (#btn-open-american, #kpi-oracle change, data-close-american, all am-*/canvas-* ids).
  - Caveat unchanged: manager can't run it (egress blocks Playwright Chromium); tester runs
    locally. This run produces the human eyeball confirmation — the one thing left on the
    american layer.

### PUT-WING BL-CLOSURE — research lead PRE-SOLVED it; manager independently verified: CLOSES, no obstruction
Manager's note (Q1/Q2) went to research lead. He did NOT just forward — he pre-solved Q1
(sympy) before prompting Aristotle, same derive→pin→Lean discipline as the call wing, and
returned the density PINNED so Aristotle verifies not discovers. Manager then independently
re-verified his numbers (scipy) rather than bank them:
  - PUT DENSITY = REFLECTION of call under inversion θ↦K²/θ (maps (0,K]↔[K,∞), fixes K) —
    NOT naive Γ↦−Γ. m(θ)=Γ(1−Γ)·K^Γ·θ^(−Γ−1) on [K,∞) + point mass Γ at K.
  - MANAGER-VERIFIED (scipy, independent):
    * total mass = 1 EXACTLY (smooth 1−Γ + point mass Γ) — all Γ∈{.3,.5,.8}, K∈{1,1.5,2}. ✓
    * tail ∫_K^∞ θ^(−Γ−1) = K^(−Γ)/Γ, finite iff Γ>0 (matched closed form; Γ=−0.3 diverges).
      → resolves manager's specific finiteness worry: YES finite on 0<Γ<1, basket converges. ✓
    * CLOSURE IDENTITY (the load-bearing one): put basket = (K/s)^Γ for s≥K, verified via the
      inversion image of the (re-derived, confirmed) call basket → (s/K)^Γ. Exact match ~1e-6,
      all Γ. ✓  Both wings now numerically closed by manager's own hand.
    * positivity/fence: sign Γ(1−Γ) ≥0 on 0<Γ<1, <0 for Γ>1 — same BL3/BL4 fence as call. ✓
  - STATUS CHANGE: BL5_put_density_note is NOT call-wing-only-by-necessity (my earlier hedge
    was wrong) — it's genuinely provable, just the reflected/inversion density. Lean prompt
    (lean_prompt_put_bl_closure_and_compile.md) out to Aristotle, density pinned. One technical
    wrinkle correctly flagged: improper integral on [K,∞) needs real convergence machinery (call
    was a finite interval) — the spot a Lean proof could snag even though the math closes.
  - Q2 (compile): folded into same prompt — confirm clean compile (no sorry/errors/non-base
    axioms) + exact toolchain+mathlib commit. Per Rohan's call: mark trusted-from-prover, clean,
    on [named toolchain]; not an outstanding action; upgrade to 'independently reproduced' only
    if a CI box becomes reachable. Don't block.
  - PENDING: Aristotle returns (a) PutBLClosure.lean retiring BL5_put_density_note with a real
    theorem (improper-integral convergence handled), (b) compile confirmation + toolchain. On
    arrival: verify same as call wing (source audit, real proof body, axiom inventory, my numerics
    already done), then ZERO open trivials bar modelling_knob_open → research record CLOSED.

### TESTER PDF (chart-confirmation run) — verified; 11/11 PASS holds, ONE semantic item for Rohan
Tester returned Temporal_MVP_v25_american_evidence.pdf: 11 phases (P1-P11) through the real
UI in headless Chromium, 28 screenshots, 11/11 PASS 0 FLAG 0 FAIL. Build md5 4bbb0ca5 =
matches chart build. Manager CROSS-CHECKED numbers + weighed findings (didn't read the PASS
column and stop):
  - VERIFIED AGAINST ENGINE (independent): θ_eff(0.5)=1.5^0.5=1.2247 ✓, mark(0.5)=(1/1.5)^0.5
    =0.8165 ✓ (match PDF exactly). Convexity V(0.3)/V(0.8)=1.2247=1.5^0.5 EXACTLY — the
    power-law signature, so the Γ-convexity is mathematically real, not eyeballed. Carved-
    equity basis backs out to ~$80k (=oracle), consistent. Round-trip P&L pre-fee=$0 genuine.
    ITM close settled_cash_leg=american (settle-to-cash path fired); OTM close reversed the
    swap (Δx +0.0164 then -0.0164). Funding accrued 5.342e-6. Both wings render. Charts 2/3/4
    show the american, graph 1 unchanged. All confirmed.
  - COSMETIC SLIP (flag back, not a defect): PDF says convexity rel-diff "18.4%" but actual is
    20.2% (they used |a-b|/a or odd rounding, not |a-b|/mean). Underlying values right, ratio
    exact. Report's own number should be made internally consistent.
  - FINDING 1 (visual subtlety of Γ-pair): soft/correct — math right (20.2% V diff), but the
    two payoff screenshots are hard to tell apart by eye at Γ=0.3 vs 0.8. Tester's fix
    suggestions good (wider Γ spread e.g. 0.1 vs 1.0, or overlay both on one chart). UX polish.
  - FINDING 3 (no on-screen marginal price): carried from v23/v24, not regressed not fixed.
    Spot KPI = sNorm·oracle, not getMP. Known. UX nicety.
  - **FINDING 2 — the one that needs Rohan (bigger than the tester framed it):** the american
    strike is frozen as a RATIO (1.5) at open and DECOUPLES from the dollar strike. Tester
    drove a "call K=$120k" ITM by arbing oracle DOWN to $30k (spot FAR BELOW the nominal $120k
    strike). Engine legIsITM compares sNorm vs θ (ratio coords) — INTERNALLY CORRECT, NO SIGN
    BUG. But in dollar terms "$120k call ITM at $30k spot" is nonsensical. Two readings, design-
    intent question for Rohan: (1) INTENDED — strike is a ratio peg floating off dollar price
    post-open (consistent w/ rebase-invariant engine), $120k is just entry convenience → only
    fix is UX clarity (surface θ_star/sNorm); or (2) UNINTENDED — a user opening a "$120k call"
    expects ITM when spot>$120k, ratio-freeze silently breaks that → real product-semantics
    defect. Tester logged it as a UX hint; manager escalates it as a semantics call. NOT
    resolvable by tester or manager — needs Rohan's product intent.
  VERDICT: chart wiring + full lifecycle CONFIRMED working in-browser (the pixel confirmation
    I couldn't do headless). v25 american layer is functionally complete. The ONE open
    question is Finding 2's semantics (ratio-peg vs dollar-strike intent) — everything else is
    pass or cosmetic. Pending Rohan's call on Finding 2 before declaring fully closed.

### CHART SCALING/SHAPE BUG — Rohan's eye caught it; manager diagnosed; SURGICAL pass dispatched
Rohan flagged the option-pricing curve "looked the same instead of steeper (american-style implies steeper)."
Manager first mis-chased the PAYOFF chart, then Rohan clarified he meant the PRICING chart (put-left/call-right
of the mode). Manager investigated BOTH and found the chart pass was hollow in a way the tester's 11/11 missed:
  - PRICING chart: the american is only a drawStrikeMark DOT at θ_eff. It sits EXACTLY on the barrier wing
    (because (sNorm/θ_eff)=(sNorm/K)^Γ coincide at that one point), so it reveals nothing. The existing call
    wing plots ψ=sNorm/θ = (sNorm/θ)^1; the american is the SAME family with Γ substituted: (sNorm/θ)^Γ — a
    visibly different decay (θ=2·sNorm: barrier 0.50 vs Γ=0.3 0.81, 60% gap). Should be drawn as its OWN CURVE.
  - PAYOFF chart: REAL SCALING BUG. americanLegValue = N·mark·pM uses pM=perp MARGIN ($1000); true value uses
    carved-equity/oracle (~$80k) basis. Chart plots american at ~$16 on a $0–6000 axis → flat sliver crushed
    at the x-axis → "looks linear." Preview readout ($1,306.39 = N·mark·oracle) is the correct value; chart is
    80× too small. (Manager had initially rationalized this as 'subtle convexity' — WRONG, corrected: it's a
    scale bug. Rohan's eye was right.)
  - TRAJECTORY: single dot at θ_eff, same hollowness.
  - PROCESS NOTE: 2nd time a green-grader build needed Rohan's eye (1st: raw-cash settlement). Graders check
    "runs," not "value is the right magnitude / shows the right shape." Chart/UI layer verification gap.
DISPATCHED: american_charts_pass2.zip (build + GRUNT_BRIEF_charts2 + 2 graders, no answer-key). Brief is
  SURGICAL per-chart with the exact expression to substitute: pricing → draw (sNorm/θ)^Γ wing curve; payoff →
  fix basis to carved-equity/oracle so r=0 value == preview (~$1306 not $16); trajectory → show locus not dot;
  + general principle "wherever the barrier/band exponent-1 expr appears, add the american Γ analogue, not
  limited to these." Rendering-only; graph 1 untouched; graders auto-green.
VERIFY ON RETURN: pricing american curve numerically distinct from barrier away from θ_eff; payoff r=0 ==
  preview value (scale bug gone); graph 1 byte-identical; file-safety + graders.

### CHART-SHAPE PASS (intern6) — VERIFIED CORRECT, all 3 substitutions land
temporal_mvp_v25_american_6.html (md5 0f2b194a, 512744 bytes). Verified the surgical chart pass:
  - Gates: file-safety (273864/5168, 3 scripts parse), graders 16/16 + 12/12, graph 1 (drawCurve)
    BYTE-IDENTICAL, no signature removed.
  - PAYOFF scale bug FIXED: americanLegValue now = N·mark·S0 (S0=oracle), r=0 value = $1306.40 ==
    preview $1306.39 exactly (was N·mark·pM = $16.33, 80× too small). Curve now renders at true
    magnitude. Comment correctly documents pM-was-the-bug.
  - PRICING fixed: drawAmericanWing plots min(1,(sNorm/θ)^Γ) across strikes as its OWN curve (the
    barrier wing is the Γ=1 case). Numerically distinct from barrier at every θ away from θ_eff
    (θ=2.0: barrier 0.50 vs Γ=0.3 0.81). The "steeper american-style" curve Rohan wanted — not a dot.
  - TRAJECTORY: kept as a ray + FLAGGED with sound reasoning (a single (K,Γ) is ONE strike → sits on
    one wing axis → no genuine 2-D locus the way the pool trajectory has; pool moves both wing
    distances at once, a single strike can't). Forcing a curve there would fabricate structure that
    doesn't exist. Correct judgment call, exactly the "flag don't force" the brief invited.
  VERDICT: chart-shape pass CORRECT. All charts now show the american's distinctive shape where it's
    meaningful (pricing power-wing curve, payoff convex curve at right scale), graph 1 untouched,
    trajectory honestly a ray with stated reason. Rohan's two findings (pricing-looks-same, payoff-
    scale) both resolved + verified. Pending: Rohan's eyeball in-browser (final pixel confirm) +
    still-open Finding 2 (ratio-vs-dollar-strike semantics, separate question).

### PRE-TESTER (manager's own work before the chart re-run)
Two things done at manager's end before handing to tester:
  1. CHART-CONTRACT GUARD (chart_contract_check.js) — closes the verification gap that let
     BOTH chart bugs through green graders (the gap flagged twice). Source-level asserts:
     (a) drawPayoff americanLegValue uses oracle/S0 basis NOT pM (catches the 80× scale bug);
     (b) drawPricing draws the (sNorm/θ)^Γ power-wing curve NOT a dot. VALIDATED both ways:
     PASS on intern6 (fixed), FAIL on intern5 (buggy) — catches exactly the two regressions.
     Can't unit-call canvas fns headless, so this is a source contract, not a render test —
     but it makes "green" cover basis+shape, which the eye had to catch before. Standing guard.
  2. TESTER PACKAGE REFRESHED to intern6: american_TESTER_charts_v2.zip (build 0f2b194a +
     updated brief + fe_smoke starter + the chart-contract guard). CRITICAL: prior tester pkg
     pointed at intern5 (the BROKEN-chart build) — would have tested the bug. Now on the fix.
     Brief refocused: confirm pricing power-wing curve visibly departs from barrier (Γ<1 sits
     above OTM side), payoff curve at TRUE scale (r=0 ≈ preview ~$1300 not $16), + capture
     pricing Γ=0.3 vs 0.8 pair. Includes the headless pre-check (run the guard first).
STILL OPEN (unchanged): Rohan's in-browser pixel confirm (tester run does this); Finding 2
  (ratio-vs-dollar-strike ITM semantics — product-intent question, separate). Plus the long-
  pending: fold chart pass into sealed v25 record (after tester confirms); Aristotle's put-BL
  + compile reply.

### RESEARCH RECORD CLOSED — put-BL-closure PROVED + compile clean (trusted-from-prover)
Research lead returned Aristotle's run on Q1+Q2. Manager verified the substantive math
independently (not banked on summary); compile accepted as trusted-from-prover (can't
reproduce — same egress wall).

Q1 — PUT-WING BL-CLOSURE: PROVED, no obstruction. PutBLClosure.lean, 9 real theorems, base
  axioms, no sorry/trivial/rfl/polluters. Reflected density (θ↦K²/θ), NOT Γ↦−Γ mirror.
  MANAGER RE-VERIFIED (scipy, independent, matches pre-derivation from rounds ago):
    * convergence: ∫_sNorm^∞ θ^(−Γ−1) converges iff Γ>0 (matched closed form a^(−Γ)/Γ to 1e-6;
      Γ=−0.3 diverges). Aristotle handles it via Mathlib integral_Ioi_rpow_of_lt — the CORRECT
      mechanism for my flagged finiteness worry. Resolves YES.
    * BL2_put_closure reproduces (K/sNorm)^Γ exactly, all Γ∈{.3,.5,.8}, all sNorm≥K tested.
    * BL1_put mass=1 (smooth 1−Γ + point Γ); BL3_put≥0 on 0<Γ<1; BL4_put<0 for Γ>1 (fence mirror).
  BL5_put_density_note := trivial DELETED. Only := trivial left = modelling_knob_open (accepted
  marker, not a gap). RECORD: PROVED both wings — barrier basket on call AND put. NOT call-only.

Q2 — COMPILE: clean, trusted-from-prover, on a CITABLE env. Whole core (A–E, BL both wings,
  PutWing, motion-rate, fixed C3): 0 sorry, 0 errors, 0 non-base axioms (8037 jobs; 55+ #print
  axioms all [propext, Classical.choice, Quot.sound]). Toolchain leanprover/lean4:v4.28.0,
  mathlib 8f9d9cff6bd728b17a24e163c9402775d9e6a365 (tag v4.28.0). MANAGER CANNOT REPRODUCE
  (egress wall blocks Lean toolchain, same wall that blocks Playwright). RECORD EXACTLY:
  every [PROVED] clean on Lean v4.28.0 + mathlib 8f9d9cff, TRUSTED-FROM-PROVER. Caveat kept
  sharp: NOT independently-reproduced our-side; upgrade to "reproduced" only if a CI box becomes
  reachable. Paper must NOT claim independently-verified compile.

RESEARCH SIDE: CLOSED. Development = A–F, both wings (put-native + put BL-closure), BL-closure
  both wings, motion-rate both wings, C3 fixed. ZERO symmetry-inferred items, ZERO open proof
  trivials. Both graders green. Only thing short of fully-mechanized-our-side = reproducing the
  compile (infrastructure, not math). Nothing mathematical outstanding.

REMAINING (all non-research, manager/product side):
  - FE chart-shape re-confirmation: tester run in flight (american_TESTER_charts_v2.zip on intern6).
  - Finding 2: ratio-vs-dollar-strike ITM semantics — product-intent question for Rohan. OPEN.
  - Housekeeping: fold chart pass into sealed v25 record (after tester confirms); update grunt
    package brief's proof-status to "put-BL PROVED both wings, compile trusted-from-prover on
    v4.28.0+8f9d9cff" (was "put-wing BL-closure honestly open").
  - Canonical: next delta branches from pristine 3117cff4 per rule (research lead's closure is his
    latest entry on that base; manager working-canonical has all review logs appended separately).

### RESPAWN PACKAGE built (context handoff to a fresh chat — image/PDF limits hit)
temporal_RESPAWN_v25_complete.zip — single self-contained zip for spawning a fresh manager
instance with full context. Text + HTML only (no PDFs/images — those hit the limit). Contents:
  - 00_RESPAWN_MASTER.md — organized orientation: roles/discipline, project, file manifest+md5s,
    state-of-play, the 6-pass american arc, the chart arc, open items (Finding 2 = the one
    substantive decision), gotchas (file-safety, egress wall, oracle routing), research closure.
  - 01_session_tree_note_CANONICAL.md — the full append-only durable memory (~3561 lines).
  - builds: CURRENT (intern6 0f2b194a), APPROVED (intern4 97789822), REFERENCE answer-key
    (f0219149, held back), BASE frozen (v24 6f606f52), BUGGY (intern5 4bbb0ca5, for guard val).
  - contract: regression_v2 (b915f204), american_12check (4570b32b), chart_contract_check.
  - tester brief + fe_smoke starter (what's in flight); key notes (APPROVED, chart brief,
    research CLOSED, american build brief v6).
  VERIFIED inside the package: intern6 passes regression + american-12 + chart-contract; md5s
  spot-checked. A respawned instance reads 00_ first, confirms md5s, picks up at the open items.

### NOTE TO RESEARCH LEAD — perpetual-American reframe + vol-knob question (call wing)
Rohan reframed the American away from "(K,Γ) power family" to STANDARD perpetual American +
asked if a vol knob helps. Manager worked it first-principles + derived the indicial roots:
  - Our (sNorm/K)^Γ = Merton power-law continuation soln of ½σ²S²V''+(r−δ)SV'−rV=0. Γ = the
    option EXPONENT, pinned by vol+carry via smooth-pasting — not a free shape knob.
  - PUT confirms: standard put boundary s*=Kβ/(1+β); at fence edge |Γ|=1 (β=1) s*=K/2 EXACTLY
    = the K/2 asymptote PutWing.lean found at Γ→−1⁻; smooth-pasting holds. Put wing IS a
    faithful standard perpetual American put; |Γ|≤1 ⟺ σ²≥2r (a real vol range).
  - CALL TENSION: indicial roots — put uses negative root (|p−|≤1 inside fence for high σ);
    call uses positive root p+ =1 at δ=0, >1 for δ>0 (derived: r5%/δ2%/σ30%→1.23; δ8%→2.18).
    So a standard perpetual American CALL (carry>0) has exponent>1 (convex) → OUTSIDE |Γ|≤1
    (the BL3/BL4 positive-basket fence). Our Γ<1 call is the concave sub-American; δ=0/p+=1 =
    the barrier boundary. The convex American Rohan pictured = the Γ>1 region BL4 excludes.
  - Note asks research lead/Aristotle 4 things: (1) is the call-wing diagnosis right (std call
    outside fence)? (2) what's the AMM's IMPLIED pricing measure (r−δ,σ) from curve weight w —
    decides if std call root lands ≤1? (3) is a per-instrument vol knob even COHERENT on a
    single-curve single-implied-vol AMM, or does it need per-instrument curve geometry (band/
    carve freedom)? (4) driving Γ=Γ(σ,carry) — does the call stay inside |Γ|≤1 over the quoted
    vol range or demand the non-replicable convex regime?
  Framed as design/theory brain-pick, NOT a proof request yet. Pre-derivations are manager's
  (scipy/indicial), offered as head-start, flagged "check don't trust." File:
  note_to_research_lead_vol_knob_american.md. This also folds Finding 2 in (quote vol+strike).

### NOTE TO RESEARCH LEAD — coordinate convention PINNED from engine source
Research lead self-corrected (was coordinate-sloppy reading curvature in sNorm); asked manager
to pin: is sNorm increasing or decreasing in spot, and which coord is "price" for gamma.
Manager read it from the build (not assumed):
  - getW=α/x; getSNorm=(1−w)/w = x/α−1; getMP_raw = w·y/((1−w)·x) (true marginal price);
    poolMark = getMP_raw·(oracle/oi).
  - ENGINE'S OWN WORDS, line ~1850: "spot = mp/oracle (price measure), NOT sNorm (price-
    reciprocal)." Band-open OTM tests use poolMark/oracle, not sNorm — internally consistent.
  - DIRECTION (verified numerically, x:12→7): spot UP → arb buys BTC → x DOWN → w=α/x UP →
    sNorm=(1−w)/w DOWN; MP_raw UP. So sNorm runs INVERSE to spot (price-reciprocal); MP runs
    WITH spot. Matches tester Finding-2 (arb oracle DOWN → sNorm UP to 1.633).
  - VERDICT: read gamma/convexity in MP (price coord), NOT sNorm. The "call concave/put convex/
    wings bend opposite" geometry was the sNorm-lens artifact — DROP it. What SURVIVES (coord-
    invariant, don't re-litigate): root sign (put neg/call pos root), carry sign (Γ>1⟺δ>0, IC
    lemmas), BL3/BL4 basket positivity. Convex-call conclusion rests on root>1⟺δ>0⟺BL4-negative
    — all intrinsic, unaffected by the coord fix. So conclusion STANDS; only the geometric
    language was loose.
  - FLAGGED for his re-derivation: the American leg's OWN ITM/OTM test uses getSNorm (its
    pricing frame; engine comment line ~2669: legValueUnified==legPriceAmerican.V only when
    sNorm=getSNorm). When re-stating convexity in MP, reconcile the leg's internal sNorm frame
    with the economic MP frame explicitly — a seam where coord mismatch could hide.
  File: note_to_research_lead_coordinate_convention.md.

### NOTE TO RESEARCH LEAD — diligence: DISTANCE payoff vs FIXED-slice payoff (intended vs implemented)
Rohan gave the intended dollar payoffs: BARRIER = N·|exercise − entry_oracle| (ref=entry);
AMERICAN = N·|exercise − strike|, barrier=strike (ref=strike). Reference-point distinction is
clean/correct (american strike-ref=standard intrinsic; barrier entry-ref=realized-move). BUT
manager found a DIRECTION MISMATCH reconciling this with the engine mark (sNorm/θ)^Γ:
  - Under martingale GBM (P(touch θ)=S0/θ): FIXED-payout one-touch = 1/θ (DECREASES as θ→out,
    MATCHES chart mark sNorm/θ). DISTANCE payout |θ−entry| = (θ−1)/θ = 1−1/θ (INCREASES as θ→out,
    OPPOSITE). So the chart's barrier behaves like a FIXED-payout-on-touch claim, NOT Rohan's
    distance payoff. Lines up w/ carved-slice settlement (ITM pays whole slice ≈ N perps fixed;
    (sNorm/θ)^Γ = OTM fraction). So engine prices fraction-of-a-fixed-slice; Rohan's model is
    distance-from-reference. Possible INSTRUMENT-DEFINITION GAP, not a chart bug.
  - Note asks research lead to: (1) read close/settlement in $ terms — does ITM pay N·|exercise−
    ref| (distance) or N·(carved slice) (fixed)? (2) if fixed: is the distance scaling folded
    into NOTIONAL/CARVE SIZING AT OPEN (the likely reconciliation — dollar figure distance-like
    even if fraction curve is 1/θ)? (3) only then: is across-strikes behaviour correct for
    whichever payoff is real? Flagged: if intended≠implemented, name it BEFORE writing up the
    perpetual-American/vol-knob framing (which assumed (sNorm/K)^Γ value form is the whole story).
  Manager pricing = scipy/martingale, "check don't trust." File: note_to_research_lead_payoff_
  semantics.md. This is the deepest open question now — sits upstream of Finding 2 AND the
  vol-knob writeup.

### NOTE TO RESEARCH LEAD — CONSERVATION-LAW thesis (barrier→American) + cleaner-mapping + sharpness investigation
Rohan's thesis: barrier (simplest fraction-of-perp, b(θ)=sNorm/θ = P(reach θ), a martingale) and
American ((sNorm/K)^Γ) are related by a CONSERVATION LAW. Manager developed + verified pieces:
  - THESIS: American = mass-conserving positive redistribution of barrier atoms: (sNorm/K)^Γ =
    ∫ b(θ)μ_Γ(dθ), ∫μ_Γ=1. VERIFIED mass=1.000000 all Γ in-fence (scipy). [value-reconstruction
    in quick check had a point-mass normalization slip — flagged, mass=1 is the load-bearing
    claim, BL1/BL2 already machine-check the closure.]
  - FOUR-LAYER CHAIN: pool invariant (x−α)(y−β)=αβ → barrier=martingale (P(reach θ)) → American=
    unit-mass mixture (∫μ=1) → dollar settlement (trader_payout−club_delta=raw_net·carvedEquity,
    L0 split conserves raw fraction×slice).
  - PUNCHLINE: conservation IS the fence. μ_Γ≥0 ⟺ 0<Γ<1 (BL3); Γ>1 → coef Γ(1−Γ)<0 → signed mass
    (BL4) → not a positive mixture. "Conserves positive perp-fraction" = "replicable" = same
    condition. Re-derives the carry-sign boundary from conservation.
  - SHARPNESS (manager's honest prior, for research lead to confirm/break): barrier (Γ=1, point
    mass) is the SHARPEST positive claim — can't concentrate unit mass tighter than a point.
    American (Γ<1) only SPREADS it (softer). So "American sharper than barrier" impossible BY
    conservation; sharper=signed mass=fenced. Sharpness Rohan wants may live in the DOLLAR layer
    (L0 leverage + carve sizing) NOT the fraction. Ask: does conservation cleanly separate
    "fraction (fenced)" from "dollar exposure (sharpen via L0/sizing)"?
  - INVESTIGATION ASKS (Rohan): (A) is barrier-basket a cleaner FOUNDATION — American falls out
    of barrier primitive across pricing/tx/settlement/portfolio/funding (gammaEff=2Γ should fall
    out of the mixture not be a separate rule)? (B) where does sharpness live?
  - RIGOR Qs: (1) is b(θ)=sNorm/θ a martingale under the ENGINE'S ACTUAL measure (not just GBM
    proxy)? link layer1→2. (2) unit-mass = true dynamical CONSERVATION or STATIC identity?
  File: note_to_research_lead_conservation_law.md. This is the big synthesis thesis; sits over
  the payoff-semantics diligence (which established fraction-of-fixed-slice = Job1/Job2). Both
  out to research lead. "check don't trust", branch 3117cff4.

### SCOPING — first-derivative-lift chart representation (STAGED, pending Aristotle)
Research lead proposed: American curve = first-derivative transform of the AMM; barrier =
variable part of R'(MP); American = barrier^γ; gammaEff=2γ = position→slope Jacobian. Asked
manager to scope minimal chart diff while Lean (unified-lift run: put-wing motion rate + BL
closure + chaining corollary) goes to Aristotle. CAVEAT: don't ship until green.
  - MANAGER CONFIRMED NOW (no Lean needed): d log MP/d log sNorm = −2 exactly on real curve
    (MP·sNorm²=80000 const) → the ×2 Jacobian is numerically consistent, same 2 as shipped
    gammaEff. NOT sufficient to confirm the full lift (R'(MP) identity, warp-flow chaining) —
    that's the Aristotle run. Necessary ingredient, not the whole proof.
  - Chart-level map (from intern6 source): canvas-curve=bonding curve (x,y) invariant, level-0;
    pricing=mark=(sNorm/θ)^γ slope-read but in sNorm coord; payoff=instrument value; trajectory
    =curve path. NO slope/derivative-curve object exists in code yet (grep zero).
  - Manager PUSHED BACK on "small representational": (1) charts aren't lifted even if engine is
    — adding a slope curve is net-new additive rendering, not relabel; (2) "lift to first-deriv
    curve" = "read gamma in MP not sNorm" = same coordinate decision; re-coordinating the 3
    sNorm-based charts to MP is NOT cosmetic, re-shapes every curve, re-enters the code that
    broke twice (80× scale, dot). Refused to bundle that into "minimal."
  - STAGED in risk order: Tier 0 = annotation only (gammaEff=2γ explained, zero pixels, ship-
    ready on green). Tier 1 = additive OPTIONAL slope-curve trace R'(MP) on canvas-curve
    (bonding curve byte-identical, American shown on slope curve) — the one real impl pass, to
    intern blind, AFTER green, with extended chart-contract guard (assert slope trace == engine
    getMP_raw-derived slope at sample pts; reuse anti-80× preview-value check). Tier 2 = re-
    coordinate pricing/payoff/trajectory to MP — FLAGGED as separate deliberate decision, NOT
    bundled, largest/riskiest.
  - ASKED research lead one scoping Q: does "American lives on first-deriv curve" mean (a) draw
    R'(MP) on canvas-curve w/ American marker [Tier 1], or (b) re-express existing wings in MP
    coord [Tier 2]? The proof pins which transform is canonical; finalize diff once known + green.
  File: scope_first_derivative_lift_charts.md. Nothing built; staged only.

### CHART LIFT — (a) confirmed, guard spec CORRECTED by research lead (manager verified)
Research lead answered the scoping Q: it's (a) — draw the actual first-derivative curve, American
as barrier^γ on it. The proof pins the DELTA-LINK (U2): barrier=(R'(MP)−α)/(αK), a structural
identity (American's base IS the AMM's first derivative), NOT a display-coordinate statement.
Option (b) re-coordinate is NOT entailed by the proof → Tier 2 correctly stays separate.
  - R'(MP) = x EXACTLY (reserve-value delta = BTC reserve). First-derivative curve = delta(=x)
    vs MP — both already tracked, nothing re-derived. Just x plotted against MP, parametric over
    the state sweep. Shrinks Tier-1 risk (not an exotic object).
  - GUARD CORRECTION (research lead caught manager's spec error): R'(MP) is NOT getMP_raw.
    getMP_raw IS MP (the slope dy/dx, ≈80000 at base). R'(MP) = x = α+√(αβ)·getMP_raw^(−½)
    (≈10 at base). So the guard must assert slope-trace == x (the BTC reserve), zero-tolerance,
    NOT trace==getMP_raw (which would plot the MP axis ~80000, the WRONG object). Manager's
    original guard spec would have been hollow — research lead's correction is right.
  - MANAGER VERIFIED on live curve: getMP_raw==αβ/(x−α)² (=MP) ✓; inversion x=α+√(αβ)MP^(−½)
    exact ✓; delta(x≈10)≠slope(getMP_raw≈80000) ✓ (guard correction real); delta-link reduces
    to (x−α)/(αK)=sNorm/K = our known barrier ✓. R'=x itself needs his R def (Aristotle closes
    U2); manager verified the CONSEQUENCES + noted ∫x dMP = α·MP+2√(αβ·MP) clean → R'=x self-
    consistent.
  STAGED PLAN LOCKED: Tier0 annotation (ship on green); Tier1 = additive delta(=x)-vs-MP trace
    on canvas-curve, bonding curve byte-identical, GUARD: trace==x zero-tol (corrected), to
    intern blind after green; Tier2 (re-coord other 3) separate, NOT entailed by proof. Nothing
    ships until unified-lift run (put-wing motion rate + BL closure + chaining corollary) green.
    Manager stands behind pre-Lean: −2 Jacobian + R'=x consequences. Delta-link identity = the
    proof Aristotle closes.

### INTERN PACKAGE built — chart-lift pass (cleared to build, manager verifies on return)
intern_chart_lift_pkg.zip (6 files): INTERN_BRIEF.md, build (intern6 0f2b194a), both graders
(regression b915f204 / american-12 4570b32b), chart_contract_check.js, lift_geometry.png.
Verified: no answer-key/internal-note leak; graders green on supplied base; build md5 matches.
  - BRIEF spec: lift the 3 VALUE charts to the first-derivative view; bonding curve untouched.
    PRICING (primary, fully specified): wings read against 1st-derivative → ratio SQUARED;
    barrier (sNorm/θ)→(sNorm/θ)², American (sNorm/θ)^Γ→(sNorm/θ)^(2Γ) (the 2Γ = gammaEff);
    MODE INVARIANT (peak at θ=sNorm stays, both=1). TRAJECTORY: read dC/dP in MP frame, bows
    under skew (verified), flag-don't-guess. PAYOFF: shape consistent w/ lifted pricing but
    operating-point value MUST stay == preview (anti-80× regression guard).
  - Geometric framing primary (Rohan thinks geometrically; confirmed via lift_geometry.png:
    same mode, steeper shoulders). Algebra (square/2Γ) is the implementation. This is the view
    where the original "not steep enough" complaint resolves — derivative wing is genuinely
    steeper, for a principled reason (the −2 Jacobian).
  - Acceptance criteria stated (manager verifies, not PASS column): mode invariant; exponent
    doubled (distinct from old Γ away from mode); payoff op-point==preview; trajectory bows
    under skew; bonding byte-identical; file-safe; graders green; no sig drift.
  - GATING: cleared to build (unified-lift run verified trusted-from-prover; chart rests on
    engine-verified delta=x + barrier^Γ, NOT the pending ConcaveLP fold). Manager verifies on
    return before merge/FE-test. Guard note: current chart_contract_check.js pricing assertion
    expects OLD Γ wing → will trip on lifted build (expected); manager re-points it to 2Γ.

### INTERN PACKAGE revised — americanLegValue scope-trap disambiguation
Rohan confirmed charts = layer-1 only, settlement layers (engine, already correct: carvedEntryEquity
+ escrowed attributablePnL) out of scope. Verified engine: settlement basis IS initial carve equity
(cE=carvedEntryEquity) + escrowed P/L (attributablePnL), NOT re-measured closing — matches Rohan's
"initial not closing, escrowed not appropriated." Manager's earlier "fraction of CLOSING equity"
shorthand was imprecise; corrected. Lift does NOT touch layers 2/3 — pure layer-1 representation.
ONE revision to the intern brief: there are TWO americanLegValue fns — americanLegValue(a) @2677
(SETTLEMENT, Store-exported, escrow accounting — DO NOT TOUCH) and americanLegValue(spec,sNorm)
@4342 (chart-local in drawPayoff — the ONLY one this pass edits). Added explicit SCOPE TRAP callout
to prevent the intern editing the settlement fn and breaking escrow. Re-zipped intern_chart_lift_pkg.zip.

### INTERN7 VERIFIED + trajectory pinned + guard re-pointed (v2)
intern7 (first-derivative lift pass) VERIFIED: file-safety clean (273864/5168, 3 scripts parse),
both graders green, settlement americanLegValue(a)@2677 BYTE-IDENTICAL (scope trap avoided),
drawCurve byte-identical, no signature drift. PRICING lifted correctly: barrier psi=ratio*ratio,
American gammaEff=2*gamma → min(1,(sNorm/θ)^(2Γ)), mode-invariant by construction (1^(2Γ)=1).
Numerics land (θ=2sNorm,Γ=0.5: lifted 0.50 vs old 0.71). PAYOFF chart-local americanLegValue kept
S0/oracle basis (r=0=$1306.40==preview, no 80× regression). Guard: payoff+2gamma+barrier PASS,
pricing-wing-old-form correctly tripped (manager re-pointed). TRAJECTORY: intern FLAGGED-not-guessed
(correct) — lift transform underdetermined (sign/inversion, what m scales, peg-premise).
RESOLUTION (Rohan): trajectory relation = tangent slope wrt the FIRST-DERIVATIVE curve. Manager
verified the pricing-consistent reading: tangent t=sNorm → t² (square it, scale-free, NOT literal
β/α-MP). Peg-invariant (t=t²=1, 45° unmoved), bows MORE under skew (max|dC−dP| ~13°→~20° at
sNorm=1.6). Same operation as the pricing wings → one rule across the lift. Resolves all 3 flags.
DELIVERABLES: INTERN_NOTE_trajectory_transform.md (pins t→t² with code snippet + why + expected
behavior + scope-trap reminder). chart_contract_check_v2.js — re-pointed: pricing_american_wing_
lifted_2gamma (gammaEff=2*gamma + wing powers by it), pricing_barrier_ray_squared (psi=ratio*ratio),
trajectory_tangent_squared_scalefree (t*t, no β/α/MP scale). v2 behavior: intern7 PASSes 3/4, FAILs
only trajectory (the remaining piece); still FAILs buggy intern5 (fail-case preserved). After intern
applies t→t², all 4 green. Old chart_contract_check.js kept as intern5/6 fail-case reference.

### NOTE TO RESEARCH LEAD — additive rung vs multiplicative funding conflation (lift note pre-cofounder)
Research lead's formal lift_note.pdf (barrier=R'/Γ1, American=R''/curvature/Γ3, rung ΔΓ=2, escrow
funds rented convexity) — manager verified the LADDER is sound (reproduced R'−α∝MP^−1/2, R''∝MP^−3/2,
fence@2224, convexity/escrow structurally sound pending the §10 short-gamma sign check). BUT flagged
a CONFLATION at the center: note says "ΔΓ=2 = funding ×2 = gammaEff=2Γ" as one object. Two different
ops sharing the number 2: DIFFERENTIATE (barrier→American map, Fig1) = Γ→Γ+2 ADDITIVE (Γ1→Γ3);
FUNDING gammaEff=2Γ MULTIPLICATIVE. Coincide ONLY at Γ=2 (table: Γ1→ rung 3 vs funding 2). So "funding
×2 IS the derivative rung / one derivative further along" is false except Γ=2. gammaEff=2Γ is actually
the Jacobian-|2| RESCALING of the exponent (multiply), not a derivative step (add). Manager verified
numerically (Γ+2 vs 2Γ table). TWO consequences for the note: (1) the chart-lift implemented Γ→2Γ
(multiplicative/funding op) NOT Γ→Γ+2 (differentiate) → lifted charts show the Γ≤1 sub-American at
DOUBLED display exponent, NOT the R'' curvature (Γ=3); "build renders American-as-curvature" overstates
— genuine American (Γ>1) still unrepresented. (2) shipped funding 2Γ ≠ note's "one rung up" Γ+2 except
Γ=2. SUGGESTED FIX: separate the two roles of 2 — additive rung (Γ→Γ+2 = the lift/derivative) vs
multiplicative gammaEff=2Γ (Jacobian rescaling in funding); ladder stands without the join, drop the
overclaim. File: note_to_research_lead_rung_vs_funding.md. This connects to the manager's prior-turn
flag (Γ→2Γ chart-lift vs Γ→Γ+2 reframe rung — same conflation, now pinned numerically).

### Q&A ROUND NOTE — lift full apparatus to first-derivative curve C1 (research lead + Aristotle)
Rohan: extend the C1-as-base principle from charts to EVERYTHING — effective AMM tx, composite-ray
shortcut, funding anchor, rebasing, "through and through." Suspects straightforward; if doubts, one
Q&A round w/ research lead + Aristotle closes it. Manager wrote comprehensive note (qa_round_lift_to_C1.md).
KEY DERIVED FINDING: the lift SQUARES sNorm in the conservation law — C0 invariant sNorm·(y−β)=β
(hyperbola); C1 invariant sNorm²·MP=β/α (NOT a hyperbola). The sNorm→sNorm² is the same |Jacobian|=2,
now in the conservation law not as an exponent shift. ENGINE ALREADY SPLIT: value reads sNorm^Γ (C0),
funding reads 2Γ (the sNorm² square = C1) — so "lift through&through" = make tx+shortcut+rebase use the
C1 square funding already uses. REBASE carries free (sNorm invariant ⇒ sNorm² invariant). SETTLED (in
note, confirm-don't-rederive): ×2 conflation fix (additive Γ→Γ+2 lift vs multiplicative 2Γ funding,
coincide only Γ=2); chart model (render C1, run barrier machinery, +2 EMERGES not imposed, Γ=1→3 verified);
C1 invariant; engine split; rebase carry-through. FOUR OPEN Qs w/ manager hypotheses: Q1 effective tx on
C1 (= same physical swap re-read in MP/curvature? reduces to current executeLeg/tradeUpdate under
sNorm→sNorm²? or genuine functional change / new reserve pair?); Q2 shortcut composition on C1 (identical
or cross-term from squared invariant?); Q3 funding anchor on C1 (does lifting anchor to C1 DERIVE
gammaEff=2Γ — the 2=C1 square — vs convention? keep it multiplicative, don't re-merge w/ rung); Q4
(KEY consequence) positivity FENCE taken ON C1 — does C0's curvature (the American, Γ>1 on C0) sit
WITHIN-fence as the BARRIER ON C1? If yes: genuine convex American reachable WITHOUT lifting |Γ|≤1 fence
(it's just the C1 barrier), escrow/§10 falls out of C1 swap not engineered separately — would re-scope
the whole "genuine American" item. For Aristotle: is C1 invariant provable; is tx reduction a theorem or
definitional; can 2Γ be DERIVED as C1 comparison; does C0 unit-mass/put-positivity closure TRANSPORT to
C1 (load-bearing for Q4). Caveats: value/C0-funding/C1 split + fence-on-C1 are MANAGER hypotheses (most
likely over-read, invited pushback); NO HTML edits pending answers; if Q1 says tx already C1 swap →
possibly ZERO engine change + chart render of C1; trusted-from-prover for all Lean. File:
qa_round_lift_to_C1.md. Connects: chart model (render C1 reuse machinery), corrected lift note (doc idx
in conv), prior rung-vs-funding conflation note.

### RESEARCH LEAD REPLY (C1 Q&A) + MANAGER VERIFICATION + ARISTOTLE RELAY
Research lead replied to qa_round_lift_to_C1. Manager INDEPENDENTLY VERIFIED:
- Q2 CORRECTED MANAGER: composite-ray shortcut does NOT compose identically; exact identity
  N·(mark_Γ(θin)−mark_Γ(θout)) = N·mark_Γ(θ*)·2·sinh(Γδ), θ*=√(θin·θout). Spread scales 2sinh(Γδ):
  barrier Γ=1→2sinh(δ), American Γ=3→2sinh(3δ) (~3.4× at δ=0.3). Manager verified symbolic+numeric
  (Γ=1,2,3 exact). Manager's "composes identically" WRONG — owned. ENGINE FINDING: vsValue hardcodes
  N·m·2·sinh(|δ|) = Γ=1 form (lines 1612/1782/3753) — correct for barriers/spreads (Γ=1), but any
  C1/American spread needs 2sinh(Γδ). Forward-looking constraint, not current bug.
- Q1 CONFIRMED zero tx change: same physical swap, no new reserve pair, no cross-term (β/α trade-conserved
  → C1 invariant auto-preserved). C1 content is in price/value read (curvature integral) not reserve motion.
  Matches byte-identity finding. Manager §5 conjecture (tx already C1 swap) confirmed.
- Q3 CONFIRMED 2Γ derived-MODULO-PREMISE (funding is a C1 read): (sNorm²)^Γ=sNorm^{2Γ} so funding =
  value's Γ on C1 coord sNorm². The 2 = log-log Jacobian, DERIVED not convention, conditional on premise.
  Stays MULTIPLICATIVE, distinct from additive rung (coincide only Γ=2). Paper phrasing: "derived modulo
  premise" not "by convention" not "forced from nothing." Algebra trivially confirmed.
- §2.5 REBASE CAVEAT (research lead catch, valuable): C1 HEIGHT MP is NOT rebase-invariant (MP→MP/r);
  C1 invariant sNorm²·MP=β/α is rebase-COVARIANT (both sides ×1/r). Only sNorm/sNorm² invariant. ⇒ C1
  reads MUST use sNorm², NEVER bare MP (same discipline as v24 oracle-routing). Implementation guardrail.
- Q4 (LOAD-BEARING) research lead: positivity closure is basis-agnostic power-fact; C1-American = positive
  mixture of C1-barriers iff |γ₁|≤1; C0 curvature (Γ=3) IS the C1-barrier (γ₁=1) = within-fence boundary.
  So genuine American needs NO fence-lift — RE-PARAMETRISE to C1-units (|Γ|≤1 is a C0-units artifact).
  FIRM CORRECTION to manager's "escrow falls out/eliminated": escrow RECLASSIFIED not eliminated — pool is
  SHORT the curvature (R''<0), escrow = short-gamma counterparty funding, INTRINSIC to C1 trade but NOT
  escrow-free. Failure mode: curvature is NOT positively replicable from pool's own C0 primitives (Γ=3>1 =
  BL4 negative-weight); transport lives in C1-barrier basis. RE-SCOPE: genuine-American item → "operate
  American in C1-units (γ₁=1 barrier, existing fence shape) + escrow as C1 short-gamma counterparty," same
  economics cleaner mechanism. Transport flagged to Aristotle.
MANAGER CATCH (refinement, NOT a blocker — careful not to over-dramatize per intern8 lesson): "lift to C1"
is TWO different C1 operations — value/American = SLOPE-READ on C1 (additive, Γ=3, the 2sinh(3δ)); funding
= C1 COORDINATE sNorm² (multiplicative, 2Γ). Same curve, different reads, coincide only Γ=2. Research lead
keeps distinct (Q3b) but "uniform through&through" framing blurs it. Rohan's model refined to "same curve
C1, value reads its slope, funding reads its coordinate."
ARISTOTLE RELAY written (relay_to_aristotle_C1_items.md), 7 itemised: 1 C1 invariant (thm vs trivial); 2
tx reduction (thm vs definitional); 3 shortcut 2sinh(Γδ) (sorry-free, manager-verified attached); 4 gammaEff=
2Γ derived-vs-definition + stays multiplicative-distinct; 5 (LOAD-BEARING) positivity TRANSPORT C0→C1
(sorry-free vs trivial — decides re-scope); 6 (MANAGER ADD) exact map γ₁↔Γ + reconcile two-C1 (sNorm²
multiplicative Γ=1→2 vs curvature additive Γ=1→3 — where the two 2s could re-merge); 7 (MANAGER ADD) funding
exponent of a C1-American (6? 2? distinct?). Unblock map: 1-4,6 before chart render; 5+7 before engine/
settlement. NO HTML/engine edit pending 1-4,6. All Lean trusted-from-prover (mark thm/definitional/trivial).

### TERMINOLOGY FIX — "C1" overload scrubbed (Rohan catch)
Rohan flagged: manager had overloaded "C1". Manager used C0/C1 as ad-hoc shorthand for AMM curve / its
first-derivative curve (digit = derivative order). But the PROJECT already defines C1 & C4 as named
VERIFIED RESULTS (from temporal_paper_draft.md Formal Verification annexure): C1 = composite-ray closed
form for settlement holds across OTM→ITM boundary under effective-strike substitution (= proven close-
equals-exercise equivalence); C4 = no-internal-arbitrage biconditional (costless-collar surplus zero iff
pool symmetric w=½). ALSO collides with the two-tx composite-ray shortcut (a spread's INNER+OUTER strike
legs reduce to one swap at θ*=√(θin·θout), δ=½log(θout/θin)) — legs labelled inner/outer, NOT C1. Rohan's
instinct (C1~composite-ray) was actually closer to the real C1 than manager's curve usage. Research lead's
reply ALSO inherited the overload (C1-barrier/C1-units vs "C1/C4 scaffolding"). FIX (adopted going forward):
AMM curve (exponent Γ); first-derivative curve = AMM′ (exponent γ′); C1/C4 reserved for the proven results
only. Manager scrubbed both notes + rewrote the Aristotle relay (CRITICAL — not yet sent, Aristotle works
in formal space where C1/C4 are theorems). FILES RENAMED: qa_round_lift_to_C1.md → qa_round_lift_first_
derivative.md; relay_to_aristotle_C1_items.md → relay_to_aristotle_lift_items.md (old files removed). New
flag note_to_research_lead_C1_overload.md asks research lead to adopt AMM/AMM′ + reserve C1/C4. Substance
unchanged — purely terminology. All 7 Aristotle items intact under new names (γ₁→γ′, "C1 invariant"→AMM′
invariant, etc.). Item 3 now explicitly cites the shortcut generalisation as DISTINCT from verified result C1.

### TAXONOMY HYGIENE — three scales / three "2"s (Rohan level-vs-exponent catch)
Rohan caught a level-vs-exponent scale-mixing: asked if curve indexed at 0 or 1 (why American is "3" not
"2"). RESOLUTION (verified): THREE distinct scales. (1) Derivative LEVEL n of potential R(MP): curve=0,
slope/barrier=1, curvature/American=2 (+1 per lift). (2) EXPONENT Γ in (sNorm/θ)^Γ: barrier=1, American=3;
tied by Γ=2n−1 (each level +2 in exponent = the coordinate Jacobian). (3) Funding gammaEff=2·Γ (code:
2*gamma, multiplicative coordinate re-read on sNorm²): barrier 2, American 6. Two coincidences cause all
mix-ups: level1=exponent1 at barrier (why level/exponent conflated); +2 and ×2 agree only at Γ=2 (why
additive-rung/multiplicative-funding conflated). So curve is LEVEL 0 (nobody indexes at 1); Rohan's "2" =
correct LEVEL, research guy's "3" = correct EXPONENT, same instrument two rulers. The 3 and 6 are FORCED by
math already in place (ladder map + 2*gamma rule self-consistent; fundingAmerican already computes 6 for
Γ=3, NO internal fence — only open-fence in legPriceAmerican blocks Γ>1). BUT "already correct" ≠ certified
(American=Γ=3 rests on Item 5 transport, pending Aristotle) and ≠ reachable (open-fence blocks Γ>1; formula
correct but never receives 3 today). DO-NOT-CONFUSE: into funding rule pass AMM-curve exponent Γ=3, NOT
AMM′-label γ′=1 (→barrier funding 2 by mistake), NOT level n=2. File: taxonomy_three_scales.md (reference
card). "One factor of 2, three costumes: +1-per-lift, +2-per-level, ×2-of-exponent."

### CONVEXITY-KNOB IMPLEMENTATION BRIEF (research lead) + MANAGER VETTING + BASELINE RECONCILE NOTE
Research lead sent implementation brief for the convexity knob (continuous-γ American): one knob γ
(=1 barrier, ∈(1,3] convex American, >3 reject); ARCHITECTURE = effective-strike translation (American
at (K,γ) IS the barrier read at θ_eff=americanThetaEff(wing,K,γ,sNorm) on the ORIGINAL curve, mark(θ_eff)=
(sNorm/K)^γ; reuse barrier machinery, γ enters via θ_eff (value/tx), 2γ (funding), γ·δ (spreads); NO new
curve) — NOT chosen: native first-deriv invariant (only as test assertion). Tiered fence: |γ|≤1 safe / 1<γ≤3
allowed+escrow-required / >3 reject. Checklist: tiered fence in legPrice+funding; 2sinh(δ)→2sinh(γδ); route
γ→θ_eff through open/tx/close/settle; escrow leg for γ∈(1,3]; invariant test sNorm²·MP=β/α. Gating: fence+
escrow rests on L5 positivity transport (research lead derived analytically high-conviction, Aristotle stamp
queued); changes 1-3,5 L5-independent, change 4 (escrow) L5-dependent/revert-risk. 3 open decisions: γ free
vs vol-pinned; funding anchor oracle-lifted vs ATM; authorize escrow now vs hold for Aristotle.
MANAGER VETTING (verified vs approved engine intern4, md5 97789822, 4687 lines): BRIEF HAS TWO CODE-STATE
ERRORS (likely written vs a different/earlier build — cites ~4300 lines, fence ~2112, "standalone fns",
none match intern4). (1) FENCE: brief says fundingAmerican fences |γ|>1 at ~2112 & corrects manager card —
WRONG. Only gamma fence is legPriceAmerican LINE 2224 (|gamma|<=1 reject, +gamma=0/K>0 at 2225-26).
fundingAmerican (2238-2244) has NO fence (computes 2*gamma for any γ). Line 2112 = band-close ("neither leg
ITM"). MANAGER CARD VINDICATED. Tiered gate goes in ONE place (open/2224); funding inherits; funding formula
needs NO edit (already 2*3=6 for Γ=3). (2) "STANDALONE/NOT WIRED" claim WRONG: American layer fully wired in
intern4 — open UI@3422→openAmerican@2732→legPriceAmerican@2740→executeLeg; fundingTick@2805→fundingAmerican
@2827, fundingTick invoked@2939; closeAmerican@2790→button@3479; portfolio Γ+funding@3465/3471. "Wiring is the
bulk" is OFF — wiring done; real scope NARROWS to: tiered gate@2224 + shortcut γ-scaling(2sinh(γδ)@~1612/1782/
3753) + escrow(L5-gated) + invariant test. DESIGN SOUND (effective-strike translation matches Q1; tiered gate;
escrow short-gamma reasoning; phased gating all stand). RECOMMENDATION: DO NOT authorize intern yet —
reconcile baseline first (get research lead onto intern4, re-issue brief w/ corrections). Hold change 4
(escrow) for Aristotle L5; hold everything until baseline reconciled then ship 1-3,5 first. On 3 decisions:
γ = product/calibration call for Rohan; funding anchor = needs decision, constraint is CONSISTENCY across legs
(manager leans oracle-lifted for rebase-safety); escrow = hold for Aristotle (revert-risk per brief itself).
File: note_to_research_lead_baseline_reconcile.md (sent — points to intern4, both corrections, narrowed scope,
affirms design). NEXT: research lead re-issues vs intern4; then authorize L5-independent changes, hold escrow
for Aristotle Item-5.

### CONVEXITY-KNOB BRIEF v2 (research lead) — APPROVED w/ gating clarification
Research lead re-issued brief v2: baseline reconciled to intern4 (md5 97789822, 4687 lines), BOTH manager
corrections folded in (one fence@2224 not funding; American layer already wired → scope narrowed). Provenance
note: line/wiring map trusted-from-manager's-verification (research lead doesn't hold intern4) — mirrors
trusted-from-prover, explains v1 drift. v2 scope: (1) tiered gate@open (2224/openAmerican 2732): ≤1 as-is /
1<γ≤3 iff escrow wired / >3 reject; (2) shortcut 2sinh(δ)→2sinh(γδ) @~1612/1782/3753; (3) escrow leg γ∈(1,3]
(L5-dependent); (4) invariant test sNorm²·MP=β/α. No funding edit (already 6@Γ=3), no wiring (done), no 2nd
curve. Gating: authorize 1,2,4 now (L5-independent), hold 3 (escrow) for Aristotle Item-5.
MANAGER CAUGHT (safety-critical): v2 says items 1,2,4 "ship convex value/funding/render for γ≤3" + hold only
escrow — but item 1 gate allows γ∈(1,3] IFF escrow wired; escrow held ⇒ γ>1 MUST REJECT at open. So can't have
a TRADEABLE γ>1 position in Phase 1 (would under-collateralize — research lead's own warning). "ship convex
value/funding" conflates RENDER (chart preview, safe, L5-independent) with TRADEABLE (needs escrow+L5).
RESOLUTION = explicit phasing: PHASE 1 (authorized now): γ-scaled shortcut + invariant test + chart RENDER of
convex shape (preview) + tiered-gate SKELETON with (1,3] branch REJECTING while escrow absent (the "iff escrow
wired" must actually reject γ>1 at open, not silently allow) → convex American VISIBLE not TRADEABLE, γ=1
byte-identical. Preview render must compute marks on a path NOT through legPriceAmerican's open-fence (so
rejection doesn't blank preview). PHASE 2 (hold for Aristotle L5): escrow leg flips (1,3] to ALLOW → tradeable.
If L5 fails only Phase 2 reverts. AUTHORIZED Phase 1 to intern (items 2,4,convex render,gate skeleton); HELD
escrow for Aristotle. γ=1 byte-identity + blob lengths = manager verifies on returned build. Two open decisions
(Rohan): γ free vs vol-pinned (doesn't block P1); funding anchor oracle-lifted(manager lean, rebase-safe) vs
ATM (must apply same to barrier+American, bears on P2 funding not P1). File: reply_convexity_brief_v2.md.

### DECISIONS LOCKED + INTERN BRIEF/ZIP SHIPPED (convexity knob)
Rohan's clarification answers (supersede brief v2's phasing): (1) MAKE IT TRADEABLE — no Phase1/2 split,
settlement basis = carve-time carve equity (carvedEntryEquity frozen + attributablePnL escrow =
carvedEquityAtClosure). Bounded BOTH ways by carve equity (trader payout + pool exposure both capped) → safe
tradeable in MVP, no under-collat. (2) NO CAP AT 3 — γ free via up/down stepper (not slider), both signs
(γ>1 convex call, γ<−1 convex put), γ≠0; "3" was just a theoretical landmark not a limit. (3) Funding =
point-on-curve pool-vs-anchor, same on lifted curve = exactly what fundingAmerican already does (2γ); NO
change. (4) Hardcode vol/γ for now (no oracle; stepper value, default γ=1). (5) re-explained simple: γ=1
byte-identical = hard rule; draw convex with value form (sNorm/K)^γ NOT intern8's Γ→2γ; butterfly check now
optional not gate.
MANAGER VERIFIED last open item: closeAmerican@2790 → _amClose ALREADY does carved-slice settlement
(carvedEquityAtClosure, attributablePnL) — American ALREADY settles through carve-time carve equity, NOT
band-only. So settlement plumbing DONE. SCOPE COLLAPSED: the ONLY blocker for convex American is the open
fence @ legPriceAmerican LINE 2224 (|gamma|<=1 reject). Lift it → convex American prices/opens/funds/closes/
settles through existing machinery. NOTHING TBD at Rohan's or manager's end.
INTERN BRIEF written (INTERN_BRIEF_convexity_knob.md) + ZIP shipped (convexity_knob_intern_pkg.zip): brief +
v25_intern4.html (baseline) + regression_harness_v2.js + american_layer_harness.js + taxonomy_three_scales.md.
CHANGE SET (small/surgical): (1) lift open fence @2224 (remove |γ|≤1 reject, KEEP γ=0 & K>0, no upper cap;
optional tooltip @~1255); (2) chart render convex shape as (sNorm/K)^γ value form, DISCARD intern8 Γ→2γ; (3)
shortcut 2sinh(δ)→2sinh(γδ) @~1612/1782/3753 (γ=1 reduces exactly); (4) γ up/down stepper, default 1, both
signs, ≠0, no cap, hardcoded. NOT IN SCOPE: funding (already 2γ no fence), settlement/escrow (already carve-
time equity via _amClose), tx (executeLeg routes θ_eff), no 2nd curve/oracle/proof-dependency. DONE BAR: γ=1
byte-identical (BOTH graders exit 0) = hard non-negotiable; convex call γ∈{1.5,3} + convex put γ=−1.5 trade/
fund/settle; γ=0 rejects; large |γ|=8 finite; invariant sNorm²·MP=β/α; optional butterfly sanity. FILE-SAFETY:
blobs webp 273864 / svg 5168 chars unchanged, Node-syntax-check 3 script blocks, no signature changes, 4687
lines. Aristotle positivity proof DECOUPLED (rigor not gate — solvency=carve, pricing=vol-anchor/venue-yoke).
NEXT: intern executes; manager verifies γ=1 byte-identity + blob lengths + graders on returned build.

### INTERN BUILD VERIFIED — convexity knob (temporal_mvp_v25_convexity.html) → APPROVED
md5 8ec963d6f0310aeb64c7f2135eaba940, 4784 lines (+97). FILE-SAFETY PASS: blobs webp 273864 / svg 5168
unchanged; 3 script blocks all Node-syntax-OK; Engine export set IDENTICAL to baseline; only signature
touched = vsValue gained optional defaulted param (gamma=1) — backward-compatible; bsValue/fundingAmerican/
closeAmerican/americanThetaEff/mark all unchanged (fundingAmerican 2*gamma line byte-identical).
HARD GATE γ=1 BYTE-IDENTITY: curve grader 16/16 PASS, every number identical to baseline (627.68/376.61,
PI hops -8691.28 etc). American grader γ=1 call/put anchors price byte-identical to barrier (0.16667/0.15),
C_collapse machine-precision. NEW REGIME |γ|>1 (probed at engine level inside sandbox): prices finite;
V=N·min(1,(sNorm/K)^γ) EXACT (exponent γ NOT 2γ — chart uses (sN/θ)^γ, intern8 Γ→2γ correctly discarded);
convexity monotone (V3<V1.5<V1 OTM call); funding carries 2γ finite; γ=0 rejects; large |γ|=8/12/30 finite
no overflow; invariant sNorm²·MP=β/α holds on-curve (off-curve "fail" was my bad test pools, closed).
CHANGE SET vs brief: (1) fence lifted @legPriceAmerican (removed |γ|≤1, kept γ=0 & K>0) ✓; (2) chart draws
value form (sN/θ)^γ, Γ→2γ discarded ✓; (3) γ up/down stepper default 1, ±0.1, both signs, ≠0, no cap ✓;
(4) vsValue γ param default 1 (forward-looking). CORRECT DEVIATION FROM MY BRIEF: intern did NOT γ-scale the
two band-spread spots (1903/4271), left them γ≡1 with comment — VERIFIED RIGHT: legPriceAmerican prices as
SINGLE barrier V=N·mark(wing,θ_eff,sNorm), never traverses a spread closed-form, so only vsValue's def needed
the param. Good catch; refines the brief. American object schema (line 2791) carries wing/K/gamma/N/status →
chart open-wing renders.
TEST-SUITE MAINTENANCE (manager): american grader G_gamma_gt1 encoded OLD contract (|γ|>1 rejects); updated
to NEW contract (|γ|>1 accepted+finite+value-form-correct, γ=0 still rejects). BOTH graders now exit 0.
Saved: outputs/temporal_mvp_v25_convexity_VERIFIED.html, outputs/american_layer_harness_v2_gamma.js.
HONEST SCOPE BOUNDARY: engine-level pricing+funding fully verified; settlement (_amClose carve-time equity)
verified by code-identity (byte-unchanged) + prior-session wiring, NOT a live Store-level open→fund→close
roundtrip at γ>1 (_amClose lives in UI/Store block, not an Engine export; egress wall blocks Playwright) →
live γ>1 close-roundtrip is the TESTER's to confirm. WATCH-ITEM stands: high |γ| steep 2γ funding depletes
carve equity fast but bounded both ways (settles finite at bound). VERDICT: APPROVED for the convexity knob.

### TESTER PACKAGE SHIPPED — convexity_knob_tester_pkg.zip
Single zip (5 files, 540030 bytes): TESTER_BRIEF_convexity_knob.md + temporal_mvp_v25_convexity.html (the
manager-VERIFIED build, md5 8ec963d6, byte-identical to upload) + regression_harness_v2.js + american_layer_
harness.js (updated G_gamma_gt1) + taxonomy_three_scales.md. Brief scopes: T1 PRIMARY = live γ>1 open→fund→
close→settle roundtrip (γ∈{1 control,1.5,3,−1.5}; confirm finite $ payout, carvedEquityAtClosure=carvedEntry
Equity+attributablePnL, payout=L0·raw_net·carvedEquityAtClosure, γ=1 matches barrier to cent, bounded both
ways) — this is the link the manager could NOT verify (egress wall, _amClose in UI/Store layer). T2 steep-2γ
funding depletion graceful/finite at high γ. T3 stepper UX (±0.1, skip 0, no cap). T4 chart (convex wing,
dashed preview, eyeball γ=1 preview clutter). T5 rejects (γ=0/K≤0 reject, |γ|>1 opens). T6 portfolio. Evidence:
JSON runlogs → consolidated PDF, screenshots ~150DPI JPEG q72. T1+T2 gates, T3-T6 quality.

### PIVOT — static-warped rebuild (shaped by Rohan + research lead), supersedes the v25 WIP
DIRECTION CHANGE (Rohan co-shaped with research lead): switch architecture from the v25 WIP's dynamic-funded
design (pool stays on UNTEMPERED curve, convexity leaned on funding+carve — manager VERIFIED executeLeg moves
pool by premium cash dy=±V_usd onto untempered curve, so pool hedge is barrier-style/delta-linear) to a
STATIC-WARPED design: temper the weight w→w_Γ=w^Γ/(w^Γ+(1−w)^Γ) ≡ sNorm→sNorm^Γ, ONE substitution applied
like-to-like across every interface, so the POOL itself carries the convexity. Build FRESH from the stable
barrier base temporal_mvp_v24_rebase_fixed_2.html (in /mnt/project/), NOT from the v25 WIP (discarded). Γ=1
byte-identical to barrier base by construction; audit row-by-row vs the barrier-beside-general spec table.
MANAGER-VERIFIED this turn: (a) WARP claim TRUE (pool on untempered curve) but it's the dynamic-funded design
Rohan locked, not an accidental bug — RL reframed a design choice as "wrong"; (b) FUNDING: engine 2γ vs RL
plain-Γ mark-deviation are SAME at Γ=1 (×2=pure κ) but GENUINELY DIFFERENT FUNCTIONS for Γ>1 (γ=3 ratio runs
0.86→2.70 across s, NOT absorbable into κ) — manager OWNED error: mapped Rohan's "point-on-curve" principle to
engine 2γ + said "no change" (Decision 3) was WRONG; pure point-on-curve read = plain Γ, the 2γ was the
dynamic-funded gamma-compensation (different premise). WIP solvent either way (carve bounds both ways) so
warp/funding = fairness+rigor not blow-up — same logic as L5-is-paper-rigor.
ROHAN DECISIONS THIS TURN: (1) NO HARD CAP at 3 — the |Γ|≤3 is a SOFT UX-knob range, NOT an engine reject;
engine handles any Γ; CONSEQUENCE (manager flag): Γ>3 then operates OUTSIDE the Lean positivity proof (proof
covers one lift |Γ|≤3), leans on carve for solvency — same posture as WIP. The spec table's "reject Γ>3" row
CONFLICTS with this → implement soft-UX (no hard reject), flag deviation to RL. (2) spec-table audit vs live
barrier base = approved. (3) Lean stamp "handled by G" — manager keeps honest trust-from-prover posture, proof
confirmation deferred to them, not manager-verified. (4) FUNDING = same point-on-curve pool-vs-anchor logic
read on the LIFTED curves (mark_Γ) = plain-Γ deviation κN((sNorm/θ)^Γ−(anchor/θ)^Γ), SINGLE consistent
coordinate (mark_Γ space, never the squared coord) — this is exactly the discipline that keeps the spurious 2
out. (5) regression oracle = BARRIER BASE not the WIP (Γ=1 funding differs from WIP by ×2, expected).
LOGISTICS: tester PAUSED ("chilling"). MANAGER = current instance (NOT respawn) — Rohan considering, manager
agrees for a bounded one-shot pass (full fork+funding-fix+failure-mode in context; respawn would reload lossily
from a pkg that points at the discarded WIP). Caveat: respawn IF it balloons into multi-pass slog. The respawn
pkg (temporal_manager_respawn_pkg.zip) is now STALE (enshrines WIP) — refresh canonical to reflect pivot so a
later handoff is clean. NEXT: obtain RL's barrier-beside-general expression table + lift_note_v2.pdf → audit
row-by-row vs live v24 barrier base BEFORE intern pass; flag conflicting rows (Γ>3 fence first).

### Γ-CURVE EMPIRICAL VALIDATION (parallel to Aristotle) — report delivered
Build v24_base.html md5 6f606f52. TASK 1 framing check PASS (definitive): 12-trade sweep on live engine,
X·Y (shifted CP, X=x−α,Y=y−β) CONSERVED max|drift|=5.3e-15; getDepth=x^w·y^(1−w) DRIFTS 12/12 steps. So
engine IS the a=½ weighted-CP in shifted reserves, getDepth=display metric. (= earlier getDepth-drift finding
restated as a=½.) Confirms build + the a=½ fact. TASK 3 regression gate PASS (inherited): their sympy a=½ slide
= byte-identical live tradeUpdate, consistent with Task1. TASK 2 self-hedge sweep = STOP-AND-REPORT (could not
run as specified, per discipline — did NOT force a verdict). Candidate a(Γ)=(Γ−½)/Γ VERIFIED internally sound:
gives mp∝sNorm^(−2Γ) exactly (Γ=1,2,3→−2,−4,−6) = the weight matching the BARRIER's value-vs-price elasticity.
But "pool reserve value − claim" splits into 2 channels, neither runnable: (1) reserve-coordinate backing X/α=
sNorm is WEIGHT-INDEPENDENT (spec's own note sNorm=X/α curve-indep) → warp does nothing, convex cheaper OTM so
margin≥0 trivially (Γ=2 min+0.020, Γ=3 min+0.039), meaningless as warp test; (2) weight-dependent value V∝P^a
∝sNorm^(−a/(1−a)) concave for all a∈(0,1), never =barrier sNorm^1, does NOT anchor at Γ=1 + concave can't track
convex claim for ANY weight. CONCLUSION/Task4: cannot corroborate OR refute margin≥0 at candidate — no curve-only
"pool reserve value" both anchors at Γ=1 AND responds to warp. Warp acts on PRICE-ELASTICITY channel only; reserve-
backing channel is weight-independent. NEED: protocol's exact "pool reserve value" map (carve/settlement cE/raw_net
accounting) to run the literal sweep. G3 TRIANGULATION: candidate is the price-elasticity-matching weight (verified);
fork for Aristotle — is self-hedge a price-elasticity property (candidate corroborated) or reserve-backing property
(no weight fixes it, convexity must be funded = dynamic-funded view)? Report: outputs/gamma_curve_empirical_report.md.

### BASKET-GAMMA vs LIVE §2.10 BARRIER — STOP-AND-REPORT (gamma inverts; culprit = mark cap)
Re-sync architecture: convex member = perpetual-American power-law V=A(S/K)^γ (γ=Cauchy-Euler root from vol),
replicated by density-weighted basket of barrier legs, density f''=γ(γ−1)K^(γ−2) (P1/Carr-Madan), curvature in
the spread. Credited my empirical calls; dropped the pool-reserve-value margin sweep (agreed not the backing).
ONE ask: does basket aggregate gamma survive live §2.10 barrier/settlement for γ∈{1,2,3}; if not report which
term eats it. MANAGER RESULT (verified numerically): abstract math CORRECT for PLAIN CALLS (basket→S^γ, gamma
+2.0/+6.0 at γ=2/3, matches their 3.354/3.357). BUT live barrier is CAPPED mark min(S/θ,1), NOT a plain call.
Tested live basis + 2 other readings: capped barrier → gamma INVERTS (−2.0/−6.0); uncapped ramp S/K → 0 (linear);
mark-difference spread (mark θ−mark θ') → ~0/−0.12. ONLY plain call reproduces +gamma. CULPRIT: the mark cap.
min(S/K,1)=S/K−(S−K)⁺/K → all curvature in the −(S−K)⁺/K cap term, NEGATIVE sign → positive-density basket of
capped barriers is CONCAVE not convex S^γ. So "ship the basket, nothing new, composes with §2.10" does NOT hold:
abstract replication needs plain-call (uncapped convex-kink) legs; live §2.10 barrier removes exactly that via cap,
inverting curvature. OPEN END EXISTS (contra "essentially none"): need uncapped/convex-kink leg primitive (new) OR
a signed/spread construction recovering +curvature (3 natural readings tested, all fail; did NOT patch toward green).
TO FINISH: need exact per-leg spread (θ,θ') recipe if construction isn't single capped legs. Report:
outputs/gamma_basket_settlement_check.md.

### DECISION LOCKED + INTERN BRIEF (curve-shape convexity) — supersedes basket AND v25 WIP
Rohan + manager aligned (mutual misread cleared: manager was flagging basket as BROKEN, steering to curve-shape;
Rohan leaned curve-shape). LOCKED: convexity from CURVE SHAPE (temper weight a=(Γ−½)/Γ on shifted reserves
(X,Y)=(x−α,y−β), X^a Y^(1−a)=k), single-Γ pool, WHOLE pool order-Γ (perp+bands ride same curve, Rohan said yes),
NOT the basket (cap inverts). MANAGER VERIFIED the mechanism numerically before specing: (1) generalized getMP_raw
(a/(1−a)·(y−β)/(x−α)) + tradeUpdate (weighted slide) reduce to LIVE at a=½ BYTE-IDENTICAL (0.0 / 2.7e-15); (2)
a=(Γ−½)/Γ gives mp∝sNorm^(−2Γ) (−2/−4/−6 for Γ=1/2/3); (3) SELF-HEAL confirmed — convex claim (sNorm/θ)^Γ on
steepened curve carries BARRIER's price-elasticity mp^(−½) for all Γ → existing carve/funding/settlement (calibrated
for mp^−½) handle it with NO under-hedge (unlike WIP flat-curve mismatch, unlike basket cap-inversion). BRIEF written:
INTERN_BRIEF_curve_shape_convexity.md. Edit list: curve=getMP_raw@1597 + tradeUpdate@1617 (weight a from pool state);
read=mark@1601 →(sNorm/θ)^Γ capped, Γ module-const so 24 callers + raw_net inherit (settlement unchanged); funding=
fundingPerStrike@2083 → difference-of-lifted-marks κN(mark_Γ(pool)−mark_Γ(anchor)) NOT mark·(S−1)/S; shortcut 2sinh(δ)
→2sinh(Γδ)@1612/1782/3753; param=pool Γ default 1 hardcode-from-vol. DONE BAR: Γ=1 byte-identical (harness exit 0);
Γ∈{2,3} mp∝sNorm^−2Γ + claim elasticity mp^−½ + finite + whole-pool-Γ; WIP under-hedge must not reappear. FILE-SAFETY:
build on v24 6f606f52, blobs 273864/5168, 3 script blocks, no signatures change. NOT in scope: basket/2nd curve/oracle/
per-leg Γ. NEXT: intern executes; manager verifies a=½ byte-identity + harness + the Γ>1 elasticity/finiteness.

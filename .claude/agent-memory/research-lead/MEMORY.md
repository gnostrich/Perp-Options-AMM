# MEMORY — research-lead

### FUNDING-PROFILE DECISIVE MEASUREMENT (operator entries 438–444) — sign inversion is at the POOL ANCHOR not the leg ATM; shipped is NOT entry-386 same-slope — 2026-07-07
Measured the REAL shipped funding fn against the OTM→ATM→ITM put sweep (HEAD `51342574` engine blocks=`0e0a0062`;
vm-extract, no web/git/Aristotle). Harness `scratchpad/funding/{engine_block.js, sweeps}`. Report returned INLINE
to manager; persist as `notes/research/VERIFY_funding_profile_2026-07-07.md`.
Shipped fn `fundingPerStrike` (HTML L2349-2357): `f = kappa · (±g) · N · mark · (S−1)/S · dt`, put wing gamma=**−g**
(FIXED by identity), mark=`markLensed(put,θ,mode,g)`∈(0,1] (>0), `S = poolMark(state,oracle,oi)/oracle`.
- **CRUX #1 — oracle CANCELS in S:** poolMark=getMP_raw·(oracle/oi) ⇒ S=getMP_raw/oi, independent of live oracle
  (measured: S=1.0000 at every oracle on a frozen pool). ⇒ dragging spot alone leaves S=1 ⇒ funding **IDENTICALLY ZERO**
  the whole sweep on an equilibrium pool. Funding is a POOL-disequilibrium quantity, not a per-leg-moneyness one.
- **CRUX #2 — does the put sign invert at ATM? Depends on flow, and the zero is at the ANCHOR not the mode:**
  (a) frozen pool (drag oracle only): S const ⇒ **sign FIXED, NO inversion**; magnitude ∝ mark = MONOTONE rising
  OTM(→0)→ITM (saturates at kappa·g·(S−1)/S as mark→1, i.e. funds full intrinsic forever). (b) arb-each-step (the
  realistic UI flow — hint tells you to Run Arbitrage): getMP_raw→oracle ⇒ **S=oracle/oi tracks spot** ⇒ sign flips at
  **oracle=oi (DEPLOY price)**, magnitude NON-MONOTONE (zero at anchor, rises both ways = the operator's "sus" shape).
  The flip coincides with the put's ATM ONLY when strike==deploy price (measured: K=80000=oi flips at ATM; K=100000≠oi
  flips at spot=80000=ITM θ=1.25, NOT at the put ATM spot=100000). So the inversion is a POOL-ANCHOR event, not a
  per-leg mode event. Manager's two conclusions were each half-right and conflated: ±g wing sign IS identity-fixed;
  the (S−1) factor DOES flip — at the anchor.
- **#3 extrinsic base (mark−max(intrinsic,0)):** frozen pool ⇒ CLEAN SINGLE HUMP peaking ~ATM, fades to 0 deep OTM
  AND exactly 0 deep ITM (past smooth-paste seam θ*=mode·(g+1)/g extrinsic≡0). Fixes the "funds full intrinsic forever"
  tail. BUT arb-each-step ⇒ still non-monotone (double-hump straddling the anchor zero). Operator's entry-444 guess
  "extrinsic keeps going up as we cross" is WRONG per numbers — extrinsic is a HUMP that fades ITM.
- **#4 same-ray vs same-slope:** shipped = [same-RAY mark at θ] × [GLOBAL pool-anchor gap (S−1)]. It does NOT compute
  the entry-386/443 same-slope per-strike pool-vs-anchor read. Modeled the same-slope view (dev=θ/mode−1, zero+flip at
  mode): reproduces EXACTLY the operator's sus shapes — sign inverts at the mode, |f| dips to 0 at ATM then rises both
  ways, blows up deep ITM (no saturation). So adopting entry-386 literally INTRODUCES the suspicious inversion.
- **VERDICT vs smell test:** clean monotone-magnitude+sensible-sign profile exists ONLY for frozen-pool same-ray FULL
  mark (but funds full intrinsic forever) or frozen-pool EXTRINSIC (single hump, the physically-nicest). Under the
  realistic drag+arb flow BOTH bases go non-monotone with the sign-flip at the deploy anchor. **OPERATOR-TIER CHOICE
  EXPOSED:** (i) should funding key off the pool anchor=deploy price (shipped) or per-leg moneyness/ATM? (ii) full-mark
  vs extrinsic base? (iii) entry-386 same-slope is NOT what ships and would add the sus inversion. No git/engine/Aristotle.

### ESCROW-DENOMINATION VERIFY (operator entries 436/437) — CLEAN across wings + rebase; ONE protocol seam + ONE denomination CHOICE — 2026-07-07
Verified operator's value-denomination model against REAL engine (HEAD `28b647e9` WT HTML; engine blocks = `0e0a0062`).
vm-measured, no web/Aristotle/git. Harnesses `scratchpad/escrow/{h1_unit,h2_close,h3_sym,h4_cross,h4b,h4c,h5_gauge,h6_roundtrip,h7_ceiling}.js`
(vm vs extracted Engine). Report returned INLINE to manager (no report .md written; persist as
`notes/research/VERIFY_escrow_denomination_2026-07-07.md`). Frame: default pool w=½ ⇒ getSNorm=1; strike ray θ=K/oracle;
markLensed(wing,θ,sNorm,g) is a pure fn of ρ=sNorm/θ; test g=m·γ=2 (m=2).
- **(1) Escrow unit is WING-DEPENDENT in classical $, symmetric in escrow $.** Put intrinsic arm mark=1−sNorm/θ=(K−S)/K
  = intrinsic/**K** (unit=strike, cash); call arm mark=1−θ/sNorm=(S−K)/S = intrinsic/**S** (unit=spot, asset). mark∈(0,1),
  sup=1 approached asymptotically (measured 0.99899/0.99900), NEVER exceeds 1 (solvency ceiling ≤1 escrow unit/contract;
  v24 mark() hard-capped =1, markLensed approaches via linear arm). ATM θ=1 mark=0.1481 both wings (=g^g/(g+1)^(g+1)).
- **(2) CRUX (manager's flag) reconciled with numbers.** 1 escrow unit does NOT convert to K, NOT to S — it converts to
  **carvedEquityAtClosure** (one carved-perp equity, $), applied UNIFORMLY to both wings in closeBand (raw_net=Y−X escrow
  units × carvedEquity × L0). Engine NEVER pays classical dollar intrinsic. mark_put=intrinsic/K is the mark's fraction-of-
  strike STRUCTURE, not the payout. At ATM K=S=oracle ⇒ both wings' full-exercise = one perp = consistent anchor (where the
  unit is DEFINED). Measured deep-ITM put (θ up to 8.75): engine pays escrow-value × perp-equity, wholly decoupled from
  N·(K−S) classical intrinsic (5000…31000 $). = a self-contained normalized denomination, internally consistent.
- **(3) CALL/PUT reflection EXACT.** markLensed('put',θ,sNorm)=markLensed('call',θ,θ²/sNorm) to 1e-17. Matched reflected pair
  (put Kp ↔ call Kc=oracle²/Kp): escrow marks EQUAL (0.333/0.333…0.9/0.9) while classical intrinsics DIVERGE (put K−S unbounded
  vs call S−K bounded by S). Escrow denomination MAKES wings symmetric (the design goal, C3) — the asymmetry only appears if you
  insist on per-wing classical dollars, which the engine deliberately does not.
- **(4) OTM/ITM traverse: escrow MARKS clean, but the shipped two-case CLOSE PROTOCOL has a VALUE SEAM.** X (put) continuous
  through ρ=1. But at the branch flip (both-live → put-settled-to-cash, oNew≈74833) raw_net JUMPS +1.18e-2 = **45.4% of |raw_net|**,
  entirely on the live/OTM leg **Y** (call priced at DIFFERENT pool state across the branch: after-put-reversal vs un-moved pool).
  = the VALUE-layer twin of the directionality finding (swap clean, value seamed under (a)); close-(b) live-close single-branch
  dissolves it (parked-spec MR2, ~180× smaller). Marks are pure state fns ⇒ path-independent; residual round-trip pool drift =
  the KNOWN x-drain/arb-fixed-point, a pool-layer thing NOT a denomination leak.
- **(5) ATM reference movement = gauge-invariant COUNT, honest repricing VALUE.** Rebase: count N invariant. Rebase ALONE keeps
  w=½ ⇒ sNorm(ATM) invariant; mark reprices purely from θ=K/oracle = honest moneyness P&L. Rebase+arb re-equilibrates (w drifts,
  β invariant/α scales) and re-marks via ρ=sNorm/θ — still honest (pool re-marks to new oracle). Mark = pure fn of current
  (K,oracle,pool) ⇒ path-independent, no hysteresis. Reference moving = correct repricing, NOT a leak.
- **BOTTOM LINE to operator:** denomination is CONSISTENT across wings (reflection-exact) + across OTM/ITM (marks continuous) +
  across rebase (count-invariant, honest repricing). TWO residuals: **(i) the value seam at the two-case close branch (45% of
  raw_net) — a PROTOCOL defect, close-(b) fixes it, orthogonal to denomination; (ii) escrow→$ pays uniform carvedEquity not
  per-wing classical intrinsic — a DENOMINATION CHOICE (operator-tier: confirm deep-ITM payout is intended-symmetric-escrow, not
  classical K−S / S−K).** No git/engine/Aristotle. Handed to manager.

---

### ITM-CLOSE DIRECTIONALITY VERIFY (operator entry 433) — the ρ>1 crossed-wing gap IS dissolved; leak-free is NOT — 2026-07-07
Verified operator's close-(b) mechanic against REAL engine (HEAD `bf7380c` WT HTML; engine blocks = `0e0a0062`).
vm-measured, no web. Harnesses `scratchpad/closeb/{h_dir,h_residual,h_residual2,h_clean,h_band}.js` (vm vs extracted Engine).
Report returned INLINE to manager (system-constraint: no report .md written; manager to persist as
`notes/research/VERIFY_itm_close_directionality_2026-07-07.md` if wanted). Frame: default pool w=0.5 ⇒ getSNorm(mode)=1,
mp_raw=OI ⇒ priceSpot=1, theta=K/oracle; rho_tx=(theta/mode)^m crosses 1 EXACTLY at ATM (oNow=K). g=m·γ=2 at deploy;
put smooth-paste seam θ*=(g+1)/g=1.5.
- **PART 1 (value from option-price ratio) — CONFIRMED exact.** OPEN: `executeBand` L1982 `N_buy = V_sell/denom`,
  denom=`legPrice(...,1,tau).V` = per-unit LENSED markLensed value (the extended chart-2 curves); V_sell=leg1.V=N·(markLensed
  marks). NOT pool proceeds (comment L1838-1840 explicit: V "no longer sizes the pool swap dy", only value + N_buy).
  markLensed defined & CONTINUOUS ITM; past θ*=1.5 it EQUALS put parity 1−S/K EXACT (measured 0.3333/0.4118/0.5/0.6 at
  θ=1.5/1.7/2.0/2.5, mark−par=0.0000). So close-sizing-from-value works ITM (mark=parity, well-defined). **Today's engine
  does NOT do this** — closeBand reverses stored flows (frozen-arc `revertArc`)/cash-settles ITM leg; sizing-from-value is a
  NEW coherent (b)-design, not current code.
- **PART 2 (directionality) — CORE INSIGHT CONFIRMED, gap DISSOLVED.** dy-sign law = wingSign·legSign (call+1/put−1 · sell+1/
  buy−1). Swept put close (buy-put) moneyness θ 0.7→1→2.5 (OTM→ATM→deep-ITM): dy=+, dx=−, dw=+ at EVERY point, NO flip
  through ρ=1. The "which wing the trade point sits on" (sign of a=ln θ/mode) IS the thing that flips at ρ=1 (θ<mode→θ>mode).
  ⇒ defining the close by SKEW DIRECTION (sign dy/dw) is continuous & unambiguous through the crossing; "which wing" is
  correctly NOT the definition. Band-level: collar OPEN (sell-put+buy-call) both dy=− (same dir); CLOSE (buy-put+sell-call)
  both dy=+ (same dir, opposite to open) — the operator's "both legs same direction" check is ALREADY the engine invariant
  (L1826-1836). Slippage = standard curvature integral |Δy|−p₀|Δx| (L1998-2011), no moneyness branch, no ITM penalty — the
  only trader-facing cost. CONFIRMED.
- **BUT "zero residual / no leak" — NO (unchanged known finding).** Faithful (b) round-trip (dy frozen=−open, dx live via
  tradeUpdateAt): Δy=0 EXACT but Δx<0, one-signed pool loss, ∝dy² (drain/dy²→const as N→0), present at EVERY moneyness
  (OTM & ITM alike — NOT a crossed-wing artifact). = the SAME MR1 x-drain; frozen-arc (a) close Δval=0 exact. Small relative
  for tiny trades (0.0001% of parity value at N=0.05) but compounds (prior run #1: 30cyc@50% → pool dies). Neutralizer stays
  the pool-value FLOOR (already pinned MR1/run#2 sybil-floor). Directionality and the x-drain are ORTHOGONAL.
- **BOTTOM LINE to operator:** "close = value-sized q + same-direction-skew swap on today's curve + normal slippage" is a
  COMPLETE, directionally-coherent (b) definition that DISSOLVES the ρ>1 crossed-wing problem (supersedes my earlier "open
  corner"/crossed-ray flag) and feeds the parked close-(b) spec. It is NOT leak-free by itself: the pre-existing x-drain
  (∝dy², all-moneyness, one-signed) remains and still needs the floor. No git, no engine edits, no Aristotle. Handed to manager.

---

### RESIZE-BLINDNESS ON SHIPPED (a) — MICRO MEASUREMENT (RESEARCH RUN #5) delivered — operator entry 428 take-stock gap — 2026-07-07
Appended PART 5 to `notes/research/DEFENSE_TAKESTOCK_vs_dynamic_amms_2026-07-03.md`. NEW harnesses
`scratchpad/closeb/h11_a.js` + `h11b_patch.js` (vm vs HEAD engine extract). Question: is `revertArc`'s
LP-resize-blindness (run #3, quantified only in close-(b) CHARGE context) a real exploit on the CURRENT
SHIPPED design (a) — frozen-arc close, HEAD `4bc939ec` (funding slice on `0e0a0062`; engine blocks identical)?
- **VERDICT: YES — real, clean, SIGNED, CONSERVED, LIVE-reachable exploit on (a).** In (a) `revertArc` IS the
  close (directly sets reserves; no charge), so the leak is a DIRECT reserve mis-restoration, sharper than (b).
- **The play (ORDER 1):** add LP ×(1+λ) → open band at trade point → PULL LP → close. Full wallet accounting
  (λ=1, φ=0.5, depth 0.3, put ray): attacker LP add −1.6M, trade paid @open −321 795.92, LP withdraw @pull
  +1 760 897.96, trade recv @close (frozen arc) +321 795.92 ⇒ **ATTACKER NET +160 897.96 = honest-LP loss
  −160 897.96 EXACTLY.** Trade nets ZERO (frozen arc refunds exact arc regardless of pool size); the ONLY P&L
  channel is the LP round-trip = **pure profit φ·ΔV_open**, 1-for-1 from honest LPs. honestLoss+attackerGain=0
  to machine precision (clean transfer — NOT the (b) accounting-open caveat).
- **4 asks:** (1) mis-restoration = honest SHORT by φ·ΔV_open, gain → attacker LP claim (not trader payout,
  not w). (2) **w mis-restoration = ZERO** always (dwA absolute + w scale-invariant under isotropic resize);
  leak is 100% reserve VALUE, not w. (3) SIGNED/exploitable: ORDER 1 honest-lose; ORDER 2 (open→add→close→pull)
  is the inverse (attacker donates) so attacker picks ORDER 1; not noise. (4) magnitude: small band (depth
  0.03,λ=1) = $9 273/cyc = 0.58% pool; aggressive (depth 0.3) = $160 898 = ~10% pool; REPEATABLE/COMPOUNDS
  (8 cyc depth 0.1 → honest pool −8.36%); saturates φ≈0.8 (λ=4 traps close, arc>shrunk pool).
- **LIVE-REACHABLE:** LP deposit/withdraw are live buttons (HEAD L2968-2989 → Store.liquidity); `liquidity()`
  L2548 has NO open-band guard (only λ>−1). BUT shipped artifact is single-USER sim ⇒ no in-sim victim; real
  risk = CTO porting (a)'s resize-blind close to a MULTI-PARTY Go pool before close-(b) lands.
- **PATCH:** item ③ (scale arc by cumulative LP factor F) — MEASURED patched revertArc restores honest EXACTLY
  (honestΔ=0) at every λ. Nuance: in (a) it shifts shortfall onto trader's frozen refund (F·arc) — fine when
  attacker==LP-mover (kills all profit), but under-refunds an HONEST trader resized by others ⇒ **clean (a)
  standalone form = LP-LOCK (mitigation ii): ~2-line guard in liquidity() rejecting D<0 while any band open.**
  Arc-scaling form is right for close-(b) (per-leg charge state already exists).
- **RECOMMENDATION (flag, not decide — sequencing is operator-tier):** DOCUMENTED CTO-handover warning + optional
  cheap LP-lock guard on (a); whether to splice (a) now (engine-touching) = operator call. close-(b) still HOLDS.
No git, no engine edits, no Aristotle. Handed to manager.

---

### BEST-MITIGATION / PERP-VENUE SYNTHESIS (RESEARCH RUN #4) delivered — operator entry 418 ("figure out the best mitigation... parallel is perps and spot manipulation... whole book manipulation isnt unique") — 2026-07-03
Appended PART 4 to `notes/research/DEFENSE_TAKESTOCK_vs_dynamic_amms_2026-07-03.md`. NEW measure `scratchpad/closeb/h10_perp.js`
(vm vs HEAD `0e0a0062`). Converges the close-(b) defense set as the operator's take-stock closing input. NO git/engine/Aristotle.
- **PERP MAP (operator thesis CONFIRMED, stated precisely):** the LEVEL is already anchored = rebase re-centers the
  mode to oracle (index anchoring); it is NOT the manipulable quantity. The manipulable RESIDUAL = the SKEW/steepness
  `w`→γ=w/(1−w)→g_loc=m·γ around the anchored mode = the perp mark-vs-index BASIS. MEASURED w-is-the-residual (h10-C):
  isotropic LP pull preserves w exactly; arbitrageToOracle moves the reserve point back to oracle but leaves w=0.5027
  (skew SURVIVES a reserve arb — arb fixes the level not the skew). So the warp is real + not self-correcting like a
  mispriced level.
- **(ii) EMA/TWAP-banded read-γ = the single most transferable perp defense (MEASURED h10-A/B):** read-γ=EMA(w),
  λ=2/(N+1). TRANSIENT 1-step push 0.5→0.7: read-γ peaks 1.20(N=8)/1.07(N=24) vs instant 2.33 — "prices nothing until
  it persists". Blast radius (7-strike put book) at push w=0.70: **20.6% instant → 6.1%(N=8) → 2.3%(N=24)**, cut ~λ.
  Does NOT cover PERSISTENT warp (fully priced in 19/55 steps) — EMA neutralises transient only, forces the attacker
  to MAINTAIN the push (the perp property). Honest funding responds with the SAME lag = the UX↔resistance dial.
- **(i)+(ii) ORTHOGONAL (h10-E):** charge floor to ratchet w 0.5→0.60 = **$546,324.77 EMA-independent** (matches run #2
  floor). (i) prices the PERSISTENT move (reserve value differential); (ii)+rate-limit cap the RATE/blast-speed.
- **HYBRID SINK re-examined (h10-D) — SOUND only with a PENALTY basis:** pool-first-to-floor + excess-to-fund HOLDS
  P-CYCLE at every κ (minPool = poolStart exactly). BUT κ=1 (bare counterfactual charge) → fund collects **$0**
  (charge==drain, no overshoot — run#3 (1c) fact). Fund accrues only with surcharge κ>1: κ=1.5→$297,181; κ=2.0→$594,362,
  pool still whole. Insurance fund = sound design ONLY with explicit surcharge, not from the round-trip charge.
- **THE RECOMMENDATION (itemized build-scope delta):** ship in close-(b) build NOW = items **1–4** MUST tier
  (pool-value floor + counterfactual charge + **charge resize-invariance** (Part-3 Vector A) + **charge-the-open/
  freeze-w-on-exit** (Vector B)) — closes every MEASURED free/negative vector. NEXT campaign SHOULD = items **5–7**
  (EMA-banded read-γ + per-window w-rate-limit + funding clamp) = the perp rate-bounding layer, property (b) "push
  slowly + expensively", honest cost = bounded lag only, needs calibration numbers not new math. DEFER item **8**
  (penalty-funded insurance fund, κ>1 economics). Criteria (a)-(d) all met: (c) honest cost≈0 (charge is pool-
  integrity not payout, MR4); (d) division of labour intact (each item a separate seam, curve stays locked v24).
- **TBD-operator:** window N, Δw/window, κ = calibration/product; read-layer (ii)/(iii)/(iv) effects reasoned+
  partially-measured (engine has no EMA state — build-time vm test flagged). close-(b) build HOLDS. Handed to manager.

---

### LP-SELF-DEALING (RESEARCH RUN #3) delivered — operator entry 416 ("puts in big liquidity, huge trade, pulls LP, exits") — 2026-07-03
Appended PART 3 to `notes/research/DEFENSE_TAKESTOCK_vs_dynamic_amms_2026-07-03.md`. Measured Node-vm vs HEAD
`0e0a0062` (`scratchpad/closeb/h9_lp.js` + `h9b_lp.js`, NEW). LP add/remove = engine `liquidity(D)` isotropic
resize (V=2y, λ=D/V, w & price invariant, NO fee NO delay, HEAD L2544).
- **MANAGER HYPOTHESIS REFUTED:** pro-rata self-credit recovery = **ZERO** under the shipped pool-credit floor.
  Net cost to push γ 1→1.5: fixed-pool = **INVARIANT to f (~$594k = sybil floor)**; capital-add = WORSE
  (~1/(1−f), $5.94M at f=0.9). WHY (measured (1c)): floor RESTORES pool to pre-cycle EXACTLY — drain==charge
  ($16 734.36 each), overshoot **$0** — no excess distributed to LP shares to skim. Same structural fact as
  the sybil floor / bystander cancellation. Pull-LP-after (2): recovers CAPITAL ONLY, charge not recovered,
  honest pool unharmed. The "$546k→$55k" (1−f)·floor claim does NOT hold under pool-credit.
- **REAL LEAK FOUND — TIMING, not credit:** `revertArc` (L160-167) subtracts ABSOLUTE stored arc `dxA·rr,dyA`
  adjusted ONLY by oracle `rr` — **blind to an intervening LP isotropic resize.** VECTOR A (add LP deep→open→
  PULL LP→close): pulling LP between open and close drives the close charge DOWN and **NEGATIVE at f=0.9
  (−$264k — the charge PAYS the closer)**; attacker escapes the drain charge, honest LPs eat it (signs solid;
  dollar magnitudes indicative — accounting not fully closed, disclosed). VECTOR B (open warps w→pull LP→EXIT
  never close): charge is CLOSE-ONLY ⇒ warped w left with **NO charge at all** (blast-radius uncharged).
- **MITIGATION RANKING INVERTS the brief:** self-credit-targeting mits ((a) sink, (e) exclude-own-share) miss
  the real leak; (a) also BREAKS P-CYCLE (measured sink 1.6M→1.225M FAILS; pool-credit HOLDS). TOP/MUST =
  **charge resize-invariance** (scale stored arc by cumulative LP factor like `rr` does for oracle, OR lock LP
  while legs open) + **charge the open / freeze-w-on-exit** (Vector B). (d) LP fee + (b) delay = SHOULD.
  (c) vesting / (a) sink / (e) exclude = DEFER/REJECT.
- **SHORTLIST DELTA:** NEW MUST = charge resize-invariance + charge-the-open. DEMOTE the Part-2 "open-time LP
  snapshot" MUST — premised on a *distributed* credit; under pool-credit self-credit is already 0 (route to
  LP-accounting TBD). close-(b) build still HOLDS. No git, no engine edits, no Aristotle. Handed to manager.

---

### DEFENSE TAKE-STOCK (RESEARCH RUN #2) delivered — attack/defense surface + counterfactual charge attribution (operator entry 415) — 2026-07-03
Deliverable: `notes/research/DEFENSE_TAKESTOCK_vs_dynamic_amms_2026-07-03.md`. NO web (external = [TK]);
measured = Node-vm vs HEAD `0e0a0062` (scratchpad `closeb/h8_cf.js`, NEW). Design under test = the
COUNTERFACTUAL charge-back (entries 412/414/415): `charge = V[receipt-undo (revertArc own arc)] −
V[live-close (tradeUpdateAt)]`, both from the SAME current state; pay → keep live `w`, pool made whole via
charge credit; don't pay → revert to receipt (w reset). Design-stage; close-(b) build HOLDS behind this.
- **PART 1 attribution numbers (all measured):**
  - **(a) free cycler:** charge sum = **18 178 609.27** == measured live-close drain sum EXACTLY; w 0.5→0.5000
    exact over 30 cyc (unpaid ⇒ receipt reset); pool 1.6M→1.6M. Charge = own drain to the cent.
  - **(b) bystander interleave:** closer charge no-bystander = with-bystander = **605 953.64**, contribution
    = **0 (exact)** — STRUCTURAL: both counterfactuals start from same current state, differ only by
    closer's own leg, bystander cancels. Attribution holds by construction, not calibration. = multi-wallet
    cleanliness guarantee.
  - **(c) rebase interleave:** rr=1.25; receipt value **2 050 000 == rebased pre-open 2 050 000 exact**;
    charge 37 734.14 ≥0. Receipt oracle-scaling clean.
  - **(d) SYBIL — CRITICAL, MEASURED SYBIL-RESISTANT:** charge ∝ dy² BUT w-motion dw ∝ dy² TOO ⇒
    cost/unit-w → a POSITIVE FLOOR ≈ 1.46e7 $/unit-w, NOT →0. Cost to steepen w 0.5→0.60 (γ 1→1.5)
    converges to a HARD FLOOR ≈ **$546k (0.34× the 1.6M pool)** as cycles shrink; single monster cycle =
    $4.74M (2.97× pool); splitting gives bounded ~8.7× gain then PLATEAUS. **No free ratchet.** Reaching
    γ=14.4 ≈ multiples of pool value even at sybil-optimal granularity. Multi-wallet == cycle-splitting
    (attribution (b)). VERDICT: sybil does NOT resurrect the attack. Honest residual: whether ~0.34×-pool
    floor deters an actor SHORT the book (blast radius) = economics/product [TBD-operator].
- **PART 2 table (10 attack classes):** sandwich/MEV; JIT-liquidity; sybil; LP first-depositor/inflation;
  donation; deposit/withdraw timing around state moves; LP exit-before-repricing; internal-oracle-manip
  (Curve v2 EMA band = most transferable defense); cross-function arb; griefing. Each: Curve v2/Uni v3/
  Balancer/QuantAMM [TK] → our exposure (measured where vm-testable, reasoned else) → candidate → cost.
  **KEY NEW SURFACE the receipt/charge design creates:** charge is credited to pool x ⇒ JIT-LP can dilute
  the drain-compensation (#2/#6/#9) → mitigation = open-time LP snapshot for the charge credit. **KEY WIN:**
  charge-back converts free griefing/ratchet (#10, unique to our warp — no listed AMM has shared-curve-
  steepness surface) into a COSTLY vector (same floor as sybil).
- **SHORTLIST:** MUST = pool-value floor + counterfactual charge + open-time LP snapshot. SHOULD = EMA-band
  the internal mark (Curve-v2 analogue) + per-window w-rate-limit + value-based/no-lag LP-equity marking.
  DEFER = R-A full unwind (FLAG-CURVE still open) + LP withdrawal delay + share-inflation/donation vault
  hardening (CTO). TBD markers per operator's words on all product-decision items.
No git, no engine edits, no Aristotle (none needed). Handed to manager for skeptic gate + operator.

---

### NO-WORSE-THAN-CURVE research run delivered (operator entry 411, FLAG-CURVE decision input) — 2026-07-03
Deliverable: `notes/research/NOWORSE_roundtrip_vs_dynamic_amms_2026-07-03.md`. NO web (all external
claims labelled [TK] training-knowledge); measured = Node-vm vs HEAD `0e0a0062` (scratchpad
`closeb/h7_rd.js`, new). Q1-Q4 per design (UniV2/V3, Balancer static+LBP, Curve v2, QuantAMM/TFMM,
our (a)/naive-(b)/(b)+floor/R-A).
- **VERDICT V1 (value):** naive-(b) un-floored = WORSE than EVERY listed AMM (zero-move round trip
  destroys pool value; no accepted design has that — LVR is a moves-loss, not this). WITH floor =
  comparable-in-kind to Curve v2 (non-decreasing exact; Curve adds fee revenue). Floor MANDATORY.
- **VERDICT V2 (ratchet):** WORSE-IN-KIND vs Curve v2, twice: (1) ungated where Curve triple-gates
  (EMA tether + xcp_profit keep-half profit gate + step limit) — floor is NOT a profit gate
  (measured: value exact while w 0.5→0.935); charged-to-closer floor taxes motion only incidentally
  and 8.2× cheaper/unit-w at attack size ($1.84M) than retail ($15.0M); (2) blast radius: our w
  reprices the whole third-party option book (g_loc=m·γ) — no listed AMM has that surface at all.
- **R-D DEFINED (new, minimal Curve-parity, weaker than R-A):** live close + floor + PROFIT-GATED
  dwA persistence: dw_net persists only if V_now−V_hwm ≥ φ·|dw_net|·V_hwm, else w:=w_pre_open
  (lean unwound, reserves stay live; reuses stored dwA + ONE new scalar V_hwm). MEASURED (φ=1):
  free cycler w pinned 0.5000 EXACT (surplus≈0 — pool has no fee income, funding ledger-only) ≡ R-A
  vs zero-surplus attacker; paying attacker γ→14.4 costs $1,264,088 into the $1.6M pool (≈$2.9M/
  unit-w, size-independent). Gate delta = CM6-v3.4 replacement (zero-surplus exactness + threshold
  probe + floor-only negative control). Entry-411 rule satisfiable at R-D, NOT below.
- **Residual honest:** R-D parity is pool-axes only; Q3 (book repricing by PAID motion) needs R-A
  or book-scaled φ — operator/product call. Ordering handed up: R-A ≥ R-D(book-φ) > R-D(pool-φ) >
  floor-only > naive-(b). FLAG-CURVE option set now {R-A, R-D, R-B, R-C}.
- **RETRACTION:** h6_floor.js 'frozenW' row was a MIS-implementation of R-A (removed open's
  increment only, left close's — gave bogus w→0.857 retail drift); h7_rd.js R-A (w_close:=w_pre_open
  per CL3) supersedes: w 0.5000 exact, value exact, 30/30. Do not cite old frozenW numbers.
No git, no engine edits, no Aristotle (none needed). Handed to manager for skeptic gate + operator.

---

### CLOSE-AS-FIRST-CLASS-TRADE DESIGN SPEC delivered (operator RULING entry 405 "its to be b") — 2026-07-03
Deliverable: `specs/SPEC_close_first_class_trade_2026-07-03.md` — DESIGN-COMPLETE, NOT splice-ready (design
first, per brief). READ-ONLY on engine, no Aristotle (obligations queued only), no git. Supersedes WHEN BUILT
the frozen-arc `revertArc` close (build `0e0a0062`, spec SPEC_tradepoint_conservation §1.4) + the LOCKED
two-case settlement. All numbers Node-vm vs REAL HEAD `0e0a0062`; harnesses scratchpad `closeb/h1..h6.js`.
Under (b): dy_close=−dy_open=∓N·K_tx (frozen), dx live via tradeUpdateAt, ρ_close=(K_tx/oNow)/mode_live.
- **MR1 x-drain:** live-registered close is a ONE-SIGNED drainable bias (pool LOSES x in ALL 9 cases; ∝dy²;
  compounds — 30 cyc @50% depth: pool value 1.6M→800k, dies cyc 13). Same leak sits between any two opposite
  OPENS (latent in shipped open path). dy is POOL-INTERNAL (trader paid option-layer L0·raw_net·carvedEq, ≈0
  on zero-move cycle) ⇒ drain = pure LP value destruction, not direct trader steal. Neutralizer PINNED =
  POOL-VALUE FLOOR (credit shortfall / A15-family close haircut) → pool value held EXACTLY, honest closes
  untouched (floor binds only leaking direction).
- **MR2 ITM close continuity — WIN, demonstrated:** tradeUpdateAt continuous through ρ=1, no wing-lock, no
  branch. OLD two-case flips both-reversed→settled at pool-mark boundary (oracle≈83900) with trader_payout
  JUMP=221.38 on $50 step (skeptic +0.016·eq·L0 class, ref≈640); (b) same step = 1.24 (max (b) step whole
  sweep=1.32). Branch jump DISSOLVES ~180×. Zero (b)-close rejections across full ITM sweep.
- **MR3 no-free-money:** exact round-trip GONE by design (only frozen arc=(a) restores reserves). Replacement
  P-CYCLE = pool value non-decreasing over any open-close cycle (holds exactly w/ floor). CM6-v2 RETIRE
  (its neg-control asserts live-leaks-so-use-arc — inverted under b); ADD CM6-v3 (pool no-free-lunch + neg
  control un-floored leaks + γ-ratchet bound); CM8-v2 SURVIVES; NEW CM12 branch-continuity. Gate plan in §3.
- **MR4 division of labour + CENTRAL HAZARD:** proceeds stay option-layer (kept). Floor is FREE to honest
  traders BECAUSE dx never reaches trader (pool-integrity, not payout — resolves value-axis collision). BUT
  **γ=w/(1−w) is live and prices EVERY strike's mark/funding/seam; the drain ratchets w. MEASURED: pool-value
  floor holds value EXACTLY yet w still ratchets 0.5→0.935 (γ 1→14.4) over 30 cyc.** ⇒ pure (b)+floor leaves
  the SHARED CURVE STEEPNESS manipulable by free cycling — a NEW vector (a)'s arc didn't have (arc removed
  own dwA). **FLAG-CURVE = the one operator-tier decision.** Only un-winding the leg's own w-increment dwA
  kills it. Options: R-A (recommended) = live-dx reserves + restore own dwA (imports only scalar dwA, keeps
  live reserves + no ITM branch = "mostly b"); R-B = floor+escalating close fee (bounds, reopens div-of-labour);
  R-C = accept ratchet+rely on arb/funding (weakest, contradicts static-steepness doctrine). PIN=R-A.
- **MR5 depth:** (b) close CAN fail depth guard (worse than blocked open — trapped). PINNED default enabled by
  decoupling = best-effort reserve leg + FULL option-layer settle (payout independent of swap completing).
  FLAG-DEPTH alternatives (hard reject / partial / escrow) = operator choice.
- **MR6 migration:** open path unchanged; band already stores K_tx + arc{dxA,dyA,dwA,oOpen}; R-A consumes K_tx
  + dwA ⇒ legacy `0e0a0062` bands close cleanly, no fallback branch. CM6-v2→CM6-v3; DIFF/inventory: close goes
  exact-round-trip→live-floor, residual now on ALL closes not just ITM.
- **MR7 paper:** submitted `f8b37a71` is (b)-compatible on OTM legs but states two-case ITM-cash at 4 sites —
  exact revision sentences pinned in spec §7 (lines ~294-298 journey, ~755-758 limitations, ~766-769 incentive,
  ~845-849 settlement annex; ~743 already b-honest). Operator/paper-owned edits, flagged not made (paper submitted).
- **QUEUED LEAN (not submitted, no-Aristotle order):** CL1 proceeds-continuity across ρ=1; CL2 P-CYCLE pool
  no-free-lunch w/ floor; CL3 γ-ratchet bound (naive b → w→1; R-A → w_close=w_pre_open); CL4 depth best-effort
  well-posedness. SPEC_tradepoint frozen-arc/CM6-v2 obligations SUPERSEDED on b build; open-law (CM8-v2) carries.
- **2 operator FLAGs up:** FLAG-CURVE (R-A/R-B/R-C — operator-tier, PIN R-A) + FLAG-DEPTH (best-effort settle vs
  reject/partial/escrow — PIN best-effort). Everything else pinned w/ default. R6 scope-gate + itemized go BEFORE build.

---

### TRADE-POINT CONSERVATION SPEC delivered (operator entry 339; FLAG-A/inventory-#16 fix) — 2026-07-02
Deliverable: `specs/SPEC_tradepoint_conservation_2026-07-02.md` — splice-ready for the intern; READ-ONLY on
engine, no Aristotle, no git. Everything measured in Node vm vs REAL HEAD (`9fdde1de`); harnesses in session
scratchpad (verify_tradepoint / verify_close_variants / verify_frozen_arc; 12+3 checks green).
- **Law pinned (paper Eq. 2 in engine coords):** ρ=θ_tx/getSNorm (PIN-2, single-basis w/ tx-map L1821);
  T: x_T=x·ρ^(w−1), y_T=y·ρ^w (no k needed); Δx=−α_Tβ_T dy/((y_T−β_T)(y_T+dy−β_T)); x′,y′ global flows;
  w′=α_T/(x_T+Δx); α′,β′ re-derived. Exhibit EXACT in rationals: Δx=−5/22, w′=11/21, x′=215/22 (old engine
  6/11=0.5455). ρ=1 reduces EXACTLY to shipped tradeUpdate (≤2.7e-16) ⇒ arbitrageToOracle byte-unchanged.
- **KEY DERIVATION — live re-anchored close LEAKS:** all live registrations (sNorm-live/frozen-ρ) leak pool-x
  in ALL 9 cases (exhibit −2.8e-2; deep put −6.2); reserve-ray variant overcharges; no uniform zero-residual
  κ exists. **Pinned close = FROZEN-ARC** (store {dxA,dyA,dwA,oOpen} per leg; revert = inverse flows·(oNow/oOpen
  on x) + w_live−dwA): machine-exact round trip, open→rebase→close==rebase(s0,r) exact, intervening-trade
  flow-neutral. Rebase commutation: EXACT at fixed moneyness ρ (≤5.5e-16); fixed-dollar-K orderings now differ
  (1.6e-4 probe) — disclosed, economically correct.
- **Depth guard → trade point:** capacity = w·y·ρ^w (put wing thinner, call deeper).
- Code plan: NEW tradeUpdateAt + revertArc; tradeUpdate KEPT byte-identical (spot); executeLeg L1840 reroute +
  guard; openBand stores arc; closeBand revertArc w/ legacy fallback; framePool per-leg animation; exports L2295.
  Gates: CM8-v2 (spot trio byte-id + 11/21 HARD + ρ=1 reduction + routing negative-control), CM6-v2 (arc round
  trip + rebase interleave + live-reversal negative control); CM1-5,7,9-11 + a16 + P/P-num survive;
  monolith_consistency (2)/(7) labels re-scope to SPOT law.
- **5 operator FLAGs:** registration basis (lean-pool sNorm vs price-basis); close=frozen-arc confirm;
  intervening-trade "undo own increment"; T at θ_tx confirm; legacy-band fallback.
- **NEW LEAN QUEUE (post-build, not submitted):** trade-point local-pair conservation/w′ identity; ρ=1
  reduction; fixed-ρ rebase commutation; frozen-arc exactness; PH internal-passivity re-derivation (R_psd at T).
  **SCOPE RE-LABEL needed:** trade_conserves/L1 TrajectoryDomain/L7 EngineBridge tradeUpdate = SPOT law only
  once the build lands (INDEX edits queued, manager-gated).
R6 skeptic scope-gate + itemized operator go come AFTER this spec; nobody splices from it alone.

---

### STORY-COMPLETENESS AUDIT delivered (operator entry 335) — 2026-07-02
Read-only; no Aristotle, no git. `notes/research/STORY_COMPLETENESS_AUDIT_2026-07-02.md` — 17-row gap
table (code vs STORY_TABLE ed.8 vs WINE v2), HEAD `7015c22c`, vm-probe evidenced. LOUD FLAGS handed to
manager: **FLAG-A** table row 2 + paper §2.3/Eq.(2) present TRADE-POINT conservation (α_T,β_T at T,
w′=11/21 exhibit) while the engine applies GLOBAL-(α,β) conservation at the RESERVE point (measured
w′=0.5455 vs 0.5238 same state; α,β preserved) — inventory-#16 "anchoring-OPEN" disposition absent from
both artifacts (operator-ruled spec = entry-8 2026-06-12); **FLAG-B** table row 4 still teaches the
retired v24 min(slope,1/slope) mark (live = markLensed, ATM≈0.148 at g=2) — §3.2 fix must propagate;
**FLAG-C** funding is rate+ledger only (fundingTick mutates leg.funding_* only; pool/club untouched,
close payout excludes funding; log line "net trader → pool" overstates) vs row 9 "built & correct" /
paper "crowded side pays"; **FLAG-D** setOracle snaps perpMark:=oracle vs L2330 comment; **FLAG-E**
γ=w/(1−w) LIVE (=1 at deploy, breathes with trades ⇒ g_loc/seam/funding move) vs paper "γ>1" static.
MISSING-mechanic rows drafted for manager fold: buy-q N_buy=V_sell/denom (entry 333), premium-free
dy=±N·K_tx swap (both legs same direction), two-strike semantics (settle chosen / swap frozen K_tx),
depth guard 0.90·(y−β), club+L0 payout+floor, 0.01% club fee, LP isotropic resize, m-clamp [1,6].

---

### CARVE-FUNDING FACT-CHECK (operator entries 313/317, Story Table row 9) — ANSWER: NO — 2026-07-02
READ-ONLY; no edits, no Aristotle, no git. Question: does the carved origin-perp slice accrue normal PERP
funding while a band is open? **NO — perp funding does not exist ANYWHERE in the engine, carved or free.**
Static + behavioral (Node vm probe, scratchpad `probe_carve_funding.js`, HEAD `9fdde1de`):
- ONLY time-advance accrual = `fundingTick(dt)` (state script, HTML L2708-2730): iterates `state.bands` only,
  calls `Engine.fundingPerStrike` (L2281-2289) per leg-strike → `leg.funding_*` + pool_inflow. OPTION funding only.
- Perp model: `perpPnl`/`perpEquity` (L2410-2416) = margin + notional·(mark−entry)/entry — NO funding term.
  No perp-funding rate constant exists in the file. All club-equity mutations enumerated (L2526/2536/2599/
  2655/2682/2697) — none time-dependent.
- Carve frozen at open {carvedNotional, carvedEntryEquity, entryPerpMark} (L2645-2647); closeBand Job 2
  `attributablePnL = carvedNotional·(perpMarkNow−entry)/entry` (L2233-2241) — pure price P&L, no funding.
- Probe: 24h ticks no band + 48h with band + 48h deep-ITM (mark 80k→50k): perp/club/carve deltas ALL 0;
  only band option-funding fields moved; close returned attributablePnL=−15000 on 40k carve (pure price).
- CAVEATS reported: (a) today's SHIPPED fundingPerStrike still charges ITM option funding (no regime branch) —
  zero-ITM is the PROPOSED design, not current code; (b) prod mapping (L1594-1600) maps perps→perp.PerpService
  + the 1h funding cron→fundingPerStrike (option funding) — no perp-funding service mapped; whether CTO's Go
  perp layer charges funding out-of-band is outside this repo → operator/CTO question. Loophole IF unplugged:
  delta-1 exposure of carvedNotional paying zero funding ≈ perpRate×carvedNotional×T (e.g. 0.01%/8h ⇒ ~$12/day
  per $40k carve), scalable. Verdict handed to manager.

---

### PKG-ITM v2 ENGINE-COORDS SPEC delivered (operator go 298; R6 CLEAR; FLAG-2 discharged) — 2026-07-02
Deliverable: `specs/SPEC_pkg_itm_v2_engine_coords_2026-07-02.md` — splice-ready spec for the intern (build (a)
only; NO engine edits by me, read-only on HTML; NO Aristotle this slice). Everything numerically verified in a
Node vm sandbox against the REAL HEAD engine (21/21 PASS; harness in session scratchpad `verify_pkg_itm_v2.js`).
- **Frame map PINNED:** `S/K ↦ ρ = sNorm/θ` (put moneyness = θ/sNorm). Grounded: run-A DOM markUI reproduced by
  shipped `markLensed('put',θ,1,2)` at all 25 rows (4dp); new form is ray-scale invariant V(θ,sNorm)=V(ρ);
  at anchor ρ=S/K exact. General frame put continuation = (g^g/(g+1)^(g+1))·(θ/sNorm)^g; seam RAY sNorm*=θ·g/(g+1)
  (put) / θ·(g+1)/g (call); boundary fraction 1/(g+1). Four named wrong transports (the ~6× trap) in spec §1.4.
- **Replacement code (spec §2.2):** put `if (sNorm < sStar) return 1 − sNorm/θ; return pow(sNorm/sStar,−g)/(g+1)`
  with sStar=θ·g/(g+1); call mirrored. Branch order load-bearing (NaN-loud falls to pow arm); g=0 finite (=1,
  honest delta vs old 0.7-type, unreachable via gLoc); exact seam → 1/(g+1). Old block = HEAD L1656-1676,
  block-md5 3e4a3ab3, count==1.
- **max() lives NOWHERE:** re-seamed markLensed IS V=max in escrow units (O2 value_ge_intrinsic; call wing
  NUMERIC-only — open Lean obligation). NO caller change (markEff L1981 / legPrice / legValueUnified /
  fundingPerStrike L2273 / pfComponents L4383 / psiAt L3729 all route through the one helper). Do NOT code a
  literal Math.max of extended arms (extension lies ABOVE tangent below S* — wrong in intrinsic region).
- **Verification table:** paper §5.2 cells ALL hit to 3dp — g=2: 0.3333/0.2315/0.1829/0.1481/0.1029;
  g=6: 0.1429/0.2000(intr)/0.1066/0.0567/0.0190; seam C¹ slopes −1/K both sides; call slope g²/(K(g+1)²);
  ATM invariant g^g/(g+1)^(g+1) (unique old-new agreement pt); g=1 old≡new (5.6e-17).
- **Gates:** CM4 goes RED (hardcoded old seams) → CM4-v2 + C¹ probe + NEW CM10 sign-table + CM11 wing power-law;
  CM1-3,5-9 survive (verified). a16_atm_gate: NO change, 5/5 expected (A16.2 closed form ≡ new ATM value,
  identity 2.8e-17). monolith_consistency line (6) report-only red → repoint to O1 PasteLin labels.
- **FLAG-2 discharged verbatim in spec §6:** (γ=1,m=2)→g=2 column, (γ=1,m=6)→g=6 column, fixed-g equivalence
  ASSERTED (ray-scale invariance) not assumed; acceptance = DOM-READ (entry-286 harness, tester), never
  formula-self-check; C¹ probe on OUTPUT at 0.667K/0.857K (quotients pinned: left −1.000; right −0.957/−0.989
  g=2, −0.923/−0.980 g=6 at ε=0.02/0.005, tol ±0.03); sign table on OUTPUT all 25 spots, belowIntrinsic empty.
- **Revert twin:** copy HEAD → `engine/builds/temporal_mvp_v28_lens_powerarm.html` BEFORE splice.
- **NEW OPEN LEAN OBLIGATIONS (queue):** (i) O-bridge-v2 — EngineBridge/MonolithConstM/LENSKERNEL describe the
  retained powerarm build post-fix; transcribe spec §2.2 + prove = O1 Vp; INDEX label updates. (ii) O2-call —
  call-wing value≥intrinsic (mirror; carries C3 caveat if cited as symmetry). (iii) L2 A16NoJump file states
  old arms (fact survives; label class). NOT submitted this slice (no-Aristotle order). NO git this session.

---

### O-BATCH FIRED + RETURNED + AUDITED → all 3 `trusted-from-prover [pending manager audit]` (operator entry 296 "throw it to aristotle") — 2026-07-02
Bounded extended-curve-unification batch off my study §5 (O1/O2/O5, the small high-leverage set; O3 NOT forced —
pinning its admissible-majorant class is design work; O4/O6/O7 unsubmitted). Predicates pinned FIRST and every
identity numerically re-derived in node pre-submission (value/slope matches, uniqueness algebra u=1/(g+1)⇒b=Kg/(g+1),
tangent ineq t^(−g)+g·t>g+1 t≠1, log-slope identities, call-wing slopes g²/(K(g+1)²)). Three prompts
`formal/prompts/aristotle_prompt_O{1,2,5}_*.md`, submitted parallel `--project-dir formal/temporal_lean_verified`
(Lean 4.28.0/Mathlib v4.28.0). Ledger `formal/aristotle_runs/EXTCURVE_SUBMISSION_IDS.txt`. All three are
self-contained `import Mathlib` MODELS of the PKG-ITM-v2 DESIGN-TARGET put object (dollar frame, ∀g>0; linear
intrinsic (K−S)⁺/K re-seam at S*=K·g/(g+1)) — NOT the live engine (markLensed ships the entry-286-violating arm),
NOT canonical modules, NOT integrated. MODEL disclosure docstring embedded in each file.
**FULL AUDIT GATE per item — PASS** (canonical 5 modules + lakefile + lean-toolchain + lake-manifest BYTE-IDENTICAL
to WT for each archive; token scan clean — only `#print axioms` lines match "axiom", `+decide`=kernel; summaries
report axioms EXACTLY {propext,Classical.choice,Quot.sound} per named target; statements = pinned prompts
byte-for-byte, zero drift, no weakened shadow; math re-derived).
- **O1** `PasteLin.lean` (project `822f8d6a`, task `41302c31`, md5 `604c02fd`, 138 lines) — the LINEAR re-seam
  (entry-287 flag confirmed NEW vs LENSKERNEL power-paste): paste_value_lin/paste_slope_lin, welded C¹
  `Vp_hasDerivAt_seam` (punctured Iio∪Ioi one-sided glue — the piecewise Vp itself differentiable at S*),
  UNIQUENESS `paste_unique` (value+slope system forces b=S* ∧ A=S*^g/(g+1)), call-wing value/slope match,
  A-form/powArm/guards. ~49m. NOTE: its `--wait` stream died ~15m in and left a PARTIAL 6-sorry snapshot tar —
  QUARANTINED (scratchpad only, never folded); final archive re-downloaded after IDLE. PASS.
- **O2** `ValueGeIntrinsic.lean` (project `d3c118f3`, task `3c93ddf9`, md5 `f718d625`, 80 lines) — American
  faithfulness AS THEOREM: `value_ge_intrinsic` (max(1−S/K,0) ≤ Vp ∀S>0), strict `value_gt_intrinsic_beyond_seam`
  + `strict_region_nonempty` (witness (S*+K)/2), via `powArm_tangent_strict` (exp(x)>1+x + log t<t−1 route). The
  theorem-form of the tester's entry-286 finding: under the v2 re-seam the dip-below class is impossible. ~21m. PASS.
- **O5** `LogSlopeFunding.lean` (project `e3ad4eed`, task `1a6f4316`, md5 `655ac0b8`, 96 lines) — funding read:
  HEADLINE `logslope_cont_at_seam` (ContinuousAt lamP at S* — C¹⇒no funding jump), `funding_otm_identity`
  (S·(−V′)=g·contP), `funding_tail_delta_carry` (dollar tail read = S = |Δ|·S delta-carry), `lam_seam_identity`,
  `funding_zero_iff_on_anchor`, arm derivatives. **NOT operator-approved funding semantics** (sign-off pending;
  call-side (g+1)/g recalibration deliberately NOT stated). ~22m. PASS.
Folded `formal/aristotle_runs/O{1,2,5}_*/` (tar+extracted+summary); INDEX.md new O-BATCH block (provisional,
manager audit pending). Fragile-tactic flags (no-math): grind/grind+qlia/aesop/heavy nlinarith across all three.
NO git, NOT "verified" (env-blocked local kernel). Aristotle REACHABLE all session (list/submit/download 200).
HAND TO MANAGER for independent audit + skeptic gate. Known transport quirk: long `--wait` streams can drop
("Connection to server was interrupted") — run keeps going server-side; NEVER fold the interruption-time tar.

---

### EXTENDED-CURVE UNIFICATION design study (operator entry 295, PKG-ITM possible v2) — 2026-07-02
Brainstorm-grade, NO edits beyond the note, NO Aristotle, NO git. Delivered `notes/research/EXTENDED_CURVE_UNIFICATION_2026-07-02.md` (self-contained, operator-readable). Base = PKG-ITM-FIX-DESIGN (V=max, linear intrinsic re-seam, S*=K·g/(g+1)). Key results (hand math, numerically spot-checked):
- **The one object:** per-wing value curve = power wing (exp m·γ) ∪ tangent linear intrinsic ray, C¹ weld at S* (put S*=Kg/(g+1), call K(g+1)/g); K scales out ⇒ ONE universal moneyness curve φ_g (entry-291 intuition exact). Envelope slogan pinned correctly: V=max is curve∪tangent-ray / least-majorant (Snell-lite), NOT max(line, extended-power-branch) — the extension lies ABOVE its tangent (convexity).
- **Item 1 (%→$ toggle): FEASIBLE, pure display** — but chart-2 today plots psiShape (mode/θ)^g proxy (peak=1 tent), NOT value; true-V rewire supersedes Option-C/entry-266 contract → operator display sign-off. Fraction view = per-escrow-unit (put /K cash, call /perp), both wings →1; $ view = ×numéraire ⇒ Deribit X (K−S / S−K), crossing at ATM height (g/(g+1))^g/(g+1)=4/27 at g=2. MUST draw off the FIXED V=max shared helper (today's arm ⇒ 0.444K seam + below-intrinsic dip).
- **Item 2 (uncapped X): display-safe** — ≤1 = pool-quoted per-escrow-unit ceiling; $ wings escrow-backed parity (put ≤K cash, call ≤1 perp); nothing exceeds 1 in its own escrow unit. m-visibility replacement: wing exponent m·γ + ATM crossing falls with m + seams march inward; "reach 1" relocates to deep-ITM ends.
- **Item 3 (open/close): verdict (a), PRINCIPLED** — slippage=curvature, tail straight ⇒ zero-slippage parity fill IS the walk of the extension (v3 exhausted-range exact); (b) tail-curvature breaks American faithfulness (below-parity close) or bleeds vault (above); honest friction knob = explicit exercise fee. Residual honest asymmetry stays: communal walk vs per-claim carve.
- **Item 4 (ITM funding):** TODAY (L2269-77): no regime branch — κ·(±g)·N·markLensed·(S−1)/S continues ITM on the buggy power arm, un-designed. KEY IDENTITY: g·mark = |∂V/∂lnS| on continuation ⇒ today's formula IS the log-slope read ⇒ natural extension = ride the extended curve: continuous at seam (C¹ ⇒ S·V′ cont, verified g·D(S*)=S*), deep-ITM → κ·basis·S·|Δ| = perp-futures delta-carry (both wings Λ=S), crowded-pays-contrarian preserved. REJECTED alt (slope-ratio vs tangent-extended anchor, g_a=m): funding→0 beyond seams ⇒ funding-free delta-1 leverage arb. CAVEAT: call dollar value ∝ S^(g+1) ⇒ clean read recalibrates call OTM by (g+1)/g. **OPERATOR SIGN-OFF REQUIRED (funding semantics).**
- **Item 5: coheres as PKG-ITM v2.** New Lean obligations O1-O7 (NOT submitted): O1 paste_value_lin/paste_slope_lin (LINEAR re-seam — LENSKERNEL valueMatch_g is POWER/sNorm, entry-287 flag confirmed NEW); O2 value_ge_intrinsic; O3 envelope_least_majorant (composes SnellStaged Stage A); O4 tail_walk_linear + no_gamma_spike_at_seam; O5 logslope_cont_at_seam + funding_otm_identity + funding_tail_delta_carry; O6 wings_cross_once_at_atm; O7 call_put_reflection (carries C3 conditional caveat). Gates G-X (chart) + G-F (funding). NOT unified (honest): port/vault B1/B3/B4, communal-vs-per-claim, dollar pipe, funding cash-routing; reserves_have_no_floor honored (tail = per-claim escrow, pool curve untouched/locked).
- Recommendation: adopt as v2 arch; sequence fix→display slice→doctrine→funding-after-sign-off; run O1/O2/O5 first (small, high-leverage). Handed to manager.

---

### QC-ONLY RE-DERIVATION (operator entry 285) — engine ITM/settlement mark vs paper — 2026-07-01
Read-only sandbox of `<script id="engine">` in HEAD_temporal_mvp_v28_lens.html (vm.runInNewContext). NO edit, NO Aristotle, NO git. Four deliverables returned to manager. Key findings:
- **sNorm↔S map (LIVE path, markEff L1978-1981):** settled leg feeds `markLensed` with spot=`getSNorm(s)=(1-w)/w` (RECIPROCAL, pinned at the mode) and strike `theta=leg.inner=K/oracle`. g=`gLoc=m·γ=m·w/(1-w)`. The two coordinates are on DIFFERENT bases: spot-coord = (y/x)/oracle, strike-coord = K/oracle → differ by factor y/x (the "~6× basis leak" the L1975 comment warns of; ~12× on a skewed pool).
- **#1 divergence (g=2,K=100,put), engine reciprocal frame (w=2/3⇒spot 0.5):** S=60→eng 0.4523 vs paper(1−S/K) 0.400 (+0.052); S=66.67→0.4226 vs 0.333 (+0.089); S=80→0.3675 vs 0.200 (+0.168); S=90→0.3292 vs 0.100 (+0.229). Gap GROWS toward ATM. Engine intrinsic put arm `1−(sNorm/θ)^(1/g)` is a POWER (1/g root of moneyness), NOT the paper's LINEAR `1−S/K` — genuinely different functions (equal only at g=1). CORRECT American-perp exercised value = paper's K−S fraction (1−S/K) linear; engine ships the power-law smooth-paste fraction, which is the option MARK/value, not the exercised intrinsic.
- **#2 boundary:** engine put boundary sStar=θ·(g/(g+1))^g=θ·0.4444; paper dollar S*=Kg/(g+1)=66.67. In reciprocal frame the seam crossover in dollars = K·(g/(g+1))^g/sNorm_mode = 88.89 ≠ 66.67 (ratio 4/3). Normalized: engine seam at (g/(g+1))^g=0.4444 of ray vs paper g/(g+1)=0.6667 of K — DISAGREE, equal only at g=1. Basis mismatch confirmed numerically.
- **#3 canonical mark:** LIVE quote+settle = `markLensed` (via legPrice/legValueUnified/markEff/fundingPerStrike). v24 `mark` appears LIVE nowhere in pricing/settlement — only in `legFraction`(L4079-82, inside drawPayoff/composedEquity, DRAW layer) + HTML label strings + regime-test comments. Headline min(slope,1/slope) = schematic/legacy. NO live pricing/settlement path calls v24 mark.
- **#4 ≤1:** markLensed ≤1 on wide sweep (max exactly 1, 0 exceedances; continuation ceiling 1/(g+1), intrinsic arms in (0,1)). L1977 "ceiling ≤1 (solvency)" HOLDS. v24 mark self-caps at 1. L4076 "runs past 1" comment is STALE/DEAD — the function it calls (Engine.mark) caps at 1, and legFraction is draw-only. NO live path returns >1.
- **FLAG to operator (via mgr):** #1/#2 is a MODEL SEMANTICS question, not a bug per se — the engine ships the smooth-pasted option VALUE (power-law fraction), NOT the linear exercised intrinsic K−S the paper's `1−S/K` line describes. Which is the intended settlement payoff for the perpetual put = operator/settlement-semantics call. The reciprocal-frame basis mismatch (theta and spot on different scales unless y/x=oracle) is the real hazard and is the ~6× leak the code comments already name.

---

### L-MENU FIRED + RETURNED + AUDITED → all 5 `trusted-from-prover [pending manager audit]` (operator entry 276 "have aristotle do whatever you want its free") — 2026-06-23
Drove the prioritized Lean menu (lab findings `evidence/dexters_lab/monolith_review_findings_2026-06-23.md` + packet §5). Pinned predicates FIRST against the EXISTING `MonolithConstM.lean` / `PHUnification.lean` structures (re-declared minimal slices, self-contained, NOT canonical types). Five prompts `formal/prompts/aristotle_prompt_L{1,3,2,7,9}_*.md`, all submitted `--project-dir formal/temporal_lean_verified` (Lean 4.28.0 / Mathlib v4.28.0). Project ids in `formal/aristotle_runs/L_MENU_SUBMISSION_IDS.txt`. Server-side parallel; all COMPILED. Each folded to `aristotle_runs/L{n}_*/` (tar + extracted + ARISTOTLE_SUMMARY.md).
**FULL AUDIT GATE per item — PASS (zero-cost; canonical-kernel confirm env-blocked):** out-of-scope byte-diff (5 canonical modules + lakefile + lean-toolchain + lake-manifest BYTE-IDENTICAL for EACH archive); token scan clean (no sorry/admit/axiom-decl/native_decide/sorryAx/opaque/unsafe — only `+decide` simp config = kernel decide in L2/L7, confirmed NOT native_decide); `#print axioms` ⊆ {propext,Classical.choice,Quot.sound} per each summary; statements re-derived = intended (no weakened shadow, no vacuous hyp).
- **L1** `TrajectoryDomain.lean` (project `34a9aca5`, task `46309fbb`, md5 `7cc8dc9b`) — discharges the `hst` precondition (lab M10) FROM DYNAMICS: `trade_seq_on_domain` (∀k β≤(iterTrade…).y) via β-conservation + GENUINE trade precondition `β<y+D k` (non-vacuous). The one genuinely-missing bounded piece. PASS.
- **L3** `ConditionalSolvency.lean` (project `e590fcab`, task `cc441ec4`, md5 `6f217962`) — external-half solvency under NAMED concrete B3/B4 forms (packet §5.8): `solvent_of_concrete_funding` + `concrete_funding_covers` + real non-vacuity witness `concrete_funding_not_vacuous` (slack<0 ⇒ NOT solvent). Solvency stays CONDITIONAL (PH-4b honored, NOT unconditional). PASS.
- **L2** `A16NoJump.lean` (project `b14701e7`, task `214d1296`, md5 `940f1a32`) — A16 ATM no-jump GATE→THM (lab M2): `arms_agree_at_mode` (call==put at mode, g=m·γ>0) + `markCall/Put_continuousAt_mode` (genuine ContinuousAt). DISTINCT from S* seam; does NOT weaken paste_value/paste_slope. PASS.
- **L7 (BIG)** `EngineBridge.lean` (project `8b429b62`, md5 `3231f1bf`) — engine↔Lean DEFINITIONAL bridge (lab M4 / §5.9): engine JS closed forms `gLoc`/`markLensed`/`tradeUpdate` transcribed VERBATIM (NOT collapsed — `Engine.gLoc` computes w:=1−β/y then w/(1−w)) proven EQUAL to monolith `g`/`markCont`+`markInt`/`trade`. Headline `bridge_tradeUpdate_x` = reserve consistency (=trade_dx). The strongest "engine IS the object" answer; still NOT build-integration. PASS.
- **L9 (BIG, STAGED)** `SnellStaged.lean` (project `14b029e2`, md5 `e7884cca`) — Snell-envelope settlement-optimality (lab M3 / §5.10): **Stage A PROVED** = abstract finite-horizon optimal-stopping skeleton via genuine `Fin.reverseInduction` (`snellValue`; `snell_ge_reward`/`snell_ge_continuation`/`snell_eq_max` Bellman/`snell_optimal_stop` non-vacuous). **Stage B = obstruction REPORTED, not faked** (no price process/oracle/filtration/measure in the object; Mathlib has pieces but no packaged Snell envelope; needs a built measure layer + GH price process). Deterministic-boundary smooth-paste NOT weakened; full stochastic claim stays OPEN. PASS.
**INDEX updated** `formal/INDEX.md` (new L-MENU block, all 5 = `trusted-from-prover [pending manager audit]`). **NO git, NOT "verified"** (env-blocked local kernel). HAND TO MANAGER for independent audit + fold. Aristotle REACHABLE all session (list/submit/show/download 200, no host_not_allowed).

---

### LAB REFEREE PASS on MONOLITH_REVIEW_PACKET — ADJUDICATED (no Aristotle, no git) — 2026-06-23
Report: `dexters-lab/lab_home/reviews/review-monolith-20260623/REFEREE_REPORT.md`. Read packet + MonolithConstM smooth-paste defs (L44-47) + PHUnification weld (L112-145) + SPEC_itm L11 + monolith_consistency.js L175-183.
**F1 (lab="fatal" S* conflict) → VERDICT: clarity-gap (NOT fatal, NOT real-error).** `S*=K·g/(g+1)` (dollar/spot frame, K=dollar strike) and `sNorm*=θ·((g+1)/g)^g` (normalized VALUE frame, θ=K/oracle) are the SAME boundary in two coordinate systems; ratios point opposite (`g/(g+1)<1` vs `((g+1)/g)^g>1`) because normalized coord is a DECREASING power-law transform of spot (value∝S^(−g)). Lab's "K=θ" is a category error. Engine + Lean BOTH implement the normalized sStar (monolith_consistency.js L175-176; Lean L44); `K·g/(g+1)` is prose-only, never coded. FIX (prose only, no Lean/engine/math): define K=dollar strike, θ=K/oracle in §1.4 — OR drop `K·g/(g+1)`, quote only Lean `sStar(g,θ)=θ·((g+1)/g)^g`, add g=1,2,5/θ=1 value+slope table. Lowest severity.
**M10 (hst external) → VERDICT: real but BENIGN well-posedness side-condition.** NOT the hR-issue recurrence: hR (PSD soundness hole) is CLOSED — exchange_internal_passivity fills hR via exchange_Rcurv_nonneg→R_psd, no open PSD hyp. `hst:∀k,β≤st k` is the DOMAIN condition (R_psd is one-sided, μ″<0 below β); dropping it makes the thm FALSE not weaker → it's the correct necessary hyp, not a smuggled assumption. Genuine gap = same as packet §4.1(2): no thm that realized trajectory st stays ≥β. Discharging lemma (BOUNDED) = L1 below.
**"Lean to run" menu (reconciled lab M2/M3/M4/M9/M10 + packet §5):** RUN FIRST = **L1 trade_seq_on_domain** (∀k β≤st k by induction; β conserved + valid trade needs β<y+D) BOUNDED — discharges M10 hst from dynamics, NEW, smallest, highest leverage. Then L3 (conditional solvency, packet §5.8/lab M2-M3: instantiate hcov w/ concrete B3 floor + B4 oracle bound) BOUNDED; L2 (A16 ATM no-jump gate→thm) BOUNDED. Hold L4 (A14, needs operator close-semantics). BIG/defer: L7=§5.9/M9 engine↔Lean definitional bridge (medium-BIG); L9=§5.10/M4 Snell envelope (BIG, needs price-process/SDE — no oracle in object); L10 continuous passivity weld; L11 minimality.
**NEW vs disclosed:** NEW = F1 (K-undefined prose) + adversarial readings §5.4 gamma-pump/§5.5 m-governance (product-tier). ALREADY-DISCLOSED (lab re-reading our hedges) = M10/hst (§4.1(2)), solvency hcov (§3.2/§5.8), wing-scope 0.001-9000 (§1.6/§4.1(5)), Snell (§4.1(4)), engine-identity (§5.9), single_object=determinism (§4.1(1)), discrete≠continuous (§4.1(2)), tactic-fragility/no-repro-artifact (§3.1). Both "fatal" labels OVERSTATED.
**ESCALATE TO OPERATOR (via mgr):** smile-skew/LP-payoff/calibration (§5.2/5.3, product-tier); gamma-pump/m-governance front-run (§5.4/5.5, economic-mechanism); repro artifact/Nix (Q3, env). NO verdict changes — all results stay proved (trusted-from-prover). NO Aristotle, NO git this pass.

---

### LENS NATURAL HOME + LIVE-CURVE INFO-GEO RE-EXAM (operator entry 242) — 2026-06-14
**TWO tasks, both delivered as a note `notes/research/LENS_NATURAL_HOME_2026-06-14.md`. NOT a HEAD build; read-only on engine. Hand to manager for audit + skeptic gate. NO git.**
**TASK A — live-curve structure, HONEST (corrects GH-line baggage per `DETERMINATION_CORRECTION_GH_vs_Balancer_2026-06-14.md`):**
- SOLID/trusted-from-prover (pre-existing): live object = **convex-/Hessian-potential PH object** on Balancer constant-product: `price=∇μ` (price_is_grad), `R=∇²μ⪰0` on t≥β (R_psd). PH=forced cotangent lift, base ω≡0, NOT metriplectic. STANDS.
- **NEGATIVE RESULT (re-derived, robust): NO CGF / exponential-family / information-geometric reading for the live Balancer pool.** 3 independent reasons: (1) μ″<0 for t<β ⇒ not globally convex ⇒ not a CGF; (2) only zero of cubic is t=β where μ=μ′=μ″=0 (fully degenerate origin, on the boundary); (3) **Marcinkiewicz** — cumulants κ₃=2/(αβ)=const≠0, κ₄=κ₅=…=0 is NOT a valid cumulant sequence of any measure (polynomial CGF must be degree≤2=Gaussian). The info-geo reading was **GH-line only** (GH used `ProbabilityTheory.cgf X μ` of a genuine GH MEASURE, CgfClean/GHmeasure — a DIFFERENT μ; demoting GH removed the measure). "Information-geometric base" must be DROPPED from the live-curve headline.
**TASK B — where m fits naturally (POOL CURVE STAYS LOCKED, m=1⇒plain):**
- **NATURAL HOME FOUND (POSITIVE):** m = the **inverse-temperature of the option-value Gibbs weight.** `value(S)=S^(−g)=e^(−(m·γ)·q)` on q=log S = the live object's own `carry` coord (MonolithConstM L28). β_T=g=m·γ; baseline β_T,0=γ (m=1); bigger m=colder=steeper everywhere. `value_m=(value_1)^m` exactly ⇒ m is a canonical thermal POWER, not a bolt-on. RESURRECTS operator entry-135 "free energy" thread for the RIGHT layer (option-value, not pool). Intrinsic to the option-value/settlement layer; ZERO pool change.
- **Esscher tilt — NEGATIVE (corrects feature-inventory #14 for live curve):** tilt = translation (γ→γ−h); m = dilation (γ→m·γ). m is a SCALING of the natural parameter, not a tilt.
- **Legendre/Hessian — intrinsic only via a SEPARATE option-value potential** Ψ_m(S)=S^(1−mγ)/(1−mγ); pool Hessian 1/μ″ is m-free by lock. Same conclusion as the thermal home in dual language.
- **FLAG (operator-tier, NOT done):** making m intrinsic to the POOL itself needs a curve reopen (deform μ→μ_m so pool exponent=m·γ) — violates entry-229/231 lock. Operator call via manager.
**ARISTOTLE SUBMIT (Task B.1 thermal identities, pin-complete):** prompt `formal/prompts/aristotle_prompt_lens_thermal_home.md` → self-contained `RequestProject/LensThermal.lean` (re-declared minimal `LensAMM`, does NOT touch pool/canonical modules). Targets: value_is_gibbs, value_pow_m, m_one_recovers_base, invtemp_eq_m_gamma, invtemp_mono, gamma_pos, g_eq_m_gamma. **Project `ca042134-24b2-44f5-9b98-bf82a13cd336`, task `50d34e3c-1615-4fdb-be19-40f099ce6c43`.**
**RETURNED + AUDITED 2026-06-14 → `proved (trusted-from-prover)`.** `aristotle show` = COMPLETE (~3h). Archive `/tmp/thermal_out.tar.gz` → folded `formal/aristotle_runs/LENS_THERMAL/` (tar + LensThermal.lean md5 `87f5ac86…`, 67 lines + ARISTOTLE_SUMMARY.md). Kept in aristotle_runs/ ONLY — NOT placed in temporal_lean_verified/RequestProject/ (placement lesson honored; confirmed absent from canonical project). NO git (manager folds/commits).
**FULL AUDIT GATE — PASS (zero-cost; canonical-kernel confirm env-blocked):**
- Out-of-scope byte-diff: all 5 canonical WT modules (AMMCurve/Audit/Main/Seam/Temporal) + lakefile.toml + lean-toolchain + lake-manifest.json + .gitkeep BYTE-IDENTICAL to WT. Only LensThermal.lean new. Toolchain v4.28.0 matches.
- Token scan CLEAN: no sorry/admit/native_decide/sorryAx/opaque/unsafe; no `axiom` decl; no `decide`.
- #print axioms: SUMMARY reports all 7 named theorems = exactly {propext,Classical.choice,Quot.sound}.
- Returned file = pinned prompt byte-for-byte: 6-field LensAMM, defs gamma/g/valuePow/valuePowBase/gibbs, all 7 statements unchanged. ZERO statement drift, no hyp weakened. m_one_recovers_base keeps unused hS (pinned exactly) — benign.
- Math re-derived (all 7): gamma_pos (γ=(y−β)/β>0 from β<y, β>0); g_eq_m_gamma=rfl; value_is_gibbs (S^(−g)=exp(−g·logS)=gibbs g (logS) via rpow_def_of_pos); value_pow_m (S^(−mγ)=(S^(−γ))^m via rpow_mul, base≥0); invtemp_eq_m_gamma=g_eq_m_gamma; m_one_recovers_base (m=1⇒g=γ); invtemp_mono (1≤m,γ>0⇒γ≤mγ via nlinarith). All correct.
**SKEPTIC FLAG a00a14ea — WING-SCOPE CHECK: PASS.** Docstrings explicitly scope to the WING/asymptote, NOT the whole option mark: L21 `valuePow` = "option-value **wing law** as a power of spot S: value(S)=S^(−g)"; L23 `valuePowBase` = "baseline (m=1) **wing law**"; L34 `value_is_gibbs` = "the option-value power law equals the Gibbs weight"; prompt §Context L11 = "whose **wing law** is the power law". The theorems are about S^(−g) = the power-law WING/asymptote ONLY — they do NOT claim S^(−g) is the engine's smooth-pasted option mark (which past the strike runs intrinsic, not the power law). NO statement reads as if S^(−g) is the whole mark. FLAG a00a14ea SATISFIED for this file. (Caveat to carry: this is the wing identity, not a settlement-mark identity; "intrinsic to the option-value layer" = the WING/read-exponent claim.)
**VERDICT: `proved (trusted-from-prover)` — NOT verified (env-blocked, no local canonical kernel).**
**HONEST LABELS (for INDEX/relay):** trusted-from-prover ≠ verified. Self-contained (re-declares minimal LensAMM, NOT canonical types) + NOT integrated into canonical project build (lives in aristotle_runs/ only). WING-scoped (power-law asymptote, not the smooth-pasted mark). The conceptual finding (m = inverse-temperature of the option-value Gibbs WING) stands on hand math + now trusted-from-prover. Aristotle REACHABLE this session (show=COMPLETE, no host_not_allowed).
**HAND TO MANAGER for independent audit + skeptic RE-GATE before fold to shared truth / formal/INDEX.** NO git. Did NOT re-submit/wait-spin (returned COMPLETE).

---

### PH-UNIFICATION-COMPOSED — THE WELD LANDED (resolution of skeptic FLAG-OVERSELL) — 2026-06-14
**TRIGGER:** skeptic `notes/skeptic/VERDICT_PH_UNIFICATION_INTERNAL_2026-06-14.md` = FLAG-OVERSELL + manager
`formal/aristotle_runs/PH_UNIFICATION_INTERNAL/CORRECTION_2026-06-14.md`. The prior `PHUnification.lean`
proved the PIECES but not the WELD: `internal_passivity` carried `hR` (port PSD) as a FREE OPEN hyp;
`exchange_Rcurv_nonneg` (geometric PSD witness) composed NOWHERE; no `exchange_internal_passivity`;
`trade_no_spontaneous_storage` ABSENT; `trade_conserves` dangling. So: abstract-passivity (open hR) +
separately curvature-PSD, but NOT "this exchange is passive BECAUSE its geometry is PSD."
**DELIVERED — composed file submitted + returned + AUDITED → `proved (trusted-from-prover)`.**
Prompt `formal/prompts/aristotle_prompt_PH_unification_composed.md`. **Project `8ee75026-4340-4ccc-88e6-a50e99d87c3b`,
task `5c2bccf2-9ec8-4f02-a066-80e06aeb49e3`.** `--wait` COMPLETE (~7m). Archive `/tmp/ph_unif_composed.tar.gz`
→ folded `formal/aristotle_runs/PH_UNIFICATION_COMPOSED/` (tar + extracted PHUnification.lean md5
`65e7bc31…`, 183 lines + ARISTOTLE_SUMMARY.md). Working-tree `formal/temporal_lean_verified/RequestProject/
PHUnification.lean` updated to the proven version (same md5). NO git (manager folds/commits).
**THE TWO NEW COMPOSED THEOREMS (the welds the skeptic named):**
- `exchange_internal_passivity` (L125-130) — concrete `Exchange`, **NO open hR**. Signature premises =
  only `E,H0,sup,eff,st,hst(domain ∀k E.amm.beta≤st k),N`. Body: `internal_passivity H0 sup
  (fun k => deriv (deriv E.amm.poolPotential)(st k)) eff (exchange_Rcurv_nonneg E st hst) N` — the hR
  slot is FILLED by the geometric witness; `Rcurv` IS the explicit geometry term (type-matches). The weld.
- `trade_no_spontaneous_storage` (L138-145) — uses `(E.amm.trade_conserves D hD).2` to get
  `hbeta:(E.trade D hD).amm.beta=E.amm.beta`, lifts `hst` to post-trade beta, applies
  `exchange_internal_passivity` on `E.trade D hD`. `trade_conserves` is LOAD-BEARING (`rw [hbeta]`).
- Also added `trade_poolPotential` (rfl) + `Exchange.trade` (the post-trade exchange). `exchange_solvency_split`
  REWIRED: internal component now routes through `exchange_internal_passivity` (welded), external half
  STILL a `→` arrow (PH-4b intact).
**FULL AUDIT GATE — PASS (zero-cost; canonical-kernel confirm env-blocked):**
- Out-of-scope byte-diff: 5 WT modules + lakefile + lean-toolchain + lake-manifest + .gitkeep BYTE-IDENTICAL.
  Only PHUnification.lean changed. Toolchain v4.28.0 matches.
- Submitted(sorry)→returned diff = ONLY the 4 sorry placeholders filled; ZERO statement drift.
- Token scan CLEAN: no sorry/admit/native_decide/sorryAx/unsafe/opaque; no `axiom` decl; no decide. ("extern"
  hits = the word "external" in comments only.)
- COMPOSITION grep CONFIRMED: `exchange_internal_passivity` body calls `exchange_Rcurv_nonneg` (L130) +
  signature has NO hR/PSD premise; `trade_no_spontaneous_storage` body calls `trade_conserves` (L142). The
  exact thing the skeptic re-checks — genuinely composed, not two adjacent lemmas.
- #print axioms: SUMMARY lists ALL 13 named theorems (incl. the 2 new) = {propext,Classical.choice,Quot.sound}.
  (Streamed CLI echo truncated the 2 new ones; archive summary has them explicit.)
- Math re-derived: bound `Hs N ≤ H0+Σsupplied` is `internal_passivity` instantiated ⇒ non-vacuous (skeptic
  already confirmed strict on non-degenerate data); geometry term is the genuine μ″ curvature; domain hyp
  exactly `∀k E.amm.beta≤st k`. Intended claim = Lean claim.
NO emendation needed (clean as returned). NO statement weakened / hyp dropped / conclusion strengthened.
**VERDICT: `proved (trusted-from-prover)` — NOT verified (env-blocked, no local canonical kernel).**
**HONEST LABELS (for INDEX/relay):** trusted-from-prover ≠ verified. Self-contained (re-declares minimal
TemporalAMM/Exchange, NOT canonical types) + NOT wired into canonical project build (MonolithConstM status).
EXTERNAL solvency half STAYS OPEN/conditional (PH-4b) — `solvency_of_coverage`/`coverage_iff_solvency`/
`exchange_solvency_split` keep `hcov` as `→` premise, never discharged. The weld is INTERNAL-half only.
**HAND TO MANAGER for independent audit + skeptic RE-GATE before fold to formal/INDEX.** NO git.

---

### PH-UNIFICATION — WHOLE EXCHANGE AS ONE OBJECT, solvency = passivity-under-admissible-inputs (operator entries 237/238 "sure get done by morning") — 2026-06-13 OVERNIGHT
**GOAL:** state precisely + prove-what's-provable that the whole exchange is ONE pure-math object,
with solvency = the passivity-under-admissible-inputs predicate and B1/B3/B4 surfaced as explicit
input-port conditions. The frame (operator entry, today): "if solvency is a rest-of-world/port thing
doesn't it close out cleanly?" — ANSWER MADE RIGOROUS: the INTERNAL half (passivity/no-internal-
free-money) closes structurally; the EXTERNAL half (solvency under adversarial price path) does NOT
self-close — it localizes to ONE minimal named hypothesis = PH-4b "port/funding necessary-never-
sufficient." VALUE = legibility, NOT making solvency vanish.
**ITEM 1 — CONJECTURE STATEMENT (DELIVERED):** `notes/research/PH_UNIFICATION_whole_exchange_2026-06-13.md`.
ONE structure `Exchange` wrapping `TemporalAMM` (amm) + ports: storage=poolPotential/price_is_grad;
flow=trade+Casimir-conservation; gauge=rebase; resistive port=funding (R_psd μ″≥0); boundary output
port=settlement (paste_value/paste_slope C¹ at S*); co-energy=dollar/USD pipe (member, no-Lean);
slippage=dissipation functional on trade port (A15, UNBUILT — flagged); **close-mechanic=PARAMETRIZED
`close` member (Q14, NOT assumed)**; solvency=passivity-under-admissible-inputs with the input-port
admissibility predicate `admissible`/`hcov` = the explicit B1/B3/B4 condition. Welds 3 already-trusted
pieces: MonolithConstM (R_psd/trade_conserves/price_is_grad/paste), CTPH.sampled_passivity (abstract
no-free-money), B1.solvent_of_port_covers + port_necessity_note (the conditional reduction + ↔).
**ITEM 2 — PREDICATES PINNED (entry-179 discipline, DONE before submit):** every field/hypothesis/
component type/the passivity inequality `Hs N ≤ H0 + Σ supplied` and the coverage `→` form pinned in
the note §3/§4 and in the prompt's full Lean skeleton.
**ITEM 3 — INTERNAL HALF SUBMITTED TO ARISTOTLE:** prompt `formal/prompts/aristotle_prompt_PH_unification_internal.md`
(self-contained `RequestProject/PHUnification.lean`: re-declared minimal TemporalAMM slice + Exchange
wrap + internal_passivity/no_internal_free_money/sampled_* + exchange_Rcurv_nonneg + EXTERNAL
solvency_of_coverage/coverage_iff_solvency stay `→`/`↔` premises + exchange_solvency_split headline).
**SUBMITTED OK: project `ad21b66d-14eb-4565-af91-e8a8ee0028f0`, task `80cd7ba4-18aa-4976-adfc-2c55f056d815`.**
**RETURNED + AUDITED 2026-06-14 (morning) → `proved (trusted-from-prover)`.** `aristotle show <PROJECT id>`
= COMPLETE (~10h). (`show` on the TASK id 403s — wrong endpoint, NOT host_not_allowed; host edge has
no x-deny-reason, reachable.) Archive `/tmp/ph_unif_internal.tar.gz` → folded
`formal/aristotle_runs/PH_UNIFICATION_INTERNAL/` (tar + extracted PHUnification.lean md5 `d6bef416…`,
141 lines + ARISTOTLE_SUMMARY.md). NO git (manager folds/commits).
**FULL AUDIT GATE — PASS (zero-cost; canonical-kernel confirm env-blocked):**
- Out-of-scope byte-diff: all 5 WT modules (AMMCurve/Audit/Main/Seam/Temporal) + lakefile + lean-toolchain
  BYTE-IDENTICAL to working tree; only PHUnification.lean new. Toolchain v4.28.0 matches.
- Token scan CLEAN: no sorry/admit/native_decide/sorryAx/unsafe/opaque; NO `axiom` token at all; no decide.
- #print axioms: SUMMARY reports all 10 named theorems = exactly {propext,Classical.choice,Quot.sound}.
- Math re-derived: poolPotential=(t−β)³/3αβ, μ'=(t−β)²/αβ=price, μ''=2(t−β)/αβ≥0 t≥β; internal_passivity
  telescopes Hs(N)≤H0+Σsupplied from Σdissipated≥0; sampled_increment fwd-Euler.
- SKEPTIC WELD (a) R⪰0 genuinely witnessed: `exchange_Rcurv_nonneg` discharges nonneg curvature by
  CALLING `E.amm.R_psd` (not re-stubbed); R_psd itself proven. PASS.
- SKEPTIC WELD (b) NO solvency-closed leak: `solvency_of_coverage` carries `hcov` as explicit `→`
  premise (linarith [hcov s]); `exchange_solvency_split` keeps external half as inner (coverage)→(solvency)
  implication; `coverage_iff_solvency` ↔ confirms minimality. Reduction did NOT become unconditional. PASS.
NO emendation needed (clean as returned). NO statement weakened / hyp dropped / conclusion strengthened.
**VERDICT: `proved (trusted-from-prover)` — NOT verified (env-blocked). Handed to manager.**
**ITEM 4 — EXTERNAL HALF HONEST (DELIVERED, conjecture-with-hypothesis):** solvency ⟸ passivity ∧
input-admissibility is PROVABLE (= B1.solvent_of_port_covers, already trusted); the minimal
admissibility = B3 (funding sign+magnitude) ∧ B4 (price-path/oracle bound — the adversarial-path
non-closure point) ∧ B1 (collateral/κ coverage). MINIMALITY: port_necessity_note proves hcov↔solvency
⇒ the irreducible hypothesis IS solvency-restricted-to-admissible-inputs (cannot shrink below it).
**PH-4b HONORED — NO note asserts solvency unconditionally; geometry does NOT close it.**
**HARD HONESTY:** trusted-from-prover ≠ verified. Solvency NOT closed — LOCALIZED to a named
hypothesis. HAND TO MANAGER for independent audit + skeptic gate BEFORE shared truth / fold-as-more-
than-conjecture. NO git (manager sole git actor). If Aristotle stalls, items 1+2+4 stand (statement +
pins + honest external framing); only item 3's verdict is in flight.

---

### STEP-0 STRUCTURE RECONFIRM (operator entry 239) — DETERMINATION: info-geometric base + PH lift; "metriplectic" REJECTED — RE-VERIFIED AT SOURCE 2026-06-13
**The operator's question ("is it port-Hamiltonian or information geometry whatever") IS ALREADY ANSWERED in the project record — evidence-backed, not a guess. They are the SAME single object viewed two ways; the established headline is fixed.**
**RE-VERIFICATION THIS PASS (entry 239) — checked at PRIMARY source, not re-asserted from memory:**
- Spec addendum (`specs/port_hamiltonian_consistency.md` lines 52-67) READ: "information-geometric base + PH lift, NOT metriplectic"; μ=GH CGF; price=∇μ, R=∇²μ=Fisher, value-metric=1/μ″; PH=canonical cotangent LIFT; base ω≡0. ✔
- T2 `AIRTIGHT_T2_singlecore/.../SingleCore.lean` READ: `omega c v w := v*w − w*v` ≡ 0 + `price_is_grad := rfl` — the trivial-base-ω fact that REJECTS "metriplectic" is in the RETURNED LEAN. ✔
- Info-geo leg `CLOSEOUT_cgf/.../CgfClean.lean` READ: `cgf_deriv_mean_and_variance` + `cgf_convexOn` (cgf′=mean, cgf″=Var=Fisher) — dissipative/Fisher side IS the cgf results. ✔
- Dropped forks `CLOSEOUT_kahler` (conjectural) + `CLOSEOUT_courant` (no-go) archives present, excised out-of-core. ✔
- Aristotle store paged (3 pages): PH cluster (proj_t2/t1a/t1b, merton, ghmaps, proj_clean/probe) + recent monolith/lenskernel/warpcalc all IDLE/COMPLETE. ✔
- Transcript entries 134/135/136 READ verbatim: entry 134 names "the singular mathematical object (port-Hamiltonian / free-potential system)" as ONE object; entry 135 "they did something after port hamiltonian like information geometry free potential" = operator's CORRECT memory (info-geo came AFTER PH = PH's generator-identification, not a rival). ✔
- **RE-BASING FINDING:** `notes/research/PH_UNIFICATION_whole_exchange_2026-06-13.md` (original-brief work product) frames the `Exchange` wrap in PH-LIFT language (`Hs`/`R⪰0`/`J` skew). NOT WRONG (PH is the forced lift), but per entry 239 the HEADLINE must lead with μ-as-generator (info-geo base), PH as forced lift. §3 internal-passivity = "R=∇²μ=Fisher⪰0 on the base, lifted to CTPH," not "assume a PH system." Math unchanged; framing re-based. Conjecture note, NOT submitted → no audit-gate impact.

**DETERMINATION STANDS (now source-verified, not memory-asserted).**
- **THE RECONCILIATION (load-bearing source `specs/port_hamiltonian_consistency.md` §★ 2026-06-09 MANAGER ADDENDUM (c), lines 52-67, operator-approved):** the singular object is ONE convex potential **μ = the GH cumulant generating function (CGF)** + the exponential family it generates = an **information-geometric / Hessian (dually-flat)** object. One μ generates: **price = ∇μ; dissipation R = ∇²μ = Fisher metric; value-metric = 1/μ″ (Legendre dual)**; the two symmetries = trade (parameter translation) + rebase (degree-0 gauge). The **port-Hamiltonian / symplectic structure is the canonical cotangent LIFT of this info-geometric base, NOT a second axiom** (cotangent bundle of a Hessian object is forced, no extra data). One generator, one object: **μ → info-geometric base → canonical PH lift.**
- **ESTABLISHED HEADLINE NOUN (spec line 64, verbatim): "information-geometric base + port-Hamiltonian lift," NOT "metriplectic."** Reason: SingleCore/T2 has 1-D base ⇒ `omega ≡ 0` (only skew form on ℝ¹) ⇒ symplectic reading is DEGENERATE on the base; nontrivial ω (det=1) lives on the 2-D lift. Calling the whole thing "metriplectic" overclaims a symplectic structure the base does not carry.
- **CHRONOLOGY (transcript journal + operator entries 134/135/136):** PH was the FIRST framing (2026-06-06 `temporal-amm-energy-object` → `temporal-port-hamiltonian-aristotle`). Info-geometry/free-potential is what came "AFTER port hamiltonian" (operator entry 135 memory is CORRECT) — but it is NOT a successor that replaced PH and NOT a parallel rival. It is the **identification of PH's own generator**: the info-geometric μ is the BASE, PH is its forced LIFT. DUAL VIEWS of one structure, reconciled 2026-06-09. "free potential / free energy" = the operator's name for μ (the convex potential / CGF).
- **WHAT THE PROVEN RESULTS ACTUALLY LIVE IN (Aristotle history, all trusted-from-prover):** PH-framing cluster = **T2** `single_source`/`price_is_grad`/`R_psd` (AIRTIGHT_T2_singlecore, ω trivial in 1-D gauge), **CTPH_clean**, **PH3_grounded** (R⪰0), **PH4b_grounded** (no-floor), **PH6** (rebase preserves J,R). The **info-geometric leg is the SAME results**: cgf'=mean / cgf''=Fisher (UNIFY2/CLOSEOUT_cgf, "standard exp-family identity"), GHmeasure (μ a genuine prob-measure CGF, finite MGF, no Bessel-K), GHJ_grounded (trade = latent one-param group + Esscher tilt). The CGF/Fisher results ARE the dissipative/info-geometric side; price_is_grad/R_psd ARE the metriplectic statement μ′=price, μ″=R⪰0. The constant-m monolith `MonolithConstM.lean` re-states it concretely in-object (`price_is_grad`/`R_psd` over `poolPotential μ`). **Kähler (CONJECTURAL, unstatable in Mathlib) + Courant (proved NO-GO) are EXCISED out-of-core** — abandoned framing forks.
- **SKEPTIC + OPERATOR DISPOSITION (already ruled):** `VERDICT_FORMAL_TRUTH_TO_OBJECTIVE_2026-06-10` + `VERDICT_DELEGATED_DECISIONS_2026-06-10` ruling A1 = the PH/metriplectic/info-geometry cluster is **`[motivation-layer]`: the paper's conservation-law / passivity MOTIVATION story, KEPT in place, NOT a §4 curve contract, NOT load-bearing for the build** (PH6 rebase #5 + B1 solvency #13 straddle locked contracts).
- **HONESTY CAVEATS:** (1) the info-geo↔PH reconciliation is a MANAGER-AUTHORED framing addendum (operator-approved 2026-06-09), grounded by trusted-from-prover T2/cgf/GHmeasure results — NOT itself a single Aristotle theorem named "this is the encompassing structure." (2) Φ/lens-shape (and constant-m's `m`) is a calibration FIELD, NOT derived from μ's free energy — emergence of the kurtosis knob from the potential is an HONEST GAP (stated in `MonolithConstM`/`CONSTANT_M_lens_object_sync`). (3) "metriplectic" as a noun is REJECTED (base ω trivial); use "info-geometric base + PH lift."
- **VERDICT FOR THE UNIFICATION CONJECTURE: BUILD IT IN THE INFO-GEOMETRIC FRAME — μ (the GH CGF / convex free-potential) as the single generator, with PH as its forced cotangent lift.** Do NOT base it on "port-Hamiltonian" as a standalone assumed scaffold (operator was right to question), do NOT call it "metriplectic." Evidence-backed (spec addendum + 8 trusted-from-prover results + 2 skeptic rulings + transcript chronology), not preference. Items 1-4 of the original brief proceed on μ-as-generator. NO git, NO submit this step (reconfirm only). Hand to manager for audit + skeptic gate.

---

### CONSTANT-m MONOLITH FIRED + RETURNED + AUDITED → trusted-from-prover (operator goal entries 144/146/177/179/231) — 2026-06-13
**THE single Lean-verified pure-math object the operator asked for NOW EXISTS, trusted-from-prover.**
Submitted `formal/prompts/aristotle_prompt_monolith_constm.md` to Aristotle (host reachable, CLI 200,
no 403). **Run `6016ec57-504a-4b7c-8a12-bccc4eba6b32` / inner task `3f85462d-bee4-4e32-8613-e27f68906772`.**
Ran ~1h15m (long but healthy; metriplectic `HasDerivAt`/`deriv(deriv)` + rpow lemmas over full
`import Mathlib`). Returned COMPLETE; archive `/tmp/aristotle_monolith_constm.tar.gz` → folded
`formal/aristotle_runs/MONOLITH_CONSTM/` (tar + extracted; MonolithConstM.lean md5 f3f4f809…, 295 lines).
**FULL AUDIT GATE — PASS:**
- **Out-of-scope byte-diff:** all 5 working-tree modules (AMMCurve/Audit/Main/Seam/Temporal) +
  lean-toolchain + lakefile BYTE-IDENTICAL to working tree. Only `MonolithConstM.lean` is new. Toolchain
  `leanprover/lean4:v4.28.0` matches.
- **Token scan:** NO sorry/admit/native_decide/sorryAx/opaque/unsafe; NO `axiom` declarations; no `decide`.
- **Structure block VERBATIM** as pinned: `alpha,beta,y,m` + `halpha,hbeta,hy:β<y,hm:0<m`. Every component
  a def/theorem reading the one object P (entry 179 mapping-within).
- **Math re-derived (intended-claim check):** `g θ = m·γ` constant (g_eq_m_gamma/g_const_in_strike);
  thetaTx=center·(θ/center)^m with thetaTx_roundtrip the genuine inverse (m·(1/m)=1 via rpow_mul);
  warp_linear=∫m=m·Δγ (intervalIntegral.integral_const); warp_eq_m_dgamma=m·D/β; paste_value arms=1/(g+1)
  + paste_slope HasDerivAt ∀g>0 (⇒ at g=m·γ); price_is_grad/R_psd by real differentiation
  (μ′=(t−β)²/αβ=price, μ″=2(t−β)/αβ≥0); engineInstance ⟨725,275,1000,1⟩ ⇒ x=1000,w=29/40,γ=29/11(>1),g=γ;
  single_object. **DELETED polar facts (g=0-at-center, g≤γ) correctly ABSENT; no LensShape/polarLens/
  √-kernel** — confirmed by file read + token scan (the reject condition did NOT trigger).
- **#print axioms:** prover RAN it on the named theorems and reported ⊆ {propext,Classical.choice,
  Quot.sound}; the raw per-theorem axiom listing was NOT in the streamed CLI logs (truncated). Corroborated
  by token-clean + no-sorry ⇒ no sorryAx, and all proofs are standard-Mathlib tactic blocks
  (linarith/nlinarith/ring/field_simp/norm_num/convert HasDerivAt/grind/aesop) which only pull the
  standard three. **Canonical-env axiom confirmation deferred — env-blocked (no local kernel).**
**VERDICT: `proved (trusted-from-prover)`** — NOT "verified" (label upgrade needs a local canonical
build; env-blocked). FRAGILE TACTICS flagged (no-math): `grind` (center_eq_sNorm/price_eq_slope/
goalSeek_root), `aesop` (trade_rebase_commute), heavy `nlinarith` (w_consistency/gamma_eq),
`convert HasDerivAt…` (price_is_grad/paste_slope). SIGNATURE ADJUSTMENTS (benign, as-requested):
`warpInt` def added; thetaTx_roundtrip keeps explicit 0<P.m hyp (spec asked). NO statement weakened,
NO hypothesis-on-conclusion strengthened, NO forbidden change.
**FOLDED INTO INDICES:** `formal/INDEX.md` (CONSTANT-m section row flipped pending→trusted-from-prover
+ V28-LENS pending list updated); `formal/MONOLITH_INDEX.md` (superseded-banner updated to returned);
`docs/MONOLITH_INDEX.md` (header note + C3/C16/A1/A5/A10/A16 Lean cells flipped + dedicated table row
moved pending→RETURNED). NO git (manager commits).
**STILL PENDING-SUBMIT (unchanged, NOT trusted):** A14 at-strike no-arb-on-close (needs operator
close-semantics certainty; NOT written); A15 haircut (Q10 pending); A11 asymmetry-growth (re-derive
under constant-m: asym grows with m). C13 real solvency floor STILL-OPEN (operator ship-gate).
**ESCALATIONS TO MANAGER (carry forward):** (1) skeptic FLAG-OMISSION — CLAUDE.md §0 + inventory
items 2/3 still describe frozen-γ-wings/elbow-rounding (DELETED by constant-m; wings are exponent m·γ);
operator one-sentence confirm requested. (2) The monolith Lean object is now trusted-from-prover but
the constant-m ENGINE build (separate intern) + the `lens_selfcheck.js` gate-rewrite (encodes old elbow
design, FAILS constant-m by design) are intern/manager territory.
**SKEPTIC:** universal-gate audit of this fold expected before manager commit.

---

### MONOLITH SYNC → CONSTANT-m LENS (operator entry 229/230) — 2026-06-13
**TRIGGER:** operator entry 229 (verbatim transcript L1839-1841: "its literally just a constant slope
multiplier") + entry 230 ("monilith math etc sync up now"). The kurtosis lens is REDEFINED from the
position-dependent polar `Φ_τ=u/√(τ²+u²)` (elbow-rounding) to a CONSTANT slope multiplier `m`.
**ANCHORED ON the skeptic's confirmed form** (`notes/skeptic/VERDICT_constant_slope_multiplier_entry229_2026-06-13.md`,
run ac79cabc), NOT the manager paraphrase. Confirmed: `g_loc(K)=m·γ` constant at every strike;
`u_true=m·u`; `m=1`=plain v24; bigger m=steeper everywhere; conflict dissolves (steeper chart +
trade-further + transact-at-look all move SAME way with m). m multiplies BOTH coordinate and exponent
(same thing on this plain power-law base).
**THE SIMPLIFIED OBJECT:** an affine rescaling of the log-moneyness coordinate. Warp LINEAR
`ΔG=m·Δγ` (strike-independent; the √-kernel incomplete-Bessel integral + warp-vs-recentering
decomposition EVAPORATE — constant integrand ⇒ ∫m dγ=m·Δγ, no kink). Trade map `θ_tx=mode·(θ/mode)^m`
closed-form invertible `(θ_tx/mode)^(1/m)`. Kurtosis = the scalar `m`. The `LensShape` 5-axiom bundle
collapses to one field `m:ℝ, 0<m`; the honest-GAP (lens not from free energy) shrinks from a function
to ONE number.
**BLAST RADIUS (skeptic-confirmed, carried into every doc):** A5 frozen-γ wings → exponent m·γ
(frozen-γ-wing feature DELETED, still a power law; ⚠ CLAUDE.md §0/inventory items 2/3 need update —
skeptic FLAG-OMISSION, escalate to manager); A16 ATM cusp (Q11) VANISHES (g=m·γ>0 at mode ⇒
clean/continuous, Q11 MOOT); funding (C9) no longer →0 at ATM (shape change); A6 no-arb PRESERVED;
smooth-paste C7 SURVIVES at constant g. HARD gate `lens_selfcheck.js` ENCODES the old elbow design and
FAILS constant-m BY DESIGN — must be REWRITTEN not re-run (skeptic; intern/build concern, flag to mgr).
**WHAT I SYNCED (files):** (1) object note `notes/research/CONSTANT_M_lens_object_sync_2026-06-13.md`
(the simplified object, §§1-4 + supersede table + reachability honesty). (2) SUPERSEDED banners on
`CONTINUOUS_trade_warp_lens_calculus_2026-06-12.md`, `NATURALNESS_polar_kurtosis_map_2026-06-11.md`,
`POLAR_density_first_principles_2026-06-11.md` (history kept, pointers added). (3) `docs/MONOLITH_INDEX.md`
re-based on constant-m: header rewritten; C3/C9/C16/A1/A5/A10/A16 rows updated to constant-m with
SUPERSEDED labels on the polar Lean facts + NOT-YET-BUILT code labels (HEAD de28c937 still has the
POLAR lens) + pending-submit Lean. (4) `formal/INDEX.md`: new CONSTANT-m section (KEPT vs SUPERSEDED
split — LENSKERNEL pool+smooth-paste KEPT, WARPCALC polar-warp + polar lens facts SUPERSEDED); WARPCALC
table rows marked SUPERSEDED; pending-submit updated. (5) `formal/MONOLITH_INDEX.md`: superseded-lens-
layer banner + pointer. (6) NEW Aristotle prompt `formal/prompts/aristotle_prompt_monolith_constm.md`
(the simplified single structure `MonolithConstM.lean` — scalar `m`, g_eq_m_gamma, g_const_in_strike,
thetaTx_roundtrip, warp_linear=∫m=m·Δγ, smooth-paste at g=m·γ, engineInstance m=1, single_object;
HARD constraints forbid reintroducing LensShape/polarLens/√-kernel/θ-dep-g/the deleted polar facts).
**THE SINGLE LEAN STRUCTURE (entry 179) gets CLEANER:** lens field 5-axiom-bundle→scalar; `g` loses
its only nontrivial arg; the hardest old Lean content (FTC-2 on √-kernel, incomplete-Bessel-class
integrand, warp_decomposition) EVAPORATES → one-line `integral_const` corollaries; polar facts
`g_zero_at_center`/`g_le_gamma` DELETED (stated as the negated `g_eq_m_gamma`/`g_ge_gamma_of_m_ge_one`);
trade map `thetaTx_roundtrip` a clean rpow lemma. Everything else (invariant, w/γ/center/price,
trade_conserves, gamma_affine, trade_rebase_commute, smooth-paste, goalSeek, engineInstance) KEPT.
**ARISTOTLE REACHABILITY (HONESTY):** Aristotle IS REACHABLE this session — `uvx --from aristotlelib
aristotle list` returns exit 0 / 200, projects listed, NO 403 host_not_allowed. (Morning 403 concern
does NOT reproduce now.) BUT the constant-m lemmas are NOT submitted yet — prompt written + queued,
ready to fire. Per honesty rule the constant-m Lean layer is **stated, pending-submit, NOT
trusted-from-prover.** Math/object/index sync (the bulk) needs no prover — done fully.
**SUPERSEDED (history kept):** CONTINUOUS_trade_warp_lens_calculus, the inverse-lens θ_tx √-form
(lens_tx/invtx work entries 215-224), √-kernel naturalness notes, WARPCALC polar-warp Lean (`PhiA`/
`warp*`/`recenterKer`/`warp_decomposition`), the `LensShape` bundle + `polarLens`. LENSKERNEL pool +
g-parametric smooth-paste + rebase = KEPT trusted-from-prover (untouched by the lens redefinition).
**WHAT REMAINS:** (1) submit `MonolithConstM.lean` to Aristotle when ready (operator/manager go) →
audit gate → verdict. (2) the gate-rewrite + constant-m engine build is INTERN/manager territory
(I flagged the gate-FAILS-by-design blast). (3) manager: CLAUDE.md §0 + inventory 2/3 redefinition
update + the one-sentence operator confirm the skeptic asked for (frozen-γ-wings + elbow-rounding are
DELETED). (4) prior pending-submit (A14 at-strike no-arb-on-close, A15 haircut Q10, C13 solvency
floor) UNCHANGED. Skeptic audits this sync next; manager folds + commits. NO git, NO engine edit
(done by me here).

---

### MORNING RECOVERY 2026-06-13 — overnight "stall" diagnosed + LENSKERNEL/WARPCALC FOLDED + MONOLITH re-based on HEAD de28c937
**JOB-1 DIAGNOSIS (Aristotle reachability):** Aristotle IS REACHABLE from this env. aristotlelib CLI works (no `403 host_not_allowed`); `ARISTOTLE_API_KEY` set; host 200. `aristotle list` shows projects 24e6497e + d7da8597 (and twins 68440731/f05ecbc2) as STATUS=IDLE — but `aristotle show` reports **both COMPLETE, started 11h 32m ago**. So the overnight submissions DID submit + run + return; the "stall" was the pipeline **never DOWNLOADED the archives** (not a network block; IDLE = task finished, project idle ≠ never ran). NOT prover-blocked. No 403 regression to flag.
**FOLDED + AUDITED → trusted-from-prover (both PASS the full zero-cost gate 2026-06-13):**
- **LENSKERNEL d7da8597** → `RequestProject/LensKernel.lean` (231 lines, `import Mathlib`). Audit: out-of-scope modules (Temporal/AMMCurve/Audit/Seam/Main) BYTE-IDENTICAL to working tree; toolchain v4.28.0 matches; token-clean (no sorry/admit/native_decide/axiom-decl/opaque/unsafe — only kernel `simp +decide` at L130/155/183, ALLOWED); summary asserts axioms ⊆ {propext,Classical.choice,Quot.sound} for tradeUpdate_hyperbola/gamma_linear_in_cash/gLoc_rebase_invariant/gLoc_le_gamma/valueMatch_g/slopeMatch_g. Statements re-derived: tradeUpdate Identity-IV (dx=−αβdy/((y−β)(y+dy−β))), γ′=γ+dy/β flow law, gLoc=γ·Φ(|log(θ/center)|), gLoc_rebase_invariant (C5), gLoc∈[0,γ]+=0 at mode, smooth-paste port valueMatch_g/slopeMatch_g ∀g>0 incl g<1 (no 1<g hyp). Signature note: contCall_hasDerivAt dropped 2 positivity hyps (unconditionally linear ⇒ STRENGTHENS, not weakens; targets keep hyps) — ALLOWED. Folded `formal/aristotle_runs/LENSKERNEL/`.
- **WARPCALC 24e6497e** → `RequestProject/WarpCalc.lean` (297 lines, `import Mathlib`). Same gate PASS (byte-identical out-of-scope, token-clean, axioms ⊆ standard set on warpPot_hasDerivAt/warp_roundtrip_zero/warp_le_dgamma/warp_pos/warp_decomposition). Statements re-derived: warpInt=∫Φ_τ(ln θg)dg exact-differential (FTC-2 warpPot_hasDerivAt), path-indep/round-trip 0, 0≤ΔG≤Δγ (warp_nonneg/le_dgamma), sell≤0, warp_pos, warp_decomposition live=ΔG+recenterKer (kink-inside split at g=1/θ). Aux warp_decomposition_ioo adds no hyps to targets. Folded `formal/aristotle_runs/WARPCALC/`.
- **VERDICT: both `proved (trusted-from-prover)`.** NOT "verified" (no local canonical kernel; env-blocked). Manager fold-confirmation + commit pending (mine to fold, manager commits).
**JOB-2 RE-BASE (`docs/MONOLITH_INDEX.md` → HEAD de28c937, at-strike A14):** DONE. Header re-based note added; HEAD pointer 7e1ae39b→de28c937; build desc = at-strike swap (dy=N·K open+OTM-close, ITM direct-formula payout no-AMM, continuous warp animation); gate count 23→34. Rows: C1/C3/C5/C7/A1/A5 Lean layer flipped pending→GROUNDED trusted-from-prover (LENSKERNEL); C16 NOT-promoted→**VERIFIED+promoted** + WARPCALC GROUNDED; A10 WARPCALC grounded. C11/A1/C7/A12 code+object reflect the at-strike premium-free swap (notional×strike, buy-leg-only option pricing). ADDED A14 (VERIFIED — built+promoted+tester 5/5×2, 34/34 gates), A15 (spec'd/queued, Q10 pending), A16 (IMPL gate-locked a16_atm_gate.js 5/5, theory A16-CONT pending-submit, CUSP=Q11). **Honest Lean labels:** GROUNDED only where the returned+audited archive backs it; A14-close/A15/A16-CONT/A11/A5-limit = **pending-submit (prover-blocked = unwritten/unsent), NOT trusted-from-prover.** `formal/INDEX.md` V28-LENS LINE section rewritten with the 7 grounded rows + pending-submit list.
**WHAT REMAINS for full monolith close:** (1) submit A16-CONT (companion to valueMatch_g — ready to pin); (2) write+submit A14 at-strike no-arb-on-close lemma — needs operator close-semantics certainty (entry 197 trade-at-live/no-round-trip-thinking may tension a close-reverse; FLAG); (3) A15 haircut lemma blocked on decision Q10; (4) A11 asym-growth + A5 wing-limit Tendsto = candidate pins; (5) C13 solvency real floor STILL-OPEN (operator ship-gate); (6) reconcile fw_proj_gate_leak 727fc83e COMPLETE_WITH_ERRORS vs clean summary (owning session); (7) manager fold-confirm + commit the two folded archives. NO row says "verified" (env-blocked). Skeptic audits this re-base next.

---

_Last updated: 2026-06-12 (overnight), MONOLITH STRUCTURE REORDER (operator entry 179) — structure-reorder instance. ⚠ TWO research-lead instances concurrent this night (manager note, commit 66075a7): THIS section = the structure-reorder instance; the base-program instance (L2 defs / Aristotle-store sweep / L3 oracle spec) writes separately — reconcile at fold._

### MONOLITH — SINGLE PURE-MATH STRUCTURE (operator entry 179 VERBATIM: "ensuring structural unification into a single pure math structure on the lean side, and then mapping the components within that") — 2026-06-12 overnight
**REORDER IN FORCE: the TOP deliverable is ONE Lean structure; standalone-theorem route explicitly NOT wanted. Everything else (L2 defs, store sweep, L3 oracle spec) subordinated — owned by the base-program instance.**
**THE STRUCTURE (designed + submitted): `TemporalAMM`** — carried data = conserved charges `alpha,beta` (Casimirs), ONE state coord `y` (x DERIVED via the invariant), `lens : LensShape` (Φ + 5 axioms: Φ(0)=0, 0≤Φ≤1 on u≥0, monotone, continuous). Everything else a def/thm IN-object: `x,w,gamma,center,price,carry,poolPotential,trade,rebase,lensU,g,warp` + `gammaOfW/goalSeekW/sStar/pasteC/markCont/markInt`. Canonical lens instance `polarLens τ` (axioms discharged concretely); engine instance `engineInstance = ⟨725,275,1000,polarLens 0.3⟩` = the calibrated worked pool EXACTLY (x=1000, w=29/40, γ=29/11, center=11/29). Metriplectic leg now CONCRETE in-object: `poolPotential μ(t)=(t−β)³/(3αβ)` with `price_is_grad` (μ′(y)=price) + `R_psd` (μ″=2(t−β)/αβ≥0) + `single_object` (= T2 single_source shape, no carried potential). **HONEST GAP stated in the structure docs: Φ is a calibration FIELD with axioms, NOT derived from the object's free energy — emergence NOT claimed.**
**SUBMITTED to Aristotle (2 runs, prompts `formal/prompts/aristotle_prompt_monolith_{core,warp}.md`, project-dir formal/temporal_lean_verified):** (A) monolith_core → `RequestProject/Monolith.lean`: structure + invariant/w_consistency/gamma_eq/center_eq/price_eq_slope/price_is_grad/R_psd/trade_conserves/trade_flow_group/trade_dx (Identity IV)/gamma_affine/rebase_*_invariant/**trade_rebase_commute (the OPEN C5 register lemma, in-object)**/g bounds/g_zero_at_center/goalSeek thms/paste_value/paste_slope/polarLens/engineInstance/single_object. (B) monolith_warp → `RequestProject/MonolithWarp.lean`: tonight's L1–L4 RESTATED IN-OBJECT (per entry-179 "mapping components within"): warp := ∫γ₀..γ₀+D/β Φ(|ln(θt)|)dt with endpoints from the object's own flow; L1 warp_eq_potential_diff + warp_roundtrip_zero (in-object via (P.trade D).warp θ (−D)); L2 warp_nonneg/warp_le_dgamma + polar wing saturation; L4 warp_nonpos_of_sell (single-signedness); L3 live_diff_decomposition (live = warp + recentering, polar, sign-definite wing; P2 priority). NO free-floating versions were ever submitted (nothing to kill) — the in-object forms ARE the first submissions. Structure blocks byte-identical across both prompts.
**Pre-submission re-derivation (mine, node float64):** paste seam 1.1e-16 value / 5.5e-12 slope-FD; polar_phi_lower 0 violations (4 τ × 1500 u grid); phi-deriv formula 6e-11 vs FD; decomposition identity 4.5e-14; ΔG(2×)=0.5095316 == research-note table. All core algebra (invariant, w_consistency, price_eq_slope, trade_dx, gamma_affine, goalSeek_root, engineInstance rationals) re-derived by hand in-session.
**MAPPING deliverable: `formal/MONOLITH_INDEX.md`** (created) — C1–C16 + A-constraint rows each → field/def/thm IN TemporalAMM, with honest N/A (C2 weight field absent by design; C15 process) and OPEN (C13 solvency NOT closed; lens-shape origin GAP; register-L3 JS-bridge NOT closed by this). Reconcile with base-instance output at fold.
**Verdict state: submissions in flight, awaiting candidates → full audit gate (extract over throwaway, byte-diff out-of-scope modules, token-scan, axiom check, math re-derive) before any verdict. Nothing is trusted-from-prover yet. No git (manager-only).**

---

### OVERNIGHT MONOLITH — BASE-PROGRAM instance (operator entry 177; Aristotle LIVE; 2 runs submitted; sweep done; L3 spec written) — 2026-06-12
_⚠ Reconcile with the structure-reorder section above (entry 179): its in-object `Monolith.lean`/`MonolithWarp.lean` runs take PRECEDENCE on the warp theorems (standalone route "explicitly NOT wanted"); my WARPCALC overlaps monolith_warp = downgrade to CROSS-CHECK at fold; my LENSKERNEL stays the L2 line-cited engine-mirror layer (deliverable #2 of entry 177, feeds the L3 oracle-bridge generator). TWO monolith index files exist: `docs/MONOLITH_INDEX.md` (mine, four-layer obj|code@line|Lean|paper per C1–C16+A1–A12, per the program order) and `formal/MONOLITH_INDEX.md` (reorder instance, in-object mapping) — manager merges; both honest._
**SUBMITTED (mine, in flight):** (1) **LENSKERNEL** `d7da8597-f234-4b41-9976-eff587799a8b` (`formal/prompts/aristotle_prompt_lenskernel_L2.md`): L2 defs line-cited to HEAD (Pool{x,y,α,β}+Reg, tradeUpdate@1679, rebase@1691, hTau@1630/hpTau@1631/lensU@1633/gLoc@1639, markLensed-call@1655) + α/β conservation, hyperbola preservation, w=1−β/y, γ=(y−β)/β, center=1/γ, mpRaw=βγ²/α, **flow law γ′=γ+dy/β**, `gLoc_rebase_invariant` (C5 lens∘rebase, v28 scope), Φ basics, gLoc∈[0,γ] + =0 at mode, **valueMatch_g/slopeMatch_g ∀g>0 incl. g<1** (R1/T1a port, no γ>1 hyp). (2) **WARPCALC** `24e6497e-3c60-4ec1-b626-0e0f2929a39d` (`formal/prompts/aristotle_prompt_warpcalc_L1.md`): warpInt=∫Φ_τ(|ln θγ|)dγ — FTC potential/exactness, additivity/path-indep, round-trip 0, 0≤ΔG≤Δγ, warp_pos (split-at-kink), sell≤0, decomposition live=ΔG+∫recenterKer (off-kink + kink-inside headline).
**ENTRY-142 SWEEP DONE (mine):** store listed (~90 projects). **warp-amm cluster UPGRADED retrieval-only → trusted-from-prover**: token-scan CLEAN ×3, twins statement-identical (proof scripts differ; 7f933065 canonical), summaries assert standard axioms, ALL statements re-derived by hand (mode_shift σ_B algebra, closed-call (1/w₀)ln(y_s/y_B), duality, 2σsinhΔξ); FRAGILE flags `grind`/`nlinarith`; caveat: Model-C TRADE-POINT anchoring ≠ v28 live-mode lens; engine link not claimed. Archives folded → `formal/aristotle_runs/WARPAMM_external/{base_d20dda3a,modelC_7f933065,modelC_twin_4e92e3cb}`; `formal/INDEX.md` EXTERNAL section rewritten + SWEEP + SUBMITTED sections added. **FOUND UNFOLDED (parallel sessions; manager routes):** fw_proj_warp_core 56b4f0fa (COMPLETE, token-clean, unchanged modules byte-identical), fw_proj_gate_leak 727fc83e (**COMPLETE_WITH_ERRORS vs clean summary — reconcile before fold**), fw_proj_germ 6d6ba6e6 (COMPLETE, clean), offatm_submit 90056417/f3776478 (COMPLETE, clean). Pre-repo 4–7wk cluster = retrieval candidates, unaudited.
**WRITTEN (mine):** `docs/MONOLITH_INDEX.md` (honest GAPs: lens not in paper; dollar-pipe no-Lean; A5 wing-limit Tendsto unpinned; A11 asym-growth unpinned; A12 no-go candidate); `specs/SPEC_L3_live_verifiability_oracle_bridge_2026-06-12.md` (blocks B1–B8, live-fn-only rule, hand-mirrored generator → entry-146 Lean-regen upgrade, deliberate-fault self-check, §0 honesty paragraph mandatory).
**PENDING:** poll d7da8597 + 24e6497e (+ reorder instance's two) → download → audit gate → verdicts → INDEX/MONOLITH rows. NO "verified" label anywhere (env-blocked, entry 146).

---

_Earlier: 2026-06-12, CONTINUOUS trade→warp→update-lens CALCULUS (operator entry 160; READ-ONLY; notes-only; no submit/edit/git/build/Aristotle)._

### CONTINUOUS TRADE-WARP-LENS CALCULUS — entry 160 ("do the damn calculus… continuous trade-warp-updatelens") — 2026-06-12 (READ-ONLY; HEAD untouched 7e1ae39b; NO edit/git/build/submit)
Note: `notes/research/CONTINUOUS_trade_warp_lens_calculus_2026-06-12.md`. Scripts `/tmp/rl_cont_{1_flow,2_warp,3_props,4_limits,5_decomp}.js` (node float64; primitives transcribed VERBATIM HEAD L1600–1709; closed forms checked against LIVE tradeUpdate marched in steps, not self-checked).
**CLOSED FORMS (exact, not continuum-idealized — tradeUpdate already lives on them; verified ≤3e-13):** along a trade (α,β conserved, hyperbola (x−α)(y−β)=αβ): `w(y)=1−β/y`; **`γ(y)=(y−β)/β` LINEAR in cash** ⇒ dγ/dy=1/β pool-constant (= the old "warp/$ exactly flat" finding in closed form); `center=1/γ=β/(y−β)`, d(center)/dy=−1/(βγ²) (slide slows as curve steepens); p=(y−β)²/(αβ). Exact mode shift Δln center=−ln((y₁−β)/(y₀−β)); identity d ln center=−(1/w)d ln y ⇒ frozen-w approx = retrieval-only warp-amm `mode_shift=(1/w₀)log(y_s/y_B)` (structural connection, labeled).
**THE WARP (riding lens, = N→∞ of skeptic #43/#44 held-then-update per-step mechanic):** `ΔG(K)=∫_{γ₀}^{γ₁}Φ_τ(|ln(θ_K·γ)|)dγ = F_K(γ₁)−F_K(γ₀)` — **EXACT DIFFERENTIAL in γ (per-strike potential, path-indep, round-trip 0)** = the operator's "set of closed form integrals". Elementary limits: τ=0 ⇒ ΔG=Δγ=D/β exact; wings ΔG/Δγ≥1−τ²/2v²; small-trade 1st order = held-center fix Δγ·Φ(|u₀|); general: NON-elementary (incomplete-Bessel class, by-parts+rapidity reductions verified 4e-16; classification LABELED not proven) but convergent series of elementary terms (40 terms ⇒ 4e-16) + 1-line quadrature.
**PROPERTIES (all float64-verified):** (i) SINGLE-SIGNED — 401-pt scan 0 negatives; the 0.7×-center sign-flip CURED in the right observable: exact decomposition `liveDiff = ΔG_accum + recentering ∫sign(v)Φ′dγ` verified 5e-15 vs live engine (0.7×: live −0.4586 = warp +0.3513 + slide −0.8099). (ii) V-shaped in log-strike: monotone-more-warp-OTM per side, min in the swept center band, SATURATES at Δγ (not unbounded). (iii) bounded |ΔG|≤|Δγ|=|D|/β; preview trace g_pre+ΔG≤γ₁; no blow-up any τ. (iv) N-step discrete (live engine) → integral at clean O(1/N) (err ratio 10.12/10.01 per decade; N=1,10,100,1000 tables). (v) call/put asym GROWS superlinearly (asym/Δγ 0.0071→0.1338 for D $25→$400) = continuous twin of #44 §4.
**CHART VERDICT (#5, build-determining):** standing post-trade chart = LIVE final state through final lens (v28 live drawing RATIFIED; no stored center survives). PREVIEW after-trace = `g_pre(K)+ΔG(K)` (riding integral); only reference = γ₀ = the pre-trade state itself (not a stored φ; expires with preview). **In-flight held-center fix = the N=1 left-endpoint approximation — MODIFIED not void/not ratified-as-is:** direction right (live endpoint diff masks+flips), kernel superseded for finite trades (calib $150: +91% overshoot at 0.829×, exact-0 vs 0.161 at 1×, wings agree; small trades 1st-order exact). Build = keep modeOverride plumbing, swap held product → fixed quadrature (~64-pt Gauss or N≈100 substeps, err≤1.5e-3), forward-only, L4 intact. FLAG (display semantics, to manager): preview warp-trace ≠ post-trade pricing curve g₁ (differ by recentering term) — chart must not label warp trace as "curve after your trade" without the live curve; which overlay(s) shown = display-semantics call.
**SINGLE OBJECT (#6, honest):** natural — trade = level-set flow of H=(x−α)(y−β) (α,β Casimirs, T2 metriplectic conservative leg); γ affine in port variable y; warp admits per-strike potentials (conservative). NOT-yet-shown: Φ_τ/τ not derived from H or any free-energy functional (view-layer, calibration); funding/R-leg untouched.
**Lean candidates (NOT submitted, pin on call):** L1 exactness/path-indep of ΔG; L2 bound 0≤ΔG≤Δγ + wing saturation; L3 decomposition identity (chain rule on γΦ); L4 single-signedness. Ready once chart semantics ruled. Nothing submitted/built/edited/git. Skeptic cold-audit expected.

---

_Earlier: 2026-06-12, GOAL-SEEK WARP #16 — CORRECTION APPENDIX (held-mode exponent fix) after skeptic HOLD/FLAG-WRONG on the build (READ-ONLY; spec-only; no submit/edit/git/build/Aristotle)._

### GOAL-SEEK WARP #16 — CORRECTION APPENDIX (held-mode EXPONENT fix) — 2026-06-12 (READ-ONLY; HEAD untouched 7e1ae39b; NO edit/git/build/submit)
Trigger: skeptic `notes/skeptic/VERDICT_C16_goalseek_warp_PROMOTE_2026-06-12.md` = **HOLD / FLAG-WRONG** on the built `temporal_mvp_v28_lens_warp.html` — the held-lens after-trace draws its EXPONENT at the POST-trade mode, the masked frame the operator corrected (entries 129/131/132). Goal-seek readout half is honest+correct; the warp-view half (the build's reason to exist) was green-over-defect.
**ROOT CAUSE (mine, confirmed on live engine):** my RECONCILED spec §B-L79 said "call `drawState(snap.sNorm, true, previewPool, τ)`" — but `Engine.gLoc(state,θ,τ)` (HEAD L1639) reads its mode INTERNALLY via `lensU→getSNorm(state)` (L1633-1637). On one Balancer pool mode=(1−w)/w is LOCKED to γ, so passing `previewPool` moves BOTH γ AND mode ⇒ re-centered = masked. The `snap.sNorm` arg only set the x-axis (`tmDeg`, L3573) + `psiAt` ATM-center (L3582) + `markLensed` smooth-paste center (L3583); it NEVER reached the exponent. Gate W1 hand-rolled `Phi(uHeld)` and checked the trivial `(γ′−γ)Φ=γ′Φ−γΦ` identity — tested a quantity nobody plots; W6 was a regex.
**THE FIX (CORRECTION appendix appended to `specs/SPEC_v28_goalseek_warp_RECONCILED_2026-06-12.md`, dated):** add optional 4th param `modeOverride` to `Engine.gLoc` (mode = override if >0 else `getSNorm(state)`; γ ALWAYS from pool); thread an optional 5th param into `Viz.drawState` (passed to gLoc in the `poolForLens` branch only); the dashed after-trace call (HEAD L3630-3632) becomes `drawState(snap.sNorm, true, previewPool, state.tau, snap.sNorm)` ⇒ moved γ read through the HELD pre-step mode. **AFTER-TRACE ONLY (hard guard, gate W-OVR):** override passed at EXACTLY ONE site; `legPrice`/`markEff`/`fundingPerStrike`/portfolio/live-trace pass NO 4th arg ⇒ byte-identical, stay at live mode (no basis break / A12 / single-basis violation).
**RE-DERIVED (mine, live engine via vm, `/tmp/rl_heldmode_warp_check.js`):** calibrated skeptic case (Balancer w=0.725, dy=150 ⇒ γ 2.636→3.182, heldMode=0.3793, postMode=0.3143, τ=0.3): (A) CURRENT after-trace sign-FLIPS at θ=0.7×mode (−0.4589 vs promised +0.4176) = the bug reproduced exactly (skeptic table −0.4586). (B) held-override identity `gLoc(post,θ,τ,held)−gLoc(pre,θ,τ,held)==(γ′−γ)·Φ_τ(u_held)` to max **7.1e-15**, monotone-OTM both wings, NO sign-flip. (C) override-OMITTED `gLoc(pool,θ,τ)`==current `Engine.gLoc` to max **0.0** over 100-pt grid ⇒ omitted path byte-identical.
**CORRECTED GATES:** W1 now CALLS `Engine.gLoc(previewPool,θ,τ,heldMode)` (the real draw path) and asserts ==`(γ′−γ)Φ` + monotone-OTM + NO sign-flip, with the skeptic's 0.7×mode point as a LOCKED regression that FAILS the old (no-override) draw and PASSES the fixed one. W-OVR (new) = override-after-trace-only structural/spy guard. W6 corrected to a behavioral exponent-array equality (not a regex). Gates 2/3/4/5 unchanged.
**BYTE-IDENTICAL:** `tradeUpdate`/`arbitrageToOracle`/`rebase`/`executeLeg`/`legPrice`/settlement (`markEff`/`closeBand`/`fundingPerStrike`) — only diffs = gLoc +optional 4th param (default=today), drawState +optional 5th param (pool branch only), 1 after-trace call swap.
**BOTTOM LINE: buildable as ONE intern pass = YES.** No NEW operator-tier flag (mechanic = already-approved frozen-pre-warp lens, entries 129/131/132 + skeptic #43/#44 + inventory #16); §H body flags (R1 BLOCKED/out-of-scope; single-step symmetric-rescale honesty caveat) STILL STAND. NO Lean obligation ready (closed-form readout of transcribed primitives). Skeptic R6-gates the correction before intern rebuild; manager re-derives float64 + byte-identical before build. Nothing submitted/built/edited/git.

---

_Earlier: 2026-06-12, GOAL-SEEK WARP (item #16) RECONCILED BUILD SPEC on v28 lens — BUILDABLE ONE PASS, held-lens amplify model (READ-ONLY; spec-only; no submit/edit/git/build/Aristotle)._

### GOAL-SEEK WARP #16 — RECONCILED BUILD SPEC (held-lens amplify model) — 2026-06-12 (READ-ONLY; HEAD untouched 7e1ae39b; NO edit/git/build/submit)
Spec: `specs/SPEC_v28_goalseek_warp_RECONCILED_2026-06-12.md` — **SUPERSEDES the stale `SPEC_v28_goalseek_warp_BUILD_2026-06-12.md`** (which called the warp BLOCKED under the LIVE RE-CENTERING lens; operator entries 129/131/132 corrected exactly that — lens HELD during the warp step, updates BETWEEN steps, NOT live re-centering ⇒ the old 1/h″→∞ inversion blocker dissolves). Built ON skeptic verdicts #44 (`VERDICT_AMPLIFYING_LENS_warp`) + #43 (`VERDICT_FROZEN_PREWARP_LENS_goalseek`); operator entries 128–133 verbatim.
**VERDICT: BUILDABLE as ONE intern pass. Two changes, BOTH READ/VIEW, ZERO write-path change.** (i) draw the warp through the lens HELD for the step — `Viz.drawState` preview call (HEAD L3632) currently draws at the POST-trade mode `snapPost.sNorm` (re-centering = MASKS the warp); change to draw the moved-γ `previewPool` at the PRE-step mode `snap.sNorm` ⇒ strike-dep reshape dG=(γ′−γ)·Φ becomes VISIBLE. (ii) goal-seek readout `Engine.goalSeekW(G)=G/(1+G)` (closed-form, G≥1 guard ⇒ w′≥0.5 ⇒ γ>1) + UI display. POOL BYTE-IDENTICAL: tradeUpdate L1679 / arbitrageToOracle L1702 / rebase L1691 unchanged plain v24. One premium per leg @ θ_K (executeLeg/legPrice unchanged). NO second strike, NO two-strike write (= the BLOCKED R1, kept OUT — §F STOP guard).
**FLOAT64 RE-DERIVED (mine, fresh path `/tmp/rl_reconciled_check.js` + `/tmp/rl_goalseek_target.js`):** CHECK1 dG=(γ′−γ)·Φ_τ(u) matches direct held-mode gLoc diff to max 1.4e-16; CHECK2 monotone-OTM, τ-amplified, max(g_loc/γ)=0.998≤1; CHECK3 w′=G/(1+G) unique root of γ(w′)=G, monotone, NO inversion (no 1/h″, no bisection); CHECK4 G≥1⟺w′≥0.5⟺γ>1, boundary G=1⟺w′=0.5 exact. GOAL-SEEK TARGET is on γ (γ(w′)=G) — Φ NEVER divided out (dividing Φ out = the REJECTED neutralise op giving w′=w₀ flat, verdict #44 §2).
**L4 PRESERVED:** no 1/h″, no root-find feeding a write, no slope-as-pool-input; goalSeekW converts G→w BEFORE any pool action, never an arg to tradeUpdate. 6 lens_selfcheck gates (held-lens-warp-formula / goalSeekW-single-root+G≥1-guard / pool-byte-identical-md5 / bounded-g≤γ / no-inversion-token-scan / held-mode-draw-assertion). R3 control inventory: w=warp DOF (kept, trade is actuator), trade-size=walk amount (kept), τ=lens shape amplifier (kept static), recentered dashed trace=REPLACED by held-mode trace, goalSeekW=NEW advisory readout (drives nothing auto; optional apply via existing weight path).
**OPERATOR-TIER (flag, not decided):** settlement/payoff strike θ_K UNTOUCHED (must stay so; true write-relocation = R1 BLOCKED + settlement-semantics change = A-vs-B trade-point object, entries 31/33/38/88/91/117/118/121); single-step honest caveat (within ONE frozen step warp is symmetric vertical rescale; real strike-differentiated skew emerges ACROSS the sequence as mode updates — verdict #44 STANDING CAUTION, UI copy must not over-claim per-strike in-step bend); payoff chart on unbent curve (cosmetic, entry 101, out of scope). NO Lean obligation ready (closed-form readouts; R1 no-go lemma out of scope). Nothing submitted/built/edited/git. Skeptic R6-gates spec; manager re-derives float64 + md5 byte-identical claims before build.

---

_Earlier [SUPERSEDED by the RECONCILED spec above — its BLOCKED verdict was computed under the LIVE re-centering lens; operator corrected to held-lens]: GOAL-SEEK WARP #16 — BUILD SPEC on v28 lens (operator wants HTML within the hour) — 2026-06-12 (READ-ONLY; HEAD untouched 7e1ae39b; NO edit/git/build/submit)
Spec: `specs/SPEC_v28_goalseek_warp_BUILD_2026-06-12.md`. Float64 checks `/tmp/gsw_spec_check.js`, `/tmp/gsw_spec_check2.js` (engine primitives transcribed VERBATIM from HEAD L1600–1772).
**SPLIT VERDICT (two readings of "trade lands at θ_eff"):**
- **R1 = relocate the WRITE to θ_eff: BLOCKED.** Two OPEN obstructions, neither closeable forward/bounded, both = #101 regression class. **BLOCKER-A (mode-collapse):** g_loc is MODE-RELATIVE; moving the live mode to θ_K ⇒ u→0 ⇒ slope COLLAPSES to 0 (float64: g_loc(2× strike)=1.376597 from spot → 0.000000 when mode moved there). Holding far-out steepness WHILE executing far out needs a STORED reference mode = (W) φ = the demoted weight field. **BLOCKER-B (two-strike basis leak):** write@θ_eff + settle@θ_K ⇒ open-then-close ≠ 0 (gap m(θ_K)−m(θ_eff) = 0.0826/0.0358/0.0151 at K=1.5/2/4×) = a same-state arb. No forward single-basis construal relocates the write AND keeps slope≠0 AND keeps the payoff strike — pick any two, third breaks. Self-adversarial: construals (I) opposite-slippage+O5, (II) inverse-solve 1/h″→∞ banned, (III)=HEAD — none whole for R1. **DO NOT BUILD R1.**
- **R2 = forward θ_eff ATTRIBUTION layer (label on the existing plain-v24 spot swap): INTERN-READY.** New `Engine.thetaEff(state,θ_K,τ)=mode·exp(sign(u)·h_τ(|u|))` — pure forward, bounded |u_eff|≤|u| (CHECK1 all strikes), NO 1/h″, NO inversion. **POOL BYTE-IDENTICAL** (tradeUpdate L1679 unchanged; executeLeg/legPrice one-premium-@-θ_K unchanged) — answer to gate (e): pool fn does NOT change. Change-set = one helper + one display read (~minimal). All 5 obstruction gates CLOSED: (a) round-trip x/y err 0; (b) no inversion (L4); (c) solvency markLensed∈[0,1] min 0.00298647 max 1.0; (d) well-posed single-valued forward; (e) pool unchanged. Bounded: gearing 1/(∂g/∂w) SATURATES 0.106→0.160 (≤0.17), never runaway. 6 lens_selfcheck gates (θ_eff-bounded / no-inverse-helper / round-trip-zero / no-θ_eff-in-write / bounded-gearing / pool-byte-identical). **ONE intern pass.**
**THE HONEST LINE:** R2 gives the operator the "look through the lens at the trade point" VIEW airtight; it does NOT relocate the write. A true write-relocating warp is the mode-relativity category error (re-summons φ), NOT a tuning gap — that's the A-vs-B / trade-point-object decision, OPERATOR-TIER (entries 31/33/38/88/91/117/118/121), flagged not decided. Settlement keeps θ_K as payoff strike (moving it = BLOCKER-B arb + undisclosed semantics change = operator-tier). NO Lean obligation ready (thetaEff = closed-form readout; blocker = algebraic mode-relativity⇒φ identity; no-go lemma pin ONLY if operator wants it formalised). Nothing submitted/built/edited/git. Skeptic R6-gates the spec; manager re-derives float64 + byte-identical claims before build.

---

_Earlier: 2026-06-12, GOAL-SEEK WARP MAGNITUDE far-OTM per dollar — entry-121 physics argument (READ-ONLY; notes-only; no submit/edit/git/build/Aristotle)._

### GOAL-SEEK WARP MAGNITUDE far-OTM/$ — entry-121 ("more warp far otm per unit dollar… slope steeper far out… trade moves the point more") — 2026-06-12 (READ-ONLY; HEAD untouched 7e1ae39b; NO edit/git/build/submit)
Note: `notes/research/GOALSEEK_WARP_magnitude_far_otm_2026-06-12.md`. Scripts `/tmp/gsw_{setup,derive2,slope_defn,lensview,net,why_const,steelman,AB_robust,adversarial}.js` (node float64; engine primitives `getW/getSNorm/getMP_raw/tradeUpdate/hpTau/gLoc` transcribed VERBATIM from HEAD L1600–1709).
**FRAMING (load-bearing, stated up front): TWO quantities, prior work conflated.** (A) spot-swap EXECUTION slippage = BUILT+MEASURED (v28 tradeUpdate at live point; skeptic #119 FLAT per fixed cash $). (B) goal-seek WARP MAGNITUDE = UNBUILT+DERIVED (inventory #16, skeptic #38). Entry-121 is about (B). Re-derived on the LENS architecture (plain Balancer pool + mode-relative lens), NOT assumed from the demoted (W) curve.
**HEADLINE: operator's "more warp far OTM per unit dollar" = FALSE on the lens; warp/$ is FLAT (float64), NOT rising.** M1 Δw_warp/$ EXACTLY constant across K={1.5,2,4,8,20×} × τ={.05,.3,1} × 4 pools (spread ≤1.5e-5 = FD noise; −2.50e-2@γ1.5, −1.20e-3@γ2.33, −9.0e-2@γ1.22). M2 visible Δσ_K/$ flat-to-FALLING OTM; warp curvature decays OTM. Monotone-NON-increasing, not his monotone-increasing.
**WHY EXACTLY FLAT (analytic identity, `/tmp/gsw_why_const.js`):** on plain Balancer the curve param enters g_loc(K) THROUGH γ ALONE (mode=1/γ ⇒ u_K=ln θ_K+ln γ) ⇒ restoring the slope at ANY strike restores it at EVERY strike (single global γ knob; NO per-strike warp DOF). Δw_warp/$ = −(swap w-drift/$) = a POOL CONSTANT, strike+τ-degenerate.
**OPERATOR PARTLY RIGHT (steelmanned):** premise Effect-1 ("slope steeper far out" = g_loc 0→γ; raw Balancer is FLAT, steepness is PURE lens) TRUE; "trade moves the (lensed) point more far out" |du_eff|/$ rises+saturates OTM TRUE. His ERROR = the inference "moves more ⇒ more warp": restoration is GLOBAL via γ, so Effect-1 cancels the SATURATING Effect-2 (∂σ_K/∂w saturates ~6.25 far out, does NOT keep growing). Missing piece = no per-strike warp DOF (that DOF = the w(u) weight field = the (W) curve = where the runaway lives).
**BOUNDED vs RUNAWAY = THE crux, CONFIRMED for lens specifically:** (ln K)³ runaway does NOT carry. (W) gearing 1/w′~u³→∞ (9.5→7281 @1.5x→100x); LENS gearing 1/(∂σ/∂w) SATURATES (0.106→0.160). Even the L4-banned INVERSE goal-seek is BOUNDED here (∂σ/∂w saturates, not →0). τ→0 at fixed strike: warp/$ stays −2.50e-2 (NO blow-up). Runaway needs a frozen-wing WEIGHT FIELD; plain Balancer has none. So operator's correct geometric intuition does NOT bring the runaway — lens absorbs it — but ALSO does NOT yield more-warp-far-out; yields FLAT warp.
**(B)→(A) RECONCILE (operator vindicated HERE):** under the goal-seek, execution moves to the strike ray ⇒ per-$ price-impact = g_loc(K) RISES OTM (0→γ, sat). So SLIPPAGE-felt rises OTM (B) while build's spot-swap feels flat spot slope (A, skeptic #119 correct). Operator conflated slippage-rising (TRUE,B) with warp-magnitude-rising (FALSE,B).
**OPERATOR-TIER (flag to manager, not decided):** A-vs-B / move build to trade-point goal-seek (entries 31/33/38/88/91/118). New datum: on lens, B = flat per-$ warp + rising per-$ slippage, BOUNDED (no runaway) — unlike (W)-curve B. Trade-mechanics/curve-object call. **NO Lean obligation ready** (closed-form/float64 readouts of transcribed primitives, not theorems; candidate no-go lemma "slope-restoring reweight is strike-independent = warp DOF is global not per-strike" = algebraic restatement of GLOBAL-SKEW impossibility, pin ONLY if operator wants the no-go formalised). Self-adversarial: 3 attacks (visible-bend curvature / banned inverse / τ→0) all leave warp flat/bounded; operator's premise CONFIRMED not dismissed; failure isolated to absent per-strike warp DOF. Nothing submitted/built/edited/git. Skeptic adversarial pass follows; manager re-derives.

---

_Earlier: 2026-06-12, LENS LIFECYCLE + TRANSACT/GOAL-SEEK-AT-SHIFTED-TRADE-POINT — FEASIBILITY (entry 117; READ-ONLY; notes-only; no submit/edit/git/build/Aristotle)._

### LENS LIFECYCLE + SHIFTED-WRITE FEASIBILITY — entry-117 "look through the lens for every lifecycle touchpoint; transact/goal-seek wrt the trade point — is this possible?" — 2026-06-12 (READ-ONLY; HEAD untouched 7e1ae39b; NO edit/git/build/submit)
Note: `notes/research/LENS_lifecycle_transact_goalseek_FEASIBILITY_2026-06-12.md`. Scripts `/tmp/lens117_{engine,partB,obstruction,baseline,obs23,obs4567,obs5_divergence,construal,reconciled_rt,steelman}.js` (node float64; engine primitives transcribed VERBATIM from HEAD lines 1600–1709/1722–1772/1900–2094/2164–2183).
**HEADLINE = NOT constructible end-to-end as pictured; OBSTRUCTION FOUND (the regression root): `g_loc(K)=γ·h′_τ(|ln(K/mode)|)` is MODE-RELATIVE (=0 at the live mode, grows to γ in the wings).** The operator's two asks are mutually exclusive on a single-point pool + mode-relative lens: "goal-seek SEES a steeper slope far out" (113) reads g_loc with the mode AT SPOT — the steepness exists ONLY because the mode is elsewhere; "transact/goal-seek WRT the trade point far out" (117) wants to EXECUTE there, but arriving moves the mode TO the point ⇒ g_loc=0 (flat top). **Smallest counterexample (float64): K=2×, τ=.3, γ=1.5 — read from spot g_loc=1.377; move reserves to the ray ⇒ new mode==θ_K ⇒ u=0 ⇒ g_loc=0.000000.** The ONLY way to hold both (read far-out steepness WHILE executing far out) = measure |u| from a STORED reference mode, NOT the live mode = (W)'s φ = the weight field = the demoted v27 object. Same structural impossibility as the GLOBAL-SKEW run ("memoryless reserve→σ CANNOT restore a pre-trade slope target; σ must store history = φ"), reached from the lens side. THE ~100-regression pattern: strike-dependent EXECUTION keeps re-summoning a stored-history scalar = the weighted curve.
**PART A (11 touchpoints):** whole obstruction lives in rows 4 (the swap) + 5 (goal-seek). Rows 1–3,6–11 (load/quote/chart/settle/funding/portfolio/liq/rebase/LP) are forward, already in HEAD, clean, single-basis, solvent, rebase-commuting.
**PART B (θ_eff exists, forward):** lensed accumulated coord `q_lens(u)=γ·sign(u)·h_τ(|u|)` (∫h′=h_τ, closed form); effective-strike `u_eff=sign(u)·h_τ(|u|)`, θ_eff=mode·exp(u_eff) — PURE FORWARD (no root-find, no 1/h″), BOUNDED |u_eff|≤|u| (shrinks toward mode). θ_eff DOES exist (skeptic #35 pt-4 confirmed); the problem is what "execute there" means.
**PART C obstruction verdicts:** O1 round-trip CLOSED (not new — HEAD already drifts identically on premium re-read; dy_R=−dy_F law preserved, tradeUpdate unchanged α,β flow invariants exact 0.0); O2 fold CLOSED forward/OPEN if inverted (G(dy) non-monotone, 1 fold at mode-cross; forward single-valued); O3 inversion CLOSED forward (1/h″ blows up 5701@u=8; only an INVERSE target-slope goal-seek inverts = L4-banned; all touchpoints forward); O4 solvency CLOSED (markLensed∈[0,1], min 1.9e-2 max 1.0; m(θ_eff)≥m(θ_K) ratio 2.04→1.32 but ≤1); O5 single-basis OPEN/two-strike-per-leg hazard (leg gets θ_K=payoff + θ_eff=sizing; gap 0.083@1.5× ⇒ basis leak unless ONE premium per leg ⇒ reduces to HEAD); O6 rebase CLOSED (sNorm ratio coord invariant, g_loc pre==post); O7 pool-invariant CLOSED-if-premium-sized-spot-swap / BROKEN-if-execute-at-ray (=Fork A, different swap).
**3 construals, none whole:** (I) size dy from m(θ_eff) spot swap — forward+solvent but gives OPPOSITE slippage (dy=prem$·m_eff/m_K, ratio GROWS toward ATM ⇒ more slippage near ATM not OTM) + O5 split; (II) goal-seek pool marginal to lensed slope at θ_K — INVERSE (O2 fold+O3 blow-up) = regression hazard; (III) HEAD as-is — forward+clean but spot swap strike-blind (entry-113 flat 8.33%) so write NOT shifted. The strike-dependent EXECUTION operator wants needs a non-live (stored) mode = weight field = headline obstruction.
**WHAT IS CONSTRUCTIBLE (honest whole subset):** full lifecycle READ through lens (already HEAD); forward θ_eff as a VIEW/display/attribution LABEL on the existing spot swap (does NOT change the write). NOT constructible without re-introducing φ: strike-dependent execution / trade-point-anchored swap with OTM-rising slippage + non-live-mode slope read.
**OPERATOR-TIER (flag to manager, not decided):** A-vs-B / trade-point-object (spot-swap vs trade-point-warp) — entries 31/33/38/88, MEMORY entry-113. **NO Lean obligation ready** (impossibility is algebraic = restatement of GLOBAL-SKEW structural-impossibility; θ_eff is a closed-form readout not a theorem; candidate no-go lemma "any far-out lensed-slope-while-executing-far-out map needs a state-independent stored mode" worth pinning ONLY if operator wants the no-go formalised). Self-adversarial: steelmanned the two-layer model (114) + forward θ_eff re-size (I) — both fail entry-113's slippage direction; confirmed θ_eff exists (not "can't be done"); isolated obstruction to mode-relativity, not lens construction. Nothing submitted/built/edited/git. Skeptic adversarial pass follows; manager re-derives.

---

_Earlier: 2026-06-12, SLIPPAGE-PER-DOLLAR vs strike/τ — settled entry-113 operator claim (READ-ONLY; notes-only; no submit/edit/git/build/Aristotle)._

### SLIPPAGE PER DOLLAR vs STRIKE & KURTOSIS — entry-113 settlement (operator claim "goal-seek sees steeper slope far out ⇒ more slippage per dollar") — 2026-06-12 (READ-ONLY; HEAD untouched 7e1ae39b; NO edit/git/build/submit)
Note: `notes/research/SLIPPAGE_per_dollar_strike_tau_2026-06-12.md`. Scripts `/tmp/q113_setup.js`, `/tmp/q1_table.js`, `/tmp/q2_strikeblind.js`, `/tmp/q3_tradepoint.js`, `/tmp/q4_blowup.js`, `/tmp/q_adversarial.js` (node float64; build primitives transcribed VERBATIM lines 1600–1772 of HEAD_temporal_mvp_v28_lens.html).
**CODE FACT CONFIRMED (manager-read, verified):** `executeLeg` (L1761) → `dy=±N·markLensed·oracle; post=tradeUpdate(state,dy)`. `tradeUpdate(s,dy)` (L1679) takes ONLY {s,dy}; strike θ_K and τ enter ONLY via the lensed premium that SIZES dy. The swap runs at the LIVE pool point (SPOT), never the strike ray; no per-trade goal-seek visits the strike's slope. Numeric: at fixed dy, tradeUpdate output byte-identical ∀strike/τ/wing; exec px 1.625 = spot-driven regardless of strike g_loc (0/1.21/1.38/1.45 ATM/1.5x/2x/3x).
**Q1 (4 metrics, w=0.6 γ=1.5, |dy|=$5 fixed across all cells):** (i) pool-slip% = 8.3333 EVERYWHERE (16/16 cells, float64-exact); (ii) cost$/premium$ = 0.07692 EVERYWHERE — both FLAT (forced: pure fn of (pool,dy), strike/τ absent from tradeUpdate). (iii) cost/notional FALLS OTM (7.7e-2→4.8e-3) + rises with τ; (iv) optpx% FALLS OTM (61→13.5) + falls with sharper τ. "Per dollar" = (ii) ⇒ FLAT. NO build metric rises OTM at fixed premium-$.
**Q3 INTENDED (trade-point) mechanic:** g_loc(K)=γ·h′_τ(|u|) = the "steeper slope far out" — RISES monotone 0(ATM)→γ(wings) ∀τ; RISES as τ falls at fixed OTM strike (2x: 0.49→1.50 as τ 2→.05). So operator's (a)+(b) intuition CORRECT for trade-point mechanic. CAVEAT: g_loc SATURATES at γ (h′≤1), does NOT diverge — bounded, not runaway.
**Q4 blow-up:** FORWARD g_loc≤γ, dG/du=γ·h″ bounded→0 wings = NO blow-up/NO cap (no w(u)⇒no 1/w′ channel). INVERSE 1/h″→∞ wings (12.6/91.9/717/5701 @u=1/2/4/8, τ=.3) ⇒ a trade-point mechanic that SOLVES for a target slope re-introduces blow-up; a forward-read one stays bounded. Bounded path = execute at strike ray, engage g_loc forward only, never invert (= L4 discipline already in spec).
**VERDICT — (a)/(b): FALSE in build-as-is (flat at fixed premium-$), TRUE under trade-point mechanic (bounded by γ).** "Simple swap sees steeper slope far out" = FALSE for build (swap at spot), TRUE for trade-point mechanic (swap at strike ray). **MANAGER'S "FLAT" FINDING IS CORRECT** + necessarily so; operator RIGHT about the mechanic they picture but build does the SPOT swap. Gap = build-vs-paper trade mechanic (spot-swap vs trade-point warp) = the A-vs-B / trade-point object (entries 31/33/88), OPERATOR-TIER — flagged not decided. NO Lean obligation (algebraic readout; tradeUpdate strike-blindness is a code fact not a theorem). Nothing submitted/built/edited/git. Skeptic pass follows; manager re-derives.

---

_Earlier: 2026-06-12, WRITE/SETTLE THROUGH LENS spec (Stage 2; operator entry 96; READ-ONLY; spec-only; no submit/edit/git/build/Aristotle)._

### WRITE/SETTLE THROUGH LENS — Stage 2 spec (lens = unit of account EVERYWHERE) — 2026-06-12 (operator entry 96 verbatim; READ-ONLY; HEAD untouched 928cde1c; v28 build untouched 1ed8fe2d; NO edit/git/build/submit)
Appended **§11 "WRITE/SETTLE THROUGH LENS"** to `specs/SPEC_v24_lens_BUILD_2026-06-11.md`. Operator (entry 96, `history/operator/2026-06-10_kurtosis-curve-family-brief.md`) UNLOCKED the traded/settled dollar pipe + portfolio value: settle at lensed prices, record the lensed version. Build = `engine/builds/temporal_mvp_v28_lens_S1.html` (md5 1ed8fe2d, Stage-1 read layer on plain-v24). Scripts `/tmp/lens_settle_arb.js`, `/tmp/lens_band_arb.js`, `/tmp/lens_modecont.js` (node float64; engine primitives transcribed from build lines 1608/1655/1716/1902/1955/2153/4168/4259).
**CALL-SITE TABLE (raw v24 mark → lensed, 9 sites enumerated off the build):** 5 CHANGE — W1 `legPrice` (1716, lens+thread τ, DROP composite→leg-by-leg), W2 `executeLeg` (1752, V now lensed, dy-sizing form unchanged = the "writes amm tx"), W3 `closeBand` settlement+reversal legs (1955, BOTH lensed), W4 `markEff`/`legValueUnified` (1902, →markLensed), W6 UI `pfComponents` (4168, →markLensed) + W7 `raw_net`/`dollarFigure` aggregation (4259, formula UNCHANGED, basis only). 4 DON'T — W5 funding (2153, ALREADY lensed Stage-1), W8 carved perp-slice P&L `attribPnL`/`equityAtClose` (perp basis, NOT lensed — category error if touched), W9 draw layer (3542, already lensed).
**ONE-HELPER RULE = the consistency invariant** (closes the v27 bug-class): every layer reads the SAME `Engine.gLoc`/`Engine.markLensed` at the SAME live `getSNorm(state)` mode, sNorm coord (MUST-APPLY-1), γ LIVE. One gLoc, one markLensed in Engine already.
**NO-ARB / SOLVENCY VERDICT = CLEAN under the one-helper rule, broken only if a leg/layer is lensed in isolation:** (A) SOLVENCY PASS — `markLensed ∈ [0,1]` global (float64 0.000007…1.0), per-leg payout ≤N, same intrinsic ceiling as kinked mark, v24 reserve bound inherited. (B) NO same-state arb IF both open+settle lensed — `markLensed_open − markLensed_settle = 0` exactly (max diff 0); open-then-immediate-close raw_net=0; if mixed (open kinked, settle lensed) the gap is 0.44–0.79 (REAL basis-mismatch bug, forbidden). (C) THE HAZARD = intra-band two-leg basis split (closeBand settles ITM leg via markEff, reverses OTM leg via legPrice — `raw_net=Y−X` mixes bases if only one lensed; gap 4–8×); BOTH must move together. (D) pool-exec vs lensed-settle coherent (same lensed V sizes dy and is the settled value). **NOT operator-tier** — entry 96 ruled semantics; no new economic object.
**STAGING:** OWN stage (Stage 2), NOT folded into Stage 1 (write/settle wiring error must not corrupt the green read layer; two-leg basis split is a new failure mode). 8 gate additions to `engine/verify/lens_selfcheck.js` (settled==lensed·size; open==settle; UI==engine cross-layer; intra-band single-basis; round-trip-zero close [catches ln γ close-side coord slip §11.4-caveat]; solvency ceiling ≤1; no-arb identity =0; L4/tradeUpdate-byte-identical regression).
**FLAGS (operator-tier, record-relay only):** (1) ITM/OTM display label softens under lens (markLensed continuation runs past S* — no hard ITM=1 saturation; = already-accepted g<1 flat-top reading entry 93 #5, now touches portfolio regime column); (2) §11.4-caveat: closeBand uses price-coord `sNorm0` not sNorm mode — lensed call must not mix coords (recommend sNorm mode for lens, gLoc is |u|-symmetric so invariant; gate 5 catches a slip). **L4 PRESERVED** — lens never inverted to size dy; pool stays plain v24 tradeUpdate; lens changes the VALUE that sizes the cash leg, not the MECHANISM. **NO Lean obligation ready** (markLensed_open=markLensed_settle is algebraic same-fn equality not a theorem; solvency ∈[0,1] + smooth-paste continuity candidates only post-build-freeze, same as §9). Nothing submitted/built/edited/git. **Skeptic R6-gates §11 before intern builds.** Manager re-derives + skeptic before operator.

---

_Earlier: 2026-06-11, V24+POLAR-LENS BUILD SPEC — skeptic blockers closed (entry-95 mandate; READ-ONLY; spec-only; no submit/edit/git/build)._

### V24+POLAR-LENS BUILD SPEC — closed the 2 skeptic FLAG-HALT blockers + completed the spec — 2026-06-11 (entry-95 mandate; operator ASLEEP; READ-ONLY; HEAD untouched 928cde1c; NO edit/git/build/submit)
NEW buildable spec: `specs/SPEC_v24_lens_BUILD_2026-06-11.md` (supersedes C.9 scope for build). Base = `temporal_mvp_v24_rebase_fixed_2.html`.
Scripts `/tmp/blocker1_carry.js`, `/tmp/blocker1b.js`, `/tmp/blocker1c.js`, `/tmp/blocker2_funding.js`, `/tmp/inv_checks.js`, `/tmp/coord_robust.js` (node float64; v24 fns transcribed from base build).
**BLOCKER 1 (carry #4 / lens origin) — RESOLVED, mechanical (NO operator decision forced):** lens moneyness origin = the **LIVE MODE in the consuming layer's own coordinate**, NOT ln(marginal). v24 mark surface peaks at ray `theta=sNorm=getSNorm=(1−w)/w`; strikes registered in that same theta coord ⇒ lens centres on `mode_sNorm`, `u(K)=ln(theta_K/mode_sNorm)`. Carry P=y/x and marginal mp=γ·P differ by EXACTLY ln γ (float64: 0/0.405/0.969/1.735 nats at w=.5/.6/.725/.85 = ln γ exact). **The ln-γ trap closes two ways:** (1) g_loc=γ·h′(|u|) is `|u|`-SYMMETRIC ⇒ coordinate-INVARIANT (price vs reciprocal give identical exponent, verified); (2) build rule: never mix ln(marginal) with sNorm-strikes. u(mode strike)=0 confirmed. Strike-reg #8 consistent; side-of-mode `|·|` branch handles trade-moved-mode crossings.
**BLOCKER 2 (funding #9) — RESOLVED on the v24 BASE (NOT HEAD):** v24 funding hardcoded `γ=±2` (base L2086), `mark` NOT lens-aware. SWAP: ±2 → ±g_loc(K) (γ LIVE = w/(1−w); note arbToOracle re-equilibrates w); make consumed mark lens-aware (shared helper w/ P1/P3); S/(S−1)/S/κ/sign UNCHANGED. Behavior (float64): f→0 at ATM (g_loc→0), →γ_live in wings; sign preserved. Accepted entry 93 #5. Three call sites (mark/funding/settlement) consume ONE shared g_loc + lens-aware mark — not isolated.
**COMPLETED (skeptic R6 fixes):** inventory table for EVERY touched item (#4/#5/#8/#9/#11/#13 + pool/lens/settlement, no silent omissions); #5 rebase COMMUTES (w/sNorm/γ invariant under rebase, translation-covariant, float64); #11 dollar-pipe inherited v24; #13 solvency = v24 reserve bound + flat-top g≥0 finite value law. R3 control row: steepness=derived-w (v24, NO slider, moves on trade), kurtosis=τ (the ONLY new control, static). L4 STRENGTHENED to hard ban on lensed-slope-as-INPUT (no "warp until viewed slope hits X"; arbToOracle targets marginal/mode, lens-free). STAGED: Stage1=read layer (L1-4/P1-3) + own gate + smoke-pass; Stage2=warp/observable + gate + smoke-pass; each acceptance defined.
**VERDICT: INTERN-READY** (gated on skeptic R6 re-gate of THIS spec before intern dispatch). No operator-tier decision triggered by either blocker (BLOCKER 1 does NOT change settlement semantics — coordinate-invariance keeps mode/marginal/carry out of the priced exponent). Operator-tier flags (g<1 exercise meaning, ATM-funding→0, τ calibration) all already accepted entry 93 #5, relay-for-record only. NO Lean obligation ready (candidates g_loc(|u|)+g_loc′>0 + smooth-paste continuity post-build-freeze). Nothing submitted/built/edited/git.

---

_Earlier: 2026-06-11, V24+POLAR-LENS CORRECTED RE-RUN (entries 88/91/93; READ-ONLY; notes-only; no submit/edit/git/build)._

### V24 + POLAR-LENS — CORRECTED RE-RUN (prior pass was a GROSS TRUNCATION, operator entry 91) — 2026-06-11 (entries 88/91/93 verbatim; READ-ONLY; HEAD untouched 928cde1c; NO edit/git/build/submit)
CORRECTION section appended to `notes/research/V24_LENS_derivation_2026-06-11.md` (after the prior body).
Scripts `/tmp/lensX_{setup,1_goalseek,1b_feedback,2_strikedep,3_cap,4_wellposed,5_settle,6_onetx}.js`
(node float64; v24 tradeUpdate + lens primitives transcribed). Base = `temporal_mvp_v24_rebase_fixed_2.html`.
**WHAT THE PRIOR PASS GOT WRONG:** it called the architecture STRIKE-BLIND (warp strike-invariant per
unit cash) and treated the lens as a divorced pricing overlay. Operator (91 verbatim): "the same curve
warp goal seek works but as seen through the lens... you'd goal seek as per what you'd see there... gross
truncation." The object SEEN/goal-sought is the LENSED curve-2; a trade reshapes it STRIKE-DEPENDENTLY.
**CORRECTED VERDICTS (all 7 items work / works-with-bound):**
- (1) Pool update = plain v24, LENS-FREE (reads only dy; τ-independent, byte-identical for τ∈{.05,.3,1,5}).
  w=α/x MOVES on trade (entry 16 faithful). Goal-seek = "mode tracks marginal; lensed slope G(u)=γ·h′(|u−u_mode|)
  re-reads at u_post=u_pre−d, d=ln(mp′/mp)." Lens touches pool ONLY via fixed-notional dy=N·m_lens(K)·mp0.
- (2) **STRIKE-DEPENDENT (observable) — the corrected headline.** Same cash ⇒ one mode shift d (blind
  input), but lensed reshape dG(K)=γ[h′(|u_pre−d|)−h′(|u_pre|)] varies strongly: +1.72 at ATM → −0.029 at
  4× for +10% trade. LARGEST near mode, decays into wings (OPPOSITE of (W) which grew+diverged in wings).
- (3) **CAP-FREE = operator RIGHT, verified incl. through the lensed goal-seek.** Hard bound |dG|≤γ
  (h′∈[0,1]). NO w(u)⇒NO 1/w′ channel (the old ~1.4× (W) cap driver is gone). Lens 1/h″ DOES blow up in
  wings (3.6e6@u=8) BUT only matters for an INVERSE-lens solve, which the architecture does NOT do (reads
  slope forward, sizes trade by cash dy). SMALLEST COUNTEREXAMPLE flagged: a naive build that inverts the
  lens to hit a target wing-slope WOULD re-introduce a blow-up+cap — build must avoid.
- (4) WELL-POSED: round-trip 0.0, path-indep 0.0, single-valued (α/β flow invariants + deterministic
  readout). CAVEAT: observable lensed-slope-vs-dy is NON-MONOTONE (1 fold at mode-crossing) — read FORWARD
  only, never invert (= the C.3 hazard + put/call side-of-mode).
- (5) SETTLEMENT works-with-bound: closed-form S*=K·g_loc/(g_loc+1) per strike; v26b smooth-paste ports
  EXACTLY (value+slope to machine zero) even g_loc<1; flat-top band |lnK|<τ/√(γ²−1)=±13.1%@τ=.3 American-
  reading degenerates (operator-tier, ACCEPTED entry 93 #5).
- (6) ONE-TX EXECUTION survives (same-wing spread = one net plain-v24 tx, path-indep 0.0); closed-form
  PRICING shortcut DROPPED (entry 93 #4 "one tx execution is all"); premium leg-by-leg through lens.
- (7) BOTH v24 gaps resolved: (i) ATM-jump → v26b smooth-paste with g_loc; (ii) local-warp/anchoring →
  lens makes observable warp APPEAR + STRIKE-DEPENDENT (no w(u) field, no cap).
**OPERATOR RELAXATIONS (entry 93) VERIFIED:** #2 no cap HOLDS; #3 w>½ clamp GONE (just x/y/w move); #4
closed-form spread pricing dropped; #5 funding→0 ATM + flat-top semantics accepted.
**BUILD SCOPE delivered (C.9, ready for operator GO entry 93 #6):** Pool unchanged v24 (drop w-clamp);
Lens query-layer only [L1 side-of-mode |·| branch MANDATORY; L2 static τ no-arb-unbounded; L3 draw curve-2
through lens; L4 forward-read only never invert]; Pricing/funding/settlement lensed reads [P1 leg-by-leg
no composite; P2 funding γ→g_loc; P3 v26b smooth-paste g_loc]; gap-fixes G-i (P3) + G-ii (L3).
**OPERATOR-TIER FLAGS (via manager):** flat-top g_loc<1 American reading; ATM funding→0 behavioural change;
τ calibration (flat-top width). **NO Lean obligation ready** (lens=static readout; 1/4/6 inherit v24 α/β
path-indep; candidates g_loc(|u|)+g_loc′>0 + smooth-paste continuity pin only post-build-freeze). Nothing
submitted/built/edited/git. Manager re-derives + SKEPTIC before operator GO.

---

### V24 + POLAR-LENS ARCHITECTURE — 6-item derivation (operator entries 80–88; READ-ONLY; HEAD untouched 928cde1c; NO edit/git/build/submit) — 2026-06-11 [SUPERSEDED by the CORRECTED RE-RUN above — this prior pass mislabelled the observable as strike-blind]
Note: `notes/research/V24_LENS_derivation_2026-06-11.md`. Scripts `/tmp/lens_{a,a2,a3,b,b2,c,c2,c3,def,e2}.js`
(node float64; v24 tradeUpdate + v26b smooth-paste mark transcribed). Spec derived-WITHIN (not redesigned):
`specs/SPEC_v24_lens_architecture_HANDOFF_2026-06-11.md`. OBJECT: plain Balancer pool (scalar w, γ=w/(1−w),
v24 α/β trade) + a STATIC polar LENS in the QUERY layer only: `h_τ(u)=√(τ²+u²)−τ`, surface decay exponent
`G(u)=γ·h′_τ(u)` (0 at mode→γ wings). Lens NEVER touches the pool update. Structurally ≠ (W) (which put the
√-kernel INSIDE w(u)) — THAT is why the divergence dies.
**(a) WORKS — THE key result: far-OTM divergence ABSENT.** No w(u) ⇒ NO 1/w′ channel (the old ~1.4×-cap
driver). Lens Jacobian dG/du=γ·h″=γτ²/(τ²+u²)^1.5 BOUNDED (max γ/τ at mode, →0 wings) — opposite shape to
1/w′→∞. Goal-seek (entry 88) = "lens MODE tracks live marginal," a deterministic READOUT (no root-find, no
field scalar) ⇒ single-valued/well-posed ∀strike, path-indep + round-trip EXACT (float64 0.0, inherits α/β).
NO warp cap needed (vs (W)'s hard |Δφ|≤τ wall). CONSTRUCTION REQ: price G=γ·h′(|u−u_mode|) side-of-mode
branch (else trade-shifted mode flips sign at strikes it crosses; = v24 markFrac shape already).
**(b) WORKS-WITH-BOUND.** Closed-form S*=K·g_loc/(g_loc+1) PER STRIKE (g_loc=γ·h′(|u_K|) constant per
strike); ATM-jump smooth-paste ports EXACTLY (value+slope continuous to machine zero), stays real/finite
even g_loc<1. BOUND: flat-top band |ln K|<τ/√(γ²−1) (τ=0.3,γ=2.64 ⇒ ±13.1%) where g_loc<1 ⇒ American-
exercise reading of S* degenerates (analytic value law still evaluates). = settlement-semantics call,
OPERATOR-TIER (entry-85 "ATM-jump at feature level").
**(c) WORKS — τ NOT bounded by no-arb.** Butterfly(convex-in-K) + strike-monotone hold ∀τ (0.05–3); spot-
monotone holds ∀τ GIVEN |u−u_mode| branch (guard g_loc(|u|)+g_loc′(|u|)>0 always; SIGNED-lens would fail
τ≳0.01 but architecture uses |·|); asymptotes preserved unconditionally. τ bounded by FLAT-TOP WIDTH
(calibration/vol-set), not arbitrage.
**(d) WORKS.** Funding = HEAD formula γ→g_loc(u_K); SIGN unchanged; SCALE→0 at ATM (flat top, no slope-
deviation), →γ wings; no divergence. FLAG: ATM funding ~0 is expected behavioural change vs constant-γ HEAD.
**(e) BROKEN (closed form) / works-with-bound (concept) — THE HARDEST OBSTRUCTION.** θ*=√(θ₁θ₂),2sinh(δ)
PRICING shortcut was exact ONLY under common OTM exponent; per-leg g_loc(u_i) breaks it (rel.err 63%/29%/10%
near→deep; near flat top NO valid θ* — 2sinh form can't represent). One-tx EXECUTION survives (single
strike-free pool warp); CLOSED-FORM PRICING does not — spread priced leg-by-leg through lens. Recovers deep
wing (common γ). PARTIALLY honours entry-85 "keep VS shortcut": execution yes, closed-form pricing no.
**(f) WORKS.** Slippage strike-INVARIANT per unit cash (no strike channel on plain Balancer): same-premium
⇒ identical warp; same-notional ⇒ warp shrinks OTM via lensed mark. Clean value/slippage separation.
**OPERATOR-TIER FLAGS (via manager):** (b) flat-top settlement semantics (g_loc<1: shallow-power vs
European clamp); (d) ATM funding→0 acceptable?; (e) is closed-form VS pricing a HARD requirement (if so, lens
spec needs rework — live tension w/ entry 85); τ calibration (flat-top width). **NO Lean obligation ready to
pin** (lens = static algebraic readout; (a)/(f) inherit v24 α/β path-indep already; candidate lemmas
g_loc(|u|)+g_loc′>0 + smooth-paste continuity worth pinning only AFTER operator rules (b)/(e)). Nothing
submitted/built/edited/git. Manager re-derives + SKEPTIC before operator.

---

_Earlier: 2026-06-11, ENTRY-59 flatten/steepen + warp-visibility run (READ-ONLY; notes-only; no submit/edit/git/build)._

### ENTRY-59 RUN — "w varies with strike: does it work?" vs the VISIBLE bar — 2026-06-11 (operator entry 59; READ-ONLY; HEAD untouched md5 928cde1c pre+post; NO edit/git/build/submit)
Note: `notes/research/ENTRY59_flatten_steepen_and_warp_visibility_2026-06-11.md`. Scripts
`/tmp/run59{,b,c,d,e}.js` (node float64, LIVE engine sandboxed; curveTraceW math transcribed).
**Bar:** (1) knob VISIBLY flattens/steepens drawn curve; (2) trade VISIBLY warps curve.
**METHOD (load-bearing):** honest metric = PERPENDICULAR polyline separation in px (Hausdorff,
pt-to-seg, frame-clipped); axis-aligned px overstates ~10× on steep sections (τ-click 11.9px axis
vs 0.92px perp — reconciles manager's 0.56–0.59%-invisible + my 167.6px axis ≈ their 153px sweep).
Default frame x∈[0,30], y∈[0,910345]; plot 618×398px; 1% width=6.18px; px/BTC=20.6.
**(A) BAR-1 = YES — THE knob is the WING PAIR (w₋,w₊), NOT τ:** per click 1.8–2.6px (+frame-jump
0.3–1.8% — setWingWeights/setTau NULL __curveFrame, axes re-freeze); 3–5 clicks 5–13px visible;
full travel 15–90px. Clean inside locks (wings exact power-laws ANY w±, γ>1 clamp; moving asymptote
exponents IS what steepening means). **τ-click px = 3.6·Δw px [numeric law]** ⇒ ≤1.6px everywhere
locks allow (per-click-visible τ needs Δw≈0.8 — IMPOSSIBLE inside γ>1+UI locks; flag, not decided).
τ full-sweep 0.05→3 = 24.6–41.5px (cumulative only).
**(B) BAR-2 = YES mechanism / NO ui-path:** one-sided cash ≥~$90–100k (12% of $800k pool) ⇒
10.7–11.9px VISIBLE (sell −$90k defaults 11.9px; buy +$100k at WIDE Δw=0.55/0.92 10.7px; buy-side
non-monotone at defaults: +100k→5.6px, +200k→3.0px u′/z cancellation; near-cap kink 50+px). UI has
NO one-sided path: same-wing spread bands net-cancel (0.27px@$800k notional); COLLARS COMPOUND
(both legs same swap direction, ~2×premium — "warp-neutral bands" refined) 6.2px@$2.4M; arb path
NEVER warps (φ fixed). **PATH-A PROJECTION (validated byte-exact vs reposed-spec gate pool): NOT
the visibility ingredient** — default pool sits AT elbow center, dlnp/du=3.09 compresses strikes ⇒
G=1.016/1.087/1.206 at K=1.1/1.25/1.4× (vs gate pool 1.27–4.49); in-cap A perpPx ≈ legacy or
LOWER (gearing offsets u′ drift); A beats legacy only CAP-EXCEEDED (K=2.3×, 11.4px). A = strike-
dependence/paper-faithfulness, not visibility.
**(C) VERDICT relayed:** (1) existing machinery meets BOTH bars — recipe: wing-pair clicks for
flatten/steepen; one-sided ≥$90–100k trade (wide-Δw helps) for warp. (2) MISSING = a one-sided
trade UI path (the bar-2 blocker; build-tier) + default-Δw calibration call (operator). (3) CANNOT
inside locks: per-click-visible τ; v24-magnitude global warp (structural, unchanged).
**HONEST CARRY:** projection-only; (α,β)-flow + warp∘rebase + φ-anchor/funding stay
[needs-Aristotle]/OPEN; nothing submitted/built/edited/git; tester live pass = pixel confirmation
layer. Manager re-derives + skeptic before operator.

---

### GLOBAL-SKEW GOAL-SEEK — does "local-slope goal-seek via one global skew σ" beat the weight? — 2026-06-11 (operator entry 55/56 "go"; READ-ONLY; HEAD untouched 928cde1c; NO edit/git/build/submit)
Note: `notes/research/GLOBAL_SKEW_goalseek_2026-06-11.md`. Script `/tmp/skew55.py` (python float64+scipy).
Follow-up to POLAR_density note + skeptic verdict #23 (`VERDICT_POLAR_density_2026-06-11.md`: weight-free
⟺ B-anchoring; skeptic "attacked for a weight-free A-compatible map and could NOT find one"). Operator (55
verbatim): "(1) map PRESERVES THE ASYMPTOTES not bounded/saturates; (2) you can still local-slope-goal-seek
using global skew as a knob right thats the point; (3) monotone important."
**OBJECT (asymptote-preserving, operator pt-1):** `γ_loc(u;σ)=γ₋+(γ₊−γ₋)·S(κ(u−σ))`, S=√-kernel sigmoid;
σ=single global scalar = elbow-center SHIFT. Wings frozen ANY σ (float64: γ_loc(±40)→γ±). **LOAD-BEARING
IDENTITY (resid 0.0): the only asymptote-preserving single global scalar is a SHIFT, and `γ_loc(u;σ)≡
γ_loc(u−σ;0)` = EXACTLY the (W) field-center φ. "global skew σ" ≡ "local-φ recenter" = ONE translation
DOF. NOT a third mechanism — it IS path-A's φ renamed.**
**Q1 STRIKE-DEP = YES but split.** Pure global σ-shift at fixed premium warps the ELBOW (Δln p peaks ATM
−0.084, decays to ±wings −0.002 to −0.008) — "more warp at elbow," NOT the path-A "more warp OTM." The
OTM-growing strike-dep reappears ONLY as path A (reflect-branch σ₁≈2·u_tp, geared by 1/γ_loc′), because σ=φ.
**Q2 WEIGHT-FREE THROUGH TRADE = NO, IMPOSSIBLE (the crux).** Goal-seek "restore pre-trade slope at moved
point" ⇒ `σ₁=u_R1−u_R0` = cumulative DISPLACEMENT (resid 0.0), = memoryless read u_R1 ONLY at ATM start
(u_R0=0); away from ATM they disagree by u_R0 and memoryless read FAILS to restore slope (resid 0.05–0.24).
**Impossibility (map-indep):** target = PRE-trade slope = fn of pre-trade state; memoryless σ=F(x,y) carries
NO pre-state info ⇒ σ must store history = independent DOF = (W) φ = the weight in disguise. Upgrades
skeptic's "could not find" → STRUCTURAL IMPOSSIBILITY. Amplitude-skew steelman: same verdict (more restricted).
**Q3 MONOTONE = PASS, not binding.** Up-skew (γ₊>γ₋>1): σ-shift translates a monotone profile, `d ln p/du
=1+γ_loc′/γ_loc≥1>0` (min 1.0000 over σ∈[−10,10]). General guard `γ_loc+γ_loc′>0` bites only under forced
DOWN-skew (translation can't produce). **Q4 DIVERGENCE = SAME (σ≡φ).** Gearing 1/γ_loc′~u³→∞ identical to
local-φ; ~1.4× strike cap (entry-40, K_max≈1.4mp0 from |Δφ|≤τ) RETURNS unchanged. Global-vs-local cosmetic.
**Q5 NET = COLLAPSES TO A** (strike-aware+monotone, needs stored scalar), NOT a third option, NOT B.
**HARDEST OBSTRUCTION (flag to operator):** memoryless reserve→σ map CANNOT restore a pre-trade slope
target (target lives in pre-state). Weight-elimination still ⟺ B-anchoring; the goal-seek-to-a-prior-slope
mechanic the operator describes IS path A and necessarily carries the stored φ/σ. A-vs-B = operator-tier.
**HONEST CARRY:** decision-support, NOT build-auth/curve-swap. NO Lean lemma ready (σ≡φ identity +
γ_loc+γ_loc′>0 are candidates only post-mechanic-pick; both covered by open (W) (α,β)-flow [needs-Aristotle]
+ warp∘rebase/φ-funding OPEN). Self-adversarial: answered the MECHANIC question head-on, no elegant-theorem
elevation. Nothing submitted/built/edited/git. Manager re-derives + skeptic before operator.

---

_Earlier: 2026-06-11, POLAR weight-free density first-principles (entry 53/54; READ-ONLY; notes-only; no submit/edit/git/build)._

### POLAR WEIGHT-FREE LIQUIDITY-DEPTH DISTRIBUTION — first-principles — 2026-06-11 (operator entry 53/54 "do the needful"; READ-ONLY; HEAD untouched md5 928cde1c; NO edit/git/build/submit)
Note: `notes/research/POLAR_density_first_principles_2026-06-11.md`. Scripts `/tmp/polar53{,b,c,d}.py`
(python float64 + sympy; numpy2 `trapz`→`trapezoid`). Operator (53 verbatim): "think from first principles
as a liquidity (relative radius) distribution native to polar ray coords with natural skew+kurtosis knobs,
natural map from x,y to the skew knob (maybe dont even need weights)."
**OBJECT:** primitive = local-exponent/depth field `γ_loc(u)` on log-price ray `u=ln(y/x)=ln tan θ`
(θ=45°⟺ATM⟺u=0); curve `ln F=∫γ_loc du`; price `p(u)=γ_loc(u)·e^u`; numeraire = depth-per-log-price
(carry-gauge covariant). Family: `γ_loc=γ₋+(γ₊−γ₋)·½(1+tanh κu)+skew·tanh κu/cosh²κu`.
**(a) WELL-POSED = YES.** **(b) KURTOSIS⊥SKEW = YES — the headline win (W) CANNOT do:** even part of ln g
= κ (peak `d²ln g/du²∝−κ`), odd = skew, L2-orthogonal (`<even,odd>`~5e-12 machine-zero); wings frozen at
corners γ₋,γ₊ (κ/skew-invariant, float64-exact); **kurtosis-at-zero-skew WORKS** (symmetric γ₋=γ₊+skew=0
still tunes peak −1.25→−12.5 over κ), whereas (W) welds τ to Δw (w′(0)=Δw/2τ ⇒ Δw=0⇒τ inert,
manager-verified). **(c) WEIGHT-FREE = CONDITIONAL — the crux:** dynamic skew = `u_R=ln(y/x)` read off
reserves, NO stored scalar — but weight-free ONLY under SPOT/reserves anchoring (entry-38 "B"); under
TRADE-POINT anchoring (path A, operator's CHOSEN build mechanic) the reseat scalar (W's `z=t·τ/√(1−t²)`,
=stored φ≠u_R) REAPPEARS = the weight in disguise. **(d) ARB-SANE = YES w/ explicit guard:** monotone
⟺ `γ_loc+γ_loc′>0` (κ-robust to κ=20; skew-bounded — κ=8,skew=1.5 breaks it); invariant CLOSED-FORM but
**TRANSCENDENTAL** (base→log-cosh/softplus, skew→sech² both elementary via sympy; NOT the √-kernel's
ALGEBRAIC `√(τ²+u²)`) ⇒ forfeits entry-41 integrability tiebreak; inversion = bisection (engine already
does). **TRADE conserves** shape (γ±,κ — central moments translate-invariant) + curve level F=k; dynamic
d.o.f.=u_R (density-frame analogue of (W)'s α=xw,β=y(1−w)); well-posed ODE `dx=−dy/p` path-indep (converges
with N). **(Q4) polar family PROPERLY CONTAINS (W)** (=√-kernel-shoulder member); 3 irreducible shape DOF
{γ₋,γ₊,κ}=level/skew/kurtosis (manager's count CONFIRMED, can't be beaten) — win is DECOUPLING not count.
**(Q5) bounded θ∈(0,π/2) but u FULL ray** (u=ln tan θ); g>0⇒deep-strike DEPTH floor (depth≠premium;
value~S^−γ₊→0 INTACT — defensible settlement reading, operator-tier). Carry/rebase/funding/warp∘rebase
OPEN here as for (W) (frame doesn't fix, doesn't worsen); ITM smooth-pasting + dollar pipe transfer clean.
**HARDEST OBSTRUCTION (flag to operator):** weight-elimination ⟺ B-anchoring, which CONTRADICTS the
already-chosen path-A warp mechanic — an A-vs-B / weights-or-no-weights RE-FORK, operator-tier. **HONEST
CARRY:** decision-support, NOT build-auth/curve-swap. NO Lean lemma crystallised ready to submit (γ_loc+
γ_loc′>0 monotonicity + recenter path-indep are CANDIDATE obligations only AFTER operator picks mechanic —
premature to pin). Nothing submitted/built/edited/git. Manager re-derives + skeptic before operator.

---

_Earlier: 2026-06-11, FMI hyperbolic-alts + shoulder-localization (entry 42; READ-ONLY/FMI; notes-only; no submit/edit/git/build)._

### FMI — HYPERBOLIC ALTERNATIVES (Q1) + SHOULDER LOCALIZATION GOVERNOR (Q2) — 2026-06-11 (operator entry 42; READ-ONLY/FMI "not trying to change anything"; NO edit/git/build/submit; operator live-playing HEAD 1eebfcd6, build path A PAUSED)
Note: `notes/research/FMI_hyperbolic_alts_and_shoulder_localisation_2026-06-11.md`. Script `/tmp/fmi42.py`
(python float64+scipy; companions `/tmp/shoulder.py`, `/tmp/naturalness{,2}.py`). Builds on NATURALNESS (entry 41).
**Q1 — hyperbolic alternatives split THREE classes:** (i) RE-COORDINATIZATIONS of OUR curve — cosh/`tanh η`
IS our √-kernel (`max|s_sqrt(u/τ)−tanh η|=1.1e-16`, η=asinh(u/τ)); a chart, NOT an alternative. (ii) genuinely
DIFFERENT 1-knob curves in the SAME w(u) family: tanh-IN-u (≠tanh-in-η; sharp exp shoulder), Gudermannian
gd(η) (sharp), erf (sharpest super-exp), algebraic u/(τ+|u|) (widest, but wing not crisply frozen). (iii)
GH-in-latent-SCORE `√(δ²+v²)` (demoted v25→v26c) = DIFFERENT OBJECT, **4 shape params** (λ/α/β/δ), no scalar
w handle ⇒ why warp failed. Higher-order `cosh^n`/`s_p=u/(τ²+u²)^p`/q-deformed = the 2-KNOB family ours lives
in (p=½ is ours). √-kernel singled out (entry-41 carry): UNIQUE 1-knob with closed-form ALGEBRAIC invariant.
**Q2 — shoulder localization GOVERNOR = kernel's asymptotic approach rate to the wing [analytic+numeric].**
QUANTIFIED measure: decade width W10=x(gap=0.01)−x(gap=0.1) in τ-units (gap g=1−s): erf 0.74 < tanh 1.17 <
Gudermannian 1.47 < **√-kernel 4.95** < algebraic 90. √-kernel approach POLYNOMIAL (g~1/2x², w′~x⁻³) = WIDE/
soft shoulder; tanh exp `e⁻²ᵘ` = SHARP; erf super-exp = sharpest. **In OUR map localization is NOT a separate
DOF**: τ rescales x→u/τ ⇒ W10 in τ-units is τ-INVARIANT (4.95 at τ=0.1/0.3/1.0) ⇒ τ tunes elbow width AND
shoulder localization TOGETHER, fixed-by-kernel otherwise. The would-be extra DOF = the KERNEL EXPONENT p
(cosh^n family). **Divergence link CONFIRMED**: sharper shoulder ⟺ faster w′→0 ⟺ worse 1/w′ gearing (G@12τ:
erf 1.3e49 > tanh 6.6e9 > gd 7.7e7 > √-kernel 1.7e3 > alg 1.7e2) — √-kernel's soft shoulder IS the gentlest
among crisp-frozen-wing maps (entry-41 confirmed). **p-sweep pins the extra DOF: TWO-SIDED PINNED** — going
SHARPER blocked by MONOTONICITY (s_p non-monotone for p>½, turns over at u/τ=1/√(2p−1); √-kernel p=½ = sharpest
MONOTONE member of `(1+x²)^p`); going SOFTER (p<½ / q-deformed) costs the ALGEBRAIC invariant (elementary only
at p=½ where amplitude=τcosh η, polar lens closes). So a tunable shoulder-sharpness DOF EXISTS = the operator's
"DOF for pricing" instinct, but in (W) it's SPENT/PINNED by monotonicity + algebraic-invariant contracts.
**HONEST CARRY:** FMI/understanding only, NOT a curve-change proposal, NO build auth. Extra-DOF = operator-tier
(flagged, not decided). (α,β)-flow [needs-Aristotle]/OPEN; warp∘rebase + φ-funding OPEN. Nothing submitted/
built/edited/git. Manager re-derives + routes through SKEPTIC before relaying to operator.

---

_Earlier: 2026-06-11, NATURALNESS of polar/√-kernel kurtosis map (entry 41; READ-ONLY; notes-only; no submit/edit/git/build)._

### NATURALNESS of the polar/√-kernel kurtosis map — 2026-06-11 (operator entry 41; READ-ONLY; NO edit/git/build/submit; operator live-playing HEAD 1eebfcd6, build path = A PAUSED)
Note: `notes/research/NATURALNESS_polar_kurtosis_map_2026-06-11.md`. Scripts `/tmp/naturalness{,2,3b}.py`
(python float64 + scipy). **Q (entry 41 verbatim):** is the (W) `w(u)=w_mid+(Δw/2)·u/√(τ²+u²)` (√-kernel),
read in the polar/hyperbolic-angle cosh lens, the MOST NATURAL kurtosis map (frozen wings + rounded
shoulder + one knob τ), or one of many? trig must EARN its place.
**(i) MOST-NATURAL VERDICT: √-kernel = natural ALGEBRAIC PRIMITIVE; cosh = its COORDINATE, not a 2nd object.**
Singled out by a CONCRETE non-aesthetic tiebreak: it is the ONLY candidate with a closed-form ALGEBRAIC
curve invariant — ∫(u/√(τ²+u²))du=√(τ²+u²) ELEMENTARY [num match 0.0]; tanh→τ·ln cosh TRANSCENDENTAL
(2.2e-16); erf→u·erf+gaussian NON-ELEMENTARY (2.2e-16). Polar lens UNIQUELY forces cosh GIVEN the lens
(cosh η = unique hyperbolic radius →|u| on wings; τcosh η≡√(τ²+u²) resid 4.4e-16; √-kernel-in-u ≡ tanh-in-η
resid 0.0) — but the lens is well-MOTIVATED (log-price rapidity), not logically forced over tanh-in-u etc.
Canonical as primitive, one-of-a-family as shoulder, tiebreak = integrability. TRIG FLAG SATISFIED, lens
ONLY (no new content; if trig vanished √-kernel stands alone). Confirms+sharpens the CURVE_FAMILY-derivation
ruling. Max-ent/info-geom does NOT rescue canonicity (shoulder under-determined; Gudermannian d-law already
FAILED).
**(ii) DIVERGENCE = INTRINSIC to ANY frozen-power-law-wing map [analytic]** — frozen⟺w→const⟺w′→0⟺gearing
1/w′→∞ necessarily; only the RATE varies. √-kernel w′~u⁻³ (power) is ALREADY the LEAST-divergent map that
keeps crisp frozen wings (tanh ~e⁻²ᵘ, erf ~e⁻ᵘ² are FAR worse: G@8τ = √-kernel 524 vs tanh 2.2e6 vs erf
6.8e21). ONLY softer option = algebraic u/(τ+|u|) (w′~u⁻², G 3.7× softer @5τ, 10× @12τ) BUT: still diverges
(poly), erodes wing-exactness (resid 1e-3 vs 5e-6 @30τ), AND loses the algebraic invariant ⇒ net DOWNGRADE
for A. **NO map removes the (g.4) cap; cap is map-INDEPENDENT, correct resolution.** √-kernel sits at the
sweet spot: least-divergent map honoring all 3 contracts (frozen wing + algebraic invariant + γ>1).
**HONEST CARRY (unchanged):** theory/naturalness only, NO build auth. (α,β)-flow lemma [needs-Aristotle]/OPEN
numeric-only; warp∘rebase + φ-funding OPEN. Curve/shoulder-shape choice = operator-tier (flagged, not
decided). Nothing submitted/built/edited/git. Manager re-derives + routes naturalness claim through SKEPTIC
before relaying to operator.

---

_Earlier: 2026-06-11, WARP-divergence reconcile + safe-strike cap (entry 40; READ-ONLY; notes-only; no submit/edit/git/build)._

### WARP-DIVERGENCE RECONCILE + SAFE-STRIKE CAP (g.4) — 2026-06-11 (operator entry 40; READ-ONLY; NO edit/git/build/submit; operator live-playing HEAD 1eebfcd6, build path = A)
Note: `notes/research/WARP_divergence_reconcile_and_cap_2026-06-11.md`. Script `/tmp/warp_cap.js`
(node float64; (W) fns byte-mirror /tmp/repose3.js). Gate pool {10,12,0.3,[0.52,0.72],0}, mp0=2.457812.
**OPERATOR (40 verbatim):** "if you trade at a point far out where slope is tending to infinity... its
going to goal seek another slope close to infinity so its not a huge warp imo you're probably missing something obvious."
**VERDICT = OPERATOR HALF-RIGHT; manager reconciliation CONFIRMED + SHARPENED.**
**(i) Operator RIGHT at trade-point + in-range; WRONG observably/out-of-range.** reshape AT the trade ray
DECREASES going OTM (6.2e-2→5.3e-3 dust; TEST 1) — slope change demanded far out IS tiny, operator's
geometry exact there. BUT 1/w′ flat-wing leverage routes warp into the ATM ELBOW + OPPOSITE WING: dust at
K=2mp0 reshapes ATM 45%, spot price 22% (TESTS 1/2/3). NOT a coordinate artifact — saturates to the
FROZEN WING (predicted mp@reserves 3.085714 == numeric 3.086047 at K=8, φ′=−36.8; TEST 8). "Missing
something obvious" = single-φ leverage moves the warp AWAY from the trade point INTO the elbow.
**(ii) (g.4) CAP — RECOMMEND K_max≈1.4·mp0 (|Δφ|≤τ; spot reshape ≲14%, elbow stays put); outer limit
≈1.7·mp0 (|Δφ|≤1).** dy-ROBUST (<2% over 100× dy — strike channel G governs, not notional). Confirms
manager's 1.35/1.70. Closed form: u_tp,max=√((τ²+u_spot²)(τ/z0)^{2/3}−τ²), K_max=price(u_tp,max)/mp0 —
governed by ELBOW WIDTH τ, Δw-independent in dust limit (conservative vs numeric). G EXACT
=((τ²+u_tp²)/(τ²+u_spot²))^{3/2} (==num 4dp; TEST 5). Build guard = STRIKE clamp on z0·G>CAP, separate
from the TRADE wing-range guard (w*).
**(iii) DOF VERDICT: single-φ GENUINELY LACKS DOF to localize a far-out warp** (one handle=elbow center;
reshape@TP/reshape@ATM collapses 0.48→0.026; TEST 6) — **BUT adding DOF breaks frozen-wing/γ>1 contracts,
so BOUNDING THE STRIKE RANGE (the cap) is the CORRECT + SUFFICIENT resolution for A.** Divergence = a
domain-of-validity boundary, NOT a bug; far-out region (K=4–8mp0, mark≈0) is economically vacuous.
**HONEST CARRY (unchanged):** (α,β)-flow lemma [needs-Aristotle]/OPEN, numeric-faithful only — no proof
added. CAP value + whether to list beyond-cap strikes = operator/calibration call. Nothing submitted/
built/edited/git. Manager re-derives + relays.

---

_Earlier: 2026-06-11, BRAINSTORM B — per-notional (spot-equivalent) slippage (entry 39; BRAINSTORM/notes-only; no submit/edit/git/build)._

### BRAINSTORM B — slippage = same warp principle, same per unit notional as a SPOT trade — 2026-06-11 (operator entry 39; BRAINSTORM ONLY; NO edit/git/build/submit; operator live-playing HEAD 1eebfcd6)
Note: `notes/research/BRAINSTORM_B_per_notional_slippage_2026-06-11.md`. Builds on curiosity-B. Engine facts read straight off HEAD source (1eebfcd6); numeric warp tables back-stopped by /tmp/curiosityB_explore.js.
**OPERATOR (39 verbatim):** "my idea with B was that the slippage remains implemented by the same curve warp principle, and is the same per unit notional as for a spot trade. does that make sense?"
**VERDICT = YES, it makes sense** — coherent + well-defined + self-consistent on (W).
**PRECISE STATEMENT:** mechanism unchanged (curve-warp, same as A); magnitude strike-INVARIANT, = a spot trade's per notional. Strike enters ONLY the option VALUE (mark), never the execution slippage.
**ONE-LINE CONSTRUCTION:** feed cash leg `dy := N·oracle` (notional·spot, DROP the premium/mark factor) into the existing spot-anchored `tradeUpdate(state,dy)` ⇒ `|Δφ|=z0(N·oracle)`, strike-free, = the spot trade's warp (one swap primitive on (W), line 1723; strike never an arg).
**MANAGER'S PREMIUM-vs-NOTIONAL READ = CORRECT, source-verified [analytic]:** HEAD `legPrice` returns `V=N·mark` (L1811/1818); `executeLeg` sets `dy=V·oracle=N·mark·oracle` (L1847/1850) ⇒ live engine sizes warp by PREMIUM ⇒ slippage-per-notional SHRINKS OTM (mark↓). B drops mark ⇒ strike-invariant, spot-equivalent. "Spot trade's slippage per notional" well-defined + right ref: spot trade pushes dy=N·oracle (mark≡1) through the SAME tradeUpdate; B = identity dy_option=dy_spot=N·oracle.
**SUBTLETY:** "per unit notional"=strike-INVARIANCE not linearity (z0 convex in size, spot ref too — equality preserved).
**VALUE/SLIPPAGE SEPARATION = clean + recognizable:** value=mark(K,moneyness); slippage=z0(N) spot-equiv, moneyness-blind. = execution-by-size + separate-mark (linear-impact-AMM design). vs A=moneyness-geared (z0·G, G∝1/w′(u_tp), DIVERGES at frozen wing ~14000×). Both sound; different PRODUCTS.
**SELF-CONSISTENT on (W) = YES, all hold + B LESS divergent than A:** α/β cons (resid 0.0), frozen wings, static τ, γ>1, bounded (no wing blow-up — B's win), wing-guard HELD. ⚠ wing-guard rejects MORE under B (notional sizing dy=N·oracle ≥ premium N·mark·oracle since mark≤1 ⇒ hits w* band sooner ⇒ large-notional deep-OTM that clears today may REJECT — internally consistent, calibration-flag).
**GIVES UP (unchanged):** paper σ_B trade-point tangent (0.254 vs B's 1.460 @K=1.6mp0) ⇒ self-consistent but NOT paper's trade mechanic. B = spot-anchored (gearing already=live engine) + notional sizing (the CHANGE; live engine still premium-sizes). A & B differ from live engine in OPPOSITE directions.
**HONEST CARRY:** (α,β)-flow lemma [needs-Aristotle]/OPEN/numeric-0.0 for A AND B — not proven either. A vs B = operator product/curve call (operator pursuing A as build). Nothing built/submitted/edited/git. Manager re-derives + relays to operator.

---

_Earlier: 2026-06-11, CURIOSITY RUN B — warp∝notional inverse-design (entry 38; CURIOSITY/notes-only; no submit/edit/git/build)._

### CURIOSITY RUN B — what invariant yields warp ∝ notional (strike-INDEPENDENT)? — 2026-06-11 (operator entry 38; CURIOSITY ONLY; nothing to do with the build; NO edit/git/build/submit)
Note: `notes/research/CURIOSITY_B_warp_proportional_notional_2026-06-11.md`. Script `/tmp/curiosityB_explore.js`
(node float64; engine fns mirror live HEAD v27, copied from `/tmp/repose3.js`). Pool {10,12,0.3,[0.52,0.72],0},
mp0=2.457812. **CURIOSITY — NOT a build artifact/spec/authorization. Build stays path A (trade-point).**
**Q:** A's warp = z0(dy)·G(K), G=1/w′(u_tp) strike channel (entry-37: same-notional warp 14000× more OTM,
"warp∝notional FALSE"). What construction gives B = warp∝notional, strike-FREE?
**ANSWER (working backward, kill the G channel):** anchor the warp at the **SPOT/reserves point** not the
trade point ⇒ **G≡w′(u_spot)/w′(u_spot)=1 identically** ⇒ |Δφ|=z0(notional), strike-free `[analytic]`.
Numeric: B byte-identical across all strikes (0.195752 everywhere) vs A spread 19.5× same band. z0 strictly
monotone in notional, keeps wing-range guard (dy=2.5 REJECT). Cleanest size = dy:=N·oracle (drop premium/mark).
**HEADLINE SURPRISE (flag to operator):** **B = exactly what the LIVE engine ALREADY does** — tradeUpdate(state,dy)
warps at spot, strike never an arg (skeptic #16). B is the status-quo-ante; **A is the CHANGE the build is making.**
**ECON:** B = impact∝size (constant-product/linear-impact AMM, moneyness-blind, "a contract is a contract");
A = impact∝curve-location (paper σ_B, moneyness-geared, divergent at frozen wing). B reshapes by flow; A by flow×gearing.
**SELF-CONSISTENT with (W)? YES** — B keeps α/β cons, frozen wings, static τ, γ>1, wing-guard; exactly (α,β)-consistent
at reserves (residual 0.0). GIVES UP exactly one thing: the trade-point tangent σ_B (0.254 vs B's 1.460 @K=1.6mp0)
⇒ B self-consistent but NOT the paper's trade mechanic.
**FAMILY:** A↔B endpoints of **z=z0·G^λ, λ∈[0,1]** — λ = moneyness-gearing exponent (how much strike feeds impact).
λ=1 A (spread 19.5×), λ=0 B (1×), interior = tunable blend (no distinct econ object; softens A's wing divergence).
Same `[needs-Aristotle]`/OPEN (α,β)-flow lemma applies to both. Which mechanic = operator/curve call — but operator
ALREADY chose A; this only maps what B means. Nothing built/submitted/edited/git. Manager re-derives.

---

_Earlier: 2026-06-11, TRADE-POINT ANCHORING RE-POSED + operator invariant (entry 37; NOTES-ONLY; no submit/edit/git/build)._

### TRADE-POINT ANCHORING — RE-POSED (FAITHFUL) + INVARIANT VERDICT — 2026-06-11 (operator entries 31/36/37; NOTES-ONLY; NO edit/git/build/submit)
Spec: `notes/research/SPEC_tradepoint_anchoring_REPOSED_2026-06-11.md`. Scripts `/tmp/repose3.js`
(final form), `/tmp/repose.js`+`/tmp/repose2.js` (two REJECTED discretizations), `/tmp/inv3.js`
(operator invariant), `/tmp/gate.js` (corrected gate). All node float64, mirror live HEAD v27.
**WHY RE-POSE:** prior spec (`SPEC_tradepoint_anchoring_fix_2026-06-11.md`) was FLAG-WRONG (skeptic #18,
`VERDICT_tradepoint_anchoring_spec_2026-06-11.md`) — it set (α,β) AND moved y'=y_B+dy at the TRADE POINT
⇒ TELEPORTED the pool to the strike ray (dy=0.1 @K=1.6mp0 moved y 12→15.0, spot 2.46→4.01). Discarded
the live reserves point.
**THE FIX — SEPARATE THE TWO CHANNELS:** reserves move from the LIVE point (α,β,wStar,x',y' all read off
`s`; y'=s.y+dy) ⇒ pool FAITHFUL (NOT teleported); the warp AMOUNT (φ') reads the strike gearing at the
trade point. Construction: keep legacy reserves move + legacy EXACT reseat z0=t·τ/√(1−t²); scale the
reseat by **G = w′(u_spot)/w′(u_tp)** (genB 1/w′(u_tp) strike channel); **z=z0·G, φ'=u'−z.**
G==1 at tp=spot ⇒ **spot-reduction EXACT 0.0** (byte-identical, better than prior 1.67e-16 — it's an
algebraic identity, no bisection). Two naive discretizations REJECTED (first-order gearing |Δφ|=6.7e-2
at spot; integrated genB 4.0e-4 at spot) — only the curvature-RATIO form reduces exactly.
**(i) FAITHFUL = YES:** (x',y') IDENTICAL across all strikes at fixed dy (9.9598/12.10 = legacy);
only φ' warps by strike. Pool stays put; curve skews. mp0=2.457812 on gate pool {10,12,.3,.52,.72,0}.
**(ii) OPERATOR INVARIANT (entry 37, "same warp any strike same notional") = NO, decisively.** Warp is
NOT notional-only: **|Δφ| ≈ z0(dy)·G(K)**, strike channel G=1/w′(u_tp) DOMINATES. Same notional sell-call
(via real executeLeg): |Δφ| 1.9e-4 (ATM) → 2.66 (deep OTM), ~14000×; z0 flat (0.185→0.186), G runs
1.0→15.3. **Warp ∝ notional FALSE.** Reconciles "same premium ⇒ more warp OTM" (✅ z0 fixed, G grows).
Curve-reshape Δln(mp) metric agrees (4.3e-4→0.224). FORCED by trade-point anchoring itself (genB
1/w′(u_tp)); strike-independent warp ⟺ NOT trade-point-anchored ⇒ contradicts entry 31/36. That tension
is operator/curve-object call — flagged, NOT a defect of the fix.
**CORRECTED (g.1) GATE (skeptic, re-derived on RE-POSED):** pin pool+dy; assert
`|φ_far−φ_near| > 1e6·FLOOR` (FLOOR=max(|φ_spotReduce|,EPSILON) — MANDATORY guard, spotReduce now 0.0
exact ⇒ div-by-zero else) AND `|φ_far|>|φ_near|`. TARGETS: φ_near(1.1mp0)=−0.054467, φ_far(1.6mp0)=
−0.684490, **|Δφ|=0.630023** (~19× the prior wrong-spec 0.033, warp now in the right channel); ordered
TRUE; spotReduce=0.0. (g.2) spot-reduce <1e-12 TARGET 0.0; (g.3) one-global-φ at LIVE-β reserves 0.0.
**HONEST CARRY (unchanged):** (α,β)-flow-confinement lemma [needs-Aristotle] OPEN, NOT Lean-cert — numeric
only, do not report proven. warp∘rebase-commute + φ-anchor/funding still OPEN; fix does NOT touch rebase.
Reductions preserved (spot-reduce EXACT, Balancer τ→∞, α/β cons LIVE now, frozen wings, γ>1 iff w_±>½,
Reading-A untouched, wing-range guard LIVE = identical to legacy surface). Nothing submitted/edited/
built/git. Manager re-derives; skeptic RE-REVIEWS the RE-POSED spec before intern builds.

---
_Earlier: 2026-06-10, WARP→genB-kurtosis GENERALISATION (entry 34; READ-ONLY derivation; no submit/edit/git/build)._

### WARP → (W) KURTOSIS GENERALISATION — 2026-06-10 (operator entry 34; READ-ONLY; notes-only; NO submit/edit/git/build)
Note: `notes/research/WARP_genB_kurtosis_generalisation_2026-06-10.md`. Scripts `/tmp/genB_warp.py`,
`/tmp/genB_warp2.py` (python float64). Re-read retrieved warp-amm Model-C Lean (`/tmp/aristotle_query/mc/.../Warp.lean`).
**ANSWER: warp-amm's scalar trade-point re-seat (w₀→w₁) lifts to (W) as a φ-RECENTER of the field,
anchored at the leg's trade point — the lift is FORCED, not a choice.** Per-leg closed law `[analytic]`:
**dφ/dy = du′/dy − (1/w′(u))·(β/y²)** (numeric-vs-analytic 1.2e-10). Steps 1–3 (y'=y+dy; w*=1−β/y';
x'=α/w*) IDENTICAL to warp-amm/Balancer conservation; only Step 4 (invert field for φ') is new.
**τ/KURTOSIS ENTERS ONLY through the re-seat factor `dz/dw*=1/w′(u)` (exact identity, residual 0
float64).** Sharp elbow (small τ, w′(0)=Δw/2τ large) ⇒ cheap local warp; frozen wings (w′→0) ⇒
1/w′→∞ ⇒ divergent φ-travel = the frozen-wing range cap. Strike-dependent, grows toward wings (~27×
spread reproduced). τ NEVER written by trade (static-knob/frozen-wing design holds; knob CONDITIONS the
warp, not scaled by it). **CLOSED FORMS: survive in elbow (φ'=ln(y'/x')−t·τ/√(1−t²), |t|<1); warp-amm
mode_shift/cosh-lens carries VERBATIM on wings (constant w_±); BREAK at frozen wing (t→±1 ⇒ z→±∞ ⇒ no
finite φ ⇒ numeric clamp/reject/split — global problem is bisection-class).** Balancer limit: τ→∞ ⇒
w′→0 ⇒ field flat ⇒ collapses to warp-amm scalar mode_shift (1/w₀)log(y_s/y_B) (w′(0)=1e-4@τ=1000).
**CONTRACTS HOLD:** α/β conservation, frozen wings, γ>1 (iff w_±>½), Reading-A settlement (warp only
moves φ). **RE-FLAGGED unresolved:** one-global-φ-across-trade-point-AND-reserves-point (the (α,β)-flow
lemma, `[needs-Aristotle]`, the cert of the lift, path-indep numeric 0.0 not Lean); trades∘rebase commute
on (W) `[needs-Aristotle]`; φ-anchor/funding under moved φ (operator-tier). Operator-tier: engine→
trade-point anchoring (curve/economic-object call); wing clamp/reject/split (calibration). Nothing
submitted/built/git/verified. Manager re-derives; skeptic before operator.

---
_Earlier: 2026-06-10, ARISTOTLE WARP QUERY (entry 33; READ-ONLY; QUERY-only — no submit/edit/git/build)._

### ARISTOTLE WARP/CONTINUOUS-CASE QUERY — 2026-06-10 (operator entry 33; QUERY-only; NO submit/edit/git/build)
Note: `notes/research/WARP_continuous_aristotle_query_2026-06-10.md`. Auth: ARISTOTLE_API_KEY clean
(no literal `<>` this session — starts `ar`, ends `24`, len 49); CLI = `uvx --from aristotlelib aristotle`.
Enumerated ALL ~80 projects (8 pages of `list`). The operator's "continuous case thing on aristotle"
= the **`warp-amm` / `warp-amm-handoff` cluster** (3 weeks ago: `d20dda3a` base, `7f933065`+`4e92e3cb`
Model-C twins) — Lean `RequestProject/Warp.lean`, formalizes a "Warp AMM paper" (`warp-amm.tex`, NOT
in archive). Downloaded + audited base (d20dda3a) + Model-C (7f933065): token-CLEAN, summary asserts
axioms ⊆ std three (no inline `#print axioms`). **WHAT IT HAS (trade-point anchored, matches operator's
pin):** `σ_B w₀ x_B y_B=((1−w₀)/w₀)(x_B/y_B)` = tangent AT THE TRADE POINT (x_B,y_B), NOT spot/45°/
reserves; `w₁ x_s y_s σB` re-seats curve to that tangent; `mode_shift`: φ-shift `ξ_m(wn)−ξ_m(w₀)=
log(y_s/x_s)−log(y_B/x_B)`; `mode_shift_closed_call` (needs `hcurve`=both on pre-trade curve):
`=(1/w₀)log(y_s/y_B)` CLOSED FORM; `slope_integral_sum/prod`: ∫σ_ξ over rapidity = 2σ·sinh Δξ /
2σ²(cosh Δξ−1). **WHAT IT IS NOT (honest gap):** this is the DISCRETE trade-point mode-shift +
slope-over-RAPIDITY integral; it is NOT the paper-draft `dw/dy=β/y²` cash-leg integral along the
conservation hyperbola `(x−α)(y−β)=αβ`. Different parametrization (rapidity/log-price ξ, weight w(θ)),
no `(α,β)` first integral, no `β/y²` ODE. So: the operator's continuous-case warp EXISTS on Aristotle
as the WARP-AMM rapidity formalization (trade-point-anchored ✓), but the SPECIFIC `dw/dy=β/y²` integral
named in the paper-draft placeholder is NOT among the 80 projects (searched: trade-exec `f297c53f` is a
DIFFERENT "self-referential w=Rx/T" model). Other warp-adjacent: `4895db4e` closed-form pricing surface
(skew/depth, path-independence), `5f9d64c7` Barrier-on-Balancer (`spot_deriv_in_weight d/dw=(y/x)/(1−w)²`).
**RECOMMEND:** the WARP-AMM `Warp.lean` IS the continuous-case home (use it); if the engine fix needs the
`dw/dy=β/y²` hyperbola integral specifically, that is a SHORT fresh derivation/obligation (NOT submitted
this pass) — the `(α,β)`-flow lemma already flagged in TRADE_WARP_strongform item 1 is the same object.
Nothing submitted/built/git; READ-ONLY query only. Archives in /tmp/aristotle_query (throwaway).

---
_Earlier: 2026-06-10, PREMIUM-WARP + SPREAD-SHORTCUT verify (notes-only; NO submit/edit/git; operator entry 30)._

### PREMIUM-WARP MONOTONICITY + VS-SHORTCUT — 2026-06-10 (operator entry 30; TEST-ONLY; NO submit/edit/git; builds md5-unchanged)
Note: `notes/research/WARP_premium_and_spread_shortcut_2026-06-10.md`. Engines sliced read-only to
`/tmp/engine_{v24,v27}.js` (Node vm). v24 md5 6f606f52, v27 HEAD md5 1eebfcd6 (matches operator).
Scripts `/tmp/check1c.js` (engine executeLeg path, authoritative), `/tmp/check1b.js` (dy∝notional
sensitivity), `/tmp/check1_dymono.js`, `/tmp/check2.js`, `/tmp/check2_analytic.js`. Pools = shipped
v27 default (x0=10,tau=0.3,wMinus=.60,wPlus=.85,oracle=80000,equil y0,phi0=ln(y0/x0)) + matched-wMid
v24 (w=0.725, equil-at-load); γ@spot=2.6364 both.
**CHECK 1 VERDICT = NO (both v24 AND v27), against the operator's verbatim claim — with a clean
reframe.** LOAD-BEARING ENGINE FACT [analytic, identical both builds]: executeLeg sets the cash leg
`dy = V_usd = N·m·oracle = PREMIUM·oracle`; tradeUpdate depends ONLY on dy ⇒ warp is a one-to-one
fn of premium (no separate strike channel). Warp monotone-increasing in |dy| (verified). So:
(A) const PREMIUM ⇒ dy fixed ⇒ **warp FLAT, not increasing**; (B) const NOTIONAL ⇒ dy=N·m·oracle
falls further OTM ⇒ **warp + premium + slippage all DECREASE**. The operator's intuition IS the
const-notional column. "Same premium ⇒ same warp" exactly because premium IS the warp control here.
The operator's "more warp further OTM" appears ONLY under a NOTIONAL-sized leg (dy∝N: const-premium
then ⇒ N rises ⇒ warp STRICTLY increases, both builds — /tmp/check1b.js). **NO build difference in
the monotonicity verdict** — v27 elbow-local φ-warp vs v24 uniform w=α/x changes only metric/
magnitude (v27 |Δφ|≈2.1e-2 vs v24 |Δw|≈5.5e-2 at matched premium). **FLAG (operator/economic-object):
which leg the AMM swaps — premium-leg (current) vs notional-leg — is the operator's call; it flips
the Check-1 answer.**
**CHECK 2 VERDICT = HOLDS exactly (both builds), residual ≤2.2e-16.** Same-leg same-wing VS on
(θ₁,θ₂) = single AMM tx at θ*=√(θ₁θ₂) carrying the value diff. θ* strictly between (strict AM-GM).
EXACT trig identity in the strictly-OTM markFrac branch: N(m₁−m₂)=N·sNorm(1/θ₁−1/θ₂)=N·mark(θ*)·2sinh|δ|
(call; put symmetric). Build-independent — mark OTM branch byte-identical v24(L24-27)/v27(L58-61).
DOMAIN CAVEAT (flag, not failure): exact only OTM power-law branch; ITM/v27-smooth-paste-premium
breaks the bare identity — the ITM extension IS the Lean-proved compositeRay_ITM_substitution (C1).
Nothing submitted/built/git; builds md5-unchanged post-task. Manager re-derives; tester runs live/visual.

---
_Earlier: 2026-06-10, WARP kurtosis SWEEP (notes-only; NO submit/edit/git; operator entry 26)._

### WARP KURTOSIS SWEEP (#16-adjacent) — 2026-06-10 (operator entry 26; notes-only; NO submit/edit/git)
Note: `notes/research/WARP_kurtosis_sweep_2026-06-10.md`. Scripts `/tmp/warp_sweep_{1..5}.js` (Node float64).
Baseline = skeptic reconcile (NOT the retracted headline): v24 warps via SCALAR w=α/x → UNIFORM shift of
whole curve across all rays; v27 φ-recenter → elbow-LOCAL bend that DECAYS in wings (frozen-wing price).
**QUESTION:** is there a kurtosis τ where v27's curve warp matches v24's? **METRIC (skeptic's):** each
build's ACTUAL rendered curve, Δln(mp) ray-resolved at fixed u, pre/post trade. Sanity: reproduced
skeptic's 0.0003@1%/u=0.5, 0.0318@10%/u=0.5 EXACTLY.
**STRUCTURAL KEY:** v24 reshape Δln(w/(1−w)) is u-INDEPENDENT (uniform shift); v27 reshape
Δln(w(u;φ)/(1−w(u;φ))) is u-DEPENDENT, decays in wings. Different SHAPES of reshape.
**VERDICT = NO.** Same-sign (correct-direction) elbow warp ratio v27/v24 SUP = 0.9999, attained only at
τ→∞,Δw→0 (degenerate flat Balancer = no kurtosis knob left). At all realistic τ: elbow ratio <1, wings
(u≥0.5) ≤0.04 and falling. SIGN TRAP: widening Δw past matched (≈τ/2) FLIPS the elbow reshape sign (φ
overshoots/reverses; Δw=0.30,τ=0.3 → ratio −0.918) — |warp|>v24 only with WRONG sign = opposite bend, not
a match. DESIGN CHECK at any near-match: w_mid=0.5 forces w_−<½ ⇒ **γ_−<1, VIOLATES γ>1 lock** (match
lives at ordinary-CPMM comfort point, NOT a shippable options pool); matched Δw=τ/2 REJECTS 10% trades for
τ≤0.10 (wing-range guard); wings stay frozen (✓, ~1e−5 shift). Polar-lens: v24=uniform fan re-scale (w),
v27=fan-center re-aim (φ) — agree at elbow to 1st order, MUST diverge in wings (φ has zero leverage where
warp term saturates). Operator's "too natural" intuition correct AT ELBOW/1st-order; frozen wings (the
design choice) cap the match to the elbow. **FLAGS (operator-tier, via manager):** visible-warp gap is
STRUCTURAL not bug, NOT closable by τ; honest fixes = anchor-overlay viz (true smaller magnitude) or accept
localized warp; v24-magnitude warp ⇒ give up frozen-wing/static-kurtosis (curve/object call, not
calibration). Numbers at symmetric (10,10),w_mid=0.5 comfort pool (the v24 object the operator named); γ>1
options-pool magnitudes a separate sweep. Nothing submitted/built/git. Manager re-derives + skeptic verifies.

---

### WARP v24-vs-v27 COMPARE (#16-adjacent) — 2026-06-10 (operator entry 24; notes-only; NO submit/edit/git)
Note: `notes/research/WARP_v24_vs_v27_compare_2026-06-10.md`. Scripts `/tmp/warp_cmp_{1..7}.js` (Node float64).
Engines sandboxed: v24 `temporal_mvp_v24_rebase_fixed_2.html`, v27 `temporal_mvp_v27_wkurtosis_WIP.html`.
**QUESTION:** does v27's per-trade warp match v24's at "kurtosis implied by ordinary Balancer"? (tester saw
v27 sub-pixel "dot slide".) **MATCHED SETTING:** ordinary Balancer (v24, w=0.5 anchor) implied local
curvature `dw/du=1/4` [analytic, = numeric 0.250]. Match v27 at center: `w_mid=0.5, Δw=τ/2`
(wMinus=0.5−τ/4, wPlus=0.5+τ/4, phi=0); headline τ=0.3 ⇒ (0.425,0.575). Same pool x=10,y=10 (u=0,w=0.5),
same trade dy=f·y. v27 derived (alpha,beta)=(5,5)=v24; post-trade (x,y) BYTE-IDENTICAL (shared trajectory
hyperbola).
**VERDICT — TWO warp metrics:** (A) operating-point dot-slide Δln(mp)/Δu: **v27≡v24, ratio 1.0000 EXACT,
τ-independent** (the visual the operator likes IS reproduced exactly). (B) genuine curve RESHAPE at fixed
ref: **v24≡0 EXACTLY** (alpha,beta conserved ⇒ pure dot-slide on a FIXED curve, v24 does NOT warp the
curve), v27 small reshape (1% trade ≈4e−5 ln(mp) ≈0.004% curve shift; → smaller as τ↑). Same order of
mag? **dot-slide YES (identical); reshape N/A (v24=0, v27 adds the mechanic v24 never had).**
**FORK IMPLICATION = RENDER-SCALE / default-pool, NOT a fundamental v27 weakness.** Dot-slide (v24-comfort
visual) identical ⇒ if not visibly moving it's render-window/pool, not magnitude. The new reshape is small
BY DESIGN (frozen wings, static τ); larger reshape = calibration (smaller τ / wider Δw) = operator-tier.
**FLAG (load-bearing premise correction):** "v24's trades warp the curve" is FALSE at curve level — v24 is
a PURE DOT-SLIDE (alpha,beta conserved). What the operator likes IS the dot-slide; v27 matches it exactly.
Manager must relay this reframe. Match-def (w_mid=0.5 ordinary-Balancer pt, not γ>1) flagged; dot-slide
identity is match-def-INDEPENDENT (follows from shared hyperbola). Nothing submitted/built/git. Manager re-derives.

---
_Earlier: 2026-06-10, STRONG-FORM TRADES-WARP derivation (notes-only; NO submit/edit/git; PRIORITY, build HELD)._

### STRONG-FORM TRADES-WARP (#16, R-paper) — 2026-06-10 (operator PRIORITY; build HELD until landed; notes-only)
Note: `notes/research/TRADE_WARP_strongform_2026-06-10.md`. Scripts `/tmp/warp{1..8}.py` (python float64).
**DELIVERED: the strong-form trade→(W)-weight-field→reshaped-curve map is DEFINED (R-paper no longer
open).** R-simple (BUILD_SPEC §1.2 adopted reading) was a MISCHARACTERISATION — even plain Balancer's
*pricing* curve `x^w y^(1−w)=k` skews under a trade (w,k both move, verified v24); the genuinely fixed
object is the **trajectory hyperbola `(x−α)(y−β)=αβ`**, the two tangent at the reserves point. The
strong form lifts that picture to the field.
**THE MAP [analytic, closed form]:** field center φ (φ=0 at deploy), `w(u;φ)=w_mid+(Δw/2)(u−φ)/√(τ²+(u−φ)²)`.
Conserve `α=x·w(u;φ)`, `β=y·(1−w(u;φ))` (shifted-field local weight). Given cash leg dy:
(1) y'=y+dy; (2) β-cons ⇒ **w*=1−β/y'** (new local weight); (3) α-cons ⇒ **x'=α/w*** (dx forced,
Balancer-identical); (4) reshape ⇒ **φ' = ln(y'/x') − z**, z=t·τ/√(1−t²), t=(w*−w_mid)/(Δw/2) — UNIQUE
iff w*∈(w_−,w_+). Reserves faithful, curve skews, τ untouched. **Step-4 ≡ paper's slope-goal-seek**
(independent root-find matches closed form 8e-16).
**CONSISTENCY [numeric/analytic, all PASS]:** trajectory=(x−α)(y−β)=αβ to 1e-15 (reserves ride the
SAME hyperbola as Balancer; φ slaved to position); tangency = algebraic identity (pricing slope ≡
trajectory slope, 0.0); round-trip 1.8e-15; path-independent 0.0 (⇒ α,β genuine flow invariants);
marginal price monotone in dy; τ static (never written, γ_+ pre=post); wings frozen (w(±∞;φ)
shift-invariant); τ→∞ recovers Balancer dx to 1e-13.
**THE ONE OBSTRUCTION [precise, NOT fatal]:** w*=1−β/y' must stay in (w_−,w_+); outside ⇒ no finite φ
(curve can't skew past frozen wings). Bounds single-trade cash: y'∈(β/(1−w_−), β/(1−w_+)). Natural
size cap from frozen wings — unblock by wider Δw (calibration), order-splitting (engine trades
incrementally), or saturate-at-wing clamp. Operator/calibration-tier guard.
**DISCARDED VARIANT = GH line v25_gh→v26c (current HEAD). WHY warp failed:** GH puts the kernel in the
latent SCORE ⇒ NO scalar weight handle for a trade to move. GH `tradeUpdate` (HEAD line 1720) reads
(x,y) off FIXED tail/CDF tables keyed on static (ghAh,ghBh,ghDelta,ghMu) and returns {...s,x,y} —
shape NEVER written (point on fixed field). Balancer's warp handle is `w=α/x` (paper: "w is what the
pool's pricing actually moves"); GH has no `w=α/x` analogue to slave. (W) avoids this BY
CONSTRUCTION: φ is the weight-field d.o.f. that IS slaved to the reserves point — kernel-in-WEIGHT.
**needs-Aristotle (flagged, NOT pinned this pass):** (1) (α,β)-first-integral lemma + reserves-projection
=(x−α)(y−β)=αβ (short, algebraic, Mathlib-tractable, no special fns); (2) trades commute with
carry-shift rebase on (W) (numeric+Lean, load-bearing for frame well-definedness, OPEN). **Flags to
operator:** R-paper now defined (replace BUILD_SPEC §1.2 R-simple); frozen-wing trade-size cap;
φ=0/anchor-under-moved-φ interaction with funding (operator-tier); Reading A/B untouched. Nothing
submitted/verified. Skeptic pass + manager re-derive precede build resume.

---
_Earlier: 2026-06-10, (W) BUILD SPEC speed-run (notes-only; NO submit/edit/git; theory-risk ACCEPTED)._

### (W) BUILD SPEC — 2026-06-10 (operator SPEED RUN, autonomy granted, theory-risk accepted; notes-only)
Doc: `notes/research/BUILD_SPEC_wcurve_2026-06-10.md`. The intern's implementation contract for the (W)
kurtosis curve off the v24 base (`engine/builds/temporal_mvp_v24_rebase_fixed_2.html` — clean Balancer-
barrier engine, NO GH tail/ghMu). Verify scripts `/tmp/wcurve_verify{,2,3}.py` (python float64).
**LOAD-BEARING [proven] FINDING:** on (W) Balancer-warp curve, marginal price == geometric slope EXACTLY
(`|dy/dx|=(w/(1-w))(y/x)`, 1e-15) ⇒ **GOTCHA#12's e^(-ghMu) factor is GH-only, ABSENT in (W)**; mpGeom
collapses to getMP_raw, do NOT port any ghMu machinery. Other [proven]: first integral RK4 3.4e-13;
wing exponents γ_±=w_±/(1-w_±) τ-independent; γ_loc(0)=w_mid/(1-w_mid); price p(u)=γ_loc·e^u strictly
monotone ⇒ arbitrage inverse unique+round-trips; Reading-A S*=K·γ_loc(S*)/(γ_loc(S*)+1) fixed point
converges. **4 curve fns specced:** getMP_raw=(w/(1-w))(y/x) with w=wField(u); tradeUpdate=paper Trade-
Formula (α=x·w,β=y·(1-w) conserved per-trade at PRE-weight, hyperbola algebra unchanged, w re-derived);
arbitrageToOracle=bisection invert (no closed form on W); rebase=carry-shift q→q−ln r (NOT rigid x→r·x;
w NOT preserved, curve-shape is). mark=v26c smooth-pasting form with g→γ_loc(strike). Funding anchor=
price-anchor p=P, γ→±γ_loc. Dollar pipe REUSED (§6 hard-stop). τ knob static/vol-set, wings frozen.
**[theory-risk-accepted]:** trade per-trade-freeze + R-simple composition (reserves slide on FIXED field;
R-paper field-recenter w→φ map OPEN #16); rebase carry-shift (covariance-in-q lemma PROPOSED-only, not
Lean); funding price-anchor; γ_loc-at-strike (elbow few-% under Reading B). **CANNOT-DEFINE flags:**
(1) trade→skew strong form #16 OPEN; (2) carry-covariance-in-q Lean unverified; (3) **γ>1 needs BOTH
w_±>½ — asymmetric params can give γ₋<1, calibration/operator constraint, UI must reject w_±≤½**;
(4) Reading A vs B = operator settlement-semantics call. Nothing submitted/verified; skeptic FAST pass +
manager re-derive pending before intern ships. **needs-Aristotle: NONE ready** (operator-tier coord/
settlement decisions precede any Lean obligation).

---
_Earlier: 2026-06-10, CURVE-FAMILY CARRY pass #4 (notes-only; NO submit/edit/git; skeptic-gated)._

### CURVE-FAMILY CARRY (#4) — 2026-06-10 (skeptic ruling DELEGATED_DECISIONS item C: #4 FIRST; notes-only)
Note: `notes/research/CURVE_FAMILY_carry_pass_2026-06-10.md`. Scripts `/tmp/carry_W.py`, `/tmp/carry_W2.py`
(numpy/scipy float64). Curve = √-kernel (W) invariant. β=1 engine pin honored throughout.
**VERDICT — LOCKED CARRY CONTRACT DOES NOT TRANSFER (operator-tier).** Carry constant P=Ny/Nx
TRANSFERS as reserve anchor. The coordinate identity `u=log price−log P` with `dq/du=1` does NOT:
on (W) `dq/du = 1 + w′/(w(1−w))` [analytic, ★★], measured peak `dq/du` = 6.99 (τ=0.08)/2.60 (τ=0.3)/
1.48 (τ=1) at the elbow center, →1 only in wings [numeric]. Two DIFFERENT log-coords: reserve-ratio
`u=ln(y/x)` vs log-price `q=ln p`, related by `q = u + ln γ_loc(u) + C` (★) — the warp correction
`ln γ_loc(u)` is a BOUNDED sigmoidal step (ln γ₋→ln γ₊, total 0.981 at the test params), u-dependent,
so q≠u+const. TRUE carry coordinate = the price leg `ln(p/P)`, NOT `ln(y/x)`. Anchor `P=Ny/Nx`:
reserve-anchor (y/x=P) and price-anchor (p=P) DECOUPLE unless w=½ there; "anchor w=½" is now a single
POINT not a curve slice. **β=1 honor:** on GH engine warp correction = ln(Ny·M/Nx) is u-INDEPENDENT ⇒
`max|dq/du−1|=0` [numeric] ⇒ carry clean on the SHIPPED engine; non-transfer is a (W)-WEIGHT-curve
fact (kernel-in-weight vs kernel-in-score), NOT an engine regression. **Dependents pinned (NOT worked
this pass):** #5 rebase + #9 funding + #11 dollar + #8 strike-reg must all work in `q=ln p` not `u`;
rebase must act on q (rigid-shift in u fails — warp doesn't commute); funding anchor must be pinned
(reserve p=P vs weight w=½ now differ). **needs-Aristotle: NONE ready** (operator-tier coord decision
precedes any Lean obligation; a carry-covariance-in-q lemma is PROPOSED only). Nothing trusted-from-
prover/verified. Skeptic pass pending before merge. Inventory disposition table in note (§5).

---
_Earlier: 2026-06-10, CURVE-FAMILY settlement PASS 2 (notes-only; NO submit/edit/git)._

### CURVE-FAMILY SETTLEMENT — PASS 2, 2026-06-10 (notes-only; NO submit/edit/git; skeptic-gated)
Note: `notes/research/CURVE_FAMILY_settlement_pass2_2026-06-10.md`. Settles the ONE narrow question the
skeptic isolated (pass-1 "+16% blow-up" was a RETRACTED artifact — do NOT re-derive it). Scripts
`/tmp/elbow_riccati.py`, `/tmp/elbow_consequence.py`, `/tmp/elbow_wkb.py` (numpy/scipy float64, Riccati).
**THE QUESTION:** is the perpetual-American continuation value locally a single power `a·S^(−γ_loc)`
THROUGH the elbow, or a genuine blend (slope ≠ curve's w/(1−w))?
**SETUP:** value = eigenfunction of the curve-induced perpetual generator (the locked MERTON_tie/
AIRTIGHT frame). Constant-coeff wing ⇒ exact single power [analytic]; variable-coeff elbow ⇒ no
single-power solution [analytic]. Computed via Riccati for the slope p=d lnV/dx (`p′=2r/σ²+p−p²`,
backward from right wing, decaying branch) on a Gaussian-SLICE generator with local-exponent
calibration σ²(x)=2r/(γ_loc(γ_loc+1)). ⚠ Gaussian slice, NOT full GH ψ — qualitative verdict
generator-independent; elbow MAGNITUDES are model-dependent [numeric].
**VERDICT — single-power-through-elbow: NO (under the dynamic/optimal-stopping reading = team's locked
frame).** Dynamic slope −p MATCHES γ_loc to ~1e-4..1e-6 on wings, DIVERGES by O(1) in elbow (peak
+0.50 at τ=0.3; +1.41 at τ=0.05). Blend scales 1/τ (sharper elbow=bigger blend). Genuine blend
correction `−p ≈ γ_loc + γ_loc′/(2γ_loc+1)` [analytic, 1st-order] — THE consistent home of the term
pass-1 fumbled (lnS-free, lives in the value's Riccati, real). Matches solved Riccati to ~1e-2 in
smooth elbows.
**THE FORK (operator-tier, settlement-semantics):** Reading A (curve-intrinsic value law: slope:=−γ_loc
by definition) ⇒ S*=K·γ_loc/(γ_loc+1) EXACT everywhere, gate PASSES. Reading B (dynamic eigenfunction,
= MERTON_tie/AIRTIGHT locked frame) ⇒ value is a blend, inherited fixed point is a FEW-PERCENT
APPROX in elbow, not exact. Which reading = venue settlement definition = operator's call.
**CONSEQUENCE (lands AGAINST rebuild-blocking momentum):** S* shift dynamic-vs-localFP only ~3–6%,
S* bounded ~60–68, NO blow-up. Pass-1 catastrophe stays RETRACTED. Gate EXACT on wings; few-%
approx in elbow under Reading B. Clean recovery = wing-registered strikes (|u_K|≫τ) = product/
calibration call. **needs-Aristotle (only if Reading B + exact-in-elbow wanted):** NOT the inherited
Sstar_forced (assumes constant-exp single power) — either (a) a smooth-pasting STABILITY error-bound
lemma |S*_dyn−K γ_loc/(γ_loc+1)|≤C·γ_loc′/(2γ_loc+1) (a BUILD; Mathlib lacks free-boundary stability)
or (b) Reading A: Sstar_forced restated with γ:=γ_loc(S*) fixed point (immediate from T1a). NO submit
this pass — statement PROPOSED not assumed; pin only after operator picks reading. Nothing
trusted-from-prover/verified. Skeptic pass pending before merge.

---
_Earlier: 2026-06-10, CURVE-FAMILY derivation pass 1 (notes-only) + memory DEQUARANTINE truth-up._

### CURVE-FAMILY DERIVATION — 2026-06-10 (operator greenlit "start"; manager-relayed; notes-only, NO submit/edit/git)
Note: `notes/research/CURVE_FAMILY_derivation_2026-06-10.md`. Target spec
`specs/SPEC_kurtosis_curve_family_TARGET.md`. mpmath/python float64 numerics + analytic.
**PART 0 DEQUARANTINE DONE (this task, before any derivation):** the three Part-0 corrections are
now encoded as live truth at the top of this file and the stale assertions struck inline below.
Confirmed: (1) closed-form invariant EXISTS (was "none"); (2) τ:=δ / engine=one (W) setting is
FALSE at curve level; (3) the "invariances-hold-by-carry" blanket is DROPPED — carry/rebase/
value-law/seam/funding are NOT established for a warp family (Esscher d-law fails mid-curve for (W)).
**PART 1 (conjecture, operator's hyperbolic-angle lens):** THE CURVE = the √-kernel level set
`F(x,y)= x^{w_mid}·y^{1−w_mid}·exp(−(Δw/2)·√(τ²+ln²(y/x))) = k` (first integral of the Balancer
local-weight law −dy/dx=(w/(1−w))(y/x), w(u)=w_mid+(Δw/2)·u/√(τ²+u²), u=ln(y/x)). THE LENS = the
hyperbolic-angle form `exp(−(Δwτ/2)·cosh(η−φ))` with η=asinh(u/τ), via the EXACT identity
√(τ²+u²)=τ·cosh η (the operator's 90°→180° polar view). Same curve, algebraic change of variable,
no membership owed. (a) ONE static amplitude/steepness/kurtosis knob = ATM sharpness w′(0)=Δw/2τ;
set once for vol, trade-invariant. **CAVEAT (flag): "one knob" is exact only in the symmetric
fixed-wing reading — otherwise Δw (skew spread) and τ (elbow width) are TWO geometric handles.**
(b) **Skew = φ, the angle SHIFT (η→η−φ) produced by trading** — a trade changes w (x,y follow real
reserves, paper Trade Formula); static amplitude untouched. The w-trade→φ map is OPEN (#16). (c)
**Wings frozen** — √(τ²+u²)→|u| ⇒ F→exact CD monomials x^{w₊}y^{1−w₊} (u→+∞) / x^{w₋}y^{1−w₋}
(u→−∞), γ_±=w_±/(1−w_±) τ-INDEPENDENT (wing weights exact to machine precision). **WHICH FORM:**
state the family with the √-kernel invariant; narrate it with the angle lens. Trig EARNS its place
ONLY as the lens (skew=shift, kurtosis=amplitude read off directly), introduces NO new content
(honors the standing Gudermannian flag — the d was amplitude relabeled; no extra dial in the angle).
**PART 2 (rebuild gate — does closed-form American settlement survive?):** VERDICT =
**GATE NOT CLEARED. Survives closed-form on the FROZEN WINGS only; FAILS-as-inherited in the ATM
elbow, where the most-traded band lives.** On a wing the curve is exact CD with constant local weight
(w₋ put / w₊ call) ⇒ exact power S^(−γ_±), γ_±=w_±/(1−w_±); the GH/Merton smooth-pasting algebra
(value+slope ⇒ S*=Kγ/(γ+1), continuation a·S^(−γ)) carries VERBATIM there [analytic]. **In the elbow
(|u|≲τ) γ_loc=w/(1−w) VARIES** ⇒ continuation is NOT a single power ⇒ inherited S* not guaranteed.
**Magnitude re-derived [numeric]:** a boundary exponent slope γ′=0.01 shifts S* from 75.0 to 87.3
(~16%) at γ=3,K=100; γ′_loc(0)=(Δw/2τ)/(1−w_mid)² is O(1)+ in the elbow. **Elbow width [numeric]:**
τ=0.3 → γ′_loc>1e-2 spans |u|<2.8 (price within ~16× of carry); τ=0.05 → |u|<0.85 (~2.3×). ATM/
near-ATM strikes sit IN the elbow ⇒ inherited closed form does NOT carry to the operative region.
Three resolution paths (note §2.5): (i) [needs-numeric/operator] confirm the traded strike band is
wing-registered (|u_K|≫τ) for the chosen τ — a product/calibration call; (ii) [needs-analytic] find a
generalized closed-form free boundary for the varying-exponent continuation (open, plausible given the
elementary integral); (iii) [needs-Aristotle] certify the seam C¹ once a boundary is pinned (cf.
AIRTIGHT T1a Sstar_forced / PH-5). **FLAGS for operator (via manager):** curve/knob choice
operator-tier; the rebuild gate currently BLOCKS the rebuild absent (i)/(ii); WHERE strikes register
(wing vs elbow) is the load-bearing settlement decision, operator/calibration-tier; "one amplitude
knob" exact only in the symmetric fixed-wing reading (Δw vs τ are two handles otherwise); skew-as-φ-
from-trading is the operator's frame but the paper-Trade-Formula→φ map is UNIMPLEMENTED (#16, OPEN);
carry/rebase/funding for the warp family are OPEN/not-shown (do NOT carry from GH). **Numerics
re-verified THIS pass (numpy/scipy float64, mpmath unavailable):** invariant logF const std 1.4e-13;
cosh identity 9e-16; wing weights exact; C¹ match ≤7e-15; boundary-shift + elbow-width tables in note.
Note `notes/research/CURVE_FAMILY_derivation_2026-06-10.md` now WRITTEN (prior header referenced it
before it existed on disk; the earlier Part-2 "seam-is-the-only-open-obligation" framing UNDERSOLD the
obstruction and is REPLACED by the gate-not-cleared verdict above). No engine/git/submit this pass;
nothing trusted-from-prover/verified.

---

> ## ⚠ CORRECTION HEADER (2026-06-10, appended by manager per skeptic verdict + stock-take — READ BEFORE BRIEFING FROM THIS MEMORY)
> **TRUTH-UP DONE (research-lead, same day, Gudermannian-bridge task):** both broken claims are now
> struck inline below (✗CORRECTED markers in the KURTOSIS-KNOB section). Do not re-assert them.
> Two flagship claims recorded below as facts are **BROKEN** (skeptic inaugural verdict,
> manager-verified independently — `notes/skeptic/VERDICT_KURTOSIS_KNOB_2026-06-10.md`):
> 1. **"κ:=δ EXACTLY / engine = one (W) setting" is FALSE at curve level** — live-engine test:
>    w_eff vs ln(y/x) is non-monotone; the engine is not a (W)-member at ANY τ. Kernel-in-SCORE
>    (GH) ≠ kernel-in-WEIGHT ((W)).
> 2. **"NO clean algebraic invariant exists" is FALSE** — explicit closed form
>    `x^{w_mid}y^{1−w_mid}·exp(−(Δw/2)√(τ²+ln²(y/x)))=k` is a first integral of the (W) law
>    (manager: analytic + RK4 4.8e-13).
> Also: Object-L kurtosis numbers below are the β=0 slice — at the engine pin β=1: skew +0.92,
> excess kurt 3.285 (∉[0,3]); and the δ-dial at β=1 is a COUPLED (skew,kurt) dial (skeptic
> stock-take). Survived attack: asymptote preservation, sign-split + "never ship τ-up=fatter",
> endpoints, β=0 table values, REPARAM δ-unfreeze core. **Truth-up your own entries on your next
> task before briefing anyone from them.** (Notation: the κ below was renamed τ repo-wide.)

### GUDERMANNIAN BRIDGE — 2026-06-10 (operator entries 8–9; notes-only; skeptic-gated)
Note: `notes/GUDERMANNIAN_BRIDGE_2026-06-10.md`. mpmath dps 40–50; every identity below numerically
checked (~1e-38) AND derived; β=0 AND β=1 throughout (skeptic pattern 3 honored).
**THE BRIDGE (exact):** strike-ray angle ψ (45°=ATM, tan ψ=y/x), χ=ψ−45°: `ũ=ln(y/x)=gd⁻¹(2χ)` —
the 90°→180° "fan opening" IS the forced doubling σ=2χ (gd maps ℝ onto exactly 180°); ATM↦ũ=0;
ATM gear dũ/dχ=2 EXACTLY, parameter-free. GH leg θ=asinh(v/δ) has the same asinh form; composite
ATM gear = 2/δ (=25 at engine). SLOT HONESTY: chain fully exact only on the CPMM base (ũ=log price);
on GH the distribution view attaches at the LATENT leg (kernel-in-SCORE ≠ reserve-ray — no gluing).
Fan inherits measure p_χ = f·2cosh ũ with EDGE POWER-LAWS ε^(α−β−1) call / ε^(α+β−1) put
(= ε^(γ−1)/ε^(γ+1) at pin; γ>1 lock ⟺ pinch-off at call edge). Verified 1.9999/3.9999.
**d-LAW VERDICT: NO clean single-d↔kurtosis law (not forced).** Four readings of d: geometric gear
=2 universal (no parameter); composite gear 2/δ is a knob but Gaussian point is gear→0 NOT 2;
in-cosh gear d gives wings exp(−c·v^(d/2)) ⇒ **d FROZEN at 2 by asymptote preservation** (d≠2 =
the |v|^d wing-snapper; verified p=d/2 exactly); Taylor reading "Gaussian = order-2 piece of cosh"
true but not a dial. Also "Gaussian/symmetric point" conflates two axes: symmetric=φ=0(β=0),
Gaussian=A→∞ — orthogonal in (φ,A). **REPLACEMENT = AMPLITUDE LAW:** A=δ√(α²−β²); exact at all A
via Bessel-K cgf (Z=2δcoshφ·K₁(A), cgf from log[K₁(δζ_t)/ζ_t]; matches quadrature 10 digits);
large-A: skew≈3tanhφ/√A, **exkurt≈(3/A)(1+4tanh²φ)** (β=1,γ=3: exk·A→3.75 ✓; γ=2: →13/3 ✓; β=0:
→3 ✓); A→0 endpoint = asym-Laplace (3.6644 at pin, 4.08 at γ=2). Monotone-dec in A:
GRID-CONFIRMED only (no analytic proof — flag if load-bearing).
**RECONCILE (skeptic stock-take key question):** angle frame IS the pure coordinate system —
δ-dial moves A only, φ/a/b (wing slopes a=α−β=γ, b=α+β) are δ-free; kernel log-density exactly
symmetric about θ=φ at every A. BUT moment functionals stay coupled at φ≠0: A-dial traces
exkurt≈skew²(1+4t²)/(3t²) in moment space (verified →0.9996). **The frame REFRAMES the impurity
(coupling lives in moment coordinates, not the dial), it does NOT dissolve it** — skeptic fact (a)
exact and untouched. Branch-B knob honest IFF labeled amplitude/shape dial; NOT honest as pure
moment-kurtosis at β=1 (purity needs β=0 = FULL fork = settlement change). Which kurtosis = U1 =
operator's sentence. Esscher-in-θ: tilt = linear re-aim of (φ,A) in span{cosh,sinh} (exact,
8e-38) ⇒ value∝S^(−γ) amplitude-proof; γ = a = call-wing slope, A-free; wing slopes δ-free with
correction αδ²/2v² (verified).
**FORKS:** cosh(θ−φ) frame = clean RE-COORDINATIZATION of branch B (same family, bijection
(α,β,δ)↔(a,b,A) — algebraic identity, no membership test owed). Branch A (W): structural PARALLEL
only — (W) log-invariant = w_mid·lnx+(1−w_mid)·lny−(Δwτ/2)cosh η, weight = w_mid+(Δw/2)tanh η,
ũ=τsinh η (exact, 9e-41): both branches = "amplitude × cosh of own hyperbolic angle" but in
DIFFERENT SLOTS (score vs weight/invariant) — broken bridge stays broken, NO identity claimed.
**SOLVENCY (#13, explicit):** m=2 X-depth at β=1: 0.0845→0.5630 over δ=0.08→3 (6.7×; reproduces
skeptic); β=0 reproduces REPARAM 0.034→0.220. B1 re-prices at any shipped setting; extrinsic,
NOT closed. #8 strike-reg + #9 funding dispositioned: no change proposed; survival on a built
δ≠0.08 engine = open engine checks (dir_gate/seam/G4 re-reference owed). Full 15-item table in note.

---

### KURTOSIS-KNOB κ — 2026-06-10 (operator: buildable single-κ asymptote-respecting knob on Balancer; DERIVE not approx)
Note: `notes/KURTOSIS_KNOB_kappa_balancer_native_2026-06-10.md`. mpmath 25–60 digit, direct construction.
Realizes the paper's `(w,κ)` Future-Directions conjecture in implementable form.
**✗CORRECTED (2026-06-10 truth-up — claim was BROKEN, skeptic counterexample, manager-verified):**
~~NO clean algebraic `F(x,y;w,κ)=k` exists~~ — FALSE. The closed form
`x^{w_mid}·y^{1−w_mid}·exp(−(Δw/2)√(τ²+ln²(y/x)))=k` IS a first integral of the (W) law (analytic +
RK4 4.8e-13). The 4.6e-41 check only showed the unmodified CD monomial is non-constant under variable
w (true); the impossibility inference was a non sequitur. (Angle form: the exponent =
−(Δwτ/2)cosh η with ũ=τsinh η — see GUDERMANNIAN BRIDGE entry above.)
**THE PROFILE (W):** `w(u;w₋,w₊,κ)=w_mid+(Δw/2)·u/√(κ²+u²)`, w_mid=(w₋+w₊)/2, Δw=w₊−w₋;
`w'(0)=Δw/(2κ)` = ATM sharpness = the knob; `w'=O(κ²/|u|³)→0` in wings.
**✗CORRECTED (2026-06-10 truth-up — claim was BROKEN at curve level, every β):** ~~κ:=δ EXACTLY
(engine = setting κ=0.08)~~ — FALSE. Live-engine w_eff vs ln(y/x) is non-monotone; τ_implied runs
0.012→2.41; the engine is not a (W) member at ANY τ. Kernel-in-SCORE (GH) ≠ kernel-in-WEIGHT ((W)).
The kernel-SHAPE correspondence survives only as an analogy (shared cosh-in-own-angle structure).
**`(w,κ)` ROLE SPLIT:** convexity=w_mid (γ̄), SKEW=Δw (Δγ=γ₊−γ₋, the existing w tilt), KURTOSIS=κ (ATM
elbow only). γ_±=w_±/(1−w_±) are the wing exponents, FIXED, κ does NOT move them.
**ASYMPTOTE PRESERVATION (the load-bearing req, CONFIRMED):** γ_loc(±100κ) BYTE-IDENTICAL across
κ∈{0.05,1,30} (err 3.12e-5/1.25e-4) ⇒ κ = pure horizontal elbow-rescale, wing exponent κ-independent;
dγ_loc/du→0 in wings. Analytic: rounding O(1) at ATM, vanishes 1/|u|³ in wings. NOT a tail-exponent
deformation.
**ENDPOINTS:** κ→∞ = plain Balancer (constant w, dq/du→1, Gaussian/δ→∞ — consistent w/ prior reconcile
that CD=δ→∞ NOT δ→0); κ→0 = sharp-elbow LAPLACE = the paper's "log/exponential-curve invariant" (kernel
exp(−α√(κ²+v²))→exp(−α|v|)).
**KURTOSIS LAW + SIGN PINNED (⚠ β=0 SLICE — truth-up 2026-06-10):** Object L (LATENT driver
f∝exp(−α√(κ²+v²))) = TRUE excess kurtosis ∈[0,3] **at β=0 ONLY**; engine pin β=1 gives skew +0.92,
exkurt 3.285, range (0, 3.6644] at γ=3 — and the δ-dial at β=1 is a COUPLED (skew,kurt) dial in
moment space (one-knob amplitude trace, exkurt≈skew²(1+4t²)/(3t²) — see GUDERMANNIAN entry).
β=0 numbers (κ=0.08→2.6530, 0.3→1.6885, 1→0.6961, 3→0.2472) correct as symmetric-slice facts.
3/(κα)=large-κ asymptote only; general large-A law: exkurt≈(3/A)(1+4tanh²φ). SMALL κ=LEPTOKURTIC,
fatness dial=1/κ. Object P (pushforward implied-price) = PLATYKURTIC, OPPOSITE sign (κ=0.3→−1.116).
RECOMMEND label tracks Object L; do NOT ship "κ up=fatter" (backwards). Label = operator's call.
**ENGINE INTEGRATION (minimal):** add ghKappa(≡ghDelta) scalar; key tail/CDF cache + √(κ²+v²) kernel on
κ; recompute M,Φ at κ. **⚠ truth-up:** rebase/conservation/Esscher slope-law/value∝S^(−γ)/seam
invariances hold for the GH δ-UNFREEZE (branch B) as REPARAM derivations — label
derived-not-engine-verified (no δ≠0.08 engine ever built); they do NOT transfer to the (W) family
(Esscher d log slope/du=1 fails mid-curve in (W); carry/rebase/seam for (W) = UNKNOWN). Lean:
above-AMMCurve-contract untouched; re-instantiate kernel-constant layer only (branch B).
**FLAGS:** (1) curve choice + knob exposure = operator; (2) ✗CORRECTED — a clean closed-form
invariant DOES exist (`x^{w_mid}y^{1−w_mid}·exp(−(Δw/2)√(τ²+ln²(y/x)))=k`); the old "no clean
invariant, profile is the only form" is FALSE (skeptic counterexample, manager-verified, RK4 4.8e-13);
(3) label sign object-dependent (track L, 1/κ=fatness); (4) ASYMMETRIC-w SETTLEMENT FORK SURFACED — κ
holds w₋,w₊ fixed (orthogonal to fork); independent w₋≠w₊ = both S^(±γ_±) live = βh=0/two-root settlement
change (REPARAM FULL fork). Ship κ with skew held = MINIMAL/safe; freeing skew = separate operator move.
(5) paper's "capital-efficiency conserved as κ varies" NOT proven (consistent w/ value-law κ-invariance,
but a conservation proof is separate). No engine/git/submit this pass.

---
_Earlier: 2026-06-09, HETEROGENEOUS-WEIGHT DERIVATION (closed-form implied density; NO submit/edit/git)._

### HETEROGENEOUS-WEIGHT DERIVATION — 2026-06-09 (operator: closed form from x,y,w; DERIVE not approx)
Note: `notes/HETEROGENEOUS_WEIGHT_implied_density_2026-06-09.md`. mpmath 30-50 digit, direct integration.
**Closed form (headline):** Balancer with position-dependent w(u) (u=log p−log P):
  q(u)=log p = u + log(w(u)/(1−w(u))) + const ;  d log p/du = 1 + w'(u)/(w(u)(1−w(u))) ;
  implied log-price density f_q = f_u(u(q)) / [1 + w'/(w(1−w))].
The weight enters ONLY through w'/(w(1−w)) = d log-odds(w)/du (the score). Constant w ⇒ linear warp ⇒
Gaussian preserved (skew=kurt=0, numerically 1e-8). Heterogeneous w ⇒ nonlinear warp ⇒ skew+kurtosis.
**Profile→moments map:** wing exponents γ_±=w_±/(1−w_±) (w flattens in wings ⇒ clean value∝S^(−γ_±),
dγ_loc/du→1e-10 at |u|=8); CONVEXITY=(γ_-+γ_+)/2; SKEW=γ_+−γ_-; KURTOSIS=transition sharpness w'(0)/δ.
**VERDICT: GENERALIZES GH (not recover).** GH = the specific √-sigmoid σ_GH(v)=(1+v/√(δ²+v²))/2 (latent
score β−αv/√(δ²+v²)); reproduces prior-note GH kurtosis EXACTLY (δ=0.08→2.6530, 0.3→1.6885, 1→0.6961,
3→0.2472). Concrete NON-GH member: tanh-score β−α·tanh(v/δ) — SAME wing decay (α−|β|), DIFFERENT
kurtosis (1.2184 √ vs 1.2000 tanh) ⇒ distinct valid distribution. Monotone+smooth+power-law-wings do
NOT force √ (tanh counterexample). RECOVER only under the extra inverse-Gaussian-mixing constraint
(GH's defining property) — a separate modeling assumption, flagged.
**AMM-VALIDITY gate on w(u):** w∈(0,1) [antitone]; dq/du=1+w'/(w(1−w))>0 i.e. w'>−w(1−w) [convex,
suff: w'≥0]; w_±∈(0,1) finite [coercive]. Numerically: monotone-incr w ⇒ valid; sharply-decreasing w ⇒
dq/du=−8<0 ⇒ INVALID/excluded.
**DENSITY-OBJECT AMBIGUITY (load-bearing honesty):** 3 objects differ. (1) pushforward f_q (USED) —
kurtosis SIGN is NEGATIVE/platykurtic (warp steepens ATM). (2) reserve-curvature −dX/dp — IMPROPER for
pure Balancer (unbounded reserves, non-integrable at p=0; needs both legs / GH bounded tail/CDF). (3)
latent f_β — POSITIVE/leptokurtic (Laplace-ward). Wing power-law lives in value-exponent γ_loc=w/(1−w),
NOT reserve tail. Kurtosis sign flips by object ⇒ any label must name the object.
**OPERATOR FLAGS:** (1) curve-member choice operator-owned; (2) density-object ambiguity changes the
answer (esp. kurtosis sign) — UI/paper label must name object, consistent w/ prior δ=ATM-elbow finding;
(3) asymmetric w_± = independent γ_± = both S^(±γ) eigenfunctions = βh=0/two-root settlement-semantics
change (FULL fork from REPARAM note; heterogeneous w is the GENERAL mechanism behind that fork; single-γ
engine β=1 is the w_-=w_+ slice); (4) validity is a HARD type gate not a tuning knob.

---
_Earlier: 2026-06-09, RECONCILE PASS (Balancer-δ + wings-vs-ATM resolved; NO submit/edit/git)._

### RECONCILE PASS — 2026-06-09 (resolved the Pass-1 vs Pass-2 δ conflict; manager-requested)
Built the actual curves (mpmath 35-40 digit, direct integration — not formula-arguing). **Authoritative
spec is now the v2 body of `notes/REPARAM_balancer_kurtosis_dropin_2026-06-09.md`** (rewritten to match
the manager header; whole file self-consistent). Pass-1 note `CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md`
got a CORRECTION HEADER. **Three resolved verdicts:**
- **BALANCER-δ VERDICT: the exact Cobb-Douglas/Balancer RESERVE CURVE is the δ→∞ (Gaussian) limit, NOT
  δ→0. Pass-1's "δ→0" is REFUTED.** Built it: CV of the CD invariant K=X^w·Y^(1−w) along the GH frontier
  decreases monotonically with δ (δ=1→0.55, 3→0.32, 10→0.11, 30→0.057; robust 2 windows), never →0 (GH
  reserves BOUNDED vs CD UNBOUNDED ⇒ coincidence is δ→∞ asymptote only). Reserve log-slopes flatten to
  CD constants −(1−w),w as δ→∞. CD=log-normal=Gaussian=δ→∞ — consistent with kurtosis direction. δ→0 =
  Laplace (fat return density), NOT Balancer. (Pass-1 conflated the fat-Laplace symmetric base with the
  Cobb-Douglas Gaussian curve — opposite δ ends.)
- **WINGS-vs-ATM VERDICT: δ is MOSTLY an ATM-elbow / return-kurtosis knob, NOT a tradeable-wing knob.**
  (a) wing power-law EXPONENT γ is δ-INVARIANT (value∝S^(−γ) ∀δ) — δ does NOT re-slope the option wings.
  (b) δ-sensitivity peaks at ATM (Δslope≈2.3-2.8 at u≈0), decays into wings (≈0.003 at u=−3); far wing
  |u|≫δ is δ-invariant (√(δ²+v²)→|v|). (c) elbow curvature: δ=0.08→12.3, δ=10→0.30 (δ↓=sharp elbow).
  (d) wing reserve DEPTH moves OPPOSITE the naive reading: δ↑ (thinner Gaussian returns) leaves MORE
  depth at OTM (X/Nx at m=2: 0.034→0.220 as δ 0.08→3) via soft elbow. HONEST FINDING for operator: if
  "kurtosis knob" meant "fatten tradeable wings," δ does NOT do that (γ is the wing knob).
- **CORRECTED KURTOSIS: TRUE excess kurtosis SATURATES at 3 (Laplace, δ→0), →0 (Gaussian, δ→∞), monotone
  decreasing in δ.** 3/(δ·αh) is LARGE-δ asymptote ONLY. Numerics (βh=0,αh=4): δ=0.08→2.65, 0.3→1.69,
  1→0.70, 3→0.25, 10→0.075. Matches manager's δ=0.08,γ=2→2.76. exk∈[0,3].

### REPARAM DROP-IN SPEC — 2026-06-09 (spec for operator's separate impl session)
Note: `notes/REPARAM_balancer_kurtosis_dropin_2026-06-09.md` (NOW v2 — see reconcile pass above).
mpmath sanity checks (30-40 digit) run + reported. **KEY (load-bearing) findings:**
- Esscher tilt `f_{β+1}/f_β=e^v` is EXACT, INDEPENDENT of (αh,βh,δ) ⇒ value∝S^(−γ) survives freeing
  δ/βh (G4 stays green in form; reference value regenerates). d log(slope)/d log(price)=1 all cases.
- Balancer = βh=0 member: kernel EVEN in v (reflection-symmetric two-root); αh=γ+1=1/(1−w) EXACTLY
  (w=γ/(γ+1)) — Balancer is a relabel of the αh axis. "Unreachable" = the βh=1,δ=0.08 PIN, not family.
- **DIRECTION CORRECTION (brief was backwards):** excess kurtosis = 3/(δ·αh) at βh=0 ⇒ **δ↑ ⇒ THINNER
  tails (toward Gaussian); δ↓ ⇒ FATTER (Laplace at δ→0).** Gaussian limit is δ→∞ (kernel→exp(−αh v²/2δ)),
  NOT δ→0. δ→0=symmetric double-exponential (fattest). σ_eff²=ψ″(0)=δαh²/(αh²−βh²)^{3/2} reproduces
  prior 0.042→0.017 running at engine pins. βh=0 ⇒ ψ even ⇒ ψ(−γ)=ψ(+γ) (symmetric ± eigenfunctions).
- 4 curve fns: getMP_raw/arbitrageToOracle/tradeUpdate change only by keying tail/CDF/M on (αh,βh,δ)
  + threading ghBeta/ghDelta as serialized scalars + (βh,δ)-keyed CDF cache; Esscher slope structure
  + rebase are ORTHOGONAL/invariant. Keep direct-tail + same-table-inversion numerics.
- FORK: MINIMAL (free δ, keep βh=1) = tail knob on put leg, ZERO settlement change, kernel-const
  re-instantiation only. FULL (free δ AND βh=0) = symmetric Balancer recovered but DROPS proved
  put-only eigenfunction = settlement-semantics/economic-object change (operator-owned).
- **OPERATOR FLAGS:** (1) βh=0 eigenfunction/settlement change; (2) curve reopening even for MINIMAL;
  (3) knob label — δ is TAILS (and δ↑=thinner, brief backwards), βh is SKEW; (4) ship GH root
  ψ(−γ)=r (implicit/numeric), NOT Gaussian closed form γ(γ+1)=2r/σ² (δ→∞ slice only).
- NOT verified: FULL-fork βh=0 Lean re-proof magnitude / two-wing seam / small-δ tail-integral
  stability at table resolution — implementer regenerates gate reference values empirically.

---

_Earlier: 2026-06-09, MERTON-TIE RUN (perpetual-option formal tie + GH-maps discharge; SCRATCH-ONLY)._

### MERTON-TIE RUN — 2026-06-09 (operator highest-relevance; canonical tree UNTOUCHED)
2 standalone submits (throwaway copies; 5 canonical modules byte-identical both archives; pins v4.28.0).
Scratch `formal/aristotle_runs/{MERTON_tie,GHMaps}/`; IDs in `MERTON_SUBMISSION_IDS.txt`; prompts
`formal/prompts/aristotle_prompt_{merton_tie,ghmaps}.md`. Stage-0 sympy gate run FIRST (all confirmed).

1. **MERTON_tie (f1fd0e4b) — perpetual-option ⟺ info-geometry tie. proved (trusted-from-prover);
   GROUNDED (G1–G4) + CARRIED[2 Prop fields].** μ = the GH Laplace exponent `ψ(θ)=mθ+δ(√(α²−β²)−
   √(α²−(β+θ)²))` (engine pins α=γ+1,β=1,δ=0.08); γ = the characteristic root ψ(−γ)=r; S*=Kγ/(γ+1) =
   Merton smooth-pasting. 7 GROUNDED: put radicand=4γ (in-strip), call radicand=−(2γ+3) (OUT — the GH
   asymmetry: β=1 ⇒ GH natively carries ONLY put eigenfunction S^(−γ); the two-root sum=1 is a GAUSSIAN
   artifact, NOT a GH identity), `merton_vieta_sum`⇔r=q, `merton_vieta_prod`⇔γ(γ+1)=2r/σ² (Gaussian
   SLICE), `sigmaEff2_closed_form` (real HasDerivAt ψ''(0)=δα²/(α²−β²)^{3/2}), `gaussian_limit_quadratic`
   (real Tendsto), `Sstar_is_merton_boundary` (value+slope⇒S=Kγ/(γ+1)). CARRIED (structure:Prop, NOT
   axiom): `GHIsLaplaceExponent` (ψ=cgf w/ Bessel-K normalizer) + `GaussianLimitOfGH` (distributional
   limit). **3 EMEND flags (grind @72/99/117, no math) — manager harden on canonical build.** Audit
   PASS (sigs char-identical, byte-identical, axioms⊆std three).
2. **GHMaps (9e52bb1f) — CLOSEOUT-carried StrictAnti X / StrictMono Y DISCHARGED. proved (trusted-
   from-prover); GROUNDED, fully token-CLEAN.** Derived from `ghKernel_pos`+continuity via FTC-2 +
   deriv-sign criterion (NO Bessel-K). 9/9. After this run, ONLY the Bessel-K normalizer VALUE M=K_ν
   ratio stays carried — and it is NOT needed for any monotonicity/structural claim (only 0<Nx,0<NyM
   enter). 1 mechanical emend (`noncomputable ghKernel`). The frontier `AMMCurve` instance is now
   grounded down to the M-value alone. Audit PASS.

**σ-KNOB RECOMMENDATION (operator decision — FLAGGED, not decided):** γ(γ+1)=2r/σ² now grounded but it
is the GAUSSIAN slice; engine-pinned GH does NOT obey it exactly (σ_eff² varies 0.042→0.017 over γ).
RECOMMEND σ primary knob, γ/S* derived, δ fixed — but ship the GH σ→γ map (full exponent), NOT the
Gaussian closed form. UI-knob LABEL = operator's call. No settlement/economic-object question surfaced.

**RETENTION:** proposed consolidated provenance INDEX drafted at `formal/aristotle_runs/INDEX_DRAFT.md`
(result→meaning→depth→archive→status over all ~172 scattered theorems). NOT relocated to `formal/`
unilaterally — manager review. See return for the full retention assessment + fold proposal.

---

_Earlier: 2026-06-09, AIRTIGHT RUN (settlement-as-generated + single-μ core; SCRATCH-ONLY)._

### AIRTIGHT RUN — 2026-06-09 (operator BUILD-AUTHORIZED; canonical tree UNTOUCHED)
4 standalone submits (`import Mathlib`, throwaway copies; all 5 canonical modules byte-identical in
every returned archive). Scratch `formal/aristotle_runs/AIRTIGHT_{probe_optstop,T1a_invert,T1b_optimality,T2_singlecore}/`;
IDs in `AIRTIGHT_SUBMISSION_IDS.txt`; full table RESULTS.md AIRTIGHT section. Prompts
`formal/prompts/aristotle_prompt_airtight_*.md`. Audit: token-clean (the only search tactics WERE 2
`grind` in T1b GENERATED bodies + 1 pre-existing `aesop` helper = FRAGILE flags, axiom-clean — ALL
THREE NOW HARDENED 2026-06-09 via T1b HARDEN run 7dec6a1b, file CLEAN), unscoped byte-identical, pins
intact, axioms ⊆ {propext,Classical.choice,Quot.sound} all targets, math re-derived.

**PROBE (c9bd9638) — Mathlib v4.28.0 optimal-stopping CAPABILITY FINDING.** EXISTS: stoppedValue,
optional-stopping/-sampling, hitting times (`hittingBtwn`/`hittingAfter`; old `hitting` gone),
convexity-optimality toolkit (`IsMinOn.of_isLocalMin_of_convex_univ` etc.), rpow/mgf/cgf. **ABSENT:**
Snell envelope, optimal-stopping value/existence, variational inequality / obstacle problem,
free-boundary / smooth-pasting. ⇒ full "smooth-pasting = Snell optimal stopping time" NOT generatable;
the deterministic value-maximizing-boundary fragment IS (toolkit assembly).

1. **T1a (3566d93c) — SETTLEMENT BOUNDARY GENERATED (leak collapsed, algebraic). proved (trusted-
   from-prover); GROUNDED.** Inverted R1: `Sstar_{A,B}_forced`/`coeff{A,B}_forced` — from value+slope
   match at ARBITRARY S>0 (NOT assumed=S*), DERIVE S=Kγ/(γ+1)[call]/K(γ+1)/γ[put] + the coeffs.
   Slope via explicit deriv-eq WITH bridge lemmas `hasDerivAt_const_mul_rpow`/`_call`/`_put` proving
   it IS the HasDerivAt content (prompt-allowed). Continuation a·S^(−γ)=exp-family value law ⇒ boundary
   FROM the value law. NO search tactics (cleaner than R1). Both wings. PH-5 upgrades to "C¹ BECAUSE
   it's the uniquely-forced free boundary," not a checked coincidence.
2. **T1b (794363d3) — smooth-pasting = OPTIMAL EXERCISE. proved (trusted-from-prover); GENERATED
   (variational) + CARRIED (Snell).** 6 GENERATED theorems: `opt_boundary_is_critical_{A,B}`,
   `critical_iff_smoothfit_{A,B}` (S* UNIQUE critical pt), `opt_boundary_is_max_{A,B}` (S* GLOBAL MAX
   of holder's value-over-boundaries, via monotone-up/antitone-down each wing). CARRIED:
   `AmericanOptimalityPrinciple` = `structure : Prop` (NOT axiom) with `True` field = the Snell-envelope
   optimal-stopping identification Mathlib lacks. So optimality is generated at the variational/free-
   boundary level, carried at the stochastic optimal-stopping level. **2 FRAGILE FLAGS — RESOLVED
   2026-06-09 (T1b HARDEN, ID 7dec6a1b, proved/trusted-from-prover).** line 92 `grind +qlia`→
   `right; field_simp; ring`; line 145 `grind`→`exact ⟨(Sstar_A_pos hK (by linarith)).le, le_rfl⟩`;
   Aristotle ALSO hardened a pre-existing line-73 `aesop`→`exact Or.inl hB.ne'` I had missed. Audit:
   diff-vs-original = exactly those 3 tactic lines (no statement/struct/sig touched), token-scan ZERO
   search tactics, 5 siblings byte-identical, pins intact, axioms ⊆ standard three (3 concrete
   replacements can't regress the set). Clean archive `AIRTIGHT_T1b_optimality_clean/extracted/
   proj_clean_aristotle/`. File now CLEAN. Summary's "removed hK≠0" line = STALE carried text (no real
   sig change). Manager to fold over the T1b archive.
3. **T2 (84a6a417) — SINGLE-μ CORE ("singular, not federation"). proved (trusted-from-prover);
   GROUNDED. Type-checks as ONE object off c.μ.** `structure MetriplecticCore` with ONE field μ
   (+hμ C², +hconvex μ″≥0 = single metric source). All primitives `def`s of c.μ: price=∇μ,
   Rdissip=∇²μ=Fisher, valueMetric=1/μ″ (Legendre dual), trade=translation, sNorm. 8/8 theorems incl
   headline `single_source` (c.μ=d.μ ⇒ all readings agree = type-level federation-collapse). NO search
   tactics. **SCOPE CAVEAT (Aristotle-reported, not audit fail):** `omega` is the trivial 1-D skew form
   (v*w−w*v≡0; unique skew form on ℝ¹ is 0) — symplectic reading degenerate in the 1-D gauge coord
   (consistent w/ Kähler-CONJECTURAL 1-real-dim finding). price/R/valueMetric/single_source = real content.

**AIRTIGHT verdict (distilled):** Settlement now GENERATED (algebraic leak collapsed, T1a). Optimality
PARTIAL-honest (variational GENERATED, Snell CARRIED, T1b). Single-μ core BUILT + type-checks as one
object (T2), ω trivial in 1-D. Kähler/Courant stay OUT-OF-CORE (proved obstruction / Mathlib gap from
CLOSEOUT) — excision justified; flag to manager for the doc. |Γ|≤1 exact / |Γ|>1 labelled-approx
(locked, not re-litigated). Funding/κ status quo. NOTHING upgraded to "verified" (env-blocked). No
economic-object/settlement-semantics question surfaced (T1a/T1b stayed within the locked American
boundary); no guardrail tripped.

---

### CLOSEOUT RUN — 2026-06-09 (operator: "spam Aristotle"; canonical tree UNTOUCHED)

### CLOSEOUT RUN — 2026-06-09 (operator: "spam Aristotle"; canonical tree UNTOUCHED)
5 standalone submits (`import Mathlib` only → no canonical module imported → byte-identity trivial).
Scratch `formal/aristotle_runs/CLOSEOUT_{cgf,GHmeasure,frontier,kahler,courant}/`; IDs in
`CLOSEOUT_SUBMISSION_IDS.txt`; full table RESULTS.md CLOSEOUT section. Audit: token-clean (the only
`sorry` is the ONE declared Kähler-K3 gap; all other forbidden/search-tactic grep hits are in
comments), statement-line diffs character-identical submit-vs-return, math re-derived.

1. **cgf_convexOn HARDEN → proved (trusted-from-prover); the one open UNIFY2 HOLD is CLOSED.**
   `exact?`→`convex_integrableExpSet.interior`; `grind +suggestions`→`(analyticAt_cgf ht).deriv.
   differentiableAt`. NO search tactic in returned proof; statement unchanged; variance core kept.
2. **GH integrability/finite-MGF DISCHARGED → "carried" REMOVED for integrability + probability-
   measure + finite-MGF.** From `ghKernel_exponent_le` (kernel≤exp(−c|v|), c=αh−|βh|>0): T2 `exp(−c|v|)`
   integrable; T3 `Integrable ghKernel`; T4 `0<∫`; T5 `IsProbabilityMeasure ghProb` (withDensity,
   normalized, via `ofReal_integral_eq_lintegral_ofReal`+`div_self`); T6 finite MGF on strip |βh+t|<αh
   (`exp(t·v)·ghKernel βh = ghKernel(βh+t)`). **NO Bessel-K, NO numeric Z used** — the closed-form
   normalizer VALUE is NOT NEEDED for any structural claim. GH measure is now a genuine probability
   measure with finite MGF over the REAL kernel, not a carried hypothesis. ghKernel + bound kept exactly.
3. **frontier antitone_y/convex_y → GROUNDED from slope law; CARRIED[StrictAnti X, StrictMono Y,
   chain hderiv/hmono].** Slope `g=k·e^(u−μ)` strict-mono+convex grounded; frontier antitone/convex
   FOLLOW once the (carried, NOT discharged) monotone reserve-coordinate maps X(u),Y(u) + chain are
   supplied. The carried maps are exactly where GH tail/CDF (Bessel-K-adjacent) still bottoms out.
4. **Kähler integrability → K1,K2 GROUNDED; K3 STILL-OPEN (Kähler stays CONJECTURAL).** dω=0
   (`hasDerivAt_const`), const-J Nijenhuis (`mul_zero`) clean. Variable-J(s) integrability = SINGLE
   named `sorry` + precise Mathlib-gap report: v4.28.0 has NO AlmostComplexStructure/NijenhuisTensor/
   Newlander–Nirenberg/Kähler-manifold infra → cannot even STATE it. NOT faked. Needs upstream Mathlib.
5. **Courant all-four → PROVED OBSTRUCTION (no-go); single all-four-native bracket SPECULATIVE-NOT-
   ACHIEVED (now with a proved reason).** Pairing on graph(A)=(Av)·w+(Aw)·v ⇒ isotropic⇔A skew;
   graph(J) isotropic (Dirac, recovers RUN-4); graph(J−R) with R≠0 NOT isotropic (=−2(Rv)·w) ⇒ no
   single maximal-isotropic Dirac bracket carries dissipation R (conservative + resistive = different
   slots). Mathlib has no Courant/Leibniz-algebroid type ⇒ the non-isotropic all-four object NOT built.

**TRUE REMAINING FLOOR after CLOSEOUT** (what genuinely stays open / carried):
- GH structural measure theory: **DISCHARGED** (item 2). Only the Bessel-K closed-form normalizer
  VALUE remains unformalized — and it is NOT needed for any structural claim (prob-measure + finite
  MGF + cgf machinery all hold without it). STILL-OPEN only if someone needs the explicit M = K_ν ratio
  number (needs Bessel-K formalized upstream in Mathlib — do not fake).
- GH **AntitoneOn/ConvexOn AMMCurve instance**: GROUNDED modulo the carried monotone coordinate maps
  X(u),Y(u) (the GH tail T / CDF C). Those maps need the GH special functions (Bessel-K-adjacent) — the
  residual carried content, NOT discharged.
- **Kähler integrability**: CONJECTURAL — Mathlib lacks a.c.s./Nijenhuis/Newlander–Nirenberg (upstream).
- **Courant all-four single bracket**: SPECULATIVE — the no-go is proved (R breaks isotropy); the
  Leibniz/Courant-algebroid object that would hold all four is not a Dirac structure and has no Mathlib type.
- Untouched/excluded (unchanged): B1 real solvency floor (κ extrinsic, operator ship-gate); C3
  spec↔engine link (engine-faithfulness pivot, not this run); "verified" label (env-blocked — all
  CLOSEOUT verdicts are trusted-from-prover, NOT verified).

**PROVENANCE CAVEAT for manager:** the cgf archive embeds no `#print axioms` command (the other 4 do).
Axiom-cleanliness for all 5 is per Aristotle's SUMMARY ({propext,Classical.choice,Quot.sound}); the
canonical-env build is where `#print axioms` gets independently reproduced — and where Kähler-K3's
`gh_J_integrable` will (correctly) show `sorryAx`, since it is the one declared-open theorem, not a
claimed proof. No economic-object/settlement question surfaced; no guardrail tripped.

---
_Earlier: 2026-06-09, RUN 4 (UNIFY2: REPLACE the tautological scaffold with REAL theorems; Tier-2 frontier; C3 axiom discharged)._

### RUN 4 — 2026-06-09 (operator BUILD-AUTHORIZED; SCRATCH-ONLY, canonical tree UNTOUCHED)
**Mission: push unification toward 100% by replacing RUN-3 UNIFY's trivial A1/A2/A3/B2/C1 with real
content.** 5 submits, ALL audit-passed → **proved (trusted-from-prover)**. Scratch dirs:
`formal/aristotle_runs/{UNIFY2,C3_reflection,Kahler,Courant}/`; canonical `formal/temporal_lean_verified/`
NOT touched. IDs in `formal/aristotle_runs/UNIFY2/SUBMISSION_IDS.txt`; full ledger RESULTS.md RUN-4.

**STAGE-0 capability finding (probe 0f0a8f0a, Mathlib v4.28.0):** Bessel-K `K_ν` **NOT in Mathlib**
(zero decls) → GH normalizing constant MUST be CARRIED. BUT `ProbabilityTheory.mgf`/`cgf`/
`hasDerivAt_mgf`/`deriv_mgf`/`deriv_cgf`/`iteratedDeriv_mgf`/`iteratedDeriv_two_cgf_eq_integral`,
`Measure.withDensity`→`IsProbabilityMeasure` (3 lines), and `hasDerivAt_integral_of_dominated_…` ALL
EXIST and GROUNDED. So the exp-family/cgf identities are groundable over the REAL integral cgf; only
the GH integrability-finiteness + Bessel-K normalization stay carried. This validated UNIFY2's design.

**UNIFY2 (fac1d6e2) — TAUTOLOGY REPLACED, 10/10 proved.** A1→`cgf_deriv_mean_and_variance`
(`HasDerivAt(cgf)=(∫X·exp)/mgf`, real); A4→`cgf_convexOn` (`cgf''=∫(X−mean)²·exp/mgf≥0`, real
variance-nonneg/Fisher-PSD); A2/A3→`mgf_pos`+`ghKernel_logderiv`+`ghKernel_exponent_le` (real
`0<mgf`, real GH log-deriv `βh−αh·v/√(δ²+v²)`, real integrability bound via `Real.abs_le_sqrt`);
B2→`deg2_score_centered` (real mean-of-tilt, NOT `R·0=0`); C1→`boost_is_hamiltonian` (real
`HasDerivAt(½gs²)=g·s`); B1 deg1 = real Bregman gradient. **#3 (GENERIC degeneracies over real
boost/KL/Fisher) folded here.** GROUNDED: exp-family/cgf structure + GH kernel facts (re-derived
numerically: cgf'=mean, cgf''=var≥0 at γ=3). CARRIED[named]: GH finite-MGF on strip + Bessel-K
normalization (∫=1) — Mathlib lacks Bessel-K. Audit: token-clean, out-of-scope byte-identical, sigs
character-identical, axioms⊆{propext,Classical.choice,Quot.sound} all 10, NO weakening, NO
could-not-close. **2 EMEND FLAGS (manager harden on canonical build, NOT audit failures):**
`cgf_convexOn` line 93 `exact?` (integrableExpSet convexity lemma) + line 99 `grind +suggestions`
(cgf analyticity). One allowed proof-only emend (sNorm tactic, 4.28.0 compat). NOT "verified".

**C3 (303c3de0) — REFLECTION AXIOM DISCHARGED.** `reflection_arrow: markPut θ s = markCall θ(θ²/s)`
+ symmetric corollary PROVED over the spec mark defs (crux `θ²/s<θ ↔ θ<s` via `div_lt_iff₀`). C3
no-arb NO LONGER rests on an axiom. CAVEAT: holds GIVEN the modeling identification "put = reflected
call" — now itself a proved algebraic identity, not an assumption (modulo spec-mark = engine-barrier).
Re-derived numerically (2000 pts exact). Audit clean (3 grep hits=comments; `+decide`=kernel decide;
allowed `/-- -/`→`/- -/` emend). axioms⊆standard three.

**Kähler (Tier-2 #4, dae504d8) — algebraic GROUNDED; integrability CONJECTURAL.** LOAD-BEARING
FINDING: GH interior is 1-REAL-DIM → no complex structure (J²=−1 needs even dim); the well-posed
object is the 2D phase-space Hessian metric. PROVED there: J²=−I, G·J=−ω, ω skew, det ω=1≠0, metric
posdiag — the algebraic Kähler-triple compatibility (UPGRADES RUN-3 C1 `g·w=g·w`). NOT proved:
differential integrability (Nijenhuis/dω=0) → "GH Hessian is Kähler" stays **CONJECTURAL** for the
analytic remainder. Audit clean, sigs identical, axioms⊆standard three, no sign adjustment.

**Courant (Tier-2 #5, b4d4656d) — conservative part GROUNDED; all-four SPECULATIVE-NOT-ACHIEVED.**
PROVED: graph of ω is a maximal isotropic for the Courant pairing (`graph_isotropic` via ω-skew) +
symmetry + injectivity → the symplectic structure IS a linear Dirac structure (single TM⊕T*M object).
**NOT achieved (reported, NOT asserted):** folding R + ports into the SAME bracket (Dirac=isotropic/
conservative; R breaks isotropy). All-four-native single bracket stays **SPECULATIVE** (Scope Lock).
Audit clean.

**RUN-4 escalations / flags for manager (do not over-promote):**
1. UNIFY2 is GROUNDED for the exp-family/cgf STRUCTURE, CARRIED for the GH normalization (Bessel-K
   absent from Mathlib). Real theorem, NOT a tautology, NOT fully GH-closed. State both halves.
2. UNIFY2 two EMEND flags (`exact?` line 93, `grind +suggestions` line 99 in `cgf_convexOn`) — harden
   to concrete lemmas on the canonical build.
3. Kähler is ALGEBRAIC compatibility only; integrability CONJECTURAL; 1D interior has NO Kähler.
4. Courant all-four single-bracket = SPECULATIVE-NOT-ACHIEVED (only the symplectic Dirac part done).
5. C3 axiom discharged MODULO spec-mark=engine-barrier identification (now a proved identity, but the
   spec↔engine link is the residual assumption). Solvency/B1 untouched (EXCLUDED, not targeted). No
   SDE introduced. GHJ latent-group economic-object finding unchanged.

---
_Earlier: 2026-06-09, RUN 3._

# MEMORY — research-lead (RUN 3 header retained below)
_RUN 3 (UNIFY: ONE metriplectic/Hessian structure; Stage-0 sympy gate + 1 Lean file)._

### RUN 3 — 2026-06-09 (operator-greenlit UNIFY; SCRATCH-ONLY, canonical tree UNTOUCHED)
**STAGE 0 sympy GATE PASSED (make-or-break, run FIRST).** Scripts durable: `formal/aristotle_runs/
UNIFY_stage0/`. (0.1) **M=Fisher HOLDS** — the dissipation/slope-deviation 2nd-order form = Fisher ∇²μ
of the GH exp family, **in the natural/centered coordinate s=v=u−μ** (`dMean/dNat=Var=Ψ″`, ~1e-14).
HONEST CAVEAT: in **raw log-price u** the dissipation curvature is e^u, **NOT** Fisher — so M=Fisher is
the STANDARD Bregman/exp-family identity in the GAUGE coordinate (Scope Lock 1), not a raw-u identity.
Single convex Ψ generates Esscher/price (grad), Legendre/symplectic (`V″=1/Ψ″`), dissipation Hessian
(Ψ″=Fisher). (0.2) **GENERIC degeneracies HOLD** — deg1 `d/ds KL=(s−s₀)Ψ″→0` at operating tilt; deg2
Fisher annihilates the centered-score/charge direction. (0.3) **Rebase-cov HOLDS** in sNorm (boost
u→u+log r cancelled by P→P/r). Did NOT need the fallback.

**STAGE 1 = UNIFY/Unify.lean (ID a2b3003a) — proved (trusted-from-prover).** 11/11 theorems, 5 blocks
A–E. Audit PASSED: `grep -rnE` token-scan clean (no sorry/admit/native_decide/sorryAx/opaque/unsafe/
axiom in returned .lean), axioms ⊆ {propext,Classical.choice,Quot.sound} all 11, out-of-scope files
byte-identical, pin v4.28.0, all theorem SIGNATURE lines character-identical submit-vs-return (only
sorry→proof bodies). One ALLOWED emend: B1 docstring `/-- -/`→`/- -/` (comment-only reformatting, no
math). Math re-derived (B1 `(s−s₀)Ψ″` non-vacuous; A1 = structural mean=grad/Fisher=Hess, GH integral
content carried by Stage-0 gate). NOT upgraded to "verified" (manager's label).

**Honest scope per block (over-promotion guard):** A (STANDARD exp-family; A1 structural, GH integral =
Stage-0 gate) · B (STANDARD; B2 = `mul_zero` structural encoding of score-centered) · C (boost-is-Ham-
flow STANDARD, but **Kähler interior = CONJECTURAL, NOT asserted** — only the symplectic=Kähler-ω
relation encoded) · D (STANDARD/GROUNDED, reuses PH-6 sNorm) · E (port NECESSARY only, NEVER suff; B1
extrinsic). **EXPLICITLY NOT CLAIMED:** single Courant/double-bracket all-four-native object
(SPECULATIVE). **4 flags for manager** (M=Fisher coord-conditional; Kähler conjectural; A1/B2 structural;
port/solvency/Courant unchanged) — full detail RESULTS.md RUN-3. archive: formal/aristotle_runs/UNIFY/.

---
_Earlier: 2026-06-09, RUN 2._

### RUN 2 — 2026-06-09 (operator-greenlit; SCRATCH-ONLY, canonical tree UNTOUCHED)
**Constraint honored:** all 5 obligations are STANDALONE `formal/aristotle_runs/<name>/<File>.lean`
importing canonical modules; the canonical `formal/temporal_lean_verified/` tree was NOT modified
(manager doing separate local build there). Submit-projects were throwaway copies (now deleted).
All 5 returned archives: canonical modules BYTE-IDENTICAL, pin v4.28.0, axioms ⊆ standard three,
token-clean (3 grep hits were COMMENTS), signatures character-identical submit-vs-return, math
re-derived. **5/5 proved (trusted-from-prover).** NONE upgraded to "verified" (manager's label).
IDs: CTPH_clean a33560b3 · GHJ_grounded 1c0f0a46 · GHcoercive_grounded 02c2e575 · PH4b_grounded
f19b24c7 · PH3_grounded 9c66598c. Full detail in formal/aristotle_runs/RESULTS.md (RUN 2 section).

- **Track 1 CTPH — CLEAN NOW + STRENGTHENED.** Prior `exact?` fragility flag RESOLVED:
  `ct_dissipation_ineq` uses concrete `skew_quadForm_zero hJ z` (no search tactic in source). Added a
  TIGHT discrete↔continuous link (`sampled_dissip_nonneg`/`sampled_increment`/`sampled_passivity`)
  replacing the near-vacuous existential: forward-Euler sampled storage, dissipation DERIVED ≥0 from
  R PSD, exact per-tick balance ΔH=supplied−dissipated, telescoped to the integrated bound. HONEST
  LIMIT: does NOT instantiate the floor-bearing PassiveSystem (no general floor = B1, external); link
  stated on sampled storage directly. archive: formal/aristotle_runs/CTPH_clean/.
- **Track 2 GHJ_grounded — ⚠ ECONOMIC-OBJECT FINDING (ESCALATED, not patched).** GH conserves NO
  clean ALGEBRAIC X·Y-style invariant (numerically: X·Y spans orders of magnitude along the frontier).
  Did NOT fabricate/weaken to manufacture one. DERIVED from the actual closed-form densities instead:
  Esscher tilt `f_{β+1}=e^v·f_β` (exact, sympy-checked), density ratio `=e^v`, GH slope law
  `slope=(Ny·M/Nx)·e^(u−μ)=getMP_raw·e^(−μ)`, trade=latent translation scaling slope by e^δ. Conserved
  object = latent one-parameter group + Esscher tilt, NOT a product invariant. Relay to operator as a
  characterization. archive: formal/aristotle_runs/GHJ_grounded/.
- **Track 2 GHcoercive_grounded / PH4b_grounded — PARTIAL grounding.** X∈(0,Nx), Y∈(0,Ny·M), y≥0,
  poolValue-bounded-above all now DERIVED from `0<T<1` (tail prob) / `0<C<1` (CDF) + Nx,Ny,M>0 —
  replacing opaque `0≤y` / `∃B,V≤B`. SCOPE: the T<1/C<1 facts are still CARRIED hypotheses (= the
  defining property of a probability tail/CDF, the GH content), NOT the GH special-function tables
  formalized. Full GH AMMCurve instance (antitone_y/convex_y from GH special functions) still OPEN —
  the big lift. PH4b necessary-not-sufficient PRESERVED. archives: GHcoercive_grounded/, PH4b_grounded/.
- **Track 2 PH3_grounded — GROUNDED (curve closed-form).** GH arb-leak ≥0 DERIVED from the engine's
  actual slope law g(u)=k·e^(u−μ): strict-mono (convexity) ⇒ leak density ≥0 ⇒ `∫(g(u₂)−g(u))du≥0`
  (LVR one-way). NOT an abstract PSD matrix. Necessary-not-sufficient PRESERVED (does NOT close B1).
  archive: formal/aristotle_runs/PH3_grounded/.
- **Unchanged guardrails honored:** B1 real floor stays operator ship-gate (no fabricated floor); C3
  reflection still an axiom (untouched); no SDE/stochastic content introduced.

---
_Earlier: 2026-06-08, BIG AUTONOMOUS RUN (14 obligations submitted to Aristotle)._

### BIG RUN 2026-06-08 (live) — 14 obligations submitted; auth + ledger durable
**AUTH (CRITICAL, CHANGED):** `ARISTOTLE_API_KEY` now reads BARE (length 49, starts `a…`, no `<>`).
Pass it **VERBATIM** — do NOT strip. (The old 51-char `<…>` wrap is gone; the strip-the-brackets
pattern in the old memory below is STALE for this container.) Auth confirmed by live submit+list.
Host `aristotle.harmonic.fun` UNBLOCKED. `--wait` blocks a long time (mathlib build server-side, ~9-17
min for smoke, longer for real); I submit WITHOUT `--wait`, capture project IDs, poll via `list`,
download finished archives, audit. CLI: `uvx --from aristotlelib aristotle ...` (PATH=/root/.local/bin).

**DURABILITY:** `formal/aristotle_runs/RESULTS.md` = running ledger (submission map + verdicts).
Archives → `formal/aristotle_runs/<name>/`. Prompts → `formal/prompts/aristotle_prompt_*.md`.
Project IDs + name map in /tmp/our_ids.txt, /tmp/id_names.txt (ephemeral; the durable copy is RESULTS.md).

**14 SUBMITTED (all stated as sorry-scaffolds for Aristotle to fill; math re-derived by me first):**
T1: R3 (mpGeom pin, ba84270a), R1 (PH-5 C¹ both wings θ=sNorm(K), e05ff5b5).
T2: R2 (crossover-at-K, f9faee69), GHJ (skew-J latent boost, 5d64284d), GHcoercive (8f55b116).
T3: R4 (orientation, 3674c141), PH3 (R⪰0 PSD, 1856bfb7).
T4: CTPH (continuous-time PH bridge / Q1, c5ba7851), PH6 (rebase J,R, 013d105b), C1 (composite-ray ITM,
51216401), C2 (collar w=½, 87a2150f), R5 (slippage basis-indep, 0b69e494), PH4b (no-floor GH-analogue,
20c5a137).
**GH-J WATCH-FLAG status:** NOT tripped — GH DOES conserve a clean invariant (the latent
parametrization / frontier; trade = latent translation u↦u+δ, one-parameter group). Stated honestly as
skew-J, not X·Y. If proving reveals no clean invariant → escalate (not expected).
**PH-5 SPEC RE-PIN done (notation/coverage only):** SPEC_itm line 15 θ=K/oracle→θ=sNorm(K) (value
boundary); port_hamiltonian_consistency.md PH-5 section gets the θ=sNorm(K) + two-branch note. Funding/
oracle layer-1 reference (SPEC_itm line 47, θ=K/oracle) LEFT price-measure (locked) — NOT touched.
**NOT submitted (stay escalation):** B1 real floor (κ extrinsic — but the CONDITIONAL structure WAS
submitted, honest), C3 reflection axiom, stochastic SDE bridge.

### VERDICTS (COMPLETE; full table in formal/aristotle_runs/RESULTS.md) — 14/14 audited, ALL proved
**ALL 14 = proved (trusted-from-prover), audit-passed** (token-clean, axioms ⊆ propext/Classical.choice/
Quot.sound, unscoped modules byte-identical where imported, pin v4.28.0, math independently re-derived):
R3, R1 (PH-5 both wings — LOAD-BEARING), R2, GHJ, GHcoercive, R4, PH3, PH6, C1, C2, R5, PH4b, B1, CTPH.
ZERO counterexamples, ZERO candidate-fails-audit, ZERO still-open.
**WATCH-FLAG (GH-J):** NOT tripped — GH conserves a clean invariant (latent one-parameter group);
genuine skew-J. frontier_preserved is true-but-near-tautological (scope note, not a weakening).
**3 FLAGS for manager/operator (do not over-promote):**
1. **CTPH emendation** — `ct_dissipation_ineq` left `exact?` (search tactic) in source; compiled
   server-side but fragile. Proposed no-math fix `exact skew_quadForm_zero hJ z` saved at
   `formal/aristotle_runs/CTPH/CTPH_emended_PROPOSED.lean` (NOT locally re-verified — manager apply+build).
2. **C2 scope** — collarSurplus MODELLED as θ·((1−w)/w−1); engine's exact closed form not in accessible
   specs. Proven content = symmetry-iff. Confirm closed form before literal-invariant claim.
3. **B1/PH-3/PH-4b necessary-not-sufficient** — do NOT close real solvency; κ-coverage stays EXTRINSIC
   = operator ship-gate. B1 proves only the conditional structure (coverage carried, never discharged).
**Provenance:** all "trusted-from-prover" (Aristotle's kernel ran, ours didn't). Manager may upgrade to
"verified" by building canonically. NONE upgraded by me. Archives under formal/aristotle_runs/<name>/.


### THIS PASS (2026-06-08, provenance-label sync after the operator's no-local-re-verify clarification)
Recap memo + label reconciliation. Verified my owned PH docs already comply with the process update
(`notes/PH_RECAP_2026-06-08.md`, `specs/port_hamiltonian_consistency.md`, this MEMORY) — they retired
PENDING-LEAN and use `trusted-from-prover` correctly. Synced the two research-lead-owned AUDIT
artifacts that still carried stale "proved + re-verified" / local-`lake build`-gate framing:
`formal/smoke/README.md` (now: server compile IS the build; verdict labels = proved (trusted-from-
prover) / counterexample; SMOKE STATUS folded in) and `formal/MANAGER_VERIFICATION.md` (§0/§1/§5
reframed: the canonical-env build is a **label upgrade to "verified"**, not a trust-removal of an
unbuilt sketch). NOT touched (out of my scope — manager owns them): `.claude/agent-memory/manager/
MEMORY.md`, `.claude/agents/research-lead.md`, `docs/routines/aristotle_ph_loop.md` — these still say
"local re-verify / proved+re-verified / PENDING-LEAN" and are STALE vs the process update.
**ESCALATION to manager:** those three manager-owned docs need the same PENDING-LEAN→trusted-from-prover
/ drop-local-re-verify-gate edit; I cannot edit them (manager-owned). No engine/git actions taken; no
new heavy submit run (recap only, per task constraint).

## Role (UPDATED — I am my own prover interface; no courier)
I am the **theory owner AND my own prover interface**: I decide what to prove, structure the Lean, own
the PH-scaffold reasoning, phrase obligations, **submit to Harmonic's Aristotle myself via the
aristotlelib CLI**, audit returned candidates, emend mechanical backend diffs, and interpret verdicts.
The standalone `aristotle` peer agent is **GONE** — its job is folded into me. Flow is now direct:
me → `aristotle submit` → poll → **zero-cost artifact audit** → one verdict → I interpret.
**All raw prover/poll output stays in MY context.** The **manager** is orchestrator + sole git/env
actor; it gets only my **distilled** reports (verdicts, queue status, escalations), never raw logs, and
relays nothing between agents. I hold `Bash` + the CLI; I do **no** git/env actions and never rubber-stamp
a candidate.

### PROCESS UPDATE (operator, 2026-06-08) — no local re-verify gate; Aristotle's server compile IS the build
Operator clarified: **Aristotle actually compiles/builds at its end, in the matching toolchain (Lean
4.28.0 / Mathlib v4.28.0).** Consequences, applied throughout this memory:
- **DROP the PENDING-LEAN framing as a blocker.** A returned candidate Aristotle compiled is a genuine
  compiled proof, not a sketch. Do NOT park results in PENDING-LEAN limbo, and do NOT use the
  PENDING-LEAN label anymore. The absence of a local lean/lake toolchain in this container is no longer
  a verdict-blocker.
- **No local `lake build` re-verify is required as a gate.** The manager may still build in the
  canonical env later; that's a label upgrade, not a gate I owe.
- **KEEP the zero-cost artifact audit** on every returned archive (needs no toolchain): (1) token-scan
  (`sorry`/`admit`/real `axiom` decls/`native_decide`/`sorryAx`/`opaque`/`unsafe`; kernel `decide` ok),
  (2) read Aristotle's own `#print axioms` — must be ONLY `propext`/`Classical.choice`/`Quot.sound`,
  (3) diff every unscoped module byte-for-byte to confirm no statement was weakened / no false hypothesis
  added, (4) re-derive the math (Lean validity ≠ intended claim). **A clean server build can still be a
  clean proof of a WEAKENED statement — the audit is what catches that, so it stays mandatory.**
- **LABEL:** a returned, server-compiled, clean-axiom, audited candidate = **trusted-from-prover**
  (Aristotle's kernel ran, ours didn't). NOT "verified" (that's the operator's word to grant later),
  NOT PENDING-LEAN.

## Connection — EXACT invocation (aristotlelib CLI)
- **Library:** `aristotlelib` (PyPI; was v2.0.0). Console script: `aristotle`. Host
  `aristotle.harmonic.fun`. Auth: `ARISTOTLE_API_KEY` env var (set in this env, len 51).
- **Run without persistent install (preferred):** `uvx --from aristotlelib aristotle <verb> ...`
  (uvx present at /root/.local/bin/uvx). Fallback: `pip install aristotlelib` then `aristotle <verb>`.
- **Submit an obligation (fill sorries in a Lean project):**
  ```
  aristotle submit "<my instructions>" \
    --project-dir formal/temporal_lean_verified \
    --wait --destination /tmp/aristotle_out.tar.gz
  ```
  (`--wait` polls to completion; `--destination` saves the solution dir/tar. Without `--wait`, use
  `aristotle list` / `show <id>` / `download <id> --destination …` / `tasks` / `cancel <id>`.)
- **Formalize NL/TeX → Lean:** `aristotle formalize <file> --wait --destination <out.tar.gz>`.
- **Verbs:** submit · formalize · list · show · download · cancel · tasks · ask.
- No official Harmonic **MCP** package exists → **no `.mcp.json`** path. For cloud **routines**, use the
  **Harmonic connector** toggle; for Bash sessions, this CLI is the interface.

## Zero-cost artifact audit (non-negotiable gate — I never rubber-stamp; needs NO toolchain)
_Aristotle's server compile is the build (operator, 2026-06-08), so there's no local `lake build` step.
The audit below is what I still owe — it catches a clean build of a WEAKENED statement, which a green
compile alone never would._
1. Extract the returned candidate over a THROWAWAY copy of `formal/temporal_lean_verified` (never the
   working tree).
2. Confirm `lean-toolchain` = `leanprover/lean4:v4.28.0` and lakefile mathlib `rev = v4.28.0` UNCHANGED
   in the returned archive (Aristotle built against these; an altered pin is a red flag).
3. Token-scan changed files: reject `sorry`/`admit`/`axiom`(real decls)/`native_decide`/`sorryAx`/
   `opaque`/`unsafe`. Kernel `decide` OK. Carried hypothesis FIELDS (B1/B3/B4) are allowed when the
   obligation marks them as fields.
4. Read Aristotle's own `#print axioms <thm>` for each target — must show ONLY `propext`,
   `Classical.choice`, `Quot.sound` (a `sorryAx` fails). (`ARISTOTLE_SUMMARY.md` reports these.)
5. Diff every module I did NOT scope as changed — must be byte-identical (no silent statement edits /
   weakened hypotheses / added false hypothesis). An unexplained out-of-scope diff is a bounce.
6. Re-derive the math independently and confirm the Lean statement is the INTENDED statement —
   Lean validity ≠ intended claim. This is the step that catches a clean proof of a weakened goal.

## Backend-diff emendation — allowed vs bounce (I do the emending now)
- **MAY emend (mechanical, no math change):** import lines, Mathlib API-drift renames, namespace/open
  fixes, whitespace/formatting, `set_option` not affecting kernel trust. Record every emendation.
- **MUST NOT patch (treat as theory failure, don't go green):** any change to a *statement*, a
  weakened/added hypothesis, a new `axiom`, replacing a proof with `sorry`/`native_decide`, or any math
  change. A candidate that only passes after a forbidden change = `candidate-fails-audit`.

## The four verdicts (exactly one per obligation; distilled to manager)
- **proved (trusted-from-prover)** — Aristotle compiled it server-side (matching toolchain) AND it
  passed the zero-cost artifact audit (clean tokens, axioms ⊆ propext/Classical.choice/Quot.sound,
  no out-of-scope diff, statement is the intended one). Trusted-from-prover (Aristotle's kernel ran,
  ours didn't); the manager may later upgrade to "verified" by building in the canonical env. Attach
  proof for folding. (Was "proved + re-verified" — the local re-verify gate is dropped; the audit is
  the gate.)
- **counterexample** — Aristotle refuted it. Relay verbatim; repairing the statement is MY call.
- **still-open** — no proof / timeout / partial. Record furthest state + blocker.
- **candidate-fails-audit** — host reports proved but the artifact audit fails (dirty axioms/`sorryAx`,
  forbidden token, altered toolchain pin, out-of-scope statement weakening, or only "passes" via a
  forbidden emendation). Record the failing diagnostic. (Was `candidate-fails-local-recheck`; renamed —
  the failure is now an audit failure, not a local-build failure.)

## ⛔ Connection / toolchain status (live) — SMOKE-TESTED 2026-06-08
- Host `aristotle.harmonic.fun`: **UNBLOCKED — CONFIRMED with a real round-trip** (no more
  `403 host_not_allowed`; both smoke lemmas submitted, ran, and returned archives). The old network
  allowlist block is gone.
- **API-KEY (live, 2026-06-08 big run):** `$ARISTOTLE_API_KEY` now reads **BARE (len 49, starts `a…`,
  no `<>`)** — pass it **VERBATIM**, the CLI picks it up from the env var (no `--api-key` needed, no
  strip). Auth confirmed by live submit+list. **STALE (prior container):** the key used to be wrapped
  `<arstl…H24>` (len 51) needing a `<>`-strip; that wrap is GONE here. Robust detect: if len==51 and
  starts `<`, strip; if len==49, pass verbatim. Do NOT strip a len-49 bare key (would corrupt it).
- **EXACT WORKING INVOCATION (verified):**
  `export PATH="/root/.local/bin:$PATH"` then
  `uvx --from aristotlelib aristotle submit "<instructions>" --project-dir <dir> --api-key "$STRIPPED" --wait --destination <out>`
  CLI = aristotlelib **2.0.0**; verbs: submit · ask · formalize · download · list · show · tasks · cancel.
  `--destination` writes a **gzip tar** (`tar -xzf`), containing `<name>_aristotle/` with the .lean,
  `lakefile.toml`, `lean-toolchain` (= `leanprover/lean4:v4.28.0`, matches canonical), `lake-manifest.json`,
  `README.md`, `ARISTOTLE_SUMMARY.md`. Poll/inspect a task: `aristotle show <project_id> --api-key … --limit 0`.
- No `lean`/`lake`/`elan` toolchain in this container → **but this is no longer a blocker** (operator,
  2026-06-08): Aristotle compiles server-side in the matching toolchain, so the returned candidate IS a
  compiled proof. I do NOT owe a local `lake build`. What I DO owe is the **zero-cost artifact audit**
  (token-scan + read Aristotle's `#print axioms` + unscoped-module diff + math re-derivation) — none of
  which needs a toolchain. A clean, audited candidate is reported **trusted-from-prover** (NOT
  PENDING-LEAN). The PENDING-LEAN label is retired.

## Toolchain / where the Lean lives
- **Lean 4.28.0 + Mathlib v4.28.0** (match `formal/temporal_lean_verified/lean-toolchain`).
  Lakefile `formal/temporal_lean_verified/lakefile.toml`, lib `RequestProject`.
- Modules: `formal/temporal_lean_verified/RequestProject/` — `Temporal.lean` (passivity core,
  = the §1-§4 PH file mirrored in the PH prompt), `AMMCurve.lean` (curve validity gate + short-gamma
  bridge), `Seam.lean` (pool value → value layer → passivity storage; hosts `reserves_have_no_floor`),
  `Audit.lean`, `Main.lean`. Audit template: `formal/MANAGER_VERIFICATION.md`.
  Aristotle prompt templates: `formal/prompts/aristotle_prompt_{port_hamiltonian,seam,curve_gate}.md`.
- Aristotle (the prover) is **external** (no Lean in the agent loop). Contract = prompt + returned archive.
- **PH consistency spec: `specs/port_hamiltonian_consistency.md`** (PH-1…PH-7 obligation targets).
- **Throwaway smoke probes: `formal/smoke/`** (`smoke_true` PROVED, `smoke_false` REFUTED/counterexample;
  excluded from RequestProject build) — first live test of the direct loop. I submit these MYSELF via the
  CLI. **SMOKE STATUS (2026-06-08): both round-trips COMPLETED.**
  - **smoke_true (`2+2=4`):** task COMPLETE_WITH_ERRORS (no open goal to fill — already proved by
    `norm_num`). Aristotle built it server-side, confirmed it closes, reported `#print axioms` =
    `propext` only (within allowed propext/Classical.choice/Quot.sound). Returned .lean unchanged.
    **Verdict label: proved (trusted-from-prover)** — server-compiled, clean axioms, audit passes.
    (Under the 2026-06-08 process update; was "PENDING-LEAN" before the no-local-re-verify clarification.)
  - **smoke_false (`∀ n:ℕ, n = n+1`):** task COMPLETE. Aristotle correctly did **NOT** prove it —
    declared it false, gave counterexample n=0 → 0=1, commented out the original unprovable theorem,
    and instead proved the *negation* `¬(∀ n, n=n+1) := fun h => by cases h 0`. No fabricated proof of
    the false goal; no active `sorry`. **This is the desired refutation outcome — no red flag.**
    **Verdict label: counterexample (correct refutation).**
  - Net: the direct submit→candidate loop WORKS end-to-end and Aristotle's server compile is the build;
    no local `lake build` gap remains. Discrimination test passed — prover did not "prove" the false one.

## How I phrase an obligation (then I submit it myself)
Standalone, self-contained: (1) informal statement + intended math meaning; (2) the Lean — embed or
import the verified modules; pin every predicate; (3) explicit proof targets; (4) output spec
(compiles? diff of changes? `#print axioms`? no forbidden tokens?); (5) toolchain line
(Lean 4.28.0 + Mathlib v4.28.0). Mark B1/B3/B4-style hypotheses as FIELDS, not goals, when carried.
Then `aristotle submit` it directly — no handoff to the manager for the prover step.

## PH obligation queue (PH-1…PH-7) — all sent-status "open/staged" (nothing submitted yet)
- **PH-1** H ↔ GH curve geometry — scaffolded (generic wiring proved-in-prompt; GH `AMMCurve` instance open
  = GH gate-discharge). autonomous.
- **PH-2** skew-symmetric J / lossless routing — barrier proved-in-prompt; GH invariant open. autonomous;
  WATCH: if GH trade conserves no clean invariant → ESCALATE (economic object).
- **PH-3** dissipation R⪰0 (B3 arb_nonneg / LVR) — field scaffolded; GH grounding open. autonomous;
  ESCALATE if grounding needs redefining arbLeak (settlement semantics).
- **PH-4a** passivity / no-free-lunch — proved-in-prompt. autonomous.
- **PH-4b** reserves-have-no-floor / "convexity must be funded" — proved-in-prompt for cpmm (O=p²);
  GH analogue open. PIN: this is the NEGATION of an intrinsic floor (not §1 H_floor); makes the funding
  port NECESSARY, not sufficient (sufficiency = B1). autonomous. BddBelow/coercive watch.
- **PH-5** C¹ continuity at smooth-pasting S*=Kγ/(γ+1) (value+slope = engine seam gate) — **NEEDS-REPIN
  (v26c, 2026-06-08).** HEAD registers strike at **θ=sNorm(K)=(oracle₀/S)^γ**, NOT θ=K/oracle (PH-5/ITM
  spec text is stale on θ). Same closed form, corrected registration coord — NOT a settlement-semantics
  change. ALSO incomplete: seam gate binds TWO wings (A: call 1−S/K, S*=Kγ/(γ+1)<K; B: put 1−K/S,
  S*=K(γ+1)/γ>K); PH-5 names one branch → extend to branch B. autonomous; ESCALATE only if locked form
  found NOT C¹ (seam gate currently green: value 0.04%, slope 0.1% ≤0.15%).
- **PH-6** rebase structure-preserving θ→θ/r — sNorm gauge proved-in-prompt; J/R preservation open.
  v26c CONSISTENT (cleaner: θ=sNorm(K) reads strike in the gauge-invariant coord; sNorm* tracks θ→θ/r). autonomous.
- **PH-7** funding well bounded below (model floor, H=S−logS) — proved-in-prompt. autonomous.

## Build-derived theory candidates (v26c recap, 2026-06-08 — notes/PH_RECAP_2026-06-08.md)
NOT yet in PH-1…PH-7 / C / B. All AUTONOMOUS formalization; none submitted (recap only). Priority:
- **R1** Re-pin PH-5 → θ=sNorm(K), extend to 2 branches (highest value; only PH item v26c touched).
- **R2** crossover-at-K / coordinate-invariance theorem: θ=sNorm(K) ⇒ OTM→ITM crossover at dollar K
  ∀γ (θ=K/oracle drifts to oracle₀²/K for γ>1; γ−1 gauge defect) + mixed-basis negative control. NEW.
- **R3** small pin `mpGeom=getMP_raw·e^(−ghMu)`, `getMP_raw/slope=e^μ` — prerequisite for PH-2/PH-3 GH
  (slope vars must use mpGeom not getMP_raw price coord; the slippage-bug conflation).
- **R4** directional/orientation lemma: sign(K−oracle)==sign(funding ±2)==sign(d mark/d sNorm); CALL all
  +, PUT all − ; companion to PH-3. CAVEAT funding stays price-measure (θ-swap flips its sign).
- **R5** (opt) %-slippage basis-independence (e^μ cancels) — corollary of R3, not its own obligation.

## Framing
Typed interface stack: a change at any seam must type-check at every other seam (enforced by the
type-checker, not inspection). The "self-sandwich bug" was an interface violation (settlement
reaching past its contract into the raw displaced pool) — caught by type under this discipline.

## Live proof queue (UPDATED post-big-run 2026-06-08)
- **C1** — composite-ray → ITM via effective-strike substitution. **proved (trusted-from-prover)** (run
  2026-06-08; formal/aristotle_runs/C1/). sinh_log identity + universal-over-effective-strikes.
- **C2** — no costless-collar arb at w=½. **proved (trusted-from-prover)** (formal/aristotle_runs/C2/).
  SCOPE CAVEAT: collarSurplus MODELLED as θ·((1−w)/w−1) (documented form); engine's exact closed form
  not in accessible specs — proven content is the symmetry-iff. Manager: confirm closed form before
  promoting as the engine's literal invariant.
- **C3** — no-arb is symmetry, not instrument. **RUN-4: reflection arrow DISCHARGED** (no longer an
  axiom). `reflection_arrow: markPut θ s = markCall θ(θ²/s)` proved over the spec mark defs
  (formal/aristotle_runs/C3_reflection/). RESIDUAL ASSUMPTION (do not over-promote): the discharge
  holds modulo "the spec mark = the engine's barrier" — the put=reflected-call identification is now a
  proved algebraic identity, but the spec↔engine link is the remaining premise. Report as
  "arrow discharged; spec-mark↔engine-barrier is the residual link," NOT "C3 fully closed."
- **GH gate-discharge** — `coercive` field **proved (trusted-from-prover)** for the GH bounded-reserve
  shape (formal/aristotle_runs/GHcoercive/; `coercive_of_nonneg` matches the AMMCurve.coercive field
  signature byte-for-byte; lower bound 0). **RUN-2 GROUNDED FURTHER (PARTIAL):**
  formal/aristotle_runs/GHcoercive_grounded/ now DERIVES X∈(0,Nx),Y∈(0,Ny·M),y≥0 from T,C∈(0,1)
  (tail/CDF) rather than asserting 0≤y — but T<1/C<1 still carried as the defining tail/CDF property
  (GH special-function tables NOT formalized). Full GH `AMMCurve` instance (antitone_y/convex_y from
  the GH special functions) still OPEN — the bigger lift.
- **B1** — REAL solvency floor STILL OPEN (κ extrinsic; operator ship-gate). The **conditional
  structure** WAS proven this run (formal/aristotle_runs/B1/): coverage-hypothesis → solvency, coverage
  a CARRIED premise never discharged = the κ-extrinsic limit as a theorem. No fabricated floor.
- **B3** = PH-3 arb_nonneg → **proved (trusted-from-prover)** as R⪰0 PSD (formal/aristotle_runs/PH3/);
  NECESSARY-not-sufficient. **RUN-2 GROUNDED:** formal/aristotle_runs/PH3_grounded/ derives the leak
  ≥0 from the engine's actual GH slope law g(u)=k·e^(u−μ) (strict-mono ⇒ ∫(g(u₂)−g(u))du≥0), NOT an
  abstract PSD matrix. Still necessary-not-sufficient (does NOT close B1). **B4** = ledger field
  (carried, unchanged).

## Audit discipline (before folding any returned archive — zero-cost, no toolchain)
Extract → diff unchanged modules → token-scan (`sorry`/`admit`/`axiom`/`native_decide`/`sorryAx`/
`opaque`/`unsafe`; kernel `decide` ok) → read proofs → **re-derive the math independently** → read
Aristotle's `#print axioms` (must be only `propext`/`Classical.choice`/`Quot.sound`). Server-compiled
+ audited = **trusted-from-prover** (manager may upgrade to "verified" by building canonically; that's
a label upgrade, not a gate I owe). Pin every predicate **before** a run.

## Decisions that route to the operator (flag via manager)
|Γ|>1 scope ("true American" vs "exact replication" are mutually exclusive per wing → ship |Γ|≤1
exact or |Γ|>1 as a *labelled approximation*); calibration tier for Γ (oracle tier needs adversarial
review); any paper claim. Don't over-promote (the "tripwire" failure mode).

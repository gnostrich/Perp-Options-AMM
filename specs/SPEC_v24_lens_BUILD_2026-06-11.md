# SPEC — v24 + polar-lens BUILD (buildable, intern-ready) — 2026-06-11

_Author: research-lead. READ-ONLY derivation pass (no engine edit / no git / no Aristotle). Supersedes
the C.9 scope in `notes/research/V24_LENS_derivation_2026-06-11.md` for build purposes. Closes the two
substantive skeptic FLAG-HALT blockers (verdict #28, `notes/skeptic/VERDICT_V24_LENS_2026-06-11.md`) and
completes the inventory + control tables + staged scope the skeptic required. HEAD untouched `928cde1c`.
**Build base = `engine/builds/temporal_mvp_v24_rebase_fixed_2.html`** (plain-Balancer pool, v24 α/β
trade). Autonomous within the entry-95 mandate (operator asleep). The skeptic re-gates this spec (R6)
before the intern is dispatched. Tags [analytic]/[numeric]; all numbers float64-checked, scripts named._

---

## 0. The object (one paragraph, to pin it)

Plain weighted-Balancer pool `x^w·y^(1−w)=k` — the v24 object **exactly**, untouched: one steepness
scalar `w` (γ = w/(1−w)), α=x·w and β=y·(1−w) conserved per trade, `w=α/x` re-derived, reserves ride
the hyperbola. **Kurtosis = a static polar LENS added in the QUERY layer only:** `h_τ(u)=√(τ²+u²)−τ`,
`h′_τ(u)=u/√(τ²+u²)` (0 at the mode → 1 in the wings). The **strike-local pricing exponent** is
`g_loc(K) = γ · h′_τ(|u(K)|)` — a flat top at the money (g_loc→0) melting into frozen power-law wings of
exponent γ. τ is the single static kurtosis knob, vol-set at deploy. **The lens NEVER touches the pool
update**; mark, funding, and settlement *read through* it. The pool curve only skews via the v24 α/β
trade. This is structurally different from the demoted (W) v27 curve (which put `√(τ²+u²)` INSIDE a
position-dependent pool weight `w(u)`) — and that difference is exactly why the far-OTM divergence/cap is
absent: there is no `w(u)` field, hence no `1/w′(u)→∞` gearing channel.

---

## 1. BLOCKER 1 (carry #4 + strike-registration #8) — RESOLVED: the lens moneyness origin

### 1.1 In plain words

**The lens's moneyness origin is the LIVE MODE of the priced surface — the `sNorm` ray the v24 mark
function already peaks at — NOT the marginal price, and NOT the carry anchor P as a *separate* point.**

Here is why the apparent conflict (mode = ln marginal, but carry anchors at P = Ny/Nx, and they differ by
ln γ) dissolves, and why getting it wrong would misplace every strike:

- The v24 pricing surface `mark(wing, theta, sNorm)` (base build line 1601–1603) peaks at the ray
  `theta = sNorm`, where `sNorm = getSNorm(state) = (1−w)/w` (base line 1595). **That ray IS the mode of
  the priced surface.** Strikes are already registered in this same `theta` coordinate (the `theta`
  argument to `mark`; UI line 1416: `tan(φ)=θ=K/oracle`). So the surface, its mode, and the strikes all
  live in **one coordinate** already — the lens must be wired in that same coordinate.
- The carry anchor P = Ny/Nx = y/x (reserve ratio) and the marginal price mp = `getMP_raw` = `w·y/((1−w)·x)`
  differ by **exactly ln γ** (`mp = γ·P`, so `ln mp − ln P = ln γ`; float64-verified at w=0.5/0.6/0.725/0.85
  → offset = 0.0/0.4055/0.9694/1.7346 nats = ln γ exactly, `/tmp/blocker1_carry.js`). At the shipped steep
  example w=0.725, **ln γ ≈ 0.9694 nats — a factor of γ ≈ 2.64× in price.**
- **The trap (the wiring hazard):** if an intern wires `u = ln(K / marginal)` (price-coordinate, centred on
  mp) while the strikes and the mark surface live in the `sNorm` (price-reciprocal) coordinate, every strike
  is displaced from the lens centre by `ln γ ≈ 0.97 nats` — i.e. by a factor of γ ≈ 2.64×. The flat top
  would sit ~2.6× away from where the surface actually peaks, mis-pricing **every** strike.
- **The resolution — and why it is clean:** `g_loc = γ·h′(|u|)` depends only on `|u|` (h′ is odd, so
  `h′(|u|)` is even). The exponent is therefore **coordinate-invariant**: measuring u in the price
  coordinate or in its reciprocal gives the **identical** `g_loc` (float64-verified, `/tmp/coord_robust.js`).
  The ONLY thing that matters is that `u` is the **log-distance of the strike's registered ray from the
  LIVE mode, measured in the consuming function's own coordinate.** Mix coordinates (ln-marginal against
  sNorm-strikes) and you eat the ln γ offset; stay in one coordinate and the offset never appears.

This is a **mechanical construction rule, not an operator-tier decision** — it does not change settlement
semantics, the curve, or any economic object. No operator FLAG is forced. (The g<1 flat-top
exercise-meaning flag, already accepted entry 93 #5, is separate and unchanged.)

### 1.2 The exact `u(K)` the build uses (formula)

For each consuming layer, measure log-distance from the **live mode in that layer's own coordinate**:

- **Mark / settlement** (sNorm coordinate; mode = the surface peak):
  ```
  mode_sNorm = getSNorm(state) = (1 − w)/w        // w = getW(state) = α/x, LIVE (moves on trade)
  u(K) = ln( theta_K / mode_sNorm )                // theta_K = strike's registered ray (same coord as mark's theta)
  g_loc(K) = γ · h′_τ(|u(K)|),   γ = w/(1−w),   h′_τ(v)=v/√(τ²+v²)
  ```
- **Funding** (price coordinate; mode = the spot the funding already reads):
  ```
  S = poolMark(state, oracle, oracle_initial)/oracle    // v24 funding's existing spot, line 2084
  u(K) = ln( theta_K_price / 1 )   where the mode in price-coord is S=1 at marginal-equilibrium;
                                    operationally u(K) = ln(theta_K) − ln(mode_in_price)
  ```
  Because `g_loc` is `|u|`-symmetric, this yields the identical exponent as the sNorm wiring — the two
  modes are the same physical mode expressed reciprocally (`S·sNorm` consistency, `/tmp/blocker1b.js`).

**Build rule (verbatim, hand this to the intern):** *"u(K) is the log-distance of the strike's registered
ray from the LIVE mode, computed in the SAME coordinate the consuming function uses (mark/settlement:
sNorm = getSNorm(state); funding: the price-coord spot S it already reads). The mode is read live (it
moves on every trade because w moves). NEVER compute u as ln(K/marginal) against sNorm-registered strikes
— that double-counts the ln γ ≈ 0.97-nat carry/marginal offset and misplaces every strike by a factor of
γ."*

### 1.3 Strike-registration consistency (#8) — confirmed

- v24 registers strikes in the `theta` coordinate that `mark` compares to `sNorm` (the surface mode).
  Using `mode = getSNorm(state)` keeps the lens centre **exactly on the registration anchor** — `u(mode
  strike)=0` (float64-verified, `/tmp/blocker1c.js`). No ln γ misplacement.
- Side-of-mode: a trade moves the mode (sNorm 0.3793 → 0.1793 for a +$100k buy, `/tmp/inv_checks.js`); a
  fixed strike can cross the mode, flipping the **sign** of u. The `|u|` branch keeps `g_loc ≥ 0` through
  the crossing — this is the same side test v24's `mark`/`markFrac` already does (`sNorm<theta` vs `>`).
  **L1 mandates the `|u−u_mode|` branch** (see §4).

---

## 2. BLOCKER 2 (funding #9) — RESOLVED: the v24-base funding swap

### 2.1 What v24 funding actually is (read from the base, NOT HEAD)

Base build `fundingPerStrike`, lines 2080–2089:
```
S    = (oracle>0 && oracle_initial>0) ? poolMark(state,oracle,oracle_initial)/oracle : getSNorm(state);
m    = mark(wing, strike_theta, S);
gamma = (wing === 'call') ? +2 : -2;        // HARDCODED ±2 — NOT w-derived, NOT HEAD's formula, NOT lens-aware
if (S <= 0) return 0;
return kappa * gamma * N * m * (S - 1) / S * dt;
```
The prior scope (C.9 P2) wrongly cited "HEAD formula." The base build's funding is the hardcoded ±2 above.
`mark()` (line 1601) is the kinked European `min(s/θ,θ/s)` — **not** lens-aware.

### 2.2 The exact swap

Two coupled changes at the funding call site, plus the mark it depends on:

1. **Replace the hardcoded `±2` with the signed lensed exponent:**
   ```
   const g = g_loc(strike_theta, state, tau);            // = γ · h′_τ(|u(strike_theta)|), γ = w/(1−w) LIVE
   const gamma = (wing === 'call') ? +g : -g;            // sign from wing as before; magnitude now lensed
   ```
   `g_loc` reads γ **live** as `w/(1−w)` (NOT a deposit-time intent constant — note `arbitrageToOracle`
   re-equilibrates w along the hyperbola, so γ is whatever the live reserves give, `/tmp/blocker2_funding.js`).
2. **Make the mark it consumes lens-aware** (shared with P1/P3 — see §3): `m` becomes the lensed mark with
   the strike-local exponent, not the bare `min(s/θ,θ/s)`. This is the *same* lens-aware `mark()` the
   pricing and settlement layers use; funding does not get its own copy.
3. `S`, `(S−1)/S`, `kappa`, `N`, `dt`, the `S<=0` guard, and the call/put sign convention are **unchanged**.

### 2.3 Funding behavior (the expected change, accepted entry 93 #5)

Numerically (`/tmp/blocker2_funding.js`, τ=0.3, stress S=1.05, κ=0.1, N=1, steep pool):
```
strike  u_K      g_loc    f_v24(±2)    f_lensed(g_loc)   ratio (lensed/v24)
1.00    0.0000   0.0000   9.524e-3     0.000e+0          0.000     <- ATM funding -> 0 (flat top, no slope-deviation)
1.05    0.0488   0.1933   9.070e-3     8.766e-4          0.097
1.10    0.0953   0.3646   8.658e-3     1.578e-3          0.182
1.40    0.3365   0.8988   6.803e-3     3.057e-3          0.449
2.00    0.6931   1.1051   4.762e-3     2.631e-3          0.553
4.00    1.3863   1.1769   2.381e-3     1.401e-3          0.588    <- recovers toward γ_live in the wings
```
- **→ 0 at ATM** (g_loc→0: the flat top exerts no slope-deviation funding pressure).
- **→ γ_live in the wings** (g_loc → γ as |u|→∞: funding recovers the constant-γ behavior).
- **Sign unchanged** (g_loc ≥ 0; call=+, put=−, exactly as v24).
- This is an **expected behavioural change vs the constant-±2 base** — accepted by the operator entry 93
  #5. Flag for the record only, NOT a new decision.

### 2.4 Three-call-site consistency (mark / funding / settlement)

All three consume the SAME `g_loc(K)` and the SAME lens-aware `mark()`:
- **mark / pricing (P1):** `g_loc` sets the OTM power-law decay of the lensed mark; leg-by-leg, no
  closed-form composite (entry 93 #4).
- **funding (P2, §2.2):** swaps the hardcoded ±2 for ±g_loc; consumes the lensed mark.
- **settlement (P3, §3):** uses `g_loc(K)` as the per-strike exponent in the v26b smooth-paste S*.

The lens threads through three call sites — it is **not** one isolated readout. The build must add a
single shared lens helper (`g_loc(strike_theta, state, tau)` + a lens-aware `mark`) and call it from all
three sites, so they cannot drift. (Closes skeptic OMISSION-2.)

---

## 3. The lensed read layer (mark / settlement / funding)

- **P1 — Lensed mark.** Mark/premium priced **leg-by-leg through the lens** with each leg's own
  `g_loc(u_i)`; **no** closed-form `θ*=√(θ₁θ₂)`/`2sinh` composite (dropped, entry 93 #4 — it breaks under
  per-leg exponents; prior (e), rel.err up to 63% near the flat top). One-tx *execution* of a same-wing
  spread still holds (one net plain-v24 pool tx, path-indep — §6/C.6); only the pricing composite is
  leg-by-leg.
- **P2 — Lensed funding.** §2.2 above.
- **P3 — Lensed settlement (the ATM-jump gap-fix G-i).** v26b Reading-A smooth-paste with the strike-LOCAL
  exponent `g = g_loc(K)` (constant per strike, lens static): free boundary `sNorm* = θ·((g+1)/g)^g`,
  price multiple `S* = K·g/(g+1)`, `c = 1/((g+1)·sNorm*)`, continuation `c·sNorm` past the strike then
  intrinsic. Value+slope continuous to machine zero at every strike including g<1 (float64:
  valGap ≤1.1e-16, slopeGap ≤5.6e-17, `/tmp/lensX_5_settle.js`; skeptic independently re-derived the
  two-condition solve, verdict #28 JOB-1(a)). Stays real/finite for g<1; the g<1 flat-top band
  `|ln K| < τ/√(γ²−1)` (±13.1% at τ=0.3, γ=2.64) has a degenerate American-exercise *reading* of S* —
  **operator-tier, ACCEPTED entry 93 #5** (flag for record only).

---

## 4. The lens definition layer (query only — never touches the pool)

- **L1 — lens + side-of-mode branch (MANDATORY).** `h_τ(u)=√(τ²+u²)−τ`, `h′_τ(u)=u/√(τ²+u²)`;
  `g_loc(K)=γ·h′_τ(|u(K)−u_mode|)`, γ = w/(1−w) LIVE, u_mode = the live mode (§1.2). The **`|·|`
  side-of-mode branch is mandatory** — without it the exponent goes negative across the mode after a trade
  moves it (verified §1.3 / `/tmp/inv_checks.js`); this is the v24 `mark` side test.
- **L2 — τ static knob.** Single static kurtosis knob, vol-set at deploy. **No τ bound from no-arb**
  (butterfly + strike-monotonicity hold ∀τ; spot-monotonicity holds ∀τ given the `|u−u_mode|` branch;
  asymptotes → γ unconditionally — (c)/`/tmp/lens_c*.js`, skeptic-cleared). τ is bounded only by the
  flat-top half-width `τ/√(γ²−1)` (calibration/vol-set), NOT arbitrage.
- **L3 — draw curve-2 through the lens** (the local-warp gap-fix G-ii): render the priced curve-2 through
  the lens so the trade's reshape is visible and strike-dependent (|dG| up to ~1.7 near the mode for a
  +10% trade, decaying to ~0.03 at 4× — C.2, skeptic-confirmed strike-dependent, verdict #28 JOB-1(b)).
- **L4 — forward-read-only (HARD BUILD INVARIANT, strengthened).**
  > **The trade is ALWAYS sized by cash `dy` (or notional → dy). `g_loc` and the lensed slope are
  > READ-ONLY outputs. NO code path may take a target lensed slope / lensed exponent / viewed curve-2
  > slope as an INPUT and solve for `dy`, the mode, or the pool state. In particular: NO "warp until the
  > viewed slope hits X" helper, and NO inverse-lens root-find. `arbitrageToOracle` targets the marginal
  > price (the mode) via a plain-Balancer reserve root-find — it is lens-free and stays lens-free.**

  Rationale: the lens curvature `dG/du=γ·h″_τ → 0` in the wings, so its inverse `1/h″` blows up (≈3.6e6 at
  u=8). That blow-up bites ONLY an inverse-lens solve. The architecture reads forward (cash→state→slope),
  so `1/h″` never enters sizing → the (W)-era cap is absent, hard bound `|dG|≤γ` (h′∈[0,1]). This invariant
  is what keeps "no cap" true; an intern who builds a viewed-slope-targeting helper would silently
  re-introduce the blow-up and a cap. (Skeptic JOB-1(c) + R6 L4-strengthening, verdict #28.)

---

## 5. Inventory disposition table (EVERY touched item — no silent omissions)

Per the operator's entry-2 warning ("anchor curve and funding must generalise when we swap the curve") and
the skeptic completeness rule. `docs/feature_inventory.md` items keyed.

| # | Item | Disposition | Evidence |
|---|---|---|---|
| — | **Pool / trade** | **UNCHANGED v24** — plain Balancer `x^w·y^(1−w)=k`, α/β conserved, w=α/x moves on trade, reads only dy. No w>½ clamp (N/A here, entry 93 #3). | base `tradeUpdate` L1617; round-trip & path-indep err 0.0 (C.4) |
| — | **Lens** | **NEW, query layer only** — L1–L4 (§4). Static τ; side-of-mode `|·|`; forward-read-only. Never touches pool update. | §4; `/tmp/lensX_1_goalseek.js` (pool byte-identical ∀τ) |
| — | **Settlement** | **NEW lensed smooth-paste** P3 (§3) — v26b S* with g_loc(K). | §3; `/tmp/lensX_5_settle.js` |
| **#4** | **Carry anchor** (P=Ny/Nx) | **RESOLVED (BLOCKER 1, §1).** Lens moneyness origin = the LIVE mode in the consuming function's own coordinate; g_loc is coordinate-invariant (`\|u\|`-symmetric) so the ln γ marginal-vs-carry offset never enters IF coordinates aren't mixed. Mandatory build rule §1.2. Carry contract (P→P/r on rebase) inherited from v24 unchanged. | §1; `/tmp/blocker1_carry.js`, `/tmp/coord_robust.js` |
| **#5** | **Rebase** | **Inherited v24 + lens translation-covariant — COMMUTES.** rebase (x→r·x, α→r·α, y/β invariant) leaves w, sNorm, γ INVARIANT ⇒ lens mode + amplitude invariant; strikes co-translate (θ→θ/r, mode→mode/r), the difference u(K)−u_mode is fixed ⇒ g_loc invariant. lens-mode∘rebase commutes to float64. | §1.3; `/tmp/inv_checks.js` (w/sNorm invariant under rebase) |
| **#8** | **Strike-registration** | **RESOLVED, tied to BLOCKER 1 (§1.3).** Strikes registered in the `theta` coordinate `mark` compares to `sNorm`; lens centred on `mode = getSNorm(state)` ⇒ u(mode strike)=0, no ln γ misplacement; side-of-mode `\|u\|` branch handles trade-induced mode crossings. | §1.3; `/tmp/blocker1c.js`, `/tmp/inv_checks.js` |
| **#9** | **Funding** | **RESOLVED (BLOCKER 2, §2).** Swap v24's hardcoded ±2 (base L2086) for ±g_loc(K) (γ live = w/(1−w)); make the consumed mark lens-aware; S/(S−1)/S/κ/sign unchanged. Behavior: →0 ATM, →γ wings (accepted entry 93 #5). | §2; `/tmp/blocker2_funding.js` |
| **#11** | **Dollar-pipe** | **Inherited v24 UNCHANGED.** Lens is query-only and does not touch reserve-USD / settlement-cash plumbing; the dollar pipe sits below the lensed reads. | base settlement chain unchanged; lens adds no $-path |
| **#13** | **Solvency** | **Inherited v24 — plain-Balancer reserve bound + flat-top value law.** Pool is literally v24 ⇒ same reserve-exhaustion bound (x→α⁺); lens is query-only ⇒ adds NO solvency surface. Flat-top g<1: value law `value ∝ S^(−g)` stays finite & bounded (g≥0), settlement value capped near intrinsic at S* (skeptic JOB-1(a): continuation grows past S* but exercise is AT S*). | §3; skeptic verdict #28 JOB-1(a); base reserve bound |
| **#1 (ATM-jump)** | **v24 known-gap (i)** | **FIXED → P3** (lensed v26b smooth-paste, per strike). | §3 |
| **(local-warp)** | **v24 known-gap (ii)** | **FIXED → L3** (lensed curve-2 makes the trade reshape visible + strike-dependent; no field, no cap). | §4 L3; C.2 |

---

## 6. R3 control-inventory row

The operator repeatedly demanded a **steepness** control for arbitrary-vol assets (entries 29/77/82) and a
**kurtosis** knob (entries 3/84). Disposition:

| Control | Mechanism | New / existing | Static or dynamic | Disposition |
|---|---|---|---|---|
| **Steepness** (γ = w/(1−w)) | v24 **derived w** — `getW=α/x`, set by the pool-init deposit ratio | **EXISTING (v24)** — NOT a new slider | Set at pool init; **moves on trade** (w=α/x re-derives) | **v24 has NO direct steepness control** — steepness is *derived* from the init deposit ratio and is *not a user knob*. Unchanged by this build. |
| **Kurtosis / vol** (τ) | **polar lens** `h_τ` (L1/L2) | **NEW** — the only new user control | **Static** (vol-set at deploy, never moved by trades) | The single NEW control. Per operator (entry 29) realise as an updown stepper, NOT a slider. |
| **Pool weight** (w) | `w=α/x` | existing (v24) | moves on trade | unchanged; reported as the derived KPI "w (derived)". |

**Plain statement for the intern:** *steepness = v24's existing derived-w (set at pool init from the
deposit ratio, moves on trade — no steepness slider exists or is added); kurtosis = the NEW static τ lens
knob; the only NEW user control this build adds is τ.* (Closes skeptic R3.)

---

## 7. Staging plan (the skeptic-required two-stage build)

The lens threads `g_loc` through mark / funding / settlement + curve-2 redraw + the side-of-mode branch —
it is **not** one isolated readout. Stage it so a wiring error in the write/warp path can't silently
corrupt the read path, and so BLOCKER 1's mode/coordinate choice is locked before any warp wiring.

### Stage 1 — lens READ layer (on the UNTOUCHED v24 pool)
**Scope:** L1 (lens + `|u−u_mode|` branch), L2 (static τ), L3 (draw curve-2 through the lens), P1
(lensed leg-by-leg mark), P2 (funding swap §2.2), P3 (lensed v26b smooth-paste settlement §3). Pool/trade
code byte-unchanged.
**Acceptance gate (own gate, e.g. `engine/verify/lens_stage1_selfcheck.js`):**
1. Pool `tradeUpdate` output byte-identical to base v24 for τ ∈ {0.05, 0.3, 1, 5} (lens cannot touch pool).
2. Settlement value+slope continuity at S* per strike to machine zero (≤1e-15), incl. g<1 strikes.
3. Butterfly (convex-in-K) ≥ 0 and strike-monotonicity hold for the lensed mark across τ ∈ {0.05,0.3,1,3}.
4. Spot-monotonicity guard `g_loc(|u|)+g_loc′(|u|) > 0` on the `|u|` half-line, all τ tested.
5. Asymptote: `g_loc(|u|→∞) → γ` (lens → identity in the deep wings).
6. Funding: f → 0 at ATM (g_loc→0) and → γ-scale in the wings; sign matches wing; matches §2.3 table.
7. BLOCKER-1 wiring assertion: `u(mode strike)=0` (lens centred on the live mode; no ln γ offset).
**Tester smoke-pass (CLAUDE.md §8 standing UI gate):** lensed curve-2 drawn + identified + sanity-located;
mark/settlement/funding readouts exercised at ATM and OTM strikes; τ knob exercised (visible elbow change).

### Stage 2 — lensed warp / observable + local-warp gap-fix visibility
**Scope:** confirm a trade reshapes the lensed curve-2 **strike-dependently** on the LIVE engine (gap-fix
ii); wire any UI affordance that surfaces the reshape. Pool trade still byte-unchanged v24.
**Acceptance gate:**
1. A +10% cash trade produces strike-dependent `dG(K)` matching C.2 (largest near mode ~1.7, decaying to
   ~0.03 at 4×), bounded by `|dG| ≤ γ` everywhere (no cap).
2. Round-trip (+dy then −dy) and path-independence: state error 0.0 (inherited v24 α/β).
3. L4 invariant audit: grep the diff for any helper taking a lensed/observed slope as input and solving
   for dy/mode/state — MUST be absent (hard fail if present).
**Tester smoke-pass:** trade executed in both directions; lensed curve-2 reshape observed + per-click
delta measured; mode-crossing (strike crosses the moved mode) exercised to confirm the `|·|` branch holds.

---

## 8. Operator-tier flags (relay for the record — already accepted, NOT new decisions)

1. Flat-top band g_loc<1 (±13.1% at τ=0.3): American-exercise *reading* of S* degenerates — accepted entry
   93 #5; value law itself evaluates finitely.
2. ATM funding → 0: expected behavioural change vs the constant-±2 v24 base — accepted entry 93 #5.
3. τ calibration (flat-top half-width `τ/√(γ²−1)`): vol-set, operator/calibration call.

**None of the two blockers required an operator decision** — both are mechanical construction resolutions
within the entry 93/94 locked architecture. (BLOCKER 1 does NOT change settlement semantics: the
coordinate-invariance of `g_loc` means the mode/marginal/carry distinction never reaches the priced
exponent. No new FLAG raised.)

---

## 9. Lean obligations

**None ready to pin.** The lens is a static algebraic readout on a plain-Balancer pool; items 1/4/6
inherit v24's α/β path-independence (already covered). Candidate-only obligations (pin AFTER build freeze,
NOT this pass): `g_loc(|u|)+g_loc′(|u|)>0` (forward-monotonicity on the correct-side branch) and
smooth-paste value+slope continuity at S* for the local exponent. Nothing submitted/built/edited/git.

---

## 10. Verdict

**INTERN-READY.** Both substantive skeptic blockers are resolved with float64-backed derivations:
BLOCKER 1 (lens moneyness origin = the live mode in each consuming layer's own coordinate; ln γ hazard
closed by coordinate-non-mixing + |u|-symmetry; strike-registration consistent), BLOCKER 2 (v24-base
funding swap: hardcoded ±2 → ±g_loc, lens-aware mark, →0 ATM / →γ wings). The inventory disposition table
covers every touched item (#4/#5/#8/#9/#11/#13 + pool/lens/settlement) with no silent omissions; the R3
control row dispositions steepness (derived-w, unchanged) and kurtosis (new static τ); L4 is strengthened
to a hard ban on lensed-slope-as-input; the build is staged (read layer + gate + smoke-pass, then
warp/observable + gate + smoke-pass).

Gated on: the skeptic re-gate (R6) of THIS spec before the intern is dispatched.

_Scripts: `/tmp/blocker1_carry.js`, `/tmp/blocker1b.js`, `/tmp/blocker1c.js`, `/tmp/blocker2_funding.js`,
`/tmp/inv_checks.js`, `/tmp/coord_robust.js` (this pass) + `/tmp/lensX_*.js`, `/tmp/lens_*.js` (prior
derivation, skeptic-re-derived `/tmp/sk_*.js`). All float64. Self-adversarial: the coordinate-mixing trap
and the inverse-lens hazard were hunted, not glossed._

---

# 11. WRITE/SETTLE THROUGH LENS — Stage 2 (lens becomes the unit of account everywhere)

_Appended 2026-06-12 by research-lead. READ-ONLY derivation pass (no engine edit / no git / no Aristotle).
Authorised by the operator's settlement-semantics ruling (entry 96, `history/operator/2026-06-10_kurtosis-curve-family-brief.md`,
verbatim): "everything works the same, the lens just translates queries incl portfolio value etc. and writes
(amm tx) — so yes settle at lenses prices … you'd be recording the lensed version to query." The lens is now
the unit of account EVERYWHERE — not just the chart-2 view + funding (Stage-1, built, `temporal_mvp_v28_lens_S1.html`
md5 `1ed8fe2d…`), but the **traded/settled dollar pipe and portfolio value**. The Stage-1 handback deliberately
left these call sites untouched and flagged them as the locked, operator-tier boundary; the operator has now
UNLOCKED them. This section specs the wiring. **Skeptic R6-gates this section before the intern builds it.**_

## 11.0 Object recap (what changes, what does NOT)

The polar lens `g_loc(K)=γ·h′_τ(|u(K)|)` and `markLensed(wing,θ,sNorm,g)` are the Stage-1 helpers, already in the
engine (build lines 1639/1655) and already used by funding (P2, line 2153) and the curve-2 draw layer (line 3542).
Stage 2 routes **pricing, execution, settlement, and portfolio/equity valuation** through the SAME helpers, so the
lens becomes the single basis everywhere a price/value is computed. **The pool update (`tradeUpdate`) stays plain
v24, lens-free** — the lens never inverts to size `dy` (L4 preserved, §11.3). What moves is the *fraction* every
value reads: `mark`/`markEff` (kinked European `min(s/θ,θ/s)`) → `markLensed` (American smooth-paste at the
strike-local exponent `g_loc(K)`).

## 11.1 Call-site enumeration (raw v24 mark → lensed replacement)

Read straight off `temporal_mvp_v28_lens_S1.html`. Every site that computes a traded price, a settled dollar
value, or a portfolio/position value:

| # | Call site (line) | Currently reads | Lensed replacement | Notes |
|---|---|---|---|---|
| W1 | `legPrice` (1716–1727) — barrier `m=mark(wing,θ_inner,sNorm)`; spread `m_star=mark(wing,θ*,sNorm)` | raw kinked `mark` | barrier: `markLensed(wing,θ_inner,sNorm,gLoc(state,θ_inner,τ))`; **spread: leg-by-leg, NO composite** (`vsValue`/`2sinh` shortcut DROPPED per §3-P1 / entry 93 #4 — `θ*=√(θ₁θ₂)` is invalid under per-leg `g_loc`). | `legPrice` becomes the single lensed pricing entry; takes `τ` (thread `state.tau`). Spread `V = N·(markLensed(inner) − markLensed(outer))` barrier-by-barrier, matching `legValueUnified`'s shape. |
| W2 | `executeLeg` (1752–1763) — `V_usd = p.V·oracle`; `dy = ±V_usd` | `p.V` from raw `legPrice` | `p.V` from **lensed** `legPrice` (W1). **`dy` sizing unchanged in form** (`dy = wingSign·legSign·V·oracle`), only `V` is now lensed. | The cash leg is still sized by the (now-lensed) premium · oracle; `tradeUpdate(state,dy)` is byte-identical plain v24. **This is the "writes (amm tx)" the operator named — the warp is now driven by the lensed premium.** L4-safe: forward read (lensed V → dy), never inverse. |
| W3 | `closeBand` settlement leg (1955–2072) — ITM leg `legValueUnified`→`markEff`→`mark` (2037/2049); OTM leg reversed via `legPrice`→`mark` (2041/2053/2061/2067) | raw kinked `mark` on BOTH the settled-to-cash leg AND the AMM-reversal leg | BOTH legs lensed: settled-to-cash leg `legValueUnified`→`markEff`→`markLensed`; OTM-reversal leg via the lensed `legPrice` (W1). | **Load-bearing — both legs MUST move together** (§11.4). `raw_net = Y − X` nets the two leg values; if only the settled leg is lensed and the reversal leg stays kinked, the band nets two different bases (the v27-class bug). |
| W4 | `markEff` (1902–1905) → `legValueUnified` (1907–1911) | `mark(wing,θ,sNorm)` | `markLensed(wing,θ,sNorm,gLoc(state,θ,τ))` | `markEff` is the per-barrier settlement fraction. Its g_loc reads the SAME live `sNorm` mode the pricing path uses. The "saturates at 1 when ITM" comment becomes "American smooth-paste continuation→intrinsic"; intrinsic ceiling is still ≤1 (§11.4 solvency). |
| W5 | `fundingPerStrike` (2153–2161) | **already lensed** (Stage-1 P2) — `g=gLoc(...)`, `m=markLensed(...)` | NO CHANGE | Already routes through the shared helper at the sNorm coordinate. This is the template the other sites copy. |
| W6 | UI `pfComponents` (4168–4199) — `m=Engine.mark(wing,part.theta,sNormPool)`; `value = sign·N·m` | raw kinked `mark` | `m = Engine.markLensed(wing,part.theta,sNormPool, Engine.gLoc(s.pool,part.theta,s.tau))` | The portfolio component VALUE the UI shows. MUST match the engine `legValueUnified` (W4) basis exactly — they are the display companion of the same number (§11.5). The `effK`/ITM regime label is a *display* concept; under the lens there is no hard ITM saturation, so the regime tag becomes "continuation vs intrinsic side of S*(K)" or is retained purely as a coordinate label (operator-tier cosmetic, §11.7). |
| W7 | UI `renderBands` aggregation (4253–4259) — `X,Y` = Σ component values; `raw_net = Y − X`; `dollarFigure = L0·raw_net·equityAtClose` | sums of raw-mark component values | sums of **lensed** component values (W6); `raw_net` and `dollarFigure` formulas UNCHANGED | The single stage-2→3 equity multiply (`equityAtClose`) and L0 amplification are NOT a pricing basis — they are unchanged. Only the `X,Y` that feed `raw_net` change basis. **No double-multiply**: `equityAtClose` (carved-slice perp P&L) is orthogonal to the option `raw_net` (§11.5). |
| W8 | `pfComponents`/`renderBands` `attribPnL`, `equityAtClose`, `carvedNotional` path (4232–4244 / engine 2100–2113) | perp-mark fractional P&L — NO option mark involved | NO CHANGE | The carved-slice perp P&L is a **perp** quantity (perpMark feed), not an option-mark quantity. It is NOT lensed. Flagged here to prevent an over-eager intern from lensing it (would be a category error / double basis). |
| W9 | curve-2 draw layer `drawState` (3542–3554) | **already lensed** (Stage-1 L3) | NO CHANGE | Already `Engine.markLensed`/`Engine.gLoc` at the live mode. Read-only display. |

**Net: 5 sites change (W1, W2, W3, W4, W6→W7 aggregation), 4 sites already-lensed / explicitly-not-lensed (W5, W8, W9 + the carved perp slice).**

## 11.2 Consistency invariant — the ONE-HELPER RULE (closes the v27 bug-class)

> **For a given strike `K` at a given pool state, EVERY layer — pricing (W1), execution (W2), settlement
> (W3/W4), funding (W5), and portfolio value (W6/W7) — MUST read the SAME `g_loc(K)` from the SAME shared
> `Engine.gLoc(state, θ_K, τ)` and the SAME `Engine.markLensed`, evaluated at the SAME live `sNorm` mode
> `getSNorm(state)` in the SAME (sNorm) coordinate (MUST-APPLY-1). No layer may recompute `g_loc` against a
> different mode, a different coordinate, a frozen/entry γ, or its own inline kernel.**

Mechanically: there is exactly ONE `gLoc` and ONE `markLensed` in `Engine` (already true). Stage 2's whole job is
to make the four raw-`mark` consumers (W1/W3/W4/W6) call THOSE, never a local copy. **Float64 proof the rule kills
the arb**: with both open-pricing and settlement on the lens at the same state, `markLensed_open(K) −
markLensed_settle(K) = 0` exactly for every strike/wing tested (`/tmp/lens_band_arb.js`, max diff `0`). The basis
mismatch is identically zero when the one-helper rule holds; it is large (4–8×, §11.4) when it is violated.

## 11.3 Stage-1 lens invariants — PRESERVED

- **L4 forward-read-only (entry 93 #2):** the lens is NEVER inverted to solve for `dy`. W2 reads forward
  (lensed `V` → `dy = ±V·oracle`) exactly as Stage-1 sizing did; the pool update stays plain v24
  `tradeUpdate`. NO "warp until lensed slope hits X" helper; `arbitrageToOracle` stays lens-free
  (gate 7b, unchanged). **The lens changes the VALUE that sizes the cash leg, not the sizing MECHANISM.**
- **sNorm coordinate everywhere (MUST-APPLY-1):** all new W1/W3/W4/W6 calls pass `getSNorm(state)` as the mode
  and the strike's registered θ ray — never a price-coordinate spot. (W6's `sNormPool = Engine.getSNorm(s.pool)`
  already; W3's `sNorm0` is the close-side reference — see §11.4 caveat.)
- **No γ_min floor (MUST-APPLY-2):** `markLensed` is NaN-free at `g=0` (boundary inclusive, `→1` at the mode —
  `/tmp/lens_modecont.js` confirms finite ATM). No floor is added at any new site.
- **g_loc(ATM)=0 handled finitely:** verified continuous to the mode (markLensed →1 as θ→mode); the existing
  inclusive-boundary handling carries.

## 11.4 NO-ARB / SOLVENCY UNDER LENSED SETTLEMENT — the load-bearing verdict

**Method: [analytic] + float64 (`/tmp/lens_settle_arb.js`, `/tmp/lens_band_arb.js`, `/tmp/lens_modecont.js`,
steep pool w=0.725 ⇒ γ=2.636, τ=0.3).**

**(A) Solvency — PASS (no hole).** `markLensed ∈ [0,1]` globally (float64 min/max over both wings, all g∈[0.01,5],
all spots = `0.000007 … 1.000000`). The intrinsic ceiling is 1, identical to the kinked `mark`. A settled-to-cash
leg pays `N·markLensed ≤ N` — the SAME per-leg payout ceiling the plain pool already carries. **Lensed settlement
cannot settle a position for more than the plain pool could (no "more lensed-dollars than the pool holds" hole at
the fraction level).** The v24 reserve-exhaustion bound (#13) is inherited unchanged; the lens adds no solvency
surface.

**(B) Same-state open-vs-settle arb — NO arb IF the one-helper rule holds; a REAL bug if it is violated.**
- If pricing/open stays kinked while settlement is lensed, `settle_lensed − open_kinked < 0` at every strike
  (float64: −0.44 to −0.79 across the band, `/tmp/lens_band_arb.js`). That is not a trader-favourable arb, but it
  is a **systematic basis mismatch** — the trader is paid a lensed value for a position priced kinked. It is the
  exact v27-class defect and is FORBIDDEN by §11.2.
- With **both** open and settlement lensed at the same state, `open_lensed = settle_lensed` exactly (max diff `0`).
  **No costless round-trip: open a band and immediately close it ⇒ raw_net = 0 to machine zero**, because every
  leg is valued on one basis. This is why W1 (pricing) MUST move together with W3/W4 (settlement) — they are the
  two halves of the same no-arb identity.

**(C) The genuine hazard the intern MUST get right — the intra-band two-leg basis split (W3).** In `closeBand` a
one-ITM-leg band settles the ITM leg to cash (`legValueUnified`→`markEff`) AND reverses the OTM leg on the AMM
(`legPrice`). `raw_net = Y − X` subtracts them. **If `markEff` is lensed but `legPrice` is left kinked (or vice
versa), the two legs net on different bases** — a within-band arb/leak whose size is the 4–8× fraction gap in
§11.1's tables. **Mitigation (mandatory):** W1 and W4 both route through `markLensed`/`gLoc`; the gate asserts
`legPrice`-basis == `legValueUnified`-basis at the same state (§11.6 gate 4). This is the single highest-risk
wiring step.

**(D) Pool-execution vs lensed-settled coherence.** The OTM-reversal leg executes a plain-Balancer `tradeUpdate`
sized by the lensed premium (W2). Because the same lensed `V` both sizes the cash leg AND is the settled value,
the reversal returns to the pool exactly the cash the lensed leg is worth — no gap between "what the pool paid out
to unwind" and "what the leg settled for." (Verified structurally: `dy` in W2 and `V` in W3 are the same lensed
`legPrice.V`.)

**VERDICT: lensed settlement is no-arb and solvent IFF the one-helper rule (§11.2) holds — i.e. pricing,
execution, and settlement all read the single shared lensed helper at the live sNorm mode. The only way to break
it is to lens one leg/layer and not another; the gate (§11.6) closes that. NOT operator-tier — no new economic
object, no settlement-semantics ambiguity beyond what entry 96 already ruled. One flag for the record (§11.7):
the "ITM saturates at 1 / effective-strike" display semantics softens under the lens (continuation runs past S*),
which is the already-accepted g<1 flat-top reading (entry 93 #5), now also touching the portfolio ITM/OTM label.**

### 11.4-caveat — W3 close-side coordinate (`sNorm0`)
`closeBand` computes `sNorm0 = poolMark(s,oNow,oracle_initial)/oNow` (a **price-coordinate** spot, line 1983) for
the ITM regime test, NOT `getSNorm` (price-reciprocal). The Stage-1 funding swap deliberately used the sNorm mode
to avoid the ln γ trap (MUST-APPLY-1). **For W3/W4 the lensed `g_loc` must be computed against the same coordinate
its `markLensed` consumes.** Since `markEff`/`legValueUnified` currently pass `sNorm0` as the `sNorm` arg to
`mark`, the lensed replacement must pass that SAME `sNorm0` as both the mode origin for `gLoc` and the spot for
`markLensed` — i.e. wire `gLoc` to read the mode in the price coordinate `closeBand` already uses, OR convert
`sNorm0` to the sNorm mode before the lens call. **This is a concrete wiring decision for the intern, flagged
because it is the §1 ln γ trap in the settlement path.** Recommended: compute `g_loc` and `markLensed` both
against `getSNorm(s)` (the sNorm mode) and keep the price-coord `sNorm0` for the legacy ITM *regime* test only,
since `g_loc` is `|u|`-symmetric (coordinate-invariant, §1.1) — the lensed exponent is identical either way, so
the safe rule is "one coordinate per lens call, sNorm preferred." The gate (§11.6 gate 5) asserts the close-side
lensed value equals the open-side lensed value at the same strike/state (the round-trip-zero check), which fails
loudly if the coordinate is mixed.

## 11.5 Portfolio value flow — double-count / basis-mismatch audit

The displayed P&L is `dollarFigure = L0 · raw_net · equityAtClose` (UI 4259; engine `trader_payout` 2121). Two
orthogonal factors:
- **`raw_net = Y − X`** (option leg values) — **THIS is what Stage 2 lenses** (W6/W7). Both `X` and `Y` move to the
  lensed basis together; their difference stays a single-basis quantity.
- **`equityAtClose = carvedEntryEquity + attributablePnL`** (carved perp-slice equity) — a **perp** quantity from
  the perpMark feed (W8). **NOT lensed.** It is the stage-2→3 unit multiply (carved-perp units → dollars), applied
  ONCE. Lensing it would be a category error (the lens is an *option-mark* basis; the carved slice is a perp-price
  P&L).

**Double-count check: NONE.** The lens enters `raw_net` only; `equityAtClose` and `L0` are pure multipliers applied
once each in the tail (the "single stage-2→3 equity multiply" the existing three-stage unit chain already enforces,
engine 2115–2122). The UI `pfComponents` value (W6) and the engine `legValueUnified` (W4) are the **display
companion of the same number** — under the one-helper rule they read identical lensed fractions, so the table sum
(UI `X,Y`) equals the engine `raw_net` to machine zero. **Basis-mismatch risk is exactly the UI-vs-engine
divergence the gate's cross-layer equality check (§11.6 gate 3) pins.**

## 11.6 Staging + gate additions

**This is its OWN stage (Stage 2 — write/settle lens), with its own gate, NOT folded into Stage 1.** Rationale: a
wiring error in the write/settle path must not silently corrupt the Stage-1 read layer that is already built and
green; and the two-leg basis split (§11.4-C) is a new failure mode the Stage-1 gate does not cover. Stage 1 stays
the read layer (lens query + funding + draw + leg-by-leg mark); Stage 2 turns execution, settlement, and portfolio
value onto the lens.

**Gate additions to `engine/verify/lens_selfcheck.js` (extend the existing 7-assert file; keep the SKIP-as-pass
guard for non-lens builds):**

1. **Settled-value == lensed-mark · size.** For a barrier leg at strike K, `legValueUnified(wing,leg,sNorm) ==
   leg.N · markLensed(wing,θ_K,sNorm,gLoc(state,θ_K,τ))` to machine zero. (Asserts W4 routes through the lens.)
2. **Open == settle, same state (no costless round-trip).** Open a leg via lensed `legPrice`, settle it via
   `legValueUnified` at the same state ⇒ `|V_open − V_settle| < 1e-12`. (Asserts W1/W4 share the helper; the §11.4-B
   identity.)
3. **Cross-layer basis equality (UI == engine).** The UI `pfComponents` component value `sign·N·markLensed(...)`
   equals the engine `legValueUnified` per-leg contribution to machine zero, at several strikes/τ. (Asserts W6
   matches W4 — the v27 bug-class pin.)
4. **Intra-band two-leg single-basis.** Build a one-ITM-leg band; assert the settled-leg fraction and the
   OTM-reversal-leg fraction are BOTH `markLensed` (neither is bare `mark`) — structural source check that
   `closeBand`'s settlement path and `legPrice` path both call the lens. (Closes §11.4-C.)
5. **Round-trip zero under lensed close.** `closeBand` immediately after `openBand` at an unchanged state ⇒
   `|raw_net| < 1e-10` for both the NEITHER-ITM and ONE-ITM cases. (Asserts the close-side coordinate (§11.4-caveat)
   is not mixed — fails loudly on an ln γ slip.)
6. **Solvency ceiling.** `markLensed ∈ [0,1]` over a stress sweep of g/spot/wing (already partly in (4c); extend to
   assert the upper bound `≤ 1+1e-12` so no leg ever settles above N). (Asserts §11.4-A.)
7. **No-arb bound.** Over a strike grid, `max_K |markLensed_open(K) − markLensed_settle(K)| == 0` (the one-helper
   identity, §11.2). (The single scalar no-arb gate.)
8. **L4 preserved (regression).** `tradeUpdate`/`arbitrageToOracle`/`rebase` still byte-identical to base v24 (the
   existing gate 6/6b/7 carry; assert W2 added NO inverse-lens helper — extend the banned-pattern scan).

**Tester smoke-pass (CLAUDE.md §8 standing UI gate):** open a band, close it both regimes (neither-ITM and
one-ITM); confirm the displayed settlement dollar figure matches a hand-computed `L0·raw_net·equity` with lensed
component values; exercise τ and confirm the portfolio value moves with the lens; confirm an immediate
open-then-close nets ~0; direction swaps exercised.

## 11.7 Operator-tier flags (relay for the record)

1. **ITM/OTM display semantics soften under the lens.** With kinked `mark`, an ITM leg saturates at 1 and the
   "effective-strike = oracle" parking label is crisp (W6 `effK`/regime tag). Under `markLensed` the continuation
   runs PAST the strike to the free boundary S* before turning to intrinsic, so the hard ITM=1 saturation is gone;
   the `effK`/ITM-vs-OTM label becomes a continuation-vs-intrinsic side-of-S* label. This is the **already-accepted
   g<1 flat-top exercise reading (entry 93 #5)**, now also touching the portfolio table's regime column — flagged
   because it changes a user-visible label, even though the value law is finite and the no-arb/solvency verdict is
   clean. NOT a new decision; relay for the record.
2. **The §11.4-caveat coordinate choice in `closeBand`** (price-coord `sNorm0` vs sNorm mode for the lensed
   settlement call) is a build-mechanical decision (recommended: sNorm mode for the lens, price-coord retained for
   the legacy ITM regime test). Not operator-tier, but skeptic-gate-worthy — gate 5 catches a slip.

## 11.8 Intern-ready scope for "write/settle through lens"

- **Touch:** `legPrice` (W1, lens + thread τ, drop composite to leg-by-leg), `executeLeg` (W2, V now lensed),
  `markEff` (W4, → markLensed), `closeBand` settlement+reversal legs (W3, both lensed, coordinate per §11.4-caveat),
  UI `pfComponents` (W6, → markLensed). Aggregation (`raw_net`, `dollarFigure`) formulas UNCHANGED (W7).
- **Do NOT touch:** `tradeUpdate`/`arbitrageToOracle`/`rebase` (plain v24, L4); the carved perp-slice P&L
  (`attribPnL`/`equityAtClose`, W8 — perp basis, not lensed); funding (W5, already lensed); draw layer (W9).
- **One-helper rule (§11.2) is the build contract:** every changed site calls `Engine.gLoc`/`Engine.markLensed`
  at `getSNorm(state)`; no inline kernels; no second basis.
- **Gate:** extend `engine/verify/lens_selfcheck.js` with the 8 Stage-2 asserts (§11.6); wire it as the Stage-2
  branch in `run_all.sh`. Tester smoke-pass per §11.6.
- **Blob/file-safety gate (CLAUDE.md §3) applies** — engine HTML edit, on-disk splice, 2 blob md5s + 3 scripts
  verified post-edit.

## 11.9 Verdict (§11)

**INTERN-READY for Stage 2 (write/settle through lens), gated on the skeptic R6 re-gate of THIS section.**
Five call sites move to the lens (W1/W2/W3/W4/W6+W7), four stay (W5/W8/W9 + carved perp slice). The no-arb/solvency
verdict is **CLEAN under the one-helper rule** and **broken only if a single leg/layer is lensed in isolation** —
the gate (§11.6, esp. gates 2/4/5/7) closes that bug-class. Solvency ceiling `markLensed ∈ [0,1]` inherited from
intrinsic; the v24 reserve bound unchanged. No new operator-tier economic decision — entry 96 ruled the semantics;
the two flags (§11.7) are display-label record-relays of the already-accepted g<1 reading. **No Lean obligation
ready** (the no-arb identity `markLensed_open = markLensed_settle` is an algebraic same-function equality, not a
theorem; the solvency bound `markLensed ∈ [0,1]` and value+slope continuity at S* are candidate obligations only
post-build-freeze, same as §9).

_Scripts (this Stage-2 pass, all node float64): `/tmp/lens_settle_arb.js` (markLensed vs kinked gap, solvency
range), `/tmp/lens_band_arb.js` (same-state open-vs-settle arb, one-helper identity = 0), `/tmp/lens_modecont.js`
(ATM/g=0 finiteness). Self-adversarial: the intra-band two-leg basis split and the ln γ close-side coordinate trap
were hunted as the two ways lensed settlement could leak; both are gated, neither papered over._

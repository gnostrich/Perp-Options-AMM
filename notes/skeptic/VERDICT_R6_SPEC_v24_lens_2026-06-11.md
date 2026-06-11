# SKEPTIC VERDICT #29 — R6 RE-GATE of `specs/SPEC_v24_lens_BUILD_2026-06-11.md` (2026-06-11)

Mandate: operator entry 95 verbatim ("skeptic, you have the mandate, have the needful done"); operator
ASLEEP. My FLAG halts the build. READ-ONLY; every contested number independently re-derived against the
LIVE base build `engine/builds/temporal_mvp_v24_rebase_fixed_2.html` (scripts `/tmp/sk_r6*.js`). This
closes verdict #28 (`VERDICT_V24_LENS_2026-06-11.md`).

## DECISION: **CLEAR-TO-BUILD (Stage 1 may dispatch)** — with **2 HALT-CLASS must-apply notes** the
## intern MUST receive, and 2 record FLAG-OVERSELLs (non-blocking). The #28 FLAG-HALT is CLEARED.

All five #28 fixes are genuinely present and the core math survives attack. I am NOT halting. But one
residual wiring trap (the spec's OWN §1.2 funding formula re-opens BLOCKER 1) is serious enough that an
intern reading it literally mis-wires; it is closed by a single unambiguous build rule, which I state
below as a binding condition. Both must-apply notes are within the locked architecture — no operator
input needed.

---

## The five #28 fixes — each CONFIRMED closed

**Fix 1 — BLOCKER 1 (carry #4 / lens origin): RESOLVED in substance.** The ln γ marginal-vs-carry offset
reproduces EXACTLY: ln(mp)−ln(P) = 0 / 0.4055 / 0.9694 / 1.7346 nats at w = .5/.6/.725/.85 = ln γ exactly
(`/tmp/sk_r6.js`). The coordinate-invariance argument (a) HOLDS — when each consuming layer measures u as
a displacement **from its own live mode**, the price-coord displacement is the negated sNorm-coord
displacement, so `|u|` (hence `g_loc`) is identical; verified `g_loc` matches to 1e-12 across coordinates
when measured this way (`/tmp/sk_r6b.js`). NOTE the spec's wording "the two modes are the same physical
mode expressed reciprocally" is LOOSE: `modeP·modeS = y/x = P` (here 3.0), NOT 1 — the modes are NOT
exact reciprocals. The offset cancels because each layer subtracts ITS OWN mode (the ln γ is a constant
that drops out of a same-coordinate displacement), not because the modes are reciprocal. The hard rule (b)
"never mix ln(marginal) against sNorm-registered strikes" is the real safety mechanism. **See MUST-APPLY-1
— the spec's own §1.2 funding sub-block violates rule (b).**

**Fix 2 — BLOCKER 2 (funding #9): RESOLVED in substance.** Swap of v24's hardcoded ±2 (base L2086,
confirmed in live source) → ±g_loc(K) with γ read live as w/(1−w) is correct. Behavior reproduces: →0 at
ATM (g_loc(0)=0), →γ in the wings, sign from wing unchanged (`/tmp/sk_r6.js`). "γ read live" is correct
given `arbitrageToOracle` re-equilibrates w along the hyperbola — γ is whatever the live reserves give.
**FLAG-OVERSELL-A (record): the §2.3 illustrative table uses an implied γ≈1.204, NOT the γ=2.6364 (w=0.725
"steep pool") its own header claims** (wing g_loc saturates at 1.18, not 2.64; reverse-solved
`/tmp/sk_r6d.js`). The behavior is right; the table NUMBERS are at the wrong pool. Do not cite the table
digits as the steep-pool result.

**Fix 3 — inventory disposition table: PRESENT, complete.** §5 dispositions #4/#5/#8/#9/#11/#13 + pool /
lens / settlement + both v24 known-gaps. No silent omission. (FLAG-OVERSELL-B on the #5 row's mechanism —
see below — but the row is present and the conclusion is right.)

**Fix 4 — R3 steepness-control row: PRESENT, correct.** §6 dispositions steepness = v24 derived-w (no
slider, set at pool init, moves on trade) and τ = the single NEW static knob. Matches my #28 demand.

**Fix 5 — L4 hard ban on lensed-slope-as-INPUT: STRONG ENOUGH.** §4 L4 names the specific prohibited
operations (no "warp until viewed slope hits X" helper, no inverse-lens root-find, arb-to-oracle stays
lens-free), with the rationale (1/h″ ≈ 3.6e6 blow-up bites only an inverse solve). An intern cannot read
this as licence to wire an inverse solve.

**Staging — S1/S2 acceptance well-defined; S1 genuinely independently shippable.** Stage 1 (read layer)
runs on a BYTE-IDENTICAL v24 pool (gate item 1: tradeUpdate byte-identical ∀τ), so it ships without S2.
Stage 2 (warp/observable + L4 grep-audit + mode-crossing smoke) is correctly the dependent stage. Each
stage has its own self-check gate + tester smoke-pass. Sound.

---

## MUST-APPLY-1 (HALT-CLASS — the wiring trap I found; build does not proceed without this fix)

**The spec's own §1.2 funding sub-block re-introduces the exact ln γ hazard BLOCKER 1 claims to close.**
It writes, for the funding layer:
```
u(K) = ln( theta_K_price / 1 )   ... u(K) = ln(theta_K) − ln(mode_in_price)
```
But `theta_K` is the strike's REGISTERED ray, which lives in the **sNorm** coordinate (it is the same
`strike_theta` argument v24's `fundingPerStrike` passes to `mark`, compared against sNorm). Pairing the
sNorm-registered `theta_K` with a PRICE-coordinate mode is precisely the coordinate-MIX the spec's own
hard rule (b) forbids. Reproduced (`/tmp/sk_r6c.js`, steep pool w=0.725): at the ATM strike the correct
sNorm wiring gives u=0, g_loc=0 (funding vanishes — the whole point of §2.3); the §1.2 mixed wiring gives
u=−0.9694, **g_loc=2.5185** — funding does NOT vanish at ATM and every strike is displaced by the factor
γ. This is the literal blocker.

**Binding fix (hand to intern verbatim):** *All three layers (mark, funding, settlement) compute the lens
moneyness in the SINGLE sNorm coordinate, against the live sNorm mode:*
```
u(K) = ln( theta_K / getSNorm(state) ),   g_loc(K) = γ · h′_τ(|u(K)|),   γ = w/(1−w)  (LIVE)
```
*The "funding reads S in the price coordinate" framing in §1.2 is a red herring — do NOT compute a
separate price-coordinate u for funding. One coordinate (sNorm), one mode (getSNorm), all three layers.*
This is exactly the shared-helper §2.4 already mandates; it must read u in sNorm, not price.

## MUST-APPLY-2 (defensive, lower — answers the manager's g=0 question)

g_loc(0)=0 at the exact ATM/mode strike ⇒ S* = K·0/(0+1) = 0 (flat-top center: value ∝ S^0 = flat). This
is FINITE and NaN-free: JS `Math.pow(Infinity,0)=1`, so `sNorm* = θ·((g+1)/g)^g → θ`, `c = 1/((g+1)·sNorm*)
→ 1/θ`, `S*=0` (verified `/tmp/sk_r6f.js`). **This is the limiting case of the already-accepted g<1
degenerate American-exercise reading (entry 93 #5), NOT a new break.** Tell the intern: S*=0 at the
flat-top center is the accepted degenerate reading, the value law evaluates finitely, do NOT treat it as
an error to "fix" or guard with a γ_min floor that would change the geometry.

## FLAG-OVERSELL-B (record, non-blocking) — the #5 rebase-row mechanism is self-contradictory

§5's #5 row asserts in one sentence both "rebase ... leaves w, sNorm, γ INVARIANT" AND "strikes
co-translate (θ→θ/r, **mode→mode/r**)." These cannot both hold. TRUTH (verified `/tmp/sk_r6e.js`, base
L1416 `tan(φ)=θ=K/oracle`): on rebase the oracle moves by r, w/sNorm/γ are INVARIANT (the mode does NOT
scale), while the strike ray θ=K/oracle scales by 1/r. Therefore u(K)−u_mode genuinely SHIFTS by −ln r —
and that shift is ECONOMICALLY CORRECT (a fixed-dollar strike's moneyness really did change when the
reference price moved). The build is SAFE provided u is read LIVE on every render (it is, by §1.2's "mode
read live"), because g_loc then recomputes from the current (θ_K, sNorm). So the lens behaves correctly
under rebase; only the row's stated MECHANISM ("mode→mode/r", "difference is fixed") is wrong. No build
impact given live reads — recorded so the false derivation isn't carried forward as settled truth.

---

## Survived attack (settled — do not re-litigate)
- Carry ln γ offset = ln γ exactly (`/tmp/sk_r6.js`).
- g_loc |u|-coordinate-invariance when measured own-mode (`/tmp/sk_r6b.js`).
- Funding →0 ATM / →γ wings / sign-from-wing (`/tmp/sk_r6.js`).
- g=0 ⇒ S*=0 finite, no NaN (`/tmp/sk_r6f.js`).
- AMM-tx-"through-the-lens" (entries 84/88/91/94) = the goal-seek read in the lensed view; the POOL
  executes plain Balancer (entry 93 #2 "just x y w that move"). Settled in my #28 JOB-1(c). The spec's
  "query-only, never touches the pool update" is faithful to this — NOT a dodge of the operator's
  write-through-lens language.
- Stage 1 independently shippable (byte-identical pool gate).

## Verbatim channel — HELD, no FLAG-PROCESS
Entries 84/85/88/91/93/94/95 verified verbatim in
`history/operator/2026-06-10_kurtosis-curve-family-brief.md` (the 2026-06-11 entries are appended to the
06-10 brief; there is no separate 06-11 session file, which is consistent with one continuous session).
The spec's citations to these entries are faithful.

## Convergence-alarm: LOW. The spec is self-adversarial (it hunts the coordinate-mix and the inverse-lens
hazard explicitly). The §1.2 funding trap is a residual it EXPOSED but then mis-wrote in its own formula —
a wiring slip, not laundering. The math spine survived every re-derivation.

## CLEAR-TO-BUILD: Stage 1 may dispatch once MUST-APPLY-1 and MUST-APPLY-2 are handed to the intern.
FLAG-OVERSELL-A/-B are for the record (do not cite §2.3 table digits; do not carry the #5 "mode→mode/r"
prose as truth). No operator decision required; the operator-tier flags (g<1 exercise meaning,
ATM-funding→0, τ calibration) are already accepted (entry 93 #5).

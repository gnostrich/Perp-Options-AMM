# Lens lifecycle + transact/goal-seek-at-the-shifted-trade-point — FEASIBILITY SPEC

_research-lead · 2026-06-12 · READ-ONLY (no engine edit, no git, no Aristotle). Operator entry 117._
_Build: `engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 7e1ae39b). Base `temporal_mvp_v24_rebase_fixed_2.html`._
_Scripts (node float64, engine primitives transcribed VERBATIM from HEAD lines 1600–1709, 1722–1772,
1900–2094, 2164–2183): `/tmp/lens117_engine.js`, `/tmp/lens117_partB.js`, `/tmp/lens117_obstruction.js`,
`/tmp/lens117_baseline.js`, `/tmp/lens117_obs23.js`, `/tmp/lens117_obs4567.js`,
`/tmp/lens117_obs5_divergence.js`, `/tmp/lens117_construal.js`, `/tmp/lens117_reconciled_rt.js`,
`/tmp/lens117_steelman.js`._

## HEADLINE VERDICT

**NOT constructible end-to-end as the operator pictures it. OBSTRUCTION FOUND (the regression root):
the lens slope `g_loc(K) = γ·h′_τ(|ln(K/mode)|)` is a MODE-RELATIVE object — it is 0 at the live mode
and grows toward the wings. The operator's two requirements are mutually exclusive on a single-point
pool with a mode-relative lens:**

- **"goal-seek SEES a steeper slope far out" (entry 113)** reads `g_loc(K)` with the mode pinned at
  spot — the steepness exists *only because* the mode is elsewhere.
- **"transact / goal-seek WRT the trade point far out" (entry 117)** wants to EXECUTE the swap at that
  far-out point. But executing there moves the mode TO that point, where `g_loc = 0` (the flat top).
  The steepness you wanted to trade against vanishes at the moment you arrive.

**Smallest counterexample (float64, `/tmp/lens117_reconciled_rt.js`):** K = 2× the mode, τ = 0.3,
γ = 1.5. Read from spot, `g_loc(K) = 1.377`. Move the reserves to the strike ray to "execute there":
the new live mode == θ_K, so `u = ln(θ_K/mode_new) = 0.000000 ⇒ g_loc = 0.000000`. The slope collapses
from 1.377 to 0.

**The only way to hold both** (read a far-out steepness while executing far out) is to measure `|u|`
from a STORED reference mode (pre-trade mode / deploy anchor) instead of the live mode. **That stored
scalar IS the (W) φ — the weight field in disguise — the v27 object the operator demoted.** This is
the same structural impossibility the GLOBAL-SKEW run already proved ("memoryless reserve→σ map CANNOT
restore a pre-trade slope target; σ must store history = independent DOF = (W) φ"), now reached from
the lens side. **The lens and the trade-point execution want DIFFERENT mode references; reconciling
them re-introduces the weight field = the regression root.**

This is exactly the ~100-regression pattern: every attempt to make the warp/slippage strike-dependent
at the execution layer keeps re-summoning a stored-history scalar (φ / σ / a moved mode), which IS the
weighted-curve the operator keeps demoting. The mode-relative lens cannot be a strike-dependent
*execution* mechanic without it.

---

## PART A — every lifecycle touchpoint, read-lens status + write-shifted feasibility

`g_loc(state, θ_K, τ) = γ·h′_τ(|u|)`, `u = ln(θ_K / getSNorm(state))`, γ = w/(1−w) LIVE, sNorm coord
(MUST-APPLY-1). All "read" entries below are present + forward in HEAD today.

| # | Touchpoint | Read-through-lens (HEAD) | Write-shifted-through-lens (entry 117) | Feasible? |
|---|---|---|---|---|
| 1 | Pool load / calibration | n/a (plain Balancer carve α=wX₀, β=(1−w)Y₀) | unchanged | ✅ trivial |
| 2 | Quote / pricing | `legPrice → markLensed(g_loc)` forward | no write | ✅ done |
| 3 | Option-value chart (curve-2) | drawn via `hTau`/`gLoc` forward | no write | ✅ done |
| 4 | **AMM-tx execution (the swap)** | `executeLeg`: dy = N·markLensed(θ_K)·oracle, **swap at SPOT (plain v24 `tradeUpdate`)** | move write to θ_eff or to the ray ⇒ **the obstruction** | ❌ see Part C / obstruction |
| 5 | **Warp / goal-seek** | "mode tracks marginal; lensed slope re-reads at shifted u" = **readout** (forward) | "goal-seek the lensed slope AT the trade point" ⇒ inverse solve OR moved mode | ❌ mode-relative tension |
| 6 | Settlement / close (S\*) | `markEff/legValueUnified → markLensed`, S\*=K·g/(g+1) forward | settle at θ_eff = a second strike ⇒ basis split | ⚠ ✅ only if θ_K stays the payoff strike |
| 7 | Funding | `fundingPerStrike`: ±g_loc, lens-aware mark, forward | no write | ✅ done |
| 8 | Portfolio / equity / P&L | `markLensed` forward (UI + engine, one helper) | no write | ✅ done |
| 9 | Liquidation | inherits the mark ceiling ≤1 (solvency) | no write | ✅ (bounded, O4) |
| 10 | Rebase | sNorm coord rebase-invariant; lens re-reads forward | commutes with any write that re-reads forward | ✅ (O6) |
| 11 | LP deposit / withdraw | plain-Balancer reserve accounting, lens-free | unchanged | ✅ trivial |

**The whole obstruction lives in rows 4 + 5 (the swap + the goal-seek).** Everything else is forward,
already done, or trivially inherited. The lens is a clean READ layer end-to-end; it is the WRITE-point
move that breaks.

---

## PART B — the lens-shifted effective trade point, forward, derived explicitly

The lensed view's accumulated coordinate (integral of the local exponent) is closed-form:
`q_lens(u) = ∫₀ᵘ g_loc du′ = γ·sign(u)·(√(τ²+u²) − τ) = γ·sign(u)·h_τ(|u|)` (since
`∫ u′/√(τ²+u′²) du′ = √(τ²+u²) − τ`). The pool's own log-price is `q_pool(u) = γ·u`.

**Forward effective-strike map** (`/tmp/lens117_partB.js`): the pool ray with the same pool-log-price
as the lensed view of θ_K is

> **u_eff = sign(u_K)·(√(τ²+u_K²) − τ) = sign(u_K)·h_τ(|u_K|)**,  θ_eff = mode·exp(u_eff).

This is a **pure forward map** — `h_τ` evaluated, no root-find, no `1/h″`. **Bounded: |u_eff| ≤ |u_K|**;
it SHRINKS toward the mode (the lens compresses the elbow) and recovers `u_K − τ` in the wings.
Verified bounded for all strikes (float64). **So a forward effective-strike DOES exist (skeptic #35
pt-4 confirmed).** The problem is not constructing θ_eff — it is what "execute there" means (Part C).

The goal-seek as a forward operation: "the mode tracks the marginal; the lensed slope at every strike
re-reads at the shifted moneyness `u_post = u_pre − d`, d = ln(mp′/mp)." This is a deterministic
**readout**, single-valued, no free parameter to root-find. It is well-posed — but it is a *view
update*, not a *write relocation*.

---

## PART C — obstruction hunt: CLOSED / OPEN per candidate

| # | Obstruction | Verdict | Evidence (float64) |
|---|---|---|---|
| **1** | **Round-trip / path-independence** | **CLOSED — not introduced by the shift** | `tradeUpdate` keeps α,β as flow invariants ⇒ same-dy reversal is EXACT (x,y err 0.0). Premium-sized open/close DRIFTS (x err 1.2e-2, y err 5.2e2) — but **HEAD already drifts identically** (premium re-reads at the moved state); the shift changes the dy SIZE, not the reversal law `dy_R=−dy_F`. `/tmp/lens117_obstruction.js`, `/tmp/lens117_baseline.js` |
| **2** | **Goal-seek fold / well-posedness** | **CLOSED forward / OPEN if inverted** | `G(dy)` (observable lensed slope vs cash) is single-valued FORWARD; NON-MONOTONE with 1 fold at the mode-crossing (side-of-mode `|u|`). A naive build that SOLVES dy from a target G is two-valued near the fold = ill-posed. The intended mechanic (premium-sized, entry 116) is forward ⇒ on the well-posed side. `/tmp/lens117_obs23.js` |
| **3** | **No hidden inversion** | **CLOSED for the forward mechanic; the inverse target-slope goal-seek is the only inverting path** | `1/h″(u) = (τ²+u²)^1.5/τ²` blows up in the wings (12.6 / 91.9 / 5701 at u = 1/2/8). Per-touchpoint audit: quote, θ_eff, dy-sizing, settlement S\*, funding, portfolio, rebase are ALL forward. ONLY "solve dy from a target lensed slope" inverts ⇒ banned by L4. `/tmp/lens117_obs23.js` |
| **4** | **Solvency under the shifted write** | **CLOSED** | `markLensed ∈ [0,1]` global (min 1.9e-2, max 1.000000). θ_eff is nearer the mode ⇒ m(θ_eff) ≥ m(θ_K) (ratio 2.04 → 1.32 ATM→wing) but STILL ≤ 1 ⇒ per-leg payout ≤ N, v24 reserve bound inherited. `/tmp/lens117_obs4567.js` |
| **5** | **Single-basis consistency** | **OPEN / the two-strike-per-leg hazard** | A shifted write gives a leg TWO rays: θ_K (settles/pays off) and θ_eff (sizes the write). m(θ_K)=0.146 vs m(θ_eff)=0.228 at K=1.5× ⇒ GAP 0.083; if the WRITE uses one and SETTLE the other, open-then-immediate-close ≠ 0 (REAL basis leak). Single-basis holds ONLY if there is exactly ONE premium per leg ⇒ θ_eff is NOT a second sizing strike ⇒ the write reduces to HEAD. `/tmp/lens117_obs5_divergence.js` |
| **6** | **Rebase / carry commute** | **CLOSED** | rebase: w, sNorm invariant; g_loc(K) pre==post (1.205826) — sNorm (ratio) coord is rebase-invariant; θ_eff = mode·exp(u_eff) inherits it. `/tmp/lens117_obs4567.js` |
| **7** | **Pool invariant byte-identical** | **CLOSED IF premium-sized spot swap; BROKEN IF execute-at-the-ray** | If the shift only changes how dy is SIZED, `tradeUpdate` stays byte-identical plain v24 (only the dy input differs). If "land at the trade point" means MOVE the reserves to the ray then trade, that is FORK A (a different swap), not byte-identical. `/tmp/lens117_obs4567.js` |

### The decisive divergence — what "shifted write" means (three construals, they do NOT agree)

| | Mechanic | Forward? | Delivers entry-113 "more slippage/$ OTM"? | Cost |
|---|---|---|---|---|
| **(I)** | size dy from m(θ_eff), spot swap | ✅ forward | ❌ — gives the OPPOSITE: at fixed premium-$, dy = prem$·(m_eff/m_K), ratio GROWS toward ATM ⇒ MORE slippage near ATM, LESS OTM (`/tmp/lens117_steelman.js`) | O5 basis split unless θ_eff also becomes the settlement strike (= strike moved) |
| **(II)** | goal-seek pool marginal to the lensed slope at θ_K | ❌ inverse | n/a | O2 fold + O3 `1/h″` blow-up = the regression hazard |
| **(III)** | HEAD as-is: m(θ_K) sizes dy, spot swap | ✅ forward | ❌ — spot swap strike-blind (MEMORY entry-113: pool-slip% flat 8.33%) | none — but the WRITE point is NOT lens-shifted (the operator's ask is not met) |

**No construal is whole.** (I) is forward + solvent + round-trip-safe but gives the *wrong slippage
direction* and needs a strike-move to stay single-basis. (II) gives the right intuition but is the
inverse-solve regression. (III) is HEAD — already shipped, forward, clean, but does not shift the
write at all. And the genuinely strike-dependent EXECUTION the operator wants (entry 113) requires a
mode-relative slope read from a NON-live (stored) mode = the weight field (the headline obstruction).

---

## What the operator is "missing" (entry 117, answered directly)

The lens steepness is **relative to the live mode**, not an absolute property of a strike. You can
SEE a steeper slope far out (mode at spot) OR you can EXECUTE far out (mode moves there) — **not both
at once**, because arriving at the far-out point makes IT the mode (slope → 0). The "effective trade
point seen through the lens" is a coherent VIEW (Part B, θ_eff forward, bounded), but it is not a place
you can move the live reserves to and still read the steepness you came for. The only object that lets
you read a far-out steepness while trading there is a **stored reference mode** = (W)'s φ = the
weighted curve. That is why every push toward strike-dependent execution keeps re-summoning the weight
field — it is the same structural impossibility, not a fixable bug. The regression you keep fighting is
this category error surfacing in different disguises.

## What IS constructible (the honest, whole subset)

- The full lifecycle **READ** through the lens (rows 1–3, 6–11): already in HEAD, forward, clean,
  single-basis, solvent, rebase-commuting.
- The forward **effective-strike θ_eff** as a VIEW/display/attribution coordinate (Part B) — bounded,
  no inversion. Safe to expose as a *label* on the existing spot swap; it does NOT change the write.
- **Not** constructible without re-introducing the weight field: a strike-dependent EXECUTION /
  trade-point-anchored swap whose slippage rises OTM at fixed premium AND whose lensed slope is read
  from a non-live mode.

## Honest carry / scope

- This is decision-support, NOT build-auth. The A-vs-B / trade-point-object decision (spot-swap vs
  trade-point-warp) is **operator-tier** (entries 31/33/38/88; MEMORY entry-113) — flagged to the
  manager, not decided here.
- **No Lean obligation ready.** The impossibility is algebraic (mode-relative `g_loc` + the
  stored-mode ⇒ φ identity, already a numeric fact from the GLOBAL-SKEW run); the forward θ_eff map is
  a closed-form readout, not a theorem. A candidate lemma — "any map giving a far-out lensed slope
  while executing at the far-out point requires a state-independent stored mode" — is a restatement of
  the GLOBAL-SKEW structural-impossibility and would only be worth pinning if the operator wants the
  no-go formalised. Nothing submitted/built/edited/git.
- Self-adversarial: I steelmanned the two-layer model (entry 114) and the forward effective-strike
  re-size (construal I) and BOTH fail to deliver entry-113's slippage direction; I confirmed the
  forward θ_eff exists (not a "can't be done") and isolated the obstruction to the mode-relativity of
  the slope, not to the lens construction.

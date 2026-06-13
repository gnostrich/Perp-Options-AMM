# SKEPTIC VERDICT — lens-effective transaction strike (θ_tx) formalization
date 2026-06-13 · artifact: manager's synthesized "transact at the inverse-lens image" model
(operator entries 214/215/216, ties back to 118/197/198/199) · HEAD `de28c937` engine lens
(`hTau`/`hpTau`/`lensU`/`gLoc`, L1630-1645; `executeLeg` L1765). Read-only. All numbers
re-derived live: `/tmp/lens_tx.js`, `/tmp/lens_steep.js`, `/tmp/lens_polarity.js`,
`/tmp/lens_premium.js`, `/tmp/seam.js`.

## BOTTOM LINE
- **Model-confirmed: PARTIAL.** The PARSE of entry 216 ("transact at what looks like the true
  strike" = transact at the actual point whose lensed APPEARANCE equals the chosen strike) is
  correct, and it does contradict & supersede the manager's prior "transact at the true raw
  point" (operator rejected that at 216). The DIRECTION the manager attached to it is **WRONG
  under today's engine lens.**
- **τ-direction: FLAG-WRONG.** Under the engine's actual `h_τ(u)=√(τ²+u²)−τ`, a **SHARPER** lens
  (smaller τ, per L1321) pushes θ_tx **LESS** far out, not further. The operator's signed
  direction (entry-118 "sharper OTM++") requires the OPPOSITE polarity. Today's `h_τ` cannot
  deliver it. Numbers below.
- **Build well-defined: NO.** Two operator-tier holes remain (the τ-polarity the operator must
  ratify, and the freeze-vs-live-mode choice that the round-trip depends on). Do not build yet.

---

## 1. PARSE — does the manager's model match the operator's words?

YES on the structural reading, and it is a genuine correction of the manager's own prior reading:
- Entry 215 (verbatim): *"when you see something thru warp your transacting further otm than it
  appears."* — the actual transaction point is FURTHER OTM than the apparent (chosen) strike.
- Entry 216 (verbatim): *"no you transact at what looks like the true strike"* — you do NOT
  transact at the raw chosen point itself (the manager's rejected "Reading X"); you transact at
  the point whose **appearance through the lens** equals the chosen strike.

Put in one plain-English sentence (no invented vocabulary): **you pick a strike on the screen; the
screen is the lensed view; the pool actually swaps at the real strike that, after the lens
squashes it inward, lands on the screen where you picked.** Since the lens squashes inward, that
real strike is further from the money than where you pointed. So θ_tx = the inverse-lens image of
the chosen strike. That matches the manager's "θ_tx = INVERSE lens image, further out than raw."
**This half is confirmed.** The contradiction with the manager's earlier "transact at the true raw
point" is real and the operator settled it against the manager at 216.

## 2. THE MAP — exact, on the live engine lens

The engine lens enters pricing ONLY through the *exponent* `g_loc(K)=γ·h′_τ(|u|)`,
`u=log(θ_K/mode)`, `mode=getSNorm(state)` (L1639-1644). The natural appearance-coordinate map
(distance-from-mode in the lensed view) is `h_τ` itself:

> apparent log-distance `a = h_τ(u) = √(τ²+u²) − τ`.

This IS a compression: `√(τ²+u²) < |u|+τ` ⇒ `h_τ(u) < |u|` for all u≠0, 0 at the mode (matches
entry-118 "zero effect at the mode"). Inverting (your algebra checks out — I re-derived it, did
not trust it):

> `(a+τ)² = τ²+u²` ⇒ `u_tx = √(a² + 2|a|τ)·sign(a)`, **θ_tx = mode·e^{u_tx}.**

Round-trip exact to 1e-12 (`/tmp/lens_tx.js`). θ_tx is further from the mode than the chosen strike
(expansion: `u_tx > |a|` always), bounded, forward, single-valued. So the map is well-formed —
the problem is its τ-polarity (§3) and its mode-dependence (§4).

## 3. τ-DIRECTION — the headline FLAG-WRONG (numbers)

Chosen strike = 2× the mode (call-side OTM), so chosen log-distance `a = ln 2 = 0.69315`.
θ_tx = inverse-lens image under the engine's `h_τ`:

| τ (L1321: smaller = sharper) | u_tx = √(a²+2aτ) | θ_tx / mode | expansion u_tx/a |
|---|---|---|---|
| 0.05 (sharpest) | 0.74146 | **2.099×** | 1.07 |
| 0.3  | 0.94675 | 2.577× | 1.37 |
| 1    | 1.36629 | 3.921× | 1.97 |
| 3 (flattest) | 2.15391 | **8.619×** | 3.11 |

**SHARPER (τ↓) ⇒ θ_tx CLOSER in (2.1×), FLATTER (τ↑) ⇒ θ_tx FURTHER out (8.6×).** This is the
EXACT OPPOSITE of entry-118 "sharper OTM++." Cross-checks, same direction, three independent
quantities (`/tmp/lens_steep.js`, `/tmp/lens_premium.js`):
- compression amount `a−h_τ(a)`: 0.048 at τ=0.05 vs 0.614 at τ=3 — sharper lens compresses LESS,
  i.e. a far OTM strike looks LESS close when the lens is sharper. This also breaks the operator's
  own entry-214 PREMISE ("steeper graph ⇒ further OTMs look closer").
- premium ψ at the fixed 2× strike: 0.093 at τ=0.05 vs 0.235 at τ=3 — sharper lens makes the
  option look WORTH LESS / deeper OTM, not closer.

The two senses of "the lens" point in opposite τ-directions and the build cannot have both:
1. The **steepness/exponent** `h′_τ`: sharper τ ⇒ steeper graph-2 (→γ). This matches L1321 and
   entry-214's "graph 2 steeper" half — and it is what the engine already draws.
2. The **coordinate compression** `h_τ`: sharper τ ⇒ LESS compression ⇒ looks LESS close.

The operator's chain ("steeper ⇒ looks closer ⇒ transact further OTM, and sharper makes it more")
silently assumes these two move together. **Under `h_τ` they move opposite.** So the operator's
direction is NOT realizable by inverting today's `h_τ`. To get "sharper ⇒ θ_tx further out" you
need a different appearance map whose compression GROWS as τ→0 — i.e. the **τ-in-denominator
("fatness = 1/τ")** family, the same polarity the skeptic flagged before (MEMORY F6: "fatness dial
= 1/τ, never ship τ-up = fatter"). That is a CURVE/lens-definition change, operator-tier — I do
not propose the fix; I name that today's lens has the wrong sign for this mechanic.

## 4. NO-ARB / SOLVENCY / SEAM

- **Bigger swap, reserve guard.** θ_tx further out ⇒ dy = N·θ_tx·oracle is strictly larger than the
  current N·K·oracle. The §2.3 / A14 DEPTH_FRAC=0.90 guard (L1786-1791) still fires but now on a
  bigger number, so more legs reject. Not a leak — but the operator should know the at-strike
  capacity shrinks (e.g. at τ=3 a 2× strike swaps 8.6×, vs 2× today).
- **Round-trip / free-round-trip — REAL CONTRADICTION in the brief.** The current build round-trips
  EXACTLY (L2035-2052) only because the reversal uses the STORED dollar strike `K_inner`
  (oracle-drift-invariant, mode-INDEPENDENT). θ_tx is **mode-dependent** (`lensU` reads
  `getSNorm(state)`, which MOVES on every trade). If θ_tx is recomputed live at close (the brief
  says "φ-free, live-mode read, no stored mode"), open and close θ_tx differ and the reversal does
  NOT cancel the open: `/tmp/seam.js` shows a $529 residual on a single 1-BTC leg for a mode drift
  1.00→1.08 at τ=0.3 — a non-zero reserve leak / re-opened free round trip (entry-199 single
  option). **The brief's "live-mode read, no stored mode" requirement is incompatible with the
  round-trip exactness the current build relies on.** θ_tx MUST be frozen at entry (stored, like
  K_inner) — that is the only way the reversal cancels. This is an operator-tier mechanic choice,
  not an intern detail.
- **Settlement seam.** Entry 198: ITM ⇒ no AMM tx, intrinsic+extrinsic paid directly by formula
  (`markLensed` at the chosen strike). That payout already reads the lensed value at the CHOSEN
  strike. Transacting the OPEN/CLOSE pool swap at θ_tx (further out) while paying settlement at the
  chosen strike means the trader's pool-swap basis and their settlement basis are DIFFERENT strikes
  — that is precisely a two-basis seam, the class of bug entry-198 was meant to close. Whether this
  re-opens a free trade depends entirely on the freeze choice above; with a live θ_tx it does (the
  $529 residual is the trader's free extraction). With a frozen θ_tx the pool round-trips but the
  settlement-vs-swap basis gap still needs an explicit operator ruling that it is intended.

## 5. VERDICT

**Build is NOT well-defined.** Two operator-tier holes, both must close before any intern pass:

1. **τ-polarity [FLAG-WRONG / operator-tier].** Today's `h_τ(u)=√(τ²+u²)−τ` gives sharper ⇒
   θ_tx LESS far out — opposite of the operator's signed entry-118 direction. The operator's
   direction is the spec; today's lens has the wrong sign for it. The operator must ratify either
   (a) keep `h_τ` and accept "flatter ⇒ further out" (contradicts his own words — almost certainly
   not what he means), or (b) move to the τ-in-denominator / 1/τ-fatness lens that makes sharper ⇒
   further out. I name the hole; I do not pick the lens (curve/invariant = operator's call, §0).

2. **Freeze-vs-live-mode [FLAG / operator-tier].** θ_tx is mode-dependent; the round-trip
   exactness the current build guarantees requires θ_tx FROZEN at entry (stored, like K_inner).
   The brief's "live-mode read, no stored mode" requirement breaks the round-trip ($529 leak on a
   single leg, `/tmp/seam.js`). Operator must confirm θ_tx is frozen at open; and confirm the
   intended swap-basis(θ_tx)-vs-settlement-basis(chosen K) gap.

ONLY IF both are ruled does this become one intern pass — and then the change is narrow: in
`executeLeg` (L1780-1781) replace `K_usd = theta_inner·fx` with the FROZEN θ_tx-in-dollars
(`θ_tx·fx`, θ_tx stored on the leg at open and reused at close like K_inner at L2046-2047), with
gate additions: (g-tx1) θ_tx = lens-inverse of the registered strike, expansion `θ_tx≥θ` exact;
(g-tx2) the chosen τ-polarity numerically pinned (sharper ⇒ further, per the operator's ruling);
(g-tx3) open/close reversal still cancels to machine zero with θ_tx frozen (round-trip exact);
(g-tx4) DEPTH_FRAC reject now fires on N·θ_tx·oracle. But that is downstream of the two rulings.

**Do not let "transact at the inverse-lens image" be encoded as settled until the operator fixes
the τ-polarity** — the inverse map is clean, but on today's lens it points the wrong way, and
shipping it would be the third build in a row to go backwards on the τ-direction (MEMORY F6,
patterns #10/#11).

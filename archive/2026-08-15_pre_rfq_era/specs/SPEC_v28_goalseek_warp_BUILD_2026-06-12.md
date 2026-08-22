# SPEC — v28 goal-seek warp (item #16) on the lens architecture — BUILD ADJUDICATION

_research-lead · 2026-06-12 · READ-ONLY produced (NO engine edit, NO git, NO Aristotle)._
_Build audited: `engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 `7e1ae39b`)._
_Engine primitives transcribed VERBATIM from HEAD L1600–1772; float64 checks
`/tmp/gsw_spec_check.js`, `/tmp/gsw_spec_check2.js`._
_Prior pieces built on, not re-derived: skeptic #39 (`notes/skeptic/VERDICT_GOALSEEK_WARP_far_otm_2026-06-12.md`);
entry-117 feasibility (`notes/research/LENS_lifecycle_transact_goalseek_FEASIBILITY_2026-06-12.md`);
magnitude note (`notes/research/GOALSEEK_WARP_magnitude_far_otm_2026-06-12.md`);
`specs/SPEC_v24_lens_BUILD_2026-06-11.md`._

---

## VERDICT (read this first): **BLOCKED** for the write-relocating goal-seek warp.
## **INTERN-READY** for the bounded forward θ_eff *attribution layer* (the whole, honest subset).

The task asks for "the trade lands at the lens-shifted trade point θ_eff and the curve warps
there, bounded." There are **two readings** of "lands at θ_eff," and the float64 evidence
separates them cleanly:

- **Reading R1 — "relocate the WRITE to θ_eff" (move the reserves / size+settle a leg at θ_eff
  as a second strike):** **BLOCKED.** Two independent obstructions are OPEN, neither closeable
  forward/bounded, and both are exactly the #101 regression class. **DO NOT BUILD R1.**
- **Reading R2 — "expose θ_eff as a forward, bounded VIEW/attribution coordinate on the
  existing plain-v24 spot swap" (one premium per leg at θ_K, pool byte-identical):**
  **INTERN-READY.** Forward-only, bounded, round-trip-exact, single-basis, solvent. This is the
  minimal correct build that honours the operator's "test the through-lens airtight" without
  re-introducing the weight field.

This is not hedging: **R1 is the thing that keeps re-summoning the demoted (W) weight field**;
R2 is the bounded forward object skeptic #39 confirmed exists. I report both and recommend R2.

---

## §0. THE BLOCKER, stated up front (the most valuable output — prevents regression #101)

Two OPEN obstructions block R1. Both reproduced cold in float64.

### BLOCKER-A — mode-collapse: "arriving at θ_eff" zeroes the slope you came for
`g_loc(K) = γ·h′_τ(|u|)`, `u = ln(θ_K / getSNorm(state))` is **MODE-RELATIVE** — it is 0 at the
live mode and grows toward the wings. If "land at the trade point" means **move the reserves so
the live mode == θ_K** (genuinely execute there), then `u → 0` and the lensed slope **collapses
to 0** — the steepness you wanted to warp against vanishes at the instant you arrive.

> **Smallest counterexample (`/tmp/gsw_spec_check.js` CHECK 4):** K = 2× the mode, τ = 0.3,
> γ = 1.5. `g_loc(θ_K)` read from spot = **1.376597**. Move the mode to θ_K (`w = 1/(1+θ_K)`):
> `g_loc(θ_K) = 0.000000`. Collapse, exactly as entry-117 found.

The only object that holds a far-out steepness WHILE executing far out is a **stored reference
mode** measured from a non-live anchor — and that stored scalar **IS the (W) φ = the weight
field = the demoted v27 object**. Reconciling "read steep far out" with "execute far out"
re-introduces the weight field. This is the structural impossibility the GLOBAL-SKEW run already
proved, reached from the lens side. It is **not** a tuning bug; it is a category error.

### BLOCKER-B — two-strike basis leak: write@θ_eff while settle@θ_K is a real arb
If instead "land at θ_eff" means **size the write at θ_eff but keep θ_K as the payoff/settlement
strike** (a leg gets two rays), open-then-immediate-close is **not** zero — a real basis leak,
forbidden by the no-arb/solvency contract (entry-117 O5, §11.C of the v24 lens spec).

> **(`/tmp/gsw_spec_check2.js` O5):** `m(θ_K)` vs `m(θ_eff)`, call, w=0.6, τ=0.3:
> K=1.5× gap **0.082563**; K=2× gap **0.035796**; K=4× gap **0.015091**. If the write uses one
> mark and settle the other, `raw_net ≠ 0` on an instant round-trip = a same-state arb.

Single-basis holds **only if there is exactly ONE premium per leg.** If θ_eff is that one
premium, then θ_eff has *become* the strike (= R1 + BLOCKER-A applies, mode collapses on arrival,
and the payoff strike has silently moved — an undisclosed settlement-semantics change =
operator-tier). If θ_K is that one premium, the write is **not** relocated = R2.

**There is no forward, single-basis construal in which the WRITE relocates to θ_eff AND the
slope there is non-zero AND the payoff strike is unchanged.** Pick any two; the third breaks.
That is why R1 is BLOCKED, not merely hard.

### Self-adversarial: I tried to close R1 and could not
- *Construal (I) — size dy from m(θ_eff), spot swap (forward, solvent):* gives the **opposite**
  slippage direction (more near ATM, less OTM) and still splits the basis (O5) unless θ_eff
  becomes the settlement strike. Fails the operator's intent.
- *Construal (II) — goal-seek the pool marginal to a target lensed slope at θ_K:* **inverts** the
  lens (`1/h″ → ∞`, 12.6/91.9/5701 at u=1/2/8), the L4-banned regression hazard. Fold + blow-up.
- *Construal (III) — HEAD as-is:* forward, clean, but the write is **not** relocated = R2.

None is whole for R1. The strike-dependent EXECUTION the operator pictures needs a non-live
(stored) mode = the weight field. **BLOCKED is the correct verdict for R1.**

---

## §1. THE BUILDABLE OBJECT (R2) — exact change-set

R2 keeps the pool **byte-identical plain v24** and the existing W2 single-premium spot swap, and
adds a **forward, bounded θ_eff attribution coordinate** (a label/view), gated to never feed the
write. This is the "look through the lens at the trade point" the operator wants, made airtight.

### 1.1 The new forward primitive (ADD to the Engine IIFE, near `gLoc`/`hTau`, L1630–1666)

```js
// Forward lens-shifted effective trade point (VIEW / attribution ONLY — never sizes a write).
// u_eff = sign(u)·h_τ(|u|);  θ_eff = mode·exp(u_eff).  Pure forward: h_τ evaluated, NO root-find,
// NO 1/h″, NO inversion. Bounded: |u_eff| ≤ |u| (shrinks toward the mode; recovers |u|−τ in wings).
// L4-COMPLIANT: takes (state, θ_K, τ) forward; returns a coordinate, takes no slope as input.
function thetaEff(state, theta_K, tau) {
  const mode = getSNorm(state);
  const u = lensU(state, theta_K);           // sNorm coordinate (MUST-APPLY-1)
  if (!isFinite(u)) return NaN;              // loud, never e^0
  const u_eff = Math.sign(u) * hTau(Math.abs(u), tau);   // bounded |u_eff| ≤ |u|
  return mode * Math.exp(u_eff);
}
```

`Engine.thetaEff` exposed alongside `Engine.gLoc`/`Engine.markLensed`.

### 1.2 Exact lines/functions that CHANGE vs stay byte-identical

| Function (HEAD line) | Change? | Detail |
|---|---|---|
| `tradeUpdate` (L1679) | **BYTE-IDENTICAL** | the pool swap is UNCHANGED plain v24. The warp does NOT require a new pool update. (Answer to obstruction-gate (e): **NO, the pool function does not change.**) |
| `executeLeg` (L1761) | **BYTE-IDENTICAL** | still: `dy = (wingSign·legSign)·V_usd`, `tradeUpdate(state,dy)`, **one** lensed premium `p.V` sized at θ_K. The write is NOT relocated. |
| `legPrice` (L1722) | **BYTE-IDENTICAL** | one premium per leg at θ_K (W2). NOT re-sized at θ_eff. |
| `gLoc`/`markLensed`/`hTau`/`hpTau`/`lensU` | **BYTE-IDENTICAL** | the one shared read helper, unchanged. |
| **`thetaEff`** (NEW) | **ADD** | the forward attribution coordinate of §1.1. Display/log only. |
| Trade-preview / trade-log UI consumer | **ADD-ONLY** | display `θ_eff` (and optionally `g_loc(θ_K)` = the lensed slope felt) as an attribution label next to the executed leg. READ of `Engine.thetaEff`/`Engine.gLoc`; touches no write path. |

**Net diff ≈ one helper + one display read.** No pool change. No settlement change. No new strike.

---

## §2. THROUGH-LENS lifecycle touchpoints — single-basis, forward-read, consistent (the "airtight" test)

Every touchpoint, with R2 applied. **No touchpoint inverts the lens.** All reads are the ONE
shared `gLoc`/`markLensed` at the live mode (the one-helper rule, §11 of the v24 lens spec).

| # | Touchpoint | Basis | Forward? | Status under R2 |
|---|---|---|---|---|
| 1 | Pool load / calibration | plain Balancer α=wX₀,β=(1−w)Y₀ | — | unchanged ✅ |
| 2 | Pricing / quote (`legPrice`→`markLensed`) | one lensed premium @ θ_K | ✅ | unchanged ✅ single-basis |
| 3 | Option-value chart (curve-2, `hTau`/`gLoc`) | lensed view | ✅ | unchanged ✅ |
| 4 | **AMM-tx execution (`executeLeg`→`tradeUpdate`)** | one premium @ θ_K, plain v24 swap | ✅ | **byte-identical; θ_eff is a LABEL beside it, not a sizing input** ✅ |
| 5 | **Warp / goal-seek view** | forward θ_eff readout | ✅ | **NEW — `thetaEff` forward, bounded, no inversion** ✅ |
| 6 | Settlement / close (S\*=K·g/(g+1)) | θ_K stays the payoff strike | ✅ | unchanged ✅ — θ_eff NEVER the settlement strike (else BLOCKER-B) |
| 7 | Funding (±g_loc, lens-aware mark) | lensed @ θ_K | ✅ | unchanged ✅ |
| 8 | Portfolio / equity / P&L (`markLensed`) | lensed @ θ_K, one helper | ✅ | unchanged ✅ |
| 9 | Liquidation | mark ceiling ≤ 1 | ✅ | unchanged ✅ |
| 10 | Rebase | sNorm-coord invariant | ✅ | unchanged ✅ — θ_eff = mode·exp(u_eff) inherits invariance |
| 11 | LP deposit / withdraw | plain reserve accounting | — | unchanged ✅ |

**Single-basis invariant (binding):** every leg has **exactly one premium**, computed by
`markLensed` at θ_K against the live sNorm mode. `θ_eff` is **display-only** and is NEVER used to
size a write or to settle. This is precisely the boundary BLOCKER-B forbids crossing.

---

## §3. OBSTRUCTION GATES — each CLOSED by R2's construction (the regression-killers)

| Gate | Verdict for R2 | Construction that closes it (float64) |
|---|---|---|
| **(a) round-trip / path-independence** | **CLOSED** | one-premium-per-leg, `dy_R = −dy_F`, plain `tradeUpdate` (α,β flow invariants). `/tmp/gsw_spec_check2.js`: same-dy reversal x err **0**, y err **0**; one-basis open-then-close x/y err **0**. |
| **(b) NO inversion anywhere** | **CLOSED** | `thetaEff` is forward (`h_τ` evaluated). NO `1/h″`, NO root-find, NO slope-as-input. L4 preserved: `arbitrageToOracle`/`tradeUpdate` stay plain-Balancer, lens-free. |
| **(c) solvency** | **CLOSED** | `markLensed ∈ [0,1]` over the grid (w∈{.51,.6,.725,.85}×K∈{.2…20}×τ∈{.05,.3,1}, call+put): min **0.00298647**, max **1.00000000**. Pool covers settlement (one premium ≤ N, v24 reserve bound inherited). |
| **(d) monotonicity / well-posed** | **CLOSED** | `thetaEff` single-valued forward; `g_loc(\|u\|)` is `\|u\|`-symmetric, side-of-mode branch handled. The non-monotone fold appears ONLY if a target slope is inverted (R1/II) — which R2 does not do. |
| **(e) does the pool function change?** | **NO — stated plainly** | `tradeUpdate` is **byte-identical plain v24**. The warp is a forward VIEW, not a new pool update. (If R1 were built it WOULD need a different swap — BLOCKER-A/B — which is exactly why R1 is blocked.) |

**The bound (the operator's "bounded" requirement), float64:** the warp sensitivity gearing
`1/(∂g/∂w)` **saturates** (0.1063→0.1420→0.1586→0.1601→0.1602 at K=1.5×→100×, `/tmp/gsw_spec_check.js`
CHECK 5) — never the `1/h″→∞` runaway. `|u_eff| ≤ |u|` (CHECK 1, all strikes). `g_loc ≤ γ`. No
(ln K)³ channel exists (plain Balancer has the scalar w, no w(u) field) — skeptic #39 confirmed.

---

## §4. lens_selfcheck.js gate additions to lock R2

Append to `engine/verify/lens_selfcheck.js` (HARD), auto-routed by presence of `function thetaEff`:

1. **θ_eff bounded** — for a grid of (state, θ_K, τ): `|ln(θ_eff/mode)| ≤ |ln(θ_K/mode)| + 1e-12`
   AND `θ_eff` finite/positive. (catches an accidental amplifying map.)
2. **θ_eff forward / no-inverse-helper** — assert the source contains NO `1/h″`, no `hpp`/second-
   derivative reciprocal, and `thetaEff` takes no slope argument. Token-scan: no `solve`/bisection
   feeding `thetaEff`. (locks L4.)
3. **round-trip-zero** — open a leg (one premium @ θ_K) then close (exact `−dy`): x/y err == 0;
   `raw_net == 0` on instant round-trip. (catches a re-introduced two-strike sizing.)
4. **single-basis / no-θ_eff-in-write** — assert `executeLeg`/`legPrice`/settlement source is
   byte-identical to HEAD (md5 of the function bodies) and that `thetaEff` is referenced ONLY in
   the display/log layer, NEVER in `executeLeg`, `legPrice`, `closeBand`, or settlement. (catches
   BLOCKER-B — the regression killer.)
5. **bounded |warp| / saturating gearing** — `1/(∂g/∂w)` monotone-bounded ≤ 0.17 over K to 100×;
   `g_loc ≤ γ`. (catches an inverse-warp reintroducing the runaway.)
6. **pool byte-identical regression** — `tradeUpdate` source md5 == v24; `tradeUpdate(s,dy)`
   deterministic in dy only.

---

## §5. STAGING — minimal correct build, one intern pass

**R2 lands as ONE intern pass** (it is ~one helper + one display read + 6 gate lines; the pool,
pricing, settlement, funding, portfolio paths are all byte-identical, so there is no write-wiring
failure mode to isolate). Suggested order inside the pass:

1. Add `Engine.thetaEff` (§1.1) + export.
2. Add the trade-preview/log display read of `Engine.thetaEff` (+ optional `gLoc(θ_K)` slope label).
3. Add the 6 `lens_selfcheck.js` gates (§4); run `engine/verify/run_all.sh` green.
4. File-safety gate (2 blob md5s, 3 `<script>` parse) — unchanged, this edit touches neither blob.

**R1 is NOT staged — it is BLOCKED** (§0). Building R1 (relocating the write to θ_eff) requires
the demoted (W) weight field and would re-open the #101 regression. The operator must rule A-vs-B
(spot-swap vs a true trade-point-warp curve object) before any R1-class build — that is a
trade-mechanics / curve-object decision, **operator-tier**, flagged not decided.

---

## §6. ESCALATIONS (operator-tier, flag to manager — record-relay only, not decided here)

1. **A-vs-B / trade-point object** (entries 31/33/38/88/91/117/118/121): R2 gives the operator the
   bounded forward θ_eff VIEW he asked to "look through the lens at," but does **not** relocate the
   write. A true write-relocating warp (R1) is BLOCKED on this curve without re-introducing the
   weight field. New datum: on the lens, the write-relocation is not a tuning gap — it is the
   mode-relativity category error. This is the operator's curve/trade-mechanics call.
2. **Settlement semantics:** R2 keeps θ_K as the payoff strike (mandatory — moving it to θ_eff is
   an undisclosed settlement change + BLOCKER-B arb). If the operator WANTS the payoff strike to
   shift to θ_eff, that is an explicit settlement-semantics ruling, operator-tier.
3. **Slippage-felt rises OTM (operator vindicated, skeptic #39 half-3):** under a goal-seek you'd
   transact at the steeper lensed slope `g_loc(K)` (0→γ). R2 surfaces this as a *label*
   (`g_loc(θ_K)`), honestly, without changing the spot-swap execution. Whether to make execution
   actually feel that slope = the A-vs-B call (item 1).

**NO Lean obligation ready.** The buildable object (`thetaEff`) is a closed-form forward readout,
not a theorem; the blocker is the algebraic mode-relativity ⇒ φ identity (already a numeric fact
from the GLOBAL-SKEW + entry-117 runs). The one candidate worth pinning ONLY if the operator wants
the no-go formalised: *"any far-out lensed-slope-while-executing-far-out map requires a
state-independent stored mode"* — a restatement of the GLOBAL-SKEW structural impossibility.
Premature to submit. Nothing submitted/built/edited/git.

---

## BOTTOM LINE
- **R1 (write relocates to θ_eff): BLOCKED** — BLOCKER-A (mode-collapse, slope→0 on arrival) +
  BLOCKER-B (two-strike basis-leak arb), neither closeable forward/bounded; both = the #101
  regression class; closing them re-introduces the demoted (W) weight field. **Do not build.**
- **R2 (forward θ_eff attribution layer): INTERN-READY** — change-set in §1.2 (one helper + one
  display read, pool BYTE-IDENTICAL), all five obstruction gates CLOSED in §3 (round-trip err 0,
  no inversion, solvency ∈[0,1], well-posed, pool unchanged), bounded (gearing saturates ≤0.17,
  |u_eff|≤|u|), 6 selfcheck gates in §4, one intern pass in §5.
- Skeptic R6-gates this spec before intern dispatch; manager re-derives the float64 + re-checks the
  byte-identical claims before any build.

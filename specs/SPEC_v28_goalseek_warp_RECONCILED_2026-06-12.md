# SPEC — v28 goal-seek WARP (item #16) on the lens — RECONCILED BUILD (held-lens amplify model)

_research-lead · 2026-06-12 · READ-ONLY produced (NO engine edit, NO git, NO Aristotle, NO submit)._
_Build target: `engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 `7e1ae39b`)._
_**SUPERSEDES `specs/SPEC_v28_goalseek_warp_BUILD_2026-06-12.md`** (which concluded the warp "BLOCKED" —
that BLOCKER analysis, esp. construal-II "goal-seek inverts the lens, 1/h″→∞", was computed under the
LIVE RE-CENTERING lens. The operator corrected exactly that in entries 129/131/132: the lens is **HELD
during a warp step** and updates **between** steps — NOT live re-centering. Under the held lens the
goal-seek solve is closed-form forward, no inversion. The old spec's blocker dissolves.)_

_Authoritative model (built ON, NOT re-litigated): skeptic `notes/skeptic/VERDICT_AMPLIFYING_LENS_warp_2026-06-12.md`
(#44) + `notes/skeptic/VERDICT_FROZEN_PREWARP_LENS_goalseek_2026-06-12.md` (#43); operator transcript
entries 128–133 VERBATIM in `history/operator/2026-06-10_kurtosis-curve-family-brief.md`._
_Float64 re-derived by me on a fresh path: `/tmp/rl_reconciled_check.js`, `/tmp/rl_goalseek_target.js`
(engine primitives `hTau`/`hpTau`/`lensU`/`gLoc`/`getW`/`getSNorm`/`tradeUpdate` transcribed VERBATIM
from HEAD L1601–1709). All four build targets confirmed (CHECK 1–4 below)._

---

## VERDICT (read first): **BUILDABLE as ONE intern pass. Two changes — both READ/VIEW, zero WRITE-path change.**

The operator's mechanic (entry 131 verbatim): _"you see a steepened / flattened picture through the
lens, you estimate the amount of walk along the curve you need to do, then you change w to warp the
curve without changing the lens, then the picture updates and your lens can update or whatever."_
Per-step sequence: **lens HELD during the warp step, updates BETWEEN steps.** Entry 132: the lens
**amplifies** the skew (works WITH it), does NOT neutralise — the "restore the lensed slope" target
(which divides Φ out → flat w′=w₀) is the WRONG target.

HEAD already moves `w` on a trade (plain v24 swap) and redraws chart-2 — **but at the LIVE (post-trade)
mode.** That re-centering is precisely what MASKS the strike-dependent warp (it re-registers the
profile; see HEAD L3632). Realizing the operator's mechanic needs exactly two things, both in the
read/view layer:

1. **Show the warp through the lens HELD for the step** (draw the post-trade γ at the **pre-step**
   mode, not the post-trade mode) so the strike-dependent reshape `dG(K)=(γ′−γ)·Φ_τ(u(K))` is VISIBLE
   instead of re-registered away. **READ/VIEW change** (draw layer only).
2. **A goal-seek readout `w′=G/(1+G)`** that tells the operator "how much to change w" from a target
   lensed wing-exponent G at the read point. **READ/VIEW change** (a displayed number + an optional
   write-through that calls the EXISTING `setW`-equivalent path; the *solve* feeds nothing into the
   pool swap math — see §D).

The pool swap (`tradeUpdate`), `arbitrageToOracle`, and `rebase` stay **byte-identical plain v24**.
No second strike, no two-strike write (that is the BLOCKED R1 — kept out, §F). Single-basis: one
premium per leg at θ_K, unchanged.

**This is NOT the BLOCKED R1** of the superseded spec. R1 was "relocate the WRITE to θ_eff" (mode
collapses on arrival; two-strike basis leak). This RECONCILED build relocates **nothing** — it changes
which mode the *view* is drawn at, and adds a closed-form readout. The write stays the plain-v24 spot
swap that already moves w.

---

## §A. What "the warp" operationally IS in this build vs what HEAD already does

| | HEAD does today | The operator's mechanic (entries 128/131/132) | Gap to close |
|---|---|---|---|
| **w moves on a trade** | YES — `executeLeg`→`tradeUpdate` moves w (plain v24, α/β conserved). [entry 128 pt 1/4] | YES, identical — "we change w to warp the curve" / "w changes directly in the balancer formula." | **NONE.** The write already does this. |
| **chart-2 redraw after the trade** | YES, but the dashed preview curve is drawn at the **POST-trade mode** `snapPost.sNorm` (HEAD L3631–3632) — the lens **re-centers**. | The picture is read through the lens **HELD** for the step (pre-step center); it updates only **between** steps. [entry 131] | **(i) MISSING:** draw the preview/warped curve at the **PRE-step (held) mode**, so the strike-dependent reshape shows instead of being re-registered. **READ/VIEW.** |
| **goal-seek readout "how much to warp w"** | ABSENT — no UI tells the operator the w needed for a target slope. | "goal seeks that tell us how much to warp w are as seen through the lens" [entry 128 pt 2]. From a target lensed wing-exponent G at the read point: `w′=G/(1+G)`. [verdict #44 §3] | **(ii) MISSING:** a closed-form readout `w′=G/(1+G)` (+ G≥1 guard), displayed; optional apply-button that routes through the existing weight-set path. **READ/VIEW (+ optional existing-path write).** |

**Both gaps are READ/VIEW.** Gap (i) is a draw-layer mode argument. Gap (ii) is a closed-form display
number; its optional "apply" routes through the **already-existing** mechanism that sets w (a trade or
the pool-weight setter), so even the apply touches no NEW write math — the goal-seek solve itself is
**never** an input to the pool swap (L4, §D).

---

## §B. Exact change-set table (function @ HEAD line | CHANGE / BYTE-IDENTICAL | detail)

| Function / site (HEAD line) | Status | Detail |
|---|---|---|
| `tradeUpdate` (L1679) | **BYTE-IDENTICAL** | plain v24 pool swap. The warp does NOT change the pool update. (Pool fn does NOT change — stated plainly.) |
| `arbitrageToOracle` (L1702) | **BYTE-IDENTICAL** | plain Balancer, lens-free. Unchanged. |
| `rebase` (L1691) | **BYTE-IDENTICAL** | frame-keeping; unchanged. |
| `executeLeg` (L1761) | **BYTE-IDENTICAL** | one lensed premium `p.V` @ θ_K sizes dy; `tradeUpdate(state,dy)`. **One premium per leg.** No second strike. |
| `legPrice` (L1722) | **BYTE-IDENTICAL** | one premium per leg at θ_K (W2). NOT re-sized at any θ_eff. |
| `gLoc`/`markLensed`/`hTau`/`hpTau`/`lensU` (L1630–1666) | **BYTE-IDENTICAL** | the one shared read helper, unchanged. |
| `markEff`/`fundingPerStrike`/`closeBand` (L1915/2176/1971) | **BYTE-IDENTICAL** | settlement/funding read at the live mode @ θ_K; unchanged. θ_K stays the payoff strike. |
| **`Viz.drawState` (L3572–3626), preview call L3630–3632** | **CHANGE (READ/VIEW)** | Add a HELD-LENS warp trace: draw the post-trade γ (read off `previewPool`) at the **pre-step mode** `snap.sNorm` (NOT `snapPost.sNorm`). i.e. call `drawState(snap.sNorm, true, previewPool, state.tau)` so the dashed curve uses the **held** mode + the **moved** γ. (The existing re-centered trace MAY be kept as a separate faint line or replaced — operator-cosmetic, §C.) The `gAt` closure (L3576) already reads γ off `poolForLens` and the mode off the passed `sNorm`; passing the held `snap.sNorm` with `previewPool` yields `dG=(γ′−γ)·Φ` exactly (CHECK 1). |
| **NEW `Engine.goalSeekW(G)` helper** | **ADD** | `function goalSeekW(G){ return (G>=1 && isFinite(G)) ? G/(1+G) : NaN; }` — closed-form forward, no root-find, no 1/h″, no slope-as-pool-input. Returns the w that gives wing-exponent γ=G (CHECK 3/4). G≥1 guard ⇒ w′≥0.5 ⇒ γ>1 (NaN-loud below). |
| **Goal-seek readout UI consumer** | **ADD (READ)** | An input "target steepness G (wing exponent)" → display `w′=Engine.goalSeekW(G)` and the resulting γ′=G; optionally a "to here" apply button that drives w via the **EXISTING** weight-set/trade path (NOT a new write). Reads `Engine.goalSeekW`/`Engine.gLoc`; never feeds the solve into `tradeUpdate`/`arbitrageToOracle`. |

**Net diff ≈ one draw-call mode swap (1 line) + one Engine helper + one display/readout block.**
No pool change, no settlement change, no new strike, no two-strike write.

---

## §C. R3 CONTROL INVENTORY (every existing control over curve steepness / warp / the w-quantity)

| Existing control | Quantity it governs | Disposition under this build |
|---|---|---|
| **`w` (derived weight, `getW=α/x`)** — moves on every trade via `tradeUpdate` | the curve steepness γ=w/(1−w) | **KEPT, unchanged.** This IS the warp DOF (entry 128 pt 1/4). The trade moves it exactly as in v24. |
| **trade size / band notional N** (Transact subtab) | drives `dy` → how far w moves per trade | **KEPT, unchanged.** The trade is the warp action; size = "amount of walk" (entry 131). |
| **τ knob (`setTau`, L2336 / UI L2727)** — static kurtosis/vol | the lens shape Φ_τ (elbow roundness), NOT the steepness | **KEPT, unchanged.** Static, vol-calibrated, NOT changed by trades (operator ruling §0.3, CLAUDE.md). It AMPLIFIES the warp (sharper τ ⇒ bigger dG far OTM) but is not the warp DOF. |
| **chart-2 preview trace (`drawState` dashed, L3632)** — re-centers to post-trade mode | the *view* of the warp | **REPLACED.** The dashed trace now draws at the **held** (pre-step) mode so the strike-dependent reshape is visible (gap (i)). This is the only behavioral change to an existing control. |
| **`previewBand`/`__previewPool` wiring (L2979/3094)** | builds the post-trade pool for the preview | **KEPT, unchanged.** Still produces `previewPool` (the moved-w pool); the only change is the mode it's *drawn against*. |
| **arb-to-oracle button (`runArbitrage`)** | re-equilibrates w to the oracle marginal | **KEPT, unchanged, lens-free.** Targets the pool marginal, never a lensed slope (L4). |
| **(NEW) goal-seek-G readout `Engine.goalSeekW`** | tells the operator the w for a target wing-exponent G | **NEW — DRIVES NOTHING automatically.** It is a readout; its optional "apply" routes through the existing weight-set/trade path. It does not replace w, τ, or the trade; it *reads out* what w a target implies. Every existing control over w (the trade) remains the actuator. |

**Disposition of the new readout against the same quantity (w):** the trade is and remains the only
actuator that moves w. The goal-seek readout is an *advisory* on the same quantity — it computes the
target w and (optionally) lets the operator apply it through the existing path. No two controls write
w independently; the readout's apply is the existing path with a computed target.

---

## §D. Forward / no-inversion proof obligations (L4 preserved)

- **NO `1/h″`** anywhere in the new code. `Engine.goalSeekW(G)=G/(1+G)` is a closed-form forward map;
  `drawState` evaluates `gLoc` (forward `h′_τ`). The 1/h″→∞ runaway of the superseded spec's construal-II
  was a LIVE-RE-CENTERING artifact; under the held lens Φ is a constant for the step, so the solve never
  inverts it. (CHECK 3.)
- **NO root-find feeding a write.** `goalSeekW` is algebraic (`G/(1+G)`), one root, monotone in G
  (CHECK 3). No bisection, no Newton, no `solve` feeding `tradeUpdate`/`arbitrageToOracle`/`executeLeg`.
- **NO slope-as-input to the pool.** `tradeUpdate`/`arbitrageToOracle` stay plain-Balancer, taking
  only `{s,dy}` / `{s,oracle}`. The goal-seek's G (a lensed wing-exponent target) is converted to a w
  **before** any pool action and is NOT an argument to the swap math. **L4 (ban lensed-slope-as-write-input)
  preserved** — the lens is never inverted to size dy.
- **The goal-seek target is on γ, not on g_loc with Φ divided out.** `γ(w′)=G ⇒ w′=G/(1+G)`; Φ is
  **never** divided out (that is the rejected neutralise op, verdict #44 §2 / `/tmp/rl_goalseek_target.js`).
  The strike-dependent picture `dG=(G−γ₀)·Φ` is a forward *consequence* shown through the held lens, not
  a quantity solved against.

---

## §E. lens_selfcheck.js gate additions (HARD — LOCK the build)

Append to `engine/verify/lens_selfcheck.js`, auto-routed by presence of `function goalSeekW` (mirror the
existing `function markLensed && !function wField` routing convention).

1. **held-lens warp matches the formula** — for a grid (pool, dy, τ, mult): build `previewPool` via
   `tradeUpdate`, read `g_after = gLoc(previewPool, θ_K, τ)` and `g_before = gLoc(prePool, θ_K, τ)` **at
   the held mode `getSNorm(prePool)`** (i.e. substitute the held mode into the lensU/gLoc evaluation),
   assert `|(g_after−g_before) − (γ′−γ)·Φ_τ(u_held(θ_K))| ≤ 1e-13`. (CHECK 1: max err 1.4e-16.)
2. **goal-seek single-root + G≥1 guard** — assert `goalSeekW(G)=G/(1+G)` is monotone over a G grid,
   `γ(goalSeekW(G))==G` to 1e-12, and `goalSeekW(G)` returns NaN for `G<1` (guard) and `goalSeekW(1)==0.5`
   exactly (boundary γ=1). (CHECK 3/4.)
3. **pool byte-identical** — `tradeUpdate` source md5 == v24's `tradeUpdate` md5; `arbitrageToOracle`,
   `rebase` md5 == v24. `tradeUpdate(s,dy)` deterministic in dy only (strike/τ-blind). (Regression killer.)
4. **bounded (g_loc ≤ γ)** — over the grid, `gLoc(state,θ,τ) ≤ getW/(1−getW) + 1e-12` for all θ. (CHECK 2:
   max ratio 0.998. Catches an amplifying map that breaches the wing exponent.)
5. **no-inversion token scan** — assert the source contains NO `1/h″`/`hpp`/second-derivative reciprocal,
   no `solve`/bisection feeding `goalSeekW` or any pool fn, and `goalSeekW` takes only a scalar G (no
   slope-of-pool argument). `tradeUpdate`/`arbitrageToOracle` contain no lens token. (Locks L4.)
6. **held-mode draw assertion** — assert the warp/preview draw call passes the **pre-step** mode
   (`snap.sNorm`) with the **moved** `previewPool`, NOT `snapPost.sNorm` with `previewPool` (catches a
   regression back to the re-centering view that masks the warp).

---

## §F. Staging — ONE intern pass. Does it need the BLOCKED R1? NO.

**This lands as ONE intern pass.** Scope = (1) one draw-call mode argument in `Viz.drawState`'s preview
path (held mode, moved γ), (2) `Engine.goalSeekW` helper + export, (3) the goal-seek readout UI block,
(4) the 6 `lens_selfcheck.js` gates, (5) file-safety gate (2 blob md5, 3 `<script>` parse — this edit
touches neither blob). Suggested order: helper+export → draw-call mode swap → readout UI → gates → run
`engine/verify/run_all.sh` green → file-safety gate.

**It does NOT need the BLOCKED write-relocation (R1).** Loud statement: **R1 (relocate the WRITE to a
lens-shifted trade point θ_eff) remains BLOCKED and is NOT in this build.** R1 fails on mode-collapse
(the live mode → θ_K ⇒ slope→0 on arrival) and the two-strike basis-leak arb; closing it re-introduces
the demoted (W) weight field. **Nothing in §A–§E requires R1.** The held-lens warp is a *view* of the
plain-v24 spot swap that already moves w; the goal-seek is a closed-form readout. No write is relocated;
no second strike is written. If during build any part appears to need a two-strike write or a stored
non-live mode feeding the *write*, **STOP** — that is R1 leaking back in, halt and report, do not design it.

---

## §G. R1 citations (every scope item carries the operator entry that requested it)

| Build scope item | Operator entry (verbatim source) |
|---|---|
| w moves on a trade to warp the curve (already in HEAD; kept) | entry 128 pt 1 ("we change w to warp the curve") + pt 4 ("w changes directly in the balancer formula") |
| Show the warp through the lens HELD for the step (gap (i), held mode draw) | entry 129 ("warp goal seeking as seen through the lens pre warp"); entry 131 ("change w to warp the curve **without changing the lens**, then the picture updates") |
| Lens amplifies (works WITH the skew), not neutralise; dG=(γ′−γ)·Φ | entry 132 ("it works with it not against — amplifying or flattening skep as per steepness / flatness / intensity setting") |
| Goal-seek readout "how much to warp w" through the lens (gap (ii), `w′=G/(1+G)`) | entry 128 pt 2 ("goal seeks that tell us how much to warp w are as seen through the lens") |
| Every interaction read through the lens (chart/pricing/settle already lensed in HEAD) | entry 128 pt 3 ("every interaction with the curve is read through the lens") |
| Build it / ship within the hour | entry 125 ("looking forward to having the html fixed within the hour"); entry 133 ("get it done gang") |

Nothing in the build scope is unrequested. (No "PROPOSAL (unrequested)" section is needed — every item
maps to an entry above. The only operator-cosmetic micro-choice, flagged not designed: whether to KEEP
or REPLACE the old re-centered dashed trace alongside the new held-lens trace, §C.)

---

## §H. Operator-tier flags (record-relay only, NOT decided here)

1. **Settlement / payoff strike is UNTOUCHED — and must stay so for this build to be safe.** θ_K
   remains the payoff/settlement strike (`markEff`/`closeBand`/`fundingPerStrike` unchanged). This build
   does NOT move the payoff strike or change smooth-paste semantics. If the operator wants the *execution*
   to actually transact at a lens-shifted point (true write-relocation), that is R1 = BLOCKED + a
   settlement-semantics change = **operator-tier** (A-vs-B / trade-point object, entries 31/33/38/88/91/117/
   118/121). Flagged, not designed.
2. **The single-step honest caveat (must reach the operator undressed, verdict #44 STANDING CAUTION):**
   within ONE frozen step the warp is a *symmetric vertical rescale* of a fixed-shape profile
   (call/put symmetric, cross-strike ratio w-independent to ~5.6e-17). The genuine strike-differentiated
   SKEW emerges ACROSS the sequence as the mode/lens updates between steps. So the held-lens warp shows
   "more warp far OTM" (absolute dG, monotone) but does not bend one strike independently of another in a
   single step. This is exactly the operator's "picture updates, lens updates" — it is honest and matches
   his model, but the UI copy should not over-claim a per-strike in-step bend.
3. **Payoff chart + strike marker still drawn on the unbent curve** (cosmetic, operator-excluded entry
   101) — out of scope; not touched.

**NO Lean obligation ready.** `goalSeekW` and the held-lens warp are closed-form forward readouts of
transcribed primitives (CHECK 1–4), not theorems. The only candidate worth pinning — IF the operator
wants the no-go formalised — is the R1 mode-relativity impossibility (a restatement of the GLOBAL-SKEW
structural-impossibility), which is OUT of this build's scope. Nothing submitted/built/edited/git.

---

## Re-derivation receipts (mine, fresh path, float64)

- `/tmp/rl_reconciled_check.js` — CHECK 1: `dG(K)=(γ′−γ)·Φ_τ(u(K))` matches the direct held-mode gLoc
  difference to **max 1.4e-16**; CHECK 2: monotone-OTM, τ-amplified, `max(g_loc/γ)=0.998 ≤ 1`; CHECK 3:
  `w′=G/(1+G)` unique root of `γ(w′)=G`, monotone, no inversion; CHECK 4: G≥1 ⟺ w′≥0.5 ⟺ γ>1, boundary
  G=1⟺w′=0.5⟺γ=1 exact.
- `/tmp/rl_goalseek_target.js` — disambiguates: target G is on the wing-exponent γ (`γ(w′)=G`), Φ is
  NEVER divided out (the rejected neutralise op gives w′=w₀ flat); dG=(G−γ₀)·Φ is a forward consequence.

_Skeptic R6-gates this spec before intern dispatch; manager re-derives the float64 + re-checks the
byte-identical (`tradeUpdate`/`arbitrageToOracle`/`rebase`) md5 claims before any build._

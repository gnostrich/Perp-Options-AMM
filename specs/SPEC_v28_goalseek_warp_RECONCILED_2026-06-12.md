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

---
---

# CORRECTION APPENDIX — held-mode WARP exponent fix (research-lead · 2026-06-12, dated)

_READ-ONLY produced. NO engine edit, NO git, NO build, NO Aristotle. This appendix CORRECTS §A gap (i),
§B `Viz.drawState` row, and §E gate-1/gate-6 of the original spec above. The original is left intact as
the record; **where this appendix and the body disagree, this appendix governs the build.**_

## C.0 — Why the original under-specified the draw (the defect, owned)

The body said (§B L79): _"call `drawState(snap.sNorm, true, previewPool, state.tau)` so the dashed curve
uses the **held** mode + the **moved** γ … passing the held `snap.sNorm` … yields `dG=(γ′−γ)·Φ` exactly."_
**That is false about the code.** In HEAD the `drawState` exponent closure is

```
3576    const gAt = (theta) => poolForLens
3577      ? Engine.gLoc(poolForLens, theta, tau_v)          // <-- mode read INTERNALLY off the pool
3578      : (function(){ const w = sNorm > 0 ? 1/(1+sNorm) : 0.5; ... })();
```

and `Engine.gLoc(state, θ, τ)` (HEAD L1639) reads its mode from the pool, NOT from any argument:

```
1639    function gLoc(state, theta_K, tau) {
1640      const w = getW(state);
1641      const gamma = w / (1 - w);
1642      const u = lensU(state, theta_K);                  // lensU -> getSNorm(state)  (L1633-1637)
1643      ...
1644      return gamma * hpTau(Math.abs(u), tau);
1645    }
```

So when `poolForLens = previewPool`, the exponent's mode is `getSNorm(previewPool)` = the **POST-trade
mode**. The `sNorm` argument to `drawState` only feeds `tmDeg` (x-axis, L3573), the `psiAt` ATM-center
fallback (L3582), and `markLensed`'s smooth-paste center (L3583) — **it never reaches the exponent.**
On a single Balancer pool the mode is locked to γ (`getSNorm = (1−w)/w`, the reciprocal of `γ = w/(1−w)`),
so passing `previewPool` moves BOTH γ AND the mode → the after-trace is re-centered = the masked frame
the operator corrected (entries 129/131/132). I re-derived this on the live engine: at θ=0.7×heldMode the
CURRENT screen `dG` is **−0.4589** (flatter, sign-flipped) while the promised held-warp is **+0.4176**
(steeper). Receipt: `/tmp/rl_heldmode_warp_check.js` + the calibrated reproduction below (C.4).

## C.1 — The fix: a mode-OVERRIDE parameter on `gLoc`, threaded ONLY through the after-trace

The held (pre-step) mode must enter the EXPONENT, separately from γ (which comes from the moved
`previewPool`). Add an optional 4th parameter to `gLoc`; default = today's behavior (byte-identical).

**Change 1 — `Engine.gLoc` (HEAD L1639–1645), add `modeOverride`:**

```js
function gLoc(state, theta_K, tau, modeOverride) {
  const w = getW(state);
  const gamma = w / (1 - w);                         // γ from the (moved) pool — UNCHANGED
  const mode = (modeOverride !== undefined && modeOverride !== null && modeOverride > 0)
             ? modeOverride                          // held (pre-step) mode, supplied by the after-trace only
             : getSNorm(state);                      // OMITTED ⇒ live mode ⇒ byte-identical to today
  const u = Math.log(theta_K / mode);
  if (!isFinite(u) || !(mode > 0) || !(theta_K > 0)) return NaN;   // loud (subsumes lensU's guard)
  return gamma * hpTau(Math.abs(u), tau);
}
```

Notes binding on the intern:
- When `modeOverride` is omitted/null/≤0, `mode = getSNorm(state)` and the body is **mathematically
  identical to current `gLoc`** (re-derived: max |new−old| = 0.0 over a 100-point grid, C.4-(C)). The
  inlined `u = Math.log(theta_K/mode)` reproduces `lensU` exactly (lensU IS `Math.log(theta_K/getSNorm(state))`
  with the same guards). **`lensU` MAY be left as-is and unused-by-gLoc, OR gLoc may keep calling
  `lensU(state,theta_K)` in the omitted branch** — intern's choice, but the override branch must use the
  explicit `Math.log(theta_K/modeOverride)`. Do NOT change `lensU`'s own signature.
- γ is ALWAYS `getW(state)/(1−getW(state))` — the override touches the MODE only, never γ. (This is the
  whole point: moved γ, held mode.)

**Change 2 — `drawState` exponent closure (HEAD L3572, L3576–3579), thread a held-mode arg:**

Give `drawState` an optional `modeOverride` parameter and pass it into `gLoc` in the `poolForLens` branch:

```js
function drawState(sNorm, dashed, poolForLens, tau, modeOverride) {    // L3572 (+1 param)
  const tmDeg = Math.atan(sNorm) * 180 / Math.PI;
  const tau_v = (isFinite(tau) && tau > 0) ? tau : 0.3;
  const gAt = (theta) => poolForLens
    ? Engine.gLoc(poolForLens, theta, tau_v, modeOverride)            // L3577 (+ modeOverride)
    : (function(){ ... unchanged non-pool fallback ... })();
  ...
}
```

The non-`poolForLens` fallback branch (L3578-3579) is UNCHANGED (it already uses `sNorm` as its mode and
has no pool). `tmDeg`/`psiAt`/`markLensed` continue to use the `sNorm` argument as the x-axis + smooth-paste
center — that is correct and must stay (the after-trace is registered on the held axis AND its exponent is
now also held).

**Change 3 — the preview-trace draw CALL (HEAD L3630–3632):** draw the after-trace at the **held** mode
on BOTH the axis and the exponent. The held mode is `snap.sNorm` (= `getSNorm(state.pool)`, the pre-step
live mode). Pass it as both the `sNorm` arg AND the `modeOverride`:

```js
const snap = snapshot(state);
drawState(snap.sNorm, false, state.pool, state.tau);                  // live trace — UNCHANGED (no override)
if (previewPool) {
  // HELD-LENS after-trace: moved γ (previewPool) read through the HELD pre-step mode (snap.sNorm),
  // axis + smooth-paste center + exponent ALL at snap.sNorm. dG = (γ'-γ)·Φ_τ(ln(θ/heldMode)).
  const movedW = previewPool.alpha / previewPool.x;
  if (Math.abs(movedW - snap.w) > 1e-6)
    drawState(snap.sNorm, true, previewPool, state.tau, snap.sNorm);  // <-- modeOverride = HELD mode
}
```

This REPLACES the L3632 `snapPost.sNorm`/no-override call. The redraw trigger is now "w moved"
(`movedW − snap.w`) rather than "mode moved" (`snapPost.sNorm − snap.sNorm`) — equivalent for a single
Balancer pool (mode is a monotone function of w) but states the intent (a w-warp) directly. The
`snapshot(state, previewPool)` for `snapPost` is no longer needed by this block (the after-trace is drawn
on the held axis); the intern may drop the `snapPost` local here if nothing else uses it, else leave it.

## C.2 — HARD CONSTRAINT (gate/guard): the override is AFTER-TRACE ONLY

The `modeOverride` argument is passed by EXACTLY ONE call site — the dashed after-trace draw (C.1 change 3).
It MUST NOT be threaded into any other `gLoc` caller. The following stay at the LIVE mode
`getSNorm(state)` and are **byte-identical** (they already pass no 4th arg, and the new param defaults to
live):

| Consumer (HEAD line) | `gLoc` call — stays live-mode |
|---|---|
| `legPrice` (L1725, L1733-1734) | `gLoc(state, …, tau)` — premium at θ_K, live mode |
| `markEff` / settlement (L1918) | `gLoc(state, theta, tau)` — settled fraction, live mode |
| `fundingPerStrike` (L2178) | `gLoc(state, strike_theta, tau)` — funding, live mode |
| portfolio value display (L4217) | `Engine.gLoc(pool, part.theta, tau)` — live mode |
| live trace draw (L3629) | `drawState(snap.sNorm, false, state.pool, state.tau)` — NO override |

**Guard (gate W-OVR, NEW — see §E-replacement below):** a source/structural assertion that `modeOverride`
(the 4th positional arg of `gLoc`) is supplied at EXACTLY ONE call site, and that site is the dashed
after-trace `drawState(..., true, previewPool, ..., snap.sNorm)`. Any `gLoc(` call with 4 args anywhere in
`legPrice`/`markEff`/`fundingPerStrike`/portfolio/the live trace ⇒ FAIL (basis break / A12 / single-basis
violation). This is the mechanical twin of the one-helper single-basis invariant.

## C.3 — CORRECTED gates (replace §E gate 1 and gate 6; add W-OVR)

The body's §E gate 1 ("held-lens warp matches the formula") and gate 6 ("held-mode draw assertion") were
the green-over-defect holes the skeptic found: gate 1 hand-rolled `Phi(uHeld)` and checked the trivial
identity `(γ′−γ)Φ = γ′Φ − γ′Φ` (machine-zero, tests nothing the screen draws); gate 6 was a regex on the
call string. **Both are replaced to call the ACTUAL exponent path.**

**Gate W1 (CORRECTED) — exercise the real draw exponent, prove monotone-OTM, kill the sign-flip:**
For a grid of (pool, dy, τ): build `previewPool = tradeUpdate(pre, dy)`; let `heldMode = getSNorm(pre)`,
`γ = getW(pre)/(1−getW(pre))`, `γ′ = getW(previewPool)/(1−getW(previewPool))`. For each θ on a strike grid
spanning both wings (θ/heldMode ∈ {0.3,0.5,0.7,0.9,1.2,1.5,2.5,4.0}):
1. **Call the real path:** `gA = Engine.gLoc(previewPool, θ, τ, heldMode)` (the after-trace exponent) and
   `gB = Engine.gLoc(pre, θ, τ)` (the live trace at the held mode = pre mode). Screen warp = `gA − gB`.
2. **Assert it equals the formula:** `|(gA − gB) − (γ′−γ)·Φ_τ(ln(θ/heldMode))| ≤ 1e-12`. (Φ_τ(u) =
   |u|/√(τ²+u²). This MUST use `Engine.gLoc` with the override, NOT a hand-rolled `Phi` — the whole point
   is to test the function the screen calls.)
3. **Monotone-OTM, no sign-flip:** assert `sign(gA − gB)` is the SAME (= `sign(γ′−γ)`) at every θ ≠ heldMode
   on the grid, and that `|gA − gB|` is non-decreasing as |ln(θ/heldMode)| grows on each wing (to a tol).
4. **The skeptic's counterexample is the locked regression case:** include the explicit point
   `(pre = Balancer w=0.725, dy chosen so γ:2.636→3.182, τ=0.3, θ=0.7×heldMode)`. Assert:
   - the **OLD/buggy** quantity `Engine.gLoc(previewPool, θ, τ)` − `Engine.gLoc(pre, θ, τ)` (NO override,
     i.e. the post-mode after-trace) **sign-flips negative** (≈ −0.459) — i.e. the bug is real and the gate
     would FAIL on the old draw; AND
   - the **FIXED** quantity (with `heldMode` override) is **positive** (≈ +0.418) and matches
     `(γ′−γ)·Φ_τ(ln 0.7)`. The gate PASSES only when the fixed path is wired.
   This is the discriminating test: green requires the override to actually reach the exponent.

**Gate W-OVR (NEW) — override is after-trace-only (replaces the old regex gate 6):** structural check that
(a) the dashed after-trace call passes `snap.sNorm` as BOTH the axis arg and the `modeOverride` arg with
`previewPool`, and (b) no `gLoc` call in `legPrice`/`markEff`/`fundingPerStrike`/portfolio/the live trace
passes a 4th argument. If feasible beyond regex: instrument/spy that during a `drawAll(state, previewPool)`
the only `gLoc` invocation receiving a non-undefined 4th arg is from the after-trace closure; settlement/
funding/portfolio invocations all receive `undefined`. (At minimum a brace-scoped source scan of each named
consumer for a 4-arg `gLoc(`.)

**Gate W6 (CORRECTED — more than a regex if feasible):** the old W6 regex'd the call string. Replace with
a behavioral assertion: build the live and after traces' exponent arrays by CALLING `Engine.gLoc` exactly
as `drawState` does (live: `(state.pool, θ, τ)`; after: `(previewPool, θ, τ, snap.sNorm)`), and assert the
after-array minus live-array equals `(γ′−γ)·Φ_τ(u_held)` across the θ grid to 1e-12 — i.e. test the drawn
picture, not the source text. If a full DOM/canvas harness is infeasible in the Node oracle, W6 = the
exponent-array equality above (which is the screen's y-values pre-`toPx`), explicitly labelled as the
exponent path and NOT a string match.

Gates 2 (goal-seek single-root), 3 (pool byte-identical md5), 4 (g_loc ≤ γ), 5 (no-inversion token scan)
from the body §E are UNCHANGED and still apply.

## C.4 — Re-derivation receipts (mine, live engine, float64)

Script `/tmp/rl_heldmode_warp_check.js` (loads the live HEAD `Engine` via `vm`, transcribes nothing — calls
`Engine.gLoc`/`Engine.tradeUpdate` directly). Calibrated reproduction of the skeptic case
(`pre` = Balancer w=0.725, dy=150 ⇒ γ 2.636→3.182, heldMode=0.3793, postMode=0.3143, τ=0.3):

| θ/heldMode | held-formula `(γ′−γ)·Φ_τ(u_held)` | CURRENT screen `gLoc(post)−gLoc(pre)` (buggy) |
|---|---|---|
| 0.30 | +0.5294 | +0.4936 |
| 0.50 | +0.5007 | +0.3163 |
| **0.70** | **+0.4176** | **−0.4589  ← sign-flip = the bug** |
| 0.90 | +0.1808 | −0.0275 |
| 1.20 | +0.2834 | +1.1036 |
| 1.50 | +0.4386 | +0.7206 |
| 4.00 | +0.5333 | +0.5490 |

- **(A)** CURRENT after-trace (`gLoc(previewPool,θ,τ)`, post mode) sign-flips at 0.7×mode — matches the
  skeptic verdict table (−0.4586) to rounding. The bug is confirmed on the live engine.
- **(B)** held-override identity: `gLoc(post,θ,τ,held) − gLoc(pre,θ,τ,held) == (γ′−γ)·Φ_τ(u_held)` to
  **max 7.1e-15**; `|dG|` monotone-OTM both wings = TRUE; NO sign-flip (sign = sign(γ′−γ) at every strike).
- **(C)** override-OMITTED identity: `gLoc(pool,θ,τ)` with the new param omitted == current `Engine.gLoc`
  to **max 0.0e0** over a 100-point grid (both pre and post pools) — the omitted path is byte-identical,
  so `legPrice`/`markEff`/`fundingPerStrike`/portfolio/live-trace are untouched.

`tradeUpdate`/`arbitrageToOracle`/`rebase`/`executeLeg`/`legPrice`/settlement (`markEff`/`closeBand`/
`fundingPerStrike`) stay **BYTE-IDENTICAL** — the only diffs are: `gLoc` gains an optional 4th param
(default = today), `drawState` gains an optional 5th param threaded only into the pool branch, and the
one dashed after-trace call site swaps `snapPost.sNorm`(no-override) → `snap.sNorm`(+`snap.sNorm` override).

## C.5 — Change-set (function @ HEAD line | change)

| Function / site (HEAD line) | Change |
|---|---|
| `Engine.gLoc` (L1639–1645) | **MODIFY** — add optional 4th param `modeOverride`; mode = override if supplied & >0 else `getSNorm(state)`; inline `u = Math.log(theta_K/mode)`. Omitted ⇒ byte-identical. γ unchanged. |
| `Viz.drawState` signature + `gAt` (L3572, L3576–3577) | **MODIFY** — add optional 5th param `modeOverride`; pass it as `gLoc(poolForLens, theta, tau_v, modeOverride)` in the `poolForLens` branch only. Non-pool fallback (L3578-3579), `tmDeg`, `psiAt`, `markLensed` unchanged. |
| preview after-trace call (L3630–3632) | **MODIFY** — replace `drawState(snapPost.sNorm, true, previewPool, state.tau)` with `drawState(snap.sNorm, true, previewPool, state.tau, snap.sNorm)`; redraw trigger on `movedW − snap.w`. Live trace call (L3629) unchanged. |
| `lensU` (L1633–1637) | **BYTE-IDENTICAL** (signature unchanged; gLoc's omitted branch reproduces it). |
| `legPrice` (L1722–1734), `markEff` (L1915–1918), `fundingPerStrike` (L2175–2182), portfolio (L4217), live trace (L3629) | **BYTE-IDENTICAL** — no 4th `gLoc` arg; default = live mode. |
| `tradeUpdate`/`arbitrageToOracle`/`rebase`/`executeLeg`/settlement | **BYTE-IDENTICAL** (W3 md5 vs v24). |
| `lens_selfcheck.js` | gate W1 + W6 corrected, gate W-OVR added (C.3); gates 2/3/4/5 unchanged. |

## C.6 — BOTTOM LINE

**Buildable as ONE intern pass: YES.** Net = 1 param on `gLoc`, 1 param on `drawState`, 1 changed draw
call, + the corrected/added gates (W1, W6, W-OVR). No operator-tier flag NEW to this correction — the
mechanic is the already-approved frozen-pre-warp lens (entries 129/131/132, skeptic #43/#44, inventory #16);
the §H operator-tier flags of the body (R1 = BLOCKED + out of scope; the single-step symmetric-rescale
honesty caveat #2) STILL STAND unchanged and must reach the operator. **Skeptic R6-gates this correction
before the intern rebuilds.**

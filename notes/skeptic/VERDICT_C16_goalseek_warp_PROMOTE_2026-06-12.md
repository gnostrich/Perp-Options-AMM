# VERDICT — C16 goal-seek-warp build, pre-promotion gate (skeptic, 2026-06-12)

**Artifact:** `engine/builds/temporal_mvp_v28_lens_warp.html` (md5 `abd46149…`), spec
`specs/SPEC_v28_goalseek_warp_RECONCILED_2026-06-12.md` (R6-CLEARED).
**Gate:** Universal Skeptic Gate (operator entry 139) — audit BEFORE HEAD promotion + C16→BUILT flip.

## VERDICT: **HOLD** — FLAG-WRONG (masking-frame, the entry-119/#10/#11 class) on the load-bearing held-lens draw.

The goal-seek READOUT (change 2) is honest and correct. The scope is clean. But the **held-lens
warp view (change 1) — the build's entire reason to exist — does NOT draw what the spec claims and
what the operator was promised.** The dashed after-trace's curve exponent is STILL computed at the
re-centered POST-trade mode, i.e. the masked view the operator explicitly rejected (entries 129/131/132).
The gate that "verifies" it (W1) tests a different quantity than the screen draws, so it is green over
a real defect.

---

## What PASSED (attack attempted, held)

1. **Scope is exactly the 3 changes — no creep.** Full `diff HEAD … warp` = 7 hunks, every one maps:
   readout UI HTML (1324-1341), `goalSeekW` helper (1686-1697), export line +`goalSeekW` (2218),
   `updateGoalSeek` consumer+listeners (2760-2788), the held-lens draw line (3690-3696), a
   `updateGoalSeek()` refresh call in render (4211). Nothing else touched.
2. **Write-path / pool / settlement byte-identical (verified by brace-matched extraction + diff,
   not by taking anyone's word):** `tradeUpdate`, `arbitrageToOracle`, `rebase`, `executeLeg`,
   `legPrice`, `mark` all **IDENTICAL** between HEAD and warp. θ_K untouched. W3 gate confirms md5
   parity vs v24. The pool stays plain Balancer.
3. **`goalSeekW(G)=G/(1+G)` is genuinely closed-form forward.** No `1/h″`, no root-find, no slope-as-
   input, never an argument to a pool fn (verified in source). G≥1⇒NaN-loud guard present, no
   clamp-to-edge. Readout is advisory, drives nothing automatically; the trade stays the actuator.
   This half of the build is honest.
4. **The on-screen readout copy (1335-1341) carries the A11 caveat correctly** — "one trade warps the
   WHOLE profile by one factor … does NOT bend one strike independently of another in a single step …
   skew builds ACROSS the sequence." That single-step honesty is present and well-worded. (It is the
   one thing that makes the HOLD a fixable label-vs-code mismatch rather than a fresh gaslight.)

---

## FLAG-WRONG — the held-lens after-trace is drawn at the post-trade mode, not the held mode

**The claim (spec §B L79, the load-bearing one):** "passing the held `snap.sNorm` with `previewPool`
yields `dG=(γ′−γ)·Φ_τ(u(K))` exactly (CHECK 1)" — i.e. the dashed warp curve is the moved γ′ read
through the HELD pre-step lens, so the strike-dependent reshape is visible instead of re-registered.

**The code does not do this.** The dashed after-trace draws via
`drawState(snap.sNorm, true, previewPool, state.tau)` (L3696). Inside `drawState`, the curve exponent
at each ray is `gAt(θ) = Engine.gLoc(previewPool, θ, τ)` (L3635-3636). **`gLoc` reads the mode off the
pool you pass it** — `gLoc → lensU(previewPool, θ) → getSNorm(previewPool)` = the **POST-trade mode**
(L1652, L1657-1662). The held `snap.sNorm` argument only sets the x-axis range (`tmDeg`) and is handed
to `markLensed` as the smooth-paste center — **it never reaches the exponent.** So the after-trace's
exponent is `γ′·h′_τ(|log(θ / postMode)|)`, re-centered on the moved mode — exactly the re-centering
that the spec itself (§A, L58) says "MASKS the strike-dependent warp."

**Re-derived on the live engine** (steep pool W=0.725, dy=12000, τ=0.3; heldMode=0.3793,
postMode=0.3143, γ:2.636→3.182):

| θ/heldMode | gate-W1 dG (held, `(γ′−γ)·Φ`) | SCREEN dG (`gLoc(post)−gLoc(live)`) | mismatch |
|---|---|---|---|
| 0.3 | +0.5293 | +0.4934 | 3.6e-2 |
| 0.7 | +0.4174 | **−0.4586** (opposite sign) | 8.8e-1 |
| 1.5 | +0.4385 | +0.7203 | 2.8e-1 |
| 4.0 | +0.5331 | +0.5489 | 1.6e-2 |

At θ=0.7×mode the screen shows the put-side curve getting **flatter** (g 2.018→1.559) while γ went
**up** — the non-monotone scramble that is the signature of the re-centering artifact (skeptic pattern
#10: right object, wrong center). The promised clean monotone-OTM amplification `(γ′−γ)·Φ` is **not on
the screen.** This is the masking frame the operator corrected verbatim in entries 129/131/132; the
build reintroduces it in the exponent while only the registration/x-axis is held.

**Why the gate did not catch it (the deeper finding — same class as the rfl-tautology/grep-scan):**
gate W1 (`lens_selfcheck.js` L449-470) computes `Phi(uHeld)` **by hand** and checks
`(γ_post−γ_pre)·Φ = γ_post·Φ − γ_pre·Φ` — a machine-zero algebraic identity (it passes at 4.44e-16).
**It never calls `Engine.gLoc(previewPool, …)`** — the function the screen actually draws with. So W1
verifies a quantity nobody plots. W6 is a regex confirming the string `drawState(snap.sNorm,true,
previewPool` exists — true, but that argument is exponent-irrelevant. **29/29 green is real for the
algebra and false for the drawn picture.** A gate that checks the formula but not the draw is the
audit-the-auditor hole.

**Steelman I tried and it fails:** maybe the team intends the exponent to use the post mode and only
"holds" the registration. But that IS the live-re-centering view (§A's own L58 "re-centers … MASKS"),
which the spec's stated purpose (gap (i), L58/L79) is to *remove*. Under that reading the build closes
no gap and the C16→BUILT flip would be claiming a feature the screen doesn't show. Either way the
spec's CHECK-1 / §B-L79 derivation is **mis-stated about its own code**, and the operator-facing
picture is the masked one.

## The C16→BUILT flip — NOT YET

Do **not** flip C16→BUILT. With change 1 not delivering the held-lens view, the honest register state is
**C16 = PARTIAL: goal-seek READOUT built + gate-verified (advisory `w′=G/(1+G)`); held-lens WARP VIEW
not delivered (after-trace exponent still re-centered on the post-trade mode — gate W1 tests the
formula, not the draw).** A1 (dot-sliding-vs-warp) does **not** move toward delivered: the visible warp
is still the re-registered profile, which is the dot-slide-equivalent the operator's signed acceptance
test rules out. A12 (θ_K) is satisfied (payoff strike untouched, verified).

## The fix (named, not designed — per charter I name the hole and stop)

The after-trace exponent must be evaluated at the **held** `snap.sNorm`, not at `getSNorm(previewPool)`.
That requires the exponent path (`gAt`/`gLoc`) to take the mode from the held `sNorm` argument rather
than re-deriving it from the pool — and gate W1 must call the **actual draw function** with `previewPool`
at the held mode and compare to `(γ′−γ)·Φ_τ(u_held)`, instead of hand-rolling `Phi(uHeld)`. Until both
hold, this is HOLD, not CLEAR-TO-PROMOTE.

— skeptic, 2026-06-12

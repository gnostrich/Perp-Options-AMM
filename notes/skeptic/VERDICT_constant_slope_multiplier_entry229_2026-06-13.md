# VERDICT — entry-229 "constant slope multiplier" lens · 2026-06-13 (skeptic)

Artifact: manager brief relaying operator entry 229 (verbatim verified in
`history/operator/2026-06-10_kurtosis-curve-family-brief.md` L1836-1842:
"its so straightforward idk what to even say / fuck gang. its literally just a constant slope
multiplier"). HEAD = `engine/builds/HEAD_temporal_mvp_v28_lens.html`. READ-ONLY pass.

## Lead answers (plain English)
1. **Is the manager's reading correct?** YES, with one correction on the form. A constant
   slope multiplier means the displayed option-value curve has the SAME power-law steepness at
   every strike, equal to `m × γ`. "m = 1" is exactly today's plain v24 curve (steepness γ).
   Bigger m ⇒ steeper everywhere. The two phrasings the manager offered — "scale the
   log-moneyness coordinate, `u_true = m·u_displayed`" and "the displayed local exponent is
   `g_loc = m·γ` constant" — are the SAME thing on this plain power-law base (verified
   `/tmp/sk_equiv.js`: both give displayed exponent m·γ in the wings; they would differ only if
   the base curve had a flat top to squeeze, and plain v24 has none). State the form to the
   intern as: **`g_loc(K) = m·γ` constant at every strike** (no u-dependence), `m = 1` is plain
   v24, larger m = steeper = "more vol / sharper."

2. **Does it dissolve the three-way conflict? YES (with numbers).** Re-derived
   `/tmp/sk_threeway.js`, mode = 1, γ = 2, trader picks a 2× displayed strike (`u = ln 2`):

   | m | displayed steepness (m·γ) | true trade point `mode·e^{m·u}` |
   |---|---|---|
   | 1 | 2.0 | 2.00× |
   | 2 | 4.0 | 4.00× |
   | 3 | 6.0 | 8.00× |

   All three of (a) steeper chart-2, (b) trade-lands-further-out, (c) transact-at-what-it-looks-
   like move the SAME direction with m, because a flat multiplier couples steepness and
   outward-push linearly and with the same sign. This is exactly why the old conflict existed
   and now doesn't: the position-dependent `√(τ²+u²)` lens coupled them with OPPOSITE signs
   (sharper top = smaller τ, but smaller τ = trade lands LESS far out — the multi-day flip-flop,
   my patterns #20/#21/#23). The constant multiplier has no such opposite coupling. **Conflict
   gone: Y.**

3. **Buildable in one pass? The code edit is small; the GATES are not — see blast radius.**
   It is NOT a clean "swap the helpers, gates intact" pass. The current HARD gate
   (`lens_selfcheck.js`) asserts the OLD design and would FAIL the new curve by design (below).

## Blast radius (the load-bearing finding — do not let this drop)
A constant multiplier is a REAL curve redefinition. It DELETES the design that CLAUDE.md §0,
`docs/feature_inventory.md` items 2/3, and the lens's stated behaviour all describe: "kurtosis
rounds the ATM elbow; wings stay frozen at exponent γ (asymptote-respecting)." Under a constant
multiplier there is **no elbow-rounding and no frozen-γ wing** — the wings are exponent m·γ.
This is operator-authorized by entry 229, but it must be flagged as a redefinition, not a tweak.

- **A5 asymptotes (frozen wings):** wings become exponent `m·γ` — still an exact power law
  (`/tmp/sk_monotone.js`: finite, in [0,1], monotone for m = 1,2,3), but NOT the same exponent
  as γ. So "wings stay exact power-laws" is TRUE in the weak sense (still power-laws) and FALSE
  in the sense CLAUDE.md §0 means it ("γ wings unchanged"). No floor/saturation introduced.
- **A6 monotonicity / no-arb:** preserved. The curve is just plain v24's power-law with exponent
  m·γ; same monotone, no-arb structure as the gated v24 baseline. No new arb surface.
- **A16 ATM cusp (Q11):** the cusp/flat-top VANISHES. It existed only because `g_loc → 0` at the
  mode (`S* → 0` degeneracy). A constant g = m·γ > 0 has no special behaviour at the mode; call
  and put arms meet at the strike with the same exponent on both sides (`/tmp/sk_settle_atm.js`:
  matched values at sNorm = θ). ATM is clean/continuous. (This is a LOSS of the elbow-rounding
  feature, not a bug — see the redefinition flag above.)
- **Settlement smooth-paste (item 7):** SURVIVES. `markLensed` is g-parametric; any constant
  g > 0 gives a valid finite `S* = K·g/(g+1)` with a C⁰ seam (`/tmp/sk_settle_atm.js`: seam
  jumps 1e-8, machine zero, for g = 2/4/6). No change needed beyond feeding it the constant g.
- **Funding (item 9):** the formula survives mechanically, but its SHAPE changes: today funding
  → 0 at the ATM because g_loc → 0; under a constant multiplier g_loc never hits 0, so funding
  does NOT vanish at the mode. That is a behavioural change funding gate (5a) currently forbids.
- **Continuous-warp (C16) / inverse-lens trade (item 16):** the trade map becomes TRIVIAL.
  `theta_tx = mode·(theta_chosen/mode)^m` — linear in u, closed-form invertible, monotone
  (`/tmp/sk_thresh.js`). Replaces the nonlinear `u_tx = sign(a)·√(a²+2|a|τ)`. Frozen-at-open +
  reuse-at-close still gives an exact pool round-trip (just a different `theta_tx` value). The
  removed √ map also removes the τ-direction documentation block at L1788-1792 — gone, not
  reversed.

## ⚠ The gate problem (why it is NOT one clean pass)
The current HARD gate `engine/verify/lens_selfcheck.js` ENCODES the elbow-rounding design and
would FAIL the constant-multiplier curve BY DESIGN. Concretely, these gate assertions are
violated for any m ≠ 1 (read L78-159):
- (2a) `g_loc(ATM) = 0` — constant gives m·γ ≠ 0. FAILS.
- (2b) `g_loc → γ` deep wings — constant gives m·γ. FAILS for m ≠ 1.
- (3) `|g_loc| ≤ γ` cap-free — constant gives m·γ > γ for m > 1. FAILS.
- (5a) funding → 0 at ATM — no longer holds. FAILS.
- (5c) exponent → γ-scale in wings — gives m·γ. FAILS the `>0.9·γ` band asymmetrically.
So the gate must be REWRITTEN to the new design (assert constant g = m·γ everywhere, no flat
top, seam still C⁰, monotone/no-arb, round-trip exact), not merely re-run. A build that swaps
`gLoc`/`markLensed`/`hTau` to the constant form and leaves `lens_selfcheck.js` as-is will go RED
on the HARD gate — and per STOP-ON-RED that red is a real finding, not something to patch toward
green. This is the part of the brief's "one intern pass" that is understated.

## Build change-set (named, not designed — I do not author the spec)
- `hTau`/`hpTau` (L1630-1631), `gLoc` (L1639-1645): become the constant `m·γ`; the
  `√(τ²+u²)` kernel and its derivative are removed. The UI knob `state.tau` is repurposed/renamed
  to `m` (or a transform of it) — its meaning changes from "elbow width" to "slope multiplier."
- `lensU` (L1633-1637): no longer needed by gLoc (u drops out); may stay for the trade map only.
- Trade-map block L1799-1805 (`u_tx`/`theta_tx`): becomes `theta_tx = mode·(theta_chosen/mode)^m`.
- chart-2 draw `gAt`/`psiAt` (L3710-3719): the `g_loc → 0 ⇒ flat-top` branch (L3716) becomes
  dead code (g never 0) — remove or it silently misrepresents.
- `lens_selfcheck.js`: REWRITE (above). The run_all routing key (`function markLensed` &&
  !`function wField`, run_all.sh L21) still matches, so routing is fine; the gate CONTENTS change.

## Operator-tier flag (does this need explicit confirm beyond entry 229?)
Entry 229 authorizes the constant multiplier and is sufficient to BUILD it. BUT the build
**removes** two things CLAUDE.md §0 / inventory items 2-3 name as the project's stated design:
the ATM elbow-rounding AND the frozen-γ wings. That is a curve/invariant redefinition
(escalation tier per §7). The operator clearly intends it (entry 229 is exasperated-explicit,
and entries 102/103 show convergence toward "multiplicative/constant"), so I am NOT flagging it
as un-authorized — I am flagging that **CLAUDE.md §0 and `docs/feature_inventory.md` items 2/3/16
must be updated to reflect the redefinition so nothing is silently dropped**, and the manager
should confirm in one plain sentence to the operator: "this removes the elbow-rounding and the
γ-frozen wings entirely; the curve becomes a plain power law of steepness m·γ everywhere — yes?"
That confirm is cheap and closes the exact silent-drop failure I exist to catch (the §0 motive
line "wings stay exact power-laws [at γ]" would otherwise live on as stale shared truth).

## VERDICT: PASS (manager reading correct) + FLAG-OMISSION (gate + §0/inventory redefinition)
- Manager's reading is correct and the constant multiplier dissolves the three-way conflict
  (Y, numbers above). The math is clean and buildable.
- **FLAG-OMISSION:** the brief sells this as "one intern pass, blast radius named" but omits
  that (i) the HARD gate `lens_selfcheck.js` asserts the OLD design and FAILS the new curve by
  design — it must be rewritten, not re-run; and (ii) CLAUDE.md §0 + inventory items 2/3 ("ATM
  elbow rounded, wings frozen at γ") are DELETED by this change and must be updated, with a
  one-sentence operator confirm of the redefinition. Naming the holes; not proposing the fix.

Re-derivations: `/tmp/sk_constmult.js`, `/tmp/sk_equiv.js`, `/tmp/sk_threeway.js`,
`/tmp/sk_settle_atm.js`, `/tmp/sk_monotone.js`, `/tmp/sk_thresh.js`. Verbatim channel HELD
(entry 229 read in transcript L1836-1842; entries 102/103/220/222/226 cross-read).

# SKEPTIC VERDICT — hour-close audit (operator entry-20 deadline), 2026-06-11

Artifacts: `framework/checks/chk_core.js` (1eb552c, manager-built) ·
`framework/CONSISTENCY_CHECKER_2026-06-11.md` (291967e, runner-built; reconciled 07b0bec).
Question 3: does the hour-close satisfy my verdict-#10 item 4 (table + closure + checks RUN)?

## TLDR
Both suites re-run green by me (chk_core exit 0; run_all.sh from `engine/` exit 0, HEAD md5
canonical). One number per check family re-derived independently — all reproduce. CHK-3's
mid-build RED fix is a **legitimate measurand correction**, not patching-toward-green.
But: **FLAG-OMISSION** — the closure misses a pool-state writer the formal spec itself names
in its "complete generating set" (`liquidity(Σ,λ)`, spec §2.13/L504, live as `Store.liquidity`
scaling x,y,α,β,Nx,Ny), plus the book-writer class (position open/close, funding accrual
`leg.funding_* += trader_pays`), and its "oracle read at exactly two points" claim is false.
**FLAG-OVERSELL** (narrow) — four gated legs are code tautologies that cannot fail
(CHK-2a/2b, CHK-4 zero-leg, CHK-5), against the header's own "a check that cannot fail is not
a check." **FLAG-PROCESS** (narrow) — table §4.1 calls the carve-outs "operator-named"
(entry 20 verbatim is only "no. i want it done within the hour") and says "nothing submitted
this pass" while the SAME commit logs 3 FW prover submissions in flight.
**Item-4 verdict: PASS-WITH-CONDITIONS** — table + checks-run legs satisfied; the closure leg
fails until the missed state-touchers are dispositioned. Flags stand per §2.1.

## 1. chk_core.js — PASS-WITH-CONDITIONS (one narrow FLAG-OVERSELL)

**Re-run (mine):** `node framework/checks/chk_core.js` → ALL GATED CHECKS PASS, exit 0.

**Re-derivations (one per family, independent of the script):**
- CHK-1c: factors 44.52 / 748.62 = e^ghMu corroborated three ways — slope_test.js output from
  my own run_all run (44.5223 / 748.6219), CLAUDE.md §4 pin (44.5/749), and my run-4 settled
  claim (elasticity-at-mark = 1/748.62 at γ=3). Genuine must-fail control on live GH.
- CHK-2: one-shot hand-derivation (x,y,w)=(80,150,0.3), Δy=+30: α=24, β=105 → xN=57.6,
  w′=5/12, slope = (5/7)·(180/57.6) = 2.2321428… — matches printed 2.232142857.
- CHK-3: analytic targets per wing: dlny/dlnx → ±(0.5+0.1S′)/(0.5−0.1S′), S′→±1 ⇒ 1.5 and
  0.6667 — the corrected map is right. Printed values reproduce analytically: at u=8, τ=0.05:
  S′=8/√64.0025 ⇒ gl=1.4999878 (printed 1.499988); at u=100τ: S′=100/√10001 ⇒ 1.4999688
  (printed 1.499969); spread 1.90e-5 = exactly the max(8,·)-floor changing u/τ — gl depends
  only on u/τ, the scale-invariance claim itself.
- CHK-4: hand: τ=3,u=1 ⇒ w=0.5+0.1/√10 ⇒ dev 0.135; τ=0.05 ⇒ 0.499 — matches 1.350e-1/4.992e-1.
- CHK-5: tent identity (see flag below). CHK-6: hand: τ=0.05 ⇒ e^{0.1(√9.0025−0.05)+1.5}=6.0197;
  τ=3 ⇒ e^{0.1(√18−3)+1.5}=5.0747 — match.

**(c) The CHK-3 RED story — LEGITIMATE measurand fix.** The ±100τ convention is the verified
claim's OWN measurand: my VERDICT_KURTOSIS_KNOB (2026-06-10) F2 line reads "γ_loc(±100τ)
identical across" — the first draft (fixed u, wrong target map) tested a claim nobody verified
and which is KNOWN false (elbow reach scales with τ; that is the knob working, not a wing
violation). Three legitimacy tests pass: (i) corrected measurand = the verified claim's
measurand; (ii) gate retains failure power — tol 1e-3 vs failure signals 0.83 (swapped map)
and 6.5e-2 (fixed-u at τ=3), and the initial RED itself proves the gate fires; (iii) the
failure mode is memorialized (CHK-3-reach REPORT), not deleted. Not patching-toward-green.

**(a)+(b) FLAG-OVERSELL (narrow): four gated legs cannot fail, vs the header's own maxim.**
- CHK-2a: code is `ws = a/xN` then asserts `xs·ws == a` — xs·ws ≡ a and ys·(1−ws) ≡ b
  IDENTICALLY by construction (a,b computed once, every update derived from them). The
  measured 1.48e-16 is division rounding. Cannot fail for any input.
- CHK-2b: each micro-slice recomputes α_i = xm·wm which equals a exactly (same identity), so
  10k slices reproduce the one-shot map ALGEBRAICALLY; 3.7e-12 is fp accumulation. Cannot fail.
  The real discriminators (one-shot 1.2100 vs transported 1.2000; fixed-curve-spec rejection;
  round-trip) are all QUEUED (CHK-2c) — yet table row 2's "Catches:" sentence credits them to
  the landed check.
- CHK-4 zero-leg: `|sA/sA − 1|` — the same variable divided by itself; `zero === 0` cannot
  fail. "F(anchor,anchor)=0 exact" is an identity of the expression, not a measurement. (The
  nonzero leg, 0.135–0.499 > 1e-3, is real and hand-verified.)
- CHK-5: code compares `min(2e^{−u/2}, 2e^{u/2})` to `2e^{−|u|/2}` — the same expression via
  |u|; residual is 0.0e0 because it is code-vs-itself. Cannot fail.
The header claims "Negative controls included (a check that cannot fail is not a check)" —
true of CHK-1 only. By the header's own maxim, 4 of the 12 gated legs are not checks. The
load-bearing math those legs encode IS true (my run-5/run-9 verifications carry it); the flag
is strictly about the suite's claimed catching power. Also noted: CHK-1b verifies the math
fact (ε≡2/3≠1) analytically but does not push the failing curve through the CHK-1a detector
machinery; CHK-1c gates only `factor > 40` (18× slack at γ=3) — the exact factors are printed,
not asserted. **Conditions:** land CHK-2c (or equivalent must-fail legs) and relabel the
tautological legs for what they are, or the header claim goes.

## 2. CONSISTENCY_CHECKER — FLAG-OMISSION (closure) + narrow FLAG-PROCESS (§4.1)

**FLAG-OMISSION — the closure fails its own rule; the spec names the missed generator.**
Closure rule: "a component = anything that reads or writes pool state… nothing else touches
state," writers enumerated as tradeUpdate · arbitrageToOracle · rebase · ghCalibrate, "No
other function writes pool state." Counter-evidence, code-verified on HEAD v26c:
1. **`Store.liquidity(D)`** (UI script 1, L170–191; wired to the Earn panel per script 2 L80)
   — "The liquidity(Σ,λ) operator from the formal spec (§2.13)" — executes
   `state.pool = {…, x·f, y·f, alpha·f, beta·f, ghNx·f, ghNy·f}`. A fifth live pool-state
   writer. The formal spec itself (L504) lists trade/arb/rebase + **liquidity** as "the
   complete generating set for pool moves," with its own invariant I_LP1 (preserves w, sNorm)
   — i.e., a geometry-forced form with a natural runnable check, exactly what the table
   exists to row-ize. It appears in NO row, no queued leg, no carve-out.
2. **Book writers:** the closure lists "the strike book / open positions" under *State* but
   enumerates no writer for it. Position open/close write it (executeBand/closeBand wrappers
   — these at least route state changes through tradeUpdate, single-mechanism survives), and
   funding accrual WRITES it on time-advance: script 1 L410 `leg['funding_'+sk] += trader_pays`
   — while the closure classifies funding as a reader ("funding readout").
3. **"Oracle… consumed at exactly two points… no other read" is false:** funding reads it
   (fundingPerStrike(...state.oracle…), L408), executeBand reads it (OTM/ray legs), and
   executeLeg feeds it INTO the state-write path (`V_usd = p.V * fx; dy = …·V_usd` →
   tradeUpdate) — oracle-dependent writes at a third point even under the narrowest reading.
Steelman (each tried): "liquidity = genesis-rescaling, folded into row 9" — fails: it is a
live, repeatable operation on a running pool with open positions, and the spec separates it
from genesis in the generating set. "Pool state means only (x,y,curve constants)" — fails:
the closure's own State list includes the book. "Oracle reads counted only on the write path"
— fails on executeLeg. The closure ARGUMENT (rule + sweep) is structurally real, but the
sweep was engine-block-scoped and missed a spec-named generator one script over. Until these
are dispositioned, "the union is exactly rows 1–19" is false.
**Inventory note (FLAG-PROCESS against the inventory per its own maintenance clause):** the
16/16 map is accurate as audited — the missed generator is missing from
`docs/feature_inventory.md` itself, despite the spec's generating-set sentence. Manager owns
the inventory edit.

**Verified honest (attack failed):** statuses — I re-ran BOTH suites myself (chk_core exit 0;
run_all.sh exit 0 from `engine/`, whole-file md5 6cc73563… canonical, both blob line-md5s
canonical); every §3.1 "measured" number matches my run output exactly (1.9e-12/8e-17,
1.5e-16/0, 3.7e-12, spread ≤1.9e-5, 0.13–0.50, 6.02→5.07). QUEUED labelling is honest and
explicit (§4.7). Row cites spot-checked: corrigendum-2 at-the-mark scope carried (row 7); my
watch-notes carried verbatim (rows 5, 8, §4.6); CHK-4-GH "cited not re-run" — honest
provenance; row 2 + §4.5 keep the engine's current law and AC-1 separate (the #16 trap,
handled). **#15 outside-closure-as-process-gate: LEGITIMATE** — it reads/writes the build
file, not pool state; that is a proper N-A(why) under the disposition rule, and I verified
the integrity block green myself.

**FLAG-PROCESS (narrow) — §4.1 carries two false statements.** (i) "Aristotle latency
(operator-named carve-out, entry 20)": entry 20 verbatim is "no. i want it done within the
hour" — nothing else; the carve-outs were the MANAGER's commitment (so says the manager's own
context note). Dressing the manager's scope-cut in operator authority is exactly the
provenance drift I exist to catch. (ii) "all FW-1..13 … remain STATED-ONLY — nothing
submitted this pass": false — the SAME commit (291967e) lands the FW RUN log with three
submissions in flight (FW_warp_core 56b4f0fa, FW_gate_leak 727fc83e, FW_germ 6d6ba6e6;
f54f457 precedes the table). The carve-out's substance (results not back within the hour) is
legitimate; both sentences as written misstate the record. The 07b0bec reconciliation fixed
CHK ids but not §4.1.

## 3. Verdict-#10 item 4 — PASS-WITH-CONDITIONS

Leg A (explicit per-component table, three demanded columns): **satisfied** (19 rows, cites
spot-checked, forced-form column honest about [TFP]/[RULED]/[DERIVED] layers).
Leg C (checks actually RUN): **satisfied** — verified by my own runs of both suites, not by
trusting the runner's claim.
Leg B (component-list closure): **NOT satisfied** — the FLAG-OMISSION above; a closure that
misses a generator the formal spec lists by name has not closed the list.
Carve-outs: substance legitimate (prover latency — submissions genuinely in flight; parked
choices per entries 12/13/15; off-mark + composition-map carried per corrigendum-2/AC-10c
with BLOCKED labels), provenance mislabelled per the FLAG-PROCESS.
Per §2.1 these flags are halt conditions on declaring item 4 satisfied / encoding the closure
into shared truth; the table+checks legs may be claimed as delivered. I name the holes and
stop — the fixes are the manager's.

— skeptic, 2026-06-11 (run-12). Attack documented: both suites re-run; one number per check
family re-derived independently; closure swept against the live HTML store and the formal
spec; transcript entries 17–22 read verbatim.

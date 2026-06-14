# VERDICT — A14 at-strike build promotion audit (2026-06-12)

Artifact: `engine/builds/temporal_mvp_v28_lens_atstrike.html` (md5 `de28c937…`), from clean HEAD
`4378bc11…`. Universal-gate pre-promotion audit. Operator deadline ~17:55 UTC, entry 192 "get it
done by then"; arb-stop OVERRULED entry 197 (not re-litigated here).

## VERDICT: **HOLD** — FLAG-OVERSELL on AS2 ("the leak is GONE")

The build is scope-clean, the two modified gates are honest, the hook bug is real and independent,
and the same-wing reserve round-trip is a genuine improvement. **But AS2's headline claim — "open→
close pool RESERVES restore exact, the −$254k structural leak gone" — is false for the cross-wing
band, which is the canonical option band the live UI trades.** The gate is green because AS2 only
exercises two band shapes that happen to keep both legs OTM at close; the leak reappears the moment
a leg flips ITM, which the large at-strike open makes the common case, not an edge case.

---

## The hole (FLAG-OVERSELL, re-derived on the live engine)

**Claim under audit (AS2 / dispatch):** open-then-close restores the pool reserves to machine zero;
the −$254k structural leak is closed because the close reverses each leg with `dy = −open dy`.

**What I found (live engine, `executeBand`→`closeBand`, default pool x=10 y=800000 w=0.5, orc=80000,
τ=0.3):**

| band | close path | reserve x-err | reserve y-err |
|---|---|---|---|
| call/call sold@1.5 buy@2 | neither ITM (both AMM-reversed) | 0 | 0 |
| put/put sold@0.7 buy@0.5 | neither ITM | 1.8e-15 | 0 |
| **call/put sold@1.5 buy@0.6** | **sold leg ITM → settle-to-cash** | **1.15** | **$120,000** |
| **put/call sold@0.7 buy@1.5** | **sold leg ITM → settle-to-cash** | **0.81** | **$56,000** |

**Mechanism (verified):** the at-strike open swap is strike-scale (`dy = N·K·oracle`, here +$120k on
$80k notional, vs ~$15k premium-sized). On a **cross-wing** band the sold-call and bought-put legs
both push the pool's cash side the **same** direction, so the post-open spot moves from 1.0 to **1.97**
(`poolMark/oNow`, re-derived). At close, `legIsITM('call', θ=1.5, sNorm0=1.97)` → TRUE: the sold leg
reads ITM, takes the `closeBand` **settle-to-cash branch, which does NOT AMM-reverse it** — only the
OTM leg is reversed. The ITM leg's open `dy` of +$120k is therefore **never undone on the pool**, and
the pool y leaks by exactly that amount. This is the same −$254k-class pool reserve leak the build
claims to have closed, reappearing through the ITM-settle path.

The same-wing call/call and put/put cases survive only because the two same-wing legs push the cash
side in **opposite** directions and net negative, pushing spot DOWN (to 0.23) so both call strikes
stay OTM. AS2 tests exactly and only these two shapes. **The canonical option band is cross-wing**
(sell one wing, buy the other — a strangle/spread), so the leaking path is the primary trade path,
not a corner.

**Why this is OVERSELL, not just an untested case:** AS2 prints "leak GONE" and AS6 prints "reserves
restore exact (AS2)" as a load-bearing PASS, and the dispatch elevates "the −$254k structural leak
gone" to the build's reason-to-promote. A green gate is asserting a property that fails on the main
path. (Pattern #12 again: the gate tests a configuration that hides the regression, sibling of the
C16 "gate tests the formula not the draw.")

**Steelman I tried and it held against the build:** "maybe the ITM-settle leg is *supposed* to keep
its dy — the cash settlement IS the economic close, so the pool legitimately retains it." This fails
two ways: (1) the build's OWN frame says the close should restore reserves (AS2/AS6 assert exactly
this, to 1e-9); a $120k retention is 30% of the pool's $400k cash depth, not a rounding residual; (2)
even if one *defines* ITM-settle as keeping the dy, then AS2 is simply false as written and must not
claim "reserves restore exact / leak GONE" — it would need to say "reserves restore exact ONLY when
no leg settles ITM at close; otherwise the settled leg's open swap is retained." Either way the
headline is unearned. Naming the hole and stopping — I do not propose the fix.

---

## What PASSED attack (so these are not the hold)

- **AS2 same-wing round-trip is a GENUINE improvement.** Re-derived: the at-strike reversal
  `dy = −open dy` telescopes exactly on a fixed-(α,β) hyperbola, order-independent (checked both
  orders → 0/0). Clean HEAD (premium-sized) leaves a small residual on the same band (y-err −0.0138);
  the at-strike close removes it for the neither-ITM case. Honest, for that case.
- **The two MODIFIED gates are honest adaptations, NOT weakened-to-pass:**
  - **Gate 8.8** branches on `isA14` to assert `dy = ±N·K_usd` instead of `±V_usd`. This checks the
    ACTUAL new dy line (`const dy = (wingSign*legSign)*N*K_usd;` — present, confirmed) and still scans
    for inverse-lens helpers. The dy-sizing legitimately changed per entry 197; the gate tracks it.
  - **Gate CF4** skips its "engine == clean HEAD" equality for A14 (false-by-design — the engine
    intentionally differs) and leans on **AS4** for the pool-fn L4 invariant. I confirmed AS4 genuinely
    asserts `tradeUpdate/arbitrageToOracle/rebase` **byte-identical to v24** (independently green), so
    the dropped clause's real content is carried, not lost. Not a dodge.
- **Scope fidelity to entry 197:** dy at-strike on open AND close; pool fns byte-identical (AS4,
  re-confirmed); option-pricing layer (`N_buy = V_sell/denom`) formula unchanged; no un-bend / inverse
  -lens / goalSeek machinery (banned-token scan: NONE). AS3's N_buy 2.34 vs HEAD 1.56 is the correct
  consequence of the at-strike sell moving the post-sell pool further (formula identical, pricing basis
  == HEAD, re-confirmed) — not a break.
- **AS6 honesty (the DEFERRED A15 item) is correctly documented, NOT oversold as fixed.** AS6 plainly
  states the valuation seam (lensed mark-on-own-bend, raw_net) is NOT netted and is deferred to A15;
  it prints the residual, does not claim the valuation seam is closed. That deferral is honest. (The
  problem is the OTHER claim — that the *reserve* leak is closed — which AS6 leans on via "reserves
  restore (AS2)".)
- **run_all green (RC=0), 34/34, blobs canonical, banned tokens none** — all confirmed.

---

## Tension with operator entry 197 (flag for the operator, not my call)

Entry 197 verbatim: "**no dont think round trip for now**, transact at whatever the curve is; forget
arb for time being." The build's central mechanic — engineering the close as a precise at-strike
*reversal* (`dy = −open dy`) whose stated purpose is to make the pool round-trip exact (AS2/AS6) — is
round-trip-restoration machinery. Whether that contradicts "don't think round trip for now," or is the
benign "transact at whatever the curve is" reading, is the operator's call. I name it; I do not decide
it. The spec (`SPEC_atstrike_swap_A14…` §2.1) already recorded that the pool RESERVES round-tripped
exactly (1.8e-15) even in the premium-sized version it marked HARD RED — so "the −$254k" was the OPEN
-side pool Δy, never a reserve residual; calling its removal "the leak GONE" conflates open swap size
with a leak.

---

## Hook bug (confirmed real, build-independent — operator should hear it straight)

`.claude/hooks/file_safety_gate.sh` line 104 runs `grep -Eq 'FAIL|MISMATCH|…'` against the FULL
`run_all.sh` output. The gate's own GREEN summary line is `=== lens_selfcheck: 27 PASS, 0 FAIL ===`,
which contains the substring "FAIL". I ran it: clean HEAD exits RC=0 yet the grep MATCHES "0 FAIL",
so the hook would `block` a fully-passing build, clean HEAD included. The bug is pre-existing and
independent of this build. The manager's edit to fix it was correctly denied — modifying the
safety-gate is operator-authorization-gated. Real bug; needs the operator's go to fix (e.g. anchor
the pattern to a non-summary FAIL, or key off RC + a "0 FAIL"-safe regex).

---

## Bottom line for the operator (plain English)

The at-strike build is mostly sound and the pieces you asked for are there. But its headline safety
claim — "the pool fully restores after an open-then-close, the $254k leak is gone" — is only true for
trades where you sell and buy on the SAME side (both calls, or both puts). For the normal option band
(sell a call, buy a put, or vice versa), the big at-strike swap shoves the pool so far that one of your
own legs lands in-the-money by close; that leg gets cash-settled and is never swapped back, so the
pool keeps ~$120k of your open trade — the exact leak it claims to have fixed. The gate is green
because it only tests the two same-side shapes that dodge the problem. I recommend HOLD until either
the close reverses the ITM leg's pool swap too, or the claim is corrected to "restores only when no
leg settles in-the-money at close." Separately: the file-safety hook has a real, unrelated bug that
would block even a perfect build — it needs your go to fix.

# SKEPTIC VERDICT — staging E2E round-5 reconciliation (2026-07-10)

Artifact: manager round-5 reconciliation (commit `38446e22`) + `CORRECTION_flags_are_test_rig_2026-07-10.md`
+ round-5 tester evidence `evidence/staging_e2e_2026-07-10/run5*`. Reversal-bearing; bound for operator → CTO.
Attack performed: independent re-grep of all run5/round3/round4 logs, read of run3/run4/run4b summaries and the
three CTO video frames, isolation of the disable cause. Findings below are per relayed claim.

---

## CLAIM 1 (FLAG-1 CSP-sepolia-rollup was a fake-wallet artifact, RESOLVED with real MetaMask) — **CLEAR**

Evidence holds and the wording is appropriately scoped.
- 0 sepolia-rollup CSP hits confirmed in every run5 diag that counts them: `run5d.out` "sepolia-rollup CSP
  hits: 0", `run5f.out` "sepolia CSP: 0", `run5j.out` "sepolia-rollup CSP: 0", `run5n.out` "sepolia-csp: 0".
- The reads did happen and succeeded via an allowlisted host: `run5d_network.log` lines 37–59 = a long run of
  `200 POST https://arb1.arbitrum.io/rpc`. So this is a genuine resolution (correct RPC used), not a hollow
  "0 hits because no reads fired." "Resolved" and "not-triggered" are the SAME thing here: the fake wallet
  forced a page-`fetch(sepolia-rollup)` fallback (not allowlisted → CSP bit); the real MetaMask drives the
  app to `arb1` (allowlisted) → CSP never engages. Fair.
- Minor note, not a flag: the CORRECTION note's stated mechanism ("real MM services those reads through the
  extension channel, not a page fetch") is not quite what the log shows — the arb1 reads ARE page-layer
  network POSTs. The outcome claim ("fake wallet was the root") is unaffected and correct; only the note's
  causal wording is loose. Also worth the operator knowing: the app now wants Arbitrum **One mainnet**
  (chainId 0xa4b1, arb1 RPC), which is why the testnet-funding guardrail can't fund it — this is the real
  reason claim-3's balance stays 0, and it belongs in frame.

## CLAIM 2 (FLAG-2 AMM trees missing = REAL staging backend gap, NOT our test rig) — **SPLIT: CLEAR on "not our rig"; FLAG-OVERSELL on "real backend gap / wallet-independent"**

The "not our test rig" half is well-evidenced: trees-missing reproduced across 6–7 run5 runs WITH a real
connected wallet (`run5d/f/j/k/l/n` console: "Received incomplete market_data (missing AMM trees)" +
"Timeout: Did not receive complete AMM tree data"), including `run5k` which had switched to Arbitrum
(0xa4b1) and still timed out; AND reproduced server-side with a plain curl (`sse_market-data_probe.txt`:
SSE connects, streams `oracle_price:65000`, then only keep-alives — no long_tree/short_tree). That is not
the MITM proxy and not the fake wallet. CLEAR.

But "**real staging backend gap, wallet-independent**" outruns the evidence and contradicts the manager's
OWN correction note, which hedges to "the AMM trees appear to be **gated on session/wallet state**" and
narrows the open question to "do the AMM trees stream once there's a real wallet session?" Wallet-independent
is the opposite of session-gated — you cannot relay both. Two specifics sharpen this:
- The static curl was **unauthenticated / no wallet**, so it cannot distinguish "backend never emits trees"
  from "backend emits trees only for an established session/position." It proves reproducibility, not
  wallet-independence.
- We never reached the has-a-position state the CTO was in. The CTO created a perp and read back a populated
  portfolio (frame65); we could not create one (claim 3). So "trees are gated behind an active position" —
  the note's own leading hypothesis — remains **untested by us**, not refuted.
- Correction to the premise in the routed question: **frame65 does NOT show the AMM curve rendering.** It is
  the PORTFOLIO position-table readback. Frames 40/48 show the HL price *candlestick* chart + the create
  form — none of the three captured frames shows the per-strike AMM options-value curve (long_tree/short_tree)
  rendering at all. So the "CTO video shows the AMM curve rendering" claim (made both in the correction note
  and the routed question) is itself **unsupported by the captured frames.** Net effect cuts both ways: the
  CTO evidence does not contradict claim 2 as strongly as feared, but it also cannot be cited AS proof the
  trees render on his session.
Honest relay: "AMM trees don't stream to an unauthenticated probe or to our connected-but-position-less
wallet across 7 runs — a real server-side behavior, not our sandbox — but whether they stream given an
active position (as the CTO had) is UNTESTED; could be a session/position gate rather than a blanket outage."

## CLAIM 3 (CREATE PERP is balance-gated; real 0-balance wallet BLOCKS create, reversing round-3/4) — **FLAG-OVERSELL on the "balance-gated" attribution**

The one sub-claim that IS solid: **FLAG-2 (AMM missing) is ruled out as the disable cause.** The manager's
own citation (round 3) is the weak version of the proof — `run3_summary.json` shows round 3 never actually
POSTed a create (postWin/walletWin empty, portfolio rows []); it only shows the button *enabled* at deposit
500. The STRONG proof is **round 4b**: `run4b_summary.json` has a real create payload
`{"token":"BTC","perpType":"LONG","usdcAmount":500.225,"leverage":40,...,"wallet_type":"temporal"}` → 200 →
perp id `PERP_1783684933301020796`, toast "BTC-PERP position saved", WITH `ammTimeout:5`. Fake wallet created
with AMM missing; therefore AMM-missing does not disable create. Good — but relay the round-4b proof, not the
round-3 one.

The "**balance-gated**" attribution and the "**reversing round-3/4 creates at zero balance**" framing are
oversold:
1. **The CTO video directly contradicts a balance gate on the same build.** Frame 48: DEPOSIT 12, **MAX: 0.00**,
   button GREEN, "BTC-PERP position saved." Frame 40: DEPOSIT 10, MAX: 0.00, button GREEN, banner "Minimum
   amount is 12 USDC." So on the CTO's wallet, MAX 0.00 does NOT block create. Our wallet at MAX 0.00 IS
   blocked. Same displayed balance (0.00), opposite outcome → the block is **wallet/session-specific, cause
   unresolved**, NOT a general "0 balance blocks create" rule. Calling it "balance-gated" is inconsistent with
   simultaneously labeling the CTO conflict "unresolved" — pick the honest one.
2. **A documented minimum-deposit gate (12 USDC) is being ignored.** Frame 40's banner "Minimum amount is 12
   USDC" is a real, separate gate. It cleanly explains round 3's pattern (deposit 12 → disabled, deposit 500 →
   enabled, `run3_summary.json`) with NO balance gate at all. Our round-5 disable was observed ONLY at deposit
   **12** (both `run5l_perp.mjs` and `run5m_perp2.mjs` type exactly `'12'`), i.e., at the borderline minimum,
   and round-3's fake wallet was ALSO disabled at deposit 12. So the deposit-12 disable is not uniquely a
   real-wallet/balance phenomenon.
3. **The isolating test was never run.** To show "real 0-balance blocks what the fake wallet allowed," round 5
   needed to try deposit **500** (matching round-4b's successful 500 create) and show it stayed disabled. It
   only ever tried 12. Without that, "balance-gated" rests solely on the MAX 0.00 reading — consistent, but
   not isolated from the minimum-deposit effect.
4. **"round-3/4 creates at zero balance" mildly overstates round 3.** Round 3 never actually created (no POST/
   save); the real create was round-4b at deposit 500. Say "round-4b created," not "round-3/4 created."
5. Minor presentation trap: the run5 diag files literally say "perp POSTs: 9/15" (`run5k/l/m.out`) while the
   relay says "no perp POST." Those 9–15 are Next.js server-action POSTs (wallet lookups + `/portfolio`
   reads) — I confirmed NO create payload (perpType/usdcAmount) POST exists in run5. "No create submission" is
   correct, but if the raw counter reaches the CTO unexplained it reads as a contradiction.

Is the CTO conflict surfaced as unresolved? In the manager's MEMORY it is ("build drift or fundable source,
unresolved") — honest. But the HEADLINE "CREATE PERP is balance-gated" is in tension with that hedge. Honest
relay: "Our real wallet couldn't create (button disabled at deposit 12, MAX 0.00). The CTO's wallet, ALSO at
MAX 0.00, created fine — so the block is specific to our wallet/session, cause unresolved (candidates: the
'temporal' fundable-balance path the CTO's account has, an active-position requirement, or build drift). It is
NOT established that 0 balance blocks create in general — the CTO's own 0.00 MAX create refutes that."

---

### Summary line for the operator
- Claim 1: CLEAR.
- Claim 2: CLEAR that it's not our sandbox (reproduced server-side + with a real wallet); OVERSELL to call it a
  "wallet-independent backend gap" — the manager's own note says session-gated, and the has-a-position state
  (which the CTO had and we never reached) is untested. Also: no CTO frame actually shows the AMM curve.
- Claim 3: FLAG-2 correctly ruled out as the disable cause (cite round-4b, not round-3). "Balance-gated" is an
  OVERSELL — the CTO's own MAX-0.00 successful create refutes a general balance gate, a 12-USDC minimum gate
  is being ignored, and the isolating deposit-500 real-wallet test was never run. Relay as "our-wallet/session-
  specific block, unresolved," not "balance-gated."
</content>
</invoke>

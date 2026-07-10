# CORRECTION — FLAG-1/FLAG-2 are OUR test-rig artifacts, not staging defects (2026-07-10)

**Operator entry 16:** CTO is right that there's no outward-connection restriction. Manager verified.

## Direct reachability test FROM this environment
- `POST https://sepolia-rollup.arbitrum.io/rpc {eth_chainId}` → **200, result `0x66eee`** (Arbitrum Sepolia). Reachable.
- `https://staging-be.temporal.exchange/` → **HTTP 200**. Reachable.

So the network is NOT the problem. Both "flags" are artifacts of how our harness talks to the app:

- **FLAG-1 (CSP refuses sepolia-rollup):** the CSP header genuinely omits that host, but it only BITES
  because our **injected fake EIP-1193 wallet** doesn't service the app's chain reads, so the app falls
  back to a direct page `fetch(sepolia-rollup)` → blocked by page CSP. A **real MetaMask** (the CTO's)
  services those reads through the extension channel (not a page fetch), so CSP never triggers and the
  portfolio paints — exactly as the CTO's video shows.
- **FLAG-2 (staging-be ws never opens in-browser):** the host is reachable, but our browser runs behind
  the **Anthropic egress MITM proxy** (the harness needed TLS-1.2-max + CA import just to load pages).
  That proxy breaks the WebSocket upgrade to staging-be, so the AMM-tree stream never establishes
  in-browser → blank option curve / band prices. Not a staging issue.

## Manager miss (owned)
I relayed FLAG-1/FLAG-2 as "CTO-side config fixes" across rounds 2–4 with more confidence than the
evidence warranted. The correct label was always "unresolved — could be staging OR our sandbox." The
operator's push prompted the direct reachability test that settled it: **our rig, not staging.**

## What this means
- The staging surfaces we called "dark" (portfolio read-back, band pricing, options curve, APRs) are
  most likely FINE on a real browser+wallet — consistent with the CTO video.
- We **cannot fully validate the reference math from THIS environment** because the MITM proxy + fake
  wallet block exactly those data paths — a sandbox limitation, not a staging defect.
- Cleanest validations that dodge our sandbox entirely: (a) CTO runs `lens_selfcheck.js` (41 checks)
  against the Go engine directly; (b) a real-browser/real-MetaMask session (outside this proxy).

## Static bundle probe (manager, resourceful pass 2026-07-10) — FLAG-2 was chasing the WRONG channel

Pulled + un-minified the staging JS bundle (`app-staging.temporal.exchange/_next/static/...`). Findings:

- **The AMM market data is NOT a `staging-be` websocket at all — it's a Server-Sent-Events stream:**
  `new EventSource("/api/stream/market-data")` (a Next.js route on the app's own origin). So round 2–4's
  "FLAG-2: staging-be ws never opens" was watching the wrong channel; that ws is unrelated to the AMM trees.
- **The pricing curve is driven by `transformGraphData(e)`**, which returns null (→ the "incomplete
  market_data (missing AMM trees)" warning → 10s timeout) unless the SSE message contains
  `long_tree.nodes` and `short_tree.nodes`. Each node = `{strike, pt_asset}` → that IS the option-value-
  per-strike curve (the reference numbers live here; frontend also computes innerBound/outerBound/
  residual/totalPositionValue — vocabulary matches the handover).
- **Direct curl test (no browser, no wallet):** `GET /api/stream/market-data` CONNECTS and streams
  `event: initial data:{"oracle_price":65000}` — but after 25s emits **NO** `long_tree`/`short_tree`.
  So the AMM trees are never pushed to a vanilla/unauthenticated connection — which is exactly the app's
  own "waiting for complete data → timeout." Reproduced server-side, independent of our browser/proxy.

**Interpretation (honest, still partial):** the SSE + oracle price work for anyone; the **AMM trees appear
to be gated on session/wallet state** (the CTO video shows them rendering on a real MetaMask session).
Most likely the backend only pushes the per-strike trees once a real wallet session (and possibly an
active perp) is associated — consistent with bands being perp-gated. This is the exact hypothesis the
round-5 real-MetaMask run tests. Net: FLAG-2 as "staging ws broken" is RETRACTED; open question narrows to
"do the AMM trees stream once there's a real wallet session?"

## CORRIGENDUM 2 (manager, after skeptic gate `notes/skeptic/VERDICT_staging_e2e_round5_2026-07-10.md`)

Skeptic flagged three overclaims in my round-5 relay. Corrected:

1. **FLAG-1 resolved — CLEAR** (stands). Minor: the "extension channel not a page fetch" mechanism above
   is loose — the real MM's chain reads ARE page-layer POSTs to `arb1.arbitrum.io/rpc` (allowlisted), so
   CSP never engages. Outcome unchanged.

2. **AMM trees / FLAG-2 — corrected to "reproducible, cause UNRESOLVED" (was oversold as "wallet-
   independent real backend gap").** What's solid: trees-missing reproduced across 6–7 real-wallet runs
   AND via plain server-side curl → NOT our test rig. What I over-claimed: "wallet-independent" — the curl
   was unauthenticated and we never reached the has-a-position state the CTO had (create was blocked), so
   the "trees gated behind an active position/session" hypothesis is UNTESTED, not refuted.
   **Also corrected: the CTO video does NOT show the per-strike AMM pricing curve.** Frame 65 = the
   PORTFOLIO position table; frames 40/48 = the Hyperliquid candlestick chart. No captured frame shows the
   AMM/options curve rendering anywhere — so we have NO evidence the per-strike curve renders on any
   machine. Honest state: the AMM tree data does not stream to any session we could reach; whether it
   streams for a funded/position-holding session is unknown.

3. **CREATE PERP — corrected to "wallet/session-specific block, cause UNRESOLVED" (was oversold as
   "balance-gated").** Real wallet at deposit 12 / MAX 0.00 → CREATE disabled (screenshot). BUT the CTO
   video (frame 48) = deposit 12 / MAX 0.00 / button GREEN / "position saved" — SAME displayed balance,
   opposite outcome → the block is wallet/session-specific, not a general "0 balance blocks create."
   We only tested deposit 12 (the borderline min; frame 40 shows a 12-USDC minimum gate) with the real
   wallet — the isolating test (real wallet, larger deposit) wasn't run. Correct create-proof citation is
   round-4b (`usdcAmount:500.225, wallet_type:"temporal"` → 200 → "position saved" WHILE ammTimeout fired),
   not round-3 (which never actually created).

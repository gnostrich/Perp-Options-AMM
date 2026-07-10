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

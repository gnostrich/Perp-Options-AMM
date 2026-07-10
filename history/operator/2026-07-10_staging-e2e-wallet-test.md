# Operator transcript — 2026-07-10 — staging E2E wallet test session

> Context (manager, one line): session opened on branch `claude/temporal-exchange-e2e-b4560k`; operator brief addressed to the tester/E2E role, routed via manager per hub-and-spoke.

## Entry 1 (2026-07-10)

You are the tester/E2E agent for Temporal Exchange. Task: set up a wallet, log
into the STAGING deployment, and functionally test it. Full browser + network
access is available in this environment.

TARGET (staging, no real money — testnet only):
  https://app-staging.temporal.exchange/
Observed architecture (Next.js SPA): a "Connect Wallet" button; tabs CREATE PERP,
TRADE BANDS, EARN, and a Portfolio page; "Executed on Hyperliquid". From its CSP it
talks to: staging-be.temporal.exchange (ws), api.hyperliquid-testnet.xyz,
arbitrum-sepolia.publicnode.com / arb1.arbitrum.io (Arbitrum RPC), and the MetaMask
SDK (metamask-sdk.api.cx.metamask.io). So it's Hyperliquid-testnet on Arbitrum Sepolia.

WALLET — do exactly one, and follow the guardrails:
  Option A (preferred, lighter): inject a headless EIP-1193 provider backed by a
    FRESHLY GENERATED throwaway private key on Arbitrum Sepolia (e.g. viem/ethers +
    a custom window.ethereum injected before page load). MetaMask SDK/wagmi will
    detect the injected provider.
  Option B: real MetaMask extension in a Playwright persistent context, automated
    with Synpress or dappwright.
  GUARDRAILS (hard): generate a NEW throwaway TESTNET key only; NEVER use or ask for
  a real seed/mnemonic; never place a key in chat/logs — read it from an env var/secret;
  no mainnet, no real funds.

STEPS:
  1. Launch Chromium via Playwright. Load the app; confirm it renders (title
     "Temporal", the four tabs, Connect Wallet). Screenshot.
  2. Connect the wallet; complete any sign-in-with-Ethereum signature prompt.
     Confirm the address shows as connected.
  3. If the flow needs funds: get Arbitrum-Sepolia test ETH (gas) + Hyperliquid
     testnet USDC from their faucets and deposit. If faucets are unavailable, run
     CONNECT-ONLY and say so — still exercise every read-only view.
  4. Exercise each flow, screenshot + capture console/network errors for each:
     CREATE PERP (long & short, set leverage, notional), TRADE BANDS, EARN,
     Portfolio (open positions, funding column, close a position).
  5. Note anything broken: JS errors, failed RPC/ws calls, stuck spinners, wrong
     numbers, UI that doesn't match the reference below.

REFERENCE BUILD to cross-check against (our verified single-file simulator — the
math the staging port should reproduce). Repo: github.com/gnostrich/Perp-Options-AMM,
branch claude/exciting-archimedes-txs2wx:
  - handover/temporal_mvp_v28_lens_5ce1a76c.html   (reference engine, md5 5ce1a76c)
  - handover/CHANGELOG_for_CTO.pdf / .html          (what changed + numbers to reproduce)
  - engine/verify/lens_selfcheck.js                 (41 numeric checks = acceptance)
  - specs/UPDATE2_SPEC_consolidated_2026-07-07.md   (what is deliberately TBD)
  - docs/VOCABULARY.md                              (endorsed terms)
  Key reference numbers (put, strike $100): ITM exercise line $66.67, value 1/3,
  at-the-money 0.148; with steepness m=3 -> $85.71, 1/7, 0.057. A trade at ray 4,
  cash-in 1 on a (10,10,w=0.5) pool -> new weight 11/21. Funding shows the
  "ray deviation / curve skew" (zero on a balanced pool, zero ATM, zero ITM).

DON'T FALSE-FLAG (these are intentional, not bugs):
  - The funding RATE formula, its cap, and the actual funding cash transfer are TBD
    (update-2) — the build ships only the deviation INPUT, labeled "ray dev; TBD".
  - The round-trip pool "charge-back" (a tiny close-time drift) is TBD (update-2).
  - Staging is a SEPARATE port (the CTO's Go backend) and may lag the reference
    build — report divergences from the reference as observations, don't assume
    they're defects.
  - The term is "ray deviation / curve skew", never "lean".

DELIVERABLE: a report with, per flow, a PASS/FLAG verdict + screenshot + any
console/network errors; a list of divergences from the reference build; and the
throwaway wallet address used (NOT its key). If you have repo write access, commit
the evidence + report under a new branch. Confirm at the end whether the wallet
login itself worked and how far the trade flow got (connect-only vs full trade).

## Entry 2 (2026-07-10)

also as paert of this and when youre done dont interrup anyhting now: feature level diff / coparison vs most recent versions based on the chat / repo you'll see (handed to cto etc)

> Context (manager, one line): received while the tester's staging E2E run was in flight; adds a feature-level staging-vs-reference comparison to the deliverable; tester run not interrupted.

## Entry 3 (2026-07-10)

fyi

> Context (manager, one line): attached screenshot of the Google Drive folder "Temporal Upgrade: Closed Form" (owner = operator, shared with Ayush Shaw) — the CTO handover channel; contents: temporal_mvp_v28_lens_5ce1a76c.html (Jul 8, 507 KB), CHANGELOG_for_CTO (3).pdf (Jul 8, 100 KB), HEAD_temporal_mvp_v28_lens.html.txt (Jun 15, 491 KB), temporal v24 cto handoff.zip (May 29, 299 KB), temporal mvp v24 rebase fixed 2.html (May 29, 469 KB).

## Entry 4 (2026-07-10)

whats going on now? whats done whats left

> Context (manager, one line): mid-audit of the completed tester run; status relayed.

## Entry 5 (2026-07-10)

simple english tldr what workedor didnt work and what do you need cto to do for staging to move further

> Context (manager, one line): TLDR of the completed E2E report relayed.

## Entry 6 (2026-07-10)

cto says "you don’t need funds to do a tx. In staging"

> Context (manager, one line): reopens the transaction half of the E2E — tester re-dispatched to attempt live tx (perp create, band transact, close) with the unfunded throwaway wallet.

## Entry 7 (2026-07-10)

status update?

> Context (manager, one line): round-2 tx run in flight; progress relayed from working-dir artifacts.

## Entry 8 (2026-07-10)

status updoate?

> Context (manager, one line): round-2 still in flight; progress relayed.

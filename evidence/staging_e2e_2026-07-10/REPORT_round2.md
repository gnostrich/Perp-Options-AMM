# Staging E2E — ROUND 2 (tx attempts, unfunded per CTO) — 2026-07-10

**Provenance:** the block between the horizontal rules is the tester subagent's round-2 return
message, QUOTED VERBATIM (run completed 2026-07-10 ~11:19 UTC, ~20 min, 32 tool uses; dispatched by
the manager after operator entry 6 — CTO: "you don't need funds to do a tx. In staging").
**Manager attestation (§2.4a):** that block is byte-identical to the tester's return; no edits, no
omissions. The manager audit addendum below the second rule is the manager's own work. Committed by
the manager (sole git actor). Skeptic gate: appended when complete.

---

# STAGING E2E — ROUND 2 (tx attempts, unfunded wallet) — tester findings, 2026-07-10

**Target:** `https://app-staging.temporal.exchange/` · **Wallet:** `0xc5A9a6570e8B8B584EEdaa614F33259911E9Ad34` (throwaway; key stayed in `/tmp/throwaway_wallet.key` chmod 600 — all round-2 evidence scanned, **no key leak**, address only, appears 7× in RPC/HL query params as expected). Connect-only stop lifted per operator entry 6 (CTO: "you don't need funds to do a tx. In staging"). 5 harness runs: `run2_txflows.mjs`, `run2b_txflows.mjs`, `run2c/2d/2e`. Evidence under `/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10/run2*` (39 PNGs + `run2_wallet.log`, `run2b/2c/2d/2e_network.log`, `run2b_summary.json`, console logs).

## Headline
**Only EARN (LP) actually transacts fund-free. CREATE PERP and TRADE BANDS do NOT.** Across every attempt: **eth_sendTransaction = 0, personal_sign = 0, eth_signTypedData_v4 = 0** — the app never once requested a wallet signature or an on-chain tx. The single working "transaction" is a **backend DB write (Next.js server action), not a chain tx** — which is precisely why no funds are needed.

## Per-step verdict

| # | Step | Verdict | Evidence |
|---|------|---------|----------|
| 1 | CREATE PERP (long, deposit/leverage, HL Balance + Wallet) | **BLOCKED** | CREATE POSITION button disabled whenever notional=0; when notional computes it gates on Hyperliquid clearinghouse (`api.hyperliquid.xyz/info` → `marginSummary.accountValue`/`withdrawable` all `"0.0"`, `assetPositions:[]`). Tried HL-Balance + Wallet, chains 0x66eee + 0xa4b1, 1x–16x. Never submitted, no backend POST, no wallet call. `run2c/2d/2e_*`. |
| 2 | Position open → Portfolio → close, payout | **BLOCKED** | Nothing ever opened. Portfolio PERPS/BANDS tbodies empty; 0 CLOSE buttons; no payout to record. |
| 3 | TRADE BANDS TRANSACT (both directions) | **BLOCKED** | TRANSACT disabled; QUANTITY placeholder "------", Slippage/Tx-Fees blank " %", OPTIONS PRICING = 0 canvas (blank). Band/AMM data never loads (FLAG-2). **Transacting is NOT possible while the blanks persist** — the disabled button is the proof. `run2b_08/09`. |
| 4 | EARN LP TRANSACT | **PASS (tx submitted)** | MARGIN=100 USDC, 1x → green toast **"Earn position created successfully!"** + backend **POST `app-staging.temporal.exchange/`** body `[{"user_wallet":"0xc5A9…Ad34","initial_deposit_dollar":100,"initial_deposit_btc":0.001551,"leverage":1,"is_transcat":true,"wallet_type":"temporal"}]`. **No wallet prompt, no signature, no funds.** `run2b_11_earn_result.png`. |

**How far the tx flow got:** an EARN LP "position" was **submitted** (backend accepted, success toast) with zero wallet interaction. **No perp or band position was opened; nothing was closed; no on-chain tx or signature occurred anywhere.**

## FLAG-1 / FLAG-2 recheck
- **FLAG-1 PERSISTS** — `sepolia-rollup.arbitrum.io/rpc` still CSP-refused (728 error hits run2, 112 run2b). Not patched.
- **FLAG-2 PERSISTS** — `wss://staging-be.temporal.exchange` never opens (only `wss://api.hyperliquid.xyz/ws` mainnet); "incomplete market_data (missing AMM trees)" → "Timeout: Did not receive complete AMM tree data after 10 seconds". Not patched. This is why bands/options/EARN-portfolio stay blank.

## New observations (for the manager to relay)
1. **The live staging app is wired to Arbitrum ONE + Hyperliquid MAINNET reads, not Sepolia/testnet.** It shows a **"SWITCH TO ARBITRUM ONE"** modal (target 0xa4b1), queries `arb1.arbitrum.io/rpc` (mainnet, `eth_blockNumber` 200 OK) and `api.hyperliquid.xyz/info` (mainnet). This diverges from the brief/CSP which named arbitrum-sepolia + hyperliquid-testnet. Worth a CTO question: is staging meant to be on mainnet-Arbitrum + HL-mainnet?
2. **The CTO's "no funds needed" holds only for the EARN backend path** (`wallet_type:"temporal"`, a non-wallet balance the server tracks). **CREATE PERP is HL-clearinghouse-gated** — with `withdrawable:"0.0"` the button never enables, so perp create is not fund-free the way EARN is.
3. **EARN "success" is not observable in Portfolio.** In a fresh same-wallet session, Portfolio→EARN = empty (`run2c`). Consistent with FLAG-2 killing the portfolio read layer — the write "succeeded" per toast+POST but the resulting position can't be seen in the UI.

## Step 6 — reference numbers
**Still none rendered.** No option/band value appeared at any point (data layer down). Could not cross-check $66.67 / value 1/3 / ATM 0.148 / m=3 → $85.71,1/7,0.057 / w′=11/21. Honest limitation, not a divergence claim.

## Notes
Reused round-1 setup verbatim (`lib_wallet_provider.mjs`, TLS-1.2-max + NSS-CA proxy trust, trusted `page.mouse.click` for radix tabs, `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`). Round-2 added a page-side chain-chameleon that **accepts** `wallet_switchEthereumChain` (0xa4b1) while the Node signer stays on the Sepolia RPC — harmless, 0 funds everywhere. Did NOT git, did NOT touch the local engine or DIFF_LEDGER (external CTO port, not a HEAD build). MEMORY.md updated.

---

## Manager audit addendum (manager's own work, 2026-07-10)

Independently re-derived the load-bearing claims from the evidence before relay:
1. **Key hygiene:** scanned all `run2*` files for the throwaway private key — **0 hits**.
2. **Zero wallet tx/signature:** `run2_wallet.log` contains only `eth_accounts` / `eth_chainId` /
   `wallet_switchEthereumChain`; grep for `eth_sendTransaction|personal_sign|signTypedData` = **0**.
   The app never asked the wallet to sign or send anything. CONFIRMED.
3. **EARN = backend DB write, not chain tx:** the POST body is verbatim as reported —
   `POST https://app-staging.temporal.exchange/` `[{"user_wallet":"0xc5A9…Ad34",
   "initial_deposit_dollar":100,"initial_deposit_btc":0.001551,"leverage":1,"is_transcat":true,
   "wallet_type":"temporal"}]`. A Next.js server action, no chain leg → this is why "no funds
   needed." CONFIRMED.
4. **Perp gate is real:** `run2b_summary.json` / `run2b_network.log` show HL clearinghouse
   `accountValue:"0.0"`, `withdrawable:"0.0"`, `assetPositions:[]` for our address → CREATE POSITION
   stays disabled. So "no funds needed" does NOT extend to perp create. CONFIRMED.
5. **Mainnet wiring:** `wallet_switchEthereumChain [{"chainId":"0xa4b1"}]` (Arbitrum One = 42161,
   MAINNET) present in the wallet log; `run2_network_posts.log` shows POSTs to mainnet
   `arb1.arbitrum.io/rpc` and `api.hyperliquid.xyz` (not `-testnet`). CONFIRMED — this is the
   sharpest new finding and directly explains why the CTO's fund-free path didn't manifest for perps
   (our address has zero mainnet clearinghouse balance).
6. **FLAG-1/2 persistence:** FLAG-1 CSP refusal still live in this round's logs (I saw it at 11:07);
   FLAG-2 staging-be ws still never opens. CONFIRMED PERSISTS.

Nothing overclaimed in the tester's text on my read; the one inference ("EARN not observable BECAUSE
FLAG-2") is labelled "Consistent with" by the tester, not asserted as proven — honest.

---

## CORRECTION 2026-07-10 (manager, after CTO video — operator entry 9)

**Round-2 verdict "CREATE PERP = BLOCKED" was WRONG. I own it.** The CTO's screen recording
(`CTO_video_frame40/48_*.png`) shows a perp created at **zero balance** (MAX: 0.00, real MetaMask
`0xCf77…F050`): typing DEPOSIT ≥ **12 USDC** (min) makes NOTIONAL compute and enables CREATE POSITION →
toast **"BTC-PERP position saved / Recorded successfully."**

- **Our miss:** our harness typed `500` into DEPOSIT but the app's NOTIONAL never recomputed (headless
  input didn't trigger the React onChange), so the button stayed `disabled=true`. We then WRONGLY
  inferred it was gated on the Hyperliquid clearinghouse balance ($0). The video disproves that gate.
- **What the video CONFIRMS:** the perp saves as a **backend record** ("Recorded successfully") — same
  mechanism as EARN, no wallet signature, no on-chain tx. That is exactly why zero funds work, and it
  matches our broader round-2 characterization (staging tx = backend DB write, not a chain trade).
- FLAG-1/FLAG-2 and the mainnet-endpoint observation are unaffected by this correction.

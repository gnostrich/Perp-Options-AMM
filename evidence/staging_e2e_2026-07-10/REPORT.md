# Staging E2E report — app-staging.temporal.exchange — 2026-07-10

**Provenance:** the section below the rule is the tester subagent's final report, QUOTED VERBATIM
(run completed 2026-07-10 ~10:25; dispatched by the manager with the operator's brief verbatim —
transcript: `history/operator/2026-07-10_staging-e2e-wallet-test.md`). The manager audit addendum
at the bottom is the manager's own work, labelled as such. Committed by the manager (sole git actor).

---

# Staging E2E — app-staging.temporal.exchange — tester findings (2026-07-10)

**Throwaway wallet ADDRESS:** `0xc5A9a6570e8B8B584EEdaa614F33259911E9Ad34` (fresh EIP-6963 injected provider on Arbitrum Sepolia 421614/0x66eee; private key stayed in `/tmp/throwaway_wallet.key` chmod 600 — verified no key in any evidence file, only the address).
**Mode:** CONNECT-ONLY. Wallet is unfunded (0 ETH; Arbitrum-Sepolia faucet is captcha-gated HTML, Hyperliquid faucet needs mainnet history) — bounded attempt made, then exercised every read-only view per the brief.

## Verdict table

| # | Flow | Verdict | Screenshot | Notes |
|---|------|---------|-----------|-------|
| 1 | Landing | **PASS** | 01_landing.png | title "Temporal"; TRANSACT/PORTFOLIO nav; CREATE PERP·TRADE BANDS·EARN tabs; DISCLAIMER; "Executed on Hyperliquid" |
| 2 | Connect wallet | **PASS** (+obs) | 02_connected.png | EIP-6963 auto-detected; `eth_accounts`=[addr], `eth_chainId`=0x66eee; header chip `0xc5A9...Ad34`. **No SIWE/signature challenged** (connect = eth_accounts only). |
| 3 | CREATE PERP long | **PASS** | 03_create_perp_long.png | LONG/BUY active; DEPOSIT(USDC), LEVERAGE(1·10·20·30·40x), NOTIONAL(BTC), AUTO-PROTECT, Entry $64,302.50, HL Tx Fees 0.045% / Temporal 0.0%, DEPOSIT FROM Wallet/HL Balance, CREATE POSITION |
| 4 | CREATE PERP short | **PASS** | 05_create_perp_short.png | SHORT/SELL toggles active (button bg `#4E0000`); Entry/Liq recompute in $ |
| 5 | Leverage / notional | **PASS** | 04_leverage_notional.png | 500 USDC → NOTIONAL 0.124431 BTC; slider 1x→16x live delta; auto-protect drew OLD LIQ FLOOR $61,881.53 / NEW $55,693.38; HL fee $0.225. Self-consistent (500×16/64292=0.1244✓) |
| 6 | TRADE BANDS | **FLAG (partial)** | 06_trade_bands.png, 06b_options_pricing_chart.png | UI renders (SELL/BUY PROFITS ON, QUANTITY, BTC Perp Long/Short, PRICE %/PRICE(-VE)% range toggle, Slippage %, Tx Fees %, TRANSACT, PERP MARK PRICING\|OPTIONS PRICING chart tabs) but **all values empty and OPTIONS PRICING chart BLANK** — see FLAG-1/2 |
| 7 | EARN | **FLAG (partial)** | 07_earn.png | LP-vault UI renders (MARGIN, LEVERAGE, NOTIONAL, LP APR, POOL STATS: TVL $500\|₿0.007961, Pool Leverage 5.0x, TRANSACT) but **all APR/fee fields `--%`** — same backend cause |
| 8 | Portfolio (funding col + close) | **PASS** | 08_portfolio_overview/perps/bands/earn.png | OVERVIEW PNL all $0.00, "No historical PNL data". **FUNDING column present in BOTH perps and bands tables** (feature #9), plus INTRINSIC/EXTRINSIC/POSITION VALUE + INITIAL/RESIDUAL INNER+OUTER BOUND + CLOSE. No open positions → 0 close buttons (expected) |

**Closing line:** Wallet login WORKED (injected EIP-6963 provider, chain 0x66eee, address chip shown). Trade flow reached **CONNECT + full read-only UI exercise across every tab, both long/short, and leverage** — **connect-only, not funded**, so no order/band/LP transaction was submitted.

## FLAGs (manager → operator)

- **FLAG-1 (HIGH):** the app calls `https://sepolia-rollup.arbitrum.io/rpc`, which is **NOT in the app's own CSP `connect-src`** (its allowlist has `arbitrum-sepolia.publicnode.com`, `arb1.arbitrum.io`, etc., but not `sepolia-rollup.arbitrum.io`). Every chain read is browser-blocked → `Failed to fetch perp quantities`. App-side config mismatch, not an environment artifact.
- **FLAG-2 (HIGH):** `Timeout: Did not receive complete AMM tree data after 10 seconds`. The app **never opens its `wss://staging-be.temporal.exchange` socket** (only `wss://api.hyperliquid.xyz/ws` opens), though staging-be is UP (HTTP 200 on `/health` from here) — so it's a client subscription not firing, downstream of FLAG-1. Effect: bands data, LP APRs, and the OPTIONS PRICING curve don't render.
- **FLAG-3 (LOW/MED):** disclaimer **DISAGREE redirects to marketing `temporal.exchange`**; AGREE stays but acceptance is **not persisted** (empty localStorage → re-prompts each load, gating interaction).

## Divergences from reference build

- **Could NOT cross-check the reference option numbers** (ITM $66.67 / 1/3 / ATM 0.148; m=3 → $85.71 / 1/7 / 0.057; ray-4 cash-in-1 → w′=11/21; funding ray-deviation). The **OPTIONS PRICING chart is blank and the bands/AMM data never loaded (FLAG-1/2)**, and unfunded → no band position to read values from. No option/band numeric value rendered on staging to compare. Honest limitation of a connect-only, backend-degraded session — **not a claim of math divergence.**
- **Consistent with reference:** FUNDING column in both perps+bands tables; INTRINSIC/EXTRINSIC/POSITION VALUE + INNER/OUTER BOUND vocabulary; no "lean" mislabel seen; perp mechanics self-consistent. DON'T-FALSE-FLAG list honored (funding TBD, charge-back, staging-lag not flagged).
- **Observations:** no SIWE signature required to connect; price feed uses HL **mainnet** ws; GA `collect` + Next RSC prefetch aborts are benign environment noise.

## Reproducibility (my harness, not staging)
Chromium through the agent proxy needed **TLS 1.2 max** (`--ssl-version-max=tls1.2` — the proxy MITM reset Chrome's TLS 1.3 handshake, confirmed via netlog ECONNRESET) plus **proxy-CA import into the NSS store** (`certutil -A -d sql:/root/.pki/nssdb` with the Anthropic egress CAs from `/root/.ccr/ca-bundle.crt`) so cert verification passes **without** disabling TLS. (An `--ignore-certificate-errors-spki-list` shortcut was auto-denied by the sandbox — correctly; I used the NSS trust path instead.) Radix tabs only switch on trusted `page.mouse.click` coordinates. I did NOT touch the local engine or DIFF_LEDGER — this is an external port, not a HEAD build.

---

## Manager audit addendum (manager's own work, 2026-07-10)

Independently verified before accepting the report:
1. **Key hygiene:** scanned every evidence file for the throwaway private key — **0 hits**; only the
   address appears. `/tmp/throwaway_wallet.key` perms 600.
2. **FLAG-1 re-derived:** pulled `https://app-staging.temporal.exchange/` CSP header myself:
   `connect-src` = self, ws(s)://staging-be.temporal.exchange, wss+https api.hyperliquid.xyz +
   api.hyperliquid-testnet.xyz, arb1.arbitrum.io, arbitrum-one.publicnode.com, rpc.ankr.com/arbitrum,
   arbitrum-sepolia.publicnode.com — `sepolia-rollup.arbitrum.io` indeed ABSENT while the app calls it. CONFIRMED.
3. **FLAG-2 re-derived:** all 128 `staging-be` strings in the console logs are inside CSP-violation
   error text (the directive listing) — **zero actual staging-be connection attempts**; the only
   ws.open events are `wss://api.hyperliquid.xyz/ws` (mainnet), churning open/close ~every 5s.
   `staging-be.temporal.exchange/health` = HTTP 200 from this host. CONFIRMED.
4. **Numeric spot-check:** 500 USDC × 16x / 64292 = 0.124432 vs displayed 0.124431 BTC (implied px
   64292.66 vs shown entry 64302.50 = live-feed drift). Self-consistent. CONFIRMED.
5. **FUNDING column:** DOM dump (`e2e_summary.json`) shows PERPS headers incl. FUNDING
   ("funding col present: true") and FUNDING/INNER BOUND/OUTER BOUND ×2 (perps + bands). CONFIRMED.
6. **Vocabulary:** zero whole-word "lean" hits across text/JSON evidence. CONFIRMED.

Caveat kept honest: FLAG-2's causal tail ("downstream of FLAG-1") is the tester's inference — plausible
(the AMM-tree subscription may await a chain read that CSP kills) but not proven from outside; recorded
as hypothesis, not fact. Feature-level comparison vs the CTO-handed versions:
`notes/FEATURE_DIFF_staging_vs_handover_2026-07-10.md` (staging column = this run's evidence).

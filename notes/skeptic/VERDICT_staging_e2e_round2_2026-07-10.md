# Skeptic verdict — Universal Skeptic Gate (narrow) — staging E2E ROUND 2 (tx attempts) 2026-07-10

Artifact: `evidence/staging_e2e_2026-07-10/REPORT_round2.md` (tester verbatim block + manager audit addendum).
Operator words read verbatim first (`history/operator/2026-07-10_staging-e2e-wallet-test.md`, entry 6:
CTO — "you don't need funds to do a tx. In staging"). Round-1 verdict (`VERDICT_staging_e2e_gate_2026-07-10.md`)
carried forward. All checks read-only, re-derived from the `run2*` evidence siblings.

## Attack documented (independent re-derivation)
- **Zero-tx claim:** grepped ALL `run2*` files for `eth_sendTransaction|personal_sign|signTypedData|eth_sign|eth_sendRawTransaction`
  — every hit is in harness scripts (`*.mjs`), `lib_wallet_provider.mjs` handler cases, or the report/addendum
  text. `run2_wallet.log` (the only runtime RPC log) contains ONLY `eth_accounts` / `eth_chainId` /
  `wallet_switchEthereumChain`. The app never requested a signature or a tx. CONFIRMED.
- **EARN POST:** `run2b_network.log:472` carries the POST body byte-for-byte as reported (`is_transcat:true`,
  `wallet_type:"temporal"`, `initial_deposit_dollar:100`, `initial_deposit_btc:0.001551`, `leverage:1`); success
  toast "Earn position created successfully!" in `run2b_summary.json:81`. CONFIRMED.
- **Perp gate real:** `run2b_network.log` HL clearinghouse reads = `accountValue:"0.0"` (×4), `withdrawable:"0.0"`
  (×2), `assetPositions:[]` (×2, zero non-empty). CONFIRMED.
- **Chain IDs decoded myself:** `0xa4b1 = 42161` = Arbitrum One (mainnet); `0x66eee = 421614` = Arbitrum Sepolia.
  The switch to 0xa4b1 is APP-DRIVEN — `run2b_txflows.mjs:117-124` clicks the app's own "Connect to Arbitrum" +
  "Switch Network" buttons; the harness chameleon only ACCEPTS the request, does not inject the chainId. The
  network POSTs to `arb1.arbitrum.io/rpc` (eth_blockNumber, RESP 200) and `api.hyperliquid.xyz/info` are the app's
  own fetch client. `hyperliquid-testnet` appears in ZERO `*network.log` files (only in CSP/console text). CONFIRMED.
- **FLAG-2:** `run2b_console.log` carries "Did not receive complete AMM tree data after 10 seconds" (×2) +
  "incomplete market_data (missing AMM trees)" (×3); only ws that opens is `wss://api.hyperliquid.xyz/ws`. CONFIRMED.
- **"lean" / funding / charge-back:** zero affirmative usage anywhere in `REPORT_round2.md`. CONFIRMED.

## Verdicts

**(a) EARN "PASS (tx submitted)" honesty — CLEAR.** The headline scare-quotes the word — "The single working
'transaction' is a **backend DB write (Next.js server action), not a chain tx**" — and the not-a-chain-tx qualifier
is repeated at every occurrence: the row-4 cell itself ("No wallet prompt, no signature, no funds"), the "How far"
line ("no on-chain tx or signature occurred anywhere"), and manager addendum #3 ("EARN = backend DB write, not
chain tx"). The verdict token "(tx submitted)" never stands alone unqualified. No reader is misled into believing
a chain tx occurred. Two residuals (disclosed, not flags): (i) "PASS" is scoped to *submission* while observation-3
openly concedes the position "is not observable in Portfolio" — the round-trip did not complete, and that gap is
disclosed in the same report; (ii) the word "accepted" ("backend accepted, success toast") rests on the app-rendered
success toast — the POST's own HTTP response status was NOT captured in `run2b_network.log` (only arb1/HL RESP lines
were logged). The toast is strong app-side evidence of acceptance and the addendum claims only "POST body verbatim +
toast," so this is a reasonable inference, not oversell — but if the operator relay uses the word "accepted" it
should read "submitted; success toast rendered (server 200 not separately captured)."

**(b) "Mainnet, not testnet" claim — CLEAR, correctly scoped, no hedge needed.** The evidence is definitional, not
suggestive: chain ID 42161/`0xa4b1` IS Arbitrum One mainnet (a registry fact, not an inference — Sepolia is 421614/
`0x66eee`, which the app used elsewhere); `arb1.arbitrum.io` is the Arbitrum One mainnet RPC (Sepolia would be
`arbitrum-sepolia.*` / `sepolia-rollup.*`); `api.hyperliquid.xyz` is HL mainnet (testnet is `api.hyperliquid-testnet.xyz`,
which is absent from every network log). The switch is app-driven (app modal "SWITCH TO ARBITRUM ONE" + app buttons),
and the reads are the app's own fetches. The report's wording is already correctly scoped to configuration/reads —
"wired to Arbitrum ONE + Hyperliquid MAINNET **reads**", "SWITCH TO ARBITRUM ONE modal", "queries ... 200 OK" — and
does NOT claim any mainnet transaction executed (nothing was signed/sent). This is exactly as strong as the evidence.
One relay guardrail (not a flag, a scope-lock): the operator→CTO relay must preserve this as "the staging front-end is
CONFIGURED for / READS from mainnet endpoints" and must NOT inflate to "staging executes mainnet transactions" — no
tx occurred, and the security concern is the mainnet *wiring*, not an observed mainnet spend.

**(c) DON'T-FALSE-FLAG compliance — CLEAR; the mainnet finding is correctly surfaced, not suppressed.** FLAG-1
(CSP-refused Sepolia RPC) and FLAG-2 (dead `staging-be` ws) are app-config/dead-subscription defects under the
brief's step-5 "note anything broken" — neither targets funding-TBD, charge-back-TBD, staging-lag, nor uses "lean"
(zero affirmative hits). The BLOCKED perp/band verdicts flag *disabled buttons / dead data layer*, not any intentional
TBD; funding-rate/cap is never asserted as broken. The mainnet observation is NOT on the entry-1 TBD list — it is a
genuine new finding and is correctly routed to the operator as an open CTO question ("is staging meant to be on
mainnet-Arbitrum + HL-mainnet?"), neither false-flagged nor suppressed.

**(d) Label/provenance hygiene (§2.4) — CLEAR.** Tester verbatim block is delimited by horizontal rules with a
§2.4a byte-identical attestation ("no edits, no omissions"); the manager addendum is explicitly labelled "manager's
own work" and quotes the tester nowhere as its own voice. No paraphrase-as-quote. The round-1 standing demand (a
run pointer) is partially satisfied — the header carries "run completed 2026-07-10 ~11:19 UTC, ~20 min, 32 tool uses",
and the evidence file mtimes (11:04–11:19) corroborate; a discrete run-id is still absent but reconstruction from the
timestamped harness corpus is straightforward, so no FLAG-PROCESS.

**(e) Completeness of how-far — CLEAR.** The report states the reach honestly and without inflation: "an EARN LP
'position' was submitted ... **No perp or band position was opened; nothing was closed; no on-chain tx or signature
occurred anywhere.**" Step 6: reference numbers "**Still none rendered** ... Honest limitation, not a divergence
claim." Observation 3 discloses the EARN write is not observable in Portfolio. Nothing quietly implies more was
achieved than the single backend write.

**Net: all five items CLEAR.** No FLAG. The load-bearing claims (zero chain tx, EARN=backend write, perp gate real,
mainnet wiring) each survived independent re-derivation against the `run2*` logs. Two scope-locks for the operator
relay, neither halting: (a) if the EARN result is called "accepted", note the server response was not separately
captured (toast-only); (b) the mainnet finding must ship as "configured-for/reads-from mainnet", never "executes
mainnet txs". The report already honors both in its own wording — the guardrails bind the relay, not the artifact.

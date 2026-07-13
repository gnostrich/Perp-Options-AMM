# AMMV2 Staging Test Playbook (for Claude)

Use this file as the **only** instructions when testing AMMV2 on staging. Follow the flows in order. Do **not** invent endpoints or JSON shapes.

## Environments

| Role | URL |
|------|-----|
| Backend API | `https://staging-be.temporal.exchange` |
| Frontend UI | `https://app-staging.temporal.exchange` |

All `curl` examples below use:

```bash
export BE="https://staging-be.temporal.exchange"
export WALLET="<colleague-wallet-address>"   # REQUIRED — ask the human for this
```

**Identity rule:** You only get a **wallet address** string. There is no private key, no signing in this playbook. Pass `WALLET` / `userWallet` / `WalletAddress` on every request that needs a user.

## Scope (what to test)

| # | Flow | Required? | Notes |
|---|------|-----------|-------|
| 0 | Health / AMM status | Yes | Smoke check before anything else |
| 1 | Create perp | Yes | `autoProtect` must be **false** (known broken) |
| 2 | Create trade band(s) after perp | Yes | Via `POST /api/transact` |
| 3 | Query perps + trade bands | Yes | By wallet + by id |
| 4 | Close trade band(s), then close perp | Yes | See close section carefully |
| 5 | LP / Earn | Optional | Skip unless asked |

### Explicitly out of scope / known broken

- **Auto-protect** (`"autoProtect": true`) — **do not test**. It fails. Always send `"autoProtect": false` or omit it.
- Do **not** close or mutate other wallets' positions. Only operate on `$WALLET`.
- Do **not** use snake_case on `/api/transact` (it panics). See JSON rules below.

---

## Critical API gotchas (read before calling)

### 1. `/api/transact` JSON is PascalCase (and has typos)

`TransactionRequest` has **no** `json` tags. Encoding/json expects **exact Go field names**:

| Field | Required | Notes |
|-------|----------|-------|
| `Type` | yes | `"buy"` or `"sell"` |
| `PerpType` | yes | `"long"` or `"short"` (lowercase) |
| `Amount` | yes | BTC quantity to carve into the band |
| `StikeLowerBoundSell` | sell: yes | typo is real — missing `r` |
| `StikeUpperBoundSell` | optional | `0` = barrier-only / no outer |
| `StrikeLowerBoundBuy` | sell: yes | spelled correctly |
| `StikeUpperBoundBuy` | optional | typo is real — missing `r` |
| `WalletAddress` | yes | only user identity you have |
| `IsTransactionDone` | yes | `false` = dry-run stub; `true` = open band |

**Wrong (panics / empty fields):**

```json
{ "type": "sell", "wallet_address": "...", "is_transaction_done": true }
```

**Right:**

```json
{ "Type": "sell", "WalletAddress": "...", "IsTransactionDone": true }
```

### 2. Preview with `IsTransactionDone: false` is a stub

On the v28 path, `false` returns `{ "success": true, "message": "pro-forma query only", "total_amount": 0, ... }` and does **not** open a band. Use it only to confirm the request parses. Real opens need `IsTransactionDone: true`.

### 3. Strike bounds are USD prices, not indices

Always fetch allowed ranges first:

```bash
curl -sS "$BE/api/amm/strike-bounds?perpType=long"
curl -sS "$BE/api/amm/strike-bounds?perpType=short"
```

Use `sold_defaults` / `bought_defaults` (`inner_usd`, `outer_usd`) unless you have a reason not to. Outer `0` is valid (barrier-only).

### 4. Create trade band only after a perp exists for that side

`Amount` must be `<=` available BTC for that wallet + `PerpType`. Available quantity comes from open, non-liquidated perps:

```bash
curl -sS "$BE/settlements/users/$WALLET/transactions?limit=1" | jq '.perp_quantity'
```

### 5. Closing a trade band = `/complete`, not `/close`

Docs mention `POST /settlements/transactions/{id}/close`, but that route is **not wired**. Use:

```bash
POST /settlements/transactions/{transaction_id}/complete
```

That completes settlement and closes the AMM band (`CloseBand`).

Closing a perp (`POST /settlements/perps/{id}/close`) also completes linked bands via allocations.

### 6. Perp create may warn on Hyperliquid but still return 201

`POST /settlements/perps` writes the DB row first, then calls `depositAndOpenPosition`. If HL fails, the handler logs a warning and **still returns the perp**. That is enough for AMM band testing (quantity comes from DB). Note HL settlement on close may also warn — still verify DB `isClosed` / band completion.

---

## Step 0 — Smoke checks

```bash
curl -sS "$BE/"
curl -sS "$BE/settlements/health"
curl -sS "$BE/api/amm/status"
curl -sS "$BE/api/oracle/price"
curl -sS "$BE/api/amm/strike-bounds?perpType=long"
```

**Pass if:**

- `/` returns welcome text
- settlements health `status` is `healthy` / DB connected
- AMM status has `x`, `y`, `oracle` / `perp_mark`, `open_bands`
- strike-bounds returns `sold` / `bought` USD ranges

**Note:** `/api/oracle/price` and `/api/amm/status` oracle values can differ on staging. For band opens, prefer strike-bounds + AMM status.

Optional FE check: open `https://app-staging.temporal.exchange/` and confirm the app loads (Connect Wallet is for humans; Claude tests via API).

---

## Step 1 — Create perp (required)

**Endpoint:** `POST /settlements/perps`  
**JSON:** camelCase (struct tags on `Perp`)

```bash
# Fetch a reasonable mark for the payload (use AMM or oracle — either is fine for DB create)
MARK=$(curl -sS "$BE/api/amm/status" | jq -r '.perp_mark // .oracle')

curl -sS -X POST "$BE/settlements/perps" \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"BTC\",
    \"perpType\": \"Long\",
    \"market\": \"BTC-PERP\",
    \"usdcAmount\": 100,
    \"initialUsdMargin\": 100,
    \"leverage\": 10,
    \"initialLeverage\": 10,
    \"markPrice\": $MARK,
    \"entryPrice\": $MARK,
    \"btcAmount\": 0.01,
    \"userWallet\": \"$WALLET\",
    \"wallet_type\": \"temporal\",
    \"autoProtect\": false
  }" | tee /tmp/perp_create.json | jq .
```

Save IDs:

```bash
export PERP_ID=$(jq -r '.id' /tmp/perp_create.json)
echo "PERP_ID=$PERP_ID"
```

**Pass if:**

- HTTP 201 / body has `id` like `PERP_...`
- `userWallet` matches `$WALLET`
- `isClosed` is false / absent
- Query below shows the perp

**Also create a Short** if you want both sides (optional but useful):

```bash
# same payload with "perpType": "Short" and a smaller btcAmount if desired
```

**Do not** send `"autoProtect": true`.

**Merge behavior:** creating another open perp for the same wallet + token + type **adds size** to the existing open row instead of always creating a new ID. Prefer one Long and one Short for a clean test, or note the merged `btcAmount`.

---

## Step 2 — Create trade band after perp (required)

Trade bands are opened through the AMM:

**Endpoint:** `POST /api/transact`  
**Requires:** open perp on that side with available quantity ≥ `Amount`.

### 2a. Confirm available quantity

```bash
curl -sS "$BE/settlements/users/$WALLET/transactions?limit=5" | jq '.perp_quantity'
curl -sS "$BE/settlements/users/$WALLET/perps" | jq '.perps[] | {id, perpType, btcAmount, usedQuantity, isClosed}'
```

### 2b. Load strike defaults

```bash
BOUNDS=$(curl -sS "$BE/api/amm/strike-bounds?perpType=long")
echo "$BOUNDS" | jq '{sold_defaults, bought_defaults, oracle}'

SOLD_INNER=$(echo "$BOUNDS" | jq -r '.sold_defaults.inner_usd')
SOLD_OUTER=$(echo "$BOUNDS" | jq -r '.sold_defaults.outer_usd')
BOUGHT_INNER=$(echo "$BOUNDS" | jq -r '.bought_defaults.inner_usd')
BOUGHT_OUTER=$(echo "$BOUNDS" | jq -r '.bought_defaults.outer_usd')
```

### 2c. Optional parse check (stub)

```bash
curl -sS -X POST "$BE/api/transact" \
  -H "Content-Type: application/json" \
  -d "{
    \"Type\": \"sell\",
    \"PerpType\": \"long\",
    \"Amount\": 0.001,
    \"StikeLowerBoundSell\": $SOLD_INNER,
    \"StikeUpperBoundSell\": $SOLD_OUTER,
    \"StrikeLowerBoundBuy\": $BOUGHT_INNER,
    \"StikeUpperBoundBuy\": $BOUGHT_OUTER,
    \"WalletAddress\": \"$WALLET\",
    \"IsTransactionDone\": false
  }" | jq .
```

Expect `"message": "pro-forma query only"`.

### 2d. Open the band (real)

Use an `Amount` **less than** available long quantity (e.g. `0.001` if available ≥ that).

```bash
curl -sS -X POST "$BE/api/transact" \
  -H "Content-Type: application/json" \
  -d "{
    \"Type\": \"sell\",
    \"PerpType\": \"long\",
    \"Amount\": 0.001,
    \"StikeLowerBoundSell\": $SOLD_INNER,
    \"StikeUpperBoundSell\": $SOLD_OUTER,
    \"StrikeLowerBoundBuy\": $BOUGHT_INNER,
    \"StikeUpperBoundBuy\": $BOUGHT_OUTER,
    \"WalletAddress\": \"$WALLET\",
    \"IsTransactionDone\": true
  }" | tee /tmp/band_open.json | jq .

export TX_ID=$(jq -r '.transaction_id' /tmp/band_open.json)
echo "TX_ID=$TX_ID"
```

**Pass if:**

- `"success": true`
- `"message": "Transaction done"` (or equivalent success)
- non-empty `transaction_id`
- `GET /api/amm/status` → `open_bands` increased by 1
- user transactions list includes `$TX_ID` with `status` typically `pending`, `is_closed` false, and preferably a `band_id`

```bash
curl -sS "$BE/api/amm/status" | jq '{open_bands, oracle, x, y}'
curl -sS "$BE/settlements/transactions/by-id/$TX_ID" | jq '{id, status, is_closed, band_id, wallet_address, quantity, type, perp_type}'
```

For a **short** band, use `perpType=short` strike-bounds defaults and `"PerpType": "short"` (requires a Short perp with available qty).

---

## Step 3 — Query perps and trade bands (required)

### Perps

```bash
# By wallet (preferred)
curl -sS "$BE/settlements/users/$WALLET/perps" | jq .

# By id
curl -sS "$BE/settlements/perps/$PERP_ID" | jq .

# Aggregated
curl -sS "$BE/settlements/users/$WALLET/perps/aggregated" | jq .

# Liquidation floor
curl -sS "$BE/settlements/users/$WALLET/liquidation-floor?token=BTC&market=BTC-PERP" | jq .

# Equity (perp_type query required)
curl -sS "$BE/settlements/users/$WALLET/equity?perp_type=Long" | jq .
```

### Trade bands (transactions)

```bash
# By wallet
curl -sS "$BE/settlements/users/$WALLET/transactions?limit=50" | jq .

# By id without auto-complete side effects
curl -sS "$BE/settlements/transactions/by-id/$TX_ID" | jq .

# Optional MTM refresh
curl -sS -X POST "$BE/settlements/transactions/$TX_ID/update" | jq .
curl -sS "$BE/settlements/transactions/by-id/$TX_ID" | jq '{id, net_band_payout, perp_pandl, status, is_closed}'
```

**Pass if:** wallet list shows the perp(s) you created and the trade band(s) with matching `wallet_address`.

---

## Step 4 — Close trade bands and perps (required)

Recommended order for a clean AMMV2 check:

1. Close / complete each open trade band  
2. Close the perp  
3. Re-query and confirm AMM `open_bands` dropped

### 4a. Close trade band (AMM + settlements)

```bash
# Optional slippage preview
curl -sS "$BE/settlements/transactions/$TX_ID/slippage-preview" | jq .

# Complete = close band on engine + mark transaction completed
curl -sS -X POST "$BE/settlements/transactions/$TX_ID/complete" | tee /tmp/band_close.json | jq .

curl -sS "$BE/settlements/transactions/by-id/$TX_ID" | jq '{id, status, is_closed, completed_at, band_id}'
curl -sS "$BE/api/amm/status" | jq '.open_bands'
```

**Pass if:** transaction `status` is `completed` (and/or closed flags as implemented), and `open_bands` decreased.

### 4b. Close perp

```bash
curl -sS -X POST "$BE/settlements/perps/$PERP_ID/close" | jq .

curl -sS "$BE/settlements/perps/$PERP_ID" | jq '{id, isClosed, closedAt, traderEquity, btcAmount}'
```

**Pass if:** `isClosed` is true and `closedAt` is set.

If the perp still had open bands, close should complete them via `transaction_perp_allocations`. Prefer completing bands yourself first so failures are easier to attribute.

**Alternate:** close perp first (it tries to complete linked bands). Still verify each `TX_ID` completed and AMM `open_bands`.

---

## Step 5 — LP / Earn (optional)

Skip unless the human asks. Earn uses **snake_case** JSON.

```bash
curl -sS "$BE/earn/health"
curl -sS "$BE/earn/stats"

# Create LP (executes; is_transcat must be true)
curl -sS -X POST "$BE/earn/positions" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_wallet\": \"$WALLET\",
    \"initial_deposit_btc\": 0.001,
    \"initial_deposit_dollar\": 80,
    \"leverage\": 2.0,
    \"is_transcat\": true,
    \"wallet_type\": \"temporal\"
  }" | jq .

curl -sS "$BE/earn/positions/$WALLET" | jq .

# Close — path uses earn id in some docs; prefer the id returned from create.
# If create returned position.id, use that:
# curl -sS -X POST "$BE/earn/positions/<earn_id>/close" | jq .
```

---

## Suggested end-to-end script (copy/paste)

Ask the human for `WALLET` first. Then:

```bash
set -euo pipefail
BE="https://staging-be.temporal.exchange"
WALLET="${WALLET:?set WALLET}"

curl -sS "$BE/settlements/health" | jq .
curl -sS "$BE/api/amm/status" | jq '{open_bands, oracle, x, y}'

MARK=$(curl -sS "$BE/api/amm/status" | jq -r '.perp_mark // .oracle')

PERP=$(curl -sS -X POST "$BE/settlements/perps" \
  -H "Content-Type: application/json" \
  -d "{
    \"token\":\"BTC\",\"perpType\":\"Long\",\"market\":\"BTC-PERP\",
    \"usdcAmount\":100,\"initialUsdMargin\":100,\"leverage\":10,\"initialLeverage\":10,
    \"markPrice\":$MARK,\"entryPrice\":$MARK,\"btcAmount\":0.01,
    \"userWallet\":\"$WALLET\",\"wallet_type\":\"temporal\",\"autoProtect\":false
  }")
echo "$PERP" | jq '{id, userWallet, btcAmount, perpType}'
PERP_ID=$(echo "$PERP" | jq -r '.id')

AVAIL=$(curl -sS "$BE/settlements/users/$WALLET/transactions?limit=1" | jq -r '.perp_quantity.long_positions.available_quantity')
echo "available long qty=$AVAIL"

BOUNDS=$(curl -sS "$BE/api/amm/strike-bounds?perpType=long")
SOLD_INNER=$(echo "$BOUNDS" | jq -r '.sold_defaults.inner_usd')
SOLD_OUTER=$(echo "$BOUNDS" | jq -r '.sold_defaults.outer_usd')
BOUGHT_INNER=$(echo "$BOUNDS" | jq -r '.bought_defaults.inner_usd')
BOUGHT_OUTER=$(echo "$BOUNDS" | jq -r '.bought_defaults.outer_usd')

BAND=$(curl -sS -X POST "$BE/api/transact" \
  -H "Content-Type: application/json" \
  -d "{
    \"Type\":\"sell\",\"PerpType\":\"long\",\"Amount\":0.001,
    \"StikeLowerBoundSell\":$SOLD_INNER,\"StikeUpperBoundSell\":$SOLD_OUTER,
    \"StrikeLowerBoundBuy\":$BOUGHT_INNER,\"StikeUpperBoundBuy\":$BOUGHT_OUTER,
    \"WalletAddress\":\"$WALLET\",\"IsTransactionDone\":true
  }")
echo "$BAND" | jq .
TX_ID=$(echo "$BAND" | jq -r '.transaction_id')

curl -sS "$BE/settlements/transactions/by-id/$TX_ID" | jq '{id,status,band_id,is_closed}'
curl -sS "$BE/api/amm/status" | jq '.open_bands'

curl -sS -X POST "$BE/settlements/transactions/$TX_ID/complete" | jq '{id,status,completed_at}'
curl -sS -X POST "$BE/settlements/perps/$PERP_ID/close" | jq .
curl -sS "$BE/settlements/perps/$PERP_ID" | jq '{id,isClosed,closedAt}'
curl -sS "$BE/api/amm/status" | jq '{open_bands,x,y}'
```

---

## FE cross-check (optional, human-assisted)

1. Human opens https://app-staging.temporal.exchange/ and connects `$WALLET`.
2. Claude creates/queries via API using the same wallet.
3. Human confirms Portfolio / Transact UI shows the perp and trade band.
4. Prefer API for close so results are deterministic in logs.

---

## Failure triage

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Panic / Internal server error on `/api/transact` | snake_case JSON | Switch to PascalCase field names above |
| `insufficient perp quantity` | no open perp / wrong side / amount too large | Create perp first; lower `Amount`; check `.perp_quantity` |
| `open band failed: ...` | strikes outside allowed USD range | Re-fetch `/api/amm/strike-bounds` and use defaults |
| `autoProtect` / auto band creation errors | known broken | Set `autoProtect: false` and open bands manually via `/api/transact` |
| Perp create 201 but HL warning | expected on staging sometimes | Continue; verify DB row; HL close may also warn |
| `/transactions/.../close` 404 | route not registered | Use `/complete` instead |
| Equity endpoint 400 | missing `perp_type` | Add `?perp_type=Long` or `Short` |
| Wrong wallet mutated | used someone else's address | Stop; only use `$WALLET` from the human |

---

## Report format (when done)

Return a short report to the human:

1. `WALLET` used  
2. `PERP_ID`(s) created  
3. `TX_ID`(s) / `band_id`(s) opened  
4. Pass/fail per step (0–4, and 5 if run)  
5. Final `GET /api/amm/status` (`open_bands`, oracle)  
6. Any HL warnings (create/close) — note them, do not treat DB-only success as full HL settlement proof  

Do **not** commit code or change the backend unless the human asks. This playbook is test-only.

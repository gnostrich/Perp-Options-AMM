# API Reference

This document describes every network call made by the frontend — the Temporal backend REST API, the Hyperliquid REST API, three WebSocket connections, and two external integrations — with full mock request/response examples for each.

---

## Overview

| Backend | Base URL | Env Var |
|---|---|---|
| Temporal Backend | `process.env.API_BASE_URL` (server-side only) | `API_BASE_URL` |
| Hyperliquid REST | `https://api.hyperliquid.xyz/info` | — |
| Hyperliquid SDK | (SDK manages URL internally) | `PRIVATE_KEY_LONG`, `PRIVATE_KEY_SHORT` |

> `API_BASE_URL` is never exposed to the browser. Client components call Next.js Server Actions which call the backend internally.

---

## 1. Temporal Backend REST API

**Source:** `src/lib/data/api/client.ts` — all requests use `apiGet` / `apiPost`.

---

### 1.1 Health Check

**`GET /health`**  
Checks whether the backend is running.

**Request**
```http
GET /health HTTP/1.1
```

**Response**
```json
{
  "status": "healthy"
}
```

**Source:** [`health.ts`](src/lib/data/api/health.ts)

---

### 1.2 Oracle Price

---

#### `GET /api/oracle/price`
Fetch the current BTC oracle/mark price.

**Request**
```http
GET /api/oracle/price HTTP/1.1
```

**Response**
```json
{
  "message": "Oracle price fetched successfully",
  "oracle_price": 85432.50
}
```

---

#### `POST /api/oracle/price`
Update the oracle price on the backend.

**Request**
```http
POST /api/oracle/price HTTP/1.1
Content-Type: application/json

{
  "price": 85432.50
}
```

**Response**
```json
{
  "message": "Oracle price updated successfully",
  "oracle_price": 85432.50
}
```

**Source:** [`prices.ts`](src/lib/data/api/prices.ts)

---

### 1.3 AMM Graph

#### `GET /api/amm/graph`
Fetch raw AMM long/short tree data for the graph chart.

**Request**
```http
GET /api/amm/graph HTTP/1.1
```

**Response**
```json
{
  "long_tree": {
    "nodes": [
      { "strike": 0, "pt_asset": 1.0 },
      { "strike": 1000, "pt_asset": 0.85 },
      { "strike": 2000, "pt_asset": 0.72 },
      { "strike": 5000, "pt_asset": 0.45 }
    ]
  },
  "short_tree": {
    "nodes": [
      { "strike": 0, "pt_asset": 1.0 },
      { "strike": 1000, "pt_asset": 0.80 },
      { "strike": 2000, "pt_asset": 0.65 },
      { "strike": 5000, "pt_asset": 0.38 }
    ]
  }
}
```

> `strike` values are offsets from the oracle price. `pt_asset` is the AMM equity at that price level.

**Source:** [`prices.ts`](src/lib/data/api/prices.ts)

---

### 1.4 Settlements — Transactions

---

#### `GET /settlements/users/{walletAddress}/transactions`
Fetch all band transactions for a wallet.

**Request**
```http
GET /settlements/users/0xAbCd1234.../transactions HTTP/1.1
```

**Response**
```json
{
  "transactions": [
    {
      "id": "txn-001",
      "type": "buy",
      "perp_type": "long",
      "quantity": 0.001,
      "status": "completed",
      "wallet_address": "0xAbCd1234...",
      "created_at": "2025-03-19T08:00:00Z",
      "perp_market_price": 85432.50,
      "trader_equity": 1050.00,
      "amm_quantity": 0.001,
      "initial_perp_margin": 1000.00,
      "bought_initial_inner_bound": 0.02,
      "bought_initial_outer_bound": 0.05,
      "bought_residual_inner_bound": 0.01,
      "bought_residual_outer_bound": 0.03,
      "sold_initial_inner_bound": 0.02,
      "sold_initial_outer_bound": 0.05,
      "sold_residual_inner_bound": 0.01,
      "sold_residual_outer_bound": 0.03,
      "bought_initial_inner_price": 83724.05,
      "bought_initial_outer_price": 80660.87,
      "bought_residual_inner_price": 84578.17,
      "bought_residual_outer_price": 82670.52,
      "sold_initial_inner_price": 87140.95,
      "sold_initial_outer_price": 90204.12,
      "sold_residual_inner_price": 86286.82,
      "sold_residual_outer_price": 88194.47,
      "bought_profit": 42.50,
      "sold_profit": 7.80,
      "bought_initial_value_in_dollars": 855.32,
      "sold_initial_value_in_dollars": 855.32,
      "is_closed": false,
      "net_band_payout": 50.30
    }
  ],
  "perp_quantity": {
    "total_btc_amount": 0.01,
    "used_quantity": 0.005,
    "available_quantity": 0.005,
    "perp_count": 2,
    "long_positions": {
      "count": 1,
      "total_btc_amount": 0.005,
      "used_quantity": 0.002,
      "available_quantity": 0.003
    },
    "short_positions": {
      "count": 1,
      "total_btc_amount": 0.005,
      "used_quantity": 0.003,
      "available_quantity": 0.002
    }
  },
  "total_count": 1
}
```

**Source:** [`portfolio.ts`](src/lib/data/api/portfolio.ts)

---

#### `POST /api/transact`
Submit a sell/transact request (band sell action).

**Request**
```http
POST /api/transact HTTP/1.1
Content-Type: application/json

{
  "type": "sell",
  "PerpType": "long",
  "amount": 0.001,
  "StikeLowerBoundSell": 80000,
  "StikeUpperBoundSell": 82000,
  "StrikeLowerBoundBuy": 83000,
  "StikeUpperBoundBuy": 85000,
  "IsTransactionDone": false,
  "WalletAddress": "0xAbCd1234..."
}
```

**Response**
```json
{
  "success": true,
  "amount": 0.001,
  "total_amount": 0.001,
  "slippage": 0.002,
  "fees": 0.50
}
```

**Source:** [`transactions.ts`](src/lib/data/api/transactions.ts)

---

#### `POST /settlements/transactions/{transactionId}/complete`
Mark a transaction as complete after on-chain confirmation.

**Request**
```http
POST /settlements/transactions/txn-001/complete HTTP/1.1
Content-Type: application/json

{}
```

**Response**
```json
{
  "success": true,
  "message": "Transaction txn-001 marked as complete"
}
```

**Source:** [`transactions.ts`](src/lib/data/api/transactions.ts)

---

### 1.5 Settlements — Perp Positions

---

#### `GET /settlements/users/{walletAddress}/perps`
Fetch individual perp position records for a wallet.

**Request**
```http
GET /settlements/users/0xAbCd1234.../perps HTTP/1.1
```

**Response**
```json
[
  {
    "id": "perp-001",
    "token": "BTC",
    "perpType": "LONG",
    "market": "BTC-PERP",
    "initialUsdMargin": 1000.00,
    "usdcAmount": 1000.00,
    "leverage": 10,
    "initialLeverage": 10,
    "markPrice": 85432.50,
    "entryPrice": 84500.00,
    "btcAmount": 0.001,
    "pnl": 93.25,
    "positionValue": 1093.25,
    "usedQuantity": 0.001,
    "fundingRate": 0.0001,
    "fundingAccrued": -2.10,
    "lastFundingAt": "2025-03-19T06:00:00Z",
    "liquidationMargin": 120.00,
    "isLiquidated": false,
    "liquidatedAt": null,
    "isClosed": false,
    "userWallet": "0xAbCd1234...",
    "created_at": "2025-03-18T10:00:00Z",
    "updated_at": "2025-03-19T08:00:00Z"
  }
]
```

---

#### `GET /settlements/users/{walletAddress}/perps/aggregated`
Fetch aggregated perp data (all positions combined) plus quantity breakdowns.

**Request**
```http
GET /settlements/users/0xAbCd1234.../perps/aggregated HTTP/1.1
```

**Response**
```json
{
  "perps": [
    {
      "userWallet": "0xAbCd1234...",
      "token": "BTC",
      "perpType": "LONG",
      "market": "BTC-PERP",
      "totalSize": 0.001,
      "entryPrice": 84500.00,
      "currentPrice": 85432.50,
      "initialMargin": 1000.00,
      "funding": -2.10,
      "pnl": 93.25,
      "unrealizedPnl": 93.25,
      "totalNotional": 84.50,
      "leverage": 10,
      "positionCount": 1,
      "createdAt": "2025-03-18T10:00:00Z",
      "updatedAt": "2025-03-19T08:00:00Z"
    }
  ],
  "perp_quantity": {
    "total_btc_amount": 0.01,
    "used_quantity": 0.005,
    "available_quantity": 0.005,
    "perp_count": 2,
    "long_positions": {
      "count": 1,
      "total_btc_amount": 0.005,
      "used_quantity": 0.002,
      "available_quantity": 0.003
    },
    "short_positions": {
      "count": 1,
      "total_btc_amount": 0.005,
      "used_quantity": 0.003,
      "available_quantity": 0.002
    }
  }
}
```

---

#### `POST /settlements/perps`
Create a new perp position record after a Hyperliquid order is placed.

**Request**
```http
POST /settlements/perps HTTP/1.1
Content-Type: application/json

{
  "signature": "0xSig...",
  "token": "BTC",
  "perpType": "LONG",
  "market": "BTC-PERP",
  "usdcAmount": 1000.00,
  "leverage": 10,
  "markPrice": 85432.50,
  "btcAmount": 0.001170,
  "userWallet": "0xAbCd1234...",
  "autoProtect": false
}
```

**Response**
```json
{
  "id": "perp-001",
  "signature": "0xSig...",
  "token": "BTC",
  "perpType": "LONG",
  "market": "BTC-PERP",
  "usdcAmount": 1000.00,
  "leverage": 10,
  "markPrice": 85432.50,
  "btcAmount": 0.001170,
  "userWallet": "0xAbCd1234...",
  "autoProtect": false,
  "created_at": "2025-03-19T08:21:00Z"
}
```

---

#### `POST /settlements/perps/{perpId}/close`
Close an open perp position.

**Request**
```http
POST /settlements/perps/perp-001/close HTTP/1.1
Content-Type: application/json

{}
```

**Response**
```json
{
  "success": true,
  "message": "Perp position perp-001 closed successfully"
}
```

**Source:** [`transactions.ts`](src/lib/data/api/transactions.ts), [`portfolio.ts`](src/lib/data/api/portfolio.ts)

---

### 1.6 Settlements — Liquidation Floor

#### `GET /settlements/users/{walletAddress}/liquidation-floor?token=BTC&market=BTC-PERP`
Fetch liquidation floor data for a wallet's net position.

**Request**
```http
GET /settlements/users/0xAbCd1234.../liquidation-floor?token=BTC&market=BTC-PERP HTTP/1.1
```

**Response**
```json
{
  "userWallet": "0xAbCd1234...",
  "token": "BTC",
  "market": "BTC-PERP",
  "currentPrice": 85432.50,
  "liquidationPrice": 70250.00,
  "netBtcAmount": 0.01,
  "netPerpType": "LONG",
  "distanceToLiquidation": 0.1778,
  "isLiquidatable": false
}
```

**Source:** [`portfolio.ts`](src/lib/data/api/portfolio.ts)

---

### 1.7 Earn

---

#### `GET /earn/positions/{walletAddress}`
Fetch the earn position for a wallet.

**Request**
```http
GET /earn/positions/0xAbCd1234... HTTP/1.1
```

**Response**
```json
{
  "data": {
    "id": "earn-001",
    "user_wallet": "0xAbCd1234...",
    "status": "active",
    "created_at": "2025-03-10T12:00:00Z",
    "updated_at": "2025-03-19T08:00:00Z",
    "pool_notional_deposit_btc": 0.05,
    "pool_notional_deposit_dollar": 4271.62,
    "pool_notional_deposit_percentage": 0.916,
    "lp_margin_btc": 0.012,
    "lp_margin_dollar": 1025.19,
    "initial_lp_leverage": 5.0,
    "current_lp_leverage": 7.2,
    "earn_pnl_dollar": 124.50,
    "exited_pnl_dollar": 0.0
  }
}
```

---

#### `POST /earn/positions`
Create a new earn position. Behaviour depends on `is_transcat`.

**Request (dry-run — slippage preview)**
```http
POST /earn/positions HTTP/1.1
Content-Type: application/json

{
  "user_wallet": "0xAbCd1234...",
  "initial_deposit_btc": 0.05,
  "initial_deposit_dollar": 4271.62,
  "leverage": 5,
  "is_transcat": false
}
```

**Response (dry-run)**
```json
{
  "success": true,
  "message": "Slippage calculation complete",
  "data": {
    "combined_slippage_ratio": 0.0021,
    "long_pool_upside": 2135.81,
    "short_pool_upside": 2135.81
  }
}
```

**Request (create position)**
```http
POST /earn/positions HTTP/1.1
Content-Type: application/json

{
  "user_wallet": "0xAbCd1234...",
  "initial_deposit_btc": 0.05,
  "initial_deposit_dollar": 4271.62,
  "leverage": 5,
  "is_transcat": true
}
```

**Response (create position)**
```json
{
  "success": true,
  "message": "Earn position created successfully",
  "data": {
    "position": {
      "id": "earn-001",
      "user_wallet": "0xAbCd1234...",
      "status": "active",
      "created_at": "2025-03-19T08:21:00Z",
      "updated_at": "2025-03-19T08:21:00Z",
      "pool_notional_deposit_btc": 0.05,
      "pool_notional_deposit_dollar": 4271.62,
      "pool_notional_deposit_percentage": 0.916,
      "lp_margin_btc": 0.012,
      "lp_margin_dollar": 1025.19,
      "initial_lp_leverage": 5.0,
      "current_lp_leverage": 5.0
    },
    "long_pool_upside": 2135.81,
    "short_pool_upside": 2135.81
  }
}
```

---

#### `POST /earn/positions/{earnId}/close`
Close an earn position.

**Request**
```http
POST /earn/positions/earn-001/close HTTP/1.1
Content-Type: application/json

{}
```

**Response**
```json
{
  "success": true,
  "message": "Earn position earn-001 closed successfully"
}
```

**Source:** [`transactions.ts`](src/lib/data/api/transactions.ts), [`portfolio.ts`](src/lib/data/api/portfolio.ts)

---

## 2. Hyperliquid REST API

**Base URL:** `https://api.hyperliquid.xyz/info`  
**All requests:** `POST` with `Content-Type: application/json`

---

#### `POST /info` — Candle Snapshot
Fetch historical OHLCV candles for a given coin and interval.

**Request**
```http
POST https://api.hyperliquid.xyz/info HTTP/1.1
Content-Type: application/json

{
  "type": "candleSnapshot",
  "req": {
    "coin": "BTC",
    "interval": "1h",
    "startTime": 1742378400000,
    "endTime": 1742382000000
  }
}
```

> Supported intervals: `5m`, `15m`, `1h`, `4h`, `1d`, `1w`, `1M`.  
> Max 5000 candles per request.

**Response**
```json
[
  {
    "t": 1742378400000,
    "o": "84850.00",
    "h": "85600.50",
    "l": "84700.00",
    "c": "85432.50",
    "v": "142.37"
  },
  {
    "t": 1742382000000,
    "o": "85432.50",
    "h": "85900.00",
    "l": "85100.00",
    "c": "85780.00",
    "v": "98.12"
  }
]
```

**Source (server):** [`market/hyperliquid.ts`](src/lib/data/market/hyperliquid.ts)  
**Source (client fallback):** [`market/hyperliquid-client.ts`](src/lib/data/market/hyperliquid-client.ts)

---

### 2.1 Hyperliquid SDK Calls

These use the `hyperliquid` npm SDK server-side with `PRIVATE_KEY_LONG` / `PRIVATE_KEY_SHORT`.

---

#### `sdk.info.perpetuals.getMetaAndAssetCtxs()`
Fetch perp metadata (tick sizes, decimals) and live asset contexts (mark price, OI, etc.).

**Response (abbreviated)**
```json
[
  {
    "universe": [
      {
        "name": "BTC-PERP",
        "szDecimals": 3,
        "maxLeverage": 50
      }
    ]
  },
  [
    {
      "markPx": "85432.50",
      "midPx": "85430.00",
      "impactPxs": ["85400.00", "85460.00"],
      "openInterest": "1234.567",
      "funding": "0.0001"
    }
  ]
]
```

---

#### `sdk.info.perpetuals.getPerpsAtOpenInterestCap()`
Returns a list of perps at their OI cap (affects order price deviation limits).

**Response**
```json
[
  { "asset": 0 }
]
```

---

#### `sdk.exchange.placeOrder(order)`
Place a limit order on Hyperliquid.

**Request**
```json
{
  "coin": "BTC-PERP",
  "is_buy": true,
  "sz": 0.001,
  "limit_px": 85460.0,
  "order_type": { "limit": { "tif": "Gtc" } },
  "reduce_only": false
}
```

**Response**
```json
{
  "response": {
    "data": {
      "statuses": [
        {
          "filled": {
            "oid": 99887766,
            "totalSz": "0.001",
            "avgPx": "85455.00"
          }
        }
      ]
    }
  }
}
```

---

#### `sdk.info.userFees(address)`
Fetch a user's trading fee rates.

**Response**
```json
{
  "userCrossRate": "0.000350",
  "userAddRate": "-0.000100"
}
```

**Source:** [`ZHL_createPerpPositon.ts`](src/app/actions/ZHL_createPerpPositon.ts), [`fetchUserFeesAction.ts`](src/app/actions/fetchUserFeesAction.ts)

---

## 3. WebSockets

### 3.1 Temporal Market-Data WebSocket

**URL:** `ws://prod.temporal.exchange/ws/market-data`  
**Direction:** Server → Client only. No subscription message required.

---

**Inbound — `market_data`** (streams continuously):
```json
{
  "type": "market_data",
  "amm_graph": {
    "config": {},
    "long_tree": {
      "nodes": [
        { "strike": 0, "pt_asset": 1.0 },
        { "strike": 1000, "pt_asset": 0.85 },
        { "strike": 5000, "pt_asset": 0.45 }
      ]
    },
    "short_tree": {
      "nodes": [
        { "strike": 0, "pt_asset": 1.0 },
        { "strike": 1000, "pt_asset": 0.80 },
        { "strike": 5000, "pt_asset": 0.38 }
      ]
    },
    "stats": {}
  },
  "oracle_price": 85432.50
}
```

**Inbound — `update`** (incremental):
```json
{
  "type": "update",
  "event": "price_change"
}
```

**Source:** [`websocket.ts`](src/lib/data/api/websocket.ts) — `createDataWebSocket()`

---

### 3.2 Temporal User-Data WebSocket

**URL:** `ws://prod.temporal.exchange/ws/user-data`  
**Direction:** Bidirectional. Must send a subscription message after connecting.

---

**Outbound — subscription message (sent after connect):**
```json
{
  "wallet": "0xAbCd1234...",
  "token": "BTC",
  "market": "BTC-PERP",
  "tx_limit": 20,
  "tx_offset": 0,
  "perp_limit": 20,
  "perp_offset": 0
}
```

---

**Inbound — `user_data`** (full snapshot on first message):
```json
{
  "type": "user_data",
  "transactions": {
    "transactions": [
      {
        "id": "txn-001",
        "type": "buy",
        "perp_type": "long",
        "quantity": 0.001,
        "status": "completed",
        "wallet_address": "0xAbCd1234...",
        "created_at": "2025-03-19T08:00:00Z",
        "perp_market_price": 85432.50,
        "trader_equity": 1050.00,
        "amm_quantity": 0.001,
        "initial_perp_margin": 1000.00,
        "bought_initial_inner_bound": 0.02,
        "bought_initial_outer_bound": 0.05,
        "bought_residual_inner_bound": 0.01,
        "bought_residual_outer_bound": 0.03,
        "sold_initial_inner_bound": 0.02,
        "sold_initial_outer_bound": 0.05,
        "sold_residual_inner_bound": 0.01,
        "sold_residual_outer_bound": 0.03,
        "bought_initial_inner_price": 83724.05,
        "bought_initial_outer_price": 80660.87,
        "sold_initial_inner_price": 87140.95,
        "sold_initial_outer_price": 90204.12,
        "bought_profit": 42.50,
        "sold_profit": 7.80,
        "bought_initial_value_in_dollars": 855.32,
        "sold_initial_value_in_dollars": 855.32,
        "is_closed": false,
        "net_band_payout": 50.30
      }
    ],
    "perp_quantity": {
      "total_btc_amount": 0.01,
      "used_quantity": 0.005,
      "available_quantity": 0.005,
      "perp_count": 2,
      "long_positions": { "count": 1, "available_quantity": 0.003 },
      "short_positions": { "count": 1, "available_quantity": 0.002 }
    },
    "total_count": 1
  },
  "perps": [
    {
      "id": "perp-001",
      "token": "BTC",
      "perpType": "LONG",
      "market": "BTC-PERP",
      "initialUsdMargin": 1000.00,
      "usdcAmount": 1000.00,
      "leverage": 10,
      "initialLeverage": 10,
      "markPrice": 85432.50,
      "entryPrice": 84500.00,
      "btcAmount": 0.001,
      "pnl": 93.25,
      "positionValue": 1093.25,
      "usedQuantity": 0.001,
      "fundingRate": 0.0001,
      "fundingAccrued": -2.10,
      "lastFundingAt": "2025-03-19T06:00:00Z",
      "liquidationMargin": 120.00,
      "isLiquidated": false,
      "liquidatedAt": null,
      "isClosed": false,
      "userWallet": "0xAbCd1234...",
      "created_at": "2025-03-18T10:00:00Z",
      "updated_at": "2025-03-19T08:00:00Z"
    }
  ],
  "earn_positions": [
    {
      "id": "earn-001",
      "user_wallet": "0xAbCd1234...",
      "status": "active",
      "created_at": "2025-03-10T12:00:00Z",
      "updated_at": "2025-03-19T08:00:00Z",
      "pool_notional_deposit_btc": 0.05,
      "pool_notional_deposit_dollar": 4271.62,
      "pool_notional_deposit_percentage": 0.916,
      "exited_pnl_dollar": 0.0,
      "lp_margin_btc": 0.012,
      "lp_margin_dollar": 1025.19,
      "initial_lp_leverage": 5.0,
      "current_lp_leverage": 7.2,
      "earn_pnl_dollar": 124.50
    }
  ],
  "liquidation_floor": {
    "userWallet": "0xAbCd1234...",
    "token": "BTC",
    "market": "BTC-PERP",
    "currentPrice": 85432.50,
    "liquidationPrice": 70250.00,
    "netBtcAmount": 0.01,
    "netPerpType": "LONG",
    "distanceToLiquidation": 0.1778,
    "isLiquidatable": false
  },
  "perps_totals": {
    "liquidation_margin_total": 500.00,
    "initial_usd_margin_total": 1000.00,
    "btc_amount_total": 0.01,
    "used_quantity_total": 0.008,
    "perp_count": 2
  }
}
```

**Inbound — `update`** (incremental change):
```json
{
  "type": "update",
  "event": "perp_updated"
}
```

**Source:** [`websocket.ts`](src/lib/data/api/websocket.ts) — `createUserWebSocket()`

---

### 3.3 Hyperliquid WebSocket

**URL:** `wss://api.hyperliquid.xyz/ws`  
**Direction:** Bidirectional. Subscription message sent after connecting.

---

#### 3.3.1 Candle Subscription

**Outbound — subscription message:**
```json
{
  "method": "subscribe",
  "subscription": {
    "type": "candle",
    "coin": "BTC",
    "interval": "1h"
  }
}
```

**Inbound — snapshot** (array, sent on first connect):
```json
{
  "channel": "candle",
  "data": [
    {
      "t": 1742378400000,
      "o": "84850.00",
      "h": "85600.50",
      "l": "84700.00",
      "c": "85432.50",
      "v": "142.37"
    },
    {
      "t": 1742382000000,
      "o": "85432.50",
      "h": "85900.00",
      "l": "85100.00",
      "c": "85780.00",
      "v": "98.12"
    }
  ]
}
```

**Inbound — live update** (single candle on each tick):
```json
{
  "channel": "candle",
  "data": {
    "t": 1742385600000,
    "o": "85780.00",
    "h": "86100.00",
    "l": "85600.00",
    "c": "85990.00",
    "v": "55.43"
  }
}
```

**Source:** [`hyperliquid-websocket.ts`](src/lib/data/api/hyperliquid-websocket.ts) — `createHyperliquidCandleWebSocket()`

---

#### 3.3.2 AllMids (Live Mark Price) Subscription

**Outbound — subscription message:**
```json
{
  "method": "subscribe",
  "subscription": {
    "type": "allMids"
  }
}
```

**Inbound — price update** (fires on every price change):
```json
{
  "channel": "allMids",
  "data": {
    "mids": {
      "BTC": "85432.50",
      "ETH": "3241.75",
      "SOL": "185.30"
    }
  }
}
```

The frontend extracts the price for the configured coin (e.g. `mids["BTC"]`) to display a live mark price.

**Source:** [`hyperliquid-websocket.ts`](src/lib/data/api/hyperliquid-websocket.ts) — `createHyperliquidMidPriceWebSocket()`

---

### WebSocket Reconnect Behaviour

| Setting | Value |
|---|---|
| Max reconnect attempts | 10 |
| Initial reconnect delay | 1 second |
| Max reconnect delay | 30 seconds |
| Backoff | Exponential (`delay × 2^attempt`) |
| Give up on immediate failure (code 1006, never connected) | ✅ Yes |
| Reconnect on unexpected disconnection | ✅ Yes |

**Source:** [`websocket.ts`](src/lib/data/api/websocket.ts) — `WebSocketClient` class

---

## 4. External Integrations

### 4.1 Google Sheets API — Feedback Form

**Library:** `googleapis`  
**Auth:** Google Service Account (key in `GOOGLE_SERVICE_KEY` env var, base64-encoded)  
**Operation:** `spreadsheets.values.append`  
**Target:** `Feedback!A2` in spreadsheet `DATABASE_ID`

**Outbound data written to sheet:**
```json
["jayraj_tg", "Great product, love the liquidation floor feature!"]
```

> Columns: `[telegram_handle, comments]`

**Source:** [`SubmitFeedbackAction.ts`](src/app/actions/SubmitFeedbackAction.ts)

---

### 4.2 Arbitrum On-Chain USDC Bridge Transfer

**Network:** Arbitrum One (Chain ID: `42161`)  
**RPC:** `process.env.ARBITRUM_RPC_URL`

| Contract | Address |
|---|---|
| Hyperliquid Bridge | `0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7` |
| USDC (Arbitrum) | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |

**On-chain call:**
```solidity
// ERC-20 transfer to Hyperliquid bridge
usdc.transfer(
  "0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7",  // bridge
  4271620000                                         // 4271.62 USDC (6 decimals)
)
```

**Success response:**
```json
{
  "ok": true,
  "hash": "0xTxHash..."
}
```

**Failure response:**
```json
{
  "ok": false,
  "error": "Insufficient USDC balance in Temporal wallet"
}
```

> Uses `PRIVATE_KEY_LONG` for LONG trades, `PRIVATE_KEY_SHORT` for SHORT trades.

**Source:** [`ZHL_depositToHyperliquidBridgeAction.ts`](src/app/actions/ZHL_depositToHyperliquidBridgeAction.ts)

---

## 5. Key Type Reference

| Type | File | Description |
|---|---|---|
| `TransactionPayload` | `transactions.ts` | Body for `POST /api/transact` |
| `PerpPositionEntry` | `transactions.ts` | Body for `POST /settlements/perps` |
| `CreateEarnPositionRequest` | `transactions.ts` | Body for `POST /earn/positions` |
| `CreateEarnPositionResponse` | `transactions.ts` | Response from `POST /earn/positions` |
| `LiquidationFloorResponse` | `portfolio.ts` | Liquidation floor data shape |
| `EarnPosition` | `portfolio.ts` | Full earn position from REST |
| `PerpTableEntry` | `portfolio.ts` | Processed perp for UI tables |
| `EarnTableEntry` | `portfolio.ts` | Processed earn for UI tables |
| `TableDataGroup` | `portfolio.ts` | Grouped band transaction rows |
| `InitialDataMessageData` | `websocket.ts` | Payload of `market_data` WS message |
| `InitialUserMessageData` | `websocket.ts` | Payload of `user_data` WS message |
| `UserWebSocketTransaction` | `websocket.ts` | Transaction in user WS snapshot |
| `UserWebSocketPerp` | `websocket.ts` | Perp position in user WS snapshot |
| `UserWebSocketEarn` | `websocket.ts` | Earn position in user WS snapshot |
| `CandleData` | `market/hyperliquid.ts` | Normalised OHLCV candle |
| `CandleResolution` | `market/hyperliquid.ts` | Candle interval (`5m`, `1h`, etc.) |
| `ProcessedGraphData` | `prices.ts` | AMM graph node for the chart |

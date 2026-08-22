/**
 * Market Data Layer - Hyperliquid
 * Handles fetching market data from external sources (Hyperliquid REST API)
 * 
 * NOTE: This file is server-only and uses direct API calls to Hyperliquid
 */

"use server";

import dayjs from "dayjs";

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  formattedTime?: string;
}

export type CandleResolution =
  | "5m"
  | "15m"
  | "1h"
  | "4h"
  | "1d"
  | "1w"
  | "1M";

const HYPERLIQUID_API_URL = "https://api.hyperliquid.xyz/info";

// Map resolution format to Hyperliquid's format
const resolutionMap: Record<CandleResolution, string> = {
  "5m": "5m",
  "15m": "15m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1d",
  "1w": "1w",
  "1M": "1M",
};

/**
 * Converts coin symbol from "BTC-PERP" format to "BTC" format
 */
function convertCoinSymbol(coin: string): string {
  return coin.replace(/-PERP$/, "");
}

/**
 * Maps resolution to Hyperliquid's format
 */
function mapResolution(resolution: CandleResolution): string {
  return resolutionMap[resolution] || resolution;
}

/**
 * Fetches candle/market graph data from Hyperliquid using direct API calls
 * Note: Retry logic is handled in the store layer (graphStore.ts)
 */
export async function fetchMarketGraphData(
  symbol: string = "BTC-PERP",
  resolution: CandleResolution = "1h"
): Promise<CandleData[]> {
  const now = Date.now();

  const intervalMsMap: Record<CandleResolution, number> = {
    "5m": 5 * 60 * 250,
    "15m": 15 * 60 * 250,
    "1h": 60 * 60 * 250,
    "4h": 4 * 60 * 60 * 250,
    "1d": 24 * 60 * 60 * 1000,
    "1w": 7 * 24 * 60 * 60 * 1000,
    "1M": 30 * 24 * 60 * 60 * 1000,
  };

  const candleMs = intervalMsMap[resolution];
  const desiredLookback = candleMs * 1000;

  const maxLookback = 3 * 365 * 24 * 60 * 60 * 1000;
  const lookback = Math.min(desiredLookback, maxLookback);

  const startTime = now - lookback;
  const endTime = now;

  const hyperliquidCoin = convertCoinSymbol(symbol);
  const hyperliquidInterval = mapResolution(resolution);

  console.log(`[API] Fetching candles for resolution: ${resolution}, lookback: ${lookback}ms`);

  try {
    const response = await fetch(HYPERLIQUID_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "candleSnapshot",
        req: {
          coin: hyperliquidCoin,
          interval: hyperliquidInterval,
          startTime,
          endTime,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const raw = await response.json();
    
    console.log(`[API] Received ${Array.isArray(raw) ? raw.length : 0} candles for resolution: ${resolution}`);

    if (!Array.isArray(raw)) {
      console.error("Unexpected candle data:", raw);
      throw new Error("Invalid candle format");
    }

    const formatted: CandleData[] = raw.map((r: any) => ({
      time: r.t,
      open: parseFloat(r.o),
      high: parseFloat(r.h),
      low: parseFloat(r.l),
      close: parseFloat(r.c),
      volume: parseFloat(r.v),
      formattedTime: dayjs(r.t).format("DD MMM HH:mm"),
    }));

    return formatted;
  } catch (err: any) {
    console.error("fetchMarketGraphData error:", err.message);
    throw err;
  }
}


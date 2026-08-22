/**
 * Client-Side Hyperliquid API calls
 * Handles direct REST API requests from the browser when server actions fail
 */

import dayjs from "dayjs";
import type { CandleData, CandleResolution } from "./hyperliquid";

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
 * Fetches historical candle data directly from Hyperliquid REST API
 * This is used as a client-side fallback when the SDK server action fails
 * @param coin - Symbol (e.g., "BTC-PERP" or "BTC")
 * @param interval - Candle resolution
 * @param startTime - Start timestamp in milliseconds
 * @param endTime - End timestamp in milliseconds
 * @returns Array of candle data (up to 5000 candles per Hyperliquid limit)
 */
export async function fetchCandleSnapshotFallback(
  coin: string,
  interval: CandleResolution,
  startTime: number,
  endTime: number
): Promise<CandleData[]> {
  const hyperliquidCoin = convertCoinSymbol(coin);
  const hyperliquidInterval = mapResolution(interval);

  console.log(`[REST Fallback] Fetching candles: coin=${hyperliquidCoin}, interval=${hyperliquidInterval}, startTime=${new Date(startTime).toISOString()}, endTime=${new Date(endTime).toISOString()}`);

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

    if (!Array.isArray(raw)) {
      console.error("Unexpected candle data format:", raw);
      throw new Error("Invalid candle format from REST API");
    }

    console.log(`[REST Fallback] Received ${raw.length} candles`);

    // Transform to CandleData format
    const candles: CandleData[] = raw.map((r: any) => ({
      time: r.t,
      open: parseFloat(r.o),
      high: parseFloat(r.h),
      low: parseFloat(r.l),
      close: parseFloat(r.c),
      volume: parseFloat(r.v),
      formattedTime: dayjs(r.t).format("DD MMM HH:mm"),
    }));

    return candles;
  } catch (err: any) {
    console.error("[REST Fallback] Error fetching candles:", err.message);
    throw err;
  }
}

"use server";

import { fetchMarketGraphData as fetchMarketGraphDataFromDAL } from "@/lib/data/market/hyperliquid";
import type { CandleData, CandleResolution } from "@/lib/data/market/hyperliquid";

export async function fetchMarketGraphData(
  symbol: string = "BTC-PERP",
  resolution: CandleResolution = "1h"
): Promise<CandleData[]> {
  return fetchMarketGraphDataFromDAL(symbol, resolution);
}


"use server";

import { fetchPnlHistory } from "@/lib/data/api/pnlHistory";
import type { PnlHistoryResponse } from "@/lib/data/api/pnlHistory";

/**
 * Fetches PNL history from GET /api/pnl/history.
 * Runs server-side so API_BASE_URL is never exposed to the client.
 */
export async function fetchPnlHistoryAction(params: {
  wallet: string;
  /** Comma-separated sections, e.g. "perps,earn,bands" or "all" (default: all) */
  section?: string;
  interval?: "hour" | "day";
  from?: string;
  to?: string;
  limit?: number;
}): Promise<PnlHistoryResponse> {
  return fetchPnlHistory(params);
}

"use server";

import {
  fetchStrikeBounds as fetchStrikeBoundsFromDAL,
  type StrikeBoundsResponse,
} from "@/lib/data/api/strikeBounds";

/**
 * Server action to fetch strike bound limits from the AMM.
 * Returns null on failure so the client can fall back to hardcoded validation.
 */
export async function fetchStrikeBoundsAction(
  perpType: "long" | "short",
  txType: "sell" = "sell"
): Promise<StrikeBoundsResponse | null> {
  try {
    return await fetchStrikeBoundsFromDAL(perpType, txType);
  } catch (e) {
    console.error("fetchStrikeBoundsAction error:", e);
    return null;
  }
}

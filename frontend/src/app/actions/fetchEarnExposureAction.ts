"use server";

import { fetchEarnExposure as fetchEarnExposureFromDAL } from "@/lib/data/api/exposure";
import type { ExposureResponse } from "@/lib/data/api/contracts";

/**
 * Server action for the accumulated-exposure table (portfolio → earn).
 * Returns null on failure so the caller can keep the existing "No results." row.
 */
export async function fetchEarnExposureAction(
  walletAddress: string,
  lpId?: string
): Promise<ExposureResponse | null> {
  try {
    return await fetchEarnExposureFromDAL(walletAddress, lpId);
  } catch (e) {
    console.error("fetchEarnExposureAction error:", e);
    return null;
  }
}

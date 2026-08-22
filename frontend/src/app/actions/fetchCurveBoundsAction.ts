"use server";

import { fetchCurveBounds as fetchCurveBoundsFromDAL } from "@/lib/data/api/curve";
import type { CurveBounds } from "@/lib/data/api/contracts";

/**
 * Server action for curve-param input guardrails.
 * Returns null on failure so the caller can fall back to hardcoded ranges.
 */
export async function fetchCurveBoundsAction(): Promise<CurveBounds | null> {
  try {
    return await fetchCurveBoundsFromDAL();
  } catch (e) {
    console.error("fetchCurveBoundsAction error:", e);
    return null;
  }
}

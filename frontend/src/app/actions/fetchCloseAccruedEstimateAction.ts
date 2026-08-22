"use server";

import { fetchCloseAccruedEstimate } from "@/lib/data/api/lpCurve";
import type { LpBandWireRow } from "@/lib/data/api/portfolioTransforms";

/** Pre-confirm estimate for the CLOSE ACCRUED POSITIONS dialog (task #36b) —
 *  reuses the BANDS LP-rows wire verbatim, scoped to one curve. `null` means
 *  the fetch itself failed (render an error, don't guess); `[]` is a genuine
 *  "no accrued positions" answer — the two must stay distinguishable. */
export async function fetchCloseAccruedEstimateAction(
  walletAddress: string,
  lpId: string
): Promise<LpBandWireRow[] | null> {
  try {
    return await fetchCloseAccruedEstimate(walletAddress, lpId);
  } catch (e) {
    console.error("fetchCloseAccruedEstimateAction error:", e);
    return null;
  }
}

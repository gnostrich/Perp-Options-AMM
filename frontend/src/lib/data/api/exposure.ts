/**
 * Accumulated LP exposure API (v2 §7.2 contract 6).
 *
 * NOTE: server-side only (server actions).
 */

import { apiGet } from "./client";
import type { ExposureResponse } from "./contracts";

/** GET /earn/exposure/{wallet_address}?lpId= — net inventory + P/L totals. */
export async function fetchEarnExposure(
  walletAddress: string,
  lpId?: string
): Promise<ExposureResponse> {
  const qs = lpId ? `?lpId=${encodeURIComponent(lpId)}` : "";
  return apiGet<ExposureResponse>(`/earn/exposure/${walletAddress}${qs}`);
}

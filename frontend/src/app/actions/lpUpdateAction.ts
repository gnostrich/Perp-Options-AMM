"use server";

import {
  updateLpCurve as updateLpCurveFromDAL,
  type LpUpdateRequest,
} from "@/lib/data/api/lpCurve";
import { ApiError } from "@/lib/data/api/client";
import type { MyLpState } from "@/lib/data/api/contracts";

export interface LpUpdateActionResult {
  data: MyLpState | null;
  /** The backend's OWN refusal text (e.g. a 400 "LP leverage is capped at
   *  10×: …" refusal on a requote), displayed verbatim by the caller, never
   *  paraphrased — same {data,error} shape as closeAccruedPositionsAction.
   *  Non-ApiError failures (network, etc.) fall back to a generic message. */
  error: string | null;
}

/**
 * Server action to update an already-deployed LP curve's params/dials.
 */
export async function lpUpdateAction(
  walletAddress: string,
  req: LpUpdateRequest
): Promise<LpUpdateActionResult> {
  try {
    const res = await updateLpCurveFromDAL(walletAddress, req);
    return res.success ? { data: res.data, error: null } : { data: null, error: null };
  } catch (e) {
    console.error("lpUpdateAction error:", e);
    const error = e instanceof ApiError ? e.message.trim() : "Failed to update LP curve";
    return { data: null, error };
  }
}

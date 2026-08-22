"use server";

import { closeAccruedPositions } from "@/lib/data/api/lpCurve";
import { ApiError } from "@/lib/data/api/client";
import type { CloseAccruedResponse } from "@/lib/data/api/contracts";

export interface CloseAccruedActionResult {
  data: CloseAccruedResponse | null;
  /** The backend's OWN refusal text (409 engine refusal, 400 non-active
   *  position, 404 unknown earn id, 503 no engine) — displayed verbatim by
   *  the caller, never paraphrased. Non-ApiError failures (network, etc.)
   *  fall back to a generic message. */
  error: string | null;
}

/** Executes "close accrued positions" (task #36b). `lpId` is the LP curve's
 *  own id (== the earn position's id backend-side). A 200 covers a partial
 *  sweep too (`res.skipped` non-empty) — only a thrown ApiError is a real
 *  failure to report here. */
export async function closeAccruedPositionsAction(
  lpId: string
): Promise<CloseAccruedActionResult> {
  try {
    const data = await closeAccruedPositions(lpId);
    return { data, error: null };
  } catch (e) {
    console.error("closeAccruedPositionsAction error:", e);
    const error = e instanceof ApiError ? e.message.trim() : "Failed to close accrued positions";
    return { data: null, error };
  }
}

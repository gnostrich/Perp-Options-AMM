"use server";

import {
  createEarnPosition as createEarnPositionFromDAL,
  type CreateEarnPositionRequest,
  type CreateEarnPositionResponse,
} from "@/lib/data/api/transactions";
import { ApiError } from "@/lib/data/api/client";

export interface CreateEarnPositionActionResult {
  data: CreateEarnPositionResponse | null;
  /** The backend's OWN refusal text (e.g. a 400 "LP leverage is capped at
   *  10×: …" refusal), displayed verbatim by the caller, never paraphrased —
   *  same {data,error} shape as closeAccruedPositionsAction. Non-ApiError
   *  failures (network, etc.) fall back to a generic message. */
  error: string | null;
}

export async function createEarnPositionAction(
  positionData: CreateEarnPositionRequest
): Promise<CreateEarnPositionActionResult> {
  try {
    const data = await createEarnPositionFromDAL(positionData);
    return { data, error: null };
  } catch (e) {
    console.error("createEarnPositionAction error:", e);
    const error = e instanceof ApiError ? e.message.trim() : "Failed to deploy LP curve";
    return { data: null, error };
  }
}

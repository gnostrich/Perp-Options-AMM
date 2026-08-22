/**
 * LP curve-preview + curve-bounds API (v2 §7.2 contracts 1–2).
 *
 * NOTE: server-side only (server actions) — mirrors strikeBounds.ts.
 */

import { apiGet, apiPost } from "./client";
import type { LpParams, SchedulePreview, CurveBounds } from "./contracts";

export interface CurvePreviewRequest extends LpParams {
  margin_usd: number;
  leverage: number;
}

/**
 * Discretises an arbitrary (pre-deploy) Burr-2 param vector into a schedule
 * + option-price curve on the same signed-% grid as the market curve.
 * Pure/idempotent — safe for the 300 ms live preview cadence (§8 B.1/B.4).
 */
export async function fetchCurvePreview(
  req: CurvePreviewRequest
): Promise<SchedulePreview> {
  return apiPost<SchedulePreview>("/api/amm/curve-preview", req);
}

/** Authoritative min/max/step/default per curve param, for input guardrails. */
export async function fetchCurveBounds(): Promise<CurveBounds> {
  return apiGet<CurveBounds>("/api/amm/curve-bounds");
}

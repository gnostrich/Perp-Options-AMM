/**
 * Strike Bounds API
 * Fetches allowed strike price ranges and defaults from the AMM
 *
 * NOTE: This module is intended for server-side use only (server actions, server components).
 * Client components should use the server action from src/app/actions/ instead.
 */

import { apiGet } from "./client";

/* ─── Response types ─────────────────────────────────── */

export interface BoundRange {
  min_usd: number;
  max_usd: number;
  min_theta: number;
  max_theta: number;
  min_pct_from_spot: number;
  max_pct_from_spot: number;
}

export interface BoundLeg {
  wing: string;
  inner_field: string;
  outer_field: string;
  inner: BoundRange;
  outer: BoundRange;
  outer_optional: boolean;
  zero_outer_means_barrier_only: boolean;
}

export interface BoundDefaults {
  inner_usd: number;
  outer_usd: number;
}

export interface StrikeBoundsResponse {
  perp_type: string;
  tx_type: string;
  oracle: number;
  pool_mark: number;
  spot: number;
  sold: BoundLeg;
  bought: BoundLeg;
  sold_defaults: BoundDefaults;
  bought_defaults: BoundDefaults;
}

/* ─── Fetch function ─────────────────────────────────── */

/**
 * Fetches strike bound limits from the AMM.
 * @param perpType "long" or "short"
 * @param txType  transaction type, currently always "sell"
 */
export async function fetchStrikeBounds(
  perpType: "long" | "short",
  txType: "sell" = "sell"
): Promise<StrikeBoundsResponse> {
  return apiGet<StrikeBoundsResponse>(
    `/api/amm/strike-bounds?perpType=${perpType}&txType=${txType}`
  );
}

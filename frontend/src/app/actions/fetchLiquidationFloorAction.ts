"use server";

import { fetchLiquidationFloor as fetchLiquidationFloorFromDAL } from "@/lib/data/api/portfolio";
import type { LiquidationFloorResponse } from "@/lib/data/api/portfolio";

export async function fetchLiquidationFloorAction(
  walletAddress: string
): Promise<LiquidationFloorResponse> {
  return fetchLiquidationFloorFromDAL(walletAddress);
}


"use server";

import { fetchLpPositions, type LpPosition } from "@/lib/data/api/lpCurve";

/** Server action for the portfolio Earn money view — every LP position of a wallet. */
export async function fetchLpPositionsAction(
  walletAddress: string
): Promise<LpPosition[]> {
  try {
    return await fetchLpPositions(walletAddress);
  } catch (e) {
    console.error("fetchLpPositionsAction error:", e);
    return [];
  }
}

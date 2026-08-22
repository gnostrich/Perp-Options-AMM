"use server";

import { fetchPerpPositions as fetchPerpPositionsFromDAL } from "@/lib/data/api/portfolio";
import type { PerpTableEntry } from "@/lib/data/api/portfolio";

export async function fetchPerpPositionsAction(
  walletAddress: string
): Promise<PerpTableEntry[]> {
  return fetchPerpPositionsFromDAL(walletAddress);
}


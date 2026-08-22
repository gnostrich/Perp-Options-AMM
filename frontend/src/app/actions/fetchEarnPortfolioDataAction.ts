"use server";

import { fetchEarnPortfolioData as fetchEarnPortfolioDataFromDAL } from "@/lib/data/api/portfolio";
import type { EarnTableEntry } from "@/lib/data/api/portfolio";

export async function fetchEarnPortfolioDataAction(
  walletAddress: string
): Promise<EarnTableEntry[]> {
  return fetchEarnPortfolioDataFromDAL(walletAddress);
}


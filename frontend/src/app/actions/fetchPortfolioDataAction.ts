"use server";

import { fetchPortfolioData as fetchPortfolioDataFromDAL } from "@/lib/data/api/portfolio";
import type { TableDataGroup } from "@/lib/data/api/portfolio";

export async function fetchPortfolioDataAction(
  walletAddress: string,
  currentMarkPrice?: number
): Promise<TableDataGroup[]> {
  return fetchPortfolioDataFromDAL(walletAddress, currentMarkPrice);
}


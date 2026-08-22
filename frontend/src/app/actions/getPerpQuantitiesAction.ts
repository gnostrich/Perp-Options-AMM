"use server";

import { getPerpQuantities as getPerpQuantitiesFromDAL } from "@/lib/data/api/portfolio";

export async function getPerpQuantitiesAction(
  walletAddress: string
): Promise<{ long: number; short: number }> {
  return getPerpQuantitiesFromDAL(walletAddress);
}


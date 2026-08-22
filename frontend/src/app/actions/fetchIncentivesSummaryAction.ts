"use server";

import {
  fetchIncentivesSummary,
  type IncentiveSummaryResponse,
} from "@/lib/data/api/incentives";

export async function fetchIncentivesSummaryAction(
  walletAddress: string
): Promise<IncentiveSummaryResponse | null> {
  try {
    return await fetchIncentivesSummary(walletAddress);
  } catch (error) {
    console.error("Error fetching incentives summary:", error);
    return null;
  }
}

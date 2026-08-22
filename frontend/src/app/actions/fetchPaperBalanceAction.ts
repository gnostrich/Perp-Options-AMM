"use server";

import { fetchPaperBalance as fetchPaperBalanceFromDAL } from "@/lib/data/api/paper";
import type { PaperBalance } from "@/lib/data/api/contracts";

/**
 * Server action feeding BalanceChip / TransferAndPerpButton in paper mode.
 * Returns null on failure so the caller can render "—" like the other balance reads.
 */
export async function fetchPaperBalanceAction(
  walletAddress: string
): Promise<PaperBalance | null> {
  try {
    return await fetchPaperBalanceFromDAL(walletAddress);
  } catch (e) {
    console.error("fetchPaperBalanceAction error:", e);
    return null;
  }
}

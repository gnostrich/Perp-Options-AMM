"use server";

import {
  ensurePaperWallet as ensurePaperWalletFromDAL,
  type PaperWalletResponse,
} from "@/lib/data/api/paper";

/**
 * Server action to seed (idempotently) a connected wallet's paper balance.
 * Returns null on failure — caller treats this as best-effort, like referral registration.
 */
export async function ensurePaperWalletAction(
  walletAddress: string,
  displayName?: string
): Promise<PaperWalletResponse | null> {
  try {
    return await ensurePaperWalletFromDAL(walletAddress, displayName);
  } catch (e) {
    console.error("ensurePaperWalletAction error:", e);
    return null;
  }
}

/**
 * Paper wallet API (v2 §13.4).
 *
 * NOTE: server-side only (server actions).
 */

import { apiGet, apiPost } from "./client";
import type { PaperBalance } from "./contracts";

export interface PaperWalletResponse {
  wallet_address: string;
  balance_usd: number;
}

/** POST /api/paper/wallet — idempotent $1,000,000 seed on first touch. */
export async function ensurePaperWallet(
  walletAddress: string,
  displayName?: string
): Promise<PaperWalletResponse> {
  return apiPost<PaperWalletResponse>("/api/paper/wallet", {
    wallet_address: walletAddress,
    display_name: displayName,
  });
}

/** GET /api/paper/balance?wallet= — balance + open-position/LP-NAV equity. */
export async function fetchPaperBalance(
  walletAddress: string
): Promise<PaperBalance> {
  return apiGet<PaperBalance>(
    `/api/paper/balance?wallet=${encodeURIComponent(walletAddress)}`
  );
}

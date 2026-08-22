/**
 * Transactions API
 * Handles transaction submission and related operations
 */

import { apiPost } from "./client";
import type { AfterCurve, LpParams, LpDials } from "./contracts";

export interface TransactionPayload {
  type: string;
  PerpType: string;
  amount: number;
  StikeLowerBoundSell: number;
  StikeUpperBoundSell: number;
  StrikeLowerBoundBuy: number;
  StikeUpperBoundBuy: number;
  IsTransactionDone: boolean;
  WalletAddress: string;
}

export interface TransactionResponse {
  success?: boolean;
  message?: string;
  amount?: number;
  total_amount?: number;
  slippage?: number;
  fees?: number;
  /** Post-fill best-of-book smile on a cloned book (v2 §7.2 contract 3). */
  after_curve?: AfterCurve;
  /** Largest sell-size the current book can fill for the selected band shape, in BTC. Absent on older backends. */
  max_fillable?: number;
  [key: string]: unknown;
}

export interface PerpPositionEntry {
  id: string;
  signature: string;
  token: string;
  perpType: string;
  market: string;
  usdcAmount: number;
  leverage: number;
  markPrice: number;
  btcAmount: number;
  userWallet: string;
  autoProtect?: boolean;
  wallet_type?: "temporal" | "hyperliquid";
  created_at: string;
}

export interface CreateEarnPositionRequest {
  user_wallet: string;
  initial_deposit_btc: number;
  initial_deposit_dollar: number;
  leverage: number;
  is_transcat: boolean;
  wallet_type?: "temporal" | "hyperliquid";
  /** LP curve deploy fields (v2 §7.2 contract 5) — omit for a house/neutral position. */
  params?: LpParams;
  dials?: LpDials;
}

export interface CreatedEarnPosition {
  id: string;
  user_wallet: string;
  status: string;
  created_at: string;
  updated_at: string;
  pool_notional_deposit_btc: number;
  pool_notional_deposit_dollar: number;
  pool_notional_deposit_percentage: number;
  lp_margin_btc: number;
  lp_margin_dollar: number;
  initial_lp_leverage: number;
  current_lp_leverage: number;
}

export interface SlippageCalculationData {
  combined_slippage_ratio: number;
  long_pool_upside: number;
  short_pool_upside: number;
}

export interface PositionCreationData {
  position: CreatedEarnPosition;
  long_pool_upside: number;
  short_pool_upside: number;
}

export type CreateEarnPositionResponse =
  | {
    success: boolean;
    message: string;
    data: SlippageCalculationData;
  }
  | {
    success: boolean;
    message: string;
    data: PositionCreationData;
  };

/**
 * Sends a sell transaction and returns the response
 */
export async function sendSellTransaction(
  payload: TransactionPayload
): Promise<TransactionResponse> {
  return apiPost<TransactionResponse>("/api/transact", payload);
}

/**
 * Creates a new perp position
 */
export async function createPerpPosition(
  perpPosition: Omit<PerpPositionEntry, "id" | "created_at" | "signature">
): Promise<PerpPositionEntry> {
  return apiPost<PerpPositionEntry>("/settlements/perps", perpPosition);
}

/**
 * Creates a new earn position
 */
export async function createEarnPosition(
  positionData: CreateEarnPositionRequest
): Promise<CreateEarnPositionResponse> {
  return apiPost<CreateEarnPositionResponse>("/earn/positions", positionData);
}

/**
 * Completes a transaction
 */
export async function completeTransaction(
  transactionId: number | string
): Promise<{ ok: boolean; response: unknown }> {
  try {
    const response = await apiPost(`/settlements/transactions/${transactionId}/complete`, {});
    return { ok: true, response };
  } catch (e) {
    console.error("completeTransaction error:", e);
    return { ok: false, response: null };
  }
}

/**
 * Closes a perp position
 */
export async function closePerpPosition(
  perpId: string
): Promise<{ ok: boolean; response: unknown }> {
  try {
    const response = await apiPost(`/settlements/perps/${perpId}/close`, {});
    return { ok: true, response };
  } catch (e) {
    console.error("closePerpPosition error:", e);
    return { ok: false, response: null };
  }
}

/**
 * Closes an earn position
 */
export async function closeEarnPosition(
  earnId: string
): Promise<{ ok: boolean; response: unknown }> {
  try {
    const response = await apiPost(`/earn/positions/${earnId}/close`, {});
    return { ok: true, response };
  } catch (e) {
    console.error("closeEarnPosition error:", e);
    return { ok: false, response: null };
  }
}


/**
 * Hyperliquid Exchange API
 * Handles broadcasting signed EIP-712 transactions to Hyperliquid L1
 *
 * NOTE: This module is server-side only (used by server actions).
 */

import { hexToSignature, type Hex } from "viem";

const HL_EXCHANGE_URL = "https://api.hyperliquid.xyz/exchange";

export interface HLTransferRequest {
  signature: Hex;
  time: number;
  destination: string;
  amount: string;
}

export interface HLTransferResponse {
  success: boolean;
  response?: unknown;
  error?: string;
}

/**
 * Broadcasts a signed usdSend transaction to Hyperliquid L1
 */
export async function broadcastHLTransfer(
  req: HLTransferRequest
): Promise<HLTransferResponse> {
  try {
    // console.log("\n--- [DAL/HL] Broadcasting usdSend to Hyperliquid ---");
    // console.log(`[DAL/HL] amount=${req.amount}, destination=${req.destination}, time=${req.time}`);

    // Decompose hex signature into { r, s, v }
    const sig = hexToSignature(req.signature);
    const hlSignature = {
      r: sig.r,
      s: sig.s,
      v: Number(sig.v),
    };

    const payload = {
      action: {
        type: "usdSend",
        hyperliquidChain: "Mainnet",
        signatureChainId: "0xa4b1", // Arbitrum Mainnet (42161)
        destination: req.destination,
        amount: req.amount,
        time: req.time,
      },
      nonce: req.time,
      signature: hlSignature,
    };

    // console.log("[DAL/HL] Payload:", JSON.stringify(payload, null, 2));

    const hlResponse = await fetch(HL_EXCHANGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // console.log(`[DAL/HL] HTTP ${hlResponse.status} ${hlResponse.statusText}`);

    const result = await hlResponse.json();
    // console.log("[DAL/HL] Response:", JSON.stringify(result, null, 2));

    if (result.status === "ok") {
      // console.log("[DAL/HL] Transfer successful");
      return { success: true, response: result };
    } else {
      const isInsufficientBalance = typeof result.response === 'string' && result.response.toLowerCase().includes('insufficient balance');
      const errorMessage = isInsufficientBalance ? "Insufficient balance" : "Hyperliquid API error";

      // console.error(`[DAL/HL] Transfer rejected: ${errorMessage}`);
      return { success: false, error: errorMessage, response: result };
    }
  } catch (error: any) {
    // console.error("[DAL/HL] Exception:", error);
    return {
      success: false,
      error: error.message || "Internal error broadcasting to Hyperliquid",
    };
  }
}

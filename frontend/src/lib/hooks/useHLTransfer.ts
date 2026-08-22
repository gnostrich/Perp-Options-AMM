"use client";

import { useState, useCallback } from "react";
import { useWalletClient } from "wagmi";
import { broadcastHLTransferAction } from "@/app/actions/broadcastHLTransferAction";
import { isPaperMode } from "@/lib/execMode";

const EIP712_DOMAIN = {
  name: "HyperliquidSignTransaction",
  version: "1",
  chainId: 42161, // Arbitrum Mainnet
  verifyingContract: "0x0000000000000000000000000000000000000000" as const,
};

const EIP712_TYPES = {
  "HyperliquidTransaction:UsdSend": [
    { name: "hyperliquidChain", type: "string" },
    { name: "destination", type: "string" },
    { name: "amount", type: "string" },
    { name: "time", type: "uint64" },
  ],
};

/**
 * Hook for executing Hyperliquid internal transfers via EIP-712 signing.
 *
 * Usage:
 *   const { execute, isPending, error } = useHLTransfer();
 *   await execute("100.0", "0xDestination...", "0xUserAddress...");
 */
export function useHLTransfer() {
  const { data: walletClient } = useWalletClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (amount: string, destination: string, userAddress: string) => {
      // Paper mode (v2 item P4, §13.6): real HL transfers are guarded off.
      // No caller currently invokes execute() live — wallet-transfer steps are
      // already commented out in favor of calling the backend directly — but
      // this makes the no-op explicit rather than relying on dead call sites.
      if (isPaperMode()) {
        const msg = "HL transfer disabled in paper mode";
        console.warn(`[useHLTransfer] ${msg}`);
        setError(msg);
        throw new Error(msg);
      }

      setError(null);
      setIsPending(true);

      try {
        if (!walletClient) {
          throw new Error("Wallet not connected");
        }

        // Format amount: HL expects at least one decimal place
        let formattedAmount = amount;
        if (!formattedAmount.includes(".")) {
          formattedAmount += ".0";
        }

        const time = Date.now();

        const message = {
          hyperliquidChain: "Mainnet",
          destination,
          amount: formattedAmount,
          time: BigInt(time),
        };

        console.log("[useHLTransfer] Requesting EIP-712 signature...", {
          destination,
          amount: formattedAmount,
          time,
        });

        // Sign EIP-712 typed data
        const signatureHex = await walletClient.signTypedData({
          account: userAddress as `0x${string}`,
          domain: EIP712_DOMAIN,
          types: EIP712_TYPES,
          primaryType: "HyperliquidTransaction:UsdSend",
          message,
        });

        console.log("[useHLTransfer] Signature acquired, broadcasting...");

        // Broadcast via server action
        const result = await broadcastHLTransferAction({
          signature: signatureHex,
          time,
          destination,
          amount: formattedAmount,
        });

        if (!result.success) {
          throw new Error(result.error || "HL transfer failed");
        }

        console.log("[useHLTransfer] Transfer successful");
        return result;
      } catch (err: any) {
        let msg = err?.message || "HL transfer failed";
        if (msg.includes("User rejected") || msg.includes("User denied")) {
          msg = "User rejected the request";
        }
        console.error("[useHLTransfer] Error:", msg);
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsPending(false);
      }
    },
    [walletClient]
  );

  return { execute, isPending, error };
}

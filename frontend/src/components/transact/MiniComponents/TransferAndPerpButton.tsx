"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePublicClient, useWalletClient, useReadContract } from "wagmi";
import { useAccount } from "@/lib/hooks/useAccount";
import { parseUnits, isAddress, formatUnits } from "viem";
import { erc20Abi } from "viem";
import { arbitrum } from "viem/chains";
import type { FundSource } from "@/store/tradeStore";
import { useHLTransfer } from "@/lib/hooks/useHLTransfer";
import { useHLBalance } from "@/lib/hooks/useHLBalance";

import { createPerpPositionAction } from "@/app/actions/createPerpPositionAction";
import { fetchPaperBalanceAction } from "@/app/actions/fetchPaperBalanceAction";
import { ibmPlexMono } from "@/lib/font";

const USDC_ADDRESS = process.env.USDC_ADDRESS as `0x${string}`;

type Side = "LONG" | "SHORT";

type Props = {
  className?: string;
  disabled?: boolean;
  rawAmount: string;
  amount: string;
  symbol?: string;
  side: Side;
  leverage: number;
  markPrice: number;
  btcAmount: number;
  autoProtect: boolean;
  fundSource: FundSource;
  onComplete?: (info: { orderId?: string }) => void;
};

export default function TransferAndPerpButton({
  className,
  disabled,
  rawAmount,
  amount,
  symbol = "BTC",
  side,
  leverage,
  markPrice,
  btcAmount,
  autoProtect,
  fundSource,
  onComplete,
}: Props) {
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [pending, startTransition] = React.useTransition();
  const publicClient = usePublicClient();
  const { execute: executeHLTransfer, isPending: hlPending } = useHLTransfer();

  const { data: rawBalance } = useReadContract({
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && fundSource === "wallet" },
  });

  const { balance: hlBalance } = useHLBalance(
    fundSource === "hl-balance" ? address : undefined
  );

  // Paper mode (v2 item P4): GET /api/paper/balance replaces the on-chain
  // USDC read / useHLBalance while fundSource === "paper".
  const [paperBalance, setPaperBalance] = React.useState(0);
  React.useEffect(() => {
    if (fundSource !== "paper" || !address) return;
    let canceled = false;
    fetchPaperBalanceAction(address).then((res) => {
      if (!canceled) setPaperBalance(res?.balance_usd ?? 0);
    });
    return () => { canceled = true; };
  }, [fundSource, address]);

  const walletBalance = rawBalance != null ? Number(formatUnits(rawBalance, 6)) : 0;
  const hyperliquidBalance = hlBalance != null ? Number(hlBalance) : 0;
  const availableBalance =
    fundSource === "wallet" ? walletBalance :
    fundSource === "hl-balance" ? hyperliquidBalance :
    paperBalance;

  // Helpers
  async function transferUSDC(to: string, amountUi: string) {
    if (!address || !walletClient || !publicClient) {
      throw new Error("Wallet not connected");
    }

    const NATIVE_USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

    const decimals = 6;
    const amt = parseUnits(amountUi, decimals);

    // Default to a safe limit (Arbitrum transfers are cheap, ~200k-500k is plenty safe)
    let gasLimit = BigInt(1000000);

    try {
      // 2. Try to estimate gas for precision
      const estimatedGas = await publicClient.estimateContractGas({
        account: address,
        address: NATIVE_USDC,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to as `0x${string}`, amt],
      });

      // Add a 20% buffer if estimation succeeds
      gasLimit = (estimatedGas * BigInt(120)) / BigInt(100);
      console.log("Gas estimation succeeded:", gasLimit.toString());

    } catch (err) {
      // 3. If estimation fails, log it but DON'T crash. Use the fallback.
      console.warn("Gas estimation failed, falling back to safe default.", err);
    }

    // 4. Send the transaction with the resolved gas limit
    const hash = await walletClient.writeContract({
      address: NATIVE_USDC,
      abi: erc20Abi,
      functionName: "transfer",
      args: [to as `0x${string}`, amt],
      chain: arbitrum,
      gas: gasLimit, // Uses either the accurate estimate OR the safe fallback
    });

    return hash;
  }
  // Main click handler
  const onClick = () =>
    startTransition(async () => {
      try {
        // Basic validations
        if (!isConnected || !address) {
          toast.error("Connect wallet to continue");
          return;
        }
        if (!walletClient) {
          toast.error("Wallet not ready");
          return;
        }
        if (chain?.id !== arbitrum.id) {
          toast.error("Switch to Arbitrum One network");
          return;
        }
        if (!(Number(rawAmount) > 0)) {
          toast.error("Enter a valid amount");
          return;
        }
        if (Number(rawAmount) < 11) {
          toast.error("Minimum amount is 12 USDC");
          return;
        }
        // if (Number(amount) > availableBalance) {
        //   toast.error("Insufficient balance");
        //   return;
        // }

        // const temporalWallet =
        //   side === "SHORT"
        //     ? process.env.NEXT_PUBLIC_TEMPORAL_WALLET_SHORT
        //     : process.env.NEXT_PUBLIC_TEMPORAL_WALLET_LONG;

        // if (!temporalWallet) {
        //   toast.error("Temporal wallet not configured");
        //   return;
        // }

        // ──── Wallet transfer steps skipped, calling BE directly ────
        // // ──── Fund source branching ────
        // if (fundSource === "hl-balance") {
        //   // HL Balance flow: EIP-712 sign + broadcast usdSend
        //   const step1 = toast.loading("Signing HL transfer request…");
        //   try {
        //     await executeHLTransfer(amount, temporalWallet, address);
        //     toast.success("HL transfer successful", { id: step1 });
        //   } catch (err: any) {
        //     const isUserRejection = err.message?.includes("User rejected") || err.message?.includes("User denied");
        //     const isInsufficientBalance = err.message?.includes("Insufficient balance");
        //     const title = isUserRejection ? "Transaction cancelled" : (isInsufficientBalance ? "Insufficient balance" : "HL transfer failed");
        //     toast.error(title, {
        //       id: step1,
        //       description: isUserRejection ? "User rejected the request" : err.message,
        //     });
        //     return;
        //   }
        // } else {
        //   // Wallet flow: ERC-20 USDC transfer
        //   const step1 = toast.loading("Transferring USDC to Temporal wallet…");
        //   let txHash: string | undefined;

        //   try {
        //     txHash = await transferUSDC(temporalWallet, amount);
        //     toast.success("USDC transfer submitted", {
        //       id: step1,
        //       description: (
        //         <a
        //           href={`https://arbiscan.io/tx/${txHash}`}
        //           target="_blank"
        //           rel="noreferrer"
        //           className="underline"
        //         >
        //           View on Arbiscan
        //         </a>
        //       ),
        //     });
        //   } catch (err: any) {
        //     const isUserRejection = err.message?.includes("User rejected") || err.message?.includes("User denied");
        //     toast.error(isUserRejection ? "Transaction cancelled" : "USDC transfer failed", {
        //       id: step1,
        //       description: isUserRejection ? "User rejected the request" : err.message,
        //     });
        //     return;
        //   }
        // }

        // Call backend directly - wallet transfer steps skipped
        const step2 = toast.loading("Creating position on backend…");
        const backendRes = await createPerpPositionAction({
          token: symbol,
          perpType: side,
          market: `${symbol}-PERP`,
          usdcAmount: Number(amount),
          leverage: leverage,
          markPrice: markPrice,
          btcAmount: btcAmount,
          autoProtect: autoProtect,
          userWallet: address,
          wallet_type: fundSource === "hl-balance" ? "hyperliquid" : "temporal",
        });

        if (backendRes?.id) {
          toast.success(`${symbol}-PERP position saved`, {
            id: step2,
            description: (
              <div className="text-xs text-gray-400">
                Recorded successfully.
              </div>
            ),
          });
          onComplete?.({ orderId: backendRes.id });
        } else {
          toast.error("Backend record failed", {
            id: step2,
            description: "Unknown error",
          });
        }
      } catch (err: unknown) {
        console.error("  Unexpected error:", err);
        toast.error("Transaction failed", {
          description: err instanceof Error ? err.message : String(err),
        });
      }
    });

  return (
    <Button
      className={className ?? "w-1/2"}
      disabled={pending || hlPending || disabled || !rawAmount || Number(rawAmount) <= 0}
      onClick={onClick}
    >
      <span className={`text-[#F1F1F1] text-xs font-semibold tracking-widest ${ibmPlexMono.className}`}>
        {pending ? "PROCESSING…" : "CREATE POSITION"}
      </span>
    </Button>
  );
}

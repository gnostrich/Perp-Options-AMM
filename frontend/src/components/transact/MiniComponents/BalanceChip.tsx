"use client";

import { useEffect, useCallback, useState } from "react";
import { useBlockNumber, useReadContract } from "wagmi";
import { useAccount } from "@/lib/hooks/useAccount";
import { erc20Abi, formatUnits } from "viem";
import { ibmPlexMono } from "@/lib/font";
import { Skeleton } from "@/components/ui/skeleton";
import { useTradeStore } from "@/store/tradeStore";
import { useHLBalance } from "@/lib/hooks/useHLBalance";
import { fetchPaperBalanceAction } from "@/app/actions/fetchPaperBalanceAction";

const NATIVE_USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

interface BalanceChipProps {
  onClick?: (balance: string) => void;
}

export default function BalanceChip({ onClick }: BalanceChipProps) {
  const { address, isConnected } = useAccount();
  const fundSource = useTradeStore(state => state.fundSource);

  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data: rawBalance, isLoading: isWalletLoading, refetch: refetchWallet } = useReadContract({
    address: NATIVE_USDC as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && fundSource === "wallet" },
  });

  const { balance: hlBalance, isLoading: isHlLoading, refetch: refetchHl } = useHLBalance(
    fundSource === "hl-balance" ? address : undefined
  );

  // Paper mode (v2 item P4): GET /api/paper/balance replaces the on-chain
  // USDC read / useHLBalance while fundSource === "paper".
  const [paperBalance, setPaperBalance] = useState<number | null>(null);
  const [isPaperLoading, setIsPaperLoading] = useState(false);

  const refetchPaper = useCallback(async () => {
    if (fundSource !== "paper" || !address) return;
    setIsPaperLoading(true);
    try {
      const res = await fetchPaperBalanceAction(address);
      setPaperBalance(res?.balance_usd ?? null);
    } finally {
      setIsPaperLoading(false);
    }
  }, [fundSource, address]);

  useEffect(() => {
    void refetchPaper();
  }, [refetchPaper]);

  // Refetch every ~40 blocks (~10s on Arbitrum)
  useEffect(() => {
    if (blockNumber != null && Number(blockNumber) % 40 === 0) {
      if (fundSource === "wallet") {
        refetchWallet();
      } else if (fundSource === "hl-balance") {
        refetchHl();
      } else {
        void refetchPaper();
      }
    }
  }, [blockNumber, refetchWallet, refetchHl, refetchPaper, fundSource]);

  const walletBalanceFormatted = rawBalance != null ? Number(formatUnits(rawBalance, 6)).toFixed(2) : "—";
  const hlBalanceFormatted = hlBalance != null ? Number(hlBalance).toFixed(2) : "—";
  const paperBalanceFormatted = paperBalance != null ? paperBalance.toFixed(2) : "—";

  const balance =
    fundSource === "wallet" ? walletBalanceFormatted :
    fundSource === "hl-balance" ? hlBalanceFormatted :
    paperBalanceFormatted;
  const loading = fundSource === "wallet" ? isWalletLoading : fundSource === "hl-balance" ? isHlLoading : isPaperLoading;

  const isDisabled = loading || balance === "—" || Number(balance) === 0;

  return (
    <div className={`text-white ${ibmPlexMono.className} flex flex-col items-end tracking-widest`}>
      <div className="text-2xs px-1 font-medium">USDC</div>
      {loading ? (
        <Skeleton className="h-3.5 w-20 bg-gray-700 rounded" />
      ) : (
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => {
            if (!isDisabled && onClick && balance !== "—") {
              onClick(balance);
            }
          }}
          className={`rounded-sm py-1 px-1 text-[#C7B7A5] ${ibmPlexMono.className}
            uppercase tracking-wider leading-none text-2xs
            disabled:opacity-60 border-0
            bg-transparent hover:bg-gray-700  hover:text-white transition-colors duration-200`}
        >
          Max: {balance}
        </button>
      )}
    </div>
  );
}

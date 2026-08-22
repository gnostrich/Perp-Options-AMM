"use client";

import { useAccount as useWagmiAccount } from "wagmi";
import { useDemoAccountStore } from "@/store/demoAccountStore";

/**
 * Drop-in replacement for wagmi's useAccount that also recognizes an active
 * demo (key-based paper) identity. Every callsite that reads {address,
 * isConnected} for trade/earn/portfolio flows should import useAccount from
 * here instead of "wagmi" so the demo identity flows through unchanged.
 *
 * A real wallet connection always wins: the demo address only surfaces
 * when wagmi itself reports disconnected. `isDemo` lets the connect UI
 * (the only place that needs to know) branch its own rendering.
 */
export function useAccount() {
  const wagmiAccount = useWagmiAccount();
  const demoAddress = useDemoAccountStore((s) => (s.active ? s.address : null));

  if (wagmiAccount.isConnected || !demoAddress) {
    return { ...wagmiAccount, isDemo: false as const };
  }

  return {
    ...wagmiAccount,
    address: demoAddress,
    isConnected: true as const,
    isConnecting: false as const,
    isReconnecting: false as const,
    isDisconnected: false as const,
    status: "connected" as const,
    isDemo: true as const,
  };
}

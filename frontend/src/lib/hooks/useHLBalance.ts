"use client";

import { useQuery } from "@tanstack/react-query";

const HYPERLIQUID_API_URL = "https://api.hyperliquid.xyz/info";

async function fetchHLBalance(userAddress: string): Promise<string> {
  const response = await fetch(HYPERLIQUID_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "clearinghouseState",
      user: userAddress,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.withdrawable || "0.0";
}

export function useHLBalance(userAddress?: string) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["hlBalance", userAddress],
    queryFn: () => fetchHLBalance(userAddress as string),
    enabled: !!userAddress,
    refetchInterval: 10000, 
  });

  return { balance: data, isLoading, refetch };
}

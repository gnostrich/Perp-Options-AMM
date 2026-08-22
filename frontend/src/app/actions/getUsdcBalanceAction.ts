"use server";

import { getUsdcBalance } from "@/lib/data/blockchain/balance";

export async function getUsdcBalanceAction(address: `0x${string}`) {
  return getUsdcBalance(address);
}


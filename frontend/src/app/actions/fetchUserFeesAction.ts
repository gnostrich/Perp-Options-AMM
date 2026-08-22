"use server";

import { Hyperliquid } from "hyperliquid";

export type HyperliquidUserFees = {
  userCrossRate: number;
  userAddRate: number;
};

// Module-level SDK initialization once, reused across calls
let sdkInstance: Hyperliquid | null = null;

function getSDK(): Hyperliquid {
  if (!sdkInstance) {
    sdkInstance = new Hyperliquid({ enableWs: false });
  }
  return sdkInstance;
}

export async function fetchUserFeesAction(
  userAddress: string
): Promise<HyperliquidUserFees | null> {
  try {
    if (!userAddress) return null;

    const sdk = getSDK();
    const fees = await sdk.info.userFees(userAddress);

    const userCrossRate = Number((fees as any)?.userCrossRate);
    const userAddRate = Number((fees as any)?.userAddRate);

    if (!Number.isFinite(userCrossRate) || !Number.isFinite(userAddRate)) {
      return null;
    }

    return { userCrossRate, userAddRate };
  } catch (error) {
    console.error("Error fetching Hyperliquid user fees:", error);
    return null;
  }
}


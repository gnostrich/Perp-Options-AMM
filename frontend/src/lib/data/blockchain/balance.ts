/**
 * Blockchain Data Layer
 * Handles fetching data from the blockchain
 */

import { createPublicClient, http, formatUnits } from "viem";
import { arbitrum } from "viem/chains";
import { erc20Abi } from "viem";

const USDC_ADDRESS = process.env.USDC_ADDRESS as `0x${string}`;

/**
 * Gets the USDC balance for a given address
 */
export async function getUsdcBalance(
  address: `0x${string}`
): Promise<{ ok: true; balance: number; raw: string } | { ok: false; error: string }> {
  try {
    const client = createPublicClient({
      chain: arbitrum,
      transport: http(),
    });

    const balance = await client.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });

    const formatted = formatUnits(balance, 6);

    return {
      ok: true,
      balance: Number(formatted),
      raw: balance.toString(),
    };
  } catch (err) {
    console.error("Error fetching USDC balance:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}


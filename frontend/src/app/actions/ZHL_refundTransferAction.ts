"use server";

import { ethers } from "ethers";

export async function refundTransferAction({
  side,
  amountUi,
  userWallet,
}: {
  side: "LONG" | "SHORT";
  amountUi: string;
  userWallet: string;
}) {
  const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL);
  const usdcAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

  try {
    if (!userWallet || !userWallet.startsWith("0x"))
      throw new Error("Invalid user wallet address");
    if (!amountUi || Number(amountUi) <= 0)
      throw new Error("Invalid refund amount");

    const privateKey =
      side === "SHORT"
        ? process.env.PRIVATE_KEY_SHORT
        : process.env.PRIVATE_KEY_LONG;

    if (!privateKey)
      throw new Error(`Temporal private key not found for ${side}`);

    const wallet = new ethers.Wallet(privateKey, provider);
    const signerAddress = await wallet.getAddress();

    console.log(
      `🔁 Initiating refund of ${amountUi} USDC from ${signerAddress} (${side}) → ${userWallet}`
    );

    const usdc = new ethers.Contract(
      usdcAddress,
      ["function transfer(address to, uint256 amount) returns (bool)"],
      wallet
    );

    const amount = ethers.parseUnits(amountUi, 6);

    const tx = await usdc.transfer(userWallet, amount);
    console.log("Refund TX submitted:", tx.hash);

    const receipt = await tx.wait();
    if (receipt.status !== 1) {
      console.error("Refund TX failed on-chain:", receipt);
      return {
        ok: false,
        error: "Refund transaction reverted",
        hash: tx.hash,
      };
    }

    console.log("  Refund successful:", tx.hash);
    return { ok: true, hash: tx.hash };
  } catch (err: unknown) {
    console.error("  Refund attempt error:", err);
    let message = "Unknown error during refund";

    if (err instanceof Error) message = err.message;
    else if (typeof err === "string") message = err;

    return { ok: false, error: message };
  }
}

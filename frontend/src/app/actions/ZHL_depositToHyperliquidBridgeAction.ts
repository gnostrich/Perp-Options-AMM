"use server";

import { ethers } from "ethers";

export async function depositToHyperliquidBridge({
  side,
  amountUi,
}: {
  side: "LONG" | "SHORT";
  amountUi: string;
}) {
  const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL);
  const bridgeAddress = "0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7";
  const usdcAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

  try {
    if (!amountUi || Number(amountUi) <= 0) throw new Error("Invalid amount");

    const privateKey =
      side === "SHORT"
        ? process.env.PRIVATE_KEY_SHORT
        : process.env.PRIVATE_KEY_LONG;

    if (!privateKey) {
      throw new Error(`Missing private key for ${side} wallet`);
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const signerAddress = await wallet.getAddress();

    const network = await provider.getNetwork();
    if (Number(network.chainId) !== 42161) {
      throw new Error(
        `Connected to wrong chain (${network.name}), expected Arbitrum One`
      );
    }

    const usdc = new ethers.Contract(
      usdcAddress,
      ["function transfer(address to, uint256 amount) returns (bool)"],
      wallet
    );

    const amount = ethers.parseUnits(amountUi, 6);
    console.log(
      `Transferring ${amountUi} USDC from ${signerAddress} (${side}) → ${bridgeAddress}`
    );

    const tx = await usdc.transfer(bridgeAddress, amount);
    console.log("Submitted TX:", tx.hash);

    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      console.error("  Transaction failed on-chain:", receipt);
      return {
        ok: false,
        error: "Transaction reverted on-chain",
        hash: tx.hash,
      };
    }

    console.log("  Deposit successful:", tx.hash);
    return { ok: true, hash: tx.hash };
  } catch (err: any) {
    console.error("  Bridge deposit error:", err);

    let message = "Unknown error";
    if (err?.code === "INSUFFICIENT_FUNDS") {
      message = "Insufficient ETH for gas fees";
    } else if (err?.reason?.includes("transfer amount exceeds balance")) {
      message = "Insufficient USDC balance in Temporal wallet";
    } else if (err?.message?.includes("network error")) {
      message = "Could not connect to Arbitrum RPC";
    } else if (err?.message?.includes("invalid sender")) {
      message = "Private key may not match funded wallet";
    } else if (err instanceof Error) {
      message = err.message;
    }

    return { ok: false, error: message };
  }
}

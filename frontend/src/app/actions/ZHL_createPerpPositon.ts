"use server";

import { Hyperliquid } from "hyperliquid";

// Utility helpers
const alignToTick = (price: number, tick: number): number =>
  Math.round(price / tick) * tick;

const inferTickSizeFromImpact = (impactPx: number): number => {
  const decimals = (impactPx.toString().split(".")[1]?.length ?? 0);
  return decimals > 1 ? 0.1 : 1;
};

// Main action
export async function createPerpPosition({
  token,
  perpType,
  market,
  usdcAmount,
  leverage,
  userWallet,
}: {
  token: string;
  perpType: "LONG" | "SHORT";
  market: string;
  usdcAmount: number;
  leverage: number;
  userWallet: string;
}) {
  try {
    const privateKey =
      perpType === "SHORT"
        ? process.env.PRIVATE_KEY_SHORT
        : process.env.PRIVATE_KEY_LONG;

    if (!privateKey)
      throw new Error(
        `Missing ${perpType === "SHORT" ? "PRIVATE_KEY_SHORT" : "PRIVATE_KEY_LONG"
        }`
      );

    const sdk = new Hyperliquid({
      privateKey,
      testnet: false,
      enableWs: false,
    });

    const coin = market || "BTC-PERP";
    const isBuy = perpType === "LONG";

    // Fetch meta + context + OI info 
    const [meta, ctxs] = await sdk.info.perpetuals.getMetaAndAssetCtxs();
    const oiCap = await sdk.info.perpetuals.getPerpsAtOpenInterestCap();

    const i = meta.universe.findIndex((u) => u.name === coin);
    const ctx = ctxs[i];
    if (!ctx) throw new Error(`No context found for ${coin}`);

    const isCapped = oiCap?.some((p: any) => p.asset === i);
    const markPrice = Number(ctx.markPx);
    if (!markPrice || isNaN(markPrice))
      throw new Error(`Invalid mark price for ${coin}`);

    console.log("Mark Price:", markPrice, "Capped:", isCapped);

    // Base size alignment 
    const szDecimals = meta.universe[i]?.szDecimals ?? 3;
    const lotStep = Number((1 / Math.pow(10, szDecimals)).toFixed(szDecimals));

    const baseSizeRaw = usdcAmount / markPrice;
    const baseSize = Math.floor(baseSizeRaw / lotStep) * lotStep;
    if (baseSize < lotStep)
      throw new Error(`Order too small. Minimum: ${lotStep}`);

    // Tick alignment 
    // const pxDecimals = meta.universe[i]?.pxDecimals ?? 0;
    // const tickSize = Number((1 / Math.pow(10, pxDecimals)).toFixed(pxDecimals));


    const tick = inferTickSizeFromImpact(Number(ctx.impactPxs[1]));
    let limit_px = alignToTick(
      Number(isBuy ? ctx.impactPxs[1] : ctx.impactPxs[0]),
      tick
    );

    // Oracle deviation + OI-cap clamps 
    const deviation = isCapped ? 0.009 : 0.045; // ±0.9% (capped) or ±4.5%
    const maxBuy = markPrice * (1 + deviation);
    const minSell = markPrice * (1 - deviation);
    if (isBuy && limit_px > maxBuy) limit_px = maxBuy;
    if (!isBuy && limit_px < minSell) limit_px = minSell;
    limit_px = alignToTick(limit_px, tick); // final tick alignment

    // Build order 
    const tif = "Gtc" as const;
    const order = {
      coin,
      is_buy: isBuy,
      sz: Number(baseSize.toFixed(szDecimals)),
      limit_px,
      order_type: { limit: { tif } },
      reduce_only: false,
    };

    console.log("🟢 Order payload:", order);

    // Place order 
    let res = await sdk.exchange.placeOrder(order);
    let status = res.response?.data?.statuses?.[0];

    // Auto-retry for common engine rejections 
    if (
      status?.error?.includes("Price too far from oracle") ||
      status?.error?.includes("more aggressive than oracle") ||
      status?.error?.includes("invalid price")
    ) {
      console.warn("⚠️ Retrying with oracle-safe tick-aligned price...");
      const retryPx = isBuy
        ? alignToTick(markPrice * 1.004, tick)
        : alignToTick(markPrice * 0.996, tick);
      order.limit_px = retryPx;

      res = await sdk.exchange.placeOrder(order);
      status = res.response?.data?.statuses?.[0];
    }

    if (status?.error) throw new Error(status.error);

    const oid =
      status?.resting?.oid ??
      status?.filled?.oid ??
      "unknown";

    console.log("Status:", status);

    return {
      ok: true,
      data: {
        id: oid,
        token,
        perpType,
        market,
        usdcAmount,
        leverage,
        markPrice,
        baseSize,
        userWallet,
        btcAmount: Number(baseSize.toFixed(szDecimals)),
        createdAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    console.error("  Hyperliquid order error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

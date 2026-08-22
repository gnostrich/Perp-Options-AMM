import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatAddress = (addr: string | undefined) => {
  if (!addr || addr.length < 10) {
    throw new Error("Invalid wallet address");
  }
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

/** Half-spread, as bps of premium: Dials.Spread × the curve's OWN δ (δ/2 IS the
 *  ladder's touch offset, docs/OB_LOGIC.md §2.2). `delta` MUST be the curve's
 *  EFFECTIVE δ (amm/lp/discretise.go's `effDelta`, §2.3a — pricer.ts's `effDelta`
 *  port), never the bare budget constant — a thin LP's book actually fans at the
 *  widened δ, and "a supervision reading must see the spread the LP actually
 *  quotes, not the budget it was solved from" (the Go TouchHalfSpread docstring's
 *  own rule, applied here). No default: every caller must consciously supply it. */
export const halfSpreadBps = (spread: number, delta: number) => (delta * spread * 10000) / 2;

// Side grammar, from the transact panel's SELL/BUY section chips
// (TradeInsuranceComponent): bids are where the trader SELLS (maroon), asks where
// the trader BUYS (navy). Green/red are reserved for the call/put wings.
export const SELL_BG = "#523C4C";
export const SELL_ACCENT = "#935A71";
export const BUY_BG = "#212A41";
export const BUY_ACCENT = "#40517E";

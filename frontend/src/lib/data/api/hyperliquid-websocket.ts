import { WebSocketClient, type WebSocketCallbacks } from "./websocket";
import type { CandleData, CandleResolution } from "../market/hyperliquid";
import dayjs from "dayjs";

const HYPERLIQUID_WS_URL = "wss://api.hyperliquid.xyz/ws";
// const HYPERLIQUID_WS_TESTNET_URL = "wss://api.hyperliquid-testnet.xyz/ws";

// Map resolution format to Hyperliquid's format
const resolutionMap: Record<CandleResolution, string> = {
  "5m": "5m",
  "15m": "15m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1d",
  "1w": "1w",
  "1M": "1M",
};

interface HyperliquidCandleRaw {
  t: number; // time in milliseconds
  o: string; // open
  h: string; // high
  l: string; // low
  c: string; // close
  v: string; // volume
}

interface HyperliquidCandleMessage {
  channel: string;
  data?: HyperliquidCandleRaw | HyperliquidCandleRaw[];
}

/**
 * Converts coin symbol from "BTC-PERP" format to "BTC" format
 */
function convertCoinSymbol(coin: string): string {
  // Remove "-PERP" suffix if present
  return coin.replace(/-PERP$/, "");
}

/**
 * Maps resolution to Hyperliquid's format
 */
function mapResolution(resolution: CandleResolution): string {
  return resolutionMap[resolution] || resolution;
}

/**
 * Transforms a single Hyperliquid candle to CandleData format
 */
function transformHyperliquidCandle(raw: HyperliquidCandleRaw): CandleData {
  return {
    time: raw.t,
    open: parseFloat(raw.o),
    high: parseFloat(raw.h),
    low: parseFloat(raw.l),
    close: parseFloat(raw.c),
    volume: parseFloat(raw.v),
    formattedTime: dayjs(raw.t).format("DD MMM HH:mm"),
  };
}

/**
 * Deduplicates candles by timestamp, keeping the latest value for each timestamp
 * Returns sorted array in ascending order by time
 */
export function deduplicateCandlesByTime(candles: CandleData[]): CandleData[] {
  const candleMap = new Map<number, CandleData>();
  
  // Keep the last candle for each timestamp
  candles.forEach(candle => {
    candleMap.set(candle.time, candle);
  });
  
  // Convert back to array and sort by time ascending
  return Array.from(candleMap.values()).sort((a, b) => a.time - b.time);
}

/**
 * Transforms Hyperliquid snapshot (array of candles) to CandleData array
 */
function transformHyperliquidSnapshot(data: HyperliquidCandleRaw[]): CandleData[] {
  // Deduplication will happen at the component level before passing to chart
  return data.map(transformHyperliquidCandle);
}

/**
 * Creates a WebSocket connection to Hyperliquid for candle data
 */
export function createHyperliquidCandleWebSocket(
  coin: string = "BTC",
  interval: CandleResolution = "1h",
  callbacks: {
    onSnapshot?: (candles: CandleData[]) => void;
    onCandleUpdate?: (candle: CandleData) => void;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onStateChange?: (state: "connecting" | "connected" | "disconnected" | "error") => void;
  }
): WebSocketClient {
  const url = HYPERLIQUID_WS_URL;
  const hyperliquidCoin = convertCoinSymbol(coin);
  const hyperliquidInterval = mapResolution(interval);

  let subscriptionSent = false;
  let clientRef: WebSocketClient | null = null;

  const subscribeMessage = {
    method: "subscribe",
    subscription: {
      type: "candle",
      coin: hyperliquidCoin,
      interval: hyperliquidInterval,
    },
  };
  
  console.log(`[WebSocket] Subscribing to candles: coin=${hyperliquidCoin}, interval=${hyperliquidInterval}`);

  const wsCallbacks: WebSocketCallbacks = {
    onMessage: (message: unknown) => {
      try {
        const msg = message as HyperliquidCandleMessage;

        // Handle candle channel messages
        if (msg.channel === "candle") {
          // Snapshot format: data is an array
          if (Array.isArray(msg.data)) {
            const candles = transformHyperliquidSnapshot(msg.data);
            callbacks.onSnapshot?.(candles);
          }
          // Update format: data is a single object
          else if (msg.data && typeof msg.data === "object" && !Array.isArray(msg.data)) {
            const candle = transformHyperliquidCandle(msg.data as HyperliquidCandleRaw);
            callbacks.onCandleUpdate?.(candle);
          }
        }
      } catch (error) {
        console.error("Failed to parse Hyperliquid candle message:", error);
        callbacks.onError?.(new Error("Failed to parse candle message"));
      }
    },
    onError: callbacks.onError,
    onConnect: () => {
      // Send subscription message after connection is established
      if (!subscriptionSent && clientRef) {
        // Small delay to ensure connection is fully ready
        setTimeout(() => {
          if (clientRef && clientRef.isConnected()) {
            clientRef.send(subscribeMessage);
            subscriptionSent = true;
          }
        }, 100);
      }
      callbacks.onConnect?.();
    },
    onDisconnect: () => {
      subscriptionSent = false;
      callbacks.onDisconnect?.();
    },
    onStateChange: (state) => {
      callbacks.onStateChange?.(state);
    },
  };

  const client = new WebSocketClient(url, wsCallbacks);
  clientRef = client;
  
  client.connect();
  return client;
}

/**
 * Interface for Hyperliquid allMids message
 */
interface HyperliquidAllMidsMessage {
  channel: string;
  data?: {
    mids: Record<string, string>;
  };
}

/**
 * Creates a WebSocket connection to Hyperliquid for live mid prices (mark prices)
 * Subscribes to allMids channel which provides real-time mid prices for all assets
 * @param coin - The coin to monitor (e.g., "BTC")
 * @param callbacks - Callbacks for price updates and connection events
 * @returns WebSocketClient instance
 */
export function createHyperliquidMidPriceWebSocket(
  coin: string = "BTC",
  callbacks: {
    onMidPriceUpdate?: (price: number) => void;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onStateChange?: (state: "connecting" | "connected" | "disconnected" | "error") => void;
  }
): WebSocketClient {
  const url = HYPERLIQUID_WS_URL;
  const hyperliquidCoin = convertCoinSymbol(coin);

  let subscriptionSent = false;
  let clientRef: WebSocketClient | null = null;

  const subscribeMessage = {
    method: "subscribe",
    subscription: {
      type: "allMids",
    },
  };
  
  console.log(`[WebSocket] Subscribing to allMids for coin: ${hyperliquidCoin}`);

  const wsCallbacks: WebSocketCallbacks = {
    onMessage: (message: unknown) => {
      try {
        const msg = message as HyperliquidAllMidsMessage;

        // Handle allMids channel messages
        if (msg.channel === "allMids" && msg.data?.mids) {
          const midPrice = msg.data.mids[hyperliquidCoin];
          
          if (midPrice) {
            const price = parseFloat(midPrice);
            
            if (Number.isFinite(price) && price > 0) {
              callbacks.onMidPriceUpdate?.(price);
            } else {
              console.warn(`Invalid mid price for ${hyperliquidCoin}: ${midPrice}`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse Hyperliquid allMids message:", error);
        callbacks.onError?.(new Error("Failed to parse allMids message"));
      }
    },
    onError: callbacks.onError,
    onConnect: () => {
      // Send subscription message after connection is established
      if (!subscriptionSent && clientRef) {
        // Small delay to ensure connection is fully ready
        setTimeout(() => {
          if (clientRef && clientRef.isConnected()) {
            clientRef.send(subscribeMessage);
            subscriptionSent = true;
          }
        }, 100);
      }
      callbacks.onConnect?.();
    },
    onDisconnect: () => {
      subscriptionSent = false;
      callbacks.onDisconnect?.();
    },
    onStateChange: (state) => {
      callbacks.onStateChange?.(state);
    },
  };

  const client = new WebSocketClient(url, wsCallbacks);
  clientRef = client;
  
  client.connect();
  return client;
}

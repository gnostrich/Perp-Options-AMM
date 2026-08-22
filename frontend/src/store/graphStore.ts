import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CandleData, CandleResolution } from "@/lib/data";
import {
  transformGraphData,
  type WebSocketClient,
} from "@/lib/data/api/websocket";
import { createDataSseStream, type StreamClient } from "@/lib/data/api/stream-client";
import { createHyperliquidCandleWebSocket, createHyperliquidMidPriceWebSocket, deduplicateCandlesByTime } from "@/lib/data/api/hyperliquid-websocket";
import { fetchCandleSnapshotFallback } from "@/lib/data/market/hyperliquid-client";
import { toast } from "sonner";

type GraphPoint = {
  price: number;
  equityWithoutInsurance: number;
  equityWithInsurance: number;
};

/** A dotted overlay curve (LP-preview or trade-impact), same % grid as GraphPoint (v2 §8 B.1/B.2). */
export type OverlayPoint = { price: number; call: number; put: number };
export type OverlayKind = "lp-preview" | "trade-impact" | null;

type BandValues = {
  finalSellFrom?: number;
  finalSellTo?: number;
  finalBuyFrom?: number;
  finalBuyTo?: number;
};

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

type GraphStore = {
  graphData: GraphPoint[] | null;
  marketGraphData: CandleData[] | null;
  loading: boolean;
  retryAttempt: number;
  currentMarkPrice: number;
  liquidationThreshold: number;
  selectedGraph: string;
  bandValues: BandValues;
  wsClient: StreamClient | null;
  connectionState: ConnectionState;
  dataWsLastFailureAt: number | null;
  hyperliquidWsClient: WebSocketClient | null;
  hyperliquidConnectionState: ConnectionState;
  hyperliquidCurrentCoin: string | null;
  hyperliquidCurrentInterval: CandleResolution | null;
  hyperliquidMidPriceWsClient: WebSocketClient | null;
  hyperliquidMidPriceConnectionState: ConnectionState;
  hyperliquidMidPriceCoin: string | null;
  setBandValues: (v: BandValues) => void;
  connectDataWebSocket: () => void;
  retryDataWebSocket: () => void;
  disconnectDataWebSocket: () => void;
  connectHyperliquidCandleWebSocket: (coin: string, interval: CandleResolution) => void;
  disconnectHyperliquidCandleWebSocket: () => void;
  connectHyperliquidMidPriceWebSocket: (coin: string) => void;
  disconnectHyperliquidMidPriceWebSocket: () => void;
  loadMarketGraphData: (
    symbol?: string,
    resolution?: CandleResolution
  ) => Promise<void>;
  setCurrentMarkPrice: (price: number) => void;
  setLiquidationThreshold: (threshold: number) => void;
  setSelectedGraph: (graph: string) => void;
  resolution: CandleResolution;
  setResolution: (r: CandleResolution) => void;

  /* ─── Overlay slice (v2 item 17) — dotted LP-preview / trade-impact curve.
     Deliberately minimal: two fields + set/clear, no interaction with graphData. */
  overlayCurve: OverlayPoint[] | null;
  overlayKind: OverlayKind;
  setOverlayCurve: (points: OverlayPoint[], kind: Exclude<OverlayKind, null>) => void;
  clearOverlay: () => void;
};

export const useGraphStore = create<GraphStore>()(
  persist(
    (set, get) => ({
      graphData: null,
      marketGraphData: null,
      loading: false,
      retryAttempt: 0,
      wsClient: null,
      connectionState: "disconnected" as ConnectionState,
      dataWsLastFailureAt: null,
      hyperliquidWsClient: null,
      hyperliquidConnectionState: "disconnected" as ConnectionState,
      hyperliquidCurrentCoin: null,
      hyperliquidCurrentInterval: null,
      hyperliquidMidPriceWsClient: null,
      hyperliquidMidPriceConnectionState: "disconnected" as ConnectionState,
      hyperliquidMidPriceCoin: null,

      currentMarkPrice: 100000,
      liquidationThreshold: 0.69,
      selectedGraph: "PerpGraph",
      resolution: "1d",
      bandValues: {},

      // ─── Actions ─────────────────────────────────────────────
      connectDataWebSocket: () => {
        const state = get();

        // Prevent connection flood when server is unreachable.
        // If we're in error state, require explicit retry (or wait for cooldown).
        const cooldownMs = 10_000;
        const now = Date.now();
        const inCooldown =
          state.dataWsLastFailureAt != null && now - state.dataWsLastFailureAt < cooldownMs;
        
        // Prevent multiple simultaneous connection attempts
        if (
          state.connectionState === "connecting" ||
          state.connectionState === "connected" ||
          state.connectionState === "error" ||
          inCooldown
        ) {
          // Already connecting or connected, don't create another connection
          return;
        }

        // Check if already connected
        const existingClient = state.wsClient;
        if (existingClient && existingClient.isConnected()) {
          // Already connected, update state
          set({ connectionState: "connected" });
          return;
        }

        // Disconnect existing connection if any (but not connected)
        if (existingClient) {
          existingClient.disconnect();
        }

        set({ loading: true, connectionState: "connecting" });

        let incompleteDataTimeout: NodeJS.Timeout | null = null;

        const client = createDataSseStream({
          onInitialData: (data) => {
            // Transform and set graph data
            const graphData = transformGraphData(data);
            
            if (graphData === null) {
              console.warn("Received incomplete market_data (missing AMM trees). Waiting for complete data...");
              if (!incompleteDataTimeout) {
                incompleteDataTimeout = setTimeout(() => {
                  console.error("Timeout: Did not receive complete AMM tree data after 10 seconds.");
                }, 10000);
              }
              // Still update oracle price if present
              if (data.oracle_price) {
                set({ currentMarkPrice: data.oracle_price });
              }
              return;
            }

            if (incompleteDataTimeout) {
              clearTimeout(incompleteDataTimeout);
              incompleteDataTimeout = null;
            }

            set({ 
              graphData, 
              currentMarkPrice: data.oracle_price, 
              loading: false,
              connectionState: "connected",
              dataWsLastFailureAt: null,
            });
          },
          onUpdate: (data) => {
            // Handle update messages - the server will send fresh data when needed
            console.log("Graph data update received:", data.event);
            // Don't disconnect/reconnect on every update - let the WebSocket handle it
            // If the server needs to send fresh data, it can send a new initial message
          },
          onError: (error) => {
            console.error("WebSocket error:", error);
            set({ loading: false, connectionState: "error", dataWsLastFailureAt: Date.now() });
          },
          onConnect: () => {
            console.log("Graph data WebSocket connected");
            set({ connectionState: "connected", dataWsLastFailureAt: null });
          },
          onDisconnect: () => {
            console.log("Graph data WebSocket disconnected");
            // Only update state if we're not intentionally disconnecting
            const currentState = get();
            if (currentState.connectionState !== "disconnected") {
              set({ connectionState: "disconnected" });
            }
          },
          onStateChange: (wsState) => {
            // Sync WebSocket client state with store state
            if (wsState === "connected") {
              set({ connectionState: "connected", loading: false, dataWsLastFailureAt: null });
            } else if (wsState === "connecting") {
              set({ connectionState: "connecting" });
            } else if (wsState === "error") {
              set({ connectionState: "error", loading: false, dataWsLastFailureAt: Date.now() });
            } else if (wsState === "disconnected") {
              const currentState = get();
              // Only update if not intentionally disconnected
              if (currentState.connectionState !== "disconnected") {
                set({ connectionState: "disconnected" });
              }
            }
          },
        });

        set({ wsClient: client });
      },

      retryDataWebSocket: () => {
        // Explicit retry path after an error/cooldown.
        // Reset to disconnected, clear last failure timestamp, and reconnect.
        set({ connectionState: "disconnected", dataWsLastFailureAt: null });
        get().connectDataWebSocket();
      },

      disconnectDataWebSocket: () => {
        // Only disconnect if the connection is actually established
        // This prevents unnecessary disconnections during hot reload
        const client = get().wsClient;
        if (client) {
          client.disconnect();
          set({ wsClient: null, connectionState: "disconnected" });
        }
      },

      connectHyperliquidCandleWebSocket: (coin = "BTC", interval = "1h" as CandleResolution) => {
        const state = get();
        
        // Check if coin/interval changed - if so, disconnect and reconnect
        const coinChanged = state.hyperliquidCurrentCoin !== coin;
        const intervalChanged = state.hyperliquidCurrentInterval !== interval;
        
        // If already connected with same params, no need to reconnect
        if (
          state.hyperliquidConnectionState === "connected" &&
          state.hyperliquidWsClient &&
          state.hyperliquidWsClient.isConnected() &&
          !coinChanged &&
          !intervalChanged
        ) {
          return;
        }

        // Disconnect existing connection if coin/interval changed or if connecting
        const existingClient = state.hyperliquidWsClient;
        if (existingClient) {
          // Unsubscribe before disconnecting if connected
          if (existingClient.isConnected() && (coinChanged || intervalChanged)) {
            const unsubscribeMessage = {
              method: "unsubscribe",
              subscription: {
                type: "candle",
                coin: state.hyperliquidCurrentCoin || "BTC",
                interval: state.hyperliquidCurrentInterval || "1h",
              },
            };
            existingClient.send(unsubscribeMessage);
          }
          existingClient.disconnect();
        }

        // Don't set `loading: true` here: SDK historical candles already drive the initial load state.
        // This WS is for realtime updates and should not block rendering (can otherwise leave chart stuck loading).
        set({ hyperliquidConnectionState: "connecting" });

        const client = createHyperliquidCandleWebSocket(coin, interval, {
          onSnapshot: (candles) => {
            // Merge WS snapshot with existing historical SDK data.
            // Do NOT replace: the snapshot only covers recent candles and
            // overwriting would discard the full historical depth from the SDK.
            const existing = get().marketGraphData || [];
            const merged = deduplicateCandlesByTime([...existing, ...candles]);
            set({ 
              marketGraphData: merged, 
              loading: false,
              hyperliquidConnectionState: "connected"
            });
          },
          onCandleUpdate: (candle) => {
            // Real-time update - append or update latest candle
            const current = get().marketGraphData || [];
            const lastCandle = current[current.length - 1];
            
            // Only append/update if the candle timestamp is >= the last candle's timestamp
            if (lastCandle) {
              if (candle.time === lastCandle.time) {
                // Same timestamp: update existing candle
                const updated = [...current];
                updated[updated.length - 1] = candle;
                set({ marketGraphData: updated });
              } else if (candle.time > lastCandle.time) {
                // Newer timestamp: append new candle
                set({ marketGraphData: [...current, candle] });
              }
              // Ignore older candles to maintain sorted order
            } else {
              // No existing data, just set the candle
              set({ marketGraphData: [candle] });
            }
          },
          onError: (error) => {
            console.error("Hyperliquid WebSocket error:", error);
            set({ loading: false, hyperliquidConnectionState: "error" });
          },
          onConnect: () => {
            console.log("Hyperliquid candle WebSocket connected");
            set({ hyperliquidConnectionState: "connected" });
          },
          onDisconnect: () => {
            console.log("Hyperliquid candle WebSocket disconnected");
            const currentState = get();
            if (currentState.hyperliquidConnectionState !== "disconnected") {
              set({ hyperliquidConnectionState: "disconnected" });
            }
          },
          onStateChange: (wsState) => {
            if (wsState === "connected") {
              set({ hyperliquidConnectionState: "connected", loading: false });
            } else if (wsState === "connecting") {
              set({ hyperliquidConnectionState: "connecting" });
            } else if (wsState === "error") {
              set({ hyperliquidConnectionState: "error", loading: false });
            } else if (wsState === "disconnected") {
              const currentState = get();
              if (currentState.hyperliquidConnectionState !== "disconnected") {
                set({ hyperliquidConnectionState: "disconnected" });
              }
            }
          },
        });

        set({ 
          hyperliquidWsClient: client,
          hyperliquidCurrentCoin: coin,
          hyperliquidCurrentInterval: interval
        });
      },

      disconnectHyperliquidCandleWebSocket: () => {
        const state = get();
        const client = state.hyperliquidWsClient;
        if (client) {
          // Unsubscribe before disconnecting if connected
          if (client.isConnected() && state.hyperliquidCurrentCoin && state.hyperliquidCurrentInterval) {
            const unsubscribeMessage = {
              method: "unsubscribe",
              subscription: {
                type: "candle",
                coin: state.hyperliquidCurrentCoin,
                interval: state.hyperliquidCurrentInterval,
              },
            };
            client.send(unsubscribeMessage);
          }
          client.disconnect();
          set({ 
            hyperliquidWsClient: null, 
            hyperliquidConnectionState: "disconnected",
            hyperliquidCurrentCoin: null,
            hyperliquidCurrentInterval: null
          });
        }
      },

      connectHyperliquidMidPriceWebSocket: (coin = "BTC") => {
        const state = get();
        
        // Check if coin changed - if so, disconnect and reconnect
        const coinChanged = state.hyperliquidMidPriceCoin !== coin;
        
        // If already connected with same coin, no need to reconnect
        if (
          state.hyperliquidMidPriceConnectionState === "connected" &&
          state.hyperliquidMidPriceWsClient &&
          state.hyperliquidMidPriceWsClient.isConnected() &&
          !coinChanged
        ) {
          return;
        }

        // Disconnect existing connection if coin changed
        const existingClient = state.hyperliquidMidPriceWsClient;
        if (existingClient) {
          // Unsubscribe before disconnecting if connected
          if (existingClient.isConnected() && coinChanged) {
            const unsubscribeMessage = {
              method: "unsubscribe",
              subscription: {
                type: "allMids",
              },
            };
            existingClient.send(unsubscribeMessage);
          }
          existingClient.disconnect();
        }

        set({ hyperliquidMidPriceConnectionState: "connecting" });

        const client = createHyperliquidMidPriceWebSocket(coin, {
          onMidPriceUpdate: (price) => {
            // Update the current mark price with the live mid price from Hyperliquid
            set({ currentMarkPrice: price });
          },
          onError: (error) => {
            console.error("Hyperliquid mid price WebSocket error:", error);
            set({ hyperliquidMidPriceConnectionState: "error" });
          },
          onConnect: () => {
            console.log("Hyperliquid mid price WebSocket connected");
            set({ hyperliquidMidPriceConnectionState: "connected" });
          },
          onDisconnect: () => {
            console.log("Hyperliquid mid price WebSocket disconnected");
            const currentState = get();
            if (currentState.hyperliquidMidPriceConnectionState !== "disconnected") {
              set({ hyperliquidMidPriceConnectionState: "disconnected" });
            }
          },
          onStateChange: (wsState) => {
            if (wsState === "connected") {
              set({ hyperliquidMidPriceConnectionState: "connected" });
            } else if (wsState === "connecting") {
              set({ hyperliquidMidPriceConnectionState: "connecting" });
            } else if (wsState === "error") {
              set({ hyperliquidMidPriceConnectionState: "error" });
            } else if (wsState === "disconnected") {
              const currentState = get();
              if (currentState.hyperliquidMidPriceConnectionState !== "disconnected") {
                set({ hyperliquidMidPriceConnectionState: "disconnected" });
              }
            }
          },
        });

        set({ 
          hyperliquidMidPriceWsClient: client,
          hyperliquidMidPriceCoin: coin
        });
      },

      disconnectHyperliquidMidPriceWebSocket: () => {
        const state = get();
        const client = state.hyperliquidMidPriceWsClient;
        if (client) {
          // Unsubscribe before disconnecting if connected
          if (client.isConnected()) {
            const unsubscribeMessage = {
              method: "unsubscribe",
              subscription: {
                type: "allMids",
              },
            };
            client.send(unsubscribeMessage);
          }
          client.disconnect();
          set({ 
            hyperliquidMidPriceWsClient: null, 
            hyperliquidMidPriceConnectionState: "disconnected",
            hyperliquidMidPriceCoin: null
          });
        }
      },

      loadMarketGraphData: async (symbol, resolution) => {
        set({ loading: true, retryAttempt: 0 });

        // Add loading timeout failsafe (15 seconds)
        const loadingTimeout = setTimeout(() => {
          if (get().loading) {
            console.warn("Loading timeout - forcing loading state off");
            set({ loading: false });
          }
        }, 15000);

        const now = Date.now();
        const intervalMsMap: Record<CandleResolution, number> = {
          "5m": 5 * 60 * 1000,
          "15m": 15 * 60 * 1000,
          "1h": 60 * 60 * 1000,
          "4h": 4 * 60 * 60 * 1000,
          "1d": 24 * 60 * 60 * 1000,
          "1w": 7 * 24 * 60 * 60 * 1000,
          "1M": 30 * 24 * 60 * 60 * 1000,
        };

        const candleMs = intervalMsMap[resolution || "1h"];
        // Request up to 1000 candles
        const desiredLookback = candleMs * 1000;
        const maxLookback = 3 * 365 * 24 * 60 * 60 * 1000; // 3 years max
        const lookback = Math.min(desiredLookback, maxLookback);

        const startTime = now - lookback;
        const endTime = now;

        const maxRetries = 2;
        let lastError: any = null;

        // Fetch via client-side REST directly from Hyperliquid API
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            set({ retryAttempt: attempt });
            const data = await fetchCandleSnapshotFallback(
              symbol || "BTC-PERP",
              resolution || "1h",
              startTime,
              endTime
            );
            clearTimeout(loadingTimeout);
            set({ marketGraphData: data, retryAttempt: 0, loading: false });
            return; // Success!
          } catch (e: any) {
            lastError = e;
            const isLastAttempt = attempt === maxRetries;

            // Don't retry rate limit errors (429)
            if (e?.code === 429 || e?.status === 429) {
              console.warn("Rate limited by Hyperliquid - providing live updates only");
              break;
            }

            const isRetryable =
              (e?.status >= 500 && e?.status < 600) ||
              e?.message?.includes('network') ||
              e?.message?.includes('ECONNREFUSED') ||
              e?.message?.includes('fetch failed');

            if (!isRetryable || isLastAttempt) {
              break;
            }

            const delayMs = Math.pow(2, attempt + 1) * 1500;
            console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }

        // All attempts failed
        clearTimeout(loadingTimeout);
        set({ retryAttempt: 0, loading: false });

        if (lastError?.code === 429 || lastError?.status === 429) {
          toast.error("Rate limited. WebSocket will provide live updates only.");
        } else {
          toast.error("Failed to load historical data. WebSocket will provide live updates only.");
        }
      },

      setCurrentMarkPrice: (price) => set({ currentMarkPrice: price }),
      setLiquidationThreshold: (threshold) =>
        set({ liquidationThreshold: threshold }),
      setSelectedGraph: (graph) => set({ selectedGraph: graph }),
      setResolution: (r) => set({ resolution: r }),
      setBandValues: (v) => set({ bandValues: v }),

      overlayCurve: null,
      overlayKind: null,
      setOverlayCurve: (points, kind) => set({ overlayCurve: points, overlayKind: kind }),
      clearOverlay: () => set({ overlayCurve: null, overlayKind: null }),

    }),
    {
      name: "graph-store", // key in storage
      storage: createJSONStorage(() => localStorage),
      // Persist only the fields that matter (omit 'loading', 'wsClient', 'marketGraphData')
      // Don't persist marketGraphData - it can be stale and should always be fetched fresh
      partialize: (state) => ({
        graphData: state.graphData,
        currentMarkPrice: state.currentMarkPrice,
        liquidationThreshold: state.liquidationThreshold,
        selectedGraph: state.selectedGraph,
        resolution: state.resolution,
      }),
      // Options Pricing is commented out of the graph selector (owner, 2026-07-28) — a
      // stale localStorage pick from before that change must not land a returning user
      // on a now-hidden tab.
      merge: (persisted, current) => {
        const p = persisted as Partial<GraphStore> | undefined;
        return {
          ...current,
          ...p,
          selectedGraph: p?.selectedGraph === "OptionsGraph" ? "BookGraph" : p?.selectedGraph ?? current.selectedGraph,
        };
      },
    }
  )
);

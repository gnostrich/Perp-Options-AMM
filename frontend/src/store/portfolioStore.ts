import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TableDataGroup, PerpTableEntry, EarnTableEntry } from "@/lib/data";
import type { LiquidationFloorResponse } from "@/lib/data/api/portfolio";
import {
  transformTransactionsData,
  transformPerpsData,
  transformEarnData,
  transformLiquidationFloorData,
  type UserWebSocketTransaction,
  type LpBandApiRow,
} from "@/lib/data/api/websocket";
import { usePnlHistoryStore } from "@/store/pnlHistoryStore";
import { createUserSseStream, type StreamClient } from "@/lib/data/api/stream-client";

type PortfolioStore = {
  tableData: TableDataGroup[];
  perpData: PerpTableEntry[];
  earnPortfolioData: EarnTableEntry[];
  liquidationFloor: LiquidationFloorResponse | null;
  liquidationMarginTotal: number | null;
  currentMarkPrice: number;
  loadingBands: boolean;
  loadingPerps: boolean;
  loadingEarn: boolean;
  loadingLiquidationFloor: boolean;
  wsClient: StreamClient | null;
  currentWalletAddress: string | null;
  // Store raw transaction data for re-transformation when mark price changes
  rawTransactions: UserWebSocketTransaction[] | null;
  // LP-accrued rows riding the same ledger (BANDS ORIGIN round) — not mark-price-derived
  // client-side (the wire's valueUSD is already resolved), so no re-transform needed on
  // a mark tick; kept alongside rawTransactions purely so setCurrentMarkPrice's
  // re-transform of the trader legs doesn't drop the LP rows off the table.
  rawLpRows: LpBandApiRow[] | null;
  connectUserWebSocket: (walletAddress: string, token?: string) => void;
  disconnectUserWebSocket: () => void;
  setTableData: (data: TableDataGroup[]) => void;
  setPerpData: (data: PerpTableEntry[]) => void;
  setEarnPortfolioData: (data: EarnTableEntry[]) => void;
  setCurrentMarkPrice: (price: number) => void;
  clearPortfolio: () => void;
};

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      tableData: [],
      perpData: [],
      earnPortfolioData: [],
      liquidationFloor: null,
      liquidationMarginTotal: null,
      currentMarkPrice: 100000,
      loadingBands: false,
      loadingPerps: false,
      loadingEarn: false,
      loadingLiquidationFloor: false,
      wsClient: null,
      currentWalletAddress: null,
      rawTransactions: null,
      rawLpRows: null,

      // ─── Actions ─────────────────────────────────────────────
      connectUserWebSocket: (walletAddress, token = "BTC") => {
        // Disconnect existing connection if wallet address changed
        const existingClient = get().wsClient;
        const currentWallet = get().currentWalletAddress;
        
        if (existingClient && currentWallet === walletAddress) {
          // Already connected to this wallet
          return;
        }

        if (existingClient) {
          existingClient.disconnect();
        }

        if (!walletAddress) {
          return;
        }

        set({
          loadingBands: true,
          loadingPerps: true,
          loadingEarn: true,
          loadingLiquidationFloor: true,
          currentWalletAddress: walletAddress,
        });

        const client = createUserSseStream(
          walletAddress,
          token,
          {
            onInitialData: (data) => {
              const state = get();
              const markPrice = state.currentMarkPrice;

              // Store raw transactions for re-transformation when mark price changes
              const rawTransactions = data.transactions.transactions;
              const rawLpRows = data.transactions.lp_positions ?? null;

              // Transform transactions to table data
              const tableData = transformTransactionsData(
                rawTransactions,
                markPrice,
                data.transactions.lp_positions
              );

              // Transform perps data
              const perpData = transformPerpsData(
                data.perps,
                data.transactions.perp_quantity,
                rawTransactions
              );

              // Transform earn data
              const earnPortfolioData = transformEarnData(data.earn_positions);

              // Transform liquidation floor
              const liquidationFloor = transformLiquidationFloorData(
                data.liquidation_floor
              );

              // Extract liquidation margin total from perps_totals
              const liquidationMarginTotal = data.perps_totals?.liquidation_margin_total ?? null;

              set({
                tableData,
                perpData,
                earnPortfolioData,
                liquidationFloor,
                liquidationMarginTotal,
                rawTransactions,
                rawLpRows,
                loadingBands: false,
                loadingPerps: false,
                loadingEarn: false,
                loadingLiquidationFloor: false,
              });

              // Forward live PNL snapshot to the dedicated pnlHistoryStore
              if (data.pnl_live) {
                usePnlHistoryStore.getState().appendLivePoint(data.pnl_live);
              }
            },
            onUpdate: (data) => {
              // Handle update messages - the server will send fresh data when needed
              // For now, we'll just log it. If the server sends a new initial message,
              // it will be handled by onInitialData
              console.log("Portfolio data update received:", data.event);
              // Don't disconnect/reconnect on every update - let the WebSocket handle it
            },
            onError: (error) => {
              console.error("User WebSocket error:", error);
              set({
                loadingBands: false,
                loadingPerps: false,
                loadingEarn: false,
                loadingLiquidationFloor: false,
              });
            },
            onConnect: () => {
              console.log("User portfolio WebSocket connected");
            },
            onDisconnect: () => {
              console.log("User portfolio WebSocket disconnected");
            },
          }
        );

        set({ wsClient: client });
      },

      disconnectUserWebSocket: () => {
        const client = get().wsClient;
        if (client) {
          client.disconnect();
          set({ wsClient: null, currentWalletAddress: null });
        }
      },

      setTableData: (data) => set({ tableData: data }),
      setPerpData: (data) => set({ perpData: data }),
      setEarnPortfolioData: (data) => set({ earnPortfolioData: data }),
      setCurrentMarkPrice: (price) => {
        const state = get();
        set({ currentMarkPrice: price });
        
        // Re-transform existing transactions data with new mark price
        // This avoids unnecessary WebSocket reconnections
        if (state.rawTransactions && state.rawTransactions.length > 0) {
          const tableData = transformTransactionsData(
            state.rawTransactions,
            price,
            state.rawLpRows ?? undefined
          );
          set({ tableData });
        }
      },
      clearPortfolio: () => {
        const client = get().wsClient;
        if (client) {
          client.disconnect();
        }
        set({
          tableData: [],
          perpData: [],
          earnPortfolioData: [],
          liquidationFloor: null,
          liquidationMarginTotal: null,
          loadingBands: false,
          loadingPerps: false,
          loadingEarn: false,
          loadingLiquidationFloor: false,
          wsClient: null,
          currentWalletAddress: null,
          rawTransactions: null,
          rawLpRows: null,
        });
      },
    }),
    {
      name: "portfolio-store", // key in storage
      storage: createJSONStorage(() => localStorage),
      // Persist only the fields that matter (omit 'loading' states, 'wsClient', 'currentWalletAddress')
      partialize: (state) => ({
        tableData: state.tableData,
        perpData: state.perpData,
        earnPortfolioData: state.earnPortfolioData,
        liquidationFloor: state.liquidationFloor,
        currentMarkPrice: state.currentMarkPrice,
        rawTransactions: state.rawTransactions,
        rawLpRows: state.rawLpRows,
      }),
    }
  )
);


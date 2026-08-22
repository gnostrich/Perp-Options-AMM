/**
 * WebSocket Client for real-time data updates
 * Handles WebSocket connections for AMM graph data, oracle price, and user portfolio data
 */

import type { ProcessedGraphData } from "./prices";
import type {
  TableDataGroup,
  PerpTableEntry,
  EarnTableEntry,
  LiquidationFloorResponse,
  PerpQuantity,
  PerpType,
} from "./portfolio";
import type { PnlLivePoint } from "./pnlHistory";
import {
  fmtAbsDisplay,
  fmtPctDisplay,
  formatDT,
  getSideQuantities,
  aggregateBandsPnlByPerpType,
  pctToAbsPrice,
  title,
  aggregateBandsPnlByPerpId,
  buildLpBandGroup,
  type LpBandWireRow,
} from "./portfolioTransforms";

// ==================== Type Definitions ====================

export type WebSocketState = "connecting" | "connected" | "disconnected" | "error";

export interface WebSocketMessage<T = unknown> {
  type: "initial" | "update";
  data: T;
  timestamp: number;
}

// /api/data WebSocket message types
export interface DataWebSocketConfig {
  // Config object structure (to be defined based on actual API response)
  [key: string]: unknown;
}

export interface DataWebSocketTree {
  nodes: Array<{ strike: number; pt_asset: number }>;
}

export interface DataWebSocketStats {
  // Stats object structure (to be defined based on actual API response)
  [key: string]: unknown;
}

export interface DataWebSocketCurveNode {
  strike: number; // signed % offset from the mark
  call: number;
  put: number;
}

export interface InitialDataMessageData {
  config: DataWebSocketConfig;
  long_tree: DataWebSocketTree;
  short_tree: DataWebSocketTree;
  curve?: DataWebSocketCurveNode[];
  stats: DataWebSocketStats;
  oracle_price: number;
}

export type InitialDataMessage = WebSocketMessage<InitialDataMessageData>;

export interface UpdateDataMessageData {
  event: string;
  [key: string]: unknown;
}

export type UpdateDataMessage = WebSocketMessage<UpdateDataMessageData>;

// /api/user/{wallet_address} WebSocket message types
export interface UserWebSocketTransaction {
  id: string;
  perp_ids?: string[];
  type: "buy" | "sell";
  quantity: number;
  status: string;
  wallet_address: string;
  perp_type: "long" | "short";
  created_at: string;
  sold_initial_inner_bound: number;
  sold_initial_outer_bound: number;
  bought_initial_inner_bound: number;
  bought_initial_outer_bound: number;
  sold_residual_inner_bound: number;
  sold_residual_outer_bound: number;
  bought_residual_inner_bound: number;
  bought_residual_outer_bound: number;
  sold_initial_inner_price?: number;
  sold_initial_outer_price?: number;
  bought_initial_inner_price?: number;
  bought_initial_outer_price?: number;
  sold_residual_inner_price?: number;
  sold_residual_outer_price?: number;
  bought_residual_inner_price?: number;
  bought_residual_outer_price?: number;
  sold_profit?: number;
  bought_profit?: number;
  sold_initial_value_in_dollars: number;
  bought_initial_value_in_dollars: number;
  perp_market_price: number;
  trader_equity?: number;
  amm_quantity?: number;
  initial_perp_margin?: number;
  perp_dex_margin?: number;
  is_closed?: boolean;
  is_auto_protect?: boolean;
  net_band_payout?: number;
  sold_value_in_dollars?: number;
  bought_value_in_dollars?: number;
  sold_latest_value_in_dollars?: number;
  sold_residual_value?: number;
  bought_latest_value_in_dollars?: number;
  bought_residual_value?: number;
  /** Tags this band's source; absent (old wire) ⇒ "opened" (BANDS ORIGIN round,
   *  owner-ratified). */
  origin?: "opened" | "lp";
  /** PER-BOUND LEG VALUES (task #34 item 1, backend 40b2f9b/317a163): each
   *  bound's own value at the engine's live mark. Outer is NEGATIVE (the leg
   *  sold it away) and Inner+Outer == the *_leg_value_in_dollars sum, bit-
   *  exactly — never re-derived here. ABSENT, NEVER 0: no outer key on a
   *  single-bound leg, no keys at all on a row the engine couldn't price
   *  (leg_value_basis present ⇔ at least one leg priced). */
  sold_inner_bound_value_in_dollars?: number;
  sold_outer_bound_value_in_dollars?: number;
  sold_leg_value_in_dollars?: number;
  bought_inner_bound_value_in_dollars?: number;
  bought_outer_bound_value_in_dollars?: number;
  bought_leg_value_in_dollars?: number;
  /** Basis of the six fields above — "model" (the curve mid), the only
   *  admissible basis per engine.LegValueBasis. Absent ⇔ neither leg priced. */
  leg_value_basis?: "model";
}

export type LpBandApiRow = LpBandWireRow;

export interface UserWebSocketPerpQuantity {
  total_btc_amount: number;
  used_quantity: number;
  available_quantity: number;
  perp_count: number;
  long_positions?: {
    count?: number;
    total_btc_amount?: number;
    used_quantity?: number;
    available_quantity?: number;
  };
  short_positions?: {
    count?: number;
    total_btc_amount?: number;
    used_quantity?: number;
    available_quantity?: number;
  };
}

export interface UserWebSocketTransactions {
  transactions: UserWebSocketTransaction[];
  /** LP-accrued single-leg inventory rows, a SIBLING array to `transactions`
   *  (routes/ws_handlers.go:270 `EnhancedResponse.LPPositions`, json "lp_positions" —
   *  NOT more elements of `transactions`, confirmed against ws_lppositions_test.go's
   *  fixture). Absent on an old cached response ⇒ no LP rows render. */
  lp_positions?: LpBandApiRow[];
  perp_quantity: UserWebSocketPerpQuantity;
  total_count: number;
}

export interface UserWebSocketPerp {
  id: string;
  token: string;
  perpType: "LONG" | "SHORT";
  market: string;
  initialUsdMargin: number;
  usdcAmount: number;
  leverage: number;
  initialLeverage: number;
  markPrice: number;
  entryPrice: number;
  btcAmount: number;
  pnl: number;
  positionValue: number;
  usedQuantity: number;
  fundingRate: number;
  fundingAccrued: number;
  lastFundingAt: string;
  liquidationMargin: number;
  isLiquidated: boolean;
  liquidatedAt: string | null;
  isClosed: boolean;
  closedAt?: string | null;
  closeMarkPrice?: number;
  traderEquity?: number;
  userWallet: string;
  created_at: string;
  updated_at: string;
  /** Tags this row's source (task #42, DISPLAY HALF ONLY); absent (old wire) ⇒
   *  "opened" — the SSE twin of PerpPositionResponse's origin (portfolio.ts),
   *  same underlying models.Perp field. No path stamps "lp" yet. */
  origin?: "opened" | "lp";
}

/** A single earn position as received in the user_data websocket message */
export interface UserWebSocketEarn {
  id: string;
  user_wallet: string;
  status: string;
  created_at: string;
  updated_at: string;
  pool_notional_deposit_btc: number;
  pool_notional_deposit_dollar: number;
  pool_notional_deposit_percentage: number;
  exited_pnl_dollar: number;
  lp_margin_btc: number;
  lp_margin_dollar: number;
  initial_lp_leverage: number;
  current_lp_leverage: number;
  earn_pnl_dollar: number;
}

export interface UserWebSocketLiquidationFloor {
  userWallet: string;
  token: string;
  market: string;
  currentPrice: number;
  liquidationPrice: number;
  netBtcAmount: number;
  netPerpType: "LONG" | "SHORT" | "ZERO";
  distanceToLiquidation: number;
  isLiquidatable: boolean;
  traderEquity?: number;
  hasActiveTradeBands?: boolean;
}

export interface UserWebSocketPerpsTotals {
  liquidation_margin_total: number;
  initial_usd_margin_total: number;
  btc_amount_total: number;
  used_quantity_total: number;
  perp_count: number;
}

export interface InitialUserMessageData {
  transactions: UserWebSocketTransactions;
  perps: UserWebSocketPerp[];
  earn_positions: UserWebSocketEarn[];
  liquidation_floor: UserWebSocketLiquidationFloor;
  perps_totals: UserWebSocketPerpsTotals;
  pnl_live?: PnlLivePoint | null;
}

export type InitialUserMessage = WebSocketMessage<InitialUserMessageData>;

export interface UpdateUserMessageData {
  event: string;
  [key: string]: unknown;
}

export type UpdateUserMessage = WebSocketMessage<UpdateUserMessageData>;

// ==================== WebSocket Client Class ====================

export interface WebSocketCallbacks {
  onMessage?: (message: unknown) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onStateChange?: (state: WebSocketState) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: WebSocketCallbacks;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private state: WebSocketState = "disconnected";
  private shouldReconnect = true;
  private connectionStartTime: number | null = null;
  private wasConnected = false; // Track if we ever successfully connected
  private immediateFailureThreshold = 1000; // 1 second - if connection fails within this, don't reconnect

  constructor(url: string, callbacks: WebSocketCallbacks = {}) {
    this.url = url;
    this.callbacks = callbacks;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      return; // Already connecting
    }

    this.setState("connecting");
    this.connectionStartTime = Date.now();

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        // Successfully connected - reset reconnection state
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.wasConnected = true;
        this.connectionStartTime = null;
        this.setState("connected");
        this.callbacks.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          // Check if data exists and is not empty
          if (!event.data || event.data === "" || event.data.trim() === "") {
            // Ignore empty messages (ping/pong or keep-alive)
            return;
          }

          const message = JSON.parse(event.data);
          this.callbacks.onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
          console.error("Received data:", event.data);
          this.callbacks.onError?.(new Error("Failed to parse WebSocket message"));
        }
      };

      this.ws.onerror = (error) => {
        console.error(`WebSocket error for ${this.url}:`, error);
        this.setState("error");
        this.callbacks.onError?.(new Error(`WebSocket connection error: ${this.url}`));
      };

      this.ws.onclose = (event) => {
        const connectionDuration = this.connectionStartTime
          ? Date.now() - this.connectionStartTime
          : 0;

        this.setState("disconnected");
        this.callbacks.onDisconnect?.();

        // Check close code to determine the type of disconnection
        // 1006 = abnormal closure (connection refused, server not responding, network issues, etc.)
        // 1000 = normal closure
        const isAbnormalClosure = event.code === 1006;
        const isImmediateFailure = connectionDuration < this.immediateFailureThreshold;

        // Don't reconnect ONLY if ALL of these are true:
        // 1. Never successfully connected before, AND
        // 2. Failed immediately (< 1s), AND
        // 3. Abnormal closure (1006 - likely connection refused)
        // This indicates the server is not running or endpoint doesn't exist.
        //
        // Reconnect in all other cases, including:
        // - We were previously connected (unexpected disconnection)
        // - Connection took longer to fail (server might be slow/timing out)
        // - Normal closure (graceful disconnect that shouldn't have happened)
        const shouldNotReconnect = !this.wasConnected && isImmediateFailure && isAbnormalClosure;

        if (!shouldNotReconnect) {
          this.attemptReconnect();
        } else {
          // Immediate failure with never having connected - server is likely not running
          console.warn(
            `WebSocket connection failed: Unable to connect to ${this.url}. ` +
            `Server may not be running or the endpoint is unreachable. ` +
            `(Close code: ${event.code})`
          );
          this.setState("error");
        }
      };
    } catch (error) {
      console.error(`Failed to create WebSocket connection to ${this.url}:`, error);
      this.setState("error");
      this.callbacks.onError?.(error as Error);
      // Don't reconnect on immediate failures from exceptions
      if (this.wasConnected) {
        this.attemptReconnect();
      }
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.wasConnected = false; // Reset connection history on explicit disconnect
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      // Avoid closing a CONNECTING socket (can throw/emit noisy errors like
      // "WebSocket is closed before the connection is established" during fast page nav).
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CLOSING) {
        this.ws.close();
      } else if (this.ws.readyState === WebSocket.CONNECTING) {
        const ws = this.ws;
        const originalOnOpen = ws.onopen;
        ws.onopen = (event) => {
          try {
            ws.close();
          } finally {
            if (originalOnOpen) {
              // Preserve any existing onopen behavior
              (originalOnOpen as (this: WebSocket, ev: Event) => unknown).call(ws, event);
            }
          }
        };
      }
      this.ws = null;
    }
    this.connectionStartTime = null;
    this.setState("disconnected");
  }

  send(message: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
        this.callbacks.onError?.(new Error("Failed to send WebSocket message"));
      }
    } else {
      console.warn("WebSocket is not connected. Cannot send message.");
    }
  }

  private setState(newState: WebSocketState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.callbacks.onStateChange?.(newState);
    }
  }

  private attemptReconnect(): void {
    if (!this.shouldReconnect) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached. Stopping reconnection attempts.");
      this.setState("error");
      this.shouldReconnect = false; // Stop trying
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  getState(): WebSocketState {
    return this.state;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// ==================== Helper Functions ====================

function getWebSocketBaseUrl(): string {
  // return "ws://prod.temporal.exchange";
  // return "ws://localhost:8080";
  const baseUrl = process.env.WEBSOCKET_BASE_URL;
  if (!baseUrl) {
    throw new Error("WEBSOCKET_BASE_URL is not defined");
  }
  return baseUrl;

}

/**
 * Creates a WebSocket connection for /api/data endpoint
 * Returns AMM graph data and Oracle price
 */
export function createDataWebSocket(
  callbacks: {
    onInitialData?: (data: InitialDataMessageData) => void;
    onUpdate?: (data: UpdateDataMessageData) => void;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onStateChange?: (state: WebSocketState) => void;
  }
): WebSocketClient {
  const baseUrl = getWebSocketBaseUrl();
  const url = `${baseUrl}/ws/market-data`;

  const wsCallbacks: WebSocketCallbacks = {
    onMessage: (message) => {
      const raw = message as any;
      // Backend sends type: "market_data" instead of type: "initial"
      if (raw.type === "market_data") {
        // Transform backend response format to expected format
        const transformed: InitialDataMessageData = {
          config: raw.amm_graph.config,
          long_tree: raw.amm_graph.long_tree,
          short_tree: raw.amm_graph.short_tree,
          curve: raw.amm_graph.curve,
          stats: raw.amm_graph.stats,
          oracle_price: raw.oracle_price,
        };
        callbacks.onInitialData?.(transformed);
      } else if (raw.type === "update") {
        callbacks.onUpdate?.(raw as UpdateDataMessageData);
      }
      // Also handle legacy format for backward compatibility
      else {
        const wsMessage = message as WebSocketMessage;
        if (wsMessage.type === "initial") {
          callbacks.onInitialData?.(wsMessage.data as InitialDataMessageData);
        } else if (wsMessage.type === "update") {
          callbacks.onUpdate?.(wsMessage.data as UpdateDataMessageData);
        }
      }
    },
    onError: (error) => callbacks.onError?.(error),
    onConnect: () => callbacks.onConnect?.(),
    onDisconnect: () => callbacks.onDisconnect?.(),
    onStateChange: (state) => callbacks.onStateChange?.(state),
  };

  const client = new WebSocketClient(url, wsCallbacks);
  client.connect();
  return client;
}

/**
 * Creates a WebSocket connection for /api/user/{wallet_address} endpoint
 * Returns Transactions, Perps, Earn positions, and Liquidation floor
 */
export function createUserWebSocket(
  walletAddress: string,
  token: string = "BTC",
  marketOrCallbacks?: string | {
    onInitialData?: (data: InitialUserMessageData) => void;
    onUpdate?: (data: UpdateUserMessageData) => void;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onStateChange?: (state: WebSocketState) => void;
  },
  txLimit: number = 20,
  txOffset: number = 0,
  perpLimit: number = 20,
  perpOffset: number = 0,
  callbacks?: {
    onInitialData?: (data: InitialUserMessageData) => void;
    onUpdate?: (data: UpdateUserMessageData) => void;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onStateChange?: (state: WebSocketState) => void;
  }
): WebSocketClient {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  // Handle backward compatibility: if marketOrCallbacks is an object with callback properties, treat it as callbacks
  let actualMarket: string;
  let actualCallbacks: typeof callbacks;

  if (typeof marketOrCallbacks === 'object' && marketOrCallbacks !== null && ('onInitialData' in marketOrCallbacks || 'onError' in marketOrCallbacks || 'onConnect' in marketOrCallbacks)) {
    // Third parameter is actually callbacks (old signature)
    actualMarket = `${token}-PERP`;
    actualCallbacks = marketOrCallbacks as typeof callbacks;
  } else {
    // Normal case: third parameter is market
    actualMarket = (marketOrCallbacks as string) || `${token}-PERP`;
    actualCallbacks = callbacks || {};
  }

  const baseUrl = getWebSocketBaseUrl();
  const url = `${baseUrl}/ws/user-data`;

  // New backend requires a subscription message after connect
  const subscribeMessage = {
    wallet: walletAddress,
    token,
    market: actualMarket,
    tx_limit: txLimit,
    tx_offset: txOffset,
    perp_limit: perpLimit,
    perp_offset: perpOffset,
  };

  let clientRef: WebSocketClient | null = null;

  const wsCallbacks: WebSocketCallbacks = {
    onMessage: (message) => {
      const raw = message as any;
      // Backend sends type: "user_data" instead of type: "initial"
      if (raw.type === "user_data") {
        // Transform backend response format to expected format
        const transformed: InitialUserMessageData = {
          transactions: raw.transactions,
          perps: raw.perps,
          earn_positions: Array.isArray(raw.earn_positions) ? raw.earn_positions : [],
          liquidation_floor: raw.liquidation_floor,
          perps_totals: raw.perps_totals,
          pnl_live: raw.pnl_live ?? null,
        };
        actualCallbacks?.onInitialData?.(transformed);
      } else if (raw.type === "update") {
        actualCallbacks?.onUpdate?.(raw as UpdateUserMessageData);
      }
      // Also handle legacy format for backward compatibility
      else {
        const wsMessage = message as WebSocketMessage;
        if (wsMessage.type === "initial") {
          actualCallbacks?.onInitialData?.(wsMessage.data as InitialUserMessageData);
        } else if (wsMessage.type === "update") {
          actualCallbacks?.onUpdate?.(wsMessage.data as UpdateUserMessageData);
        }
      }
    },
    onError: (error) => actualCallbacks?.onError?.(error),
    onConnect: () => {
      // Send subscription payload required by backend
      if (clientRef?.isConnected()) {
        clientRef.send(subscribeMessage);
      }
      actualCallbacks?.onConnect?.();
    },
    onDisconnect: () => actualCallbacks?.onDisconnect?.(),
    onStateChange: (state) => actualCallbacks?.onStateChange?.(state),
  };

  const client = new WebSocketClient(url, wsCallbacks);
  clientRef = client;
  client.connect();
  return client;
}

// ==================== Data Transformation Functions ====================

// Helper functions are shared with `portfolio.ts` via `portfolioTransforms.ts`

/**
 * Transforms WebSocket graph data to ProcessedGraphData format
 */
export function transformGraphData(data: InitialDataMessageData): ProcessedGraphData[] | null {
  // Preferred: the full call/put curve (both lines, crossing at the mark).
  if (data?.curve && data.curve.length > 0) {
    return data.curve.map((node) => ({
      price: node.strike,
      equityWithoutInsurance: node.call,
      equityWithInsurance: node.put,
    }));
  }
  if (!data?.long_tree?.nodes || !data?.short_tree?.nodes) {
    return null;
  }
  const longTreeNodes = data.long_tree.nodes;
  const shortTreeNodes = data.short_tree.nodes;

  // Process long tree (right side from center)
  const longTreeData = longTreeNodes.map(
    (node: { strike: number; pt_asset: number }) => ({
      price: node.strike,
      equityWithoutInsurance: node.pt_asset,
      equityWithInsurance: 0,
    })
  );

  // Process short tree (left side from center)
  const shortTreeData = shortTreeNodes
    .filter((node: { strike: number }) => node.strike !== 0)
    .map((node: { strike: number; pt_asset: number }) => ({
      price: -node.strike,
      equityWithoutInsurance: node.pt_asset,
      equityWithInsurance: 0,
    }));

  // Combine: short to the left (sorted from lowest to highest), then long
  return [...shortTreeData.reverse(), ...longTreeData];
}

/**
 * Transforms WebSocket transactions data to TableDataGroup format
 */
export function transformTransactionsData(
  transactions: UserWebSocketTransaction[],
  currentMarkPrice?: number,
  lpRows?: LpBandApiRow[]
): TableDataGroup[] {
  const lpGroups = lpRows?.map(buildLpBandGroup) ?? [];

  if (!transactions || transactions.length === 0) {
    return lpGroups;
  }

  const bandGroups = transactions.map((tx) => {
    const origin = tx.origin ?? "opened";
    const bought_initial_inner_pct = Number(tx.bought_initial_inner_bound);
    const bought_initial_outer_pct = Number(tx.bought_initial_outer_bound);
    const bought_residual_inner_pct = Number(tx.bought_residual_inner_bound);
    const bought_residual_outer_pct = Number(tx.bought_residual_outer_bound);

    const sold_initial_inner_pct = Number(tx.sold_initial_inner_bound);
    const sold_initial_outer_pct = Number(tx.sold_initial_outer_bound);
    const sold_residual_inner_pct = Number(tx.sold_residual_inner_bound);
    const sold_residual_outer_pct = Number(tx.sold_residual_outer_bound);

    // Use backend price values directly instead of computing them
    const bought_initial_inner_abs = tx.bought_initial_inner_price;
    const bought_initial_outer_abs = tx.bought_initial_outer_price;
    const bought_residual_inner_abs = tx.bought_residual_inner_price;
    const bought_residual_outer_abs = tx.bought_residual_outer_price;

    const sold_initial_inner_abs = tx.sold_initial_inner_price;
    const sold_initial_outer_abs = tx.sold_initial_outer_price;
    const sold_residual_inner_abs = tx.sold_residual_inner_price;
    const sold_residual_outer_abs = tx.sold_residual_outer_price;

    const perp = {
      direction: tx.perp_type.charAt(0).toUpperCase() + tx.perp_type.slice(1),
      status: "" as const,
      quantity: Math.abs(tx.quantity).toFixed(6),
      type: "----",
      pnl: "----",
      innerBound: "----",
      outerBound: "----",
      residualinnerBound: "----",
      residualouterBound: "----",
      intrinsicValue: "----",
      residualValue: "----",
      funding: "",
      positionValue: "----",
      totalPositionValue: "----",
      origin,
    };

    // Keep bought_* data in Buy row and sold_* data in Sell row.
    // Direction (Long/Short) depends on (type, perp_type):
    // - The row matching tx.type gets tx.perp_type; the other row gets the opposite.
    const oppositePerpType = tx.perp_type === "long" ? "short" : "long";
    const buyRowPerpType = tx.type === "buy" ? tx.perp_type : oppositePerpType;
    const sellRowPerpType = tx.type === "sell" ? tx.perp_type : oppositePerpType;

    const boughtIntrinsicValue = tx.bought_profit ?? 0;
    const boughtExtrinsicValue = tx.bought_residual_value ?? 0;
    const fundingValue = 0;

    // Buy row (bought_* data)
    const buyRow = {
      direction: title(buyRowPerpType),
      quantity: Math.abs(tx.amm_quantity ?? 0).toFixed(6),
      type: title("Buy"),
      pnl: Math.abs(tx.bought_profit ?? 0).toFixed(2),
      innerBound: fmtPctDisplay(bought_initial_inner_pct),
      outerBound: fmtPctDisplay(bought_initial_outer_pct),
      residualinnerBound: fmtPctDisplay(bought_residual_inner_pct),
      residualouterBound: fmtPctDisplay(bought_residual_outer_pct),
      intrinsicValue: boughtIntrinsicValue.toFixed(2),
      residualValue: boughtExtrinsicValue.toFixed(4),
      funding: fundingValue.toFixed(2),
      // Audit MEDIUM-1: was signed intrinsic+extrinsic+funding — a different
      // basis than the per-bound children below, and one the children could
      // never sum to. Now the same live model value the children are split
      // FROM (bit-exact Combined = Inner+Outer), basis stamped so the column
      // states it like every other row.
      // Audit MEDIUM-2: "—" (not 0) when absent — a leg worth nothing and a
      // leg nobody can price are different answers; only one is a number.
      positionValue: tx.bought_leg_value_in_dollars?.toFixed(4) ?? "—",
      status: tx.status as "pending" | "completed",
      innerBoundAbs: fmtAbsDisplay(bought_initial_inner_abs),
      outerBoundAbs: fmtAbsDisplay(bought_initial_outer_abs),
      residualinnerBoundAbs: fmtAbsDisplay(bought_residual_inner_abs),
      residualouterBoundAbs: fmtAbsDisplay(bought_residual_outer_abs),
      totalPositionValue: ((tx.trader_equity ?? tx.initial_perp_margin ?? 0)).toFixed(2),
      origin,
      innerBoundValueUsd: tx.bought_inner_bound_value_in_dollars,
      outerBoundValueUsd: tx.bought_outer_bound_value_in_dollars,
      boundValueBasis: tx.leg_value_basis,
      valueBasis: tx.leg_value_basis,
    };

    const soldIntrinsicValue = tx.sold_profit ?? 0;
    const soldExtrinsicValue = tx.sold_residual_value ?? 0;

    // Sell row (sold_* data)
    const sellRow = {
      direction: title(sellRowPerpType),
      quantity: Math.abs(tx.quantity ?? 0).toFixed(6),
      type: title("Sell"),
      pnl: Math.abs(tx.sold_profit ?? 0).toFixed(2),
      innerBound: fmtPctDisplay(sold_initial_inner_pct),
      outerBound: fmtPctDisplay(sold_initial_outer_pct),
      residualinnerBound: fmtPctDisplay(sold_residual_inner_pct),
      residualouterBound: fmtPctDisplay(sold_residual_outer_pct),
      intrinsicValue: soldIntrinsicValue.toFixed(2),
      residualValue: soldExtrinsicValue.toFixed(4),
      funding: fundingValue.toFixed(2),
      // Audit MEDIUM-1/MEDIUM-2: see the buy row's comments above — same
      // fixes, sold side.
      positionValue: tx.sold_leg_value_in_dollars?.toFixed(4) ?? "—",
      status: tx.status as "pending" | "completed",
      innerBoundAbs: fmtAbsDisplay(sold_initial_inner_abs),
      outerBoundAbs: fmtAbsDisplay(sold_initial_outer_abs),
      residualinnerBoundAbs: fmtAbsDisplay(sold_residual_inner_abs),
      residualouterBoundAbs: fmtAbsDisplay(sold_residual_outer_abs),
      totalPositionValue: "0",
      origin,
      innerBoundValueUsd: tx.sold_inner_bound_value_in_dollars,
      outerBoundValueUsd: tx.sold_outer_bound_value_in_dollars,
      boundValueBasis: tx.leg_value_basis,
      valueBasis: tx.leg_value_basis,
    };

    return {
      id: tx.id,
      entries: [perp, buyRow, sellRow],
    };
  });

  // LP-accrued single-leg rows ride the same ledger, tagged origin:"lp" (item 5).
  return [...bandGroups, ...lpGroups];
}

/**
 * Transforms WebSocket perps data to PerpTableEntry format
 */
export function transformPerpsData(
  perps: UserWebSocketPerp[],
  perpQuantity: UserWebSocketPerpQuantity,
  transactions: UserWebSocketTransaction[]
): PerpTableEntry[] {
  if (!Array.isArray(perps)) return [];

  const { longPerpBandsPnl, shortPerpBandsPnl } = aggregateBandsPnlByPerpType(
    transactions ?? []
  );

  const bandsPnlByPerpId = aggregateBandsPnlByPerpId(
    transactions ?? []
  );

  return perps.map((p): PerpTableEntry => {
    const { usedQuantity, availableQuantity } = getSideQuantities(
      perpQuantity as PerpQuantity,
      p.perpType
    );

    const origin = p.origin ?? "opened";
    // Synthetic LP-accrual rows (task #42 accrual half) — same rule as
    // portfolio.ts's REST twin (fetchPerpPositions): the wire stamps
    // entryPrice/initialUsdMargin/fundingAccrued/pnl/leverage as literal 0,
    // not omitted, because there's no entry event to compute them from.
    // Rendering that 0 would be the MEDIUM-2 defect class audit closed on
    // BANDS. `undefined`, not 0 and NOT NaN (audit finding on eafa1b0:
    // `NaN ?? 0` stays NaN — nullish coalescing catches only null/undefined —
    // so any trader-facing accumulator summing these fields must ALSO
    // exclude origin:"lp" rows structurally; this field alone only keeps
    // THIS row's own cells honest).
    const isLpRow = origin === "lp";
    const initialMargin = isLpRow ? undefined : p.initialUsdMargin ?? 0;
    const funding = isLpRow ? undefined : p.fundingAccrued ?? 0;
    const pnl = isLpRow ? undefined : p.pnl ?? 0;
    const bandsPnl = bandsPnlByPerpId.get(p.id) ?? 0;
    const isClosed = p.isClosed || p.isLiquidated;
    const markPrice = isClosed ? p.closeMarkPrice ?? 0 : p.markPrice;
    const traderEquity = isLpRow
      ? undefined
      : (initialMargin ?? 0) + (pnl ?? 0) + (funding ?? 0) + bandsPnl;

    return {
      id: p.id,
      userWallet: p.userWallet,
      token: p.token,
      perpType: p.perpType,
      size: p.btcAmount,
      entryPrice: isLpRow ? undefined : p.entryPrice,
      markPrice: markPrice ?? 0,
      initialMargin,
      funding,
      pnl,
      bandsPnl,
      traderEquity,
      notional: isLpRow
        ? p.btcAmount * (markPrice ?? 0)
        : Number.isFinite(p.btcAmount) && Number.isFinite(p.entryPrice)
          ? p.btcAmount * p.entryPrice
          : (p.usdcAmount ?? 0),
      notionalBasis: isLpRow ? "mark" : "entry",
      leverage: isLpRow ? undefined : p.leverage,
      createdAt: formatDT(p.created_at),
      usedQuantity,
      availableQuantity,
      isClosed,
      origin,
    };
  });
}

/**
 * Transforms WebSocket earn data to EarnTableEntry format
 */
export function transformEarnData(earnPositions: UserWebSocketEarn[]): EarnTableEntry[] {
  if (!Array.isArray(earnPositions) || earnPositions.length === 0) {
    return [];
  }

  return earnPositions.map((p) => ({
    id: p.id,
    userWallet: p.user_wallet,
    status: p.status,
    createdAt: formatDT(p.created_at),
    notionalBtc: p.pool_notional_deposit_btc ?? 0,
    poolStakePct: p.pool_notional_deposit_percentage ?? 0,
    initialMarginUsd: p.pool_notional_deposit_dollar ?? 0,
    pnlUsd: p.earn_pnl_dollar ?? 0,
    lpEquityUsd: p.lp_margin_dollar ?? 0,
    lpLeverage: p.current_lp_leverage ?? 0,
  }));
}

/**
 * Transforms WebSocket liquidation floor data to LiquidationFloorResponse format
 */
export function transformLiquidationFloorData(
  liquidationFloor: UserWebSocketLiquidationFloor
): LiquidationFloorResponse {
  return {
    userWallet: liquidationFloor.userWallet,
    token: liquidationFloor.token,
    market: liquidationFloor.market,
    currentPrice: liquidationFloor.currentPrice,
    liquidationPrice: liquidationFloor.liquidationPrice,
    netBtcAmount: liquidationFloor.netBtcAmount,
    netPerpType: liquidationFloor.netPerpType,
    distanceToLiquidation: liquidationFloor.distanceToLiquidation,
    isLiquidatable: liquidationFloor.isLiquidatable,
    traderEquity: liquidationFloor.traderEquity,
    hasActiveTradeBands: liquidationFloor.hasActiveTradeBands,
  };
}


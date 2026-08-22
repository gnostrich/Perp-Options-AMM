/**
 * Portfolio Data API
 * Handles fetching portfolio data from the backend
 */

import { apiGet, ApiError } from "./client";
import {
  aggregateBandsPnlByPerpType,
  aggregateBandsPnlByPerpId,
  buildLpBandGroup,
  fmtAbsDisplay,
  fmtPctDisplay,
  formatDT,
  getSideQuantities,
  pctToAbsPrice,
  title,
  type LpBandWireRow,
} from "./portfolioTransforms";

export interface TransactionApiItem {
  id: string;
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
  sold_profit: number;
  bought_profit: number;
  sold_initial_value_in_dollars: number;
  bought_initial_value_in_dollars: number;
  perp_market_price: number;
  trader_equity?: number;
  amm_quantity?: number;
  initial_perp_margin?: number;
  perp_dex_margin?: number;
  perp_ids?: string[];
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

interface TransactionsApiResponse {
  transactions: TransactionApiItem[];
  /** LP-accrued single-leg inventory rows, a SIBLING array to `transactions`
   *  (routes/ws_handlers.go:270 `EnhancedResponse.LPPositions`, json "lp_positions" —
   *  NOT more elements of `transactions`, confirmed against ws_lppositions_test.go's
   *  fixture). Absent on an old cached response ⇒ no LP rows render. */
  lp_positions?: LpBandApiRow[];
  perp_quantity: {
    total_btc_amount: number;
    used_quantity: number;
    available_quantity: number;
    perp_count: number;
  };
  total_count: number;
}

export interface PerpAPIItem {
  userWallet: string;
  token: string;
  perpType: "LONG" | "SHORT";
  market: string;
  totalSize: number;
  entryPrice: number;
  currentPrice: number;
  initialMargin?: number;
  funding: number;
  pnl: number;
  bandsPnl?: number;
  unrealizedPnl: number;
  totalNotional: number;
  leverage: number;
  initialLeverage?: number;
  traderEquity?: number;
  closedAt?: string | null;
  closeMarkPrice?: number;
  positionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PerpQuantitySide {
  count?: number;
  total_btc_amount?: number;
  used_quantity?: number;
  available_quantity?: number;
}

export interface PerpQuantity {
  total_btc_amount?: number;
  used_quantity?: number;
  available_quantity?: number;
  perp_count?: number;
  long_positions?: PerpQuantitySide;
  short_positions?: PerpQuantitySide;
}

export interface PerpAggregatedResponse {
  perp_quantity?: PerpQuantity;
  perps: PerpAPIItem[];
}

export interface PerpPositionResponse {
  id: string;
  token: string;
  perpType: "LONG" | "SHORT";
  market: string;
  initialUsdMargin: number;
  usdcAmount: number;
  leverage: number;
  initialLeverage?: number;
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
   *  "opened" — same vocabulary BANDS' origin landed with. No path stamps "lp"
   *  yet; that is a later, separate accrual build. */
  origin?: "opened" | "lp";
}

export interface EarnPosition {
  id: string;
  user_wallet: string;
  status: string;
  created_at: string;
  updated_at: string;
  pool_notional_deposit_btc: number;
  pool_notional_deposit_dollar: number;
  pool_notional_deposit_percentage: number;
  lp_margin_btc: number;
  lp_margin_dollar: number;
  initial_lp_leverage: number;
  current_lp_leverage: number;
  earn_pnl_dollar?: number;
  // Optional fields that may be present in some responses
  lp_notional_btc?: number;
  residual_value_pl?: number;
  price_effect_pl?: number;
  initial_lp_equity_btc?: number;
  current_lp_equity_btc?: number;
  lp_notional_dollar?: number;
  residual_value_pl_dollar?: number;
  price_effect_pl_dollar?: number;
  initial_lp_equity_dollar?: number;
  current_lp_equity_dollar?: number;
  equity_deposit_btc?: number;
  equity_deposit_dollar?: number;
  price_effect_pnl?: number;
}

interface EarnPositionResponse {
  data: EarnPosition;
}

// ==================== Processed Data Types ====================

export interface TableEntry {
  direction: string;
  quantity: string;
  type: string;
  innerBound: string;
  outerBound: string;
  residualinnerBound: string;
  residualouterBound: string;
  intrinsicValue: string;
  residualValue: string;
  pnl: string;
  funding: string;
  positionValue: string;
  status: "pending" | "completed" | "";
  innerBoundAbs?: string;
  outerBoundAbs?: string;
  residualinnerBoundAbs?: string;
  residualouterBoundAbs?: string;
  totalPositionValue: string;
  /** Tags this row's source; absent (old wire) ⇒ "opened" (BANDS ORIGIN round,
   *  owner-ratified). */
  origin: "opened" | "lp";
  /** Set only on a synthesized LP-accrued row: single-leg, no pairing, no
   *  per-leg bound breakout (item 5). */
  isLpRow?: boolean;
  /** LP row's instrument identity ("P 61,750 (−5%)") — fills the BUY/SELL slot
   *  instead of a Buy/Sell action, colored by wing. */
  instrumentLabel?: string;
  instrumentWing?: "call" | "put";
  /** LP row's avg fill premium, native ₿ — "—" when the wire omits it. */
  avgFillPremiumCoin?: string;
  /** LP row's VALUE basis ("bid"/"ask"/"model") — rendered muted beside VALUE;
   *  the "model" fallback must stay visible, never silently dropped. */
  valueBasis?: "bid" | "ask" | "model";
  /** True when the wire omitted plUSD for this LP row — render "—", never guess. */
  plAbsent?: boolean;
  /** This row's OWN bound-value pair (task #34 item 1) — the per-leg breakout
   *  rows read these. Undefined = the wire had no reading for that specific
   *  bound key (absent, never 0): a single-bound leg's outer, or a row the
   *  engine couldn't price at all. */
  innerBoundValueUsd?: number;
  outerBoundValueUsd?: number;
  /** "model" — the only admissible basis (engine.LegValueBasis); present iff
   *  at least one of the two values above is. */
  boundValueBasis?: "model";
}

export interface TableDataGroup {
  id: string;
  entries: TableEntry[];
}

export type PerpType = "LONG" | "SHORT";

export interface PerpTableEntry {
  id: string;
  userWallet: string;
  token: string;
  perpType: PerpType;
  size: number;
  /** Absent (not NaN) on an origin:"lp" row — see notionalBasis below. NaN
   *  would poison any `?? 0` accumulator (nullish coalescing catches only
   *  null/undefined, not NaN); `undefined` makes every existing `field ?? 0`
   *  reducer correct by construction instead of relying on a filter to keep
   *  the value from ever reaching one (audit finding on eafa1b0). */
  entryPrice?: number;
  markPrice: number;
  initialMargin?: number;
  funding?: number;
  pnl?: number;
  bandsPnl?: number;
  unrealizedPnl?: number;
  traderEquity?: number;
  notional: number;
  leverage?: number;
  createdAt: string;
  usedQuantity: number;
  availableQuantity: number;
  isClosed: boolean;
  isLiquidated?: boolean;
  /** Tags this row's source; defaulted to "opened" at fetch time (task #42,
   *  DISPLAY HALF ONLY — same vocabulary BANDS' origin landed with). LP rows
   *  must be filtered out of any trader-facing accumulator BEFORE reducing —
   *  never relied on structurally by a field happening to be absent/0 (#41
   *  law; audit finding on eafa1b0 required this at OverviewContent.tsx and
   *  tableContainer.tsx's own PERPS P/L sums). */
  origin: "opened" | "lp";
  /** Basis `notional` was computed on (task #42 ACCRUAL HALF). "entry" — a
   *  real trader position, size×entryPrice. "mark" — an origin:"lp" accrual
   *  row: it has no entry event, so size×markPrice (current mark) is the only
   *  honest reading. Absent on old cached data ⇒ treat as "entry". */
  notionalBasis?: "entry" | "mark";
}

export interface EarnTableEntry {
  id: string;
  userWallet: string;
  status: string;
  createdAt: string;
  /** pool_notional_deposit_btc */
  notionalBtc: number;
  /** pool_notional_deposit_percentage (as raw fraction, e.g. 0.916…) */
  poolStakePct: number;
  /** pool_notional_deposit_dollar */
  initialMarginUsd: number;
  /** earn_pnl_dollar */
  pnlUsd: number;
  /** lp_margin_dollar */
  lpEquityUsd: number;
  /** current_lp_leverage */
  lpLeverage: number;
}

export interface LiquidationFloorResponse {
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

// ==================== Public API Functions ====================

/**
 * Fetches portfolio transactions for a wallet address
 */
export async function fetchPortfolioTransactions(
  walletAddress: string
): Promise<TransactionsApiResponse> {
  return apiGet<TransactionsApiResponse>(
    `/settlements/users/${walletAddress}/transactions`
  );
}

/**
 * Fetches and processes portfolio data into table format
 */
export async function fetchPortfolioData(
  walletAddress: string,
  currentMarkPrice?: number
): Promise<TableDataGroup[]> {
  if (!walletAddress) return [];

  const raw = await fetchPortfolioTransactions(walletAddress);
  const transactions = raw.transactions;

  if (!transactions || transactions.length === 0) {
    return raw.lp_positions?.length ? raw.lp_positions.map(buildLpBandGroup) : [];
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

    const perp: TableEntry = {
      direction: tx.perp_type.charAt(0).toUpperCase() + tx.perp_type.slice(1),
      status: "",
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

    // Create buy/long row with bought data - labels tied to data
    const buyLongRow: TableEntry = {
      direction: title(buyRowPerpType),
      quantity: Math.abs(tx.amm_quantity ?? tx.quantity).toFixed(6),
      type: title("Buy"),
      pnl: Math.abs(tx.bought_profit).toFixed(2),
      innerBound: fmtPctDisplay(bought_initial_inner_pct),
      outerBound: fmtPctDisplay(bought_initial_outer_pct),
      residualinnerBound: fmtPctDisplay(bought_residual_inner_pct),
      residualouterBound: fmtPctDisplay(bought_residual_outer_pct),
      intrinsicValue: Math.abs(tx.bought_profit).toFixed(2),
      residualValue: Math.abs(tx.bought_initial_value_in_dollars ?? 0).toFixed(4),
      funding: "0",
      // Audit MEDIUM-1: was frozen-at-cron-tick |initial_value|+|profit| — a
      // different basis than the per-bound children below, and one the
      // children could never sum to. Now the same live model value the
      // children are split FROM (bit-exact Combined = Inner+Outer), basis
      // stamped so the column states it like every other row.
      // Audit MEDIUM-2: "—" (not 0) when absent — a leg worth nothing and a
      // leg nobody can price are different answers; only one is a number.
      positionValue: tx.bought_leg_value_in_dollars?.toFixed(4) ?? "—",
      status: tx.status as "pending" | "completed",
      innerBoundAbs: fmtAbsDisplay(bought_initial_inner_abs),
      outerBoundAbs: fmtAbsDisplay(bought_initial_outer_abs),
      residualinnerBoundAbs: fmtAbsDisplay(bought_residual_inner_abs),
      residualouterBoundAbs: fmtAbsDisplay(bought_residual_outer_abs),
      totalPositionValue: Math.abs(tx.trader_equity ?? tx.initial_perp_margin ?? 0).toFixed(2),
      origin,
      innerBoundValueUsd: tx.bought_inner_bound_value_in_dollars,
      outerBoundValueUsd: tx.bought_outer_bound_value_in_dollars,
      boundValueBasis: tx.leg_value_basis,
      valueBasis: tx.leg_value_basis,
    };

    // Create sell/short row with sold data - labels tied to data
    const sellShortRow: TableEntry = {
      direction: title(sellRowPerpType),
      quantity: Math.abs(tx.quantity).toFixed(6),
      type: title("Sell"),
      pnl: Math.abs(tx.sold_profit).toFixed(2),
      innerBound: fmtPctDisplay(sold_initial_inner_pct),
      outerBound: fmtPctDisplay(sold_initial_outer_pct),
      residualinnerBound: fmtPctDisplay(sold_residual_inner_pct),
      residualouterBound: fmtPctDisplay(sold_residual_outer_pct),
      intrinsicValue: Math.abs(tx.sold_profit).toFixed(2),
      residualValue: Math.abs(tx.sold_initial_value_in_dollars ?? 0).toFixed(4),
      funding: "0",
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


    // Assign rows dynamically based on order - labels come from data, not position
    const isNormalOrder = buyLongRow.direction.toLowerCase() === "long";
    const longRow = isNormalOrder ? buyLongRow : sellShortRow;
    const shortRow = isNormalOrder ? sellShortRow : buyLongRow;

    return {
      id: tx.id,
      entries: [perp, longRow, shortRow],
    };
  });

  // LP-accrued single-leg rows ride the same ledger, tagged origin:"lp" (item 5).
  // Absent on an old cached response ⇒ no LP groups appended, never guessed.
  const lpGroups = raw.lp_positions?.map(buildLpBandGroup) ?? [];
  return [...bandGroups, ...lpGroups];
}

/**
 * Fetches aggregated perp positions for a wallet address
 */
export async function fetchPerpPositionsData(
  walletAddress: string
): Promise<PerpAggregatedResponse> {
  return apiGet<PerpAggregatedResponse>(
    `/settlements/users/${walletAddress}/perps/aggregated`
  );
}

/**
 * Fetches perp positions directly from /perps endpoint
 */
export async function fetchPerpPositionsDirect(
  walletAddress: string
): Promise<PerpPositionResponse[]> {
  return apiGet<PerpPositionResponse[]>(
    `/settlements/users/${walletAddress}/perps`
  );
}

/**
 * Fetches and processes perp positions into table format
 */
export async function fetchPerpPositions(
  walletAddress: string
): Promise<PerpTableEntry[]> {
  if (!walletAddress) return [];

  try {
    // Make two parallel API calls
    const [aggregatedData, positionsData, txData] = await Promise.all([
      fetchPerpPositionsData(walletAddress),
      fetchPerpPositionsDirect(walletAddress),
      fetchPortfolioTransactions(walletAddress),
    ]);

    if (!Array.isArray(positionsData)) return [];

    const { longPerpBandsPnl, shortPerpBandsPnl } = aggregateBandsPnlByPerpType(
      txData?.transactions ?? []
    );

    const bandsPnlByPerpId = aggregateBandsPnlByPerpId(
      txData?.transactions ?? []
    );

    return positionsData.map((p): PerpTableEntry => {
      const { usedQuantity, availableQuantity } = getSideQuantities(
        aggregatedData.perp_quantity,
        p.perpType
      );

      const origin = p.origin ?? "opened";
      // Synthetic LP-accrual rows (task #42 accrual half): the wire stamps
      // entryPrice/initialUsdMargin/fundingAccrued/pnl/leverage as literal 0
      // (Go zero value, not omitted — there's no entry event to compute them
      // from), which would otherwise render as fabricated $0.00 — the exact
      // MEDIUM-2 defect class audit closed on BANDS. `undefined`, not 0 and
      // NOT NaN (audit finding on eafa1b0: `NaN ?? 0` is still NaN — nullish
      // coalescing catches only null/undefined — so any accumulator summing
      // these fields must ALSO exclude origin:"lp" rows structurally; this
      // field alone only stops THIS row's own cells from lying). Only
      // direction, size and mark-based notional are real.
      const isLpRow = origin === "lp";
      const initialMargin = isLpRow ? undefined : p.initialUsdMargin ?? 0;
      const funding = isLpRow ? undefined : p.fundingAccrued ?? 0;
      const pnl = isLpRow ? undefined : p.pnl ?? 0;
      const bandsPnl = bandsPnlByPerpId.get(p.id) ?? 0;
      const isClosed = p.isClosed || p.isLiquidated;
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
        markPrice: p.markPrice,
        initialMargin,
        funding,
        pnl,
        bandsPnl,
        traderEquity,
        notional: isLpRow ? p.btcAmount * p.markPrice : p.btcAmount * p.entryPrice,
        notionalBasis: isLpRow ? "mark" : "entry",
        leverage: isLpRow ? undefined : p.leverage,
        createdAt: formatDT(p.created_at),
        usedQuantity,
        availableQuantity,
        isClosed,
        isLiquidated: p.isLiquidated,
        origin,
      };
    });
  } catch (error: any) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    throw new Error(
      `Failed to fetch perp positions: ${error?.message || "Unknown error"}`
    );
  }
}

/**
 * Gets perp quantities for a wallet address
 */
export async function getPerpQuantities(
  walletAddress: string
): Promise<{ long: number; short: number }> {
  if (!walletAddress) return { long: 0, short: 0 };

  try {
    const data = await fetchPerpPositionsData(walletAddress);

    return {
      long: Number(data?.perp_quantity?.long_positions?.available_quantity ?? 0),
      short: Number(
        data?.perp_quantity?.short_positions?.available_quantity ?? 0
      ),
    };
  } catch {
    return { long: 0, short: 0 };
  }
}

/**
 * Fetches liquidation floor data for a wallet address
 */
export async function fetchLiquidationFloor(
  walletAddress: string
): Promise<LiquidationFloorResponse> {
  return apiGet<LiquidationFloorResponse>(
    `/settlements/users/${walletAddress}/liquidation-floor?token=BTC&market=BTC-PERP`
  );
}

/**
 * Fetches earn position data for a wallet address
 */
export async function fetchEarnPositionData(
  walletAddress: string
): Promise<EarnPositionResponse> {
  return apiGet<EarnPositionResponse>(`/earn/positions/${walletAddress}`);
}

/**
 * Fetches and processes earn portfolio data into table format
 */
export async function fetchEarnPortfolioData(
  walletAddress: string
): Promise<EarnTableEntry[]> {
  if (!walletAddress) return [];

  try {
    const responseData = await fetchEarnPositionData(walletAddress);
    const positionData = responseData.data;

    if (!positionData) return []; // Return empty array if data is missing

    const tableEntry: EarnTableEntry = {
      id: positionData.id,
      userWallet: positionData.user_wallet,
      status: positionData.status,
      createdAt: formatDT(positionData.created_at),
      notionalBtc: positionData.pool_notional_deposit_btc ?? 0,
      poolStakePct: positionData.pool_notional_deposit_percentage ?? 0,
      initialMarginUsd: positionData.pool_notional_deposit_dollar ?? 0,
      pnlUsd: positionData.earn_pnl_dollar ?? 0,
      lpEquityUsd: positionData.lp_margin_dollar ?? 0,
      lpLeverage: positionData.current_lp_leverage ?? 0,
    };

    return [tableEntry];
  } catch (error: any) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    console.error("Error fetching earn positions:", error);
    return [];
  }
}

// ==================== Pool State ====================

export interface PoolStateData {
  fee_btc: number;
  fee_dollar: number;
  lp_leverage: number;
  margin_btc: number;
  margin_dollar: number;
  net_residual_value_btc: number;
  net_residual_value_dollar: number;
  notional_deposit_btc: number;
  notional_deposit_dollar: number;
  notional_nav_btc: number;
  notional_nav_dollar: number;
  pnl_btc: number;
  pnl_dollar: number;
  price_effect_btc: number;
  price_effect_dollar: number;
}

interface PoolStateResponse {
  data: PoolStateData;
  success: boolean;
}

/**
 * Fetches the current pool state (TVL, leverage, PnL, etc.)
 */
export async function fetchPoolState(): Promise<PoolStateResponse> {
  return apiGet<PoolStateResponse>("/earn/pool-state");
}

/**
 * Shared portfolio transform helpers.
 *
 * This file exists to prevent calculation drift between:
 * - REST-based portfolio transforms in `portfolio.ts`
 * - WebSocket-based portfolio transforms in `websocket.ts`
 *
 * IMPORTANT: keep this file free of imports from `./portfolio` to avoid circular deps
 * (since `portfolio.ts` imports from here).
 */

type PerpType = "LONG" | "SHORT";
type PerpQuantitySide = { used_quantity?: number; available_quantity?: number };
type PerpQuantity = { long_positions?: PerpQuantitySide; short_positions?: PerpQuantitySide };

export function title(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function pctToAbsPrice(
  pct: number | undefined | null,
  mark: number,
  side: "long" | "short"
): number | undefined {
  if (!Number.isFinite(mark) || mark <= 0) return undefined;
  if (pct === undefined || pct === null || !Number.isFinite(pct)) return undefined;
  // treat exact zero as "no bound"
  if (Number(pct) === 0) return undefined;
  const p = Math.abs(pct);
  return side === "long" ? mark * (1 + p / 100) : mark * (1 - p / 100);
}

export function fmtPctDisplay(v: number | undefined | null): string {
  if (v === undefined || v === null || !Number.isFinite(v)) return "----";
  if (Number(v) === 0) return "----";
  return Math.abs(v).toFixed(2);
}

export function fmtAbsDisplay(v: number | undefined | null): string {
  if (v === undefined || v === null || !Number.isFinite(v)) return "----";
  if (Number(v) === 0) return "----";
  return v.toFixed(2);
}

export const formatDT = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

export function getSideQuantities(
  pq: PerpQuantity | undefined,
  side: PerpType
): { usedQuantity: number; availableQuantity: number } {
  const sideObj = side === "LONG" ? pq?.long_positions : pq?.short_positions;
  const usedQuantity = sideObj?.used_quantity ?? 0;
  const availableQuantity = sideObj?.available_quantity ?? 0;
  return { usedQuantity, availableQuantity };
}

export function aggregateBandsPnlByPerpType(
  transactions: Array<{
    type: "buy" | "sell";
    perp_type: "long" | "short";
    bought_initial_value_in_dollars?: number;
    sold_initial_value_in_dollars?: number;
    bought_profit?: number;
    sold_profit?: number;
    bought_residual_value?: number;
    sold_residual_value?: number;
    is_auto_protect?: boolean;
    perp_ids?: string[];
  }>
): { longPerpBandsPnl: number; shortPerpBandsPnl: number } {
  let longPerpBandsPnl = 0;
  let shortPerpBandsPnl = 0;

  for (const tx of transactions) {
    const boughtIntrinsicValue = Number(tx.bought_profit ?? 0) || 0;
    const boughtExtrinsicValue = Number(tx.bought_residual_value ?? 0) || 0;
    const soldIntrinsicValue = Number(tx.sold_profit ?? 0) || 0;
    const soldExtrinsicValue = Number(tx.sold_residual_value ?? 0) || 0;
    // Total Position Value = Position Value Of Bought Band - Position Value Of Sold Band
    const boughtPositionValue = boughtIntrinsicValue + boughtExtrinsicValue;
    const soldPositionValue = soldIntrinsicValue + soldExtrinsicValue;
    const totalPositionValue = boughtPositionValue - soldPositionValue;
    // Long Perp Bands P/L:
    // - Long Band Sold, Short Band Bought => (sell,long) or (buy,short)
    const goesToLongPerp =
      (tx.type === "sell" && tx.perp_type === "long") ||
      (tx.type === "buy" && tx.perp_type === "short");
    // Short Perp Bands P/L:
    // - Short Band Sold, Long Band Bought => (sell,short) or (buy,long)
    const goesToShortPerp =
      (tx.type === "sell" && tx.perp_type === "short") ||
      (tx.type === "buy" && tx.perp_type === "long");
    if (goesToLongPerp) longPerpBandsPnl += totalPositionValue;
    if (goesToShortPerp) shortPerpBandsPnl += totalPositionValue;
  }

  return { longPerpBandsPnl, shortPerpBandsPnl };
}

/* ── BANDS ORIGIN round: LP-accrued single-leg rows ─────────────────────────
 * Wire shape landed backend-side at commit 4915797 (owner-ratified spec, item
 * 5): `engine.LPPosition` (amm/engine/lppositions.go:24), verified field-for-
 * field (10 keys, JSON tags) against `ws_lppositions_test.go`'s own fixture —
 * each LP-accrued inventory position rides the bands ledger tagged origin:"lp",
 * single-leg (no Buy+Sell pairing, no inner/outer band — a crystallised strike
 * has none to report). Every field beyond the required core is absent-field-
 * honest (the utilizationBasis precedent): render "—", never guessed.
 */
export interface LpBandWireRow {
  origin: "lp";
  id: string;
  wing: string; // "call" | "put"; kbps' own sign already implies this (put<0, call>0)
  kbps: number; // signed k-offset in bps; live-reconstructed on pre-law rows (backend doc fix), not frozen — nothing to render differently here
  strikeUSD: number;
  qtyCoin: number; // signed: + long, − short
  avgFillPremiumCoin?: number; // omitempty on the wire (Go *float64) — absent, never 0
  valueUSD: number;
  valueBasis: "bid" | "ask" | "model";
  /** Fee-EXCLUSIVE by design (audit note, post-4915797): the LP banked its fee
   *  separately at fill time as maker, on raw entry basis — a band row's own
   *  intrinsicValue/pnl is fee-inclusive, a different basis; the table's P/L
   *  cell must label this (the valueBasis precedent), not just this type.
   *  omitempty on the wire (Go *float64) — absent, never 0. */
  plUSD?: number;
  /** The close-accrued sweep's OWN predicate, computed backend-side with the
   *  same own-rungs exclusion MatchExit uses (audit B1). Distinct from
   *  valueBasis: the value law prices off the aggregate book, own depth
   *  included, so a row priced "bid" by the LP's own rung can still be
   *  closable:false — nobody else is resting on the side it needs. */
  closable: boolean;
}

/** The shipped BANDS instrument label for an LP-accrued row — "P 61,750 (−5%)"
 *  — reused verbatim anywhere else an LP-accrued position needs a human label
 *  (e.g. the close-accrued confirm dialog, task #36b): never a dated/placeholder
 *  notation like a synthetic option symbol. */
export function lpInstrumentLabel(r: Pick<LpBandWireRow, "wing" | "kbps" | "strikeUSD">): string {
  const wing: "call" | "put" = r.wing?.toLowerCase() === "put" ? "put" : "call";
  const pctOffset = r.kbps / 100;
  const strikeLabel = r.strikeUSD.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return `${wing === "put" ? "P" : "C"} ${strikeLabel} (${pctOffset >= 0 ? "+" : ""}${pctOffset.toFixed(0)}%)`;
}

/** One LP-accrued wire row → one standalone table group: single-leg, no pairing,
 *  bounds "—" throughout (item 5). Structural return type matches `TableEntry`
 *  (portfolio.ts) without importing it, per this file's no-circular-import rule. */
export function buildLpBandGroup(r: LpBandWireRow) {
  const wing: "call" | "put" = r.wing?.toLowerCase() === "put" ? "put" : "call";
  const instrumentLabel = lpInstrumentLabel(r);

  return {
    id: r.id,
    entries: [
      {
        origin: "lp" as const,
        isLpRow: true,
        instrumentLabel,
        instrumentWing: wing,
        direction: r.qtyCoin >= 0 ? "Long" : "Short",
        status: "completed" as const,
        quantity: r.qtyCoin.toFixed(6),
        type: "lp",
        avgFillPremiumCoin:
          r.avgFillPremiumCoin != null ? r.avgFillPremiumCoin.toFixed(5) : undefined,
        valueBasis: r.valueBasis,
        pnl: (r.plUSD ?? 0).toFixed(2),
        intrinsicValue: (r.plUSD ?? 0).toFixed(2),
        plAbsent: r.plUSD == null,
        residualValue: "0",
        funding: "0",
        positionValue: r.valueUSD.toFixed(4),
        innerBound: "—",
        outerBound: "—",
        residualinnerBound: "—",
        residualouterBound: "—",
        totalPositionValue: "0",
      },
    ],
  };
}

export function aggregateBandsPnlByPerpId(
  transactions: Array<{
    type: "buy" | "sell";
    perp_type: "long" | "short";
    bought_initial_value_in_dollars?: number;
    sold_initial_value_in_dollars?: number;
    bought_profit?: number;
    sold_profit?: number;
    bought_residual_value?: number;
    sold_residual_value?: number;
    is_auto_protect?: boolean;
    perp_ids?: string[];
  }>
): Map<string, number> {
  const bandsPnlByPerpId = new Map<string, number>();

  for (const tx of transactions) {
    if (!tx.perp_ids || tx.perp_ids.length === 0) continue;
    
    // We only expect one perp_id per transaction representing the band
    const perpId = tx.perp_ids[0];

    // Compute the PnL of this transaction representing a band position change
    const boughtIntrinsicValue = Number(tx.bought_profit ?? 0) || 0;
    const boughtExtrinsicValue = Number(tx.bought_residual_value ?? 0) || 0;
    const soldIntrinsicValue = Number(tx.sold_profit ?? 0) || 0;
    const soldExtrinsicValue = Number(tx.sold_residual_value ?? 0) || 0;
    
    // Total Position Value = Position Value Of Bought Band - Position Value Of Sold Band
    const boughtPositionValue = boughtIntrinsicValue + boughtExtrinsicValue;
    const soldPositionValue = soldIntrinsicValue + soldExtrinsicValue;
    const totalPositionValue = boughtPositionValue - soldPositionValue;

    // A band payout increases the bands PnL of that associated perp position
    const isRelevantToAnyPerp =
      (tx.type === "sell" && tx.perp_type === "long") ||
      (tx.type === "buy" && tx.perp_type === "short") ||
      (tx.type === "sell" && tx.perp_type === "short") ||
      (tx.type === "buy" && tx.perp_type === "long");

    if (isRelevantToAnyPerp) {
      const currentPnl = bandsPnlByPerpId.get(perpId) ?? 0;
      bandsPnlByPerpId.set(perpId, currentPnl + totalPositionValue);
    }
  }

  return bandsPnlByPerpId;
}


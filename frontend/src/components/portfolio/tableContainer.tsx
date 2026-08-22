"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { ArrowUpDown, ArrowDownNarrowWide, ArrowUpWideNarrow, Droplets, TrendingUp, Layers, TrendingDown, Waves, BookAlertIcon, WalletIcon, ArrowUpRight, ArrowDownRight, Menu, Minus, X } from "lucide-react";

import { TableDataGroup } from "@/lib/data";
import { completeTransactionAction } from "@/app/actions/completeTransactionAction";
import { chakraPetch, ibmPlexMono } from "@/lib/font";
import { toast } from "sonner";
import BentoGrid from "./MiniComponents/BentoGrid";
import { BentoContent } from "./MiniComponents/BentoBox";
import { usePortfolioStore } from "@/store/portfolioStore";
import { aggregateBandsPnlByPerpType } from "@/lib/data/api/portfolioTransforms";


/* -------------------------------------------------------------------------- */
/* Pagination helper                                                          */
/* -------------------------------------------------------------------------- */

const DOTS = "...";

interface PaginationRangeProps {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}

function usePaginationRange({
  currentPage,
  totalPages,
  siblingCount = 1,
}: PaginationRangeProps): Array<number | string> {
  const totalPageNumbers = siblingCount * 2 + 5;
  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < totalPages - 1;

  const pages: Array<number | string> = [1];

  if (showLeftDots) pages.push(DOTS);

  for (
    let i = showLeftDots ? leftSiblingIndex : 2;
    i <= (showRightDots ? rightSiblingIndex : totalPages - 1);
    i++
  ) {
    pages.push(i);
  }

  if (showRightDots) pages.push(DOTS);

  pages.push(totalPages);
  return pages;
}

interface Props {
  tableData: TableDataGroup[];
  loading: boolean;
  isPercentageMode: boolean;
}

// Helper function to format currency values
function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  const sign = value >= 0 ? "+" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Helper function to format currency without sign prefix
function formatCurrencyNoSign(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  return `$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Helper: format number to max 4 decimal places
function formatDecimal(val: number, isCurrency = false) {
  if (!Number.isFinite(val)) return "-";
  return val.toLocaleString("en-US", {
    style: isCurrency ? "currency" : "decimal",
    currency: "USD",
    maximumFractionDigits: 4,
    minimumFractionDigits: isCurrency ? 2 : 0, // Keeps prices looking like prices ($10.50 instead of $10.5)
  });
}

/* -------------------------------------------------------------------------- */
/* Column definition                                                          */
/* -------------------------------------------------------------------------- */

type RowData = {
  id: number | string;
  /** flattened entry props so we can sort on individual columns easily   */
  direction: string;
  quantity: string;
  type: string;
  innerBound: string;
  outerBound: string;
  residualinnerBound: string;
  residualouterBound: string;
  intrinsicValue: string;
  residualValue: string;
  funding: string;
  positionValue: string;
  /** used to locate button placement */
  isFirstRowOfPair: boolean;
  status: "pending" | "completed" | "";
  totalPositionValue: string;
  /** Tags this row's source; absent (old wire) ⇒ "opened" (BANDS ORIGIN round). */
  origin: "opened" | "lp";
  /** Set only on a synthesized LP-accrued row: single-leg, no pairing, no
   *  per-leg bound breakout. */
  isLpRow?: boolean;
  instrumentLabel?: string;
  instrumentWing?: "call" | "put";
  avgFillPremiumCoin?: string;
  valueBasis?: "bid" | "ask" | "model";
  plAbsent?: boolean;
  /** This row's OWN bound-value pair (task #34 item 1) — the per-leg breakout
   *  rows read these. Undefined = the wire had no reading for that specific
   *  bound key (absent, never 0): a single-bound leg's outer, or a row the
   *  engine couldn't price at all. */
  innerBoundValueUsd?: number;
  outerBoundValueUsd?: number;
  /** "model" — the only admissible basis; present iff at least one of the two
   *  values above is. */
  boundValueBasis?: "model";
};

function parseOrZero(s: string): number {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function flattenData(groups: TableDataGroup[], isPercentageMode: boolean): RowData[] {
  return groups.flatMap((g) =>
    g.entries.map((e, idx) => {
      // pick between percent vs absolute strings for bounds
      const pick = (pctStr: string, absStr?: string) => {
        if (isPercentageMode) return pctStr ?? "----";
        // prefer abs if available and not "----"
        return absStr && absStr !== "----" ? absStr : pctStr ?? "----";
      };

      return {
        id: g.id,
        // idx 0 = perp (empty), idx 1 = long (first of the pair)
        isFirstRowOfPair: idx === 1,
        direction: e.direction,
        status: e.status,
        quantity: e.quantity,
        type: e.type,
        innerBound: pick(e.innerBound, e.innerBoundAbs),
        outerBound: pick(e.outerBound, e.outerBoundAbs),
        residualinnerBound: pick(e.residualinnerBound, e.residualinnerBoundAbs),
        residualouterBound: pick(e.residualouterBound, e.residualouterBoundAbs),
        intrinsicValue: e.intrinsicValue,
        residualValue: e.residualValue,
        funding: e.funding,
        positionValue: e.positionValue,
        totalPositionValue: e.totalPositionValue,
        origin: e.origin ?? "opened",
        isLpRow: e.isLpRow,
        instrumentLabel: e.instrumentLabel,
        instrumentWing: e.instrumentWing,
        avgFillPremiumCoin: e.avgFillPremiumCoin,
        valueBasis: e.valueBasis,
        plAbsent: e.plAbsent,
        innerBoundValueUsd: e.innerBoundValueUsd,
        outerBoundValueUsd: e.outerBoundValueUsd,
        boundValueBasis: e.boundValueBasis,
      };
    })
  );
}

export default function TableContainer({ tableData, loading, isPercentageMode }: Props) {
  /* ------------------- ORIGIN screen (BANDS ORIGIN round) ----------------- */
  // Every group is homogeneous in origin by construction (a trader tx group is
  // 100% "opened", an LP-accrued group is 100% "lp") — checking entries[0] suffices.
  // LP rows default HIDDEN (owner ruling, 2026-07-30 — task #41): BANDS is the trader's
  // own opened-position ledger; LP-accrued inventory is a different economic object
  // (its P/L lives in EARN's own aggregates, not here — see the PNL SUMMARY trace below)
  // and showing it by default read as mixed. Still one click away, same checkbox.
  const [showOpened, setShowOpened] = React.useState(true);
  const [showLp, setShowLp] = React.useState(false);
  const screenedTableData = React.useMemo(
    () =>
      tableData.filter((g) => {
        const origin = g.entries[0]?.origin ?? "opened";
        return origin === "lp" ? showLp : showOpened;
      }),
    [tableData, showOpened, showLp]
  );

  /* ------------------------------- TABLE --------------------------------- */
  // PAGINATION-BY-GROUP (task #34 item 2): the unit is a BAND (one TableDataGroup
  // — a trader's Buy/Sell pair, or one standalone LP row), never a flattened row.
  // A trader group now renders up to 7 rows (perp[skipped], Long, its 2 bound
  // rows, Short, its 2 bound rows, Totals) once the per-bound breakout (item 4)
  // is counted — TanStack's row-level `getPaginationRowModel` counted FLATTENED
  // rows, so a page's row budget could split a group's own rows across two pages
  // (reported gap, 2026-07-30 BANDS ORIGIN entry). Fix: page `screenedTableData`
  // itself (groups) BEFORE flattening, and feed the table only the current
  // page's already-flattened rows — `getCoreRowModel` alone, no further
  // row-level pagination on top.
  const GROUP_PAGE_SIZE = 2;
  const [groupPageIndex, setGroupPageIndex] = React.useState(0);
  const groupPageCount = Math.max(1, Math.ceil(screenedTableData.length / GROUP_PAGE_SIZE));
  // Clamp only — never force back to page 0 on every data refresh (a live poll
  // reloading the SAME group count shouldn't kick the viewer off their page).
  React.useEffect(() => {
    setGroupPageIndex((i) => Math.min(i, groupPageCount - 1));
  }, [groupPageCount]);
  const pagedGroups = React.useMemo(
    () => screenedTableData.slice(groupPageIndex * GROUP_PAGE_SIZE, (groupPageIndex + 1) * GROUP_PAGE_SIZE),
    [screenedTableData, groupPageIndex]
  );
  const data = React.useMemo(
    () => flattenData(pagedGroups, isPercentageMode),
    [pagedGroups, isPercentageMode]
  );

  // Get perp data and liquidation margin from store for bento calculations
  const perpData = usePortfolioStore((s) => s.perpData);
  const { liquidationMarginTotal, loadingLiquidationFloor } = usePortfolioStore();
  // Get bands data from store for consistency with PerpTableContainer
  const bandsDataFromStore = usePortfolioStore((s) => s.tableData);
  // Get raw transactions for correct BANDS P/L calculation
  const rawTransactions = usePortfolioStore((s) => s.rawTransactions);

  // Calculate bento box content dynamically from tableData and perpData
  const bandsBentoContent = React.useMemo<BentoContent>(() => {
    // Active positions (open only) — used for equity/capacity/notional metrics.
    // origin:"lp" rows are excluded here too: THE TOTALS ARE THE TRADER'S
    // (ws_lpperps_test.go pins btc_amount_total == 0 for a curve's synthetic
    // position), and totalNotional below is this card's leverage numerator —
    // it must sit on the same population as its Trader Equity denominator.
    const activePerpData = perpData.filter(
      (entry) => !entry.isClosed && (entry.origin ?? "opened") === "opened"
    );

    // Calculate Trader Equity Long
    const traderEquityLong = activePerpData
      .filter((entry) => entry.perpType === "LONG")
      .reduce((sum, entry) => sum + (entry.traderEquity ?? 0), 0);

    // Calculate Trader Equity Short
    const traderEquityShort = activePerpData
      .filter((entry) => entry.perpType === "SHORT")
      .reduce((sum, entry) => sum + (entry.traderEquity ?? 0), 0);

    // Trader Equity = Trader Equity Long + Trader Equity Short
    const traderEquitySum = traderEquityLong + traderEquityShort;

    // Calculate PERPS P/L - sum ALL positions (open + closed). origin:"lp"
    // rows (task #42 accrual half) are excluded BEFORE the reduce — the same
    // #41 law BANDS' own sum already follows (comment below), never relied
    // on a field happening to default to 0 (audit finding on eafa1b0).
    const perpsPnlSum = perpData
      .filter((entry) => (entry.origin ?? "opened") === "opened")
      .reduce((sum, entry) => sum + (entry.pnl ?? 0), 0);
    const isPerpsPnlPositive = perpsPnlSum >= 0;

    // Calculate BANDS P/L - include ALL transactions (open + closed)
    // Verified (task #41, 2026-07-30): this already EXCLUDES LP-accrued P/L, by
    // construction rather than by filter. `rawTransactions` is `portfolioStore`'s
    // `data.transactions.transactions` (the trader buy/sell ledger) — a structurally
    // separate wire field from `data.transactions.lp_positions` (`rawLpRows`), which
    // only ever feeds `screenedTableData`/row rendering via `buildLpBandGroup`
    // (portfolioTransforms.ts) and never reaches `aggregateBandsPnlByPerpType`. Same
    // separation holds on both the REST (`portfolio.ts` fetchPortfolioData) and WS
    // (`websocket.ts` transformTransactionsData) paths. LP-accrued P/L is visible only
    // per-row here (origin:"lp" rows' own P/L cell) and in EARN's own aggregates
    // (earnTableContainer.tsx) — this summary strip was never at risk of double-
    // counting it, no fix needed.
    const { longPerpBandsPnl, shortPerpBandsPnl } = aggregateBandsPnlByPerpType(
      rawTransactions ?? []
    );
    const bandsPnlSum = longPerpBandsPnl + shortPerpBandsPnl;
    const isBandsPnlPositive = bandsPnlSum >= 0;

    // Calculate Perp Capacity for Long positions (convert BTC to USD using entryPrice)
    const longPositions = activePerpData.filter((entry) => entry.perpType === "LONG");
    const longUsedQuantity = longPositions.reduce((sum, entry) => {
      const btcQuantity = entry.usedQuantity ?? 0;
      const entryPrice = entry.entryPrice ?? 0;
      return sum + (btcQuantity * entryPrice);
    }, 0);
    const longAvailableQuantity = longPositions.reduce((sum, entry) => {
      const btcQuantity = entry.availableQuantity ?? 0;
      const entryPrice = entry.entryPrice ?? 0;
      return sum + (btcQuantity * entryPrice);
    }, 0);
    const longMax = longUsedQuantity + longAvailableQuantity;

    // Calculate Perp Capacity for Short positions (convert BTC to USD using entryPrice)
    const shortPositions = activePerpData.filter((entry) => entry.perpType === "SHORT");
    const shortUsedQuantity = shortPositions.reduce((sum, entry) => {
      const btcQuantity = entry.usedQuantity ?? 0;
      const entryPrice = entry.entryPrice ?? 0;
      return sum + (btcQuantity * entryPrice);
    }, 0);
    const shortAvailableQuantity = shortPositions.reduce((sum, entry) => {
      const btcQuantity = entry.availableQuantity ?? 0;
      const entryPrice = entry.entryPrice ?? 0;
      return sum + (btcQuantity * entryPrice);
    }, 0);
    const shortMax = shortUsedQuantity + shortAvailableQuantity;

    // Format liquidation margin
    const liquidationMarginValue =
      loadingLiquidationFloor
        ? "$----"
        : liquidationMarginTotal !== null && liquidationMarginTotal !== undefined
          ? formatCurrencyNoSign(liquidationMarginTotal)
          : "$----";

    // Calculate total notional - sum all notional values from perpData
    const totalNotional = activePerpData.reduce((sum, entry) => {
      return sum + (entry.notional ?? 0);
    }, 0);

    // Calculate total PNL for Total PNL subsection
    const totalPnlSum = perpsPnlSum + bandsPnlSum;
    const isTotalPnlPositive = totalPnlSum >= 0;

    return {
      riskHealth: {
        type: "keyValue",
        title: "RISK & COLLATERAL HEALTH",
        infoText: "The risk and collateral health of the trader's portfolio.",
        keyValues: [
          { label: "Total Notional", value: formatCurrencyNoSign(totalNotional), titleIcon: <Layers className="h-4 w-4 text-[#C9C8C8]" /> },
          { label: "Trader Equity", value: formatCurrencyNoSign(traderEquitySum), titleIcon: <WalletIcon className="h-4 w-4 text-[#C9C8C8]" /> },
          { label: "Liquidation Margin", value: liquidationMarginValue, titleIcon: <BookAlertIcon className="h-4 w-4 text-[#C9C8C8]" /> },
        ],
      },
      pnlSummary: {
        type: "subsections",
        title: "PNL SUMMARY",
        subsections: [
          {
            label: "Perps",
            value: formatCurrency(perpsPnlSum),
            isPositive: isPerpsPnlPositive,
            icon: isPerpsPnlPositive ? (
              <ArrowUpRight className="h-5 w-5 text-[#0ABAB5]" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            ),
            color: isPerpsPnlPositive ? "green" : "red",
          },
          {
            label: "Bands",
            value: formatCurrency(bandsPnlSum),
            isPositive: isBandsPnlPositive,
            icon: isBandsPnlPositive ? (
              <ArrowUpRight className="h-5 w-5 text-[#0ABAB5]" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            ),
            color: isBandsPnlPositive ? "green" : "red",
          },
          {
            label: "TOTAL PNL",
            value: formatCurrency(totalPnlSum),
            icon: isTotalPnlPositive ? (
              <ArrowUpRight className="h-5 w-5 text-[#0ABAB5]" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            ),
            isHighlight: true,
            color: isTotalPnlPositive ? "green" : "red",
            isPositive: isTotalPnlPositive,
          },
        ],
      },
      perpCapacity: {
        type: "capacity",
        title: "PERPS AVAILABLE",
        infoIcon: true,
        infoText: "The capacity of the trader's portfolio.",
        capacityItems: [
          {
            label: "Long",
            current: longUsedQuantity,
            max: longMax || 0,
            displayMax: longMax || 0, // Display 0 when there's no data
            color: "green",
            showDot: true,
          },
          {
            label: "Short",
            current: shortUsedQuantity,
            max: shortMax || 0,
            displayMax: shortMax || 0, // Display 0 when there's no data
            color: "red",
            showDot: true,
          },
        ],
      },
    };
  }, [rawTransactions, perpData, liquidationMarginTotal, loadingLiquidationFloor]);

  const sortingEnabled = false;

  const [claimingId, setClaimingId] = React.useState<number | string | null>(null);
  const [claimedIds, setClaimedIds] = React.useState<Set<number | string>>(new Set());


  /* ----------------------- Claim handler -------------------------------- */
  const handleClaim = React.useCallback(
    async (id: number | string) => {
      if (claimingId !== null) return;

      setClaimingId(id);
      const { ok, response } = await completeTransactionAction(id);
      console.log("ok", ok, "response", response);

      if (ok) {
        setClaimedIds(prev => new Set(prev).add(id));
        toast.success("Transaction completed");
      } else {
        toast.error("Close failed");
        console.error("Close failed for id", id);
      }

      setClaimingId(null);
    },
    [claimingId]
  );

  /* ----------------------- Column def  ---------------------------------- */
  const columns = React.useMemo<ColumnDef<RowData>[]>(
    () => [
      {
        accessorKey: "origin",
        header: () => "ORIGIN",
        sortingFn: "basic",
        cell: ({ row }) => {
          const isLp = row.original.origin === "lp";
          return (
            <span
              className={`text-[9px] tracking-wider font-bold px-2 py-0.5 rounded-sm border whitespace-nowrap ${isLp
                ? "text-[#0ABAB5] bg-[#0ABAB522] border-[#0ABAB566]"
                : "text-[#C9C8C8] bg-[#2a2a2a] border-[#4a4a4a]"
                }`}
            >
              {isLp ? "LP" : "opened"}
            </span>
          );
        },
      },
      {
        accessorKey: "type",
        header: () => "BUY / SELL",
        sortingFn: "basic",
        cell: ({ row }) => {
          // LP-accrued rows have no discrete Buy/Sell action — this slot instead
          // carries the instrument identity (wing + strike), colored per the
          // curve's own call/put convention (item 5, BANDS ORIGIN round).
          if (row.original.isLpRow) {
            const color = row.original.instrumentWing === "put" ? "#DC5D5B" : "#54D200";
            return (
              <span className="font-semibold whitespace-nowrap" style={{ color }}>
                {row.original.instrumentLabel}
              </span>
            );
          }
          const type = row.original.type;
          const color = type === "Buy" ? "#7A97E2" : type === "Sell" ? "#D277B9" : undefined;
          return color ? (
            <span className="uppercase" style={{ color }}>{type}</span>
          ) : (
            <span className="uppercase">{type}</span>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: () => "NOTIONAL (BTC)",
        sortingFn: "basic",
        cell: ({ row }) => {
          const { quantity, isLpRow, avgFillPremiumCoin } = row.original;
          if (!isLpRow) return quantity;
          // LP rows carry a signed qty (+long/−short) plus, when the wire has it,
          // the avg fill premium natively in ₿ — absent ⇒ "—" (item 5).
          const signed = parseOrZero(quantity) >= 0 ? `+${quantity}` : quantity;
          return (
            <div className="flex flex-col">
              <span className={parseOrZero(quantity) >= 0 ? "text-[#00FF9C]" : "text-[#FF6767]"}>
                {signed}
              </span>
              <span className="text-[10px] text-[#7a8a86]">
                avg {avgFillPremiumCoin ?? "—"} ₿
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "direction",
        header: () => "DIRECTION",
        sortingFn: "basic",
        cell: ({ row }) => {
          const direction = row.original.direction;
          const color = direction === "Long" ? "#00FF9C" : direction === "Short" ? "#FF6767" : undefined;
          return color ? (
            <span className="" style={{ color }}>{direction}</span>
          ) : (
            <span className="">{direction}</span>
          );
        },
      },
      {
        // NO intrinsic/extrinsic split (item 3): ONE VALUE column — the position's
        // value as it is, on the applicable-exit basis. Trader legs: the live model
        // value (task #34's `sold/bought_leg_value_in_dollars`, audit MEDIUM-1). LP
        // rows: the wire's valueUSD, basis shown muted — "model" fallback stays visible.
        accessorKey: "positionValue",
        header: () => "VALUE",
        sortingFn: "basic",
        cell: ({ row }) => {
          // Audit MEDIUM-2: "—" is a genuinely unpriceable row (the DAL emits
          // the literal string "—" when the wire has no reading) — branch on
          // finiteness BEFORE parseOrZero, which would silently read "—" as 0
          // and fabricate a value nobody can price. legBoundRow's own absence
          // vocabulary, reused here.
          const val = parseFloat(row.original.positionValue);
          if (!Number.isFinite(val)) {
            return (
              <span className="text-[#5b6b6e]" title="the engine could not price this row">
                —
              </span>
            );
          }
          const basis = row.original.valueBasis;
          return (
            <span>
              {formatDecimal(val, true)}
              {basis ? <span className="ml-1 text-[10px] text-[#7a8a86]">({basis})</span> : null}
            </span>
          );
        },
      },
      {
        // P/L keeps its own column beside VALUE (item 3) — trader legs reuse the
        // existing (always-≥0-at-source, arrow+color) profit reading; LP rows use
        // the wire's plUSD, genuinely signed, "—" when the wire omits it.
        //
        // Basis differs by origin (audit note, post-4915797): band-row P/L is
        // fee-inclusive; LP-row plUSD is fee-EXCLUSIVE by design (the LP banked its
        // fee separately at fill time as maker, so its exit P/L stays on raw entry
        // basis — otherwise the fee income double-counts). Basis-labeling law (the
        // valueBasis precedent): state it, muted, right on the LP-row cell.
        accessorKey: "intrinsicValue",
        header: () => "P/L",
        sortingFn: "basic",
        cell: ({ row }) => {
          if (row.original.plAbsent) {
            return <span className="text-[#5b6b6e]">—</span>;
          }
          const val = parseOrZero(row.original.intrinsicValue);
          const isPositive = val >= 0;
          const color = isPositive ? "#00FF9C" : "#FF6767";

          return (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" style={{ color }} />
              ) : (
                <ArrowDownRight className="h-4 w-4" style={{ color }} />
              )}
              <span style={{ color }}>
                {formatCurrency(val)}
              </span>
              {row.original.isLpRow ? (
                <span className="text-[10px] text-[#7a8a86]">(ex-fees)</span>
              ) : null}
            </div>
          );
        },
      },
      // FUNDING column commented out, not deleted (item 2, UX law): the instrument
      // has no funding term at band level.
      // {
      //   accessorKey: "funding",
      //   header: () => "FUNDING",
      //   sortingFn: "basic",
      //   cell: ({ row }) => {
      //     const val = parseOrZero(row.original.funding);
      //     return formatDecimal(val, true);
      //   },
      // },
      // EXTRINSIC VALUE folded into the single VALUE column above (item 3) — kept
      // as a comment, not deleted. (`residualValue` no longer feeds VALUE's
      // `positionValue` — since task #34/audit MEDIUM-1 that reads
      // `sold/bought_leg_value_in_dollars` directly off the wire — but the
      // field itself is untouched and still populated, so this column would
      // work unmodified if ever restored.)
      // {
      //   accessorKey: "residualValue",
      //   header: () => "EXTRINSIC VALUE",
      //   sortingFn: "basic",
      //   cell: ({ row }) => {
      //     const val = parseOrZero(row.original.residualValue);
      //     return formatDecimal(val, true);
      //   },
      // },
      {
        accessorKey: "innerBound",
        header: () => "INITIAL INNER BOUND",
        sortingFn: "basic",
        cell: ({ row }) => {
          const value = row.original.innerBound;
          // "—" = concept N/A for this row (LP single-leg, or a per-leg breakout
          // sub-row's other bound); "----" = fmtPctDisplay's own zero/invalid signal.
          if (value === "----" || value === "—" || !value) return value;
          // Parse the value and check if it's negative or very large (like 99999999)
          const numValue = parseFloat(value);
          // If negative, invalid, or very large (>= 99999999), return "----"
          if (!Number.isFinite(numValue) || numValue < 0 || numValue >= 9999999) return "----";
          // Otherwise return the value as-is
          return value;
        },
      },
      {
        accessorKey: "outerBound",
        header: () => "INITIAL OUTER BOUND",
        sortingFn: "basic",
        cell: ({ row }) => {
          const value = row.original.outerBound;
          // "—" = concept N/A for this row; "----" = fmtPctDisplay's zero/invalid signal.
          if (value === "----" || value === "—" || !value) return value;
          // Parse the value and check if it's negative or very large (like 99999999)
          const numValue = parseFloat(value);
          // If negative, invalid, or very large (>= 99999999), return "----"
          if (!Number.isFinite(numValue) || numValue < 0 || numValue >= 9999999) return "----";
          // Otherwise return the value as-is
          return value;
        },
      },
      sortableCol("residualinnerBound", "RESIDUAL INNER BOUND"),
      sortableCol("residualouterBound", "RESIDUAL OUTER BOUND"),
      {
        id: "claim",
        header: () => "CLOSE",
        // Close button renders in the Totals row; LP rows never get a Totals row
        // (single-leg, no pairing) so they show an honest "—" instead of blank.
        cell: ({ row }) => (row.original.isLpRow ? <span className="text-[#5b6b6e]">—</span> : null),
        enableSorting: false,
      },
    ],
    [claimingId, claimedIds, handleClaim]
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);

  // No row-level pagination model here (item 2): `data` is already scoped to
  // the current GROUP page above, and a further row-level slice on top would
  // silently re-split a group across "pages" the UI never shows — exactly the
  // bug this fix removes. getCoreRowModel renders everything it's handed.
  const table = useReactTable({
    data,
    columns,
    state: sortingEnabled ? { sorting } : {},
    onSortingChange: sortingEnabled ? setSorting : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortingEnabled ? getSortedRowModel() : undefined,
  });

  const paginationRangeArray = usePaginationRange({
    currentPage: groupPageIndex + 1,
    totalPages: groupPageCount,
  });

  const colCount = table.getAllLeafColumns().length;

  /* ----------------------------- RENDER ---------------------------------- */
  return (
    <div>
      <BentoGrid content={bandsBentoContent} loading={loading} />

      {/* ---------------- SCREEN BY ORIGIN (BANDS ORIGIN round) ------------- */}
      <div className="flex items-center gap-5 mb-3 px-2.5 py-2 bg-[#0b171a] border border-[#1c2e32] text-2xs">
        <span className="text-white tracking-wider">SCREEN BY ORIGIN:</span>
        <label className="flex items-center gap-1.5 cursor-pointer select-none text-[#C9C8C8]">
          <input
            type="checkbox"
            checked={showOpened}
            onChange={() => setShowOpened((v) => !v)}
            className="accent-[#0ABAB5] h-3.5 w-3.5 cursor-pointer"
          />
          opened
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer select-none text-[#C9C8C8]">
          <input
            type="checkbox"
            checked={showLp}
            onChange={() => setShowLp((v) => !v)}
            className="accent-[#0ABAB5] h-3.5 w-3.5 cursor-pointer"
          />
          LP
        </label>
      </div>

      <div className="rounded-sm border-2 border-[#D1D1D1] bg-[#0E1B1E] flex-grow flex flex-col overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            {/* ----------------------- HEADERS ----------------------- */}
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-[#112226] border-b-2 border-[#808080] hover:bg-[#112226]">
                  {hg.headers.map((header, index) => {
                    // Check if this is the last column
                    const isLast = index === hg.headers.length - 1;

                    return (
                      <TableHead
                        key={header.id}
                        className={`text-[#C9C8C8] py-3 whitespace-nowrap tracking-wider font-semibold text-2xs ${ibmPlexMono.className} 
                        ${isLast ? "sticky right-0 z-20 bg-[#112226] border-l border-[#808080]/20" : ""}
                      `}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className="flex items-center select-none"
                            onClick={() =>
                              sortingEnabled &&
                              header.column.toggleSorting(header.column.getIsSorted() === "asc")
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() &&
                              sortingEnabled && (
                                <SortIcon sort={header.column.getIsSorted()} />
                              )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            {/* ------------------------ BODY ------------------------ */}
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`sk-${i}`} className="border-b border-[#808080]/20 last:border-0 group">
                    {Array.from({ length: colCount }).map((__, j) => {
                      const isLast = j === colCount - 1;
                      let widthClass = "w-20";

                      // Column order: ORIGIN, BUY/SELL, NOTIONAL, DIRECTION, VALUE,
                      // P/L, 4× BOUNDS, CLOSE (FUNDING/EXTRINSIC commented out, item 2/3).
                      if (j === 0) {
                        // ORIGIN
                        widthClass = "w-14";
                      } else if (j === 1) {
                        // BUY / SELL
                        widthClass = "w-16";
                      } else if (j === 2) {
                        // NOTIONAL (BTC)
                        widthClass = "w-24";
                      } else if (j === 3) {
                        // DIRECTION
                        widthClass = "w-16";
                      } else if (j === 4 || j === 5) {
                        // VALUE / P/L
                        widthClass = "w-24";
                      } else if (j === 6 || j === 7 || j === 8 || j === 9) {
                        // BOUNDS
                        widthClass = "w-24";
                      } else if (isLast) {
                        // CLOSE button
                        widthClass = "w-16";
                      }

                      return (
                        <TableCell
                          key={j}
                          className={`bg-[#0E1B1E] ${isLast ? "sticky right-0 z-10" : ""}`}
                        >
                          <Skeleton className={`h-5 ${widthClass} bg-gray-500`} />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                renderBodyRows(table, claimingId, claimedIds, handleClaim, colCount)
              ) : (
                <TableRow>
                  <TableCell colSpan={colCount} className="h-20 bg-[#0E1B1E] text-[#C9C8C8] text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* -------------------- PAGINATION (by group, item 2) --------------- */}
      <div className="flex flex-col md:flex-row items-center justify-between py-4 mt-auto">
        <div className="text-2xs text-muted-foreground mb-4">
          Page {groupPageIndex + 1} of {groupPageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            size="sm"
            className="text-2xs"
            onClick={() => setGroupPageIndex((i) => Math.max(0, i - 1))}
            disabled={groupPageIndex <= 0}
          >
            Previous
          </Button>

          {paginationRangeArray.map((page, i) =>
            page === DOTS ? (
              <span key={`dots-${i}`} className="px-2 text-white">
                {DOTS}
              </span>
            ) : (
              <Button
                key={page}
                variant={page === groupPageIndex + 1 ? "noShadow" : "default"}
                size="sm"
                className="text-2xs"
                onClick={() => setGroupPageIndex((page as number) - 1)}
                disabled={page === groupPageIndex + 1}
              >
                {page}
              </Button>
            )
          )}

          <Button
            variant="default"
            size="sm"
            className="text-2xs"
            onClick={() => setGroupPageIndex((i) => Math.min(groupPageCount - 1, i + 1))}
            disabled={groupPageIndex >= groupPageCount - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Shorthand to create sortable columns that render plain strings */
function sortableCol<T extends keyof RowData>(
  key: T,
  headerLabel: string
): ColumnDef<RowData> {
  return {
    accessorKey: key,
    header: () => headerLabel,
    cell: ({ row }) => row.original[key],
    sortingFn: "basic",
  };
}

/** Arrow icon that reflects current sort state */
function SortIcon({ sort }: { sort: false | "asc" | "desc" }) {
  if (!sort) return <ArrowUpDown className="h-4 w-4 ml-1 text-white" />;
  return sort === "asc" ? (
    <ArrowDownNarrowWide className="h-4 w-4 ml-1 text-white" />
  ) : (
    <ArrowUpWideNarrow className="h-4 w-4 ml-1 text-white" />
  );
}

/** Render rows with pair-spacing logic + a Totals row */
function renderBodyRows(
  table: ReturnType<typeof useReactTable<RowData>>,
  claimingId: number | string | null,
  claimedIds: Set<number | string>,
  handleClaim: (id: number | string) => void,
  colCount: number
): React.ReactNode {
  const rows = table.getRowModel().rows;
  if (!rows.length) return null;

  const out: React.ReactNode[] = [];
  let pendingLong: RowData | null = null; // remember the first row of each pair

  rows.forEach((tblRow, idx) => {
    const r = tblRow.original;
    const isPerp = !r.isLpRow && r.status === "" && r.type === "----";
    const isLong = r.direction === "Long";
    const isShort = r.direction === "Short";

    // Skip rendering perp row
    if (isPerp) {
      return; // Skip to next iteration
    }

    /* --------  regular data row (Long, Short, or a standalone LP row)  -------- */
    out.push(
      <TableRow
        key={tblRow.id}
        className="group hover:bg-gray-800 bg-[#0E1B1E] border-b border-[#808080]/20 last:border-0"
      >
        {tblRow.getVisibleCells().map((cell, index) => {
          const isLast = index === tblRow.getVisibleCells().length - 1;

          return (
            <TableCell
              key={cell.id}
              className={`${!isLast ? `text-sm ${ibmPlexMono.className}` : "text-xs"} text-[#C9C8C8] py-2 ${isLast
                ? "sticky right-0 z-10 bg-[#0E1B1E] group-hover:bg-gray-800 border-l border-[#808080]/20 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.5)]"
                : ""
                }`}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
      </TableRow>
    );

    /* LP-accrued rows are single-leg: no pairing, no Totals row, no per-leg
     * bound breakout (item 5) — just a gap-spacer like every other row group,
     * then move on. */
    if (r.isLpRow) {
      if (idx < rows.length - 1) {
        out.push(
          <tr key={`gap-lp-${idx}`} className="h-4 !border-0 bg-transparent">
            <td colSpan={colCount} className="p-0 !border-0" />
          </tr>
        );
      }
      return;
    }

    /* Per-bound/leg breakout (item 4, BANDS ORIGIN round; VALUE landed task #34
     * item 1): each trader leg's inner and outer bound get their own row.
     * VALUE now reads the wire's per-bound leg values (engine.LegBoundValues —
     * each bound's own best-of-book mid × the leg's size × S, outer NEGATIVE,
     * "—" only for a row the engine genuinely couldn't price or a single-bound
     * leg's outer). P/L stays "—": the wire still carries only ONE combined
     * profit per whole leg (bought_profit/sold_profit), not split by bound.
     * The combined VALUE/P/L stay visible on this row above, unaffected. */
    out.push(legBoundRow(r, "inner", `${tblRow.id}-inner`));
    out.push(legBoundRow(r, "outer", `${tblRow.id}-outer`));

    /* remember Long row and, on Short, build Totals */
    if (r.isFirstRowOfPair) {
      pendingLong = r;
      return; // wait for the Short row
    }

    if (pendingLong) {
      // ---------- Totals row (Long − Short) -------------
      const totIntrinsic =
        parseOrZero(pendingLong.intrinsicValue) +
        parseOrZero(r.intrinsicValue);
      // const totResidual =
      //   parseOrZero(pendingLong.residualValue) +
      //   parseOrZero(r.residualValue);
      // const totFunding =
      //   parseOrZero(pendingLong.funding || "0") +
      //   parseOrZero(r.funding || "0");
      // Audit MEDIUM-2: guard on BOTH operands before subtracting — if either
      // leg is unpriceable ("—" on the wire), the band's TOTAL is unknowable,
      // not a number computed as if the missing leg were worth 0.
      const longPositionRaw = parseFloat(pendingLong.positionValue);
      const shortPositionRaw = parseFloat(r.positionValue);
      const totPositionValid = Number.isFinite(longPositionRaw) && Number.isFinite(shortPositionRaw);
      const totPosition = totPositionValid ? longPositionRaw - shortPositionRaw : NaN;

      // Render Close button in Totals row - always show, but disabled when closed
      const longRowId = pendingLong.id; // Store id to avoid null check issues
      const isClaiming = claimingId === longRowId;
      const isClaimed = claimedIds.has(longRowId);
      const isPending = pendingLong.status === "pending";
      const isClosed = !isPending || isClaimed;
      const isDisabled = isClaiming || isClosed;

      out.push(
        <TableRow key={`tot-${r.id}`} className="bg-[#2F2F31] border-[#808080] !border-b-2 !border-x-2 !border-t-0 group">
          {/* spans columns before VALUE: origin, type, quantity, direction */}
          <TableCell className={`text-sm ${ibmPlexMono.className} text-[#C9C8C8] font-medium py-2`} colSpan={4}>
            TOTAL
          </TableCell>
          {/* VALUE column - aligned with positionValue column from upper rows */}
          <TableCell className={`text-sm ${ibmPlexMono.className} text-[#C9C8C8] font-medium py-2`}>
            {totPositionValid ? (
              formatDecimal(totPosition, true)
            ) : (
              <span className="text-[#5b6b6e]" title="the engine could not price this row">—</span>
            )}
          </TableCell>
          {/* P/L column - aligned with intrinsicValue column from upper rows */}
          <TableCell className={`text-sm ${ibmPlexMono.className} text-[#C9C8C8] font-medium py-2`}>
            {formatCurrency(totIntrinsic)}
          </TableCell>
          {/* spans columns after P/L and before CLAIM: innerBound, outerBound, residualinnerBound, residualouterBound */}
          <TableCell className={`text-sm ${ibmPlexMono.className} text-[#C9C8C8] font-medium py-2`} colSpan={4} />
          {/* Close button cell */}
          <TableCell className="sticky right-0 z-10 bg-[##2F2F31] border-l border-[#808080]/20 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.5)] py-2">
            {isDisabled ? (
              <Button
                size="sm"
                variant="noShadow"
                className="h-7 text-2xs py-1 text-[#F1F1F1] bg-[#696969]"
                disabled={true}
              >
                {isClaiming ? "CLOSING…" : "CLOSED"}
              </Button>
            ) : (
              (() => {
                // Calculate Long band values
                const longPnl = parseOrZero(pendingLong.intrinsicValue);
                // Audit MEDIUM-2: parseFloat (not parseOrZero) preserves NaN
                // for an unpriceable leg's "—" — rendered as "—" below, never
                // fabricated as $0.00.
                const longPositionValue = parseFloat(pendingLong.positionValue);
                const isLongPnlPositive = longPnl >= 0;
                const longPnlColor = isLongPnlPositive ? "#00FF9C" : "#FF6767";

                // Calculate Short band values
                const shortPnl = parseOrZero(r.intrinsicValue);
                const shortPositionValue = parseFloat(r.positionValue);
                const isShortPnlPositive = shortPnl >= 0;
                const shortPnlColor = isShortPnlPositive ? "#00FF9C" : "#FF6767";

                return (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs py-1 text-[#F1F1F1]"
                      >
                        CLOSE
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-none bg-[#112226] border-[#808080] text-[#C9C8C8]">
                      {/* Close button */}
                      <AlertDialogCancel className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-0 h-auto w-auto border-0 bg-transparent hover:bg-transparent">
                        <X className="h-4 w-4 text-white" />
                        <span className="sr-only">Close</span>
                      </AlertDialogCancel>

                      <AlertDialogHeader>
                        <AlertDialogTitle className={`${chakraPetch.className} text-sm text-[#C7B7A5] text-left`}>
                          CLOSE BANDS?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-[#C9C8C8] text-left">
                          Are you sure you want to close this bands position?
                          <br />
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      {/* Position Details Card */}
                      <div className="bg-[#0E2F3A] border border-[#808080]/30 rounded-none p-4 mt-2">
                        <div className="text-xs text-gray-400 mb-3">Position</div>

                        {/* Long band line */}
                        <div className="flex items-center justify-start mb-2 gap-4">
                          <span className="text-xs text-[#C9C8C8]" style={{ color: "#00FF9C" }}>
                            Long:
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-400">
                              Position Value: <span className="text-[#C9C8C8]">{Number.isFinite(longPositionValue) ? formatDecimal(longPositionValue, true) : "—"}</span>
                            </span>
                            <span className="text-xs text-gray-400">
                              PNL:{" "}
                              <span style={{ color: longPnlColor }}>
                                {formatCurrency(longPnl)}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Short band line */}
                        <div className="flex items-center justify-start gap-4">
                          <span className="text-xs text-[#C9C8C8]" style={{ color: "#FF6767" }}>
                            Short:
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-400">
                              Position Value: <span className="text-[#C9C8C8]">{Number.isFinite(shortPositionValue) ? formatDecimal(shortPositionValue, true) : "—"}</span>
                            </span>
                            <span className="text-xs text-gray-400">
                              PNL:{" "}
                              <span style={{ color: shortPnlColor }}>
                                {formatCurrency(shortPnl)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <AlertDialogFooter className="sm:justify-start gap-4">
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600 text-white border-0 text-xs"
                          onClick={() => handleClaim(longRowId)}
                        >
                          Close
                        </AlertDialogAction>
                        <AlertDialogCancel className="bg-transparent text-white hover:bg-white/10 border-0 text-xs">
                          Cancel
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                );
              })()
            )}
          </TableCell>
        </TableRow>
      );

      if (idx < rows.length - 1) {
        out.push(
          <tr key={`gap-${idx}`} className="h-4 !border-0 bg-transparent">
            <td colSpan={colCount} className="p-0 !border-0" />
          </tr>
        );
      }

      pendingLong = null; // reset for next pair
    }


  });

  return out;
}

/**
 * Per-bound/leg breakout row (item 4, BANDS ORIGIN round; VALUE landed task
 * #34 item 1): one for the inner bound, one for the outer, immediately
 * beneath a trader Buy/Sell row. Column order matches the real header exactly
 * (ORIGIN, BUY/SELL, NOTIONAL, DIRECTION, VALUE, P/L, 4× BOUNDS, CLOSE) —
 * 11 plain cells, no colSpan, so it stays correct if a future round reorders
 * the real columns without touching this function.
 *
 * VALUE reads this bound's own wire value (engine.LegBoundValues — its own
 * best-of-book mid × the leg's size × S; the outer enters NEGATIVE, the cap
 * the leg sold away). "—" only for a genuine absence: the engine couldn't
 * price this row at all, or (outer row only) the leg has no outer bound.
 * P/L stays "—": the wire still carries only one combined profit per whole
 * leg, not split by bound.
 */
function legBoundRow(parent: RowData, bound: "inner" | "outer", key: string): React.ReactNode {
  const initVal = bound === "inner" ? parent.innerBound : parent.outerBound;
  const residVal = bound === "inner" ? parent.residualinnerBound : parent.residualouterBound;
  const boundValueUsd = bound === "inner" ? parent.innerBoundValueUsd : parent.outerBoundValueUsd;
  const cellCls = "text-[#8A8A8A] py-1.5 text-xs";
  const plGapTitle = "not broken out per bound on today's wire — one combined profit per leg";
  const valueAbsentTitle =
    bound === "outer"
      ? "no outer bound on this leg, or the engine could not price this row"
      : "the engine could not price this row (no mark / no curve at this strike)";

  return (
    <TableRow key={key} className="bg-[#0E1B1E] border-b border-[#808080]/10">
      <TableCell className={cellCls} />
      <TableCell className={cellCls}>
        <span className="pl-3 italic">↳ {bound} bound</span>
      </TableCell>
      <TableCell className={cellCls} />
      <TableCell className={cellCls} />
      <TableCell className={cellCls} title={boundValueUsd === undefined ? valueAbsentTitle : undefined}>
        {boundValueUsd === undefined ? (
          "—"
        ) : (
          <span>
            {formatDecimal(boundValueUsd, true)}
            {parent.boundValueBasis ? (
              <span className="ml-1 text-[10px] text-[#7a8a86]">({parent.boundValueBasis})</span>
            ) : null}
          </span>
        )}
      </TableCell>
      <TableCell className={cellCls} title={plGapTitle}>—</TableCell>
      <TableCell className={cellCls}>{bound === "inner" ? initVal : "—"}</TableCell>
      <TableCell className={cellCls}>{bound === "outer" ? initVal : "—"}</TableCell>
      <TableCell className={cellCls}>{bound === "inner" ? residVal : "—"}</TableCell>
      <TableCell className={cellCls}>{bound === "outer" ? residVal : "—"}</TableCell>
      <TableCell className={`${cellCls} sticky right-0 bg-[#0E1B1E]`} />
    </TableRow>
  );
}


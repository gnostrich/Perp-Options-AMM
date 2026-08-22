"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import Image from "next/image";

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

import { PerpTableEntry } from "@/lib/data";
import { chakraPetch, ibmPlexMono } from "@/lib/font";
import BentoGrid from "./MiniComponents/BentoGrid";
import { BentoContent } from "./MiniComponents/BentoBox";
import { toast } from "sonner";
import { closePerpPositionAction } from "@/app/actions/closePerpPositionAction";
import { usePortfolioStore } from "@/store/portfolioStore";
import { aggregateBandsPnlByPerpType } from "@/lib/data/api/portfolioTransforms";

interface Props {
  tableData: PerpTableEntry[];
  loading: boolean;
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

// Helper function to parse string to number, defaulting to 0
function parseOrZero(s: string): number {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
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

// Standalone component for mark price cell to prevent columns array recreation
function MarkPriceCell({ isClosed, markPrice }: { isClosed: boolean; markPrice: number }) {
  const currentMarkPrice = usePortfolioStore((s) => s.currentMarkPrice);
  const displayPrice = isClosed ? markPrice : currentMarkPrice;
  return <>{formatDecimal(displayPrice, true)}</>;
}

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

export default function PerpTableContainer({ tableData, loading }: Props) {
  const [showClosedPositions, setShowClosedPositions] = React.useState<boolean>(true);

  /* ------------------- ORIGIN screen (task #42, copied verbatim from BANDS' -
   * landed styling — tableContainer.tsx:228-229) ---------------------------- */
  // LP rows default HIDDEN, same #41 law BANDS shipped: this table is the
  // trader's own opened-position ledger; a perp-book-MM row is a different
  // economic object. Still one click away, same checkbox pair.
  const [showOpened, setShowOpened] = React.useState(true);
  const [showLp, setShowLp] = React.useState(false);

  const filteredTableData = React.useMemo(() => {
    return tableData.filter((entry) => {
      if (!showClosedPositions && entry.isClosed) return false;
      const origin = entry.origin ?? "opened";
      return origin === "lp" ? showLp : showOpened;
    });
  }, [tableData, showClosedPositions, showOpened, showLp]);

  const data = React.useMemo(() => filteredTableData, [filteredTableData]);
  const sortingEnabled = true;

  const [claimingId, setClaimingId] = React.useState<string | null>(null);
  const [claimedIds, setClaimedIds] = React.useState<Set<string>>(new Set());

  // Get liquidation margin and bands data from portfolio store
  const { liquidationMarginTotal, loadingLiquidationFloor, tableData: bandsData } = usePortfolioStore();
  // Get raw transactions for correct BANDS P/L calculation
  const rawTransactions = usePortfolioStore((s) => s.rawTransactions);

  // Calculate bento box content dynamically from tableData
  const perpBentoContent = React.useMemo<BentoContent>(() => {
    // Origin-aware (task #42): these are TRADER economics — exclude LP-origin
    // rows the same way BANDS' totals exclude LP-accrued P/L (#41 law).
    // Structural, not tied to the SCREEN BY ORIGIN checkbox: a no-op today (no
    // lp rows exist), ready for when perp-book-MM rows land.
    const openedTableData = tableData.filter((entry) => (entry.origin ?? "opened") === "opened");

    // Active positions (open only) — used for equity/capacity/notional metrics
    const activePositions = openedTableData.filter(entry => !entry.isClosed);

    // Calculate Trader Equity Long
    const traderEquityLong = activePositions
      .filter((entry) => entry.perpType === "LONG")
      .reduce((sum, entry) => sum + (entry.traderEquity ?? 0), 0);

    // Calculate Trader Equity Short
    const traderEquityShort = activePositions
      .filter((entry) => entry.perpType === "SHORT")
      .reduce((sum, entry) => sum + (entry.traderEquity ?? 0), 0);

    // Trader Equity = Trader Equity Long + Trader Equity Short
    const traderEquitySum = traderEquityLong + traderEquityShort;

    // Calculate PERPS P/L - sum ALL positions (open + closed)
    const pnlSum = openedTableData.reduce((sum, entry) => {
      return sum + (entry.pnl ?? 0);
    }, 0);
    const isPnlPositive = pnlSum >= 0;

    // Calculate BANDS P/L - include ALL transactions (open + closed)
    const { longPerpBandsPnl, shortPerpBandsPnl } = aggregateBandsPnlByPerpType(
      rawTransactions ?? []
    );
    const bandsPnlSum = longPerpBandsPnl + shortPerpBandsPnl;
    const isBandsPnlPositive = bandsPnlSum >= 0;

    // Calculate Perp Capacity for Long positions (convert BTC to USD using entryPrice)
    const longPositions = activePositions.filter((entry) => entry.perpType === "LONG");
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
    const shortPositions = activePositions.filter((entry) => entry.perpType === "SHORT");
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

    // Calculate total notional - sum all notional values from tableData usdc
    const totalNotional = activePositions.reduce((sum, entry) => {
      return sum + (entry.notional ?? 0);
    }, 0);

    return {
      riskHealth: {
        type: "keyValue",
        title: "RISK & COLLATERAL HEALTH",
        // infoIcon: true,
        infoText: "The risk and collateral health of the trader's portfolio.",
        keyValues: [
          { label: "Total Notional", value: formatCurrencyNoSign(totalNotional), titleIcon: <Layers className="h-5 w-5 text-[#C9C8C8]" /> },
          { label: "Trader Equity", value: formatCurrencyNoSign(traderEquitySum), titleIcon: <WalletIcon className="h-5 w-5  text-[#C9C8C8]" /> },
          { label: "Liquidation Margin", value: liquidationMarginValue, titleIcon: <BookAlertIcon className="h-5 w-5  text-[#C9C8C8]" /> },
        ],
      },
      pnlSummary: {
        type: "subsections",
        title: "PNL SUMMARY",
        // infoIcon: true,
        // infoText: "The P/L summary of the trader's portfolio.",
        subsections: [
          {
            label: "Perps",
            value: formatCurrency(pnlSum),
            // percentage: "--%",
            isPositive: isPnlPositive,
            icon: isPnlPositive ? (
              <ArrowUpRight className="h-5 w-5 text-[#0ABAB5]" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            ),
            color: isPnlPositive ? "green" : "red",
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
            value: formatCurrency(pnlSum + bandsPnlSum),
            icon: (pnlSum + bandsPnlSum) >= 0 ? (
              <ArrowUpRight className="h-5 w-5 text-[#0ABAB5]" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            ),
            isHighlight: true,
            color: (pnlSum + bandsPnlSum) >= 0 ? "green" : "red",
            isPositive: (pnlSum + bandsPnlSum) >= 0,
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
  }, [tableData, liquidationMarginTotal, loadingLiquidationFloor, rawTransactions]);

  /* ----------------------- Claim handler -------------------------------- */
  const handleClaim = React.useCallback(
    async (id: string) => {
      if (claimingId !== null) return;

      setClaimingId(id);
      const { ok, response } = await closePerpPositionAction(id);
      console.log("ok", ok, "response", response);

      if (ok) {
        setClaimedIds(prev => new Set(prev).add(id));
        toast.success("Perp position closed");
      } else {
        toast.error("Close failed");
        console.error("Close failed for id", id);
      }

      setClaimingId(null);
    },
    [claimingId]
  );

  function TokenLogo({ token }: { token: string }) {
    const [error, setError] = React.useState(false);

    // Render a gray circle if error occurs
    if (error) {
      return <div className="h-6 w-6 rounded-full bg-gray-700 shrink-0" />;
    }

    return (
      <div className="relative h-6 w-6 rounded-full overflow-hidden shrink-0">
        <Image
          src={`/logo_${token}.svg`}
          alt={token}
          fill
          className="object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  const columns = React.useMemo<ColumnDef<PerpTableEntry>[]>(
    () => [
      // ORIGIN cell copied verbatim from BANDS' landed styling
      // (tableContainer.tsx:472-486).
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
        accessorKey: "token",
        header: () => "ASSET",
        sortingFn: "basic",
        cell: ({ row }) => {
          const token = row.original.token;
          return (
            <div className="flex items-center gap-3">
              <TokenLogo token={token} />
              <span className="font-medium">{token}</span>
            </div>
          );
        },
      },

      sortableCol("size", "NOTIONAL (BTC)"),
      {
        // task #42 accrual half: an origin:"lp" row has no entry price, so its
        // notional is size×MARK (the only honest reading for a coin balance
        // with no entry event) rather than size×entry — stated on the cell,
        // not baked in silently (CLAUDE.md UX law, two-honest-semantics rule).
        accessorKey: "notional",
        header: () => "NOTIONAL (USDC)",
        sortingFn: "basic",
        cell: ({ row }) => {
          const { notional, notionalBasis } = row.original;
          return notionalBasis === "mark" ? (
            <span title="notional at current mark — accrued position, no entry price">
              {notional}
            </span>
          ) : (
            notional
          );
        },
      },

      {
        accessorKey: "perpType",
        header: () => "DIRECTION",
        sortingFn: "basic",
        cell: ({ row }) => {
          const type = row.original.perpType;
          const formattedType =
            typeof type === "string" && type.length > 0
              ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
              : type;
          return (
            <span style={{ color: type === "LONG" ? "#00FF9C" : "#FF6767" }}>
              {formattedType}
            </span>
          );
        },
      },

      {
        accessorKey: "entryPrice",
        header: () => "ENTRY PRICE",
        sortingFn: "basic",
        cell: ({ row }) =>
          row.original.origin === "lp" ? (
            <span
              className="text-[#5b6b6e]"
              title="no entry price — accrued position, not a traded fill"
            >
              —
            </span>
          ) : (
            formatDecimal(row.original.entryPrice ?? 0, true) // true = show $ sign
          ),
      },

      {
        accessorKey: "markPrice",
        header: () => "MARK PRICE",
        sortingFn: "basic",
        cell: ({ row }) => (
          <MarkPriceCell
            isClosed={row.original.isClosed}
            markPrice={row.original.markPrice}
          />
        ),
      },

      {
        accessorKey: "initialMargin",
        header: () => "INITIAL MARGIN",
        sortingFn: "basic",
        cell: ({ row }) =>
          row.original.origin === "lp" ? (
            <span
              className="text-[#5b6b6e]"
              title="no margin posted — accrued position, not a margined trade"
            >
              —
            </span>
          ) : (
            formatDecimal(row.original.initialMargin ?? 0, true)
          ),
      },

      {
        accessorKey: "pnl",
        header: () => "P/L",
        sortingFn: "basic",
        cell: ({ row }) => {
          if (row.original.origin === "lp") {
            return (
              <span
                className="text-[#5b6b6e]"
                title="no entry price — P/L needs a basis this row doesn't carry"
              >
                —
              </span>
            );
          }
          const val = row.original.pnl ?? 0;
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
            </div>
          );
        },
      },

      {
        accessorKey: "funding",
        header: () => "FUNDING",
        sortingFn: "basic",
        cell: ({ row }) =>
          row.original.origin === "lp" ? (
            <span
              className="text-[#5b6b6e]"
              title="no funding — accrued position carries no margin to fund"
            >
              —
            </span>
          ) : (
            formatDecimal(row.original.funding ?? 0, true)
          ),
      },

      {
        accessorKey: "bandsPnl",
        header: () => "BANDS P/L",
        sortingFn: "basic",
        cell: ({ row }) => {
          const val = row.original.bandsPnl ?? 0;
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
            </div>
          );
        },
      },

      {
        accessorKey: "traderEquity",
        header: () => "TRADER EQUITY",
        sortingFn: "basic",
        cell: ({ row }) =>
          row.original.origin === "lp" ? (
            <span
              className="text-[#5b6b6e]"
              title="not a trader position — no margin, P/L or funding to sum"
            >
              —
            </span>
          ) : (
            formatDecimal(row.original.traderEquity ?? 0, true)
          ),
      },

      {
        accessorKey: "leverage",
        header: () => "LEVERAGE",
        sortingFn: "basic",
        cell: ({ row }) => {
          if (row.original.origin === "lp") {
            return (
              <span
                className="text-[#5b6b6e]"
                title="no margin posted — leverage is undefined for an accrued position"
              >
                —
              </span>
            );
          }
          const val = row.original.leverage;
          if (val == null || !Number.isFinite(val)) return "-";
          return `${formatDecimal(val)}X`;
        },
      },

      // sortableCol("unrealizedPnl", "UNREALIZED PNL"),
      // sortableCol("usedQuantity", "USED QTY (BTC)"),
      // sortableCol("availableQuantity", "AVAILABLE QTY (BTC)"),
      // sortableCol("createdAt", "CREATED AT", { sortingFn: "datetime" }),
      // sortableCol("userWallet", "USER WALLET"),
      {
        id: "claim",
        header: () => "CLAIM",
        cell: ({ row }) => {
          // A synthetic LP-accrual row (task #42) is a projection of a curve's
          // coin balance, not a closable trader position — there is no perp
          // row behind it to close. Same "—" idiom BANDS' CLOSE column uses
          // for its own LP-accrued rows (tableContainer.tsx).
          if (row.original.origin === "lp") {
            return (
              <span
                className="text-[#5b6b6e]"
                title="accrued LP position — not a closable trader perp"
              >
                —
              </span>
            );
          }
          const positionId = row.original.id;
          const isClaiming = claimingId === positionId;
          const isClaimed = claimedIds.has(positionId);
          const isClosed = row.original.isClosed;
          const isDisabled = isClaiming || isClaimed || isClosed;

          // If the button is disabled (already claimed or claiming), 
          // simply return the button without the Alert Dialog wrapper.
          if (isDisabled) {
            return (
              <Button
                size="sm"
                variant={isClosed ? "noShadow" : "default"}
                className={`h-7 text-xs py-1 ${isClosed ? "text-[#F1F1F1] bg-[#696969]" : "text-[#F1F1F1]"}`}
                disabled={true}
              >
                {isClosed ? "Closed" : isClaiming ? "Claiming…" : "Claimed"}
              </Button>
            );
          }

          // If active, wrap in AlertDialog. This branch only runs for a real
          // (non-lp) position — the origin==="lp" early return above always
          // catches the accrual row before entryPrice/pnl are read here.
          const position = row.original;
          const positionPnl = position.pnl ?? 0;
          const pnlPercentage = position.entryPrice && position.size
            ? ((positionPnl / (position.entryPrice * position.size)) * 100).toFixed(1)
            : "0.0";
          const isPnlPositive = positionPnl >= 0;
          const pnlColor = isPnlPositive ? "#00FF9C" : "#FF6767";
          const perpTypeColor = position.perpType === "LONG" ? "#00FF9C" : "#FF6767";

          return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-2xs py-1 text-[#F1F1F1]"
                >
                  CLAIM
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-sm bg-[#0F171A] border-[#808080] text-[#C9C8C8] md:max-w-2xl">
                {/* Close button */}
                <AlertDialogCancel className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-0 h-auto w-auto border-0 bg-transparent hover:bg-transparent">
                  <X className="h-4 w-4 text-white" />
                  <span className="sr-only">Close</span>
                </AlertDialogCancel>

                <AlertDialogHeader>
                  <AlertDialogTitle className={` text-white text-left`}>
                    CLOSE POSITION?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[#C9C8C8] font-light text-left">
                    Are you sure you want to close your {position.token} position? This action cannot be undone.

                  </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Position Details Card */}
                <div className="bg-[#112226] border border-[#808080]/30 rounded-sm p-4 mt-2">
                  <div className="text-sm text-gray-400 mb-3">Position</div>

                  <div className="flex items-center justify-between">
                    {/* Token and Type — left side, larger */}
                    <div className="flex items-center gap-3">
                      <TokenLogo token={position.token} />
                      <span className="text-[#C9C8C8] text-sm">
                        {position.token} Perpetual ·{" "}
                        <span style={{ color: perpTypeColor }}>
                          {position.perpType}
                        </span>
                      </span>
                    </div>

                    {/* Position Metrics — right side, 2x2 grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-right">
                      <div className="text-gray-400">
                        Size: <span className="text-[#C9C8C8]">{formatDecimal(position.size)} BTC</span>
                      </div>
                      <div className="text-gray-400">
                        Entry: <span className="text-[#C9C8C8]">{formatDecimal(position.entryPrice ?? 0, true)}</span>
                      </div>
                      <div className="text-gray-400">
                        Mark: <span className="text-[#C9C8C8]">{formatDecimal(position.markPrice, true)}</span>
                      </div>
                      <div className="text-gray-400">
                        PnL:{" "}
                        <span style={{ color: pnlColor }}>
                          {formatCurrency(positionPnl)} ({isPnlPositive ? "+" : ""}{pnlPercentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payout Summary Breakdown */}
                {(() => {
                  const traderEquity = position.traderEquity ?? 0;
                  const withdrawalFee = -1;
                  const slippageCharge = 0;
                  const finalPayout = traderEquity + withdrawalFee + slippageCharge;
                  return (
                    <div className="mt-2 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Payout Summary</span>
                        <span className="text-[#C9C8C8]">{formatDecimal(traderEquity, true)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hyperliquid Withdrawal Fee</span>
                        <span className="text-[#C9C8C8]">-$1.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Slippage Charge</span>
                        <span className="text-[#C9C8C8]">-$0.00</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-400">Final Payout</span>
                        <span className="text-[#C9C8C8]">{formatDecimal(finalPayout, true)}</span>
                      </div>
                    </div>
                  );
                })()}

                <span className="text-sm text-[#C9C8C8] font-light text-left flex items-center gap-1.5 mt-1">
                  <span className="text-yellow-500">⚠</span>
                  Funds will be sent to your wallet and may take a few minutes to arrive.
                </span>


                <AlertDialogFooter className="sm:justify-start gap-4">
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600 text-white border-0"
                    onClick={() => handleClaim(positionId)}
                  >
                    Close
                  </AlertDialogAction>
                  <AlertDialogCancel className="bg-transparent text-white hover:bg-white/10 border-0">
                    Cancel
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        },
        enableSorting: false,
      },
    ],
    [claimingId, claimedIds, handleClaim]
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: sortingEnabled ? { sorting } : {},
    onSortingChange: sortingEnabled ? setSorting : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortingEnabled ? getSortedRowModel() : undefined,
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 6 },
    },
  });

  const paginationRangeArray = usePaginationRange({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
  });

  const colCount = table.getAllLeafColumns().length;

  return (
    <div>
      <BentoGrid content={perpBentoContent} loading={loading} />

      {/* ---------------- SCREEN BY ORIGIN (task #42, copied verbatim from ----
       * BANDS' landed styling — tableContainer.tsx:719-740) ----------------- */}
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

      <div className="rounded-sm border-2 border-[#D1D1D1] bg-[#0E1B1E] grow flex flex-col overflow-hidden">
        <div className="flex items-center justify-end px-6 pt-4 pb-0 bg-[#112226]">
          <div className="flex items-center gap-3">
            <label
              htmlFor="show-closed-positions"
              className={`text-[#C9C8C8] text-2xs font-medium cursor-pointer select-none tracking-wider ${ibmPlexMono.className}`}
            >
              SHOW CLOSED POSITIONS
            </label>
            <button
              id="show-closed-positions"
              onClick={() => setShowClosedPositions(!showClosedPositions)}
              className={`relative w-10 h-6 border-2 border-[#4F4F4F] rounded-sm p-0.5 transition-all duration-300 ease-in-out focus:outline-none ${showClosedPositions ? "bg-[#448D7A]" : "bg-[#373737]"
                }`}
              aria-label="Toggle show closed positions"
            >
              {/* Sliding white indicator */}
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-sm shadow-md transition-transform duration-300 ease-in-out z-20 ${showClosedPositions ? "translate-x-4" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="bg-[#112226] border-b-2 border-[#808080] hover:bg-[#112226]"
                >
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

            <TableBody className="[&_tr]:transition-opacity [&_tr]:duration-300">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`sk-${i}`} className="border-b border-[#808080]/20 last:border-0 group">
                    {Array.from({ length: colCount }).map((__, j) => {
                      const isLast = j === colCount - 1;
                      let widthClass = "w-20";

                      if (j === 0) {
                        // ORIGIN badge
                        widthClass = "w-14";
                      } else if (j === 1) {
                        // ASSET: logo + symbol
                        widthClass = "w-32";
                      } else if (j === 2 || j === 3) {
                        // NOTIONAL (BTC / USDC)
                        widthClass = "w-24";
                      } else if (j === 4) {
                        // DIRECTION
                        widthClass = "w-16";
                      } else if (j === 5 || j === 6 || j === 7) {
                        // ENTRY / MARK / INITIAL MARGIN
                        widthClass = "w-24";
                      } else if (j === 8 || j === 10) {
                        // P/L and BANDS P/L
                        widthClass = "w-24";
                      } else if (j === 9 || j === 11 || j === 12) {
                        // FUNDING, TRADER EQUITY, LEVERAGE
                        widthClass = "w-16";
                      } else if (isLast) {
                        // CLAIM button
                        widthClass = "w-16";
                      }

                      return (
                        <TableCell
                          key={j}
                          className={`bg-[#0E1B1E] ${isLast ? "sticky right-0 z-10" : ""}`}
                        >
                          <div className="flex items-center">
                            {j === 1 && (
                              <Skeleton className="h-6 w-6 rounded-full bg-gray-500 mr-2" />
                            )}
                            <Skeleton
                              className={`h-5 ${widthClass} bg-gray-500`}
                            />
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  const isClosed = row.original.isClosed;
                  const rowBgColor = isClosed ? "bg-[#232E33]" : "bg-[#0E1B1E]";

                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`group hover:bg-gray-800 ${rowBgColor} border-b border-[#808080]/20 last:border-0 animate-in fade-in-0 duration-300`}
                    >
                      {row.getVisibleCells().map((cell, index) => {
                        const isLast = index === row.getVisibleCells().length - 1;

                        return (
                          <TableCell
                            key={cell.id}
                            className={`${!isLast ? `text-[13px] ${ibmPlexMono.className}` : "text-xs"} text-[#C9C8C8] py-2 ${isLast
                              ? `sticky right-0 z-10 ${rowBgColor} group-hover:bg-gray-800 border-l border-[#808080]/20 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.5)]`
                              : ""
                              }`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={colCount}
                    className="h-20 bg-[#0E1B1E] text-[#C9C8C8] text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between py-4 mt-auto">
        <div className="text-2xs text-muted-foreground mb-4">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            size="sm"
            className="text-2xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
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
                variant={
                  page === table.getState().pagination.pageIndex + 1
                    ? "noShadow"
                    : "default"
                }
                className="text-2xs"
                onClick={() => table.setPageIndex((page as number) - 1)}
                disabled={page === table.getState().pagination.pageIndex + 1}
              >
                {page}
              </Button>
            )
          )}
          <Button
            variant="default"
            size="sm"
            className="text-2xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function sortableCol<T extends keyof PerpTableEntry>(
  key: T,
  headerLabel: string,
  opts?: { sortingFn?: ColumnDef<PerpTableEntry>["sortingFn"] }
): ColumnDef<PerpTableEntry> {
  return {
    accessorKey: key,
    header: () => headerLabel,
    cell: ({ row }) => row.original[key],
    sortingFn: opts?.sortingFn ?? "basic",
  };
}

function SortIcon({ sort }: { sort: false | "asc" | "desc" }) {
  if (!sort) return <ArrowUpDown className="h-4 w-4 ml-1 text-white" />;
  return sort === "asc" ? (
    <ArrowDownNarrowWide className="h-4 w-4 ml-1 text-white" />
  ) : (
    <ArrowUpWideNarrow className="h-4 w-4 ml-1 text-white" />
  );
}

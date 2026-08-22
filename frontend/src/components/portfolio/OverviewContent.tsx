"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { ibmPlexMono } from "@/lib/font";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useEarnExposureStore } from "@/store/earnExposureStore";
import { usePnlHistoryStore } from "@/store/pnlHistoryStore";
import { aggregateBandsPnlByPerpType } from "@/lib/data/api/portfolioTransforms";
import BentoGrid from "./MiniComponents/BentoGrid";
import { BentoContent } from "./MiniComponents/BentoBox";
import { Layers, BookAlertIcon, Wallet } from "lucide-react";
import { Card } from "../ui/card";
import { useAccount } from "@/lib/hooks/useAccount";

/* -------------------------------------------------------------------------- */
/* Chart config (shadcn)                                                       */
/* -------------------------------------------------------------------------- */

const chartConfig = {
  total: { label: "TOTAL PORTFOLIO PNL", color: "#7FB600" },
  perps: { label: "PERPS PNL", color: "#FFAE4C" },
  bands: { label: "BANDS PNL", color: "#7086FD" },
  earn: { label: "EARN PNL", color: "#D189E5" },
} satisfies ChartConfig;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCurrencyNoSign(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatTooltipCurrency(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

/* -------------------------------------------------------------------------- */
/* Custom tooltip                                                               */
/* -------------------------------------------------------------------------- */

function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const order = ["perps", "bands", "earn", "total"];
  const sortedPayload = [...payload].sort((a, b) => {
    return order.indexOf(a.dataKey) - order.indexOf(b.dataKey);
  });

  return (
    <div
      className={`rounded-md bg-[#112226] border border-[#004240] shadow-xl px-4 py-3 min-w-[240px] ${ibmPlexMono.className}`}
    >
      <p className="text-[#9BAAB5] text-xs font-normal uppercase tracking-wider mb-4">
        {label}
      </p>
      <div className="space-y-2.5">
        {sortedPayload.map((entry: any) => {
          const seriesKey = entry.dataKey as keyof typeof chartConfig;
          const seriesLabel = chartConfig[seriesKey]?.label ?? entry.name;
          const color = entry.color ?? entry.stroke;
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-[2px] w-8 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span
                  className="text-xs font-normal tracking-wide uppercase"
                  style={{ color }}
                >
                  {seriesLabel}
                </span>
              </div>
              <span
                className="text-xs font-normal tabular-nums text-white"
              >
                {formatTooltipCurrency(entry.value as number)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

function TotalPnlCard({ value, color }: { value: string; color: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 px-3 py-2 flex-1 rounded-l-sm border-none mr-0"
      style={{ backgroundColor: "#091214" }}
    >
      <span
        className={`text-2xs text-[#C9C8C8] tracking-widest uppercase ${ibmPlexMono.className}`}
      >
        TOTAL PORTFOLIO PNL
      </span>
      <span
        className={`text-xs font-bold ${ibmPlexMono.className}`}
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

function SmallPnlCard({
  label,
  value,
  color,
  isFirst,
  isLast,
}: {
  label: string;
  value: string;
  color: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  let roundedClass = "rounded-none";
  if (isFirst && isLast) roundedClass = "rounded-sm";
  else if (isFirst) roundedClass = "rounded-l-sm";
  else if (isLast) roundedClass = "rounded-r-sm";

  const borderClass = isFirst ? "border" : "border-y border-r";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 flex-1 ${borderClass} border-[#004240] ${roundedClass}`}
      style={{ backgroundColor: "#112226" }}
    >
      <span
        className={`text-2xs tracking-widest uppercase ${ibmPlexMono.className} text-[#C9C8C8]`}
      >
        {label}
      </span>
      <span
        className={`text-xs font-semibold ${ibmPlexMono.className}`}
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

function SeriesToggle({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  const fg = active ? color : "#656565";

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between gap-6 px-2 py-1.5 transition-all duration-200 border rounded-xs hover:brightness-125"
      style={{
        backgroundColor: "#112226",
        borderColor: active ? "#1E4B59" : "rgba(255,255,255,0.1)",
        minWidth: "140px",
      }}
    >
      <span
        className={`text-2xs tracking-widest uppercase whitespace-nowrap transition-colors duration-200 ${ibmPlexMono.className}`}
        style={{ color: fg }}
      >
        {label}
      </span>
      <div className="flex items-center w-12">
        <div
          className="w-full transition-colors duration-200"
          style={{ height: "1.5px", backgroundColor: fg }}
        />
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading skeleton                                                            */
/* -------------------------------------------------------------------------- */

function ChartSkeleton() {
  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1 items-end h-10">
          {[40, 60, 30, 70, 50, 80, 45, 65, 35, 75].map((h, i) => (
            <div
              key={i}
              className="w-5 rounded-sm animate-pulse"
              style={{
                height: `${h}%`,
                backgroundColor: "#1E4B59",
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>
        <span className={`text-2xs text-[#456070] ${ibmPlexMono.className}`}>
          Loading PNL history…
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                 */
/* -------------------------------------------------------------------------- */

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <span className={`text-2xs text-[#456070] ${ibmPlexMono.className}`}>
          {message}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* OverviewContent                                                             */
/* -------------------------------------------------------------------------- */

type TimeRange = "1H" | "1D";

/** Maps the UI time-range label to the API interval value */
const INTERVAL_MAP: Record<TimeRange, "hour" | "day"> = {
  "1H": "hour",
  "1D": "day",
};

export default function OverviewContent() {
  const { address, isConnected } = useAccount();

  const [timeRange, setTimeRange] = useState<TimeRange>("1H");

  /* USD / BTC denomination toggle — hidden until the feature is enabled */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [showBtc, setShowBtc] = useState(false);

  /* Series visibility toggles */
  const [showTotal, setShowTotal] = useState(true);
  const [showPerps, setShowPerps] = useState(true);
  const [showBands, setShowBands] = useState(true);
  const [showEarn, setShowEarn] = useState(true);

  /* ── Portfolio store (summary cards + bento boxes) ── */
  const perpData = usePortfolioStore((s) => s.perpData);
  const rawTransactions = usePortfolioStore((s) => s.rawTransactions);
  const liquidationMarginTotal = usePortfolioStore((s) => s.liquidationMarginTotal);
  const loadingLiquidationFloor = usePortfolioStore((s) => s.loadingLiquidationFloor);
  const loadingPerps = usePortfolioStore((s) => s.loadingPerps);

  /* ── Earn exposure store (item 24) — total LP P/L = fees + inventory MTB + hedging (§4.6) ── */
  const exposureTotals = useEarnExposureStore((s) => s.totals);

  /* ── PNL history store (chart data) ── */
  const fetchHistory = usePnlHistoryStore((s) => s.fetchHistory);
  const clearHistory = usePnlHistoryStore((s) => s.clearHistory);
  const pnlLoading = usePnlHistoryStore((s) => s.loading);
  const pnlError = usePnlHistoryStore((s) => s.error);
  const hourData = usePnlHistoryStore((s) => s.hourData);
  const dayData = usePnlHistoryStore((s) => s.dayData);

  /* ── Fetch on mount / wallet / time-range change ── */
  useEffect(() => {
    if (!isConnected || !address) {
      clearHistory();
      return;
    }
    const interval = INTERVAL_MAP[timeRange];
    fetchHistory(address, interval);
  }, [isConnected, address, timeRange, fetchHistory, clearHistory]);

  /* ── Pick active chart data ── */
  const chartData = timeRange === "1H" ? hourData : dayData;

  /* ── Derived PNL values for summary cards ── */
  const { perpsPnl, bandsPnl, earnPnl, totalPnl, traderEquity } = useMemo(() => {
    // origin:"lp" rows (task #42 accrual half) are a curve's own coin
    // balance, not a trader position — excluded structurally before the
    // reduce below, the same #41 law BANDS' own sum already follows, never
    // relied on a field happening to default to 0 (audit finding on eafa1b0).
    const active = perpData.filter(
      (e) => !e.isClosed && (e.origin ?? "opened") === "opened"
    );
    const perpsPnl = active.reduce((s, e) => s + (e.pnl ?? 0), 0);
    const openTxs = (rawTransactions ?? []).filter((tx) => !tx.is_closed);
    const { longPerpBandsPnl, shortPerpBandsPnl } = aggregateBandsPnlByPerpType(openTxs);
    const bandsPnl = longPerpBandsPnl + shortPerpBandsPnl;
    // Reduce-only change (design §11 item 24): sum LP P/L from the exposure totals
    // (fees earned + inventory mark-to-book + hedging attribution, §4.6) instead of
    // the retired flat-row pnlUsd. The historical AreaChart's "earn" series is untouched.
    const earnPnl = exposureTotals?.totalPnlUsd ?? 0;
    const totalPnl = perpsPnl + bandsPnl + earnPnl;
    const traderEquity = active.reduce((s, e) => s + (e.traderEquity ?? 0), 0);
    return { perpsPnl, bandsPnl, earnPnl, totalPnl, traderEquity };
  }, [perpData, rawTransactions, exposureTotals]);

  const liqFloorValue = loadingLiquidationFloor
    ? "$----"
    : liquidationMarginTotal != null
      ? formatCurrencyNoSign(liquidationMarginTotal)
      : "$----";

  /* ── Bento content ── */
  const bentContent: BentoContent = useMemo(
    () => ({
      totalPnl: {
        title: "TOTAL PNL",
        icon: <Layers className="h-5 w-5 text-[#0ABAB5]" />,
        value: formatCurrencyNoSign(totalPnl),
        align: "center",
      },
      traderEquity: {
        title: "TRADER EQUITY",
        icon: <Wallet className="h-5 w-5 text-[#0ABAB5]" />,
        value: formatCurrencyNoSign(traderEquity),
        align: "center",
      },
      liqFloor: {
        title: "LIQUIDATION FLOOR",
        icon: <BookAlertIcon className="h-5 w-5 text-[#0ABAB5]" />,
        value: liqFloorValue,
        align: "center",
      },
    }),
    [totalPnl, traderEquity, liqFloorValue]
  );

  /* ── Y-axis domain with padding ── */
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [-20, 20] as [number, number];
    const allVals = chartData.flatMap((d) => [d.total, d.perps, d.bands, d.earn]);
    const minY = Math.min(...allVals);
    const maxY = Math.max(...allVals);
    const pad = (maxY - minY) * 0.12 || 20;
    return [minY - pad, maxY + pad] as [number, number];
  }, [chartData]);

  const timeOptions: TimeRange[] = ["1H", "1D"];

  /* ── Chart ── */
  const chartContent = (() => {
    if (!isConnected) {
      return <ChartEmpty message="Connect your wallet to view PNL history" />;
    }
    if (pnlLoading) {
      return <ChartSkeleton />;
    }
    if (pnlError || chartData.length === 0) {
      return (
        <ChartEmpty
          message={pnlError ? "Failed to load PNL history" : "No historical PNL data available"}
        />
      );
    }
    return (
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <defs>
            {(["total", "perps", "bands", "earn"] as const).map((key) => (
              <linearGradient
                key={key}
                id={`grad-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={chartConfig[key].color}
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig[key].color}
                  stopOpacity={0.02}
                />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="0 0" stroke="#333" vertical={true} />

          <XAxis
            dataKey="date"
            tick={{ fill: "#808080", fontSize: 10 }}
            axisLine={true}
            tickLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            domain={yDomain}
            tick={(props) => {
              const { x, y, payload } = props;
              const val: number = payload.value;
              const isNeg = val < 0;
              return (
                <text
                  x={x}
                  y={y}
                  dy={4}
                  textAnchor="end"
                  fontSize={10}
                  style={{ fill: isNeg ? "#FF6767" : "#808080" }}
                >
                  {isNeg ? `-$${Math.abs(val).toFixed(0)}` : `$${val.toFixed(0)}`}
                </text>
              );
            }}
            axisLine={true}
            tickLine={false}
            width={56}
          />

          <ReferenceLine y={0} stroke="#444" strokeWidth={1} />

          <ChartTooltip content={<CustomChartTooltip />} />

          {showTotal && (
            <Area
              type="linear"
              dataKey="total"
              name="Total"
              stroke={chartConfig.total.color}
              fill="url(#grad-total)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
          )}
          {showPerps && (
            <Area
              type="linear"
              dataKey="perps"
              name="Perps PNL"
              stroke={chartConfig.perps.color}
              fill="url(#grad-perps)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
          )}
          {showBands && (
            <Area
              type="linear"
              dataKey="bands"
              name="Bands PNL"
              stroke={chartConfig.bands.color}
              fill="url(#grad-bands)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
          )}
          {showEarn && (
            <Area
              type="linear"
              dataKey="earn"
              name="Earn PNL"
              stroke={chartConfig.earn.color}
              fill="url(#grad-earn)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ChartContainer>
    );
  })();

  return (
    <div className="flex flex-col gap-0 w-full">
      {/* ----------------------- Chart card ----------------------- */}
      <Card className="relative rounded-sm p-3 flex flex-col h-full min-h-0 text-white bg-[#0E1B1E] border border-[#D1D1D1] gap-4">

        {/* Top header: [Total PNL card] [Perps|Bands|Earn] [controls] */}
        <div className="flex items-stretch gap-0 my-1 mx-3">
          {/* Total PNL */}
          <TotalPnlCard
            value={formatCurrency(totalPnl)}
            color={chartConfig.total.color}
          />

          {/* Perps / Bands / Earn */}
          <SmallPnlCard
            label="PERPS PNL"
            value={formatCurrency(perpsPnl)}
            color={chartConfig.perps.color}
            isFirst
          />
          <SmallPnlCard
            label="BANDS PNL"
            value={formatCurrency(bandsPnl)}
            color={chartConfig.bands.color}
          />
          <SmallPnlCard
            label="EARN PNL"
            value={formatCurrency(earnPnl)}
            color={chartConfig.earn.color}
            isLast
          />

          {/* Right-aligned controls: time-range toggle + hidden BTC toggle */}
          <div className="flex items-center pl-8 gap-3">
            {/* USD / BTC toggle — hidden until feature is enabled */}
            <div className="hidden flex gap-0 rounded-sm overflow-hidden border border-[#004240]">
              {(["USD", "BTC"] as const).map((denom) => (
                <button
                  key={denom}
                  id={`pnl-denom-${denom.toLowerCase()}`}
                  onClick={() => setShowBtc(denom === "BTC")}
                  className={`px-3 py-1 text-2xs tracking-wider font-medium transition-all duration-150 ${ibmPlexMono.className} ${(denom === "BTC") === showBtc
                    ? "bg-[#0ABAB5] text-black"
                    : "bg-[#112226] text-[#6B7E8A] hover:bg-[#1A2E33]"
                    }`}
                >
                  {denom}
                </button>
              ))}
            </div>

            {/* Time-range toggle */}
            <div className="flex gap-0 rounded-sm overflow-hidden border border-[#004240]">
              {timeOptions.map((opt) => (
                <button
                  key={opt}
                  id={`pnl-timerange-${opt.toLowerCase()}`}
                  onClick={() => setTimeRange(opt)}
                  className={`px-3 py-1 text-2xs tracking-wider font-medium transition-all duration-150 ${ibmPlexMono.className} ${timeRange === opt
                    ? "bg-[#0ABAB5] text-black"
                    : "bg-[#112226] text-[#6B7E8A] hover:bg-[#1A2E33]"
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart area */}
        {chartContent}

        {/* Series toggle row */}
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-[#004240] mt-1">
          <SeriesToggle
            label="TOTAL PORTFOLIO PNL"
            color={chartConfig.total.color}
            active={showTotal}
            onClick={() => setShowTotal((v) => !v)}
          />
          <SeriesToggle
            label="PERPS PNL"
            color={chartConfig.perps.color}
            active={showPerps}
            onClick={() => setShowPerps((v) => !v)}
          />
          <SeriesToggle
            label="BANDS PNL"
            color={chartConfig.bands.color}
            active={showBands}
            onClick={() => setShowBands((v) => !v)}
          />
          <SeriesToggle
            label="EARN PNL"
            color={chartConfig.earn.color}
            active={showEarn}
            onClick={() => setShowEarn((v) => !v)}
          />
        </div>
      </Card>

      {/* ----------------------- Bento stat boxes ----------------------- */}
      <BentoGrid content={bentContent} loading={loadingPerps} className="mt-4" />
    </div>
  );
}

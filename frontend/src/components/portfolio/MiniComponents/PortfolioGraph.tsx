"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { NameType } from "recharts/types/component/DefaultTooltipContent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ibmPlexMono } from "@/lib/font";
import { CandleResolution } from "@/lib/data";

// Placeholder data types for PnL and Equity time-series
export interface PortfolioDataPoint {
  timestamp: number;
  value: number;
  formattedTime?: string;
}

const resolutionOptions = [
  {
    label: "MINUTES",
    options: [
      { label: "5 Minutes", value: "5m" },
      { label: "15 Minutes", value: "15m" },
    ],
  },
  {
    label: "HOURS",
    options: [
      { label: "1 Hour", value: "1h" },
      { label: "4 Hours", value: "4h" },
    ],
  },
  {
    label: "DAYS",
    options: [
      { label: "1 Day", value: "1d" },
      { label: "1 Week", value: "1w" },
      { label: "1 Month", value: "1M" },
    ],
  },
];

// Placeholder data generator - to be replaced with actual API calls
const generatePlaceholderData = (resolution: CandleResolution, dataType: "pnl" | "equity"): PortfolioDataPoint[] => {
  const now = Date.now();
  const intervalMsMap: Record<CandleResolution, number> = {
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000,
  };

  const interval = intervalMsMap[resolution];
  const lookback = interval * 100;
  const startTime = now - lookback;

  const data: PortfolioDataPoint[] = [];
  let baseValue = dataType === "pnl" ? 0 : 10000;

  for (let i = 0; i < 100; i++) {
    const timestamp = startTime + i * interval;
    baseValue += (Math.random() - 0.45) * (dataType === "pnl" ? 100 : 500);
    if (dataType === "pnl" && baseValue < -5000) baseValue = -5000;
    
    data.push({
      timestamp,
      value: baseValue,
      formattedTime: new Date(timestamp).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  }

  return data;
};

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload as PortfolioDataPoint | undefined;
  
  return (
    <div className="p-2 rounded-md bg-black/80 border border-white/20 shadow-md space-y-2">
      {data?.formattedTime && (
        <p className="text-white font-semibold text-xs">{data.formattedTime}</p>
      )}
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-white text-xs">
          <span
            className="inline-block w-2 h-2 mr-2 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function PortfolioGraph() {
  const [selectedMetric, setSelectedMetric] = useState<"pnl" | "equity">("pnl");
  const [resolution, setResolution] = useState<CandleResolution>("1h");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PortfolioDataPoint[]>([]);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      const generatedData = generatePlaceholderData(resolution, selectedMetric);
      setData(generatedData);
      setLoading(false);
    }, 500);
  }, [resolution, selectedMetric]);

  if (loading || !data || data.length === 0) {
    return (
      <Skeleton className="h-full w-full bg-gray-800 min-h-[400px]" />
    );
  }

  const allValues = data.map((d) => d.value);
  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);
  const yPadding = (maxY - minY) * 0.1;

  const metricLabel = selectedMetric === "pnl" ? "PnL" : "Account Equity";
  const metricColor = selectedMetric === "pnl" ? "#2563eb" : "#10b981";

  return (
    <div className="relative rounded-lg p-2 flex flex-col h-full min-h-0 text-white bg-[#0E1B1E] border border-[#D1D1D1]">
      {/* Controls Row */}
      <div className="flex mb-2 gap-2 justify-between items-center">
        {/* Tabs for PnL/Equity */}
        <Tabs value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as "pnl" | "equity")}>
          <TabsList className="bg-transparent gap-4 p-1 rounded-none h-auto">
            <TabsTrigger
              value="equity"
              className={`p-2 text-white hover:bg-gray-700/50 data-[state=active]:bg-transparent data-[state=active]:text-[#0ABAB5]  data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#0ABAB5] rounded-none transition-all duration-200 ${ibmPlexMono.className}`}
            >
              <span className="tracking-wider font-medium text-sm">ACCOUNT EQUITY</span>
            </TabsTrigger>
            <TabsTrigger
              value="pnl"
              className={`p-2 text-white hover:bg-gray-700/50 data-[state=active]:bg-transparent data-[state=active]:text-[#0ABAB5]  data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#0ABAB5] rounded-none transition-all duration-200 ${ibmPlexMono.className}`}
            >
              <span className="tracking-wider font-medium text-sm">PNL</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Resolution Selector */}
        <Select
          value={resolution}
          onValueChange={(val) => setResolution(val as CandleResolution)}
        >
          <SelectTrigger className="w-40 h-8 text-white border border-gray-600 bg-[#1a1a1a]">
            <SelectValue placeholder="Resolution" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] text-white">
            {resolutionOptions.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel className="text-gray-400 text-xs px-2 pt-2">
                  {group.label}
                </SelectLabel>
                {group.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chart Display */}
      <div className="flex-1 min-h-0 h-full">
        <ResponsiveContainer width="100%" height="100%" className="min-h-[300px]">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#333" />

            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => {
                const date = new Date(value);
                
                if (resolution === "5m" || resolution === "15m") {
                  return date.toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                }
                
                if (resolution === "1h" || resolution === "4h") {
                  return date.toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    hour12: false,
                  });
                }
                
                if (resolution === "1d" || resolution === "1w") {
                  return date.toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    month: "short",
                    day: "2-digit",
                  });
                }
                
                if (resolution === "1M") {
                  return date.toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    month: "short",
                    year: "numeric",
                  });
                }
                
                return date.toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                });
              }}
              style={{
                fontSize: "0.8rem",
                fill: "white",
              }}
              // label={{
              //   value: "Time",
              //   position: "insideBottom",
              //   offset: -5,
              //   fill: "#FFFFFF",
              //   style: { fontSize: "0.75rem" },
              // }}
            />

            <YAxis
              domain={[minY - yPadding, maxY + yPadding]}
              tickFormatter={(value) => {
                if (selectedMetric === "pnl") {
                  return value >= 0 ? `+${value.toFixed(0)}` : value.toFixed(0);
                }
                return value.toFixed(0);
              }}
              style={{
                fontSize: "0.8rem",
                fill: "white",
              }}
              // label={{
              //   value: metricLabel,
              //   angle: -90,
              //   position: "insideLeft",
              //   fill: "#FFFFFF",
              //   style: { fontSize: "0.75rem", textAnchor: "middle" },
              // }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              // type="monotone"
              type="linear"
              // type="step"
              name={metricLabel}
              dataKey="value"
              stroke={metricColor}
              fill={selectedMetric === "pnl" ? "url(#colorPnl)" : "url(#colorEquity)"}
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


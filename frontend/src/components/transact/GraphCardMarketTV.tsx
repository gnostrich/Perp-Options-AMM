"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  AreaSeries,
  CandlestickSeries,
  BaselineSeries,
  IPriceLine,
  LineStyle,
  BusinessDay,
  Time,
} from "lightweight-charts";

import { useGraphStore } from "@/store/graphStore";
import { useTradeStore } from "@/store/tradeStore";
import { deduplicateCandlesByTime } from "@/lib/data/api/hyperliquid-websocket";

type Band = {
  from: number;
  to: number;
  color: string;
  opacity?: number;
};

const AXIS_MIN = 0;
const AXIS_MAX = 250000;

/** Lock the Y-range for a series using autoscaleInfoProvider */
type SeriesWithAutoscale<T extends "Candlestick" | "Baseline"> = ISeriesApi<T> & {
  applyOptions(options: {
    autoscaleInfoProvider?: (baseImplementation: () => { priceRange: { minValue: number; maxValue: number } } | null) => { priceRange: { minValue: number; maxValue: number } } | null;
  }): void;
};

// Band overlays must never drive the y-scale — the candles do.
function excludeFromAutoscale(series: SeriesWithAutoscale<"Candlestick"> | SeriesWithAutoscale<"Baseline">) {
  series.applyOptions({
    autoscaleInfoProvider: () => null,
  });
}

/**
 * Sets the visible time range to show a smart number of candles based on resolution
 */
function setSmartVisibleRange(
  chart: IChartApi,
  data: Array<{ time: UTCTimestamp }>,
  resolution: string
) {
  // Target candle counts for each resolution
  const targetCandleCount: Record<string, number> = {
    "5m": 120,
    "15m": 120,
    "1h": 120,
    "4h": 120,
    "1d": 120,
    "1w": 80,
    "1M": 36,
  };
  
  const targetCount = targetCandleCount[resolution] || 80;
  const candlesToShow = Math.min(targetCount, data.length);
  
  // If we have very few candles, just fit all content
  if (candlesToShow <= 1 || data.length === 0) {
    chart.timeScale().fitContent();
    return;
  }
  
  // Calculate the start index to show last N candles
  const startIndex = Math.max(0, data.length - candlesToShow);
  const from = data[startIndex].time;
  const to = data[data.length - 1].time;
  
  try {
    chart.timeScale().setVisibleRange({ from, to });
  } catch (error) {
    console.warn("Failed to set visible range:", error);
    // Fallback to fitContent if setVisibleRange fails
    chart.timeScale().fitContent();
  }
}

export default function GraphCardMarketTV() {
  const {
    marketGraphData,
    connectHyperliquidCandleWebSocket,
    disconnectHyperliquidCandleWebSocket,
    connectHyperliquidMidPriceWebSocket,
    disconnectHyperliquidMidPriceWebSocket,
    loadMarketGraphData,
    selectedGraph,
    resolution,
    currentMarkPrice,
    bandValues,
    loading,
    retryAttempt
  } = useGraphStore();

  const {
    sellMarket,
    buyMarket,
    activeTab,
    autoProtect,
    oldFloor,
    newFloor
  } = useTradeStore();

  // Hydration check: wait for Zustand store to rehydrate from localStorage before fetching
  // This prevents refetching when resolution changes from default to persisted value during hydration
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Connect Hyperliquid mid price WebSocket for live mark price updates
  useEffect(() => {
    connectHyperliquidMidPriceWebSocket("BTC");
    return () => {
      disconnectHyperliquidMidPriceWebSocket();
    };
  }, [connectHyperliquidMidPriceWebSocket, disconnectHyperliquidMidPriceWebSocket]);

  // Load initial candle data from SDK (constant intervals), then connect WebSocket for real-time updates
  useEffect(() => {
    if (!isHydrated) return; // Skip during hydration to prevent refetch on rehydration
    
    const resolutionChanged = lastFetchedResolutionRef.current !== resolution;
    
    // If we already have data AND resolution hasn't changed (e.g., navigating back from another page), 
    // just reconnect WebSocket for live updates - don't refetch and show loading
    if (marketGraphData && marketGraphData.length > 0 && !resolutionChanged) {
      console.log(`[Skip] Data already exists for resolution ${resolution}, reconnecting WebSocket`);
      // Ensure loading is cleared when skipping refetch
      if (loading) {
        useGraphStore.setState({ loading: false, retryAttempt: 0 });
      }
      connectHyperliquidCandleWebSocket("BTC-PERP", resolution);
      return () => {
        disconnectHyperliquidCandleWebSocket();
      };
    }
    
    // No data exists - fetch from SDK first
    let cancelled = false;
    
    const loadData = async () => {
      if (loadingRef.current === resolution) {
        console.log(`[Skip] Already loading ${resolution}, preventing duplicate API call`);
        return;
      }
      
      loadingRef.current = resolution;
      console.log(`[Loading] Starting load for resolution: ${resolution}`);
      
      try {
        // Load historical data from SDK first (for historical depth)
        await loadMarketGraphData("BTC-PERP", resolution);
        
        // Mark that we've fetched data for this resolution
        lastFetchedResolutionRef.current = resolution;
        
        // Only connect WebSocket after SDK completes (success or failure)
        // This eliminates race conditions between SDK and WebSocket data
        if (!cancelled) {
          connectHyperliquidCandleWebSocket("BTC-PERP", resolution);
        }
      } finally {
        loadingRef.current = null;
      }
    };
    
    loadData();
    
    return () => {
      cancelled = true;
      disconnectHyperliquidCandleWebSocket();
    };
  }, [resolution, isHydrated]);

  const parseNum = (v: string | undefined) => {
    const n = parseFloat(v ?? "");
    return isNaN(n) || n <= 0 ? undefined : n;
  };

  const isSellShort = sellMarket?.toLowerCase().includes("short");
  const isBuyShort = buyMarket?.toLowerCase().includes("short");

  // Open-ended bands cap at 2x / 0.5x the live mark (the engine grid's own
  // range) instead of a hardcoded axis constant.
  const capHi = currentMarkPrice > 0 ? currentMarkPrice * 2 : AXIS_MAX;
  const capLo = currentMarkPrice > 0 ? currentMarkPrice / 2 : AXIS_MIN;

  const sellFromAbs = parseNum(bandValues.finalSellFrom?.toFixed(2));
  const sellToAbs = parseNum(bandValues.finalSellTo?.toFixed(2)) ?? (isSellShort ? capLo : capHi);

  const buyFromAbs = parseNum(bandValues.finalBuyFrom?.toFixed(2));
  const buyToAbs = parseNum(bandValues.finalBuyTo?.toFixed(2)) ?? (isBuyShort ? capLo : capHi);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const markLineRef = useRef<IPriceLine | null>(null);
  const buyBandRef = useRef<ISeriesApi<"Baseline"> | null>(null);
  const sellBandRef = useRef<ISeriesApi<"Baseline"> | null>(null);
  const buyLineRef = useRef<IPriceLine | null>(null);
  const sellLineRef = useRef<IPriceLine | null>(null);
  const lastPriceLineRef = useRef<IPriceLine | null>(null);
  const oldFloorLineRef = useRef<IPriceLine | null>(null);
  const newFloorLineRef = useRef<IPriceLine | null>(null);
  const previousResolutionRef = useRef<string>(resolution);
  const lastFetchedResolutionRef = useRef<string | null>(null); // Track last resolution we fetched data for
  const wsDataModifiedRef = useRef<boolean>(false);
  const loadingRef = useRef<string | null>(null);
  const floorPricesRef = useRef<{ oldFloor: number; newFloor: number; active: boolean }>({
    oldFloor: 0,
    newFloor: 0,
    active: false,
  });

  const showBands = activeTab === 'trade-bands';

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { background: { color: "#0E1B1E" }, textColor: "rgba(255,255,255,0.9)" },
      grid: { vertLines: { color: "#333" }, horzLines: { color: "#333" } },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: "#485c7b",
        autoScale: true,
        scaleMargins: { top: 0.05, bottom: 0.05 },
      },
      timeScale: {
        borderColor: "#485c7b",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: UTCTimestamp | BusinessDay) => {
          const date = typeof time === 'number' 
            ? new Date(time * 1000) 
            : new Date(Date.UTC((time as BusinessDay).year, (time as BusinessDay).month - 1, (time as BusinessDay).day));
          
          // Format based on current resolution for consistent display
          const currentResolution = resolution;
          
          if (currentResolution === '5m' || currentResolution === '15m' || currentResolution === '1h' || currentResolution === '4h') {
            // Show full date and time for small intervals (1m - 4h)
            return new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'UTC'
            }).format(date);
          } else if (currentResolution === '1d') {
            // Show only date for daily
            return new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              timeZone: 'UTC'
            }).format(date);
          } else {
            // Show month/year for weekly and monthly (1w, 1M)
            return new Intl.DateTimeFormat('en-US', {
              month: 'short',
              year: 'numeric',
              timeZone: 'UTC'
            }).format(date);
          }
        },
      },
    });
    chartRef.current = chart;

    const area = chart.addSeries(CandlestickSeries, {
      upColor: "rgba(0, 255, 156, 0.6)",
      downColor: "rgba(255, 103, 103, 0.61)",
      borderUpColor: "rgba(0, 255, 156, 1)",
      borderDownColor: "rgba(255, 103, 103, 1)",
      wickUpColor: "rgba(0, 255, 156, 1)",
      wickDownColor: "rgba(255, 103, 103, 1)",
      lastValueVisible: false,  // Hide the automatic last value box
      priceLineVisible: false,  // Hide the built-in last-value price line (can appear without label)
    });
    areaSeriesRef.current = area;


    /* ---------------- Tooltip setup ---------------- */
    const isBusinessDay = (t: Time): t is BusinessDay =>
      typeof t === "object" && t !== null && "year" in t && "month" in t && "day" in t;

    const formatAxisTimeUTC = (t: Time): string => {
      if (isBusinessDay(t)) {
        // date-only; keep it unshifted by building a UTC date
        const d = new Date(Date.UTC(t.year, t.month - 1, t.day));
        return new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(d);
      }
      // epoch seconds -> UTC time
      const d = new Date((t as UTCTimestamp) * 1000);
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      })
        .format(d)
        .replace(",", "");
    };


    const toolTip = document.createElement("div");
    toolTip.style.cssText = `
      position: absolute; display: none; pointer-events: none;
      background: #1a1a1a; color: white; border-radius: 4px;
      padding: 8px 10px; font-size: 13px; line-height: 1.4;
      z-index: 1000; font-family: 'IBM Plex Mono', monospace;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
    `;
    chartContainerRef.current.appendChild(toolTip);

    chart.subscribeCrosshairMove(param => {
      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        toolTip.style.display = "none";
        return;
      }

      const data = param.seriesData.get(area);
      if (!data) return;

      type CandlePoint = { time: Time; open: number; high: number; low: number; close: number };

      const sd = param.seriesData.get(area) as CandlePoint | undefined;
      if (!sd) {
        toolTip.style.display = "none";
        return;
      }

      const dateStr = formatAxisTimeUTC(param.time);

      toolTip.style.display = "block";
      toolTip.innerHTML = `
        <div style="color:#3B82F6; font-weight:600; margin-bottom:4px;">
          ${dateStr}
        </div>
        <div style="color:#3B82F6; font-weight:600; margin-bottom:2px;">
          Open: <span style="font-family:'IBM Plex Mono', monospace;">${Number(sd.open).toFixed(2)}</span>
        </div>
        <div style="color:#3B82F6; font-weight:600; margin-bottom:2px;">
          High: <span style="font-family:'IBM Plex Mono', monospace;">${Number(sd.high).toFixed(2)}</span>
        </div>
        <div style="color:#3B82F6; font-weight:600; margin-bottom:2px;">
          Low: <span style="font-family:'IBM Plex Mono', monospace;">${Number(sd.low).toFixed(2)}</span>
        </div>
        <div style="color:#3B82F6; font-weight:600;">
          Close: <span style="font-family:'IBM Plex Mono', monospace;">${Number(sd.close).toFixed(2)}</span>
        </div>
      `;

      let left = param.point.x + 10;
      let top = param.point.y + 10;
      if (left > chartContainerRef.current!.clientWidth - 150) {
        left = param.point.x - 150 - 10;
      }
      if (top > chartContainerRef.current!.clientHeight - 100) {
        top = param.point.y - 100 - 10;
      }
      toolTip.style.left = left + "px";
      toolTip.style.top = top + "px";
    });
    /* ---------------- End tooltip setup ---------------- */


    const onResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chart.resize(
          chartContainerRef.current.clientWidth,
          chartContainerRef.current.clientHeight
        );
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
      // Ensure any created price lines are removed before chart teardown
      // (important during hot reload / remounts).
      if (areaSeriesRef.current) {
        if (lastPriceLineRef.current) {
          areaSeriesRef.current.removePriceLine(lastPriceLineRef.current);
        }
        if (markLineRef.current) {
          areaSeriesRef.current.removePriceLine(markLineRef.current);
        }
        if (buyLineRef.current) {
          areaSeriesRef.current.removePriceLine(buyLineRef.current);
        }
        if (sellLineRef.current) {
          areaSeriesRef.current.removePriceLine(sellLineRef.current);
        }
        if (oldFloorLineRef.current) {
          areaSeriesRef.current.removePriceLine(oldFloorLineRef.current);
        }
        if (newFloorLineRef.current) {
          areaSeriesRef.current.removePriceLine(newFloorLineRef.current);
        }
      }
      chartRef.current?.remove();
      chartRef.current = null;
      areaSeriesRef.current = null;
      buyBandRef.current = null;
      sellBandRef.current = null;
      markLineRef.current = null;
      buyLineRef.current = null;
      sellLineRef.current = null;
      lastPriceLineRef.current = null;
      oldFloorLineRef.current = null;
      newFloorLineRef.current = null;
    };
  }, []);

  // Update timeScale formatter when resolution changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.applyOptions({
      timeScale: {
        tickMarkFormatter: (time: UTCTimestamp | BusinessDay) => {
          const date = typeof time === 'number' 
            ? new Date(time * 1000) 
            : new Date(Date.UTC((time as BusinessDay).year, (time as BusinessDay).month - 1, (time as BusinessDay).day));
          
          // Format based on current resolution for consistent display
          if (resolution === '5m' || resolution === '15m' || resolution === '1h' || resolution === '4h') {
            // Show full date and time for small intervals (1m - 4h)
            return new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'UTC'
            }).format(date);
          } else if (resolution === '1d') {
            // Show only date for daily
            return new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              timeZone: 'UTC'
            }).format(date);
          } else {
            // Show month/year for weekly and monthly (1w, 1M)
            return new Intl.DateTimeFormat('en-US', {
              month: 'short',
              year: 'numeric',
              timeZone: 'UTC'
            }).format(date);
          }
        },
      },
    });
  }, [resolution]);

  const upsertBandWithLine = (
    seriesRef: React.MutableRefObject<ISeriesApi<"Baseline"> | null>,
    lineRef: React.MutableRefObject<IPriceLine | null>,
    band: Band | undefined,
    firstTime?: UTCTimestamp,
    lastTime?: UTCTimestamp,
    title?: string
  ) => {
    const chart = chartRef.current;
    if (!chart) return;

    // Remove if no band or times
    if (!band || firstTime == null || lastTime == null) {
      if (seriesRef.current) {
        chart.removeSeries(seriesRef.current);
        seriesRef.current = null;
      }
      if (lineRef.current && areaSeriesRef.current) {
        areaSeriesRef.current.removePriceLine(lineRef.current);
        lineRef.current = null;
      }
      return;
    }

    const lo = Math.min(band.from, band.to);
    const hi = Math.max(band.from, band.to);
    const alpha = band.opacity ?? 0.25;
    const [r, g, b] = hexToRgbArray(band.color);

    const options = {
      baseValue: { type: "price", price: lo },
      topFillColor1: `rgba(${r}, ${g}, ${b}, ${alpha})`,
      topFillColor2: `rgba(${r}, ${g}, ${b}, ${alpha})`,
      topLineColor: "rgba(0,0,0,0)",
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      bottomLineColor: "rgba(0,0,0,0)",
      lastValueVisible: false,
    } as const;

    if (!seriesRef.current) {
      seriesRef.current = chart.addSeries(BaselineSeries, options);
      excludeFromAutoscale(seriesRef.current);
    } else {
      seriesRef.current.applyOptions(options);
      excludeFromAutoscale(seriesRef.current);
    }

    seriesRef.current.setData([
      { time: firstTime, value: hi },
      { time: lastTime, value: hi },
    ]);

    if (areaSeriesRef.current) {
      if (!lineRef.current) {
        lineRef.current = areaSeriesRef.current.createPriceLine({
          price: hi,
          color: `rgb(${r}, ${g}, ${b})`,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: false,
          title: title ?? "",
        });
      } else {
        lineRef.current.applyOptions({
          price: hi,
          color: `rgb(${r}, ${g}, ${b})`,
          title: title ?? "",
          axisLabelVisible: false,
        });
      }
    }
  };

  // Handle main price data and price lines
  useEffect(() => {
    const chart = chartRef.current;
    const series = areaSeriesRef.current;
    if (!chart || !series || !marketGraphData || marketGraphData.length === 0) return;

    // Conditionally deduplicate: only when WebSocket has modified data
    // SDK data is already clean and unique, no need to deduplicate it
    const deduplicated = wsDataModifiedRef.current 
      ? deduplicateCandlesByTime(marketGraphData)
      : marketGraphData;

    // Transform to chart format and sort
    const areaData = deduplicated
      .map((d) => ({
        time: Math.floor(d.time / 1000) as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));

    // Data validation logging: verify constant intervals
    if (areaData.length >= 5) {
      // console.log(`[${resolution}] Data validation - First 5 candles:`, 
      //   areaData.slice(0, 5).map(d => new Date(d.time * 1000).toISOString()));
      // console.log(`[${resolution}] Data validation - Last 5 candles:`, 
      //   areaData.slice(-5).map(d => new Date(d.time * 1000).toISOString()));
      
      // Calculate intervals between consecutive candles using the most recent ones
      const intervals: number[] = [];
      const len = areaData.length;
      for (let i = Math.max(1, len - 10); i < len; i++) {
        const intervalSeconds = (areaData[i].time as number) - (areaData[i-1].time as number);
        intervals.push(intervalSeconds);
      }
      // console.log(`[${resolution}] Last 10 intervals (seconds):`, intervals);
      // console.log(`[${resolution}] Interval consistency check - all equal?`, 
      //   intervals.every(i => i === intervals[intervals.length - 1]));
      
      // Verify intervals match expected resolution to prevent rendering stale data
      const expectedIntervals: Record<string, number> = {
        "5m": 300,
        "15m": 900,
        "1h": 3600,
        "4h": 14400,
        "1d": 86400,
        "1w": 604800,
        "1M": 2592000, // Approximate: 30 days
      };
      
      const expectedInterval = expectedIntervals[resolution];
      const actualInterval = intervals[intervals.length - 1];
      
      if (expectedInterval && actualInterval && Math.abs(actualInterval - expectedInterval) > 60) {
        console.warn(`[${resolution}] Data interval mismatch! Expected: ${expectedInterval}s, Got: ${actualInterval}s`);
        console.warn(`[${resolution}] Skipping render - waiting for correct resolution data`);
        return; // Don't render mismatched data
      }
    }

    // Check if this is initial load (no existing data) or update
    const existingData = series.data();
    const isInitialLoad = !existingData || existingData.length === 0;
    
    // Detect resolution change
    const resolutionChanged = previousResolutionRef.current !== resolution;
    if (resolutionChanged) {
      previousResolutionRef.current = resolution;
    }

    if (isInitialLoad) {
      // Initial load: set all sorted data from SDK
      series.setData(areaData);
      
      // SDK data loaded - reset WebSocket modification flag
      wsDataModifiedRef.current = false;
      
      // Set smart visible range to show appropriate number of candles
      if (areaData.length > 0) {
        setSmartVisibleRange(chart, areaData, resolution);
      } else {
        chart.timeScale().fitContent();
      }
    } else if (resolutionChanged) {
      // Resolution changed: SDK reloads with new data
      series.setData(areaData);
      
      // SDK data loaded - reset WebSocket modification flag
      wsDataModifiedRef.current = false;
      
      // Set smart visible range for new resolution
      if (areaData.length > 0) {
        setSmartVisibleRange(chart, areaData, resolution);
      } else {
        chart.timeScale().fitContent();
      }
    } else {
      // Update: WebSocket incremental updates
      // Mark that WebSocket has modified data (needs deduplication next time)
      wsDataModifiedRef.current = true;
      
      const existingDataArray = existingData as Array<{ time: UTCTimestamp; open: number; high: number; low: number; close: number }>;
      const lastExisting = existingDataArray[existingDataArray.length - 1];
      const lastNew = areaData[areaData.length - 1];
      
      if (!lastExisting || !lastNew) {
        // Fallback: use setData if we can't get the last points
        series.setData(areaData);
        
        // Set smart visible range
        if (areaData.length > 0) {
          setSmartVisibleRange(chart, areaData, resolution);
        } else {
          chart.timeScale().fitContent();
        }
        return;
      }
      
      // Direct number comparison (timestamps are already UTCTimestamp which is number)
      const lastExistingTime = lastExisting.time as number;
      const lastNewTime = lastNew.time as number;
      
      if (lastNewTime > lastExistingTime) {
        // New candle: append using update()
        series.update(lastNew);
      } else if (lastNewTime === lastExistingTime) {
        // Same candle timestamp: update the candle
        series.update(lastNew);
      } else {
        // Data changed significantly (e.g., new snapshot with older data)
        // Replace all data with sorted array
        series.setData(areaData);
        
        // Set smart visible range
        if (areaData.length > 0) {
          setSmartVisibleRange(chart, areaData, resolution);
        } else {
          chart.timeScale().fitContent();
        }
      }
    }

    // Remove the previously-rendered last-close price line (the dashed "Close Price" marker)
    // so the chart does not draw a dashed line at the last point.
    if (lastPriceLineRef.current) {
      series.removePriceLine(lastPriceLineRef.current);
      lastPriceLineRef.current = null;
    }

    if (!markLineRef.current) {
      markLineRef.current = series.createPriceLine({
        price: currentMarkPrice,
        color: "#ffffff",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `Current Mark Price`,
      });
    } else {
      markLineRef.current.applyOptions({
        price: currentMarkPrice,
        title: `Current Mark Price`,
      });
    }
  }, [
    marketGraphData,
    currentMarkPrice,
  ]);

  // Handle buy/sell bands only
  useEffect(() => {
    const chart = chartRef.current;
    const series = areaSeriesRef.current;
    if (!chart || !series || !marketGraphData) return;

    const areaData = marketGraphData.map((d) => ({
      time: Math.floor(d.time / 1000) as UTCTimestamp,
      value: d.close,
    }));

    const firstTime = areaData[0]?.time;
    const lastTime = areaData[areaData.length - 1]?.time;

    if (showBands) {
      // BUY band + titled price line
      upsertBandWithLine(
        buyBandRef,
        buyLineRef,
        buyFromAbs !== undefined
          ? { from: buyFromAbs, to: buyToAbs, color: "#212A41", opacity: 0.65 }
          : undefined,
        firstTime,
        lastTime,
        "Buy"
      );

      // SELL band + titled price line
      upsertBandWithLine(
        sellBandRef,
        sellLineRef,
        sellFromAbs !== undefined
          ? { from: sellFromAbs, to: sellToAbs, color: "#523C4C", opacity: 0.65 }
          : undefined,
        firstTime,
        lastTime,
        "Sell"
      );
    } else {
      // Clear any previously rendered bands/lines
      upsertBandWithLine(buyBandRef, buyLineRef, undefined, undefined, undefined);
      upsertBandWithLine(sellBandRef, sellLineRef, undefined, undefined, undefined);
    }
  }, [
    marketGraphData,
    buyFromAbs,
    buyToAbs,
    sellFromAbs,
    sellToAbs,
    showBands,
    resolution
  ]);

  // liquidation floor price lines
  useEffect(() => {
    const series = areaSeriesRef.current;
    if (!series) return;

    const showFloorLines = activeTab === 'create-perp';

    if (!showFloorLines) {
      // Remove floor lines when not on Create Perp tab
      if (oldFloorLineRef.current) {
        series.removePriceLine(oldFloorLineRef.current);
        oldFloorLineRef.current = null;
      }
      if (newFloorLineRef.current) {
        series.removePriceLine(newFloorLineRef.current);
        newFloorLineRef.current = null;
      }
      return;
    }

    // Handle Old Floor line
    if (oldFloor > 0) {
      // When AutoProtect is OFF, show a single liquidation line in red.
      const oldFloorTitle = autoProtect ? "    OLD LIQ FLOOR   " : "LIQUIDATION FLOOR";
      const oldFloorColor = autoProtect ? "#9D9D9D" : "#B32400";

      if (!oldFloorLineRef.current) {
        oldFloorLineRef.current = series.createPriceLine({
          price: oldFloor,
          color: oldFloorColor,
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          axisLabelTextColor: "#FFFFFF",
          title: oldFloorTitle,
        });
      } else {
        oldFloorLineRef.current.applyOptions({
          price: oldFloor,
          color: oldFloorColor,
          axisLabelVisible: true,
          axisLabelTextColor: "#FFFFFF",
          title: oldFloorTitle,
        });
      }
    } else {
      if (oldFloorLineRef.current) {
        series.removePriceLine(oldFloorLineRef.current);
        oldFloorLineRef.current = null;
      }
    }

    // Handle New Floor line (only when autoProtect is on and newFloor > 0)
    if (autoProtect && newFloor > 0) {
      if (!newFloorLineRef.current) {
        newFloorLineRef.current = series.createPriceLine({
          price: newFloor,
          color: "#0ABAB5",
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          axisLabelTextColor: "#000000",
          title: "    NEW LIQ FLOOR   ",
        });
      } else {
        newFloorLineRef.current.applyOptions({
          price: newFloor,
          axisLabelVisible: true,
          axisLabelTextColor: "#000000",
          title: "    NEW LIQ FLOOR   ",
        });
      }
    } else {
      if (newFloorLineRef.current) {
        series.removePriceLine(newFloorLineRef.current);
        newFloorLineRef.current = null;
      }
    }

    // Update floor prices ref for autoscale closure
    floorPricesRef.current = {
      oldFloor,
      newFloor,
      active: showFloorLines,
    };

    // Apply autoscaleInfoProvider to include floor prices in the visible range
    series.applyOptions({
      autoscaleInfoProvider: (baseImplementation: () => { priceRange?: { minValue: number; maxValue: number } } | null) => {
        const baseInfo = baseImplementation();

        // If no floor lines are active or base info is null, use default
        if (!floorPricesRef.current.active || !baseInfo || !baseInfo.priceRange) {
          return baseInfo;
        }

        const { oldFloor: oldFloorPrice, newFloor: newFloorPrice } = floorPricesRef.current;
        let { minValue, maxValue } = baseInfo.priceRange;

        // Extend range to include oldFloor if it exists
        if (oldFloorPrice > 0) {
          minValue = Math.min(minValue, oldFloorPrice);
          maxValue = Math.max(maxValue, oldFloorPrice);
        }

        // Extend range to include newFloor if it exists
        if (newFloorPrice > 0) {
          minValue = Math.min(minValue, newFloorPrice);
          maxValue = Math.max(maxValue, newFloorPrice);
        }

        // Add 5% padding so floor lines aren't pinned to edges
        const range = maxValue - minValue;
        const padding = range * 0.05;

        return {
          priceRange: {
            minValue: minValue - padding,
            maxValue: maxValue + padding,
          },
        };
      },
    });
  }, [oldFloor, newFloor, autoProtect, activeTab]);

  return (
    <div className="h-full w-full flex flex-col space-y-2">
      {/* Chart */}
      <div id="tour1-step6-graph" className="flex-1 min-h-[300px] relative">
        <div ref={chartContainerRef} className="w-full h-full" />
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[#0E1B1E]/90 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-6">
              {/* Temporal Logo Animation */}
              <style>{`
                #temporal-outer-left  { animation: temporal-slide-left  2s cubic-bezier(0.4,0,0.2,1) infinite; }
                #temporal-outer-right { animation: temporal-slide-right 2s cubic-bezier(0.4,0,0.2,1) infinite; }
                #temporal-inner-left  { animation: temporal-slide-left  2s cubic-bezier(0.4,0,0.2,1) infinite 0.35s; }
                #temporal-inner-right { animation: temporal-slide-right 2s cubic-bezier(0.4,0,0.2,1) infinite 0.35s; }
                @keyframes temporal-slide-left {
                  0%   { transform: translateX(14px); opacity: 0; }
                  40%  { transform: translateX(6px);  opacity: 0.9; }
                  100% { transform: translateX(0px);  opacity: 0; }
                }
                @keyframes temporal-slide-right {
                  0%   { transform: translateX(-14px); opacity: 0; }
                  40%  { transform: translateX(-6px);  opacity: 0.9; }
                  100% { transform: translateX(0px);   opacity: 0; }
                }
                @keyframes temporal-loading-pulse {
                  0%, 100% { opacity: 0.6; }
                  50%       { opacity: 0.9; }
                }
                #temporal-loading-text { animation: temporal-loading-pulse 1.8s ease-in-out infinite; }
              `}</style>
              <svg width="120" height="120" viewBox="0 0 198 198" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* T — static */}
                <path d="M97.1703 114.846V92.1341H82.9148V88.1306H115.429V92.1341H101.211V114.846H97.1703Z" fill="white" />
                {/* Inner left bracket */}
                <g id="temporal-inner-left">
                  <path d="M65.6953 65.6602L37.008 96.1982L60.1429 129.512" stroke="#0ABAB5" strokeWidth="1.85079" strokeLinecap="round" />
                </g>
                {/* Inner right bracket */}
                <g id="temporal-inner-right">
                  <path d="M131.391 65.6602L160.078 96.1982L136.943 129.512" stroke="#0ABAB5" strokeWidth="1.85079" strokeLinecap="round" />
                </g>
                {/* Outer left bracket */}
                <g id="temporal-outer-left">
                  <path d="M79.1459 57.586C79.4695 57.1904 79.4112 56.6074 79.0157 56.2838C78.6201 55.9601 78.0371 56.0184 77.7135 56.414L78.4297 57L79.1459 57.586ZM78.4297 57L77.7135 56.414L44.3992 97.1314L45.1154 97.7174L45.8317 98.3034L79.1459 57.586L78.4297 57Z" fill="#0ABAB5" />
                  <path d="M73.616 142.501C73.8927 142.931 74.4653 143.055 74.895 142.779C75.3248 142.502 75.4489 141.929 75.1723 141.5L74.3941 142.001L73.616 142.501ZM45.1875 96.6289L44.4094 97.1298L73.616 142.501L74.3941 142.001L75.1723 141.5L45.9656 96.128L45.1875 96.6289Z" fill="#0ABAB5" />
                </g>
                {/* Outer right bracket */}
                <g id="temporal-outer-right">
                  <path d="M117.01 57.586C116.687 57.1904 116.745 56.6074 117.141 56.2838C117.536 55.9601 118.119 56.0184 118.443 56.414L117.727 57L117.01 57.586ZM117.727 57L118.443 56.414L151.757 97.1314L151.041 97.7174L150.325 98.3034L117.01 57.586L117.727 57Z" fill="#0ABAB5" />
                  <path d="M122.54 142.501C122.264 142.931 121.691 143.055 121.261 142.779C120.831 142.502 120.707 141.929 120.984 141.5L121.762 142.001L122.54 142.501ZM150.969 96.6289L151.747 97.1298L122.54 142.501L121.762 142.001L120.984 141.5L150.191 96.128L150.969 96.6289Z" fill="#0ABAB5" />
                </g>
              </svg>
              {/* Labels */}
              <div className="flex flex-col items-center gap-1">
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.25em', color: '#0ABAB5', fontSize: '13px', fontWeight: 400 }}>
                  {retryAttempt > 0 ? `RETRY ${retryAttempt}/3` : resolution.toUpperCase()}
                </p>
                <p id="temporal-loading-text" style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.35em', color: '#0ABAB5', fontSize: '11px', fontWeight: 400 }}>
                  LOADING DATA
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function hexToRgbArray(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

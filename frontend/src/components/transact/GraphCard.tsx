'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGraphStore } from '@/store/graphStore';
import { useBookStore } from '@/store/bookStore';
import { ComposedChart, Line, Bar, Scatter, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, Legend, ReferenceArea, Label, LabelProps, Tooltip, TooltipProps } from 'recharts';
import { useTradeStore } from '@/store/tradeStore';
import { Skeleton } from '../ui/skeleton';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { NameType } from 'recharts/types/component/DefaultTooltipContent';

import {
  TooltipProvider as UiTooltipProvider,
  Tooltip as UiTooltip,
  TooltipTrigger as UiTooltipTrigger,
  TooltipContent as UiTooltipContent,
} from "@/components/ui/tooltip";

import { ibmPlexMono } from "@/lib/font";
import { SELL_BG, SELL_ACCENT, BUY_BG, BUY_ACCENT } from "@/lib/utils";
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface AxisViewBox {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// Book bid/ask depth, dollar strip: the transact panel's side grammar (sell maroon /
// buy navy, owner correction 2026-07-25) — green/red stay reserved for call/put.
const BID_FILL = SELL_ACCENT;
const ASK_FILL = BUY_ACCENT;

// Book price markers on the price chart: same hue as each wing's solid curve, muted by
// size/fill rather than opacity so the solid Call/Put lines stay visually dominant.
const CALL_MARKER = "#54D200";
const PUT_MARKER = "#DC5D5B";

// Both ComposedCharts (price chart + $-depth strip) must render with byte-identical
// margin and Y-axis width, or the strip's bars drift out of alignment under the curve
// above — see the width note on each YAxis below.
const CHART_MARGIN = { bottom: 10 };
const Y_AXIS_WIDTH = 60;

/** Best price at a strike/side = tightest quote (highest bid, lowest ask). Rung `price`
 *  is already in the curve's O/P units, so it plots on the main Y axis with no scaling. */
function bestPrice(rungs: { price: number; bidQty: number; askQty: number }[], side: 'bid' | 'ask'): number | undefined {
  const prices = rungs.filter((r) => (side === 'bid' ? r.bidQty : r.askQty) > 0).map((r) => r.price);
  if (!prices.length) return undefined;
  return side === 'bid' ? Math.max(...prices) : Math.min(...prices);
}

/** Tooltip-only feed series (bid/ask/depth) render nothing — the book's full ladder is
 *  drawn as intensity bands (below), not discrete marks. Cast needed because recharts
 *  types `shape` as `(props: unknown) => Element` (non-null) even though it accepts and
 *  renders `null` fine at runtime for an omitted point. */
const invisibleShape = (() => null) as unknown as (props: unknown) => React.ReactElement;

type RungLike = { price: number; bidQty: number; askQty: number };
type PriceBand = { lo: number; hi: number; qty: number };

/** Buckets one side of a strike's ladder into ≤4 equal-COUNT price bands (rungs aren't
 *  evenly spaced, so equal-price-width buckets would starve thin ones). Each bucket
 *  becomes one translucent segment of the Bookmap-style depth texture (owner correction,
 *  2026-07-25): the book is a 3D object (strike × price × qty); this is its z-axis,
 *  the $-depth strip below is its top-down projection. */
function bucketRungs(rungs: RungLike[], side: 'bid' | 'ask'): PriceBand[] {
  const active = rungs
    .filter((r) => (side === 'bid' ? r.bidQty : r.askQty) > 0)
    .sort((a, b) => a.price - b.price);
  if (!active.length) return [];
  const size = Math.ceil(active.length / Math.min(4, active.length));
  const bands: PriceBand[] = [];
  for (let i = 0; i < active.length; i += size) {
    const chunk = active.slice(i, i + size);
    bands.push({
      lo: chunk[0].price,
      hi: chunk[chunk.length - 1].price,
      qty: chunk.reduce((t, r) => t + (side === 'bid' ? r.bidQty : r.askQty), 0),
    });
  }
  return bands;
}

const fmtUsdCompact = (v: number) => {
  const abs = Math.abs(v);
  return abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toFixed(0)}`;
};

// BTC depth is no longer flat by construction (owner note, 2026-07-25 — see
// frontend-builder memory's LADDER SEMANTICS CHANGED entry): Δq(K) ∝ P(K), so the raw
// coin quantity resting per strike carries real signal now, same as the $ notional.
const fmtBtcCompact = (v: number) => `₿${Math.abs(v).toFixed(Math.abs(v) >= 10 ? 1 : 3)}`;

export default function GraphCard() {
  const { graphData, loading, currentMarkPrice, bandValues, overlayCurve, overlayKind } = useGraphStore();
  const { sellMarket, buyMarket, activeTab } = useTradeStore();
  const bookSnapshot = useBookStore((s) => s.snapshot);
  const connectBookStream = useBookStore((s) => s.connectBookStream);
  const disconnectBookStream = useBookStore((s) => s.disconnectBookStream);
  const setSelectedStrike = useBookStore((s) => s.setSelectedStrike);

  const showBands = activeTab === 'trade-bands';

  // $-depth strip unit toggle — default $ (owner's earlier choice); BTC is the other
  // real unit computed off the same snapshot, not a derived/scaled view of it.
  const [depthUnit, setDepthUnit] = useState<'usd' | 'btc'>('usd');

  // The solid curve IS the aggregate book's curve, so it needs the book poll running
  // here too (GraphCardWrapperTab owns the other call site, for when the Book panel is
  // showing and this component is unmounted; connect is idempotent).
  useEffect(() => {
    connectBookStream();
    return () => disconnectBookStream();
  }, [connectBookStream, disconnectBookStream]);

  // Dotted overlay (v2 item 19): merge overlayCurve onto graphData by the shared
  // percent-offset `price` key so both series ride the same X domain/tooltip.
  const overlayByPrice = useMemo(() => {
    if (!overlayCurve) return null;
    const m = new Map<number, { call: number; put: number }>();
    overlayCurve.forEach((p) => m.set(p.price, { call: p.call, put: p.put }));
    return m;
  }, [overlayCurve]);

  // No phantom market curve: the solid lines are the book's, so they draw only while
  // the book actually holds depth. Empty / not-yet-loaded book ⇒ the LP's dotted
  // preview is the only curve on the plot. Same gate governs the book price markers
  // (below) and the $-depth strip.
  const bookHasDepth = !!bookSnapshot?.strikes.some((s) => s.rungs.length > 0);

  // Tooltip feed (owner correction, 2026-07-25 — the visible depth is now the intensity
  // bands below, not markers): top-of-book bid/ask + total $ depth per strike/wing,
  // merged onto the NEAREST curve-grid row by percent-offset-from-mark `price`, not a
  // separate array. Recharts' tooltip resolves each series' value by `data[activeIndex]`
  // against the axis' own index space (see frontend-builder memory — a series with its
  // own separate `data` prop breaks that lookup); merging onto the same rows
  // chartData/the curves already use is what keeps the tooltip and the Y domain (below)
  // correct for free.
  const chartData = useMemo(() => {
    if (!graphData) return graphData;
    const rows = graphData.map((d) => {
      const ov = overlayByPrice?.get(d.price);
      return ov ? { ...d, callPreview: ov.call, putPreview: ov.put } : { ...d };
    }) as Array<{
      price: number; equityWithoutInsurance: number; equityWithInsurance: number;
      callPreview?: number; putPreview?: number;
      bookCallBid?: number; bookCallAsk?: number; bookPutBid?: number; bookPutAsk?: number;
      bookCallBidDepthUsd?: number; bookCallAskDepthUsd?: number;
      bookPutBidDepthUsd?: number; bookPutAskDepthUsd?: number;
    }>;
    if (bookHasDepth && bookSnapshot && currentMarkPrice > 0) {
      bookSnapshot.strikes.forEach((s) => {
        const pct = ((s.strike - currentMarkPrice) / currentMarkPrice) * 100;
        const nearest = rows.reduce((best, d, i) =>
          Math.abs(d.price - pct) < Math.abs(rows[best].price - pct) ? i : best, 0);
        const bid = bestPrice(s.rungs, 'bid');
        const ask = bestPrice(s.rungs, 'ask');
        // Bid and ask depth are NOT summable: they are opposite trades and only one can
        // ever be hit, so a combined figure states a size no one can execute. Rolling up
        // over rungs (and over LPs within a rung) is legal — that is the walk; rolling up
        // over `side` is not. Kept as two measures, tooltip-side.
        const depth = (side: 'bid' | 'ask') =>
          s.rungs.reduce((t, r) => t + (side === 'bid' ? r.bidQty : r.askQty) * r.price * currentMarkPrice, 0);
        if (s.wing === 'call') {
          if (bid != null) rows[nearest].bookCallBid = bid;
          if (ask != null) rows[nearest].bookCallAsk = ask;
          rows[nearest].bookCallBidDepthUsd = depth('bid');
          rows[nearest].bookCallAskDepthUsd = depth('ask');
        } else if (s.wing === 'put') {
          if (bid != null) rows[nearest].bookPutBid = bid;
          if (ask != null) rows[nearest].bookPutAsk = ask;
          rows[nearest].bookPutBidDepthUsd = depth('bid');
          rows[nearest].bookPutAskDepthUsd = depth('ask');
        }
      });
    }
    return rows;
  }, [graphData, overlayByPrice, bookHasDepth, bookSnapshot, currentMarkPrice]);

  // Each tab owns one overlay kind (UX §B.1/B.2): earn shows its own prospective LP
  // curve, trade-bands the post-trade curve. Never show the other tab's leftovers.
  const showOverlay =
    overlayCurve != null &&
    overlayKind === (activeTab === 'earn' ? 'lp-preview' : 'trade-impact');
  // "Your Call (preview)" on earn — the curve is the viewer's own, not the market's.
  const overlayName = (wing: 'Call' | 'Put') =>
    overlayKind === 'lp-preview' ? `Your ${wing} (preview)` : `${wing} (after)`;

  // $-depth strip data: dollar notional per strike/side = Σ rungs qty*price*mark, AND
  // the raw BTC notional Σ qty — both off the same snapshot (§ item 4, 2026-07-25). BTC
  // depth used to be flat by construction under the old budget-partition ladder (a
  // stale rationale — see frontend-builder memory); the new arithmetic ladder makes
  // Δq(K) ∝ P(K), so BTC depth now varies genuinely too, same as $ depth always did.
  // bidDepth negative so bid/ask diverge from a zero baseline.
  const depthData = useMemo(() => {
    if (!bookHasDepth || !bookSnapshot?.strikes.length || currentMarkPrice <= 0) return [];
    return bookSnapshot.strikes.map((s) => {
      const active = (side: 'bid' | 'ask') =>
        s.rungs.filter((r) => (side === 'bid' ? r.bidQty : r.askQty) > 0);
      const usd = (side: 'bid' | 'ask') =>
        active(side).reduce((t, r) => t + (side === 'bid' ? r.bidQty : r.askQty) * r.price * currentMarkPrice, 0);
      const btc = (side: 'bid' | 'ask') =>
        active(side).reduce((t, r) => t + (side === 'bid' ? r.bidQty : r.askQty), 0);
      const bidUsd = usd('bid');
      const bidBtc = btc('bid');
      return {
        price: ((s.strike - currentMarkPrice) / currentMarkPrice) * 100,
        strike: s.strike,
        bidDepthUsd: bidUsd > 0 ? -bidUsd : 0,
        askDepthUsd: usd('ask'),
        bidDepthBtc: bidBtc > 0 ? -bidBtc : 0,
        askDepthBtc: btc('ask'),
      };
    });
  }, [bookHasDepth, bookSnapshot, currentMarkPrice]);

  // The chart-facing view picks one unit's pair of fields under the same bidDepth/
  // askDepth keys, so the render tree below never branches on depthUnit itself.
  const activeDepthData = useMemo(
    () =>
      depthData.map((d) => ({
        price: d.price,
        strike: d.strike,
        bidDepth: depthUnit === 'usd' ? d.bidDepthUsd : d.bidDepthBtc,
        askDepth: depthUnit === 'usd' ? d.askDepthUsd : d.askDepthBtc,
      })),
    [depthData, depthUnit]
  );

  // Headroom multiple of the largest bar — the strip owns its full plot height now (no
  // competing curves to stay muted against), unlike the old mid-chart bars that needed
  // a 10x-widened hidden axis just to stay a thin band.
  const maxDepth = Math.max(0.0001, ...activeDepthData.flatMap((d) => [-d.bidDepth, d.askDepth]));

  // Both charts must share one X domain/scale so the $-depth strip lines up under the
  // right part of the curve above — a literal ["dataMin","dataMax"] on each chart would
  // compute its own min/max independently and drift out of alignment.
  const xDomain = useMemo((): [number, number] => {
    if (!graphData?.length) return [-100, 100];
    const prices = graphData.map((d) => d.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [graphData]);

  // Price chart's Y domain must include every rung price the depth bands (below) can
  // draw at — not just the curves and top-of-book — or a band near the domain edge
  // would render clipped/discarded. Computed as a hook (not a plain const after the
  // loading guard) so bookBands below, which also needs it, can be too.
  const yDomain = useMemo((): [number, number] => {
    if (!graphData) return [0, 1];
    const overlayY = showOverlay && overlayCurve ? overlayCurve.flatMap((p) => [p.call, p.put]) : [];
    const bookY = bookHasDepth ? (bookSnapshot?.strikes.flatMap((s) => s.rungs.map((r) => r.price)) ?? []) : [];
    const allY = [...graphData.flatMap((d) => [d.equityWithInsurance, d.equityWithoutInsurance]), ...overlayY, ...bookY];
    return [Math.min(...allY), Math.max(...allY)];
  }, [graphData, showOverlay, overlayCurve, bookHasDepth, bookSnapshot]);

  // Band half-width in X (percent-offset) units: half the smallest gap between distinct
  // book strikes, clamped, so neighboring strikes' texture doesn't merge into one block.
  const bandHalfWidth = useMemo(() => {
    if (!bookSnapshot?.strikes.length || currentMarkPrice <= 0) return 1;
    const xs = Array.from(
      new Set(bookSnapshot.strikes.map((s) => ((s.strike - currentMarkPrice) / currentMarkPrice) * 100))
    ).sort((a, b) => a - b);
    if (xs.length < 2) return 1.5;
    let minGap = Infinity;
    for (let i = 1; i < xs.length; i++) minGap = Math.min(minGap, xs[i] - xs[i - 1]);
    return Math.min(2, Math.max(0.25, minGap * 0.35));
  }, [bookSnapshot, currentMarkPrice]);

  // The book's full ladder as depth texture (owner correction, 2026-07-25): per strike,
  // per side, ≤4 price bands (bucketRungs) drawn as translucent ReferenceAreas — asks
  // above fair value, bids below, opacity ∝ bucket quantity (normalized against the
  // whole visible book so relative thickness is comparable strike-to-strike). Reuses
  // ReferenceArea (not Bar/Scatter) — already proven in this file for the SELL/BUY bands
  // below, and it needs no per-series `data`/index alignment at all since it's a pure
  // geometric decoration, not a tooltip-bearing graphical item.
  const bookBands = useMemo(() => {
    if (!bookHasDepth || !bookSnapshot?.strikes.length || currentMarkPrice <= 0) return [];
    const raw: { pct: number; color: string; lo: number; hi: number; qty: number }[] = [];
    bookSnapshot.strikes.forEach((s) => {
      if (s.wing !== 'call' && s.wing !== 'put') return;
      const pct = ((s.strike - currentMarkPrice) / currentMarkPrice) * 100;
      const color = s.wing === 'call' ? CALL_MARKER : PUT_MARKER;
      (['bid', 'ask'] as const).forEach((side) => {
        bucketRungs(s.rungs, side).forEach((b) => raw.push({ pct, color, lo: b.lo, hi: b.hi, qty: b.qty }));
      });
    });
    if (!raw.length) return [];
    const maxQty = Math.max(...raw.map((r) => r.qty), 1e-9);
    const [dyMin, dyMax] = yDomain;
    const minHalfHeight = Math.max((dyMax - dyMin) * 0.006, 1e-6);
    return raw.map((r, i) => {
      const mid = (r.lo + r.hi) / 2;
      const half = Math.max((r.hi - r.lo) / 2, minHalfHeight);
      return {
        key: `band-${i}`,
        x1: r.pct - bandHalfWidth,
        x2: r.pct + bandHalfWidth,
        y1: mid - half,
        y2: mid + half,
        opacity: 0.12 + 0.55 * (r.qty / maxQty),
        color: r.color,
      };
    });
  }, [bookHasDepth, bookSnapshot, currentMarkPrice, bandHalfWidth, yDomain]);

  // WebSocket connection is managed by PlaceOrderCard.

  if (loading || !graphData) {
    return (
      <Skeleton className=" h-full w-full bg-gray-800" />
    );
  }

  const [minY, maxY] = yDomain;

  const parseNum = (v: string | undefined) => {
    const n = parseFloat(v ?? '');
    return isNaN(n) || n <= 0 ? undefined : n;
  };

  // parse user inputs (absolute prices)
  const absSellFrom = parseNum(bandValues.finalSellFrom?.toFixed(2));
  const absSellToRaw = parseNum(bandValues.finalSellTo?.toFixed(2));
  const absBuyFrom = parseNum(bandValues.finalBuyFrom?.toFixed(2));
  const absBuyToRaw = parseNum(bandValues.finalBuyTo?.toFixed(2));

  // helper: absolute → percent offset
  const toPct = (price: number) =>
    ((price - currentMarkPrice) / currentMarkPrice) * 100;

  // compute percent values, with ±100% fallback when “to” is blank
  const sellFromPct = absSellFrom != null ? toPct(absSellFrom) : undefined;
  const sellToPct = absSellToRaw != null ? toPct(absSellToRaw) : 100;
  const buyFromPct = absBuyFrom != null ? toPct(absBuyFrom) : undefined;
  const buyToPct = absBuyToRaw != null ? toPct(absBuyToRaw) : -100;

  const isSellShort = sellMarket?.toLowerCase().includes("short");
  const isBuyShort = buyMarket?.toLowerCase().includes("short");

  // account for “short” flipping
  const finalSellFrom = isSellShort ? -Math.abs(sellFromPct!) : sellFromPct!;
  const finalSellTo = isSellShort ? -Math.abs(sellToPct) : sellToPct;
  // account for “short” flipping, but otherwise force positive
  const finalBuyFrom =
    buyFromPct != null
      ? isBuyShort
        ? -Math.abs(buyFromPct)
        : Math.abs(buyFromPct)
      : undefined;

  const finalBuyTo =
    buyToPct != null
      ? isBuyShort
        ? -Math.abs(buyToPct)
        : Math.abs(buyToPct)
      : undefined;

  // const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (!active || !payload || !payload.length) return null;

    // Series with no value at this row (book bid/ask only merged onto each strike's
    // nearest grid point) must be filtered — Recharts contributes one payload entry per
    // mounted series regardless of value, and .toFixed would throw on undefined.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = payload.filter((entry: any) => typeof entry.value === 'number' && !Number.isNaN(entry.value));
    if (!rows.length) return null;

    return (
      <div
        className="p-2 rounded-md bg-black/80 border border-white/20 shadow-md space-y-2"
      >
        {/* Show price at the top */}
        {/* <p className="text-white font-semibold text-xs">Price: {label}</p> */}

        {/* Show both data series */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {rows.map((entry: any, index: number) => (
          <p key={index} className="text-white text-xs">
            <span
              className="inline-block w-2 h-2 mr-2 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}: {typeof entry.name === 'string' && entry.name.includes('Depth')
              ? fmtUsdCompact(entry.value)
              : entry.value.toFixed(3)}
          </p>
        ))}
      </div>
    );
  };

  const pctToAbs = (pct: number) =>
    (currentMarkPrice * (1 + pct / 100)).toFixed(0);

  const PutLabel: React.FC<LabelProps> = ({ viewBox }) => {
    if (!viewBox) return null;

    const { x = 0, y = 0, width = 0 } = viewBox as AxisViewBox;

    return (
      <text
        x={x + width / 4}
        y={y + 35}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize={15}
        fontWeight="semibold"
      >
        {" ← Put"}
      </text>
    );
  };

  const CallLabel: React.FC<LabelProps> = ({ viewBox }) => {
    if (!viewBox) return null;

    const { x = 0, y = 0, width = 0 } = viewBox as AxisViewBox;

    return (
      <text
        x={x + (3 * width) / 4}
        y={y + 35}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize={15}
        fontWeight="semibold"
      >
        {"Call →"}
      </text>
    );
  };

  const YAxisLabel: React.FC<LabelProps> = ({ viewBox }) => {
    if (!viewBox) return null;

    // narrow the loose Recharts type
    const { x = 0, y = 0, height = 0 } = viewBox as AxisViewBox;

    const midY = y + height / 2;

    // put the text *inside* the plot area
    const labelX = x + 12;

    // how far to move the icon away from the text (in rotated coords)
    const GAP = 60;            // tweak if you need more/less spacing
    const iconSize = 28;

    return (
      <g transform={`rotate(-90, ${labelX}, ${midY})`}>
        {/* vertical label text */}
        <text
          x={labelX}
          y={midY}
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize={15}
          fontWeight="semibold"
        >
          Option Price
        </text>

        {/* tooltip icon, positioned GAP px “after” the text */}
        <foreignObject
          x={labelX + GAP}
          y={midY - iconSize / 2}
          width={iconSize}
          height={iconSize}
        >
          <UiTooltipProvider>
            <UiTooltip>
              <UiTooltipTrigger asChild>
                <InformationCircleIcon className="h-5 w-5 text-white cursor-help" />
              </UiTooltipTrigger>

              <UiTooltipContent
                side="right"
                align="center"
                className={`max-w-xs ${ibmPlexMono.className}`}
              >
                <p className="text-left leading-tight">
                  <strong>Price Axis:</strong><br />
                  represents value of <em>O / P</em>, where:<br />
                  O = value of a ‘Temporal‑style perpetual option’ at given strike<br />
                  P = value of a ‘Temporal‑style perpetual option’ whose strike = current perp mark price<br />
                  and&nbsp;P&nbsp;=&nbsp;P<sub>Call</sub>&nbsp;=&nbsp;P<sub>Put</sub>&nbsp;=&nbsp;1
                </p>
              </UiTooltipContent>

            </UiTooltip>
          </UiTooltipProvider>
        </foreignObject>
      </g>
    );
  };


  return (

    <div className="flex flex-col h-full w-full min-h-[300px] p-2 gap-1 bg-[#0E1B1E]">
      {/* Price chart — Call/Put fair curves plus the book's best bid/ask markers
          bracketing them. ~82% of the lane; the $-depth strip below takes the rest. */}
      <div className="flex-[5] min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart width={500} height={300} data={chartData ?? graphData} margin={CHART_MARGIN}>
            <CartesianGrid stroke="#333" />

            <YAxis
              width={Y_AXIS_WIDTH}
              tickCount={11}
              domain={[minY, maxY]}
              // Required or Recharts silently WIDENS this explicit domain to fit every
              // dataKey bound to this axis — including the invisible bookCallDepthUsd/
              // bookPutDepthUsd tooltip-feed Scatters below, whose values are dollars
              // (tens of thousands), not O/P units. Without this the axis blew out to
              // ~150k and the real curves rendered as a flat line at the bottom.
              allowDataOverflow
              padding={{ top: 10 }}
              style={{
                fontSize: '0.8rem',
                fill: 'white'
            }}
            >
              <Label content={<YAxisLabel />} />
            </YAxis>

            <XAxis
              type="number"
              dataKey="price"
              domain={xDomain}
              tickCount={21}
              tickFormatter={pctToAbs}
              label={{ value: "Strike Price", fill:"#FFFFFF", position: "insideBottom", offset: -5 }}
              style={{
                fontSize: '0.8rem',
                fill: 'white'
            }}
            >
              <Label content={<PutLabel />} />
              <Label content={<CallLabel />} />
            </XAxis>

            <ReferenceLine
              x={0}
              stroke="#FFFFFF"
              strokeWidth={2}
              label={{
                value: `Current Mark Price: ${currentMarkPrice}`,
                position: "insideTopRight",
                fill: "#FFFFFF",
                fontSize: 12,
              }}
            />

            {/* <ReferenceLine
              y={liquidationThreshold}
              stroke="#ff0000"
              strokeDasharray="3 3"
              label={{
                value: "Liquidation Margin Threshold",
                position: "insideTopLeft",
                fill: "#FFFFFF",
                fontSize: 12,
              }}
            /> */}

            {/* Book depth as texture (item 1, owner correction 2026-07-25): the book's
                full ladder — not just top-of-book — rendered as translucent price bands
                per strike, ask above fair value / bid below, opacity ∝ bucket quantity.
                Drawn BEFORE the solid curves so it paints behind them (muted texture,
                not competing marks); a flat array of ReferenceAreas is safe to emit as
                a direct child (arrays flatten under React.Children, unlike Fragments —
                see frontend-builder memory). */}
            {bookBands.map((b) => (
              <ReferenceArea
                key={b.key}
                x1={b.x1}
                x2={b.x2}
                y1={b.y1}
                y2={b.y2}
                fill={b.color}
                fillOpacity={b.opacity}
                stroke="none"
                ifOverflow="hidden"
              />
            ))}

            {/* The spreadsheet chart: solid green CALL and solid red PUT lines,
                crossing at the mark (Annex B rows 79-80). Heavier than the dotted
                overlay — this is the live market, the overlay is a proposal. */}
            {bookHasDepth && (
              <Line
                type="monotone"
                name="Call"
                dataKey="equityWithoutInsurance"
                stroke="#54D200"
                strokeWidth={4}
                dot={false}
              />
            )}
            {bookHasDepth && (
              <Line
                type="monotone"
                name="Put"
                dataKey="equityWithInsurance"
                stroke="#DC5D5B"
                strokeWidth={4}
                dot={false}
              />
            )}

            {/* Tooltip-only feed (item 1): top-of-book bid/ask + total $ depth per
                strike/wing, merged onto chartData above. Renders nothing (invisibleShape)
                — the visual depth signal is the band texture above — but still
                contributes named payload entries so hovering a strike shows its
                bid/ask/depth (CustomTooltip filters undefined values). Each Scatter is a
                direct chart child (never Fragment-wrapped: see frontend-builder memory
                on Recharts silently dropping those). */}
            {bookHasDepth && (
              <Scatter dataKey="bookCallBid" name="Call Bid" shape={invisibleShape} legendType="none" isAnimationActive={false} />
            )}
            {bookHasDepth && (
              <Scatter dataKey="bookCallAsk" name="Call Ask" shape={invisibleShape} legendType="none" isAnimationActive={false} />
            )}
            {bookHasDepth && (
              <Scatter dataKey="bookPutBid" name="Put Bid" shape={invisibleShape} legendType="none" isAnimationActive={false} />
            )}
            {bookHasDepth && (
              <Scatter dataKey="bookPutAsk" name="Put Ask" shape={invisibleShape} legendType="none" isAnimationActive={false} />
            )}
            {bookHasDepth && (
              <Scatter dataKey="bookCallBidDepthUsd" name="Call Bid Depth" shape={invisibleShape} legendType="none" isAnimationActive={false} />
            )}
            {bookHasDepth && (
              <Scatter dataKey="bookPutBidDepthUsd" name="Put Bid Depth" shape={invisibleShape} legendType="none" isAnimationActive={false} />
            )}
            {bookHasDepth && (
              <Scatter dataKey="bookCallAskDepthUsd" name="Call Ask Depth" shape={invisibleShape} legendType="none" isAnimationActive={false} />
            )}
            {bookHasDepth && (
              <Scatter dataKey="bookPutAskDepthUsd" name="Put Ask Depth" shape={invisibleShape} legendType="none" isAnimationActive={false} />
            )}

            {/* Dotted overlay (v2 item 19, UX A.5): LP-preview or trade-impact curve,
                same hue as its solid counterpart, fine-dotted at reduced opacity.
                Each Line must be a DIRECT chart child — Recharts collects graphical
                items with React.Children, which flattens arrays but never descends
                into a Fragment, so a <>…</> wrapper silently drops both series. */}
            {showOverlay && (
              <Line
                type="monotone"
                name={overlayName('Call')}
                dataKey="callPreview"
                stroke="#54D200"
                strokeDasharray="2 3"
                strokeOpacity={0.55}
                strokeWidth={2}
                dot={false}
              />
            )}
            {showOverlay && (
              <Line
                type="monotone"
                name={overlayName('Put')}
                dataKey="putPreview"
                stroke="#DC5D5B"
                strokeDasharray="2 3"
                strokeOpacity={0.55}
                strokeWidth={2}
                dot={false}
              />
            )}

            {showBands && finalSellFrom != null && (
              <ReferenceArea
                x1={Math.min(finalSellFrom, finalSellTo)}
                x2={Math.max(finalSellFrom, finalSellTo)}
                y1={0}
                y2={1}
                fill={`${SELL_BG}B3`}
                label={{
                  value: "SELL",
                  position: "insideTopRight",
                  style: { fill: SELL_ACCENT, fontWeight: "bold" },
                }}
              />
            )}

            {showBands && finalBuyFrom != null && (
              <ReferenceArea
                x1={Math.min(finalBuyFrom, finalBuyTo!)}
                x2={Math.max(finalBuyFrom, finalBuyTo!)}
                y1={0}
                y2={1}
                fill={`${BUY_BG}B3`}
                label={{
                  value: "BUY",
                  position: "insideTopRight",
                  style: { fill: BUY_ACCENT, fontWeight: "bold" },
                }}
              />
            )}



            <Legend align='right' verticalAlign="top" height={36} />

            <Tooltip content={<CustomTooltip />} />
            {/* <Tooltip></Tooltip> */}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* $/₿-depth strip (item 2, unit toggle item 4): notional bid/ask per strike, own
          lane below the price chart (~18% of the height) sharing the same X domain/
          margin/Y-axis width so it stays pixel-aligned under the curve above. Diverging
          bars: bid negative (green), ask positive (red) — the depth bars' original
          grammar. Unit toggle switches which of the same snapshot's two computed fields
          (depthData's *Usd/*Btc pairs) feed the chart; default $ (owner's earlier choice). */}
      <div className="flex-[1] min-h-0 relative">
        {bookHasDepth && activeDepthData.length > 0 && (
          <div className="absolute top-0 right-1 z-10 flex border border-gray-600 bg-[#1a1a1a]">
            {(['usd', 'btc'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setDepthUnit(u)}
                aria-pressed={depthUnit === u}
                title={u === 'usd' ? 'Depth in dollars' : 'Depth in BTC'}
                className={`px-1.5 py-0.5 text-2xs leading-none ${ibmPlexMono.className} ${
                  u === 'btc' ? 'border-l border-gray-600' : ''
                } ${depthUnit === u ? 'bg-[#0ABAB5]/20 text-[#0ABAB5]' : 'text-gray-400 hover:text-white'}`}
              >
                {u === 'usd' ? '$' : '₿'}
              </button>
            ))}
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={activeDepthData} margin={CHART_MARGIN}>
            <XAxis type="number" dataKey="price" domain={xDomain} hide />
            <YAxis
              width={Y_AXIS_WIDTH}
              domain={[-maxDepth * 1.15, maxDepth * 1.15]}
              tickFormatter={depthUnit === 'usd' ? fmtUsdCompact : fmtBtcCompact}
              tick={{ fontSize: 10, fill: '#8A8A8A' }}
              label={{ value: depthUnit === 'usd' ? '$ depth' : '₿ depth', angle: -90, position: 'insideLeft', fill: '#8A8A8A', fontSize: 10 }}
            />
            <ReferenceLine x={0} stroke="#FFFFFF" strokeOpacity={0.3} />
            <ReferenceLine y={0} stroke="#555555" />

            {bookHasDepth && activeDepthData.length > 0 && (
              <Bar
                dataKey="bidDepth"
                name="Bid depth"
                fill={BID_FILL}
                barSize={6}
                isAnimationActive={false}
                cursor="pointer"
                onClick={(d) => setSelectedStrike((d as { strike: number }).strike)}
              />
            )}
            {bookHasDepth && activeDepthData.length > 0 && (
              <Bar
                dataKey="askDepth"
                name="Ask depth"
                fill={ASK_FILL}
                barSize={6}
                isAnimationActive={false}
                cursor="pointer"
                onClick={(d) => setSelectedStrike((d as { strike: number }).strike)}
              />
            )}

            <Tooltip
              formatter={(value: number) =>
                depthUnit === 'usd'
                  ? `$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : `₿${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 4 })}`
              }
              labelFormatter={(pct: number) => `Strike ${pctToAbs(pct)}`}
              contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 12 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

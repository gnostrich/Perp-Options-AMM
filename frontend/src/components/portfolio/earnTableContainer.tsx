"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ArrowUpRight, ArrowDownRight, ChevronRight, AlertTriangle } from "lucide-react";

import type { ExposureTotals } from "@/lib/data/api/contracts";
import type { LpPosition } from "@/lib/data/api/lpCurve";
import { ibmPlexMono } from "@/lib/font";
import { halfSpreadBps } from "@/lib/utils";
import { shapeFromDials, effDelta, NEUTRAL_DIALS } from "@/lib/burr2/pricer";

interface Props {
  positions: LpPosition[] | null | undefined;
  byLp: Record<string, ExposureTotals>;
  totals: ExposureTotals | null | undefined;
  loading: boolean;
}

const ZERO_TOTALS: ExposureTotals = {
  netQty: 0,
  entryValueUsd: 0,
  markToBookUsd: 0,
  unrealizedPnlUsd: 0,
  realizedPnlUsd: 0,
  feesEarnedUsd: 0,
  hedgePnlUsd: 0,
  totalPnlUsd: 0,
};

function usd(value: number, signed = false): string {
  if (!Number.isFinite(value)) return "--";
  const sign = signed && value >= 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Warn idiom reused verbatim from TradeInsuranceComponent's depth-error rows
// (amber text + AlertTriangle), not invented here.
const WARN_COLOR = "#FFAE67";

/** Δ-weighted coin formatting for the EXPOSURE column: "₿-perp" (not bare "₿") states
 *  it is already Δ(k)-weighted, matching BookProjectionView.tsx's ₿-perp (Δ·q)
 *  convention — a bare "₿" reads as unweighted option size, the exact ambiguity the
 *  exposure law closes. Sign always explicit, adaptive decimals (ghostDp/
 *  fmtUsdAdaptive precedent) — 6dp once magnitude is sub-cent so a real small
 *  reading never rounds to 0.00. */
function coin(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const dp = abs > 0 && abs < 0.01 ? 6 : 2;
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${abs.toFixed(dp)} ₿-perp`;
}

/** Row-level warn state for the EXPOSURE column: only meaningful once a cap is set
 *  (the lean law's f≥1 terminal case is "at cap"); an unarmed LP (no cap) never warns. */
function exposureWarn(p: LpPosition): "warn" | "cap" | null {
  const ls = p.lpState;
  if (ls?.exposureCoin == null || ls?.exposureCapCoin == null || ls.exposureCapCoin <= 0) return null;
  const ratio = Math.abs(ls.exposureCoin) / ls.exposureCapCoin;
  return ratio >= 1 ? "cap" : ratio >= 0.8 ? "warn" : null;
}

function PnlCell({ value }: { value: number }) {
  const color = value >= 0 ? "#00FF9C" : "#FF6767";
  return (
    <div className="flex items-center justify-center gap-1">
      {value >= 0 ? (
        <ArrowUpRight className="h-4 w-4" style={{ color }} />
      ) : (
        <ArrowDownRight className="h-4 w-4" style={{ color }} />
      )}
      <span style={{ color }}>{usd(value, true)}</span>
    </div>
  );
}

/** Compact curve digest — the six Burr-2 params over the three operator dials. */
function CurveDigest({ position }: { position: LpPosition }) {
  const p = position.lpState?.params;
  const d = position.lpState?.dials;
  const touchBps = position.lpState?.touchHalfSpreadBps;
  // Effective δ (amm/lp/discretise.go effDelta, §2.3a) — a thin deployed curve
  // actually quotes at the min-rung-widened δ, not the bare budget. At
  // κ=0/NEUTRAL_DIALS since this reconstruction has no live inventory to lean
  // the curve with — it is the FALLBACK basis only (audit finding, task #34
  // item 3): the posted book quotes at the curve's own LEANED κ, so this
  // reconstruction reads 25 bps while a hard-leaned thin curve is actually
  // quoting up to 72.58 bps. `touchHalfSpreadBps` off the wire is the real
  // leaned-κ reading and wins whenever present; this stays only the fallback
  // for a pre-restart LP the engine doesn't hold yet.
  const effectiveDelta = React.useMemo(
    () => (p ? effDelta(shapeFromDials(NEUTRAL_DIALS, {
      Sbar: p.sBar, A: p.a, Gamma: p.gamma, Lambda: p.lambda, N: p.N,
    })) : 0),
    [p]
  );
  if (!p) {
    return <span className="text-[#677275]">no curve</span>;
  }
  // Audit LOW-2: both readings are effective-δ touch half-spreads — what
  // differs is the κ they're evaluated at, not "quoted vs effective". Name
  // that directly rather than implying two different kinds of number.
  const spreadReading =
    touchBps != null
      ? `touch ≈${touchBps.toFixed(0)} bps (quoted)`
      : `≈${halfSpreadBps(d?.spread ?? 0, effectiveDelta).toFixed(0)} bps (at rest, κ=0)`;
  return (
    <div className="flex flex-col gap-0.5 leading-tight">
      <span className="text-[#E4E4E4] whitespace-nowrap">
        S̄ {p.sBar} · a {p.a} · γ {p.gamma} · N {p.N}
      </span>
      <span className="text-2xs text-[#677275] whitespace-nowrap">
        λ {p.lambda} · φ {p.fee}
        {d
          ? ` · spread ${d.spread} (${spreadReading}) · skew ${d.skewLean} · peak ${d.peak}`
          : ""}
      </span>
    </div>
  );
}

const STATUS_PILL: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "#0ABAB5" },
  closed: { label: "Closed", color: "#808080" },
};

function StatusPill({ status }: { status: string }) {
  const pill = STATUS_PILL[status] ?? { label: status || "—", color: "#808080" };
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-2xs border ${ibmPlexMono.className}`}
      style={{ color: pill.color, borderColor: pill.color }}
    >
      {pill.label}
    </span>
  );
}

/** Summary strip cell. `pending` renders an honest dash instead of a zero the
 *  backend never wrote (hedge attribution has no writer yet). */
function SummaryStat({
  label,
  value,
  color,
  pending,
}: {
  label: string;
  value: string;
  color?: string;
  pending?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-3 py-2 flex-1 border-y border-r first:border-l first:rounded-l-sm last:rounded-r-sm border-[#004240] bg-[#112226]">
      <span className={`text-2xs tracking-widest uppercase text-[#C9C8C8] ${ibmPlexMono.className}`}>
        {label}
      </span>
      {pending ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`text-xs font-semibold text-[#677275] cursor-help ${ibmPlexMono.className}`}>
                n/a
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className={`max-w-xs ${ibmPlexMono.className}`}>
              <p>{pending}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span
          className={`text-xs font-semibold ${ibmPlexMono.className}`}
          style={{ color: color ?? "#FFFFFF" }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export default function EarnTableContainer({ positions, byLp, totals, loading }: Props) {
  const router = useRouter();
  const data = React.useMemo(() => positions ?? [], [positions]);

  const totalsOf = React.useCallback(
    (p: LpPosition) => (p.lpState?.lpId ? byLp[p.lpState.lpId] : undefined) ?? ZERO_TOTALS,
    [byLp]
  );

  /** Row click = Manage: transact page, earn tab, this curve loaded in the console. */
  const manage = React.useCallback(
    (p: LpPosition) => {
      const lpId = p.lpState?.lpId;
      router.push(lpId ? `/?tab=earn&lp=${encodeURIComponent(lpId)}` : "/?tab=earn");
    },
    [router]
  );

  const liquidityDeployed = React.useMemo(
    () => data.filter((p) => p.status === "active").reduce((s, p) => s + p.notionalUsd, 0),
    [data]
  );

  // Hedge attribution is read from lp_exposure.hedge_pnl_usd, which no backend
  // writer populates yet — render the slot, never a manufactured zero.
  const hedgeReported = !!totals && totals.hedgePnlUsd !== 0;

  const columns = React.useMemo<ColumnDef<LpPosition>[]>(
    () => [
      {
        id: "curve",
        header: () => <div className="text-left">CURVE</div>,
        cell: ({ row }) => <CurveDigest position={row.original} />,
      },
      {
        id: "margin",
        header: () => <div className="text-center">MARGIN</div>,
        cell: ({ row }) => (
          <div className="text-center">
            {usd(row.original.marginUsd)}
            <div className="text-2xs text-[#677275]">
              {row.original.leverage.toFixed(1)}x · {usd(row.original.notionalUsd)}
            </div>
          </div>
        ),
      },
      {
        id: "utilization",
        header: () => <div className="text-center">UTILIZATION</div>,
        cell: ({ row }) => {
          // utilizationBasis names the denominator ("cap" = exposure cap, "capacity" =
          // Nᵢ) — the two are not interchangeable (backend earn/models/earn_models.go),
          // so say which one rather than a bare percentage. "" / absent (an old cached
          // response, additive field) omits the suffix — never guessed.
          const basis = row.original.lpState?.utilizationBasis;
          const suffix = basis === "cap" ? " (of cap)" : basis === "capacity" ? " (of capacity)" : "";
          return (
            <div className="text-center">
              {((row.original.lpState?.utilizationPct ?? 0) * 100).toFixed(1)}%
              {suffix && <span className="text-2xs text-[#677275]">{suffix}</span>}
            </div>
          );
        },
      },
      {
        id: "exposure",
        header: () => <div className="text-center">Δ-EXPOSURE (₿-perp)</div>,
        cell: ({ row }) => {
          // Basis stated on the label (Δ-weighted, ₿-perp) per UX law; absent field
          // (old cached response) ⇒ "—", never guessed — the utilizationBasis precedent.
          const ls = row.original.lpState;
          const value = ls?.exposureCoin;
          if (value == null) {
            return <div className="text-center text-[#677275]">—</div>;
          }
          const cap = ls?.exposureCapCoin;
          const warn = exposureWarn(row.original);
          const pctOfCap = cap && cap > 0 ? (Math.abs(value) / cap) * 100 : null;
          // Floored, not rounded: a rounded 99.95% would read "100% of cap" while
          // quoting is NOT suspended (and 79.95% would read "80%" un-warned) — a
          // floored percentage can never claim a threshold it hasn't crossed yet.
          // 1dp matches the UTILIZATION column beside it.
          const pctDisplay = pctOfCap != null ? (Math.floor(pctOfCap * 10) / 10).toFixed(1) : null;
          return (
            <div className="text-center">
              <div style={warn ? { color: WARN_COLOR } : undefined}>{coin(value)}</div>
              {pctDisplay != null && (
                <div
                  className="text-2xs flex items-center justify-center gap-1"
                  style={{ color: warn ? WARN_COLOR : "#677275" }}
                >
                  {warn && <AlertTriangle className="h-3 w-3" />}
                  {warn === "cap" ? "at cap — quoting suspended" : `${pctDisplay}% of cap`}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "fees",
        header: () => <div className="text-center">FEES EARNED</div>,
        cell: ({ row }) => (
          <div className="text-center text-[#00FF9C]">{usd(totalsOf(row.original).feesEarnedUsd)}</div>
        ),
      },
      {
        id: "mtb",
        header: () => <div className="text-center">MARK-TO-BOOK</div>,
        cell: ({ row }) => (
          <div className="text-center">{usd(totalsOf(row.original).markToBookUsd)}</div>
        ),
      },
      {
        id: "hedge",
        header: () => <div className="text-center">HEDGE P/L</div>,
        cell: ({ row }) => {
          const v = totalsOf(row.original).hedgePnlUsd;
          return v === 0 ? (
            <div className="text-center text-[#677275]" title="No hedge fills attributed to this curve yet">
              n/a
            </div>
          ) : (
            <PnlCell value={v} />
          );
        },
      },
      {
        id: "pnl",
        header: () => <div className="text-center">P/L TOTAL</div>,
        cell: ({ row }) => <PnlCell value={totalsOf(row.original).totalPnlUsd} />,
      },
      {
        id: "status",
        header: () => <div className="text-center">STATUS</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <StatusPill status={row.original.status} />
            <ChevronRight className="h-4 w-4 text-[#677275] group-hover:text-[#0ABAB5]" />
          </div>
        ),
      },
    ],
    [totalsOf]
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  const colCount = table.getAllLeafColumns().length;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary strip — the whole wallet's LP money, above the per-position rows. */}
      <div className="flex items-stretch">
        <SummaryStat label="Liquidity Deployed" value={usd(liquidityDeployed)} />
        <SummaryStat
          label="Fees Earned"
          value={usd(totals?.feesEarnedUsd ?? 0)}
          color="#00FF9C"
        />
        <SummaryStat label="Inventory MTB" value={usd(totals?.markToBookUsd ?? 0)} />
        <SummaryStat
          label="Hedge P/L"
          value={usd(totals?.hedgePnlUsd ?? 0, true)}
          pending={
            hedgeReported
              ? undefined
              : "Hedge attribution is not reported by the backend yet — no value is being written for these positions."
          }
        />
        <SummaryStat
          label="P/L Total"
          value={usd(totals?.totalPnlUsd ?? 0, true)}
          color={(totals?.totalPnlUsd ?? 0) >= 0 ? "#00FF9C" : "#FF6767"}
        />
      </div>

      <div className="rounded-xl border-2 border-[#808080] bg-[#0E1B1E] flex-grow flex flex-col overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-[#112226] border-b-2 border-[#808080] hover:bg-[#112226]">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`text-[#C9C8C8] py-3 whitespace-nowrap tracking-wider font-semibold text-2xs ${ibmPlexMono.className}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`sk-${i}`} className="border-b border-[#808080]/20 last:border-0 group">
                    {Array.from({ length: colCount }).map((__, j) => (
                      <TableCell key={j} className="bg-[#0E1B1E]">
                        <Skeleton className="h-5 w-16 bg-gray-500 mx-auto" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  const warn = exposureWarn(row.original);
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => manage(row.original)}
                      title="Manage this curve in the Earn console"
                      className={`group cursor-pointer border-b border-[#808080]/20 last:border-0 ${
                        warn
                          ? "bg-[#FFAE67]/10 hover:bg-[#FFAE67]/15 border-l-2 border-l-[#FFAE67]"
                          : "bg-[#0E1B1E] hover:bg-gray-800"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={`text-sm ${ibmPlexMono.className} text-[#C9C8C8] py-2`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={colCount} className="h-20 bg-[#0E1B1E] text-[#C9C8C8] text-center">
                    No results.
                    <div className={`text-2xs text-[#677275] mt-1 ${ibmPlexMono.className}`}>
                      Deploy a curve in the Earn tab to start.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {!loading && totals && data.length > 0 && (
              <TableFooter className="bg-[#112226] border-t-2 border-[#808080]">
                <TableRow className="bg-[#112226] hover:bg-[#112226] border-0">
                  <TableCell
                    colSpan={4}
                    className={`text-2xs tracking-widest font-semibold text-white ${ibmPlexMono.className}`}
                  >
                    P/L TOTAL
                  </TableCell>
                  <TableCell className={`text-center text-[#00FF9C] ${ibmPlexMono.className}`}>
                    {usd(totals.feesEarnedUsd)}
                  </TableCell>
                  <TableCell className={`text-center text-white ${ibmPlexMono.className}`}>
                    {usd(totals.markToBookUsd)}
                  </TableCell>
                  {/* HEDGE P/L has no footer total (hedge attribution is unwritten, see the
                      summary strip's own "n/a" slot) — an explicit empty cell here, not a
                      skipped one, is what keeps PnlCell under P/L TOTAL and STATUS covered. */}
                  <TableCell />
                  <TableCell>
                    <PnlCell value={totals.totalPnlUsd} />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </div>

      <p className={`text-2xs text-[#677275] px-1 ${ibmPlexMono.className}`}>
        Select a position to manage its curve. Per-strike depth lives in the Earn tab&apos;s
        Order Book view.
      </p>
    </div>
  );
}

import { apiGet } from "@/lib/data/api/client";

/**
 * PNL History — shared TypeScript types and API calls
 * Used by the server action, pnlHistoryStore, and OverviewContent.
 */

/* ── REST response types ─────────────────────────────────────────────────── */

export interface PnlHistoryPoint {
  /** ISO-8601 / RFC-3339 timestamp string */
  t: string;
  pnl_dollar: number;
  pnl_btc: number;
}

export type PnlSection = "perps" | "earn" | "bands";

export interface PnlHistoryResponse {
  wallet: string;
  interval: "hour" | "day";
  series: Partial<Record<PnlSection, PnlHistoryPoint[]>>;
}

/* ── WebSocket live point ────────────────────────────────────────────────── */

export interface PnlLivePoint {
  /** ISO-8601 timestamp */
  t: string;
  perps_pnl_dollar: number;
  bands_pnl_dollar: number;
  earn_pnl_dollar: number;
}

/* ── Chart-ready row (consumed by Recharts) ──────────────────────────────── */

export interface PnlChartPoint {
  /** Formatted label rendered on the XAxis */
  date: string;
  /** Unix epoch ms — used for sorting and dedup */
  timestamp: number;

  // USD values
  total: number;   // computed: perps + bands + earn
  perps: number;
  bands: number;
  earn: number;

  // BTC values — stored for future USD/BTC toggle (toggle hidden for now)
  totalBtc: number;
  perpsBtc: number;
  bandsBtc: number;
  earnBtc: number;
}

/* ── API definitions ─────────────────────────────────────────────────────── */

export async function fetchPnlHistory(params: {
  wallet: string;
  section?: string;
  interval?: "hour" | "day";
  from?: string;
  to?: string;
  limit?: number;
}): Promise<PnlHistoryResponse> {
  const qs = new URLSearchParams();
  qs.set("wallet", params.wallet);
  if (params.section)  qs.set("section", params.section);
  if (params.interval) qs.set("interval", params.interval);
  if (params.from)     qs.set("from", params.from);
  if (params.to)       qs.set("to", params.to);
  if (params.limit != null) qs.set("limit", String(params.limit));

  return apiGet<PnlHistoryResponse>(`/api/pnl/history?${qs.toString()}`);
}

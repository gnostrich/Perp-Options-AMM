import { create } from "zustand";
import { fetchPnlHistoryAction } from "@/app/actions/fetchPnlHistoryAction";
import type {
  PnlChartPoint,
  PnlHistoryResponse,
  PnlLivePoint,
  PnlSection,
} from "@/lib/data/api/pnlHistory";

/* ── label formatters ──────────────────────────────────────────────────── */

function fmtHourLabel(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fmtDayLabel(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
  });
}

/* ── transform helper ──────────────────────────────────────────────────── */

function responseToPnlChartPoints(
  response: PnlHistoryResponse
): PnlChartPoint[] {
  const { series, interval } = response;
  const fmtLabel = interval === "hour" ? fmtHourLabel : fmtDayLabel;

  // Collect every unique timestamp string across all sections
  const sections: PnlSection[] = ["perps", "earn", "bands"];
  const tsSet = new Set<string>();
  for (const sec of sections) {
    series[sec]?.forEach((p) => tsSet.add(p.t));
  }

  if (tsSet.size === 0) return [];

  // Build quick-lookup maps: section → timestamp → point
  const lookup: Record<PnlSection, Map<string, { dollar: number; btc: number }>> = {
    perps: new Map(),
    earn: new Map(),
    bands: new Map(),
  };
  for (const sec of sections) {
    series[sec]?.forEach((p) =>
      lookup[sec].set(p.t, { dollar: p.pnl_dollar, btc: p.pnl_btc })
    );
  }

  // Merge into chart rows and sort ascending
  const rows: PnlChartPoint[] = Array.from(tsSet)
    .sort() // ISO strings sort lexicographically
    .map((t) => {
      const perps  = Number((lookup.perps.get(t)?.dollar  ?? 0).toFixed(4));
      const bands  = Number((lookup.bands.get(t)?.dollar  ?? 0).toFixed(4));
      const earn   = Number((lookup.earn.get(t)?.dollar   ?? 0).toFixed(4));
      const perpsBtc = Number((lookup.perps.get(t)?.btc ?? 0).toFixed(4));
      const bandsBtc = Number((lookup.bands.get(t)?.btc ?? 0).toFixed(4));
      const earnBtc  = Number((lookup.earn.get(t)?.btc  ?? 0).toFixed(4));

      return {
        date: fmtLabel(t),
        timestamp: new Date(t).getTime(),
        total: Number((perps + bands + earn).toFixed(4)),
        perps,
        bands,
        earn,
        totalBtc: Number((perpsBtc + bandsBtc + earnBtc).toFixed(4)),
        perpsBtc,
        bandsBtc,
        earnBtc,
      };
    });

  return rows;
}

/* ── Store type ────────────────────────────────────────────────────────── */

type ActiveInterval = "hour" | "day";

interface PnlHistoryState {
  activeInterval: ActiveInterval;
  hourData: PnlChartPoint[];
  dayData: PnlChartPoint[];
  loading: boolean;
  error: string | null;

  fetchHistory: (wallet: string, interval: ActiveInterval) => Promise<void>;
  appendLivePoint: (point: PnlLivePoint) => void;
  setActiveInterval: (interval: ActiveInterval) => void;
  clearHistory: () => void;
}

const LIMITS: Record<ActiveInterval, number> = {
  hour: 60,
  day: 24,
};

/* ── Store ─────────────────────────────────────────────────────────────── */

export const usePnlHistoryStore = create<PnlHistoryState>()((set, get) => ({
  activeInterval: "hour",
  hourData: [],
  dayData: [],
  loading: false,
  error: null,

  /* ── fetchHistory ──────────────────────────────────────────────────── */
  fetchHistory: async (wallet, interval) => {
    if (!wallet) return;

    set({ loading: true, error: null, activeInterval: interval });

    try {
      const response = await fetchPnlHistoryAction({
        wallet,
        interval,
        section: "all",
        limit: LIMITS[interval],
      });

      const points = responseToPnlChartPoints(response);

      if (interval === "hour") {
        set({ hourData: points, loading: false });
      } else {
        set({ dayData: points, loading: false });
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load PNL history";
      set({ loading: false, error: msg });
    }
  },

  /* ── appendLivePoint ───────────────────────────────────────────────── */
  appendLivePoint: (livePoint) => {
    const timestamp = new Date(livePoint.t).getTime();
    if (!Number.isFinite(timestamp)) return;

    const perps = Number((livePoint.perps_pnl_dollar ?? 0).toFixed(4));
    const bands = Number((livePoint.bands_pnl_dollar ?? 0).toFixed(4));
    const earn  = Number((livePoint.earn_pnl_dollar ?? 0).toFixed(4));

    const newPoint: PnlChartPoint = {
      date: fmtHourLabel(livePoint.t),
      timestamp,
      total: Number((perps + bands + earn).toFixed(4)),
      perps,
      bands,
      earn,
      // BTC not provided in live point — keep 0 until we have the value
      totalBtc: 0,
      perpsBtc: 0,
      bandsBtc: 0,
      earnBtc: 0,
    };

    const { activeInterval, hourData, dayData } = get();

    const updateData = (current: PnlChartPoint[]): PnlChartPoint[] => {
      // Replace last point if same timestamp, otherwise append
      if (current.length > 0 && current[current.length - 1].timestamp === timestamp) {
        return [...current.slice(0, -1), newPoint];
      }
      return [...current, newPoint];
    };

    if (activeInterval === "hour") {
      set({ hourData: updateData(hourData) });
    } else {
      set({ dayData: updateData(dayData) });
    }
  },

  /* ── setActiveInterval ─────────────────────────────────────────────── */
  setActiveInterval: (interval) => {
    set({ activeInterval: interval });
  },

  /* ── clearHistory ──────────────────────────────────────────────────── */
  clearHistory: () => {
    set({
      hourData: [],
      dayData: [],
      loading: false,
      error: null,
      activeInterval: "hour",
    });
  },
}));

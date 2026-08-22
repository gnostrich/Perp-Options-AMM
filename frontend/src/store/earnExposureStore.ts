import { create } from "zustand";
import type { ExposureTotals } from "@/lib/data/api/contracts";
import type { LpPosition } from "@/lib/data/api/lpCurve";
import { fetchEarnExposureAction } from "@/app/actions/fetchEarnExposureAction";
import { fetchLpPositionsAction } from "@/app/actions/fetchLpPositionsAction";

/**
 * The portfolio Earn view is the LP money view: one row per LP position
 * (/earn/positions) carrying that position's own P/L (/earn/exposure?lpId=),
 * over wallet-wide totals for the summary strip. Per-strike rows are gone from
 * the portfolio entirely — they live behind the deep-link, in the Book ladder.
 */
type EarnExposureStore = {
  /** Wallet-wide totals drive the summary strip and the overview card's EARN PNL. */
  totals: ExposureTotals | null;
  positions: LpPosition[];
  /** lpId → that position's exposure totals. */
  byLp: Record<string, ExposureTotals>;
  loading: boolean;
  error: string | null;
  fetchExposure: (wallet: string) => Promise<void>;
  clear: () => void;
};

const EMPTY = { totals: null, positions: [], byLp: {} };

export const useEarnExposureStore = create<EarnExposureStore>()((set) => ({
  ...EMPTY,
  loading: false,
  error: null,

  fetchExposure: async (wallet) => {
    if (!wallet) {
      set(EMPTY);
      return;
    }
    set({ loading: true, error: null });

    const [res, positions] = await Promise.all([
      fetchEarnExposureAction(wallet),
      fetchLpPositionsAction(wallet),
    ]);
    if (!res) {
      set({ ...EMPTY, loading: false, error: "Failed to load exposure" });
      return;
    }

    const lpIds = positions.map((p) => p.lpState?.lpId).filter((id): id is string => !!id);
    const perLp = await Promise.all(lpIds.map((id) => fetchEarnExposureAction(wallet, id)));
    const byLp: Record<string, ExposureTotals> = {};
    lpIds.forEach((id, i) => {
      const totals = perLp[i]?.totals;
      if (totals) byLp[id] = totals;
    });

    set({ loading: false, totals: res.totals, positions, byLp });
  },

  clear: () => set({ ...EMPTY, loading: false, error: null }),
}));

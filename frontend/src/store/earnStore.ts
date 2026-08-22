import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { fetchPoolStateAction } from "@/app/actions/fetchPoolStateAction";
import type { PoolStateData } from "@/lib/data/api/portfolio";

interface EarnState {
  poolState: PoolStateData | null;
  isPoolStateLoading: boolean;
  poolStateError: string | null;

  /* ─── Actions ─────────────────────────────────────── */
  fetchPoolState: () => Promise<void>;
}

export const useEarnStore = create<EarnState>()(
  devtools(
    subscribeWithSelector((set) => ({
      /* ─── Initial state ──────────────────────────────── */
      poolState: null,
      isPoolStateLoading: false,
      poolStateError: null,

      /* ─── Fetch pool-state via server action ─────────── */
      fetchPoolState: async () => {
        set({ isPoolStateLoading: true, poolStateError: null });
        try {
          const response = await fetchPoolStateAction();
          if (response.success && response.data) {
            set({ poolState: response.data });
          } else {
            set({ poolStateError: response.error ?? "Failed to fetch pool state" });
          }
        } catch (err) {
          console.error("earnStore: fetchPoolState error", err);
          set({ poolStateError: "Failed to fetch pool state" });
        } finally {
          set({ isPoolStateLoading: false });
        }
      },
    }))
  )
);

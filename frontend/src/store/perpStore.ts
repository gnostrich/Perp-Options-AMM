/* tradeStore.ts -------------------------------------------------------- */
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

/** Put this next to your store or import from wherever you define it */
export const symbolOptions = ["BTC"];

interface PerpState {

  symbol: string;


  /* ─── Setters (one per field) ──────────────────────── */
  setSymbol: (v: string) => void;


}

/* create() + subscribeWithSelector keeps the “other market”
 * rule in sync without extra useEffect in components. */
export const usePerpStore = create<PerpState>()(
  devtools(
    // subscribeWithSelector((set, get) => ({
    subscribeWithSelector((set) => ({
      /* ─── initial state ────────────────────────────── */
     
      symbol: symbolOptions[0],

      /* ─── setters ─────────────────────────────────── */
      setSymbol: (v) => set({ symbol: v }),
      
    }))
  )
);

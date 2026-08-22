/* tradeStore.ts -------------------------------------------------------- */
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { isPaperMode } from "@/lib/execMode";

/** Put this next to your store or import from wherever you define it */
export const marketOptions = ["BTC Perp Long", "BTC Perp Short"];

export type FundSource = "wallet" | "hl-balance" | "paper";

interface TradeState {
  /* ─── Sell box ─────────────────────────────────────── */
  sellAmount: string;
  sellPriceFrom: string;
  sellPriceTo: string;
  sellMarket: string;

  /* ─── Buy box ──────────────────────────────────────── */
  buyAmount: string;
  buyPriceFrom: string;
  buyPriceTo: string;
  buyMarket: string;

  /* ─── Misc ─────────────────────────────────────────── */
  slippage: number;
  txFees: number;
  slippageLoading: boolean;
  triggerTransaction: boolean;
  activeTab:string
  isPercentageMode:boolean;
  autoProtect: boolean;
  oldFloor: number;
  newFloor: number;
  fundSource: FundSource;


  /* ─── Setters (one per field) ──────────────────────── */
  setSellAmount: (v: string) => void;
  setSellPriceFrom: (v: string) => void;
  setSellPriceTo: (v: string) => void;
  setSellMarket: (v: string) => void;

  setBuyAmount: (v: string) => void;
  setBuyPriceFrom: (v: string) => void;
  setBuyPriceTo: (v: string) => void;
  setBuyMarket: (v: string) => void;

  setSlippage: (v: number) => void;
  setTxFees: (v: number) => void;
  setSlippageLoading: (v: boolean) => void;
  setTriggerTransaction: (flag: boolean) => void;
  setActiveTab: (v: string) => void;
  setIsPercentageMode: (v: boolean) => void;
  setAutoProtect: (v: boolean) => void;
  setOldFloor: (v: number) => void;
  setNewFloor: (v: number) => void;
  setFundSource: (v: FundSource) => void;

}

/* create() + subscribeWithSelector keeps the “other market”
 * rule in sync without extra useEffect in components. */
export const useTradeStore = create<TradeState>()(
  devtools(
    // subscribeWithSelector((set, get) => ({
    subscribeWithSelector((set) => ({
      /* ─── initial state ────────────────────────────── */
      sellAmount: "",
      sellPriceFrom: "",
      sellPriceTo: "",
      sellMarket: marketOptions[0],

      buyAmount: "",
      buyPriceFrom: "",
      buyPriceTo: "",
      buyMarket: marketOptions.find((m) => m !== marketOptions[0]) ?? marketOptions[0],

      slippage: 0,
      txFees: 0,
      slippageLoading: false,
      triggerTransaction: false,
      activeTab: "create-perp",
      isPercentageMode: true,
      autoProtect: true,
      oldFloor: 0,
      newFloor: 0,
      // Paper mode (v2 item P4) collapses fundSource to 'paper' — no on-chain/HL choice.
      fundSource: (isPaperMode() ? "paper" : "wallet") as FundSource,


      /* ─── setters ─────────────────────────────────── */
      setSellAmount: (v) => set({ sellAmount: v }),
      setSellPriceFrom: (v) => set({ sellPriceFrom: v }),
      setSellPriceTo: (v) => set({ sellPriceTo: v }),
      setSellMarket: (v) => set({ sellMarket: v }),

      setBuyAmount: (v) => set({ buyAmount: v }),
      setBuyPriceFrom: (v) => set({ buyPriceFrom: v }),
      setBuyPriceTo: (v) => set({ buyPriceTo: v }),
      setBuyMarket: (v) => set({ buyMarket: v }),

      setSlippage: (v) => set({ slippage: v }),
      setTxFees: (v) => set({ txFees: v }),
      setSlippageLoading: (v) => set({ slippageLoading: v }),
      setTriggerTransaction: (flag) => set({ triggerTransaction: flag }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setIsPercentageMode: (v) => set({ isPercentageMode: v }),
      setAutoProtect: (v) => set({ autoProtect: v }),
      setOldFloor: (v) => set({ oldFloor: v }),
      setNewFloor: (v) => set({ newFloor: v }),
      setFundSource: (v) => set({ fundSource: isPaperMode() ? "paper" : v }),
    }))
  )
);

/* ──────────────────────────────────────────────────────
   Keep buyMarket = "other option" whenever sellMarket
   changes.  We set up one store-level subscription so
   every component gets the rule automatically.          */
useTradeStore.subscribe(
  (state) => state.sellMarket,          // selector
  (sellMarket, prevSellMarket) => {
    if (sellMarket !== prevSellMarket) {
      const other =
        marketOptions.find((m) => m !== sellMarket) ?? sellMarket;
      useTradeStore.setState({ buyMarket: other });
    }
  }
);

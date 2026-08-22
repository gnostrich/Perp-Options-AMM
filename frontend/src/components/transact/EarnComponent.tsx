"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "../ui/card";
import { ibmPlexMono } from "@/lib/font";
import { halfSpreadBps } from "@/lib/utils";
import { shapeFromDials, effDelta, NEUTRAL_DIALS } from "@/lib/burr2/pricer";
import NumberFlow from "@number-flow/react";
import LeverageSlider from "./MiniComponents/LevSlider";
import CurveParamField from "./MiniComponents/CurveParamField";
import CloseAccruedDialog from "./MiniComponents/CloseAccruedDialog";

import { usePerpStore } from "@/store/perpStore";
import { useTradeStore } from "@/store/tradeStore";
import { useEarnStore } from "@/store/earnStore";
import { useLpCurveStore, LP_CURVE_DEFAULTS } from "@/store/lpCurveStore";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { checkBackendHealthAction } from "@/app/actions/checkBackendHealthAction";

import { useAccount } from "@/lib/hooks/useAccount";
import { useGraphStore } from "@/store/graphStore";
import { AlertTriangle } from "lucide-react";

import BalanceChip from "./MiniComponents/BalanceChip";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

// Warn idiom reused verbatim from earnTableContainer.tsx's exposure warn
// (amber #FFAE67 + AlertTriangle) — not invented here.
const WARN_COLOR = "#FFAE67";

/** Curve param field metadata driving the CURVE PARAMETERS block (UX §B.4). */
const CURVE_FIELDS: { key: keyof typeof LP_CURVE_DEFAULTS; label: string }[] = [
  { key: "sBar", label: "S̄ (mean strike)" },
  { key: "a", label: "a (Burr c)" },
  { key: "gamma", label: "γ (Burr k)" },
  { key: "lambda", label: "λ (decay)" },
  { key: "fee", label: "fee" },
  { key: "N", label: "N (rungs/wing)" },
];

export default function EarnComponent() {
  const { symbol } = usePerpStore();
  const { address, isConnected } = useAccount();
  const activeTab = useTradeStore(s => s.activeTab);

  const [earnAmount, setEarnAmount] = useState<string>("");
  const [debouncedEarnAmount, setDebouncedEarnAmount] = useState<string>("");
  const [earnLeverage, setEarnLeverage] = useState<number>(1);
  const [notional, setNotional] = useState<string>("0.00");
  const [isMarkPriceLoading, setIsMarkPriceLoading] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState<boolean>(true);
  const [closeAccruedOpen, setCloseAccruedOpen] = useState(false);

  // POOL STATS panel commented out entirely (owner ruling, 2026-07-30 — task #41:
  // its APR/TVL/leverage semantics are stale under the closed system). UX law: comment,
  // don't delete — this store read, the mount-effect fetch below, the helper consts, and
  // the JSX Card are ALL part of the same commented-out feature (git hazard memory: half-
  // commenting reads as abandoned, not intentional). Restore by uncommenting all four.
  // const poolState = useEarnStore(s => s.poolState);
  // const isPoolStateLoading = useEarnStore(s => s.isPoolStateLoading);
  // const fetchPoolState = useEarnStore(s => s.fetchPoolState);

  // LP-console store — curve params/bounds/preview/lifecycle (Item 20)
  const params = useLpCurveStore(s => s.params);
  const dials = useLpCurveStore(s => s.dials);
  const bounds = useLpCurveStore(s => s.bounds);
  const preview = useLpCurveStore(s => s.preview);
  const previewLoading = useLpCurveStore(s => s.previewLoading);
  const previewError = useLpCurveStore(s => s.previewError);
  const myLpState = useLpCurveStore(s => s.myLpState);
  const deploying = useLpCurveStore(s => s.deploying);
  const updating = useLpCurveStore(s => s.updating);
  const withdrawing = useLpCurveStore(s => s.withdrawing);
  const nExplicit = useLpCurveStore(s => s.nExplicit);
  const setParam = useLpCurveStore(s => s.setParam);
  const setMarginUsd = useLpCurveStore(s => s.setMarginUsd);
  const setLeverage = useLpCurveStore(s => s.setLeverage);
  const setMark = useLpCurveStore(s => s.setMark);
  const resetDefaults = useLpCurveStore(s => s.resetDefaults);
  const fetchBounds = useLpCurveStore(s => s.fetchBounds);
  const fetchPreview = useLpCurveStore(s => s.fetchPreview);
  const fetchMyLpState = useLpCurveStore(s => s.fetchMyLpState);
  const deploy = useLpCurveStore(s => s.deploy);
  const update = useLpCurveStore(s => s.update);
  const withdraw = useLpCurveStore(s => s.withdraw);

  // Effective δ (amm/lp/discretise.go effDelta, §2.3a) for the Half-Spread readout
  // below — audit finding: this used to feed the bare BUDGET δ, understating the
  // spread a thin curve actually quotes once the min-rung rule widens it (measured
  // 25 bps shown vs 58-90 bps actually quoted). At κ=0/no dial offset (NEUTRAL_DIALS)
  // since this panel has no live market/inventory state of its own — same baseline
  // CurveDigest (earnTableContainer.tsx) uses for a deployed position's own readout.
  const effectiveDelta = useMemo(
    () => effDelta(shapeFromDials(NEUTRAL_DIALS, {
      Sbar: params.sBar, A: params.a, Gamma: params.gamma, Lambda: params.lambda, N: params.N,
    })),
    [params.sBar, params.a, params.gamma, params.lambda, params.N]
  );

  useEffect(() => {
    // fetchPoolState(); — POOL STATS commented out (see its own const above), no reader left.
    fetchBounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CURVE PARAMETERS opens on valid workbook defaults, so the dotted preview must be on
  // the chart before any edit: fetch on mount and on every earn entry (the mark drifts,
  // and this component is force-mounted, so entry is the only "opened the console" signal).
  useEffect(() => {
    if (activeTab === "earn") fetchPreview();
  }, [activeTab, fetchPreview]);

  // Portfolio deep-link (/?tab=earn&lp=<lpId>): load THAT position into the console —
  // params/dials prefill, preview repaints from them, CTAs flip to Update/Withdraw —
  // and scope the Book panel to the viewer's own rungs.
  const lpParam = useSearchParams().get("lp");

  useEffect(() => {
    if (isConnected && address) fetchMyLpState(address, lpParam ?? undefined);
  }, [isConnected, address, lpParam, fetchMyLpState]);

  // Superseded twice over: this deep-link-specific effect predates the 2026-07-29
  // forceOwnOnly stopgap (which made it redundant — EARN's book pane was UNCONDITIONALLY
  // YOUR BOOK ONLY, render-scoped, no store write needed). forceOwnOnly is itself now gone
  // (owner 2026-07-30, real toggle restored) — but this effect is STILL redundant, not
  // revived: GraphCardWrapperTab's activeTab-entry effect already calls
  // bookStore.setOwnOnly(true) once whenever activeTab becomes "earn", and that fires on
  // this same mount (a deep-link load arrives with activeTab already "earn"). Left
  // commented rather than restored — reviving it would just be two writers of the same
  // default for no added case it covers.
  // useEffect(() => {
  //   if (lpParam) useBookStore.getState().setOwnOnly(true);
  // }, [lpParam]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      const ok = await checkBackendHealthAction();
      if (!canceled) setBackendHealthy(ok);
    })();
    return () => { canceled = true; };
  }, []);

  const currentMarkPrice = useGraphStore(s => s.currentMarkPrice);

  // Feeds the LP-console store's DERIVED MODE (owner ruling 2026-07-29: curve size
  // follows the money by default) — the same live oracle mark this component's own
  // `notional` field already uses below, one level down so the ghost/preview can
  // recompute N = margin*leverage/mark without EarnComponent doing the math twice.
  useEffect(() => {
    setMark(currentMarkPrice);
  }, [currentMarkPrice, setMark]);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedEarnAmount(earnAmount);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [earnAmount]);

  useEffect(() => {
    const computeNotional = async () => {
      if (!debouncedEarnAmount) {
        setNotional("0.00");
        return;
      }

      const amt = Number(debouncedEarnAmount);
      if (!isFinite(amt) || amt <= 0) {
        setNotional("0.00");
        return;
      }

      try {
        setIsMarkPriceLoading(true);
        const mark = currentMarkPrice

        if (isFinite(mark) && mark > 0) {
          // Notional = (EarnAmount * EarnLeverage) / (BTC Perp Mark Price * 2)
          const value = (amt * earnLeverage) / (mark);
          setNotional(value.toFixed(6));
        } else {
          // Fallback when we fail to get mark price
          setNotional("0.00");
        }
      } catch (error) {
        console.error("Error computing notional:", error);
        setNotional("0.00");
      } finally {
        setIsMarkPriceLoading(false);
      }
    };

    computeNotional();
  }, [debouncedEarnAmount, earnLeverage, symbol, currentMarkPrice]);

  // Feed MARGIN/LEVERAGE into the LP-console store — curve-preview's capitalAtRiskUsd
  // is scaled by margin×leverage (contract 1); this re-triggers the 300ms-debounced preview.
  useEffect(() => {
    setMarginUsd(Number(debouncedEarnAmount) || 0);
  }, [debouncedEarnAmount, setMarginUsd]);

  useEffect(() => {
    setLeverage(earnLeverage);
  }, [earnLeverage, setLeverage]);

  const handleLeverageChange = (value: number) => setEarnLeverage(value);

  const handleBalanceClick = (balance: string) => {
    setEarnAmount(balance);
  }

  const amountNum = Number(earnAmount);
  const notionalNum = Number(notional);
  const marginValid = !!amountNum && amountNum >= 5;
  const notionalValid = isFinite(notionalNum) && notionalNum > 0;
  const deployDisabled =
    !isConnected || !marginValid || !notionalValid || isMarkPriceLoading || !backendHealthy || deploying;

  const handleDeploy = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to continue");
      return;
    }
    if (!marginValid) {
      toast.error("Minimum transaction amount is 5 USDC");
      return;
    }
    if (!notionalValid) {
      toast.error("Invalid notional value. Please wait for price to load.");
      return;
    }

    toast.loading("Deploying LP curve…");
    // {ok,error}: a refusal (e.g. the 10× leverage-cap gate, CLAUDE.md "LP leverage
    // is capped at 10×: …") carries the backend's own words verbatim — never a
    // generic string, same discipline as CloseAccruedDialog's closeError.
    const { ok, error } = await deploy(address, notionalNum);
    toast.dismiss();
    if (ok) {
      toast.success("LP curve deployed successfully!");
    } else {
      toast.error(error ?? "Failed to deploy LP curve");
    }
  };

  const handleUpdate = async () => {
    if (!address) return;
    toast.loading("Updating LP curve…");
    const { ok, error } = await update(address);
    toast.dismiss();
    if (ok) {
      toast.success("LP curve updated successfully!");
    } else {
      toast.error(error ?? "Failed to update LP curve");
    }
  };

  const handleWithdraw = async () => {
    toast.loading("Withdrawing…");
    const ok = await withdraw();
    toast.dismiss();
    if (ok) {
      toast.success("Position closed successfully. Tokens will reach your wallet in a few minutes.");
    } else {
      toast.error("Failed to withdraw");
    }
  };

  // ─── Pool Stats helpers ────────────────────────────────────────────────────
  // Commented out with the panel itself (see its Card below) — POOL STATS retired,
  // owner ruling 2026-07-30, task #41.
  // const poolLeverage = poolState?.lp_leverage != null
  //   ? `${poolState.lp_leverage.toFixed(1)}x`
  //   : "--";

  // const tvlDollar = poolState?.notional_deposit_dollar != null
  //   ? `$${poolState.notional_deposit_dollar.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  //   : "--";

  // const tvlBtc = poolState?.notional_deposit_btc != null
  //   ? `₿${poolState.notional_deposit_btc.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`
  //   : "--";

  // The console is taller than the viewport on 1200px-class screens: it scrolls inside
  // the panel so SCHEDULE PREVIEW stays reachable and the chart column
  // (grid items-stretch) is not dragged to a ~1000px height.
  return (
    <div className="px-4 py-3 bg-[#0E1B1E] w-full h-full flex flex-col min-h-0 max-h-[calc(100lvh-15rem)] overflow-y-auto">
      <div className="grid grid-cols-1 gap-0 content-start">

        {/* ---------------------------------------------- CURVE PARAMETERS ---------------------------------------------- */}
        <Card className="w-full py-2 flex flex-col rounded-lg border border-[#CFCFCF] shadow-[#575757] bg-[#1A1A1A] text-2xs">
          <div className="w-full mx-auto px-2 rounded-sm font-mono text-sm">
            <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-[#677275]">
              <span className={`text-2xs tracking-widest font-semibold text-white ${ibmPlexMono.className}`}>
                CURVE PARAMETERS
              </span>
              <button
                type="button"
                onClick={resetDefaults}
                className={`text-2xs text-[#0ABAB5] hover:underline ${ibmPlexMono.className}`}
              >
                Reset to defaults
              </button>
            </div>

            {CURVE_FIELDS.map(({ key, label }) => (
              <CurveParamField
                key={key}
                label={label}
                value={params[key]}
                min={bounds[key].min}
                max={bounds[key].max}
                step={bounds[key].step}
                onChange={(v) => setParam(key, v)}
                // DERIVED MODE marker (owner ruling 2026-07-29): N alone can be driven
                // by margin×leverage/mark instead of its own field — say so on the field
                // itself, clear the instant the user types/slides N (EXPLICIT MODE).
                hint={key === "N" && !nExplicit ? "= from notional" : undefined}
              />
            ))}
          </div>
        </Card>

        <Card className="mt-2 w-full py-1 flex flex-col rounded-lg border border-[#CFCFCF] shadow-[#575757] bg-[#1A1A1A] text-2xs">
          <div className="w-full mx-auto px-1 space-y-2 rounded-sm font-mono text-sm">
            {/* EARN AMOUNT */}
            <div className="rounded-sm grid grid-cols-[minmax(100px,auto)_minmax(160px,1fr)_minmax(45px,auto)] items-center mx-0 bg-[#222223] border border-[#465E58] ">
              <div className="flex items-center rounded-l-sm justify-center m-0 py-3 bg-[#112226] border-r border-[#465E58]">
                <span className="font-normal text-2xs tracking-widest text-[#E4E4E4]">
                  MARGIN
                </span>
              </div>

              <div className="flex items-center justify-center px-0">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  value={earnAmount}
                  onChange={(e) => setEarnAmount(e.target.value)}
                  className={`h-6 w-full rounded-sm bg-[#222223] p-2 text-xs font-light text-white placeholder:text-gray-400 placeholder:text-2xs focus:outline-none focus:ring-0 ${ibmPlexMono.className}`}
                />

              </div>
              <div className="flex items-center justify-end px-2">
                <BalanceChip onClick={handleBalanceClick} />
              </div>
            </div>

            {/* LEVERAGE */}
            <div className="rounded-sm grid grid-cols-[minmax(100px,auto)_minmax(160px,1fr)] items-center mx-0 bg-[#222223] border border-[#465E58] ">
              <div className="flex items-center rounded-l-sm justify-center m-0 py-5 bg-[#112226] border-r border-[#465E58]">
                <span className="font-normal text-2xs tracking-widest text-[#E4E4E4]">
                  LEVERAGE
                </span>
              </div>

              <div className="flex items-center justify-center  px-">
                {/* max=10: the LP maintenance cap (CLAUDE.md "LP leverage cap —
                    10× maintenance"). This bound is UX only — the backend
                    refuses over-cap N·S regardless (leverageRefusal, always live). */}
                <LeverageSlider leverage={earnLeverage} handleLeverageChange={handleLeverageChange} max={10} />
              </div>
            </div>

            {/* NOTIONAL */}
            <div className="rounded-sm grid grid-cols-[minmax(100px,auto)_minmax(160px,1fr)_minmax(45px,auto)] items-center mx-0 bg-[#222223] border border-[#465E58] ">
              <div className="flex items-center rounded-l-sm justify-center m-0 py-3 bg-[#112226] border-r border-[#465E58]">
                <span className="font-normal text-2xs tracking-widest text-[#E4E4E4]">
                  NOTIONAL
                </span>
              </div>

              <div className="flex items-center justify-left px-4">
                <div className="text-slate-300 text-xs font-mono">
                  <NumberFlow
                    value={Number(notional)}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 6 }}
                    locales="en-US"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end px-2">
                <span className="mr-2 text-2xs font-medium text-[#FFA541]">{symbol}</span>
              </div>
            </div>

            {/* LP Levered APY — inline below NOTIONAL */}
            <div className="flex items-center justify-between px-2 py-1">
              <span className={`text-2xs text-[#E5E5E5] font-light ${ibmPlexMono.className}`}>
                LP Levered Annual Percentage Rate (APR)
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-2xs font-semibold text-[#FFA541] ${ibmPlexMono.className}`}>
                  --%
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InformationCircleIcon className="h-4 w-4 -mx-1 -my-1 text-white" />
                    </TooltipTrigger>

                    <TooltipContent
                      side="right"
                      align="center"
                      className={`max-w-md ${ibmPlexMono.className}`}
                    >
                      <p>
                        Will be updated soon
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

          </div>
        </Card>

        {/* ---------------------------------------------- SCHEDULE PREVIEW ---------------------------------------------- */}
        <Card className="mt-2 p-3 rounded-lg bg-[#0F121580] border border-[#D1D1D1] shadow-[#575757]">
          <div>
            <div className="pb-1.5 mb-1.5 border-b border-[#677275] flex items-center justify-between">
              <span className={`text-2xs tracking-widest font-semibold text-white ${ibmPlexMono.className}`}>
                SCHEDULE PREVIEW
              </span>
              {previewLoading && (
                <span className={`text-2xs text-[#0ABAB5] ${ibmPlexMono.className}`}>
                  updating preview…
                </span>
              )}
            </div>

            <div className="flex justify-between items-center py-0.5 font-light text-[#E5E5E5]">
              <span className="text-2xs">Rungs</span>
              <span className="text-white text-2xs font-semibold">
                {preview ? preview.rungs : "--"}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 font-light text-[#E5E5E5]">
              <span className="text-2xs">Σ Notional</span>
              <span className="text-white text-2xs font-semibold">
                {preview ? `₿${preview.totalNotionalBtc.toFixed(4)}` : "--"}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 font-light text-[#E5E5E5]">
              <span className="text-2xs">Peak Strike</span>
              <span className="text-white text-2xs font-semibold">
                {preview ? preview.peakStrike.toLocaleString("en-US") : "--"}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 font-light text-[#E5E5E5]">
              <span className="text-2xs">Half-Spread (Dial)</span>
              <span className="text-[#FFA541] text-2xs font-semibold">
                ≈{halfSpreadBps(dials.spread, effectiveDelta).toFixed(0)} bps
              </span>
            </div>

            {/* Auditor finding (global conflation sweep, HIGH): backend's capitalAtRiskUsd
                (book_handlers.go: postedBtc·mark, postedBtc = Σ qty·price over the
                MOQ-pruned EMITTED ladder) is posted premium exposure over the rendered
                lattice, not capital at risk — it swings 147× between a $1k and $5k
                deposit purely from dust-pruning, unrelated to what the LP actually has
                on the line. It's the same postedBtc already shown above as "Σ Notional",
                just in $ — relabelled to match that sibling, not "fixed" numerically
                (no backend change). */}
            <div className="flex justify-between items-center py-0.5 font-light text-[#E5E5E5]">
              <span className="text-2xs">Σ Posted Premium</span>
              <span className="text-white text-2xs font-semibold">
                {preview
                  ? `$${preview.capitalAtRiskUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                  : "--"}
              </span>
            </div>

            {/* Audit correction (same session, re-caught the identical conflation class):
                a first pass labelled this row "Capital at Risk" — wrong again, just a
                different wrong number. In DERIVED MODE, N·mark IS margin×leverage — the
                LEVERED NOTIONAL, not what's actually at stake (measured: $100k margin ×
                10x → $1,000,852, ten times the real deposit); in EXPLICIT MODE it decouples
                from margin entirely (N=40 + a $1k deposit claims $2.58M "at risk"). It's
                honest as exactly what it is: the CURVE PARAMETERS panel's own NOTIONAL
                (BTC) field, restated in dollars — the deposit itself (margin, the real
                capital at stake) is already on screen above, no second "at risk" row
                needed or added. */}
            <div className="flex justify-between items-center py-0.5 font-light text-[#E5E5E5]">
              <span className="text-2xs">Notional $</span>
              <span className="text-white text-2xs font-semibold">
                {currentMarkPrice
                  ? `$${(params.N * currentMarkPrice).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                  : "--"}
              </span>
            </div>

            {previewError && (
              <p className="mt-2 text-2xs text-gray-400">Preview unavailable.</p>
            )}
          </div>
        </Card>

        {/* ---------------------------------------------- POOL STATS ----------------------------------------------
            Commented out entirely (owner ruling, 2026-07-30 — task #41): Base/Levered
            APR and Annualized Fees were always "--%" placeholders ("Will be updated
            soon"), and TVL/Pool Leverage read `poolState` (a pre-closed-system pool
            snapshot) whose semantics are stale now that the house has no unfunded
            default ladder and N is capital, not a curve constant (CLAUDE.md's "closed
            system" ruling). UX law: comment, don't delete. Restore by uncommenting this
            whole block AND its three helper-const groups + mount-effect fetch above.
        <Card className="mt-2 p-3 rounded-lg bg-[#0F121580] border border-[#D1D1D1] shadow-[#575757]">
          <div>
            // Header
            <div className="pb-1.5 mb-1.5 border-b border-[#677275]">
              <span className={`text-2xs tracking-widest font-semibold text-white ${ibmPlexMono.className}`}>
                POOL STATS
              </span>
            </div>

            // Base APY
            <div className="flex justify-between items-center py-0.5 font-light text-[#E5E5E5]">
              <span className="text-2xs">Base Annual Percentage Rate (APR)</span>
              <div className="flex items-center gap-2">
                <span className="text-[#FFA541] text-2xs font-semibold">--%</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InformationCircleIcon className="h-4 w-4 -mx-1 -my-1 text-white" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="center"
                      className={`max-w-md ${ibmPlexMono.className}`}
                    >
                      <p>
                        Will be updated soon
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            // Levered APY
            <div className="flex justify-between items-center py-0.5 font-light text-[#E5E5E5]">
              <span className="text-2xs">Levered Annual Percentage Rate (APR)</span>
              <div className="flex items-center gap-2">
                <span className="text-[#FFA541] text-2xs font-semibold">--%</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InformationCircleIcon className="h-4 w-4 -mx-1 -my-1 text-white" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="center"
                      className={`max-w-md ${ibmPlexMono.className}`}
                    >
                      <p>
                        Will be updated soon
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            // Annualized Fees
            <div className="flex justify-between items-center py-0.5 font-light text-[#E5E5E5]">
              <span className="text-2xs">Annualized Fees</span>
              <div className="flex items-center gap-2">
                <span className="text-[#FFA541] text-2xs font-semibold">--%</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InformationCircleIcon className="h-4 w-4 -mx-1 -my-1 text-white" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="center"
                      className={`max-w-md ${ibmPlexMono.className}`}
                    >
                      <p>
                        Will be updated soon
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            // TVL
            <div className="flex justify-between items-center py-0.5 font-light text-[#E5E5E5]">
              <span className="text-2xs">TVL</span>
              <span className="text-white text-2xs font-semibold">
                {isPoolStateLoading ? (
                  <span className="animate-pulse text-[#677275]">--</span>
                ) : (
                  <span>{tvlDollar} | {tvlBtc}</span>
                )}
              </span>
            </div>

            // Pool Leverage
            <div className="flex justify-between items-center py-0.5 font-light text-[#E5E5E5]">
              <span className="text-2xs">Pool Leverage</span>
              <span className="text-white text-2xs font-semibold">
                {isPoolStateLoading ? (
                  <span className="animate-pulse text-[#677275]">--</span>
                ) : (
                  poolLeverage
                )}
              </span>
            </div>
          </div>
        </Card>
        */}

        {/* LEVERAGE readout (task #39, CLAUDE.md "LP leverage cap — 10× maintenance"):
            leverage = Nᵢ·S/equity(deposit + inventory mark-to-book), a MAINTENANCE
            level — visible whether or not the forced-close sweep is armed. Reads
            leverageBreached for the predicate, never the raw number: an
            uncollateralised program reports leverage 0.0 while still breached, so
            a breach never prints "0.0×" as if healthy. */}
        {myLpState?.deployed && myLpState.leverageCap != null && (
          <div className="flex justify-between items-center py-0.5 px-2 mt-1 font-light text-[#E5E5E5]">
            <span className="text-2xs">LP Leverage</span>
            <div className="flex flex-col items-end gap-0.5">
              <span
                className="text-white text-2xs font-semibold"
                style={myLpState.leverageBreached ? { color: WARN_COLOR } : undefined}
              >
                {myLpState.leverageBreached && (myLpState.leverage ?? 0) === 0
                  ? "OVER CAP"
                  : `${(myLpState.leverage ?? 0).toFixed(1)}×`}{" "}
                / {myLpState.leverageCap.toFixed(0)}×
              </span>
              {myLpState.leverageBreached && (
                <span
                  className="text-2xs flex items-center gap-1 text-right"
                  style={{ color: WARN_COLOR }}
                >
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {myLpState.leverageBreachReason || "over the leverage cap"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------- DEPLOY / UPDATE / WITHDRAW ---------------------------------------------- */}
        {/* id targeted by BookProjectionView's YOUR BOOK "DEPLOY →" link (the
            ghost-proforma playground's exit into the real provision flow) —
            whichever branch is showing is this session's actual deposit entry
            point, so both wrapper divs carry it. */}
        {myLpState?.deployed ? (
          <div id="deploy-curve-panel" className="flex items-center justify-center gap-2 mt-2">
            <Button
              className="w-full md:w-1/3"
              disabled={updating || !isConnected}
              onClick={handleUpdate}
            >
              <span className="text-white text-xs font-semibold">
                {updating ? "UPDATING..." : "UPDATE"}
              </span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="noShadow"
                  className="w-full md:w-1/3 bg-[#523C4C] hover:bg-[#3f2e3b]"
                  disabled={withdrawing}
                >
                  <span className="text-white text-xs font-semibold">
                    {withdrawing ? "WITHDRAWING..." : "WITHDRAW"}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#112226] border-[#808080] text-[#C9C8C8]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Withdraw LP Curve?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Are you sure you want to withdraw your deployed curve? This closes the
                    position and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent text-white hover:bg-white/10 border-gray-600">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600 text-white border-0"
                    onClick={handleWithdraw}
                  >
                    Confirm Withdraw
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Third, non-destructive CTA (task #36b): closes only the positions
                this curve has ACCRUED from trader fills — the curve itself stays
                deployed and quoting. Outline/teal (not filled, not WITHDRAW's
                destructive tone) so it reads as an action ON the accrued fills,
                never a replacement for WITHDRAW. */}
            <Button
              variant="noShadow"
              className="w-full md:w-1/3 bg-transparent border-[1.5px] border-[#0ABAB5] text-[#0ABAB5] hover:bg-[#0ABAB512]"
              disabled={!isConnected || !myLpState?.lpId}
              onClick={() => setCloseAccruedOpen(true)}
            >
              <span className="text-2xs font-semibold">CLOSE ACCRUED POSITIONS</span>
            </Button>
            {address && myLpState?.lpId && (
              <CloseAccruedDialog
                open={closeAccruedOpen}
                onOpenChange={setCloseAccruedOpen}
                wallet={address}
                lpId={myLpState.lpId}
                onClosed={() => fetchMyLpState(address, myLpState.lpId)}
              />
            )}
          </div>
        ) : (
          <div id="deploy-curve-panel" className="flex items-center justify-center mt-2">
            <Button
              className="w-full md:w-1/2"
              disabled={deployDisabled}
              onClick={handleDeploy}
            >
              <span className="text-white text-xs font-semibold">
                {!isConnected
                  ? "CONNECT WALLET"
                  : deploying
                  ? "DEPLOYING..."
                  : isMarkPriceLoading
                  ? "FETCHING PRICE..."
                  : "DEPLOY CURVE"}
              </span>
            </Button>
          </div>
        )}

        <div className="flex mx-auto">
          {!backendHealthy && (
            <p className="mt-2 text-sm text-gray-400">
              Backend is currently unreachable.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

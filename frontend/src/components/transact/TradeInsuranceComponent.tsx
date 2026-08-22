"use client";

import { ibmPlexMono } from "@/lib/font";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { debounce } from "@tanstack/react-pacer";
import Image from "next/image";

import { marketOptions, useTradeStore } from "@/store/tradeStore";
import { useGraphStore } from "@/store/graphStore";
import { getPerpQuantitiesAction } from "@/app/actions/getPerpQuantitiesAction";
import { checkBackendHealthAction } from "@/app/actions/checkBackendHealthAction";
import { sendSellTransactionAction } from "@/app/actions/sendSellTransactionAction";
import { fetchStrikeBoundsAction } from "@/app/actions/fetchStrikeBoundsAction";
import type { StrikeBoundsResponse } from "@/lib/data/api/strikeBounds";
import type { AfterCurve } from "@/lib/data/api/contracts";
import type { OverlayPoint } from "@/store/graphStore";
import { Button } from "../ui/button";
import BuyMarketDisplay from "@/components/transact/MiniComponents/BuyMarketDisplay";
import DepositMarketDisplay from "@/components/transact/MiniComponents/DepositMarketDisplay";
import NumberFlow from "@number-flow/react";
import SplitTextTransact from "./MiniComponents/SplitTextTransact";
import ToggleSwitch from "./MiniComponents/ToggleSwitch";
import { toast } from "sonner";
import MaxChip from "./MiniComponents/MaxChip";
import { useWalletClient } from "wagmi";
import { useAccount } from "@/lib/hooks/useAccount";
import { formatAddress } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";


/* ------------------------- helpers: % / $ conversion ------------------------- */

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
const isLongSide = (mkt?: string) => mkt?.toLowerCase().includes("long") ?? false;

function parseNumberInput(raw: string, percentMode: boolean): string {
    const cleaned = raw.replace(/[^\d.]/g, "");
    if (!cleaned) return "";
    const num = Number(cleaned);
    if (!Number.isFinite(num)) return "";
    return percentMode ? String(clamp(num, 0, 100)) : cleaned;
}

function percentToAbsolute(pct: number, mark: number, side: "long" | "short"): number {
    if (!Number.isFinite(mark) || mark <= 0) return NaN;
    const p = clamp(pct, 0, 100);
    return side === "long" ? mark * (1 + p / 100) : mark * (1 - p / 100);
}

function absoluteToPercent(abs: number, mark: number, side: "long" | "short"): number {
    if (!Number.isFinite(mark) || mark <= 0) return NaN;
    if (!Number.isFinite(abs)) return NaN;
    const pct =
        side === "long" ? ((abs / mark) - 1) * 100 : (1 - abs / mark) * 100;
    return clamp(pct, 0, 100);
}

function pretty(n: number, maxFrac = 6) {
    if (!Number.isFinite(n)) return "";
    const s = n.toFixed(Math.min(Math.max(0, maxFrac), 10));
    return s.replace(/\.?0+$/g, "");
}

/** Merges after_curve's separate callCurve/putCurve into graphStore's {price,call,put}[] overlay shape. */
function mergeAfterCurve(after: AfterCurve): OverlayPoint[] {
    const byPrice = new Map<number, OverlayPoint>();
    after.callCurve.forEach(({ price, call }) => {
        byPrice.set(price, { price, call, put: byPrice.get(price)?.put ?? 0 });
    });
    after.putCurve.forEach(({ price, put }) => {
        const prev = byPrice.get(price);
        byPrice.set(price, { price, call: prev?.call ?? 0, put });
    });
    return Array.from(byPrice.values()).sort((a, b) => a.price - b.price);
}

export default function TradeInsuranceComponent() {

    const [sellPriceError, setSellPriceError] = useState<string>("");
    const [buyPriceError, setBuyPriceError] = useState<string>("");
    const [sellQtyError, setSellQtyError] = useState<string>("");
    const [fromBoundsError, setFromBoundsError] = useState<string>("");
    const [apiBusy, setApiBusy] = useState(false);
    const [backendHealthy, setBackendHealthy] = useState(true);
    const requestIdRef = useRef(0);

    const [strikeBounds, setStrikeBounds] = useState<StrikeBoundsResponse | null>(null);
    const [boundsLoading, setBoundsLoading] = useState(false);
    const defaultsAppliedForRef = useRef<string | null>(null);

    const [avail, setAvail] = useState<{ long: number; short: number }>({ long: 0, short: 0 });
    const [availLoading, setAvailLoading] = useState(false);

    // Book-depth affordance (v2 trade-bands ticket): `max_fillable` on the dry-run
    // response. undefined until a dry-run has returned it — the field is absent on
    // older backends, and that keeps the affordance hidden entirely (never a skeleton).
    const [maxFillable, setMaxFillable] = useState<number | undefined>(undefined);
    const [depthError, setDepthError] = useState<string>("");

    const {
        // ───── Sell Box ─────
        sellAmount,
        setSellAmount,
        sellPriceFrom,
        setSellPriceFrom,
        sellPriceTo,
        setSellPriceTo,
        sellMarket,
        setSellMarket,

        // ───── Buy Box ──────
        buyAmount,
        setBuyAmount,
        buyPriceFrom,
        setBuyPriceFrom,
        buyPriceTo,
        setBuyPriceTo,
        buyMarket,

        // ───── Misc ─────────
        slippage,
        setSlippage,
        txFees,
        setTxFees,
        slippageLoading,
        triggerTransaction,
        setTriggerTransaction,
        isPercentageMode,
        setIsPercentageMode,
        activeTab,
    } = useTradeStore();

    const {
        setBandValues,
        setOverlayCurve,
        clearOverlay,
        overlayKind,
    } = useGraphStore();

    const currentMarkPrice = useGraphStore(s => s.currentMarkPrice);
    // Use a ref to access the latest mark price without causing re-renders
    const markPriceRef = useRef(currentMarkPrice);
    markPriceRef.current = currentMarkPrice;

    // WebSocket connection is now handled at PlaceOrderCard level
    // No need to connect/disconnect here

    const sellSide: "long" | "short" = isLongSide(sellMarket) ? "long" : "short";
    const buySide: "long" | "short" = isLongSide(buyMarket) ? "long" : "short";
    const longAvail = Number(avail.long) || 0;
    const shortAvail = Number(avail.short) || 0;

    const sellMaxQty = sellSide === "long" ? longAvail : shortAvail;
    // const buyMaxQty = buySide === "long" ? longAvail : shortAvail;


    const debouncedTriggerTransaction = useMemo(() =>
        debounce(() => {
            setTriggerTransaction(true);
        }, { wait: 600 }),
        [setTriggerTransaction]
    );

    // const wallet = useWalletClient();
    const { address, isConnected, chain } = useAccount();

    useEffect(() => {
        debouncedTriggerTransaction();
    }, [sellAmount, sellPriceFrom, sellPriceTo, buyPriceFrom, buyPriceTo, debouncedTriggerTransaction]);

    // const perpType = sellMarket.toLowerCase().includes("long") ? "long" : "short";

    useEffect(() => {
        let canceled = false;

        (async () => {
            const ok = await checkBackendHealthAction();
            if (!canceled) setBackendHealthy(ok);
        })();

        return () => {
            canceled = true;
        };
    }, []);

    /*  Fetch strike bounds on mount + sellMarket change */
    useEffect(() => {
        let canceled = false;
        const perpType: "long" | "short" = isLongSide(sellMarket) ? "long" : "short";

        (async () => {
            setBoundsLoading(true);
            try {
                const bounds = await fetchStrikeBoundsAction(perpType, "sell");
                if (canceled) return;
                setStrikeBounds(bounds);

                // Apply defaults only once per market change
                if (bounds && defaultsAppliedForRef.current !== perpType) {
                    defaultsAppliedForRef.current = perpType;
                    const mark = Number(markPriceRef.current);
                    const sSide: "long" | "short" = perpType;
                    const bSide: "long" | "short" = perpType === "long" ? "short" : "long";

                    setSellPriceFrom(toDisplay(bounds.sold_defaults.inner_usd, sSide));
                    setSellPriceTo(toDisplay(bounds.sold_defaults.outer_usd, sSide));
                    setBuyPriceFrom(toDisplay(bounds.bought_defaults.inner_usd, bSide));
                    setBuyPriceTo(toDisplay(bounds.bought_defaults.outer_usd, bSide));
                }
            } catch (e) {
                console.error("Failed to fetch strike bounds:", e);
                if (!canceled) setStrikeBounds(null);
            } finally {
                if (!canceled) setBoundsLoading(false);
            }
        })();

        return () => { canceled = true; };
    }, [sellMarket, isPercentageMode, setSellPriceFrom, setSellPriceTo, setBuyPriceFrom, setBuyPriceTo]);

    // Book depth is per side — a stale max_fillable/depthError from the other side
    // would otherwise linger until the next dry-run fires (which only happens once
    // an amount is entered).
    useEffect(() => {
        setMaxFillable(undefined);
        setDepthError("");
    }, [sellMarket]);

    const prevModeRef = useRef(isPercentageMode);
    useEffect(() => {
        const mark = Number(currentMarkPrice);
        if (!Number.isFinite(mark) || mark <= 0) {
            prevModeRef.current = isPercentageMode;
            return;
        }
        if (prevModeRef.current === isPercentageMode) return;

        // const sellSide: "long" | "short" = isLongSide(sellMarket) ? "long" : "short";
        // const buySide: "long" | "short" = isLongSide(buyMarket) ? "long" : "short";

        const toPercentStr = (absStr: string, side: "long" | "short") =>
            absStr ? pretty(absoluteToPercent(Number(absStr), mark, side), 4) : "";

        const toAbsStr = (pctStr: string, side: "long" | "short") =>
            pctStr ? pretty(percentToAbsolute(Number(pctStr), mark, side)) : "";

        if (isPercentageMode) {
            // $ -> %
            setSellPriceFrom(toPercentStr(sellPriceFrom, sellSide));
            setSellPriceTo(toPercentStr(sellPriceTo, sellSide));
            setBuyPriceFrom(toPercentStr(buyPriceFrom, buySide));
            setBuyPriceTo(toPercentStr(buyPriceTo, buySide));
        } else {
            // % -> $
            setSellPriceFrom(toAbsStr(sellPriceFrom, sellSide));
            setSellPriceTo(toAbsStr(sellPriceTo, sellSide));
            setBuyPriceFrom(toAbsStr(buyPriceFrom, buySide));
            setBuyPriceTo(toAbsStr(buyPriceTo, buySide));
        }

        prevModeRef.current = isPercentageMode;
    }, [
        isPercentageMode,
        currentMarkPrice,
        sellMarket,
        buyMarket,
        sellPriceFrom,
        sellPriceTo,
        buyPriceFrom,
        buyPriceTo,
        buySide,
        sellSide,
        setSellPriceFrom,
        setSellPriceTo,
        setBuyPriceFrom,
        setBuyPriceTo,
    ]);

    const toDisplay = useCallback((usd: number, side: "long" | "short") => {
        if (usd === 0) return "";
        const mark = Number(markPriceRef.current);
        if (isPercentageMode && Number.isFinite(mark) && mark > 0) {
            return pretty(absoluteToPercent(usd, mark, side), 4);
        }
        return pretty(usd);
    }, [isPercentageMode]);

    // --------------------------------- Validate ---------------------------------

    useEffect(() => {
        const mark = Number(currentMarkPrice);
        if (!Number.isFinite(mark) || mark <= 0) return;

        const toAbs = (raw: string, side: "long" | "short") => {
            if (!raw) return undefined;
            const n = Number(raw);
            if (!Number.isFinite(n)) return undefined;
            return isPercentageMode ? percentToAbsolute(n, mark, side) : n;
        };

        /* -------- bounds: use API when available, else fallback -------- */
        const sb = strikeBounds; // may be null

        // Fallback hardcoded limits (used when API bounds not available)
        const twoX = mark * 2;
        const markPlus50Pct = mark * 1.5;
        const markMinus50Pct = mark * 0.5;

        /**
         * Build a complete bound-violation error message.
         * For the short/put side in % mode the operator flips because
         * higher % = further from spot = LOWER absolute price.
         *
         * @param label  "Sell" | "Buy"
         * @param field  "From" | "To"
         * @param dir    "min" = value is below min_usd, "max" = value is above max_usd
         * @param range  the BoundRange from the API
         * @param side   "long" | "short" — determines whether % direction inverts
         */
        const boundMsg = (
            label: string,
            field: string,
            dir: "min" | "max",
            range: { min_usd: number; max_usd: number; min_pct_from_spot: number; max_pct_from_spot: number },
            side: "long" | "short"
        ) => {
            if (isPercentageMode) {
                const usd = dir === "min" ? range.min_usd : range.max_usd;
                const displayPct = pretty(absoluteToPercent(usd, mark, side), 2);
                // For long: min→≥, max→≤  (higher % = higher $)
                // For short: min→≤, max→≥  (higher % = LOWER $, so flip)
                const op = side === "long"
                    ? (dir === "min" ? "≥" : "≤")
                    : (dir === "min" ? "≤" : "≥");
                return `Error: ${label} "${field}" must be ${op} ${displayPct}%.`;
            }
            const usd = dir === "min" ? range.min_usd : range.max_usd;
            const op = dir === "min" ? "≥" : "≤";
            return `Error: ${label} "${field}" must be ${op} $${pretty(usd, 0)}.`;
        };

        /* ---------------- SELL side ---------------- */
        const fromS = toAbs(sellPriceFrom, sellSide);
        const toS = toAbs(sellPriceTo, sellSide);
        let nextSellErr = "";

        if (fromS !== undefined) {
            if (sb) {
                // API-driven validation for sell "From" (inner)
                if (fromS < sb.sold.inner.min_usd)
                    nextSellErr = boundMsg("Sell", "From", "min", sb.sold.inner, sellSide);
                else if (fromS > sb.sold.inner.max_usd)
                    nextSellErr = boundMsg("Sell", "From", "max", sb.sold.inner, sellSide);
                // API-driven validation for sell "To" (outer), 0 = barrier only
                if (!sb.sold.outer_optional && (toS === undefined || toS === 0)) {
                    nextSellErr = `Error: Sell "To" must be provided.`;
                } else if (toS !== undefined && toS !== 0) {
                    if (toS < sb.sold.outer.min_usd)
                        nextSellErr = boundMsg("Sell", "To", "min", sb.sold.outer, sellSide);
                    else if (toS > sb.sold.outer.max_usd)
                        nextSellErr = boundMsg("Sell", "To", "max", sb.sold.outer, sellSide);
                    // Cross-field: for long sold call, outer must be > inner
                    else if (sellSide === "long" && toS <= fromS)
                        nextSellErr = `Error: Sell "To" must be > "From".`;
                    // For short sold put, outer must be < inner
                    else if (sellSide === "short" && toS >= fromS)
                        nextSellErr = `Error: Sell "To" must be < "From".`;
                }
            } else {
                // Fallback: hardcoded validation
                if (sellSide === "long") {
                    if (fromS > markPlus50Pct) nextSellErr = `Error: Long "From" max: ${pretty(markPlus50Pct)} (mark + 50%).`;
                    else if (fromS <= mark) nextSellErr = `Error: For long, "From" must be > mark (${pretty(mark)}).`;
                    else if (toS !== undefined && fromS >= toS) nextSellErr = `Error: For long, "To" must be > "From".`;
                    else if (toS !== undefined && toS >= twoX) nextSellErr = `Error: For long, "To" must be < ${pretty(twoX)} (2× mark).`;
                } else {
                    if (fromS < markMinus50Pct) nextSellErr = `Error: Short "From" min: ${pretty(markMinus50Pct)} (mark - 50%).`;
                    else if (fromS >= mark) nextSellErr = `Error: For short, "From" must be < mark (${pretty(mark)}).`;
                    else if (toS !== undefined && fromS <= toS) nextSellErr = `Error: For short, "To" must be < "From".`;
                    else if (toS !== undefined && toS <= 0) nextSellErr = `Error: For short, "To" must be > 0.`;
                }
            }
        }
        setSellPriceError((p) => (p === nextSellErr ? p : nextSellErr));

        /* ---------------- BUY side ----------------- */
        const fromB = toAbs(buyPriceFrom, buySide);
        const toB = toAbs(buyPriceTo, buySide);
        let nextBuyErr = "";

        if (fromB !== undefined) {
            if (sb) {
                // API-driven validation for buy "From" (inner)
                if (fromB < sb.bought.inner.min_usd)
                    nextBuyErr = boundMsg("Buy", "From", "min", sb.bought.inner, buySide);
                else if (fromB > sb.bought.inner.max_usd)
                    nextBuyErr = boundMsg("Buy", "From", "max", sb.bought.inner, buySide);
                // API-driven validation for buy "To" (outer), 0 = barrier only
                if (!sb.bought.outer_optional && (toB === undefined || toB === 0)) {
                    nextBuyErr = `Error: Buy "To" must be provided.`;
                } else if (toB !== undefined && toB !== 0) {
                    if (toB < sb.bought.outer.min_usd)
                        nextBuyErr = boundMsg("Buy", "To", "min", sb.bought.outer, buySide);
                    else if (toB > sb.bought.outer.max_usd)
                        nextBuyErr = boundMsg("Buy", "To", "max", sb.bought.outer, buySide);
                    // Cross-field: bought put (buySide="short") → outer abs < inner abs
                    else if (buySide === "short" && toB >= fromB)
                        nextBuyErr = `Error: Buy "To" must be further from spot than "From".`;
                    // Cross-field: bought call (buySide="long") → outer abs > inner abs
                    else if (buySide === "long" && toB <= fromB)
                        nextBuyErr = `Error: Buy "To" must be further from spot than "From".`;
                }
            } else {
                // Fallback: hardcoded validation
                if (buySide === "long") {
                    if (fromB > markPlus50Pct) nextBuyErr = `Error: Long "From" max: ${pretty(markPlus50Pct)} (mark + 50%).`;
                    else if (fromB <= mark) nextBuyErr = `Error: For long, "From" must be > mark (${pretty(mark)}).`;
                    else if (toB !== undefined && fromB >= toB) nextBuyErr = `Error: For long, "To" must be > "From".`;
                    else if (toB !== undefined && toB >= twoX) nextBuyErr = `Error: For long, "To" must be < ${pretty(twoX)} (2× mark).`;
                } else {
                    if (fromB < markMinus50Pct) nextBuyErr = `Error: Short "From" min: ${pretty(markMinus50Pct)} (mark - 50%).`;
                    else if (fromB >= mark) nextBuyErr = `Error: For short, "From" must be < mark (${pretty(mark)}).`;
                    else if (toB !== undefined && fromB <= toB) nextBuyErr = `Error: For short, "To" must be < "From".`;
                    else if (toB !== undefined && toB <= 0) nextBuyErr = `Error: For short, "To" must be > 0.`;
                }
            }
        }
        setBuyPriceError((p) => (p === nextBuyErr ? p : nextBuyErr));

        if ((!sellPriceFrom || sellPriceFrom.trim() === "") || (!buyPriceFrom || buyPriceFrom.trim() === "")) {
            setFromBoundsError("Error: Enter a 'From' price for Sell or Buy.");
        } else {
            setFromBoundsError((p) => (p === "" ? p : ""));
        }
    }, [
        sellPriceFrom,
        sellPriceTo,
        buyPriceFrom,
        buyPriceTo,
        sellMarket,
        buyMarket,
        currentMarkPrice,
        isPercentageMode,
        sellSide,
        buySide,
        strikeBounds
    ]);


    useEffect(() => {
        const n = Number(sellAmount);
        let nextErr = "";
        if (sellAmount === "") {
            setBuyAmount("");
            setDepthError("");
        }
        if (sellAmount && (!Number.isFinite(n) || n <= 0)) {
            nextErr = "Error: Enter a valid quantity.";
            setBuyAmount("");
        } else if (sellAmount && n > sellMaxQty) {
            nextErr = `Error: Max available is ${pretty(sellMaxQty, 6)} BTC.`;
        }
        setSellQtyError((prev) => (prev === nextErr ? prev : nextErr));
    }, [sellAmount, sellMaxQty, setBuyAmount]);


    const hasPriceInputErrors = !!sellPriceError || !!buyPriceError || !!fromBoundsError;

    // Book depth (max_fillable): amount vs. what the current band shape can actually
    // fill. Deliberately excluded from hasPriceInputErrors so a quote still fires and
    // can return an updated max_fillable / rejection reason for an over-sized amount.
    const exceedsDepth = maxFillable !== undefined && !!sellAmount && Number(sellAmount) > maxFillable;

    const hasPriceErrors = !!sellPriceError || !!buyPriceError || !!sellQtyError || !!fromBoundsError || exceedsDepth || !!depthError;

    // Helper functions to detect which field has an error
    // Check for patterns that indicate which field is the subject of the error
    const hasSellFromError = useMemo(() => {
        if (!sellPriceError) return false;
        // If "To" must be is present (using regex to match any quote style), it's a "To" error, not "From"
        if (/[""\u201C]To[""\u201D] must be/.test(sellPriceError)) return false;
        // Check if "From" is the subject: "From" must be, "From" max, "From" min (using regex for flexible quote matching)
        return /[""\u201C]From[""\u201D] must be/.test(sellPriceError) ||
            /[""\u201C]From[""\u201D] max/.test(sellPriceError) ||
            /[""\u201C]From[""\u201D] min/.test(sellPriceError) ||
            (/[""\u201C]From[""\u201D]/.test(sellPriceError) && !/[""\u201C]To[""\u201D]/.test(sellPriceError));
    }, [sellPriceError]);

    const hasSellToError = useMemo(() => {
        if (!sellPriceError) return false;
        // Check if "To" is the subject: "To" must be
        // Match pattern: quote + "To" + quote + " must be" (handles curly quotes " and straight quotes ")
        return /[""\u201C]To[""\u201D] must be/.test(sellPriceError);
    }, [sellPriceError]);

    const hasBuyFromError = useMemo(() => {
        if (!buyPriceError) return false;
        // If "To" must be is present (using regex to match any quote style), it's a "To" error, not "From"
        if (/[""\u201C]To[""\u201D] must be/.test(buyPriceError)) return false;
        // Check if "From" is the subject: "From" must be, "From" max, "From" min (using regex for flexible quote matching)
        return /[""\u201C]From[""\u201D] must be/.test(buyPriceError) ||
            /[""\u201C]From[""\u201D] max/.test(buyPriceError) ||
            /[""\u201C]From[""\u201D] min/.test(buyPriceError) ||
            (/[""\u201C]From[""\u201D]/.test(buyPriceError) && !/[""\u201C]To[""\u201D]/.test(buyPriceError));
    }, [buyPriceError]);

    const hasBuyToError = useMemo(() => {
        if (!buyPriceError) return false;
        // Check if "To" is the subject: "To" must be
        // Match pattern: quote + "To" + quote + " must be" (handles curly quotes " and straight quotes ")
        return /[""\u201C]To[""\u201D] must be/.test(buyPriceError);
    }, [buyPriceError]);

    const handleSellFromBlur = () => {
        if (!strikeBounds) return;
        if (hasSellFromError || !sellPriceFrom) {
            setSellPriceFrom(toDisplay(strikeBounds.sold_defaults.inner_usd, sellSide));
        }
    };

    const handleSellToBlur = () => {
        if (!strikeBounds) return;
        if (hasSellToError || (!sellPriceTo && !strikeBounds.sold.outer_optional)) {
            setSellPriceTo(toDisplay(strikeBounds.sold_defaults.outer_usd, sellSide));
        }
    };

    const handleBuyFromBlur = () => {
        if (!strikeBounds) return;
        if (hasBuyFromError || !buyPriceFrom) {
            setBuyPriceFrom(toDisplay(strikeBounds.bought_defaults.inner_usd, buySide));
        }
    };

    const handleBuyToBlur = () => {
        if (!strikeBounds) return;
        if (hasBuyToError || (!buyPriceTo && !strikeBounds.bought.outer_optional)) {
            setBuyPriceTo(toDisplay(strikeBounds.bought_defaults.outer_usd, buySide));
        }
    };

    const canSubmit =
        !apiBusy && !hasPriceErrors && backendHealthy && (!isPercentageMode || !!Number(currentMarkPrice));

    /* ---------------- Absolute band values for charts ----- */
    const bandValues = useMemo(() => {
        const mark = Number(currentMarkPrice);
        if (!Number.isFinite(mark) || mark <= 0) {
            return { finalSellFrom: undefined, finalSellTo: undefined, finalBuyFrom: undefined, finalBuyTo: undefined };
        }
        const sSide: "long" | "short" = isLongSide(sellMarket) ? "long" : "short";
        const bSide: "long" | "short" = isLongSide(buyMarket) ? "long" : "short";
        const toAbs = (raw: string, side: "long" | "short") =>
            raw ? (isPercentageMode ? percentToAbsolute(Number(raw), mark, side) : Number(raw)) : undefined;

        return {
            finalSellFrom: toAbs(sellPriceFrom, sSide),
            finalSellTo: toAbs(sellPriceTo, sSide),
            finalBuyFrom: toAbs(buyPriceFrom, bSide),
            finalBuyTo: toAbs(buyPriceTo, bSide),
        };
    }, [sellPriceFrom, sellPriceTo, buyPriceFrom, buyPriceTo, sellMarket, buyMarket, isPercentageMode, currentMarkPrice]);

    useEffect(() => {
        setBandValues(bandValues);
    }, [bandValues, setBandValues]);


    useEffect(() => {
        if (!triggerTransaction || !sellAmount || !sellPriceFrom || !buyPriceFrom) {
            setTriggerTransaction(false);
            return;
        }

        if (hasPriceInputErrors) {
            setTriggerTransaction(false);
            return;
        }

        const currentRequestId = ++requestIdRef.current;

        const mark = Number(markPriceRef.current);
        const walletAddress = address ?? "abcdefaultwallet";
        const sSide: "long" | "short" = isLongSide(sellMarket) ? "long" : "short";
        const bSide: "long" | "short" = isLongSide(buyMarket) ? "long" : "short";

        const toAbs = (raw: string | undefined | null, side: "long" | "short") => {
            if (!raw || String(raw).trim() === "") return 0;
            const n = Number(raw);
            if (!Number.isFinite(n)) return 0;
            return isPercentageMode ? percentToAbsolute(n, mark, side) : n;
        };

        (async () => {
            setApiBusy(true);
            try {
                let stikeLowerSell = Math.round(toAbs(sellPriceFrom, sSide));
                let stikeUpperSell = Math.round(toAbs(sellPriceTo, sSide)) || 0;
                let strikeLowerBuy = Math.round(toAbs(buyPriceFrom, bSide));
                let stikeUpperBuy = Math.round(toAbs(buyPriceTo, bSide)) || 0;

                // Clamp to API bounds when available
                if (strikeBounds) {
                    const { sold, bought } = strikeBounds;
                    stikeLowerSell = clamp(stikeLowerSell, sold.inner.min_usd, sold.inner.max_usd);
                    stikeUpperSell = stikeUpperSell === 0 ? 0 : clamp(stikeUpperSell, sold.outer.min_usd, sold.outer.max_usd);
                    strikeLowerBuy = clamp(strikeLowerBuy, bought.inner.min_usd, bought.inner.max_usd);
                    stikeUpperBuy = stikeUpperBuy === 0 ? 0 : clamp(stikeUpperBuy, bought.outer.min_usd, bought.outer.max_usd);
                }

                const response = await sendSellTransactionAction({
                    type: "sell",
                    PerpType: sSide,
                    amount: Number(sellAmount),
                    StikeLowerBoundSell: stikeLowerSell,
                    StikeUpperBoundSell: stikeUpperSell,
                    StrikeLowerBoundBuy: strikeLowerBuy,
                    StikeUpperBoundBuy: stikeUpperBuy,
                    WalletAddress: walletAddress,
                    IsTransactionDone: false,
                });

                // Ignore stale responses from earlier requests.
                if (currentRequestId !== requestIdRef.current) return;

                if (response.success && typeof response.amount !== "undefined") {
                    setBuyAmount(String(response.total_amount));
                    setSlippage(response.slippage ?? 0);
                    setTxFees(response.fees ?? 0);
                    if (response.after_curve) {
                        setOverlayCurve(mergeAfterCurve(response.after_curve), "trade-impact");
                    }
                    setDepthError("");
                } else {
                    // Dry-run rejected (e.g. insufficient book depth) — surface the
                    // backend's reason inline instead of doing nothing (v2 trade-bands
                    // depth ticket item 3). No toast: same slot as the MAX affordance.
                    setDepthError(response.message || "Quote unavailable for this size — try a smaller amount.");
                }
                // Present on newer backends alongside after_curve/slippage; absent on
                // older ones leaves maxFillable untouched, which keeps the affordance hidden.
                if (typeof response.max_fillable === "number" && Number.isFinite(response.max_fillable)) {
                    setMaxFillable(response.max_fillable);
                }
            } catch (err) {
                console.error("Transaction failed:", err);
            } finally {
                // Only the latest request can clear busy state.
                if (currentRequestId === requestIdRef.current) {
                    setTriggerTransaction(false);
                    setApiBusy(false);
                }
            }
        })();
    }, [
        triggerTransaction,
        address,
        sellAmount,
        sellPriceFrom,
        sellPriceTo,
        buyPriceFrom,
        buyPriceTo,
        setBuyAmount,
        setSlippage,
        setTxFees,
        setOverlayCurve,
        setTriggerTransaction,
        hasPriceInputErrors,
        sellMarket,
        buyMarket,
        isPercentageMode,
    ]);

    // Trade-impact overlay clears on empty amount or leaving the trade-bands tab
    // (v2 item 22). The overlay is set only above, inside the requestId-guarded
    // quote effect, so it always reflects the latest in-flight quote. Guarded on
    // overlayKind: this component is force-mounted on every tab, and an unguarded
    // clear wiped the earn console's 'lp-preview' curve on each tab switch.
    useEffect(() => {
        if ((!sellAmount || activeTab !== "trade-bands") && overlayKind === "trade-impact") {
            clearOverlay();
        }
    }, [sellAmount, activeTab, overlayKind, clearOverlay]);

    const sellFromPH = isPercentageMode ? "From - % " : "From -";
    const sellToPH = isPercentageMode
        ? (strikeBounds?.sold.outer_optional === false ? "To - % (Req)" : "To - % (Opt)")
        : (strikeBounds?.sold.outer_optional === false ? "To - (Req)" : "To - (Opt)");

    const buyFromPH = isPercentageMode ? "From - % " : "From -";
    const buyToPH = isPercentageMode
        ? (strikeBounds?.bought.outer_optional === false ? "To - % (Req)" : "To - % (Opt)")
        : (strikeBounds?.bought.outer_optional === false ? "To - (Req)" : "To - (Opt)");

    const refreshAvailable = useCallback(async () => {
        const w = address;
        if (!w) { setAvail({ long: 0, short: 0 }); return; }
        setAvailLoading(true);
        try {
            const q = await getPerpQuantitiesAction(w);
            console.log("Available quantities:", q);
            setAvail(q);
        } catch (error) {
            console.error("Failed to fetch perp quantities:", error);
            setAvail({ long: 0, short: 0 });
        } finally {
            setAvailLoading(false);
        }
    }, [address]);

    useEffect(() => {
        if (activeTab === "trade-bands") {
            void refreshAvailable();
        }
    }, [refreshAvailable, activeTab]);

    // keep exactly what the user types (incl. "0." / "0.0") and collapse extra dots
    function cleanDecimalInput(raw: string) {
        let s = raw.replace(/[^\d.]/g, "");
        const i = s.indexOf(".");
        if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "");
        if (s.startsWith(".")) s = "0" + s; // ".5" -> "0.5"
        return s;
    }

    const handleSellAmountChange = (raw: string) => {
        const next = cleanDecimalInput(raw);
        if (next === "") { setSellAmount(""); return; }
        setSellAmount(next);
    };

    const handleSellAmountBlur = () => {
        if (!sellAmount) return;
        const num = Number(sellAmount);
        if (!Number.isFinite(num)) { setSellAmount(""); return; }
    };


    return (
        <div className="p-3 bg-[#0E1B1E] w-full h-full flex flex-col">

            <div className="mt-2 grid grid-cols-1 gap-0 content-start">

                {/* ---------------------------------------------- Sell Box ----------------------------------------------  */}
                <Card id="tour1-step3-sell-box" className="m-0 px-1 pb-1 pt-0 gap-0 w-full rounded-sm border border-[#B9B9B9] shadow-[#935A71] bg-[#1A1B1D] text-xs">

                    {/* Top ribbon */}
                    <div className="p-1 flex justify-between">

                        <span className={` font-medium text-2xs tracking-widest text-white ${ibmPlexMono.className}`}>
                            SELL&nbsp;PROFITS&nbsp;ON
                        </span>

                        <div>
                            {(() => {
                                const clickedMaxQty = Math.max(0, sellMaxQty - 0.00001);
                                const sellPretty = sellAmount ? pretty(Number(sellAmount), 6) : "";
                                const isMaxApplied =
                                    !!sellPretty &&
                                    (sellPretty === pretty(sellMaxQty, 6) ||
                                        sellPretty === pretty(clickedMaxQty, 6));

                                return (
                                    <MaxChip
                                        qty={sellMaxQty}
                                        variant="sell"
                                        active={isMaxApplied}
                                        disabled={availLoading}
                                        onClick={() => {
                                            if (sellMaxQty > 0.00001) {
                                                setSellAmount(pretty(sellMaxQty - 0.00001, 6));
                                            }
                                        }} />
                                );
                            })()}

                            {/* Book-depth MAX: only once a dry-run has actually returned max_fillable
                                for the current strikes (v2 trade-bands depth ticket, item 1/4). */}
                            {maxFillable !== undefined && (() => {
                                const clickedDepthQty = Math.max(0, maxFillable - 0.00001);
                                const sellPretty = sellAmount ? pretty(Number(sellAmount), 6) : "";
                                const isDepthMaxApplied =
                                    !!sellPretty &&
                                    (sellPretty === pretty(maxFillable, 6) ||
                                        sellPretty === pretty(clickedDepthQty, 6));

                                return (
                                    <MaxChip
                                        qty={maxFillable}
                                        variant="sell"
                                        approx
                                        active={isDepthMaxApplied}
                                        title={`Book depth for these strikes: ${pretty(maxFillable, 6)} BTC`}
                                        onClick={() => {
                                            if (maxFillable > 0.00001) {
                                                setSellAmount(pretty(maxFillable - 0.00001, 6));
                                            }
                                        }} />
                                );
                            })()}

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
                                            I am: SELLING the payoff on &lt;quantity&gt; of my &lt;long / short&gt;&nbsp;
                                            &lt;asset&gt; perp between &lt;price bound&gt; and &lt;price bound&gt;
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Row 1 */}
                    <div id="tour1-step4-sell-qty" className="grid grid-cols-[minmax(100px,auto)_minmax(60px,1fr)_minmax(120px,auto)] items-center bg-[#222223] border border-[#935A71] rounded-t-sm">
                        {/* Label */}
                        <div className="flex items-center justify-center m-0 py-3 bg-[#523C4C] border-r border-[#75674F] rounded-tl-sm">
                            <span className="font-normal text-2xs tracking-widest text-[#E4E4E4]">
                                QUANTITY
                            </span>
                        </div>

                        {/* Profit input */}
                        <div className="flex items-center justify-center  px-0">
                            <Input
                                type="text"
                                inputMode="decimal"
                                value={sellAmount}
                                onChange={(e) => handleSellAmountChange(e.target.value)}
                                onBlur={handleSellAmountBlur}
                                placeholder="------"
                                className={`m-0 p-0 h-8 w-full border-0 bg-transparent text-center placeholder:text-gray-400 focus-visible:ring-0 ${sellQtyError ? "text-[#FFAE67]" : "text-white"}`}
                            />


                        </div>

                        {/* Dropdown */}
                        <div className="flex items-center justify-end px-2">
                            <Select
                                value={sellMarket}
                                onValueChange={(val: string) => setSellMarket(val)}
                            >
                                <SelectTrigger className="!h-5 !min-h-[26px] !py-1 px-2 text-2xs w-full justify-between font-light border border-[#FF6767] bg-transparent text-left text-[#FF6767] placeholder:text-gray-400 focus:ring-0 [&_svg]:!size-4 [&_svg]:!pr-0 [&_svg]:text-[#FF6767]">
                                    <SelectValue placeholder="Market" />
                                </SelectTrigger>

                                <SelectContent className="bg-[#3B3B3B] text-coffee text-2xs">
                                    {marketOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div id="tour1-step5-sell-price" className="grid grid-cols-[minmax(100px,auto)_minmax(90px,auto)_minmax(90,auto)_minmax(80,auto)] lg:grid-cols-[minmax(100px,auto)_minmax(110px,auto)_minmax(125,auto)_minmax(85,auto)]  items-center  bg-[#222223] border border-t-0 border-[#935A71] rounded-b-sm">
                        {/* Label */}
                        <div className="flex items-center justify-center m-0 py-3 bg-[#523C4C] border-r border-[#935A71] rounded-bl-sm">
                            <span className="font-normal text-2xs tracking-widest text-[#E4E4E4]">
                                {`PRICE${isPercentageMode && sellSide === "short" ? " (-VE)" : ""}`}
                            </span>
                        </div>

                        {/* From price input */}
                        <div className="flex items-center justify-center px-0 m-0">
                            <Input
                                type="number"
                                value={sellPriceFrom}
                                inputMode="decimal"
                                step="any"
                                onChange={(e) => setSellPriceFrom(parseNumberInput(e.target.value, isPercentageMode))}
                                onBlur={handleSellFromBlur}
                                placeholder={sellFromPH}
                                className={`h-8 rounded-none border-0 border-r border-[#B4C9CF80] bg-transparent text-center placeholder:text-coffee placeholder:font-light placeholder:text-2xs focus-visible:ring-0 ${hasSellFromError ? "text-[#FFAE67]" : "text-white"}`}
                            />
                        </div>

                        {/* To price input */}
                        <div className="flex items-center justify-center px-0">
                            <Input
                                type="number"
                                value={sellPriceTo}
                                inputMode="decimal"
                                step="any"
                                onChange={(e) => setSellPriceTo(parseNumberInput(e.target.value, isPercentageMode))}
                                onBlur={handleSellToBlur}
                                placeholder={sellToPH}
                                className={`h-8 border-0 bg-transparent text-center placeholder:text-coffee placeholder:font-light placeholder:text-2xs focus-visible:ring-0 ${hasSellToError ? "text-[#FFAE67]" : "text-white"}`}
                            />
                        </div>

                        <div className="flex items-center justify-center">
                            <ToggleSwitch isPercentageMode={isPercentageMode} onToggle={() => setIsPercentageMode(!isPercentageMode)} />
                        </div>

                    </div>
                    {sellPriceError && (
                        <p className="px-2 pt-1 font-normal text-2xs text-[#FFAE67] flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-[#FFAE67]" />
                            <span className="italic">{sellPriceError}</span>
                        </p>
                    )}
                    {sellQtyError && (
                        <p className="px-2 pt-1 font-normal text-2xs text-[#FFAE67] flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-[#FFAE67]" />
                            <span className="italic">{sellQtyError}</span>
                        </p>
                    )}
                    {/* Book-depth slot: a dry-run rejection reason takes priority over the
                        plain exceeds-depth warning (item 2/3 of the depth ticket). */}
                    {depthError ? (
                        <p className="px-2 pt-1 font-normal text-2xs text-[#FFAE67] flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-[#FFAE67]" />
                            <span className="italic">{depthError}</span>
                        </p>
                    ) : exceedsDepth && (
                        <p className="px-2 pt-1 font-normal text-2xs text-[#FFAE67] flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-[#FFAE67]" />
                            <span className="italic">Error: exceeds book depth — max {pretty(maxFillable as number, 2)} BTC.</span>
                        </p>
                    )}


                </Card>

                {/* ---------------------------------------------- Switcher Icon ----------------------------------------------  */}
                <div className="flex justify-center items-center relative">
                    <Image
                        src={"/switcheroo.svg"}
                        alt="Switch Icon"
                        width={24}
                        height={24}
                        className={`-mt-2.5 -mb-5 -mr-4`}
                        aria-hidden="true"
                    />
                </div>

                {/* ---------------------------------------------- Buy Box ----------------------------------------------  */}
                <Card id="tour1-step7-buy-box" className="m-0 mt-2 px-1 pb-1 pt-0 gap-0 w-full rounded-sm border border-[#B9B9B9] shadow-[#40517E] bg-[#1A1B1D] text-xs">
                    {/* Top ribbon */}

                    <div className="p-1 flex justify-between">

                        <span className={` font-medium text-2xs tracking-widest text-white ${ibmPlexMono.className}`}>
                            BUY&nbsp;PROFITS&nbsp;ON
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
                                        I am: BUYING the payoff on &lt;quantity&gt; of a &lt;short / long&gt; &lt;asset&gt; perp between
                                        &lt;price bound&gt; and &lt;price bound&gt;{isPercentageMode ? " (bounds in % of mark)" : ""}.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Row 1 */}
                    <div id="tour1-step9-buy-qty" className="grid grid-cols-[minmax(100px,auto)_minmax(60px,1fr)_minmax(85px,auto)] rounded-t-sm items-center bg-[#222223] border border-[#40517E]">
                        {/* Label */}
                        <div className="flex items-center justify-center m-0 py-3 bg-[#212A41] border-r border-[#40517E] rounded-tl-sm">
                            <span className="font-normal text-2xs tracking-widest text-[#E4E4E4]">
                                QUANTITY
                            </span>
                        </div>

                        {/* Profit amount – output */}
                        <div className="flex items-center justify-center px-0">
                            <span className={`h-5 w-full text-center text-xs text-white ${apiBusy ? "animate-pulse" : ""}`}>
                                {!buyAmount ? (
                                    <span className="text-[#677275]">------</span>
                                ) : (
                                    <NumberFlow
                                        value={Math.abs(Number(buyAmount))}
                                        format={{
                                            minimumFractionDigits: 6,
                                            maximumFractionDigits: 6,
                                        }}
                                        locales="en-US"
                                    />
                                )}
                            </span>
                        </div>

                        {/* Market – output */}
                        <BuyMarketDisplay buyMarket={buyMarket} />

                    </div>


                    {/* Row 2 */}
                    <div id="tour1-step8-buy-price" className="grid grid-cols-[minmax(100px,auto)_minmax(90px,auto)_minmax(90,auto)_minmax(80,auto)] lg:grid-cols-[minmax(100px,auto)_minmax(110px,auto)_minmax(125,auto)_minmax(85,auto)]  items-center  bg-[#222223] border border-t-0 border-[#40517E] rounded-b-sm">
                        {/* Label */}
                        <div className="flex items-center justify-center m-0 py-3 bg-[#212A41] border-r border-[#40517E] rounded-bl-sm">
                            <span className="font-normal text-2xs tracking-widest text-[#E4E4E4]">
                                {`PRICE${isPercentageMode && buySide === "short" ? " (-VE)" : ""}`}
                            </span>
                        </div>

                        {/* From price input */}
                        <div className="flex items-center justify-center px-0 m-0">
                            <Input
                                type="number"
                                value={buyPriceFrom}
                                onChange={(e) => setBuyPriceFrom(parseNumberInput(e.target.value, isPercentageMode))}
                                onBlur={handleBuyFromBlur}
                                placeholder={buyFromPH}
                                className={`h-8 rounded-none border-0 border-r border-[#B4C9CF80] bg-transparent text-center placeholder:text-coffee placeholder:font-light placeholder:text-2xs focus-visible:ring-0 ${hasBuyFromError ? "text-[#FFAE67]" : "text-white"}`}
                            />
                        </div>

                        {/* To price input */}
                        <div className="flex items-center justify-center px-0">
                            <Input
                                type="number"
                                value={buyPriceTo}
                                onChange={(e) => setBuyPriceTo(parseNumberInput(e.target.value, isPercentageMode))}
                                onBlur={handleBuyToBlur}
                                placeholder={buyToPH}
                                className={`h-8 border-0 bg-transparent text-center placeholder:text-coffee placeholder:font-light placeholder:text-2xs focus-visible:ring-0 ${hasBuyToError ? "text-[#FFAE67]" : "text-white"}`}
                            />
                        </div>

                        <div className="flex items-center justify-center">
                            <ToggleSwitch isPercentageMode={isPercentageMode} onToggle={() => setIsPercentageMode(!isPercentageMode)} />
                        </div>

                    </div>
                    {buyPriceError && (
                        <p className="px-2 pt-1 font-normal text-2xs text-[#FFAE67] flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-[#FFAE67]" />
                            <span className="italic">{buyPriceError}</span>
                        </p>
                    )}

                </Card>

                {/* ---------------------------------------------- Deposit Box ----------------------------------------------  */}
                {/* <Card className="m-0 mt-4 p-0 gap-0 w-full rounded-lg border border-[#B4C9CF80] shadow-[#B4C9CF80] bg-[#0F121580] text-xs">
                    <div className="grid grid-cols-[80px_auto_1fr] items-center">
                        <div className="flex items-center justify-center rounded-l-lg bg-[#3B3B3B] py-4 px-2">
                            <span className="tracking-wider text-white">DEPOSIT</span>
                        </div>

                        <DepositMarketDisplay sellMarket={sellMarket} />

                        <div className="flex items-center justify-end gap-2 pr-4">
                            <span className="text-center text-white text-sm">
                                {sellAmount === "" ? "---" : sellAmount}
                            </span>
                            <span className="font-medium text-amber-500/80 text-sm">BTC Notional</span>
                        </div>
                    </div>
                </Card> */}

                {/* ---------------------------------------------- Info Box ----------------------------------------------  */}
                <Card id="tour1-step10-info-box" className="mt-4 p-2.5 rounded-lg bg-[#0F121580] border border-[#D1D1D1] shadow-[#B4C9CF80]">
                    {slippageLoading ? (
                        <div>
                            <Skeleton className="h-4 mb-2 w-full bg-gray-800" /> {/* Slippage */}
                            <Skeleton className="h-4 w-full bg-gray-800" /> {/* Tx Fees */}
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between pb-3 items-center border-b border-[#677275]">
                                {/* Label */}
                                <div className="flex font-light text-2xs mt-1 text-[#E5E5E5]">
                                    <span className="pr-2">Deposit: </span>

                                    {/* Market – output */}
                                    <DepositMarketDisplay sellMarket={sellMarket} />
                                </div>


                                {/* Notional Amount – output */}
                                <div className="flex items-center justify-end ">
                                    <span className="text-center text-white text-2xs pr-2">
                                        <NumberFlow format={{
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 7,
                                        }} value={Number(sellAmount)} />
                                    </span>
                                    <span className="font-medium text-white text-2xs">BTC Notional</span>
                                </div>
                            </div>

                            <div className="py-4 flex justify-between font-light text-2xs text-[#E5E5E5]">
                                <span>
                                    Slippage %
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <InformationCircleIcon className="h-5 w-5 mx-2 -my-1" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right" align="center" className={`max-w-md ${ibmPlexMono.className}`}>
                                                <p>Price impact when trading against liquidity pool. Larger trades &rarr;
                                                    more slippage due to limited depth, reduces realized value vs. initial quote.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>


                                </span>
                                <span className="text-white text-2xs font-semibold">
                                    <NumberFlow
                                        value={Math.abs(Number(slippage * 100))}
                                        format={{
                                            minimumFractionDigits: 6,
                                            maximumFractionDigits: 6,
                                        }}
                                        locales="en-US"
                                    /> %</span>
                            </div>
                            <div className="flex justify-between font-light text-2xs text-[#E5E5E5]">
                                <span>
                                    Tx Fees %
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <InformationCircleIcon className="h-5 w-5 mx-2 -my-1" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right" align="center" className={`max-w-md ${ibmPlexMono.className}`}>
                                                <p>Alternative way of expressing the combined effect of LP bid-ask spreads across both legs,
                                                    on a present value basis ∴ effective long exposure received &lt; than the shorted notional.</p>

                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </span>
                                <span className="text-white text-2xs font-semibold">
                                    <NumberFlow
                                        value={Math.abs(Number(txFees * 100))}
                                        format={{
                                            minimumFractionDigits: 6,
                                            maximumFractionDigits: 6,
                                        }}
                                        locales="en-US"
                                    /> %</span>
                            </div>
                        </div>
                    )}
                </Card>

                {/* ---------------------------------------------- Transaction Button ----------------------------------------------  */}
                <div id="tour1-step11-transact-button" className="flex items-center justify-center mt-8 md:mt-4">
                    <Button
                        className="w-full md:w-1/2"
                        disabled={!canSubmit}
                        onClick={async () => {
                            if (apiBusy) return;

                            // if (!isConnected) {
                            //     toast.error("Please connect your wallet first");
                            //     return;
                            // }

                            const mark = Number(currentMarkPrice);
                            const sSide: "long" | "short" = isLongSide(sellMarket) ? "long" : "short";
                            const bSide: "long" | "short" = isLongSide(buyMarket) ? "long" : "short";

                            const toAbs = (raw: string | undefined | null, side: "long" | "short") => {
                                if (!raw || String(raw).trim() === "") return 0;
                                const n = Number(raw);
                                if (!Number.isFinite(n)) return 0;
                                return isPercentageMode ? percentToAbsolute(n, mark, side) : n;
                            };

                            const walletAddress = address ?? "abcdefaultwallet";

                            let stikeLowerSell = Math.round(toAbs(sellPriceFrom, sSide));
                            let stikeUpperSell = Math.round(toAbs(sellPriceTo, sSide)) || 0;
                            let strikeLowerBuy = Math.round(toAbs(buyPriceFrom, bSide));
                            let stikeUpperBuy = Math.round(toAbs(buyPriceTo, bSide)) || 0;

                            // Clamp to API bounds when available
                            if (strikeBounds) {
                                const { sold, bought } = strikeBounds;
                                stikeLowerSell = clamp(stikeLowerSell, sold.inner.min_usd, sold.inner.max_usd);
                                stikeUpperSell = stikeUpperSell === 0 ? 0 : clamp(stikeUpperSell, sold.outer.min_usd, sold.outer.max_usd);
                                strikeLowerBuy = clamp(strikeLowerBuy, bought.inner.min_usd, bought.inner.max_usd);
                                stikeUpperBuy = stikeUpperBuy === 0 ? 0 : clamp(stikeUpperBuy, bought.outer.min_usd, bought.outer.max_usd);
                            }

                            // Cross-field validation (direction depends on wing type)
                            // Sell call (long): outer > inner; Sell put (short): outer < inner
                            if (stikeUpperSell > 0) {
                                const sellInvalid = sSide === "long"
                                    ? stikeUpperSell <= stikeLowerSell
                                    : stikeUpperSell >= stikeLowerSell;
                                if (sellInvalid) {
                                    toast.error("Sell 'To' must be further from spot than sell 'From'.");
                                    return;
                                }
                            }
                            // Buy put (short): outer < inner; Buy call (long): outer > inner
                            if (stikeUpperBuy > 0) {
                                const buyInvalid = bSide === "short"
                                    ? stikeUpperBuy >= strikeLowerBuy
                                    : stikeUpperBuy <= strikeLowerBuy;
                                if (buyInvalid) {
                                    toast.error("Buy 'To' must be further from spot than buy 'From'.");
                                    return;
                                }
                            }

                            const payload = {
                                type: "sell" as const,
                                PerpType: sSide,
                                amount: Number(sellAmount),
                                StikeLowerBoundSell: stikeLowerSell,
                                StikeUpperBoundSell: stikeUpperSell,
                                StrikeLowerBoundBuy: strikeLowerBuy,
                                StikeUpperBoundBuy: stikeUpperBuy,
                                WalletAddress: String(walletAddress),
                                IsTransactionDone: true,
                            };

                            console.log("Manual Transaction Payload:", payload);

                            setApiBusy(true);
                            try {
                                const response = await sendSellTransactionAction(payload);
                                console.log("Manual Transaction Response:", response);

                                if (response.success && typeof response.amount !== "undefined") {
                                    setBuyAmount(String(response.total_amount));
                                    setSlippage(response.slippage ?? 0);
                                    setTxFees(response.fees ?? 0);
                                    setDepthError("");
                                    toast.success("Transaction completed");
                                    // loadMarketGraphData('BTC-PERP', resolution);
                                    // Graph data will be updated automatically via WebSocket
                                } else {
                                    // e.g. book depth moved between the last dry-run and submit.
                                    setDepthError(response.message || "Transaction rejected — try a smaller amount.");
                                }
                                if (typeof response.max_fillable === "number" && Number.isFinite(response.max_fillable)) {
                                    setMaxFillable(response.max_fillable);
                                }
                            } catch (err) {
                                console.error("Manual transaction failed:", err);
                            } finally {
                                setApiBusy(false);
                                await refreshAvailable();
                            }
                        }}
                    >
                        {/* <span className="text-white font-semibold">
                            {triggerTransaction ? "........" : "Transact"}
                        </span> */}
                        <SplitTextTransact triggerTransaction={apiBusy} />
                    </Button>

                </div>

                <div className="flex mx-auto">
                    {!backendHealthy && (
                        <p className="mt-2 text-xs text-gray-400">
                            Backend is currently unreachable.
                        </p>
                    )}
                </div>



            </div>

        </div>
    )
}
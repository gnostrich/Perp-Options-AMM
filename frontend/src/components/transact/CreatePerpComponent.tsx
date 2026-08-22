"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "../ui/card"
import LeverageSlider from "./MiniComponents/LevSlider"
import { ibmPlexMono } from "@/lib/font"
import { Checkbox } from "../ui/checkbox"
import { symbolOptions, usePerpStore } from "@/store/perpStore"
import NumberFlow from "@number-flow/react"
import { useGraphStore } from "@/store/graphStore"
import { useTradeStore } from "@/store/tradeStore"
import TransferAndPerpButton from "./MiniComponents/TransferAndPerpButton"
import { Input } from "../ui/input"
import { useAccount } from "@/lib/hooks/useAccount";
import { toast } from "sonner"
import BalanceChip from "./MiniComponents/BalanceChip"
import Image from "next/image"
import { Lock, Shield, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { fetchUserFeesAction } from "@/app/actions/fetchUserFeesAction"
import { checkBackendHealthAction } from "@/app/actions/checkBackendHealthAction"

// const CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? 'devnet';
// const explorerUrl = (sig: string) =>
//   `https://explorer.solana.com/tx/${sig}${CLUSTER === 'mainnet-beta' ? '' : `?cluster=${CLUSTER}`}`;

const DEBOUNCE_MS = 350;
const DEFAULT_TX_FEE_PERCENT = 0.045; // fallback: 0.00045 * 100

export default function TradingInterface() {
  const { symbol, setSymbol } = usePerpStore();

  // debounced amount
  const [rawAmount, setRawAmount] = useState("");
  const [amount, setAmount] = useState("");

  const [tradeType, setTradeType] = useState<"LONG" | "SHORT">("LONG")
  const [leverage, setLeverage] = useState<number>(1)
  const [payValue, setPayValue] = useState("0.00")

  const { autoProtect, setAutoProtect, setOldFloor, setNewFloor, fundSource, setFundSource } = useTradeStore();

  const [pending] = useTransition();
  // const [pending, start] = useTransition();

  // Validate leverage when autoProtect is enabled
  const isLeverageInvalid = autoProtect && leverage < 3;
  // const isTemporalFeeEnabled = autoProtect && leverage >= 3;
  const isTemporalFeeEnabled = false;

  const { address, isConnected } = useAccount();

  const currentMarkPrice = useGraphStore(s => s.currentMarkPrice);
  // Mark price is automatically updated via WebSocket in graphStore
  const [liquidationPrice, setLiquidationPrice] = useState<number>(0);

  const [txFeePercent, setTxFeePercent] = useState<number>(DEFAULT_TX_FEE_PERCENT);
  const [txFeeUsd, setTxFeeUsd] = useState<number>(0);
  const [temporalTxFeePercent, setTemporalTxFeePercent] = useState<number>(0.5);
  const [temporalTxFeeUsd, setTemporalTxFeeUsd] = useState<number>(0);
  const [isLoadingFees, setIsLoadingFees] = useState<boolean>(false);
  const lastFeesWalletRef = useRef<string | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean>(true);

  useEffect(() => {
    let canceled = false;
    (async () => {
      const ok = await checkBackendHealthAction();
      if (!canceled) setBackendHealthy(ok);
    })();
    return () => { canceled = true; };
  }, []);

  const handleLeverageChange = (value: number) => {
    setLeverage(value)
  }

  const handleBalanceClick = (balance: string) => {
    setRawAmount(balance);
  }

  // debounce rawAmount -> amount
  useEffect(() => {
    // immediate clear when input emptied
    if (rawAmount === "") {
      setAmount("");
      return;
    }
    const id = setTimeout(() => setAmount(rawAmount), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [rawAmount]);

  useEffect(() => {
    if (!amount || !currentMarkPrice || currentMarkPrice <= 0) {
      setPayValue("0.00");
      return;
    }

    const numeric = Number(amount);
    const calculated = (numeric * leverage) / currentMarkPrice;
    setPayValue(calculated.toFixed(6));
  }, [amount, leverage, currentMarkPrice]);

  useEffect(() => {
    const a = address?.toLowerCase();

    if (!isConnected || !a) {
      lastFeesWalletRef.current = null;
      setTxFeePercent(DEFAULT_TX_FEE_PERCENT);
      setIsLoadingFees(false);
      return;
    }

    if (lastFeesWalletRef.current === a) return;
    lastFeesWalletRef.current = a;

    let cancelled = false;
    setIsLoadingFees(true);

    fetchUserFeesAction(a)
      .then((fees) => {
        if (cancelled) return;
        const cross = Number(fees?.userCrossRate);
        if (Number.isFinite(cross) && cross >= 0) {
          setTxFeePercent(cross * 100);
        } else {
          setTxFeePercent(DEFAULT_TX_FEE_PERCENT);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setTxFeePercent(DEFAULT_TX_FEE_PERCENT);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingFees(false);
      });

    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  useEffect(() => {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setTxFeeUsd(0);
      setTemporalTxFeeUsd(0);
      return;
    }
    setTxFeeUsd((numeric * txFeePercent) / 100);
    setTemporalTxFeeUsd((numeric * temporalTxFeePercent) / 100);
  }, [amount, txFeePercent, temporalTxFeePercent, autoProtect, leverage]);

  const totalAmountWithFee = useMemo(() => {
    const base = Number(amount);
    if (!Number.isFinite(base) || base <= 0) return "";
    const total = base + txFeeUsd;
    if (!Number.isFinite(total) || total <= 0) return "";
    // USDC has 6 decimals
    return total.toFixed(6);
  }, [amount, txFeeUsd]);

  // Calculate liquidation price when mark price, leverage, trade type, or auto-protect changes
  useEffect(() => {
    if (currentMarkPrice > 0 && leverage > 1) {
      const maxLev = 40;
      // Calculate floor before auto-protect
      let floorBeforeAutoProtect: number;
      if (tradeType === "LONG") {
        floorBeforeAutoProtect = currentMarkPrice * (1 - 1 / leverage + 1 / maxLev);
      } else {
        floorBeforeAutoProtect = currentMarkPrice * (1 + 1 / leverage - 1 / maxLev);
      }

      // Sync oldFloor to store
      setOldFloor(floorBeforeAutoProtect);

      // Apply auto-protect multipliers if enabled
      let calculatedPrice: number;
      let newFloorValue: number;
      if (autoProtect) {
        if (tradeType === "LONG") {
          calculatedPrice = floorBeforeAutoProtect * 0.9;
          newFloorValue = floorBeforeAutoProtect * 0.9;
        } else {
          calculatedPrice = floorBeforeAutoProtect * 1.1;
          newFloorValue = floorBeforeAutoProtect * 1.1;
        }
        // Sync newFloor to store
        setNewFloor(newFloorValue);
      } else {
        calculatedPrice = floorBeforeAutoProtect;
        // Set newFloor to 0 when auto-protect is off
        setNewFloor(0);
      }

      setLiquidationPrice(calculatedPrice);
    } else {
      setLiquidationPrice(0);
      // Set both floors to 0 when leverage <= 1
      setOldFloor(0);
      setNewFloor(0);
    }
  }, [currentMarkPrice, leverage, tradeType, autoProtect, setOldFloor, setNewFloor]);


  return (
    <div className="px-4 py-1 bg-[#0E1B1E] w-full h-full flex flex-col">
      <div className="flex items-center justify-center p-0 m-0" >
        <Image src="/logo_hyperliquid_small.svg" alt="Hyperliquid" width={16} height={16} />
        <p className="text-[#E4E4E4] font-normal tracking-wider text-2xs text-center pl-2">Executed on Hyperliquid</p>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-0 content-start">
        <Card className="w-full py-1 flex flex-col  rounded-lg border border-[#D1D1D1] shadow-[#575757] bg-[#1A1A1A] text-xs">
          <div className="w-full mx-auto px-1 space-y-2 font-mono text-sm ">
            {/* LONG/SHORT Toggle */}
            <div className="flex rounded-sm overflow-hidden border border-[#8B8B8B]">
              <button
                onClick={() => setTradeType("LONG")}
                className={`flex-1 py-2 px-3 text-xs font-medium tracking-widest transition-colors ${tradeType === "LONG" ? "bg-[#053D00] text-[#14E800]" : "bg-[#222223] text-white hover:bg-[#1A1A1A] hover:text-[#14E800]"}`}
              >
                LONG/BUY
              </button>
              <button
                onClick={() => setTradeType("SHORT")}
                className={`flex-1 py-2 px-3 text-xs font-medium tracking-widest transition-colors ${tradeType === "SHORT" ? "bg-[#4E0000] text-[#FF6767]" : "bg-[#222223] text-white hover:bg-[#1A1A1A] hover:text-[#FF6767]"}`}
              >
                SHORT/SELL
              </button>
            </div>

            {/* Market/Limit Toggle Buttons  */}
            {/* <div className="flex items-center justify-between bg-[#1e1e1e] border border-[#0ABAB5] rounded-xs px-2 py-2 w-full">
              <div className="flex overflow-hidden border border-[#0ABAB5] rounded-sm">
                <button
                  onClick={() => setOrderType("market")}
                  className={`px-2 py-1 text-sm tracking-wider font-mono border-r border-[#0ABAB5] ${orderType === "market"
                    ? "bg-[#448D7A] text-white"
                    : "bg-[#191919] text-gray-300 hover:bg-slate-800"
                    }`}
                >
                  MARKET
                </button>
                <button
                  onClick={() => setOrderType("limit")}
                  className={`px-2 py-1 text-sm tracking-wider font-mono ${orderType === "limit"
                    ? "bg-[#448D7A] text-white"
                    : "bg-[#191919] text-gray-300 hover:bg-slate-800"
                    }`}
                >
                  LIMIT
                </button>
              </div>

              <div className="px-2 text-sm text-slate-400 font-mono">
                $177.05
              </div>
            </div> */}

            <div className="rounded-sm grid grid-cols-[minmax(100px,_auto)_minmax(160px,_1fr)_minmax(45px,_auto)] items-center mx-0 bg-[#222223] border border-[#465E58] ">
              <div className="flex items-center rounded-l-sm justify-center m-0 py-3 bg-[#112226] border-r border-[#465E58]">
                <span className="font-normal text-2xs tracking-widest text-[#E4E4E4]">
                  DEPOSIT
                </span>
              </div>

              <div className="flex items-center justify-center  px-0">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  value={rawAmount}
                  onChange={(e) => setRawAmount(e.target.value)}
                  className={`"m-0 p-0 px-4 h-5 w-full border-0 bg-transparent text-left text-white placeholder:text-xs placeholder:text-gray-400 focus-visible:ring-0  ${ibmPlexMono.className}`}
                />
              </div>

              <div className="flex items-center justify-end px-2">
                <BalanceChip onClick={handleBalanceClick} />
              </div>
            </div>

            <div className="rounded-sm grid grid-cols-[minmax(100px,_auto)_minmax(160px,_1fr)] items-center mx-0 bg-[#222223] border border-[#465E58] ">
              <div className="flex items-center rounded-l-sm justify-center m-0 py-5 bg-[#112226] border-r border-[#465E58]">
                <span className="font-normal text-2xs tracking-widest text-[#E4E4E4]">
                  LEVERAGE
                </span>
              </div>

              <div className="flex items-center justify-center  px-1">
                <LeverageSlider leverage={leverage} handleLeverageChange={handleLeverageChange} />
              </div>
            </div>

            <div className="rounded-sm grid grid-cols-[minmax(100px,_auto)_minmax(160px,_1fr)_minmax(45px,_auto)] items-center mx-0 bg-[#222223] border border-[#465E58] ">
              <div className="flex items-center rounded-l-sm justify-center m-0 py-3 bg-[#112226] border-r border-[#465E58]">
                <span className="font-normal text-2xs tracking-widest text-[#E4E4E4]">
                  NOTIONAL
                </span>
              </div>

              <div className="flex items-center justify-left px-4">
                <div className="text-slate-300 text-xs font-mono">
                  <NumberFlow
                    value={Number(payValue)}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 6 }}
                    locales="en-US"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end px-2">
                <Select value={symbol} onValueChange={(val: string) => setSymbol(val)}>
                  <SelectTrigger className="!h-5 !min-h-[20px] !py-0 rounded-sm px-2 w-[80px] justify-between font-light border border-[#4F4F4F] bg-[#4F4F4F] text-left text-white text-xs placeholder:text-gray-400 focus:ring-0 [&_svg]:!size-3 [&_svg]:!pr-0">
                    <SelectValue placeholder="Market" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#3B3B3B] text-coffee text-xs min-w-[80px]">
                    {symbolOptions.map((option) => (
                      <SelectItem key={option} value={option} className="text-xs">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
        </Card>

        <Card className="mt-3 p-3 gap-2 rounded-lg bg-[#0E1719] border border-[#D1D1D1] shadow-[#575757]">
          {/* AUTO-PROTECT Section */}
          <div className="">
            <div
              // className={`border border-[#465E58] rounded-sm py-2 w-full hover:bg-[#015F5C] cursor-pointer ${protectTrade ? 'bg-[#004846]' : 'bg-[#112226]'}`}
              className={`border border-[#465E58] rounded-sm py-1.5 pl-2 w-full hover:bg-[#015F5C] cursor-pointer }`}
              onClick={() => setAutoProtect(!autoProtect)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setAutoProtect(!autoProtect);
                }
              }}
            >
              <div className="flex items-center justify-start">
                <Checkbox
                  checked={autoProtect}
                  onCheckedChange={(v) => setAutoProtect(v === true)}
                  className="mx-2 my-1 rounded-xs border-[#465E58] data-[state=checked]:border-[#0ABAB5] data-[state=checked]:bg-[#09ABA6]"
                />
                <div className="mx-2 py-1 font-normal text-2xs tracking-widest text-[#E4E4E4]">
                  AUTO-PROTECT
                </div>
              </div>
            </div>
            <div className="mt-2 text-2xs text-[#9B9FA3] font-light leading-relaxed">
              Automatically pushes away liquidation floor at the same leverage.
              Does not guarantee profits or prevent liquidation.
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-[#4F585F]"></div>

          {/* Price Details Section */}
          <div className="space-y-2">
            <div className="flex justify-between font-light text-2xs text-[#E5E5E5]">
              <span>Entry Price</span>
              <span className="text-white font-semibold">
                $<NumberFlow
                  value={Number(currentMarkPrice)}
                  format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  locales="en-US"
                />
              </span>
            </div>

            <div className="flex justify-between font-light text-2xs text-[#E5E5E5]">
              <span className="flex items-center gap-1">
                Liquidation Price
                <AnimatePresence>
                  {autoProtect && leverage > 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ShieldCheck className="h-4 w-4 text-temporal" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </span>
              <AnimatePresence mode="wait">
                {leverage === 1 ? (
                  <motion.span
                    key="set-leverage"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1 text-[#0ABAB5] text-2xs font-semibold pb-[2px]"
                  >
                    <Lock className="h-3 w-3" /> Set Leverage For Liquidation Price
                  </motion.span>
                ) : (
                  <motion.span
                    key="liq-price"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={`font-semibold text-2xs ${autoProtect && leverage > 1 ? 'text-[#0ABAB5]' : 'text-white'}`}
                  >
                    $<NumberFlow
                      value={Number(liquidationPrice)}
                      format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      locales="en-US"
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-[#4F585F] "></div>

          {/* Fees Section */}
          <div className="space-y-2">
            {/* Hyperliquid Tx Fees */}
            <div className="flex justify-between font-light text-2xs text-[#E5E5E5]">
              <span className="flex items-center gap-1.5">
                <Image src="/logo_hyperliquid_small.svg" alt="Hyperliquid" width={12} height={12} />
                Hyperliquid Tx Fees
              </span>
              <span className="text-white flex items-center gap-1">
                {isLoadingFees ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  <>
                    <NumberFlow
                      value={Number(txFeePercent)}
                      format={{ minimumFractionDigits: 3, maximumFractionDigits: 3 }}
                      locales="en-US"
                    />
                    %
                    <span className="text-white">|</span>
                    $<NumberFlow
                      value={Number(txFeeUsd)}
                      format={{ minimumFractionDigits: 3, maximumFractionDigits: 3 }}
                      locales="en-US"
                    />
                  </>
                )}
              </span>
            </div>

            {/* Temporal Tx Fees */}
            <div className={`flex justify-between font-light text-2xs ${isTemporalFeeEnabled ? "text-[#E5E5E5]" : "text-[#6B7280]"}`}>
              <span className="flex items-center gap-1.5">
                <Image src="/TemporalLogoSmall.svg" alt="Temporal" width={12} height={12} className={isTemporalFeeEnabled ? "opacity-100" : "opacity-40"} />
                Temporal Tx Fees
              </span>
              <span className="flex items-center gap-1">
                <NumberFlow
                  value={isTemporalFeeEnabled ? Number(temporalTxFeePercent) : 0}
                  format={{ minimumFractionDigits: 1, maximumFractionDigits: 2 }}
                  locales="en-US"
                />
                %
                <span>|</span>
                $<NumberFlow
                  value={isTemporalFeeEnabled ? Number(temporalTxFeeUsd) : 0}
                  format={{ minimumFractionDigits: 3, maximumFractionDigits: 3 }}
                  locales="en-US"
                />
              </span>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-[#4F585F] "></div>

          {/* Fund Source Selection */}
          <div className="pt-2 flex justify-between items-center text-2xs font-light">
            <span className="text-[#E4E4E4] font-normal uppercase tracking-widest">DEPOSIT FROM</span>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#E5E5E5] hover:text-white">
                <input
                  type="radio"
                  name="fundSource"
                  value="wallet"
                  className="hidden"
                  checked={fundSource === "wallet"}
                  onChange={() => setFundSource("wallet")}
                />
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${fundSource === 'wallet' ? 'border-[#0ABAB5]' : 'border-gray-500'}`}>
                  {fundSource === 'wallet' && <div className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5]" />}
                </div>
                <span className={`${fundSource === 'wallet' ? 'text-white' : 'text-[#9B9FA3]'} text-2xs font-normal tracking-wider`}>Wallet</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[#E5E5E5] hover:text-white">
                <input
                  type="radio"
                  name="fundSource"
                  value="hl-balance"
                  className="hidden"
                  checked={fundSource === "hl-balance"}
                  onChange={() => setFundSource("hl-balance")}
                />
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${fundSource === 'hl-balance' ? 'border-[#0ABAB5]' : 'border-gray-500'}`}>
                  {fundSource === 'hl-balance' && <div className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5]" />}
                </div>
                <span className={`${fundSource === 'hl-balance' ? 'text-white' : 'text-[#9B9FA3]'} text-2xs font-normal tracking-wider`}>Hyperliquid Balance</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-center mt-3">

          <TransferAndPerpButton
            className="w-1/2"
            disabled={pending || isLeverageInvalid || !backendHealthy}
            rawAmount={rawAmount}
            amount={totalAmountWithFee || amount}
            symbol="BTC"
            side={tradeType}
            leverage={leverage}
            markPrice={currentMarkPrice}
            btcAmount={Number(payValue)}
            autoProtect={autoProtect}
            fundSource={fundSource}
            onComplete={({ orderId }) => {
              console.log("orderId", orderId);
            }}
          />
        </div>

        <div className="flex mx-auto">
          {!backendHealthy && (
            <p className="mt-2 text-sm text-gray-400">
              Backend is currently unreachable.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

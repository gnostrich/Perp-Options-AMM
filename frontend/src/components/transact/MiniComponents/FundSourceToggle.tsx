"use client";

import { useTradeStore, type FundSource } from "@/store/tradeStore";
import { Wallet, ArrowLeftRight } from "lucide-react";

export default function FundSourceToggle() {
  const { fundSource, setFundSource } = useTradeStore();

  const options: { value: FundSource; label: string; icon: React.ReactNode }[] = [
    {
      value: "wallet",
      label: "WALLET",
      icon: <Wallet className="h-3.5 w-3.5" />,
    },
    {
      value: "hl-balance",
      label: "HL BALANCE",
      icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="flex rounded-sm overflow-hidden border border-[#465E58]">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setFundSource(opt.value)}
          className={`py-2 px-3 text-xs font-medium tracking-wider transition-colors flex items-center justify-center gap-1.5
            ${fundSource === opt.value
              ? "bg-[#112226] text-[#0ABAB5] border-b-2 border-[#0ABAB5]"
              : "bg-[#222223] text-[#9B9FA3] hover:bg-[#1A1A1A] hover:text-white"
            }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "@/lib/hooks/useAccount";
import { Check, Gift, Link2, Zap, ClipboardList, CheckCircle2, CircleCheckBig, Wallet } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ibmPlexMono } from "@/lib/font";
import { fetchIncentivesSummaryAction } from "@/app/actions/fetchIncentivesSummaryAction";
import type { IncentiveSummaryData } from "@/lib/data/api/incentives";

const REFERRAL_DOMAIN = "https://app.temporal.exchange";

function truncateAddress(address: string): string {
  if (!address) return "";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ReferralDialogContent() {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState<IncentiveSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const referralUrl = address ? `${REFERRAL_DOMAIN}?ref=${address}` : "";
  const displayUrl = address
    ? `app.temporal.exchange/?ref=${truncateAddress(address)}`
    : "";

  const loadSummary = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetchIncentivesSummaryAction(address);
      if (res?.success) {
        setSummary(res.data);
      }
    } catch {
      // silently fail — summary section will show dashes
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = referralUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDollar = (val: number | undefined) =>
    val !== undefined ? `$${Math.round(val)}` : "—";

  return (
    <Card
      className={`${ibmPlexMono.className} bg-[#0F171A] border-2 border-[#575757] rounded-sm w-full md:w-fit md:min-w-[500px] mx-auto my-6 py-6`}
    >
      <CardHeader>
        <CardTitle
          className="text-white text-xl font-normal text-center mx-auto flex items-center gap-2"
        >
          <Gift className="h-5 w-5" />
          REFERRALS
        </CardTitle>
        <p className="text-[#8B949E] text-sm font-mono text-center mt-1">
          Earn rewards by inviting others
        </p>
      </CardHeader>

      <div className="rounded-md p-4 mx-8 space-y-5">
        {/* ─── Your Link ─── */}
        <div className="space-y-2">
          <div className="text-[#C9C8C8] text-sm font-mono tracking-widest uppercase">
            Your Link
          </div>
          <div className="flex items-center border border-[#1e3535] rounded-sm overflow-hidden bg-[#112226]">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5">
              <span className="text-[#0ABAB5] font-mono text-sm truncate">
                {displayUrl}
              </span>
            </div>
            <Button
              onClick={handleCopy}
              variant="noShadow"
              className="rounded-sm bg-[#448D7A] hover:bg-[#3a7a6a] text-white text-xs tracking-widest uppercase shrink-0 h-full w-[100px] flex items-center justify-center"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  COPIED
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 text-white shrink-0" />
                  COPY
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ─── Referral Rewards ─── */}
        <div className="space-y-2">
          <div className="text-[#C9C8C8] text-sm font-mono tracking-widest uppercase">
            Referral Rewards
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-2">
              <div className="flex flex-col items-center">
                <style>{`
                  .temporal-outer-left-ref  { animation: temporal-slide-left-ref  2s cubic-bezier(0.4,0,0.2,1) infinite; }
                  .temporal-outer-right-ref { animation: temporal-slide-right-ref 2s cubic-bezier(0.4,0,0.2,1) infinite; }
                  .temporal-inner-left-ref  { animation: temporal-slide-left-ref  2s cubic-bezier(0.4,0,0.2,1) infinite 0.35s; }
                  .temporal-inner-right-ref { animation: temporal-slide-right-ref 2s cubic-bezier(0.4,0,0.2,1) infinite 0.35s; }
                  @keyframes temporal-slide-left-ref {
                    0%   { transform: translateX(14px); opacity: 0; }
                    40%  { transform: translateX(6px);  opacity: 0.9; }
                    100% { transform: translateX(0px);  opacity: 0; }
                  }
                  @keyframes temporal-slide-right-ref {
                    0%   { transform: translateX(-14px); opacity: 0; }
                    40%  { transform: translateX(-6px);  opacity: 0.9; }
                    100% { transform: translateX(0px);   opacity: 0; }
                  }
                  @keyframes temporal-loading-pulse-ref {
                    0%, 100% { opacity: 0.6; }
                    50%       { opacity: 0.9; }
                  }
                  .temporal-loading-text-ref { animation: temporal-loading-pulse-ref 1.8s ease-in-out infinite; }
                `}</style>
                <svg width="120" height="120" viewBox="0 0 198 198" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M97.1703 114.846V92.1341H82.9148V88.1306H115.429V92.1341H101.211V114.846H97.1703Z" fill="white" />
                  <g className="temporal-inner-left-ref">
                    <path d="M65.6953 65.6602L37.008 96.1982L60.1429 129.512" stroke="#0ABAB5" strokeWidth="1.85079" strokeLinecap="round" />
                  </g>
                  <g className="temporal-inner-right-ref">
                    <path d="M131.391 65.6602L160.078 96.1982L136.943 129.512" stroke="#0ABAB5" strokeWidth="1.85079" strokeLinecap="round" />
                  </g>
                  <g className="temporal-outer-left-ref">
                    <path d="M79.1459 57.586C79.4695 57.1904 79.4112 56.6074 79.0157 56.2838C78.6201 55.9601 78.0371 56.0184 77.7135 56.414L78.4297 57L79.1459 57.586ZM78.4297 57L77.7135 56.414L44.3992 97.1314L45.1154 97.7174L45.8317 98.3034L79.1459 57.586L78.4297 57Z" fill="#0ABAB5" />
                    <path d="M73.616 142.501C73.8927 142.931 74.4653 143.055 74.895 142.779C75.3248 142.502 75.4489 141.929 75.1723 141.5L74.3941 142.001L73.616 142.501ZM45.1875 96.6289L44.4094 97.1298L73.616 142.501L74.3941 142.001L75.1723 141.5L45.9656 96.128L45.1875 96.6289Z" fill="#0ABAB5" />
                  </g>
                  <g className="temporal-outer-right-ref">
                    <path d="M117.01 57.586C116.687 57.1904 116.745 56.6074 117.141 56.2838C117.536 55.9601 118.119 56.0184 118.443 56.414L117.727 57L117.01 57.586ZM117.727 57L118.443 56.414L151.757 97.1314L151.041 97.7174L150.325 98.3034L117.01 57.586L117.727 57Z" fill="#0ABAB5" />
                    <path d="M122.54 142.501C122.264 142.931 121.691 143.055 121.261 142.779C120.831 142.502 120.707 141.929 120.984 141.5L121.762 142.001L122.54 142.501ZM150.969 96.6289L151.747 97.1298L122.54 142.501L121.762 142.001L120.984 141.5L150.191 96.128L150.969 96.6289Z" fill="#0ABAB5" />
                  </g>
                </svg>
                <div className="flex flex-col items-center gap-1">
                  <p className="temporal-loading-text-ref" style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.35em', color: '#0ABAB5', fontSize: '11px', fontWeight: 400 }}>
                    LOADING
                  </p>
                </div>

              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {/* Accrued */}
              <div className="border border-[#1e3535] bg-[#112226] rounded-sm flex flex-col items-center justify-center py-4 gap-2">
                <Wallet className="h-5 w-5 text-[#4a8aef]" />
                <span className="text-[#C9C8C8] text-xs font-mono tracking-widest uppercase">
                  Accrued
                </span>
                <span className="text-white text-base font-mono font-normal">
                  {formatDollar(summary?.accrued_dollar)}
                </span>
              </div>

              {/* Claimable */}
              <div className="border border-[#1e3535] bg-[#112226] rounded-sm flex flex-col items-center justify-center py-4 gap-2">
                <Zap className="h-5 w-5 text-[#f0a030]" />
                <span className="text-[#C9C8C8] text-xs font-mono tracking-widest uppercase">
                  Claimable
                </span>
                <span className="text-white text-base font-mono font-normal">
                  {formatDollar(summary?.claimable_dollar)}
                </span>
              </div>

              {/* Claimed */}
              <div className="border border-[#1e3535] bg-[#112226] rounded-sm flex flex-col items-center justify-center py-4 gap-2">
                <CircleCheckBig className="h-5 w-5 text-[#448D7A]" />
                <span className="text-[#C9C8C8] text-xs font-mono tracking-widest uppercase">
                  Claimed
                </span>
                <span className="text-white text-base font-mono font-normal">
                  {formatDollar(summary?.claimed_dollar)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ─── Close ─── */}
        <div className="flex justify-center pt-1">
          <DialogClose asChild>
            <Button className="bg-[#448D7A] hover:bg-[#3a7a6a] text-white tracking-widest uppercase px-10">
              CLOSE
            </Button>
          </DialogClose>
        </div>
      </div>
    </Card>
  );
}

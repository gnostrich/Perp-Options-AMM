"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNextStep } from "nextstepjs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ibmPlexMono } from "@/lib/font";

const DISCLAIMER_KEY = "temporal_disclaimer_accepted";
const TOUR_SEEN_KEY = "temporal_tour_seen_v1";

export default function DisclaimerDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { startNextStep } = useNextStep();

  const startedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const accepted = localStorage.getItem(DISCLAIMER_KEY) === "true";
    if (!accepted) {
      setOpen(true);
    }
  }, []);



  const safeStartTourOnce = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    try {
      // Scroll to top to ensure predictable state when tour starts
      // The OnboardingCard will then scroll to itself when it appears
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Small delay to allow scroll to complete before starting tour
      setTimeout(() => {
        startNextStep("TransactTour");
      }, 300);
    } catch {
    }
  };

  const agree = () => {
    localStorage.setItem(DISCLAIMER_KEY, "true");
    setOpen(false);

    // if (!localStorage.getItem(TOUR_SEEN_KEY)) {
    //   localStorage.setItem(TOUR_SEEN_KEY, "true");
    //   setTimeout(() => {
    //     safeStartTourOnce();
    //   }, 0);
    // }
  };

  const disagree = () => {
    router.push("https://temporal.exchange");
  };
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/80 data-[state=open]:animate-in data-[state=open]:fade-in-0"
          aria-hidden="true"
        />
      )}
      <Dialog open={open} modal={false}>
        <DialogTrigger />

        <DialogContent className="
                fixed z-50
                left-1/2 -translate-x-1/2
                top-4 translate-y-0 md:top-20

                w-[90vw] max-w-[calc(100vw-2rem)] md:w-full md:max-w-xl
                max-h-[calc(100vh-2rem)] md:max-h-[80vh]

                bg-transparent border-none p-0
                [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <DialogHeader className="hidden">
            <DialogTitle>Feedback</DialogTitle>
          </DialogHeader>

          <Card className="
                    bg-[#1A1A1A] border-2 border-black rounded-none
                    w-full sm:w-fit sm:min-w-[512px]
                    py-4 sm:py-6
                    max-h-[calc(100vh-2rem)] sm:max-h-[80vh]
                    flex flex-col overflow-hidden"
          >
            <CardHeader className="px-4 sm:px-6">
              <CardTitle
                className={`text-coffee text-xl font-normal text-center mx-auto ${ibmPlexMono.className}`}
              >
                DISCLAIMER
              </CardTitle>
            </CardHeader>

            <div className="rounded-md p-4 mx-4 sm:mx-6 space-y-6 max-h-[calc(100vh-12rem)] sm:max-h-[45vh] overflow-y-auto border border-[#D1D1D1] flex-shrink">
              <DialogDescription asChild>
                <div className="text-sm leading-relaxed space-y-4 text-gray-100">
                  <p className="font-semibold">
                    Disclaimer: Experimental Application / &apos;Alpha&apos;
                  </p>

                  <p>
                    This decentralized exchange is currently in <em>testing</em> and has
                    <em> not</em> been audited. By connecting your wallet, you acknowledge and
                    accept the following risks:
                  </p>

                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>Smart-contract vulnerabilities may exist.</li>
                    <li>Displayed prices, balances, and trade outcomes may be inaccurate or delayed.</li>
                    <li>Funds connected to the platform may be at&nbsp;risk, including through unintended interactions.</li>
                    <li>No guarantees are made regarding uptime, data accuracy, or transaction outcomes.</li>
                  </ul>

                  <p className="font-semibold">
                    Use at your own risk. Do not trade with significant funds.
                  </p>
                </div>
              </DialogDescription>
            </div>

            <div className="mt-4 sm:mt-2 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Button
                onClick={disagree}
                className="bg-[#575757] border-[#7B7B7B] text-white w-full sm:w-[150px]"
              >
                DISAGREE
              </Button>
              <DialogClose asChild>
                <Button onClick={agree} className="bg-[#448D7A] text-white w-full sm:w-[150px]">
                  AGREE
                </Button>
              </DialogClose>
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}

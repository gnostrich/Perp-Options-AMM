"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { lpInstrumentLabel } from "@/lib/data/api/portfolioTransforms";
import type { LpBandWireRow } from "@/lib/data/api/portfolioTransforms";
import type { CloseAccruedResponse } from "@/lib/data/api/contracts";
import { fetchCloseAccruedEstimateAction } from "@/app/actions/fetchCloseAccruedEstimateAction";
import { closeAccruedPositionsAction } from "@/app/actions/closeAccruedPositionsAction";

// Warn idiom reused verbatim from earnTableContainer.tsx's exposure warn
// (amber #FFAE67 + AlertTriangle) — not invented here.
const WARN_COLOR = "#FFAE67";
const ERROR_COLOR = "#FF6767";

function usd(value: number, signed = false): string {
  if (!Number.isFinite(value)) return "—";
  const sign = signed && value >= 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const ROW_GRID = "grid-cols-[46px_1.5fr_0.9fr_0.75fr_1fr]";

interface CloseAccruedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: string;
  lpId: string;
  /** Fired once a close actually executed — caller may refresh curve state. */
  onClosed?: () => void;
}

type Status = "loading" | "ready" | "error";

export default function CloseAccruedDialog({
  open,
  onOpenChange,
  wallet,
  lpId,
  onClosed,
}: CloseAccruedDialogProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [rows, setRows] = useState<LpBandWireRow[]>([]);
  const [closing, setClosing] = useState(false);
  // Set on a real 200 (covers a partial sweep — that is a result, not an
  // error) — once set the dialog shows what ACTUALLY happened instead of
  // the pre-confirm estimate. closeError is the backend's OWN refusal text
  // (409/400/404/503), shown verbatim, never paraphrased.
  const [result, setResult] = useState<CloseAccruedResponse | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let canceled = false;
    setStatus("loading");
    setResult(null);
    setCloseError(null);
    (async () => {
      const est = await fetchCloseAccruedEstimateAction(wallet, lpId);
      if (canceled) return;
      if (est === null) {
        setStatus("error");
        return;
      }
      setRows(est);
      setStatus("ready");
    })();
    return () => { canceled = true; };
  }, [open, wallet, lpId]);

  // `closable` is the SWEEP's own predicate, computed backend-side with the
  // same own-rungs exclusion MatchExit uses (audit B1: valueBasis cannot say
  // this — the value law prices off the aggregate book, own depth included, so
  // a row priced by the closer's own bid can still have nobody to close
  // against). The preview promises exactly what the sweep will attempt.
  const closable = rows.filter((r) => r.closable);
  const skipped = rows.filter((r) => !r.closable);
  const total = closable.reduce((s, r) => s + r.valueUSD, 0);

  // The result's own row IDs are the SAME "lp:<lpId>:<wing>:<strike>" key the
  // estimate rows carry (amm/engine/lppositions.go's lpPositionID — "a
  // closed/skipped row lands on the row it came from") — so a SkippedAccruedRow
  // (id + reason only, no wing/strike) can still get an honest instrument
  // label by joining back onto the estimate we already fetched. Falls back to
  // the raw id, never a guessed label, if the join misses.
  const labelFor = (id: string) => {
    const found = rows.find((r) => r.id === id);
    return found ? lpInstrumentLabel(found) : id;
  };

  const handleConfirm = async () => {
    setClosing(true);
    const { data, error } = await closeAccruedPositionsAction(lpId);
    setClosing(false);
    if (!data) {
      setCloseError(error ?? "Failed to close accrued positions");
      return;
    }
    setResult(data);
    onClosed?.();
    if (data.closed.length === 0) {
      toast.error("No positions closed — no resting depth for any position");
    } else {
      const skipNote = data.skipped.length ? `, ${data.skipped.length} stayed open` : "";
      toast.success(
        `${data.closed.length} position${data.closed.length === 1 ? "" : "s"} closed${skipNote} — ${usd(data.totalProceedsUSD, true)}`
      );
    }
  };

  const showEstimate = !result && !closeError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#112226] border-[#808080] text-[#C9C8C8] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {result ? "CLOSE ACCRUED POSITIONS — RESULT" : "CLOSE ACCRUED POSITIONS?"}
          </DialogTitle>
          <DialogDescription className="text-[#C9C8C8] text-xs leading-relaxed">
            This closes only the positions this curve has accrued from trader fills.{" "}
            <span className="text-white font-semibold">
              The curve itself stays deployed and quoting
            </span>{" "}
            — utilization, TVL and dials are unaffected.
          </DialogDescription>
        </DialogHeader>

        {closeError && (
          <div
            className="border rounded-sm px-3 py-2.5 text-[11px] leading-relaxed"
            style={{ borderColor: ERROR_COLOR, background: "#FF676712", color: ERROR_COLOR }}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Could not close positions
            </div>
            <div className="text-[#ffb3b3]">{closeError}</div>
          </div>
        )}

        {result && (
          <>
            {result.closed.length > 0 && (
              <div className="border border-[#2a3a3d] rounded-sm overflow-hidden">
                <div className={`grid ${ROW_GRID} gap-2 px-2 py-1.5 text-[9.5px] tracking-widest text-[#677275] border-b border-[#2a3a3d]`}>
                  <span>ORIGIN</span><span>INSTRUMENT</span><span>QTY (₿)</span><span>EXIT</span><span>PROCEEDS</span>
                </div>
                {result.closed.map((c) => {
                  const wing = c.wing?.toLowerCase() === "put" ? "put" : "call";
                  const isSell = c.valueBasis === "bid"; // executed side names the direction, no sign guess needed
                  return (
                    <div key={c.id} className={`grid ${ROW_GRID} gap-2 items-center px-2 py-1.5 text-[11.5px] border-b border-[#1a2528] last:border-b-0`}>
                      <span className="text-[9px] font-bold tracking-wider rounded-sm border px-1.5 py-0.5 text-center w-fit" style={{ color: "#0ABAB5", background: "#0ABAB522", borderColor: "#0ABAB566" }}>LP</span>
                      <span className="font-semibold whitespace-nowrap" style={{ color: wing === "put" ? "#DC5D5B" : "#54D200" }}>{lpInstrumentLabel(c)}</span>
                      <span className="font-semibold" style={{ color: c.qtyCoin >= 0 ? "#00FF9C" : "#FF6767" }}>{c.qtyCoin >= 0 ? "+" : ""}{c.qtyCoin.toFixed(4)}</span>
                      <span className="text-[10px] font-bold rounded-sm px-1.5 py-0.5 w-fit" style={isSell ? { color: "#D277B9", background: "#D277B922" } : { color: "#7A97E2", background: "#7A97E222" }}>{isSell ? "SELL" : "BUY"}</span>
                      <span className="font-semibold" style={{ color: c.proceedsUSD >= 0 ? "#00FF9C" : "#FF6767" }}>
                        {usd(c.proceedsUSD, true)}
                        <span className="ml-1 text-[10px] text-[#7a8a86]">(@{c.exitPriceCoin.toFixed(6)} {c.valueBasis})</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center px-2 py-2 border-t-2 border-[#808080] text-xs font-bold">
              <span className="text-[#7a8a86] font-semibold tracking-wide text-[11px]">
                TOTAL PROCEEDS ({result.closed.length} closed, {result.skipped.length} stayed open)
              </span>
              <span style={{ color: result.totalProceedsUSD >= 0 ? "#00FF9C" : "#FF6767" }}>{usd(result.totalProceedsUSD, true)}</span>
            </div>

            {result.skipped.length > 0 && (
              <div className="border rounded-sm px-3 py-2.5 text-[11px] leading-relaxed" style={{ borderColor: WARN_COLOR, background: "#FFAE6712", color: WARN_COLOR }}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {result.skipped.length} stayed open — no counterparty depth
                </div>
                <div>These stay open on the book; the curve keeps quoting them normally.</div>
                <ul className="mt-1 pl-4 list-disc" style={{ color: "#ffcda0" }}>
                  {result.skipped.map((s) => (
                    <li key={s.id}>{labelFor(s.id)} — {s.reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* flat/kappaSnapped are two separate facts (the engine's own doc: "one
                about inventory, one about the tilt") — each rendered off its OWN
                boolean, so a partial close (flat:false, kappaSnapped:false) never
                reads as a reset that didn't happen. */}
            <p className="text-[10px] text-[#677275] leading-relaxed">
              {result.flat ? "This curve's inventory is now flat." : "This curve still carries open inventory — a partial close."}{" "}
              {result.kappaSnapped ? "Its tilt (κ) reset to neutral." : "Its tilt (κ) is unchanged."}
            </p>
          </>
        )}

        {showEstimate && status === "loading" && (
          <div className="py-6 text-center text-2xs text-[#677275] animate-pulse">
            Loading accrued positions…
          </div>
        )}

        {showEstimate && status === "error" && (
          <div className="py-6 text-center text-2xs text-[#FF6767]">
            Could not load this curve&apos;s accrued positions. Try again.
          </div>
        )}

        {showEstimate && status === "ready" && rows.length === 0 && (
          <div className="py-6 text-center text-2xs text-[#677275]">
            This curve has no accrued positions to close.
          </div>
        )}

        {showEstimate && status === "ready" && rows.length > 0 && (
          <>
            <div className="border border-[#2a3a3d] rounded-sm overflow-hidden">
              <div className={`grid ${ROW_GRID} gap-2 px-2 py-1.5 text-[9.5px] tracking-widest text-[#677275] border-b border-[#2a3a3d]`}>
                <span>ORIGIN</span><span>INSTRUMENT</span><span>QTY (₿)</span><span>EXIT</span><span>EST. VALUE</span>
              </div>
              {rows.map((r) => {
                const wing = r.wing?.toLowerCase() === "put" ? "put" : "call";
                const label = lpInstrumentLabel(r);
                const isSell = r.qtyCoin >= 0; // long exits by selling; short by buying back
                const isClosable = r.closable; // the sweep's own predicate (audit B1/B1-r)
                const reason = isSell
                  ? "no counterparty bid resting — cannot close"
                  : "no counterparty ask resting — cannot close";
                return (
                  <div
                    key={r.id}
                    className={`grid ${ROW_GRID} gap-2 items-center px-2 py-1.5 text-[11.5px] border-b border-[#1a2528] last:border-b-0`}
                    style={!isClosable ? { opacity: 0.72 } : undefined}
                  >
                    <span
                      className="text-[9px] font-bold tracking-wider rounded-sm border px-1.5 py-0.5 text-center w-fit"
                      style={
                        isClosable
                          ? { color: "#0ABAB5", background: "#0ABAB522", borderColor: "#0ABAB566" }
                          : { color: WARN_COLOR, background: "#FFAE6718", borderColor: "#FFAE6766" }
                      }
                    >
                      LP
                    </span>
                    <span className="font-semibold whitespace-nowrap" style={{ color: wing === "put" ? "#DC5D5B" : "#54D200" }}>
                      {label}
                    </span>
                    <span className="font-semibold" style={{ color: r.qtyCoin >= 0 ? "#00FF9C" : "#FF6767" }}>
                      {r.qtyCoin >= 0 ? "+" : ""}{r.qtyCoin.toFixed(4)}
                    </span>
                    <span
                      className="text-[10px] font-bold rounded-sm px-1.5 py-0.5 w-fit"
                      style={isSell ? { color: "#D277B9", background: "#D277B922" } : { color: "#7A97E2", background: "#7A97E222" }}
                    >
                      {isSell ? "SELL" : "BUY"}
                    </span>
                    {isClosable ? (
                      <span className="font-semibold" style={{ color: r.valueUSD >= 0 ? "#00FF9C" : "#FF6767" }}>
                        {usd(r.valueUSD, true)}
                        <span className="ml-1 text-[10px] text-[#7a8a86]">({r.valueBasis})</span>
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-semibold" style={{ color: WARN_COLOR }}>{reason}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center px-2 py-2 border-t-2 border-[#808080] text-xs font-bold">
              <span className="text-[#7a8a86] font-semibold tracking-wide text-[11px]">
                TOTAL EST. PROCEEDS ({closable.length} of {rows.length} positions)
              </span>
              <span style={{ color: total >= 0 ? "#00FF9C" : "#FF6767" }}>{usd(total, true)}</span>
            </div>

            {skipped.length > 0 && (
              <div
                className="border rounded-sm px-3 py-2.5 text-[11px] leading-relaxed"
                style={{ borderColor: WARN_COLOR, background: "#FFAE6712", color: WARN_COLOR }}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {skipped.length} of {rows.length} cannot close — no counterparty resting at these strikes
                </div>
                <div>These stay open on the book; the curve keeps quoting them normally.</div>
                <ul className="mt-1 pl-4 list-disc" style={{ color: "#ffcda0" }}>
                  {skipped.map((r) => (
                    <li key={r.id}>
                      {lpInstrumentLabel(r)} — needs a counterparty {r.qtyCoin >= 0 ? "bid" : "ask"}, none resting
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[10px] text-[#677275] leading-relaxed">
              Mechanics: closes execute against the aggregate book at each position&apos;s exit side
              (sell hits the bid, buy hits the ask) and are charged the <b className="text-[#9aa5a3]">taker</b> fee
              — no maker rebate on the way out. Estimates reprice at confirmation; a thin book can move
              between this screen and execution.
            </p>
          </>
        )}

        <DialogFooter className="sm:justify-start">
          {showEstimate ? (
            <>
              <Button
                variant="noShadow"
                className="bg-red-500 hover:bg-red-600 border-0 text-white"
                disabled={status !== "ready" || closable.length === 0 || closing}
                onClick={handleConfirm}
              >
                {closing ? "CLOSING…" : `CLOSE ${closable.length} POSITION${closable.length === 1 ? "" : "S"}`}
              </Button>
              <Button
                variant="noShadow"
                className="bg-transparent border-0 text-white hover:bg-white/10"
                disabled={closing}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="noShadow"
              className="bg-transparent border-[1.5px] border-[#0ABAB5] text-[#0ABAB5] hover:bg-[#0ABAB512]"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

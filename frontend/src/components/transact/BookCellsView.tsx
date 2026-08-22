"use client";

import { useMemo, useState } from "react";
import { useBookStore } from "@/store/bookStore";
import { useLpCurveStore } from "@/store/lpCurveStore";
import type { BookSnapshot } from "@/lib/data/api/contracts";
import { Skeleton } from "../ui/skeleton";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ibmPlexMono } from "@/lib/font";
import { SELL_BG, SELL_ACCENT, BUY_BG, BUY_ACCENT } from "@/lib/utils";

const OWN_LP_COLOR = "#0ABAB5";

/** One finest-grain book cell: (wing, k, rung price, side, lp) → qty. `lpId` is null on
 *  aggregated rungs, which the snapshot emits when it carries no per-LP breakdown. */
type Cell = {
  wing: string;
  k: number;
  strike: number;
  price: number;
  side: "bid" | "ask";
  qty: number;
  lpId: string | null;
  /** 1-based position in the walk of its own (wing,strike,side) ladder — the order the
   *  matcher consumes levels, best-effective-first (book.go makeLevels). NOT the rung
   *  index m of the arithmetic fan: once two LPs quote one cell their fans interleave,
   *  so position is a property of the merged book, not of any LP's ladder. */
  pos: number;
  /** Σ qty from the touch through this cell, WITHIN this ladder only. Depth is never
   *  additive across strikes: each (wing,strike,side) is its own ladder off a shared N
   *  (OB_LOGIC §H3), so a cross-strike sum would state a capacity that cannot be hit. */
  cum: number;
};

const SIDES = ["bid", "ask"] as const;

/** k as a signed percent — the book's stable key, and the thing that identifies a row.
 *  Its sign already carries the wing (calls quote k>0, puts k<0, OB_LOGIC §9.4). */
const fmtK = (k: number) => `${k >= 0 ? "+" : ""}${(k * 100).toFixed(2)}%`;

/** Flattens the snapshot in emitted order — strikes as keyed, rungs touch-first — so
 *  `pos`/`cum` stay walk-faithful. Filtering happens after, never re-sorting. */
function flatten(snapshot: BookSnapshot | null): Cell[] {
  if (!snapshot) return [];
  const out: Cell[] = [];
  for (const s of snapshot.strikes) {
    for (const side of SIDES) {
      let pos = 0;
      let cum = 0;
      for (const r of s.rungs) {
        const total = side === "bid" ? r.bidQty : r.askQty;
        if (!(total > 0)) continue;
        const mine = r.perLp.filter((p) => p.side === side && p.qty > 0);
        pos += 1;
        cum += total;
        const base = { wing: s.wing, k: s.k, strike: s.strike, price: r.price, side, pos, cum };
        if (mine.length === 0) {
          out.push({ ...base, qty: total, lpId: null });
          continue;
        }
        // Per-LP rows share their rung's pos/cum: they are one price level split by
        // owner, not successive steps down the ladder.
        for (const p of mine) out.push({ ...base, qty: p.qty, lpId: p.lpId });
      }
    }
  }
  return out;
}

function toCsv(cells: Cell[], mark: number): string {
  const head =
    "wing,k,strike_usd,side,walk_pos,price_coin_prefee,qty_btc,cum_btc,premium_usd,exposure_usd,lp";
  const rows = cells.map((c) =>
    [
      c.wing,
      c.k,
      c.strike,
      c.side,
      c.pos,
      c.price,
      c.qty,
      c.cum,
      c.qty * c.price * mark,
      c.qty * mark,
      c.lpId ?? "",
    ].join(",")
  );
  return [head, ...rows].join("\n");
}

// A production snapshot flattens to ~14.4k cells (120 strikes × 60 rungs × 2 sides,
// LP0-only), so the table always windows; CSV/JSON export is the bulk path.
const PAGE = 500;

export default function BookCellsView() {
  const { snapshot, isLoading, error, ownOnly, fetchedAt } = useBookStore();
  const myLpIds = useLpCurveStore((s) => s.myLpIds);
  const ownIds = useMemo(() => new Set(myLpIds), [myLpIds]);

  const [wing, setWing] = useState<"all" | "call" | "put">("all");
  const [side, setSide] = useState<"all" | "bid" | "ask">("all");
  const [limit, setLimit] = useState(PAGE);
  const [copied, setCopied] = useState<string | null>(null);

  const mark = snapshot?.oracle_price ?? 0;
  const all = useMemo(() => flatten(snapshot), [snapshot]);

  const cells = useMemo(
    () =>
      all.filter(
        (c) =>
          (wing === "all" || c.wing === wing) &&
          (side === "all" || c.side === side) &&
          (!ownOnly || (c.lpId != null && ownIds.has(c.lpId)))
      ),
    [all, wing, side, ownOnly, ownIds]
  );

  const shown = cells.slice(0, limit);

  // A chart gives correspondence for free — a bar's height IS the comparison. A grid of
  // numerals gives none, so the two magnitude columns carry their own bar, scaled to the
  // largest value on screen. Same job as the depth strip, done per row.
  const scale = useMemo(() => {
    const q = Math.max(1e-12, ...shown.map((c) => c.qty));
    const m = Math.max(1e-12, ...shown.map((c) => c.cum));
    return { qty: q, cum: m };
  }, [shown]);

  /** Each ladder is a contiguous run of rows; this is where a new one starts. */
  const startsLadder = (c: Cell, prev?: Cell) =>
    !prev || prev.k !== c.k || prev.wing !== c.wing || prev.side !== c.side;

  const copy = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  if (isLoading && !snapshot) return <Skeleton className="h-full w-full bg-gray-800" />;

  const btn =
    "h-6 px-2 text-2xs tracking-wider border bg-[#1a1a1a] transition-colors " + ibmPlexMono.className;
  const on = "border-[#0ABAB5] text-[#0ABAB5]";
  const off = "border-gray-600 text-gray-400 hover:text-white";

  return (
    <div className="flex flex-col h-full w-full gap-2">
      <div className="flex items-baseline justify-between px-2 shrink-0">
        <span className={`text-2xs tracking-widest text-[#E4E4E4] ${ibmPlexMono.className}`}>
          {ownOnly ? "YOUR BOOK" : "MARKET BOOK"} — CELLS (wing · k · price · side · LP)
        </span>
        <span className={`text-2xs text-[#C9C8C8] ${ibmPlexMono.className}`}>
          Mark {mark ? mark.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1 px-2 shrink-0">
        {(["all", "call", "put"] as const).map((w) => (
          <button key={w} type="button" onClick={() => setWing(w)} className={`${btn} ${wing === w ? on : off}`}>
            {w.toUpperCase()}
          </button>
        ))}
        <span className="w-2" />
        {(["all", "bid", "ask"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setSide(s)} className={`${btn} ${side === s ? on : off}`}>
            {s === "bid" ? "BID (SELL)" : s === "ask" ? "ASK (BUY)" : "ALL"}
          </button>
        ))}
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => copy("csv", toCsv(cells, mark))}
          title="Copy every filtered cell as CSV"
          className={`${btn} ${off}`}
        >
          {copied === "csv" ? "COPIED" : "COPY CSV"}
        </button>
        <button
          type="button"
          onClick={() => copy("json", JSON.stringify(snapshot, null, 2))}
          title="Copy the raw /api/book/snapshot payload"
          className={`${btn} ${off}`}
        >
          {copied === "json" ? "COPIED" : "COPY JSON"}
        </button>
      </div>

      {/* What a row IS, in words, before any numbers. The table is the finest grain of
          the book, and nothing else on screen says what that grain means. */}
      <div className="px-2 shrink-0">
        <p className={`text-2xs text-[#C9C8C8] leading-relaxed ${ibmPlexMono.className}`}>
          One row = one price step, on one side, at one offset, from one LP.
          {shown[0] && (
            <>
              {" "}
              Row 1 reads: <span className="text-[#E4E4E4]">{shown[0].lpId ?? "an LP"}</span> will{" "}
              <span className="text-[#E4E4E4]">{shown[0].side === "bid" ? "buy" : "sell"}</span>{" "}
              <span className="text-[#E4E4E4]">{shown[0].qty.toFixed(4)} ₿</span> of the{" "}
              <span className="text-[#E4E4E4]">
                {fmtK(shown[0].k)} {shown[0].wing}
              </span>{" "}
              at <span className="text-[#E4E4E4]">{shown[0].price.toFixed(4)}</span> coin
              {mark > 0 && (
                <> (≈ ${(shown[0].qty * shown[0].price * mark).toLocaleString("en-US", { maximumFractionDigits: 0 })})</>
              )}.
            </>
          )}
        </p>
        <p className={`text-2xs text-[#8A8A8A] leading-relaxed ${ibmPlexMono.className}`}>
          {cells.length.toLocaleString()} cells{cells.length !== all.length && ` of ${all.length.toLocaleString()}`}
          {shown.length < cells.length && ` · showing ${shown.length.toLocaleString()}`}
          {" · k is the book's real key and holds still; STRIKE $ is k × mark, so it moves when the mark does"}
          {" · CUM walks one offset's one side, touch-first, and resets at the next — depth never sums across offsets"}
          {" · prices exclude fees"}
        </p>
        {/* Provenance: which endpoint, how often, as of when. */}
        <p className={`text-2xs text-[#677275] ${ibmPlexMono.className}`}>
          source GET /api/book/snapshot · polled 2s · as of{" "}
          {fetchedAt ? new Date(fetchedAt).toLocaleTimeString("en-US", { hour12: false }) : "—"}
        </p>
      </div>

      {error && <p className={`px-2 text-2xs text-gray-400 ${ibmPlexMono.className}`}>book unavailable</p>}

      {/* The element that SCROLLS must be the sticky cells' nearest scrolling ancestor,
          with no overflow-hidden in between — otherwise the headers resolve against a
          container that never scrolls and slide away with the rows. The rounded/clipping
          wrapper therefore sits ABOVE the scroller, not between it and the table. */}
      <div className="flex-1 min-h-0 px-2 pb-2">
        <div className="h-full flex flex-col rounded-xl border-2 border-[#808080] bg-[#0E1B1E] overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full caption-bottom text-sm border-0">
              <TableHeader>
                <TableRow className="bg-[#112226] border-b-2 border-[#808080] hover:bg-[#112226]">
                  {[
                    ["k", "offset from mark — the book's key, fixed between trades"],
                    ["WING", "call or put; follows k's sign"],
                    ["STRIKE $", "k × mark — a label, recomputed each poll"],
                    ["SIDE", "bid = LP buys (you sell) · ask = LP sells (you buy)"],
                    ["PRICE", "premium in coin, per unit, before fees"],
                    ["QTY ₿", "size resting at this one price step"],
                    ["CUM ₿", "running size from the touch; resets each offset+side"],
                    ["VALUE $", "qty × price × mark — premium if this step fills"],
                    ["LP", "which liquidity provider posted it"],
                  ].map(([h, tip]) => (
                    <TableHead
                      key={h}
                      title={tip}
                      // Numeric headers right-align with their column: a right edge is
                      // what makes digits line up by place value down the page, which is
                      // the whole reason a column of numbers can be read at a glance.
                      className={`sticky top-0 z-20 bg-[#112226] text-[#C9C8C8] py-2 tracking-wider font-semibold text-2xs ${
                        ["PRICE", "QTY ₿", "CUM ₿", "VALUE $"].includes(h) ? "text-right" : ""
                      } ${ibmPlexMono.className}`}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-20 bg-[#0E1B1E] text-[#C9C8C8] text-center">
                      {ownOnly ? "none of your LP curves quote into this book" : "No cells."}
                    </TableCell>
                  </TableRow>
                ) : (
                  shown.flatMap((c, i) => {
                    const own = c.lpId != null && ownIds.has(c.lpId);
                    const cell = `text-xs ${ibmPlexMono.className} text-[#C9C8C8] py-1`;
                    // tabular-nums + a right edge: digits stack by place value, so the
                    // column can be compared down the page without reading any one number.
                    const num = `${cell} text-right tabular-nums`;
                    // A chart gives comparison for free — a bar's length IS the reading.
                    // The two magnitude columns carry their own, scaled to what's on screen.
                    const barTo = (frac: number, color: string) => {
                      const pct = Math.max(0, Math.min(100, frac * 100));
                      return { background: `linear-gradient(to right, ${color} ${pct}%, transparent ${pct}%)` };
                    };
                    const rows: React.ReactNode[] = [];

                    // A ladder is a contiguous run of rows. Its header says which one you
                    // are inside and what it totals — sticky, because over thousands of
                    // rows the run you are reading scrolls far past any rule at its start.
                    if (startsLadder(c, shown[i - 1])) {
                      const rest = shown.slice(i + 1);
                      const nextStart = rest.findIndex((x, j) => startsLadder(x, rest[j - 1] ?? c));
                      const len = (nextStart === -1 ? rest.length : nextStart) + 1;
                      const last = shown[i + len - 1];
                      rows.push(
                        <TableRow key={`h-${c.wing}|${c.k}|${c.side}`} className="hover:bg-transparent border-0">
                          <TableCell
                            colSpan={9}
                            className={`sticky top-7 z-10 py-1 text-2xs tracking-wider text-[#E4E4E4] ${ibmPlexMono.className}`}
                            style={{ background: c.side === "bid" ? SELL_BG : BUY_BG }}
                          >
                            {fmtK(c.k)} {c.wing.toUpperCase()} · {c.side === "bid" ? "BID — YOU SELL" : "ASK — YOU BUY"}
                            <span className="text-[#C9C8C8]">
                              {`  ·  ${len} step${len === 1 ? "" : "s"}`}
                              {last ? `  ·  ${last.cum.toFixed(4)} ₿ cumulative` : ""}
                              {`  ·  strike ${c.strike.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    rows.push(
                      <TableRow
                        key={`${c.wing}|${c.k}|${c.side}|${c.price}|${c.lpId ?? "agg"}`}
                        className={`hover:bg-gray-800 border-b border-[#808080]/20 last:border-0 ${
                          own ? "bg-[#0ABAB5]/10" : "bg-[#0E1B1E]"
                        }`}
                      >
                        <TableCell className={`text-xs ${ibmPlexMono.className} text-[#E4E4E4] py-1 tabular-nums`}>
                          {fmtK(c.k)}
                        </TableCell>
                        <TableCell className={cell}>{c.wing}</TableCell>
                        <TableCell className={`text-xs ${ibmPlexMono.className} text-[#8A8A8A] py-1 tabular-nums`}>
                          {c.strike.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell
                          className={`text-xs ${ibmPlexMono.className} py-1 text-[#E4E4E4]`}
                          style={{ background: c.side === "bid" ? SELL_BG : BUY_BG }}
                        >
                          {c.side === "bid" ? "bid · you sell" : "ask · you buy"}
                        </TableCell>
                        <TableCell className={num}>{c.price.toFixed(4)}</TableCell>
                        <TableCell className={num} style={barTo(c.qty / scale.qty, "#0ABAB524")}>
                          {c.qty.toFixed(4)}
                        </TableCell>
                        <TableCell
                          className={num}
                          style={barTo(c.cum / scale.cum, c.side === "bid" ? `${SELL_ACCENT}40` : `${BUY_ACCENT}40`)}
                        >
                          {c.cum.toFixed(4)}
                        </TableCell>
                        <TableCell className={num}>
                          {(c.qty * c.price * mark).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell
                          className={`text-xs ${ibmPlexMono.className} py-1`}
                          style={{ color: own ? OWN_LP_COLOR : "#C9C8C8" }}
                        >
                          {c.lpId == null ? "—" : own ? `${c.lpId} (you)` : c.lpId}
                        </TableCell>
                      </TableRow>
                    );
                    return rows;
                  })
                )}
                {shown.length < cells.length && (
                  <TableRow className="border-b-0">
                    <TableCell
                      colSpan={9}
                      className={`text-2xs text-center py-2 cursor-pointer bg-[#112226] text-[#0ABAB5] ${ibmPlexMono.className}`}
                      onClick={() => setLimit((l) => l + PAGE)}
                    >
                      … {(cells.length - shown.length).toLocaleString()} more cells ↓ (click to load {PAGE})
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

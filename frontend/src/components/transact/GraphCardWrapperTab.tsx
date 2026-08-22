"use client";

import { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "../ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import GraphCard from "./GraphCard";
// BookCellsView (the flat fact-table dump, formerly the DETAIL toggle state) is commented
// out per owner direction (2026-07-28) — "no hybrid" — restore by uncommenting this import
// plus the bookViewOptions/bookView-union entries it used to occupy. File kept on disk.
// import BookCellsView from "./BookCellsView";
import BookProjectionView from "./BookProjectionView";
import { useGraphStore } from "@/store/graphStore";
import GraphCardMarketTV from "./GraphCardMarketTV";
import { CandleResolution } from "@/lib/data";
import { useTradeStore } from "@/store/tradeStore";
import { useBookStore } from "@/store/bookStore";
import { Card } from "../ui/card";
import { ibmPlexMono } from "@/lib/font";
import { v3BookEnabled } from "@/lib/v3BookFlag";

const graphOptions = [
  { label: "Perp Mark Pricing", value: "PerpGraph" },
  // Options Pricing commented out per owner direction (2026-07-28), temporary — restore
  // by uncommenting this entry (see also the earn-tab default below and graphStore's
  // persisted-selection guard, both changed to fall back to BookGraph in its absence).
  // { label: "Options Pricing", value: "OptionsGraph" },
  { label: "Order Book", value: "BookGraph" },
];

/** One view of the book at a time, toggled — each named by its two axes, in market
 *  words, all three rendered as TABLES (cross-tabs), not charts. PRICE × SIZE IS the
 *  actual book (one strike's real ladder); PRICE × STRIKE and SIZE × STRIKE are its
 *  aggregations across strikes — there is no separate 4th "raw" tab (owner correction,
 *  2026-07-28: a standalone BOOK tab just duplicated PRICE × SIZE across strikes).
 *  A BOOK entry lived here — commented out, not deleted; restore alongside the
 *  bookView union and BookProjectionView's book-rendering branch if it comes back. */
const bookViewOptions = [
  { value: "px", label: "PRICE × STRIKE", title: "The book matrix: size resting at each price level, per strike" },
  // SIZE × STRIKE and PRICE × SIZE commented out (owner, 2026-07-29: "comment the
  // fuck out the second and third views" — the book shows its front face only; no view
  // choice). Restore by uncommenting; their render branches stay in BookProjectionView.
  // { value: "sx", label: "SIZE × STRIKE", title: "VWAP price to fill each size level, per strike" },
  // { value: "ps", label: "PRICE × SIZE", title: "The single-strike depth-of-market ladder — the actual book" },
  // { value: "book", label: "BOOK", title: "The raw resting book, unaggregated — exact rung prices and sizes" },
] as const;

// v3 view entries commented out (owner-flagged regression, 2026-08-13): the
// 2026-07-29 "comment the fuck out the second and third views" ruling scopes to
// the BOOK'S PRESENTATION — front face only, no view choice — not to the v2
// source, so a new source (v3) does not resurrect the choice. Reintroducing
// these behind SOURCE=v3 was a regression, not an addition. Their render
// branches in BookProjectionView (v3SxCell, the ps mid/bid/ask reading) stay,
// same as v2's — restore by uncommenting, owner-blessed only (#60 depiction).
const v3OnlyViewOptions = [
  // { value: "sx", label: "SIZE × STRIKE", title: "v3 closed form: VWAP price to fill each size level, per strike" },
  // { value: "ps", label: "PRICE × SIZE", title: "v3: mid/bid/ask at one strike — no discrete rungs, size columns blank" },
] as const;

const resolutionOptions = [
  {
    label: "MINUTES",
    options: [
      { label: "5 Minutes", value: "5m" },
      { label: "15 Minutes", value: "15m" },
    ],
  },
  {
    label: "HOURS",
    options: [
      { label: "1 Hour", value: "1h" },
      { label: "4 Hours", value: "4h" },
    ],
  },
  {
    label: "DAYS",
    options: [
      { label: "1 Day", value: "1d" },
      { label: "1 Week", value: "1w" },
      { label: "1 Month", value: "1M" },
    ],
  },
];

export function GraphCardWrapperTab() {
  const { selectedGraph, setSelectedGraph, resolution, setResolution } =
    useGraphStore();
  const { activeTab } = useTradeStore();
  const { ownOnly, setOwnOnly, bookView, setBookView, connectBookStream, disconnectBookStream, dataSource, setDataSource } =
    useBookStore();
  // Additive, off by default (CLAUDE.md v3 hygiene: v2 stays byte-identical until this
  // is set) — with the flag unset, showV3Toggle is false, the SOURCE button never
  // renders, and dataSource can never leave its "v2" default (nothing else sets it).
  const showV3Toggle = v3BookEnabled();
  const isV3 = dataSource === "v3";
  // v3OnlyViewOptions is EMPTY (front face only is source-independent — CLAUDE.md
  // UX law, owner-flagged 2026-08-13); the spread is kept only so uncommenting its
  // entries restores them. Either way this is bookViewOptions when v3 is off.
  const viewOptions = isV3 ? [...bookViewOptions, ...v3OnlyViewOptions] : bookViewOptions;

  // Smooth fade transition state
  const [displayedGraph, setDisplayedGraph] = useState(selectedGraph);
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Per-tab default chart, applied on tab ENTRY only so the selector stays free afterwards:
  // create-perp is candles-only; earn opened on the Burr-2 option curve (solid market +
  // dotted lp-preview, UX §B.1) until Options Pricing was commented out of the selector
  // (owner, 2026-07-28) — earn now opens on the book instead. trade-bands keeps its last pick.
  // EARN also defaults the book's own OWN ONLY toggle to true on this same entry (owner,
  // 2026-07-30: EARN's purpose is the viewer's own book; MARKET BOOK is one click away) —
  // this is bookStore's single shared `ownOnly` field, same one TRADE BANDS' own toggle
  // reads/writes, so it's a default on entry, not an isolated per-tab value (identical
  // trade-off to selectedGraph itself, which trade-bands already "keeps the last pick" of).
  useEffect(() => {
    if (activeTab === "create-perp") setSelectedGraph("PerpGraph");
    else if (activeTab === "earn") { setSelectedGraph("BookGraph"); setOwnOnly(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Both book panels read the snapshot but neither owns the poll — GraphCard is the
  // other call site and is UNMOUNTED whenever the book is on screen, so its cleanup
  // would stop the stream exactly when the book needs it. connect is idempotent.
  const showBook = displayedGraph === "BookGraph";
  useEffect(() => {
    if (!showBook) return;
    connectBookStream();
    return () => disconnectBookStream();
  }, [showBook, connectBookStream, disconnectBookStream]);

  // Handle smooth graph transition
  useEffect(() => {
    if (selectedGraph !== displayedGraph) {
      // Clear any pending timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Fade out
      setIsVisible(false);

      // After fade-out completes, swap graph and fade in
      timeoutRef.current = setTimeout(() => {
        setDisplayedGraph(selectedGraph);
        // Small delay to let the new component mount before fading in
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }, 200);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [selectedGraph, displayedGraph]);

  return (
    <Card className=" bg-[#0E1B1E] border-2 border-black rounded-none p-2 lg:p-3 flex flex-col h-full min-w-0 min-h-0">
      <div className="relative rounded-none p-1.5 flex flex-col h-full min-w-0 min-h-0 text-white">

        <div className="h-8 mb-1.5 w-full flex items-center shrink-0">
          {activeTab === "trade-bands" || activeTab === "earn" ? (
            <div className="flex flex-wrap gap-2 justify-between w-full min-w-0">
              {/* Graph Type Tabs */}
              <Tabs value={selectedGraph} onValueChange={setSelectedGraph}>
                <TabsList className="bg-[#191919] border border-[#004240] rounded-none h-auto px-2 py-1">
                  {graphOptions.map(({ value, label }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="h-auto px-2 py-2 text-white hover:bg-gray-700/50 data-[state=active]:bg-[#191919] data-[state=active]:text-[#0ABAB5] border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#0ABAB5] rounded-none transition-all duration-200"
                    >
                      <span className={`text-xs tracking-wider font-medium ${ibmPlexMono.className}`}>{label.toUpperCase()}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                {/* Resolution Selector (Only for PerpGraph on trade-bands) */}
                {selectedGraph === "PerpGraph" && activeTab === "trade-bands" && (
                  <Select
                    value={resolution}
                    onValueChange={(val) => setResolution(val as CandleResolution)}
                  >
                    <SelectTrigger className="w-32 h-7 text-2xs text-white border border-gray-600 bg-[#1a1a1a]">
                      <SelectValue placeholder="Resolution" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] text-white">
                      {resolutionOptions.map((group) => (
                        <SelectGroup key={group.label}>
                          <SelectLabel className="text-gray-400 text-2xs px-2 pt-2">
                            {group.label}
                          </SelectLabel>
                          {group.options.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-2xs">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Order-Book controls: view switch + own-only filter (all views honour
                    ownOnly; the bar-chart toggles this panel used to carry left with it). */}
                {selectedGraph === "BookGraph" && (
                  <>
                    {/* One view of the book at a time, not three panels at once — each
                        named by its two axes, no invented jargon. BOOK is the raw
                        resting book, one column per strike, no aggregation. */}
                    <div className="flex border border-gray-600 bg-[#1a1a1a]">
                      {viewOptions.length > 1 && viewOptions.map(({ value, label, title }, i) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setBookView(value)}
                          aria-pressed={bookView === value}
                          title={title}
                          className={`h-7 px-2.5 text-2xs tracking-wider whitespace-nowrap transition-colors ${ibmPlexMono.className} ${
                            i > 0 ? "border-l border-gray-600" : ""
                          } ${bookView === value ? "text-[#0ABAB5]" : "text-gray-400 hover:text-white"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {/* OWN ONLY toggle — TRADE BANDS and EARN both render it (owner,
                        2026-07-30: restored EARN's own/whole choice; forced YOUR-BOOK-ONLY
                        was a 2026-07-29 stopgap while ghost-preview reconciliation was new
                        and MARKET BOOK's house-pool ladder read as noise, but that's moot
                        under the closed system). Same control both tabs share, no new UI
                        concept: this button flips bookStore's one `ownOnly` field; EARN's
                        activeTab-entry effect above just DEFAULTS it true on arrival, one
                        click away from the whole book, same as TRADE BANDS always was. */}
                    <button
                      type="button"
                      onClick={() => setOwnOnly(!ownOnly)}
                      aria-pressed={ownOnly}
                      title="Show only your own LP rungs"
                      className={`h-7 px-3 text-2xs tracking-wider border bg-[#1a1a1a] transition-colors ${ibmPlexMono.className} ${
                        ownOnly
                          ? "border-[#0ABAB5] text-[#0ABAB5]"
                          : "border-gray-600 text-white hover:border-gray-400"
                      }`}
                    >
                      OWN ONLY
                    </button>
                    {/* SOURCE toggle — additive, flag-gated (NEXT_PUBLIC_V3_BOOK): with the
                        flag unset this renders nothing and dataSource can never leave "v2",
                        so v2's own book is byte-identical to before this existed. On: reads
                        the v3 read-only continuation-mechanism aggregate (GET /api/v3/book)
                        through these SAME table views instead of the v2 wire snapshot —
                        see bookStore.dataSource / BookProjectionView's isV3 branches. */}
                    {showV3Toggle && (
                      <div className="flex border border-gray-600 bg-[#1a1a1a]" role="group" aria-label="book data source">
                        {(["v2", "v3"] as const).map((s, i) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setDataSource(s)}
                            aria-pressed={dataSource === s}
                            title={s === "v2" ? "the deployed v2 multi-LP book" : "the v3 continuation-mechanism aggregate (read-only preview)"}
                            className={`h-7 px-2.5 text-2xs tracking-wider whitespace-nowrap transition-colors ${ibmPlexMono.className} ${
                              i > 0 ? "border-l border-gray-600" : ""
                            } ${dataSource === s ? "text-[#0ABAB5]" : "text-gray-400 hover:text-white"}`}
                          >
                            {s.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : activeTab === "create-perp" ? (
            <div className="flex gap-2 justify-end w-full">
              {/* Resolution Selector for Create Perp tab */}
              <Select
                value={resolution}
                onValueChange={(val) => setResolution(val as CandleResolution)}
              >
                <SelectTrigger className="w-32 h-7 text-2xs text-white border border-gray-600 bg-[#1a1a1a]">
                  <SelectValue placeholder="Resolution" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] text-white">
                  {resolutionOptions.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel className="text-gray-400 text-2xs px-2 pt-2">
                        {group.label}
                      </SelectLabel>
                      {group.options.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-2xs">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex px-12">
              <h1>&nbsp;</h1>
            </div>
          )}
        </div>

        {/* Chart Display */}
        {/* min-w-0: flex item default min-width:auto otherwise lets a wide child (the
            book's many-strike tables) drag this pane — and the page — wider than the
            viewport instead of scrolling inside itself. */}
        <div className="flex-1 min-w-0 min-h-0 h-full">
          <div
            className="h-full w-full min-w-0 transition-opacity duration-200 ease-in-out"
            style={{ opacity: isVisible ? 1 : 0 }}
          >
            {activeTab === "create-perp" ? (
              <GraphCardMarketTV />
            ) : displayedGraph === "BookGraph" ? (
              // Both tabs read bookStore.ownOnly live now (owner 2026-07-30, see the OWN
              // ONLY toggle's own comment above) — EARN just defaults it true on entry.
              <BookProjectionView />
            ) : displayedGraph === "PerpGraph" ? (
              <GraphCardMarketTV />
            ) : (
              // Unreachable while Options Pricing is commented out of graphOptions above
              // (kept, not deleted, per "comment-out scope only" — see the import note).
              <GraphCard />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

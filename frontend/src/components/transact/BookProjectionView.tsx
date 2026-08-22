"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useBookStore } from "@/store/bookStore";
import { useLpCurveStore, paramsAtDefaults } from "@/store/lpCurveStore";
import type { BookSnapshotStrike } from "@/lib/data/api/contracts";
import type { V3Strike } from "@/lib/data/api/v3contracts";
import { Skeleton } from "../ui/skeleton";
import { ibmPlexMono } from "@/lib/font";
import { BUY_BG, BUY_ACCENT, SELL_BG, SELL_ACCENT } from "@/lib/utils";
import {
  shapeFromDials, wingPrice, ghostRungs, effDelta, dialsAreNeutral, deltaK, K_STEP, K_SPAN_STEPS,
  type GhostDials, type GhostRung,
} from "@/lib/burr2/pricer";

// Ratified call/put accents (GraphCard.tsx CALL_MARKER/PUT_MARKER) — reserved for
// call/put identity only, never reused for bid/ask (which stay BUY_ACCENT/SELL_ACCENT).
const CALL_COLOR = "#54D200";
const PUT_COLOR = "#DC5D5B";

// YOUR BOOK's ghost-proforma playground (2026-07-29 spec) — dial labels are exact
// UNITS_AND_SEMANTICS.md vocabulary, not paraphrased. Client-side only: dragging a
// dial re-derives a Burr-2 shape (lib/burr2/pricer) and previews it as a faint
// overlay on this SAME table, never a round trip to the backend.
const DIAL_SPECS: { key: keyof GhostDials; label: string; min: number; max: number; step: number; fmt: (v: number) => string }[] = [
  { key: "ell", label: "vol level ℓ", min: -0.5, max: 0.5, step: 0.01, fmt: (v) => v.toFixed(2) },
  { key: "kappa0", label: "tilt κ₀", min: -0.5, max: 0.5, step: 0.01, fmt: (v) => v.toFixed(2) },
  { key: "wing", label: "wing w", min: -0.5, max: 0.5, step: 0.01, fmt: (v) => v.toFixed(2) },
  { key: "capacity", label: "capacity ×", min: 0.25, max: 4, step: 0.05, fmt: (v) => `${v.toFixed(2)}×` },
  { key: "finv", label: "inventory f", min: 0, max: 1, step: 0.01, fmt: (v) => v.toFixed(2) },
];

/**
 * ONE view at a time, toggled — as cross-tab TABLES, not charts.
 *
 * The book is a surface: p = P(k) ∓ βq, premium a function of (strike, size). Each
 * table is that surface read from a different pair of axes, with the third axis living
 * IN THE CELLS (an aggregation choice) rather than a separate axis:
 *
 *   PRICE × STRIKE   the book matrix — notional (₿) resting at each premium level, per
 *                     strike. Sparse/diagonal by construction: a staircase, not a bug.
 *   SIZE × STRIKE    cost of size — VWAP premium to fill each cumulative size level,
 *                     per strike, ask (buy) and bid (sell) as stacked sub-rows.
 *   PRICE × SIZE     the single-strike depth-of-market ladder — the actual book, one
 *                     strike's real ladder; the other two are its aggregations across
 *                     strikes, not a separate 4th "raw" view (owner correction,
 *                     2026-07-28 — a standalone BOOK tab just duplicated this one).
 *
 * Every view keeps "2D + the ability to vary the plane" — one slider, its own cut axis,
 * plus an ALL|SECTION pair beside it: PRICE × STRIKE → size (q₀, ₿); SIZE × STRIKE →
 * price (coin budget); PRICE × SIZE → strike. ALL = the projection along that axis, full
 * table, no highlight — for px/sx exactly what the cells already aggregate; for ps the
 * projection along STRIKE (Δ notional per price bin, summed across every strike, per
 * side — briefly retracted as "mixing instruments", then re-derived by the owner as
 * legitimate geometry: sides can overlap where the wings cross, which the caption states
 * plainly rather than hiding). SECTION = the slider commits: on px/sx the cut becomes a
 * HIGHLIGHTED CONTOUR through the full table — dim everything except it, never hide —
 * PRICE × STRIKE lights the price bin, per strike per side, where cumulative depth from
 * touch first reaches q₀; SIZE × STRIKE lights the deepest size level, per strike, whose
 * cumulative price still fits the budget (the iso-cost silhouette, named without "cost")
 * — a column shallower than the cut simply has no highlight, correctly. The contour math
 * is cumulative-from-touch internally either way — geometry, not a displayed lens, so it
 * needs no user-facing toggle. ps's SECTION is the single-strike DOM ladder (its default
 * landing state, unlike px/sx which default ALL), opening centred on the spread (asks
 * above, bids below, both on screen) on mount and on every strike change, not scrolled
 * to the deepest ask. Colour law (owner): colour encodes SIDE, painted over the full
 * extent of the side-specific data — px/sx already tint per-cell (each cell is its own
 * side); the ladder tints the price cell plus the row's OWN-side cell only — the
 * opposite side's empty cell stays untinted (three-column unified layout).
 *
 * (States commented out of GraphCardWrapperTab's toggle, not deleted — DETAIL,
 * BookCellsView's flat fact-table dump, and BOOK, a since-rejected 4th tab.)
 *
 * A global Δ|Σ display toggle shipped and was then commented out (owner, 2026-07-28: it
 * read as muddy — VWAP↔marginal on SIZE × STRIKE is a different KIND of pair than
 * resting↔cumulated on PRICE × STRIKE, and one shared control over both wasn't honest
 * about that difference; the Δ/Σ vocabulary itself died with it — captions and the
 * ladder's own column headers are plain words now, "size"/"cum size"/"cum cost", no
 * glyphs). Each view shows its one preview-blessed reading, FIXED: PRICE × STRIKE is
 * always resting notional; SIZE × STRIKE is always VWAP cost-of-size — that reading IS
 * this view's identity, not a toggle option, and its "pre-fee, from touch" caption is a
 * fixed statement. PRICE × SIZE holds ONE layout in both modes — price | ask ₿ |
 * bid ₿ — SECTION filling one strike's exact rungs, ALL the cross-strike sums;
 * modes never change layout (owner ruling; cum columns commented out per the
 * cumulation ruling).
 *
 * Row axes (premium bins, size levels) and the two cut sliders' ranges are all derived
 * from the WHOLE (possibly OWN-ONLY-filtered) book, never from one column — so no
 * strike's column rescales the shared axis, and blank cells read as "nothing there".
 *
 * Sticky header row + first column use their OWN overflow-auto container with
 * `border-separate` (not shadcn's <Table> wrapper, and not `border-collapse`, which
 * breaks position:sticky on individual th/td in most engines) — sticky must resolve
 * against the div that actually scrolls, with no overflow-hidden between it and the
 * table, or headers/labels slide away with the rows they're supposed to pin. Every flex
 * ancestor on the path down to that scroll container needs min-w-0 (page.tsx's grid,
 * GraphCardWrapperTab's Card + wrappers, this file's table-container + scroll div) — a
 * flex item's default min-width is its content's max-content size, not 0, so without it
 * a wide table drags the whole page wider instead of scrolling inside its own pane.
 */

const fmtUsd = (v: number) => Math.round(v).toLocaleString("en-US");
const fmtK = (k: number) => `${k >= 0 ? "+" : ""}${(k * 100).toFixed(0)}%`;
const mono = ibmPlexMono.className;

/** $-perp cell/formula formatting: thousands separators once ≥$1 (the common case —
 *  qty×|Δ|×mark is rarely sub-dollar), adaptive decimals below $1 so a real sub-dollar
 *  reading never silently prints "$0" (same "must SEE his orders" law as ghostDp). */
function fmtUsdAdaptive(v: number): string {
  if (v === 0) return "0";
  return Math.abs(v) < 1 ? v.toFixed(4) : Math.round(v).toLocaleString("en-US");
}

// Σ-row surface (FORMAL_CORE.md "The ONE ruling on the Σ-row surface"): the size-unit
// toggle governs exactly ONE Σ-row (btc | perp | usd, never three at once); "premium $"
// below is a SEPARATE, untoggled functional (premiumUSD) — different name, different
// type, visually distinct label color so it never reads as a 4th toggle case.
const PREMIUM_LABEL_COLOR = "#E8B04B";

type Rung = { price: number; qty: number; cum: number; cumCost: number };
/** One strike, both sides pre-laddered: best-price-first, running size and coin cost.
 *  `v3` is present only when this cut came from the v3 aggregate book (bookStore
 *  dataSource==="v3") — bid/ask stay genuinely EMPTY there (v3 posts no discrete
 *  resting rungs, CLAUDE.md ABSENT ≠ ZERO), and `v3` carries the raw per-strike
 *  scalars (mid/bid/ask/half/depth/deltaAgg, verbatim from GET /api/v3/book) that
 *  the few v3-aware render branches below read directly instead of walking rungs. */
type Cut = {
  k: number; wing: string; strike: number; bid: Rung[]; ask: Rung[];
  v3?: { mid: number; bid: number; ask: number; half: number; depth: number; deltaAgg: number };
};
type PxCell = { bidD: number; askD: number; bidS: number; askS: number };
type SxCell = { askSigma: number | null; bidSigma: number | null; askDelta: number | null; bidDelta: number | null };

/** v3's SIZE × STRIKE cell, in closed form (amm/v3engine/quote.go TradeQuote — NOT a
 *  re-derivation of the pricing engine, just its published cost-of-size arithmetic on
 *  wire-delivered mid/half/depth): VWAP to fill `size` = mid ± (half + β·size/2);
 *  marginal price after that size = mid ± (half + β·size). Verified against a live
 *  GET /api/v3/book/quote (k=0.02, sizes 1/5/25, both sides — matched to float
 *  precision). NO SIZE CAP on the ask side (MAP_FORMAL depth_unbounded — the walk
 *  never runs out of posted depth, unlike a v2 ladder); the bid side is null past the
 *  point the LINEAR model would price below zero — a real domain limit of this map,
 *  not a fabricated cap, same null semantics as vwapForSize's "book doesn't go this
 *  deep" for a different reason. */
function v3SxCell(v3: { mid: number; half: number; depth: number }, size: number): SxCell {
  const { mid, half, depth } = v3;
  const bidSigma = mid - half - (depth * size) / 2;
  const bidDelta = mid - half - depth * size;
  return {
    askSigma: mid + half + (depth * size) / 2,
    askDelta: mid + half + depth * size,
    bidSigma: bidSigma > 0 ? bidSigma : null,
    bidDelta: bidDelta > 0 ? bidDelta : null,
  };
}

/** v3 strikes → the same Cut[] shape px/sx/ps already consume, so every existing
 *  render branch keeps working unmodified — only the branches that read `.bid`/`.ask`
 *  Rung arrays (which stay empty here) need a v3-aware alternate reading (sxMatrix,
 *  StrikeHead, the ps ladder — see their own comments). Sorted by k, same as the v2
 *  branch, so atmIdx/seam logic needs no v3-specific case. */
function cutsFromV3(strikes: V3Strike[], mark: number): Cut[] {
  return strikes
    .slice()
    .sort((a, b) => a.k - b.k)
    .map((s) => ({
      k: s.k,
      wing: s.k < 0 ? "put" : "call",
      strike: mark * (1 + s.k),
      bid: [],
      ask: [],
      v3: { mid: s.mid, bid: s.bid, ask: s.ask, half: s.half, depth: s.depth, deltaAgg: s.deltaAgg },
    }));
}

/** Best-price-first ladder for one side of one strike, with running size and coin cost.
 *  `own` restricts it to the viewer's own LP rungs (the OWN ONLY toggle). */
function ladder(s: BookSnapshotStrike, side: "bid" | "ask", own: Set<string> | null): Rung[] {
  const r = s.rungs
    .map((x) => ({
      price: x.price,
      qty: own
        ? x.perLp.reduce((t, p) => t + (p.side === side && own.has(p.lpId) ? p.qty : 0), 0)
        : side === "bid" ? x.bidQty : x.askQty,
    }))
    .filter((x) => x.qty > 0);
  r.sort((a, b) => (side === "bid" ? b.price - a.price : a.price - b.price));
  let cum = 0, cumCost = 0;
  return r.map((x) => {
    cum += x.qty;
    cumCost += x.qty * x.price;
    return { price: x.price, qty: x.qty, cum, cumCost };
  });
}

/** Σ: VWAP premium (coin) to fill `target` cumulative size from this ladder, best-price
 *  first (accumulated from the touch outward); null past the ladder's posted depth
 *  ("book doesn't go this deep"). */
function vwapForSize(l: Rung[], target: number): number | null {
  if (!l.length || l[l.length - 1].cum < target - 1e-9) return null;
  const j = l.findIndex((r) => r.cum >= target - 1e-9);
  const prev = j > 0 ? l[j - 1] : null;
  return ((prev?.cumCost ?? 0) + (target - (prev?.cum ?? 0)) * l[j].price) / target;
}

/** Δ: marginal price at `target` depth — the price of the rung that fills that size. */
function marginalPrice(l: Rung[], target: number): number | null {
  if (!l.length || l[l.length - 1].cum < target - 1e-9) return null;
  return l[l.findIndex((r) => r.cum >= target - 1e-9)].price;
}

/** "Nice" bin width (1/2/5×10^n), never finer than the ladder's own δ (0.005 coin), sized
 *  so the PRICE × STRIKE table stays ~40-60 rows regardless of how deep the book runs. */
function niceBin(maxP: number, minStep = 0.005, targetRows = 50): number {
  const raw = Math.max(maxP / targetRows, minStep);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

const SIZE_LEVELS = [0.5, 1, 2, 5, 10, 20, 40, 80, 160, 320, 640];
/** 1-2-5 size ladder, one step past the deepest side present, so the last row visibly
 *  runs past posted depth instead of padding the table with always-blank rows. */
function sizeLevels(maxQ: number): number[] {
  const i = SIZE_LEVELS.findIndex((v) => v > maxQ);
  return SIZE_LEVELS.slice(0, i === -1 ? SIZE_LEVELS.length : i + 1);
}

// A BOOK 4th tab (raw lattice, one column per strike, no bins/VWAPs) shipped and was then
// rejected by the owner — "the actual book lives WITHIN [the three], PRICE × SIZE IS the
// book." Its render branch and these two export helpers are commented out, not deleted;
// restore alongside GraphCardWrapperTab's bookViewOptions entry and the bookView union.
// function bookCsv(cuts: Cut[]): string {
//   const head = "k,wing,strike,side,pos,price_coin,qty_btc,cum_btc";
//   const rows: string[] = [];
//   cuts.forEach((c) => {
//     c.ask.forEach((r, i) => rows.push([c.k, c.wing, c.strike, "ask", i + 1, r.price, r.qty, r.cum].join(",")));
//     c.bid.forEach((r, i) => rows.push([c.k, c.wing, c.strike, "bid", i + 1, r.price, r.qty, r.cum].join(",")));
//   });
//   return [head, ...rows].join("\n");
// }
// function bookJson(cuts: Cut[]): string {
//   const cells: Record<string, unknown>[] = [];
//   cuts.forEach((c) => {
//     c.ask.forEach((r, i) => cells.push({ k: c.k, wing: c.wing, strike: c.strike, side: "ask", pos: i + 1, price: r.price, qty: r.qty, cum: r.cum }));
//     c.bid.forEach((r, i) => cells.push({ k: c.k, wing: c.wing, strike: c.strike, side: "bid", pos: i + 1, price: r.price, qty: r.qty, cum: r.cum }));
//   });
//   return JSON.stringify(cells, null, 2);
// }

/** Export lives in the pane header now (moved off the deleted BOOK tab) and always
 *  reflects whichever view is showing. CSV mirrors the visual grid; JSON additionally
 *  carries both Δ and Σ readings per cell (cheap — already computed) regardless of the
 *  display toggle, since a raw export shouldn't silently drop the reading not on screen. */
function pxCsv(cuts: Cut[], pxMatrix: Map<number, PxCell>[], binWidth: number, nBins: number): string {
  const head = ["premium_low", ...cuts.flatMap((c) => [`${c.strike}_ask_delta`, `${c.strike}_ask_sigma`, `${c.strike}_bid_delta`, `${c.strike}_bid_sigma`])].join(",");
  const rows: string[] = [];
  for (let bin = nBins - 1; bin >= 0; bin--) {
    const row = [(bin * binWidth).toFixed(4)];
    cuts.forEach((_, i) => {
      const e = pxMatrix[i]?.get(bin);
      row.push(e ? String(e.askD) : "", e ? String(e.askS) : "", e ? String(e.bidD) : "", e ? String(e.bidS) : "");
    });
    rows.push(row.join(","));
  }
  return [head, ...rows].join("\n");
}
function pxJson(cuts: Cut[], pxMatrix: Map<number, PxCell>[], binWidth: number): string {
  const cells: Record<string, unknown>[] = [];
  cuts.forEach((c, i) =>
    pxMatrix[i]?.forEach((e, bin) => {
      if (e.askD > 0) cells.push({ strike: c.strike, k: c.k, premium_low: bin * binWidth, side: "ask", delta: e.askD, sigma: e.askS });
      if (e.bidD > 0) cells.push({ strike: c.strike, k: c.k, premium_low: bin * binWidth, side: "bid", delta: e.bidD, sigma: e.bidS });
    })
  );
  return JSON.stringify(cells, null, 2);
}

function sxCsv(cuts: Cut[], sxMatrix: SxCell[][], levels: number[]): string {
  const head = ["size_level_btc", "side", ...cuts.flatMap((c) => [`${c.strike}_sigma_vwap`, `${c.strike}_delta_marginal`])].join(",");
  const rows: string[] = [];
  levels.forEach((lvl, li) => {
    (["ask", "bid"] as const).forEach((side) => {
      const row = [String(lvl), side];
      cuts.forEach((_, i) => {
        const cell = sxMatrix[li][i];
        const sigma = side === "ask" ? cell.askSigma : cell.bidSigma;
        const delta = side === "ask" ? cell.askDelta : cell.bidDelta;
        row.push(sigma == null ? "" : String(sigma), delta == null ? "" : String(delta));
      });
      rows.push(row.join(","));
    });
  });
  return [head, ...rows].join("\n");
}
function sxJson(cuts: Cut[], sxMatrix: SxCell[][], levels: number[]): string {
  const cells: Record<string, unknown>[] = [];
  levels.forEach((lvl, li) =>
    cuts.forEach((c, i) => {
      const cell = sxMatrix[li][i];
      (["ask", "bid"] as const).forEach((side) => {
        const sigma = side === "ask" ? cell.askSigma : cell.bidSigma;
        const delta = side === "ask" ? cell.askDelta : cell.bidDelta;
        if (sigma != null || delta != null) cells.push({ level: lvl, strike: c.strike, k: c.k, side, sigma_vwap: sigma, delta_marginal: delta });
      });
    })
  );
  return JSON.stringify(cells, null, 2);
}

function psCsv(cut: Cut | undefined, mark: number): string {
  const head = "side,price_coin,delta_size_btc,sigma_size_btc,sigma_cost_usd";
  const rows: string[] = [];
  if (cut) {
    [...cut.ask].reverse().forEach((r) => rows.push(["ask", r.price, r.qty, r.cum, (r.cumCost * mark).toFixed(2)].join(",")));
    cut.bid.forEach((r) => rows.push(["bid", r.price, r.qty, r.cum, (r.cumCost * mark).toFixed(2)].join(",")));
  }
  return [head, ...rows].join("\n");
}
function psJson(cut: Cut | undefined, mark: number): string {
  const cells: Record<string, unknown>[] = [];
  if (cut) {
    const rec = (side: "ask" | "bid", r: Rung) => ({ side, strike: cut.strike, k: cut.k, price: r.price, delta_size: r.qty, sigma_size: r.cum, sigma_cost_usd: r.cumCost * mark });
    [...cut.ask].reverse().forEach((r) => cells.push(rec("ask", r)));
    cut.bid.forEach((r) => cells.push(rec("bid", r)));
  }
  return JSON.stringify(cells, null, 2);
}

// PRICE × SIZE's ALL reading: the projection along the strike axis — Δ notional per
// price bin, summed across every strike, per side. Briefly retracted, then re-derived
// by the owner as legitimate geometry (2026-07-28): "the sum of size per price bin
// across every strike, per side" — a projection, not a claim about one book's depth
// (the sides can overlap where the put and call wings cross the same price bin).
type AllRow = { bin: number; ask: number; bid: number };
function psAllCsv(rows: AllRow[], binWidth: number): string {
  const head = "price_low_coin,ask_notional_btc,bid_notional_btc";
  return [head, ...rows.map((r) => [(r.bin * binWidth).toFixed(4), r.ask, r.bid].join(","))].join("\n");
}
function psAllJson(rows: AllRow[], binWidth: number): string {
  return JSON.stringify(rows.map((r) => ({ price_low: r.bin * binWidth, ask_notional_btc: r.ask, bid_notional_btc: r.bid })), null, 2);
}

/** `ownOnly` is bookStore's own live toggle, shared with TRADE BANDS — both tabs read
 *  and write the SAME field via the one OWN ONLY control (GraphCardWrapperTab.tsx).
 *  EARN forced this permanently true from 2026-07-29 to 2026-07-30 (a `forceOwnOnly`
 *  render-scoped prop here, never touching the store) while ghost-preview reconciliation
 *  was new and MARKET BOOK's house-only ladder read as noise; owner-restored 2026-07-30
 *  — the toggle is real again, EARN just DEFAULTS to true on tab entry (GraphCardWrapperTab's
 *  activeTab-effect calls setOwnOnly(true) once per earn-tab entry, same idiom as its
 *  per-tab default chart), one click away from MARKET BOOK like TRADE BANDS always was. */
export default function BookProjectionView() {
  const {
    snapshot, isLoading, error, fetchedAt, ownOnly, selectedStrike, setSelectedStrike, bookView,
    sizeCut, setSizeCut, costCut, setCostCut,
    pxSection, setPxSection, sxSection, setSxSection, psSection, setPsSection,
    dials, setDial, sizeUnit, setSizeUnit,
    dataSource, v3Book, v3Error,
  } = useBookStore();
  const isV3 = dataSource === "v3";
  const myLpIds = useLpCurveStore((s) => s.myLpIds);
  // The ghost's BASE params — the deposit form's live CURVE PARAMETERS state
  // (EarnComponent's left panel), not a hardcoded workbook default (2026-07-29
  // wiring fix: the panel and the ghost used to be two disconnected surfaces).
  const lpParams = useLpCurveStore((s) => s.params);
  const nExplicit = useLpCurveStore((s) => s.nExplicit);
  const [copied, setCopied] = useState<string | null>(null);
  // PRICE × SIZE's ladder must open centred on the spread (asks above, bids below, both
  // on screen), not scrolled to the deepest ask — spreadRowRef is the divider row itself.
  const spreadRowRef = useRef<HTMLTableRowElement>(null);
  // PRICE × STRIKE's own scroll container — YOUR BOOK opens centred on the PUTS|CALLS
  // seam (see the useLayoutEffect below), not the table's far-left edge.
  const scrollerRef = useRef<HTMLDivElement>(null);
  const view = bookView;

  const mark = isV3 ? v3Book?.globals.S ?? 0 : snapshot?.oracle_price ?? 0;

  // Ladder the whole book ONCE per snapshot: 14,400 rungs is too much to re-walk per
  // render, and every table plus the locked row axes reads this same shape. v3 branch:
  // no rungs to walk (v3 posts one aggregate level per strike, not a ladder) — cutsFromV3
  // returns the same Cut[] shape with empty bid/ask and the raw scalars on `.v3` instead;
  // `ownOnly` has no v3 wire field to filter by (the read-only endpoint carries no
  // per-viewer scoping), so it's simply not applied here.
  const cuts = useMemo<Cut[]>(() => {
    if (isV3) return v3Book ? cutsFromV3(v3Book.strikes, mark) : [];
    const own = ownOnly ? new Set(myLpIds) : null;
    const wire = (snapshot?.strikes ?? [])
      .slice()
      .sort((a, b) => a.k - b.k)
      .map((s) => ({ k: s.k, wing: s.wing, strike: s.strike, bid: ladder(s, "bid", own), ask: ladder(s, "ask", own) }));
    if (wire.length) return wire;
    // Fallback strike/k axis for the GHOST specifically (bug found 2026-07-29: a
    // concurrent backend "closed system" change makes /api/book/snapshot legitimately
    // return strikes:[] before anyone has deposited — the ghost's whole point is to
    // preview BEFORE that, so it can't depend on the wire ever having rows to borrow an
    // axis from; before this fix the readout's β/ATM still computed correctly off
    // lpParams — only cuts.map(...) below had nothing to iterate — which is why the
    // depth/rungs read as empty "dust" while the readout looked fine in the same frame).
    // Falls back to amm/lp/kgrid.go's own fixed ±60%/1% grid (K_STEP/K_SPAN_STEPS,
    // pricer.ts), k=0 excluded, ONLY when there's truly nothing to draw from — every
    // other consumer of `cuts` (hasDepth, exports, etc.) needs no change: these
    // synthetic entries carry bid:[]/ask:[], so "is there real depth" stays correctly
    // false and MARKET BOOK (ownOnly=false) is untouched, still empty-states cleanly.
    if (!(ownOnly && view === "px") || !mark) return wire;
    const synthetic: Cut[] = [];
    for (let s = -K_SPAN_STEPS; s <= K_SPAN_STEPS; s++) {
      if (s === 0) continue;
      const k = s * K_STEP;
      synthetic.push({ k, wing: k < 0 ? "put" : "call", strike: mark * (1 + k), bid: [], ask: [] });
    }
    return synthetic;
  }, [isV3, v3Book, snapshot, ownOnly, myLpIds, view, mark]);

  // The strike PRICE × SIZE is cut at IS bookStore.selectedStrike — clicking a depth bar
  // on the OPTIONS PRICING chart moves it, and the poll preserves the pick.
  const idx = useMemo(() => {
    if (!cuts.length) return 0;
    const target = selectedStrike ?? mark;
    return cuts.reduce((best, c, i) => (Math.abs(c.strike - target) < Math.abs(cuts[best].strike - target) ? i : best), 0);
  }, [cuts, selectedStrike, mark]);
  const cut = cuts[idx];

  // `cuts` keeps every strike even when a filter empties its ladders, so depth — not row
  // count — is what says whether there is anything to draw (OWN ONLY with no LP hits this).
  // v3: there are no rungs to count by construction (see cutsFromV3) — a posted strike
  // itself (mid/bid/ask always priced, unbounded walk) IS the "depth" reading here, so
  // hasDepth is just "the book has strikes" rather than "some rung has qty>0".
  const hasDepth = isV3 ? cuts.length > 0 : cuts.some((c) => c.bid.length > 0 || c.ask.length > 0);

  // The ghost-proforma playground (YOUR BOOK, PRICE × STRIKE only, v2 ONLY): a
  // client-side Burr-2 ladder previewing an LP CURVE deposit, a v2-specific concept
  // (dials reshape ONE LP's own posted ladder) with no v3 analogue — v3's read-only
  // aggregate has no per-viewer "your curve" to preview. A client-side
  // Burr-2 ladder, one wing-price per real cut's own k (so it shares this book's
  // strike axis with no separate grid to maintain), re-derived on every dial move
  // OR panel edit — the dial row's knobs apply as offsets ON TOP of lpParams (the
  // curve a deposit would actually deploy), not a fixed workbook baseline. ALWAYS
  // rendered in YOUR BOOK, at rest or not (owner correction, 2026-07-29: "a faint
  // proforma on this page in the book format AS IS, becomes bold when actually
  // provided" — the earlier touched-gate, requiring a dial/panel edit before the
  // ghost appeared, was over-design and is gone; only the "= market mirror" badge
  // below still reads dial/panel rest state).
  const ghostRaw = useMemo(() => {
    if (isV3 || !(ownOnly && view === "px")) return null;
    const shape = shapeFromDials(dials, {
      Sbar: lpParams.sBar, A: lpParams.a, Gamma: lpParams.gamma, Lambda: lpParams.lambda, N: lpParams.N,
    });
    // §2.3a mirror (amm/lp/discretise.go effDelta): the LP's OWN δ, widened once per
    // curve — never per strike — so a thin deposit gets fewer, bigger rungs instead of
    // the same 60-rung fan the dust floor then guts. Passed into every ghostRungs call
    // below; M and the fan both recompute from it there. Local only (audit finding 3) —
    // EarnComponent/CurveDigest's half-spread readouts recompute their own effDelta
    // independently (different component tree, no shared shape to prop-drill), so this
    // never left the memo unreturned as dead state.
    const delta = effDelta(shape);
    // maxQty: the largest SINGLE rung size that survived ghostRungs' own MOQ_COIN dust
    // filter (amm/lp/discretise.go's real constant, ported verbatim — see pricer.ts) —
    // drives the adaptive-precision readout below (owner bug report, 2026-07-29: a
    // real-but-tiny notional was rendering as a silent "0.00", indistinguishable from
    // truly empty).
    let maxP = 0, maxQty = 0, depthBid = 0, depthAsk = 0;
    const perCut = cuts.map((c) => {
      const p0 = wingPrice(shape, c.k);
      const bid = shape.suspended && shape.loadedSide === "bid" ? [] : ghostRungs(p0, shape.beta, "bid", delta);
      const ask = shape.suspended && shape.loadedSide === "ask" ? [] : ghostRungs(p0, shape.beta, "ask", delta);
      bid.forEach((r) => { maxP = Math.max(maxP, r.price); maxQty = Math.max(maxQty, r.qty); depthBid += r.qty; });
      ask.forEach((r) => { maxP = Math.max(maxP, r.price); maxQty = Math.max(maxQty, r.qty); depthAsk += r.qty; });
      return { bid, ask };
    });
    return { shape, perCut, maxP, maxQty, depthBid, depthAsk };
  }, [isV3, ownOnly, view, dials, cuts, lpParams]);
  const ghostHasDepth = !!ghostRaw && (ghostRaw.depthBid > 0 || ghostRaw.depthAsk > 0);
  // DERIVED MODE's two honest-empty reasons (owner bug report, 2026-07-29): N=0 (no
  // margin entered — deriveN's own mark>0/marginUsd>0 guard, lpCurveStore.ts) makes
  // β=Λ·ATM/(0.01·N) genuinely infinite, vs. N>0 but every rung still lands under
  // MOQ_COIN (a real, small-notional outcome — a real deposit at that N would also
  // post nothing). EXPLICIT mode never shows either: typing N is the deliberate
  // override, its preview renders (or is silently empty) exactly as before.
  const ghostEmptyReason: "no-margin" | "dust" | null =
    !ghostRaw || nExplicit || ghostHasDepth ? null : !isFinite(ghostRaw.shape.beta) ? "no-margin" : "dust";
  // Cells/readout switch to 6dp once the largest surviving rung is sub-cent — 2dp would
  // silently print "0.00" for a real, MOQ-passing size (owner: "must SEE his orders").
  const ghostDp = ghostRaw && ghostRaw.maxQty > 0 && ghostRaw.maxQty < 0.01 ? 6 : 2;
  const showGhost = ghostHasDepth;
  const showTable = hasDepth || showGhost;
  // The badge's own rest check, independent of showGhost now that the ghost no longer
  // hides at rest — dialsAreNeutral/paramsAtDefaults still exist for exactly this.
  const atRest = dialsAreNeutral(dials) && paramsAtDefaults(lpParams, nExplicit);

  // ₿-perp size unit (owner ruling, moving-parts law): |Δ(k)| per COLUMN (a strike's k
  // fixes its Δ regardless of price/rung), read off the SAME live preview curve
  // (ghostRaw.shape) that already prices the ghost — the honest lens for a preview,
  // stated on the caption rather than silently assumed. One scalar per cut, applied by
  // straight multiplication to both real and ghost cell sums (both are ₿ at that column).
  const deltaAbsByIdx = useMemo(
    () => (ghostRaw ? cuts.map((c) => Math.abs(deltaK(ghostRaw.shape, c.k))) : null),
    [ghostRaw, cuts]
  );
  // Per-column totals, WIRE + OWN GHOST combined (item 6: the Σ row composes exactly what
  // the table itself already composes per cell — real bold + ghost faint, same cell). qty
  // = Σq(k); cost = Σ(price·q)(k), the raw ingredients for every footer row below (Σ row
  // in whichever unit, the untoggled premium-$ row, and the reconciliation corner) so
  // there is exactly one place that walks the ladders, no drift between readings.
  const colTotals = useMemo(
    () =>
      cuts.map((c, i) => {
        const gAsk = ghostRaw?.perCut[i]?.ask ?? [], gBid = ghostRaw?.perCut[i]?.bid ?? [];
        const sum = (l: { qty: number }[]) => l.reduce((t, r) => t + r.qty, 0);
        const sumCost = (l: GhostRung[]) => l.reduce((t, r) => t + r.price * r.qty, 0);
        return {
          askQty: (c.ask.length ? c.ask[c.ask.length - 1].cum : 0) + sum(gAsk),
          bidQty: (c.bid.length ? c.bid[c.bid.length - 1].cum : 0) + sum(gBid),
          askCost: (c.ask.length ? c.ask[c.ask.length - 1].cumCost : 0) + sumCost(gAsk),
          bidCost: (c.bid.length ? c.bid[c.bid.length - 1].cumCost : 0) + sumCost(gBid),
        };
      }),
    [cuts, ghostRaw]
  );
  // Unit multiplier per COLUMN — 1 (₿), |Δ(k)| (₿-perp), or |Δ(k)|·S ($-perp). The
  // ·S step commutes across strikes (`usd_perp_commutes`) so it is safe to fold into one
  // scalar here; the |Δ(k)| step does NOT (`perp_equiv_does_not_commute`), which is why it
  // is still applied PER COLUMN, before any cross-strike sum ever runs (dom below, the Σ
  // row, the reconciliation corner) — never `|Δ|·Σ`, always `Σ |Δ(k)|·(…)`.
  const unitMulByIdx = useMemo(
    () =>
      cuts.map((_, i) => {
        if (sizeUnit === "btc" || !deltaAbsByIdx) return 1;
        return sizeUnit === "usd" ? deltaAbsByIdx[i] * mark : deltaAbsByIdx[i];
      }),
    [cuts, sizeUnit, deltaAbsByIdx, mark]
  );
  // The reconciliation figure: THE SAME combined total feeds the header depth readout
  // AND the Σ row's own corner (below) — one computation, read twice, so the two numbers
  // the owner wants to see agree by construction, not by coincidence.
  const depthTotal = useMemo(() => {
    let bid = 0, ask = 0;
    colTotals.forEach((c, i) => { const m = unitMulByIdx[i] ?? 1; bid += c.bidQty * m; ask += c.askQty * m; });
    return { bid, ask };
  }, [colTotals, unitMulByIdx]);
  const fmtDepth = (v: number) => (sizeUnit === "usd" ? `$${fmtUsdAdaptive(v)}` : `${v.toFixed(ghostDp)} ₿${sizeUnit === "perp" ? "-perp" : ""}`);
  // The Σ row's own label states its basis, per UX law (never a bare "Σ").
  const sigmaRowLabel = sizeUnit === "btc" ? "Σ ₿" : sizeUnit === "perp" ? "Σ ₿-perp (Δ·q)" : "Σ $-perp (Δ·q·S)";

  // Locked row axes AND slider ranges, computed once over the whole (filtered) book —
  // never over one column: dom.maxQ bounds the size slider, dom.maxP the cost slider.
  // Widened by the ghost's own reach so real and ghost cells always share one row axis.
  // v3 has no "posted depth" to measure (no rungs, no cap — MAP_FORMAL depth_unbounded)
  // — maxQ locks to the same reference size ladder SIZE × STRIKE's v3 branch samples
  // (SIZE_LEVELS' own top), so `levels` below covers the full ladder instead of
  // collapsing to its first one or two entries.
  const dom = useMemo(() => {
    if (isV3) return { maxQ: SIZE_LEVELS[SIZE_LEVELS.length - 1], maxP: 1 };
    let maxQ = 0, maxP = ghostRaw?.maxP ?? 0;
    cuts.forEach((c) =>
      [c.bid, c.ask].forEach((l) => {
        if (l.length) maxQ = Math.max(maxQ, l[l.length - 1].cum);
        l.forEach((r) => (maxP = Math.max(maxP, r.price)));
      })
    );
    return { maxQ: maxQ || 1, maxP: maxP || 1 };
  }, [isV3, cuts, ghostRaw]);

  const atmIdx = useMemo(() => {
    const i = cuts.findIndex((c) => c.k >= 0);
    return i === -1 ? Math.max(0, cuts.length - 1) : i;
  }, [cuts]);

  // Formula line's live example: the seam-adjacent column (first call, k=+1%) — always
  // the same physical column regardless of unit, and it's where YOUR BOOK already opens
  // scrolled to (the seam-centering effect above), so the formula's own subject is on
  // screen without extra scrolling.
  const seamIdx = Math.min(atmIdx, Math.max(0, cuts.length - 1));
  const seamCut = cuts[seamIdx];
  const seamQty = colTotals[seamIdx] ? colTotals[seamIdx].askQty + colTotals[seamIdx].bidQty : 0;
  const seamDeltaAbs = deltaAbsByIdx ? deltaAbsByIdx[seamIdx] : 0;
  const seamPerp = seamQty * seamDeltaAbs;
  // "Σ(ask+bid)" (not a bare "Σ"): seamQty is the two sides summed, but the Σ row above
  // shows them as a column split (ask over bid) — without naming which reading feeds the
  // formula, its subject appears nowhere on screen (audit, MINOR).
  const formulaLine =
    !seamCut || !ownOnly || view !== "px"
      ? ""
      : sizeUnit === "btc"
      ? `Σ(ask+bid) ${seamQty.toFixed(4)} ₿`
      : sizeUnit === "perp"
      ? `Σ(ask+bid) ${seamQty.toFixed(4)} ₿ × |Δ(${fmtK(seamCut.k)})| ${seamDeltaAbs.toFixed(4)} = ${seamPerp.toFixed(4)} ₿-perp`
      : `Σ(ask+bid) ${seamQty.toFixed(4)} ₿ × |Δ(${fmtK(seamCut.k)})| ${seamDeltaAbs.toFixed(4)} = ${seamPerp.toFixed(4)} ₿-perp × ${fmtUsd(mark)} = $${fmtUsdAdaptive(seamPerp * mark)}`;

  const binWidth = niceBin(dom.maxP);
  const nBins = Math.max(1, Math.ceil(dom.maxP / binWidth));
  // Δ = size resting in that bin (the wire's own truth). Σ = cumulative depth from the
  // touch out through that bin — since each ladder already walks touch-first outward,
  // the LAST write into a bin (the deepest rung landing there) is that running total.
  const pxMatrix = useMemo(
    () =>
      cuts.map((c) => {
        const m = new Map<number, PxCell>();
        const add = (l: Rung[], side: "bid" | "ask") =>
          l.forEach((r) => {
            const b = Math.floor(r.price / binWidth);
            const e = m.get(b) ?? { bidD: 0, askD: 0, bidS: 0, askS: 0 };
            e[`${side}D`] += r.qty;
            e[`${side}S`] = r.cum;
            m.set(b, e);
          });
        add(c.bid, "bid");
        add(c.ask, "ask");
        return m;
      }),
    [cuts, binWidth]
  );

  // Ghost cells, same bin shape as pxMatrix, tagged separately so a cell can hold
  // BOTH a real (bold) and a ghost (faint) reading at once — e.g. previewing a
  // dial change against an already-deployed curve.
  const ghostMatrix = useMemo(() => {
    if (!ghostRaw) return null;
    return ghostRaw.perCut.map((c) => {
      const m = new Map<number, { askD: number; bidD: number }>();
      const add = (l: GhostRung[], side: "bid" | "ask") =>
        l.forEach((r) => {
          const b = Math.floor(r.price / binWidth);
          const e = m.get(b) ?? { askD: 0, bidD: 0 };
          e[`${side}D`] += r.qty;
          m.set(b, e);
        });
      add(c.bid, "bid");
      add(c.ask, "ask");
      return m;
    });
  }, [ghostRaw, binWidth]);

  const levels = useMemo(() => sizeLevels(dom.maxQ), [dom.maxQ]);
  // sigma = Σ VWAP to fill that cumulative size; delta = marginal price AT that depth.
  // v3 cells (c.v3 present) use the closed form (v3SxCell) instead of walking c.ask/c.bid
  // (empty by construction) — same cell shape, so the render tree below is unchanged.
  const sxMatrix = useMemo(
    () =>
      levels.map((lvl) =>
        cuts.map((c) =>
          c.v3
            ? v3SxCell(c.v3, lvl)
            : {
                askSigma: vwapForSize(c.ask, lvl), bidSigma: vwapForSize(c.bid, lvl),
                askDelta: marginalPrice(c.ask, lvl), bidDelta: marginalPrice(c.bid, lvl),
              }
        )
      ),
    [levels, cuts]
  );

  // The size-slider contour: per strike per side, the shallowest bin whose Σ-from-touch
  // first reaches q₀ — always Σ-defined, independent of the Δ|Σ display toggle, so it
  // stays where it is when that toggle flips.
  const pxContour = useMemo(
    () =>
      cuts.map((_, i) => {
        let askBin: number | null = null, bidBin: number | null = null, askBest = Infinity, bidBest = Infinity;
        pxMatrix[i]?.forEach((e, bin) => {
          if (e.askS >= sizeCut && e.askS < askBest) { askBest = e.askS; askBin = bin; }
          if (e.bidS >= sizeCut && e.bidS < bidBest) { bidBest = e.bidS; bidBin = bin; }
        });
        return { askBin, bidBin };
      }),
    [cuts, pxMatrix, sizeCut]
  );

  // The price-slider contour: per strike per side, the deepest size level whose VWAP
  // price still sits at or under the slider's price — unit-consistent with the slider,
  // its range (dom.maxP) and the cells themselves (audit F1: the old *lvl form was a
  // Σ-cost in a price-ranged slider, leaving deep rows unreachable at any position).
  const sxContour = useMemo(
    () =>
      cuts.map((_, i) => {
        let askLi: number | null = null, bidLi: number | null = null;
        levels.forEach((lvl, li) => {
          const cell = sxMatrix[li][i];
          if (cell.askSigma != null && cell.askSigma <= costCut) askLi = li;
          if (cell.bidSigma != null && cell.bidSigma <= costCut) bidLi = li;
        });
        return { askLi, bidLi };
      }),
    [cuts, sxMatrix, levels, costCut]
  );

  // Open PRICE × SIZE centred on the spread, on mount AND on every strike change — the
  // ladder used to open scrolled to the deepest ask, 40+ rows of tail before the market
  // itself came into view. useLayoutEffect (not useEffect) so it lands before paint, no
  // visible jump. No-ops on other views (the ref is only attached to the ps spread row).
  // Deps: psSection (ALL→SECTION swaps the tbody and resets scroll — regression
  // 2026-07-28) and cut itself (first snapshot arrival attaches the ref post-mount).
  useLayoutEffect(() => {
    if (view === "ps" && psSection !== "all")
      spreadRowRef.current?.scrollIntoView({ block: "center", inline: "nearest" });
  }, [view, psSection, cut]);

  // YOUR BOOK (ownOnly, PRICE × STRIKE) opens centred on the PUTS|CALLS seam, not the
  // table's far-left edge — the far-left strikes are the deepest-OTM wing, legitimately
  // near-empty at default params, so the owner's fresh-load path landed on an
  // apparently-blank grid with all 1000+ populated ghost cells scrolled off to the
  // right (2026-07-29 correction). useLayoutEffect (not useEffect), same idiom as the
  // spread-centering effect above, so it lands before paint.
  //
  // Deliberately NOT scrollIntoView({inline:"center"}) on the seam alone: that can land
  // scrollLeft at a sub-column offset, which re-triggers the sticky-corner occlusion trap
  // (2026-07-29 memory — a `position:sticky;left:0` cell doesn't clip via overflow, it
  // re-anchors over whatever non-sticky column's natural position falls under its own
  // width at that exact scrollLeft, showing only that column's trailing digits). Instead:
  // find the column `visibleCols/2` before the seam and land ITS natural left edge
  // exactly on the frozen corner's right edge — the seam ends up roughly centred and no
  // column ever straddles the frozen boundary.
  useLayoutEffect(() => {
    if (!(ownOnly && view === "px") || !cuts.length) return;
    const scroller = scrollerRef.current;
    const corner = scroller?.querySelector<HTMLElement>("[data-corner]");
    const heads = scroller
      ? Array.from(scroller.querySelectorAll<HTMLElement>("[data-col-idx]")).sort(
          (a, b) => Number(a.dataset.colIdx) - Number(b.dataset.colIdx)
        )
      : [];
    if (!scroller || !corner || heads.length < 2) return;
    const scRect = scroller.getBoundingClientRect();
    // Content-relative (not viewport-relative) left, valid regardless of current scroll.
    const naturalLeft = (el: HTMLElement) => el.getBoundingClientRect().left - scRect.left + scroller.scrollLeft;
    const frozenWidth = corner.getBoundingClientRect().width;
    const colWidth = naturalLeft(heads[1]) - naturalLeft(heads[0]);
    const visibleCols = Math.max(1, Math.floor((scroller.clientWidth - frozenWidth) / colWidth));
    const anchorIdx = Math.max(0, atmIdx - Math.floor(visibleCols / 2));
    // Math.floor, not the raw float: scrollLeft is an integer pixel, and the anchor's
    // exact natural edge is essentially never one (font metrics give fractional column
    // widths) — flooring rounds DOWN, the safe direction, so the anchor column is never
    // partially covered (worst case a sub-pixel sliver of the PRECEDING column peeks out
    // from under the corner instead, imperceptible and never the column being read).
    scroller.scrollLeft = Math.max(0, Math.floor(naturalLeft(heads[anchorIdx]) - frozenWidth));
    // showTable: bug found 2026-07-29 diagnosing mobile — cuts.length/atmIdx populate
    // (120-wide synthetic k-grid, see cuts' own fallback above) the INSTANT mark is known,
    // independent of whether the table is actually mounted (it mounts only once showTable
    // — real OR ghost depth — flips true). Deps unchanged ⇒ this effect never re-ran for
    // the render where scrollerRef first attaches, so the table opened un-centred (scrollLeft
    // stuck at the browser default 0, confirmed via headsCount:120/scrollLeft:0 at mobile
    // width). showTable is what actually flips at that moment; scroller is null and this
    // no-ops harmlessly on every render in between.
  }, [ownOnly, view, cuts.length, atmIdx, showTable]);

  // PRICE × SIZE's ALL reading, restored: literally PRICE × STRIKE's own pxMatrix summed
  // across its strike axis into one column — the projection along strike.
  const allLadderRows = useMemo(() => {
    const rows: AllRow[] = [];
    for (let bin = nBins - 1; bin >= 0; bin--) {
      let ask = 0, bid = 0;
      pxMatrix.forEach((m) => {
        const e = m.get(bin);
        if (e) { ask += e.askD; bid += e.bidD; }
      });
      if (ask > 0 || bid > 0) rows.push({ bin, ask, bid });
    }
    return rows;
  }, [pxMatrix, nBins]);

  // The ladder's horizontal IS the size axis (block orientation: the side face's
  // horizontal = size). Bars express it as extent; domain locked to the whole book's
  // largest rung so the scale never rescales under the strike slider.
  const maxRungQty = useMemo(
    () => Math.max(1e-12, ...cuts.flatMap((c) => [...c.ask, ...c.bid].map((r) => r.qty))),
    [cuts]
  );
  const maxAllQty = useMemo(
    () => Math.max(1e-12, ...allLadderRows.flatMap((r) => [r.ask, r.bid])),
    [allLadderRows]
  );
  const sizeBar = (qty: number, max: number, bg: string, fg: string, text: string) => (
    <div className="relative min-w-[18rem] h-4">
      <div className="absolute inset-y-0.5 left-0" style={{ background: bg, width: `${Math.min(100, (qty / max) * 100)}%` }} />
      <span className="relative px-1" style={{ color: fg }}>{text || "\u00A0"}</span>
    </div>
  );
  // The size axis's edge: a header scale over the shared bar field, 0 → whole-book max.
  const sizeAxisTh = (max: number) => (
    <th className={headTh} style={{ minWidth: "18rem" }}>
      <div className="flex justify-between px-1 text-[#8A8A8A]"><span>0</span><span>{max.toFixed(2)} ₿</span></div>
    </th>
  );

  const spreadLabel = (() => {
    if (!cut) return "—";
    if (cut.v3) {
      const { bid, ask, mid, half, depth, deltaAgg } = cut.v3;
      const spread = ask - bid;
      // depth (β_agg) is a price-impact SLOPE (coin per coin²), not a resting quantity —
      // no v2 column to map it onto (see Cut/v3SxCell's own comment) — shown here as a
      // plain labeled scalar instead of forced into a size-shaped cell.
      return `mid ${mid.toFixed(6)} · spread ${spread.toFixed(6)} coin · ${((spread / mid) * 100).toFixed(2)}% · half ${half.toFixed(6)} · β_agg ${depth.toFixed(6)} · Δ_agg ${deltaAgg.toFixed(4)}`;
    }
    const bestAsk = cut.ask[0]?.price, bestBid = cut.bid[0]?.price;
    if (bestAsk == null && bestBid == null) return "no depth at this strike";
    if (bestAsk == null) return "no asks posted";
    if (bestBid == null) return "no bids posted";
    const spread = bestAsk - bestBid, mid = (bestAsk + bestBid) / 2;
    if (spread <= 0) return `crossed ${(bestBid - bestAsk).toFixed(4)} coin — heterogeneous LP curves`;
    return `spread ${spread.toFixed(4)} coin · ${((spread / mid) * 100).toFixed(2)}%`;
  })();

  const copy = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };
  const exportCsv = () =>
    copy("csv", view === "px" ? pxCsv(cuts, pxMatrix, binWidth, nBins)
      : view === "sx" ? sxCsv(cuts, sxMatrix, levels)
      : psSection === "all" ? psAllCsv(allLadderRows, binWidth) : psCsv(cut, mark));
  const exportJson = () =>
    copy("json", view === "px" ? pxJson(cuts, pxMatrix, binWidth)
      : view === "sx" ? sxJson(cuts, sxMatrix, levels)
      : psSection === "all" ? psAllJson(allLadderRows, binWidth) : psJson(cut, mark));

  if (isLoading && !(isV3 ? v3Book : snapshot)) return <Skeleton className="h-full w-full bg-gray-800" />;

  // The crossover divider (last put ↔ first call, also the settlement boundary) — one
  // border style reused on the group-header row, the strike-header row, and every body
  // row so the seam reads as a single continuous line down the whole table.
  const atmBorder = "border-l-2 border-l-[#0ABAB5]";
  const cornerTh = `sticky top-0 left-0 z-30 bg-[#112226] text-[#8A8A8A] px-2 py-1 text-2xs text-right whitespace-nowrap ${mono}`;
  const headTh = `sticky top-0 z-20 bg-[#112226] text-[#C9C8C8] px-2 py-1 text-2xs font-semibold whitespace-nowrap ${mono}`;
  // headThEmph brightened whichever column the global Δ|Σ toggle meant — commented out
  // with the toggle itself, not deleted; restore both together if the lens comes back.
  // const headThEmph = `sticky top-0 z-20 bg-[#173238] text-[#0ABAB5] px-2 py-1 text-2xs font-semibold whitespace-nowrap ${mono}`;
  // Strike-header row when a PUTS|CALLS group row sits above it (px/sx): pinned at top-6,
  // exactly the group row's own h-6 height, so the two sticky rows stack without
  // overlapping instead of both fighting for top-0.
  const headTh2 = `sticky top-6 z-20 h-6 bg-[#112226] text-[#C9C8C8] px-2 py-1 text-2xs font-semibold whitespace-nowrap ${mono}`;
  const labelTd = `sticky left-0 z-10 bg-[#0E1B1E] px-2 py-0.5 text-2xs text-right tabular-nums whitespace-nowrap ${mono}`;
  const cellTd = `px-2 py-0.5 text-2xs text-center tabular-nums ${mono}`;
  const btn = `h-6 px-2 text-2xs tracking-wider border bg-[#1a1a1a] transition-colors border-gray-600 text-gray-400 hover:text-white ${mono}`;
  /** The slider's own cut, painted onto whichever cell the contour lands on — inset
   *  box-shadow (not outline) so it never nudges table layout or gets clipped at a cell
   *  boundary. */
  const contourStyle = (color: string): React.CSSProperties => ({ boxShadow: `inset 0 0 0 2px ${color}`, fontWeight: 700 });

  const StrikeHead = ({ c, i }: { c: Cut; i: number }) => (
    // data-col-idx: the seam-centering useLayoutEffect's only handle on column position
    // (px/sx share this component; harmless elsewhere since that effect no-ops off px).
    <th key={c.strike} data-col-idx={i} className={`${headTh2} ${i === atmIdx ? atmBorder : ""}`}>
      <div className="flex flex-col items-center leading-tight">
        <span className="text-[#E4E4E4]">{fmtUsd(c.strike)}</span>
        <span className="text-[#5E5E5E] text-[9px]">{fmtK(c.k)}</span>
        {/* v3 only: PRICE × STRIKE's matrix body stays genuinely empty for a v3 cut (no
            discrete rungs to bin — see cutsFromV3) so mid/bid/ask, the one thing v3
            actually posts at this strike, surfaces here instead of nowhere. */}
        {c.v3 && (
          <span className="text-[#5E5E5E] text-[9px]" title={`bid ${c.v3.bid.toFixed(6)} · ask ${c.v3.ask.toFixed(6)}`}>
            <span style={{ color: BUY_ACCENT }}>{c.v3.bid.toFixed(4)}</span>
            {"/"}
            <span style={{ color: SELL_ACCENT }}>{c.v3.ask.toFixed(4)}</span>
          </span>
        )}
      </div>
    </th>
  );

  // PUTS | CALLS spanning header row (px/sx only — ps is one strike, already
  // unambiguous). Text/border accents only, no filled backgrounds, so the ratified
  // call/put colors never compete with the bid/ask cell tints below. The mark sits at
  // the seam itself, in the PUTS cell trailing edge, right before the crossover divider.
  // The corner cell lives HERE (rowSpan 2, not in the strike row below it) — a rowSpan
  // cell must start in the row it's declared in.
  const GroupHeader = ({ rowLabel, rowDir, colLabel }: { rowLabel: string; rowDir: string; colLabel: string }) =>
    cuts.length === 0 ? null : (
      <tr>
        {/* Diagonal-divider corner (owner): the cross-tab convention — column axis above
            the TL→BR diagonal, row axis below it. Directions live in the title. */}
        <th rowSpan={2} data-corner className={`${cornerTh} relative`} title={`rows: ${rowLabel} (${rowDir}) · columns: ${colLabel}, puts→calls`}
          style={{ backgroundImage: "linear-gradient(to top right, transparent calc(50% - 0.5px), #3a4a4d calc(50% - 0.5px), #3a4a4d calc(50% + 0.5px), transparent calc(50% + 0.5px))", minWidth: "7.5rem", height: "3rem" }}>
          <span className="absolute top-0.5 right-1.5">{colLabel} →</span>
          <span className="absolute bottom-0.5 left-1.5">{rowLabel} ↓</span>
        </th>
        {atmIdx > 0 && (
          <th colSpan={atmIdx} className={`sticky top-0 z-20 h-6 bg-[#112226] text-2xs text-right pr-2 whitespace-nowrap ${mono}`}>
            <span style={{ color: PUT_COLOR }}>PUTS</span>
            <span className="text-[#5E5E5E]"> · {mark ? fmtUsd(mark) : "—"} ·</span>
          </th>
        )}
        {cuts.length - atmIdx > 0 && (
          <th colSpan={cuts.length - atmIdx} className={`sticky top-0 z-20 h-6 bg-[#112226] text-2xs text-left pl-2 whitespace-nowrap ${mono} ${atmBorder}`}>
            <span style={{ color: CALL_COLOR }}>CALLS</span>
          </th>
        )}
      </tr>
    );

  // A BOOK 4th tab's per-rung cell renderer — commented out with its render branch below.
  // const rungTd = (key: string, r: Rung | undefined, side: "bid" | "ask", atm: boolean) => {
  //   if (!r) return <td key={key} className={`${cellTd} ${atm ? atmBorder : ""}`} />;
  //   const bg = side === "ask" ? SELL_BG : BUY_BG, fg = side === "ask" ? SELL_ACCENT : BUY_ACCENT;
  //   return (
  //     <td key={key} className={`${cellTd} ${atm ? atmBorder : ""} leading-tight`} style={{ background: bg, color: fg }}>
  //       <div>{r.price.toFixed(4)}</div>
  //       <div className="opacity-70">{r.qty.toFixed(3)}</div>
  //     </td>
  //   );
  // };

  const title = view === "px" ? "PRICE × STRIKE" : view === "sx" ? "SIZE × STRIKE" : "PRICE × SIZE";
  // Each view shows its ONE preview-blessed reading, fixed — no toggle (owner, 2026-07-28:
  // a global Δ|Σ lens read as muddy — vwap↔marginal on SIZE × STRIKE is a different KIND
  // of pair than resting↔cumulated on PRICE × STRIKE). PRICE × STRIKE is always resting
  // notional; SIZE × STRIKE is always VWAP cost-of-size, its permanent identity, not an
  // option. Costs are pre-fee: vwapForSize/cumCost walk raw snapshot prices, not the
  // engine's effective fill price (price/(1−φ)) — φ never rides the wire, so the honest
  // fix is saying so on the caption.
  // The three axes are PRICE · STRIKE · SIZE, each with one name used everywhere — no
  // "cost", no "premium" (owner, 2026-07-28: both are imported vocabulary the object
  // doesn't use; PRICE is the axis's own word). Sliders carry the axis name exactly.
  const caption =
    view === "px"
      ? isV3
        ? "v3: one continuous aggregate price per strike, no discrete resting rungs — bid/ask shown in the strike header"
        : `cell = size (${ownOnly && sizeUnit === "perp" ? "₿-perp" : ownOnly && sizeUnit === "usd" ? "$-perp" : "₿"}) resting there — ask above the spread, bid below · price binned ${binWidth} coin · pre-fee`
          + (ownOnly ? " · faint = client-side ghost preview at current mark, pre-fee" : "")
          + (ownOnly && sizeUnit !== "btc" ? ` · Δ-weighted at the current curve${sizeUnit === "usd" ? " × mark" : ""}` : "")
      : isV3
        ? "v3: cell = closed-form VWAP price to fill that size (mid ± half ± ½·β·size), Σ from touch · no size cap — the walk never runs out of posted depth"
        : "cell = VWAP price (coin), Σ from touch, to fill that size · pre-fee"
          + (sxSection === "section" ? ` — cut: highlights the deepest size whose VWAP ≤ ${costCut.toFixed(3)} coin` : " (ALL)");

  /** "2D + the ability to vary the plane": ALL = aggregate, full table, no highlight;
   *  SECTION = the slider commits — same idiom as the Δ|Σ toggle. */
  const sectionToggle = (val: "all" | "section", setVal: (v: "all" | "section") => void) => (
    <div className="flex border border-gray-600 bg-[#1a1a1a]" role="group" aria-label="all or section">
      {(["all", "section"] as const).map((s, i) => (
        <button key={s} type="button" onClick={() => setVal(s)} aria-pressed={val === s}
          title={s === "all" ? "ALL — the full table, aggregated along this axis" : "SECTION — the slider commits: highlights (px/sx) or selects (ps) its cut"}
          className={`h-6 px-1.5 text-[10px] tracking-wider transition-colors ${mono} ${i > 0 ? "border-l border-gray-600" : ""} ${
            val === s ? "text-[#0ABAB5]" : "text-gray-400 hover:text-white"
          }`}>
          {s.toUpperCase()}
        </button>
      ))}
    </div>
  );

  /** Axis vocabulary is unchanged — SIZE stays SIZE, only the UNIT reads differently.
   *  Same segmented-button idiom as sectionToggle above (owner: "existing toggle
   *  idiom"). YOUR BOOK only (gated at the call site) — MARKET BOOK is frozen. Third
   *  state $-perp (owner, live): "no currency conversion thing" was missing — |Δ(k)|
   *  applied per strike first (does not commute), then ×mark (does commute,
   *  `usd_perp_commutes`), never the other order. */
  const sizeUnitToggle = (
    <div className="flex border border-gray-600 bg-[#1a1a1a]" role="group" aria-label="size unit">
      {(["btc", "perp", "usd"] as const).map((u, i) => (
        <button key={u} type="button" onClick={() => setSizeUnit(u)} aria-pressed={sizeUnit === u}
          title={
            u === "btc" ? "size in ₿ — today's option size"
            : u === "perp" ? "size in ₿-perp — qty × |Δ(k)| at the live preview curve, the perp-equivalent hedge size"
            : "size in $-perp — the ₿-perp reading × current mark S (|Δ(k)| applied per strike first, then ×S)"
          }
          className={`h-6 px-1.5 text-[10px] tracking-wider transition-colors ${mono} ${i > 0 ? "border-l border-gray-600" : ""} ${
            sizeUnit === u ? "text-[#0ABAB5]" : "text-gray-400 hover:text-white"
          }`}>
          {u === "btc" ? "₿" : u === "perp" ? "₿-perp (Δ·q)" : "$-perp"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full min-h-0 gap-1">
      {/* min-w-0 on both header rows: pins them to the pane's own width regardless of the
          table below, per the owner check that the view toggle / slider must not drift
          with whichever table happens to be mounted. */}
      <div className="flex items-baseline justify-between gap-2 px-2 shrink-0 min-w-0">
        <span className={`text-2xs tracking-widest text-[#E4E4E4] ${mono}`}>
          {/* OWN ONLY has no v3 wire field to filter by (see cuts' own comment) — v3 is
              always the one aggregate reading, regardless of the toggle's stored value. */}
          {isV3 ? "MARKET BOOK (v3)" : ownOnly ? "YOUR BOOK" : "MARKET BOOK"}
        </span>
        <span className={`text-2xs text-[#C9C8C8] whitespace-nowrap ${mono}`}>
          Mark {mark ? fmtUsd(mark) : "—"}
          {fetchedAt ? ` · ${new Date(fetchedAt).toLocaleTimeString("en-US", { hour12: false })}` : ""}
        </span>
      </div>

      {/* Ghost-proforma playground — YOUR BOOK, PRICE × STRIKE only (owner spec,
          2026-07-29). Dials are additive/neutral-0 (× neutral-1); dragging one away
          from neutral previews a client-computed curve as a faint overlay below,
          never a wire round-trip. The readout row shows always, even at neutral
          (= the market-mirror shape), so the numbers are legible before any drag. */}
      {ownOnly && view === "px" && ghostRaw && (
        <div className="flex flex-col gap-1 px-2 py-1.5 shrink-0 border-t border-b border-[#1c2e32] bg-[#0b171a] min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-[#C9C8C8]">
            {DIAL_SPECS.map(({ key, label, min, max, step, fmt }) => (
              <label key={key} className="flex items-center gap-1.5 whitespace-nowrap">
                {label}
                <input
                  type="range" min={min} max={max} step={step} value={dials[key]}
                  onChange={(e) => setDial(key, Number(e.target.value))}
                  className="w-24 accent-[#0ABAB5]" aria-label={label}
                />
                <span className="text-[#E4E4E4] tabular-nums inline-block w-11 text-right">{fmt(dials[key])}</span>
              </label>
            ))}
            <button
              type="button"
              onClick={() => document.getElementById("deploy-curve-panel")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              title="Go to the deploy flow to actually provide this liquidity"
              className={`ml-auto h-6 px-2.5 text-2xs tracking-wider border border-gray-600 bg-[#1a1a1a] text-gray-400 hover:text-white hover:border-gray-400 transition-colors ${mono}`}
            >
              DEPLOY →
            </button>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-2xs text-[#C9C8C8]">
            <span>
              effective κ <b className="text-[#E4E4E4] font-semibold">{ghostRaw.shape.kappaEff.toFixed(4)}</b>
              {/* DERIVED MODE can legitimately reach N=0 (no MARGIN entered yet) — β=Λ·ATM/(0.01·N)
                  is then a genuine ÷0; mathematically honest (zero capital ⇒ infinite price
                  impact per unit ⇒ zero depth posted, which ghostRungs already renders as 0.00 ₿
                  below) but "Infinity" as text reads as broken, not as "no notional yet". */}
              {" · "}β <b className="text-[#E4E4E4] font-semibold">{isFinite(ghostRaw.shape.beta) ? ghostRaw.shape.beta.toFixed(5) : "—"}</b>
              {" · "}ATM <b className="text-[#E4E4E4] font-semibold">{ghostRaw.shape.d.ATM.toFixed(5)}</b>
              {/* WIRE + own ghost combined, in the toggle's unit — the same depthTotal the
                  Σ row's own corner reads below, so the two visibly agree (the owner's
                  reconciliation ask) by sharing one computation, not by coincidence. Labeled
                  (book+ghost) so it doesn't read as a pure-ghost quantity among κ/β/ATM
                  above it (audit, MODERATE). No "no-margin" branch here — depthTotal is
                  wire+ghost, so it's a real, correct number (possibly wire-only) even when
                  the ghost's own N is 0; special-casing it to "—" made header ≠ corner in a
                  reachable state (deployed LP + reset-to-defaults dials). */}
              {" · "}depth (book+ghost) bid <b className="text-[#E4E4E4] font-semibold">{fmtDepth(depthTotal.bid)}</b>
              {" · "}ask <b className="text-[#E4E4E4] font-semibold">{fmtDepth(depthTotal.ask)}</b>
              {ghostRaw.shape.suspended && (
                <span className="text-[#f2b544]"> — {ghostRaw.shape.loadedSide.toUpperCase()} suspended (f=1)</span>
              )}
            </span>
            {atRest && <span className="text-[#0ABAB5]">= market mirror (dials neutral)</span>}
          </div>
        </div>
      )}

      <div className={`flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 px-2 shrink-0 min-w-0 text-2xs ${mono}`}>
        <span className="min-w-0">
          <span className="text-[#E4E4E4] tracking-wider">{title}</span>
          {view === "ps" ? (
            <span className="text-[#8A8A8A]">
              {psSection === "all" ? (
                " · size per price level, summed across every strike — sides overlap where the wings cross; a projection, not a single book"
              ) : cut ? (
                <>
                  {" "}· at {fmtUsd(cut.strike)} ({fmtK(cut.k)}){" "}
                  <span style={{ color: cut.wing === "call" ? CALL_COLOR : PUT_COLOR }}>{cut.wing}</span>
                  {" "}· pre-fee
                </>
              ) : " · —"}
            </span>
          ) : (
            <span className="text-[#8A8A8A]"> · {caption}</span>
          )}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {/* ALL|SECTION pair + size slider commented out of the front face (owner,
              2026-07-29: "comment out section slider from there and all section choice") —
              the plain full table only. Restore by uncommenting; store state remains.
          {view === "px" && (
            <>
              {sectionToggle(pxSection, setPxSection)}
              <label className={`flex items-center gap-1.5 text-[#C9C8C8] ${pxSection === "all" ? "opacity-40" : ""}`}>
                size
                <input type="range" min={0} max={dom.maxQ} step={dom.maxQ / 200} 
                  value={sizeCut} onChange={(e) => { setSizeCut(Number(e.target.value)); if (pxSection === "all") setPxSection("section"); }}
                  className="w-28 accent-[#0ABAB5]" aria-label="size" />
                <span className="text-[#E4E4E4] tabular-nums w-16">{sizeCut.toFixed(2)} ₿</span>
              </label>
            </>
          )} */}
          {view === "sx" && (
            <>
              {sectionToggle(sxSection, setSxSection)}
              <label className={`flex items-center gap-1.5 text-[#C9C8C8] ${sxSection === "all" ? "opacity-40" : ""}`}>
                price
                <input type="range" min={0} max={dom.maxP} step={dom.maxP / 200} 
                  value={costCut} onChange={(e) => { setCostCut(Number(e.target.value)); if (sxSection === "all") setSxSection("section"); }}
                  className="w-28 accent-[#0ABAB5]" aria-label="price" />
                <span className="text-[#E4E4E4] tabular-nums w-16">{costCut.toFixed(3)}</span>
              </label>
            </>
          )}
          {view === "ps" && (
            <>
              {sectionToggle(psSection, setPsSection)}
              <label className={`flex items-center gap-1.5 text-[#C9C8C8] ${psSection === "all" ? "opacity-40" : ""}`}>
                strike
                {/* Always live: grabbing the strike slider IS a sectioning intent — in ALL
                    (which ignores strike) it flips to SECTION at the chosen strike, never
                    sits dead under the pointer (owner, 2026-07-28). */}
                <input type="range" min={0} max={Math.max(0, cuts.length - 1)} step={1}
                  value={idx} onChange={(e) => {
                    setSelectedStrike(cuts[Number(e.target.value)]?.strike ?? null);
                    if (psSection === "all") setPsSection("section");
                  }}
                  className="w-28 accent-[#0ABAB5]" aria-label="strike" />
                <span className="text-[#E4E4E4] tabular-nums w-28">
                  {cut ? `${fmtUsd(cut.strike)} (${fmtK(cut.k)})` : "—"}
                </span>
              </label>
            </>
          )}
          {/* YOUR BOOK's size-unit toggle only (MARKET BOOK/TRADE BANDS frozen) — same
              gate as the ghost/dial row above (ownOnly && px), see sizeUnitToggle's own
              comment. v2 only: the Δ(k) it multiplies by comes from the ghost's own
              preview curve, which doesn't exist for v3 (no per-viewer LP curve to preview
              on the read-only aggregate endpoint) — showing it would toggle nothing. */}
          {!isV3 && ownOnly && view === "px" && sizeUnitToggle}
          <button type="button" onClick={exportCsv} title="Copy this view's grid as CSV" className={btn}>
            {copied === "csv" ? "COPIED" : "COPY CSV"}
          </button>
          <button type="button" onClick={exportJson} title="Copy this view's cells as JSON (both the incremental and cumulative readings)" className={btn}>
            {copied === "json" ? "COPIED" : "COPY JSON"}
          </button>
        </div>
      </div>

      {/* Empty state: MARKET BOOK/error (unrelated to the ghost) falls back to the old
          text; YOUR BOOK's own two DERIVED-MODE reasons (owner bug report, 2026-07-29 —
          "nothing preview visible" turned out to be a silently-blank table, not a
          rendering bug) get their own copy so the user knows which lever to pull.
          EXPLICIT mode is never told either reason (ghostEmptyReason is null there —
          see its own comment above) — it keeps the pre-existing plain fallback text. */}
      {!showTable && (
        <div className={`flex-1 min-h-0 flex flex-col items-center justify-center text-center gap-1 text-2xs text-gray-400 ${mono}`}>
          <span>
            {isV3
              ? v3Error ?? "v3 book unavailable"
              : ghostEmptyReason === "no-margin"
              ? "enter margin to preview — curve size follows your notional (or set N directly)"
              : ghostEmptyReason === "dust"
              ? "this notional posts no resting size (below minimum rung size) — increase margin or leverage"
              : error ? "book unavailable" : "no depth posted"}
          </span>
        </div>
      )}

      {/* Single muted line, not a blocking empty state — the ghost below already reads
          "faint = client-side ghost preview" on its own caption, so this just names the
          reason it's the only thing on screen: zero real own rungs so far. */}
      {ownOnly && !hasDepth && showTable && (
        <div className={`px-2 text-2xs text-gray-500 italic shrink-0 ${mono}`}>
          none of your LP curves quote into this book
        </div>
      )}

      {showTable && (
        // min-w-0: this flex-col child defaults to min-width:auto (its content's
        // max-content size), which let the ~120-column table drag the whole page wider
        // instead of scrolling inside its own pane — see page.tsx/GraphCardWrapperTab.tsx
        // for the rest of this containment chain.
        <div className="flex-1 min-w-0 min-h-0 px-2 pb-2">
          <div className="h-full flex flex-col rounded-xl border-2 border-[#808080] bg-[#0E1B1E] overflow-hidden">
            <div ref={scrollerRef} className={`flex-1 w-full min-w-0 min-h-0 overflow-auto ${view === "ps" ? "flex justify-center" : ""}`}>
              <table className="border-separate border-spacing-0" style={{ borderCollapse: "separate" }}>

                {view === "px" && (
                  <>
                    <thead>
                      <GroupHeader rowLabel="price (coin)" rowDir="high→low" colLabel="strike" />
                      <tr>
                        {cuts.map((c, i) => <StrikeHead key={c.strike} c={c} i={i} />)}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: nBins }, (_, i) => nBins - 1 - i).map((bin) => (
                        <tr key={bin}>
                          <td className={labelTd}>{(bin * binWidth).toFixed(3)}</td>
                          {cuts.map((c, i) => {
                            const e = pxMatrix[i]?.get(bin);
                            const atm = i === atmIdx ? atmBorder : "";
                            // Fixed reading: Δ resting notional (no toggle — see caption note).
                            const ask = e ? e.askD : 0;
                            const bid = e ? e.bidD : 0;
                            // Ghost = would-be (client math, faint); bold = actually
                            // provided (wire, full weight) — the two can coexist in one
                            // cell (previewing a dial change against an already-deployed
                            // curve), each rendered independently, never merged into one number.
                            const ge = showGhost ? ghostMatrix?.[i]?.get(bin) : undefined;
                            const gAsk = ge ? ge.askD : 0;
                            const gBid = ge ? ge.bidD : 0;
                            if (!ask && !bid && !gAsk && !gBid) return <td key={c.strike} className={`${cellTd} ${atm}`} />;
                            // Unit multiplier (owner ruling): every cell scales by this COLUMN's
                            // own |Δ(k)| (₿-perp) or |Δ(k)|·mark ($-perp) — the empty-check
                            // above stays on the raw ₿ sums, not the converted display value, so
                            // a real MOQ-passing size is never hidden by an incidentally-small Δ.
                            const unitMul = ownOnly ? unitMulByIdx[i] ?? 1 : 1;
                            const askDisp = ask * unitMul, bidDisp = bid * unitMul;
                            const gAskDisp = gAsk * unitMul, gBidDisp = gBid * unitMul;
                            // $-perp cells switch to thousands-separated $ text; ₿/₿-perp keep
                            // the existing fixed-decimal display (2dp real, ghostDp faint).
                            const cellText = (v: number, dp: number) => (sizeUnit === "usd" ? fmtUsdAdaptive(v) : v.toFixed(dp));
                            // SECTION dims every cell except the slider's own contour —
                            // highlight, never hide (ALL shows the plain full table).
                            const section = pxSection === "section";
                            const askHit = section && pxContour[i].askBin === bin;
                            const bidHit = section && pxContour[i].bidBin === bin;
                            // Real wire cells read at full weight in YOUR BOOK (bold =
                            // actually provided) so they stay legible against the ghost.
                            const realWeight = ownOnly ? 600 : undefined;
                            return (
                              <td key={c.strike} className={`${cellTd} ${atm} leading-tight`}>
                                {ask > 0 && <div style={{ background: SELL_BG, color: SELL_ACCENT, opacity: section && !askHit ? 0.35 : 1, fontWeight: realWeight, ...(askHit ? contourStyle(SELL_ACCENT) : {}) }}>{cellText(askDisp, 2)}</div>}
                                {gAsk > 0 && <div style={{ background: SELL_BG, color: SELL_ACCENT, opacity: 0.4, fontWeight: 400 }}>{cellText(gAskDisp, ghostDp)}</div>}
                                {bid > 0 && <div style={{ background: BUY_BG, color: BUY_ACCENT, opacity: section && !bidHit ? 0.35 : 1, fontWeight: realWeight, ...(bidHit ? contourStyle(BUY_ACCENT) : {}) }}>{cellText(bidDisp, 2)}</div>}
                                {gBid > 0 && <div style={{ background: BUY_BG, color: BUY_ACCENT, opacity: 0.4, fontWeight: 400 }}>{cellText(gBidDisp, ghostDp)}</div>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                    {/* Σ-row surface (owner, live: "i dont see the row / reconciliation
                        thing here. no currency conversion thing") — YOUR BOOK only,
                        pinned under the table (sticky bottom, mirrors the sticky-top
                        header). Three stacked rows, bottom→top: premium $ (untoggled),
                        the formula line, the ONE toggle-governed Σ row — see each row's
                        own comment for why. Explicit height+bottom on every cell (not
                        left to table auto-layout) is what makes the three sticky offsets
                        land exactly, not approximately. */}
                    {/* v2 only: every reading in this footer (colTotals, depthTotal) sums
                        real+ghost RUNGS, which v3 cuts never carry (empty by construction)
                        — showing it would print a fabricated "0.00" total instead of
                        genuinely having no reading (ABSENT ≠ ZERO). */}
                    {!isV3 && ownOnly && cuts.length > 0 && (
                      <tfoot>
                        <tr>
                          {/* Reconciliation corner: bid|ask, split, in the toggle's unit —
                              reads the EXACT SAME depthTotal the header readout above
                              shows, so the two numbers agree by construction. */}
                          <td className={`sticky left-0 z-30 bg-[#112226] px-2 text-right whitespace-nowrap text-2xs ${mono}`}
                              style={{ bottom: "3.25rem", height: "2.75rem" }}>
                            <div className="flex flex-col items-end justify-center h-full leading-tight gap-0.5">
                              <span className="text-[#0ABAB5]">{sigmaRowLabel}</span>
                              <span style={{ color: SELL_ACCENT }}>ask {fmtDepth(depthTotal.ask)}</span>
                              <span style={{ color: BUY_ACCENT }}>bid {fmtDepth(depthTotal.bid)}</span>
                            </div>
                          </td>
                          {cuts.map((c, i) => {
                            const m = unitMulByIdx[i] ?? 1;
                            const askV = colTotals[i].askQty * m, bidV = colTotals[i].bidQty * m;
                            const txt = (v: number) => (sizeUnit === "usd" ? fmtUsdAdaptive(v) : v.toFixed(ghostDp));
                            return (
                              <td key={c.strike} className={`sticky z-20 bg-[#112226] px-2 text-center tabular-nums leading-tight text-2xs ${mono} ${i === atmIdx ? atmBorder : ""}`}
                                  style={{ bottom: "3.25rem", height: "2.75rem" }}>
                                <div className="flex flex-col justify-center h-full">
                                  {askV > 0 && <div style={{ color: SELL_ACCENT }}>{txt(askV)}</div>}
                                  {bidV > 0 && <div style={{ color: BUY_ACCENT }}>{txt(bidV)}</div>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          {/* Formula line: live numbers for the seam-adjacent column
                              (first call, k=+1% — where this view already opens
                              scrolled to), one muted line, directly under the Σ row.
                              Two INDEPENDENT sticky elements, one per axis: the <td>
                              itself sticks vertically (bottom, spans the full row so it
                              has zero horizontal travel room — a colSpan cell already
                              renders at its containing block's full width, so `sticky
                              left` on the cell itself is a no-op); the inner div, sized
                              to its own text (not the spanned width), sticks
                              horizontally so the formula stays on screen at any scroll
                              position instead of rendering off to the left. */}
                          <td colSpan={cuts.length + 1} className={`sticky z-20 bg-[#0b171a] ${mono}`}
                              style={{ bottom: "2rem", height: "1.25rem" }}>
                            <div className="sticky left-0 w-fit px-2 text-[10px] text-gray-500 whitespace-nowrap">
                              {formulaLine}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          {/* premium $ — a SEPARATE, untoggled functional (premiumUSD:
                              Σ(price·q)·S per column), never a 4th unit case. Visually
                              distinct label color/weight so it never reads as part of
                              the Σ toggle above it. */}
                          <td className={`sticky left-0 z-30 bg-[#112226] px-2 text-right whitespace-nowrap text-2xs ${mono}`}
                              style={{ bottom: 0, height: "2rem" }}>
                            <span style={{ color: PREMIUM_LABEL_COLOR, fontWeight: 700 }}>premium $</span>
                          </td>
                          {cuts.map((c, i) => {
                            const askUsd = colTotals[i].askCost * mark, bidUsd = colTotals[i].bidCost * mark;
                            return (
                              <td key={c.strike} className={`sticky z-20 bg-[#112226] px-2 text-center tabular-nums leading-tight text-2xs ${mono} ${i === atmIdx ? atmBorder : ""}`}
                                  style={{ bottom: 0, height: "2rem" }}>
                                <div className="flex flex-col justify-center h-full">
                                  {askUsd > 0 && <div style={{ color: SELL_ACCENT }}>{fmtUsdAdaptive(askUsd)}</div>}
                                  {bidUsd > 0 && <div style={{ color: BUY_ACCENT }}>{fmtUsdAdaptive(bidUsd)}</div>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      </tfoot>
                    )}
                  </>
                )}

                {view === "sx" && (
                  <>
                    <thead>
                      <GroupHeader rowLabel="size (₿)" rowDir="small→large" colLabel="strike" />
                      <tr>
                        {cuts.map((c, i) => <StrikeHead key={c.strike} c={c} i={i} />)}
                      </tr>
                    </thead>
                    <tbody>
                      {levels.flatMap((lvl, li) => [
                        <tr key={`${lvl}-a`} className={li > 0 ? "border-t border-[#808080]/30" : ""}>
                          <td className={labelTd} style={{ color: SELL_ACCENT }}>{lvl} ₿ · ask</td>
                          {cuts.map((c, i) => {
                            // Fixed reading: Σ VWAP toward clearing (this view's permanent
                            // identity — no toggle, see caption note).
                            const v = sxMatrix[li][i].askSigma;
                            const hit = sxSection === "section" && sxContour[i].askLi === li;
                            const dim = sxSection === "section" && !hit;
                            return (
                              <td key={c.strike} className={`${cellTd} ${i === atmIdx ? atmBorder : ""}`}
                                  style={v == null ? undefined : { background: SELL_BG, color: SELL_ACCENT, opacity: dim ? 0.35 : 1, ...(hit ? contourStyle(SELL_ACCENT) : {}) }}>
                                {v == null ? "" : v.toFixed(4)}
                              </td>
                            );
                          })}
                        </tr>,
                        <tr key={`${lvl}-b`}>
                          <td className={labelTd} style={{ color: BUY_ACCENT }}>{lvl} ₿ · bid</td>
                          {cuts.map((c, i) => {
                            const v = sxMatrix[li][i].bidSigma;
                            const hit = sxSection === "section" && sxContour[i].bidLi === li;
                            const dim = sxSection === "section" && !hit;
                            return (
                              <td key={c.strike} className={`${cellTd} ${i === atmIdx ? atmBorder : ""}`}
                                  style={v == null ? undefined : { background: BUY_BG, color: BUY_ACCENT, opacity: dim ? 0.35 : 1, ...(hit ? contourStyle(BUY_ACCENT) : {}) }}>
                                {v == null ? "" : v.toFixed(4)}
                              </td>
                            );
                          })}
                        </tr>,
                      ])}
                    </tbody>
                  </>
                )}

                {view === "ps" && psSection === "section" && (
                  <>
                    {/* The two cumulative columns (cum size ₿ / cum cost $) shipped and
                        were then commented out, not deleted (owner, 2026-07-28: "comment
                        out the cumulation thing altogether" supersedes keeping them as
                        the blessed-preview shape) — cost-of-size stays SIZE × STRIKE's
                        job. Ladder is price · size only now; restore the two <th>/<td>
                        pairs below (and colSpan 2→4) together if cumulation returns. */}
                    {/* ONE layout for both ps modes (owner, repeated): price | ask ₿ | bid ₿ —
                        identical header/shape to ALL below, so toggling never rearranges the
                        table; only what fills the rows changes. SECTION = one strike's exact
                        rungs, ask column above the spread, bid column below (the classic DOM
                        shape). Cum columns commented out per the cumulation ruling — restore
                        the <th> pair below AND the matching commented <td>s in both row maps
                        together (colSpan sites go 3→5). */}
                    <thead><tr>
                      <th className={`${cornerTh} relative`} title={"rows: price (coin), high to low · columns: side, bid | ask"}
                        style={{ backgroundImage: "linear-gradient(to top right, transparent calc(50% - 0.5px), #3a4a4d calc(50% - 0.5px), #3a4a4d calc(50% + 0.5px), transparent calc(50% + 0.5px))", minWidth: "7.5rem", height: "3rem" }}>
                        <span className="absolute top-0.5 right-1.5">size (₿) →</span>
                        <span className="absolute bottom-0.5 left-1.5">price (coin) ↓</span>
                      </th>
                      <th className={headTh} title="size resting at this rung, bid side">bid ₿</th>
                      <th className={headTh} title="size resting at this rung, ask side">ask ₿</th>
                      {/* v3 posts no resting rungs, so the size-axis max is a floored 0.00 —
                          blank the axis header rather than print a fabricated 0 (ABSENT ≠ ZERO),
                          keeping the 4th column aligned with the v3 rows' empty cell. */}
                      {isV3 ? <th className={headTh} /> : sizeAxisTh(maxRungQty)}
                      {/* <th className={headTh} title="cumulative — accumulated from the touch outward">cum size ₿</th>
                      <th className={headTh} title="cumulative — accumulated from the touch outward">cum cost $</th> */}
                    </tr></thead>
                    <tbody>
                      {cut?.v3 ? (
                        // v3: one aggregate ask row + one aggregate bid row — the honest
                        // shape (a single continuous level, not a ladder of rungs). Size
                        // columns read "—" (absent, never 0 — CLAUDE.md ABSENT ≠ ZERO):
                        // v3 posts no discrete resting quantity at any one price.
                        <>
                          <tr>
                            <td className={labelTd}>{cut.v3.ask.toFixed(4)}</td>
                            <td className={cellTd} />
                            <td className={cellTd} style={{ color: SELL_ACCENT }}>—</td>
                            <td className={cellTd} />
                          </tr>
                          <tr ref={spreadRowRef}>
                            <td colSpan={4} className={`text-center py-1 text-2xs text-[#8A8A8A] ${mono}`} style={{ background: "#112226" }}>
                              {spreadLabel}
                            </td>
                          </tr>
                          <tr>
                            <td className={labelTd}>{cut.v3.bid.toFixed(4)}</td>
                            <td className={cellTd} style={{ color: BUY_ACCENT }}>—</td>
                            <td className={cellTd} />
                            <td className={cellTd} />
                          </tr>
                        </>
                      ) : !cut || (!cut.bid.length && !cut.ask.length) ? (
                        <tr><td colSpan={4} className={`text-center py-8 text-2xs text-gray-400 ${mono}`}>no depth posted at this strike</td></tr>
                      ) : (
                        <>
                          {/* Colour law: side tint over the full extent of side-specific
                              data — the price cell and that side's own cell; the opposite
                              side's empty cell stays untinted. */}
                          {[...cut.ask].reverse().map((r, i) => (
                            <tr key={`a-${i}`}>
                              <td className={labelTd}>{r.price.toFixed(4)}</td>
                              <td className={cellTd} />
                              <td className={cellTd} style={{ color: SELL_ACCENT }}>{r.qty.toFixed(4)}</td>
                              <td className={cellTd}>{sizeBar(r.qty, maxRungQty, SELL_BG, SELL_ACCENT, "")}</td>
                              {/* <td className={cellTd}>{r.cum.toFixed(4)}</td>
                              <td className={cellTd}>{fmtUsd(r.cumCost * mark)}</td> */}
                            </tr>
                          ))}
                          {/* Opens centred in the viewport (see the useLayoutEffect above) —
                              asks stacked above, bids below, both visible without scrolling. */}
                          <tr ref={spreadRowRef}>
                            <td colSpan={4} className={`text-center py-1 text-2xs text-[#8A8A8A] ${mono}`} style={{ background: "#112226" }}>
                              {spreadLabel}
                            </td>
                          </tr>
                          {cut.bid.map((r, i) => (
                            <tr key={`b-${i}`}>
                              <td className={labelTd}>{r.price.toFixed(4)}</td>
                              <td className={cellTd} style={{ color: BUY_ACCENT }}>{r.qty.toFixed(4)}</td>
                              <td className={cellTd} />
                              <td className={cellTd}>{sizeBar(r.qty, maxRungQty, BUY_BG, BUY_ACCENT, "")}</td>
                              {/* <td className={cellTd}>{r.cum.toFixed(4)}</td>
                              <td className={cellTd}>{fmtUsd(r.cumCost * mark)}</td> */}
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </>
                )}

                {view === "ps" && psSection === "all" && (
                  <>
                    {/* The projection along the strike axis: PRICE × STRIKE's own matrix
                        summed across its strike axis into one column, per side. */}
                    <thead><tr>
                      <th className={`${cornerTh} relative`} title={`rows: price (coin), high to low, binned ${binWidth} coin · columns: side, bid | ask`}
                        style={{ backgroundImage: "linear-gradient(to top right, transparent calc(50% - 0.5px), #3a4a4d calc(50% - 0.5px), #3a4a4d calc(50% + 0.5px), transparent calc(50% + 0.5px))", minWidth: "7.5rem", height: "3rem" }}>
                        <span className="absolute top-0.5 right-1.5">size (₿) →</span>
                        <span className="absolute bottom-0.5 left-1.5">price (coin) ↓</span>
                      </th>
                      <th className={headTh} title="summed across every strike">bid ₿</th>
                      <th className={headTh} title="summed across every strike">ask ₿</th>
                      {sizeAxisTh(maxAllQty)}
                    </tr></thead>
                    <tbody>
                      {allLadderRows.length === 0 ? (
                        <tr><td colSpan={4} className={`text-center py-8 text-2xs text-gray-400 ${mono}`}>no depth posted</td></tr>
                      ) : (
                        allLadderRows.map((r) => (
                          <tr key={r.bin}>
                            <td className={labelTd}>{(r.bin * binWidth).toFixed(3)}</td>
                            <td className={cellTd} style={{ color: BUY_ACCENT }}>{r.bid > 0 ? r.bid.toFixed(2) : ""}</td>
                            <td className={cellTd} style={{ color: SELL_ACCENT }}>{r.ask > 0 ? r.ask.toFixed(2) : ""}</td>
                            <td className={cellTd}><div className="space-y-px">
                              {r.ask > 0 && sizeBar(r.ask, maxAllQty, SELL_BG, SELL_ACCENT, "")}
                              {r.bid > 0 && sizeBar(r.bid, maxAllQty, BUY_BG, BUY_ACCENT, "")}
                            </div></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}

                {/* A BOOK 4th tab (raw lattice, one column per strike) shipped and was then
                    rejected by the owner — PRICE × SIZE already IS the actual book.
                    Commented out with its bookView union member and toggle entry, not
                    deleted; GroupHeader/StrikeHead/rungTd above stay shared with px/sx. */}
                {/* {view === "book" && (
                  <>
                    <thead>
                      <GroupHeader cornerLabel="±pos" />
                      <tr>
                        {cuts.map((c, i) => <StrikeHead key={c.strike} c={c} i={i} />)}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: rowsPerSide }, (_, i) => rowsPerSide - i).map((pos) => (
                        <tr key={`a${pos}`}>
                          <td className={labelTd}>{-pos}</td>
                          {cuts.map((c, i) => rungTd(String(c.strike), c.ask[pos - 1], "ask", i === atmIdx))}
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={cuts.length + 1} className="h-1 p-0" style={{ background: "#0ABAB566" }} />
                      </tr>
                      {Array.from({ length: rowsPerSide }, (_, i) => i + 1).map((pos) => (
                        <tr key={`b${pos}`}>
                          <td className={labelTd}>{`+${pos}`}</td>
                          {cuts.map((c, i) => rungTd(String(c.strike), c.bid[pos - 1], "bid", i === atmIdx))}
                        </tr>
                      ))}
                    </tbody>
                  </>
                )} */}

              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

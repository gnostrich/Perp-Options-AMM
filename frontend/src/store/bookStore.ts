import { create } from "zustand";
import type { BookSnapshot } from "@/lib/data/api/contracts";
import type { V3Book } from "@/lib/data/api/v3contracts";
import { fetchBookSnapshotAction } from "@/app/actions/fetchBookSnapshotAction";
import { fetchV3BookAction } from "@/app/actions/fetchV3BookAction";
import { NEUTRAL_DIALS, type GhostDials } from "@/lib/burr2/pricer";

/** Default ladder selection = strike nearest the mark (UX §B.3). Snapshot strikes are
 *  ABSOLUTE dollars, so the distance is measured against oracle_price, not against 0. */
function nearestStrike(snapshot: BookSnapshot): number | null {
  if (!snapshot.strikes.length) return null;
  const mark = snapshot.oracle_price;
  return snapshot.strikes.reduce((best, s) =>
    Math.abs(s.strike - mark) < Math.abs(best.strike - mark) ? s : best
  ).strike;
}

type BookStore = {
  snapshot: BookSnapshot | null;
  isLoading: boolean;
  /** Wall-clock of the last successful fetch — shown as the book's "as of", so a still
   *  table is visibly still-and-current rather than possibly stale. */
  fetchedAt: number | null;
  error: string | null;
  /** Restrict the book to the viewer's own LP rungs (portfolio deep-link defaults it on). */
  ownOnly: boolean;
  /** One view at a time, toggled — not three panels at once, and all three render as
   *  TABLES, not charts. "px" = PRICE × STRIKE (the book matrix: size resting per premium
   *  bin × strike), "sx" = SIZE × STRIKE (cost-of-size: VWAP premium per size level ×
   *  strike), "ps" = PRICE × SIZE (the single-strike DOM ladder — the actual book; the
   *  other two are aggregations of it, not a separate 4th "raw" view).
   *  (Two commented-out states, not deleted — restore by uncommenting the matching
   *  GraphCardWrapperTab entries: "cells" was BookCellsView's flat fact-table dump;
   *  "book" was a since-rejected 4th tab that duplicated PRICE × SIZE across strikes,
   *  owner correction 2026-07-28 — "the actual book lives WITHIN [the three], PRICE ×
   *  SIZE IS the book.")
   *  Default "sx": depth-by-strike is the most book-like face and least like the Options
   *  Pricing chart (that resemblance was the owner's original redundancy complaint). */
  bookView: "px" | "sx" | "ps";
  /** The offset PRICE × SIZE is cut at, and what a click on GraphCard's depth strip
   *  selects. Dollar-keyed; matched by nearest strike. */
  selectedStrike: number | null;
  /** PRICE × STRIKE's own cut: the size slider q₀ (₿, whole-book max depth range). Not a
   *  filter — every strike/premium cell still renders; q₀ only picks which cell per
   *  strike-side gets the contour highlight (Σ-from-touch first ≥ q₀). */
  sizeCut: number;
  /** SIZE × STRIKE's own cut: the cost slider (coin, whole-book premium-domain range).
   *  Same non-filtering role: picks the iso-cost contour (largest size level whose Σ
   *  cost stays within budget), highlighted, not hidden. */
  costCut: number;
  // A global Δ|Σ toggle lived here — commented out, not deleted (owner, 2026-07-28: the
  // lens propagated inconsistently across views — vwap↔marginal on SIZE × STRIKE is a
  // different kind of pair than resting↔cumulated on PRICE × STRIKE, and one shared
  // control over both read as muddy). Each view now shows its one preview-blessed
  // reading, fixed: PRICE × STRIKE = resting notional; SIZE × STRIKE = VWAP cost-of-size
  // (its permanent identity, not a toggle option); PRICE × SIZE = the ladder's explicit
  // price · Δ size · Σ size · Σ cost columns, unconditional. Restore by uncommenting
  // `mode`/`setMode` here and their usages in BookProjectionView.tsx.
  // mode: "delta" | "sigma";
  /** "2D + the ability to vary the plane" (owner), per view, independent of the other —
   *  persisted separately so switching views keeps each one's own choice. "all" (default)
   *  = aggregate along the third axis, full table, no highlight — exactly what px/sx
   *  cells already do. "section" = the slider commits: px/sx dim every cell except the
   *  slider's contour (highlighted, never hidden). */
  pxSection: "all" | "section";
  sxSection: "all" | "section";
  /** PRICE × SIZE's ALL is the projection along the strike axis (Δ notional per price
   *  bin, summed across every strike, per side) — the owner's own re-derivation after a
   *  brief retraction; restored. Default "section" (not "all" like px/sx): the
   *  single-strike ladder stays PRICE × SIZE's landing state. */
  psSection: "all" | "section";
  pollHandle: ReturnType<typeof setInterval> | null;

  /** The YOUR BOOK ghost-proforma playground's 5 dials (additive, neutral
   *  0/×1) — client-side only, never sent to the backend. Lives here (not
   *  lpCurveStore) since it drives a preview OVER the wire book, not the
   *  deploy form, and must persist across the OWN ONLY toggle / view
   *  switches like every other bookStore field. Derived readout (effective
   *  κ/β/ATM/depth, ghost cells) is computed in BookProjectionView via
   *  lib/burr2/pricer — pure functions of {dials, mark, cuts}, no reason to
   *  duplicate that state here. */
  dials: GhostDials;

  /** YOUR BOOK's size-unit toggle (owner ruling, moving-parts law: "where a reading has
   *  two honest semantics, expose the choice as a small labeled toggle and state the
   *  basis"). "btc" = today's option size (₿, unchanged default). "perp" = the
   *  perp-equivalent hedge size, qty×|Δ(k)| at the live preview curve. "usd" = $-perp —
   *  the "perp" reading × current mark S (FORMAL_CORE.md `usd_perp_commutes`: the ·S
   *  step is a scalar so it commutes with cross-strike aggregation, unlike the |Δ(k)|
   *  step, which does NOT — see `perp_equiv_does_not_commute` — so |Δ(k)| is always
   *  applied per strike FIRST, ·S only after). Same reasoning as `dials` for living
   *  here, not lpCurveStore: it labels a reading OVER the wire/ghost book, must persist
   *  across dial edits and view/OWN-ONLY switches. */
  sizeUnit: "btc" | "perp" | "usd";

  /** Additive, flag-gated (NEXT_PUBLIC_V3_BOOK, lib/v3BookFlag.ts) source
   *  switch for the SAME book views — "v2" (default, unchanged behavior)
   *  reads bookSnapshot; "v3" reads v3Book (GET /api/v3/book, the read-only
   *  continuation-mechanism aggregate). Never set without the flag's own UI
   *  control existing (GraphCardWrapperTab renders the toggle only when the
   *  flag is on), so v2's default path is unreachable-from-v3 by construction. */
  dataSource: "v2" | "v3";
  v3Book: V3Book | null;
  v3Error: string | null;

  setOwnOnly: (v: boolean) => void;
  setBookView: (v: "px" | "sx" | "ps") => void;
  setSelectedStrike: (s: number | null) => void;
  // setMode: (v: "delta" | "sigma") => void;
  setSizeCut: (v: number) => void;
  setCostCut: (v: number) => void;
  setPxSection: (v: "all" | "section") => void;
  setSxSection: (v: "all" | "section") => void;
  setPsSection: (v: "all" | "section") => void;
  setDial: (key: keyof GhostDials, v: number) => void;
  setSizeUnit: (v: "btc" | "perp" | "usd") => void;
  setDataSource: (v: "v2" | "v3") => void;
  fetchV3Snapshot: () => Promise<void>;
  fetchSnapshot: () => Promise<void>;
  /** Starts the ≤2s poll (§7.2 contract 4); call on mount while the Book panel is visible. */
  connectBookStream: () => void;
  disconnectBookStream: () => void;
};

export const useBookStore = create<BookStore>()((set, get) => ({
  snapshot: null,
  isLoading: false,
  fetchedAt: null,
  error: null,
  ownOnly: false,
  bookView: "px", // sx/ps commented out of the toggle (owner, 2026-07-29) — front face only
  selectedStrike: null,
  // mode: "delta",
  sizeCut: 5,
  costCut: 0.15,
  pxSection: "all",
  sxSection: "all",
  psSection: "section",
  pollHandle: null,
  dials: { ...NEUTRAL_DIALS },
  sizeUnit: "btc",
  dataSource: "v2",
  v3Book: null,
  v3Error: null,

  setOwnOnly: (v) => set({ ownOnly: v, selectedStrike: null }),
  setBookView: (v) => set({ bookView: v }),
  setSelectedStrike: (s) => set({ selectedStrike: s }),
  // setMode: (v) => set({ mode: v }),
  setSizeCut: (v) => set({ sizeCut: v }),
  setCostCut: (v) => set({ costCut: v }),
  setPxSection: (v) => set({ pxSection: v }),
  setSxSection: (v) => set({ sxSection: v }),
  setPsSection: (v) => set({ psSection: v }),
  setDial: (key, v) => set((s) => ({ dials: { ...s.dials, [key]: v } })),
  setSizeUnit: (v) => set({ sizeUnit: v }),
  // Resets to the front face on every switch (both directions). The stuck-view
  // path is currently unreachable — v3OnlyViewOptions is empty (front face only
  // is source-independent, CLAUDE.md UX law 2026-08-13) — but the reset stands
  // for any restored entry: a session that drilled into a non-px view under one
  // source must not carry it to the other, where the view-button row is hidden
  // at length 1 (no way back to "px" from the UI) — the "v2 changes when the
  // flag is off" case this store must not allow.
  setDataSource: (v) => {
    set({ dataSource: v, bookView: "px" });
    // Kick an immediate fetch on first switch to v3 rather than waiting up to 2s for
    // the poll's next tick — the poll (connectBookStream) picks the source live off
    // `dataSource` already, this is purely for a snappier first paint.
    if (v === "v3" && !get().v3Book) get().fetchV3Snapshot();
  },

  fetchV3Snapshot: async () => {
    // Same stale-while-revalidate shape as fetchSnapshot: keep the last v3Book
    // on screen across polls, only isLoading-gate the first load.
    if (!get().v3Book) set({ isLoading: true, error: null, v3Error: null });
    const v3Book = await fetchV3BookAction();
    if (!v3Book) {
      set({ isLoading: false, v3Error: "v3 book unavailable" });
      return;
    }
    set({ v3Book, isLoading: false, v3Error: null, fetchedAt: Date.now() });
  },

  fetchSnapshot: async () => {
    // Stale-while-revalidate: `isLoading` marks the FIRST load only. A background poll
    // keeps the last snapshot on screen until the new one lands — flipping it on every
    // 2s tick made every consumer swap its rows for skeletons twice a second.
    if (!get().snapshot) set({ isLoading: true, error: null });
    const snapshot = await fetchBookSnapshotAction();
    if (!snapshot) {
      set({ isLoading: false, error: "book unavailable" });
      return;
    }
    set((s) => ({
      snapshot,
      isLoading: false,
      error: null,
      fetchedAt: Date.now(),
      // Default selection = strike nearest the mark (UX §B.3); preserve a user pick across polls.
      selectedStrike: s.selectedStrike ?? nearestStrike(snapshot),
    }));
  },

  connectBookStream: () => {
    if (get().pollHandle) return;
    // One poll loop, source picked live off `dataSource` each tick — so
    // flipping the toggle mid-poll switches feeds within one 2s tick instead
    // of needing a reconnect. v2 unaffected: dataSource never leaves "v2"
    // unless the flag-gated UI control exists to set it.
    const tick = () => (get().dataSource === "v3" ? get().fetchV3Snapshot() : get().fetchSnapshot());
    tick();
    const handle = setInterval(tick, 2000);
    set({ pollHandle: handle });
  },

  disconnectBookStream: () => {
    const handle = get().pollHandle;
    if (handle) clearInterval(handle);
    set({ pollHandle: null });
  },
}));

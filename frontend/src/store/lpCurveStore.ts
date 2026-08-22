import { create } from "zustand";
import { useGraphStore, type OverlayPoint } from "./graphStore";
import type {
  LpParams,
  LpDials,
  CurveBounds,
  SchedulePreview,
  MyLpState,
} from "@/lib/data/api/contracts";
import { fetchCurveBoundsAction } from "@/app/actions/fetchCurveBoundsAction";
import { curvePreviewAction } from "@/app/actions/curvePreviewAction";
import { createEarnPositionAction } from "@/app/actions/createEarnPositionAction";
import { lpUpdateAction } from "@/app/actions/lpUpdateAction";
import { fetchLpPositionsAction } from "@/app/actions/fetchLpPositionsAction";
import { closeEarnPositionAction } from "@/app/actions/closeEarnPositionAction";

/** Workbook defaults (V2_DESIGN.md §1.3 / V2_UX_SPEC.md §B.4). */
export const LP_CURVE_DEFAULTS: LpParams = {
  sBar: 0.6,
  a: 1.2705,
  gamma: 1.8413,
  lambda: 0.01,
  fee: 0.003,
  N: 40,
};

/** Operator dials never touch fair value; the v2 LP-console UI does not expose them (UX §B.4). */
const LP_DIAL_DEFAULTS: LpDials = { spread: 1, skewLean: 0, peak: 1 };

/** Value-equal check against LP_CURVE_DEFAULTS — drives the YOUR BOOK ghost's
 *  "= market mirror" badge (BookProjectionView.tsx): true exactly when the
 *  panel sits at the workbook defaults, independent of the dial row. N is
 *  excluded from the value compare (owner ruling 2026-07-29, "curve size
 *  follows the money"): N is no longer a fixed default, it tracks margin×
 *  leverage whenever the user hasn't explicitly set it, so "at rest" for N
 *  means DERIVED MODE itself (nExplicit=false), not any particular number. */
export function paramsAtDefaults(p: LpParams, nExplicit: boolean): boolean {
  return (
    !nExplicit &&
    (Object.keys(LP_CURVE_DEFAULTS) as (keyof LpParams)[])
      .filter((k) => k !== "N")
      .every((k) => Math.abs(p[k] - LP_CURVE_DEFAULTS[k]) < 1e-9)
  );
}

/** Mirrors perp-backend-staging/routes/book_handlers.go's buildSchedulePreview
 *  EXACTLY (`notionalBtc = marginUSD * leverage / mark` when N is absent, the
 *  v2 D9 fallback) — the one place this formula is written on the FE. Returns
 *  the TRUE unclamped value (may be <10 or >100, outside the panel's UI
 *  bounds) since derived mode's deploy payload omits N and lets the backend
 *  own the floor; only EXPLICIT N goes through setParam's bounds clamp. */
export function deriveN(marginUsd: number, leverage: number, mark: number): number {
  return marginUsd > 0 && leverage > 0 && mark > 0 ? (marginUsd * leverage) / mark : 0;
}

// UI guardrails from UX §B.4's table, used until curveBoundsAction resolves the
// authoritative /api/amm/curve-bounds response.
const FALLBACK_BOUNDS: CurveBounds = {
  sBar: { min: 0.2, max: 1.0, step: 0.01, default: 0.6 },
  a: { min: 0.5, max: 4.0, step: 0.0001, default: 1.2705 },
  gamma: { min: 0.5, max: 4.0, step: 0.0001, default: 1.8413 },
  lambda: { min: 0, max: 0.1, step: 0.001, default: 0.01 },
  fee: { min: 0, max: 0.02, step: 0.0005, default: 0.003 },
  N: { min: 10, max: 100, step: 1, default: 40 },
};

/** Merges the preview's separate call/put curves into the shared overlay shape (graphStore). */
function mergeCurve(
  callCurve: SchedulePreview["callCurve"],
  putCurve: SchedulePreview["putCurve"]
): OverlayPoint[] {
  const byPrice = new Map<number, OverlayPoint>();
  for (const c of callCurve) byPrice.set(c.price, { price: c.price, call: c.call, put: 0 });
  for (const p of putCurve) {
    const existing = byPrice.get(p.price);
    if (existing) existing.put = p.put;
    else byPrice.set(p.price, { price: p.price, call: 0, put: p.put });
  }
  return Array.from(byPrice.values()).sort((a, b) => a.price - b.price);
}

type LpCurveState = {
  params: LpParams;
  dials: LpDials;
  bounds: CurveBounds;
  marginUsd: number;
  leverage: number;
  /** Live oracle mark, fed in by EarnComponent (graphStore.currentMarkPrice) —
   *  the same mark buildSchedulePreview's own derive uses (previewMark()). */
  mark: number;
  /** false = DERIVED MODE (default): params.N tracks deriveN(marginUsd,leverage,mark)
   *  live. true = EXPLICIT MODE: the user typed/slid N, it wins everywhere until
   *  "Reset to defaults". */
  nExplicit: boolean;

  preview: SchedulePreview | null;
  previewLoading: boolean;
  previewError: string | null;

  myLpState: MyLpState | null;
  /** Every lpId this wallet owns (Book "own only" filter). */
  myLpIds: string[];
  deploying: boolean;
  updating: boolean;
  withdrawing: boolean;

  setParam: (key: keyof LpParams, value: number) => void;
  setMarginUsd: (v: number) => void;
  setLeverage: (v: number) => void;
  setMark: (v: number) => void;
  resetDefaults: () => void;
  fetchBounds: () => Promise<void>;
  /** 300ms-debounced (design §11 item 20); pushes callCurve/putCurve onto graphStore's dotted overlay. */
  fetchPreview: () => void;
  /** `lpId` selects a specific position (portfolio deep-link); omitted = the deployed one. */
  fetchMyLpState: (wallet: string, lpId?: string) => Promise<void>;
  deploy: (
    wallet: string,
    notionalBtc: number,
    walletType?: "temporal" | "hyperliquid"
  ) => Promise<{ ok: boolean; error: string | null }>;
  update: (wallet: string) => Promise<{ ok: boolean; error: string | null }>;
  withdraw: () => Promise<boolean>;
};

let previewTimer: ReturnType<typeof setTimeout> | null = null;

export const useLpCurveStore = create<LpCurveState>()((set, get) => {
  // Recomputes params.N from the live deriveN() formula and writes it straight in —
  // bypassing setParam's bounds clamp on purpose (guard, D9 addendum): a derived N
  // below the panel's UI min=10 (or above max=100) still displays/prices at its TRUE
  // value; only the deploy payload's omission of N is what lets the backend enforce
  // its own floor. No-op in EXPLICIT MODE (nExplicit=true) — explicit N is untouched
  // by margin/leverage/mark moving underneath it.
  const applyDerivedN = () => {
    const { nExplicit, marginUsd, leverage, mark } = get();
    if (nExplicit) return;
    set((s) => ({ params: { ...s.params, N: deriveN(marginUsd, leverage, mark) } }));
  };

  return {
  params: { ...LP_CURVE_DEFAULTS },
  dials: { ...LP_DIAL_DEFAULTS },
  bounds: FALLBACK_BOUNDS,
  marginUsd: 0,
  leverage: 1,
  mark: 0,
  nExplicit: false,

  preview: null,
  previewLoading: false,
  previewError: null,

  myLpState: null,
  myLpIds: [],
  deploying: false,
  updating: false,
  withdrawing: false,

  setParam: (key, value) => {
    const b = get().bounds[key];
    const clamped = Math.min(b.max, Math.max(b.min, value));
    // Typing/sliding N is what FLIPS the field into EXPLICIT MODE (D9): from here
    // on it wins everywhere (ghost + deploy payload) until Reset. Every other
    // field is unaffected — they never had a derived mode to begin with.
    set((s) => ({
      params: { ...s.params, [key]: clamped },
      nExplicit: key === "N" ? true : s.nExplicit,
    }));
    get().fetchPreview();
  },

  setMarginUsd: (v) => {
    set({ marginUsd: v });
    applyDerivedN();
    get().fetchPreview();
  },

  setLeverage: (v) => {
    set({ leverage: v });
    applyDerivedN();
    get().fetchPreview();
  },

  setMark: (v) => {
    if (Math.abs(v - get().mark) < 1e-9) return; // skip no-op refetch storms on price jitter
    set({ mark: v });
    applyDerivedN();
    get().fetchPreview();
  },

  resetDefaults: () => {
    set({ params: { ...LP_CURVE_DEFAULTS }, dials: { ...LP_DIAL_DEFAULTS }, nExplicit: false });
    applyDerivedN();
    get().fetchPreview();
  },

  fetchBounds: async () => {
    const bounds = await fetchCurveBoundsAction();
    if (bounds) set({ bounds });
  },

  fetchPreview: () => {
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(async () => {
      set({ previewLoading: true, previewError: null });
      const { params, marginUsd, leverage } = get();
      const preview = await curvePreviewAction({ ...params, margin_usd: marginUsd, leverage });
      if (!preview) {
        set({ previewLoading: false, previewError: "preview unavailable" });
        useGraphStore.getState().clearOverlay();
        return;
      }
      set({ preview, previewLoading: false });
      useGraphStore
        .getState()
        .setOverlayCurve(mergeCurve(preview.callCurve, preview.putCurve), "lp-preview");
    }, 300);
  },

  fetchMyLpState: async (wallet, lpId) => {
    if (!wallet) return;
    // One GET serves both needs: the curve to load (named by lpId from the portfolio
    // deep-link, else the deployed one) and every lpId this wallet owns, which the
    // Book panel's "own only" filter needs.
    const positions = await fetchLpPositionsAction(wallet);
    const state =
      (lpId
        ? positions.find((p) => p.lpState?.lpId === lpId)
        : positions.find((p) => p.lpState?.deployed)
      )?.lpState ?? null;
    set({
      myLpState: state,
      myLpIds: positions.map((p) => p.lpState?.lpId).filter((id): id is string => !!id),
    });
    if (!state) return;
    // Loading a deployed curve must repaint the dotted preview from ITS params,
    // otherwise the chart keeps showing whatever the form last previewed. nExplicit:
    // true — this N is a REAL already-committed value, not something to keep deriving
    // off the (unrelated, currently-empty) top-up MARGIN/LEVERAGE fields; without this
    // the very next setMarginUsd(0) from the mount-time effect would silently stomp it.
    set({ params: state.params, dials: state.dials ?? LP_DIAL_DEFAULTS, nExplicit: true });
    get().fetchPreview();
  },

  deploy: async (wallet, notionalBtc, walletType = "temporal") => {
    set({ deploying: true });
    try {
      const { params, dials, marginUsd, leverage, nExplicit } = get();
      // DERIVED MODE: omit N (send 0) so the backend derives it itself, at ITS OWN
      // live mark, from initial_deposit_btc/leverage — one source of truth at the
      // moment capital actually commits (NewLPCurve's `if p.N<=0 { p.N=btcAmount }`
      // fallback, currently-dead code this flips live). EXPLICIT MODE: params.N
      // (already clamped by setParam) wins verbatim, exactly as before this change.
      const deployParams = nExplicit ? params : { ...params, N: 0 };
      // {data,error}: a thrown ApiError (e.g. the 10× leverage-cap refusal, CLAUDE.md
      // "LP leverage is capped at 10×: …") must reach the caller's own words, not get
      // swallowed into a generic toast — same discipline as closeAccruedPositionsAction.
      const { data, error } = await createEarnPositionAction({
        user_wallet: wallet,
        initial_deposit_dollar: marginUsd,
        initial_deposit_btc: notionalBtc,
        leverage,
        is_transcat: true,
        params: deployParams,
        dials,
        wallet_type: walletType,
      });
      if (data?.success) {
        await get().fetchMyLpState(wallet);
        return { ok: true, error: null };
      }
      return { ok: false, error: error ?? data?.message ?? "Failed to deploy LP curve" };
    } finally {
      set({ deploying: false });
    }
  },

  update: async (wallet) => {
    set({ updating: true });
    try {
      const { params, dials } = get();
      const { data, error } = await lpUpdateAction(wallet, { params, dials });
      if (data) {
        set({ myLpState: data });
        return { ok: true, error: null };
      }
      return { ok: false, error: error ?? "Failed to update LP curve" };
    } finally {
      set({ updating: false });
    }
  },

  withdraw: async () => {
    const lpId = get().myLpState?.lpId;
    if (!lpId) return false;
    set({ withdrawing: true });
    try {
      const { ok } = await closeEarnPositionAction(lpId);
      if (ok) set({ myLpState: null });
      return ok;
    } finally {
      set({ withdrawing: false });
    }
  },
  };
});

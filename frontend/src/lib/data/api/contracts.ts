/**
 * v2 reconciled API contracts (design §7.2 + §13.4).
 *
 * One authoritative shape per contract; these freeze the payload types the
 * concurrent FE build items (18–24, P4) compile against. Response bodies are
 * authoritative — FE server-action names (/api/lp/*) map onto the actual Go
 * routes (/api/amm/*, /api/book/*, /earn/*) via the Next.js DAL/proxy.
 */

/* ── shared ─────────────────────────────────────────── */

/** One call point of a curve on the 61-point signed-% grid (§5/§7.2). */
export interface CallPoint {
  price: number;
  call: number;
}

/** One put point of a curve on the 61-point signed-% grid (§5/§7.2). */
export interface PutPoint {
  price: number;
  put: number;
}

/** The 6-param bespoke Burr-2 curve an LP owns (Decision 1, §1.1). */
export interface LpParams {
  sBar: number;
  a: number;
  gamma: number;
  lambda: number;
  fee: number;
  N: number;
}

/** Operator dials that reshape the ladder, never fair value (§1.1). */
export interface LpDials {
  spread: number;
  skewLean: number;
  peak: number;
}

/* ── 1. curve-preview: POST /api/amm/curve-preview (B.1/B.4) ── */

export interface SchedulePreview {
  callCurve: CallPoint[];
  putCurve: PutPoint[];
  ladder: { strike: number; wing: string; price: number; qty: number }[];
  rungs: number;
  totalNotionalBtc: number;
  peakStrike: number;
  estSpreadPct: number;
  capitalAtRiskUsd: number;
}

/* ── 2. curve-bounds: GET /api/amm/curve-bounds (B.4) ── */

export interface Bound {
  min: number;
  max: number;
  step: number;
  default: number;
}

/** Bounds for each of the six curve params (§7.2 contract 2). */
export interface CurveBounds {
  sBar: Bound;
  a: Bound;
  gamma: Bound;
  lambda: Bound;
  fee: Bound;
  N: Bound;
}

/* ── 3. quote after_curve: extends POST /api/transact (B.2) ── */

/** Post-fill best-of-book smile on a cloned book; `kappa_after` per wing. */
export interface AfterCurve {
  callCurve: CallPoint[];
  putCurve: PutPoint[];
  kappa_after?: { call: number; put: number };
}

/* ── 4. book snapshot: GET /api/book/snapshot (B.3) ── */

export interface BookSnapshotPerLp {
  lpId: string;
  side: string;
  qty: number;
}

export interface BookSnapshotRung {
  price: number;
  bidQty: number;
  askQty: number;
  perLp: BookSnapshotPerLp[];
}

export interface BookSnapshotStrike {
  /** Signed k = K/S − 1, the stable key: rungs are quoted in offset space and are
   *  invariant under mark drift (OB_LOGIC §9.1). `strike` is its live translation. */
  k: number;
  strike: number;
  wing: string;
  bidQty: number;
  askQty: number;
  rungs: BookSnapshotRung[];
}

/** Whole book, optionally filtered by ?wing=&strike= (§7.2 contract 4). */
export interface BookSnapshot {
  oracle_price: number;
  strikes: BookSnapshotStrike[];
}

/* ── 5. LP lifecycle: /earn/positions* (B.4) ── */

/** LP state inside the existing UserEarn-shaped envelope (§7.2 contract 5). */
export interface MyLpState {
  deployed: boolean;
  lpId: string;
  params: LpParams;
  dials?: LpDials;
  deployedAt: string;
  notionalBtc: number;
  utilizationPct: number;
  /** Names UtilizationPct's denominator — "cap" (exposure cap) or "capacity" (Nᵢ);
   *  "" (or absent, from an old cached response) when there is no reading. Additive
   *  field, backend commit bfbca38 — always guard with `?? ""`. */
  utilizationBasis?: string;
  /** Δ-weighted exposure: signed Σ Δ(kᵢ)·qᵢ at crystallised k, coin-delta (the
   *  exposure law's reading). Absent on an old cached response — render "—", never
   *  guessed (same precedent as utilizationBasis). Additive field. */
  exposureCoin?: number;
  /** Present iff an exposure cap is set on this curve; denominator for the
   *  cap-relative reading and its warn/at-cap thresholds. Additive field. */
  exposureCapCoin?: number;
  /** THE 10× LP LEVERAGE CAP (CLAUDE.md "LP leverage cap — 10× maintenance",
   *  backend commit f8c3375): leverage = Nᵢ·S / equity(deposit + inventory
   *  mark-to-book), a MAINTENANCE level — equity marks live, so a static
   *  curve can breach from losses alone with no action on this curve. READ
   *  leverageBreached FOR THE PREDICATE, NEVER THE NUMBER: an uncollateralised
   *  program (equity ≤ 0) is JSON-sanitized to leverage 0.0 while
   *  leverageBreached stays true. All four additive — absent on an old cached
   *  response (same idiom as utilizationBasis/exposureCoin), never guessed. */
  leverage?: number;
  leverageCap?: number;
  leverageBreached?: boolean;
  /** Verbatim engine/lock text while breached (e.g. a partial forced sweep
   *  left the program open); "" / absent when not breached. */
  leverageBreachReason?: string;
  /** THE TOUCH HALF-SPREAD (task #34 item 3, audit finding): δ_eff·Spread/2 ×
   *  1e4 at the curve's own LEANED κ (amm/lp.TouchHalfSpread) — what this
   *  curve is actually QUOTING right now, not the κ=0 dial reconstruction a
   *  reader with only params+dials can build. Well-funded curves read ~25 bps;
   *  a thin, hard-leaned curve can diverge tens of percent (min-rung widening,
   *  OB_LOGIC §2.3a). Absent = the engine doesn't hold this LP (in-memory
   *  state, so a restart before re-seed lands here); 0 is a real reading, the
   *  curve quoting at its own mid — never treat absent and 0 as the same. */
  touchHalfSpreadBps?: number;
}

/* ── 6. exposure: GET /earn/exposure/{wallet_address} (B.5) ── */

export interface ExposureFill {
  ts: string;
  qty: number;
  price: number;
  feeEarnedUsd: number;
}

export interface ExposureHedgeLeg {
  instrument: string;
  qty: number;
  ts: string;
  pnlUsd: number;
}

export interface ExposureEntry {
  strike: number;
  wing: string;
  netQty: number;
  entryValueUsd: number;
  markToBookUsd: number;
  unrealizedPnlUsd: number;
  realizedPnlUsd: number;
  feesEarnedUsd: number;
  hedgePnlUsd: number;
  hedgeStatus: "hedged" | "partial" | "unhedged";
  hedgeRatio?: number;
  fills?: ExposureFill[];
  hedgeLegs?: ExposureHedgeLeg[];
}

/** Footer P/L TOTAL row: totalPnlUsd = fees + inventory MTB + hedging (§4.6). */
export interface ExposureTotals {
  netQty: number;
  entryValueUsd: number;
  markToBookUsd: number;
  unrealizedPnlUsd: number;
  realizedPnlUsd: number;
  feesEarnedUsd: number;
  hedgePnlUsd: number;
  totalPnlUsd: number;
}

export interface ExposureResponse {
  entries: ExposureEntry[];
  totals: ExposureTotals;
}

/* ── paper wallet: GET /api/paper/balance (§13.4) ── */

export interface PaperBalance {
  wallet_address: string;
  balance_usd: number;
  equity_usd: number;
}

/* ── 7. close-accrued: POST /earn/positions/{earn_id}/close-accrued
 *  (task #36b) — closes only the positions this curve has ACCRUED from
 *  trader fills; the curve itself stays deployed and quoting. Keyed by the
 *  earn position's own id, which IS the LP curve's id (one wallet runs one
 *  curve) — the non-destructive sibling of CloseUserPosition's `/close`. ── */

/** One position the close actually executed against the book. `valueBasis`
 *  is "bid" | "ask" ONLY here (never "model") — these are real fills, not
 *  quotes; the model-value fallback only ever appears on the pre-confirm
 *  estimate's LpBandWireRow, whose `closable` field — not valueBasis — says
 *  whether the sweep can execute it (audit B1, commit 3daaeab: computed
 *  backend-side with the sweep's own-rungs exclusion). */
export interface ClosedAccruedRow {
  id: string;
  wing: string;
  kbps: number;
  strikeUSD: number;
  qtyCoin: number;
  exitPriceCoin: number;
  valueBasis: "bid" | "ask";
  proceedsUSD: number;
}

/** One position that could not close — named, never silently dropped. */
export interface SkippedAccruedRow {
  id: string;
  reason: string;
}

export interface CloseAccruedResponse {
  closed: ClosedAccruedRow[];
  skipped: SkippedAccruedRow[];
  totalProceedsUSD: number;
  /** True iff this curve's net inventory is now flat across every strike. */
  flat: boolean;
  /** True iff closing flat-ed the inventory enough to snap the displacement κ
   *  to zero (audited ruling: the rest tilt κ₀ + κ_base is composed by Lean's
   *  other terms — the snap target is 0, never κ_base). */
  kappaSnapped: boolean;
}

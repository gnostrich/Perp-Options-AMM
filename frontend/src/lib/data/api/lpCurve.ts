/**
 * LP curve lifecycle: update + state (v2 §7.2 contract 5).
 *
 * Deploy and withdraw reuse the existing /earn/positions surface as-is:
 * deploy = createEarnPosition (transactions.ts, now carrying optional
 * params/dials); withdraw = closeEarnPosition (transactions.ts, unchanged
 * POST /earn/positions/{earn_id}/close). Only update (PUT) and state (GET,
 * typed to MyLpState) are net-new here.
 *
 * NOTE: server-side only (server actions).
 */

import { apiGet, apiPost, apiPut, ApiError } from "./client";
import type { LpParams, LpDials, MyLpState, CloseAccruedResponse } from "./contracts";
import { fetchPortfolioTransactions } from "./portfolio";
import { type LpBandWireRow } from "./portfolioTransforms";

export interface LpUpdateRequest {
  params: LpParams;
  dials?: LpDials;
}

/**
 * The two envelopes carry `lp_state` in DIFFERENT places, and neither is
 * `data.lp_state` — reading that was why fetchMyLpState always resolved null
 * and the LP console could never detect an already-deployed curve (v2 repair
 * D8). PUT returns it at the top level alongside `data` (the UserEarn); GET
 * returns one entry per position in `earn_positions`, each with its own
 * `lp_state`. Shapes below mirror earn/handlers/earn_handlers.go verbatim.
 */
interface LpUpdateEnvelope {
  success?: boolean;
  lp_state?: MyLpState | null;
}

/** One `earn_positions` row: models.UserEarn flattened, plus its LP curve. */
interface EarnPositionRow {
  id?: string;
  status?: string;
  created_at?: string;
  lp_margin_dollar?: number;
  pool_notional_deposit_dollar?: number;
  initial_lp_leverage?: number;
  current_lp_leverage?: number;
  lp_state?: MyLpState | null;
}

interface EarnPositionsEnvelope {
  success?: boolean;
  earn_positions?: EarnPositionRow[] | null;
}

/** A wallet's LP position as the portfolio money view needs it. Margin/notional come
 *  from the UserEarn columns, NOT lp_state.notionalBtc — the backend fills that field
 *  with the rung count (see report), so it is not a BTC amount. */
export interface LpPosition {
  id: string;
  status: string;
  createdAt: string;
  marginUsd: number;
  notionalUsd: number;
  leverage: number;
  lpState: MyLpState | null;
}

export interface LpUpdateResponse {
  success: boolean;
  data: MyLpState | null;
}

/** PUT /earn/positions/{wallet_address} — requote effective, returns updated state. */
export async function updateLpCurve(
  walletAddress: string,
  req: LpUpdateRequest
): Promise<LpUpdateResponse> {
  const res = await apiPut<LpUpdateEnvelope>(`/earn/positions/${walletAddress}`, req);
  return { success: res.success ?? true, data: res.lp_state ?? null };
}

/** GET /earn/positions/{wallet_address} — every position the wallet ever opened,
 *  closed ones included (the portfolio money view lists them all). */
export async function fetchLpPositions(walletAddress: string): Promise<LpPosition[]> {
  try {
    const res = await apiGet<EarnPositionsEnvelope>(`/earn/positions/${walletAddress}`);
    return (res.earn_positions ?? []).map((p) => ({
      id: p.id ?? "",
      status: p.status ?? "",
      createdAt: p.created_at ?? "",
      marginUsd: p.lp_margin_dollar ?? 0,
      notionalUsd: p.pool_notional_deposit_dollar ?? 0,
      leverage: p.current_lp_leverage || p.initial_lp_leverage || 1,
      lpState: p.lp_state ?? null,
    }));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return [];
    throw e;
  }
}

/** Pre-confirm estimate for "close accrued positions" (task #36b) — reuses the
 *  BANDS LP-rows wire VERBATIM (settlements/users/{wallet}/transactions'
 *  `lp_positions`, engine.LPPosition — same rows the Portfolio → BANDS table
 *  already renders): the estimate IS that data, no separate preview endpoint.
 *  Scoped to this curve's own rows via its ID prefix ("lp:<lpId>:...", the
 *  engine's own row key). Each row's `closable` is the sweep's own predicate,
 *  computed backend-side with MatchExit's own-rungs exclusion (audit B1) —
 *  never inferred here from valueBasis, which prices off the aggregate book
 *  including the LP's own depth and so cannot answer closability. */
export async function fetchCloseAccruedEstimate(
  walletAddress: string,
  lpId: string
): Promise<LpBandWireRow[]> {
  const raw = await fetchPortfolioTransactions(walletAddress);
  const prefix = `lp:${lpId}:`;
  return (raw.lp_positions ?? []).filter((r) => r.id.startsWith(prefix));
}

/** POST /earn/positions/{earn_id}/close-accrued — executes the close against
 *  the aggregate book at each position's exit side (sell hits the bid, buy
 *  hits the ask); the curve stays deployed and quoting. Keyed by the earn
 *  position's own id, which IS the LP curve's id (earn/handlers/earn_handlers.go's
 *  `NewLPCurve(userEarn.ID, ...)` — one wallet runs one curve, §11.2) — the
 *  same `lpId` MyLpState already carries, not the wallet address. */
export async function closeAccruedPositions(lpId: string): Promise<CloseAccruedResponse> {
  return apiPost<CloseAccruedResponse>(`/earn/positions/${lpId}/close-accrued`, {});
}


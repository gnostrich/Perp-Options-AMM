/**
 * v3 read-only book snapshot API (amm/v3engine, GET /api/v3/book).
 *
 * NOTE: server-side only (server actions) — same idiom as book.ts.
 */

import { apiGet } from "./client";
import type { V3Book } from "./v3contracts";

/** The whole v3 book: one aggregate level per posted OTM strike. GET-only
 *  (no wing/strike scoping — the endpoint always returns the full grid, 60
 *  strikes at the fixed ±60%/1% grid, k=0 excluded). */
export async function fetchV3Book(): Promise<V3Book> {
  return apiGet<V3Book>("/api/v3/book");
}

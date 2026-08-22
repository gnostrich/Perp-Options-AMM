/**
 * Aggregate order-book snapshot API (v2 §7.2 contract 4).
 *
 * NOTE: server-side only (server actions).
 */

import { apiGet } from "./client";
import type { BookSnapshot } from "./contracts";

/**
 * Whole book, optionally scoped to one (wing,strike) band.
 */
export async function fetchBookSnapshot(
  wing?: string,
  strike?: number
): Promise<BookSnapshot> {
  const params = new URLSearchParams();
  if (wing) params.set("wing", wing);
  if (strike != null) params.set("strike", String(strike));
  const qs = params.toString();
  return apiGet<BookSnapshot>(`/api/book/snapshot${qs ? `?${qs}` : ""}`);
}

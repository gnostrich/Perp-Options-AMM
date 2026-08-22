"use server";

import { fetchBookSnapshot as fetchBookSnapshotFromDAL } from "@/lib/data/api/book";
import type { BookSnapshot } from "@/lib/data/api/contracts";

/**
 * Server action for the order-book inspector snapshot.
 * Returns null on failure so the caller can keep showing the last snapshot.
 */
export async function fetchBookSnapshotAction(
  wing?: string,
  strike?: number
): Promise<BookSnapshot | null> {
  try {
    return await fetchBookSnapshotFromDAL(wing, strike);
  } catch (e) {
    console.error("fetchBookSnapshotAction error:", e);
    return null;
  }
}

"use server";

import { fetchV3Book as fetchV3BookFromDAL } from "@/lib/data/api/v3book";
import type { V3Book } from "@/lib/data/api/v3contracts";

/**
 * Server action for the v3 read-only book (additive, flag-gated — see
 * bookStore's `dataSource`). Mirrors fetchBookSnapshotAction.ts exactly:
 * returns null on failure (404 when V3_BOOK_ENABLED is off backend-side, or
 * any other fetch error) so the caller keeps showing the last snapshot /
 * falls into the existing empty state instead of an error spew.
 */
export async function fetchV3BookAction(): Promise<V3Book | null> {
  try {
    return await fetchV3BookFromDAL();
  } catch (e) {
    console.error("fetchV3BookAction error:", e);
    return null;
  }
}

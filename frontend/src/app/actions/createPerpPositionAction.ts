"use server";

import {
  createPerpPosition as createPerpPositionFromDAL,
  type PerpPositionEntry,
} from "@/lib/data/api/transactions";

export async function createPerpPositionAction(
  perpPosition: Omit<PerpPositionEntry, "id" | "created_at" | "signature">
): Promise<PerpPositionEntry> {
  return createPerpPositionFromDAL(perpPosition);
}


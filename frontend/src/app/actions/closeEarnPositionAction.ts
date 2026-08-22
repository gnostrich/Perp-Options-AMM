"use server";

import { closeEarnPosition as closeEarnPositionFromDAL } from "@/lib/data/api/transactions";

export async function closeEarnPositionAction(
  earnId: string
): Promise<{ ok: boolean; response: unknown }> {
  return closeEarnPositionFromDAL(earnId);
}


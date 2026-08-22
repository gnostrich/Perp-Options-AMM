"use server";

import { closePerpPosition as closePerpPositionFromDAL } from "@/lib/data/api/transactions";

export async function closePerpPositionAction(
  perpId: string
): Promise<{ ok: boolean; response: unknown }> {
  return closePerpPositionFromDAL(perpId);
}


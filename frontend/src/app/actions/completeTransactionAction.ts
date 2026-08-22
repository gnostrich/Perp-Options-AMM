"use server";

import { completeTransaction as completeTransactionFromDAL } from "@/lib/data/api/transactions";

export async function completeTransactionAction(
  transactionId: number | string
): Promise<{ ok: boolean; response: unknown }> {
  return completeTransactionFromDAL(transactionId);
}


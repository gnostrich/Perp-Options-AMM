"use server";

import {
  sendSellTransaction as sendSellTransactionFromDAL,
  type TransactionPayload,
  type TransactionResponse,
} from "@/lib/data/api/transactions";
import { ApiError } from "@/lib/data/api/client";

/** Backend error bodies are `{"error": "..."}` (routes/handlers.go TransactHandler); unwrap to the bare reason. */
function reasonFrom(err: unknown): string {
  if (err instanceof ApiError) {
    try {
      const parsed = JSON.parse(err.message);
      if (parsed && typeof parsed.error === "string") return parsed.error;
    } catch {
      // Not JSON — fall through to the raw text below.
    }
    if (err.message) return err.message;
  }
  return err instanceof Error ? err.message : "Quote failed.";
}

/**
 * Catches DAL errors here (rather than letting them throw across the Server Action
 * boundary) so a dry-run rejection reason — e.g. insufficient book depth — reaches
 * the client verbatim instead of Next.js's redacted production error digest.
 */
export async function sendSellTransactionAction(
  payload: TransactionPayload
): Promise<TransactionResponse> {
  try {
    return await sendSellTransactionFromDAL(payload);
  } catch (err) {
    console.error("sendSellTransactionAction error:", err);
    return { success: false, message: reasonFrom(err) };
  }
}


"use server";

import {
  broadcastHLTransfer,
  type HLTransferRequest,
  type HLTransferResponse,
} from "@/lib/data/api/hyperliquid";
import { isPaperMode } from "@/lib/execMode";

export async function broadcastHLTransferAction(
  req: HLTransferRequest
): Promise<HLTransferResponse> {
  // Paper mode (v2 item P4, §13.6): guard as a no-op server-side too, in case
  // this ever gets a live caller (currently none — see useHLTransfer.ts).
  if (isPaperMode()) {
    return { success: false, error: "HL transfer disabled in paper mode" };
  }
  return broadcastHLTransfer(req);
}

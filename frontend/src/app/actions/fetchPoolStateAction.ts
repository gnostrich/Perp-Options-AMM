"use server";

import {
  fetchPoolState as fetchPoolStateFromDAL,
  type PoolStateData,
} from "@/lib/data/api/portfolio";

export interface PoolStateActionResponse {
  success: boolean;
  data?: PoolStateData;
  error?: string;
}

export async function fetchPoolStateAction(): Promise<PoolStateActionResponse> {
  try {
    const response = await fetchPoolStateFromDAL();
    if (response.success) {
      return { success: true, data: response.data };
    }
    return { success: false, error: "Pool state fetch returned failure" };
  } catch (err) {
    console.error("fetchPoolStateAction error:", err);
    return { success: false, error: "Failed to fetch pool state" };
  }
}

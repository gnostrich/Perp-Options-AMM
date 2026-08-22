"use server";

import { checkBackendHealth as checkBackendHealthFromDAL } from "@/lib/data/api/health";

/**
 * Server action to check backend health
 * This should be called from client components instead of calling checkBackendHealth directly
 */
export async function checkBackendHealthAction(): Promise<boolean> {
  return checkBackendHealthFromDAL();
}


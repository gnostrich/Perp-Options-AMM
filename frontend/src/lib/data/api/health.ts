/**
 * Health Check API
 * Handles backend health checks
 */

import { apiFetch } from "./client";

/**
 * Checks if the backend is healthy
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await apiFetch("/health", {
      next: { revalidate: 0 },
      cache: "no-store",
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { status?: string };
    return data?.status === "healthy";
  } catch {
    return false;
  }
}


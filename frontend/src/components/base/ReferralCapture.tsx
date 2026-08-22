"use client";

import { useEffect } from "react";

/**
 * Captures the `?ref=` query parameter from the URL and stores it in
 * localStorage so it persists until the user connects their wallet.
 *
 * Renders nothing — mount once in the root layout.
 */
export default function ReferralCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");

      if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
        localStorage.setItem("temporal_referrer", ref);

        // Clean the URL so the ref param isn't visible / shareable by accident
        params.delete("ref");
        const cleanUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "") +
          window.location.hash;
        window.history.replaceState({}, "", cleanUrl);
      }
    } catch {
      // localStorage or URL API unavailable — silently ignore
    }
  }, []);

  return null;
}

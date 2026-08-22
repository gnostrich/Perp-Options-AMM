/**
 * Incentives API — referral registration and incentive summary
 *
 * Server-side only. Client components should call the corresponding server
 * actions in src/app/actions/ instead.
 */

import { apiGet, apiFetch } from "./client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RegisterReferralRequest {
  referrer_wallet: string;
  referred_wallet: string;
}

export interface RegisterReferralResponse {
  success: true;
  message: string;
  data: {
    referred_wallet: string;
    referrer_wallet: string;
  };
}

export interface RegisterReferralResult {
  success: boolean;
  alreadyReferred: boolean;
  message?: string;
  errorStatus?: number;
}

export interface IncentiveSummaryData {
  accrued_dollar: number;
  claimable_dollar: number;
  claimed_dollar: number;
  last_accrual_date: string;
  last_accrual_day_utc: string;
  reserved_dollar: number;
  wallet_address: string;
}

export interface IncentiveSummaryResponse {
  success: boolean;
  message: string;
  data: IncentiveSummaryData;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Register a referral edge (referrer → referred).
 * Returns a result object instead of throwing on 409 so the caller can
 * distinguish "already referred" from real errors.
 */
export async function registerReferral(
  req: RegisterReferralRequest
): Promise<RegisterReferralResult> {
  try {
    const res = await apiFetch("/earn/incentives/referrals/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (res.ok) {
      return { success: true, alreadyReferred: false };
    }

    if (res.status === 409) {
      const body = await res.text();
      return { success: false, alreadyReferred: true, message: body };
    }

    // All other non-2xx responses (400, 500, …) — return a failure result
    // instead of throwing so the server action never crashes the page render.
    const body = await res.text().catch(() => "");
    console.error(
      `[registerReferral] ${res.status} ${res.statusText}:`,
      body
    );
    return {
      success: false,
      alreadyReferred: false,
      errorStatus: res.status,
      message: body || res.statusText,
    };
  } catch (err) {
    // Network-level failure
    console.error("[registerReferral] Network error:", err);
    return { success: false, alreadyReferred: false, message: String(err) };
  }
}

/**
 * Fetch the incentive summary for a wallet address.
 */
export async function fetchIncentivesSummary(
  walletAddress: string
): Promise<IncentiveSummaryResponse> {
  return apiGet<IncentiveSummaryResponse>(
    `/earn/incentives/${walletAddress}/summary`
  );
}

"use server";

import {
  registerReferral,
  type RegisterReferralResult,
} from "@/lib/data/api/incentives";

export async function registerReferralAction(
  referrer: string,
  referred: string
): Promise<RegisterReferralResult> {
  return registerReferral({ referrer_wallet: referrer, referred_wallet: referred });
}

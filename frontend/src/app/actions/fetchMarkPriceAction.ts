"use server";

import { fetchMarkPrice as fetchMarkPriceFromDAL } from "@/lib/data/api/prices";

export async function fetchMarkPriceAction(): Promise<number> {
  return fetchMarkPriceFromDAL();
}


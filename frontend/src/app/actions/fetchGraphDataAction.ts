"use server";

import { fetchGraphData as fetchGraphDataFromDAL } from "@/lib/data/api/prices";
import type { ProcessedGraphData } from "@/lib/data/api/prices";

export async function fetchGraphDataAction(): Promise<ProcessedGraphData[]> {
  return fetchGraphDataFromDAL();
}


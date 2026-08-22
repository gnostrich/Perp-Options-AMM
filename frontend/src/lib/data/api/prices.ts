/**
 * Price Data API
 * Handles fetching price-related data from the backend
 */

import { apiGet, apiPost } from "./client";

export interface OracleResponse {
  message: string;
  oracle_price: number;
}

export interface CurveNode {
  strike: number; // signed % offset from the mark
  call: number;
  put: number;
}

interface GraphDataResponse {
  long_tree: {
    nodes: Array<{ strike: number; pt_asset: number }>;
  };
  short_tree: {
    nodes: Array<{ strike: number; pt_asset: number }>;
  };
  curve?: CurveNode[];
}

// price = % offset from the mark; the two series are the full CALL and PUT
// price lines (they cross at the mark).
export interface ProcessedGraphData {
  price: number;
  equityWithoutInsurance: number; // CALL line
  equityWithInsurance: number; // PUT line
}

/**
 * Fetches the current mark price from the oracle
 */
export async function fetchMarkPrice(): Promise<number> {
  const response = await apiGet<OracleResponse>("/api/oracle/price");
  return response.oracle_price;
}

/**
 * Updates the mark price on the backend
 */
export async function updateMarkPrice(price: number): Promise<OracleResponse> {
  return apiPost<OracleResponse>("/api/oracle/price", { price });
}

/**
 * Fetches graph data for the AMM (raw)
 */
export async function fetchGraphDataRaw(): Promise<GraphDataResponse> {
  return apiGet<GraphDataResponse>("/api/amm/graph");
}

/**
 * Fetches and processes graph data for the AMM
 */
export async function fetchGraphData(): Promise<ProcessedGraphData[]> {
  const data = await fetchGraphDataRaw();

  // Preferred: the full call/put curve (both lines, crossing at the mark).
  if (data.curve && data.curve.length > 0) {
    return data.curve.map((node) => ({
      price: node.strike,
      equityWithoutInsurance: node.call,
      equityWithInsurance: node.put,
    }));
  }

  const longTreeNodes = data.long_tree.nodes;
  const shortTreeNodes = data.short_tree.nodes;

  // Process long tree (right side from center)
  const longTreeData = longTreeNodes.map(
    (node: { strike: number; pt_asset: number }) => ({
      price: node.strike, // e.g., 0, 1, 2, ...
      equityWithoutInsurance: node.pt_asset,
      equityWithInsurance: 0,
    })
  );

  // Process short tree (left side from center)
  const shortTreeData = shortTreeNodes
    .filter((node: { strike: number }) => node.strike !== 0)
    .map((node: { strike: number; pt_asset: number }) => ({
      price: -node.strike,
      equityWithoutInsurance: node.pt_asset,
      equityWithInsurance: 0,
    }));

  // Combine: short to the left (sorted from lowest to highest), then long
  const combinedData = [...shortTreeData.reverse(), ...longTreeData];
  return combinedData;
}


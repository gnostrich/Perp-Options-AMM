/**
 * v3 read-only book contracts — GET /api/v3/book, GET /api/v3/book/quote
 * (amm/v3engine/handler.go, quote.go). Additive, mirrors the v2 contracts.ts
 * idiom: one authoritative shape per wire response, field names verbatim
 * from the Go JSON tags (confirmed by curling the live endpoint).
 *
 * v3's book is ONE public aggregate level per strike (CLAUDE.md "the
 * continuation mechanism" — "THE MARKET IS ONE LEVEL"), not a ladder of
 * discrete resting rungs like v2's BookSnapshot: there is no per-price qty,
 * no per-LP breakdown on this endpoint, and NO SIZE CAP (MAP_FORMAL
 * `depth_unbounded`) — a v3 quote is a continuous closed-form walk, not a
 * lookup into posted depth.
 */

/** Engine globals the book was assembled with (v3map.Globals). */
export interface V3Globals {
  S: number;
  SbarBase: number;
  A: number;
  GammaBurr: number;
  Norm: number;
  Pickoff: number;
}

/** One LP's fitted-book quote params (v3basis quote inputs) — not identified
 *  by lpId on this read-only endpoint, only its slope/hollow. */
export interface V3QuoteParams {
  Slope: number;
  Half: number;
}

/** One posted strike's aggregate level. OTM only (put k<0, call k>0); the
 *  crossover k=0 is never posted (v3map.Posted). `call`/`put` carry both
 *  wing prices at this k (parity), `mid` is the OTM wing actually quoted
 *  here (v3basis.LevelOf) — same value as whichever of call/put is OTM.
 *  `half` = the tightest LP's hollow transported to |deltaAgg| (v3basis.HalfAggAt).
 *  `depth` = β_agg, the aggregate walk's SLOPE (v3basis.DepthAt) — a
 *  price-impact rate (coin per coin²), NOT a resting quantity; it has no v2
 *  ladder-qty analogue (v3engine/quote.go's Quote.Depth doc). `deltaAgg` =
 *  the one market delta at this k (v3perpbook.DeltaAgg). */
export interface V3Strike {
  k: number;
  call: number;
  put: number;
  mid: number;
  bid: number;
  ask: number;
  half: number;
  depth: number;
  deltaAgg: number;
}

/** GET /api/v3/book. */
export interface V3Book {
  globals: V3Globals;
  quotes: V3QuoteParams[];
  weights: number[];
  strikes: V3Strike[];
}

/** GET /api/v3/book/quote?k=&size=&side=buy|sell (v3engine/quote.go Quote). */
export interface V3LPFill {
  index: number;
  qty: number;
  notional: number;
}

export interface V3Quote {
  k: number;
  size: number;
  side: "buy" | "sell";
  mid: number;
  half: number;
  depth: number;
  deltaAgg: number;
  price: number;
  marginal: number;
  cost: number;
  fills: V3LPFill[];
}

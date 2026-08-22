/**
 * Client-side Burr-2 pricer — a cell-for-cell port of
 * perp-backend-staging/amm/burr2/burr2.go (Derive/CallWing/PutWing/LegPrice)
 * + incbeta.go (RegIncBeta), plus amm/lp/discretise.go's Requote and
 * amm/lp/lean.go's Lean, simplified for a slider-driven client preview with
 * no modeled trade history. Powers the YOUR BOOK ghost-proforma playground
 * (BookProjectionView.tsx) — a preview computed here, never round-tripped to
 * the backend. Sheet/Go cell refs are cited alongside each function; do NOT
 * reuse lgamma's Lanczos approximation for anything golden-tested (~1e-10,
 * plenty for a visual preview, not the backend's math.Lgamma).
 */

export const K_FLOOR = 1e-9; // burr2.go KFloor
export const KAPPA_CLAMP = 0.95; // burr2.go KappaClamp — final safety bound only, never a target
// autopilot/config.go KappaMaxDefault — ratified arming decision 1: half-tilt at full
// exposure (DISTRIBUTION_AUTOPILOT.md lean law, "κ_max = 0.5"). This IS the lean law's
// lerp target; KAPPA_CLAMP above is the domain bound the result still gets clamped to,
// not the target itself (bug found 2026-07-30: the ghost was lerping toward 0.95,
// measured 6.63× too much tilt on the call mid at f=1).
export const KAPPA_MAX = 0.5;
// amm/lp/kgrid.go: KStepBps=100 (1% steps), KSpanBps=6000 (±60%), k=0 excluded.
export const K_STEP = 0.01, K_SPAN_STEPS = 60;
// amm/lp/discretise.go Requote: Peak=1 ⇒ Δq=δ·P/β; Spread=1 (no dial UI exposes
// either). DELTA is the LP's BUDGET δ (RungBudget floor, else defaultDelta) — the
// derived min-rung rule (effDelta below, §2.3a) widens it upward per curve, so M
// is no longer pinned at MAX_RUNGS for every dial combo, only at DELTA itself
// (1/DELTA−Spread/2 = 199.5 > 60).
export const DELTA = 0.005, SPREAD = 1, MAX_RUNGS = 60, MOQ_COIN = 1.5e-4;
// amm/lp/discretise.go's min-rung rule (§2.3a): SAFETY is hl-ob-mm's mSafe =
// hlMinUSD·2, TRANSPORTED not derived (FORMAL_CORE §ii: CITED-BUT-INAPPLICABLE,
// carried over the bridge_resting_is_option correspondence anyway — see the Go
// comment at the constant). LOT_NUDGE steps the solve a hair inside the coin-lot
// boundary it targets (exactly ON it, roundCoin's direction is decided by the
// last ulp of the evaluation order, which differs between the solve and the
// emit loop). COIN_LOT/roundCoin mirror discretise.go's coinLot 5dp quantum.
// TWO CALLERS, AND THE SECOND IS A FIDELITY FIX (mirror gate, task #45): the
// min-rung solve rounds because the backend's does, AND ghostRungs' dust filter
// now tests the ROUNDED product, because the backend filters on the rung it
// actually posts. The ghost's emitted price/qty stay unrounded — that is the
// preview's own, declared, sub-half-lot difference from the book — but WHETHER a
// rung exists is no longer allowed to differ: it did, at 5 rungs of the gate's
// grid, where q·p straddled MOQ_COIN on one side of the rounding and not the other.
export const SAFETY = 2.0, LOT_NUDGE = 1e-9, COIN_LOT = 1e5;
export const roundCoin = (x: number): number => Math.round(x * COIN_LOT) / COIN_LOT;

/** Lanczos g=7,n=9 lgamma — visual-preview accuracy only. */
export function lgamma(x: number): number {
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  x -= 1;
  let a = p[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += p[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function betacf(x: number, a: number, b: number): number {
  const maxIter = 300, eps = 3e-16, fpmin = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < fpmin) d = fpmin;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= maxIter; m++) {
    const fm = m, m2 = 2 * fm;
    let aa = (fm * (b - fm) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c; if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d; h *= d * c;
    aa = (-(a + fm) * (qab + fm) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c; if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

/** RegIncBeta port (incbeta.go), continued-fraction form. */
export function regIncBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log1p(-x));
  if (x < (a + 1) / (a + b + 2)) return (front * betacf(x, a, b)) / a;
  return 1 - (front * betacf(1 - x, b, a)) / b;
}

export type Burr2Params = { A: number; Gamma: number; Sbar: number };
export type Burr2Derived = {
  B: number; SR: number; SL: number; G1: number; I1: number;
  WR: number; WL: number; QR: number; QL: number; ATM: number;
};

/** Derive == burr2.go Derive (B13–B23). */
export function derive(p: Burr2Params, kappa: number): Burr2Derived {
  const a = p.A, g = p.Gamma;
  const b = Math.exp(lgamma(1 / a) + lgamma(g / a) - lgamma(1 / a + g / a)); // (B13)
  const sR = p.Sbar * (1 + kappa), sL = p.Sbar * (1 - kappa); // (B15/B16)
  const g1 = Math.pow(1 + Math.pow(1 / sL, a), -(g + 1) / a); // (B17)
  const i1 = (sL / a) * b * (1 - regIncBeta(1 / (1 + Math.pow(sL, a)), 1 / a, g / a)); // (B18)
  const wR = (sR * b) / a; // (B19)
  const wL = (sL * b / a - i1 - g1) / (1 - g1); // (B20)
  const qR = wL / (wR + wL), qL = 1 - qR; // (B21/B22)
  const atm = qR * (sR / a) * b; // (B23)
  return { B: b, SR: sR, SL: sL, G1: g1, I1: i1, WR: wR, WL: wL, QR: qR, QL: qL, ATM: atm };
}

/** CallWing == burr2.go CallWing, A_R(|k|) (B46). */
export function callWing(p: Burr2Params, d: Burr2Derived, absK: number): number {
  if (absK < K_FLOOR) absK = K_FLOOR;
  const u = 1 / (1 + Math.pow(d.SR / absK, p.A)); // (B44)
  return d.QR * (d.SR / p.A) * d.B * (1 - regIncBeta(u, 1 / p.A, p.Gamma / p.A));
}

/** PutWing == burr2.go PutWing, A_L(|k|) (B47). */
export function putWing(p: Burr2Params, d: Burr2Derived, absK: number): number {
  if (absK >= 1) return 0;
  if (absK < K_FLOOR) absK = K_FLOOR;
  const v = 1 / (1 + Math.pow(d.SL / absK, p.A)); // (B45)
  return (
    (d.QL / (1 - d.G1)) *
    ((d.SL / p.A) * d.B * (1 - regIncBeta(v, 1 / p.A, p.Gamma / p.A)) - d.I1 - d.G1 * (1 - absK))
  );
}

/** The playground's 5 additive dials — neutral 0 (× neutral 1), matching
 *  UNITS_AND_SEMANTICS.md's exact label vocabulary. */
export type GhostDials = { ell: number; kappa0: number; wing: number; capacity: number; finv: number };
export const NEUTRAL_DIALS: GhostDials = { ell: 0, kappa0: 0, wing: 0, capacity: 1, finv: 0 };

export function dialsAreNeutral(d: GhostDials): boolean {
  return (
    Math.abs(d.ell) < 1e-9 &&
    Math.abs(d.kappa0) < 1e-9 &&
    Math.abs(d.wing) < 1e-9 &&
    Math.abs(d.capacity - 1) < 1e-9 &&
    Math.abs(d.finv) < 1e-9
  );
}

export type GhostShape = {
  params: Burr2Params;
  d: Burr2Derived;
  kappaEff: number;
  beta: number;
  suspended: boolean;
  loadedSide: "bid" | "ask";
};

/** The curve params a deposit actually deploys — EarnComponent's CURVE
 *  PARAMETERS panel (lpCurveStore's `params`, LpParams minus `fee`: the ghost
 *  prices pre-fee). The ghost's BASE shape, before any dial offset. */
export type Burr2BaseParams = { Sbar: number; A: number; Gamma: number; Lambda: number; N: number };

/** amm/lp/lean.go Lean(), simplified for a mock with no fill history (no
 *  separate κ_base/κ fields — the mock's fill-state κ is always 0, so the
 *  lerp's OWN κ term drops out entirely, leaving f·target): effective κ is
 *  κ₀ PLUS the inventory lerp toward ±KAPPA_MAX (the ratified lean-law
 *  target, autopilot/config.go KappaMaxDefault — NOT the domain clamp),
 *  weighted by the inventory dial f — sign ties the "loaded" side to the
 *  tilt (Bid when κ₀≥0, Ask when κ₀<0), matching production's loaded↔target
 *  pairing. THE COMPOSITION IS ADDITIVE IN κ₀ (audit 2026-07-29, backend
 *  amm/lp/lean.go:109 — `clampKappa(Kappa0 + KappaBase + Kappa + f*(target−Kappa))`,
 *  κ₀ lives OUTSIDE the lerp; f=0 must yield κ₀ exactly). The prior form —
 *  `kappa0 + f*(target−kappa0)` — fed the operator dial into the slot
 *  reserved for fill-state κ, so f DEFLATED the tilt toward the target
 *  instead of adding to it (verified wrong against 6 audit-measured points,
 *  up to 3.44× price error at k=0.10; f=0 makes it NOT reduce to κ₀ at all,
 *  the two forms agree only at κ₀=0 or f=0). f=1 (suspended) switches off
 *  the loaded SIDE across every strike and wing — a book-side cut, not a
 *  wing cut (caller applies this in ghostRungs). β = λ·ATM/(0.01·N) is
 *  strike-independent (amm/lp/discretise.go); λ and N come from `base`, so
 *  β/depth track whatever the panel currently holds, not a hardcoded N. */
export function shapeFromDials(dials: GhostDials, base: Burr2BaseParams): GhostShape & { N: number } {
  const Sbar = base.Sbar * (1 + dials.ell);
  const Gamma = base.Gamma * (1 + dials.wing);
  const N = base.N * dials.capacity;
  const sign = dials.kappa0 >= 0 ? 1 : -1;
  const loadedSide: "bid" | "ask" = sign > 0 ? "bid" : "ask";
  // Mirror gate finding (task #45): f is a fraction of the exposure CAP and
  // must saturate at 1 — DISTRIBUTION_AUTOPILOT's lean law is linear TO THE
  // CAP, f≥1 is the terminal case (amm/lp/lean.go's own `min(1, |exposure|/
  // cap)`), never beyond it. Unclamped, f=1.5 computed 0.75·sign here vs the
  // engine's 0.50·sign — unreachable via BookProjectionView.tsx's own slider
  // (min 0/max 1) but `shapeFromDials` is exported, so any other caller got
  // 1.5× the lawful tilt silently.
  const f = Math.min(1, dials.finv);
  let kappaEff = dials.kappa0 + sign * KAPPA_MAX * f;
  kappaEff = Math.max(-KAPPA_CLAMP, Math.min(KAPPA_CLAMP, kappaEff));
  const suspended = dials.finv >= 1 - 1e-9;
  const params: Burr2Params = { A: base.A, Gamma, Sbar };
  const d = derive(params, kappaEff);
  const beta = (base.Lambda * d.ATM) / (0.01 * N);
  return { params, N, d, kappaEff, beta, suspended, loadedSide };
}

/** Price at signed offset k, whichever wing k belongs to (k<0 put, k≥0 call —
 *  the caller's grid excludes k=0, but callWing(0) is well-defined too). */
export function wingPrice(shape: GhostShape, k: number): number {
  const absK = Math.abs(k);
  return k < 0 ? putWing(shape.params, shape.d, absK) : callWing(shape.params, shape.d, absK);
}

/** amm/lp/discretise.go effDelta, ported: the LP's budget δ (DELTA — no dial UI
 *  exposes RungBudget, so the floor is always DELTA here) widened UPWARD only as
 *  far as needed so the WORSE of the two nearest-wing touch rungs — call k=+1%,
 *  put k=-1% (K_STEP), m=0, on the BID (fans DOWN, so it carries the smaller of
 *  the two sides' notional) — clears SAFETY·MOQ_COIN. Computed ONCE per curve,
 *  never per strike: Peak is never dial-exposed either, so the Go rule's
 *  qPerDelta = (0.01·N/λ)·(p0/ATM)^peak reduces at peak=1 to p0/beta exactly
 *  (0.01·N/λ = ATM/beta), matching ghostRungs' own qty formula below. Never
 *  narrows — at any capacity where DELTA already clears both touches,
 *  effDelta(shape) === DELTA bit-identically, so the ladder stays byte-identical
 *  to a pre-rule one (mirrors the Go docstring's own claim).
 *
 *  Go's early-return guard (`!(d.ATM>0) || !(N>0) || !(Lambda>0)`) is restored
 *  here via `shape.beta`, the one field that already folds N/Lambda/ATM together
 *  (`beta = Lambda·ATM/(0.01·N)`): N≤0 makes it non-finite, Lambda≤0 makes it 0,
 *  so `!(beta>0) || !isFinite(beta)` is the exact composite of the three Go
 *  checks available on GhostShape. Without it, N=0 (no margin entered) sent
 *  qPerDelta→0 and the solve's division blew up to δ_eff=1.0 (the widest
 *  ceiling) instead of Go's bare `delta` — invisible today (0 rungs either way,
 *  β non-finite already gates the ghost's own empty-state message elsewhere)
 *  but the returned NUMBER was wrong and is now a value callers read directly
 *  (utils.ts's halfSpreadBps). */
export function effDelta(shape: GhostShape): number {
  let delta = DELTA;
  if (!(shape.d.ATM > 0) || !(shape.beta > 0) || !isFinite(shape.beta)) return delta;
  const widest = 1 / SPREAD, want = SAFETY * MOQ_COIN;
  const p0Call = wingPrice(shape, K_STEP), p0Put = wingPrice(shape, -K_STEP);
  // 64 mirrors discretise.go's bound (worst case measured 31 passes across the
  // capacity decades; the 8 this shipped with was not enough — Go moved first).
  for (let pass = 0; pass < 64 && delta < widest; pass++) {
    let need = delta;
    for (const p0 of [p0Call, p0Put]) {
      if (!(p0 > 0)) continue;
      const qPerDelta = p0 / shape.beta;
      const price = roundCoin(p0 * (1 - (delta * SPREAD) / 2)); // the BID touch, m=0
      if (!(qPerDelta > 0) || !(price > 0) || roundCoin(delta * qPerDelta) * price >= want) continue;
      // This rung must carry ⌈want/price⌉ coin lots of q; the least δ whose q
      // rounds onto that lot is (lots − ½)/(coinLot·qPerDelta) (discretise.go).
      const w = (Math.ceil((want / price) * COIN_LOT) - 0.5 + LOT_NUDGE) / (COIN_LOT * qPerDelta);
      if (w > need) need = w;
    }
    if (need <= delta) break;
    delta = Math.min(need, widest);
  }
  return delta;
}

// amm/lp/delta.go DeltaK: Δ(k) = P(k) − (1+k)·P′(k), central difference on LegPrice —
// the hedge-ratio reading (coin of perp per option), NOT new pricing math (a derivative
// OF the same wing functions above). Our grid is OTM-only (puts k<0, calls k>0, k=0
// excluded, |k|≥K_STEP=0.01 — see the k-grid constants) so LegPrice(w matching sign(k), k)
// reduces to wingPrice(shape, k) exactly: the backend's ITM-mirror branch never applies to
// any grid point, and the ±1e-6 central-difference step is far too small to cross k=0 from
// the nearest grid k (0.01). Verified directly against the backend (amm/lp/delta.go):
// Δ(+0.10)=0.516020 at κ=-0.0778408948634212/S̄0.6 (workbook band), 0.502370 at κ=0/S̄0.6 —
// this port matches both to 6dp.
const DELTA_H = 1e-6;
export function deltaK(shape: GhostShape, k: number): number {
  const slope = (wingPrice(shape, k + DELTA_H) - wingPrice(shape, k - DELTA_H)) / (2 * DELTA_H);
  return wingPrice(shape, k) - (1 + k) * slope;
}

export type GhostRung = { price: number; qty: number };

/** One strike's ghost ladder, one side: amm/lp/discretise.go Requote, Peak=1
 *  (uniform Δq per strike). Mirrors the blessed mock's rung loop verbatim. `delta`
 *  is the curve's EFFECTIVE δ (effDelta(shape) above, computed once per curve by
 *  the caller and passed to every strike/side) — M and the fan both recompute
 *  from it, exactly as Requote's M = ⌈1/δ_eff − Spread/2⌉ does. Defaults to the
 *  budget DELTA so an un-migrated call site still degrades to the pre-rule
 *  behavior rather than a runtime error. */
export function ghostRungs(p0: number, beta: number, side: "bid" | "ask", delta: number = DELTA): GhostRung[] {
  if (!(p0 > 0) || !isFinite(p0)) return [];
  const qty = (delta * p0) / beta;
  const M = Math.min(MAX_RUNGS, Math.ceil(1 / delta - SPREAD / 2));
  const fan = side === "bid" ? -delta : delta;
  const out: GhostRung[] = [];
  for (let r = 0; r < M; r++) {
    const price = p0 * (1 + fan * (r + SPREAD / 2));
    if (price <= 0) break; // monotonic toward/away from zero
    // On the ROUNDED product, exactly as discretise.go's emit loop filters: a
    // rung's existence is decided by the notional the book would actually post,
    // never by the preview's unrounded arithmetic (see roundCoin above).
    if (roundCoin(qty) * roundCoin(price) < MOQ_COIN) continue;
    out.push({ price, qty });
  }
  return out;
}

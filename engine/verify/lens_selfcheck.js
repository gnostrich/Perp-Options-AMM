#!/usr/bin/env node
// CONSTANT SLOPE-MULTIPLIER lens self-check (HARD gate). REWRITTEN 2026-06-13 for
// the operator-ruled constant-multiplier lens (entries 229/231; skeptic
// VERDICT_constant_slope_multiplier_entry229_2026-06-13). REPLACES the old
// position-dependent √(τ²+u²) elbow-lens gate, which asserted the now-DEAD design
// (g_loc(ATM)=0, wings→γ, |g_loc|≤γ, funding→0-at-ATM) — those assertions are
// REMOVED, not satisfied, per the skeptic's gate-problem finding.
//
// THE NEW DESIGN (slope multiplier m; m=1 = plain v24 curve; bigger m = steeper):
//   g_loc(K) = m·γ  at EVERY strike  (γ = w/(1−w) LIVE, NO u-dependence, NO elbow,
//   NO flat-top, NO frozen-γ wing). Settlement smooth-paste uses g = m·γ. Trade
//   map θ_tx = mode·(chosen/mode)^m (m=1 ⇒ θ_tx = chosen). SPOT fns byte-identical
//   to v24; the LIVE trade path is the TRADE-POINT law tradeUpdateAt (CM8-v2,
//   operator entry 339 — paper Eq. 2 at T = ray∩curve; frozen-ARC close, CM6-v2).
//   The three (steeper g_loc, further θ_tx, transact-where-it-looks) co-move
//   with m in the SAME direction.
//
//
// ⚠ UPDATE 1 (2026-07-07, SPEC_update1_clean_close): CM6-v2 (frozen-arc round-trip +
//   no-free-money) is **RETIRED**. The unified sell-back close is a POOL-REPRICE close
//   with NO exact round trip: *** CM6-v2's no-free-money / exact-round-trip assertions
//   are RETIRED; no-free-money returns in UPDATE 2 with the counterfactual floor. ***
//   Replaced by CM6-v3 (documents the drain: Δy=0 exact; a fixed-oracle one-signed
//   self-drain ∝dy² that TRACKS THE ORACLE — IL-like, NOT one-signed once price moves;
//   credit wrapper byte-unchanged ⇒ non-extractable by construction), CM12 (payout
//   continuity — the retired two-case 45%-class seam dissolves), and the FE funding
//   extrinsic-weight checks (zero past S*, hump at ATM, ±g·(S−1)/S sign unchanged).
//
// Usage: node lens_selfcheck.js [path-to-html]   (default: canonical v28-lens HEAD).
// SKIP-as-pass on a build without gLoc/markLensed (non-lens build).
// On the OLD √-lens HEAD (no constant-multiplier token) the CM block SKIPs but the
// generic checks (pool byte-id, markLensed monotone/bounded) still run, so HEAD is
// NOT a silent no-op while the new build is gated by the full CM suite.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');

const file = process.argv[2] ||
  path.join(__dirname, '..', 'builds', 'HEAD_temporal_mvp_v28_lens.html');
const t = fs.readFileSync(file, 'utf8');
console.log('lens_selfcheck CHECKING: ' + path.basename(file));
const baseFile = path.join(__dirname, '..', 'builds', 'temporal_mvp_v24_rebase_fixed_2.html');
const tBase = fs.readFileSync(baseFile, 'utf8');

function engineOf(src) {
  const m = /<script id="engine">([\s\S]*?)<\/script>/.exec(src);
  if (!m) { console.error('no engine script in ' + src.slice(0, 40)); process.exit(1); }
  const ctx = { Math, isFinite, console };
  vm.createContext(ctx);
  vm.runInContext(m[1] + '\n;this.__E=Engine;', ctx);
  return { E: ctx.__E, body: m[1] };
}
const { E, body: engineBody } = engineOf(t);
const { E: EB } = engineOf(tBase);
const baseBody = (/<script id="engine">([\s\S]*?)<\/script>/.exec(tBase) || [, ''])[1];

if (typeof E.gLoc !== 'function' || typeof E.markLensed !== 'function') {
  console.log('SKIP lens_selfcheck: build has no lens export (gLoc/markLensed) — pass.');
  process.exit(0);
}

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
  if (cond) { pass++; console.log('PASS ' + name + (detail ? '  ' + detail : '')); }
  else { fail++; console.log('FAIL ' + name + (detail ? '  ' + detail : '')); }
};
const grabFn = (src, name) => {
  const i = src.indexOf('function ' + name);
  if (i < 0) return null;
  let depth = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) { if (src[k] === '{') depth++; else if (src[k] === '}') { depth--; if (depth === 0) return src.slice(i, k + 1); } }
  return null;
};

console.log('=== constant slope-multiplier lens self-check :: ' + path.basename(file) + ' ===');

// v24 state = {x, y, alpha=x·w, beta=y·(1−w)}; γ = w/(1−w) = getW/(1−getW).
const mkPool = (x, y, w) => ({ x, y, alpha: x * w, beta: y * (1 - w) });

// Design detector: the constant-multiplier gLoc returns `m * gamma` (no u-dependence).
// Read off the gLoc source so a stale build can't masquerade as the new design AND
// confirm it NUMERICALLY (not a sole literal-text match): a constant-multiplier gLoc
// must return the SAME exponent at two distinct strikes (no u/strike dependence).
const gLocSrc = grabFn(engineBody, 'gLoc') || '';
const sourceClean = /return\s+m\s*\*\s*gamma\s*;/.test(gLocSrc) && !/hpTau|h′_τ|Math\.sqrt\([^)]*tau/.test(gLocSrc);
let numericConstInStrike = false;
try {
  const _p = mkPool(10, 80000, 0.725);     // γ = 2.6363…; mkPool defined just above
  const _g1 = E.gLoc(_p, 0.5, 2);          // m=2, θ = 0.5
  const _g2 = E.gLoc(_p, 3.0, 2);          // m=2, θ = 3.0 (distinct strike)
  numericConstInStrike = Number.isFinite(_g1) && Number.isFinite(_g2) && _g1 === _g2;
} catch (e) { numericConstInStrike = false; }
const isConstMult = sourceClean && numericConstInStrike;
const hasTradeMap = /\btheta_tx\b/.test(engineBody);

// ── pool byte-identity (runs on ALL lens builds) ──────────────────────────────
{
  let srcId = true, which = '';
  for (const fn of ['tradeUpdate', 'arbitrageToOracle', 'rebase']) {
    if (grabFn(engineBody, fn) !== grabFn(baseBody, fn)) { srcId = false; which += fn + ' '; }
  }
  chk('(P) pool tradeUpdate/arbitrageToOracle/rebase byte-identical to v24', srcId, srcId ? '' : 'DIFFERS: ' + which);
  // and numeric tradeUpdate identical for several dy
  const s = mkPool(10, 80000, 0.725);
  let maxd = 0;
  for (const dy of [1, 100, -100, 5000, -5000, 250, -1, 0.5]) {
    const a = EB.tradeUpdate(s, dy), b = E.tradeUpdate(s, dy);
    if (a === null && b === null) continue;
    if ((a === null) !== (b === null)) { maxd = Infinity; break; }
    maxd = Math.max(maxd, Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.alpha - b.alpha), Math.abs(a.beta - b.beta));
  }
  chk('(P-num) tradeUpdate numeric identical to v24', maxd === 0, 'maxAbsDelta=' + maxd);
}

// ── arbitrageToOracle stays lens-free (forward-read-only, L4) ─────────────────
{
  const arbSrc = grabFn(engineBody, 'arbitrageToOracle') || '';
  const arbLensFree = !/gLoc|markLensed|lensU/.test(arbSrc);
  chk('(L4) arbitrageToOracle lens-free (plain Balancer, forward-read-only)', arbLensFree, arbLensFree ? '' : 'lens call inside arb');
}

if (!isConstMult) {
  console.log('SKIP constant-multiplier block: build gLoc does not return m·γ (old √-lens design or other). ' +
    'Generic pool/L4 checks ran above; the full constant-multiplier suite gates the constmult build only.');
  console.log('=== lens_selfcheck: ' + pass + ' PASS, ' + fail + ' FAIL ===');
  process.exit(fail === 0 ? 0 : 1);
}

// ════════════════════════════════════════════════════════════════════════════
//  CONSTANT SLOPE-MULTIPLIER ASSERTIONS (the new design)
// ════════════════════════════════════════════════════════════════════════════
const W = 0.725;                       // γ = 2.6363...
const s = mkPool(10, 80000, W);
const gamma = E.getW(s) / (1 - E.getW(s));
const mode = E.getSNorm(s);
const MS = [1, 1.5, 2, 3, 4];          // several m to exercise

// ── (CM1) g_loc(K) = m·γ constant across strikes (no u-dependence); m=1 ⇒ g=γ ──
{
  let maxerr = 0, worst = '', m1ok = true;
  for (const m of MS) {
    const expect = m * gamma;
    for (const mult of [0.05, 0.2, 0.5, 0.8, 1.0, 1.3, 2.0, 5.0, 20.0, 100.0]) {
      const thetaK = mode * mult;
      const got = E.gLoc(s, thetaK, m);
      const e = Math.abs(got - expect);
      if (e > maxerr) { maxerr = e; worst = 'm=' + m + ' mult=' + mult + ' got=' + got.toFixed(8) + ' exp=' + expect.toFixed(8); }
    }
  }
  // m=1 ⇒ g_loc == γ everywhere (= the plain v24 curve exponent)
  for (const mult of [0.2, 1.0, 5.0, 40.0]) {
    if (Math.abs(E.gLoc(s, mode * mult, 1) - gamma) > 1e-12) m1ok = false;
  }
  chk('(CM1) g_loc = m·γ constant at every strike (no u-dependence); m=1 ⇒ g_loc=γ (plain curve)',
      maxerr < 1e-12 && m1ok, 'maxAbsErr=' + maxerr.toExponential(2) + ' m1=γ-everywhere=' + m1ok + '  ' + worst);
}

// ── (CM2) wings are exact power-laws of exponent m·γ (NO floor/saturation, monotone) ──
// The local exponent in the wings IS m·γ (the gLoc value). Sample deep strikes on
// both wings: g_loc stays exactly m·γ (no decay toward γ, no saturation). Also assert
// the markLensed value curve is monotone (call decays away from the mode; put decays
// the other way) and bounded in [0,1] — A5 no-floor / no-saturation.
{
  let wingOk = true, monoOk = true, boundOk = true, worst = '';
  for (const m of MS) {
    const g = m * gamma;
    // deep wings: exponent stays exactly m·γ
    for (const lu of [3, 6, 10, 20, 40]) {
      if (Math.abs(E.gLoc(s, mode * Math.exp(lu), m) - g) > 1e-12) { wingOk = false; worst = 'wing m=' + m + ' lu=' + lu; }
      if (Math.abs(E.gLoc(s, mode * Math.exp(-lu), m) - g) > 1e-12) { wingOk = false; worst = 'wing m=' + m + ' lu=-' + lu; }
    }
    // markLensed monotone + bounded over a wide sNorm sweep at a representative wing strike
    for (const wing of ['call', 'put']) {
      const theta = mode * (wing === 'call' ? 1.8 : 0.55);
      let prev = null;
      for (let q = 1e-4; q < 8; q *= 1.15) {
        const v = E.markLensed(wing, theta, q, g);
        if (!(v >= 0 && v <= 1 + 1e-12)) { boundOk = false; worst = 'bound ' + wing + ' m=' + m; }
        // value is monotone in sNorm: call rises with sNorm, put falls — check no reversal sign flip beyond fp noise
        if (prev !== null && wing === 'call' && v < prev - 1e-9) { monoOk = false; worst = 'mono call m=' + m; }
        if (prev !== null && wing === 'put' && v > prev + 1e-9) { monoOk = false; worst = 'mono put m=' + m; }
        prev = v;
      }
    }
  }
  chk('(CM2/A5) wings exact power-law exponent m·γ; markLensed monotone + bounded [0,1] (no floor/saturation)',
      wingOk && monoOk && boundOk, 'wing-exp=' + wingOk + ' monotone=' + monoOk + ' bounded=' + boundOk + (worst ? ' worst=' + worst : ''));
}

// ── (CM3) monotonicity / no-arb : the value curve is a plain power-law of exponent m·γ ──
// markLensed with constant g is the v26b smooth-paste of a single power law; the
// fraction is monotone in the strike-distance and stays in [0,1] (no arb surface,
// same structure as the gated v24 baseline). Witness: ATM is the global max along a
// wing (value ≤ ATM value), and the curve decays monotonically into the wing.
{
  let ok = true, worst = '';
  for (const m of MS) {
    const g = m * gamma;
    // along the call wing: theta increasing from the mode ⇒ markLensed(call) decays
    let prev = Infinity;
    for (let mult = 1.0; mult <= 30; mult *= 1.2) {
      const theta = mode * mult;
      const v = E.markLensed('call', theta, mode, g);  // spot at mode, strike moving out
      if (v > prev + 1e-9) { ok = false; worst = 'call-decay m=' + m + ' mult=' + mult.toFixed(2); }
      if (!(v >= 0 && v <= 1 + 1e-12)) { ok = false; worst = 'call-bound m=' + m; }
      prev = v;
    }
  }
  chk('(CM3) monotone / no-arb: value decays monotonically into the wing, bounded [0,1] (plain power-law m·γ)',
      ok, ok ? 'monotone decay both bounded over m∈{1,1.5,2,3,4}' : worst);
}

// ── (CM4-v2) PKG-ITM v2 LINEAR re-seam: C⁰ + C¹ weld at the v2 free boundary (BOTH wings) ──
// Operator entries 286/287, go 298; spec SPEC_pkg_itm_v2_engine_coords_2026-07-02 §7.1;
// Lean model O1 PasteLin (paste_value_lin/paste_slope_lin/paste_unique, trusted-from-prover).
// v2 seams: put sNorm* = θ·g/(g+1) (dollar S* = K·g/(g+1) — the 0.667K seam at g=2,
// 0.857K at g=6), call sNorm* = θ·(g+1)/g. REPLACES the old power-form seams
// θ·(g/(g+1))^g / θ·((g+1)/g)^g (retained build: temporal_mvp_v28_lens_powerarm.html).
// Boundary fraction 1/(g+1) exact at the seam; C⁰ machine zero across a ±1e-10
// relative straddle. g set = m·γ over MS plus the spec's named g∈{2,6} columns.
{
  const sStarCall = (theta, g) => theta * (g + 1) / g;
  const sStarPut = (theta, g) => theta * g / (g + 1);
  const GS = MS.map((m) => m * gamma).concat([2, 6]);
  let maxVal = 0, worst = '';
  for (const g of GS) {
    for (const wing of ['call', 'put']) {
      const theta = 1.0;
      const sStar = wing === 'call' ? sStarCall(theta, g) : sStarPut(theta, g);
      const vL = E.markLensed(wing, theta, sStar * (1 - 1e-10), g);
      const vR = E.markLensed(wing, theta, sStar * (1 + 1e-10), g);
      const vGap = Math.abs(vL - vR);
      const fGap = Math.abs(E.markLensed(wing, theta, sStar, g) - 1 / (g + 1));
      const tot = Math.max(vGap, fGap);
      if (tot > maxVal) { maxVal = tot; worst = wing + ' g=' + g.toFixed(2); }
    }
  }
  chk('(CM4-v2) linear re-seam C⁰ at v2 seam (put θ·g/(g+1), call θ·(g+1)/g) machine-zero + boundary fraction 1/(g+1)',
      maxVal < 1e-9, 'maxSeamGap=' + maxVal.toExponential(2) + ' ' + worst);
  // C¹ probe: one-sided difference quotients of markLensed in sNorm at the seam
  // (ε = 1e-6·sStar): put both sides → −1/θ ; call both sides → g²/((g+1)²·θ).
  let maxRel = 0, worstC1 = '';
  for (const g of GS) {
    for (const wing of ['call', 'put']) {
      const theta = 1.0;
      const sStar = wing === 'call' ? sStarCall(theta, g) : sStarPut(theta, g);
      const eps = 1e-6 * sStar;
      const v0 = E.markLensed(wing, theta, sStar, g);
      const qL = (v0 - E.markLensed(wing, theta, sStar - eps, g)) / eps;
      const qR = (E.markLensed(wing, theta, sStar + eps, g) - v0) / eps;
      const expect = wing === 'put' ? -1 / theta : g * g / ((g + 1) * (g + 1) * theta);
      const rel = Math.max(Math.abs(qL - expect), Math.abs(qR - expect)) / Math.abs(expect);
      if (rel > maxRel) { maxRel = rel; worstC1 = wing + ' g=' + g.toFixed(2) + ' qL=' + qL.toFixed(6) + ' qR=' + qR.toFixed(6) + ' exp=' + expect.toFixed(6); }
    }
  }
  chk('(CM4-v2-C1) one-sided slope quotients at the seam: put −1/θ, call g²/((g+1)²·θ), both sides (rel ≤1e-4)',
      maxRel < 1e-4, 'maxRelErr=' + maxRel.toExponential(2) + ' ' + worstC1);
  // NaN-freedom across both wings / all m (no degenerate pow)
  let bad = 0;
  for (const m of MS) {
    const g = m * gamma;
    for (const wing of ['call', 'put']) for (let q = 0.001; q < 6; q += 0.013) {
      if (!isFinite(E.markLensed(wing, 1.0, q, g))) bad++;
    }
  }
  chk('(CM4-nan) markLensed NaN-free across both wings for g=m·γ', bad === 0, 'nonFinite=' + bad);
}

// ── (CM5) trade map θ_tx = mode·(chosen/mode)^m ; m=1 ⇒ θ_tx = chosen ──
if (hasTradeMap) {
  let maxerr = 0, m1ok = true, worst = '';
  const orc = 80000;
  for (const m of MS) {
    for (const mult of [0.25, 0.5, 0.8, 1.3, 2.0, 4.0]) {
      const chosen = mode * mult;
      const wing = mult >= 1 ? 'call' : 'put';
      const lg = E.executeLeg(s, 'sell', wing, chosen, NaN, 1, orc, m);
      const expect = mode * Math.pow(chosen / mode, m);
      const e = Math.abs(lg.theta_tx - expect);
      if (e > maxerr) { maxerr = e; worst = 'm=' + m + ' mult=' + mult + ' θ_tx=' + lg.theta_tx.toFixed(6) + ' exp=' + expect.toFixed(6); }
    }
    // m=1 ⇒ θ_tx == chosen
    const lg1 = E.executeLeg(s, 'sell', 'call', mode * 2, NaN, 1, orc, 1);
    if (Math.abs(lg1.theta_tx - mode * 2) > 1e-9) m1ok = false;
  }
  chk('(CM5) trade map θ_tx = mode·(chosen/mode)^m (≤1e-9); m=1 ⇒ θ_tx = chosen',
      maxerr < 1e-9 && m1ok, 'maxErr=' + maxerr.toExponential(2) + ' m1=θ_tx==chosen=' + m1ok + ' ' + worst);
} else {
  chk('(CM5) trade map present', false, 'NO theta_tx in engine — constant-multiplier build must carry the trade map');
}

// ── (CM6-v3) UNIFIED SELL-BACK close — the DRAIN documented as an ACCEPTED property
//    (UPDATE 1, SPEC_update1_clean_close_2026-07-07 §6/§7.1). RETIRES CM6-v2
//    (frozen-arc round-trip + no-free-money): the live close is a POOL-REPRICE close,
//    there is NO exact round trip. *** CM6-v2's no-free-money / exact-round-trip
//    assertions are RETIRED; no-free-money returns in UPDATE 2 with the counterfactual
//    floor. *** CM6-v3 pins the VERIFIED characterization: Δy = 0 exact; a FIXED-ORACLE
//    (no-move) one-signed self-drain ∝dy² (~$53 at N=0.05 on the exhibit pool, bounded
//    for typical N, ∝N²); the TRANSIENT Δx TRACKS THE ORACLE MOVE (IL-like — NOT
//    one-signed once the oracle moves, so one-signedness is scoped to the no-move
//    regime); and the swap is a pool-internal reprice credited to NO wallet (the
//    equity/overlay credit wrapper is byte-unchanged ⇒ non-extractable BY CONSTRUCTION).
if (hasTradeMap && typeof E.tradeUpdateAt === 'function') {
  const sA = mkPool(10, 800000, 0.5);
  const orc = 80000, mKnob = 2;
  // leg-level round trip = EXACTLY what the live close does per leg: open at o0,
  // reverse dy = −(open dy) at rho_close = (K_tx/oNow)/getSNorm(pool_now).
  const rt = (side, wing, th, N, o0, o1) => {
    const open = E.executeLeg(sA, side, wing, th, NaN, N, o0, mKnob);
    if (!open || open.rejected || !open.arc) return null;
    const rho = (open.K_tx / o1) / E.getSNorm(open.newState);
    const rev = E.tradeUpdateAt(open.newState, -open.arc.dyA, rho);
    if (!rev) return null;
    return { dX: rev.x - sA.x, dY: rev.y - sA.y, dyRev: open.arc.dyA };
  };
  const legGrid = [['sell','call',1.3],['sell','call',2.0],['sell','put',0.8],['buy','put',0.7]];

  // (CM6-v3.1) Δy = 0 EXACT on the SHIPPED closeBand round trip (both legs reversed at
  //   the frozen dollar tx-strike). DISCRIMINATES the retired settle-to-cash close,
  //   which leaves the settled leg's dy on the pool ⇒ Δy≠0.
  {
    const mkBandCase = (c) => {
      const sold = { K_inner:c.si*orc, K_outer:NaN, inner:c.si, outer:NaN };
      const bought = { K_inner:c.bi*orc, K_outer:NaN, inner:c.bi, outer:NaN };
      const r = E.executeBand(sA, c.sw, c.bw, sold, bought, 1, orc, orc, mKnob);
      if (!r || !r.ok) return null;
      const band = { sold_wing:c.sw, bought_wing:c.bw,
        sold:{inner:c.si,outer:NaN,K_inner:c.si*orc,K_outer:NaN,K_tx:r.leg1.K_tx,arc:r.leg1.arc,N:r.N_sell},
        bought:{inner:c.bi,outer:NaN,K_inner:c.bi*orc,K_outer:NaN,K_tx:r.leg2.K_tx,arc:r.leg2.arc,N:r.N_buy},
        entry:{pool:sA,oracle:orc,L0:1}, carved:{carvedNotional:0,carvedEntryEquity:1,entryPerpMark:orc} };
      const cl = E.closeBand(r.finalState, band, {equity:1e12}, orc, orc, orc, mKnob);
      return cl.ok ? { dY: cl.finalState.y - sA.y, dX: cl.finalState.x - sA.x } : null;
    };
    let maxDy = 0, lines = [];
    for (const c of [{sw:'put',bw:'call',si:0.9,bi:1.1},{sw:'call',bw:'put',si:1.1,bi:0.9},{sw:'put',bw:'call',si:0.8,bi:1.25}]) {
      const rr = mkBandCase(c);
      if (!rr) { maxDy = Infinity; lines.push(c.sw+'/'+c.bw+' null'); continue; }
      maxDy = Math.max(maxDy, Math.abs(rr.dY));
      lines.push(c.sw+'/'+c.bw+' Δy='+rr.dY.toExponential(2)+' Δx='+rr.dX.toExponential(2));
    }
    chk('(CM6-v3.1) SHIPPED closeBand round trip: Δy = 0 EXACT (both legs reversed; the retired settle-to-cash close leaves Δy≠0)',
        maxDy <= 1e-6, lines.join(' | '));
  }
  // (CM6-v3.2) FIXED-ORACLE self-drain: Δx < 0 one-signed across OTM+ITM strikes.
  //   Scope: NO-MOVE regime only (CM6-v3.4 shows Δx flips sign once the oracle moves).
  {
    let ok = true, lines = [];
    for (const [side,wing,th] of legGrid) for (const N of [0.02,0.05,0.08]) {
      const r = rt(side,wing,th,N,orc,orc);
      if (!r) { ok = false; lines.push(side+'/'+wing+' null'); continue; }
      if (!(r.dX < 0)) ok = false;
      if (N === 0.05) lines.push(side+'/'+wing+' θ='+th+' Δx='+r.dX.toExponential(2));
    }
    chk('(CM6-v3.2) fixed-oracle (no-move) self-drain: Δx < 0 one-signed at every strike (OTM & ITM) — one-signedness SCOPED to the no-move regime',
        ok, lines.join(' | '));
  }
  // (CM6-v3.3) Δx ∝ dy² : Δx/dyRev² near-constant across N (measured −1.47e-11→−1.43e-11).
  {
    let ratios = [], ok = true;
    for (const N of [0.01,0.02,0.04,0.08]) { const r = rt('sell','call',1.3,N,orc,orc); if (!r){ok=false;continue;} ratios.push(r.dX/(r.dyRev*r.dyRev)); }
    const mn = Math.min(...ratios), mx = Math.max(...ratios);
    ok = ok && ratios.length === 4 && ratios.every(v=>v<0) && Math.abs((mx-mn)/mn) < 0.05;
    chk('(CM6-v3.3) Δx ∝ dy²: Δx/dyRev² near-constant (<5%) across N∈{.01..08} — the ∝N² self-drain',
        ok, 'ratios=' + ratios.map(v=>v.toExponential(3)).join(',') + ' spread=' + (Math.abs((mx-mn)/mn)).toExponential(2));
  }
  // (CM6-v3.4) transient Δx TRACKS THE ORACLE (IL-like; NOT one-signed once oracle moves):
  //   monotone increasing in the close oracle o1 and SIGN-FLIPS across o1=o0.
  {
    const dn = rt('sell','call',1.3,0.05,orc,orc*0.85);
    const at = rt('sell','call',1.3,0.05,orc,orc);
    const up = rt('sell','call',1.3,0.05,orc,orc*1.15);
    const ok = dn && at && up && dn.dX < at.dX && at.dX < up.dX && dn.dX < 0 && up.dX > 0;
    chk('(CM6-v3.4) transient Δx TRACKS the oracle (IL-like): monotone↑ in o1, sign FLIPS across o1=o0 (down<0, up>0) ⇒ one-signedness is fixed-oracle-ONLY',
        ok, (dn&&up) ? ('Δx@0.85×='+dn.dX.toExponential(2)+' @1.0×='+at.dX.toExponential(2)+' @1.15×='+up.dX.toExponential(2)) : 'null');
  }
  // (CM6-v3.5) NEGATIVE CONTROL — the drain is PRESENT and the SHIPPED closeBand routes
  //   the reversal via tradeUpdateAt (NOT the exact frozen-arc revertArc). A build that
  //   restored the exact revertArc close drives Δx→0 (and Δy≠0 via settle-to-cash) and
  //   FAILS here.
  {
    const r = rt('sell','call',1.3,0.05,orc,orc);
    const present = r && Math.abs(r.dX) > 1e-6;
    const cbSrc = grabFn(engineBody, 'closeBand') || '';
    const routesLive = /tradeUpdateAt\(s,\s*dyRev/.test(cbSrc) && !/revertArc\(/.test(cbSrc);
    chk('(CM6-v3.5) negative control: fixed-oracle drain PRESENT |Δx|>1e-6 AND closeBand routes reversal via tradeUpdateAt (NOT exact revertArc)',
        present && routesLive, (r ? ('|Δx|='+Math.abs(r.dX).toExponential(3)+' ($'+(r.dX*orc).toFixed(1)+' at N=0.05)') : 'null') + ' routesLive=' + routesLive);
  }
  // (CM6-v3.6) credit wrapper byte-unchanged ⇒ the close swap is credited to NO wallet
  //   (non-extractable by construction). Checks the state-block equity/overlay lines.
  {
    const c1 = t.includes('+= retEquity;') && t.includes('club.totalNotional += retNotional;');
    const c2 = t.includes('trader_payout: r.trader_payout, club_delta: r.club_delta,');
    const c3 = t.includes('carvedEquityAtClosure: r.carvedEquityAtClosure,');
    chk('(CM6-v3.6) credit wrapper byte-unchanged (equity/overlay credit paths present) ⇒ close swap is a pool reprice credited to NO wallet',
        c1 && c2 && c3, 'equity+=retEquity=' + c1 + ' overlay-payout/club=' + c2 + ' overlay-carvedEq=' + c3);
  }
}

// ── (CM12) PAYOUT CONTINUITY across the RETIRED two-case OTM/ITM branch boundary
//    (UPDATE 1, SPEC_update1 §7.2). The unified close values BOTH legs at ONE
//    pre-close snapshot s0 (via legPrice), with NO moneyness branch ⇒ raw_net is a
//    CONTINUOUS function of the pool mode. The old two-case protocol priced the 2nd
//    leg at a pool MOVED by the 1st leg's reversal (neither-ITM branch) but at the
//    UNMOVED pool (one-ITM branch) — a jump at the branch boundary (measured
//    5.672e-2 = ~87% of |raw_net| on the collar exhibit; the "221→1.24 / 45%" seam).
if (typeof E.closeBand === 'function' && typeof E.tradeUpdateAt === 'function') {
  const orc = 80000, mKnob = 2, tau = mKnob;
  const base = mkPool(10, 800000, 0.5);
  const c = { sw:'put', bw:'call', si:0.9, bi:1.1 };            // collar
  const sold   = { K_inner:c.si*orc, K_outer:NaN, inner:c.si, outer:NaN };
  const bought = { K_inner:c.bi*orc, K_outer:NaN, inner:c.bi, outer:NaN };
  const r = E.executeBand(base, c.sw, c.bw, sold, bought, 1, orc, orc, mKnob);
  const band = { sold_wing:c.sw, bought_wing:c.bw,
    sold:{inner:c.si,outer:NaN,K_inner:c.si*orc,K_outer:NaN,K_tx:r.leg1.K_tx,arc:r.leg1.arc,N:r.N_sell},
    bought:{inner:c.bi,outer:NaN,K_inner:c.bi*orc,K_outer:NaN,K_tx:r.leg2.K_tx,arc:r.leg2.arc,N:r.N_buy},
    entry:{pool:base,oracle:orc,L0:1}, carved:{carvedNotional:0,carvedEntryEquity:1,entryPerpMark:orc} };
  // NEW: raw_net from the shipped unified closeBand, varying the pool mode via w.
  const newRaw = (w) => { const st = mkPool(r.finalState.x, r.finalState.y, w);
    const cl = E.closeBand(st, band, {equity:1e12}, orc, orc, orc, mKnob); return cl.ok ? cl.raw_net : NaN; };
  // OLD (retired) two-case protocol, reconstructed in-gate from the SAME engine
  // primitives (legValueUnified + pool-MOVED legPrice for the 2nd leg). Verified
  // == the retained twin's closeBand at the crossing (jump 5.672e-2).
  const oldRaw = (w) => {
    const st = mkPool(r.finalState.x, r.finalState.y, w);
    const sNorm0 = E.getSNorm(st);
    const soldITM = E.legIsITM('put', band.sold, sNorm0), boughtITM = E.legIsITM('call', band.bought, sNorm0);
    let X, Y;
    if (soldITM) { X = E.legValueUnified(st,'put',band.sold,tau); Y = E.legPrice(st,'call',band.bought.inner,band.bought.outer,band.bought.N,tau).V; }
    else if (boughtITM) { Y = E.legValueUnified(st,'call',band.bought,tau); X = E.legPrice(st,'put',band.sold.inner,band.sold.outer,band.sold.N,tau).V; }
    else {
      X = E.legPrice(st,'put',band.sold.inner,band.sold.outer,band.sold.N,tau).V;
      const dyRevSold = -((-1)*(+1)*band.sold.N*(band.sold.K_tx));
      const s2 = band.sold.arc ? E.revertArc(st, band.sold.arc, 1) : E.tradeUpdate(st, dyRevSold);
      Y = E.legPrice(s2||st,'call',band.bought.inner,band.bought.outer,band.bought.N,tau).V;
    }
    return Y - X;
  };
  const maxStep = (fn, w0, w1, steps) => { let prev=null, mx=0; for (let i=0;i<=steps;i++){ const w=w0+(w1-w0)*i/steps; const v=fn(w); if(prev!==null&&isFinite(v)) mx=Math.max(mx,Math.abs(v-prev)); if(isFinite(v)) prev=v; } return mx; };
  const w0=0.35, w1=0.65;
  const nCoarse = maxStep(newRaw,w0,w1,60),  nFine = maxStep(newRaw,w0,w1,240);
  const oCoarse = maxStep(oldRaw,w0,w1,60),  oFine = maxStep(oldRaw,w0,w1,240);
  // (CM12.1) unified close raw_net CONTINUOUS: the max adjacent step SHRINKS with
  //   granularity (no jump floor). Refine 4× ⇒ step shrinks (coarse/fine ≥ 3).
  {
    const ratio = nCoarse / Math.max(nFine, 1e-300);
    chk('(CM12.1) unified close raw_net CONTINUOUS across the crossing: max step shrinks with granularity (coarse/fine ≥ 3, no jump floor)',
        ratio >= 3, 'nCoarse='+nCoarse.toExponential(2)+' nFine='+nFine.toExponential(2)+' ratio='+ratio.toFixed(2));
  }
  // (CM12.2) NEGATIVE CONTROL: the retired two-case raw JUMPS at the branch boundary
  //   — its max step FLOORS (does not shrink with granularity) and is ≫ the unified
  //   build's step. Proves the seam existed; the single-snapshot valuation removed it.
  {
    const ratio = oCoarse / Math.max(oFine, 1e-300);
    const floors = ratio < 1.5;
    const bigger = oFine > 3 * nFine;
    chk('(CM12.2) negative control: the RETIRED two-case raw JUMPS at the branch boundary (step FLOORS, ≥3× the unified step) — the removed 45%-class seam',
        floors && bigger, 'oCoarse='+oCoarse.toExponential(2)+' oFine='+oFine.toExponential(2)+' floorRatio='+ratio.toFixed(2)+' oFine/nFine='+(oFine/Math.max(nFine,1e-300)).toFixed(1));
  }
}

// ── (FE) FUNDING — retained ITM-zero + old-full-mark negative control (§3).
//    ⚠ 2026-07-08 (SPEC_funding_sameslope §5): the funding WEIGHT is now the SAME-SLOPE
//    pool-vs-anchor DEVIATION (placeholder, deviation-only; formula TBD update-2), NOT the
//    extrinsic hump. FE.2 (hump-at-ATM) and FE.3 (source ±g·(S−1)/S weight=ext) are RETIRED
//    (they encoded the regression) → see FS.1 / FS.5 below. FE.1 (funding=0 ITM) and FE.4
//    (neg-ctrl vs old full-mark) survive: same-slope dev is OTM-gated so funding is still 0 ITM.
if (typeof E.fundingPerStrike === 'function') {
  const orc = 80000, mKnob = 2, kappa = 0.01, N = 1, dt = 1;
  const sf = mkPool(10, 90000, 0.6);                    // S = poolMark/oracle ≠ 1
  const mo = E.getSNorm(sf), gg = E.gLoc(sf, mo, mKnob);
  const Sf = E.poolMark(sf, orc, orc) / orc;
  const extOf = (wing, strike) => {
    const mk = E.markLensed(wing, strike, mo, gg);
    const intr = wing==='call' ? Math.max(0,1-strike/mo) : Math.max(0,1-mo/strike);
    return mk - intr;
  };
  // funding coord (markLensed sNorm←mode, theta←strike): put ITM ⟺ strike ≥ mode·(g+1)/g,
  // call ITM ⟺ strike ≤ mode·g/(g+1). "Past S*" ⇒ extrinsic ≡ 0.
  // (FE.1) extrinsic = 0 past S* both wings ⇒ funding ZERO ITM.
  {
    let ok = true, lines = [];
    const putITM  = [mo*(gg+1)/gg*1.05, mo*(gg+1)/gg*1.5, mo*3];
    const callITM = [mo*gg/(gg+1)*0.95, mo*gg/(gg+1)*0.6, mo*0.2];
    for (const st of putITM) {
      if (Math.abs(extOf('put', st)) > 1e-12) { ok=false; lines.push('put ext@'+st.toFixed(3)); }
      if (Math.abs(E.fundingPerStrike(sf, st, 'put', N, dt, kappa, orc, orc, mKnob)) > 1e-12) { ok=false; lines.push('put f@'+st.toFixed(3)); }
    }
    for (const st of callITM) {
      if (Math.abs(extOf('call', st)) > 1e-12) { ok=false; lines.push('call ext@'+st.toFixed(3)); }
      if (Math.abs(E.fundingPerStrike(sf, st, 'call', N, dt, kappa, orc, orc, mKnob)) > 1e-12) { ok=false; lines.push('call f@'+st.toFixed(3)); }
    }
    chk('(FE.1) funding extrinsic weight = markLensed − max(intrinsic,0) = 0 (≤1e-12) past S* both wings ⇒ funding ZERO ITM',
        ok, ok ? ('S='+Sf.toFixed(4)+' g='+gg.toFixed(2)+' all ext=0 & f=0 past S*') : lines.join(' '));
  }
  // (FE.2) RETIRED 2026-07-08 (SPEC_funding_sameslope §5): the "extrinsic hump peaks
  //   at ATM" shape ENCODES the regression — same-slope funding is ZERO at ATM (dev=0).
  //   The anti-regression shape is now asserted by FS.1 (funding=0 at ATM) below.
  // (FE.3) RETIRED 2026-07-08 (SPEC_funding_sameslope §5): the source ±g·(S−1)/S weight=ext
  //   lock asserted the CONFOUNDED structure (pool-vs-oracle gap × moneyness/value weight).
  //   Replaced by FS.5 (source-token lock for the same-slope deviation weight) below.
  // (FE.4) NEGATIVE CONTROL: OLD full-mark funding is NON-zero past S* (funds intrinsic
  //   forever) while the NEW extrinsic funding = 0 there.
  {
    const st = mo*(gg+1)/gg*1.3;                        // past put seam (ITM)
    const mk = E.markLensed('put', st, mo, gg);         // full mark (≈ intrinsic, nonzero)
    const oldF = kappa * (-gg) * N * mk * (Sf - 1) / Sf * dt;
    const newF = E.fundingPerStrike(sf, st, 'put', N, dt, kappa, orc, orc, mKnob);
    chk('(FE.4) negative control: OLD full-mark funding NON-zero past S* (funds intrinsic forever) while NEW = 0',
        Math.abs(oldF) > 1e-9 && Math.abs(newF) <= 1e-12, 'oldF=' + oldF.toExponential(3) + ' newF=' + newF.toExponential(3) + ' fullMark=' + mk.toFixed(4));
  }
}

// ── (FS) FUNDING = SAME-SLOPE POOL-vs-ANCHOR DEVIATION (SPEC_funding_sameslope §5, RULED 460).
//    dev = |c·ln(θ/mode)|, c = (g_a−g)/(g_a+1); g = m·γ (pool), g_a = m (anchor w=½). The
//    unique fingerprint: ZERO at ATM (fails the mark/ext family) AND ZERO on a w=½ pool at
//    every OTM strike (fails the moneyness-proxy family). Negative-controlled in-gate against
//    BOTH regressions (extW = shipped ext weight; proxyW = |ln(θ/mode)| moneyness proxy).
//    FS.2/b is the anti-regression anchor (funding=0 on a symmetric pool at OTM, S≠1).
if (typeof E.fundingPerStrike === 'function') {
  const m = 2, kappa = 1, N = 1, dt = 1;
  const orc = 125000, oi = 100000;                       // DRIFTED oracle ⇒ S = getMP_raw/oi ≠ 1 (essential)
  const md   = (s) => E.getSNorm(s);
  // negative-control weights (what the regression keeps drifting to):
  const extW   = (s,th,wg) => { const g=E.gLoc(s,th,m), mk=E.markLensed(wg,th,md(s),g);
      const it=(wg==='call')?Math.max(0,1-th/md(s)):Math.max(0,1-md(s)/th); return Math.max(0,mk-it); };
  const proxyW = (s,th)    => Math.abs(Math.log(th/md(s)));      // moneyness proxy θ/mode
  const F = (s,th,wg) => E.fundingPerStrike(s,th,wg,N,dt,kappa,orc,oi,m);

  // (FS.1 = property a) funding = 0 at ATM (strike = mode) for ALL w. A mark/ext weight FAILS (peaks at ATM).
  { let ok=true, det=[];
    for (const w of [0.5,0.6,0.7,0.8]) { const s=mkPool(10,100000,w), mo=md(s);
      if (Math.abs(F(s,mo,'put'))>1e-12 || Math.abs(F(s,mo,'call'))>1e-12) { ok=false; det.push('w='+w); }
      // negative control: shipped ext weight is NONZERO at ATM (would fund the money)
      if (!(extW(s,mo,'put')>1e-9)) det.push('NCa-broke@'+w); }
    chk('(FS.1/a) funding = 0 at ATM ∀w [same-slope; ext/mark weight FAILS: ext(ATM)>0]', ok, det.join(' ')||'0 ∀w'); }

  // (FS.2 = property b) KILLER — funding = 0 on UNLEANED w=½ pool at EVERY OTM strike, WITH S≠1.
  //   A moneyness proxy FAILS (θ/mode≠1 OTM even at w=½); the shipped ext·(S−1)/S FAILS (nonzero).
  { const s=mkPool(10,100000,0.5); let ok=true, det=[];
    for (const th of [0.1,0.3,0.5,0.7,0.9]) {            // all OTM for the put on a w=½ pool (mode=1)
      if (Math.abs(F(s,th,'put'))>1e-12) { ok=false; det.push('f@'+th); }
      if (!(proxyW(s,th)>1e-9))  det.push('NCproxy-broke@'+th);   // proxy must be NONZERO here (it fails b)
      if (!(extW(s,th,'put')>1e-9)) det.push('NCext-broke@'+th); }
    chk('(FS.2/b) KILLER: funding = 0 on w=½ pool ∀OTM with S≠1 [pool-lean signature; proxy & ext both FAIL b]',
        ok, det.join(' ')||('S='+(E.poolMark(s,orc,oi)/orc).toExponential(2)+' all f=0')); }

  // (FS.3 = property c) magnitude grows strictly with |w−½| at FIXED MONEYNESS ρ (θ = ρ·mode), both wings.
  { let ok=true, prevP=-1, prevC=-1, det=[];
    for (const w of [0.5,0.55,0.6,0.65,0.7,0.75,0.8]) { const s=mkPool(10,100000,w), mo=md(s);
      const fp=Math.abs(F(s,0.5*mo,'put')), fc=Math.abs(F(s,2*mo,'call'));   // ρ=0.5 put OTM, ρ=2 call OTM
      if (fp<prevP-1e-12 || fc<prevC-1e-12) { ok=false; det.push('nonmono@'+w); } prevP=fp; prevC=fc; }
    chk('(FS.3/c) funding magnitude strictly ↑ with |w−½| at fixed moneyness (put ρ=0.5, call ρ=2)', ok, det.join(' ')||'monotone'); }

  // (FS.4 = property d) funding = 0 ITM, both wings, leaned pool. (Subsumes/retains FE.1.)
  { const s=mkPool(10,100000,0.7), mo=md(s); let ok=true, det=[];
    for (const mult of [1.2,1.5,3.0]) if (Math.abs(F(s,mo*mult,'put'))>1e-12){ok=false;det.push('put@'+mult);}   // θ>mode ITM put
    for (const mult of [0.8,0.5,0.2]) if (Math.abs(F(s,mo*mult,'call'))>1e-12){ok=false;det.push('call@'+mult);} // θ<mode ITM call
    chk('(FS.4/d) funding = 0 ∀ITM both wings (leaned pool)', ok, det.join(' ')||'0 ITM'); }

  // (FS.5) SOURCE-TOKEN LOCK — weight IS the same-slope deviation, NOT ext, NOT (S−1)/S.
  //   Guards a silent revert of the WEIGHT even if numbers happen to line up on a fixture.
  { const src = grabFn(engineBody, 'fundingPerStrike') || '';
    const hasDev  = /\(\s*gA\s*-\s*g\s*\)\s*\/\s*\(\s*gA\s*\+\s*1\s*\)/.test(src)      // c = (g_a−g)/(g_a+1)
                 && /Math\.abs\(\s*c\s*\*\s*Math\.log\(\s*strike_theta\s*\/\s*mode\s*\)\s*\)/.test(src)
                 && /gA\s*=\s*tau/.test(src);
    const noExtWt = !/\*\s*ext\s*\*/.test(src);                                        // ext weight GONE
    const noPoolOracleWt = !/ext\s*\*\s*\(\s*S\s*-\s*1\s*\)/.test(src);                // ext·(S−1) GONE
    chk('(FS.5) source lock: weight = |c·ln(θ/mode)|, c=(g_a−g)/(g_a+1); NOT ext, NOT ext·(S−1)/S',
        hasDev && noExtWt && noPoolOracleWt, 'dev='+hasDev+' noExt='+noExtWt+' noPoolOracle='+noPoolOracleWt); }

  // (FS.6) COMBINED FINGERPRINT — (a)+(b) TOGETHER reject BOTH regressions, on ONE fixture set.
  //   mark/ext weight: FAILS (a) [ext(ATM)>0].   moneyness proxy: FAILS (b) [proxy(OTM,w=½)>0].
  //   same-slope: passes both. This is the unique fingerprint.
  { const sSym=mkPool(10,100000,0.5), moS=md(sSym);
    const markFailsA  = extW(sSym,moS,'put') > 1e-9;          // mark/ext nonzero at ATM  ⇒ can't be same-slope
    const proxyFailsB = proxyW(sSym,0.5) > 1e-9;              // proxy nonzero on w=½ OTM ⇒ can't be same-slope
    const sameSlopePassesBoth = Math.abs(F(sSym,moS,'put'))<=1e-12 && Math.abs(F(sSym,0.5,'put'))<=1e-12;
    chk('(FS.6) combined fingerprint: mark-weight FAILS(a), proxy-weight FAILS(b), same-slope PASSES both',
        markFailsA && proxyFailsB && sameSlopePassesBoth,
        'markFailsA='+markFailsA+' proxyFailsB='+proxyFailsB+' sameSlopeOK='+sameSlopePassesBoth); }
}

// ── (CM7) THE THREE CO-MOVE WITH m, SAME DIRECTION (locks a future polarity flip = FAIL) ──
// steeper g_loc (∝m) ; further θ_tx (mode·(chosen/mode)^m grows with m for a 2× pick) ;
// transact-where-it-looks (the chosen strike maps to a FURTHER-OUT true strike as m rises).
// All three must increase with m, monotonically, same sign. A future change that flips
// any of them (e.g. sharper⇒closer) FAILS here.
if (hasTradeMap) {
  const orc = 80000;
  const chosen = mode * 2;     // a 2× pick (call OTM)
  let gPrev = -Infinity, txPrev = -Infinity, gMono = true, txMono = true, rows = [];
  for (const m of [1, 2, 3, 4]) {
    const g = E.gLoc(s, chosen, m);                                  // steepness m·γ
    const lg = E.executeLeg(s, 'sell', 'call', chosen, NaN, 1, orc, m);
    const txRatio = lg.theta_tx / mode;                              // further-out factor
    if (!(g > gPrev)) gMono = false;
    if (!(txRatio > txPrev)) txMono = false;
    gPrev = g; txPrev = txRatio;
    rows.push('m=' + m + ': g_loc=' + g.toFixed(2) + ' θ_tx=' + txRatio.toFixed(2) + '×');
  }
  // explicit polarity lock: at the skeptic's worked point (γ=2 pool) m=1/2/3 ⇒
  // g_loc 2/4/6 and θ_tx 2×/4×/8× — both INCREASE with m (same direction).
  chk('(CM7) the three co-move with m SAME direction: g_loc↑ AND θ_tx↑ (polarity LOCKED; a future flip FAILS)',
      gMono && txMono, rows.join(' | ') + (gMono && txMono ? ' [steeper g_loc ⇒ further θ_tx, same sign]' : ' POLARITY BROKEN'));
}

// ── (CM8-v2) TRADE-POINT conservation law (operator entries 14/16/339; paper Eq. 2;
//    spec SPEC_tradepoint_conservation_2026-07-02 §3.1). RETIRES the old CM8
//    ("no curve change in the pool") — that intent is FALSE BY DESIGN now: the
//    live trade path applies the conservation law AT the trade point T = ray∩curve
//    and the global α,β genuinely move. The SPOT trio stays byte-identical (v2.1). ──
{
  // (1) spot trio byte-identical to v24 (tradeUpdate / arbitrageToOracle / rebase)
  let allId = true, lines = [];
  for (const fn of ['tradeUpdate', 'arbitrageToOracle', 'rebase']) {
    const id = grabFn(engineBody, fn) === grabFn(baseBody, fn);
    allId = allId && id; lines.push(fn + ':' + (id ? 'identical' : 'DIFF'));
  }
  chk('(CM8-v2.1) SPOT trio byte-identical to v24 (tradeUpdate/arbitrageToOracle/rebase)', allId, lines.join(' '));

  const hasAt = typeof E.tradeUpdateAt === 'function';
  // (2) THE EXHIBIT (paper §2.3, HARD): (x,y,w)=(10,10,½), ρ=4, dy=+1 ⇒
  //     w′ = 11/21, Δx = −5/22, x′ = 215/22, y′ = 11 — and NOT the naive
  //     global recompute 22/43 (nor today's old-law 6/11).
  {
    let d = 'tradeUpdateAt MISSING', ok = false;
    if (hasAt) {
      const p = E.tradeUpdateAt({ x: 10, y: 10, alpha: 5, beta: 5 }, 1, 4);
      if (p) {
        const w = p.alpha / p.x;
        const eW = Math.abs(w - 11 / 21), eX = Math.abs(p.x - 215 / 22), eDx = Math.abs((p.x - 10) + 5 / 22);
        const notNaive = Math.abs(w - 22 / 43) > 1e-3 && Math.abs(w - 6 / 11) > 1e-3;
        ok = eW <= 1e-15 && eX <= 1e-13 && p.y === 11 && eDx <= 1e-12 && notNaive;
        d = '|w′−11/21|=' + eW.toExponential(2) + ' |x′−215/22|=' + eX.toExponential(2) +
            ' y′=' + p.y + ' |Δx+5/22|=' + eDx.toExponential(2) + ' not-naive(22/43,6/11)=' + notNaive;
      } else d = 'tradeUpdateAt returned null on the exhibit';
    }
    chk('(CM8-v2.2) exhibit 11/21 HARD: w′=11/21 (≤1e-15), x′=215/22 (≤1e-13), y′==11, Δx=−5/22 — NOT naive 22/43 / old 6/11', ok, d);
  }
  // (3) ρ = 1 reduces EXACTLY to the shipped spot tradeUpdate (w × dy grid)
  {
    let maxRel = hasAt ? 0 : Infinity;
    if (hasAt) {
      for (const w of [0.3, 0.5, 0.6, 0.725]) {
        const st = mkPool(10, 80000, w);
        for (const dy of [1, -1, 100, -100, 5000, -5000, 0.5]) {
          const a = E.tradeUpdate(st, dy), b = E.tradeUpdateAt(st, dy, 1);
          if ((a === null) !== (b === null)) { maxRel = Infinity; break; }
          if (!a) continue;
          for (const k of ['x', 'y', 'alpha', 'beta'])
            maxRel = Math.max(maxRel, Math.abs(a[k] - b[k]) / Math.max(1, Math.abs(a[k])));
        }
      }
    }
    chk('(CM8-v2.3) ρ=1 reduction ≡ tradeUpdate on a w×dy grid (rel ≤1e-12; spot trades unchanged)',
        maxRel <= 1e-12, 'maxRel=' + (isFinite(maxRel) ? maxRel.toExponential(2) : 'INF/missing'));
  }
  // (4) local-pair conservation AT T: the single w′ conserves BOTH local pairs —
  //     (x_T+Δx)·w′ == α_T  AND  (y_T+dy)·(1−w′) == β_T  (grid, rel ≤1e-12)
  {
    let maxRel = hasAt ? 0 : Infinity, n = 0;
    if (hasAt) {
      for (const [X, Y, w] of [[10, 10, 0.5], [10, 8e5, 0.5], [10, 8e5, 0.6], [10, 80000, 0.725]]) {
        const st = mkPool(X, Y, w);
        for (const rho of [0.25, 0.5, 1, 1.69, 2, 4]) {
          for (const dyF of [0.1, -0.05, 0.01]) {
            const dy = dyF * Y;
            const p = E.tradeUpdateAt(st, dy, rho);
            if (!p) continue;
            n++;
            const xT = st.x * Math.pow(rho, w - 1), yT = st.y * Math.pow(rho, w);
            const aT = w * xT, bT = (1 - w) * yT;
            const dx = p.x - st.x, wP = p.alpha / p.x;
            const r1 = Math.abs((xT + dx) * wP - aT) / Math.abs(aT);
            const r2 = Math.abs((yT + dy) * (1 - wP) - bT) / Math.abs(bT);
            maxRel = Math.max(maxRel, r1, r2);
          }
        }
      }
    }
    chk('(CM8-v2.4) local-pair conservation at T: (x_T+Δx)w′=α_T ∧ (y_T+dy)(1−w′)=β_T on the grid (rel ≤1e-12)',
        maxRel <= 1e-12 && n > 30, 'maxRel=' + (isFinite(maxRel) ? maxRel.toExponential(2) : 'INF/missing') + ' points=' + n);
  }
  // (5) routing: executeLeg's pool swap IS the trade-point law (negative control:
  //     the pre-build HEAD fails exactly this — it still calls tradeUpdate(state, dy))
  {
    const elSrc = grabFn(engineBody, 'executeLeg') || '';
    const usesAt = /tradeUpdateAt\(state, dy/.test(elSrc);
    const noOld = !/tradeUpdate\(state, dy\)/.test(elSrc);
    chk('(CM8-v2.5) routing: executeLeg swaps via tradeUpdateAt(state, dy, ρ) and NOT tradeUpdate(state, dy)',
        usesAt && noOld, 'tradeUpdateAt-call=' + usesAt + ' old-spot-call-absent=' + noOld);
  }
}

// ── (CM9) NO leftover dead-lens design in the engine (the skeptic gate-problem lock) ──
// the constant-multiplier gLoc must NOT contain the old √(τ²+u²) kernel, hpTau, or
// a u-dependent factor; markEff/funding must route through the constant gLoc.
{
  const deadInGLoc = /hpTau|h′_τ|Math\.sqrt\([^)]*tau|\/\s*Math\.sqrt/.test(gLocSrc);
  const noHpExport = !/\bhpTau\b/.test(engineBody) && !/\bhTau\b/.test(engineBody);
  const meSrc = grabFn(engineBody, 'markEff') || '';
  const meUsesGLoc = /markLensed\(wing,\s*theta,\s*sNorm,\s*gLoc\(state,\s*theta,\s*\w+\)\)/.test(meSrc);
  chk('(CM9) NO dead √-lens kernel: gLoc has no hpTau/√(τ²+u²)/u-factor; hTau/hpTau dropped; markEff routes through gLoc',
      !deadInGLoc && noHpExport && meUsesGLoc,
      'gLoc-clean=' + !deadInGLoc + ' hpTau/hTau-removed=' + noHpExport + ' markEff-via-gLoc=' + meUsesGLoc);
}

// ── (CM10) sign table / American faithfulness — value ≥ intrinsic (the O2 witness) ──
// PKG-ITM v2 (spec §7.1). Intrinsic recomputed IN THE GATE from ρ (put
// max(0, 1−sNorm/θ), call max(0, 1−θ/sNorm)) — NOT read from the engine, and
// NON-tautological: no max() exists in markLensed (§3); the continuation side is
// the content, the intrinsic side degenerates to arm-identity by design.
// Grid = the 25-point entry-286 S/K grid + a wide log-spaced sweep; g ∈ {2,6} × wings.
{
  const grid286 = [1.5, 1.333, 1.2, 1.1, 1, 0.95, 0.9, 0.85, 0.82, 0.8, 0.78, 0.75,
                   0.7, 0.6667, 0.6, 0.5, 0.48, 0.46, 0.45, 0.444, 0.43, 0.4, 0.35, 0.3, 0.2];
  const sweep = []; for (let r = 0.02; r <= 50; r *= 1.35) sweep.push(r);
  let ok = true, worst = '', minDiff = Infinity, nPts = 0;
  for (const g of [2, 6]) {
    for (const wing of ['call', 'put']) {
      const theta = 1.0;
      const seam = wing === 'put' ? g / (g + 1) : (g + 1) / g;
      for (const rho of grid286.concat(sweep)) {
        const sNorm = rho * theta;
        const v = E.markLensed(wing, theta, sNorm, g);
        const intr = wing === 'put' ? Math.max(0, 1 - sNorm / theta) : Math.max(0, 1 - theta / sNorm);
        const diff = v - intr; nPts++;
        if (diff < minDiff) minDiff = diff;
        if (!(diff >= -1e-12)) { ok = false; worst = 'BELOW-INTRINSIC ' + wing + ' g=' + g + ' ρ=' + rho + ' diff=' + diff; }
        const inIntrinsic = wing === 'put' ? (rho <= seam) : (rho >= seam);
        if (inIntrinsic) {
          if (!(Math.abs(diff) <= 1e-12)) { ok = false; worst = 'intrinsic-arm ' + wing + ' g=' + g + ' ρ=' + rho + ' diff=' + diff; }
        } else if (!(diff > 0)) { ok = false; worst = 'continuation not strictly > intrinsic ' + wing + ' g=' + g + ' ρ=' + rho + ' diff=' + diff; }
      }
    }
  }
  chk('(CM10) value ≥ intrinsic on the full grid (O2 witness, intrinsic recomputed in-gate): strict >0 in continuation, ==0 (≤1e-12) at/past the seam',
      ok, 'points=' + nPts + ' minDiff=' + minDiff.toExponential(2) + (ok ? '' : ' worst=' + worst));
}

// ── (CM11) OTM wing exact power-law of exponent g = m·γ ──
// PKG-ITM v2 (spec §7.1): the continuation is an EXACT power law in ρ — put
// V(2ρ)/V(ρ) == 2^(−g), call V(2ρ)/V(ρ) == 2^(+g) (both points in continuation).
// Locks the (K/S)^g wing shape the entry-286 finding showed missing.
{
  let maxRel = 0, worst = '';
  const theta = 0.8;   // non-unit ray: locks the ratio in ρ = sNorm/θ, not raw sNorm
  for (const g of [2, 6]) {
    for (const rho of [1.1, 3.7]) {      // put continuation: ρ > g/(g+1); 2ρ too
      const r = E.markLensed('put', theta, 2 * rho * theta, g) / E.markLensed('put', theta, rho * theta, g);
      const rel = Math.abs(r - Math.pow(2, -g)) / Math.pow(2, -g);
      if (rel > maxRel) { maxRel = rel; worst = 'put g=' + g + ' ρ=' + rho; }
    }
    for (const rho of [0.25, 0.5]) {     // call continuation: ρ ≤ (g+1)/g; 2ρ ≤ 7/6 ok
      const r = E.markLensed('call', theta, 2 * rho * theta, g) / E.markLensed('call', theta, rho * theta, g);
      const rel = Math.abs(r - Math.pow(2, g)) / Math.pow(2, g);
      if (rel > maxRel) { maxRel = rel; worst = 'call g=' + g + ' ρ=' + rho; }
    }
  }
  chk('(CM11) OTM wing exact power-law: put V(2ρ)/V(ρ)=2^(−g), call =2^(+g) (g∈{2,6}, rel ≤1e-12)',
      maxRel < 1e-12, 'maxRelErr=' + maxRel.toExponential(2) + (worst ? ' worst=' + worst : ''));
}

// ════════════════════════════════════════════════════════════════════════════
//  (RB) REBASE anti-regression LOCK — operator entry 466 (40+ historical rebase
//  regressions ⇒ a PERMANENT behavioral gate). Design + measured residuals:
//  research-lead notes/research/VERIFY_rebase_rigorous_2026-07-07.md §4 (splice-ready,
//  mutant-validated). NO engine change — the live rebase is verified CLEAN; this LOCKS it.
//
//  Live map (engine line ~1765):  rebase(s, r) = { x: s.x·r, y: s.y, alpha: s.alpha·r, beta: s.beta }
//  ⇒ x→r·x, α→r·α, y & β invariant (r = S_new/S_old). It is a CLEAN GAUGE MOVE: every
//  normalized/economic quantity is rebase-invariant to machine-eps, the price coordinate
//  scales 1/r and depth scales r^w exactly, it commutes with BOTH trade laws, group/
//  identity/inverse hold, and funding is rebase-silent (dev is shape-keyed, w invariant).
//
//  WHY THIS GATE EXISTS: faith_rebase.js SKIPs on v28 (it was written for the GH ghCalibrate
//  build) — so before this lock the ONLY live rebase coverage was a source byte-identity check
//  (fragile: any behavior-preserving refactor reds it, any byte-preserving behavior break passes).
//  RB.* replaces that hole with SIX behavioral, NEGATIVE-CONTROLLED checks.
//
//  The four scalar-transform regression modes (rebasing note §3) + additive + moneyness-funding,
//  reproduced in-gate as PURE mutant transforms (the engine is never mutated):
//    M1 y→r·y (y wrongly scaled)   M2 drop α-scale   M3 β→r·β (β wrongly scaled)
//    M4 x-unscaled                 M5 additive not × (x→x+r, α→α+r)
//  ⚠ The β-class (M3) SLIPS every pool-intrinsic read (getW/getSNorm/getMP_raw/getDepth never
//    read β) ⇒ RB.2 (field bit-exact) and RB.5 (trade-commute) are the MANDATORY β-killers.
//  ⚠ RB.6(ii) is the symmetric-pool-funding KILLER: the recurring ~20–30× regression funds a
//    w=½ pool via a moneyness/value or (S−1) weight; the pool-lean c=(g_a−g)/(g_a+1) forces the
//    correct zero. Each RB.k PASSES iff the REAL rebase is clean AND the note-mapped mutant FIRES
//    (so a green RB line simultaneously proves real-clean and that the negative control has teeth).
if (typeof E.rebase === 'function') {
  const RTOL = 1e-12;                                     // measured worst 1.7e-15 ⇒ ~3 orders headroom
  const mkP = (w, x, o) => { const y = o * (1 - w) * x / w; return { x, y, alpha: w * x, beta: (1 - w) * y }; };
  const GW = [0.5, 0.6, 0.42], GR = [0.5, 0.8, 1.1, 2, 5], GM = [1, 2, 3], GO = [80000, 120000];
  const OI = 100000, Nf = 1, dtf = 1, kf = 1;
  const rrel = (a, b) => Math.abs(a - b) / Math.max(1e-300, Math.abs(b));
  const rfield = (a, b) => Math.max(rrel(a.x, b.x), rrel(a.y, b.y), rrel(a.alpha, b.alpha), rrel(a.beta, b.beta));

  const rbReal = (s, r) => E.rebase(s, r);
  const rbM1 = (s, r) => ({ x: s.x * r, y: s.y * r, alpha: s.alpha * r, beta: s.beta });   // y wrongly scaled
  const rbM2 = (s, r) => ({ x: s.x * r, y: s.y, alpha: s.alpha, beta: s.beta });           // α not scaled
  const rbM3 = (s, r) => ({ x: s.x * r, y: s.y, alpha: s.alpha * r, beta: s.beta * r });   // β wrongly scaled
  const rbM4 = (s, r) => ({ x: s.x, y: s.y, alpha: s.alpha * r, beta: s.beta });           // x not scaled
  const rbM5 = (s, r) => ({ x: s.x + r, y: s.y, alpha: s.alpha + r, beta: s.beta });       // additive not ×

  // property predicates (true = the invariant HOLDS for rebase fn `rb`)
  const p1 = (rb) => {                                    // pool-intrinsic gauge degrees
    for (const w of GW) for (const o of GO) for (const r of GR) {
      const s = mkP(w, 10, o), sr = rb(s, r);
      if (rrel(E.getW(sr), E.getW(s)) > RTOL) return false;                                 // deg 0
      if (rrel(E.getSNorm(sr), E.getSNorm(s)) > RTOL) return false;                         // deg 0 (mode)
      if (rrel(E.getMP_raw(sr) * r, E.getMP_raw(s)) > RTOL) return false;                   // scales 1/r
      if (rrel(E.getDepth(sr) / Math.pow(r, E.getW(s)), E.getDepth(s)) > RTOL) return false;// scales r^w
      if (rrel(E.poolMark(sr, r * o, OI), E.poolMark(s, o, OI)) > RTOL) return false;       // paired-oracle invariant
    }
    return true;
  };
  const p2 = (rb) => {                                    // bookkeeping BIT-EXACT (β-class killer)
    for (const w of GW) for (const o of GO) for (const r of GR) {
      const s = mkP(w, 10, o), sr = rb(s, r);
      if (!(sr.x === s.x * r && sr.y === s.y && sr.alpha === s.alpha * r && sr.beta === s.beta)) return false;
    }
    return true;
  };
  const p3 = (rb) => {                                    // carried-strike invariance (θ→θ/r killer)
    for (const w of GW) for (const o of GO) for (const r of GR) for (const m2 of GM) {
      const s = mkP(w, 10, o), sr = rb(s, r);
      const moS = E.getSNorm(s), moSr = E.getSNorm(sr);
      for (const kfac of [0.7, 1.0, 1.3]) for (const wing of ['call', 'put']) {
        const K = kfac * o, rayS = K / o, raySr = (r * K) / (r * o);                        // dollar strike carried K→r·K
        const vS = E.markLensed(wing, rayS, moS, E.gLoc(s, rayS, m2));
        const vSr = E.markLensed(wing, raySr, moSr, E.gLoc(sr, raySr, m2));
        if (rrel(vSr, vS) > RTOL) return false;
      }
    }
    return true;
  };
  const p4 = (rb) => {                                    // group / identity / inverse
    for (const w of GW) for (const o of GO) {
      const s = mkP(w, 10, o), id = rb(s, 1);
      if (!(id.x === s.x && id.y === s.y && id.alpha === s.alpha && id.beta === s.beta)) return false;
      for (const r1 of GR) {
        if (rfield(rb(rb(s, r1), 1 / r1), s) > RTOL) return false;                          // inverse
        for (const r2 of GR) if (rfield(rb(rb(s, r1), r2), rb(s, r1 * r2)) > RTOL) return false; // group law
      }
    }
    return true;
  };
  const p5 = (rb) => {                                    // trade/rebase commute (SPOT + live tradeUpdateAt)
    for (const w of GW) for (const o of GO) for (const r of GR) {
      const s = mkP(w, 10, o);
      for (const dy of [5000, -3000, 20000]) {
        const a1 = E.tradeUpdate(s, dy);
        if (a1) { const A = rb(a1, r), B = E.tradeUpdate(rb(s, r), dy); if (!B) return false; if (rfield(A, B) > RTOL) return false; }
      }
      for (const rho of [1, 2, 0.5]) for (const dy of [5000, -3000, 20000]) {
        const a1 = E.tradeUpdateAt(s, dy, rho);
        if (a1) { const A = rb(a1, r), B = E.tradeUpdateAt(rb(s, r), dy, rho); if (!B) return false; if (rfield(A, B) > RTOL) return false; }
      }
    }
    return true;
  };
  const p6inv = (rb) => {                                 // funding rebase-silence, FROZEN stored ray (fundingTick)
    for (const w of GW) for (const o of GO) for (const r of GR) for (const m2 of GM) {
      const s = mkP(w, 10, o), sr = rb(s, r);
      for (const th of [0.3, 0.7, 1.3, 2.5]) for (const wing of ['call', 'put']) {
        const fS = E.fundingPerStrike(s, th, wing, Nf, dtf, kf, o, OI, m2);
        const fSr = E.fundingPerStrike(sr, th, wing, Nf, dtf, kf, r * o, OI, m2);           // θ frozen, oracle→r·o
        if (rrel(fSr, fS) > RTOL) return false;
      }
    }
    return true;
  };
  // funding killers (do not depend on rebase): symmetric-pool-is-zero + ATM-is-zero
  const rb6kill = () => {
    for (const o of GO) for (const m2 of GM) { const s = mkP(0.5, 10, o);
      for (const th of [0.1, 0.3, 0.7, 1.3, 2.5]) for (const wing of ['call', 'put'])
        if (Math.abs(E.fundingPerStrike(s, th, wing, Nf, dtf, kf, o, OI, m2)) > RTOL) return false; }
    return true;
  };
  const rb6atm = () => {
    for (const w of GW) for (const o of GO) for (const m2 of GM) { const s = mkP(w, 10, o), mo = E.getSNorm(s);
      for (const wing of ['call', 'put'])
        if (Math.abs(E.fundingPerStrike(s, mo, wing, Nf, dtf, kf, o, OI, m2)) > RTOL) return false; }
    return true;
  };
  // moneyness-funding regression (weight |ln ρ| WITHOUT the pool-lean c factor) — NONZERO on the
  // symmetric pool OTM ⇒ the RB.6(ii) killer has teeth (the correct dev = |c·lnρ| is 0 at w=½, c=0).
  const rb6ncFires = () => { const s = mkP(0.5, 10, 100000), mo = E.getSNorm(s);
    for (const th of [0.1, 0.3, 0.7, 1.3, 2.5]) {
      const g = E.gLoc(s, th, 2), intr = Math.max(0, 1 - mo / th);
      const dev = (intr > 0 || !(mo > 0) || !(th > 0)) ? 0 : Math.abs(Math.log(th / mo));
      if (Math.abs(kf * (-g) * Nf * dev * dtf) > 1e-9) return true;
    }
    return false;
  };

  // ── (RB.1) pool-intrinsic gauge degrees invariant (w/mode deg 0; getMP_raw 1/r; depth r^w; poolMark) ──
  chk('(RB.1) pool-intrinsic gauge degrees: getW/getSNorm/poolMark invariant, getMP_raw·r & getDepth/r^w invariant (NC: M1/M2/M4/M5 fire; M3 β-class SLIPS — caught by RB.2/RB.5)',
      p1(rbReal) && !p1(rbM1) && !p1(rbM2) && !p1(rbM4) && !p1(rbM5),
      'real=' + p1(rbReal) + ' fires M1=' + !p1(rbM1) + ' M2=' + !p1(rbM2) + ' M4=' + !p1(rbM4) + ' M5=' + !p1(rbM5) + ' M3slips=' + p1(rbM3));

  // ── (RB.2) bookkeeping BIT-EXACT (the β-class killer — mandatory) ──
  chk('(RB.2) bookkeeping bit-exact: sr.x===x·r ∧ sr.y===y ∧ sr.α===α·r ∧ sr.β===β (β-class KILLER; NC: M1/M2/M3 all fire)',
      p2(rbReal) && !p2(rbM1) && !p2(rbM2) && !p2(rbM3),
      'real=' + p2(rbReal) + ' fires M1=' + !p2(rbM1) + ' M2=' + !p2(rbM2) + ' M3(β)=' + !p2(rbM3));

  // ── (RB.3) carried-strike invariance (dollar K→r·K under the reframe ⇒ mark invariant) ──
  chk('(RB.3) carried-strike (K→r·K) markLensed invariant both wings, K∈{0.7,1,1.3}·o (θ→θ/r killer; NC: M4/M5 fire)',
      p3(rbReal) && !p3(rbM4) && !p3(rbM5),
      'real=' + p3(rbReal) + ' fires M4=' + !p3(rbM4) + ' M5=' + !p3(rbM5));

  // ── (RB.4) group / identity / inverse ──
  chk('(RB.4) group rebase(rebase(s,r1),r2)=rebase(s,r1·r2), rebase(s,1)===s, rebase(rebase(s,r),1/r)=s (NC: M5 additive fires)',
      p4(rbReal) && !p4(rbM5),
      'real=' + p4(rbReal) + ' fires M5=' + !p4(rbM5));

  // ── (RB.5) trade/rebase commute — SPOT tradeUpdate AND live tradeUpdateAt (β-class second net) ──
  chk('(RB.5) rebase∘tradeUpdate = tradeUpdate∘rebase AND same for tradeUpdateAt(·,dy,ρ) fixed ρ (β-class KILLER via β in hyperbola; NC: M3 fires)',
      p5(rbReal) && !p5(rbM3),
      'real=' + p5(rbReal) + ' fires M3(β)=' + !p5(rbM3));

  // ── (RB.6) funding rebase-silence + the symmetric-pool KILLER + ATM-zero ──
  if (typeof E.fundingPerStrike === 'function') {
    chk('(RB.6) funding rebase-silent (frozen stored ray) ∧ =0 on w=½ pool ∀OTM (KILLER) ∧ =0 at ATM (NC: moneyness weight ≠0 on w=½ OTM; M4 breaks silence)',
        p6inv(rbReal) && rb6kill() && rb6atm() && rb6ncFires() && !p6inv(rbM4),
        'silence=' + p6inv(rbReal) + ' w½-zero=' + rb6kill() + ' atm-zero=' + rb6atm() + ' moneyness-NC-fires=' + rb6ncFires() + ' silence-M4-fires=' + !p6inv(rbM4));
  } else {
    chk('(RB.6) funding rebase-silence + symmetric-pool killer', false, 'fundingPerStrike MISSING on a lens build');
  }
}

console.log('=== lens_selfcheck: ' + pass + ' PASS, ' + fail + ' FAIL ===');
process.exit(fail === 0 ? 0 : 1);

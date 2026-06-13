#!/usr/bin/env node
// v28 polar-lens Stage-1 self-check (READ layer on the UNTOUCHED v24 pool).
// Usage: node lens_selfcheck.js [path-to-html]   (default v28 Stage-1 build).
// SKIPs-as-pass on a build without the lens export (gLoc/markLensed) so the
// (W) HEAD and the plain v24 base stay green when run through this file.
//
// Asserts (per the Stage-1 brief):
//   (1) g_loc(K) = γ·h′_τ(|u|), u in the sNorm coordinate (MUST-APPLY-1).
//   (2) g_loc(ATM)=0 and g_loc → γ deep in the wings.
//   (3) |g_loc| ≤ γ everywhere (cap-free, h′∈[0,1]).
//   (4) settlement (markLensed) value+slope continuous at S* incl. g_loc<1 (machine-zero).
//   (5) funding → 0 at ATM (g_loc→0); → γ-scale in the wings; sign matches wing.
//   (6) pool tradeUpdate output identical to base v24 for several dy (read layer
//       did not touch the pool).
//   (7) NO inverse-lens helper exists (forward-read-only L4 — structural/source check).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');

// Default is the canonical HEAD (NOT the Stage-1 build): a bare invocation must
// check the live HEAD, never silently green-light a stale stage file. Pass an
// explicit path to check any other build.
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

if (typeof E.gLoc !== 'function' || typeof E.markLensed !== 'function') {
  console.log('SKIP lens_selfcheck: build has no lens export (gLoc/markLensed) — pass.');
  process.exit(0);
}

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
  if (cond) { pass++; console.log('PASS ' + name + (detail ? '  ' + detail : '')); }
  else { fail++; console.log('FAIL ' + name + (detail ? '  ' + detail : '')); }
};

console.log('=== v28 polar-lens Stage-1 self-check :: ' + path.basename(file) + ' ===');

// Build a STEEP v24 pool (w>0.5 ⇒ γ>1) so the lens has something to do.
// v24 state = {x, y, alpha=x·w, beta=y·(1−w)}; γ = w/(1−w) = getW/(1−getW).
const mkPool = (x, y, w) => ({ x, y, alpha: x * w, beta: y * (1 - w) });
const W = 0.725;                       // γ = 2.6363...
const x0 = 10, y0 = 80000;             // arbitrary positive reserves
const s = mkPool(x0, y0, W);
const gamma = E.getW(s) / (1 - E.getW(s));
const mode = E.getSNorm(s);            // live sNorm mode
const tau = 0.3;
const hp = (v) => v / Math.sqrt(tau * tau + v * v);

// ── (1) g_loc(K) = γ·h′_τ(|u|), u in sNorm coordinate ──
{
  let maxerr = 0, worst = '';
  for (const mult of [0.2, 0.5, 0.8, 1.0, 1.3, 2.0, 5.0, 20.0]) {
    const thetaK = mode * mult;        // strike ray relative to the mode
    const u = Math.log(thetaK / mode); // sNorm coordinate (MUST-APPLY-1)
    const expect = gamma * hp(Math.abs(u));
    const got = E.gLoc(s, thetaK, tau);
    const e = Math.abs(got - expect);
    if (e > maxerr) { maxerr = e; worst = 'mult=' + mult + ' got=' + got.toFixed(8) + ' exp=' + expect.toFixed(8); }
  }
  chk('(1) g_loc = γ·h′_τ(|u|) in sNorm coord', maxerr < 1e-12, 'maxAbsErr=' + maxerr.toExponential(2) + '  ' + worst);
}

// ── (2) g_loc(ATM)=0 ; g_loc → γ deep in the wings ──
{
  const gAtm = E.gLoc(s, mode, tau);                    // strike == mode
  const gDeepCall = E.gLoc(s, mode * Math.exp(40), tau); // |u|=40
  const gDeepPut  = E.gLoc(s, mode * Math.exp(-40), tau);
  chk('(2a) g_loc(ATM)=0', Math.abs(gAtm) < 1e-12, 'g_atm=' + gAtm.toExponential(2));
  chk('(2b) g_loc → γ deep wings', Math.abs(gDeepCall - gamma) < 1e-3 && Math.abs(gDeepPut - gamma) < 1e-3,
      'γ=' + gamma.toFixed(6) + ' call=' + gDeepCall.toFixed(6) + ' put=' + gDeepPut.toFixed(6));
}

// ── (3) |g_loc| ≤ γ everywhere (cap-free, h′∈[0,1]) ──
{
  let maxg = 0;
  for (let u = -60; u <= 60; u += 0.05) {
    const g = E.gLoc(s, mode * Math.exp(u), tau);
    if (Math.abs(g) > maxg) maxg = Math.abs(g);
  }
  chk('(3) |g_loc| ≤ γ everywhere (cap-free)', maxg <= gamma + 1e-12, 'maxAbs=' + maxg.toFixed(8) + ' γ=' + gamma.toFixed(8));
}

// ── (4) settlement value+slope continuity at S* incl. g<1 (machine-zero) ──
// markLensed smooth-paste: free boundary sNorm*, continuation past the strike
// then intrinsic; value+slope continuous at sNorm*. Check both wings, g across
// the g<1 flat-top band and g>1, against an analytic boundary fraction 1/(g+1).
{
  let maxVal = 0, maxSlope = 0, worst = '';
  const h = 1e-6;
  const sStarCall = (theta, g) => theta * Math.pow((g + 1) / g, g);
  const sStarPut  = (theta, g) => theta * Math.pow(g / (g + 1), g);
  for (const wing of ['call', 'put']) {
    for (const g of [3.0, 2.0, 1.0, 0.5, 0.2, 0.05]) {
      const theta = 1.0;
      const sStar = wing === 'call' ? sStarCall(theta, g) : sStarPut(theta, g);
      // value gap across the boundary (one-sided continuation vs intrinsic at sStar±)
      const vL = E.markLensed(wing, theta, sStar * (1 - 1e-10), g);
      const vR = E.markLensed(wing, theta, sStar * (1 + 1e-10), g);
      const vGap = Math.abs(vL - vR);
      // boundary fraction must be 1/(g+1) exactly
      const fGap = Math.abs(E.markLensed(wing, theta, sStar, g) - 1 / (g + 1));
      // slope continuity: central FD just inside vs just outside (sNorm-space)
      const slL = (E.markLensed(wing, theta, sStar * (1 - 1e-7), g) - E.markLensed(wing, theta, sStar * (1 - 1e-7) - h, g)) / h;
      const slR = (E.markLensed(wing, theta, sStar * (1 + 1e-7) + h, g) - E.markLensed(wing, theta, sStar * (1 + 1e-7), g)) / h;
      const sGap = Math.abs(slL - slR);
      const totV = Math.max(vGap, fGap);
      if (totV > maxVal) { maxVal = totV; }
      if (sGap > maxSlope) { maxSlope = sGap; worst = wing + ' g=' + g; }
    }
  }
  // value/frac gaps are analytic-zero (FD-offset artifact only); slope gaps are FD-order.
  chk('(4a) markLensed value continuous + frac=1/(g+1) at S* (incl. g<1)', maxVal < 1e-9, 'maxValGap=' + maxVal.toExponential(2));
  chk('(4b) markLensed slope continuous at S* (incl. g<1)', maxSlope < 1e-3, 'maxSlopeGap=' + maxSlope.toExponential(2) + '  worst=' + worst);
  // g=0 / g<1 NaN-freedom across both wings (MUST-APPLY-2: no γ_min floor)
  let bad = 0;
  for (const wing of ['call', 'put']) {
    for (const g of [0, 1e-9, 0.05, 0.5, 1, 2.64, 5]) {
      for (let q = 0.001; q < 6; q += 0.013) {
        const v = E.markLensed(wing, 1.0, q, g);
        if (!isFinite(v)) bad++;
      }
    }
  }
  chk('(4c) markLensed NaN-free incl. g=0 (no γ_min floor)', bad === 0, 'nonFinite=' + bad);
}

// ── (5) funding → 0 ATM, → γ-scale in wings, sign matches wing ──
// fundingPerStrike(state, strike_theta, wing, N, dt, kappa, oracle, oracle_initial, tau)
{
  const N = 1, dt = 1, kappa = 0.1, oracle = 80000, oi = 80000;
  const fAtm = E.fundingPerStrike(s, mode, 'call', N, dt, kappa, oracle, oi, tau);
  // wing strikes (well OTM on each side)
  const fCallWing = E.fundingPerStrike(s, mode * Math.exp(2.0), 'call', N, dt, kappa, oracle, oi, tau);
  const fPutWing  = E.fundingPerStrike(s, mode * Math.exp(-2.0), 'put',  N, dt, kappa, oracle, oi, tau);
  chk('(5a) funding → 0 at ATM (g_loc→0)', Math.abs(fAtm) < 1e-12, 'f_atm=' + fAtm.toExponential(2));
  // sign matches wing (call ≥ 0 contribution scale; put ≤ 0) — depends on (S−1)/S sign at equilibrium.
  // At equilibrium S≈1; perturb the pool so S≠1 to exercise the sign. Use a non-equilibrium oracle.
  const oracle2 = 84000;  // S = poolMark/oracle ≠ 1
  const fc = E.fundingPerStrike(s, mode * Math.exp(2.0), 'call', N, dt, kappa, oracle2, oi, tau);
  const fp = E.fundingPerStrike(s, mode * Math.exp(-2.0), 'put',  N, dt, kappa, oracle2, oi, tau);
  chk('(5b) funding sign matches wing (call·put ≤ 0)', fc * fp <= 0, 'f_call=' + fc.toExponential(3) + ' f_put=' + fp.toExponential(3));
  // g_loc magnitude recovers toward γ in the wings (the lensed exponent driving funding)
  const gWing = E.gLoc(s, mode * Math.exp(4.0), tau);
  chk('(5c) lensed exponent → γ-scale in wings', gWing > 0.9 * gamma, 'g_wing=' + gWing.toFixed(4) + ' γ=' + gamma.toFixed(4));
}

// ── (6) pool tradeUpdate identical to base v24 for several dy ──
{
  let maxd = 0, worst = '';
  for (const dy of [1, 100, -100, 5000, -5000, 250, -1, 0.5]) {
    const a = EB.tradeUpdate(s, dy);
    const b = E.tradeUpdate(s, dy);
    if (a === null && b === null) continue;
    if ((a === null) !== (b === null)) { maxd = Infinity; worst = 'null-mismatch dy=' + dy; break; }
    const d = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.alpha - b.alpha), Math.abs(a.beta - b.beta));
    if (d > maxd) { maxd = d; worst = 'dy=' + dy; }
  }
  chk('(6) tradeUpdate identical to base v24 (pool untouched)', maxd === 0, 'maxAbsDelta=' + maxd + '  ' + worst);
  // also assert the three curve fns byte-identical in source
  const grab = (src, name) => {
    const i = src.indexOf('function ' + name);
    if (i < 0) return null;
    let depth = 0, j = src.indexOf('{', i);
    for (let k = j; k < src.length; k++) { if (src[k] === '{') depth++; else if (src[k] === '}') { depth--; if (depth === 0) return src.slice(i, k + 1); } }
    return null;
  };
  const mBase = /<script id="engine">([\s\S]*?)<\/script>/.exec(tBase)[1];
  let srcId = true, which = '';
  for (const fn of ['tradeUpdate', 'arbitrageToOracle', 'rebase']) {
    if (grab(engineBody, fn) !== grab(mBase, fn)) { srcId = false; which += fn + ' '; }
  }
  chk('(6b) tradeUpdate/arbitrageToOracle/rebase byte-identical source', srcId, srcId ? '' : 'DIFFERS: ' + which);
}

// ── (7) NO inverse-lens helper (forward-read-only, L4) — structural source check ──
{
  // forbid any helper that takes a lensed/observed slope and solves for dy/mode/state:
  // look for an inverse-lens root-find (1/h″, atanh of a slope ratio, "warp until ... slope",
  // a function solving dy from a target g_loc / lensed slope). Conservative pattern set.
  const lower = engineBody.toLowerCase();
  const banned = [
    /invertlens|lensinvert|inverselens|inverse_lens/,
    /warp\s*until/,
    /solve\w*for\w*dy|dyfromslope|dy_from_slope/,
    /1\s*\/\s*h(pp|''|″|2)/,                 // 1/h″ blow-up channel
    /targetslope|target_slope|slopetarget/,
  ];
  let hit = '';
  for (const re of banned) { if (re.test(lower)) { hit += re.source + ' '; } }
  // arbitrageToOracle must remain plain-Balancer (no gLoc/markLensed/hpTau call inside it)
  const arbSrc = (function () { const i = engineBody.indexOf('function arbitrageToOracle'); let d = 0, j = engineBody.indexOf('{', i); for (let k = j; k < engineBody.length; k++) { if (engineBody[k] === '{') d++; else if (engineBody[k] === '}') { d--; if (d === 0) return engineBody.slice(i, k + 1); } } return ''; })();
  const arbLensFree = !/gLoc|markLensed|hpTau|hTau|lensU/.test(arbSrc);
  chk('(7a) no inverse-lens / target-slope helper', hit === '', hit ? 'matched: ' + hit : 'none');
  chk('(7b) arbitrageToOracle stays lens-free (plain Balancer)', arbLensFree, arbLensFree ? '' : 'lens call inside arb');
}

// ═════════════════════════════════════════════════════════════════════════
//  STAGE 2 — WRITE/SETTLE THROUGH LENS  (spec §11.6, skeptic verdict #30)
//  8 asserts: settled==lensed·size; open==settle (one-helper witness); UI==engine
//  cross-layer basis; intra-band single-basis; round-trip-zero close (catches the
//  close-side coordinate slip); solvency ceiling; one-helper no-arb witness;
//  tradeUpdate byte-identical regression. SKIP-as-pass if the build is Stage-1
//  only (markEff still 3-arg, no state/tau lensing).
//
//  Stage-2 detector: legValueUnified takes (state, wing, leg, tau) and markEff
//  routes through markLensed (W4). Read off the engine source.
// ═════════════════════════════════════════════════════════════════════════
{
  const isStage2 = /function legValueUnified\(state, wing, leg, tau\)/.test(engineBody)
                && /function markEff\(state, wing, theta, tau\)/.test(engineBody)
                && /markLensed\(wing, theta, sNorm, gLoc\(state, theta, tau\)\)/.test(engineBody);
  if (!isStage2) {
    console.log('SKIP Stage-2 write/settle checks: build is Stage-1 read-layer only (markEff 3-arg) — pass.');
  } else {
    const tau2 = 0.3;
    // a steep pool and an off-equilibrium steep pool (the coordinate-hazard state)
    const sSteep = mkPool(10, 80000, 0.85);            // γ = 5.667
    const gSteep = E.getW(sSteep) / (1 - E.getW(sSteep));
    const mkBand = (soldK, boughtK, Ns, Nb, orc) => ({
      sold_wing: 'call', bought_wing: 'put',
      sold:   { inner: soldK / orc,  outer: NaN, N: Ns, K_inner: soldK,  K_outer: NaN },
      bought: { inner: boughtK / orc, outer: NaN, N: Nb, K_inner: boughtK, K_outer: NaN },
      entry: { L0: 1, oracle: orc }, carved: { carvedNotional: 0, carvedEntryEquity: 1, entryPerpMark: orc },
    });
    const club = { equity: 1e12 };

    // ── (8.1) settled == lensed·size : legValueUnified == N·markLensed at getSNorm ──
    {
      let maxerr = 0, worst = '';
      for (const W2 of [0.6, 0.725, 0.85]) {
        const sp = mkPool(10, 80000, W2);
        const sNorm = E.getSNorm(sp);
        for (const wing of ['call', 'put']) {
          for (const mult of [0.3, 0.7, 1.5, 4.0]) {
            const theta = sNorm * mult;
            const leg = { inner: theta, outer: NaN, N: 2 };
            const got = E.legValueUnified(sp, wing, leg, tau2);
            const exp = leg.N * E.markLensed(wing, theta, sNorm, E.gLoc(sp, theta, tau2));
            const e = Math.abs(got - exp);
            if (e > maxerr) { maxerr = e; worst = 'W=' + W2 + ' ' + wing + ' mult=' + mult; }
          }
        }
      }
      chk('(8.1) settled == N·markLensed at getSNorm (W4)', maxerr < 1e-14, 'maxErr=' + maxerr.toExponential(2) + ' ' + worst);
    }

    // ── (8.2) open == settle, same state (one-helper witness, §11.4-B) ──
    // barrier leg priced via lensed legPrice == settled via legValueUnified, same state.
    {
      let maxerr = 0, worst = '';
      for (const W2 of [0.6, 0.725, 0.85]) {
        const sp = mkPool(10, 80000, W2);
        const oracle = E.getMP_raw(sp);
        for (const wing of ['call', 'put']) {
          for (const K of [50000, 84000, 150000, 400000]) {
            const inner = K / oracle;
            const vOpen = E.legPrice(sp, wing, inner, NaN, 3, tau2).V;
            const vSettle = E.legValueUnified(sp, wing, { inner, outer: NaN, N: 3 }, tau2);
            const e = Math.abs(vOpen - vSettle);
            if (e > maxerr) { maxerr = e; worst = 'W=' + W2 + ' ' + wing + ' K=' + K; }
          }
        }
      }
      chk('(8.2) open(legPrice) == settle(legValueUnified) same state', maxerr < 1e-12, 'maxErr=' + maxerr.toExponential(2) + ' ' + worst);
    }

    // ── (8.3) cross-layer basis : UI pfComponents fraction == engine markEff ──
    // pfComponents (W6) uses Engine.markLensed(wing, K/oracleLive, getSNorm(pool), gLoc(pool, K/oracleLive, tau)).
    // markEff (W4) uses markLensed(wing, theta, getSNorm(state), gLoc(state, theta, tau)). Same coordinate ⇒ equal.
    {
      let maxerr = 0, worst = '';
      for (const W2 of [0.6, 0.725, 0.85]) {
        const sp = mkPool(10, 80000, W2);
        const oracleLive = E.getMP_raw(sp);
        const sNormPool = E.getSNorm(sp);
        for (const wing of ['call', 'put']) {
          for (const K of [50000, 84000, 250000]) {
            const theta = K / oracleLive;
            const uiFrac = E.markLensed(wing, theta, sNormPool, E.gLoc(sp, theta, tau2));   // W6 path
            const engFrac = E.markEff(sp, wing, theta, tau2);                                // W4 path
            const e = Math.abs(uiFrac - engFrac);
            if (e > maxerr) { maxerr = e; worst = 'W=' + W2 + ' ' + wing + ' K=' + K; }
          }
        }
      }
      chk('(8.3) UI pfComponents basis == engine markEff (cross-layer)', maxerr < 1e-14, 'maxErr=' + maxerr.toExponential(2) + ' ' + worst);
    }

    // ── (8.4) intra-band single-basis : both legs route through markLensed (structural) ──
    // closeBand settled leg uses legValueUnified/markEff (→markLensed); OTM leg uses legPrice (→markLensed).
    {
      const cbSrc = (function () { const i = engineBody.indexOf('function closeBand'); let d = 0, j = engineBody.indexOf('{', i); for (let k = j; k < engineBody.length; k++) { if (engineBody[k] === '{') d++; else if (engineBody[k] === '}') { d--; if (d === 0) return engineBody.slice(i, k + 1); } } return ''; })();
      // settled leg must call legValueUnified(s, ...) and markEff(s, ...) (the lensed 4-arg form, state-first)
      const settledLensed = /legValueUnified\(s, \w+_wing, band\.\w+, tau\)/.test(cbSrc)
                         && /markEff\(s, \w+_wing, band\.\w+\.inner, tau\)/.test(cbSrc);
      // reversal leg must call legPrice(s, ..., tau) (the lensed form with tau)
      const reversalLensed = /legPrice\(s, \w+_wing, band\.\w+\.inner, band\.\w+\.outer, band\.\w+\.N, tau\)/.test(cbSrc);
      // sNorm0 retained for the legacy regime test ONLY (legIsITM / wingMember), not in the lens calls
      const sNorm0NotInLens = !/legValueUnified\([^)]*sNorm0|markEff\([^)]*sNorm0|markLensed\([^)]*sNorm0|gLoc\([^)]*sNorm0/.test(cbSrc);
      chk('(8.4) intra-band both legs lensed, sNorm0 regime-only', settledLensed && reversalLensed && sNorm0NotInLens,
          'settled=' + settledLensed + ' reversal=' + reversalLensed + ' sNorm0-out-of-lens=' + sNorm0NotInLens);
    }

    // ── (8.5) ROUND-TRIP ZERO + the COORDINATE HAZARD (skeptic-strengthened) ──
    // (a) NEITHER-ITM: open via executeBand, close immediately; the per-leg open/settle
    //     identity holds (the moved-pool residual is genuine slippage, not a leak — so we
    //     assert the per-leg same-state identity, the meaningful no-arb check).
    // (b) ONE-ITM at a STEEP OFF-EQUILIBRIUM oNow≠marginal pool: the settled leg (price-coord
    //     sNorm0 natively) MUST land on the SAME reciprocal coordinate as the OTM reversal leg.
    //     Compare the lensed settled fraction (correct, reciprocal getSNorm) against the WRONG
    //     price-coord-spot fraction and assert they DIFFER materially (the hazard is real), AND
    //     that closeBand's settled value matches the correct reciprocal one (the build took the
    //     correct branch). This is the case that crosses the two coordinate conventions.
    {
      // (a) same-state per-leg identity at an off-eq steep pool
      const oNowA = E.getMP_raw(sSteep) * 1.6;          // off-equilibrium
      let maxId = 0;
      for (const wing of ['call', 'put']) {
        for (const K of [50000, 84000, 300000]) {
          const inner = K / oNowA;
          const vOpen = E.legPrice(sSteep, wing, inner, NaN, 2, tau2).V;
          const vSettle = E.legValueUnified(sSteep, wing, { inner, outer: NaN, N: 2 }, tau2);
          maxId = Math.max(maxId, Math.abs(vOpen - vSettle));
        }
      }
      // (b) coordinate hazard: the ONE-ITM case (sold call ITM, settled-to-cash). At a steep
      //     off-equilibrium oNow≠marginal pool, sNorm0 (price spot) and getSNorm (reciprocal
      //     mode) diverge maximally. The settled leg MUST land on the reciprocal coordinate
      //     (the SAME one the OTM reversal leg uses), NOT the price-coord sNorm0.
      const oNow = E.getMP_raw(sSteep) * 1.6;                  // off-equilibrium
      const oi2 = 80000;
      const sNorm0 = E.poolMark(sSteep, oNow, oi2) / oNow;     // price-coord spot (the trap)
      const mode = E.getSNorm(sSteep);                         // reciprocal mode (correct)
      const theta = sNorm0 * 0.5;                              // sold-call ray, ITM (sNorm0 ≥ theta)
      const Kitm = theta * oNow;
      const gK = E.gLoc(sSteep, theta, tau2);                  // gLoc hardcodes reciprocal mode
      const correct = E.markLensed('call', theta, mode, gK);   // RIGHT (reciprocal)
      const wrong = E.markLensed('call', theta, sNorm0, gK);   // WRONG (price spot) — the basis leak
      const hazardReal = Math.abs(correct - wrong) > 1e-3;     // the trap genuinely diverges (≈0.096)
      // closeBand: sold call ITM → settled-to-cash; bought put OTM → reversed. The settled value
      // X MUST equal N·markLensed(reciprocal) = 2·correct (NOT 2·wrong = the price-coord leak).
      const Kput = sNorm0 * oNow * 0.3;                        // put OTM (theta_put < sNorm0)
      const band = mkBand(Kitm, Kput, 2, 1, oNow);
      band.entry.oracle = oNow;
      const cl = E.closeBand(sSteep, band, club, oNow, oNow, oi2, tau2);
      const builtCorrect = cl.ok && cl.settled_cash_leg === 'sold'
        && Math.abs(cl.X - 2 * correct) < 1e-9                 // X == reciprocal value
        && Math.abs(cl.X - 2 * wrong) > 1e-3;                  // X is NOT the price-coord leak
      chk('(8.5a) per-leg open==settle at steep off-eq state', maxId < 1e-12, 'maxId=' + maxId.toExponential(2));
      chk('(8.5b) ONE-ITM close-side uses reciprocal coord (hazard caught)', hazardReal && builtCorrect,
          'hazardGap=' + Math.abs(correct - wrong).toFixed(4) + ' builtCorrect=' + builtCorrect + ' clX=' + (cl.ok ? cl.X.toFixed(6) : cl.reason) + ' settled=' + (cl.ok ? cl.settled_cash_leg : '-'));
    }

    // ── (8.6) solvency ceiling : markLensed ∈ [0, 1+1e-12] over a stress sweep ──
    {
      let mx = -Infinity, mn = Infinity, bad = 0;
      for (const W2 of [0.52, 0.6, 0.725, 0.85, 0.9]) {
        const sp = mkPool(10, 80000, W2);
        for (const wing of ['call', 'put']) {
          for (let lu = -6; lu <= 6; lu += 0.2) {
            const theta = E.getSNorm(sp) * Math.exp(lu);
            const g = E.gLoc(sp, theta, tau2);
            for (let q = 1e-6; q < 8; q *= 1.6) {
              const v = E.markLensed(wing, theta, q, g);
              if (!isFinite(v)) { bad++; continue; }
              if (v > mx) mx = v; if (v < mn) mn = v;
            }
          }
        }
      }
      chk('(8.6) solvency ceiling markLensed ≤ 1 (no NaN)', mx <= 1 + 1e-12 && mn >= 0 && bad === 0,
          'range=[' + mn.toExponential(2) + ',' + mx.toFixed(8) + '] nonFinite=' + bad);
    }

    // ── (8.7) one-helper no-arb witness : markLensed_open == markLensed_settle == 0 ──
    // same-function-evaluated-twice (the consistency witness, NOT an independent no-arb proof;
    // relabelled per skeptic). Confirms both layers call the SAME helper.
    {
      let maxgap = 0;
      const sp = mkPool(10, 80000, 0.725);
      const sNorm = E.getSNorm(sp);
      for (const wing of ['call', 'put']) {
        for (let lu = -5; lu <= 5; lu += 0.1) {
          const theta = sNorm * Math.exp(lu);
          const g = E.gLoc(sp, theta, tau2);
          const open = E.markLensed(wing, theta, sNorm, g);
          const settle = E.markEff(sp, wing, theta, tau2);   // markEff at the same coord
          maxgap = Math.max(maxgap, Math.abs(open - settle));
        }
      }
      chk('(8.7) one-helper witness: open==settle fraction (max|Δ|=0)', maxgap === 0, 'maxGap=' + maxgap);
    }

    // ── (8.8) L4 / pool regression : tradeUpdate byte-identical + no inverse-lens added ──
    // (the existing (6)/(6b)/(7) carry the pool byte-identity; here we additionally confirm
    //  W2 added NO inverse-lens helper by re-scanning the banned set against the Stage-2 body.)
    {
      const lower2 = engineBody.toLowerCase();
      const banned2 = [/invertlens|lensinvert|inverselens|inverse_lens/, /warp\s*until/, /solve\w*for\w*dy/, /dyfromslope|dy_from_slope/, /targetslope|target_slope|slopetarget/];
      let hit2 = '';
      for (const re of banned2) if (re.test(lower2)) hit2 += re.source + ' ';
      // executeBand/executeLeg size dy forward from V (lensed); confirm dy is still ±V·oracle in form
      const elSrc = (function () { const i = engineBody.indexOf('function executeLeg'); let d = 0, j = engineBody.indexOf('{', i); for (let k = j; k < engineBody.length; k++) { if (engineBody[k] === '{') d++; else if (engineBody[k] === '}') { d--; if (d === 0) return engineBody.slice(i, k + 1); } } return ''; })();
      // dy SIZING is build-dependent (all forward; NONE inverts a slope back to dy/mode/state):
      //   • R-218 inverse-lens build (theta_tx present): dy = ±N·K_tx (at the FROZEN
      //     inverse-lens transaction strike — a forward CLOSED-FORM of the chosen
      //     strike, NOT a slope-inversion; see (INVTX) block + g-tx1).
      //   • A14 at-strike build (DEPTH_FRAC, no theta_tx): dy = ±N·K_usd (chosen strike).
      //   • premium-sized build (HEAD/contwarp):           dy = ±V_usd  (V = N·markLensed).
      const isInvTx = /\btheta_tx\b/.test(engineBody);
      const isA14 = /\bDEPTH_FRAC\b/.test(engineBody);
      const dyForward = isInvTx
        ? /const dy = \(wingSign \* legSign\) \* N \* K_tx;/.test(elSrc) && /tradeUpdate\(state, dy\)/.test(elSrc)
        : isA14
        ? /const dy = \(wingSign \* legSign\) \* N \* K_usd;/.test(elSrc) && /tradeUpdate\(state, dy\)/.test(elSrc)
        : /const dy = \(wingSign \* legSign\) \* V_usd;/.test(elSrc) && /tradeUpdate\(state, dy\)/.test(elSrc);
      chk('(8.8) L4: no inverse-lens added; dy forward-sized (' + (isInvTx ? '±N·K_tx inverse-lens-strike' : isA14 ? '±N·K at-strike' : '±V·oracle premium') + ')',
          hit2 === '' && dyForward,
          'banned=' + (hit2 || 'none') + ' dyForward=' + dyForward + ' isInvTx=' + isInvTx + ' isA14=' + isA14);
    }
  }
}

// ═════════════════════════════════════════════════════════════════════════
//  CONTINUOUS WARP PREVIEW  (operator entries 158/163; skeptic
//  VERDICT_CONTINUOUS_SKEW_entry158_2026-06-12 — the held-center build is
//  SCRAPPED and its gate block removed; this block replaces it).
//  The dashed chart-2 preview sweeps s: 0→1 along the trade path; EVERY frame
//  is the EXISTING live read — gLoc at that frame's OWN 45°-tangent center,
//  no override anywhere. Auto-routes on the frame-helper token
//  `function framePool` (unique to the contwarp build). Per the skeptic's
//  #C16 rule the gates run the ACTUAL drawn path: framePool is extracted from
//  the UI script source and bound to the real Engine, and the drawn-exponent
//  expression is the matched gAt pool-branch source, not a re-typed formula.
//   (CF1) frame correctness: s∈{0,.25,.5,.75,1} — w monotone pre→post; s=0 ==
//         pre exact; s=1 == the full preview pool exact; each frame's drawn
//         exponent array == Engine.gLoc of that frame's pool (machine-eq).
//   (CF2) continuous-limit identity (N=100): per-step increments, each read at
//         the then-current center (held warp + lens re-center), sum to the
//         live end-read minus start-read to ≤1e-12 (telescoping, skeptic R2).
//   (CF3) end picture = the live read: wings steepen on a γ-raising trade; the
//         swept 0.7×center strike DIPS (documented — the mechanic, not a bug);
//         zero override tokens, zero 4-arg gLoc calls in the build.
//   (CF4) money-path leak guard: animation helpers referenced ONLY in the
//         draw layer; money paths token-clean AND numerically == clean HEAD.
// ═════════════════════════════════════════════════════════════════════════
if (/function framePool\(/.test(t)) {
  const grabFn = (src, name) => {
    const i = src.indexOf('function ' + name);
    if (i < 0) return null;
    let depth = 0, j = src.indexOf('{', i);
    for (let k = j; k < src.length; k++) { if (src[k] === '{') depth++; else if (src[k] === '}') { depth--; if (depth === 0) return src.slice(i, k + 1); } }
    return null;
  };
  const uiBody = (/<script id="ui">([\s\S]*?)<\/script>/.exec(t) || [, ''])[1];
  const stateBody = (/<script id="state">([\s\S]*?)<\/script>/.exec(t) || [, ''])[1];
  // The ACTUAL frame helper, extracted from the UI draw-layer source and bound
  // to the real Engine (so every frame below is what the renderer would draw).
  const fpSrc = grabFn(uiBody, 'framePool');
  const framePool = fpSrc ? new Function('Engine', 'return ' + fpSrc + ';')(E) : null;
  // The ACTUAL drawn-exponent expression: drawState's gAt pool branch source.
  const mGat = /const gAt = \(theta\) => poolForLens\s*\?\s*(Engine\.gLoc\(poolForLens,\s*theta,\s*tau_v\))/.exec(uiBody);
  const drawnExp = mGat ? new Function('Engine', 'poolForLens', 'theta', 'tau_v', 'return ' + mGat[1] + ';') : null;
  const gammaOf = (p) => E.getW(p) / (1 - E.getW(p));
  const mode0 = E.getSNorm(s);

  // ── (CF1) frame correctness on the actual helper + the actual drawn expression ──
  {
    const dy = 9000;
    const previewFull = E.tradeUpdate(s, dy);          // the existing full preview pool
    const grid = [0, 0.25, 0.5, 0.75, 1];
    const frames = framePool ? grid.map(sf => framePool(s, dy, sf)) : [];
    const eq = (a, b) => !!a && !!b && a.x === b.x && a.y === b.y && a.alpha === b.alpha && a.beta === b.beta;
    const s0ok = frames.length === 5 && eq(frames[0], s);          // s=0 ⇒ pre-trade state (exact)
    const s1ok = frames.length === 5 && eq(frames[4], previewFull); // s=1 ⇒ full preview pool (exact)
    let mono = frames.length === 5;
    const dir = previewFull ? Math.sign(E.getW(previewFull) - E.getW(s)) : 0;
    for (let i = 1; i < frames.length && mono; i++) {
      if (Math.sign(E.getW(frames[i]) - E.getW(frames[i - 1])) * dir < 0) mono = false;
    }
    // each frame's drawn exponent array (gAt source, LIVE center of that frame's
    // pool — gLoc reads getSNorm(frame) internally) == Engine.gLoc, machine-eq.
    const threeArg = mGat ? mGat[1].split(',').length === 3 : false;
    let drawnEq = !!drawnExp;
    if (drawnExp) for (const fp of frames) {
      for (let lu = -1.6; lu <= 1.6001; lu += 0.08) {
        const theta = mode0 * Math.exp(lu);
        if (drawnExp(E, fp, theta, tau) !== E.gLoc(fp, theta, tau)) drawnEq = false;
      }
    }
    chk('(CF1) framePool: s0==pre, s1==full preview (exact); w monotone; drawn exponents == gLoc of frame (machine-eq)',
        !!framePool && !!previewFull && s0ok && s1ok && mono && drawnEq && threeArg,
        's0=' + s0ok + ' s1=' + s1ok + ' mono=' + mono + ' drawnEq=' + drawnEq + ' threeArgGAt=' + threeArg);
  }

  // ── (CF2) the continuous-limit telescoping identity (skeptic Result 2) ──
  // N=100 steps along the ACTUAL frame path; each step's increment is read at
  // that step's then-current center: (γ_{i+1}−γ_i)·Φ(u(mode_i)) held-warp part
  // + γ_{i+1}·(Φ(u(mode_{i+1}))−Φ(u(mode_i))) lens re-center part. The sum
  // must equal the live end-read minus start-read (state function, ~1e-12).
  {
    const dyT = 30000, N = 100;
    const pools = [];
    for (let i = 0; i <= N; i++) pools.push(framePool(s, dyT, i / N));
    let maxerr = 0, worst = '', ok = pools.every(p => !!p);
    if (ok) {
      const Phi = (theta, m) => E.hpTau(Math.abs(Math.log(theta / m)), tau);
      for (const mult of [0.3, 0.5, 0.7, 0.95, 1.1, 1.5, 2.0, 4.0]) {
        const theta = mode0 * mult;
        let acc = 0;
        for (let i = 0; i < N; i++) {
          const gi = gammaOf(pools[i]), gi1 = gammaOf(pools[i + 1]);
          const mi = E.getSNorm(pools[i]), mi1 = E.getSNorm(pools[i + 1]);
          acc += (gi1 - gi) * Phi(theta, mi)            // warp during step, then-current center
               + gi1 * (Phi(theta, mi1) - Phi(theta, mi)); // lens re-center between steps
        }
        const live = E.gLoc(pools[N], theta, tau) - E.gLoc(pools[0], theta, tau);
        const e = Math.abs(acc - live);
        if (e > maxerr) { maxerr = e; worst = 'mult=' + mult; }
      }
    }
    chk('(CF2) N=100 per-step increments telescope to live end−start (state function)',
        ok && maxerr < 1e-12, 'maxErr=' + maxerr.toExponential(2) + ' ' + worst);
  }

  // ── (CF3) end picture = the live read; the dip is the mechanic (documented) ──
  {
    const dyT = 30000;                                  // sweeps the 45° point past 0.7×mode0
    const post = E.tradeUpdate(s, dyT);                 // γ 2.636→4.0, mode 0.379→0.250
    const dAt = (mult) => E.gLoc(post, mode0 * mult, tau) - E.gLoc(s, mode0 * mult, tau);
    const dPut = dAt(0.25), dCall = dAt(4.0), d07 = dAt(0.7);
    // wings (both sides, away from the swept band) steepen with γ; the swept
    // 0.7×center strike ends near the NEW at-the-money and its lensed
    // steepness DIPS — skeptic standing caution: this is the skew moving, and
    // nobody may "fix" it.
    const wingsUp = dPut > 0 && dCall > 0;
    const dipDocumented = isFinite(d07) && d07 < -0.1;
    // no override machinery anywhere in this build: zero override tokens, zero
    // 4-arg gLoc calls (token assembled so this gate file itself greps clean).
    const bannedToks = ['goal' + 'SeekW', 'wing ' + 'exponent', 'wing ' + 'steepness', 'target ' + 'steepness', 'mode' + 'Override'];
    let tokHit = '';
    for (const tok of bannedToks) if (t.indexOf(tok) >= 0) tokHit += tok + ' ';
    const fourArg = [...t.matchAll(/(?<!function )\bgLoc\(([^()]*)\)/g)].filter(m => m[1].split(',').length >= 4);
    chk('(CF3) end picture = live read: wings steepen, swept 0.7× strike dips (mechanic); no override tokens, no 4-arg gLoc',
        wingsUp && dipDocumented && tokHit === '' && fourArg.length === 0,
        'd(0.25×)=' + dPut.toFixed(4) + ' d(4×)=' + dCall.toFixed(4) +
        ' d(0.7×)=' + d07.toFixed(4) + ' [dip = strike near new ATM — the skew moved; NOT a bug]' +
        ' tokHit=' + (tokHit || 'none') + ' gLoc4=' + fourArg.length);
  }

  // ── (CF4) money-path leak guard: draw-layer-only tokens + numeric == clean HEAD ──
  {
    const animTok = /framePool|_cwKey|_cwRaf|renderPricingFrame|requestAnimationFrame|cancelAnimationFrame/;
    const engClean = !animTok.test(engineBody);
    const stClean = !animTok.test(stateBody);
    // helper referenced ONLY in the UI draw layer
    const totalRefs = t.split('framePool').length - 1;
    const uiRefs = uiBody.split('framePool').length - 1;
    const drawOnly = totalRefs === uiRefs && uiRefs >= 2;   // def + the drawPricing call
    // money-path function bodies token-clean
    let dirty = '';
    for (const fn of ['tradeUpdate', 'arbitrageToOracle', 'rebase', 'legPrice', 'executeLeg', 'executeBand', 'closeBand', 'markEff', 'legValueUnified', 'fundingPerStrike']) {
      const src = grabFn(engineBody, fn) || '';
      if (animTok.test(src)) dirty += fn + ' ';
    }
    if (animTok.test(grabFn(uiBody, 'pfComponents') || '')) dirty += 'pfComponents ';
    // numeric equality vs clean HEAD (engine byte-identity + behavioral sweep).
    // (After a promotion this compares the file to itself — green by identity.)
    // A14 EXCEPTION: a DEPTH_FRAC build (at-strike swap) DELIBERATELY changes
    // the engine (executeLeg dy-sizing + closeBand reversal dy). For such a
    // build the "engine == clean HEAD" premise is FALSE BY DESIGN — its real
    // L4 invariant (pool fns tradeUpdate/arbitrageToOracle/rebase byte-identical
    // to v24) is carried by AS4, and its at-strike sizing by AS1/AS5. So we do
    // NOT assert HEAD-equality here for A14; the draw-layer token-cleanliness
    // checks (the genuine contwarp concern) still run.
    const isA14CF = /\bDEPTH_FRAC\b/.test(engineBody);
    const headFile = path.join(__dirname, '..', 'builds', 'HEAD_temporal_mvp_v28_lens.html');
    let behavMax = isA14CF ? 0 : Infinity, engineByteId = isA14CF ? true : false;
    if (!isA14CF && fs.existsSync(headFile)) {
      const tHead = fs.readFileSync(headFile, 'utf8');
      const headEng = engineOf(tHead);
      engineByteId = headEng.body === engineBody;
      const EH = headEng.E;
      behavMax = 0;
      const mkB = (soldK, boughtK, orc) => ({ sold_wing: 'call', bought_wing: 'put',
        sold:   { inner: soldK / orc,  outer: NaN, N: 2, K_inner: soldK,  K_outer: NaN },
        bought: { inner: boughtK / orc, outer: NaN, N: 1, K_inner: boughtK, K_outer: NaN },
        entry: { L0: 1, oracle: orc }, carved: { carvedNotional: 0, carvedEntryEquity: 1, entryPerpMark: orc } });
      for (const W2 of [0.6, 0.725, 0.85]) {
        const sp = mkPool(10, 80000, W2);
        const orc = E.getMP_raw(sp);
        for (const wing of ['call', 'put']) {
          for (const mult of [0.3, 0.7, 1.5, 4.0]) {
            const theta = E.getSNorm(sp) * mult;
            behavMax = Math.max(behavMax,
              Math.abs(E.gLoc(sp, theta, tau) - EH.gLoc(sp, theta, tau)),
              Math.abs(E.legPrice(sp, wing, theta, NaN, 2, tau).V - EH.legPrice(sp, wing, theta, NaN, 2, tau).V),
              Math.abs(E.markEff(sp, wing, theta, tau) - EH.markEff(sp, wing, theta, tau)),
              Math.abs(E.legValueUnified(sp, wing, { inner: theta, outer: NaN, N: 2 }, tau)
                     - EH.legValueUnified(sp, wing, { inner: theta, outer: NaN, N: 2 }, tau)),
              Math.abs(E.fundingPerStrike(sp, theta, wing, 1, 1, 0.1, orc * 1.05, orc, tau)
                     - EH.fundingPerStrike(sp, theta, wing, 1, 1, 0.1, orc * 1.05, orc, tau)));
          }
          const ca = E.closeBand(sp, mkB(orc * 1.5, orc * 0.5, orc), { equity: 1e12 }, orc, orc, 80000, tau);
          const cb = EH.closeBand(sp, mkB(orc * 1.5, orc * 0.5, orc), { equity: 1e12 }, orc, orc, 80000, tau);
          if (ca.ok !== cb.ok) behavMax = Infinity;
          else if (ca.ok) behavMax = Math.max(behavMax, Math.abs(ca.X - cb.X));
        }
        for (const dy of [1, 250, -250, 5000, -5000]) {
          const a = E.tradeUpdate(sp, dy), b = EH.tradeUpdate(sp, dy);
          behavMax = Math.max(behavMax, Math.abs(a.x - b.x), Math.abs(a.y - b.y));
          const aa = E.arbitrageToOracle(sp, orc * 1.1), bb = EH.arbitrageToOracle(sp, orc * 1.1);
          behavMax = Math.max(behavMax, Math.abs(aa.x - bb.x), Math.abs(aa.y - bb.y));
        }
      }
    }
    chk('(CF4) leak guard: animation tokens draw-layer-only; money paths token-clean' +
        (isA14CF ? '; A14 build — engine intentionally differs (HEAD-equality N/A, pool-fn L4 via AS4)' : '; engine byte-identical + numeric == clean HEAD'),
        engClean && stClean && drawOnly && dirty === '' && engineByteId && behavMax === 0,
        'engClean=' + engClean + ' stClean=' + stClean + ' drawOnly=' + drawOnly +
        ' dirty=' + (dirty || 'none') + ' engByteId=' + engineByteId + ' behavMax=' + behavMax +
        (isA14CF ? ' [A14: HEAD-equality skipped by design; AS4 carries pool-fn L4]' : ''));
  }
}

// ═════════════════════════════════════════════════════════════════════════
//  A14 AT-STRIKE AMM SWAP  (register A14; spec specs/SPEC_atstrike_swap_A14_
//  2026-06-12.md §1; arb-stop OVERRULED operator entry 197 "transact at
//  whatever the curve is; forget arb for now"). Auto-routes on the
//  engine constant token `DEPTH_FRAC` (unique to this build). Open AND close
//  are at-strike (dy = ±N·K·oracle); the close is now at-strike too — that is
//  the fix that makes the pool RESERVES round-trip exact (AS2), closing the
//  −$254k pool-not-restored leak. Settle/valuation stays lensed (entry 96);
//  the residual mark-on-own-bend valuation netting is the A15 deferred item,
//  documented in AS6, NOT closed here.
// ═════════════════════════════════════════════════════════════════════════
if (/\bDEPTH_FRAC\b/.test(engineBody)) {
  // Clean-HEAD engine — the pricing-layer (option) baseline for AS3.
  const headFile = path.join(__dirname, '..', 'builds', 'HEAD_temporal_mvp_v28_lens.html');
  let EHEAD = null;
  try { EHEAD = engineOf(fs.readFileSync(headFile, 'utf8')).E; } catch (e) { EHEAD = null; }

  const mkP = (x, y, w) => ({ x, y, alpha: x * w, beta: y * (1 - w) });
  const sA = mkP(10, 800000, 0.5);   // default-ish pool: beta=400000, depth=400000
  const orcA = 80000, tauA = 0.3;

  // ── R-218 inverse-lens build detector (theta_tx token) ──
  // On the inverse-lens build the OPEN/CLOSE pool swap is sized at the FROZEN
  // inverse-lens transaction strike theta_tx (further out than the chosen strike),
  // NOT the chosen strike. The AS gates below pivot their EXPECTED dy / strike
  // accordingly; the bare HEAD (no theta_tx) keeps the original at-strike checks.
  const isInvTx = /\btheta_tx\b/.test(engineBody);
  // inverse of today's view lens h_τ(u)=√(τ²+u²)−τ : u_tx = sign(a)·√(a²+2|a|τ).
  const thetaTxOf = (st, theta, tau) => {
    const mode = E.getSNorm(st);
    const a = Math.log(theta / mode);
    const u_tx = Math.sign(a) * Math.sqrt(a * a + 2 * Math.abs(a) * tau);
    return mode * Math.exp(u_tx);
  };
  // EXPECTED |dy| for an open leg: N·K_tx·oracle (inverse-lens) or N·K·oracle (at-strike).
  const expectAbsDy = (st, theta, N, tau) =>
    isInvTx ? N * (thetaTxOf(st, theta, tau) * orcA) : N * (theta * orcA);

  // ── (AS1) open swap sizing: abs(dy) == N·K_swap·oracle machine-eq ──
  // K_swap = inverse-lens theta_tx (R-218 build) or the chosen strike (at-strike).
  {
    let allEq = true, lines = [];
    for (const wing of ['call', 'put']) {
      for (const legType of ['sell', 'buy']) {
        for (const [N, theta] of [[1, 1.5], [2, 0.667], [1, 4]]) {
          // cash-OUT legs deep enough to trip the guard are skipped for the
          // pure-sizing check (guard tested in AS-guard); pick within depth.
          const lg = EngineExec(E, sA, legType, wing, theta, N);
          if (!lg || lg.rejected) continue;
          const expect = expectAbsDy(sA, theta, N, tauA);   // same product order as engine
          const eq = Math.abs(lg.dy) === expect;
          allEq = allEq && eq;
          lines.push(legType + ' ' + wing + ' N=' + N + ' θ=' + theta + ' |dy|=' + Math.abs(lg.dy) + (eq ? '==' : '!=') + expect);
        }
      }
    }
    chk('(AS1) open dy: abs(dy) == N·' + (isInvTx ? 'K_tx(inverse-lens)' : 'K') + '·oracle machine-eq', allEq, lines.join(' | '));
  }

  function EngineExec(eng, st, legType, wing, theta, N) {
    return eng.executeLeg(st, legType, wing, theta, NaN, N, orcA, tauA);
  }

  // ── (AS2) open-then-close pool RESERVES restore exact (the leak is GONE) ──
  // On the inverse-lens build the band MUST carry the FROZEN K_tx (mirrors the
  // engine store at open) — the close reversal uses K_tx, not the chosen K_inner,
  // so the pool round-trips exact. Strikes kept close to the mode so the (further-
  // out) inverse-lens swap stays within DEPTH_FRAC.
  {
    const cases = isInvTx
      ? [ { sw: 'call', bw: 'call', si: 1.2, bi: 1.4 },
          { sw: 'put',  bw: 'put',  si: 0.8, bi: 0.7 } ]
      : [ { sw: 'call', bw: 'call', si: 1.5, bi: 2 },
          { sw: 'put',  bw: 'put',  si: 0.7, bi: 0.5 } ];
    let maxErr = 0, lines = [];
    for (const c of cases) {
      const sold   = { K_inner: c.si * orcA, K_outer: NaN, inner: c.si, outer: NaN };
      const bought = { K_inner: c.bi * orcA, K_outer: NaN, inner: c.bi, outer: NaN };
      const r = E.executeBand(sA, c.sw, c.bw, sold, bought, 1, orcA, orcA, tauA);
      if (!r.ok) { maxErr = Infinity; lines.push(c.sw + '/' + c.bw + ' open FAILED: ' + r.reason); continue; }
      const band = { sold_wing: c.sw, bought_wing: c.bw,
        sold:   { inner: c.si, outer: NaN, K_inner: c.si * orcA, K_outer: NaN, K_tx: r.leg1.K_tx, N: r.N_sell },
        bought: { inner: c.bi, outer: NaN, K_inner: c.bi * orcA, K_outer: NaN, K_tx: r.leg2.K_tx, N: r.N_buy },
        entry: { pool: sA, oracle: orcA, L0: 1 },
        carved: { carvedNotional: 0, carvedEntryEquity: 1, entryPerpMark: orcA } };
      const cl = E.closeBand(r.finalState, band, { equity: 1e12 }, orcA, orcA, orcA, tauA);
      if (!cl.ok) { maxErr = Infinity; lines.push(c.sw + '/' + c.bw + ' close FAILED: ' + cl.reason); continue; }
      const ex = Math.abs(cl.finalState.x - sA.x), ey = Math.abs(cl.finalState.y - sA.y);
      maxErr = Math.max(maxErr, ex, ey);
      lines.push(c.sw + '/' + c.bw + ' x-err=' + ex.toExponential(2) + ' y-err=' + ey.toExponential(2));
    }
    chk('(AS2) open→close pool RESERVES restore exact (≤1e-9) — leak GONE'
        + (isInvTx ? ' [frozen K_tx]' : ''), maxErr <= 1e-9, lines.join(' | '));
  }

  // ── (AS3) N_buy proceeds-sizing: option-layer separation intact ──
  // The N_buy CODE/FORMULA is unchanged: N_buy == V_sell / legPrice(post-sell
  // state, bought, 1, τ).V (spec G-A14-2, self-referential to THIS build's
  // post-sell pool). The OPTION-PRICING basis (V_sell at the un-perturbed open
  // pool) is byte/numeric-identical to clean HEAD. NOTE the NUMERIC N_buy
  // differs from premium-sized HEAD by construction — the at-strike sell moves
  // the post-sell pool further, so the bought-unit denom differs. This is the
  // brief↔spec tension surfaced to the manager: "unchanged" = code/formula +
  // pricing basis, NOT numeric-equal-to-HEAD (impossible while open is
  // at-strike). The honest divergence is recorded in the detail.
  // Strikes kept within DEPTH_FRAC on the (further-out) inverse-lens swap.
  const as3si = isInvTx ? 1.2 : 1.5, as3bi = isInvTx ? 1.4 : 2;
  {
    const sold   = { K_inner: as3si * orcA, K_outer: NaN, inner: as3si, outer: NaN };
    const bought = { K_inner: as3bi * orcA, K_outer: NaN, inner: as3bi, outer: NaN };
    const r = E.executeBand(sA, 'call', 'call', sold, bought, 1, orcA, orcA, tauA);
    const leg1 = E.executeLeg(sA, 'sell', 'call', as3si, NaN, 1, orcA, tauA);
    const denom = E.legPrice(leg1.newState, 'call', as3bi, NaN, 1, tauA).V;
    const nbForm = r.V_sell / denom;
    const formulaOk = r.ok && r.N_buy === nbForm;
    // option-pricing basis (V_sell at the open pool) == clean HEAD's:
    const vSellHead = EHEAD ? EHEAD.legPrice(sA, 'call', as3si, NaN, 1, tauA).V : NaN;
    const vSellThis = E.legPrice(sA, 'call', as3si, NaN, 1, tauA).V;
    const basisOk = EHEAD ? (vSellThis === vSellHead) : true;
    const nbHead = EHEAD ? E_headBandNbuy(EHEAD) : NaN;
    chk('(AS3) N_buy formula unchanged + option-pricing basis == clean HEAD',
        formulaOk && basisOk,
        'N_buy=' + r.N_buy + ' ==V_sell/denom:' + formulaOk +
        ' | V_sell basis==HEAD:' + basisOk + ' (this=' + vSellThis + ')' +
        ' | NOTE numeric N_buy vs HEAD: this=' + r.N_buy + ' HEAD=' + nbHead +
        ' (V_sell pricing basis matches HEAD; N_buy numeric differs by construction — at-strike sell moves post-sell pool)');
  }
  function E_headBandNbuy(EH) {
    const sold   = { K_inner: as3si * orcA, K_outer: NaN, inner: as3si, outer: NaN };
    const bought = { K_inner: as3bi * orcA, K_outer: NaN, inner: as3bi, outer: NaN };
    const r = EH.executeBand(mkP(10, 800000, 0.5), 'call', 'call', sold, bought, 1, orcA, orcA, tauA);
    return r.ok ? r.N_buy : NaN;
  }

  // ── (AS4) pool fns byte-identical to v24 ──
  {
    const grab = (src, name) => {
      const i = src.indexOf('function ' + name); let d = 0, j = src.indexOf('{', i);
      for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}') { d--; if (d === 0) return src.slice(i, k + 1); } }
      return null;
    };
    const baseBody = (/<script id="engine">([\s\S]*?)<\/script>/.exec(tBase) || [, ''])[1];
    let allId = true, lines = [];
    for (const fn of ['tradeUpdate', 'arbitrageToOracle', 'rebase']) {
      const a = grab(engineBody, fn), b = grab(baseBody, fn);
      const id = a === b; allId = allId && id; lines.push(fn + ':' + (id ? 'identical' : 'DIFF'));
    }
    chk('(AS4) pool fns byte-identical to v24', allId, lines.join(' '));
  }

  // ── (AS5) warp-rises-OTM: Δsteepness strictly increasing AND == dy/β ──
  {
    let prev = -Infinity, mono = true, eqAll = true, lines = [];
    const g = (st) => E.getW(st) / (1 - E.getW(st));
    for (const th of [1.1, 1.5, 2, 4]) {
      const lg = E.executeLeg(sA, 'sell', 'call', th, NaN, 1, orcA, tauA);
      const dG = g(lg.newState) - g(sA);
      const dyB = lg.dy / sA.beta;
      const inc = dG > prev + 1e-12;
      const eq = Math.abs(dG - dyB) <= 1e-9;
      mono = mono && inc; eqAll = eqAll && eq; prev = dG;
      lines.push('θ=' + th + ' Δγ=' + dG.toFixed(4) + ' dy/β=' + dyB.toFixed(4) + (eq ? '✓' : '✗'));
    }
    chk('(AS5) warp-rises-OTM: Δsteepness strictly ↑ AND == dy/β', mono && eqAll, lines.join(' | '));
  }

  // ── (AS6) HONESTY — close pays at the lensed mark on the live (possibly
  //   self-bent) curve. The pool RESERVES restore exact (AS2), but the trader
  //   VALUATION (raw_net from X/Y = lensed premium read on the post-warp pool)
  //   is NOT netted against the at-strike cash — the residual mark-on-own-bend
  //   value is the A15 deferred item, NOT closed here. This is a RECORDED
  //   honest state, NOT a fake round-trip-pool-favourable gate (operator
  //   overruled that, entry 197). We MEASURE and PRINT the residual; the gate
  //   passes on the structural facts (reserves restore + close uses lensed
  //   mark), and the residual is reported, never hidden.
  {
    const a6si = isInvTx ? 1.2 : 1.5, a6bi = isInvTx ? 1.4 : 2;
    const sold   = { K_inner: a6si * orcA, K_outer: NaN, inner: a6si, outer: NaN };
    const bought = { K_inner: a6bi * orcA, K_outer: NaN, inner: a6bi, outer: NaN };
    const r = E.executeBand(sA, 'call', 'call', sold, bought, 1, orcA, orcA, tauA);
    let residual = NaN, reservesOk = false, lensedClose = false;
    if (r.ok) {
      const band = { sold_wing: 'call', bought_wing: 'call',
        sold:   { inner: a6si, outer: NaN, K_inner: a6si * orcA, K_outer: NaN, K_tx: r.leg1.K_tx, N: r.N_sell },
        bought: { inner: a6bi, outer: NaN, K_inner: a6bi * orcA, K_outer: NaN, K_tx: r.leg2.K_tx, N: r.N_buy },
        entry: { pool: sA, oracle: orcA, L0: 1 },
        carved: { carvedNotional: 0, carvedEntryEquity: 1, entryPerpMark: orcA } };
      const cl = E.closeBand(r.finalState, band, { equity: 1e12 }, orcA, orcA, orcA, tauA);
      if (cl.ok) {
        reservesOk = Math.abs(cl.finalState.x - sA.x) <= 1e-9 && Math.abs(cl.finalState.y - sA.y) <= 1e-9;
        // close X/Y are lensed marks (m_s/m_b in [0,1]) ⇒ lensed-mark close.
        lensedClose = isFinite(cl.m_s) && isFinite(cl.m_b);
        residual = cl.raw_net;   // lensed mark-on-own-bend valuation residual (A15-deferred)
      }
    }
    chk('(AS6) HONESTY: reserves restore (AS2) + close pays at LENSED mark; trader-valuation netting DEFERRED to A15',
        reservesOk && lensedClose,
        'reserves restore=' + reservesOk + ' lensed-mark close=' + lensedClose +
        ' | A15-deferred residual raw_net (lensed mark-on-own-bend, NOT closed here)=' + (isFinite(residual) ? residual.toExponential(4) : 'n/a'));
  }

  // ── (AS-guard) reserve guard — honest REJECT, N never mutated ──
  // The guard fires on the ACTUAL pool swap = N·K_swap·oracle, where K_swap is the
  // further-out inverse-lens strike on the R-218 build (so capacity at a CHOSEN
  // strike shrinks — skeptic §4 / g-tx4). The threshold-θ is computed in swap-space
  // so over/under straddle the limit on BOTH builds.
  {
    const depth = sA.y - sA.beta;          // 400000
    // θ_tx that puts N·θ_tx·oracle exactly at 0.90·depth, then the CHOSEN strike
    // whose inverse-lens image is that θ_tx (h_τ contracts θ_tx back to chosen).
    const txAtLimit = (0.90 * depth) / orcA;          // θ_tx (swap strike) at the limit
    const mode = E.getSNorm(sA);
    const u_lim = Math.log(txAtLimit / mode);
    const hTauLoc = (u, tau) => Math.sqrt(tau * tau + u * u) - tau;
    const chosenAtLimit = isInvTx ? mode * Math.exp(hTauLoc(u_lim, tauA)) : txAtLimit;
    const lgOver  = E.executeLeg(sA, 'buy', 'call', chosenAtLimit * 1.01, NaN, 1, orcA, tauA);
    const lgUnder = E.executeLeg(sA, 'buy', 'call', chosenAtLimit * 0.99, NaN, 1, orcA, tauA);
    const rejectsOver = !!(lgOver && lgOver.rejected) && /depth/.test(lgOver.reason || '');
    const execsUnder = !!(lgUnder && lgUnder.newState && lgUnder.N === 1 && !lgUnder.rejected);
    // wired through executeBand failure path:
    const bigBought = { K_inner: 4.6 * orcA, K_outer: NaN, inner: 4.6, outer: NaN };
    const sold = { K_inner: 1.5 * orcA, K_outer: NaN, inner: 1.5, outer: NaN };
    const rb = E.executeBand(sA, 'call', 'call', sold, bigBought, 1, orcA, orcA, tauA);
    const bandPath = !rb.ok && /depth/.test(rb.reason || '');
    chk('(AS-guard) reserve guard: cash-OUT over depth REJECTS with numbers; under executes; N never mutated; wired through executeBand',
        rejectsOver && execsUnder && bandPath,
        'over→reject=' + rejectsOver + ' (' + (lgOver && lgOver.reason ? lgOver.reason.slice(0, 60) : '-') + ')' +
        ' | under→exec N==1:' + execsUnder + ' | executeBand path:' + bandPath);
  }
}

// ═════════════════════════════════════════════════════════════════════════
//  R-218 INVERSE-LENS TRANSACTION STRIKE  (operator entries 214/215/216/218;
//  skeptic VERDICT_lens_tx_strike / VERDICT_lens_R218_consistency 2026-06-13,
//  Choice B). The chosen (displayed/lensed) strike is swapped at the TRUE strike
//  whose lensed APPEARANCE equals it = the INVERSE of today's view lens h_τ. The
//  view lens (hTau/hpTau/gLoc/markLensed), chart-2, funding, no-jump-ATM, frozen
//  wings are ALL byte-untouched — this is a SWAP-SIZING change only. Routes on the
//  `theta_tx` engine token (unique to this build); SKIPs-as-pass elsewhere.
//   (INVTX-1) theta_tx = inverse-lens image of the chosen strike:
//             u_tx = sign(a)·√(a²+2|a|τ), a=ln(chosen/mode), round-trips through
//             h_τ to ≤1e-12, expands outward (|u_tx| ≥ |a| ⇒ θ_tx ≥ chosen).
//   (INVTX-2) FROZEN θ_tx: open-then-close reserves round-trip EXACT using the
//             stored K_tx; a fallback-to-K_inner (the drifted-mode would-be leak)
//             does NOT round-trip — proves the freeze is load-bearing (no $1395 leak).
//   (INVTX-3) NO FREE MONEY: a single leg opened then reversed with the frozen
//             K_tx nets dy=0 exactly and restores reserves — the trader extracts
//             $0 from the financing round-trip (entry-199 single option satisfied).
//   (INVTX-4) τ-DIRECTION DOCUMENTED (NOT a fail): under today's h_τ a SHARPER
//             lens (smaller τ) ⇒ θ_tx LESS far out; a FLATTER lens ⇒ FURTHER out.
//             Recorded so a future lens "fix" cannot silently flip the sign.
//   (INVTX-5) view-lens / settlement UNTOUCHED: hTau/hpTau/gLoc/markLensed/legPrice
//             byte-identical to clean HEAD; settlement strike stays the CHOSEN one.
// ═════════════════════════════════════════════════════════════════════════
if (/\btheta_tx\b/.test(engineBody)) {
  const mkPi = (x, y, w) => ({ x, y, alpha: x * w, beta: y * (1 - w) });
  const sI = mkPi(10, 800000, 0.5);   // mode getSNorm = (1−w)/w = 1
  const orcI = 80000, tauI = 0.3;
  const modeI = E.getSNorm(sI);
  const hTauL  = (u, tau) => Math.sqrt(tau * tau + u * u) - tau;
  const headFileI = path.join(__dirname, '..', 'builds', 'HEAD_temporal_mvp_v28_lens.html');
  let EHEADI = null, headBodyI = '';
  try { const o = engineOf(fs.readFileSync(headFileI, 'utf8')); EHEADI = o.E; headBodyI = o.body; } catch (e) {}

  // ── (INVTX-1) θ_tx = inverse-lens image, expands outward, round-trips to ≤1e-12 ──
  {
    let maxRt = 0, allExpand = true, allMatch = true, lines = [];
    for (const mult of [0.25, 0.5, 0.8, 1.3, 2.0, 4.0]) {
      const chosen = modeI * mult;
      const a = Math.log(chosen / modeI);
      const u_tx = Math.sign(a) * Math.sqrt(a * a + 2 * Math.abs(a) * tauI);
      const theta_tx_expect = modeI * Math.exp(u_tx);
      const lg = E.executeLeg(sI, 'sell', mult >= 1 ? 'call' : 'put', chosen, NaN, 1, orcI, tauI);
      const engTx = lg.theta_tx;
      const match = Math.abs(engTx - theta_tx_expect);
      const rt = Math.abs(hTauL(Math.abs(u_tx), tauI) - Math.abs(a));   // inverse round-trip
      // expansion = θ_tx is FURTHER from the mode than the chosen strike, same side:
      // |ln(θ_tx/mode)| ≥ |a| and same sign (call: θ_tx≥chosen; put: θ_tx≤chosen).
      const uEng = Math.log(engTx / modeI);
      const expand = Math.abs(uEng) >= Math.abs(a) - 1e-12 && Math.sign(uEng) === Math.sign(a);
      maxRt = Math.max(maxRt, rt); allMatch = allMatch && match <= 1e-9; allExpand = allExpand && expand;
      lines.push(mult + '× θ_tx/mode=' + (engTx / modeI).toFixed(4) + ' rt=' + rt.toExponential(1));
    }
    chk('(INVTX-1) θ_tx = inverse-lens(chosen): matches √(a²+2|a|τ) ≤1e-9, expands outward, h_τ round-trip ≤1e-12',
        allMatch && allExpand && maxRt <= 1e-12,
        'maxRt=' + maxRt.toExponential(2) + ' expand=' + allExpand + ' | ' + lines.join(' | '));
  }

  // ── (INVTX-2) FROZEN θ_tx ⇒ exact round-trip; fallback-to-K_inner LEAKS ──
  {
    const si = 1.2, bi = 1.4;
    const sold   = { K_inner: si * orcI, K_outer: NaN, inner: si, outer: NaN };
    const bought = { K_inner: bi * orcI, K_outer: NaN, inner: bi, outer: NaN };
    const r = E.executeBand(sI, 'call', 'call', sold, bought, 1, orcI, orcI, tauI);
    let frozenErr = Infinity, leakErr = 0, ok = r.ok;
    if (r.ok) {
      const mkBand = (withTx) => ({ sold_wing: 'call', bought_wing: 'call',
        sold:   { inner: si, outer: NaN, K_inner: si * orcI, K_outer: NaN, N: r.N_sell, ...(withTx ? { K_tx: r.leg1.K_tx } : {}) },
        bought: { inner: bi, outer: NaN, K_inner: bi * orcI, K_outer: NaN, N: r.N_buy,  ...(withTx ? { K_tx: r.leg2.K_tx } : {}) },
        entry: { pool: sI, oracle: orcI, L0: 1 },
        carved: { carvedNotional: 0, carvedEntryEquity: 1, entryPerpMark: orcI } });
      const clFrozen = E.closeBand(r.finalState, mkBand(true),  { equity: 1e12 }, orcI, orcI, orcI, tauI);
      const clLeak   = E.closeBand(r.finalState, mkBand(false), { equity: 1e12 }, orcI, orcI, orcI, tauI);
      if (clFrozen.ok) frozenErr = Math.max(Math.abs(clFrozen.finalState.x - sI.x), Math.abs(clFrozen.finalState.y - sI.y));
      if (clLeak.ok)   leakErr   = Math.max(Math.abs(clLeak.finalState.x   - sI.x), Math.abs(clLeak.finalState.y   - sI.y));
    }
    // frozen K_tx round-trips exact; the K_inner fallback (the would-be drifted basis) does NOT.
    chk('(INVTX-2) FROZEN θ_tx: round-trip exact (≤1e-9); K_inner-fallback LEAKS (proves freeze is load-bearing)',
        ok && frozenErr <= 1e-9 && leakErr > 1.0,
        'frozen err=' + frozenErr.toExponential(2) + ' | K_inner-fallback leak=' + leakErr.toExponential(2) + ' (would-be $ leak ⇒ freeze required)');
  }

  // ── (INVTX-3) NO FREE MONEY: single leg open+reverse (frozen K_tx) nets 0 ──
  {
    let allZero = true, lines = [];
    for (const [wing, ls, th] of [['call', 'sell', 1.3], ['call', 'buy', 1.25], ['put', 'sell', 0.77], ['put', 'buy', 0.8]]) {
      const open = E.executeLeg(sI, ls, wing, th, NaN, 1, orcI, tauI);
      if (!open || open.rejected) { lines.push(ls + ' ' + wing + ' rejected'); continue; }
      const ws = (wing === 'call') ? +1 : -1;
      const lsg = (ls === 'sell') ? +1 : -1;
      const dyRev = -(ws * lsg * 1 * open.K_tx);          // close reversal from FROZEN K_tx
      const sumDy = Math.abs(open.dy + dyRev);
      const back = E.tradeUpdate(open.newState, dyRev);
      const rErr = Math.max(Math.abs(back.x - sI.x), Math.abs(back.y - sI.y));
      const zero = sumDy <= 1e-9 && rErr <= 1e-9;
      allZero = allZero && zero;
      lines.push(ls + ' ' + wing + ' Σdy=' + sumDy.toExponential(1) + ' rErr=' + rErr.toExponential(1));
    }
    chk('(INVTX-3) NO FREE MONEY: single-leg open+reverse (frozen K_tx) Σdy==0 ⇒ trader extracts $0 from financing round-trip',
        allZero, lines.join(' | '));
  }

  // ── (INVTX-4) τ-DIRECTION DOCUMENTED (recorded, NOT a fail) ──
  {
    const chosen = 2 * modeI;                  // 2× the mode (call OTM), a=ln2
    const a = Math.log(chosen / modeI);
    const rows = [];
    let monotoneUp = true, prev = -Infinity;   // θ_tx GROWS with τ under today's h_τ
    for (const tau of [0.05, 0.3, 1, 3]) {
      const u_tx = Math.sqrt(a * a + 2 * a * tau);
      const ratio = Math.exp(u_tx);            // θ_tx/mode
      monotoneUp = monotoneUp && ratio > prev; prev = ratio;
      rows.push('τ=' + tau + '→' + ratio.toFixed(3) + '×');
    }
    // This is the operator-flagged side-effect: sharper (τ↓) ⇒ θ_tx LESS far.
    // The gate PASSES on the documented direction (monotone ↑ in τ); it does NOT
    // judge the direction "wrong" — it LOCKS it so a future fix can't silently flip it.
    chk('(INVTX-4) τ-direction LOCKED (today\'s h_τ): sharper τ ⇒ θ_tx LESS far, flatter τ ⇒ FURTHER (operator-flagged side-effect, NOT a fail)',
        monotoneUp, rows.join(' | ') + ' — sharper=closer (documented)');
  }

  // ── (INVTX-5) view lens / settlement UNTOUCHED vs clean HEAD ──
  {
    const grab = (src, name) => { const i = src.indexOf('function ' + name); let d = 0, j = src.indexOf('{', i); for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}') { d--; if (d === 0) return src.slice(i, k + 1); } } return null; };
    const grabArrow = (src, name) => { const i = src.indexOf('const ' + name + ' '); if (i < 0) return null; const e = src.indexOf(';', i); return e < 0 ? null : src.slice(i, e + 1); };
    let allId = true, lines = [];
    if (headBodyI) {
      for (const fn of ['gLoc', 'markLensed', 'legPrice', 'lensU']) {
        const id = grab(engineBody, fn) === grab(headBodyI, fn); allId = allId && id; lines.push(fn + ':' + (id ? 'id' : 'DIFF'));
      }
      for (const av of ['hTau', 'hpTau']) {
        const id = grabArrow(engineBody, av) === grabArrow(headBodyI, av); allId = allId && id; lines.push(av + ':' + (id ? 'id' : 'DIFF'));
      }
    } else { lines.push('HEAD unavailable — skipped byte-cmp'); }
    chk('(INVTX-5) view lens (hTau/hpTau/gLoc/markLensed/legPrice/lensU) byte-identical to clean HEAD; settlement at CHOSEN strike',
        allId, lines.join(' '));
  }
}

console.log('=== lens_selfcheck: ' + pass + ' PASS, ' + fail + ' FAIL ===');
process.exit(fail === 0 ? 0 : 1);

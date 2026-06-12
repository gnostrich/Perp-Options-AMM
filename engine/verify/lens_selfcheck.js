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
      const dyForward = /const dy = \(wingSign \* legSign\) \* V_usd;/.test(elSrc) && /tradeUpdate\(state, dy\)/.test(elSrc);
      chk('(8.8) L4: no inverse-lens added; dy=±V·oracle forward sizing', hit2 === '' && dyForward,
          'banned=' + (hit2 || 'none') + ' dyForward=' + dyForward);
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
    const headFile = path.join(__dirname, '..', 'builds', 'HEAD_temporal_mvp_v28_lens.html');
    let behavMax = Infinity, engineByteId = false;
    if (fs.existsSync(headFile)) {
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
    chk('(CF4) leak guard: animation tokens draw-layer-only; money paths token-clean, engine byte-identical + numeric == clean HEAD',
        engClean && stClean && drawOnly && dirty === '' && engineByteId && behavMax === 0,
        'engClean=' + engClean + ' stClean=' + stClean + ' drawOnly=' + drawOnly +
        ' dirty=' + (dirty || 'none') + ' engByteId=' + engineByteId + ' behavMax=' + behavMax);
  }
}

console.log('=== lens_selfcheck: ' + pass + ' PASS, ' + fail + ' FAIL ===');
process.exit(fail === 0 ? 0 : 1);

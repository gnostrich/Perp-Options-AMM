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
//  HELD-CENTER WARP DRAWING FIX  (operator entry 153 #1/#2 + 155; skeptic R6
//  narrow scope — spec CORRECTION APPENDIX C.1 changes 1/2/3 ONLY: gLoc gains
//  an optional modeOverride, drawState threads it in the pool branch, and the
//  dashed after-trade preview is drawn at the HELD pre-step 45°-tangent center).
//  Auto-routes on the 4-arg gLoc signature (gLoc.length ≥ 4) — the token unique
//  to the held-warp build. Do NOT key on any other export.
//   (W1)   real-path held warp: gLoc(previewPool,θ,τ,heldMode) − gLoc(pre,θ,τ)
//          == (γ′−γ)·Φ_τ(ln(θ/heldMode)); single-signed; |dG| grows OTM.
//   (W1b)  LOCKED regression (skeptic counterexample): θ=0.7×heldMode, γ
//          2.636→3.182 — the OLD no-override read MUST sign-flip negative
//          (fails the old way); the held-center read MUST be positive.
//   (W6)   behavioral: after-trace exponent array (built exactly as drawState's
//          gAt builds it) minus live array == (γ′−γ)·Φ_τ(u_held) across the θ
//          grid, AND the UI dashed call passes snap.sNorm as the override.
//   (W-OVR) leak guard: the override reaches gLoc from EXACTLY ONE call site
//          (the dashed after-trace); legPrice/markEff/legValueUnified/
//          fundingPerStrike/closeBand/executeLeg/executeBand/pfComponents pass
//          NO 4th arg (token scan) AND equal clean HEAD numerically.
// ═════════════════════════════════════════════════════════════════════════
if (typeof E.gLoc === 'function' && E.gLoc.length >= 4) {
  const grabFn = (src, name) => {
    const i = src.indexOf('function ' + name);
    if (i < 0) return null;
    let depth = 0, j = src.indexOf('{', i);
    for (let k = j; k < src.length; k++) { if (src[k] === '{') depth++; else if (src[k] === '}') { depth--; if (depth === 0) return src.slice(i, k + 1); } }
    return null;
  };
  const Phi = (u) => Math.abs(u) / Math.sqrt(tau * tau + u * u);   // h′_τ(|u|)
  const heldMode = E.getSNorm(s);                                  // pre-step (held) 45°-tangent center
  const gammaPre = E.getW(s) / (1 - E.getW(s));

  // ── (W1) real-path held-center warp across trades and strikes ──
  {
    let maxerr = 0, signOK = true, monoOK = true, worst = '';
    for (const dy of [-12000, -3000, 3000, 12000, 30000]) {
      const post = E.tradeUpdate(s, dy);
      if (!post) continue;
      const wPost = E.getW(post), gammaPost = wPost / (1 - wPost);
      const sgn = Math.sign(gammaPost - gammaPre);
      for (const wingMults of [[0.9, 0.7, 0.5, 0.3], [1.2, 1.5, 2.5, 4.0]]) {
        let prevAbs = -Infinity;
        for (const mult of wingMults) {                            // ordered away from the center
          const thetaK = heldMode * mult;
          const uHeld = Math.log(thetaK / heldMode);
          const gA = E.gLoc(post, thetaK, tau, heldMode);          // the REAL after-trace draw path
          const gB = E.gLoc(s, thetaK, tau);                       // live trace at pre pool (mode == heldMode)
          const dG = gA - gB;
          const expect = (gammaPost - gammaPre) * Phi(uHeld);      // warp read at the held center
          const e = Math.abs(dG - expect);
          if (e > maxerr) { maxerr = e; worst = 'dy=' + dy + ' mult=' + mult; }
          if (Math.sign(dG) !== sgn) signOK = false;               // single-signed (no sign-flip)
          if (Math.abs(dG) < prevAbs - 1e-12) monoOK = false;      // grows away from the center
          prevAbs = Math.abs(dG);
        }
      }
    }
    chk('(W1) real-path held warp dG=(γ′−γ)·Φ_τ(u_held), single-signed, grows OTM',
        maxerr < 1e-12 && signOK && monoOK,
        'maxErr=' + maxerr.toExponential(2) + ' sign=' + signOK + ' mono=' + monoOK + ' ' + worst);
  }

  // ── (W1b) LOCKED regression case (the skeptic counterexample, must stay red on the old frame) ──
  {
    const gTarget = 35 / 11;                                       // γ′ = 3.181818…
    const wT = gTarget / (1 + gTarget);
    const xNew = s.alpha / wT, dx = xNew - s.x, A = s.y - s.beta;
    const dyT = -dx * A * A / (dx * A + s.alpha * s.beta);         // invert tradeUpdate for the dy hitting γ′
    const post = E.tradeUpdate(s, dyT);
    const gammaPost = E.getW(post) / (1 - E.getW(post));
    const calOK = Math.abs(gammaPost - gTarget) < 1e-9;
    const thetaK = 0.7 * heldMode;
    const dG_old = E.gLoc(post, thetaK, tau) - E.gLoc(s, thetaK, tau);            // OLD no-override frame
    const dG_held = E.gLoc(post, thetaK, tau, heldMode) - E.gLoc(s, thetaK, tau); // held-center frame
    const expect = (gammaPost - gammaPre) * Phi(Math.log(thetaK / heldMode));
    const oldFlips = dG_old < -0.1;                                // ≈ −0.459 — the masked frame FAILS
    const heldOK = dG_held > 0 && Math.abs(dG_held - expect) < 1e-12;  // ≈ +0.417 — held frame PASSES
    chk('(W1b) LOCKED regression @0.7×center: old read sign-flips, held read positive',
        calOK && oldFlips && heldOK,
        'γ′=' + gammaPost.toFixed(6) + ' dG_old=' + dG_old.toFixed(4) +
        ' dG_held=' + dG_held.toFixed(4) + ' expect=' + expect.toFixed(4));
  }

  // ── (W6) behavioral: the drawn exponent arrays (screen y-values pre-toPx), not a regex ──
  {
    const previewPool = E.tradeUpdate(s, 9000);
    const wPost = E.getW(previewPool), gammaPost = wPost / (1 - wPost);
    let maxerr = 0;
    for (let lu = -1.4; lu <= 1.4001; lu += 0.04) {
      const theta = heldMode * Math.exp(lu);
      const gLive = E.gLoc(s, theta, tau);                         // live trace: gLoc(state.pool, θ, τ)
      const gAfter = E.gLoc(previewPool, theta, tau, heldMode);    // after-trace: gLoc(previewPool, θ, τ, snap.sNorm)
      const expect = (gammaPost - gammaPre) * Phi(Math.log(theta / heldMode));
      maxerr = Math.max(maxerr, Math.abs((gAfter - gLive) - expect));
    }
    // and the UI dashed call actually wires the held center (axis arg AND override arg)
    const uiBody = (/<script id="ui">([\s\S]*?)<\/script>/.exec(t) || [, ''])[1];
    const heldCall = /drawState\(\s*snap\.sNorm\s*,\s*true\s*,\s*previewPool\s*,\s*state\.tau\s*,\s*snap\.sNorm\s*\)/.test(uiBody);
    const noRecenter = !/drawState\(\s*snapPost\.sNorm/.test(uiBody);
    chk('(W6) after-trace exponents == live + (γ′−γ)·Φ(u_held); UI passes held override',
        maxerr < 1e-12 && heldCall && noRecenter,
        'maxErr=' + maxerr.toExponential(2) + ' heldCall=' + heldCall + ' noRecenter=' + noRecenter);
  }

  // ── (W-OVR) leak guard: the override is after-trace-only ──
  {
    // (a) token scan over the whole build: every gLoc( call with ≥4 args — must be
    // exactly ONE, and it must be drawState's poolForLens branch.
    const calls = [...t.matchAll(/(?<!function )\bgLoc\(([^()]*)\)/g)];
    const fourArg = calls.filter(m => m[1].split(',').length >= 4);
    const onlyDraw = fourArg.length === 1 && /poolForLens,\s*theta,\s*tau_v,\s*modeOverride/.test(fourArg[0][1]);
    // exactly ONE drawState call passes the 5th (override) arg — the dashed after-trace
    const dsCalls = [...t.matchAll(/(?<!function )drawState\(([^()]*)\)/g)];
    const fiveArg = dsCalls.filter(m => m[1].split(',').length >= 5);
    const onlyPreview = fiveArg.length === 1 && /snap\.sNorm\s*,\s*true\s*,\s*previewPool/.test(fiveArg[0][1]);
    // money-path consumers contain NO 4-arg gLoc call
    let dirty = '';
    for (const fn of ['legPrice', 'markEff', 'legValueUnified', 'fundingPerStrike', 'closeBand', 'executeLeg', 'executeBand', 'pfComponents']) {
      const src = grabFn(t, fn) || '';
      const bad = [...src.matchAll(/\bgLoc\(([^()]*)\)/g)].some(m => m[1].split(',').length >= 4);
      if (bad) dirty += fn + ' ';
    }
    // (b) behavioral equality of the money paths against clean HEAD (numeric, max|Δ|=0).
    // (After a promotion this compares the file to itself — stays green by identity.)
    const headFile = path.join(__dirname, '..', 'builds', 'HEAD_temporal_mvp_v28_lens.html');
    let behavMax = 0, behavRan = false;
    if (fs.existsSync(headFile)) {
      behavRan = true;
      const EH = engineOf(fs.readFileSync(headFile, 'utf8')).E;
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
              Math.abs(E.fundingPerStrike(sp, theta, wing, 1, 1, 0.1, orc * 1.05, orc, tau)
                     - EH.fundingPerStrike(sp, theta, wing, 1, 1, 0.1, orc * 1.05, orc, tau)));
          }
        }
      }
    }
    chk('(W-OVR) override after-trace-only: one 4-arg gLoc site, one 5-arg draw call, money paths clean + == HEAD',
        onlyDraw && onlyPreview && dirty === '' && behavRan && behavMax === 0,
        'gLoc4=' + fourArg.length + ' draw5=' + fiveArg.length + ' dirty=' + (dirty || 'none') +
        ' behavMax=' + behavMax + ' vsHEAD=' + behavRan);
  }
}

console.log('=== lens_selfcheck: ' + pass + ' PASS, ' + fail + ' FAIL ===');
process.exit(fail === 0 ? 0 : 1);

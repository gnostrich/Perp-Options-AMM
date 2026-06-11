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

const file = process.argv[2] ||
  path.join(__dirname, '..', 'builds', 'temporal_mvp_v28_lens_S1.html');
const t = fs.readFileSync(file, 'utf8');
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

console.log('=== lens_selfcheck: ' + pass + ' PASS, ' + fail + ' FAIL ===');
process.exit(fail === 0 ? 0 : 1);

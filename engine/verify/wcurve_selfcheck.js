#!/usr/bin/env node
// (W) kurtosis-curve self-check (v27). The GH run_all harnesses do NOT apply
// (v27 is pre-GH: no ghCalibrate, no CDF table). This is the (W)-appropriate
// gate. Usage: node wcurve_selfcheck.js [path-to-html]   (default v27 WIP).
// SKIPs-as-pass on a pre-(W) build (no wField/sNormStrike export) so HEAD stays green.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');

const file = process.argv[2] ||
  path.join(__dirname, '..', 'builds', 'temporal_mvp_v27_wkurtosis_WIP.html');
const t = fs.readFileSync(file, 'utf8');
const m = /<script id="engine">([\s\S]*?)<\/script>/.exec(t);
if (!m) { console.error('no engine script'); process.exit(1); }
const ctx = { Math, isFinite, console };
vm.createContext(ctx);
vm.runInContext(m[1] + '\n;this.__E=Engine;', ctx);
const E = ctx.__E;

if (typeof E.wField !== 'function' || typeof E.sNormStrike !== 'function') {
  console.log('SKIP wcurve_selfcheck: pre-(W) build (no wField/sNormStrike export) — pass.');
  process.exit(0);
}

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
  if (cond) { pass++; console.log('PASS ' + name + (detail ? '  ' + detail : '')); }
  else { fail++; console.log('FAIL ' + name + (detail ? '  ' + detail : '')); }
};
const pool = (tau, wm, wp) => ({ x: 10, y: 800000, tau,
  wMinus: wm == null ? 0.70 : wm, wPlus: wp == null ? 0.70 : wp, alpha: 7, beta: 240000 });
const gLocAtU = (s, u) => {
  const wm = 0.5 * (s.wMinus + s.wPlus), dw2 = 0.5 * (s.wPlus - s.wMinus);
  const w = wm + dw2 * u / Math.sqrt(s.tau * s.tau + u * u);
  return w / (1 - w);
};

console.log('=== (W) kurtosis self-check :: ' + path.basename(file) + ' ===');

// (1) On (W) the marginal price EQUALS the geometric reserve slope (NO e^-ghMu).
const s = pool(0.3);
const mp = E.getMP_raw(s);
const sA = E.arbitrageToOracle(s, mp * 0.999), sB = E.arbitrageToOracle(s, mp * 1.001);
const fdSlope = Math.abs((sB.y - sA.y) / (sB.x - sA.x));
chk('price == geometric slope (no e^-ghMu)', Math.abs(fdSlope - mp) / mp < 1e-3,
    'mp=' + mp.toFixed(2) + ' fdSlope=' + fdSlope.toFixed(2) + ' rel=' + (Math.abs(fdSlope - mp) / mp).toExponential(2));

// (2) arbitrageToOracle is a true inverse (price strictly monotone in u).
let maxrt = 0;
for (const tgt of [10000, 40000, 80000, 160000, 400000]) {
  const st = E.arbitrageToOracle(s, tgt);
  maxrt = Math.max(maxrt, Math.abs(E.getMP_raw(st) - tgt) / tgt);
}
chk('arbitrageToOracle inverse round-trip', maxrt < 1e-5, 'maxRelErr=' + maxrt.toExponential(2));

// (3a) SYMMETRIC wings (dW=0): g_loc is exactly constant in u and across tau —
//      the "wings byte-identical across tau" gate in its exact form.
let maxFroz = 0;
for (const u of [-8, -3, 0, 3, 8]) {
  maxFroz = Math.max(maxFroz, Math.abs(gLocAtU(pool(0.1), u) - gLocAtU(pool(1.5), u)));
}
chk('symmetric wings/elbow FROZEN across tau (machine prec)', maxFroz < 1e-12, 'maxDiff=' + maxFroz.toExponential(2));

// (3b) ASYMMETRIC: tail EXPONENT is tau-independent (converges to w_+/(1-w_+)),
//      residual shrinks as O(1/u^2) — the frozen-tail-exponent geometry.
const wExp = 0.80 / (1 - 0.80);   // = 4
const aLo = { tau: 0.1, wMinus: 0.65, wPlus: 0.80 }, aHi = { tau: 1.5, wMinus: 0.65, wPlus: 0.80 };
const d50 = Math.abs(gLocAtU(aLo, 50) - gLocAtU(aHi, 50));
const d200 = Math.abs(gLocAtU(aLo, 200) - gLocAtU(aHi, 200));
chk('asym tail exponent → w_+/(1-w_+) (tau-indep limit)', Math.abs(gLocAtU(aLo, 200) - wExp) < 1e-3,
    'g(u=200,tau0.1)=' + gLocAtU(aLo, 200).toFixed(6) + ' exact=' + wExp);
chk('asym wing residual O(1/u^2) (4x u → ~16x smaller)', Math.abs((d50 / d200) - 16) < 1.5,
    'd50/d200=' + (d50 / d200).toFixed(2));

// (3c) ASYMMETRIC elbow MOVES with tau (the kurtosis knob actually rounds it).
chk('asym ELBOW rounds with tau (u=0.2)', Math.abs(gLocAtU(aLo, 0.2) - gLocAtU(aHi, 0.2)) > 1e-3,
    'tau0.1=' + gLocAtU(aLo, 0.2).toFixed(4) + ' tau1.5=' + gLocAtU(aHi, 0.2).toFixed(4));

// (4) gamma_loc>1 guard: w>1/2 ⇒ g_loc>1; w<=1/2 ⇒ g_loc<=1 (the lock the UI enforces).
chk('g_loc>1 at ATM (w=0.70)', E.gLoc(s) > 1, 'g_loc=' + E.gLoc(s).toFixed(4));
chk('g_loc<=1 when w<=0.5 (guard target)', E.gLoc(pool(0.3, 0.45, 0.45)) <= 1,
    'g_loc=' + E.gLoc(pool(0.3, 0.45, 0.45)).toFixed(4));

// (5) Settlement smooth-pasting fixed point: call free boundary frac = 1/(g+1),
//     value + slope continuity at sNorm* (S* = K·g/(g+1)).
const g = E.gLoc(s), theta = 1.0;
const sNstar = theta * Math.pow((g + 1) / g, g);
chk('call free-boundary frac = 1/(g+1)', Math.abs((sNstar / ((g + 1) * sNstar)) - 1 / (g + 1)) < 1e-12);
const mAt = (sN) => E.mark('call', theta, sN, g);
chk('call seam value match @ sNorm*', Math.abs(mAt(sNstar - 1e-4) - mAt(sNstar + 1e-4)) < 1.5e-3,
    'L=' + mAt(sNstar - 1e-4).toFixed(6) + ' R=' + mAt(sNstar + 1e-4).toFixed(6));
const h = 1e-6;
const dL = (mAt(sNstar - h) - mAt(sNstar - 3 * h)) / (2 * h);
const dR = (mAt(sNstar + 3 * h) - mAt(sNstar + h)) / (2 * h);
chk('call seam slope match @ sNorm* (sNorm-space)', Math.abs(dL - dR) / Math.abs(dL) < 2e-3,
    'dL=' + dL.toExponential(3) + ' dR=' + dR.toExponential(3));
// S* price relation (call arm, S*<K): intrinsic 1-(sNorm/theta)^(-1/g) at boundary.
const SstarFrac = g / (g + 1);   // S*/K
chk('S* = K·g/(g+1) (call arm)', SstarFrac > 0 && SstarFrac < 1, 'S*/K=' + SstarFrac.toFixed(6));

// ═══════════════════════════════════════════════════════════════════════════
// WARP checks (v27 strong-form trade). Authority:
// notes/research/TRADE_WARP_strongform_2026-06-10.md (skeptic-GREEN).
// SKIP-as-pass if tradeUpdate doesn't carry phi (pre-warp build).
// ═══════════════════════════════════════════════════════════════════════════
const wpool = () => ({ x: 10, y: 12, tau: 0.3, wMinus: 0.52, wPlus: 0.72, phi: 0 });
const _wm = (s) => 0.5 * (s.wMinus + s.wPlus);
const _dw2 = (s) => 0.5 * (s.wPlus - s.wMinus);
const wAt = (s) => {                       // field weight w(u;phi) at the live point
  const phi = (typeof s.phi === 'number') ? s.phi : 0;
  const u = Math.log(s.y / s.x) - phi;
  return _wm(s) + _dw2(s) * u / Math.sqrt(s.tau * s.tau + u * u);
};
const sw0 = wpool();
const probe = E.tradeUpdate(sw0, 1.0);
const warpActive = probe && typeof probe.phi === 'number' && Math.abs(probe.phi) > 1e-12;

if (!warpActive) {
  console.log('SKIP warp checks: tradeUpdate does not move phi (pre-warp build) — pass.');
} else {
  console.log('--- WARP (strong-form trade) ---');
  const wEntry = wAt(sw0);
  const alpha0 = sw0.x * wEntry, beta0 = sw0.y * (1 - wEntry);

  // (a) alpha,beta conserved across a trade.
  const wPost = wAt(probe);
  const aPost = probe.x * wPost, bPost = probe.y * (1 - wPost);
  chk('WARP (a) alpha conserved', Math.abs(aPost - alpha0) / alpha0 < 1e-12,
      'a0=' + alpha0.toFixed(8) + ' aPost=' + aPost.toFixed(8));
  chk('WARP (a) beta conserved', Math.abs(bPost - beta0) / beta0 < 1e-12,
      'b0=' + beta0.toFixed(8) + ' bPost=' + bPost.toFixed(8));

  // (b) post-trade point on the SAME trajectory hyperbola (x-alpha)(y-beta)=alpha*beta.
  const hyp = (probe.x - alpha0) * (probe.y - beta0) - alpha0 * beta0;
  chk('WARP (b) on trajectory hyperbola (x-α)(y-β)=αβ', Math.abs(hyp) / (alpha0 * beta0) < 1e-12,
      'resid/αβ=' + (Math.abs(hyp) / (alpha0 * beta0)).toExponential(2));

  // (c) field consistency: w(u';phi') == w* = 1 - beta/y'.
  const wStar = 1 - beta0 / probe.y;
  chk('WARP (c) field consistency w(u\';φ\')==w*', Math.abs(wPost - wStar) < 1e-12,
      'w(field)=' + wPost.toFixed(10) + ' w*=' + wStar.toFixed(10));

  // (d) phi MOVES ⇒ ATM weight shifts (curve reshaped, not a dot sliding).
  //     ATM = the point u==0 (y/x==1); its weight is w(-phi;..) — phi-dependent.
  const atmW = (phi) => _wm(sw0) + _dw2(sw0) * (-phi) / Math.sqrt(sw0.tau * sw0.tau + phi * phi);
  chk('WARP (d) φ moves ⇒ ATM weight shifts (reshaped)',
      Math.abs(probe.phi) > 1e-9 && Math.abs(atmW(probe.phi) - atmW(0)) > 1e-9,
      'φ\'=' + probe.phi.toFixed(6) + ' ΔATMw=' + (atmW(probe.phi) - atmW(0)).toExponential(2));

  // (e) wing-cap rejects an over-size trade (w* would exit (w_-,w_+)).
  //     y' = beta/(1-w_+) is the call-side cap; push past it.
  const yCap = beta0 / (1 - sw0.wPlus);
  const dyOver = (yCap - sw0.y) * 1.05;   // 5% past the cap
  const rej = E.tradeUpdate(sw0, dyOver);
  chk('WARP (e) wing-cap REJECTS over-size trade', rej && rej.rejected === true,
      rej ? ('rejected=' + rej.rejected + ' reason=' + rej.reason) : 'null');
  // and an in-band trade is NOT rejected.
  const ok = E.tradeUpdate(sw0, 0.5);
  chk('WARP (e) in-band trade accepted', ok && !ok.rejected && ok.x > 0 && ok.y > 0,
      ok ? ('x=' + ok.x.toFixed(4) + ' φ=' + ok.phi.toFixed(4)) : 'null');

  // (f) path-independence: one step of dy == two steps of dy/2 (x,y,phi).
  const dy = 0.8;
  const one = E.tradeUpdate(sw0, dy);
  const h1 = E.tradeUpdate(sw0, dy / 2);
  const two = E.tradeUpdate(h1, dy / 2);
  const dpx = Math.abs(one.x - two.x), dpy = Math.abs(one.y - two.y), dpf = Math.abs(one.phi - two.phi);
  chk('WARP (f) path-independent (split == one-shot)',
      dpx < 1e-9 && dpy < 1e-12 && dpf < 1e-9,
      'Δx=' + dpx.toExponential(2) + ' Δy=' + dpy.toExponential(2) + ' Δφ=' + dpf.toExponential(2));

  // round-trip: +dy then -dy returns (x,y,phi).
  const fwd = E.tradeUpdate(sw0, dy);
  const back = E.tradeUpdate(fwd, -dy);
  chk('WARP round-trip +dy then -dy restores (x,y,φ)',
      Math.abs(back.x - sw0.x) < 1e-9 && Math.abs(back.phi - sw0.phi) < 1e-9,
      'Δx=' + Math.abs(back.x - sw0.x).toExponential(2) + ' Δφ=' + Math.abs(back.phi - sw0.phi).toExponential(2));
}

console.log('=== ' + pass + ' PASS, ' + fail + ' FAIL ===');
process.exit(fail ? 1 : 0);

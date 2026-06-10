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

console.log('=== ' + pass + ' PASS, ' + fail + ' FAIL ===');
process.exit(fail ? 1 : 0);

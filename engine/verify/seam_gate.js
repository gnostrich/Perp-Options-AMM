'use strict';
// Seam gate (v26b ITM/American smooth-pasting) — HARD GATE.
// Reads the v26b build, and for gamma in {1.5,2,3,4} asserts PER BRANCH:
//   (i)  value match AND slope match <= 0.15% at sNorm* (no jump / no kink);
//   (ii) DIRECTIONAL: the 1-S/K branch's exercise region is S<K (boundary below
//        K); the 1-K/S branch's is S>K (boundary above K). Keyed off the S-side
//        in PRICE space, NOT the wing-tag string, so an inverted-tag swap fails.
// Exit nonzero on any fail.
//
// Branch binding (per the build's mark()):
//   wing 'call' arm  = sNorm/theta branch -> 1-S/K, boundary S* = K*g/(g+1) < K.
//   wing 'put'  arm  = theta/sNorm branch -> 1-K/S, boundary S* = K*(g+1)/g > K.
const fs = require('fs'), vm = require('vm');
const FILE = process.argv[2] || 'temporal_mvp_v26b_itm.html';
const html = fs.readFileSync(FILE, 'utf8');
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m, eng;
while ((m = re.exec(html))) if (/id="engine"/.test(m[1])) eng = m[2];
if (!eng) { console.error('SEAM GATE: no engine script found in ' + FILE); process.exit(2); }
const E = vm.runInNewContext('(function(){' + eng + '\n;return Engine;})()',
  { Math, Map, Float64Array, Number, Object, Array, isFinite, isNaN, JSON, console });

// Detect the v26b engine: it exposes markFrac (the old saturating fraction) AND
// its mark() honours a 4th gamma argument (continuation runs PAST the strike).
// On a pre-v26b build (old saturating mark, no markFrac) the American rule does
// not apply — SKIP as pass so run_all.sh stays green for HEAD while this stays a
// HARD GATE for any build that actually carries the ITM change.
(function detect() {
  const hasFrac = typeof E.markFrac === 'function';
  // At an ITM call point (sNorm=2.5 > theta=1) the OLD mark saturates to 1; the
  // NEW gamma-aware mark gives the strike-intrinsic (≈0.368 at g=2) instead.
  const itmNew  = E.mark('call', 1.0, 2.5, 2);     // v26b: ~0.368
  const isV26b = hasFrac && Math.abs(itmNew - 1.0) > 1e-6;
  if (!isV26b) {
    console.log('SEAM GATE: SKIP — engine is pre-v26b (no American smooth-pasting mark). Nothing to assert.');
    process.exit(0);
  }
})();

const K = 80000;
const TOL = 0.15;   // percent, value AND slope
function open(g) { const gh = E.ghCalibrate(5, 400000, 80000, g); return Object.assign({}, gh, { alpha: 5, beta: 400000, x: 10, y: 800000 }); }
// pool sNorm when the oracle is S (price->coordinate via the live engine).
// v26c: this IS the strike registration theta = sNorm(K). Prefer the engine's
// own exported sNormStrike (so the seam's free boundaries derive from the SAME
// registration the mark path uses); fall back to the inline inverse on a build
// that predates the export. Both equal getSNorm(arbitrageToOracle(s0,S)).
const sNat = (s0, S) => (typeof E.sNormStrike === 'function')
  ? E.sNormStrike(s0, S)
  : E.getSNorm(E.arbitrageToOracle(s0, S));

let fails = 0;
function check(label, cond, detail) {
  if (!cond) { fails++; console.log('  FAIL ' + label + (detail ? '  ' + detail : '')); }
  else console.log('  ok   ' + label + (detail ? '  ' + detail : ''));
}

console.log('SEAM GATE — v26b ITM/American smooth-pasting   file=' + FILE + '   tol=' + TOL + '%\n');

for (const g of [1.5, 2, 3, 4]) {
  const s0 = open(g);
  const gamma = s0.ghAh - 1;   // gamma recovered from GH shape (ghAh = gamma+1)
  console.log('gamma=' + g + '  (ghAh-1=' + gamma.toFixed(6) + ')');
  check('gamma recovered from ghAh', Math.abs(gamma - g) < 1e-9, 'ghAh-1=' + gamma);

  // theta = strike ray = pool sNorm at the strike price K (live).
  const theta = sNat(s0, K);

  // NOTE on slope measurement. Value match is tested in PRICE space (clean).
  // Slope is tested in sNorm space: d(mark)/dS = d(mark)/d(sNorm) · d(sNorm)/dS,
  // and d(sNorm)/dS is the SAME GH-table factor on the continuation and the
  // intrinsic side, so it cancels in the cont/intrinsic ratio — equal sNorm-
  // slopes ⟺ equal price-slopes EXACTLY. Differencing the price-space mark
  // directly instead aliases the GH table's piecewise-linear interpolation
  // (a double price→sNorm inversion per sample); that FD noise plateaus near
  // ~0.2% and does NOT shrink with h — it is a measurement artifact, not a
  // kink (value matches to 0.04%, no-jump is ~1e-7). We measure the structural
  // smooth-pasting quantity (d mark / d sNorm continuity), not the aliased proxy.

  // ===== Branch A: wing 'call' (sNorm/theta), intrinsic 1-S/K, S* < K =====
  {
    const sNstar = theta * Math.pow((g + 1) / g, g);      // boundary (closed form)
    const Sstar = K * Math.pow(sNstar / theta, -1 / g);   // = K*g/(g+1)
    const eps = 1e-6 * sNstar;
    // value at the boundary (price-space reference: intrinsic = 1 - S*/K = 1/(g+1))
    const valBdry  = E.mark('call', theta, sNstar, gamma);
    const intr     = 1 - Sstar / K;                                    // = 1/(g+1)
    // continuity across the boundary in sNorm
    const markCont = E.mark('call', theta, sNstar - eps, gamma);
    const markExer = E.mark('call', theta, sNstar + eps, gamma);
    // slope in sNorm, both sides (one-sided centered, away from the kink point)
    const dCont = (E.mark('call', theta, sNstar - eps, gamma) - E.mark('call', theta, sNstar - 3 * eps, gamma)) / (2 * eps);
    const dExer = (E.mark('call', theta, sNstar + 3 * eps, gamma) - E.mark('call', theta, sNstar + eps, gamma)) / (2 * eps);
    const vErr = Math.abs(valBdry / intr - 1) * 100;
    const sErr = Math.abs(dCont / dExer - 1) * 100;
    console.log('  branch A (1-S/K): S*/K=' + (Sstar / K).toFixed(4) + '  frac@bdry=' + intr.toFixed(4) +
                '  value ' + valBdry.toFixed(6) + ' vs ' + intr.toFixed(6) + ' (' + vErr.toFixed(3) + '%)' +
                '  slope(sNorm) ' + dCont.toExponential(4) + ' vs ' + dExer.toExponential(4) + ' (' + sErr.toFixed(4) + '%)');
    check('A value match <=' + TOL + '%', vErr <= TOL, vErr.toFixed(3) + '%');
    check('A slope match <=' + TOL + '%', sErr <= TOL, sErr.toFixed(4) + '%');
    check('A no jump @ boundary', Math.abs(markCont - markExer) < 5e-4, '|Δ|=' + Math.abs(markCont - markExer).toExponential(2));
    // DIRECTIONAL (price space): exercise region is S < K -> boundary below K
    check('A directional: S* < K (exercise S<K)', Sstar < K, 'S*=' + Sstar.toFixed(1) + ' K=' + K);
  }

  // ===== Branch B: wing 'put' (theta/sNorm), intrinsic 1-K/S, S* > K =====
  {
    const sNstar = theta * Math.pow(g / (g + 1), g);      // boundary (closed form)
    const Sstar = K * Math.pow(sNstar / theta, -1 / g);   // = K*(g+1)/g
    const eps = 1e-6 * sNstar;
    const valBdry  = E.mark('put', theta, sNstar, gamma);
    const intr     = 1 - K / Sstar;                                    // = 1/(g+1)
    // continuation is on the sNorm > sNstar side for branch B
    const markCont = E.mark('put', theta, sNstar + eps, gamma);
    const markExer = E.mark('put', theta, sNstar - eps, gamma);
    const dCont = (E.mark('put', theta, sNstar + 3 * eps, gamma) - E.mark('put', theta, sNstar + eps, gamma)) / (2 * eps);
    const dExer = (E.mark('put', theta, sNstar - eps, gamma) - E.mark('put', theta, sNstar - 3 * eps, gamma)) / (2 * eps);
    const vErr = Math.abs(valBdry / intr - 1) * 100;
    const sErr = Math.abs(dCont / dExer - 1) * 100;
    console.log('  branch B (1-K/S): S*/K=' + (Sstar / K).toFixed(4) + '  frac@bdry=' + intr.toFixed(4) +
                '  value ' + valBdry.toFixed(6) + ' vs ' + intr.toFixed(6) + ' (' + vErr.toFixed(3) + '%)' +
                '  slope(sNorm) ' + dCont.toExponential(4) + ' vs ' + dExer.toExponential(4) + ' (' + sErr.toFixed(4) + '%)');
    check('B value match <=' + TOL + '%', vErr <= TOL, vErr.toFixed(3) + '%');
    check('B slope match <=' + TOL + '%', sErr <= TOL, sErr.toFixed(4) + '%');
    check('B no jump @ boundary', Math.abs(markCont - markExer) < 5e-4, '|Δ|=' + Math.abs(markCont - markExer).toExponential(2));
    check('B directional: S* > K (exercise S>K)', Sstar > K, 'S*=' + Sstar.toFixed(1) + ' K=' + K);
  }
  console.log('');
}

if (fails > 0) { console.log('SEAM GATE: FAIL (' + fails + ' assertion(s))'); process.exit(1); }
console.log('SEAM GATE: PASS (value+slope <=' + TOL + '% AND directional, both branches, gamma in {1.5,2,3,4})');

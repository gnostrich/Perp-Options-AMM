'use strict';
// Directional-consistency gate (v26c strike-registration) — HARD GATE.
//
// The bug that survived every prior gate: gates tested SELF-CONSISTENCY, never
// economic DIRECTION. After registering the strike in the curve's own coordinate
// (theta = sNorm(K) = getSNorm(arbitrageToOracle(pool,K))), the displayed mark
// must agree in direction with funding's wing sign and with the moneyness sign.
//
// Per wing, this gate asserts the THREE signs align:
//   (1) sign(K - oracle)                     — moneyness of the strike vs spot
//   (2) funding wing sign (call:+2, put:-2)  — the ±2 in fundingPerStrike
//   (3) sign( d(mark)/d(sNorm) )             — slope of the registered mark,
//        measured in the curve's OWN coordinate (d/d-sNorm, NOT d/d-spot; the
//        spot derivative is opposite because the mark is reciprocal in S).
// Manager-verified alignment: CALL all +, PUT all - (they flip across wings).
//
// A wing/direction swap (mis-tagged leg, wrong registration basis) breaks the
// alignment -> this gate FAILS. The build's mark() arms are bound by S-direction,
// not the call/put tag string, so this is the genuine economic check.
//
// SKIP-as-pass on a build with no sNormStrike export (pre-v26c) so run_all.sh
// stays green for older HEADs while this is a HARD GATE for v26c+.
const fs = require('fs'), vm = require('vm');
const FILE = process.argv[2] || 'temporal_mvp_v26b_itm.html';
const html = fs.readFileSync(FILE, 'utf8');
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m, eng;
while ((m = re.exec(html))) if (/id="engine"/.test(m[1])) eng = m[2];
if (!eng) { console.error('DIR GATE: no engine script found in ' + FILE); process.exit(2); }
const E = vm.runInNewContext('(function(){' + eng + '\n;return Engine;})()',
  { Math, Map, Float64Array, Number, Object, Array, isFinite, isNaN, JSON, console });

if (typeof E.sNormStrike !== 'function') {
  console.log('DIR GATE: SKIP — engine has no sNormStrike export (pre-v26c registration). Nothing to assert.');
  process.exit(0);
}

const oracle = 80000;   // pool spot reference
function open(g) { const gh = E.ghCalibrate(5, 400000, 80000, g); return Object.assign({}, gh, { alpha: 5, beta: 400000, x: 10, y: 800000 }); }

let fails = 0;
function check(label, cond, detail) {
  if (!cond) { fails++; console.log('  FAIL ' + label + (detail ? '  ' + detail : '')); }
  else console.log('  ok   ' + label + (detail ? '  ' + detail : ''));
}

// Compute the three signs for (wing, K) at the given pool spot. Returns the
// three signed quantities; alignment is checked by the caller. `mark()` is the
// registered (theta=sNorm(K)) mark — the SAME path pfComponents displays.
function signs(s0, gamma, wing, K, markWing) {
  const st = E.arbitrageToOracle(s0, oracle);
  const sNormPool = E.getSNorm(st);
  const theta = E.sNormStrike(st, K);
  const eps = 1e-6 * sNormPool;
  const dmark = (E.mark(markWing, theta, sNormPool + eps, gamma)
               - E.mark(markWing, theta, sNormPool - eps, gamma)) / (2 * eps);
  return {
    sMoney: Math.sign(K - oracle),
    sFund:  (wing === 'call') ? +1 : -1,   // sign of fundingPerStrike's +-2
    sSlope: Math.sign(dmark),
    theta, sNormPool, dmark,
  };
}

// Crossover-at-K (spec check 1): the OTM->ITM crossover of the registered mark
// must land at the dollar strike K for every gamma — NOT at the drift point
// oracle0^2/K that the old price-ratio ray (theta=K/oracle) produced for gamma>1.
// The crossover is where the pool sNorm equals the registered strike sNorm
// (theta=sNorm(K)); by construction that is the oracle = K. We sweep the live
// oracle and locate the sign change of (sNormPool - theta).
function crossoverOracle(s0, K) {
  let prev = null, cross = null;
  for (let i = 0; i <= 20000; i++) {
    const o = 60000 + i * 5;
    const st = E.arbitrageToOracle(s0, o);
    const d = E.getSNorm(st) - E.sNormStrike(st, K);
    if (prev !== null && Math.sign(d) !== Math.sign(prev) && cross === null) cross = o;
    prev = d;
  }
  return cross;
}

console.log('DIR GATE — strike-registration directional consistency   file=' + FILE + '\n');

const Kx = 84000, ORACLE0 = 80000;
console.log('crossover-at-K (spec check 1): want oracle=' + Kx + ' (NOT drift oracle0^2/K=' +
            (ORACLE0 * ORACLE0 / Kx).toFixed(0) + ')');
for (const g of [1.5, 2, 3, 4]) {
  const s0 = open(g);
  const cx = crossoverOracle(s0, Kx);
  const err = Math.abs(cx - Kx);
  console.log('  gamma=' + g + ' crossover oracle=' + cx + ' (|err|=' + err + ')');
  check('gamma=' + g + ' crossover at K', err <= 5, 'oracle=' + cx + ' K=' + Kx);
}
console.log('');

for (const g of [1.5, 2, 3, 4]) {
  const s0 = open(g);
  const gamma = s0.ghAh - 1;
  console.log('gamma=' + g);
  // CALL wing: K above spot (OTM call) -> all three signs +.
  // PUT  wing: K below spot (OTM put)  -> all three signs -.
  for (const [wing, K, want] of [['call', 84000, +1], ['put', 76000, -1]]) {
    const r = signs(s0, gamma, wing, K, wing);   // markWing == wing (correct registration)
    console.log('  ' + wing + ' K=' + K + ': sign(K-oracle)=' + r.sMoney +
                ' fund=' + r.sFund + ' d(mark)/dsNorm=' + r.dmark.toExponential(3) +
                ' (sign ' + r.sSlope + ')  theta=' + r.theta.toFixed(4));
    check(wing + ' moneyness sign == want', r.sMoney === want, 'got ' + r.sMoney);
    check(wing + ' funding sign == moneyness', r.sFund === r.sMoney);
    check(wing + ' d(mark)/dsNorm sign == funding', r.sSlope === r.sFund);
  }

  // MUTATION self-test: register the CALL strike but read the mark on the PUT
  // arm (a wing/direction swap). The slope sign must then DISAGREE with the
  // call funding sign — proving the gate actually catches a swap.
  {
    const r = signs(s0, gamma, 'call', 84000, 'put');   // swapped mark arm
    check('mutation (swapped arm) DETECTED', r.sSlope !== (+1),
          'swapped d(mark)/dsNorm sign=' + r.sSlope + ' (must differ from call fund +1)');
  }
  console.log('');
}

if (fails > 0) { console.log('DIR GATE: FAIL (' + fails + ' assertion(s))'); process.exit(1); }
console.log('DIR GATE: PASS (CALL +++ / PUT ---, mutation detected, gamma in {1.5,2,3,4})');

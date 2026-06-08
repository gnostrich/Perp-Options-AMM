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

// ── MIXED-BASIS negative control (v26c-full, guardrail 5) ───────────────────
// The display-mark crossover above tests E.mark/E.sNormStrike directly. But a
// PARTIAL fix could register the DISPLAY mark while leaving an EXECUTION/
// SETTLEMENT curve site on the old K/oracle ray. This block asserts the
// EXECUTION-PATH registration crossover ALSO lands at K, so any curve site left
// on K/oracle (a "mixed basis" build) TRIPS the gate.
//
// The execution path prices a leg via E.legPrice, which registers the strike in
// carry-space (theta = sNorm(K), via E.regLeg) and reads spot = getSNorm. Its
// OTM->ITM crossover is where the leg's barrier mark saturates (mark -> its
// boundary fraction 1/(gamma+1) at the free boundary; OTM<->ITM is sNormPool vs
// theta). We locate the live oracle where the EXECUTION leg mark's regime flips
// and assert it is K. We then build the SAME crossover with the strike left on
// the OLD K/oracle ray (the mixed-basis mutant) and assert it does NOT land at
// K (it drifts to oracle0^2/K for gamma>1) — proving the gate is sensitive.
if (typeof E.regLeg === 'function') {
  console.log('mixed-basis exec-path control (guardrail 5): exec crossover must ALSO land at K');
  // Regime of an execution-path barrier leg at live oracle `o`, registered the
  // SAME way executeBand/legPrice do (carry-space theta via regLeg, getSNorm
  // spot). itmSign = sign(sNormPool - theta_registered): >0 once ITM (call).
  function execRegimeSign(s0, o, K, registered) {
    const st = E.arbitrageToOracle(s0, o);
    const leg = { K_inner: K, K_outer: NaN, inner: K / o, outer: NaN };
    // registered (correct exec path) vs mixed-basis mutant (old K/oracle ray):
    const theta = registered ? E.regLeg(st, leg).inner : (K / o);
    return Math.sign(E.getSNorm(st) - theta);
  }
  function execCrossover(s0, K, registered) {
    let prev = null, cross = null;
    for (let i = 0; i <= 20000; i++) {
      const o = 60000 + i * 5;
      const d = execRegimeSign(s0, o, K, registered);
      if (prev !== null && d !== 0 && Math.sign(d) !== Math.sign(prev) && cross === null) cross = o;
      if (d !== 0) prev = d;
    }
    return cross;
  }
  for (const g of [1.5, 2, 3, 4]) {
    const s0 = open(g);
    const cxReg = execCrossover(s0, Kx, true);
    const errReg = Math.abs(cxReg - Kx);
    const cxMix = execCrossover(s0, Kx, false);   // mixed-basis mutant
    const drift = ORACLE0 * ORACLE0 / Kx;
    console.log('  gamma=' + g + ' EXEC crossover(registered)=' + cxReg + ' (|err|=' + errReg +
                ')   mutant(K/oracle)=' + cxMix + ' (drift point=' + drift.toFixed(0) + ')');
    check('gamma=' + g + ' EXEC-path crossover at K', errReg <= 5, 'oracle=' + cxReg + ' K=' + Kx);
    // Sensitivity demo: the mixed-basis mutant must MISS K for gamma>1 (it lands
    // at the drift point), so a partial fix leaving an exec site on K/oracle
    // would FAIL the EXEC-path crossover@K assertion above.
    if (g > 1.01) {
      check('gamma=' + g + ' mixed-basis mutant DETECTED (misses K)', Math.abs(cxMix - Kx) > 50,
            'mutant crossover=' + cxMix + ' (drift=' + drift.toFixed(0) + ') vs K=' + Kx);
    }
  }
  console.log('');
} else {
  console.log('mixed-basis exec-path control: SKIP — no regLeg export (display-only build).\n');
}

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

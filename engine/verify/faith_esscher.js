'use strict';
// ════════ FAITH GATE 1 — trade = Esscher tilt translation (GHJ slope law) ════════
// Holds the LIVE engine to the proven construct `gh_slope_law` / `esscher_core`
// (formal/INDEX.md, GROUNDED): a trade acts as a TRANSLATION of the latent
// coordinate u; the geometric reserve slope obeys |dy/dx| = P·e^(u−μ) (the
// Esscher tilt density ratio f_{β+1}/f_β = e^(u−μ)·/M times the reserve scales).
//
// PASS bar (every walked state, gamma in {1.5,2,3,4}):
//   (E1) FD slope == ghP·e^(u−ghMu), rel err <= TOL_FD. The slope is MEASURED by
//        central-difference tradeUpdate — NOT getMP_raw alone (THE gotcha:
//        getMP_raw is the price COORDINATE, e^ghMu larger than the slope).
//        u is read back through getMP_raw∘invTail(X) — an INDEPENDENT code path
//        from tradeUpdate's invB1(Y), so E1 is not circular: it ties the two
//        reserve legs together exactly through the tilt law.
//   (E2) gauge scalars (ghP, ghMu, ghNx, ghNy, ghM) BIT-IDENTICAL under trade
//        (the translation moves ONLY the latent coordinate).
//   (E3) translation group law: tradeUpdate∘tradeUpdate == tradeUpdate(sum),
//        rel err <= 1e-9 (path independence of the one-parameter group).
//   (E4) tilt-translation ratio: slope_j/slope_i == mp_j/mp_i (e^μ cancels —
//        basis independence, R5), rel err <= TOL_FD.
//
// TOL_FD = 0.5%. Derivation (measured on clean v26c, 2026-06-10): the CDF table
// is piecewise-linear (dv=0.002), so a central difference returns the table
// cell's chord slope; the error PLATEAUS at ~1.1e-3 and does NOT shrink with h
// (h=1e-6 and 5e-7 give identical worst error — measurement artifact of the
// interpolation, same aliasing the seam gate documents). TOL_FD = 0.005 ≈ 4.5×
// the measured plateau: tight enough to catch any e^μ-class basis error
// (factor 11.7–13780) by >3 orders of magnitude.
//
// NEGATIVE CONTROL (built-in + --mutate): the mutation is THE gotcha itself —
// compare the FD slope to getMP_raw directly (drop the e^(−ghMu)). In normal
// mode the gate asserts this mutant is DETECTED (off by e^ghMu = 11.7/44.5/
// 749/13780 at γ=1.5/2/3/4, i.e. >10^3×TOL). With --mutate the mutant relation
// REPLACES E1 and the gate exits 1. Demonstrated on clean v26c (2026-06-10):
//   normal:   FAITH-ESSCHER: PASS
//   --mutate: "E1(MUTATED ...)" fails at every state -> FAITH-ESSCHER: FAIL, exit 1.
const fs = require('fs'), vm = require('vm');
const FILE = process.argv[2] || 'temporal_mvp_v26b_itm.html';
const MUTATE = process.argv.includes('--mutate');
const html = fs.readFileSync(FILE, 'utf8');
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m, eng;
while ((m = re.exec(html))) if (/id="engine"/.test(m[1])) eng = m[2];
if (!eng) { console.error('FAITH-ESSCHER: no engine script found in ' + FILE); process.exit(2); }
const E = vm.runInNewContext('(function(){' + eng + '\n;return Engine;})()',
  { Math, Map, Float64Array, Number, Object, Array, isFinite, isNaN, JSON, console });
if (typeof E.ghCalibrate !== 'function') {
  console.log('FAITH-ESSCHER: SKIP — engine has no ghCalibrate (pre-GH build). Nothing to assert.');
  process.exit(0);
}

const TOL_FD = 0.005;   // see derivation in header (measured plateau ~1.1e-3)
function open(g) { const gh = E.ghCalibrate(5, 400000, 80000, g); return Object.assign({}, gh, { alpha: 5, beta: 400000, x: 10, y: 800000 }); }

let fails = 0;
function check(label, cond, detail) {
  if (!cond) { fails++; console.log('  FAIL ' + label + (detail ? '  ' + detail : '')); }
  else console.log('  ok   ' + label + (detail ? '  ' + detail : ''));
}

// central-difference geometric slope at state s (h-independent plateau, see header)
function fdSlope(s) {
  const dy = (s.y - s.beta) * 1e-6;
  const sp = E.tradeUpdate(s, dy), sm = E.tradeUpdate(s, -dy);
  if (!sp || !sm) return NaN;
  return Math.abs((sp.y - sm.y) / (sp.x - sm.x));
}

console.log('FAITH-ESSCHER — trade = tilt translation, slope = P·e^(u−μ)   file=' + FILE +
            '   TOL_FD=' + (TOL_FD * 100) + '%' + (MUTATE ? '   [--mutate: law replaced by getMP_raw — must FAIL]' : '') + '\n');

for (const g of [1.5, 2, 3, 4]) {
  const s0 = open(g);
  console.log('gamma=' + g + '  (e^ghMu=' + Math.exp(s0.ghMu).toFixed(1) + ')');
  let s = s0, walked = [];
  let worstE1 = 0, worstMut = Infinity, gaugeOK = true;
  for (let step = 0; step < 10; step++) {
    const mp = E.getMP_raw(s);
    const u = Math.log(mp / s.ghP);                       // latent coordinate via the X-leg inversion
    const law = MUTATE ? mp                                // MUTATED: price coordinate (THE gotcha)
                       : s.ghP * Math.exp(u - s.ghMu);     // proven slope law P·e^(u−μ)
    const slope = fdSlope(s);
    const err = Math.abs(slope / law - 1);
    if (err > worstE1) worstE1 = err;
    // built-in mutant: how far is the price-coordinate reading from the geometry?
    const mutErr = Math.abs(slope / mp - 1);
    if (mutErr < worstMut) worstMut = mutErr;
    // E2 gauge invariance (bit-identical scalars)
    if (!(s.ghP === s0.ghP && s.ghMu === s0.ghMu && s.ghNx === s0.ghNx && s.ghNy === s0.ghNy && s.ghM === s0.ghM)) gaugeOK = false;
    walked.push({ s, slope, mp });
    const next = E.tradeUpdate(s, -(s.y - s.beta) * 0.18);  // walk down the Y reserve
    if (!next) break;
    s = next;
  }
  check('E1 slope law' + (MUTATE ? ' (MUTATED: vs getMP_raw)' : ' (vs P·e^(u−μ))') + ' <=' + TOL_FD * 100 + '% at ' + walked.length + ' states',
        worstE1 <= TOL_FD, 'worst=' + worstE1.toExponential(3));
  check('E2 gauge scalars bit-identical under trade', gaugeOK);
  // E3 translation group law (path independence)
  const a = E.tradeUpdate(E.tradeUpdate(s0, -30000), -50000);
  const b = E.tradeUpdate(s0, -80000);
  const e3 = Math.abs(a.x / b.x - 1) + Math.abs(a.y / b.y - 1);
  check('E3 group law (d1∘d2 == d1+d2) <=1e-9', e3 <= 1e-9, 'resid=' + e3.toExponential(3));
  // E4 tilt-translation: slope ratio == mp ratio between walked states (e^μ cancels)
  let worstE4 = 0;
  for (let i = 1; i < walked.length; i++) {
    const rs = walked[i].slope / walked[0].slope, rm = walked[i].mp / walked[0].mp;
    worstE4 = Math.max(worstE4, Math.abs(rs / rm - 1));
  }
  check('E4 slope-ratio == mp-ratio <=' + TOL_FD * 100 + '%', worstE4 <= TOL_FD, 'worst=' + worstE4.toExponential(3));
  if (!MUTATE) {
    // negative-control sensitivity: the price-coordinate mutant must be FAR off
    check('mutant (slope vs getMP_raw) DETECTED (>10×TOL off)', worstMut > 10 * TOL_FD,
          'mutant min err=' + worstMut.toExponential(3) + ' (≈e^ghMu−1)');
  }
  console.log('');
}

if (fails > 0) { console.log('FAITH-ESSCHER: FAIL (' + fails + ' assertion(s))'); process.exit(1); }
console.log('FAITH-ESSCHER: PASS (slope=P·e^(u−μ) on the LIVE engine, translation group + gauge invariance, gamma in {1.5,2,3,4})');

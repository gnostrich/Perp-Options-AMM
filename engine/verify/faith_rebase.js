'use strict';
// ════════ FAITH GATE 2 — rebase is a gauge move: sNorm-quantities invariant ════════
// Holds the LIVE engine to the proven construct `R_form_rebase_invariant` (PH6,
// formal/INDEX.md, GROUNDED): rebase r is a pure gauge transformation
// (x→r·x, α→r·α, Nx→r·Nx, P→P/r; dollar prices scale by 1/r so a strike K maps
// to K/r) that leaves every sNorm-space (gauge degree-0) quantity invariant.
//
// PASS bar (r in {0.5, 1.1, 2, 5}, gamma in {1.5,2,3,4}, rel tol TOL = 1e-12):
//   (R1) getSNorm(rebase(s,r)) == getSNorm(s)
//   (R2) sNormStrike(rebase(s,r), K/r) == sNormStrike(s, K)   (registered strike
//        is gauge degree-0 when the dollar strike is carried through the gauge)
//   (R3) mark(wing, θ_reb, sNorm_reb, γ) == mark(wing, θ, sNorm, γ), both wings
//   (R4) getMP_raw(rebase(s,r)) == getMP_raw(s)/r              (price coord is
//        gauge degree −1 — the ONLY thing that scales)
//   (R5) arbitrage commutes with the gauge:
//        getSNorm(arb(rebase(s,r), o/r)) == getSNorm(arb(s, o))
//   (R6) gauge group law: rebase(rebase(s,r1),r2) == rebase(s,r1·r2) field-wise
//   (R7) bookkeeping BIT-EXACT: ghMu, ghM, ghNy, beta, y invariant;
//        ghNx == ghNx·r and ghP == ghP/r exactly as written.
// TOL derivation: rebase is scalar multiplication and u = log(o)−log(P) shifts
// cancel exactly; measured worst residual on clean v26c is 4.4e-16 (pure FP).
// TOL = 1e-12 gives 3.5 orders of headroom while catching ANY real basis error.
//
// NEGATIVE CONTROL (built-in + --mutate): the mutation FORGETS the gauge on the
// strike — feeds the UNSCALED dollar K to the rebased pool (R2 with K instead
// of K/r). Measured on clean v26c at r=2, γ=2: θ_mutant=0.2269 vs θ=0.9071 —
// off by ~75%, i.e. >10^11×TOL. Normal mode asserts this mutant is DETECTED;
// with --mutate it REPLACES R2/R3 and the gate exits 1. Demonstrated 2026-06-10:
//   normal:   FAITH-REBASE: PASS
//   --mutate: R2/R3 fail at every (r,γ) -> FAITH-REBASE: FAIL, exit 1.
const fs = require('fs'), vm = require('vm');
const FILE = process.argv[2] || 'temporal_mvp_v26b_itm.html';
const MUTATE = process.argv.includes('--mutate');
const html = fs.readFileSync(FILE, 'utf8');
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m, eng;
while ((m = re.exec(html))) if (/id="engine"/.test(m[1])) eng = m[2];
if (!eng) { console.error('FAITH-REBASE: no engine script found in ' + FILE); process.exit(2); }
const E = vm.runInNewContext('(function(){' + eng + '\n;return Engine;})()',
  { Math, Map, Float64Array, Number, Object, Array, isFinite, isNaN, JSON, console });
if (typeof E.ghCalibrate !== 'function') {
  console.log('FAITH-REBASE: SKIP — engine has no ghCalibrate (pre-GH build). Nothing to assert.');
  process.exit(0);
}
const hasReg = typeof E.sNormStrike === 'function';   // pre-v26c: R2/R3 use inline registration
const sStrike = hasReg ? E.sNormStrike : ((s, K) => E.getSNorm(E.arbitrageToOracle(s, K)));

const TOL = 1e-12;   // measured worst 4.4e-16 on clean v26c (see header)
function open(g) { const gh = E.ghCalibrate(5, 400000, 80000, g); return Object.assign({}, gh, { alpha: 5, beta: 400000, x: 10, y: 800000 }); }

let fails = 0;
function check(label, cond, detail) {
  if (!cond) { fails++; console.log('  FAIL ' + label + (detail ? '  ' + detail : '')); }
  else console.log('  ok   ' + label + (detail ? '  ' + detail : ''));
}
const rel = (a, b) => Math.abs(a / b - 1);

console.log('FAITH-REBASE — gauge invariance of sNorm-quantities   file=' + FILE +
            '   TOL=' + TOL + (MUTATE ? '   [--mutate: strike gauge dropped (K not K/r) — must FAIL]' : '') + '\n');

const K = 84000, ORACLE = 95000;
for (const g of [1.5, 2, 3, 4]) {
  const s0 = open(g);
  const gam = s0.ghAh - 1;
  const sn0 = E.getSNorm(s0), th0 = sStrike(s0, K), mp0 = E.getMP_raw(s0);
  const mk0c = E.mark('call', th0, sn0, gam), mk0p = E.mark('put', th0, sn0, gam);
  const arb0 = E.getSNorm(E.arbitrageToOracle(s0, ORACLE));
  let w = { R1: 0, R2: 0, R3: 0, R4: 0, R5: 0, R6: 0 }, r7 = true, mutWorst = 0;
  for (const r of [0.5, 1.1, 2, 5]) {
    const sr = E.rebase(s0, r);
    const Kg = MUTATE ? K : K / r;                       // MUTATED: forget the strike gauge
    const th = sStrike(sr, Kg), sn = E.getSNorm(sr);
    w.R1 = Math.max(w.R1, rel(sn, sn0));
    w.R2 = Math.max(w.R2, rel(th, th0));
    w.R3 = Math.max(w.R3, rel(E.mark('call', th, sn, gam), mk0c), rel(E.mark('put', th, sn, gam), mk0p));
    w.R4 = Math.max(w.R4, rel(E.getMP_raw(sr), mp0 / r));
    w.R5 = Math.max(w.R5, rel(E.getSNorm(E.arbitrageToOracle(sr, ORACLE / r)), arb0));
    // R6 group law
    const s2a = E.rebase(E.rebase(s0, r), 3), s2b = E.rebase(s0, r * 3);
    w.R6 = Math.max(w.R6, rel(s2a.x, s2b.x), rel(s2a.alpha, s2b.alpha), rel(s2a.ghNx, s2b.ghNx), rel(s2a.ghP, s2b.ghP));
    // R7 bookkeeping bit-exact
    if (!(sr.ghMu === s0.ghMu && sr.ghM === s0.ghM && sr.ghNy === s0.ghNy && sr.beta === s0.beta &&
          sr.y === s0.y && sr.ghNx === s0.ghNx * r && sr.ghP === s0.ghP / r)) r7 = false;
    // built-in mutant: unscaled K must be FAR off
    mutWorst = Math.max(mutWorst, rel(sStrike(sr, K), th0));
  }
  console.log('gamma=' + g + '  θ(K)=' + th0.toFixed(6) + '  sNorm=' + sn0.toFixed(6));
  check('R1 getSNorm invariant <=' + TOL, w.R1 <= TOL, 'worst=' + w.R1.toExponential(3));
  check('R2 sNormStrike(·, K/r) invariant <=' + TOL + (MUTATE ? ' (MUTATED: K unscaled)' : ''), w.R2 <= TOL, 'worst=' + w.R2.toExponential(3));
  check('R3 mark invariant (both wings) <=' + TOL, w.R3 <= TOL, 'worst=' + w.R3.toExponential(3));
  check('R4 getMP_raw scales 1/r <=' + TOL, w.R4 <= TOL, 'worst=' + w.R4.toExponential(3));
  check('R5 arb commutes with gauge <=' + TOL, w.R5 <= TOL, 'worst=' + w.R5.toExponential(3));
  check('R6 gauge group law <=' + TOL, w.R6 <= TOL, 'worst=' + w.R6.toExponential(3));
  check('R7 scalar bookkeeping bit-exact', r7);
  if (!MUTATE) check('mutant (K unscaled) DETECTED (>100×TOL off)', mutWorst > 100 * TOL, 'mutant resid=' + mutWorst.toExponential(3));
  console.log('');
}

if (fails > 0) { console.log('FAITH-REBASE: FAIL (' + fails + ' assertion(s))'); process.exit(1); }
console.log('FAITH-REBASE: PASS (rebase = gauge move; sNorm-quantities invariant on the LIVE engine, gamma in {1.5,2,3,4})');

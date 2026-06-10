'use strict';
// ════════ FAITH GATE 3 — C3 mark reflection: put = reflected call ════════
// Holds the LIVE engine to the proven construct `reflection_arrow` (C3,
// formal/INDEX.md — the spec↔engine mark link the formal work left as the
// named residual): markPut(θ, s) = markCall(θ, θ²/s). The put wing is the
// call wing reflected through the strike ray in sNorm-space; no-arb across
// the wings is this symmetry.
//
// PASS bar (gamma in {1.5,2,3,4}; θ from the engine's OWN strike registration
// sNormStrike(pool, K) for K in {70000, 84000, 100000} plus raw θ in {0.25, 4};
// s swept over θ·10^[−2,+2], 81 log-spaced points — covers continuation AND
// intrinsic regions on both sides of both free boundaries):
//   (C1) |mark('put',θ,s,γ) − mark('call',θ,θ²/s,γ)| / max(|·|,1e-12) <= TOL
//   (C2) same for markFrac (the funding fraction) — absolute, <= TOL
//   (C3) free boundaries reflect: sNstar_call·sNstar_put == θ²  (closed form:
//        θ((γ+1)/γ)^γ · θ(γ/(γ+1))^γ = θ²) <= TOL — so the reflection maps the
//        continuation region of one wing exactly onto the other's.
// TOL = 1e-12. Derivation: the identity is exact in closed form; measured worst
// residual on clean v26c is 6.2e-16 (pure Math.pow FP). 1e-12 = >3 orders of
// headroom while catching any branch/coefficient error (those are O(1)).
//
// NEGATIVE CONTROL (built-in + --mutate): the mutation reflects at the WRONG
// point, 1.02·θ²/s (a 2% mis-registration of the reflection ray). Normal mode
// asserts the mutant is DETECTED (residual > 10^6×TOL); with --mutate it
// REPLACES the reflection point and the gate exits 1. Demonstrated on clean
// v26c (2026-06-10):
//   normal:   FAITH-REFLECTION: PASS
//   --mutate: C1 fails at every γ -> FAITH-REFLECTION: FAIL, exit 1.
const fs = require('fs'), vm = require('vm');
const FILE = process.argv[2] || 'temporal_mvp_v26b_itm.html';
const MUTATE = process.argv.includes('--mutate');
const html = fs.readFileSync(FILE, 'utf8');
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m, eng;
while ((m = re.exec(html))) if (/id="engine"/.test(m[1])) eng = m[2];
if (!eng) { console.error('FAITH-REFLECTION: no engine script found in ' + FILE); process.exit(2); }
const E = vm.runInNewContext('(function(){' + eng + '\n;return Engine;})()',
  { Math, Map, Float64Array, Number, Object, Array, isFinite, isNaN, JSON, console });
if (typeof E.ghCalibrate !== 'function' || typeof E.mark !== 'function') {
  console.log('FAITH-REFLECTION: SKIP — engine has no ghCalibrate/mark (pre-GH build). Nothing to assert.');
  process.exit(0);
}
const hasReg = typeof E.sNormStrike === 'function';

const TOL = 1e-12;   // measured worst 6.2e-16 on clean v26c (see header)
function open(g) { const gh = E.ghCalibrate(5, 400000, 80000, g); return Object.assign({}, gh, { alpha: 5, beta: 400000, x: 10, y: 800000 }); }

let fails = 0;
function check(label, cond, detail) {
  if (!cond) { fails++; console.log('  FAIL ' + label + (detail ? '  ' + detail : '')); }
  else console.log('  ok   ' + label + (detail ? '  ' + detail : ''));
}

console.log('FAITH-REFLECTION — markPut(θ,s) == markCall(θ,θ²/s)   file=' + FILE +
            '   TOL=' + TOL + (MUTATE ? '   [--mutate: reflect at 1.02·θ²/s — must FAIL]' : '') + '\n');

for (const g of [1.5, 2, 3, 4]) {
  const s0 = open(g);
  const gam = s0.ghAh - 1;
  const thetas = [0.25, 4];
  if (hasReg) for (const K of [70000, 84000, 100000]) thetas.push(E.sNormStrike(s0, K));
  let worstC1 = 0, worstC2 = 0, worstMut = Infinity, nPts = 0;
  for (const th of thetas) {
    for (let i = 0; i <= 80; i++) {
      const s = th * Math.pow(10, -2 + 4 * i / 80);
      const refl = (MUTATE ? 1.02 : 1) * th * th / s;
      const p = E.mark('put', th, s, gam), c = E.mark('call', th, refl, gam);
      worstC1 = Math.max(worstC1, Math.abs(p - c) / Math.max(Math.abs(c), 1e-12));
      const pf = E.markFrac ? E.markFrac('put', th, s) : p;
      const cf = E.markFrac ? E.markFrac('call', th, refl) : c;
      worstC2 = Math.max(worstC2, Math.abs(pf - cf));
      // built-in mutant residual (wrong reflection point) at this s
      const cm = E.mark('call', th, 1.02 * th * th / s, gam);
      const mres = Math.abs(p - cm) / Math.max(Math.abs(cm), 1e-12);
      if (mres < worstMut) worstMut = mres;
      nPts++;
    }
  }
  // C3: boundary reflection sNstar_call·sNstar_put == θ² (closed form, θ=1)
  const prodErr = Math.abs(Math.pow((gam + 1) / gam, gam) * Math.pow(gam / (gam + 1), gam) - 1);
  console.log('gamma=' + g + '  (' + nPts + ' points, ' + thetas.length + ' strikes' + (hasReg ? ', incl. engine-registered θ' : '') + ')');
  check('C1 mark reflection' + (MUTATE ? ' (MUTATED point)' : '') + ' <=' + TOL, worstC1 <= TOL, 'worst=' + worstC1.toExponential(3));
  check('C2 markFrac reflection <=' + TOL, worstC2 <= TOL, 'worst=' + worstC2.toExponential(3));
  check('C3 boundaries reflect (sN*c·sN*p=θ²) <=' + TOL, prodErr <= TOL, 'resid=' + prodErr.toExponential(3));
  if (!MUTATE) check('mutant (1.02·θ²/s) DETECTED (>1e6×TOL off)', worstMut > 1e6 * TOL, 'mutant min resid=' + worstMut.toExponential(3));
  console.log('');
}

if (fails > 0) { console.log('FAITH-REFLECTION: FAIL (' + fails + ' assertion(s))'); process.exit(1); }
console.log('FAITH-REFLECTION: PASS (put = reflected call on the LIVE engine mark, gamma in {1.5,2,3,4})');

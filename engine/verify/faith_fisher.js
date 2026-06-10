'use strict';
// ════════ FAITH GATE 5 — curvature = variance (cgf''=Var=Fisher), engine shadow ════════
// Holds the LIVE engine to the proven constructs `cgf_deriv_mean_and_variance` /
// `cgf_convexOn` (UNIFY2/CLOSEOUT, formal/INDEX.md): the convex potential's
// derivatives are κ'(t)=mean of the t-tilted density, κ''(t)=Var_t (=Fisher, M).
//
// WHAT IS ENGINE-CHECKABLE (and what is not — no faked green):
// κ''(t) itself is a statement about the TILT parameter t; the engine exposes
// only two tilts (the reserve legs: X encodes f_β at t=0, Y encodes f_{β+1} at
// t=1 — the Esscher pair) plus the scalar ghM=e^{κ(1)}. There is therefore no
// direct engine-side second derivative in t. The nearest engine-computable
// identities are the EXACT integral forms of curvature=variance between the
// two tilts the engine DOES carry:
//   (F1)  Mean_{β+1} − Mean_β  =  ∫₀¹ Var_t dt          (κ'(1)−κ'(0)=∫κ'')
//   (F2)  log M_T  =  Mean_β + ∫₀¹ (1−t)·Var_t dt       (Taylor w/ remainder:
//                                            κ(1)=κ(0)+κ'(0)+∫(1−t)κ''(t)dt)
// where BOTH means are measured off the LIVE ENGINE's reserve curves
// (F_β = 1 − X/Nx, F_{β+1} = Y/(Ny·M), Stieltjes-summed over an
// arbitrageToOracle sweep) and the Var_t are GH-side quadratures computed in
// THIS harness. If the engine's reserve legs were NOT the t=0/t=1 members of
// the same exponential family (wrong tilt, wrong kernel, broken table), the
// mean displacement would not equal the integrated tilted variance.
//
// TRUNCATION HONESTY: the engine's table implements the GH TRUNCATED to a
// window v∈[vLo,vHi] (≈[−16,18]); truncation PRESERVES exponential-family
// structure, so F1/F2 are EXACT for the truncated family — the GH-side
// integrals are computed on the SAME window, which is DETECTED from the live
// engine (price-coordinate clamp at both extremes), not assumed. The
// full-support normalizer differs from the truncated one by the slow-decay
// tilt's tail mass (measured: 1.13e-4 at γ=1.5, <1e-8 at γ≥2) — that gap is
// printed and bounded in (F3), where the engine's ghM (a FULL-support Bessel
// scalar) is checked against the full-support quadrature.
//
// PASS bar (gamma in {1.5,2,3,4}):
//   (F1) rel resid <= 1e-4   (measured worst 1.4e-5 on clean v26c — table-grid
//        trapezoid vs harness quadrature; tolerance ≈7× measured)
//   (F2) rel resid <= 1e-4   (measured worst 1.0e-5)
//   (F3) ghM == full-support quadrature, rel <= 1e-8 (measured ~5e-10);
//        |log ghM − log M_T| (truncation gap) <= 2e-4, printed per γ.
//   (F4) window detection sane: vLo <= −10, vHi >= 10, vLo < 0 < vHi.
//
// NEGATIVE CONTROL (built-in + --mutate): the mutation scales the tilted
// variance by 1.01 (curvature ≠ variance by 1%). F1's residual then jumps to
// ~1e-2 (>>1e-4). Normal mode asserts the mutant is DETECTED; with --mutate it
// REPLACES the Var_t integrals and the gate exits 1. Demonstrated on clean
// v26c (2026-06-10):
//   normal:   FAITH-FISHER: PASS
//   --mutate: F1+F2 fail at every γ -> FAITH-FISHER: FAIL, exit 1.
const fs = require('fs'), vm = require('vm');
const FILE = process.argv[2] || 'temporal_mvp_v26b_itm.html';
const MUTATE = process.argv.includes('--mutate');
const html = fs.readFileSync(FILE, 'utf8');
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m, eng;
while ((m = re.exec(html))) if (/id="engine"/.test(m[1])) eng = m[2];
if (!eng) { console.error('FAITH-FISHER: no engine script found in ' + FILE); process.exit(2); }
const E = vm.runInNewContext('(function(){' + eng + '\n;return Engine;})()',
  { Math, Map, Float64Array, Number, Object, Array, isFinite, isNaN, JSON, console });
if (typeof E.ghCalibrate !== 'function') {
  console.log('FAITH-FISHER: SKIP — engine has no ghCalibrate (pre-GH build). Nothing to assert.');
  process.exit(0);
}

const TOL_REL = 1e-4, TOL_M = 1e-8, TOL_GAP = 2e-4;
const VARSCALE = MUTATE ? 1.01 : 1.0;   // MUTATED: curvature ≠ variance by 1%
function open(g) { const gh = E.ghCalibrate(5, 400000, 80000, g); return Object.assign({}, gh, { alpha: 5, beta: 400000, x: 10, y: 800000 }); }

// trapezoid moments of exp(b·v − a·√(δ²+v²)) on [lo,hi]
function mom(a, b, d, lo, hi, dv) {
  let C = 0, M1 = 0, M2 = 0, pf = 0, pv = 0;
  const n = Math.round((hi - lo) / dv);
  for (let i = 0; i <= n; i++) {
    const v = lo + i * dv, f = Math.exp(b * v - a * Math.sqrt(d * d + v * v));
    if (i > 0) { C += 0.5 * (pf + f) * dv; M1 += 0.5 * (pf * pv + f * v) * dv; M2 += 0.5 * (pf * pv * pv + f * v * v) * dv; }
    pf = f; pv = v;
  }
  const mean = M1 / C; return { C, mean, vr: M2 / C - mean * mean };
}

let fails = 0;
function check(label, cond, detail) {
  if (!cond) { fails++; console.log('  FAIL ' + label + (detail ? '  ' + detail : '')); }
  else console.log('  ok   ' + label + (detail ? '  ' + detail : ''));
}

console.log('FAITH-FISHER — curvature=variance via the engine\'s Esscher pair   file=' + FILE +
            '   TOL=' + TOL_REL + (MUTATE ? '   [--mutate: Var_t scaled ×1.01 — must FAIL]' : '') + '\n');

for (const g of [1.5, 2, 3, 4]) {
  const s0 = open(g);
  const ah = s0.ghAh, bh = s0.ghBh, d = s0.ghDelta;

  // ── detect the engine's table window from the LIVE engine (clamp readback) ──
  const vOf = (st) => Math.log(E.getMP_raw(st) / s0.ghP) - s0.ghMu;
  const vHi = vOf(E.arbitrageToOracle(s0, s0.ghP * Math.exp(s0.ghMu + 50)));
  const vLo = vOf(E.arbitrageToOracle(s0, s0.ghP * Math.exp(s0.ghMu - 50)));
  check('F4 window detected sane (vLo<=−10<0<10<=vHi)', vLo <= -10 && vHi >= 10,
        'window=[' + vLo.toFixed(3) + ', ' + vHi.toFixed(3) + ']');

  // ── ENGINE-side means of the latent under f_β and f_{β+1}, read off the reserves ──
  const dv = 0.002, n = Math.round((vHi - vLo) / dv);
  let mean0 = 0, mean1 = 0, pF0 = null, pF1 = null, pV = null;
  for (let i = 0; i <= n; i++) {
    const v = vLo + i * dv;
    const st = E.arbitrageToOracle(s0, s0.ghP * Math.exp(s0.ghMu + v));
    if (!st) { pF0 = null; continue; }
    const F0 = 1 - (st.x - st.alpha) / st.ghNx;        // F_β from the X reserve leg
    const F1 = (st.y - st.beta) / (st.ghNy * st.ghM);  // F_{β+1} from the Y reserve leg
    if (pF0 !== null) { mean0 += 0.5 * (v + pV) * (F0 - pF0); mean1 += 0.5 * (v + pV) * (F1 - pF1); }
    pF0 = F0; pF1 = F1; pV = v;
  }

  // ── GH-side: tilted variances on the SAME (detected) window + normalizers ──
  let I = 0, I2 = 0; const nt = 20;                     // Simpson over t∈[0,1]
  for (let j = 0; j <= nt; j++) {
    const t = j / nt, w = (j === 0 || j === nt) ? 1 : (j % 2 ? 4 : 2);
    const vr = mom(ah, bh + t, d, vLo, vHi, 0.0005).vr * VARSCALE;
    I += w * vr; I2 += w * (1 - t) * vr;
  }
  I *= (1 / nt) / 3; I2 *= (1 / nt) / 3;
  const C0T = mom(ah, bh, d, vLo, vHi, 0.0005).C, C1T = mom(ah, bh + 1, d, vLo, vHi, 0.0005).C;
  const logMT = Math.log(C1T / C0T);
  // full-support normalizer ratio for the ghM check
  const HI = 60 / Math.max(0.4, ah - bh - 1), LO = -60 / (ah + bh - 1);
  const Mfull = mom(ah, bh + 1, d, LO, HI, 0.001).C / mom(ah, bh, d, LO, HI, 0.001).C;

  const r1 = Math.abs((mean1 - mean0) / I - 1);
  const r2 = Math.abs((mean0 + I2) / logMT - 1);
  const r3 = Math.abs(s0.ghM / Mfull - 1);
  const gap = Math.abs(Math.log(s0.ghM) - logMT);
  console.log('gamma=' + g + '  eng mean_β=' + mean0.toPrecision(8) + '  eng mean_{β+1}=' + mean1.toPrecision(8) +
              '  ∫Var_t=' + I.toPrecision(8) + '  ∫(1−t)Var_t=' + I2.toPrecision(8));
  check('F1 Δmean(engine) == ∫₀¹Var_t dt <=' + TOL_REL + (MUTATE ? ' (MUTATED Var)' : ''), r1 <= TOL_REL, 'resid=' + r1.toExponential(3));
  check('F2 logM_T == mean_β(engine)+∫(1−t)Var_t <=' + TOL_REL + (MUTATE ? ' (MUTATED Var)' : ''), r2 <= TOL_REL, 'resid=' + r2.toExponential(3));
  check('F3 ghM == full-support GH integral <=' + TOL_M, r3 <= TOL_M, 'rel=' + r3.toExponential(3));
  check('F3 truncation gap |log ghM − logM_T| <=' + TOL_GAP, gap <= TOL_GAP, 'gap=' + gap.toExponential(3) + ' (full vs window — documented)');
  if (!MUTATE) {
    // built-in negative control: a 1% curvature≠variance error must be DETECTED
    const r1mut = Math.abs((mean1 - mean0) / (I * 1.01) - 1);
    check('mutant (Var×1.01) DETECTED (>10×TOL)', r1mut > 10 * TOL_REL, 'mutant resid=' + r1mut.toExponential(3));
  }
  console.log('');
}

if (fails > 0) { console.log('FAITH-FISHER: FAIL (' + fails + ' assertion(s))'); process.exit(1); }
console.log('FAITH-FISHER: PASS (engine Esscher-pair mean displacement == integrated tilted variance; ghM == GH integral, gamma in {1.5,2,3,4})');

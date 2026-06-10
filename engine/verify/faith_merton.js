'use strict';
// ════════ FAITH GATE 4 — the γ↔vol tie (MERTON characteristic-root structure) ════════
// Holds the LIVE engine to the proven MERTON constructs (formal/INDEX.md):
// `sigmaEff2_closed_form` / `gaussian_limit_quadratic` (γ(γ+1)=2r/σ² is the
// GAUSSIAN slice), `merton_vieta_sum/prod`, and the GH asymmetry
// `gh_put_root_in_strip` / `gh_call_root_out_of_strip`.
//
// The engine's latent kernel is hyperbolic (GH λ=1): f_t(v) ∝ exp((bh+t)·v −
// ah·√(δ²+v²)) with ah=γ+1, bh=1, δ=0.08 (read LIVE off ghCalibrate output —
// not assumed). The cumulant ψ(t)=κ(t)=log(C(bh+t)/C(bh)) gives:
//   σ_eff² = ψ''(0) = Var of f_0          (the curvature the Gaussian slice sees)
//   M      = e^{κ(1)} = C(bh+1)/C(bh)     (the engine's Bessel-K1 scalar ghM)
//   r_GH   = ψ_mart(−γ) = γ·κ(1)+κ(−γ)   (put char-root under martingale drift
//                                          m=−κ(1), i.e. ψ_mart(1)=0)
//   r_gauss= γ(γ+1)·σ_eff²/2              (the Gaussian-slice tie)
// WHERE δ ENTERS: δ smooths the kernel kink at v=0 (the Bessel-K1 argument δψ);
// σ_eff² and κ are δ-dependent, so the r_GH↔r_gauss gap below IS the engine's
// non-Gaussianity at the pinned δ=0.08 (gap ≈ +15%/+0.2%/−1.5%/+3.8% at
// γ=1.5/2/3/4) — recorded, not hidden.
//
// PASS bar (gamma in {1.5,2,3,4}):
//   (M1) live shape params EXACTLY pinned: ghAh==γ+1, ghBh==1, ghDelta==0.08.
//   (M2) ghM (live engine, A&S Bessel approx) == full-support quadrature M,
//        rel <= 1e-8 (measured ~5e-10 = the A&S approximation floor).
//   (M3) σ_eff² recomputed from LIVE (ghAh,ghBh,ghDelta) == PINNED, rel <= 5e-7.
//   (M4) r_gauss == PINNED, and Merton root structure: ψ_g(t)=σ²t(t−1)/2 has
//        ψ_g(−γ)=ψ_g(γ+1)=r_gauss; Vieta: roots of ψ_g(t)=r sum to 1, multiply
//        to −γ(γ+1)=−2r/σ², rel <= 1e-9 (algebra on live σ_eff).
//   (M5) r_GH == PINNED, rel/abs <= 5e-7; STRIP facts from LIVE params: put root
//        −γ ∈ (−(ah+bh), ah−bh) (in strip) and Gaussian call root γ+1 > ah−bh=γ
//        (OUT of strip — only the put eigenfunction is native to the GH), plus a
//        numeric demonstration that the call-root integrand does not decay.
// PINS recorded from clean v26c 2026-06-10; quadrature reproducible to ~1e-12
// across dv∈{0.002,0.001,0.0005} (convergence verified), so 5e-7 catches any
// real drift of the engine's (γ, σ_eff) pairs while immune to FP wiggle.
//
// NEGATIVE CONTROL (built-in + --mutate): the mutation is a silent δ-DRIFT —
// the GH side is recomputed as if the engine carried δ'=2δ=0.16. σ_eff² then
// moves ~0.4–1% off its pin (>>5e-7) and M2/M3 FAIL. Normal mode asserts the
// drift is DETECTED; with --mutate it replaces the quadrature δ and the gate
// exits 1. Demonstrated on clean v26c (2026-06-10):
//   normal:   FAITH-MERTON: PASS
//   --mutate: M2+M3 fail at every γ -> FAITH-MERTON: FAIL, exit 1.
const fs = require('fs'), vm = require('vm');
const FILE = process.argv[2] || 'temporal_mvp_v26b_itm.html';
const MUTATE = process.argv.includes('--mutate');
const html = fs.readFileSync(FILE, 'utf8');
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m, eng;
while ((m = re.exec(html))) if (/id="engine"/.test(m[1])) eng = m[2];
if (!eng) { console.error('FAITH-MERTON: no engine script found in ' + FILE); process.exit(2); }
const E = vm.runInNewContext('(function(){' + eng + '\n;return Engine;})()',
  { Math, Map, Float64Array, Number, Object, Array, isFinite, isNaN, JSON, console });
if (typeof E.ghCalibrate !== 'function') {
  console.log('FAITH-MERTON: SKIP — engine has no ghCalibrate (pre-GH build). Nothing to assert.');
  process.exit(0);
}

// ── PINNED values (clean v26c, 2026-06-10; dv-converged trapezoid quadrature) ──
const PIN = {
  '1.5': { sig2: 0.539376231136, M: 2.38024947402, kneg: -0.1380459065, rGH: 1.16276204, rGauss: 1.01133043 },
  '2':   { sig2: 0.324244596604, M: 1.62823515945, kneg: 0.0,           rGH: 0.97499341, rGauss: 0.97273379 },
  '3':   { sig2: 0.160865765074, M: 1.26830399765, kneg: 0.2376805731,  rGH: 0.95072229, rGauss: 0.96519459 },
  '4':   { sig2: 0.0987368432408, M: 1.15737787447, kneg: 0.4403418837, rGH: 1.02496990, rGauss: 0.98736843 },
};
const TOL_PIN = 5e-7, TOL_M = 1e-8, TOL_ALG = 1e-9;

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
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-9);

console.log('FAITH-MERTON — γ↔vol tie: ψ(−γ)=r structure + Gaussian slice γ(γ+1)=2r/σ²   file=' + FILE +
            (MUTATE ? '   [--mutate: GH side recomputed at δ′=2δ (silent drift) — must FAIL]' : '') + '\n');

for (const g of [1.5, 2, 3, 4]) {
  const s0 = E.ghCalibrate(5, 400000, 80000, g);
  const pin = PIN[String(g)];
  const ah = s0.ghAh, bh = s0.ghBh;
  const d = MUTATE ? 2 * s0.ghDelta : s0.ghDelta;       // MUTATED: silent δ drift
  console.log('gamma=' + g + '  live shape: ah=' + ah + ' bh=' + bh + ' delta=' + s0.ghDelta);
  check('M1 shape params pinned (ah=γ+1, bh=1, δ=0.08)', ah === g + 1 && bh === 1 && s0.ghDelta === 0.08);

  // full-support quadrature off the LIVE shape (bounds sized to the slowest tilt decay)
  const HI = 60 / Math.max(0.4, ah - bh - 1), LO = -60 / (ah + bh - 1);
  const m0 = mom(ah, bh, d, LO, HI, 0.001);
  const m1 = mom(ah, bh + 1, d, LO, HI, 0.001);
  const mn = mom(ah, bh - g, d, LO, HI, 0.001);
  const Mq = m1.C / m0.C, sig2 = m0.vr;
  const k1 = Math.log(Mq), kneg = Math.log(mn.C / m0.C);
  const rGH = g * k1 + kneg;
  const rGauss = g * (g + 1) * sig2 / 2;
  console.log('  RECORD: sigma_eff=' + Math.sqrt(sig2).toPrecision(10) + '  sigma_eff^2=' + sig2.toPrecision(10) +
              '  M=' + Mq.toPrecision(10) + '  r_GH=' + rGH.toPrecision(8) + '  r_gauss=' + rGauss.toPrecision(8) +
              '  (non-Gaussianity gap r_GH/r_gauss−1=' + (rGH / rGauss - 1).toExponential(2) + ' at δ=' + s0.ghDelta + ')');

  check('M2 ghM(engine Bessel) == quadrature M <=' + TOL_M, rel(s0.ghM, Mq) <= TOL_M,
        'ghM=' + s0.ghM.toPrecision(12) + ' quad=' + Mq.toPrecision(12) + ' rel=' + rel(s0.ghM, Mq).toExponential(2));
  check('M3 sigma_eff^2 == PIN <=' + TOL_PIN, rel(sig2, pin.sig2) <= TOL_PIN, 'rel=' + rel(sig2, pin.sig2).toExponential(2));
  check('M4 r_gauss == PIN <=' + TOL_PIN, rel(rGauss, pin.rGauss) <= TOL_PIN, 'rel=' + rel(rGauss, pin.rGauss).toExponential(2));
  // Merton root structure on the live σ_eff: ψ_g(t)=σ²t(t−1)/2
  const psiG = (t) => sig2 * t * (t - 1) / 2;
  check('M4 ψ_g(−γ)==ψ_g(γ+1)==r_gauss <=' + TOL_ALG,
        rel(psiG(-g), rGauss) <= TOL_ALG && rel(psiG(g + 1), rGauss) <= TOL_ALG,
        'ψ_g(−γ)=' + psiG(-g).toPrecision(8) + ' ψ_g(γ+1)=' + psiG(g + 1).toPrecision(8));
  // Vieta on σ²t²/2 − σ²t/2 − r = 0: sum=1, product=−2r/σ²=−γ(γ+1)
  const disc = Math.sqrt(sig2 * sig2 / 4 + 2 * rGauss * sig2);
  const t1 = (sig2 / 2 + disc) / sig2, t2 = (sig2 / 2 - disc) / sig2;
  check('M4 Vieta: roots {−γ, γ+1} <=' + TOL_ALG,
        rel(t1, g + 1) <= TOL_ALG && rel(t2, -g) <= TOL_ALG,
        'roots=' + t2.toPrecision(8) + ', ' + t1.toPrecision(8));
  check('M5 r_GH == PIN <=' + TOL_PIN, Math.abs(rGH - pin.rGH) / Math.max(Math.abs(pin.rGH), 1) <= TOL_PIN,
        'rel=' + (Math.abs(rGH - pin.rGH) / Math.max(Math.abs(pin.rGH), 1)).toExponential(2));
  check('M5 kappa(−γ) == PIN (abs <=' + TOL_PIN + ')', Math.abs(kneg - pin.kneg) <= TOL_PIN,
        'kneg=' + kneg.toPrecision(8) + ' pin=' + pin.kneg);
  // STRIP facts from LIVE params: MGF finite ⟺ −(ah+bh) < t < ah−bh = γ
  check('M5 put root −γ IN strip (−(ah+bh), ah−bh)', -g > -(ah + bh) && -g < ah - bh);
  check('M5 Gaussian call root γ+1 OUT of strip (γ+1 > ah−bh)', g + 1 > ah - bh,
        'γ+1=' + (g + 1) + ' strip edge=' + (ah - bh));
  // non-decay demonstration: at the call root the tilted integrand → 1 (non-integrable)
  const fTail = Math.exp((bh + g) * 100 - ah * Math.sqrt(s0.ghDelta * s0.ghDelta + 100 * 100));
  check('M5 call-root integrand non-decaying (f(100)>0.9)', fTail > 0.9, 'f(100)=' + fTail.toPrecision(4));
  if (!MUTATE) {
    // built-in negative control: a 2δ drift must be DETECTED by the σ pin
    const sig2mut = mom(ah, bh, 2 * s0.ghDelta, LO, HI, 0.001).vr;
    check('mutant (δ′=2δ drift) DETECTED (>100×TOL_PIN off pin)', rel(sig2mut, pin.sig2) > 100 * TOL_PIN,
          'mutant rel=' + rel(sig2mut, pin.sig2).toExponential(2));
  }
  console.log('');
}

if (fails > 0) { console.log('FAITH-MERTON: FAIL (' + fails + ' assertion(s))'); process.exit(1); }
console.log('FAITH-MERTON: PASS ((γ, σ_eff) pairs on pin, ghM==GH integral, Merton root structure + GH strip asymmetry, gamma in {1.5,2,3,4})');

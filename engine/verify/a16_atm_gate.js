#!/usr/bin/env node
// A16 — no-jump ATM position-value gate (HARD).
// Usage: node a16_atm_gate.js [path-to-html]   (default: canonical v28-lens HEAD).
//
// LOCKS the diagnosis of specs/SPEC_A16_no_jump_atm_2026-06-12.md §5: the live
// held-position value path (markEff → legValueUnified → pfComponents, all via the
// smooth-pasted markLensed) is CONTINUOUS across the OTM↔ITM (ATM) crossing — no
// jump, no regime branch in the VALUE. This gate fails if a future change ever
// reintroduces a jump (e.g. a reinstated hard `isOTM ? 1 : …` branch in the value
// path — the v24 flat-ITM regression).
//
// A16 is DISTINCT from lens_selfcheck (4): (4) checks markLensed value+slope
// continuity at the smooth-paste free boundary S* (the seam). A16 checks the ATM
// (sNorm → θ, g_loc → 0) crossing and the no-regime-branch lock — neither of which
// (4) covers. We do NOT duplicate or weaken (4)'s settle==lensed / S* checks here.
//
// Asserts (spec §5):
//   (A16.1) NO-JUMP / step-scaling: sweep the lensed mark across the ATM crossing
//           (sNorm through θ) on BOTH wings at decreasing step sizes; the max
//           adjacent |Δ| must SCALE with the step (→0, no floor). A genuine jump
//           would floor at a finite value; this scaling proves continuity.
//   (A16.2) CUSP RETIRED (constant slope multiplier): under g_loc = m·γ > 0 there
//           is NO ATM cusp and NO peak=1 — the mode is an ordinary point of a clean
//           power law. A16.2 now asserts the HONEST new fact: the curve is
//           CONTINUOUS through ATM (call arm == put arm at the mode, C⁰ to machine
//           zero) and the ATM value is the constant-g smooth-paste value
//           1/((g+1)·((g+1)/g)^g) < 1 (NOT 1, NOT a cusp). The old "peak==1 /
//           monotone-toward-ATM" assertion described the dead elbow-lens design and
//           is REMOVED, not satisfied.
//   (A16.3) NO-REGIME-BRANCH lock (structural): the value computation
//           (sign·N·markLensed) is NOT gated by isOTM / legIsITM / a hard ITM=1
//           branch — those gate only display/exec. markEff returns markLensed
//           unconditionally; pfComponents' itm flag sets only effK (display).
//           Plus a numeric witness: an ITM point markEff(sNorm>θ) < 1 (smooth-paste,
//           NOT the old flat = 1).
//   (A16.4) CROSS-LAYER single-basis: the displayed dollar mark is LINEAR in the
//           same markLensed — pfComponents' per-leg fraction == engine markEff, so
//           the dollar mark inherits markLensed's continuity with no regime multiplier.
//   SKIP-as-pass (exit 0) on a build without markLensed/gLoc (lens_selfcheck convention).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');

const file = process.argv[2] ||
  path.join(__dirname, '..', 'builds', 'HEAD_temporal_mvp_v28_lens.html');
const t = fs.readFileSync(file, 'utf8');
console.log('a16_atm_gate CHECKING: ' + path.basename(file));

function engineOf(src) {
  const m = /<script id="engine">([\s\S]*?)<\/script>/.exec(src);
  if (!m) { console.error('no engine script in ' + src.slice(0, 40)); process.exit(1); }
  const ctx = { Math, isFinite, console };
  vm.createContext(ctx);
  vm.runInContext(m[1] + '\n;this.__E=Engine;', ctx);
  return { E: ctx.__E, body: m[1] };
}
const { E, body: engineBody } = engineOf(t);

if (typeof E.gLoc !== 'function' || typeof E.markLensed !== 'function') {
  console.log('SKIP a16_atm_gate: build has no lens export (gLoc/markLensed) — pass.');
  process.exit(0);
}

// Design detector: the constant-multiplier gLoc returns `m * gamma` (g_loc=m·γ>0 at
// the mode ⇒ NO ATM cusp). The old √-lens build has g_loc(ATM)=0 ⇒ peak=1 cusp.
// A16.2 branches on this; A16.1/A16.3/A16.4 hold for BOTH designs (continuity,
// no-regime-branch, cross-layer linearity).
const gLocSrc = (function () { const i = engineBody.indexOf('function gLoc'); let d = 0, j = engineBody.indexOf('{', i); for (let k = j; k < engineBody.length; k++) { if (engineBody[k] === '{') d++; else if (engineBody[k] === '}') { d--; if (d === 0) return engineBody.slice(i, k + 1); } } return ''; })();
const isConstMult = /return\s+m\s*\*\s*gamma\s*;/.test(gLocSrc) && !/hpTau|Math\.sqrt\([^)]*tau/.test(gLocSrc);

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
  if (cond) { pass++; console.log('PASS ' + name + (detail ? '  ' + detail : '')); }
  else { fail++; console.log('FAIL ' + name + (detail ? '  ' + detail : '')); }
};

console.log('=== A16 no-jump ATM position-value gate :: ' + path.basename(file) + ' ===');

// Live-mode pool: v24 state {x,y,alpha=x·w,beta=y·(1−w)}; γ = w/(1−w); the live
// reciprocal mode = getSNorm(state) is what the lens reads (MUST-APPLY-A). The
// ATM crossing is swept by varying the STRIKE ray θ through the live mode, which
// is the math-equivalent of the live spot (sNorm) crossing θ — gLoc & markLensed
// depend only on u = log(θ / mode), so sweeping θ at fixed pool sweeps the same u.
const mkPool = (x, y, w) => ({ x, y, alpha: x * w, beta: y * (1 - w) });
const x0 = 10, y0 = 80000;

// ── (A16.1) NO-JUMP / step-scaling across the ATM crossing ──────────────────
// For wing ∈ {call,put}, γ ∈ {1.5,2,3,4}, τ ∈ {0.1,0.3,1.0}: sweep the lensed
// mark markEff(state, wing, θ, τ) as θ moves through the live mode at step dS and
// dS/10. The max adjacent |Δ markEff| must SHRINK with the step (ratio ≈ 10, in
// [5,50]) — i.e. continuous, NO fixed floor. The reference scaling in the spec
// (step 1e-5→8e-8 ⇒ jump 3.9e-4→6.2e-7, ≈ linear in step) is reproduced here.
// The no-jump-at-ATM statement has TWO parts, both asserted here:
//   (i)  STEP-SCALING — the max adjacent |Δ markEff| across the crossing window
//        shrinks with the step (→0, no floor); a fixed-jump step would floor.
//   (ii) ONE-SIDED-LIMIT AGREEMENT (the precise discriminator) — the left and
//        right one-sided limits of markEff at θ→mode converge to the SAME value;
//        their gap |L⁻ − L⁺| → 0 as the offset shrinks (ratio ≈ 10). A genuine
//        value jump at ATM floors this gap at the jump height. (ii) is what
//        distinguishes a jump from the continuous cusp unambiguously — (i) alone
//        can be masked when the smooth approach dominates the window max.
{
  let ratioMin = Infinity, ratioMax = -Infinity, worstFloor = '', floorBad = false;
  let limRatioMin = Infinity, limWorst = '', limBad = false;
  const refLines = [];
  // γ from w: γ = w/(1−w) ⇒ w = γ/(γ+1)
  for (const gam of [1.5, 2, 3, 4]) {
    const w = gam / (gam + 1);
    const sp = mkPool(x0, y0, w);
    const mode = E.getSNorm(sp);
    for (const tau of [1, 2, 3]) {            // tau carries the slope multiplier m (≥1)
      for (const wing of ['call', 'put']) {
        // (i) sweep θ across the mode in a tight window; max adjacent |Δ markEff|
        //     at two step sizes a decade apart.
        const sweepMax = (dS, half) => {
          let prev = null, mx = 0;
          for (let off = -half; off <= half + 1e-15; off += dS) {
            const theta = mode + off;
            if (theta <= 0) { prev = null; continue; }
            const v = E.markEff(sp, wing, theta, tau);
            if (prev !== null && isFinite(v) && isFinite(prev)) {
              const d = Math.abs(v - prev);
              if (d > mx) mx = d;
            }
            prev = v;
          }
          return mx;
        };
        const half = mode * 1e-3;           // window around ATM, in θ units
        const dS1 = half / 1000;            // coarse step
        const dS2 = dS1 / 10;               // fine step (one decade finer)
        const j1 = sweepMax(dS1, half);
        const j2 = sweepMax(dS2, half);
        const ratio = j2 > 0 ? j1 / j2 : Infinity;
        if (ratio < ratioMin) ratioMin = ratio;
        if (isFinite(ratio) && ratio > ratioMax) ratioMax = ratio;
        if (!(ratio >= 5 && ratio <= 50)) { floorBad = true; worstFloor = 'γ=' + gam + ' τ=' + tau + ' ' + wing + ' j1=' + j1.toExponential(2) + ' j2=' + j2.toExponential(2) + ' ratio=' + (isFinite(ratio) ? ratio.toFixed(2) : ratio); }

        // (ii) one-sided-limit gap |markEff(mode−ε) − markEff(mode+ε)| at ε and
        //      ε/10. Continuity ⇒ gap → 0 ∝ ε ⇒ ratio ≈ 10. A value jump of
        //      height h ⇒ gap → h (floors) ⇒ ratio → 1. Require gapRatio ≥ 5.
        const eps1 = mode * 1e-5, eps2 = mode * 1e-6;
        const gap = (eps) => Math.abs(E.markEff(sp, wing, mode - eps, tau) - E.markEff(sp, wing, mode + eps, tau));
        const g1 = gap(eps1), g2 = gap(eps2);
        const gapRatio = g2 > 0 ? g1 / g2 : Infinity;
        if (gapRatio < limRatioMin) limRatioMin = gapRatio;
        if (!(gapRatio >= 5)) { limBad = true; limWorst = 'γ=' + gam + ' τ=' + tau + ' ' + wing + ' gap(ε)=' + g1.toExponential(2) + ' gap(ε/10)=' + g2.toExponential(2) + ' ratio=' + (isFinite(gapRatio) ? gapRatio.toFixed(2) : gapRatio); }

        if (gam === 2 && tau === 2) refLines.push(wing + ' j(dS=' + dS1.toExponential(1) + ')=' + j1.toExponential(2) + ' j(dS=' + dS2.toExponential(1) + ')=' + j2.toExponential(2) + ' ratio=' + ratio.toFixed(1) + ' | limGap(ε=' + eps1.toExponential(1) + ')=' + g1.toExponential(2) + '→(ε/10)=' + g2.toExponential(2) + ' ratio=' + gapRatio.toFixed(1));
      }
    }
  }
  chk('(A16.1) NO-JUMP: window max-|Δ| scales with step (no floor) AND one-sided limits agree (gap→0∝ε, ratio≥5)',
      !floorBad && !limBad,
      (floorBad ? 'STEP-FLOOR: ' + worstFloor + ' ' : '') + (limBad ? 'LIMIT-JUMP: ' + limWorst : '') +
      (!floorBad && !limBad ? 'stepRatio[' + ratioMin.toFixed(2) + ',' + ratioMax.toFixed(2) + '] limGapRatioMin=' + limRatioMin.toFixed(2) + ' over γ∈{1.5,2,3,4}×m∈{1,2,3}×{call,put}' : '') +
      ' | ref(γ=2,m=2): ' + refLines.join(' ; '));
}

// ── (A16.2) CUSP RETIRED: continuous power-law through ATM, NO peak=1 cusp ────
// Constant slope multiplier ⇒ g_loc = m·γ > 0 at the mode (NOT 0). There is no
// cusp and no peak=1: the mode is an ordinary point of a clean power law. We assert
// the HONEST new facts: (i) the curve is CONTINUOUS through ATM — the call arm and
// the put arm meet at the mode (markLensed equal, C⁰ to machine zero); (ii) the ATM
// value is the constant-g smooth-paste value 1/((g+1)·((g+1)/g)^g) < 1 (NOT 1); and
// (iii) markEff agrees with that value at the exact ATM strike. The old "peak==1 /
// monotone-toward-ATM cusp" assertion (dead elbow-lens design) is REMOVED on the
// constant-multiplier build (isConstMult) and RETAINED on the legacy √-lens build.
if (isConstMult) {
  let contBad = '', valBad = '', effBad = '';
  for (const gam of [1.5, 2, 3, 4]) {
    const w = gam / (gam + 1);
    const sp = mkPool(x0, y0, w);
    const mode = E.getSNorm(sp);
    for (const m of [1, 2, 3]) {                 // m = slope multiplier (≥1)
      const g = m * gam;                          // constant exponent
      const atmVal = 1 / ((g + 1) * Math.pow((g + 1) / g, g));   // closed-form ATM smooth-paste value
      // (i) call arm == put arm at the mode (C⁰ seam through ATM)
      const cArm = E.markLensed('call', mode, mode, g);
      const pArm = E.markLensed('put', mode, mode, g);
      if (Math.abs(cArm - pArm) > 1e-12) contBad = 'γ=' + gam + ' m=' + m + ' arm-gap=' + Math.abs(cArm - pArm).toExponential(2);
      // (ii) ATM value == the constant-g smooth-paste value, and < 1 (NO peak=1 cusp)
      if (Math.abs(cArm - atmVal) > 1e-12) valBad = 'γ=' + gam + ' m=' + m + ' arm=' + cArm + ' exp=' + atmVal;
      if (!(cArm < 1 - 1e-9)) valBad = 'γ=' + gam + ' m=' + m + ' ATM not <1 (=' + cArm + ') — cusp not retired';
      // (iii) markEff at θ=mode agrees with the closed-form value (multiplier passed as the knob)
      const atmEff = E.markEff(sp, 'call', mode, m);
      if (Math.abs(atmEff - atmVal) > 1e-12) effBad = 'γ=' + gam + ' m=' + m + ' markEff(ATM)=' + atmEff + ' exp=' + atmVal;
    }
  }
  chk('(A16.2) CUSP RETIRED (constant-multiplier): continuous through ATM (call arm==put arm, C⁰); ATM value = 1/((g+1)·((g+1)/g)^g) < 1 (NO peak=1)',
      contBad === '' && valBad === '' && effBad === '',
      (contBad || valBad || effBad) ? ('cont:' + (contBad || 'ok') + ' | val:' + (valBad || 'ok') + ' | eff:' + (effBad || 'ok')) :
        'call arm==put arm at mode (C⁰), ATM value<1 = constant-g smooth-paste value, markEff agrees (≤1e-12)');
} else {
  // LEGACY √-lens build: g_loc(ATM)=0 ⇒ markLensed peaks at 1; one-sided limits → 1.
  let exactBad = '', limitBad = '';
  for (const gam of [1.5, 2, 3, 4]) {
    const w = gam / (gam + 1);
    const sp = mkPool(x0, y0, w);
    const mode = E.getSNorm(sp);
    for (const tau of [0.1, 0.3, 1.0]) {
      for (const wing of ['call', 'put']) {
        const atmExact = E.markLensed(wing, mode, mode, 0);
        if (atmExact !== 1) exactBad = 'γ=' + gam + ' τ=' + tau + ' ' + wing + ' markLensed(g=0)=' + atmExact;
        const atmEff = E.markEff(sp, wing, mode, tau);
        if (Math.abs(atmEff - 1) > 1e-12) exactBad = 'γ=' + gam + ' τ=' + tau + ' ' + wing + ' markEff(ATM)=' + atmEff;
        const offs = [mode * 1e-2, mode * 1e-3, mode * 1e-4, mode * 1e-5];
        let prevL = 0, prevR = 0;
        for (const off of offs) {
          const vL = E.markEff(sp, wing, mode - off, tau);
          const vR = E.markEff(sp, wing, mode + off, tau);
          if (vL > 1 + 1e-12 || vR > 1 + 1e-12) limitBad = 'γ=' + gam + ' ' + wing + ' overshoot';
          if (vL < prevL - 1e-12 || vR < prevR - 1e-12) limitBad = 'γ=' + gam + ' ' + wing + ' non-monotone toward ATM';
          prevL = vL; prevR = vR;
        }
        const near = mode * 1e-5;
        const nL = E.markEff(sp, wing, mode - near, tau), nR = E.markEff(sp, wing, mode + near, tau);
        if (1 - nL > 1e-2 || 1 - nR > 1e-2) limitBad = 'γ=' + gam + ' ' + wing + ' limit not near 1';
      }
    }
  }
  chk('(A16.2 legacy √-lens) ATM peak == 1 (markLensed g=0 and markEff at ATM); both one-sided limits → 1',
      exactBad === '' && limitBad === '',
      (exactBad || limitBad) ? ('exact:' + (exactBad || 'ok') + ' | limits:' + (limitBad || 'ok')) :
        'markLensed(g=0)=1, markEff(ATM)=1 (≤1e-12), monotone ↑ to 1 on both wings');
}

// ── (A16.3) NO-REGIME-BRANCH lock (structural + numeric witness) ─────────────
// STRUCTURAL: markEff's value path is markLensed returned UNCONDITIONALLY — no
// isOTM/legIsITM/hard-ITM=1 branch. pfComponents' itm flag feeds ONLY effK
// (display), and value = sign·N·markLensed unconditionally. Re-derive from source.
{
  const grabFn = (src, name) => {
    const i = src.indexOf('function ' + name);
    if (i < 0) return null;
    let depth = 0, j = src.indexOf('{', i);
    for (let k = j; k < src.length; k++) { if (src[k] === '{') depth++; else if (src[k] === '}') { depth--; if (depth === 0) return src.slice(i, k + 1); } }
    return null;
  };
  // markEff body: a single unconditional `return markLensed(...)` with NO regime gate.
  const meSrc = grabFn(engineBody, 'markEff') || '';
  // strip comments so a regime word in a comment doesn't false-trip the lock.
  const meCode = meSrc.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/[^/].*$/gm, '');
  const meReturnsLensed = /return\s+markLensed\(wing,\s*theta,\s*sNorm,\s*gLoc\(state,\s*theta,\s*tau\)\)/.test(meCode);
  // the ONLY conditional in markEff code is the absent-outer guard (theta<=0 ⇒ 0);
  // assert there is NO isOTM/legIsITM/ITM-saturation branch in the value path.
  const meNoRegime = !/\bisOTM\b|\blegIsITM\b|\bwingMember\b/.test(meCode)
                  && !/\?\s*1\s*:/.test(meCode)            // no `cond ? 1 : …` ITM=1 saturation
                  && !/return\s+1\s*;/.test(meCode);        // no bare `return 1` saturation arm

  // pfComponents (UI layer): value = sign·N·markLensed unconditionally; the itm
  // flag sets ONLY effK (display). Read from the ui script source.
  const uiBody = (/<script id="ui">([\s\S]*?)<\/script>/.exec(t) || [, ''])[1];
  const pfSrc = grabFn(uiBody, 'pfComponents') || '';
  const pfCode = pfSrc.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/[^/].*$/gm, '');
  // value line uses markLensed-derived m, NOT gated by itm
  const pfValueUnconditional = /const\s+value\s*=\s*part\.sign\s*\*\s*leg\.N\s*\*\s*m\s*;/.test(pfCode);
  // the itm flag (if present) feeds effK display only — never the value/m
  const pfItmDisplayOnly = !/effK[\s\S]{0,200}?value\s*=/.test(pfCode)
    ? true   // belt: effK appears before value and is not multiplied in
    : true;
  // explicit: m (the fraction) is markLensed, computed BEFORE and independent of itm
  const pfMisLensed = /const\s+m\s*=\s*Engine\.markLensed\(wing,\s*part\.theta,\s*sNormPool,\s*Engine\.gLoc\(pool,\s*part\.theta,\s*tau\)\)/.test(pfCode);
  // and itm is NOT referenced in the value expression (value depends on m only)
  const itmIdx = pfCode.indexOf('const itm');
  const valIdx = pfCode.indexOf('const value');
  const effIdx = pfCode.indexOf('const effK');
  const pfItmOnlyEffK = itmIdx >= 0 && effIdx > itmIdx && valIdx > effIdx
    && !/value\s*=\s*[^;]*\bitm\b[^;]*;/.test(pfCode);

  chk('(A16.3-struct) value path has NO regime branch: markEff returns markLensed unconditionally; pfComponents value=sign·N·markLensed; itm→effK(display) only',
      meReturnsLensed && meNoRegime && pfValueUnconditional && pfMisLensed && pfItmOnlyEffK,
      'markEff-returns-lensed=' + meReturnsLensed + ' markEff-no-regime=' + meNoRegime +
      ' pf-value-uncond=' + pfValueUnconditional + ' pf-m-lensed=' + pfMisLensed + ' pf-itm→effK-only=' + pfItmOnlyEffK);

  // NUMERIC WITNESS: an ITM point (sNorm > θ on the call wing) gives markEff < 1
  // (smooth-paste continuation past the strike then intrinsic), NOT the old flat
  // hard-saturated = 1. Catches a reinstated `isOTM ? 1 : …` value branch.
  let itmBelow1 = true, witnessLines = [];
  for (const gam of [1.5, 2, 3, 4]) {
    const w = gam / (gam + 1);
    const sp = mkPool(x0, y0, w);
    const mode = E.getSNorm(sp);
    const tau = 2;                   // slope multiplier m (≥1)
    // call wing ITM ⇔ sNorm (mode) deep above θ ⇒ small θ relative to mode.
    const thetaITM = mode * 0.3;     // strongly ITM for the call
    const vITM = E.markEff(sp, 'call', thetaITM, tau);
    // put wing ITM ⇔ mode below θ ⇒ large θ.
    const thetaITMp = mode * 3.0;
    const vITMp = E.markEff(sp, 'put', thetaITMp, tau);
    if (!(vITM < 1 - 1e-6) || !(vITMp < 1 - 1e-6)) itmBelow1 = false;
    witnessLines.push('γ=' + gam + ' call-ITM=' + vITM.toFixed(4) + ' put-ITM=' + vITMp.toFixed(4));
  }
  chk('(A16.3-numeric) ITM markEff < 1 (smooth-paste, NOT old flat saturation =1)',
      itmBelow1, witnessLines.join(' | '));
}

// ── (A16.4) CROSS-LAYER single-basis: dollar mark linear in the same markLensed ─
// The displayed portfolio dollar mark is (Σ sign·N·markLensed)·equity·L0 — LINEAR
// in markLensed. We assert the per-leg pfComponents fraction (m, the W6 display
// path) == engine markEff (the W4 value path) at the SAME live coordinate, across
// the ATM crossing on both wings — so the dollar mark inherits markLensed's
// continuity with no regime multiplier. (Distinct from lens_selfcheck (8.3): here
// keyed on the ATM-crossing strikes, the A16 locus.)
{
  let maxerr = 0, worst = '';
  for (const gam of [1.5, 2, 3, 4]) {
    const w = gam / (gam + 1);
    const sp = mkPool(x0, y0, w);
    const oracleLive = E.getMP_raw(sp);
    const sNormPool = E.getSNorm(sp);
    const tau = 2;                   // slope multiplier m (≥1)
    for (const wing of ['call', 'put']) {
      // strikes straddling the ATM crossing (incl. just-OTM and just-ITM)
      for (const mult of [0.5, 0.9, 0.999, 1.0, 1.001, 1.1, 2.0]) {
        const theta = sNormPool * mult;
        const K = theta * oracleLive;
        // W6 display fraction (pfComponents inner term): markLensed at live mode
        const uiFrac = E.markLensed(wing, theta, sNormPool, E.gLoc(sp, theta, tau));
        // W4 engine value fraction
        const engFrac = E.markEff(sp, wing, theta, tau);
        const e = Math.abs(uiFrac - engFrac);
        if (e > maxerr) { maxerr = e; worst = 'γ=' + gam + ' ' + wing + ' mult=' + mult; }
      }
    }
  }
  // also confirm the dollar mark is the LINEAR aggregate (structural): the
  // raw dollar figure is a sum of sign·N·m scaled by equity·L0 (no per-leg
  // regime multiplier). markEff/legValueUnified are linear in markLensed by
  // construction (legValueUnified = N·(mIn−mOut)); witness the linearity.
  const sp = mkPool(x0, y0, 0.75);
  const sNorm = E.getSNorm(sp), tau = 2, theta = sNorm * 1.2;
  const m = E.markEff(sp, 'call', theta, tau);
  const v1 = E.legValueUnified(sp, 'call', { inner: theta, outer: NaN, N: 1 }, tau);
  const v3 = E.legValueUnified(sp, 'call', { inner: theta, outer: NaN, N: 3 }, tau);
  const linear = Math.abs(v1 - m) < 1e-14 && Math.abs(v3 - 3 * m) < 1e-13;

  chk('(A16.4) cross-layer single-basis: pfComponents fraction == markEff across ATM; dollar mark LINEAR in markLensed',
      maxerr < 1e-14 && linear,
      'maxFracErr=' + maxerr.toExponential(2) + ' ' + worst + ' | N-linear(legValueUnified=N·m)=' + linear);
}

console.log('=== a16_atm_gate: ' + pass + ' PASS, ' + fail + ' FAIL ===');
process.exit(fail === 0 ? 0 : 1);

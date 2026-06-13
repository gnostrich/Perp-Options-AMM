#!/usr/bin/env node
// CONSTANT SLOPE-MULTIPLIER lens self-check (HARD gate). REWRITTEN 2026-06-13 for
// the operator-ruled constant-multiplier lens (entries 229/231; skeptic
// VERDICT_constant_slope_multiplier_entry229_2026-06-13). REPLACES the old
// position-dependent √(τ²+u²) elbow-lens gate, which asserted the now-DEAD design
// (g_loc(ATM)=0, wings→γ, |g_loc|≤γ, funding→0-at-ATM) — those assertions are
// REMOVED, not satisfied, per the skeptic's gate-problem finding.
//
// THE NEW DESIGN (slope multiplier m; m=1 = plain v24 curve; bigger m = steeper):
//   g_loc(K) = m·γ  at EVERY strike  (γ = w/(1−w) LIVE, NO u-dependence, NO elbow,
//   NO flat-top, NO frozen-γ wing). Settlement smooth-paste uses g = m·γ. Trade
//   map θ_tx = mode·(chosen/mode)^m (m=1 ⇒ θ_tx = chosen). Pool fns byte-identical
//   to v24. The three (steeper g_loc, further θ_tx, transact-where-it-looks) co-move
//   with m in the SAME direction.
//
// Usage: node lens_selfcheck.js [path-to-html]   (default: canonical v28-lens HEAD).
// SKIP-as-pass on a build without gLoc/markLensed (non-lens build).
// On the OLD √-lens HEAD (no constant-multiplier token) the CM block SKIPs but the
// generic checks (pool byte-id, markLensed monotone/bounded) still run, so HEAD is
// NOT a silent no-op while the new build is gated by the full CM suite.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');

const file = process.argv[2] ||
  path.join(__dirname, '..', 'builds', 'HEAD_temporal_mvp_v28_lens.html');
const t = fs.readFileSync(file, 'utf8');
console.log('lens_selfcheck CHECKING: ' + path.basename(file));
const baseFile = path.join(__dirname, '..', 'builds', 'temporal_mvp_v24_rebase_fixed_2.html');
const tBase = fs.readFileSync(baseFile, 'utf8');

function engineOf(src) {
  const m = /<script id="engine">([\s\S]*?)<\/script>/.exec(src);
  if (!m) { console.error('no engine script in ' + src.slice(0, 40)); process.exit(1); }
  const ctx = { Math, isFinite, console };
  vm.createContext(ctx);
  vm.runInContext(m[1] + '\n;this.__E=Engine;', ctx);
  return { E: ctx.__E, body: m[1] };
}
const { E, body: engineBody } = engineOf(t);
const { E: EB } = engineOf(tBase);
const baseBody = (/<script id="engine">([\s\S]*?)<\/script>/.exec(tBase) || [, ''])[1];

if (typeof E.gLoc !== 'function' || typeof E.markLensed !== 'function') {
  console.log('SKIP lens_selfcheck: build has no lens export (gLoc/markLensed) — pass.');
  process.exit(0);
}

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
  if (cond) { pass++; console.log('PASS ' + name + (detail ? '  ' + detail : '')); }
  else { fail++; console.log('FAIL ' + name + (detail ? '  ' + detail : '')); }
};
const grabFn = (src, name) => {
  const i = src.indexOf('function ' + name);
  if (i < 0) return null;
  let depth = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) { if (src[k] === '{') depth++; else if (src[k] === '}') { depth--; if (depth === 0) return src.slice(i, k + 1); } }
  return null;
};

console.log('=== constant slope-multiplier lens self-check :: ' + path.basename(file) + ' ===');

// v24 state = {x, y, alpha=x·w, beta=y·(1−w)}; γ = w/(1−w) = getW/(1−getW).
const mkPool = (x, y, w) => ({ x, y, alpha: x * w, beta: y * (1 - w) });

// Design detector: the constant-multiplier gLoc returns `m * gamma` (no u-dependence).
// Read off the gLoc source so a stale build can't masquerade as the new design.
const gLocSrc = grabFn(engineBody, 'gLoc') || '';
const isConstMult = /return\s+m\s*\*\s*gamma\s*;/.test(gLocSrc) && !/hpTau|h′_τ|Math\.sqrt\([^)]*tau/.test(gLocSrc);
const hasTradeMap = /\btheta_tx\b/.test(engineBody);

// ── pool byte-identity (runs on ALL lens builds) ──────────────────────────────
{
  let srcId = true, which = '';
  for (const fn of ['tradeUpdate', 'arbitrageToOracle', 'rebase']) {
    if (grabFn(engineBody, fn) !== grabFn(baseBody, fn)) { srcId = false; which += fn + ' '; }
  }
  chk('(P) pool tradeUpdate/arbitrageToOracle/rebase byte-identical to v24', srcId, srcId ? '' : 'DIFFERS: ' + which);
  // and numeric tradeUpdate identical for several dy
  const s = mkPool(10, 80000, 0.725);
  let maxd = 0;
  for (const dy of [1, 100, -100, 5000, -5000, 250, -1, 0.5]) {
    const a = EB.tradeUpdate(s, dy), b = E.tradeUpdate(s, dy);
    if (a === null && b === null) continue;
    if ((a === null) !== (b === null)) { maxd = Infinity; break; }
    maxd = Math.max(maxd, Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.alpha - b.alpha), Math.abs(a.beta - b.beta));
  }
  chk('(P-num) tradeUpdate numeric identical to v24', maxd === 0, 'maxAbsDelta=' + maxd);
}

// ── arbitrageToOracle stays lens-free (forward-read-only, L4) ─────────────────
{
  const arbSrc = grabFn(engineBody, 'arbitrageToOracle') || '';
  const arbLensFree = !/gLoc|markLensed|lensU/.test(arbSrc);
  chk('(L4) arbitrageToOracle lens-free (plain Balancer, forward-read-only)', arbLensFree, arbLensFree ? '' : 'lens call inside arb');
}

if (!isConstMult) {
  console.log('SKIP constant-multiplier block: build gLoc does not return m·γ (old √-lens design or other). ' +
    'Generic pool/L4 checks ran above; the full constant-multiplier suite gates the constmult build only.');
  console.log('=== lens_selfcheck: ' + pass + ' PASS, ' + fail + ' FAIL ===');
  process.exit(fail === 0 ? 0 : 1);
}

// ════════════════════════════════════════════════════════════════════════════
//  CONSTANT SLOPE-MULTIPLIER ASSERTIONS (the new design)
// ════════════════════════════════════════════════════════════════════════════
const W = 0.725;                       // γ = 2.6363...
const s = mkPool(10, 80000, W);
const gamma = E.getW(s) / (1 - E.getW(s));
const mode = E.getSNorm(s);
const MS = [1, 1.5, 2, 3, 4];          // several m to exercise

// ── (CM1) g_loc(K) = m·γ constant across strikes (no u-dependence); m=1 ⇒ g=γ ──
{
  let maxerr = 0, worst = '', m1ok = true;
  for (const m of MS) {
    const expect = m * gamma;
    for (const mult of [0.05, 0.2, 0.5, 0.8, 1.0, 1.3, 2.0, 5.0, 20.0, 100.0]) {
      const thetaK = mode * mult;
      const got = E.gLoc(s, thetaK, m);
      const e = Math.abs(got - expect);
      if (e > maxerr) { maxerr = e; worst = 'm=' + m + ' mult=' + mult + ' got=' + got.toFixed(8) + ' exp=' + expect.toFixed(8); }
    }
  }
  // m=1 ⇒ g_loc == γ everywhere (= the plain v24 curve exponent)
  for (const mult of [0.2, 1.0, 5.0, 40.0]) {
    if (Math.abs(E.gLoc(s, mode * mult, 1) - gamma) > 1e-12) m1ok = false;
  }
  chk('(CM1) g_loc = m·γ constant at every strike (no u-dependence); m=1 ⇒ g_loc=γ (plain curve)',
      maxerr < 1e-12 && m1ok, 'maxAbsErr=' + maxerr.toExponential(2) + ' m1=γ-everywhere=' + m1ok + '  ' + worst);
}

// ── (CM2) wings are exact power-laws of exponent m·γ (NO floor/saturation, monotone) ──
// The local exponent in the wings IS m·γ (the gLoc value). Sample deep strikes on
// both wings: g_loc stays exactly m·γ (no decay toward γ, no saturation). Also assert
// the markLensed value curve is monotone (call decays away from the mode; put decays
// the other way) and bounded in [0,1] — A5 no-floor / no-saturation.
{
  let wingOk = true, monoOk = true, boundOk = true, worst = '';
  for (const m of MS) {
    const g = m * gamma;
    // deep wings: exponent stays exactly m·γ
    for (const lu of [3, 6, 10, 20, 40]) {
      if (Math.abs(E.gLoc(s, mode * Math.exp(lu), m) - g) > 1e-12) { wingOk = false; worst = 'wing m=' + m + ' lu=' + lu; }
      if (Math.abs(E.gLoc(s, mode * Math.exp(-lu), m) - g) > 1e-12) { wingOk = false; worst = 'wing m=' + m + ' lu=-' + lu; }
    }
    // markLensed monotone + bounded over a wide sNorm sweep at a representative wing strike
    for (const wing of ['call', 'put']) {
      const theta = mode * (wing === 'call' ? 1.8 : 0.55);
      let prev = null;
      for (let q = 1e-4; q < 8; q *= 1.15) {
        const v = E.markLensed(wing, theta, q, g);
        if (!(v >= 0 && v <= 1 + 1e-12)) { boundOk = false; worst = 'bound ' + wing + ' m=' + m; }
        // value is monotone in sNorm: call rises with sNorm, put falls — check no reversal sign flip beyond fp noise
        if (prev !== null && wing === 'call' && v < prev - 1e-9) { monoOk = false; worst = 'mono call m=' + m; }
        if (prev !== null && wing === 'put' && v > prev + 1e-9) { monoOk = false; worst = 'mono put m=' + m; }
        prev = v;
      }
    }
  }
  chk('(CM2/A5) wings exact power-law exponent m·γ; markLensed monotone + bounded [0,1] (no floor/saturation)',
      wingOk && monoOk && boundOk, 'wing-exp=' + wingOk + ' monotone=' + monoOk + ' bounded=' + boundOk + (worst ? ' worst=' + worst : ''));
}

// ── (CM3) monotonicity / no-arb : the value curve is a plain power-law of exponent m·γ ──
// markLensed with constant g is the v26b smooth-paste of a single power law; the
// fraction is monotone in the strike-distance and stays in [0,1] (no arb surface,
// same structure as the gated v24 baseline). Witness: ATM is the global max along a
// wing (value ≤ ATM value), and the curve decays monotonically into the wing.
{
  let ok = true, worst = '';
  for (const m of MS) {
    const g = m * gamma;
    // along the call wing: theta increasing from the mode ⇒ markLensed(call) decays
    let prev = Infinity;
    for (let mult = 1.0; mult <= 30; mult *= 1.2) {
      const theta = mode * mult;
      const v = E.markLensed('call', theta, mode, g);  // spot at mode, strike moving out
      if (v > prev + 1e-9) { ok = false; worst = 'call-decay m=' + m + ' mult=' + mult.toFixed(2); }
      if (!(v >= 0 && v <= 1 + 1e-12)) { ok = false; worst = 'call-bound m=' + m; }
      prev = v;
    }
  }
  chk('(CM3) monotone / no-arb: value decays monotonically into the wing, bounded [0,1] (plain power-law m·γ)',
      ok, ok ? 'monotone decay both bounded over m∈{1,1.5,2,3,4}' : worst);
}

// ── (CM4) smooth-paste C⁰ seam at machine zero with g = m·γ (BOTH wings) ──
// markLensed continuation past the strike meets the intrinsic arm at the free
// boundary S* with value (and boundary fraction 1/(g+1)) continuous to machine zero.
{
  let maxVal = 0, worst = '';
  const sStarCall = (theta, g) => theta * Math.pow((g + 1) / g, g);
  const sStarPut = (theta, g) => theta * Math.pow(g / (g + 1), g);
  for (const m of MS) {
    const g = m * gamma;
    for (const wing of ['call', 'put']) {
      const theta = 1.0;
      const sStar = wing === 'call' ? sStarCall(theta, g) : sStarPut(theta, g);
      const vL = E.markLensed(wing, theta, sStar * (1 - 1e-10), g);
      const vR = E.markLensed(wing, theta, sStar * (1 + 1e-10), g);
      const vGap = Math.abs(vL - vR);
      const fGap = Math.abs(E.markLensed(wing, theta, sStar, g) - 1 / (g + 1));
      const tot = Math.max(vGap, fGap);
      if (tot > maxVal) { maxVal = tot; worst = wing + ' m=' + m + ' g=' + g.toFixed(2); }
    }
  }
  chk('(CM4) smooth-paste C⁰ seam at S* machine-zero, both wings, g=m·γ', maxVal < 1e-9,
      'maxSeamGap=' + maxVal.toExponential(2) + ' ' + worst);
  // NaN-freedom across both wings / all m (no degenerate pow)
  let bad = 0;
  for (const m of MS) {
    const g = m * gamma;
    for (const wing of ['call', 'put']) for (let q = 0.001; q < 6; q += 0.013) {
      if (!isFinite(E.markLensed(wing, 1.0, q, g))) bad++;
    }
  }
  chk('(CM4-nan) markLensed NaN-free across both wings for g=m·γ', bad === 0, 'nonFinite=' + bad);
}

// ── (CM5) trade map θ_tx = mode·(chosen/mode)^m ; m=1 ⇒ θ_tx = chosen ──
if (hasTradeMap) {
  let maxerr = 0, m1ok = true, worst = '';
  const orc = 80000;
  for (const m of MS) {
    for (const mult of [0.25, 0.5, 0.8, 1.3, 2.0, 4.0]) {
      const chosen = mode * mult;
      const wing = mult >= 1 ? 'call' : 'put';
      const lg = E.executeLeg(s, 'sell', wing, chosen, NaN, 1, orc, m);
      const expect = mode * Math.pow(chosen / mode, m);
      const e = Math.abs(lg.theta_tx - expect);
      if (e > maxerr) { maxerr = e; worst = 'm=' + m + ' mult=' + mult + ' θ_tx=' + lg.theta_tx.toFixed(6) + ' exp=' + expect.toFixed(6); }
    }
    // m=1 ⇒ θ_tx == chosen
    const lg1 = E.executeLeg(s, 'sell', 'call', mode * 2, NaN, 1, orc, 1);
    if (Math.abs(lg1.theta_tx - mode * 2) > 1e-9) m1ok = false;
  }
  chk('(CM5) trade map θ_tx = mode·(chosen/mode)^m (≤1e-9); m=1 ⇒ θ_tx = chosen',
      maxerr < 1e-9 && m1ok, 'maxErr=' + maxerr.toExponential(2) + ' m1=θ_tx==chosen=' + m1ok + ' ' + worst);
} else {
  chk('(CM5) trade map present', false, 'NO theta_tx in engine — constant-multiplier build must carry the trade map');
}

// ── (CM6) frozen round-trip exact (open-then-close reserves 0/0 with frozen K_tx) ──
if (hasTradeMap) {
  const sA = mkPool(10, 800000, 0.5);   // beta=400000 depth, mode getSNorm=1
  const orc = 80000, mKnob = 2;          // m=2 ⇒ θ_tx further out
  // strikes kept close to mode so the (further-out) θ_tx swap stays within depth
  const cases = [ { sw: 'call', bw: 'call', si: 1.1, bi: 1.2 },
                  { sw: 'put',  bw: 'put',  si: 0.9, bi: 0.85 } ];
  let maxErr = 0, lines = [];
  for (const c of cases) {
    const sold = { K_inner: c.si * orc, K_outer: NaN, inner: c.si, outer: NaN };
    const bought = { K_inner: c.bi * orc, K_outer: NaN, inner: c.bi, outer: NaN };
    const r = E.executeBand(sA, c.sw, c.bw, sold, bought, 1, orc, orc, mKnob);
    if (!r.ok) { maxErr = Infinity; lines.push(c.sw + '/' + c.bw + ' open FAIL: ' + r.reason); continue; }
    const band = { sold_wing: c.sw, bought_wing: c.bw,
      sold:   { inner: c.si, outer: NaN, K_inner: c.si * orc, K_outer: NaN, K_tx: r.leg1.K_tx, N: r.N_sell },
      bought: { inner: c.bi, outer: NaN, K_inner: c.bi * orc, K_outer: NaN, K_tx: r.leg2.K_tx, N: r.N_buy },
      entry: { pool: sA, oracle: orc, L0: 1 },
      carved: { carvedNotional: 0, carvedEntryEquity: 1, entryPerpMark: orc } };
    const cl = E.closeBand(r.finalState, band, { equity: 1e12 }, orc, orc, orc, mKnob);
    if (!cl.ok) { maxErr = Infinity; lines.push(c.sw + '/' + c.bw + ' close FAIL: ' + cl.reason); continue; }
    const ex = Math.abs(cl.finalState.x - sA.x), ey = Math.abs(cl.finalState.y - sA.y);
    maxErr = Math.max(maxErr, ex, ey);
    lines.push(c.sw + '/' + c.bw + ' x-err=' + ex.toExponential(2) + ' y-err=' + ey.toExponential(2));
  }
  // single-leg open+reverse with FROZEN K_tx nets dy==0 (no free money)
  let allZero = true;
  for (const [wing, ls, th] of [['call', 'sell', 1.3], ['put', 'buy', 0.8]]) {
    const open = E.executeLeg(sA, ls, wing, th, NaN, 1, orc, mKnob);
    const ws = (wing === 'call') ? +1 : -1, lsg = (ls === 'sell') ? +1 : -1;
    const dyRev = -(ws * lsg * 1 * open.K_tx);
    const back = E.tradeUpdate(open.newState, dyRev);
    const sumDy = Math.abs(open.dy + dyRev);
    const rErr = Math.max(Math.abs(back.x - sA.x), Math.abs(back.y - sA.y));
    if (!(sumDy <= 1e-9 && rErr <= 1e-9)) allZero = false;
  }
  chk('(CM6) frozen θ_tx round-trip: open→close reserves restore exact (≤1e-9); single-leg open+reverse Σdy==0 (no free money)',
      maxErr <= 1e-9 && allZero, 'reserves: ' + lines.join(' | ') + ' | single-leg-zero=' + allZero);
}

// ── (CM7) THE THREE CO-MOVE WITH m, SAME DIRECTION (locks a future polarity flip = FAIL) ──
// steeper g_loc (∝m) ; further θ_tx (mode·(chosen/mode)^m grows with m for a 2× pick) ;
// transact-where-it-looks (the chosen strike maps to a FURTHER-OUT true strike as m rises).
// All three must increase with m, monotonically, same sign. A future change that flips
// any of them (e.g. sharper⇒closer) FAILS here.
if (hasTradeMap) {
  const orc = 80000;
  const chosen = mode * 2;     // a 2× pick (call OTM)
  let gPrev = -Infinity, txPrev = -Infinity, gMono = true, txMono = true, rows = [];
  for (const m of [1, 2, 3, 4]) {
    const g = E.gLoc(s, chosen, m);                                  // steepness m·γ
    const lg = E.executeLeg(s, 'sell', 'call', chosen, NaN, 1, orc, m);
    const txRatio = lg.theta_tx / mode;                              // further-out factor
    if (!(g > gPrev)) gMono = false;
    if (!(txRatio > txPrev)) txMono = false;
    gPrev = g; txPrev = txRatio;
    rows.push('m=' + m + ': g_loc=' + g.toFixed(2) + ' θ_tx=' + txRatio.toFixed(2) + '×');
  }
  // explicit polarity lock: at the skeptic's worked point (γ=2 pool) m=1/2/3 ⇒
  // g_loc 2/4/6 and θ_tx 2×/4×/8× — both INCREASE with m (same direction).
  chk('(CM7) the three co-move with m SAME direction: g_loc↑ AND θ_tx↑ (polarity LOCKED; a future flip FAILS)',
      gMono && txMono, rows.join(' | ') + (gMono && txMono ? ' [steeper g_loc ⇒ further θ_tx, same sign]' : ' POLARITY BROKEN'));
}

// ── (CM8) pool fns byte-identical to v24 (the (P) check, restated as a CM gate) ──
{
  let allId = true, lines = [];
  for (const fn of ['tradeUpdate', 'arbitrageToOracle', 'rebase']) {
    const id = grabFn(engineBody, fn) === grabFn(baseBody, fn);
    allId = allId && id; lines.push(fn + ':' + (id ? 'identical' : 'DIFF'));
  }
  chk('(CM8) pool fns byte-identical to v24 (no curve change in the pool)', allId, lines.join(' '));
}

// ── (CM9) NO leftover dead-lens design in the engine (the skeptic gate-problem lock) ──
// the constant-multiplier gLoc must NOT contain the old √(τ²+u²) kernel, hpTau, or
// a u-dependent factor; markEff/funding must route through the constant gLoc.
{
  const deadInGLoc = /hpTau|h′_τ|Math\.sqrt\([^)]*tau|\/\s*Math\.sqrt/.test(gLocSrc);
  const noHpExport = !/\bhpTau\b/.test(engineBody) && !/\bhTau\b/.test(engineBody);
  const meSrc = grabFn(engineBody, 'markEff') || '';
  const meUsesGLoc = /markLensed\(wing,\s*theta,\s*sNorm,\s*gLoc\(state,\s*theta,\s*\w+\)\)/.test(meSrc);
  chk('(CM9) NO dead √-lens kernel: gLoc has no hpTau/√(τ²+u²)/u-factor; hTau/hpTau dropped; markEff routes through gLoc',
      !deadInGLoc && noHpExport && meUsesGLoc,
      'gLoc-clean=' + !deadInGLoc + ' hpTau/hTau-removed=' + noHpExport + ' markEff-via-gLoc=' + meUsesGLoc);
}

console.log('=== lens_selfcheck: ' + pass + ' PASS, ' + fail + ' FAIL ===');
process.exit(fail === 0 ? 0 : 1);

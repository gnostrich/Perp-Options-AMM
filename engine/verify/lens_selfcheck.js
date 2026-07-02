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
//   map θ_tx = mode·(chosen/mode)^m (m=1 ⇒ θ_tx = chosen). SPOT fns byte-identical
//   to v24; the LIVE trade path is the TRADE-POINT law tradeUpdateAt (CM8-v2,
//   operator entry 339 — paper Eq. 2 at T = ray∩curve; frozen-ARC close, CM6-v2).
//   The three (steeper g_loc, further θ_tx, transact-where-it-looks) co-move
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
// Read off the gLoc source so a stale build can't masquerade as the new design AND
// confirm it NUMERICALLY (not a sole literal-text match): a constant-multiplier gLoc
// must return the SAME exponent at two distinct strikes (no u/strike dependence).
const gLocSrc = grabFn(engineBody, 'gLoc') || '';
const sourceClean = /return\s+m\s*\*\s*gamma\s*;/.test(gLocSrc) && !/hpTau|h′_τ|Math\.sqrt\([^)]*tau/.test(gLocSrc);
let numericConstInStrike = false;
try {
  const _p = mkPool(10, 80000, 0.725);     // γ = 2.6363…; mkPool defined just above
  const _g1 = E.gLoc(_p, 0.5, 2);          // m=2, θ = 0.5
  const _g2 = E.gLoc(_p, 3.0, 2);          // m=2, θ = 3.0 (distinct strike)
  numericConstInStrike = Number.isFinite(_g1) && Number.isFinite(_g2) && _g1 === _g2;
} catch (e) { numericConstInStrike = false; }
const isConstMult = sourceClean && numericConstInStrike;
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

// ── (CM4-v2) PKG-ITM v2 LINEAR re-seam: C⁰ + C¹ weld at the v2 free boundary (BOTH wings) ──
// Operator entries 286/287, go 298; spec SPEC_pkg_itm_v2_engine_coords_2026-07-02 §7.1;
// Lean model O1 PasteLin (paste_value_lin/paste_slope_lin/paste_unique, trusted-from-prover).
// v2 seams: put sNorm* = θ·g/(g+1) (dollar S* = K·g/(g+1) — the 0.667K seam at g=2,
// 0.857K at g=6), call sNorm* = θ·(g+1)/g. REPLACES the old power-form seams
// θ·(g/(g+1))^g / θ·((g+1)/g)^g (retained build: temporal_mvp_v28_lens_powerarm.html).
// Boundary fraction 1/(g+1) exact at the seam; C⁰ machine zero across a ±1e-10
// relative straddle. g set = m·γ over MS plus the spec's named g∈{2,6} columns.
{
  const sStarCall = (theta, g) => theta * (g + 1) / g;
  const sStarPut = (theta, g) => theta * g / (g + 1);
  const GS = MS.map((m) => m * gamma).concat([2, 6]);
  let maxVal = 0, worst = '';
  for (const g of GS) {
    for (const wing of ['call', 'put']) {
      const theta = 1.0;
      const sStar = wing === 'call' ? sStarCall(theta, g) : sStarPut(theta, g);
      const vL = E.markLensed(wing, theta, sStar * (1 - 1e-10), g);
      const vR = E.markLensed(wing, theta, sStar * (1 + 1e-10), g);
      const vGap = Math.abs(vL - vR);
      const fGap = Math.abs(E.markLensed(wing, theta, sStar, g) - 1 / (g + 1));
      const tot = Math.max(vGap, fGap);
      if (tot > maxVal) { maxVal = tot; worst = wing + ' g=' + g.toFixed(2); }
    }
  }
  chk('(CM4-v2) linear re-seam C⁰ at v2 seam (put θ·g/(g+1), call θ·(g+1)/g) machine-zero + boundary fraction 1/(g+1)',
      maxVal < 1e-9, 'maxSeamGap=' + maxVal.toExponential(2) + ' ' + worst);
  // C¹ probe: one-sided difference quotients of markLensed in sNorm at the seam
  // (ε = 1e-6·sStar): put both sides → −1/θ ; call both sides → g²/((g+1)²·θ).
  let maxRel = 0, worstC1 = '';
  for (const g of GS) {
    for (const wing of ['call', 'put']) {
      const theta = 1.0;
      const sStar = wing === 'call' ? sStarCall(theta, g) : sStarPut(theta, g);
      const eps = 1e-6 * sStar;
      const v0 = E.markLensed(wing, theta, sStar, g);
      const qL = (v0 - E.markLensed(wing, theta, sStar - eps, g)) / eps;
      const qR = (E.markLensed(wing, theta, sStar + eps, g) - v0) / eps;
      const expect = wing === 'put' ? -1 / theta : g * g / ((g + 1) * (g + 1) * theta);
      const rel = Math.max(Math.abs(qL - expect), Math.abs(qR - expect)) / Math.abs(expect);
      if (rel > maxRel) { maxRel = rel; worstC1 = wing + ' g=' + g.toFixed(2) + ' qL=' + qL.toFixed(6) + ' qR=' + qR.toFixed(6) + ' exp=' + expect.toFixed(6); }
    }
  }
  chk('(CM4-v2-C1) one-sided slope quotients at the seam: put −1/θ, call g²/((g+1)²·θ), both sides (rel ≤1e-4)',
      maxRel < 1e-4, 'maxRelErr=' + maxRel.toExponential(2) + ' ' + worstC1);
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

// ── (CM6-v2) FROZEN-ARC round trip (trade-point law close; operator entry 339;
//    spec SPEC_tradepoint_conservation_2026-07-02 §1.4/§3.1). Replaces CM6's
//    K_tx-only reversal check: the open now moves the pool via tradeUpdateAt, so
//    an exact round trip REQUIRES the frozen arc {dxA,dyA,dwA,oOpen} (every live
//    re-registration leaks — spec §1.4 leak table; sub-check 4 proves it here). ──
if (hasTradeMap) {
  const sA = mkPool(10, 800000, 0.5);   // beta=400000 depth, mode getSNorm=1
  const orc = 80000, mKnob = 2;          // m=2 ⇒ θ_tx further out
  const wOf = (st) => st.alpha / st.x;
  // fail LOUD-and-complete (never throw) on a build without the trade-point law
  const hasArcLaw = typeof E.revertArc === 'function' && typeof E.tradeUpdateAt === 'function';
  const mkBand = (c, r) => ({ sold_wing: c.sw, bought_wing: c.bw,
    sold:   { inner: c.si, outer: NaN, K_inner: c.si * orc, K_outer: NaN, K_tx: r.leg1.K_tx, arc: r.leg1.arc, N: r.N_sell },
    bought: { inner: c.bi, outer: NaN, K_inner: c.bi * orc, K_outer: NaN, K_tx: r.leg2.K_tx, arc: r.leg2.arc, N: r.N_buy },
    entry: { pool: sA, oracle: orc, L0: 1 },
    carved: { carvedNotional: 0, carvedEntryEquity: 1, entryPerpMark: orc } });
  const cases = [ { sw: 'call', bw: 'call', si: 1.1, bi: 1.2 },
                  { sw: 'put',  bw: 'put',  si: 0.9, bi: 0.85 } ];
  // (1) band open→close through closeBand→revertArc restores x, y AND w (≤1e-9)
  {
    let maxErr = 0, lines = [];
    for (const c of cases) {
      const sold = { K_inner: c.si * orc, K_outer: NaN, inner: c.si, outer: NaN };
      const bought = { K_inner: c.bi * orc, K_outer: NaN, inner: c.bi, outer: NaN };
      const r = E.executeBand(sA, c.sw, c.bw, sold, bought, 1, orc, orc, mKnob);
      if (!r.ok) { maxErr = Infinity; lines.push(c.sw + '/' + c.bw + ' open FAIL: ' + r.reason); continue; }
      const cl = E.closeBand(r.finalState, mkBand(c, r), { equity: 1e12 }, orc, orc, orc, mKnob);
      if (!cl.ok) { maxErr = Infinity; lines.push(c.sw + '/' + c.bw + ' close FAIL: ' + cl.reason); continue; }
      const ex = Math.abs(cl.finalState.x - sA.x), ey = Math.abs(cl.finalState.y - sA.y),
            ew = Math.abs(wOf(cl.finalState) - wOf(sA));
      maxErr = Math.max(maxErr, ex, ey, ew);
      lines.push(c.sw + '/' + c.bw + ' x-err=' + ex.toExponential(2) + ' y-err=' + ey.toExponential(2) + ' w-err=' + ew.toExponential(2));
    }
    chk('(CM6-v2.1) band open→close via frozen-arc revertArc restores x, y AND w (≤1e-9)',
        maxErr <= 1e-9, lines.join(' | '));
  }
  // (2) single-leg open + revertArc restores (x, y, w) ≤1e-12 (incl. a cash-out leg)
  {
    let maxErr = hasArcLaw ? 0 : Infinity, lines = hasArcLaw ? [] : ['revertArc/tradeUpdateAt MISSING'];
    for (const [wing, ls, th] of hasArcLaw ? [['call', 'sell', 1.3], ['put', 'buy', 0.8], ['put', 'sell', 0.9]] : []) {
      const open = E.executeLeg(sA, ls, wing, th, NaN, 1, orc, mKnob);
      if (!open || open.rejected || !open.arc) { maxErr = Infinity; lines.push(wing + '/' + ls + ' open FAIL (no arc)'); continue; }
      const back = E.revertArc(open.newState, open.arc, 1);
      if (!back) { maxErr = Infinity; lines.push(wing + '/' + ls + ' revertArc null'); continue; }
      const e = Math.max(Math.abs(back.x - sA.x), Math.abs(back.y - sA.y), Math.abs(wOf(back) - wOf(sA)));
      maxErr = Math.max(maxErr, e);
      lines.push(wing + '/' + ls + ' err=' + e.toExponential(2));
    }
    chk('(CM6-v2.2) single-leg open + revertArc restores (x, y, w) ≤1e-12',
        maxErr <= 1e-12, lines.join(' | '));
  }
  // (3) open → rebase(r) → close == rebase(s₀, r), r ∈ {0.8, 1.25} (rel ≤1e-9):
  //     leg-level arc close (rr = r) AND the full closeBand path (per-wing case
  //     chosen so the rebase does not flip the leg regime: r=0.8 → call band,
  //     r=1.25 → put band; rrArc inside closeBand = oNow/oOpen = r).
  {
    let maxRel = hasArcLaw ? 0 : Infinity, lines = hasArcLaw ? [] : ['revertArc/tradeUpdateAt MISSING'];
    for (const rb of hasArcLaw ? [0.8, 1.25] : []) {
      for (const [wing, ls, th] of [['call', 'sell', 1.3], ['put', 'sell', 0.9]]) {
        const open = E.executeLeg(sA, ls, wing, th, NaN, 1, orc, mKnob);
        const back = E.revertArc(E.rebase(open.newState, rb), open.arc, rb);
        const tgt = E.rebase(sA, rb);
        let rel = 0;
        for (const k of ['x', 'y', 'alpha', 'beta']) rel = Math.max(rel, Math.abs(back[k] - tgt[k]) / Math.max(1, Math.abs(tgt[k])));
        maxRel = Math.max(maxRel, rel);
        lines.push('leg ' + wing + ' r=' + rb + ' rel=' + rel.toExponential(2));
      }
      const c = (rb < 1) ? cases[0] : cases[1];   // keep both legs OTM after the rebase
      const sold = { K_inner: c.si * orc, K_outer: NaN, inner: c.si, outer: NaN };
      const bought = { K_inner: c.bi * orc, K_outer: NaN, inner: c.bi, outer: NaN };
      const r = E.executeBand(sA, c.sw, c.bw, sold, bought, 1, orc, orc, mKnob);
      const cl = E.closeBand(E.rebase(r.finalState, rb), mkBand(c, r), { equity: 1e12 }, orc * rb, orc * rb, orc, mKnob);
      if (!cl.ok) { maxRel = Infinity; lines.push('band r=' + rb + ' close FAIL: ' + cl.reason); continue; }
      const tgt = E.rebase(sA, rb);
      let rel = 0;
      for (const k of ['x', 'y', 'alpha', 'beta']) rel = Math.max(rel, Math.abs(cl.finalState[k] - tgt[k]) / Math.max(1, Math.abs(tgt[k])));
      maxRel = Math.max(maxRel, rel);
      lines.push('band ' + c.sw + ' r=' + rb + ' rel=' + rel.toExponential(2));
    }
    chk('(CM6-v2.3) open → rebase(r) → close == rebase(s₀,r), r∈{0.8,1.25} (rel ≤1e-9; leg AND closeBand paths)',
        maxRel <= 1e-9, lines.join(' | '));
  }
  // (4) NEGATIVE CONTROL — a live sNorm-re-registered reversal on the exhibit
  //     LEAKS pool x (|residual| > 1e-3): proves the frozen arc is load-bearing
  //     and catches a future "simplification" back to live re-anchoring.
  {
    const s0 = { x: 10, y: 10, alpha: 5, beta: 5 };
    const post = hasArcLaw ? E.tradeUpdateAt(s0, 1, 4) : null;        // exhibit open (θ_tx ray ρ=4)
    const modeLive = post ? E.getSNorm(post) : NaN;                   // live mode AFTER the trade
    const rev = post ? E.tradeUpdateAt(post, -1, 4 / modeLive) : null; // live re-registration ρ_c = θ_tx/mode_live
    const resid = rev ? Math.abs(rev.x - s0.x) : NaN;
    chk('(CM6-v2.4) negative control: LIVE re-registered reversal leaks |x-residual| > 1e-3 on the exhibit (arc freeze is load-bearing)',
        resid > 1e-3, 'x-residual=' + (rev ? (rev.x - s0.x).toExponential(3) : 'null/missing') + ' (spec-measured −2.78e-2)');
  }
  // (5) no-free-money: the closing trader's OWN flow pairs net to zero exactly —
  //     Σ own dy == 0 AND Σ own dx == 0 — immediately AND with one intervening
  //     spot trade (others' moves are KEPT: w_close = w_live − own dwA only).
  {
    let ok = hasArcLaw, lines = hasArcLaw ? [] : ['revertArc/tradeUpdateAt MISSING'];
    for (const interDy of hasArcLaw ? [0, 5000] : []) {
      const open = E.executeLeg(sA, 'sell', 'call', 1.3, NaN, 1, orc, mKnob);
      const mid = interDy === 0 ? open.newState : E.tradeUpdate(open.newState, interDy);  // intervening SPOT trade
      const back = E.revertArc(mid, open.arc, 1);
      const sumDx = open.arc.dxA + (back.x - mid.x);     // own open dx + own close dx
      const sumDy = open.arc.dyA + (back.y - mid.y);     // own open dy + own close dy
      const tolX = 1e-12 * Math.max(1, Math.abs(open.arc.dxA));
      const tolY = 1e-12 * Math.max(1, Math.abs(open.arc.dyA));
      const wKept = Math.abs((wOf(back) + open.arc.dwA) - wOf(mid)) <= 1e-12;  // removed OWN increment only
      if (!(Math.abs(sumDx) <= tolX && Math.abs(sumDy) <= tolY && wKept)) ok = false;
      lines.push('interDy=' + interDy + ' ΣownDx=' + sumDx.toExponential(2) + ' ΣownDy=' + sumDy.toExponential(2) + ' ownΔw-only=' + wKept);
    }
    chk('(CM6-v2.5) no-free-money: Σ own dx == 0 AND Σ own dy == 0 exactly, incl. one intervening spot trade',
        ok, lines.join(' | '));
  }
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

// ── (CM8-v2) TRADE-POINT conservation law (operator entries 14/16/339; paper Eq. 2;
//    spec SPEC_tradepoint_conservation_2026-07-02 §3.1). RETIRES the old CM8
//    ("no curve change in the pool") — that intent is FALSE BY DESIGN now: the
//    live trade path applies the conservation law AT the trade point T = ray∩curve
//    and the global α,β genuinely move. The SPOT trio stays byte-identical (v2.1). ──
{
  // (1) spot trio byte-identical to v24 (tradeUpdate / arbitrageToOracle / rebase)
  let allId = true, lines = [];
  for (const fn of ['tradeUpdate', 'arbitrageToOracle', 'rebase']) {
    const id = grabFn(engineBody, fn) === grabFn(baseBody, fn);
    allId = allId && id; lines.push(fn + ':' + (id ? 'identical' : 'DIFF'));
  }
  chk('(CM8-v2.1) SPOT trio byte-identical to v24 (tradeUpdate/arbitrageToOracle/rebase)', allId, lines.join(' '));

  const hasAt = typeof E.tradeUpdateAt === 'function';
  // (2) THE EXHIBIT (paper §2.3, HARD): (x,y,w)=(10,10,½), ρ=4, dy=+1 ⇒
  //     w′ = 11/21, Δx = −5/22, x′ = 215/22, y′ = 11 — and NOT the naive
  //     global recompute 22/43 (nor today's old-law 6/11).
  {
    let d = 'tradeUpdateAt MISSING', ok = false;
    if (hasAt) {
      const p = E.tradeUpdateAt({ x: 10, y: 10, alpha: 5, beta: 5 }, 1, 4);
      if (p) {
        const w = p.alpha / p.x;
        const eW = Math.abs(w - 11 / 21), eX = Math.abs(p.x - 215 / 22), eDx = Math.abs((p.x - 10) + 5 / 22);
        const notNaive = Math.abs(w - 22 / 43) > 1e-3 && Math.abs(w - 6 / 11) > 1e-3;
        ok = eW <= 1e-15 && eX <= 1e-13 && p.y === 11 && eDx <= 1e-12 && notNaive;
        d = '|w′−11/21|=' + eW.toExponential(2) + ' |x′−215/22|=' + eX.toExponential(2) +
            ' y′=' + p.y + ' |Δx+5/22|=' + eDx.toExponential(2) + ' not-naive(22/43,6/11)=' + notNaive;
      } else d = 'tradeUpdateAt returned null on the exhibit';
    }
    chk('(CM8-v2.2) exhibit 11/21 HARD: w′=11/21 (≤1e-15), x′=215/22 (≤1e-13), y′==11, Δx=−5/22 — NOT naive 22/43 / old 6/11', ok, d);
  }
  // (3) ρ = 1 reduces EXACTLY to the shipped spot tradeUpdate (w × dy grid)
  {
    let maxRel = hasAt ? 0 : Infinity;
    if (hasAt) {
      for (const w of [0.3, 0.5, 0.6, 0.725]) {
        const st = mkPool(10, 80000, w);
        for (const dy of [1, -1, 100, -100, 5000, -5000, 0.5]) {
          const a = E.tradeUpdate(st, dy), b = E.tradeUpdateAt(st, dy, 1);
          if ((a === null) !== (b === null)) { maxRel = Infinity; break; }
          if (!a) continue;
          for (const k of ['x', 'y', 'alpha', 'beta'])
            maxRel = Math.max(maxRel, Math.abs(a[k] - b[k]) / Math.max(1, Math.abs(a[k])));
        }
      }
    }
    chk('(CM8-v2.3) ρ=1 reduction ≡ tradeUpdate on a w×dy grid (rel ≤1e-12; spot trades unchanged)',
        maxRel <= 1e-12, 'maxRel=' + (isFinite(maxRel) ? maxRel.toExponential(2) : 'INF/missing'));
  }
  // (4) local-pair conservation AT T: the single w′ conserves BOTH local pairs —
  //     (x_T+Δx)·w′ == α_T  AND  (y_T+dy)·(1−w′) == β_T  (grid, rel ≤1e-12)
  {
    let maxRel = hasAt ? 0 : Infinity, n = 0;
    if (hasAt) {
      for (const [X, Y, w] of [[10, 10, 0.5], [10, 8e5, 0.5], [10, 8e5, 0.6], [10, 80000, 0.725]]) {
        const st = mkPool(X, Y, w);
        for (const rho of [0.25, 0.5, 1, 1.69, 2, 4]) {
          for (const dyF of [0.1, -0.05, 0.01]) {
            const dy = dyF * Y;
            const p = E.tradeUpdateAt(st, dy, rho);
            if (!p) continue;
            n++;
            const xT = st.x * Math.pow(rho, w - 1), yT = st.y * Math.pow(rho, w);
            const aT = w * xT, bT = (1 - w) * yT;
            const dx = p.x - st.x, wP = p.alpha / p.x;
            const r1 = Math.abs((xT + dx) * wP - aT) / Math.abs(aT);
            const r2 = Math.abs((yT + dy) * (1 - wP) - bT) / Math.abs(bT);
            maxRel = Math.max(maxRel, r1, r2);
          }
        }
      }
    }
    chk('(CM8-v2.4) local-pair conservation at T: (x_T+Δx)w′=α_T ∧ (y_T+dy)(1−w′)=β_T on the grid (rel ≤1e-12)',
        maxRel <= 1e-12 && n > 30, 'maxRel=' + (isFinite(maxRel) ? maxRel.toExponential(2) : 'INF/missing') + ' points=' + n);
  }
  // (5) routing: executeLeg's pool swap IS the trade-point law (negative control:
  //     the pre-build HEAD fails exactly this — it still calls tradeUpdate(state, dy))
  {
    const elSrc = grabFn(engineBody, 'executeLeg') || '';
    const usesAt = /tradeUpdateAt\(state, dy/.test(elSrc);
    const noOld = !/tradeUpdate\(state, dy\)/.test(elSrc);
    chk('(CM8-v2.5) routing: executeLeg swaps via tradeUpdateAt(state, dy, ρ) and NOT tradeUpdate(state, dy)',
        usesAt && noOld, 'tradeUpdateAt-call=' + usesAt + ' old-spot-call-absent=' + noOld);
  }
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

// ── (CM10) sign table / American faithfulness — value ≥ intrinsic (the O2 witness) ──
// PKG-ITM v2 (spec §7.1). Intrinsic recomputed IN THE GATE from ρ (put
// max(0, 1−sNorm/θ), call max(0, 1−θ/sNorm)) — NOT read from the engine, and
// NON-tautological: no max() exists in markLensed (§3); the continuation side is
// the content, the intrinsic side degenerates to arm-identity by design.
// Grid = the 25-point entry-286 S/K grid + a wide log-spaced sweep; g ∈ {2,6} × wings.
{
  const grid286 = [1.5, 1.333, 1.2, 1.1, 1, 0.95, 0.9, 0.85, 0.82, 0.8, 0.78, 0.75,
                   0.7, 0.6667, 0.6, 0.5, 0.48, 0.46, 0.45, 0.444, 0.43, 0.4, 0.35, 0.3, 0.2];
  const sweep = []; for (let r = 0.02; r <= 50; r *= 1.35) sweep.push(r);
  let ok = true, worst = '', minDiff = Infinity, nPts = 0;
  for (const g of [2, 6]) {
    for (const wing of ['call', 'put']) {
      const theta = 1.0;
      const seam = wing === 'put' ? g / (g + 1) : (g + 1) / g;
      for (const rho of grid286.concat(sweep)) {
        const sNorm = rho * theta;
        const v = E.markLensed(wing, theta, sNorm, g);
        const intr = wing === 'put' ? Math.max(0, 1 - sNorm / theta) : Math.max(0, 1 - theta / sNorm);
        const diff = v - intr; nPts++;
        if (diff < minDiff) minDiff = diff;
        if (!(diff >= -1e-12)) { ok = false; worst = 'BELOW-INTRINSIC ' + wing + ' g=' + g + ' ρ=' + rho + ' diff=' + diff; }
        const inIntrinsic = wing === 'put' ? (rho <= seam) : (rho >= seam);
        if (inIntrinsic) {
          if (!(Math.abs(diff) <= 1e-12)) { ok = false; worst = 'intrinsic-arm ' + wing + ' g=' + g + ' ρ=' + rho + ' diff=' + diff; }
        } else if (!(diff > 0)) { ok = false; worst = 'continuation not strictly > intrinsic ' + wing + ' g=' + g + ' ρ=' + rho + ' diff=' + diff; }
      }
    }
  }
  chk('(CM10) value ≥ intrinsic on the full grid (O2 witness, intrinsic recomputed in-gate): strict >0 in continuation, ==0 (≤1e-12) at/past the seam',
      ok, 'points=' + nPts + ' minDiff=' + minDiff.toExponential(2) + (ok ? '' : ' worst=' + worst));
}

// ── (CM11) OTM wing exact power-law of exponent g = m·γ ──
// PKG-ITM v2 (spec §7.1): the continuation is an EXACT power law in ρ — put
// V(2ρ)/V(ρ) == 2^(−g), call V(2ρ)/V(ρ) == 2^(+g) (both points in continuation).
// Locks the (K/S)^g wing shape the entry-286 finding showed missing.
{
  let maxRel = 0, worst = '';
  const theta = 0.8;   // non-unit ray: locks the ratio in ρ = sNorm/θ, not raw sNorm
  for (const g of [2, 6]) {
    for (const rho of [1.1, 3.7]) {      // put continuation: ρ > g/(g+1); 2ρ too
      const r = E.markLensed('put', theta, 2 * rho * theta, g) / E.markLensed('put', theta, rho * theta, g);
      const rel = Math.abs(r - Math.pow(2, -g)) / Math.pow(2, -g);
      if (rel > maxRel) { maxRel = rel; worst = 'put g=' + g + ' ρ=' + rho; }
    }
    for (const rho of [0.25, 0.5]) {     // call continuation: ρ ≤ (g+1)/g; 2ρ ≤ 7/6 ok
      const r = E.markLensed('call', theta, 2 * rho * theta, g) / E.markLensed('call', theta, rho * theta, g);
      const rel = Math.abs(r - Math.pow(2, g)) / Math.pow(2, g);
      if (rel > maxRel) { maxRel = rel; worst = 'call g=' + g + ' ρ=' + rho; }
    }
  }
  chk('(CM11) OTM wing exact power-law: put V(2ρ)/V(ρ)=2^(−g), call =2^(+g) (g∈{2,6}, rel ≤1e-12)',
      maxRel < 1e-12, 'maxRelErr=' + maxRel.toExponential(2) + (worst ? ' worst=' + worst : ''));
}

console.log('=== lens_selfcheck: ' + pass + ' PASS, ' + fail + ' FAIL ===');
process.exit(fail === 0 ? 0 : 1);

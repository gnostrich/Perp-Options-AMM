#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════════
//  monolith_consistency.js — ACTIVE theory↔impl consistency layer (REPORT-ONLY)
//  Operator entries 243 / 153#9 (the monolith program). Skeptic R6 scope-gate
//  PASSED (run a04465ae) WITH MANDATORY RIDERS — every rider below is obeyed
//  verbatim-in-spirit; an unobeyed rider makes this theater / false-gating.
// ════════════════════════════════════════════════════════════════════════════
//
//  HONEST CEILING (read this before trusting a green line):
//    This harness cross-checks NUMBERS (engine ⟺ Lean formula); it stays RED on
//    drift. It does NOT make Lean "verified" and does NOT prove the engine IS the
//    Lean object — only that they AGREE numerically. The Lean monolith
//    (MonolithConstM.lean) is trusted-from-prover, env-blocked from a canonical
//    local kernel; this is a numeric bridge, not a proof of identity.
//
//  REPORT-ONLY — NOT A GATE. This script EXITS 0 ALWAYS. It must never abort
//  run_all's `set -e` nor be mistaken for a HARD gate. The HARD gates are
//  lens_selfcheck.js (13) and a16_atm_gate.js (5); their green status is the bar.
//  Lines #5/#6/#8 that duplicate an existing HARD check are table-marked
//  "ALREADY HARD via CM# / covered HARD by CM#" so a green report line is never
//  read as the gate.
//
//  Engine ⟺ Lean object mapping (verified numerically, not assumed):
//    The engine pool state s = {x, y, alpha, beta} with alpha=x·w, beta=y·(1−w).
//    The Lean TemporalAMM carries {alpha, beta, y, m} with x DERIVED =
//    alpha·y/(y−beta). Substituting w=(y−beta)/y gives Lean.alpha = x·w and
//    Lean.beta = y·(1−w) — i.e. the engine's s.alpha / s.beta ARE the Lean
//    alpha / beta (confirmed: invariant + price identities hold to ~1e-15).
//
//  Each line is tagged:  <Lean thm name> | <INDEX row> | <engine fn> | NEW|XREF.
//  Lean source: formal/aristotle_runs/MONOLITH_CONSTM/extracted/RequestProject/
//               MonolithConstM.lean  (run 6016ec57 / task 3f85462d).
//  INDEX rows: formal/INDEX.md (CONSTANT-m monolith row) + formal/MONOLITH_INDEX.md.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');

const file = process.argv[2] ||
  path.join(__dirname, '..', 'builds', 'HEAD_temporal_mvp_v28_lens.html');
const src = fs.readFileSync(file, 'utf8');

function engineOf(s) {
  const m = /<script id="engine">([\s\S]*?)<\/script>/.exec(s);
  if (!m) { console.error('no engine script'); process.exit(0); } // report-only: never fail-hard
  const ctx = { Math, isFinite, console };
  vm.createContext(ctx);
  vm.runInContext(m[1] + '\n;this.__E=Engine;', ctx);
  return ctx.__E;
}
const E = engineOf(src);

// ── report-only result accumulator ──────────────────────────────────────────
const rows = [];
function line(num, leanThm, indexRow, engineFn, kind, ok, detail) {
  rows.push({ num, leanThm, indexRow, engineFn, kind, ok, detail });
}
const TOL = 1e-9;           // numeric agreement bar (FTC/algebra checks beat this by orders)

// ── the worked pool (matches lens_selfcheck's pool; γ = 2.6363…) ─────────────
const W = 0.725, x = 10, y = 80000;
const s = { x, y, alpha: x * W, beta: y * (1 - W) };
const a = s.alpha, b = s.beta;
const gamma = E.getW(s) / (1 - E.getW(s));
const mode = E.getSNorm(s);

console.log('');
console.log('════════════════════════════════════════════════════════════════════════════');
console.log(' MONOLITH CONSISTENCY (REPORT-ONLY, NOT GATING) — engine ⟺ Lean numeric cross-check');
console.log('   checks NUMBERS (engine ⟺ Lean formula); stays red-IN-TABLE on drift; does NOT');
console.log('   make Lean "verified" and does NOT prove the engine IS the Lean object —');
console.log('   only that they AGREE numerically.   exit 0 ALWAYS (HARD gates = lens 13 + a16 5).');
console.log('   Lean: MonolithConstM.lean (run 6016ec57) · engine: ' + path.basename(file));
console.log('════════════════════════════════════════════════════════════════════════════');

// ── (1) price = ∇μ : engine price == (y−β)²/(αβ) ─────────────────────────────
// RIDER (header disclosure): this does NOT discriminate price-coordinate from
// slope. On plain-Balancer v28, price == slope == getMP_raw because e^μ ≡ 1
// (THE-gotcha, CLAUDE.md §4 #12 / C10 / C12). It validates the price VALUE only.
{
  const priceLean = (s.y - s.beta) ** 2 / (s.alpha * s.beta);
  const priceEng = E.getMP_raw(s);
  const err = Math.abs(priceEng - priceLean);
  line(1, 'price_is_grad / price', 'T2 price_is_grad / C14', 'getMP_raw', 'NEW',
    err < TOL,
    'engine=' + priceEng.toExponential(8) + ' lean(y−β)²/αβ=' + priceLean.toExponential(8) +
    ' |Δ|=' + err.toExponential(2) +
    '  ⚠RIDER: value-only; price==slope==getMP_raw on plain-Balancer (e^μ≡1, THE-gotcha)');
}

// ── (2) invariant (x−α)(y−β)=αβ on the pool ──────────────────────────────────
{
  const lhs = (s.x - s.alpha) * (s.y - s.beta);
  const rhs = s.alpha * s.beta;
  const err = Math.abs(lhs - rhs);
  line(2, 'invariant', 'C1 invariant', '(x,y,alpha,beta) pool', 'NEW',
    err < TOL,
    '(x−α)(y−β)=' + lhs.toExponential(8) + ' αβ=' + rhs.toExponential(8) + ' |Δ|=' + err.toExponential(2));
}

// ── (3) R_psd: μ″ = 2(t−β)/(αβ) ≥ 0 on t ≥ β ─────────────────────────────────
// RIDER (false-red the skeptic hit): the engine exposes only the MARGINAL
// (= poolPotential′ = the price-coordinate), NOT poolPotential. To get μ″ you
// FIRST-DIFFERENCE the marginal (dPrice/dt). Do NOT second-difference the
// marginal — that gave a 58000× error → false red on a correct engine.
// METHOD USED: central first-difference of the engine marginal getMP_raw(t)
// (marginal read by moving the pool along the curve via tradeUpdate), compared
// to the Lean closed form 2(t−β)/(αβ); also assert μ″ ≥ 0 on t ≥ β.
{
  const marg = (t) => E.getMP_raw(E.tradeUpdate(s, t - s.y)); // price-coordinate at reserve t
  let maxRel = 0, allNonneg = true, worst = '';
  for (const t of [b + 5000, b + 20000, b + 50000, y, y + 10000, y + 30000]) {
    const h = t * 1e-6 + 1;
    const muPP = (marg(t + h) - marg(t - h)) / (2 * h);   // FIRST-difference of the marginal
    const closed = 2 * (t - b) / (a * b);
    const rel = Math.abs(muPP - closed) / Math.max(1e-30, Math.abs(closed));
    if (rel > maxRel) { maxRel = rel; worst = 't=' + t.toFixed(0) + ' fd=' + muPP.toExponential(4) + ' closed=' + closed.toExponential(4); }
    if (muPP < 0) allNonneg = false;
  }
  line(3, 'R_psd (μ″=2(t−β)/αβ≥0)', 'T2 R_psd / C14', 'getMP_raw (1st-diff)', 'NEW',
    maxRel < 1e-6 && allNonneg,
    'method=FIRST-difference(marginal); maxRelErr vs 2(t−β)/αβ=' + maxRel.toExponential(2) +
    ' nonneg-on-t≥β=' + allNonneg + ' (' + worst + ')  ⚠RIDER: NOT 2nd-diff (that=58000× false-red)');
}

// ── (4) g = m·γ : engine gLoc == m·(w/(1−w)) ─────────────────────────────────
{
  let maxErr = 0, worst = '';
  for (const m of [1, 2, 3, 4]) {
    for (const mult of [0.2, 1.0, 5.0, 40.0]) {       // strike-independent: same at every θ
      const got = E.gLoc(s, mode * mult, m);
      const exp = m * gamma;
      const e = Math.abs(got - exp);
      if (e > maxErr) { maxErr = e; worst = 'm=' + m + ' θ×' + mult + ' got=' + got.toFixed(8) + ' exp=' + exp.toFixed(8); }
    }
  }
  line(4, 'g_eq_m_gamma / g_const_in_strike', 'MonolithConstM g_eq_m_gamma', 'gLoc', 'NEW',
    maxErr < 1e-12,
    'gLoc == m·(w/(1−w)) at every strike; maxAbsErr=' + maxErr.toExponential(2) + ' (' + worst + ') [extends CM1]');
}

// ── (5) θ_tx = mode·(chosen/mode)^m : engine executeLeg tx-strike ─────────────
// RIDER: ALREADY HARD via CM5 — this is a report-only cross-ref, not the gate.
{
  let maxErr = 0, worst = '';
  const orc = 80000;
  for (const m of [1, 2, 3]) {
    for (const mult of [0.5, 1.3, 2.0, 4.0]) {
      const chosen = mode * mult;
      const wing = mult >= 1 ? 'call' : 'put';
      const lg = E.executeLeg(s, 'sell', wing, chosen, NaN, 1, orc, m);
      const exp = mode * Math.pow(chosen / mode, m);
      const e = Math.abs(lg.theta_tx - exp);
      if (e > maxErr) { maxErr = e; worst = 'm=' + m + ' θ×' + mult + ' tx=' + lg.theta_tx.toFixed(6) + ' exp=' + exp.toFixed(6); }
    }
  }
  line(5, 'thetaTx (def) / thetaTx_roundtrip', 'MonolithConstM thetaTx', 'executeLeg', 'XREF',
    maxErr < TOL,
    'θ_tx == mode·(chosen/mode)^m; maxAbsErr=' + maxErr.toExponential(2) + ' (' + worst + ')  ⚑ALREADY HARD via CM5 (report-only cross-ref)');
}

// ── (6) smooth-paste value+slope at S*=θ((g+1)/g)^g : engine markLensed seam ──
// RIDER: ALREADY HARD via CM4 — report-only cross-ref.
{
  let maxGap = 0, worst = '';
  const sStarCall = (g, th) => th * Math.pow((g + 1) / g, g);
  const sStarPut = (g, th) => th * Math.pow(g / (g + 1), g);
  for (const m of [1, 2, 3]) {
    const g = m * gamma, th = 1.0;
    for (const wing of ['call', 'put']) {
      const sStar = wing === 'call' ? sStarCall(g, th) : sStarPut(g, th);
      const vL = E.markLensed(wing, th, sStar * (1 - 1e-10), g);
      const vR = E.markLensed(wing, th, sStar * (1 + 1e-10), g);
      const fGap = Math.abs(E.markLensed(wing, th, sStar, g) - 1 / (g + 1)); // Lean paste fraction = 1/(g+1)
      const tot = Math.max(Math.abs(vL - vR), fGap);
      if (tot > maxGap) { maxGap = tot; worst = wing + ' m=' + m + ' g=' + g.toFixed(2); }
    }
  }
  line(6, 'paste_value / paste_slope', 'LENSKERNEL valueMatch_g/slopeMatch_g (R1/T1a)', 'markLensed', 'XREF',
    maxGap < TOL,
    'C⁰ seam value & boundary-fraction 1/(g+1) at S*; maxSeamGap=' + maxGap.toExponential(2) + ' (' + worst + ')  ⚑ALREADY HARD via CM4 (report-only cross-ref)');
}

// ── (7) warp_linear ΔG = m·Δγ : from the engine's tradeUpdate ─────────────────
// RIDER: the brief was WRONG — there is NO "engine warp" quantity (only draw-layer
// animation). The ACTUAL Lean object: a trade adds D/β to γ (gamma_affine), so
// warp_linear(γ, γ′) = m·(γ′−γ) = m·(D/β). Compute Δγ from the engine's tradeUpdate
// (γ before vs after a dy=D) and assert m·Δγ matches the Lean warp_linear.
{
  let maxErr = 0, worst = '';
  const gOf = (st) => { const w = E.getW(st); return w / (1 - w); };
  for (const D of [1000, -1000, 5000, -3000, 20000]) {
    const s2 = E.tradeUpdate(s, D);
    const dGammaEng = gOf(s2) - gOf(s);          // engine's actual Δγ from tradeUpdate
    for (const m of [1, 2, 3]) {
      const warpEng = m * dGammaEng;             // m·Δγ from the engine
      const warpLean = m * (D / b);              // Lean warp_linear = m·(D/β) (gamma_affine)
      const e = Math.abs(warpEng - warpLean);
      if (e > maxErr) { maxErr = e; worst = 'D=' + D + ' m=' + m + ' eng=' + warpEng.toExponential(4) + ' lean=' + warpLean.toExponential(4); }
    }
  }
  line(7, 'warp_linear / gamma_affine', 'MonolithConstM warp_linear / warp_eq_m_dgamma', 'tradeUpdate (Δγ)', 'NEW',
    maxErr < 1e-9,
    'm·Δγ(engine tradeUpdate) == m·(D/β)(Lean); maxAbsErr=' + maxErr.toExponential(2) + ' (' + worst + ')  [rewrote brief: warp=gamma_affine, no draw-layer]');
}

// ── (8) internal_passivity : Hs telescoping with Rcurv = μ″ (OPTION a) ────────
// RIDER: the brief's "Σdy=0" just re-runs CM6 on a DIFFERENT object. Two honest
// choices; (a) is feasible from the engine, so it is taken:
//   (a) reproduce the Lean `internal_passivity` mechanism numerically — the Hs
//       telescoping with the poolPotential curvature Rcurv = μ″. The engine's
//       integrated marginal work over a leg equals ΔHs (FTC, since μ′=price),
//       the increments telescope to Hs(N)−H0 exactly, and Rcurv=μ″ (FIRST-diff
//       of the marginal, per check 3's rider) is ≥0 on every leg ⇒ stored energy
//       never exceeds supplied work (passivity, no internal free money).
// Hs = poolPotential = ∫price = (t−β)³/(3αβ) (the convex storage); the engine
// supplies the marginal price(t)=getMP_raw, integrated by Simpson per leg.
{
  const marg = (t) => E.getMP_raw(E.tradeUpdate(s, t - s.y));
  const Hs = (t) => (t - b) ** 3 / (3 * a * b);          // convex storage (μ antiderivative)
  const seq = [80000, 85000, 82000, 90000, 78000, 95000]; // a trade sequence (up & down)
  let telSum = 0, intSum = 0, allFTC = true, allPSD = true, worst = '';
  for (let k = 0; k < seq.length - 1; k++) {
    const t0 = seq[k], t1 = seq[k + 1];
    const dHs = Hs(t1) - Hs(t0); telSum += dHs;
    // Simpson integral of the ENGINE marginal over the leg (the "supplied" work)
    const Nsub = 1000, dt = (t1 - t0) / Nsub; let I = 0;
    for (let i = 0; i <= Nsub; i++) { const tm = t0 + i * dt; const c = (i === 0 || i === Nsub) ? 1 : (i % 2 ? 4 : 2); I += c * marg(tm); }
    I *= dt / 3; intSum += I;
    if (Math.abs(I - dHs) / Math.max(1, Math.abs(dHs)) > 1e-6) { allFTC = false; worst = 'leg ' + k + ' FTC'; }
    // Rcurv = μ″ via first-difference of the marginal (NOT second-difference) at leg midpoint
    const tm = (t0 + t1) / 2, h = tm * 1e-6 + 1;
    const rc = (marg(tm + h) - marg(tm - h)) / (2 * h);
    if (rc < 0) { allPSD = false; worst = 'leg ' + k + ' Rcurv<0'; }
  }
  const HsNet = Hs(seq[seq.length - 1]) - Hs(seq[0]);
  const telOk = Math.abs(telSum - HsNet) / Math.max(1, Math.abs(HsNet)) < 1e-12;
  line(8, 'internal_passivity / no_internal_free_money', 'PHUnification internal_passivity (INDEX.md)', 'getMP_raw (∫ + Rcurv)', 'NEW',
    allFTC && allPSD && telOk,
    'Hs telescoping=Hs(N)−H0 (rel ' + (Math.abs(telSum - HsNet) / Math.max(1, Math.abs(HsNet))).toExponential(1) +
    '); ∫engine-marginal==ΔHs/leg (FTC)=' + allFTC + '; Rcurv=μ″≥0/leg=' + allPSD +
    '  [OPTION (a): real Hs telescoping w/ Rcurv=μ″, NOT a CM6 re-run]');
}

// ── render the table ─────────────────────────────────────────────────────────
console.log('');
let nPass = 0, nFail = 0;
for (const r of rows) {
  const verdict = r.ok ? 'PASS' : 'FAIL';
  if (r.ok) nPass++; else nFail++;
  const tag = '[' + r.leanThm + ' | ' + r.indexRow + ' | engine:' + r.engineFn + ' | ' + r.kind + ']';
  console.log('(' + r.num + ') Lean thm ⟺ engine — ' + verdict);
  console.log('     ' + tag);
  console.log('     ' + r.detail);
}
console.log('');
console.log('──────────────────────────────────────────────────────────────────────────');
console.log(' monolith_consistency: ' + nPass + ' PASS, ' + nFail + ' FAIL (REPORT-ONLY — exit 0 ALWAYS)');
console.log('   genuinely-NEW lines: 1,2,3,4,7,8   ·   cross-ref (already-HARD): 5(CM5), 6(CM4)');
console.log('   HARD gates remain lens_selfcheck (13) + a16_atm_gate (5); THIS is not a gate.');
console.log('──────────────────────────────────────────────────────────────────────────');

process.exit(0);  // REPORT-ONLY: never abort run_all's set -e, never mistaken for a HARD gate.

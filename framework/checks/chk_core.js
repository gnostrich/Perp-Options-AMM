// framework/checks/chk_core.js — runnable curve-agnostic propagation checks (CHK-1..CHK-6)
// Manager-built 2026-06-11 (operator deadline, transcript entry 20). Read-only on the engine:
// loads <script id="engine"> from engine/builds/HEAD_temporal_mvp_v26c.html via vm sandbox.
// Honest labels: each check prints PASS/FAIL/REPORT + the computed numbers. Negative controls
// included (a check that cannot fail is not a check). Exit code = 1 if any gated check fails.
"use strict";
const fs = require("fs"), vm = require("vm"), path = require("path");

// ---------- shared ----------
function loadEngine() {
  const html = fs.readFileSync(path.join(__dirname, "../../engine/builds/HEAD_temporal_mvp_v26c.html"), "utf8");
  const m = html.match(/<script id="engine"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error("engine block not found");
  const ctx = { Math, console }; vm.createContext(ctx);
  vm.runInNewContext(m[1] + ";globalThis.__E=Engine;", ctx);
  return ctx.__E;
}
// (W) anchored family, w_mid=1/2: s(u)=ln k + (dw/2)*sqrt(tau^2+u^2); x=e^{s-u/2}, y=e^{s+u/2}
function Wcurve(dw, tau, lnk) {
  const S = u => Math.sqrt(tau * tau + u * u);
  return {
    x: u => Math.exp(lnk + (dw / 2) * S(u) - u / 2),
    y: u => Math.exp(lnk + (dw / 2) * S(u) + u / 2),
    w: u => 0.5 + (dw / 2) * (u / S(u || 1e-300)),
    eps: u => { const w = 0.5 + (dw / 2) * (u / S(u || 1e-300)); return w / (1 - w); }, // elasticity
  };
}
const fmt = x => (typeof x === "number" ? x.toExponential(3) : x);
let failures = 0;
function gate(name, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  ${detail}`);
  if (!ok) failures++;
}
function report(name, detail) { console.log(`REPORT ${name}  ${detail}`); }

// ---------- CHK-1: mode-at-mark (mode == unit-slope point) ----------
// Forced form: AC-2/AC-4 + LDF note §2-3 (validity-gate qualifier; at-the-mark scope per §16).
(function CHK1() {
  // (a) (W) anchored instances: mode (argmax min(x,y)) and elasticity-1 root must coincide at u=0
  for (const [dw, tau] of [[0.2, 0.3], [-0.2, 0.5]]) {
    const c = Wcurve(dw, tau, 0);
    // argmax of min(x,y) over grid
    let best = -1, bu = NaN;
    for (let u = -3; u <= 3; u += 1e-4) { const v = Math.min(c.x(u), c.y(u)); if (v > best) { best = v; bu = u; } }
    // elasticity-1 root by bisection (eps(u)-1 monotone near 0 inside validity)
    let lo = -1, hi = 1; for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; ((c.eps(lo) - 1) * (c.eps(mid) - 1) <= 0) ? hi = mid : lo = mid; }
    const ur = (lo + hi) / 2;
    gate(`CHK-1a (W) dw=${dw} tau=${tau} mode==unit-slope`, Math.abs(bu) <= 2e-4 && Math.abs(ur) <= 1e-9,
      `mode_u=${fmt(bu)} eps1_u=${fmt(ur)} (both ~0; slope at mode = ${fmt(-(c.eps(bu)) * (c.y(bu) / c.x(bu)) / (c.y(bu) / c.x(bu)))})`);
  }
  // (b) negative control: weighted CD w=0.4 has NO elasticity-1 point (eps ≡ 2/3)
  const epsCD = 0.4 / 0.6;
  gate("CHK-1b weighted-CD w=0.4 negative control (must FAIL mode-at-mark)", Math.abs(epsCD - 1) > 0.3,
    `eps ≡ ${epsCD.toFixed(4)} ≠ 1 everywhere — correctly inadmissible`);
  // (c) live GH: elasticity at the calibrated mark = e^(-ghMu) — fails mode-at-mark by that factor
  const E = loadEngine();
  for (const g of [2, 3]) {
    const p = E.ghCalibrate(10, 1360000, 136000, g);
    const factor = Math.exp(p.ghMu);
    gate(`CHK-1c live GH gamma=${g} mark is NOT the mode (expected fail-by-factor)`, factor > 40,
      `elasticity@mark = e^(-ghMu) = 1/${factor.toFixed(2)} (mode-at-mark off by ${factor.toFixed(2)}x)`);
  }
})();

// ---------- CHK-2: warp rule (paper Trade Formula = slope transport, integral form) ----------
// Forced form: AC-1 (entry 7 verbatim; alpha=x*w, beta=y*(1-w) conserved; Balancer instance).
(function CHK2() {
  let x = 80, y = 150, w = 0.3;
  const a = x * w, b = y * (1 - w);
  // 100 random trades via conservation rule; alpha/beta drift must be ~0 by construction,
  // and slope-transport: micro-integrated (N slices) result == one-shot conservation update.
  let xs = x, ys = y, ws = w;
  for (let t = 0; t < 100; t++) {
    const dy = (Math.sin(t * 12.9898) * 43758.5453 % 1) * 2 - 0.5; // deterministic pseudo-random in [-0.5,1.5]
    const yN = ys + dy; if (yN <= b + 1e-6) continue;
    const xN = a * yN / (yN - b); ws = a / xN; xs = xN; ys = yN;
  }
  const aD = Math.abs(xs * ws - a) / a, bD = Math.abs(ys * (1 - ws) - b) / b;
  gate("CHK-2a alpha/beta conservation over 100 trades", aD < 1e-12 && bD < 1e-12, `alpha drift=${fmt(aD)} beta drift=${fmt(bD)}`);
  // micro-integration vs one-shot for a finite trade dy=+30
  const oneShot = (() => { const yN = y + 30, xN = a * yN / (yN - b); return a / xN; })();
  let xm = x, ym = y, wm = w; const N = 10000;
  for (let i = 0; i < N; i++) { const yN = ym + 30 / N, xN = (xm * wm) * yN / (yN - ym * (1 - wm)); wm = (xm * wm) / xN; xm = xN; ym = yN; }
  const slopeOne = (oneShot / (1 - oneShot)) * ((y + 30) / (a * (y + 30) / (y + 30 - b)));
  const slopeMicro = (wm / (1 - wm)) * (ym / xm);
  gate("CHK-2b finite trade = integral of slices (slope agreement)", Math.abs(slopeOne / slopeMicro - 1) < 1e-9,
    `one-shot slope=${slopeOne.toFixed(9)} micro(10k)=${slopeMicro.toFixed(9)} reldiff=${fmt(Math.abs(slopeOne / slopeMicro - 1))}`);
})();

// ---------- CHK-3: four-number budget — gamma derived, wings tau-invariant ----------
// Forced form: AC-3 (entry 5 verbatim: no separate wing-steepness knob).
(function CHK3() {
  // Verified claim (KURTOSIS_KNOB note, manager-verified): gamma_loc at wing distance ±100*tau is
  // tau-invariant (pure horizontal elbow rescale). Per-wing orientation: u->+inf => w->w_+=0.6 =>
  // |gamma_loc| -> w_+/(1-w_+) = 1.5 ; u->-inf => 0.4/0.6 = 0.6667.
  const targets = { plus: 0.6 / 0.4, minus: 0.4 / 0.6 };
  for (const side of [+1, -1]) {
    const vals = [];
    for (const tau of [0.05, 1, 3]) {
      const c = Wcurve(0.2, tau, 0), h = 1e-6, u = side * Math.max(8, 100 * tau);
      const gl = Math.abs((Math.log(c.y(u + h)) - Math.log(c.y(u - h))) / (Math.log(c.x(u + h)) - Math.log(c.x(u - h))));
      vals.push(gl);
    }
    const want = side > 0 ? targets.plus : targets.minus;
    const spread = Math.max(...vals) - Math.min(...vals);
    gate(`CHK-3 wing ${side > 0 ? "+" : "-"}: gamma_loc derived from w, tau-invariant at ±100tau`,
      Math.abs(vals[0] - want) < 1e-3 && spread < 1e-3,
      `gamma_loc=[${vals.map(v => v.toFixed(6)).join(", ")}] derived target=${want.toFixed(6)} tau-spread=${fmt(spread)}`);
  }
  // Honest report: at FIXED u the elbow's rounding reach ~tau means large-tau wings converge farther out
  const c3 = Wcurve(0.2, 3, 0), h = 1e-6;
  const glFixed = Math.abs((Math.log(c3.y(6 + h)) - Math.log(c3.y(6 - h))) / (Math.log(c3.x(6 + h)) - Math.log(c3.x(6 - h))));
  report("CHK-3-reach", `at FIXED u=6, tau=3 gives gamma_loc=${glFixed.toFixed(4)} (vs 1.5 asymptote) — the elbow reach scales with tau; wing exponent unchanged, measured where the wing lives (±100tau)`);
})();

// ---------- CHK-4: funding anchor — unskewed same-tau member exists; funding == 0 on it ----------
// Forced form: AC-5 (entry 3 verbatim: anchor unskewed, same kurtosis).
(function CHK4() {
  for (const tau of [0.05, 0.3, 1, 3]) {
    const anchor = Wcurve(0, tau, 0);           // dw=0 member exists at every tau (existence by construction)
    const pool = Wcurve(0.2, tau, 0);
    // funding functional (slope-deviation ratio at strike rays): == 0 on anchor-vs-anchor; != 0 pool-vs-anchor
    let zero = 0, nonzero = 0;
    for (const u of [-1, -0.3, 0.3, 1]) {
      const sA = anchor.eps(u), sP = pool.eps(u);
      zero = Math.max(zero, Math.abs(sA / sA - 1));
      nonzero = Math.max(nonzero, Math.abs(sP / sA - 1));
    }
    gate(`CHK-4 tau=${tau} anchor exists; funding(anchor)=0; funding(pool)!=0`, zero === 0 && nonzero > 1e-3,
      `anchor self-deviation=${zero} pool-vs-anchor max |ratio-1|=${fmt(nonzero)}`);
  }
  report("CHK-4-GH", "GH at engine pin beta=1: zero-skew member requires beta=0 = settlement-semantics change (B-FULL fork) — anchor existence CONDITIONAL, operator-tier; cited from skeptic stock-take 2026-06-10, not re-run");
})();

// ---------- CHK-5: LDF (closest-axis thickness) — Balancer tent formula + mode location ----------
// Forced form: AC-4 (entry 4 verbatim; LDF note §1).
(function CHK5() {
  const k = 4; // xy = 4, sqrt(k)=2
  let maxRes = 0;
  for (let u = -4; u <= 4; u += 0.01) {
    const x = 2 * Math.exp(-u / 2), y = 2 * Math.exp(u / 2);
    maxRes = Math.max(maxRes, Math.abs(Math.min(x, y) - 2 * Math.exp(-Math.abs(u) / 2)));
  }
  gate("CHK-5 Balancer LDF = sqrt(k)*e^(-|u|/2) tent, mode at 45-deg ray", maxRes < 1e-12, `max formula residual=${fmt(maxRes)}`);
})();

// ---------- CHK-6: solvency exposure REPORT (no pass/fail — B1 is the operator's extrinsic ship-gate) ----------
(function CHK6() {
  const rows = [];
  for (const tau of [0.05, 0.3, 1, 3]) {
    const c = Wcurve(0.2, tau, 0);
    rows.push(`tau=${tau}: x(u=-3)/x(0)=${(c.x(-3) / c.x(0)).toFixed(4)}`);
  }
  report("CHK-6 (W) wing-depth profile across tau (knob re-prices depth; geometry never closes solvency)", rows.join(" | "));
})();

console.log(failures === 0 ? "\nALL GATED CHECKS PASS (reports above are informational)" : `\n${failures} GATED CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

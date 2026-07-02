// -B301-DASH TARGETED RE-CHECK (fix build md5 7015c22c…; draw-layer only:
// screen-space tail dash [8,6]·cssScale + 3·yMax coordinate clamp).
// Narrow scope per manager brief — prior a6ca02f3 28/29 PASS items carry:
//   R1 THE FLAG ITEM: $ view M=2 put parity tail per-pixel ROW coverage < 0.9 (+ zoom exhibit)
//   R2 % view tails still legibly dashed (<0.9), continuations still solid (vs prior values)
//   R3 clamp changed NO in-frame geometry: X crossing height + seam positions vs prior ±1px
//   R4 byte-stability: two redraws identical; build md5 unchanged pre/post
//   R5 zero console/pageerrors on load + toggle + one m-change
// Measurement functions copied VERBATIM-in-logic from pw_display_slice_acceptance.mjs.
// READ-ONLY on the engine. Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
//   node verify/pw_b301_dash_recheck.mjs A   (then B)
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/display_slice_acceptance');
fs.mkdirSync(EVID, { recursive: true });
const LOG = []; const log = (s) => { LOG.push(s); console.log(s); };
const md5f = (f) => execSync('md5sum ' + f).toString().split(' ')[0];
const CHECKS = []; const ck = (n, p, d) => { CHECKS.push({ n, p: !!p, d }); log(`${p ? 'PASS' : 'FAIL'} ${n}  ${d}`); };
const r4 = (x) => Math.round(x * 1e4) / 1e4;

// PRIOR MEASUREMENTS on a6ca02f3 (RESULT_runA.json == runB) — the ±1px anchors
const PRIOR = {
  pctCrossX: 462, pctCrossV: 0.15, pctPutSeamX: 561, pctCallSeamX: 374,
  pctBoundaryV: 0.3307, pctPutDeep: 0.9682, pctCallDeep: 0.9682,
  usdCrossUsd: 12013, usdExitX: 658,
  covPutContPct: 0.9897, covCallContPct: 0.9906, covPutContUsd: 0.9897, covCallContUsd: 0.9977,
  putTailRowCovUsd_BROKEN: 0.9647,
};

const md5pre = md5f(BUILD);
log(`=== -B301-DASH RECHECK run ${RUN}  build md5 ${md5pre} ===`);

const PAD = { top: 18, right: 18, bottom: 54, left: 50 };
const PLOT_W = 900 - PAD.left - PAD.right;   // 832
const PLOT_H = 380 - PAD.top - PAD.bottom;   // 308
const xAtPhi = (phi) => PAD.left + (phi / 90) * PLOT_W;
const phiAtX = (x) => (x - PAD.left) / PLOT_W * 90;
const vAtY = (y, yMax) => (1 - (y - PAD.top) / PLOT_H) * yMax;

const errors = [], dialogs = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text()); });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

await page.goto('file://' + BUILD);
await page.waitForTimeout(600);

const setField = async (id, v) => page.evaluate(({ id, v }) => {
  const e = document.getElementById(id); e.value = String(v);
  e.dispatchEvent(new Event('input', { bubbles: true }));
  e.dispatchEvent(new Event('change', { bubbles: true }));
}, { id, v });
const click = async (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
const canvasHash = async (id) => page.evaluate((cid) => {
  const c = document.getElementById(cid); return c ? c.toDataURL() : null;
}, id).then(d => d ? crypto.createHash('md5').update(d).digest('hex').slice(0, 12) : null);

const wingProfile = async () => page.evaluate(({ pad, plotW, plotH }) => {
  const c = document.getElementById('canvas-pricing');
  const im = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const W = c.width;
  const match = (i, v) => im[i + 3] > 200 && im[i] === v[0] && im[i + 1] === v[1] && im[i + 2] === v[2];
  const COLORS = { put: [255, 133, 176], call: [10, 186, 181] };
  const out = {};
  for (const k of Object.keys(COLORS)) out[k] = {};
  for (let x = pad.left; x <= pad.left + plotW; x++) {
    for (let y = pad.top - 2; y <= pad.top + plotH + 2; y++) {
      const i = (y * W + x) * 4;
      for (const [k, v] of Object.entries(COLORS)) {
        if (match(i, v)) {
          const o = out[k];
          if (!o[x]) o[x] = { yMin: y, yMax: y, n: 0 };
          o[x].yMin = Math.min(o[x].yMin, y); o[x].yMax = Math.max(o[x].yMax, y); o[x].n++;
        }
      }
    }
  }
  return out;
}, { pad: PAD, plotW: PLOT_W, plotH: PLOT_H });

const colsIn = (prof, x0, x1) => Object.keys(prof).map(Number).filter(x => x >= x0 && x <= x1);
const coverage = (prof, x0, x1) => colsIn(prof, x0, x1).length / (Math.round(x1) - Math.round(x0) + 1);
const midY = (prof, x) => { const c = prof[x]; return c ? (c.yMin + c.yMax) / 2 : null; };
const nearestMidY = (prof, x, span = 3) => {
  for (let d = 0; d <= span; d++) { for (const xx of [x - d, x + d]) { const m = midY(prof, xx); if (m !== null) return { x: xx, y: m }; } }
  return null;
};
const crossingGap = (profA, profB, xc, halfWin = 10) => {
  let best = null;
  for (let x = Math.round(xc) - halfWin; x <= Math.round(xc) + halfWin; x++) {
    const a = midY(profA, x), b = midY(profB, x);
    if (a !== null && b !== null) { const g = Math.abs(a - b); if (best === null || g < best.gap) best = { x, gap: g, y: (a + b) / 2 }; }
  }
  return best;
};
const seamRight = (prof, xStart, xEnd, win = 14, thr = 0.85) => {
  for (let x = Math.round(xStart); x <= Math.round(xEnd) - win; x++) {
    let n = 0; for (let d = 0; d <= win; d++) if (prof[x + d]) n++;
    if (n / (win + 1) < thr) return x;
  }
  return null;
};
const seamLeft = (prof, xStart, xEnd, win = 14, thr = 0.85) => {
  for (let x = Math.round(xStart); x >= Math.round(xEnd) + win; x--) {
    let n = 0; for (let d = 0; d <= win; d++) if (prof[x - d]) n++;
    if (n / (win + 1) < thr) return x;
  }
  return null;
};

// ── SETUP (identical to acceptance): clear boot ghost, chart-2, M=2 ────────
await setField('band-notional', ''); await setField('sold-inner', ''); await setField('bought-inner', '');
await setField('chart-select', 'pricing'); await page.waitForTimeout(200);
await setField('m-input', 2); await page.waitForTimeout(200);
const live0 = await page.evaluate(() => {
  const s = Store.state;
  const cv = document.getElementById('canvas-pricing');
  return {
    m: s.m, g: Engine.gLoc(s.pool, 1, s.m), sNorm: Engine.getSNorm(s.pool),
    oracle: s.oracle, unit: window.__pricingUnit, previewBand: !!window.__previewBand,
    cssScale: cv.clientWidth > 0 ? cv.width / cv.clientWidth : 1,
  };
});
ck('R0 SETUP M=2 ⇒ g=2, sNorm=1, unit=pct, no preview ghost',
  Math.abs(live0.g - 2) < 1e-12 && Math.abs(live0.sNorm - 1) < 1e-12 && live0.unit === 'pct' && !live0.previewBand,
  JSON.stringify({ ...live0, cssScale: r4(live0.cssScale) }));

const xATM = xAtPhi(Math.atan(live0.sNorm) * 180 / Math.PI);
const G = 2, ATM_V = Math.pow(G / (G + 1), G) / (G + 1);
const PHI_PUT_SEAM = Math.atan(live0.sNorm * (G + 1) / G) * 180 / Math.PI;

// ── R2 + R3 (% view): tails dashed, continuations solid, geometry anchored ─
const profPct1 = await wingProfile();
const hashPct1 = await canvasHash('canvas-pricing');
const P = profPct1.put, C = profPct1.call;
const covPutCont = coverage(P, xAtPhi(8), xAtPhi(50));
const covPutTail = coverage(P, xAtPhi(62), xAtPhi(86));
const covCallCont = coverage(C, xAtPhi(40), xAtPhi(86));
const covCallTail = coverage(C, xAtPhi(4), xAtPhi(28));
ck('R2a % continuations still solid (unchanged vs prior 0.9897/0.9906)',
  covPutCont >= PRIOR.covPutContPct - 0.005 && covCallCont >= PRIOR.covCallContPct - 0.005,
  `cov putCont=${r4(covPutCont)} (prior ${PRIOR.covPutContPct}) callCont=${r4(covCallCont)} (prior ${PRIOR.covCallContPct})`);
ck('R2b % tails legibly dashed (coverage <0.9, >0.25) under the new [8,6] pattern',
  covPutTail > 0.25 && covPutTail < 0.90 && covCallTail > 0.25 && covCallTail < 0.90,
  `putTail=${r4(covPutTail)} callTail=${r4(covCallTail)} (prior [5,3]: 0.5426/0.5247)`);
const xr = crossingGap(P, C, xATM);
const vCross = xr ? vAtY(xr.y, 1.05) : NaN;
ck('R3a % X crossing unchanged (prior x=462 v=0.15) ±1px',
  xr && Math.abs(xr.x - PRIOR.pctCrossX) <= 1 && Math.abs(vCross - PRIOR.pctCrossV) <= 1.05 / PLOT_H + 1e-9,
  `x=${xr && xr.x} (prior ${PRIOR.pctCrossX}) v=${r4(vCross)} (prior ${PRIOR.pctCrossV}; analytic ${r4(ATM_V)})`);
const xPutGap = seamRight(P, xATM + 6, PAD.left + PLOT_W);
const xCallGap = seamLeft(C, xATM - 6, PAD.left);
// NOTE (measured run A, analytic): the dash-onset detector is DASH-PATTERN-dependent —
// the fix lengthens the first tail dash 5 → 8·cssScale canvas-px, so the detected onset
// legitimately shifts by up to dashDelta ≈ 5.4px. It is NOT a seam-geometry proxy under a
// pattern change. Geometry-true anchors are R3a/R3c/R3d/R3e/R3f (all dash-independent).
// In the % view the 3·yMax clamp is analytically INERT (values ≤ ~1.0 < 3.15), proven
// in-page below — so the % polyline is point-identical to a6ca02f3; only the dash differs.
const dashDelta = Math.ceil(8 * live0.cssScale - 5) + 1;   // first-dash lengthening bound (+1 AA)
const skPutMeas = 1 / Math.tan(phiAtX(xPutGap) * Math.PI / 180);
ck('R3b % seam dash-onsets within dash-pattern bound of prior (put 561 / call 374), still 0.667-class NOT 0.444',
  xPutGap !== null && xCallGap !== null
    && Math.abs(xPutGap - PRIOR.pctPutSeamX) <= dashDelta && Math.abs(xCallGap - PRIOR.pctCallSeamX) <= dashDelta
    && Math.abs(skPutMeas - G / (G + 1)) < 0.05 && !(skPutMeas > 0.41 && skPutMeas < 0.48),
  `put onset x=${xPutGap} (prior ${PRIOR.pctPutSeamX}, Δ=${xPutGap - PRIOR.pctPutSeamX}, bound ±${dashDelta}, φ=${r4(phiAtX(xPutGap))}° S/K=${r4(skPutMeas)}) call onset x=${xCallGap} (prior ${PRIOR.pctCallSeamX}, Δ=${xCallGap - PRIOR.pctCallSeamX})`);
const clampInertPct = await page.evaluate(() => {
  // max % viewVal over both wings, φ∈(0,90): put v ≤ 1, call v ≤ 1 (markLensed ≤ 1)
  const s = Store.state, g = Engine.gLoc(s.pool, 1, s.m), sN = Engine.getSNorm(s.pool);
  let mx = 0;
  for (let i = 1; i < 900; i++) {
    const th = Math.tan((i / 900) * Math.PI / 2 * 0.999);
    for (const wing of ['put', 'call']) mx = Math.max(mx, Engine.markLensed(wing, th, sN, g));
  }
  return mx;
});
ck('R3b2 clamp analytically INERT in % view (max value < 3·yMax=3.15 ⇒ % polyline point-identical to prior; only dash differs)',
  clampInertPct < 3.15, `max % viewVal=${r4(clampInertPct)}`);
const seamCol = nearestMidY(P, Math.round(xAtPhi(PHI_PUT_SEAM)) - 3, 3);
const vSeam = seamCol ? vAtY(seamCol.y, 1.05) : NaN;
ck('R3c % boundary height at put seam unchanged (prior v=0.3307) ±1px',
  seamCol && Math.abs(vSeam - PRIOR.pctBoundaryV) <= 1.05 / PLOT_H + 1e-9,
  `v=${r4(vSeam)} (prior ${PRIOR.pctBoundaryV}; analytic 1/(g+1)=${r4(1 / 3)})`);
const putDeep = nearestMidY(P, Math.round(xAtPhi(88)), 8);
const callDeep = nearestMidY(C, Math.round(xAtPhi(2)), 8);
ck('R3d % deep-ITM saturation unchanged (prior 0.9682/0.9682) ±1px',
  putDeep && callDeep && Math.abs(vAtY(putDeep.y, 1.05) - PRIOR.pctPutDeep) <= 1.05 / PLOT_H + 1e-9
    && Math.abs(vAtY(callDeep.y, 1.05) - PRIOR.pctCallDeep) <= 1.05 / PLOT_H + 1e-9,
  `put=${putDeep && r4(vAtY(putDeep.y, 1.05))} call=${callDeep && r4(vAtY(callDeep.y, 1.05))}`);

// ── R1 ($ view): THE FLAG ITEM — put parity tail row coverage < 0.9 ────────
await click('#pricing-unit-usd'); await page.waitForTimeout(200);
const profUsd = await wingProfile();
const Pu = profUsd.put, Cu = profUsd.call;
const yMaxUsd = 1.25 * live0.sNorm * live0.oracle;
const xExit = Math.round(xAtPhi(Math.atan(2.25) * 180 / Math.PI)); // K=2.25S clamp exit
const tailBox = { x0: Math.round(xAtPhi(PHI_PUT_SEAM)) + 4, x1: xExit + 10,
  y0: Math.round(PAD.top + (1 - 40000 / yMaxUsd) * PLOT_H) - 8, y1: PAD.top + 8 };
const rowCovPutTailU = await page.evaluate(({ x0, x1, y0, y1 }) => {
  const c = document.getElementById('canvas-pricing');
  const im = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const W = c.width; let hit = 0;
  for (let y = y1; y <= y0; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      if (im[i + 3] > 200 && im[i] === 255 && im[i + 1] === 133 && im[i + 2] === 176) { hit++; break; }
    }
  }
  return hit / (y0 - y1 + 1);
}, tailBox);
ck('R1 THE FLAG ITEM: $ put parity tail (seam→clamp exit) per-pixel ROW coverage < 0.9 (legible dash; was 0.9647)',
  rowCovPutTailU > 0.25 && rowCovPutTailU < 0.90,
  `rowCov=${r4(rowCovPutTailU)} (broken build ${PRIOR.putTailRowCovUsd_BROKEN}; predicted ~0.7–0.8) box=${JSON.stringify(tailBox)}`);
// zoom exhibit: extract the tail region from the canvas bitmap, 6× nearest-neighbor
const zoomData = await page.evaluate(({ x0, x1, y0, y1, Z }) => {
  const c = document.getElementById('canvas-pricing');
  const w = x1 - x0 + 1, h = y0 - y1 + 1;
  const o = document.createElement('canvas'); o.width = w * Z; o.height = h * Z;
  const g = o.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(c, x0, y1, w, h, 0, 0, w * Z, h * Z);
  return o.toDataURL('image/png');
}, { ...tailBox, Z: 6 });
fs.writeFileSync(path.join(EVID, `RECHECK_${RUN}_zoom_usd_puttail.png`), Buffer.from(zoomData.split(',')[1], 'base64'));
// full $ chart exhibit
const clip = await page.evaluate(() => { const r = document.getElementById('canvas-pricing').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
await page.screenshot({ path: path.join(EVID, `RECHECK_${RUN}_chart2_usd_m2.png`), clip });

// ── R2c ($ view): continuations solid, call tail dashed ────────────────────
const covPutContU = coverage(Pu, xAtPhi(8), xAtPhi(50));
const covCallContU = coverage(Cu, xAtPhi(40), xAtPhi(86));
const covCallTailU = coverage(Cu, xAtPhi(4), xAtPhi(28));
ck('R2c $ continuations still solid (prior 0.9897/0.9977) + call tail dashed <0.9',
  covPutContU >= PRIOR.covPutContUsd - 0.005 && covCallContU >= PRIOR.covCallContUsd - 0.005
    && covCallTailU > 0.25 && covCallTailU < 0.90,
  `putCont=${r4(covPutContU)} callCont=${r4(covCallContU)} callTail=${r4(covCallTailU)} (prior tail 0.5112)`);

// ── R3e/R3f ($ view): crossing + clamp exit unchanged ──────────────────────
const xrU = crossingGap(Pu, Cu, xATM);
const vCrossU = xrU ? vAtY(xrU.y, yMaxUsd) : NaN;
ck('R3e $ X crossing height unchanged (prior $12013) ±1px ($325)',
  xrU && Math.abs(vCrossU - PRIOR.usdCrossUsd) <= yMaxUsd / PLOT_H + 1e-9,
  `$${Math.round(vCrossU)} @x=${xrU && xrU.x} (prior $${PRIOR.usdCrossUsd}; analytic $${Math.round(ATM_V * live0.oracle)})`);
let putTop = null;
for (let x = xExit - 25; x <= xExit + 25; x++) { const c = Pu[x]; if (c && c.yMin <= PAD.top + 4) { putTop = { x, yMin: c.yMin }; break; } }
const putBeyond = colsIn(Pu, xExit + 40, PAD.left + PLOT_W - 2).length;
ck('R3f $ put tail clamp-exit unchanged (prior top-edge x=658) ±1px, nothing beyond',
  putTop !== null && Math.abs(putTop.x - PRIOR.usdExitX) <= 1 && putBeyond === 0,
  `top-edge ${JSON.stringify(putTop)} (prior x=${PRIOR.usdExitX}; analytic ${xExit}) beyond=${putBeyond}`);

// ── R4 redraw byte-stability + R5 one m-change ──────────────────────────────
await click('#pricing-unit-pct'); await page.waitForTimeout(200);
const hashPct2 = await canvasHash('canvas-pricing');
ck('R4a %→$→% round-trip redraw byte-identical', hashPct1 === hashPct2, `${hashPct1} vs ${hashPct2}`);
// second full redraw of the $ view (toggle again) must be byte-identical too
const hashUsd1 = await (async () => { await click('#pricing-unit-usd'); await page.waitForTimeout(200); return canvasHash('canvas-pricing'); })();
await click('#pricing-unit-pct'); await page.waitForTimeout(150);
const hashUsd2 = await (async () => { await click('#pricing-unit-usd'); await page.waitForTimeout(200); return canvasHash('canvas-pricing'); })();
ck('R4b two $ redraws byte-identical', hashUsd1 === hashUsd2, `${hashUsd1} vs ${hashUsd2}`);
await click('#pricing-unit-pct'); await page.waitForTimeout(150);
// one m-change (R5 scope: load + toggle + m-change, zero errors)
await setField('m-input', 6); await page.waitForTimeout(200);
const g6 = await page.evaluate(() => Engine.gLoc(Store.state.pool, 1, Store.state.m));
const hashM6 = await canvasHash('canvas-pricing');
ck('R5a m-change works (M=6 ⇒ g=6, chart redraws distinct)', Math.abs(g6 - 6) < 1e-12 && hashM6 !== hashPct1, `g=${g6} hash ${hashM6} vs m2 ${hashPct1}`);
await setField('m-input', 2); await page.waitForTimeout(150);
ck('R5b zero console errors / pageerrors / stray dialogs (load + toggles + m-change)',
  errors.length === 0 && dialogs.length === 0, `errors=${errors.length} ${JSON.stringify(errors.slice(0, 4))} dialogs=${dialogs.length}`);

await browser.close();
const md5post = md5f(BUILD);
ck('R4c build md5 unchanged pre/post (read-only)', md5pre === md5post, `${md5pre} → ${md5post}`);

const fails = CHECKS.filter(c => !c.p);
log(`\n=== -B301-DASH RECHECK ${RUN} VERDICT: ${fails.length === 0 ? 'PASS' : 'FLAG'} (${CHECKS.length - fails.length}/${CHECKS.length}) ===`);
for (const f of fails) log(`  FAIL: ${f.n}  ${f.d}`);
fs.writeFileSync(path.join(EVID, `RECHECK_RESULT_run${RUN}.json`), JSON.stringify({ build: path.basename(BUILD), md5: md5pre, checks: CHECKS, errors, dialogs }, null, 2));
fs.writeFileSync(path.join(EVID, `RECHECK_RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
process.exit(fails.length === 0 ? 0 : 1);

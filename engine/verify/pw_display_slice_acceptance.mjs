// DISPLAY SLICE + -B289 CAPTION FIX — LIVE ACCEPTANCE (operator go entries 298+301)
// Build under test: builds/HEAD_temporal_mvp_v28_lens.html (working tree, md5 a6ca02f3…)
// Verifies (chart-2 "MARK ACROSS STRIKES", %/$ views):
//   1. The X: both wings drawn OTM AND ITM, crossing at ATM, both views; continuation SOLID,
//      intrinsic/parity tails DASHED (same wing color).
//   2. %→$ toggle flips units/rescales; % wings saturate toward 1 (yMax 1.05); $ ITM put tail
//      exits the frame cleanly at the 1.25×S clamp; X crosses at ATM in $ too.
//   3. Seams at v2 positions: M=2 (g=2) put seam at S/K=g/(g+1)=0.667-class (NOT 0.444);
//      boundary height 1/(g+1).
//   4. Markers ON the plotted curves in BOTH views (band open, toggle while open).
//   5. m-knob 3 channels: M=1/3/6 — wings steepen, seams march inward, ATM crossing falls;
//      3 distinct hashes.
//   6. -B289 caption: "MORE volatile asset ⇒ LOWER m"; geometry sentence intact.
//   7. No regressions: trade open/execute, arb, OTM close + ITM close, chart-1, 0 errors;
//      run ×2 byte-stable; build md5 unchanged.
// READ-ONLY on the engine. Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
//   node verify/pw_display_slice_acceptance.mjs A   (then B)
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

const md5pre = md5f(BUILD);
log(`=== DISPLAY-SLICE ACCEPTANCE run ${RUN}  build md5 ${md5pre} ===`);

// chart-2 geometry (renderPricingFrame): canvas 900x380, pad{18,18,54,50}
const PAD = { top: 18, right: 18, bottom: 54, left: 50 };
const PLOT_W = 900 - PAD.left - PAD.right;   // 832
const PLOT_H = 380 - PAD.top - PAD.bottom;   // 308
const xAtPhi = (phi) => PAD.left + (phi / 90) * PLOT_W;
const phiAtX = (x) => (x - PAD.left) / PLOT_W * 90;
const vAtY = (y, yMax) => (1 - (y - PAD.top) / PLOT_H) * yMax;

const errors = [], dialogs = [], downloads = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text()); });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });
page.on('download', async d => { downloads.push(d.suggestedFilename()); await d.cancel().catch(() => {}); });

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
const shot = async (name) => {
  const clip = await page.evaluate(() => { const r = document.getElementById('canvas-pricing').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  await page.screenshot({ path: path.join(EVID, `${RUN}_${name}.png`), clip });
};

// Per-column exact-RGB profile of put/call/marker pixels inside the plot box.
const wingProfile = async () => page.evaluate(({ pad, plotW, plotH }) => {
  const c = document.getElementById('canvas-pricing');
  const im = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const W = c.width;
  const match = (i, v) => im[i + 3] > 200 && im[i] === v[0] && im[i + 1] === v[1] && im[i + 2] === v[2];
  const COLORS = { put: [255, 133, 176], call: [10, 186, 181], red: [255, 103, 103], green: [20, 232, 0] };
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
// Dash-onset (seam) detectors: a SOLID stroke has near-full column coverage
// (isolated 1-2px anti-alias misses tolerated); a DASHED [5,3] tail is
// periodically gapped (~0.55 coverage). Seam = first x where the 15-column
// window ahead drops below 0.85 coverage.
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
const dotCentroid = (prof) => {
  const xs = Object.keys(prof).map(Number); if (!xs.length) return null;
  let sx = 0, sy = 0, n = 0;
  for (const x of xs) { const c = prof[x]; const m = (c.yMin + c.yMax) / 2; sx += x * c.n; sy += m * c.n; n += c.n; }
  return { x: sx / n, y: sy / n, n };
};

// ── SETUP: clear boot preview ghost, chart-2, M=2 ─────────────────────────
await setField('band-notional', ''); await setField('sold-inner', ''); await setField('bought-inner', '');
await setField('chart-select', 'pricing'); await page.waitForTimeout(200);
await setField('m-input', 2); await page.waitForTimeout(200);
const live0 = await page.evaluate(() => {
  const s = Store.state, w = Engine.getW(s.pool);
  return {
    m: s.m, w, gamma: w / (1 - w), g: Engine.gLoc(s.pool, 1, s.m), sNorm: Engine.getSNorm(s.pool),
    oracle: s.oracle, unit: window.__pricingUnit, previewBand: !!window.__previewBand,
    mkPutSeam: Engine.markLensed('put', 1.5, Engine.getSNorm(s.pool), Engine.gLoc(s.pool, 1, s.m)),
    mkAtm: Engine.markLensed('put', Engine.getSNorm(s.pool), Engine.getSNorm(s.pool), Engine.gLoc(s.pool, 1, s.m)),
  };
});
ck('SETUP default pool M=2 ⇒ g=2, sNorm=1, unit=pct, no preview ghost',
  Math.abs(live0.g - 2) < 1e-12 && Math.abs(live0.sNorm - 1) < 1e-12 && live0.unit === 'pct' && !live0.previewBand,
  JSON.stringify({ ...live0, mkPutSeam: r4(live0.mkPutSeam), mkAtm: r4(live0.mkAtm) }));

const xATM = xAtPhi(Math.atan(live0.sNorm) * 180 / Math.PI);   // 466 at sNorm=1
const G = 2, ATM_V = Math.pow(G / (G + 1), G) / (G + 1);       // 0.14815
const PHI_PUT_SEAM = Math.atan(live0.sNorm * (G + 1) / G) * 180 / Math.PI;   // 56.31°
const PHI_CALL_SEAM = Math.atan(live0.sNorm * G / (G + 1)) * 180 / Math.PI;  // 33.69°

// ── CHECK 1+3 (% view, M=2): X, solid/dashed, seams ───────────────────────
const profPct = await wingProfile();
await shot('chart2_pct_m2');
const P = profPct.put, C = profPct.call;
ck('1a % X: put wing spans OTM (left of ATM) AND ITM (right of ATM)',
  colsIn(P, PAD.left + 5, xATM - 20).length > 50 && colsIn(P, xATM + 20, PAD.left + PLOT_W - 5).length > 50,
  `putCols left=${colsIn(P, PAD.left + 5, xATM - 20).length} right=${colsIn(P, xATM + 20, PAD.left + PLOT_W - 5).length}`);
ck('1b % X: call wing spans ITM (left) AND OTM (right)',
  colsIn(C, PAD.left + 5, xATM - 20).length > 50 && colsIn(C, xATM + 20, PAD.left + PLOT_W - 5).length > 50,
  `callCols left=${colsIn(C, PAD.left + 5, xATM - 20).length} right=${colsIn(C, xATM + 20, PAD.left + PLOT_W - 5).length}`);
const xr = crossingGap(P, C, xATM);
const vCross = xr ? vAtY(xr.y, 1.05) : NaN;
ck('1c % X crosses at ATM at height (g/(g+1))^g/(g+1)',
  xr && xr.gap <= 4 && Math.abs(vCross - ATM_V) < 0.02,
  `minGap=${xr && xr.gap}px @x=${xr && xr.x} height v=${r4(vCross)} expect ${r4(ATM_V)}`);
const covPutCont = coverage(P, xAtPhi(8), xAtPhi(50));
const covPutTail = coverage(P, xAtPhi(62), xAtPhi(86));
const covCallCont = coverage(C, xAtPhi(40), xAtPhi(86));
const covCallTail = coverage(C, xAtPhi(4), xAtPhi(28));
ck('1d % continuation SOLID (full column coverage), tails DASHED (gapped), same wing colors',
  covPutCont >= 0.97 && covCallCont >= 0.97 && covPutTail > 0.30 && covPutTail < 0.95 && covCallTail > 0.30 && covCallTail < 0.95,
  `cov putCont=${r4(covPutCont)} callCont=${r4(covCallCont)} putTail=${r4(covPutTail)} callTail=${r4(covCallTail)}`);
// saturation toward 1 deep ITM (% view)
const putDeep = nearestMidY(P, Math.round(xAtPhi(88)), 8);
const callDeep = nearestMidY(C, Math.round(xAtPhi(2)), 8);
ck('2c % wings saturate toward 1 deep ITM',
  putDeep && callDeep && vAtY(putDeep.y, 1.05) > 0.90 && vAtY(callDeep.y, 1.05) > 0.90,
  `put v@φ≈88°=${putDeep && r4(vAtY(putDeep.y, 1.05))} call v@φ≈2°=${callDeep && r4(vAtY(callDeep.y, 1.05))}`);
// seam measurement (put): first dash gap right of ATM
const xPutGap = seamRight(P, xATM + 6, PAD.left + PLOT_W);
const phiPutMeas = xPutGap !== null ? phiAtX(xPutGap) : NaN;
const skPutMeas = 1 / Math.tan(phiPutMeas * Math.PI / 180);   // S/K at measured seam
ck('3a put seam pixel at S/K=g/(g+1)=0.667-class, NOT 0.444',
  xPutGap !== null && Math.abs(skPutMeas - G / (G + 1)) < 0.05 && !(skPutMeas > 0.41 && skPutMeas < 0.48),
  `dash onset x=${xPutGap} φ=${r4(phiPutMeas)}° S/K=${r4(skPutMeas)} expect ${r4(G / (G + 1))} (0.444-class would be φ≈66°)`);
const xCallGap = seamLeft(C, xATM - 6, PAD.left);
const thCallMeas = xCallGap !== null ? Math.tan(phiAtX(xCallGap) * Math.PI / 180) : NaN;
ck('3b call seam pixel at θ=g/(g+1)=0.667-class',
  xCallGap !== null && Math.abs(thCallMeas - G / (G + 1)) < 0.05,
  `dash onset x=${xCallGap} φ=${r4(phiAtX(xCallGap))}° θ=${r4(thCallMeas)} expect ${r4(G / (G + 1))}`);
const seamCol = nearestMidY(P, Math.round(xAtPhi(PHI_PUT_SEAM)) - 3, 3);
const vSeam = seamCol ? vAtY(seamCol.y, 1.05) : NaN;
ck('3c boundary height 1/(g+1) at the put seam',
  seamCol && Math.abs(vSeam - 1 / (G + 1)) < 0.02 && Math.abs(live0.mkPutSeam - 1 / 3) < 1e-12,
  `pixel v=${r4(vSeam)} expect ${r4(1 / (G + 1))}; engine markLensed(put,1.5,1,2)=${r4(live0.mkPutSeam)}`);

// ── CHECK 2 ($ view, M=2): toggle, rescale, clamp exit, X in $ ────────────
const hashPct = await canvasHash('canvas-pricing');
await click('#pricing-unit-usd'); await page.waitForTimeout(200);
const hashUsd = await canvasHash('canvas-pricing');
const tog = await page.evaluate(() => ({
  unit: window.__pricingUnit,
  pctActive: document.getElementById('pricing-unit-pct').classList.contains('active'),
  usdActive: document.getElementById('pricing-unit-usd').classList.contains('active'),
}));
ck('2a %→$ toggle: unit flips, active class flips, chart rescales (hash differs)',
  tog.unit === 'usd' && tog.usdActive && !tog.pctActive && hashPct !== hashUsd,
  `unit=${tog.unit} active(pct,usd)=(${tog.pctActive},${tog.usdActive}) hash ${hashPct}→${hashUsd}`);
const profUsd = await wingProfile();
await shot('chart2_usd_m2');
const Pu = profUsd.put, Cu = profUsd.call;
const yMaxUsd = 1.25 * live0.sNorm * live0.oracle;
const xrU = crossingGap(Pu, Cu, xATM);
const vCrossU = xrU ? vAtY(xrU.y, yMaxUsd) : NaN;
ck('2b $ X crosses at ATM too, at ≈ ATM_V×S dollars',
  xrU && xrU.gap <= 4 && Math.abs(vCrossU - ATM_V * live0.oracle) < 0.02 * yMaxUsd,
  `minGap=${xrU && xrU.gap}px height $${Math.round(vCrossU)} expect $${Math.round(ATM_V * live0.oracle)}`);
// put tail exits the frame cleanly at K=2.25×S (φ≈66°): reaches top edge, then NO put pixels
const xExit = Math.round(xAtPhi(Math.atan(2.25) * 180 / Math.PI));
let putTop = null;
for (let x = xExit - 25; x <= xExit + 25; x++) { const c = Pu[x]; if (c && c.yMin <= PAD.top + 4) { putTop = { x, yMin: c.yMin }; break; } }
const putBeyond = colsIn(Pu, xExit + 40, PAD.left + PLOT_W - 2).length;
ck('2d $ ITM put tail exits cleanly at the 1.25×S clamp (top edge ≈ φ66°, nothing beyond, no blowup)',
  putTop !== null && putBeyond === 0,
  `top-edge hit ${JSON.stringify(putTop)} (expect x≈${xExit}); put cols beyond exit+40=${putBeyond}`);
const covCallTailU = coverage(Cu, xAtPhi(4), xAtPhi(28));
const covPutContU = coverage(Pu, xAtPhi(8), xAtPhi(50));
const covCallContU = coverage(Cu, xAtPhi(40), xAtPhi(86));
// $ put tail is STEEP (rises $40k->$100k over ~10 deg) — dash gaps can only show
// as ROW gaps. TRUE per-pixel row coverage (exact put RGB in the tail x-range):
// a legible [5,3] dash reads < ~0.9; a solid-looking line reads ~0.95+.
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
}, { x0: Math.round(xAtPhi(PHI_PUT_SEAM)) + 4, x1: xExit + 10,
     y0: Math.round(PAD.top + (1 - 40000 / yMaxUsd) * PLOT_H) - 8, y1: PAD.top + 8 });
ck('2e $ view: continuation solid + BOTH tails legibly dashed (X drawn through ITM in $)',
  covPutContU >= 0.97 && covCallContU >= 0.97 && rowCovPutTailU > 0.25 && rowCovPutTailU < 0.90 && covCallTailU > 0.25 && covCallTailU < 0.95,
  `cov putCont=${r4(covPutContU)} callCont=${r4(covCallContU)} putTailRowCov=${r4(rowCovPutTailU)} (legible dash <0.9; solid ~0.95+) callTail=${r4(covCallTailU)}`);
// back to %
await click('#pricing-unit-pct'); await page.waitForTimeout(200);
const backPct = await page.evaluate(() => window.__pricingUnit);
const hashBack = await canvasHash('canvas-pricing');
ck('2f $→% toggles back byte-identical', backPct === 'pct' && hashBack === hashPct, `unit=${backPct} hash ${hashBack} vs ${hashPct}`);

// ── CHECK 5: m-knob 3 channels (M=1/3/6, % view, no band) ─────────────────
const mMeas = {};
for (const m of [1, 3, 6]) {
  await setField('m-input', m); await page.waitForTimeout(200);
  const prof = await wingProfile();
  const g = await page.evaluate(() => Engine.gLoc(Store.state.pool, 1, Store.state.m));
  const hash = await canvasHash('canvas-pricing');
  const cross = crossingGap(prof.put, prof.call, xATM);
  const gap = seamRight(prof.put, xATM + 6, PAD.left + PLOT_W);
  const otmPut = nearestMidY(prof.put, Math.round(xAtPhi(20)), 3);
  const otmCall = nearestMidY(prof.call, Math.round(xAtPhi(75)), 3);
  mMeas[m] = {
    g, hash,
    crossV: cross ? r4(vAtY(cross.y, 1.05)) : null,
    seamPhi: gap !== null ? r4(phiAtX(gap)) : null,
    putV20: otmPut ? r4(vAtY(otmPut.y, 1.05)) : null,
    callV75: otmCall ? r4(vAtY(otmCall.y, 1.05)) : null,
  };
  if (m === 1 || m === 6) await shot(`chart2_pct_m${m}`);
}
const m1 = mMeas[1], m3 = mMeas[3], m6 = mMeas[6];
ck('5a 3 distinct chart hashes (M=1/3/6)', m1.hash !== m3.hash && m3.hash !== m6.hash && m1.hash !== m6.hash,
  `m1=${m1.hash} m3=${m3.hash} m6=${m6.hash}`);
ck('5b wings visibly steepen with m (OTM value falls both wings)',
  m1.putV20 > m3.putV20 && m3.putV20 >= m6.putV20 && m1.callV75 > m3.callV75 && m3.callV75 >= m6.callV75,
  `putV@20° ${m1.putV20}→${m3.putV20}→${m6.putV20}; callV@75° ${m1.callV75}→${m3.callV75}→${m6.callV75}`);
const expSeam = (g) => r4(Math.atan((g + 1) / g) * 180 / Math.PI);
ck('5c seams march inward toward ATM (put dash onset φ: 63.4°→53.1°→49.4°-class)',
  m1.seamPhi > m3.seamPhi && m3.seamPhi > m6.seamPhi && Math.abs(m1.seamPhi - expSeam(1)) < 2 && Math.abs(m3.seamPhi - expSeam(3)) < 2 && Math.abs(m6.seamPhi - expSeam(6)) < 2,
  `measured ${m1.seamPhi}/${m3.seamPhi}/${m6.seamPhi} expect ${expSeam(1)}/${expSeam(3)}/${expSeam(6)}`);
const expCross = (g) => r4(Math.pow(g / (g + 1), g) / (g + 1));
ck('5d ATM crossing height falls with m (0.25→0.1055→0.0567)',
  m1.crossV > m3.crossV && m3.crossV > m6.crossV && Math.abs(m1.crossV - expCross(1)) < 0.02 && Math.abs(m3.crossV - expCross(3)) < 0.02 && Math.abs(m6.crossV - expCross(6)) < 0.02,
  `measured ${m1.crossV}/${m3.crossV}/${m6.crossV} expect ${expCross(1)}/${expCross(3)}/${expCross(6)}`);
await setField('m-input', 2); await page.waitForTimeout(150);

// ── CHECK 6: -B289 caption ────────────────────────────────────────────────
const cap = await page.evaluate(() => {
  const lbl = document.getElementById('m-input').closest('.field-input-wrap').querySelector('.sim-aid-label').textContent;
  const legend = Array.from(document.querySelectorAll('[data-chart="pricing"] .legend-item')).map(e => e.textContent.trim());
  const caption = document.querySelector('[data-chart="pricing"] .caption').textContent;
  return { lbl, legend, caption };
});
ck('6a -B289 vol direction: "MORE volatile asset ⇒ LOWER m" present, old "(more vol)" gone',
  cap.lbl.includes('MORE volatile asset ⇒ LOWER m') && cap.lbl.includes('fatter wings, richer tails') && !cap.lbl.includes('(more vol)'),
  JSON.stringify(cap.lbl));
ck('6b geometry sentence intact (steepness m·γ at EVERY strike; m=1 plain; larger m steeper everywhere)',
  cap.lbl.includes('steepness m·γ at EVERY strike') && cap.lbl.includes('m=1 = plain curve') && cap.lbl.includes('larger m ⇒ steeper everywhere'),
  JSON.stringify(cap.lbl));
ck('6c legend: quoted(pool) vs parity(escrow) per wing; "peak = 1 (mode)" retired',
  cap.legend.some(t => t.includes('put — quoted (pool)')) && cap.legend.some(t => t.includes('put — parity (escrow)')) &&
  cap.legend.some(t => t.includes('call — quoted (pool)')) && cap.legend.some(t => t.includes('call — parity (escrow)')) &&
  !cap.legend.some(t => t.includes('peak = 1')),
  cap.legend.join(' | '));

// ── CHECK 4: markers ON curve, both views (band open, toggle while open) ──
await click('.tab[data-subtab="bands"]'); await page.waitForTimeout(100);
await page.evaluate(() => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== 'long') p.click(); });
await setField('sold-inner', 120000); await setField('bought-inner', 48000); await setField('band-notional', 0.03);
await page.waitForTimeout(100);
await click('#btn-execute'); await page.waitForTimeout(250);
await click('#btn-arb'); await page.waitForTimeout(200);   // restore w=0.5 for clean analytics
const bandSt = await page.evaluate(() => {
  const s = Store.state, b = s.bands.filter(x => x.status === 'open')[0];
  const g = Engine.gLoc(s.pool, 1, s.m), sN = Engine.getSNorm(s.pool);
  return b ? {
    open: true, g, sN, oracle: s.oracle,
    sold_wing: b.sold_wing, bought_wing: b.bought_wing,
    thSold: b.sold.inner, thBought: b.bought.inner,
    mkSold: Engine.markLensed(b.sold_wing, b.sold.inner, sN, g),
    mkBought: Engine.markLensed(b.bought_wing, b.bought.inner, sN, g),
  } : { open: false };
});
ck('4a band open (sold-call $120k / bought-put $48k), wings tagged, arb w→0.5',
  bandSt.open && bandSt.sold_wing === 'call' && bandSt.bought_wing === 'put' && Math.abs(bandSt.g - 2) < 1e-9 && Math.abs(bandSt.sN - 1) < 1e-9,
  JSON.stringify({ ...bandSt, mkSold: r4(bandSt.mkSold), mkBought: r4(bandSt.mkBought) }));
const markerCheck = async (unit) => {
  const prof = await wingProfile();
  const yMax = unit === 'usd' ? 1.25 * bandSt.sN * bandSt.oracle : 1.05;
  const vv = (wing, th, v) => unit === 'usd' ? v * (wing === 'put' ? th : bandSt.sN) * bandSt.oracle : v;
  const expRed = { x: xAtPhi(Math.atan(bandSt.thSold) * 180 / Math.PI), y: PAD.top + (1 - vv('call', bandSt.thSold, bandSt.mkSold) / yMax) * PLOT_H };
  const expGrn = { x: xAtPhi(Math.atan(bandSt.thBought) * 180 / Math.PI), y: PAD.top + (1 - vv('put', bandSt.thBought, bandSt.mkBought) / yMax) * PLOT_H };
  const red = dotCentroid(prof.red), grn = dotCentroid(prof.green);
  const dR = red ? Math.hypot(red.x - expRed.x, red.y - expRed.y) : Infinity;
  const dG = grn ? Math.hypot(grn.x - expGrn.x, grn.y - expGrn.y) : Infinity;
  // dot must also sit ON the drawn wing: compare to nearest curve pixel column just outside the dot
  const curveR = nearestMidY(prof.call, Math.round(expRed.x) + 6, 4);
  const curveG = nearestMidY(prof.put, Math.round(expGrn.x) + 6, 4);
  const onR = red && curveR ? Math.abs(red.y - curveR.y) : Infinity;
  const onG = grn && curveG ? Math.abs(grn.y - curveG.y) : Infinity;
  return { unit, red, grn, dR: r4(dR), dG: r4(dG), onR: r4(onR), onG: r4(onG), expRed: { x: r4(expRed.x), y: r4(expRed.y) }, expGrn: { x: r4(expGrn.x), y: r4(expGrn.y) } };
};
const mkPct = await markerCheck('pct');
await shot('chart2_band_pct');
ck('4b % view: sold red + bought green dots ON the plotted curves',
  mkPct.red && mkPct.grn && mkPct.red.n > 10 && mkPct.grn.n > 10 && mkPct.dR <= 4.5 && mkPct.dG <= 4.5 && mkPct.onR <= 6 && mkPct.onG <= 6,
  JSON.stringify(mkPct));
await click('#pricing-unit-usd'); await page.waitForTimeout(200);
const mkUsd = await markerCheck('usd');
await shot('chart2_band_usd');
ck('4c $ view (toggled while band open): dots ON the curves in $ too',
  mkUsd.red && mkUsd.grn && mkUsd.red.n > 10 && mkUsd.grn.n > 10 && mkUsd.dR <= 4.5 && mkUsd.dG <= 4.5 && mkUsd.onR <= 6 && mkUsd.onG <= 6,
  JSON.stringify(mkUsd));
await click('#pricing-unit-pct'); await page.waitForTimeout(150);

// ── CHECK 7: regression smoke ─────────────────────────────────────────────
// 7a close the open band OTM (both legs reversed on AMM)
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="portfolio"]'); if (n) n.click(); });
await page.evaluate(() => { const t = document.querySelector('.tab[data-subtab-pf="bands"]'); if (t) t.click(); });
await page.waitForTimeout(150);
await page.evaluate(() => { const b = document.querySelector('button[data-close-band]'); if (b) b.click(); });
await page.waitForTimeout(250);
const otmClose = await page.evaluate(() => {
  const s = Store.state, closed = s.bands.filter(x => x.status !== 'open'), last = closed[closed.length - 1];
  return { open: s.bands.filter(x => x.status === 'open').length, settled: last && last.close ? last.close.settled_cash_leg : undefined, raw_net: last && last.close ? last.close.raw_net : undefined };
});
ck('7a OTM close: both legs reversed (settled_cash_leg=null), finite',
  otmClose.open === 0 && otmClose.settled === null && isFinite(otmClose.raw_net),
  JSON.stringify(otmClose));
// 7b SHORT band → deep ITM (oracle 12000, sold-put θ=5) → arb → close settled-to-cash
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="transact"]'); if (n) n.click(); });
await click('.tab[data-subtab="bands"]'); await page.waitForTimeout(100);
await page.evaluate(() => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== 'short') p.click(); });
await page.waitForTimeout(100);
await setField('sold-inner', 60000); await setField('bought-inner', 100000); await setField('band-notional', 0.02);
await page.waitForTimeout(100);
await click('#btn-execute'); await page.waitForTimeout(250);
const shortOpen = await page.evaluate(() => Store.state.bands.filter(x => x.status === 'open').length);
await setField('kpi-oracle', 12000); await page.waitForTimeout(150);
await click('#btn-arb'); await page.waitForTimeout(150);
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="portfolio"]'); if (n) n.click(); });
await page.evaluate(() => { const t = document.querySelector('.tab[data-subtab-pf="bands"]'); if (t) t.click(); });
await page.waitForTimeout(150);
await page.evaluate(() => { const b = document.querySelector('button[data-close-band]'); if (b) b.click(); });
await page.waitForTimeout(250);
const itmClose = await page.evaluate(() => {
  const s = Store.state, closed = s.bands.filter(x => x.status !== 'open'), last = closed[closed.length - 1];
  const c = last && last.close;
  return { open: s.bands.filter(x => x.status === 'open').length, settled: c ? c.settled_cash_leg : undefined, live_leg: c ? c.live_leg : undefined, raw_net: c ? c.raw_net : undefined, payout: c ? c.trader_payout : undefined, poolFinite: isFinite(s.pool.x) && isFinite(s.pool.y) };
});
ck('7b ITM close (oracle 12000, sold-put θ=5): settled-to-cash, finite',
  shortOpen === 1 && itmClose.open === 0 && itmClose.settled === 'sold' && itmClose.live_leg === 'bought' && isFinite(itmClose.raw_net) && itmClose.poolFinite,
  JSON.stringify(itmClose));
// 7c chart-1 + all chart states render
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="transact"]'); if (n) n.click(); });
const chartStates = await page.evaluate(() => Array.from(document.getElementById('chart-select').options).map(o => o.value));
const chartRender = {};
for (const cs of chartStates) {
  await setField('chart-select', cs); await page.waitForTimeout(200);
  const nb = await page.evaluate(() => {
    let tot = 0;
    for (const c of document.querySelectorAll('canvas')) {
      if (!c.offsetParent) continue;
      const im = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let i = 0; i < im.length; i += 4) if (im[i + 3] > 0 && (im[i] || im[i + 1] || im[i + 2])) n++;
      tot += n;
    }
    return tot;
  });
  chartRender[cs] = nb;
}
ck('7c every chart state renders non-blank (chart-1 included)', Object.values(chartRender).every(v => v > 2000), JSON.stringify(chartRender));
ck('7d zero console errors / pageerrors / stray dialogs', errors.length === 0, `errors=${errors.length} ${JSON.stringify(errors.slice(0, 4))} dialogs=${dialogs.length}`);

await browser.close();
const md5post = md5f(BUILD);
ck('7e build md5 unchanged pre/post (read-only)', md5pre === md5post, `${md5pre} → ${md5post}`);

const fails = CHECKS.filter(c => !c.p);
log(`\n=== DISPLAY-SLICE ACCEPTANCE ${RUN} VERDICT: ${fails.length === 0 ? 'PASS' : 'FLAG'} (${CHECKS.length - fails.length}/${CHECKS.length}) ===`);
for (const f of fails) log(`  FAIL: ${f.n}  ${f.d}`);
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify({ build: path.basename(BUILD), md5: md5pre, checks: CHECKS, mMeas, errors, dialogs }, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
process.exit(fails.length === 0 ? 0 : 1);

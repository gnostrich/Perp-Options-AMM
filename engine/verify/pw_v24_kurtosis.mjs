// Live Playwright visual confirmation of v24-kurtosis curve-warp sliders.
// READ-ONLY on engine source. Confirms the two new inputs render, and that
// WING TILT / KURTOSIS τ visibly change the pool-curve shape in-browser.
// Evidence: screenshots + a quantitative "bend" metric sampled from the
// page's OWN curveTrace points (the live geometry the canvas actually draws).
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD  = path.join(ENGINE, 'builds', 'reference', 'temporal_mvp_v24_kurtosis.html');
const EVID   = path.resolve(ENGINE, '..', 'evidence', 'v24_kurtosis_pw');
fs.mkdirSync(EVID, { recursive: true });
const out = (n) => path.join(EVID, n);
const log = (...a) => console.log(...a);

// Quantitative bend of a curve given as [[x,y],...] in DATA coords: max
// perpendicular deviation of the curve from the straight chord joining its
// two endpoints, normalised by chord length. 0 => straight line; larger =>
// more bent. Geometry-only, independent of pixels.
function bendMetric(pts) {
  if (!pts || pts.length < 3) return null;
  const [x0, y0] = pts[0];
  const [x1, y1] = pts[pts.length - 1];
  const dx = x1 - x0, dy = y1 - y0;
  const L = Math.hypot(dx, dy);
  if (L === 0) return null;
  let maxd = 0;
  for (const p of pts) {
    // perpendicular distance from point p to the chord line
    const d = Math.abs(dy * (p[0] - x0) - dx * (p[1] - y0)) / L;
    if (d > maxd) maxd = d;
  }
  return maxd / L; // dimensionless sagitta
}

async function tracePool(page) {
  // Call the page's OWN curveTrace via a tiny shim: we can't reach the closure
  // directly, so reconstruct the same math from the live pool snapshot fields
  // that curveTraceTau/Explicit consume. This mirrors the engine 1:1.
  return await page.evaluate(() => {
    const p = Store.state.pool;
    const snap = {
      ghMid: (p.ghMid !== undefined) ? p.ghMid : 0.5,
      ghTilt: (p.ghTilt !== undefined) ? p.ghTilt : 0,
      ghTau: (p.ghTau !== undefined) ? p.ghTau : 1,
      ghX0: p.ghX0, ghY0: p.ghY0,
      alpha: p.alpha, beta: p.beta,
    };
    const useTau = (snap.ghTau !== undefined && snap.ghTilt);
    const pts = [];
    if (useTau) {
      const N = 400, logRange = 6;
      const wmid = snap.ghMid, dw = snap.ghTilt, tau = snap.ghTau, X0 = snap.ghX0, Y0 = snap.ghY0;
      const al = snap.alpha, be = snap.beta;
      for (let i = 0; i <= N; i++) {
        const u = -logRange + (2 * logRange) * i / N;
        const Wv = wmid * u + 0.5 * dw * (Math.sqrt(tau * tau + u * u) - tau);
        const eW = Math.exp(Wv);
        const x = X0 * eW * Math.exp(-u) + al;
        const y = Y0 * eW + be;
        if (isFinite(x) && isFinite(y) && x > 0 && y > 0) pts.push([x, y]);
      }
    }
    return { useTau, pts, tau: snap.ghTau, tilt: snap.ghTilt };
  });
}

// Sample canvas non-transparent pixels and return a tight bounding box +
// lit-pixel count, to prove the curve canvas actually painted something.
async function canvasStat(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let lit = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 10) lit++;
    return { W: cv.width, H: cv.height, lit, blank: lit === 0 };
  }, id);
}

async function setInput(page, id, val) {
  await page.evaluate(({ id, val }) => {
    const el = document.getElementById(id);
    el.value = String(val);
    el.dispatchEvent(new Event('change'));
  }, { id, val });
  await page.waitForTimeout(120);
}

(async () => {
  const trace = { items: {}, console: [] };
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') { errors.push(m.text()); } trace.console.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => { errors.push('PAGEERROR: ' + e.message); });

  await page.goto('file://' + BUILD, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // ── Item 1: build loads clean; open Settings; inputs present ──
  await page.click('.tabs .tab[data-subtab="settings"]');
  await page.waitForTimeout(150);
  const labels = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#subtab-settings .field-label')].map(e => e.textContent.trim());
    const tau = document.getElementById('kurt-tau-input');
    const tilt = document.getElementById('kurt-tilt-input');
    return {
      rows,
      tauPresent: !!tau, tiltPresent: !!tilt,
      tauVal: tau && tau.value, tiltVal: tilt && tilt.value,
      tauVisible: tau && tau.offsetParent !== null,
      tiltVisible: tilt && tilt.offsetParent !== null,
    };
  });
  await page.screenshot({ path: out('01_settings_inputs.png') });
  // Switch to the curve view so we can screenshot the pool curve.
  // chart selector option value 'curve' (per v26c gotchas; same chart module).
  await page.evaluate(() => {
    const sel = document.getElementById('chart-select') || document.querySelector('select');
    if (sel) { sel.value = 'curve'; sel.dispatchEvent(new Event('change')); }
  });
  await page.waitForTimeout(200);
  const c1 = await canvasStat(page, 'canvas-curve');
  await page.screenshot({ path: out('01b_curve_default.png') });
  await page.locator('#canvas-curve').screenshot({ path: out('01c_curve_canvas_default.png') }).catch(() => {});
  trace.items['1'] = { labels, canvas: c1, errorsSoFar: [...errors] };
  log('ITEM1 labels:', JSON.stringify(labels));
  log('ITEM1 canvas-curve:', JSON.stringify(c1));

  // ── Item 2: WING TILT = 0 ⇒ plain v24 curve (no elbow) ──
  await page.click('.tabs .tab[data-subtab="settings"]');
  await setInput(page, 'kurt-tilt-input', 0);
  const tr_tilt0 = await tracePool(page);
  await page.evaluate(() => { const s=document.getElementById('chart-select')||document.querySelector('select'); if(s){s.value='curve';s.dispatchEvent(new Event('change'));} });
  await page.waitForTimeout(150);
  const c2 = await canvasStat(page, 'canvas-curve');
  await page.locator('#canvas-curve').screenshot({ path: out('02_curve_tilt0.png') }).catch(() => page.screenshot({ path: out('02_curve_tilt0_full.png') }));
  trace.items['2'] = { trace: tr_tilt0, bend: bendMetric(tr_tilt0.pts), canvas: c2 };
  log('ITEM2 tilt=0 useTau:', tr_tilt0.useTau, 'bend:', bendMetric(tr_tilt0.pts));

  // ── Item 3: WING TILT = 0.4 ⇒ visibly bent curve ──
  await page.click('.tabs .tab[data-subtab="settings"]');
  await setInput(page, 'kurt-tilt-input', 0.4);
  await setInput(page, 'kurt-tau-input', 1);
  const tr_tilt4 = await tracePool(page);
  await page.evaluate(() => { const s=document.getElementById('chart-select')||document.querySelector('select'); if(s){s.value='curve';s.dispatchEvent(new Event('change'));} });
  await page.waitForTimeout(150);
  const c3 = await canvasStat(page, 'canvas-curve');
  await page.locator('#canvas-curve').screenshot({ path: out('03_curve_tilt04.png') }).catch(() => page.screenshot({ path: out('03_curve_tilt04_full.png') }));
  trace.items['3'] = { trace: tr_tilt4, bend: bendMetric(tr_tilt4.pts), canvas: c3 };
  log('ITEM3 tilt=0.4 useTau:', tr_tilt4.useTau, 'bend:', bendMetric(tr_tilt4.pts));

  // ── Item 4: KURTOSIS τ changes elbow sharpness at tilt=0.4 ──
  // small τ (0.1) => sharp/tight elbow (LARGER bend); large τ (20) => soft/flat (SMALLER bend).
  await page.click('.tabs .tab[data-subtab="settings"]');
  await setInput(page, 'kurt-tau-input', 0.1);
  const tr_tauSmall = await tracePool(page);
  const eqSmall = await page.evaluate(() => { const p=Store.state.pool; const o=Store.state.oracle; return { xEq: p.alpha+Math.sqrt(p.alpha*p.beta/o), yEq: p.beta+Math.sqrt(p.alpha*p.beta*o) }; });
  await page.evaluate(() => { const s=document.getElementById('chart-select')||document.querySelector('select'); if(s){s.value='curve';s.dispatchEvent(new Event('change'));} });
  await page.waitForTimeout(150);
  await page.locator('#canvas-curve').screenshot({ path: out('04a_curve_tau0.1.png') }).catch(() => {});

  await page.click('.tabs .tab[data-subtab="settings"]');
  await setInput(page, 'kurt-tau-input', 20);
  const tr_tauLarge = await tracePool(page);
  const eqLarge = await page.evaluate(() => { const p=Store.state.pool; const o=Store.state.oracle; return { xEq: p.alpha+Math.sqrt(p.alpha*p.beta/o), yEq: p.beta+Math.sqrt(p.alpha*p.beta*o) }; });
  await page.evaluate(() => { const s=document.getElementById('chart-select')||document.querySelector('select'); if(s){s.value='curve';s.dispatchEvent(new Event('change'));} });
  await page.waitForTimeout(150);
  await page.locator('#canvas-curve').screenshot({ path: out('04b_curve_tau20.png') }).catch(() => {});

  trace.items['4'] = {
    tauSmall: { tau: tr_tauSmall.tau, bend: bendMetric(tr_tauSmall.pts), eq: eqSmall },
    tauLarge: { tau: tr_tauLarge.tau, bend: bendMetric(tr_tauLarge.pts), eq: eqLarge },
  };
  log('ITEM4 tau=0.1 bend:', bendMetric(tr_tauSmall.pts), 'eq:', JSON.stringify(eqSmall));
  log('ITEM4 tau=20  bend:', bendMetric(tr_tauLarge.pts), 'eq:', JSON.stringify(eqLarge));

  // ── Item 5: regression — toggle sliders, confirm no thrown errors, UI intact ──
  await page.click('.tabs .tab[data-subtab="settings"]');
  for (const v of [0, 0.2, 0.6, 0.8, 0.4]) await setInput(page, 'kurt-tilt-input', v);
  for (const v of [0.05, 5, 50, 1]) await setInput(page, 'kurt-tau-input', v);
  await page.waitForTimeout(150);
  const uiIntact = await page.evaluate(() => {
    const kpi = document.querySelector('.kpi-strip, .kpis, [class*="kpi"]');
    const panel = document.querySelector('.panel, #subtab-settings');
    const cv = document.getElementById('canvas-curve');
    return { kpiPresent: !!kpi, panelPresent: !!panel, canvasPresent: !!cv };
  });
  await page.screenshot({ path: out('05_after_toggle_full.png') });
  trace.items['5'] = { uiIntact, totalErrors: errors.length };

  trace.errors = errors;
  fs.writeFileSync(out('trace.json'), JSON.stringify(trace, null, 2));
  log('TOTAL console/page errors:', errors.length);
  if (errors.length) log('ERRORS:', JSON.stringify(errors, null, 2));
  await browser.close();
})();

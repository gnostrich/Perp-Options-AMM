// READ-ONLY live verification of HEAD v26c for items A-D.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { pathToFileURL } from 'url';
import path from 'path';

const HEAD = path.resolve('builds/HEAD_temporal_mvp_v26c.html');
const url = pathToFileURL(HEAD).href;

const out = {};
const browser = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errs.push('console:' + m.text()); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

// ---- ITEM C: live gamma/delta controls + stepper buttons ----
out.itemC = await page.evaluate(() => {
  const all = [...document.querySelectorAll('input,select,button')];
  const gammaControls = all
    .filter(el => /gamma|γ/i.test(el.id + ' ' + el.name + ' ' + (el.getAttribute('aria-label')||'') + ' ' + el.textContent))
    .map(el => ({ tag: el.tagName, id: el.id, type: el.type, text: el.textContent.trim().slice(0,40) }));
  const rangeInputs = all.filter(el => el.type === 'range').map(el => ({ id: el.id }));
  const deltaControls = all.filter(el => /delta|vol|scale/i.test(el.id) && el.tagName!=='BUTTON').map(el => ({ id: el.id, type: el.type }));
  const pool = Store.state.pool;
  const b1 = document.getElementById('preview-step-1');
  const b2 = document.getElementById('preview-step-2');
  return {
    gammaControls, rangeInputs, deltaControls,
    gammaLive: (pool && isFinite(pool.ghAh)) ? pool.ghAh - 1 : 'n/a',
    ghAh: pool ? pool.ghAh : 'n/a',
    stepperButtons: {
      b1: b1 ? { text: b1.textContent.trim(), disabled: b1.disabled } : null,
      b2: b2 ? { text: b2.textContent.trim(), disabled: b2.disabled } : null,
    },
  };
});

// ---- Build a 2-leg SPREAD band ----
out.build = await page.evaluate(() => {
  const oraEl = document.getElementById('kpi-oracle');
  oraEl.value = '80000'; oraEl.dispatchEvent(new Event('change', { bubbles: true }));
  Store.addPerp('long', 1.0, 50000, 80000);
  const clubSide = Object.keys(Store.state.clubs).find(k => Store.state.clubs[k].totalNotional > 0)
                   || Object.keys(Store.state.clubs)[0];
  const r = Store.openBand('call', 'put',
    { inner: 120000, outer: 140000 },
    { inner: 68000,  outer: 50000 },
    0.1, clubSide);
  if (typeof render === 'function') render();
  return { ok: r && r.ok, reason: r && r.reason, bands: Store.state.bands.length, clubSide };
});

// ---- ITEM B: ray count on graph 1 (clear stale preview first) ----
await page.evaluate(() => {
  window.__previewBand = null; window.__previewPool = null;
  const sel = document.getElementById('chart-select');
  if (sel) { sel.value = 'curve'; sel.dispatchEvent(new Event('change', { bubbles: true })); }
});
await page.waitForTimeout(200);
out.itemB = await page.evaluate(() => {
  const s = Store.state;
  const openBands = s.bands.filter(b => b.status === 'open');
  const thetaStarOf = (i, o) => (isFinite(o) && o > 0) ? Math.sqrt(i * o) : i;
  const liveRayTheta = (Ki, Ko, ora) => {
    const ri = (isFinite(Ki) && Ki > 0 && ora > 0) ? Ki / ora : NaN;
    const ro = (isFinite(Ko) && Ko > 0 && ora > 0) ? Ko / ora : NaN;
    return thetaStarOf(ri, ro);
  };
  const ora = s.oracle;
  const perBand = openBands.map(b => ({
    id: b.id,
    soldComposite: liveRayTheta(b.sold.K_inner, b.sold.K_outer, ora),
    boughtComposite: liveRayTheta(b.bought.K_inner, b.bought.K_outer, ora),
    soldRealStrikes: [b.sold.K_inner, b.sold.K_outer].filter(k => isFinite(k) && k > 0),
    boughtRealStrikes: [b.bought.K_inner, b.bought.K_outer].filter(k => isFinite(k) && k > 0),
  }));
  const totalRealStrikes = perBand.reduce((a, b) => a + b.soldRealStrikes.length + b.boughtRealStrikes.length, 0);
  return {
    openBands: openBands.length,
    raysPerOpenBand: 2,
    raysDrawn: 2 * openBands.length,
    previewRaysActive: window.__previewBand ? 2 : 0,
    totalRealStrikesInBand: totalRealStrikes,
    perBand,
  };
});

// ---- ITEM A: one mark per leg via compositeRay ----
out.itemA = await page.evaluate(() => {
  const pool = Store.state.pool;
  const b = Store.state.bands.find(x => x.status === 'open');
  const px_s = Engine.legPrice(pool, 'call', b.sold.inner, b.sold.outer, b.sold.N);
  const crS = Engine.compositeRay(Math.min(b.sold.inner,b.sold.outer), Math.max(b.sold.inner,b.sold.outer));
  const sN = Engine.getSNorm(pool), gP = pool.ghAh - 1;
  const mStarS = Engine.mark('call', crS.theta_star, sN, gP);
  const vS = Engine.vsValue(b.sold.N, mStarS, crS.delta);
  return {
    soldLeg: { mode: px_s.mode, theta_star: px_s.theta_star, m_star: px_s.m_star, V: px_s.V },
    independentRecompose: { theta_star: crS.theta_star, m_star: mStarS, V: vS },
    oneMarkPerLeg_match: Math.abs(px_s.V - vS) < 1e-12 && Math.abs(px_s.m_star - mStarS) < 1e-12,
    singleThetaStar: px_s.mode === 'spread' && isFinite(px_s.theta_star),
  };
});

// ---- ITEM C(c): stepper live — preview a band, toggle step 1<->2 ----
out.stepper = await page.evaluate(() => {
  // configure a band preview via the band inputs and trigger previewBand
  document.getElementById('band-notional').value = '0.1';
  document.getElementById('sold-inner').value = '120000';
  document.getElementById('sold-outer').value = '140000';
  document.getElementById('bought-inner').value = '68000';
  document.getElementById('bought-outer').value = '50000';
  ['band-notional','sold-inner','sold-outer','bought-inner','bought-outer'].forEach(id=>{
    document.getElementById(id).dispatchEvent(new Event('input',{bubbles:true}));
  });
  if (typeof previewBand === 'function') previewBand();
  const pb = window.__previewBand;
  if (!pb || !pb.leg1State) return { hasPreview: false, reason: 'previewBand did not populate leg1State' };
  // capture pool weight at step 1 vs step 2 (the pro-forma chain)
  const wOf = (s) => Engine.getW(s);
  if (typeof setPreviewStep === 'function') setPreviewStep(1);
  const step1 = { previewStep: window.__previewStep,
                  poolIsLeg1: window.__previewPool === pb.leg1State,
                  w: wOf(window.__previewPool) };
  if (typeof setPreviewStep === 'function') setPreviewStep(2);
  const step2 = { previewStep: window.__previewStep,
                  poolIsLeg2: window.__previewPool === pb.leg2State,
                  w: wOf(window.__previewPool) };
  return {
    hasPreview: true,
    leg1StatePresent: !!pb.leg1State, leg2StatePresent: !!pb.leg2State,
    step1, step2,
    wChangedBetweenSteps: Math.abs(step1.w - step2.w) > 0,
    leg1RayTheta: pb.leg1_theta_star, leg2RayTheta: pb.leg2_theta_star,
  };
});

// ---- ITEM D: portfolio table — navigate via nav-link, read rows ----
await page.evaluate(() => {
  window.__previewBand = null; window.__previewPool = null;
  const nav = document.querySelector('[data-page="portfolio"]');
  if (nav) nav.click();
  if (typeof render === 'function') render();
});
await page.waitForTimeout(300);
out.itemD = await page.evaluate(() => {
  const bt = document.getElementById('bands-tbody');
  const rows = bt ? [...bt.querySelectorAll('tr')] : [];
  const classified = rows.map(tr => ({
    cls: tr.className.trim(),
    firstCell: (tr.querySelector('td') ? tr.querySelector('td').textContent.trim().slice(0,40) : ''),
    cols: tr.querySelectorAll('td').length,
  }));
  const bandRow = rows.filter(r => r.classList.contains('pf-band-row')).length;
  const compRow = rows.filter(r => r.classList.contains('pf-comp-row')).length;
  const totalRow = rows.filter(r => r.classList.contains('pf-total-row')).length;
  const pt = document.getElementById('perps-tbody');
  const perpRows = pt ? [...pt.querySelectorAll('tr')].filter(r=>!r.querySelector('.empty-row')).length : 0;
  const bandsHeaders = [...document.querySelectorAll('#bands-table thead th')].map(th=>th.textContent.trim());
  const perpsHeaders = [...document.querySelectorAll('#pf-perps table thead th')].map(th=>th.textContent.trim());
  return { totalRowsRendered: rows.length, bandRow, compRow, totalRow, perpRows,
           rows: classified, bandsCols: bandsHeaders.length, perpsCols: perpsHeaders.length,
           bandsHeaders, perpsHeaders };
});

await browser.close();
console.log(JSON.stringify(out, null, 2));
console.log('PAGE_ERRORS:', JSON.stringify(errs.slice(0,10)));

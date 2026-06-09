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
    GH_GAMMA_const: (typeof GH_GAMMA !== 'undefined') ? GH_GAMMA : 'n/a',
    stepperButtons: {
      b1: b1 ? { text: b1.textContent.trim(), disabled: b1.disabled } : null,
      b2: b2 ? { text: b2.textContent.trim(), disabled: b2.disabled } : null,
    },
  };
});

// ---- Build a 2-leg SPREAD band (sold call spread + bought put spread) ----
out.build = await page.evaluate(() => {
  const oraEl = document.getElementById('kpi-oracle');
  oraEl.value = '80000'; oraEl.dispatchEvent(new Event('change', { bubbles: true }));
  Store.addPerp('long', 1.0, 50000, 80000);
  // pick the club created
  const clubSide = Object.keys(Store.state.clubs).find(k => Store.state.clubs[k].totalNotional > 0)
                   || Object.keys(Store.state.clubs)[0];
  // sold call SPREAD (inner & outer > oracle), bought put SPREAD (inner & outer < oracle)
  const r = Store.openBand('call', 'put',
    { inner: 120000, outer: 140000 },   // sold call spread
    { inner: 68000,  outer: 50000 },    // bought put spread
    0.1, clubSide);
  return { ok: r && r.ok, reason: r && r.reason, bands: Store.state.bands.length,
           clubSide, clubs: Object.keys(Store.state.clubs) };
});

// render & switch chart to curve
await page.evaluate(() => {
  const sel = document.getElementById('chart-select');
  if (sel) { sel.value = 'curve'; sel.dispatchEvent(new Event('change', { bubbles: true })); }
});
await page.waitForTimeout(300);

// ---- ITEM B: count strike rays drawn on graph 1 for the spread band ----
// Instrument drawStrikeRay calls by wrapping CanvasRenderingContext2D usage is
// fragile; instead recompute what drawCurve draws from Store + the same formula.
out.itemB = await page.evaluate(() => {
  const s = Store.state;
  const openBands = s.bands.filter(b => b.status === 'open');
  // mirror drawCurve: 2 rays per open band (sold composite + bought composite)
  const thetaStarOf = (inner, outer) => (isFinite(outer) && outer > 0) ? Math.sqrt(inner * outer) : inner;
  const liveRayTheta = (Ki, Ko, ora) => {
    const ri = (isFinite(Ki) && Ki > 0 && ora > 0) ? Ki / ora : NaN;
    const ro = (isFinite(Ko) && Ko > 0 && ora > 0) ? Ko / ora : NaN;
    return thetaStarOf(ri, ro);
  };
  const ora = s.oracle;
  const perBand = openBands.map(b => ({
    id: b.id,
    soldRayTheta: liveRayTheta(b.sold.K_inner, b.sold.K_outer, ora),
    boughtRayTheta: liveRayTheta(b.bought.K_inner, b.bought.K_outer, ora),
    soldRealStrikes: [b.sold.K_inner, b.sold.K_outer].filter(k => isFinite(k) && k > 0),
    boughtRealStrikes: [b.bought.K_inner, b.bought.K_outer].filter(k => isFinite(k) && k > 0),
  }));
  const raysPerBand = 2;  // sold + bought composite
  const totalRealStrikes = perBand.reduce((a, b) => a + b.soldRealStrikes.length + b.boughtRealStrikes.length, 0);
  const previewRays = window.__previewBand ? 2 : 0;
  return { openBands: openBands.length, raysPerBand, perBand,
           totalRealStrikes, previewRays,
           note: 'rays = 2*openBands + (previewBand?2:0); real strikes = ' + totalRealStrikes };
});

// ---- ITEM A: pricing regime — one mark per leg via compositeRay ----
out.itemA = await page.evaluate(() => {
  const s = Store.state, pool = s.pool;
  const b = s.bands.find(x => x.status === 'open');
  if (!b) return { err: 'no open band' };
  const px_s = Engine.legPrice(pool, 'call', b.sold.inner, b.sold.outer, b.sold.N);
  const px_b = Engine.legPrice(pool, 'put', b.bought.inner, b.bought.outer, b.bought.N);
  // independently: one composite ray, one mark, vsValue
  const crS = Engine.compositeRay(Math.min(b.sold.inner,b.sold.outer), Math.max(b.sold.inner,b.sold.outer));
  const sN = Engine.getSNorm(pool);
  const gP = pool.ghAh - 1;
  const mStarS = Engine.mark('call', crS.theta_star, sN, gP);
  const vS = Engine.vsValue(b.sold.N, mStarS, crS.delta);
  return {
    soldLeg: { mode: px_s.mode, theta_star: px_s.theta_star, m_star: px_s.m_star, V: px_s.V },
    boughtLeg:{ mode: px_b.mode, theta_star: px_b.theta_star, m_star: px_b.m_star, V: px_b.V },
    independentSold: { theta_star: crS.theta_star, m_star: mStarS, V: vS },
    matchesOneMark: Math.abs(px_s.V - vS) < 1e-9 && Math.abs(px_s.m_star - mStarS) < 1e-9,
    composite_single_theta_star: isFinite(px_s.theta_star) && px_s.mode === 'spread',
  };
});

// ---- ITEM D: portfolio table row structure ----
await page.evaluate(() => {
  // navigate to portfolio page if tab exists
  const tab = [...document.querySelectorAll('button,a,[role=tab]')].find(e => /portfolio/i.test(e.textContent) && e.textContent.length < 30);
  if (tab) tab.click();
});
await page.waitForTimeout(300);
out.itemD = await page.evaluate(() => {
  const bt = document.getElementById('bands-tbody');
  const rows = bt ? [...bt.querySelectorAll('tr')] : [];
  const classified = rows.map(tr => ({
    cls: tr.className,
    firstCell: (tr.querySelector('td') || {}).textContent ? tr.querySelector('td').textContent.trim().slice(0,40) : '',
    cols: tr.querySelectorAll('td').length,
  }));
  const bandRow = rows.filter(r => r.classList.contains('pf-band-row')).length;
  const compRow = rows.filter(r => r.classList.contains('pf-comp-row')).length;
  const totalRow = rows.filter(r => r.classList.contains('pf-total-row')).length;
  // perps table
  const pt = document.getElementById('perps-tbody');
  const perpRows = pt ? [...pt.querySelectorAll('tr')].filter(r=>!r.querySelector('.empty-row')).length : 0;
  // column header counts
  const bandsHeaders = [...document.querySelectorAll('#bands-table thead th')].map(th=>th.textContent.trim());
  const perpsHeaders = [...document.querySelectorAll('#pf-perps table thead th')].map(th=>th.textContent.trim());
  return { rows: classified, bandRow, compRow, totalRow, perpRows,
           bandsCols: bandsHeaders.length, perpsCols: perpsHeaders.length,
           bandsHeaders, perpsHeaders };
});

await browser.close();
console.log(JSON.stringify(out, null, 2));
console.log('PAGE_ERRORS:', JSON.stringify(errs.slice(0,10)));

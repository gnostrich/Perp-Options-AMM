// READ-ONLY live-browser comparison: playground vs v24 Balancer reference.
// No engine edits. Uses global Playwright + explicit chromium path (per CLAUDE.md / MEMORY).
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { fileURLToPath } from 'url';

const V24  = 'file:///home/user/Perp-Options-AMM/reference/v24_balancer_stable.html';
const PG   = 'file:///home/user/Perp-Options-AMM/reference/temporal_curve_playground.html';
const OUT  = '/home/user/Perp-Options-AMM/evidence/playground_vs_v24';

// count non-background pixels in the curve canvas (background is near-uniform dark)
async function nonblank(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid);
    if (!cv) return { found: false };
    const ctx = cv.getContext('2d');
    const w = cv.width, h = cv.height;
    const d = ctx.getImageData(0, 0, w, h).data;
    // sample the modal background color from a corner block
    const bg = [d[0], d[1], d[2]];
    let nb = 0;
    for (let i = 0; i < d.length; i += 4) {
      const dr = Math.abs(d[i] - bg[0]), dg = Math.abs(d[i+1] - bg[1]), db = Math.abs(d[i+2] - bg[2]);
      if (dr + dg + db > 24) nb++;
    }
    return { found: true, w, h, total: w*h, nonblank: nb, bg };
  }, id);
}

async function ensureCurveView(page) {
  // chart-select default may already be 'curve'; force it and dispatch change.
  await page.evaluate(() => {
    const sel = document.getElementById('chart-select');
    if (sel) { sel.value = 'curve'; sel.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  await page.waitForTimeout(300);
}

async function setGamma(page, val) {
  return await page.evaluate((v) => {
    const el = document.getElementById('vk-gamma');
    if (!el) return { ok: false };
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return {
      ok: true,
      gammaOut: (document.getElementById('vk-gamma-out')||{}).textContent,
      deltaOut: (document.getElementById('vk-delta-out')||{}).textContent,
      betahOut: (document.getElementById('vk-betah-out')||{}).textContent,
      ghAh: (window.Store && Store.state && Store.state.pool) ? Store.state.pool.ghAh : null,
      ghMu: (window.Store && Store.state && Store.state.pool) ? Store.state.pool.ghMu : null,
    };
  }, val);
}

// click the native stepper up-arrow effect by stepping value via .stepUp() then dispatch
async function stepGamma(page, steps) {
  return await page.evaluate((n) => {
    const el = document.getElementById('vk-gamma');
    if (!el) return { ok:false };
    const before = el.value;
    for (let i=0;i<Math.abs(n);i++){ if (n>0) el.stepUp(); else el.stepDown(); }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok:true, before, after: el.value, gammaOut:(document.getElementById('vk-gamma-out')||{}).textContent };
  }, steps);
}

async function go() {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const results = {};

  // ---- v24 ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });
    await page.goto(V24, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    await ensureCurveView(page);
    await page.waitForTimeout(500);
    const nb = await nonblank(page, 'canvas-curve');
    // screenshot just the canvas
    const cv = await page.$('#canvas-curve');
    if (cv) await cv.screenshot({ path: `${OUT}/v24_curve.png` });
    await page.screenshot({ path: `${OUT}/v24_full.png` });
    results.v24 = { nb, errs };
    await ctx.close();
  }

  // ---- playground ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });
    await page.goto(PG, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    await ensureCurveView(page);
    await page.waitForTimeout(500);

    // default (gamma ~1.05)
    const defState = await page.evaluate(() => ({
      gammaOut: (document.getElementById('vk-gamma-out')||{}).textContent,
      deltaOut: (document.getElementById('vk-delta-out')||{}).textContent,
      betahOut: (document.getElementById('vk-betah-out')||{}).textContent,
      gammaInput: (document.getElementById('vk-gamma')||{}).value,
      ghAh: Store?.state?.pool?.ghAh, ghMu: Store?.state?.pool?.ghMu,
    }));
    const nbDef = await nonblank(page, 'canvas-curve');
    let cv = await page.$('#canvas-curve');
    if (cv) await cv.screenshot({ path: `${OUT}/playground_default.png` });
    await page.screenshot({ path: `${OUT}/playground_default_full.png` });

    // gamma -> 1.3
    const s13 = await setGamma(page, 1.3);
    await page.waitForTimeout(500);
    const nb13 = await nonblank(page, 'canvas-curve');
    cv = await page.$('#canvas-curve');
    if (cv) await cv.screenshot({ path: `${OUT}/playground_g1p3.png` });

    // gamma -> 2
    const s2 = await setGamma(page, 2);
    await page.waitForTimeout(500);
    const nb2 = await nonblank(page, 'canvas-curve');
    cv = await page.$('#canvas-curve');
    if (cv) await cv.screenshot({ path: `${OUT}/playground_g2.png` });

    // stepper test: from 2, step up 2 (=> 2.10), redraw + value-change check
    const before2 = await nonblank(page, 'canvas-curve');
    const stepUp = await stepGamma(page, 2);
    await page.waitForTimeout(400);
    const afterStep = await nonblank(page, 'canvas-curve');

    // delta dial re-warp check (kurtosis): from g2 reset to default-ish, change delta
    await setGamma(page, 1.3); await page.waitForTimeout(300);
    const nbBeforeDelta = await nonblank(page, 'canvas-curve');
    const deltaChange = await page.evaluate(() => {
      const el = document.getElementById('vk-delta');
      if (!el) return { ok:false };
      const before = el.value;
      el.value = '5'; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true}));
      return { ok:true, before, after: el.value, out:(document.getElementById('vk-delta-out')||{}).textContent, ghMu: Store?.state?.pool?.ghMu };
    });
    await page.waitForTimeout(400);
    const nbAfterDelta = await nonblank(page, 'canvas-curve');

    // betah skew change
    const betaChange = await page.evaluate(() => {
      const el = document.getElementById('vk-betah');
      if (!el) return { ok:false };
      el.value = '0.5'; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true}));
      return { ok:true, after: el.value, out:(document.getElementById('vk-betah-out')||{}).textContent, ghBh: Store?.state?.pool?.ghBh };
    });
    await page.waitForTimeout(400);
    const nbAfterBeta = await nonblank(page, 'canvas-curve');

    // restore to gamma 1.3 for the side-by-side capture (closest match candidate)
    await setGamma(page, 1.3); await page.waitForTimeout(200); await setGamma(page, 0); // floor test below
    const floorState = await page.evaluate(() => ({
      gammaOut:(document.getElementById('vk-gamma-out')||{}).textContent,
      note:(document.getElementById('vk-note')||{}).textContent?.slice(0,60),
    }));

    results.playground = {
      defState, nbDef, s13, nb13, s2, nb2,
      stepper: { before2, stepUp, afterStep,
                 redrew: before2.nonblank !== afterStep.nonblank,
                 valueChanged: stepUp.before !== stepUp.after },
      delta: { deltaChange, nbBeforeDelta, nbAfterDelta, redrew: nbBeforeDelta.nonblank !== nbAfterDelta.nonblank },
      beta:  { betaChange, nbAfterBeta },
      floorState,
      errs,
    };
    await ctx.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}
go().catch(e => { console.error('FATAL', e); process.exit(1); });

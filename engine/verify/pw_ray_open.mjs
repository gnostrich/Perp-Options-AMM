// Test the OPEN-band ray path (post-Execute) vs the preview path. Playground only.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const ROOT = '/home/user/Perp-Options-AMM';
const FILE = ROOT + '/reference/temporal_curve_playground.html';
const OUT = ROOT + '/evidence/ray_direction';

const PROBE = `(() => {
  const s = Store.state; const oracle = s.oracle;
  const openRays = [];
  for (const b of s.bands) {
    if (b.status !== 'open') continue;
    const live = (Ki,Ko) => { const ri=(isFinite(Ki)&&Ki>0)?Ki/oracle:NaN; const ro=(isFinite(Ko)&&Ko>0)?Ko/oracle:NaN; return (isFinite(ro)&&ro>0)?Math.sqrt(ri*ro):ri; };
    const st = live(b.sold.K_inner,b.sold.K_outer), bt = live(b.bought.K_inner,b.bought.K_outer);
    openRays.push({id:b.id, sold_wing:b.sold_wing, bought_wing:b.bought_wing,
      sold_K:b.sold.K_inner, sold_rawSlope:st*oracle, bought_K:b.bought.K_inner, bought_rawSlope:bt*oracle});
  }
  return { oracle, modeSlope: s.pool.beta/s.pool.alpha, openRays };
})()`;

(async () => {
  const errs = [];
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  await page.goto('file://' + FILE);
  await page.waitForTimeout(700);
  // Execute the default preview band so a status==='open' band exists.
  // click via JS to bypass visibility gating
  const disabled = await page.evaluate(() => document.getElementById('btn-execute').disabled);
  const out = { execDisabled: disabled };
  await page.evaluate(()=>document.getElementById('btn-execute').click()); await page.waitForTimeout(400);
  out.afterExecute = await page.evaluate(PROBE);
  await (await page.$('#canvas-curve')).screenshot({ path: OUT + '/pg_open_band.png' });
  out.errs = errs;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();

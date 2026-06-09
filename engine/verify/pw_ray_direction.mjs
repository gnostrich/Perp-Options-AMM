// READ-ONLY ray-direction diagnosis: playground vs v24.
// Drives the real DOM strike inputs, reads back the drawn ray geometry, screenshots before/after.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { fileURLToPath } from 'url';
import path from 'path';

const ROOT = '/home/user/Perp-Options-AMM';
const OUT = ROOT + '/evidence/ray_direction';

const BUILD = process.argv[2];           // 'pg' or 'v24'
const FILE = BUILD === 'v24'
  ? ROOT + '/reference/v24_balancer_stable.html'
  : ROOT + '/reference/temporal_curve_playground.html';

// Probe that runs IN the page: returns the geometry the canvas actually draws.
// We replicate drawStrikeRay's slope math from the live state so we can report
// numbers, then also rely on screenshots for the pixel truth.
const PROBE = `(() => {
  const s = Store.state;
  const oracle = s.oracle;
  // mode ray slope = beta/alpha (ATM). Pull from a fresh snapshot.
  let modeSlope = null, alpha=null, beta=null;
  try {
    // snapshot() is a top-level fn; reach it via the same path drawCurve uses.
    // Engine exposes arbitrageToOracle; pool carries alpha/beta.
    const p = s.pool;
    alpha = p.alpha; beta = p.beta;
    modeSlope = beta/alpha;
  } catch(e){}
  // Open-band live rays (what the curve graph draws for status==='open' bands).
  const openRays = [];
  for (const b of s.bands) {
    if (b.status !== 'open') continue;
    const live = (Ki,Ko) => {
      const ri = (isFinite(Ki)&&Ki>0&&oracle>0)?Ki/oracle:NaN;
      const ro = (isFinite(Ko)&&Ko>0&&oracle>0)?Ko/oracle:NaN;
      const th = (isFinite(ro)&&ro>0)?Math.sqrt(ri*ro):ri;
      return th;
    };
    // Playground uses K_inner; v24 uses stored b.sold.inner (entry theta).
    const soldTh = (b.sold.K_inner!=null) ? live(b.sold.K_inner,b.sold.K_outer) : (function(){const t=b.sold; return (isFinite(t.outer)&&t.outer>0)?Math.sqrt(t.inner*t.outer):t.inner;})();
    const bghtTh = (b.bought.K_inner!=null) ? live(b.bought.K_inner,b.bought.K_outer) : (function(){const t=b.bought; return (isFinite(t.outer)&&t.outer>0)?Math.sqrt(t.inner*t.outer):t.inner;})();
    openRays.push({id:b.id, sold_theta:soldTh, sold_rawSlope:soldTh*oracle, bought_theta:bghtTh, bought_rawSlope:bghtTh*oracle, sold_wing:b.sold_wing, bought_wing:b.bought_wing});
  }
  // Preview band rays (the dotted preview overlay drawn at load before execute).
  let preview = null;
  if (window.__previewBand) {
    const pb = window.__previewBand;
    preview = {
      sold_wing: pb.sold_wing, bought_wing: pb.bought_wing,
      leg1_theta_star: pb.leg1_theta_star, leg1_rawSlope: pb.leg1_theta_star*oracle,
      leg2_theta_star: pb.leg2_theta_star, leg2_rawSlope: pb.leg2_theta_star*oracle
    };
  }
  return { oracle, alpha, beta, modeSlope, openRays, preview,
           soldInner: (document.getElementById('sold-inner')||{}).value,
           boughtInner: (document.getElementById('bought-inner')||{}).value };
})()`;

async function setInput(page, id, val) {
  await page.evaluate(({id,val}) => {
    const el = document.getElementById(id);
    el.value = String(val);
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
  }, {id,val});
  await page.waitForTimeout(120);
}

async function shot(page, name) {
  const cv = await page.$('#canvas-curve');
  await cv.screenshot({ path: OUT + '/' + BUILD + '_' + name + '.png' });
}

(async () => {
  const errs = [];
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE.ERR: ' + m.text()); });

  await page.goto('file://' + FILE);
  await page.waitForTimeout(700);
  // Make sure the curve subtab/canvas is visible.
  await page.evaluate(() => { const c=document.getElementById('canvas-curve'); if(c&&typeof render==='function') render(); });
  await page.waitForTimeout(200);

  const log = {};
  log.baseline = await page.evaluate(PROBE);
  await shot(page, '0_baseline');

  // ── CALL leg (sold leg, dir=long ⇒ sold-inner is the call strike) ──
  const baseCall = parseFloat(log.baseline.soldInner);
  await setInput(page, 'sold-inner', baseCall + 8000);   // INCREASE call strike
  log.callIncrease = await page.evaluate(PROBE);
  await shot(page, '1_call_increase');

  await setInput(page, 'sold-inner', Math.max(500, baseCall - 8000)); // DECREASE call strike
  log.callDecrease = await page.evaluate(PROBE);
  await shot(page, '2_call_decrease');

  await setInput(page, 'sold-inner', baseCall);  // restore

  // ── PUT leg (bought leg, dir=long ⇒ bought-inner is the put strike) ──
  const basePut = parseFloat(log.baseline.boughtInner);
  await setInput(page, 'bought-inner', basePut + 8000); // INCREASE put strike (toward ATM)
  log.putIncrease = await page.evaluate(PROBE);
  await shot(page, '3_put_increase');

  await setInput(page, 'bought-inner', Math.max(500, basePut - 8000)); // DECREASE put strike
  log.putDecrease = await page.evaluate(PROBE);
  await shot(page, '4_put_decrease');

  await setInput(page, 'bought-inner', basePut);  // restore
  log.restored = await page.evaluate(PROBE);

  log.errs = errs;
  console.log(JSON.stringify(log, null, 2));
  await browser.close();
})();

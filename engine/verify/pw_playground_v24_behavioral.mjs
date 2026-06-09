// READ-ONLY behavioral sweep: playground (b9e7d907) vs v24 (6f606f52).
// PART A: preview-ray fix (direction + same-side as open ray + dial labels).
// PART B: pricing / payoff / table structural diff vs v24. No engine edits.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;

const ROOT = '/home/user/Perp-Options-AMM';
const OUT = ROOT + '/evidence/playground_v24_behavioral';
const PG = ROOT + '/reference/temporal_curve_playground.html';
const V24 = ROOT + '/reference/v24_balancer_stable.html';

// Reproduce drawStrikeRay's slope basis from live state, for BOTH the preview
// band and the open bands, so we can compare direction + which wing they sit on.
const PROBE = `(() => {
  const s = Store.state;
  const oracle = s.oracle;
  const p = s.pool;
  const alpha = p.alpha, beta = p.beta;
  const modeSlope = beta/alpha;            // ATM ray slope
  const live = (Ki,Ko) => {
    const ri = (isFinite(Ki)&&Ki>0&&oracle>0)?Ki/oracle:NaN;
    const ro = (isFinite(Ko)&&Ko>0&&oracle>0)?Ko/oracle:NaN;
    const th = (isFinite(ro)&&ro>0)?Math.sqrt(ri*ro):ri;
    return th;
  };
  // legacy entry-theta (v24 path): stored b.*.inner/outer
  const legacy = (t) => (isFinite(t.outer)&&t.outer>0)?Math.sqrt(t.inner*t.outer):t.inner;
  const openRays = [];
  for (const b of s.bands) {
    if (b.status !== 'open') continue;
    const soldTh = (b.sold.K_inner!=null) ? live(b.sold.K_inner,b.sold.K_outer) : legacy(b.sold);
    const bghtTh = (b.bought.K_inner!=null) ? live(b.bought.K_inner,b.bought.K_outer) : legacy(b.bought);
    openRays.push({ id:b.id, sold_wing:b.sold_wing, bought_wing:b.bought_wing,
      sold_rawSlope: soldTh*oracle, bought_rawSlope: bghtTh*oracle });
  }
  // Preview rays — read the SAME basis the patched drawCurve now uses:
  // liveRayTheta(p.sold.K_inner, p.sold.K_outer) for playground; for v24,
  // __previewBand still carries leg*_theta_star but also sold/bought objects.
  let preview = null;
  if (window.__previewBand) {
    const pb = window.__previewBand;
    const sold = pb.sold, bought = pb.bought;
    const soldHasK = sold && sold.K_inner != null;
    const bghtHasK = bought && bought.K_inner != null;
    preview = {
      sold_wing: pb.sold_wing, bought_wing: pb.bought_wing,
      // patched price-space basis (what the canvas draws now)
      sold_rawSlope_live:   soldHasK ? live(sold.K_inner,sold.K_outer)*oracle : null,
      bought_rawSlope_live: bghtHasK ? live(bought.K_inner,bought.K_outer)*oracle : null,
      // legacy carry-space basis (the OLD buggy path) for contrast
      leg1_rawSlope_carry: (pb.leg1_theta_star!=null)?pb.leg1_theta_star*oracle:null,
      leg2_rawSlope_carry: (pb.leg2_theta_star!=null)?pb.leg2_theta_star*oracle:null,
      sold_K_inner: soldHasK? sold.K_inner : (sold? sold.inner: null),
      bought_K_inner: bghtHasK? bought.K_inner : (bought? bought.inner: null)
    };
  }
  return { oracle, modeSlope, openRays, preview,
    soldInner: (document.getElementById('sold-inner')||{}).value,
    boughtInner: (document.getElementById('bought-inner')||{}).value };
})()`;

async function setInput(page, id, val) {
  await page.evaluate(({id,val}) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = String(val);
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
  }, {id,val});
  await page.waitForTimeout(150);
}
async function shotCanvas(page, sel, file) {
  const cv = await page.$(sel);
  if (!cv) return false;
  await cv.screenshot({ path: OUT + '/' + file });
  return true;
}
async function selectChart(page, val) {
  await page.evaluate((v) => {
    const sel = document.getElementById('chart-select');
    sel.value = v;
    sel.dispatchEvent(new Event('change', {bubbles:true}));
  }, val);
  await page.waitForTimeout(250);
}
// dial labels (playground only)
const LABELS = `(() => {
  const txt = (id) => { const l = document.getElementById(id); return l? (l.closest('label')||l.parentElement).textContent.trim() : null; };
  const all = document.querySelector('#vk-gamma') ? document.querySelector('.vk-fields, .vk-panel, body').textContent : '';
  return {
    gamma: txt('vk-gamma'), delta: txt('vk-delta'), betah: txt('vk-betah'),
    hasSteepness: /steepness/i.test(document.body.textContent),
    hasKurtosis: /kurtosis/i.test(document.body.textContent),
    hasConvexity: /convexity/i.test(document.body.textContent),
    hasATMsmoothing: /ATM smoothing/i.test(document.body.textContent),
    hasSkew: /\bskew\b/i.test(document.body.textContent)
  };
})()`;
// table structure probe (count rows in bands tbody)
const TABLE = `(() => {
  const tb = document.getElementById('bands-tbody');
  if (!tb) return { found:false };
  const rows = [...tb.querySelectorAll('tr')];
  const head = document.querySelector('#bands-table thead, table thead');
  const cols = head ? [...head.querySelectorAll('th')].map(th=>th.textContent.trim()) : null;
  return { found:true, rowCount: rows.length,
    rowClasses: rows.map(r=>r.className||''),
    cols };
})()`;

async function run(file, tag) {
  const errs = [];
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE.ERR: ' + m.text()); });
  await page.goto('file://' + file);
  await page.waitForTimeout(800);

  const log = { tag };
  const isPg = tag === 'pg';

  // ---- PART A (playground): dial labels + preview-ray direction ----
  if (isPg) {
    log.labels = await page.evaluate(LABELS);
    await selectChart(page, 'curve');
    await page.evaluate(() => { if (typeof render==='function') render(); });
    await page.waitForTimeout(200);
    log.A_baseline = await page.evaluate(PROBE);
    await shotCanvas(page, '#canvas-curve', 'A_pg_0_baseline.png');

    const baseCall = parseFloat(log.A_baseline.soldInner);
    await setInput(page, 'sold-inner', baseCall + 8000);     // INCREASE call strike
    log.A_callUp = await page.evaluate(PROBE);
    await shotCanvas(page, '#canvas-curve', 'A_pg_1_call_increase.png');
    await setInput(page, 'sold-inner', Math.max(500, baseCall - 8000)); // DECREASE
    log.A_callDown = await page.evaluate(PROBE);
    await shotCanvas(page, '#canvas-curve', 'A_pg_2_call_decrease.png');
    await setInput(page, 'sold-inner', baseCall);
    log.A_restored = await page.evaluate(PROBE);
  } else {
    // v24 reference direction
    await selectChart(page, 'curve');
    await page.evaluate(() => { if (typeof render==='function') render(); });
    await page.waitForTimeout(200);
    log.A_baseline = await page.evaluate(PROBE);
    await shotCanvas(page, '#canvas-curve', 'A_v24_0_baseline.png');
    const baseCall = parseFloat(log.A_baseline.soldInner);
    if (isFinite(baseCall)) {
      await setInput(page, 'sold-inner', baseCall + 8000);
      log.A_callUp = await page.evaluate(PROBE);
      await shotCanvas(page, '#canvas-curve', 'A_v24_1_call_increase.png');
      await setInput(page, 'sold-inner', baseCall);
    }
  }

  // ---- PART B: pricing / payoff / table ----
  await selectChart(page, 'pricing');
  await shotCanvas(page, '#canvas-pricing', 'B_' + tag + '_pricing.png');
  await selectChart(page, 'payoff');
  await shotCanvas(page, '#canvas-payoff', 'B_' + tag + '_payoff.png');
  // table — go to bands subtab if present; renderBands already ran at load
  log.B_table = await page.evaluate(TABLE);

  log.errs = errs;
  await browser.close();
  return log;
}

(async () => {
  const pg = await run(PG, 'pg');
  const v24 = await run(V24, 'v24');
  console.log(JSON.stringify({ pg, v24 }, null, 2));
})();

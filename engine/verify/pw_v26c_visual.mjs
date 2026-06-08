// Live Playwright visual confirmation of v26c_full2 (uniform strike registration).
// Engine & Store ARE reachable inside page.evaluate (classic-script consts live in
// the page global). So the LIVE oracle of record here is: rendered DOM bands-table
// mark cells + the page's OWN Engine/Store called against the live pool state.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD  = path.join(ENGINE, 'builds', 'temporal_mvp_v26c_full2.html');
const EVID   = path.resolve(ENGINE, '..', 'evidence', 'v26c_pw');
fs.mkdirSync(EVID, { recursive: true });
const out = (n) => path.join(EVID, n);
const log = (...a) => console.log(...a);

async function canvasLit(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let lit = 0, nan = false;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 10) lit++;
    return { W: cv.width, H: cv.height, litPixels: lit, blank: lit === 0 };
  }, id);
}

// Read every comp-row's leg label, strike cell, oracle cell, attrib, mark cell.
async function compMarks(page) {
  return await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#bands-table tbody tr.pf-comp-row')];
    return rows.map(tr => {
      const tds = [...tr.querySelectorAll('td')];
      return {
        leg: (tds[0]?.textContent || '').trim().replace(/\s+/g, ' '),
        strike: (tds[1]?.textContent || '').trim(),
        oracle: (tds[2]?.textContent || '').trim(),
        attrib: (tds[3]?.textContent || '').trim(),
        mark:   (tds[4]?.textContent || '').trim(),
        ncells: tds.length,
        cls: tr.className.trim()
      };
    });
  });
}
async function bandsHeaders(page) {
  return await page.evaluate(() =>
    [...document.querySelectorAll('#bands-table thead th')].map(th => th.textContent.trim()));
}

// Live engine snapshot: pool state, registered theta = sNormStrike(pool,K),
// live getSNorm(pool), and the chart-basis legFraction at r=0 (the live spot).
async function liveEngine(page) {
  return await page.evaluate(() => {
    if (typeof Store === 'undefined' || typeof Engine === 'undefined') return { err: 'no Store/Engine' };
    const s = Store.state;
    const pool = s.pool;
    const sNormPool = Engine.getSNorm(pool);
    const g = pool.ghAh - 1;
    const bands = (s.bands || []).filter(b => b.status === 'open');
    const out = { oracle: s.oracle, sNormPool, gamma: g, bands: [] };
    for (const b of bands) {
      const legRec = (leg, wing) => {
        const Ki = leg.K_inner, Ko = leg.K_outer;
        const thetaReg = (isFinite(Ki) && Ki > 0) ? Engine.sNormStrike(pool, Ki) : NaN;
        const thetaOutReg = (isFinite(Ko) && Ko > 0) ? Engine.sNormStrike(pool, Ko) : NaN;
        // entry-frozen theta stored on the leg (price-ratio @ open)
        const thetaEntry = leg.inner;
        // chart legFraction at r=0: mark(wing, thetaReg, sNormPool, g), barrier=naked
        let chartFrac;
        if (Engine.isBarrier(thetaOutReg)) {
          chartFrac = Engine.mark(wing, thetaReg, sNormPool, g);
        } else {
          const mIn  = Math.min(1, Engine.mark(wing, thetaReg, sNormPool, g));
          const mOut = Math.min(1, Engine.mark(wing, thetaOutReg, sNormPool, g));
          chartFrac = mIn - mOut;
        }
        // table mark cell uses markEff(wing, thetaReg, sNormPool, g) (registered)
        const tableMarkEff = Engine.markEff(wing, thetaReg, sNormPool, g);
        return { wing, K_inner: Ki, K_outer: Ko, thetaReg, thetaOutReg,
                 thetaEntry, chartFrac, tableMarkEff,
                 sNorm_atK: thetaReg, isBarrier: Engine.isBarrier(thetaOutReg) };
      };
      out.bands.push({
        id: b.id,
        sold:   legRec(b.sold,   b.sold_wing),
        bought: legRec(b.bought, b.bought_wing)
      });
    }
    return out;
  });
}

async function setOracle(page, orc) {
  await page.click('button.page-nav-link[data-page="transact"]').catch(()=>{});
  await page.click('button.tab[data-subtab="settings"]').catch(()=>{});
  await page.waitForTimeout(80);
  await page.fill('#kpi-oracle', String(orc));
  await page.locator('#kpi-oracle').press('Enter').catch(()=>{});
  await page.locator('#kpi-oracle').dispatchEvent('change').catch(()=>{});
  await page.waitForTimeout(200);
}
async function gotoBands(page) {
  await page.click('button.page-nav-link[data-page="portfolio"]').catch(()=>{});
  await page.waitForTimeout(120);
  await page.click('button.tab[data-subtab-pf="bands"]').catch(()=>{});
  await page.waitForTimeout(180);
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  const errs = [], dialogs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('dialog', async d => { dialogs.push(d.message()); await d.accept(); });

  await page.goto('file://' + BUILD, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  log('=== loaded; console errors:', errs.length); errs.forEach(e => log('  ', e));

  // Read the initial oracle so K straddles it.
  const oracle0 = await page.evaluate(() => (typeof Store!=='undefined') ? Store.state.oracle : null);
  log('initial oracle:', oracle0);

  // ---- Add a long perp ----
  await page.click('button.tab[data-subtab="perps"]').catch(()=>{});
  await page.waitForTimeout(120);
  await page.fill('#perp-notional', '1');
  await page.fill('#perp-margin', '20000');
  await page.click('#btn-add-perp');
  await page.waitForTimeout(250);

  // ---- Bands: naked SOLD call (K=120000, above oracle) + bought put (K=90000, below) ----
  await page.click('button.tab[data-subtab="bands"]').catch(()=>{});
  await page.waitForTimeout(180);
  await page.fill('#band-notional', '0.05');
  await page.fill('#sold-inner', '120000');
  await page.locator('#sold-outer').fill('').catch(()=>{});
  await page.fill('#bought-inner', '68000');
  await page.locator('#bought-inner').press('Tab').catch(()=>{});
  await page.waitForTimeout(350);
  await page.screenshot({ path: out('01_inputs.png'), fullPage: true });

  const execDisabled = await page.locator('#btn-execute').isDisabled();
  log('Execute disabled?', execDisabled);
  dialogs.length = 0;
  if (!execDisabled) { await page.click('#btn-execute'); await page.waitForTimeout(450); }
  log('after execute dialogs:', JSON.stringify(dialogs));
  await page.screenshot({ path: out('02_after_execute.png'), fullPage: true });

  // ===== ITEM 4 regression: polar mark marker on its psi-curve (pricing view) =====
  await page.selectOption('#chart-select', 'pricing').catch(()=>{});
  await page.waitForTimeout(300);
  const pricingLit = await canvasLit(page, 'canvas-pricing');
  log('ITEM4 canvas-pricing lit:', JSON.stringify(pricingLit));
  await page.locator('#canvas-pricing').screenshot({ path: out('07_polar_mark_pricing.png') }).catch(()=>{});

  // ===== ITEM 2: chart strike-ray on curve view (live K/oracle) =====
  await page.selectOption('#chart-select', 'curve').catch(()=>{});
  await page.waitForTimeout(300);
  const curveLit = await canvasLit(page, 'canvas-curve');
  log('ITEM2 canvas-curve lit:', JSON.stringify(curveLit));
  await page.locator('#canvas-curve').screenshot({ path: out('08_curve_strikeray.png') }).catch(()=>{});

  // ===== ITEM 3: re-based payoff chart =====
  await page.selectOption('#chart-select', 'payoff').catch(()=>{});
  await page.waitForTimeout(300);
  const payoffLit = await canvasLit(page, 'canvas-payoff');
  log('ITEM3 canvas-payoff lit:', JSON.stringify(payoffLit));
  await page.locator('#canvas-payoff').screenshot({ path: out('09_payoff_rebased.png') }).catch(()=>{});

  // ===== ITEM 1 + 3 numeric: at the LIVE spot, chart leg frac vs table mark =====
  await gotoBands(page);
  const headers = await bandsHeaders(page);
  const liveDOM0 = await compMarks(page);
  const liveEng0 = await liveEngine(page);
  log('ITEM1 headers:', JSON.stringify(headers));
  log('ITEM3 liveEngine@spot:', JSON.stringify(liveEng0, null, 2));
  log('ITEM1 DOM comps@spot:', JSON.stringify(liveDOM0, null, 2));
  await page.screenshot({ path: out('05_bands_table_spot.png'), fullPage: true });

  // ===== ITEM 1: OTM->ITM crossover sweep through the dollar strike K =====
  // SOLD call K=120000: crossover (OTM->ITM) must land at oracle==120000, not below.
  const sweepOracles = [80000, 100000, 110000, 118000, 120000, 122000, 130000, 160000, 240000];
  const sweep = [];
  for (const orc of sweepOracles) {
    await setOracle(page, orc);
    await gotoBands(page);
    const cells = await compMarks(page);
    const eng = await liveEngine(page);
    sweep.push({ oracle: orc, cells, eng });
    const soldCell = cells.find(c => /SOLD/i.test(c.leg));
    log(`  oracle=${orc}: SOLD mark=${soldCell?.mark} strike=${soldCell?.strike}` +
        ` | eng.sold.thetaReg=${eng.bands?.[0]?.sold?.thetaReg?.toFixed?.(4)}` +
        ` sNormPool=${eng.sNormPool?.toFixed?.(4)} markEff=${eng.bands?.[0]?.sold?.tableMarkEff?.toFixed?.(4)}`);
  }
  await page.screenshot({ path: out('06_bands_table_ITM.png'), fullPage: true });

  // ===== ITEM 2: stale-theta drift check across the rebase =====
  // entry-frozen leg.inner vs live sNormStrike(pool,K) after the oracle moved.
  const driftCheck = sweep.map(s => ({
    oracle: s.oracle,
    sold_thetaEntry: s.eng.bands?.[0]?.sold?.thetaEntry,
    sold_thetaReg:   s.eng.bands?.[0]?.sold?.thetaReg,
    bought_thetaEntry: s.eng.bands?.[0]?.bought?.thetaEntry,
    bought_thetaReg:   s.eng.bands?.[0]?.bought?.thetaReg
  }));
  log('ITEM2 driftCheck:', JSON.stringify(driftCheck, null, 2));

  // restore oracle, capture chart ray at the live spot for item-2 visual
  await setOracle(page, oracle0);
  await page.click('button.page-nav-link[data-page="transact"]').catch(()=>{});
  await page.waitForTimeout(120);
  await page.selectOption('#chart-select', 'curve').catch(()=>{});
  await page.waitForTimeout(300);
  await page.locator('#canvas-curve').screenshot({ path: out('08b_curve_strikeray_restored.png') }).catch(()=>{});
  // rebase up and recapture: ray must move with oracle
  await setOracle(page, 160000);
  await page.click('button.page-nav-link[data-page="transact"]').catch(()=>{});
  await page.waitForTimeout(120);
  await page.selectOption('#chart-select', 'curve').catch(()=>{});
  await page.waitForTimeout(300);
  await page.locator('#canvas-curve').screenshot({ path: out('08c_curve_strikeray_rebased.png') }).catch(()=>{});
  await page.selectOption('#chart-select', 'payoff').catch(()=>{});
  await page.waitForTimeout(300);
  const payoffLitRebased = await canvasLit(page, 'canvas-payoff');
  await page.locator('#canvas-payoff').screenshot({ path: out('09b_payoff_rebased160k.png') }).catch(()=>{});

  fs.writeFileSync(out('trace.json'), JSON.stringify({
    consoleErrors: errs, dialogs, execDisabled, oracle0,
    item1_headers: headers,
    item1_3_liveSpot: { liveDOM0, liveEng0, payoffLit, payoffLitRebased },
    item1_sweep: sweep,
    item2_drift: driftCheck,
    item2_curveLit: curveLit,
    item4_pricingLit: pricingLit
  }, null, 2));

  await browser.close();
  log('=== DONE. evidence in', EVID);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });

// Live Playwright visual confirmation of v26b ITM/American build.
// Tester harness — drives the real UI in Chromium, captures pixels + DOM.
// Engine is a module-scoped const (NOT on window), so engine re-derivation
// here uses the SAME closed forms found in the source (markFrac / mark);
// the LIVE evidence is the rendered DOM mark cells + canvas pixels.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD  = path.join(ENGINE, 'builds', 'temporal_mvp_v26b_itm.html');
const EVID   = path.resolve(ENGINE, '..', 'evidence', 'v26b_pw');
fs.mkdirSync(EVID, { recursive: true });
const out = (n) => path.join(EVID, n);
const log = (...a) => console.log(...a);

// Engine closed forms transcribed from builds/temporal_mvp_v26b_itm.html lines
// 1645-1670 — used ONLY to cross-check the rendered values (oracle of record).
function markFrac(wing, theta, sNorm) {
  if (wing === 'call') return sNorm < theta ? sNorm / theta : 1;
  return sNorm > theta ? theta / sNorm : 1;
}
function markV(wing, theta, sNorm, g) {
  if (!(g > 1) || !(theta > 0) || !(sNorm > 0)) return markFrac(wing, theta, sNorm);
  if (wing === 'call') {
    const sNstar = theta * Math.pow((g + 1) / g, g);
    if (sNorm <= sNstar) return sNorm / ((g + 1) * sNstar);
    return 1 - Math.pow(sNorm / theta, -1 / g);
  } else {
    const sNstar = theta * Math.pow(g / (g + 1), g);
    if (sNorm >= sNstar) return sNstar / ((g + 1) * sNorm);
    return 1 - Math.pow(sNorm / theta, 1 / g);
  }
}

async function canvasLit(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let lit = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 10) lit++;
    return { W: cv.width, H: cv.height, litPixels: lit };
  }, id);
}

async function bandsTable(page) {
  return await page.evaluate(() => {
    const headers = [...document.querySelectorAll('#bands-table thead th')].map(th => th.textContent.trim());
    const rows = [...document.querySelectorAll('#bands-table tbody tr')].map(tr => ({
      cls: tr.className.trim(),
      ncells: tr.querySelectorAll('td').length,
      cells: [...tr.querySelectorAll('td')].map(td => ({ text: td.textContent.trim(), title: td.getAttribute('title') || '' }))
    }));
    return { headers, rows };
  });
}

async function compMarks(page) {
  return await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#bands-table tbody tr.pf-comp-row')];
    return rows.map(tr => {
      const tds = [...tr.querySelectorAll('td')];
      return { leg: tds[0].textContent.trim().replace(/\s+/g, ' '),
               strike: tds[1].textContent.trim(), oracle: tds[2].textContent.trim(),
               attrib: tds[3].textContent.trim(), mark: tds[4].textContent.trim() };
    });
  });
}

async function setOracle(page, orc) {
  await page.click('button.page-nav-link[data-page="transact"]').catch(()=>{});
  await page.click('button.tab[data-subtab="settings"]').catch(()=>{});
  await page.waitForTimeout(100);
  await page.fill('#kpi-oracle', String(orc));
  await page.locator('#kpi-oracle').press('Enter').catch(()=>{});
  await page.locator('#kpi-oracle').dispatchEvent('change').catch(()=>{});
  await page.waitForTimeout(250);
}
async function gotoBands(page) {
  await page.click('button.page-nav-link[data-page="portfolio"]').catch(()=>{});
  await page.waitForTimeout(150);
  await page.click('button.tab[data-subtab-pf="bands"]').catch(()=>{});
  await page.waitForTimeout(200);
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

  // ---- Add a long perp club ----
  await page.click('button.tab[data-subtab="perps"]').catch(()=>{});
  await page.waitForTimeout(150);
  await page.fill('#perp-notional', '1');
  await page.fill('#perp-margin', '20000');
  await page.click('#btn-add-perp');
  await page.waitForTimeout(300);

  // ---- Bands: NAKED sold call (no outer) + bought put ----
  await page.click('button.tab[data-subtab="bands"]').catch(()=>{});
  await page.waitForTimeout(200);
  await page.fill('#band-notional', '0.05');
  await page.fill('#sold-inner', '84000');
  await page.locator('#sold-outer').fill('').catch(()=>{});
  await page.fill('#bought-inner', '68000');
  await page.locator('#bought-inner').press('Tab').catch(()=>{});
  await page.waitForTimeout(400);
  await page.screenshot({ path: out('01_inputs.png'), fullPage: true });

  // ===== ITEM 4: polar mark-curve marker (trajectory view, canvas-ratio) =====
  await page.selectOption('#chart-select', 'trajectory').catch(()=>{});
  await page.waitForTimeout(300);
  const ratioLit = await canvasLit(page, 'canvas-ratio');
  log('ITEM4 canvas-ratio lit:', JSON.stringify(ratioLit));
  await page.locator('#canvas-ratio').screenshot({ path: out('02_polar_mark.png') }).catch(()=>{});
  // Re-derive: dot uses markFrac (src 3598); curve uses tan(atan)/tan(atan) == min(s/θ,θ/s).
  const polarSamples = [];
  for (const sNorm of [0.6, 0.85, 1.0, 1.3, 1.7]) for (const theta of [0.7, 1.0, 1.5]) {
    const wing = theta > sNorm ? 'call' : 'put';
    const dot = markFrac(wing, theta, sNorm);
    const curve = wing === 'call' ? sNorm / theta : theta / sNorm;  // analytic curve value at φ=atan(θ)
    polarSamples.push({ wing, theta, sNorm, dot: +dot.toFixed(6), curve: +curve.toFixed(6), diff: +Math.abs(dot - curve).toFixed(9) });
  }
  const polarMaxDiff = Math.max(...polarSamples.map(s => s.diff));
  log('ITEM4 dot-vs-curve maxDiff:', polarMaxDiff);

  // ===== ITEM 3: payoff chart legFraction (naked uncapped vs spread capped) =====
  await page.selectOption('#chart-select', 'payoff').catch(()=>{});
  await page.waitForTimeout(300);
  const payoffLit = await canvasLit(page, 'canvas-payoff');
  log('ITEM3 canvas-payoff lit:', JSON.stringify(payoffLit));
  await page.locator('#canvas-payoff').screenshot({ path: out('03_payoff.png') }).catch(()=>{});

  // ---- Execute the (naked call + put) band ----
  const execDisabled = await page.locator('#btn-execute').isDisabled();
  log('Execute disabled?', execDisabled);
  dialogs.length = 0;
  if (!execDisabled) { await page.click('#btn-execute'); await page.waitForTimeout(500); }
  log('after execute dialogs:', JSON.stringify(dialogs));
  await page.screenshot({ path: out('04_after_execute.png'), fullPage: true });

  // Re-derive legFraction sweep (src 3866): naked = mark() NO cap; spread = min(1,..)-min(1,..)
  const g = 2;
  const legSweep = [1.5, 1.0, 0.7, 0.5, 0.35, 0.2, 0.1].map(sNorm => ({
    sNorm,
    naked:  +markV('call', 1.0, sNorm, g).toFixed(4),
    spread: +(Math.min(1, markV('call', 1.2, sNorm, g)) - Math.min(1, markV('call', 0.8, sNorm, g))).toFixed(4)
  }));
  const nakedMax = Math.max(...legSweep.map(s => s.naked));
  const spreadMax = Math.max(...legSweep.map(s => s.spread));
  log('ITEM3 legSweep:', JSON.stringify(legSweep), 'nakedMax', nakedMax, 'spreadMax', spreadMax);

  // ===== ITEM 1: bands table headers + comp-row empty eff-strike cell =====
  await gotoBands(page);
  const tbl0 = await bandsTable(page);
  log('ITEM1 headers:', JSON.stringify(tbl0.headers));
  log('ITEM1 rows:', tbl0.rows.length, 'comp ncells:', tbl0.rows.filter(r=>r.cls.includes('pf-comp-row')).map(r=>r.ncells));
  await page.screenshot({ path: out('05_bands_table_80k.png'), fullPage: true });

  // ===== ITEM 2: OTM->ITM oracle sweep, read live mark cell each step =====
  const markSweep = [];
  for (const orc of [80000, 90000, 100000, 120000, 150000, 200000, 300000, 500000]) {
    await setOracle(page, orc);
    await gotoBands(page);
    const cells = await compMarks(page);
    markSweep.push({ oracle: orc, cells });
    log(`  oracle=${orc}:`, JSON.stringify(cells.map(c => ({ leg: c.leg.slice(0,18), K: c.strike, mark: c.mark }))));
  }
  await page.screenshot({ path: out('06_bands_table_ITM.png'), fullPage: true });
  const tblITM = await bandsTable(page);

  fs.writeFileSync(out('trace.json'), JSON.stringify({
    consoleErrors: errs, dialogs, execDisabled,
    item1: { headers: tbl0.headers, rows: tbl0.rows },
    item2: { markSweep, tableITM: tblITM },
    item3: { payoffLit, legSweep, nakedMax, spreadMax },
    item4: { ratioLit, polarMaxDiff, polarSamples }
  }, null, 2));

  await browser.close();
  log('=== DONE. evidence in', EVID);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });

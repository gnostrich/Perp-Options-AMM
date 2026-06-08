// Live Playwright visual confirmation of HEAD v26a.
// Tester harness — drives the real UI in Chromium, captures pixels + DOM.
// State is module-scoped (no window.Store), so we read via rendered DOM.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD  = path.join(ENGINE, 'builds', 'HEAD_temporal_mvp_v26a.html');
const EVID   = path.resolve(ENGINE, '..', 'evidence', 'v26a_pw');
fs.mkdirSync(EVID, { recursive: true });
const out = (n) => path.join(EVID, n);
const log = (...a) => console.log(...a);

async function canvasStats(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const d = ctx.getImageData(0, 0, W, H).data;
    let lit = 0, sumX = 0, sumY = 0, dotN = 0;
    let minCx = W, maxCx = 0, minCy = H, maxCy = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
      if (a < 10 || (r < 30 && g < 30 && b < 30)) continue;
      lit++;
      if (r > 230 && g > 230 && b > 230) { sumX += x; sumY += y; dotN++; }
      const teal = (g > 120 && b > 120 && r < 120);
      const pink = (r > 200 && g > 90 && g < 180 && b > 120 && b < 210);
      if (teal || pink) { if (x<minCx)minCx=x; if(x>maxCx)maxCx=x; if(y<minCy)minCy=y; if(y>maxCy)maxCy=y; }
    }
    return { W, H, litPixels: lit,
      dot: dotN ? { x:+(sumX/dotN).toFixed(1), y:+(sumY/dotN).toFixed(1), fx:+(sumX/dotN/W).toFixed(3), fy:+(sumY/dotN/H).toFixed(3), n: dotN } : null,
      curveBox: { minCx, maxCx, minCy, maxCy } };
  }, id);
}

// Read header spot, KPIs, event-log lines, and portfolio comp-rows from DOM.
async function domState(page) {
  return await page.evaluate(() => {
    const t = (sel) => { const e = document.querySelector(sel); return e ? e.textContent.trim() : null; };
    const logs = [...document.querySelectorAll('#event-log div')].map(d => d.textContent.trim());
    const compRows = [...document.querySelectorAll('tr.pf-comp-row')].map(tr =>
      [...tr.querySelectorAll('td')].map(td => td.textContent.trim()));
    return {
      hdrSpot: t('#hdr-pool-spot'),
      kpiSpot: t('#kpi-spot-usd'),
      kpiOracle: (document.querySelector('#kpi-oracle')||{}).value,
      pfStatus: t('#hdr-pf-status'),
      slip: t('#band-slippage'),
      logTail: logs.slice(-6),
      compRows
    };
  });
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

  // --- Add a perp (LONG club) so the band has attribution notional. ---
  await page.click('button.tab[data-subtab="perps"]').catch(()=>{});
  await page.waitForTimeout(150);
  await page.fill('#perp-notional', '1');       // 1 BTC long perp
  await page.fill('#perp-margin', '20000');
  await page.click('#btn-add-perp');
  await page.waitForTimeout(300);
  log('after add-perp dialogs:', JSON.stringify(dialogs));

  // --- Trade Bands subtab: enter OTM collar. spot=$80k. ---
  await page.click('button.tab[data-subtab="bands"]').catch(()=>{});
  await page.waitForTimeout(200);
  await page.screenshot({ path: out('01_initial.png'), fullPage: true });

  const pre = await canvasStats(page, 'canvas-curve');
  log('PRE curve canvas:', JSON.stringify(pre));
  await page.locator('#canvas-curve').screenshot({ path: out('02_curve_pre.png') });

  await page.fill('#band-notional', '0.05');    // 0.05 BTC band <= 1 BTC club
  await page.fill('#sold-inner', '84000');      // OTM call (>80k), gentle
  await page.fill('#bought-inner', '68000');    // OTM put  (<80k), gentle
  await page.locator('#bought-inner').press('Tab').catch(()=>{});
  await page.waitForTimeout(400);
  await page.screenshot({ path: out('03_inputs_filled.png'), fullPage: true });

  const slipText  = await page.locator('#band-slippage').textContent();
  const slipLabel = await page.locator('.summary-row:has(#band-slippage) .lbl').textContent().catch(()=>null);
  const slipTitle = await page.locator('.summary-row:has(#band-slippage) .info-icon').getAttribute('title').catch(()=>null);
  const execDisabled = await page.locator('#btn-execute').isDisabled();
  log('SLIP label:', JSON.stringify(slipLabel));
  log('SLIP value:', JSON.stringify(slipText));
  log('SLIP $-tooltip:', JSON.stringify(slipTitle));
  log('Execute disabled?', execDisabled);

  const prev = await canvasStats(page, 'canvas-curve');
  log('PREVIEW curve canvas:', JSON.stringify(prev));
  await page.locator('#canvas-curve').screenshot({ path: out('04_curve_preview.png') });

  dialogs.length = 0;
  if (!execDisabled) { await page.click('#btn-execute'); await page.waitForTimeout(500); }
  log('after execute dialogs:', JSON.stringify(dialogs));
  await page.screenshot({ path: out('05_after_execute.png'), fullPage: true });
  const postTrade = await canvasStats(page, 'canvas-curve');
  const slipPost = await page.locator('#band-slippage').textContent();
  log('POST-TRADE slip:', JSON.stringify(slipPost));
  log('POST-TRADE curve canvas:', JSON.stringify(postTrade));
  await page.locator('#canvas-curve').screenshot({ path: out('06_curve_posttrade.png') });

  // Portfolio page: read comp rows (Orig strike $ / Eff strike $).
  await page.click('button.page-nav-link[data-page="portfolio"]').catch(()=>{});
  await page.waitForTimeout(300);
  await page.click('button.tab[data-subtab-pf="bands"]').catch(()=>{});
  await page.waitForTimeout(300);
  const dom0 = await domState(page);
  log('PORTFOLIO @ oracle=80k comp rows:', JSON.stringify(dom0.compRows));
  log('  pfStatus:', dom0.pfStatus, '| hdrSpot:', dom0.hdrSpot);
  await page.screenshot({ path: out('07_portfolio_80k.png'), fullPage: true });

  // --- Item 4 + ratio chart: rebase oracle to 120k, re-read comp rows + ratio canvas ---
  await page.click('button.page-nav-link[data-page="transact"]').catch(()=>{});
  await page.click('button.tab[data-subtab="settings"]').catch(()=>{});
  await page.waitForTimeout(150);
  await page.fill('#kpi-oracle', '120000');
  await page.locator('#kpi-oracle').press('Enter').catch(()=>{});
  await page.locator('#kpi-oracle').dispatchEvent('change').catch(()=>{});
  await page.waitForTimeout(400);
  await page.click('button.tab[data-subtab="bands"]').catch(()=>{});
  await page.waitForTimeout(300);
  const postRebase = await canvasStats(page, 'canvas-curve');
  log('POST-REBASE(120k) curve canvas:', JSON.stringify(postRebase));
  await page.locator('#canvas-curve').screenshot({ path: out('08_curve_rebase120k.png') });

  await page.click('button.page-nav-link[data-page="portfolio"]').catch(()=>{});
  await page.waitForTimeout(300);
  await page.click('button.tab[data-subtab-pf="bands"]').catch(()=>{});
  await page.waitForTimeout(300);
  const dom1 = await domState(page);
  log('PORTFOLIO @ oracle=120k comp rows:', JSON.stringify(dom1.compRows));
  await page.screenshot({ path: out('09_portfolio_120k.png'), fullPage: true });

  // Second rebase 200k for a clear axis-rescale capture.
  await page.click('button.page-nav-link[data-page="transact"]').catch(()=>{});
  await page.click('button.tab[data-subtab="settings"]').catch(()=>{});
  await page.fill('#kpi-oracle', '200000');
  await page.locator('#kpi-oracle').press('Enter').catch(()=>{});
  await page.locator('#kpi-oracle').dispatchEvent('change').catch(()=>{});
  await page.waitForTimeout(400);
  await page.click('button.tab[data-subtab="bands"]').catch(()=>{});
  await page.waitForTimeout(300);
  const postRebase2 = await canvasStats(page, 'canvas-curve');
  log('POST-REBASE(200k) curve canvas:', JSON.stringify(postRebase2));
  await page.locator('#canvas-curve').screenshot({ path: out('10_curve_rebase200k.png') });

  fs.writeFileSync(out('trace.json'), JSON.stringify({
    consoleErrors: errs, dialogs,
    slipLabel, slipText, slipTitle, slipPost, execDisabled,
    canvas: { pre, prev, postTrade, postRebase, postRebase2 },
    dotFrac: { postTrade: postTrade && postTrade.dot, postRebase: postRebase && postRebase.dot, postRebase2: postRebase2 && postRebase2.dot },
    portfolio: { at80k: dom0, at120k: dom1 }
  }, null, 2));

  await browser.close();
  log('=== DONE. evidence in', EVID);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });

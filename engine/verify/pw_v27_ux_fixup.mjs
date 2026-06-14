// Fix-up probes for the v27 UX-restore test:
//  P1: v24 load-time Spot KPI values (parity baseline for the $30,344.83 finding)
//  P2: HEAD tau TRUE low (0.05, via keyboard arrows = the working stepper) vs high (1.5)
//  P3: over-size search through the REAL UI until the frozen-wing message appears
//  P4: spinner-arrow CLICK on a band input (sold-inner, arrows visible per CSS) vs tau (hidden)
//  P5: close-up screenshots of the tau field row (arrow affordance evidence)
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ENGINE, 'builds', 'HEAD_temporal_mvp_v27_wkurtosis.html');
const V24 = path.join(ENGINE, 'builds', 'temporal_mvp_v24_rebase_fixed_2.html');
const EVID = path.resolve(ENGINE, '..', 'evidence', 'v27_ux');
const out = (n) => path.join(EVID, n);

async function curveProfile(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const W = cv.width, H = cv.height;
    const colTop = new Array(W).fill(-1);
    let lit = 0;
    for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 4;
      if (d[i] + d[i + 1] + d[i + 2] > 180 && d[i + 3] > 40) { if (colTop[x] < 0) colTop[x] = y; lit++; }
    }
    return { W, H, lit, colTop };
  }, id);
}
function bandDiff(pa, pb, fa, fb) {
  if (!pa || !pb || pa.W !== pb.W) return null;
  const W = pa.W, a = Math.floor(W * fa), b = Math.ceil(W * fb);
  let diff = 0, n = 0, mx = 0;
  for (let x = a; x < b; x++) if (pa.colTop[x] >= 0 && pb.colTop[x] >= 0) {
    const dd = Math.abs(pa.colTop[x] - pb.colTop[x]); diff += dd; if (dd > mx) mx = dd; n++;
  }
  return n ? { mean: +(diff / n).toFixed(2), max: mx, n } : null;
}
async function clickSpinner(page, sel, dir) {
  const el = page.locator(sel);
  await el.hover();
  const box = await el.boundingBox();
  if (!box) return null;
  const x = box.x + box.width - 6;
  const y = dir === 'up' ? box.y + box.height * 0.27 : box.y + box.height * 0.73;
  await page.mouse.click(x, y);
  await page.waitForTimeout(250);
  return await el.inputValue();
}

(async () => {
  const R = {};
  const browser = await chromium.launch();

  // ---- P1: v24 baseline ----
  let page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await page.goto('file://' + V24, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  R.p1_v24 = await page.evaluate(() => ({
    spot: document.getElementById('kpi-spot')?.textContent.trim(),
    spotUsd: document.getElementById('kpi-spot-usd')?.textContent.trim(),
    w: document.getElementById('kpi-w')?.textContent.trim(),
    poolY: (typeof Store !== 'undefined') ? Store.state.pool.y : null,
    poolX: (typeof Store !== 'undefined') ? Store.state.pool.x : null,
  }));
  await page.close();

  // ---- HEAD page ----
  page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE:' + m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR:' + e.message));
  await page.goto('file://' + BUILD, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.selectOption('#chart-select', 'curve');
  await page.click('.tab[data-subtab="settings"]');
  await page.waitForTimeout(300);

  // ---- P5: close-up of the tau row (arrow affordance) ----
  const tauBox = await page.locator('#tau-input').boundingBox();
  await page.locator('#tau-input').hover();
  await page.screenshot({ path: out('C_08_tau_field_closeup.png'),
    clip: { x: tauBox.x - 160, y: tauBox.y - 30, width: 420, height: 90 } });

  // ---- P2: TRUE tau low/high via keyboard arrows ----
  await page.locator('#tau-input').focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowDown'); // 0.30 -> 0.05
  await page.waitForTimeout(450);
  R.p2_tauLow = await page.locator('#tau-input').inputValue();
  const profLow = await curveProfile(page, 'canvas-curve');
  await page.screenshot({ path: out('C_02_tau_low_005.png') });
  for (let i = 0; i < 29; i++) await page.keyboard.press('ArrowUp');  // 0.05 -> 1.50
  await page.waitForTimeout(450);
  R.p2_tauHigh = await page.locator('#tau-input').inputValue();
  const profHigh = await curveProfile(page, 'canvas-curve');
  await page.screenshot({ path: out('C_03_tau_high_150.png') });
  R.p2_elbow = bandDiff(profLow, profHigh, 0.32, 0.62);
  R.p2_leftWing = bandDiff(profLow, profHigh, 0.05, 0.18);
  R.p2_rightWing = bandDiff(profLow, profHigh, 0.84, 0.97);
  await page.evaluate(() => { const e = document.getElementById('tau-input'); e.value = '0.3'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(300);

  // ---- P4: spinner CLICK on band input (visible arrows) vs tau (hidden) ----
  await page.click('.tab[data-subtab="perps"]');
  await page.waitForTimeout(200);
  await page.click('#btn-add-perp');
  await page.waitForTimeout(300);
  await page.click('.tab[data-subtab="bands"]');
  await page.waitForTimeout(300);
  await page.fill('#band-notional', '0.05');
  await page.fill('#sold-inner', '120000');
  await page.fill('#bought-inner', '68000');
  await page.dispatchEvent('#bought-inner', 'input');
  await page.waitForTimeout(400);
  const si0 = await page.locator('#sold-inner').inputValue();
  const siUp = await clickSpinner(page, '#sold-inner', 'up');
  const siDown = await clickSpinner(page, '#sold-inner', 'down');
  R.p4_bandSpinner = { start: si0, afterClickUp: siUp, afterClickDown: siDown };
  await page.click('.tab[data-subtab="settings"]');
  await page.waitForTimeout(250);
  const t0 = await page.locator('#tau-input').inputValue();
  const tUp = await clickSpinner(page, '#tau-input', 'up');
  R.p4_tauSpinner = { start: t0, afterClickUp: tUp };
  await page.click('.tab[data-subtab="bands"]');
  await page.waitForTimeout(250);
  await page.fill('#sold-inner', '120000');
  await page.dispatchEvent('#sold-inner', 'input');
  await page.waitForTimeout(300);

  // ---- P3: over-size search through the real UI ----
  R.p3_sizes = [];
  for (const n of [50, 100, 200, 500, 1000, 5000]) {
    await page.fill('#band-notional', String(n));
    await page.dispatchEvent('#band-notional', 'input');
    await page.waitForTimeout(400);
    const r = {
      n,
      warn: await page.evaluate(() => document.getElementById('warn-area').textContent.trim()),
      executeDisabled: await page.evaluate(() => document.getElementById('btn-execute').disabled),
      slippage: await page.evaluate(() => document.getElementById('band-slippage').textContent.trim()),
    };
    R.p3_sizes.push(r);
    if (/frozen-wing/i.test(r.warn)) {
      await page.screenshot({ path: out('C_06_wing_message_N' + n + '.png') });
      break;
    }
  }
  R.consoleErrors = errs;
  await browser.close();
  fs.writeFileSync(out('trace_ux_fixup.json'), JSON.stringify(R, null, 2));
  console.log(JSON.stringify(R, (k, v) => k === 'colTop' ? undefined : v, 2));
})();

// v28 CONTWARP — canvas-only mid-frame captures of the sweep (visual evidence).
// Stages the same one-sided band (step-1, 0.5 BTC), retriggers the sweep, and
// element-screenshots #canvas-pricing during + after it. READ-ONLY.
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BUILD = path.resolve('builds/temporal_mvp_v28_lens_contwarp.html');
const OUT = path.resolve('../evidence/v28_contwarp');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1500, height: 1000 } })).newPage();
  page.on('dialog', async d => d.dismiss());
  await page.goto('file://' + BUILD, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const transact = async () => { await page.click('.page-nav-link[data-page="transact"]'); await page.waitForTimeout(120); };
  await transact();
  await page.click('.tab[data-subtab="settings"]'); await page.waitForTimeout(100);
  await page.fill('#tau-input', '0.3'); await page.dispatchEvent('#tau-input', 'change'); await page.waitForTimeout(200);
  await page.click('.tab[data-subtab="bands"]'); await page.waitForTimeout(100);
  const dir = await page.evaluate(()=>document.getElementById('band-dir-sell')?.dataset.dir);
  if (dir !== 'long') { await page.click('#band-dir-sell'); await page.waitForTimeout(150); }
  await page.fill('#sold-inner', '100000'); await page.fill('#sold-outer', '');
  await page.fill('#bought-inner', '60000'); await page.fill('#bought-outer', '');
  await page.fill('#band-notional', '0.5');
  await page.dispatchEvent('#band-notional', 'input');
  await page.waitForTimeout(300);
  // step-1 (one-sided), stepper lives in the curve card
  await page.click('.tab[data-subtab="settings"]'); await page.waitForTimeout(100);
  await page.selectOption('#chart-select', 'curve'); await page.waitForTimeout(150);
  await page.click('#preview-step-1'); await page.waitForTimeout(200);
  await page.selectOption('#chart-select', 'pricing'); await page.waitForTimeout(1200);
  const cv = page.locator('#canvas-pricing');
  await cv.screenshot({ path: path.join(OUT, 'ZOOM_pre_landed.png') });
  // retrigger: drop + restore the notional
  await page.click('.tab[data-subtab="bands"]'); await page.waitForTimeout(100);
  await page.fill('#band-notional', ''); await page.dispatchEvent('#band-notional', 'input');
  await page.waitForTimeout(400);
  await cv.screenshot({ path: path.join(OUT, 'ZOOM_cleared_nopreview.png') });
  await page.fill('#band-notional', '0.5'); await page.dispatchEvent('#band-notional', 'input');
  await cv.screenshot({ path: path.join(OUT, 'ZOOM_sweep_t0.png') });
  await page.waitForTimeout(200);
  await cv.screenshot({ path: path.join(OUT, 'ZOOM_sweep_t200.png') });
  await page.waitForTimeout(250);
  await cv.screenshot({ path: path.join(OUT, 'ZOOM_sweep_t450.png') });
  await page.waitForTimeout(700);
  await cv.screenshot({ path: path.join(OUT, 'ZOOM_sweep_landed.png') });
  console.log('zoom shots written');
  await browser.close();
})();

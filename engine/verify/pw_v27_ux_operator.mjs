// v27 UX-RESTORE operator-playability test (operator entry 29: "do a quick UX test ...
// why has anything in the UX changed from the v24 case including default parameters?
// I mentioned also I dont want sliders anymore just updown arrows with appropriate
// sesicitivty"). Build under test: HEAD_temporal_mvp_v27_wkurtosis.html (md5 9d22cffd...).
// Drives the REAL UI (clicks, keyboard, spinner arrows) — not engine evaluate shortcuts.
// Evidence -> evidence/v27_ux/. Runs twice (A, B) for repro; v24 side-by-side once.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ENGINE, 'builds', 'HEAD_temporal_mvp_v27_wkurtosis.html');
const V24 = path.join(ENGINE, 'builds', 'temporal_mvp_v24_rebase_fixed_2.html');
const EVID = path.resolve(ENGINE, '..', 'evidence', 'v27_ux');
fs.mkdirSync(EVID, { recursive: true });
const out = (n) => path.join(EVID, n);

async function curveProfile(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const W = cv.width, H = cv.height;
    let lit = 0, minX = W, maxX = -1, minY = H, maxY = -1;
    const colTop = new Array(W).fill(-1);
    for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 4;
      if (d[i] + d[i + 1] + d[i + 2] > 180 && d[i + 3] > 40) {
        if (colTop[x] < 0) colTop[x] = y;
        lit++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    return { W, H, lit, colTop, fracW: +((maxX - minX) / W).toFixed(3), fracH: +((maxY - minY) / H).toFixed(3) };
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
const grabText = (page, id) => page.evaluate((i) => {
  const e = document.getElementById(i);
  return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.trim()) : null;
}, id);
async function nanSweep(page) {
  return await page.evaluate(() => {
    const vals = [...document.querySelectorAll('.kpi-val, .val, .stat-line .val, .derived-val, .sim-aid-label, .summary-row .val')]
      .map(e => e.textContent.trim()).filter(Boolean);
    return vals.filter(v => /\bnan\b|infinity|undefined/i.test(v));
  });
}
// Click the native number-input spinner arrow (up: top-right quadrant; down: bottom-right).
async function clickSpinner(page, sel, dir) {
  const el = page.locator(sel);
  await el.hover();
  const box = await el.boundingBox();
  if (!box) return null;
  const x = box.x + box.width - 6;
  const y = dir === 'up' ? box.y + box.height * 0.27 : box.y + box.height * 0.73;
  await page.mouse.click(x, y);
  await page.waitForTimeout(200);
  return await el.inputValue();
}

async function runOnce(tag) {
  const errs = [];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE:' + m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR:' + e.message));
  await page.goto('file://' + BUILD, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const T = { tag };

  // ===== ITEM 1: LOAD =====
  T.item1 = {};
  T.item1.kpis = {
    oracle: await grabText(page, 'kpi-oracle'),
    spot: await grabText(page, 'kpi-spot'),
    spotUsd: await grabText(page, 'kpi-spot-usd'),
    w: await grabText(page, 'kpi-w'),
  };
  T.item1.engine = await page.evaluate(() => {
    if (typeof Engine === 'undefined' || typeof Store === 'undefined') return { err: 'no Engine/Store' };
    const p = Store.state.pool;
    return { x: p.x, y: +p.y.toFixed(2), tau: p.tau, wMinus: p.wMinus, wPlus: p.wPlus,
             marginal: +Engine.getMP_raw(p).toFixed(3), oracle: Store.state.oracle };
  });
  T.item1.lpYdelta = await grabText(page, 'lp-y-delta');
  // perp form defaults (Create Perp is the default subtab)
  T.item1.perpForm = {
    notional: await grabText(page, 'perp-notional'),
    margin: await grabText(page, 'perp-margin'),
    leverage: await grabText(page, 'perp-leverage-display'),
    liqLong: await grabText(page, 'perp-liq-display'),
    notionalUsd: await grabText(page, 'perp-notional-usd'),
  };
  await page.selectOption('#perp-side', 'short');
  await page.waitForTimeout(150);
  T.item1.perpForm.liqShort = await grabText(page, 'perp-liq-display');
  await page.selectOption('#perp-side', 'long');
  await page.waitForTimeout(150);
  // curve visible
  await page.selectOption('#chart-select', 'curve');
  await page.waitForTimeout(450);
  const profLoad = await curveProfile(page, 'canvas-curve');
  T.item1.curve = profLoad ? { lit: profLoad.lit, fracW: profLoad.fracW, fracH: profLoad.fracH } : null;
  T.item1.nan = await nanSweep(page);
  await page.screenshot({ path: out(tag + '_01_load_default.png'), fullPage: false });

  // ===== ITEM 2: NO SLIDERS / stepper works =====
  T.item2 = {};
  T.item2.controls = await page.evaluate(() => {
    const inv = {};
    [...document.querySelectorAll('input, select')].forEach(e => {
      const k = e.tagName === 'SELECT' ? 'select' : 'input[' + (e.type || 'text') + ']';
      inv[k] = (inv[k] || 0) + 1;
    });
    inv.rangeCount = document.querySelectorAll('input[type=range]').length;
    inv.steps = [...document.querySelectorAll('input[type=number]')].map(e => ({ id: e.id, step: e.step || '(default 1)', value: e.value }));
    return inv;
  });
  // go to Settings, exercise the tau spinner with REAL mouse clicks on the arrows
  await page.click('.tab[data-subtab="settings"]');
  await page.waitForTimeout(300);
  const tau0 = await page.locator('#tau-input').inputValue();
  const profT0 = await curveProfile(page, 'canvas-curve');
  const tauUp = await clickSpinner(page, '#tau-input', 'up');
  const tauUpReadout = await grabText(page, 'tau-readout');
  const profT1 = await curveProfile(page, 'canvas-curve');
  const tauDown1 = await clickSpinner(page, '#tau-input', 'down');
  const tauDown2 = await clickSpinner(page, '#tau-input', 'down');
  const tauDownReadout = await grabText(page, 'tau-readout');
  // keyboard arrows as second stepper path
  await page.locator('#tau-input').focus();
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(150);
  const tauKeyUp = await page.locator('#tau-input').inputValue();
  T.item2.tauStepper = { start: tau0, afterClickUp: tauUp, readoutAfterUp: tauUpReadout,
    afterClickDown1: tauDown1, afterClickDown2: tauDown2, readoutAfterDown: tauDownReadout,
    afterKeyUp: tauKeyUp,
    curveRedrewOnStep: profT0 && profT1 ? bandDiff(profT0, profT1, 0.05, 0.95) : null };
  // restore default 0.30 via the input's own handler
  await page.evaluate(() => { const e = document.getElementById('tau-input'); e.value = '0.3'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(300);

  // ===== ITEM 3: PLAY THE KNOB (tau low vs high) =====
  // step DOWN from 0.30 by clicking the down arrow 5x -> 0.05
  for (let i = 0; i < 5; i++) await clickSpinner(page, '#tau-input', 'down');
  await page.waitForTimeout(400);
  T.item3 = { tauLow: await page.locator('#tau-input').inputValue() };
  const profLow = await curveProfile(page, 'canvas-curve');
  await page.screenshot({ path: out(tag + '_02_tau_low.png') });
  // step UP to high (0.05 -> 1.50 = 29 clicks; use keyboard arrows, same stepper)
  await page.locator('#tau-input').focus();
  for (let i = 0; i < 29; i++) { await page.keyboard.press('ArrowUp'); }
  await page.waitForTimeout(450);
  T.item3.tauHigh = await page.locator('#tau-input').inputValue();
  const profHigh = await curveProfile(page, 'canvas-curve');
  await page.screenshot({ path: out(tag + '_03_tau_high.png') });
  T.item3.elbow = bandDiff(profLow, profHigh, 0.32, 0.62);
  T.item3.leftWing = bandDiff(profLow, profHigh, 0.05, 0.18);
  T.item3.rightWing = bandDiff(profLow, profHigh, 0.84, 0.97);
  // restore 0.30
  await page.evaluate(() => { const e = document.getElementById('tau-input'); e.value = '0.3'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(350);

  // ===== ITEM 4: REAL UI TRADE =====
  T.item4 = {};
  await page.click('.tab[data-subtab="perps"]');
  await page.waitForTimeout(250);
  await page.click('#btn-add-perp');           // defaults: 0.1 BTC long, $1000 margin
  await page.waitForTimeout(350);
  await page.click('.tab[data-subtab="bands"]');
  await page.waitForTimeout(300);
  // dir default long => sold CALL (K > oracle), bought PUT (K < oracle)
  await page.fill('#band-notional', '0.05');
  await page.fill('#sold-inner', '120000');
  await page.fill('#bought-inner', '68000');
  await page.dispatchEvent('#bought-inner', 'input');
  await page.waitForTimeout(500);
  T.item4.warnPre = await page.evaluate(() => document.getElementById('warn-area').textContent.trim());
  T.item4.executeEnabled = await page.evaluate(() => !document.getElementById('btn-execute').disabled);
  T.item4.slippage = await grabText(page, 'band-slippage');
  T.item4.boughtNotional = await grabText(page, 'band-notional-bought-display');
  const profPre = await curveProfile(page, 'canvas-curve');
  await page.screenshot({ path: out(tag + '_04_pre_trade.png') });
  T.item4.preY = await page.evaluate(() => Store.state.pool.y);
  if (T.item4.executeEnabled) {
    await page.click('#btn-execute');
    await page.waitForTimeout(600);
  }
  T.item4.postY = await page.evaluate(() => Store.state.pool.y);
  T.item4.lpYdeltaPost = await grabText(page, 'lp-y-delta');
  T.item4.phiPost = await page.evaluate(() => Store.state.pool.phi);
  const profPost = await curveProfile(page, 'canvas-curve');
  T.item4.curveMoved = bandDiff(profPre, profPost, 0.05, 0.95);
  T.item4.nan = await nanSweep(page);
  T.item4.bandsCount = await page.evaluate(() => Store.state.bands.length);
  await page.screenshot({ path: out(tag + '_05_post_trade.png') });

  // ===== ITEM 5: OVER-SIZE -> frozen-wing message =====
  T.item5 = {};
  const trySize = async (n) => {
    await page.fill('#band-notional', String(n));
    await page.dispatchEvent('#band-notional', 'input');
    await page.waitForTimeout(450);
    return {
      n,
      warn: await page.evaluate(() => document.getElementById('warn-area').textContent.trim()),
      executeDisabled: await page.evaluate(() => document.getElementById('btn-execute').disabled),
    };
  };
  T.item5.sizes = [];
  for (const n of [50, 20, 5, 1]) {
    const r = await trySize(n);
    T.item5.sizes.push(r);
    if (/frozen-wing/i.test(r.warn) && !T.item5.shot) {
      await page.screenshot({ path: out(tag + '_06_wing_message.png') });
      T.item5.shot = true;
    }
  }
  // perp form screenshot
  await page.click('.tab[data-subtab="perps"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: out(tag + '_07_perp_form.png') });

  T.consoleErrors = errs;
  await browser.close();
  return T;
}

async function v24Compare() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await page.goto('file://' + V24, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const snap = async () => await page.evaluate(() => {
    const inv = {};
    [...document.querySelectorAll('input, select')].forEach(e => {
      const k = e.tagName === 'SELECT' ? 'select' : 'input[' + (e.type || 'text') + ']';
      inv[k] = (inv[k] || 0) + 1;
    });
    return {
      inv,
      oracle: document.getElementById('kpi-oracle')?.value,
      tabs: [...document.querySelectorAll('.tab[data-subtab]')].map(e => e.textContent.trim()),
      kpiLabels: [...document.querySelectorAll('.kpi-label')].map(e => e.textContent.trim()),
      chartOpts: [...document.querySelectorAll('#chart-select option')].map(e => e.textContent.trim()),
      perpDefaults: { notional: document.getElementById('perp-notional')?.value, margin: document.getElementById('perp-margin')?.value },
      numberSteps: [...document.querySelectorAll('input[type=number]')].map(e => ({ id: e.id, step: e.step, value: e.value })),
      settingsSections: [...document.querySelectorAll('.panel-section-title')].map(e => e.textContent.trim()),
    };
  });
  const v24 = await snap();
  await page.screenshot({ path: out('V24_01_load_default.png') });
  await page.goto('file://' + BUILD, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const v27 = await snap();
  await page.screenshot({ path: out('V27_01_load_default.png') });
  await browser.close();
  return { v24, v27 };
}

(async () => {
  const A = await runOnce('A');
  const B = await runOnce('B');
  const cmp = await v24Compare();
  const all = { runA: A, runB: B, v24compare: cmp };
  fs.writeFileSync(out('trace_ux_operator.json'), JSON.stringify(all, null, 2));
  console.log(JSON.stringify(all, (k, v) => k === 'colTop' ? undefined : v, 2));
})();

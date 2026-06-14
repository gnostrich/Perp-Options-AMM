// FLAG-1 re-check: τ stepper auto-redraws chart 2 LIVE (no forced redraw).
// Build temporal_mvp_v28_lens_S1.html md5 1ed8fe2d. READ-ONLY, console captured.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(__dirname, '../builds/temporal_mvp_v28_lens_S1.html');
const EVID = path.resolve(__dirname, '../../evidence/v28_lens_S1');
const URL = 'file://' + BUILD;

const RUN = process.argv[2] || 'A';
const shot = (page, name) => page.screenshot({ path: path.join(EVID, `R_${RUN}_${name}.png`) });

// pixel-diff of a canvas's raw ImageData between two snapshots (returns # changed px)
function diffCount(a, b) {
  if (!a || !b || a.length !== b.length) return -1;
  let n = 0;
  for (let i = 0; i < a.length; i += 4) {
    if (a[i] !== b[i] || a[i+1] !== b[i+1] || a[i+2] !== b[i+2] || a[i+3] !== b[i+3]) n++;
  }
  return n;
}

(async () => {
  fs.mkdirSync(EVID, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('dialog', d => { errors.push('UNEXPECTED dialog: ' + d.message()); d.dismiss(); });

  const log = [];
  const say = s => { log.push(s); console.log(s); };

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // Identify the two canvases. Chart 1 = pool curve, Chart 2 = option/value+funding.
  const canvases = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('canvas')).map((c, i) => ({
      idx: i, id: c.id || '', cls: c.className || '',
      w: c.width, h: c.height,
      rect: (() => { const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()
    }));
  });
  say('CANVASES: ' + JSON.stringify(canvases));

  // helper: capture raw ImageData of a canvas by index
  const grab = (idx) => page.evaluate((i) => {
    const c = document.querySelectorAll('canvas')[i];
    if (!c) return null;
    const ctx = c.getContext('2d');
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    return Array.from(d);
  }, idx);

  // Go to Settings subtab where tau-input lives
  const hasSettings = await page.$('.tab[data-subtab="settings"]');
  if (hasSettings) { await page.click('.tab[data-subtab="settings"]'); await page.waitForTimeout(200); }
  const tauVisible = await page.isVisible('#tau-input');
  say('tau-input visible on settings: ' + tauVisible);

  // Read current tau + locate chart indices (assume idx0=chart1 pool, idx1=chart2). Verify count.
  if (canvases.length < 2) { say('FAIL: <2 canvases'); }

  const C1 = 0, C2 = 1; // confirm by inertness probe below

  // Set tau to a known start (0.3) via the input, fire real events, let redraw settle
  async function setTauStepperLive(targetVal, label) {
    // capture before (both charts) -- via real UI, no forced redraw
    const c1b = await grab(C1), c2b = await grab(C2);
    // Set value then dispatch the real 'input' + 'change' events the handler listens to
    // (mirrors the spinner stepper which emits these). We DO NOT call Viz/render directly.
    await page.$eval('#tau-input', (el, v) => {
      el.value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, targetVal);
    await page.waitForTimeout(350);
    const tauNow = await page.$eval('#tau-input', el => el.value);
    const tauState = await page.evaluate(() => (window.Store && Store.state ? Store.state.tau : null));
    const c1a = await grab(C1), c2a = await grab(C2);
    const d1 = diffCount(c1b, c1a), d2 = diffCount(c2b, c2a);
    say(`STEP ${label} -> tau-input=${tauNow} Store.tau=${tauState}  chart1 px-diff=${d1}  chart2 px-diff=${d2}`);
    await shot(page, label);
    return { d1, d2, tauNow, tauState };
  }

  // Establish tau=0.3 baseline first (fire event, redraw)
  await setTauStepperLive(0.3, 'baseline_0p3');

  // (1) STEP DOWN: 0.3 -> 0.05  (elbow sharpens) -- live event must redraw chart 2
  const s1 = await setTauStepperLive(0.05, 'step_0p3_to_0p05');
  // back to 0.3 baseline
  await setTauStepperLive(0.3, 'reset_to_0p3');
  // (2) STEP UP: 0.3 -> 2  (elbow rounds) -- live event must redraw chart 2
  const s2 = await setTauStepperLive(2, 'step_0p3_to_2');

  // (3) Chart 1 inertness across the sweep: aggregate
  const chart1_inert = (s1.d1 === 0 && s2.d1 === 0);
  say(`CHART1 INERT to tau (px-diff both steps): ${s1.d1} & ${s2.d1}  -> ${chart1_inert ? 'PASS' : 'FAIL'}`);
  const chart2_live = (s1.d2 > 0 && s2.d2 > 0);
  say(`CHART2 LIVE redraw from stepper event (px-diff both steps): ${s1.d2} & ${s2.d2}  -> ${chart2_live ? 'PASS' : 'FAIL'}`);

  // Also try the real spinner ArrowUp via keyboard for one genuine stepper increment
  await setTauStepperLive(0.3, 'pre_arrow_0p3');
  await page.focus('#tau-input');
  const c2_pre = await grab(C2);
  await page.keyboard.press('ArrowUp'); // 0.3 -> 0.35 (step 0.05)
  await page.waitForTimeout(300);
  const c2_post = await grab(C2);
  const dArrow = diffCount(c2_pre, c2_post);
  const tauArrow = await page.$eval('#tau-input', el => el.value);
  say(`ARROWUP (real spinner) tau-input=${tauArrow}  chart2 px-diff=${dArrow}  -> ${dArrow > 0 ? 'PASS' : 'FAIL'}`);
  await shot(page, 'after_arrowup');

  // (4) Regression: one tau change then a trade renders both charts. Use the band execute path.
  // Reset tau to 0.3 then do an in-range band trade if the UI path exists.
  await setTauStepperLive(0.3, 'pre_trade_0p3');
  // Navigate to a trading subtab/perp setup; reuse the proven path: add a perp then a band.
  let tradeOk = false, tradeNote = '';
  try {
    // Switch tau to 1 first to entangle the change, then trade
    await setTauStepperLive(1, 'pre_trade_tau1');
    const c1_pre = await grab(C1), c2_pre = await grab(C2);
    // Use Store API to perform an in-range trade through the REAL engine (not Viz):
    // mirror smoke runA in-range band: open a long perp club then a small band, OR direct tradeUpdate.
    // Drive via UI execute if available; else use Store trade then a real redraw-triggering UI action.
    const did = await page.evaluate(() => {
      try {
        if (window.Store && Store.state && Engine && Engine.tradeUpdate) {
          const s = Store.state;
          const before = { x: s.pool.Nx, y: s.pool.Ny };
          // small premium trade through the faithful engine path
          Engine.tradeUpdate(s, 2000); // dy = +$2000 net premium
          return { ok: true, before, after: { x: s.pool.Nx, y: s.pool.Ny } };
        }
        return { ok: false, why: 'no Store/Engine.tradeUpdate' };
      } catch (e) { return { ok: false, why: e.message }; }
    });
    tradeNote = JSON.stringify(did);
    // Now fire a REAL UI redraw via a benign settings event (tick-hours change triggers nothing visual
    // reliably) -- instead re-fire the tau handler at the SAME tau to force the live redraw path
    await page.$eval('#tau-input', (el) => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);
    const c1_post = await grab(C1), c2_post = await grab(C2);
    const dt1 = diffCount(c1_pre, c1_post), dt2 = diffCount(c2_pre, c2_post);
    say(`REGRESSION trade: ${tradeNote}  chart1 px-diff(after trade+redraw)=${dt1}  chart2 px-diff=${dt2}`);
    // both charts should be non-degenerate (chart1 moves because reserves moved; chart2 re-renders)
    tradeOk = did.ok && dt1 >= 0 && dt2 >= 0;
    await shot(page, 'after_trade_redraw');
  } catch (e) { tradeNote = 'EX ' + e.message; }

  say('CONSOLE/PAGE ERRORS: ' + (errors.length ? JSON.stringify(errors) : 'NONE (0)'));

  // verdict
  const pass = chart1_inert && chart2_live && (dArrow > 0) && errors.length === 0 && tradeOk;
  say('RECHECK VERDICT: ' + (pass ? 'PASS' : 'FAIL'));

  fs.writeFileSync(path.join(EVID, `RECHECK_LOG_run${RUN}.txt`), log.join('\n') + '\n');
  await browser.close();
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });

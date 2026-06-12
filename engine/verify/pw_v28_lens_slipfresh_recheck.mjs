// v28 polar-lens — TARGETED live re-check of the one-line slippage-refresh wire.
// Build: builds/HEAD_temporal_mvp_v28_lens.html (md5 7e1ae39b...). READ-ONLY.
// Only changed line vs FINAL (989752294): L2727 τ-input handler now also calls
// previewBand() so the band preview + slippage recompute when τ changes.
// Confirms: (1) band open ⇒ slippage shows; (2) τ stepper alone moves the slippage
// readout (non-stale, recomputes from τ); (3) chart-2 still reshapes on τ;
// (4) chart-1 inert to τ; (5) 0 console/page errors; (6) trade still executes + both charts render.
// Engine/Store reachable in evaluate; Viz/render are closure-only — drive via REAL UI handlers.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BUILD = path.resolve('builds/HEAD_temporal_mvp_v28_lens.html');
const OUT = path.resolve('../evidence/v28_lens_FINAL');
fs.mkdirSync(OUT, { recursive: true });
const url = 'file://' + BUILD;

const RUN = process.argv[2] || 'A';
const log = [];
const say = (s) => { console.log(s); log.push(s); };
const shot = async (page, name) => { await page.screenshot({ path: path.join(OUT, name) }); };

async function rawpix(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid); if (!cv) return null;
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let lit = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i+3] > 8 && !(d[i]>250&&d[i+1]>250&&d[i+2]>250)) lit++;
    }
    const rgb = []; for (let i=0;i<d.length;i+=4){rgb.push(d[i],d[i+1],d[i+2]);}
    return { lit, rgb };
  }, id);
}
function rgbDiff(a, b) {
  if (!a || !b || a.rgb.length !== b.rgb.length) return -1;
  let n = 0; for (let i = 0; i < a.rgb.length; i += 3) {
    if (a.rgb[i]!==b.rgb[i] || a.rgb[i+1]!==b.rgb[i+1] || a.rgb[i+2]!==b.rgb[i+2]) n++;
  }
  return n;
}

const VERDICTS = {};
const FLAGS = [];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 } });
  const page = await ctx.newPage();
  const consoleErrs = [], pageErrs = [], dialogs = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });
  page.on('pageerror', e => pageErrs.push(e.message + '\n' + (e.stack||'')));
  page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  async function gotoTransact() { await page.click('.page-nav-link[data-page="transact"]').catch(()=>{}); await page.waitForTimeout(150); }
  async function settings() { await gotoTransact(); await page.click('.tab[data-subtab="settings"]').catch(()=>{}); await page.waitForTimeout(120); }
  async function bands() { await gotoTransact(); await page.click('.tab[data-subtab="bands"]').catch(()=>{}); await page.waitForTimeout(120); }

  // τ via the REAL stepper change event (the wired handler under test).
  async function setTauEvent(v) {
    await settings();
    await page.fill('#tau-input', String(v));
    await page.dispatchEvent('#tau-input', 'change');
    await page.waitForTimeout(220);
  }
  // τ via a REAL keyboard ArrowUp on the focused stepper (genuine stepper event).
  async function tauArrow(dir) {
    await settings();
    await page.focus('#tau-input');
    await page.keyboard.press(dir === 'up' ? 'ArrowUp' : 'ArrowDown');
    await page.waitForTimeout(220);
  }
  async function readSlip() {
    return await page.evaluate(() => (document.getElementById('band-slippage')?.textContent || '').trim());
  }
  async function readTau() { return await page.evaluate(()=>Store.state.tau); }
  async function bandDir() { return await page.evaluate(()=>document.getElementById('band-dir-sell')?.dataset.dir); }
  async function setBandDir(dir) {
    await bands();
    const cur = await bandDir();
    if (cur !== dir) { await page.click('#band-dir-sell').catch(()=>{}); await page.waitForTimeout(150); }
    return await bandDir();
  }
  async function fillBand({sold_inner, sold_outer='', bought_inner, bought_outer='', notional}) {
    await bands();
    await page.fill('#sold-inner', String(sold_inner));
    await page.fill('#sold-outer', String(sold_outer));
    await page.fill('#bought-inner', String(bought_inner));
    await page.fill('#bought-outer', String(bought_outer));
    await page.fill('#band-notional', String(notional));
    await page.dispatchEvent('#band-notional', 'input');
    await page.waitForTimeout(250);
  }
  async function previewState() {
    return await page.evaluate(() => ({
      disabled: document.getElementById('btn-execute')?.disabled,
      warn: (document.getElementById('warn-area')?.textContent || '').trim(),
      slip: (document.getElementById('band-slippage')?.textContent || '').trim(),
      netcash: (document.getElementById('pv-net-cash')?.textContent || '').trim(),
    }));
  }

  say('============ v28 lens slip-refresh RE-CHECK — RUN ' + RUN + ' ============');
  say('build md5-key: 7e1ae39b (HEAD_temporal_mvp_v28_lens.html)');

  // ───────── STEP 1: open a band so a slippage number is showing
  say('\n===== STEP 1: open a band ⇒ slippage shows =====');
  await setTauEvent(0.3);                          // start at τ=0.3
  await page.selectOption('#chart-select', 'pricing').catch(()=>{});
  await page.waitForTimeout(200);
  // default pool w=0.5; sold-CALL OTM strikes must sit above pool spot (sNorm). Use a long band.
  const dir = await setBandDir('long');
  say('  band dir = ' + dir);
  // Valid OTM long band on default pool (oracle 80000, spot sNorm=1.0):
  // sold=CALL inner above oracle (θ>1), bought=PUT inner below oracle (θ<1).
  await fillBand({ sold_inner: 100000, bought_inner: 60000, notional: 0.05 });
  let ps = await previewState();
  say('  preview: disabled=' + ps.disabled + ' warn="' + ps.warn + '" slip=' + ps.slip + ' netcash=' + ps.netcash);
  if (ps.disabled || !/%/.test(ps.slip) || /^0?\.?0+\s*%$/.test(ps.slip.replace(/[^0-9.%]/g,''))) {
    // try a slightly different band if the default got rejected
    await fillBand({ sold_inner: 120000, bought_inner: 50000, notional: 0.1 });
    ps = await previewState();
    say('  retry preview: disabled=' + ps.disabled + ' warn="' + ps.warn + '" slip=' + ps.slip);
  }
  const slipAtBaseline = await readSlip();
  await shot(page, `R_${RUN}_S1_band_open_slip.png`);
  const step1ok = !ps.disabled && /%/.test(slipAtBaseline) && parseFloat(slipAtBaseline) > 0;
  VERDICTS.step1 = step1ok ? 'PASS' : 'FAIL';
  say('  STEP1 (band open, slippage>0 showing) = ' + VERDICTS.step1 + '  slip@τ=' + (await readTau()) + ' is ' + slipAtBaseline);

  // ───────── STEP 2: turn τ via the stepper WITHOUT re-touching the trade inputs ⇒ slippage moves
  say('\n===== STEP 2: τ stepper alone ⇒ slippage readout recomputes (non-stale) =====');
  const samples = [];
  // baseline already at 0.3
  samples.push({ tau: await readTau(), slip: await readSlip() });
  // τ -> 1.0 (no touch of band inputs)
  await setTauEvent(1.0);
  samples.push({ tau: await readTau(), slip: await readSlip() });
  await shot(page, `R_${RUN}_S2_tau1.0_slip.png`);
  // τ -> 0.1
  await setTauEvent(0.1);
  samples.push({ tau: await readTau(), slip: await readSlip() });
  await shot(page, `R_${RUN}_S2_tau0.1_slip.png`);
  // back to 0.3
  await setTauEvent(0.3);
  samples.push({ tau: await readTau(), slip: await readSlip() });
  // a genuine keyboard ArrowUp step too (0.3 -> 0.35) — the realest stepper event
  const slipBeforeArrow = await readSlip();
  await tauArrow('up');
  const slipAfterArrow = await readSlip();
  samples.push({ tau: await readTau(), slip: slipAfterArrow, note: 'ArrowUp from 0.3' });
  say('  τ→slip samples:');
  samples.forEach(s => say('    τ=' + s.tau + '  slip=' + s.slip + (s.note ? '  [' + s.note + ']' : '')));
  const numVals = samples.map(s => parseFloat(s.slip)).filter(Number.isFinite);
  const distinct = new Set(numVals.map(v => v.toFixed(6)));
  const arrowMoved = slipBeforeArrow !== slipAfterArrow;
  const movesAcrossRange = distinct.size >= 2;
  VERDICTS.step2 = (movesAcrossRange && arrowMoved) ? 'PASS' : 'FAIL';
  say('  distinct slip values across τ = ' + distinct.size + ' ; ArrowUp moved slip = ' + arrowMoved
      + ' (' + slipBeforeArrow + ' -> ' + slipAfterArrow + ')');
  say('  STEP2 (slippage recomputes from τ alone, non-stale) = ' + VERDICTS.step2);
  if (VERDICTS.step2 === 'FAIL') FLAGS.push('FLAG: slippage did NOT update on τ stepper — the previewBand wire did not take.');

  // ───────── STEP 3: chart-2 still reshapes on τ (regression — redraw still fires)
  say('\n===== STEP 3: chart-2 reshapes on τ (redraw regression) =====');
  await page.selectOption('#chart-select', 'pricing').catch(()=>{});
  await page.waitForTimeout(150);
  await setTauEvent(0.3);
  const c2b = await rawpix(page, 'canvas-pricing');
  await setTauEvent(2.0);
  const c2a = await rawpix(page, 'canvas-pricing');
  const d_c2 = rgbDiff(c2b, c2a);
  await shot(page, `R_${RUN}_S3_chart2_tau2.png`);
  VERDICTS.step3 = d_c2 > 100 ? 'PASS' : 'FAIL';
  say('  chart-2 px diff τ0.3→2 = ' + d_c2 + '  => STEP3 = ' + VERDICTS.step3);

  // ───────── STEP 4: chart-1 (plain v24 pool curve) inert to τ
  say('\n===== STEP 4: chart-1 inert to τ (0 px) =====');
  await setTauEvent(0.3);
  const c1b = await rawpix(page, 'canvas-curve');
  let c1max = 0;
  for (const t of [0.1, 1.0, 2.0, 3.0]) {
    await setTauEvent(t);
    const c1 = await rawpix(page, 'canvas-curve');
    const d = rgbDiff(c1b, c1);
    say('    chart-1 px diff τ0.3→' + t + ' = ' + d);
    c1max = Math.max(c1max, d);
  }
  await setTauEvent(0.3);
  VERDICTS.step4 = c1max === 0 ? 'PASS' : 'FAIL';
  say('  chart-1 max px diff across τ = ' + c1max + '  => STEP4 = ' + VERDICTS.step4);

  // ───────── STEP 6: trade still executes + both charts render (previewBand call didn't break trade path)
  say('\n===== STEP 6: trade executes, both charts render =====');
  await setBandDir('long');
  await fillBand({ sold_inner: 100000, bought_inner: 60000, notional: 0.05 });
  let ps6 = await previewState();
  if (ps6.disabled) {
    await fillBand({ sold_inner: 120000, bought_inner: 50000, notional: 0.1 });
    ps6 = await previewState();
  }
  const c1pre = await rawpix(page, 'canvas-curve');
  const c2pre = await rawpix(page, 'canvas-pricing');
  const nBefore = await page.evaluate(()=>Store.state.bands.length);
  const dlgBefore = dialogs.length;
  const execDisabled = await page.evaluate(()=>document.getElementById('btn-execute')?.disabled);
  if (!execDisabled) await page.click('#btn-execute'); else say('  STEP6 band preview disabled: warn="' + ps6.warn + '"');
  await page.waitForTimeout(350);
  const nAfter = await page.evaluate(()=>Store.state.bands.length);
  const c1post = await rawpix(page, 'canvas-curve');
  const c2post = await rawpix(page, 'canvas-pricing');
  const d_c1 = rgbDiff(c1pre, c1post);
  const d_c2t = rgbDiff(c2pre, c2post);
  await shot(page, `R_${RUN}_S6_after_trade.png`);
  const executed = nAfter > nBefore;
  say('  bands ' + nBefore + '→' + nAfter + ' executed=' + executed
      + '  chart-1 Δpx=' + d_c1 + '  chart-2 Δpx=' + d_c2t
      + '  newDialogs=' + JSON.stringify(dialogs.slice(dlgBefore)));
  VERDICTS.step6 = (executed && (c1post && c1post.lit > 0) && (c2post && c2post.lit > 0)) ? 'PASS' : 'FAIL';
  say('  STEP6 (trade executes, both charts lit) = ' + VERDICTS.step6);

  // ───────── STEP 5: console / page errors
  say('\n===== STEP 5: console / page errors across τ interactions =====');
  say('  console errors = ' + consoleErrs.length + '  pageerrors = ' + pageErrs.length);
  if (consoleErrs.length) consoleErrs.forEach(e => say('    [console] ' + e));
  if (pageErrs.length) pageErrs.forEach(e => say('    [pageerror] ' + e.split('\n')[0]));
  VERDICTS.step5 = (consoleErrs.length === 0 && pageErrs.length === 0) ? 'PASS' : 'FAIL';

  // ───────── summary
  say('\n================ VERDICTS (RUN ' + RUN + ') ================');
  Object.entries(VERDICTS).forEach(([k,v]) => say('  ' + k + ': ' + v));
  const allpass = Object.values(VERDICTS).every(v => v === 'PASS') && FLAGS.length === 0;
  say('  OVERALL: ' + (allpass ? 'PASS' : 'FAIL'));
  FLAGS.forEach(f => say('  ' + f));

  fs.writeFileSync(path.join(OUT, `RECHECK_RUN_${RUN}.txt`), log.join('\n') + '\n');
  await browser.close();
  process.exit(0);
})();

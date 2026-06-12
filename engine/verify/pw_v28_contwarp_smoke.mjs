// v28 CONTWARP — live smoke of the continuous trade-preview sweep (operator entry 158).
// Build: builds/temporal_mvp_v28_lens_contwarp.html (md5 4378bc11...). READ-ONLY.
// One delta vs HEAD 7e1ae39b: drawPricing = rAF wrapper (~0.8s sweep pre->post preview,
// each frame at its own 45-degree tangent center); old body renamed renderPricingFrame.
// Items: (1) sweep renders, final frame == clean-HEAD static preview, marker slides;
// (2) geometry: wings steepen, strike near sliding tangent point dips (the mechanic);
// (3) no animation when it shouldn't (unchanged/cleared/executed; chart-1 inert);
// (4) spot-regression: tau redraw, trade executes, 0 errors.
// rev B: retrigger keeps strikes filled (blank/refill NOTIONAL only); preview-step-1
// clicked under chart-select='curve' (the stepper lives in the curve card); notional
// 0.5 BTC for a legible sweep; post-execute sampled 2.2s (render() re-runs previewBand
// with inputs still filled -> ONE re-preview sweep is expected, must terminate).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BUILD = path.resolve('builds/temporal_mvp_v28_lens_contwarp.html');
const HEADB = path.resolve('builds/HEAD_temporal_mvp_v28_lens.html');
const OUT = path.resolve('../evidence/v28_contwarp');
fs.mkdirSync(OUT, { recursive: true });

const RUN = process.argv[2] || 'A';
const log = [];
const say = (s) => { console.log(s); log.push(s); };
const VERDICTS = {}; const FLAGS = [];

async function rawpix(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid); if (!cv) return null;
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let lit = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i+3] > 8 && !(d[i]>250&&d[i+1]>250&&d[i+2]>250)) lit++;
    const rgb = []; for (let i=0;i<d.length;i+=4){rgb.push(d[i],d[i+1],d[i+2]);}
    return { lit, rgb };
  }, id);
}
function rgbDiff(a, b) {
  if (!a || !b || a.rgb.length !== b.rgb.length) return -1;
  let n = 0; for (let i = 0; i < a.rgb.length; i += 3)
    if (a.rgb[i]!==b.rgb[i] || a.rgb[i+1]!==b.rgb[i+1] || a.rgb[i+2]!==b.rgb[i+2]) n++;
  return n;
}

async function boot(ctx, url, errs) {
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errs.console.push(m.text()); });
  page.on('pageerror', e => errs.page.push(e.message));
  page.on('dialog', async d => { errs.dialogs.push(d.message()); await d.dismiss(); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  return page;
}
async function transact(page) { await page.click('.page-nav-link[data-page="transact"]').catch(()=>{}); await page.waitForTimeout(120); }
async function settings(page) { await transact(page); await page.click('.tab[data-subtab="settings"]').catch(()=>{}); await page.waitForTimeout(100); }
async function bands(page) { await transact(page); await page.click('.tab[data-subtab="bands"]').catch(()=>{}); await page.waitForTimeout(100); }
async function setTau(page, v) {
  await settings(page);
  await page.fill('#tau-input', String(v));
  await page.dispatchEvent('#tau-input', 'change');
  await page.waitForTimeout(250);
}
async function setChart(page, view) {
  await settings(page);
  await page.selectOption('#chart-select', view).catch(()=>{});
  await page.waitForTimeout(150);
}
async function setBandDir(page, dir) {
  await bands(page);
  const cur = await page.evaluate(()=>document.getElementById('band-dir-sell')?.dataset.dir);
  if (cur !== dir) { await page.click('#band-dir-sell').catch(()=>{}); await page.waitForTimeout(150); }
  return await page.evaluate(()=>document.getElementById('band-dir-sell')?.dataset.dir);
}
async function fillBand(page, {sold_inner, bought_inner, notional}) {
  await bands(page);
  await page.fill('#sold-inner', String(sold_inner)); await page.fill('#sold-outer', '');
  await page.fill('#bought-inner', String(bought_inner)); await page.fill('#bought-outer', '');
  await page.fill('#band-notional', String(notional));
  await page.dispatchEvent('#band-notional', 'input');
}
async function clearBandAll(page) {
  await bands(page);
  await page.fill('#sold-inner', ''); await page.fill('#sold-outer', '');
  await page.fill('#bought-inner', ''); await page.fill('#bought-outer', '');
  await page.fill('#band-notional', '');
  await page.dispatchEvent('#band-notional', 'input');
  await page.waitForTimeout(300);
}
// drop ONLY the notional (strikes stay) -> preview clears, ready to retrigger
async function dropNotional(page) {
  await bands(page);
  await page.fill('#band-notional', '');
  await page.dispatchEvent('#band-notional', 'input');
  await page.waitForTimeout(350);
}
// In-page: restore the notional (retrigger sweep: cleared key -> new key) and
// sample canvas hashes on a tight timer through + past the 800ms sweep.
async function triggerAndSample(page, notional, canvasId, otherId, durMs) {
  return await page.evaluate(({notional, canvasId, otherId, durMs}) => new Promise(res => {
    const hash = (cid) => {
      const cv = document.getElementById(cid);
      const d = cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
      let h = 0, lit = 0;
      for (let i = 0; i < d.length; i += 4) {
        h = (h * 31 + d[i] + d[i+1]*7 + d[i+2]*13) | 0;
        if (d[i+3] > 8 && !(d[i]>250&&d[i+1]>250&&d[i+2]>250)) lit++;
      }
      return h + ':' + lit;
    };
    const el = document.getElementById('band-notional');
    el.value = String(notional);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    const staged = !!window.__previewPool;
    const t0 = performance.now();
    const samples = [];
    const tick = () => {
      const t = performance.now() - t0;
      samples.push({ t: Math.round(t), main: hash(canvasId), other: otherId ? hash(otherId) : null });
      if (t < durMs) setTimeout(tick, 70); else res({ staged, stagedEnd: !!window.__previewPool, samples });
    };
    setTimeout(tick, 15);
  }), {notional, canvasId, otherId, durMs});
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 } });
  const errs = { console: [], page: [], dialogs: [] };
  const errsHead = { console: [], page: [], dialogs: [] };

  say('============ v28 CONTWARP smoke — RUN ' + RUN + ' ============');
  say('build: temporal_mvp_v28_lens_contwarp.html (4378bc11) vs HEAD 7e1ae39b');

  const page = await boot(ctx, 'file://' + BUILD, errs);
  await setTau(page, 0.3);

  // ───── ITEM 1a: stage a ONE-SIDED preview (after sold leg) and let the sweep land
  say('\n===== ITEM 1: sweep renders; final frame == clean-HEAD static =====');
  const dir = await setBandDir(page, 'long');
  await fillBand(page, { sold_inner: 100000, bought_inner: 60000, notional: 0.5 });
  await page.waitForTimeout(250);
  // the preview stepper lives in the CURVE chart card — select it, click step-1
  await setChart(page, 'curve');
  const b1state = await page.evaluate(()=>({ dis: document.getElementById('preview-step-1')?.disabled }));
  await page.click('#preview-step-1').catch(()=>{});
  await page.waitForTimeout(200);
  const stepNow = await page.evaluate(()=>window.__previewStep);
  say('  preview-step-1: disabled-before-click=' + b1state.dis + '  __previewStep after click=' + stepNow);
  await setChart(page, 'pricing');
  await page.waitForTimeout(1400);                        // sweep (800ms) fully lands
  const prev = await page.evaluate(() => ({
    step: window.__previewStep,
    pp: window.__previewPool ? { x: window.__previewPool.x, y: window.__previewPool.y } : null,
    pool: { x: Store.state.pool.x, y: Store.state.pool.y },
    w_pre: Engine.getW(Store.state.pool),
    w_post: window.__previewPool ? Engine.getW(window.__previewPool) : null,
    tau: Store.state.tau,
  }));
  say('  dir=' + dir + ' step=' + prev.step + ' tau=' + prev.tau);
  say('  pool  x=' + prev.pool.x.toFixed(6) + ' y=' + prev.pool.y.toFixed(2) + ' w=' + prev.w_pre.toFixed(6));
  say('  prevP x=' + (prev.pp&&prev.pp.x.toFixed(6)) + ' y=' + (prev.pp&&prev.pp.y.toFixed(2)) + ' w=' + (prev.w_post&&prev.w_post.toFixed(6)));
  const finalRgb = await rawpix(page, 'canvas-pricing');
  await page.screenshot({ path: path.join(OUT, `R_${RUN}_I1_final_landed.png`) });

  // clean-HEAD side-by-side: same tau / dir / band / step-1, static draw
  const headPage = await boot(ctx, 'file://' + HEADB, errsHead);
  await setTau(headPage, 0.3);
  await setBandDir(headPage, 'long');
  await fillBand(headPage, { sold_inner: 100000, bought_inner: 60000, notional: 0.5 });
  await headPage.waitForTimeout(250);
  await setChart(headPage, 'curve');
  await headPage.click('#preview-step-1').catch(()=>{});
  await headPage.waitForTimeout(200);
  await setChart(headPage, 'pricing');
  await headPage.waitForTimeout(400);
  const headPrev = await headPage.evaluate(() => ({
    step: window.__previewStep,
    pp: window.__previewPool ? { x: window.__previewPool.x, y: window.__previewPool.y } : null }));
  const headRgb = await rawpix(headPage, 'canvas-pricing');
  await headPage.screenshot({ path: path.join(OUT, `R_${RUN}_I1_HEAD_static.png`) });
  const dFinalHead = rgbDiff(finalRgb, headRgb);
  const ppMatch = prev.pp && headPrev.pp && prev.step === headPrev.step &&
    Math.abs(prev.pp.x - headPrev.pp.x) < 1e-9 && Math.abs(prev.pp.y - headPrev.pp.y) < 1e-9;
  say('  previewPool match vs HEAD = ' + ppMatch + '  (HEAD step=' + headPrev.step +
      ' x=' + (headPrev.pp&&headPrev.pp.x.toFixed(6)) + ' y=' + (headPrev.pp&&headPrev.pp.y.toFixed(2)) + ')');
  say('  final-frame px diff vs clean-HEAD static = ' + dFinalHead + '  (expect 0)');
  await headPage.close();

  // ───── ITEM 1b: the sweep itself — drop notional, retrigger, time-sample chart-2 (+chart-1)
  await dropNotional(page);
  const trig = await triggerAndSample(page, 0.5, 'canvas-pricing', 'canvas-curve', 1500);
  const samples = trig.samples;
  say('  retrigger staged immediately=' + trig.staged + '  staged at end=' + trig.stagedEnd);
  const sweepWindow = samples.filter(s => s.t < 800);
  const distinctSweep = new Set(sweepWindow.map(s => s.main)).size;
  const tail = samples.filter(s => s.t > 1000).map(s => s.main);
  const tailStable = new Set(tail).size === 1;
  const otherDistinct = new Set(samples.map(s => s.other)).size;
  say('  sweep samples (t ms -> chart2 hash:lit):');
  samples.forEach(s => say('    t=' + String(s.t).padStart(4) + '  ' + s.main + (s.t<800?'  [sweep]':'  [landed]')));
  say('  distinct chart-2 frames inside 800ms window = ' + distinctSweep + ' (expect >=4: continuous sweep)');
  say('  landed frames (t>1000ms) stable = ' + tailStable);
  say('  chart-1 distinct hashes across whole sweep = ' + otherDistinct + ' (expect 1: inert during animation)');
  const landedRgb = await rawpix(page, 'canvas-pricing');
  const dLandedFinal = rgbDiff(landedRgb, finalRgb);
  say('  retriggered landed frame px diff vs first landed frame = ' + dLandedFinal + ' (expect 0: deterministic landing)');

  // mid-frame screenshots: retrigger once more, shoot during the sweep
  await dropNotional(page);
  await page.fill('#band-notional', '0.5');
  await page.dispatchEvent('#band-notional', 'input');
  await page.screenshot({ path: path.join(OUT, `R_${RUN}_I1_mid1.png`) });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, `R_${RUN}_I1_mid2.png`) });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, `R_${RUN}_I1_mid3.png`) });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, `R_${RUN}_I1_landed2.png`) });

  VERDICTS.item1 = (distinctSweep >= 4 && tailStable && dFinalHead === 0 && ppMatch && dLandedFinal === 0) ? 'PASS' : 'FAIL';
  say('  ITEM1 (sweep renders, lands byte-equal to HEAD static) = ' + VERDICTS.item1);
  if (VERDICTS.item1 === 'FAIL') FLAGS.push('FLAG: sweep/landing mismatch — distinctSweep=' + distinctSweep + ' tailStable=' + tailStable + ' dFinalHead=' + dFinalHead + ' ppMatch=' + ppMatch + ' dLandedFinal=' + dLandedFinal);

  // ───── ITEM 2: geometry probes — marker slides; wings steepen; near-tangent strike dips.
  // Same Engine fns the renderer calls per frame: framePool s -> w, mode=(1-w)/w, gLoc(theta).
  say('\n===== ITEM 2: per-frame geometry (marker slide / wing steepen / tangent-point dip) =====');
  const geo = await page.evaluate(() => {
    const st = Store.state, pre = st.pool, post = window.__previewPool;
    if (!post) return null;
    const dy = post.y - pre.y;
    const out = [];
    for (const s of [0, 0.25, 0.5, 0.75, 1]) {
      const fp = (s === 1) ? post : (s === 0 ? pre : Engine.tradeUpdate(pre, dy * s));
      const w = Engine.getW(fp), mode = Engine.getSNorm(fp);
      const g = {};
      for (const th of [0.90, 0.93, 0.97, 1.25, 4.0]) g[th] = Engine.gLoc(fp, th, st.tau);
      out.push({ s, w, mode, gamma: w/(1-w), g });
    }
    return out;
  });
  if (geo) {
    say('  s     w        mode(45deg pt)  gamma    g(0.90)  g(0.93)  g(0.97)  g(1.25)  g(4.00)');
    geo.forEach(r => say('  ' + r.s.toFixed(2) + '  ' + r.w.toFixed(6) + '  ' + r.mode.toFixed(6) + '       ' +
      r.gamma.toFixed(4) + '   ' + [0.90,0.93,0.97,1.25,4.0].map(th => r.g[th].toFixed(4)).join('   ')));
    const modes = geo.map(r => r.mode);
    const markerSlides = modes.every((m,i) => i===0 || m < modes[i-1]) || modes.every((m,i) => i===0 || m > modes[i-1]);
    const wingSteepens = geo.every((r,i) => i===0 || r.g[4.0] >= geo[i-1].g[4.0]) && geo[4].g[4.0] > geo[0].g[4.0];
    // dip: a strike between mode(0) and mode(1) should have an interior minimum
    const crossed = [0.90, 0.93, 0.97].filter(th => (th - modes[0]) * (th - modes[4]) < 0);
    let dipSeen = false, dipTh = null, dipMin = null;
    for (const th of crossed) {
      const series = geo.map(r => r.g[th]);
      const minV = Math.min(...series), iMin = series.indexOf(minV);
      if (iMin > 0 && iMin < series.length - 1 && minV < series[0] && minV < series[series.length-1]) {
        dipSeen = true; dipTh = th; dipMin = minV;
      }
    }
    say('  marker (mode/45deg-tangent pt) slides monotonically: ' + markerSlides + '  (' + modes[0].toFixed(4) + ' -> ' + modes[4].toFixed(4) + ')');
    say('  wing theta=4 steepens through sweep: ' + wingSteepens + '  (' + geo[0].g[4.0].toFixed(4) + ' -> ' + geo[4].g[4.0].toFixed(4) + ')');
    say('  strikes crossed by sliding tangent pt: [' + crossed.join(', ') + ']  dip(interior min) seen=' + dipSeen +
        (dipSeen ? ' at theta=' + dipTh + ' min g=' + dipMin.toFixed(4) : ''));
    say('  NOTE: the dip IS the mechanic (skeptic caution) — frame center passes the strike, |u|->0, g_loc->0.');
    VERDICTS.item2 = (markerSlides && wingSteepens && (crossed.length === 0 || dipSeen)) ? 'PASS' : 'FAIL';
  } else { VERDICTS.item2 = 'FAIL'; FLAGS.push('FLAG: no previewPool for geometry probe'); }
  say('  ITEM2 (expected geometry) = ' + VERDICTS.item2);

  // ───── ITEM 3: no animation when it shouldn't
  say('\n===== ITEM 3: no sweep on unchanged / cleared / executed; chart-1 inert =====');
  // 3a unchanged preview: re-dispatch same input -> static (1 distinct frame)
  const same = await triggerAndSample(page, 0.5, 'canvas-pricing', null, 1100);
  const distinctSame = new Set(same.samples.map(s => s.main)).size;
  say('  3a unchanged preview re-dispatch: distinct chart-2 frames over 1.1s = ' + distinctSame + ' (expect 1)');
  // 3b clearing: blank inputs -> static, no loop
  await clearBandAll(page);
  const clr = [];
  for (let i = 0; i < 6; i++) { clr.push((await rawpix(page, 'canvas-pricing')).lit); await page.waitForTimeout(140); }
  const clrStable = new Set(clr).size === 1;
  const noPrev = await page.evaluate(()=>!window.__previewPool);
  say('  3b cleared: __previewPool null=' + noPrev + '  lit stable over 0.8s=' + clrStable + ' (lit=' + clr[0] + ')');
  // 3c executing: stage, land, execute. NOTE render() re-runs previewBand with the
  // inputs still filled -> ONE re-preview sweep against the NEW pool is expected
  // (preview genuinely changed); it must TERMINATE (stable tail), no loop.
  await setBandDir(page, 'long');
  await fillBand(page, { sold_inner: 100000, bought_inner: 60000, notional: 0.5 });
  await page.waitForTimeout(1300);
  const nBefore = await page.evaluate(()=>Store.state.bands.length);
  const dlgBefore = errs.dialogs.length;
  await page.click('#btn-execute');
  const execSamples = [];
  const tE0 = Date.now();
  while (Date.now() - tE0 < 2200) {
    execSamples.push({ t: Date.now() - tE0, lit: (await rawpix(page, 'canvas-pricing')).lit });
    await page.waitForTimeout(110);
  }
  const nAfter = await page.evaluate(()=>Store.state.bands.length);
  const prevAfterExec = await page.evaluate(()=>!!window.__previewPool);
  const tailExec = execSamples.filter(s => s.t > 1200).map(s => s.lit);
  const execTerminates = new Set(tailExec).size === 1;
  const execActivity = new Set(execSamples.filter(s => s.t <= 1200).map(s => s.lit)).size;
  say('  3c execute: bands ' + nBefore + '->' + nAfter + '  newDialogs=' + JSON.stringify(errs.dialogs.slice(dlgBefore)));
  say('     re-preview after execute (render->previewBand, inputs still filled) = ' + prevAfterExec +
      '  frames in first 1.2s = ' + execActivity + ' (1 = no sweep; >1 = one re-preview sweep, HEAD-inherited re-preview + new key)');
  say('     post-execute tail (t>1.2s) stable = ' + execTerminates + ' (MUST be true: no loop)');
  await page.screenshot({ path: path.join(OUT, `R_${RUN}_I3_after_execute.png`) });
  const chart1Inert = otherDistinct === 1; // measured during the live sweep in item 1b
  say('  3d chart-1 inert during sweep (from item-1b interleave) = ' + chart1Inert);
  VERDICTS.item3 = (distinctSame === 1 && clrStable && noPrev && (nAfter === nBefore + 1) && execTerminates && chart1Inert) ? 'PASS' : 'FAIL';
  say('  ITEM3 (no animation when it should not; execute terminates) = ' + VERDICTS.item3);

  // ───── ITEM 4: spot-regression — tau redraw (band cleared), errors
  say('\n===== ITEM 4: spot-regression =====');
  await clearBandAll(page);
  await setTau(page, 0.3);
  const c2a = await rawpix(page, 'canvas-pricing');
  await setTau(page, 2.0);
  const c2b = await rawpix(page, 'canvas-pricing');
  const dTau = rgbDiff(c2a, c2b);
  await setTau(page, 0.3);
  say('  tau 0.3->2.0 chart-2 px diff = ' + dTau + ' (expect >100)');
  say('  console errors=' + errs.console.length + '  pageerrors=' + errs.page.length +
      '  [HEAD page] console=' + errsHead.console.length + ' pageerrors=' + errsHead.page.length);
  errs.console.forEach(e => say('    [console] ' + e));
  errs.page.forEach(e => say('    [pageerror] ' + e));
  VERDICTS.item4 = (dTau > 100 && errs.console.length === 0 && errs.page.length === 0) ? 'PASS' : 'FAIL';
  say('  ITEM4 (tau redraw + trade executed in 3c + 0 errors) = ' + VERDICTS.item4);

  say('\n================ VERDICTS (RUN ' + RUN + ') ================');
  Object.entries(VERDICTS).forEach(([k,v]) => say('  ' + k + ': ' + v));
  const allpass = Object.values(VERDICTS).every(v => v === 'PASS') && FLAGS.length === 0;
  say('  OVERALL: ' + (allpass ? 'PASS' : 'FAIL'));
  FLAGS.forEach(f => say('  ' + f));

  fs.writeFileSync(path.join(OUT, `RUN_LOG_run${RUN}.txt`), log.join('\n') + '\n');
  await browser.close();
  process.exit(0);
})();

// Focused live smoke-pass — DEPICTION-ONLY caption/legend fix on HEAD
//   engine/builds/HEAD_temporal_mvp_v28_lens.html  (md5 aa1e5d05…)
// Operator flagged STALE legend/caption on "Mark Across Strikes": claimed mark=1 at the mode
// via an old min/max formula, but engine markLensed peaks BELOW 1 at the mode.
// Fix = 2 text lines (legend + caption). This confirms render text is corrected AND behavior unchanged.
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v28_caption_fix_smoke.mjs A
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/v28_caption_fix');
fs.mkdirSync(EVID, { recursive: true });
const LOG = [];
const log = (s) => { LOG.push(s); console.log(s); };
const shot = async (page, name, sel) => {
  const f = path.join(EVID, `${RUN}_${name}.png`);
  if (sel) { const el = await page.$(sel); if (el) { await el.screenshot({ path: f }); return f; } }
  await page.screenshot({ path: f, fullPage: true });
  return f;
};

const errors = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') { errors.push('console:' + m.text()); } });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
const dialogs = [];
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

await page.goto('file://' + BUILD);
await page.waitForTimeout(600);

log(`=== CAPTION-FIX SMOKE  run ${RUN}  build ${path.basename(BUILD)} ===`);
log(`md5(build)=${execSync('md5sum ' + BUILD).toString().split(' ')[0].trim()}`);

const showPricing = async () => page.evaluate(() => {
  const s = document.getElementById('chart-select'); s.value = 'pricing';
  s.dispatchEvent(new Event('change', { bubbles: true }));
});
const setM = async (m) => page.evaluate((mm) => {
  const el = document.getElementById('m-input');
  el.value = String(mm);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}, m);

// ---- 1 & 2: read RENDERED legend + caption text from the pricing view ----
await showPricing();
await page.waitForTimeout(300);

const texts = await page.evaluate(() => {
  const wrap = document.querySelector('.canvas-wrap[data-chart="pricing"]');
  const legendItems = [...wrap.querySelectorAll('.legend .legend-item')].map(e => e.textContent.trim());
  const caption = wrap.querySelector('.caption').textContent.trim();
  // the legend line that mentions mark = 1
  const markLine = legendItems.find(t => /mark\s*=\s*1/i.test(t)) || '(none found)';
  return { legendItems, markLine, caption };
});
log('--- RENDERED LEGEND ITEMS ---');
texts.legendItems.forEach((t, i) => log(`  [${i}] ${t}`));
log(`--- mark=1 LEGEND LINE: "${texts.markLine}"`);
log('--- RENDERED CAPTION ---');
log(`  ${texts.caption}`);

const legendOK = /mark\s*=\s*1\s*\(full exercise cap\)/i.test(texts.markLine);
const legendStale = /mark\s*=\s*1\s*\(mode\)/i.test(texts.markLine);
const capNewOK = /peaks at the mode strike/i.test(texts.caption)
  && /1\/\(\(g\+1\)·\(\(g\+1\)\/g\)\^g\)/.test(texts.caption)
  && /NOT at 1/i.test(texts.caption)
  && /full exercise/i.test(texts.caption);
const capStale = /min\(θ\s*,\s*θ_m\)/i.test(texts.caption) || /peaks at 1 at the mode/i.test(texts.caption);
log(`CHECK legend new-text="mark = 1 (full exercise cap)": ${legendOK ? 'PASS' : 'FAIL'}  (stale "(mode)" present: ${legendStale})`);
log(`CHECK caption smooth-paste-text present, no min/max stale: ${capNewOK && !capStale ? 'PASS' : 'FAIL'}  (stale present: ${capStale})`);

// ---- 3: analytic + pixel peak of the mark curve at default state (w=0.5, m=0.5 default? read it) ----
const state0 = await page.evaluate(() => {
  const st = Store.state.pool;
  const w = st.alpha / st.x;
  const gamma = w / (1 - w);
  const mInput = parseFloat(document.getElementById('m-input').value);
  const mode = Engine.getSNorm(st);
  const g = Engine.gLoc(st, mode, mInput);
  // analytic mark at the mode for each wing
  const psiCallMode = Engine.markLensed('call', mode, mode, g);
  const psiPutMode  = Engine.markLensed('put',  mode, mode, g);
  // smooth-paste closed form 1/((g+1)·((g+1)/g)^g)
  const sp = 1 / ((g + 1) * Math.pow((g + 1) / g, g));
  return { w, gamma, mInput, mode, g, psiCallMode, psiPutMode, sp };
});
log('--- DEFAULT STATE ---');
log(`  w=${state0.w}  gamma=${state0.gamma}  m(input)=${state0.mInput}  mode(sNorm)=${state0.mode}  g=m·γ=${state0.g}`);
log(`  markLensed(call,mode)=${state0.psiCallMode.toFixed(6)}  markLensed(put,mode)=${state0.psiPutMode.toFixed(6)}`);
log(`  closed-form smooth-paste 1/((g+1)·((g+1)/g)^g)=${state0.sp.toFixed(6)}`);

// PIXEL peak AT THE MODE COLUMN. Engine geometry (renderPricingFrame): pad={top:18,bottom:54,left:50,right:18},
// plotH=H-72, mode at phi=45deg => x = pad.left + 0.5*plotW. psi=1 at y=pad.top, psi=0 at y=pad.top+plotH.
// Read the pink put-tent apex in a narrow band around the mode column and map y->psi.
const pixelPeak = await page.evaluate(() => {
  const cv = document.getElementById('canvas-pricing');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const d = ctx.getImageData(0, 0, W, H).data;
  const at = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i+1], d[i+2], d[i+3]]; };
  const pad = { top: 18, bottom: 54, left: 50, right: 18 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const phiMode = 45;
  const xMode = Math.round(pad.left + (phiMode / 90) * plotW);
  const yToPsi = (y) => (pad.top + plotH - y) / plotH;
  // scan a +-4px column band at the mode; find topmost (smallest y) PINK put pixel and CYAN call pixel
  let pinkY = H, cyanY = H;
  for (let x = xMode - 4; x <= xMode + 4; x++) {
    for (let y = pad.top; y <= pad.top + plotH; y++) {
      const [r, g, b, a] = at(x, y);
      if (a < 40) continue;
      const pink = r > 180 && g > 90 && g < 180 && b > 130 && b < 200;
      const cyan = r < 160 && g > 150 && b > 150;
      if (pink && y < pinkY) pinkY = y;
      if (cyan && y < cyanY) cyanY = y;
    }
  }
  return {
    xMode, pad, plotH,
    pinkY, cyanY,
    psiPink: pinkY < H ? yToPsi(pinkY) : null,
    psiCyan: cyanY < H ? yToPsi(cyanY) : null,
  };
});
log('--- PIXEL PEAK AT MODE COLUMN (canvas-pricing, phi=45deg) ---');
log(`  mode column x=${pixelPeak.xMode}  pink-put apex y=${pixelPeak.pinkY} => psi=${pixelPeak.psiPink!=null?pixelPeak.psiPink.toFixed(4):'n/a'}  cyan-call y=${pixelPeak.cyanY} => psi=${pixelPeak.psiCyan!=null?pixelPeak.psiCyan.toFixed(4):'n/a'}`);
const psiFromPixel = pixelPeak.psiPink;
const pixelMatchesAnalytic = psiFromPixel != null && Math.abs(psiFromPixel - Math.max(0,0)) >= 0; // placeholder, set below

await shot(page, 'pricing_default', '.canvas-wrap[data-chart="pricing"]');
await shot(page, 'fullpage');

const peakAnalytic = Math.max(state0.psiCallMode, state0.psiPutMode);
const peakNotOne = peakAnalytic < 0.95;                       // must NOT be at 1
const peakNear38 = Math.abs(peakAnalytic - state0.sp) < 1e-6; // analytic == smooth-paste closed form
log(`CHECK analytic peak ${peakAnalytic.toFixed(4)} < 1 (not at full-exercise cap): ${peakNotOne ? 'PASS' : 'FAIL'}`);
log(`CHECK analytic peak == closed-form smooth-paste: ${peakNear38 ? 'PASS' : 'FAIL'}`);

// ---- 4: SLOPE MULT M knob still steepens; chart-1 unaffected ----
const chart2HashAt = async (m) => { await setM(m); await page.waitForTimeout(250); return page.evaluate(() => {
  const cv = document.getElementById('canvas-pricing'); const ctx = cv.getContext('2d');
  const d = ctx.getImageData(0,0,cv.width,cv.height).data; let lit=0,h=2166136261;
  for (let i=0;i<d.length;i+=4){const on=(d[i]|d[i+1]|d[i+2])>24&&d[i+3]>8;if(on)lit++;h^=d[i]^d[i+1]^d[i+2]^d[i+3];h=Math.imul(h,16777619);}
  return {lit,hash:(h>>>0).toString(16)};
}); };
const markAt = async (m) => page.evaluate((mm) => {
  const st = Store.state.pool; const mode = Engine.getSNorm(st); const g = Engine.gLoc(st, mode, mm);
  return { g, peak: Engine.markLensed('call', mode, mode, g) };
}, m);

// snapshot chart-1 (pool curve) BEFORE knob sweep (clear band influence is default at boot)
// CLEAR the boot band/preview (suggestStrikes leaves sold/bought-inner + band-notional => __previewPool
// ghost on chart-1 that depends on m). Clearing all three makes chart-1 truly inert to m.
await page.evaluate(() => {
  const clr = (id) => { const e = document.getElementById(id); if (e) { e.value=''; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); } };
  clr('band-notional'); clr('sold-inner'); clr('bought-inner');
  if (window.__previewPool !== undefined) window.__previewPool = null;
});
await page.waitForTimeout(200);
await page.evaluate(() => { const s = document.getElementById('chart-select'); s.value='curve'; s.dispatchEvent(new Event('change',{bubbles:true})); });
await page.waitForTimeout(200);
const chart1Hash = async () => page.evaluate(() => {
  const cv = document.getElementById('canvas-curve'); const ctx = cv.getContext('2d');
  const d = ctx.getImageData(0,0,cv.width,cv.height).data; let h=2166136261;
  for (let i=0;i<d.length;i+=4){h^=d[i]^d[i+1]^d[i+2]^d[i+3];h=Math.imul(h,16777619);} return (h>>>0).toString(16);
});
const c1_m1 = await (async()=>{await setM(1);await page.waitForTimeout(200);return chart1Hash();})();
const c1_m3 = await (async()=>{await setM(3);await page.waitForTimeout(200);return chart1Hash();})();
const c1_m6 = await (async()=>{await setM(6);await page.waitForTimeout(200);return chart1Hash();})();

await showPricing();
await page.waitForTimeout(200);
const h_m1 = await chart2HashAt(1); const mk_m1 = await markAt(1);
const h_m3 = await chart2HashAt(3); const mk_m3 = await markAt(3);
const h_m6 = await chart2HashAt(6); const mk_m6 = await markAt(6);
log('--- KNOB SWEEP (SLOPE MULT m) ---');
log(`  chart-1 (pool) hashes: m1=${c1_m1} m3=${c1_m3} m6=${c1_m6}  (expect IDENTICAL — pool inert to m)`);
log(`  chart-2 (mark) hashes: m1=${h_m1.hash}(lit ${h_m1.lit}) m3=${h_m3.hash}(lit ${h_m3.lit}) m6=${h_m6.hash}(lit ${h_m6.lit})`);
log(`  chart-2 mode-peak (g,psi): m1=(g${mk_m1.g},${mk_m1.peak.toFixed(4)}) m3=(g${mk_m3.g},${mk_m3.peak.toFixed(4)}) m6=(g${mk_m6.g},${mk_m6.peak.toFixed(4)})`);
const chart1Inert = (c1_m1 === c1_m3 && c1_m3 === c1_m6);
const chart2Steepens = (h_m1.hash !== h_m3.hash) && (h_m3.hash !== h_m6.hash) && (mk_m1.peak !== mk_m3.peak);
log(`CHECK chart-1 inert to m: ${chart1Inert ? 'PASS' : 'FAIL'}`);
log(`CHECK chart-2 steepens with m (distinct render + mark changes): ${chart2Steepens ? 'PASS' : 'FAIL'}`);

// pixel apex (at the mode column) should match the analytic peak within ~1 row (~0.01 psi)
const pixelMatch = (psiFromPixel != null) && Math.abs(psiFromPixel - peakAnalytic) < 0.02;
log(`CHECK pixel-apex(${psiFromPixel!=null?psiFromPixel.toFixed(4):'n/a'}) matches analytic peak(${peakAnalytic.toFixed(4)}) within 0.02: ${pixelMatch ? 'PASS' : 'FAIL'}`);

// restore default m for byte-stable capture
await setM(state0.mInput); await page.waitForTimeout(200);

log('--- ERRORS ---');
log(`  console errors: ${errors.filter(e=>e.startsWith('console:')).length}`);
log(`  page errors:    ${errors.filter(e=>e.startsWith('pageerror:')).length}`);
if (errors.length) errors.forEach(e => log('   ! ' + e));
log(`  dialogs: ${dialogs.length}`);

const result = {
  run: RUN,
  md5: execSync('md5sum ' + BUILD).toString().split(' ')[0].trim(),
  legend: { markLine: texts.markLine, legendOK, legendStale },
  caption: { text: texts.caption, capNewOK, capStale },
  peak: { analyticCall: state0.psiCallMode, analyticPut: state0.psiPutMode, closedForm: state0.sp,
          g: state0.g, mInput: state0.mInput, psiFromPixel, peakNotOne, peakNear38, pixelMatch },
  knob: { chart1: { m1: c1_m1, m3: c1_m3, m6: c1_m6, inert: chart1Inert },
          chart2: { m1: h_m1, m3: h_m3, m6: h_m6, steepens: chart2Steepens },
          marks: { m1: mk_m1, m3: mk_m3, m6: mk_m6 } },
  errors,
  dialogs,
  verdict: (legendOK && !legendStale && capNewOK && !capStale && peakNotOne && peakNear38
            && peakNotOne && peakNear38 && pixelMatch && chart1Inert && chart2Steepens && errors.length === 0) ? 'PASS' : 'FAIL'
};
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify(result, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
log(`=== VERDICT run ${RUN}: ${result.verdict} ===`);

await browser.close();

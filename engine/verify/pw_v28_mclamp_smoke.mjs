// LIVE clamp smoke — SLOPE MULT M = #m-input clamp to [1,6] on HEAD
//   engine/builds/HEAD_temporal_mvp_v28_lens.html  (md5 9f1e625b…)
// Operator typed m=0.1 (below baseline 1) and the curve dropped to an out-of-range state (peak ~0.70).
// Manager added a clamp to [1,6] in setM AND the input change-handler, with writeback to the field on 'change'.
// Also shortened the header badge to "Composite-Ray AMM · trusted-from-prover".
// This confirms the clamp LIVE (gate before push/merge).
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v28_mclamp_smoke.mjs A
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/v28_mclamp');
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

log(`=== M-CLAMP SMOKE  run ${RUN}  build ${path.basename(BUILD)} ===`);
log(`md5(build)=${execSync('md5sum ' + BUILD).toString().split(' ')[0].trim()}`);

const showPricing = async () => { await page.evaluate(() => {
  const s = document.getElementById('chart-select'); s.value = 'pricing';
  s.dispatchEvent(new Event('change', { bubbles: true }));
}); await page.waitForTimeout(300); };

// Set m by TYPING into #m-input and firing the real handlers (input then change).
const typeM = async (m) => { await page.evaluate((mm) => {
  const el = document.getElementById('m-input');
  el.value = String(mm);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}, m); await page.waitForTimeout(250); };

// Read field value + the engine's effective m / mode-peak.
const probe = async () => page.evaluate(() => {
  const fieldVal = document.getElementById('m-input').value;
  const stateM = Store.state.m;
  const st = Store.state.pool;
  const w = st.alpha / st.x;
  const gamma = w / (1 - w);
  const mode = Engine.getSNorm(st);
  const g = Engine.gLoc(st, mode, stateM);
  const peakCall = Engine.markLensed('call', mode, mode, g);
  const peakPut  = Engine.markLensed('put',  mode, mode, g);
  return { fieldVal, stateM, w, gamma, mode, g, peakCall, peakPut, peak: Math.max(peakCall, peakPut) };
});

// PIXEL mode-peak at phi=45deg column on canvas-pricing.
const pixelPeak = async () => page.evaluate(() => {
  const cv = document.getElementById('canvas-pricing');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const d = ctx.getImageData(0, 0, W, H).data;
  const at = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i+1], d[i+2], d[i+3]]; };
  const pad = { top: 18, bottom: 54, left: 50, right: 18 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const xMode = Math.round(pad.left + (45 / 90) * plotW);
  const yToPsi = (y) => (pad.top + plotH - y) / plotH;
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
  return { xMode, pinkY, cyanY,
    psiPink: pinkY < H ? yToPsi(pinkY) : null,
    psiCyan: cyanY < H ? yToPsi(cyanY) : null };
});

await showPricing();

// ---- baseline default (boot) ----
const base = await probe();
log('--- DEFAULT (boot) STATE ---');
log(`  field="${base.fieldVal}"  state.m=${base.stateM}  w=${base.w}  gamma=${base.gamma}  mode=${base.mode}  g=${base.g}`);
log(`  analytic mode-peak: call=${base.peakCall.toFixed(4)} put=${base.peakPut.toFixed(4)} max=${base.peak.toFixed(4)}`);
const basePx = await pixelPeak();
log(`  pixel mode-peak: pink psi=${basePx.psiPink!=null?basePx.psiPink.toFixed(4):'n/a'} cyan psi=${basePx.psiCyan!=null?basePx.psiCyan.toFixed(4):'n/a'}`);
await shot(page, 'default', '.canvas-wrap[data-chart="pricing"]');

// ---- CHECK 1+2: type m=0.1 (below min) -> clamp to 1, field snaps to "1" ----
await typeM(0.1);
const p01 = await probe();
const px01 = await pixelPeak();
log('--- TYPED m=0.1 (below min 1) ---');
log(`  field AFTER change="${p01.fieldVal}"  state.m=${p01.stateM}  g=${p01.g}  analytic peak=${p01.peak.toFixed(4)}`);
log(`  pixel mode-peak: pink psi=${px01.psiPink!=null?px01.psiPink.toFixed(4):'n/a'} cyan psi=${px01.psiCyan!=null?px01.psiCyan.toFixed(4):'n/a'}`);
await shot(page, 'm0_1_clamped', '.canvas-wrap[data-chart="pricing"]');
const c1_stateM = Math.abs(p01.stateM - 1) < 1e-9;
const c1_fieldSnap = (p01.fieldVal === '1');
const c1_peakNot070 = p01.peak < 0.40 && Math.abs(p01.peak - base.peak) < 1e-6; // == m=1 baseline, NOT ~0.70
const c1_pixelOK = px01.psiPink != null && Math.abs(px01.psiPink - p01.peak) < 0.03;
log(`CHECK1 curve renders at m=1 (state.m=1, peak==baseline ${base.peak.toFixed(4)}, NOT ~0.70): ${c1_stateM && c1_peakNot070 ? 'PASS' : 'FAIL'}`);
log(`CHECK2 field snaps to "1" on change: ${c1_fieldSnap ? 'PASS' : 'FAIL'} (got "${p01.fieldVal}")`);
log(`  (pixel peak ${px01.psiPink!=null?px01.psiPink.toFixed(4):'n/a'} matches analytic ${p01.peak.toFixed(4)}: ${c1_pixelOK})`);

// ---- CHECK 3: type m=10 (above max 6) -> clamp to 6, field snaps to "6" ----
await typeM(10);
const p10 = await probe();
const px10 = await pixelPeak();
log('--- TYPED m=10 (above max 6) ---');
log(`  field AFTER change="${p10.fieldVal}"  state.m=${p10.stateM}  g=${p10.g}  analytic peak=${p10.peak.toFixed(4)}`);
log(`  pixel mode-peak: pink psi=${px10.psiPink!=null?px10.psiPink.toFixed(4):'n/a'}`);
await shot(page, 'm10_clamped', '.canvas-wrap[data-chart="pricing"]');
const c3_stateM = Math.abs(p10.stateM - 6) < 1e-9;
const c3_fieldSnap = (p10.fieldVal === '6');
const c3_peakSmall = p10.peak < base.peak; // steeper => lower peak
log(`CHECK3 curve clamps at m=6 (state.m=6, peak ${p10.peak.toFixed(4)} < baseline, field="6"): ${c3_stateM && c3_fieldSnap && c3_peakSmall ? 'PASS' : 'FAIL'}`);

// ---- CHECK 4: type m=3 (in range) -> works, field stays 3 ----
await typeM(3);
const p3 = await probe();
const px3 = await pixelPeak();
log('--- TYPED m=3 (in range) ---');
log(`  field AFTER change="${p3.fieldVal}"  state.m=${p3.stateM}  g=${p3.g}  analytic peak=${p3.peak.toFixed(4)}`);
log(`  pixel mode-peak: pink psi=${px3.psiPink!=null?px3.psiPink.toFixed(4):'n/a'}`);
const c4_stateM = Math.abs(p3.stateM - 3) < 1e-9;
const c4_fieldStays = (p3.fieldVal === '3');
const c4_peakBetween = p3.peak < base.peak && p3.peak > p10.peak;
log(`CHECK4 in-range m=3 works (state.m=3, field="3", peak ${p3.peak.toFixed(4)} between m1 and m6): ${c4_stateM && c4_fieldStays && c4_peakBetween ? 'PASS' : 'FAIL'}`);

// ---- CHECK 5: header badge text ----
const header = await page.evaluate(() => {
  // the badge span near the top header
  const spans = [...document.querySelectorAll('span')].map(s => s.textContent.trim());
  const badge = spans.find(t => /Composite-Ray AMM/.test(t)) || '(none)';
  return { badge };
});
log('--- HEADER BADGE ---');
log(`  badge text: "${header.badge}"`);
const c5_badgeOK = /^Composite-Ray AMM\s*·\s*trusted-from-prover$/.test(header.badge);
const c5_noIdentities = !/Identities\s*I[–-]V/.test(header.badge);
log(`CHECK5 badge == "Composite-Ray AMM · trusted-from-prover", no "Identities I–V": ${c5_badgeOK && c5_noIdentities ? 'PASS' : 'FAIL'}`);

// ---- CHECK 6a: strike markers sit on curve with a band open (prior fix intact) ----
// Restore m=1 first.
await typeM(1);
// open a band: sold-call $120k, bought-put $48k, notional, dir long.
await page.evaluate(() => {
  const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = String(v); e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); } };
  // direction pill to long (sold-CALL above oracle / bought-PUT below)
  const dir = document.getElementById('band-dir-sell'); if (dir && dir.dataset.dir !== 'long') dir.click();
  set('sold-inner', 120000);
  set('bought-inner', 48000);
  set('band-notional', 0.03);
});
await page.waitForTimeout(300);
// switch the pricing chart mode to "Mark Across Strikes" if a selector exists; then read dot pixels.
const markMode = await page.evaluate(() => {
  // try a pricing-mode selector that toggles strike marks
  const sel = document.getElementById('pricing-mode') || document.getElementById('chart-pricing-mode');
  if (sel) { const opt = [...sel.options].find(o => /mark/i.test(o.textContent)); if (opt) { sel.value = opt.value; sel.dispatchEvent(new Event('change',{bubbles:true})); return 'set:'+opt.value; } }
  return 'no-selector';
});
log(`  pricing mark-mode selector: ${markMode}`);
await page.waitForTimeout(400);
await showPricing();
await page.waitForTimeout(300);
// census the specific dot colors colShort #FF6767 / colLong #14E800 on canvas-pricing, and check on-curve.
const dots = await page.evaluate(() => {
  const cv = document.getElementById('canvas-pricing');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const d = ctx.getImageData(0, 0, W, H).data;
  const pad = { top: 18, bottom: 54, left: 50, right: 18 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const toPsi = (y) => (pad.top + plotH - y) / plotH;
  let red = 0, green = 0;
  const reds = [], greens = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
    if (a < 40) continue;
    if (Math.abs(r-255)<24 && Math.abs(g-103)<24 && Math.abs(b-103)<24) { red++; reds.push([x,y]); }
    if (Math.abs(r-20)<28 && Math.abs(g-232)<28 && Math.abs(b-0)<24) { green++; greens.push([x,y]); }
  }
  const centroid = (a) => a.length ? [Math.round(a.reduce((s,p)=>s+p[0],0)/a.length), Math.round(a.reduce((s,p)=>s+p[1],0)/a.length)] : null;
  const rc = centroid(reds), gc = centroid(greens);
  return { red, green, redCentroid: rc, greenCentroid: gc,
    redPsi: rc ? toPsi(rc[1]) : null, greenPsi: gc ? toPsi(gc[1]) : null };
});
log('--- STRIKE MARKERS (band open, mark-across-strikes) ---');
log(`  red(#FF6767) px=${dots.red} centroid=${JSON.stringify(dots.redCentroid)} psi=${dots.redPsi!=null?dots.redPsi.toFixed(4):'n/a'}`);
log(`  green(#14E800) px=${dots.green} centroid=${JSON.stringify(dots.greenCentroid)} psi=${dots.greenPsi!=null?dots.greenPsi.toFixed(4):'n/a'}`);
await shot(page, 'band_marks', '.canvas-wrap[data-chart="pricing"]');
// markers should be present (>0) and sit at a lensed smooth-paste psi (~0.1-0.3), not floated ~0.85/0.95
const c6_markersPresent = dots.red > 0 && dots.green > 0;
const c6_onCurve = dots.redPsi != null && dots.greenPsi != null && dots.redPsi < 0.5 && dots.greenPsi < 0.5;
log(`CHECK6 strike markers present & on-curve (lensed psi<0.5, not floated ~0.85): ${c6_markersPresent && c6_onCurve ? 'PASS' : 'FAIL'}`);

// restore default m for byte-stable capture
await typeM(1);

log('--- ERRORS ---');
const consoleErrs = errors.filter(e=>e.startsWith('console:')).length;
const pageErrs = errors.filter(e=>e.startsWith('pageerror:')).length;
log(`  console errors: ${consoleErrs}`);
log(`  page errors:    ${pageErrs}`);
if (errors.length) errors.forEach(e => log('   ! ' + e));
log(`  dialogs: ${dialogs.length} ${JSON.stringify(dialogs)}`);

const c1 = c1_stateM && c1_fieldSnap && c1_peakNot070;
const c3 = c3_stateM && c3_fieldSnap && c3_peakSmall;
const c4 = c4_stateM && c4_fieldStays && c4_peakBetween;
const c5 = c5_badgeOK && c5_noIdentities;
const c6 = c6_markersPresent && c6_onCurve;
const noErr = consoleErrs === 0 && pageErrs === 0;

const result = {
  run: RUN,
  md5: execSync('md5sum ' + BUILD).toString().split(' ')[0].trim(),
  baseline: { fieldVal: base.fieldVal, stateM: base.stateM, peak: base.peak, gamma: base.gamma, g: base.g },
  check1_below: { fieldVal: p01.fieldVal, stateM: p01.stateM, peak: p01.peak, pixelPink: px01.psiPink, PASS: c1 },
  check2_fieldSnap1: { fieldVal: p01.fieldVal, PASS: c1_fieldSnap },
  check3_above: { fieldVal: p10.fieldVal, stateM: p10.stateM, peak: p10.peak, pixelPink: px10.psiPink, PASS: c3 },
  check4_inrange: { fieldVal: p3.fieldVal, stateM: p3.stateM, peak: p3.peak, pixelPink: px3.psiPink, PASS: c4 },
  check5_header: { badge: header.badge, PASS: c5 },
  check6_markers: { red: dots.red, green: dots.green, redPsi: dots.redPsi, greenPsi: dots.greenPsi, PASS: c6 },
  errors: { console: consoleErrs, page: pageErrs, list: errors },
  dialogs,
  verdict: (c1 && c3 && c4 && c5 && c6 && noErr) ? 'PASS' : 'FAIL'
};
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify(result, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
log(`=== VERDICT run ${RUN}: ${result.verdict} ===`);

await browser.close();

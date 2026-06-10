// FAST spot-check of build 1eebfcd6 — three display fixes (operator entry-29 residuals)
// 1. tau spinner up-arrow MOUSE-CLICKABLE (CSS un-hidden) -> 0.30 -> 0.35, curve/status updates
// 2. kpi-spot-usd = $80,000.00 ; kpi-spot = 1.0000 at load
// 3. hdr-pool-spot = "spot $80,000.00"
// + no console errors, screenshots per item.
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const build = path.resolve(here, '../builds/HEAD_temporal_mvp_v27_wkurtosis.html');
const evid = path.resolve(here, '../../evidence/v27_ux');
fs.mkdirSync(evid, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

await page.goto('file://' + build);
await page.waitForTimeout(1200);

const trace = { build: '1eebfcd6', when: new Date().toISOString() };

// ---- Item 2 + 3: load-state readouts ----
trace.load = await page.evaluate(() => ({
  kpiSpot: document.getElementById('kpi-spot').textContent,
  kpiSpotUsd: document.getElementById('kpi-spot-usd').textContent,
  hdrPoolSpot: document.getElementById('hdr-pool-spot').textContent,
  oracle: Store.state.oracle,
  mpRaw: Engine.getMP_raw(Store.state.pool),
}));
await page.screenshot({ path: path.join(evid, 'D_01_load_kpis.png'), fullPage: false });
// crop the KPI strip + header for legible evidence
const kpiBox = await page.locator('#kpi-spot-usd').boundingBox();
if (kpiBox) await page.screenshot({ path: path.join(evid, 'D_02_kpi_spot_crop.png'),
  clip: { x: Math.max(0, kpiBox.x - 420), y: Math.max(0, kpiBox.y - 60), width: 900, height: 160 } });
const hdrBox = await page.locator('#hdr-pool-spot').boundingBox();
if (hdrBox) await page.screenshot({ path: path.join(evid, 'D_03_hdr_pool_spot_crop.png'),
  clip: { x: Math.max(0, hdrBox.x - 40), y: Math.max(0, hdrBox.y - 40), width: 700, height: 120 } });

// ---- Item 1: tau spinner mouse-click ----
const tau = page.locator('#tau-input');
await tau.scrollIntoViewIfNeeded();
const before = await page.evaluate(() => ({
  tau: document.getElementById('tau-input').value,
  status: (document.getElementById('wcurve-status') || {}).textContent || null,
  curvePng: (document.getElementById('canvas-curve') || { toDataURL: () => null }).toDataURL
    ? document.getElementById('canvas-curve').toDataURL().slice(0, 64) : null,
  curveFull: document.getElementById('canvas-curve') ? document.getElementById('canvas-curve').toDataURL() : null,
}));
const box = await tau.boundingBox();
trace.tauBox = box;
// closeup BEFORE click — arrows visible? (compare C_08_tau_field_closeup.png baseline: hidden)
await page.screenshot({ path: path.join(evid, 'D_04_tau_field_closeup_now.png'),
  clip: { x: Math.max(0, box.x - 30), y: Math.max(0, box.y - 50), width: 420, height: 140 } });
// hover so the spinner is interactable, then click the UP arrow (top half of right edge)
await page.mouse.move(box.x + box.width - 8, box.y + box.height / 2);
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(evid, 'D_05_tau_field_hover.png'),
  clip: { x: Math.max(0, box.x - 30), y: Math.max(0, box.y - 50), width: 420, height: 140 } });
await page.mouse.click(box.x + box.width - 8, box.y + box.height * 0.27); // up arrow
await page.waitForTimeout(600);
const afterUp = await page.evaluate(() => ({
  tau: document.getElementById('tau-input').value,
  status: (document.getElementById('wcurve-status') || {}).textContent || null,
  storeTau: (Store.state.wcurve && Store.state.wcurve.tau !== undefined) ? Store.state.wcurve.tau
            : (Store.state.tau !== undefined ? Store.state.tau : null),
  curveFull: document.getElementById('canvas-curve') ? document.getElementById('canvas-curve').toDataURL() : null,
}));
await page.screenshot({ path: path.join(evid, 'D_06_tau_after_upclick.png'),
  clip: { x: Math.max(0, box.x - 30), y: Math.max(0, box.y - 50), width: 420, height: 140 } });
await page.screenshot({ path: path.join(evid, 'D_07_full_after_upclick.png') });
// down-arrow click back
await page.mouse.click(box.x + box.width - 8, box.y + box.height * 0.73); // down arrow
await page.waitForTimeout(400);
const afterDown = await page.evaluate(() => document.getElementById('tau-input').value);
trace.tau = {
  before: before.tau, afterUpClick: afterUp.tau, afterDownClick: afterDown,
  storeTauAfterUp: afterUp.storeTau,
  statusBefore: before.status, statusAfterUp: afterUp.status,
  curveChangedOnUp: before.curveFull !== null && afterUp.curveFull !== null && before.curveFull !== afterUp.curveFull,
};

// ---- Other settings fields show spinners (computed-style probe + closeups) ----
trace.spinnerStyle = await page.evaluate(() => {
  const out = {};
  for (const id of ['tau-input', 'wneg-input', 'wpos-input', 'perp-margin', 'w-neg', 'w-pos']) {
    const el = document.getElementById(id);
    if (!el) { out[id] = 'missing'; continue; }
    out[id] = getComputedStyle(el, '::-webkit-inner-spin-button').appearance
      + ' / opacity ' + getComputedStyle(el, '::-webkit-inner-spin-button').opacity;
  }
  // also dump actual ids of number inputs in the settings card
  out._numberInputIds = [...document.querySelectorAll('.field-input-wrap input[type=number]')].map(e => e.id);
  return out;
});
// closeup of the settings section (wing weights etc.)
const wrapBoxes = await page.evaluate(() => {
  const els = [...document.querySelectorAll('.field-input-wrap input[type=number]')];
  return els.map(e => { const r = e.getBoundingClientRect(); return { id: e.id, x: r.x, y: r.y, w: r.width, h: r.height }; });
});
trace.numberFields = wrapBoxes.map(b => b.id);
const wField = wrapBoxes.find(b => b.id && b.id !== 'tau-input' && b.y > 0);
if (wField) {
  await page.mouse.move(wField.x + wField.w - 8, wField.y + wField.h / 2);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evid, 'D_08_other_field_spinner.png'),
    clip: { x: Math.max(0, wField.x - 30), y: Math.max(0, wField.y - 50), width: 420, height: 140 } });
  trace.otherFieldShot = wField.id;
}

trace.consoleErrors = consoleErrors;
fs.writeFileSync(path.join(evid, 'trace_ux_spotcheck.json'), JSON.stringify(trace, null, 2));

// ---- verdicts ----
const v = [];
const tauPass = trace.tau.before === '0.3' && parseFloat(trace.tau.afterUpClick) === 0.35
  && (trace.tau.curveChangedOnUp || trace.tau.statusAfterUp !== trace.tau.statusBefore);
v.push(['1 tau up-arrow mouse-click 0.30->0.35 + curve/status update', tauPass, JSON.stringify(trace.tau)]);
v.push(['2 kpi-spot-usd $80,000.00 / kpi-spot 1.0000',
  trace.load.kpiSpotUsd === '$80,000.00' && trace.load.kpiSpot === '1.0000',
  `usd=${trace.load.kpiSpotUsd} spot=${trace.load.kpiSpot}`]);
v.push(['3 hdr-pool-spot "spot $80,000.00"', trace.load.hdrPoolSpot === 'spot $80,000.00',
  JSON.stringify(trace.load.hdrPoolSpot)]);
v.push(['no console errors', consoleErrors.length === 0, JSON.stringify(consoleErrors)]);
for (const [name, ok, detail] of v) console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + '  | ' + detail);
console.log('oracle=' + trace.load.oracle + ' mpRaw=' + trace.load.mpRaw);
console.log('spinnerStyle=' + JSON.stringify(trace.spinnerStyle));

await browser.close();
process.exit(v.every(x => x[1]) ? 0 : 1);

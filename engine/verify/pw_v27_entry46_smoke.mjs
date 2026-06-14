// STANDING UI SMOKE-PASS — entry-46 fixed HEAD (md5 928cde1c), READ-ONLY on the build.
// Fix-acceptance (intern's 4): (a) stale-on-reject cleared via clearBandPreviewOut;
// (b) band audit strip raw USD (no ×oracle double-count); (c) anchor (w=1/2) overlay
// through live reserves point sqrt(x*y); (d) tau disclosure sentence.
// Plus full smoke: perps long/short, bands both dirs + steppers + over-carve alert,
// earn deposit/withdraw, settings (tau click+sweep, wing clamp, oracle/rebase, arb,
// tick, kappa, tick-hours), portfolio render, export/import round-trip, reset.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(__dirname, '../builds/HEAD_temporal_mvp_v27_wkurtosis.html');
const OUT = path.resolve(__dirname, '../../evidence/v27_entry46_smoke');
fs.mkdirSync(OUT, { recursive: true });

const trace = { build: 'HEAD_temporal_mvp_v27_wkurtosis.html md5 928cde1c', date: new Date().toISOString(), items: {} };
const log = (...a) => console.log(...a);

let PHASE = 'boot';
const consoleLog = [];
const pageErrors = [];
const dialogs = [];

function wire(page) {
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleLog.push({ phase: PHASE, type: m.type(), text: m.text() }); });
  page.on('pageerror', e => pageErrors.push({ phase: PHASE, message: e.message, stack: (e.stack || '').split('\n').slice(0, 6).join('\n') }));
  page.on('dialog', async d => { dialogs.push({ phase: PHASE, type: d.type(), message: d.message() }); await d.dismiss(); });
}

async function setNum(page, id, val) {
  await page.fill('#' + id, '');
  if (val !== '' && val != null) await page.fill('#' + id, String(val));
  await page.dispatchEvent('#' + id, 'input');
  await page.dispatchEvent('#' + id, 'change');
}
async function shot(page, name) { await page.screenshot({ path: path.join(OUT, name + '.png') }); }
async function shotCanvas(page, name) {
  try { await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, name + '.png') }); }
  catch (e) { log('  (canvas shot failed:', e.message + ')'); }
}
async function capCanvas(page, tag) {
  return await page.evaluate((tag) => {
    window.__cap = window.__cap || {};
    const cv = document.getElementById('canvas-curve');
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    window.__cap[tag] = new Uint8ClampedArray(d);
    return { w: cv.width, h: cv.height };
  }, tag);
}
async function diffCanvas(page, a, b) {
  return await page.evaluate(({ a, b }) => {
    const A = window.__cap[a], B = window.__cap[b];
    if (!A || !B) return { error: 'missing capture' };
    const cv = document.getElementById('canvas-curve');
    const W = cv.width;
    let n = 0, minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
    for (let i = 0; i < A.length; i += 4) {
      if (A[i] !== B[i] || A[i + 1] !== B[i + 1] || A[i + 2] !== B[i + 2] || A[i + 3] !== B[i + 3]) {
        n++;
        const p = i / 4, x = p % W, y = (p - x) / W;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    return { diffPx: n, totalPx: A.length / 4, pct: +(100 * n / (A.length / 4)).toFixed(3), bbox: n ? [minX, minY, maxX, maxY] : null };
  }, { a, b });
}
// Analytic curveTraceW re-projection (entry-45 helper) for tau displacement in px.
async function traceDisplacement(page, overrideA, overrideB) {
  return await page.evaluate(({ oA, oB }) => {
    const p = Store.state.pool;
    function snap(ov) {
      return Object.assign({ x: p.x, y: p.y, tau: p.tau, wMinus: p.wMinus, wPlus: p.wPlus, phi: (typeof p.phi === 'number') ? p.phi : 0 }, ov || {});
    }
    function traceW(s) {
      const pts = []; const N = 400;
      const wm = 0.5 * (s.wMinus + s.wPlus), dw2 = 0.5 * (s.wPlus - s.wMinus), tau = s.tau;
      const phi = s.phi; const u0 = Math.log(s.y / s.x);
      const kCur = wm * Math.log(s.x) + (1 - wm) * Math.log(s.y) - dw2 * Math.sqrt(tau * tau + (u0 - phi) * (u0 - phi));
      const uC = 0.5 * (u0 + phi), uSpan = Math.max(Math.abs(u0 - phi), 0) * 0.5 + 6;
      for (let i = 0; i <= N; i++) {
        const u = uC - uSpan + 2 * uSpan * i / N;
        const lnx = kCur - (1 - wm) * u + dw2 * Math.sqrt(tau * tau + (u - phi) * (u - phi));
        const x = Math.exp(lnx), y = x * Math.exp(u);
        if (isFinite(x) && isFinite(y) && x > 0 && y > 0) pts.push([x, y, u]);
      }
      return pts;
    }
    const cv = document.getElementById('canvas-curve');
    const W = cv.width, H = cv.height;
    const pad = { top: 18, right: 18, bottom: 44, left: 64 };
    const plotW = W - pad.left - pad.right, plotH = H - pad.top - pad.bottom;
    const fr = window.__curveFrame; if (!fr) return { error: 'no frame cached' };
    const toPx = (x, y) => [pad.left + (x / fr.xMax) * plotW, pad.top + (1 - y / fr.yMax) * plotH];
    const A = traceW(snap(oA)), B = traceW(snap(oB));
    let maxD = 0, maxAt = null, inFrame = 0;
    for (let i = 0; i < Math.min(A.length, B.length); i++) {
      const [xa, ya, ua] = A[i], [xb, yb] = B[i];
      const ain = xa <= fr.xMax && ya <= fr.yMax, bin = xb <= fr.xMax && yb <= fr.yMax;
      if (!ain && !bin) continue;
      inFrame++;
      const [pxa, pya] = toPx(xa, ya), [pxb, pyb] = toPx(xb, yb);
      const d = Math.hypot(pxb - pxa, pyb - pya);
      if (d > maxD) { maxD = d; maxAt = { u: +ua.toFixed(3) }; }
    }
    return { maxDispPx: +maxD.toFixed(2), maxAt, inFramePts: inFrame };
  }, { oA: overrideA, oB: overrideB });
}

// Read EVERY preview-output field the stale fix must clear, plus warn/exec state.
async function previewOut(page) {
  return await page.evaluate(() => {
    const g = id => { const el = document.getElementById(id); return el ? (el.tagName === 'INPUT' ? el.value : el.textContent.trim()) : null; };
    const pvIds = ['pv-sold-theta','pv-sold-delta','pv-sold-mark','pv-sold-V','pv-bought-theta','pv-bought-delta','pv-bought-mark','pv-N-bought','pv-bought-V','pv-fN','pv-fE','pv-L0','pv-dy-sold','pv-dy-bought','pv-net-cash'];
    const pv = {}; pvIds.forEach(id => pv[id] = g(id));
    return {
      pv,
      boughtDisplay: g('band-notional-bought-display'),
      boughtSubline: g('band-notional-bought-subline'),
      sellSubline: g('band-notional-sell-subline'),
      deposit: g('band-deposit-notional'),
      slippage: g('band-slippage'),
      txfees: g('band-txfees'),
      modeSell: g('band-mode-sell'), modeBuy: g('band-mode-buy'),
      maxChip: g('band-sell-max'),
      dir: (document.getElementById('band-dir-sell') || { dataset: {} }).dataset.dir,
      warn: (document.getElementById('warn-area') || {}).innerText || '',
      executeDisabled: (document.getElementById('btn-execute') || {}).disabled
    };
  });
}
// STALE-CHECK: in a rejected state (warn non-empty) NO preview output may keep a number.
function staleCheck(o) {
  const staleFields = [];
  for (const [k, v] of Object.entries(o.pv)) if (v !== '—') staleFields.push(`${k}=${v}`);
  if (o.boughtDisplay !== '—') staleFields.push(`boughtDisplay=${o.boughtDisplay}`);
  if (o.boughtSubline !== '') staleFields.push(`boughtSubline=${o.boughtSubline}`);
  if (o.sellSubline !== '') staleFields.push(`sellSubline=${o.sellSubline}`);
  if (o.deposit !== '—') staleFields.push(`deposit=${o.deposit}`);
  if (o.slippage !== '— %') staleFields.push(`slippage=${o.slippage}`);
  if (o.txfees !== '0.0100 %') staleFields.push(`txfees=${o.txfees}`);
  if (o.modeSell !== '—') staleFields.push(`modeSell=${o.modeSell}`);
  if (o.modeBuy !== '—') staleFields.push(`modeBuy=${o.modeBuy}`);
  return { stale: staleFields.length > 0, staleFields, warnPresent: o.warn.length > 0, executeDisabled: o.executeDisabled };
}

async function freshPage(browser, phase) {
  PHASE = phase;
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  wire(page);
  await page.goto(FILE, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  return page;
}

const browser = await chromium.launch();

// ════════ A — FIX ACCEPTANCE ════════

// A3+A4+overlays on a pristine default page first (no trades — frame/state = boot).
{
  const page = await freshPage(browser, 'A3-anchor-default');
  log('\n══ A3: anchor (w=1/2) overlay through live reserves point — default frame ══');
  const anchor = await page.evaluate(() => {
    const p = Store.state.pool;
    const kNew = Math.sqrt(p.x * p.y);
    const depthOld = (typeof Engine.getDepth === 'function') ? Engine.getDepth(p) : null;
    // replicate drawAll's anchor: curveTraceExplicit(0.5, kNew, modeSlope)
    const w = Engine.getW(p);
    const modeSlope = (p.beta && p.alpha) ? p.beta / p.alpha : (w / (1 - w)) * 1;
    const pts = [];
    for (let i = 0; i <= 400; i++) {
      const u = -6 + 12 * i / 400;
      const m = modeSlope * Math.exp(u);
      const x = kNew * Math.pow(m, -0.5);
      const y = m * x;
      if (isFinite(x) && isFinite(y) && x > 0 && y > 0) pts.push([x, y]);
    }
    const cv = document.getElementById('canvas-curve');
    const W = cv.width, H = cv.height;
    const pad = { top: 18, right: 18, bottom: 44, left: 64 };
    const plotW = W - pad.left - pad.right, plotH = H - pad.top - pad.bottom;
    const fr = window.__curveFrame;
    const toPx = (x, y) => [pad.left + (x / fr.xMax) * plotW, pad.top + (1 - y / fr.yMax) * plotH];
    const livePx = toPx(p.x, p.y);
    // min distance live-dot -> anchor polyline (in px)
    let minDist = 1e9, inFrame = 0;
    let minPx = [1e9, 1e9], maxPx = [-1, -1];
    for (const [x, y] of pts) {
      const [px, py] = toPx(x, y);
      const d = Math.hypot(px - livePx[0], py - livePx[1]);
      if (d < minDist) minDist = d;
      if (x <= fr.xMax && y <= fr.yMax) {
        inFrame++;
        if (px < minPx[0]) minPx[0] = px; if (py < minPx[1]) minPx[1] = py;
        if (px > maxPx[0]) maxPx[0] = px; if (py > maxPx[1]) maxPx[1] = py;
      }
    }
    return {
      pool: { x: p.x, y: +p.y.toFixed(2), tau: p.tau, wMinus: p.wMinus, wPlus: p.wPlus, phi: p.phi },
      kNew: +kNew.toFixed(2), depthOld: depthOld == null ? null : +depthOld.toFixed(2),
      yAtLiveX_anchor: +(kNew * kNew / p.x).toFixed(2), yLive: +p.y.toFixed(2),
      livePx: livePx.map(v => +v.toFixed(1)),
      minDistAnchorToLiveDot_px: +minDist.toFixed(2),
      anchorInFrameBbox_px: { min: minPx.map(v => +v.toFixed(1)), max: maxPx.map(v => +v.toFixed(1)) },
      inFramePts: inFrame, frame: { xMax: +fr.xMax.toFixed(2), yMax: +fr.yMax.toFixed(0) },
      plot: { left: pad.left, top: pad.top, right: W - pad.right, bottom: H - pad.bottom }
    };
  });
  log('anchor analytics:', JSON.stringify(anchor, null, 1));
  await shotCanvas(page, 'I3_anchor_curve_default');   // same frame name as entry-45 for re-shoot compare
  await shot(page, 'A3_full_default');
  trace.items.A3_anchor = anchor;

  log('\n══ A4: tau disclosure sentence ══');
  await page.click('.tab[data-subtab="settings"]');
  await page.waitForTimeout(150);
  const disc = await page.evaluate(() => {
    const tau = document.getElementById('tau-input');
    const card = tau ? tau.closest('div.sim-aid, .settings-block, fieldset, .card, div') : null;
    // find the sim-aid-label containing the sentence anywhere, then test proximity to tau-input
    const labels = Array.from(document.querySelectorAll('.sim-aid-label'));
    const hit = labels.find(l => l.textContent.includes('Visible effect scales with the wing gap'));
    if (!hit) return { found: false };
    const r = hit.getBoundingClientRect();
    const rt = tau.getBoundingClientRect();
    return { found: true, text: hit.textContent.trim(), visible: r.width > 0 && r.height > 0, rectTop: r.top, tauTop: rt.top, distPx: Math.abs(r.top - rt.top) };
  });
  log('disclosure:', JSON.stringify({ found: disc.found, visible: disc.visible, distToTauInputPx: disc.distPx }));
  log('text:', disc.text && disc.text.slice(0, 200));
  await shot(page, 'A4_tau_disclosure_settings');
  trace.items.A4_disclosure = disc;
  await page.close();
}

// A1 — stale-on-reject (both reject paths) + A2 audit-strip dollars.
{
  const page = await freshPage(browser, 'A1-stale');
  log('\n══ A1/A2: stale-on-reject + audit-strip raw USD ══');
  await page.click('.tab[data-subtab="bands"]');
  await page.waitForTimeout(150);
  // valid LONG band: N=9.95, sold 100000 / bought 52000 (entry-45 exact repro)
  await setNum(page, 'band-notional', 9.95);
  await setNum(page, 'sold-inner', 100000);
  await setNum(page, 'bought-inner', 52000);
  await page.waitForTimeout(300);
  // expand audit strip
  await page.evaluate(() => { const t = document.getElementById('audit-toggle'); if (t) t.click(); });
  await page.waitForTimeout(150);
  const valid = await previewOut(page);
  log('valid long preview: slippage', valid.slippage, '| N_buy', valid.boughtDisplay, '| warn:', JSON.stringify(valid.warn));
  log('AUDIT  dy-sold:', valid.pv['pv-dy-sold'], '| dy-bought:', valid.pv['pv-dy-bought'], '| net-cash:', valid.pv['pv-net-cash']);
  await shot(page, 'A2_audit_strip_valid_9p95');
  // A2 magnitude parse
  const usd = s => { const m = String(s).replace(/[,$\s]/g, '').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; };
  const net = usd(valid.pv['pv-net-cash']), dyS = usd(valid.pv['pv-dy-sold']), dyB = usd(valid.pv['pv-dy-bought']);
  trace.items.A2_audit = { display: { dyS: valid.pv['pv-dy-sold'], dyB: valid.pv['pv-dy-bought'], net: valid.pv['pv-net-cash'] }, parsed: { dyS, dyB, net }, slippage: valid.slippage };
  log(`A2 parsed: dyS=${dyS} dyB=${dyB} net=${net} (entry-45 engine truth: 28453.17 + 11470.09 = 39923.26)`);

  // PATH 1 — swap (⇅)
  PHASE = 'A1-swap-reject';
  await page.click('#band-swap-btn');
  await page.waitForTimeout(300);
  const afterSwap = await previewOut(page);
  const sc1 = staleCheck(afterSwap);
  log('after ⇅ swap: dir=', afterSwap.dir, 'warn:', JSON.stringify(afterSwap.warn));
  log('STALE-CHECK (swap path):', sc1.stale ? 'STALE — ' + sc1.staleFields.join('; ') : 'FALSE (all cleared)', '| warnPresent:', sc1.warnPresent, '| executeDisabled:', sc1.executeDisabled);
  await shot(page, 'A1_path1_after_swap');
  trace.items.A1_path1_swap = { out: afterSwap, check: sc1 };

  // restore a valid preview (swap back), then PATH 2 — direction pill toggle
  PHASE = 'A1-pill-reject';
  await page.click('#band-swap-btn');
  await page.waitForTimeout(300);
  const reValid = await previewOut(page);
  log('swap-back state: slippage', reValid.slippage, 'warn:', JSON.stringify(reValid.warn));
  await page.click('#band-dir-sell');
  await page.waitForTimeout(300);
  const afterPill = await previewOut(page);
  const sc2 = staleCheck(afterPill);
  log('after pill toggle: dir=', afterPill.dir, 'warn:', JSON.stringify(afterPill.warn));
  if (afterPill.warn.length > 0) {
    log('STALE-CHECK (pill path):', sc2.stale ? 'STALE — ' + sc2.staleFields.join('; ') : 'FALSE (all cleared)');
  } else {
    log('pill path produced a VALID preview (no reject) — recording, not a stale scenario');
  }
  await shot(page, 'A1_path2_after_pill');
  trace.items.A1_path2_pill = { out: afterPill, check: sc2 };

  // PATH 3 — !sim.ok (wing-range) via over-size 100 BTC after a valid preview
  PHASE = 'A1-oversize-reject';
  await page.click('#band-dir-sell');                       // back to original dir
  await page.waitForTimeout(200);
  await setNum(page, 'band-notional', 9.95);
  await setNum(page, 'sold-inner', 100000);
  await setNum(page, 'bought-inner', 52000);
  await page.waitForTimeout(250);
  await setNum(page, 'band-notional', 100);
  await page.waitForTimeout(300);
  const afterOver = await previewOut(page);
  const sc3 = staleCheck(afterOver);
  log('after 100 BTC over-size: warn:', JSON.stringify(afterOver.warn));
  log('STALE-CHECK (oversize/!sim.ok path):', sc3.stale ? 'STALE — ' + sc3.staleFields.join('; ') : 'FALSE (all cleared)', '| executeDisabled:', sc3.executeDisabled);
  await shot(page, 'A1_path3_oversize_banner');
  trace.items.A1_path3_oversize = { out: afterOver, check: sc3 };
  await page.close();
}

// A2b — ~1 BTC band magnitude check (operator-scale: $10-40k order, NOT billions)
{
  const page = await freshPage(browser, 'A2b-1btc');
  await page.click('.tab[data-subtab="bands"]');
  await page.waitForTimeout(150);
  await setNum(page, 'band-notional', 1);
  await setNum(page, 'sold-inner', 100000);
  await setNum(page, 'bought-inner', 52000);
  await page.waitForTimeout(300);
  await page.evaluate(() => { const t = document.getElementById('audit-toggle'); if (t) t.click(); });
  await page.waitForTimeout(150);
  const o = await previewOut(page);
  const usd = s => { const m = String(s).replace(/[,$\s]/g, '').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; };
  // cross-check vs raw engine sim of the same band
  const engineTruth = await page.evaluate(() => {
    const pb = window.__previewBand;
    return pb ? { hasPreview: true } : { hasPreview: false };
  });
  log('\n══ A2b: 1 BTC band audit magnitudes ══');
  log('dy-sold:', o.pv['pv-dy-sold'], '| dy-bought:', o.pv['pv-dy-bought'], '| net-cash:', o.pv['pv-net-cash'], '| slippage:', o.slippage);
  trace.items.A2b_1btc = { display: { dyS: o.pv['pv-dy-sold'], dyB: o.pv['pv-dy-bought'], net: o.pv['pv-net-cash'] }, parsed: { dyS: usd(o.pv['pv-dy-sold']), dyB: usd(o.pv['pv-dy-bought']), net: usd(o.pv['pv-net-cash']) }, slippage: o.slippage, engineTruth };
  await shot(page, 'A2b_audit_strip_1btc');
  await page.close();
}

// ════════ B — FULL SMOKE (one long-lived page for state consistency) ════════
{
  const page = await freshPage(browser, 'B1-perps');
  log('\n══ B1: Create Perp long AND short ══');
  const perp = async (side, n, m) => {
    await page.click('.tab[data-subtab="perps"]');
    await page.selectOption('#perp-side', side);
    await setNum(page, 'perp-notional', n);
    await setNum(page, 'perp-margin', m);
    await page.waitForTimeout(150);
    const disp = await page.evaluate(() => ({
      lev: (document.getElementById('perp-leverage-display') || {}).textContent,
      liq: (document.getElementById('perp-liq-display') || {}).textContent
    }));
    await page.click('#btn-add-perp');
    await page.waitForTimeout(200);
    return disp;
  };
  const dLong = await perp('long', 0.1, 1000);
  const dShort = await perp('short', 0.05, 500);
  const clubs = await page.evaluate(() => {
    const c = Store.state.clubs, f = s => c && c[s] ? { notional: c[s].totalNotional, equity: c[s].equity } : null;
    return { long: f('long'), short: f('short'), nPerps: Store.state.perps ? Store.state.perps.length : null };
  });
  log('long perp preview:', JSON.stringify(dLong), '| short perp preview:', JSON.stringify(dShort));
  log('clubs after add:', JSON.stringify(clubs));
  await shot(page, 'B1_perps_added');
  trace.items.B1_perps = { dLong, dShort, clubs };

  // ── B2: bands — both directions, preview steppers, execute, over-carve alert
  PHASE = 'B2-bands';
  log('\n══ B2: Trade Bands — both directions, steppers, execute, over-carve ══');
  await page.click('.tab[data-subtab="bands"]');
  await page.waitForTimeout(150);
  // direction 1 (default, pre-swap): small valid band 0.05 BTC
  await setNum(page, 'band-notional', 0.05);
  await setNum(page, 'sold-inner', 100000);
  await setNum(page, 'bought-inner', 52000);
  await page.waitForTimeout(300);
  const dir1 = await previewOut(page);
  log('dir1 preview: dir=', dir1.dir, 'slippage', dir1.slippage, 'N_buy', dir1.boughtDisplay, 'warn:', JSON.stringify(dir1.warn), 'execDisabled:', dir1.executeDisabled);
  await shot(page, 'B2_dir1_preview');

  // preview steppers on the valid preview
  await capCanvas(page, 'step2_default');
  const stepState0 = await page.evaluate(() => ({ s1: document.getElementById('preview-step-1').disabled, s2: document.getElementById('preview-step-2').disabled, active: window.__previewStep, w: (document.getElementById('preview-w-readout') || {}).textContent }));
  await page.click('#preview-step-1');
  await page.waitForTimeout(250);
  await capCanvas(page, 'step1');
  const stepState1 = await page.evaluate(() => ({ active: window.__previewStep, cls1: document.getElementById('preview-step-1').className, w: (document.getElementById('preview-w-readout') || {}).textContent }));
  const dStep = await diffCanvas(page, 'step2_default', 'step1');
  await shotCanvas(page, 'B2_stepper_after_sold_leg');
  await page.click('#preview-step-2');
  await page.waitForTimeout(250);
  await capCanvas(page, 'step2_back');
  const stepState2 = await page.evaluate(() => ({ active: window.__previewStep, cls2: document.getElementById('preview-step-2').className }));
  const dStepBack = await diffCanvas(page, 'step1', 'step2_back');
  await shotCanvas(page, 'B2_stepper_after_bought_leg');
  log('steppers: initial', JSON.stringify(stepState0), '-> step1', JSON.stringify(stepState1), 'canvasDiff', JSON.stringify(dStep), '-> step2', JSON.stringify(stepState2), 'diffBack', JSON.stringify(dStepBack));
  trace.items.B2_steppers = { stepState0, stepState1, stepState2, dStep, dStepBack };

  // execute the small valid band (within club free) — watch for dialogs
  PHASE = 'B2-execute';
  const poolPre = await page.evaluate(() => ({ y: Store.state.pool.y, phi: Store.state.pool.phi, bands: Store.state.bands ? Store.state.bands.length : null }));
  await page.click('#btn-execute');
  await page.waitForTimeout(400);
  const poolPost = await page.evaluate(() => ({ y: Store.state.pool.y, phi: Store.state.pool.phi, bands: Store.state.bands ? Store.state.bands.length : null }));
  log('execute 0.05 BTC: pool.y', poolPre.y.toFixed(2), '->', poolPost.y.toFixed(2), '| phi', poolPre.phi, '->', poolPost.phi, '| bands', poolPre.bands, '->', poolPost.bands, '| dialogs so far:', dialogs.length);
  await shot(page, 'B2_after_execute');
  trace.items.B2_execute = { poolPre, poolPost, dialogCount: dialogs.length };

  // over-carve: 1 BTC band ($80k) vs club free ($10k-ish) -> honest alert via dialog
  PHASE = 'B2-overcarve';
  await setNum(page, 'band-notional', 1);
  await setNum(page, 'sold-inner', 100000);
  await setNum(page, 'bought-inner', 52000);
  await page.waitForTimeout(300);
  const ocPrev = await previewOut(page);
  log('over-carve preview: warn:', JSON.stringify(ocPrev.warn), 'execDisabled:', ocPrev.executeDisabled);
  if (!ocPrev.executeDisabled) {
    const nDlg = dialogs.length;
    await page.click('#btn-execute');
    await page.waitForTimeout(400);
    const got = dialogs.slice(nDlg);
    log('over-carve dialogs:', JSON.stringify(got));
    trace.items.B2_overcarve = { dialogs: got, preview: { warn: ocPrev.warn } };
  } else {
    trace.items.B2_overcarve = { skipped: 'execute disabled at preview', warn: ocPrev.warn };
  }
  await shot(page, 'B2_overcarve');

  // direction 2 (post-swap): flip with ⇅, valid short-direction band
  PHASE = 'B2-dir2';
  await page.click('#band-swap-btn');
  await page.waitForTimeout(300);
  const dir2raw = await previewOut(page);
  log('post-swap state: dir=', dir2raw.dir, 'warn:', JSON.stringify(dir2raw.warn));
  const scSwap = staleCheck(dir2raw);
  if (dir2raw.warn.length > 0) log('STALE-CHECK (B2 swap):', scSwap.stale ? 'STALE — ' + scSwap.staleFields.join('; ') : 'FALSE (all cleared)');
  await setNum(page, 'band-notional', 0.05);
  await setNum(page, 'sold-inner', 52000);
  await setNum(page, 'bought-inner', 100000);
  await page.waitForTimeout(300);
  const dir2 = await previewOut(page);
  log('dir2 valid preview: dir=', dir2.dir, 'slippage', dir2.slippage, 'N_buy', dir2.boughtDisplay, 'warn:', JSON.stringify(dir2.warn), 'execDisabled:', dir2.executeDisabled);
  await shot(page, 'B2_dir2_preview');
  trace.items.B2_directions = { dir1: { dir: dir1.dir, slippage: dir1.slippage, warn: dir1.warn }, postSwap: { warn: dir2raw.warn, staleCheck: scSwap }, dir2: { dir: dir2.dir, slippage: dir2.slippage, warn: dir2.warn, executeDisabled: dir2.executeDisabled } };
  // clear band form
  await setNum(page, 'band-notional', '');
  await page.waitForTimeout(200);

  // ── B3: EARN deposit / withdraw
  PHASE = 'B3-earn';
  log('\n══ B3: Earn deposit/withdraw ══');
  await page.click('.tab[data-subtab="earn"]');
  await page.waitForTimeout(150);
  const lp0 = await page.evaluate(() => ({ y: document.getElementById('lp-y').textContent, x: document.getElementById('lp-x').textContent, pv: document.getElementById('lp-pool-value').textContent, yd: document.getElementById('lp-y-delta').textContent }));
  await setNum(page, 'lp-amount', 10000);
  await page.waitForTimeout(200);
  const lpPrev = await page.evaluate(() => ({ lambda: document.getElementById('lp-preview-lambda').textContent, val: document.getElementById('lp-preview-value').textContent }));
  await page.click('#btn-lp-deposit');
  await page.waitForTimeout(250);
  const lp1 = await page.evaluate(() => ({ y: document.getElementById('lp-y').textContent, pv: document.getElementById('lp-pool-value').textContent, poolY: Store.state.pool.y }));
  await setNum(page, 'lp-amount', 10000);
  await page.click('#btn-lp-withdraw');
  await page.waitForTimeout(250);
  const lp2 = await page.evaluate(() => ({ y: document.getElementById('lp-y').textContent, pv: document.getElementById('lp-pool-value').textContent, poolY: Store.state.pool.y }));
  log('earn: pre', JSON.stringify(lp0), '| preview', JSON.stringify(lpPrev), '| after deposit', JSON.stringify(lp1), '| after withdraw', JSON.stringify(lp2));
  await shot(page, 'B3_earn');
  trace.items.B3_earn = { lp0, lpPrev, lp1, lp2 };

  // ── B4: SETTINGS — wings clamp, kappa, tick-hours, oracle/rebase, arb, tick
  PHASE = 'B4-settings';
  log('\n══ B4: Settings — wing clamp, oracle/rebase, arb, tick ══');
  await page.click('.tab[data-subtab="settings"]');
  await page.waitForTimeout(150);
  // γ>1 clamp reflect-back: wminus 0.45 must bounce to 0.501
  await setNum(page, 'wminus-input', 0.45);
  await page.waitForTimeout(200);
  const clamp = await page.evaluate(() => ({ wmInput: document.getElementById('wminus-input').value, wpInput: document.getElementById('wplus-input').value, wMinus: Store.state.pool.wMinus, wPlus: Store.state.pool.wPlus, status: document.getElementById('wcurve-status').textContent }));
  log('clamp wminus=0.45 ->', JSON.stringify(clamp));
  // over-cap: wplus 0.99 -> 0.95
  await setNum(page, 'wplus-input', 0.99);
  await page.waitForTimeout(200);
  const clamp2 = await page.evaluate(() => ({ wpInput: document.getElementById('wplus-input').value, wPlus: Store.state.pool.wPlus }));
  log('clamp wplus=0.99 ->', JSON.stringify(clamp2));
  // restore defaults 0.60 / 0.85
  await setNum(page, 'wminus-input', 0.60);
  await setNum(page, 'wplus-input', 0.85);
  await page.waitForTimeout(200);
  const restored = await page.evaluate(() => ({ wMinus: Store.state.pool.wMinus, wPlus: Store.state.pool.wPlus, status: document.getElementById('wcurve-status').textContent }));
  log('restored wings:', JSON.stringify(restored));
  await shot(page, 'B4_wing_clamp');
  trace.items.B4_wings = { clamp, clamp2, restored };

  // kappa + tick-hours (touch, verify Store)
  await setNum(page, 'kappa-input', 0.5);
  await setNum(page, 'tick-hours', 8);
  await page.waitForTimeout(150);
  const kt = await page.evaluate(() => ({ kappa: Store.state.kappa, tick_hours: Store.state.tick_hours }));
  log('kappa/tick-hours set:', JSON.stringify(kt));
  trace.items.B4_kappa_tick = kt;

  // oracle change -> rebase; spot KPI + canvas move
  PHASE = 'B4-oracle';
  await capCanvas(page, 'pre_oracle');
  const spot0 = await page.evaluate(() => ({ spotUsd: document.getElementById('kpi-spot-usd').textContent, hdr: document.getElementById('hdr-pool-spot').textContent, oracle: Store.state.oracle, P: Store.state.pool.y / Store.state.pool.x }));
  await setNum(page, 'kpi-oracle', 90000);
  await page.waitForTimeout(300);
  await capCanvas(page, 'post_oracle');
  const spot1 = await page.evaluate(() => ({ spotUsd: document.getElementById('kpi-spot-usd').textContent, hdr: document.getElementById('hdr-pool-spot').textContent, oracle: Store.state.oracle, P: Store.state.pool.y / Store.state.pool.x, x: Store.state.pool.x, y: Store.state.pool.y }));
  const dOracle = await diffCanvas(page, 'pre_oracle', 'post_oracle');
  log('oracle 80000->90000:', JSON.stringify(spot0), '->', JSON.stringify(spot1), '| canvas diff:', JSON.stringify(dOracle));
  await shot(page, 'B4_oracle_90000');
  trace.items.B4_oracle = { spot0, spot1, dOracle };

  // arbitrage + funding tick
  PHASE = 'B4-arb-tick';
  await page.click('#btn-arb');
  await page.waitForTimeout(300);
  const arb = await page.evaluate(() => ({ spotUsd: document.getElementById('kpi-spot-usd').textContent, P: Store.state.pool.y / Store.state.pool.x, oracle: Store.state.oracle }));
  await page.click('#btn-tick');
  await page.waitForTimeout(300);
  const tick = await page.evaluate(() => ({ t: Store.state.t, kpiT: document.getElementById('kpi-t').textContent }));
  log('after arb:', JSON.stringify(arb), '| after tick:', JSON.stringify(tick));
  await shot(page, 'B4_arb_tick');
  trace.items.B4_arb_tick = { arb, tick };

  // ── B5: PORTFOLIO
  PHASE = 'B5-portfolio';
  log('\n══ B5: Portfolio tab ══');
  await page.click('.page-nav-link[data-page="portfolio"]');
  await page.waitForTimeout(400);
  const pf = await page.evaluate(() => {
    const pg = document.getElementById('page-portfolio');
    const vis = pg && getComputedStyle(pg).display !== 'none';
    const txt = pg ? pg.innerText : '';
    const rows = pg ? pg.querySelectorAll('tr').length : 0;
    return { visible: vis, rows, hasNaN: /NaN/.test(txt), hasUndefined: /undefined/.test(txt), excerpt: txt.slice(0, 400) };
  });
  log('portfolio: visible', pf.visible, '| table rows', pf.rows, '| NaN?', pf.hasNaN, '| undefined?', pf.hasUndefined);
  await shot(page, 'B5_portfolio');
  trace.items.B5_portfolio = pf;
  await page.click('.page-nav-link[data-page="transact"]');
  await page.waitForTimeout(300);

  // ── B6: EXPORT / IMPORT round-trip
  PHASE = 'B6-export-import';
  log('\n══ B6: Export/Import round-trip ══');
  const pre = await page.evaluate(() => Store.exportJSON());
  const dlPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
  await page.click('#btn-export');
  const dl = await dlPromise;
  let rt = { exported: false };
  if (dl) {
    const fp = path.join(OUT, 'export_state.json');
    await dl.saveAs(fp);
    rt.exported = true;
    rt.file = fp;
    // import it back
    await page.setInputFiles('#file-import', fp);
    await page.waitForTimeout(500);
    const post = await page.evaluate(() => Store.exportJSON());
    rt.byteIdentical = (pre === post);
    rt.preLen = pre.length; rt.postLen = post.length;
    // structured compare: every top-level key except eventLog must round-trip EXACTLY
    const A = JSON.parse(pre), B = JSON.parse(post);
    const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])];
    rt.keyDiffs = [];
    for (const k of keys) {
      if (k === 'eventLog') continue;
      if (JSON.stringify(A[k]) !== JSON.stringify(B[k])) rt.keyDiffs.push(k);
    }
    rt.stateIdenticalExLog = rt.keyDiffs.length === 0;
    if (!rt.byteIdentical) {
      let i = 0; while (i < Math.min(pre.length, post.length) && pre[i] === post[i]) i++;
      rt.firstDiffAt = i; rt.preCtx = pre.slice(Math.max(0, i - 40), i + 40); rt.postCtx = post.slice(Math.max(0, i - 40), i + 40);
    }
  }
  log('export/import:', JSON.stringify({ exported: rt.exported, byteIdentical: rt.byteIdentical, stateIdenticalExLog: rt.stateIdenticalExLog, keyDiffs: rt.keyDiffs, preLen: rt.preLen, postLen: rt.postLen, firstDiffAt: rt.firstDiffAt }));
  if (rt.firstDiffAt != null) log('  diff ctx pre :', rt.preCtx, '\n  diff ctx post:', rt.postCtx);
  trace.items.B6_roundtrip = rt;
  await shot(page, 'B6_after_import');

  // ── B7: RESET (last — destructive)
  PHASE = 'B7-reset';
  await page.click('.tab[data-subtab="settings"]');
  await page.waitForTimeout(150);
  await page.click('#btn-reset');
  await page.waitForTimeout(400);
  const rs = await page.evaluate(() => ({ oracle: Store.state.oracle, x: Store.state.pool.x, y: +Store.state.pool.y.toFixed(2), tau: Store.state.pool.tau, nPerps: Store.state.perps ? Store.state.perps.length : null, spotUsd: document.getElementById('kpi-spot-usd').textContent }));
  log('after reset:', JSON.stringify(rs));
  await shot(page, 'B7_after_reset');
  trace.items.B7_reset = rs;
  await page.close();
}

// ════════ C — tau per-click visible delta on FRESH defaults (entry-45 baseline compare) ════════
{
  const page = await freshPage(browser, 'C-tau');
  log('\n══ C: tau stepper — one click + wide sweep (vs entry-45 baseline) ══');
  await capCanvas(page, 'tau_base');
  await shotCanvas(page, 'C_tau_baseline_0.30');
  await page.click('.tab[data-subtab="settings"]');
  await page.waitForTimeout(150);
  await page.focus('#tau-input');
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(250);
  const tau1 = await page.evaluate(() => ({ input: document.getElementById('tau-input').value, store: Store.state.pool.tau }));
  await capCanvas(page, 'tau_click');
  const dClick = await diffCanvas(page, 'tau_base', 'tau_click');
  await shotCanvas(page, 'C_tau_oneclick');
  const aClick = await traceDisplacement(page, { tau: 0.30 }, { tau: parseFloat(tau1.store) });
  log('one ArrowUp:', JSON.stringify(tau1), '| canvas diff:', JSON.stringify(dClick), '| analytic px:', JSON.stringify(aClick), '(entry-45 baseline: 3.39px analytic, 3.7-5.4k diff px)');
  await setNum(page, 'tau-input', 3.00);
  await page.waitForTimeout(250);
  await capCanvas(page, 'tau_300');
  const dSweep = await diffCanvas(page, 'tau_base', 'tau_300');
  await shotCanvas(page, 'C_tau_3.00');
  const aSweep = await traceDisplacement(page, { tau: 0.30 }, { tau: 3.00 });
  await setNum(page, 'tau-input', 0.05);
  await page.waitForTimeout(250);
  await capCanvas(page, 'tau_005');
  const dLow = await diffCanvas(page, 'tau_300', 'tau_005');
  await shotCanvas(page, 'C_tau_0.05');
  const aFull = await traceDisplacement(page, { tau: 0.05 }, { tau: 3.00 });
  log('sweep 0.30->3.00: canvas diff', JSON.stringify(dSweep), '| analytic', JSON.stringify(aSweep));
  log('full 0.05<->3.00: canvas diff', JSON.stringify(dLow), '| analytic', JSON.stringify(aFull), '(entry-45 baseline: 154px)');
  trace.items.C_tau = { tau1, dClick, aClick, dSweep, aSweep, dLow, aFull };
  await page.close();
}

await browser.close();
trace.consoleLog = consoleLog;
trace.pageErrors = pageErrors;
trace.dialogs = dialogs;
fs.writeFileSync(path.join(OUT, 'trace_entry46.json'), JSON.stringify(trace, null, 1));
log('\n══ console errors/warnings:', consoleLog.length, '· uncaught exceptions:', pageErrors.length, '· dialogs:', dialogs.length, '══');
for (const e of pageErrors) log('PAGEERROR [' + e.phase + ']:', e.message, '\n', e.stack);
for (const c of consoleLog) log('CONSOLE-' + c.type + ' [' + c.phase + ']:', c.text.slice(0, 300));
for (const d of dialogs) log('DIALOG [' + d.phase + ']:', d.message.slice(0, 200));
log('\nEvidence in', OUT);

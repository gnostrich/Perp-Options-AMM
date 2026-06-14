// TEST-ONLY live verification — HEAD v27 (md5 1eebfcd6), NO build edit. READ-ONLY on the build.
// Operator entry 45 (2026-06-11, verbatim transcript): four concerns —
//   (1) tau/kurtosis stepper: "curve is almost completely insensitive to kurtosis change"
//   (2) "the simulation breaks when you switch long to short" (band-swap-btn)
//   (3) "the anchor curve is sitting way off in the corner somewhere"
//   (4) "theres no visible curve warp" (trade-warp visibility)
// Drives the REAL UI only (real input/change events, real clicks). Captures console +
// pageerror per phase, screenshots, canvas pixel diffs, live Store/Engine truth.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(__dirname, '../builds/HEAD_temporal_mvp_v27_wkurtosis.html');
const OUT = path.resolve(__dirname, '../../evidence/v27_entry45');
fs.mkdirSync(OUT, { recursive: true });

const trace = { build: 'HEAD_temporal_mvp_v27_wkurtosis.html md5 1eebfcd6', date: new Date().toISOString(), items: {} };
const log = (...a) => console.log(...a);

let PHASE = 'boot';
const consoleLog = [];   // {phase, type, text}
const pageErrors = [];   // {phase, message, stack}

function wire(page) {
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleLog.push({ phase: PHASE, type: m.type(), text: m.text() }); });
  page.on('pageerror', e => pageErrors.push({ phase: PHASE, message: e.message, stack: (e.stack || '').split('\n').slice(0, 6).join('\n') }));
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

// In-page canvas capture/diff helpers (stash pixel buffers on window.__cap).
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

// Analytic: re-create curveTraceW for the live pool with overrides, project with the
// app's own cached frame, return max px displacement between two parameterizations.
async function traceDisplacement(page, overrideA, overrideB) {
  return await page.evaluate(({ oA, oB }) => {
    const p = Store.state.pool;
    function snap(ov) {
      return Object.assign({ x: p.x, y: p.y, alpha: p.alpha, beta: p.beta, tau: p.tau, wMinus: p.wMinus, wPlus: p.wPlus, phi: (typeof p.phi === 'number') ? p.phi : 0 }, ov || {});
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
    // match by u (same index — both traces sample the same u ladder when phi equal;
    // when phi differs the u-window shifts, still index-matched = same ladder position)
    let maxD = 0, maxAt = null, inFrame = 0;
    const samples = [];
    for (let i = 0; i < Math.min(A.length, B.length); i++) {
      const [xa, ya, ua] = A[i], [xb, yb] = B[i];
      const ain = xa <= fr.xMax && ya <= fr.yMax, bin = xb <= fr.xMax && yb <= fr.yMax;
      if (!ain && !bin) continue;
      inFrame++;
      const [pxa, pya] = toPx(xa, ya), [pxb, pyb] = toPx(xb, yb);
      const d = Math.hypot(pxb - pxa, pyb - pya);
      if (d > maxD) { maxD = d; maxAt = { u: +ua.toFixed(3), pxA: [pxa, pya].map(v => +v.toFixed(1)), pxB: [pxb, pyb].map(v => +v.toFixed(1)) }; }
      if (i % 50 === 0) samples.push({ u: +ua.toFixed(2), dPx: +d.toFixed(2) });
    }
    return { maxDispPx: +maxD.toFixed(2), maxAt, inFramePts: inFrame, samples };
  }, { oA: overrideA, oB: overrideB });
}

async function bandState(page) {
  return await page.evaluate(() => {
    const g = id => { const el = document.getElementById(id); return el ? (el.value !== undefined && el.tagName === 'INPUT' ? el.value : el.textContent.trim()) : null; };
    const pill = document.getElementById('band-dir-sell');
    return {
      dir: pill ? pill.dataset.dir : null,
      sellLabel: pill ? pill.textContent.trim() : null,
      maxChip: g('band-sell-max'),
      notional: g('band-notional'),
      soldInner: g('sold-inner'), soldOuter: g('sold-outer'),
      boughtInner: g('bought-inner'), boughtOuter: g('bought-outer'),
      slippage: g('band-slippage'),
      boughtDisplay: g('band-notional-bought-display'),
      warn: (document.getElementById('warn-area') || {}).innerText || '',
      executeDisabled: (document.getElementById('btn-execute') || {}).disabled,
      pv: ['pv-sold-theta', 'pv-sold-V', 'pv-bought-theta', 'pv-N-bought', 'pv-bought-V', 'pv-net-cash'].map(id => id + '=' + g(id)).join(' | '),
      pool: (() => { const p = Store.state.pool; return { x: p.x, y: +p.y.toFixed(2), phi: p.phi, tau: p.tau }; })(),
      clubs: (() => { const c = Store.state.clubs; const f = s => c && c[s] ? { notional: c[s].totalNotional, equity: c[s].equity } : null; return { long: f('long'), short: f('short') }; })()
    };
  });
}

async function freshPage(browser, phase) {
  PHASE = phase;
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  wire(page);
  await page.goto(FILE, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  return page;
}

async function addPerp(page, side, notionalBTC, marginUSD) {
  await page.click('.tab[data-subtab="perps"]');
  await page.selectOption('#perp-side', side);
  await setNum(page, 'perp-notional', notionalBTC);
  await setNum(page, 'perp-margin', marginUSD);
  await page.click('#btn-add-perp');
  await page.waitForTimeout(200);
}

const browser = await chromium.launch();

// ───────────────────────── ITEM 1 — tau stepper sensitivity ─────────────────────────
{
  const page = await freshPage(browser, 'item1-tau');
  log('\n══ ITEM 1: tau (kurtosis) stepper sensitivity ══');
  await capCanvas(page, 'tau_030');
  await shotCanvas(page, 'I1_tau_0.30_baseline');
  await shot(page, 'I1_full_baseline');
  await page.click('.tab[data-subtab="settings"]');
  await page.waitForTimeout(150);

  // (a) one real spinner click: keyboard ArrowUp on tau-input (real UI event path)
  await page.focus('#tau-input');
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(200);
  const tauAfterClick = await page.evaluate(() => ({ input: document.getElementById('tau-input').value, store: Store.state.pool.tau }));
  await capCanvas(page, 'tau_035');
  const dClick = await diffCanvas(page, 'tau_030', 'tau_035');
  await shotCanvas(page, 'I1_tau_0.35_oneclick');
  log('one ArrowUp click 0.30->0.35: input=', tauAfterClick.input, 'store.tau=', tauAfterClick.store, 'canvas diff:', JSON.stringify(dClick));

  // (b) sweep through the requested ladder via the real handler
  const ladder = [0.60, 1.50, 3.00, 0.05];
  const sweep = [{ tau: 0.35, diffVsBase: dClick }];
  for (const t of ladder) {
    await setNum(page, 'tau-input', t);
    await page.waitForTimeout(200);
    const st = await page.evaluate(() => Store.state.pool.tau);
    const tag = 'tau_' + String(t).replace('.', 'p');
    await capCanvas(page, tag);
    const dv = await diffCanvas(page, 'tau_030', tag);
    await shotCanvas(page, 'I1_tau_' + t.toFixed(2));
    sweep.push({ tau: t, storeTau: st, diffVsBase: dv });
    log(`tau=${t}: store=${st} diff vs 0.30 baseline:`, JSON.stringify(dv));
  }
  // (c) analytic rendered-trace displacement for the named pairs (fixed frame)
  const pairs = [[0.30, 0.35], [0.30, 0.60], [0.30, 1.50], [0.30, 3.00], [0.05, 3.00]];
  const analytic = [];
  for (const [a, b] of pairs) {
    const r = await traceDisplacement(page, { tau: a }, { tau: b });
    analytic.push({ pair: `${a}->${b}`, ...r });
    log(`analytic trace displacement tau ${a}->${b}: max ${r.maxDispPx}px at u=${r.maxAt && r.maxAt.u}`);
  }
  trace.items.item1 = { tauAfterClick, sweep, analytic };
  await page.close();
}

// ───────────────────────── ITEM 2 — long<->short swap break ─────────────────────────
{
  log('\n══ ITEM 2: band swap (long<->short) break ══');
  const scenarios = {};

  // S1 — operator-exact: perp on SHORT side only (0.0625 BTC), dir=short band 52000/100000, N=9.95
  {
    const page = await freshPage(browser, 'item2-S1');
    await addPerp(page, 'short', 0.0625, 1000);
    await page.click('.tab[data-subtab="bands"]');
    await page.waitForTimeout(150);
    await page.click('#band-dir-sell');     // long -> short
    await page.waitForTimeout(150);
    await setNum(page, 'band-notional', 9.95);
    await setNum(page, 'sold-inner', 52000);
    await setNum(page, 'bought-inner', 100000);
    await page.waitForTimeout(250);
    const pre = await bandState(page);
    await shot(page, 'I2_S1_pre_swap');
    log('S1 pre-swap:', pre.slippage, '| MAX', pre.maxChip, '| N_buy', pre.boughtDisplay, '| warn:', JSON.stringify(pre.warn));
    PHASE = 'item2-S1-SWAP';
    await page.click('#band-swap-btn');
    await page.waitForTimeout(300);
    const post = await bandState(page);
    await shot(page, 'I2_S1_post_swap');
    log('S1 post-swap:', JSON.stringify({ dir: post.dir, slippage: post.slippage, maxChip: post.maxChip, warn: post.warn, executeDisabled: post.executeDisabled }));
    // swap back — does it recover?
    PHASE = 'item2-S1-SWAPBACK';
    await page.click('#band-swap-btn');
    await page.waitForTimeout(300);
    const back = await bandState(page);
    await shot(page, 'I2_S1_swap_back');
    log('S1 swap-back:', JSON.stringify({ dir: back.dir, slippage: back.slippage, warn: back.warn }));
    scenarios.S1 = { pre, post, back };
    await page.close();
  }

  // S2 — clubs on BOTH sides, same band, swap (exercises executeBand on the mirrored band)
  {
    const page = await freshPage(browser, 'item2-S2');
    await addPerp(page, 'short', 0.0625, 1000);
    await addPerp(page, 'long', 0.0625, 1000);
    await page.click('.tab[data-subtab="bands"]');
    await page.click('#band-dir-sell');
    await page.waitForTimeout(150);
    await setNum(page, 'band-notional', 9.95);
    await setNum(page, 'sold-inner', 52000);
    await setNum(page, 'bought-inner', 100000);
    await page.waitForTimeout(250);
    const pre = await bandState(page);
    PHASE = 'item2-S2-SWAP';
    await page.click('#band-swap-btn');
    await page.waitForTimeout(300);
    const post = await bandState(page);
    await shot(page, 'I2_S2_post_swap_bothclubs');
    log('S2 (both clubs) post-swap:', JSON.stringify({ dir: post.dir, slippage: post.slippage, maxChip: post.maxChip, warn: post.warn, executeDisabled: post.executeDisabled }));
    scenarios.S2 = { pre, post };
    await page.close();
  }

  // S3 — fresh default band (perp on long, no strikes entered), swap immediately
  {
    const page = await freshPage(browser, 'item2-S3');
    await addPerp(page, 'long', 0.1, 1000);
    await page.click('.tab[data-subtab="bands"]');
    await page.waitForTimeout(150);
    const pre = await bandState(page);
    PHASE = 'item2-S3-SWAP';
    await page.click('#band-swap-btn');
    await page.waitForTimeout(300);
    const post = await bandState(page);
    await shot(page, 'I2_S3_default_band_post_swap');
    log('S3 (default band) post-swap:', JSON.stringify({ dir: post.dir, warn: post.warn, maxChip: post.maxChip }));
    scenarios.S3 = { pre, post };
    await page.close();
  }

  // S4 — no perps at all, swap
  {
    const page = await freshPage(browser, 'item2-S4');
    await page.click('.tab[data-subtab="bands"]');
    await page.waitForTimeout(150);
    PHASE = 'item2-S4-SWAP';
    await page.click('#band-swap-btn');
    await page.waitForTimeout(300);
    const post = await bandState(page);
    await shot(page, 'I2_S4_noperps_post_swap');
    log('S4 (no perps) post-swap:', JSON.stringify({ dir: post.dir, warn: post.warn, maxChip: post.maxChip }));
    scenarios.S4 = { post };
    await page.close();
  }

  // S5 — operator-alt: perp on LONG side, dir=long, sold 52000 (ITM call) — then swap
  {
    const page = await freshPage(browser, 'item2-S5');
    await addPerp(page, 'long', 0.0625, 1000);
    await page.click('.tab[data-subtab="bands"]');
    await page.waitForTimeout(150);
    await setNum(page, 'band-notional', 9.95);
    await setNum(page, 'sold-inner', 52000);
    await setNum(page, 'bought-inner', 100000);
    await page.waitForTimeout(250);
    const pre = await bandState(page);
    log('S5 pre-swap (dir=long sold 52000):', JSON.stringify({ slippage: pre.slippage, warn: pre.warn }));
    PHASE = 'item2-S5-SWAP';
    await page.click('#band-swap-btn');
    await page.waitForTimeout(300);
    const post = await bandState(page);
    await shot(page, 'I2_S5_longclub_post_swap');
    log('S5 post-swap:', JSON.stringify({ dir: post.dir, slippage: post.slippage, warn: post.warn }));
    scenarios.S5 = { pre, post };
    await page.close();
  }

  trace.items.item2 = scenarios;
}

// ───────────────────────── ITEM 3 — anchor curve placement ─────────────────────────
{
  const page = await freshPage(browser, 'item3-anchor');
  log('\n══ ITEM 3: anchor (w=1/2) overlay placement ══');
  const anchor = await page.evaluate(() => {
    const p = Store.state.pool;
    const w = Engine.getW(p);
    const depth = Engine.getDepth(p);
    const modeSlope = p.beta / p.alpha;
    // re-create curveTraceExplicit(0.5, depth, modeSlope)
    const pts = [];
    for (let i = 0; i <= 400; i++) {
      const u = -6 + 12 * i / 400;
      const m = modeSlope * Math.exp(u);
      const x = depth * Math.pow(m, -0.5);
      const y = m * x;
      if (isFinite(x) && isFinite(y) && x > 0 && y > 0) pts.push([x, y]);
    }
    const cv = document.getElementById('canvas-curve');
    const W = cv.width, H = cv.height;
    const pad = { top: 18, right: 18, bottom: 44, left: 64 };
    const plotW = W - pad.left - pad.right, plotH = H - pad.top - pad.bottom;
    const fr = window.__curveFrame;
    const toPx = (x, y) => [pad.left + (x / fr.xMax) * plotW, pad.top + (1 - y / fr.yMax) * plotH];
    // anchor stats
    const yAtX10_anchor = depth * depth / 10;       // w=1/2: x*y = depth^2
    const yAtX10_live = p.y;                        // live curve passes through (10, y)
    // px geometry of the anchor in-frame
    let minPx = [1e9, 1e9], maxPx = [-1, -1], inFrame = 0;
    for (const [x, y] of pts) {
      if (x > fr.xMax || y > fr.yMax) continue;
      inFrame++;
      const [px, py] = toPx(x, y);
      if (px < minPx[0]) minPx[0] = px; if (py < minPx[1]) minPx[1] = py;
      if (px > maxPx[0]) maxPx[0] = px; if (py > maxPx[1]) maxPx[1] = py;
    }
    // how far up the plot does the anchor ever get? (plot bottom = pad.top+plotH)
    const anchorTopPx = minPx[1], plotBottomPx = pad.top + plotH, plotTopPx = pad.top;
    // live point px
    const livePx = toPx(p.x, p.y);
    return {
      w_live: +w.toFixed(4), depth: +depth.toFixed(2), modeSlope: +modeSlope.toFixed(1),
      frame: { xMax: +fr.xMax.toFixed(2), yMax: +fr.yMax.toFixed(0) },
      yAtX10_anchor: +yAtX10_anchor.toFixed(1), yAtX10_live: +yAtX10_live.toFixed(1),
      ratio: +(yAtX10_live / yAtX10_anchor).toFixed(1),
      anchor_bbox_px: { min: minPx.map(v => +v.toFixed(1)), max: maxPx.map(v => +v.toFixed(1)) },
      plotBottomPx, plotTopPx, canvasH: H, canvasW: W,
      anchor_rises_above_bottom_px: +(plotBottomPx - anchorTopPx).toFixed(1),
      livePointPx: livePx.map(v => +v.toFixed(1)),
      inFramePts: inFrame, totalPts: pts.length
    };
  });
  log('anchor analytics:', JSON.stringify(anchor, null, 1));
  await shotCanvas(page, 'I3_anchor_curve_default');
  await shot(page, 'I3_full_default');
  trace.items.item3 = anchor;
  await page.close();
}

// ───────────────────────── ITEM 4 — trade-warp visibility ─────────────────────────
{
  const page = await freshPage(browser, 'item4-warp');
  log('\n══ ITEM 4: trade-warp visibility (real band execute) ══');
  await addPerp(page, 'long', 2, 40000);
  await page.click('.tab[data-subtab="bands"]');
  await page.waitForTimeout(150);
  // clean pre-state canvas (no preview overlay yet)
  const phi0 = await page.evaluate(() => Store.state.pool.phi);
  await capCanvas(page, 'warp_pre');
  await shotCanvas(page, 'I4_warp_pre');
  // in-band trade: dir=long default (sold call 120000 / bought put 68000), 0.625 BTC = $50k notional
  await setNum(page, 'band-notional', 0.625);
  await setNum(page, 'sold-inner', 120000);
  await setNum(page, 'bought-inner', 68000);
  await page.waitForTimeout(250);
  const prev = await bandState(page);
  log('preview:', prev.slippage, 'warn:', JSON.stringify(prev.warn), 'execDisabled:', prev.executeDisabled);
  await shot(page, 'I4_preview_50k');
  PHASE = 'item4-execute';
  await page.click('#btn-execute');
  await page.waitForTimeout(400);
  const phi1 = await page.evaluate(() => Store.state.pool.phi);
  // clear the band form so the canvas shows the clean post-trade live curve (no dotted preview)
  await setNum(page, 'band-notional', '');
  await page.waitForTimeout(250);
  await capCanvas(page, 'warp_post');
  await shotCanvas(page, 'I4_warp_post');
  const dWarp = await diffCanvas(page, 'warp_pre', 'warp_post');
  // analytic px displacement: same pool now vs phi rolled back to phi0
  const disp = await traceDisplacement(page, { phi: phi0 }, { phi: phi1 });
  log(`50k-notional band: phi ${phi0.toFixed(6)} -> ${phi1.toFixed(6)} (d=${(phi1 - phi0).toExponential(3)})`);
  log('canvas diff pre/post:', JSON.stringify(dWarp));
  log('analytic curve displacement (phi-only):', JSON.stringify({ maxDispPx: disp.maxDispPx, maxAt: disp.maxAt }));

  // larger trade for scale: 5 BTC = $400k notional
  PHASE = 'item4-execute-5btc';
  await setNum(page, 'band-notional', 5);
  await setNum(page, 'sold-inner', 120000);
  await setNum(page, 'bought-inner', 68000);
  await page.waitForTimeout(250);
  const prev2 = await bandState(page);
  log('5BTC preview:', prev2.slippage, 'warn:', JSON.stringify(prev2.warn), 'execDisabled:', prev2.executeDisabled);
  if (!prev2.executeDisabled) {
    await page.click('#btn-execute');
    await page.waitForTimeout(400);
  }
  const phi2 = await page.evaluate(() => Store.state.pool.phi);
  await setNum(page, 'band-notional', '');
  await page.waitForTimeout(250);
  await capCanvas(page, 'warp_post5');
  await shotCanvas(page, 'I4_warp_post_5btc_cum');
  const dWarp5 = await diffCanvas(page, 'warp_pre', 'warp_post5');
  const disp5 = await traceDisplacement(page, { phi: phi0 }, { phi: phi2 });
  log(`cumulative after +5 BTC band: phi -> ${phi2.toFixed(6)} (cum d=${(phi2 - phi0).toExponential(3)})`);
  log('canvas diff vs original pre:', JSON.stringify(dWarp5));
  log('analytic displacement (cum):', JSON.stringify({ maxDispPx: disp5.maxDispPx, maxAt: disp5.maxAt }));
  trace.items.item4 = { phi0, phi1, phi2, preview50k: prev.slippage, preview5btc: prev2.slippage, exec5btcAllowed: !prev2.executeDisabled, canvasDiff50k: dWarp, canvasDiff5btcCum: dWarp5, disp50k: disp, dispCum: disp5 };
  await page.close();
}

await browser.close();
trace.consoleLog = consoleLog;
trace.pageErrors = pageErrors;
fs.writeFileSync(path.join(OUT, 'trace_entry45.json'), JSON.stringify(trace, null, 1));
log('\n══ console errors/warnings:', consoleLog.length, '· page errors (uncaught exceptions):', pageErrors.length, '══');
for (const e of pageErrors) log('PAGEERROR [' + e.phase + ']:', e.message, '\n', e.stack);
for (const c of consoleLog) log('CONSOLE-' + c.type + ' [' + c.phase + ']:', c.text.slice(0, 300));
log('\nEvidence in', OUT);

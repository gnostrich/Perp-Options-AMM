// TEST-ONLY probe #2 for entry-45 — HEAD v27 (1eebfcd6), READ-ONLY on the build.
// P1: engine-truth dump of the swapped band (netPoolY blowup root-cause)
// P2: operator-screenshot reproduction — valid long band -> swap -> STALE readout frankenstate
// P3: execute attempts (both the frankenstate and the valid $3.19B-preview state)
// P4: pill-click path from valid state
// P5: 18.2297% hunt across tau
// P6: warp scale redo with in-club sizes (1 BTC, 2 BTC cumulative)
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(__dirname, '../builds/HEAD_temporal_mvp_v27_wkurtosis.html');
const OUT = path.resolve(__dirname, '../../evidence/v27_entry45');
const log = (...a) => console.log(...a);
const trace = { date: new Date().toISOString(), probes: {} };

let PHASE = 'boot';
const pageErrors = [];
function wire(page) {
  page.on('pageerror', e => pageErrors.push({ phase: PHASE, message: e.message, stack: (e.stack || '').split('\n').slice(0, 8).join('\n') }));
}
async function setNum(page, id, val) {
  await page.fill('#' + id, '');
  if (val !== '' && val != null) await page.fill('#' + id, String(val));
  await page.dispatchEvent('#' + id, 'input');
  await page.dispatchEvent('#' + id, 'change');
}
async function uiState(page) {
  return await page.evaluate(() => {
    const g = id => { const el = document.getElementById(id); return el ? (el.tagName === 'INPUT' ? el.value : el.textContent.trim()) : null; };
    const p = Store.state.pool;
    return {
      dir: document.getElementById('band-dir-sell').dataset.dir,
      maxChip: g('band-sell-max'), notional: g('band-notional'),
      soldInner: g('sold-inner'), boughtInner: g('bought-inner'),
      slippage: g('band-slippage'), boughtDisplay: g('band-notional-bought-display'),
      dySold: g('pv-dy-sold'), dyBought: g('pv-dy-bought'), netCash: g('pv-net-cash'),
      Vsold: g('pv-sold-V'), Vbought: g('pv-bought-V'),
      warn: (document.getElementById('warn-area') || {}).innerText || '',
      executeDisabled: document.getElementById('btn-execute').disabled,
      pool: { x: p.x, y: +p.y.toFixed(2), phi: p.phi, tau: p.tau },
      kpiSpot: g('kpi-spot-usd'),
      evTail: Store.state.eventLog.slice(0, 3).map(e => e.kind + ': ' + e.msg)
    };
  });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
wire(page);
PHASE = 'P1';
await page.goto(FILE, { waitUntil: 'load' });
await page.waitForTimeout(600);

// ── P1: engine truth for the swapped band (dir=long: sold call 100000, bought put 52000, N=9.95)
{
  const r = await page.evaluate(() => {
    const s = Store.state, o = s.oracle;
    const sim = Engine.executeBand(s.pool, 'call', 'put', { inner: 100000 / o, outer: NaN }, { inner: 52000 / o, outer: NaN }, 9.95, o, s.oracle_initial);
    if (!sim.ok) return { ok: false, reason: sim.reason };
    return {
      ok: true,
      V_sell: sim.V_sell, V_buy: sim.V_buy, N_buy: sim.N_buy,
      leg1_dy: sim.leg1.dy, leg2_dy: sim.leg2.dy, netPoolY: sim.netPoolY,
      s_band: sim.slippage.s_band, slipUsd: sim.slippage.slipUsd,
      pool_pre: { x: s.pool.x, y: s.pool.y },
      final: { x: sim.finalState.x, y: sim.finalState.y, phi: sim.finalState.phi },
      leg1_newY: sim.leg1.newState.y, leg1_newX: sim.leg1.newState.x,
      display_netCash_wouldBe: sim.netPoolY * o
    };
  });
  log('\n══ P1 engine truth, swapped band (sold call100k / bought put52k, N=9.95) ══');
  log(JSON.stringify(r, null, 1));
  trace.probes.P1 = r;
}

// ── P2: operator-screenshot reproduction — valid long band -> ⇅ swap -> stale frankenstate
{
  PHASE = 'P2';
  await page.click('.tab[data-subtab="bands"]');
  await page.waitForTimeout(150);
  // dir stays default long; valid band: sold 100000 (OTM call), bought 52000 (OTM put), N=9.95
  await setNum(page, 'band-notional', 9.95);
  await setNum(page, 'sold-inner', 100000);
  await setNum(page, 'bought-inner', 52000);
  await page.waitForTimeout(250);
  const valid = await uiState(page);
  log('\n══ P2 valid long-side preview (pre-swap) ══');
  log(JSON.stringify({ dir: valid.dir, slippage: valid.slippage, nBuy: valid.boughtDisplay, netCash: valid.netCash, dySold: valid.dySold, dyBought: valid.dyBought, warn: valid.warn, execDisabled: valid.executeDisabled, maxChip: valid.maxChip }, null, 1));
  await page.screenshot({ path: path.join(OUT, 'P2_valid_long_preview.png') });
  PHASE = 'P2-SWAP';
  await page.click('#band-swap-btn');
  await page.waitForTimeout(300);
  const franken = await uiState(page);
  log('── after ⇅ swap (now displays sell 9.95 @ 52000, dir=short — operator screenshot layout) ──');
  log(JSON.stringify({ dir: franken.dir, soldInner: franken.soldInner, slippage: franken.slippage, nBuy: franken.boughtDisplay, netCash: franken.netCash, warn: franken.warn, execDisabled: franken.executeDisabled, maxChip: franken.maxChip }, null, 1));
  await page.screenshot({ path: path.join(OUT, 'P2_post_swap_frankenstate.png') });
  trace.probes.P2 = { valid, franken };
  log('STALE-READOUT CHECK: slippage text unchanged across swap =', valid.slippage === franken.slippage);
}

// ── P3a: execute click in the frankenstate (button should be disabled — verify)
{
  PHASE = 'P3a';
  const disabled = await page.evaluate(() => document.getElementById('btn-execute').disabled);
  log('\n══ P3a frankenstate execute button disabled =', disabled, '══');
  trace.probes.P3a = { executeDisabled: disabled };
}

// ── P3b: swap BACK to the valid long state ($3.19B netCash preview) and EXECUTE
{
  PHASE = 'P3b';
  await page.click('#band-swap-btn');
  await page.waitForTimeout(300);
  const pre = await uiState(page);
  log('\n══ P3b back on valid long band — netCash display:', pre.netCash, '| execDisabled:', pre.executeDisabled, '══');
  await page.screenshot({ path: path.join(OUT, 'P3b_valid_neg_netcash_preview.png') });
  PHASE = 'P3b-EXECUTE';
  await page.click('#btn-execute');
  await page.waitForTimeout(400);
  const post = await uiState(page);
  log('after EXECUTE click: pool:', JSON.stringify(post.pool), '| warn:', JSON.stringify(post.warn), '| kpiSpot:', post.kpiSpot);
  log('event log tail:', JSON.stringify(post.evTail));
  await page.screenshot({ path: path.join(OUT, 'P3b_after_execute_click.png') });
  trace.probes.P3b = { pre, post };
}

// ── P4: pill-click path ("switch long to short" literal) from a fresh valid state
{
  PHASE = 'P4';
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(600);
  await page.click('.tab[data-subtab="bands"]');
  await setNum(page, 'band-notional', 9.95);
  await setNum(page, 'sold-inner', 100000);
  await setNum(page, 'bought-inner', 52000);
  await page.waitForTimeout(250);
  const pre = await uiState(page);
  PHASE = 'P4-PILL';
  await page.click('#band-dir-sell');   // toggles dir WITHOUT swapping strike values
  await page.waitForTimeout(300);
  const post = await uiState(page);
  log('\n══ P4 pill-click (dir toggle, values NOT swapped) ══');
  log('pre :', JSON.stringify({ dir: pre.dir, slippage: pre.slippage, warn: pre.warn }));
  log('post:', JSON.stringify({ dir: post.dir, soldInner: post.soldInner, slippage: post.slippage, warn: post.warn, execDisabled: post.executeDisabled }));
  log('STALE-READOUT CHECK (pill): slippage unchanged =', pre.slippage === post.slippage);
  await page.screenshot({ path: path.join(OUT, 'P4_pill_toggle_stale.png') });
  trace.probes.P4 = { pre, post };
}

// ── P5: hunt the operator's 18.2297% — short-side band across tau (engine-level, fast)
{
  PHASE = 'P5';
  const r = await page.evaluate(() => {
    const s = Store.state, o = s.oracle;
    const out = [];
    for (let t = 0.05; t <= 3.001; t += 0.05) {
      const pool = Object.assign({}, s.pool, { tau: +t.toFixed(2) });
      const simShort = Engine.executeBand(pool, 'put', 'call', { inner: 52000 / o, outer: NaN }, { inner: 100000 / o, outer: NaN }, 9.95, o, s.oracle_initial);
      const simLong = Engine.executeBand(pool, 'call', 'put', { inner: 100000 / o, outer: NaN }, { inner: 52000 / o, outer: NaN }, 9.95, o, s.oracle_initial);
      out.push({
        tau: +t.toFixed(2),
        short: simShort.ok ? +(simShort.slippage.s_band * 100).toFixed(4) : 'REJ',
        long: simLong.ok ? +(simLong.slippage.s_band * 100).toFixed(4) : 'REJ',
        shortNbuy: simShort.ok ? +simShort.N_buy.toFixed(6) : null,
        longNbuy: simLong.ok ? +simLong.N_buy.toFixed(6) : null
      });
    }
    return out;
  });
  const hits = r.filter(x => (typeof x.short === 'number' && Math.abs(x.short - 18.2297) < 0.02) || (typeof x.long === 'number' && Math.abs(x.long - 18.2297) < 0.02));
  log('\n══ P5 tau sweep for 18.2297% / N_buy 0.536960 (short-side = operator layout) ══');
  log('tau rows (every 4th):', JSON.stringify(r.filter((_, i) => i % 4 === 0)));
  log('exact-ish hits:', JSON.stringify(hits));
  trace.probes.P5 = { sweep: r, hits };
}

// ── P6: warp scale redo — big club, 1 BTC then 2 BTC band executes (in-club)
{
  PHASE = 'P6';
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(600);
  await page.click('.tab[data-subtab="perps"]');
  await page.selectOption('#perp-side', 'long');
  await setNum(page, 'perp-notional', 5);        // 5 BTC notional club
  await setNum(page, 'perp-margin', 100000);
  await page.click('#btn-add-perp');
  await page.waitForTimeout(200);
  await page.click('.tab[data-subtab="bands"]');
  const phi0 = await page.evaluate(() => Store.state.pool.phi);
  await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, 'P6_warp_pre.png') });

  const doTrade = async (n) => {
    await setNum(page, 'band-notional', n);
    await setNum(page, 'sold-inner', 120000);
    await setNum(page, 'bought-inner', 68000);
    await page.waitForTimeout(250);
    const prev = await uiState(page);
    await page.click('#btn-execute');
    await page.waitForTimeout(400);
    const post = await uiState(page);
    return { n, previewSlip: prev.previewSlip || prev.slippage, execDisabled: prev.executeDisabled, postWarn: post.warn, phi: post.pool.phi, evTail: post.evTail };
  };
  const t1 = await doTrade(1);
  log('\n══ P6 warp scale ══');
  log('1 BTC band:', JSON.stringify(t1));
  const t2 = await doTrade(2);
  log('2 BTC band (cum):', JSON.stringify(t2));
  await setNum(page, 'band-notional', '');
  await page.waitForTimeout(250);
  await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, 'P6_warp_post_cum.png') });
  // analytic px displacement vs phi0 with the app frame
  const disp = await page.evaluate(({ phiA }) => {
    const p = Store.state.pool;
    function traceW(phiOv) {
      const pts = []; const N = 400;
      const wm = 0.5 * (p.wMinus + p.wPlus), dw2 = 0.5 * (p.wPlus - p.wMinus), tau = p.tau;
      const phi = phiOv; const u0 = Math.log(p.y / p.x);
      const kCur = wm * Math.log(p.x) + (1 - wm) * Math.log(p.y) - dw2 * Math.sqrt(tau * tau + (u0 - phi) * (u0 - phi));
      const uC = 0.5 * (u0 + phi), uSpan = Math.max(Math.abs(u0 - phi), 0) * 0.5 + 6;
      for (let i = 0; i <= N; i++) {
        const u = uC - uSpan + 2 * uSpan * i / N;
        const lnx = kCur - (1 - wm) * u + dw2 * Math.sqrt(tau * tau + (u - phi) * (u - phi));
        const x = Math.exp(lnx), y = x * Math.exp(u);
        if (isFinite(x) && isFinite(y) && x > 0 && y > 0) pts.push([x, y]);
      }
      return pts;
    }
    const cv = document.getElementById('canvas-curve');
    const W = cv.width, H = cv.height;
    const pad = { top: 18, right: 18, bottom: 44, left: 64 };
    const plotW = W - pad.left - pad.right, plotH = H - pad.top - pad.bottom;
    const fr = window.__curveFrame;
    const toPx = (x, y) => [pad.left + (x / fr.xMax) * plotW, pad.top + (1 - y / fr.yMax) * plotH];
    const A = traceW(phiA), B = traceW(p.phi);
    let maxD = 0, at = null;
    for (let i = 0; i < Math.min(A.length, B.length); i++) {
      const [xa, ya] = A[i], [xb, yb] = B[i];
      if ((xa > fr.xMax || ya > fr.yMax) && (xb > fr.xMax || yb > fr.yMax)) continue;
      const [p1x, p1y] = toPx(xa, ya), [p2x, p2y] = toPx(xb, yb);
      const d = Math.hypot(p2x - p1x, p2y - p1y);
      if (d > maxD) { maxD = d; at = [p1x.toFixed(0), p1y.toFixed(0)]; }
    }
    return { maxDispPx: +maxD.toFixed(2), at, phiNow: p.phi };
  }, { phiA: phi0 });
  log('cumulative analytic displacement vs boot phi:', JSON.stringify(disp), 'phi0=', phi0.toFixed(6));
  trace.probes.P6 = { phi0, t1, t2, disp };
}

await browser.close();
trace.pageErrors = pageErrors;
fs.writeFileSync(path.join(OUT, 'trace_probe2.json'), JSON.stringify(trace, null, 1));
log('\n══ uncaught exceptions:', pageErrors.length, '══');
for (const e of pageErrors) log('PAGEERROR [' + e.phase + ']:', e.message, '\n', e.stack);

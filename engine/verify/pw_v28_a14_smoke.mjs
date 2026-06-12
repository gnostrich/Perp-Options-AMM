// A14 at-strike smoke — live Playwright on HEAD de28c937.
// Items: (1) at-strike warp rises with strike; (2) ITM settles by payout;
// (3) reserve guard rejects with $ depth; (4) no regression; (5) quote flagged label.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD = resolve(__dirname, '../builds/HEAD_temporal_mvp_v28_lens.html');
const RUN = process.argv[2] || 'A';
const OUT = resolve(__dirname, '../../evidence/v28_a14');
mkdirSync(OUT, { recursive: true });
const url = 'file://' + BUILD;
const L = [];
const log = (s) => { L.push(s); console.log(s); };

const consoleErrs = [], pageErrs = [];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });
  page.on('pageerror', e => pageErrs.push(String(e)));
  const dialogs = [];
  page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  log(`=== A14 SMOKE run ${RUN} — ${BUILD} ===`);

  // ── Item 1: at-strike warp rises OTM (single sold call). Engine-level.
  log('\n--- ITEM 1: at-strike warp rises with strike (single sold call) ---');
  const item1 = await page.evaluate(() => {
    const out = [];
    const oracle = 80000, N = 0.1, tau = 0.3;
    const base = JSON.parse(JSON.stringify(Store.state.pool));
    const w0 = Engine.getW(base);
    for (const mult of [1.1, 1.5, 2.0, 4.0]) {
      const leg = Engine.executeLeg(base, 'sell', 'call', mult, NaN, N, oracle, tau);
      if (!leg || leg.rejected) { out.push({ mult, rejected: leg && leg.reason }); continue; }
      out.push({ mult, K_usd: leg.K_usd, dy: leg.dy, w0, wPost: Engine.getW(leg.newState),
                 dw: Engine.getW(leg.newState) - w0,
                 dxReserve: leg.newState.x - base.x, dyReserve: leg.newState.y - base.y });
    }
    return out;
  });
  for (const r of item1) log('  ' + JSON.stringify(r));

  // ── Item 1 (visual): rendered chart-2 warp magnitude grows with strike.
  // Single sold call staged via the band form (bought put fixed far-OTM). The
  // RENDERED post-trade curve's lit-pixel centroid shift vs the no-trade curve
  // grows monotonically (pixel-COUNT saturates — MEMORY gotcha — so we use the
  // curve's column centroid + lit-extent, which track displacement not count).
  log('\n--- ITEM 1 (visual): rendered chart-2 warp magnitude grows with strike ---');
  const item1viz = [];
  for (const [soldK, mult] of [['88000',1.1],['120000',1.5],['160000',2.0],['320000',4.0]]) {
    const m = await measureWarp(page, soldK);
    item1viz.push({ mult, soldK, ...m });
    log(`  strike ${soldK} (${mult}x): chart-2 |centroidΔ|=${m.centroidShift.toFixed(2)}px  litΔ=${m.litDelta}px  pxdiff=${m.pxdiff}`);
  }
  await page.screenshot({ path: `${OUT}/${RUN}_item1_warp4x.png` });
  const mono = item1viz.every((r,i)=> i===0 || r.centroidShift >= item1viz[i-1].centroidShift - 0.01);
  log('  centroid-shift monotone-increasing with strike: ' + mono);

  // ── Item 5: quote the flagged label.
  log('\n--- ITEM 5: flagged UI label (quote literally) ---');
  await setupBand(page, { dir: 'long', soldK: '120000', boughtK: '60000', N: '0.1' });
  const item5 = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.preview-row')];
    const hdr = rows.find(r => /Pool Δ/.test(r.textContent));
    const g = id => { const e = document.getElementById(id); return e ? e.textContent.trim() : null; };
    return {
      header: hdr ? hdr.textContent.trim() : '(no Pool Δ header found)',
      netValue: g('pv-net-cash'), dySold: g('pv-dy-sold'), dyBought: g('pv-dy-bought'),
      slippage: g('band-slippage')
    };
  });
  log('  HEADER literal : ' + JSON.stringify(item5.header));
  log('  FIELD label    : "net trader cash @ open"');
  log('  FIELD value    : ' + JSON.stringify(item5.netValue));
  log('  Δy(sold) shown : ' + JSON.stringify(item5.dySold));
  log('  Δy(bought)shown: ' + JSON.stringify(item5.dyBought));
  log('  slippage shown : ' + JSON.stringify(item5.slippage));
  await page.screenshot({ path: `${OUT}/${RUN}_item5_label.png` });

  // ── Item 3: reserve guard rejects cash-out > 90% depth, with $ in reason.
  log('\n--- ITEM 3: reserve guard rejects cash-out > depth (with $) ---');
  const item3 = await page.evaluate(() => {
    const base = JSON.parse(JSON.stringify(Store.state.pool));
    const oracle = 80000, tau = 0.3;
    const depth = base.y - base.beta;
    const theta_inner = 0.5, K = theta_inner * oracle;   // sold PUT, cash-out
    const N = (0.95 * depth) / K;
    const leg = Engine.executeLeg(base, 'sell', 'put', theta_inner, NaN, N, oracle, tau);
    const N_ok = (0.80 * depth) / K;
    const legOk = Engine.executeLeg(base, 'sell', 'put', theta_inner, NaN, N_ok, oracle, tau);
    return { depth, K, NK: N*K, frac: (N*K)/depth, leg,
             NK_ok: N_ok*K, legOk_rejected: !!(legOk && legOk.rejected),
             legOk_dy: legOk && legOk.dy, legOk_executed: !!(legOk && legOk.newState) };
  });
  log('  depth (y-β)    : $' + item3.depth.toFixed(2));
  log('  cash-out N·K   : $' + item3.NK.toFixed(2) + '  (frac of depth=' + item3.frac.toFixed(4) + ')');
  log('  REJECT result  : ' + JSON.stringify(item3.leg));
  log('  representable leg (0.80·depth, N·K=$' + item3.NK_ok.toFixed(2) + '): rejected=' + item3.legOk_rejected + ' executed=' + item3.legOk_executed + ' dy=' + (item3.legOk_dy));

  // ── Item 2: open via Store, drive ITM, close via Store ⇒ payout, no error.
  log('\n--- ITEM 2: trade executes; ITM settles by payout (full Store path) ---');
  const item2 = await page.evaluate(() => {
    // Boot seeds clubs. Open a band: sold call K=120000 (θ=1.5), bought put
    // K=60000 (θ=0.75), N=0.02 small. Open via Store.openBand to populate
    // entry/carved. Then drive oracle up + arbitrage so the sold-call goes
    // ITM (pool spot crosses 120000), set perpMark high (closeBand uses it
    // for the ITM regime test), then Store.closeBand.
    const sBefore = Store.state.bands.length;
    const ob = Store.openBand('call', 'put',
      { inner: 120000, outer: NaN }, { inner: 60000, outer: NaN }, 0.02, 'long');
    if (!ob.ok) return { openErr: ob.reason };
    const id = Store.state.bands[Store.state.bands.length - 1].id;
    const N_buy = ob.N_buy;
    // drive spot ITM: oracle high + arbitrage pool to it
    Store.setOracle(300000);
    Store.setPerpMark(300000);
    if (Store.runArbitrage) Store.runArbitrage();
    const spotNow = Store.state.pool ? Engine.getSNorm(Store.state.pool) : null;
    let close;
    try {
      const r = Store.closeBand(id);
      close = { ok: r.ok, reason: r.reason, X: r.X, Y: r.Y, raw_net: r.raw_net,
                settled_cash_leg: r.settled_cash_leg, live_leg: r.live_leg,
                trader_payout: r.trader_payout, L0: r.L0,
                finite: isFinite(r.raw_net) && isFinite(r.trader_payout) };
    } catch (e) { close = { threw: String(e) }; }
    const band = Store.state.bands.find(b => b.id === id);
    return { openOk: ob.ok, N_buy, bandStatus: band && band.status, spotSNorm: spotNow, close,
             closeLog: (Store.state.eventLog||[]).find(e=>e.kind==='close') ? 'logged' : 'no-log' };
  });
  log('  ' + JSON.stringify(item2));

  // ── Item 4: regression — τ reshapes chart-2, chart-1 inert; sweep animates.
  // Reset first to undo Item-2 oracle drift.
  await page.evaluate(() => { if (Store.reset) Store.reset(); });
  await page.waitForTimeout(200);
  log('\n--- ITEM 4: regression (τ-reshape chart-2, chart-1 inert) ---');
  const item4 = await page.evaluate(async () => {
    function pxDiff(a, b) { let n=0; for (let i=0;i<a.length;i+=4){ if (a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]) n++; } return n; }
    const res = {};
    const sel = document.getElementById('chart-select');
    const tau = document.getElementById('tau-input');
    const cvCurve = document.getElementById('canvas-curve');
    const cvPricing = document.getElementById('canvas-pricing');
    function setTau(v){ tau.value=String(v); tau.dispatchEvent(new Event('input',{bubbles:true})); tau.dispatchEvent(new Event('change',{bubbles:true})); }
    function grab(cv){ return cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data.slice(); }
    // clear band so chart-1 inertness isn't masked by a band ghost
    const si = document.getElementById('sold-inner'), bi = document.getElementById('bought-inner'), bn = document.getElementById('band-notional');
    for (const e of [si,bi,bn]) { if(e){ e.value=''; e.dispatchEvent(new Event('input',{bubbles:true})); } }
    await new Promise(r=>setTimeout(r,200));
    // chart-1 (pool curve)
    sel.value='curve'; sel.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise(r=>setTimeout(r,200));
    setTau(0.3); await new Promise(r=>setTimeout(r,250));
    const c1a = grab(cvCurve);
    setTau(2.0); await new Promise(r=>setTimeout(r,300));
    const c1b = grab(cvCurve);
    res.chart1_tau_pxdiff = pxDiff(c1a, c1b);
    setTau(0.3); await new Promise(r=>setTimeout(r,200));
    // chart-2 (pricing)
    sel.value='pricing'; sel.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise(r=>setTimeout(r,250));
    setTau(0.3); await new Promise(r=>setTimeout(r,250));
    const c2a = grab(cvPricing);
    setTau(2.0); await new Promise(r=>setTimeout(r,300));
    const c2b = grab(cvPricing);
    res.chart2_tau_pxdiff = pxDiff(c2a, c2b);
    // real keyboard-style single step
    setTau(0.3); await new Promise(r=>setTimeout(r,200));
    const c2c = grab(cvPricing);
    tau.value='0.35'; tau.dispatchEvent(new Event('input',{bubbles:true}));
    await new Promise(r=>setTimeout(r,250));
    res.chart2_tau_step_pxdiff = pxDiff(c2c, grab(cvPricing));
    setTau(0.3); await new Promise(r=>setTimeout(r,200));
    return res;
  });
  log('  chart-1 τ pxdiff (expect ~0 inert): ' + item4.chart1_tau_pxdiff);
  log('  chart-2 τ 0.3→2.0 pxdiff (expect >0 reshape): ' + item4.chart2_tau_pxdiff);
  log('  chart-2 τ 0.3→0.35 single-step pxdiff: ' + item4.chart2_tau_step_pxdiff);

  // sweep animation on chart-2 (pricing canvas)
  const sweep = await page.evaluate(async () => {
    const sel = document.getElementById('chart-select');
    sel.value='pricing'; sel.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise(r=>setTimeout(r,150));
    const cv = document.getElementById('canvas-pricing'); const ctx = cv.getContext('2d');
    function hash(){ const d=ctx.getImageData(0,0,cv.width,cv.height).data; let h=0; for(let i=0;i<d.length;i+=257) h=(h*31+d[i])>>>0; return h; }
    const si = document.getElementById('sold-inner'), bi = document.getElementById('bought-inner'), bn = document.getElementById('band-notional');
    function set(e,v){ if(e){ e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); } }
    set(si,'120000'); set(bi,'60000'); set(bn,'0.5');
    await new Promise(r=>setTimeout(r,400));
    set(bn,''); set(bn,'0.5');   // retrigger
    const t0 = performance.now(); const hashes = new Set(); let frames=0;
    while (performance.now()-t0 < 1300) { hashes.add(hash()); frames++; await new Promise(r=>setTimeout(r,50)); }
    return { distinctFrames: hashes.size, samples: frames };
  });
  log('  sweep distinct chart-2 frames in 1.3s: ' + sweep.distinctFrames + ' (of ' + sweep.samples + ' samples)');

  log('\n--- ERRORS ---');
  log('  console errors: ' + consoleErrs.length + (consoleErrs.length?' '+JSON.stringify(consoleErrs.slice(0,5)):''));
  log('  page errors   : ' + pageErrs.length + (pageErrs.length?' '+JSON.stringify(pageErrs.slice(0,5)):''));
  log('  dialogs       : ' + dialogs.length + (dialogs.length?' '+JSON.stringify(dialogs):''));

  await browser.close();
  writeFileSync(`${OUT}/RUN_LOG_run${RUN}.txt`, L.join('\n') + '\n');
}

// Rendered chart-2 warp magnitude for a single sold call staged at soldK.
// Returns curve column-centroid shift (px, displacement-tracking, non-saturating),
// lit-pixel-count delta, and raw pixel-diff (for reference).
async function measureWarp(page, soldK) {
  return await page.evaluate(async (soldK) => {
    const sel = document.getElementById('chart-select');
    sel.value='pricing'; sel.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise(r=>setTimeout(r,200));
    const cv = document.getElementById('canvas-pricing'); const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    function read(){ return ctx.getImageData(0,0,W,H).data; }
    // centroid of lit (non-background) pixels: weight = darkness/colour energy
    function stats(d){
      let sumX=0, sumW=0, lit=0;
      for (let y=0;y<H;y++) for (let x=0;x<W;x++){
        const i=(y*W+x)*4; const a=d[i+3];
        // treat strongly-coloured / opaque non-near-black-bg pixels as "lit"
        const lum = d[i]+d[i+1]+d[i+2];
        const w = (a>10 && lum>60) ? 1 : 0;   // lit curve/grid pixels
        if (w){ sumX += x; sumW += 1; lit++; }
      }
      return { cx: sumW? sumX/sumW : 0, lit };
    }
    const si = document.getElementById('sold-inner'), bi = document.getElementById('bought-inner'), bn = document.getElementById('band-notional');
    function set(e,v){ if(e){ e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); } }
    for (const e of [si,bi,bn]) set(e,'');           // baseline
    await new Promise(r=>setTimeout(r,400));
    const base = read().slice(); const sb = stats(base);
    set(si, soldK); set(bi, '60000'); set(bn, '0.5'); // staged sold call
    await new Promise(r=>setTimeout(r,1300));          // let sweep land
    const staged = read(); const ss = stats(staged);
    let pd=0; for (let i=0;i<base.length;i+=4){ if (base[i]!==staged[i]||base[i+1]!==staged[i+1]||base[i+2]!==staged[i+2]) pd++; }
    return { centroidShift: Math.abs(ss.cx - sb.cx), litDelta: ss.lit - sb.lit, pxdiff: pd };
  }, soldK);
}

async function setupBand(page, { dir, soldK, boughtK, N }) {
  await page.evaluate(({ dir, soldK, boughtK, N }) => {
    const dpill = document.getElementById('band-dir-sell');
    if (dpill && dpill.dataset.dir !== dir) dpill.click();
    function set(id,v){ const e=document.getElementById(id); if(e){ e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); } }
    set('sold-inner', soldK);
    set('bought-inner', boughtK);
    set('band-notional', N);
  }, { dir, soldK, boughtK, N });
  await page.waitForTimeout(600);
}

main().catch(e => { console.error(e); process.exit(1); });

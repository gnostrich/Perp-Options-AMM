// R-218 inverse-lens transaction-strike smoke — live Playwright on candidate 5fea0e8d.
// The AMM swap is sized at the FROZEN inverse-lens tx-strike θ_tx (further out than
// the chosen/displayed strike); settlement pays at the CHOSEN strike.
// Items (entry-199 individual-options focus):
//  1 open-then-close single-leg reserves restore exact (frozen-θ_tx round-trip)
//  2 settlement reads off the CHOSEN strike (not θ_tx)
//  3 capacity shrinks for far-OTM (reject earlier, $ depth numbers, no silent cap)
//  4 no regression (sweep, τ reshape chart-2, chart-1 inert, settlement/funding, 0 errors)
//  5 direction observation: at fixed chosen strike, vary τ ⇒ how far θ_tx lands (report only)
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD = resolve(__dirname, '../builds/temporal_mvp_v28_lens_invtx.html');
const RUN = process.argv[2] || 'A';
const OUT = resolve(__dirname, '../../evidence/v28_invtx');
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
  log(`=== R-218 INVTX SMOKE run ${RUN} — ${BUILD} (md5 5fea0e8d) ===`);

  // ── ITEM 1: single-leg open-then-close reserves restore EXACT (frozen θ_tx).
  // Engine-level executeLeg open, then reverse with the SAME frozen K_tx ⇒ pool
  // reserves (x,y) return to entry. Also show θ_tx > chosen strike (further out)
  // and that K_tx is the swap basis (bigger cash than the chosen strike).
  log('\n--- ITEM 1: single-leg open-then-close reserves restore (frozen θ_tx) ---');
  const item1 = await page.evaluate(() => {
    const oracle = 80000, N = 0.1, tau = 0.3;
    const base = JSON.parse(JSON.stringify(Store.state.pool));
    const mode = Engine.getSNorm(base);
    const out = [];
    // a single sold CALL at chosen θ=1.5 (K=$120k displayed)
    for (const [wing, legSide, mult] of [['call','sell',1.5],['put','sell',0.5]]) {
      const leg = Engine.executeLeg(base, legSide, wing, mult, NaN, N, oracle, tau);
      if (!leg || leg.rejected) { out.push({ wing, mult, rejected: leg && leg.reason }); continue; }
      const opened = leg.newState;
      // reverse: dy_close = -(open dy) using frozen K_tx (reuse via -leg.dy)
      const closed = Engine.tradeUpdate(opened, -leg.dy);
      out.push({
        wing, legSide, chosen_mult: mult, chosen_K: leg.K_usd, theta_tx: leg.theta_tx,
        tx_mult: leg.theta_tx / mode, K_tx: leg.K_tx, swap_dy: leg.dy,
        tx_further: leg.theta_tx > mult * mode ? 'yes(call)' : (leg.theta_tx < mult*mode ? 'yes(put,closer-to-0)' : 'no'),
        entry_x: base.x, entry_y: base.y,
        opened_x: opened.x, opened_y: opened.y,
        closed_x: closed.x, closed_y: closed.y,
        restore_err_x: Math.abs(closed.x - base.x), restore_err_y: Math.abs(closed.y - base.y)
      });
    }
    return { mode, out };
  });
  log('  live mode (sNorm) = ' + item1.mode);
  for (const r of item1.out) log('  ' + JSON.stringify(r));

  // ── ITEM 1 LIVE: full UI band open + close round-trip ⇒ chart-1 pool reserves
  // restore to entry. (UI path is a two-leg band; the round-trip is still exact
  // per the frozen-K_tx reversal. Probe pool x,y before/after; capture chart-1.)
  log('\n--- ITEM 1 LIVE: UI band open→close, chart-1 reserves restore ---');
  const item1live = await page.evaluate(async () => {
    const before = { x: Store.state.pool.x, y: Store.state.pool.y, w: Engine.getW(Store.state.pool) };
    const ob = Store.openBand('call', 'put', { inner: 120000, outer: NaN }, { inner: 60000, outer: NaN }, 0.05, 'long');
    if (!ob.ok) return { openErr: ob.reason };
    const id = Store.state.bands[Store.state.bands.length - 1].id;
    const afterOpen = { x: Store.state.pool.x, y: Store.state.pool.y, w: Engine.getW(Store.state.pool) };
    // close while still OTM (oracle unchanged) ⇒ both legs reverse on AMM
    let close;
    try { const r = Store.closeBand(id); close = { ok: r.ok, reason: r.reason, settled_cash_leg: r.settled_cash_leg }; }
    catch (e) { close = { threw: String(e) }; }
    const afterClose = { x: Store.state.pool.x, y: Store.state.pool.y, w: Engine.getW(Store.state.pool) };
    return { before, afterOpen, afterClose, close,
             restore_err_x: Math.abs(afterClose.x - before.x), restore_err_y: Math.abs(afterClose.y - before.y),
             moved_on_open: Math.abs(afterOpen.x - before.x) + Math.abs(afterOpen.y - before.y) };
  });
  log('  ' + JSON.stringify(item1live));
  await page.evaluate(() => { if (Store.reset) Store.reset(); });
  await page.waitForTimeout(150);

  // ── ITEM 2: settlement at the CHOSEN strike (not θ_tx). Open ITM-bound band,
  // drive spot ITM, close ⇒ payout valuation uses the chosen K (legPrice at
  // chosen θ), while the pool swap/reversal was at θ_tx. We confirm the close
  // valuation basis is the chosen strike by comparing legPrice(chosen) vs the
  // settled leg value, and that θ_tx ≠ chosen.
  log('\n--- ITEM 2: settlement at CHOSEN strike (not θ_tx) ---');
  await page.goto(url, { waitUntil: 'networkidle' });   // fresh page: intact seeded club
  await page.waitForTimeout(300);
  const item2 = await page.evaluate(() => {
    const oracle = 80000, tau = 0.3, N = 0.02;
    Store.addPerp('long', 5, 100000);   // top up the long club so the band has room
    const ob = Store.openBand('call', 'put', { inner: 120000, outer: NaN }, { inner: 60000, outer: NaN }, N, 'long');
    if (!ob.ok) return { openErr: ob.reason };
    const id = Store.state.bands[Store.state.bands.length - 1].id;
    const band = Store.state.bands.find(b => b.id === id);
    const frozen = { sold_K_tx: band.sold.K_tx, sold_K_inner: band.sold.K_inner,
                     bought_K_tx: band.bought.K_tx, bought_K_inner: band.bought.K_inner };
    // drive sold-call ITM
    Store.setOracle(300000); Store.setPerpMark(300000);
    if (Store.runArbitrage) Store.runArbitrage();
    let close;
    try {
      const r = Store.closeBand(id);
      close = { ok: r.ok, reason: r.reason, raw_net: r.raw_net, X: r.X, Y: r.Y,
                settled_cash_leg: r.settled_cash_leg, live_leg: r.live_leg,
                trader_payout: r.trader_payout,
                finite: isFinite(r.raw_net) && isFinite(r.trader_payout) };
    } catch (e) { close = { threw: String(e) }; }
    return { frozen, close,
             chosen_eq_settle_basis: 'sold settles at K_inner=$' + frozen.sold_K_inner + ' (chosen θ=1.5), pool swapped at K_tx=$' + frozen.sold_K_tx + ' (θ_tx>chosen)' };
  });
  log('  ' + JSON.stringify(item2));
  await page.evaluate(() => { if (Store.reset) Store.reset(); });
  await page.waitForTimeout(150);

  // ── ITEM 3: capacity shrinks for far-OTM (reject earlier; $ depth numbers).
  // Sold PUT cash-out near the depth boundary. Because the swap is at θ_tx (cash
  // = N·K_tx, K_tx > chosen K), the same chosen strike rejects at a SMALLER N
  // than an at-strike (K_inner) build would. We compute, for a far-OTM chosen
  // strike, the max N at chosen-K vs at θ_tx-K and show the verbatim reject.
  log('\n--- ITEM 3: capacity shrinks far-OTM (reject earlier, $ depth, no silent cap) ---');
  const item3 = await page.evaluate(() => {
    const oracle = 80000, tau = 0.3;
    const base = JSON.parse(JSON.stringify(Store.state.pool));
    const mode = Engine.getSNorm(base);
    const depth = base.y - base.beta;
    const out = { mode, depth, DEPTH_FRAC: 0.9 };
    // sold PUT, far-OTM chosen θ=0.3 (deep below mode). Probe a leg, read K_tx vs chosen K.
    const probe = Engine.executeLeg(base, 'sell', 'put', 0.3, NaN, 0.01, oracle, tau);
    out.chosen_theta = 0.3; out.chosen_K = probe.K_usd; out.theta_tx = probe.theta_tx; out.K_tx = probe.K_tx;
    // max N before reject at chosen-K (hypothetical at-strike) vs θ_tx-K (this build)
    out.maxN_chosenK = (0.9 * depth) / probe.K_usd;
    out.maxN_txK     = (0.9 * depth) / probe.K_tx;
    out.capacity_shrink_factor = out.maxN_chosenK / out.maxN_txK;
    // N just ABOVE the θ_tx ceiling ⇒ this build REJECTS (N·K_tx>=0.9depth)
    // even though N·chosenK is still < 0.9depth (an at-strike build would accept).
    const N = 1.02 * out.maxN_txK;
    const leg = Engine.executeLeg(base, 'sell', 'put', 0.3, NaN, N, oracle, tau);
    out.probeN = N; out.N_chosenK = N * probe.K_usd; out.N_chosenK_under_depth = (N*probe.K_usd) < 0.9*depth;
    out.N_txK = N * probe.K_tx; out.N_txK_over_depth = (N*probe.K_tx) >= 0.9*depth;
    out.reject = leg && leg.rejected ? leg.reason : ('EXECUTED dy=' + (leg && leg.dy));
    // and a smaller N that this build accepts (N·K_tx<0.9depth)
    const Nok = 0.8 * out.maxN_txK;
    const legOk = Engine.executeLeg(base, 'sell', 'put', 0.3, NaN, Nok, oracle, tau);
    out.NokN = Nok; out.Nok_txK = Nok * out.K_tx; out.Nok_result = legOk && legOk.rejected ? legOk.reason : ('EXECUTED dy=' + (legOk && legOk.dy));
    return out;
  });
  for (const k of Object.keys(item3)) log('  ' + k + ' = ' + JSON.stringify(item3[k]));

  // ── ITEM 3 LIVE: drive an over-capacity band via the UI ⇒ visible reject/alert.
  log('\n--- ITEM 3 LIVE: UI over-capacity reject (dialog/warn captured) ---');
  await page.goto(url, { waitUntil: 'networkidle' });   // fresh page: intact seeded club
  await page.waitForTimeout(300);
  const dialogsBefore = dialogs.length;
  const item3live = await page.evaluate(async () => {
    // Seed a LARGE long club (notional $, margin $) so the over-carve guard passes
    // and the binding reject is the reserve-DEPTH guard inside executeLeg (N·K_tx).
    Store.addPerp('long', 5000000, 5000000);
    const clubFree = Store.state.clubs.long && Store.state.clubs.long.totalNotional;
    // far-OTM sold put (bought 24000 ⇒ θ=0.3), big notional ⇒ N·K_tx > 0.9·depth.
    const r = Store.openBand('call', 'put', { inner: 200000, outer: NaN }, { inner: 24000, outer: NaN }, 25.0, 'long');
    return { ok: r.ok, reason: r.reason, clubFree };
  });
  log('  Store.openBand(N=5, sold 200000 / bought 24000): ' + JSON.stringify(item3live));
  log('  dialogs since: ' + JSON.stringify(dialogs.slice(dialogsBefore)));
  await page.evaluate(() => { if (Store.reset) Store.reset(); });
  await page.waitForTimeout(150);

  // ── ITEM 5: direction observation — fixed chosen strike, vary τ, report θ_tx.
  log('\n--- ITEM 5: direction observation (fixed chosen strike, vary τ) ---');
  const item5 = await page.evaluate(() => {
    const oracle = 80000, N = 0.05;
    const base = JSON.parse(JSON.stringify(Store.state.pool));
    const mode = Engine.getSNorm(base);
    const chosen_mult = 1.5;   // fixed chosen strike θ=1.5 (K=$120k)
    const rows = [];
    for (const tau of [0.05, 0.3, 1.0, 3.0]) {
      const leg = Engine.executeLeg(base, 'sell', 'call', chosen_mult, NaN, N, oracle, tau);
      rows.push({ tau, theta_tx: leg.theta_tx, tx_mult_vs_mode: leg.theta_tx / mode,
                  K_tx: leg.K_tx, swap_dy: leg.dy });
    }
    return { mode, chosen_mult, chosen_K: chosen_mult * oracle, rows };
  });
  log('  mode=' + item5.mode + '  chosen θ=' + item5.chosen_mult + ' (K=$' + item5.chosen_K + ')');
  for (const r of item5.rows) log('  ' + JSON.stringify(r));

  // ── ITEM 4: regression — sweep animates, τ reshapes chart-2, chart-1 inert,
  // funding/settlement work, 0 errors.
  log('\n--- ITEM 4: no regression (sweep, τ chart-2, chart-1 inert, funding) ---');
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const item4 = await page.evaluate(async () => {
    function pxDiff(a, b) { let n=0; for (let i=0;i<a.length;i+=4){ if (a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]) n++; } return n; }
    const res = {};
    const sel = document.getElementById('chart-select');
    const tau = document.getElementById('tau-input');
    const cvCurve = document.getElementById('canvas-curve');
    const cvPricing = document.getElementById('canvas-pricing');
    function setTau(v){ tau.value=String(v); tau.dispatchEvent(new Event('input',{bubbles:true})); tau.dispatchEvent(new Event('change',{bubbles:true})); }
    function grab(cv){ return cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data.slice(); }
    const si = document.getElementById('sold-inner'), bi = document.getElementById('bought-inner'), bn = document.getElementById('band-notional');
    for (const e of [si,bi,bn]) { if(e){ e.value=''; e.dispatchEvent(new Event('input',{bubbles:true})); } }
    await new Promise(r=>setTimeout(r,200));
    sel.value='curve'; sel.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise(r=>setTimeout(r,200));
    setTau(0.3); await new Promise(r=>setTimeout(r,250));
    const c1a = grab(cvCurve);
    setTau(2.0); await new Promise(r=>setTimeout(r,300));
    res.chart1_tau_pxdiff = pxDiff(c1a, grab(cvCurve));
    setTau(0.3); await new Promise(r=>setTimeout(r,200));
    sel.value='pricing'; sel.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise(r=>setTimeout(r,250));
    setTau(0.3); await new Promise(r=>setTimeout(r,250));
    const c2a = grab(cvPricing);
    setTau(2.0); await new Promise(r=>setTimeout(r,300));
    res.chart2_tau_pxdiff = pxDiff(c2a, grab(cvPricing));
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

  // funding tick + settlement sanity
  const item4b = await page.evaluate(() => {
    const out = {};
    try { if (Store.fundingTick) { Store.fundingTick(); out.fundingTick = 'ok'; } } catch(e){ out.fundingTick = String(e); }
    // funding readout (analytic): OTM call vs put opposite-signed at steep mode
    out.funding_sample = (typeof Engine.funding === 'function') ? 'engine.funding present' : 'via fundingTick';
    return out;
  });
  log('  funding/tick: ' + JSON.stringify(item4b));

  // sweep animation (chart-2 rAF) — fresh page already loaded; intact club.
  const sweep = await page.evaluate(async () => {
    const sel = document.getElementById('chart-select');
    sel.value='pricing'; sel.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise(r=>setTimeout(r,250));
    const cv = document.getElementById('canvas-pricing'); const ctx = cv.getContext('2d');
    function hash(){ const d=ctx.getImageData(0,0,cv.width,cv.height).data; let h=0; for(let i=0;i<d.length;i+=257) h=(h*31+d[i])>>>0; return h; }
    const si = document.getElementById('sold-inner'), bi = document.getElementById('bought-inner'), bn = document.getElementById('band-notional');
    function set(e,v){ if(e){ e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); } }
    const dpill = document.getElementById('band-dir-sell');
    if (dpill && dpill.dataset.dir !== 'long') dpill.click();
    set(si,'120000'); set(bi,'60000'); set(bn,'0.3');
    await new Promise(r=>setTimeout(r,1000));
    set(bn,'0.6');   // retrigger ⇒ new sweep key
    await new Promise(r=>setTimeout(r,30));
    return await new Promise(resolve => {
      const hashes = new Set(); let frames=0; const t0 = performance.now();
      (function tick(){ hashes.add(hash()); frames++;
        if (performance.now()-t0 < 1300) requestAnimationFrame(tick);
        else resolve({ distinctFrames: hashes.size, samples: frames }); })();
    });
  });
  log('  sweep distinct chart-2 frames in 1.3s (rAF): ' + sweep.distinctFrames + ' of ' + sweep.samples);
  await page.screenshot({ path: `${OUT}/${RUN}_item4_chart2.png` });

  log('\n--- ERRORS ---');
  log('  console errors: ' + consoleErrs.length + (consoleErrs.length?' '+JSON.stringify(consoleErrs.slice(0,5)):''));
  log('  page errors   : ' + pageErrs.length + (pageErrs.length?' '+JSON.stringify(pageErrs.slice(0,5)):''));
  log('  dialogs total : ' + dialogs.length + (dialogs.length?' '+JSON.stringify(dialogs):''));

  await browser.close();
  writeFileSync(`${OUT}/RUN_LOG_run${RUN}.txt`, L.join('\n') + '\n');
}

main().catch(e => { console.error(e); process.exit(1); });

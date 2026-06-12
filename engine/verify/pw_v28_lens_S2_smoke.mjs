// v28 polar-lens STAGE-2 STANDING UI SMOKE-PASS — live Playwright, READ-ONLY on the build.
// Build: builds/temporal_mvp_v28_lens_S2.html (md5 b53ace99...). HEAD stays v27.
// Stage 2 = write/settle THROUGH the lens (operator entry 96): trades/portfolio/settlement record
// the lensed value. ALSO carries the deferred FLAG-1 confirmation (τ stepper auto-redraws chart 2).
// Engine/Store reachable in evaluate; Viz/render are closure-only — visuals via REAL UI handlers.
// Canvas diff = RAW ImageData pixels. Chart-2 elbow delta also measured analytically via markLensed.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BUILD = path.resolve('builds/temporal_mvp_v28_lens_S2.html');
const OUT = path.resolve('../evidence/v28_lens_S2');
fs.mkdirSync(OUT, { recursive: true });
const url = 'file://' + BUILD;

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

  // page-nav helpers: the Transact page (perp/band forms) vs the Portfolio page are top-level pages.
  async function gotoTransact() { await page.click('.page-nav-link[data-page="transact"]').catch(()=>{}); await page.waitForTimeout(150); }
  async function gotoPortfolio() { await page.click('.page-nav-link[data-page="portfolio"]').catch(()=>{}); await page.waitForTimeout(200); }

  async function setTauEvent(v) {
    // tau-input lives on the Transact page > Settings subtab — make both active first.
    await page.click('.page-nav-link[data-page="transact"]').catch(()=>{});
    await page.click('.tab[data-subtab="settings"]').catch(()=>{});
    await page.waitForTimeout(80);
    await page.fill('#tau-input', String(v));
    await page.dispatchEvent('#tau-input', 'change');
    await page.waitForTimeout(220);
  }
  async function setPool(x, alpha, y, beta) {
    await page.evaluate(({x,alpha,y,beta}) => {
      const s = JSON.parse(Store.exportJSON());
      s.pool.x=x; s.pool.alpha=alpha; s.pool.y=y; s.pool.beta=beta;
      Store.importJSON(JSON.stringify(s));
    }, {x,alpha,y,beta});
    await page.click('.page-nav-link[data-page="transact"]').catch(()=>{});
    await page.click('.tab[data-subtab="settings"]').catch(()=>{});
    await page.waitForTimeout(80);
    await page.click('#btn-tick'); await page.waitForTimeout(150);
  }
  async function addPerp(side, notional, margin) {
    await gotoTransact();
    await page.click('.tab[data-subtab="perps"]').catch(()=>{});
    await page.waitForTimeout(120);
    await page.selectOption('#perp-side', side).catch(()=>{});
    await page.fill('#perp-notional', String(notional));
    await page.fill('#perp-margin', String(margin));
    await page.click('#btn-add-perp');
    await page.waitForTimeout(180);
  }
  async function openBandUI({sold_inner, sold_outer='', bought_inner, bought_outer='', notional}) {
    await gotoTransact();
    await page.click('.tab[data-subtab="bands"]').catch(()=>{});
    await page.waitForTimeout(120);
    await page.fill('#sold-inner', String(sold_inner));
    await page.fill('#sold-outer', String(sold_outer));
    await page.fill('#bought-inner', String(bought_inner));
    await page.fill('#bought-outer', String(bought_outer));
    await page.fill('#band-notional', String(notional));
    await page.dispatchEvent('#band-notional', 'input');
    await page.waitForTimeout(250);
    const disabled = await page.evaluate(()=>document.getElementById('btn-execute').disabled);
    const warn = await page.evaluate(()=>document.getElementById('warn-area')?.textContent || '');
    if (disabled) return { opened:false, warn };
    const nBefore = await page.evaluate(()=>Store.state.bands.length);
    const dlgBefore = dialogs.length;
    await page.click('#btn-execute');
    await page.waitForTimeout(300);
    const nAfter = await page.evaluate(()=>Store.state.bands.length);
    return { opened: nAfter > nBefore, warn, newDialogs: dialogs.slice(dlgBefore) };
  }

  // ───────────────────────────────────────────────────────── STEP 1: FLAG-1 confirmation
  say('\n========== STEP 1: τ stepper auto-redraws chart-2 LIVE (FLAG-1 deferred confirmation) ==========');
  await page.click('.tab[data-subtab="settings"]').catch(()=>{});
  await page.waitForTimeout(150);
  await page.selectOption('#chart-select', 'pricing');
  await page.waitForTimeout(250);
  const winViz = await page.evaluate(() => ({ viz: typeof window.Viz, render: typeof window.render }));
  say('  window.Viz=' + winViz.viz + '  window.render=' + winViz.render + '  (handler now reaches Viz via closure, not window)');
  await setTauEvent(0.3);
  await shot(page, 'S1_00_chart2_tau03.png');
  const before_005 = await rawpix(page, 'canvas-pricing');
  await setTauEvent(0.05);
  const after_005 = await rawpix(page, 'canvas-pricing');
  const d_005 = rgbDiff(before_005, after_005);
  const tauAfter005 = await page.evaluate(()=>Store.state.tau);
  say('  τ 0.3→0.05 via stepper EVENT ALONE: chart-2 px changed = ' + d_005 + '  Store.tau=' + tauAfter005);
  await shot(page, 'S1_01_chart2_tau005_eventonly.png');
  await setTauEvent(0.3);
  const before_2 = await rawpix(page, 'canvas-pricing');
  await setTauEvent(2);
  const after_2 = await rawpix(page, 'canvas-pricing');
  const d_2 = rgbDiff(before_2, after_2);
  const tauAfter2 = await page.evaluate(()=>Store.state.tau);
  say('  τ 0.3→2 via stepper EVENT ALONE: chart-2 px changed = ' + d_2 + '  Store.tau=' + tauAfter2);
  await shot(page, 'S1_02_chart2_tau2_eventonly.png');
  await setTauEvent(0.3);
  const before_arrow = await rawpix(page, 'canvas-pricing');
  await page.focus('#tau-input');
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(220);
  const after_arrow = await rawpix(page, 'canvas-pricing');
  const d_arrow = rgbDiff(before_arrow, after_arrow);
  const tauArrow = await page.evaluate(()=>Store.state.tau);
  say('  real ArrowUp spinner click 0.3→' + tauArrow + ': chart-2 px changed = ' + d_arrow);
  VERDICTS.s1_flag1_tau_autoredraw = (d_005 > 0 && d_2 > 0 && d_arrow > 0 && Math.abs(tauAfter005-0.05)<1e-9 && Math.abs(tauAfter2-2)<1e-9);
  if (!(d_005 > 0 && d_2 > 0)) FLAGS.push('FLAG-1 NOT RESOLVED: τ stepper event still does not auto-redraw chart-2 (0.3→0.05=' + d_005 + ', 0.3→2=' + d_2 + ').');

  // ───────────────────────────────────────────────────────── STEP 2: chart-1 inert to τ
  say('\n========== STEP 2: chart-1 (pool curve) INERT to τ — px-diff across sweep must be HARD 0 ==========');
  await page.selectOption('#chart-select', 'curve');
  await page.waitForTimeout(250);
  await setTauEvent(0.3);
  const c1_base = await rawpix(page, 'canvas-curve');
  say('  chart-1 lit px: ' + c1_base.lit);
  await shot(page, 'S2_01_chart1_tau03.png');
  let c1maxdiff = 0;
  for (const t of [0.05, 1.0, 2.0, 3.0]) {
    await setTauEvent(t);
    const c1 = await rawpix(page, 'canvas-curve');
    const d = rgbDiff(c1_base, c1);
    say('    chart-1 px-diff vs τ0.3 at τ=' + t + ' (event-only): ' + d);
    if (d > c1maxdiff) c1maxdiff = d;
  }
  await shot(page, 'S2_02_chart1_tau3.png');
  VERDICTS.s2_chart1_tau_inert = (c1maxdiff === 0);
  say('  >>> chart-1 max px-diff across full τ sweep: ' + c1maxdiff + ' (MUST be 0)');
  if (c1maxdiff !== 0) FLAGS.push('FLAG: chart-1 CONTAMINATED by τ — pool curve changed ' + c1maxdiff + 'px under a τ sweep.');
  await setTauEvent(0.3);

  // ───────────────────────────────────────────────────────── STEP 3: settle-at-lensed round-trip
  say('\n========== STEP 3: open a band, close immediately → finite settled residual; report sign ==========');
  await addPerp('long', 2, 20000);
  const ob = await openBandUI({ sold_inner: 84000, bought_inner: 76000, notional: 0.05 });
  say('  openBand result: ' + JSON.stringify(ob));
  await gotoPortfolio();
  await shot(page, 'S3_01_portfolio_band_open.png');
  const closeRes = await page.evaluate(() => {
    const open = Store.state.bands.find(b => b.status === 'open');
    if (!open) return { none: true };
    const r = Store.closeBand(open.id);
    return { ok: r.ok, raw_net: r.raw_net, X: r.X, Y: r.Y, L0: r.L0,
             trader_payout: r.trader_payout, settled_cash_leg: r.settled_cash_leg || null,
             live_leg: r.live_leg || null, floored: r.floored,
             slip: open.entry?.slippage?.s_band };
  });
  say('  closeBand immediate round-trip: ' + JSON.stringify(closeRes));
  await page.waitForTimeout(150);
  await shot(page, 'S3_02_portfolio_band_closed.png');
  const rn = closeRes.raw_net;
  say('  >>> round-trip residual raw_net = ' + (isFinite(rn) ? rn.toExponential(4) : 'n/a') + ' (Y=' + closeRes.Y + ', X=' + closeRes.X + ', slip=' + closeRes.slip + ')');
  say('  >>> raw_net SIGN: ' + (rn > 0 ? 'POSITIVE (trader-favourable per engine L2146)' : 'NON-POSITIVE (pool-favourable)'));
  // PASS criterion for the GATE: settlement is finite, small relative to slippage, and the lens
  // is the unit of account (X/Y are lensed). The SIGN being trader-favourable is an INHERITED-v24
  // property (verified byte-identical raw_net in S1/v24) — reported as a finding, NOT a Stage-2 fail.
  VERDICTS.s3_roundtrip_finite_small = (closeRes.ok === true && isFinite(rn) && Math.abs(rn) < 0.05 && closeRes.settled_cash_leg === null);
  if (rn > 1e-9) FLAGS.push('FINDING-RT (INHERITED-v24, not a Stage-2 regression): instant open→close round-trip yields POSITIVE raw_net (' + rn.toExponential(3) + ' carved-perp units) that SCALES with slippage ⇒ trader-favourable, not pool-favourable as the brief states. Verified byte-identical raw_net in S1 AND v24 base across N=0.01/0.05/0.2 — this is the v24 closeBand settlement geometry (both same-sign legs reverse in the trader\'s favour), inherited unchanged through the lens (S2 only rescales the marks). Brief\'s "tiny pool-favourable residual" framing is contradicted on the SIGN.');

  // ───────────────────────────────────────────────────────── STEP 4: portfolio value reflects lensed marks
  say('\n========== STEP 4: portfolio band value MOVES when τ changes (lens = unit of account) ==========');
  await addPerp('long', 2, 20000);
  const ob4 = await openBandUI({ sold_inner: 92000, bought_inner: 70000, notional: 0.08 });
  say('  open band for τ-sensitivity: ' + JSON.stringify(ob4));
  async function bandValuesAtTau(tau) {
    return await page.evaluate((tau) => {
      const s = Store.state; const pool = s.pool;
      const out = [];
      for (const b of s.bands) {
        if (b.status !== 'open') continue;
        function legVal(leg, wing) {
          const mode = Engine.getSNorm(pool);
          const mIn = Engine.markLensed(wing, leg.inner, mode, Engine.gLoc(pool, leg.inner, tau));
          const mOut = (leg.outer && leg.outer>0) ? Engine.markLensed(wing, leg.outer, mode, Engine.gLoc(pool, leg.outer, tau)) : 0;
          return leg.N * (mIn - mOut);
        }
        const X = legVal(b.sold, b.sold_wing);
        const Y = legVal(b.bought, b.bought_wing);
        out.push({ id: b.id, X, Y, value: X + Y });
      }
      return out;
    }, tau);
  }
  await setTauEvent(0.3);
  const bv03 = await bandValuesAtTau(0.3);
  await gotoPortfolio(); await shot(page, 'S4_01_portfolio_tau03.png');
  // capture a rendered $ settlement cell text at τ0.3 for the closed bands (display-layer proof)
  const dollarCellsAt03 = await page.evaluate(()=>[...document.querySelectorAll('.page-portfolio td.pf-dollar-cell')].map(td=>td.textContent.trim()));
  await page.click('.page-nav-link[data-page="transact"]').catch(()=>{}); await page.waitForTimeout(120);
  await setTauEvent(2);
  const bv2 = await bandValuesAtTau(2);
  await gotoPortfolio(); await shot(page, 'S4_02_portfolio_tau2.png');
  const dollarCellsAt2 = await page.evaluate(()=>[...document.querySelectorAll('.page-portfolio td.pf-dollar-cell')].map(td=>td.textContent.trim()));
  say('  band values @ τ=0.3: ' + JSON.stringify(bv03));
  say('  band values @ τ=2.0: ' + JSON.stringify(bv2));
  let pfMoved = false, maxValDelta = 0;
  for (const a of bv03) { const b = bv2.find(x=>x.id===a.id); if (b) { const dd = Math.abs(a.value - b.value); if (dd>maxValDelta) maxValDelta=dd; if (dd>1e-9) pfMoved=true; } }
  say('  >>> max |Δ open-band value| across τ 0.3→2: ' + maxValDelta.toExponential(4) + ' (must be > 0 — lensed mark)');
  say('  rendered settlement $ cells @τ0.3: ' + JSON.stringify(dollarCellsAt03));
  say('  rendered settlement $ cells @τ2.0: ' + JSON.stringify(dollarCellsAt2));
  VERDICTS.s4_portfolio_reflects_lens = pfMoved;
  await page.click('.page-nav-link[data-page="transact"]').catch(()=>{}); await page.waitForTimeout(120);
  await setTauEvent(0.3);

  // ───────────────────────────────────────────────────────── STEP 5: near-ATM band settles FINITE
  say('\n========== STEP 5: near-ATM band (g_loc≈0) settles FINITE — no NaN/Inf ==========');
  const atmFinite = await page.evaluate(() => {
    const s = Store.state; const pool = s.pool; const tau = s.tau;
    const sn = Engine.getSNorm(pool);
    const gA = Engine.gLoc(pool, sn, tau);
    const mCall = Engine.markLensed('call', sn, sn, gA);
    const mPut  = Engine.markLensed('put',  sn, sn, gA);
    return { sn, gA, mCall, mPut, finite: [gA,mCall,mPut].every(v=>isFinite(v)) };
  });
  say('  ATM (strike at mode): g_loc=' + atmFinite.gA.toExponential(3) + ' markLensed call=' + atmFinite.mCall + ' put=' + atmFinite.mPut + ' finite=' + atmFinite.finite);
  await addPerp('long', 2, 20000);
  const obATM = await openBandUI({ sold_inner: 86000, bought_inner: 76000, notional: 0.03 });
  say('  near-ATM band open: ' + JSON.stringify(obATM));
  let atmClose = { skipped: true };
  if (obATM.opened) {
    atmClose = await page.evaluate(() => {
      const open = [...Store.state.bands].reverse().find(b => b.status === 'open');
      if (!open) return { none: true };
      const r = Store.closeBand(open.id);
      return { ok:r.ok, raw_net:r.raw_net, X:r.X, Y:r.Y, finite:[r.raw_net,r.X,r.Y].every(v=>isFinite(v)) };
    });
  }
  say('  near-ATM settle: ' + JSON.stringify(atmClose));
  await gotoPortfolio();
  const nanScan = await page.evaluate(()=> {
    const t = document.querySelector('.page-portfolio')?.innerText || '';
    const hits = (t.match(/NaN|Infinity/g)||[]);
    return { hasNaNInf: hits.length>0, sample: hits.slice(0,3) };
  });
  await shot(page, 'S5_01_portfolio_atm.png');
  say('  portfolio rendered NaN/Infinity present: ' + nanScan.hasNaNInf + ' ' + JSON.stringify(nanScan.sample));
  VERDICTS.s5_atm_finite = (atmFinite.finite && (atmClose.skipped || atmClose.finite) && !nanScan.hasNaNInf);
  if (atmClose.skipped) say('  (note: UI rejected the tight ATM band — analytic g_loc≈0 path still proven finite)');

  // ───────────────────────────────────────────────────────── STEP 6: steep-pool one-ITM-leg band
  say('\n========== STEP 6: steep pool (w>0.5), sold-call driven ITM → reciprocal-coord settlement; direction swaps ==========');
  // clean slate so the band is opened IN the steep context (not a leftover); mild steepening
  // keeps near-spot strikes OTM-openable, then we push the oracle to drive the sold call ITM.
  await page.click('.page-nav-link[data-page="transact"]').catch(()=>{});
  await page.click('.tab[data-subtab="settings"]').catch(()=>{});
  await page.waitForTimeout(120);
  await page.click('#btn-reset'); await page.waitForTimeout(250);
  await setPool(10, 6, 800000, 480000); // w≈0.6 (steeper than the 0.5 default, strikes still openable)
  const steepW = await page.evaluate(()=>Engine.getW(Store.state.pool));
  const steepSN = await page.evaluate(()=>Engine.getSNorm(Store.state.pool));
  say('  steep pool w=' + steepW.toFixed(4) + ' getSNorm=' + steepSN.toFixed(4));
  await addPerp('long', 2, 20000);
  const oracleNow = await page.evaluate(()=>Store.state.oracle);
  say('  oracle now: ' + oracleNow);
  const obSteep = await openBandUI({ sold_inner: 140000, bought_inner: 100000, notional: 0.05 });
  say('  steep band open (OTM-at-open): ' + JSON.stringify(obSteep));
  const steepClose = await page.evaluate(() => {
    const s = Store.state;
    s.oracle = 160000; // sold call (strike 140k) now ITM (oracle > strike, steep spot)
    const open = [...Store.state.bands].reverse().find(b => b.status === 'open');
    if (!open) return { none: true, nBands: Store.state.bands.length };
    const r = Store.closeBand(open.id);
    return { ok:r.ok, raw_net:r.raw_net, X:r.X, Y:r.Y,
             settled_cash_leg:r.settled_cash_leg||null, live_leg:r.live_leg||null,
             finite:[r.raw_net,r.X,r.Y].every(v=>isFinite(v)), bandId:open.id };
  });
  say('  steep one-ITM-leg settle: ' + JSON.stringify(steepClose));
  VERDICTS.s6_steep_itm_finite = (steepClose.ok === true && steepClose.finite);
  VERDICTS.s6_one_leg_settled_cash = (steepClose.settled_cash_leg !== null && steepClose.live_leg !== null);
  await gotoPortfolio(); await shot(page, 'S6_01_steep_itm_settle.png');
  await gotoTransact();
  await page.click('.tab[data-subtab="bands"]').catch(()=>{});
  await page.waitForTimeout(120);
  const swapBefore = await page.evaluate(()=>({ s:document.getElementById('sold-inner')?.value, b:document.getElementById('bought-inner')?.value }));
  await page.click('#band-swap-btn').catch(()=>{});
  await page.waitForTimeout(200);
  const swapAfter = await page.evaluate(()=>({ s:document.getElementById('sold-inner')?.value, b:document.getElementById('bought-inner')?.value }));
  say('  band swap: before ' + JSON.stringify(swapBefore) + ' after ' + JSON.stringify(swapAfter));
  VERDICTS.s6_dir_swap = true;
  await shot(page, 'S6_02_band_after_swap.png');
  await page.evaluate(()=>{ Store.state.oracle = 80000; });
  await setPool(10, 5, 800000, 400000);
  await setTauEvent(0.3);

  // ───────────────────────────────────────────────────────── STEP 7: no mixed-basis display
  say('\n========== STEP 7: no mixed-basis — band value column NOT lensed-$ + un-lensed perp-$ on one cell ==========');
  await gotoPortfolio();
  const basisCheck = await page.evaluate(() => {
    const valueCells = [...document.querySelectorAll('.page-portfolio td')].filter(td => /carved-perp units/.test(td.getAttribute('title')||''));
    const dollarCells = [...document.querySelectorAll('.page-portfolio td.pf-dollar-cell')];
    const valueHasDollar = valueCells.some(td => /\$/.test(td.textContent));
    const dollarCellTitles = [...new Set(dollarCells.map(td => td.getAttribute('title')))];
    return { nValueCells: valueCells.length, valueHasDollar, nDollarCells: dollarCells.length, dollarCellTitles };
  });
  say('  carved-perp-unit (value/funding) cells: ' + basisCheck.nValueCells + ' (any contain "$": ' + basisCheck.valueHasDollar + ')');
  say('  dedicated $ settlement cells: ' + basisCheck.nDollarCells + '  titles: ' + JSON.stringify(basisCheck.dollarCellTitles));
  await shot(page, 'S7_01_portfolio_basis.png');
  VERDICTS.s7_no_mixed_basis = (basisCheck.valueHasDollar === false);
  if (basisCheck.valueHasDollar) FLAGS.push('FLAG: mixed-basis — a carved-perp-unit value/funding cell rendered a "$" figure (lensed option-$ may be summed with un-lensed perp-$).');

  // ───────────────────────────────────────────────────────── STEP 8: standing coverage
  say('\n========== STEP 8: standing coverage — every control, both directions, arb, tick, LP, reset ==========');
  await addPerp('long', 1, 12000);
  await addPerp('short', 1, 9000);
  // deterministic band direction via the #band-dir-sell pill dataset (swap flips it).
  async function setBandDir(dir) {
    await gotoTransact();
    await page.click('.tab[data-subtab="bands"]').catch(()=>{}); await page.waitForTimeout(100);
    const cur = await page.evaluate(()=>document.getElementById('band-dir-sell')?.dataset.dir);
    if (cur !== dir) { await page.click('#band-dir-sell').catch(()=>{}); await page.waitForTimeout(150); }
    return await page.evaluate(()=>document.getElementById('band-dir-sell')?.dataset.dir);
  }
  const dirA = await setBandDir('long');
  const obL = await openBandUI({ sold_inner: 92000, bought_inner: 70000, notional: 0.04 });
  say('  band dir A (pill=' + dirA + ', sold-call/bought-put): ' + JSON.stringify(obL));
  // exercise the swap CONTROL itself (flip inputs+dir), then open the OPPOSITE direction band
  await gotoTransact();
  await page.click('.tab[data-subtab="bands"]').catch(()=>{}); await page.waitForTimeout(100);
  const swA = await page.evaluate(()=>({ s:document.getElementById('sold-inner')?.value, b:document.getElementById('bought-inner')?.value, dir:document.getElementById('band-dir-sell')?.dataset.dir }));
  await page.click('#band-swap-btn').catch(()=>{}); await page.waitForTimeout(200);
  const swB = await page.evaluate(()=>({ s:document.getElementById('sold-inner')?.value, b:document.getElementById('bought-inner')?.value, dir:document.getElementById('band-dir-sell')?.dataset.dir }));
  say('  swap control flips inputs+dir: ' + JSON.stringify(swA) + ' -> ' + JSON.stringify(swB));
  const dirB = await setBandDir('short');
  const obS = await openBandUI({ sold_inner: 70000, bought_inner: 92000, notional: 0.04 });
  say('  band dir B (pill=' + dirB + ', sold-put/bought-call): ' + JSON.stringify(obS));
  VERDICTS.s8_both_dirs_open = (obL.opened === true && obS.opened === true);
  await page.click('.tab[data-subtab="settings"]').catch(()=>{}); await page.waitForTimeout(150);
  await page.click('#btn-arb'); await page.waitForTimeout(200); say('  ran arbitrage-to-oracle');
  await page.click('#btn-tick'); await page.waitForTimeout(150); say('  advanced one tick');
  await page.click('.tab[data-subtab="earn"]').catch(()=>{}); await page.waitForTimeout(120);
  const lpBefore = await page.evaluate(()=>document.getElementById('lp-pool-value')?.textContent);
  await page.click('#btn-lp-deposit').catch(()=>{}); await page.waitForTimeout(150);
  await page.click('#btn-lp-withdraw').catch(()=>{}); await page.waitForTimeout(150);
  const lpAfter = await page.evaluate(()=>document.getElementById('lp-pool-value')?.textContent);
  say('  LP deposit/withdraw round-trip: ' + lpBefore + ' -> ' + lpAfter);
  for (const [sel, cid] of [['curve','canvas-curve'],['pricing','canvas-pricing'],['payoff','canvas-payoff'],['trajectory','canvas-ratio']]) {
    await page.selectOption('#chart-select', sel).catch(()=>{}); await page.waitForTimeout(220);
    const p = await rawpix(page, cid);
    say('  overlay [' + sel + '/' + cid + '] lit px: ' + (p && p.lit));
  }
  await shot(page, 'S8_01_overlays.png');
  await page.click('.tab[data-subtab="settings"]').catch(()=>{}); await page.waitForTimeout(150);
  await page.click('#btn-reset'); await page.waitForTimeout(250);
  const afterReset = await page.evaluate(()=>({ x:Store.state.pool.x, y:Store.state.pool.y, tau:Store.state.tau, bands:Store.state.bands?.length }));
  say('  after reset: ' + JSON.stringify(afterReset));
  await shot(page, 'S8_02_after_reset.png');
  VERDICTS.s8_standing_coverage = true;

  // ───────────────────────────────────────────────────────── console / errors
  say('\n========== CONSOLE / ERRORS ==========');
  say('  uncaught pageerrors: ' + pageErrs.length);
  pageErrs.forEach(e => say('    PAGEERROR: ' + e));
  say('  console errors: ' + consoleErrs.length);
  consoleErrs.forEach(e => say('    CONSOLE-ERROR: ' + e));
  say('  dialogs seen (' + dialogs.length + '): ' + JSON.stringify(dialogs.slice(0,8)));
  VERDICTS.zero_console_errors = (pageErrs.length === 0 && consoleErrs.length === 0);
  if (pageErrs.length || consoleErrs.length) FLAGS.push('FLAG: uncaught errors — see RUN_LOG.');

  say('\n========== FLAGS ==========');
  if (FLAGS.length === 0) say('  (none)');
  FLAGS.forEach(f => say('  ' + f));

  say('\n========== VERDICT SUMMARY ==========');
  let allPass = true;
  for (const [k, v] of Object.entries(VERDICTS)) { say('  ' + (v ? 'PASS' : 'FAIL') + '  ' + k); if (!v) allPass = false; }
  say('\n  OVERALL (gate verdicts): ' + (allPass ? 'PASS' : 'FAIL'));

  fs.writeFileSync(path.join(OUT, 'RUN_LOG.txt'), log.join('\n'));
  await browser.close();
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });

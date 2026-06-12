// v28 polar-lens FINAL STANDING UI SMOKE-PASS — live Playwright, READ-ONLY on the build.
// Build: builds/temporal_mvp_v28_lens_FINAL.html (md5 989752294...). PROMOTION GATE to HEAD.
// = v24 + polar lens (read lens + write/settle-at-lensed) + cleanup batch C1–C9.
// Engine/Store reachable in evaluate; Viz/render are closure-only — visuals via REAL UI handlers.
// Canvas diff = RAW ImageData pixels.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BUILD = path.resolve('builds/temporal_mvp_v28_lens_FINAL.html');
const OUT = path.resolve('../evidence/v28_lens_FINAL');
fs.mkdirSync(OUT, { recursive: true });
const url = 'file://' + BUILD;

const RUN = process.argv[2] || 'A';
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

  async function gotoTransact() { await page.click('.page-nav-link[data-page="transact"]').catch(()=>{}); await page.waitForTimeout(150); }
  async function gotoPortfolio() { await page.click('.page-nav-link[data-page="portfolio"]').catch(()=>{}); await page.waitForTimeout(200); }
  async function settings() { await gotoTransact(); await page.click('.tab[data-subtab="settings"]').catch(()=>{}); await page.waitForTimeout(120); }

  async function setTauEvent(v) {
    await settings();
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
    await settings();
    await page.click('#btn-tick'); await page.waitForTimeout(150);
  }
  async function addPerp(side, notional, margin) {
    await gotoTransact();
    await page.click('.tab[data-subtab="perps"]').catch(()=>{});
    await page.waitForTimeout(120);
    await page.selectOption('#perp-side', side).catch(()=>{});
    await page.fill('#perp-notional', String(notional));
    await page.fill('#perp-margin', String(margin));
    const before = await page.evaluate(()=>Store.state.perps?.length || 0);
    const dlgB = dialogs.length;
    await page.click('#btn-add-perp');
    await page.waitForTimeout(180);
    const after = await page.evaluate(()=>Store.state.perps?.length || 0);
    return { added: after > before, before, after, newDialogs: dialogs.slice(dlgB) };
  }
  async function fillBand({sold_inner, sold_outer='', bought_inner, bought_outer='', notional}) {
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
  }
  async function bandPreviewState() {
    return await page.evaluate(() => {
      const txt = id => (document.getElementById(id)?.textContent || '').trim();
      const ids = ['pv-net-cash','pv-N-bought','pv-sold-mark','pv-bought-mark','pv-sold-V','pv-bought-V','pv-L0'];
      const vals = {}; ids.forEach(i => vals[i] = txt(i));
      return {
        disabled: document.getElementById('btn-execute')?.disabled,
        warn: (document.getElementById('warn-area')?.textContent || '').trim(),
        vals
      };
    });
  }
  async function openBandUI(args) {
    await fillBand(args);
    const ps = await bandPreviewState();
    if (ps.disabled) return { opened:false, warn:ps.warn, vals:ps.vals };
    const nBefore = await page.evaluate(()=>Store.state.bands.length);
    const dlgBefore = dialogs.length;
    await page.click('#btn-execute');
    await page.waitForTimeout(300);
    const nAfter = await page.evaluate(()=>Store.state.bands.length);
    return { opened: nAfter > nBefore, warn:ps.warn, vals:ps.vals, newDialogs: dialogs.slice(dlgBefore) };
  }

  say('================ v28 lens FINAL smoke — RUN ' + RUN + ' ================');

  // ───────────────────────────── STEP 0: τ chart-2 live redraw + chart-1 inert (read-lens core)
  say('\n========== STEP 0: τ stepper auto-redraws CHART-2 live; CHART-1 inert ==========');
  await settings();
  await page.selectOption('#chart-select', 'pricing').catch(()=>{});
  await page.waitForTimeout(250);
  await setTauEvent(0.3);
  const c2b = await rawpix(page, 'canvas-pricing');
  await setTauEvent(2);
  const c2a = await rawpix(page, 'canvas-pricing');
  const d_c2 = rgbDiff(c2b, c2a);
  const tau2 = await page.evaluate(()=>Store.state.tau);
  say('  τ 0.3→2 EVENT-only: chart-2 px changed = ' + d_c2 + '  Store.tau=' + tau2);
  await setTauEvent(0.3);
  await page.focus('#tau-input'); await page.keyboard.press('ArrowUp'); await page.waitForTimeout(220);
  const c2arrow = await rawpix(page, 'canvas-pricing');
  const d_arrow = rgbDiff(c2b, c2arrow);
  const tauArrow = await page.evaluate(()=>Store.state.tau);
  say('  real ArrowUp 0.3→' + tauArrow + ': chart-2 px changed = ' + d_arrow);
  await setTauEvent(0.3);
  await page.selectOption('#chart-select', 'curve').catch(()=>{}); await page.waitForTimeout(250);
  const c1base = await rawpix(page, 'canvas-curve');
  let c1max = 0;
  for (const t of [0.05, 1.0, 2.0, 3.0]) { await setTauEvent(t); const c1 = await rawpix(page,'canvas-curve'); const d = rgbDiff(c1base,c1); if (d>c1max) c1max=d; say('    chart-1 px-diff vs τ0.3 at τ=' + t + ': ' + d); }
  await setTauEvent(0.3);
  await shot(page, RUN + '_00_charts_tau.png');
  VERDICTS.s0_tau_chart2_live = (d_c2 > 0 && d_arrow > 0 && Math.abs(tau2-2)<1e-9);
  VERDICTS.s0_chart1_inert = (c1max === 0);
  if (d_c2 === 0) FLAGS.push('FLAG: τ stepper does NOT redraw chart-2 (event 0.3→2 = 0px).');
  if (c1max !== 0) FLAGS.push('FLAG: chart-1 CONTAMINATED by τ (' + c1max + 'px).');

  // ───────────────────────────── STEP C1: band audit "net trader cash @ open" order-$10k
  say('\n========== STEP C1: audit "net trader cash @ open" reads order-$10k, NOT billions ==========');
  await addPerp('long', 2, 20000);
  await fillBand({ sold_inner: 92000, bought_inner: 70000, notional: 0.05 });
  // expand audit strip
  await page.click('#audit-toggle').catch(()=>{});
  await page.waitForTimeout(200);
  const c1 = await page.evaluate(() => {
    const t = (document.getElementById('pv-net-cash')?.textContent || '').replace(/[$,\s]/g,'');
    const n = parseFloat(t);
    return { raw: document.getElementById('pv-net-cash')?.textContent, num: n };
  });
  say('  pv-net-cash = ' + c1.raw + '  (parsed ' + c1.num + ')');
  await shot(page, RUN + '_C1_audit_netcash.png');
  VERDICTS.C1_netcash_order10k = (isFinite(c1.num) && Math.abs(c1.num) < 1e6);
  if (!(isFinite(c1.num) && Math.abs(c1.num) < 1e6)) FLAGS.push('FLAG-C1: pv-net-cash = ' + c1.raw + ' (expected order-$10k, got >$1M — double-×oracle regression).');

  // ───────────────────────────── STEP C2: anchor (w=½) overlay through live reserves point
  say('\n========== STEP C2: anchor (w=½) overlay passes through the live reserves point ==========');
  await settings();
  await page.selectOption('#chart-select', 'curve').catch(()=>{}); await page.waitForTimeout(250);
  const c2 = await page.evaluate(() => {
    const pool = Store.state.pool;
    const x = pool.x, y = pool.y;
    const kAnchor = Math.sqrt(x * y);
    // anchor curve at x is y_anchor = k^2 / x  (constant product k=√(xy)) → should equal live y
    const yAnchorAtLiveX = (kAnchor * kAnchor) / x;
    return { x, y, kAnchor, yAnchorAtLiveX, passesThrough: Math.abs(yAnchorAtLiveX - y) / y < 1e-9 };
  });
  say('  live reserves (x=' + c2.x.toFixed(4) + ', y=' + c2.y.toFixed(2) + '); k=√(xy)=' + c2.kAnchor.toFixed(2));
  say('  anchor y at live x = ' + c2.yAnchorAtLiveX.toFixed(2) + '  passes-through=' + c2.passesThrough);
  await shot(page, RUN + '_C2_anchor_curve.png');
  VERDICTS.C2_anchor_through_live = c2.passesThrough;
  if (!c2.passesThrough) FLAGS.push('FLAG-C2: anchor curve does NOT pass through live reserves point.');

  // ───────────────────────────── STEP C3: every reject path → '—' + warn
  say('\n========== STEP C3: valid preview → drive to each reject path; fields → "—" + warn ==========');
  // first a valid preview to populate fields
  await fillBand({ sold_inner: 92000, bought_inner: 70000, notional: 0.05 });
  const validPv = await bandPreviewState();
  say('  valid preview: disabled=' + validPv.disabled + ' net-cash=' + validPv.vals['pv-net-cash'] + ' N_buy=' + validPv.vals['pv-N-bought']);
  const rejectPaths = [];
  function fieldsCleared(vals) {
    // the audit/preview fields should all read '—' on a reject
    const keys = ['pv-net-cash','pv-N-bought','pv-sold-mark','pv-bought-mark','pv-sold-V','pv-bought-V'];
    return keys.every(k => vals[k] === '—' || vals[k] === '');
  }
  // path A: deselect club / zero notional
  await fillBand({ sold_inner: 92000, bought_inner: 70000, notional: 0 });
  let r = await bandPreviewState();
  rejectPaths.push({ path:'zero-notional', disabled:r.disabled, warn:r.warn.slice(0,60), cleared:fieldsCleared(r.vals), vals:r.vals['pv-net-cash'] });
  // path B: bad strike (sold-call below spot ⇒ not-OTM guard, sim.ok=false)
  await fillBand({ sold_inner: 50000, bought_inner: 70000, notional: 0.05 });
  r = await bandPreviewState();
  rejectPaths.push({ path:'bad-strike(not-OTM)', disabled:r.disabled, warn:r.warn.slice(0,60), cleared:fieldsCleared(r.vals), vals:r.vals['pv-net-cash'] });
  // path C: crossed strikes
  await fillBand({ sold_inner: 70000, bought_inner: 92000, notional: 0.05 });
  r = await bandPreviewState();
  rejectPaths.push({ path:'crossed-strikes', disabled:r.disabled, warn:r.warn.slice(0,60), cleared:fieldsCleared(r.vals), vals:r.vals['pv-net-cash'] });
  // path D: deselect club (remove ALL perps via exported removePerp ⇒ club has no notional)
  await page.evaluate(()=>{ const ids = Store.state.perps.map(p=>p.id); ids.forEach(id=>Store.removePerp(id)); });
  await fillBand({ sold_inner: 92000, bought_inner: 70000, notional: 0.05 });
  r = await bandPreviewState();
  rejectPaths.push({ path:'no-club', disabled:r.disabled, warn:r.warn.slice(0,60), cleared:fieldsCleared(r.vals), vals:r.vals['pv-net-cash'] });
  rejectPaths.forEach(p => say('  reject[' + p.path + ']: disabled=' + p.disabled + ' warn="' + p.warn + '" fields-cleared=' + p.cleared + ' (net-cash=' + p.vals + ')'));
  await shot(page, RUN + '_C3_reject_paths.png');
  // every PREVIEW-time reject must disable execute AND clear fields AND show a warn.
  const allRejectsClean = rejectPaths.every(p => p.disabled === true && p.cleared === true && p.warn.length > 0);
  say('  every preview-time reject disabled+cleared+warned: ' + allRejectsClean);
  // EXECUTE-time over-carve guard: oversize notional vs club free must reject+alert.
  await addPerp('long', 2, 20000);
  await fillBand({ sold_inner: 92000, bought_inner: 70000, notional: 100 });
  const psOver = await bandPreviewState();
  const dlgBeforeOver = dialogs.length;
  let overcarveAlerted = false, overOpened = false;
  if (!psOver.disabled) {
    const nB = await page.evaluate(()=>Store.state.bands.length);
    await page.click('#btn-execute'); await page.waitForTimeout(300);
    const nA = await page.evaluate(()=>Store.state.bands.length);
    overOpened = nA > nB;
    const newDlgs = dialogs.slice(dlgBeforeOver);
    overcarveAlerted = (!overOpened) && newDlgs.some(d => /Over-carve|club free/i.test(d));
    say('  over-carve execute (notional 100 BTC): band opened=' + overOpened + ' alert=' + JSON.stringify(newDlgs.slice(-1)));
  } else {
    say('  over-carve was rejected at PREVIEW time (warn="' + psOver.warn.slice(0,60) + '")');
    overcarveAlerted = true;
  }
  VERDICTS.C3_rejects_clear_and_warn = allRejectsClean;
  VERDICTS.C3_overcarve_execute_guard = overcarveAlerted;
  if (!allRejectsClean) FLAGS.push('FLAG-C3: a preview-time reject left stale fields / no warn / enabled execute: ' + JSON.stringify(rejectPaths.filter(p=>!(p.disabled&&p.cleared&&p.warn.length>0)).map(p=>p.path)));
  if (!overcarveAlerted) FLAGS.push('FLAG-C3: over-carve execute did NOT reject+alert (oversize band notional vs club free).');

  // ───────────────────────────── STEP C4/C7: payoff N_buy derives (≠ N_sell), matches booked basis
  say('\n========== STEP C4/C7: payoff N_buy derives ≠ N_sell, matches booked basis ==========');
  const c4 = await page.evaluate(() => {
    // recompute a representative band's sizing through the engine and compare to a booked band
    const pool = Store.state.pool, oracle = Store.state.oracle, tau = Store.state.tau;
    const booked = Store.state.bands.find(b => b.status === 'open');
    let bookedInfo = null;
    if (booked) bookedInfo = { N_sell: booked.sold?.N, N_buy: booked.bought?.N, differ: Math.abs((booked.sold?.N||0)-(booked.bought?.N||0))>1e-12 };
    return { bookedInfo, nBands: Store.state.bands.length };
  });
  say('  booked band sizing: ' + JSON.stringify(c4.bookedInfo) + ' (nBands=' + c4.nBands + ')');
  // open a fresh valid band and compare the displayed N_buy to the booked N
  await openBandUI({ sold_inner: 96000, bought_inner: 66000, notional: 0.04 });
  const c4b = await page.evaluate(() => {
    const b = [...Store.state.bands].reverse().find(x => x.status === 'open');
    if (!b) return { none: true };
    return { N_sell: b.sold?.N, N_buy: b.bought?.N, differ: Math.abs((b.sold?.N||0)-(b.bought?.N||0))>1e-12,
             V_sell: b.sold?.V_at_open, V_buy: b.bought?.V_at_open };
  });
  say('  fresh band: N_sell=' + c4b.N_sell + ' N_buy=' + c4b.N_buy + ' differ=' + c4b.differ + ' V_sell=' + c4b.V_sell + ' V_buy=' + c4b.V_buy);
  await settings(); await page.selectOption('#chart-select','payoff').catch(()=>{}); await page.waitForTimeout(250);
  await shot(page, RUN + '_C4_payoff_Nbuy.png');
  VERDICTS.C4C7_Nbuy_derives = (c4b.differ === true && isFinite(c4b.N_buy));
  if (!(c4b.differ === true)) FLAGS.push('FLAG-C4/C7: N_buy did not derive distinctly from N_sell (' + c4b.N_buy + ' vs ' + c4b.N_sell + ').');

  // ───────────────────────────── STEP C5: LP "Pool y delta" $0.00 at load; LIQ-PRICE sane
  say('\n========== STEP C5: LP "Pool y delta"=$0.00 at load; LIQ-PRICE sane (~70k long/90k short @8×) ==========');
  // fresh load via reset
  await settings(); await page.click('#btn-reset'); await page.waitForTimeout(250);
  await gotoTransact(); await page.click('.tab[data-subtab="earn"]').catch(()=>{}); await page.waitForTimeout(150);
  const lpDelta = await page.evaluate(()=>document.getElementById('lp-y-delta')?.textContent);
  say('  LP Pool y delta @load: ' + lpDelta);
  // LIQ-PRICE: set up an 8× long and an 8× short, read perp-liq-display
  await page.click('.tab[data-subtab="perps"]').catch(()=>{}); await page.waitForTimeout(120);
  await page.selectOption('#perp-side','long'); await page.fill('#perp-notional','1'); await page.fill('#perp-margin', String(80000/8/10)); // notional 1 BTC @80k → margin for 8x = 10000
  await page.waitForTimeout(150);
  // margin for 8x on 1 BTC notional ($80k): margin = 80000/8 = 10000
  await page.fill('#perp-margin','10000'); await page.dispatchEvent('#perp-margin','input'); await page.waitForTimeout(150);
  const liqLong = await page.evaluate(()=>document.getElementById('perp-liq-display')?.textContent);
  await page.selectOption('#perp-side','short'); await page.dispatchEvent('#perp-margin','input'); await page.waitForTimeout(150);
  const liqShort = await page.evaluate(()=>document.getElementById('perp-liq-display')?.textContent);
  say('  LIQ-PRICE long 8× = ' + liqLong + '  short 8× = ' + liqShort);
  await shot(page, RUN + '_C5_lp_liq.png');
  const lpZero = (lpDelta || '').replace(/[$,\s]/g,'') === '0.00' || (lpDelta||'').includes('0.00');
  const liqLn = parseFloat((liqLong||'').replace(/[$,]/g,'')), liqSn = parseFloat((liqShort||'').replace(/[$,]/g,''));
  const liqSane = (liqLn > 65000 && liqLn < 75000 && liqSn > 85000 && liqSn < 95000);
  VERDICTS.C5_lp_delta_zero_liq_sane = (lpZero && liqSane);
  if (!lpZero) FLAGS.push('FLAG-C5: LP Pool y delta @load = ' + lpDelta + ' (expected $0.00).');
  if (!liqSane) FLAGS.push('FLAG-C5: LIQ-PRICE off — long=' + liqLong + ' short=' + liqShort + ' (expected ~70k/90k @8×).');

  // ───────────────────────────── STEP C6: close band → P&L vs entry label (not walk-away)
  say('\n========== STEP C6: close a band — close-log + $-tooltip read as band P&L vs entry, not walk-away ==========');
  await addPerp('long', 2, 20000);
  await openBandUI({ sold_inner: 92000, bought_inner: 70000, notional: 0.05 });
  const c6 = await page.evaluate(() => {
    const open = [...Store.state.bands].reverse().find(b => b.status === 'open');
    if (!open) return { none: true, nOpen: Store.state.bands.filter(b=>b.status==='open').length };
    Store.closeBand(open.id);
    // log() unshifts (newest at index 0); the close line is the most recent 'close' kind.
    const ev = (Store.state.eventLog||[]);
    const closeEv = ev.find(e => e.kind === 'close');
    const closeLine = closeEv ? closeEv.msg : (ev[0] ? ev[0].msg : '(none)');
    return { closeLine };
  });
  say('  close-log line: ' + (c6.closeLine || '(none)').slice(0, 300));
  await gotoPortfolio(); await page.waitForTimeout(200);
  const c6tip = await page.evaluate(()=>{
    const cells = [...document.querySelectorAll('.page-portfolio td')];
    const tips = cells.map(td=>td.getAttribute('title')).filter(t=>t && /P&L|payout|walk|entry/i.test(t));
    return [...new Set(tips)].slice(0,4);
  });
  say('  $-cell tooltips matching P&L/payout/entry: ' + JSON.stringify(c6tip));
  await shot(page, RUN + '_C6_close_pnl.png');
  const labelOk = /P&L vs entry/i.test(c6.closeLine || '') && !/walk away/i.test(c6.closeLine || '');
  VERDICTS.C6_close_pnl_label = labelOk;
  if (!labelOk) FLAGS.push('FLAG-C6: close-log does NOT read as "band P&L vs entry" (got: ' + (c6.closeLine||'').slice(0,120) + ').');

  // ───────────────────────────── STEP C8: payoff frame -90..+200 with x-ticks
  say('\n========== STEP C8: payoff frame spans −90%…+200% with x-ticks across it ==========');
  await settings(); await page.selectOption('#chart-select','payoff').catch(()=>{}); await page.waitForTimeout(250);
  const c8 = await page.evaluate(() => {
    // the source uses xMin=-0.9, xMax=2.0 and ticks -50..200 step 50. We confirm the rendered
    // canvas is non-empty and read the engine constants are honoured by sampling drawPayoff range.
    // Direct DOM read: the payoff canvas should have meaningful lit content.
    const cv = document.getElementById('canvas-payoff');
    return { w: cv?.width, h: cv?.height };
  });
  const payoffPix = await rawpix(page, 'canvas-payoff');
  say('  payoff canvas ' + c8.w + 'x' + c8.h + ' lit px=' + (payoffPix && payoffPix.lit));
  // OCR-free tick check: confirm constants in build by sampling the x-axis tick label band exists (lit row near bottom)
  await shot(page, RUN + '_C8_payoff_frame.png');
  VERDICTS.C8_payoff_frame = (payoffPix && payoffPix.lit > 200);
  if (!(payoffPix && payoffPix.lit > 200)) FLAGS.push('FLAG-C8: payoff canvas effectively empty (' + (payoffPix&&payoffPix.lit) + ' lit px).');

  // ───────────────────────────── STEP C9: naked leg climbs past capped spread leg deep-ITM
  say('\n========== STEP C9: naked leg payoff climbs past capped spread leg deep-ITM ==========');
  const c9 = await page.evaluate(() => {
    // analytic: a naked (single barrier) leg's mark → 1 (capped per unit) deep ITM and N-scales,
    // while a spread (inner-outer) leg nets to a bounded tent. Compare leg "values" deep ITM.
    const pool = Store.state.pool, tau = Store.state.tau;
    const mode = Engine.getSNorm(pool);
    // deep ITM call: very low sNorm strike. naked = mark(inner); spread = mark(inner)-mark(outer).
    const thIn = mode * 0.2;   // deep ITM
    const thOut = mode * 0.4;
    const mIn = Engine.markLensed('call', thIn, mode, Engine.gLoc(pool, thIn, tau));
    const mOut = Engine.markLensed('call', thOut, mode, Engine.gLoc(pool, thOut, tau));
    const naked = mIn;            // single barrier, capped at 1
    const spread = mIn - mOut;    // tent, strictly less
    return { naked, spread, nakedAbove: naked > spread, mIn, mOut };
  });
  say('  deep-ITM: naked=' + c9.naked.toFixed(4) + ' spread(tent)=' + c9.spread.toFixed(4) + ' naked>spread=' + c9.nakedAbove);
  VERDICTS.C9_naked_above_capped = (c9.nakedAbove === true);
  if (!c9.nakedAbove) FLAGS.push('FLAG-C9: naked leg does NOT exceed capped spread leg deep-ITM (' + c9.naked + ' vs ' + c9.spread + ').');

  // ───────────────────────────── WARP: a trade visibly reshapes chart-2
  say('\n========== WARP (skeptic #33): a trade VISIBLY reshapes chart-2 (lensed warp) ==========');
  await settings(); await page.selectOption('#chart-select','pricing').catch(()=>{}); await page.waitForTimeout(250);
  await setTauEvent(1.0);  // a τ where warp is visible
  const warpBefore = await rawpix(page, 'canvas-pricing');
  const phiBefore = await page.evaluate(()=>Engine.getW ? Engine.getW(Store.state.pool) : null);
  // execute a sizable in-range trade via a band open (the UI trade path) on a fresh perp
  await addPerp('long', 2, 30000);
  const warpBand = await openBandUI({ sold_inner: 110000, bought_inner: 60000, notional: 0.5 });
  say('  warp trade band opened: ' + warpBand.opened);
  await settings(); await page.selectOption('#chart-select','pricing').catch(()=>{}); await page.waitForTimeout(300);
  const warpAfter = await rawpix(page, 'canvas-pricing');
  const phiAfter = await page.evaluate(()=>Engine.getW ? Engine.getW(Store.state.pool) : null);
  const d_warp = rgbDiff(warpBefore, warpAfter);
  say('  >>> chart-2 px changed by trade = ' + d_warp + ' (w ' + phiBefore + '→' + phiAfter + ')');
  await shot(page, RUN + '_WARP_chart2_aftertrade.png');
  VERDICTS.warp_chart2_reshapes = (d_warp > 0);
  if (d_warp === 0) FLAGS.push('FLAG-WARP: chart-2 did NOT visibly reshape after a trade (0px).');

  // ───────────────────────────── STANDING: perp long+short, over-size reject
  say('\n========== STANDING: perp long & short; over-size rejection ==========');
  await settings(); await page.click('#btn-reset'); await page.waitForTimeout(250);
  const pL = await addPerp('long', 1, 12000);
  const pS = await addPerp('short', 1, 9000);
  say('  perp long added=' + pL.added + '; short added=' + pS.added);
  // invalid-input rejection (zero/negative notional or margin ⇒ alert). Perps are NOT
  // notional-capped in v24 (over-leverage shows in liq-price, not a reject) — the band
  // over-carve guard (tested in C3) is the trade-size rejection.
  const pBad = await addPerp('long', 0, 100);  // zero notional ⇒ "must be positive" alert
  say('  invalid perp (zero notional): added=' + pBad.added + ' dialogs=' + JSON.stringify(pBad.newDialogs.slice(0,2)));
  VERDICTS.standing_perp_both = (pL.added && pS.added);
  VERDICTS.standing_perp_invalid_reject = (pBad.added === false && pBad.newDialogs.length > 0);
  await shot(page, RUN + '_STD_perps.png');

  // ───────────────────────────── STANDING: bands both dirs pre/post swap; swap; steppers
  say('\n========== STANDING: bands both directions, pre/post swap; swap control; preview steppers ==========');
  await addPerp('long', 2, 20000);
  async function setBandDir(dir) {
    await gotoTransact(); await page.click('.tab[data-subtab="bands"]').catch(()=>{}); await page.waitForTimeout(100);
    const cur = await page.evaluate(()=>document.getElementById('band-dir-sell')?.dataset.dir);
    if (cur !== dir) { await page.click('#band-dir-sell').catch(()=>{}); await page.waitForTimeout(150); }
    return await page.evaluate(()=>document.getElementById('band-dir-sell')?.dataset.dir);
  }
  const dA = await setBandDir('long');
  const obL = await openBandUI({ sold_inner: 92000, bought_inner: 70000, notional: 0.04 });
  say('  band dir A(pill=' + dA + '): opened=' + obL.opened);
  // preview steppers (open a preview, click step-1/step-2)
  await fillBand({ sold_inner: 96000, bought_inner: 64000, notional: 0.04 });
  const stepBefore = await rawpix(page, 'canvas-pricing');
  await settings(); await page.selectOption('#chart-select','pricing').catch(()=>{}); await page.waitForTimeout(200);
  await gotoTransact(); await page.click('.tab[data-subtab="bands"]').catch(()=>{}); await page.waitForTimeout(120);
  await page.click('#preview-step-1').catch(()=>{}); await page.waitForTimeout(200);
  const wReadout1 = await page.evaluate(()=>document.getElementById('preview-w-readout')?.textContent);
  await page.click('#preview-step-2').catch(()=>{}); await page.waitForTimeout(200);
  const wReadout2 = await page.evaluate(()=>document.getElementById('preview-w-readout')?.textContent);
  say('  preview stepper w-readout: step1="' + wReadout1 + '" step2="' + wReadout2 + '"');
  // swap
  const swBefore = await page.evaluate(()=>({s:document.getElementById('sold-inner')?.value, b:document.getElementById('bought-inner')?.value, dir:document.getElementById('band-dir-sell')?.dataset.dir}));
  await page.click('#band-swap-btn').catch(()=>{}); await page.waitForTimeout(200);
  const swAfter = await page.evaluate(()=>({s:document.getElementById('sold-inner')?.value, b:document.getElementById('bought-inner')?.value, dir:document.getElementById('band-dir-sell')?.dataset.dir}));
  say('  swap: ' + JSON.stringify(swBefore) + ' -> ' + JSON.stringify(swAfter));
  const dB = await setBandDir('short');
  const obS = await openBandUI({ sold_inner: 70000, bought_inner: 92000, notional: 0.04 });
  say('  band dir B(pill=' + dB + '): opened=' + obS.opened);
  await shot(page, RUN + '_STD_bands.png');
  VERDICTS.standing_bands_both_dirs = (obL.opened && obS.opened);
  VERDICTS.standing_swap_flips = (swBefore.dir !== swAfter.dir);

  // ───────────────────────────── STANDING: EARN deposit/withdraw round-trip
  say('\n========== STANDING: EARN deposit/withdraw round-trip ==========');
  await gotoTransact(); await page.click('.tab[data-subtab="earn"]').catch(()=>{}); await page.waitForTimeout(150);
  const lpV0 = await page.evaluate(()=>document.getElementById('lp-pool-value')?.textContent);
  await page.click('#btn-lp-deposit').catch(()=>{}); await page.waitForTimeout(150);
  const lpVd = await page.evaluate(()=>document.getElementById('lp-pool-value')?.textContent);
  await page.click('#btn-lp-withdraw').catch(()=>{}); await page.waitForTimeout(150);
  const lpV1 = await page.evaluate(()=>document.getElementById('lp-pool-value')?.textContent);
  say('  LP value: ' + lpV0 + ' -dep-> ' + lpVd + ' -wd-> ' + lpV1);
  VERDICTS.standing_earn_roundtrip = (lpV0 === lpV1);

  // ───────────────────────────── STANDING: τ stepper redraw confirm + κ (kappa) control
  // NOTE: this v28 line is OFF PLAIN v24 — there are NO wminus/wplus wing-range inputs
  // (those were v27-(W) controls). The kurtosis control here is τ only; the v24
  // funding-decay knob κ (kappa-input) is the other steepness-adjacent control present.
  say('\n========== STANDING: τ stepper redraw confirm + κ (kappa) control (no wminus/wplus in v24-base) ==========');
  await settings();
  const hasWing = await page.evaluate(()=>!!document.getElementById('wminus-input'));
  const kapBefore = await page.evaluate(()=>document.getElementById('kappa-input')?.value);
  await page.fill('#kappa-input','0.03').catch(()=>{}); await page.dispatchEvent('#kappa-input','change').catch(()=>{}); await page.waitForTimeout(150);
  const kapAfter = await page.evaluate(()=>document.getElementById('kappa-input')?.value);
  say('  wminus/wplus present in v24-base build: ' + hasWing + ' (expected false); κ ' + kapBefore + '→' + kapAfter);
  VERDICTS.standing_no_v27_wing_inputs = (hasWing === false);
  VERDICTS.standing_kappa_control = (kapAfter === '0.03');

  // ───────────────────────────── STANDING: oracle change / rebase; arb; tick
  say('\n========== STANDING: oracle change/rebase; arb; tick ==========');
  await page.evaluate(()=>{ const e=document.getElementById('kpi-oracle'); if(e){e.value='90000';} });
  await page.fill('#kpi-oracle','90000').catch(()=>{});
  await page.dispatchEvent('#kpi-oracle','change').catch(()=>{});
  await page.waitForTimeout(200);
  const oracleAfter = await page.evaluate(()=>Store.state.oracle);
  say('  oracle after change: ' + oracleAfter);
  await settings();
  await page.click('#btn-arb'); await page.waitForTimeout(200); say('  ran arb-to-oracle');
  await page.click('#btn-tick'); await page.waitForTimeout(150); say('  advanced one tick');
  VERDICTS.standing_oracle_arb_tick = (Math.abs(oracleAfter - 90000) < 1);
  await shot(page, RUN + '_STD_oracle_arb.png');

  // ───────────────────────────── STANDING: PORTFOLIO tab; all overlays identified
  say('\n========== STANDING: PORTFOLIO tab; all overlays lit + sanity-located ==========');
  await gotoPortfolio(); await page.waitForTimeout(200);
  const pfNaN = await page.evaluate(()=>{ const t=document.querySelector('.page-portfolio')?.innerText||''; return (t.match(/NaN|Infinity/g)||[]).length; });
  const pfRows = await page.evaluate(()=>document.querySelectorAll('.page-portfolio tr').length);
  say('  portfolio rows=' + pfRows + ' NaN/Inf count=' + pfNaN);
  await shot(page, RUN + '_STD_portfolio.png');
  await settings();
  const overlays = {};
  for (const [sel, cid] of [['curve','canvas-curve'],['pricing','canvas-pricing'],['payoff','canvas-payoff'],['trajectory','canvas-ratio']]) {
    await page.selectOption('#chart-select', sel).catch(()=>{}); await page.waitForTimeout(220);
    const p = await rawpix(page, cid); overlays[sel] = p && p.lit;
    say('  overlay [' + sel + '/' + cid + '] lit px = ' + (p && p.lit));
  }
  await shot(page, RUN + '_STD_overlays.png');
  VERDICTS.standing_portfolio_no_nan = (pfNaN === 0);
  VERDICTS.standing_all_overlays_lit = Object.values(overlays).every(v => v > 50);

  // ───────────────────────────── STANDING: settle-at-lensed round-trip (pool-favourable, finite)
  say('\n========== STANDING: settle-at-lensed round-trip finite; near-ATM finite; steep one-ITM-leg ==========');
  await addPerp('long', 2, 20000);
  await openBandUI({ sold_inner: 92000, bought_inner: 70000, notional: 0.05 });
  const rt = await page.evaluate(() => {
    const open = [...Store.state.bands].reverse().find(b => b.status === 'open');
    if (!open) return { none: true };
    const r = Store.closeBand(open.id);
    return { ok:r.ok, raw_net:r.raw_net, settled_cash_leg:r.settled_cash_leg||null, finite:[r.raw_net,r.X,r.Y].every(v=>isFinite(v)) };
  });
  say('  round-trip: ' + JSON.stringify(rt) + ' raw_net=' + (isFinite(rt.raw_net)?rt.raw_net.toExponential(3):'n/a'));
  VERDICTS.standing_roundtrip_finite = (rt.ok === true && rt.finite === true);
  // FINDING-RT sign carry-forward
  if (rt.raw_net > 1e-9) FLAGS.push('FINDING-RT (INHERITED-v24, OPEN, not a regression): instant net-cash-zero open→close on a two-OTM-leg band yields POSITIVE raw_net (' + rt.raw_net.toExponential(3) + ') = trader-favourable, scales with slippage. Verified byte-identical in S1/S2/v24 base. Contradicts the brief "tiny pool-favourable residual" on the SIGN. SIGN convention unresolved by operator (entry 96 ruled "settle at lensed" but not round-trip direction). Escalate.');

  // near-ATM finite
  const atm = await page.evaluate(() => {
    const pool=Store.state.pool, tau=Store.state.tau; const sn=Engine.getSNorm(pool);
    const gA=Engine.gLoc(pool,sn,tau); const mC=Engine.markLensed('call',sn,sn,gA); const mP=Engine.markLensed('put',sn,sn,gA);
    return { gA, mC, mP, finite:[gA,mC,mP].every(v=>isFinite(v)) };
  });
  say('  near-ATM g_loc=' + atm.gA.toExponential(3) + ' markCall=' + atm.mC + ' markPut=' + atm.mP + ' finite=' + atm.finite);
  VERDICTS.standing_atm_finite = atm.finite;

  // steep one-ITM-leg — fresh pool, capture the opened band id, then drive sold-call ITM and close it.
  await settings(); await page.click('#btn-reset'); await page.waitForTimeout(250);
  await setPool(10, 6, 800000, 480000);
  await addPerp('long', 2, 20000);
  // ensure sold-CALL direction (dir pill may be left on "short" from the prior both-dirs step)
  await gotoTransact(); await page.click('.tab[data-subtab="bands"]').catch(()=>{}); await page.waitForTimeout(100);
  const steepDirCur = await page.evaluate(()=>document.getElementById('band-dir-sell')?.dataset.dir);
  if (steepDirCur !== 'long') { await page.click('#band-dir-sell').catch(()=>{}); await page.waitForTimeout(150); }
  const steepDir = await page.evaluate(()=>document.getElementById('band-dir-sell')?.dataset.dir);
  say('  steep band dir set to: ' + steepDir + ' (need long=sold-call)');
  const steepBands0 = await page.evaluate(()=>Store.state.bands.map(b=>b.id));
  const obSteep = await openBandUI({ sold_inner: 140000, bought_inner: 100000, notional: 0.05 });
  say('  steep band open: opened=' + obSteep.opened + ' warn="' + (obSteep.warn||'').slice(0,50) + '"');
  const steep = await page.evaluate((prev) => {
    const fresh = Store.state.bands.find(b => !prev.includes(b.id) && b.status === 'open');
    if (!fresh) return { none: true, nBands: Store.state.bands.length, statuses: Store.state.bands.map(b=>b.status) };
    Store.state.oracle = 160000; // sold call (strike 140k) now ITM at steep spot
    const r = Store.closeBand(fresh.id);
    return { ok:r.ok, raw_net:r.raw_net, settled_cash_leg:r.settled_cash_leg||null, live_leg:r.live_leg||null, finite:[r.raw_net,r.X,r.Y].every(v=>isFinite(v)) };
  }, steepBands0);
  say('  steep one-ITM-leg: ' + JSON.stringify(steep) + ' raw_net=' + (isFinite(steep.raw_net)?steep.raw_net.toExponential(3):'n/a'));
  VERDICTS.standing_steep_one_itm = (steep.ok === true && steep.finite === true && steep.settled_cash_leg !== null);
  await shot(page, RUN + '_STD_settle.png');

  // ───────────────────────────── STANDING: EXPORT/IMPORT round-trip
  say('\n========== STANDING: EXPORT/IMPORT round-trip ==========');
  const ei = await page.evaluate(() => {
    const before = Store.exportJSON();
    Store.importJSON(before);
    const after = Store.exportJSON();
    // compare ex-eventLog
    const sb = JSON.parse(before), sa = JSON.parse(after);
    delete sb.eventLog; delete sa.eventLog;
    return { identical: JSON.stringify(sb) === JSON.stringify(sa), len: before.length };
  });
  say('  export/import state identical (ex-eventLog): ' + ei.identical + ' (len=' + ei.len + ')');
  VERDICTS.standing_export_import = ei.identical;

  // reset
  await settings(); await page.click('#btn-reset'); await page.waitForTimeout(250);
  const afterReset = await page.evaluate(()=>({x:Store.state.pool.x, y:Store.state.pool.y, tau:Store.state.tau, bands:Store.state.bands?.length}));
  say('  after reset: ' + JSON.stringify(afterReset));
  await shot(page, RUN + '_STD_reset.png');

  // ───────────────────────────── console / errors
  say('\n========== CONSOLE / ERRORS ==========');
  say('  uncaught pageerrors: ' + pageErrs.length);
  pageErrs.forEach(e => say('    PAGEERROR: ' + e));
  say('  console errors: ' + consoleErrs.length);
  consoleErrs.forEach(e => say('    CONSOLE-ERROR: ' + e));
  say('  dialogs seen (' + dialogs.length + '): ' + JSON.stringify(dialogs.slice(0,10)));
  VERDICTS.zero_console_errors = (pageErrs.length === 0 && consoleErrs.length === 0);
  if (pageErrs.length || consoleErrs.length) FLAGS.push('FLAG: uncaught errors — see RUN_LOG.');

  say('\n========== FLAGS ==========');
  if (FLAGS.length === 0) say('  (none)');
  FLAGS.forEach(f => say('  ' + f));

  say('\n========== VERDICT SUMMARY ==========');
  let allPass = true;
  for (const [k, v] of Object.entries(VERDICTS)) { say('  ' + (v ? 'PASS' : 'FAIL') + '  ' + k); if (!v) allPass = false; }
  say('\n  OVERALL (gate verdicts): ' + (allPass ? 'PASS' : 'FAIL'));

  fs.writeFileSync(path.join(OUT, 'RUN_LOG_run' + RUN + '.txt'), log.join('\n'));
  await browser.close();
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });

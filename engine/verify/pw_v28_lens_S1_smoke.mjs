// v28 polar-lens Stage-1 STANDING UI SMOKE-PASS — live Playwright, READ-ONLY on the build.
// Build: builds/temporal_mvp_v28_lens_S1.html (md5 5e1ff278...). HEAD stays v27.
// Engine/Store reachable in evaluate; Viz/render are closure-only (NOT on window) — visuals are
// driven via REAL UI handlers that reach Viz through closure (btn-tick/arb/reset/execute).
// Canvas diff = RAW ImageData pixels (PNG byte-length is unreliable). Chart-2 elbow delta is also
// measured ANALYTICALLY via Engine.markLensed (the exact function the draw layer consumes).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BUILD = path.resolve('builds/temporal_mvp_v28_lens_S1.html');
const OUT = path.resolve('../evidence/v28_lens_S1');
fs.mkdirSync(OUT, { recursive: true });
const url = 'file://' + BUILD;

const log = [];
const say = (s) => { console.log(s); log.push(s); };
const shot = async (page, name) => { await page.screenshot({ path: path.join(OUT, name) }); };

async function rawpix(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid); if (!cv) return null;
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let lit = 0; const arr = new Uint8Array(d.length);
    for (let i = 0; i < d.length; i += 4) {
      arr[i]=d[i];arr[i+1]=d[i+1];arr[i+2]=d[i+2];arr[i+3]=d[i+3];
      if (d[i+3] > 8 && !(d[i]>250&&d[i+1]>250&&d[i+2]>250)) lit++;
    }
    // ship a compact rgb-only buffer as a normal array for diffing
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

  // set τ via the real stepper; `forceRedraw` clicks Advance Time so render()->Viz.drawAll fires
  async function setTau(v, forceRedraw = true) {
    await page.fill('#tau-input', String(v));
    await page.dispatchEvent('#tau-input', 'change');
    await page.waitForTimeout(80);
    if (forceRedraw) { await page.click('#btn-tick'); await page.waitForTimeout(180); }
  }
  async function setPool(x, alpha, y, beta) {
    await page.evaluate(({x,alpha,y,beta}) => {
      const s = JSON.parse(Store.exportJSON());
      s.pool.x=x; s.pool.alpha=alpha; s.pool.y=y; s.pool.beta=beta;
      Store.importJSON(JSON.stringify(s));
    }, {x,alpha,y,beta});
    await page.click('#btn-tick'); await page.waitForTimeout(150); // forces render()
  }
  async function chart2Profile(tau) {
    return await page.evaluate((tau) => {
      const s = Store.state; const sn = Engine.getSNorm(s.pool);
      const tmDeg = Math.atan(sn) * 180 / Math.PI; const phiMaxDeg = 89; const out = [];
      for (let i = 0; i <= 200; i++) {
        const th = (i / 200) * phiMaxDeg; const theta = Math.tan(th * Math.PI / 180);
        if (!(theta > 0)) { out.push([th, 0]); continue; }
        const wing = theta > sn ? 'call' : 'put';
        const g = Engine.gLoc(s.pool, theta, tau); let psi;
        if (!isFinite(g) || g <= 0) psi = Math.min(1, wing === 'call' ? sn/theta : theta/sn);
        else { const v = Engine.markLensed(wing, theta, sn, g); psi = (isFinite(v)&&v>=0)?Math.min(1,v):0; }
        out.push([th, psi]);
      }
      return { tmDeg, profile: out };
    }, tau);
  }
  function profileDelta(pA, pB, plotH = 300) {
    let maxd = 0, atPhi = 0;
    for (let i = 0; i < pA.profile.length; i++) {
      const d = Math.abs(pA.profile[i][1] - pB.profile[i][1]);
      if (d > maxd) { maxd = d; atPhi = pA.profile[i][0]; }
    }
    return { maxDpsi: maxd, atPhiDeg: atPhi, maxDpx: maxd * plotH };
  }

  // ───────────────────────────────────────────────────────── STEP 1
  say('\n========== STEP 1: open build, τ stepper, chart-2 mark + mode marker ==========');
  await page.click('.tab[data-subtab="settings"]').catch(()=>{});
  await page.waitForTimeout(150);
  const tauInfo = await page.evaluate(() => {
    const el = document.getElementById('tau-input');
    const ranges = document.querySelectorAll('input[type=range]').length;
    return el ? { type: el.type, value: el.value, min: el.min, max: el.max, step: el.step, ranges } : { missing: true };
  });
  say('  tau-input: ' + JSON.stringify(tauInfo));
  VERDICTS.s1_tau_stepper = (tauInfo.type === 'number' && tauInfo.value === '0.3' && tauInfo.ranges === 0);
  await shot(page, 'S1_01_settings_tau.png');
  await page.selectOption('#chart-select', 'pricing');
  await page.waitForTimeout(250);
  const c2 = await rawpix(page, 'canvas-pricing');
  say('  chart-2 (pricing) lit px: ' + (c2 && c2.lit));
  const markSane = await page.evaluate(() => {
    const s = Store.state; const sn = Engine.getSNorm(s.pool); const tau = s.tau;
    const psiWingCall = Engine.markLensed('call', sn*3, sn, Engine.gLoc(s.pool, sn*3, tau));
    const psiWingPut  = Engine.markLensed('put', sn/3, sn, Engine.gLoc(s.pool, sn/3, tau));
    return { sNorm: sn, tau, psiWingCall, psiWingPut };
  });
  say('  analytic mark sanity: ' + JSON.stringify(markSane));
  VERDICTS.s1_chart2 = (c2 && c2.lit > 200 && isFinite(markSane.psiWingCall) && markSane.psiWingCall < 1 && markSane.psiWingPut < 1);
  await shot(page, 'S1_02_chart2_pricing_default.png');

  // ───────────────────────────────────────────────────────── FLAG PROBE: does the τ event redraw?
  say('\n========== FLAG PROBE: τ stepper event-only redraw of chart-2 ==========');
  await setTau(0.3, true);
  const beforeEvt = await rawpix(page, 'canvas-pricing');
  await page.fill('#tau-input', '3'); await page.dispatchEvent('#tau-input', 'change'); await page.waitForTimeout(300); // event ONLY, no forcer
  const afterEvt = await rawpix(page, 'canvas-pricing');
  const evtDiff = rgbDiff(beforeEvt, afterEvt);
  const winViz = await page.evaluate(() => ({ viz: typeof window.Viz, render: typeof window.render }));
  say('  τ 0.3→3 via stepper EVENT ALONE: chart-2 px changed = ' + evtDiff + '  (0 ⇒ knob does NOT auto-redraw)');
  say('  window.Viz=' + winViz.viz + '  window.render=' + winViz.render + '  (handler guards on window.Viz)');
  VERDICTS.flag_tau_autoredraw = (evtDiff > 0);
  if (evtDiff === 0) FLAGS.push('FLAG-1 (chart-2 τ no-auto-redraw): turning the KURTOSIS τ stepper updates Store.state.tau but does NOT redraw chart-2 — px diff 0 on a 0.3→3 step. Root cause: τ-input change/input handler (~L2702) guards the redraw with `if (window.Viz && Viz.drawAll)`, but Viz is a const IIFE (L3175) never attached to window, so window.Viz===undefined and the redraw branch is dead. Chart-2 refreshes only when some OTHER action triggers render()/drawAll (tick/arb/trade/reset). One-line intern fix: `window.Viz = Viz;` or replace the guarded call with `render()`. This is the operator-class "curve insensitive to kurtosis change" symptom at the chart-2 lens.');

  // ───────────────────────────────────────────────────────── STEP 2 (forced redraw to measure TRUE lens visibility)
  say('\n========== STEP 2: sweep τ 0.3 → 0.05 (elbow sharpens; wings unchanged) — forced redraw ==========');
  await setTau(0.3, true);
  const prof03 = await chart2Profile(0.3);
  const c2_03 = await rawpix(page, 'canvas-pricing');
  await setTau(0.05, true);
  const prof005 = await chart2Profile(0.05);
  const c2_005 = await rawpix(page, 'canvas-pricing');
  const d_03_005 = profileDelta(prof03, prof005);
  const px_03_005 = rgbDiff(c2_03, c2_005);
  const wingDelta = Math.abs(prof03.profile[195][1] - prof005.profile[195][1]);
  say('  τ0.3→0.05 analytic max Δψ=' + d_03_005.maxDpsi.toExponential(3) + ' (~' + d_03_005.maxDpx.toFixed(1) + 'px) at φ=' + d_03_005.atPhiDeg.toFixed(1) + '°');
  say('  rendered chart-2 px changed (forced redraw): ' + px_03_005);
  say('  far-wing Δψ (φ~86.7°): ' + wingDelta.toExponential(3) + ' (should be ~0)');
  await shot(page, 'S2_01_chart2_tau005.png');
  VERDICTS.s2_elbow_sharpen = (d_03_005.maxDpsi > 1e-3 && px_03_005 > 50);
  VERDICTS.s2_wings_unchanged = (wingDelta < 5e-3);

  // ───────────────────────────────────────────────────────── STEP 3
  say('\n========== STEP 3: sweep τ 0.3 → 2 — DEFAULT + STEEP pool ==========');
  await setTau(0.3, true); const prof03d = await chart2Profile(0.3); const c2_03d = await rawpix(page,'canvas-pricing');
  await setTau(2, true);   const prof2d  = await chart2Profile(2);   const c2_2d  = await rawpix(page,'canvas-pricing');
  const d_def = profileDelta(prof03d, prof2d); const px_def = rgbDiff(c2_03d, c2_2d);
  const defW = await page.evaluate(()=>Engine.getW(Store.state.pool));
  say('  DEFAULT pool w=' + defW.toFixed(4) + ' γ=' + (defW/(1-defW)).toFixed(4) + ': τ0.3→2 analytic max Δψ=' + d_def.maxDpsi.toExponential(3) + ' (~' + d_def.maxDpx.toFixed(2) + 'px); rendered px changed=' + px_def);
  await shot(page, 'S3_01_chart2_tau2_defaultpool.png');

  // STEEP pool w=0.78
  await setPool(10, 7.8, 800000, 624000);
  const steepW = await page.evaluate(()=>Engine.getW(Store.state.pool));
  await setTau(0.3, true); const prof03s = await chart2Profile(0.3); const c2_03s = await rawpix(page,'canvas-pricing');
  await shot(page, 'S3_02_chart2_steep_tau03.png');
  await setTau(2, true);   const prof2s  = await chart2Profile(2);   const c2_2s  = await rawpix(page,'canvas-pricing');
  const d_steep = profileDelta(prof03s, prof2s); const px_steep = rgbDiff(c2_03s, c2_2s);
  const wingDeltaSteep = Math.abs(prof03s.profile[197][1] - prof2s.profile[197][1]);
  say('  STEEP pool w=' + steepW.toFixed(4) + ' γ=' + (steepW/(1-steepW)).toFixed(4) + ': τ0.3→2 analytic max Δψ=' + d_steep.maxDpsi.toExponential(3) + ' (~' + d_steep.maxDpx.toFixed(2) + 'px); rendered px changed=' + px_steep);
  say('  STEEP far-wing Δψ (φ~87.6°): ' + wingDeltaSteep.toExponential(3) + ' (tends to same slope)');
  await shot(page, 'S3_03_chart2_steep_tau2.png');
  VERDICTS.s3_default_effect = (px_def > 50);
  VERDICTS.s3_steep_visible = (px_steep > 50 && d_steep.maxDpsi > 0);
  // restore default pool
  await setPool(10, 5, 800000, 400000);
  await setTau(0.3, true);

  // ───────────────────────────────────────────────────────── STEP 4 (contamination probe)
  say('\n========== STEP 4: chart-1 plain-v24 + INVARIANT to τ (contamination probe — must be HARD 0) ==========');
  await page.selectOption('#chart-select', 'curve');
  await page.waitForTimeout(250);
  await setTau(0.3, true);
  const c1_base = await rawpix(page, 'canvas-curve');
  say('  chart-1 lit px: ' + c1_base.lit);
  await shot(page, 'S4_01_chart1_curve_tau03.png');
  let c1maxdiff = 0;
  for (const t of [0.05, 1.0, 2.0, 3.0]) {
    await setTau(t, true);  // force redraw at this τ, THEN compare chart-1
    const c1 = await rawpix(page, 'canvas-curve');
    const d = rgbDiff(c1_base, c1);
    say('    chart-1 px-diff vs τ0.3 at τ=' + t + ' (forced redraw): ' + d);
    if (d > c1maxdiff) c1maxdiff = d;
  }
  await shot(page, 'S4_02_chart1_curve_tau3.png');
  VERDICTS.s4_chart1_tau_invariant = (c1maxdiff === 0);
  say('  >>> chart-1 max px-diff across full τ sweep (forced redraws): ' + c1maxdiff + ' (MUST be 0)');
  if (c1maxdiff !== 0) FLAGS.push('FLAG: chart-1 CONTAMINATED by τ — pool curve changed ' + c1maxdiff + 'px under a τ sweep; τ must be chart-2/funding only.');
  await setTau(0.3, true);

  // ───────────────────────────────────────────────────────── STEP 5
  say('\n========== STEP 5: add perp + open band; ATM funding≈0 (g_loc→0), OTM signed; g=0/S*=0 finite ==========');
  await page.click('.tab[data-subtab="perps"]').catch(()=>{});
  await page.waitForTimeout(150);
  await page.selectOption('#perp-side', 'long').catch(()=>{});
  await page.fill('#perp-notional', '20000');
  await page.fill('#perp-margin', '2000');
  await page.click('#btn-add-perp');
  await page.waitForTimeout(200);
  await shot(page, 'S5_01_perp_added.png');
  const funding = await page.evaluate(() => {
    const s = Store.state; const tau = s.tau; const kappa = s.kappa; const dt = s.tick_hours;
    // At the SYMMETRIC default pool getMP_raw==oracle_initial ⇒ S=poolMark/oracle≡1 ⇒ (S-1)/S=0 for
    // every strike regardless of oracle. To exercise OTM funding the pool marginal must diverge from
    // the oracle: steepen w to 0.7 (mp=186,667 vs oracle_init=80,000 ⇒ S≈2.33). Then ATM→0 is purely
    // the g_loc→0 lens factor and OTM funding is alive & signed. (state-only; file untouched.)
    const steep = { x:10, y:800000, alpha:7, beta:560000 };
    const sn = Engine.getSNorm(steep);
    const Stest = Engine.poolMark(steep, s.oracle, s.oracle_initial) / s.oracle;
    const f = (theta, wing) => Engine.fundingPerStrike(steep, theta, wing, 1, dt, kappa, s.oracle, s.oracle_initial, tau);
    const atm = f(sn,'call'), atmP = f(sn,'put'), otmCall = f(sn*1.5,'call'), otmPut = f(sn/1.5,'put');
    const g_atm = Engine.gLoc(steep, sn, tau);
    return { sNorm: sn, S: Stest, g_atm, atm, atmP, otmCall, otmPut,
             finiteAll: [atm,atmP,otmCall,otmPut,g_atm].every(v=>isFinite(v)) };
  });
  say('  (steepened pool w=0.7 ⇒ S=' + funding.S.toFixed(4) + ' ≠ 1; ATM zeroed ONLY by g_loc→0)');
  say('  funding ATM call=' + funding.atm.toExponential(3) + ' put=' + funding.atmP.toExponential(3) + ' (g_atm=' + funding.g_atm.toExponential(3) + ')');
  say('  funding OTM call=' + funding.otmCall.toExponential(3) + ' (>0) OTM put=' + funding.otmPut.toExponential(3) + ' (<0)');
  say('  all finite (no NaN/Inf): ' + funding.finiteAll);
  VERDICTS.s5_atm_funding_zero = (Math.abs(funding.atm) < 1e-9 && Math.abs(funding.atmP) < 1e-9 && Math.abs(funding.g_atm) < 1e-9);
  VERDICTS.s5_otm_signed = (funding.otmCall > 0 && funding.otmPut < 0 && Math.abs(funding.otmCall) > 1e-9 && Math.abs(funding.otmPut) > 1e-9 && (funding.otmCall*funding.otmPut < 0));
  VERDICTS.s5_funding_finite = funding.finiteAll;
  const sstar = await page.evaluate(() => {
    const c = Engine.markLensed('call', 1.0, 1.0, 0), pp = Engine.markLensed('put', 1.0, 1.0, 0);
    return { call: c, put: pp, finite: isFinite(c) && isFinite(pp) };
  });
  say('  markLensed at g=0 exact (S*=0 path): call=' + sstar.call + ' put=' + sstar.put + ' finite=' + sstar.finite);
  VERDICTS.s5_gzero_finite = sstar.finite;
  await page.click('.tab[data-subtab="bands"]').catch(()=>{});
  await page.waitForTimeout(150);
  await shot(page, 'S5_02_bands_form.png');

  // ───────────────────────────────────────────────────────── STEP 6
  say('\n========== STEP 6: execute in-range trade — chart-1 reserves move on FIXED curve; chart-2 re-renders ==========');
  await page.selectOption('#chart-select', 'curve'); await page.waitForTimeout(200);
  const c1_pre = await rawpix(page, 'canvas-curve');
  const preState = await page.evaluate(() => { const p = Store.state.pool; return { x:p.x, y:p.y, alpha:p.alpha, beta:p.beta, w: Engine.getW(p), sNorm: Engine.getSNorm(p) }; });
  const bandPreview = await page.evaluate(() => ({
    soldInner: document.getElementById('sold-inner')?.value, soldOuter: document.getElementById('sold-outer')?.value,
    boughtInner: document.getElementById('bought-inner')?.value, boughtOuter: document.getElementById('bought-outer')?.value,
    notional: document.getElementById('band-notional')?.value, slip: document.getElementById('band-slippage')?.textContent,
    net: document.getElementById('pv-net-cash')?.textContent }));
  say('  band form (seeded): ' + JSON.stringify(bandPreview));
  await page.click('#btn-execute');
  await page.waitForTimeout(300);
  say('  dialogs during execute: ' + JSON.stringify(dialogs));
  const postState = await page.evaluate(() => { const p = Store.state.pool; return { x:p.x, y:p.y, alpha:p.alpha, beta:p.beta, w: Engine.getW(p), sNorm: Engine.getSNorm(p) }; });
  say('  pre  state: ' + JSON.stringify(preState));
  say('  post state: ' + JSON.stringify(postState));
  const inv = await page.evaluate(() => { const p = Store.state.pool; return Math.abs((p.x-p.alpha)*(p.y-p.beta) - p.alpha*p.beta) / (p.alpha*p.beta); });
  say('  trade invariant (x-α)(y-β)=αβ rel resid: ' + inv.toExponential(3));
  const c1_post = await rawpix(page, 'canvas-curve');
  say('  chart-1 px-diff pre/post trade: ' + rgbDiff(c1_pre, c1_post) + ' (reserves moved on fixed curve)');
  await shot(page, 'S6_01_chart1_post_trade.png');
  await page.selectOption('#chart-select', 'pricing'); await page.waitForTimeout(250);
  await shot(page, 'S6_02_chart2_post_trade.png');
  const c2_post = await rawpix(page, 'canvas-pricing');
  say('  chart-2 lit px post-trade: ' + (c2_post && c2_post.lit));
  const tradedMoved = (preState.x !== postState.x || preState.y !== postState.y);
  VERDICTS.s6_trade_invariant = (inv < 1e-9);
  VERDICTS.s6_chart2_rerenders = (c2_post && c2_post.lit > 200);
  say('  trade moved reserves: ' + tradedMoved);

  // ───────────────────────────────────────────────────────── STANDING SMOKE
  say('\n========== STANDING SMOKE: remaining controls, both directions ==========');
  await page.click('.tab[data-subtab="perps"]').catch(()=>{});
  await page.waitForTimeout(120);
  await page.selectOption('#perp-side', 'short').catch(()=>{});
  await page.fill('#perp-notional', '8000'); await page.fill('#perp-margin', '800');
  await page.click('#btn-add-perp'); await page.waitForTimeout(150);
  const perpCount = await page.evaluate(()=>Store.state.perps.length);
  say('  added short perp; total perps: ' + perpCount);
  await page.click('.tab[data-subtab="bands"]').catch(()=>{});
  await page.waitForTimeout(120);
  await page.click('#band-swap-btn').catch(()=>{});
  await page.waitForTimeout(200);
  const afterSwap = await page.evaluate(()=>({ slip: document.getElementById('band-slippage')?.textContent, net: document.getElementById('pv-net-cash')?.textContent }));
  say('  after band swap: ' + JSON.stringify(afterSwap));
  await shot(page, 'SM_01_band_after_swap.png');
  // arb + tick live in the Settings subtab (Loop Controls) — switch first
  await page.click('.tab[data-subtab="settings"]').catch(()=>{});
  await page.waitForTimeout(150);
  await page.click('#btn-arb'); await page.waitForTimeout(200);
  say('  ran arbitrage-to-oracle');
  await page.click('#btn-tick'); await page.waitForTimeout(150);
  say('  advanced time 1 tick');
  await page.click('.tab[data-subtab="earn"]').catch(()=>{});
  await page.waitForTimeout(120);
  const lpBefore = await page.evaluate(()=>document.getElementById('lp-pool-value')?.textContent);
  await page.click('#btn-lp-deposit'); await page.waitForTimeout(150);
  await page.click('#btn-lp-withdraw'); await page.waitForTimeout(150);
  const lpAfter = await page.evaluate(()=>document.getElementById('lp-pool-value')?.textContent);
  say('  LP deposit/withdraw round-trip: ' + lpBefore + ' -> ' + lpAfter);
  await page.selectOption('#chart-select', 'payoff'); await page.waitForTimeout(250);
  const payoff = await rawpix(page, 'canvas-payoff');
  say('  payoff canvas lit px: ' + (payoff && payoff.lit));
  await shot(page, 'SM_02_payoff.png');
  await page.selectOption('#chart-select', 'trajectory'); await page.waitForTimeout(250);
  const traj = await rawpix(page, 'canvas-ratio');
  say('  trajectory canvas lit px: ' + (traj && traj.lit));
  await shot(page, 'SM_03_trajectory.png');
  await page.click('.tab[data-subtab="settings"]').catch(()=>{});
  await page.waitForTimeout(150);
  await page.click('#btn-reset'); await page.waitForTimeout(200);
  const afterReset = await page.evaluate(()=>({ x: Store.state.pool.x, y: Store.state.pool.y, tau: Store.state.tau, perps: Store.state.perps?.length, bands: Store.state.bands?.length }));
  say('  after reset: ' + JSON.stringify(afterReset));
  await shot(page, 'SM_04_after_reset.png');

  // ───────────────────────────────────────────────────────── console / errors
  say('\n========== CONSOLE / ERRORS ==========');
  say('  uncaught pageerrors: ' + pageErrs.length);
  pageErrs.forEach(e => say('    PAGEERROR: ' + e));
  say('  console errors: ' + consoleErrs.length);
  consoleErrs.forEach(e => say('    CONSOLE-ERROR: ' + e));
  VERDICTS.zero_console_errors = (pageErrs.length === 0 && consoleErrs.length === 0);

  say('\n========== FLAGS ==========');
  if (FLAGS.length === 0) say('  (none)');
  FLAGS.forEach(f => say('  ' + f));

  say('\n========== VERDICT SUMMARY ==========');
  let allPass = true;
  for (const [k, v] of Object.entries(VERDICTS)) { say('  ' + (v ? 'PASS' : 'FAIL') + '  ' + k); if (!v) allPass = false; }
  say('\n  OVERALL: ' + (allPass ? 'PASS' : 'FAIL'));

  fs.writeFileSync(path.join(OUT, 'RUN_LOG.txt'), log.join('\n'));
  await browser.close();
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });

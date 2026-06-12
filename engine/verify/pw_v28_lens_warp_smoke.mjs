// v28-lens-WARP (C16 goal-seek-warp build) LIVE smoke — promotion gate.
// Build: engine/builds/temporal_mvp_v28_lens_warp.html (md5 abd46149...)
// Run:   cd engine && PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v28_lens_warp_smoke.mjs A
// Confirms: (1) held-lens warp VISIBLE on trade preview, grows OTM; (2) goal-seek
// readout (G=3=>w'=0.75=>g'=3; G<1 => message; read-pt gamma refreshes); (3) honest
// copy quote; (4) no regression (tau live, trades, settle, dir swaps).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const RUN = process.argv[2] || 'A';
const ROOT = path.resolve(process.cwd(), '..');
const BUILD = path.join(ROOT, 'engine/builds/temporal_mvp_v28_lens_warp.html');
const OUT = path.join(ROOT, 'evidence/v28_lens_warp');
fs.mkdirSync(OUT, { recursive: true });
const LOG = [];
const log = (...a) => { const s = a.join(' '); LOG.push(s); console.log(s); };
const shot = async (page, name) => { await page.screenshot({ path: path.join(OUT, `${RUN}_${name}.png`) }); };

const errs = [];
const pageerrs = [];

(async () => {
  log(`=== RUN ${RUN} === build=${BUILD}`);
  const browser = await chromium.launch({ executablePath: undefined });
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 } });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => pageerrs.push(String(e)));
  const dialogs = [];
  page.on('dialog', d => { dialogs.push(d.message()); d.accept(); });

  await page.goto('file://' + BUILD, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await shot(page, '00_load');

  // helper: switch chart view via select
  const setChart = async (v) => { await page.selectOption('#chart-select', v); await page.waitForTimeout(150); };
  // helper: go to a Transact subtab
  const subtab = async (name) => {
    await page.click('.page-nav-link[data-page="transact"]');
    await page.click(`.tab[data-subtab="${name}"]`);
    await page.waitForTimeout(120);
  };
  // canvas pixel hash + nonblank px count
  const canvasStats = async (id) => page.evaluate((cid) => {
    const cv = document.getElementById(cid);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let nz = 0, h = 0;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i] + d[i+1] + d[i+2] + d[i+3];
      if (a > 30) nz++;
      h = (h * 31 + a) >>> 0;
    }
    return { nz, h };
  }, id);
  const canvasDiff = async (id, before) => {
    const after = await canvasStats(id);
    return { before: before.h, after: after.h, nzBefore: before.nz, nzAfter: after.nz, changed: before.h !== after.h };
  };

  // ===================================================================
  // FEATURE 2 — GOAL-SEEK readout
  // ===================================================================
  log('\n--- FEATURE 2: GOAL-SEEK readout ---');
  await subtab('settings');
  await page.waitForTimeout(100);
  // default G=3
  const gs3 = await page.evaluate(() => ({
    G: document.getElementById('goalseek-g-input').value,
    live: document.getElementById('gs-gamma-live').textContent,
    wp: document.getElementById('gs-wprime').textContent,
    gp: document.getElementById('gs-gamma-prime').textContent,
  }));
  log('G=3 (default):', JSON.stringify(gs3));
  await shot(page, '10_goalseek_G3');

  // set G=2 via real input event
  await page.fill('#goalseek-g-input', '2');
  await page.dispatchEvent('#goalseek-g-input', 'input');
  await page.waitForTimeout(80);
  const gs2 = await page.evaluate(() => ({
    wp: document.getElementById('gs-wprime').textContent,
    gp: document.getElementById('gs-gamma-prime').textContent,
  }));
  log('G=2:', JSON.stringify(gs2), '(expect w\'=0.6667 g\'=2)');

  // set G=10
  await page.fill('#goalseek-g-input', '10');
  await page.dispatchEvent('#goalseek-g-input', 'input');
  await page.waitForTimeout(80);
  const gs10 = await page.evaluate(() => ({
    wp: document.getElementById('gs-wprime').textContent,
    gp: document.getElementById('gs-gamma-prime').textContent,
  }));
  log('G=10:', JSON.stringify(gs10), '(expect w\'=0.9091 g\'=10)');

  // set G<1 (0.5) => message, no clamp
  await page.fill('#goalseek-g-input', '0.5');
  await page.dispatchEvent('#goalseek-g-input', 'input');
  await page.waitForTimeout(80);
  const gsLo = await page.evaluate(() => ({
    wp: document.getElementById('gs-wprime').textContent,
    gp: document.getElementById('gs-gamma-prime').textContent,
  }));
  log('G=0.5 (<1):', JSON.stringify(gsLo), '(expect "G>=1 required", no number)');
  await shot(page, '11_goalseek_Glo');

  // restore G=3
  await page.fill('#goalseek-g-input', '3');
  await page.dispatchEvent('#goalseek-g-input', 'input');
  await page.waitForTimeout(80);

  // read-point gamma live at default pool (w=0.5 => gamma=1)
  const liveAtDefault = await page.evaluate(() => document.getElementById('gs-gamma-live').textContent);
  log('read-point gamma (live) @ default pool:', liveAtDefault, '(expect ~1.0000, w=0.5)');

  // ===================================================================
  // Honest copy (FEATURE 3)
  // ===================================================================
  log('\n--- FEATURE 3: honest copy ---');
  const copyTexts = await page.evaluate(() => {
    // gather the sim-aid-labels near goalseek
    const labels = Array.from(document.querySelectorAll('#subtab-settings .sim-aid-label, .panel-section .sim-aid-label'));
    // find the one mentioning "actuator" / "warps the WHOLE"
    const main = labels.find(l => /actuator|warps the WHOLE|asymmetric skew/i.test(l.textContent));
    const gLabel = labels.find(l => /target wing-exponent/i.test(l.textContent));
    return {
      main: main ? main.textContent.replace(/\s+/g, ' ').trim() : '(NOT FOUND)',
      gLabel: gLabel ? gLabel.textContent.replace(/\s+/g, ' ').trim() : '(NOT FOUND)',
    };
  });
  log('GOAL-SEEK G input label:\n   "' + copyTexts.gLabel + '"');
  log('GOAL-SEEK advisory copy:\n   "' + copyTexts.main + '"');

  // ===================================================================
  // FEATURE 1 — held-lens warp VISIBLE on trade preview, grows OTM
  // ===================================================================
  log('\n--- FEATURE 1: held-lens warp on trade preview ---');
  // Switch the chart to the option/value (pricing) view where the held-lens
  // warp is drawn (canvas-pricing).
  await subtab('settings');
  await setChart('pricing');
  await page.waitForTimeout(150);
  const pricingBaseline = await canvasStats('canvas-pricing');
  log('canvas-pricing baseline (no preview): nz=' + pricingBaseline.nz);
  await shot(page, '20_pricing_baseline');

  // Stage a one-sided band trade with enough size. The default pool w=0.5
  // (gamma=1); a SOLD-leg-only (after-sold-leg, step 1) preview moves w hard.
  // Build a long band: sold-CALL inner above oracle, bought-PUT inner below.
  await subtab('bands');
  // ensure dir = long
  const dir0 = await page.evaluate(() => document.getElementById('band-dir-sell').dataset.dir);
  log('band dir =', dir0);
  await page.fill('#band-notional', '2');           // 2 BTC — large one-sided drive
  await page.fill('#sold-inner', '120000');         // sold CALL K=120k (OTM, theta=1.5)
  await page.fill('#bought-inner', '50000');        // bought PUT K=50k (OTM, theta=0.625)
  await page.dispatchEvent('#sold-inner', 'input');
  await page.dispatchEvent('#bought-inner', 'input');
  await page.dispatchEvent('#band-notional', 'input');
  await page.waitForTimeout(200);
  const warn0 = await page.evaluate(() => document.getElementById('warn-area').textContent.trim());
  const slip0 = await page.evaluate(() => document.getElementById('band-slippage').textContent.trim());
  log('after preview: warn="' + warn0 + '" slippage=' + slip0);

  // select preview STEP 1 (after sold leg only = the one-sided large-w-move state)
  await page.evaluate(() => { if (typeof setPreviewStep === 'function') setPreviewStep(1); });
  await page.waitForTimeout(150);

  // Measure the warp EXACTLY as drawState() draws it: BOTH curves use the HELD
  // mode (snap.sNorm, pre-step) for the mark coordinate; the dashed curve's
  // exponent g comes from the PREVIEW pool via Engine.gLoc(previewPool, theta, tau).
  //   psi_live(K)    = markLensed(wing, theta, heldMode, gLoc(livePool, theta, tau))
  //   psi_preview(K) = markLensed(wing, theta, heldMode, gLoc(previewPool, theta, tau))
  // The visible warp at strike K is |psi_preview - psi_live| (in mark units, the
  // y-axis of canvas-pricing). The spec asks: does it GROW out into the wings,
  // and is it NOT re-registered flat (== 0 everywhere)?
  const warpProfile = await page.evaluate(() => {
    const s = Store.state;
    const pp = window.__previewPool;
    if (!pp) return { ok: false };
    const wLive = Engine.getW(s.pool), wPrev = Engine.getW(pp);
    const gLive = wLive / (1 - wLive), gPrev = wPrev / (1 - wPrev);
    const tau = s.tau;
    const heldMode = (1 - wLive) / wLive;            // snap.sNorm of the LIVE pool
    // replicate drawState psiAt for a given pool+wing at a strike theta, held mode
    const psiAt = (pool, theta, wing) => {
      const g = Engine.gLoc(pool, theta, tau);
      if (!isFinite(g) || g <= 0) return Math.min(1, wing === 'call' ? heldMode/theta : theta/heldMode);
      const v = Engine.markLensed(wing, theta, heldMode, g);
      return (isFinite(v) && v >= 0) ? Math.min(1.0, v) : 0;
    };
    const sample = (theta, wing) => {
      const gL = Engine.gLoc(s.pool, theta, tau), gP = Engine.gLoc(pp, theta, tau);
      const pL = psiAt(s.pool, theta, wing), pP = psiAt(pp, theta, wing);
      return { theta, wing, gL, gP, dG: gP - gL, psiLive: pL, psiPrev: pP, dPsi: pP - pL };
    };
    // call wing ladder (theta>mode): ATM-ward -> deep OTM
    const calls = [1.05, 1.2, 1.5, 2.0, 3.0, 4.0].map(t => sample(t, 'call'));
    // put wing ladder (theta<mode): ATM-ward -> deep OTM
    const puts  = [0.95, 0.83, 0.67, 0.5, 0.33, 0.25].map(t => sample(t, 'put'));
    return { ok: true, wLive, wPrev, gLive, gPrev, tau, heldMode, calls, puts };
  });
  log('warp profile (step1 = sold-leg-only preview, drawn-faithful):');
  log('   wLive=' + (warpProfile.wLive||0).toFixed(5) + ' -> wPrev=' + (warpProfile.wPrev||0).toFixed(5)
      + '  gammaLive=' + (warpProfile.gLive||0).toFixed(4) + ' -> gammaPrev=' + (warpProfile.gPrev||0).toFixed(4)
      + '  heldMode=' + (warpProfile.heldMode||0).toFixed(4) + '  tau=' + warpProfile.tau);
  if (warpProfile.ok) {
    log('   CALL wing (theta>mode, OTM grows right):');
    for (const c of warpProfile.calls)
      log('     theta=' + c.theta.toFixed(2) + ' g_loc ' + c.gL.toFixed(4) + '->' + c.gP.toFixed(4)
          + ' |dG|=' + Math.abs(c.dG).toFixed(4) + '  psi ' + c.psiLive.toFixed(4) + '->' + c.psiPrev.toFixed(4)
          + ' |dPsi|=' + Math.abs(c.dPsi).toFixed(4));
    log('   PUT wing (theta<mode, OTM grows left):');
    for (const c of warpProfile.puts)
      log('     theta=' + c.theta.toFixed(2) + ' g_loc ' + c.gL.toFixed(4) + '->' + c.gP.toFixed(4)
          + ' |dG|=' + Math.abs(c.dG).toFixed(4) + '  psi ' + c.psiLive.toFixed(4) + '->' + c.psiPrev.toFixed(4)
          + ' |dPsi|=' + Math.abs(c.dPsi).toFixed(4));
  }
  await shot(page, '21_pricing_warp_step1');

  // ---- MODE-CONTROLLED warp shape (isolate the per-strike Phi_tau growth) ----
  // The drawn dG above is confounded by the preview pool's MODE shift (its sNorm
  // moves, so gLoc(previewPool,theta) reads u from the shifted mode). To test the
  // DESIGN CLAIM "more in the wings, scaled by the lens Phi_tau", hold ONE mode
  // and evaluate the pure warp dG(u) = (gamma' - gamma)*Phi_tau(|u|), Phi_tau =
  // |u|/sqrt(tau^2+u^2), as a function of log-moneyness u from a FIXED mode=1.
  const pureWarp = await page.evaluate(() => {
    const s = Store.state; const pp = window.__previewPool;
    const tau = s.tau;
    const gLive = (()=>{const w=Engine.getW(s.pool);return w/(1-w);})();
    const gPrev = (()=>{const w=Engine.getW(pp);return w/(1-w);})();
    const Phi = (u) => Math.abs(u)/Math.sqrt(tau*tau+u*u);
    const rows = [0.05,0.1,0.2,0.4,0.7,1.0,1.4].map(u => ({ u, Phi: Phi(u), dG: (gPrev-gLive)*Phi(u) }));
    return { gLive, gPrev, dGamma: gPrev-gLive, tau, rows };
  });
  log('mode-controlled pure warp dG(u)=(gamma\'-gamma)*Phi_tau(|u|), dGamma=' + pureWarp.dGamma.toFixed(4) + ' tau=' + pureWarp.tau + ':');
  for (const r of pureWarp.rows)
    log('     |u|=' + r.u.toFixed(2) + '  Phi_tau=' + r.Phi.toFixed(4) + '  dG=' + r.dG.toFixed(4));

  // canvas px confirmation: the preview must change canvas-pricing vs baseline
  const pricingWithPreview = await canvasDiff('canvas-pricing', pricingBaseline);
  log('canvas-pricing changed by preview? ' + pricingWithPreview.changed + ' (nz ' + pricingWithPreview.nzBefore + ' -> ' + pricingWithPreview.nzAfter + ')');

  // ---- perpendicular px separation between live and dashed-preview curve at near vs far strike ----
  // Reconstruct the canvas mapping used by drawPricing to measure separation in px.
  const sep = await page.evaluate(() => {
    const s = Store.state;
    const pp = window.__previewPool;
    if (!pp) return null;
    const cv = document.getElementById('canvas-pricing');
    const W = cv.width, H = cv.height;
    // mirror drawPricing pad + axes (read from source: pad varies; reconstruct from known constants)
    // We instead sample the rendered ImageData along vertical scanlines at the
    // x-pixel of a near strike and a far strike, and measure the vertical gap
    // between the two distinct colored strokes (live call=teal, preview=coffee).
    const ctx = cv.getContext('2d');
    const img = ctx.getImageData(0, 0, W, H).data;
    // teal call ~ (10,186,181); coffee preview ~ (199,183,165)
    const isTeal = (r,g,b) => (g > 130 && b > 120 && r < 120);
    const isCoffee = (r,g,b) => (r > 150 && g > 140 && b > 120 && Math.abs(r-g) < 60 && r >= g && g >= b);
    // map strike theta -> x pixel. drawPricing: x-axis phi in deg, tan(phi)=theta,
    // toPx uses pad.left + (phi/phiMax)*plotW. phiMax ~ 88deg (call side near 90).
    // We'll scan ALL columns and, for the two columns nearest a target phi, find
    // the y of teal and coffee strokes.
    function phiOf(theta){ return Math.atan(theta)*180/Math.PI; }
    // estimate plot geometry by finding leftmost/rightmost columns containing teal OR pink stroke
    let minX=W, maxX=0;
    const isPink=(r,g,b)=>(r>180 && b>120 && g<170 && r>g);
    for (let x=0;x<W;x++){
      for (let y=0;y<H;y++){
        const i=(y*W+x)*4; const r=img[i],g=img[i+1],b=img[i+2];
        if (isTeal(r,g,b)||isPink(r,g,b)){ if(x<minX)minX=x; if(x>maxX)maxX=x; break; }
      }
    }
    // phi range roughly [0, ~88]; map theta->x by proportion of phi
    const phiMax = 88;
    const xOf = (theta) => Math.round(minX + (phiOf(theta)/phiMax) * (maxX-minX));
    function gapAt(theta){
      const x = xOf(theta);
      let yTeal=-1, yCoffee=-1;
      for (let y=0;y<H;y++){
        const i=(y*W+x)*4; const r=img[i],g=img[i+1],b=img[i+2];
        if (yTeal<0 && isTeal(r,g,b)) yTeal=y;
        if (yCoffee<0 && isCoffee(r,g,b)) yCoffee=y;
      }
      return { theta, x, yTeal, yCoffee, gap: (yTeal>=0 && yCoffee>=0) ? Math.abs(yTeal-yCoffee) : null };
    }
    return { minX, maxX, near: gapAt(1.15), mid: gapAt(1.6), far: gapAt(2.4), farther: gapAt(3.2) };
  });
  log('px separation (live teal vs preview coffee), call wing:');
  if (sep) {
    log('   plot x-range [' + sep.minX + ',' + sep.maxX + ']');
    for (const k of ['near','mid','far','farther']) {
      const g = sep[k];
      log('   theta=' + g.theta + ' x=' + g.x + ' yTeal=' + g.yTeal + ' yCoffee=' + g.yCoffee + ' gap_px=' + g.gap);
    }
  } else log('   (no preview pool)');

  // step 2 (after both legs) for contrast — historically near-cash-neutral
  await page.evaluate(() => { if (typeof setPreviewStep === 'function') setPreviewStep(2); });
  await page.waitForTimeout(120);
  const warpStep2 = await page.evaluate(() => {
    const s = Store.state; const pp = window.__previewPool;
    if (!pp) return null;
    const wLive = Engine.getW(s.pool), wPrev = Engine.getW(pp);
    return { wLive, wPrev, gLive: wLive/(1-wLive), gPrev: wPrev/(1-wPrev) };
  });
  log('step2 (both legs): wLive=' + (warpStep2?warpStep2.wLive.toFixed(5):'-') + ' -> wPrev=' + (warpStep2?warpStep2.wPrev.toFixed(5):'-'));
  await shot(page, '22_pricing_warp_step2');
  // back to step 1 for the screenshot record
  await page.evaluate(() => { if (typeof setPreviewStep === 'function') setPreviewStep(1); });
  await page.waitForTimeout(120);

  // refresh of read-point gamma after a trade: EXECUTE the band, then read gs-gamma-live
  log('\n--- read-point gamma refresh after a trade that MOVES the pool ---');
  // Execute a real trade that actually moves the live pool w (a one-sided sold-CALL
  // barrier band sized within the seeded club), via Store.openBand (Engine/Store
  // ARE reachable from evaluate; Viz is not). Then read gs-gamma-live which
  // updateGoalSeek() recomputes from the live pool on render().
  const tradeMove = await page.evaluate(() => {
    const s = Store.state; const o = s.oracle;
    const wBefore = Engine.getW(s.pool);
    // small barrier sold-call only is not possible (band needs both legs); use a
    // small collar the seeded long club can afford.
    const r = Store.openBand('call','put',
      { inner: 110000, outer: NaN }, { inner: 60000, outer: NaN },
      0.05, 'long');   // K in DOLLARS — openBand divides by oracle internally
    const wAfter = Engine.getW(s.pool);
    return { ok: r && r.ok, reason: r && r.reason, wBefore, wAfter,
             gBefore: wBefore/(1-wBefore), gAfter: wAfter/(1-wAfter) };
  });
  log('trade openBand result: ' + JSON.stringify(tradeMove));
  // refresh the readout the way the app does on any render — fire the goalseek input
  await subtab('settings');
  await page.dispatchEvent('#goalseek-g-input', 'input');
  await page.waitForTimeout(120);
  const liveAfterTrade = await page.evaluate(() => document.getElementById('gs-gamma-live').textContent);
  log('read-point gamma (live) AFTER pool-moving trade:', liveAfterTrade,
      '(engine wAfter=' + (tradeMove.wAfter||0).toFixed(5) + ' gammaAfter=' + (tradeMove.gAfter||0).toFixed(4) + ')');
  await shot(page, '23_goalseek_after_trade');

  // ===================================================================
  // FEATURE 4 — no regression: tau live, trades, settle, dir swaps
  // ===================================================================
  log('\n--- FEATURE 4: regression checks ---');
  // tau stepper steepens chart-2 live. Reset via the real Reset button (re-seeds
  // boot state + redraws through the real handler; Viz/render are NOT reachable
  // from page.evaluate, per the standing methodology gotcha).
  await page.click('#btn-reset');
  await page.waitForTimeout(150);
  // clear the band preview by blanking band inputs (previewBand clears + redraws)
  await subtab('bands');
  await page.fill('#band-notional', '');
  await page.fill('#sold-inner', '');
  await page.fill('#bought-inner', '');
  await page.dispatchEvent('#band-notional', 'input');
  await page.waitForTimeout(120);
  await subtab('settings');
  await setChart('pricing');
  await page.waitForTimeout(150);
  const tauBase = await canvasStats('canvas-pricing');
  await page.fill('#tau-input', '2');
  await page.dispatchEvent('#tau-input', 'change');
  await page.waitForTimeout(150);
  const tauHi = await canvasDiff('canvas-pricing', tauBase);
  log('tau 0.3->2 changed canvas-pricing? ' + tauHi.changed + ' (nz ' + tauHi.nzBefore + ' -> ' + tauHi.nzAfter + ')');
  // real keyboard ArrowUp on tau
  await page.fill('#tau-input', '0.3');
  await page.dispatchEvent('#tau-input', 'change');
  await page.waitForTimeout(120);
  const tauBase2 = await canvasStats('canvas-pricing');
  await page.focus('#tau-input');
  await page.keyboard.press('ArrowUp');
  await page.dispatchEvent('#tau-input', 'change');
  await page.waitForTimeout(120);
  const tauArrow = await canvasDiff('canvas-pricing', tauBase2);
  const tauVal = await page.evaluate(() => document.getElementById('tau-input').value);
  log('tau ArrowUp -> ' + tauVal + ' changed canvas-pricing? ' + tauArrow.changed);
  await shot(page, '30_tau_live');

  // chart-1 (pool curve) inert to tau with band cleared (read/write separation)
  await page.fill('#tau-input', '0.3');
  await page.dispatchEvent('#tau-input', 'change');
  await page.waitForTimeout(100);
  await setChart('curve');
  await page.waitForTimeout(120);
  const curveBase = await canvasStats('canvas-curve');
  await page.fill('#tau-input', '3');
  await page.dispatchEvent('#tau-input', 'change');
  await page.waitForTimeout(120);
  const curveTau = await canvasDiff('canvas-curve', curveBase);
  log('tau 0.3->3 changed canvas-CURVE (pool)? ' + curveTau.changed + ' (expect FALSE - pool inert)');
  await page.fill('#tau-input', '0.3'); await page.dispatchEvent('#tau-input', 'change');

  // trade executes (already did above) + arb + tick still work
  await page.click('#btn-tick').catch(()=>{});
  await page.waitForTimeout(120);
  await page.click('#btn-arb').catch(()=>{});
  await page.waitForTimeout(120);
  log('tick + arb clicked, dialogs so far=' + JSON.stringify(dialogs));

  // direction swap behaves (long<->short)
  await subtab('bands');
  await page.fill('#band-notional', '0.05');
  await page.fill('#sold-inner', '110000');
  await page.fill('#bought-inner', '60000');
  await page.dispatchEvent('#sold-inner', 'input');
  await page.waitForTimeout(150);
  const dirBefore = await page.evaluate(() => document.getElementById('band-dir-sell').dataset.dir);
  const slipBefore = await page.evaluate(() => document.getElementById('band-slippage').textContent.trim());
  await page.click('#band-swap-btn');
  await page.waitForTimeout(200);
  const dirAfter = await page.evaluate(() => document.getElementById('band-dir-sell').dataset.dir);
  const warnAfter = await page.evaluate(() => document.getElementById('warn-area').textContent.trim());
  const slipAfter = await page.evaluate(() => document.getElementById('band-slippage').textContent.trim());
  log('dir swap: ' + dirBefore + ' (slip ' + slipBefore + ') -> ' + dirAfter + ' (slip ' + slipAfter + ') warn="' + warnAfter + '"');
  await shot(page, '31_dir_swap');

  // settlement / close: open a band then close it
  log('\n--- settlement/close ---');
  const closeRes = await page.evaluate(() => {
    // open a small valid long band on the live pool then close it.
    // openBand is POSITIONAL: (sold_wing, bought_wing, sold_K, bought_K, N_sell_asset, clubSide)
    // sold_K/bought_K are sNorm rays (K/oracle).
    const s = Store.state;
    const oracle = s.oracle;
    const r = Store.openBand('call', 'put',
      { inner: 110000, outer: NaN },
      { inner: 60000, outer: NaN },
      0.02, 'long');   // K in DOLLARS
    if (!r || !r.ok) return { opened: false, reason: r && r.reason };
    const id = r.bandId;
    const c = Store.closeBand(id);
    return { opened: true, bandId: id, closed: !!c, raw_net: c && c.raw_net,
             settled_cash_leg: c && !!c.settled_cash_leg, live_leg: c && !!c.live_leg };
  });
  log('open+close band: ' + JSON.stringify(closeRes));

  await shot(page, '40_final');

  // ===================================================================
  log('\n=== console.errors=' + errs.length + ' pageerrors=' + pageerrs.length + ' ===');
  if (errs.length) log('ERRORS:\n' + errs.join('\n'));
  if (pageerrs.length) log('PAGEERRORS:\n' + pageerrs.join('\n'));
  log('dialogs total=' + dialogs.length + ': ' + JSON.stringify(dialogs));

  fs.writeFileSync(path.join(OUT, `RUN_LOG_run${RUN}.txt`), LOG.join('\n'));
  await browser.close();
})().catch(e => { console.error('FATAL', e); fs.writeFileSync(path.join(OUT, `RUN_LOG_run${RUN}_FATAL.txt`), LOG.join('\n') + '\nFATAL ' + e.stack); process.exit(1); });

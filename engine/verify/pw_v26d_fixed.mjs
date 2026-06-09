// RE-VERIFY v26d TDZ fix (build a406a751). Comprehensive must-pass + regression items.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import path from 'path';
const BUILD = '/home/user/Perp-Options-AMM/engine/builds/temporal_mvp_v26d_volknob.html';
const OUT = '/home/user/Perp-Options-AMM/evidence/v26d_volknob_ui';

const pixOf = (id) => `(() => { const cv=document.getElementById('${id}'); if(!cv) return {missing:true}; const ctx=cv.getContext('2d'); const d=ctx.getImageData(0,0,cv.width,cv.height).data; let nb=0,sum=0; for(let i=0;i<d.length;i+=4){ if(d[i]||d[i+1]||d[i+2]){nb++;} sum+=d[i]+d[i+1]+d[i+2]; } return { nonblank:nb, total:d.length/4, sum }; })()`;
const setSigma = (v) => `(() => { const e=document.getElementById('vk-sigma'); e.value='${v}'; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); })()`;
const setView = (v) => `(() => { const e=document.getElementById('chart-select'); e.value='${v}'; e.dispatchEvent(new Event('change',{bubbles:true})); })()`;
const ro = (id) => `(() => document.getElementById('${id}')?.textContent)()`;

async function run(pass) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type()==='error') errs.push('console:'+m.text()); });
  await page.goto('file://' + BUILD, { waitUntil: 'load' });
  await page.waitForTimeout(700);

  const loadErrs = [...new Set(errs)];

  // Item 1: TDZ / Viz+render defined. Probe via the page's actual scope: Viz/render are top-level
  // const in <script id=ui>. Test reachability the way the prior diag did (typeof in evaluate) AND
  // functionally (chart-select listener bound => Viz exists; render reachable via a UI control path).
  const item1 = await page.evaluate(`(() => {
    let vizType, renderType;
    try { vizType = typeof Viz; } catch(e){ vizType='THROWS:'+e.message; }
    try { renderType = typeof render; } catch(e){ renderType='THROWS:'+e.message; }
    return { vizType, renderType };
  })()`);
  // Functional: does chart-select listener actually work (proves Viz bound after the deferred apply)?
  await page.evaluate(setView('payoff')); await page.waitForTimeout(150);
  const payoffViewPix = await page.evaluate(pixOf('canvas-payoff'));
  await page.evaluate(setView('curve')); await page.waitForTimeout(150);
  const item1b = { chartSelectWorks_payoffNonblank: payoffViewPix.nonblank, errsAfterViewSwitch: errs.length };

  // Item 2: canvases render on load (curve, payoff, portfolio/ratio)
  const curve0 = await page.evaluate(pixOf('canvas-curve'));
  const payoff0 = await page.evaluate(pixOf('canvas-payoff'));
  // portfolio chart canvas id? probe candidates
  const canvasInventory = await page.evaluate(`(() => Array.from(document.querySelectorAll('canvas')).map(c=>({id:c.id,w:c.width,h:c.height})))()`);
  await page.screenshot({ path: path.join(OUT, `p${pass}_fixed_A_dashboard_full.png`), fullPage: true }).catch(()=>{});

  // Item 3: sigma up & down re-warps LIVE curve. Capture pixel signatures + gamma readout.
  await page.evaluate(setView('curve')); await page.waitForTimeout(150);
  const c_default = await page.evaluate(pixOf('canvas-curve'));
  const g_default = await page.evaluate(ro('vk-gamma-out'));
  await page.evaluate(setSigma('0.30')); await page.waitForTimeout(250);
  const c_hi = await page.evaluate(pixOf('canvas-curve'));
  const g_hi = await page.evaluate(ro('vk-gamma-out'));
  await page.screenshot({ path: path.join(OUT, `p${pass}_fixed_F_curve_sigma030.png`) }).catch(()=>{});
  await page.evaluate(setSigma('0.08')); await page.waitForTimeout(250);
  const c_lo = await page.evaluate(pixOf('canvas-curve'));
  const g_lo = await page.evaluate(ro('vk-gamma-out'));
  await page.screenshot({ path: path.join(OUT, `p${pass}_fixed_G_curve_sigma008.png`) }).catch(()=>{});
  await page.evaluate(setSigma('0.129')); await page.waitForTimeout(200);
  const item3 = {
    g_default, g_hi, g_lo,
    curveChanged_hi: c_hi.sum !== c_default.sum, curveChanged_lo: c_lo.sum !== c_hi.sum,
    sums: { def:c_default.sum, hi:c_hi.sum, lo:c_lo.sum },
    nonblank: { def:c_default.nonblank, hi:c_hi.nonblank, lo:c_lo.nonblank }
  };

  // Set up a position + open a band so the pro-forma/stepper/portfolio paths are live.
  const setup = await page.evaluate(`(() => {
    try {
      Store.addPerp('long', 100000, 20000, 80000);
      Store.openBand('call','put', {inner:120000,outer:140000}, {inner:68000,outer:50000}, 8, 'sold');
      render();
      return { ok:true, bands: Store.state.club?.bands?.length, perps: Store.state.club?.perps?.length };
    } catch(e){ return { ok:false, err:e.message }; }
  })()`);
  await page.waitForTimeout(200);

  // Item 4: open a preview band, change sigma, confirm dotted pro-forma + preview rays re-trace +
  // stepper toggles distinct leg1/leg2. Drive the preview band inputs then click step buttons.
  const previewSetup = await page.evaluate(`(() => {
    try {
      // populate band-builder preview inputs if present, then trigger previewBand
      if (typeof previewBand === 'function') previewBand();
      return { previewBandFn: typeof previewBand, hasStep1: !!document.getElementById('preview-step-1'), hasStep2: !!document.getElementById('preview-step-2') };
    } catch(e){ return { err:e.message }; }
  })()`);
  await page.evaluate(setView('curve')); await page.waitForTimeout(150);
  // step 1 state
  await page.evaluate(`(() => { const b=document.getElementById('preview-step-1'); if(b) b.dispatchEvent(new MouseEvent('click',{bubbles:true})); })()`);
  await page.waitForTimeout(200);
  const step1_pre = await page.evaluate(pixOf('canvas-curve'));
  const step1_state = await page.evaluate(`(() => ({ step: typeof __previewStep!=='undefined'?__previewStep:'n/a', active1: document.getElementById('preview-step-1')?.classList.contains('active'), active2: document.getElementById('preview-step-2')?.classList.contains('active') }))()`);
  // step 2 state
  await page.evaluate(`(() => { const b=document.getElementById('preview-step-2'); if(b) b.dispatchEvent(new MouseEvent('click',{bubbles:true})); })()`);
  await page.waitForTimeout(200);
  const step2_pre = await page.evaluate(pixOf('canvas-curve'));
  const step2_state = await page.evaluate(`(() => ({ step: typeof __previewStep!=='undefined'?__previewStep:'n/a', active1: document.getElementById('preview-step-1')?.classList.contains('active'), active2: document.getElementById('preview-step-2')?.classList.contains('active') }))()`);
  await page.screenshot({ path: path.join(OUT, `p${pass}_fixed_H_step2_before_sigma.png`) }).catch(()=>{});
  // NOW change sigma and confirm pro-forma re-traces on new shape (pixels change, stepper still toggles)
  await page.evaluate(setSigma('0.25')); await page.waitForTimeout(300);
  const step2_postSigma = await page.evaluate(pixOf('canvas-curve'));
  await page.screenshot({ path: path.join(OUT, `p${pass}_fixed_I_step2_after_sigma.png`) }).catch(()=>{});
  // toggle back to step 1 after sigma to confirm stepper still produces a DISTINCT shape
  await page.evaluate(`(() => { const b=document.getElementById('preview-step-1'); if(b) b.dispatchEvent(new MouseEvent('click',{bubbles:true})); })()`);
  await page.waitForTimeout(200);
  const step1_postSigma = await page.evaluate(pixOf('canvas-curve'));
  await page.evaluate(setSigma('0.129')); await page.waitForTimeout(200);
  const item4 = {
    previewSetup,
    step1_state, step2_state,
    stepperTogglesActive: (step1_state.active1 && !step1_state.active2) && (!step2_state.active1 && step2_state.active2),
    step1_vs_step2_distinct: step1_pre.sum !== step2_pre.sum,
    proforma_retraced_on_sigma: step2_postSigma.sum !== step2_pre.sum,
    step1_vs_step2_distinct_postSigma: step1_postSigma.sum !== step2_postSigma.sum,
    sums: { s1:step1_pre.sum, s2:step2_pre.sum, s2post:step2_postSigma.sum, s1post:step1_postSigma.sum }
  };

  // Item 5: under an open band, sigma change redraws curve + portfolio + payoff, no NaN/stale.
  await page.evaluate(setView('curve')); await page.waitForTimeout(120);
  const c_band_pre = await page.evaluate(pixOf('canvas-curve'));
  await page.evaluate(setView('payoff')); await page.waitForTimeout(120);
  const pay_band_pre = await page.evaluate(pixOf('canvas-payoff'));
  // change sigma with band open
  await page.evaluate(setSigma('0.20')); await page.waitForTimeout(300);
  await page.evaluate(setView('curve')); await page.waitForTimeout(120);
  const c_band_post = await page.evaluate(pixOf('canvas-curve'));
  await page.evaluate(setView('payoff')); await page.waitForTimeout(120);
  const pay_band_post = await page.evaluate(pixOf('canvas-payoff'));
  // portfolio table NaN scan
  const pfScan = await page.evaluate(`(() => {
    const t = document.getElementById('bands-table');
    const txt = t ? t.innerText : '';
    return { hasNaN: /NaN/.test(txt), hasInfinity: /Infinity/.test(txt), poolFinite: isFinite(Engine.getMP_raw(Store.state.pool)), ghAh: Store.state.pool.ghAh, rows: t? t.querySelectorAll('tr').length : 0 };
  })()`);
  await page.evaluate(setView('curve')); await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(OUT, `p${pass}_fixed_J_band_open_after_sigma.png`), fullPage: true }).catch(()=>{});
  const item5 = {
    curveRedrew: c_band_post.sum !== c_band_pre.sum,
    payoffRedrew: pay_band_post.sum !== pay_band_pre.sum,
    pfScan,
    sums: { c_pre:c_band_pre.sum, c_post:c_band_post.sum, pay_pre:pay_band_pre.sum, pay_post:pay_band_post.sum }
  };
  await page.evaluate(setSigma('0.129')); await page.waitForTimeout(150);

  // Regression items: lock/unlock, S*, gamma floor, panel renders w/ number steppers
  const panel = await page.evaluate(`(() => {
    const inputs = Array.from(document.querySelectorAll('#vol-knob input')).map(i=>({id:i.id,type:i.type,step:i.step}));
    return { inputs };
  })()`);
  // S* tracks K*g/(g+1)
  const sstar = await page.evaluate(`(() => { const K=Engine.getSNorm(Store.state.pool)*Store.state.oracle; const g=parseFloat(document.getElementById('vk-gamma-out').textContent); return { K, g, expected:K*g/(g+1), out:document.getElementById('vk-sstar-out').textContent }; })()`);
  // lock/unlock
  await page.evaluate(`(() => { const c=document.getElementById('vk-unlock'); c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await page.waitForTimeout(150);
  const unlocked = await page.evaluate(`(() => ({ modeLabel:document.getElementById('vk-mode-label')?.textContent, sigmaDisabled:document.getElementById('vk-sigma')?.disabled, gammaRawDisabled:document.getElementById('vk-gamma-raw')?.disabled }))()`);
  await page.evaluate(`(() => { const c=document.getElementById('vk-unlock'); c.checked=false; c.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await page.waitForTimeout(150);
  const relocked = await page.evaluate(`(() => ({ modeLabel:document.getElementById('vk-mode-label')?.textContent, sigmaDisabled:document.getElementById('vk-sigma')?.disabled }))()`);
  // gamma floor
  await page.evaluate(setSigma('5')); await page.waitForTimeout(150);
  const floor = await page.evaluate(`(() => ({ gammaOut:document.getElementById('vk-gamma-out')?.textContent, note:document.getElementById('vk-note')?.textContent, ghAh:Store.state.pool.ghAh, mpFinite:isFinite(Engine.getMP_raw(Store.state.pool)) }))()`);
  await page.evaluate(setSigma('0.129')); await page.waitForTimeout(150);

  await browser.close();
  return { pass, loadErrs, totalErrs: errs.length, allErrs:[...new Set(errs)],
    item1, item1b, curve0:{nonblank:curve0.nonblank,sum:curve0.sum}, payoff0:{nonblank:payoff0.nonblank},
    canvasInventory, item3, setup, item4, item5, panel, sstar, unlocked, relocked, floor };
}

const r1 = await run(1);
const r2 = await run(2);
console.log(JSON.stringify({ r1, r2 }, null, 2));

// Live-browser READ-ONLY verification of the v26d vol-knob build.
// No engine edits. Drives the real DOM controls, screenshots the canvas,
// and samples the live GH curve via the page's own Engine for numeric proof
// of re-warp. Run: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node pw_v26d_volknob.mjs
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { fileURLToPath } from 'url';
import path from 'path';

const BUILD = '/home/user/Perp-Options-AMM/engine/builds/temporal_mvp_v26d_volknob.html';
const OUT   = '/home/user/Perp-Options-AMM/evidence/v26d_volknob_ui';
const fileUrl = 'file://' + BUILD;

// Sample the SOLID live pool curve (same math the Viz curveTrace uses):
// arbitrageToOracle over a price span around mp0, returns reserve (x,y) points.
function traceExpr() {
  return `(() => {
    const E = Engine, snap = Store.state.pool;
    const mp0 = E.getMP_raw(snap), N = 24, pts = [];
    for (let i=0;i<=N;i++){ const o = mp0*Math.exp(-6+12*i/N);
      const st = E.arbitrageToOracle(snap,o);
      if (st && st.x>0 && st.y>0) pts.push([st.x, st.y]); }
    return { mp0, ghAh: snap.ghAh, ghBh: snap.ghBh, ghDelta: snap.ghDelta,
             ghMu: snap.ghMu, gamma: E.getMP_raw?1:1, pts };
  })()`;
}

function readPanel() {
  return `(() => {
    const t = id => { const e=document.getElementById(id); return e?e.textContent.trim():null; };
    const v = id => { const e=document.getElementById(id); return e?e.value:null; };
    const dis = id => { const e=document.getElementById(id); return e?!!e.disabled:null; };
    const hidden = id => { const e=document.getElementById(id); return e?e.classList.contains('vk-hidden'):null; };
    return {
      modeLabel: t('vk-mode-label'),
      unlockChecked: document.getElementById('vk-unlock')?.checked,
      sigmaVal: v('vk-sigma'), sigmaDisabled: dis('vk-sigma'),
      rateVal: v('vk-rate'), rateDisabled: dis('vk-rate'),
      gammaRawVal: v('vk-gamma-raw'), gammaRawDisabled: dis('vk-gamma-raw'),
      deltaRawVal: v('vk-delta-raw'), deltaRawDisabled: dis('vk-delta-raw'),
      gammaOut: t('vk-gamma-out'), sstarOut: t('vk-sstar-out'),
      sigmaOut: t('vk-sigma-out'), deltaOut: t('vk-delta-out'),
      note: t('vk-note'),
      lockedHidden: hidden('vk-locked-inputs'), unlockedHidden: hidden('vk-unlocked-inputs'),
      sigmaTag: document.getElementById('vk-sigma') ? document.getElementById('vk-sigma').tagName+':'+document.getElementById('vk-sigma').type : null
    };
  })()`;
}

async function setNum(page, id, value) {
  await page.evaluate(({id, value}) => {
    const el = document.getElementById(id);
    el.value = String(value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { id, value });
}

async function run(pass) {
  const errors = [];
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true, args: ['--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const R = { pass, errors, items: {} };

  // ---- ITEM 1: panel renders, steppers + locked fields ----
  const panel0 = await page.evaluate(readPanel);
  const panelShape = await page.evaluate(`(() => {
    const inputs = [...document.querySelectorAll('#vol-knob input')];
    return inputs.map(i => ({ id:i.id, type:i.type, step:i.step }));
  })()`);
  R.items.item1 = { panel0, panelShape };
  await page.locator('#vol-knob').screenshot({ path: path.join(OUT, `p${pass}_01_panel_locked.png`) }).catch(e=>errors.push("shot:"+e.message));

  // ---- ITEM 2 + 3: sigma re-warps curve; gamma + S* read-out track ----
  // baseline at default sigma 0.129
  await page.locator('#chart-select').selectOption('curve').catch(()=>{});
  await page.waitForTimeout(150);
  const traceDefault = await page.evaluate(traceExpr());
  const panelDefault = await page.evaluate(readPanel);
  await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, `p${pass}_02a_curve_sigma0129.png`) }).catch(e=>errors.push("shot:"+e.message));

  // higher sigma -> lower gamma (fatter wings)
  await setNum(page, 'vk-sigma', 0.30);
  await page.waitForTimeout(200);
  const traceHi = await page.evaluate(traceExpr());
  const panelHi = await page.evaluate(readPanel);
  await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, `p${pass}_02b_curve_sigma030_hi.png`) }).catch(e=>errors.push("shot:"+e.message));

  // lower sigma -> higher gamma (steeper)
  await setNum(page, 'vk-sigma', 0.08);
  await page.waitForTimeout(200);
  const traceLo = await page.evaluate(traceExpr());
  const panelLo = await page.evaluate(readPanel);
  await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, `p${pass}_02c_curve_sigma008_lo.png`) }).catch(e=>errors.push("shot:"+e.message));

  // S* check at default again
  await setNum(page, 'vk-sigma', 0.129);
  await page.waitForTimeout(200);
  const panelBack = await page.evaluate(readPanel);
  // compute expected S* from gamma readout + active strike
  const sstarCheck = await page.evaluate(`(() => {
    const K = Engine.getSNorm(Store.state.pool) * Store.state.oracle;
    const g = parseFloat(document.getElementById('vk-gamma-out').textContent);
    return { K, g, expected: K*g/(g+1), out: document.getElementById('vk-sstar-out').textContent };
  })()`);

  // curve-change metric: max relative shift of sampled reserve points
  const shiftMetric = (a, b) => {
    let maxRel = 0;
    const n = Math.min(a.pts.length, b.pts.length);
    for (let i = 0; i < n; i++) {
      const dx = Math.abs(a.pts[i][0] - b.pts[i][0]) / (Math.abs(a.pts[i][0]) + 1e-9);
      const dy = Math.abs(a.pts[i][1] - b.pts[i][1]) / (Math.abs(a.pts[i][1]) + 1e-9);
      maxRel = Math.max(maxRel, dx, dy);
    }
    return maxRel;
  };
  R.items.item2 = {
    panelDefault: { gammaOut: panelDefault.gammaOut, sstar: panelDefault.sstarOut },
    panelHi: { sigma: panelHi.sigmaVal, gammaOut: panelHi.gammaOut, sstar: panelHi.sstarOut },
    panelLo: { sigma: panelLo.sigmaVal, gammaOut: panelLo.gammaOut, sstar: panelLo.sstarOut },
    ghAh_default: traceDefault.ghAh, ghAh_hi: traceHi.ghAh, ghAh_lo: traceLo.ghAh,
    shift_default_vs_hi: shiftMetric(traceDefault, traceHi),
    shift_default_vs_lo: shiftMetric(traceDefault, traceLo)
  };
  R.items.item3 = sstarCheck;

  // ---- ITEM 4 + 5: open a band, then sigma change re-traces pro-forma + stepper ----
  // add a perp to the long club so a band can open
  await page.evaluate(`(() => {
    Store.addPerp('long', 5, 50000, Store.state.oracle);  // side, notional, margin, entryMark
  })()`).catch(e=>errors.push('addPerp: '+e));
  await page.waitForTimeout(100);

  // navigate to transact / fill band inputs via real DOM, set club, trigger preview
  // sold call 120000 (OTM at oracle), bought put 68000 (OTM); oracle default
  const bandSetup = await page.evaluate(`(() => {
    const oracle = Store.state.oracle;
    // direction sell = call: default dir pill is sell/long->call per readBand
    const set = (id,val) => { const e=document.getElementById(id); if(e){ e.value=String(val); e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); } };
    return { oracle };
  })()`);
  // Find and fill the band strike + notional inputs. Use openBand engine path
  // to guarantee a preview band exists, then drive previewBand() through UI render.
  const openRes = await page.evaluate(`(() => {
    try {
      // set the band form inputs so previewBand() (re-run by render) recomputes
      window.__previewStep = 2;
      const r = Store.openBand('call','put',{inner:120000,outer:140000},{inner:68000,outer:50000},2,'long');
      return { ok: !!r, id: r && r.id };
    } catch(e){ return { ok:false, err: e.message }; }
  })()`);
  R.items.item4_openBand = openRes;
  await page.waitForTimeout(150);

  // go to the curve view, ensure a previewBand preview is set by calling previewBand via render
  // Drive the actual preview: navigate to transact subtab where previewBand runs, then curve.
  await page.evaluate(`(() => { if (typeof previewBand === 'function') previewBand(); })()`).catch(()=>{});
  await page.waitForTimeout(150);
  await page.locator('#chart-select').selectOption('curve').catch(()=>{});
  await page.waitForTimeout(150);

  const preview0 = await page.evaluate(`(() => {
    const pb = window.__previewBand;
    return pb ? { has: true, step: window.__previewStep,
      leg1_theta: pb.leg1_theta_star, leg2_theta: pb.leg2_theta_star,
      leg1x: pb.leg1State&&pb.leg1State.x, leg2x: pb.leg2State&&pb.leg2State.x,
      leg1ghAh: pb.leg1State&&pb.leg1State.ghAh, leg2ghAh: pb.leg2State&&pb.leg2State.ghAh,
      poolx: window.__previewPool&&window.__previewPool.x } : { has:false };
  })()`);
  await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, `p${pass}_04a_proforma_sigma0129.png`) }).catch(e=>errors.push("shot:"+e.message));

  // NOW change sigma with an OPEN band -> apply()->setShape->render()->previewBand re-runs
  await setNum(page, 'vk-sigma', 0.22);
  await page.waitForTimeout(250);
  const preview1 = await page.evaluate(`(() => {
    const pb = window.__previewBand;
    return pb ? { has: true, step: window.__previewStep,
      leg1_theta: pb.leg1_theta_star, leg2_theta: pb.leg2_theta_star,
      leg1x: pb.leg1State&&pb.leg1State.x, leg2x: pb.leg2State&&pb.leg2State.x,
      leg1ghAh: pb.leg1State&&pb.leg1State.ghAh, leg2ghAh: pb.leg2State&&pb.leg2State.ghAh,
      poolx: window.__previewPool&&window.__previewPool.x } : { has:false };
  })()`);
  await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, `p${pass}_04b_proforma_sigma022_rewarp.png`) }).catch(e=>errors.push("shot:"+e.message));
  const traceWithBand = await page.evaluate(traceExpr());

  // stepper 1<->2 still works (distinct leg states) after the sigma change
  const stepRes = await page.evaluate(`(() => {
    const out = {};
    const click = id => { const b=document.getElementById(id); if(b){ b.disabled=false; b.click(); } return !!b; };
    out.b1exists = click('preview-step-1');
    out.step1 = window.__previewStep; out.pool1x = window.__previewPool&&window.__previewPool.x;
    out.b2exists = click('preview-step-2');
    out.step2 = window.__previewStep; out.pool2x = window.__previewPool&&window.__previewPool.x;
    out.distinct = out.pool1x !== out.pool2x;
    return out;
  })()`);
  await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, `p${pass}_04c_stepper_after_rewarp.png`) }).catch(e=>errors.push("shot:"+e.message));

  R.items.item4 = { preview0, preview1, stepRes,
    leg1theta_changed: preview0.leg1_theta !== preview1.leg1_theta,
    leg1ghAh_changed: preview0.leg1ghAh !== preview1.leg1ghAh };

  // ITEM 5: portfolio + payoff redraw consistent / no NaN
  // check portfolio table marks finite after rewarp
  const consistency = await page.evaluate(`(() => {
    const pool = Store.state.pool;
    const finite = ['ghAh','ghBh','ghDelta','ghMu','ghNx','ghNy','ghP'].every(k=>isFinite(pool[k]));
    const mp = Engine.getMP_raw(pool);
    return { poolFinite: finite, mp_finite: isFinite(mp), mp };
  })()`);
  // payoff screenshot
  await page.locator('#chart-select').selectOption('payoff').catch(()=>{});
  await page.waitForTimeout(200);
  await page.locator('#canvas-payoff').screenshot({ path: path.join(OUT, `p${pass}_05_payoff_after_rewarp.png`) }).catch(()=>{});
  // portfolio table
  await page.locator('[data-page="portfolio"]').click().catch(()=>{});
  await page.waitForTimeout(150);
  const pfNaN = await page.evaluate(`(() => {
    const cells = [...document.querySelectorAll('#bands-table td, #pf-perps td')].map(c=>c.textContent);
    const nanCells = cells.filter(t => /NaN|undefined|Infinity/i.test(t));
    return { totalCells: cells.length, nanCells };
  })()`);
  await page.screenshot({ path: path.join(OUT, `p${pass}_05b_portfolio_after_rewarp.png`), fullPage: true }).catch(()=>{});
  R.items.item5 = { consistency, pfNaN };

  // back to dashboard for remaining panel tests
  await page.locator('[data-page="dashboard"]').click().catch(()=>{});
  await page.waitForTimeout(150);
  await page.locator('#chart-select').selectOption('curve').catch(()=>{});
  await page.waitForTimeout(150);

  // ---- ITEM 6: lock/unlock toggle ----
  const lockedBefore = await page.evaluate(readPanel);
  await page.evaluate(`(() => { const c=document.getElementById('vk-unlock'); c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await page.waitForTimeout(200);
  const unlockedState = await page.evaluate(readPanel);
  await page.locator('#vol-knob').screenshot({ path: path.join(OUT, `p${pass}_06a_panel_unlocked.png`) }).catch(e=>errors.push("shot:"+e.message));
  // edit raw gamma in unlocked mode
  await setNum(page, 'vk-gamma-raw', 3.0);
  await page.waitForTimeout(200);
  const unlockedAfterEdit = await page.evaluate(readPanel);
  const traceUnlockedG3 = await page.evaluate(traceExpr());
  await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, `p${pass}_06b_curve_unlocked_g3.png`) }).catch(e=>errors.push("shot:"+e.message));
  // restore lock
  await page.evaluate(`(() => { const c=document.getElementById('vk-unlock'); c.checked=false; c.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await page.waitForTimeout(200);
  const relocked = await page.evaluate(readPanel);
  R.items.item6 = { lockedBefore: { sigmaDisabled: lockedBefore.sigmaDisabled, unlockedHidden: lockedBefore.unlockedHidden, gammaRawDisabled: lockedBefore.gammaRawDisabled },
    unlockedState: { sigmaDisabled: unlockedState.sigmaDisabled, unlockedHidden: unlockedState.unlockedHidden, gammaRawDisabled: unlockedState.gammaRawDisabled, modeLabel: unlockedState.modeLabel, sigmaOutShown: unlockedState.sigmaOut },
    unlockedAfterEdit: { gammaRawVal: unlockedAfterEdit.gammaRawVal, gammaOut: unlockedAfterEdit.gammaOut, sigmaOut: unlockedAfterEdit.sigmaOut },
    relocked: { sigmaDisabled: relocked.sigmaDisabled, unlockedHidden: relocked.unlockedHidden, modeLabel: relocked.modeLabel } };

  // ---- ITEM 7: gamma>1 hard floor ----
  // huge sigma -> gamma would drop <=1 -> clamp to ~1.0001 with note
  await setNum(page, 'vk-sigma', 5.0);
  await page.waitForTimeout(250);
  const floorState = await page.evaluate(readPanel);
  const floorPool = await page.evaluate(`(() => {
    const p = Store.state.pool;
    return { ghAh: p.ghAh, mp: Engine.getMP_raw(p), mpFinite: isFinite(Engine.getMP_raw(p)) };
  })()`);
  await page.locator('#vol-knob').screenshot({ path: path.join(OUT, `p${pass}_07_gamma_floor.png`) }).catch(e=>errors.push("shot:"+e.message));
  R.items.item7 = { gammaOut: floorState.gammaOut, note: floorState.note, floorPool };

  // restore default sigma
  await setNum(page, 'vk-sigma', 0.129);
  await page.waitForTimeout(150);

  await browser.close();
  R.errors = errors;
  return R;
}

const out1 = await run(1);
const out2 = await run(2);
console.log(JSON.stringify({ run1: out1, run2: out2 }, null, 2));

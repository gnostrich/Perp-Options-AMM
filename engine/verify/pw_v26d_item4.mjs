// Item 4 (was INCONCLUSIVE): REAL band preview -> dotted pro-forma + stepper re-trace after sigma.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import path from 'path';
const BUILD = '/home/user/Perp-Options-AMM/engine/builds/temporal_mvp_v26d_volknob.html';
const OUT = '/home/user/Perp-Options-AMM/evidence/v26d_volknob_ui';
const pixOf = (id) => `(() => { const cv=document.getElementById('${id}'); const ctx=cv.getContext('2d'); const d=ctx.getImageData(0,0,cv.width,cv.height).data; let nb=0,sum=0; for(let i=0;i<d.length;i+=4){ if(d[i]||d[i+1]||d[i+2]){nb++;} sum+=d[i]+d[i+1]+d[i+2]; } return { nonblank:nb, sum }; })()`;
const setIn = (id,v) => `(() => { const e=document.getElementById('${id}'); e.value='${v}'; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); })()`;
const click = (id) => `(() => { const b=document.getElementById('${id}'); if(b) b.dispatchEvent(new MouseEvent('click',{bubbles:true})); })()`;
const setSigma = (v) => setIn('vk-sigma', v);

async function run(pass) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type()==='error') errs.push('console:'+m.text()); });
  await page.goto('file://' + BUILD, { waitUntil: 'load' });
  await page.waitForTimeout(600);

  // Add a long perp so the 'long' club has notional (Store IS reachable in evaluate).
  const added = await page.evaluate(`(() => { try { Store.addPerp('long', 100000, 20000, 80000); return { ok:true, longNotional: Store.state.clubs.long?.totalNotional }; } catch(e){ return { ok:false, err:e.message }; } })()`);
  await page.waitForTimeout(150);

  // Fill the REAL band-builder inputs (long: sells call upside, buys put protection).
  await page.evaluate(setIn('band-notional', '1'));
  await page.evaluate(setIn('sold-inner', '120000'));
  await page.evaluate(setIn('sold-outer', '140000'));
  await page.evaluate(setIn('bought-inner', '68000'));
  await page.evaluate(setIn('bought-outer', '50000'));   // last input fires previewBand via bound listener
  await page.waitForTimeout(300);

  // Confirm a real preview band is live
  const pv = await page.evaluate(`(() => { const pb=window.__previewBand; const ro=id=>document.getElementById(id)?.textContent; return { hasPreviewBand: !!pb, hasLeg1State: !!(pb&&pb.leg1State), soldTheta: ro('pv-sold-theta'), boughtTheta: ro('pv-bought-theta'), soldMark: ro('pv-sold-mark'), warn: ro('band-warn')||ro('band-warning'), step1disabled: document.getElementById('preview-step-1')?.disabled, step2disabled: document.getElementById('preview-step-2')?.disabled }; })()`);

  // ensure curve view
  await page.evaluate(`(() => { const e=document.getElementById('chart-select'); e.value='curve'; e.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await page.waitForTimeout(150);

  // Stepper: step1 vs step2 distinct dotted pro-forma (BEFORE sigma change)
  await page.evaluate(click('preview-step-1')); await page.waitForTimeout(200);
  const s1_pre = await page.evaluate(pixOf('canvas-curve'));
  const st1 = await page.evaluate(`(() => ({ step: window.__previewStep, a1: document.getElementById('preview-step-1')?.classList.contains('active'), a2: document.getElementById('preview-step-2')?.classList.contains('active'), pool: window.__previewPool? {x:window.__previewPool.x, w:window.__previewPool.w} : null }))()`);
  await page.screenshot({ path: path.join(OUT, `p${pass}_fixed_K_step1_proforma.png`) }).catch(()=>{});
  await page.evaluate(click('preview-step-2')); await page.waitForTimeout(200);
  const s2_pre = await page.evaluate(pixOf('canvas-curve'));
  const st2 = await page.evaluate(`(() => ({ step: window.__previewStep, a1: document.getElementById('preview-step-1')?.classList.contains('active'), a2: document.getElementById('preview-step-2')?.classList.contains('active'), pool: window.__previewPool? {x:window.__previewPool.x, w:window.__previewPool.w} : null }))()`);
  await page.screenshot({ path: path.join(OUT, `p${pass}_fixed_L_step2_proforma.png`) }).catch(()=>{});

  // CHANGE SIGMA -> pro-forma must re-trace on the new GH shape (re-run previewBand via vk listener path)
  const ghBefore = await page.evaluate(`(() => Store.state.pool.ghAh)()`);
  await page.evaluate(setSigma('0.25')); await page.waitForTimeout(350);
  const ghAfter = await page.evaluate(`(() => Store.state.pool.ghAh)()`);
  const s2_postSigma = await page.evaluate(pixOf('canvas-curve'));
  // pro-forma still present after sigma change?
  const pvPost = await page.evaluate(`(() => { const pb=window.__previewBand; const ro=id=>document.getElementById(id)?.textContent; return { hasPreviewBand: !!pb, soldTheta: ro('pv-sold-theta'), boughtTheta: ro('pv-bought-theta') }; })()`);
  await page.screenshot({ path: path.join(OUT, `p${pass}_fixed_M_step2_after_sigma.png`) }).catch(()=>{});
  // stepper still toggles distinct AFTER sigma
  await page.evaluate(click('preview-step-1')); await page.waitForTimeout(200);
  const s1_post = await page.evaluate(pixOf('canvas-curve'));
  await page.screenshot({ path: path.join(OUT, `p${pass}_fixed_N_step1_after_sigma.png`) }).catch(()=>{});

  await browser.close();
  return { pass, added, pv, st1, st2,
    stepperDistinct_pre: s1_pre.sum !== s2_pre.sum,
    proforma_present_pre: pv.hasPreviewBand && pv.hasLeg1State,
    ghChangedOnSigma: ghBefore !== ghAfter, ghBefore, ghAfter,
    proforma_retraced_postSigma: s2_postSigma.sum !== s2_pre.sum,
    proforma_present_postSigma: pvPost.hasPreviewBand,
    stepperDistinct_postSigma: s1_post.sum !== s2_postSigma.sum,
    sums: { s1_pre:s1_pre.sum, s2_pre:s2_pre.sum, s2_post:s2_postSigma.sum, s1_post:s1_post.sum },
    pvPost, errs:[...new Set(errs)] };
}
const r1 = await run(1);
const r2 = await run(2);
console.log(JSON.stringify({ r1, r2 }, null, 2));

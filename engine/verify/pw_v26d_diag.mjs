// Focused diagnostic: load-order Viz error, Viz availability, canvas pixels.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const BUILD = '/home/user/Perp-Options-AMM/engine/builds/temporal_mvp_v26d_volknob.html';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  headless: true, args: ['--no-sandbox']
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type()==='error') errs.push('console:'+m.text()); });

await page.goto('file://' + BUILD, { waitUntil: 'load' });
await page.waitForTimeout(600);

const loadErrs = errs.slice();

// Is Viz defined after load? Is render reachable? Did the chart-select listener bind?
const state = await page.evaluate(`(() => {
  let vizType, vizHasDrawAll, renderType, chartSelHasListener=false;
  try { vizType = typeof Viz; } catch(e){ vizType = 'THROWS:'+e.message; }
  try { vizHasDrawAll = (typeof Viz!=='undefined') && typeof Viz.drawAll==='function'; } catch(e){ vizHasDrawAll='THROWS:'+e.message; }
  try { renderType = typeof render; } catch(e){ renderType='THROWS:'+e.message; }
  // panel readouts present?
  const ro = id => document.getElementById(id)?.textContent;
  return { vizType, vizHasDrawAll, renderType,
    gammaOut: ro('vk-gamma-out'), sstarOut: ro('vk-sstar-out'), sigmaOut: ro('vk-sigma-out'),
    hdrSpot: ro('hdr-pool-spot') };
})()`);

// canvas pixel non-blank check (curve)
await page.evaluate(`(() => { const e=document.getElementById('chart-select'); if(e){ e.value='curve'; e.dispatchEvent(new Event('change',{bubbles:true})); } })()`);
await page.waitForTimeout(300);
const beforeNudgeErrs = errs.length;
const pix0 = await page.evaluate(`(() => {
  const cv = document.getElementById('canvas-curve');
  const ctx = cv.getContext('2d');
  const d = ctx.getImageData(0,0,cv.width,cv.height).data;
  let nonblank=0; for(let i=0;i<d.length;i+=4){ if(d[i]||d[i+1]||d[i+2]) nonblank++; }
  return { nonblank, total: d.length/4 };
})()`);

// now nudge sigma and see if canvas redraws (pixel signature changes) and error fires again
const errsBeforeSigma = errs.length;
await page.evaluate(`(() => { const e=document.getElementById('vk-sigma'); e.value='0.30'; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); })()`);
await page.waitForTimeout(300);
const errsAfterSigma = errs.length;
const pix1 = await page.evaluate(`(() => {
  const cv = document.getElementById('canvas-curve');
  const ctx = cv.getContext('2d');
  const d = ctx.getImageData(0,0,cv.width,cv.height).data;
  let nonblank=0,sum=0; for(let i=0;i<d.length;i+=4){ if(d[i]||d[i+1]||d[i+2]) nonblank++; sum+=d[i]+d[i+1]+d[i+2]; }
  return { nonblank, sum };
})()`);

console.log(JSON.stringify({
  loadErrCount: loadErrs.length,
  loadErrsUnique: [...new Set(loadErrs)],
  state, pix0,
  sigmaChange_firedNewError: errsAfterSigma > errsBeforeSigma,
  sigmaChange_newErrs: errs.slice(errsBeforeSigma),
  pix1_nonblank: pix1.nonblank, pix1_sum: pix1.sum,
  totalErrs: errs.length
}, null, 2));
await browser.close();

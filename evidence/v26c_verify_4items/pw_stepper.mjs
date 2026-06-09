import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { pathToFileURL } from 'url';
import path from 'path';
const HEAD = path.resolve('builds/HEAD_temporal_mvp_v26c.html');
const browser = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto(pathToFileURL(HEAD).href, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

const r = await page.evaluate(() => {
  const oraEl = document.getElementById('kpi-oracle');
  oraEl.value = '80000'; oraEl.dispatchEvent(new Event('change', { bubbles: true }));
  Store.addPerp('long', 1.0, 50000, 80000);
  const set = (id,v)=>{const e=document.getElementById(id);e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));};
  set('band-notional','0.1'); set('sold-inner','120000'); set('sold-outer','140000');
  set('bought-inner','68000'); set('bought-outer','50000');
  const pb = window.__previewBand;
  if (!pb || !pb.leg1State) return { hasPreview:false, pbNull: !pb };
  const wOf = s => Engine.getW(s);
  const l1=pb.leg1State, l2=pb.leg2State;

  // click the actual stepper buttons (dispatch click — they use addEventListener)
  const b1 = document.getElementById('preview-step-1');
  const b2 = document.getElementById('preview-step-2');
  b1.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const afterStep1 = { previewStep: window.__previewStep,
    poolIsLeg1: window.__previewPool===l1, w: wOf(window.__previewPool),
    b1active: b1.classList.contains('active') };
  b2.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const afterStep2 = { previewStep: window.__previewStep,
    poolIsLeg2: window.__previewPool===l2, w: wOf(window.__previewPool),
    b2active: b2.classList.contains('active') };

  return { hasPreview:true,
    statesDistinct: (l1.x!==l2.x||l1.y!==l2.y),
    leg1:{x:l1.x,y:l1.y,w:wOf(l1)}, leg2:{x:l2.x,y:l2.y,w:wOf(l2)},
    wDistinct: wOf(l1)!==wOf(l2),
    leg1_theta_star: pb.leg1_theta_star, leg2_theta_star: pb.leg2_theta_star,
    b1disabled: b1.disabled, b2disabled: b2.disabled,
    afterStep1, afterStep2,
    poolChangedAcrossSteps: afterStep1.w !== afterStep2.w };
});
await browser.close();
console.log(JSON.stringify(r,null,2));
console.log('ERRORS', JSON.stringify(errs.slice(0,5)));

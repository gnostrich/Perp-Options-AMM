// Evidence screenshots for the v26d vol-knob finding + working read-outs.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import path from 'path';
const BUILD = '/home/user/Perp-Options-AMM/engine/builds/temporal_mvp_v26d_volknob.html';
const OUT = '/home/user/Perp-Options-AMM/evidence/v26d_volknob_ui';

async function run(pass) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + BUILD, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // full dashboard (curve view)
  await page.screenshot({ path: path.join(OUT, `p${pass}_A_dashboard_full.png`), fullPage: true }).catch(()=>{});
  // panel only (read-outs work)
  await page.locator('#vol-knob').screenshot({ path: path.join(OUT, `p${pass}_B_panel_locked_readouts.png`) }).catch(()=>{});

  // unlock -> raw gamma/delta editable; sigma derived
  await page.evaluate(`(() => { const c=document.getElementById('vk-unlock'); c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await page.waitForTimeout(300);
  const unlocked = await page.evaluate(`(() => {
    const dis=id=>document.getElementById(id)?.disabled;
    const hid=id=>document.getElementById(id)?.classList.contains('vk-hidden');
    const ro=id=>document.getElementById(id)?.textContent;
    const vis=id=>{const e=document.getElementById(id); return e?getComputedStyle(e).display:null;};
    return { modeLabel:ro('vk-mode-label'), sigmaDisabled:dis('vk-sigma'), gammaRawDisabled:dis('vk-gamma-raw'),
      deltaRawDisabled:dis('vk-delta-raw'), unlockedHidden:hid('vk-unlocked-inputs'),
      sigmaDerWrapDisplay: vis('vk-sigma-derived-wrap'), sigmaOut:ro('vk-sigma-out'), gammaOut:ro('vk-gamma-out') };
  })()`);
  await page.locator('#vol-knob').screenshot({ path: path.join(OUT, `p${pass}_C_panel_unlocked.png`) }).catch(()=>{});

  // edit raw gamma 2 -> 3 in unlocked
  await page.evaluate(`(() => { const e=document.getElementById('vk-gamma-raw'); e.value='3'; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await page.waitForTimeout(200);
  const g3 = await page.evaluate(`(() => ({ gammaOut:document.getElementById('vk-gamma-out')?.textContent, sigmaOut:document.getElementById('vk-sigma-out')?.textContent, ghAh:Store.state.pool.ghAh }))()`);

  // re-lock
  await page.evaluate(`(() => { const c=document.getElementById('vk-unlock'); c.checked=false; c.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await page.waitForTimeout(200);
  const relocked = await page.evaluate(`(() => ({ modeLabel:document.getElementById('vk-mode-label')?.textContent, sigmaDisabled:document.getElementById('vk-sigma')?.disabled, unlockedHidden:document.getElementById('vk-unlocked-inputs')?.classList.contains('vk-hidden') }))()`);

  // gamma floor: huge sigma
  await page.evaluate(`(() => { const e=document.getElementById('vk-sigma'); e.value='5'; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await page.waitForTimeout(200);
  const floor = await page.evaluate(`(() => ({ gammaOut:document.getElementById('vk-gamma-out')?.textContent, note:document.getElementById('vk-note')?.textContent, ghAh:Store.state.pool.ghAh, mpFinite:isFinite(Engine.getMP_raw(Store.state.pool)) }))()`);
  await page.locator('#vol-knob').screenshot({ path: path.join(OUT, `p${pass}_D_gamma_floor.png`) }).catch(()=>{});

  // S* check at default
  await page.evaluate(`(() => { const e=document.getElementById('vk-sigma'); e.value='0.129'; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await page.waitForTimeout(200);
  const sstar = await page.evaluate(`(() => { const K=Engine.getSNorm(Store.state.pool)*Store.state.oracle; const g=parseFloat(document.getElementById('vk-gamma-out').textContent); return { K,g,expected:K*g/(g+1), out:document.getElementById('vk-sstar-out').textContent }; })()`);

  // canvas blank confirm
  const pix = await page.evaluate(`(() => { const cv=document.getElementById('canvas-curve'); const ctx=cv.getContext('2d'); const d=ctx.getImageData(0,0,cv.width,cv.height).data; let nb=0; for(let i=0;i<d.length;i+=4){ if(d[i]||d[i+1]||d[i+2]) nb++; } return { nonblank:nb }; })()`);
  await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, `p${pass}_E_canvas_curve_BLANK.png`) }).catch(()=>{});

  await browser.close();
  return { pass, errCount: errs.length, errsUnique:[...new Set(errs)], unlocked, g3, relocked, floor, sstar, canvasNonblank: pix.nonblank };
}
const r1 = await run(1);
const r2 = await run(2);
console.log(JSON.stringify({ r1, r2 }, null, 2));

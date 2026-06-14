
import { chromium } from 'playwright';
import path from 'path';
const ROOT = path.resolve(process.cwd(), '..');
const BUILD = path.join(ROOT, 'engine/builds/temporal_mvp_v28_lens_warp.html');
const OUT = path.join(ROOT, 'evidence/v28_lens_warp');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1500,height:1000}, deviceScaleFactor:2 });
  const page = await ctx.newPage();
  page.on('dialog', d=>d.accept());
  await page.goto('file://'+BUILD, { waitUntil:'networkidle' });
  await page.waitForTimeout(500);
  const sub = async(n)=>{ await page.click('.page-nav-link[data-page="transact"]'); await page.click(`.tab[data-subtab="${n}"]`); await page.waitForTimeout(120); };
  await sub('settings'); await page.selectOption('#chart-select','pricing'); await page.waitForTimeout(120);
  await sub('bands');
  await page.fill('#band-notional','2'); await page.fill('#sold-inner','120000'); await page.fill('#bought-inner','50000');
  await page.dispatchEvent('#sold-inner','input'); await page.dispatchEvent('#bought-inner','input'); await page.dispatchEvent('#band-notional','input');
  await page.waitForTimeout(200);
  await page.evaluate(()=>{ if(typeof setPreviewStep==='function') setPreviewStep(1); });
  await page.waitForTimeout(200);
  const cv = await page.$('#canvas-pricing');
  await cv.screenshot({ path: path.join(OUT,'ZOOM_pricing_step1.png') });
  // also draw a high-contrast analytic overlay of live vs preview psi to a 2nd canvas-free render
  const data = await page.evaluate(()=>{
    const s=Store.state, pp=window.__previewPool, tau=s.tau;
    const heldMode=(()=>{const w=Engine.getW(s.pool);return (1-w)/w;})();
    const psi=(pool,theta,wing)=>{ const g=Engine.gLoc(pool,theta,tau); if(!isFinite(g)||g<=0) return Math.min(1, wing==='call'?heldMode/theta:theta/heldMode); const v=Engine.markLensed(wing,theta,heldMode,g); return (isFinite(v)&&v>=0)?Math.min(1,v):0; };
    const out=[];
    for(let phi=2;phi<=88;phi+=2){ const theta=Math.tan(phi*Math.PI/180); const wing= theta>=heldMode?'call':'put'; out.push({phi, theta:+theta.toFixed(3), live:+psi(s.pool,theta,wing).toFixed(4), prev:+psi(pp,theta,wing).toFixed(4)}); }
    return out;
  });
  console.log(JSON.stringify(data));
  await b.close();
})();

// Focused: does the kurtosis knob / warp show in the "Mark Across Strikes" pricing view?
// (The Pool Curve (x,y) view was found visually illegible at the default geometry.)
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD  = path.join(ENGINE, 'builds', 'temporal_mvp_v27_wkurtosis_WIP.html');
const EVID   = path.resolve(ENGINE, '..', 'evidence', 'v27_pw');
const out = (n) => path.join(EVID, n);

async function prof(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid); if (!cv) return null;
    const d = cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
    const W=cv.width,H=cv.height; let lit=0; const colTop=new Array(W).fill(-1);
    for (let x=0;x<W;x++) for (let y=0;y<H;y++){const i=(y*W+x)*4; if(d[i]+d[i+1]+d[i+2]>180&&d[i+3]>40){if(colTop[x]<0)colTop[x]=y;lit++;}}
    return {W,H,lit,colTop};
  }, id);
}
async function setWings(page,wm,wp){await page.evaluate(([wm,wp])=>{const m=document.getElementById('wminus-input');m.value=String(wm);m.dispatchEvent(new Event('change',{bubbles:true}));const p=document.getElementById('wplus-input');p.value=String(wp);p.dispatchEvent(new Event('change',{bubbles:true}));},[wm,wp]);await page.waitForTimeout(250);}
async function setTau(page,t){await page.evaluate((t)=>{const e=document.getElementById('tau-input');e.value=String(t);e.dispatchEvent(new Event('input',{bubbles:true}));},t);await page.waitForTimeout(350);}

(async () => {
  const errs=[];
  const browser=await chromium.launch();
  const page=await browser.newPage();
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  page.on('pageerror',e=>errs.push('PE:'+e.message));
  await page.goto('file://'+BUILD,{waitUntil:'networkidle'});
  await page.waitForTimeout(500);
  const trace={};
  await setWings(page,0.60,0.85);
  await page.selectOption('#chart-select','pricing');
  await page.waitForTimeout(300);

  await setTau(page,0.10);
  await page.screenshot({path:out('20_pricing_tau_low.png')});
  const pLow=await prof(page,'canvas-pricing');
  await setTau(page,2.50);
  await page.screenshot({path:out('21_pricing_tau_high.png')});
  const pHigh=await prof(page,'canvas-pricing');
  if(pLow&&pHigh){
    const W=pLow.W;
    const band=(a,b)=>{let diff=0,n=0;for(let x=a;x<b;x++)if(pLow.colTop[x]>=0&&pHigh.colTop[x]>=0){diff+=Math.abs(pLow.colTop[x]-pHigh.colTop[x]);n++;}return n?+(diff/n).toFixed(2):null;};
    trace.pricingPeakDiff=band(Math.floor(W*0.30),Math.ceil(W*0.55));
    trace.pricingWingDiff=band(Math.floor(W*0.70),Math.ceil(W*0.95));
  }
  await setTau(page,0.30);

  // warp on the pricing view: pre/post a real in-band trade
  await page.screenshot({path:out('22_pricing_pre_trade.png')});
  const prePr=await prof(page,'canvas-pricing');
  trace.warp=await page.evaluate(()=>{
    const before={...Store.state.pool}; const wB=Engine.wField(before); const b=before.y*(1-wB);
    const dy=b/(1-0.72)-before.y; const post=Engine.tradeUpdate(before,dy);
    if(!post||post.rejected)return{rejected:true};
    Store.state.pool=post;
    if(typeof render==='function')render();
    if(typeof Viz!=='undefined'&&Viz)Viz.drawAll(Store.state,null);
    return{phi:post.phi,w:Engine.wField(post),x:post.x,y:post.y};
  });
  await page.waitForTimeout(350);
  await page.screenshot({path:out('23_pricing_post_trade.png')});
  const postPr=await prof(page,'canvas-pricing');
  if(prePr&&postPr){
    const W=prePr.W;
    const band=(a,b)=>{let diff=0,n=0;for(let x=a;x<b;x++)if(prePr.colTop[x]>=0&&postPr.colTop[x]>=0){diff+=Math.abs(prePr.colTop[x]-postPr.colTop[x]);n++;}return n?+(diff/n).toFixed(2):null;};
    trace.warpPricingDiff=band(0,W);
    trace.warpPeakDiff=band(Math.floor(W*0.25),Math.ceil(W*0.60));
  }
  trace.errs=errs;
  fs.writeFileSync(out('trace_pricing.json'),JSON.stringify(trace,null,2));
  console.log(JSON.stringify(trace,null,2));
  await browser.close();
})();
